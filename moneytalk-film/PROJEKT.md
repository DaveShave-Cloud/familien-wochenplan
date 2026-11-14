# MoneyTalk – Notfallordner für Unternehmer

**Film 1: „Plötzlich steht alles still“** · ca. 3:45 min · 1920×1080 · 30 fps · MP4 (H.264, yuv420p, AAC, faststart)

Eröffnungsfilm einer MoneyTalk-Veranstaltung: Der Geschäftsführer der fiktiven Nordwerk Maschinenbau GmbH
fällt aus – und im Firmenchat wird Stunde um Stunde sichtbar, was alles an ihm hängt.
Gebaut mit [Remotion](https://www.remotion.dev) (React → Video). Dieser Ordner ist eigenständig und hat
mit dem übrigen Repository nichts zu tun.

## Bedienung

```bash
npm install          # einmalig
npm run studio       # Vorschau im Browser (Remotion Studio)
npm run check        # Zeitplan prüfen: Lesezeiten, Lücken, Verhältnis Chat/Film
npm run docs         # Schnittplan und Medienliste neu erzeugen (docs/)
npm run render       # Film rendern → out/ (Ersatzsequenzen gekennzeichnet)
npm run render:clean # dasselbe ohne Kennzeichnung
npm run render:test  # nur die ersten 45 Sekunden
npm run audio        # Töne neu erzeugen (überschreibt public/audio/*.wav)
```

Standbilder zur Kontrolle: `bash scripts/stills.sh 600,2400,6480` (Frame-Nummern).

## Wo ändere ich was?

| Ich möchte … | Datei |
|---|---|
| einen Nachrichtentext oder eine Uhrzeit in der Blase ändern | `src/films/film1/script.ts` |
| Zeitpunkte, Tippdauer, Schnitte, Blenden ändern | `src/films/film1/timing.ts` |
| einen Realfilm-Clip einsetzen | `src/films/film1/cutscenes.ts` + `public/footage/` |
| Musik und Geräusche mischen | `src/films/film1/sound.ts` |
| Namen, Farben, Profilbilder, Gruppenname | `src/world/nordwerk.ts` |
| Aussehen der Chatoberfläche | `src/engine/chat/`, `src/engine/theme.ts` |
| eine Ersatzsequenz umzeichnen | `src/engine/cutscenes/placeholders/` |
| Klänge selbst verändern | `scripts/generate-audio.mjs` |

`src/engine/` kennt keinen konkreten Film. `src/world/` (Figuren, Chats) gilt für beide Filme.
`src/films/film1/` enthält nur Daten: Texte, Zeiten, Medien, Ton – strikt getrennt.

## Wichtige Entscheidungen

1. **Perspektive: durchgehend Svens Telefon.** Alle anderen erscheinen mit Namen und Bild; Svens Nachrichten
   sind die grünen ausgehenden Blasen. Gründe: Auf ihm lastet der Tag; Annas private Nachricht und
   „Markus schreibt …“ am Ende funktionieren nur von einem fremden Telefon aus; und das Publikum liest
   bei jeder Nachricht sofort, wer spricht. Wer lieber in Szene 1/2 Markus’ Telefon sähe: in `timing.ts`
   bei Einstellung `C1` `owner: 'markus'` setzen.
2. **Dunkler Chatmodus.** Passt zur Stimmung und ist im abgedunkelten Saal angenehm. Der helle Modus ist
   fertig angelegt (`theme: 'light'`) – Vorschlag für Film 2: derselbe Chat, sichtbar freundlicher.
3. **Lesbarkeit.** Nachrichtenschrift 38 px (3,5 % der Bildhöhe). Jede Nachricht steht mindestens
   1,2 s + 0,3 s je Wort, bevor die nächste kommt; `npm run check` erzwingt das.
4. **Kleine Ergänzungen zum Drehbuch** (alle in einer Zeile abschaltbar):
   - *Vorgeschichte im Chat*: zwei Nachrichten von „Gestern“ (Dieter verabschiedet sich in den Urlaub,
     Thomas: „Ich halte hier die Stellung.“). Macht die Gruppe glaubwürdig und führt beide nebenbei ein.
     Entfernen: `history` in `script.ts` leeren.
   - *Kontaktname* „Anna (Thomas’ Frau)“ – erklärt ohne Worte, wer Anna ist (`world/nordwerk.ts`).
   - *Uhrzeiten der Geschichte*: 05:47 → 10:00. Die letzte Nachricht trägt 10:00 – die Frist des Kunden
     aus Szene 5 ist in diesem Moment abgelaufen.
   - *Einblendung* zu Beginn: „Mittwoch, 25. · 05:45 Uhr · Nordwerk Maschinenbau GmbH, Ostfriesland“.
5. **Zwischensequenzen sind Ersatzsequenzen.** Es lag kein Realfilm vor und es wurde keiner erfunden:
   Alle zwölf Filmszenen sind gezeichnete Scherenschnitt-Animationen und im Bild als „ERSATZSEQUENZ“
   gekennzeichnet. Jede ist ein Slot und wird durch einen Eintrag in `cutscenes.ts` gegen Realfilm
   getauscht – Chat, Schnitt und Ton bleiben unberührt. Bedarf: `docs/MEDIENLISTE.md`.
6. **Ton vollständig selbst erzeugt.** Nachrichtentöne, Geräusche und Musik werden rechnerisch
   synthetisiert (keine Fremdaufnahmen, keine Lizenzen, keine externen oder kostenpflichtigen Dienste).
   Die Originaltöne von WhatsApp sind geschützt und wurden nicht verwendet; die eigenen Töne sind daran
   angelehnt. Die Musik besteht aus durchlaufenden Spuren, die in `sound.ts` nur gemischt werden –
   sie folgt deshalb jedem Umschnitt ohne Neuberechnung.
7. **Keine Markenbestandteile.** Die Oberfläche ist einem bekannten Messenger nachempfunden, verwendet
   aber weder dessen Logo noch dessen Grafiken, Schriften oder Töne.
8. **Emojis** als Bitmap-Schrift (Noto Color Emoji, OFL) im Projekt, weil Remotions Browser die
   Vektor-Variante nicht zeichnet. Oberflächenschrift: Inter (OFL).

## Offene Punkte

- **Realfilm** für zwölf Slots (zusammen ca. 60 s) und **Profilfotos** der Darsteller.
- **Tonabnahme mit Ohren**: Pegel, Synchronität und Spektrum wurden gemessen, aber die Mischung sollte
  einmal über die Saalanlage gehört werden. Schnelle Stellschraube: `musicMaster` in `sound.ts`.
- **Remotion-Lizenz prüfen.** Remotion ist für Einzelpersonen und sehr kleine Unternehmen kostenlos,
  größere Unternehmen brauchen eine kostenpflichtige Company License. Bitte vor der öffentlichen
  Aufführung unter <https://www.remotion.dev/license> klären, was für den Veranstalter gilt.
  Bisher wurde nichts gekauft und kein Lizenzschlüssel verwendet.

## Film 2 – „Gut, dass wir vorbereitet sind“

Vorbereitet ist: gleiche Engine, gleiche Welt, gleiche Schauplätze.

1. `src/films/film2/` als Kopie von `film1/` anlegen, `script.ts`, `timing.ts`, `sound.ts` anpassen.
2. In `src/Root.tsx` eine zweite `<Composition id="Film2" …>` eintragen.
3. Ersatzsequenzen wiederverwenden (gleiche Schlüssel) oder Varianten mit anderem Licht/anderen Posen
   ergänzen; Realfilm-Slots funktionieren identisch.
4. Für die Musik genügt eine zweite Kurve – oder eine hellere Spur im Ton-Generator.

## Umgebung

Remotion lädt seinen Browser normalerweise selbst. Wo das Netz das nicht erlaubt, einen vorhandenen
`chrome-headless-shell` angeben: `REMOTION_BROWSER_EXECUTABLE=/pfad/zu/chrome-headless-shell npm run render`.
Schneller Zwischenstand: `IMAGE_FORMAT=jpeg npm run render`.
