import React from 'react';
import {Eingang, Firmengelaende} from './aussen';
import {Breath, Drizzle, Figure, Fog, Scene, lerp, lin, mixPose, rnd, span, standPose, walkPose, type PlaceholderProps, type Pose} from './kit';

const RIM = {color: '#e0a468', dx: -0.5, dy: -0.9, opacity: 0.4};
const DARK = {color: '#05080c', backColor: '#030507'};

/** Leichtes Gewichtverlagern beim Warten in der Kälte. */
const waitPose = (frame: number, seed: number, base: Pose = standPose): Pose => {
  const sway = Math.sin(frame / (38 + seed * 7) + seed * 2.1);
  const hunch: Pose = {lean: 5, head: 8, armF: [10, 46], armB: [4, 50], legF: [4, 2], legB: [-5, 3]};
  return {
    ...mixPose(base, hunch, 0.75),
    lean: 4 + 1.6 * sway,
    drop: 0.5 + 0.5 * Math.sin(frame / 11 + seed),
  };
};

// ───────────────────────── S2-A · Wartende Mitarbeiter ─────────────────────────

export const Wartende: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  // Acht Wartende insgesamt (sechs hier + der Telefonierende + Markus): [x, Tiefe, Größe, Blickrichtung, Kopf]
  const crowd: [number, number, number, 1 | -1, 'none' | 'beanie' | 'bun' | 'long'][] = [
    [468, 14, 432, 1, 'none'],
    [590, 0, 462, 1, 'beanie'],
    [712, 20, 420, 1, 'long'],
    [838, 6, 448, 1, 'none'],
    [1492, 4, 452, -1, 'beanie'],
    [1612, 22, 426, -1, 'bun'],
  ];
  const callPose: Pose = {lean: 2, head: 4, armF: [34, 142], armB: [-2, 30], legF: [3, 2], legB: [-4, 2]};
  const phonePose: Pose = {lean: 4, head: 22, armF: [22, 112], armB: [6, 40], legF: [3, 2], legB: [-4, 2]};
  return (
    <Scene frame={frame} background="#070b10" camera={{scale: 1.0 + 0.03 * cam, x: lerp(26, -26, cam), pivot: [1100, 640]}}>
      <Eingang />
      {crowd.map(([x, depth, h, facing, hat], i) => (
        <g key={i}>
          <Figure x={x} y={888 + depth} height={h} facing={facing} pose={waitPose(frame, i)} hat={hat} {...DARK} rim={RIM} />
          <Breath frame={frame} x={x + facing * 30} y={888 + depth - h * 0.9} period={74 + i * 9} offset={i * 23} dir={facing} />
        </g>
      ))}
      {/* jemand versucht zu telefonieren */}
      <Figure x={980} y={894} height={444} facing={-1} pose={{...callPose, lean: 2 + Math.sin(frame / 30)}} hat="none" {...DARK} rim={RIM} phone={0.9} />
      <Breath frame={frame} x={966} y={500} period={81} offset={12} dir={-1} />
      {/* Markus, Blick aufs Handy */}
      <Figure x={1150} y={890} height={452} facing={1} pose={phonePose} hat="beanie" {...DARK} rim={RIM} phone={1} />
      <Breath frame={frame} x={1170} y={498} period={90} offset={40} />
      <Fog frame={frame} y={930} id="wt" opacity={0.06} />
      <Drizzle frame={frame} count={70} opacity={0.13} seed="w" />
    </Scene>
  );
};

// ───────────────────────── S2-B · Sven schließt auf ─────────────────────────

const ParkendeAutos: React.FC = () => (
  <g fill="#070b11">
    {[640, 900, 1010, 1240, 1370].map((x, i) => (
      <g key={i} transform={`translate(${x} ${742 + rnd(`pa${i}`) * 6}) scale(${0.56})`}>
        <path d="M-158 -18 C-160 -44 -150 -58 -126 -62 L-92 -98 C-84 -106 -74 -108 -62 -108 L52 -108 C66 -108 76 -104 86 -94 L118 -62 C142 -58 156 -50 158 -30 L158 -18Z" />
        <circle cx={-96} cy={-16} r={25} />
        <circle cx={98} cy={-16} r={25} />
      </g>
    ))}
  </g>
);

export const Aufschliessen: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cut = 108; // nach 3,6 s Umschnitt auf die Totale: das Licht geht an

  if (frame < cut) {
    // Sven kommt von rechts, schließt auf
    const walkT = Math.min(1, frame / 44);
    const x = lerp(1900, 1392, 1 - Math.pow(1 - walkT, 1.7));
    const arrived = span(frame, 36, 48);
    const reach: Pose = {lean: 4, head: 8, armF: [58, 30], armB: [-6, 12], legF: [8, 3], legB: [-10, 3]};
    const pose = mixPose(mixPose(walkPose(frame * 0.24), standPose, arrived), reach, span(frame, 44, 56));
    const open = span(frame, 84, 102);
    const cam = lin(frame, 0, cut);
    const onlookers: [number, number, 1 | -1, 'none' | 'beanie' | 'long'][] = [
      [690, 440, 1, 'long'],
      [820, 458, 1, 'beanie'],
      [948, 432, 1, 'none'],
    ];
    return (
      <Scene frame={frame} background="#070b10" camera={{scale: 1.05 + 0.05 * cam, pivot: [1300, 640]}}>
        <Eingang open={open} shake={frame >= 66 && frame < 72 ? Math.sin(frame * 2.4) * 2 : 0} />
        {onlookers.map(([ox, h, facing, hat], i) => (
          <g key={i}>
            <Figure x={ox} y={890 + i * 6} height={h} facing={facing} pose={waitPose(frame, i + 3)} hat={hat} {...DARK} rim={RIM} />
            <Breath frame={frame} x={ox + 14} y={890 - h * 0.9} period={70 + i * 11} offset={i * 31} />
          </g>
        ))}
        <Figure x={x} y={888} height={458} facing={-1} pose={pose} hat="none" {...DARK} rim={{...RIM, dx: 0.5}} keys />
        <Fog frame={frame} y={930} id="au" opacity={0.05} />
        <Drizzle frame={frame} count={60} opacity={0.12} seed="a" />
      </Scene>
    );
  }

  // Totale: verspätet geht in Büro und Halle das Licht an
  const f = frame - cut;
  const d = duration - cut;
  const lights = lin(f, 14, 62);
  return (
    <Scene frame={frame} background="#04080f" camera={{scale: 1.06 - 0.04 * lin(f, 0, d), pivot: [1000, 560]}}>
      <Firmengelaende frame={frame} lightsOn={lights} />
      <ParkendeAutos />
      {/* erstes Tageslicht */}
      <rect x={-200} y={-200} width={2320} height={850} fill="#7c8ea6" opacity={0.07} />
      <Fog frame={frame} y={700} id="au2" opacity={0.07} />
      <Drizzle frame={frame} count={70} opacity={0.12} seed="t" />
    </Scene>
  );
};
