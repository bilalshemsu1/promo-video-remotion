# Resources

## Documentation
- Remotion docs: remotion.dev/docs — essentials: `interpolate`, `spring`, `Sequence`, `Audio`, `staticFile`, `random`, `Composition`, `delayRender`, CLI `render`/`still`, `@remotion/google-fonts`, `@remotion/three`, `@remotion/lottie`, `@remotion/media-utils`.
- Remotion license/pricing: remotion.dev/docs/pricing · remotion.pro (company license).
- Scaffold official templates: `npx create-video@latest`.
- Remotion GitHub examples & showcase: github.com/remotion-dev/remotion (see `packages/example`), remotion.dev/showcase.
- React docs: react.dev. TypeScript: typescriptlang.org.
- MDN: CSS `backdrop-filter`, `perspective`, `clip-path`, `mix-blend-mode`, SVG `stroke-dasharray`.

## Fonts (open licenses)
Inter (rsms.me/inter) · Noto Sans Ethiopic (fonts.google.com/noto) · Plus Jakarta Sans, Manrope, DM Sans (alternatives) · Noto family covers Arabic, Devanagari, etc. Via `@remotion/google-fonts/<FontName>` — no manual download. Avoid SF Pro / SF Symbols outside Apple platforms.

## Icons & illustration
Lucide (lucide.dev), Phosphor (phosphoricons.com), Heroicons (heroicons.com) — MIT-style licenses; copy SVG paths. Brand glyphs: official brand/press pages only (Telegram brand assets, Telebirr/Ethio telecom, Commercial Bank of Ethiopia).

## Audio
Pixabay · Mixkit · Freesound · YouTube Audio Library · Uppbeat · Epidemic Sound · Artlist · Envato Elements. TTS: edge-tts (github.com/rany2/edge-tts), ElevenLabs, Azure Speech, Google Cloud TTS. Tools: Audacity (edit), ffmpeg (loudness), LUFS meters.

## Design inspiration & references
apple.com product pages and Apple Newsroom videos (study pacing, type scale, depth) · Apple Event keynotes · Awwwards · Behance & Dribbble (motion design) · Mobbin (real app UI patterns) · Telegram desktop/mobile UI (for faithful dark-theme mockups) · "Apple-style" Remotion/After Effects tutorials on YouTube. Study, don't copy marks.

## Mockups & assets
Build devices in CSS (starter's `Device`) to stay license-free. If you use Figma device kits, check their license. Store brand files in `public/logos/` and `public/img/`; reference with `staticFile()`.

## Safe-zone references
TikTok Ads Help Center → safe-zone template files (authoritative, caption-length dependent); third-party checkers exist but numbers vary — default to the conservative rule in SKILL.md §4.

## Hosting / sharing drafts
Remotion Studio screenshare · upload draft MP4 to Google Drive/Telegram · GIF preview via ffmpeg.

## People/process
Keep a `CHANGELOG.md` per video (what was changed after each feedback round); commit to git so any version can be re-rendered.
