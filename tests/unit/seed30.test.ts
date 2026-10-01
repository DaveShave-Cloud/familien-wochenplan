/**
 * Prueft unsere 30 echten Familiengerichte gegen den echten Importpfad.
 * Diese Datei ist die Quelle der Wahrheit fuer die Gerichte-Stammdaten --
 * ein Fehler darin faellt sonst erst beim Einkaufen auf.
 */
import { describe, expect, it } from 'vitest';
import seed from '../../data/meals.seed.json';
import { parseMealImport } from '../../src/domain/mealSchema';
import { buildShoppingList } from '../../src/domain/shoppingList';
import { DEFAULT_MERCHANTS } from '../../src/data/defaults';
import type { Meal, MealAssignment } from '../../src/domain/types';

const resolveMerchant = (name: string) =>
  DEFAULT_MERCHANTS.find((m) => m.name.toLowerCase() === name.toLowerCase().trim())?.id ?? null;

const parsed = parseMealImport(seed, resolveMerchant);
if (!parsed.ok) {
  throw new Error(
    'meals.seed.json ist ungueltig:\n' + parsed.errors.map((e) => `${e.path}: ${e.message}`).join('\n'),
  );
}
const meals: Meal[] = parsed.value;

function assign(meal: Meal, date = '2026-09-14', overrides: Partial<MealAssignment> = {}): MealAssignment {
  return {
    id: `a_${meal.id}`,
    weekId: '2026-W38',
    date,
    mealId: meal.id,
    personIds: [],
    position: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function listFor(assignments: MealAssignment[]) {
  return buildShoppingList({
    weekId: '2026-W38',
    assignments,
    meals,
    merchants: DEFAULT_MERCHANTS,
    lineStates: {},
  });
}

const byNumber = (n: number): Meal => {
  const meal = meals.find((m) => m.number === n);
  if (!meal) throw new Error(`Gericht ${n} fehlt`);
  return meal;
};

describe('Die 30 Gerichte', () => {
  it('werden vollstaendig und fehlerfrei importiert', () => {
    expect(meals).toHaveLength(30);
    expect(parsed.ok && parsed.warnings).toEqual([]);
  });

  it('behalten die Nummerierung 1 bis 30 lueckenlos', () => {
    expect(meals.map((m) => m.number).sort((a, b) => a! - b!)).toEqual(
      Array.from({ length: 30 }, (_, i) => i + 1),
    );
  });

  it('tragen die vereinbarten Namen', () => {
    expect(byNumber(1).name).toBe('Nudeln mit Tomatensauce');
    expect(byNumber(9).name).toBe('Nudeln mit Bolognese / Hackfleischgericht');
    expect(byNumber(17).name).toBe('Pizza Margherita oder Spinatpizza');
    expect(byNumber(24).name).toBe('Bratkartoffeln mit Weckewerk, Roter Bete und Oma-Hilde-Salat');
    expect(byNumber(30).name).toBe('Lachspasta mit Tomaten-Sahnesoße');
  });

  it('haben durchweg benannte Zutaten und gueltige IDs', () => {
    for (const meal of meals) {
      // Nur "Essen gehen" und "liefern lassen" duerfen ohne Zutaten sein.
      if (meal.noShopping) {
        expect(meal.ingredients).toHaveLength(0);
        continue;
      }
      expect(meal.ingredients.length).toBeGreaterThan(0);
      for (const ingredient of meal.ingredients) {
        expect(ingredient.name.trim()).not.toBe('');
        expect(ingredient.id).toMatch(/^ing_/);
      }
    }
  });

  it('erfindet keine Haendlerzuordnungen', () => {
    // Bezugsquellen sind uns nicht bekannt und bleiben deshalb offen.
    for (const meal of meals) {
      for (const ingredient of meal.ingredients) {
        expect(ingredient.merchantId).toBeNull();
      }
    }
  });
});

describe('Mengenangaben', () => {
  it('erhaelt Mengenbereiche als Bereich', () => {
    const tomaten = byNumber(1).ingredients.find((i) => i.name === 'Passierte Tomaten');
    expect(tomaten?.amount).toEqual({ kind: 'range', min: 700, max: 800 });
  });

  it('macht aus unbezifferten Zutaten "offen" und nicht 0', () => {
    const oel = byNumber(1).ingredients.find((i) => i.name === 'Öl');
    expect(oel?.amount).toEqual({ kind: 'open' });
    expect(oel?.pantryStaple).toBe(true);
  });

  it('haelt die Portionsbasis fest, wo sie bekannt ist', () => {
    expect(byNumber(1).servings).toBe(4);
    expect(byNumber(13).servings).toBe(2);
  });

  it('markiert nicht bezifferte Portionsbasen ausdruecklich als offen', () => {
    // 14 und 15: Basis war in unserer Liste nie beziffert.
    expect(byNumber(14).servings).toBeNull();
    expect(byNumber(15).servings).toBeNull();
  });
});

describe('Varianten und Alternativen', () => {
  it('setzt bei "Reis oder Kartoffeln" nur die gewaehlte Beilage auf die Liste', () => {
    const meal = byNumber(10);
    const beilage = meal.choiceGroups!.find((g) => g.name === 'Beilage')!;
    const reis = beilage.options.find((o) => o.label === 'Reis')!;

    const mitKartoffeln = listFor([assign(meal)]);
    const namenK = mitKartoffeln.allItems.map((i) => i.name);
    expect(namenK).toContain('Kartoffeln');
    expect(namenK).not.toContain('Reis');

    const mitReis = listFor([assign(meal, '2026-09-14', { choices: { [beilage.id]: [reis.id] } })]);
    const namenR = mitReis.allItems.map((i) => i.name);
    expect(namenR).toContain('Reis');
    expect(namenR).not.toContain('Kartoffeln');
  });

  it('trennt Fertigprodukt und selbst gekochte Variante (Nasi Goreng)', () => {
    const meal = byNumber(14);
    const gruppe = meal.choiceGroups![0]!;
    const selbst = gruppe.options.find((o) => o.label.startsWith('B'))!;

    const fertig = listFor([assign(meal)]);
    expect(fertig.allItems.map((i) => i.name)).toEqual(['Nasi Goreng (Fertigprodukt)']);

    const gekocht = listFor([assign(meal, '2026-09-14', { choices: { [gruppe.id]: [selbst.id] } })]);
    const namen = gekocht.allItems.map((i) => i.name);
    expect(namen).toContain('Reis (trocken)');
    expect(namen).not.toContain('Nasi Goreng (Fertigprodukt)');
  });

  it('haelt normale Nudeln und Dinkelnudeln getrennt', () => {
    const meal = byNumber(1);
    const gruppe = meal.choiceGroups![0]!;
    const dinkel = gruppe.options.find((o) => o.label.startsWith('Dinkel'))!;

    const normal = listFor([assign(meal)]);
    expect(normal.allItems.map((i) => i.name)).toContain('Nudeln');

    const mitDinkel = listFor([assign(meal, '2026-09-14', { choices: { [gruppe.id]: [dinkel.id] } })]);
    const namen = mitDinkel.allItems.map((i) => i.name);
    expect(namen).toContain('Dinkelnudeln');
    expect(namen).not.toContain('Nudeln');
  });

  it('laesst optionale Zutaten weg, solange sie nicht gewaehlt sind', () => {
    const meal = byNumber(1);
    const kaese = meal.ingredients.find((i) => i.name === 'Geriebener Käse')!;
    expect(kaese.optional).toBe(true);

    const ohne = listFor([assign(meal)]);
    expect(ohne.allItems.map((i) => i.name)).not.toContain('Geriebener Käse');
    // Auch nicht im Vorratsblock, denn sie wurde nicht gewaehlt.
    expect(ohne.pantryChecks.map((i) => i.name)).not.toContain('Geriebener Käse');

    const mit = listFor([assign(meal, '2026-09-14', { optionalIngredientIds: [kaese.id] })]);
    expect(mit.pantryChecks.concat(mit.allItems).map((i) => i.name)).toContain('Geriebener Käse');
  });
});

describe('Gerichte ohne Einkauf (19, 21)', () => {
  it('sind als noShopping gekennzeichnet und haben keine Zutaten', () => {
    for (const nr of [19, 21]) {
      expect(byNumber(nr).noShopping).toBe(true);
      expect(byNumber(nr).ingredients).toHaveLength(0);
    }
  });

  it('bringen nichts auf die Einkaufsliste', () => {
    const list = listFor([assign(byNumber(19), '2026-09-14'), assign(byNumber(21), '2026-09-15')]);
    expect(list.allItems).toHaveLength(0);
    expect(list.pantryChecks).toHaveLength(0);
    expect(list.groups).toHaveLength(0);
  });

  it('stoeren einen Einkauf aus anderen Gerichten nicht', () => {
    const list = listFor([assign(byNumber(1), '2026-09-14'), assign(byNumber(19), '2026-09-15')]);
    expect(list.allItems.map((i) => i.name)).toContain('Nudeln');
  });
});

describe('Neue Gerichte 18 bis 30', () => {
  it('fuehrt den Oma-Hilde-Salat in 22 und 24 mit Schmand und Kraeutern', () => {
    for (const nr of [22, 24]) {
      const namen = byNumber(nr).ingredients.map((i) => i.name);
      expect(namen).toContain('Schmand');
      expect(namen).toContain('Blattsalat');
      expect(namen).toContain('Kräuter');
    }
  });

  it('kauft Weckewerk als einen Posten, ohne es zu zerlegen', () => {
    const weckewerk = byNumber(24).ingredients.find((i) => i.name === 'Weckewerk');
    expect(weckewerk).toBeDefined();
    expect(weckewerk!.note).toContain('fertig gekauft');
  });

  it('bietet bei den Nudelgerichten 25, 28 und 30 Dinkelnudeln an', () => {
    for (const nr of [25, 28, 30]) {
      const gruppe = byNumber(nr).choiceGroups?.find((g) => g.name === 'Nudelart');
      expect(gruppe, `Gericht ${nr}`).toBeDefined();
      expect(gruppe!.options.map((o) => o.label).join(' ')).toContain('Dinkel');
    }
  });

  it('beschriftet fleischfreie Varianten neutral, nicht personenbezogen', () => {
    for (const meal of meals) {
      for (const group of meal.choiceGroups ?? []) {
        for (const option of group.options) {
          expect(option.label, `${meal.number}. ${meal.name}`).not.toMatch(/Sandra|Timo|Mika|Thore/);
        }
      }
    }
  });

  it('laesst bei der fleischfreien Variante kein Fleisch auf die Liste', () => {
    for (const nr of [23, 28, 29]) {
      const meal = byNumber(nr);
      const gruppe = meal.choiceGroups!.find((g) => g.name === 'Variante')!;
      const ohne = gruppe.options.find((o) => o.label.toLowerCase().includes('ohne'))!;
      const list = listFor([assign(meal, '2026-09-14', { choices: { [gruppe.id]: [ohne.id] } })]);
      const namen = list.allItems.map((i) => i.name).join(' | ');
      expect(namen, `Gericht ${nr}`).not.toMatch(/Hähnchenbrustfilet|Rinderhack/);
    }
  });

  it('setzt bei 22 nur die gewaehlte Beilage auf die Liste', () => {
    const meal = byNumber(22);
    const gruppe = meal.choiceGroups!.find((g) => g.name === 'Beilage')!;
    const quinoa = gruppe.options.find((o) => o.label === 'Quinoa')!;

    const mitReis = listFor([assign(meal)]);
    expect(mitReis.allItems.map((i) => i.name)).toContain('Reis');
    expect(mitReis.allItems.map((i) => i.name)).not.toContain('Quinoa');

    const mitQuinoa = listFor([assign(meal, '2026-09-14', { choices: { [gruppe.id]: [quinoa.id] } })]);
    expect(mitQuinoa.allItems.map((i) => i.name)).toContain('Quinoa');
    expect(mitQuinoa.allItems.map((i) => i.name)).not.toContain('Reis');
  });

  it('haelt Apfelmus und Marmelade bei 26 optional', () => {
    const meal = byNumber(26);
    for (const name of ['Apfelmus', 'Marmelade', 'Zucker']) {
      expect(meal.ingredients.find((i) => i.name === name)?.optional, name).toBe(true);
    }
    const list = listFor([assign(meal)]);
    expect(list.allItems.map((i) => i.name)).not.toContain('Apfelmus');
    expect(list.allItems.map((i) => i.name)).toContain('Mehl');
  });

  it('fuehrt Zutaten ueber alte und neue Gerichte zusammen', () => {
    // Gericht 1 (500 g Nudeln) und 30 (500 g Nudeln) -> 1 kg.
    const list = listFor([assign(byNumber(1), '2026-09-14'), assign(byNumber(30), '2026-09-16')]);
    const nudeln = list.allItems.find((i) => i.name === 'Nudeln');
    expect(nudeln?.amountUpper).toBe(1);
    expect(nudeln?.unit).toBe('kg');
  });
});

describe('Einkaufsliste aus echten Gerichten', () => {
  it('fuehrt Nudeln aus Gericht 1 und 9 zusammen und behaelt den Bereich', () => {
    const list = listFor([assign(byNumber(1), '2026-09-14'), assign(byNumber(9), '2026-09-16')]);

    const nudeln = list.allItems.find((i) => i.name === 'Nudeln');
    // 500 g + 500 g = 1000 g, als 1 kg angezeigt.
    expect(nudeln?.amountUpper).toBe(1);
    expect(nudeln?.unit).toBe('kg');

    const tomaten = list.allItems.find((i) => i.name === 'Passierte Tomaten');
    // 700-800 ml zweimal = 1,4-1,6 l.
    expect(tomaten?.isRange).toBe(true);
    expect(tomaten?.amount).toBeCloseTo(1.4);
    expect(tomaten?.amountUpper).toBeCloseTo(1.6);
    expect(tomaten?.unit).toBe('l');
  });

  it('summiert Oel und Gewuerze nicht, sondern listet sie zur Bestandspruefung', () => {
    const list = listFor([assign(byNumber(1), '2026-09-14'), assign(byNumber(9), '2026-09-16')]);
    expect(list.allItems.map((i) => i.name)).not.toContain('Öl');
    expect(list.pantryChecks.map((i) => i.name)).toContain('Öl');
  });

  it('plant fuer Sandras Salat kein Hackfleisch ein (Beispiel aus der Vorgabe)', () => {
    // Timo, Mika, Thore essen Gericht 9, Sandra Gericht 7.
    const bolo = assign(byNumber(9), '2026-09-14', {
      id: 'a_bolo',
      personIds: ['per_timo', 'per_mika', 'per_thore'],
    });
    const salat = assign(byNumber(7), '2026-09-14', {
      id: 'a_salat',
      position: 1,
      personIds: ['per_sandra'],
    });
    const list = listFor([bolo, salat]);
    const namen = list.allItems.map((i) => i.name);

    expect(namen).toContain('Rinderhack');
    expect(namen).toContain('Käse');
    // Der Salat bringt kein Fleisch mit; Fisch ist nicht vorgewaehlt.
    expect(namen).not.toContain('Fisch');

    const hack = list.allItems.find((i) => i.name === 'Rinderhack');
    expect(hack?.sources).toHaveLength(1);
    expect(hack?.sources[0]!.mealName).toContain('9.');
  });

  it('laesst Hackfleisch weg, wenn die fleischlose Variante gewaehlt ist', () => {
    const meal = byNumber(9);
    const gruppe = meal.choiceGroups![0]!;
    const ohne = gruppe.options.find((o) => o.label.includes('Ohne'))!;
    const list = listFor([assign(meal, '2026-09-14', { choices: { [gruppe.id]: [ohne.id] } })]);
    expect(list.allItems.map((i) => i.name)).not.toContain('Rinderhack');
    expect(list.allItems.map((i) => i.name)).toContain('Nudeln');
  });

  it('ordnet alles der Gruppe "Unklar" zu, solange keine Haendler bekannt sind', () => {
    const list = listFor([assign(byNumber(5))]);
    expect(list.groups).toHaveLength(1);
    expect(list.groups[0]!.merchantName).toBe('Unklar');
  });
});
