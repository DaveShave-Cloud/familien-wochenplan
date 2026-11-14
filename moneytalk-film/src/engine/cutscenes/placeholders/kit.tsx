import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Grain} from '../../stage/Grain';

/**
 * Baukasten für die gezeichneten ERSATZSEQUENZEN.
 * Stil: ruhige Scherenschnitt-Bilder mit wenig Licht – bewusst kein Fotorealismus.
 * Jede Ersatzsequenz ist eine reine Funktion von (frame, duration) und damit
 * jederzeit durch einen Realfilm-Clip ersetzbar.
 */

export interface PlaceholderProps {
  /** Frame innerhalb der Sequenz. */
  frame: number;
  duration: number;
  fps: number;
}

export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 zwischen zwei Frames, weich an- und abgebremst. */
export const span = (frame: number, from: number, to: number) => {
  const t = clamp((frame - from) / Math.max(1, to - from));
  return t * t * (3 - 2 * t);
};
/** 0→1 zwischen zwei Frames, linear. */
export const lin = (frame: number, from: number, to: number) => clamp((frame - from) / Math.max(1, to - from));
export const rnd = (seed: string | number) => random(`ph-${seed}`);

const rad = (deg: number) => (deg * Math.PI) / 180;

// ───────────────────────── Szene mit Kamera ─────────────────────────

export const Scene: React.FC<{
  frame: number;
  /** Kamera: Vergrößerung und Verschiebung um einen Drehpunkt. */
  camera?: {scale?: number; x?: number; y?: number; pivot?: [number, number]};
  background: string;
  grain?: number;
  vignette?: number;
  /** 0–1: warmes Tageslicht über der ganzen Szene (Film 2). */
  warm?: number;
  children: React.ReactNode;
}> = ({frame, camera, background, grain = 0.38, vignette = 0.6, warm = 0, children}) => {
  const {scale = 1, x = 0, y = 0, pivot = [960, 540]} = camera ?? {};
  return (
    <AbsoluteFill style={{background, overflow: 'hidden'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${pivot[0] + x} ${pivot[1] + y}) scale(${scale}) translate(${-pivot[0]} ${-pivot[1]})`}>
          {children}
        </g>
      </svg>
      {warm > 0 ? (
        <AbsoluteFill
          style={{
            background: 'radial-gradient(ellipse 90% 90% at 72% 24%, rgba(255,206,140,0.34), rgba(255,188,120,0.1) 70%, rgba(255,180,110,0.04) 100%)',
            mixBlendMode: 'screen',
            opacity: warm,
          }}
        />
      ) : null}
      <Grain frame={frame} opacity={grain} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ───────────────────────── Figur ─────────────────────────

export interface Pose {
  /** Oberkörper nach vorn geneigt (Grad). */
  lean?: number;
  /** Kopf nach vorn geneigt (Grad). */
  head?: number;
  /** Vorderer Arm: [Schulterwinkel, Ellenbogenbeugung]. 0 = hängt gerade herab, + = nach vorn. */
  armF?: [number, number];
  armB?: [number, number];
  /** Vorderes Bein: [Hüftwinkel, Kniebeugung]. */
  legF?: [number, number];
  legB?: [number, number];
  /** Hüfte absenken (Einheiten bei Körpergröße 100). */
  drop?: number;
}

export interface FigureProps {
  x: number;
  /** Standlinie (Füße). */
  y: number;
  /** Körpergröße in Pixeln. */
  height: number;
  /** 1 = schaut nach rechts, -1 = nach links. */
  facing?: 1 | -1;
  pose?: Pose;
  color?: string;
  /** Farbe der hinteren Gliedmaßen (etwas dunkler für Tiefe). */
  backColor?: string;
  hat?: 'none' | 'beanie' | 'hair' | 'bun' | 'long';
  /** Leuchtendes Smartphone in der vorderen Hand. */
  phone?: number;
  /** Schlüsselbund in der vorderen Hand. */
  keys?: boolean;
  opacity?: number;
  /** Lichtkante (z. B. Lampe von oben): versetzte, hellere Kopie hinter der Figur. */
  rim?: {color: string; dx: number; dy: number; opacity?: number};
}

const seg = (x: number, y: number, angle: number, len: number): [number, number] => [
  x + Math.sin(rad(angle)) * len,
  y + Math.cos(rad(angle)) * len,
];

/** Gelenkpunkte einer Pose in Figur-Einheiten (Körpergröße 100, Füße bei y = 0). */
export const figureJoints = (pose: Pose) => {
  const {lean = 0, head = 0, armF = [4, 8], armB = [-4, 8], legF = [2, 2], legB = [-2, 2], drop = 0} = pose;
  const hip: [number, number] = [0, -50 + drop];
  const shoulder: [number, number] = [hip[0] + Math.sin(rad(lean)) * 31, hip[1] - Math.cos(rad(lean)) * 31];
  const neck: [number, number] = [shoulder[0] + Math.sin(rad(lean + head)) * 5, shoulder[1] - Math.cos(rad(lean + head)) * 5];
  const headC: [number, number] = [shoulder[0] + Math.sin(rad(lean + head)) * 13.5, shoulder[1] - Math.cos(rad(lean + head)) * 13.5];
  const limb = (origin: [number, number], [a, bend]: [number, number], l1: number, l2: number, bendSign: 1 | -1) => {
    const mid = seg(origin[0], origin[1], a, l1);
    const end = seg(mid[0], mid[1], a + bendSign * bend, l2);
    return {mid, end, d: `M${origin[0]} ${origin[1]} L${mid[0]} ${mid[1]} L${end[0]} ${end[1]}`};
  };
  return {
    hip,
    shoulder,
    neck,
    headC,
    headAngle: lean + head,
    aF: limb(shoulder, armF, 16, 15, 1),
    aB: limb(shoulder, armB, 16, 15, 1),
    lF: limb(hip, legF, 25, 25, -1),
    lB: limb(hip, legB, 25, 25, -1),
  };
};

/** Position der vorderen Hand in Szenen-Koordinaten (für Licht, Requisiten). */
export const handPosition = (p: Pick<FigureProps, 'x' | 'y' | 'height' | 'facing' | 'pose'>): [number, number] => {
  const s = p.height / 100;
  const {aF} = figureJoints(p.pose ?? {});
  return [p.x + (p.facing ?? 1) * s * aF.end[0], p.y + s * aF.end[1]];
};

const common = {fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

const FigureBody: React.FC<{pose: Pose; color: string; backColor: string; hat: FigureProps['hat']}> = ({pose, color, backColor, hat}) => {
  const {hip, shoulder, neck, headC, headAngle, aF, aB, lF, lB} = figureJoints(pose);
  return (
    <>
      {/* hinten */}
      <path d={aB.d} stroke={backColor} strokeWidth={5.4} {...common} />
      <path d={lB.d} stroke={backColor} strokeWidth={7.4} {...common} />
      <path d={`M${lB.end[0]} ${lB.end[1]} l6.5 0`} stroke={backColor} strokeWidth={4.6} {...common} />
      {/* Rumpf (Jacke) */}
      <path d={`M${shoulder[0]} ${shoulder[1] + 1} L${hip[0]} ${hip[1] + 2}`} stroke={color} strokeWidth={17} {...common} />
      <path d={`M${shoulder[0]} ${shoulder[1] + 4} L${hip[0] + 0.5} ${hip[1] + 6}`} stroke={color} strokeWidth={15} {...common} />
      {/* vorderes Bein */}
      <path d={lF.d} stroke={color} strokeWidth={7.8} {...common} />
      <path d={`M${lF.end[0]} ${lF.end[1]} l6.8 0`} stroke={color} strokeWidth={4.8} {...common} />
      {/* Hals und Kopf */}
      <path d={`M${shoulder[0]} ${shoulder[1]} L${neck[0]} ${neck[1]}`} stroke={color} strokeWidth={6.4} {...common} />
      <ellipse cx={headC[0]} cy={headC[1]} rx={6.5} ry={7.6} fill={color} transform={`rotate(${headAngle} ${headC[0]} ${headC[1]})`} />
      {hat === 'beanie' ? (
        <path
          d={`M${headC[0] - 7} ${headC[1] - 1.5} c0 -11 14 -11 14 0 z`}
          fill={color}
          stroke={color}
          strokeWidth={1.6}
          transform={`rotate(${headAngle} ${headC[0]} ${headC[1]})`}
        />
      ) : null}
      {hat === 'bun' ? <circle cx={headC[0] - 6.4} cy={headC[1] - 6} r={3.6} fill={color} /> : null}
      {hat === 'long' ? (
        <path d={`M${headC[0] - 2} ${headC[1] - 8} c-9 0 -9 10 -8 22 l6 0 c-1 -8 2 -14 2 -22z`} fill={color} />
      ) : null}
      {/* vorderer Arm */}
      <path d={aF.d} stroke={color} strokeWidth={5.8} {...common} />
    </>
  );
};

/** Stilisierte Figur aus wenigen Gliedern (Seitenansicht). */
export const Figure: React.FC<FigureProps> = ({
  x,
  y,
  height,
  facing = 1,
  pose = {},
  color = '#0a0f16',
  backColor = '#070b10',
  hat = 'none',
  phone = 0,
  keys = false,
  opacity = 1,
  rim,
}) => {
  const s = height / 100;
  const {aF} = figureJoints(pose);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`} opacity={opacity}>
      {rim ? (
        <g transform={`translate(${rim.dx * facing} ${rim.dy})`} opacity={rim.opacity ?? 0.6}>
          <FigureBody pose={pose} color={rim.color} backColor={rim.color} hat={hat} />
        </g>
      ) : null}
      <FigureBody pose={pose} color={color} backColor={backColor} hat={hat} />
      {phone > 0 ? (
        <g transform={`translate(${aF.end[0]} ${aF.end[1]})`}>
          <rect x={-1.5} y={-7.6} width={3} height={9} rx={0.8} fill="#0a0d11" transform="rotate(16)" />
          <rect x={-1.5} y={-7.6} width={1.1} height={9} rx={0.5} fill="#dcecff" opacity={phone} transform="rotate(16)" />
        </g>
      ) : null}
      {keys ? <circle cx={aF.end[0] + 1} cy={aF.end[1] + 2.4} r={1.5} fill="none" stroke="#b9c2cc" strokeWidth={0.6} /> : null}
    </g>
  );
};

/** Gehbewegung: liefert die Pose zu einer Schrittphase (2π = ein Doppelschritt). */
export const walkPose = (phase: number, stride = 0.78): Pose => {
  const sw = Math.sin(phase);
  const knee = (p: number) => 5 + 34 * clamp(Math.sin(p - 2.1));
  return {
    lean: 4,
    legF: [27 * stride * sw, knee(phase) * stride],
    legB: [-27 * stride * sw, knee(phase + Math.PI) * stride],
    armF: [-22 * stride * sw, 16],
    armB: [22 * stride * sw, 16],
    drop: 1.3 * Math.abs(Math.sin(phase)),
  };
};

/** Mischt zwei Posen. */
export const mixPose = (a: Pose, b: Pose, t: number): Pose => {
  const pair = (p: [number, number] | undefined, q: [number, number] | undefined, d: [number, number]): [number, number] => {
    const pp = p ?? d;
    const qq = q ?? d;
    return [lerp(pp[0], qq[0], t), lerp(pp[1], qq[1], t)];
  };
  return {
    lean: lerp(a.lean ?? 0, b.lean ?? 0, t),
    head: lerp(a.head ?? 0, b.head ?? 0, t),
    drop: lerp(a.drop ?? 0, b.drop ?? 0, t),
    armF: pair(a.armF, b.armF, [4, 8]),
    armB: pair(a.armB, b.armB, [-4, 8]),
    legF: pair(a.legF, b.legF, [2, 2]),
    legB: pair(a.legB, b.legB, [-2, 2]),
  };
};

export const standPose: Pose = {lean: 1, armF: [5, 10], armB: [-5, 10], legF: [3, 2], legB: [-4, 2]};

// ───────────────────────── Atmosphäre ─────────────────────────

/** Feiner Nieselregen. */
export const Drizzle: React.FC<{frame: number; count?: number; opacity?: number; seed?: string}> = ({
  frame,
  count = 90,
  opacity = 0.16,
  seed = 'r',
}) => (
  <g stroke="#b8c8d8" strokeWidth={1.2} strokeLinecap="round" opacity={opacity}>
    {Array.from({length: count}, (_, i) => {
      const speed = 26 + 16 * rnd(`${seed}s${i}`);
      const x0 = rnd(`${seed}x${i}`) * 2200 - 140;
      const y = ((rnd(`${seed}y${i}`) * 1300 + frame * speed) % 1300) - 110;
      const x = x0 - y * 0.12;
      const len = 14 + 14 * rnd(`${seed}l${i}`);
      return <line key={i} x1={x} y1={y} x2={x - len * 0.12} y2={y + len} />;
    })}
  </g>
);

/** Bodennebel: weiche, langsam treibende Schwaden. */
export const Fog: React.FC<{frame: number; y: number; color?: string; opacity?: number; id: string}> = ({
  frame,
  y,
  color = '#9db4c8',
  opacity = 0.1,
  id,
}) => (
  <>
    <defs>
      <radialGradient id={`fog-${id}`}>
        <stop offset="0" stopColor={color} stopOpacity={1} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    {[0, 1, 2, 3].map((i) => {
      const drift = ((frame * (0.5 + i * 0.22) + i * 620) % 2800) - 500;
      return (
        <ellipse
          key={i}
          cx={drift}
          cy={y + (i % 2) * 34 - 12}
          rx={520 + i * 80}
          ry={46 + i * 9}
          fill={`url(#fog-${id})`}
          opacity={opacity}
        />
      );
    })}
  </>
);

/** Atemwolke in der Kälte. */
export const Breath: React.FC<{frame: number; x: number; y: number; period: number; offset: number; dir?: 1 | -1}> = ({
  frame,
  x,
  y,
  period,
  offset,
  dir = 1,
}) => {
  const t = (((frame + offset) % period) + period) % period;
  const p = clamp(t / 34);
  if (t > 34) return null;
  return (
    <ellipse
      cx={x + dir * (8 + 30 * p)}
      cy={y - 12 * p}
      rx={8 + 22 * p}
      ry={6 + 12 * p}
      fill="#c9d6e2"
      opacity={0.13 * (1 - p) * clamp(p * 5)}
    />
  );
};
