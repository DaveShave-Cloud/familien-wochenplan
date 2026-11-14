import {Audio} from '@remotion/media';
import React, {useMemo} from 'react';
import {Sequence, staticFile, useCurrentFrame} from 'remotion';
import {curveAt, isChatShot, seconds, toFrame, type CompiledFilm} from '../timeline';
import type {AmbienceSpan, MusicStem} from '../types';

/**
 * Gesamte Tonspur eines Films, vollständig aus den Daten abgeleitet:
 *  - Nachrichtentöne und Tippgeräusche folgen automatisch den Nachrichten in timing.ts
 *  - Musikspuren werden nach den Kurven in sound.ts gemischt
 *  - Geräusche/Atmosphären der Ersatzsequenzen entfallen, sobald ein Realfilm-Clip
 *    mit eigenem Ton eingetragen ist
 */
export const SoundDesign: React.FC<{film: CompiledFilm}> = ({film}) => {
  const {fps, def} = film;
  const {sound} = def;

  const plan = useMemo(() => {
    const tones: {frame: number; file: string; volume: number; key: string}[] = [];
    const typing: {from: number; duration: number; offset: number; key: string}[] = [];

    film.cues.forEach((c, index) => {
      // Welche Einstellung zeigt diese Nachricht? Nur dann ist sie zu hören.
      const shot = film.shots.find((s) => isChatShot(s) && s.def.chat === c.msg.chat && c.frame >= s.from && c.frame < s.to);
      if (!shot || !isChatShot(shot)) return;
      const outgoing = c.msg.from === shot.def.owner;

      if (!c.cue.silent) {
        tones.push({
          frame: c.frame,
          file: outgoing ? sound.chatTones.outgoing : sound.chatTones.incoming,
          volume: outgoing ? sound.chatTones.outgoingVolume : sound.chatTones.incomingVolume,
          key: `tone-${c.msg.id}`,
        });
      }

      // Tastaturgeräusch nur, während auf dem gezeigten Telefon wirklich getippt wird
      if (outgoing) {
        const points = c.cue.compose ?? [[0, 0], [1, 1]];
        for (const [a, b] of c.typing) {
          const len = Math.max(1, b - a - 7);
          for (let i = 1; i < points.length; i++) {
            if (points[i][1] <= points[i - 1][1]) continue; // Zögern = Stille
            const from = Math.round(a + points[i - 1][0] * len);
            const to = Math.round(a + points[i][0] * len);
            if (to - from < 3) continue;
            typing.push({from, duration: to - from, offset: (index * 47 + i * 31) % 150, key: `type-${c.msg.id}-${i}`});
          }
        }
      }
    });
    return {tones, typing};
  }, [film, sound]);

  /** Geräusche einer Ersatzsequenz entfallen, wenn dort ein Realfilm mit Ton liegt. */
  const foleyActive = (slotPrefix?: string): boolean => {
    if (!slotPrefix) return true;
    return !Object.entries(def.cutscenes).some(
      ([key, s]) => key.startsWith(slotPrefix) && s.clip && (s.clip.volume ?? 0) > 0 && !s.clip.keepFoley,
    );
  };

  return (
    <>
      {sound.music.map((stem) => (
        <Stem key={stem.id} stem={stem} fps={fps} master={sound.musicMaster} total={film.durationInFrames} />
      ))}

      {sound.ambience.filter((a) => foleyActive(a.slot)).map((a, i) => (
        <Ambience key={`amb-${i}`} span={a} fps={fps} />
      ))}

      {sound.sfx.filter((s) => foleyActive(s.slot)).map((s, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={toFrame(s.at, fps)}
          durationInFrames={s.duration ? Math.max(1, Math.round(s.duration * fps)) : undefined}
          layout="none"
          name={`Geräusch ${s.file}`}
        >
          <Audio src={staticFile(s.file)} volume={s.volume ?? 1} />
        </Sequence>
      ))}

      {plan.typing.map((t) => (
        <Sequence key={t.key} from={t.from} durationInFrames={t.duration} layout="none" name="Tippen">
          <Audio src={staticFile(sound.chatTones.typing)} trimBefore={t.offset} volume={sound.chatTones.typingVolume} />
        </Sequence>
      ))}

      {plan.tones.map((t) => (
        <Sequence key={t.key} from={t.frame} durationInFrames={fps} layout="none" name="Nachrichtenton">
          <Audio src={staticFile(t.file)} volume={t.volume} />
        </Sequence>
      ))}
    </>
  );
};

/**
 * Eine Musikspur mit Lautstärkekurve.
 * Schleifen laufen ab Filmbeginn durch (stumm, solange die Kurve 0 ist) – so bleiben
 * alle Spuren im gemeinsamen Takt, egal wann sie hörbar werden.
 */
const Stem: React.FC<{stem: MusicStem; fps: number; master: number; total: number}> = ({stem, fps, master, total}) => {
  const points = useMemo(
    () => stem.curve.map(([t, v]) => [seconds(t) * fps, v] as [number, number]),
    [stem, fps],
  );
  const first = stem.oneShot ? Math.max(0, Math.floor(points[0][0])) : 0;
  const last = Math.min(total, Math.ceil(points[points.length - 1][0]) + 1);
  return (
    <Sequence from={first} durationInFrames={Math.max(1, last - first)} layout="none" name={`Musik ${stem.id}`}>
      <StemAudio stem={stem} points={points} offset={first} master={master} />
    </Sequence>
  );
};

const StemAudio: React.FC<{stem: MusicStem; points: [number, number][]; offset: number; master: number}> = ({
  stem,
  points,
  offset,
  master,
}) => {
  const frame = useCurrentFrame() + offset;
  // vor dem ersten und nach dem letzten Stützpunkt ist die Spur stumm
  const inRange = frame >= points[0][0] && frame <= points[points.length - 1][0];
  const volume = inRange ? Math.max(0, curveAt(points, frame)) * master : 0;
  return <Audio src={staticFile(stem.file)} loop={!stem.oneShot} volume={volume} />;
};

const Ambience: React.FC<{span: AmbienceSpan; fps: number}> = ({span, fps}) => {
  const from = toFrame(span.from, fps);
  const duration = toFrame(span.to, fps) - from;
  return (
    <Sequence from={from} durationInFrames={duration} layout="none" name={`Atmo ${span.file}`}>
      <AmbienceAudio span={span} duration={duration} fps={fps} />
    </Sequence>
  );
};

const AmbienceAudio: React.FC<{span: AmbienceSpan; duration: number; fps: number}> = ({span, duration, fps}) => {
  const frame = useCurrentFrame();
  const fade = Math.max(1, (span.fade ?? 0.3) * fps);
  const env = Math.min(1, frame / fade, (duration - frame) / fade);
  return <Audio src={staticFile(span.file)} loop volume={span.volume * Math.max(0, env)} />;
};
