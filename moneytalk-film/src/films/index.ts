import type {FilmDef} from '../engine/types';
import {film1} from './film1';
import {film2} from './film2';

/** Alle Filme des Projekts. Skripte (check, docs, render) arbeiten über diese Liste. */
export const films: Record<string, FilmDef> = {film1, film2};
