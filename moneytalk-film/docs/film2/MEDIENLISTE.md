# Medienliste – Film 2 „Gut, dass wir vorbereitet sind“

> Automatisch erzeugt mit `npm run docs` – nicht von Hand ändern. Quelle: `src/films/film2/`.

## 1. Zwischensequenzen (Realfilm wird noch benötigt)

Für keine der Filmszenen liegt bisher Realfilm vor. Jede Szene läuft als **gezeichnete, gekennzeichnete Ersatzsequenz**.
Technische Vorgabe für Zulieferung: MP4 (H.264), 1920×1080, 25 oder 30 fps, mindestens so lang wie angegeben, gern mit 1–2 s „Fleisch“ davor und danach.
Einsetzen: Datei nach `public/footage/` legen und in `src/films/film2/cutscenes.ts` beim Slot `clip: {src: 'footage/DATEI.mp4'}` eintragen.

| Slot | Im Film | Länge | Motiv | Was gedreht werden muss | Status |
|---|---|---|---|---|---|
| S1-A | 0:00.0–0:05.5 | 5,5 s | Parkplatz, Totale | Außen, Dämmerung, kalt. Firmengebäude mit fast leerem Parkplatz, Laternenlicht, nasser Asphalt. Markus’ Auto fährt ein und hält. Ruhige, weite Einstellung. **Derselbe Clip wie in Film 1.** | Ersatzsequenz |
| S1-B | 0:05.5–0:11.5 | 6,0 s | Markus am Eingang | Halbtotale Eingangstür. Markus geht zur Tür, zieht am Griff – abgeschlossen. Zweiter Versuch, stärker. Tür bleibt zu. **Derselbe Clip wie in Film 1.** | Ersatzsequenz |
| S1-C | 0:11.5–0:15.0 | 3,5 s | Blick auf die Uhr, Smartphone | Nah: Armbanduhr zeigt 05:45. Dann zieht Markus das Smartphone aus der Jacke, Display beleuchtet sein Gesicht. **Derselbe Clip wie in Film 1.** | Ersatzsequenz |
| S2-B | 0:39.0–0:46.0 | 7,0 s | Sven schließt auf | Sven kommt mit Schlüssel, schließt auf. Die Gruppe geht hinein, in der Halle geht verspätet das Licht an. **Derselbe Clip wie in Film 1.** | Ersatzsequenz |
| S3-A | 0:46.0–0:49.2 | 3,2 s | Sven allein im Büro | Sven allein im Büro, Morgenlicht. Das Smartphone auf dem Schreibtisch vibriert und leuchtet auf. Er greift danach. **Derselbe Clip wie in Film 1.** | Ersatzsequenz |
| N1 | 1:08.4–1:16.4 | 8,0 s | Der Notfallordner | Sven öffnet im Chefbüro den Tresor und nimmt einen orangefarbenen Ordner heraus („Notfallordner“). Umschnitt auf den aufgeschlagenen Ordner: Inhaltsverzeichnis mit Vertretungsplan, Vollmachten, Schlüsseln und Zugängen, Kontakten, laufenden Aufträgen; in der Deckeltasche ein versiegelter Umschlag „Zugangsdaten“. | Ersatzsequenz |
| S4-A | 1:44.9–1:48.9 | 4,0 s | Buchhaltung | Katja am Schreibtisch vor dem Computer, Unterlagen und Ordner auf dem Tisch. Konzentriert, noch gefasst. **Derselbe Clip wie in Film 1.** | Ersatzsequenz |
| N2 | 1:59.9–2:04.4 | 4,5 s | Freigabe zu zweit | Buchhaltung, jetzt bei Tageslicht. Katja am Rechner, Sven steht neben ihr und sieht mit auf den Bildschirm. Sie gibt frei, er nickt. Erleichterung, kein Jubel. | Ersatzsequenz |
| V1 | 2:11.0–2:13.6 | 2,6 s | Vertrieb, Telefon klingelt | Julia im Vertriebsbüro. Das Tischtelefon klingelt, die Anruflampe blinkt. Sie sieht es an und zögert. **Derselbe Clip wie in Film 1.** | Ersatzsequenz |
| N3 | 2:34.8–2:38.0 | 3,2 s | Julia telefoniert mit dem Kunden | Vertriebsbüro bei Tageslicht. Julia hat den Hörer am Ohr, spricht ruhig und sicher, nickt. Gegenbild zum klingelnden Telefon, an das in Film 1 niemand ging. | Ersatzsequenz |
| N4 | 2:46.0–2:50.0 | 4,0 s | Die Produktion läuft | Dieselbe Halle wie in Film 1 – aber die Maschine arbeitet, die Signalleuchte ist grün. Mitarbeiter am Bedienpult, beim Materialtransport, an der Palette. | Ersatzsequenz |
| N5 | 3:14.8–3:20.8 | 6,0 s | Chefbüro: der Ordner auf dem Tisch | Wie die Zufahrt auf den leeren Chefsessel in Film 1, jetzt in warmem Sonnenlicht: Der Sessel ist leer, die Jacke hängt über der Lehne – aber auf dem Schreibtisch steht der Notfallordner. Langsame Zufahrt auf den Ordner. | Ersatzsequenz |

Hinweise für den Dreh: Beide Filme spielen am selben Tag an denselben Schauplätzen mit denselben Darstellern – am besten gemeinsam drehen. Kein lesbarer Fremdtext, keine fremden Marken im Bild.

## 2. Profilbilder

Derzeit gezeichnete Platzhalter. Benötigt: quadratisches Foto je Figur (mind. 400×400 px, Gesicht mittig), abgelegt in `public/avatars/`, eingetragen in `src/world/nordwerk.ts` (gilt für beide Filme).

| Figur | Rolle | Im Chat sichtbar | Status |
|---|---|---|---|
| Thomas | Geschäftsführer | ja | Platzhalter (gezeichnet) |
| Anna | Ehefrau von Thomas | ja | Platzhalter (gezeichnet) |
| Markus | Produktion | ja | Platzhalter (gezeichnet) |
| Sven | Betriebsleiter | nein (sein Telefon) | Platzhalter (gezeichnet) |
| Katja | Buchhaltung | ja | Platzhalter (gezeichnet) |
| Julia | Vertrieb | ja | Platzhalter (gezeichnet) |
| Tobias | IT | ja | Platzhalter (gezeichnet) |
| Dieter | Mitarbeiter mit Zweitschlüssel | ja | Platzhalter (gezeichnet) |

## 3. Ton

Sämtliche Töne werden von `scripts/generate-audio.mjs` rechnerisch erzeugt – keine Fremdaufnahmen, keine Lizenzen, keine externen Dienste.
Die Nachrichtentöne sind eigene Klänge, die wie ein typischer Messenger wirken; Originaltöne von WhatsApp sind geschützt und wurden nicht verwendet.

| Datei | Verwendung |
|---|---|
| audio/msg_in.wav | eingehende Nachricht |
| audio/msg_out.wav | gesendete Nachricht |
| audio/typing.wav | Tippen im Eingabefeld |
| audio/music_drone.wav | Musikspur „drone“ |
| audio/music2_pad.wav | Musikspur „flaeche“ |
| audio/music2_motif.wav | Musikspur „motiv“ |
| audio/music2_bass.wav | Musikspur „bass“ |
| audio/music2_rhythm.wav | Musikspur „bewegung“ |
| audio/music2_final.wav | Musikspur „schluss“ |
| audio/amb_night.wav | Atmosphäre der Ersatzsequenzen |
| audio/amb_office.wav | Atmosphäre der Ersatzsequenzen |
| audio/machine_run.wav | Atmosphäre der Ersatzsequenzen |
| audio/footsteps.wav | Geräusch einer Ersatzsequenz |
| audio/door_rattle.wav | Geräusch einer Ersatzsequenz |
| audio/key_lock.wav | Geräusch einer Ersatzsequenz |
| audio/lights_on.wav | Geräusch einer Ersatzsequenz |
| audio/vibrate.wav | Geräusch einer Ersatzsequenz |
| audio/safe_open.wav | Geräusch einer Ersatzsequenz |
| audio/paper.wav | Geräusch einer Ersatzsequenz |
| audio/pc_keys.wav | Geräusch einer Ersatzsequenz |
| audio/confirm.wav | Geräusch einer Ersatzsequenz |
| audio/phone_ring.wav | Geräusch einer Ersatzsequenz |

Sobald ein Realfilm-Clip mit eigenem Ton eingetragen ist (`volume` > 0), entfallen die Ersatz-Geräusche dieses Slots automatisch.

## 4. Schriften

- **Inter** (Oberfläche) – SIL Open Font License, über das Paket `@fontsource-variable/inter`.
- **Noto Color Emoji** (Emojis) – SIL Open Font License, Datei `public/fonts/NotoColorEmoji.ttf`.
