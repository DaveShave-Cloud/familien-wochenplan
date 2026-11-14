import React from 'react';
import {Composition} from 'remotion';
import {toFrame} from './engine/timeline';
import {Film1} from './films/film1/Film1';
import {film1} from './films/film1';

/**
 * Kompositionen:
 *  - Film1        vollständiger Film (Ersatzsequenzen gekennzeichnet)
 * Kennzeichnung abschalten: --props='{"showPlaceholderLabels":false}'
 * Film 2 wird hier später als zweite <Composition> eingetragen.
 */
export const Root: React.FC = () => {
  const {fps, width, height, duration} = film1.timing;
  return (
    <Composition
      id="Film1"
      component={Film1}
      durationInFrames={toFrame(duration, fps)}
      fps={fps}
      width={width}
      height={height}
      defaultProps={{showPlaceholderLabels: true}}
    />
  );
};
