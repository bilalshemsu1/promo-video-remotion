# Quickstart — from install to first MP4

This guide assumes no video-editing experience. You need a terminal once; after that you
talk to your agent.

## 1. Check your machine

```bash
node --version     # 18 or newer
python --version   # 3.9 or newer (Windows: py --version)
```

From the skill folder you can run the guided check:

```bash
python scripts/doctor.py
```

Optional extras: `pip install edge-tts` for voiceover, `ffmpeg -version` for loudness
normalization and GIF previews. Both can wait.

## 2. Install the skill

The skill is the folder containing `SKILL.md`. Copy it (or symlink it) into your agent's
skills directory:

```bash
# Qoder
cp -r promo-video-remotion ~/.qoder/skills/

# Claude Code
cp -r promo-video-remotion ~/.claude/skills/
```

On Windows, use File Explorer or:

```powershell
Copy-Item -Recurse promo-video-remotion "$HOME\.qoder\skills\"
```

Restart the agent if it caches skills. Ask "what does the promo-video-remotion skill do?"
to confirm it is loaded.

## 3. Ask for a video

Give the agent a brief, not a command. It will fill gaps with defaults and ask only what
it cannot guess.

> Use the promo-video-remotion skill to make a **30-second vertical ad** for **Nile Coffee**.
> Audience: specialty coffee buyers in Addis. Tone: warm, calm, editorial. **Editorial light**
> preset. Show a bag, a pour, and a delivery box. On-screen line: "Order fresh." CTA:
> nilecoffee.com. **Amharic voiceover**, female. 9:16.

What it should do next:

1. Repeat the brief as a short storyboard (time, visual, text, voiceover, SFX).
2. Scaffold a project folder next to the skill (or wherever you ask).
3. Write the scenes and design tokens.
4. Generate SFX/music, then the voiceover.
5. Render one still per scene, inspect them, fix clipping/overlap.
6. Render the MP4 and give you the path plus any placeholders.

## 4. Preview and render

```bash
cd <project-folder>
npm start          # Remotion Studio at http://localhost:3000 — scrub the timeline
```

When it looks right, stop Studio (Ctrl+C) and:

```bash
npm run render     # → out/promo.mp4, 1080×1920, 30 fps, H.264
```

First render downloads a headless Chrome (~120 MB) and takes a minute or two. Later
renders are faster.

## 5. Iterate

You do not redo the project. Name the scene and the change:

- "Scene 2: headline is clipped on the right — shorten it or reduce to 150 px."
- "Move the CTA above y=1260; TikTok's caption covers it."
- "Switch the whole video to bold-social, keep the copy."
- "Cut the voiceover and let the music carry it."
- "Make it 20 seconds and drop scene 5."

The agent edits `src/config.ts`, `src/theme.ts` or one scene file, then re-renders.

## 6. Ship it

- Export: 1080×1920, 30 fps, H.264, 4–6 Mbps is plenty.
- Keep hero text, logos and CTA between **y 240–1260** and **x 80–900**.
- Reels/Shorts reserve more at the bottom: keep key content above y ≈1250 when cross-posting.
- Watch once with sound and once muted. Check VO length, SFX sync, and that no placeholder
  name or logo remains.
- Loudness (optional): `ffmpeg -i out/promo.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy out/final.mp4`.

## If rendering is blocked

Some sandboxes have no outbound network, so Remotion cannot download its headless Chrome.
The agent should then typecheck (`npx tsc --noEmit`), zip the project without `node_modules`
and `out`, and tell you to render locally. That is expected, not a failure.

## Windows notes

- Use PowerShell; `python` may be `py`.
- Stop Studio with Ctrl+C before rendering.
- If Chrome is already installed, pass
  `--browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"`.
- If fonts time out on first run, add `--timeout=180000`.

## Removing the skill

Delete the folder from your skills directory. Projects you already rendered or scaffolded
are independent — they are plain Remotion projects.
