import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT} from './theme';
import voManifest from '../public/audio/vo/manifest.json';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** expo-out: the "Apple" ease — fast start, long soft landing */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const ease = (f: number, start: number, dur = 30) => interpolate(f, [start, start + dur], [0, 1], {...clamp, easing: EASE});
export const useEase = (start = 0, dur = 30) => ease(useCurrentFrame(), start, dur);
export const pressAt = (f: number, at: number) => interpolate(f, [at - 3, at, at + 7], [0, 1, 0], clamp);

/* ---------- audio ---------- */
export const Sfx: React.FC<{name: string; at?: number; v?: number}> = ({name, at = 0, v = 0.7}) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`audio/sfx/${name}.wav`)} volume={v} />
  </Sequence>
);
export const VO: React.FC<{id: string}> = ({id}) =>
  (voManifest as Record<string, boolean>)[id] ? (
    <Sequence from={6} layout="none">
      <Audio src={staticFile(`audio/vo/${id}.mp3`)} volume={1} />
    </Sequence>
  ) : null;

/* ---------- backdrop ---------- */
export const Bg: React.FC<{children?: React.ReactNode; glow?: string; y?: number}> = ({children, glow = C.tg, y = 105}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.dark}}>
      <AbsoluteFill style={{background: `radial-gradient(1000px 800px at ${50 + 10 * Math.sin(f / 80)}% ${y}%, ${glow}40, transparent 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,.6) 100%)'}} />
      {children}
    </AbsoluteFill>
  );
};

/* ---------- type ---------- */
export const Reveal: React.FC<{at: number; dur?: number; y?: number; blur?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  at, dur = 28, y = 40, blur = 16, style, children,
}) => {
  const p = useEase(at, dur);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * y}px)`, filter: `blur(${(1 - p) * blur}px)`, ...style}}>{children}</div>;
};

export const H: React.FC<{size?: number; tone?: 'white' | 'blue'; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 150, tone = 'white', children, style}) => (
  <div
    style={{
      fontSize: size, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.02, textAlign: 'center', whiteSpace: 'nowrap',
      background: tone === 'white' ? 'linear-gradient(180deg,#FFFFFF 30%,#A9DBFF 130%)' : `linear-gradient(90deg,#9ADBFF,${C.tg} 55%,#8FA2FF)`,
      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', ...style,
    }}
  >
    {children}
  </div>
);

export const StepPill: React.FC<{n: number; at?: number}> = ({n, at = 0}) => (
  <Reveal at={at} y={20} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 30px 12px 14px', borderRadius: 100, ...glass(100, 0.1)}}>
    <div style={{width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(180deg,#46C1FF,${C.tg2})`, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 700, color: '#fff'}}>{n}</div>
    <div style={{fontSize: 36, fontWeight: 600, color: C.sky, letterSpacing: '-0.01em'}}>Step {n}</div>
  </Reveal>
);

export function glass(r = 48, a = 0.08): React.CSSProperties {
  return {
    background: `rgba(255,255,255,${a})`, backdropFilter: 'blur(40px) saturate(160%)', border: '1.5px solid rgba(255,255,255,.16)', borderRadius: r,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.3), 0 40px 80px rgba(0,0,0,.45)',
  };
}

/* ---------- brand ---------- */
export const Plane: React.FC<{size?: number; color?: string}> = ({size = 120, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M21.6 3.4 2.9 10.6c-.9.35-.88 1.6.03 1.9l4.6 1.45 1.8 5.5c.25.75 1.2.95 1.75.4l2.5-2.45 4.5 3.3c.65.48 1.58.12 1.78-.68L23.4 4.7c.22-.97-.8-1.7-1.8-1.3Z" />
    <path fill="#000" fillOpacity=".14" d="M9.4 14.3 20 6.2 11.2 15.9 10.9 19.8Z" />
  </svg>
);

export const AppIcon: React.FC<{size?: number}> = ({size = 300}) => (
  <div
    style={{
      position: 'relative', width: size, height: size, borderRadius: size * 0.2237, overflow: 'hidden', display: 'grid', placeItems: 'center',
      background: 'linear-gradient(180deg,#4CC4FF 0%,#1B8FD6 100%)',
      boxShadow: `0 ${size * 0.12}px ${size * 0.3}px rgba(0,0,0,.55), 0 0 ${size * 0.6}px rgba(42,171,238,.4), inset 0 2px 0 rgba(255,255,255,.5)`,
    }}
  >
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(155deg,rgba(255,255,255,.38),transparent 48%)'}} />
    <div style={{fontFamily: FONT, fontSize: size * 0.54, fontWeight: 800, color: '#fff', letterSpacing: '-0.06em', lineHeight: 1}}>A</div>
  </div>
);

/* ---------- icons ---------- */
export const Icon: React.FC<{size?: number; color?: string; w?: number; children: React.ReactNode}> = ({size = 64, color = '#fff', w = 1.7, children}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
export const IconCap = (p: {size?: number}) => <Icon {...p}><path d="m2 9 10-5 10 5-10 5Z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6" /></Icon>;
export const IconChip = (p: {size?: number}) => <Icon {...p}><rect x="6" y="6" width="12" height="12" rx="2.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></Icon>;
export const IconPlay = (p: {size?: number}) => <Icon {...p}><rect x="3" y="4.5" width="18" height="15" rx="4" /><path d="m10 9 5 3-5 3Z" fill="#fff" /></Icon>;
export const IconCheck = (p: {size?: number; color?: string; w?: number}) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>;
export const IconPerson = (p: {size?: number}) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></Icon>;
export const IconMega = (p: {size?: number}) => <Icon {...p}><path d="M3 10v4h3l8 4V6L6 10Z" /><path d="M17.5 9.5a4 4 0 0 1 0 5" /></Icon>;
export const IconEye = (p: {size?: number}) => <Icon {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon>;

/* ---------- device ---------- */
export const CONTENT_W = 688;
export const HEAD = 170;
export const CONTENT_H = 1448 - HEAD;

export const Device: React.FC<{title: string; sub?: string; children: React.ReactNode}> = ({title, sub, children}) => (
  <div
    style={{
      width: 720, height: 1480, borderRadius: 116, padding: 16, boxSizing: 'border-box',
      background: 'linear-gradient(145deg,#9AA5B0,#2B3138 28%,#6B7580 52%,#1C2127 78%,#A3AEB9)',
      boxShadow: '0 90px 180px rgba(0,0,0,.7), 0 0 140px rgba(42,171,238,.28), inset 0 0 0 2px rgba(255,255,255,.28)',
    }}
  >
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 100, background: '#0E1621', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 22, left: '50%', marginLeft: -92, width: 184, height: 52, borderRadius: 26, background: '#000', zIndex: 30}} />
      <div style={{position: 'absolute', top: 30, left: 64, fontSize: 30, fontWeight: 600, color: '#fff', zIndex: 31}}>9:41</div>
      <div style={{height: HEAD, background: '#17212B', display: 'flex', alignItems: 'flex-end', gap: 20, padding: '0 36px 22px'}}>
        <div style={{width: 70, height: 70, borderRadius: '50%', background: `linear-gradient(135deg,${C.tg},${C.purple})`, flexShrink: 0}} />
        <div>
          <div style={{color: '#fff', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em'}}>{title}</div>
          {sub && <div style={{color: '#6D7F8F', fontSize: 25, fontWeight: 500}}>{sub}</div>}
        </div>
      </div>
      <div style={{position: 'absolute', top: HEAD, left: 0, right: 0, bottom: 0, overflow: 'hidden'}}>{children}</div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg,rgba(255,255,255,.1) 0%,transparent 34%)', zIndex: 40, pointerEvents: 'none'}} />
    </div>
  </div>
);

/** finger-touch indicator, centered on (x,y) */
export const Touch: React.FC<{x: number; y: number; press?: number; opacity?: number}> = ({x, y, press = 0, opacity = 1}) => (
  <div
    style={{
      position: 'absolute', left: x - 44, top: y - 44, width: 88, height: 88, borderRadius: '50%', zIndex: 60, opacity,
      background: 'rgba(255,255,255,.32)', border: '2px solid rgba(255,255,255,.75)', backdropFilter: 'blur(6px)',
      boxShadow: '0 12px 30px rgba(0,0,0,.45)', transform: `scale(${1 - press * 0.28})`,
    }}
  />
);

export const Ripple: React.FC<{x: number; y: number; at: number; color?: string}> = ({x, y, at, color = '#fff'}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 20) return null;
  const p = f / 20;
  return <div style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: '50%', border: `4px solid ${color}`, transform: `scale(${0.6 + p * 2})`, opacity: 0.8 * (1 - p), zIndex: 55}} />;
};

/** shared bits of the sample ad used in the phone */
export const AdCard: React.FC<{w: number; imgH: number; fs: number}> = ({w, imgH, fs}) => (
  <div style={{width: w}}>
    <div
      style={{
        height: imgH, borderRadius: 26, display: 'grid', placeItems: 'center', color: '#fff', fontSize: imgH * 0.17, fontWeight: 700, letterSpacing: '-0.03em',
        background: 'radial-gradient(circle at 20% 25%,#FFB36B 0%,transparent 55%),radial-gradient(circle at 85% 80%,#7D5BFF 0%,transparent 55%),linear-gradient(135deg,#FF375F,#FF9F0A)',
      }}
    >
      Your ad here
    </div>
    <div style={{color: '#fff', fontSize: fs, fontWeight: 700, lineHeight: 1.3, margin: '16px 8px 0'}}>አዲስ ኮርስ ተከፍቷል! አሁኑኑ ይመዝገቡ</div>
    <div style={{color: '#7B8FA3', fontSize: 24, textAlign: 'right', margin: '6px 8px 0'}}>10:42</div>
  </div>
);
