import type {CutsceneSlot} from '../../engine/types';
import {cutscenes as film1} from '../film1/cutscenes';

/**
 * FILM 2 – Medienliste der Zwischensequenzen.
 *
 * Sieben Einstellungen sind dieselben wie in Film 1 (gleiche Slot-Einträge): Wird dort
 * ein Realfilm-Clip eingetragen, läuft er automatisch auch hier. Fünf Einstellungen (N1–N5)
 * gibt es nur in Film 2.
 */
const neu = (id: string, title: string, placeholder: string, brief: string): CutsceneSlot => ({
  id,
  title,
  brief,
  placeholder,
  clip: null,
});

export const cutscenes: Record<string, CutsceneSlot> = {
  // ── identisch mit Film 1 ──
  'S1-A': film1['S1-A'],
  'S1-B': film1['S1-B'],
  'S1-C': film1['S1-C'],
  'S2-B': film1['S2-B'],
  'S3-A': film1['S3-A'],
  'S4-A': film1['S4-A'],
  V1: {...film1['S5-A'], id: 'V1'},

  // ── nur in Film 2 ──
  N1: neu(
    'N1',
    'Der Notfallordner',
    'notfallordner',
    'Sven öffnet im Chefbüro den Tresor und nimmt einen orangefarbenen Ordner heraus („Notfallordner“). Umschnitt auf den aufgeschlagenen Ordner: Inhaltsverzeichnis mit Vertretungsplan, Vollmachten, Schlüsseln und Zugängen, Kontakten, laufenden Aufträgen; in der Deckeltasche ein versiegelter Umschlag „Zugangsdaten“.',
  ),
  N2: neu(
    'N2',
    'Freigabe zu zweit',
    'freigabe',
    'Buchhaltung, jetzt bei Tageslicht. Katja am Rechner, Sven steht neben ihr und sieht mit auf den Bildschirm. Sie gibt frei, er nickt. Erleichterung, kein Jubel.',
  ),
  N3: neu(
    'N3',
    'Julia telefoniert mit dem Kunden',
    'vertriebTelefon',
    'Vertriebsbüro bei Tageslicht. Julia hat den Hörer am Ohr, spricht ruhig und sicher, nickt. Gegenbild zum klingelnden Telefon, an das in Film 1 niemand ging.',
  ),
  N4: neu(
    'N4',
    'Die Produktion läuft',
    'produktionLaeuft',
    'Dieselbe Halle wie in Film 1 – aber die Maschine arbeitet, die Signalleuchte ist grün. Mitarbeiter am Bedienpult, beim Materialtransport, an der Palette.',
  ),
  N5: neu(
    'N5',
    'Chefbüro: der Ordner auf dem Tisch',
    'chefbueroOrdner',
    'Wie die Zufahrt auf den leeren Chefsessel in Film 1, jetzt in warmem Sonnenlicht: Der Sessel ist leer, die Jacke hängt über der Lehne – aber auf dem Schreibtisch steht der Notfallordner. Langsame Zufahrt auf den Ordner.',
  ),
};
