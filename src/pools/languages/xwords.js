// Слова для немецкого и турецкого: переводы из words-de-tr.js поверх общего словаря (vocab.js).
// Виды заданий: что значит слово, как сказать, лишнее слово, а также
// для немецкого - артикль (der, die, das), для турецкого - местный падеж (-da/-de/-ta/-te: гармония гласных).

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { CATS, CEFR, WORDS } from './vocab.js';
import { DE_TR } from './words-de-tr.js';
import { h2, voiceless } from './tr-morph.js';

const ROWS = new Map(
  DE_TR.trim()
    .split('\n')
    .map((line) => {
      const parts = line.split('|');
      if (parts.length !== 3) throw new Error(`words-de-tr: ${line}`);
      return [parts[0].trim(), { de: parts[1].trim(), tr: parts[2].trim() }];
    }),
);

/** Слова языка: { i, level, cat, en, ru, kk, f (слово), loc (турецкий местный падеж) }. */
function build(lang) {
  const out = [];
  for (const w of WORDS) {
    const row = ROWS.get(w.en);
    if (!row || row[lang] === '-') continue;
    let [f, loc] = row[lang].split('=');
    f = f.trim();
    out.push({ i: w.i, level: w.level, cat: w.cat, en: w.en, ru: w.ru, kk: w.kk, f, loc: loc?.trim() });
  }
  return out;
}
export const XWORDS = { de: build('de'), tr: build('tr') };

const LANG = {
  de: { en: 'German', ru: 'по-немецки', kk: 'неміс' },
  tr: { en: 'Turkish', ru: 'по-турецки', kk: 'түрік' },
};
const group = (cat) => (cat === 'verb' ? 'v' : ['adj', 'feeling', 'color'].includes(cat) ? 'a' : 'n');
const NEAR = new Set(['nature|place', 'home|place', 'school|place', 'people|job', 'travel|transport', 'travel|place', 'science|tech', 'science|nature', 'society|work', 'health|body', 'time|nature', 'mind|society', 'mind|science', 'work|job', 'hobby|school', 'home|school']);
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
  if (chosen.length < 4) throw new Error(`xwords: мало вариантов для ${answer.f}`);
  return chosen.slice(1);
}

function finish(q, id, level, lang) {
  q.id = id;
  q.level = CEFR[level - 1];
  q.voice = { lang };
  return q;
}

function meaningTask(ctx, topic, lang, words, w) {
  const all = [w, ...distractors(ctx.rng, words, w)];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const ex = L(`"${w.f}" means "${w.en}".`, `«${w.f}» - «${w.ru}» (по-английски ${w.en}).`, `«${w.f}» - «${w.kk}» (ағылшынша ${w.en}).`);
  const q = poolQ(topic, 1, { kind: 'text', passage: w.f, prompt: L('What does this word mean?', 'Что значит это слово?', 'Бұл сөз нені білдіреді?'), ex, mc: { choices: order.map((k) => L(all[k].en, all[k].ru, all[k].kk)), answer: order.indexOf(0) } });
  q.voice = { lang, now: w.f };
  return finish(q, `${topic}:m:${w.i}`, w.level, lang);
}

function reverseTask(ctx, topic, lang, words, w) {
  const all = [w, ...distractors(ctx.rng, words, w)];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const prompt = L(`How do you say "${w.en}" in ${LANG[lang].en}?`, `Как ${LANG[lang].ru} «${w.ru}»?`, `«${w.kk}» ${LANG[lang].kk} тілінде қалай айтылады?`);
  const ex = L(`"${w.en}" - ${w.f}.`, `«${w.ru}» - ${w.f}.`, `«${w.kk}» - ${w.f}.`);
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
    const list = (l) => others.map((w) => `${w.f} (${w[l]})`).join(', ');
    const ex = L(
      `"${odd.f}" (${odd.en}) belongs to «${CATS[odd.cat].en}», the others to «${CATS[cat].en}»: ${list('en')}.`,
      `«${odd.f}» (${odd.ru}) - это ${CATS[odd.cat].ru}, а остальные - ${CATS[cat].ru}: ${list('ru')}.`,
      `«${odd.f}» (${odd.kk}) - ${CATS[odd.cat].kk}, ал қалғандары - ${CATS[cat].kk}: ${list('kk')}.`,
    );
    const q = poolQ(topic, 2, { kind: 'text', prompt: L('Which word is the odd one out?', 'Какое слово лишнее?', 'Қай сөз артық?'), ex, mc: { choices: order.map((k) => main[k].f), answer: order.indexOf(0) } });
    const key = main.map((w) => w.i).sort((a, b) => a - b).join('-');
    return finish(q, `${topic}:o:${hashString(key)}`, level, lang);
  }
  return null;
}

// ---------- Немецкий: артикль ----------
const DE_ART = /^(der|die|das) ([A-ZÄÖÜ]\S*)$/;
const GENDER = {
  der: L('masculine', 'мужского рода', 'еркек тегінде'),
  die: L('feminine', 'женского рода', 'әйел тегінде'),
  das: L('neuter', 'среднего рода', 'орта текте'),
};
function articleTask(ctx, topic, w) {
  const [, art, noun] = w.f.match(DE_ART);
  const all = [art, ...['der', 'die', 'das', 'den'].filter((a) => a !== art)];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const g = GENDER[art];
  const ex = L(
    `"${noun}" is ${g.en}: ${w.f} (${w.en}). German nouns are always written with a capital letter; learn each one with its article.`,
    `«${noun}» - ${g.ru}: ${w.f} (${w.ru}). Немецкие существительные всегда пишутся с большой буквы; учи каждое вместе с артиклем.`,
    `«${noun}» - ${g.kk}: ${w.f} (${w.kk}). Неміс тілінде зат есім әрқашан бас әріппен жазылады; әрқайсысын артиклімен бірге жатта.`,
  );
  const prompt = L('Choose the article (nominative singular).', 'Выбери артикль (именительный падеж, единственное число).', 'Артикльді таңда (атау септік, жекеше түр).');
  const q = poolQ(topic, 1, { kind: 'text', passage: `______ ${noun}`, prompt, ex, mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  return finish(q, `${topic}:a:${w.i}`, w.level, 'de');
}

// ---------- Турецкий: местный падеж ----------
const trNoun = (w) => w.cat !== 'verb' && group(w.cat) === 'n' && !w.f.includes(' ') && w.loc !== '-';
const locOf = (w) => w.loc ?? `${w.f}${voiceless(w.f) ? 't' : 'd'}${h2(w.f)}`;
function locativeTask(ctx, topic, w) {
  const ok = locOf(w);
  const variants = ['da', 'de', 'ta', 'te'].map((s) => w.f + s).filter((x) => x !== ok);
  const all = [ok, ...shuffle(variants, ctx.rng).slice(0, 3)];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const regular = !w.loc;
  const ex = regular
    ? L(
        `"In / at the ${w.en}": ${ok}. The locative suffix follows vowel harmony (a, ı, o, u → -da; e, i, ö, ü → -de), and after f, s, t, k, ç, ş, h, p the d becomes t.`,
        `«В / на» (${w.ru}): ${ok}. Местный падеж подчиняется гармонии гласных (a, ı, o, u → -da; e, i, ö, ü → -de), а после f, s, t, k, ç, ş, h, p буква d меняется на t.`,
        `«${w.kk}» - жатыс септікте: ${ok}. Жалғау үндестік заңына бағынады (a, ı, o, u → -da; e, i, ö, ü → -de), ал f, s, t, k, ç, ş, h, p-дан кейін d орнына t келеді - қазақшадағы -да/-де/-та/-те сияқты.`,
      )
    : L(
        `"In / at the ${w.en}": ${ok} - an exception to the usual rule, remember it.`,
        `«В / на» (${w.ru}): ${ok} - это исключение из общего правила, его нужно запомнить.`,
        `«${w.kk}» - жатыс септікте: ${ok}. Бұл жалпы ережеден ерекшелік, оны есте сақтау керек.`,
      );
  const prompt = L(`Choose the locative form ("in / at ...") of «${w.f}».`, `Выбери форму местного падежа («в / на ...») слова «${w.f}».`, `«${w.f}» сөзінің жатыс септігін таңда («...да / ...де»).`);
  const q = poolQ(topic, 1, { kind: 'text', prompt, ex, mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  return finish(q, `${topic}:l:${w.i}`, w.level, 'tr');
}

/** Генератор слов: (ctx, уровень) → задание. Не повторяет задания внутри сессии. */
export function xWordsMaker(topic, lang) {
  const words = XWORDS[lang];
  const special = lang === 'de' ? (w) => DE_ART.test(w.f) : trNoun;
  const task = lang === 'de' ? articleTask : locativeTask;
  const mark = lang === 'de' ? 'a' : 'l';
  return (ctx, level) => {
    const pool = words.filter((w) => w.level === level);
    const nouns = pool.filter(special);
    const modes = ['m', 'm', 'r', 'r', 'o', 's', 's'];
    for (let attempt = 0; attempt < 10; attempt++) {
      const mode = pick(ctx.rng, modes);
      let q = null;
      if (mode === 'o') q = oddTask(ctx, topic, lang, words, level);
      else if (mode === 's') {
        const fresh = nouns.filter((w) => !ctx.used?.has(`${topic}:${mark}:${w.i}`));
        if (nouns.length) q = task(ctx, topic, pick(ctx.rng, fresh.length ? fresh : nouns));
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

/** Сколько разных заданий даёт словарь на уровне (без «лишнего слова»). */
export function xWordsCount(lang, level) {
  const pool = XWORDS[lang].filter((w) => w.level === level);
  return pool.length * 2 + pool.filter(lang === 'de' ? (w) => DE_ART.test(w.f) : trNoun).length;
}
