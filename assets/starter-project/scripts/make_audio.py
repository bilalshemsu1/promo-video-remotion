"""Synthesizes all SFX + a 120 BPM music bed (no downloads). Run: npm run audio"""
import wave, pathlib
import numpy as np

SR = 44100
rng = np.random.default_rng(7)
out = pathlib.Path("public/audio"); (out / "sfx").mkdir(parents=True, exist_ok=True)

def tt(d): return np.arange(int(SR * d)) / SR
def save(path, x, peak=0.89):
    x = x / max(1e-9, np.max(np.abs(x))) * peak
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
def sine(f, t): return np.sin(2 * np.pi * f * t)
def sweep(f0, f1, t):
    f = np.linspace(f0, f1, len(t)); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def lp(x, a):  # one-pole lowpass, a scalar or per-sample array in (0,1]
    a = np.broadcast_to(a, x.shape); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y
def fade(x, a=0.004, r=0.01):
    n = len(x); na, nr = int(SR * a), int(SR * r)
    x = x.copy(); x[:na] *= np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def noise(n): return rng.uniform(-1, 1, n)

def bell(f, d, k=9):
    t = tt(d); return (sine(f, t) + 0.5 * sine(f * 2.76, t) + 0.25 * sine(f * 5.4, t)) * np.exp(-k * t)

S = out / "sfx"
# ping
t = tt(0.3); save(S / "ping.wav", (sine(1320, t) + 0.6 * sine(1980, t)) * np.exp(-14 * t))
# record scratch
t = tt(0.55); x = (2 * ((np.cumsum(np.linspace(900, 160, len(t))) / SR) % 1) - 1) * 0.6 + noise(len(t)) * 0.35
save(S / "scratch.wav", fade(lp(x, 0.45) * np.sin(np.pi * np.linspace(0, 1, len(t))) ** 0.5))
# whoosh
t = tt(0.9); a = np.concatenate([np.linspace(0.02, 0.5, len(t) // 2), np.linspace(0.5, 0.02, len(t) - len(t) // 2)])
save(S / "whoosh.wav", fade(lp(noise(len(t)), a) * np.sin(np.pi * np.linspace(0, 1, len(t))) ** 1.5, 0.05, 0.1))
# slide (short whoosh)
t = tt(0.4); save(S / "slide.wav", fade(lp(noise(len(t)), np.linspace(0.05, 0.4, len(t))) * np.sin(np.pi * np.linspace(0, 1, len(t))), 0.02, 0.05))
# boom / impact
t = tt(1.0); x = sweep(140, 38, t) * np.exp(-4.5 * t) + lp(noise(len(t)), 0.15) * np.exp(-12 * t) * 0.6
save(S / "boom.wav", fade(x, 0.002, 0.05))
# pop
t = tt(0.14); save(S / "pop.wav", fade(sweep(700, 220, t) * np.exp(-24 * t), 0.001, 0.01))
# click
t = tt(0.06); save(S / "click.wav", fade((sine(2200, t) * 0.6 + noise(len(t)) * 0.5) * np.exp(-60 * t), 0.0005, 0.005))
# cha-ching
n = int(SR * 0.9); x = np.zeros(n)
for off, f in [(0, 2637), (0.11, 3520)]:
    b = bell(f, 0.7, 7); i = int(SR * off); x[i:i + len(b)] += b
x[:int(SR * 0.03)] += noise(int(SR * 0.03)) * 0.8
save(S / "chaching.wav", fade(x))
# coin
x = np.zeros(int(SR * 0.5)); b = bell(1568, 0.1, 25); x[:len(b)] += b; b = bell(2093, 0.4, 12); i = int(SR * 0.07); x[i:i + len(b)] += b
save(S / "coin.wav", fade(x))
# rocket
t = tt(1.8); a = np.linspace(0.03, 0.35, len(t))
x = lp(noise(len(t)), a) * np.linspace(0.3, 1, len(t)) ** 1.2 + 0.4 * sweep(55, 120, t)
save(S / "rocket.wav", fade(x, 0.05, 0.3))

# ---------- music: 120 BPM, 40s, Am-F-C-G, 1 bar per chord ----------
BEAT = 0.5; DUR = 40.0
M = np.zeros(int(SR * (DUR + 0.5)))
def add(x, at):
    i = int(SR * at); j = min(len(M), i + len(x))
    if i < len(M): M[i:j] += x[:j - i]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
tri = lambda f, t: 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * t))
saw = lambda f, t: 2 * ((f * t) % 1) - 1
CH = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]]; BASS = [45, 41, 48, 43]
kick = fade(sweep(160, 45, tt(0.3)) * np.exp(-9 * tt(0.3)), 0.001, 0.02)
clap = fade(lp(noise(int(SR * 0.2)), 0.5) * np.exp(-22 * tt(0.2)), 0.001, 0.02)
hat = fade(noise(int(SR * 0.05)) * np.exp(-70 * tt(0.05)), 0.0005, 0.005)
bars = int(DUR / (4 * BEAT))
for bar in range(bars):
    t0 = bar * 4 * BEAT; ch = bar % 4; prog = bar / bars
    build = 0.5 + 0.8 * max(0, (prog - 0.7) / 0.3)  # crescendo in the last 30%
    for b in range(4):
        add(kick * 0.9, t0 + b * BEAT)
        if b in (1, 3): add(clap * 0.35, t0 + b * BEAT)
        add(hat * 0.18, t0 + b * BEAT + BEAT / 2)
    for e in range(8):  # bass eighths
        d = 0.22; t = tt(d); add(saw(mf(BASS[ch]), t) * np.exp(-5 * t) * 0.32 * (1 if e % 2 == 0 else 0.7), t0 + e * BEAT / 2)
    notes = CH[ch]; pat = [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 2, 1, 2, 1]
    for s16 in range(16):
        d = 0.18; t = tt(d); add(tri(mf(notes[pat[s16]] + 12), t) * np.exp(-9 * t) * 0.22 * build, t0 + s16 * BEAT / 4)
    d = 4 * BEAT; t = tt(d)
    for m in notes: add(tri(mf(m), t) * 0.07 * np.minimum(1, t * 8) * np.minimum(1, (d - t) * 8), t0)
# final hit at 39.5 s (global 44.5 s)
hit = DUR - 0.5
for m in [45, 57, 60, 64, 69]:
    t = tt(0.5); add(saw(mf(m), t) * np.exp(-5 * t) * 0.25, hit)
add(kick * 1.2, hit); add(clap * 0.6, hit)
M[int(SR * (DUR + 0.2)):] = 0
save(out / "music.wav", fade(M[:int(SR * DUR)], 0.01, 0.15), 0.85)
print("audio done")
