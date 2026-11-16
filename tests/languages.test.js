import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../src/pools/topics.js';
import { buildTopicSet } from '../src/pools/stream.js';
import { WORDS } from '../src/pools/languages/vocab.js';
import { HANZI } from '../src/pools/languages/hanzi.js';
import { _forms } from '../src/pools/languages/verbs.js';
import { IRREGULAR_VERBS } from '../src/pools/english/verbs.js';
import { COURSES } from '../src/catalog/courses.js';
import { createRng } from '../src/core/random.js';

const LANGS = ['en', 'ru', 'kk'];
const text = (x, l = 'en') => (x !== null && typeof x === 'object' ? x[l] : String(x));

function check(q, label) {
  const blob = JSON.stringify([q.prompt, q.choices, q.ex, q.passage ?? '']);
  assert.ok(!/NaN|undefined|null/.test(blob), `${label}: ${blob.slice(0, 200)}`);
  assert.ok([1, 2, 3].includes(q.d), `${label}: сложность`);
  assert.equal(q.type, 'mc', label);
  assert.equal(q.choices.length, 4, label);
  for (const l of LANGS) {
    assert.ok(text(q.prompt, l).length > 3, `${label}: условие ${l}`);
    assert.ok(text(q.ex, l).length > 5, `${label}: разбор ${l}`);
    assert.equal(new Set(q.choices.map((c) => text(c, l))).size, 4, `${label}: повтор вариантов (${l}) ${q.choices.map((c) => text(c, l)).join(' | ')}`);
  }
  if (q.passage) assert.ok((q.passage.match(/_{3,}/g) ?? []).length <= 1, `${label}: один пропуск`);
}

const GENERATED = ['e.words', 'e.gram', 'e.irreg', 'e.comp', 'es.words', 'es.verbs', 'fr.words', 'fr.verbs', 'zh.words'];

test('языковые генераторы: каждое задание корректно на всех уровнях', () => {
  for (const id of GENERATED) {
    for (let level = 1; level <= 6; level++) {
      for (let s = 0; s < 150; s++) {
        const q = TOPICS[id].make({ rng: createRng(s * 7 + level), used: new Set() }, level);
        check(q, `${id} L${level} s${s}`);
        assert.equal(q.skill, id);
      }
    }
  }
});

test('языковые генераторы: в каждом уровне сотни разных заданий', () => {
  for (const id of GENERATED) {
    for (let level = 1; level <= 6; level++) {
      const ids = new Set();
      const rng = createRng(level);
      for (let s = 0; s < 1500; s++) ids.add(TOPICS[id].make({ rng, used: new Set() }, level).id);
      const min = id === 'e.comp' ? 25 : id === 'e.irreg' ? 30 : 100;
      assert.ok(ids.size >= min, `${id} L${level}: разных заданий ${ids.size}`);
    }
  }
});

test('словари: слова и переводы не повторяются, у каждого слова пять языков', () => {
  for (const field of ['en', 'es', 'fr']) {
    const seen = new Map();
    for (const w of WORDS) {
      assert.ok(!seen.has(w[field]), `повтор «${w[field]}» (${field})`);
      seen.set(w[field], w);
    }
  }
  assert.ok(WORDS.length >= 550, `слов ${WORDS.length}`);
  for (let level = 1; level <= 6; level++) assert.ok(WORDS.filter((w) => w.level === level).length >= 50, `уровень ${level}`);
  const hz = new Set();
  for (const w of HANZI) {
    assert.ok(!hz.has(w.hz), `повтор ${w.hz}`);
    hz.add(w.hz);
    assert.ok(/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü']/i.test(w.py), `пиньинь ${w.hz}`);
  }
  for (let level = 1; level <= 6; level++) assert.ok(HANZI.filter((w) => w.level === level).length >= 40, `HSK ${level}`);
});

test('спряжение: правильные формы основных глаголов', () => {
  assert.deepEqual(_forms.es('hablar', 'pres'), ['hablo', 'hablas', 'habla', 'hablamos', 'hablan']);
  assert.deepEqual(_forms.es('comer', 'pret'), ['comí', 'comiste', 'comió', 'comimos', 'comieron']);
  assert.deepEqual(_forms.es('vivir', 'impsubj'), ['viviera', 'vivieras', 'viviera', 'viviéramos', 'vivieran']);
  assert.deepEqual(_forms.es('tener', 'fut'), ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendrán']);
  assert.deepEqual(_forms.es('ser', 'subj'), ['sea', 'seas', 'sea', 'seamos', 'sean']);
  assert.deepEqual(_forms.fr('parler', 'imp'), ['parlais', 'parlais', 'parlait', 'parlions', 'parliez', 'parlaient']);
  assert.deepEqual(_forms.fr('finir', 'subj'), ['finisse', 'finisses', 'finisse', 'finissions', 'finissiez', 'finissent']);
  assert.deepEqual(_forms.fr('avoir', 'fut'), ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront']);
  assert.deepEqual(_forms.fr('faire', 'pc'), ['ai fait', 'as fait', 'a fait', 'avons fait', 'avez fait', 'ont fait']);
  assert.equal(_forms.withPronoun('je', 'aime'), "j'aime");
  assert.equal(_forms.withPronoun('je', 'habite'), "j'habite");
  assert.equal(_forms.withQue('il parle'), "qu'il parle");
  // Все формы всех глаголов во всех временах построены.
  for (const v of _forms.ES_VERBS) for (const t of ['pres', 'pret', 'imp', 'fut', 'cond', 'subj', 'impsubj']) assert.ok(_forms.es(v.inf, t).every((f) => f && !f.includes('undefined')), `${v.inf} ${t}`);
  for (const v of _forms.FR_VERBS) for (const t of ['pres', 'imp', 'fut', 'cond', 'subj', ...(v.etre ? [] : ['pc', 'pqp'])]) assert.ok(_forms.fr(v.inf, t).every((f) => f && !f.includes('undefined')), `${v.inf} ${t}`);
});

test('неправильные глаголы английского: «правильная» ловушка не совпадает с настоящей формой', () => {
  for (const v of IRREGULAR_VERBS) {
    const fake = v.base.endsWith('e') ? `${v.base}d` : `${v.base}ed`;
    assert.ok(fake !== v.past && fake !== v.pp, v.base);
  }
});

test('испанский, французский — 6 уровней, китайский — HSK 1–6; в тренировке нет повторов', () => {
  for (const id of ['spanish', 'french', 'chinese', 'english', 'hsk']) {
    const course = COURSES.find((c) => c.id === id);
    assert.equal(course.tracks.length, 6, id);
    for (const track of course.tracks) {
      const set = buildTopicSet({ rng: createRng(3), spec: track.spec, count: 30 });
      assert.equal(new Set(set.map((q) => q.id)).size, 30, `${id}/${track.id}: повтор`);
    }
  }
});

// ---------- Естественные науки и география ----------

const SCIENCE = ['g.world', 'g.records', 'g.kz', 'c.elem', 'c.salts', 'b.animals', 'b.body', 'b.cell', 'b.gen', 'p.facts', 'i.facts'];

test('генераторы наук: корректные задания на каждой сложности', () => {
  for (const id of SCIENCE) {
    for (let d = 1; d <= 3; d++) {
      for (let s = 0; s < 120; s++) {
        const q = TOPICS[id].make({ rng: createRng(s * 11 + d), used: new Set(), mcOnly: s % 2 === 0 }, d);
        const blob = JSON.stringify([q.prompt, q.choices ?? '', q.ex, q.display ?? '']);
        assert.ok(!/\bNaN\b|undefined/.test(blob), `${id} d${d}: ${blob.slice(0, 200)}`);
        assert.equal(q.d, d, id);
        for (const l of LANGS) {
          assert.ok(text(q.prompt, l).length > 5, `${id}: условие ${l}`);
          if (q.type === 'mc') assert.equal(new Set(q.choices.map((c) => text(c, l))).size, q.choices.length, `${id}: повтор вариантов ${l} ${q.choices.map((c) => text(c, l))}`);
        }
      }
    }
  }
});

test('химия: формулы солей сходятся по зарядам, молярные массы верны', async () => {
  const { COMPOUNDS, ELEMENTS } = await import('../src/pools/science/chem-gen.js');
  const mass = Object.fromEntries(ELEMENTS.map((e) => [e.sym, e.mass]));
  for (const c of COMPOUNDS) {
    assert.equal(c.x * c.cat[1], c.y * c.an[2], c.formula);
    assert.equal(c.mass, c.atoms.reduce((s, [el, k]) => s + mass[el] * k, 0), c.formula);
  }
  const f = (formula) => COMPOUNDS.find((c) => c.formula === formula);
  assert.ok(f('Al₂(SO₄)₃') && f('Ca₃(PO₄)₂') && f('Fe₂O₃') && f('NaCl'));
  assert.equal(f('Al₂(SO₄)₃').mass, 342);
  assert.ok(!COMPOUNDS.some((c) => c.formula.startsWith('Al') && c.an[0] === 'CO₃'), 'карбоната алюминия не существует');
});

test('генетика и география: ответы проверяются независимо', async () => {
  for (let s = 0; s < 200; s++) {
    const q = TOPICS['b.gen'].make({ rng: createRng(s), used: new Set() }, 3);
    const [, kind, a, b] = q.id.split(':');
    if (kind === 'dna') {
      const map = a === 'r' ? { A: 'U', T: 'A', G: 'C', C: 'G' } : { A: 'T', T: 'A', G: 'C', C: 'G' };
      assert.equal(q.choices[q.answer], b.split('-').map((x) => map[x]).join('-'));
    }
  }
  const { COUNTRIES } = await import('../src/pools/science/geo.js');
  assert.ok(COUNTRIES.length >= 110, `стран ${COUNTRIES.length}`);
  assert.equal(new Set(COUNTRIES.map((c) => c.name.en)).size, COUNTRIES.length);
  assert.equal(new Set(COUNTRIES.map((c) => c.capital.ru)).size, COUNTRIES.length);
});

test('науки: не меньше 6 уровней в каждом курсе, информатика — отдельный курс', () => {
  for (const id of ['physics', 'chemistry', 'biology', 'geography', 'informatics']) {
    const course = COURSES.find((c) => c.id === id);
    assert.ok(course.tracks.length >= 6, id);
    for (const track of course.tracks) {
      const set = buildTopicSet({ rng: createRng(5), spec: track.spec, count: 20 });
      assert.equal(new Set(set.map((q) => q.id)).size, 20, `${id}/${track.id}: повтор`);
    }
  }
});

// ---------- История, русский язык, обществознание ----------

test('гуманитарные генераторы: корректные задания, ответы по хронологии верны', async () => {
  for (const id of ['h.kzt', 'h.wt', 'h.rut', 'l.rugen', 's.terms']) {
    for (let d = 1; d <= 3; d++) {
      for (let s = 0; s < 150; s++) {
        const q = TOPICS[id].make({ rng: createRng(s * 13 + d), used: new Set() }, d);
        const blob = JSON.stringify([q.prompt, q.choices, q.ex]);
        assert.ok(!/\bNaN\b|undefined|null/.test(blob), `${id}: ${blob.slice(0, 200)}`);
        assert.equal(q.choices.length, 4, id);
        for (const l of LANGS) assert.equal(new Set(q.choices.map((c) => text(c, l))).size, 4, `${id}: повтор ${l}`);
      }
    }
  }
  const { KZ_EVENTS, WORLD_EVENTS, RU_EVENTS } = await import('../src/pools/humanities/timeline.js');
  for (const table of [KZ_EVENTS, WORLD_EVENTS, RU_EVENTS]) {
    for (const line of table.trim().split('\n')) {
      const [year, en, ru, kk] = line.split('|');
      assert.ok(Number.isInteger(Number(year)) && Number(year) <= 2025 && en && ru && kk, line);
    }
  }
});

test('ударения: верный и неверный вариант — одно и то же слово, ударная буква одна', async () => {
  const src = (await import('node:fs')).readFileSync('src/pools/humanities/ru-gen.js', 'utf8');
  const block = src.slice(src.indexOf('const STRESS'), src.indexOf('`).map', src.indexOf('const STRESS')));
  const pairs = block.split('\n').filter((l) => /^\d\|/.test(l)).map((l) => l.split('|'));
  assert.ok(pairs.length >= 40);
  for (const [, ok, bad] of pairs) {
    const norm = (w) => w.toLowerCase().replace(/ё/g, 'е');
    assert.equal(norm(ok), norm(bad), ok);
    assert.notEqual(ok, bad);
    for (const w of [ok, bad]) assert.equal((w.match(/[АЕЁИОУЫЭЮЯ]/g) ?? []).length, 1, w);
  }
});
