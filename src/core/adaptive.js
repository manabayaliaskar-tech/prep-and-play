// Адаптивная сложность: задания подстраиваются под ученика.
// Есть общий «уровень» от 0 (лёгкий) до TIERS - 1 (очень сложный). Два верных ответа подряд - уровень выше,
// ошибка - ниже. У каждой темы свои ключи сложности (1…3 у математики, A1…C2 у английского),
// уровень переводится в ключ темы пропорционально.

import { shuffle } from './random.js';
import { TOPICS } from '../pools/topics.js';

export const TIERS = 5;
export const TIER_ICONS = ['🌱', '🌿', '🌳', '🔥', '🚀'];
/** Сколько верных подряд нужно, чтобы подняться на уровень. */
export const UP_AFTER = 2;

/** Ключ темы для уровня: ключи сортируются по возрастанию, уровень делит их поровну. */
export function keyForTier(keys, tier) {
  const sorted = [...keys].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];
  const i = Math.round((tier / (TIERS - 1)) * (sorted.length - 1));
  return sorted[Math.max(0, Math.min(sorted.length - 1, i))];
}

/** Объединяет ключи одной темы из разных уровней курса: [[topic, keys]] без повторов тем. */
export function mergeSpec(spec) {
  const map = new Map();
  for (const [topic, keys] of spec) {
    if (!TOPICS[topic]) continue;
    const set = map.get(topic) ?? new Set();
    keys.forEach((k) => set.add(k));
    map.set(topic, set);
  }
  return [...map].map(([topic, set]) => [topic, [...set]]);
}

export class AdaptiveStream {
  constructor({ rng, spec, tier = 2, quick = false }) {
    this.rng = rng;
    this.topics = mergeSpec(spec);
    this.tier = Math.max(0, Math.min(TIERS - 1, tier));
    this.streak = 0;
    this.quick = quick;
    this.used = new Set();
    this.state = {};
    this.queue = [];
    this.peak = this.tier;
    this.history = [];
  }

  nextTopic() {
    if (!this.queue.length) this.queue = shuffle(this.topics, this.rng);
    return this.queue.pop();
  }

  next() {
    const ctx = { rng: this.rng, mcOnly: this.quick, used: this.used, state: this.state };
    let q = null;
    for (let turn = 0; turn < this.topics.length * 2; turn++) {
      const [topic, keys] = this.nextTopic();
      const key = keyForTier(keys, this.tier);
      for (let attempt = 0; attempt < 6; attempt++) {
        q = TOPICS[topic].make(ctx, key);
        if (!this.used.has(q.id)) break;
      }
      if (!this.used.has(q.id)) break;
    }
    this.used.add(q.id);
    q.tier = this.tier;
    return q;
  }

  /** Ответ на последнее задание: двигает уровень. Возвращает 'up' | 'down' | null. */
  feedback(correct) {
    let move = null;
    if (correct) {
      this.streak += 1;
      if (this.streak >= UP_AFTER && this.tier < TIERS - 1) {
        this.tier += 1;
        this.streak = 0;
        move = 'up';
      }
    } else {
      this.streak = 0;
      if (this.tier > 0) {
        this.tier -= 1;
        move = 'down';
      }
    }
    this.peak = Math.max(this.peak, this.tier);
    this.history.push(this.tier);
    return move;
  }
}
