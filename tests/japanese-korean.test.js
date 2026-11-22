// Японский (JLPT) и корейский (TOPIK): объём, корректность заданий, правила спряжения и словари.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS } from '../src/pools/topics.js';
import { COURSES } from '../src/catalog/courses.js';
import { buildTopicSet } from '../src/pools/stream.js';
import { createRng } from '../src/core/random.js';
import { JA_WORDS } from '../src/pools/languages/ja-words.js';
import { KANJI } from '../src/pools/languages/ja-kanji.js';
import { KANA, romaji } from '../src/pools/languages/ja-kana.js';
import { JA_GRAMMAR } from '../src/pools/languages/ja-grammar.js';
import { conjugate, keigoForms } from '../src/pools/languages/ja-verbs.js';
import { KO_WORDS } from '../src/pools/languages/ko-words.js';
import { KO_GRAMMAR } from '../src/pools/languages/ko-grammar.js';
import { koForms } from '../src/pools/languages/ko-verbs.js';
import { deck } from '../src/core/cards.js';

const LANGS = ['en', 'ru', 'kk'];
const text = (x, l) => (x !== null && typeof x === 'object' ? x[l] : String(x));
const KEYS = { 'ja.kana': [1, 2, 3], 'ja.words': [1, 2, 3, 4, 5], 'ja.kanji': [1, 2, 3, 4, 5], 'ja.bank': [1, 2, 3, 4, 5], 'ko.hangul': [1, 2], 'ko.words': [1, 2, 3, 4, 5, 6], 'ko.bank': [1, 2, 3, 4, 5, 6] };

test('японский и корейский: задания корректны, 4 разных варианта, разбор на трёх языках', () => {
  for (const [id, keys] of Object.entries(KEYS)) {
    for (const key of keys) {
      for (let s = 0; s < 200; s++) {
        const q = TOPICS[id].make({ rng: createRng(s * 13 + key), used: new Set() }, key);
        const label = `${id} [${key}] #${s}`;
        assert.equal(q.type, 'mc', label);
        assert.equal(q.choices.length, 4, label);
        assert.ok(q.answer >= 0 && q.answer < 4, label);
        assert.ok(!/undefined|NaN|\[object/.test(JSON.stringify([q.prompt, q.choices, q.ex, q.passage ?? ''])), label);
        for (const l of LANGS) {
          assert.equal(new Set(q.choices.map((c) => text(c, l))).size, 4, `${label}: повтор (${l}) ${q.choices.map((c) => text(c, l)).join(' | ')}`);
          assert.ok(text(q.prompt, l).length > 3 && text(q.ex, l).length > 5, `${label}: текст ${l}`);
          assert.ok(!/[\u2014\u2013]/.test(text(q.ex, l) + text(q.prompt, l)), `${label}: длинное тире`);
        }
      }
    }
  }
});

test('японский и корейский: на каждом уровне хватает разных заданий', () => {
  const min = { 'ja.kana': 150, 'ja.words': 200, 'ja.kanji': 150, 'ja.bank': 60, 'ko.hangul': 300, 'ko.words': 150, 'ko.bank': 60 };
  for (const [id, keys] of Object.entries(KEYS)) {
    for (const key of keys) {
      const ids = new Set();
      const rng = createRng(key);
      for (let s = 0; s < 1500; s++) ids.add(TOPICS[id].make({ rng, used: new Set() }, key).id);
      assert.ok(ids.size >= min[id], `${id} [${key}]: ${ids.size}`);
    }
  }
});

test('словари: нужное число слов, кандзи и предложений на уровне, без повторов', () => {
  for (let lv = 1; lv <= 5; lv++) {
    assert.ok(JA_WORDS.filter((w) => w.level === lv).length >= (lv <= 3 ? 120 : 80), `слова N${6 - lv}`);
    assert.ok(KANJI.filter((k) => k.level === lv).length >= (lv === 1 ? 80 : 60), `кандзи N${6 - lv}`);
    assert.ok(JA_GRAMMAR.filter((r) => r[0] === lv).length >= 25, `грамматика N${6 - lv}`);
  }
  for (let lv = 1; lv <= 6; lv++) {
    assert.ok(KO_WORDS.filter((w) => w.level === lv).length >= (lv <= 3 ? 120 : 80), `слова TOPIK ${lv}`);
    assert.ok(KO_GRAMMAR.filter((r) => r[0] === lv).length >= 20, `грамматика TOPIK ${lv}`);
  }
  for (const [name, list, key] of [['JA', JA_WORDS, 'jp'], ['KANJI', KANJI, 'kj'], ['KO', KO_WORDS, 'ko']]) {
    const seen = new Set();
    for (const w of list) {
      assert.ok(!seen.has(w[key]), `${name}: повтор ${w[key]}`);
      seen.add(w[key]);
      for (const l of LANGS) assert.ok(w[l] && !/[\u2014\u2013]/.test(w[l]), `${name} ${w[key]}: перевод ${l}`);
    }
  }
  for (const rows of [JA_GRAMMAR, KO_GRAMMAR]) {
    for (const [, sentence, correct, wrong, ex] of rows) {
      assert.equal(sentence.match(/_{3,}/g)?.length, 1, sentence);
      assert.equal(new Set([correct, ...wrong]).size, 4, sentence);
      assert.equal(ex.split('|').length, 3, sentence);
      assert.ok(!/[\u2014\u2013]/.test(ex), sentence);
    }
  }
  assert.ok(KANA.length >= 100);
});

test('японский: азбука, спряжение и кэйго по правилам', () => {
  assert.equal(romaji('がっこう'), 'gakkou');
  assert.equal(romaji('コーヒー'), 'koohii');
  assert.equal(romaji('きんえん'), "kin'en");
  assert.equal(romaji('ちょっと'), 'chotto');
  const c = (jp, kana) => conjugate(jp, kana);
  assert.equal(c('書く', 'かく').te, '書いて');
  assert.equal(c('行く', 'いく').te, '行って');
  assert.equal(c('泳ぐ', 'およぐ').ta, '泳いだ');
  assert.equal(c('話す', 'はなす').masu, '話します');
  assert.equal(c('待つ', 'まつ').nai, '待たない');
  assert.equal(c('買う', 'かう').nai, '買わない');
  assert.equal(c('遊ぶ', 'あそぶ').te, '遊んで');
  assert.equal(c('帰る', 'かえる').masu, '帰ります');
  assert.equal(c('食べる', 'たべる').pot, '食べられる');
  assert.equal(c('書く', 'かく').pot, '書ける');
  assert.equal(c('来る', 'くる').imp, '来い');
  assert.equal(c('勉強する', 'べんきょうする').pot, '勉強できる');
  assert.equal(c('待つ', 'まつ').caus, '待たせる');
  assert.equal(c('ある', 'ある').nai, 'ない');
  assert.equal(keigoForms('待つ|まつ').hon, 'お待ちになる');
  assert.equal(keigoForms('説明する').hum, 'ご説明する');
});

test('корейский: спряжение по правилам, включая неправильные основы', () => {
  const f = (ko) => koForms(KO_WORDS.find((w) => w.ko === ko));
  assert.equal(f('가다').yo, '가요');
  assert.equal(f('오다').yo, '와요');
  assert.equal(f('먹다').yo, '먹어요');
  assert.equal(f('마시다').past, '마셨어요');
  assert.equal(f('공부하다').past, '공부했어요');
  assert.equal(f('듣다').yo, '들어요');
  assert.equal(f('춥다').yo, '추워요');
  assert.equal(f('돕다').yo, '도와요');
  assert.equal(f('모르다').yo, '몰라요');
  assert.equal(f('낫다').yo, '나아요');
  assert.equal(f('바쁘다').yo, '바빠요');
  assert.equal(f('쓰다').yo, '써요');
  assert.equal(f('살다').formal, '삽니다');
  assert.equal(f('살다').hon, '사세요');
  assert.equal(f('먹다').fut, '먹을 거예요');
  assert.equal(f('듣다').fut, '들을 거예요');
  assert.equal(f('만들다').nikka, '만드니까');
  assert.equal(f('먹다').dago, '먹는다고');
  assert.equal(f('가다').dago, '간다고');
  assert.equal(f('예쁘다').dago, '예쁘다고');
  assert.equal(f('먹다').rago, '먹으라고');
});

test('курсы и экзамены: японский (кана + N5-N1), JLPT, корейский и TOPIK; тренировка без повторов', () => {
  const by = (id) => COURSES.find((c) => c.id === id);
  assert.deepEqual(by('japanese').tracks.map((t) => t.icon), ['かな', 'N5', 'N4', 'N3', 'N2', 'N1']);
  assert.deepEqual(by('jlpt').tracks.map((t) => t.id), ['n5', 'n4', 'n3', 'n2', 'n1']);
  assert.equal(by('korean').tracks.length, 6);
  assert.equal(by('topik').tracks.length, 6);
  assert.equal(by('jlpt').official.url, 'https://www.jlpt.jp/e/');
  assert.equal(by('topik').official.url, 'https://www.topik.go.kr/');
  for (const id of ['japanese', 'jlpt', 'korean', 'topik']) {
    for (const track of by(id).tracks) {
      const set = buildTopicSet({ rng: createRng(5), spec: track.spec, count: 30 });
      assert.equal(new Set(set.map((q) => q.id)).size, 30, `${id}/${track.id}`);
    }
  }
  assert.ok(deck('ja').length === JA_WORDS.length && deck('ko').length === KO_WORDS.length);
});
