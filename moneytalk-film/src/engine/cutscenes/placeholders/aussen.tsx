import React from 'react';
import {UI_FONT} from '../../fonts';
import {rnd} from './kit';

/**
 * Wiederverwendbare Außenmotive der Nordwerk Maschinenbau GmbH
 * (Totale mit Halle und Parkplatz; Eingangsbereich in der Halbtotale).
 */

/** Windrad am Horizont – Ostfriesland in einem Strich. */
const Windrad: React.FC<{x: number; y: number; h: number; frame: number; phase: number}> = ({x, y, h, frame, phase}) => {
  const hubY = y - h;
  const angle = frame * 1.1 + phase;
  const blink = ((frame + phase * 3) % 66) < 16 ? 1 : 0.12;
  return (
    <g>
      <path d={`M${x - 2.2} ${y} L${x - 0.9} ${hubY} L${x + 0.9} ${hubY} L${x + 2.2} ${y} Z`} fill="#0b121b" />
      <g transform={`rotate(${angle} ${x} ${hubY})`} fill="#0b121b">
        {[0, 120, 240].map((a) => (
          <path key={a} d={`M${x - 1.5} ${hubY} L${x} ${hubY - h * 0.62} L${x + 2.2} ${hubY} Z`} transform={`rotate(${a} ${x} ${hubY})`} />
        ))}
      </g>
      <circle cx={x} cy={hubY - 3} r={2.4} fill="#ff4a3a" opacity={blink} />
    </g>
  );
};

/** Totale: Halle, Bürotrakt, Parkplatz, Laterne. */
export const Firmengelaende: React.FC<{
  frame: number;
  /** 0 = alles dunkel, 1 = Fenster und Halle beleuchtet. */
  lightsOn?: number;
}> = ({frame, lightsOn = 0}) => {
  const warm = (o: number) => `rgba(255, 214, 150, ${o * lightsOn})`;
  return (
    <g>
      <defs>
        <linearGradient id="fgSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04080f" />
          <stop offset="0.55" stopColor="#0c1828" />
          <stop offset="1" stopColor="#1d3044" />
        </linearGradient>
        <linearGradient id="fgGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1219" />
          <stop offset="1" stopColor="#05080c" />
        </linearGradient>
        <radialGradient id="fgDawn" cx="0.86" cy="1" r="0.6">
          <stop offset="0" stopColor="#8c7a78" stopOpacity={0.3} />
          <stop offset="1" stopColor="#8c7a78" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="fgCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb265" stopOpacity={0.34} />
          <stop offset="1" stopColor="#ffb265" stopOpacity={0.02} />
        </linearGradient>
        <radialGradient id="fgPool">
          <stop offset="0" stopColor="#ffb265" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffb265" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="fgGlow">
          <stop offset="0" stopColor="#ffd9a8" stopOpacity={0.9} />
          <stop offset="0.25" stopColor="#ffb265" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffb265" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Himmel, erstes Dämmerlicht */}
      <rect x={-200} y={-200} width={2320} height={850} fill="url(#fgSky)" />
      <rect x={-200} y={-200} width={2320} height={850} fill="url(#fgDawn)" />

      {/* Deich und Windräder */}
      <path d="M-200 628 C300 606 700 612 1100 618 S1900 604 2120 616 V660 H-200Z" fill="#0a111a" />
      <Windrad x={150} y={616} h={92} frame={frame} phase={20} />
      <Windrad x={282} y={614} h={70} frame={frame} phase={95} />
      <Windrad x={1778} y={610} h={84} frame={frame} phase={160} />

      {/* Boden */}
      <rect x={-200} y={640} width={2320} height={640} fill="url(#fgGround)" />

      {/* Halle */}
      <path d="M800 640V414l410-34 410 34v226z" fill="#0d1620" />
      <path d="M800 414l410-34 410 34" fill="none" stroke="#1b2a3a" strokeWidth={3} />
      {/* Hallentor */}
      <rect x={1286} y={506} width={190} height={134} fill="#0a1119" stroke="#16222f" strokeWidth={2} />
      {[530, 554, 578, 602, 626].map((y) => (
        <line key={y} x1={1286} y1={y} x2={1476} y2={y} stroke="#16222f" strokeWidth={2} />
      ))}
      <rect x={1286} y={506} width={190} height={134} fill={warm(0.5)} />
      {/* Oberlichtband der Halle */}
      {Array.from({length: 9}, (_, i) => (
        <g key={i}>
          <rect x={846 + i * 84} y={446} width={56} height={22} fill="#111c28" />
          <rect x={846 + i * 84} y={446} width={56} height={22} fill={warm(0.85 * (lightsOn > i / 9 ? 1 : 0))} />
        </g>
      ))}
      {/* Firmenschriftzug an der Halle */}
      <text x={870} y={546} fontFamily={UI_FONT} fontSize={64} fontWeight={800} letterSpacing={9} fill="#93a8bc" opacity={0.78}>
        NORDWERK
      </text>
      <text x={873} y={582} fontFamily={UI_FONT} fontSize={21} fontWeight={500} letterSpacing={7.4} fill="#93a8bc" opacity={0.6}>
        MASCHINENBAU GMBH
      </text>

      {/* Bürotrakt mit Eingang */}
      <rect x={520} y={478} width={280} height={162} fill="#101a25" />
      <rect x={512} y={470} width={296} height={10} fill="#18232f" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={544 + i * 62} y={504} width={44} height={50} fill="#0a1119" />
          <rect x={544 + i * 62} y={504} width={44} height={50} fill={warm(0.8)} />
        </g>
      ))}
      <rect x={736} y={556} width={44} height={84} fill="#080d13" stroke="#263341" strokeWidth={2} />
      <rect x={736} y={556} width={44} height={84} fill={warm(0.9)} />
      <rect x={726} y={546} width={64} height={7} fill="#1b2733" />
      {/* Lampe über dem Eingang */}
      <circle cx={758} cy={560} r={34} fill="url(#fgGlow)" opacity={0.55} />
      <path d="M758 556 L700 652 L816 652Z" fill="url(#fgCone)" opacity={0.5} />

      {/* Parkbuchten */}
      <g stroke="#aab8c6" strokeOpacity={0.13} strokeWidth={3}>
        {Array.from({length: 11}, (_, i) => {
          const x = 380 + i * 118;
          return <line key={i} x1={x} y1={716} x2={x - 60 + i * 6} y2={860} />;
        })}
        <line x1={300} y1={716} x2={1640} y2={716} />
      </g>

      {/* Laterne */}
      <path d="M352 786V332h78" fill="none" stroke="#111a24" strokeWidth={9} strokeLinecap="round" />
      <rect x={410} y={326} width={54} height={13} rx={4} fill="#1a242f" />
      <path d="M436 340 L170 842 L790 842Z" fill="url(#fgCone)" />
      <ellipse cx={470} cy={836} rx={360} ry={52} fill="url(#fgPool)" />
      <circle cx={437} cy={340} r={70} fill="url(#fgGlow)" />

      {/* Nässe: Spiegelungen auf dem Asphalt */}
      {Array.from({length: 26}, (_, i) => (
        <rect
          key={i}
          x={180 + rnd(`pw${i}`) * 620}
          y={800 + rnd(`ph${i}`) * 110}
          width={30 + rnd(`pl${i}`) * 90}
          height={2}
          fill="#ffc98a"
          opacity={0.05 + 0.08 * rnd(`po${i}`)}
        />
      ))}
    </g>
  );
};

/** Halbtotale: Eingangstür mit Vordach, Lampe und Firmenschild. */
export const Eingang: React.FC<{
  /** Rütteln der Tür in Pixeln. */
  shake?: number;
  /** 0 = geschlossen, 1 = rechter Flügel offen. */
  open?: number;
  /** Licht im Gebäude 0–1. */
  interior?: number;
}> = ({shake = 0, open = 0, interior = 0}) => {
  const leafW = 170;
  return (
    <g>
      <defs>
        <linearGradient id="egWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1018" />
          <stop offset="1" stopColor="#111a25" />
        </linearGradient>
        <linearGradient id="egCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffbd7a" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffbd7a" stopOpacity={0.04} />
        </linearGradient>
        <radialGradient id="egPool">
          <stop offset="0" stopColor="#ffbd7a" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffbd7a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="egGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b2836" />
          <stop offset="0.5" stopColor="#101a25" />
          <stop offset="1" stopColor="#16222f" />
        </linearGradient>
        <linearGradient id="egWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2b0" />
          <stop offset="1" stopColor="#e9b877" />
        </linearGradient>
        <radialGradient id="egWallGlow">
          <stop offset="0" stopColor="#ffc890" stopOpacity={0.3} />
          <stop offset="0.5" stopColor="#ffc890" stopOpacity={0.1} />
          <stop offset="1" stopColor="#ffc890" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="egSpill" cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.4} />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Fassade */}
      <rect x={-300} y={-300} width={2520} height={1184} fill="url(#egWall)" />
      {Array.from({length: 15}, (_, i) => (
        <line key={i} x1={-300} y1={60 + i * 58} x2={2220} y2={60 + i * 58} stroke="#ffffff" strokeOpacity={0.022} strokeWidth={2} />
      ))}
      {/* Lampenlicht auf der Fassade */}
      <ellipse cx={1250} cy={520} rx={760} ry={560} fill="url(#egWallGlow)" />
      {/* Gehweg */}
      <rect x={-300} y={884} width={2520} height={400} fill="#070b10" />
      {Array.from({length: 14}, (_, i) => (
        <line key={i} x1={-200 + i * 180} y1={884} x2={-320 + i * 200} y2={1100} stroke="#ffffff" strokeOpacity={0.03} strokeWidth={2} />
      ))}

      {/* Bürofenster links */}
      <rect x={250} y={430} width={400} height={270} fill="#070c12" stroke="#1d2935" strokeWidth={6} />
      <rect x={250} y={430} width={400} height={270} fill="url(#egWarm)" opacity={0.85 * interior} />
      {Array.from({length: 11}, (_, i) => (
        <line key={i} x1={253} y1={452 + i * 23} x2={647} y2={452 + i * 23} stroke="#000" strokeOpacity={0.35} strokeWidth={5} />
      ))}
      <line x1={450} y1={430} x2={450} y2={700} stroke="#1d2935" strokeWidth={6} />

      {/* Vordach und Lampe */}
      <rect x={1010} y={292} width={480} height={30} fill="#17212c" />
      <rect x={1010} y={318} width={480} height={5} fill="#0a0f15" />
      <path d="M1250 326 L990 884 L1510 884Z" fill="url(#egCone)" />
      <ellipse cx={1250} cy={900} rx={330} ry={46} fill="url(#egPool)" />

      {/* Türrahmen */}
      <rect x={1062} y={334} width={376} height={550} fill="#232e3a" />
      {/* Blick ins Gebäude (wenn Licht an) */}
      <rect x={1076} y={348} width={348} height={536} fill="#05080c" />
      <rect x={1076} y={348} width={348} height={536} fill="url(#egWarm)" opacity={interior} />

      {/* linker Flügel */}
      <g transform={`translate(${shake} 0)`}>
        <rect x={1076} y={348} width={leafW} height={536} fill="url(#egGlass)" opacity={1 - 0.75 * interior} stroke="#3a4856" strokeWidth={5} />
        <path d="M1100 380l60 0-80 220 0-140z" fill="#ffffff" opacity={0.035} />
        <line x1={1224} y1={560} x2={1224} y2={706} stroke="#9aa8b6" strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* rechter Flügel (öffnet sich) */}
      <g transform={`translate(${1424 + shake * 0.8} 0) scale(${1 - 0.78 * open} 1) translate(-1424 0)`}>
        <rect x={1254} y={348} width={leafW} height={536} fill="url(#egGlass)" opacity={1 - 0.75 * interior} stroke="#3a4856" strokeWidth={5} />
        <path d="M1290 380l70 0-90 250 0-160z" fill="#ffffff" opacity={0.035} />
        <line x1={1276} y1={560} x2={1276} y2={706} stroke="#9aa8b6" strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* Lichtschein aus dem Gebäude auf den Gehweg */}
      <ellipse cx={1250} cy={884} rx={520} ry={150} fill="url(#egSpill)" opacity={interior} />

      {/* Lichtkegel vor der Tür */}
      <path d="M1250 326 L1040 884 L1460 884Z" fill="url(#egCone)" opacity={0.55 * (1 - interior)} />
      {/* Lampe */}
      <rect x={1226} y={322} width={48} height={9} rx={3} fill="#ffe3bd" />

      {/* Firmenschild */}
      <rect x={806} y={500} width={208} height={128} rx={5} fill="#1a2530" stroke="#51616f" strokeWidth={2.5} />
      <text x={910} y={556} textAnchor="middle" fontFamily={UI_FONT} fontSize={31} fontWeight={800} letterSpacing={3.4} fill="#dbe3ea">
        NORDWERK
      </text>
      <line x1={836} y1={572} x2={984} y2={572} stroke="#f2a33a" strokeWidth={3} />
      <text x={910} y={602} textAnchor="middle" fontFamily={UI_FONT} fontSize={17.5} fontWeight={500} letterSpacing={0.6} fill="#a9b8c6">
        Maschinenbau GmbH
      </text>
    </g>
  );
};
