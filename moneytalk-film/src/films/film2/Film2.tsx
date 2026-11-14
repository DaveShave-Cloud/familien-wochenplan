import React from 'react';
import {Film, type FilmProps} from '../../engine/Film';
import {film2} from './index';

/** FILM 2 – „Gut, dass wir vorbereitet sind“ */
export const Film2: React.FC<FilmProps> = (props) => <Film film={film2} {...props} />;
