import type {FilmScript, ScriptMessage} from '../../engine/types';

/**
 * FILM 2 – „Gut, dass wir vorbereitet sind“
 * Nur Texte. Wann eine Nachricht erscheint, steht in timing.ts.
 *
 * Spiegel zu Film 1: derselbe Mittwoch, dieselben Probleme, zum Teil wortgleiche
 * Nachrichten (mit „= Film 1“ markiert) – aber diesmal liegt der Notfallordner im Tresor.
 */

const team = (id: string, from: string, clock: string, text: string, day = 'Heute'): ScriptMessage => ({
  id,
  chat: 'team',
  from,
  clock,
  text,
  day,
});

const privat = (id: string, from: string, clock: string, text: string): ScriptMessage => ({
  id,
  chat: 'anna_sven',
  from,
  clock,
  text,
  day: 'Heute',
});

export const script: FilmScript = {
  /**
   * Vorgeschichte: steht schon im Chat. Unterschied zu Film 1 in einer Zeile –
   * Dieters Schlüssel wurde vor dem Urlaub übergeben, so wie es der Plan vorsieht.
   */
  history: [
    team('h1', 'dieter', '16:42', 'Bin dann mal weg. Bis in zwei Wochen! ☀️', 'Gestern'),
    team('h2', 'thomas', '17:05', 'Schönen Urlaub, Dieter! Deinen Schlüssel hat Sven, wie besprochen. 👍', 'Gestern'),
  ],

  messages: [
    // ── Szene 1 · Die verschlossene Tür ──
    team('s1_1', 'markus', '05:47', 'Moin. Stehe vor der Firma. Alles abgeschlossen. Wo ist Thomas?'), // = Film 1
    team('s1_2', 'julia', '05:48', 'Keine Ahnung. Ist sein Auto nicht da?'), // = Film 1
    team('s1_3', 'markus', '05:49', 'Nee. Geht auch nicht ans Handy. 🤷‍♂️'), // = Film 1
    team('s1_4', 'sven', '05:50', 'Bin in zehn Minuten da. Ich habe den Zweitschlüssel.'),
    team('s1_5', 'markus', '05:50', 'Alles klar. Ich sag den anderen Bescheid. 👍'),

    // ── Szene 2 · Annas Nachricht und der Ordner ──
    privat(
      'a1',
      'anna',
      '06:38',
      'Sven, ich konnte mich vorher nicht melden. Thomas wurde heute Nacht mit dem Rettungswagen ins Krankenhaus gebracht. Wir wissen noch nicht, wie lange er ausfällt. 😔',
    ), // = Film 1
    privat('a2', 'anna', '06:41', 'Er hat immer gesagt: Wenn etwas ist, liegt der Notfallordner im Tresor. Du weißt Bescheid.'),
    privat('a3', 'sven', '06:42', 'Danke, Anna. Kümmere dich um Thomas – wir kümmern uns um die Firma.'),

    team('g1', 'sven', '06:52', 'Ich habe gerade mit Anna geschrieben. Thomas ist im Krankenhaus und fällt erst mal auf unbestimmte Zeit aus.'), // = Film 1
    team('g2', 'markus', '06:52', 'Oh Scheiße. 😳'), // = Film 1
    team('g3', 'julia', '06:53', 'Oh nein. Hoffentlich geht es ihm bald besser. ❤️'), // = Film 1
    team('g4', 'sven', '06:54', 'Wir gehen nach dem Notfallplan vor. Der Ordner liegt vor mir – ich melde mich gleich bei jedem von euch.'),
    team('g5', 'katja', '06:55', 'Okay. Dann wissen wir, was zu tun ist.'),

    // ── Szene 3 · Der Lohnlauf ──
    team('l1', 'katja', '08:12', 'Heute muss unser Lohnlauf freigegeben werden. Sven, die Bankvollmacht haben wir beide – kommst du kurz rüber?'),
    team('l2', 'sven', '08:12', 'Bin gleich bei dir.'),
    team('l3', 'katja', '08:21', 'Lohnlauf ist freigegeben. Die Gehälter kommen pünktlich. ✅'),
    team('l4', 'markus', '08:22', 'Sehr gut. 👍'),

    // ── Szene 4 · Der Kunde und das Material ──
    team('k1', 'julia', '09:05', 'Unser größter Kunde erwartet um 10 Uhr eine verbindliche Auftragsbestätigung. Wer entscheidet jetzt?'), // = Film 1
    team('k2', 'sven', '09:06', 'Ich. Thomas hat die Konditionen im Ordner festgehalten. Du kannst bestätigen – ich zeichne gegen.'),
    team('k3', 'markus', '09:12', 'Uns fehlt Material für Auftrag 471. Der Lieferant will erst die offene Rechnung geklärt haben.'), // = Film 1
    team('k4', 'katja', '09:15', 'Rechnung ist bezahlt, Sven hat mit freigegeben. Der Beleg ist beim Lieferanten.'),
    team('k5', 'julia', '09:31', 'Auftragsbestätigung ist raus. Der Kunde hat sich sogar bedankt. 🙌'),
    team('k6', 'markus', '09:34', 'Material kommt heute Mittag. Wir legen los. 💪'),

    // ── Szene 5 · Zugänge und Zuständigkeit ──
    team('t1', 'tobias', '09:41', 'Für die neue Produktionsplanung brauche ich den Adminzugang zur Software. Der liegt bei Thomas.'), // = Film 1
    team('t2', 'sven', '09:42', 'Der Notfallzugang liegt versiegelt im Ordner. Ich bringe dir den Umschlag.'),
    team('t3', 'julia', '09:44', 'Sven, bist du jetzt eigentlich offiziell für Thomas zuständig?'), // = Film 1
    team('t4', 'sven', '09:45', 'Ja. Das steht im Vertretungsplan, und die Vollmacht liegt bei. Thomas hat das alles mit uns durchgesprochen.'),
    team('t5', 'tobias', '09:52', 'Bin drin. Die Planung läuft. ✅'),

    // ── Szene 6 · Entwarnung ──
    privat('e1', 'anna', '09:57', 'Thomas ist wach. Seine erste Frage: „Läuft der Betrieb?“ 🙂'),
    privat('e2', 'sven', '09:58', 'Sag ihm: Es läuft. Er soll in Ruhe gesund werden.'),
    // Punkt 10 Uhr – in Film 1 stand hier „Hat eigentlich irgendjemand einen Plan?“
    team('f1', 'markus', '10:00', 'Gut, dass wir vorbereitet sind.'),
  ],
};
