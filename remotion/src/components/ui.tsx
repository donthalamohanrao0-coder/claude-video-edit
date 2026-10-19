import React from 'react';
import {C, FONT, GRAD, SHADOW} from '../theme';

export const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode; accent?: boolean}> = ({
  style,
  children,
  accent = true,
}) => (
  <div
    style={{
      position: 'absolute',
      background: C.card,
      borderRadius: 26,
      boxShadow: SHADOW,
      border: `1.5px solid ${C.line}`,
      fontFamily: FONT,
      color: C.ink,
      overflow: 'hidden',
      ...style,
    }}
  >
    {accent && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: GRAD}} />}
    {children}
  </div>
);

export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({
  children,
  color = C.coral,
  size = 22,
}) => (
  <div style={{fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: 3, color, textTransform: 'uppercase'}}>
    {typeof children === 'string'
      ? children.split(/(n8n)/).map((part, i) => (part === 'n8n' ? <span key={i} style={{textTransform: 'none'}}>n8n</span> : part))
      : children}
  </div>
);

// Small "n8n-style" node: rounded square with icon
export const Node: React.FC<{size?: number; children: React.ReactNode; filled?: boolean}> = ({
  size = 64,
  children,
  filled = true,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: filled ? GRAD : C.coralSoft,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: filled ? '0 8px 20px rgba(234,75,113,0.35)' : 'none',
    }}
  >
    {children}
  </div>
);

const S = (p: {d: string; size?: number; color?: string; stroke?: number; fill?: string}) => (
  <svg width={p.size ?? 34} height={p.size ?? 34} viewBox="0 0 24 24" fill={p.fill ?? 'none'} stroke={p.color ?? '#fff'}
    strokeWidth={p.stroke ?? 2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d={p.d} />
  </svg>
);

export const Icon = {
  check: (size = 34, color = '#fff', len = 1) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - len} />
    </svg>
  ),
  question: (s = 34, c = '#fff') => <S size={s} color={c} d="M9.1 9a3 3 0 1 1 4.2 2.8c-.8.4-1.3 1.1-1.3 2v.7M12 18h.01" />,
  wrench: (s = 34, c = '#fff') => <S size={s} color={c} d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />,
  rocket: (s = 34, c = '#fff') => <S size={s} color={c} d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M12 15l-3-3c1.5-4.5 5-8 11-9-1 6-4.5 9.5-9 11zM9 12H5l2-4h4M12 15v4l4-2v-4" />,
  bolt: (s = 34, c = '#fff') => <S size={s} color={c} d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  clock: (s = 34, c = '#fff') => <S size={s} color={c} d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  thumb: (s = 34, c = '#fff') => <S size={s} color={c} d="M7 10v11H3V10zM7 10l4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18 21H7" />,
  lock: (s = 34, c = '#fff', open = 0) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round">
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0" transform={`translate(${open * 6} ${-open * 2}) rotate(${open * 20} 16 7)`} />
    </svg>
  ),
  bell: (s = 34, c = '#fff') => <S size={s} color={c} d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
  link: (s = 34, c = '#fff') => <S size={s} color={c} d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />,
  arrowDown: (s = 34, c = '#fff') => <S size={s} color={c} d="M12 4v16M5 13l7 7 7-7" />,
  book: (s = 34, c = '#fff') => <S size={s} color={c} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />,
  play: (s = 34, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill={c} /></svg>
  ),
  chat: (s = 34, c = '#fff') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinejoin="round">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1-.4-2.3-1.7-2.7-2.7l.9-1-1-2z" fill={c} stroke="none" />
    </svg>
  ),
};

export const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties; filled?: boolean}> = ({
  children,
  style,
  filled = false,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 26px',
      borderRadius: 999,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 28,
      background: filled ? GRAD : C.card,
      color: filled ? '#fff' : C.ink,
      boxShadow: SHADOW,
      border: filled ? 'none' : `1.5px solid ${C.line}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Hl: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);
