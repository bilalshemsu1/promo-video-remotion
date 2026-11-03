#!/usr/bin/env python3
"""audio_bed.py — Production music bed builder with EBU R128 loudness normalization.

Extracts an exact duration slice from a source track, matches broadcast loudness
using FFmpeg loudnorm (-14.5 LUFS, -1.5 dBTP), applies smooth head/tail fades,
and writes to public/audio/bed.mp3.

Usage:
    python scripts/audio_bed.py track.mp3 --start 47.0 --dur 33.0 --out public/audio/bed.mp3
    python scripts/audio_bed.py track.mp3 --start 47.0 --dur 30.0 --json
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


def build_bed(
    input_path: str,
    output_path: str,
    start_s: float = 0.0,
    dur_s: float = 30.0,
    target_lufs: float = -14.5,
    target_tp: float = -1.5,
    fade_out_s: float = 1.5,
    fade_in_s: float = 0.04,
) -> dict:
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Input audio track not found: {input_path}")

    out = Path(output_path).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-ss", str(start_s),
        "-t", str(dur_s),
        "-i", str(input_path),
        "-af", (
            f"afade=t=in:st=0:d={fade_in_s},"
            f"loudnorm=I={target_lufs}:TP={target_tp}:LRA=11:print_format=json,"
            f"afade=t=out:st={max(0, dur_s - fade_out_s):.3f}:d={fade_out_s}:curve=tri"
        ),
        "-ar", "48000",
        "-ac", "2",
        "-c:a", "libmp3lame" if out.suffix.lower() == ".mp3" else "pcm_s24le",
        "-b:a", "256k",
        str(out),
    ]

    try:
        proc = subprocess.run(cmd, capture_output=True, check=True)
    except subprocess.CalledProcessError as e:
        sys.stderr.write(f"FFmpeg loudnorm error: {e.stderr.decode('utf-8', errors='ignore')}\n")
        sys.exit(1)

    # Measure exact duration via ffprobe
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(out)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    measured_dur = float(probe)

    return {
        "status": "success",
        "input": str(Path(input_path).resolve()),
        "output": str(out),
        "start_s": round(start_s, 3),
        "duration_s": round(measured_dur, 3),
        "target_lufs": target_lufs,
        "target_tp_dbtp": target_tp,
        "sample_rate": 48000,
        "channels": 2,
    }


def main():
    parser = argparse.ArgumentParser(description="Cut and normalize a music bed for Remotion video.")
    parser.add_argument("input", help="Source music track")
    parser.add_argument("--start", type=float, default=0.0, help="Start time in seconds (default: 0.0)")
    parser.add_argument("--dur", type=float, default=30.0, help="Duration in seconds (default: 30.0)")
    parser.add_argument("--out", type=str, default="public/audio/bed.mp3", help="Output path (default: public/audio/bed.mp3)")
    parser.add_argument("--lufs", type=float, default=-14.5, help="Target LUFS (default: -14.5)")
    parser.add_argument("--tp", type=float, default=-1.5, help="Target True Peak in dBTP (default: -1.5)")
    parser.add_argument("--fade-out", type=float, default=1.5, help="Fade-out duration in seconds (default: 1.5)")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON to stdout")

    args = parser.parse_args()

    try:
        res = build_bed(
            input_path=args.input,
            output_path=args.out,
            start_s=args.start,
            dur_s=args.dur,
            target_lufs=args.lufs,
            target_tp=args.tp,
            fade_out_s=args.fade_out,
        )
    except Exception as e:
        sys.stderr.write(f"Bed generation failed: {e}\n")
        sys.exit(1)

    if args.json or not sys.stdout.isatty():
        print(json.dumps(res, indent=2))
    else:
        print(f"\n🎧 Music Bed Built -> {res['output']}")
        print(f"  Duration: {res['duration_s']}s (from {res['start_s']}s in source)")
        print(f"  Loudness: {res['target_lufs']} LUFS, True Peak: {res['target_tp_dbtp']} dBTP\n")


if __name__ == "__main__":
    main()
