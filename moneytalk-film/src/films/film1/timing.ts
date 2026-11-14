import type {FilmTiming} from '../../engine/types';

/**
 * FILM 1 – Zeitablauf (Schnittplan in Datenform).
 *
 * Alle Zeiten als "m:ss.s" ab Filmbeginn. Nur hier wird geschnitten:
 *  - shots:  was wann im Bild ist (Chat, Zwischensequenz, Schwarz)
 *  - cues:   wann welche Nachricht erscheint und wie lange vorher getippt wird
 *  - fades:  Blenden
 *  - supers: Einblendungen (Ort/Zeit)
 *
 * Nach Änderungen `npm run check` ausführen – das Skript prüft Lesezeiten,
 * Überschneidungen und das Verhältnis Chat/Film.
 *
 * Perspektive: Wir sehen durchgehend Svens Telefon (owner: 'sven'). Alle anderen
 * erscheinen mit Namen, Svens Nachrichten sind die grünen „ausgehenden“ Blasen.
 */
export const timing: FilmTiming = {
  fps: 30,
  width: 1920,
  height: 1080,
  duration: '3:45.0',

  shots: [
    // ── Szene 1 · 0:00–0:28 · Markus steht vor verschlossener Tür ──
    {kind: 'cutscene', id: 'S1-A', from: '0:00.0', to: '0:05.5', slot: 'S1-A'},
    {kind: 'cutscene', id: 'S1-B', from: '0:05.5', to: '0:11.5', slot: 'S1-B'},
    {kind: 'cutscene', id: 'S1-C', from: '0:11.5', to: '0:15.0', slot: 'S1-C'},
    // ── Szene 1/2 · Chat läuft ohne Schnitt durch ──
    {kind: 'chat', id: 'C1', from: '0:15.0', to: '0:45.5', chat: 'team', owner: 'sven', backdrop: 'nacht', clock: '05:47'},

    // ── Szene 2 · 0:28–0:58 · Warten in der Kälte, Sven schließt auf ──
    {kind: 'cutscene', id: 'S2-A', from: '0:45.5', to: '0:51.0', slot: 'S2-A'},
    {kind: 'cutscene', id: 'S2-B', from: '0:51.0', to: '0:58.0', slot: 'S2-B'},

    // ── Szene 3 · 0:58–1:28 · Annas Nachricht ──
    {kind: 'cutscene', id: 'S3-A', from: '0:58.0', to: '1:01.2', slot: 'S3-A'},
    {kind: 'chat', id: 'C3a', from: '1:01.2', to: '1:11.2', chat: 'anna_sven', owner: 'sven', backdrop: 'morgen', clock: '06:41'},
    {kind: 'chat', id: 'C3b', from: '1:11.2', to: '1:28.0', chat: 'team', owner: 'sven', backdrop: 'morgen', clock: '06:43', enter: 'slide'},

    // ── Szene 4 · 1:28–2:05 · Der Lohnlauf ──
    {kind: 'cutscene', id: 'S4-A', from: '1:28.0', to: '1:32.5', slot: 'S4-A'},
    {kind: 'chat', id: 'C4', from: '1:32.5', to: '1:58.0', chat: 'team', owner: 'sven', backdrop: 'buero', clock: '08:12'},
    {kind: 'cutscene', id: 'S4-B', from: '1:58.0', to: '2:05.0', slot: 'S4-B'},

    // ── Szene 5 · 2:05–2:42 · Kunde, Material, Zahlung – es wird schneller ──
    {kind: 'chat', id: 'C5a', from: '2:05.0', to: '2:17.2', chat: 'team', owner: 'sven', backdrop: 'buero', clock: '09:21'},
    {kind: 'cutscene', id: 'S5-A', from: '2:17.2', to: '2:20.2', slot: 'S5-A'},
    {kind: 'chat', id: 'C5b', from: '2:20.2', to: '2:35.2', chat: 'team', owner: 'sven', backdrop: 'druck', clock: '09:26'},
    {kind: 'cutscene', id: 'S5-B', from: '2:35.2', to: '2:38.4', slot: 'S5-B'},
    {kind: 'cutscene', id: 'S5-C', from: '2:38.4', to: '2:42.0', slot: 'S5-C'},

    // ── Szene 6 · 2:42–3:17 · Wer darf hier eigentlich was? ──
    {kind: 'chat', id: 'C6', from: '2:42.0', to: '3:09.0', chat: 'team', owner: 'sven', backdrop: 'druck', clock: '09:41'},
    {kind: 'cutscene', id: 'S6-A', from: '3:09.0', to: '3:17.0', slot: 'S6-A'},

    // ── Szene 7 · 3:17–3:45 · „Hat eigentlich irgendjemand einen Plan?“ ──
    {kind: 'chat', id: 'C7', from: '3:17.0', to: '3:40.2', chat: 'team', owner: 'sven', backdrop: 'druck', clock: '09:56'},
    {kind: 'black', id: 'ENDE', from: '3:40.2', to: '3:45.0'},
  ],

  cues: [
    // Szene 1
    {id: 's1_1', at: '0:17.8', typing: 2.0},
    {id: 's1_2', at: '0:22.3', typing: 1.7},
    {id: 's1_3', at: '0:25.8', typing: 1.6},
    // Szene 2
    {id: 's2_1', at: '0:30.2', typing: 1.9},
    {id: 's2_2', at: '0:33.4', typing: 1.7},
    {id: 's2_3', at: '0:36.9', typing: 1.5},
    {id: 's2_4', at: '0:40.0', typing: 1.8},
    // Szene 3 – Annas Nachricht trifft während der Büro-Einstellung ein (Vibration statt Chatton)
    {id: 's3_1', at: '0:59.3', silent: true},
    // spürbare Pause, dann tippt Sven – mit Zögern nach dem ersten Satz
    {id: 's3_2', at: '1:17.5', typing: 4.6, compose: [[0, 0], [0.3, 0.34], [0.48, 0.34], [1, 1]]},
    {id: 's3_3', at: '1:21.8', typing: 1.4},
    {id: 's3_4', at: '1:24.3', typing: 1.6},
    // Szene 4
    {id: 's4_1', at: '1:34.6', typing: 1.7},
    {id: 's4_2', at: '1:40.6', typing: 1.3},
    {id: 's4_3', at: '1:44.4', typing: 2.2},
    {id: 's4_4', at: '1:50.0', typing: 1.5},
    // Katja setzt an, bricht ab, setzt neu an
    {id: 's4_5', at: '1:54.5', typing: [[2.9, 2.0], [1.3, 0]]},
    // Szene 5
    {id: 's5_1', at: '2:06.6', typing: 1.3},
    {id: 's5_2', at: '2:12.5', typing: 1.5},
    {id: 's5_3', at: '2:20.9', typing: 0.7},
    {id: 's5_4', at: '2:26.7', typing: 1.0},
    {id: 's5_5', at: '2:29.9', typing: 1.0},
    // Szene 6
    {id: 's6_1', at: '2:44.0', typing: 1.6},
    {id: 's6_2', at: '2:50.8', typing: 1.3},
    {id: 's6_3', at: '2:53.7', typing: 1.2},
    {id: 's6_4', at: '2:57.0', typing: 1.6},
    {id: 's6_5', at: '3:03.6', typing: 3.2, compose: [[0, 0], [0.32, 0.3], [0.5, 0.3], [1, 1]]},
    // Szene 7
    {id: 's7_1', at: '3:17.9', typing: 0.9},
    {id: 's7_2', at: '3:21.5', typing: 1.0},
    {id: 's7_3', at: '3:24.0', typing: 1.2},
    {id: 's7_4', at: '3:27.6', typing: 1.6},
    // kurze Pause – dann „Markus schreibt …“ – letzte Nachricht, Musik bricht ab
    {id: 's7_5', at: '3:35.6', typing: 3.0},
  ],

  fades: [
    {from: '0:00.0', to: '0:01.2', kind: 'in'},
    {from: '3:38.6', to: '3:40.2', kind: 'out'},
  ],

  supers: [
    {from: '0:01.4', to: '0:05.1', lines: ['Mittwoch, 25.', '05:45 Uhr · Nordwerk Maschinenbau GmbH, Ostfriesland']},
  ],
};
