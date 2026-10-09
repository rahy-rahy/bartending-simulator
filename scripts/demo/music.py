"""
Composes an original upbeat lounge track with numpy and writes it as WAV.

    python3 scripts/demo/music.py <output.wav> [seconds]

100 bpm, swung hi-hats, soft kick and rim, walking bass, electric-piano
seventh chords (ii–V–I–vi in F) and a light pad. Fades in and out.
"""
import math
import sys
import wave

import numpy as np

SR = 44100
BPM = 100
BEAT = 60.0 / BPM
OUT = sys.argv[1] if len(sys.argv) > 1 else "lounge.wav"
SECONDS = float(sys.argv[2]) if len(sys.argv) > 2 else 66.0
N = int(SR * SECONDS)
rng = np.random.default_rng(7)


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def env(length: int, attack: float, decay: float, sustain: float = 0.0, release: float = 0.05) -> np.ndarray:
    t = np.arange(length) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-np.maximum(t - attack, 0) / max(decay, 1e-4))
    e = a * (sustain + (1 - sustain) * d)
    tail = int(release * SR)
    if tail > 0 and tail < length:
        e[-tail:] *= np.linspace(1, 0, tail)
    return e


def place(buf: np.ndarray, start: float, sound: np.ndarray, gain: float = 1.0) -> None:
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sound))
    buf[i:j] += sound[: j - i] * gain


# ------------------------------------------------------------------ drums
def kick() -> np.ndarray:
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 42 + 110 * np.exp(-t * 30)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * env(n, 0.002, 0.11) * 0.95


def rim() -> np.ndarray:
    n = int(0.11 * SR)
    t = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    # crude band-pass by differencing + smoothing
    noise = np.diff(noise, prepend=0)
    noise = np.convolve(noise, np.ones(6) / 6, mode="same")
    tone = np.sin(2 * np.pi * 820 * t) * np.exp(-t * 90)
    return (noise * env(n, 0.001, 0.025) * 0.5 + tone * 0.35) * 0.7


def hat(open_: bool = False) -> np.ndarray:
    n = int((0.22 if open_ else 0.06) * SR)
    noise = rng.normal(0, 1, n)
    noise = np.diff(noise, prepend=0)  # brighten
    return noise * env(n, 0.001, 0.09 if open_ else 0.018) * 0.22


def shaker_hit() -> np.ndarray:
    n = int(0.05 * SR)
    noise = rng.normal(0, 1, n)
    noise = np.convolve(noise, np.ones(3) / 3, mode="same")
    return noise * env(n, 0.004, 0.015) * 0.16


# ------------------------------------------------------------------ pitched instruments
def bass(note: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(note)
    wave_ = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sign(np.sin(2 * np.pi * f * t))
    return wave_ * env(n, 0.008, 0.35, 0.25, 0.04) * 0.5


def epiano(note: float, dur: float, vel: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(note)
    detune = 1.003
    core = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * detune * t + 0.3)
    bell = 0.35 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 6)
    tine = 0.18 * np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t * 14)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return (core + bell + tine) * env(n, 0.004, 0.9, 0.0, 0.06) * trem * 0.22 * vel


def pad(notes, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, note in enumerate(notes):
        f = midi(note)
        out += np.sin(2 * np.pi * f * t + k) + 0.4 * np.sin(2 * np.pi * f * 1.002 * t)
    vib = 1 + 0.02 * np.sin(2 * np.pi * 0.3 * t)
    return out * env(n, 0.6, 3.0, 0.7, 0.5) * vib * 0.045


# ------------------------------------------------------------------ arrangement (key of F major)
# ii–V–I–vi: Gm7, C7, Fmaj7, Dm7 — one bar (4 beats) each, 4-bar loop
CHORDS = [
    ("Gm7", 55, [67, 70, 74, 77]),  # G3 root; voicing G4 Bb4 D5 F5
    ("C7", 48, [64, 67, 70, 76]),  # C3 root; E4 G4 Bb4 E5
    ("Fmaj7", 53, [65, 69, 72, 76]),  # F3 root; F4 A4 C5 E5
    ("Dm7", 50, [62, 65, 69, 72]),  # D3 root; D4 F4 A4 C5
]

drums = np.zeros(N)
bass_buf = np.zeros(N)
keys = np.zeros(N)
pad_buf = np.zeros(N)

bar = 4 * BEAT
n_bars = int(math.ceil(SECONDS / bar)) + 1
swing = 0.58  # off-beat eighth placed late

for b in range(n_bars):
    t0 = b * bar
    name, root, voicing = CHORDS[b % 4]
    # drums
    place(drums, t0 + 0 * BEAT, kick(), 1.0)
    place(drums, t0 + 2 * BEAT, kick(), 0.85)
    place(drums, t0 + 2.5 * BEAT + 0.5 * BEAT * (swing - 0.5) * 2, kick(), 0.45)
    place(drums, t0 + 1 * BEAT, rim(), 0.8)
    place(drums, t0 + 3 * BEAT, rim(), 0.9)
    for e in range(8):
        pos = e / 2
        if e % 2 == 1:
            pos = (e - 1) / 2 + swing
        gain = 0.9 if e % 2 == 0 else 0.55
        place(drums, t0 + pos * BEAT, hat(open_=(e == 7 and b % 2 == 1)), gain)
    for s in range(16):
        pos = s / 4
        if s % 2 == 1:
            pos += (swing - 0.5) / 2
        place(drums, t0 + pos * BEAT, shaker_hit(), 0.5 if s % 4 == 2 else 0.3)
    # walking bass: root, fifth, octave, approach to next root
    nxt = CHORDS[(b + 1) % 4][1]
    approach = nxt - 1 if nxt > root else nxt + 1
    pattern = [root, root + 7, root + 12, approach]
    for i, note in enumerate(pattern):
        dur = BEAT * 0.95
        place(bass_buf, t0 + i * BEAT, bass(note, dur), 1.0 if i in (0, 2) else 0.8)
    # electric piano comping: "and of 1" and beat 3, with a pickup on the "and of 4" every other bar
    hits = [(0.5 + (swing - 0.5), 1.0, 1.3 * BEAT), (2.0, 0.85, 1.6 * BEAT)]
    if b % 2 == 1:
        hits.append((3.5 + (swing - 0.5), 0.7, 0.5 * BEAT))
    for pos, vel, dur in hits:
        for k, note in enumerate(voicing):
            place(keys, t0 + pos * BEAT + k * 0.012, epiano(note, dur, vel), 1.0)
    # pad holds the chord
    place(pad_buf, t0, pad([voicing[0] - 12, voicing[1], voicing[3]], bar * 1.05), 1.0)

# melody fragment: a light motif every 8 bars on the e-piano
MOTIF = [(0.0, 81, 0.5), (0.5, 79, 0.5), (1.0, 77, 1.0), (2.0, 74, 0.5), (2.5, 77, 0.5), (3.0, 79, 1.0)]
for b in range(0, n_bars, 8):
    t0 = (b + 2) * bar
    for pos, note, dur in MOTIF:
        place(keys, t0 + pos * BEAT, epiano(note, dur * BEAT * 1.4, 0.75), 1.0)

mix = drums * 0.9 + bass_buf * 0.8 + keys * 1.0 + pad_buf * 1.0

# gentle stereo: keys slightly right, pad wide, drums centre
left = drums * 0.9 + bass_buf * 0.8 + keys * 0.85 + pad_buf * 1.1
right = drums * 0.9 + bass_buf * 0.8 + keys * 1.1 + pad_buf * 0.9

# soft-knee limiter and normalisation
def finish(x: np.ndarray) -> np.ndarray:
    x = np.tanh(x * 1.4) / np.tanh(1.4)
    x /= max(1e-9, np.max(np.abs(x)))
    return x * 0.6


left = finish(left[:N])
right = finish(right[:N])

# fades
fade_in = int(1.5 * SR)
fade_out = int(3.0 * SR)
ramp_in = np.linspace(0, 1, fade_in)
ramp_out = np.linspace(1, 0, fade_out)
for ch in (left, right):
    ch[:fade_in] *= ramp_in
    ch[-fade_out:] *= ramp_out

stereo = np.stack([left, right], axis=1)
pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"wrote {OUT}: {SECONDS:.1f} s, peak {np.max(np.abs(stereo)):.2f}, rms {np.sqrt(np.mean(mix[:N] ** 2)):.3f}")
