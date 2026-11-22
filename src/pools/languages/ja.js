// Японский язык по уровням JLPT: азбука (ja.kana), слова (ja.words), иероглифы (ja.kanji)
// и грамматика (ja.bank: предложения с пропуском, спряжение глаголов, вежливая речь).
// Уровень слов, кандзи и грамматики: 1 - N5 … 5 - N1. У азбуки ключ: 1 - хирагана, 2 - катакана, 3 - слова каной.

import { pick, shuffle } from '../../core/random.js';
import { L } from '../gen.js';
import { choiceQ, freshTask, levelD, pickWrong, tri } from './asia.js';
import { JA_WORDS, JLPT } from './ja-words.js';
import { KANJI } from './ja-kanji.js';
import { KANA, LOANWORDS, romaji, toHira } from './ja-kana.js';
import { JA_GRAMMAR } from './ja-grammar.js';
import { FORMS_BY_LEVEL, FORM_NAMES, FORM_RULES, KEIGO, KEIGO_GO, KEIGO_O, LIMITED, conjugate, keigoForms, verbClass, wrongForms } from './ja-verbs.js';

const tr = (w) => L(w.en, w.ru, w.kk);
const FILL = L('Choose the option that completes the sentence correctly.', 'Выбери вариант, который правильно дополняет предложение.', 'Сөйлемді дұрыс толықтыратын нұсқаны таңда.');
const MEAN = L('What does this word mean?', 'Что значит это слово?', 'Бұл сөз нені білдіреді?');

// ---------- Азбука ----------

function kanaTask(ctx, topic, script, x, mode) {
  const ch = script === 'h' ? x.h : x.k;
  const sameKind = KANA.filter((y) => y !== x && y.kind === x.kind);
  const wrong = shuffle(sameKind.length >= 3 ? sameKind : KANA.filter((y) => y !== x), ctx.rng).slice(0, 3);
  const all = [x, ...wrong];
  const name = script === 'h' ? L('hiragana', 'хирагана', 'хирагана') : L('katakana', 'катакана', 'катакана');
  const ex = L(`${ch} (${name.en}) is read "${x.r}".`, `${ch} (${name.ru}) читается «${x.r}».`, `${ch} (${name.kk}) «${x.r}» деп оқылады.`);
  const q = mode === 'r'
    ? choiceQ(ctx, topic, { id: `${topic}:${script}r:${x.i}`, d: 1, passage: ch, prompt: L('How is this kana read?', 'Как читается этот знак?', 'Бұл таңба қалай оқылады?'), ex, all: all.map((y) => y.r), label: 'N5' })
    : choiceQ(ctx, topic, {
        id: `${topic}:${script}k:${x.i}`, d: 1, ex, label: 'N5',
        prompt: L(`Which ${name.en} is read "${x.r}"?`, `Какой знак (${name.ru}) читается «${x.r}»?`, `Қай таңба (${name.kk}) «${x.r}» деп оқылады?`),
        all: all.map((y) => (script === 'h' ? y.h : y.k)),
      });
  q.voice = mode === 'r' ? { lang: 'ja', now: ch } : { lang: 'ja', after: ch };
  return q;
}

const KANA_WORDS = JA_WORDS.filter((w) => w.level === 1).map((w) => ({ ...w, rom: romaji(w.kana) }));

function kanaWordTask(ctx, topic, mode) {
  if (mode === 'w') {
    const fresh = KANA_WORDS.filter((w) => !ctx.used?.has(`${topic}:w:${w.i}`));
    const w = pick(ctx.rng, fresh.length ? fresh : KANA_WORDS);
    const near = (x) => Math.abs(x.rom.length - w.rom.length) <= 2;
    const wrong = [];
    for (const x of [...shuffle(KANA_WORDS.filter(near), ctx.rng), ...shuffle(KANA_WORDS, ctx.rng)]) {
      if (wrong.length < 3 && x.rom !== w.rom && !wrong.some((y) => y.rom === x.rom)) wrong.push(x);
    }
    const ex = L(`${w.kana} is read "${w.rom}" - "${w.en}".`, `${w.kana} читается «${w.rom}» - «${w.ru}».`, `${w.kana} «${w.rom}» деп оқылады - «${w.kk}».`);
    const q = choiceQ(ctx, topic, { id: `${topic}:w:${w.i}`, d: 1, passage: w.kana, prompt: L('How is this word read?', 'Как читается это слово?', 'Бұл сөз қалай оқылады?'), ex, all: [w.rom, ...wrong.map((x) => x.rom)], label: 'N5' });
    q.voice = { lang: 'ja', now: w.kana };
    return q;
  }
  const fresh = LOANWORDS.filter((w) => !ctx.used?.has(`${topic}:${mode}:${w.i}`));
  const w = pick(ctx.rng, fresh.length ? fresh : LOANWORDS);
  const wrong = pickWrong(ctx.rng, w, LOANWORDS);
  const all = [w, ...wrong];
  const ex = L(`${w.kana} (${romaji(w.kana)}) - "${w.en}". Loanwords are written in katakana.`, `${w.kana} (${romaji(w.kana)}) - «${w.ru}». Заимствованные слова пишут катаканой.`, `${w.kana} (${romaji(w.kana)}) - «${w.kk}». Кірме сөздер катаканамен жазылады.`);
  const q = mode === 'l'
    ? choiceQ(ctx, topic, { id: `${topic}:l:${w.i}`, d: 1, passage: w.kana, prompt: MEAN, ex, all: all.map(tr), label: 'N5' })
    : choiceQ(ctx, topic, { id: `${topic}:L:${w.i}`, d: 1, prompt: L(`Which katakana word means "${w.en}"?`, `Какое слово катаканой значит «${w.ru}»?`, `Қай катакана сөзі «${w.kk}» дегенді білдіреді?`), ex, all: all.map((x) => x.kana), label: 'N5' });
  q.voice = mode === 'l' ? { lang: 'ja', now: w.kana } : { lang: 'ja', after: w.kana };
  return q;
}

export function kanaMaker(topic) {
  return (ctx, key) => {
    if (key === 3) return freshTask(ctx, () => kanaWordTask(ctx, topic, pick(ctx.rng, ['w', 'w', 'l', 'L'])));
    const script = key === 2 ? 'k' : 'h';
    return freshTask(ctx, () => {
      const mode = pick(ctx.rng, ['r', 'r', 'k']);
      const fresh = KANA.filter((x) => !ctx.used?.has(`${topic}:${script}${mode}:${x.i}`));
      return kanaTask(ctx, topic, script, pick(ctx.rng, fresh.length ? fresh : KANA), mode);
    });
  };
}

// ---------- Слова ----------

/** На уровнях N5-N4 рядом с иероглифами показываем чтение каной (у всех вариантов - по уровню задания). */
const shownWord = (w, level = w.level) => (level <= 2 && !w.kanaOnly ? `${w.jp} (${w.kana})` : w.jp);

function wordTask(ctx, topic, w, mode) {
  const ok = mode === 'p' ? (x) => toHira(x.kana) !== toHira(w.kana) : (x) => x.jp !== w.jp;
  const all = [w, ...pickWrong(ctx.rng, w, JA_WORDS, ok)];
  const reading = w.kanaOnly ? '' : ` (${w.kana})`;
  const ex = L(`${w.jp}${reading} means "${w.en}".`, `${w.jp}${reading} - «${w.ru}».`, `${w.jp}${reading} - «${w.kk}».`);
  const base = { id: `${topic}:${mode}:${w.i}`, d: levelD(w.level), ex, label: JLPT[w.level - 1] };
  let q;
  if (mode === 'm') q = choiceQ(ctx, topic, { ...base, passage: shownWord(w), prompt: MEAN, all: all.map(tr) });
  else if (mode === 'r') q = choiceQ(ctx, topic, { ...base, prompt: L(`How do you say "${w.en}" in Japanese?`, `Как по-японски «${w.ru}»?`, `«${w.kk}» жапонша қалай айтылады?`), all: all.map((x) => shownWord(x, w.level)) });
  else q = choiceQ(ctx, topic, { ...base, passage: w.jp, prompt: L('How is this word read?', 'Как читается это слово?', 'Бұл сөз қалай оқылады?'), all: all.map((x) => x.kana) });
  q.voice = mode === 'm' ? { lang: 'ja', now: w.kana } : { lang: 'ja', after: w.kana };
  return q;
}

export function jaWordsMaker(topic) {
  return (ctx, level) => {
    const pool = JA_WORDS.filter((w) => w.level === level);
    if (!pool.length) throw new Error(`${topic}: нет слов уровня ${level}`);
    return freshTask(ctx, () => {
      const mode = pick(ctx.rng, ['m', 'm', 'r', 'r', 'p']);
      const list = mode === 'p' ? pool.filter((w) => !w.kanaOnly) : pool;
      const fresh = list.filter((w) => !ctx.used?.has(`${topic}:${mode}:${w.i}`));
      return wordTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : list), mode);
    });
  };
}

// ---------- Иероглифы ----------

const baseReading = (r) => toHira(r.replace(/\(.*\)/, ''));
const readingsOf = (k) => [...k.on, ...k.kun];

function kanjiEx(k) {
  const on = k.on.join('、');
  const kun = k.kun.join('、');
  const part = (a, b) => [on && `${a} ${on}`, kun && `${b} ${kun}`].filter(Boolean).join(', ');
  return L(
    `${k.kj}: ${part('on-reading', 'kun-reading')} - "${k.en}".`,
    `${k.kj}: ${part('онное чтение', 'кунное')} - «${k.ru}».`,
    `${k.kj}: ${part('он оқылуы', 'кун оқылуы')} - «${k.kk}».`,
  );
}

function kanjiTask(ctx, topic, k, mode) {
  const base = { id: `${topic}:${mode}:${k.i}`, d: levelD(k.level), ex: kanjiEx(k), label: JLPT[k.level - 1] };
  let q;
  if (mode === 'p') {
    const right = pick(ctx.rng, readingsOf(k));
    const own = new Set(readingsOf(k).map(baseReading));
    const others = shuffle(KANJI.filter((x) => x !== k && Math.abs(x.level - k.level) <= 1).flatMap(readingsOf), ctx.rng);
    const wrong = [];
    for (const r of others) {
      const b = baseReading(r);
      if (wrong.length === 3) break;
      if (!own.has(b) && !wrong.some((w) => baseReading(w) === b)) wrong.push(r);
    }
    q = choiceQ(ctx, topic, { ...base, passage: k.kj, prompt: L('Which of these is a reading of this kanji?', 'Какое из чтений принадлежит этому иероглифу?', 'Бұл иероглифтің оқылуы қайсы?'), all: [right, ...wrong] });
  } else {
    const all = [k, ...pickWrong(ctx.rng, k, KANJI)];
    q = mode === 'm'
      ? choiceQ(ctx, topic, { ...base, passage: k.kj, prompt: L('What does this kanji mean?', 'Что значит этот иероглиф?', 'Бұл иероглиф нені білдіреді?'), all: all.map(tr) })
      : choiceQ(ctx, topic, { ...base, prompt: L(`Which kanji means "${k.en}"?`, `Какой иероглиф значит «${k.ru}»?`, `Қай иероглиф «${k.kk}» дегенді білдіреді?`), all: all.map((x) => x.kj) });
  }
  return q;
}

export function kanjiMaker(topic) {
  return (ctx, level) => {
    const pool = KANJI.filter((k) => k.level === level);
    if (!pool.length) throw new Error(`${topic}: нет кандзи уровня ${level}`);
    return freshTask(ctx, () => {
      const mode = pick(ctx.rng, ['m', 'm', 'k', 'p', 'p']);
      const list = mode === 'p' ? pool.filter((k) => readingsOf(k).length) : pool;
      const fresh = list.filter((k) => !ctx.used?.has(`${topic}:${mode}:${k.i}`));
      return kanjiTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : list), mode);
    });
  };
}

// ---------- Грамматика ----------

const ROWS = JA_GRAMMAR.map((row, i) => ({ row, i, level: row[0] }));
const VERBS = JA_WORDS.filter((w) => w.pos === 'v');
const VERB_LEVELS = { 1: [1], 2: [1, 2], 3: [2, 3] };
const CLS_INDEX = { godan: 0, ichidan: 1, suru: 2, kuru: 2 };

function rowTask(ctx, topic, it) {
  const [level, sentence, correct, wrong, ex] = it.row;
  const q = choiceQ(ctx, topic, { id: `${topic}:${it.i}`, d: levelD(level), passage: sentence, prompt: FILL, ex: tri(ex), all: [correct, ...wrong], label: JLPT[level - 1] });
  q.voice = { lang: 'ja' };
  return q;
}

/** Задания на спряжение уровня: [{ w, key }]. */
function conjugationItems(level) {
  const levels = VERB_LEVELS[level];
  if (!levels) return [];
  return VERBS.filter((w) => levels.includes(w.level)).flatMap((w) =>
    FORMS_BY_LEVEL[level].filter((key) => !LIMITED[w.jp] || LIMITED[w.jp].includes(key)).map((key) => ({ w, key })),
  );
}

function conjugationTask(ctx, topic, { w, key }, level) {
  const forms = conjugate(w.jp, w.kana);
  const right = forms[key];
  const cands = [...shuffle(wrongForms(w.jp, w.kana, key), ctx.rng), ...shuffle(Object.values(forms), ctx.rng)];
  const wrong = [];
  for (const c of cands) if (wrong.length < 3 && c && c !== right && !wrong.includes(c)) wrong.push(c);
  const name = FORM_NAMES[key];
  const shown = w.kanaOnly ? w.jp : `${w.jp} (${w.kana})`;
  const rule = FORM_RULES[key][CLS_INDEX[verbClass(w.jp, w.kana)]];
  const q = choiceQ(ctx, topic, {
    id: `${topic}:c:${key}:${w.i}`, d: levelD(level), label: JLPT[level - 1], all: [right, ...wrong],
    prompt: L(`Choose the ${name.en} of ${shown} - "${w.en}".`, `Выбери ${name.ru} глагола ${shown} - «${w.ru}».`, `${shown} - «${w.kk}» етістігінің ${name.kk} таңда.`),
    ex: L(`${w.jp} → ${right}. ${rule.en}`, `${w.jp} → ${right}. ${rule.ru}`, `${w.jp} → ${right}. ${rule.kk}`),
  });
  q.voice = { lang: 'ja', after: right };
  return q;
}

const HON = L('honorific form (sonkeigo, respect for others)', 'почтительную форму (сонкэйго - уважение к собеседнику)', 'құрмет формасын (сонкэйго - өзгені құрметтеу)');
const HUM = L('humble form (kenjougo, lowering yourself)', 'скромную форму (кэндзёго - принижение себя)', 'кішірейту формасын (кэндзёго - өзін төмен ұстау)');
const ALL_KEIGO = [...new Set(KEIGO.flatMap(([, , hon, hum]) => [...hon, ...hum]))];

function keigoTask(ctx, topic, idx, type, level) {
  const [plain, , hon, hum] = KEIGO[idx];
  const valid = type === 'hon' ? hon : hum;
  const other = type === 'hon' ? hum : hon;
  const cands = [...shuffle(other, ctx.rng), ...shuffle(ALL_KEIGO, ctx.rng)];
  const wrong = [];
  for (const c of cands) if (wrong.length < 3 && !valid.includes(c) && !wrong.includes(c)) wrong.push(c);
  const name = type === 'hon' ? HON : HUM;
  const h = hon.join('、') || '-';
  const u = hum.join('、') || '-';
  return choiceQ(ctx, topic, {
    id: `${topic}:k:${type}:${idx}`, d: levelD(level), label: JLPT[level - 1], all: [valid[0], ...wrong],
    prompt: L(`Choose the ${name.en} of ${plain}.`, `Выбери ${name.ru} глагола ${plain}.`, `${plain} етістігінің ${name.kk} таңда.`),
    ex: L(`${plain}: honorific - ${h}; humble - ${u}.`, `${plain}: почтительная форма - ${h}; скромная - ${u}.`, `${plain}: құрмет формасы - ${h}; кішірейту формасы - ${u}.`),
  });
}

const GENERIC = [...KEIGO_O, ...KEIGO_GO];
function genericTask(ctx, topic, idx, type, level) {
  const f = keigoForms(GENERIC[idx]);
  const right = type === 'hon' ? f.hon : f.hum;
  const wrong = [type === 'hon' ? f.hum : f.hon, ...shuffle(type === 'hon' ? f.wrongHon : f.wrongHum, ctx.rng)].filter((x) => x !== right).slice(0, 3);
  const name = type === 'hon' ? HON : HUM;
  const shown = f.kana ? `${f.dict} (${f.kana})` : f.dict;
  return choiceQ(ctx, topic, {
    id: `${topic}:g:${type}:${idx}`, d: levelD(level), label: JLPT[level - 1], all: [right, ...wrong],
    prompt: L(`Choose the ${name.en} of ${shown}.`, `Выбери ${name.ru} глагола ${shown}.`, `${shown} етістігінің ${name.kk} таңда.`),
    ex: L(
      `${f.hon} is honorific, ${f.hum} is humble. Native verbs take お + stem, Sino-Japanese する-verbs take ご + noun.`,
      `${f.hon} - почтительная форма, ${f.hum} - скромная. Японские глаголы берут お + основа, китайские する-глаголы - ご + существительное.`,
      `${f.hon} - құрмет формасы, ${f.hum} - кішірейту формасы. Жапон етістіктері お + түбір, қытайдан келген する-етістіктер ご + зат есім алады.`,
    ),
  });
}

/** Сгенерированные задания уровня: функции (ctx) → задание с известным id. */
function generatedItems(topic, level) {
  if (level <= 3) return conjugationItems(level).map((it) => ({ id: `${topic}:c:${it.key}:${it.w.i}`, make: (ctx) => conjugationTask(ctx, topic, it, level) }));
  const out = [];
  const types = level === 4 ? ['hon'] : ['hon', 'hum'];
  KEIGO.forEach(([, , hon, hum], idx) => {
    for (const type of types) if ((type === 'hon' ? hon : hum).length) out.push({ id: `${topic}:k:${type}:${idx}`, make: (ctx) => keigoTask(ctx, topic, idx, type, level) });
  });
  GENERIC.forEach((_, idx) => {
    for (const type of level === 4 ? ['hon', 'hum'] : ['hum']) out.push({ id: `${topic}:g:${type}:${idx}`, make: (ctx) => genericTask(ctx, topic, idx, type, level) });
  });
  return out;
}

export function jaBankMaker(topic) {
  const cache = {};
  return (ctx, level) => {
    const rows = ROWS.filter((it) => it.level === level);
    const gen = (cache[level] ??= generatedItems(topic, level));
    if (!rows.length && !gen.length) throw new Error(`${topic}: нет заданий уровня ${level}`);
    return freshTask(ctx, () => {
      const useRows = rows.length && (!gen.length || ctx.rng() < 0.5);
      if (useRows) {
        const fresh = rows.filter((it) => !ctx.used?.has(`${topic}:${it.i}`));
        return rowTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : rows));
      }
      const fresh = gen.filter((g) => !ctx.used?.has(g.id));
      return pick(ctx.rng, fresh.length ? fresh : gen).make(ctx);
    });
  };
}

/** Сколько разных заданий у каждой темы на уровне (для тестов и описаний). */
export function jaCounts(level) {
  const words = JA_WORDS.filter((w) => w.level === level);
  const kanji = KANJI.filter((k) => k.level === level);
  return {
    words: words.length,
    kanji: kanji.length,
    bank: ROWS.filter((it) => it.level === level).length + generatedItems('ja.bank', level).length,
  };
}
