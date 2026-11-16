// Квиз «Всё обо всём»: вопросы из разных школьных предметов подряд — математика, потом география,
// потом физика и так далее. Сложность от 1 до 10 определяет класс математики и уровень остальных предметов.

import { COURSES } from '../catalog/courses.js';
import { pick, shuffle } from '../core/random.js';
import { TOPICS } from './topics.js';

export const QUIZ_LEVELS = 10;
export const QUIZ_COUNT = 10;

/** Сложность заданий банков и генераторов (1…3) для уровня квиза. */
export const bankDifficulty = (level) => (level <= 3 ? 1 : level <= 7 ? 2 : 3);
/** Уровень английского (1 = A1 … 6 = C2) для уровня квиза. */
export const englishLevel = (level) => Math.min(6, Math.max(1, Math.round(level * 0.6)));

/** Предметы квиза и их темы для заданного уровня: [{ pool, spec: [[тема, [ключи]]] }]. */
export function quizSubjects(level) {
  const d = bankDifficulty(level);
  const math = COURSES.find((c) => c.id === 'math').tracks[Math.min(10, level)];
  return [
    { pool: 'math', spec: math.spec },
    { pool: 'physics', spec: [['p.kin', [d]], ['p.dyn', [d]], ['p.energy', [d]], ['p.elec', [d]], ['p.theory', [d]]] },
    { pool: 'chemistry', spec: [['c.molar', [d]], ['c.mole', [d]], ['c.theory', [d]]] },
    { pool: 'biology', spec: [['b.bank', [d]]] },
    { pool: 'geography', spec: [['g.bank', [d]]] },
    { pool: 'history', spec: [['h.world', [d]], ['h.kz', [d]]] },
    { pool: 'english', spec: [['e.vocab', [englishLevel(level)]], ['e.tenses', [Math.min(5, englishLevel(level))]]] },
    { pool: 'informatics', spec: [['i.num', [d]], ['i.logic', [d]], ['i.units', [d]], ['i.theory', [d]]] },
  ];
}

/**
 * Собирает квиз: каждый следующий вопрос — из другого предмета, предметы идут в случайном порядке.
 * Одинаковое зерно даёт одинаковый квиз.
 */
export function buildQuiz({ rng, level, count = QUIZ_COUNT }) {
  const subjects = quizSubjects(level);
  const ctx = { rng, mcOnly: true, used: new Set(), state: {} };
  const questions = [];
  let order = [];
  while (questions.length < count) {
    if (!order.length) {
      order = shuffle(subjects, rng);
      // Не начинаем новый круг с того же предмета, которым закончился предыдущий.
      if (questions.length && TOPICS[questions.at(-1).skill].pool === order[0].pool) order.push(order.shift());
    }
    const subject = order.shift();
    const [topic, keys] = pick(rng, subject.spec);
    let q;
    for (let attempt = 0; attempt < 8; attempt++) {
      q = TOPICS[topic].make(ctx, pick(rng, keys));
      if (!ctx.used.has(q.id)) break;
    }
    ctx.used.add(q.id);
    questions.push(q);
  }
  return questions;
}
