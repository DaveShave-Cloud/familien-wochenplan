/**
 * Hauptansicht: links der Wochenplan (Mo–So), rechts der Gerichte-Pool.
 *
 * Zuordnen geht auf zwei Wegen, die beide vollwertig sind:
 *  1. Ziehen (Maus, Stift, Finger) -- dnd-kit mit Touch-Sensor.
 *  2. Tippen: Gericht antippen (vormerken), dann Tag antippen.
 * Weg 2 ist nicht nur Notloesung, sondern auf dem iPad oft der schnellere Weg
 * und die barrierefreie Alternative zum Ziehen.
 */
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { ID, Meal, MealAssignment, Person } from '../../domain/types';
import { WEEKDAY_SHORT, formatDayMonthDE, todayISO, weekDates, weekdayName } from '../../domain/week';
import {
  addAssignment,
  moveAssignment,
  removeAssignment,
  setChoice,
  toggleOptionalIngredient,
  togglePerson,
} from '../../data/repositories';
import { effectiveChoices } from '../../domain/shoppingList';
import { SEED_MEAL_COUNT, loadSeedMeals } from '../../data/seedMeals';
import { useApp, useAppData, useMealMap, useWeek } from '../store';
import { WeekNavigator } from '../components/WeekNavigator';
import { PersonBadges, PersonChip } from '../components/PersonChip';
import { weekdayTint } from '../theme';

/* ------------------------------ Gerichte-Pool ---------------------------- */

function PoolCard({ meal, armed, onArm }: { meal: Meal; armed: boolean; onArm: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool:${meal.id}`,
    data: { kind: 'pool', mealId: meal.id },
  });

  return (
    <div
      ref={setNodeRef}
      data-draggable="true"
      data-testid={`pool-meal-${meal.id}`}
      className={`card h-11 shrink-0 overflow-hidden transition-shadow ${isDragging ? 'opacity-40' : ''} ${
        armed ? 'ring-3 ring-[color:var(--color-terracotta)]' : ''
      }`}
    >
      <button
        type="button"
        onClick={onArm}
        className="flex min-h-11 w-full items-center gap-2 px-2.5 py-2 text-left"
        {...attributes}
        {...listeners}
        // Nach dem Spread, damit der Vormerk-Zustand nicht von dnd-kit ueberschrieben wird.
        aria-pressed={armed}
        // Die Nummer steht sichtbar in einem eigenen Feld; ohne diese Beschriftung
        // bliebe sie fuer Screenreader unhoerbar.
        aria-label={meal.number ? `${meal.number}. ${meal.name}` : meal.name}
        title={meal.name}
      >
        {/* Die Nummer ist der Anker: danach sucht man in der Gerichteliste. */}
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[color:var(--color-parchment)] text-xs font-bold tabular-nums"
        >
          {meal.number ?? '–'}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
          {meal.name}
        </span>
        {meal.noShopping && (
          <span
            title="Kein Einkauf nötig"
            aria-hidden="true"
            className="shrink-0 rounded-full bg-[color:var(--color-sage)] px-1.5 text-[0.6rem] font-bold text-white"
          >
            0
          </span>
        )}
      </button>
    </div>
  );
}

function MealPool({
  meals,
  armedMealId,
  onArm,
  onLoadSeed,
  loadingSeed,
  placement,
}: {
  meals: Meal[];
  armedMealId: ID | null;
  onArm: (id: ID) => void;
  onLoadSeed: () => void;
  loadingSeed: boolean;
  placement: 'bottom' | 'side';
}) {
  const [search, setSearch] = useState('');
  const { setView } = useApp();

  const visible = useMemo(() => {
    const active = meals.filter((meal) => meal.active);
    const query = search.trim().toLowerCase();
    if (!query) return active;
    return active.filter((meal) => meal.name.toLowerCase().includes(query));
  }, [meals, search]);

  return (
    <section
      aria-label="Unsere Gerichte"
      className={`flex min-h-0 flex-col rounded-2xl border border-[color:var(--color-line)] bg-white/60 p-2.5 ${
        placement === 'side'
          ? 'flex-1 max-md:flex-none max-md:shrink-0 md:w-[36.5rem] md:flex-none md:shrink-0'
          : 'flex-none shrink-0'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold whitespace-nowrap xl:text-lg">Unsere Gerichte</h2>
        <button
          type="button"
          className="text-sm font-semibold text-[color:var(--color-terracotta-dark)] underline"
          onClick={() => setView('meals')}
        >
          verwalten
        </button>
      </div>

      <label className="sr-only" htmlFor="meal-search">
        Gericht suchen
      </label>
      <input
        id="meal-search"
        type="search"
        placeholder="Suchen…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="tap mt-2 w-full rounded-xl border border-[color:var(--color-line)] bg-white px-3"
      />

      {/*
        Spaltenzahl richtet sich nach der Breite: auf dem iPad im Hochformat
        drei, auf breiten Bildschirmen bis zu sechs. So sind alle Gerichte
        gleichzeitig sichtbar, ohne die Kacheln unter Fingergroesse zu druecken.
      */}
      <div className="mt-2 grid min-h-0 flex-1 auto-rows-min content-start gap-1.5 overflow-y-auto pr-1 [grid-template-columns:repeat(auto-fill,minmax(11rem,1fr))]">
        {visible.length === 0 && (
          <div className="col-span-full rounded-xl bg-[color:var(--color-parchment)] p-4 text-sm text-[color:var(--color-muted)]">
            {meals.length === 0 ? (
              <>
                <p>
                  Auf diesem Gerät sind noch keine Gerichte gespeichert. Jedes Gerät hat seinen
                  eigenen Speicher.
                </p>
                <button
                  type="button"
                  data-testid="pool-load-seed"
                  disabled={loadingSeed}
                  onClick={onLoadSeed}
                  className="tap mt-3 w-full rounded-xl bg-[color:var(--color-terracotta)] px-4 font-semibold text-white disabled:opacity-50"
                >
                  {loadingSeed ? 'Einen Moment…' : `Unsere ${SEED_MEAL_COUNT} Gerichte laden`}
                </button>
              </>
            ) : (
              <p>Kein Gericht gefunden.</p>
            )}
          </div>
        )}
        {visible.map((meal) => (
          <PoolCard key={meal.id} meal={meal} armed={armedMealId === meal.id} onArm={() => onArm(meal.id)} />
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Gericht an einem Tag ------------------------- */

interface AssignmentCardProps {
  assignment: MealAssignment;
  meal: Meal | undefined;
  persons: Person[];
  expanded: boolean;
  onToggleExpanded: () => void;
}

function AssignmentCard({ assignment, meal, persons, expanded, onToggleExpanded }: AssignmentCardProps) {
  const { notify } = useApp();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `assignment:${assignment.id}`,
    data: { kind: 'assignment', assignmentId: assignment.id },
  });

  const assignedPersons = persons.filter((person) => assignment.personIds.includes(person.id));
  const title = meal ? (meal.number ? `${meal.number}. ${meal.name}` : meal.name) : 'Unbekanntes Gericht';

  return (
    <div
      ref={setNodeRef}
      data-draggable="true"
      data-testid={`assignment-${assignment.id}`}
      className={`animate-pop-in card w-full min-w-0 ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start gap-1 p-2">
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
          {...attributes}
          {...listeners}
        >
          <span className="block truncate font-bold">{title}</span>
          <span className="mt-1 block">
            <PersonBadges persons={assignedPersons} />
          </span>
        </button>
        <button
          type="button"
          className="tap shrink-0 rounded-lg px-2 text-lg text-[color:var(--color-muted)] hover:bg-[color:var(--color-parchment)] hover:text-[color:var(--color-terracotta-dark)]"
          aria-label={`${title} von diesem Tag entfernen`}
          onClick={() => {
            void removeAssignment(assignment.id).then(() => notify(`„${title}“ entfernt.`));
          }}
        >
          ×
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[color:var(--color-line)] p-2.5">
          <p className="mb-2 text-sm font-semibold text-[color:var(--color-muted)]">Wer isst mit?</p>
          <div className="flex flex-wrap gap-1.5">
            {persons.map((person) => (
              <PersonChip
                key={person.id}
                person={person}
                size="sm"
                selected={assignment.personIds.includes(person.id)}
                onToggle={() => void togglePerson(assignment.id, person.id)}
              />
            ))}
          </div>

          {meal && <ChoiceEditor meal={meal} assignment={assignment} />}
        </div>
      )}
    </div>
  );
}

/**
 * Auswahl je Zuordnung: Beilage, Variante und optionale Zutaten.
 * Nur was hier gewaehlt ist, landet spaeter auf der Einkaufsliste.
 */
function ChoiceEditor({ meal, assignment }: { meal: Meal; assignment: MealAssignment }) {
  const groups = meal.choiceGroups ?? [];
  const optionalIngredients = meal.ingredients.filter((ingredient) => ingredient.optional);
  if (groups.length === 0 && optionalIngredients.length === 0) return null;

  const chosen = effectiveChoices(meal, assignment);
  const selectedOptional = assignment.optionalIngredientIds ?? [];

  return (
    <div className="mt-3 space-y-3 border-t border-dashed border-[color:var(--color-line)] pt-3">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 text-sm font-semibold text-[color:var(--color-muted)]">
            {group.name}
            {group.mode === 'any' && <span className="font-normal"> (mehrere möglich)</span>}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.options.map((option) => {
              const active = (chosen[group.id] ?? []).includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    const current = chosen[group.id] ?? [];
                    const next =
                      group.mode === 'one'
                        ? [option.id]
                        : current.includes(option.id)
                          ? current.filter((id) => id !== option.id)
                          : [...current, option.id];
                    void setChoice(assignment.id, group.id, next);
                  }}
                  className={`tap rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-transparent bg-[color:var(--color-sage)] text-white'
                      : 'border-dashed border-[color:var(--color-line)] bg-white text-[color:var(--color-muted)]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {optionalIngredients.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-[color:var(--color-muted)]">Optional dazu</p>
          <div className="flex flex-wrap gap-1.5">
            {optionalIngredients.map((ingredient) => {
              const active = selectedOptional.includes(ingredient.id);
              return (
                <button
                  key={ingredient.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => void toggleOptionalIngredient(assignment.id, ingredient.id)}
                  className={`tap rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-transparent bg-[color:var(--color-sage)] text-white'
                      : 'border-dashed border-[color:var(--color-line)] bg-white text-[color:var(--color-muted)]'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {ingredient.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


/* ------------------------- Anordnung des Pools --------------------------- */

/** Masse der Pool-Kacheln, muessen zu den Klassen in PoolCard passen. */
const POOL_TILE_HEIGHT = 44;
const POOL_GAP = 6;
const POOL_MIN_COLUMN = 176; // 11rem
/** Kopfzeile, Suchfeld, Innenabstand der Pool-Sektion. */
const POOL_CHROME = 112;
/** Breite der Pool-Spalte in der Seitenanordnung (36,5rem). */
const POOL_SIDE_WIDTH = 584;
/** Darunter wird eine Tageszeile zu schmal, um Gerichtskarten zu zeigen. */
const DAYS_MIN_WIDTH = 440;

/**
 * Entscheidet, ob der Gerichte-Pool unter die Tage passt oder daneben muss.
 *
 * Eine feste Bildschirmgroesse als Grenze reicht dafuer nicht: Sobald Gerichte
 * eingeplant sind, werden die Tageszeilen hoeher und der Platz darunter
 * schrumpft. Deshalb wird hier gerechnet -- aus der tatsaechlichen Hoehe der
 * Tage und dem Platz, den die Gerichte bei der aktuellen Breite brauchen.
 */
function usePoolPlacement(
  containerRef: React.RefObject<HTMLDivElement | null>,
  daysRef: React.RefObject<HTMLDivElement | null>,
  mealCount: number,
): 'bottom' | 'side' {
  const [placement, setPlacement] = useState<'bottom' | 'side'>('bottom');

  useLayoutEffect(() => {
    const container = containerRef.current;
    const days = daysRef.current;
    if (!container || !days) return;

    const decide = () => {
      const available = container.clientHeight;
      // Unterhalb von md wird ohnehin gestapelt und die Seite scrollt.
      if (container.clientWidth < 768) return setPlacement('bottom');

      const columns = Math.max(
        1,
        Math.floor((container.clientWidth + POOL_GAP) / (POOL_MIN_COLUMN + POOL_GAP)),
      );
      const rows = Math.max(1, Math.ceil(mealCount / columns));
      const poolNeeded = rows * POOL_TILE_HEIGHT + (rows - 1) * POOL_GAP + POOL_CHROME;

      /*
       * Die natuerliche Hoehe der Tage aus den Zeilen selbst summieren.
       * days.scrollHeight taugt dafuer nicht: In der Seitenanordnung ist das
       * Element gestreckt und meldet die Containerhoehe -- die Rechnung liefe
       * im Kreis und koennte nie zurueckschalten.
       */
      const rowsOfDays = Array.from(days.children) as HTMLElement[];
      const daysNeeded =
        rowsOfDays.reduce((sum, row) => sum + row.offsetHeight, 0) +
        Math.max(0, rowsOfDays.length - 1) * POOL_GAP;

      /*
       * Die Seitenanordnung lohnt nur, wenn den Tagen danach noch genug Breite
       * bleibt. Auf dem iPad im Hochformat waere eine Tageszeile sonst rund
       * 210 px breit und damit unbrauchbar -- dann lieber den Pool scrollen
       * lassen, denn die sieben Tage haben Vorrang.
       */
      const sideIsSensible = container.clientWidth >= POOL_SIDE_WIDTH + DAYS_MIN_WIDTH;
      const fitsBelow = daysNeeded + POOL_GAP + poolNeeded <= available;
      setPlacement(fitsBelow || !sideIsSensible ? 'bottom' : 'side');
    };

    decide();
    const observer = new ResizeObserver(decide);
    observer.observe(container);
    observer.observe(days);
    return () => observer.disconnect();
  }, [containerRef, daysRef, mealCount]);

  return placement;
}

/* --------------------------------- Tag ----------------------------------- */

interface DayRowProps {
  date: string;
  index: number;
  assignments: MealAssignment[];
  mealsById: Map<ID, Meal>;
  persons: Person[];
  expandedId: ID | null;
  setExpandedId: (id: ID | null) => void;
  armedMealId: ID | null;
  onPlaceArmed: (date: string) => void;
}

function DayRow({
  date,
  index,
  assignments,
  mealsById,
  persons,
  expandedId,
  setExpandedId,
  armedMealId,
  onPlaceArmed,
}: DayRowProps) {
  const { isOver, setNodeRef } = useDroppable({ id: `day:${date}`, data: { kind: 'day', date } });
  const tint = weekdayTint(index);
  const isToday = date === todayISO();

  return (
    <section
      ref={setNodeRef}
      data-testid={`day-${date}`}
      data-day-index={index}
      aria-label={`${weekdayName(date)}, ${formatDayMonthDE(date)}`}
      className={`flex min-h-[4.25rem] shrink-0 gap-2 rounded-2xl border-2 p-1.5 transition-colors ${
        isOver
          ? 'border-[color:var(--color-terracotta)] bg-[#fdf0ec]'
          : `border-transparent ${tint!.soft}`
      }`}
    >
      <div className="flex w-14 shrink-0 flex-col items-center justify-start pt-1 lg:w-24">
        <span aria-hidden="true" className={`mb-1 h-1.5 w-7 rounded-full ${tint!.bar}`} />
        <span className="text-sm leading-none font-bold lg:text-base">
          <span className="hidden lg:inline">{weekdayName(date)}</span>
          <span className="lg:hidden">{WEEKDAY_SHORT[index]}</span>
        </span>
        <span className="mt-0.5 text-xs text-[color:var(--color-muted)]">{formatDayMonthDE(date)}</span>
        {isToday && (
          <span className="mt-1 rounded-full bg-[color:var(--color-terracotta)] px-1.5 py-0.5 text-[0.6rem] font-bold text-white">
            HEUTE
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap content-start gap-2">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="w-full min-w-0 lg:w-[calc(50%-0.25rem)] 2xl:w-[calc(33.333%-0.34rem)]">
            <AssignmentCard
              assignment={assignment}
              meal={mealsById.get(assignment.mealId)}
              persons={persons}
              expanded={expandedId === assignment.id}
              onToggleExpanded={() => setExpandedId(expandedId === assignment.id ? null : assignment.id)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => onPlaceArmed(date)}
          className={`tap flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-sm font-semibold transition-colors ${
            armedMealId
              ? 'border-[color:var(--color-terracotta)] bg-white text-[color:var(--color-terracotta-dark)]'
              : 'border-[color:var(--color-line)] text-[color:var(--color-muted)] hover:bg-white'
          } ${assignments.length === 0 ? 'flex-1' : ''}`}
        >
          {armedMealId ? 'Hier einsetzen' : '+ Gericht'}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------- Hauptansicht ---------------------------- */

export function WeekPlanView() {
  const { weekId, setWeekId, armedMealId, setArmedMealId, notify, setView } = useApp();
  const { persons, meals, merchants, ready } = useAppData();
  const { assignments } = useWeek(weekId);
  const mealsById = useMealMap(meals);
  const [expandedId, setExpandedId] = useState<ID | null>(null);
  const [dragging, setDragging] = useState<{ label: string } | null>(null);
  const [loadingSeed, setLoadingSeed] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const activeMealCount = useMemo(() => meals.filter((meal) => meal.active).length, [meals]);
  const placement = usePoolPlacement(layoutRef, daysRef, activeMealCount);

  /** Gerichte direkt aus dem leeren Pool heraus laden, ohne Umweg ueber die Verwaltung. */
  const handleLoadSeed = useCallback(async () => {
    setLoadingSeed(true);
    try {
      const result = await loadSeedMeals(merchants);
      if (!result.ok) {
        notify('Die Gerichte konnten nicht geladen werden.', 'error');
        return;
      }
      notify(`${result.added.length} Gerichte geladen.`, 'success');
    } finally {
      setLoadingSeed(false);
    }
  }, [merchants, notify]);

  const dates = useMemo(() => weekDates(weekId), [weekId]);

  const byDate = useMemo(() => {
    const map = new Map<string, MealAssignment[]>();
    for (const date of dates) map.set(date, []);
    for (const assignment of assignments) {
      const list = map.get(assignment.date);
      if (list) list.push(assignment);
    }
    return map;
  }, [assignments, dates]);

  const sensors = useSensors(
    // Maus: kleiner Schwellwert, damit ein Klick kein Ziehen ausloest.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Finger: kurzes Halten startet das Ziehen, sonst bliebe Scrollen unmoeglich.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const placeMeal = useCallback(
    async (mealId: ID, date: string) => {
      const meal = mealsById.get(mealId);
      await addAssignment(weekId, date, mealId);
      notify(`„${meal?.name ?? 'Gericht'}“ zu ${weekdayName(date)} hinzugefügt.`, 'success');
    },
    [mealsById, notify, weekId],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current;
      if (data?.kind === 'pool') {
        setDragging({ label: mealsById.get(data.mealId as ID)?.name ?? 'Gericht' });
      } else if (data?.kind === 'assignment') {
        const assignment = assignments.find((item) => item.id === data.assignmentId);
        setDragging({ label: (assignment && mealsById.get(assignment.mealId)?.name) ?? 'Gericht' });
      }
      setArmedMealId(null);
    },
    [assignments, mealsById, setArmedMealId],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragging(null);
      const target = event.over?.data.current;
      const source = event.active.data.current;
      if (!target || target.kind !== 'day' || !source) return;
      const date = target.date as string;

      if (source.kind === 'pool') {
        void placeMeal(source.mealId as ID, date);
      } else if (source.kind === 'assignment') {
        void moveAssignment(source.assignmentId as ID, date, weekId);
      }
    },
    [placeMeal, weekId],
  );

  const handlePlaceArmed = useCallback(
    (date: string) => {
      if (armedMealId) {
        void placeMeal(armedMealId, date);
        setArmedMealId(null);
      } else {
        // Ohne vorgemerktes Gericht fuehrt der Knopf zum Pool statt ins Leere.
        notify('Tippe zuerst rechts ein Gericht an, dann den Tag.');
      }
    },
    [armedMealId, notify, placeMeal, setArmedMealId],
  );

  const armedMeal = armedMealId ? mealsById.get(armedMealId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <header className="no-print flex flex-wrap items-center justify-between gap-3">
          <WeekNavigator weekId={weekId} onChange={setWeekId} />
          <button
            type="button"
            className="tap rounded-xl bg-[color:var(--color-terracotta)] px-5 font-semibold text-white"
            onClick={() => setView('shopping')}
          >
            Einkaufsliste →
          </button>
        </header>

        {armedMeal && (
          <div
            role="status"
            className="animate-pop-in flex items-center justify-between gap-3 rounded-xl bg-[color:var(--color-ink)] px-4 py-2.5 text-white"
          >
            <span className="font-semibold">
              „{armedMeal.name}“ vorgemerkt – jetzt einen Tag antippen.
            </span>
            <button
              type="button"
              className="tap rounded-lg bg-white/15 px-3 text-sm font-semibold"
              onClick={() => setArmedMealId(null)}
            >
              Abbrechen
            </button>
          </div>
        )}

        {/*
          Tage oben, Gerichte unten ueber die volle Breite. Der Platz unterhalb
          von Sonntag wird dadurch genutzt, und der Pool bekommt genug Breite,
          um alle Gerichte gleichzeitig und mit lesbaren Namen zu zeigen.
          min-w-0 verhindert, dass lange Namen die Seite waagerecht ueberlaufen lassen.
        */}
        <div
          ref={layoutRef}
          className={`flex min-h-0 flex-1 gap-2 ${
            placement === 'side'
              ? 'flex-col overflow-y-auto md:flex-row md:overflow-hidden'
              : // Unten: lieber den Bereich scrollen lassen als Tage oder
                // Gerichte zusammenzudruecken.
                'flex-col overflow-y-auto'
          }`}
        >
          {/* shrink-0: die sieben Tage behalten ihren Platz und bleiben immer
              vollstaendig sichtbar. Der Pool darunter nimmt, was uebrig bleibt. */}
          {/* shrink-0: die sieben Tage behalten ihren Platz und bleiben immer
              vollstaendig sichtbar. Der Pool nimmt, was uebrig bleibt. */}
          <div
            ref={daysRef}
            className={`flex min-w-0 flex-col gap-1.5 ${
              placement === 'side' ? 'md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1' : 'shrink-0'
            }`}
          >
            {!ready && <p className="p-4 text-[color:var(--color-muted)]">Daten werden geladen…</p>}
            {dates.map((date, index) => (
              <DayRow
                key={date}
                date={date}
                index={index}
                assignments={byDate.get(date) ?? []}
                mealsById={mealsById}
                persons={persons}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                armedMealId={armedMealId}
                onPlaceArmed={handlePlaceArmed}
              />
            ))}
          </div>

          <MealPool
            meals={meals}
            armedMealId={armedMealId}
            onArm={(id) => setArmedMealId(armedMealId === id ? null : id)}
            onLoadSeed={() => void handleLoadSeed()}
            loadingSeed={loadingSeed}
            placement={placement}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {dragging && (
          <div className="card px-4 py-3 font-bold shadow-2xl">{dragging.label}</div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
