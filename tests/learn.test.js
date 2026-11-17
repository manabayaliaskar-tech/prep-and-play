// Этап «Обучение»: разбор ошибок, адаптивная сложность, диагностика, карта знаний, план по неделям,
// темп экзамена, закладки, аудирование, полный IELTS Reading, анимации тем, новые темы оформления.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COURSES, courseById } from '../src/catalog/index.js';
import { createRng } from '../src/core/random.js';
import { TOPICS } from '../src/pools/topics.js';
import { _setProfileForTests, getProfile } from '../src/core/profile.js';

const mem = new Map();
globalThis.localStorage ??= { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear() };

test('разбор ошибок: у «ловушек» есть объяснение, у правильного ответа — нет; работает и для ввода числа', async () => {
  const { wrongReason } = await import('../src/ui/question.js');
  const rng = createRng(11);
  let mcWithWhy = 0;
  let sprWithTraps = 0;
  for (const topic of ['m.lineq', 'm.pct', 'm.area', 'm.pyth', 'm.order', 'm.neg', 'm.pow', 'm.frac', 'm.angle', 'm.mul']) {
    for (let i = 0; i < 60; i++) {
      const q = TOPICS[topic].make({ rng, used: new Set(), state: {} }, 1 + (i % 3));
      if (q.type === 'mc' && q.whys) {
        mcWithWhy += 1;
        assert.equal(q.whys.length, q.choices.length, topic);
        assert.equal(q.whys[q.answer], null, `${topic}: у правильного ответа нет «ловушки»`);
        const i2 = q.whys.findIndex(Boolean);
        assert.ok(wrongReason(q, i2)?.ru, topic);
        assert.equal(wrongReason(q, q.answer), null);
      }
      if (q.type === 'spr' && q.traps) {
        sprWithTraps += 1;
        for (const trap of q.traps) {
          assert.notEqual(trap.v, q.value, `${topic}: ловушка не совпадает с ответом`);
          assert.ok(wrongReason(q, String(trap.v).replace('-', '−'))?.en, topic);
        }
      }
    }
  }
  assert.ok(mcWithWhy > 50, `заданий с объяснением ошибки: ${mcWithWhy}`);
  assert.ok(sprWithTraps > 5, `заданий с ловушками при вводе: ${sprWithTraps}`);
});

test('адаптивная сложность: два верных подряд — выше, ошибка — ниже, ключ темы подбирается по уровню', async () => {
  const { AdaptiveStream, TIERS, keyForTier, mergeSpec } = await import('../src/core/adaptive.js');
  assert.equal(keyForTier([1, 2, 3], 0), 1);
  assert.equal(keyForTier([3, 1, 2], TIERS - 1), 3);
  assert.equal(keyForTier([1, 2, 3], 2), 2);
  assert.equal(keyForTier([0], 4), 0);
  assert.deepEqual(mergeSpec([['m.add', [1]], ['m.add', [3]], ['нет', [1]]]), [['m.add', [1, 3]]]);
  const s = new AdaptiveStream({ rng: createRng(3), spec: [['m.lineq', [1, 2, 3]]], tier: 2 });
  const q1 = s.next();
  assert.equal(q1.tier, 2);
  assert.equal(s.feedback(true), null);
  assert.equal(s.feedback(true), 'up');
  assert.equal(s.tier, 3);
  assert.equal(s.feedback(false), 'down');
  assert.equal(s.tier, 2);
  for (let i = 0; i < 20; i++) s.feedback(false);
  assert.equal(s.tier, 0, 'ниже нуля не опускается');
  for (let i = 0; i < 40; i++) s.feedback(true);
  assert.equal(s.tier, TIERS - 1);
  assert.equal(s.peak, TIERS - 1);
  const ids = new Set(Array.from({ length: 12 }, () => s.next().id));
  assert.ok(ids.size >= 10, 'задания не повторяются');
});

test('диагностика: по 4 задания на предмет или по 2 на уровень; уровень советуется по первой ошибке', async () => {
  const { DIAG_PER_TRACK, DIAG_PER_LEVEL, diagDefaultTracks, diagLevels, diagQuestions, diagResult, saveDiag, lastDiag } = await import('../src/core/diagnostic.js');
  const ent = courseById('ent');
  const picked = diagDefaultTracks(ent);
  assert.equal(picked.length, 5);
  const qs = diagQuestions(ent, picked, createRng(5));
  assert.equal(qs.length, picked.length * DIAG_PER_TRACK);
  assert.ok(qs.every((q) => picked.includes(q.diagTrack)));
  const math = courseById('math');
  const levels = diagLevels(math);
  assert.ok(levels.length <= 8 && levels[0] === math.tracks[0] && levels.at(-1) === math.tracks.at(-1));
  const mq = diagQuestions(math, [], createRng(6));
  assert.equal(mq.length, levels.length * DIAG_PER_LEVEL);
  // Первые два уровня — всё верно, на третьем ошибка: советуем третий.
  const log = mq.map((q, i) => ({ question: q, correct: i < 4 || i === 5 }));
  const res = diagResult(math, log);
  assert.equal(res.level, levels[2].id);
  assert.equal(res.n, mq.length);
  _setProfileForTests({});
  saveDiag(math, res, getProfile(), '2026-11-17');
  assert.equal(lastDiag(math).level, levels[2].id);
  assert.equal(lastDiag(math).date, '2026-11-17');
});

test('карта знаний: состояния тем и сводка без повторов тем', async () => {
  const { topicState, courseMap, mapSummary, tierForState } = await import('../src/core/mastery.js');
  assert.equal(topicState(undefined), 'new');
  assert.equal(topicState({ a: 4, c: 1 }), 'weak');
  assert.equal(topicState({ a: 2, c: 0 }), 'learning');
  assert.equal(topicState({ a: 6, c: 5 }), 'strong');
  assert.equal(topicState({ a: 20, c: 19 }), 'master');
  assert.ok(tierForState('weak') < tierForState('strong'));
  const ent = courseById('ent');
  const groups = courseMap(ent, { skills: { 'm.pct': { a: 20, c: 19 } } });
  const topics = groups.flatMap((g) => g.topics.map((x) => x.topic));
  assert.equal(new Set(topics).size, topics.length, 'тема встречается один раз');
  const sum = mapSummary(groups);
  assert.equal(sum.total, topics.length);
  assert.equal(sum.counts.master, 1);
  assert.equal(sum.mastered, 1);
});

test('экзамен через N дней: норма растёт при меньшем сроке, финишная неделя и выбранные предметы', async () => {
  const { planTarget, planWeeks, planTracks, planNeed, FINAL_DAYS } = await import('../src/core/plan.js');
  const ent = courseById('ent');
  const profile = { skills: {}, practice: {} };
  const plan = (date, tracks) => ({ course: 'ent', date, ...(tracks ? { tracks } : {}) });
  const far = planTarget(ent, plan('2027-06-01'), profile, '2026-11-17');
  const near = planTarget(ent, plan('2026-12-20'), profile, '2026-11-17');
  assert.ok(near > far, `${near} > ${far}`);
  assert.ok(far >= 10 && near <= 60);
  assert.equal(planTarget(ent, plan('2026-11-20'), profile, '2026-11-17'), 20, 'финишная неделя');
  const few = plan('2027-03-01', ['mathlit', 'history']);
  assert.deepEqual(planTracks(ent, few).map((tr) => tr.id), ['mathlit', 'history']);
  assert.ok(planNeed(ent, profile, few) < planNeed(ent, profile, plan('2027-03-01')));
  const weeks = planWeeks(ent, plan('2027-01-05'), profile, '2026-11-17');
  assert.ok(weeks.length >= 7);
  assert.ok(weeks[0].current && weeks.at(-1).final);
  assert.equal(weeks.at(-1).focus.length, 0);
  assert.ok(weeks.slice(0, -1).every((w) => w.focus.length >= 1));
  assert.ok(weeks[1].mock, 'пробник раз в неделю');
  assert.ok(FINAL_DAYS === 7);
});

test('темп экзамена: время на вопрос по предмету и итог скорости по сессии', async () => {
  const { paceFor, runSpeed, recordSpeed, avgSeconds } = await import('../src/core/pace.js');
  assert.equal(paceFor({ skill: 'm.add', section: 'math', local: true }), 90);
  assert.equal(paceFor({ skill: 'e.vocab', section: 'rw', local: true }), 40);
  assert.equal(paceFor({ skill: 'li.ielts', listen: {}, section: 'rw', local: true }), 90);
  const q = { skill: 'm.add', section: 'math', local: true };
  const sp = runSpeed([
    { question: q, timeMs: 30000 },
    { question: q, timeMs: 120000 },
    { question: q, timeMs: 9999999 },
  ]);
  assert.deepEqual([sp.avg, sp.fast, sp.n], [75, 1, 2]);
  const p = { counters: {} };
  recordSpeed(q, 40000, p);
  recordSpeed(q, 9999999, p);
  assert.equal(p.speed['m.add'].n, 1);
  assert.equal(avgSeconds('m.add', p), 40);
});

test('закладки и заметки: сохранить, заметка, удалить', async () => {
  const { toggleSaved, isSaved, setNote, getSaved, removeSaved } = await import('../src/core/saved.js');
  globalThis.localStorage.removeItem('prepplay:saved');
  const q = { id: 'm.add:1', skill: 'm.add', prompt: { en: '2+2', ru: '2+2', kk: '2+2' }, type: 'mc', choices: ['4', '5', '6', '7'], answer: 0, tier: 3 };
  assert.equal(toggleSaved(q, '2026-11-17'), true);
  assert.ok(isSaved('m.add:1'));
  assert.equal(getSaved()[0].q.tier, undefined, 'служебные поля не сохраняются');
  assert.equal(toggleSaved(q), false);
  assert.equal(setNote(q, '   '), null, 'пустая заметка не создаёт закладку');
  assert.equal(setNote(q, 'знак!').note, 'знак!');
  assert.ok(isSaved('m.add:1'));
  removeSaved('m.add:1');
  assert.equal(getSaved().length, 0);
});

test('аудирование: записи с репликами, вопросы с верными ответами, у задания есть плеер', async () => {
  const { LISTENING, listeningMaker } = await import('../src/pools/listening.js');
  for (const [exam, scripts] of Object.entries(LISTENING)) {
    assert.ok(scripts.length >= 4, exam);
    assert.equal(new Set(scripts.map((s) => s.id)).size, scripts.length);
    for (const s of scripts) {
      assert.ok(s.lines.length >= 5, s.id);
      assert.ok(s.lines.every((l) => s.speakers[l.s]), `${s.id}: у каждой реплики есть говорящий`);
      assert.ok(s.qs.length >= 5, s.id);
      for (const q of s.qs) {
        if (q.type === 'num') assert.ok(Number.isInteger(q.value), s.id);
        else assert.equal(new Set(q.choices).size, 4, `${s.id}: ${q.question}`);
        assert.ok(q.quote.length > 10);
      }
    }
  }
  const make = listeningMaker('li.ielts', 'ielts');
  const ctx = { rng: createRng(1), used: new Set(), state: {} };
  const first = make(ctx);
  const second = make(ctx);
  assert.ok(first.listen && first.listen.lines.length);
  assert.equal(first.listen.id, second.listen.id, 'вопросы одной записи идут подряд');
  assert.ok(courseById('ielts').tracks.some((tr) => tr.id === 'listening'));
  assert.ok(courseById('toefl').tracks.some((tr) => tr.id === 'listening'));
});

test('полные IELTS Reading: 8 тестов по 3 текста (650+ слов) и 40 вопросов, цитаты стоят в своих абзацах, шкала band', async () => {
  const { IELTS_TESTS, fullQuestions, passageWords } = await import('../src/pools/ielts-full.js');
  const { bandFor, nextTest } = await import('../src/screens/fullread.js');
  assert.ok(IELTS_TESTS.length >= 8);
  assert.equal(new Set(IELTS_TESTS.map((x) => x.id)).size, IELTS_TESTS.length);
  const titles = IELTS_TESTS.flatMap((x) => x.passages.map((p) => p.title));
  assert.equal(new Set(titles).size, titles.length, 'тексты не повторяются');
  for (const test of IELTS_TESTS) {
    assert.equal(test.passages.length, 3, test.id);
    for (const p of test.passages) assert.ok(passageWords(p) >= 650, `${test.id} · ${p.title}: ${passageWords(p)}`);
    const qs = fullQuestions(test);
    assert.equal(qs.length, 40, test.id);
    assert.deepEqual(qs.map((q) => q.n), Array.from({ length: 40 }, (_, i) => i + 1));
    for (const q of qs) {
      const where = `${test.id} · вопрос ${q.n}`;
      const n = q.type === 'mc' ? q.item.choices.length : q.type === 'tfng' || q.type === 'ynng' ? 3 : q.options.length;
      assert.ok(q.item.answer >= 0 && q.item.answer < n, where);
      if (q.type === 'mc') assert.equal(new Set(q.item.choices).size, 4, where);
      const para = test.passages[q.passage].paras.find(([l]) => l === q.item.para);
      assert.ok(para, `${where}: абзац ${q.item.para}`);
      const quote = q.item.quote;
      if (!quote.includes('…') && !/^The (passage|writer)/.test(quote)) assert.ok(para[1].includes(quote), `${where}: цитата не найдена в абзаце`);
    }
    // В вопросах на заголовки каждый абзац получает свой заголовок.
    for (const p of test.passages) {
      for (const g of p.groups.filter((x) => x.type === 'heading')) {
        assert.equal(new Set(g.items.map((it) => it.answer)).size, g.items.length, `${test.id}: заголовки не повторяются`);
        assert.ok(g.options.length > g.items.length, 'есть лишние заголовки');
      }
    }
    assert.ok(qs.some((q) => q.type === 'heading') && qs.some((q) => q.type === 'ynng') && qs.some((q) => q.type === 'bank'), test.id);
    const letters = [0, 0, 0, 0];
    for (const q of qs) if (q.type === 'mc') letters[q.item.answer] += 1;
    assert.ok(letters.every((x) => x >= 2), `${test.id}: правильные ответы равномерно по буквам A–D (${letters})`);
  }
  assert.equal(bandFor(40), 9);
  assert.equal(bandFor(30), 7);
  assert.equal(bandFor(23), 6);
  assert.ok(bandFor(0) >= 1);
  assert.equal(nextTest([]).id, IELTS_TESTS[0].id);
  assert.equal(nextTest([{ band: 6 }]).id, IELTS_TESTS[1].id, 'старые попытки без номера — это тест 1');
});

test('анимации тем: каждая привязана к существующим темам и есть на странице', async () => {
  const { EXPLAINERS, explainerFor } = await import('../src/content/explainers.js');
  const src = readFileSync('src/screens/explain.js', 'utf8');
  assert.ok(EXPLAINERS.length >= 10);
  for (const e of EXPLAINERS) {
    assert.ok(src.includes(`${e.id.includes('-') ? `'${e.id}'` : e.id}: {`), `сцена ${e.id}`);
    for (const topic of e.topics) {
      assert.ok(TOPICS[topic], topic);
      assert.equal(explainerFor(topic), e.id);
    }
  }
});

test('новые вопросы: банки истории стран региона и наук пополнены, ответ не повторяется среди неверных', async () => {
  const { HISTORY_REGION } = await import('../src/pools/humanities/history.js');
  const { CHEMISTRY_THEORY } = await import('../src/pools/science/chemistry.js');
  const { PHYSICS_THEORY } = await import('../src/pools/science/physics.js');
  const { BIOLOGY, GEOGRAPHY } = await import('../src/pools/science/bio-geo.js');
  for (const id of ['uz', 'kg', 'tj', 'az', 'am']) assert.ok(HISTORY_REGION[id].length >= 10, id);
  assert.ok(CHEMISTRY_THEORY.length >= 25 && PHYSICS_THEORY.length >= 25 && BIOLOGY.length >= 40 && GEOGRAPHY.length >= 40);
  const text = (x) => (typeof x === 'string' ? x : x.ru);
  for (const rows of [...Object.values(HISTORY_REGION), CHEMISTRY_THEORY, PHYSICS_THEORY, BIOLOGY, GEOGRAPHY]) {
    for (const [d, q, right, wrong] of rows) {
      assert.ok([1, 2, 3].includes(d));
      assert.equal(wrong.length, 3, text(q));
      assert.equal(new Set([right, ...wrong].map(text)).size, 4, text(q));
    }
  }
});

test('оформление: 12+ тем, тёмные темы помечены и до загрузки страницы', async () => {
  const { THEMES, applyTheme } = await import('../src/core/theme.js');
  assert.ok(THEMES.length >= 15);
  const html = readFileSync('index.html', 'utf8');
  const listed = html.match(/\[([^\]]+)\]\.indexOf\(theme\)/)[1].split(',').map((s) => s.trim().replace(/'/g, ''));
  assert.deepEqual(listed.sort(), THEMES.filter((t) => t.dark).map((t) => t.id).sort());
  const doc = { documentElement: { dataset: {} }, querySelector: () => null };
  applyTheme('neon', doc);
  assert.equal(doc.documentElement.dataset.dark, '1');
  applyTheme('sakura', doc);
  assert.equal(doc.documentElement.dataset.dark, undefined);
  const css = readFileSync('styles/main.css', 'utf8');
  assert.ok(css.includes('prefers-reduced-motion'));
  assert.ok(COURSES.length > 0);
});

test('даты и личности по 7 странам: таблицы фактов дают сотни разных вопросов и подключены к экзаменам', async () => {
  const pairs = { uz: 'dtm', kg: 'ort', tj: 'tj', az: 'dim', am: 'arm', by: 'ct', md: 'bac' };
  for (const [country, exam] of Object.entries(pairs)) {
    const topic = `h.${country}t`;
    assert.ok(TOPICS[topic], topic);
    const rng = createRng(9);
    const seen = new Set();
    for (let i = 0; i < 300; i++) {
      const q = TOPICS[topic].make({ rng, used: new Set(), state: {} }, 1 + (i % 3));
      assert.equal(new Set(q.choices.map((c) => c.ru ?? c)).size, 4, `${topic}: ${q.prompt.ru}`);
      assert.ok(q.choices[q.answer], topic);
      seen.add(q.id);
    }
    assert.ok(seen.size >= 100, `${topic}: ${seen.size} разных заданий`);
    const course = courseById(exam);
    assert.ok(course.tracks.some((tr) => tr.spec.some(([id]) => id === topic)), `${exam} включает ${topic}`);
  }
});

test('монета: картинки P&P на месте, стили на них ссылаются, значок подставляется вместо 🪙', async () => {
  const big = readFileSync('icons/coin.svg', 'utf8');
  const small = readFileSync('icons/coin-sm.svg', 'utf8');
  for (const svg of [big, small]) {
    assert.ok(svg.startsWith('<svg') && svg.includes('P&amp;P'), 'в центре P&P');
  }
  assert.ok(big.includes('url(#leaf)'), 'на крупной монете — лавровая ветвь');
  const css = readFileSync('styles/main.css', 'utf8');
  assert.ok(css.includes("url('../icons/coin.svg')") && css.includes("url('../icons/coin-sm.svg')"));
  assert.ok(readFileSync('.github/workflows/ci.yml', 'utf8').includes('icons'), 'папка icons попадает на сайт');
  const { coinHtml, COIN } = await import('../src/ui/coin.js');
  assert.ok(coinHtml('coin-lg').includes('class="coin coin-lg"'));
  assert.equal(COIN, '🪙');
});

test('ведущий квиза: колесо останавливается ровно на выбранном предмете', async () => {
  const { WHEEL, angleFor, sectorAt } = await import('../src/ui/quiz-host.js');
  assert.equal(WHEEL.length, 8);
  let angle = 0;
  for (let k = 0; k < 40; k++) {
    const i = k % WHEEL.length;
    const jitter = ((k * 7) % 13) - 6;
    const next = angleFor(i, angle, 4, jitter);
    assert.ok(next - angle >= 4 * 360 && next - angle < 5 * 360, 'не меньше четырёх оборотов вперёд');
    assert.equal(sectorAt(next), i, `сектор ${i}`);
    angle = next;
  }
  const { mascot } = await import('../src/ui/mascot.js');
  const svg = mascot('happy', '', { head: 'host-hat', neck: 'host-suit' });
  assert.ok(svg.includes('host-hat') && svg.includes('host-mic'), 'Препи в цилиндре и с микрофоном');
});
