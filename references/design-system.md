# Design system — premium-dark preset

This file describes the default `premium-dark` look in detail. For the other directions
(`editorial-light`, `bold-social`, `kinetic-type`) and the universal rules that apply to
every preset, read `style-presets.md`. The tokens below are a starting point, not a
requirement: swap colors and type per brand.

## Contents
1. Principles 2. Tokens 3. Type 4. Layout grid 5. Materials 6. Device mockup 7. Color use 8. Icons & imagery 9. Copywriting 10. Non-Latin scripts 11. Anti-AI checklist

## 1. Principles
- **One idea per scene.** One hero (a headline, a device, a number). Everything else supports or disappears.
- **Restraint.** Empty black is the luxury. If two elements compete, delete one.
- **Hierarchy through scale**, not through decoration: hero 150–200 px, support 60–72 px, UI text 36–42 px.
- **Slow confidence.** Long eases, long holds (a headline needs ≥1.2 s on screen after it lands).
- **Real objects.** Devices have bezels, reflections and shadows; icons are squircles; glass has a highlight edge.
- **Consistency.** Same easing, same radius family, same reveal everywhere. Variation only for the one hero moment.

## 2. Tokens (copy into `src/theme.ts`)
```ts
export const C = {
  dark:'#050B16', navy:'#0A1F3D',            // canvas
  tg:'#2AABEE', tg2:'#1B8FD6', sky:'#8FD3FF', // brand blue family (swap per brand)
  lime:'#C8F53A',                             // CTA accent — one use
  orange:'#FF9F0A', pink:'#FF375F', green:'#30D158', red:'#FF453A', purple:'#7D5BFF', // Apple-system-like accents, sparing
  mute:'rgba(255,255,255,.62)',
};
```
Rules: ≤1 brand hue dominant per scene; red only for "problem" beats; green only for success; lime only for the CTA button.
Canvas glow: radial gradient of brand color at 25 % alpha, drifting slowly (`sin(f/80)`), plus a vignette (`transparent 55% → rgba(0,0,0,.6)`).

## 3. Type
- Latin: **Inter** 500/600/700 (open license; closest legal stand-in for SF Pro). Load with `@remotion/google-fonts`.
- Headline: 700, `letterSpacing:'-0.045em'`, `lineHeight:1.02`, gradient fill `linear-gradient(180deg,#fff 30%,#A9DBFF 130%)` with `background-clip:text`.
- Sub-head: 500–600, 52–72 px, `C.mute`.
- Numbers (counters): 700, 150 px+, `fontVariantNumeric:'tabular-nums'`.
- Width check: Inter bold ≈ 0.55 em per character; at 150 px a 12-char line ≈ 990 px — near the 1080 limit. Use ≤170 px for 12 chars, or break lines.
- `whiteSpace:'nowrap'` + manual `<br/>` for deterministic line breaks.

## 4. Layout grid (1080×1920)
- Margins 80 px. Hero zone y 240–1260 (safe zone for TikTok ads; see SKILL.md §4). Headline band y 110–560 when a device sits below it.
- Typical stack: step pill (y≈110) → headline (y≈180–500) → device/hero (top 470–480, bleeding off bottom) .
- Center on x=540. Use `AbsoluteFill` + flex for centering; absolute px for everything that must be pixel-placed (touch targets, coins).

## 5. Materials
**Glass**
```ts
background:'rgba(255,255,255,.08–.12)', backdropFilter:'blur(40px) saturate(160%)',
border:'1.5px solid rgba(255,255,255,.16)',
boxShadow:'inset 0 1.5px 0 rgba(255,255,255,.3), 0 40px 80px rgba(0,0,0,.45)'
```
**Shadows**: two layers — a tight dark one and a wide soft one; colored glow (`0 0 120px brand@40 %`) only under the hero.
**Gradients**: two close hues of the same family (e.g. `#46C1FF → #1B8FD6`), plus a white 30 % diagonal sheen from the top-left for gloss.
**Radius family**: icon squircle = size × 0.2237; cards 48–60; pills = height/2; device 116 outer / 100 inner.

## 6. Device mockup
Titanium frame gradient (`145deg,#9AA5B0,#2B3138 28%,#6B7580 52%,#1C2127 78%,#A3AEB9`), 16 px bezel, dynamic island pill (184×52), status-bar time, screen reflection overlay (`115deg, rgba(255,255,255,.1) → transparent 34%`). Enter with `perspective(2600px) rotateX(10°) rotateY(-14°)` settling to ~0 over 160 frames, rise from below. Dim/blur/shrink it when hero moves to glass cards. Keep the device **generic** (no Apple marks).
UI inside (generic dark chat example): bg `#0F141B`, header `#171E26`, incoming `#1C242E`, outgoing `#23405C`, accent `#2AABEE`, muted `#6D7F8F`. Match the client's real product UI when screenshots exist; never fake a brand's interface.

## 7. Color use per scene role
| Role | Canvas glow | Accents |
|---|---|---|
| Problem | red glow | red X, muted bubbles |
| Solution/reveal | brand blue | white bloom, icon |
| How-it-works steps | brand blue | step pill blue |
| Success/launch | brand + green | green ring, orange flame |
| Earn/benefit | violet→pink panel | gold coins |
| CTA | brand blue | lime button, white text |

## 8. Icons & imagery
- SVG line icons, 1.7 px stroke, round caps (see `ui.tsx`: cap, chip, play, check, person, megaphone, eye). Libraries to borrow paths from: Lucide, Phosphor, Heroicons (all open licenses).
- No emoji, no clip-art, no stock "people smiling". Abstract gradient "images" (radial blobs) stand in for photos.
- Logos: official assets in `public/logos/`, drawn with `<Img>`; never redraw a third-party brand from memory.
- Coins/objects: radial-gradient metal (`#FFF4B8 → #FFC93C → #E39B00`) + inner ring + soft shadow.

## 9. Copywriting for video
- ≤7 words per headline. Sentence case. Verbs first ("Forward.", "Choose a package.", "Pay & launch."). Full stop = confidence.
- Step labels: "Step 1" pill, never "1." alone.
- On-screen text supports the VO; it never duplicates a whole sentence.
- CTA: button text = the action ("Start Bot Now"), then handle, then URL.
- Numbers: use real ones from the client or none. Never invent stats (counters may animate a decorative figure only if the scene says "real views"-type claims are illustrative — otherwise ask).

## 10. Non-Latin scripts (Amharic / Ge'ez, Arabic, etc.)
- Font stack order: `Inter, "Noto Sans Ethiopic", system-ui`. Latin glyphs come from Inter; Ge'ez falls through to Noto.
- **Tracking 0 to −0.01em** for Ge'ez (tight Latin tracking breaks the syllabary), line-height ≥1.25, size ~+10 % vs Latin because glyphs read smaller.
- Gradient text works; keep weight 700.
- Test every Amharic string in a still: tofu boxes mean the font didn't load.
- RTL scripts: set `direction:'rtl'` per element and mirror layouts.

## 11. Anti-AI checklist (run before coding AND before delivery)
| Tell | Replace with |
|---|---|
| Neon/multi-layer glow text | Flat gradient text, one soft colored glow under the hero object |
| Extruded 3D text (stacked text-shadows) | Plain big type + scale/blur reveal |
| Emoji as icons | SVG line icons in rounded tiles |
| Cartoon smiley people | Abstract avatar circles with a line icon |
| Confetti / particle dots | One bloom + one ring |
| Spring bounce on everything | Expo-out ease; overshoot only on small UI pops |
| Rainbow gradients, 4+ saturated colors | Canvas + one brand hue + white |
| Identical rounded-card grids | One hero card + supporting glass; vary scale/depth |
| Everything centered, same size | Clear hierarchy, device bleeding off-frame |
| Hard cut with no reason | Overlap: outgoing element moves/blurs as incoming arrives |
| Spinning logos 720° | 90–100° flip with expo-out |
| Fake UI with lorem ipsum | Real copy in the user's language |
| Cursor arrow on mobile UI | Translucent touch dot + ripple |
| Flat pure-black with no depth | Glow + vignette + blur-depth layers |
