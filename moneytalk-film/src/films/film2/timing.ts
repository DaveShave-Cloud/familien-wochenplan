import type {FilmTiming} from '../../engine/types';

/**
 * FILM 2 – Zeitablauf (Schnittplan in Datenform). Aufbau wie bei Film 1.
 *
 * Die ersten 30 Sekunden laufen bildgleich zu Film 1 (gleiche Einstellungen, gleiche
 * Nachrichten, gleiche Zeitpunkte) – der Unterschied beginnt mit Svens Antwort.
 * Nach Änderungen `npm run check` ausführen.
 */
export const timing: FilmTiming = {
  fps: 30,
  width: 1920,
  height: 1080,
  duration: '3:45.0',

  shots: [
    // ── Szene 1 · wie in Film 1: Markus vor verschlossener Tür ──
    {kind: 'cutscene', id: 'S1-A', from: '0:00.0', to: '0:05.5', slot: 'S1-A'},
    {kind: 'cutscene', id: 'S1-B', from: '0:05.5', to: '0:11.5', slot: 'S1-B'},
    {kind: 'cutscene', id: 'S1-C', from: '0:11.5', to: '0:15.0', slot: 'S1-C'},
    {kind: 'chat', id: 'C1', from: '0:15.0', to: '0:39.0', chat: 'team', owner: 'sven', backdrop: 'nacht', clock: '05:47'},
    {kind: 'cutscene', id: 'S2-B', from: '0:39.0', to: '0:46.0', slot: 'S2-B'},

    // ── Szene 2 · Annas Nachricht – und der Ordner im Tresor ──
    {kind: 'cutscene', id: 'S3-A', from: '0:46.0', to: '0:49.2', slot: 'S3-A'},
    {kind: 'chat', id: 'C2a', from: '0:49.2', to: '1:08.4', chat: 'anna_sven', owner: 'sven', backdrop: 'morgen', clock: '06:41'},
    {kind: 'cutscene', id: 'N1', from: '1:08.4', to: '1:16.4', slot: 'N1'},
    {kind: 'chat', id: 'C2b', from: '1:16.4', to: '1:44.9', chat: 'team', owner: 'sven', backdrop: 'morgen', clock: '06:51'},

    // ── Szene 3 · Der Lohnlauf: Freigabe zu zweit ──
    {kind: 'cutscene', id: 'S4-A', from: '1:44.9', to: '1:48.9', slot: 'S4-A'},
    {kind: 'chat', id: 'C3a', from: '1:48.9', to: '1:59.9', chat: 'team', owner: 'sven', backdrop: 'tag', clock: '08:12'},
    {kind: 'cutscene', id: 'N2', from: '1:59.9', to: '2:04.4', slot: 'N2'},
    {kind: 'chat', id: 'C3b', from: '2:04.4', to: '2:11.0', chat: 'team', owner: 'sven', backdrop: 'tag', clock: '08:21'},

    // ── Szene 4 · Der Kunde und das Material ──
    {kind: 'cutscene', id: 'V1', from: '2:11.0', to: '2:13.6', slot: 'V1'},
    {kind: 'chat', id: 'C4a', from: '2:13.6', to: '2:34.8', chat: 'team', owner: 'sven', backdrop: 'tag', clock: '09:05'},
    {kind: 'cutscene', id: 'N3', from: '2:34.8', to: '2:38.0', slot: 'N3'},
    {kind: 'chat', id: 'C4b', from: '2:38.0', to: '2:46.0', chat: 'team', owner: 'sven', backdrop: 'zuversicht', clock: '09:31'},
    {kind: 'cutscene', id: 'N4', from: '2:46.0', to: '2:50.0', slot: 'N4'},

    // ── Szene 5 · Zugänge und Zuständigkeit ──
    {kind: 'chat', id: 'C5', from: '2:50.0', to: '3:14.8', chat: 'team', owner: 'sven', backdrop: 'zuversicht', clock: '09:41'},
    {kind: 'cutscene', id: 'N5', from: '3:14.8', to: '3:20.8', slot: 'N5'},

    // ── Szene 6 · Entwarnung – „Gut, dass wir vorbereitet sind.“ ──
    {kind: 'chat', id: 'C6a', from: '3:20.8', to: '3:31.4', chat: 'anna_sven', owner: 'sven', backdrop: 'zuversicht', clock: '09:57'},
    {kind: 'chat', id: 'C6b', from: '3:31.4', to: '3:41.6', chat: 'team', owner: 'sven', backdrop: 'zuversicht', clock: '09:59', enter: 'slide'},
    {kind: 'black', id: 'ENDE', from: '3:41.6', to: '3:45.0'},
  ],

  cues: [
    // Szene 1 – bis hierhin zeitgleich mit Film 1
    {id: 's1_1', at: '0:17.8', typing: 2.0},
    {id: 's1_2', at: '0:22.3', typing: 1.7},
    {id: 's1_3', at: '0:25.8', typing: 1.6},
    // … ab hier läuft es anders
    {id: 's1_4', at: '0:30.6', typing: 2.2},
    {id: 's1_5', at: '0:34.0', typing: 1.5},

    // Szene 2 – Annas erste Nachricht trifft während der Büro-Einstellung ein (Vibration)
    {id: 'a1', at: '0:47.3', silent: true},
    {id: 'a2', at: '0:58.2', typing: 2.0},
    {id: 'a3', at: '1:04.2', typing: 2.6},
    {id: 'g1', at: '1:21.5', typing: 4.2, compose: [[0, 0], [0.3, 0.34], [0.46, 0.34], [1, 1]]},
    {id: 'g2', at: '1:26.1', typing: 1.4},
    {id: 'g3', at: '1:28.5', typing: 1.5},
    {id: 'g4', at: '1:35.3', typing: 3.4},
    {id: 'g5', at: '1:40.7', typing: 1.4},

    // Szene 3
    {id: 'l1', at: '1:50.5', typing: 1.4},
    {id: 'l2', at: '1:56.7', typing: 1.1},
    {id: 'l3', at: '2:05.3', typing: 0.8},
    {id: 'l4', at: '2:08.7', typing: 1.0},

    // Szene 4
    {id: 'k1', at: '2:14.4', typing: 0.7},
    {id: 'k2', at: '2:19.8', typing: 2.4},
    {id: 'k3', at: '2:24.1', typing: 1.3},
    {id: 'k4', at: '2:29.9', typing: 1.4},
    {id: 'k5', at: '2:38.7', typing: 0.7},
    {id: 'k6', at: '2:42.6', typing: 1.0},

    // Szene 5
    {id: 't1', at: '2:51.4', typing: 1.3},
    {id: 't2', at: '2:57.6', typing: 2.0},
    {id: 't3', at: '3:01.2', typing: 1.3},
    {id: 't4', at: '3:06.8', typing: 3.0},
    {id: 't5', at: '3:11.7', typing: 1.2},

    // Szene 6
    {id: 'e1', at: '3:22.0', typing: 1.0},
    {id: 'e2', at: '3:27.0', typing: 2.2},
    // wie in Film 1: kurze Pause – „Markus schreibt …“ – die letzte Nachricht. Diesmal löst sich die Musik auf.
    {id: 'f1', at: '3:36.0', typing: 3.0},
  ],

  fades: [
    {from: '0:00.0', to: '0:01.2', kind: 'in'},
    {from: '3:39.6', to: '3:41.6', kind: 'out'},
  ],

  supers: [
    {from: '0:01.4', to: '0:05.1', lines: ['Derselbe Mittwoch.', '05:45 Uhr · Nordwerk Maschinenbau GmbH, Ostfriesland']},
  ],
};
