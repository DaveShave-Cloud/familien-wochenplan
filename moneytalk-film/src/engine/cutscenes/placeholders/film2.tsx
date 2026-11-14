import React from 'react';
import {UI_FONT} from '../../fonts';
import {
  BuchhaltungRaum,
  COOL_RIM,
  Chefbuero,
  DARK,
  FLOOR,
  Fenster,
  Halle,
  MonitorSchein,
  Ordner,
  Ordnerregal,
  Papierstapel,
  Raum,
  Stuhl,
  Tisch,
  Tischtelefon,
  sit,
  typing,
} from './innen';
import {Figure, Scene, handPosition, lerp, lin, mixPose, rnd, span, walkPose, type PlaceholderProps, type Pose} from './kit';

/**
 * Ersatzsequenzen, die nur Film 2 („Gut, dass wir vorbereitet sind“) braucht.
 * Gleiche Schauplätze wie in Film 1 – aber mit Tageslicht, und es wird gehandelt.
 */

const WARM_RIM = {color: '#f0c48e', dx: -0.45, dy: -0.6, opacity: 0.4};

// ───────────────────────── N1 · Der Notfallordner ─────────────────────────

/** Inhaltsverzeichnis des Ordners – das, was das Publikum mitnehmen soll. */
const INHALT: {titel: string; text: string; farbe: string}[] = [
  {titel: 'Vertretungsplan', text: 'Wer entscheidet was, wenn Thomas ausfällt', farbe: '#d9541e'},
  {titel: 'Vollmachten', text: 'Bank, Verträge, Personal', farbe: '#d69a2d'},
  {titel: 'Schlüssel und Zugänge', text: 'Schlüsselliste, IT-Notfallzugang (versiegelt)', farbe: '#4f9363'},
  {titel: 'Wichtige Kontakte', text: 'Bank, Steuerberater, Anwalt, Versicherungen', farbe: '#3f83ad'},
  {titel: 'Laufende Aufträge', text: 'Kunden, Konditionen, Lieferanten', farbe: '#7d63a6'},
];

const OrdnerAufgeschlagen: React.FC<{frame: number; duration: number}> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  // der Blick wandert Zeile für Zeile durch das Inhaltsverzeichnis
  const active = Math.min(INHALT.length - 1, Math.max(0, Math.floor((frame - 12) / 24)));
  const rowY = (i: number) => 338 + i * 138;
  const barY = lerp(rowY(Math.max(0, active - 1)), rowY(active), frame < 12 ? 1 : span(frame, 12 + active * 24, 12 + active * 24 + 8));
  return (
    <Scene frame={frame} background="#120d09" camera={{scale: 1.02 + 0.07 * cam, pivot: [1240, 520]}} vignette={0.62} warm={0.5}>
      <defs>
        <linearGradient id="noDesk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b1f15" />
          <stop offset="1" stopColor="#150f0a" />
        </linearGradient>
        <radialGradient id="noSun" cx="0.8" cy="0.1" r="0.9">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="noSteel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6c7884" />
          <stop offset="0.5" stopColor="#c3ccd4" />
          <stop offset="1" stopColor="#5d6873" />
        </linearGradient>
      </defs>
      <g transform="rotate(-1.6 960 540)">
        {/* Schreibtischplatte */}
        <rect x={-200} y={-200} width={2320} height={1480} fill="url(#noDesk)" />
        {Array.from({length: 26}, (_, i) => (
          <path
            key={i}
            d={`M-200 ${-120 + i * 54 + rnd(`ng${i}`) * 20} C500 ${-140 + i * 54} 1300 ${-90 + i * 54} 2120 ${-120 + i * 54 + rnd(`nh${i}`) * 24}`}
            fill="none"
            stroke="#000"
            strokeOpacity={0.12}
            strokeWidth={2}
          />
        ))}

        {/* Ordnerdeckel (außen orange) */}
        <rect x={214} y={18} width={1500} height={1300} rx={14} fill="#d9541e" />
        {/* linke Innenseite mit Einstecktasche */}
        <rect x={232} y={36} width={680} height={1260} rx={6} fill="#c4bdb0" />
        <path d="M232 700 L912 610 L912 1296 L232 1296Z" fill="#b3ac9f" />
        <path d="M232 700 L912 610" stroke="#8f887c" strokeWidth={4} />
        {/* versiegelter Umschlag in der Tasche */}
        <g transform="rotate(-5 560 560)">
          <rect x={320} y={400} width={500} height={330} rx={6} fill="#f0eadd" />
          <path d="M320 406 L570 590 L820 406" fill="none" stroke="#c9c1b0" strokeWidth={4} />
          <circle cx={570} cy={590} r={34} fill="#a8352b" />
          <circle cx={570} cy={590} r={22} fill="none" stroke="#7d241d" strokeWidth={4} />
          <text x={570} y={480} textAnchor="middle" fontFamily={UI_FONT} fontSize={31} fontWeight={800} letterSpacing={5} fill="#2a2f35">
            ZUGANGSDATEN
          </text>
          <text x={570} y={680} textAnchor="middle" fontFamily={UI_FONT} fontSize={23} fontWeight={500} fill="#5a626b">
            versiegelt – nur im Notfall öffnen
          </text>
        </g>

        {/* Papier mit Register rechts */}
        <rect x={968} y={62} width={700} height={1240} fill="#bfb8ab" />
        <rect x={960} y={54} width={700} height={1240} fill="#d8d2c6" />
        <rect x={952} y={46} width={700} height={1240} fill="#ece8de" />
        {INHALT.map((item, i) => (
          <g key={i}>
            <rect x={1640} y={150 + i * 150} width={70} height={132} rx={10} fill={item.farbe} />
            <text x={1680} y={228 + i * 150} textAnchor="middle" fontFamily={UI_FONT} fontSize={34} fontWeight={800} fill="#fff">
              {i + 1}
            </text>
          </g>
        ))}

        {/* Ringmechanik */}
        <rect x={912} y={120} width={40} height={960} rx={8} fill="url(#noSteel)" />
        {[330, 800].map((y) => (
          <g key={y}>
            <ellipse cx={962} cy={y} rx={56} ry={20} fill="none" stroke="url(#noSteel)" strokeWidth={11} />
            <circle cx={1012} cy={y} r={12} fill="#120d09" opacity={0.75} />
          </g>
        ))}

        {/* Lesemarke: der Blick wandert durch die Liste */}
        <rect x={1052} y={barY - 52} width={566} height={118} rx={12} fill="#f2a33a" opacity={0.2 * span(frame, 4, 14)} />

        {/* Inhaltsverzeichnis */}
        <text x={1060} y={148} fontFamily={UI_FONT} fontSize={23} fontWeight={800} letterSpacing={5.4} fill="#b03f14">
          NOTFALLORDNER
        </text>
        <text x={1058} y={222} fontFamily={UI_FONT} fontSize={66} fontWeight={700} fill="#1c2228">
          Inhalt
        </text>
        <rect x={1060} y={250} width={552} height={3} fill="#1c2228" opacity={0.18} />
        {INHALT.map((item, i) => (
          <g key={i} opacity={i <= active ? 1 : 0.62}>
            <rect x={1064} y={rowY(i) - 38} width={58} height={58} rx={9} fill={item.farbe} />
            <text x={1093} y={rowY(i) + 3} textAnchor="middle" fontFamily={UI_FONT} fontSize={33} fontWeight={800} fill="#fff">
              {i + 1}
            </text>
            <text x={1142} y={rowY(i) - 4} fontFamily={UI_FONT} fontSize={37} fontWeight={650} fill="#1c2228">
              {item.titel}
            </text>
            <text x={1142} y={rowY(i) + 34} fontFamily={UI_FONT} fontSize={23} fontWeight={400} fill="#4d565f">
              {item.text}
            </text>
          </g>
        ))}

        {/* Svens Hand hält den Ordner auf */}
        <path d="M120 1180 C180 1010 300 930 420 950 C470 960 480 1010 440 1040 L330 1110 C300 1150 270 1200 250 1260Z" fill="#7a5c4a" />
        <path d="M-80 1300 C0 1120 120 1080 250 1120 L300 1300Z" fill="#141c26" />

        <rect x={-200} y={-200} width={2320} height={1480} fill="url(#noSun)" />
      </g>
    </Scene>
  );
};

export const Notfallordner: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cut = 104; // nach 3,5 s Umschnitt auf den aufgeschlagenen Ordner
  if (frame >= cut) {
    return <OrdnerAufgeschlagen frame={frame - cut} duration={duration - cut} />;
  }

  // Sven kniet am Tresor, öffnet ihn, nimmt den Ordner heraus und geht zum Schreibtisch
  const stand: Pose = {lean: 4, head: 10, armF: [10, 16], armB: [-4, 12], legF: [3, 2], legB: [-4, 2]};
  const crouch: Pose = {lean: 26, head: 6, drop: 22, armF: [30, 30], armB: [10, 40], legF: [52, 78], legB: [14, 70]};
  const reach: Pose = {...crouch, armF: [52, 6]};
  const hold: Pose = {lean: 3, head: 12, armF: [26, 98], armB: [18, 96], legF: [3, 2], legB: [-4, 2]};
  let pose = mixPose(stand, crouch, span(frame, 0, 16));
  pose = mixPose(pose, reach, span(frame, 18, 34));
  pose = mixPose(pose, hold, span(frame, 50, 70));
  const walking = span(frame, 74, 82);
  if (walking > 0) {
    const w = walkPose((frame - 74) * 0.23, 0.6);
    pose = mixPose(pose, {...w, armF: hold.armF, armB: hold.armB, lean: 4, head: 8}, walking);
  }
  const facing: 1 | -1 = frame < 72 ? -1 : 1;
  const x = 440 + 210 * span(frame, 76, 104);
  const fig = {x, y: FLOOR, height: 474, facing, pose};
  const [hx, hy] = handPosition(fig);
  const carried = frame >= 44;
  const cam = lin(frame, 0, cut);

  return (
    <Scene frame={frame} background="#0a0f14" camera={{scale: 1.5 + 0.06 * cam, x: lerp(0, -150, span(frame, 70, 104)), y: -40, pivot: [430, 700]}} vignette={0.66} warm={0.45}>
      <Chefbuero frame={frame} minute={47} warm={0.5} anrufe={false} tresor={span(frame, 4, 22)} ordnerImTresor={!carried} />
      <Figure {...fig} {...DARK} rim={WARM_RIM} />
      {carried ? <Ordner x={hx + facing * 6} y={hy + 62} scale={0.78} rotate={facing * lerp(-16, -4, span(frame, 50, 70))} /> : null}
    </Scene>
  );
};

// ───────────────────────── N2 · Freigabe zu zweit ─────────────────────────

export const FreigabeZuZweit: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  const done = 62; // Freigabe bestätigt: der Bildschirm wechselt auf Grün
  const relaxed = sit({lean: -5, head: -12, armF: [10, 46], armB: [6, 44]});
  const katja = mixPose(frame < 46 ? typing(frame) : sit({lean: 6, head: 10, armF: [20, 64], armB: [14, 62]}), relaxed, span(frame, done + 6, done + 30));
  const lookIn: Pose = {lean: 12, head: 16, armF: [40, 14], armB: [-6, 10], legF: [4, 2], legB: [-6, 2]};
  const upright: Pose = {lean: 3, head: 8 + 5 * Math.sin((frame - done) / 5) * (1 - span(frame, done + 24, done + 40)), armF: [8, 14], armB: [-4, 10], legF: [3, 2], legB: [-4, 2]};
  const sven = mixPose(lookIn, upright, span(frame, done + 2, done + 22));
  return (
    <Scene frame={frame} background="#0b1016" camera={{scale: 1.26 + 0.08 * cam, pivot: [1050, 590]}} warm={0.34} vignette={0.52}>
      <BuchhaltungRaum
        pose={katja}
        chairTilt={4 * span(frame, done + 6, done + 30)}
        monitor={frame >= done && frame < done + 5 ? 1.25 : 1}
        monitorFarbe={frame >= done ? '#b4f2c6' : undefined}
        fenster={0.86}
        fensterFarbe="#dbe8f2"
        hinten={<Figure x={806} y={FLOOR} height={480} pose={sven} {...DARK} rim={WARM_RIM} />}
      />
    </Scene>
  );
};

// ───────────────────────── N3 · Julia telefoniert mit dem Kunden ─────────────────────────

export const VertriebTelefoniert: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  const nod = 3 * Math.sin(frame / 8);
  const listen = sit({lean: 2, head: -2 + nod, armF: [40, 138], armB: [14, 56]});
  const explain = sit({lean: 4, head: 2 + nod, armF: [40, 138], armB: [34, 30]});
  const pose = mixPose(listen, explain, span(frame, 40, 58) * (1 - span(frame, 78, 92)));
  return (
    <Scene frame={frame} background="#0b1016" camera={{scale: 1.42 + 0.08 * cam, pivot: [1130, 640]}} warm={0.4} vignette={0.56}>
      <Raum id="vt2" top="#222b34" bottom="#141c24" />
      <Fenster id="vt2" x={1380} y={150} w={470} h={440} strength={0.92} color="#e2ecf3" />
      <Ordnerregal x={300} y={330} w={300} rows={2} seed="vt" />
      <MonitorSchein id="vt2" x={1180} y={708} on={0.6} />
      <Stuhl x={900} seat={112} />
      <Figure x={914} y={FLOOR} height={470} pose={pose} hat="bun" {...DARK} rim={{...WARM_RIM, dx: 0.45}} phone={0.02} />
      <Tisch x={700} y={708} w={820} />
      {/* aufgeklappter Laptop */}
      <rect x={1030} y={698} width={150} height={10} rx={4} fill="#1f2a34" />
      <path d="M1172 700 L1204 596 L1214 599 L1182 703Z" fill="#141c24" />
      <path d="M1174 696 L1203 602 L1207 603 L1178 697Z" fill="#cfe2ff" opacity={0.7} />
      <Papierstapel x={760} y={708} n={3} seed="vt" />
      <Tischtelefon x={1340} y={708} scale={1.05} led={0.55} ledColor="#4fe07a" display={0.9} handset={false} />
    </Scene>
  );
};

// ───────────────────────── N4 · Die Produktion läuft ─────────────────────────

export const ProduktionLaeuft: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const cam = lin(frame, 0, duration);
  // am Bedienpult
  const panel: Pose = {lean: 4, head: 8, armF: [70 + 3 * Math.sin(frame / 6), 10], armB: [4, 20], legF: [4, 2], legB: [-5, 2]};
  // trägt Material zur Maschine
  const carryX = lerp(640, 930, cam);
  const carry: Pose = {...walkPose(frame * 0.22, 0.7), armF: [34, 66], armB: [28, 70], lean: 5};
  const carryFig = {x: carryX, y: FLOOR + 6, height: 462, facing: 1 as const, pose: carry};
  const [bx, by] = handPosition(carryFig);
  // stapelt an der Palette
  const stack: Pose = {lean: 24 + 4 * Math.sin(frame / 12), head: 6, armF: [58, 8], armB: [50, 10], legF: [10, 12], legB: [-8, 8], drop: 3};
  return (
    <Scene frame={frame} background="#0b1016" camera={{scale: 1.04 + 0.05 * cam, x: lerp(24, -24, cam), pivot: [1000, 620]}} warm={0.26} vignette={0.5}>
      <Halle frame={frame} laeuft>
        <Figure x={500} y={FLOOR + 2} height={448} facing={-1} pose={stack} hat="none" {...DARK} rim={COOL_RIM} />
        <Figure {...carryFig} hat="beanie" {...DARK} rim={COOL_RIM} />
        <g>
          <rect x={bx - 26} y={by - 44} width={78} height={56} fill="#3a3f43" />
          <rect x={bx - 26} y={by - 44} width={78} height={5} fill="#fff" opacity={0.08} />
        </g>
        <Figure x={1410} y={FLOOR + 4} height={456} pose={panel} hat="none" {...DARK} rim={COOL_RIM} />
      </Halle>
    </Scene>
  );
};

// ───────────────────────── N5 · Chefbüro: der Ordner auf dem Tisch ─────────────────────────

/** Gegenstück zur Zufahrt auf den leeren Sessel in Film 1: Der Chef fehlt – aber der Ordner ist da. */
export const ChefbueroOrdner: React.FC<PlaceholderProps> = ({frame, duration}) => {
  const t = lin(frame, 0, duration);
  const eased = t * t * (3 - 2 * t);
  return (
    <Scene frame={frame} background="#0a0f14" camera={{scale: 1.0 + 1.25 * eased, y: lerp(0, 30, eased), pivot: [868, 610]}} vignette={0.5 + 0.12 * eased} warm={0.7}>
      <Chefbuero frame={frame} minute={56} warm={1} ordner anrufe={false} />
    </Scene>
  );
};
