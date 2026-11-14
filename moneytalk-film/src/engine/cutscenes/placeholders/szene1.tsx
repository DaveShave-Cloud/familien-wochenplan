import React from 'react';
import {Eingang, Firmengelaende} from './aussen';
import {Drizzle, Figure, Fog, Scene, clamp, handPosition, lerp, lin, mixPose, span, standPose, walkPose, type PlaceholderProps, type Pose} from './kit';

// ───────────────────────── S1-A · Parkplatz, Totale ─────────────────────────

const Auto: React.FC<{x: number; y: number; lights: number}> = ({x, y, lights}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <linearGradient id="carBeam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff1d0" stopOpacity={0.5} />
        <stop offset="1" stopColor="#fff1d0" stopOpacity={0} />
      </linearGradient>
      <radialGradient id="carTail">
        <stop offset="0" stopColor="#ff3b2e" stopOpacity={0.9} />
        <stop offset="1" stopColor="#ff3b2e" stopOpacity={0} />
      </radialGradient>
    </defs>
    {/* Scheinwerferkegel */}
    <path d="M150 -44 L720 -110 L720 8 L150 -30Z" fill="url(#carBeam)" opacity={lights} />
    <ellipse cx={420} cy={6} rx={300} ry={16} fill="#fff1d0" opacity={0.1 * lights} />
    {/* Karosserie (Kombi) */}
    <path
      d="M-158 -18 C-160 -44 -150 -58 -126 -62 L-92 -98 C-84 -106 -74 -108 -62 -108 L52 -108 C66 -108 76 -104 86 -94 L118 -62 C142 -58 156 -50 158 -30 L158 -18Z"
      fill="#0a0f16"
    />
    <path d="M-84 -66 L-60 -96 L-6 -96 L-6 -66Z M4 -66 L4 -96 L50 -96 C58 -96 64 -94 70 -88 L92 -66Z" fill="#162230" />
    <circle cx={-96} cy={-16} r={25} fill="#06090d" />
    <circle cx={98} cy={-16} r={25} fill="#06090d" />
    <circle cx={-96} cy={-16} r={10} fill="#141c26" />
    <circle cx={98} cy={-16} r={10} fill="#141c26" />
    {/* Lichter */}
    <rect x={146} y={-46} width={12} height={12} rx={3} fill="#fff4dc" opacity={0.2 + 0.8 * lights} />
    <circle cx={-158} cy={-42} r={30} fill="url(#carTail)" opacity={lights} />
    <rect x={-160} y={-48} width={7} height={12} rx={2} fill="#ff4a3a" opacity={0.25 + 0.75 * lights} />
  </g>
);

export const Parkplatz: React.FC<PlaceholderProps> = ({frame, duration}) => {
  // Auto rollt von links ein und kommt im Laternenlicht zum Stehen
  const t = clamp(frame / 104);
  const drive = 1 - Math.pow(1 - t, 2.6);
  const carX = lerp(-420, 560, drive);
  const lights = 1 - span(frame, 124, 132);
  const cam = lin(frame, 0, duration);
  return (
    <Scene frame={frame} background="#04080f" camera={{scale: 1 + 0.05 * cam, pivot: [860, 600]}}>
      <Firmengelaende frame={frame} />
      <Fog frame={frame} y={690} id="pk" opacity={0.085} />
      <Auto x={carX} y={846} lights={lights} />
      <Fog frame={frame + 400} y={880} id="pk2" opacity={0.06} />
      <Drizzle frame={frame} />
    </Scene>
  );
};

// ───────────────────────── S1-B · Markus am Eingang ─────────────────────────

/** Abklingendes Rütteln ab einem Start-Frame. */
const rattle = (frame: number, start: number, strength: number) => {
  const d = frame - start;
  if (d < 0 || d > 22) return 0;
  return strength * Math.sin(d * 1.9) * Math.exp(-d / 5.5);
};

export const EingangMarkus: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const walkT = clamp(frame / 80);
  const walk = 1 - Math.pow(1 - walkT, 1.8);
  const x = lerp(300, 1128, walk);
  const walking = 1 - span(frame, 70, 84);

  const reach: Pose = {lean: 3, armF: [72, 14], armB: [-6, 12], legF: [10, 4], legB: [-12, 3]};
  const pull1: Pose = {lean: -7, armF: [84, 6], armB: [-14, 20], legF: [14, 2], legB: [-16, 8], drop: 1};
  const pull2: Pose = {lean: -12, armF: [92, 4], armB: [-20, 26], legF: [18, 2], legB: [-20, 12], drop: 2};
  const give: Pose = {lean: 2, head: 14, armF: [8, 12], armB: [-6, 12], legF: [4, 2], legB: [-6, 2]};

  let pose = mixPose(walkPose(frame * 0.215), standPose, 1 - walking);
  pose = mixPose(pose, reach, span(frame, 78, 94));
  pose = mixPose(pose, pull1, span(frame, 96, 101) * (1 - span(frame, 110, 120)));
  pose = mixPose(pose, pull2, span(frame, 135, 140) * (1 - span(frame, 150, 160)));
  pose = mixPose(pose, give, span(frame, 158, 174));

  const shake = rattle(frame, 98, 6) + rattle(frame, 137, 10);
  const cam = lin(frame, 0, duration);

  return (
    <Scene frame={frame} background="#070b10" camera={{scale: 1.02 + 0.07 * cam, pivot: [1180, 640]}}>
      <Eingang shake={shake} />
      <Figure
        x={x}
        y={886}
        height={452}
        pose={pose}
        hat="beanie"
        color="#05080c"
        backColor="#030507"
        rim={{color: '#e0a468', dx: -0.5, dy: -0.9, opacity: 0.55 * span(frame, 40, 84)}}
      />
      {/* Schatten der Figur im Lampenlicht */}
      <ellipse cx={x - 40} cy={892} rx={120} ry={12} fill="#000" opacity={0.35 * span(frame, 50, 80)} />
      <Fog frame={frame} y={930} id="eg" opacity={0.05} />
      <Drizzle frame={frame} count={70} opacity={0.13} seed="e" />
    </Scene>
  );
};

// ───────────────────────── S1-C · Uhr, dann Smartphone ─────────────────────────

const Armbanduhr: React.FC<{frame: number}> = ({frame}) => {
  const enter = span(frame, 0, 9);
  const second = 20 + Math.floor(frame / 30);
  const hand = (angle: number, len: number, width: number, color: string, back = 14) => (
    <line
      x1={0}
      y1={back}
      x2={0}
      y2={-len}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      transform={`rotate(${angle})`}
    />
  );
  return (
    <g transform={`translate(${lerp(-260, 0, enter)} ${lerp(190, 0, enter)}) rotate(-14 960 600)`}>
      <defs>
        <linearGradient id="uhrSleeve" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2633" />
          <stop offset="1" stopColor="#0c1219" />
        </linearGradient>
        <linearGradient id="uhrSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a6a56" />
          <stop offset="1" stopColor="#4f3b31" />
        </linearGradient>
        <linearGradient id="uhrCase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#aab5c0" />
          <stop offset="1" stopColor="#3b444e" />
        </linearGradient>
      </defs>
      {/* Hand und Handgelenk */}
      <path d="M700 490 H1420 C1500 490 1560 520 1600 560 L1680 640 C1700 664 1680 700 1650 700 H1480 C1440 720 1380 730 1320 730 H700Z" fill="url(#uhrSkin)" />
      {/* Jackenärmel */}
      <path d="M-400 420 H800 C812 420 822 430 822 442 V778 C822 790 812 800 800 800 H-400Z" fill="url(#uhrSleeve)" />
      <rect x={770} y={420} width={52} height={380} rx={12} fill="#0a0f15" />
      {[200, 430, 610].map((x) => (
        <path key={x} d={`M${x} 430 C${x + 30} 540 ${x - 20} 680 ${x + 12} 792`} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={6} />
      ))}
      {/* Armband und Uhr */}
      <rect x={900} y={452} width={172} height={316} rx={10} fill="#131518" />
      <g transform="translate(986 610)">
        <circle r={128} fill="url(#uhrCase)" />
        <circle r={112} fill="#0c1218" />
        {Array.from({length: 12}, (_, i) => (
          <line
            key={i}
            x1={0}
            y1={-102}
            x2={0}
            y2={i % 3 === 0 ? -80 : -90}
            stroke="#dfe9e6"
            strokeWidth={i === 0 ? 9 : i % 3 === 0 ? 6 : 3.4}
            strokeLinecap="butt"
            transform={`rotate(${i * 30})`}
          />
        ))}
        {/* 05:45 → Stundenzeiger kurz vor der 6, Minutenzeiger auf der 9 */}
        {hand(172.5, 56, 11, '#e6f4ea')}
        {hand(270, 86, 8, '#e6f4ea')}
        {hand(second * 6, 94, 2.6, '#f2a33a', 22)}
        <circle r={7} fill="#e6f4ea" />
        <path d="M-80 -70 A106 106 0 0 1 20 -104" fill="none" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={10} strokeLinecap="round" />
      </g>
    </g>
  );
};

export const UhrHandy: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cut = 54; // nach 1,8 s Umschnitt von der Uhr auf das Smartphone
  if (frame < cut) {
    return (
      <Scene frame={frame} background="#070b10" camera={{scale: 1 + 0.04 * lin(frame, 0, cut), pivot: [980, 600]}} vignette={0.75}>
        <defs>
          <radialGradient id="uhrLamp" cx="0.86" cy="0.02" r="0.9">
            <stop offset="0" stopColor="#ffbd7a" stopOpacity={0.3} />
            <stop offset="1" stopColor="#ffbd7a" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="#0a1018" />
        <rect width={1920} height={1080} fill="url(#uhrLamp)" />
        <Armbanduhr frame={frame} />
        <rect width={1920} height={1080} fill="url(#uhrLamp)" opacity={0.5} />
        <Drizzle frame={frame} count={40} opacity={0.1} seed="u" />
      </Scene>
    );
  }

  const f = frame - cut;
  const d = duration - cut;
  const raise = span(f, 2, 20);
  const screenOn = span(f, 20, 26);
  const idle: Pose = {lean: 3, head: 10, armF: [14, 24], armB: [-6, 14]};
  const hold: Pose = {lean: 4, head: 24, armF: [22, 118], armB: [-4, 16]};
  const fig = {x: 800, y: 2010, height: 1620, facing: 1 as const, pose: mixPose(idle, hold, raise)};
  const [hx, hy] = handPosition(fig);
  const glow = screenOn * (0.93 + 0.07 * Math.sin(f / 3));
  return (
    <Scene frame={frame} background="#070b10" camera={{scale: 1 + 0.035 * lin(f, 0, d), pivot: [900, 520]}} vignette={0.75}>
      <defs>
        <linearGradient id="hyCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffbd7a" stopOpacity={0.42} />
          <stop offset="1" stopColor="#ffbd7a" stopOpacity={0.08} />
        </linearGradient>
        <radialGradient id="hyScreen">
          <stop offset="0" stopColor="#cfe4ff" stopOpacity={0.55} />
          <stop offset="0.35" stopColor="#8fbdf2" stopOpacity={0.2} />
          <stop offset="1" stopColor="#8fbdf2" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="hyLit">
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id="hyMask" maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
          <circle cx={hx} cy={hy - 60} r={560} fill="url(#hyLit)" />
        </mask>
      </defs>
      <rect width={1920} height={1080} fill="#0b121b" />
      {/* unscharfe Fassade mit Lampenlicht hinter der Figur */}
      <rect x={1120} y={-40} width={560} height={1200} fill="#131d29" />
      <rect x={1150} y={0} width={240} height={1200} fill="#0a1119" />
      <rect x={1410} y={0} width={240} height={1200} fill="#0a1119" />
      <path d="M1060 -120 L260 1140 L1860 1140Z" fill="url(#hyCone)" />
      <Figure {...fig} hat="beanie" color="#05080c" backColor="#030507" rim={{color: '#e0a468', dx: 0.7, dy: -0.7, opacity: 0.5}} phone={screenOn} />
      {/* vom Display beleuchtete Seite der Figur */}
      <g mask="url(#hyMask)" opacity={glow * 0.9}>
        <Figure {...fig} hat="beanie" color="#31465e" backColor="#1c2a3a" />
      </g>
      <Figure {...fig} hat="none" color="transparent" backColor="transparent" phone={screenOn} />
      <circle cx={hx} cy={hy - 60} r={430} fill="url(#hyScreen)" opacity={glow} />
      <Drizzle frame={frame} count={40} opacity={0.1} seed="h" />
    </Scene>
  );
};
