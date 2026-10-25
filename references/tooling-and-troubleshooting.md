# Tooling, commands, troubleshooting

## Contents
1. Stack 2. Install (Windows / macOS / Linux) 3. Project commands 4. Render flags 5. Studio tips 6. Troubleshooting table 7. Sandbox constraints 8. Alternatives & when to switch 9. Post-processing 10. Upload

## 1. Stack
| Layer | Tool | Why |
|---|---|---|
| Video engine | **Remotion 4.x** (`remotion`, `@remotion/cli`) | React components → frames → MP4; deterministic, versionable |
| Language | TypeScript + React 18/19 | Typecheck catches layout/prop errors without rendering |
| Fonts | `@remotion/google-fonts` (Inter, Noto Sans Ethiopic) | No manual font files; loads at render |
| Audio synth | Python 3 + numpy | SFX + music without downloads |
| Voiceover | `edge-tts` (Python) | Free Amharic/other-language neural voices |
| Post | ffmpeg (optional) | Loudness, trims, GIF, re-encode |
| Editor | VS Code | Remotion Studio hot-reloads on save |
| Optional | `@remotion/three` (3D), `@remotion/lottie`, `@remotion/media-utils` | Real 3D, Lottie files, audio waveforms/durations |

## 2. Install
- Node.js ≥ 18 (22 LTS fine): nodejs.org. Python 3.9+ : python.org (Windows: tick "Add to PATH"; the launcher may be `py`).
- `pip install numpy edge-tts` (Windows: `py -m pip install numpy edge-tts`).
- ffmpeg optional: `winget install ffmpeg` · `brew install ffmpeg` · `apt install ffmpeg`.
- Remotion bundles its own ffmpeg/compositor; you don't need system ffmpeg to render.

## 3. Project commands (starter `package.json`)
```
npm install
npm start                 # Remotion Studio at http://localhost:3000
npm run audio             # synth SFX + music → public/audio
npm run vo                # edge-tts voiceover → public/audio/vo (+ manifest.json)
npm run render            # out/promo.mp4  (uses --port=3456)
npx tsc --noEmit          # typecheck
npx remotion still src/index.ts Promo out/s3.png --frame=330   # one frame
```

## 4. Render flags worth knowing
`--codec=h264` (default) · `--crf=18` (quality; lower = bigger) · `--concurrency=2` (less RAM/CPU) · `--scale=0.5` (draft) · `--frames=0-149` (partial) · `--port=3456` (avoid Studio clash) · `--gl=angle` (try if GPU effects glitch) · `--log=verbose` · `--props='{"x":1}'` · `--browser-executable=<path>` (use an existing Chrome) · `--muted` (silent). ProRes/GIF/WebM also supported by codec flag.

## 5. Studio tips
Scrub the timeline for frame-accurate review; press `Space` to play; the right panel shows props; `Ctrl+C` in the terminal stops it. Keep the safe-zone overlay in mind (toggle guides in the canvas menu) — add your own overlay component while designing: a semi-transparent rectangle at y<240 and y>1260.

## 6. Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| `Error while getting compositions … localhost:3000 … not a valid Remotion project` | Studio (or another app) occupies port 3000 | Ctrl+C Studio; render with `--port=3456` |
| First render "Downloading Chrome Headless Shell…" takes minutes | One-time download + bundle cache | Wait; later renders are fast |
| `getaddrinfo ENOTFOUND remotion.media` / Chrome download fails | Offline or network allow-list | Run on a machine with internet or pass `--browser-executable` to local Chrome |
| Fonts look wrong / tofu boxes (□) | Font not loaded or glyphs missing | Check `loadFont` subsets include `ethiopic`; put Latin font first, script font second |
| Emoji missing | No color-emoji font on render machine | Don't use emoji; use SVG |
| 404 / "Could not play audio" | Audio file missing | Run `npm run audio`/`vo`; use manifest guard |
| VO overlaps next scene | VO longer than scene | Raise `--rate`, shorten text, lengthen scene |
| `Cannot find module '…manifest.json'` | `resolveJsonModule` off or file missing | Keep `tsconfig` option; keep `public/audio/vo/manifest.json` (`{}`) |
| Render extremely slow | Heavy blur/backdrop-filter | See motion-recipes §17 |
| Animation jitter/jumps | Used CSS transitions or `Math.random` | Make everything a function of `useCurrentFrame` |
| Element invisible | Hook delay negative / clamp missing / wrong local frame | Remember Sequence-local frames |
| `python` not found (Windows) | Launcher name | `py scripts/make_audio.py` |
| Chrome crashes (out of memory) | Too much concurrency | `--concurrency=1` |
| Studio blank white | Compile error | Read the terminal; fix TS error |

## 7. Sandbox constraints (network allow-lists)
Allow-listed domains only (npm, PyPI, GitHub). Chrome Headless Shell comes from other hosts → **cannot render**. edge-tts needs Microsoft endpoints → **cannot generate VO**. `pip install cairosvg` works and can rasterize standalone SVG (logo/path checks). So: write code, `tsc`, generate SFX/music with numpy, ship the zip, let the user render + run VO locally.

## 8. Alternatives & when to switch
| Tool | Use when |
|---|---|
| After Effects / Blender | You need true 3D, particle sims, camera paths; budget for manual work |
| CapCut / DaVinci Resolve / Premiere | Cutting live footage, captions, quick edits; import the Remotion MP4 as a clip |
| Figma + Rive/Lottie | Reusable UI animation assets; import Lottie via `@remotion/lottie` |
| Motion (motion.dev connector) | Fast prompt-to-video drafts; less control than code |
| Remotion Lambda / Cloud Run | Batch/parallel renders at scale (AWS cost; license applies) |
| HTML + GSAP + Puppeteer + ffmpeg | Tiny projects, no Remotion license question; more manual frame capture |

## 9. Post-processing
```bash
ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy out.mp4          # loudness
ffmpeg -i in.mp4 -ss 0 -t 15 -c copy cut.mp4                                    # trim
ffmpeg -i in.mp4 -vf "fps=15,scale=480:-1" -loop 0 preview.gif                  # GIF preview
ffmpeg -i in.mp4 -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k final.mp4
```
`yuv420p` is required for broad playback compatibility.

## 10. Upload
TikTok/Reels/Shorts: MP4 H.264 AAC, 1080×1920. Add a caption (short — long captions grow the covered area), cover frame from a scene with a clean headline inside the safe zone, hashtags in caption not on video. Keep a 15 s cut for Reels/Stories if needed (`--frames=`).
