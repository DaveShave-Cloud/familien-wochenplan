/**
 * Datenmodell der Film-Engine.
 *
 * Grundsatz: Inhalt (Texte), Zeitablauf, Medien und Ton liegen in getrennten
 * Dateien pro Film. Die Engine (dieser Ordner) kennt keinen konkreten Film und
 * wird für Film 2 unverändert wiederverwendet.
 */

/** Zeitangabe: Sekunden als Zahl oder "m:ss.s" als Text (z. B. "1:27.5"). */
export type Timecode = number | string;

// ───────────────────────── Welt (für beide Filme gleich) ─────────────────────────

export type AvatarSpec =
  | {
      type: 'portrait';
      bg: string;
      skin: string;
      hair: string;
      hairStyle: 'short' | 'sidepart' | 'long' | 'bob' | 'bun' | 'bald' | 'cap';
      shirt: string;
      beard?: string;
      glasses?: boolean;
    }
  | {type: 'lighthouse'}
  | {type: 'logo'}
  /** Echtes Foto aus public/, z. B. "avatars/markus.jpg". */
  | {type: 'photo'; src: string};

export interface CharacterDef {
  id: string;
  /** Anzeigename im Chat. */
  name: string;
  role: string;
  /** Namensfarbe in Gruppenchats (wie bei WhatsApp je Person verschieden). */
  nameColor: string;
  avatar: AvatarSpec;
}

export interface ChatDef {
  id: string;
  kind: 'group' | 'direct';
  /** Titel im Chatkopf (bei Direktchats: Kontaktname auf dem gezeigten Telefon). */
  title: string;
  /** Mitglieder (Charakter-IDs). */
  members: string[];
  avatar: AvatarSpec;
  /** Optionaler Systemhinweis ganz oben im Verlauf. */
  notice?: string;
  /** Zeile unter dem Titel bei Direktchats (z. B. „zuletzt online heute um 06:39“). */
  subtitle?: string;
}

export interface World {
  characters: Record<string, CharacterDef>;
  chats: Record<string, ChatDef>;
}

// ───────────────────────── Drehbuch (nur Texte) ─────────────────────────

export interface ScriptMessage {
  id: string;
  chat: string;
  from: string;
  text: string;
  /** Uhrzeit der Geschichte, wie sie in der Blase steht ("05:47"). */
  clock: string;
  /** Datumszeile im Chat ("Gestern", "Heute"). */
  day: string;
}

export interface FilmScript {
  /** Bereits vorhandener Verlauf beim ersten Öffnen des Chats. */
  history: ScriptMessage[];
  /** Die Nachrichten des Films in Drehbuch-Reihenfolge. */
  messages: ScriptMessage[];
}

// ───────────────────────── Zeitablauf ─────────────────────────

export type BackdropId = 'nacht' | 'morgen' | 'buero' | 'druck' | 'tag' | 'zuversicht';

export interface ChatShotDef {
  kind: 'chat';
  id: string;
  from: Timecode;
  to: Timecode;
  chat: string;
  /** Wessen Telefon wir sehen (bestimmt, welche Blasen „ausgehend“ sind). */
  owner: string;
  backdrop: BackdropId;
  /** Uhrzeit in der Statusleiste zu Beginn der Einstellung. */
  clock: string;
  /** Übergang am Anfang: harter Schnitt oder seitliches Hereinschieben. */
  enter?: 'cut' | 'slide';
}

export interface CutsceneShotDef {
  kind: 'cutscene';
  id: string;
  from: Timecode;
  to: Timecode;
  /** Verweis auf einen Eintrag in cutscenes.ts. */
  slot: string;
}

export interface BlackShotDef {
  kind: 'black';
  id: string;
  from: Timecode;
  to: Timecode;
}

export type ShotDef = ChatShotDef | CutsceneShotDef | BlackShotDef;

export interface MessageCue {
  /** ID der Nachricht aus script.ts. */
  id: string;
  /** Zeitpunkt, an dem die Nachricht im Chat erscheint. */
  at: Timecode;
  /**
   * Dauer der Tippphase vor `at` in Sekunden.
   * Eingehend: Tippanzeige („… schreibt“). Ausgehend: Text entsteht im Eingabefeld.
   * Mehrere Fenster möglich: [[4.2, 2.8], [1.6, 0]] = Sekunden vor `at` (von, bis).
   */
  typing?: number | [number, number][];
  /**
   * Nur ausgehend: Tippverlauf als Stützpunkte [Zeitanteil, Textanteil],
   * z. B. [[0,0],[0.3,0.4],[0.5,0.4],[1,1]] für ein Zögern in der Mitte.
   */
  compose?: [number, number][];
  /** Kein Nachrichtenton (z. B. weil die Nachricht außerhalb des Chats eintrifft). */
  silent?: boolean;
}

export interface FadeDef {
  from: Timecode;
  to: Timecode;
  /** 'out' = nach Schwarz, 'in' = aus Schwarz. */
  kind: 'out' | 'in';
}

export interface SuperDef {
  from: Timecode;
  to: Timecode;
  /** Einblendung über dem Bild (Ort/Zeit). Erste Zeile groß, weitere klein. */
  lines: string[];
}

export interface FilmTiming {
  fps: number;
  width: number;
  height: number;
  duration: Timecode;
  shots: ShotDef[];
  cues: MessageCue[];
  fades: FadeDef[];
  supers: SuperDef[];
}

// ───────────────────────── Medien (Zwischensequenzen) ─────────────────────────

export interface CutsceneSlot {
  id: string;
  /** Kurzname für Schnittplan und Kennzeichnung. */
  title: string;
  /** Was der Realfilm zeigen muss (Regieanweisung für den Dreh). */
  brief: string;
  /** Schlüssel der Ersatzsequenz (engine/cutscenes/placeholders). */
  placeholder: string;
  /**
   * Realfilm-Clip. Solange `null`, läuft die gekennzeichnete Ersatzsequenz.
   * Datei nach public/footage/ legen und hier eintragen.
   */
  clip: null | {
    /** Pfad relativ zu public/, z. B. "footage/S1-A.mp4". */
    src: string;
    /** Einstiegspunkt im Clip in Sekunden. */
    startAt?: number;
    /** Originalton des Clips verwenden (0–1). Standard: stumm. */
    volume?: number;
    /** Ersatz-Geräusche dieses Slots (sound.ts) trotzdem abspielen. */
    keepFoley?: boolean;
  };
}

// ───────────────────────── Ton ─────────────────────────

export interface MusicStem {
  id: string;
  /** Datei relativ zu public/. */
  file: string;
  /** Lautstärke-Stützpunkte [Zeit, Pegel 0–1], dazwischen linear. */
  curve: [Timecode, number][];
  /** Schleife (Standard) oder einmaliger Einsatz ab dem ersten Stützpunkt. */
  oneShot?: boolean;
}

export interface SfxCue {
  at: Timecode;
  file: string;
  volume?: number;
  /** Nur so viele Sekunden abspielen (Standard: ganze Datei). */
  duration?: number;
  /** Gehört zur Ersatzsequenz dieses Slots (entfällt, wenn Realfilm mit Ton kommt). */
  slot?: string;
}

export interface AmbienceSpan {
  from: Timecode;
  to: Timecode;
  file: string;
  volume: number;
  /** Ein-/Ausblendzeit in Sekunden. */
  fade?: number;
  slot?: string;
}

export interface FilmSound {
  chatTones: {
    incoming: string;
    outgoing: string;
    typing: string;
    incomingVolume: number;
    outgoingVolume: number;
    typingVolume: number;
  };
  music: MusicStem[];
  sfx: SfxCue[];
  ambience: AmbienceSpan[];
  /** Gesamtpegel der Musik (0–1), praktisch zum schnellen Abmischen. */
  musicMaster: number;
}

// ───────────────────────── Film ─────────────────────────

export interface FilmDef {
  id: string;
  title: string;
  theme: 'dark' | 'light';
  world: World;
  script: FilmScript;
  timing: FilmTiming;
  cutscenes: Record<string, CutsceneSlot>;
  sound: FilmSound;
}
