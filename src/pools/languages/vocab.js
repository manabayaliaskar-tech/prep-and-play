// Задания на слова из общего словаря (words-a/b/c.js) для английского, испанского и французского.
// Виды заданий: что значит слово, как сказать по-иностранному, лишнее слово, артикль (род).
// Уровень — от 1 (A1) до 6 (C2). Неправильные варианты берутся из соседних уровней и, по возможности, из той же темы.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { WORDS_A1, WORDS_A2 } from './words-a.js';
import { WORDS_B1, WORDS_B2 } from './words-b.js';
import { WORDS_C1, WORDS_C2 } from './words-c.js';

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const FIELDS = ['cat', 'en', 'ru', 'kk', 'es', 'fr'];

function parse(text, level, start) {
  return text
    .trim()
    .split('\n')
    .map((line, j) => {
      const parts = line.split('|');
      if (parts.length !== FIELDS.length) throw new Error(`Словарь: ${line}`);
      return { level, i: start + j, ...Object.fromEntries(FIELDS.map((f, k) => [f, parts[k].trim()])) };
    });
}

export const WORDS = [WORDS_A1, WORDS_A2, WORDS_B1, WORDS_B2, WORDS_C1, WORDS_C2].reduce(
  (all, text, k) => all.concat(parse(text, k + 1, all.length)),
  [],
);

/** Темы словаря на трёх языках: для разбора задания «лишнее слово». */
export const CATS = {
  food: L('food', 'еда', 'тағам'),
  animal: L('animals', 'животные', 'жануарлар'),
  body: L('parts of the body', 'части тела', 'дене мүшелері'),
  people: L('people and family', 'люди и семья', 'адамдар мен отбасы'),
  home: L('home', 'дом и быт', 'үй мен тұрмыс'),
  school: L('school', 'школа', 'мектеп'),
  color: L('colours', 'цвета', 'түстер'),
  nature: L('nature and weather', 'природа и погода', 'табиғат пен ауа райы'),
  time: L('time', 'время', 'уақыт'),
  place: L('places', 'места и здания', 'орындар мен ғимараттар'),
  clothes: L('clothes', 'одежда', 'киім'),
  transport: L('transport', 'транспорт', 'көлік'),
  job: L('jobs', 'профессии', 'мамандықтар'),
  hobby: L('free time', 'досуг', 'бос уақыт'),
  health: L('health', 'здоровье', 'денсаулық'),
  work: L('work and money', 'работа и деньги', 'жұмыс пен ақша'),
  travel: L('travel', 'путешествия', 'саяхат'),
  tech: L('technology', 'техника', 'техника'),
  society: L('society', 'общество', 'қоғам'),
  science: L('science', 'наука', 'ғылым'),
  mind: L('ideas and thinking', 'мысли и идеи', 'ой мен идея'),
  feeling: L('feelings (adjectives)', 'чувства (прилагательные)', 'сезімдер (сын есімдер)'),
  verb: L('verbs', 'глаголы', 'етістіктер'),
  adj: L('adjectives', 'прилагательные', 'сын есімдер'),
};

/** Часть речи по теме: v — глагол, a — прилагательное, n — существительное. */
const group = (cat) => (cat === 'verb' ? 'v' : ['adj', 'feeling', 'color'].includes(cat) ? 'a' : 'n');
/** Близкие темы: слово одной из них нельзя считать «лишним» среди слов другой. */
const NEAR = new Set(['nature|place', 'home|place', 'school|place', 'people|job', 'travel|transport', 'travel|place', 'science|tech', 'science|nature', 'society|work', 'health|body', 'time|nature', 'mind|society', 'mind|science', 'work|job', 'hobby|school', 'home|school']);
const near = (a, b) => a === b || NEAR.has(`${a}|${b}`) || NEAR.has(`${b}|${a}`);

const LANG_NAME = {
  en: L('English', 'английском', 'ағылшын'),
  es: L('Spanish', 'испанском', 'испан'),
  fr: L('French', 'французском', 'француз'),
};

/** Все поля слов попарно различны — иначе варианты могут совпасть или оба быть верными. */
function compatible(list, w) {
  return list.every((x) => FIELDS.slice(1).every((f) => x[f].toLowerCase() !== w[f].toLowerCase()));
}

/** Подбирает неправильные варианты: сначала та же тема, затем та же часть речи, затем любые. */
function distractors(rng, answer, lang, count = 3) {
  const window = WORDS.filter((w) => w !== answer && Math.abs(w.level - answer.level) <= 1);
  const tiers = [
    window.filter((w) => w.cat === answer.cat),
    window.filter((w) => w.cat !== answer.cat && group(w.cat) === group(answer.cat)),
    WORDS.filter((w) => w !== answer && group(w.cat) === group(answer.cat)),
  ];
  const chosen = [answer];
  for (const tier of tiers) {
    for (const w of shuffle(tier, rng)) {
      if (chosen.length > count) break;
      if (lang === 'en' && w.en === answer.en) continue;
      if (compatible(chosen, w)) chosen.push(w);
    }
  }
  if (chosen.length <= count) throw new Error(`Мало вариантов для ${answer.en}`);
  return chosen.slice(1);
}

function finish(q, id, level) {
  q.id = id;
  q.level = CEFR[level - 1];
  return q;
}

/** Перевод слова на язык интерфейса. Для английского курса английский интерфейс показывает русский перевод. */
const meaningOf = (w, lang) => (lang === 'en' ? L(w.ru, w.ru, w.kk) : L(w.en, w.ru, w.kk));

function meaningTask(ctx, topic, lang, w) {
  const wrong = distractors(ctx.rng, w, lang);
  const all = [w, ...wrong];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const prompt =
    lang === 'en'
      ? L('Choose the Russian translation of this word.', 'Что значит это слово?', 'Бұл сөз нені білдіреді?')
      : L('What does this word mean?', 'Что значит это слово?', 'Бұл сөз нені білдіреді?');
  const word = w[lang];
  const ex = L(
    lang === 'en' ? `"${word}" — «${w.ru}» in Russian.` : `"${word}" means "${w.en}".`,
    `«${word}» — «${w.ru}»${lang === 'en' ? '' : ` (по-английски ${w.en})`}.`,
    `«${word}» — «${w.kk}»${lang === 'en' ? '' : ` (ағылшынша ${w.en})`}.`,
  );
  const q = poolQ(topic, 1, { kind: 'text', passage: word, prompt, ex, mc: { choices: order.map((k) => meaningOf(all[k], lang)), answer: order.indexOf(0) } });
  return finish(q, `${topic}:m:${w.i}`, w.level);
}

function reverseTask(ctx, topic, lang, w) {
  const wrong = distractors(ctx.rng, w, lang);
  const all = [w, ...wrong];
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const prompt = L(
    lang === 'en' ? `Which English word means «${w.ru}» (Russian)?` : `How do you say "${w.en}" in ${LANG_NAME[lang].en}?`,
    `Как по-${lang === 'en' ? 'английски' : lang === 'es' ? 'испански' : 'французски'} «${w.ru}»?`,
    `«${w.kk}» ${LANG_NAME[lang].kk} тілінде қалай айтылады?`,
  );
  const ex = L(`"${w.en}" — ${w[lang]}.`, `«${w.ru}» — ${w[lang]}.`, `«${w.kk}» — ${w[lang]}.`);
  const q = poolQ(topic, 2, { kind: 'text', prompt, ex, mc: { choices: order.map((k) => all[k][lang]), answer: order.indexOf(0) } });
  return finish(q, `${topic}:r:${w.i}`, w.level);
}

function oddTask(ctx, topic, lang, level) {
  const rng = ctx.rng;
  const window = WORDS.filter((w) => Math.abs(w.level - level) <= 1);
  const cats = [...new Set(window.map((w) => w.cat))].filter((c) => window.filter((w) => w.cat === c).length >= 4);
  for (let attempt = 0; attempt < 20; attempt++) {
    const cat = pick(rng, cats);
    // Среди прилагательных и глаголов «лишнее» — только другая часть речи: цвет или чувство — тоже прилагательное.
    const byPos = group(cat) !== 'n' || rng() < 0.5;
    const oddPool = window.filter((w) => (byPos ? group(w.cat) !== group(cat) : group(w.cat) === group(cat) && !near(w.cat, cat)));
    if (!oddPool.length) continue;
    const odd = pick(rng, oddPool);
    const main = [odd];
    for (const w of shuffle(window.filter((x) => x.cat === cat), rng)) {
      if (main.length === 4) break;
      if (compatible(main, w)) main.push(w);
    }
    if (main.length < 4) continue;
    const order = shuffle([0, 1, 2, 3], rng);
    const others = main.slice(1);
    const list = (l) => others.map((w) => `${w[lang]} (${l === 'en' ? (lang === 'en' ? w.ru : w.en) : w[l]})`).join(', ');
    const ex = L(
      `"${odd[lang]}" belongs to «${CATS[odd.cat].en}», the others to «${CATS[cat].en}»: ${list('en')}.`,
      `«${odd[lang]}» (${odd.ru}) — это ${CATS[odd.cat].ru}, а остальные — ${CATS[cat].ru}: ${list('ru')}.`,
      `«${odd[lang]}» (${odd.kk}) — ${CATS[odd.cat].kk}, ал қалғандары — ${CATS[cat].kk}: ${list('kk')}.`,
    );
    const prompt = L('Which word is the odd one out?', 'Какое слово лишнее?', 'Қай сөз артық?');
    const q = poolQ(topic, 2, { kind: 'text', prompt, ex, mc: { choices: order.map((k) => main[k][lang]), answer: order.indexOf(0) } });
    const key = main.map((w) => w.i).sort((a, b) => a - b).join('-');
    return finish(q, `${topic}:o:${hashString(key)}`, level);
  }
  return null;
}

const ARTICLES = {
  es: { forms: ['el', 'la', 'los', 'las'], re: /^(el|la) (.+)$/ },
  fr: { forms: ['le', 'la', 'les', "l'"], re: /^(le|la) (.+)$/ },
};

/** Существительные с артиклем единственного числа: el/la, le/la. */
const articleWords = (lang) => WORDS.filter((w) => ARTICLES[lang].re.test(w[lang]));

function articleTask(ctx, topic, lang, w) {
  const [, art, noun] = w[lang].match(ARTICLES[lang].re);
  const masc = art === 'el' || art === 'le';
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const all = [art, ...ARTICLES[lang].forms.filter((f) => f !== art)];
  // Слова-исключения испанского: el día, el mapa, el problema, la mano, la foto…
  const odd = lang === 'es' && ((masc && /a$/.test(noun)) || (!masc && /o$/.test(noun)));
  const note = odd
    ? L(' This is an exception to the -o / -a rule.', ' Это исключение из правила «-o — мужской, -a — женский».', ' Бұл «-o — еркек тек, -a — әйел тек» ережесінен ерекшелік.')
    : L('', '', '');
  const ex = L(
    `"${noun}" is ${masc ? 'masculine' : 'feminine'}: ${w[lang]} (${w.en}).${note.en}`,
    `«${noun}» — ${masc ? 'мужского' : 'женского'} рода: ${w[lang]} (${w.ru}).${note.ru}`,
    `«${noun}» — ${masc ? 'еркек' : 'әйел'} тектес: ${w[lang]} (${w.kk}).${note.kk}`,
  );
  const prompt = L('Choose the correct article.', 'Выбери правильный артикль.', 'Дұрыс артикльді таңда.');
  const q = poolQ(topic, 1, { kind: 'text', passage: `______ ${noun}`, prompt, ex, mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  return finish(q, `${topic}:a:${w.i}`, w.level);
}

/**
 * Генератор слов для языка: (ctx, уровень) → задание. Не повторяет задания внутри сессии.
 * Артикли — только на уровнях A1–B1, «лишнее слово» — на всех.
 */
export function wordsMaker(topic, lang) {
  return (ctx, level) => {
    const pool = WORDS.filter((w) => w.level === level);
    if (!pool.length) throw new Error(`Нет слов уровня ${level}`);
    const modes = ['m', 'm', 'r', 'r', 'o'];
    if (lang !== 'en' && level <= 3) modes.push('a', 'a');
    for (let attempt = 0; attempt < 8; attempt++) {
      const mode = pick(ctx.rng, modes);
      let q = null;
      if (mode === 'o') q = oddTask(ctx, topic, lang, level);
      else if (mode === 'a') {
        const nouns = articleWords(lang).filter((w) => w.level === level);
        const fresh = nouns.filter((w) => !ctx.used?.has(`${topic}:a:${w.i}`));
        if (nouns.length) q = articleTask(ctx, topic, lang, pick(ctx.rng, fresh.length ? fresh : nouns));
      } else {
        const fresh = pool.filter((w) => !ctx.used?.has(`${topic}:${mode}:${w.i}`));
        const w = pick(ctx.rng, fresh.length ? fresh : pool);
        q = mode === 'm' ? meaningTask(ctx, topic, lang, w) : reverseTask(ctx, topic, lang, w);
      }
      if (q && (!ctx.used?.has(q.id) || attempt === 7)) {
        q.d = Math.min(3, Math.ceil(level / 2));
        return q;
      }
    }
    return meaningTask(ctx, topic, lang, pick(ctx.rng, pool));
  };
}

/** Сколько разных заданий даёт словарь на уровне (без учёта «лишнего слова», где сочетаний тысячи). */
export function wordsCount(lang, level) {
  const words = WORDS.filter((w) => w.level === level).length;
  const arts = lang === 'en' || level > 3 ? 0 : articleWords(lang).filter((w) => w.level === level).length;
  return words * 2 + arts;
}

// ---------- Аналогии (ОРТ): «волк — животные = рубашка — ?» на языке интерфейса ----------

const ANALOGY_CATS = ['food', 'animal', 'body', 'home', 'school', 'clothes', 'transport', 'job', 'nature', 'place', 'color', 'people'];

export function analogyMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    const pool = WORDS.filter((w) => ANALOGY_CATS.includes(w.cat) && w.level <= d + 1);
    for (let attempt = 0; attempt < 20; attempt++) {
      const a = pick(rng, pool);
      const b = pick(rng, pool.filter((w) => w.cat !== a.cat && !near(w.cat, a.cat)));
      if (!b) continue;
      const askCat = rng() < 0.5;
      const cat = (w) => CATS[w.cat];
      let q;
      if (askCat) {
        const wrong = shuffle(ANALOGY_CATS.filter((c) => c !== b.cat && c !== a.cat && !near(c, b.cat)), rng).slice(0, 3).map((c) => CATS[c]);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`Complete the analogy: ${a.en} — ${cat(a).en} = ${b.en} — ?`, `Продолжи по аналогии: ${a.ru} — ${cat(a).ru} = ${b.ru} — ?`, `Ұқсастық бойынша жалғастыр: ${a.kk} — ${cat(a).kk} = ${b.kk} — ?`),
          ex: L(`"${a.en}" belongs to «${cat(a).en}», "${b.en}" belongs to «${cat(b).en}».`, `«${a.ru}» относится к группе «${cat(a).ru}», а «${b.ru}» — к группе «${cat(b).ru}».`, `«${a.kk}» — «${cat(a).kk}» тобына, ал «${b.kk}» — «${cat(b).kk}» тобына жатады.`),
          mc: (() => {
            const all = [cat(b), ...wrong];
            const order = shuffle([0, 1, 2, 3], rng);
            return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
          })(),
        });
      } else {
        const others = [];
        for (const w of shuffle(pool.filter((x) => x.cat !== b.cat && !near(x.cat, b.cat)), rng)) {
          if (others.length === 3) break;
          if (compatible([b, a, ...others], w)) others.push(w);
        }
        if (others.length < 3) continue;
        const all = [b, ...others].map((w) => L(w.en, w.ru, w.kk));
        const order = shuffle([0, 1, 2, 3], rng);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`Complete the analogy: ${a.en} — ${cat(a).en} = ? — ${cat(b).en}`, `Продолжи по аналогии: ${a.ru} — ${cat(a).ru} = ? — ${cat(b).ru}`, `Ұқсастық бойынша жалғастыр: ${a.kk} — ${cat(a).kk} = ? — ${cat(b).kk}`),
          ex: L(`Of these words only "${b.en}" belongs to «${cat(b).en}».`, `Из этих слов только «${b.ru}» относится к группе «${cat(b).ru}».`, `Бұл сөздердің ішінде тек «${b.kk}» «${cat(b).kk}» тобына жатады.`),
          mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) },
        });
      }
      q.id = `${topic}:${askCat ? 'c' : 'w'}:${a.i}:${b.i}`;
      if (!ctx.used?.has(q.id) || attempt > 15) return q;
    }
    return null;
  };
}
