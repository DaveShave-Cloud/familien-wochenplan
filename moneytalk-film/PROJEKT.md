# MoneyTalk – Notfallordner für Unternehmer

Zwei Kurzfilme für eine MoneyTalk-Veranstaltung, je 3:45 min · 1920×1080 · 30 fps · MP4 (H.264, yuv420p, AAC, faststart):

- **Film 1 „Plötzlich steht alles still“** – Der Geschäftsführer der fiktiven Nordwerk Maschinenbau GmbH
  fällt aus, und im Firmenchat wird Stunde um Stunde sichtbar, was alles an ihm hängt. Endet offen.
- **Film 2 „Gut, dass wir vorbereitet sind“** – Derselbe Mittwoch, dieselben Probleme. Aber im Tresor
  liegt ein Notfallordner, und jedes Problem ist nach wenigen Nachrichten gelöst.

Gebaut mit [Remotion](https://www.remotion.dev) (React → Video). Dieser Ordner ist eigenständig und hat
mit dem übrigen Repository nichts zu tun.

## Bedienung

```bash
npm install                 # einmalig
npm run studio              # Vorschau im Browser (Remotion Studio), beide Filme
npm run check               # Zeitpläne prüfen: Lesezeiten, Lücken, Verhältnis Chat/Film, Dialogabgleich
npm run docs                # Drehbuch, Schnittplan, Medienliste je Film neu erzeugen (docs/)
npm run render              # Film 1 rendern → out/ (Ersatzsequenzen gekennzeichnet)
npm run render:clean        # Film 1 ohne Kennzeichnung
npm run render:film2        # Film 2 (gekennzeichnet)
npm run render:film2:clean  # Film 2 ohne Kennzeichnung
npm run audio               # Töne neu erzeugen (überschreibt public/audio/*.wav)
```

Standbilder zur Kontrolle: `bash scripts/stills.sh 600,2400,6480` (Frame-Nummern),
für Film 2 `COMP=Film2 bash scripts/stills.sh …`.

## Wo ändere ich was?

| Ich möchte … | Datei |
|---|---|
| einen Nachrichtentext oder eine Uhrzeit in der Blase ändern | `src/films/film1/script.ts` bzw. `film2/script.ts` |
| Zeitpunkte, Tippdauer, Schnitte, Blenden ändern | `src/films/…/timing.ts` |
| einen Realfilm-Clip einsetzen | `src/films/…/cutscenes.ts` + `public/footage/` |
| ein Standbild (z. B. im 3D-Trickfilmstil) einsetzen | `src/films/…/cutscenes.ts`: `stills: [{src: 'footage/S1-B-2.jpg'}]` |
| Bildbeschreibungen für den Bildgenerator ändern | `scripts/make-prompts.ts` → `npm run prompts` |
| Musik und Geräusche mischen | `src/films/…/sound.ts` |
| Namen, Farben, Profilbilder, Gruppenname (beide Filme) | `src/world/nordwerk.ts` |
| Aussehen der Chatoberfläche | `src/engine/chat/`, `src/engine/theme.ts` |
| eine Ersatzsequenz umzeichnen | `src/engine/cutscenes/placeholders/` |
| den Inhalt des gezeigten Notfallordners ändern | `INHALT` in `src/engine/cutscenes/placeholders/film2.tsx` |
| Klänge selbst verändern | `scripts/generate-audio.mjs` |

`src/engine/` kennt keinen konkreten Film. `src/world/` (Figuren, Chats) gilt für beide Filme.
`src/films/film1/` und `film2/` enthalten nur Daten: Texte, Zeiten, Medien, Ton – strikt getrennt.
Lesbare Fassungen liegen in `docs/film1/` und `docs/film2/` (Drehbuch, Schnittplan, Medienliste).

## Wichtige Entscheidungen

### Für beide Filme

1. **Perspektive: durchgehend Svens Telefon.** Alle anderen erscheinen mit Namen und Bild; Svens Nachrichten
   sind die grünen ausgehenden Blasen. Gründe: Auf ihm lastet der Tag; Annas private Nachricht und
   „Markus schreibt …“ am Ende funktionieren nur von einem fremden Telefon aus; und das Publikum liest
   bei jeder Nachricht sofort, wer spricht.
2. **Dunkler Chatmodus** in beiden Filmen: gleiche Oberfläche, gleiches Telefon. Der Unterschied
   entsteht durch Inhalt, Licht und Musik. (Ein heller Modus ist angelegt: `theme: 'light'`.)
3. **Lesbarkeit.** Nachrichtenschrift 38 px (3,5 % der Bildhöhe). Jede Nachricht steht mindestens
   1,2 s + 0,3 s je Wort, bevor die nächste kommt; `npm run check` erzwingt das.
4. **Zwischensequenzen sind Ersatzsequenzen.** Es lag kein Realfilm vor und es wurde keiner erfunden:
   Alle Filmszenen sind gezeichnete Scherenschnitt-Animationen und (in der Vorschaufassung) im Bild als
   „ERSATZSEQUENZ“ gekennzeichnet. Jede ist ein Slot und wird durch einen Eintrag in `cutscenes.ts`
   gegen Realfilm getauscht – Chat, Schnitt und Ton bleiben unberührt.
5. **Ton vollständig selbst erzeugt.** Nachrichtentöne, Geräusche und Musik werden rechnerisch
   synthetisiert (keine Fremdaufnahmen, keine Lizenzen, keine externen oder kostenpflichtigen Dienste).
   Die Originaltöne von WhatsApp sind geschützt und wurden nicht verwendet; die eigenen Töne sind daran
   angelehnt. Die Musik besteht aus durchlaufenden Spuren, die in `sound.ts` nur gemischt werden.
6. **Keine Markenbestandteile.** Die Oberfläche ist einem bekannten Messenger nachempfunden, verwendet
   aber weder dessen Logo noch dessen Grafiken, Schriften oder Töne.
7. **Emojis** als Bitmap-Schrift (Noto Color Emoji, OFL) im Projekt, weil Remotions Browser die
   Vektor-Variante nicht zeichnet. Oberflächenschrift: Inter (OFL).

### Film 1

- **Dialog wörtlich nach Auftrag** (31 Nachrichten; `npm run check` gleicht mit
  `docs/film1/drehbuch-referenz.txt` ab).
- **Kleine Ergänzungen:** zwei Nachrichten von „Gestern“ als Vorgeschichte (Dieter verabschiedet sich,
  Thomas: „Ich halte hier die Stellung.“), der Kontaktname „Anna (Thomas’ Frau)“, die Einblendung
  „Mittwoch, 25. · 05:45 Uhr …“ und Uhrzeiten von 05:47 bis 10:00 – die letzte Nachricht fällt genau
  auf die Frist des Kunden.
- **Musik in d-Moll**, verstummt bei Annas Nachricht, bricht mit der letzten Nachricht ab.

### Film 2

- **Dialog selbst geschrieben** (kein Text vom Auftraggeber) und als Spiegel zu Film 1 gebaut:
  31 Nachrichten, davon elf wortgleich mit Film 1 (im Skript mit „= Film 1“ markiert). Die ersten
  30 Sekunden laufen bild- und zeitgleich; der Unterschied beginnt mit Svens Antwort
  „Bin in zehn Minuten da. Ich habe den Zweitschlüssel.“
- **Was der Ordner löst** – je ein Problem aus Film 1:
  Schlüssel (Zweitschlüssel geregelt) · Vertretung (Vertretungsplan, Vollmacht) · Lohnlauf
  (Bankvollmacht, Freigabe zu zweit) · Kundenauftrag (Konditionen dokumentiert) · Lieferant
  (Zahlung freigegeben) · IT (versiegelter Notfallzugang).
  Die Formulierungen sind bewusst allgemein gehalten („Vollmacht“, „Bankvollmacht“); welche Vollmachten
  im Einzelfall nötig sind, ist Sache der Beratung – bitte fachlich gegenlesen.
- **Vorgeschichte in einer Zeile anders:** Thomas schreibt „Deinen Schlüssel hat Sven, wie besprochen.“
- **Einblendung „Derselbe Mittwoch.“** statt „Mittwoch, 25.“ – das Publikum erkennt sofort die Wiederholung.
- **Der Ordner als Bild:** Sven holt ihn aus dem Tresor; der aufgeschlagene Ordner zeigt das
  Inhaltsverzeichnis (Vertretungsplan, Vollmachten, Schlüssel und Zugänge, Kontakte, laufende Aufträge)
  und den versiegelten Umschlag „Zugangsdaten“. Am Ende steht er auf dem Schreibtisch des leeren
  Chefbüros – Gegenbild zur Zufahrt auf den leeren Sessel in Film 1.
- **Schluss gespiegelt:** wieder Pause, wieder „Markus schreibt …“, wieder 10:00 Uhr – statt
  „Hat eigentlich irgendjemand einen Plan?“ jetzt „Gut, dass wir vorbereitet sind.“
  Davor Annas Nachricht: Thomas ist wach und fragt als Erstes, ob der Betrieb läuft.
- **Musik:** gleicher dunkler Beginn, gleiche Stille bei Annas Nachricht; mit dem Wort „Notfallordner“
  setzt eine warme Fläche in D-Dur ein (gleicher Grundton wie Film 1, andere Farbe), dazu ein ruhiges
  Klaviermotiv. Statt Abbruch ein Schlussakkord, der ins Schwarzbild ausklingt.
- **Licht:** Die Schauplätze sind dieselben, werden aber im Lauf des Vormittags heller und wärmer.
- **Sieben Filmszenen sind dieselben wie in Film 1** (gleiche Slots – ein Realfilm-Clip gilt für beide
  Filme), fünf gibt es nur hier (N1–N5).

## Filmszenen im 3D-Trickfilmstil (in Arbeit)

Gewünscht ist ein plastischer 3D-Trickfilmstil statt der Scherenschnitte. Der lässt sich nicht in Code
zeichnen; er kommt als **Standbild aus einem Bildgenerator** und wird hier mit Kamerafahrt, Korn, Regen
oder Staub im Licht und – wo nötig – darübergelegter Schrift zur Einstellung (`StillShot`).

- Fertige Bildbeschreibungen für alle 20 Szenenbilder und 8 Profilbilder: `docs/BILDVORLAGEN.md`.
- Zuerst die drei Testbilder (★) erzeugen und beurteilen, dann den Rest.
- Einbau je Slot in `cutscenes.ts` über `stills` (mehrere Bilder nacheinander möglich, Kamerafahrt mit
  `from`/`to`, Schrift mit `texts`). Reihenfolge der Quellen: Realfilm-Clip → Standbilder → Ersatzsequenz.
- Profilbilder: Datei nach `public/avatars/`, in `src/world/nordwerk.ts` `avatar: {type: 'photo', src: …}`.

## Offene Punkte

- **Realfilm** für die Filmszenen (Film 1: zwölf Slots, Film 2: fünf zusätzliche) und **Profilfotos**
  der Darsteller. Bedarf: `docs/film1/MEDIENLISTE.md`, `docs/film2/MEDIENLISTE.md`.
- **Tonabnahme mit Ohren**: Pegel, Synchronität und Verlauf wurden gemessen, aber die Mischung sollte
  einmal über die Saalanlage gehört werden. Schnelle Stellschraube: `musicMaster` in `sound.ts`.
- **Fachliche Prüfung der Aussagen in Film 2** (Vollmachten, Bankfreigabe, Notfallzugang).
- **Remotion-Lizenz prüfen.** Remotion ist für Einzelpersonen und sehr kleine Unternehmen kostenlos,
  größere Unternehmen brauchen eine kostenpflichtige Company License. Bitte vor der öffentlichen
  Aufführung unter <https://www.remotion.dev/license> klären, was für den Veranstalter gilt.
  Bisher wurde nichts gekauft und kein Lizenzschlüssel verwendet.

## Einen weiteren Film anlegen

1. `src/films/film3/` als Kopie eines vorhandenen Films anlegen, `script.ts`, `timing.ts`,
   `cutscenes.ts`, `sound.ts` anpassen.
2. In `src/films/index.ts` und `src/Root.tsx` eintragen, in `scripts/render.sh` einen Modus ergänzen.
3. `npm run check` und `npm run docs`.

## Umgebung

Remotion lädt seinen Browser normalerweise selbst. Wo das Netz das nicht erlaubt, einen vorhandenen
`chrome-headless-shell` angeben: `REMOTION_BROWSER_EXECUTABLE=/pfad/zu/chrome-headless-shell npm run render`.
Schneller Zwischenstand: `IMAGE_FORMAT=jpeg npm run render`.
