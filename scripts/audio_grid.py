#!/usr/bin/env python3
"""audio_grid.py — Downbeat phase alignment and frame-perfect Remotion grid generator.

Resolves tempo half-time/double-time aliases, finds downbeat sub-second phase,
and computes exact frame-locked bar and beat numbers at the target FPS (default 30).

Exports directly to TypeScript (`src/audioGrid.ts`) or JSON for Remotion scenes.

Usage:
    python scripts/audio_grid.py track.mp3 --json
    python scripts/audio_grid.py track.mp3 --export-ts src/audioGrid.ts
    python scripts/audio_grid.py track.mp3 --start 6.0 --dur 30.0 --fps 30 --export-ts src/audioGrid.ts
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 22050


def load_audio(path: str, sr: int = SR) -> np.ndarray:
    cmd = [
        "ffmpeg", "-v", "error", "-i", path,
        "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError as e:
        sys.stderr.write(f"FFmpeg error: {e.stderr.decode('utf-8', errors='ignore')}\n")
        sys.exit(1)
    except FileNotFoundError:
        sys.stderr.write("Error: ffmpeg is not installed or not in PATH.\n")
        sys.exit(1)

    return np.frombuffer(proc.stdout, dtype=np.float32)


def compute_grid(
    path: str,
    start_s: float = 0.0,
    dur_s: float = None,
    fps: float = 30.0,
    override_bpm: float = None,
) -> dict:
    x = load_audio(path)
    total_audio_dur = len(x) / SR

    if dur_s is None:
        dur_s = total_audio_dur - start_s
    dur_s = min(dur_s, total_audio_dur - start_s)

    # Slice excerpt
    i0 = int(start_s * SR)
    i1 = int((start_s + dur_s) * SR)
    x_seg = x[i0:i1]

    # STFT & Spectral Flux
    n_fft = 1024
    hop = SR // int(fps * 2)  # 2x sub-frame resolution
    win = np.hanning(n_fft)

    stft_frames = []
    for i in range(0, len(x_seg) - n_fft, hop):
        seg = x_seg[i : i + n_fft] * win
        stft_frames.append(np.abs(np.fft.rfft(seg)))

    if not stft_frames:
        raise ValueError("Audio excerpt too short for grid computation.")

    stft = np.stack(stft_frames)
    flux = np.maximum(0, np.diff(stft, axis=0, prepend=stft[:1])).sum(axis=1)

    # Detect tempo if not overridden
    if override_bpm is not None and override_bpm > 0:
        bpm = override_bpm
    else:
        # Autocorrelation of flux
        f_env = flux - flux.mean()
        ac = np.correlate(f_env, f_env, "full")[len(f_env) - 1 :]
        lo = int(60 / 200 * SR / hop)
        hi = int(60 / 55 * SR / hop)
        if hi < len(ac):
            lag = lo + int(np.argmax(ac[lo:hi]))
            detected_bpm = 60 / (lag * hop / SR)
        else:
            detected_bpm = 120.0

        # Check candidate multiples (0.5x, 1x, 2x) on the active body
        body_start = int(len(flux) * 0.25)
        body_end = int(len(flux) * 0.85)
        body_f = flux[body_start:body_end]
        b_env = body_f - body_f.mean()
        b_ac = np.correlate(b_env, b_env, "full")[len(b_env) - 1 :]

        candidates = [detected_bpm * 0.5, detected_bpm, detected_bpm * 2.0]
        candidates = [c for c in candidates if 55.0 <= c <= 190.0]

        best_bpm = detected_bpm
        best_score = -1.0
        for cand in candidates:
            lag = int(round(60 / cand * 4 * SR / hop))
            if lag < len(b_ac):
                score = b_ac[lag] / (b_ac.max() + 1e-9)
                if score > best_score:
                    best_score = score
                    best_bpm = cand
        bpm = best_bpm

    beat_sec = 60.0 / bpm
    bar_sec = beat_sec * 4.0
    bar_frames_exact = bar_sec * fps
    beat_frames_exact = beat_sec * fps

    # Find downbeat phase
    best_phase = 0.0
    best_phase_sum = -1.0
    for ph in np.arange(0, bar_sec, 1.0 / (fps * 2)):
        bar_times = ph + np.arange(0, dur_s, bar_sec)
        idx = np.round(bar_times * (SR / hop)).astype(int)
        idx = idx[idx < len(flux)]
        s_val = float(flux[idx].sum())
        if s_val > best_phase_sum:
            best_phase_sum = s_val
            best_phase = float(ph)

    trim_offset_s = start_s + best_phase
    total_frames = int(round(dur_s * fps))

    # Generate bar grid frames
    num_bars = int(dur_s / bar_sec) + 1
    bars = []
    bar_details = []

    # Frequency band indices for STFT
    lo_idx = (0, 8)
    mid_idx = (8, 60)
    high_idx = (60, 256)

    for k in range(num_bars):
        t_bar = k * bar_sec
        f_bar = int(round(t_bar * fps))
        if f_bar >= total_frames:
            break
        bars.append(f_bar)

        # Measure energy in this bar
        idx_start = int(t_bar * SR / hop)
        idx_end = min(len(stft), int((t_bar + bar_sec) * SR / hop))
        if idx_end > idx_start:
            bar_stft = stft[idx_start:idx_end]
            low_e = float(bar_stft[:, lo_idx[0]:lo_idx[1]].mean())
            mid_e = float(bar_stft[:, mid_idx[0]:mid_idx[1]].mean())
            high_e = float(bar_stft[:, high_idx[0]:high_idx[1]].mean())
        else:
            low_e = mid_e = high_e = 0.0

        bar_details.append({
            "bar": k + 1,
            "frame": f_bar,
            "time_s": round(t_bar, 3),
            "energy": {
                "low": round(low_e, 2),
                "mid": round(mid_e, 2),
                "high": round(high_e, 2),
            }
        })

    # Generate beat grid frames
    num_beats = int(dur_s / beat_sec) + 1
    beats = [int(round(k * beat_sec * fps)) for k in range(num_beats) if int(round(k * beat_sec * fps)) < total_frames]

    return {
        "file": os.path.basename(path),
        "fps": fps,
        "bpm": round(bpm, 2),
        "beat_duration_s": round(beat_sec, 4),
        "bar_duration_s": round(bar_sec, 4),
        "bar_frames_float": round(bar_frames_exact, 2),
        "bar_frames_int": int(round(bar_frames_exact)),
        "beat_frames_int": int(round(beat_frames_exact)),
        "downbeat_phase_s": round(best_phase, 4),
        "recommended_start_trim_s": round(trim_offset_s, 4),
        "total_duration_s": round(dur_s, 2),
        "total_frames": total_frames,
        "bars": bars,
        "beats": beats,
        "bar_details": bar_details,
    }


def export_ts(grid_data: dict, out_path: str):
    ts_code = f"""// Generated by promo-video-remotion audio_grid.py
// Frame-locked musical grid @ {grid_data['fps']} FPS | {grid_data['bpm']} BPM

export const AUDIO_GRID = {{
  fps: {grid_data['fps']},
  bpm: {grid_data['bpm']},
  beatDurationSeconds: {grid_data['beat_duration_s']},
  barDurationSeconds: {grid_data['bar_duration_s']},
  barFrames: {grid_data['bar_frames_int']},
  beatFrames: {grid_data['beat_frames_int']},
  totalFrames: {grid_data['total_frames']},
  recommendedTrimSeconds: {grid_data['recommended_start_trim_s']},
  bars: {json.dumps(grid_data['bars'])},
  beats: {json.dumps(grid_data['beats'])},
}} as const;

export type AudioGrid = typeof AUDIO_GRID;
"""
    dest = Path(out_path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(ts_code, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Generate frame-locked Remotion audio grid from music track.")
    parser.add_argument("input", help="Audio file path")
    parser.add_argument("--start", type=float, default=0.0, help="Start time in seconds (default: 0.0)")
    parser.add_argument("--dur", type=float, default=None, help="Duration in seconds (default: full track)")
    parser.add_argument("--fps", type=float, default=30.0, help="Remotion video FPS (default: 30.0)")
    parser.add_argument("--bpm", type=float, default=None, help="Explicitly specify/override BPM")
    parser.add_argument("--export-ts", type=str, default=None, help="Export TypeScript file path (e.g. src/audioGrid.ts)")
    parser.add_argument("--export-json", type=str, default=None, help="Export JSON file path")
    parser.add_argument("--json", action="store_true", help="Print JSON to stdout")

    args = parser.parse_args()

    if not os.path.isfile(args.input):
        sys.stderr.write(f"Error: file not found: {args.input}\n")
        sys.exit(1)

    try:
        grid = compute_grid(
            args.input,
            start_s=args.start,
            dur_s=args.dur,
            fps=args.fps,
            override_bpm=args.bpm,
        )
    except Exception as e:
        sys.stderr.write(f"Grid calculation failed: {e}\n")
        sys.exit(1)

    if args.export_ts:
        export_ts(grid, args.export_ts)
        sys.stderr.write(f"Exported TypeScript grid -> {args.export_ts}\n")

    if args.export_json:
        dest = Path(args.export_json)
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(grid, f, indent=2)
        sys.stderr.write(f"Exported JSON grid -> {args.export_json}\n")

    if args.json or not sys.stdout.isatty():
        print(json.dumps(grid, indent=2))
    else:
        print(f"\n🎼 Beat & Bar Grid: {grid['file']}")
        print(f"  BPM:             {grid['bpm']} ({grid['beat_frames_int']} frames/beat, {grid['bar_frames_int']} frames/bar)")
        print(f"  Downbeat Phase:  +{grid['downbeat_phase_s']}s into excerpt")
        print(f"  Trim for Frame0: {grid['recommended_start_trim_s']}s into source track")
        print(f"  Total Bars:      {len(grid['bars'])} bars over {grid['total_frames']} frames")
        print(f"  Bar Frames:      {grid['bars']}")
        print()


if __name__ == "__main__":
    main()
