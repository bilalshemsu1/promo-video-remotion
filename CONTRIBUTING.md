# Contributing

Thanks for helping. This repo is a skill plus a working Remotion starter; both are open to
improvements.

## Good first contributions

- A new **style preset** in `references/style-presets.md` (with tokens, type, motion, audio
  and one sentence on when to use it).
- A **motion recipe** that is frame-deterministic and works at 1080×1920.
- A **fix** to the starter: clipping, unsafe text, audio sync, a faster render.
- **Docs**: a prompt pattern, a troubleshooting entry, a translation of the FAQ.
- A **bug report** with the exact command, error text and environment.

## Dev setup

```bash
git clone https://github.com/bilalshemsu1/promo-video-remotion.git
cd promo-video-remotion/assets/starter-project
npm install
npm start            # studio
npm run audio        # synthesized SFX + music
npm run vo           # optional: requires edge-tts
```

Rendering:

```bash
npm run render
# if Chrome's download is blocked:
npx remotion render src/index.ts Promo out/promo.mp4 \
  --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --timeout=180000
```

## Checks before a PR

From the repository root:

```bash
npm test                                    # CLI: help, create, install, guards
node bin/cli.mjs create /tmp/promo-test     # full scaffold: npm, numpy, audio, tsc
```

Then check the starter itself:

```bash
cd assets/starter-project
npx tsc --noEmit
python ../../scripts/lint_design.py src --strict
```

Then render one still per changed scene and **look at it**. Stills catch clipping, overlaps
and unreadable type that typecheck cannot.

## Rules for scene code

- Animation is a pure function of `useCurrentFrame()`. No CSS transitions/animations, no
  `setTimeout`, no state-driven motion.
- Use `random('seed')`, not `Math.random`.
- Clamp every `interpolate` unless extrapolation is intentional.
- Keep hero text, logos and CTAs inside y 240–1260, x 80–900.
- No emoji, no neon/extruded text, no confetti, no invented statistics.
- One idea per scene. If two elements compete, delete one.

## Adding a preset

1. Add a row to the table and a section in `references/style-presets.md`:
   palette tokens, type, surfaces, motion signature, audio signature, what to avoid.
2. Make sure it answers the six "bring your own style" questions.
3. Keep the universal rules section intact.
4. If you add a demo, put the rendered file in `docs/` and reference it from the README.

## Adding a scene

A scene is a single `src/scenes/S#.tsx` file plus a row in `src/config.ts`. Reuse the kit in
`src/ui.tsx` (`Reveal`, `H`, `glass`, `Device`, `Sfx`, `VO`). Name key frames as constants at
the top. Put SFX on the exact frame of the visual hit. Register the scene in `src/Promo.tsx`.

## Media and licensing

- No third-party logos, fonts, music or footage without a license that allows redistribution.
- Keep demo assets small; don't commit `node_modules`, `out/`, or generated WAV/MP3 files.
- If a contribution needs an asset you can't license, describe it in the PR instead of
  committing it.

## PR checklist

- [ ] `tsc` clean
- [ ] lint clean (`--strict` for default-preset changes)
- [ ] stills rendered for touched scenes
- [ ] docs updated (SKILL.md, README, or references as applicable)
- [ ] no generated output, `node_modules`, or secrets committed
- [ ] new assets have a clear license note
