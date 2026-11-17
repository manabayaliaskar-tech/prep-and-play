// План подготовки к экзамену: экзамен и дата, норма заданий в день, готовность в процентах.
// Тренировка дня собирается из самых слабых предметов экзамена.

import { COURSES, practiceKey } from '../catalog/index.js';
import { hasMock } from '../catalog/mocks.js';
import { SKILLS } from '../content/skills.js';
import { dayKey, daysBetween } from './dates.js';
import { addDays as addDaysKey } from './review.js';
import { getProfile } from './profile.js';
import { storage } from './storage.js';

export const PLAN_SESSION = 10;

/** Экзамены, к которым можно составить план: с предметами в каталоге и SAT. */
export const planExams = () => COURSES.filter((c) => c.group === 'exams' && (c.tracks.length || c.id === 'sat'));

export function getPlan() {
  const plan = storage.get('plan', null);
  if (!plan || typeof plan.course !== 'string' || typeof plan.date !== 'string') return null;
  return COURSES.some((c) => c.id === plan.course) ? plan : null;
}

/** tracks — выбранные предметы (id дорожек); пусто — все предметы экзамена. */
export function setPlan(course, date, tracks = null) {
  storage.set('plan', { course, date, created: dayKey(), ...(tracks?.length ? { tracks } : {}) });
}

/** Предметы, к которым готовится ученик: выбранные в плане или все. */
export function planTracks(course, plan = getPlan()) {
  const ids = plan?.course === course.id && Array.isArray(plan.tracks) && plan.tracks.length ? plan.tracks : null;
  const list = ids ? course.tracks.filter((tr) => ids.includes(tr.id)) : course.tracks;
  return list.length ? list : course.tracks;
}

export function clearPlan() {
  storage.set('plan', null);
}

export const daysLeft = (plan, today = dayKey()) => Math.max(0, daysBetween(today, plan.date));

/** Норма заданий в день: чем ближе экзамен, тем больше. */
export function dailyTarget(days) {
  if (days >= 90) return 10;
  if (days >= 45) return 20;
  if (days >= 21) return 30;
  return 40;
}

/** Сколько заданий плана решено сегодня. */
export function planToday(today = dayKey()) {
  const d = storage.get('planDay', null);
  return d?.date === today ? d.done : 0;
}

export function addPlanProgress(n, today = dayKey()) {
  storage.set('planDay', { date: today, done: planToday(today) + n });
}

/** Оценка темы 0…1: точность с поправкой на число ответов (одна удача ещё не готовность). */
function topicScore(stat) {
  if (!stat?.a) return 0;
  return (stat.c / stat.a) * Math.min(1, stat.a / 8);
}

/** Готовность по каждому предмету экзамена: [{ track, score 0…1 }]. */
export function trackScores(course, profile = getProfile(), plan = getPlan()) {
  return planTracks(course, plan).map((track) => {
    const topics = [...new Set(track.spec.map(([id]) => id))];
    const fromTopics = topics.reduce((s, id) => s + topicScore(profile.skills[id]), 0) / Math.max(1, topics.length);
    const fromRuns = (profile.practice[practiceKey(course, track)]?.pct ?? 0) / 100;
    return { track, score: Math.max(fromTopics, fromRuns * 0.9) };
  });
}

/** Готовность к экзамену в процентах. Для SAT — по навыкам SAT. */
export function readiness(course, profile = getProfile()) {
  if (course.id === 'sat') {
    const ids = Object.keys(SKILLS);
    return Math.round((ids.reduce((s, id) => s + topicScore(profile.skills[id]), 0) / ids.length) * 100);
  }
  const scores = trackScores(course, profile);
  if (!scores.length) return 0;
  return Math.round((scores.reduce((s, x) => s + x.score, 0) / scores.length) * 100);
}

/** Темы тренировки дня: два самых слабых предмета экзамена. */
export function planSpec(course, profile = getProfile()) {
  const weakest = trackScores(course, profile)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
  return weakest.flatMap(({ track }) => track.spec);
}

// ---------- Режим «экзамен через N дней» ----------

/** Последняя неделя перед экзаменом — финиш: пробники и повтор ошибок, без новых тем. */
export const FINAL_DAYS = 7;
/** Сколько ответов по теме нужно, чтобы считать её отработанной. */
export const READY_ANSWERS = 25;

/** Сколько заданий осталось решить до готовности: недобор ответов по темам плюс доработка слабых тем. */
export function planNeed(course, profile = getProfile(), plan = getPlan()) {
  const topics = [...new Set(planTracks(course, plan).flatMap((tr) => tr.spec.map(([id]) => id)))];
  return topics.reduce((sum, id) => {
    const s = profile.skills[id];
    const a = s?.a ?? 0;
    const weak = a >= 5 && s.c / a < 0.7 ? 10 : 0;
    return sum + Math.max(0, READY_ANSWERS - a) + weak;
  }, 0);
}

/**
 * Норма на сегодня, которая «ужимается» к дате: всё, что осталось, делится на оставшиеся дни до финиша.
 * Пропустил день — норма на следующие дни подрастает. В финишную неделю — ровно 20 (повтор, без перегруза).
 */
export function planTarget(course, plan = getPlan(), profile = getProfile(), today = dayKey()) {
  const days = daysLeft(plan, today);
  if (course.id === 'sat' || !course.tracks.length) return dailyTarget(days);
  if (days <= FINAL_DAYS) return 20;
  const need = planNeed(course, profile, plan);
  return Math.max(10, Math.min(60, Math.ceil(need / (days - FINAL_DAYS))));
}

/**
 * Расписание по неделям до экзамена: в каждой неделе — предметы в фокусе (сначала самые слабые),
 * пробник раз в неделю (если для экзамена он есть), последняя неделя — финиш.
 * [{ index, start, end, focus: [track], mock, final, current }]
 */
export function planWeeks(course, plan = getPlan(), profile = getProfile(), today = dayKey(), limit = 26) {
  const days = daysLeft(plan, today);
  if (!days) return [];
  const weeks = Math.ceil(days / 7);
  const order = trackScores(course, profile, plan)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.track);
  const work = Math.max(1, weeks - 1);
  const perWeek = order.length ? Math.max(1, Math.min(3, Math.ceil(order.length / work))) : 0;
  const mock = hasMock(course.id);
  return Array.from({ length: Math.min(weeks, limit) }, (_, i) => {
    const final = weeks > 1 && i === weeks - 1;
    const start = addDaysKey(today, i * 7);
    const end = i === weeks - 1 ? plan.date : addDaysKey(today, i * 7 + 6);
    const focus = final || !order.length ? [] : Array.from({ length: Math.min(perWeek, order.length) }, (_, j) => order[(i * perWeek + j) % order.length]);
    return { index: i, start, end, focus, mock: mock && (final || i >= 1), final, current: i === 0 };
  });
}
