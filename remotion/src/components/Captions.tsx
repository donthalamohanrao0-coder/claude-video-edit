import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, FPS, SHADOW, life, ramp} from '../theme';

// English captions, only on key lines. *word* = coral highlight. Times are master seconds.
export const LINES: {s: number; e: number; text: string}[] = [
  {s: 0.08, e: 2.55, text: 'If you clicked on this video, either you want to learn *n8n*'},
  {s: 2.55, e: 4.86, text: "but you don't know *where to start*,"},
  {s: 4.91, e: 7.82, text: "or you're learning *n8n* but can't *build projects*,"},
  {s: 7.88, e: 11.72, text: 'or you want to learn *AI skills* and start your *career in AI*.'},
  {s: 11.78, e: 14.85, text: 'Whichever of these 3 you are, *this course is for you.*'},
  {s: 52.33, e: 54.1, text: 'My goal is simple:'},
  {s: 54.1, e: 56.8, text: 'the most valuable *AI content* for our Telugu audience, *for free*.'},
  {s: 69.29, e: 71.5, text: 'If we hit the *500 likes* target,'},
  {s: 71.55, e: 76.48, text: "I'll upload a tutorial on the *advanced projects* I built for my clients."},
  {s: 76.54, e: 77.65, text: "So let's *hit that target!*"},
  {s: 131.0, e: 134.12, text: 'Join the *community group* and ping me,'},
  {s: 134.16, e: 137.82, text: 'tag me in the *WhatsApp* group with any doubt,'},
  {s: 137.88, e: 139.3, text: "and I'll reply *right away*."},
  {s: 139.44, e: 142.6, text: "So without any delay, let's jump into *Part 1*."},
];

const Line: React.FC<{s: number; e: number; text: string}> = ({s, e, text}) => {
  const frame = useCurrentFrame();
  const {t, enter, exit} = life(frame, s, e, 0.18);
  const words = text.split(' ');
  // reveal words across the first 55% of the line's duration
  const span = Math.max(0.4, (e - s) * 0.55);
  let hl = false;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 70,
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(1, enter * 1.5) * (1 - exit),
        transform: `translateY(${(1 - enter) * 26 - exit * 10}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1640,
          padding: '16px 34px',
          borderRadius: 22,
          background: C.card,
          boxShadow: SHADOW,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.3,
          color: C.ink,
          textAlign: 'center',
        }}
      >
        {words.map((w, i) => {
          const open = w.startsWith('*');
          if (open) hl = true;
          const isHl = hl;
          if (w.endsWith('*') || w.endsWith('*.') || w.endsWith('*,') || w.endsWith('*!')) hl = false;
          const k = ramp(t, s + (span * i) / words.length, s + (span * i) / words.length + 0.16);
          return (
            <span key={i} style={{display: 'inline-block', opacity: 0.3 + 0.7 * k, transform: `translateY(${(1 - k) * 8}px)`,
              color: isHl ? C.coral : C.ink, marginRight: 13}}>
              {w.replace(/\*/g, '')}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <>
      {LINES.filter((l) => t >= l.s - 0.02 && t <= l.e).map((l) => (
        <Line key={l.s} {...l} />
      ))}
    </>
  );
};
