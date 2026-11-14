import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {UI_FONT} from '../fonts';
import {Grain} from '../stage/Grain';
import type {CutsceneSlot} from '../types';
import {TextTafel, placeholders} from './placeholders';
import {StillShot} from './StillShot';

/**
 * Eine Zwischensequenz. Ist für den Slot ein Realfilm-Clip eingetragen, läuft dieser
 * (bildfüllend, leicht angeglichen). Sonst läuft die gezeichnete Ersatzsequenz –
 * auf Wunsch mit sichtbarer Kennzeichnung.
 */
export const CutsceneShot: React.FC<{slot: CutsceneSlot; duration: number; showLabel: boolean}> = ({
  slot,
  duration,
  showLabel,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (slot.clip) {
    return (
      <AbsoluteFill style={{backgroundColor: '#000'}}>
        <Video
          src={staticFile(slot.clip.src)}
          trimBefore={Math.round((slot.clip.startAt ?? 0) * fps)}
          volume={slot.clip.volume ?? 0}
          muted={(slot.clip.volume ?? 0) === 0}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
        {/* gleicher Look wie die Chat-Einstellungen: leichte Vignette, feines Korn */}
        <Grain frame={frame} opacity={0.35} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
      </AbsoluteFill>
    );
  }

  if (slot.stills && slot.stills.length > 0) {
    return <StillShot parts={slot.stills} duration={duration} />;
  }

  const Placeholder = placeholders[slot.placeholder];
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {Placeholder ? <Placeholder frame={frame} duration={duration} fps={fps} /> : <TextTafel slot={slot} />}
      {showLabel ? <PlaceholderLabel slot={slot} /> : null}
    </AbsoluteFill>
  );
};

/** Kennzeichnung der Ersatzsequenz (abschaltbar über `showPlaceholderLabels`). */
const PlaceholderLabel: React.FC<{slot: CutsceneSlot}> = ({slot}) => (
  <div
    style={{
      position: 'absolute',
      left: 44,
      top: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: UI_FONT,
      color: '#f4f6f8',
      background: 'rgba(8, 12, 16, 0.72)',
      border: '2px solid rgba(242, 163, 58, 0.9)',
      borderRadius: 12,
      padding: '12px 20px',
    }}
  >
    <div style={{fontSize: 24, fontWeight: 700, letterSpacing: 2.4, color: '#f2a33a'}}>ERSATZSEQUENZ</div>
    <div style={{fontSize: 24, fontWeight: 500, opacity: 0.92}}>
      {slot.id} · {slot.title} – Realfilm folgt
    </div>
  </div>
);
