import type {CutsceneSlot} from '../../engine/types';

/**
 * FILM 1 – Medienliste der Zwischensequenzen.
 *
 * Jeder Slot läuft zunächst als gekennzeichnete Ersatzsequenz (gezeichnete Animation).
 * Realfilm einsetzen:
 *   1. Clip nach public/footage/ legen (MP4/H.264, 1920×1080, 25 oder 30 fps, mind. Slot-Länge)
 *   2. hier `clip: {src: 'footage/S1-A.mp4'}` eintragen
 * Die Chatanimation, der Schnitt und der Ton bleiben davon unberührt.
 * Längen und Positionen stehen in timing.ts.
 */
const slot = (id: string, title: string, placeholder: string, brief: string): CutsceneSlot => ({
  id,
  title,
  brief,
  placeholder,
  clip: null,
});

export const cutscenes: Record<string, CutsceneSlot> = Object.fromEntries(
  [
    slot(
      'S1-A',
      'Parkplatz, Totale',
      'parkplatz',
      'Außen, Dämmerung, kalt. Firmengebäude mit fast leerem Parkplatz, Laternenlicht, nasser Asphalt. Markus’ Auto fährt ein und hält. Ruhige, weite Einstellung.',
    ),
    slot(
      'S1-B',
      'Markus am Eingang',
      'eingang',
      'Halbtotale Eingangstür. Markus geht zur Tür, zieht am Griff – abgeschlossen. Zweiter Versuch, stärker. Tür bleibt zu.',
    ),
    slot(
      'S1-C',
      'Blick auf die Uhr, Smartphone',
      'uhrHandy',
      'Nah: Armbanduhr zeigt 05:45. Dann zieht Markus das Smartphone aus der Jacke, Display beleuchtet sein Gesicht.',
    ),
    slot(
      'S2-A',
      'Wartende Mitarbeiter',
      'wartende',
      'Mehrere Mitarbeiter (ca. acht) warten vor dem Eingang. Atemwolken, Hände in den Taschen, jemand versucht zu telefonieren.',
    ),
    slot(
      'S2-B',
      'Sven schließt auf',
      'aufschliessen',
      'Sven kommt mit Schlüssel, schließt auf. Die Gruppe geht hinein, in der Halle geht verspätet das Licht an.',
    ),
    slot(
      'S3-A',
      'Sven allein im Büro',
      'svenBuero',
      'Sven allein im Büro, Morgenlicht. Das Smartphone auf dem Schreibtisch vibriert und leuchtet auf. Er greift danach.',
    ),
    slot(
      'S4-A',
      'Buchhaltung',
      'buchhaltung',
      'Katja am Schreibtisch vor dem Computer, Unterlagen und Ordner auf dem Tisch. Konzentriert, noch gefasst.',
    ),
    slot(
      'S4-B',
      'Katja lehnt sich zurück',
      'katjaNah',
      'Nahaufnahme: Katja lehnt sich im Stuhl zurück, schließt die Augen und reibt sie sich. Ratlosigkeit, kein Theater.',
    ),
    slot(
      'S5-A',
      'Vertrieb, Telefon klingelt',
      'vertrieb',
      'Julia im Vertriebsbüro. Das Tischtelefon klingelt, die Anruflampe blinkt. Sie sieht es an und zögert.',
    ),
    slot(
      'S5-B',
      'Leerer Arbeitsplatz des Chefs',
      'chefplatz',
      'Kurzer Blick auf den leeren Schreibtisch des Geschäftsführers: Stuhl, dunkler Bildschirm, Unterlagen.',
    ),
    slot(
      'S5-C',
      'Produktion steht',
      'produktion',
      'Produktionshalle. Mitarbeiter stehen vor einer stillstehenden Maschine, Warnleuchte gelb/rot. Keiner arbeitet.',
    ),
    slot(
      'S6-A',
      'Das leere Chefbüro',
      'chefbuero',
      'Langsame Kamerafahrt auf den leeren Chefsessel. Jacke über der Lehne, Kaffeetasse, Telefon blinkt. Niemand da.',
    ),
  ].map((s) => [s.id, s]),
);
