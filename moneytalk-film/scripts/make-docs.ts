/**
 * Erzeugt je Film Drehbuch, Schnittplan und Medienliste aus den Filmdaten:  npm run docs
 * So stimmen die Dokumente immer mit dem überein, was tatsächlich gerendert wird.
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileFilm, formatTc, isChatShot, isCutsceneShot} from '../src/engine/timeline';
import type {FilmDef} from '../src/engine/types';
import {films} from '../src/films';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const makeDocs = (def: FilmDef) => {
  const docs = join(root, 'docs', def.id);
  mkdirSync(docs, {recursive: true});

  const film = compileFilm(def);
  const {fps} = film;
  const nr = def.id.replace('film', 'Film ');
  const tc = (frame: number) => formatTc(frame / fps);
  const sec = (frames: number) => `${(frames / fps).toFixed(1).replace('.', ',')} s`;
  const name = (id: string) => def.world.characters[id].name;
  const note = `> Automatisch erzeugt mit \`npm run docs\` – nicht von Hand ändern. Quelle: \`src/films/${def.id}/\`.`;
  const shotOf = (frame: number, chat: string) =>
    film.shots.find((s) => isChatShot(s) && s.def.chat === chat && frame >= s.from && frame < s.to);

  // ───────────────────────── Drehbuch (Dialog) ─────────────────────────

  const book: string[] = [
    `# Drehbuch – ${nr} „${def.title}“`,
    '',
    note,
    '',
    'Alle Nachrichten in der Reihenfolge des Films. Texte ändern: `script.ts`. Zeitpunkte ändern: `timing.ts`.',
    '',
  ];
  if (def.script.history.length > 0) {
    book.push('**Vorgeschichte (steht zu Beginn schon im Chat):**', '');
    for (const m of def.script.history) {
      book.push(`- _${m.day} ${m.clock}_ · **${name(m.from)}:** ${m.text}`);
    }
    book.push('');
  }
  book.push('| Im Film | Uhrzeit | Chat | Wer | Nachricht |', '|---|---|---|---|---|');
  for (const c of film.cues) {
    const chat = def.world.chats[c.msg.chat];
    book.push(`| ${tc(c.frame)} | ${c.msg.clock} | ${chat.kind === 'group' ? 'Gruppe' : 'privat'} | ${name(c.msg.from)} | ${c.msg.text} |`);
  }
  book.push('');
  writeFileSync(join(docs, 'DREHBUCH.md'), book.join('\n'));

  // ───────────────────────── Schnittplan ─────────────────────────

  const lines: string[] = [
    `# Schnittplan – ${nr} „${def.title}“`,
    '',
    note,
    '',
    `Länge ${tc(film.durationInFrames)} · ${def.timing.width}×${def.timing.height} · ${fps} fps · ${film.durationInFrames} Frames`,
    '',
    '| Nr. | Zeit | Dauer | Bild | Inhalt |',
    '|---|---|---|---|---|',
  ];

  film.shots.forEach((shot, i) => {
    let kind = 'Schwarz';
    let content = 'Schwarzbild. Kein Abspann.';
    if (isCutsceneShot(shot)) {
      const slot = def.cutscenes[shot.def.slot];
      kind = `Film ${shot.def.slot}`;
      content = `**${slot.title}** – ${slot.brief}${slot.clip ? ` _(Realfilm: ${slot.clip.src})_` : ' _(Ersatzsequenz)_'}`;
    } else if (isChatShot(shot)) {
      const chat = def.world.chats[shot.def.chat];
      kind = `Chat „${chat.title}“`;
      const cues = film.cues.filter((c) => c.msg.chat === shot.def.chat && c.frame >= shot.from && c.frame < shot.to);
      // Nachrichten, die außerhalb einer Chat-Einstellung eingetroffen sind und hier erstmals zu sehen sind
      const carried = film.cues.filter(
        (c) =>
          c.msg.chat === shot.def.chat &&
          c.frame < shot.from &&
          !shotOf(c.frame, c.msg.chat) &&
          film.shots.find((s) => isChatShot(s) && s.def.chat === c.msg.chat && s.from >= c.frame) === shot,
      );
      content = [...carried, ...cues]
        .map((c) => `${c.frame < shot.from ? '(liegt bereits vor)' : tc(c.frame)} **${name(c.msg.from)}:** „${c.msg.text}“`)
        .join('<br>');
    }
    lines.push(`| ${i + 1} | ${tc(shot.from)}–${tc(shot.to)} | ${sec(shot.duration)} | ${kind} | ${content} |`);
  });

  const total = (pred: (s: (typeof film.shots)[number]) => boolean) => film.shots.filter(pred).reduce((a, s) => a + s.duration, 0);
  const chatF = total(isChatShot);
  const cutF = total(isCutsceneShot);
  lines.push(
    '',
    `**Verhältnis:** Chat ${sec(chatF)} (${Math.round((chatF / film.durationInFrames) * 100)} %) · Filmszenen ${sec(cutF)} (${Math.round((cutF / film.durationInFrames) * 100)} %) · Schwarz ${sec(film.durationInFrames - chatF - cutF)}`,
    '',
    '## Einblendungen und Blenden',
    '',
    ...def.timing.supers.map((s) => `- ${s.from}–${s.to}: Einblendung „${s.lines.join(' / ')}“`),
    ...def.timing.fades.map((f) => `- ${f.from}–${f.to}: ${f.kind === 'in' ? 'Aufblende aus Schwarz' : 'Schwarzblende'}`),
    '',
    '## Musikverlauf',
    '',
    ...def.sound.music.map((m) => `- **${m.id}** (${m.file}): ${m.curve.map(([t, v]) => `${t} → ${Math.round(v * 100)} %`).join(' · ')}`),
    '',
  );
  writeFileSync(join(docs, 'SCHNITTPLAN.md'), lines.join('\n'));

  // ───────────────────────── Medienliste ─────────────────────────

  const allNull = Object.values(def.cutscenes).every((s) => !s.clip);
  const media: string[] = [
    `# Medienliste – ${nr} „${def.title}“`,
    '',
    note,
    '',
    '## 1. Zwischensequenzen (Realfilm wird noch benötigt)',
    '',
    allNull
      ? 'Für keine der Filmszenen liegt bisher Realfilm vor. Jede Szene läuft als **gezeichnete, gekennzeichnete Ersatzsequenz**.'
      : 'Slots ohne Realfilm laufen als **gezeichnete, gekennzeichnete Ersatzsequenz**.',
    'Technische Vorgabe für Zulieferung: MP4 (H.264), 1920×1080, 25 oder 30 fps, mindestens so lang wie angegeben, gern mit 1–2 s „Fleisch“ davor und danach.',
    `Einsetzen: Datei nach \`public/footage/\` legen und in \`src/films/${def.id}/cutscenes.ts\` beim Slot \`clip: {src: 'footage/DATEI.mp4'}\` eintragen.`,
    '',
    '| Slot | Im Film | Länge | Motiv | Was gedreht werden muss | Status |',
    '|---|---|---|---|---|---|',
  ];
  for (const shot of film.shots) {
    if (!isCutsceneShot(shot)) continue;
    const slot = def.cutscenes[shot.def.slot];
    // Motive, die es schon in Film 1 gibt, brauchen keinen zweiten Dreh
    const shared = def.id !== 'film1' && Object.values(films.film1.cutscenes).some((s) => s.placeholder === slot.placeholder);
    media.push(
      `| ${shot.def.slot} | ${tc(shot.from)}–${tc(shot.to)} | ${sec(shot.duration)} | ${slot.title} | ${slot.brief}${shared ? ' **Derselbe Clip wie in Film 1.**' : ''} | ${slot.clip ? `Realfilm: \`${slot.clip.src}\`` : 'Ersatzsequenz'} |`,
    );
  }
  media.push(
    '',
    'Hinweise für den Dreh: Beide Filme spielen am selben Tag an denselben Schauplätzen mit denselben Darstellern – am besten gemeinsam drehen. Kein lesbarer Fremdtext, keine fremden Marken im Bild.',
    '',
    '## 2. Profilbilder',
    '',
    'Derzeit gezeichnete Platzhalter. Benötigt: quadratisches Foto je Figur (mind. 400×400 px, Gesicht mittig), abgelegt in `public/avatars/`, eingetragen in `src/world/nordwerk.ts` (gilt für beide Filme).',
    '',
    '| Figur | Rolle | Im Chat sichtbar | Status |',
    '|---|---|---|---|',
    ...Object.values(def.world.characters).map(
      (c) => `| ${c.name} | ${c.role} | ${c.id === 'sven' ? 'nein (sein Telefon)' : 'ja'} | ${c.avatar.type === 'photo' ? `Foto: \`${c.avatar.src}\`` : 'Platzhalter (gezeichnet)'} |`,
    ),
    '',
    '## 3. Ton',
    '',
    'Sämtliche Töne werden von `scripts/generate-audio.mjs` rechnerisch erzeugt – keine Fremdaufnahmen, keine Lizenzen, keine externen Dienste.',
    'Die Nachrichtentöne sind eigene Klänge, die wie ein typischer Messenger wirken; Originaltöne von WhatsApp sind geschützt und wurden nicht verwendet.',
    '',
    '| Datei | Verwendung |',
    '|---|---|',
    `| ${def.sound.chatTones.incoming} | eingehende Nachricht |`,
    `| ${def.sound.chatTones.outgoing} | gesendete Nachricht |`,
    `| ${def.sound.chatTones.typing} | Tippen im Eingabefeld |`,
    ...def.sound.music.map((m) => `| ${m.file} | Musikspur „${m.id}“ |`),
    ...[...new Set(def.sound.ambience.map((a) => a.file))].map((f) => `| ${f} | Atmosphäre der Ersatzsequenzen |`),
    ...[...new Set(def.sound.sfx.map((s) => s.file))].map((f) => `| ${f} | Geräusch einer Ersatzsequenz |`),
    '',
    'Sobald ein Realfilm-Clip mit eigenem Ton eingetragen ist (`volume` > 0), entfallen die Ersatz-Geräusche dieses Slots automatisch.',
    '',
    '## 4. Schriften',
    '',
    '- **Inter** (Oberfläche) – SIL Open Font License, über das Paket `@fontsource-variable/inter`.',
    '- **Noto Color Emoji** (Emojis) – SIL Open Font License, Datei `public/fonts/NotoColorEmoji.ttf`.',
    '',
  );
  writeFileSync(join(docs, 'MEDIENLISTE.md'), media.join('\n'));

  console.log(`docs/${def.id}/: DREHBUCH.md, SCHNITTPLAN.md, MEDIENLISTE.md`);
};

Object.values(films).forEach(makeDocs);
