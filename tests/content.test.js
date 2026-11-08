import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { RW_QUESTIONS } from '../src/content/rw/index.js';
import { MATH_GENERATORS } from '../src/content/math/index.js';
import { QuestionStream, buildSet } from '../src/content/bank.js';
import { DETECTIVE } from '../src/content/detective.js';
import { ACHIEVEMENTS, evaluateAchievements } from '../src/content/achievements.js';
import { DOMAINS, SKILLS, ZONES } from '../src/content/skills.js';
import { STRINGS } from '../src/i18n/strings.js';
import { createRng } from '../src/core/random.js';
import { buildModule, domainCounts } from '../src/screens/exam.js';
import { errorIndex } from '../src/screens/detective.js';

const LANGS = ['en', 'ru', 'kk'];

test('банк R&W: уникальные id, 4 разных варианта, разбор на 3 языках', () => {
  assert.ok(RW_QUESTIONS.length >= 100);
  const ids = new Set();
  for (const q of RW_QUESTIONS) {
    assert.ok(!ids.has(q.id), `повтор id ${q.id}`);
    ids.add(q.id);
    assert.ok(SKILLS[q.skill], q.id);
    assert.equal(q.choices.length, 4, q.id);
    assert.equal(new Set(q.choices).size, 4, `повтор вариантов в ${q.id}`);
    assert.ok([1, 2, 3].includes(q.d), q.id);
    assert.ok(q.passage || q.passages || q.notes, q.id);
    for (const l of LANGS) assert.ok(q.ex[l]?.length > 20, `${q.id}: нет разбора на ${l}`);
  }
});

test('банк R&W покрывает все навыки и все уровни сложности каждого домена', () => {
  for (const [skill, info] of Object.entries(SKILLS)) {
    if (DOMAINS[info.domain].section !== 'rw') continue;
    assert.ok(RW_QUESTIONS.some((q) => q.skill === skill), `нет заданий для ${skill}`);
  }
  for (const d of ['craft', 'info', 'conventions', 'expression']) {
    for (const level of [1, 2, 3]) assert.ok(RW_QUESTIONS.some((q) => q.domain === d && q.d === level), `${d} d${level}`);
  }
});

test('в заданиях с пропуском есть пропуск в тексте', () => {
  for (const q of RW_QUESTIONS.filter((x) => ['boundaries', 'fss', 'transitions', 'words'].includes(x.skill))) {
    assert.ok(/_{3,}/.test(q.passage), `нет пропуска в ${q.id}`);
  }
});

test('математика: каждый генератор на каждой сложности даёт корректное задание', () => {
  assert.equal(MATH_GENERATORS.length, 20);
  for (const g of MATH_GENERATORS) {
    for (const d of [1, 2, 3]) {
      for (let s = 0; s < 150; s++) {
        const q = g.make({ rng: createRng(s * 31 + d), mcOnly: s % 3 === 0 }, d);
        const blob = JSON.stringify([q.prompt, q.choices, q.ex, q.display]);
        assert.ok(!/NaN|undefined|Infinity/.test(blob), `${g.skill} d${d} s${s}: ${blob.slice(0, 200)}`);
        if (q.type === 'mc') {
          assert.equal(new Set(q.choices).size, 4, `${g.skill} d${d}: повтор вариантов`);
          assert.ok(q.answer >= 0 && q.answer < 4);
        } else {
          assert.ok(Number.isFinite(q.value));
          assert.ok(s % 3 !== 0, 'в режиме mcOnly не должно быть ввода');
        }
        for (const l of LANGS) assert.equal(q.ex[l].length, q.ex.en.length, `${g.skill}: шаги на ${l}`);
      }
    }
  }
});

test('математика: одинаковое зерно → одинаковое задание (основа дуэлей)', () => {
  for (const g of MATH_GENERATORS) {
    const a = g.make({ rng: createRng(777), mcOnly: false }, 2);
    const b = g.make({ rng: createRng(777), mcOnly: false }, 2);
    assert.deepEqual(a, b);
  }
});

test('поток заданий: детерминирован, фильтрует домены, не повторяет R&W', () => {
  const ids = (seed) => buildSet({ rng: createRng(seed), section: 'mix', count: 10 }).map((q) => q.id);
  assert.deepEqual(ids(42), ids(42));
  const stream = new QuestionStream({ rng: createRng(1), section: 'rw', domains: ['conventions'] });
  const seen = new Set();
  const pool = RW_QUESTIONS.filter((q) => q.domain === 'conventions').length;
  for (let i = 0; i < pool; i++) {
    const q = stream.next(2);
    assert.equal(q.domain, 'conventions');
    assert.ok(!seen.has(q.id), 'повтор до исчерпания банка');
    seen.add(q.id);
    assert.equal(q.choices.length, 4);
  }
  const quick = new QuestionStream({ rng: createRng(5), section: 'mix', quick: true });
  for (let i = 0; i < 60; i++) assert.equal(quick.next(2).type, 'mc');
});

test('перемешанные варианты R&W сохраняют правильный ответ', () => {
  const stream = new QuestionStream({ rng: createRng(9), section: 'rw' });
  for (let i = 0; i < 80; i++) {
    const q = stream.next(2);
    const original = RW_QUESTIONS.find((x) => x.id === q.id);
    assert.equal(q.choices[q.answer], original.choices[0]);
  }
});

test('пробный экзамен: распределение по доменам и сборка модуля', () => {
  for (const n of [8, 10, 22, 27]) {
    for (const section of ['rw', 'math']) {
      assert.equal(domainCounts(section, n).reduce((s, [, k]) => s + k, 0), n);
    }
  }
  const rng = createRng(3);
  const rw = buildModule(new QuestionStream({ rng, section: 'rw' }), 'rw', 27, 0, null, rng);
  assert.equal(rw.length, 27);
  assert.equal(new Set(rw.map((q) => q.id)).size, 27, 'в модуле нет повторов');
  assert.equal(rw[0].domain, 'craft', 'порядок как на SAT: сначала Craft and Structure');
  assert.equal(rw.at(-1).domain, 'expression');
  const math = buildModule(new QuestionStream({ rng, section: 'math' }), 'math', 22, 1, 'hard', rng);
  assert.ok(math.every((q) => q.d >= 2), 'сложный второй модуль');
});

test('детектив: ошибочное слово встречается в предложении ровно один раз', () => {
  for (const item of DETECTIVE) {
    assert.ok(errorIndex(item) >= 0, item.id);
    const count = item.text.split(' ').filter((w) => w.replace(/^[“”"(]+|[.,!?;:“”")]+$/g, '') === item.wrong).length;
    assert.equal(count, 1, item.id);
    for (const l of LANGS) assert.ok(item.ex[l].length > 10);
  }
});

test('достижения считаются по профилю', () => {
  const profile = {
    counters: { answered: 120, bestCombo: 6, detectiveFound: 0, duelsSent: 1, langSwitch: 0, dailyDone: 0 },
    map: { stars: { 'rw1-1': 3 }, bosses: Object.fromEntries(ZONES.map((z) => [z.id, true])) },
    records: { survival: 3, blitz: 0 },
    streak: { best: 4 },
    exams: [{ rw: 710, math: 600 }],
  };
  const got = new Set(evaluateAchievements(profile));
  for (const id of ['first', 'combo5', 'perfect', 'boss1', 'bossAll', 'streak3', 'exam', 'score700', 'duelist', 'century']) {
    assert.ok(got.has(id), id);
  }
  assert.ok(!got.has('combo15') && !got.has('streak7') && !got.has('survivor'));
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
});

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith('.js') ? [path] : [];
  });
}

test('переводы: каждый ключ интерфейса есть на всех трёх языках', () => {
  for (const l of ['ru', 'kk']) {
    assert.deepEqual(Object.keys(STRINGS[l]).sort(), Object.keys(STRINGS.en).sort(), `набор ключей ${l}`);
  }
  const used = new Set();
  for (const file of sourceFiles('src')) {
    for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) used.add(m[1]);
  }
  const dynamic = [
    'nav.home', 'nav.map', 'nav.premium', 'premium.limitWeek', 'premium.unlimited',
    'premium.rowMap', 'premium.rowModes', 'premium.rowSolutions', 'premium.rowMini', 'premium.rowFull', 'duel.win', 'duel.lose', 'duel.draw', 'exam.routeHard', 'exam.routeEasy',
    ...[1, 2, 3, 4, 5, 6].map((i) => `fb.praise${i}`),
    ...['map', 'exam', 'duel', 'survival', 'blitz', 'det', 'weak', 'daily'].flatMap((k) => [`mode.${k}.title`, `mode.${k}.desc`]),
  ];
  for (const key of [...used, ...dynamic]) {
    for (const l of LANGS) assert.ok(STRINGS[l][key], `нет перевода «${key}» (${l})`);
  }
});
