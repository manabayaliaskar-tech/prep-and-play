// Движок тем программы английского A1-C2: у каждого пункта программы (to be, there is, Past Perfect, лексика «Семья»...)
// своя тема. Тема описывается так:
//   { name: L(...), rules: { main: L(...), ... }, levels: { 1: () => [item, ...], ... } }
// Задание (item): [текст с пропуском ______ или null, правильный вариант, [три неправильных], правило, вид задания].
//   правило - ключ из rules или готовый L(en, ru, kk); вид - ключ из PROMPTS или L (по умолчанию 'gap').
//   Варианты - строки (английский) или L(...) (перевод на язык интерфейса).
// Задания создаются один раз при первом обращении к уровню темы, повторы отбрасываются.

import { hashString, pick } from '../../../core/random.js';
import { oldestOf } from '../../../core/seen.js';
import { L, mcText, poolQ, textOf } from '../../gen.js';

export const G = '______';
export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const PROMPTS = {
  gap: L('Choose the option that completes the sentence correctly.', 'Выбери вариант, который правильно дополняет предложение.', 'Сөйлемді дұрыс толықтыратын нұсқаны таңда.'),
  sent: L('Choose the correct sentence.', 'Выбери правильное предложение.', 'Дұрыс сөйлемді таңда.'),
  reply: L('Choose the best reply.', 'Выбери самый подходящий ответ.', 'Ең қолайлы жауапты таңда.'),
  word: L('Choose the word that completes the sentence.', 'Выбери слово, которое подходит в предложение.', 'Сөйлемге сәйкес келетін сөзді таңда.'),
  same: L('Choose the sentence that means the same.', 'Выбери предложение с тем же смыслом.', 'Мағынасы бірдей сөйлемді таңда.'),
  report: L('Choose the correct reported version.', 'Выбери правильный вариант в косвенной речи.', 'Төлеу сөздің дұрыс нұсқасын таңда.'),
  order: L('Choose the sentence with the correct word order.', 'Выбери предложение с правильным порядком слов.', 'Сөз тәртібі дұрыс сөйлемді таңда.'),
  formal: L('Choose the most suitable option for the situation.', 'Выбери вариант, который лучше всего подходит к ситуации.', 'Жағдайға ең қолайлы нұсқаны таңда.'),
  mean: L('What does the underlined part mean here?', 'Что значит выделенная часть в этом предложении?', 'Бұл сөйлемдегі белгіленген бөлік нені білдіреді?'),
};

/** Разбор: правильный вариант и правило на языке интерфейса. */
export function explain(answer, rule) {
  return L(
    `Correct: "${textOf(answer, 'en')}". ${rule.en}`,
    `Правильно: «${textOf(answer, 'ru')}». ${rule.ru}`,
    `Дұрысы: «${textOf(answer, 'kk')}». ${rule.kk}`,
  );
}

const isL = (x) => x && typeof x === 'object' && !Array.isArray(x) && 'en' in x;

/** Задания уровня в едином виде: { id, s, a, w, rule, p }. Повторы (одинаковый текст и ответ) отбрасываются. */
export function buildItems(topic, def, level) {
  const make = def.levels[level];
  if (!make) return [];
  const out = [];
  const ids = new Set();
  for (const row of make()) {
    const [s, a, w, ref = 'main', kind = 'gap'] = row;
    const rule = isL(ref) ? ref : def.rules[ref];
    const p = isL(kind) ? kind : PROMPTS[kind];
    const id = `${topic}:${hashString(`${textOf(p)}|${s ?? ''}|${textOf(a)}`)}`;
    if (ids.has(id)) continue;
    ids.add(id);
    out.push({ id, s, a, w, rule, p, ref, kind });
  }
  return out;
}

/** Проблемы в заданиях уровня (для тестов): одинаковые варианты, нет пропуска, нет правила, длинное тире. */
export function problemsOf(topic, def, level) {
  const bad = [];
  for (const it of buildItems(topic, def, level)) {
    const where = `${topic} [${level}] ${it.s ?? textOf(it.p)} → ${textOf(it.a)}`;
    const all = [it.a, ...(it.w ?? [])];
    if (all.length !== 4) bad.push(`${where}: нужно 4 варианта`);
    for (const l of ['en', 'ru', 'kk']) {
      const keys = all.map((x) => textOf(x, l).trim().toLowerCase());
      if (new Set(keys).size !== 4) bad.push(`${where}: одинаковые варианты (${l}: ${keys.join(' | ')})`);
    }
    if (!it.rule) bad.push(`${where}: нет правила «${it.ref}»`);
    if (!it.p) bad.push(`${where}: нет вида задания «${it.kind}»`);
    if (it.kind === 'gap' || it.kind === 'word') if (!it.s || !it.s.includes(G)) bad.push(`${where}: нет пропуска`);
    const blob = JSON.stringify([it.s, all, it.rule, it.p]);
    if (/[—–]/.test(blob)) bad.push(`${where}: длинное тире`);
    if (/undefined|\[object |NaN/.test(blob)) bad.push(`${where}: undefined`);
  }
  return bad;
}

/** Генератор темы: (ctx, уровень) → задание. Пока в сессии есть новые задания, повторов нет. */
export function sylMaker(topic, def) {
  const cache = {};
  return (ctx, level) => {
    const items = (cache[level] ??= buildItems(topic, def, level));
    if (!items.length) throw new Error(`No ${topic} items at level ${level}`);
    const fresh = items.filter((it) => !ctx.used?.has(it.id));
    const it = pick(ctx.rng, fresh.length ? fresh : oldestOf(items));
    const q = poolQ(topic, Math.ceil(level / 2), {
      kind: 'text',
      passage: it.s ?? null,
      prompt: it.p,
      ex: explain(it.a, it.rule),
      mc: mcText(ctx.rng, it.a, it.w),
    });
    q.id = it.id;
    q.level = CEFR[level - 1];
    return q;
  };
}

// ---------- Помощники для генераторов ----------

/** Все сочетания: cross([1, 2], ['a', 'b'], (n, s) => ...) */
export const cross = (a, b, fn) => a.flatMap((x, i) => b.map((y, j) => fn(x, y, i, j)));
/** Строка-таблица в массив: 'a|b|c\nd|e|f' → [['a','b','c'], ['d','e','f']]. */
export const table = (text) =>
  text
    .trim()
    .split('\n')
    .map((line) => line.split('|').map((x) => x.trim()));
/** Первая буква заглавная. */
export const cap = (s) => s[0].toUpperCase() + s.slice(1);
/** Подлежащее со строчной буквы, если это местоимение (кроме I) или «My ...». */
export const low = (s) => (/^(He|She|It|We|They|You|My|Our|Your|His|Her|Their|The)\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

/**
 * Подлежащие: s - как в начале предложения, p - лицо (1, 2, 3, 'pl'), o - объектная форма,
 * pos - притяжательное, refl - возвратное, pr - местоимение для хвостиков и кратких ответов.
 */
export const SUBJ = [
  { s: 'I', p: 1, o: 'me', pos: 'my', refl: 'myself', pr: 'I' },
  { s: 'You', p: 2, o: 'you', pos: 'your', refl: 'yourself', pr: 'you' },
  { s: 'He', p: 3, o: 'him', pos: 'his', refl: 'himself', pr: 'he' },
  { s: 'She', p: 3, o: 'her', pos: 'her', refl: 'herself', pr: 'she' },
  { s: 'We', p: 'pl', o: 'us', pos: 'our', refl: 'ourselves', pr: 'we' },
  { s: 'They', p: 'pl', o: 'them', pos: 'their', refl: 'themselves', pr: 'they' },
  { s: 'My sister', p: 3, o: 'her', pos: 'her', refl: 'herself', pr: 'she' },
  { s: 'Our teacher', p: 3, o: 'him', pos: 'his', refl: 'himself', pr: 'he', g: '?' },
  { s: 'Tom', p: 3, o: 'him', pos: 'his', refl: 'himself', pr: 'he' },
  { s: 'Aliya', p: 3, o: 'her', pos: 'her', refl: 'herself', pr: 'she' },
  { s: 'My friends', p: 'pl', o: 'them', pos: 'their', refl: 'themselves', pr: 'they' },
  { s: 'My parents', p: 'pl', o: 'them', pos: 'their', refl: 'themselves', pr: 'they' },
];
/** Подлежащие, у которых точно известен род (без «Our teacher»). */
export const SUBJ_SAFE = SUBJ.filter((x) => !x.g);

export const beOf = (p) => (p === 1 ? 'am' : p === 3 ? 'is' : 'are');
export const wasOf = (p) => (p === 1 || p === 3 ? 'was' : 'were');
export const hasOf = (p) => (p === 3 ? 'has' : 'have');
export const doOf = (p) => (p === 3 ? 'does' : 'do');
export const vs = (v, p) => (p === 3 ? v.s : v.base);
