# Intake, storyboard, QA, delivery

## Contents
1. Intake questions 2. Storyboard table template 3. Timing budget 4. Per-scene build checklist 5. QA checklist 6. Delivery message template 7. Feedback loop

## 1. Intake (ask at most the missing ones, batch them in one message)
1. Where will it run (TikTok/Reels/Shorts/Telegram/Web) and max length?
2. Language for VO and on-screen text? Dialect/voice gender?
3. Brand: name, logo files, colors, fonts, handle, URL, CTA wording.
4. Product UI to show (screens, bot flow, prices) — real copy, not placeholders.
5. Audience + the one thing they should do after watching.
6. References (links to ads they like). Anything to avoid?
7. Music/VO: synth OK, stock, or human recording?
8. Who licenses/pays for Remotion (headcount ≤3?).
Defaults if unanswered: 9:16, 1080×1920, 30 fps, ≤45 s, Inter + Noto, brand blue on navy, synth audio, edge-tts VO.

## 2. Storyboard table (fill before coding)
| # | Time | Purpose | Visual (hero + support) | On-screen text | VO | SFX | Music |
|---|---|---|---|---|---|---|---|
| 1 | 0–5 | Problem | chaotic bubbles → red X | "ዋጋ መደራደር ሰልችቶዎታል?" | … | pings, scratch | silent |
Rules: hook in the first 1.5 s; problem → solution → steps (3 max) → benefit → CTA; each scene ends on a stable frame for ≥0.5 s.

## 3. Timing budget (30 fps)
- 3–5 s per scene = 90–150 frames; step scenes 6–7 s (UI needs time to read).
- Headline needs ≥36 frames visible after landing.
- UI interaction beats: move 22–30 f, press 6 f, response 10–18 f.
- VO budget: measure; Amharic runs ~2.2–3 syllables/s of scene time — don't guess, generate and check.
- Sum of scene lengths = composition length (`config.ts` `TOTAL`).

## 4. Per-scene build checklist
☐ Key frames named as constants ☐ hero element identified ☐ reveal uses `ease` ☐ SFX frames match visuals ☐ `<VO id>` present ☐ nothing hero-level in unsafe zones ☐ no emoji ☐ text fits (≈0.55 em per Latin char) ☐ Amharic uses tracking ≤0 ☐ end state stable.

## 5. QA checklist (before delivery)
Technical: `tsc` clean · lint clean · scenes sum = TOTAL · audio manifest correct · no `Math.random` · no CSS animations · fonts loaded for all scripts · README accurate.
Visual: every scene screenshotted (if possible) · text legible at phone size (≥ 52 px for supporting text) · no clipping at edges · colors consistent · one accent per scene · device not overlapping headline · counters don't jitter.
Audio: SFX on hits · VO fits scenes · music level below VO · final beat aligned with last flash.
Safe zones: hero y 240–1260, x 80–900.
Brand/legal: logos official or flagged; no Apple marks/SF Pro; invented statistics removed/flagged; Remotion license note given when team ≥4.

## 6. Delivery message template (≤10 lines)
```
Done — <zip name>. Typechecks clean; <rendered stills reviewed | not rendered here (no Chrome in sandbox)>.
Run: npm install → npm start (preview) → npm run vo → npm run render (close Studio first).
Scenes: 1 …, 2 … (one line each, or skip).
Placeholders: <logos / VO / stock>. Known risks: <safe zones, VO length>.
Remotion is free up to 3 people; 4+ need a company license.
Tell me the scene number + what's wrong and I'll fix just that scene.
```

## 7. Feedback loop
- User says "looks AI" → run §11 anti-AI table against the named scene, remove effects, increase scale contrast, slow easing.
- "Too fast/slow" → change `config.ts` durations, then shift SFX `at`s and VO timing.
- "Make X bigger/different" → edit only that component; do not restyle others.
- After every change: tsc + lint + still of that scene.
