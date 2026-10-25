import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Bg, Device, H, IconCap, IconCheck, IconChip, IconPlay, Reveal, Ripple, Sfx, StepPill, Touch, VO, clamp, ease, glass, pressAt} from '../ui';
import {C} from '../theme';

const PKG = [
  {name: 'Education', Icon: IconCap, a: '#46C1FF', b: C.tg2},
  {name: 'Tech', Icon: IconChip, a: '#A58BFF', b: C.purple},
  {name: 'Entertainment', Icon: IconPlay, a: '#FF7A9A', b: C.pink},
];
const CARD_Y = (i: number) => 650 + i * 296;
const TAP = 108;

export const S4 = () => {
  const f = useCurrentFrame();
  const enter = ease(f, 0, 30);
  const back = ease(f, 38, 28);
  const msg = ease(f, 8, 20);
  const kb = ease(f, 16, 22);
  const picked = f >= TAP;
  const fx = interpolate(f, [68, TAP], [900, 540], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const fy = interpolate(f, [68, TAP], [1760, CARD_Y(0) + 125], {...clamp, easing: Easing.inOut(Easing.cubic)});

  return (
    <Bg y={110}>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110}}>
        <StepPill n={2} at={6} />
        <Reveal at={12} dur={34} style={{marginTop: 26}}>
          <H size={150}>Choose a<br />package.</H>
        </Reveal>
      </AbsoluteFill>

      <div style={{position: 'absolute', left: 180, top: 480, opacity: enter * (1 - back * 0.65), filter: `blur(${back * 14}px)`, transformOrigin: '50% 40%',
        transform: `perspective(2600px) translateY(${(1 - enter) * 300 + back * 120}px) rotateY(${-2 - back * 8}deg) scale(${1 - back * 0.14})`}}>
        <Device title="Adly Bot" sub="bot">
          <div style={{position: 'absolute', left: 24, top: 30, opacity: msg, transform: `translateY(${(1 - msg) * 30}px)`, background: '#182533', borderRadius: 36,
            borderBottomLeftRadius: 12, padding: '26px 36px', color: '#fff', fontSize: 40, fontWeight: 600, width: 540}}>
            Choose an audience package
          </div>
          <div style={{position: 'absolute', left: 24, top: 200, width: 540, opacity: kb * (1 - back * 2), transform: `translateY(${(1 - kb) * 30}px)`}}>
            {PKG.map((p) => (
              <div key={p.name} style={{background: 'rgba(42,171,238,.2)', borderRadius: 26, padding: '28px 0', textAlign: 'center', color: '#fff', fontSize: 40, fontWeight: 600, marginBottom: 12}}>{p.name}</div>
            ))}
          </div>
        </Device>
      </div>

      <AbsoluteFill style={{perspective: 1800}}>
        {PKG.map((p, i) => {
          const s = ease(f, 40 + i * 6, 34);
          const sel = i === 0 && picked;
          const dim = picked && i !== 0 ? ease(f, TAP, 14) : 0;
          const bob = Math.sin((f + i * 24) / 18) * 7;
          const tapScale = i === 0 ? 1 - pressAt(f, TAP) * 0.05 : 1;
          const selE = i === 0 ? ease(f, TAP, 16) : 0;
          return (
            <div key={p.name} style={{
              position: 'absolute', left: 100, top: CARD_Y(i), width: 880, height: 250, boxSizing: 'border-box', padding: '0 44px', display: 'flex', alignItems: 'center', gap: 36,
              ...glass(60, 0.1), opacity: s * (1 - dim * 0.65), filter: `blur(${dim * 4}px)`,
              ...(sel ? {background: `linear-gradient(135deg,#46C1FF,${C.tg2})`, border: '1.5px solid rgba(255,255,255,.55)', boxShadow: `inset 0 2px 0 rgba(255,255,255,.5), 0 0 110px ${C.tg}aa, 0 50px 90px rgba(0,0,0,.5)`} : {}),
              transform: `translateY(${(1 - s) * (1020 - CARD_Y(i)) + bob}px) rotateX(${(1 - s) * 40}deg) rotateY(${-6 * s}deg) scale(${(0.5 + 0.5 * s) * (1 + selE * 0.04) * tapScale * (1 - dim * 0.04)})`,
            }}>
              <div style={{width: 148, height: 148, borderRadius: 40, flexShrink: 0, display: 'grid', placeItems: 'center',
                background: sel ? 'rgba(255,255,255,.25)' : `linear-gradient(160deg,${p.a},${p.b})`, boxShadow: 'inset 0 2px 0 rgba(255,255,255,.4)'}}>
                <p.Icon size={80} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 70, fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1}}>{p.name}</div>
                <div style={{fontSize: 32, fontWeight: 500, color: sel ? 'rgba(255,255,255,.85)' : C.mute, marginTop: 12}}>Audience package</div>
              </div>
              <div style={{width: 76, height: 76, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
                border: sel ? 'none' : '3px solid rgba(255,255,255,.35)', background: sel ? '#fff' : 'transparent', transform: `scale(${sel ? 0.7 + 0.3 * selE : 1})`}}>
                {sel && <IconCheck size={46} color={C.tg2} w={3} />}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      <Ripple x={fx} y={fy} at={TAP} />
      <Touch x={fx} y={fy} press={pressAt(f, TAP)} opacity={ease(f, 64, 8)} />

      <Sfx name="pop" at={10} />
      <Sfx name="slide" at={40} />
      <Sfx name="click" at={TAP} />
      <VO id="s4" />
    </Bg>
  );
};
