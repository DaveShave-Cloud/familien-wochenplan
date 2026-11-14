import type {
  ChatShotDef,
  CutsceneShotDef,
  FilmDef,
  MessageCue,
  ScriptMessage,
  ShotDef,
  Timecode,
} from './types';

/** "1:27.5" → 87.5 Sekunden. Zahlen werden unverändert übernommen. */
export const seconds = (tc: Timecode): number => {
  if (typeof tc === 'number') return tc;
  const parts = tc.split(':').map(Number);
  if (parts.some((p) => Number.isNaN(p))) {
    throw new Error(`Ungültige Zeitangabe: "${tc}"`);
  }
  return parts.reduce((acc, p) => acc * 60 + p, 0);
};

export const toFrame = (tc: Timecode, fps: number): number =>
  Math.round(seconds(tc) * fps);

export const formatTc = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
};

export interface CompiledShot<T extends ShotDef = ShotDef> {
  def: T;
  from: number;
  to: number;
  duration: number;
}

export interface CompiledCue {
  cue: MessageCue;
  msg: ScriptMessage;
  frame: number;
  /** Tippfenster in absoluten Frames [von, bis). */
  typing: [number, number][];
}

export interface CompiledFilm {
  def: FilmDef;
  fps: number;
  durationInFrames: number;
  shots: CompiledShot[];
  cues: CompiledCue[];
}

export const compileFilm = (def: FilmDef): CompiledFilm => {
  const {fps} = def.timing;
  const byId = new Map(def.script.messages.map((m) => [m.id, m]));

  const shots = def.timing.shots.map((s) => {
    const from = toFrame(s.from, fps);
    const to = toFrame(s.to, fps);
    return {def: s, from, to, duration: to - from};
  });

  const cues = def.timing.cues
    .map((cue): CompiledCue => {
      const msg = byId.get(cue.id);
      if (!msg) throw new Error(`Zeitplan verweist auf unbekannte Nachricht "${cue.id}"`);
      const at = seconds(cue.at);
      const windows: [number, number][] =
        cue.typing === undefined
          ? []
          : typeof cue.typing === 'number'
            ? [[cue.typing, 0]]
            : cue.typing;
      return {
        cue,
        msg,
        frame: Math.round(at * fps),
        typing: windows.map(([a, b]) => [
          Math.round((at - a) * fps),
          Math.round((at - b) * fps),
        ]),
      };
    })
    .sort((a, b) => a.frame - b.frame);

  return {
    def,
    fps,
    durationInFrames: toFrame(def.timing.duration, fps),
    shots,
    cues,
  };
};

export const isChatShot = (s: CompiledShot): s is CompiledShot<ChatShotDef> =>
  s.def.kind === 'chat';
export const isCutsceneShot = (s: CompiledShot): s is CompiledShot<CutsceneShotDef> =>
  s.def.kind === 'cutscene';

// ───────────────────────── Chatverlauf ─────────────────────────

export type FeedItem =
  | {type: 'day'; key: string; label: string; frame: number}
  | {type: 'notice'; key: string; text: string; frame: number}
  | {
      type: 'message';
      key: string;
      msg: ScriptMessage;
      /** Frame, an dem die Nachricht erscheint (-1 = von Anfang an da). */
      frame: number;
      outgoing: boolean;
      /** Erste Nachricht eines Absenderblocks (Name, Avatar, Sprechblasenspitze). */
      first: boolean;
      cue?: CompiledCue;
    };

/** Baut den Verlauf eines Chats aus Sicht eines Telefonbesitzers. */
export const buildFeed = (film: CompiledFilm, chatId: string, owner: string): FeedItem[] => {
  const chat = film.def.world.chats[chatId];
  const feed: FeedItem[] = [];
  if (chat.notice) {
    feed.push({type: 'notice', key: 'notice', text: chat.notice, frame: -1});
  }

  const entries: {msg: ScriptMessage; frame: number; cue?: CompiledCue}[] = [
    ...film.def.script.history.filter((m) => m.chat === chatId).map((msg) => ({msg, frame: -1})),
    ...film.cues.filter((c) => c.msg.chat === chatId).map((c) => ({msg: c.msg, frame: c.frame, cue: c})),
  ];

  const minutes = (clock: string) => {
    const [h, m] = clock.split(':').map(Number);
    return h * 60 + m;
  };
  let day: string | null = null;
  let prev: ScriptMessage | null = null;
  for (const e of entries) {
    if (e.msg.day !== day) {
      day = e.msg.day;
      prev = null;
      feed.push({type: 'day', key: `day-${day}`, label: day, frame: e.frame});
    }
    // Neuer Absenderblock bei anderem Absender – oder wenn dazwischen viel Zeit liegt
    // (dann zeigt die Blase Name und Bild erneut, damit das Publikum nicht raten muss).
    const first = !prev || prev.from !== e.msg.from || minutes(e.msg.clock) - minutes(prev.clock) > 10;
    feed.push({
      type: 'message',
      key: e.msg.id,
      msg: e.msg,
      frame: e.frame,
      outgoing: e.msg.from === owner,
      first,
      cue: e.cue,
    });
    prev = e.msg;
  }
  return feed;
};

/** Lineare Interpolation über Stützpunkte [x, y] (x aufsteigend). */
export const curveAt = (points: [number, number][], x: number): number => {
  if (points.length === 0) return 0;
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    if (x <= x1) {
      const [x0, y0] = points[i - 1];
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return points[points.length - 1][1];
};

/** Wortzahl ohne Emojis – Grundlage der Lesezeit-Prüfung. */
export const wordCount = (text: string): number =>
  text
    .replace(/[\p{Extended_Pictographic}️‍]/gu, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/** Mindest-Lesezeit in Sekunden für eine Nachricht auf der Leinwand. */
export const minReadSeconds = (text: string): number => 1.2 + 0.3 * wordCount(text);
