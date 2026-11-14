/**
 * Vergleicht die Nachrichten in script.ts Zeichen für Zeichen mit einer Referenzliste
 * (eine Zeile je Nachricht: "absender|Text") und prüft die Reihenfolge im Zeitplan.
 *   npx tsx scripts/check-script.ts pfad/zur/referenz.txt
 */
import {readFileSync} from 'node:fs';
import {compileFilm} from '../src/engine/timeline';
import {film1} from '../src/films/film1';

const ref = readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean).map((l) => {
  const i = l.indexOf('|');
  return {from: l.slice(0, i), text: l.slice(i + 1)};
});
const film = compileFilm(film1);
const shown = film.cues.map((c) => ({from: c.msg.from, text: c.msg.text}));
let bad = 0;
if (shown.length !== ref.length) {
  bad++;
  console.log(`Anzahl weicht ab: Film ${shown.length}, Referenz ${ref.length}`);
}
ref.forEach((r, i) => {
  const s = shown[i];
  if (!s || s.from !== r.from || s.text.normalize('NFC') !== r.text.normalize('NFC')) {
    bad++;
    console.log(`Abweichung bei Nachricht ${i + 1}:\n  Referenz: ${r.from}: ${r.text}\n  Film:     ${s?.from}: ${s?.text}`);
  }
});
console.log(bad === 0 ? `✓ Alle ${ref.length} Nachrichten stimmen wörtlich und in der Reihenfolge mit der Referenz überein.` : `${bad} Abweichung(en).`);
process.exit(bad === 0 ? 0 : 1);
