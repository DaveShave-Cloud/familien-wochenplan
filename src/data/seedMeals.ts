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

/**
 * Wie viele unserer Gerichte auf diesem Geraet noch fehlen.
 *
 * Jedes Geraet hat seinen eigenen Browser-Speicher. Wer die Gerichte geladen
 * hat, als die Liste noch kuerzer war, bekommt die spaeter ergaenzten nicht
 * von selbst -- ohne Hinweis faellt das nur auf, wenn man nachzaehlt.
 */
export function missingSeedMealCount(stored: Array<{ number?: number; name: string }>): number {
  const seeded = (seedFile as { meals: Array<{ number?: number; name: string }> }).meals;
  const numbers = new Set(stored.map((m) => m.number).filter((n): n is number => typeof n === 'number'));
  const names = new Set(stored.map((m) => m.name.trim().toLowerCase()));
  return seeded.filter((m) => {
    if (typeof m.number === 'number' && numbers.has(m.number)) return false;
    return !names.has(m.name.trim().toLowerCase());
  }).length;
}

export async function loadSeedMeals(merchants: Merchant[]): Promise<SeedResult> {
  const byName = new Map(merchants.map((m) => [m.name.toLowerCase().trim(), m.id]));
  const parsed = parseMealImport(seedFile, (name) => byName.get(name.toLowerCase().trim()) ?? null);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  const { added, skipped } = await addMealsWithoutDuplicates(parsed.value);
  return { ok: true, added, skipped };
}
