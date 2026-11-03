#!/usr/bin/env python3
"""audio_analyzer.py — AI-first audio structure analysis and music window scorer.

Analyzes any audio file using FFmpeg and NumPy to extract:
  - Tempo / BPM (autocorrelation of spectral flux)
  - Structural points: intro end, drop/climax timestamp, breakdown windows
  - Energy bands: low (bass), lowmid, mid, high
  - Optimal window scoring: finds the best [start_s, end_s] slice for a target
    video duration (e.g. 30s) where the musical drop lands at your desired video cue.

Outputs clean JSON (ideal for AI agents and code generators) or human-readable text.

Usage:
    python scripts/audio_analyzer.py track.mp3 --json
    python scripts/audio_analyzer.py track.mp3 --target-dur 30 --drop-at 17.0 --json
    python scripts/audio_analyzer.py track.mp3 --out analysis.json
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 16000
N_FFT = 1024
HOP = 256
BANDS = [0, 200, 800, 2500, 8000]


def load_pcm(path: str, sr: int = SR) -> np.ndarray:
    """Extract mono float32 PCM using ffmpeg."""
    cmd = [
        "ffmpeg", "-v", "error", "-i", path,
        "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError as e:
        sys.stderr.write(f"FFmpeg error loading '{path}': {e.stderr.decode('utf-8', errors='ignore')}\n")
        sys.exit(1)
    except FileNotFoundError:
        sys.stderr.write("Error: ffmpeg is not installed or not in PATH.\n")
        sys.exit(1)

    return np.frombuffer(proc.stdout, dtype=np.float32)


def analyze_track(path: str, fps: float = 30.0) -> dict:
    """Analyze track audio characteristics and structure."""
    x = load_pcm(path)
    n = len(x)
    dur = n / SR
    if dur < 2.0:
        raise ValueError(f"Audio file is too short ({dur:.2f}s) for analysis.")

    frames = 1 + (n - N_FFT) // HOP
    win = np.hanning(N_FFT).astype(np.float32)
    rms = np.empty(frames, dtype=np.float32)
    bands = np.zeros((frames, 4), dtype=np.float32)
    flux = np.zeros(frames, dtype=np.float32)
    prev = None
    freqs = np.fft.rfftfreq(N_FFT, 1 / SR)

    for i in range(frames):
        seg = x[i * HOP : i * HOP + N_FFT]
        rms[i] = np.sqrt(np.mean(seg ** 2) + 1e-12)
        mag = np.abs(np.fft.rfft(seg * win))
        e = mag ** 2
        for b in range(4):
            bands[i, b] = e[(freqs >= BANDS[b]) & (freqs < BANDS[b + 1])].sum()
        if prev is not None:
            flux[i] = np.maximum(0, mag - prev).sum()
        prev = mag

    t = np.arange(frames) * HOP / SR
    rms_db = 20 * np.log10(rms + 1e-9)

    # 1s smoothed RMS
    k = max(1, int(SR / HOP))
    kern = np.ones(k) / k
    sm = np.convolve(rms_db, kern, mode="same")

    # BPM via onset envelope autocorrelation
    fenv = flux - flux.mean()
    ac = np.correlate(fenv, fenv, mode="full")[len(fenv) - 1 :]
    lo = int(60 / 220 * SR / HOP)  # max ~220 BPM
    hi = int(60 / 50 * SR / HOP)   # min ~50 BPM
    if hi < len(ac):
        seg = ac[lo:hi]
        lag = lo + int(np.argmax(seg))
        bpm = 60 / (lag * HOP / SR)
    else:
        bpm = 0.0

    # Intro detection: first time smoothed rms passes median - 5dB for >= 1s
    med = float(np.percentile(sm, 55))
    thr = med - 5.0
    intro = 0.0
    idx = np.where(sm > thr)[0]
    if len(idx):
        run = 0
        for i_val in idx:
            run = run + 1
            if run >= int(1.0 * SR / HOP):
                intro = max(0.0, float(t[i_val] - 1.0))
                break

    # Drop / climax: maximum 2s rise vs prior 2s
    w = int(2.0 * SR / HOP)
    best_rise = (-99.0, 0.0)
    start_search = max(w, int((intro + 2.0) * SR / HOP))
    for i in range(start_search, frames - w):
        diff = sm[i : i + w].mean() - sm[i - w : i].mean()
        if diff > best_rise[0]:
            best_rise = (float(diff), float(t[i]))
    drop_s = best_rise[1]

    # Breakdown: quietest stretch in middle 30%..85% of track
    qb = (0.30 * dur, 0.85 * dur)
    qi = sm < np.percentile(sm, 20)
    bd_t = None
    best_run = 0
    i = int(qb[0] * SR / HOP)
    end = int(qb[1] * SR / HOP)
    while i < end:
        if qi[i]:
            j = i
            while j < end and qi[j]:
                j += 1
            if (j - i) > best_run:
                best_run = j - i
                bd_t = (float(t[i]), float(t[j]))
            i = j
        else:
            i += 1

    # Energy band ratios (loud sections only)
    loud_mask = sm > np.percentile(sm, 50)
    if loud_mask.sum() > 0:
        br = bands[loud_mask].sum(axis=0)
        br = br / (br.sum() + 1e-12)
    else:
        br = np.array([0.25, 0.25, 0.25, 0.25])

    # Onset density per second
    od = float((flux > np.percentile(flux, 90)).sum() / dur)

    return {
        "file": os.path.basename(path),
        "path": str(Path(path).resolve()),
        "duration_s": round(dur, 3),
        "duration_frames": int(round(dur * fps)),
        "fps": fps,
        "bpm": round(bpm, 1),
        "beat_duration_s": round(60.0 / bpm, 3) if bpm > 0 else None,
        "bar_duration_s": round(240.0 / bpm, 3) if bpm > 0 else None,
        "bar_frames": round((240.0 / bpm) * fps, 1) if bpm > 0 else None,
        "intro_s": round(intro, 2),
        "drop_s": round(drop_s, 2),
        "drop_rise_db": round(best_rise[0], 1),
        "breakdown_window_s": [round(x, 2) for x in bd_t] if bd_t else None,
        "median_loudness_db": round(med, 1),
        "peak_db": round(float(rms_db.max()), 1),
        "bands": {
            "low_bass": round(float(br[0]), 3),
            "low_mid": round(float(br[1]), 3),
            "mid": round(float(br[2]), 3),
            "high": round(float(br[3]), 3),
        },
        "onset_density_per_s": round(od, 1),
        "_sm_envelope": sm,
        "_time": t,
    }


def score_windows(analysis: dict, target_dur: float = 30.0, target_drop_at: float = None, fps: float = 30.0) -> list:
    """Find the best cutting windows matching target duration and optional drop alignment."""
    sm = analysis["_sm_envelope"]
    t = analysis["_time"]
    total_dur = analysis["duration_s"]
    step = HOP / SR

    w_len = int(target_dur / step)
    if len(sm) < w_len + 4:
        return []

    candidates = []
    # Slide across track with 0.5s step
    step_samples = int(0.5 / step)
    for s in range(2, len(sm) - w_len - 2, step_samples):
        seg = sm[s : s + w_len]
        t0 = s * step
        t1 = t0 + target_dur

        # Head vs body contrast
        head = seg[: int(6.0 / step)].mean()
        body = seg[int(10.0 / step) :].mean()
        contrast = body - head

        # Find drop inside this window
        span = int(2.0 / step)
        best_r = (-99.0, 0.0)
        for d in range(int(4.0 / step), len(seg) - span):
            r = seg[d : d + span].mean() - seg[max(0, d - span) : d].mean()
            if r > best_r[0]:
                best_r = (float(r), float(d * step))

        rise_val, drop_in_window = best_r

        # Score formulation
        score = 0.0
        score += min(max(contrast, 0), 10) * 1.2
        score += min(max(rise_val, 0), 10) * 1.5

        if target_drop_at is not None:
            # Reward landing drop near target
            dist = abs(drop_in_window - target_drop_at)
            score += max(0.0, 6.0 - dist * 1.5)
        else:
            # Reward drop sitting in natural climax range (12s - 22s for 30s-45s)
            midpoint = target_dur * 0.55
            score += max(0.0, 4.0 - abs(drop_in_window - midpoint) * 0.5)

        # Penalize silence or sudden drop-off at the end
        tail = seg[-int(4.0 / step) :].mean()
        tail_drop = body - tail
        score -= max(0.0, tail_drop - 3.0) * 1.5

        candidates.append({
            "score": round(score, 2),
            "start_s": round(t0, 2),
            "end_s": round(t1, 2),
            "duration_s": round(target_dur, 2),
            "drop_in_cut_s": round(drop_in_window, 2),
            "drop_frame": int(round(drop_in_window * fps)),
            "total_frames": int(round(target_dur * fps)),
            "contrast_db": round(float(contrast), 1),
            "drop_rise_db": round(float(rise_val), 1),
        })

    candidates.sort(key=lambda c: c["score"], reverse=True)
    return candidates[:5]


def main():
    parser = argparse.ArgumentParser(description="Analyze audio file structure, BPM, and optimal video cutting window.")
    parser.add_argument("input", help="Path to audio file (mp3, wav, m4a)")
    parser.add_argument("--fps", type=float, default=30.0, help="Video frame rate (default: 30.0)")
    parser.add_argument("--target-dur", type=float, default=None, help="Target video duration in seconds (e.g. 30.0)")
    parser.add_argument("--drop-at", type=float, default=None, help="Desired drop / climax timestamp in cut (e.g. 17.08)")
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")
    parser.add_argument("--out", type=str, default=None, help="Save JSON report to file")

    args = parser.parse_args()

    if not os.path.isfile(args.input):
        sys.stderr.write(f"Error: file not found: {args.input}\n")
        sys.exit(1)

    try:
        report = analyze_track(args.input, fps=args.fps)
    except Exception as e:
        sys.stderr.write(f"Analysis failed: {e}\n")
        sys.exit(1)

    if args.target_dur is not None:
        windows = score_windows(report, target_dur=args.target_dur, target_drop_at=args.drop_at, fps=args.fps)
        report["suggested_windows"] = windows
        if windows:
            report["best_window"] = windows[0]

    # Clean internal cache keys before output
    report.pop("_sm_envelope", None)
    report.pop("_time", None)

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

    if args.json or not sys.stdout.isatty():
        print(json.dumps(report, indent=2))
    else:
        print(f"\n🎵 Audio Analysis: {report['file']}")
        print(f"  Duration:   {report['duration_s']}s ({report['duration_frames']} frames @ {report['fps']} fps)")
        print(f"  Tempo:      {report['bpm']} BPM (bar = {report.get('bar_duration_s', 0)}s = {report.get('bar_frames', 0)}f)")
        print(f"  Intro End:  {report['intro_s']}s")
        print(f"  Climax/Drop:{report['drop_s']}s (+{report['drop_rise_db']} dB rise)")
        if report.get("breakdown_window_s"):
            print(f"  Breakdown:  {report['breakdown_window_s'][0]}s -> {report['breakdown_window_s'][1]}s")
        print(f"  Spectrum:   Bass {report['bands']['low_bass']*100:.1f}%, LowMid {report['bands']['low_mid']*100:.1f}%, Mid {report['bands']['mid']*100:.1f}%, High {report['bands']['high']*100:.1f}%")

        if "best_window" in report:
            bw = report["best_window"]
            print(f"\n🎯 Recommended Cut Window ({bw['duration_s']}s):")
            print(f"  Window:     {bw['start_s']}s -> {bw['end_s']}s (score: {bw['score']})")
            print(f"  Drop Cut:   At {bw['drop_in_cut_s']}s (frame {bw['drop_frame']})")
        print()


if __name__ == "__main__":
    main()
