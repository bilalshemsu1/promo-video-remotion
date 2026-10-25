# FAQ

**How do I install it?**
Two pieces, one command each: `npx github:bilalshemsu1/promo-video-remotion create my-promo`
makes a project, and `npx github:bilalshemsu1/promo-video-remotion install` copies the skill
into `~/.qoder/skills/` (or `~/.claude/skills/` with `--agent claude`, or the current repo
with `--project`). You can also copy the folder by hand. The package currently installs from
GitHub; once it is published, the shorter `npx promo-video-remotion` form works too.

**Do I need to know React or Remotion?**
No to make a video: you give a brief and the agent writes the scenes. Yes if you want to
hand-edit deeply — the output is a normal Remotion project in TypeScript, so React knowledge
helps when changing layout or animation code.

**Will every video look the same?**
No. The default preset is `premium-dark`, so a vague request drifts toward that look, but
the skill ships four presets and supports custom directions. Say the style you want, or
send a reference — palette, type, pacing and audio all change, not just colors.

**Can I customize with a prompt?**
Yes. The agent edits `src/theme.ts`, `src/config.ts` and the scene files from plain-language
feedback, then re-renders. "Scene 3 is clipped", "switch to editorial-light", "cut the VO"
are all valid changes. It is not a fixed template with slots; the scenes are code.

**Is the starter the only example?**
It is the only fully built one, and it is a specific demo (a messenger ad bot). Use it as a
working reference for structure and timing, then replace the story, brand and assets.
`docs/PROMPTING.md` has briefs for other categories.

**Does it need API keys or paid services?**
No. Remotion runs locally; SFX and music are synthesized with numpy; voiceover uses
`edge-tts`, which is free and keyless but needs internet. Everything else works offline
after the initial npm/Chrome download.

**What does it cost?**
The skill is MIT. Remotion itself is free for individuals and companies with up to three
employees; larger teams need a Company License ([remotion.pro](https://www.remotion.pro/)).
`edge-tts` is GPL-3.0 and free. No stock subscriptions are required.

**Can I use the videos commercially?**
Yes, subject to the licenses of what you put in them: Remotion's terms, fonts, music,
footage, voice, and any brand you feature. The synthesized audio and your own assets are
yours to use.

**What resolution and format does it produce?**
1080×1920, 30 fps, H.264 MP4 by default. 9:16 is the default because the workflow targets
TikTok/Reels/Shorts; other aspects are possible by changing the composition and layout —
the safe-zone and typography rules are written for 9:16, so expect layout work for 16:9.

**How long should the video be?**
3–7 seconds per scene, ≤7 scenes for 45 seconds. Ads perform better short; the skill
defaults to ≤45 s and will tell you when a voiceover line overruns its scene.

**Which languages are supported?**
Any language the chosen TTS voice supports, plus any script you can load a font for.
English and Amharic are wired in (`VO_LANGUAGE=en|am`). For other languages, set `VO_VOICE`
to an edge-tts voice and load the matching Noto font.

**Can I use my own footage, logo and screenshots?**
Yes. Put them in `public/`, reference them with `<Img src={staticFile(...)}>`, and tell the
agent which scene uses what. Never ask it to recreate a third-party logo from memory.

**Windows?**
Supported. Use PowerShell; `python` may be `py`. If Chrome's download is blocked, pass
`--browser-executable`. If fonts time out on first run, add `--timeout=180000`.

**Rendering is blocked in my sandbox. What now?**
Some environments have no outbound network, so Remotion cannot fetch its headless Chrome.
The agent should typecheck, zip the project without `node_modules`/`out`, and tell you to
render locally. That limitation is real; don't accept a claim that the video was visually
verified when it wasn't.

**Can I edit the video afterwards?**
Yes — the project is a normal Remotion project. `npm start` opens a live preview where you
can scrub, tweak code and re-render. You can also take the MP4 into any editor, though
re-rendering from code keeps the type crisp.

**Does it work with my agent?**
It is a standard skill folder with `SKILL.md`. Qoder and Claude Code read it from their
skills directories; other agents can be pointed at `SKILL.md` as instructions.

**Why code instead of CapCut or After Effects?**
Deterministic typography, exact frame control, reusable brand systems, no subscription,
and diffs you can review. The tradeoff is that editing means changing code — which the
agent does for you.

**Can I contribute a preset or a scene?**
Yes. See [CONTRIBUTING.md](../CONTRIBUTING.md).
