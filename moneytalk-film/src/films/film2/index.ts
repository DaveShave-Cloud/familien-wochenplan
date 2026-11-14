import type {FilmDef} from '../../engine/types';
import {nordwerk} from '../../world/nordwerk';
import {cutscenes} from './cutscenes';
import {script} from './script';
import {sound} from './sound';
import {timing} from './timing';

/** FILM 2 – „Gut, dass wir vorbereitet sind“ */
export const film2: FilmDef = {
  id: 'film2',
  title: 'Gut, dass wir vorbereitet sind',
  theme: 'dark',
  world: nordwerk,
  script,
  timing,
  cutscenes,
  sound,
};
