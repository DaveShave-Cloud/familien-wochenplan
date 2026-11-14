# Medienliste – Film 1 „Plötzlich steht alles still“

> Automatisch erzeugt mit `npm run docs` – nicht von Hand ändern. Quelle: `src/films/film1/`.

## 1. Zwischensequenzen (Realfilm wird noch benötigt)

Für keine der Filmszenen liegt bisher Realfilm vor. Jede Szene läuft als **gezeichnete, gekennzeichnete Ersatzsequenz**.
Technische Vorgabe für Zulieferung: MP4 (H.264), 1920×1080, 25 oder 30 fps, mindestens so lang wie angegeben, gern mit 1–2 s „Fleisch“ davor und danach.
Einsetzen: Datei nach `public/footage/` legen und in `src/films/film1/cutscenes.ts` beim Slot `clip: {src: 'footage/DATEI.mp4'}` eintragen.

| Slot | Im Film | Länge | Motiv | Was gedreht werden muss | Status |
|---|---|---|---|---|---|
| S1-A | 0:00.0–0:05.5 | 5,5 s | Parkplatz, Totale | Außen, Dämmerung, kalt. Firmengebäude mit fast leerem Parkplatz, Laternenlicht, nasser Asphalt. Markus’ Auto fährt ein und hält. Ruhige, weite Einstellung. | Ersatzsequenz |
| S1-B | 0:05.5–0:11.5 | 6,0 s | Markus am Eingang | Halbtotale Eingangstür. Markus geht zur Tür, zieht am Griff – abgeschlossen. Zweiter Versuch, stärker. Tür bleibt zu. | Ersatzsequenz |
| S1-C | 0:11.5–0:15.0 | 3,5 s | Blick auf die Uhr, Smartphone | Nah: Armbanduhr zeigt 05:45. Dann zieht Markus das Smartphone aus der Jacke, Display beleuchtet sein Gesicht. | Ersatzsequenz |
| S2-A | 0:45.5–0:51.0 | 5,5 s | Wartende Mitarbeiter | Mehrere Mitarbeiter (ca. acht) warten vor dem Eingang. Atemwolken, Hände in den Taschen, jemand versucht zu telefonieren. | Ersatzsequenz |
| S2-B | 0:51.0–0:58.0 | 7,0 s | Sven schließt auf | Sven kommt mit Schlüssel, schließt auf. Die Gruppe geht hinein, in der Halle geht verspätet das Licht an. | Ersatzsequenz |
| S3-A | 0:58.0–1:01.2 | 3,2 s | Sven allein im Büro | Sven allein im Büro, Morgenlicht. Das Smartphone auf dem Schreibtisch vibriert und leuchtet auf. Er greift danach. | Ersatzsequenz |
| S4-A | 1:28.0–1:32.5 | 4,5 s | Buchhaltung | Katja am Schreibtisch vor dem Computer, Unterlagen und Ordner auf dem Tisch. Konzentriert, noch gefasst. | Ersatzsequenz |
| S4-B | 1:58.0–2:05.0 | 7,0 s | Katja lehnt sich zurück | Nahaufnahme: Katja lehnt sich im Stuhl zurück, schließt die Augen und reibt sie sich. Ratlosigkeit, kein Theater. | Ersatzsequenz |
| S5-A | 2:17.2–2:20.2 | 3,0 s | Vertrieb, Telefon klingelt | Julia im Vertriebsbüro. Das Tischtelefon klingelt, die Anruflampe blinkt. Sie sieht es an und zögert. | Ersatzsequenz |
| S5-B | 2:35.2–2:38.4 | 3,2 s | Leerer Arbeitsplatz des Chefs | Kurzer Blick auf den leeren Schreibtisch des Geschäftsführers: Stuhl, dunkler Bildschirm, Unterlagen. | Ersatzsequenz |
| S5-C | 2:38.4–2:42.0 | 3,6 s | Produktion steht | Produktionshalle. Mitarbeiter stehen vor einer stillstehenden Maschine, Warnleuchte gelb/rot. Keiner arbeitet. | Ersatzsequenz |
| S6-A | 3:09.0–3:17.0 | 8,0 s | Das leere Chefbüro | Langsame Kamerafahrt auf den leeren Chefsessel. Jacke über der Lehne, Kaffeetasse, Telefon blinkt. Niemand da. | Ersatzsequenz |

Hinweise für den Dreh: dieselben Darsteller und Schauplätze werden in Film 2 („Gut, dass wir vorbereitet sind“) wieder gebraucht – am besten beide Fassungen an einem Drehtag aufnehmen. Kein lesbarer Fremdtext, keine fremden Marken im Bild.

## 2. Profilbilder

Derzeit gezeichnete Platzhalter. Benötigt: quadratisches Foto je Figur (mind. 400×400 px, Gesicht mittig), abgelegt in `public/avatars/`, eingetragen in `src/world/nordwerk.ts`.

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
| audio/music_pulse.wav | Musikspur „pulse“ |
| audio/music_ostinato.wav | Musikspur „ostinato“ |
| audio/music_tick.wav | Musikspur „tick“ |
| audio/music_strings.wav | Musikspur „strings“ |
| audio/music_riser.wav | Musikspur „riser“ |
| audio/amb_night.wav | Atmosphäre der Ersatzsequenzen |
| audio/amb_office.wav | Atmosphäre der Ersatzsequenzen |
| audio/amb_hall.wav | Atmosphäre der Ersatzsequenzen |
| audio/footsteps.wav | Geräusch einer Ersatzsequenz |
| audio/door_rattle.wav | Geräusch einer Ersatzsequenz |
| audio/key_lock.wav | Geräusch einer Ersatzsequenz |
| audio/lights_on.wav | Geräusch einer Ersatzsequenz |
| audio/vibrate.wav | Geräusch einer Ersatzsequenz |
| audio/pc_keys.wav | Geräusch einer Ersatzsequenz |
| audio/phone_ring.wav | Geräusch einer Ersatzsequenz |

Sobald ein Realfilm-Clip mit eigenem Ton eingetragen ist (`volume` > 0), entfallen die Ersatz-Geräusche dieses Slots automatisch.

## 4. Schriften

- **Inter** (Oberfläche) – SIL Open Font License, über das Paket `@fontsource-variable/inter`.
- **Noto Color Emoji** (Emojis) – SIL Open Font License, Datei `public/fonts/NotoColorEmoji.ttf`.
