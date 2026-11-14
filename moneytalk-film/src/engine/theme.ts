/**
 * Farbwelten der Chatoberfläche (angelehnt an einen bekannten Messenger,
 * ohne dessen Logo oder Originalgrafiken zu verwenden).
 *
 * Film 1 läuft im dunklen Modus. Für Film 2 („Gut, dass wir vorbereitet sind“)
 * steht der helle Modus bereit – derselbe Chat, sichtbar freundlicher.
 */
export interface ChatTheme {
  name: 'dark' | 'light';
  screenBg: string;
  wallpaperInk: string;
  headerBg: string;
  headerText: string;
  headerSub: string;
  accent: string;
  bubbleIn: string;
  bubbleOut: string;
  text: string;
  meta: string;
  metaOut: string;
  tickBlue: string;
  chipBg: string;
  chipText: string;
  noticeBg: string;
  noticeText: string;
  inputBarBg: string;
  fieldBg: string;
  fieldText: string;
  placeholder: string;
  icon: string;
  sendBg: string;
  sendIcon: string;
  statusText: string;
  typingDot: string;
  bubbleShadow: string;
}

export const darkTheme: ChatTheme = {
  name: 'dark',
  screenBg: '#0b141a',
  wallpaperInk: 'rgba(233, 237, 239, 0.045)',
  headerBg: '#1f2c34',
  headerText: '#e9edef',
  headerSub: '#9aa9b2',
  accent: '#21c063',
  bubbleIn: '#1f2c34',
  bubbleOut: '#005c4b',
  text: '#eef1f3',
  meta: 'rgba(233, 237, 239, 0.62)',
  metaOut: 'rgba(233, 237, 239, 0.68)',
  tickBlue: '#53bdeb',
  chipBg: '#182229',
  chipText: '#9aa9b2',
  noticeBg: '#182229',
  noticeText: '#e3c98a',
  inputBarBg: '#0b141a',
  fieldBg: '#1f2c34',
  fieldText: '#eef1f3',
  placeholder: '#8696a0',
  icon: '#8696a0',
  sendBg: '#21c063',
  sendIcon: '#0b141a',
  statusText: '#e9edef',
  typingDot: '#9aa9b2',
  bubbleShadow: '0 1px 1px rgba(0,0,0,0.35)',
};

export const lightTheme: ChatTheme = {
  name: 'light',
  screenBg: '#efe9e0',
  wallpaperInk: 'rgba(80, 70, 50, 0.07)',
  headerBg: '#ffffff',
  headerText: '#111b21',
  headerSub: '#667781',
  accent: '#1daa61',
  bubbleIn: '#ffffff',
  bubbleOut: '#d9fdd3',
  text: '#111b21',
  meta: 'rgba(17, 27, 33, 0.55)',
  metaOut: 'rgba(17, 27, 33, 0.55)',
  tickBlue: '#34b7f1',
  chipBg: '#ffffff',
  chipText: '#54656f',
  noticeBg: '#fff3c4',
  noticeText: '#54656f',
  inputBarBg: '#efe9e0',
  fieldBg: '#ffffff',
  fieldText: '#111b21',
  placeholder: '#8696a0',
  icon: '#54656f',
  sendBg: '#1daa61',
  sendIcon: '#ffffff',
  statusText: '#111b21',
  typingDot: '#8696a0',
  bubbleShadow: '0 1px 1px rgba(11,20,26,0.13)',
};

export const themes = {dark: darkTheme, light: lightTheme};
