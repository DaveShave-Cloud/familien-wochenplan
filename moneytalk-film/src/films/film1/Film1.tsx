import React from 'react';
import {Film, type FilmProps} from '../../engine/Film';
import {film1} from './index';

/** FILM 1 – „Plötzlich steht alles still“ */
export const Film1: React.FC<FilmProps> = (props) => <Film film={film1} {...props} />;
