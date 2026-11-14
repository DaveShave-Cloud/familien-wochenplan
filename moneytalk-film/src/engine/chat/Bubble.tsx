import React from 'react';
import {EMOJI_FONT, splitEmoji} from '../fonts';
import type {ChatTheme} from '../theme';
import type {AvatarSpec} from '../types';
import {Avatar} from './Avatar';
import {LockIcon, Ticks} from './icons';
import {M} from './metrics';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/**
 * Zeile, deren Höhe von 0 auf ihre natürliche Höhe aufgeht (ohne Messen):
 * dadurch schiebt jede neue Nachricht den Verlauf weich nach oben – wie echtes Scrollen.
 */
export const GrowRow: React.FC<{open: number; children: React.ReactNode}> = ({open, children}) => (
  <div style={{display: 'grid', gridTemplateRows: `${clamp01(open)}fr`, flexShrink: 0}}>
    <div style={{minHeight: 0, overflow: open < 1 ? 'hidden' : 'visible'}}>{children}</div>
  </div>
);

/** Text mit Emojis in Emoji-Schrift und leicht vergrößert. */
export const RichText: React.FC<{text: string}> = ({text}) => (
  <>
    {splitEmoji(text).map((run, i) =>
      run.emoji ? (
        <span key={i} style={{fontFamily: EMOJI_FONT, fontSize: '1.1em', lineHeight: 1}}>
          {run.text}
        </span>
      ) : (
        <React.Fragment key={i}>{run.text}</React.Fragment>
      ),
    )}
  </>
);

const Tail: React.FC<{side: 'left' | 'right'; color: string}> = ({side, color}) => (
  <svg
    width={16}
    height={22}
    viewBox="0 0 16 22"
    style={{
      position: 'absolute',
      top: 0,
      [side]: -14,
      transform: side === 'right' ? 'scaleX(-1)' : undefined,
    }}
  >
    <path d="M16 0H3.2C1 0 0.2 2 1.6 3.6L16 21z" fill={color} />
  </svg>
);

export interface MessageBubbleProps {
  theme: ChatTheme;
  text: string;
  clock: string;
  outgoing: boolean;
  /** Erste Nachricht eines Absenderblocks. */
  first: boolean;
  group: boolean;
  senderName?: string;
  senderColor?: string;
  avatar?: AvatarSpec;
  /** 0 → 1: Einblendung der Blase. */
  appear: number;
  /** Zugestellt (zwei Haken) statt nur gesendet. */
  delivered: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  theme,
  text,
  clock,
  outgoing,
  first,
  group,
  senderName,
  senderColor,
  avatar,
  appear,
  delivered,
}) => {
  const showAvatarColumn = group && !outgoing;
  const metaWidth = outgoing ? 122 : 78;
  const a = easeOut(appear);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: outgoing ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
        padding: `${first ? M.gapBlock : M.gapSame}px ${M.sidePad}px 0`,
      }}
    >
      {showAvatarColumn ? (
        <div style={{width: M.avatar, marginRight: M.avatarGap, flexShrink: 0, opacity: a}}>
          {first && avatar ? <Avatar spec={avatar} size={M.avatar} /> : null}
        </div>
      ) : null}

      <div
        style={{
          position: 'relative',
          maxWidth: group ? M.bubbleMaxGroup : M.bubbleMaxDirect,
          background: outgoing ? theme.bubbleOut : theme.bubbleIn,
          borderRadius: M.radius,
          borderTopLeftRadius: !outgoing && first ? 0 : M.radius,
          borderTopRightRadius: outgoing && first ? 0 : M.radius,
          padding: `${M.bubblePadTop}px ${M.bubblePadX}px ${M.bubblePadBottom}px`,
          boxShadow: theme.bubbleShadow,
          opacity: a,
          transformOrigin: outgoing ? '100% 100%' : '0% 100%',
          transform: `translateY(${(1 - a) * 18}px) scale(${0.9 + 0.1 * a})`,
        }}
      >
        {first ? <Tail side={outgoing ? 'right' : 'left'} color={outgoing ? theme.bubbleOut : theme.bubbleIn} /> : null}

        {group && !outgoing && first && senderName ? (
          <div
            style={{
              fontSize: M.nameSize,
              lineHeight: `${M.nameSize + 10}px`,
              fontWeight: 600,
              color: senderColor,
              letterSpacing: 0.1,
            }}
          >
            {senderName}
          </div>
        ) : null}

        <div
          style={{
            fontSize: M.fontSize,
            lineHeight: `${M.lineHeight}px`,
            color: theme.text,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
          }}
        >
          <RichText text={text} />
          {/* Platzhalter, damit die Uhrzeit rechts unten nie über dem Text liegt */}
          <span style={{display: 'inline-block', width: metaWidth, height: 1}} />
        </div>

        <div
          style={{
            position: 'absolute',
            right: M.bubblePadX - 6,
            bottom: 9,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: M.metaSize,
            lineHeight: 1,
            color: outgoing ? theme.metaOut : theme.meta,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {clock}
          {outgoing ? <Ticks size={22} color={theme.metaOut} double={delivered} /> : null}
        </div>
      </div>
    </div>
  );
};

/** Tippanzeige: drei wandernde Punkte in einer Blase. */
export const TypingBubble: React.FC<{
  theme: ChatTheme;
  frame: number;
  group: boolean;
  avatar?: AvatarSpec;
  appear: number;
}> = ({theme, frame, group, avatar, appear}) => {
  const a = easeOut(appear);
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', padding: `${M.gapBlock}px ${M.sidePad}px 0`}}>
      {group ? (
        <div style={{width: M.avatar, marginRight: M.avatarGap, flexShrink: 0, opacity: a}}>
          {avatar ? <Avatar spec={avatar} size={M.avatar} /> : null}
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          background: theme.bubbleIn,
          borderRadius: M.radius,
          borderTopLeftRadius: 0,
          padding: '25px 28px',
          display: 'flex',
          gap: 11,
          boxShadow: theme.bubbleShadow,
          opacity: a,
          transformOrigin: '0% 100%',
          transform: `scale(${0.85 + 0.15 * a})`,
        }}
      >
        <Tail side="left" color={theme.bubbleIn} />
        {[0, 1, 2].map((i) => {
          // Welle: jeder Punkt hebt sich kurz, versetzt um 0,16 s
          const phase = ((frame - i * 5) % 36) / 36;
          const lift = phase >= 0 && phase < 0.4 ? Math.sin((phase / 0.4) * Math.PI) : 0;
          return (
            <div
              key={i}
              style={{
                width: 17,
                height: 17,
                borderRadius: '50%',
                background: theme.typingDot,
                opacity: 0.55 + 0.45 * lift,
                transform: `translateY(${-8 * lift}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const DayChip: React.FC<{theme: ChatTheme; label: string}> = ({theme, label}) => (
  <div style={{display: 'flex', justifyContent: 'center', paddingTop: 20, paddingBottom: 2}}>
    <div
      style={{
        background: theme.chipBg,
        color: theme.chipText,
        fontSize: 25,
        fontWeight: 500,
        lineHeight: 1,
        padding: '11px 22px',
        borderRadius: 14,
        boxShadow: theme.bubbleShadow,
      }}
    >
      {label}
    </div>
  </div>
);

export const SystemNotice: React.FC<{theme: ChatTheme; text: string}> = ({theme, text}) => (
  <div style={{display: 'flex', justifyContent: 'center', padding: `22px ${M.sidePad + 40}px 4px`}}>
    <div
      style={{
        background: theme.noticeBg,
        color: theme.noticeText,
        fontSize: 23,
        lineHeight: '31px',
        textAlign: 'center',
        padding: '12px 22px',
        borderRadius: 16,
        boxShadow: theme.bubbleShadow,
      }}
    >
      <LockIcon size={19} color={theme.noticeText} style={{display: 'inline-block', verticalAlign: '-2px', marginRight: 8}} />
      {text}
    </div>
  </div>
);
