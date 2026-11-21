// Анимации тем: каждая сцена рисуется без ошибок с начальными и крайними значениями ползунков,
// на каждом шаге кнопок, и в подписи нет длинных тире.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPLAINERS } from '../src/content/explainers.js';
import { SCENES_MATH } from '../src/explain/scenes-math.js';
import { SCENES_SCIENCE } from '../src/explain/scenes-science.js';
import { SCENES_HUMAN } from '../src/explain/scenes-human.js';
import { slider } from '../src/explain/kit.js';

const SCENES = { ...SCENES_MATH, ...SCENES_SCIENCE, ...SCENES_HUMAN };

test('анимации: у каждой анимации из списка есть сцена, лишних сцен нет', () => {
  const ids = EXPLAINERS.map((e) => e.id).sort();
  assert.deepEqual(Object.keys(SCENES).sort(), ids);
});

test('анимации: сцены рисуются без ошибок на всех шагах и крайних значениях', () => {
  for (const [id, s] of Object.entries(SCENES)) {
    assert.ok(s.title && s.intro && Array.isArray(s.sliders), `${id}: title, intro, sliders`);
    const st = s.state ? s.state() : {};
    const v = { ...(s.values ?? {}), ...Object.fromEntries(s.sliders.map((x) => [x.id, x.value])) };
    const steps = Math.max(3, (s.buttons ?? []).length + 1);
    for (let step = 0; step < steps; step++) {
      const out = s.draw(v, step, st, step);
      assert.ok(out?.svg?.length > 20, `${id}: картинка на шаге ${step}`);
      assert.ok(!/[—–]/.test(String(out.caption ?? '')), `${id}: длинное тире в подписи`);
    }
    for (const sl of s.sliders) for (const val of [sl.min, sl.max]) assert.ok(s.draw({ ...v, [sl.id]: val }, 0, st, 0)?.svg, `${id}: ${sl.id}=${val}`);
    for (const sl of s.sliders) assert.ok(slider(sl, String(sl.value)).includes('type="range"'), `${id}: ползунок ${sl.id}`);
    if (s.live) s.live(0.016, v, st);
  }
});
