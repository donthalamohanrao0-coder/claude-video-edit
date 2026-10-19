import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;

// n8n coral on a light theme
export const C = {
  coral: '#EA4B71',
  coral2: '#FF6D5A',
  coralSoft: '#FDE8EE',
  ink: '#1A1A2B',
  sub: '#5E5E73',
  card: 'rgba(255,255,255,0.96)',
  line: 'rgba(26,26,43,0.08)',
  bg: '#F6F4F7',
  green: '#25D366',
};

export const GRAD = `linear-gradient(100deg, ${C.coral} 0%, ${C.coral2} 100%)`;
export const SHADOW = '0 18px 50px rgba(40,20,45,0.22), 0 2px 8px rgba(40,20,45,0.10)';
export const FONT = 'PoppinsX, sans-serif';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Entrance spring (0→1) from `start` seconds and exit ramp (0→1) ending at `end`.
export const life = (frame: number, start: number, end: number, outDur = 0.3) => {
  const t = frame / FPS;
  const enter = spring({frame: frame - start * FPS, fps: FPS, config: {damping: 15, stiffness: 160, mass: 0.8}});
  const exit = interpolate(t, [end - outDur, end], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return {t, enter, exit, on: t >= start - 0.02 && t <= end};
};

export const pop = (frame: number, at: number, cfg = {damping: 12, stiffness: 200, mass: 0.7}) =>
  spring({frame: frame - at * FPS, fps: FPS, config: cfg});

export const ramp = (t: number, a: number, b: number, from = 0, to = 1, ease = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [from, to], {...clamp, easing: ease});
