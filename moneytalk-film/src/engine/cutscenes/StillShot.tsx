import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {UI_FONT} from '../fonts';
import {Grain} from '../stage/Grain';
import type {StillPart} from '../types';
import {Drizzle} from './placeholders/kit';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Zwischensequenz aus Standbildern: jedes Bild bekommt eine langsame Kamerafahrt,
 * dazu feines Korn, Vignette und auf Wunsch Regen oder Staub im Licht.
 * So wirkt ein einzelnes Bild wie eine ruhige Filmeinstellung.
 */
export const StillShot: React.FC<{parts: StillPart[]; duration: number}> = ({parts, duration}) => {
  const frame = useCurrentFrame();

  // Welches Teilbild ist gerade dran?
  const total = parts.reduce((sum, p) => sum + (p.share ?? 1), 0);
  let start = 0;
  let active = parts[0];
  let length = duration;
  for (let i = 0; i < parts.length; i++) {
    const len = i === parts.length - 1 ? duration - start : Math.round((duration * (parts[i].share ?? 1)) / total);
    if (frame < start + len || i === parts.length - 1) {
      active = parts[i];
      length = len;
      break;
    }
    start += len;
  }
  const t = Math.max(0, Math.min(1, (frame - start) / Math.max(1, length - 1)));
  const from = active.from ?? [1.04, 50, 50];
  const to = active.to ?? [1.13, 50, 46];
  const zoom = lerp(from[0], to[0], t);
  const x = lerp(from[1], to[1], t);
  const y = lerp(from[2], to[2], t);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: `${x}% ${y}%`, transform: `scale(${zoom})`}}>
        <Img src={staticFile(active.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {(active.texts ?? []).map((tx, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${tx.x}%`,
              top: `${tx.y}%`,
              transform: `translate(${tx.align === 'left' ? '0' : '-50%'}, -50%) rotate(${tx.rotate ?? 0}deg)`,
              fontFamily: UI_FONT,
              fontSize: tx.size,
              fontWeight: tx.weight ?? 700,
              letterSpacing: tx.spacing ?? 0,
              color: tx.color ?? '#1a2028',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {tx.text}
          </div>
        ))}
      </AbsoluteFill>

      {active.effect === 'regen' ? (
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <Drizzle frame={frame} count={80} opacity={0.14} seed="still" />
        </svg>
      ) : null}
      {active.effect === 'staub' ? (
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 26}, (_, i) => {
            const px = random(`sx${i}`) * 1920 + 16 * Math.sin(frame / 60 + i);
            const py = ((random(`sy${i}`) * 1080 + frame * (0.25 + 0.35 * random(`sv${i}`))) % 1120) - 20;
            return <circle key={i} cx={px} cy={py} r={1.8} fill="#fff4dc" opacity={0.14 + 0.2 * random(`so${i}`)} />;
          })}
        </svg>
      ) : null}

      <Grain frame={frame} opacity={0.3} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 56%, rgba(0,0,0,0.42) 100%)'}} />
    </AbsoluteFill>
  );
};
