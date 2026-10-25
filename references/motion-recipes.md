# Motion recipes (all exist in `assets/starter-project/src`)

## Contents
1. Easing 2. Reveal 3. Stagger 4. Touch path 5. Press & ripple 6. Draw-on SVG 7. Counter 8. Falling object 9. Suction spiral 10. Bloom + ring 11. 3D tilt settle 12. Depth of field 13. Beat pulse 14. Screen shake 15. Split-screen expand 16. Scene transitions 17. Performance

## 1. Easing (the Apple feel)
```ts
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);               // expo-out
export const ease = (f, start, dur=30) =>
  interpolate(f, [start, start+dur], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp', easing: EASE});
```
Durations: UI pop 14–18 f · reveal 28–34 f · hero entrance 40–46 f · camera settle 150+ f. Use `Easing.inOut(Easing.cubic)` for moving a pointer between points, `Easing.in(Easing.cubic)` for things being sucked away.
`spring()` only for small pops: `config:{damping:14, mass:.9}`; never default (it overshoots).

## 2. Reveal (fade + rise + blur)
```tsx
const p = ease(f, at, 28);
<div style={{opacity:p, transform:`translateY(${(1-p)*40}px)`, filter:`blur(${(1-p)*16}px)`}}>…</div>
```
## 3. Stagger
Same animation, `at + i*6` (cards) or `i*7` (chat bubbles). Headline lines: +8 frames per line.

## 4. Touch path (finger moving between targets)
```ts
const KF=[0,30,36,52,58];                 // frames; equal consecutive values = hold (the tap)
const X=[640,330,330,440,440], Y=[1150,250,250,394,394];
const x = interpolate(f, KF, X, {...clamp, easing:Easing.inOut(Easing.cubic)});
```
Coordinates are **inside the parent** (e.g. phone content area) so they rotate with the 3D tilt.

## 5. Press & ripple
`pressAt(f, t)` = 0→1→0 triangle (−3/0/+7 frames) → scale touch dot `1 − press*.28`; `<Ripple at={t}/>` expands a ring 20 f. Fire the click SFX on frame `t`.

## 6. Draw-on SVG (checkmarks, rings)
`<path pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress}/>` — progress from `ease()`. Ring: rotate −90° so it starts at 12 o'clock.

## 7. Counter
`Math.floor(interpolate(f,[a,b],[0,N],clamp))` then regex thousands separator; `tabular-nums` so digits don't jitter.

## 8. Falling object into a container
`y = interpolate(k,[0,18],[y0,yEnd],{easing:Easing.in(Easing.quad)})`; render object **before** the container in DOM so the container covers it (looks like it goes inside). Container bump on landing: `scale(1 + Math.exp(-(f - land)/5)*0.05)`. SFX at `land`.

## 9. Suction spiral (chaos → logo)
For each item: translate toward center `(cx*p, cy*p)`, `rotate(rot + p*200)`, `scale(1-p)`, `blur(+p*10)` with `p = ease-in-cubic(0→26 frames)`.

## 10. Bloom + ring (the "reveal")
Radial white→sky circle `scale 0.3→3.5`, opacity 0.95→0 over 26 f; thin 3 px ring `scale 1→3.2`, opacity 1→0 over 40 f. App icon: scale .55→1 + blur 20→0 over 44 f, then ±8 px float `sin(f/16)`.

## 11. 3D tilt settle
`transform: perspective(2600px) translateY(rise) rotateX(10−8s deg) rotateY(−14+12s deg)` with `s = ease(f,0,160)`; `transformOrigin:'50% 0'`. Children are positioned in the device's plane so they tilt with it.

## 12. Depth of field
Three depth classes: far (scale .82, blur 4, alpha .75), mid (1, 0, 1), near (1.3, blur 9, alpha .6). Defocus background when a hero lands: `filter: blur(16px) brightness(.5)`.

## 13. Beat pulse (sync to music)
At 120 BPM a beat = 15 frames: `beat = Math.abs(Math.sin(f*Math.PI/15))`; button `scale(1+beat*.04)`, glow `60+beat*70 px`. Keep scene start on a beat: music offset (5 s = 10 beats) and scene starts at multiples of 0.5 s.

## 14. Screen shake (impact)
`shake = Math.sin(f*3.2) * 9 * (1 - k/12)` for 12 frames after the hit, applied to x and 0.6× to y.

## 15. Split-screen expand
`ex = interpolate(f,[a,a+24],[0,1],{easing:Easing.inOut(Easing.cubic)})`; top height `960 → 360`, bottom fills the rest; avatars scale `1 − ex*.42`; bottom avatar `top` interpolates to the new panel top.

## 16. Scene transitions
Prefer overlap over cuts: the last 10 frames of a scene move/blur its hero while the next scene's first reveal starts. Cheap alternative: end each scene with a whoosh SFX and `filter:blur` ramp on the root. `<Sequence>` boundaries are hard cuts — add the blur ramp yourself if needed.

## 17. Performance (render time)
`backdrop-filter`, big `filter: blur()`, many absolutely-positioned shadows are the slow parts. If renders crawl: `--concurrency=2`, reduce blur radii, remove `backdrop-filter` on elements over flat color (fake glass with a gradient), render with `--scale=0.5` for drafts.
