/**
 * Prüft den Zeitplan eines Films:  npm run check
 *  - lückenlose Einstellungen, Gesamtlänge
 *  - jede Nachricht liegt in einer Chat-Einstellung, die ihren Chat zeigt
 *  - Lesezeit je Nachricht (bis die nächste erscheint bzw. bis zum Schnitt)
 *  - Verhältnis Chat / Filmszenen
 */
import {compileFilm, formatTc, isChatShot, isCutsceneShot, minReadSeconds, wordCount} from '../src/engine/timeline';
import {film1} from '../src/films/film1';

const film = compileFilm(film1);
const {fps} = film;
let problems = 0;
const warn = (msg: string) => {
  problems++;
  console.log(`  ⚠  ${msg}`);
};

console.log(`\n${film.def.title} – ${formatTc(film.durationInFrames / fps)} (${film.durationInFrames} Frames, ${fps} fps)\n`);

// Einstellungen lückenlos?
let cursor = 0;
for (const s of film.shots) {
  if (s.from !== cursor) warn(`Lücke/Überschneidung vor ${s.def.id}: erwartet ${formatTc(cursor / fps)}, beginnt ${formatTc(s.from / fps)}`);
  if (s.duration <= 0) warn(`${s.def.id} hat keine Länge`);
  cursor = s.to;
}
if (cursor !== film.durationInFrames) warn(`Einstellungen enden bei ${formatTc(cursor / fps)}, Film bei ${formatTc(film.durationInFrames / fps)}`);

// Slots vorhanden?
for (const s of film.shots) {
  if (isCutsceneShot(s) && !film.def.cutscenes[s.def.slot]) warn(`${s.def.id}: unbekannter Slot ${s.def.slot}`);
}

// Lesezeiten
console.log('Zeit     Dauer  Soll   Wörter  Von      Nachricht');
for (const c of film.cues) {
  const shot = film.shots.find((s) => isChatShot(s) && s.def.chat === c.msg.chat && c.frame >= s.from && c.frame < s.to);
  // Nachricht trifft außerhalb des Chats ein (z. B. in einer Filmszene) → zählt ab der nächsten Einstellung, die den Chat zeigt
  const showing = shot ?? film.shots.find((s) => isChatShot(s) && s.def.chat === c.msg.chat && s.from >= c.frame);
  if (!showing || !isChatShot(showing)) {
    warn(`${c.msg.id}: wird in keiner Chat-Einstellung gezeigt`);
    continue;
  }
  const visibleFrom = Math.max(c.frame, showing.from);
  const next = film.cues.find((n) => n.msg.chat === c.msg.chat && n.frame > c.frame && n.frame < showing.to);
  const until = next ? next.frame : showing.to;
  const outgoing = c.msg.from === showing.def.owner;
  // Ausgehende Nachrichten liest man schon im Eingabefeld mit: halbe Tippzeit zählt als Lesezeit
  const composeBonus = outgoing ? c.typing.reduce((sum, [a, b]) => sum + (b - a), 0) / 2 : 0;
  const have = (until - visibleFrom + composeBonus) / fps;
  const need = minReadSeconds(c.msg.text);
  const ok = have + 1e-6 >= need;
  if (!ok) problems++;
  console.log(
    `${formatTc(c.frame / fps).padEnd(8)} ${have.toFixed(1).padStart(4)}s  ${need.toFixed(1).padStart(4)}s  ${String(wordCount(c.msg.text)).padStart(4)}    ${c.msg.from.padEnd(8)} ${ok ? ' ' : '⚠ ZU KURZ '}${c.msg.text.slice(0, 58)}${c.msg.text.length > 58 ? '…' : ''}`,
  );
  for (const [a] of c.typing) {
    if (shot && a < shot.from) warn(`${c.msg.id}: Tippphase beginnt vor der Einstellung ${shot.def.id}`);
  }
}

// Verhältnis
const sum = (pred: (s: (typeof film.shots)[number]) => boolean) => film.shots.filter(pred).reduce((a, s) => a + s.duration, 0) / fps;
const chat = sum(isChatShot);
const cut = sum(isCutsceneShot);
const total = film.durationInFrames / fps;
console.log(`\nChat ${chat.toFixed(1)} s (${((chat / total) * 100).toFixed(0)} %) · Filmszenen ${cut.toFixed(1)} s (${((cut / total) * 100).toFixed(0)} %) · Schwarz ${(total - chat - cut).toFixed(1)} s`);
console.log(problems === 0 ? '\n✓ Zeitplan in Ordnung.\n' : `\n${problems} Hinweis(e) – bitte prüfen.\n`);
process.exit(problems === 0 ? 0 : 1);
