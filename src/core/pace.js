// Темп экзамена: сколько секунд в среднем даётся на одно задание на настоящем экзамене,
// режим «время на вопрос» и статистика скорости по темам.

import { POOLS, TOPICS } from '../pools/topics.js';
import { getProfile } from './profile.js';
import { storage } from './storage.js';

/** Секунд на задание по типу предмета (ориентир по реальным экзаменам: ЕНТ, SAT, IELTS и др.). */
export const PACE_BY_POOL = {
  math: 90,
  physics: 90,
  chemistry: 80,
  informatics: 75,
  olymp: 180,
  code: 75,
  english: 40,
  russian: 45,
  spanish: 30,
  french: 30,
  chinese: 30,
  biology: 45,
  geography: 45,
  history: 45,
  social: 45,
  reading: 90,
};
export const PACE_DEFAULT = 60;
/** Время ответа дольше этого (отошёл от экрана) в статистику скорости не идёт. */
export const SPEED_CAP_MS = 5 * 60 * 1000;

/** Сколько секунд даётся на задание. Задания с текстом для чтения - дольше. */
export function paceFor(q) {
  if (q.passages || (q.passage && String(q.passage.en ?? q.passage).length > 400)) return 120;
  if (q.listen) return 90;
  if (q.section === 'math' && !q.local) return 95;
  if (q.section === 'rw' && !q.local) return 71;
  const pool = TOPICS[q.skill]?.pool;
  return PACE_BY_POOL[pool] ?? PACE_DEFAULT;
}

export const getPaceMode = () => storage.get('paceMode', false) === true;
export const setPaceMode = (on) => storage.set('paceMode', Boolean(on));

/** Запоминает время ответа по теме: profile.speed[тема] = { n, ms, fast } (fast - сколько раз уложился в темп). */
export function recordSpeed(q, ms, profile = getProfile()) {
  if (!q?.skill || !(ms > 0) || ms > SPEED_CAP_MS) return;
  const s = ((profile.speed ??= {})[q.skill] ??= { n: 0, ms: 0, fast: 0 });
  s.n += 1;
  s.ms += Math.round(ms);
  if (ms <= paceFor(q) * 1000) s.fast += 1;
}

/** Средняя скорость по теме в секундах или null. */
export function avgSeconds(topic, profile = getProfile()) {
  const s = profile.speed?.[topic];
  return s?.n ? Math.round(s.ms / s.n / 1000) : null;
}

/** Итог по сессии: среднее время, сколько уложилось в темп, самое долгое задание. */
export function runSpeed(log) {
  const timed = log.filter((e) => e.timeMs > 0 && e.timeMs <= SPEED_CAP_MS);
  if (!timed.length) return null;
  const total = timed.reduce((s, e) => s + e.timeMs, 0);
  const fast = timed.filter((e) => e.timeMs <= paceFor(e.question) * 1000).length;
  const slowest = timed.reduce((a, e) => (e.timeMs > a.timeMs ? e : a));
  return { avg: Math.round(total / timed.length / 1000), fast, n: timed.length, slowest };
}

export const poolOf = (topic) => POOLS[TOPICS[topic]?.pool];
