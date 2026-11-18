// Освоение тем для карты знаний: по каждой теме - сколько ответов и какая точность.

import { getProfile } from './profile.js';

/** Состояния от «не начата» до «мастер». */
export const STATES = ['new', 'weak', 'learning', 'strong', 'master'];
export const STATE_ICONS = { new: '○', weak: '🔴', learning: '🟡', strong: '🟢', master: '⭐' };

/** Состояние темы по статистике { a - ответов, c - верных }. */
export function topicState(stat) {
  if (!stat?.a) return 'new';
  const pct = stat.c / stat.a;
  if (stat.a >= 15 && pct >= 0.9) return 'master';
  if (stat.a >= 5 && pct >= 0.8) return 'strong';
  if (stat.a >= 3 && pct < 0.5) return 'weak';
  return 'learning';
}

/** Все темы курса по предметам: [{ track, topics: [{ topic, keys, a, c, pct, state }] }]. */
export function courseMap(course, profile = getProfile()) {
  const seen = new Set();
  return course.tracks
    .map((track) => {
      const keys = new Map();
      for (const [topic, ks] of track.spec) keys.set(topic, [...new Set([...(keys.get(topic) ?? []), ...ks])]);
      const topics = [...keys]
        .filter(([topic]) => !seen.has(topic))
        .map(([topic, ks]) => {
          seen.add(topic);
          const s = profile.skills[topic];
          return { topic, keys: ks, a: s?.a ?? 0, c: s?.c ?? 0, pct: s?.a ? Math.round((s.c / s.a) * 100) : null, state: topicState(s) };
        });
      return { track, topics };
    })
    .filter((g) => g.topics.length);
}

/** Сводка по курсу: сколько тем в каждом состоянии и доля освоенных (strong + master). */
export function mapSummary(groups) {
  const counts = Object.fromEntries(STATES.map((s) => [s, 0]));
  let total = 0;
  for (const g of groups) for (const x of g.topics) {
    counts[x.state] += 1;
    total += 1;
  }
  return { counts, total, mastered: counts.strong + counts.master, pct: total ? Math.round(((counts.strong + counts.master) / total) * 100) : 0 };
}

/** Начальный уровень адаптивной тренировки по состоянию темы. */
export const tierForState = (state) => ({ new: 1, weak: 0, learning: 2, strong: 3, master: 4 })[state] ?? 2;
