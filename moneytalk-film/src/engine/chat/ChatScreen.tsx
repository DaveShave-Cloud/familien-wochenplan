import React, {useMemo} from 'react';
import {UI_FONT} from '../fonts';
import type {ChatTheme} from '../theme';
import {buildFeed, curveAt, type CompiledFilm, type FeedItem} from '../timeline';
import {Avatar} from './Avatar';
import {DayChip, GrowRow, MessageBubble, RichText, SystemNotice, TypingBubble, easeOut} from './Bubble';
import {BackIcon, CallIcon, CameraIcon, ClipIcon, EmojiIcon, MenuIcon, MicIcon, SendIcon, StatusIcons, VideoIcon} from './icons';
import {M} from './metrics';
import {Wallpaper} from './Wallpaper';

const graphemes = (text: string): string[] =>
  Array.from(new Intl.Segmenter('de', {granularity: 'grapheme'}).segment(text), (s) => s.segment);

/** Frames, die eine Blase zum Aufgehen braucht. */
const APPEAR_FRAMES = 8;
/** Nach so vielen Frames wird aus „gesendet“ (ein Haken) „zugestellt“ (zwei Haken). */
const DELIVERED_AFTER = 20;

export interface ChatScreenProps {
  film: CompiledFilm;
  chatId: string;
  /** Wessen Telefon wir sehen. */
  owner: string;
  /** Absoluter Film-Frame. */
  frame: number;
  /** Uhrzeit in der Statusleiste. */
  clock: string;
  theme: ChatTheme;
  /** Höhe des sichtbaren Bildschirmbereichs. */
  height: number;
}

/**
 * Ein kompletter Chatbildschirm (Statusleiste, Kopf, Verlauf, Eingabeleiste)
 * zu einem bestimmten Film-Frame. Rein datengetrieben – kennt keinen konkreten Film.
 */
export const ChatScreen: React.FC<ChatScreenProps> = ({film, chatId, owner, frame, clock, theme, height}) => {
  const {world} = film.def;
  const chat = world.chats[chatId];
  const group = chat.kind === 'group';
  const feed = useMemo(() => buildFeed(film, chatId, owner), [film, chatId, owner]);

  // ── Wer tippt gerade? ──
  const typists: {who: string; since: number}[] = [];
  let compose: {text: string; done: boolean} | null = null;
  for (const item of feed) {
    if (item.type !== 'message' || !item.cue) continue;
    for (const [a, b] of item.cue.typing) {
      if (frame < a || frame >= b) continue;
      if (item.outgoing) {
        const chars = graphemes(item.msg.text);
        // die letzten Frames steht der fertige Text, dann wird gesendet
        const t = Math.min(1, (frame - a) / Math.max(1, b - a - 7));
        const share = curveAt(item.cue.cue.compose ?? [[0, 0], [1, 1]], t);
        const n = Math.round(share * chars.length);
        compose = {text: chars.slice(0, n).join(''), done: n >= chars.length};
      } else {
        typists.push({who: item.msg.from, since: a});
      }
    }
  }

  const visible = feed.filter((item) => item.frame <= frame);

  // ── Kopfzeile ──
  const memberLine = group
    ? [...chat.members.filter((m) => m !== owner).map((m) => world.characters[m].name), 'Du'].join(', ')
    : (chat.subtitle ?? 'online');
  const typingLine =
    typists.length > 0
      ? group
        ? `${world.characters[typists[0].who].name} schreibt …`
        : 'schreibt …'
      : null;

  return (
    <div
      style={{
        width: M.screenW,
        height,
        display: 'flex',
        flexDirection: 'column',
        background: theme.screenBg,
        fontFamily: UI_FONT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Statusleiste */}
      <div
        style={{
          height: M.statusH,
          flexShrink: 0,
          background: theme.headerBg,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 34px 6px 38px',
          color: theme.statusText,
          fontSize: 29,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          position: 'relative',
        }}
      >
        <span>{clock}</span>
        <div style={{position: 'absolute', left: '50%', top: 16, width: 26, height: 26, marginLeft: -13, borderRadius: '50%', background: '#05080a'}} />
        <StatusIcons color={theme.statusText} height={30} />
      </div>

      {/* Chatkopf */}
      <div
        style={{
          height: M.headerH,
          flexShrink: 0,
          background: theme.headerBg,
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px 0 14px',
          gap: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
          zIndex: 2,
        }}
      >
        <BackIcon size={46} color={theme.headerText} />
        <Avatar spec={chat.avatar} size={84} />
        <div style={{flex: 1, minWidth: 0, marginLeft: 6}}>
          <div
            style={{
              color: theme.headerText,
              fontSize: 37,
              fontWeight: 600,
              lineHeight: '46px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {chat.title}
          </div>
          <div
            style={{
              color: typingLine ? theme.accent : theme.headerSub,
              fontSize: 27,
              fontWeight: typingLine ? 500 : 400,
              lineHeight: '36px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {typingLine ?? memberLine}
          </div>
        </div>
        <VideoIcon size={46} color={theme.headerText} />
        <CallIcon size={40} color={theme.headerText} style={{marginLeft: 22}} />
        <MenuIcon size={42} color={theme.headerText} style={{marginLeft: 12}} />
      </div>

      {/* Verlauf – am unteren Rand verankert, Älteres wandert nach oben aus dem Bild */}
      <div style={{flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden'}}>
        <Wallpaper theme={theme} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 16,
          }}
        >
          {visible.map((item) => (
            <FeedRow key={item.key} item={item} frame={frame} theme={theme} film={film} group={group} />
          ))}
          {typists.map((t) => (
            <GrowRow key={`typing-${t.who}`} open={easeOut((frame - t.since + 1) / 5)}>
              <TypingBubble
                theme={theme}
                frame={frame - t.since}
                group={group}
                avatar={world.characters[t.who].avatar}
                appear={(frame - t.since + 1) / 5}
              />
            </GrowRow>
          ))}
        </div>
      </div>

      {/* Eingabeleiste */}
      <InputBar theme={theme} compose={compose} frame={frame} />
    </div>
  );
};

const FeedRow: React.FC<{item: FeedItem; frame: number; theme: ChatTheme; film: CompiledFilm; group: boolean}> = ({
  item,
  frame,
  theme,
  film,
  group,
}) => {
  const age = item.frame < 0 ? Infinity : frame - item.frame;
  const progress = Math.min(1, (age + 1) / APPEAR_FRAMES);

  if (item.type === 'day') {
    return (
      <GrowRow open={easeOut(progress)}>
        <DayChip theme={theme} label={item.label} />
      </GrowRow>
    );
  }
  if (item.type === 'notice') {
    return <SystemNotice theme={theme} text={item.text} />;
  }

  const sender = film.def.world.characters[item.msg.from];
  // Eingehende Nachricht löst die Tippblase ab: Zeile startet bereits teilweise geöffnet.
  const hadTyping = !item.outgoing && (item.cue?.typing.length ?? 0) > 0;
  const open = hadTyping ? 0.45 + 0.55 * easeOut(progress) : easeOut(progress);

  return (
    <GrowRow open={open}>
      <MessageBubble
        theme={theme}
        text={item.msg.text}
        clock={item.msg.clock}
        outgoing={item.outgoing}
        first={item.first}
        group={group}
        senderName={sender.name}
        senderColor={sender.nameColor}
        avatar={sender.avatar}
        appear={progress}
        delivered={age >= DELIVERED_AFTER}
      />
    </GrowRow>
  );
};

const InputBar: React.FC<{theme: ChatTheme; compose: {text: string; done: boolean} | null; frame: number}> = ({
  theme,
  compose,
  frame,
}) => {
  const typing = compose !== null;
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  return (
    <div
      style={{
        flexShrink: 0,
        background: theme.inputBarBg,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
        padding: '8px 12px 14px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: M.inputFieldMinH,
          background: theme.fieldBg,
          borderRadius: 44,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 24px 0 22px',
          gap: 16,
        }}
      >
        <div style={{height: M.inputFieldMinH, display: 'flex', alignItems: 'center'}}>
          <EmojiIcon size={46} color={theme.icon} />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: M.inputFont,
            lineHeight: `${M.inputLine}px`,
            padding: `${(M.inputFieldMinH - M.inputLine) / 2}px 0`,
            color: typing ? theme.fieldText : theme.placeholder,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
          }}
        >
          {typing ? (
            <>
              <RichText text={compose.text} />
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
                  height: M.inputFont,
                  marginLeft: 2,
                  verticalAlign: '-6px',
                  background: theme.accent,
                  opacity: compose.done ? (caretOn ? 1 : 0) : 1,
                }}
              />
            </>
          ) : (
            'Nachricht'
          )}
        </div>
        <div style={{height: M.inputFieldMinH, display: 'flex', alignItems: 'center', gap: 22}}>
          <ClipIcon size={44} color={theme.icon} />
          {typing ? null : <CameraIcon size={44} color={theme.icon} />}
        </div>
      </div>
      <div
        style={{
          width: M.inputFieldMinH,
          height: M.inputFieldMinH,
          borderRadius: '50%',
          background: theme.sendBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {typing ? <SendIcon size={44} color={theme.sendIcon} style={{marginLeft: 6}} /> : <MicIcon size={46} color={theme.sendIcon} />}
      </div>
    </div>
  );
};
