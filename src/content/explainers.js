// Анимированные объяснения тем: какая анимация к какой теме относится.
// Сами анимации — в screens/explain.js.

export const EXPLAINERS = [
  { id: 'balance', icon: '⚖️', topics: ['m.lineq'] },
  { id: 'fractions', icon: '🍕', topics: ['m.frac'] },
  { id: 'percent', icon: '💯', topics: ['m.pct'] },
  { id: 'pythagoras', icon: '📐', topics: ['m.pyth'] },
  { id: 'angles', icon: '🔺', topics: ['m.angle'] },
  { id: 'parabola', icon: '🎢', topics: ['m.quad', 'm.func'] },
  { id: 'unit-circle', icon: '⭕', topics: ['m.trig'] },
  { id: 'derivative', icon: '📈', topics: ['m.deriv'] },
  { id: 'probability', icon: '🎲', topics: ['m.prob'] },
  { id: 'motion', icon: '🚗', topics: ['m.motion', 'p.kin'] },
];

const BY_TOPIC = new Map(EXPLAINERS.flatMap((e) => e.topics.map((topic) => [topic, e.id])));

/** id анимации для темы или null. */
export const explainerFor = (topic) => BY_TOPIC.get(topic) ?? null;
export const explainerById = (id) => EXPLAINERS.find((e) => e.id === id) ?? null;
