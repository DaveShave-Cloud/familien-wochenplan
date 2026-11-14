import React from 'react';
import {UI_FONT} from '../../fonts';
import {Figure, Scene, lerp, lin, mixPose, rnd, span, type PlaceholderProps, type Pose} from './kit';

/**
 * Innenmotive der Nordwerk Maschinenbau GmbH: Büros, Buchhaltung, Vertrieb,
 * Chefbüro und Produktionshalle. Alle Motive sind Bausteine und können in Film 2
 * mit anderem Licht und anderen Posen wiederverwendet werden.
 */

const FLOOR = 900;
const COOL_RIM = {color: '#9fb6cc', dx: -0.45, dy: -0.6, opacity: 0.32};
const DARK = {color: '#070b10', backColor: '#04070a'};

// ───────────────────────── Bausteine ─────────────────────────

const Raum: React.FC<{id: string; top?: string; bottom?: string; floor?: string}> = ({
  id,
  top = '#18212b',
  bottom = '#0f161e',
  floor = '#090d12',
}) => (
  <>
    <defs>
      <linearGradient id={`raum-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-400} y={-400} width={2720} height={FLOOR + 400} fill={`url(#raum-${id})`} />
    <rect x={-400} y={FLOOR} width={2720} height={600} fill={floor} />
    <rect x={-400} y={FLOOR - 14} width={2720} height={14} fill="#000" opacity={0.3} />
  </>
);

/** Fenster mit Jalousie; wirft kühles Tageslicht in den Raum. */
const Fenster: React.FC<{id: string; x: number; y: number; w: number; h: number; strength?: number; color?: string}> = ({
  id,
  x,
  y,
  w,
  h,
  strength = 0.6,
  color = '#a9c4de',
}) => (
  <>
    <defs>
      <linearGradient id={`fen-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={strength} />
        <stop offset="1" stopColor={color} stopOpacity={strength * 0.55} />
      </linearGradient>
      <radialGradient id={`fenGlow-${id}`}>
        <stop offset="0" stopColor={color} stopOpacity={0.22 * strength} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
      <linearGradient id={`fenShaft-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity={0.12 * strength} />
        <stop offset="1" stopColor={color} stopOpacity={0.02} />
      </linearGradient>
    </defs>
    <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 1.2} ry={h * 1.15} fill={`url(#fenGlow-${id})`} />
    <rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} fill="#0a0f15" />
    <rect x={x} y={y} width={w} height={h} fill="#0d141c" />
    <rect x={x} y={y} width={w} height={h} fill={`url(#fen-${id})`} />
    {Array.from({length: Math.floor(h / 22)}, (_, i) => (
      <rect key={i} x={x} y={y + 6 + i * 22} width={w} height={9} fill="#0a0f15" opacity={0.72} />
    ))}
    <rect x={x + w / 2 - 5} y={y} width={10} height={h} fill="#0a0f15" />
    {/* Lichtbahn auf dem Boden */}
    <path d={`M${x} ${FLOOR} L${x + w} ${FLOOR} L${x + w + 320} ${FLOOR + 240} L${x + 120} ${FLOOR + 240}Z`} fill={`url(#fenShaft-${id})`} />
  </>
);

const Tisch: React.FC<{x: number; y: number; w: number; color?: string}> = ({x, y, w, color = '#1a242e'}) => (
  <g>
    <rect x={x + 26} y={y + 18} width={w - 52} height={FLOOR - y - 70} fill="#0c1218" />
    <rect x={x + 18} y={y + 18} width={20} height={FLOOR - y - 18} fill="#111920" />
    <rect x={x + w - 38} y={y + 18} width={20} height={FLOOR - y - 18} fill="#111920" />
    <rect x={x} y={y} width={w} height={20} rx={4} fill={color} />
    <rect x={x} y={y} width={w} height={4} rx={2} fill="#fff" opacity={0.05} />
  </g>
);

/** Lichtschein eines Bildschirms auf Wand und Raum (vor den Figuren zeichnen). */
const MonitorSchein: React.FC<{id: string; x: number; y: number; on?: number; facing?: 1 | -1}> = ({id, x, y, on = 1, facing = -1}) => (
  <>
    <defs>
      <radialGradient id={`monG-${id}`}>
        <stop offset="0" stopColor="#bcd8ff" stopOpacity={0.26} />
        <stop offset="0.5" stopColor="#bcd8ff" stopOpacity={0.08} />
        <stop offset="1" stopColor="#bcd8ff" stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={x + facing * 250} cy={y - 165} rx={560} ry={430} fill={`url(#monG-${id})`} opacity={on} />
  </>
);

/** Bildschirm in Schrägansicht. `facing` = Richtung, in die der Schirm leuchtet. */
const Monitor: React.FC<{x: number; y: number; on?: number; facing?: 1 | -1}> = ({x, y, on = 0, facing = -1}) => (
  <g transform={`translate(${x} ${y}) scale(${facing} 1)`}>
    <rect x={-52} y={-10} width={104} height={10} rx={3} fill="#0b1016" />
    <rect x={-8} y={-84} width={16} height={78} fill="#0b1016" />
    <path d="M-22 -252 L14 -264 L14 -66 L-22 -74Z" fill="#0a0f15" />
    <path d="M14 -264 L26 -260 L26 -70 L14 -66Z" fill="#161f29" />
    <path d="M14 -258 L24 -255 L24 -74 L14 -71Z" fill="#cfe2ff" opacity={on} />
  </g>
);

const Stuhl: React.FC<{x: number; seat: number; facing?: 1 | -1; tilt?: number; high?: boolean}> = ({
  x,
  seat,
  facing = 1,
  tilt = 0,
  high = false,
}) => (
  <g transform={`translate(${x} ${FLOOR}) scale(${facing} 1)`}>
    <rect x={-7} y={-seat + 20} width={14} height={seat - 44} fill="#0a0f14" />
    <path d="M-74 -14 L74 -14" stroke="#0a0f14" strokeWidth={10} strokeLinecap="round" />
    <circle cx={-72} cy={-8} r={9} fill="#070a0e" />
    <circle cx={72} cy={-8} r={9} fill="#070a0e" />
    <rect x={-78} y={-seat} width={150} height={24} rx={11} fill="#10171e" />
    <g transform={`rotate(${-tilt} -66 ${-seat})`}>
      <rect x={-92} y={-seat - (high ? 300 : 232)} width={30} height={high ? 304 : 236} rx={14} fill="#10171e" />
    </g>
  </g>
);

const Ordnerregal: React.FC<{x: number; y: number; w: number; rows: number; seed: string}> = ({x, y, w, rows, seed}) => {
  const rowH = 132;
  const colors = ['#27323d', '#2c2a35', '#223039', '#33302a', '#1f2a33'];
  return (
    <g>
      <rect x={x - 12} y={y - 12} width={w + 24} height={rows * rowH + 24} fill="#0c1117" />
      {Array.from({length: rows}, (_, r) => {
        let cx = x + 8;
        const items: React.ReactNode[] = [];
        let i = 0;
        while (cx < x + w - 46) {
          const bw = 30 + Math.round(rnd(`${seed}${r}${i}`) * 16);
          const gap = rnd(`${seed}g${r}${i}`) < 0.16 ? 34 : 4;
          const bh = 104 + Math.round(rnd(`${seed}h${r}${i}`) * 14);
          items.push(
            <g key={i}>
              <rect x={cx} y={y + r * rowH + (rowH - 8 - bh)} width={bw} height={bh} rx={3} fill={colors[(i + r) % colors.length]} />
              <rect x={cx + 6} y={y + r * rowH + (rowH - 8 - bh) + 16} width={bw - 12} height={30} rx={2} fill="#c9d2da" opacity={0.2} />
              <circle cx={cx + bw / 2} cy={y + r * rowH + rowH - 26} r={5} fill="#000" opacity={0.3} />
            </g>,
          );
          cx += bw + gap;
          i++;
        }
        return (
          <g key={r}>
            {items}
            <rect x={x - 12} y={y + (r + 1) * rowH - 8} width={w + 24} height={10} fill="#141c24" />
          </g>
        );
      })}
    </g>
  );
};

const Papierstapel: React.FC<{x: number; y: number; n?: number; seed: string}> = ({x, y, n = 6, seed}) => (
  <g>
    {Array.from({length: n}, (_, i) => (
      <rect
        key={i}
        x={x + (rnd(`${seed}${i}`) - 0.5) * 14}
        y={y - 7 - i * 7}
        width={108 + rnd(`${seed}w${i}`) * 10}
        height={6}
        rx={1}
        fill={i % 2 ? '#aeb8c1' : '#8f9aa5'}
        opacity={0.5}
      />
    ))}
  </g>
);

/** Tischtelefon mit Anruflampe. */
const Tischtelefon: React.FC<{x: number; y: number; scale?: number; led?: number; display?: number}> = ({
  x,
  y,
  scale = 1,
  led = 0,
  display = 0.3,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-104 0 L-92 -44 L92 -62 L104 0Z" fill="#141b22" />
    <path d="M-92 -44 L92 -62 L92 -56 L-92 -38Z" fill="#232d37" />
    <rect x={-112} y={-78} width={64} height={34} rx={14} fill="#0b1015" transform="rotate(-6 -80 -60)" />
    <rect x={-22} y={-52} width={72} height={24} rx={3} fill="#9fd0c0" opacity={display} transform="skewY(-5.6)" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={-12 + c * 20} cy={-12 - c * 1.9 + r * -0 - 8 + r * 7} r={3.6} fill="#2d3842" />),
    )}
    <circle cx={76} cy={-40} r={7} fill="#ff4a3a" opacity={0.15 + 0.85 * led} />
    <circle cx={76} cy={-40} r={34} fill="#ff4a3a" opacity={0.2 * led} />
  </g>
);

const sit = (extra: Pose = {}): Pose => ({drop: 24, legF: [86, 84], legB: [80, 82], lean: 3, armF: [18, 62], armB: [12, 60], ...extra});

// ───────────────────────── S3-A · Sven allein im Büro ─────────────────────────

export const SvenBuero: React.FC<PlaceholderProps> = ({frame, duration}) => {
  // Das Smartphone auf dem Tisch vibriert nach 1,3 s (Zeitpunkt aus sound.ts: 0:59.3)
  const buzzAt = 39;
  const buzzing = (frame >= buzzAt && frame < buzzAt + 15) || (frame >= buzzAt + 21 && frame < buzzAt + 36);
  const jitter = buzzing ? Math.sin(frame * 2.7) * 1.6 : 0;
  const lit = span(frame, buzzAt, buzzAt + 4);
  const idle: Pose = {lean: 2, head: -4, armF: [30, 50], armB: [8, 30], legF: [3, 2], legB: [-4, 2]};
  const look: Pose = {lean: 6, head: 26, armF: [22, 40], armB: [6, 26], legF: [3, 2], legB: [-4, 2]};
  const reach: Pose = {lean: 12, head: 24, armF: [56, 16], armB: [2, 22], legF: [6, 3], legB: [-6, 2]};
  const pose = mixPose(mixPose(idle, look, span(frame, buzzAt + 4, buzzAt + 18)), reach, span(frame, 66, 90));
  const cam = lin(frame, 0, duration);
  return (
    <Scene frame={frame} background="#0b1016" camera={{scale: 1.04 + 0.1 * cam, pivot: [1090, 640]}}>
      <Raum id="sv" />
      <Fenster id="sv" x={150} y={190} w={520} h={420} strength={0.55} />
      <Ordnerregal x={1500} y={300} w={330} rows={2} seed="sv" />
      <MonitorSchein id="sv" x={1480} y={706} on={0.3} />
      <Stuhl x={1330} seat={112} facing={-1} />
      <Tisch x={940} y={706} w={700} />
      <Monitor x={1480} y={706} on={0.3} />
      <Papierstapel x={1250} y={706} n={4} seed="sv" />
      {/* Smartphone auf der Tischplatte */}
      <defs>
        <radialGradient id="svPhone">
          <stop offset="0" stopColor="#cfe4ff" stopOpacity={0.55} />
          <stop offset="0.4" stopColor="#cfe4ff" stopOpacity={0.16} />
          <stop offset="1" stopColor="#cfe4ff" stopOpacity={0} />
        </radialGradient>
        <clipPath id="svPhoneClip">
          <rect x={700} y={300} width={800} height={406} />
        </clipPath>
      </defs>
      <g transform={`translate(${jitter} 0)`}>
        <ellipse cx={1090} cy={700} rx={230} ry={190} fill="url(#svPhone)" opacity={lit} clipPath="url(#svPhoneClip)" />
        <rect x={1050} y={696} width={80} height={10} rx={4} fill="#06090c" />
        <rect x={1054} y={695} width={72} height={3} rx={1.5} fill="#dcecff" opacity={lit} />
      </g>
      <Figure x={880} y={FLOOR} height={478} pose={pose} {...DARK} rim={COOL_RIM} />
    </Scene>
  );
};

// ───────────────────────── S4 · Buchhaltung ─────────────────────────

const Wandkalender: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={132} height={168} rx={5} fill="#c8d0d7" opacity={0.9} />
    <rect x={0} y={0} width={132} height={40} rx={5} fill="#a8352b" />
    <text x={66} y={28} textAnchor="middle" fontFamily={UI_FONT} fontSize={19} fontWeight={700} letterSpacing={2.4} fill="#f4e9e6">
      MITTWOCH
    </text>
    <text x={66} y={132} textAnchor="middle" fontFamily={UI_FONT} fontSize={92} fontWeight={800} fill="#1a2028">
      25
    </text>
  </g>
);

const BuchhaltungRaum: React.FC<{pose: Pose; chairTilt?: number; monitor?: number}> = ({pose, chairTilt = 0, monitor = 1}) => {
  const fig = {x: 986, y: FLOOR, height: 474, facing: 1 as const, pose};
  return (
    <>
      <defs>
        <radialGradient id="bhLit" cx="1260" cy="560" r="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.6" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id="bhMask" maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
          <rect width={1920} height={1080} fill="url(#bhLit)" />
        </mask>
      </defs>
      <Raum id="bh" top="#1a222b" bottom="#10171e" />
      <Fenster id="bh" x={90} y={200} w={400} h={400} strength={0.5} />
      <Wandkalender x={620} y={270} />
      <Ordnerregal x={1420} y={236} w={420} rows={3} seed="bh" />
      <MonitorSchein id="bh" x={1280} y={708} on={monitor} />
      <Stuhl x={972} seat={112} tilt={chairTilt} />
      <Figure {...fig} hat="long" {...DARK} rim={COOL_RIM} />
      <g mask="url(#bhMask)" opacity={0.6 * monitor}>
        <Figure {...fig} hat="long" color="#31465c" backColor="#1c2937" />
      </g>
      <Tisch x={760} y={708} w={720} />
      <Monitor x={1280} y={708} on={monitor} />
      {/* Tastatur, Unterlagen, Ordner, Tasse */}
      <rect x={1090} y={700} width={130} height={8} rx={3} fill="#0b1015" />
      <Papierstapel x={786} y={708} n={7} seed="bh1" />
      <Papierstapel x={1340} y={708} n={3} seed="bh2" />
      <rect x={908} y={668} width={30} height={40} rx={4} fill="#28323c" />
      <path d="M938 678h10a8 8 0 0 1 0 18h-10" fill="none" stroke="#28323c" strokeWidth={5} />
    </>
  );
};

const typing = (frame: number): Pose =>
  sit({
    lean: 7,
    head: 8,
    armF: [20 + 1.5 * Math.sin(frame * 0.9), 66 + 3 * Math.sin(frame * 1.7)],
    armB: [14 + 1.5 * Math.sin(frame * 1.1 + 1), 64 + 3 * Math.sin(frame * 1.5 + 2)],
  });

export const Buchhaltung: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  // sie tippt, hält inne, tippt weiter
  const pause = span(frame, 70, 78) * (1 - span(frame, 104, 112));
  const still = sit({lean: 6, head: 12, armF: [20, 64], armB: [14, 62]});
  return (
    <Scene frame={frame} background="#0b1016" camera={{scale: 1.02 + 0.07 * cam, pivot: [1080, 620]}}>
      <BuchhaltungRaum pose={mixPose(typing(frame), still, pause)} />
    </Scene>
  );
};

export const KatjaNah: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  const forward = sit({lean: 7, head: 10, armF: [20, 64], armB: [14, 62]});
  const back = sit({lean: -15, head: -4, armF: [6, 44], armB: [2, 42]});
  const rub = Math.sin(frame * 0.42) * 5;
  const hands = sit({lean: -15, head: -2, armF: [116, 120 + rub], armB: [110, 124 - rub]});
  const stare = sit({lean: -19, head: -16, armF: [10, 38], armB: [6, 36]});
  let pose = mixPose(forward, back, span(frame, 18, 50));
  pose = mixPose(pose, hands, span(frame, 54, 80));
  pose = mixPose(pose, stare, span(frame, 150, 184));
  const tilt = lerp(0, 9, span(frame, 18, 50)) + lerp(0, 2, span(frame, 150, 184));
  return (
    <Scene frame={frame} background="#0b1016" camera={{scale: 1.85 + 0.2 * cam, pivot: [1030, 590], x: 0, y: 40}} vignette={0.7}>
      <BuchhaltungRaum pose={pose} chairTilt={tilt} monitor={0.9 + 0.1 * Math.sin(frame / 9)} />
    </Scene>
  );
};

// ───────────────────────── S5-A · Vertrieb, das Telefon klingelt ─────────────────────────

export const Vertrieb: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  // Ruftöne: 0,05–1,0 s und 1,65–2,6 s (siehe phone_ring.wav)
  const ringing = (frame >= 2 && frame < 30) || (frame >= 50 && frame < 78);
  const led = ringing ? (Math.floor(frame / 4) % 2 === 0 ? 1 : 0.25) : 0.1;
  const rest = sit({lean: 4, head: 6, armF: [16, 60], armB: [12, 58]});
  const look = sit({lean: 6, head: 22, armF: [22, 54], armB: [12, 58]});
  const reach = sit({lean: 10, head: 22, armF: [50, 28], armB: [12, 58]});
  const hesitate = sit({lean: 7, head: 22, armF: [34, 50], armB: [12, 58]});
  let pose = mixPose(rest, look, span(frame, 4, 16));
  pose = mixPose(pose, reach, span(frame, 26, 44));
  pose = mixPose(pose, hesitate, span(frame, 54, 72));
  return (
    <Scene frame={frame} background="#0b1016" camera={{scale: 1.42 + 0.1 * cam, pivot: [1130, 640]}} vignette={0.7}>
      <Raum id="vt" top="#1b232c" bottom="#111820" />
      <Fenster id="vt" x={1380} y={150} w={470} h={440} strength={0.6} />
      <Ordnerregal x={300} y={330} w={300} rows={2} seed="vt" />
      <Stuhl x={900} seat={112} />
      <Figure x={914} y={FLOOR} height={470} pose={pose} hat="bun" {...DARK} rim={{...COOL_RIM, dx: 0.45}} />
      <Tisch x={700} y={708} w={820} />
      {/* zugeklappter Laptop */}
      <rect x={1010} y={696} width={150} height={12} rx={4} fill="#1f2a34" />
      <Papierstapel x={760} y={708} n={3} seed="vt" />
      <Tischtelefon x={1330} y={708} scale={1.05} led={led} display={ringing ? 0.9 : 0.3} />
    </Scene>
  );
};

// ───────────────────────── S5-B / S6-A · Das leere Chefbüro ─────────────────────────

const Wanduhr: React.FC<{x: number; y: number; hour: number; minute: number; second: number}> = ({x, y, hour, minute, second}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={62} fill="#0b1016" />
    <circle r={54} fill="#c6ced6" opacity={0.86} />
    {Array.from({length: 12}, (_, i) => (
      <line key={i} x1={0} y1={-48} x2={0} y2={i % 3 === 0 ? -37 : -42} stroke="#1a2028" strokeWidth={i % 3 === 0 ? 4 : 2} transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={6} x2={0} y2={-27} stroke="#1a2028" strokeWidth={5.5} strokeLinecap="round" transform={`rotate(${(hour % 12) * 30 + minute * 0.5})`} />
    <line x1={0} y1={8} x2={0} y2={-42} stroke="#1a2028" strokeWidth={3.6} strokeLinecap="round" transform={`rotate(${minute * 6})`} />
    <line x1={0} y1={12} x2={0} y2={-44} stroke="#b53a2e" strokeWidth={1.6} transform={`rotate(${second * 6})`} />
    <circle r={3.4} fill="#1a2028" />
  </g>
);

const Chefbuero: React.FC<{frame: number; minute: number}> = ({frame, minute}) => {
  const second = Math.floor(frame / 30) + 12;
  const led = Math.floor(frame / 12) % 2 === 0 ? 1 : 0.15;
  return (
    <>
      <defs>
        <linearGradient id="cbStripe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9cee2" stopOpacity={0.085} />
          <stop offset="1" stopColor="#b9cee2" stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="cbChair" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#141c24" />
          <stop offset="0.55" stopColor="#2b3743" />
          <stop offset="1" stopColor="#18212a" />
        </linearGradient>
      </defs>
      <Raum id="cb" top="#161e27" bottom="#0d141b" floor="#080c10" />
      {/* Lichtstreifen der Lamellen an der Wand */}
      {Array.from({length: 9}, (_, i) => {
        const sx = 1040 + i * 104 + 6 * Math.sin(frame / 90);
        return <path key={i} d={`M${sx} 60 L${sx + 46} 60 L${sx - 150} ${FLOOR} L${sx - 196} ${FLOOR}Z`} fill="url(#cbStripe)" />;
      })}
      {/* Sideboard, Bild, Uhr */}
      <rect x={150} y={640} width={420} height={260} fill="#0f161d" />
      <rect x={150} y={640} width={420} height={10} fill="#1a232c" />
      <line x1={360} y1={654} x2={360} y2={900} stroke="#0a0f14" strokeWidth={4} />
      <rect x={210} y={330} width={250} height={180} fill="#0b1016" stroke="#27323c" strokeWidth={6} />
      <path d="M222 498 L300 410 L350 460 L400 390 L448 498Z" fill="#1c2732" />
      <Wanduhr x={700} y={348} hour={9} minute={minute} second={second} />

      {/* Chefsessel – leer */}
      <rect x={846} y={640} width={36} height={130} rx={14} fill="#1a232c" />
      <rect x={1158} y={640} width={36} height={130} rx={14} fill="#1a232c" />
      <path d="M884 720 C870 520 890 372 940 352 C990 338 1050 338 1100 352 C1150 372 1170 520 1156 720Z" fill="url(#cbChair)" />
      <path d="M896 520 C884 420 902 376 940 352 C990 338 1050 338 1100 352" fill="none" stroke="#7f95aa" strokeOpacity={0.4} strokeWidth={4} strokeLinecap="round" />
      <path d="M930 420 C980 404 1060 404 1110 420" fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={5} />
      <path d="M916 540 C980 526 1060 526 1124 540" fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={5} />
      {/* Jacke über der Lehne */}
      <path d="M1066 344 C1110 330 1176 346 1196 392 L1214 600 C1200 616 1176 618 1160 606 L1150 470 C1136 420 1104 388 1066 380Z" fill="#33414f" />
      <path d="M1160 606 L1150 470" stroke="#111921" strokeWidth={4} fill="none" />
      <path d="M1066 344 C1090 352 1100 368 1096 392" fill="none" stroke="#111921" strokeWidth={4} />

      {/* Schreibtisch (Frontansicht) */}
      <rect x={560} y={716} width={920} height={184} fill="#10181f" />
      <rect x={560} y={716} width={920} height={184} fill="url(#cbStripe)" opacity={0.6} />
      <rect x={530} y={692} width={980} height={26} rx={5} fill="#1c2630" />
      <rect x={530} y={692} width={980} height={5} rx={2} fill="#fff" opacity={0.06} />

      {/* auf dem Tisch: zugeklappter Laptop, Tasse, Namensschild, Telefon */}
      <path d="M700 692 L716 676 L930 676 L946 692Z" fill="#27323d" />
      <rect x={640} y={640} width={34} height={52} rx={5} fill="#2b3641" />
      <path d="M674 652h10a9 9 0 0 1 0 22h-10" fill="none" stroke="#2b3641" strokeWidth={6} />
      <g>
        <path d="M968 692 L984 650 L1234 650 L1250 692Z" fill="#2a343e" />
        <rect x={984} y={650} width={250} height={5} fill="#f2a33a" opacity={0.7} />
        <text x={1109} y={682} textAnchor="middle" fontFamily={UI_FONT} fontSize={21} fontWeight={700} letterSpacing={3.2} fill="#d8e0e7">
          GESCHÄFTSFÜHRUNG
        </text>
      </g>
      <Tischtelefon x={1370} y={692} scale={0.86} led={led} display={0.5} />

      {/* Staub im Licht */}
      {Array.from({length: 22}, (_, i) => {
        const px = 760 + rnd(`cd${i}`) * 900 + 14 * Math.sin(frame / 60 + i);
        const py = ((rnd(`ce${i}`) * 700 + frame * (0.25 + 0.3 * rnd(`cf${i}`))) % 700) + 80;
        return <circle key={i} cx={px} cy={py} r={1.6} fill="#cfe0f0" opacity={0.18 + 0.2 * rnd(`cg${i}`)} />;
      })}
    </>
  );
};

/** S5-B: kurzer Blick auf den verwaisten Arbeitsplatz. */
export const Chefplatz: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  return (
    <Scene frame={frame} background="#0a0f14" camera={{scale: 1.5, x: lerp(40, -40, cam), y: -30, pivot: [1090, 600]}} vignette={0.72}>
      <Chefbuero frame={frame} minute={31} />
    </Scene>
  );
};

/** S6-A: lange, langsame Zufahrt auf den leeren Sessel. */
export const ChefbueroLeer: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const t = lin(frame, 0, duration);
  const eased = t * t * (3 - 2 * t);
  return (
    <Scene frame={frame} background="#0a0f14" camera={{scale: 1.0 + 0.5 * eased, y: lerp(0, -40, eased), pivot: [1022, 560]}} vignette={0.6 + 0.2 * eased}>
      <Chefbuero frame={frame} minute={52} />
    </Scene>
  );
};

// ───────────────────────── S5-C · Produktion steht ─────────────────────────

export const Produktion: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  const amber = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.12;
  const crossed: Pose = {lean: 1, head: 6, armF: [34, 108], armB: [30, 100], legF: [5, 2], legB: [-6, 2]};
  const hips: Pose = {lean: 0, head: 4, armF: [-24, 78], armB: [-30, 80], legF: [8, 2], legB: [-8, 2]};
  const neck: Pose = {lean: 2, head: 16, armF: [150, 150], armB: [4, 12], legF: [4, 2], legB: [-5, 2]};
  const sway = (i: number) => 1.2 * Math.sin(frame / (34 + i * 6) + i);
  const workers: [number, number, Pose, 'none' | 'beanie' | 'long'][] = [
    [520, 452, hips, 'none'],
    [668, 470, crossed, 'beanie'],
    [820, 440, neck, 'none'],
  ];
  return (
    <Scene frame={frame} background="#090d12" camera={{scale: 1.04 + 0.04 * cam, x: lerp(30, -30, cam), pivot: [1000, 620]}}>
      <defs>
        <linearGradient id="prLamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe0f2" stopOpacity={0.16} />
          <stop offset="1" stopColor="#cfe0f2" stopOpacity={0.01} />
        </linearGradient>
        <radialGradient id="prRed">
          <stop offset="0" stopColor="#ff4a3a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff4a3a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="prAmber">
          <stop offset="0" stopColor="#ffb02e" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffb02e" stopOpacity={0} />
        </radialGradient>
      </defs>
      <Raum id="pr" top="#141c25" bottom="#0e151c" floor="#0a0e13" />
      {/* Fensterband und Dachträger */}
      {Array.from({length: 8}, (_, i) => (
        <rect key={i} x={-120 + i * 290} y={70} width={230} height={120} fill="#9db8d2" opacity={0.2} />
      ))}
      {Array.from({length: 9}, (_, i) => (
        <path key={i} d={`M${-200 + i * 290} 40 L${-55 + i * 290} 240 L${90 + i * 290} 40`} fill="none" stroke="#0a0f15" strokeWidth={12} />
      ))}
      <rect x={-300} y={234} width={2600} height={16} fill="#0a0f15" />
      {[360, 1010, 1660].map((x) => (
        <g key={x}>
          <line x1={x} y1={250} x2={x} y2={316} stroke="#0a0f15" strokeWidth={5} />
          <path d={`M${x - 36} 334 L${x - 20} 314 L${x + 20} 314 L${x + 36} 334Z`} fill="#1b242d" />
          <path d={`M${x - 34} 334 L${x - 300} ${FLOOR} L${x + 300} ${FLOOR} L${x + 34} 334Z`} fill="url(#prLamp)" />
        </g>
      ))}
      {/* Bodenmarkierung */}
      <path d={`M-200 ${FLOOR + 60} L2200 ${FLOOR + 60}`} stroke="#c9a23a" strokeOpacity={0.3} strokeWidth={10} />
      {/* leere Palette: das Material fehlt */}
      <g fill="#2a2f33">
        <rect x={150} y={FLOOR - 16} width={250} height={10} />
        <rect x={150} y={FLOOR - 38} width={250} height={10} />
        {[154, 262, 372].map((x) => (
          <rect key={x} x={x} y={FLOOR - 30} width={24} height={16} />
        ))}
      </g>
      {/* Maschine */}
      <rect x={1010} y={372} width={700} height={FLOOR - 372} rx={18} fill="#19232d" />
      <rect x={1010} y={372} width={700} height={12} rx={6} fill="#fff" opacity={0.05} />
      <rect x={1010} y={FLOOR - 70} width={700} height={70} fill="#121a22" />
      <rect x={1060} y={444} width={350} height={300} rx={10} fill="#070b10" stroke="#2a3642" strokeWidth={8} />
      <path d="M1084 468l90 0-110 210 0-150z" fill="#fff" opacity={0.03} />
      <rect x={1228} y={560} width={12} height={90} rx={6} fill="#3b4854" />
      {/* Bedienpult: Bildschirm dunkel, eine rote Störlampe */}
      <rect x={1470} y={470} width={190} height={250} rx={10} fill="#111920" />
      <rect x={1490} y={490} width={150} height={96} rx={4} fill="#06090d" />
      <rect x={1500} y={500} width={130} height={14} rx={3} fill="#ff4a3a" opacity={0.7} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={1502 + i * 42} cy={624} r={11} fill={i === 0 ? '#7a241d' : '#27313b'} />
      ))}
      <circle cx={1565} cy={680} r={20} fill="#8a251c" />
      {/* Signalsäule: Rot leuchtet, Gelb blinkt */}
      <rect x={1612} y={300} width={12} height={72} fill="#0a0f15" />
      <rect x={1600} y={268} width={36} height={32} rx={4} fill="#3d7a48" opacity={0.25} />
      <rect x={1600} y={236} width={36} height={32} rx={4} fill="#ffb02e" opacity={0.2 + 0.8 * amber} />
      <rect x={1600} y={204} width={36} height={32} rx={4} fill="#ff4a3a" />
      <circle cx={1618} cy={220} r={110} fill="url(#prRed)" />
      <circle cx={1618} cy={252} r={90} fill="url(#prAmber)" opacity={amber} />
      {/* Mitarbeiter stehen davor */}
      {workers.map(([x, h, pose, hat], i) => (
        <Figure key={i} x={x} y={FLOOR + i * 5} height={h} pose={{...pose, lean: (pose.lean ?? 0) + sway(i)}} hat={hat} {...DARK} rim={COOL_RIM} />
      ))}
    </Scene>
  );
};
