// Квиз «Всё обо всём»: вопросы из разных школьных предметов подряд - математика, потом география,
// потом физика и так далее. Сложность от 1 до 10 определяет класс математики и уровень остальных предметов.

import { COURSES } from '../catalog/courses.js';
import { createRng, hashString, pick, shuffle } from '../core/random.js';
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
    { pool: 'physics', spec: [['p.kin', [d]], ['p.dyn', [d]], ['p.energy', [d]], ['p.elec', [d]], ['p.theory', [d]], ['p.facts', [d]]] },
    { pool: 'chemistry', spec: [['c.molar', [d]], ['c.mole', [d]], ['c.theory', [d]], ['c.elem', [d]], ['c.salts', [d]]] },
    { pool: 'biology', spec: [['b.bank', [d]], ['b.animals', [d]], ['b.body', [d]], ['b.cell', [d]], ['b.gen', [d]], ['b.plants', [d]], ['b.eco', [d]]] },
    { pool: 'geography', spec: [['g.bank', [d]], ['g.world', [d]], ['g.records', [d]], ['g.kz', [d]]] },
    { pool: 'history', spec: [['h.world', [d]], ['h.kz', [d]], ['h.kzt', [d]], ['h.wt', [d]]] },
    { pool: 'english', spec: [['e.vocab', [englishLevel(level)]], ['e.tenses', [Math.min(5, englishLevel(level))]], ['e.words', [englishLevel(level)]], ['e.gram', [englishLevel(level)]]] },
    { pool: 'informatics', spec: [['i.num', [d]], ['i.logic', [d]], ['i.units', [d]], ['i.theory', [d]], ['i.facts', [d]]] },
    { pool: 'social', spec: [['s.terms', [d]], ['s.powers', [d]]] },
    { pool: 'olymp', spec: [['o.logic', [d]], ['o.pigeon', [d]], ['o.digit', [d]]] },
    { pool: 'code', spec: [['code.terms', [d]]] },
  ];
}

/** Все предметы квиза (для режима «Свой квиз»). */
export const QUIZ_POOLS = quizSubjects(1).map((s) => s.pool);

/**
 * Поток вопросов квиза: каждый следующий - из другого предмета, предметы идут в случайном порядке.
 * seen - вопросы, которые игрок уже видел в прошлых играх: их выдаём, только если новых не нашлось.
 * pools - какие предметы участвуют (по умолчанию все).
 */
export class QuizStream {
  constructor({ rng, seen = new Set(), pools = null }) {
    this.rng = rng;
    this.seen = seen;
    this.pools = pools?.length ? pools : null;
    this.ctx = { rng, mcOnly: true, used: new Set(), state: {} };
    this.order = [];
    this.lastPool = null;
  }

  next(level) {
    const subjects = quizSubjects(level).filter((s) => !this.pools || this.pools.includes(s.pool));
    if (!this.order.length) {
      this.order = shuffle(subjects.map((s) => s.pool), this.rng);
      // Не начинаем новый круг с того же предмета, которым закончился предыдущий.
      if (this.order.length > 1 && this.order[0] === this.lastPool) this.order.push(this.order.shift());
    }
    const pool = this.order.shift();
    const subject = subjects.find((s) => s.pool === pool) ?? subjects[0];
    let q = null;
    // Сначала ищем вопрос, которого не было ни в этой игре, ни в прошлых; потом - хотя бы не в этой.
    for (let attempt = 0; attempt < 14; attempt++) {
      const [topic, keys] = pick(this.rng, subject.spec);
      const cand = TOPICS[topic].make(this.ctx, pick(this.rng, keys));
      if (this.ctx.used.has(cand.id)) continue;
      q = cand;
      if (!this.seen.has(cand.id)) break;
    }
    if (!q) {
      const [topic, keys] = pick(this.rng, subject.spec);
      q = TOPICS[topic].make(this.ctx, pick(this.rng, keys));
    }
    this.ctx.used.add(q.id);
    this.lastPool = pool;
    return q;
  }
}

/** Собирает квиз из count вопросов. Одинаковое зерно и одинаковая история дают одинаковый квиз. */
export function buildQuiz({ rng, level, count = QUIZ_COUNT, seen, pools }) {
  const stream = new QuizStream({ rng, seen, pools });
  return Array.from({ length: count }, () => stream.next(level));
}

/** Квиз дня: одинаковый для всех в этот день, средняя сложность. */
export const DAILY_QUIZ_LEVEL = 5;
export function dailyQuiz(day) {
  return buildQuiz({ rng: createRng(hashString(`quiz-day:${day}`)), level: DAILY_QUIZ_LEVEL });
}

/** Сложность в «Выживании»: растёт на единицу каждые три ответа. */
export const survivalLevel = (answered, start = 1) => Math.min(QUIZ_LEVELS, start + Math.floor(answered / 3));

/** Сводка по предметам для экрана результатов: [{ pool, correct, total }]. */
export function bySubject(log) {
  const rows = new Map();
  for (const { question, correct } of log) {
    const pool = TOPICS[question.skill]?.pool ?? 'other';
    const row = rows.get(pool) ?? { pool, correct: 0, total: 0 };
    row.total += 1;
    if (correct) row.correct += 1;
    rows.set(pool, row);
  }
  return [...rows.values()].sort((a, b) => b.total - a.total);
}
