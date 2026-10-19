import React from 'react';
import {AbsoluteFill, Easing, Freeze, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import cues from '../data/cues.json';
import {C, FPS, clamp, ramp} from '../theme';

const levels = [...cues.cuts, ...cues.switches].sort((a, b) => a - b);

// Zoom = alternating base level per segment (hides jump cuts) + slow push-in + punch-ins + whips.
const zoomAt = (t: number) => {
  let i = 0;
  while (i < levels.length && levels[i] <= t) i++;
  const segStart = i === 0 ? 0 : levels[i - 1];
  const segEnd = i < levels.length ? levels[i] : cues.videoEnd;
  let z = i % 2 === 0 ? 1.0 : 1.085;
  z += 0.03 * ramp(t, segStart, segEnd, 0, 1, Easing.linear);
  for (const p of cues.punches) {
    z += 0.1 * ramp(t, p - 0.06, p + 0.14, 0, 1, Easing.out(Easing.cubic)) * (1 - ramp(t, p + 1.1, p + 1.6, 0, 1, Easing.inOut(Easing.cubic)));
  }
  let blur = 0;
  for (const w of cues.whips) {
    const k = Math.max(0, 1 - Math.abs(t - w) / 0.16);
    z += 0.16 * k * k;
    blur = Math.max(blur, 9 * k);
  }
  return {z, blur};
};

export const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const {z, blur} = zoomAt(Math.min(t, cues.videoEnd));
  // roadmap split layout: 0 = full frame, 1 = framed on the left
  const r =
    ramp(t, cues.roadmap.in, cues.roadmap.in + 0.7, 0, 1, Easing.inOut(Easing.cubic)) *
    (1 - ramp(t, cues.roadmap.out, cues.roadmap.out + 0.7, 0, 1, Easing.inOut(Easing.cubic)));
  const box = {
    x: interpolate(r, [0, 1], [0, 90]),
    y: interpolate(r, [0, 1], [0, 200]),
    w: interpolate(r, [0, 1], [1920, 1000]),
    rad: interpolate(r, [0, 1], [0, 30]),
  };
  const h = (box.w * 9) / 16;
  const endBlur = ramp(t, cues.outro.endCard - 0.1, cues.outro.endCard + 0.5, 0, 14);
  const video = <OffthreadVideo src={staticFile('master.mp4')} muted style={{width: '100%', height: '100%'}} />;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {r > 0 && <RoadmapBg r={r} />}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y,
          width: box.w,
          height: h,
          borderRadius: box.rad,
          overflow: 'hidden',
          boxShadow: r > 0 ? `0 30px 80px rgba(40,20,45,${0.28 * r})` : 'none',
          outline: r > 0 ? `${6 * r}px solid rgba(255,255,255,${r})` : 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${z})`,
            transformOrigin: '50% 30%',
            filter: blur + endBlur > 0.2 ? `blur(${blur + endBlur}px)` : undefined,
          }}
        >
          {t >= cues.videoEnd - 1 / FPS ? <Freeze frame={Math.floor(cues.videoEnd * FPS) - 2}>{video}</Freeze> : video}
        </div>
        {/* soft vignette */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 60%, rgba(20,10,20,0.22) 100%)'}} />
      </div>
    </AbsoluteFill>
  );
};

const RoadmapBg: React.FC<{r: number}> = ({r}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: r, background: C.bg}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.line} 1.5px, transparent 1.5px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: `${(frame * 0.3) % 60}px ${(frame * 0.3) % 60}px`,
        }}
      />
      <div style={{position: 'absolute', width: 900, height: 900, left: -250, top: -300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234,75,113,0.22), transparent 65%)'}} />
      <div style={{position: 'absolute', width: 900, height: 900, right: -300, bottom: -350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,109,90,0.18), transparent 65%)'}} />
    </AbsoluteFill>
  );
};

export const roadmapProgress = (t: number) =>
  interpolate(t, [cues.roadmap.in, cues.roadmap.in + 0.7, cues.roadmap.out, cues.roadmap.out + 0.7], [0, 1, 1, 0], clamp);
