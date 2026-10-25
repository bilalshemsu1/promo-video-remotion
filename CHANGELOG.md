# Changelog

All notable changes to this skill. Dates are ISO.

## [1.2.0] — 2026-10-25

### Added
- `bin/cli.mjs`: a zero-dependency CLI with three commands.
  - `create <dir>` scaffolds the starter, runs `npm install`, installs numpy,
    synthesizes SFX/music and typechecks. Flags: `--skip-install`, `--force`.
  - `install [--agent qoder|claude] [--project] [--force]` copies the skill into an
    agent skills folder, leaving out the demo video and generated audio.
  - `doctor` runs the environment check.
- `test/cli.test.mjs` (`npm test`): help/version, unknown command, scaffold filters,
  overwrite guards and both install destinations.
- Root `package.json` for npm distribution (`npx promo-video-remotion`, global install)
  with a `files` whitelist, Node >= 18 engine and public publish config.
- `.github/workflows/publish.yml`: publishes on version tags with provenance when
  `NPM_TOKEN` is set.

### Changed
- README and QUICKSTART document the CLI path; demo media uses absolute GitHub URLs so the
  npm README renders correctly (the video and GIF are excluded from the package).
- `install` keeps the skill folder small by skipping `*.mp4`, `*.gif`, `node_modules`,
  `out` and generated audio.
- README documents the upstream `zod` advisory carried by Remotion's Studio packages and the
  override trade-off.

## [1.1.0] — 2026-10-24

### Added
- `references/style-presets.md`: four directions — `premium-dark` (default), `editorial-light`,
  `bold-social`, `kinetic-type` — plus a "bring your own style" checklist and universal rules.
- `scripts/doctor.py` to check Node, Python, numpy, edge-tts, ffmpeg and Chrome.
- Public docs: quickstart, prompting guide, FAQ, contributing guide, CI workflow.

### Changed
- `SKILL.md`: style is now a chosen preset, not a single mandated look; Phase C, Phase G and
  the delivery message reflect that. Starter described as one example, not the house style.
- `lint_design.py`: correctness errors (determinism, render-breaking CSS, unsafe hero text)
  fail by default; taste checks (emoji, stacked shadows, overshoot springs, big spins, tight
  Ge'ez tracking) warn, and fail only with `--strict`.
- Starter de-branded: composition `TeleAds` → `Promo`, demo brand → fictional **Adly**,
  payment badges → generic Wallet/Bank, package/output names neutralized.
- `vo.py`: English default with `VO_LANGUAGE=en|am` and `VO_VOICE` override; Amharic sample
  retained.
- `design-system.md`: Telegram-specific theme tokens replaced with a generic dark-UI example.

### Fixed
- S2 headline no longer clips at the frame edges.
- S5 "Your ad is live" pill moved above the TikTok caption zone (y≈1130).

## [1.0.0] — 2026-10-24

### Added
- Initial release: 45 s, 7-scene Remotion starter, workflow, design system, motion recipes,
  synthesized SFX/music, edge-tts voiceover, safe-zone rules, QA checklist, render tooling.
