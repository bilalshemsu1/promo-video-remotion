import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {AdCard, Bg, CONTENT_H, Device, H, Reveal, Ripple, Sfx, StepPill, Touch, VO, clamp, ease, pressAt} from '../ui';
import {C} from '../theme';

const KF = [0, 30, 36, 52, 58, 84, 90];
const TX = [640, 330, 330, 440, 440, 300, 300];
const TY = [1150, 250, 250, 394, 394, 1028, 1028];
const SHEET_H = 620;

export const S3 = () => {
  const f = useCurrentFrame();
  const enter = ease(f, 0, 40);
  const settle = ease(f, 0, 160);
  const tx = interpolate(f, KF, TX, {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ty = interpolate(f, KF, TY, {...clamp, easing: Easing.inOut(Easing.cubic)});
  const press = Math.max(pressAt(f, 34), pressAt(f, 56), pressAt(f, 88));
  const menu = f < 58 ? ease(f, 36, 14) : 0;
  const sheet = f < 92 ? ease(f, 58, 18) : 1 - ease(f, 92, 14);
  const sent = ease(f, 104, 18);
  const reply = ease(f, 150, 18);
  const inBot = f >= 100;
  const items = ['Reply', 'Forward', 'Copy Text', 'Delete'];
  const rows = ['Saved Messages', 'Friends', '@adly_app'];

  return (
    <Bg y={110}>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110}}>
        <StepPill n={1} at={6} />
        <Reveal at={12} dur={34} style={{marginTop: 26}}>
          <H size={200}>Forward.</H>
        </Reveal>
      </AbsoluteFill>

      <div style={{position: 'absolute', left: 180, top: 480, opacity: enter, transformOrigin: '50% 0',
        transform: `perspective(2600px) translateY(${(1 - enter) * 800}px) rotateX(${10 - 8 * settle}deg) rotateY(${-14 + 12 * settle}deg)`}}>
        <Device title={inBot ? 'Adly Bot' : 'My Channel'} sub={inBot ? 'bot' : 'channel'}>
          {!inBot && (
            <div style={{position: 'absolute', left: 24, top: 30, background: '#182533', borderRadius: 36, padding: 12, filter: f >= 36 && f < 58 ? 'brightness(1.3)' : undefined}}>
              <AdCard w={536} imgH={340} fs={34} />
            </div>
          )}
          {inBot && (
            <>
              <div style={{position: 'absolute', right: 24, top: 30, background: '#2B5278', borderRadius: 36, borderBottomRightRadius: 12, padding: 12,
                opacity: sent, transform: `translateY(${(1 - sent) * 40}px) scale(${0.92 + 0.08 * sent})`, transformOrigin: '100% 0'}}>
                <div style={{color: '#8ECBF2', fontSize: 26, fontWeight: 600, margin: '8px 10px 12px'}}>Forwarded from My Channel</div>
                <AdCard w={470} imgH={230} fs={30} />
              </div>
              <div style={{position: 'absolute', left: 24, top: 520, background: '#182533', borderRadius: 36, borderBottomLeftRadius: 12, padding: '22px 34px',
                display: 'flex', alignItems: 'center', gap: 16, color: '#fff', fontSize: 40, fontWeight: 600, opacity: reply, transform: `translateY(${(1 - reply) * 30}px)`}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m7.5 12.5 3 3 6-6.5" /></svg>
                Ad received
              </div>
            </>
          )}
          {menu > 0.01 && (
            <div style={{position: 'absolute', left: 220, top: 250, width: 440, borderRadius: 40, overflow: 'hidden', background: 'rgba(44,52,62,.94)',
              boxShadow: '0 40px 80px rgba(0,0,0,.55)', opacity: menu, transform: `scale(${0.7 + 0.3 * menu})`, transformOrigin: '0 0'}}>
              {items.map((t, i) => (
                <div key={t} style={{height: 96, display: 'flex', alignItems: 'center', padding: '0 40px', fontSize: 40, fontWeight: 500,
                  color: i === 3 ? C.red : '#fff', background: i === 1 && f >= 46 ? 'rgba(255,255,255,.14)' : 'transparent',
                  borderTop: i ? '1px solid rgba(255,255,255,.1)' : undefined}}>{t}</div>
              ))}
            </div>
          )}
          <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.45 * sheet})`}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: SHEET_H, background: '#1B2632', borderRadius: '48px 48px 0 0',
            transform: `translateY(${(1 - sheet) * SHEET_H}px)`}}>
            <div style={{height: 100, display: 'flex', alignItems: 'center', padding: '0 44px', color: '#9FB2C4', fontSize: 34, fontWeight: 600}}>Forward to…</div>
            {rows.map((t, i) => (
              <div key={t} style={{height: 108, display: 'flex', alignItems: 'center', gap: 26, padding: '0 44px',
                background: i === 2 && f >= 76 && f < 92 ? 'rgba(42,171,238,.22)' : 'transparent'}}>
                <div style={{width: 68, height: 68, borderRadius: '50%', background: i === 2 ? `linear-gradient(135deg,${C.tg},${C.tg2})` : '#33485C'}} />
                <div style={{color: '#fff', fontSize: 36, fontWeight: 600}}>{t}</div>
              </div>
            ))}
          </div>
          <Ripple x={tx} y={ty} at={34} />
          <Ripple x={tx} y={ty} at={56} />
          <Ripple x={tx} y={ty} at={88} />
          <Touch x={tx} y={ty} press={press} opacity={ease(f, 8, 10) * (1 - ease(f, 100, 10))} />
        </Device>
      </div>

      <Sfx name="pop" at={12} />
      <Sfx name="click" at={36} />
      <Sfx name="click" at={58} />
      <Sfx name="pop" at={70} v={0.4} />
      <Sfx name="click" at={90} />
      <Sfx name="whoosh" at={104} v={0.4} />
      <Sfx name="pop" at={150} />
      <VO id="s3" />
    </Bg>
  );
};
