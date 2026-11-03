#!/usr/bin/env python3
"""audio_master.py — Brickwall peak limiter & lossless video remuxer for Remotion MP4s.

When heavy SFX land on music drops or downbeats, the summed digital audio peaks
above 0 dBFS, causing harsh clipping artifacts.

audio_master.py:
  1. Extracts the rendered video's audio track.
  2. Runs a 5ms/40ms lookahead brickwall limiter with target ceiling (default 0.82 = -1.7 dBFS).
  3. Measures integrated loudness (LUFS) and true peak.
  4. Losslessly remuxes the mastered audio into the MP4 (-c:v copy).
     Video pixels are 100% bit-identical; render takes ~1 second.

Usage:
    python scripts/audio_master.py out/promo.mp4
    python scripts/audio_master.py out/promo.mp4 --out out/promo-mastered.mp4 --json
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def master_video(
    video_path: str,
    output_path: str = None,
    ceiling: float = 0.82,
    target_lufs: float = -14.5,
) -> dict:
    src = Path(video_path).resolve()
    if not src.is_file():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    if output_path is None:
        dst = src.with_name(f"{src.stem}-mastered{src.suffix}")
    else:
        dst = Path(output_path).resolve()

    dst.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        master_wav = Path(tmpdir) / "mastered.wav"

        # 1. Extract audio & apply lookahead limiter
        limit_cmd = [
            "ffmpeg", "-v", "error", "-y",
            "-i", str(src),
            "-af", f"alimiter=limit={ceiling}:attack=5:release=40:level=disabled",
            "-ar", "48000",
            "-ac", "2",
            "-c:a", "pcm_s24le",
            str(master_wav),
        ]
        try:
            subprocess.run(limit_cmd, capture_output=True, check=True)
        except subprocess.CalledProcessError as e:
            sys.stderr.write(f"Limiter processing error: {e.stderr.decode('utf-8', errors='ignore')}\n")
            sys.exit(1)

        # 2. Lossless video copy + AAC 256k audio remux
        remux_cmd = [
            "ffmpeg", "-v", "error", "-y",
            "-i", str(src),
            "-i", str(master_wav),
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "256k",
            "-shortest",
            str(dst),
        ]
        try:
            subprocess.run(remux_cmd, capture_output=True, check=True)
        except subprocess.CalledProcessError as e:
            sys.stderr.write(f"Remuxing error: {e.stderr.decode('utf-8', errors='ignore')}\n")
            sys.exit(1)

        # 3. Measure final loudness via ebur128
        ebur_cmd = [
            "ffmpeg", "-v", "info",
            "-i", str(dst),
            "-af", "ebur128=peak=true",
            "-f", "null", "-",
        ]
        ebur_res = subprocess.run(ebur_cmd, capture_output=True, text=True)
        lines = ebur_res.stderr.splitlines()

        lufs = None
        tp = None
        for line in reversed(lines):
            line_str = line.strip()
            if "I:" in line_str and "LUFS" in line_str and lufs is None:
                parts = line_str.split("I:")
                if len(parts) > 1:
                    lufs = parts[1].replace("LUFS", "").strip()
            elif "Peak:" in line_str and "dBFS" in line_str and tp is None:
                parts = line_str.split("Peak:")
                if len(parts) > 1:
                    tp = parts[1].replace("dBFS", "").strip()

    return {
        "status": "success",
        "input": str(src),
        "output": str(dst),
        "limiter_ceiling": ceiling,
        "measured_lufs": float(lufs) if lufs else None,
        "measured_true_peak_dbfs": float(tp) if tp else None,
    }


def main():
    parser = argparse.ArgumentParser(description="Brickwall limit transients and losslessly remux video audio.")
    parser.add_argument("video", help="Path to rendered Remotion MP4")
    parser.add_argument("--out", type=str, default=None, help="Output path (default: <name>-mastered.mp4)")
    parser.add_argument("--ceiling", type=float, default=0.82, help="Limiter ceiling linear amplitude (default: 0.82 = -1.7 dBFS)")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON to stdout")

    args = parser.parse_args()

    try:
        res = master_video(args.video, output_path=args.out, ceiling=args.ceiling)
    except Exception as e:
        sys.stderr.write(f"Mastering failed: {e}\n")
        sys.exit(1)

    if args.json or not sys.stdout.isatty():
        print(json.dumps(res, indent=2))
    else:
        print(f"\n🚀 Mastered Video -> {res['output']}")
        print(f"  Ceiling:   {res['limiter_ceiling']} (~ -1.7 dBFS headroom)")
        print(f"  Loudness:  {res['measured_lufs']} LUFS")
        print(f"  True Peak: {res['measured_true_peak_dbfs']} dBFS\n")


if __name__ == "__main__":
    main()
