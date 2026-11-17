// Задания по китайским словам HSK 1–6: значение иероглифов, перевод на китайский, чтение (пиньинь)
// и счётные слова. Уровень — номер HSK.

import { pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { HANZI, MEASURE, MEASURE_INFO } from './hanzi.js';

const isVerb = (w) => w.en.startsWith('to ');
const tr = (w) => L(w.en, w.ru, w.kk);
const tri = (s) => {
  const [en, ru, kk] = s.split('|');
  return L(en, ru, kk);
};

function distractors(rng, w, keys) {
  const near = HANZI.filter((x) => x !== w && Math.abs(x.level - w.level) <= 1);
  const tiers = [near.filter((x) => isVerb(x) === isVerb(w)), near, HANZI.filter((x) => x !== w)];
  const chosen = [w];
  for (const tier of tiers) {
    for (const x of shuffle(tier, rng)) {
      if (chosen.length === 4) break;
      if (chosen.every((c) => keys.every((k) => c[k] !== x[k]))) chosen.push(x);
    }
  }
  return chosen;
}

function finish(q, id, level) {
  q.id = id;
  q.level = `HSK ${level}`;
  q.d = Math.min(3, Math.ceil(level / 2));
  return q;
}

function task(ctx, topic, w, mode) {
  const keys = ['hz', 'en', 'ru', 'kk', ...(mode === 'p' ? ['py'] : [])];
  const all = distractors(ctx.rng, w, keys);
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const ex = L(`${w.hz} (${w.py}) means "${w.en}".`, `${w.hz} (${w.py}) — «${w.ru}».`, `${w.hz} (${w.py}) — «${w.kk}».`);
  // На первых трёх уровнях рядом с иероглифами показываем пиньинь.
  const shown = w.level <= 3 && mode === 'm' ? `${w.hz} (${w.py})` : w.hz;
  const view = {
    m: { passage: shown, prompt: L('What does this word mean?', 'Что значит это слово?', 'Бұл сөз нені білдіреді?'), choice: tr },
    r: { passage: null, prompt: L(`How do you say "${w.en}" in Chinese?`, `Как по-китайски «${w.ru}»?`, `«${w.kk}» қытайша қалай айтылады?`), choice: (x) => (w.level <= 3 ? `${x.hz} (${x.py})` : x.hz) },
    p: { passage: w.hz, prompt: L('How is this word read (pinyin)?', 'Как читается это слово (пиньинь)?', 'Бұл сөз қалай оқылады (пиньинь)?'), choice: (x) => x.py },
  }[mode];
  const q = poolQ(topic, 1, { kind: 'text', passage: view.passage, prompt: view.prompt, ex, mc: { choices: order.map((k) => view.choice(all[k])), answer: order.indexOf(0) } });
  // Слово можно послушать сразу (значение) или после ответа (перевод и чтение — иначе это подсказка).
  q.voice = mode === 'm' ? { lang: 'zh', now: w.hz } : { lang: 'zh', after: w.hz };
  return finish(q, `${topic}:${mode}:${w.i}`, w.level);
}

function measureTask(ctx, topic, row, level) {
  const [noun, py, meaning, ok] = row;
  const [main] = ok;
  const wrong = shuffle(Object.keys(MEASURE_INFO).filter((m) => !ok.includes(m) && m !== '个'), ctx.rng).slice(0, 3);
  const all = [main, ...wrong];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const [mpy, used] = MEASURE_INFO[main];
  // 一 читается yí перед четвёртым тоном и yì перед остальными.
  const yi = /[àèìòùǜ]/.test(mpy) ? 'yí' : 'yì';
  const u = tri(used);
  const m = tri(meaning);
  const ex = L(
    `一${main}${noun} (${yi} ${mpy} ${py}) — "${m.en}". ${main} (${mpy}) is used for ${u.en}.`,
    `一${main}${noun} (${yi} ${mpy} ${py}) — «${m.ru}». ${main} (${mpy}) — счётное слово для: ${u.ru}.`,
    `一${main}${noun} (${yi} ${mpy} ${py}) — «${m.kk}». ${main} (${mpy}) — мөлшер сөз: ${u.kk}.`,
  );
  const prompt = L('Choose the correct measure word.', 'Выбери правильное счётное слово.', 'Дұрыс мөлшер сөзді таңда.');
  const q = poolQ(topic, 2, { kind: 'text', passage: `一 ______ ${noun} (${py})`, prompt, ex, mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.voice = { lang: 'zh' };
  return finish(q, `${topic}:c:${noun}`, level);
}

export function hanziMaker(topic) {
  return (ctx, level) => {
    const pool = HANZI.filter((w) => w.level === level);
    if (!pool.length) throw new Error(`HSK ${level}: нет слов`);
    const measures = MEASURE.filter((row) => row[4] <= level && level <= 4);
    const modes = ['m', 'm', 'r', 'r', 'p', ...(measures.length ? ['c', 'c'] : [])];
    for (let attempt = 0; attempt < 8; attempt++) {
      const mode = pick(ctx.rng, modes);
      let q;
      if (mode === 'c') {
        const fresh = measures.filter((row) => !ctx.used?.has(`${topic}:c:${row[0]}`));
        q = measureTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : measures), level);
      } else {
        const fresh = pool.filter((w) => !ctx.used?.has(`${topic}:${mode}:${w.i}`));
        q = task(ctx, topic, pick(ctx.rng, fresh.length ? fresh : pool), mode);
      }
      if (!ctx.used?.has(q.id) || attempt === 7) return q;
    }
    return task(ctx, topic, pick(ctx.rng, pool), 'm');
  };
}

export const HANZI_COUNT = HANZI.length * 3 + MEASURE.length;
