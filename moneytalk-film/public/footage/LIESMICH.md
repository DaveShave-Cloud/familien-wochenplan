# Realfilm-Clips

Hier liegen später die gedrehten Zwischensequenzen (z. B. `S1-A.mp4`).

1. Clip hier ablegen: MP4 (H.264), 1920×1080, 25 oder 30 fps.
2. In `src/films/film1/cutscenes.ts` beim passenden Slot eintragen:
   `clip: {src: 'footage/S1-A.mp4'}` – optional `startAt` (Sekunden) und `volume` (Originalton 0–1).
3. `npm run docs` und `npm run render` ausführen.

Welche Clips gebraucht werden und wie lang sie sein müssen, steht in `docs/MEDIENLISTE.md`.
