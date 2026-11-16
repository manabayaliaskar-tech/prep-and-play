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
