import '@fontsource-variable/inter/index.css';
import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * Schriften der Oberfläche – beide liegen im Projekt (OFL-Lizenz), damit der Film
 * auf jedem Rechner identisch aussieht:
 *  - Inter (über @fontsource-variable/inter)
 *  - Noto Color Emoji als Bitmap-Schrift in public/fonts/. Die neuere Vektor-Variante
 *    (COLRv1) zeichnet Remotions Headless-Browser nicht – deshalb bewusst diese Datei.
 */
export const EMOJI_FONT = `'Film Emoji'`;
export const UI_FONT = `'Inter Variable', ${EMOJI_FONT}, system-ui, sans-serif`;

const cache = new Map<string, Promise<unknown>>();
let emojiFace: Promise<unknown> | null = null;

const loadEmojiFace = (): Promise<unknown> => {
  if (!emojiFace) {
    const face = new FontFace('Film Emoji', `url(${staticFile('fonts/NotoColorEmoji.ttf')})`);
    emojiFace = face.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  }
  return emojiFace;
};

const load = (sample: string): Promise<unknown> => {
  const hit = cache.get(sample);
  if (hit) return hit;
  const p = loadEmojiFace()
    .then(() =>
      Promise.all([
        document.fonts.load(`400 40px 'Inter Variable'`, sample),
        document.fonts.load(`600 40px 'Inter Variable'`, sample),
        document.fonts.load(`40px 'Film Emoji'`, sample),
      ]),
    )
    .then(() => document.fonts.ready);
  cache.set(sample, p);
  return p;
};

/**
 * Hält das Rendern an, bis alle Schriften für den übergebenen Beispieltext
 * (inklusive Emojis) geladen sind – sonst könnten erste Frames mit Ersatzschrift erscheinen.
 */
export const useFonts = (sample: string): void => {
  const [handle] = useState(() => delayRender('Schriften laden'));
  useEffect(() => {
    load(sample)
      .catch((err) => console.warn('Schrift konnte nicht geladen werden:', err))
      .then(() => continueRender(handle));
  }, [handle, sample]);
};

const EMOJI_RE =
  /(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)/gu;

/** Zerlegt Text in normale Abschnitte und Emoji-Abschnitte. */
export const splitEmoji = (text: string): {text: string; emoji: boolean}[] =>
  text
    .split(EMOJI_RE)
    .filter((part) => part.length > 0)
    .map((part) => ({text: part, emoji: /\p{Extended_Pictographic}/u.test(part)}));
