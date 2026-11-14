/**
 * Prüft den Zeitplan aller Filme:  npm run check
 *  - lückenlose Einstellungen, Gesamtlänge
 *  - jede Nachricht liegt in einer Chat-Einstellung, die ihren Chat zeigt
 *  - Lesezeit je Nachricht (bis die nächste erscheint bzw. bis zum Schnitt)
 *  - Verhältnis Chat / Filmszenen
 *  - wörtlicher Abgleich mit docs/<film>/drehbuch-referenz.txt, falls vorhanden
 * Einzelner Film:  npx tsx scripts/check-timing.ts film2
 */
import {existsSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileFilm, formatTc, isChatShot, isCutsceneShot, minReadSeconds, wordCount} from '../src/engine/timeline';
import type {FilmDef} from '../src/engine/types';
import {films} from '../src/films';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('--kurz') === false;

const checkFilm = (def: FilmDef): number => {
  const film = compileFilm(def);
  const {fps} = film;
  let problems = 0;
  const warn = (msg: string) => {
    problems++;
    console.log(`  ⚠  ${msg}`);
  };

  console.log(`\n══ ${def.id}: ${def.title} – ${formatTc(film.durationInFrames / fps)} (${film.durationInFrames} Frames, ${fps} fps) ══\n`);

  let cursor = 0;
  for (const s of film.shots) {
    if (s.from !== cursor) warn(`Lücke/Überschneidung vor ${s.def.id}: erwartet ${formatTc(cursor / fps)}, beginnt ${formatTc(s.from / fps)}`);
    if (s.duration <= 0) warn(`${s.def.id} hat keine Länge`);
    cursor = s.to;
  }
  if (cursor !== film.durationInFrames) warn(`Einstellungen enden bei ${formatTc(cursor / fps)}, Film bei ${formatTc(film.durationInFrames / fps)}`);

  for (const s of film.shots) {
    if (isCutsceneShot(s) && !def.cutscenes[s.def.slot]) warn(`${s.def.id}: unbekannter Slot ${s.def.slot}`);
  }
  const used = new Set(film.cues.map((c) => c.msg.id));
  for (const m of def.script.messages) {
    if (!used.has(m.id)) warn(`Nachricht ${m.id} steht im Drehbuch, aber nicht im Zeitplan`);
  }

  if (verbose) console.log('Zeit     Dauer  Soll   Wörter  Von      Nachricht');
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
    if (verbose || !ok) {
      console.log(
        `${formatTc(c.frame / fps).padEnd(8)} ${have.toFixed(1).padStart(4)}s  ${need.toFixed(1).padStart(4)}s  ${String(wordCount(c.msg.text)).padStart(4)}    ${c.msg.from.padEnd(8)} ${ok ? ' ' : '⚠ ZU KURZ '}${c.msg.text.slice(0, 58)}${c.msg.text.length > 58 ? '…' : ''}`,
      );
    }
    for (const [a] of c.typing) {
      if (shot && a < shot.from) warn(`${c.msg.id}: Tippphase beginnt vor der Einstellung ${shot.def.id}`);
    }
  }

  const sum = (pred: (s: (typeof film.shots)[number]) => boolean) => film.shots.filter(pred).reduce((a, s) => a + s.duration, 0) / fps;
  const chat = sum(isChatShot);
  const cut = sum(isCutsceneShot);
  const total = film.durationInFrames / fps;
  console.log(`\nChat ${chat.toFixed(1)} s (${((chat / total) * 100).toFixed(0)} %) · Filmszenen ${cut.toFixed(1)} s (${((cut / total) * 100).toFixed(0)} %) · Schwarz ${(total - chat - cut).toFixed(1)} s`);

  // Wörtlicher Abgleich mit dem beauftragten Dialog
  const refFile = join(root, 'docs', def.id, 'drehbuch-referenz.txt');
  if (existsSync(refFile)) {
    const ref = readFileSync(refFile, 'utf8').split('\n').filter(Boolean).map((l) => {
      const i = l.indexOf('|');
      return {from: l.slice(0, i), text: l.slice(i + 1)};
    });
    let bad = 0;
    if (film.cues.length !== ref.length) {
      bad++;
      console.log(`  ⚠  Anzahl weicht ab: Film ${film.cues.length}, Referenz ${ref.length}`);
    }
    ref.forEach((r, i) => {
      const c = film.cues[i];
      if (!c || c.msg.from !== r.from || c.msg.text.normalize('NFC') !== r.text.normalize('NFC')) {
        bad++;
        console.log(`  ⚠  Abweichung bei Nachricht ${i + 1}:\n     Referenz: ${r.from}: ${r.text}\n     Film:     ${c?.msg.from}: ${c?.msg.text}`);
      }
    });
    if (bad === 0) console.log(`✓ Alle ${ref.length} Nachrichten stimmen wörtlich und in der Reihenfolge mit der Referenz überein.`);
    problems += bad;
  }

  console.log(problems === 0 ? '✓ Zeitplan in Ordnung.' : `${problems} Hinweis(e) – bitte prüfen.`);
  return problems;
};

const only = process.argv.slice(2).find((a) => !a.startsWith('--'));
const list = Object.values(films).filter((f) => !only || f.id === only);
const total = list.reduce((sum, f) => sum + checkFilm(f), 0);
console.log('');
process.exit(total === 0 ? 0 : 1);
