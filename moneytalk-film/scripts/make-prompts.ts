/**
 * Erzeugt docs/BILDVORLAGEN.md: fertige Bildbeschreibungen (Prompts) für einen Bildgenerator,
 * damit die gezeichneten Ersatzsequenzen durch Standbilder im 3D-Trickfilmstil ersetzt werden können.
 *   npx tsx scripts/make-prompts.ts
 *
 * Die Prompts sind englisch (darauf sind die meisten Bildgeneratoren trainiert); die Erklärungen deutsch.
 * Figuren ändern → FIGUREN. Stil ändern → STIL. Danach Skript neu ausführen.
 */
import {writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileFilm, formatTc, isCutsceneShot} from '../src/engine/timeline';
import {films} from '../src/films';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ───────────────────────── Stil ─────────────────────────

const STIL =
  'Stylized 3D animated feature-film look: appealing cartoon characters with slightly enlarged heads, large expressive eyes, soft skin shading and detailed hair and fabric textures. Realistic materials and environments, cinematic lighting, shallow depth of field. Plain clothing without any logos. No text, no letters, no signs, no watermark.';

const KALT = 'Mood: tense and cold. Muted blue-grey colours, low light.';
const WARM = 'Mood: calm and confident. Warm morning sunlight, soft golden tones.';
const ORT = 'Setting: a mid-sized mechanical engineering company in the flat coastal landscape of northern Germany.';

// ───────────────────────── Figuren (in jedem Bild wortgleich verwenden) ─────────────────────────

const FIGUREN = {
  markus:
    'MARKUS, a sturdy production worker in his mid-40s with a short dark-brown beard, wearing a dark navy beanie and a dark navy work jacket',
  svenAussen:
    'SVEN, the plant manager, about 40, short brown hair with a side parting, clean-shaven, wearing a dark blue quilted jacket over a light-blue shirt',
  sven: 'SVEN, the plant manager, about 40, short brown hair with a side parting, clean-shaven, wearing a light-blue shirt with rolled-up sleeves',
  katja:
    'KATJA, the accountant, about 50, dark-brown chin-length bob haircut, glasses, wearing a cream-coloured blouse and a grey cardigan',
  julia: 'JULIA, a sales representative in her early 30s, auburn hair tied up in a bun, wearing a navy blazer over a white top',
  tobias: 'TOBIAS, an IT administrator, about 30, short black hair, glasses, wearing a dark grey hoodie',
  anna: 'ANNA, about 48, shoulder-length dark-blond hair, wearing a teal knitted sweater',
  thomas: 'THOMAS, a managing director, about 55, short grey hair, wearing a white shirt',
};

// ───────────────────────── Szenen ─────────────────────────

interface Vorlage {
  datei: string;
  slot: string;
  titel: string;
  /** Was zu sehen sein soll (deutsch, zur Orientierung). */
  bild: string;
  prompt: string;
  hinweis?: string;
  test?: boolean;
}

const F = FIGUREN;
const szenen: Vorlage[] = [
  {
    datei: 'S1-A.jpg',
    slot: 'S1-A',
    titel: 'Parkplatz vor der Firma',
    bild: 'Totale vor Sonnenaufgang: Halle mit Bürotrakt, fast leerer nasser Parkplatz, ein Auto mit Licht unter einer Laterne.',
    prompt: `Wide establishing shot before dawn, a quarter to six in the morning, light drizzle. A modern grey industrial hall with a low office wing, all windows dark. In front of it a large, almost empty, wet asphalt car park; a single estate car has just arrived and stands with its headlights on in the pool of light of one street lamp. A dike and a few wind turbines with small red warning lights on the horizon, dark blue sky with the first hint of dawn. No people visible. ${ORT} ${KALT}`,
  },
  {
    datei: 'S1-B-1.jpg',
    slot: 'S1-B',
    titel: 'Markus geht zur Tür',
    bild: 'Markus geht im Nieselregen auf die gläserne Eingangstür zu; innen ist alles dunkel.',
    prompt: `Before dawn, drizzle. ${F.markus}, walks towards the glass entrance door of an industrial company building, seen from the side in a medium-wide shot with space around him. A single lamp under the entrance canopy lights the door; inside the building everything is dark. Wet pavement reflects the light. ${KALT}`,
  },
  {
    datei: 'S1-B-2.jpg',
    slot: 'S1-B',
    titel: 'Markus zieht an der verschlossenen Tür',
    bild: 'Markus zieht kräftig am Griff der Glastür, lehnt sich zurück – sie bleibt zu. Ratlos, leicht verärgert.',
    prompt: `Before dawn. ${F.markus}, pulls hard at the handle of a locked glass double door of a company building, leaning back slightly, with a puzzled and slightly annoyed expression. Medium shot from the side. Lamp light from the canopy above, dark interior behind the glass, wet pavement. ${KALT}`,
    test: true,
  },
  {
    datei: 'S1-C.jpg',
    slot: 'S1-C',
    titel: 'Markus schaut aufs Smartphone',
    bild: 'Nah: Markus blickt auf sein Smartphone, das Display beleuchtet sein Gesicht von unten. Atem in der kalten Luft.',
    prompt: `Before dawn in front of a dark company entrance. Close medium shot of ${F.markus}, looking down at the smartphone in his hand; the glowing screen lights his worried face from below. His breath is visible in the cold air. Blurred dark entrance and one warm lamp in the background. ${KALT}`,
  },
  {
    datei: 'S2-A.jpg',
    slot: 'S2-A',
    titel: 'Acht Mitarbeiter warten',
    bild: 'Acht Leute in Jacken warten frierend vor dem verschlossenen Eingang; eine Frau telefoniert, Markus schaut aufs Handy.',
    prompt: `Before dawn, cold. Eight employees in work jackets and winter coats wait in a loose group in front of the locked glass entrance of an industrial company building, hands in their pockets, breath visible in the cold air. One woman holds a phone to her ear. In the middle stands ${F.markus}, looking at his smartphone. Medium-wide shot, lamp light from the entrance canopy, wet pavement. ${KALT}`,
  },
  {
    datei: 'S2-B-1.jpg',
    slot: 'S2-B',
    titel: 'Sven schließt auf',
    bild: 'Sven steckt den Schlüssel ins Schloss der Glastür; hinter ihm warten erleichtert ein paar Kollegen.',
    prompt: `Before dawn. ${F.svenAussen}, unlocks the glass entrance door of a company building with a key, concentrated. Behind him a few waiting employees in winter jackets, relieved. Medium shot from the side, lamp light from the canopy above. ${KALT}`,
  },
  {
    datei: 'S2-B-2.jpg',
    slot: 'S2-B',
    titel: 'Das Licht geht an',
    bild: 'Dieselbe Totale wie S1-A, etwas heller: In Büro und Halle brennt jetzt Licht, mehrere Autos auf dem Parkplatz.',
    prompt: `Wide shot at early dawn: a modern grey industrial hall with a low office wing, now with warm light switched on in the office windows and in the skylight band of the hall. Several cars stand in the wet car park, one street lamp still on. A dike and a few wind turbines on the horizon, the sky slowly brightening. No people in the foreground. ${ORT}`,
    hinweis: 'Am besten aus S1-A ableiten (gleiches Gebäude, „Variation“/Bild-zu-Bild), damit es wie derselbe Ort aussieht.',
  },
  {
    datei: 'S3-A.jpg',
    slot: 'S3-A',
    titel: 'Sven allein im Büro',
    bild: 'Sven steht allein an seinem Schreibtisch; das Smartphone auf dem Tisch leuchtet auf, er sieht ernst darauf.',
    prompt: `Early morning in a plain office. ${F.sven}, stands alone next to his desk. A smartphone lying on the desk has just lit up; he looks down at it with a serious face. Cool daylight falls through half-closed blinds; a computer monitor and shelves with binders in the background. Medium-wide shot with space around him. ${KALT}`,
  },
  {
    datei: 'S4-A.jpg',
    slot: 'S4-A',
    titel: 'Katja in der Buchhaltung',
    bild: 'Katja tippt konzentriert am Rechner; Papierstapel und Ordner auf dem Tisch, Regale voller Ordner.',
    prompt: `Accounting office in the morning. ${F.katja}, sits at her desk in front of a computer monitor, typing, concentrated. Stacks of paper and ring binders on the desk, shelves full of binders behind her. Cool daylight from a window with blinds. Medium shot from the side. ${KALT}`,
  },
  {
    datei: 'S4-B.jpg',
    slot: 'S4-B',
    titel: 'Katja lehnt sich zurück',
    bild: 'Nah: Katja lehnt sich im Stuhl zurück, Augen geschlossen, reibt sich die Augen. Erschöpft und ratlos – ohne Theater.',
    prompt: `Close-up in an accounting office. ${F.katja}, leans back in her office chair with her eyes closed, glasses pushed up onto her forehead, rubbing her eyes with one hand – exhausted and at a loss, quiet, not exaggerated. The computer monitor lights her face; stacks of paper on the desk. ${KALT}`,
  },
  {
    datei: 'S5-A.jpg',
    slot: 'S5-A (Film 2: V1)',
    titel: 'Das Telefon im Vertrieb klingelt',
    bild: 'Julia sieht zögernd auf das klingelnde Tischtelefon (rote Lampe), die Hand schwebt über dem Hörer.',
    prompt: `Sales office in the morning. ${F.julia}, sits at her desk and looks hesitantly at a ringing desk telephone whose small red call light is on; her hand hovers above the receiver. A closed laptop and some papers on the desk, a window with blinds behind her. Medium shot from the side. ${KALT}`,
  },
  {
    datei: 'S5-B.jpg',
    slot: 'S5-B',
    titel: 'Leerer Schreibtisch des Chefs',
    bild: 'Naher Blick auf den verwaisten Chefschreibtisch: leerer Ledersessel, dunkler Bildschirm, Tasse, Unterlagen.',
    prompt: `Close shot of a managing director's desk with nobody there: an empty leather executive chair, a dark computer monitor, a closed laptop, a coffee mug and neatly stacked documents. Cold light falls through blinds. No people. ${KALT}`,
  },
  {
    datei: 'S5-C.jpg',
    slot: 'S5-C',
    titel: 'Die Produktion steht',
    bild: 'Drei Arbeiter stehen mit verschränkten Armen vor der abgeschalteten Maschine; rote Signalleuchte, leere Palette.',
    prompt: `Production hall of a mechanical engineering company. Three workers in work clothes, among them ${F.markus}, stand idle with crossed arms in front of a large CNC machine that is switched off; the signal tower on the machine shows a red light. An empty wooden pallet stands on the floor. Cold industrial light, wide shot. ${KALT}`,
  },
  {
    datei: 'S6-A.jpg',
    slot: 'S6-A',
    titel: 'Das leere Chefbüro',
    bild: 'Totale des leeren Chefbüros: hoher Ledersessel hinter dem Schreibtisch, Jacke über der Lehne, kaltes Licht durch Lamellen.',
    prompt: `Wide shot of a managing director's office with nobody in it. In the centre an empty high-backed leather executive chair behind a large desk, a suit jacket hanging over the backrest. On the desk a closed laptop, a coffee mug and a desk telephone with a small red light. Cold morning light falls in stripes through vertical blinds; a round wall clock on the wall. Still, lonely atmosphere. Very high detail. ${KALT}`,
    hinweis: 'In höchster verfügbarer Auflösung erzeugen – auf dieses Bild fährt die Kamera acht Sekunden lang zu.',
    test: true,
  },
  {
    datei: 'N1-1.jpg',
    slot: 'N1 (nur Film 2)',
    titel: 'Sven holt den Ordner aus dem Tresor',
    bild: 'Sven kniet im Chefbüro vor dem offenen Tresor und nimmt einen leuchtend orangefarbenen Ordner heraus (Etikett leer).',
    prompt: `Morning in a managing director's office. ${F.sven}, kneels in front of an open small office safe built into a sideboard and takes out a bright orange ring binder with a blank white label. Serious, focused. Warm early sunlight falls through vertical blinds; the empty executive chair and the desk in the background. Medium shot. ${WARM}`,
    hinweis: 'Das Etikett bleibt leer – die Aufschrift „NOTFALLORDNER“ lege ich lesbar darüber.',
  },
  {
    datei: 'N1-2.jpg',
    slot: 'N1 (nur Film 2)',
    titel: 'Der aufgeschlagene Ordner',
    bild: 'Senkrecht von oben: aufgeschlagener orangefarbener Ordner auf Holztisch, rechts ein völlig leeres weißes Blatt mit farbigen Registern, links in der Deckeltasche ein versiegelter Umschlag.',
    prompt: `Top-down view straight from above onto a wooden desk: an open bright orange ring binder. The right-hand page is a completely blank white sheet with five coloured index tabs on its right edge. In the pocket of the left inside cover lies a sealed cream-coloured envelope with a red wax seal. A man's hand holds the binder open at the lower left corner. Warm sunlight from the upper right. Absolutely no writing anywhere.`,
    hinweis: 'Seite und Umschlag bleiben unbeschriftet – Inhaltsverzeichnis und „Zugangsdaten“ lege ich als lesbare Schrift darüber. Wenn das Bild nicht überzeugt, bleibt hier meine gezeichnete Fassung.',
  },
  {
    datei: 'N2.jpg',
    slot: 'N2 (nur Film 2)',
    titel: 'Freigabe zu zweit',
    bild: 'Katja am Rechner, Sven steht daneben und sieht mit auf den Bildschirm; beide erleichtert, kleines Lächeln. Tageslicht.',
    prompt: `Accounting office in bright daylight. ${F.katja}, sits at her computer; ${F.sven}, stands next to her, leaning in, both looking at the monitor. She has just clicked; both look relieved, with a small smile. Papers and ring binders on the desk. Medium shot from the side. ${WARM}`,
  },
  {
    datei: 'N3.jpg',
    slot: 'N3 (nur Film 2)',
    titel: 'Julia telefoniert mit dem Kunden',
    bild: 'Julia mit dem Hörer am Ohr, ruhig und sicher, leichtes Lächeln, macht sich eine Notiz. Tageslicht.',
    prompt: `Sales office in bright daylight. ${F.julia}, sits at her desk with the receiver of the desk telephone at her ear, speaking calmly and confidently with a slight smile, making a note with her other hand. An open laptop on the desk, a window with blinds behind her. Medium shot from the side. ${WARM}`,
  },
  {
    datei: 'N4.jpg',
    slot: 'N4 (nur Film 2)',
    titel: 'Die Produktion läuft',
    bild: 'Die Maschine arbeitet (Licht und Funken hinter der Scheibe, grüne Signalleuchte); Markus am Bedienpult, zwei Kollegen mit Material.',
    prompt: `Production hall of a mechanical engineering company in full operation. A large CNC machine is running; bright light and sparks behind its window, the signal tower shows green. ${F.markus}, operates the control panel; a second worker carries a box of material, a third stacks boxes on a wooden pallet. Bright daylight through the skylights. Wide shot. ${WARM}`,
  },
  {
    datei: 'N5.jpg',
    slot: 'N5 (nur Film 2)',
    titel: 'Der Ordner auf dem Chefschreibtisch',
    bild: 'Dasselbe Chefbüro wie S6-A, jetzt in warmem Sonnenlicht: Sessel leer, Jacke über der Lehne – auf dem Tisch steht der orangefarbene Ordner (Etikett leer).',
    prompt: `Wide shot of a managing director's office in warm golden sunlight falling in stripes through vertical blinds. The high-backed leather executive chair behind the desk is empty, a suit jacket hangs over its backrest. On the desk, clearly visible, stands a bright orange ring binder with a blank white label on its front. Calm, reassuring atmosphere. Very high detail, no people. ${WARM}`,
    hinweis: 'Am besten aus S6-A ableiten (gleiches Büro, anderes Licht). Etikett leer lassen; in höchster Auflösung erzeugen.',
    test: true,
  },
];

// ───────────────────────── Profilbilder ─────────────────────────

const portraet = (figur: string, ausdruck: string, hintergrund: string) =>
  `Square profile picture, head-and-shoulders portrait of ${figur}, ${ausdruck}, looking at the camera. Softly blurred ${hintergrund} in the background. ${STIL}`;

const profilbilder: {datei: string; name: string; prompt: string}[] = [
  {datei: 'markus.jpg', name: 'Markus', prompt: portraet(F.markus, 'a friendly, slightly cheeky smile', 'workshop')},
  {datei: 'julia.jpg', name: 'Julia', prompt: portraet(F.julia, 'an open, friendly smile', 'bright office')},
  {datei: 'katja.jpg', name: 'Katja', prompt: portraet(F.katja, 'a kind, reserved smile', 'office with shelves')},
  {datei: 'tobias.jpg', name: 'Tobias', prompt: portraet(F.tobias, 'a relaxed smile', 'desk with computer monitors')},
  {datei: 'thomas.jpg', name: 'Thomas', prompt: portraet(F.thomas, 'a confident, friendly smile', 'office')},
  {datei: 'anna.jpg', name: 'Anna', prompt: portraet(F.anna, 'a warm smile', 'garden')},
  {datei: 'sven.jpg', name: 'Sven (im Chat nicht sichtbar, für später)', prompt: portraet(F.sven, 'a calm, friendly smile', 'production hall')},
  {
    datei: 'dieter.jpg',
    name: 'Dieter (hat kein Selfie, sondern einen Leuchtturm)',
    prompt: `Square picture: a yellow-and-red striped lighthouse on a green dike under a blue sky with a few white clouds, North Sea coast. No people. ${STIL}`,
  },
];

// ───────────────────────── Ausgabe ─────────────────────────

/** Wo und wie lange eine Szene in den Filmen läuft (S5-A heißt in Film 2 „V1“). */
const einsatz = (slot: string) => {
  const id = slot.split(' ')[0];
  const hits: string[] = [];
  for (const def of Object.values(films)) {
    const film = compileFilm(def);
    for (const shot of film.shots) {
      if (!isCutsceneShot(shot)) continue;
      const key = shot.def.slot === 'V1' ? 'S5-A' : shot.def.slot;
      if (key !== id) continue;
      hits.push(`${def.id.replace('film', 'Film ')}: ab ${formatTc(shot.from / film.fps)}, ${(shot.duration / film.fps).toFixed(1).replace('.', ',')} s`);
    }
  }
  return hits.join(' · ');
};

const block = (text: string) => ['```text', text, '```'];
const out: string[] = [
  '# Bildvorlagen – Standbilder im 3D-Trickfilmstil',
  '',
  '> Automatisch erzeugt mit `npx tsx scripts/make-prompts.ts` – Figuren und Stil stehen oben im Skript.',
  '',
  'Mit diesen Beschreibungen erzeugen Sie in einem Bildgenerator Ihrer Wahl je ein Standbild pro Filmszene.',
  'Ich lege Kamerafahrt, leichte Bewegung und – wo nötig – lesbare Schrift darüber; Chat, Schnitt und Ton der Filme bleiben unverändert.',
  '',
  '## So gehen Sie vor',
  '',
  '1. **Zuerst nur die drei Testbilder** erzeugen (unten mit ★ markiert) und mir schicken. Daran sehen wir, ob der Stil trägt, bevor alle 20 entstehen.',
  '2. Format: **Querformat 16:9**, mindestens 1920×1080, gern größer (für Kamerafahrten). Profilbilder quadratisch.',
  '3. Den Text aus dem grauen Kasten vollständig einfügen – Figur, Szene und Stil sind jeweils schon enthalten.',
  '4. **Figuren gleich halten:** Erzeugen Sie von Markus, Sven, Katja und Julia zuerst je ein Profilbild und nutzen Sie es – falls Ihr Werkzeug das kann – als Figuren-Referenz für die Szenen. Die Beschreibung jeder Figur steht wortgleich in jedem Prompt.',
  '5. **Keine Schrift im Bild.** Schilder, Etiketten und Bildschirme bleiben leer; Bildgeneratoren entstellen Schrift fast immer.',
  '6. Dateien so benennen wie angegeben und mir hier im Chat schicken – ich baue sie ein und rendere neu.',
  '',
  'Die Prompts sind englisch, weil Bildgeneratoren darauf am zuverlässigsten reagieren. Sagen Sie Bescheid, wenn Sie sie auf Deutsch brauchen.',
  '',
  '## Stil-Baustein (steckt in jedem Prompt; hier nur zum Nachlesen oder Anpassen)',
  '',
  ...block(STIL),
  '',
  '## Die Figuren',
  '',
  '| Figur | Aussehen (so steht es in den Prompts) |',
  '|---|---|',
  ...Object.entries({Markus: F.markus, 'Sven (draußen)': F.svenAussen, 'Sven (drinnen)': F.sven, Katja: F.katja, Julia: F.julia, Tobias: F.tobias, Anna: F.anna, Thomas: F.thomas}).map(
    ([n, d]) => `| ${n} | ${d} |`,
  ),
  '',
  'Thomas, Anna und Tobias kommen nur als Profilbild vor, nicht in den Szenen.',
  '',
  `## Szenen (${szenen.length} Bilder)`,
  '',
];

for (const s of szenen) {
  out.push(
    `### ${s.test ? '★ ' : ''}${s.datei} – ${s.titel}`,
    '',
    `Szene ${s.slot} · ${einsatz(s.slot)}${s.test ? ' · **Testbild**' : ''}`,
    '',
    `**Zu sehen:** ${s.bild}`,
    '',
    ...block(`${s.prompt} ${STIL}`),
    '',
    ...(s.hinweis ? [`_Hinweis: ${s.hinweis}_`, ''] : []),
  );
}

out.push(
  `## Profilbilder für den Chat (${profilbilder.length} Bilder, quadratisch)`,
  '',
  'Sie ersetzen die gezeichneten Köpfe neben den Nachrichten – in beiden Filmen. Das Gruppenbild (Firmenzeichen) bleibt, wie es ist.',
  '',
);
for (const p of profilbilder) {
  out.push(`### ${p.datei} – ${p.name}`, '', ...block(p.prompt), '');
}

writeFileSync(join(root, 'docs', 'BILDVORLAGEN.md'), out.join('\n'));
console.log(`docs/BILDVORLAGEN.md geschrieben: ${szenen.length} Szenenbilder, ${profilbilder.length} Profilbilder, davon ${szenen.filter((s) => s.test).length} Testbilder.`);
