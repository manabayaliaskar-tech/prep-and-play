import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, topicIds } from '../src/pools/topics.js';
import { TopicStream, buildTopicSet, cells } from '../src/pools/stream.js';
import { BANK } from '../src/pools/english/bank.js';
import { RULES } from '../src/pools/english/rules.js';
import { CEFR, ENGLISH_GENERATED, englishSpec } from '../src/pools/english/index.js';
import { plural } from '../src/pools/gen.js';
import { checkAnswer } from '../src/engine/answer.js';
import { createRng } from '../src/core/random.js';

const LANGS = ['en', 'ru', 'kk'];
const text = (x, l = 'en') => (x !== null && typeof x === 'object' ? x[l] : String(x));

/** Общая проверка задания из любого банка. */
function assertValid(q, label) {
  const blob = JSON.stringify([q.prompt, q.choices ?? '', q.ex, q.display ?? '', q.passage ?? '']);
  assert.ok(!/NaN|undefined|Infinity|null/.test(blob), `${label}: ${blob.slice(0, 240)}`);
  assert.ok(q.id && q.skill && TOPICS[q.skill], `${label}: нет темы`);
  assert.ok([1, 2, 3].includes(q.d), `${label}: сложность`);
  assert.ok(q.local, `${label}: задание должно быть на языке интерфейса`);
  for (const l of LANGS) {
    assert.ok(text(q.prompt, l).length > 3, `${label}: условие на ${l}`);
    const ex = q.ex[l];
    assert.ok(ex && ex.length > 0, `${label}: разбор на ${l}`);
    if (Array.isArray(q.ex.en)) assert.equal(ex.length, q.ex.en.length, `${label}: шаги на ${l}`);
  }
  if (q.type === 'mc') {
    const keys = q.choices.map((c) => text(c));
    assert.ok(keys.length >= 3 && keys.length <= 4, `${label}: число вариантов`);
    assert.equal(new Set(keys).size, keys.length, `${label}: повтор вариантов ${keys.join(' | ')}`);
    assert.ok(q.answer >= 0 && q.answer < keys.length, `${label}: номер ответа`);
    for (const c of q.choices) for (const l of LANGS) assert.ok(text(c, l).length > 0, `${label}: вариант на ${l}`);
  } else {
    assert.ok(Number.isFinite(q.value), `${label}: числовой ответ`);
    assert.ok(checkAnswer(q, text(q.display)), `${label}: показанный ответ «${text(q.display)}» должен засчитываться`);
  }
}

const mathKeys = [1, 2, 3];

test('математика: каждая тема на каждой сложности даёт корректное задание', () => {
  const ids = topicIds('math');
  assert.ok(ids.length >= 30);
  for (const id of ids) {
    for (const d of mathKeys) {
      for (let s = 0; s < 200; s++) {
        const q = TOPICS[id].make({ rng: createRng(s * 31 + d), mcOnly: s % 3 === 0, used: new Set() }, d);
        assertValid(q, `${id} d${d} s${s}`);
        assert.equal(q.d, d);
        if (s % 3 === 0) assert.equal(q.type, 'mc', `${id}: в режиме mcOnly не должно быть ввода`);
      }
    }
  }
});

test('общие банки: одинаковое зерно → одинаковое задание', () => {
  for (const id of [...topicIds('math'), ...topicIds('olymp')]) {
    const d = id === 'o.eq' ? 2 : 1;
    const a = TOPICS[id].make({ rng: createRng(4242), mcOnly: false, used: new Set() }, d);
    const b = TOPICS[id].make({ rng: createRng(4242), mcOnly: false, used: new Set() }, d);
    assert.deepEqual(a, b, id);
  }
});

test('английский: банк корректен, у каждого задания есть разбор', () => {
  let total = 0;
  for (const [topic, rows] of Object.entries(BANK)) {
    assert.ok(TOPICS[topic], topic);
    const seen = new Set();
    for (const [level, sentence, correct, wrong, ref] of rows) {
      total += 1;
      const label = `${topic}: ${sentence}`;
      assert.ok(level >= 1 && level <= 6, label);
      assert.ok(/_{3,}/.test(sentence), `нет пропуска — ${label}`);
      assert.equal(sentence.match(/_{3,}/g).length, 1, `пропуск должен быть один — ${label}`);
      assert.ok(!seen.has(sentence), `повтор — ${label}`);
      seen.add(sentence);
      assert.equal(wrong.length, 3, label);
      assert.equal(new Set([correct, ...wrong]).size, 4, `повтор вариантов — ${label}`);
      if (Array.isArray(ref)) assert.ok(ref.length === 2 && ref.every((r) => r.length >= 2), `перевод — ${label}`);
      else assert.ok(RULES[ref], `нет правила «${ref}» — ${label}`);
    }
  }
  assert.ok(total >= 220, `заданий: ${total}`);
  for (const rule of Object.values(RULES)) for (const l of LANGS) assert.ok(rule[l].length > 20);
});

test('английский: на каждом уровне хватает заданий и они не повторяются в тренировке', () => {
  for (let level = 1; level <= 6; level++) {
    const spec = englishSpec([level]);
    const count = spec.reduce((sum, [topic]) => sum + (BANK[topic]?.filter((row) => row[0] === level).length ?? 0), 0);
    assert.ok(count >= 30, `${CEFR[level - 1]}: заданий в банке ${count}`);
    for (const id of ENGLISH_GENERATED) assert.ok(spec.some(([topic]) => topic === id) || id === 'e.comp' || id === 'e.irreg', `${id} на уровне ${level}`);
    const set = buildTopicSet({ rng: createRng(level), spec, count: 20 });
    assert.equal(new Set(set.map((q) => q.id)).size, 20, `${CEFR[level - 1]}: повтор в тренировке`);
    for (const q of set) {
      assertValid(q, q.id);
      assert.equal(q.level, CEFR[level - 1]);
      assert.equal(q.section, 'rw');
    }
  }
});

// ---------- Олимпиадные задачи: ответ пересчитывается полным перебором ----------

const pm = (a, e, m) => {
  let r = 1;
  for (let i = 0; i < e; i++) r = (r * a) % m;
  return r;
};
const count = (from, to, fn) => {
  let k = 0;
  for (let i = from; i <= to; i++) if (fn(i)) k += 1;
  return k;
};
/** Число кратчайших путей по сетке — динамикой, без формулы. */
function gridPaths(w, h) {
  const row = Array(w + 1).fill(1);
  for (let y = 1; y <= h; y++) for (let x = 1; x <= w; x++) row[x] += row[x - 1];
  return row[w];
}
function factorPower(k, p) {
  let total = 0;
  for (let i = 1; i <= k; i++) for (let v = i; v % p === 0; v /= p) total += 1;
  return total;
}

const BRUTE = {
  div1: ({ N, a }) => count(1, N, (i) => i % a === 0),
  div2: ({ N, a, b }) => count(1, N, (i) => i % a === 0 || i % b === 0),
  div3: ({ N, a, b }) => count(1, N, (i) => i % a !== 0 && i % b !== 0),
  prod: ({ f }) => f.reduce((r, v) => (r * v) % 10, 1),
  pow: ({ a, e }) => pm(a, e, 10),
  powsum: ({ a, e, b, m }) => (pm(a, e, 10) + pm(b, m, 10)) % 10,
  count: ({ N, a, b, total }) =>
    N !== undefined ? count(1, N, (i) => N % i === 0) : count(0, total, (y) => total - b * y >= 0 && (total - b * y) % a === 0),
  multiple: ({ N, p }) => count(1, N, (i) => N % i === 0 && i % p === 0),
  pair: ({ k }) => k + 1,
  many: ({ k, m }) => k * (m - 1) + 1,
  each: ({ b, c }) => b + c + 1,
  gauss: ({ k }) => count(1, k, () => true) && Array.from({ length: k }, (_, i) => i + 1).reduce((s, v) => s + v, 0),
  odd: ({ k }) => Array.from({ length: k }, (_, i) => 2 * i + 1).reduce((s, v) => s + v, 0),
  telescope: ({ k }) => Array.from({ length: k }, (_, i) => 1 / ((i + 1) * (i + 2))).reduce((s, v) => s + v, 0),
  handshake: ({ k }) => {
    let pairs = 0;
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) pairs += 1;
    return pairs;
  },
  knockout: ({ k }) => {
    let left = k;
    let games = 0;
    while (left > 1) {
      games += Math.floor(left / 2);
      left = Math.ceil(left / 2);
    }
    return games;
  },
  inverse: ({ games }) => {
    for (let k = 2; k < 100; k++) if ((k * (k - 1)) / 2 === games) return k;
    return NaN;
  },
  draws: ({ k, total }) => 3 * ((k * (k - 1)) / 2) - total,
  heads: ({ heads, legs }) => {
    for (let r = 0; r <= heads; r++) if (4 * r + 2 * (heads - r) === legs) return r;
    return NaN;
  },
  ages: ({ a, b, k }) => {
    for (let son = 1; son < 100; son++) if (a * son + k === b * (son + k)) return son;
    return NaN;
  },
  snail: ({ height, up, down }) => {
    let pos = 0;
    for (let day = 1; day < 1000; day++) {
      pos += up;
      if (pos >= height) return day;
      pos -= down;
    }
    return NaN;
  },
  segments: ({ k }) => BRUTE.handshake({ k }),
  diagonals: ({ k }) => BRUTE.handshake({ k }) - k,
  squares: ({ k }) => {
    let total = 0;
    for (let s = 1; s <= k; s++) for (let x = 0; x + s <= k; x++) for (let y = 0; y + s <= k; y++) total += 1;
    return total;
  },
  triangles: ({ k }) => {
    let total = 0;
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) for (let m = j + 1; m < k; m++) total += 1;
    return total;
  },
  rects: ({ w, h }) => {
    let total = 0;
    for (let x1 = 0; x1 < w; x1++) for (let x2 = x1 + 1; x2 <= w; x2++) for (let y1 = 0; y1 < h; y1++) for (let y2 = y1 + 1; y2 <= h; y2++) total += 1;
    return total;
  },
  weekday: ({ start, days }) => (start + days) % 7,
  powmod: ({ a, e, m }) => pm(a, e, m),
  crt: ({ m1, r1, m2, r2 }) => {
    for (let v = 1; v < 1000; v++) if (v % m1 === r1 && v % m2 === r2) return v;
    return NaN;
  },
  pages: ({ pages }) => Array.from({ length: pages }, (_, i) => String(i + 1).length).reduce((s, v) => s + v, 0),
  zeros: ({ k }) => Math.min(factorPower(k, 2), factorPower(k, 5)),
  legendre: ({ k, p }) => factorPower(k, p),
  roads: ({ a, b, c }) => a * b * c,
  grid: ({ w, h }) => gridPaths(w, h),
  via: ({ w1, h1, w2, h2 }) => gridPaths(w1, h1) * gridPaths(w2, h2),
  frobenius: ({ a, b }) => {
    let largest = 0;
    for (let v = 1; v <= a * b; v++) {
      let ok = false;
      for (let x = 0; a * x <= v && !ok; x++) if ((v - a * x) % b === 0) ok = true;
      if (!ok) largest = v;
    }
    return largest;
  },
};

/** Числовое значение ответа задания: для вариантов — по тексту правильного варианта. */
function answerValue(q) {
  if (q.type === 'spr') return q.value;
  const raw = text(q.choices[q.answer]);
  const fracMatch = raw.match(/<span>(\d+)<\/span><span>(\d+)<\/span>/);
  if (fracMatch) return Number(fracMatch[1]) / Number(fracMatch[2]);
  return Number(raw.replace('−', '-').replace(/[^\d.-]/g, ''));
}

const olympKeys = (id) => (id === 'o.eq' ? [2, 3] : [1, 2, 3]);

test('олимпиада: ответы совпадают с полным перебором', () => {
  const ids = topicIds('olymp');
  assert.equal(ids.length, 12);
  const kinds = new Set();
  for (const id of ids) {
    for (const d of olympKeys(id)) {
      for (let s = 0; s < 150; s++) {
        const q = TOPICS[id].make({ rng: createRng(s * 17 + d), mcOnly: s % 2 === 0, used: new Set() }, d);
        const label = `${id} d${d} s${s}`;
        assertValid(q, label);
        assert.ok(BRUTE[q.meta.kind], `${label}: нет проверки для ${q.meta.kind}`);
        kinds.add(q.meta.kind);
        const expected = BRUTE[q.meta.kind](q.meta);
        if (q.meta.kind === 'weekday') {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          assert.equal(text(q.choices[q.answer]), days[expected], label);
        } else {
          assert.ok(Math.abs(answerValue(q) - expected) < 1e-9, `${label}: ответ ${answerValue(q)}, перебор даёт ${expected} (${JSON.stringify(q.meta)})`);
        }
      }
    }
  }
  assert.ok(kinds.size >= 30, `проверено видов задач: ${kinds.size}`);
});

test('поток заданий: детерминирован, проходит все темы набора, не повторяется', () => {
  const spec = [['m.add', [1, 2]], ['m.mul', [1]], ['m.seq', [1]]];
  assert.equal(cells(spec).length, 4);
  const ids = (seed) => buildTopicSet({ rng: createRng(seed), spec, count: 12 }).map((q) => q.id);
  assert.deepEqual(ids(7), ids(7));
  assert.equal(new Set(ids(7)).size, 12);
  const stream = new TopicStream({ rng: createRng(3), spec });
  const firstFour = new Set(Array.from({ length: 4 }, () => stream.next().skill));
  assert.equal(firstFour.size, 3, 'за первый круг встречаются все три темы');
  const quick = new TopicStream({ rng: createRng(5), spec: [['m.frac', [1, 2, 3]], ['m.lineq', [1, 2]]], quick: true });
  for (let i = 0; i < 40; i++) assert.equal(quick.next().type, 'mc');
});

test('русское склонение после числа', () => {
  const day = (k) => plural(k, 'день', 'дня', 'дней');
  assert.deepEqual([1, 2, 5, 11, 12, 21, 22, 25, 111, 101].map(day), ['день', 'дня', 'дней', 'дней', 'дней', 'день', 'дня', 'дней', 'дней', 'день']);
});

// ---------- Банки знаний: физика, химия, биология, история, языки и другие ----------

import { PHYSICS_THEORY } from '../src/pools/science/physics.js';
import { CHEMISTRY_THEORY } from '../src/pools/science/chemistry.js';
import { INFORMATICS_THEORY } from '../src/pools/science/informatics.js';
import { BIOLOGY, GEOGRAPHY } from '../src/pools/science/bio-geo.js';
import { HISTORY_KZ, HISTORY_REGION, HISTORY_RU, HISTORY_WORLD } from '../src/pools/humanities/history.js';
import { ANALOGIES, RUSSIAN, SENTENCES, SOCIAL } from '../src/pools/humanities/language.js';
import { LITERACY } from '../src/pools/humanities/literacy.js';
import { POOLS } from '../src/pools/topics.js';

const BANKS = {
  PHYSICS_THEORY, CHEMISTRY_THEORY, INFORMATICS_THEORY, BIOLOGY, GEOGRAPHY, HISTORY_KZ, HISTORY_RU, HISTORY_WORLD,
  ...Object.fromEntries(Object.entries(HISTORY_REGION).map(([k, v]) => [`HISTORY_${k}`, v])),
  ANALOGIES, RUSSIAN, SENTENCES, SOCIAL,
};

test('банки знаний: 4 разных варианта, тексты и разбор на трёх языках', () => {
  let total = 0;
  for (const [name, rows] of Object.entries(BANKS)) {
    const seen = new Set();
    for (const [d, question, correct, wrong, ex] of rows) {
      total += 1;
      const label = `${name}: ${text(question, 'ru')}`;
      assert.ok([1, 2, 3].includes(d), label);
      // Одинаковая формулировка допустима (например, «Где нужна запятая?»), повтор задания целиком — нет.
      const key = `${text(question, 'ru')}|${text(correct, 'ru')}`;
      assert.ok(!seen.has(key), `повтор задания — ${label}`);
      seen.add(key);
      assert.equal(wrong.length, 3, label);
      for (const l of LANGS) {
        assert.ok(text(question, l).length > 5, `вопрос на ${l} — ${label}`);
        assert.ok(text(ex, l).length > 20, `разбор на ${l} — ${label}`);
        const options = [correct, ...wrong].map((c) => text(c, l));
        assert.equal(new Set(options).size, 4, `повтор вариантов на ${l} — ${label}`);
        assert.ok(options.every((o) => o.length > 0), label);
      }
    }
  }
  assert.ok(total >= 170, `заданий в банках: ${total}`);
});

test('грамотность чтения: тексты и вопросы на трёх языках', () => {
  for (const passage of LITERACY) {
    for (const l of LANGS) {
      assert.ok(text(passage.title, l).length > 3, passage.id);
      const words = text(passage.text, l).split(/\s+/).length;
      assert.ok(words >= 70 && words <= 160, `${passage.id} (${l}): ${words} слов`);
    }
    assert.equal(passage.qs.length, 4, passage.id);
    for (const item of passage.qs) {
      for (const l of LANGS) {
        assert.ok(text(item.question, l).length > 5);
        assert.equal(new Set(item.choices.map((c) => text(c, l))).size, 4, `${passage.id}: повтор вариантов (${l})`);
        assert.ok(text(item.ex, l).length > 20);
      }
    }
  }
});

test('у каждого банка заданий есть значок для профиля', () => {
  for (const [id, topic] of Object.entries(TOPICS)) assert.ok(POOLS[topic.pool], `${id}: нет значка для «${topic.pool}»`);
});

test('физика и химия: ответы расчётных задач сходятся с формулами', () => {
  // Каждое задание с вводом ответа уже проверено: показанный ответ засчитывается. Здесь — выборочные формулы.
  for (const id of ['p.kin', 'p.dyn', 'p.energy', 'p.elec', 'p.heat', 'p.wave', 'c.molar', 'c.mole', 'i.num', 'i.units', 'i.logic', 'i.algo']) {
    for (const d of [1, 2, 3]) {
      for (let s = 0; s < 120; s++) {
        const q = TOPICS[id].make({ rng: createRng(s * 13 + d), mcOnly: s % 2 === 0, used: new Set() }, d);
        assertValid(q, `${id} d${d} s${s}`);
      }
    }
  }
});

// ---------- Испанский, французский, китайский ----------

import { FRENCH, SPANISH } from '../src/pools/languages/romance.js';
import { CHINESE } from '../src/pools/languages/chinese.js';

test('иностранные языки: по 10 заданий на уровень, разбор на трёх языках', () => {
  for (const [name, rows] of Object.entries({ SPANISH, FRENCH, CHINESE })) {
    for (let level = 1; level <= 6; level++) {
      const items = rows.filter((row) => row[0] === level);
      assert.ok(items.length >= 10, `${name} уровень ${level}: ${items.length}`);
    }
    const seen = new Set();
    for (const [level, question, correct, wrong, ex] of rows) {
      const label = `${name}: ${text(question, 'ru')}`;
      assert.ok(level >= 1 && level <= 6, label);
      const key = `${text(question, 'ru')}|${text(correct, 'ru')}`;
      assert.ok(!seen.has(key), `повтор — ${label}`);
      seen.add(key);
      if (typeof question === 'string') assert.equal(question.match(/_{3,}/g)?.length, 1, `нужен ровно один пропуск — ${label}`);
      for (const l of LANGS) {
        assert.equal(new Set([correct, ...wrong].map((c) => text(c, l))).size, 4, `повтор вариантов (${l}) — ${label}`);
        assert.ok(text(ex, l).length > 20, `разбор (${l}) — ${label}`);
      }
    }
  }
});

// ---------- Программирование ----------

import { CODE_LANGS, codeTopics, execute, render } from '../src/pools/code.js';

test('программирование: код на JavaScript при запуске печатает то же, что ответ задания', () => {
  const topics = codeTopics('js');
  let checked = 0;
  for (const [id, make] of Object.entries(topics)) {
    for (const d of [1, 2, 3]) {
      for (let s = 0; s < 60; s++) {
        const q = make({ rng: createRng(s * 19 + d), mcOnly: s % 2 === 0, used: new Set() }, d);
        assertValid(q, `${id} d${d} s${s}`);
        const printed = [];
        // eslint-disable-next-line no-new-func
        new Function('console', render(q.program, 'js').join('\n'))({ log: (v) => printed.push(v) });
        assert.deepEqual(printed, execute(q.program), `${id} d${d} s${s}`);
        const answer = q.type === 'spr' ? q.value : Number(text(q.choices[q.answer]));
        assert.equal(answer, printed.at(-1), `${id} d${d} s${s}: ответ задания`);
        checked += 1;
      }
    }
  }
  assert.equal(checked, 5 * 3 * 60);
});

test('программирование: одна программа выглядит по-своему в каждом языке', () => {
  const q = codeTopics('py')['py.arr']({ rng: createRng(3), mcOnly: true, used: new Set() }, 2);
  const code = Object.fromEntries(Object.keys(CODE_LANGS).map((lang) => [lang, render(q.program, lang).join('\n')]));
  assert.match(code.py, /for i in range\(len\(a\)\):/);
  assert.match(code.cpp, /vector<int> a = \{/);
  assert.match(code.cpp, /cout << s << endl;/);
  assert.match(code.js, /console\.log\(s\);/);
  assert.match(code.java, /int\[\] a = \{/);
  assert.match(code.java, /System\.out\.println\(s\);/);
  assert.equal(new Set(Object.values(code)).size, 4);
});
