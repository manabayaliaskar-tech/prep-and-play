// Единый доступ к заданиям: Reading & Writing (банк) + Math (генераторы).
// QuestionStream выдаёт задания по одному с нужной сложностью и без повторов.
// Всё детерминировано: одно и то же зерно → одна и та же последовательность заданий.

import { pick, shuffle } from '../core/random.js';
import { MATH_GENERATORS } from './math/index.js';
import { RW_QUESTIONS } from './rw/index.js';
import { DOMAINS } from './skills.js';

/** Навыки, задания которых решаются быстро — для «Блица». */
const QUICK_RW = new Set(['boundaries', 'fss', 'transitions', 'words']);

/** Копия задания R&W с перемешанными вариантами ответа. */
function withShuffledChoices(q, rng) {
  const order = shuffle([0, 1, 2, 3], rng);
  return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
}

export class QuestionStream {
  /**
   * @param section 'rw' | 'math' | 'mix'
   * @param domains список доменов или null
   * @param skills список навыков или null
   * @param quick только быстрые задания (без ввода ответа)
   */
  constructor({ rng, section = 'mix', domains = null, skills = null, quick = false }) {
    this.rng = rng;
    this.section = section;
    this.quick = quick;
    const domainOk = (d) => !domains || domains.includes(d);
    const skillOk = (s) => !skills || skills.includes(s);
    this.rwPool = RW_QUESTIONS.filter(
      (q) => domainOk(q.domain) && skillOk(q.skill) && (!quick || QUICK_RW.has(q.skill)),
    );
    this.mathGens = MATH_GENERATORS.filter((g) => domainOk(g.domain) && skillOk(g.skill));
    this.used = new Set();
  }

  next(difficulty, { domain = null } = {}) {
    let sec = this.section;
    if (domain) sec = DOMAINS[domain].section;
    if (sec === 'mix') sec = this.rng() < 0.5 ? 'rw' : 'math';
    if (sec === 'rw' && this.rwPool.length === 0) sec = 'math';
    if (sec === 'math' && this.mathGens.length === 0) sec = 'rw';
    return sec === 'rw' ? this.#rw(difficulty, domain) : this.#math(difficulty, domain);
  }

  #rw(d, domain) {
    const pool = domain ? this.rwPool.filter((q) => q.domain === domain) : this.rwPool;
    let fresh = pool.filter((q) => !this.used.has(q.id));
    if (fresh.length === 0) {
      pool.forEach((q) => this.used.delete(q.id));
      fresh = pool;
    }
    const exact = fresh.filter((q) => q.d === d);
    const near = fresh.filter((q) => Math.abs(q.d - d) === 1);
    const candidates = exact.length ? exact : near.length ? near : fresh;
    const q = pick(this.rng, candidates);
    this.used.add(q.id);
    return withShuffledChoices(q, this.rng);
  }

  #math(d, domain) {
    const gens = domain ? this.mathGens.filter((g) => g.domain === domain) : this.mathGens;
    const ctx = { rng: this.rng, mcOnly: this.quick };
    let q;
    for (let attempt = 0; attempt < 12; attempt++) {
      q = pick(this.rng, gens).make(ctx, d);
      if (!this.used.has(q.id)) break;
    }
    this.used.add(q.id);
    return q;
  }
}

/** Набор из count заданий; сложность каждого выбирается из списка difficulties. */
export function buildSet({ rng, section = 'mix', domains = null, skills = null, difficulties = [1, 2, 3], count, quick }) {
  const stream = new QuestionStream({ rng, section, domains, skills, quick });
  return Array.from({ length: count }, () => stream.next(pick(rng, difficulties)));
}

export const BANK_STATS = {
  rw: RW_QUESTIONS.length,
  mathSkills: MATH_GENERATORS.length,
};
