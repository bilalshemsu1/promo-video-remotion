import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Bg, H, Reveal, Sfx, VO, ease} from '../ui';
import {C} from '../theme';
import {CHAT_COUNT, Chaos, SPAWN_GAP} from '../Chaos';

const STAMP = 100;

export const S1 = () => {
  const f = useCurrentFrame();
  const k = f - STAMP;
  const stamp = ease(f, STAMP, 9);
  const dim = ease(f, STAMP, 14);
  const shake = k >= 0 && k < 12 ? Math.sin(f * 3.2) * 9 * (1 - k / 12) : 0;
  return (
    <Bg glow={C.red} y={50}>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
        <AbsoluteFill style={{filter: `blur(${dim * 16}px) brightness(${1 - dim * 0.5})`}}>
          <Chaos />
        </AbsoluteFill>
        {f >= STAMP && (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 260}}>
            <svg
              width={620} height={620} viewBox="0 0 100 100"
              style={{opacity: Math.min(1, stamp * 2), transform: `scale(${1.7 - 0.7 * stamp})`, filter: `drop-shadow(0 0 70px ${C.red}99) drop-shadow(0 30px 40px rgba(0,0,0,.5))`}}
            >
              <defs>
                <linearGradient id="rx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FF6961" />
                  <stop offset="1" stopColor="#FF2D55" />
                </linearGradient>
              </defs>
              <path d="M20 20 80 80M80 20 20 80" stroke="url(#rx)" strokeWidth="17" strokeLinecap="round" />
            </svg>
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 330}}>
          <Reveal at={STAMP + 14} dur={30}>
            <H size={96} style={{letterSpacing: '-0.01em', lineHeight: 1.25}}>ዋጋ መደራደር<br />ሰልችቶዎታል?</H>
          </Reveal>
        </AbsoluteFill>
      </AbsoluteFill>
      {Array.from({length: CHAT_COUNT}, (_, i) => <Sfx key={i} name="ping" at={i * SPAWN_GAP} v={0.35} />)}
      <Sfx name="scratch" at={STAMP} v={0.8} />
      <VO id="s1" />
    </Bg>
  );
};
