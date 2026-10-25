import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AppIcon, Bg, H, Reveal, Sfx, VO, ease} from '../ui';
import {C} from '../theme';

const HIT = 195; // final beat (music ends here)

export const S7 = () => {
  const f = useCurrentFrame();
  const icon = ease(f, 0, 40);
  const btn = ease(f, 40, 30);
  const beat = Math.abs(Math.sin((f * Math.PI) / 15)); // 120 BPM = 15 frames per beat
  const flash = f >= HIT ? 0.55 * (1 - ease(f, HIT, 12)) : 0;
  const ring = f >= HIT ? ease(f, HIT, 24) : 0;
  return (
    <Bg y={40}>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 190}}>
        <div style={{opacity: icon, transform: `scale(${0.7 + 0.3 * icon})`, filter: `blur(${(1 - icon) * 18}px)`}}><AppIcon size={300} /></div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 590}}>
        <Reveal at={14} dur={34}><H size={100} style={{letterSpacing: '-0.01em', lineHeight: 1.25}}>ቴሌግራም ማስታወቂያን<br />በዘመናዊ መንገድ</H></Reveal>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', paddingTop: 1010}}>
        <div style={{opacity: btn, transform: `translateY(${(1 - btn) * 40}px) scale(${1 + beat * 0.04})`, padding: '44px 130px', borderRadius: 140,
          background: `linear-gradient(180deg,#D8FF5C,${C.lime} 60%,#A6E21B)`, color: '#0B1F3A', fontSize: 96, fontWeight: 700, letterSpacing: '-0.045em',
          boxShadow: `inset 0 3px 0 rgba(255,255,255,.7), 0 0 ${60 + beat * 70}px ${C.lime}88, 0 40px 70px rgba(0,0,0,.45)`}}>
          Start Bot Now
        </div>
        <Reveal at={56} dur={30} style={{marginTop: 74, textAlign: 'center'}}>
          <div style={{fontSize: 70, fontWeight: 600, color: '#fff', letterSpacing: '-0.035em'}}>@adly_app</div>
          <div style={{fontSize: 70, fontWeight: 600, color: C.sky, letterSpacing: '-0.035em', marginTop: 6}}>adly.app</div>
        </Reveal>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 70, opacity: ease(f, 70, 20)}}>
        {[0, 1, 2].map((i) => {
          const o = Math.max(0, Math.sin((f / 15) * Math.PI - i * 0.9));
          return (
            <svg key={i} width="110" height="56" viewBox="0 0 120 64" style={{marginBottom: -12, opacity: 0.2 + o * 0.8, transform: `translateY(${o * 12}px)`}}>
              <path d="M12 10 60 50 108 10" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        })}
      </AbsoluteFill>

      {ring > 0 && <div style={{position: 'absolute', left: 540 - 220, top: 340 - 220, width: 440, height: 440, borderRadius: '50%', border: `4px solid ${C.tg}`, transform: `scale(${1 + ring * 3})`, opacity: 1 - ring}} />}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />

      <Sfx name="whoosh" at={0} v={0.5} />
      <Sfx name="pop" at={40} v={0.6} />
      <Sfx name="boom" at={HIT} v={0.8} />
      <VO id="s7" />
    </Bg>
  );
};
