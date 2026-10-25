# Prompting guide

The agent writes code, so your prompt is a creative brief, not a script for a template
picker. Short, concrete briefs beat long ones; missing details are filled with sensible
defaults.

## The 8-line brief

Copy this and fill what you know. Leave the rest to the agent.

```
Goal:        one sentence — what the video must achieve
Product:     name, what it does, who it is for
Platform:    TikTok / Reels / Shorts / Telegram / web; aspect and length
Style:       preset (premium-dark, editorial-light, bold-social, kinetic-type) or references
Script:      on-screen lines and/or voiceover language + tone (or "write it for me")
Assets:      logo, screenshots, photos, product footage (or "no assets — generate the look")
CTA:         button text, handle, URL
Don'ts:      claims to avoid, colors to avoid, anything non-negotiable
```

Minimum viable prompt: *"30-second vertical ad for X, doing Y, for Z. [Preset]. CTA: …"*

## Examples that work

**Fintech app, premium**
> 40-second vertical ad for **Halo**, a savings app for freelancers. Premium-dark. Show a phone with a balance counting up, then a transfer confirmation, then the logo. Voiceover: English, calm male. CTA "Start saving." halo.money.

**Coffee brand, editorial**
> 30-second Reel for **Nile Coffee**, a roaster in Addis. Editorial-light: warm paper, black serif, terracotta accent. Three scenes: bag on a table, pour, delivery box. On-screen copy only, no voiceover. Music: minimal piano. CTA "Order fresh." nilecoffee.com.

**Event, bold**
> 15-second story ad for a design conference on Nov 14. Bold-social: electric blue and orange, heavy condensed type. Scenes: date, three speaker names, venue, tickets. Fast cuts on the beat. CTA "Get tickets." No voiceover.

**Stat / manifesto, kinetic**
> 12-second kinetic-type clip. Black background, white Inter, one lime accent. Words appear one at a time: "Half of ad spend." "Wasted." "We fix that." End on the logo. No music except a low pulse.

**Product feature, app demo**
> 25-second vertical demo of a delivery app's live tracking. Premium-dark. Show the map screen, the courier moving, and the arrival card. Real UI colors: navy and mint. Amharic voiceover. CTA "Track your order."

**Non-Latin script**
> 20-second Amharic ad for a tutoring app. Editorial-light. Headline in Amharic, Noto Sans Ethiopic, generous line-height. No Latin text except the logo. Female voiceover, am-ET-MekdesNeural.

## Choosing a style without naming a preset

Describe the feeling and the agent maps it:

| You say | It should pick |
|---|---|
| "premium, dark, Apple-like, cinematic, tech" | `premium-dark` |
| "calm, warm, paper, magazine, minimal, human" | `editorial-light` |
| "loud, youthful, colorful, energetic, street" | `bold-social` |
| "typographic, no footage, manifesto, quote" | `kinetic-type` |

You can also give a reference: *"the pacing of a Spotify Wrapped clip, but in our brand colors."*
The agent studies the reference and writes the tokens; it does not copy frames.

## Iteration phrases

- "Scene 3 lands too late — start it 8 frames earlier."
- "The headline is clipped; shorten to ≤5 words or drop to 150 px."
- "Move the CTA above y=1260 — the caption covers it."
- "Music is too busy under the voiceover; duck it to 0.2."
- "Cut the voiceover, keep the SFX."
- "Switch to editorial-light but keep the scene order."
- "Make a 15-second cut for Stories from the same project."

Name the scene; the agent edits only that scene and re-renders.

## Voiceover

- Say the language and the voice you want. Default is English `en-US-AriaNeural`;
  Amharic `am-ET-MekdesNeural` and `am-ET-AmehaNeural` are included.
- Write numbers and brand names the way they should be spoken.
- Keep one line per scene, roughly 2.2–3 syllables per second.
- No voiceover is a valid choice — say so, and the video will rely on music and type.
- Prefer your own recording? Export `s1.mp3 … s7.mp3` and the agent wires the manifest.

## Assets and brands

- Give exact logo files and screenshots when you have them. Never ask the agent to redraw
  a third-party logo from memory.
- Without assets, the agent uses abstract gradients, generic device frames and SVG icons —
  no stock "smiling people", no emoji.
- State placeholder rules: *"use a fake bank badge until I send the real one."*
- Statistics must be real or clearly illustrative. The agent should refuse to invent claims.

## Copy rules the agent follows

- ≤7 words per headline, sentence case, full stop for confidence.
- On-screen text supports the voiceover; it does not repeat whole sentences.
- CTA = the action ("Start saving."), then handle, then URL.
- Numbers use tabular figures and count only when the count means something.

## Common mistakes

| Mistake | Better |
|---|---|
| "Make it viral" | "Fast cuts, bold color, 1.5 s per scene, hook in the first second." |
| 9 bullet points of features | One idea per scene; pick the three that matter. |
| "Use our brand colors" with no hex | Send hex values or a brand guide. |
| 60-second script for a 15-second slot | Cut the script before asking. |
| "Same as this TikTok" + link | Say which part: pacing, type, transitions, color. |
| Asking for a logo in scene 1 and a URL only in scene 7 | Repeat the brand mark at the end; people join late. |

## What to check before publishing

- Hero text and CTA inside the safe zone (y 240–1260, x 80–900).
- Readable muted, on a phone, at arm's length.
- Voiceover ends before its scene does.
- Every claim and logo is real and licensed.
- No placeholder name, handle or badge left in.
