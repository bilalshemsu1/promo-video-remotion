import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AppIcon, Bg, H, Reveal, Sfx, VO, ease} from '../ui';
import {C} from '../theme';
import {Chaos} from '../Chaos';

const BOOM = 26;

export const S2 = () => {
  const f = useCurrentFrame();
  const k = f - BOOM;
  const icon = ease(f, BOOM, 44);
  const bloom = ease(f, BOOM, 26);
  const ring = ease(f, BOOM, 40);
  return (
    <Bg y={32}>
      {f < BOOM + 2 && <Chaos suck />}
      {k >= 0 && (
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 540 - 260, top: 560 - 260, width: 520, height: 520, borderRadius: '50%', opacity: (1 - bloom) * 0.95,
            background: 'radial-gradient(circle,#fff 0%,rgba(143,211,255,.7) 35%,transparent 70%)', transform: `scale(${0.3 + bloom * 3.2})`}} />
          <div style={{position: 'absolute', left: 540 - 220, top: 560 - 220, width: 440, height: 440, borderRadius: '50%', border: '3px solid rgba(255,255,255,.55)',
            opacity: 1 - ring, transform: `scale(${1 + ring * 2.2})`}} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 560 - 190}}>
        <div style={{opacity: Math.min(1, icon * 2), transform: `scale(${0.55 + icon * 0.45}) translateY(${Math.sin(f / 16) * 8}px)`, filter: `blur(${(1 - icon) * 20}px)`}}>
          <AppIcon size={380} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 950}}>
        <Reveal at={58} dur={34}>
          <H size={150} tone="blue" style={{filter: `drop-shadow(0 0 50px ${C.tg}77)`}}>30-second</H>
        </Reveal>
        <Reveal at={66} dur={34}>
          <H size={150}>ad campaigns.</H>
        </Reveal>
      </AbsoluteFill>
      <Sfx name="whoosh" at={0} v={0.8} />
      <Sfx name="boom" at={BOOM} v={0.9} />
      <VO id="s2" />
    </Bg>
  );
};
