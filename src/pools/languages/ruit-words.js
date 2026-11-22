// Слова для курсов «Русский как иностранный» (rki) и «Итальянский» (it).
// Основа - общий словарь (vocab.js) и итальянские переводы из ruit-dict.js, плюс дополнительные слова,
// чтобы на уровнях A1-B2 было не меньше 150 слов, а на C1-C2 - не меньше 100.
// Виды заданий: что значит слово, как сказать, лишнее слово, а для итальянского - определённый артикль.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { CATS, CEFR, WORDS } from './vocab.js';
import { IT_WORDS, RUIT_EXTRA } from './ruit-dict.js';

const IT = new Map(
  IT_WORDS.trim()
    .split('\n')
    .map((line) => {
      const parts = line.split('|');
      if (parts.length !== 2) throw new Error(`ruit-dict: ${line}`);
      return [parts[0].trim(), parts[1].trim()];
    }),
);
const EXTRA = RUIT_EXTRA.trim()
  .split('\n')
  .map((line, j) => {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length !== 6) throw new Error(`ruit-dict: ${line}`);
    const [level, cat, en, ru, kk, it] = parts;
    return { i: 5000 + j, level: Number(level), cat, en, ru, kk, it };
  });

/** Русское слово без пояснения в скобках («договор (международный)» → «договор»), если от этого не появится повтор. */
function russianOf(list) {
  const bare = (s) => s.replace(/\s*\([^)]*\)/g, '').trim();
  const count = new Map();
  for (const w of list) count.set(bare(w.ru), (count.get(bare(w.ru)) ?? 0) + 1);
  return (w) => (count.get(bare(w.ru)) > 1 ? w.ru : bare(w.ru));
}

/** Слова языка без повторов: { i, level, cat, en, ru, kk, f (слово на изучаемом языке) }. */
function build(lang) {
  const base = WORDS.map((w) => ({ i: w.i, level: w.level, cat: w.cat, en: w.en, ru: w.ru, kk: w.kk, it: IT.get(w.en) }));
  const all = [...base, ...EXTRA];
  const ru = russianOf(all);
  const out = [];
  const seen = new Set();
  for (const w of all) {
    const f = lang === 'ru' ? ru(w) : w.it;
    if (!f || f === '-') continue;
    const keys = [`f:${f.toLowerCase()}`, `en:${w.en.toLowerCase()}`];
    if (keys.some((k) => seen.has(k))) continue;
    keys.forEach((k) => seen.add(k));
    out.push({ i: w.i, level: w.level, cat: w.cat, en: w.en, ru: w.ru, kk: w.kk, f });
  }
  return out;
}
export const RUIT_WORDS = { ru: build('ru'), it: build('it') };

const group = (cat) => (cat === 'verb' ? 'v' : ['adj', 'feeling', 'color'].includes(cat) ? 'a' : 'n');
const NEAR = new Set(['nature|place', 'home|place', 'school|place', 'people|job', 'travel|transport', 'travel|place', 'science|tech', 'science|nature', 'society|work', 'health|body', 'time|nature', 'mind|society', 'mind|science', 'work|job', 'hobby|school', 'home|school', 'people|school', 'work|health', 'hobby|place']);
const near = (a, b) => a === b || NEAR.has(`${a}|${b}`) || NEAR.has(`${b}|${a}`);
const low = (s) => s.toLocaleLowerCase();
const compatible = (list, w) => list.every((x) => ['en', 'ru', 'kk', 'f'].every((k) => low(x[k]) !== low(w[k])));

function distractors(rng, words, answer) {
  const window = words.filter((w) => w !== answer && Math.abs(w.level - answer.level) <= 1);
  const tiers = [
    window.filter((w) => w.cat === answer.cat),
    window.filter((w) => w.cat !== answer.cat && group(w.cat) === group(answer.cat)),
    words.filter((w) => w !== answer && group(w.cat) === group(answer.cat)),
  ];
  const chosen = [answer];
  for (const tier of tiers) for (const w of shuffle(tier, rng)) if (chosen.length < 4 && compatible(chosen, w)) chosen.push(w);
  if (chosen.length < 4) throw new Error(`ruit-words: мало вариантов для ${answer.f}`);
  return chosen.slice(1);
}

const LANG = {
  ru: { en: 'Russian', ru: 'по-русски', kk: 'орыс' },
  it: { en: 'Italian', ru: 'по-итальянски', kk: 'итальян' },
};
/** Перевод на язык интерфейса. В курсе русского русский интерфейс показывает английский и казахский перевод. */
const meaningOf = (w, lang) => (lang === 'ru' ? L(w.en, `${w.en} · ${w.kk}`, w.kk) : L(w.en, w.ru, w.kk));
const glossRu = (w, lang) => (lang === 'ru' ? `${w.en}, ${w.kk}` : w.ru);

function finish(q, id, level, lang) {
  q.id = id;
  q.level = CEFR[level - 1];
  q.voice = q.voice ?? { lang };
  return q;
}

function meaningTask(ctx, topic, lang, words, w) {
  const all = [w, ...distractors(ctx.rng, words, w)];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const ex = L(`"${w.f}" means "${w.en}".`, `«${w.f}» - «${glossRu(w, lang)}»${lang === 'ru' ? '' : ` (по-английски ${w.en})`}.`, `«${w.f}» - «${w.kk}» (ағылшынша ${w.en}).`);
  const q = poolQ(topic, 1, { kind: 'text', passage: w.f, prompt: L('What does this word mean?', 'Что значит это слово?', 'Бұл сөз нені білдіреді?'), ex, mc: { choices: order.map((k) => meaningOf(all[k], lang)), answer: order.indexOf(0) } });
  q.voice = { lang, now: w.f };
  return finish(q, `${topic}:m:${w.i}`, w.level, lang);
}

function reverseTask(ctx, topic, lang, words, w) {
  const all = [w, ...distractors(ctx.rng, words, w)];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const prompt =
    lang === 'ru'
      ? L(`How do you say "${w.en}" in Russian?`, `Как по-русски «${w.en}» (по-казахски «${w.kk}»)?`, `«${w.kk}» орыс тілінде қалай айтылады?`)
      : L(`How do you say "${w.en}" in ${LANG[lang].en}?`, `Как ${LANG[lang].ru} «${w.ru}»?`, `«${w.kk}» ${LANG[lang].kk} тілінде қалай айтылады?`);
  const ex = L(`"${w.en}" - ${w.f}.`, `«${lang === 'ru' ? w.en : w.ru}» - ${w.f}.`, `«${w.kk}» - ${w.f}.`);
  const q = poolQ(topic, 2, { kind: 'text', prompt, ex, mc: { choices: order.map((k) => all[k].f), answer: order.indexOf(0) } });
  return finish(q, `${topic}:r:${w.i}`, w.level, lang);
}

function oddTask(ctx, topic, lang, words, level) {
  const rng = ctx.rng;
  const window = words.filter((w) => Math.abs(w.level - level) <= 1);
  const cats = [...new Set(window.map((w) => w.cat))].filter((c) => window.filter((w) => w.cat === c).length >= 4);
  for (let attempt = 0; attempt < 20; attempt++) {
    const cat = pick(rng, cats);
    const byPos = group(cat) !== 'n' || rng() < 0.5;
    const oddPool = window.filter((w) => (byPos ? group(w.cat) !== group(cat) : group(w.cat) === group(cat) && !near(w.cat, cat)));
    if (!oddPool.length) continue;
    const odd = pick(rng, oddPool);
    const main = [odd];
    for (const w of shuffle(window.filter((x) => x.cat === cat), rng)) if (main.length < 4 && compatible(main, w)) main.push(w);
    if (main.length < 4) continue;
    const order = shuffle([0, 1, 2, 3], rng);
    const others = main.slice(1);
    const list = (l) => others.map((w) => `${w.f} (${l === 'ru' ? glossRu(w, lang) : w[l]})`).join(', ');
    const ex = L(
      `"${odd.f}" (${odd.en}) belongs to «${CATS[odd.cat].en}», the others to «${CATS[cat].en}»: ${list('en')}.`,
      `«${odd.f}» (${glossRu(odd, lang)}) - это ${CATS[odd.cat].ru}, а остальные - ${CATS[cat].ru}: ${list('ru')}.`,
      `«${odd.f}» (${odd.kk}) - ${CATS[odd.cat].kk}, ал қалғандары - ${CATS[cat].kk}: ${list('kk')}.`,
    );
    const q = poolQ(topic, 2, { kind: 'text', prompt: L('Which word is the odd one out?', 'Какое слово лишнее?', 'Қай сөз артық?'), ex, mc: { choices: order.map((k) => main[k].f), answer: order.indexOf(0) } });
    const key = main.map((w) => w.i).sort((a, b) => a - b).join('-');
    return finish(q, `${topic}:o:${hashString(key)}`, level, lang);
  }
  return null;
}

// ---------- Итальянский: определённый артикль ----------
const IT_ART = /^(?:(il|lo|la|i|gli|le) |(l'))(\S.*)$/;
const ART_RULE = {
  il: L('masculine singular before a consonant: il', 'мужской род, единственное число, перед согласной: il', 'еркек тек, жекеше түр, дауыссыз алдында: il'),
  lo: L('masculine singular before s + consonant, z, gn, ps: lo', 'мужской род перед s + согласная, z, gn, ps: lo', 'еркек тек, s + дауыссыз, z, gn, ps алдында: lo'),
  la: L('feminine singular before a consonant: la', 'женский род, единственное число, перед согласной: la', 'әйел тек, жекеше түр, дауыссыз алдында: la'),
  "l'": L("singular before a vowel (masculine or feminine): l'", "единственное число перед гласной (любой род): l'", "жекеше түр, дауысты алдында (кез келген тек): l'"),
  i: L('masculine plural before a consonant: i', 'мужской род, множественное число, перед согласной: i', 'еркек тек, көпше түр, дауыссыз алдында: i'),
  gli: L('masculine plural before a vowel or s + consonant, z: gli', 'мужской род, множественное число, перед гласной или s + согласная, z: gli', 'еркек тек, көпше түр, дауысты немесе s + дауыссыз, z алдында: gli'),
  le: L('feminine plural: le', 'женский род, множественное число: le', 'әйел тек, көпше түр: le'),
};
// Существительные, род которых не виден по окончанию.
const ODD_GENDER = new Set(['la mano', 'la foto', 'il problema', 'il pianeta', 'il clima', 'il cinema', 'il dilemma', 'il sistema', 'il programma', 'il pilota', 'il turista', 'il giornalista', 'il collega', 'il dentista', 'la radio', 'il dogma']);
const itNoun = (w) => IT_ART.test(w.f) && group(w.cat) === 'n';
function articleTask(ctx, topic, w) {
  const [, a1, a2, noun] = w.f.match(IT_ART);
  const art = a1 ?? a2;
  const plural = ['i', 'gli', 'le'].includes(art);
  const pool = plural ? ['i', 'gli', 'le', 'il'] : ['il', 'lo', 'la', "l'"];
  const all = [art, ...pool.filter((a) => a !== art)].slice(0, 4);
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const r = ART_RULE[art];
  const odd = ODD_GENDER.has(w.f);
  const note = odd
    ? L(' This noun is an exception: its gender does not follow the -o / -a rule.', ' Это исключение: род не совпадает с правилом «-o - мужской, -a - женский».', ' Бұл - ерекшелік: тегі «-o - еркек, -a - әйел» ережесіне сәйкес келмейді.')
    : L('', '', '');
  const ex = L(`${cap(r.en)}: ${w.f} (${w.en}).${note.en}`, `${cap(r.ru)}: ${w.f} (${w.ru}).${note.ru}`, `${cap(r.kk)}: ${w.f} (${w.kk}).${note.kk}`);
  const passage = art === "l'" ? `______ ${noun}` : `______ ${noun}`;
  const prompt = L('Choose the definite article.', 'Выбери определённый артикль.', 'Белгілі артикльді таңда.');
  const q = poolQ(topic, 1, { kind: 'text', passage, prompt, ex, mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.voice = { lang: 'it', after: w.f };
  return finish(q, `${topic}:a:${w.i}`, w.level, 'it');
}
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** Генератор слов: (ctx, уровень) → задание. Не повторяет задания внутри сессии. */
export function ruitWordsMaker(topic, lang) {
  const words = RUIT_WORDS[lang];
  return (ctx, level) => {
    const pool = words.filter((w) => w.level === level);
    const nouns = lang === 'it' ? pool.filter(itNoun) : [];
    const modes = lang === 'it' ? ['m', 'm', 'r', 'r', 'o', 'a', 'a'] : ['m', 'm', 'm', 'r', 'r', 'r', 'o'];
    for (let attempt = 0; attempt < 10; attempt++) {
      const mode = pick(ctx.rng, modes);
      let q = null;
      if (mode === 'o') q = oddTask(ctx, topic, lang, words, level);
      else if (mode === 'a') {
        const fresh = nouns.filter((w) => !ctx.used?.has(`${topic}:a:${w.i}`));
        if (nouns.length) q = articleTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : nouns));
      } else {
        const fresh = pool.filter((w) => !ctx.used?.has(`${topic}:${mode}:${w.i}`));
        const w = pick(ctx.rng, fresh.length ? fresh : pool);
        q = mode === 'm' ? meaningTask(ctx, topic, lang, words, w) : reverseTask(ctx, topic, lang, words, w);
      }
      if (q && (!ctx.used?.has(q.id) || attempt === 9)) {
        q.d = Math.min(3, Math.ceil(level / 2));
        return q;
      }
    }
    return meaningTask(ctx, topic, lang, words, pick(ctx.rng, pool));
  };
}
