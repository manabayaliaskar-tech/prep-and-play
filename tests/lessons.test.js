// Мини-уроки: формат, три языка, без эмодзи и длинных тире, ответ «проверь себя» в пределах вариантов.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../src/content/lessons/index.js';
import { TOPICS } from '../src/pools/topics.js';
import { SKILLS } from '../src/content/skills.js';

const LANGS = ['en', 'ru', 'kk'];
const EMOJI = /\p{Extended_Pictographic}/u;

function text(id, where, v) {
  assert.ok(v && typeof v === 'object', `${id}: ${where} - нужен L(en, ru, kk)`);
  for (const l of LANGS) {
    assert.equal(typeof v[l], 'string', `${id}: ${where}.${l} - нет текста`);
    assert.ok(v[l].trim().length > 0, `${id}: ${where}.${l} - пусто`);
    assert.ok(!/[—–]/.test(v[l]), `${id}: ${where}.${l} - длинное тире, нужен дефис «-»`);
    assert.ok(!EMOJI.test(v[l]), `${id}: ${where}.${l} - эмодзи в уроке`);
  }
}

test('мини-уроки: формат и тексты на трёх языках', () => {
  for (const [id, les] of Object.entries(LESSONS)) {
    assert.ok(TOPICS[id] || SKILLS[id], `${id}: нет такой темы в pools/topics.js или навыка SAT`);
    text(id, 'rule', les.rule);
    for (const [i, p] of (les.points ?? []).entries()) text(id, `points[${i}]`, p);
    assert.ok(les.example && Array.isArray(les.example.steps) && les.example.steps.length >= 1, `${id}: нужен example со steps`);
    text(id, 'example.q', les.example.q);
    les.example.steps.forEach((s, i) => text(id, `example.steps[${i}]`, s));
    const c = les.check;
    assert.ok(c && Array.isArray(c.options) && c.options.length >= 2 && c.options.length <= 4, `${id}: check.options - от 2 до 4`);
    text(id, 'check.q', c.q);
    c.options.forEach((o, i) => text(id, `check.options[${i}]`, o));
    assert.ok(Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length, `${id}: check.answer вне вариантов`);
    text(id, 'check.why', c.why);
    const ru = c.options.map((o) => o.ru);
    assert.equal(new Set(ru).size, ru.length, `${id}: одинаковые варианты`);
  }
});
