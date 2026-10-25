---
name: promo-video-remotion
description: Build premium vertical/social promo videos, product explainers, app-feature ads and motion-graphics clips entirely in code with Remotion (React → MP4), with selectable style presets (premium dark, editorial light, bold social, kinetic type) plus synthesized SFX, music and (Amharic or any-language) AI voiceover. Use this skill whenever the user asks for a promo video, ad video, explainer, TikTok/Reels/Shorts/Telegram video, motion graphics, animated app demo, kinetic typography, "video with code", "video like Apple ads", or hands over a scene-by-scene script/storyboard — even if they never say "Remotion". Covers the whole pipeline end to end (brief, storyboard, design tokens, scaffold, scenes, audio, verify, render, ship) plus design rules, motion recipes, audio recipes, tooling, resources, licensing, safe zones and a troubleshooting table.
---

# Promo video in code (Remotion) — end-to-end skill

Goal: turn a brief or script into a finished, good-looking MP4 that does **not** look AI-generated. The default preset is **premium-dark** — near-black canvas, huge tight type, frosted glass, a real-feeling device, one idea per scene, slow confident motion. Other directions (editorial light, bold social, kinetic type, or a custom one) are first-class: see `references/style-presets.md` and pick with the user when the brief implies a different mood.

This skill ships a **working starter project** (`assets/starter-project/`: a 45 s, 7-scene demo for a fictional "Adly" messenger ad bot). The starter is one example, not the house style. Never start from a blank folder: scaffold it, then replace the content, brand and — if the brief asks — the preset. Every recipe below already exists in it.

## 0. Where to look

| Need | File |
|---|---|
| Style presets: colors, type, motion, audio per direction | `references/style-presets.md` |
| Design rules, tokens, anti-AI checklist, copy rules | `references/design-system.md` |
| Motion code recipes (easing, reveal, touch path, counters, physics, 3D) | `references/motion-recipes.md` |
| SFX / music / voiceover / mixing | `references/audio.md` |
| Stack, install, render flags, Windows notes, troubleshooting, alternatives | `references/tooling-and-troubleshooting.md` |
| Brief intake, storyboard table, QA + delivery checklists | `references/storyboard-and-qa.md` |
| Fonts, icons, music, inspiration, docs, licensing | `references/resources.md` |

## 1. Environment reality (decide before promising anything)

1. **Can this environment render?** Try `npx remotion still src/index.ts <CompId> out/t.png --frame=60`. Remotion downloads a headless Chrome on first use. Sandboxes with a network allow-list can block that download. If it fails: typecheck with `npx tsc --noEmit`, ship the project as a zip, and tell the user to render locally. Never claim the video was visually verified.
2. **If it CAN render**, render a still per scene (frame = scene start + ~60 % of its length) and *view the PNGs*. This is the biggest quality lever — fix overlap, clipping, unreadable text and off-center layouts before delivering.
3. If the user is on **Windows**: give commands that work in PowerShell/CMD (`python` may be `py`; Ctrl+C stops servers).
4. The first local render is slow (Chrome download ~1 min + bundling 1–2 min). Say so.

## 2. Workflow

### Phase A — Intake (ask only what is missing; otherwise use defaults)
Platform + aspect (default 9:16, 1080×1920, 30 fps) · length (default ≤45 s) · VO and on-screen language · product/brand name, logo, colors, handle/URL, CTA · viewer · tone · reference videos · style direction (default `premium-dark`) · music/VO preference. If the user pasted a script, **keep their copy and timings**; add only what design needs and say what you added. Details: `references/storyboard-and-qa.md`.

### Phase B — Storyboard table
Table: time · purpose · visual · on-screen text · VO · SFX. One idea per scene, 3–7 s per scene, ≤7 scenes for 45 s. If the user said "build it", build; don't stall on approvals.

### Phase C — Design direction (write it into `src/theme.ts`)
Choose a preset from `references/style-presets.md` — `premium-dark` (default), `editorial-light`, `bold-social`, `kinetic-type`, or a custom direction built from the six questions in that file. Then write the tokens: canvas + ink, 1 brand color, 1 button accent, type family and scale, surface language (glass / paper / blocks), easing. For `premium-dark`: near-black navy, white type, Inter 700 headlines (tracking −0.045em), Noto Sans Ethiopic or the script's font for non-Latin. Rules: `references/design-system.md`; run the anti-AI checklist **before** coding. State the chosen preset in the project README.

### Phase D — Scaffold
```bash
bash scripts/scaffold.sh <dest-folder>          # macOS / Linux / WSL / Git-Bash
powershell -File scripts/scaffold.ps1 <dest>    # Windows
```
Copies the starter, installs deps, generates SFX + music, typechecks. Then rename the composition (`Root.tsx`, `package.json` render script), edit `src/config.ts` (scene ids, start, length), `src/theme.ts`, and replace scene files.

### Phase E — Build scenes (`src/scenes/S#.tsx`, one file per scene)
Per scene: key-frame constants at the top → absolute layout on 1080×1920 → motion via `ease()` / `Reveal` → SFX cues → `<VO id="s#"/>`. Use the shared kit in `src/ui.tsx` (`Bg, Reveal, H, StepPill, glass, Device, Touch, Ripple, AppIcon, icons, AdCard, Sfx, VO`).

Hard rules (Remotion renders frame by frame):
- Animation = pure function of `useCurrentFrame()`. **No** CSS `transition`/`animation`, `setTimeout`, `Math.random()` (use `random("seed")`), or state-driven animation.
- Frames inside a `<Sequence>` are **local** (start at 0). SFX `at` values are local frames.
- `clamp` every `interpolate` unless extrapolation is intended.
- Fonts via `@remotion/google-fonts`; images via `<Img src={staticFile()}>`; no remote URLs at render time unless wrapped in `delayRender`.
- No emoji (render machine may lack a color-emoji font; they also look cheap). Use SVG icons.
- Hooks inside `.map()` only when the array length is constant.
- Hero content inside the safe zone (§4).

### Phase F — Audio
`npm run audio` (synth SFX + 120 BPM music bed, no downloads) and `npm run vo` (edge-tts). Put each SFX on the exact frame of its visual hit. Levels: music 0.3, VO 1.0, SFX 0.3–0.9. Details: `references/audio.md`.

### Phase G — Verify
1. `npx tsc --noEmit` clean.
2. `python scripts/lint_design.py src` clean — must-fix errors only (determinism, render-breaking CSS, unsafe hero text). Add `--strict` when using `premium-dark` to also fail on taste warnings (emoji, stacked shadows, overshoot springs, big spins).
3. Stills of every scene if renderable.
4. QA checklist in `references/storyboard-and-qa.md`.
5. VO length vs scene length.

### Phase H — Deliver
Zip the project **without** `node_modules` and `out`; present the zip. In ≤10 lines tell the user: run steps (`npm install` → `npm start` → `npm run vo` → `npm run render`), close Studio before rendering, what is a placeholder, known risks (safe zones, VO overrun, emoji fonts), and the licensing note (§5).

### Phase I — Iterate
Feedback names a scene → edit only that scene (+ `config.ts` if timing changes). Re-sync audio cues after any retime. Re-run Phase G for touched scenes.

## 3. Default preset: premium-dark (the "not AI-looking" rules)

These are the rules for the default preset. Other presets change palette, type and pacing
(see `references/style-presets.md`) but keep the universal rules at the end of that file.

- **One idea per scene**, one hero element, lots of empty black. Before shipping, remove one decoration.
- **Type is the design**: 150–200 px headlines, weight 700, tracking −0.045em, line-height ≈1.02, sentence case, headlines end with a period ("Forward."). ≤7 words.
- **Easing**: expo-out `Easing.bezier(0.16, 1, 0.3, 1)` for nearly everything. Overshoot springs only for tiny UI pops. Reveal = fade + 40 px rise + blur 16→0.
- **Materials**: frosted glass (blur 40, 8–12 % white, 1.5 px inner highlight), titanium device frame, squircle app icon (radius 22.37 %), layered soft shadows.
- **Depth**: blur + scale for far/near layers, slow 3D tilt that settles, devices bleeding off-frame.
- **Color**: dark navy canvas, brand-blue glow, white text, ONE vibrant accent (lime/orange) reserved for the CTA button.
- **Never**: neon text-shadows, extruded 3D text, emoji, cartoon faces, confetti, rainbow gradients, bouncy overshoot everywhere, identical card grids, hard cuts with no motivation.

Full list and fixes: `references/design-system.md`.

## 4. Platform specs & safe zones (9:16)

- Export **1080×1920, 30 fps, H.264 MP4**; ≈4–6 Mbps is plenty because TikTok re-encodes everything. Scenes 3–5 s; ads ≤45 s.
- TikTok does not publish one pixel-perfect safe zone; it depends on caption length and format, and sources disagree. Conservative rule: for **ads**, TikTok's own template scaled to 1080×1920 ≈ top 240 / bottom 660 / sides 120, with a ≈300 px right button column; for **organic**, estimates are top ≈130–150, bottom ≈300–480, right ≈120–150.
- Working rule: hero text, logos and CTA text between **y 240 → 1260** and **x 80 → 900**. Decorative elements may bleed. An arrow that deliberately points *into* the caption area is fine; the CTA text itself must not live there.
- Re-check against TikTok's official safe-zone template files (Ads Help Center); numbers change.
- Reels/Shorts reserve even more at the bottom (≈670 px): when cross-posting keep key content above y ≈1250.

## 5. Legal / licensing (mention once, briefly)

- **Remotion is free for individuals and for-profit companies with up to 3 employees; 4+ people (combined headcount of collaborating teams) need a Company License** (remotion.pro). Raise it when the user works with a team or agency.
- Audio: synthesized files are yours. Stock audio: read each license. TikTok business accounts are restricted to its commercial music library (verify current rules).
- Fonts: Inter and Noto are open (OFL). **Do not use Apple's SF Pro / SF Symbols** outside Apple platforms and never use Apple logos or trademarked device imagery. "Apple-style" is a design language; the device mockup stays generic.
- Third-party brand logos (banks, messengers, payment providers): use official press-kit assets only when permitted; mark placeholders clearly until then.

## 6. Lessons already paid for (don't repeat)

1. First draft used neon glow, extruded 3D text, emoji, smileys, confetti and springy bounces → user: "looks AI generated". Fix = §3.
2. `npm run render` failed with "not a valid Remotion project … localhost:3000" because **Studio was running on port 3000**. Stop Studio first; the render script also pins `--port=3456`.
3. The sandbox could not render (Chrome download blocked) → typecheck + zip + honest "not visually verified".
4. edge-tts VO can outrun a scene; the long scene-6 line (8 s) is the usual offender. Check durations after `npm run vo`.
5. Missing audio files → Remotion 404. The VO **manifest** (`public/audio/vo/manifest.json`) plays VO only for generated lines.
6. TikTok UI covers the bottom ~25–35 %: keep CTA text and critical labels above y=1260. The starter's "Your ad is live" pill sits at y≈1130; decorative props may bleed lower, but move any label you depend on.
7. The starter's payment badges are placeholders: always list placeholders at delivery.
8. Keep delivery messages short: the file, run steps, placeholders and risks in ≤10 lines.

## 7. Definition of done

☐ `tsc` clean ☐ lint clean ☐ one clear hero per scene ☐ on-screen text matches VO ☐ every SFX lands on a visual hit ☐ music ends on a beat at the last frame ☐ nothing important in unsafe zones ☐ placeholders listed ☐ README updated ☐ zip has no `node_modules`/`out` ☐ delivery message ≤10 lines.
