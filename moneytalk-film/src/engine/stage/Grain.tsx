import React from 'react';
import {Img, staticFile} from 'remotion';

const TILE = 512;

/**
 * Feines Filmkorn. Nimmt den dunklen Verläufen das Streifige (Banding nach der
 * Videokompression) und bindet gezeichnete und gefilmte Bilder zusammen.
 */
export const Grain: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 0.6}) => {
  // pro Frame versetzt, damit das Korn „lebt“
  const ox = (frame * 173) % TILE;
  const oy = (frame * 311) % TILE;
  const tiles: React.ReactNode[] = [];
  for (let y = -1; y < 3; y++) {
    for (let x = -1; x < 4; x++) {
      tiles.push(
        <Img
          key={`${x}-${y}`}
          src={staticFile('textures/grain.png')}
          style={{position: 'absolute', left: x * TILE + ox, top: y * TILE + oy, width: TILE, height: TILE}}
        />,
      );
    }
  }
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    >
      {tiles}
    </div>
  );
};
