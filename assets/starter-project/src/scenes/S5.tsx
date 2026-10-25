import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Bg, H, Reveal, Sfx, StepPill, VO, clamp, ease, glass} from '../ui';
import {C} from '../theme';

const LAUNCH = 95;
const rocketY = (t: number) => interpolate(t, [LAUNCH, LAUNCH + 70], [1750, -700], {...clamp, easing: Easing.in(Easing.quad)});

// Placeholder badges: swap for official payment-provider logos you have permission to use.
const PayBadge: React.FC<{at: number; dir: number; bg: string; title: string; sub: string}> = ({at, dir, bg, title, sub}) => {
  const f = useCurrentFrame();
  const p = ease(f, at, 44);
  return (
    <div style={{width: 450, height: 230, borderRadius: 58, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      boxShadow: 'inset 0 2px 0 rgba(255,255,255,.4), 0 40px 80px rgba(0,0,0,.5)', opacity: Math.min(1, p * 2.5),
      transform: `perspective(1400px) rotateY(${(1 - p) * 100 * dir}deg) translateY(${(1 - p) * 60}px) scale(${0.85 + 0.15 * p})`}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(150deg,rgba(255,255,255,.28),transparent 45%)'}} />
      <div style={{fontSize: 84, fontWeight: 700, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1}}>{title}</div>
      <div style={{fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,.82)', marginTop: 8}}>{sub}</div>
    </div>
  );
};

const Rocket: React.FC = () => (
  <svg width="240" height="528" viewBox="0 0 100 220" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="rb" x1="0" x2="1"><stop offset="0" stopColor="#B9C6D6" /><stop offset=".45" stopColor="#FFFFFF" /><stop offset="1" stopColor="#9FB0C4" /></linearGradient>
      <linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".35" stopColor="#FFD166" /><stop offset="1" stopColor="#FF9F0A" stopOpacity="0" /></linearGradient>
    </defs>
    <path d="M38 150h24L50 218Z" fill="url(#rf)" style={{filter: 'blur(1.5px)'}} />
    <path d="M27 126 8 170l19-9ZM73 126l19 44-19-9Z" fill={C.tg2} />
    <path d="M50 4C76 34 82 86 75 152H25C18 86 24 34 50 4Z" fill="url(#rb)" />
    <path d="M50 4C60 15 68 30 72 48H28C32 30 40 15 50 4Z" fill={C.tg} />
    <circle cx="50" cy="92" r="16" fill="#0B1F3A" stroke="#E6EEF7" strokeWidth="4" />
    <circle cx="45" cy="87" r="5" fill="#fff" fillOpacity=".5" />
  </svg>
);

export const S5 = () => {
  const f = useCurrentFrame();
  const ring = ease(f, 50, 22);
  const tick = ease(f, 64, 16);
  const hold = 1 - ease(f, LAUNCH + 14, 12);
  const live = ease(f, LAUNCH + 24, 24);
  const ry = rocketY(f);
  const pulse = 1 + 0.35 * Math.abs(Math.sin(f / 7));
  return (
    <Bg y={110}>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110}}>
        <StepPill n={3} at={4} />
        <Reveal at={10} dur={34} style={{marginTop: 26}}>
          <H size={150}>Pay &amp;<br />launch.</H>
        </Reveal>
      </AbsoluteFill>

      <AbsoluteFill style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 36, paddingTop: 700}}>
        <PayBadge at={12} dir={1} bg={`linear-gradient(135deg,#0A8FD8,${C.green})`} title="Wallet" sub="Mobile money" />
        <PayBadge at={20} dir={-1} bg="linear-gradient(135deg,#4B1D6B,#8E4DB8)" title="Bank" sub="Bank transfer" />
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', paddingTop: 1070, opacity: hold}}>
        <svg width="300" height="300" viewBox="0 0 100 100" style={{filter: `drop-shadow(0 0 ${30 + 25 * Math.sin(f / 6)}px ${C.green}88)`}}>
          <circle cx="50" cy="50" r="40" fill={`${C.green}22`} />
          <circle cx="50" cy="50" r="40" fill="none" stroke={C.green} strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 50 50)" />
          <path d="m31 51 13 13 25-28" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
        </svg>
      </AbsoluteFill>

      {Array.from({length: 18}, (_, i) => {
        const t0 = LAUNCH + i * 3;
        const k = f - t0;
        if (k < 0 || k > 32) return null;
        return <div key={i} style={{position: 'absolute', left: 540 - 70 + Math.sin(i * 2.3) * 36, top: rocketY(t0) + 440, width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,.3)', filter: 'blur(26px)', opacity: 1 - k / 32, transform: `scale(${1 + k / 9})`}} />;
      })}
      {f >= LAUNCH && (
        <>
          <div style={{position: 'absolute', left: 540 - 9, top: ry + 470, width: 18, height: 900, borderRadius: 9, background: 'linear-gradient(180deg,rgba(255,220,150,.9),rgba(255,159,10,.35) 30%,transparent)', filter: 'blur(5px)'}} />
          <div style={{position: 'absolute', left: 540 - 120, top: ry, transform: `translateX(${Math.sin(f * 1.7) * 2.5}px)`}}><Rocket /></div>
        </>
      )}

      <AbsoluteFill style={{alignItems: 'center', paddingTop: 1130}}>
        <div style={{...glass(100, 0.12), opacity: live, transform: `translateY(${(1 - live) * 40}px) scale(${0.9 + 0.1 * live})`, display: 'flex', alignItems: 'center', gap: 24, padding: '24px 52px 24px 42px'}}>
          <div style={{position: 'relative', width: 34, height: 34}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: C.green, opacity: 0.4, transform: `scale(${pulse})`}} />
            <div style={{position: 'absolute', inset: 5, borderRadius: '50%', background: C.green}} />
          </div>
          <div style={{fontSize: 60, fontWeight: 700, color: '#fff', letterSpacing: '-0.04em'}}>Your ad is live</div>
        </div>
      </AbsoluteFill>

      <Sfx name="whoosh" at={10} v={0.4} />
      <Sfx name="chaching" at={52} />
      <Sfx name="rocket" at={LAUNCH} />
      <Sfx name="pop" at={LAUNCH + 24} />
      <VO id="s5" />
    </Bg>
  );
};
