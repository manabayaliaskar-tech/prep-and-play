// Корейский язык по уровням TOPIK 1-6: хангыль (ko.hangul), слова (ko.words) и грамматика (ko.bank:
// предложения с пропуском и спряжение по правилам). У хангыля ключ: 1 - простые слоги и буквы, 2 - сложные гласные и слоги с патчхимом.

import { pick, shuffle } from '../../core/random.js';
import { L } from '../gen.js';
import { choiceQ, freshTask, levelD, pickWrong, tri } from './asia.js';
import { KO_WORDS } from './ko-words.js';
import { KO_GRAMMAR } from './ko-grammar.js';
import { IRR_NOTE, KO_FORMS, KO_FORMS_BY_LEVEL, KO_SKIP, _hangul, koForms, koWrong } from './ko-verbs.js';

const tr = (w) => L(w.en, w.ru, w.kk);
const label = (level) => `TOPIK ${level}`;
const FILL = L('Choose the option that completes the sentence correctly.', 'Выбери вариант, который правильно дополняет предложение.', 'Сөйлемді дұрыс толықтыратын нұсқаны таңда.');

// ---------- Хангыль ----------

const INIT = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const INIT_R = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const VOW = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const VOW_R = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const FIN = { 1: ['ㄱ', 'k'], 4: ['ㄴ', 'n'], 7: ['ㄷ', 't'], 8: ['ㄹ', 'l'], 16: ['ㅁ', 'm'], 17: ['ㅂ', 'p'], 21: ['ㅇ', 'ng'] };
const BASIC = [0, 1, 2, 4, 5, 6, 8, 12, 13, 17, 18, 20];
const COMPOUND = [3, 7, 9, 10, 11, 14, 15, 16, 19];
const PLAIN = [0, 2, 3, 5, 6, 7, 9, 11, 12, 14, 15, 16, 17, 18];

const syl = (l, v, t = 0) => ({ ch: _hangul.enc(l, v, t), l, v, t, r: INIT_R[l] + VOW_R[v] + (t ? FIN[t][1] : '') });
const SYL1 = INIT_R.flatMap((_, l) => BASIC.map((v) => syl(l, v)));
const SYL2 = [
  ...INIT_R.flatMap((_, l) => COMPOUND.map((v) => syl(l, v))),
  ...PLAIN.flatMap((l) => [0, 4, 8, 13, 18, 20].flatMap((v) => Object.keys(FIN).map((t) => syl(l, v, Number(t))))),
];
/** Буквы: согласные (кроме немой ㅇ) и гласные с их звучанием. */
const LETTERS = [...[...INIT].map((c, i) => ({ c, r: INIT_R[i] })).filter((x) => x.r), ...[...VOW].map((c, i) => ({ c, r: VOW_R[i] }))];

function partsText(s) {
  const bits = [`${INIT[s.l]} (${INIT_R[s.l] || '-'})`, `${VOW[s.v]} (${VOW_R[s.v]})`];
  if (s.t) bits.push(`${FIN[s.t][0]} (${FIN[s.t][1]})`);
  return bits.join(' + ');
}

function syllableTask(ctx, topic, key, s, mode) {
  const pool = key === 1 ? SYL1 : SYL2;
  const near = pool.filter((x) => x !== s && (x.l === s.l || x.v === s.v || x.t === s.t));
  const wrong = [];
  for (const x of [...shuffle(near, ctx.rng), ...shuffle(pool, ctx.rng)]) if (wrong.length < 3 && x.r !== s.r && !wrong.includes(x)) wrong.push(x);
  const silent = s.l === 11;
  const ex = L(
    `${s.ch} = ${partsText(s)}: "${s.r}".${silent ? ' ㅇ at the start of a syllable is silent.' : ''}`,
    `${s.ch} = ${partsText(s)}: «${s.r}».${silent ? ' ㅇ в начале слога не читается.' : ''}`,
    `${s.ch} = ${partsText(s)}: «${s.r}».${silent ? ' Буын басындағы ㅇ оқылмайды.' : ''}`,
  );
  const q = mode === 'r'
    ? choiceQ(ctx, topic, { id: `${topic}:r:${s.ch}`, d: 1, passage: s.ch, prompt: L('How is this syllable read?', 'Как читается этот слог?', 'Бұл буын қалай оқылады?'), ex, all: [s, ...wrong].map((x) => x.r), label: label(key) })
    : choiceQ(ctx, topic, { id: `${topic}:s:${s.ch}`, d: 1, prompt: L(`Which syllable is read "${s.r}"?`, `Какой слог читается «${s.r}»?`, `Қай буын «${s.r}» деп оқылады?`), ex, all: [s, ...wrong].map((x) => x.ch), label: label(key) });
  q.voice = mode === 'r' ? { lang: 'ko', now: s.ch } : { lang: 'ko', after: s.ch };
  return q;
}

function letterTask(ctx, topic, x) {
  const same = LETTERS.filter((y) => y !== x && VOW.includes(y.c) === VOW.includes(x.c));
  const wrong = shuffle(same, ctx.rng).slice(0, 3);
  const vowel = VOW.includes(x.c);
  const kind = vowel ? L('vowel', 'гласная', 'дауысты') : L('consonant', 'согласная', 'дауыссыз');
  const ex = L(`${x.c} is a ${kind.en}, it sounds like "${x.r}".`, `${x.c} - ${kind.ru}, звучит как «${x.r}».`, `${x.c} - ${kind.kk}, «${x.r}» болып естіледі.`);
  return choiceQ(ctx, topic, { id: `${topic}:j:${x.c}`, d: 1, passage: x.c, prompt: L('Which sound does this letter stand for?', 'Какой звук обозначает эта буква?', 'Бұл әріп қандай дыбысты білдіреді?'), ex, all: [x, ...wrong].map((y) => y.r), label: label(1) });
}

export function hangulMaker(topic) {
  return (ctx, key) => {
    const pool = key === 2 ? SYL2 : SYL1;
    return freshTask(ctx, () => {
      const mode = pick(ctx.rng, key === 2 ? ['r', 'r', 's'] : ['r', 'r', 's', 'j']);
      if (mode === 'j') {
        const fresh = LETTERS.filter((x) => !ctx.used?.has(`${topic}:j:${x.c}`));
        return letterTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : LETTERS));
      }
      const fresh = pool.filter((s) => !ctx.used?.has(`${topic}:${mode}:${s.ch}`));
      return syllableTask(ctx, topic, key, pick(ctx.rng, fresh.length ? fresh : pool), mode);
    });
  };
}

// ---------- Слова ----------

function koWordTask(ctx, topic, w, mode) {
  const all = [w, ...pickWrong(ctx.rng, w, KO_WORDS, (x) => x.ko !== w.ko)];
  const ex = L(`${w.ko} means "${w.en}".`, `${w.ko} - «${w.ru}».`, `${w.ko} - «${w.kk}».`);
  const base = { id: `${topic}:${mode}:${w.i}`, d: levelD(w.level), ex, label: label(w.level) };
  const q = mode === 'm'
    ? choiceQ(ctx, topic, { ...base, passage: w.ko, prompt: L('What does this word mean?', 'Что значит это слово?', 'Бұл сөз нені білдіреді?'), all: all.map(tr) })
    : choiceQ(ctx, topic, { ...base, prompt: L(`How do you say "${w.en}" in Korean?`, `Как по-корейски «${w.ru}»?`, `«${w.kk}» корейше қалай айтылады?`), all: all.map((x) => x.ko) });
  q.voice = mode === 'm' ? { lang: 'ko', now: w.ko } : { lang: 'ko', after: w.ko };
  return q;
}

export function koWordsMaker(topic) {
  return (ctx, level) => {
    const pool = KO_WORDS.filter((w) => w.level === level);
    if (!pool.length) throw new Error(`${topic}: нет слов уровня ${level}`);
    return freshTask(ctx, () => {
      const mode = pick(ctx.rng, ['m', 'm', 'm', 'r', 'r']);
      const fresh = pool.filter((w) => !ctx.used?.has(`${topic}:${mode}:${w.i}`));
      return koWordTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : pool), mode);
    });
  };
}

// ---------- Грамматика ----------

const ROWS = KO_GRAMMAR.map((row, i) => ({ row, i, level: row[0] }));
const VERBS = KO_WORDS.filter((w) => w.pos === 'v' || w.pos === 'a');

function rowTask(ctx, topic, it) {
  const [level, sentence, correct, wrong, ex] = it.row;
  const q = choiceQ(ctx, topic, { id: `${topic}:${it.i}`, d: levelD(level), passage: sentence, prompt: FILL, ex: tri(ex), all: [correct, ...wrong], label: label(level) });
  q.voice = { lang: 'ko' };
  return q;
}

/** Задания на спряжение уровня: [{ w, key }]. */
function formItems(level) {
  const { forms, words } = KO_FORMS_BY_LEVEL[level];
  return VERBS.filter((w) => words.includes(w.level)).flatMap((w) => {
    const all = koForms(w);
    return forms.filter((key) => all[key] && !KO_SKIP[key]?.has(w.ko)).map((key) => ({ w, key }));
  });
}

function formTask(ctx, topic, { w, key }, level) {
  const forms = koForms(w);
  const right = forms[key];
  const wrong = [];
  for (const c of [...shuffle(koWrong(w, key), ctx.rng), ...shuffle(Object.values(forms), ctx.rng)]) {
    if (wrong.length < 3 && c && c !== right && !wrong.includes(c)) wrong.push(c);
  }
  const [name, rule] = KO_FORMS[key];
  const note = w.irr ? IRR_NOTE[w.irr] : null;
  const ex = (l) => `${w.ko} → ${right}. ${rule[l]}${note ? ` ${note[l]}` : ''}`;
  const q = choiceQ(ctx, topic, {
    id: `${topic}:c:${key}:${w.i}`, d: levelD(level), label: label(level), all: [right, ...wrong],
    prompt: L(`Choose the ${name.en} of ${w.ko} - "${w.en}".`, `Выбери ${name.ru} слова ${w.ko} - «${w.ru}».`, `${w.ko} - «${w.kk}» сөзінің ${name.kk} формасын таңда.`),
    ex: L(ex('en'), ex('ru'), ex('kk')),
  });
  q.voice = { lang: 'ko', after: right };
  return q;
}

export function koBankMaker(topic) {
  const cache = {};
  return (ctx, level) => {
    const rows = ROWS.filter((it) => it.level === level);
    const gen = (cache[level] ??= formItems(level));
    if (!rows.length && !gen.length) throw new Error(`${topic}: нет заданий уровня ${level}`);
    return freshTask(ctx, () => {
      if (rows.length && (!gen.length || ctx.rng() < 0.5)) {
        const fresh = rows.filter((it) => !ctx.used?.has(`${topic}:${it.i}`));
        return rowTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : rows));
      }
      const fresh = gen.filter((g) => !ctx.used?.has(`${topic}:c:${g.key}:${g.w.i}`));
      return formTask(ctx, topic, pick(ctx.rng, fresh.length ? fresh : gen), level);
    });
  };
}

/** Сколько разных заданий у тем на уровне (для тестов). */
export function koCounts(level) {
  return {
    words: KO_WORDS.filter((w) => w.level === level).length,
    bank: ROWS.filter((it) => it.level === level).length + formItems(level).length,
    hangul: level === 1 ? SYL1.length * 2 + LETTERS.length : level === 2 ? SYL2.length * 2 : 0,
  };
}
