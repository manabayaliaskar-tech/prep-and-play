// Анимированные объяснения тем: какая анимация к какой теме относится.
// Сами анимации - в screens/explain.js.

export const EXPLAINERS = [
  { id: 'balance', icon: '⚖️', topics: ['m.lineq'] },
  { id: 'fractions', icon: '🍕', topics: ['m.frac'] },
  { id: 'percent', icon: '💯', topics: ['m.pct'] },
  { id: 'pythagoras', icon: '📐', topics: ['m.pyth'] },
  { id: 'angles', icon: '🔺', topics: ['m.angle'] },
  { id: 'parabola', icon: '🎢', topics: ['m.quad'] },
  { id: 'unit-circle', icon: '⭕', topics: ['m.trig'] },
  { id: 'derivative', icon: '📈', topics: ['m.deriv'] },
  { id: 'probability', icon: '🎲', topics: ['m.prob'] },
  { id: 'motion', icon: '🚗', topics: ['m.motion', 'p.kin'] },
  { id: 'linear', icon: '📏', topics: ['m.func'] },
  { id: 'exponential', icon: '🚀', topics: ['m.pow'] },
  { id: 'logarithm', icon: '🔍', topics: ['m.log'] },
  { id: 'sine-wave', icon: '🌊', topics: ['p.wave'] },
  { id: 'circle-area', icon: '🎯', topics: ['m.area'] },
  { id: 'vectors', icon: '🧭', topics: ['m.vector'] },
  { id: 'systems', icon: '🔗', topics: ['m.sys'] },
  { id: 'progression', icon: '🐇', topics: ['m.prog', 'm.seq'] },
  { id: 'mean-median', icon: '🧮', topics: ['m.stat'] },
  { id: 'integral', icon: '📊', topics: ['m.integral'] },
  { id: 'ohm', icon: '💡', topics: ['p.elec'] },
  { id: 'lens', icon: '🔭', topics: ['p.facts'] },
  { id: 'projectile', icon: '⚽', topics: ['p.energy'] },
  { id: 'pendulum', icon: '⏱️', topics: ['p.theory'] },
  { id: 'newton', icon: '💪', topics: ['p.dyn'] },
  { id: 'gas', icon: '🎈', topics: ['p.heat'] },
  { id: 'ph', icon: '🧪', topics: ['c.theory'] },
  { id: 'balancing', icon: '⚗️', topics: ['c.mole'] },
  { id: 'photosynthesis', icon: '🌱', topics: ['b.plants'] },
  { id: 'punnett', icon: '🧬', topics: ['b.gen'] },
  { id: 'timezones', icon: '🌍', topics: ['g.world'] },
  { id: 'binary', icon: '💻', topics: ['i.num', 'i.units'] },
  { id: 'sorting', icon: '🔄', topics: ['i.algo'] },
];

const BY_TOPIC = new Map(EXPLAINERS.flatMap((e) => e.topics.map((topic) => [topic, e.id])));

/** id анимации для темы или null. */
export const explainerFor = (topic) => BY_TOPIC.get(topic) ?? null;
export const explainerById = (id) => EXPLAINERS.find((e) => e.id === id) ?? null;
