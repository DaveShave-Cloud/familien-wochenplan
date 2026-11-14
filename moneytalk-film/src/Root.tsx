import React from 'react';
import {Composition} from 'remotion';
import {toFrame} from './engine/timeline';
import {Film1} from './films/film1/Film1';
import {film1} from './films/film1';
import {Film2} from './films/film2/Film2';
import {film2} from './films/film2';

/**
 * Kompositionen:
 *  - Film1  „Plötzlich steht alles still“
 *  - Film2  „Gut, dass wir vorbereitet sind“
 * Kennzeichnung der Ersatzsequenzen abschalten: --props='{"showPlaceholderLabels":false}'
 */
export const Root: React.FC = () => (
  <>
    <Composition
      id="Film1"
      component={Film1}
      durationInFrames={toFrame(film1.timing.duration, film1.timing.fps)}
      fps={film1.timing.fps}
      width={film1.timing.width}
      height={film1.timing.height}
      defaultProps={{showPlaceholderLabels: true}}
    />
    <Composition
      id="Film2"
      component={Film2}
      durationInFrames={toFrame(film2.timing.duration, film2.timing.fps)}
      fps={film2.timing.fps}
      width={film2.timing.width}
      height={film2.timing.height}
      defaultProps={{showPlaceholderLabels: true}}
    />
  </>
);
