# Changelog

All notable changes to this skill. Dates are ISO.

## [1.3.0] — 2026-11-03

### Added
- **AI-first Audio Analysis & Music Grid System**:
  - `audio:scan` (`scripts/audio_analyzer.py`): STFT spectral flux, RMS dB tracking, BPM detection, intro/drop detection, and optimal window scoring for target video durations.
  - `audio:grid` (`scripts/audio_grid.py`): downbeat phase alignment, tempo alias resolution, and export to TypeScript (`src/audioGrid.ts`) with exact frame numbers for every bar and beat.
  - `audio:bed` (`scripts/audio_bed.py`): precision slicing with broadcast EBU R128 loudness normalization (-14.5 LUFS, -1.5 dBTP) and crossfades.
  - `audio:master` (`scripts/audio_master.py`): brickwall transient limiter (ceiling 0.82) and lossless video stream remuxing (`-c:v copy`).
  - `audio:verify` (`scripts/audio_verify.py`): post-render MP4 verifier checking container facts, downbeat energy steps, anchor hit onsets, and peak safety.
  - `captions:generate` (`scripts/generate_captions.py`): word-by-word kinetic subtitle generator with exact frame timestamps for TikTok/Reels bouncing captions.
  - `<KineticCaption />`: viral word-by-word animated subtitle component added to `src/ui.tsx`.
  - `ref:pull` (`scripts/ref_pull.py`): reference video & audio scraper using `yt-dlp` to extract competitor BPM/drop points and a 3×3 visual storyboard contact sheet.
- Machine-readable `--json` output across all audio tools for direct, reliable AI agent execution.
- Added audio scripts and npm shortcuts to starter template (`audio:scan`, `audio:grid`, `audio:bed`, `audio:master`, `audio:verify`).
- Test suite expanded to 7 tests covering all audio CLI commands.

### Changed
- `SKILL.md` updated with the **Music-First Grid Architecture** (analyzing and aligning downbeats before writing scene frame durations).
- `references/audio.md` expanded with real-world production recipes, grid alignment rules, and mastering practices.

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
