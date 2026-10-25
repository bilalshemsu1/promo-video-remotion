# Style presets

The skill is not locked to one look. Pick a preset from the brief, or build a custom
direction from the universal rules at the bottom. The starter ships with **premium-dark**,
which is also the default when the user has no opinion.

| Preset | Best for | Canvas | Type | Motion |
|---|---|---|---|---|
| `premium-dark` (default) | tech, fintech, apps, product launches | near-black navy + one brand glow | Inter 700, 150–200 px, tight tracking | slow expo-out, long holds, glass |
| `editorial-light` | wellness, fashion, education, B2B SaaS | warm paper + ink + one accent | display serif or grotesk, generous leading | gentle fades, upward drifts, hairline rules |
| `bold-social` | consumer apps, events, D2C, youth brands | saturated color blocks + duotone | condensed or heavy sans, all-caps sparingly | fast cuts, wipes, punches on the beat |
| `kinetic-type` | quotes, stats, launches, low-asset brands | black/white + one accent | one family, extreme scale contrast | word-by-word masks, tracking shifts, no device |

## How to apply a preset

1. Choose from the brief; otherwise use `premium-dark`.
2. Copy the preset's tokens into `src/theme.ts` and its type/motion rules into `src/ui.tsx`.
3. Adapt the storyboard: preset changes pacing, not just color. A `bold-social` 45 s video
   wants 7–10 short scenes; `editorial-light` wants 4–5 longer ones.
4. State the preset in the delivery message and in the project README, so the next person
   knows the rules the scenes were written against.
5. Run `python scripts/lint_design.py src --strict` only against the preset you chose.
   Warnings are taste; errors are correctness.

---

## 1. premium-dark (default)

**Reference:** Apple product films, Linear, Arc, high-end fintech.

```ts
// theme.ts
export const C = {
  bg: '#050B16',            // near-black navy
  bg2: '#0A1F3D',           // glow bed
  brand: '#2AABEE',         // swap per brand
  brand2: '#1B8FD6',
  accent: '#C8F53A',        // ONE CTA color
  ink: '#FFFFFF',
  mute: 'rgba(255,255,255,.62)',
  ok: '#30D158', bad: '#FF453A',
};
```

- Type: Inter 500/600/700. Headline 150–200 px, tracking −0.045em, line-height 1.02.
- Surfaces: frosted glass (blur 40, 8–12 % white, 1.5 px highlight), titanium device, soft
  layered shadows, a radial brand glow behind the hero.
- Motion: expo-out `Easing.bezier(0.16,1,0.3,1)`, 30–60 frame reveals, fade + 40 px rise +
  blur 16→0. Long holds. One hero element per scene.
- Audio: sub-heavy synth bed, soft whooshes, sparse pops.
- Avoid: neon text, extruded type, confetti, bouncy springs, more than one accent.

## 2. editorial-light

**Reference:** Kinfolk, Aesop, Notion brand films, editorial campaign films.

```ts
export const C = {
  bg: '#F4EFE6',            // warm paper
  bg2: '#E8DFD0',
  ink: '#171512',           // near-black, never pure #000
  mute: 'rgba(23,21,18,.58)',
  brand: '#1F4D3A',         // deep green example
  accent: '#D4602F',        // terracotta example
  rule: 'rgba(23,21,18,.16)',
};
```

- Type: a display serif for headlines (e.g. Fraunces, Playfair Display, Instrument Serif)
  at 110–170 px, line-height 1.02–1.08, tracking −0.02em; a grotesk (Inter, DM Sans) for
  labels at 24–34 px, tracking +0.08em, uppercase.
- Surfaces: flat paper, hairline rules, small photo or illustration windows, generous
  margins (120 px). No glass, no glow.
- Motion: 24–40 frame fades and 24 px drifts; a slow 1.04 scale on images; lines draw in.
  Cuts feel like page turns, not impacts.
- Audio: acoustic or minimal piano bed, room-tone whooshes, no risers.
- Avoid: pure black, neon, heavy shadows, fast cuts, more than two type sizes per scene.

## 3. bold-social

**Reference:** Spotify Wrapped, Duolingo, event promos, D2C launch ads.

```ts
export const C = {
  bg: '#0E0B1F',            // or a saturated block color
  brand: '#FF4D2E',
  brand2: '#FFB000',
  accent: '#B6FF3B',
  ink: '#FFFFFF',
  mute: 'rgba(255,255,255,.72)',
  blockA: '#2B1B6B',
  blockB: '#FF4D2E',
};
```

- Type: condensed heavy sans (e.g. Archivo Black, Anton) or a geometric heavy (Manrope 800).
  Headlines 120–190 px, tracking −0.03em; numbers can go 240 px.
- Surfaces: flat color blocks, hard-edged cards, oversized shapes, duotone images. One
  texture (grain or halftone) at most.
- Motion: 10–24 frame punches, mask wipes, scale snaps on the beat, scene length 1.5–3 s.
  Use overshoot springs only on badges and buttons; everything else is a hard ease.
- Audio: 120–140 BPM, claps, impacts on cuts, short vocal stabs if licensed.
- Avoid: more than three colors, confetti, drop shadows on everything, slow 3 s holds.

## 4. kinetic-type

**Reference:** typographic title sequences, manifesto films, stat spots.

```ts
export const C = {
  bg: '#000000',
  ink: '#FFFFFF',
  accent: '#FF3B30',
  mute: 'rgba(255,255,255,.5)',
};
```

- Type: ONE family in 3–4 weights (Inter, Archivo, Space Grotesk). Scale range 40→340 px.
  Sentence case or all caps, never both in one video.
- Layout: type is the only object. Full-bleed words, mask reveals, words replacing words in
  the same optical position. Optional single line or rule for structure.
- Motion: clip-path or overflow-hidden word masks, 18–40 frames per line, tracking that
  tightens as the line lands, hard cuts on the beat. No devices, no cards, no glass.
- Audio: percussive bed or a single sustained tone; every word can land on a hit.
- Avoid: more than one accent color, decorative icons, long paragraphs, slow fades.

---

## Bring your own style

A custom direction is valid if it answers these six questions in `src/theme.ts` and the
project README:

1. Canvas and ink colors (and whether the video is light or dark).
2. One brand color and one accent, with where each is allowed.
3. Type family, headline size range, tracking, line-height.
4. Surface language: flat, glass, paper, blocks, texture.
5. Motion signature: easing curve, reveal distance, scene length.
6. Audio signature: tempo, density, whether VO leads or follows.

## Universal rules (never optional)

These hold in every preset:

- **Safe zones.** Keep hero text, logos and CTA inside y 240–1260, x 80–900 on 9:16.
- **Determinism.** Animation is a pure function of `useCurrentFrame()`. No CSS transitions,
  `setTimeout`, state-driven animation or `Math.random` (use `random('seed')`).
- **One idea per scene.** If two elements compete, delete one.
- **Legibility first.** Body ≥ 28 px, UI text ≥ 32 px at 1080×1920; test a still.
- **Truth.** No invented statistics, fake testimonials or unlicensed logos.
- **Licensing.** Fonts, music, footage and trademarks keep their own licenses.
