"""Check the local toolchain for promo-video-remotion.

Usage: python scripts/doctor.py
Prints OK / MISSING for each dependency with a fix command. Exit 1 only when Node or
Python is missing; optional tools never fail the check.
"""
import pathlib
import shutil
import subprocess
import sys


def run(cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    except Exception:
        return None


def version(*cmd):
    r = run(list(cmd))
    if not r or r.returncode != 0:
        return None
    return (r.stdout or r.stderr).strip().splitlines()[0]


def main():
    rows = []

    node = shutil.which("node")
    rows.append(("Node 18+", bool(node), version("node", "--version"),
                 "install from nodejs.org (LTS)"))
    npm = shutil.which("npm")
    rows.append(("npm", bool(npm), version("npm", "--version") or ("installed" if npm else None), "ships with Node.js"))

    py = shutil.which("python3") or shutil.which("python") or shutil.which("py")
    pyver = version(py, "--version") if py else None
    rows.append(("Python 3.9+", bool(py), pyver, "install from python.org; on Windows use py"))

    numpy_ok = False
    if py:
        r = run([py, "-c", "import numpy; print(numpy.__version__)"])
        numpy_ok = bool(r and r.returncode == 0)
        rows.append(("numpy", numpy_ok, (r.stdout.strip() if numpy_ok else None),
                     f"{py} -m pip install numpy"))
    else:
        rows.append(("numpy", False, None, "install Python first"))

    edge_ok = False
    if py:
        r = run([py, "-c", "import edge_tts; print(getattr(edge_tts, '__version__', 'installed'))"])
        edge_ok = bool(r and r.returncode == 0)
        rows.append(("edge-tts (optional, VO)", edge_ok, (r.stdout.strip() if edge_ok else None),
                     f"{py} -m pip install edge-tts"))

    ff = shutil.which("ffmpeg")
    rows.append(("ffmpeg (optional, loudness/GIF)", bool(ff), version("ffmpeg", "-version"),
                 "install ffmpeg and add it to PATH"))

    chrome = None
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        shutil.which("google-chrome"),
        shutil.which("chromium"),
    ]
    for c in candidates:
        if c and (shutil.which(c) or pathlib.Path(c).exists()):
            chrome = c
            break
    rows.append(("Chrome (optional)", bool(chrome), chrome,
                 "Remotion downloads its own; pass --browser-executable if blocked"))

    width = max(len(r[0]) for r in rows)
    print("promo-video-remotion - environment check\n")
    for name, ok, detail, fix in rows:
        mark = "OK  " if ok else "MISS"
        print(f"  [{mark}] {name.ljust(width)}  {detail or ''}")
        if not ok:
            print(f"         -> {fix}")

    print("\nRequired for a render: Node, npm. Required for audio: Python + numpy.")
    print("Optional: edge-tts (voiceover), ffmpeg (post), Chrome (skip download).")
    return 0 if node and py else 1


if __name__ == "__main__":
    sys.exit(main())
