// Прогоняет draw каждой сцены с начальными значениями и несколькими шагами: ловит ReferenceError и пустые картинки.
const mods = await Promise.all(['math', 'science', 'human'].map((g) => import(`/home/user/School/src/explain/scenes-${g}.js`)));
const SCENES = Object.assign({}, ...mods.map((m) => Object.values(m)[0]));
let bad = 0;
for (const [id, s] of Object.entries(SCENES)) {
  try {
    const st = s.state ? s.state() : {};
    const v = { ...(s.values ?? {}), ...Object.fromEntries((s.sliders ?? []).map((x) => [x.id, x.value])) };
    for (const step of [0, 1, 2]) {
      const out = s.draw(v, step, st, step);
      if (!out?.svg) throw new Error('нет svg');
    }
    // крайние значения ползунков
    for (const sl of s.sliders ?? []) for (const val of [sl.min, sl.max]) s.draw({ ...v, [sl.id]: val }, 0, st, 0);
    if (s.live) s.live(0.016, v, st);
  } catch (e) {
    bad++;
    console.log('!!', id, e.message.slice(0, 120));
  }
}
console.log('сцен', Object.keys(SCENES).length, 'ошибок', bad);
