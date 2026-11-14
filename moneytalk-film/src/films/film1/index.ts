import type {FilmDef} from '../../engine/types';
import {nordwerk} from '../../world/nordwerk';
import {cutscenes} from './cutscenes';
import {script} from './script';
import {sound} from './sound';
import {timing} from './timing';

/** FILM 1 – „Plötzlich steht alles still“ */
export const film1: FilmDef = {
  id: 'film1',
  title: 'Plötzlich steht alles still',
  theme: 'dark',
  world: nordwerk,
  script,
  timing,
  cutscenes,
  sound,
};
