// Анимированные объяснения тем: какая анимация к какой теме относится.
// Сами анимации - в screens/explain.js.

/** Разделы страницы анимаций по порядку; subj у анимации - один из них. */
export const EXPLAIN_SUBJECTS = ['algebra', 'geometry', 'higher', 'physics', 'chemistry', 'biology', 'cs', 'geo'];

export const EXPLAINERS = [
  { id: 'balance', subj: 'algebra', icon: '⚖️', topics: ['m.lineq'] },
  { id: 'fractions', subj: 'algebra', icon: '🍕', topics: ['m.frac'] },
  { id: 'percent', subj: 'algebra', icon: '💯', topics: ['m.pct'] },
  { id: 'parabola', subj: 'algebra', icon: '🎢', topics: ['m.quad'] },
  { id: 'probability', subj: 'algebra', icon: '🎲', topics: ['m.prob'] },
  { id: 'motion', subj: 'algebra', icon: '🚗', topics: ['m.motion', 'p.kin'] },
  { id: 'linear', subj: 'algebra', icon: '📏', topics: ['m.func'] },
  { id: 'exponential', subj: 'algebra', icon: '🚀', topics: ['m.pow'] },
  { id: 'logarithm', subj: 'algebra', icon: '🔍', topics: ['m.log'] },
  { id: 'systems', subj: 'algebra', icon: '🔗', topics: ['m.sys'] },
  { id: 'progression', subj: 'algebra', icon: '🐇', topics: ['m.prog', 'm.seq'] },
  { id: 'mean-median', subj: 'algebra', icon: '🧮', topics: ['m.stat'] },
  { id: 'pythagoras', subj: 'geometry', icon: '📐', topics: ['m.pyth'] },
  { id: 'angles', subj: 'geometry', icon: '🔺', topics: ['m.angle'] },
  { id: 'unit-circle', subj: 'geometry', icon: '⭕', topics: ['m.trig'] },
  { id: 'circle-area', subj: 'geometry', icon: '🎯', topics: ['m.area'] },
  { id: 'vectors', subj: 'geometry', icon: '🧭', topics: ['m.vector'] },
  { id: 'derivative', subj: 'higher', icon: '📈', topics: ['m.deriv'] },
  { id: 'integral', subj: 'higher', icon: '📊', topics: ['m.integral'] },
  { id: 'sine-wave', subj: 'physics', icon: '🌊', topics: ['p.wave'] },
  { id: 'ohm', subj: 'physics', icon: '💡', topics: ['p.elec'] },
  { id: 'lens', subj: 'physics', icon: '🔭', topics: ['p.facts'] },
  { id: 'projectile', subj: 'physics', icon: '⚽', topics: ['p.energy'] },
  { id: 'pendulum', subj: 'physics', icon: '⏱️', topics: ['p.theory'] },
  { id: 'newton', subj: 'physics', icon: '💪', topics: ['p.dyn'] },
  { id: 'gas', subj: 'physics', icon: '🎈', topics: ['p.heat'] },
  { id: 'ph', subj: 'chemistry', icon: '🧪', topics: ['c.theory'] },
  { id: 'balancing', subj: 'chemistry', icon: '⚗️', topics: ['c.mole'] },
  { id: 'photosynthesis', subj: 'biology', icon: '🌱', topics: ['b.plants'] },
  { id: 'punnett', subj: 'biology', icon: '🧬', topics: ['b.gen'] },
  { id: 'binary', subj: 'cs', icon: '💻', topics: ['i.num', 'i.units'] },
  { id: 'sorting', subj: 'cs', icon: '🔄', topics: ['i.algo'] },
  { id: 'timezones', subj: 'geo', icon: '🌍', topics: ['g.world'] },
];

const BY_TOPIC = new Map(EXPLAINERS.flatMap((e) => e.topics.map((topic) => [topic, e.id])));

/** id анимации для темы или null. */
export const explainerFor = (topic) => BY_TOPIC.get(topic) ?? null;
export const explainerById = (id) => EXPLAINERS.find((e) => e.id === id) ?? null;
