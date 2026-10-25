"""Lint Remotion source for correctness bugs and (optionally) taste regressions.

Usage:
  python scripts/lint_design.py src            # fail on errors only
  python scripts/lint_design.py src --strict   # also fail on style warnings

Errors — always fail, because these break rendering or the safe zone:
  Math.random, CSS transition/animation/@keyframes, hero block pushed below y=1260.

Warnings — taste; fail only with --strict (recommended for the premium-dark preset):
  emoji as icons, stacked text-shadows (extrude/neon), overshoot springs without damping,
  multi-turn spins, tight tracking on Ge'ez text.
"""
import pathlib
import re
import sys

EMOJI = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF\u2B50\u2B06\u2705]")
GEEZ = re.compile("[\u1200-\u137F]")


def lint(path):
    errors, warnings = [], []
    text = path.read_text(encoding="utf-8", errors="ignore")
    for n, line in enumerate(text.splitlines(), 1):
        if EMOJI.search(line) and not line.strip().startswith("//"):
            warnings.append((n, "emoji — use an SVG icon"))
        if re.search(r"textShadow\s*[:=]", line) and (line.count("px") >= 6 or "Array.from" in line):
            warnings.append((n, "stacked text-shadow (extrude/neon look)"))
        if "Math.random" in line:
            errors.append((n, "Math.random breaks determinism — use random('seed')"))
        if re.search(r"\btransition\s*:|\banimation\s*:|@keyframes", line):
            errors.append((n, "CSS transition/animation won't render — use frame math"))
        if re.search(r"spring\(\{[^}]*\}\)", line) and "damping" not in line:
            warnings.append((n, "spring without damping overshoots — prefer ease()"))
        if re.search(r"rotateY\(\$\{[^}]*\*\s*(360|720)", line):
            warnings.append((n, "multi-turn spin — use a 90–100° flip"))
        if GEEZ.search(line) and re.search(r"letterSpacing:\s*'-0\.0[2-9]", line):
            warnings.append((n, "tight tracking on Ge'ez text — use 0 to -0.01em"))
        m = re.search(r"paddingTop:\s*(\d{4})", line)
        if m and int(m.group(1)) > 1260:
            errors.append((n, f"paddingTop {m.group(1)} puts hero content in the TikTok UI zone (max 1260)"))
    return errors, warnings


def main():
    args = [a for a in sys.argv[1:] if a != "--strict"]
    strict = "--strict" in sys.argv
    root = pathlib.Path(args[0] if args else "src")
    files = sorted(root.rglob("*.ts*"))
    if not files:
        print(f"no TypeScript files found under {root}")
        return 2

    n_err = n_warn = 0
    for path in files:
        errors, warnings = lint(path)
        for n, msg in errors:
            print(f"{path}:{n}: ERROR {msg}")
        for n, msg in warnings:
            print(f"{path}:{n}: WARN  {msg}")
        n_err += len(errors)
        n_warn += len(warnings)

    print(f"{n_err} error(s), {n_warn} warning(s) in {len(files)} file(s)")
    if n_err == 0 and n_warn == 0:
        print("lint clean")
    elif n_err == 0 and not strict:
        print("lint passed (warnings are style suggestions; add --strict to enforce)")
    return 1 if n_err or (strict and n_warn) else 0


if __name__ == "__main__":
    sys.exit(main())
