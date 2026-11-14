import type {FilmSound} from '../../engine/types';

/**
 * FILM 1 – Tongestaltung.
 *
 * Alle Dateien werden von `npm run audio` selbst erzeugt (keine fremden Aufnahmen,
 * keine Lizenzkosten). Sie können einzeln durch eigene Aufnahmen ersetzt werden –
 * gleicher Dateiname in public/audio/ genügt.
 *
 * Musik besteht aus Spuren (Stems), die durchlaufen; hier wird nur gemischt:
 * [Zeit, Pegel]. Dadurch folgt die Musik jedem Umschnitt, ohne neu erzeugt zu werden.
 */
export const sound: FilmSound = {
  chatTones: {
    incoming: 'audio/msg_in.wav',
    outgoing: 'audio/msg_out.wav',
    typing: 'audio/typing.wav',
    incomingVolume: 0.8,
    outgoingVolume: 0.62,
    typingVolume: 0.34,
  },

  musicMaster: 0.92,

  music: [
    {
      // Tiefer Grundton – trägt den ganzen Film, anfangs kaum hörbar.
      id: 'drone',
      file: 'audio/music_drone.wav',
      curve: [
        ['0:00.0', 0], ['0:03.0', 0.1], ['0:15.0', 0.13], ['0:45.0', 0.2], ['0:58.0', 0.26],
        // Szene 3: Musik verstummt, sobald Annas Nachricht eintrifft
        ['0:59.3', 0.26], ['1:02.6', 0], ['1:27.4', 0],
        // Szene 4: kehrt leise zurück
        ['1:31.5', 0.16], ['1:58.0', 0.3], ['2:05.0', 0.36], ['2:42.0', 0.48],
        ['3:09.0', 0.62], ['3:17.0', 0.56], ['3:35.5', 0.6], ['3:35.6', 0],
      ],
    },
    {
      // Weicher Puls ab Szene 2 – ein Herzschlag unter der Oberfläche.
      id: 'pulse',
      file: 'audio/music_pulse.wav',
      curve: [
        ['0:27.0', 0], ['0:34.0', 0.16], ['0:58.0', 0.26], ['0:59.3', 0.26], ['1:01.5', 0], ['1:40.0', 0],
        ['1:58.0', 0.3], ['2:05.0', 0.42], ['2:42.0', 0.55], ['3:09.0', 0.7], ['3:17.0', 0.6],
        ['3:31.0', 0.6], ['3:32.6', 0.34], ['3:35.5', 0.4], ['3:35.6', 0],
      ],
    },
    {
      // Treibendes Achtelmotiv – setzt ein, wenn die Nachrichten schneller kommen.
      id: 'ostinato',
      file: 'audio/music_ostinato.wav',
      curve: [
        ['2:03.0', 0], ['2:08.0', 0.2], ['2:42.0', 0.36], ['3:05.0', 0.5], ['3:09.0', 0.6], ['3:17.0', 0.46],
        ['3:30.6', 0.5], ['3:32.4', 0], // Pause vor der letzten Nachricht: Motiv setzt aus
      ],
    },
    {
      // Uhrticken – die Frist läuft.
      id: 'tick',
      file: 'audio/music_tick.wav',
      curve: [
        ['2:18.0', 0], ['2:24.0', 0.18], ['2:42.0', 0.26], ['3:09.0', 0.3], ['3:17.0', 0.36],
        ['3:35.5', 0.5], ['3:35.6', 0],
      ],
    },
    {
      // Hohe, liegende Spannungsfläche bis zum Höhepunkt im leeren Chefbüro.
      id: 'strings',
      file: 'audio/music_strings.wav',
      curve: [
        ['1:50.0', 0], ['2:05.0', 0.1], ['2:42.0', 0.26], ['3:03.0', 0.42], ['3:09.0', 0.62], ['3:15.0', 0.66],
        ['3:18.5', 0.4], ['3:31.0', 0.42], ['3:35.5', 0.5], ['3:35.6', 0],
      ],
    },
    {
      // Anschwellen in den Höhepunkt (einmalig).
      id: 'riser',
      file: 'audio/music_riser.wav',
      oneShot: true,
      curve: [['3:01.0', 0.5], ['3:09.0', 0.6], ['3:17.0', 0.6]],
    },
  ],

  // Geräusche der Ersatzsequenzen (entfallen je Slot, sobald Realfilm mit Originalton eingesetzt ist)
  ambience: [
    {from: '0:00.0', to: '0:15.3', file: 'audio/amb_night.wav', volume: 0.36, fade: 1.2, slot: 'S1'},
    {from: '0:45.5', to: '0:58.2', file: 'audio/amb_night.wav', volume: 0.36, fade: 0.4, slot: 'S2'},
    {from: '0:58.0', to: '1:01.4', file: 'audio/amb_office.wav', volume: 0.8, fade: 0.3, slot: 'S3-A'},
    {from: '1:28.0', to: '1:32.7', file: 'audio/amb_office.wav', volume: 0.8, fade: 0.3, slot: 'S4-A'},
    {from: '1:58.0', to: '2:05.2', file: 'audio/amb_office.wav', volume: 0.8, fade: 0.3, slot: 'S4-B'},
    {from: '2:17.2', to: '2:20.3', file: 'audio/amb_office.wav', volume: 0.7, fade: 0.2, slot: 'S5-A'},
    {from: '2:35.2', to: '2:38.5', file: 'audio/amb_office.wav', volume: 0.7, fade: 0.2, slot: 'S5-B'},
    {from: '2:38.4', to: '2:42.1', file: 'audio/amb_hall.wav', volume: 0.8, fade: 0.2, slot: 'S5-C'},
    {from: '3:09.0', to: '3:17.1', file: 'audio/amb_office.wav', volume: 0.6, fade: 0.4, slot: 'S6-A'},
  ],

  sfx: [
    {at: '0:05.7', file: 'audio/footsteps.wav', volume: 0.5, slot: 'S1-B'},
    {at: '0:08.75', file: 'audio/door_rattle.wav', volume: 0.6, slot: 'S1-B'},
    {at: '0:10.05', file: 'audio/door_rattle.wav', volume: 0.75, slot: 'S1-B'},
    // S2-B: Schlüssel, Schloss, Tür – dann Hallenlicht
    {at: '0:52.4', file: 'audio/key_lock.wav', volume: 0.6, slot: 'S2-B'},
    {at: '0:55.0', file: 'audio/lights_on.wav', volume: 0.5, slot: 'S2-B'},
    // S3-A: Annas Nachricht trifft ein – das Telefon vibriert auf dem Tisch
    {at: '0:59.3', file: 'audio/vibrate.wav', volume: 0.7, slot: 'S3-A'},
    // S4-A: Katja tippt am Rechner
    {at: '1:28.2', file: 'audio/pc_keys.wav', volume: 0.3, slot: 'S4-A'},
    // S5-A: Tischtelefon im Vertrieb
    {at: '2:17.2', file: 'audio/phone_ring.wav', volume: 0.42, slot: 'S5-A'},
  ],
};
