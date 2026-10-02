/**
 * Laden unserer 30 Familiengerichte.
 *
 * Liegt als eigener Baustein vor, damit sowohl die Gerichte-Verwaltung als
 * auch der Leerzustand im Wochenplan denselben Weg nehmen -- man soll die
 * Gerichte dort laden koennen, wo einem auffaellt, dass sie fehlen.
 */
import seedFile from '../../data/meals.seed.json';
import { parseMealImport } from '../domain/mealSchema';
import type { ValidationIssue } from '../domain/mealSchema';
import type { Meal, Merchant } from '../domain/types';
import { addMealsWithoutDuplicates } from './repositories';

export type SeedResult =
  | { ok: true; added: Meal[]; skipped: Meal[] }
  | { ok: false; errors: ValidationIssue[] };

/** Anzahl der mitgelieferten Gerichte -- fuer Beschriftungen. */
export const SEED_MEAL_COUNT: number = (seedFile as { meals: unknown[] }).meals.length;

export async function loadSeedMeals(merchants: Merchant[]): Promise<SeedResult> {
  const byName = new Map(merchants.map((m) => [m.name.toLowerCase().trim(), m.id]));
  const parsed = parseMealImport(seedFile, (name) => byName.get(name.toLowerCase().trim()) ?? null);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  const { added, skipped } = await addMealsWithoutDuplicates(parsed.value);
  return { ok: true, added, skipped };
}
