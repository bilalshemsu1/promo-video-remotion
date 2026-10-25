import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {Bg, H, IconEye, IconMega, IconPerson, Reveal, Sfx, VO, clamp, ease, glass} from '../ui';
import {C} from '../theme';

const EXPAND = 55;
const COINS = 9;
const coinAt = (i: number) => 92 + i * 12;
const WALLET_TOP = 1430;
const fmt = (n: number) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const Coin: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const k = f - coinAt(i);
  if (k < 0 || k > 20) return null;
  const x = 540 + (random(`c${i}`) - 0.5) * 240;
  const y = interpolate(k, [0, 18], [1290, WALLET_TOP + 40], {...clamp, easing: Easing.in(Easing.quad)});
  return (
    <div style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: '50%', display: 'grid', placeItems: 'center',
      background: 'radial-gradient(circle at 32% 26%,#FFF4B8,#FFC93C 55%,#E39B00)', boxShadow: 'inset 0 0 0 6px rgba(255,255,255,.22), 0 12px 24px rgba(0,0,0,.35)',
      fontSize: 38, fontWeight: 700, color: '#9A6700', opacity: Math.min(1, k / 3), transform: `rotateY(${k * 26}deg)`}}>
      Br
    </div>
  );
};

const Avatar: React.FC<{label: string; tint: string; icon: React.ReactNode}> = ({label, tint, icon}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
    <div style={{width: 230, height: 230, borderRadius: '50%', display: 'grid', placeItems: 'center', ...glass(230, 0.16), boxShadow: `inset 0 2px 0 rgba(255,255,255,.4), 0 30px 70px ${tint}`}}>{icon}</div>
    <div style={{fontSize: 66, fontWeight: 700, color: '#fff', letterSpacing: '-0.04em'}}>{label}</div>
  </div>
);

export const S6 = () => {
  const f = useCurrentFrame();
  const enter = ease(f, 0, 30);
  const ex = interpolate(f, [EXPAND, EXPAND + 24], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const topH = interpolate(ex, [0, 1], [960, 360]);
  const views = interpolate(f, [EXPAND + 30, 225], [0, 48000], clamp);
  const bump = Array.from({length: COINS}, (_, i) => {
    const k = f - (coinAt(i) + 18);
    return k >= 0 ? Math.exp(-k / 5) : 0;
  }).reduce((a, b) => Math.max(a, b), 0);
  const walletIn = ease(f, EXPAND + 14, 30);
  const cy = interpolate(ex, [0, 1], [1440, 530]);

  return (
    <Bg y={50}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: topH, overflow: 'hidden', transform: `translateY(${-(1 - enter) * 960}px)`,
        background: 'linear-gradient(170deg,#0B3A74,#1B8FD6)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${1 - ex * 0.42})`}}><Avatar label="Advertiser" tint="rgba(0,40,100,.7)" icon={<IconPerson size={120} />} /></div>
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: topH, bottom: 0, transform: `translateY(${(1 - enter) * 960}px)`,
        background: 'linear-gradient(200deg,#3A2A9C 0%,#A63AB0 62%,#FF6A5A 125%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: cy - 165, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - enter) * 960}px) scale(${1 - ex * 0.42})`}}>
        <Avatar label="Channel Owner" tint="rgba(60,0,80,.7)" icon={<IconMega size={118} />} />
      </div>

      <AbsoluteFill style={{alignItems: 'center'}}>
        <Reveal at={EXPAND + 16} dur={34} style={{marginTop: 760}}>
          <H size={132}>Earn from<br />real views.</H>
        </Reveal>
      </AbsoluteFill>
      <Reveal at={EXPAND + 30} dur={30} style={{position: 'absolute', top: 1080, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24}}>
        <IconEye size={96} />
        <div style={{fontSize: 150, fontWeight: 700, color: '#fff', letterSpacing: '-0.045em', lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{fmt(views)}</div>
      </Reveal>

      {f >= EXPAND + 10 && (
        <>
          <AbsoluteFill>{Array.from({length: COINS}, (_, i) => <Coin key={i} i={i} />)}</AbsoluteFill>
          <div style={{position: 'absolute', left: 540 - 300, top: WALLET_TOP, width: 600, height: 330, borderRadius: 72, overflow: 'hidden', opacity: walletIn,
            background: `linear-gradient(135deg,${C.orange},${C.pink})`, boxShadow: 'inset 0 3px 0 rgba(255,255,255,.5), 0 50px 90px rgba(0,0,0,.5)',
            transform: `translateY(${(1 - walletIn) * 80}px) scale(${1 + bump * 0.05})`}}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(150deg,rgba(255,255,255,.3),transparent 50%)'}} />
            <div style={{position: 'absolute', left: 48, bottom: 40, fontSize: 52, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em'}}>Your earnings</div>
            <div style={{position: 'absolute', right: 48, top: 44, width: 80, height: 56, borderRadius: 14, background: 'rgba(255,255,255,.3)'}} />
          </div>
        </>
      )}

      <Sfx name="whoosh" at={EXPAND} v={0.6} />
      {Array.from({length: COINS}, (_, i) => <Sfx key={i} name="coin" at={coinAt(i) + 16} v={0.55} />)}
      <VO id="s6" />
    </Bg>
  );
};
