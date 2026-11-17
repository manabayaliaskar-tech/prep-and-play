// «Что мне сегодня делать?»: план на день из того, что есть у ученика —
// ошибки к повтору, слабые темы главного курса, план подготовки к экзамену,
// карточки слов, пробник и цель дня. Всё считается на устройстве, без сервера.

import { courseById, trackById } from '../catalog/index.js';
import { hasMock } from '../catalog/mocks.js';
import { DECK_LANGS, cardState, deckStats } from './cards.js';
import { dayKey, daysBetween } from './dates.js';
import { getPlan } from './plan.js';
import { dueMistakes } from './review.js';
import { seasonState } from './season.js';

export const MIX_SIZE = 12;
export const MIX_MISTAKES = 4;

/** Главный курс: тот, к которому готовишься по плану, иначе последний, где занимался. */
export function focusCourse(profile) {
  const plan = getPlan();
  const fromPlan = plan ? courseById(plan.course) : null;
  if (fromPlan?.tracks.length) return { course: fromPlan, plan };
  const last = profile.last?.course ? courseById(profile.last.course) : null;
  return last?.tracks.length ? { course: last, plan: null, track: trackById(last, profile.last.track) } : { course: null, plan };
}

/** Колоды слов, которые уже начаты и где сегодня есть слова к повтору. */
export function dueDecks(today = dayKey()) {
  const state = cardState();
  return DECK_LANGS.map((lang) => ({ lang, ...deckStats(lang, today) }))
    .filter((d) => d.due > 0 && Object.keys(state).some((id) => id.startsWith(`${d.lang}:`)));
}

/**
 * Шаги на сегодня: [{ id, icon, done, params }].
 * mix — тренировка дня (всегда первая), cards — карточки, mock — пробник, season — награды сезона, goal — цель дня.
 */
export function todaySteps(profile, { today = dayKey(), xpToday = 0, goal = 60 } = {}) {
  const steps = [];
  const mistakes = dueMistakes(today, MIX_MISTAKES).length;
  const focus = focusCourse(profile);
  steps.push({ id: 'mix', icon: '🧭', done: profile.todayMix === today, params: { mistakes, course: focus.course } });
  for (const deck of dueDecks(today)) steps.push({ id: 'cards', icon: '🃏', done: false, params: { lang: deck.lang, n: deck.due } });
  if (focus.plan && hasMock(focus.plan.course)) {
    const last = (profile.mocks ?? []).filter((m) => m.exam === focus.plan.course).at(-1);
    if (!last || daysBetween(last.date, today) >= 7) steps.push({ id: 'mock', icon: '🏁', done: false, params: { course: focus.plan.course, never: !last } });
  }
  const season = seasonState(profile, today);
  if (season.claimable.length) steps.push({ id: 'season', icon: '🎁', done: false, params: { n: season.claimable.length } });
  steps.push({ id: 'goal', icon: '🎯', done: xpToday >= goal, params: { left: Math.max(0, goal - xpToday) } });
  return steps;
}
