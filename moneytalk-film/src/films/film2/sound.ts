import type {FilmSound} from '../../engine/types';

/**
 * FILM 2 – Tongestaltung.
 *
 * Beginnt mit derselben dunklen Grundspannung wie Film 1 und verstummt ebenfalls bei
 * Annas Nachricht. Mit dem Satz „… liegt der Notfallordner im Tresor“ setzt eine warme
 * Fläche in D-Dur ein (Film 1 stand in d-Moll – gleiche Tonart, andere Farbe). Sie wächst
 * mit jedem gelösten Problem und löst sich mit der letzten Nachricht in einem Schlussakkord.
 *
 * Alle Dateien erzeugt `npm run audio`.
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
      // dieselbe dunkle Grundspannung wie in Film 1 – bis Annas Nachricht
      id: 'drone',
      file: 'audio/music_drone.wav',
      curve: [
        ['0:00.0', 0], ['0:03.0', 0.1], ['0:15.0', 0.13], ['0:28.0', 0.17],
        ['0:31.0', 0.11], // Sven hat den Schlüssel – der Druck lässt nach
        ['0:39.0', 0.08], ['0:46.0', 0.12], ['0:47.3', 0.16], ['0:50.6', 0],
      ],
    },
    {
      // warme Fläche: setzt ein, sobald der Notfallordner erwähnt wird
      id: 'flaeche',
      file: 'audio/music2_pad.wav',
      curve: [
        ['0:57.5', 0], ['1:03.0', 0.11], ['1:08.4', 0.22], ['1:12.0', 0.35], ['1:16.4', 0.33], ['1:20.0', 0.22],
        ['1:44.9', 0.24], ['1:59.9', 0.29], ['2:04.4', 0.33], ['2:11.0', 0.29], ['2:34.8', 0.33], ['2:46.0', 0.37],
        ['2:50.0', 0.4], ['3:14.8', 0.4], ['3:17.0', 0.55], ['3:20.8', 0.51], ['3:22.0', 0.33], ['3:31.4', 0.35],
        ['3:35.2', 0.37], ['3:36.4', 0],
      ],
    },
    {
      // ruhiges Klaviermotiv: tritt in den Filmszenen hervor, hält sich unter dem Chat zurück
      id: 'motiv',
      file: 'audio/music2_motif.wav',
      curve: [
        ['1:08.4', 0], ['1:10.0', 0.31], ['1:16.4', 0.36], ['1:18.0', 0.19], ['1:44.9', 0.19], ['1:46.0', 0.31],
        ['1:48.9', 0.31], ['1:50.0', 0.18], ['1:59.9', 0.19], ['2:01.0', 0.34], ['2:04.4', 0.34], ['2:05.5', 0.2],
        ['2:34.8', 0.22], ['2:36.0', 0.34], ['2:38.0', 0.24], ['2:46.0', 0.26], ['2:47.0', 0.38], ['2:50.0', 0.38],
        ['2:51.0', 0.24], ['3:14.8', 0.26], ['3:16.0', 0.48], ['3:20.8', 0.48], ['3:22.0', 0.24], ['3:35.0', 0.26],
        ['3:36.2', 0],
      ],
    },
    {
      // Bass: gibt ab dem Lohnlauf Boden
      id: 'bass',
      file: 'audio/music2_bass.wav',
      curve: [
        ['1:44.9', 0], ['1:50.0', 0.2], ['3:14.8', 0.27], ['3:20.8', 0.31], ['3:22.0', 0.23], ['3:35.0', 0.23],
        ['3:36.2', 0],
      ],
    },
    {
      // leichter Achtelpuls: Der Betrieb kommt in Bewegung
      id: 'bewegung',
      file: 'audio/music2_rhythm.wav',
      curve: [
        ['2:11.0', 0], ['2:16.0', 0.14], ['2:46.0', 0.2], ['2:50.0', 0.26], ['3:14.8', 0.28], ['3:17.0', 0.34],
        ['3:20.8', 0.3], ['3:22.0', 0.12], ['3:31.4', 0.12], ['3:33.0', 0],
      ],
    },
    {
      // Schlussakkord mit der letzten Nachricht (einmalig)
      id: 'schluss',
      file: 'audio/music2_final.wav',
      oneShot: true,
      // klingt ins Schwarzbild aus und ist vor dem Filmende vollständig verklungen
      curve: [['3:36.0', 0.8], ['3:41.2', 0.8], ['3:44.4', 0]],
    },
  ],

  // Geräusche der Ersatzsequenzen (entfallen je Slot, sobald Realfilm mit Originalton eingesetzt ist)
  ambience: [
    {from: '0:00.0', to: '0:15.3', file: 'audio/amb_night.wav', volume: 0.36, fade: 1.2, slot: 'S1'},
    {from: '0:39.0', to: '0:46.2', file: 'audio/amb_night.wav', volume: 0.36, fade: 0.4, slot: 'S2'},
    {from: '0:46.0', to: '0:49.4', file: 'audio/amb_office.wav', volume: 0.8, fade: 0.3, slot: 'S3-A'},
    {from: '1:08.4', to: '1:16.6', file: 'audio/amb_office.wav', volume: 0.7, fade: 0.3, slot: 'N1'},
    {from: '1:44.9', to: '1:49.1', file: 'audio/amb_office.wav', volume: 0.8, fade: 0.3, slot: 'S4-A'},
    {from: '1:59.9', to: '2:04.6', file: 'audio/amb_office.wav', volume: 0.8, fade: 0.3, slot: 'N2'},
    {from: '2:11.0', to: '2:13.7', file: 'audio/amb_office.wav', volume: 0.7, fade: 0.2, slot: 'V1'},
    {from: '2:34.8', to: '2:38.1', file: 'audio/amb_office.wav', volume: 0.7, fade: 0.2, slot: 'N3'},
    {from: '2:46.0', to: '2:50.1', file: 'audio/machine_run.wav', volume: 0.5, fade: 0.25, slot: 'N4'},
    {from: '3:14.8', to: '3:20.9', file: 'audio/amb_office.wav', volume: 0.5, fade: 0.4, slot: 'N5'},
  ],

  sfx: [
    // Szene 1 wie in Film 1
    {at: '0:05.7', file: 'audio/footsteps.wav', volume: 0.5, slot: 'S1-B'},
    {at: '0:08.75', file: 'audio/door_rattle.wav', volume: 0.6, slot: 'S1-B'},
    {at: '0:10.05', file: 'audio/door_rattle.wav', volume: 0.75, slot: 'S1-B'},
    // S2-B: Sven schließt auf, das Hallenlicht geht an
    {at: '0:40.4', file: 'audio/key_lock.wav', volume: 0.6, slot: 'S2-B'},
    {at: '0:43.0', file: 'audio/lights_on.wav', volume: 0.5, slot: 'S2-B'},
    // S3-A: Annas Nachricht – das Telefon vibriert auf dem Tisch
    {at: '0:47.3', file: 'audio/vibrate.wav', volume: 0.7, slot: 'S3-A'},
    // N1: Tresor geht auf, der Ordner wird aufgeschlagen
    {at: '1:08.55', file: 'audio/safe_open.wav', volume: 0.6, slot: 'N1'},
    {at: '1:11.9', file: 'audio/paper.wav', volume: 0.55, slot: 'N1'},
    // S4-A / N2: Katja am Rechner, dann die Bestätigung der Freigabe
    {at: '1:45.1', file: 'audio/pc_keys.wav', volume: 0.3, duration: 3.6, slot: 'S4-A'},
    {at: '2:00.0', file: 'audio/pc_keys.wav', volume: 0.26, duration: 1.5, slot: 'N2'},
    {at: '2:01.97', file: 'audio/confirm.wav', volume: 0.45, slot: 'N2'},
    // V1: das Telefon im Vertrieb klingelt – der Kunde
    {at: '2:11.0', file: 'audio/phone_ring.wav', volume: 0.42, duration: 2.6, slot: 'V1'},
  ],
};
