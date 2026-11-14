import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ChatScreen} from '../chat/ChatScreen';
import {M} from '../chat/metrics';
import type {ChatTheme} from '../theme';
import type {CompiledFilm, CompiledShot} from '../timeline';
import type {ChatShotDef} from '../types';
import {PHONE, PhoneStage} from './PhoneStage';

const SLIDE_FRAMES = 11;

/** Uhrzeit der Statusleiste: Beginn der Einstellung, danach die Zeit der jeweils letzten Nachricht. */
const clockAt = (film: CompiledFilm, shot: CompiledShot<ChatShotDef>, frame: number): string => {
  let clock = shot.def.clock;
  for (const c of film.cues) {
    if (c.frame >= shot.from && c.frame <= frame && c.msg.clock > clock) clock = c.msg.clock;
  }
  return clock;
};

/**
 * Eine Chat-Einstellung: Telefon in Nahaufnahme mit dem Chat zum jeweiligen Zeitpunkt.
 * `previous` wird nur für den seitlichen Wechsel zwischen zwei Chats gebraucht.
 */
export const ChatShot: React.FC<{
  film: CompiledFilm;
  shot: CompiledShot<ChatShotDef>;
  previous?: CompiledShot<ChatShotDef>;
  theme: ChatTheme;
}> = ({film, shot, previous, theme}) => {
  const local = useCurrentFrame();
  const frame = shot.from + local;
  const slide = shot.def.enter === 'slide' && previous ? Math.min(1, local / SLIDE_FRAMES) : 1;
  const eased = 1 - Math.pow(1 - slide, 3);

  return (
    <PhoneStage backdrop={shot.def.backdrop} frame={local} duration={shot.duration} screenBg={theme.screenBg}>
      {/* neuer Chat liegt unten, der vorherige schiebt sich nach rechts aus dem Bild (wie „Zurück“) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${(eased - 1) * M.screenW * 0.28}px)`,
          opacity: slide < 1 ? 0.35 + 0.65 * eased : 1,
        }}
      >
        <ChatScreen
          film={film}
          chatId={shot.def.chat}
          owner={shot.def.owner}
          frame={frame}
          clock={clockAt(film, shot, frame)}
          theme={theme}
          height={PHONE.screenH}
        />
      </div>
      {slide < 1 && previous ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${eased * M.screenW}px)`}}>
          <ChatScreen
            film={film}
            chatId={previous.def.chat}
            owner={previous.def.owner}
            frame={previous.to - 1}
            clock={clockAt(film, previous, previous.to - 1)}
            theme={theme}
            height={PHONE.screenH}
          />
        </div>
      ) : null}
    </PhoneStage>
  );
};
