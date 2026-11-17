// Диагностика на старте: короткий тест по всем выбранным предметам курса (или по уровням, если курс по уровням).
// Показывает сильные и слабые стороны и с чего начать. Баллы экзамена не предсказывает — только честные проценты.

import { buildTopicSet } from '../pools/stream.js';
import { TOPICS } from '../pools/topics.js';
import { dayKey } from './dates.js';
import { getProfile } from './profile.js';
import { keyForTier, mergeSpec } from './adaptive.js';

export const DIAG_PER_TRACK = 4;
export const DIAG_LEVELS = 8;
export const DIAG_PER_LEVEL = 2;
/** Сколько предметов выбрано по умолчанию у экзамена с большим списком. */
export const DIAG_DEFAULT_TRACKS = 5;

/** Предметы, выбранные по умолчанию. */
export function diagDefaultTracks(course) {
  return course.tracks.slice(0, course.leveled ? course.tracks.length : DIAG_DEFAULT_TRACKS).map((tr) => tr.id);
}

/** Уровни, которые проверяет диагностика курса по уровням: до DIAG_LEVELS, равномерно от первого до последнего. */
export function diagLevels(course) {
  const n = course.tracks.length;
  if (n <= DIAG_LEVELS) return course.tracks;
  return Array.from({ length: DIAG_LEVELS }, (_, i) => course.tracks[Math.round((i * (n - 1)) / (DIAG_LEVELS - 1))]);
}

/** Набор тем среднего уровня сложности для предмета. */
export function midSpec(track) {
  return mergeSpec(track.spec).map(([topic, keys]) => [topic, [keyForTier(keys, 2)]]);
}

/** Задания диагностики. У каждого задания помечено, к какому предмету/уровню оно относится. */
export function diagQuestions(course, trackIds, rng) {
  const out = [];
  if (course.leveled) {
    for (const track of diagLevels(course)) {
      for (const q of buildTopicSet({ rng, spec: track.spec, count: DIAG_PER_LEVEL })) out.push({ ...q, diagTrack: track.id });
    }
    return out;
  }
  for (const track of course.tracks.filter((tr) => trackIds.includes(tr.id))) {
    for (const q of buildTopicSet({ rng, spec: midSpec(track), count: DIAG_PER_TRACK })) out.push({ ...q, diagTrack: track.id });
  }
  return out;
}

/**
 * Итог по журналу ответов: проценты по предметам и темам, рекомендованный уровень (для курса по уровням).
 * log — [{ question, correct }].
 */
export function diagResult(course, log) {
  const byTrack = new Map();
  const byTopic = new Map();
  for (const { question: q, correct } of log) {
    const tr = byTrack.get(q.diagTrack) ?? { c: 0, n: 0 };
    tr.n += 1;
    if (correct) tr.c += 1;
    byTrack.set(q.diagTrack, tr);
    const tp = byTopic.get(q.skill) ?? { c: 0, n: 0 };
    tp.n += 1;
    if (correct) tp.c += 1;
    byTopic.set(q.skill, tp);
  }
  const tracks = course.tracks
    .filter((tr) => byTrack.has(tr.id))
    .map((tr) => {
      const s = byTrack.get(tr.id);
      return { id: tr.id, c: s.c, n: s.n, pct: Math.round((s.c / s.n) * 100) };
    });
  const topics = [...byTopic].filter(([id]) => TOPICS[id]).map(([topic, s]) => ({ topic, c: s.c, n: s.n, pct: Math.round((s.c / s.n) * 100) }));
  const c = log.filter((e) => e.correct).length;
  const result = { tracks, topics, c, n: log.length, pct: log.length ? Math.round((c / log.length) * 100) : 0 };
  if (course.leveled) {
    // Начинать стоит с первого уровня, где ошибся. Всё верно — с последнего проверенного.
    const firstMiss = tracks.find((x) => x.c < x.n);
    result.level = (firstMiss ?? tracks.at(-1))?.id ?? course.tracks[0].id;
  } else {
    const weakest = [...tracks].sort((a, b) => a.pct - b.pct)[0];
    result.level = weakest?.id ?? null;
  }
  return result;
}

export function saveDiag(course, result, profile = getProfile(), today = dayKey()) {
  (profile.diag ??= {})[course.id] = {
    date: today,
    pct: result.pct,
    level: result.level,
    tracks: Object.fromEntries(result.tracks.map((x) => [x.id, x.pct])),
  };
  profile.counters.diags = (profile.counters.diags ?? 0) + 1;
}

export const lastDiag = (course, profile = getProfile()) => profile.diag?.[course.id] ?? null;
