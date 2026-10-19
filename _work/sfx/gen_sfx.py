import numpy as np, json, os, sys
import soundfile as sf
from scipy import signal
# usage: python3 gen_sfx.py <out dir>
# Procedural SFX library (calm/premium: soft whooshes, clean pops, no harsh textures). 48 kHz stereo, peak -1 dBFS.
OUT = sys.argv[1]
SR = 48000
rng = np.random.default_rng(7)
os.makedirs(f"{OUT}/clips", exist_ok=True)

def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a, r, curve=4):
    x = np.ones(n); A = max(1, int(a * SR)); R = max(1, int(r * SR))
    x[:A] = np.linspace(0, 1, A) ** 2
    x[-R:] *= np.exp(-curve * np.linspace(0, 1, R)) * np.linspace(1, 0, R) ** 0.5
    return x
def sweep_bp(x, f0, f1, q=1.2, steps=64):
    # time-varying band-pass, crossfaded blocks
    out = np.zeros_like(x); n = len(x); hop = n // steps
    win = np.hanning(2 * hop)
    for i in range(steps):
        c = f0 * (f1 / f0) ** (i / (steps - 1))
        b, a = signal.butter(2, [c / (1 + 1 / q) / (SR / 2), min(0.99, c * (1 + 1 / q) / (SR / 2))], 'band')
        s = max(0, i * hop - hop // 2); e = min(n, s + 2 * hop)
        out[s:e] += signal.lfilter(b, a, x[s:e]) * win[:e - s]
    return out
def lp(x, f): b, a = signal.butter(2, f / (SR / 2)); return signal.lfilter(b, a, x)
def hp(x, f): b, a = signal.butter(2, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def verb(x, size=0.6, mix=0.18):
    ir = rng.standard_normal(int(size * SR)) * np.exp(-np.linspace(0, 7, int(size * SR)))
    ir = lp(ir, 6000); w = signal.fftconvolve(x, ir)[:len(x) + len(ir) - 1]
    y = np.concatenate([x, np.zeros(len(ir) - 1)])
    return y + mix * w / (np.abs(w).max() + 1e-9) * np.abs(x).max()
def stereo(x, pan_from=0.0, pan_to=0.0, width=0.0):
    p = np.linspace(pan_from, pan_to, len(x))
    l = x * np.cos((p + 1) * np.pi / 4); r = x * np.sin((p + 1) * np.pi / 4)
    if width:
        d = int(0.012 * SR); r = np.concatenate([np.zeros(d), r])[:len(x)] * (1 - width) + r * width
    return np.stack([l, r], 1) * np.sqrt(2)
def sine_sweep(f0, f1, d, curve='exp'):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d) if curve == 'exp' else np.linspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

lib = {}
def save(name, x, cat, desc):
    if x.ndim == 1: x = stereo(x)
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (-1 / 20)
    sf.write(f"{OUT}/clips/{name}.wav", x.astype(np.float32), SR, subtype='PCM_16')
    lib[name] = {"file": f"clips/{name}.wav", "category": cat, "duration_s": round(len(x) / SR, 3), "desc": desc,
                 "source": "procedural (gen_sfx.py)", "license": "original, free to use"}

# whoosh: air sweep up then down, panned L->R
d = 0.7; n = rng.standard_normal(int(d * SR))
w = sweep_bp(n, 250, 4200, 1.0) * env(len(n), 0.42, 0.28, 3)
w += 0.5 * sweep_bp(rng.standard_normal(len(n)), 120, 900, 0.8) * env(len(n), 0.45, 0.25, 3)
save("whoosh", stereo(lp(w, 9000), -0.7, 0.7, 0.4), "transition", "airy whoosh for whip transitions")
# soft whoosh (card entrances)
d = 0.45; n = rng.standard_normal(int(d * SR))
w = sweep_bp(n, 600, 3000, 1.4) * env(len(n), 0.2, 0.25, 4)
save("whoosh-soft", stereo(lp(w, 8000), 0.4, -0.2, 0.3), "motion", "short soft air for card slide-ins")
# pop: pitch-drop bubble + tiny transient
x = sine_sweep(1100, 380, 0.09) * env(int(0.09 * SR), 0.002, 0.085, 5)
x[:int(0.004 * SR)] += hp(rng.standard_normal(int(0.004 * SR)), 3000) * 0.3
save("pop", verb(x, 0.25, 0.12), "emphasis", "clean UI pop for chips/cards")
x = sine_sweep(1500, 700, 0.06) * env(int(0.06 * SR), 0.001, 0.058, 5)
save("pop-small", verb(x, 0.2, 0.1), "emphasis", "smaller higher pop")
# tick: crisp UI tick
x = (np.sin(2 * np.pi * 2600 * t_(0.03)) * 0.6 + hp(rng.standard_normal(int(0.03 * SR)), 4000) * 0.4) * env(int(0.03 * SR), 0.0005, 0.029, 9)
save("tick", x, "snap", "crisp tick for checks / counters")
# mouse click: two transients
c = np.zeros(int(0.09 * SR))
for o, g in ((0, 1.0), (0.055, 0.6)):
    s = int(o * SR); b = hp(rng.standard_normal(int(0.006 * SR)), 2500) * np.exp(-np.linspace(0, 6, int(0.006 * SR)))
    c[s:s + len(b)] += b * g
c += np.sin(2 * np.pi * 1800 * t_(0.09)) * np.exp(-t_(0.09) * 120) * 0.3
save("mouse-click", c, "snap", "mouse click (down/up)")
# impact: soft sub boom + body, not a trailer slam
d = 1.1; t = t_(d)
x = sine_sweep(110, 42, d) * np.exp(-t * 4.5) * 1.0
x += lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 18) * 0.6
x += sine_sweep(320, 160, d) * np.exp(-t * 14) * 0.35
save("impact", verb(x, 0.9, 0.2), "emphasis", "soft cinematic impact for stamps / punch-ins")
# riser: filtered noise + tone rising, ends on the beat
d = 1.3; t = t_(d); n = rng.standard_normal(len(t))
x = sweep_bp(n, 400, 7000, 2.0) * (t / d) ** 2.2
x += 0.25 * sine_sweep(220, 880, d) * (t / d) ** 2.5
x *= np.concatenate([np.ones(len(t) - 600), np.linspace(1, 0, 600)])
save("riser", stereo(x, 0, 0, 0.5), "tension", "short riser into a reveal (cue at riser END)")
# ding: bell partials
d = 1.4; t = t_(d); f = 1318.5
x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) for m, a, k in ((1, 1, 4), (2.0, 0.35, 6), (2.76, 0.25, 8), (5.4, 0.08, 12)))
x *= env(len(t), 0.002, 0.3, 2)
save("ding", verb(x, 0.8, 0.15), "emphasis", "bright bell for positive reveals")
# ping: two-note notification
x = np.concatenate([np.sin(2 * np.pi * 988 * t_(0.09)) * np.exp(-t_(0.09) * 25), np.sin(2 * np.pi * 1480 * t_(0.35)) * np.exp(-t_(0.35) * 9)])
save("ping", verb(x, 0.5, 0.15), "notification", "message notification ping")
# swipe: fast high scratch-like stroke (strike-through)
d = 0.22; n = rng.standard_normal(int(d * SR))
x = sweep_bp(n, 1800, 6000, 1.6) * env(len(n), 0.03, 0.17, 4)
save("swipe", stereo(x, -0.4, 0.4), "motion", "quick stroke for strike-through / underline")
# unlock: click + rising two-tone
x = np.concatenate([hp(rng.standard_normal(int(0.01 * SR)), 2000) * np.exp(-np.linspace(0, 8, int(0.01 * SR))), np.zeros(int(0.05 * SR)),
                    np.sin(2 * np.pi * 784 * t_(0.12)) * np.exp(-t_(0.12) * 20), np.sin(2 * np.pi * 1175 * t_(0.5)) * np.exp(-t_(0.5) * 7)])
save("unlock", verb(x, 0.5, 0.15), "emphasis", "lock open + reward tone")
# sparkle: random high blips (confetti)
d = 1.0; x = np.zeros(int(d * SR))
for i in range(14):
    s = int(rng.uniform(0, 0.75) * SR); f = rng.uniform(2200, 4200); b = np.sin(2 * np.pi * f * t_(0.08)) * np.exp(-t_(0.08) * 45)
    x[s:s + len(b)] += b * rng.uniform(0.3, 1)
save("sparkle", stereo(verb(x, 0.4, 0.2)[:len(x)], 0, 0, 0.6), "texture", "confetti sparkle")
# shimmer: soft chord swell for the end card
d = 2.0; t = t_(d)
x = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 5 * t) * 0.3) for f in (523.25, 659.25, 783.99, 1046.5)) * env(len(t), 0.05, 1.4, 3)
save("shimmer", stereo(verb(x, 1.2, 0.3)[:len(t)], 0, 0, 0.7), "texture", "warm chord swell for the outro card")

json.dump(lib, open(f"{OUT}/catalog.json", "w"), indent=1)
print("generated", len(lib), "clips")
