// Прогон всех режимов и кнопок математических сцен: ищем NaN, undefined, длинные тире, ошибки.
// Запуск: node check.mjs [id ...]
import { setLang } from '/home/user/School/src/core/i18n.js';
import { SCENES_MATH } from '/home/user/School/src/explain/scenes-math.js';

const only = new Set(process.argv.slice(2));
const bad = /NaN|undefined|Infinity|\[object|null/;
let problems = 0;
const say = (...a) => {
  problems++;
  if (problems < 60) console.log(...a);
};

function caps(c) {
  if (typeof c === 'string') return [c];
  return ['en', 'ru', 'kk'].map((l) => c?.[l]);
}

for (const lang of ['ru', 'en', 'kk']) {
  setLang(lang);
  for (const [id, s] of Object.entries(SCENES_MATH)) {
    if (only.size && !only.has(id)) continue;
    const st = s.state ? s.state() : {};
    const v = { ...(s.values ?? {}), ...Object.fromEntries(s.sliders.map((x) => [x.id, x.value])) };
    const api = {
      play: (k) => {
        const sl = s.sliders.find((x) => x.id === k);
        if (sl) v[k] = sl.max;
      },
      run: (fn) => {
        for (let g = 0; g < 300 && fn(); g++);
      },
      stop: () => {},
      draw: () => {},
    };
    const test = (where) => {
      s.clamp?.(v);
      let out;
      try {
        out = s.draw(v, 0, st, 0);
      } catch (e) {
        say(id, where, 'THROW', e.stack.split('\n').slice(0, 3).join(' | '));
        return;
      }
      if (!out || typeof out.svg !== 'string') return say(id, where, 'no svg');
      const m = out.svg.match(bad);
      if (m) say(id, where, 'svg has', m[0], out.svg.slice(Math.max(0, m.index - 80), m.index + 40));
      for (const c of caps(out.caption)) {
        if (typeof c !== 'string' || !c.length) say(id, where, 'empty caption', lang);
        else if (/[—–]/.test(c) || bad.test(c)) say(id, where, 'caption bad:', c.slice(0, 200));
      }
      if (/[—–]/.test(out.svg)) say(id, where, 'long dash in svg');
      // перетаскивание
      if (s.onDrag) {
        const keys = [...out.svg.matchAll(/data-drag="([^"]+)"/g)].map((x) => x[1]);
        for (const k of keys)
          for (const p of [{ x: 0, y: 0 }, { x: 320, y: 220 }, { x: 160, y: 110 }, { x: Math.random() * 320, y: Math.random() * 220 }]) {
            try {
              s.onDrag(k, p, v, st);
              s.clamp?.(v);
              const o2 = s.draw(v, 0, st, 0);
              if (bad.test(o2.svg)) say(id, where, 'drag', k, 'svg bad', o2.svg.match(bad)[0]);
            } catch (e) {
              say(id, where, 'drag THROW', k, e.message);
            }
          }
      }
    };
    const extremes = (where) => {
      test(where);
      for (const sl of s.sliders) {
        const keep = v[sl.id];
        for (const x of [sl.min, sl.max, (sl.min + sl.max) / 2]) {
          v[sl.id] = x;
          test(`${where} ${sl.id}=${x}`);
        }
        v[sl.id] = keep;
      }
      // случайные значения
      for (let r = 0; r < 6; r++) {
        for (const sl of s.sliders) {
          const stp = sl.step ?? 1;
          v[sl.id] = sl.min + Math.round((Math.random() * (sl.max - sl.min)) / stp) * stp;
        }
        test(`${where} rnd`);
      }
    };
    const nb = (s.buttons ?? []).length;
    extremes('init');
    for (let rep = 0; rep < 3; rep++)
      for (let i = 0; i < nb; i++) {
        for (let j = 0; j < nb; j++) {
          // в каждом режиме нажимаем все кнопки
          try {
            const r = s.onButton ? s.onButton(i, st, v, api) : null;
            if (r && typeof r === 'object') {
              const { $dur, ...p } = r;
              for (const [k, x] of Object.entries(p)) {
                if (!Number.isFinite(x)) say(id, `btn ${i}`, 'patch not finite', k, x);
                v[k] = x;
              }
            }
            const r2 = s.onButton ? s.onButton(j, st, v, api) : null;
            if (r2 && typeof r2 === 'object') {
              const { $dur, ...p } = r2;
              for (const [k, x] of Object.entries(p)) {
                if (!Number.isFinite(x)) say(id, `btn ${j}`, 'patch not finite', k, x);
                v[k] = x;
              }
            }
          } catch (e) {
            say(id, `btn ${i},${j}`, 'THROW', e.stack.split('\n').slice(0, 3).join(' | '));
          }
          if (rep === 0) extremes(`m=${st.m} after ${i},${j}`);
          else test(`m=${st.m} after ${i},${j}`);
        }
      }
    // слайдеры за пределами шага, не должно падать
    for (const sl of s.sliders) if (sl.hidden && typeof sl.hidden !== 'function') say(id, 'hidden not fn');
  }
}
console.log(problems ? `PROBLEMS: ${problems}` : 'OK');
