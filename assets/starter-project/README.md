# Starter promo — 1080×1920, 30 fps, 45 s

A working 7-scene demo for **Adly**, a fictional messenger ad bot. Every brand, handle,
URL and payment badge here is a placeholder — replace them with your client's.

```bash
npm install
npm start                            # live preview (Remotion Studio, port 3000)
pip install edge-tts && npm run vo   # voiceover → public/audio/vo
npm run render                       # → out/promo.mp4
```

- **Close Studio (Ctrl+C) before `npm run render`** to avoid port clashes.
- SFX + music are generated (`npm run audio` regenerates them).
- No VO yet? It renders fine without; VO plays only for scenes listed in
  `public/audio/vo/manifest.json`.
- Voiceover language: `VO_LANGUAGE=en` (default) or `am`; voice override `VO_VOICE=…`.
- Own recording: drop `s1.mp3 … s7.mp3` in `public/audio/vo/` and set
  `{"s1":true,...}` in `manifest.json`.
- Retime scenes: `src/config.ts`. Colors/fonts: `src/theme.ts`. Shared look: `src/ui.tsx`.
- Preset: this starter uses **premium-dark** (see `references/style-presets.md` in the
  skill folder). Change the preset when the brief calls for another direction.
- Payment badges in `src/scenes/S5.tsx` are placeholders — swap for official logos you
  have permission to use.
- Composition id is `Promo`. Rename it in `src/Root.tsx` and in the `render` script of
  `package.json` when you start a new project.
