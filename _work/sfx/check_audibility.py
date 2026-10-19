import numpy as np, soundfile as sf, json, sys
# usage: check_audibility.py <sfx-plan.json> <sfxbus.wav> <voice.wav> <voice_gain_db>
# Momentary SFX-to-voice ratio per cue: loudest 50 ms of the cue vs the voice in the same 50 ms.
plan, bus_f, voice_f, vg = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
bus, sr = sf.read(bus_f); v, _ = sf.read(voice_f)
bus = bus.mean(1); v = (v.mean(1) if v.ndim > 1 else v) * 10 ** (vg / 20)
W = int(0.05 * sr); res = {}
rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-9
for e in json.load(open(plan))["events"]:
    a = int(e["at_s"] * sr); b = min(len(v), a + int(1.4 * sr))
    best, pos = 0, a
    for s in range(a, b - W, W // 2):
        r = rms(bus[s:s + W])
        if r > best: best, pos = r, s
    res.setdefault(e["sfx_id"], []).append(20 * np.log10(best / rms(v[max(0, pos - W):pos + 2 * W])))
for k, x in res.items(): print(f"{k:<12} n={len(x):2d}  sfx/voice median {np.median(x):+5.1f} dB  range {min(x):+5.1f}..{max(x):+5.1f}")
