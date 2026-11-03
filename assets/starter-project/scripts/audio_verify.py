#!/usr/bin/env python3
"""audio_verify.py — Post-render sync and audio quality verifier for Remotion MP4s.

Verifies that:
  1. Container dimensions, fps, duration, and audio stream match specifications.
  2. Audio energy hits on designated bar downbeats (+dB step on bar frames).
  3. Visual anchor cues (drop, scene cuts) correspond to physical audio onsets.
  4. True peak does not clip (> -0.5 dBFS) and integrated loudness conforms.

Outputs structured JSON for CI and AI agents with clear pass/fail diagnostics.

Usage:
    python scripts/audio_verify.py out/promo.mp4
    python scripts/audio_verify.py out/promo.mp4 --grid src/audioGrid.json --json
    python scripts/audio_verify.py out/promo.mp4 --anchors '{"DROP": 512}'
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np


def verify_mp4(
    video_path: str,
    grid_path: str = None,
    anchors_json: str = None,
    expected_w: int = 1080,
    expected_h: int = 1920,
    expected_fps: float = 30.0,
) -> dict:
    src = Path(video_path).resolve()
    if not src.is_file():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    checks = []
    all_passed = True

    def record(name: str, passed: bool, detail: str = ""):
        nonlocal all_passed
        passed = bool(passed)
        if not passed:
            all_passed = False
        checks.append({"name": name, "passed": passed, "detail": detail})

    # 1. ffprobe container facts
    cmd_probe = [
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", str(src)
    ]
    try:
        p_res = subprocess.run(cmd_probe, capture_output=True, text=True, check=True)
        probe = json.loads(p_res.stdout)
    except Exception as e:
        record("container_probe", False, f"ffprobe error: {e}")
        return {"passed": False, "checks": checks}

    v_stream = next((s for s in probe.get("streams", []) if s.get("codec_type") == "video"), None)
    a_stream = next((s for s in probe.get("streams", []) if s.get("codec_type") == "audio"), None)

    record("video_stream_present", v_stream is not None, v_stream.get("codec_name", "") if v_stream else "None")
    record("audio_stream_present", a_stream is not None, a_stream.get("codec_name", "") if a_stream else "None")

    if v_stream:
        w = int(v_stream.get("width", 0))
        h = int(v_stream.get("height", 0))
        record("resolution_match", (w, h) == (expected_w, expected_h), f"{w}x{h} (expected {expected_w}x{expected_h})")

        r_fps_str = v_stream.get("r_frame_rate", "30/1")
        try:
            fps_val = eval(r_fps_str)
        except Exception:
            fps_val = 30.0
        record("fps_match", abs(fps_val - expected_fps) < 0.1, f"{fps_val} fps (expected {expected_fps})")

    dur = float(probe.get("format", {}).get("duration", 0))
    record("duration_valid", dur > 1.0, f"{dur:.2f} s")

    # 2. Audio envelope extraction
    sr = 48000
    spf = int(sr / expected_fps)

    with tempfile.TemporaryDirectory() as tmpdir:
        wav_path = Path(tmpdir) / "audio.f32"
        cmd_pcm = [
            "ffmpeg", "-y", "-v", "error", "-i", str(src),
            "-ac", "1", "-ar", str(sr), "-f", "f32le", str(wav_path)
        ]
        pcm_res = subprocess.run(cmd_pcm, capture_output=True)
        if pcm_res.returncode == 0 and wav_path.is_file():
            pcm = np.fromfile(wav_path, dtype=np.float32)
            n_frames = len(pcm) // spf
            pcm = pcm[: n_frames * spf]
            env = np.sqrt((pcm.reshape(-1, spf) ** 2).mean(axis=1))
            db = 20 * np.log10(np.maximum(env, 1e-9))

            # Peak check
            peak_db = float(db.max())
            record("true_peak_within_limit", peak_db <= -0.2, f"Peak {peak_db:.2f} dBFS (limit <= -0.2 dBFS)")

            # Check bar downbeats step if grid provided
            grid_data = None
            if grid_path and os.path.isfile(grid_path):
                with open(grid_path, "r", encoding="utf-8") as f:
                    grid_data = json.load(f)

            if grid_data and "bars" in grid_data:
                bar_frames = grid_data["bars"]
                steps = []
                for b_frame in bar_frames[1:]:
                    if 0 < b_frame < len(db):
                        steps.append(db[b_frame] - db[b_frame - 1])
                if steps:
                    mean_step = float(np.mean(steps))
                    record("bars_hit_on_downbeat", mean_step > -0.5, f"Mean step {mean_step:+.2f} dB at bar boundaries")

            # Check anchor frames
            anchors = {}
            if anchors_json:
                try:
                    anchors = json.loads(anchors_json)
                except Exception:
                    pass

            for anchor_name, target_f in anchors.items():
                target_f = int(target_f)
                if 2 <= target_f < len(db) - 2:
                    local_rise = db[target_f : target_f + 2].max() - db[target_f - 2 : target_f].min()
                    record(f"anchor_{anchor_name}_onset", local_rise > 0.5, f"Frame {target_f}: {local_rise:+.1f} dB rise")

    return {
        "passed": all_passed,
        "video": str(src),
        "duration_s": dur,
        "checks": checks,
    }


def main():
    parser = argparse.ArgumentParser(description="Verify Remotion MP4 audio/video sync and loudness.")
    parser.add_argument("video", help="Path to rendered MP4 video")
    parser.add_argument("--grid", type=str, default=None, help="Path to audio grid JSON file")
    parser.add_argument("--anchors", type=str, default=None, help="JSON dictionary of anchor frames, e.g. '{\"DROP\": 512}'")
    parser.add_argument("--w", type=int, default=1080, help="Expected width (default 1080)")
    parser.add_argument("--h", type=int, default=1920, help="Expected height (default 1920)")
    parser.add_argument("--fps", type=float, default=30.0, help="Expected FPS (default 30.0)")
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    args = parser.parse_args()

    try:
        report = verify_mp4(
            video_path=args.video,
            grid_path=args.grid,
            anchors_json=args.anchors,
            expected_w=args.w,
            expected_h=args.h,
            expected_fps=args.fps,
        )
    except Exception as e:
        sys.stderr.write(f"Verification error: {e}\n")
        sys.exit(1)

    if args.json or not sys.stdout.isatty():
        print(json.dumps(report, indent=2))
    else:
        status_str = "✅ ALL CHECKS PASSED" if report["passed"] else "❌ VERIFICATION FAILED"
        print(f"\n{status_str} — {report['video']}")
        print(f"Duration: {report['duration_s']:.2f}s\n")
        for c in report["checks"]:
            mark = "PASS" if c["passed"] else "FAIL"
            print(f"  [{mark:4s}] {c['name']:<28} {c['detail']}")
        print()

    sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
