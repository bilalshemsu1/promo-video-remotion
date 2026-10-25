# Audio — SFX, music, voiceover, mixing

## Contents
1. Layers & levels 2. SFX map 3. Synth SFX (numpy) 4. Music bed 5. Voiceover (edge-tts, human, others) 6. Timing rules 7. Mixing & loudness 8. Stock audio sources 9. Remotion wiring

## 1. Layers & levels
VO 1.0 (always on top) · SFX 0.3–0.9 (ping 0.35, boom 0.9) · music 0.3 (duck to ~0.18 under VO if it masks speech). Target final loudness ≈ −14 LUFS integrated for social.

## 2. SFX map (what to play on which visual)
| Visual event | SFX | Notes |
|---|---|---|
| Notification/bubble appears | `ping` | 0.35 volume, one per bubble |
| Impact stamp / failure | `scratch` | on the X hit frame |
| Transition / element sweep | `whoosh`, `slide` | start 2–4 frames before motion peak |
| Logo reveal / big hit | `boom` | on the bloom frame |
| Title/pill appears | `pop` | |
| UI tap | `click` | exactly on press frame |
| Payment success | `chaching` | on checkmark draw |
| Coin lands | `coin` | at landing frame (+ a few frames) |
| Rocket launch | `rocket` | 1.8 s |
| Final beat | `boom` + music hit | same frame |

## 3. Synth SFX (no downloads) — `scripts/make_audio.py`
Pure numpy, 44.1 kHz mono WAV. Building blocks: `sine`, `sweep(f0,f1)`, one-pole lowpass `lp(noise, a)` with sweeping coefficient (whoosh), exponential decay `exp(-k t)`, FM-ish `bell` = sine + 2.76× + 5.4× partials (cha-ching, coin), noise burst + 2.2 kHz tick (click), 140→38 Hz sweep + noise (boom). Always `fade()` ends to avoid clicks and normalize peak to 0.89.
Edit parameters and re-run `npm run audio`.

## 4. Music bed (synth) — also in `make_audio.py`
120 BPM (beat = 0.5 s = 15 frames), Am–F–C–G one bar each; kick every beat, clap on 2 & 4, offbeat hats, saw bass on eighths, triangle 16th arpeggio, soft pad. Crescendo: arpeggio gain ×(0.5 → 1.3) over the last 30 %. Final hit (all chord tones + kick + clap) 0.5 s before the end, then hard fade. Music starts at 5 s in the starter (`MUSIC_FROM`), i.e. when the solution lands.
Want something richer: use royalty-free stock (§8) and keep the same offsets; align cuts to its beats by choosing a track whose BPM divides 1800 frames-per-minute cleanly (120 BPM → 15 f/beat, 100 BPM → 18 f/beat, 90 → 20 f/beat).

## 5. Voiceover
**edge-tts** (free, no API key, needs internet): `pip install edge-tts`; Amharic voices `am-ET-MekdesNeural` (female), `am-ET-AmehaNeural` (male). Options `--rate=+8%`, `--pitch`, `--volume`. Output mp3 per scene → `public/audio/vo/s#.mp3`, then write `manifest.json` (`{"s1":true,…}`). Quality is decent but synthetic; a human recording sells better — drop in `s#.mp3` and flip the manifest key.
Rules:
- VO starts 6 frames after scene start (`VO` component) so the whoosh leads.
- **Measure VO length** (ffprobe / the player) — it must end ≥0.3 s before the scene ends. If not: raise `--rate` (+10–15 %), shorten copy, or lengthen the scene in `config.ts`.
- Keep punctuation natural; "..." makes a pause. Spell digits and brand names the way they should be spoken (test every proper noun once).
- Other languages: `edge-tts --list-voices`. Paid, higher quality: ElevenLabs, Azure Speech, Google Cloud TTS (need keys; check license for commercial use).
- Subtitles: for sound-off viewing, add burned-in captions (TikTok mutes often). `edge-tts --write-subtitles` gives timings.

## 6. Timing rules
- Audio cue frame = visual hit frame (±1). Whoosh peak ≈ the frame the object arrives.
- Never stack more than 3 SFX within 6 frames.
- Leave 0.3–0.5 s of music-only before the CTA; end the music on a beat exactly at the last visual flash.
- Silence is a tool: drop music 3–4 frames before the reveal hit.

## 7. Mixing & loudness (post, optional)
```bash
ffmpeg -i out/promo.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy out/promo_norm.mp4
```
Duck music under VO inside Remotion: `<Audio volume={(f)=> f>voStart && f<voEnd ? 0.18 : 0.3} />` (frame is local to the Sequence).

## 8. Stock audio sources (check each license, keep proof)
Pixabay Music & SFX · Mixkit · Freesound (CC0/CC-BY — attribution rules vary) · YouTube Audio Library · Uppbeat (free tier with credit) · Epidemic Sound / Artlist / Envato (paid, strong commercial terms). TikTok business accounts: use TikTok's Commercial Music Library — verify current rules. Never rip audio from other videos.

## 9. Remotion wiring
```tsx
<Sequence from={at} layout="none"><Audio src={staticFile('audio/sfx/pop.wav')} volume={0.7}/></Sequence>
```
Music: one `<Audio>` in the root inside `<Sequence from={MUSIC_FROM}>`. Audio files live in `public/`. If `<Audio>` can't find a file the render fails — guard optional files with the manifest pattern.
