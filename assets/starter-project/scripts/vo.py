"""Voiceover via edge-tts (free, no API key, needs internet).

Run: pip install edge-tts && npm run vo
Language: set VO_LANGUAGE=en (default) or VO_LANGUAGE=am before the command, e.g.
  PowerShell:  $env:VO_LANGUAGE="am"; npm run vo
  bash:        VO_LANGUAGE=am npm run vo
Voice: override with VO_VOICE, e.g. VO_VOICE=am-ET-AmehaNeural.
Replace LINES with your own script. Prefer recording yourself?
Drop public/audio/vo/s1.mp3 … s7.mp3 and set the matching keys to true in manifest.json.
"""
import asyncio
import json
import os
import pathlib

import edge_tts

LANGUAGE = os.environ.get("VO_LANGUAGE", "en")
VOICES = {
    "en": "en-US-AriaNeural",
    "am": "am-ET-MekdesNeural",
}
VOICE = os.environ.get("VO_VOICE", VOICES.get(LANGUAGE, VOICES["en"]))

LINES = {
    "en": {
        "s1": "Still haggling over ad prices in DMs?",
        "s2": "Meet Adly. Your ad goes live in thirty seconds.",
        "s3": "Forward your ad to the bot. That's the whole setup.",
        "s4": "Pick an audience package with one tap.",
        "s5": "Pay by wallet or bank transfer. Your ad launches instantly.",
        "s6": "Own a channel? Register it, receive ads automatically, and earn from real views.",
        "s7": "Modern advertising, on autopilot. Start the bot today.",
    },
    "am": {
        "s1": "ቴሌግራም ላይ ማስታወቂያ ለማሰራት በ DM ዋጋ መደራደር ሰልችቶዎታል?",
        "s2": "እንግዲያውስ መፍትሄው Adly ነው። ማስታወቂያዎን በ30 ሴኮንድ ውስጥ ብቻ አየር ላይ ያውሉ!",
        "s3": "አሰራሩ በጣም ቀላል ነው። ማስታወቂያዎን ቀጥታ ወደ ቦቱ Forward ያድርጉ።",
        "s4": "የሚፈልጉትን የኦዲየንስ Package በአንድ ክሊክ ይምረጡ።",
        "s5": "በዋሌት ወይም በባንክ ይክፈሉ... ማስታወቂያዎ ወዲያውኑ ይለቀቃል!",
        "s6": "የቴሌግራም ቻናል ባለቤት ነዎት? ቻናልዎን ያስመዝግቡ፣ አውቶማቲክ ማስታወቂያ ይቀበሉ፣ በእይታዎ ልክ ክፍያዎን ያግኙ!",
        "s7": "ቴሌግራም ማስታወቂያን በዘመናዊ መንገድ! አሁኑኑ ዌብሳይታችንን ይጎብኙ ወይም ቦቱን ያስጀምሩ።",
    },
}


async def main():
    if LANGUAGE not in LINES:
        raise SystemExit(f"VO_LANGUAGE must be one of {sorted(LINES)}, got {LANGUAGE!r}")
    out = pathlib.Path("public/audio/vo")
    out.mkdir(parents=True, exist_ok=True)
    done = {}
    for key, text in LINES[LANGUAGE].items():
        await edge_tts.Communicate(text, VOICE).save(str(out / f"{key}.mp3"))
        done[key] = True
        print("ok", key)
    (out / "manifest.json").write_text(json.dumps(done))
    print(f"voiceover ready: {len(done)} lines, {LANGUAGE}, {VOICE}")


asyncio.run(main())
