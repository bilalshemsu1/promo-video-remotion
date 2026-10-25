import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {ease} from './ui';

// [text, outgoing, depth 0=sharp 1=far 2=near]
const MSGS: [string, boolean, number][] = [
  ['ስንት ነው ዋጋው?', true, 0], ['ውድ ነው!', false, 1], ['Fake views!', false, 0], ['ቅናሽ አለ?', true, 2], ['Reach ስንት ነው?', false, 0],
  ['DM me', true, 1], ['ዋጋ?', false, 2], ['Admin የት ነው?', true, 0], ['ለምን ይወደዳል?', false, 1], ['Screenshot ላክ', true, 0],
  ['Fake views!', false, 2], ['ውድ ነው!', true, 0], ['ስንት ነው ዋጋው?', false, 1], ['ተደራድረን', true, 0],
];
export const CHAT_COUNT = MSGS.length;
export const SPAWN_GAP = 7;
const SCALE = [1, 0.82, 1.3];
const BLUR = [0, 4, 9];
const ALPHA = [1, 0.75, 0.6];

/** Messy Telegram-style bubbles. suck=true → fully visible, then spiral into the center. */
export const Chaos: React.FC<{suck?: boolean}> = ({suck}) => {
  const f = useCurrentFrame();
  const p = suck ? interpolate(f, [0, 26], [0, 1], {easing: Easing.in(Easing.cubic), extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill>
      {MSGS.map(([t, out, d], i) => {
        const x = 30 + random(`x${i}`) * 440;
        const y = 140 + random(`y${i}`) * 1450;
        const rot = (random(`r${i}`) - 0.5) * 16;
        const pop = suck ? 1 : ease(f, i * SPAWN_GAP, 16);
        const cx = 540 - (x + 230);
        const cy = 960 - (y + 45);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y, padding: '28px 44px', fontSize: 54, fontWeight: 500, whiteSpace: 'nowrap', color: '#fff',
              background: out ? '#2B5278' : '#182533', borderRadius: 46, [out ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 12,
              boxShadow: '0 20px 44px rgba(0,0,0,.45)', opacity: pop * ALPHA[d] * (1 - p * 0.3), filter: `blur(${BLUR[d] + p * 10}px)`,
              transform: `translate(${cx * p}px, ${cy * p + (1 - pop) * 50}px) rotate(${rot + p * 200}deg) scale(${SCALE[d] * (0.7 + 0.3 * pop) * (1 - p)})`,
            }}
          >
            {t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
