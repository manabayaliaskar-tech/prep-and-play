// Поток заданий из общих банков. Набор тем задаётся списком пар [тема, [ключи]]:
// для математики ключ — сложность 1…3, для английского — уровень от A1 (1) до C2 (6).
// Одинаковое зерно даёт одинаковую последовательность заданий.

import { shuffle } from '../core/random.js';
import { TOPICS } from './topics.js';

export function cells(spec) {
  return spec.flatMap(([topic, keys]) => keys.map((key) => ({ topic, key })));
}

export class TopicStream {
  constructor({ rng, spec, quick = false }) {
    this.rng = rng;
    this.cells = cells(spec);
    this.quick = quick;
    this.used = new Set();
    this.state = {};
    this.queue = [];
  }

  nextCell() {
    if (!this.queue.length) this.queue = shuffle(this.cells, this.rng);
    return this.queue.pop();
  }

  next() {
    const ctx = { rng: this.rng, mcOnly: this.quick, used: this.used, state: this.state };
    let q = null;
    // Если в теме закончились новые задания (маленький банк), берём следующую тему.
    for (let turn = 0; turn < this.cells.length * 2; turn++) {
      const cell = this.nextCell();
      for (let attempt = 0; attempt < 6; attempt++) {
        q = TOPICS[cell.topic].make(ctx, cell.key);
        if (!this.used.has(q.id)) break;
      }
      if (!this.used.has(q.id)) break;
    }
    this.used.add(q.id);
    return q;
  }
}

export function buildTopicSet({ rng, spec, count, quick = false }) {
  const stream = new TopicStream({ rng, spec, quick });
  return Array.from({ length: count }, () => stream.next());
}
