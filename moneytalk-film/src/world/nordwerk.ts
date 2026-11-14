import type {World} from '../engine/types';

/**
 * Die Welt der Nordwerk Maschinenbau GmbH – Figuren und Chats.
 * Gilt unverändert für Film 1 und Film 2.
 *
 * Profilbilder: Solange keine Fotos der Darsteller vorliegen, werden gezeichnete
 * Platzhalter verwendet. Echtes Foto einsetzen:
 *   avatar: {type: 'photo', src: 'avatars/markus.jpg'}   (Datei in public/avatars/)
 */
export const nordwerk: World = {
  characters: {
    thomas: {
      id: 'thomas',
      name: 'Thomas',
      role: 'Geschäftsführer',
      nameColor: '#8fb8ff',
      avatar: {type: 'portrait', bg: '#3b4a5c', skin: '#e2b594', hair: '#b9bcc0', hairStyle: 'short', shirt: '#f1f3f5'},
    },
    anna: {
      id: 'anna',
      name: 'Anna',
      role: 'Ehefrau von Thomas',
      nameColor: '#ff9ec2',
      avatar: {type: 'portrait', bg: '#c9b79c', skin: '#eac3a4', hair: '#b98a4e', hairStyle: 'long', shirt: '#5b7f8c'},
    },
    markus: {
      id: 'markus',
      name: 'Markus',
      role: 'Produktion',
      nameColor: '#6cc7f6',
      avatar: {type: 'portrait', bg: '#55606b', skin: '#d9a784', hair: '#2f3a47', hairStyle: 'cap', shirt: '#23364d', beard: '#4a372b'},
    },
    sven: {
      id: 'sven',
      name: 'Sven',
      role: 'Betriebsleiter',
      nameColor: '#7fd1c7',
      avatar: {type: 'portrait', bg: '#7d8f86', skin: '#e0b08f', hair: '#5a4332', hairStyle: 'sidepart', shirt: '#2d4a66'},
    },
    katja: {
      id: 'katja',
      name: 'Katja',
      role: 'Buchhaltung',
      nameColor: '#c7a0ff',
      avatar: {type: 'portrait', bg: '#8a6f8f', skin: '#edc8ab', hair: '#3b2a22', hairStyle: 'bob', shirt: '#e9e2d6', glasses: true},
    },
    julia: {
      id: 'julia',
      name: 'Julia',
      role: 'Vertrieb',
      nameColor: '#ffd166',
      avatar: {type: 'portrait', bg: '#b9785a', skin: '#e6b998', hair: '#6b3f2a', hairStyle: 'bun', shirt: '#1f2f45'},
    },
    tobias: {
      id: 'tobias',
      name: 'Tobias',
      role: 'IT',
      nameColor: '#5fe0b0',
      avatar: {type: 'portrait', bg: '#3f6f73', skin: '#e4b796', hair: '#1f1b18', hairStyle: 'short', shirt: '#3a3f47', glasses: true},
    },
    dieter: {
      id: 'dieter',
      name: 'Dieter',
      role: 'Mitarbeiter mit Zweitschlüssel',
      nameColor: '#ff9d6c',
      avatar: {type: 'lighthouse'},
    },
  },
  chats: {
    team: {
      id: 'team',
      kind: 'group',
      title: 'Nordwerk Team',
      members: ['dieter', 'julia', 'katja', 'markus', 'sven', 'thomas', 'tobias'],
      avatar: {type: 'logo'},
    },
    anna_sven: {
      id: 'anna_sven',
      kind: 'direct',
      // So hat Sven den Kontakt gespeichert – erklärt dem Publikum nebenbei, wer Anna ist.
      title: 'Anna (Thomas’ Frau)',
      members: ['anna', 'sven'],
      avatar: {type: 'portrait', bg: '#c9b79c', skin: '#eac3a4', hair: '#b98a4e', hairStyle: 'long', shirt: '#5b7f8c'},
      subtitle: 'zuletzt online heute um 06:39',
      notice:
        'Nachrichten und Anrufe sind Ende-zu-Ende-verschlüsselt. Nur die Personen in diesem Chat können sie lesen oder anhören.',
    },
  },
};
