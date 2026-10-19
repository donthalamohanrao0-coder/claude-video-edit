import json, sys, subprocess, os
import numpy as np, soundfile as sf
# usage: python3 mix_sfx.py <sfx-plan.json> <sfx dir> <voice.wav> <out.wav> [--print] [--no-optional]
# Lays SFX on the master timeline under a light voice duck, then sets final loudness with one linear gain + peak limiter.
# (loudnorm's dynamic fallback squashes SFX transients, so it is only used to measure.)
plan_f, sfx_dir, voice_f, out_f = sys.argv[1:5]
plan = json.load(open(plan_f)); cat = json.load(open(f"{sfx_dir}/catalog.json"))
evs = [e for e in plan["events"] if not ("--no-optional" in sys.argv and e.get("optional"))]
if "--print" in sys.argv:
    for e in evs: print(f'{e["at_s"]:8.2f}  {e["sfx_id"]:<12} {e["gain_db"]:+4d} dB  {e["cue"]}{"  (optional)" if e.get("optional") else ""}')
    sys.exit()
SR = 48000
T = plan["target_lufs"]

def ff(inputs, graph, out):
    args = ["ffmpeg", "-y", "-hide_banner", "-nostats"]
    for i in inputs: args += ["-i", i]
    r = subprocess.run(args + ["-filter_complex", graph, "-map", "[o]", *out], capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2000:]); sys.exit(1)
    return r.stderr
def lufs(inputs, graph):
    e = ff(inputs, graph + ";[m]loudnorm=print_format=json[o]", ["-f", "null", "-"])
    return float(json.loads(e[e.rindex("{"):e.rindex("}") + 1])["input_i"])

# voice to just under target so SFX gains are relative to a fixed voice level
vg = (T - 0.5) - lufs([voice_f], "[0:a]anull[m]")
bus = np.zeros((int(plan["total_s"] * SR) + SR * 3, 2), np.float32)
for e in evs:
    x, sr = sf.read(f'{sfx_dir}/{cat[e["sfx_id"]]["file"]}', dtype="float32"); assert sr == SR
    s = int(e["at_s"] * SR); bus[s:s + len(x)] += x * 10 ** (e["gain_db"] / 20)
bus = bus[:int(plan["total_s"] * SR)]
tmp = os.path.join(os.path.dirname(os.path.abspath(out_f)), "sfxbus.wav"); sf.write(tmp, bus, SR, subtype="FLOAT")
duck = "[s][vs]sidechaincompress=threshold=0.1:ratio=1.5:attack=20:release=200[sd];" if plan.get("duck") else "[s]anull[sd];"
mixg = (f"[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,volume={vg:.2f}dB,apad=whole_dur={plan['total_s']}[v];[v]asplit[vm][vs];"
        f"[1:a]anull[s];{duck}[vm][sd]amix=inputs=2:normalize=0[m]")
fg = T - lufs([voice_f, tmp], mixg)
ff([voice_f, tmp], mixg.replace("[m]", "[mm]") + f";[mm]volume={fg:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=0,aresample=48000[o]",
   ["-c:a", "pcm_s16le", out_f])
print(f"mixed {len(evs)} cues; voice gain {vg:+.1f} dB, final gain {fg:+.1f} dB")
