import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import cues from '../data/cues.json';
import {C, FONT, FPS, GRAD, SHADOW, clamp, life, pop, ramp} from '../theme';
import {Card, Hl, Icon, Label, Node, Pill} from './ui';

type Dir = 'left' | 'right' | 'up' | 'down' | 'scale';

// Wrapper that animates a block in at `s` and out at `e`.
const Beat: React.FC<{s: number; e: number; from?: Dir; children: React.ReactNode; style?: React.CSSProperties}> = ({
  s,
  e,
  from = 'up',
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const {enter, exit, on} = life(frame, s, e);
  if (!on) return null;
  const d = 1 - enter;
  const tr =
    from === 'left' ? `translateX(${-d * 120 - exit * 60}px)` :
    from === 'right' ? `translateX(${d * 120 + exit * 60}px)` :
    from === 'down' ? `translateY(${d * 80}px)` :
    from === 'scale' ? `scale(${0.6 + 0.4 * enter - exit * 0.1})` :
    `translateY(${-d * 80 - exit * 30}px)`;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, enter * 1.6) * (1 - exit), transform: tr, ...style}}>
      {children}
    </div>
  );
};

const useT = () => useCurrentFrame() / FPS;

// ---------- Hook: "sound like you?" checklist ----------
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const items = [
    {at: cues.hook.items[0], icon: Icon.question, text: "Don't know where to start?"},
    {at: cues.hook.items[1], icon: Icon.wrench, text: "Can't build real projects?"},
    {at: cues.hook.items[2], icon: Icon.rocket, text: 'Want a career in AI?'},
  ];
  return (
    <Beat s={1.2} e={cues.hook.end} from="right">
      <Card style={{left: 1410, top: 150, width: 460, padding: '30px 30px 18px 40px'}}>
        <Label>Sound like you?</Label>
        <div style={{height: 14}} />
        {items.map((it, i) => {
          const k = pop(frame, it.at);
          const ck = ramp(t, cues.hook.checks[i], cues.hook.checks[i] + 0.25);
          if (t < it.at - 0.02) return null;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, height: 92 * Math.min(1, k * 1.15), opacity: Math.min(1, k * 1.5),
              transform: `translateX(${(1 - k) * 40}px)`}}>
              <Node size={58} filled={ck < 0.5}>{ck < 0.5 ? it.icon(30) : Icon.check(32, C.coral, ck)}</Node>
              <div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.2}}>{it.text}</div>
            </div>
          );
        })}
      </Card>
    </Beat>
  );
};

const Stamp: React.FC<{s: number; e: number; children: React.ReactNode; top?: number; left?: number; rot?: number; size?: number}> = ({
  s, e, children, top = 600, left, rot = -3, size = 64,
}) => {
  const frame = useCurrentFrame();
  const {enter, exit, on} = life(frame, s, e, 0.25);
  if (!on) return null;
  const k = pop(frame, s, {damping: 9, stiffness: 220, mass: 0.6});
  return (
    <div style={{position: 'absolute', top, left: left ?? 0, right: left === undefined ? 0 : undefined, display: 'flex',
      justifyContent: 'center', opacity: Math.min(1, enter * 2) * (1 - exit)}}>
      <div style={{transform: `scale(${1.6 - 0.6 * k}) rotate(${rot}deg)`, background: GRAD, color: '#fff', fontFamily: FONT,
        fontWeight: 900, fontSize: size, padding: '14px 40px', borderRadius: 20, boxShadow: '0 20px 60px rgba(234,75,113,0.45)',
        letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
        {children}
      </div>
    </div>
  );
};

// ---------- Scratch → Advanced ----------
const Scratch: React.FC = () => {
  const t = useT();
  const fill = ramp(t, cues.scratch.fill, cues.scratch.fill + 2.6, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <Beat s={cues.scratch.in} e={cues.scratch.end} from="left">
      <Card style={{left: 60, top: 170, width: 470, padding: '30px 34px 30px 44px'}}>
        <Label>n8n · Step by step</Label>
        <div style={{fontSize: 40, fontWeight: 800, marginTop: 10, lineHeight: 1.15}}>
          Scratch <span style={{color: C.coral}}>→</span> <Hl>Advanced</Hl>
        </div>
        <div style={{marginTop: 24, height: 16, borderRadius: 99, background: C.coralSoft, overflow: 'hidden'}}>
          <div style={{width: `${fill * 100}%`, height: '100%', background: GRAD, borderRadius: 99}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 18, fontWeight: 700, color: C.sub,
          letterSpacing: 2}}>
          <span>BEGINNER</span><span style={{color: fill > 0.98 ? C.coral : C.sub}}>PRO</span>
        </div>
      </Card>
    </Beat>
  );
};

// ---------- Concept checklist ----------
const Concepts: React.FC = () => {
  const frame = useCurrentFrame();
  const items = ['Every n8n concept', 'Practical examples', 'Real-world projects'];
  return (
    <Beat s={cues.concepts.items[0] - 0.1} e={cues.concepts.end} from="left">
      <div style={{position: 'absolute', left: 60, top: 190, display: 'flex', flexDirection: 'column', gap: 20}}>
        {items.map((txt, i) => {
          const at = cues.concepts.items[i];
          const k = pop(frame, at);
          if (frame / FPS < at - 0.02) return null;
          return (
            <div key={i} style={{opacity: Math.min(1, k * 1.5), transform: `translateX(${(1 - k) * -50}px)`}}>
              <Pill style={{fontSize: 30, padding: '14px 30px 14px 16px'}}>
                <Node size={46}>{Icon.check(28, '#fff', ramp(frame / FPS, at + 0.1, at + 0.4))}</Node>
                {txt}
              </Pill>
            </div>
          );
        })}
      </div>
    </Beat>
  );
};

// ---------- "One of the most advanced" ----------
const Advanced: React.FC = () => {
  const t = useT();
  const hl = ramp(t, cues.advanced.hl - 0.1, cues.advanced.hl + 0.35);
  return (
    <Beat s={cues.advanced.in} e={cues.advanced.end} from="right">
      <Card style={{left: 1420, top: 170, width: 450, padding: '30px 30px 32px 42px'}}>
        <Label>Honestly,</Label>
        <div style={{fontSize: 34, fontWeight: 700, marginTop: 8}}>one of the most</div>
        <div style={{position: 'relative', display: 'inline-block', marginTop: 6}}>
          <div style={{position: 'absolute', inset: '-4px -14px', background: GRAD, borderRadius: 14,
            transform: `scaleX(${hl})`, transformOrigin: 'left'}} />
          <div style={{position: 'relative', fontSize: 52, fontWeight: 900, color: hl > 0.5 ? '#fff' : C.ink}}>ADVANCED</div>
        </div>
        <div style={{fontSize: 30, fontWeight: 700, marginTop: 12, lineHeight: 1.2}}>
          n8n tutorials in <span style={{color: C.coral}}>Telugu</span>
        </div>
      </Card>
    </Beat>
  );
};

// ---------- Lower third ----------
const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const {on, exit} = life(frame, cues.lowerThird.in, cues.lowerThird.end);
  if (!on) return null;
  const bar = ramp(t, cues.lowerThird.in, cues.lowerThird.in + 0.35, 0, 1, Easing.out(Easing.exp));
  const txt = ramp(t, cues.lowerThird.in + 0.2, cues.lowerThird.in + 0.6);
  return (
    <div style={{position: 'absolute', left: 90, top: 760, opacity: 1 - exit, transform: `translateX(${-exit * 60}px)`}}>
      <div style={{position: 'relative', overflow: 'hidden', borderRadius: 22, boxShadow: SHADOW}}>
        <div style={{background: C.card, padding: '22px 44px 22px 34px', display: 'flex', alignItems: 'center', gap: 22,
          clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)`}}>
          <Node size={70}>{Icon.bolt(38)}</Node>
          <div style={{opacity: txt, transform: `translateY(${(1 - txt) * 14}px)`}}>
            <div style={{fontFamily: FONT, fontSize: 52, fontWeight: 800, color: C.ink, lineHeight: 1}}>Mohan</div>
            <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.coral, marginTop: 8, letterSpacing: 1}}>
              n8n Automation Expert
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, bottom: 0, height: 6, width: `${bar * 100}%`, background: GRAD}} />
      </div>
    </div>
  );
};

// ---------- Stat cards ----------
const Stat: React.FC<{s: number; e: number; big: string; count?: number; suffix?: string; label: string; chipsAt?: number}> = ({
  s, e, big, count, suffix = '', label, chipsAt,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const n = count !== undefined ? Math.round(ramp(t, s + 0.1, s + 1.2, 0, count, Easing.out(Easing.cubic))) : null;
  return (
    <Beat s={s} e={e} from="right">
      <Card style={{left: 1450, top: 190, width: 420, padding: '28px 30px 30px 42px'}}>
        <div style={{fontSize: 108, fontWeight: 900, lineHeight: 1, letterSpacing: -2}}>
          <Hl>{n !== null ? `${n}${suffix}` : big}</Hl>
        </div>
        <div style={{fontSize: 28, fontWeight: 700, marginTop: 10, lineHeight: 1.2}}>{label}</div>
        {chipsAt !== undefined && (
          <div style={{display: 'flex', gap: 10, marginTop: 18}}>
            {['US', 'UK', 'INDIA'].map((c, i) => {
              const k = pop(frame, chipsAt + i * 0.12);
              return (
                <div key={c} style={{opacity: t < chipsAt + i * 0.12 ? 0 : Math.min(1, k * 1.5), transform: `scale(${0.6 + 0.4 * k})`,
                  padding: '8px 18px', borderRadius: 99, background: C.coralSoft, color: C.coral, fontWeight: 800, fontSize: 22,
                  letterSpacing: 1.5}}>
                  {c}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Beat>
  );
};

// ---------- 7-hour course ----------
const SevenHour: React.FC = () => {
  const t = useT();
  const ring = ramp(t, cues.sevenHour.in + 0.1, cues.sevenHour.in + 1.4, 0, 1, Easing.inOut(Easing.cubic));
  const R = 62;
  const L = 2 * Math.PI * R;
  return (
    <Beat s={cues.sevenHour.in} e={cues.sevenHour.end} from="right">
      <Card style={{left: 1430, top: 180, width: 440, padding: '30px 30px 30px 42px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <svg width={150} height={150} viewBox="0 0 150 150">
            <defs>
              <linearGradient id="g7" x1="0" x2="1"><stop offset="0" stopColor={C.coral} /><stop offset="1" stopColor={C.coral2} /></linearGradient>
            </defs>
            <circle cx={75} cy={75} r={R} stroke={C.coralSoft} strokeWidth={14} fill="none" />
            <circle cx={75} cy={75} r={R} stroke="url(#g7)" strokeWidth={14} fill="none" strokeLinecap="round"
              strokeDasharray={L} strokeDashoffset={L * (1 - ring)} transform="rotate(-90 75 75)" />
            <text x={75} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.ink}>7</text>
          </svg>
          <div>
            <div style={{fontSize: 46, fontWeight: 900, lineHeight: 1}}>HOURS</div>
            <div style={{fontSize: 24, fontWeight: 700, color: C.sub, marginTop: 8}}>complete course</div>
          </div>
        </div>
      </Card>
    </Beat>
  );
};

// ---------- Price comparison ----------
const Price: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const strike = ramp(t, cues.price.strike, cues.price.strike + 0.3, 0, 1, Easing.out(Easing.exp));
  const k = pop(frame, cues.price.free);
  return (
    <>
      <Beat s={cues.price.in} e={cues.price.end} from="left">
        <Card style={{left: 60, top: 190, width: 420, padding: '28px 30px 30px 42px', opacity: 1 - 0.35 * strike}} accent={false}>
          <Label color={C.sub}>Others charge</Label>
          <div style={{position: 'relative', display: 'inline-block', marginTop: 10}}>
            <div style={{fontSize: 64, fontWeight: 900, color: C.ink}}>₹ 1000s</div>
            <div style={{position: 'absolute', left: -8, top: '52%', height: 8, width: `${strike * 110}%`, background: C.coral,
              borderRadius: 8, transform: 'rotate(-6deg)'}} />
          </div>
          <div style={{fontSize: 24, fontWeight: 600, color: C.sub, marginTop: 6}}>for the same content</div>
        </Card>
      </Beat>
      {t >= cues.price.free - 0.02 && (
        <Beat s={cues.price.free} e={cues.price.end} from="scale">
          <Card style={{left: 1450, top: 190, width: 420, padding: '28px 30px 30px 42px'}}>
            <Label>On our channel</Label>
            <div style={{fontSize: 92, fontWeight: 900, lineHeight: 1.05, marginTop: 6, transform: `scale(${0.8 + 0.2 * k})`,
              transformOrigin: 'left'}}>
              <Hl>FREE</Hl>
            </div>
          </Card>
        </Beat>
      )}
    </>
  );
};

// ---------- Subscribe ----------
const Subscribe: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const {click} = cues.subscribe;
  const done = t >= click;
  const press = 1 - 0.08 * Math.max(0, 1 - Math.abs(t - click) / 0.12);
  const cx = interpolate(t, [cues.subscribe.in + 0.4, click], [300, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cy = interpolate(t, [cues.subscribe.in + 0.4, click], [160, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const bell = done ? Math.sin((t - click) * 30) * 18 * Math.max(0, 1 - (t - click) / 0.8) : 0;
  return (
    <Beat s={cues.subscribe.in} e={cues.subscribe.end} from="down">
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <Pill style={{fontSize: 24, letterSpacing: 2, color: C.coral}}>SUPPORT THIS JOURNEY</Pill>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{transform: `scale(${press})`, padding: '22px 46px', borderRadius: 16, fontFamily: FONT, fontWeight: 800,
            fontSize: 40, letterSpacing: 1, color: done ? C.ink : '#fff', background: done ? '#E9E7EC' : '#FF0033', boxShadow: SHADOW,
            display: 'flex', alignItems: 'center', gap: 14}}>
            {Icon.play(34, done ? C.ink : '#fff')}
            {done ? 'SUBSCRIBED' : 'SUBSCRIBE'}
          </div>
          <div style={{width: 84, height: 84, borderRadius: 18, background: C.card, boxShadow: SHADOW, display: 'flex',
            alignItems: 'center', justifyContent: 'center', transform: `rotate(${bell}deg)`}}>
            {Icon.bell(42, done ? C.coral : C.ink)}
          </div>
          {/* cursor */}
          <svg width={54} height={54} viewBox="0 0 24 24" style={{position: 'absolute', left: 230 + cx, top: 50 + cy,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))'}}>
            <path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke={C.ink} strokeWidth={1.5} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Beat>
  );
};

// ---------- 500 likes target ----------
const Likes: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const L = cues.likes;
  const n = Math.round(ramp(t, L.count[0], L.count[1], 0, 500, Easing.inOut(Easing.cubic)));
  const unlock = ramp(t, L.unlock, L.unlock + 0.5);
  const hit = pop(frame, L.hit, {damping: 8, stiffness: 220, mass: 0.6});
  return (
    <Beat s={L.in} e={L.end} from="right">
      <Card style={{left: 1420, top: 150, width: 460, padding: '28px 30px 28px 42px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Node size={66}>{Icon.thumb(36)}</Node>
          <div>
            <Label>Target</Label>
            <div style={{fontSize: 56, fontWeight: 900, lineHeight: 1}}><Hl>{n}</Hl> <span style={{fontSize: 34}}>likes</span></div>
          </div>
        </div>
        <div style={{marginTop: 20, height: 14, borderRadius: 99, background: C.coralSoft, overflow: 'hidden'}}>
          <div style={{width: `${(n / 500) * 100}%`, height: '100%', background: GRAD}} />
        </div>
        {t >= L.unlock - 0.02 && (
          <div style={{marginTop: 22, paddingTop: 20, borderTop: `1.5px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 16,
            opacity: Math.min(1, unlock * 2), transform: `translateY(${(1 - unlock) * 20}px)`}}>
            <Node size={56} filled={false}>{Icon.lock(30, C.coral, unlock)}</Node>
            <div>
              <Label size={18}>Unlocks</Label>
              <div style={{fontSize: 24, fontWeight: 700, lineHeight: 1.2}}>Advanced client-projects tutorial</div>
            </div>
          </div>
        )}
        {t >= L.hit - 0.02 && (
          <div style={{marginTop: 20, textAlign: 'center', background: GRAD, color: '#fff', borderRadius: 14, padding: '12px 0',
            fontSize: 30, fontWeight: 900, letterSpacing: 1, transform: `scale(${0.5 + 0.5 * hit})`}}>
            LET'S HIT IT!
          </div>
        )}
      </Card>
      {t >= L.hit && <Confetti at={L.hit} x={1650} y={420} />}
    </Beat>
  );
};

const Confetti: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const t = useT() - at;
  if (t > 1.6) return null;
  const cols = [C.coral, C.coral2, '#FFC857', '#7C5CFF', '#25D366'];
  return (
    <>
      {new Array(36).fill(0).map((_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const v = 350 + random(`v${i}`) * 450;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 700 * t * t;
        return (
          <div key={i} style={{position: 'absolute', left: px, top: py, width: 14, height: 8, borderRadius: 2,
            background: cols[i % cols.length], opacity: Math.max(0, 1 - t / 1.6), transform: `rotate(${(random(`r${i}`) * 720 + t * 600) % 360}deg)`}} />
        );
      })}
    </>
  );
};

// ---------- "What you'll learn" ----------
const Learn: React.FC = () => {
  const frame = useCurrentFrame();
  const {enter, exit, on} = life(frame, cues.learn.in, cues.learn.end, 0.35);
  if (!on) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 150, opacity: Math.min(1, enter * 2) * (1 - exit)}}>
      <div style={{transform: `scale(${0.85 + 0.15 * enter})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <Pill style={{fontSize: 24, letterSpacing: 3, color: C.coral}}>THE COURSE</Pill>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,0.45)'}}>
          What you'll learn
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Roadmap ----------
const PARTS = [
  {title: 'n8n Foundations'},
  {title: 'Nodes & Data Flow Mastery'},
  {title: 'HTTP, APIs, Credentials & Webhooks'},
  {title: 'AI Agents', tag: 'Advanced'},
  {title: 'RAG Agents', tag: 'Advanced'},
  {title: 'MCP', tag: 'Advanced'},
  {title: 'Build n8n Workflows with Claude'},
  {title: 'Complete Real-World Project'},
];

const Roadmap: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const R = cues.roadmap;
  const vis = interpolate(t, [R.in + 0.4, R.in + 1.0, R.out - 0.1, R.out + 0.35], [0, 1, 1, 0], clamp);
  if (vis <= 0) return null;
  let active = -1;
  cues.parts.forEach((p, i) => { if (t >= p - 0.05) active = i; });
  const rowH = 88;
  const hlY = ramp(t, cues.parts[Math.max(0, active)] - 0.05, cues.parts[Math.max(0, active)] + 0.3, 0, 1);
  const prevIdx = Math.max(0, active - 1);
  const y = (active <= 0 ? 0 : prevIdx + hlY * (active - prevIdx)) * rowH;
  const cur = active >= 0 ? PARTS[active] : null;
  const curK = active >= 0 ? pop(frame, cues.parts[active]) : 0;
  return (
    <AbsoluteFill style={{opacity: vis}}>
      {/* header over video */}
      <div style={{position: 'absolute', left: 90, top: 70, fontFamily: FONT}}>
        <Label size={22}>n8n course roadmap</Label>
        <div style={{fontSize: 52, fontWeight: 900, color: C.ink, marginTop: 4}}>
          <Hl>8 Parts</Hl> · 7 Hours
        </div>
      </div>
      {/* current part, under the video */}
      {cur && (
        <div style={{position: 'absolute', left: 90, top: 820, width: 1000, fontFamily: FONT, opacity: Math.min(1, curK * 1.5),
          transform: `translateY(${(1 - curK) * 24}px)`}}>
          <Label size={22}>{`Part ${active + 1}`}</Label>
          <div style={{fontSize: 46, fontWeight: 800, color: C.ink, marginTop: 6}}>{cur.title}</div>
        </div>
      )}
      {/* list */}
      <Card style={{left: 1160, top: 70, width: 690, padding: '24px 26px 24px 26px'}} accent={false}>
        <div style={{position: 'relative'}}>
          {active >= 0 && (
            <div style={{position: 'absolute', left: 0, right: 0, top: y, height: rowH - 10, borderRadius: 18, background: GRAD,
              boxShadow: '0 10px 26px rgba(234,75,113,0.35)'}} />
          )}
          {PARTS.map((p, i) => {
            const k = pop(frame, R.in + 0.7 + i * 0.09);
            const isAct = i === active;
            const done = i < active;
            return (
              <div key={i} style={{position: 'relative', height: rowH, display: 'flex', alignItems: 'center', gap: 18, padding: '0 18px',
                marginBottom: 0, opacity: Math.min(1, k * 1.5) * (active === -1 || isAct || done ? 1 : 0.55),
                transform: `translateX(${(1 - k) * 40}px)`, top: -5}}>
                <div style={{width: 50, height: 50, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: 24,
                  background: isAct ? 'rgba(255,255,255,0.25)' : done ? C.coral : C.coralSoft,
                  color: isAct || done ? '#fff' : C.coral}}>
                  {done ? Icon.check(26, '#fff') : i + 1}
                </div>
                <div style={{fontSize: 27, fontWeight: 700, color: isAct ? '#fff' : C.ink, flex: 1}}>{p.title}</div>
                {p.tag && (
                  <div style={{fontSize: 16, fontWeight: 800, letterSpacing: 1.5, padding: '6px 12px', borderRadius: 99,
                    background: isAct ? 'rgba(255,255,255,0.25)' : C.coralSoft, color: isAct ? '#fff' : C.coral}}>
                    {p.tag.toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </AbsoluteFill>
  );
};

// ---------- Resources + WhatsApp ----------
const Resources: React.FC = () => {
  const t = useT();
  const bob = Math.sin(t * 8) * 8;
  return (
    <Beat s={cues.resources.in} e={cues.resources.end} from="left">
      <Card style={{left: 60, top: 190, width: 440, padding: '28px 30px 30px 42px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Node size={66}>{Icon.book(34)}</Node>
          <div>
            <Label>All resources</Label>
            <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginTop: 4}}>Link in the description</div>
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 16, transform: `translateY(${bob}px)`}}>
          <Node size={52} filled={false}>{Icon.arrowDown(30, C.coral)}</Node>
        </div>
      </Card>
    </Beat>
  );
};

const WhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chips = ['Ask any doubt', 'Tag @Mohan', 'Quick replies'];
  const ring = pop(frame, cues.whatsapp.in + 0.15, {damping: 6, stiffness: 180, mass: 0.6});
  return (
    <Beat s={cues.whatsapp.in} e={cues.whatsapp.end} from="right">
      <Card style={{left: 1410, top: 150, width: 470, padding: '28px 30px 26px 42px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 70, height: 70, borderRadius: 20, background: C.green, display: 'flex', alignItems: 'center',
            justifyContent: 'center', transform: `scale(${0.7 + 0.3 * ring})`, boxShadow: '0 8px 20px rgba(37,211,102,0.35)'}}>
            {Icon.chat(40)}
          </div>
          <div>
            <Label color={C.green}>Join our</Label>
            <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.15, marginTop: 2}}>WhatsApp Community</div>
          </div>
        </div>
        <div style={{fontSize: 22, fontWeight: 600, color: C.sub, marginTop: 14}}>Link in the description</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16}}>
          {chips.map((c, i) => {
            const at = cues.whatsapp.chips[i];
            if (t < at - 0.02) return null;
            const k = pop(frame, at);
            return (
              <div key={c} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: Math.min(1, k * 1.5),
                transform: `translateX(${(1 - k) * 30}px)`, fontSize: 25, fontWeight: 700}}>
                <div style={{width: 34, height: 34, borderRadius: 10, background: C.coralSoft, display: 'flex', alignItems: 'center',
                  justifyContent: 'center'}}>{Icon.check(22, C.coral)}</div>
                {c}
              </div>
            );
          })}
        </div>
      </Card>
    </Beat>
  );
};

// ---------- Outro ----------
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const O = cues.outro;
  const end = ramp(t, O.endCard, O.endCard + 0.45, 0, 1, Easing.inOut(Easing.cubic));
  const k = pop(frame, O.endCard + 0.15);
  return (
    <>
      <Beat s={O.in} e={O.endCard + 0.1} from="right">
        <Card style={{left: 1450, top: 190, width: 420, padding: '26px 30px 28px 42px'}}>
          <Label>Next up</Label>
          <div style={{fontSize: 40, fontWeight: 900, marginTop: 6}}>Part 1</div>
          <div style={{fontSize: 28, fontWeight: 700, color: C.sub}}>n8n Foundations</div>
        </Card>
      </Beat>
      {end > 0 && (
        <AbsoluteFill style={{background: `rgba(246,244,247,${0.88 * end})`, alignItems: 'center', justifyContent: 'center'}}>
          <div style={{opacity: Math.min(1, k * 1.5), transform: `scale(${0.8 + 0.2 * k})`, display: 'flex', flexDirection: 'column',
            alignItems: 'center', fontFamily: FONT}}>
            <Label size={28}>Let's start</Label>
            <div style={{fontSize: 150, fontWeight: 900, lineHeight: 1.05, marginTop: 6}}><Hl>Part 1</Hl></div>
            <div style={{fontSize: 56, fontWeight: 800, color: C.ink}}>n8n Foundations</div>
          </div>
        </AbsoluteFill>
      )}
    </>
  );
};

// Diagonal light sweep on transitions
const Sweeps: React.FC = () => {
  const t = useT();
  return (
    <>
      {[...cues.whips, cues.roadmap.in, cues.roadmap.out].map((w) => {
        const p = (t - (w - 0.12)) / 0.45;
        if (p < 0 || p > 1) return null;
        return (
          <AbsoluteFill key={w} style={{background: `linear-gradient(110deg, transparent ${p * 160 - 60}%, rgba(255,255,255,0.55) ${p * 160 - 35}%, rgba(255,236,242,0.0) ${p * 160 - 10}%)`}} />
        );
      })}
    </>
  );
};

// Thin chapter progress bar at the top
const Progress: React.FC = () => {
  const t = useT();
  const p = Math.min(1, t / cues.videoEnd);
  const fade = 1 - ramp(t, cues.outro.endCard, cues.outro.endCard + 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 7, background: 'rgba(255,255,255,0.35)', opacity: fade}}>
      <div style={{width: `${p * 100}%`, height: '100%', background: GRAD}} />
    </div>
  );
};

export const Overlays: React.FC = () => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Hook />
    <Stamp s={cues.forYou.at} e={cues.forYou.end} top={560}>This course is for you</Stamp>
    <Scratch />
    <Concepts />
    <Advanced />
    <LowerThird />
    <Stat s={cues.stats[0].in} e={cues.stats[0].end} big="1.5 yrs" label="building with n8n" />
    <Stat s={cues.stats[1].in} e={cues.stats[1].end} big="20+" count={20} suffix="+" label="client projects delivered" chipsAt={cues.stats[1].chips} />
    <Stat s={cues.stats[2].in} e={cues.stats[2].end} big="100s" label="of n8n tutorials on my channel" />
    <Beat s={cues.practical.in} e={cues.practical.end} from="left">
      <Card style={{left: 60, top: 190, width: 440, padding: '28px 30px 30px 42px'}}>
        <Node size={60}>{Icon.bolt(32)}</Node>
        <div style={{fontSize: 34, fontWeight: 800, marginTop: 16, lineHeight: 1.2}}>
          Real-world <Hl>practical knowledge</Hl>
        </div>
      </Card>
    </Beat>
    <SevenHour />
    <Stamp s={cues.free.in} e={cues.free.end} top={210} left={80} rot={-4} size={70}>100% Free</Stamp>
    <Price />
    <Subscribe />
    <Likes />
    <Learn />
    <Roadmap />
    <Beat s={cues.everyPart.in} e={cues.everyPart.end} from="left">
      <Card style={{left: 60, top: 190, width: 440, padding: '28px 30px 30px 42px'}}>
        <Label>In every part</Label>
        <div style={{fontSize: 36, fontWeight: 800, marginTop: 10, lineHeight: 1.2}}>
          A real-world <Hl>advanced project</Hl>
        </div>
      </Card>
    </Beat>
    <Resources />
    <WhatsApp />
    <Outro />
    <Sweeps />
    <Progress />
  </AbsoluteFill>
);
