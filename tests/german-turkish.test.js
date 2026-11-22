// Немецкий и турецкий: банки, слова, спряжение, курсы и экзамены.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../src/pools/topics.js';
import { buildTopicSet } from '../src/pools/stream.js';
import { COURSES } from '../src/catalog/courses.js';
import { createRng } from '../src/core/random.js';
import { GERMAN } from '../src/pools/languages/de.js';
import { TURKISH } from '../src/pools/languages/tr.js';
import { XWORDS, xWordsCount } from '../src/pools/languages/xwords.js';
import { _de } from '../src/pools/languages/de-verbs.js';
import { noun, part, verb } from '../src/pools/languages/tr-morph.js';
import { LESSONS } from '../src/content/lessons/index.js';
import { deck } from '../src/core/cards.js';

const LANGS = ['en', 'ru', 'kk'];
const text = (x, l = 'en') => (x !== null && typeof x === 'object' ? x[l] : String(x));
const TOPIC_IDS = ['de.bank', 'de.words', 'de.verbs', 'tr.bank', 'tr.words', 'tr.verbs'];

test('немецкий и турецкий банк: по 70+ заданий на уровень, ровно один пропуск, разбор на трёх языках', () => {
  for (const [name, rows] of Object.entries({ GERMAN, TURKISH })) {
    for (let level = 1; level <= 6; level++) {
      const n = rows.filter((r) => r[0] === level).length;
      assert.ok(n >= 70, `${name} уровень ${level}: ${n}`);
    }
    const seen = new Set();
    for (const [level, q, ok, wrong, ex] of rows) {
      const key = `${q}|${ok}`;
      assert.ok(!seen.has(key), `${name}: повтор ${key}`);
      seen.add(key);
      assert.ok(level >= 1 && level <= 6);
      assert.equal(q.match(/_{3,}/g)?.length, 1, `${name}: один пропуск - ${q}`);
      assert.equal(wrong.length, 3, q);
      assert.equal(new Set([ok, ...wrong]).size, 4, `${name}: повтор вариантов - ${q}`);
      for (const l of LANGS) {
        assert.ok(text(ex, l).length > 20, `${name}: разбор ${l} - ${q}`);
        assert.ok(!/[—–]|undefined|NaN/.test(text(ex, l)), `${name}: ${text(ex, l)}`);
      }
    }
  }
});

test('немецкий и турецкий: генераторы дают корректные задания и много разных на каждом уровне', () => {
  const min = { 'de.bank': 70, 'tr.bank': 70, 'de.verbs': 70, 'tr.verbs': 70 };
  for (const id of TOPIC_IDS) {
    assert.ok(TOPICS[id], id);
    for (let level = 1; level <= 6; level++) {
      const ids = new Set();
      const rng = createRng(level * 3);
      for (let s = 0; s < 1200; s++) {
        const q = TOPICS[id].make({ rng, used: new Set() }, level);
        ids.add(q.id);
        if (s % 6) continue;
        const blob = JSON.stringify([q.prompt, q.choices, q.ex, q.passage ?? '']);
        assert.ok(!/NaN|undefined|null|[—–]/.test(blob), `${id} L${level}: ${blob.slice(0, 200)}`);
        assert.equal(q.choices.length, 4, id);
        assert.equal(q.skill, id);
        for (const l of LANGS) {
          assert.equal(new Set(q.choices.map((c) => text(c, l))).size, 4, `${id} L${level}: повтор вариантов ${l}`);
          assert.ok(text(q.prompt, l).length > 3 && text(q.ex, l).length > 5, `${id}: тексты ${l}`);
        }
      }
      assert.ok(ids.size >= (min[id] ?? 100), `${id} L${level}: разных заданий ${ids.size}`);
    }
  }
});

test('слова: 150+ заданий на уровнях A1-B2 и 100+ на C1-C2, переводы не повторяются', () => {
  for (const lang of ['de', 'tr']) {
    for (let level = 1; level <= 6; level++) {
      const n = xWordsCount(lang, level);
      assert.ok(n >= (level <= 4 ? 150 : 100), `${lang} L${level}: ${n}`);
    }
    const seen = new Set();
    for (const w of XWORDS[lang]) {
      assert.ok(!seen.has(w.f.toLocaleLowerCase()), `${lang}: повтор «${w.f}»`);
      seen.add(w.f.toLocaleLowerCase());
    }
    assert.ok(XWORDS[lang].length >= 550, `${lang}: слов ${XWORDS[lang].length}`);
    assert.equal(deck(lang).length, XWORDS[lang].length);
  }
  // Немецкие существительные - с артиклем и с большой буквы.
  for (const w of XWORDS.de.filter((x) => /^(der|die|das) /.test(x.f))) assert.match(w.f, /^(der|die|das) [A-ZÄÖÜ]/, w.f);
});

test('немецкое спряжение: формы основных глаголов', () => {
  const v = (inf) => _de.VERBS.find((x) => x.inf === inf);
  const fin = (inf, t) => _de.forms(v(inf), t).map((f) => f.fin);
  const end = (inf, t) => _de.forms(v(inf), t).map((f) => f.end);
  assert.deepEqual(fin('arbeiten', 'pres'), ['arbeite', 'arbeitest', 'arbeitet', 'arbeiten', 'arbeitet', 'arbeiten']);
  assert.deepEqual(fin('fahren', 'pres'), ['fahre', 'fährst', 'fährt', 'fahren', 'fahrt', 'fahren']);
  assert.deepEqual(fin('kommen', 'pres'), ['komme', 'kommst', 'kommt', 'kommen', 'kommt', 'kommen']);
  assert.deepEqual(fin('finden', 'prat'), ['fand', 'fandest', 'fand', 'fanden', 'fandet', 'fanden']);
  assert.deepEqual(fin('denken', 'prat'), ['dachte', 'dachtest', 'dachte', 'dachten', 'dachtet', 'dachten']);
  assert.deepEqual(end('aufstehen', 'pres'), ['aufstehe', 'aufstehst', 'aufsteht', 'aufstehen', 'aufsteht', 'aufstehen']);
  assert.deepEqual(end('gehen', 'perf'), ['gegangen bin', 'gegangen bist', 'gegangen ist', 'gegangen sind', 'gegangen seid', 'gegangen sind']);
  assert.deepEqual(end('machen', 'perf').slice(0, 3), ['gemacht habe', 'gemacht hast', 'gemacht hat']);
  assert.deepEqual(fin('können', 'kii'), ['könnte', 'könntest', 'könnte', 'könnten', 'könntet', 'könnten']);
  assert.deepEqual(fin('sein', 'ki'), ['sei', 'seist', 'sei', 'seien', 'seiet', 'seien']);
  assert.equal(_de.ppOf(v('aufräumen')), 'aufgeräumt');
  for (const x of _de.VERBS) for (const t of ['pres', 'prat', 'perf', 'plusq', 'fut', 'kii', 'kiipast', 'ki']) assert.ok(_de.forms(x, t).every((f) => f.end && !f.end.includes('undefined')), `${x.inf} ${t}`);
});

test('турецкая морфология: гармония гласных, d/t и k/ğ', () => {
  const gel = { s: 'gel', aor: 'gelir' };
  const git = { s: 'git', soft: 'gid', aor: 'gider' };
  const oku = { s: 'oku', aor: 'okur' };
  assert.deepEqual([0, 1, 2, 3, 4, 5].map((p) => verb.pres(gel, p)), ['geliyorum', 'geliyorsun', 'geliyor', 'geliyoruz', 'geliyorsunuz', 'geliyorlar']);
  assert.deepEqual([0, 3].map((p) => verb.past(git, p)), ['gittim', 'gittik']);
  assert.deepEqual([0, 1].map((p) => verb.fut(oku, p)), ['okuyacağım', 'okuyacaksın']);
  assert.equal(verb.pres(git, 0), 'gidiyorum');
  assert.equal(verb.nec(oku, 0), 'okumalıyım');
  assert.equal(verb.abil(git, 2), 'gidebilir');
  assert.equal(verb.condPast(gel, 1), 'gelseydin');
  assert.equal(part.dik(oku, 0), 'okuduğum');
  assert.equal(part.dikten({ s: 'yap' }), 'yaptıktan');
  assert.equal(part.passive({ s: 'yap' }), 'yapıl');
  assert.equal(part.caus({ s: 'temizle' }), 'temizlet');
  const kitap = { w: 'kitap', v: 'kitab' };
  assert.deepEqual([noun.loc(kitap), noun.abl(kitap), noun.dat(kitap), noun.acc(kitap)], ['kitapta', 'kitaptan', 'kitaba', 'kitabı']);
  assert.equal(noun.dat({ w: 'Ankara', proper: true }), "Ankara'ya");
  assert.equal(noun.loc({ w: 'Paris', proper: true }), "Paris'te");
  assert.equal(noun.poss({ w: 'araba' }, 2), 'arabası');
});

test('курсы и экзамены: немецкий, турецкий, Goethe, TestDaF, TÖMER собираются без повторов', () => {
  const byId = (id) => COURSES.find((c) => c.id === id);
  for (const id of ['german', 'turkish', 'goethe', 'testdaf', 'tomer']) {
    const c = byId(id);
    assert.ok(c, id);
    assert.match(c.code, /^[A-Z]+$/, `${id}: значок`);
    if (['german', 'turkish', 'goethe', 'tomer'].includes(id)) assert.equal(c.tracks.length, 6, id);
    for (const track of c.tracks) {
      const set = buildTopicSet({ rng: createRng(7), spec: track.spec, count: 30 });
      assert.equal(new Set(set.map((q) => q.id)).size, 30, `${id}/${track.id}: повтор`);
    }
  }
  assert.equal(byId('testdaf').tracks.length, 2);
  for (const id of TOPIC_IDS) assert.ok(LESSONS[id], `урок ${id}`);
});
