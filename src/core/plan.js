// План подготовки к экзамену: экзамен и дата, норма заданий в день, готовность в процентах.
// Тренировка дня собирается из самых слабых предметов экзамена.

import { COURSES, practiceKey } from '../catalog/index.js';
import { SKILLS } from '../content/skills.js';
import { dayKey, daysBetween } from './dates.js';
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

export function setPlan(course, date) {
  storage.set('plan', { course, date, created: dayKey() });
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
export function trackScores(course, profile = getProfile()) {
  return course.tracks.map((track) => {
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
