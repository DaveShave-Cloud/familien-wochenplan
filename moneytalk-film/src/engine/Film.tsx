import React, {useMemo} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {SoundDesign} from './audio/SoundDesign';
import {CutsceneShot} from './cutscenes/CutsceneShot';
import {UI_FONT, useFonts} from './fonts';
import {ChatShot} from './stage/ChatShot';
import {themes} from './theme';
import {compileFilm, isChatShot, isCutsceneShot, toFrame, type CompiledFilm} from './timeline';
import type {FadeDef, FilmDef, SuperDef} from './types';

export type FilmProps = {
  /** Ersatzsequenzen sichtbar als solche kennzeichnen. */
  showPlaceholderLabels: boolean;
};

/**
 * Spielt einen kompletten Film aus seinen Daten ab (Drehbuch, Zeitplan, Medien, Ton).
 * Diese Komponente ist filmunabhängig – Film 2 übergibt einfach eine andere Definition.
 */
export const Film: React.FC<FilmProps & {film: FilmDef}> = ({film: def, showPlaceholderLabels}) => {
  const film = useMemo(() => compileFilm(def), [def]);
  const theme = themes[def.theme];

  // alle Texte des Films als Ladeprobe für die Schriften (inkl. Emojis)
  const sample = useMemo(
    () =>
      [...def.script.history, ...def.script.messages].map((m) => m.text).join(' ') +
      Object.values(def.world.chats).map((c) => `${c.title} ${c.notice ?? ''}`).join(' ') +
      ' ÄÖÜäöüß…·–„“’ 0123456789',
    [def],
  );
  useFonts(sample);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {film.shots.map((shot, i) => {
        if (isChatShot(shot)) {
          const prev = film.shots[i - 1];
          return (
            <Sequence key={shot.def.id} from={shot.from} durationInFrames={shot.duration} name={`Chat ${shot.def.id}`}>
              <ChatShot film={film} shot={shot} previous={prev && isChatShot(prev) ? prev : undefined} theme={theme} />
            </Sequence>
          );
        }
        if (isCutsceneShot(shot)) {
          const slot = def.cutscenes[shot.def.slot];
          return (
            <Sequence key={shot.def.id} from={shot.from} durationInFrames={shot.duration} name={`Film ${shot.def.id} ${slot.title}`}>
              <CutsceneShot slot={slot} duration={shot.duration} showLabel={showPlaceholderLabels} />
            </Sequence>
          );
        }
        return (
          <Sequence key={shot.def.id} from={shot.from} durationInFrames={shot.duration} name="Schwarz">
            <AbsoluteFill style={{backgroundColor: '#000'}} />
          </Sequence>
        );
      })}

      {def.timing.supers.map((s, i) => (
        <Super key={i} def={s} fps={film.fps} />
      ))}
      <Fades fades={def.timing.fades} film={film} />
      <SoundDesign film={film} />
    </AbsoluteFill>
  );
};

/** Orts- und Zeiteinblendung, ruhig ein- und ausgeblendet. */
const Super: React.FC<{def: SuperDef; fps: number}> = ({def, fps}) => {
  const frame = useCurrentFrame();
  const from = toFrame(def.from, fps);
  const to = toFrame(def.to, fps);
  if (frame < from || frame >= to) return null;
  const fade = fps * 0.6;
  const opacity = Math.min(1, (frame - from) / fade, (to - frame) / fade);
  const [headline, ...rest] = def.lines;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 118,
          bottom: 112,
          fontFamily: UI_FONT,
          color: '#f1f4f6',
          opacity,
          textShadow: '0 2px 18px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{width: 64, height: 4, background: '#f2a33a', marginBottom: 22}} />
        <div style={{fontSize: 66, fontWeight: 600, letterSpacing: 0.4, lineHeight: 1.1}}>{headline}</div>
        {rest.map((line) => (
          <div key={line} style={{fontSize: 33, fontWeight: 400, marginTop: 14, opacity: 0.86, letterSpacing: 0.3}}>
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Fades: React.FC<{fades: FadeDef[]; film: CompiledFilm}> = ({fades, film}) => {
  const frame = useCurrentFrame();
  let black = 0;
  for (const f of fades) {
    const from = toFrame(f.from, film.fps);
    const to = toFrame(f.to, film.fps);
    const t = Math.max(0, Math.min(1, (frame - from) / Math.max(1, to - from)));
    if (f.kind === 'in' && frame < to) black = Math.max(black, 1 - t);
    if (f.kind === 'out' && frame >= from) black = Math.max(black, t);
  }
  if (black <= 0) return null;
  return <AbsoluteFill style={{backgroundColor: '#000', opacity: black, pointerEvents: 'none'}} />;
};
