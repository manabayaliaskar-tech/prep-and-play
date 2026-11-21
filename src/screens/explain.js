// Анимированные объяснения тем: интерактивные картинки, которые можно крутить ползунками и запускать.
// Каждая анимация - сцена (SVG) + ползунки/кнопки + подпись, которая объясняет, что происходит.
//
// Сцена: { title, intro, sliders, buttons, draw(v, step, st, f) → { svg, caption } } и по желанию:
//   values - значения без ползунков; state() - своё состояние; clamp(v) - ограничения;
//   play / playDur / playLinear / playReverse - кнопка «▶» прогоняет ползунок play;
//   onButton(i, st, v, api) - своя логика кнопок; вернуть объект { key: цель, $dur } → плавный переход;
//   pressed(i, v, st) - кнопка-переключатель; onSlide(key, v, st); onDrag(key, point, v, st) - перетаскивание
//   элементов с data-drag; live(dt, v, st) - постоянное движение (маятник, молекулы).
// Режимы: у ползунка hidden(v, st) → true прячет его, у сцены btnHidden(i, v, st) прячет кнопку i.
// mountScene(host, id) показывает анимацию в любом контейнере (страница анимации, урок).
// f - «дробный шаг»: при смене шага кнопкой он плавно идёт от старого шага к новому (для анимации переходов).
// SVG не пересоздаётся целиком, а обновляется по месту (morph), поэтому работают CSS-переходы.

import { getLang, t, tx } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { navigate } from '../core/router.js';
import { EXPLAIN_SUBJECTS, EXPLAINERS, explainerById } from '../content/explainers.js';
import { storage } from '../core/storage.js';
import { skillName } from '../content/labels.js';
import { esc } from '../ui/dom.js';
import { runAdaptive } from './learn.js';

import { SCENES_MATH } from '../explain/scenes-math.js';
import { SCENES_SCIENCE } from '../explain/scenes-science.js';
import { SCENES_HUMAN } from '../explain/scenes-human.js';
import { C, H, SVGNS, W, clamp, ease, fmt, lerp, morph, reduced, slider } from '../explain/kit.js';

// Сцены разложены по предметам в src/explain/scenes-*.js.
const SCENES = { ...SCENES_MATH, ...SCENES_SCIENCE, ...SCENES_HUMAN };

// ---------- Страницы ----------

/** Разделы страницы анимаций: иконка и название. */
const SUBJ = {
  algebra: ['🧮', () => t('explain.s.algebra')],
  geometry: ['📐', () => t('explain.s.geometry')],
  higher: ['∫', () => t('explain.s.higher')],
  physics: ['⚛️', () => t('explain.s.physics')],
  chemistry: ['🧪', () => t('explain.s.chemistry')],
  biology: ['🧬', () => t('explain.s.biology')],
  cs: ['💻', () => t('explain.s.cs')],
  geo: ['🌍', () => t('explain.s.geo')],
  history: ['📜', () => t('explain.s.history')],
  english: ['🔤', () => t('explain.s.english')],
};

const explainCard = (e, i) => `<a class="explain-card" href="#/explain/${e.id}" style="--i:${Math.min(i, 16)}">
            <span class="explain-icon" aria-hidden="true">${e.icon}</span>
            <b>${esc(tx(SCENES[e.id].title))}</b>
            <small>${e.topics.map((id) => esc(tx(skillName(id)))).join(' · ')}</small>
          </a>`;

export function explainIndexRoute(app) {
  const render = () => {
    let pick = storage.get('explainSubj', 'all');
    if (pick !== 'all' && !SUBJ[pick]) pick = 'all';
    const shown = EXPLAIN_SUBJECTS.filter((s) => pick === 'all' || s === pick);
    const chip = (id, label, n) =>
      `<button type="button" class="explain-chip ${pick === id ? 'on' : ''}" data-subj="${id}" aria-pressed="${pick === id}">${label} <span>${n}</span></button>`;
    app.innerHTML = `
      <section class="page explain-index">
        <div class="page-head">
          <h1>🎬 ${t('explain.title')}</h1>
          <p class="muted">${t('explain.desc')}</p>
        </div>
        <div class="explain-chips" role="toolbar">
          ${chip('all', t('explain.all'), EXPLAINERS.length)}
          ${EXPLAIN_SUBJECTS.map((s) => chip(s, `${SUBJ[s][0]} ${SUBJ[s][1]()}`, EXPLAINERS.filter((e) => e.subj === s).length)).join('')}
        </div>
        ${shown
          .map((s) => {
            const list = EXPLAINERS.filter((e) => e.subj === s);
            return `<h2 class="section-title explain-subj">${SUBJ[s][0]} ${SUBJ[s][1]()} <small>${list.length}</small></h2>
        <div class="explain-grid">${list.map(explainCard).join('')}</div>`;
          })
          .join('')}
      </section>`;
    app.querySelectorAll('.explain-chip').forEach((b) =>
      b.addEventListener('click', () => {
        storage.set('explainSubj', b.dataset.subj);
        render();
      }),
    );
  };
  render();
  return { relabel: render };
}

/**
 * Анимация в контейнере host: картинка, подпись, ползунки и кнопки. Используется на странице анимации
 * и внутри урока. Возвращает { cleanup, relabel }. Когда контейнер убрали со страницы, движение
 * останавливается само.
 */
export function mountScene(host, id) {
  const scene = SCENES[id];
  if (!scene || !host) return null;
  const values = { ...(scene.values ?? {}), ...Object.fromEntries(scene.sliders.map((s) => [s.id, s.value])) };
  const st = scene.state?.() ?? {};
  let step = 0; // целевой шаг
  let f = 0; // показываемый (плавно меняющийся) шаг
  let frame = 0; // отложенная перерисовка
  let anim = 0; // плавный переход или «▶»
  let timer = 0; // автошаги (сортировка)
  let liveId = 0; // постоянное движение
  let liveT = 0;
  let els = null;
  const tmp = typeof document !== 'undefined' ? document.createElementNS(SVGNS, 'svg') : null;

  const spec = (k) => scene.sliders.find((s) => s.id === k);
  const isInt = (k) => {
    const s = spec(k);
    return Boolean(s) && (s.step ?? 1) >= 1;
  };
  const shown = (s, x) => (s.show ? s.show(Math.round(x)) : fmt(x, (s.step ?? 1) < 1 ? 2 : 0));

  const draw = () => {
    if (!els) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    scene.clamp?.(values);
    const out = scene.draw(values, step, st, f);
    tmp.innerHTML = out.svg;
    morph(els.svg, tmp);
    const cap = tx(out.caption);
    if (els.cap.textContent !== cap) els.cap.textContent = cap;
    for (const s of scene.sliders) {
      const input = els.inputs[s.id];
      if (Number(input.value) !== values[s.id]) input.value = values[s.id];
      const txt = shown(s, values[s.id]);
      if (els.outs[s.id].textContent !== txt) {
        els.outs[s.id].textContent = txt;
        input.setAttribute('aria-valuetext', txt);
      }
    }
    // Ползунки и кнопки, которые не нужны в текущем режиме: hidden(v, st) у ползунка, btnHidden(i, v, st) у сцены.
    for (const s of scene.sliders) {
      const hide = Boolean(s.hidden?.(values, st));
      const label = els.inputs[s.id].closest('.ex-slider');
      if (label.hidden !== hide) label.hidden = hide;
    }
    if (scene.btnHidden)
      els.btns.forEach((b, i) => {
        const hide = Boolean(scene.btnHidden(i, values, st));
        if (b.hidden !== hide) b.hidden = hide;
      });
    if (scene.pressed)
      els.btns.forEach((b, i) => {
        const on = Boolean(scene.pressed(i, values, st));
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
  };
  // Не чаще одного раза за кадр: ползунок шлёт 'input' много раз, рисуем по requestAnimationFrame.
  const schedule = () => {
    if (!frame && !liveId) frame = requestAnimationFrame(draw);
  };
  // Пока что-то движется под пальцем или анимацией, CSS-переходы отключены (иначе картинка «запаздывает»).
  const live = () => {
    if (!els) return;
    els.stage.classList.add('ex-live');
    clearTimeout(liveT);
    liveT = setTimeout(() => els?.stage.classList.remove('ex-live'), 200);
  };
  const stopMotion = () => {
    cancelAnimationFrame(anim);
    anim = 0;
    clearTimeout(timer);
    timer = 0;
  };

  /** Плавно перевести значения к target и шаг к toStep (≈400 мс, с замедлением). */
  function animateTo(target = {}, toStep = step, dur = 420) {
    stopMotion();
    const keys = Object.keys(target);
    const from = Object.fromEntries(keys.map((k) => [k, values[k]]));
    const f0 = f;
    step = toStep;
    const finish = () => {
      anim = 0;
      Object.assign(values, target);
      f = toStep;
      draw();
    };
    if (reduced()) return finish();
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      if (k >= 1) return finish();
      const e = ease(k);
      for (const key of keys) {
        const x = lerp(from[key], target[key], e);
        values[key] = isInt(key) ? Math.round(x) : x;
      }
      f = lerp(f0, toStep, e);
      live();
      draw();
      anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  }

  /** «▶»: прогнать ползунок key от начала до конца. */
  function play(key = scene.play, opt = {}) {
    const s = spec(key);
    stopMotion();
    const rev = opt.reverse ?? scene.playReverse;
    const from = rev ? s.max : s.min;
    const to = rev ? s.min : s.max;
    const dur = opt.dur ?? scene.playDur ?? 2600;
    const linear = opt.linear ?? scene.playLinear;
    if (reduced()) {
      values[key] = to;
      draw();
      return;
    }
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const x = lerp(from, to, linear ? k : ease(k));
      values[key] = isInt(key) ? Math.round(x) : x;
      live();
      draw();
      anim = k < 1 ? requestAnimationFrame(tick) : 0;
    };
    anim = requestAnimationFrame(tick);
  }

  /** Повторять fn каждые ms мс, пока она возвращает true. */
  function run(fn, ms) {
    stopMotion();
    if (reduced()) {
      for (let guard = 0; fn() && guard < 2000; guard++);
      draw();
      return;
    }
    const tick = () => {
      const more = fn();
      draw();
      timer = more ? setTimeout(tick, ms) : 0;
    };
    tick();
  }

  const api = { play, run, stop: stopMotion, draw };

  const startLive = () => {
    cancelAnimationFrame(liveId);
    liveId = 0;
    if (!scene.live || reduced()) return;
    let last = performance.now();
    const loop = (now) => {
      if (!els?.svg.isConnected) return cleanup();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      scene.live(dt, values, st);
      draw();
      liveId = requestAnimationFrame(loop);
    };
    liveId = requestAnimationFrame(loop);
  };

  const render = () => {
    stopMotion();
    host.innerHTML = `
        <div class="ex-card">
          <div class="ex-stage${scene.onDrag ? ' has-drag' : ''}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tx(scene.title))}"></svg></div>
          <p class="ex-caption" aria-live="polite"></p>
          ${scene.sliders.length ? `<div class="ex-controls">${scene.sliders.map((s) => slider({ ...s, label: tx(s.label), value: values[s.id] }, shown(s, values[s.id]))).join('')}</div>` : ''}
          ${scene.buttons.length ? `<div class="ex-buttons${scene.pressed ? ' ex-toggles' : ''}">${scene.buttons.map((b, i) => `<button type="button" class="btn ${i === 0 && !scene.pressed ? 'btn-primary' : 'btn-soft'} btn-sm" data-b="${i}">${esc(tx(b))}</button>`).join('')}</div>` : ''}
        </div>`;
    const app = host;
    els = {
      svg: app.querySelector('.ex-stage svg'),
      stage: app.querySelector('.ex-stage'),
      cap: app.querySelector('.ex-caption'),
      inputs: {},
      outs: {},
      btns: [...app.querySelectorAll('[data-b]')],
    };
    app.querySelectorAll('[data-k]').forEach((input) => {
      const key = input.dataset.k;
      els.inputs[key] = input;
      els.outs[key] = app.querySelector(`[data-v="${key}"]`);
      input.addEventListener('input', () => {
        stopMotion();
        f = step;
        values[key] = Number(input.value);
        scene.onSlide?.(key, values, st);
        live();
        schedule();
      });
    });
    els.btns.forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.dataset.b);
        if (scene.onButton) {
          const r = scene.onButton(i, st, values, api);
          if (r && typeof r === 'object') {
            const { $dur, ...target } = r;
            animateTo(target, step, $dur);
          } else draw();
        } else if (scene.play) play();
        else {
          const last = scene.buttons.length - 1;
          animateTo({}, i === last && i > 0 ? 0 : Math.min(i + 1, last));
        }
      }),
    );
    if (scene.onDrag) {
      const svg = els.svg;
      let dragKey = null;
      const move = (e) => {
        if (!dragKey) return;
        const m = svg.getScreenCTM();
        if (!m) return;
        const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        scene.onDrag(dragKey, pt, values, st);
        live();
        schedule();
      };
      svg.addEventListener('pointerdown', (e) => {
        const el = e.target.closest?.('[data-drag]');
        if (!el) return;
        dragKey = el.dataset.drag;
        stopMotion();
        svg.setPointerCapture?.(e.pointerId);
        e.preventDefault();
        move(e);
      });
      svg.addEventListener('pointermove', move);
      const end = () => {
        dragKey = null;
      };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
    }
    draw();
    startLive();
  };
  function cleanup() {
    stopMotion();
    cancelAnimationFrame(frame);
    cancelAnimationFrame(liveId);
    liveId = 0;
    clearTimeout(liveT);
    els = null;
  }
  render();
  return { cleanup, relabel: render };
}

export function explainRoute(app, { id }) {
  const meta = explainerById(id);
  const scene = SCENES[id];
  if (!meta || !scene) {
    navigate('/explain');
    return null;
  }
  const p = getProfile();
  p.counters.explained = (p.counters.explained ?? 0) + 1;
  saveProfile();
  let mounted = null;
  let session = null;
  const render = () => {
    mounted?.cleanup();
    const topic = meta.topics[0];
    app.innerHTML = `
      <section class="page explain-page">
        <a class="crumb" href="#/explain">← ${t('explain.title')}</a>
        <div class="explain-head"><span class="explain-icon big" aria-hidden="true">${meta.icon}</span><div><h1>${esc(tx(scene.title))}</h1><p class="muted">${esc(tx(scene.intro))}</p></div></div>
        <div class="ex-mount"></div>
        <div class="explain-next">
          <button type="button" class="btn btn-primary ex-train">▶ ${t('explain.train', { name: tx(skillName(topic)) })}</button>
          ${EXPLAINERS.length > 1 ? `<a class="btn btn-soft" href="#/explain/${EXPLAINERS[(EXPLAINERS.indexOf(meta) + 1) % EXPLAINERS.length].id}">${t('explain.next')} →</a>` : ''}
        </div>
      </section>`;
    mounted = mountScene(app.querySelector('.ex-mount'), id);
    app.querySelector('.ex-train').addEventListener('click', () => {
      mounted?.cleanup();
      mounted = null;
      session = runAdaptive(app, {
        title: () => `🎬 ${tx(skillName(topic))}`,
        spec: [[topic, [1, 2, 3]]],
        tier: 1,
        count: 8,
        exitTo: `/explain/${id}`,
        back: { label: `🎬 ${t('explain.back')}`, href: `/explain/${id}` },
      });
    });
  };
  render();
  return {
    cleanup: () => {
      mounted?.cleanup();
      session?.cleanup?.();
    },
    relabel: () => (session ? session.relabel() : render()),
  };
}
