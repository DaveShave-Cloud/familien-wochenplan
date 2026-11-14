import type {FilmScript, ScriptMessage} from '../../engine/types';

/**
 * FILM 1 – „Plötzlich steht alles still“
 * Nur Texte. Wann eine Nachricht erscheint, steht in timing.ts.
 *
 * `clock` ist die Uhrzeit der Geschichte, wie sie in der Sprechblase steht.
 */

const team = (id: string, from: string, clock: string, text: string, day = 'Heute'): ScriptMessage => ({
  id,
  chat: 'team',
  from,
  clock,
  text,
  day,
});

export const script: FilmScript = {
  /**
   * Vorgeschichte: steht schon im Chat, bevor der Film beginnt (macht die Gruppe
   * glaubwürdig und führt Thomas und Dieter beiläufig ein).
   * NICHT Teil des beauftragten Dialogs – zum Entfernen einfach das Array leeren.
   */
  history: [
    team('h1', 'dieter', '16:42', 'Bin dann mal weg. Bis in zwei Wochen! ☀️', 'Gestern'),
    team('h2', 'thomas', '17:05', 'Schönen Urlaub, Dieter! Ich halte hier die Stellung. 👍', 'Gestern'),
  ],

  messages: [
    // ── Szene 1 ──
    team('s1_1', 'markus', '05:47', 'Moin. Stehe vor der Firma. Alles abgeschlossen. Wo ist Thomas?'),
    team('s1_2', 'julia', '05:48', 'Keine Ahnung. Ist sein Auto nicht da?'),
    team('s1_3', 'markus', '05:49', 'Nee. Geht auch nicht ans Handy. 🤷‍♂️'),

    // ── Szene 2 ──
    team('s2_1', 'sven', '05:51', 'Hat nicht Dieter einen zweiten Schlüssel?'),
    team('s2_2', 'markus', '05:51', 'Dieter ist auf Mallorca. Zwei Wochen Urlaub. 🏖️'),
    team('s2_3', 'julia', '05:52', 'Ernsthaft? Sonst hat keiner einen?'),
    team('s2_4', 'markus', '05:54', 'Hier stehen mittlerweile acht Leute vor der Tür. Was soll ich denen sagen?'),

    // ── Szene 3 ──
    {
      id: 's3_1',
      chat: 'anna_sven',
      from: 'anna',
      clock: '06:38',
      day: 'Heute',
      text: 'Sven, ich konnte mich vorher nicht melden. Thomas wurde heute Nacht mit dem Rettungswagen ins Krankenhaus gebracht. Wir wissen noch nicht, wie lange er ausfällt. 😔',
    },
    team('s3_2', 'sven', '06:44', 'Ich habe gerade mit Anna geschrieben. Thomas ist im Krankenhaus und fällt erst mal auf unbestimmte Zeit aus.'),
    team('s3_3', 'markus', '06:44', 'Oh Scheiße. 😳'),
    team('s3_4', 'julia', '06:45', 'Oh nein. Hoffentlich geht es ihm bald besser. ❤️'),

    // ── Szene 4 ──
    team('s4_1', 'katja', '08:12', 'Leute, wir haben noch ein Problem. Heute muss unser Lohnlauf freigegeben werden.'),
    team('s4_2', 'sven', '08:13', 'Kannst du das nicht machen?'),
    team('s4_3', 'katja', '08:13', 'Vorbereiten ja. Freigeben nicht. Die Bankberechtigung hat nur Thomas.'),
    team('s4_4', 'markus', '08:14', 'Heißt das, unsere Gehälter kommen nicht? 😳'),
    team('s4_5', 'katja', '08:15', 'Ich weiß es gerade nicht.'),

    // ── Szene 5 ──
    team('s5_1', 'julia', '09:21', 'Unser größter Kunde erwartet um 10 Uhr eine verbindliche Auftragsbestätigung. Wer entscheidet jetzt?'),
    team('s5_2', 'sven', '09:22', 'Ich kenne den Auftrag, aber die endgültigen Konditionen hat Thomas verhandelt.'),
    team('s5_3', 'markus', '09:26', 'Uns fehlt Material für Auftrag 471. Der Lieferant will erst die offene Rechnung geklärt haben.'),
    team('s5_4', 'julia', '09:28', 'Der Kunde ruft schon wieder an. 📞'),
    team('s5_5', 'katja', '09:29', 'Ich kann die Zahlung auch nicht selbst freigeben!'),

    // ── Szene 6 ──
    team('s6_1', 'tobias', '09:41', 'Für die neue Produktionsplanung brauche ich den Adminzugang zur Software. Der liegt bei Thomas.'),
    team('s6_2', 'sven', '09:42', 'Gibt es dafür keinen Ersatz?'),
    team('s6_3', 'tobias', '09:42', 'Nicht, dass ich wüsste.'),
    team('s6_4', 'julia', '09:44', 'Sven, bist du jetzt eigentlich offiziell für Thomas zuständig?'),
    team('s6_5', 'sven', '09:46', 'Für den Betrieb schon irgendwie. Aber ich habe keine Ahnung, was ich rechtlich überhaupt entscheiden darf.'),

    // ── Szene 7 ──
    team('s7_1', 'markus', '09:56', 'Was machen wir denn jetzt mit der Produktion?'),
    team('s7_2', 'katja', '09:57', 'Und mit den Löhnen?'),
    team('s7_3', 'julia', '09:57', 'Ich brauche jetzt eine Entscheidung für den Kunden.'),
    team('s7_4', 'sven', '09:58', 'Hat Thomas irgendwo aufgeschrieben, wer was übernehmen soll?'),
    // Punkt 10 Uhr – die Frist des Kunden aus Szene 5 ist erreicht.
    team('s7_5', 'markus', '10:00', 'Hat eigentlich irgendjemand einen Plan?'),
  ],
};
