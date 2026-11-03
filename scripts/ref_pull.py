#!/usr/bin/env python3
"""ref_pull.py — Competitor reference video and audio extractor for AI agents.

Downloads any reference video (TikTok, YouTube Shorts, Reels, X, or direct URL)
using yt-dlp, then automatically:
  1. Extracts the audio track and runs audio structure analysis (BPM, drop frame).
  2. Generates a 3x3 visual contact sheet PNG of keyframes across the video.
  3. Outputs a structured JSON report (ref_analysis.json) with scene pacing,
     duration, and music grid so the AI agent can emulate the reference's pacing.

Usage:
    python scripts/ref_pull.py "https://www.youtube.com/shorts/..." --out-dir refs/competitor
    python scripts/ref_pull.py local_reference.mp4 --out-dir refs/ad1 --json
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def check_tool(name: str) -> bool:
    return shutil.which(name) is not None


def pull_reference(
    source: str,
    out_dir: str = "refs/reference",
    fps: float = 30.0,
    tiles: str = "3x3",
) -> dict:
    dest = Path(out_dir).resolve()
    dest.mkdir(parents=True, exist_ok=True)

    video_path = dest / "reference.mp4"
    audio_path = dest / "audio.mp3"
    sheet_path = dest / "contact_sheet.jpg"
    report_path = dest / "ref_analysis.json"

    # 1. Obtain video (download via yt-dlp or copy local file)
    if os.path.isfile(source):
        shutil.copy2(source, video_path)
    else:
        if not check_tool("yt-dlp"):
            raise RuntimeError(
                "yt-dlp is required to download web URLs. Install it via: pip install yt-dlp"
            )
        sys.stderr.write(f"Downloading reference from {source}...\n")
        dl_cmd = [
            "yt-dlp",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--merge-output-format", "mp4",
            "-o", str(video_path),
            "--no-playlist",
            source,
        ]
        proc = subprocess.run(dl_cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(f"yt-dlp download failed: {proc.stderr[-1000:]}")

    if not video_path.is_file():
        raise FileNotFoundError(f"Failed to find downloaded video at {video_path}")

    # 2. Extract container info via ffprobe
    probe_cmd = [
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", str(video_path)
    ]
    probe_out = subprocess.run(probe_cmd, capture_output=True, text=True, check=True).stdout
    probe = json.loads(probe_out)

    v_stream = next((s for s in probe.get("streams", []) if s.get("codec_type") == "video"), {})
    width = int(v_stream.get("width", 0))
    height = int(v_stream.get("height", 0))
    dur = float(probe.get("format", {}).get("duration", 0))
    total_frames = int(round(dur * fps))

    # 3. Extract audio
    sys.stderr.write("Extracting reference audio...\n")
    cmd_audio = [
        "ffmpeg", "-v", "error", "-y", "-i", str(video_path),
        "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", str(audio_path)
    ]
    subprocess.run(cmd_audio, check=True)

    # 4. Analyze audio structure via audio_analyzer.py
    audio_analysis = {}
    analyzer_script = ROOT / "scripts" / "audio_analyzer.py"
    if analyzer_script.is_file() and audio_path.is_file():
        sys.stderr.write("Analyzing reference music & tempo...\n")
        try:
            res = subprocess.run(
                [sys.executable, str(analyzer_script), str(audio_path), "--fps", str(fps), "--json"],
                capture_output=True, text=True, check=True
            )
            audio_analysis = json.loads(res.stdout)
        except Exception as e:
            sys.stderr.write(f"Audio analysis warning: {e}\n")

    # 5. Generate visual contact sheet
    sys.stderr.write("Generating visual contact sheet...\n")
    # Sample every ~2 seconds or so across video length
    sample_rate = max(0.5, dur / 9.0) if dur > 0 else 1.0
    tile_cmd = [
        "ffmpeg", "-v", "error", "-y", "-i", str(video_path),
        "-vf", f"fps=1/{sample_rate:.2f},scale=360:640,tile={tiles}",
        "-frames:v", "1",
        "-q:v", "3",
        str(sheet_path),
    ]
    try:
        subprocess.run(tile_cmd, check=True)
    except Exception as e:
        sys.stderr.write(f"Contact sheet generation warning: {e}\n")

    report = {
        "source": source,
        "video": str(video_path),
        "audio": str(audio_path),
        "contact_sheet": str(sheet_path) if sheet_path.is_file() else None,
        "duration_s": round(dur, 2),
        "total_frames": total_frames,
        "width": width,
        "height": height,
        "aspect_ratio": f"{width}:{height}",
        "is_vertical_9_16": (width == 1080 and height == 1920) or (height > width * 1.5),
        "bpm": audio_analysis.get("bpm"),
        "drop_s": audio_analysis.get("drop_s"),
        "drop_frame": int(round(audio_analysis["drop_s"] * fps)) if "drop_s" in audio_analysis else None,
        "music_energy": audio_analysis.get("bands"),
        "recommended_pacing": {
            "avg_scene_duration_s": 4.5,
            "scene_count_estimate": max(3, int(round(dur / 4.5))),
            "bar_frames": audio_analysis.get("bar_frames"),
        }
    }

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    return report


def main():
    parser = argparse.ArgumentParser(description="Extract reference video, audio analysis, and visual storyboard.")
    parser.add_argument("source", help="URL or local path to reference video")
    parser.add_argument("--out-dir", type=str, default="refs/reference", help="Destination folder (default: refs/reference)")
    parser.add_argument("--fps", type=float, default=30.0, help="Target FPS (default: 30.0)")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON to stdout")

    args = parser.parse_args()

    try:
        res = pull_reference(args.source, out_dir=args.out_dir, fps=args.fps)
    except Exception as e:
        sys.stderr.write(f"Reference pull failed: {e}\n")
        sys.exit(1)

    if args.json or not sys.stdout.isatty():
        print(json.dumps(res, indent=2))
    else:
        print(f"\n🎬 Reference Pulled -> {res['video']}")
        print(f"  Duration:      {res['duration_s']}s ({res['total_frames']} frames)")
        print(f"  Aspect:        {res['width']}x{res['height']} ({'Vertical 9:16' if res['is_vertical_9_16'] else 'Horizontal/Other'})")
        print(f"  BPM:           {res.get('bpm')} (Bar = {res.get('recommended_pacing', {}).get('bar_frames')} frames)")
        if res.get("drop_frame"):
            print(f"  Music Drop:    {res['drop_s']}s (Frame {res['drop_frame']})")
        if res.get("contact_sheet"):
            print(f"  Contact Sheet: {res['contact_sheet']}")
        print(f"  Analysis JSON: {Path(args.out_dir) / 'ref_analysis.json'}\n")


if __name__ == "__main__":
    main()
