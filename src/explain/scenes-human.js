// Анимации тем: Информатика, география, история и английский. Формат сцены описан в src/screens/explain.js.

import { getLang, t, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { W, H, C, SVGNS, reduced, clamp, lerp, ease, n1, fmt, term, coef, lineEq, u, hhmm, arrow, plot, axes, slider, morph, AGAIN, RESET, PROGRESS } from './kit.js';
import { KZ_TIMELINE, KZ_ERAS, WORLD_TIMELINE, WORLD_ERAS, RU_TIMELINE, RU_ERAS } from './data-history.js';

// ---------- Общие помощники сцен этого файла ----------

/** Перенос текста по словам: не длиннее max символов в строке, не больше lines строк (лишнее - «…»). */
function wrap(s, max, lines = 9) {
  const out = [];
  let line = '';
  for (const w of String(s).split(' ')) {
    if (!line) line = w;
    else if (line.length + 1 + w.length <= max) line += ` ${w}`;
    else {
      out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    let last = out[lines - 1];
    while (last.length + 1 > max && last.includes(' ')) last = last.slice(0, last.lastIndexOf(' '));
    out[lines - 1] = `${last}…`;
  }
  return out;
}

/** Нажатие на элемент сцены (data-drag): onDrag зовётся и при движении пальца, засчитываем одно касание. */
function tapOnce(st, key) {
  const now = globalThis.performance?.now?.() ?? Date.now();
  const same = st.$tap === key && now - st.$tapT < 450;
  st.$tap = key;
  st.$tapT = now;
  return !same;
}

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
/** Строки SVG-текста (каждая - отдельный <text>). */
const lines = (arr, x, y, dy, cls, extra = '') => arr.map((s, i) => `<text class="${cls}" x="${n1(x)}" y="${n1(y + i * dy)}"${extra}>${esc(s)}</text>`).join('');
/** Кнопка-«фишка» внутри SVG: нажатие приходит в onDrag(key). cls: on / ok / bad. */
const chip = (x, y, w, h, label, key, cls = '', fs = 12) =>
  `<g class="exh-chip ${cls}" data-drag="${key}"><rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${Math.min(9, h / 2)}"/><text class="exh-f${fs}" x="${n1(x + w / 2)}" y="${n1(y + h / 2 + fs * 0.36)}">${esc(label)}</text></g>`;
const ROMAN = (n) => {
  let s = '';
  for (const [v, r] of [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']])
    while (n >= v) {
      s += r;
      n -= v;
    }
  return s;
};
const ord = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
/** «XV век», «15th century», «XV ғасыр». */
function century(y) {
  const c = Math.ceil(Math.abs(y) / 100) || 1;
  return y > 0 ? u(`${ord(c)} century`, `${ROMAN(c)} век`, `${ROMAN(c)} ғасыр`) : u(`${ord(c)} century BC`, `${ROMAN(c)} век до н. э.`, `б. з. д. ${ROMAN(c)} ғасыр`);
}

// ---------- Лента времени: эпохи, масштаб, фильтр, задания ----------

const TL_CATS = [
  { k: 's', c: 'exc-b', n: L('States', 'Власть', 'Билік'), f: L('states and rulers', 'государства и правители', 'мемлекеттер мен билеушілер') },
  { k: 'w', c: 'exc-r', n: L('Wars', 'Войны', 'Соғыстар'), f: L('wars and uprisings', 'войны и восстания', 'соғыстар мен көтерілістер') },
  { k: 'c', c: 'exc-g', n: L('Culture', 'Культура', 'Мәдениет'), f: L('culture and science', 'культура и наука', 'мәдениет пен ғылым') },
  { k: 'e', c: 'exc-o', n: L('Society', 'Общество', 'Қоғам'), f: L('economy and society', 'экономика и общество', 'экономика және қоғам') },
];
const TL_CAT = Object.fromEntries(TL_CATS.map((c) => [c.k, c]));
const ERA_C = ['exc-p', 'exc-a', 'exc-y', 'exc-k', 'exc-b', 'exc-g', 'exc-o', 'exc-r'];
const ZOOM_N = [L('all', 'все', 'бәрі'), '1000', '100', '10'];
const TL_X0 = 10;
const TL_X1 = 310;

/** Дата события полностью: «ок. 1450 г.», «530 г. до н. э.», «XVI-XVII вв.». */
function tlDate(e) {
  if (e.s) return tx(e.s);
  const a = e.c ? u('c. ', 'ок. ', 'шамамен ') : '';
  return a + (e.y < 0 ? u(`${-e.y} BC`, `${-e.y} г. до н. э.`, `б. з. д. ${-e.y} ж.`) : u(`${e.y}`, `${e.y} г.`, `${e.y} ж.`));
}
/** Короткая подпись года на шкале. */
const tlShort = (y) => (y < 0 ? u(`${-y} BC`, `${-y} до н.э.`, `б.з.д. ${-y}`) : String(y));
/** Точка в конце фразы, если её ещё нет («1729 г.» → без второй точки). */
const dotEnd = (s) => (/[.!?…]$/.test(s) ? s : `${s}.`);

/** Сцена «лента времени» по массиву событий data и эпохам eras. */
function timelineScene({ title, intro, data, eras, start }) {
  const ALL = data;
  const m = (ALL.at(-1).y - ALL[0].y) * 0.03;
  const D0 = ALL[0].y - m;
  const D1 = ALL.at(-1).y + m;
  let cur = ALL; // события после фильтра - для подписи ползунка
  const list = (st) => ALL.filter((e) => st.cats[e.k]);
  const kOf = (n, i) => (n > 1 ? Math.round((i / (n - 1)) * 1000) : 0);
  const idxOf = (n, k) => (n > 1 ? (clamp(k, 0, 1000) / 1000) * (n - 1) : 0);
  const eraOf = (y) => eras.find(([a, b]) => y >= a && y < b) ?? eras.at(-1);
  const startI = Math.max(0, ALL.findIndex((e) => e.y === start));

  function newQuiz(st) {
    // В названии не должно быть года - иначе ответ виден сразу.
    const noYear = (e) => !/\d{3}/.test(tx(e.t));
    let pool = list(st).filter(noYear);
    if (pool.length < 8) pool = ALL.filter(noYear);
    const t = st.qn++ % 3;
    const q = { t, ev: [], opts: [], pick: -1, seq: [], done: false, ok: false, hint: false };
    if (t === 0) {
      const exact = pool.filter((e) => !e.c && !e.s);
      const e = pick(exact.length ? exact : pool);
      const gi = ALL.indexOf(e);
      const near = shuffle(ALL.filter((x, i) => Math.abs(i - gi) <= 9 && x.y !== e.y).map((x) => x.y));
      const opts = [e.y];
      for (const y of near) if (opts.length < 4 && !opts.includes(y)) opts.push(y);
      while (opts.length < 4) {
        const y = e.y + (rnd(2) ? 1 : -1) * (1 + rnd(40));
        if (y !== 0 && !opts.includes(y)) opts.push(y);
      }
      q.ev = [gi];
      q.opts = opts.sort((a, b) => a - b);
    } else if (t === 1) {
      for (let g = 0; g < 50; g++) {
        const i = rnd(pool.length);
        const j = clamp(i + (rnd(2) ? 1 : -1) * (1 + rnd(9)), 0, pool.length - 1);
        if (pool[i].y !== pool[j].y) {
          q.ev = shuffle([ALL.indexOf(pool[i]), ALL.indexOf(pool[j])]);
          break;
        }
      }
      if (!q.ev.length) q.ev = [0, ALL.length - 1];
    } else {
      const s0 = rnd(Math.max(1, pool.length - 16));
      const win = pool.slice(s0, s0 + 16);
      const got = [];
      for (const e of shuffle(win)) if (got.length < 4 && !got.some((x) => x.y === e.y)) got.push(e);
      q.ev = got.map((e) => ALL.indexOf(e));
    }
    return q;
  }

  /** Ответ в задании: нажатие на вариант i. */
  function answer(st, i) {
    const q = st.q;
    if (!q || q.done) return;
    const ev = q.ev.map((g) => ALL[g]);
    if (q.t === 0) {
      q.pick = i;
      q.ok = q.opts[i] === ev[0].y;
    } else if (q.t === 1) {
      q.pick = i;
      q.ok = ev[i].y < ev[1 - i].y;
    } else {
      const at = q.seq.indexOf(i);
      if (at >= 0) q.seq.splice(at, 1);
      else q.seq.push(i);
      if (q.seq.length < ev.length) return;
      q.ok = q.seq.every((r, n) => n === 0 || ev[q.seq[n - 1]].y <= ev[r].y);
    }
    q.done = true;
    st.score[1] += 1;
    if (q.ok) st.score[0] += 1;
  }

  /** Полоса эпох по всей ленте (для мини-карты и заданий). */
  function eraStrip(y0, h, mark = [], hintY = null, A = D0, B = D1) {
    const mx = (y) => TL_X0 + ((y - A) / (B - A)) * (TL_X1 - TL_X0);
    let s = '';
    eras.forEach(([a, b, name], i) => {
      const x1 = mx(Math.max(a, A));
      const x2 = mx(Math.min(b, B));
      if (x2 <= x1) return;
      const hl = hintY !== null && hintY >= a && hintY < b;
      s += `<rect class="ex-fill ${ERA_C[i % ERA_C.length]}" x="${n1(x1)}" y="${y0}" width="${n1(x2 - x1)}" height="${h}" style="opacity:${hl ? 0.6 : 0.25}"/>`;
      const label = tx(name);
      if (h >= 12 && (x2 - x1) > label.length * 4.9 + 4) s += `<text class="exh-f9" x="${n1((x1 + x2) / 2)}" y="${y0 + h / 2 + 3.2}">${esc(label)}</text>`;
    });
    for (const [y, lab, cls] of mark) s += `<path class="ex-fill ${cls}" d="M${n1(mx(y))} ${y0 - 1} l-4 -7 h8 Z"/>${lab ? `<text class="exh-f9 tc ${cls}" x="${n1(clamp(mx(y), 16, 304))}" y="${y0 - 10}">${esc(lab)}</text>` : ''}`;
    return { svg: s, mx };
  }

  /** Диапазон лет вокруг набора годов для полосы эпох в задании. */
  function around(ys) {
    const a = Math.min(...ys);
    const b = Math.max(...ys);
    const pad = Math.max(40, (b - a) * 0.35);
    return [Math.max(D0, a - pad), Math.min(D1, b + pad)];
  }

  function drawQuiz(st) {
    const q = st.q;
    const ev = q.ev.map((g) => ALL[g]);
    const head = [u('In what year?', 'В каком году?', 'Қай жылы?'), u('Which came first?', 'Что было раньше?', 'Қайсысы бұрын болды?'), u('Put in order', 'Расставь по порядку', 'Ретімен қой')][q.t];
    let s = `<text class="exh-f13 ex-start" x="8" y="15">${esc(head)}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="15">✓ ${st.score[0]} / ${st.score[1]}</text>`;
    let cap;
    const hintTxt = (e) => `${century(e.y)} · ${tx(eraOf(e.y)[2])}`;
    if (q.t === 0) {
      const e = ev[0];
      const tl = wrap(tx(e.t), 40, 3);
      s += `<rect class="exh-card" x="6" y="24" width="308" height="62" rx="10"/>${lines(tl, 160, 55 - (tl.length - 1) * 7.5, 15, 'exh-f12')}`;
      if (q.hint && !q.done) s += `<text class="exh-f10 tc exc-p" x="160" y="81">${esc(hintTxt(e))}</text>`;
      q.opts.forEach((y, i) => {
        const cls = q.done ? (y === e.y ? 'ok' : i === q.pick ? 'bad' : '') : '';
        s += chip(i % 2 ? 164 : 8, i < 2 ? 94 : 130, 148, 30, tlShort(y), `o${i}`, cls, 15);
      });
      const strip = eraStrip(184, 14, q.done ? [[e.y, tlDate(e), 'exc-p']] : [], q.hint ? e.y : null, ...around(q.opts));
      s += strip.svg;
      cap = !q.done
        ? L(`When did it happen: «${tx(e.t)}»? Tap the year.${q.hint ? ` Hint: ${hintTxt(e)}.` : ''}`, `Когда это было: «${tx(e.t)}»? Нажми на год.${q.hint ? ` Подсказка: ${hintTxt(e)}.` : ''}`, `Бұл қашан болды: «${tx(e.t)}»? Жылды бас.${q.hint ? ` Кеңес: ${hintTxt(e)}.` : ''}`)
        : q.ok
          ? L(`✓ Right: ${dotEnd(tlDate(e))} ${tx(e.d)}`, `✓ Верно: ${dotEnd(tlDate(e))} ${tx(e.d)}`, `✓ Дұрыс: ${dotEnd(tlDate(e))} ${tx(e.d)}`)
          : L(`✗ No - it was ${dotEnd(tlDate(e))} ${tx(e.d)}`, `✗ Нет, это ${dotEnd(tlDate(e))} ${tx(e.d)}`, `✗ Жоқ, бұл - ${dotEnd(tlDate(e))} ${tx(e.d)}`);
    } else if (q.t === 1) {
      ev.forEach((e, i) => {
        const x = i ? 164 : 8;
        const first = e.y < ev[1 - i].y;
        const cls = q.done ? (first ? 'ok' : i === q.pick ? 'bad' : '') : '';
        const tl = wrap(tx(e.t), 21, 5);
        s += `<g class="exh-chip ${cls}" data-drag="o${i}"><rect x="${x}" y="26" width="148" height="110" rx="12"/>${lines(tl, x + 74, 81 - (tl.length - 1) * 7, 14, 'exh-f11')}</g>`;
        if (q.done) s += `<text class="exh-f14 tc ${first ? 'exc-g' : 'exc-m'}" x="${x + 74}" y="156">${esc(tlDate(e))}${first ? ' ✓' : ''}</text>`;
        else if (q.hint) s += `<text class="exh-f10 tc exc-p" x="${x + 74}" y="156">${esc(century(e.y))}</text>`;
      });
      s += eraStrip(184, 14, q.done ? ev.map((e) => [e.y, '', 'exc-p']) : [], null, ...around(ev.map((e) => e.y))).svg;
      const [a, b] = ev[0].y < ev[1].y ? ev : [ev[1], ev[0]];
      cap = !q.done
        ? L(`Tap the event that happened earlier.${q.hint ? ` Hint: ${century(ev[0].y)} and ${century(ev[1].y)}.` : ''}`, `Нажми на событие, которое было раньше.${q.hint ? ` Подсказка: ${century(ev[0].y)} и ${century(ev[1].y)}.` : ''}`, `Бұрын болған оқиғаны бас.${q.hint ? ` Кеңес: ${century(ev[0].y)} және ${century(ev[1].y)}.` : ''}`)
        : L(`${q.ok ? '✓ Right!' : '✗ Not quite.'} «${tx(a.t)}» (${tlDate(a)}) came before «${tx(b.t)}» (${tlDate(b)}).`, `${q.ok ? '✓ Верно!' : '✗ Не так.'} «${tx(a.t)}» (${tlDate(a)}) было раньше, чем «${tx(b.t)}» (${tlDate(b)}).`, `${q.ok ? '✓ Дұрыс!' : '✗ Олай емес.'} «${tx(a.t)}» (${tlDate(a)}) «${tx(b.t)}» (${tlDate(b)}) оқиғасынан бұрын болды.`);
    } else {
      const sorted = [...ev].sort((a, b) => a.y - b.y);
      ev.forEach((e, i) => {
        const y = 24 + i * 37;
        const n = q.seq.indexOf(i);
        const right = q.done && sorted[n] === e;
        const cls = q.done ? (right || sorted[n].y === e.y ? 'ok' : 'bad') : n >= 0 ? 'on' : '';
        const tl = wrap(tx(e.t), 40, 2);
        s += `<g class="exh-chip ${cls}" data-drag="o${i}"><rect x="6" y="${y}" width="308" height="33" rx="9"/><circle class="exh-num" cx="22" cy="${y + 16.5}" r="10"/><text class="exh-f12" x="22" y="${y + 21}">${n >= 0 ? n + 1 : '?'}</text>${lines(tl, 38, y + (tl.length > 1 ? 14 : 21), 13, 'exh-f11 ex-start')}</g>`;
        if (q.done) s += `<text class="exh-f10 ex-end tc ${cls === 'ok' ? 'exc-g' : 'exc-r'}" x="310" y="${y + 29}">${esc(tlShort(e.y))}</text>`;
        else if (q.hint) s += `<text class="exh-f9 ex-end tc exc-p" x="310" y="${y + 29}">${esc(century(e.y))}</text>`;
      });
      s += eraStrip(190, 12, q.done ? sorted.map((e) => [e.y, '', 'exc-p']) : [], null, ...around(ev.map((e) => e.y))).svg;
      const order = sorted.map((e) => `${tlShort(e.y)} ${tx(e.t)}`).join('; ');
      cap = !q.done
        ? L(`Tap the events from the earliest to the latest: ${q.seq.length} of 4 chosen. Tap again to undo.`, `Нажимай события от самого раннего к позднему: выбрано ${q.seq.length} из 4. Повторное нажатие отменяет.`, `Оқиғаларды ең ертесінен кейінгісіне қарай бас: 4-тің ${q.seq.length}-і таңдалды. Қайта басу болдырмайды.`)
        : L(`${q.ok ? '✓ The order is right!' : '✗ The right order:'} ${order}.`, `${q.ok ? '✓ Порядок верный!' : '✗ Правильный порядок:'} ${order}.`, `${q.ok ? '✓ Рет дұрыс!' : '✗ Дұрыс рет:'} ${order}.`);
    }
    return { svg: s, caption: cap };
  }

  return {
    title,
    intro,
    sliders: [
      {
        id: 'k',
        label: L('event', 'событие', 'оқиға'),
        min: 0,
        max: 1000,
        value: kOf(ALL.length, startI),
        show: (k) => {
          const e = cur[Math.round(idxOf(cur.length, k))];
          return e ? tlShort(e.y) : '';
        },
        hidden: (v, st) => Boolean(st.q),
      },
      { id: 'z', label: L('zoom, years', 'масштаб, лет', 'масштаб, жыл'), min: 0, max: 3, step: C, value: 1.5, show: (z) => tx(ZOOM_N[clamp(z, 0, 3)]), hidden: (v, st) => Boolean(st.q) },
    ],
    buttons: ['◀', '▶', L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма'), L('Hint', 'Подсказка', 'Кеңес')],
    state: () => ({ cats: { s: 1, w: 1, c: 1, e: 1 }, q: null, qn: 0, score: [0, 0], view: [D0, D1] }),
    pressed: (i, v, st) => i === 2 && Boolean(st.q),
    btnHidden: (i, v, st) => (st.q ? i < 2 : i > 2),
    onButton(i, st, v) {
      if (i < 2) {
        const n = list(st).length;
        const j = clamp(Math.round(idxOf(n, v.k)) + (i ? 1 : -1), 0, n - 1);
        return { k: kOf(n, j), $dur: 380 };
      }
      if (i === 2) st.q = st.q ? null : newQuiz(st);
      else if (i === 3) st.q = newQuiz(st);
      else if (st.q) st.q.hint = true;
      return undefined;
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'o') {
        if (tapOnce(st, key)) answer(st, Number(key.slice(1)));
        return;
      }
      const L1 = list(st);
      const near = (year) => {
        let best = 0;
        L1.forEach((e, i) => {
          if (Math.abs(e.y - year) < Math.abs(L1[best].y - year)) best = i;
        });
        return best;
      };
      const fx = clamp((p.x - TL_X0) / (TL_X1 - TL_X0), 0, 1);
      if (key === 'axis') v.k = kOf(L1.length, near(lerp(st.view[0], st.view[1], fx)));
      else if (key === 'mini') v.k = kOf(L1.length, near(lerp(D0, D1, fx)));
      else if (key.startsWith('cat') && tapOnce(st, key)) {
        const was = L1[Math.round(idxOf(L1.length, v.k))];
        const c = TL_CATS[Number(key.slice(3))].k;
        st.cats[c] = st.cats[c] ? 0 : 1;
        if (!Object.values(st.cats).some(Boolean)) for (const k of Object.keys(st.cats)) st.cats[k] = 1;
        const L2 = list(st);
        let j = L2.indexOf(was);
        if (j < 0) {
          j = 0;
          L2.forEach((e, i) => {
            if (Math.abs(e.y - was.y) < Math.abs(L2[j].y - was.y)) j = i;
          });
        }
        v.k = kOf(L2.length, j);
      }
    },
    draw(v, step, st) {
      const L1 = list(st);
      cur = L1;
      if (st.q) return drawQuiz(st);
      const n = L1.length;
      const kf = idxOf(n, v.k);
      const i0 = Math.floor(kf);
      const i1 = Math.min(n - 1, i0 + 1);
      const sel = L1[Math.round(kf)];
      const cy = lerp(L1[i0].y, L1[i1].y, kf - i0);
      // Окно масштаба: вся лента → 1000 → 100 → 10 лет, плавно (логарифмически).
      const full = D1 - D0;
      const an = [full, 1000, 100, 10].map((x) => Math.min(x, full));
      const z = clamp(v.z, 0, 3);
      const zi = Math.min(2, Math.floor(z));
      const span = Math.exp(lerp(Math.log(an[zi]), Math.log(an[zi + 1]), z - zi));
      let lo = cy - span / 2;
      let hi = cy + span / 2;
      if (lo < D0) [lo, hi] = [D0, D0 + span];
      if (hi > D1) [lo, hi] = [D1 - span, D1];
      st.view = [lo, hi];
      const sx = (y) => TL_X0 + ((y - lo) / (hi - lo)) * (TL_X1 - TL_X0);
      const AX = 146;
      let s = '';
      // Фильтр по категориям.
      TL_CATS.forEach((c, i) => {
        const on = st.cats[c.k];
        s += `<g class="exh-chip${on ? ' on2' : ' off'}" data-drag="cat${i}"><rect x="${4 + i * 78.5}" y="2" width="75" height="18" rx="9"/><circle class="ex-fill ${c.c}" cx="${15 + i * 78.5}" cy="11" r="4"/><text class="exh-f10 ex-start" x="${23 + i * 78.5}" y="14.5">${esc(tx(c.n))}</text></g>`;
      });
      // Эпохи в окне.
      eras.forEach(([a, b, name], i) => {
        const x1 = Math.max(TL_X0, sx(a));
        const x2 = Math.min(TL_X1, sx(b));
        if (x2 - x1 < 0.5) return;
        const label = tx(name);
        s += `<rect class="ex-fill ${ERA_C[i % ERA_C.length]}" x="${n1(x1)}" y="24" width="${n1(x2 - x1)}" height="15" style="opacity:.28"/>`;
        if (x2 - x1 > label.length * 5 + 6) s += `<text class="exh-f9" x="${n1((x1 + x2) / 2)}" y="34.5">${esc(label)}</text>`;
        if (a > lo && a < hi) s += `<line class="exh-era" x1="${n1(sx(a))}" y1="24" x2="${n1(sx(a))}" y2="${AX + 4}"/>`;
      });
      // Карточка выбранного события.
      const cat = TL_CAT[sel.k];
      const tl = wrap(tx(sel.t), 46, 2);
      const sxs = sx(sel.y);
      const era = eraOf(sel.y);
      s += `<line class="ex-stroke ${cat.c} ex-dash" style="stroke-width:1.5" x1="${n1(sxs)}" y1="104" x2="${n1(sxs)}" y2="${AX - 7}"/>
        <rect class="exh-card" x="5" y="43" width="310" height="62" rx="10"/><rect class="ex-fill ${cat.c}" x="5" y="43" width="5" height="62" rx="2"/>
        <text class="exh-f13 ex-start tc ${cat.c}" x="16" y="58">${esc(tlDate(sel))}</text><text class="exh-f9 ex-end tc exc-m" x="310" y="57">${esc(tx(cat.f))}</text>
        ${lines(tl, 16, 74, 13.5, 'exh-f11 ex-start')}<text class="exh-f9 ex-start tc exc-m" x="16" y="${tl.length > 1 ? 100 : 89}">${esc(`${century(sel.y)} · ${tx(era[2])}`)}</text>`;
      // Точки событий и подписи годов: показываем только те, что помещаются.
      const vis = L1.map((e, i) => ({ e, i, x: sx(e.y) })).filter((o) => o.x > TL_X0 - 6 && o.x < TL_X1 + 6);
      const lanes = [[[sxs - 3, sxs + 3]], [[sxs - 3, sxs + 3]]];
      const labels = [];
      const si = Math.round(kf);
      for (const o of [...vis].sort((a, b) => Math.abs(a.i - si) - Math.abs(b.i - si))) {
        if (o.i === si) continue;
        const txt = (o.e.c || o.e.s ? '~' : '') + tlShort(o.e.y);
        if (labels.some((l) => l.txt === txt && Math.abs(l.x - o.x) < 6)) continue;
        const w = txt.length * 5 + 3;
        const a = o.x - w / 2;
        const b = o.x + w / 2;
        if (a < 2 || b > 318) continue;
        const lane = lanes.findIndex((ln) => ln.every(([p, q]) => b < p || a > q));
        if (lane < 0) continue;
        lanes[lane].push([a, b]);
        labels.push({ txt, x: o.x, svg: `<text class="exh-f9 tc ${TL_CAT[o.e.k].c}" x="${n1(o.x)}" y="${lane ? 124 : 135}">${esc(txt)}</text>` });
      }
      s += `<line class="ex-axis" x1="${TL_X0}" y1="${AX}" x2="${TL_X1}" y2="${AX}"/>${labels.map((l) => l.svg).join('')}`;
      s += vis.map((o) => (o.i === si ? '' : `<circle class="ex-fill ${TL_CAT[o.e.k].c}" cx="${n1(o.x)}" cy="${AX}" r="3.2"/>`)).join('');
      s += `<circle class="ex-fill ${cat.c}" cx="${n1(sxs)}" cy="${AX}" r="10" style="opacity:.22"/><circle class="ex-fill ${cat.c} exh-ring" cx="${n1(sxs)}" cy="${AX}" r="6"/>`;
      // Деления шкалы: шаг подбираем так, чтобы подписи не налезали.
      const pxPerYear = (TL_X1 - TL_X0) / (hi - lo);
      const wLab = Math.max(tlShort(Math.round(lo)).length, tlShort(Math.round(hi)).length) * 5 + 10;
      const stepY = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000].find((d) => d * pxPerYear >= wLab) ?? 5000;
      for (let y = Math.ceil(lo / stepY) * stepY; y <= hi; y += stepY) {
        if (y === 0) continue;
        s += `<line class="ex-axis" x1="${n1(sx(y))}" y1="${AX}" x2="${n1(sx(y))}" y2="${AX + 4}"/><text class="ex-tiny" x="${n1(sx(y))}" y="${AX + 14}">${esc(tlShort(y))}</text>`;
      }
      // Мини-карта всей ленты с рамкой текущего окна.
      const strip = eraStrip(170, 8);
      const mx = strip.mx;
      s += strip.svg + L1.map((e) => `<line class="ex-stroke ${TL_CAT[e.k].c}" style="stroke-width:1;opacity:.75" x1="${n1(mx(e.y))}" y1="180" x2="${n1(mx(e.y))}" y2="188"/>`).join('');
      s += `<rect class="exh-win" x="${n1(mx(lo))}" y="166" width="${n1(Math.max(3, mx(hi) - mx(lo)))}" height="26" rx="3"/>`;
      s += `<text class="exh-f9 ex-start tc exc-m" x="8" y="210">${esc(`${si + 1} / ${n} · ${u('tap the line or the map below', 'нажимай на ленту или карту', 'таспаны не картаны бас')}`)}</text><text class="exh-f9 ex-end tc exc-m" x="312" y="210">${esc(`${tlShort(Math.round(D0 + m))} … ${tlShort(Math.round(D1 - m))}`)}</text>`;
      s += `<rect class="ex-hit" data-drag="axis" x="0" y="112" width="${W}" height="48"/><rect class="ex-hit" data-drag="mini" x="0" y="162" width="${W}" height="34"/>`;
      return {
        svg: s,
        caption: L(`${tlDate(sel)} - ${tx(sel.t)}. ${tx(sel.d)}`, `${tlDate(sel)} - ${tx(sel.t)}. ${tx(sel.d)}`, `${tlDate(sel)} - ${tx(sel.t)}. ${tx(sel.d)}`),
      };
    },
  };
}

export const SCENES_HUMAN = {

  timezones: {
    title: L('Earth rotation and time zones', 'Вращение Земли и часовые пояса', 'Жердің айналуы және сағат белдеулері'),
    intro: L('Earth turns 15° an hour, so local time changes by about an hour for every 15° of longitude. Pick two cities, run a day and cross the date line - then solve the quiz.', 'Земля поворачивается на 15° в час, поэтому местное время меняется примерно на час на каждые 15° долготы. Выбери два города, прокрути сутки, перейди линию перемены дат - и реши задание.', 'Жер сағатына 15°-қа бұрылады, сондықтан бойлықтың әр 15°-ында жергілікті уақыт шамамен бір сағатқа өзгереді. Екі қаланы таңда, тәулікті айналдыр, күн ауысу сызығынан өт - тапсырманы шеш.'),
    sliders: [
      { id: 'tt', label: L('time UTC', 'время UTC', 'UTC уақыты'), min: 0, max: 24, step: C, value: 9, show: hhmm, hidden: (v, st) => Boolean(st.q) },
      { id: 'a', label: L('city 1', 'город 1', '1-қала'), min: 0, max: 13, value: 8, show: (x) => tx(TZ_CITIES[clamp(x, 0, 13)].n), hidden: (v, st) => Boolean(st.q) },
      { id: 'b', label: L('city 2', 'город 2', '2-қала'), min: 0, max: 13, value: 11, show: (x) => tx(TZ_CITIES[clamp(x, 0, 13)].n), hidden: (v, st) => Boolean(st.q) },
    ],
    buttons: [L('▶ One day', '▶ Одни сутки', '▶ Бір тәулік'), L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ q: null, score: [0, 0] }),
    pressed: (i, v, st) => i === 1 && Boolean(st.q),
    btnHidden: (i, v, st) => (i === 0 ? Boolean(st.q) : i === 2 ? !st.q : false),
    onButton(i, st, v, api) {
      if (i === 0) api.play('tt', { dur: 9000, linear: true });
      else if (i === 1) st.q = st.q ? null : tzQuiz();
      else st.q = tzQuiz();
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'o' && st.q && !st.q.done && tapOnce(st, key)) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.pick === q.ans;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      if (st.q) return tzQuizDraw(st);
      const A = TZ_CITIES[clamp(Math.round(v.a), 0, 13)];
      const B = TZ_CITIES[clamp(Math.round(v.b), 0, 13)];
      const cx = 72;
      const cy = 90;
      const r = 62;
      // Угол точки долготы lon: солнечное время t + lon/15, полдень - справа (к Солнцу).
      const ang = (lon) => ((v.tt + lon / 15 - 12) * 15 * Math.PI) / 180;
      const pt = (lon, rr) => [cx + rr * Math.cos(ang(lon)), cy - rr * Math.sin(ang(lon))];
      let s = `<circle class="ex-earth" cx="${cx}" cy="${cy}" r="${r}"/>`;
      for (let lon = -165; lon <= 180; lon += 15) {
        const [x, y] = pt(lon, r);
        const cls = lon === 0 ? 'ex-stroke exc-b' : lon === 180 ? 'ex-stroke exc-r ex-dash' : 'ex-grid';
        s += `<line class="${cls}" style="${lon % 180 === 0 ? 'stroke-width:1.6' : ''}" x1="${cx}" y1="${cy}" x2="${n1(x)}" y2="${n1(y)}"/>`;
      }
      s += `<path class="ex-night" d="M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z"/><circle class="ex-fill exc-m" cx="${cx}" cy="${cy}" r="3"/>`;
      const [gx, gy] = pt(0, r + 9);
      const [dx, dy] = pt(180, r + 9);
      s += `<text class="exh-f9 tc exc-b" x="${n1(gx)}" y="${n1(gy + 3)}">0°</text><text class="exh-f9 tc exc-r" x="${n1(dx)}" y="${n1(dy + 3)}">180°</text>`;
      s += TZ_CITIES.map((c) => {
        const [x, y] = pt(c.lon, r - 8);
        const sel = c === A || c === B;
        return `<circle class="ex-fill ${c === A ? 'exc-o' : c === B ? 'exc-g' : 'exc-m'}" cx="${n1(x)}" cy="${n1(y)}" r="${sel ? 5.5 : 2.5}" style="opacity:${sel ? 1 : 0.7}"/>`;
      }).join('');
      s += `<g class="exc-y">${arrow(cx + r + 26, cy, cx + r + 6, cy, '', 3)}</g><text class="exh-f9 tc exc-y" x="${cx + r + 18}" y="${cy - 8}">${esc(u('Sun', 'Солнце', 'Күн'))}</text>`;
      // Карточки городов.
      const card = (c, y, cls) => {
        const lt = v.tt + c.o;
        const day = Math.floor(lt / 24);
        const solar = (((v.tt + c.lon / 15) % 24) + 24) % 24;
        const isDay = solar >= 6 && solar < 18;
        return `<rect class="exh-card" x="166" y="${y}" width="148" height="56" rx="10"/><circle class="ex-fill ${cls}" cx="178" cy="${y + 14}" r="5"/>
          <text class="exh-f11 ex-start" x="188" y="${y + 18}">${esc(tx(c.n))}</text><text class="exh-f9 ex-end tc exc-m" x="308" y="${y + 18}">UTC${tzOff(c.o)}</text>
          <text class="exh-f22 ex-start" x="174" y="${y + 46}">${hhmm(lt)}</text><text class="exh-f10 ex-end tc ${isDay ? 'exc-o' : 'exc-b'}" x="308" y="${y + 36}">${esc(isDay ? u('day', 'день', 'күндіз') : u('night', 'ночь', 'түн'))}</text><text class="exh-f10 ex-end tc exc-m" x="308" y="${y + 49}">${esc(tx(TZ_DAYS[(day + 7) % 7]))}</text>`;
      };
      const diff = B.o - A.o;
      s += card(A, 4, 'exc-o') + card(B, 66, 'exc-g');
      s += `<text class="exh-f12 tc exc-p" x="240" y="140">${esc(`${u('difference', 'разница', 'айырма')}: ${diff >= 0 ? '+' : '−'}${tzHours(Math.abs(diff))}`)}</text><text class="exh-f9 tc exc-m" x="240" y="154">${esc(u('UTC day = Monday', 'по UTC сейчас понедельник', 'UTC бойынша дүйсенбі'))}</text>`;
      // Полоса долгот: день и ночь, линия перемены дат.
      const lx = (lon) => 10 + ((lon + 180) / 360) * 300;
      for (let lon = -180; lon < 180; lon += 7.5) {
        const solar = (((v.tt + (lon + 3.75) / 15) % 24) + 24) % 24;
        s += `<rect class="ex-fill ${solar >= 6 && solar < 18 ? 'exc-y' : 'exc-b'}" x="${n1(lx(lon))}" y="172" width="${n1(300 / 48 + 0.3)}" height="16" style="opacity:${solar >= 6 && solar < 18 ? 0.35 : 0.3}"/>`;
      }
      s += `<line class="ex-stroke exc-b" style="stroke-width:1.5" x1="${lx(0)}" y1="168" x2="${lx(0)}" y2="192"/><line class="ex-stroke exc-r ex-dash" style="stroke-width:1.5" x1="${lx(180)}" y1="168" x2="${lx(180)}" y2="192"/><line class="ex-stroke exc-r ex-dash" style="stroke-width:1.5" x1="${lx(-180)}" y1="168" x2="${lx(-180)}" y2="192"/>`;
      s += TZ_CITIES.map((c) => `<circle class="ex-fill ${c === A ? 'exc-o' : c === B ? 'exc-g' : 'exc-m'}" cx="${n1(lx(c.lon))}" cy="180" r="${c === A || c === B ? 4.5 : 2}"/>`).join('');
      s += `<text class="exh-f9 tc exc-b" x="${lx(0)}" y="202">${esc(u('Greenwich 0°', 'Гринвич 0°', 'Гринвич 0°'))}</text><text class="exh-f9 ex-end tc exc-r" x="312" y="202">${esc(u('date line 180°', 'линия перемены дат', 'күн ауысу сызығы'))}</text><text class="exh-f9 ex-start tc exc-m" x="8" y="215">${esc(u('180° W', '180° з. д.', '180° б. б.'))}</text><text class="exh-f9 ex-end tc exc-m" x="312" y="215">${esc(u('180° E', '180° в. д.', '180° ш. б.'))}</text>`;
      const tA = hhmm(v.tt + A.o);
      const tB = hhmm(v.tt + B.o);
      return {
        svg: s,
        caption: L(
          `${hhmm(v.tt)} UTC: ${tx(A.n, 'en')} ${tA}, ${tx(B.n, 'en')} ${tB} (${diff >= 0 ? '+' : '−'}${Math.abs(diff)} h). East is ahead, west is behind; crossing the date line eastwards you go back one day. Times are standard (winter) time.`,
          `${hhmm(v.tt)} UTC: ${tx(A.n, 'ru')} ${tA}, ${tx(B.n, 'ru')} ${tB} (${diff >= 0 ? '+' : '−'}${String(Math.abs(diff)).replace('.', ',')} ч). На востоке время больше, на западе меньше; при переходе линии перемены дат на восток дата уменьшается на сутки. Время стандартное (зимнее).`,
          `${hhmm(v.tt)} UTC: ${tx(A.n, 'kk')} ${tA}, ${tx(B.n, 'kk')} ${tB} (${diff >= 0 ? '+' : '−'}${String(Math.abs(diff)).replace('.', ',')} сағ). Шығыста уақыт көп, батыста аз; күн ауысу сызығынан шығысқа өткенде күн бір тәулікке кемиді. Уақыт стандартты (қысқы).`,
        ),
      };
    },
  },
  binary: {
    title: L('Binary numbers: bits, bytes, hex', 'Двоичные числа: биты, байты, hex', 'Екілік сандар: бит, байт, hex'),
    intro: L('A computer keeps numbers in bits - lamps that are on (1) or off (0). Each bit is worth a power of two. Toggle bits, convert by dividing by 2, add in binary and test yourself.', 'Компьютер хранит числа в битах - лампочках, которые горят (1) или нет (0). Каждый бит стоит степень двойки. Переключай биты, переводи делением на 2, складывай в двоичной системе и проверь себя.', 'Компьютер сандарды биттерде сақтайды - жанып (1) не сөніп (0) тұрған шамдар. Әр бит екінің дәрежесіне тең. Биттерді ауыстыр, 2-ге бөліп аудар, екілік жүйеде қос және өзіңді тексер.'),
    sliders: [
      { id: 'n', label: 'n', min: 0, max: 255, value: 74, hidden: (v, st) => st.mode > 1 },
      { id: 'a', label: 'a', min: 0, max: 255, value: 45, hidden: (v, st) => st.mode !== 2 },
      { id: 'b', label: 'b', min: 0, max: 255, value: 27, hidden: (v, st) => st.mode !== 2 },
    ],
    buttons: [L('Bits', 'Биты', 'Биттер'), L('Divide by 2', 'Деление на 2', '2-ге бөлу'), L('Addition', 'Сложение', 'Қосу'), L('Quiz', 'Задание', 'Тапсырма'), L('Step', 'Шаг', 'Қадам'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ mode: 0, k: 0, q: null, qn: 0, score: [0, 0] }),
    pressed: (i, v, st) => i < 4 && i === st.mode,
    btnHidden: (i, v, st) => (i === 4 ? st.mode !== 1 && st.mode !== 2 : i === 5 ? st.mode !== 3 : false),
    onSlide(key, v, st) {
      st.k = 0;
    },
    onButton(i, st, v, api) {
      api.stop();
      if (i < 4) {
        st.mode = i;
        st.k = 0;
        if (i === 3 && !st.q) st.q = binQuiz(st);
      } else if (i === 4) {
        const total = st.mode === 1 ? binDivs(Math.round(v.n)).length : 9;
        st.k = st.k >= total ? 0 : st.k + 1;
      } else st.q = binQuiz(st);
    },
    onDrag(key, p, v, st) {
      if (!tapOnce(st, key)) return;
      if (key.startsWith('bit')) {
        const bit = 1 << (7 - Number(key.slice(3)));
        if (st.mode === 0) v.n = Math.round(v.n) ^ bit;
        else if (st.mode === 3 && st.q && st.q.t === 0 && !st.q.done) {
          st.q.val ^= bit;
          if (st.q.val === st.q.x) binDone(st, true);
        }
      } else if (key[0] === 'o' && st.mode === 3 && st.q && !st.q.done) {
        st.q.pick = Number(key.slice(1));
        binDone(st, st.q.opts[st.q.pick] === st.q.x);
      }
    },
    draw(v, step, st) {
      const n = Math.round(v.n);
      const bin8 = (x) => x.toString(2).padStart(8, '0');
      const hex = (x) => x.toString(16).toUpperCase();
      const lamps = (x, y0, hl = -1) =>
        Array.from({ length: 8 }, (_, i) => {
          const b = (x >> (7 - i)) & 1;
          const cx = 30 + i * 37;
          return `<g class="exh-chip" data-drag="bit${i}"><circle class="ex-lamp${b ? ' on' : ''}" cx="${cx}" cy="${y0}" r="15"/><text class="exh-f14" x="${cx}" y="${y0 + 5}">${b}</text></g><text class="exh-f9 tc exc-m" x="${cx}" y="${y0 + 28}">2${'⁷⁶⁵⁴³²¹⁰'[i]}</text><text class="exh-f10 tc ${b ? 'exc-p' : 'exc-m'}" x="${cx}" y="${y0 + 40}">${2 ** (7 - i)}</text>${hl === i ? `<circle class="ex-stroke exc-p" cx="${cx}" cy="${y0}" r="19" style="stroke-width:2"/>` : ''}`;
        }).join('');
      let s = '';
      let cap;
      if (st.mode === 0) {
        const parts = Array.from({ length: 8 }, (_, i) => ((n >> (7 - i)) & 1 ? 2 ** (7 - i) : 0)).filter(Boolean);
        const b = bin8(n);
        s += `<text class="exh-f16" x="160" y="22">${n}₁₀ = ${b}₂ = ${n.toString(8)}₈ = ${hex(n)}₁₆</text>${lamps(n, 56)}
          <path class="ex-stroke exc-a" style="stroke-width:1.5" d="M16 106 v5 H153 v-5 M164 106 v5 H301 v-5"/>
          <text class="exh-f12 exh-mono tc exc-a" x="85" y="126">${b.slice(0, 4)} → ${hex(n >> 4)}</text><text class="exh-f12 exh-mono tc exc-a" x="232" y="126">${b.slice(4)} → ${hex(n & 15)}</text>
          <text class="exh-f13" x="160" y="152">${parts.length ? `${parts.join(' + ')} = ${n}` : '0'}</text>
          <text class="exh-f11 exh-mono tc exc-m" x="160" y="176">${esc(`${u('octal', 'восьм.', 'сегіздік')}: ${b.slice(0, 2)}|${b.slice(2, 5)}|${b.slice(5)} → ${n.toString(8).padStart(3, '0')}`)}</text>
          <text class="exh-f10 tc exc-m" x="160" y="200">${esc(u('8 bits = 1 byte: 2⁸ = 256 values (0…255). Tap a lamp.', '8 бит = 1 байт: 2⁸ = 256 значений (0…255). Нажми на лампу.', '8 бит = 1 байт: 2⁸ = 256 мән (0…255). Шамды бас.'))}</text>`;
        cap = L(
          `${n} = ${parts.join(' + ') || 0}, so ${n}₁₀ = ${b}₂. Hex groups the bits by 4 (${b.slice(0, 4)} = ${hex(n >> 4)}, ${b.slice(4)} = ${hex(n & 15)}) → ${hex(n)}₁₆; octal groups them by 3 → ${n.toString(8)}₈.`,
          `${n} = ${parts.join(' + ') || 0}, значит ${n}₁₀ = ${b}₂. Шестнадцатеричная запись делит биты по 4 (${b.slice(0, 4)} = ${hex(n >> 4)}, ${b.slice(4)} = ${hex(n & 15)}) → ${hex(n)}₁₆; восьмеричная - по 3 → ${n.toString(8)}₈.`,
          `${n} = ${parts.join(' + ') || 0}, демек ${n}₁₀ = ${b}₂. Он алтылық жазу биттерді 4-тен бөледі (${b.slice(0, 4)} = ${hex(n >> 4)}, ${b.slice(4)} = ${hex(n & 15)}) → ${hex(n)}₁₆; сегіздік - 3-тен → ${n.toString(8)}₈.`,
        );
      } else if (st.mode === 1) {
        const rows = binDivs(n);
        const k = Math.min(st.k, rows.length);
        s += `<text class="exh-f14 ex-start" x="8" y="20">${n}₁₀ → ?₂</text>`;
        rows.slice(0, k).forEach(([x, q, r], i) => {
          const y = 40 + i * 20;
          s += `<text class="exh-f12 exh-mono ex-start" x="20" y="${y}">${esc(`${String(x).padStart(3)} : 2 = ${String(q).padStart(3)}`)}</text><text class="exh-f12 ex-start tc exc-m" x="160" y="${y}">${esc(u('rem.', 'ост.', 'қалд.'))}</text><circle class="ex-fill ${r ? 'exc-p' : 'exc-m'}" cx="222" cy="${y - 4}" r="8" style="opacity:.25"/><text class="exh-f13 tc ${r ? 'exc-p' : 'exc-m'}" x="222" y="${y + 1}">${r}</text>`;
        });
        const done = k >= rows.length;
        if (done && rows.length) {
          s += `${arrow(250, 40 + (rows.length - 1) * 20, 250, 30, 'exc-g', 2)}<text class="exh-f10 ex-start tc exc-g" x="258" y="${40 + (rows.length - 1) * 10}">${esc(u('read up', 'читаем', 'төменнен'))}</text><text class="exh-f10 ex-start tc exc-g" x="258" y="${52 + (rows.length - 1) * 10}">${esc(u('', 'снизу вверх', 'жоғары'))}</text>`;
          s += `<text class="exh-f16 tc exc-g" x="160" y="210">${n}₁₀ = ${n.toString(2)}₂</text>`;
        }
        const last = rows[k - 1];
        cap = rows.length === 0
          ? L('0 in binary is just 0.', '0 в двоичной системе - просто 0.', '0 екілік жүйеде де 0.')
          : done
            ? L(`Write the remainders from the last to the first: ${n} = ${n.toString(2)}₂. Check: ${n.toString(2).split('').map((d, i, a) => (d === '1' ? 2 ** (a.length - 1 - i) : 0)).filter(Boolean).join(' + ')} = ${n}.`, `Записываем остатки от последнего к первому: ${n} = ${n.toString(2)}₂. Проверка: ${n.toString(2).split('').map((d, i, a) => (d === '1' ? 2 ** (a.length - 1 - i) : 0)).filter(Boolean).join(' + ')} = ${n}.`, `Қалдықтарды соңғысынан біріншісіне қарай жазамыз: ${n} = ${n.toString(2)}₂. Тексеру: ${n.toString(2).split('').map((d, i, a) => (d === '1' ? 2 ** (a.length - 1 - i) : 0)).filter(Boolean).join(' + ')} = ${n}.`)
            : last
              ? L(`${last[0]} : 2 = ${last[1]}, remainder ${last[2]}. Keep dividing the quotient until it becomes 0.`, `${last[0]} : 2 = ${last[1]}, остаток ${last[2]}. Делим частное дальше, пока не получится 0.`, `${last[0]} : 2 = ${last[1]}, қалдық ${last[2]}. Бөліндіні 0 болғанша бөле береміз.`)
              : L(`Press "Step": divide ${n} by 2 and write down the remainder (0 or 1).`, `Нажимай «Шаг»: делим ${n} на 2 и записываем остаток (0 или 1).`, `«Қадам» бас: ${n}-ді 2-ге бөліп, қалдығын (0 не 1) жазамыз.`);
      } else if (st.mode === 2) {
        const a = Math.round(v.a);
        const b = Math.round(v.b);
        const sum = a + b;
        const k = Math.min(st.k, 9);
        const X = (c) => 56 + c * 28; // c = 0 - старший (2⁸)
        const bit = (x, p) => (x >> p) & 1;
        let carry = 0;
        const carries = [0];
        for (let p = 0; p < 9; p++) {
          carry = (bit(a, p) + bit(b, p) + carry) >> 1;
          carries.push(carry);
        }
        for (let c = 0; c < 9; c++) {
          const p = 8 - c;
          const doneCol = 8 - c < k;
          const cur = p === k - 1;
          if (cur) s += `<rect class="exh-hl" x="${X(c) - 12}" y="28" width="24" height="120" rx="6"/>`;
          if (p < 8) s += `<text class="exh-f14 exh-mono" x="${X(c)}" y="76">${bit(a, p)}</text><text class="exh-f14 exh-mono" x="${X(c)}" y="102">${bit(b, p)}</text>`;
          if (carries[p] && p <= k - 1) s += `<text class="exh-f11 tc exc-o" x="${X(c)}" y="48">1</text>`;
          if (doneCol) s += `<text class="exh-f16 exh-mono tc ${p === 8 ? 'exc-o' : 'exc-p'}" x="${X(c)}" y="136">${bit(sum, p)}</text>`;
          s += `<text class="exh-f9 tc exc-m" x="${X(c)}" y="160">${2 ** p}</text>`;
        }
        s += `<text class="exh-f10 ex-start tc exc-o" x="4" y="48">${esc(u('carry', 'перенос', 'көшіру'))}</text><text class="exh-f16" x="24" y="102">+</text><line class="ex-axis" x1="40" y1="112" x2="300" y2="112"/>
          <text class="exh-f12 ex-end" x="316" y="76">${a}</text><text class="exh-f12 ex-end" x="316" y="102">${b}</text>${k >= 9 ? `<text class="exh-f12 ex-end tc exc-g" x="316" y="136">${sum}</text>` : ''}
          <text class="exh-f11 exh-mono tc exc-m" x="160" y="184">0+0=0  0+1=1  1+1=10  1+1+1=11</text>
          <text class="exh-f10 tc exc-m" x="160" y="204">${esc(u('write the last digit, carry the 1 to the left', 'пишем последнюю цифру, 1 переносим влево', 'соңғы цифрды жазамыз, 1-ді солға көшіреміз'))}</text>`;
        const p = k - 1;
        const col = p >= 0 ? bit(a, p) + bit(b, p) + (carries[p] ?? 0) : 0;
        cap = k === 0
          ? L(`${a} + ${b} in binary. Press "Step": we add column by column from the right, like in decimal.`, `${a} + ${b} в двоичной системе. Нажимай «Шаг»: складываем столбиком справа налево, как в десятичной.`, `${a} + ${b} екілік жүйеде. «Қадам» бас: оңнан солға қарай бағанмен қосамыз, ондықтағыдай.`)
          : k >= 9
            ? L(`Done: ${bin8(a)}₂ + ${bin8(b)}₂ = ${sum.toString(2)}₂ = ${sum}.${sum > 255 ? ' The sum needs 9 bits - in one byte this is an overflow!' : ''}`, `Готово: ${bin8(a)}₂ + ${bin8(b)}₂ = ${sum.toString(2)}₂ = ${sum}.${sum > 255 ? ' Сумме нужно 9 бит - в одном байте это переполнение!' : ''}`, `Дайын: ${bin8(a)}₂ + ${bin8(b)}₂ = ${sum.toString(2)}₂ = ${sum}.${sum > 255 ? ' Қосындыға 9 бит керек - бір байтта бұл толып кету!' : ''}`)
            : L(`Column 2${'⁰¹²³⁴⁵⁶⁷⁸'[p]}: ${bit(a, p)} + ${bit(b, p)}${carries[p] ? ' + carry 1' : ''} = ${col} = ${col.toString(2)}₂ → write ${col & 1}${col > 1 ? ', carry 1' : ''}.`, `Столбец 2${'⁰¹²³⁴⁵⁶⁷⁸'[p]}: ${bit(a, p)} + ${bit(b, p)}${carries[p] ? ' + перенос 1' : ''} = ${col} = ${col.toString(2)}₂ → пишем ${col & 1}${col > 1 ? ', 1 переносим' : ''}.`, `2${'⁰¹²³⁴⁵⁶⁷⁸'[p]} бағаны: ${bit(a, p)} + ${bit(b, p)}${carries[p] ? ' + көшірілген 1' : ''} = ${col} = ${col.toString(2)}₂ → ${col & 1} жазамыз${col > 1 ? ', 1-ді көшіреміз' : ''}.`);
      } else {
        const q = st.q ?? binQuiz(st);
        st.q = q;
        const head = [u('Light up the number', 'Набери число', 'Санды жина'), u('Binary → decimal', 'Двоичное → десятичное', 'Екілік → ондық'), u('Decimal → hex', 'Десятичное → hex', 'Ондық → hex')][q.t];
        s += `<text class="exh-f13 ex-start" x="8" y="16">${esc(head)}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
        if (q.t === 0) {
          s += `<text class="exh-f22" x="160" y="48">${q.x}</text>${lamps(q.val, 84)}<text class="exh-f13 tc ${q.done ? 'exc-g' : 'exc-m'}" x="160" y="160">${esc(`${u('now', 'сейчас', 'қазір')}: ${q.val}${q.done ? ' ✓' : ''}`)}</text>`;
          cap = q.done
            ? L(`✓ ${q.x} = ${bin8(q.x)}₂. Press "New task".`, `✓ ${q.x} = ${bin8(q.x)}₂. Нажми «Новое задание».`, `✓ ${q.x} = ${bin8(q.x)}₂. «Жаңа тапсырма» бас.`)
            : L(`Tap the lamps so that they make ${q.x}. Tip: start with the biggest power of two that fits (${2 ** Math.floor(Math.log2(q.x))}).`, `Нажимай лампы, чтобы получилось ${q.x}. Совет: начни с самой большой степени двойки, которая помещается (${2 ** Math.floor(Math.log2(q.x))}).`, `${q.x} шығатындай шамдарды бас. Кеңес: сыятын ең үлкен екі дәрежесінен баста (${2 ** Math.floor(Math.log2(q.x))}).`);
        } else {
          const shown = q.t === 1 ? `${bin8(q.x)}₂ = ?` : `${q.x}₁₀ = ?₁₆`;
          s += `<text class="exh-f22" x="160" y="62">${shown}</text>`;
          q.opts.forEach((o, i) => {
            const cls = q.done ? (o === q.x ? 'ok' : i === q.pick ? 'bad' : '') : '';
            s += chip(i % 2 ? 164 : 8, i < 2 ? 92 : 130, 148, 32, q.t === 1 ? String(o) : hex(o), `o${i}`, cls, 16);
          });
          if (q.done) s += `<text class="exh-f11 tc exc-m" x="160" y="190">${esc(q.t === 1 ? binParts(q.x) : `${q.x} = ${q.x >> 4}·16 + ${q.x & 15} → ${hex(q.x >> 4)}${hex(q.x & 15)}`)}</text>`;
          cap = !q.done
            ? L('Tap the right answer.', 'Нажми на правильный ответ.', 'Дұрыс жауапты бас.')
            : L(`${q.ok ? '✓ Right' : '✗ No'}: ${q.t === 1 ? `${bin8(q.x)}₂ = ${binParts(q.x)}` : `${q.x} = ${hex(q.x)}₁₆ (${bin8(q.x).slice(0, 4)} ${bin8(q.x).slice(4)})`}.`, `${q.ok ? '✓ Верно' : '✗ Нет'}: ${q.t === 1 ? `${bin8(q.x)}₂ = ${binParts(q.x)}` : `${q.x} = ${hex(q.x)}₁₆ (${bin8(q.x).slice(0, 4)} ${bin8(q.x).slice(4)})`}.`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: ${q.t === 1 ? `${bin8(q.x)}₂ = ${binParts(q.x)}` : `${q.x} = ${hex(q.x)}₁₆ (${bin8(q.x).slice(0, 4)} ${bin8(q.x).slice(4)})`}.`);
        }
      }
      return { svg: s, caption: cap };
    },
  },
  sorting: {
    title: L('Sorting algorithms step by step', 'Алгоритмы сортировки по шагам', 'Сұрыптау алгоритмдері қадаммен'),
    intro: L('Four classic algorithms on the same bars: bubble, selection, insertion and quick sort. Watch every comparison and swap and compare how much work each one does.', 'Четыре классических алгоритма на одних и тех же столбиках: пузырёк, выбор, вставки и быстрая сортировка. Следи за каждым сравнением и обменом и сравни, сколько работы делает каждый.', 'Бір бағаналардағы төрт классикалық алгоритм: көпіршік, таңдау, кірістіру және жылдам сұрыптау. Әр салыстыру мен алмасуды бақылап, әрқайсысының жұмыс көлемін салыстыр.'),
    sliders: [
      { id: 'alg', label: L('algorithm', 'алгоритм', 'алгоритм'), min: 0, max: 3, value: 0, show: (x) => tx(SORT_NAMES[clamp(x, 0, 3)].short) },
      { id: 'n', label: L('bars', 'столбиков', 'бағаналар'), min: 4, max: 12, value: 8 },
    ],
    buttons: [L('Step', 'Шаг', 'Қадам'), L('▶ Auto', '▶ Авто', '▶ Авто'), L('Random', 'Случайный', 'Кездейсоқ'), L('Nearly sorted', 'Почти готов', 'Дерлік дайын'), L('Reversed', 'Обратный', 'Кері')],
    state: () => sortInit(randomArr(8), 0),
    onSlide(key, v, st) {
      if (key === 'n') Object.assign(st, sortInit(randomArr(Math.round(v.n)), Math.round(v.alg)));
      else Object.assign(st, sortInit(st.start, Math.round(v.alg)));
    },
    onButton(i, st, v, api) {
      api.stop();
      const n = Math.round(v.n);
      if (i === 0) {
        if (st.pos >= st.trace.length - 1) st.pos = 0;
        else st.pos += 1;
      } else if (i === 1) {
        if (st.pos >= st.trace.length - 1) st.pos = 0;
        api.run(() => {
          st.pos = Math.min(st.trace.length - 1, st.pos + 1);
          return st.pos < st.trace.length - 1;
        }, 420);
      } else {
        const arr = i === 2 ? randomArr(n) : i === 3 ? nearlySorted(n) : Array.from({ length: n }, (_, k) => n - k);
        Object.assign(st, sortInit(arr, Math.round(v.alg)));
      }
    },
    draw(v, step, st) {
      const fr = st.trace[clamp(st.pos, 0, st.trace.length - 1)];
      const n = fr.arr.length;
      const slot = 296 / n;
      const bw = Math.min(26, slot - 4);
      const bars = fr.arr
        .map((val, p) => ({ val, p }))
        .sort((a, b) => a.val - b.val)
        .map(({ val, p }) => {
          const h = 12 + val * (96 / n);
          const cls = fr.fin.includes(p) ? 'ok' : fr.hl.includes(p) ? (fr.kind === 'swp' ? 'swp' : 'cmp') : p === fr.piv ? 'piv' : fr.pre && p <= fr.pre ? 'pre' : fr.range && (p < fr.range[0] || p > fr.range[1]) ? 'out' : '';
          return `<g class="ex-sortbar" style="transform:translate(${n1(12 + p * slot + (slot - bw) / 2)}px,0)"><rect class="${cls}" x="0" y="${n1(170 - h)}" width="${n1(bw)}" height="${n1(h)}" rx="4"/><text class="exh-f10" x="${n1(bw / 2)}" y="${n1(165 - h)}">${val}</text></g>`;
        })
        .join('');
      const pivX = fr.piv >= 0 ? `<text class="exh-f9 tc exc-y" x="${n1(12 + fr.piv * slot + slot / 2)}" y="186">${esc(u('pivot', 'опорный', 'тірек'))}</text>` : '';
      const ptr = pivX + fr.hl.map((p, k) => `<path class="ex-fill ${fr.kind === 'swp' ? 'exc-k' : 'exc-o'}" d="M${n1(12 + p * slot + slot / 2)} 176 l-5 8 h10 Z"/><text class="exh-f9 tc exc-m" x="${n1(12 + p * slot + slot / 2)}" y="195">${p}</text>`).join('');
      const A = SORT_NAMES[st.alg];
      const done = st.pos >= st.trace.length - 1;
      let cap = fr.msg;
      if (done) {
        const stats = [0, 1, 2, 3].map((a) => {
          const tr = sortTrace(st.start, a);
          return [tx(SORT_NAMES[a].short), tr.at(-1).cmp, tr.at(-1).sw];
        });
        cap = L(
          `Sorted: comparisons ${fr.cmp}, swaps ${fr.sw}. On this array: ${stats.map(([nm, c, s]) => `${nm} ${c}/${s}`).join(', ')} (comparisons/swaps).`,
          `Отсортировано: сравнений ${fr.cmp}, обменов ${fr.sw}. На этом массиве: ${stats.map(([nm, c, s]) => `${nm} ${c}/${s}`).join(', ')} (сравнения/обмены).`,
          `Сұрыпталды: салыстыру ${fr.cmp}, алмасу ${fr.sw}. Осы массивте: ${stats.map(([nm, c, s]) => `${nm} ${c}/${s}`).join(', ')} (салыстыру/алмасу).`,
        );
      }
      return {
        svg: `<text class="exh-f13 ex-start" x="8" y="16">${esc(tx(A.name))}</text><text class="exh-f11 ex-end tc exc-m" x="312" y="16">${A.o}</text>
          <text class="exh-f11 ex-start tc exc-o" x="8" y="34">${esc(`${u('comparisons', 'сравнений', 'салыстыру')}: ${fr.cmp}`)}</text><text class="exh-f11 ex-start tc exc-k" x="130" y="34">${esc(`${u('swaps', 'обменов', 'алмасу')}: ${fr.sw}`)}</text><text class="exh-f11 ex-end tc exc-m" x="312" y="34">${u('step', 'шаг', 'қадам')} ${st.pos}/${st.trace.length - 1}</text>
          <line class="ex-axis" x1="8" y1="171" x2="312" y2="171"/>${bars}${ptr}
          <text class="exh-f9 tc exc-m" x="160" y="214">${esc(tx(A.idea))}</text>`,
        caption: cap,
      };
    },
  },
  seasons: {
    title: L('Seasons, day length and the noon Sun', 'Времена года, длина дня и полуденное Солнце', 'Жыл мезгілдері, күн ұзақтығы және түстегі Күн'),
    intro: L('Earth’s axis is tilted by 23.4°, so during the year the Sun’s declination changes from +23.4° to −23.4°. Pick a latitude and a day: see the day length, the noon height h = 90° − |φ − δ| and the curve for the whole year.', 'Ось Земли наклонена на 23,4°, поэтому за год склонение Солнца меняется от +23,4° до −23,4°. Выбери широту и день: увидишь длину дня, высоту Солнца в полдень h = 90° − |φ − δ| и график на весь год.', 'Жер осі 23,4°-қа көлбеген, сондықтан жыл бойы Күннің ауытқуы +23,4°-тан −23,4°-қа дейін өзгереді. Ендік пен күнді таңда: күн ұзақтығын, түстегі биіктікті h = 90° − |φ − δ| және бүкіл жылдың графигін көресің.'),
    sliders: [
      { id: 'd', label: L('day of year', 'день года', 'жыл күні'), min: 1, max: 365, step: C, value: 172, show: (x) => seasonDate(x), hidden: (v, st) => Boolean(st.q) },
      { id: 'lat', label: L('latitude φ (− south)', 'широта φ (− юг)', 'ендік φ (− оңтүстік)'), min: -90, max: 90, step: C, value: 43.2, show: (x) => `${x < 0 ? '−' : ''}${Math.abs(x)}°`, hidden: (v, st) => Boolean(st.q) },
    ],
    buttons: [L('▶ One year', '▶ Один год', '▶ Бір жыл'), L('Almaty', 'Алматы', 'Алматы'), L('Astana', 'Астана', 'Астана'), L('Arctic Circle', 'Полярный круг', 'Солтүстік полярлық шеңбер'), L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ q: null, score: [0, 0] }),
    pressed: (i, v, st) => i === 4 && Boolean(st.q),
    btnHidden: (i, v, st) => (st.q ? i < 4 : i === 5),
    onButton(i, st, v, api) {
      if (i === 0) return api.play('d', { dur: 10000, linear: true });
      if (i < 4) return { lat: [0, 43.2, 51.2, 66.6][i] };
      if (i === 4) st.q = st.q ? null : seasonQuiz();
      else st.q = seasonQuiz();
      return undefined;
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'o' && st.q && !st.q.done && tapOnce(st, key)) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.pick === q.ans;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      if (st.q) return seasonQuizDraw(st);
      const dec = sunDec(v.d);
      const lat = v.lat;
      const day = dayLen(lat, dec);
      const noon = 90 - Math.abs(lat - dec);
      const sunH = clamp(noon, -90, 90);
      // Земля с наклоном оси (Солнце справа).
      const cx = 64;
      const cy = 78;
      const r = 50;
      const tilt = (dec * Math.PI) / 180;
      const axis = [Math.sin(tilt), -Math.cos(tilt)];
      const perp = [Math.cos(tilt), Math.sin(tilt)];
      const phi = (lat * Math.PI) / 180;
      const lc = [cx + axis[0] * r * Math.sin(phi), cy + axis[1] * r * Math.sin(phi)];
      const half = r * Math.cos(phi);
      let s = `<circle class="ex-fill exc-y" cx="150" cy="${cy}" r="9"/><path class="ex-fill exc-b" style="opacity:.28" d="M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z"/>
        <circle class="ex-stroke exc-b" style="fill:none;stroke-width:2" cx="${cx}" cy="${cy}" r="${r}"/>
        <line class="ex-stroke exc-m ex-dash" style="stroke-width:1.5" x1="${n1(cx - axis[0] * 58)}" y1="${n1(cy - axis[1] * 58)}" x2="${n1(cx + axis[0] * 58)}" y2="${n1(cy + axis[1] * 58)}"/>
        <line class="ex-grid" x1="${n1(cx - perp[0] * r)}" y1="${n1(cy - perp[1] * r)}" x2="${n1(cx + perp[0] * r)}" y2="${n1(cy + perp[1] * r)}"/>
        <line class="ex-stroke exc-o" style="stroke-width:2.5" x1="${n1(lc[0] - perp[0] * half)}" y1="${n1(lc[1] - perp[1] * half)}" x2="${n1(lc[0] + perp[0] * half)}" y2="${n1(lc[1] + perp[1] * half)}"/><circle class="ex-fill exc-o" cx="${n1(lc[0] + perp[0] * half)}" cy="${n1(lc[1] + perp[1] * half)}" r="4"/>
        ${[cy - 14, cy, cy + 14].map((y) => arrow(140, y, 122, y, 'exc-y', 1.6)).join('')}
        <text class="exh-f10 ex-start" x="6" y="14">${esc(`${seasonDate(v.d)} · δ = ${fmt(dec, 1)}°`)}</text>`;
      // Высота Солнца в полдень.
      const hx = 176;
      const hy = 92;
      const sa = (clamp(sunH, 0, 90) * Math.PI) / 180;
      s += `<line class="ex-axis" x1="${hx - 6}" y1="${hy}" x2="314" y2="${hy}"/><text class="exh-f9 ex-end tc exc-m" x="314" y="${hy + 11}">${esc(u('horizon', 'горизонт', 'көкжиек'))}</text>
        <path class="ex-stroke exc-y" style="stroke-width:1.5" d="M${hx + 30} ${hy} A30 30 0 0 0 ${n1(hx + 30 * Math.cos(sa))} ${n1(hy - 30 * Math.sin(sa))}"/>
        <line class="ex-stroke exc-y" style="stroke-width:1.5" x1="${hx}" y1="${hy}" x2="${n1(hx + 78 * Math.cos(sa) * 70 / 78)}" y2="${n1(hy - 70 * Math.sin(sa))}"/>
        <circle class="ex-fill exc-y" cx="${n1(hx + 70 * Math.cos(sa))}" cy="${n1(hy - 70 * Math.sin(sa))}" r="${sunH > 0 ? 8 : 0}"/><circle class="ex-fill exc-p" cx="${hx}" cy="${hy}" r="3"/>
        <text class="exh-f14 ex-start" x="${hx + 34}" y="${hy - 6}">h = ${fmt(sunH, 1)}°</text>
        <text class="exh-f10 ex-end tc exc-m" x="314" y="118">${esc(`h = 90° − |${fmt(lat, 1)}° − (${fmt(dec, 1)}°)|`)}</text>`;
      // График длины дня за год.
      const gx = 30;
      const gy = 140;
      const gw = 280;
      const gh = 60;
      const X = (dd) => gx + ((dd - 1) / 364) * gw;
      const Y = (h) => gy + gh - (h / 24) * gh;
      let path = '';
      for (let dd = 1; dd <= 365; dd += 4) path += `${path ? 'L' : 'M'}${n1(X(dd))} ${n1(Y(dayLen(lat, sunDec(dd))))} `;
      s += `<rect class="exh-box" x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="4"/><line class="ex-grid" x1="${gx}" y1="${Y(12)}" x2="${gx + gw}" y2="${Y(12)}"/>
        <text class="exh-f9 ex-end tc exc-m" x="${gx - 3}" y="${gy + 4}">24</text><text class="exh-f9 ex-end tc exc-m" x="${gx - 3}" y="${Y(12) + 3}">12</text><text class="exh-f9 ex-end tc exc-m" x="${gx - 3}" y="${gy + gh}">0</text>
        <path class="ex-stroke exc-o" style="stroke-width:2" d="${path}"/>
        <line class="ex-stroke exc-p" style="stroke-width:1.5" x1="${n1(X(v.d))}" y1="${gy}" x2="${n1(X(v.d))}" y2="${gy + gh}"/><circle class="ex-fill exc-p" cx="${n1(X(v.d))}" cy="${n1(Y(day))}" r="4"/>`;
      const MON = u('J F M A M J J A S O N D', 'Я Ф М А М И И А С О Н Д', 'Қ А Н С М М Ш Т Қ Қ Қ Ж').split(' ');
      s += MON.map((mn, i) => `<text class="exh-f9 tc exc-m" x="${n1(X(i * 30.4 + 15))}" y="${gy + gh + 11}">${mn}</text>`).join('');
      s += `<text class="exh-f12 ex-start tc exc-o" x="${gx}" y="${gy - 6}">${esc(`${u('day length', 'длина дня', 'күн ұзақтығы')}: ${(day >= 24 ? '24:00' : hhmm(day))}`)}</text>`;
      const polar = day >= 24 ? 1 : day <= 0 ? -1 : 0;
      return {
        svg: s,
        caption: L(
          `${fmt(Math.abs(lat), 1)}° ${lat >= 0 ? 'N' : 'S'}, ${seasonDate(v.d)}: day ${(day >= 24 ? '24:00' : hhmm(day))}, noon Sun h = 90° − |φ − δ| = ${fmt(sunH, 1)}°. ${polar > 0 ? 'Polar day - the Sun does not set.' : polar < 0 ? 'Polar night - the Sun does not rise.' : 'On 21 March and 23 September day equals night everywhere; on 22 June the Sun is overhead at the Tropic of Cancer (23.4° N).'}`,
          `${fmt(Math.abs(lat), 1)}° ${lat >= 0 ? 'с. ш.' : 'ю. ш.'}, ${seasonDate(v.d)}: день ${(day >= 24 ? '24:00' : hhmm(day))}, Солнце в полдень h = 90° − |φ − δ| = ${fmt(sunH, 1)}°. ${polar > 0 ? 'Полярный день - Солнце не заходит.' : polar < 0 ? 'Полярная ночь - Солнце не восходит.' : '21 марта и 23 сентября день равен ночи везде; 22 июня Солнце в зените над северным тропиком (23,4° с. ш.).'}`,
          `${fmt(Math.abs(lat), 1)}° ${lat >= 0 ? 'с. е.' : 'о. е.'}, ${seasonDate(v.d)}: күн ${(day >= 24 ? '24:00' : hhmm(day))}, түстегі Күн h = 90° − |φ − δ| = ${fmt(sunH, 1)}°. ${polar > 0 ? 'Полярлық күн - Күн батпайды.' : polar < 0 ? 'Полярлық түн - Күн шықпайды.' : '21 наурыз бен 23 қыркүйекте күн мен түн барлық жерде тең; 22 маусымда Күн солтүстік тропик үстінде зенитте (23,4° с. е.).'}`,
        ),
      };
    },
  },
  mapscale: {
    title: L('Map scale: measure Kazakhstan', 'Масштаб карты: измерь Казахстан', 'Карта масштабы: Қазақстанды өлше'),
    intro: L('Scale 1 : 10 000 000 means 1 cm on the map is 10 000 000 cm = 100 km on the ground. Drag the pins to measure distances between cities, convert scales and solve problems.', 'Масштаб 1 : 10 000 000 значит: 1 см на карте - это 10 000 000 см = 100 км на местности. Перетаскивай метки, чтобы измерить расстояния между городами, переводи масштабы и решай задачи.', '1 : 10 000 000 масштабы: картадағы 1 см - жердегі 10 000 000 см = 100 км. Қалалар арасын өлшеу үшін белгілерді сүйре, масштабтарды аудар және есеп шығар.'),
    sliders: [
      { id: 'sc', label: L('scale 1 :', 'масштаб 1 :', 'масштаб 1 :'), min: 0, max: 9, value: 8, show: (x) => MAP_SCALES[clamp(x, 0, 9)].toLocaleString('ru-RU'), hidden: (v, st) => st.mode !== 1 },
      { id: 'cm', label: L('on the map, cm', 'на карте, см', 'картада, см'), min: 0.5, max: 20, step: 0.1, value: 4, hidden: (v, st) => st.mode !== 1 },
    ],
    buttons: [L('Map', 'Карта', 'Карта'), L('Calculator', 'Расчёт', 'Есептеу'), L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ mode: 0, pA: mapXY(MAP_CITIES[0]), pB: mapXY(MAP_CITIES[1]), q: null, qn: 0, score: [0, 0] }),
    pressed: (i, v, st) => i < 3 && i === st.mode,
    btnHidden: (i, v, st) => i === 3 && st.mode !== 2,
    onButton(i, st) {
      if (i < 3) {
        st.mode = i;
        if (i === 2 && !st.q) st.q = mapQuiz(st);
      } else st.q = mapQuiz(st);
    },
    onDrag(key, p, v, st) {
      if (key === 'pA' || key === 'pB') {
        let pt = [clamp(p.x, 8, 312), clamp(p.y, 40, 204)];
        // Рядом с городом - метка «прилипает» к нему.
        for (const c of MAP_CITIES) {
          const q = mapXY(c);
          if (Math.hypot(q[0] - pt[0], q[1] - pt[1]) < 9) pt = q;
        }
        st[key] = pt;
      } else if (key[0] === 'o' && st.q && !st.q.done && tapOnce(st, key)) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.pick === q.ans;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      if (st.mode === 2) return mapQuizDraw(st);
      if (st.mode === 1) return mapCalc(v);
      let s = `<path class="exh-kz" d="${mapOutline()}"/>`;
      s += MAP_CITIES.map((c) => {
        const [x, y] = mapXY(c);
        return `<circle class="ex-fill exc-m" cx="${n1(x)}" cy="${n1(y)}" r="2.2"/><text class="exh-f9 tc exc-m${c.end ? ' ex-end' : ''}" x="${n1(x + (c.end ? 6 : 0))}" y="${n1(y + (c.up ? -5 : 11))}">${esc(tx(c.n))}</text>`;
      }).join('');
      const [ax, ay] = st.pA;
      const [bx, by] = st.pB;
      const d = Math.hypot(bx - ax, by - ay);
      const cm = d / MAP_U;
      const km = cm * 100;
      // Линейка вдоль отрезка: деление каждый сантиметр.
      const ux = (bx - ax) / (d || 1);
      const uy = (by - ay) / (d || 1);
      let ticks = '';
      for (let k = 0; k <= Math.floor(cm); k++) {
        const x = ax + ux * k * MAP_U;
        const y = ay + uy * k * MAP_U;
        const l = k % 5 ? 3 : 5;
        ticks += `<line class="ex-stroke exc-p" style="stroke-width:1.2" x1="${n1(x - uy * l)}" y1="${n1(y + ux * l)}" x2="${n1(x + uy * l)}" y2="${n1(y - ux * l)}"/>`;
      }
      s += `<line class="ex-stroke exc-p" style="stroke-width:2" x1="${n1(ax)}" y1="${n1(ay)}" x2="${n1(bx)}" y2="${n1(by)}"/>${ticks}`;
      const pin = (x, y, key, cls) => `<g class="exh-chip" data-drag="${key}" style="touch-action:none"><circle class="ex-fill ${cls}" cx="${n1(x)}" cy="${n1(y)}" r="7" style="opacity:.9"/><circle class="ex-hit" cx="${n1(x)}" cy="${n1(y)}" r="16"/></g>`;
      s += pin(ax, ay, 'pA', 'exc-o') + pin(bx, by, 'pB', 'exc-g');
      // Масштаб в трёх видах.
      s += `<text class="exh-f12 ex-start" x="8" y="15">1 : 10 000 000</text><text class="exh-f11 ex-start tc exc-m" x="8" y="31">${esc(u('1 cm = 100 km', 'в 1 см 100 км', '1 см-де 100 км'))}</text>`;
      s += [0, 1].map((k) => `<rect class="ex-fill ${k ? 'exc-m' : 'exc-p'}" x="${n1(196 + k * 5 * MAP_U)}" y="9" width="${n1(5 * MAP_U)}" height="6" style="opacity:${k ? 0.4 : 0.75}"/>`).join('') + [0, 1, 2].map((k) => `<text class="exh-f9 tc exc-m" x="${n1(196 + k * 5 * MAP_U)}" y="27">${k * 500}</text>`).join('') + `<text class="exh-f9 ex-start tc exc-m" x="${n1(200 + 10 * MAP_U)}" y="15">${esc(u('km', 'км', 'км'))}</text>`;
      const ca = MAP_CITIES.find((c) => mapXY(c)[0] === ax && mapXY(c)[1] === ay);
      const cb = MAP_CITIES.find((c) => mapXY(c)[0] === bx && mapXY(c)[1] === by);
      const real = ca && cb ? Math.round(haversine(ca, cb) / 10) * 10 : null;
      s += `<text class="exh-f12 ex-start tc exc-p" x="8" y="215">${esc(`${fmt(cm, 1)} ${u('cm', 'см', 'см')} × 100 = ${fmt(km, 0)} ${u('km', 'км', 'км')}`)}</text>${real ? `<text class="exh-f10 ex-end tc exc-m" x="312" y="215">${esc(`${u('globe', 'по глобусу', 'глобус бойынша')} ≈ ${real} ${u('km', 'км', 'км')}`)}</text>` : ''}`;
      const names = ca && cb ? `${tx(ca.n)} - ${tx(cb.n)}: ` : '';
      return {
        svg: s,
        caption: L(
          `${names}${fmt(cm, 1)} cm on the map × 100 km = ${fmt(km, 0)} km.${real ? ` A straight line on the globe gives about ${real} km - a map always distorts a little.` : ' Drag the pins onto cities.'}`,
          `${names}${fmt(cm, 1)} см на карте × 100 км = ${fmt(km, 0)} км.${real ? ` По прямой на глобусе - около ${real} км: карта всегда немного искажает.` : ' Перетащи метки на города.'}`,
          `${names}картада ${fmt(cm, 1)} см × 100 км = ${fmt(km, 0)} км.${real ? ` Глобуста түзу бойынша шамамен ${real} км: карта әрқашан сәл бұрмалайды.` : ' Белгілерді қалаларға сүйре.'}`,
        ),
      };
    },
  },
  gates: {
    title: L('Logic gates and circuits', 'Логические элементы и схемы', 'Логикалық элементтер мен сұлбалар'),
    intro: L('A gate turns input bits into an output bit. Try AND, OR, NOT, XOR, NAND, NOR with their truth tables, then a small circuit of two gates - and test yourself.', 'Логический элемент превращает входные биты в выходной. Попробуй И, ИЛИ, НЕ, исключающее ИЛИ, И-НЕ, ИЛИ-НЕ с таблицами истинности, затем небольшую схему из двух элементов - и проверь себя.', 'Логикалық элемент кіріс биттерін шығыс битке айналдырады. ЖӘНЕ, НЕМЕСЕ, ЕМЕС, XOR, ЖӘНЕ-ЕМЕС, НЕМЕСЕ-ЕМЕС элементтерін ақиқат кестелерімен көр, сосын екі элементті шағын сұлбаны - және өзіңді тексер.'),
    sliders: [
      { id: 'g', label: L('gate', 'элемент', 'элемент'), min: 0, max: 5, value: 0, show: (x) => GATES[clamp(x, 0, 5)].id, hidden: (v, st) => st.mode !== 0 },
      { id: 'c', label: L('circuit', 'схема', 'сұлба'), min: 0, max: 2, value: 0, show: (x) => `№${clamp(x, 0, 2) + 1}`, hidden: (v, st) => st.mode !== 1 },
    ],
    buttons: ['A', 'B', 'C', L('One gate', 'Один элемент', 'Бір элемент'), L('Circuit', 'Схема', 'Сұлба'), L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ mode: 0, in: [1, 0, 1], q: null, qn: 0, score: [0, 0] }),
    pressed: (i, v, st) => (i < 3 ? st.mode < 2 && st.in[i] === 1 : i < 6 ? i - 3 === st.mode : false),
    btnHidden: (i, v, st) => (i < 2 ? st.mode === 2 : i === 2 ? st.mode !== 1 : i === 6 ? st.mode !== 2 : false),
    onButton(i, st) {
      if (i < 3) st.in[i] ^= 1;
      else if (i < 6) {
        st.mode = i - 3;
        if (st.mode === 2 && !st.q) st.q = gateQuiz(st);
      } else st.q = gateQuiz(st);
    },
    onDrag(key, p, v, st) {
      if (!tapOnce(st, key)) return;
      if (key.startsWith('in')) st.in[Number(key.slice(2))] ^= 1;
      else if (key[0] === 'o' && st.q && !st.q.done) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.opts[q.pick] === q.ans;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      const [A, B, Cc] = st.in;
      const lamp = (x, y, b, key, label) => `<g class="exh-chip"${key ? ` data-drag="${key}"` : ''}><circle class="ex-lamp${b ? ' on' : ''}" cx="${x}" cy="${y}" r="12"/><text class="exh-f13" x="${x}" y="${y + 4.5}">${b}</text></g>${label ? `<text class="exh-f11 tc exc-m" x="${x}" y="${y - 16}">${label}</text>` : ''}`;
      const wire = (d, b) => `<path class="exh-wire${b ? ' on' : ''}" d="${d}"/>`;
      let s = '';
      let cap;
      if (st.mode === 0) {
        const G = GATES[clamp(Math.round(v.g), 0, 5)];
        const one = G.id === 'NOT';
        const out = G.f(A, B);
        s += lamp(28, 70, A, 'in0', 'A') + (one ? '' : lamp(28, 130, B, 'in1', 'B'));
        s += wire(one ? 'M40 70 H70 V100 H96' : 'M40 70 H70 V88 H96', A) + (one ? '' : wire('M40 130 H70 V112 H96', B));
        s += gateShape(G.id, 96, 76, 62, 48) + wire('M158 100 H196', out) + lamp(210, 100, out, '', u('out', 'выход', 'шығыс'));
        s += `<text class="exh-f11 tc exc-p" x="127" y="142">${esc(tx(G.name))}</text>`;
        // Таблица истинности.
        const rows = one ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
        s += `<text class="exh-f10 tc exc-m" x="252" y="40">A</text>${one ? '' : '<text class="exh-f10 tc exc-m" x="274" y="40">B</text>'}<text class="exh-f10 tc exc-m" x="302" y="40">Y</text>`;
        rows.forEach(([a, b], r) => {
          const y = 60 + r * 22;
          const hit = a === A && (one || b === B);
          s += `${hit ? `<rect class="exh-hl" x="238" y="${y - 15}" width="78" height="21" rx="5"/>` : ''}<text class="exh-f13 exh-mono" x="252" y="${y}">${a}</text>${one ? '' : `<text class="exh-f13 exh-mono" x="274" y="${y}">${b}</text>`}<text class="exh-f13 exh-mono tc ${G.f(a, b ?? 0) ? 'exc-g' : 'exc-m'}" x="302" y="${y}">${G.f(a, b ?? 0)}</text>`;
        });
        s += `<text class="exh-f16" x="160" y="176">${esc(G.formula)}</text><text class="exh-f10 exh-mono tc exc-m" x="160" y="196">${esc(`Python: ${G.py}`)}</text><text class="exh-f10 exh-mono tc exc-m" x="160" y="211">${esc(`C++ / Java / JS: ${G.c}`)}</text>`;
        cap = L(`${G.id}: A = ${A}${one ? '' : `, B = ${B}`} → ${out}. ${G.rule.en} Tap the inputs to switch them.`, `${tx(G.name)}: A = ${A}${one ? '' : `, B = ${B}`} → ${out}. ${G.rule.ru} Нажимай на входы, чтобы менять их.`, `${tx(G.name)}: A = ${A}${one ? '' : `, B = ${B}`} → ${out}. ${G.rule.kk} Кірістерді ауыстыру үшін оларды бас.`);
      } else if (st.mode === 1) {
        const ci = clamp(Math.round(v.c), 0, 2);
        s += circuitSvg(ci, st.in, lamp, wire);
        const K = CIRCUITS[ci];
        const r = K.eval(A, B, Cc);
        // Таблица истинности схемы по столбцам ABC.
        s += `<text class="exh-f9 ex-start tc exc-m" x="4" y="184">ABC</text><text class="exh-f9 ex-start tc exc-m" x="4" y="204">Y</text>`;
        for (let m = 0; m < 8; m++) {
          const [a, b, c] = [(m >> 2) & 1, (m >> 1) & 1, m & 1];
          const x = 52 + m * 34;
          const hit = a === A && b === B && c === Cc;
          const y = K.eval(a, b, c).y;
          s += `${hit ? `<rect class="exh-hl" x="${x - 15}" y="172" width="30" height="40" rx="5"/>` : ''}<text class="exh-f11 exh-mono" x="${x}" y="184">${a}${b}${c}</text><text class="exh-f13 exh-mono tc ${y ? 'exc-g' : 'exc-m'}" x="${x}" y="205">${y}</text>`;
        }
        cap = L(`Y = ${K.f.replace('⊕', 'XOR')}. A = ${A}, B = ${B}, C = ${Cc}: ${r.steps.en} → Y = ${r.y}. The highlighted column of the table is this case; tap A, B, C.`, `Y = ${K.f.replace('⊕', 'XOR')}. A = ${A}, B = ${B}, C = ${Cc}: ${r.steps.ru} → Y = ${r.y}. Подсвечен этот столбец таблицы; нажимай A, B, C.`, `Y = ${K.f.replace('⊕', 'XOR')}. A = ${A}, B = ${B}, C = ${Cc}: ${r.steps.kk} → Y = ${r.y}. Кестенің осы бағаны белгіленген; A, B, C бас.`);
      } else {
        const q = st.q ?? gateQuiz(st);
        st.q = q;
        s += `<text class="exh-f13 ex-start" x="8" y="16">${esc(q.t === 0 ? u('Which gate has this table?', 'Какой элемент дал эту таблицу?', 'Бұл кесте қай элементтікі?') : u('What is the output?', 'Что на выходе?', 'Шығыста не болады?'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
        if (q.t === 0) {
          const G = GATES[q.g];
          [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([a, b], r) => {
            const x = 52 + r * 72;
            s += `<rect class="exh-box" x="${x - 30}" y="30" width="60" height="58" rx="8"/><text class="exh-f11 tc exc-m" x="${x}" y="48">A=${a} B=${b}</text><text class="exh-f22" x="${x}" y="78">${G.f(a, b)}</text>`;
          });
          q.opts.forEach((o, i) => {
            const cls = q.done ? (o === q.ans ? 'ok' : i === q.pick ? 'bad' : '') : '';
            s += chip(i % 2 ? 164 : 8, i < 2 ? 104 : 142, 148, 30, `${GATES[o].id} (${tx(GATES[o].name)})`, `o${i}`, cls, 12);
          });
          cap = !q.done ? L('Look at the outputs for all four input pairs and tap the gate.', 'Посмотри на выходы для всех четырёх пар входов и нажми на элемент.', 'Төрт кіріс жұбының шығыстарына қарап, элементті бас.') : L(`${q.ok ? '✓ Right' : '✗ No'}: it is ${G.id}. ${G.rule.en}`, `${q.ok ? '✓ Верно' : '✗ Нет'}: это ${tx(G.name)}. ${G.rule.ru}`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: бұл ${tx(G.name)}. ${G.rule.kk}`);
        } else {
          s += `<g transform="translate(0,8)">${circuitSvg(q.c, q.in, lamp, wire, !q.done)}</g><text class="exh-f12 exh-mono ex-end tc exc-p" x="314" y="36">${esc(`Y = ${CIRCUITS[q.c].f}`)}</text>`;
          q.opts.forEach((o, i) => {
            const cls = q.done ? (o === q.ans ? 'ok' : i === q.pick ? 'bad' : '') : '';
            s += chip(i ? 164 : 8, 178, 148, 32, `Y = ${o}`, `o${i}`, cls, 15);
          });
          const r = CIRCUITS[q.c].eval(...q.in);
          cap = !q.done ? L(`Y = ${CIRCUITS[q.c].f.replace('⊕', 'XOR')}. Work out the output gate by gate.`, `Y = ${CIRCUITS[q.c].f.replace('⊕', 'XOR')}. Вычисли выход элемент за элементом.`, `Y = ${CIRCUITS[q.c].f.replace('⊕', 'XOR')}. Шығысты элемент бойынша есепте.`) : L(`${q.ok ? '✓ Right' : '✗ No'}: ${r.steps.en} → Y = ${r.y}.`, `${q.ok ? '✓ Верно' : '✗ Нет'}: ${r.steps.ru} → Y = ${r.y}.`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: ${r.steps.kk} → Y = ${r.y}.`);
        }
      }
      return { svg: s, caption: cap };
    },
  },
  download: {
    title: L('Information volume: files, pictures, sound, speed', 'Объём информации: файлы, картинки, звук, скорость', 'Ақпарат көлемі: файлдар, сурет, дыбыс, жылдамдық'),
    intro: L('How big is a picture, a sound or a text, and how long does a file take to download? 1 byte = 8 bits, 1 KB = 1024 bytes, 1 MB = 1024 KB. Speed is in megaBITS per second.', 'Сколько весит картинка, звук или текст и сколько качается файл? 1 байт = 8 бит, 1 КБ = 1024 байта, 1 МБ = 1024 КБ. Скорость - в мегаБИТАХ в секунду.', 'Сурет, дыбыс не мәтін қанша орын алады, файл қанша уақытта жүктеледі? 1 байт = 8 бит, 1 КБ = 1024 байт, 1 МБ = 1024 КБ. Жылдамдық секундына мегаБИТпен.'),
    sliders: [
      { id: 'size', label: L('file, MB', 'файл, МБ', 'файл, МБ'), min: 1, max: 4000, value: 700, hidden: (v, st) => st.mode !== 0 },
      { id: 'sp', label: L('speed, Mbit/s', 'скорость, Мбит/с', 'жылдамдық, Мбит/с'), min: 1, max: 1000, value: 50, hidden: (v, st) => st.mode !== 0 },
      { id: 'w', label: L('width, px', 'ширина, пикс.', 'ені, пиксель'), min: 16, max: 1920, step: 16, value: 640, hidden: (v, st) => st.mode !== 1 },
      { id: 'h', label: L('height, px', 'высота, пикс.', 'биіктігі, пиксель'), min: 16, max: 1080, step: 8, value: 480, hidden: (v, st) => st.mode !== 1 },
      { id: 'bits', label: L('colour depth', 'глубина цвета', 'түс тереңдігі'), min: 0, max: 5, value: 5, show: (x) => `${DL_DEPTH[clamp(x, 0, 5)]} ${u('bit', 'бит', 'бит')}`, hidden: (v, st) => st.mode !== 1 },
      { id: 'rate', label: L('sampling rate, kHz', 'частота, кГц', 'жиілік, кГц'), min: 0, max: 4, value: 3, show: (x) => fmt(DL_RATE[clamp(x, 0, 4)] / 1000, 2), hidden: (v, st) => st.mode !== 2 },
      { id: 'abits', label: L('bit depth', 'разрядность', 'разрядтылық'), min: 0, max: 2, value: 1, show: (x) => `${[8, 16, 24][clamp(x, 0, 2)]} ${u('bit', 'бит', 'бит')}`, hidden: (v, st) => st.mode !== 2 },
      { id: 'sec', label: L('time, s', 'время, с', 'уақыт, с'), min: 1, max: 300, value: 60, hidden: (v, st) => st.mode !== 2 },
      { id: 'pages', label: L('pages', 'страниц', 'бет'), min: 1, max: 100, value: 10, hidden: (v, st) => st.mode !== 3 },
      { id: 'cpp', label: L('characters per page', 'символов на странице', 'беттегі таңба'), min: 100, max: 4000, step: 100, value: 2000, hidden: (v, st) => st.mode !== 3 },
      { id: 'enc', label: L('encoding', 'кодировка', 'кодтау'), min: 0, max: 1, value: 1, show: (x) => (x ? 'Unicode 16' : 'ASCII 8'), hidden: (v, st) => st.mode !== 3 },
    ],
    buttons: [L('Download', 'Скачивание', 'Жүктеу'), L('Picture', 'Картинка', 'Сурет'), L('Sound', 'Звук', 'Дыбыс'), L('Text', 'Текст', 'Мәтін'), L('Quiz', 'Задание', 'Тапсырма'), L('Stereo', 'Стерео', 'Стерео'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ mode: 0, p: 0, run: true, stereo: true, q: null, qn: 0, score: [0, 0] }),
    pressed: (i, v, st) => (i < 5 ? i === st.mode : i === 5 ? st.stereo : false),
    btnHidden: (i, v, st) => (i === 5 ? st.mode !== 2 : i === 6 ? st.mode !== 4 : false),
    onButton(i, st) {
      if (i < 5) {
        st.mode = i;
        if (i === 0) Object.assign(st, { p: 0, run: true });
        if (i === 4 && !st.q) st.q = dlQuiz(st);
      } else if (i === 5) st.stereo = !st.stereo;
      else st.q = dlQuiz(st);
    },
    onSlide(key, v, st) {
      if (st.mode === 0) Object.assign(st, { p: 0, run: true });
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'o' && st.q && !st.q.done && tapOnce(st, key)) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.pick === q.ans;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    live(dt, v, st) {
      if (!st.run || st.mode !== 0) return;
      st.p = Math.min(1, st.p + dt / 3);
      if (st.p >= 1) st.run = false;
    },
    draw(v, step, st) {
      if (st.mode === 4) return dlQuizDraw(st);
      let s = '';
      let bits;
      let formula;
      let cap;
      if (st.mode === 0) {
        const t = (v.size * 8) / v.sp;
        s += `<text class="exh-f15" x="160" y="30">${esc(`t = ${fmt(v.size, 0)} ${u('MB', 'МБ', 'МБ')} · 8 / ${fmt(v.sp, 0)} ${u('Mbit/s', 'Мбит/с', 'Мбит/с')}`)}</text><text class="exh-f22 tc exc-p" x="160" y="62">${esc(dlTime(t))}</text>
          <rect x="20" y="80" width="280" height="20" rx="10" class="ex-fill exc-m" style="opacity:.2"/><rect x="20" y="80" width="${n1(280 * st.p)}" height="20" rx="10" class="ex-fill exc-g"/>
          <text class="exh-f11 ex-start" x="20" y="116">${esc(`${fmt(v.size * st.p, 0)} / ${fmt(v.size, 0)} ${u('MB', 'МБ', 'МБ')}`)}</text><text class="exh-f11 ex-end tc exc-m" x="300" y="116">${esc(`${fmt(v.sp / 8, 2)} ${u('MB/s', 'МБ/с', 'МБ/с')}`)}</text>`;
        bits = v.size * 8 * 1024 * 1024;
        formula = '';
        cap = L(`${fmt(v.size, 0)} MB = ${fmt(v.size * 8, 0)} Mbit. At ${fmt(v.sp, 0)} Mbit/s that takes ${fmt(t, 1)} s (${dlTime(t)}). The usual trap: forgetting to multiply by 8. In such problems we usually take 1 MB = 8 Mbit.`, `${fmt(v.size, 0)} МБ = ${fmt(v.size * 8, 0)} Мбит. При ${fmt(v.sp, 0)} Мбит/с это ${fmt(t, 1)} с (${dlTime(t)}). Частая ловушка - забыть умножить на 8. В таких задачах обычно считают 1 МБ = 8 Мбит.`, `${fmt(v.size, 0)} МБ = ${fmt(v.size * 8, 0)} Мбит. ${fmt(v.sp, 0)} Мбит/с жылдамдықта бұл ${fmt(t, 1)} с (${dlTime(t)}). Жиі тұзақ - 8-ге көбейтуді ұмыту. Мұндай есептерде әдетте 1 МБ = 8 Мбит деп алынады.`);
      } else if (st.mode === 1) {
        const i = DL_DEPTH[clamp(Math.round(v.bits), 0, 5)];
        bits = v.w * v.h * i;
        formula = `I = ${v.w} · ${v.h} · ${i} ${u('bit', 'бит', 'бит')}`;
        const pw = 120;
        const ph = Math.max(12, (pw * v.h) / v.w);
        const k = Math.min(1, 110 / ph);
        s += `<rect class="exh-box" x="14" y="${n1(18 + (110 - ph * k) / 2)}" width="${n1(pw * k)}" height="${n1(ph * k)}" rx="2"/>`;
        for (let gx = 1; gx < 8; gx++) s += `<line class="ex-grid" x1="${n1(14 + (gx * pw * k) / 8)}" y1="${n1(18 + (110 - ph * k) / 2)}" x2="${n1(14 + (gx * pw * k) / 8)}" y2="${n1(18 + (110 + ph * k) / 2)}"/>`;
        s += `<text class="exh-f10 tc exc-m" x="${n1(14 + (pw * k) / 2)}" y="142">${v.w} × ${v.h}</text>`;
        const colors = 2 ** i;
        const sw = Math.min(16, colors);
        for (let c = 0; c < sw; c++) s += `<rect x="${150 + (c % 8) * 20}" y="${24 + Math.floor(c / 8) * 20}" width="17" height="17" rx="3" style="fill:hsl(${Math.round((c * 360) / sw)} ${i === 1 ? 0 : 70}% ${i === 1 ? (c ? 15 : 95) : 55}%)"/>`;
        s += `<text class="exh-f11 ex-start" x="150" y="76">${esc(`${u('colours', 'цветов', 'түс')}: N = 2^i = ${colors.toLocaleString('ru-RU').replace(/ /g, ' ')}`)}</text><text class="exh-f11 ex-start tc exc-m" x="150" y="94">${esc(`${u('pixels', 'пикселей', 'пиксель')}: ${(v.w * v.h).toLocaleString('ru-RU').replace(/ /g, ' ')}`)}</text>`;
        cap = L(`I = width · height · i: ${v.w} · ${v.h} · ${i} = ${dlBits(bits)}. ${i} bits per pixel give 2^${i} = ${colors} colours.`, `I = ширина · высота · i: ${v.w} · ${v.h} · ${i} = ${dlBits(bits)}. ${i} бит на пиксель дают 2^${i} = ${colors} цветов.`, `I = ені · биіктігі · i: ${v.w} · ${v.h} · ${i} = ${dlBits(bits)}. Пиксельге ${i} бит 2^${i} = ${colors} түс береді.`);
      } else if (st.mode === 2) {
        const f = DL_RATE[clamp(Math.round(v.rate), 0, 4)];
        const i = [8, 16, 24][clamp(Math.round(v.abits), 0, 2)];
        const ch = st.stereo ? 2 : 1;
        bits = f * i * ch * v.sec;
        formula = `I = ${f} · ${i} · ${ch} · ${v.sec}`;
        // Волна и отсчёты: чем выше частота, тем чаще точки.
        let path = '';
        for (let x = 0; x <= 280; x += 2) path += `${path ? 'L' : 'M'}${20 + x} ${n1(70 - 38 * Math.sin(x / 22) * Math.cos(x / 61))} `;
        const step = [22, 14, 9, 6, 5][clamp(Math.round(v.rate), 0, 4)];
        let dots = '';
        for (let x = 0; x <= 280; x += step) {
          const y = 70 - 38 * Math.sin(x / 22) * Math.cos(x / 61);
          dots += `<line class="ex-stroke exc-b" style="stroke-width:1;opacity:.5" x1="${20 + x}" y1="70" x2="${20 + x}" y2="${n1(y)}"/><circle class="ex-fill exc-b" cx="${20 + x}" cy="${n1(y)}" r="2"/>`;
        }
        s += `<line class="ex-axis" x1="20" y1="70" x2="300" y2="70"/><path class="ex-stroke exc-o" style="stroke-width:1.5;opacity:.6" d="${path}"/>${dots}<text class="exh-f10 ex-start tc exc-m" x="20" y="124">${esc(`${u('samples per second', 'отсчётов в секунду', 'секундына өлшем')}: ${f} · ${u('levels', 'уровней', 'деңгей')}: 2^${i} · ${st.stereo ? u('stereo (2 channels)', 'стерео (2 канала)', 'стерео (2 арна)') : u('mono (1 channel)', 'моно (1 канал)', 'моно (1 арна)')}`)}</text>`;
        cap = L(`I = f · i · k · t = ${f} Hz · ${i} bit · ${ch} · ${v.sec} s = ${dlBits(bits)}. Stereo doubles the size, so does doubling the sampling rate.`, `I = f · i · k · t = ${f} Гц · ${i} бит · ${ch} · ${v.sec} с = ${dlBits(bits)}. Стерео удваивает объём, как и удвоение частоты.`, `I = f · i · k · t = ${f} Гц · ${i} бит · ${ch} · ${v.sec} с = ${dlBits(bits)}. Стерео көлемді екі есе арттырады, жиілікті екі еселеу де солай.`);
      } else {
        const i = v.enc ? 16 : 8;
        const K = v.pages * v.cpp;
        bits = K * i;
        formula = `I = ${v.pages} · ${v.cpp} · ${i} ${u('bit', 'бит', 'бит')}`;
        for (let k = 0; k < Math.min(10, v.pages); k++) s += `<g transform="translate(${20 + k * 7},${24 + k * 3})"><rect class="exh-card" width="60" height="80" rx="3"/>${k === Math.min(10, v.pages) - 1 ? [0, 1, 2, 3, 4, 5, 6, 7].map((r) => `<line class="ex-grid" x1="8" y1="${12 + r * 8}" x2="${52 - (r % 3) * 6}" y2="${12 + r * 8}"/>`).join('') : ''}</g>`;
        s += `<text class="exh-f11 ex-start" x="150" y="40">${esc(`${u('characters', 'символов', 'таңба')}: K = ${K.toLocaleString('ru-RU').replace(/ /g, ' ')}`)}</text><text class="exh-f11 ex-start tc exc-m" x="150" y="58">${esc(v.enc ? u('Unicode: 16 bits = 2 bytes per character', 'Unicode: 16 бит = 2 байта на символ', 'Unicode: таңбаға 16 бит = 2 байт') : u('ASCII: 8 bits = 1 byte per character', 'ASCII: 8 бит = 1 байт на символ', 'ASCII: таңбаға 8 бит = 1 байт'))}</text>`;
        cap = L(`I = K · i = ${K} · ${i} bit = ${dlBits(bits)}. In Unicode the same text takes twice as much as in an 8-bit encoding.`, `I = K · i = ${K} · ${i} бит = ${dlBits(bits)}. В Unicode тот же текст занимает вдвое больше, чем в 8-битной кодировке.`, `I = K · i = ${K} · ${i} бит = ${dlBits(bits)}. Unicode-та сол мәтін 8 биттік кодтаудан екі есе көп орын алады.`);
      }
      // Лестница единиц.
      const vals = [bits, bits / 8, bits / 8 / 1024, bits / 8 / 1024 ** 2, bits / 8 / 1024 ** 3];
      const names = [u('bit', 'бит', 'бит'), u('byte', 'байт', 'байт'), u('KB', 'КБ', 'КБ'), u('MB', 'МБ', 'МБ'), u('GB', 'ГБ', 'ГБ')];
      const best = vals.findIndex((x, k) => k === 4 || vals[k + 1] < 1);
      if (formula) s += `<text class="exh-f12 exh-mono ex-start" x="8" y="${st.mode === 0 ? 140 : 152}">${esc(formula)}</text>`;
      s += vals.map((x, k) => `<rect class="${k === best ? 'exh-hl' : 'exh-box'}" x="${6 + k * 62}" y="172" width="58" height="40" rx="7"/><text class="exh-f9 tc exc-m" x="${35 + k * 62}" y="185">${esc(names[k])}</text><text class="exh-f${x >= 1e7 ? 9 : 11} tc ${k === best ? 'exc-p' : ''}" x="${35 + k * 62}" y="203">${esc(dlNum(x))}</text>${k ? `<text class="exh-f9 tc exc-m" x="${4 + k * 62}" y="168">${k === 1 ? ':8' : ':1024'}</text>` : ''}`).join('');
      return { svg: s, caption: cap };
    },
  },
  // ===== Программирование: код по шагам на Python, C++, JavaScript и Java =====

  divmod: {
    title: L('Integer division and remainder', 'Целочисленное деление и остаток', 'Бүтін бөлу және қалдық'),
    intro: L('a // b (Python) or a / b with integers (C++, Java) is how many whole groups of b fit into a; a % b is what is left. Use it for digits of a number, hours and minutes - and watch out for negative numbers!', 'a // b (Python) или a / b для целых (C++, Java) - сколько целых групп по b помещается в a; a % b - что осталось. Так получают цифры числа, часы и минуты - и осторожно с отрицательными числами!', 'a // b (Python) немесе бүтін сандар үшін a / b (C++, Java) - a-ға b-дан неше бүтін топ сыяды; a % b - қалғаны. Осылай санның цифрларын, сағат пен минутты табады - теріс сандардан сақ бол!'),
    sliders: [
      { id: 'ex', label: L('example', 'пример', 'мысал'), min: 0, max: 3, value: 0, show: (x) => tx([L('groups', 'группы', 'топтар'), L('digits', 'цифры', 'цифрлар'), L('minutes', 'минуты', 'минуттар'), L('minus', 'минус', 'минус')][clamp(x, 0, 3)]), hidden: (v, st) => Boolean(st.q) },
      { id: 'a', label: 'a', min: -20, max: 40, value: 17, hidden: (v, st) => Boolean(st.q) || ![0, 3].includes(Math.round(v.ex)) },
      { id: 'b', label: 'b', min: 1, max: 9, value: 5, hidden: (v, st) => Boolean(st.q) || ![0, 3].includes(Math.round(v.ex)) },
      { id: 'n', label: 'n', min: 0, max: 9999, value: 2024, hidden: (v, st) => Boolean(st.q) || Math.round(v.ex) !== 1 },
      { id: 'm', label: L('minutes', 'минут', 'минут'), min: 0, max: 600, value: 135, hidden: (v, st) => Boolean(st.q) || Math.round(v.ex) !== 2 },
    ],
    buttons: ['Python', 'C++', 'JavaScript', 'Java', L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ lang: 0, q: null, score: [0, 0] }),
    pressed: (i, v, st) => (i < 4 ? i === st.lang : i === 4 && Boolean(st.q)),
    btnHidden: (i, v, st) => i === 5 && !st.q,
    onButton(i, st) {
      if (i < 4) {
        st.lang = i;
        if (st.q) st.q = dmQuiz(st);
      } else if (i === 4) st.q = st.q ? null : dmQuiz(st);
      else st.q = dmQuiz(st);
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'o' && st.q && !st.q.done && tapOnce(st, key)) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.pick === q.ans;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      if (st.q) return dmQuizDraw(st);
      const ex = clamp(Math.round(v.ex), 0, 3);
      const lg = st.lang;
      let s = '';
      let cap;
      if (ex === 0 || ex === 3) {
        const a = Math.round(ex === 0 ? Math.max(0, v.a) : v.a);
        const b = Math.round(v.b);
        const [q, r] = dmCalc(a, b, lg);
        s += codePanel(dmCode(lg, a, b), []);
        if (ex === 0) {
          const qq = Math.floor(a / b);
          const dots = Array.from({ length: a }, (_, i) => {
            const g = Math.floor(i / b);
            const inG = g < qq;
            const x = 16 + (inG ? g * (b * 8 + 8) + (i % b) * 8 : qq * (b * 8 + 8) + (i - qq * b) * 8);
            return `<circle cx="${n1(Math.min(x, 312))}" cy="${inG ? 92 : 122}" r="3.4" class="ex-fill ${inG ? 'exc-b' : 'exc-o'}"/>`;
          }).join('');
          s += `${dots}<text class="exh-f10 ex-start tc exc-b" x="12" y="108">${esc(`${qq} ${u('groups of', 'групп по', 'топ, әрқайсысы')} ${b}`)}</text><text class="exh-f10 ex-start tc exc-o" x="12" y="140">${esc(`${u('left', 'остаток', 'қалдық')}: ${r}`)}</text>`;
          s += `<text class="exh-f18" x="160" y="180">${a} = ${b} · ${q} + ${r}</text><text class="exh-f10 tc exc-m" x="160" y="200">${esc(u('the remainder is always less than b', 'остаток всегда меньше b', 'қалдық әрқашан b-дан кіші'))}</text>`;
          cap = L(`${a} = ${b} · ${q} + ${r}: ${q} full groups of ${b} (blue) and ${r} left over (orange). Check: ${b} · ${q} + ${r} = ${a}.${lg === 2 ? ' In JavaScript a / b gives a fraction, so we use Math.floor.' : ''}`, `${a} = ${b} · ${q} + ${r}: полных групп по ${b} - ${q} (синие), в остатке ${r} (оранжевые). Проверка: ${b} · ${q} + ${r} = ${a}.${lg === 2 ? ' В JavaScript a / b даёт дробь, поэтому нужен Math.floor.' : ''}`, `${a} = ${b} · ${q} + ${r}: ${b}-тен ${q} толық топ (көк) және ${r} қалдық (қызғылт сары). Тексеру: ${b} · ${q} + ${r} = ${a}.${lg === 2 ? ' JavaScript-те a / b бөлшек береді, сондықтан Math.floor керек.' : ''}`);
        } else {
          const [pq, pr] = dmCalc(a, b, 0);
          const [cq, cr] = dmCalc(a, b, 1);
          const X = (x) => 160 + x * 7;
          s += `<line class="ex-axis" x1="12" y1="110" x2="308" y2="110"/>`;
          for (let x = -20; x <= 20; x += 5) s += `<line class="ex-axis" x1="${X(x)}" y1="106" x2="${X(x)}" y2="114"/><text class="exh-f9 tc exc-m" x="${X(x)}" y="125">${x}</text>`;
          s += `<circle class="ex-fill exc-p" cx="${X(a)}" cy="110" r="5"/><text class="exh-f11 tc exc-p" x="${X(a)}" y="86">a = ${a}</text>`;
          s += `<path class="ex-fill exc-g" d="M${X(pq * b)} 116 l-5 9 h10 Z"/><path class="ex-fill exc-o" d="M${X(cq * b)} 104 l-5 -9 h10 Z"/>`;
          s += `<text class="exh-f12 ex-start tc exc-g" x="8" y="152">${esc(`Python: ${a} // ${b} = ${pq}, ${a} % ${b} = ${pr}`)}</text><text class="exh-f12 ex-start tc exc-o" x="8" y="172">${esc(`C++ / Java / JS: ${a} / ${b} → ${cq}, ${a} % ${b} = ${cr}`)}</text><text class="exh-f10 ex-start tc exc-m" x="8" y="192">${esc(u('Python rounds down (floor), C++/Java/JS toward zero', 'Python округляет вниз (floor), C++/Java/JS - к нулю', 'Python төмен (floor), C++/Java/JS нөлге қарай дөңгелектейді'))}</text>`;
          cap = a < 0
            ? L(`For a negative a the languages differ: Python ${a} // ${b} = ${pq} (rounds down) and the remainder ${pr} ≥ 0; C++, Java and JS give ${cq} (towards zero) and the remainder ${cr} has the sign of a. Both satisfy a = b · q + r.`, `Для отрицательного a языки расходятся: в Python ${a} // ${b} = ${pq} (округление вниз), а остаток ${pr} ≥ 0; в C++, Java и JS получится ${cq} (к нулю), а остаток ${cr} - со знаком a. Оба варианта дают a = b · q + r.`, `Теріс a үшін тілдер әртүрлі: Python-да ${a} // ${b} = ${pq} (төмен дөңгелектеу), қалдық ${pr} ≥ 0; C++, Java, JS-те ${cq} (нөлге қарай), қалдық ${cr} - a-ның таңбасымен. Екеуі де a = b · q + r береді.`)
            : L(`For a ≥ 0 all languages agree: ${a} // ${b} = ${pq}, ${a} % ${b} = ${pr}. Move a below zero to see the difference.`, `Для a ≥ 0 все языки согласны: ${a} // ${b} = ${pq}, ${a} % ${b} = ${pr}. Сдвинь a ниже нуля, чтобы увидеть разницу.`, `a ≥ 0 болғанда барлық тіл келіседі: ${a} // ${b} = ${pq}, ${a} % ${b} = ${pr}. Айырманы көру үшін a-ны нөлден төмен жылжыт.`);
        }
      } else if (ex === 1) {
        const n = Math.round(v.n);
        s += codePanel(dmDigitsCode(lg, n), []);
        const ds = [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
        const nm = [u('thousands', 'тысячи', 'мыңдық'), u('hundreds', 'сотни', 'жүздік'), u('tens', 'десятки', 'ондық'), u('units', 'единицы', 'бірлік')];
        ds.forEach((d, i) => (s += `<rect class="ex-fill ${['exc-k', 'exc-a', 'exc-b', 'exc-g'][i]}" x="${32 + i * 66}" y="112" width="58" height="46" rx="8" style="opacity:.3"/><text class="exh-f22" x="${61 + i * 66}" y="144">${d}</text><text class="exh-f9 tc exc-m" x="${61 + i * 66}" y="172">${esc(nm[i])}</text>`));
        s += `<text class="exh-f11 tc exc-m" x="160" y="200">${esc(u('% 10 takes the last digit, // 10 drops it', '% 10 берёт последнюю цифру, // 10 её отбрасывает', '% 10 соңғы цифрды алады, // 10 оны алып тастайды'))}</text>`;
        cap = L(`n = ${n}: units ${n} % 10 = ${ds[3]}, tens ${n} // 10 % 10 = ${ds[2]}, hundreds ${n} // 100 % 10 = ${ds[1]}, thousands ${n} // 1000 = ${ds[0]}.`, `n = ${n}: единицы ${n} % 10 = ${ds[3]}, десятки ${n} // 10 % 10 = ${ds[2]}, сотни ${n} // 100 % 10 = ${ds[1]}, тысячи ${n} // 1000 = ${ds[0]}.`, `n = ${n}: бірлік ${n} % 10 = ${ds[3]}, ондық ${n} // 10 % 10 = ${ds[2]}, жүздік ${n} // 100 % 10 = ${ds[1]}, мыңдық ${n} // 1000 = ${ds[0]}.`);
      } else {
        const m = Math.round(v.m);
        const h = Math.floor(m / 60);
        const mm = m % 60;
        s += codePanel(dmTimeCode(lg, m), []);
        for (let k = 0; k < 10; k++) {
          const w = k < h ? 280 : k === h ? (mm / 60) * 280 : 0;
          s += `<rect class="exh-box" x="20" y="${92 + k * 9}" width="280" height="7" rx="3"/>${w ? `<rect class="ex-fill ${k < h ? 'exc-b' : 'exc-o'}" x="20" y="${92 + k * 9}" width="${n1(w)}" height="7" rx="3"/>` : ''}`;
        }
        s += `<text class="exh-f18" x="160" y="208">${m} ${esc(u('min', 'мин', 'мин'))} = ${h} ${esc(u('h', 'ч', 'сағ'))} ${mm} ${esc(u('min', 'мин', 'мин'))} (${h}:${String(mm).padStart(2, '0')})</text>`;
        cap = L(`Each row is one hour = 60 minutes. ${m} // 60 = ${h} full hours (blue), ${m} % 60 = ${mm} minutes left (orange).`, `Каждая строка - час = 60 минут. ${m} // 60 = ${h} полных часов (синие), ${m} % 60 = ${mm} минут в остатке (оранжевая).`, `Әр жол - бір сағат = 60 минут. ${m} // 60 = ${h} толық сағат (көк), ${m} % 60 = ${mm} минут қалдық (қызғылт сары).`);
      }
      return { svg: s, caption: cap };
    },
  },

  ifelse: {
    title: L('Conditions: if, else if, else', 'Условия: if, else if, else', 'Шарттар: if, else if, else'),
    intro: L('Conditions are checked top to bottom; the first true one runs and the rest are skipped. Three classic examples - grade, even/odd, leap year - in four languages, with every check shown.', 'Условия проверяются сверху вниз; срабатывает первое верное, остальные пропускаются. Три классических примера - оценка, чётность, високосный год - на четырёх языках, с каждой проверкой.', 'Шарттар жоғарыдан төмен тексеріледі; бірінші ақиқаты орындалады, қалғаны өткізіледі. Үш классикалық мысал - баға, жұп/тақ, кібісе жыл - төрт тілде, әр тексеруімен.'),
    sliders: [
      { id: 'ex', label: L('example', 'пример', 'мысал'), min: 0, max: 2, value: 0, show: (x) => tx([L('grade', 'оценка', 'баға'), L('parity', 'чётность', 'жұптық'), L('leap', 'високос', 'кібісе')][clamp(x, 0, 2)]), hidden: (v, st) => Boolean(st.q) },
      { id: 's', label: L('score', 'баллы', 'балл'), min: 0, max: 100, value: 72, hidden: (v, st) => Boolean(st.q) || Math.round(v.ex) !== 0 },
      { id: 'n', label: 'n', min: 0, max: 99, value: 7, hidden: (v, st) => Boolean(st.q) || Math.round(v.ex) !== 1 },
      { id: 'y', label: L('year', 'год', 'жыл'), min: 1890, max: 2104, value: 2024, hidden: (v, st) => Boolean(st.q) || Math.round(v.ex) !== 2 },
    ],
    buttons: ['Python', 'C++', 'JavaScript', 'Java', L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма')],
    state: () => ({ lang: 0, q: null, score: [0, 0] }),
    pressed: (i, v, st) => (i < 4 ? i === st.lang : i === 4 && Boolean(st.q)),
    btnHidden: (i, v, st) => i === 5 && !st.q,
    onButton(i, st) {
      if (i < 4) st.lang = i;
      else if (i === 4) st.q = st.q ? null : ifQuiz();
      else st.q = ifQuiz();
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'o' && st.q && !st.q.done && tapOnce(st, key)) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.opts[q.pick] === q.out;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      const ex = st.q ? st.q.ex : clamp(Math.round(v.ex), 0, 2);
      const x = st.q ? st.q.x : Math.round([v.s, v.n, v.y][ex]);
      const E = IF_EX[ex];
      const res = E.eval(x);
      const code = E.code(st.lang);
      const done = !st.q || st.q.done;
      let s = codePanel(code, done ? [res.branch * 2, res.branch * 2 + 1].filter((i) => i < code.length) : []);
      // Отметки ✓ / ✗ у проверенных условий.
      if (done)
        res.checks.forEach((ok, i) => {
          const lh = code.length > 5 ? 13 : 14;
          s += `<text class="exh-f12 tc ${ok ? 'exc-g' : 'exc-r'}" x="304" y="${6 + 4 + i * 2 * lh + lh - 3}">${ok ? '✓' : '✗'}</text>`;
        });
      const top = code.length * (code.length > 5 ? 13 : 14) + 32;
      if (st.q) {
        const q = st.q;
        s += `<text class="exh-f12 ex-start" x="8" y="${top + 4}">${esc(`${E.v} = ${x}. ${u('What is the output?', 'Что получится?', 'Не шығады?')}`)}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="${top + 4}">✓ ${st.score[0]} / ${st.score[1]}</text>`;
        q.opts.forEach((o, i) => {
          const cls = q.done ? (o === q.out ? 'ok' : i === q.pick ? 'bad' : '') : '';
          s += chip(8 + i * (304 / q.opts.length), top + 12, 304 / q.opts.length - 6, 28, o, `o${i}`, cls, 12);
        });
      } else {
        res.lines.forEach((ln, i) => (s += `<text class="exh-f11 exh-mono ex-start tc ${ln.ok ? 'exc-g' : 'exc-r'}" x="8" y="${top + i * 15}">${esc(`${ln.t} → ${ln.ok ? 'True' : 'False'}`)}</text>`));
        s += `<text class="exh-f14 ex-start tc exc-p" x="8" y="${Math.min(214, top + res.lines.length * 15 + 8)}">${esc(`→ ${res.out}`)}</text>`;
      }
      const caps = res.why;
      return {
        svg: s,
        caption: st.q && !st.q.done
          ? L(`${E.v} = ${x}: go through the conditions from the top and tap the output.`, `${E.v} = ${x}: пройди условия сверху вниз и нажми, что получится.`, `${E.v} = ${x}: шарттарды жоғарыдан төмен өтіп, нәтижені бас.`)
          : st.q
            ? L(`${st.q.ok ? '✓ Right' : '✗ No'}: ${caps.en}`, `${st.q.ok ? '✓ Верно' : '✗ Нет'}: ${caps.ru}`, `${st.q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: ${caps.kk}`)
            : caps,
      };
    },
  },

  loop: {
    title: L('Loops step by step', 'Циклы по шагам', 'Циклдар қадаммен'),
    intro: L('Four typical loops in Python, C++, JavaScript and Java. Run them line by line: the highlighted line is executing, the table shows the variables after each pass. Guess first how many times the body runs!', 'Четыре типичных цикла на Python, C++, JavaScript и Java. Выполняй построчно: подсвечена текущая строка, таблица показывает переменные после каждого прохода. Сначала угадай, сколько раз выполнится тело!', 'Python, C++, JavaScript және Java тілдеріндегі төрт типтік цикл. Жол-жолымен орында: ағымдағы жол белгіленген, кесте әр өтуден кейінгі айнымалыларды көрсетеді. Алдымен дене неше рет орындалатынын тап!'),
    sliders: [
      { id: 'ex', label: L('example', 'пример', 'мысал'), min: 0, max: 3, value: 0, show: (x) => tx(LOOP_EX[clamp(x, 0, 3)].name) },
      { id: 'n', label: 'n', min: 1, max: 12, value: 5, hidden: (v) => Math.round(v.ex) > 1 },
      { id: 'num', label: 'num', min: 1, max: 99999, value: 2024, hidden: (v) => Math.round(v.ex) !== 2 },
      { id: 'lim', label: 'lim', min: 2, max: 300, value: 50, hidden: (v) => Math.round(v.ex) !== 3 },
    ],
    buttons: [L('Step', 'Шаг', 'Қадам'), L('▶ Run', '▶ Запустить', '▶ Іске қосу'), 'Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ k: 0, lang: 0, guess: -1 }),
    pressed: (i, v, st) => i >= 2 && i - 2 === st.lang,
    onSlide(key, v, st) {
      st.k = 0;
      st.guess = -1;
    },
    onButton(i, st, v, api) {
      const tr = loopTrace(v);
      if (i === 0) {
        api.stop();
        st.k = st.k >= tr.steps.length - 1 ? 0 : st.k + 1;
      } else if (i === 1) {
        if (st.k >= tr.steps.length - 1) st.k = 0;
        api.run(() => ++st.k < tr.steps.length - 1, 520);
      } else st.lang = i - 2;
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'g' && st.guess < 0 && tapOnce(st, key)) st.guess = Number(key.slice(1));
    },
    draw(v, step, st) {
      const tr = loopTrace(v);
      const k = clamp(st.k, 0, tr.steps.length - 1);
      const S = tr.steps[k];
      const ex = LOOP_EX[tr.ex];
      const code = ex.code[st.lang](tr.p);
      const map = ex.map[st.lang];
      let s = codePanel(code, (map[S.line] ?? []).flat());
      const top = code.length * (code.length > 5 ? 13 : 14) + 22;
      // Переменные сейчас.
      s += `<rect class="exh-box" x="6" y="${top}" width="104" height="${150 - top + 18}" rx="8"/><text class="exh-f9 ex-start tc exc-m" x="12" y="${top + 13}">${esc(u('variables', 'переменные', 'айнымалылар'))}</text>`;
      Object.entries(S.vars).forEach(([name, val], r) => (s += `<text class="exh-f13 exh-mono ex-start" x="12" y="${top + 31 + r * 17}">${esc(`${name} = ${val}`)}</text>`));
      // Справа: угадай число проходов (до запуска) или таблица проходов.
      const passes = tr.steps.filter((x) => x.pass).length;
      if (k === 0 && st.guess < 0) {
        const opts = loopGuessOpts(passes);
        s += `<text class="exh-f11 ex-start" x="118" y="${top + 14}">${esc(u('How many times will the body run?', 'Сколько раз выполнится тело?', 'Дене неше рет орындалады?'))}</text>`;
        opts.forEach((o, i) => (s += chip(118 + (i % 2) * 98, top + 22 + Math.floor(i / 2) * 30, 92, 25, String(o), `g${o}`, '', 13)));
      } else {
        const hist = tr.steps.slice(0, k + 1).filter((x) => x.pass);
        const cols = Object.keys(S.vars);
        s += `<rect class="exh-box" x="116" y="${top}" width="198" height="${150 - top + 18}" rx="8"/><text class="exh-f9 ex-start tc exc-m" x="122" y="${top + 13}">${esc(u('pass', 'проход', 'өту'))}</text>${cols.map((c, j) => `<text class="exh-f9 tc exc-m" x="${178 + j * 46}" y="${top + 13}">${esc(c)}</text>`).join('')}`;
        const rows = Math.max(1, Math.floor((150 - top) / 15));
        hist.slice(-rows).forEach((h, r) => {
          const y = top + 29 + r * 15;
          s += `<text class="exh-f11 ex-start" x="126" y="${y}">${h.pass}</text>${cols.map((c, j) => `<text class="exh-f11 exh-mono" x="${178 + j * 46}" y="${y}">${esc(String(h.vars[c]))}</text>`).join('')}`;
        });
        if (st.guess >= 0) s += `<text class="exh-f10 ex-end tc ${st.guess === passes ? 'exc-g' : 'exc-r'}" x="310" y="${top + 13}">${esc(`${u('guess', 'догадка', 'болжам')}: ${st.guess}${k >= tr.steps.length - 1 ? (st.guess === passes ? ' ✓' : ' ✗') : ''}`)}</text>`;
      }
      s += `<rect class="exh-box" x="6" y="174" width="308" height="40" rx="8"/><text class="exh-f9 ex-start tc exc-m" x="12" y="187">${esc(u('output', 'вывод', 'шығыс'))}</text><text class="exh-f12 exh-mono ex-start" x="12" y="205">${esc(S.out.join(' ').slice(-44) || ' ')}</text>`;
      const end = k >= tr.steps.length - 1;
      return {
        svg: s,
        caption: end
          ? L(`Done: the body ran ${passes} time${passes === 1 ? '' : 's'}. ${ex.sum.en(tr)}${st.guess >= 0 ? (st.guess === passes ? ' Your guess was right ✓' : ` Your guess was ${st.guess} ✗`) : ''}`, `Готово: проходов тела - ${passes}. ${ex.sum.ru(tr)}${st.guess >= 0 ? (st.guess === passes ? ' Твоя догадка верна ✓' : ` Ты предположил ${st.guess} ✗`) : ''}`, `Дайын: дене ${passes} рет орындалды. ${ex.sum.kk(tr)}${st.guess >= 0 ? (st.guess === passes ? ' Болжамың дұрыс ✓' : ` Сенің болжамың ${st.guess} ✗`) : ''}`)
          : k === 0
            ? L(`${tx(ex.hint)} Guess the number of passes, then press "Step" or "Run".`, `${tx(ex.hint)} Угадай число проходов и нажимай «Шаг» или «Запустить».`, `${tx(ex.hint)} Өту санын тап, сосын «Қадам» не «Іске қосу» бас.`)
            : S.note,
      };
    },
  },
  array: {
    title: L('Arrays and lists: indexes start at 0', 'Массивы и списки: индексы с нуля', 'Массивтер мен тізімдер: индекстер нөлден'),
    intro: L('Read and change elements by index, add, remove and insert, find the maximum with a loop. See what each language does when the index is out of range.', 'Читай и меняй элементы по индексу, добавляй, удаляй и вставляй, ищи максимум циклом. Посмотри, что делает каждый язык, если индекс выходит за границы.', 'Элементтерді индекс бойынша оқы және өзгерт, қос, өшір, кірістір, циклмен ең үлкенін тап. Индекс шектен шыққанда әр тіл не істейтінін көр.'),
    sliders: [
      { id: 'op', label: L('operation', 'операция', 'амал'), min: 0, max: 5, value: 0, show: (x) => ['a[i]', 'a[i] = x', 'append', 'pop', 'insert', 'max'][clamp(x, 0, 5)] },
      { id: 'i', label: 'i', min: -4, max: 8, value: 2, hidden: (v) => ![0, 1, 4].includes(Math.round(v.op)) },
    ],
    buttons: [L('Run', 'Выполнить', 'Орындау'), RESET, 'Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ arr: arrStart(), id: 5, lang: 0, last: null, mk: -1 }),
    pressed: (i, v, st) => i >= 2 && i - 2 === st.lang,
    onSlide(key, v, st) {
      st.last = null;
      st.mk = -1;
    },
    onButton(i, st, v) {
      if (i === 1) Object.assign(st, { arr: arrStart(), id: 5, last: null, mk: -1 });
      else if (i >= 2) {
        st.lang = i - 2;
        st.last = null;
      } else arrRun(st, Math.round(v.op), Math.round(v.i));
    },
    draw(v, step, st) {
      const op = clamp(Math.round(v.op), 0, 5);
      const i = Math.round(v.i);
      const L0 = st.lang;
      const n = st.arr.length;
      const x = arrNext(st);
      const code = arrCode(op, L0, i, x);
      const chk = arrCheck(op, L0, i, n);
      let s = codePanel(code, op === 5 ? (st.mk < 0 ? [] : [st.mk === 0 ? 1 : 3]) : [1]);
      const y0 = code.length * (code.length > 5 ? 13 : 14) + 34;
      const slot = Math.min(36, 300 / Math.max(n, 1));
      const X = (k) => 10 + k * slot;
      const hl = op === 5 ? (st.mk < 0 ? -9 : Math.max(0, st.mk - 1)) : chk.idx;
      // Ячейки в порядке id: при вставке и удалении они плавно сдвигаются.
      const cells = st.arr.map((c, k) => ({ ...c, k })).sort((a, b) => a.id - b.id);
      s += cells
        .map(({ val, k, id }) => {
          const on = k === hl && (op === 5 || chk.ok);
          const fresh = st.last && st.last.id === id;
          return `<g class="exh-move" style="transform:translate(${n1(X(k))}px,0)"><rect class="ex-fill ${on ? 'exc-p' : fresh ? 'exc-g' : 'exc-b'}" x="0" y="${y0}" width="${n1(slot - 4)}" height="36" rx="6" style="opacity:${on ? 0.9 : fresh ? 0.7 : 0.3}"/><text class="exh-f14${on ? ' exh-w' : ''}" x="${n1((slot - 4) / 2)}" y="${y0 + 23}">${val}</text><text class="exh-f10 tc exc-m" x="${n1((slot - 4) / 2)}" y="${y0 + 50}">${k}</text>${L0 === 0 ? `<text class="exh-f9 tc exc-a" x="${n1((slot - 4) / 2)}" y="${y0 + 62}">${k - n}</text>` : ''}</g>`;
        })
        .join('');
      if ([0, 1, 4].includes(op)) {
        const xi = chk.idx >= 0 && chk.idx <= n ? X(Math.min(chk.idx, n)) + (slot - 4) / 2 : chk.idx < 0 ? 6 : X(n) + 6;
        s += `<path class="ex-fill ${chk.ok ? 'exc-p' : 'exc-r'}" d="M${n1(clamp(xi, 6, 314))} ${y0 - 3} l-6 -9 h12 Z"/>`;
      }
      const lenTxt = ['len(a)', 'a.size()', 'a.length', 'a.size()'][L0];
      s += `<text class="exh-f12 exh-mono ex-start" x="8" y="${y0 + 84}">${esc(`${lenTxt} = ${n}`)}</text>`;
      if (op === 5 && st.mk >= 0) s += `<text class="exh-f12 exh-mono ex-end tc exc-p" x="312" y="${y0 + 84}">${esc(`m = ${st.maxv}`)}</text>`;
      else if (!chk.ok) s += `<text class="exh-f12 ex-end tc exc-r" x="312" y="${y0 + 84}">${esc(chk.err)}</text>`;
      else if (op === 0) s += `<text class="exh-f12 exh-mono ex-end tc exc-p" x="312" y="${y0 + 84}">${esc(`→ ${st.arr[chk.idx].val}`)}</text>`;
      // Шпаргалка: та же операция на всех четырёх языках.
      if (op < 5)
        ['Py', 'C++', 'JS', 'Java'].forEach((nm, j) => {
          s += `<text class="exh-f10 ex-start tc ${j === L0 ? 'exc-p' : 'exc-m'}" x="8" y="${y0 + 104 + j * 13}">${nm}</text><text class="exh-f10 exh-mono ex-start${j === L0 ? ' tc exc-p' : ''}" x="44" y="${y0 + 104 + j * 13}">${esc(arrCode(op, j, i, x)[1])}</text>`;
        });
      return { svg: s, caption: arrCaption(st, op, i, chk, x) };
    },
  },
  recursion: {
    title: L('Recursion and the call stack', 'Рекурсия и стек вызовов', 'Рекурсия және шақырулар стегі'),
    intro: L('A recursive function calls itself with a smaller argument. Every call waits on the stack until the smaller one returns; the base case stops the chain. Four examples in four languages - guess the answer first!', 'Рекурсивная функция вызывает саму себя с меньшим аргументом. Каждый вызов ждёт в стеке, пока вернётся меньший; базовый случай останавливает цепочку. Четыре примера на четырёх языках - сначала угадай ответ!', 'Рекурсивті функция өзін кішірек аргументпен шақырады. Әр шақыру кішісі қайтқанша стекте күтеді; базалық жағдай тізбекті тоқтатады. Төрт тілдегі төрт мысал - алдымен жауапты тап!'),
    sliders: [
      { id: 'ex', label: L('example', 'пример', 'мысал'), min: 0, max: 3, value: 0, show: (x) => REC_EX[clamp(x, 0, 3)].f },
      { id: 'n', label: 'n', min: 1, max: 7, value: 4 },
    ],
    buttons: [L('Step', 'Шаг', 'Қадам'), L('▶ Run', '▶ Запустить', '▶ Іске қосу'), 'Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ k: 0, lang: 0, guess: null }),
    pressed: (i, v, st) => i >= 2 && i - 2 === st.lang,
    onSlide(key, v, st) {
      st.k = 0;
      st.guess = null;
    },
    onButton(i, st, v, api) {
      const tr = recTrace(v);
      if (i === 0) {
        api.stop();
        st.k = st.k >= tr.steps.length - 1 ? 0 : st.k + 1;
      } else if (i === 1) {
        if (st.k >= tr.steps.length - 1) st.k = 0;
        api.run(() => ++st.k < tr.steps.length - 1, tr.steps.length > 40 ? 300 : 560);
      } else st.lang = i - 2;
    },
    onDrag(key, p, v, st) {
      if (key[0] === 'g' && st.guess === null && tapOnce(st, key)) st.guess = Number(key.slice(1));
    },
    draw(v, step, st) {
      const tr = recTrace(v);
      const k = clamp(st.k, 0, tr.steps.length - 1);
      const S = tr.steps[k];
      const E = tr.E;
      const code = E.code[st.lang](tr.arg);
      const map = st.lang ? { head: [0], base: [1], rec: [2], main: [4] } : { head: [0], base: [1, 2], rec: [3], main: [4] };
      let s = codePanel(code, map[S.line]);
      // Стек: кадры снизу вверх.
      const n = S.stack.length;
      const fh = Math.min(20, 112 / Math.max(1, tr.depth));
      s += `<text class="exh-f9 tc exc-m" x="232" y="212">${esc(u('call stack ↑', 'стек вызовов ↑', 'шақырулар стегі ↑'))}</text><line class="ex-axis" x1="150" y1="203" x2="314" y2="203"/>`;
      S.stack.forEach((fr, i) => {
        const y = 201 - (i + 1) * fh;
        const top = i === n - 1;
        const txt = `${E.f}(${fr.x}) = ${fr.ret !== null ? `${fr.ret} ✓` : E.expr(fr.x, fr.r)}`;
        s += `<g class="exh-fade"><rect class="ex-fill ${top ? 'exc-p' : 'exc-b'}" x="152" y="${n1(y)}" width="160" height="${n1(fh - 2)}" rx="5" style="opacity:${top ? 0.9 : 0.3}"/><text class="exh-f${fh < 16 ? 9 : 11} exh-mono${top ? ' exh-w' : ''}" x="232" y="${n1(y + fh / 2 + 3)}">${esc(txt)}</text></g>`;
      });
      // Слева: угадай ответ, счётчики.
      const end = k >= tr.steps.length - 1;
      s += `<text class="exh-f11 ex-start" x="8" y="106">${esc(`${u('calls', 'вызовов', 'шақыру')}: ${S.calls}`)}</text><text class="exh-f11 ex-start" x="8" y="122">${esc(`${u('depth', 'глубина', 'тереңдік')}: ${n}`)}</text>`;
      if (k === 0 && st.guess === null) {
        s += `<text class="exh-f10 ex-start" x="8" y="144">${esc(`${u('Guess', 'Угадай', 'Тап')}: ${E.f}(${tr.arg}) = ?`)}</text>`;
        tr.opts.forEach((o, i) => (s += chip(8 + (i % 2) * 70, 152 + Math.floor(i / 2) * 29, 64, 24, String(o), `g${o}`, '', 12)));
      } else if (st.guess !== null) {
        const ok = st.guess === tr.res;
        s += `<text class="exh-f11 ex-start tc ${end ? (ok ? 'exc-g' : 'exc-r') : 'exc-m'}" x="8" y="144">${esc(`${u('guess', 'догадка', 'болжам')}: ${st.guess}${end ? (ok ? ' ✓' : ' ✗') : ''}`)}</text>`;
      }
      if (end) s += `<text class="exh-f16 ex-start tc exc-g" x="8" y="${st.guess !== null ? 172 : 160}">${esc(`${E.f}(${tr.arg}) = ${tr.res}`)}</text>`;
      return {
        svg: s,
        caption: k === 0 ? L(`${tx(E.hint)} Guess the result, then press "Step".`, `${tx(E.hint)} Угадай результат и нажимай «Шаг».`, `${tx(E.hint)} Нәтижені тап та, «Қадам» бас.`) : S.note,
      };
    },
  },
  'timeline-kz': timelineScene({
    title: L('Timeline: history of Kazakhstan', 'Лента времени: история Казахстана', 'Уақыт таспасы: Қазақстан тарихы'),
    intro: L('About 120 key events from the Botai culture to our days. Zoom in, filter by topic, tap the line - and test yourself in the quiz.', 'Около 120 ключевых событий от Ботая до наших дней. Приближай, фильтруй по темам, нажимай на ленту - и проверь себя в задании.', 'Ботайдан бүгінге дейінгі 120-ға жуық негізгі оқиға. Жақындат, тақырып бойынша сүз, таспаны бас - тапсырмада өзіңді тексер.'),
    data: KZ_TIMELINE,
    eras: KZ_ERAS,
    start: 1465,
  }),

  'timeline-world': timelineScene({
    title: L('Timeline: world history', 'Лента времени: всемирная история', 'Уақыт таспасы: дүниежүзі тарихы'),
    intro: L('About 150 turning points from the first writing to the 21st century. Zoom in, filter by topic, tap the line - and test yourself in the quiz.', 'Около 150 поворотных событий от первой письменности до XXI века. Приближай, фильтруй по темам, нажимай на ленту - и проверь себя в задании.', 'Алғашқы жазудан XXI ғасырға дейінгі 150-ге жуық бетбұрыс оқиға. Жақындат, тақырып бойынша сүз, таспаны бас - тапсырмада өзіңді тексер.'),
    data: WORLD_TIMELINE,
    eras: WORLD_ERAS,
    start: 1492,
  }),

  'timeline-ru': timelineScene({
    title: L('Timeline: history of Russia', 'Лента времени: история России', 'Уақыт таспасы: Ресей тарихы'),
    intro: L('About 50 key dates from Rurik to the 1993 Constitution. Zoom in, filter by topic, tap the line - and test yourself in the quiz.', 'Около 50 ключевых дат от Рюрика до Конституции 1993 года. Приближай, фильтруй по темам, нажимай на ленту - и проверь себя в задании.', 'Рюриктен 1993 жылғы Конституцияға дейінгі 50-ге жуық негізгі дата. Жақындат, тақырып бойынша сүз, таспаны бас - тапсырмада өзіңді тексер.'),
    data: RU_TIMELINE,
    eras: RU_ERAS,
    start: 1380,
  }),

  tenses: {
    title: L('All 12 English tenses on a timeline', 'Все 12 времён английского на шкале времени', 'Ағылшын тілінің 12 шағы уақыт шкаласында'),
    intro: L('A tense = time (past, present, future) + aspect (simple, continuous, perfect, perfect continuous). Pick both and see the picture, the formula and the sentence in +, − and ? forms.', 'Время = когда (прошлое, настоящее, будущее) + вид (простое, длительное, совершённое, совершённое длительное). Выбери оба - и увидишь схему, формулу и предложение в формах +, − и ?.', 'Шақ = қашан (өткен, осы, келер) + түрі (жай, созылыңқы, аяқталған, аяқталған созылыңқы). Екеуін таңда - сызба, формула және +, −, ? түріндегі сөйлемді көресің.'),
    sliders: [
      { id: 't', label: L('time', 'время', 'уақыт'), min: 0, max: 2, value: 1, show: (x) => ['Past', 'Present', 'Future'][clamp(x, 0, 2)], hidden: (v, st) => Boolean(st.q) },
      { id: 'a', label: L('aspect', 'вид', 'түрі'), min: 0, max: 3, value: 2, show: (x) => ['Simple', 'Cont.', 'Perfect', 'Perf. C.'][clamp(x, 0, 3)], hidden: (v, st) => Boolean(st.q) },
    ],
    buttons: ['+', '−', '?', L('Another example', 'Другой пример', 'Басқа мысал'), L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма'), L('Hint', 'Подсказка', 'Кеңес')],
    state: () => ({ pol: 0, ex: 1, q: null, score: [0, 0] }),
    pressed: (i, v, st) => (i < 3 ? !st.q && st.pol === i : i === 4 && Boolean(st.q)),
    btnHidden: (i, v, st) => (st.q ? i < 4 : i > 4),
    onButton(i, st) {
      if (i < 3) st.pol = i;
      else if (i === 3) st.ex = (st.ex + 1) % 12;
      else if (i === 4) st.q = st.q ? null : tenseQuiz(st);
      else if (i === 5) st.q = tenseQuiz(st);
      else if (st.q) st.q.hint = true;
    },
    onDrag(key, p, v, st) {
      if (!tapOnce(st, key)) return;
      if (key[0] === 't') v.t = Number(key.slice(1));
      else if (key[0] === 'a') v.a = Number(key.slice(1));
      else if (key[0] === 'o' && st.q && !st.q.done) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.opts[q.pick] === q.item.a;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      if (st.q) return tenseQuizDraw(st);
      const t = clamp(Math.round(v.t), 0, 2);
      const a = clamp(Math.round(v.a), 0, 3);
      const id = t * 4 + a;
      const name = TENSE_NAMES[id];
      let s = '';
      ['Past', 'Present', 'Future'].forEach((x, i) => (s += chip(5 + i * 104, 2, 102, 18, x, `t${i}`, i === t ? 'on' : '', 11)));
      ['Simple', 'Continuous', 'Perfect', 'Perfect Cont.'].forEach((x, i) => (s += chip(5 + i * 78, 23, 76, 18, x, `a${i}`, i === a ? 'on' : '', 10)));
      const f = tenseFormula(t, a, st.pol);
      s += `<text class="exh-f16 ex-start" x="8" y="60">${name}</text><text class="exh-f12 exh-mono ex-start tc exc-p" x="8" y="77">${esc(f)}</text>`;
      s += tenseSchema(t, a);
      const sent = tenseSentence(t, a, st.ex % 3, Math.floor(st.ex / 3) % 4, st.pol);
      const rows = wrapTokens(sent, 44);
      rows.forEach((row, r) => {
        const y = (rows.length > 1 ? 160 : 167) + r * 16;
        s += `<text class="exh-f13 exh-it ex-start" x="8" y="${y}">${row.map((w) => (w.v ? `<tspan class="tc exc-p" style="font-weight:900">${esc(w.w)}</tspan>` : esc(w.w))).join(' ')}</text>`;
      });
      s += lines(wrap(`${u('Signal words', 'Слова-сигналы', 'Белгі сөздер')}: ${TENSE_SIGNALS[id]}`, 56, 2), 8, 200, 12, 'exh-f10 ex-start tc exc-m');
      const plain = sent.map((w) => w.w).join(' ');
      const pf = [L('affirmative', 'утверждение', 'болымды'), L('negative', 'отрицание', 'болымсыз'), L('question', 'вопрос', 'сұраулы')][st.pol];
      return {
        svg: s,
        caption: L(
          `${name} - ${TENSE_USE[id].en}. ${tx(pf)[0].toUpperCase()}${tx(pf).slice(1)}: ${f} → «${plain}»`,
          `${name} - ${TENSE_USE[id].ru}. ${tx(pf)[0].toUpperCase()}${tx(pf).slice(1)}: ${f} → «${plain}»`,
          `${name} - ${TENSE_USE[id].kk}. ${tx(pf)[0].toUpperCase()}${tx(pf).slice(1)}: ${f} → «${plain}»`,
        ),
      };
    },
  },
  conditionals: {
    title: L('English conditionals: if-sentences', 'Условные предложения в английском', 'Ағылшын тіліндегі шартты сөйлемдер'),
    intro: L('Four types of if-sentences: from facts that are always true to regrets about the past. See the formula, how real the situation is, examples with translation - and fill the gaps in the quiz.', 'Четыре типа if-предложений: от фактов, которые верны всегда, до сожалений о прошлом. Смотри формулу, насколько ситуация реальна, примеры с переводом - и заполняй пропуски в задании.', 'if-сөйлемдердің төрт түрі: әрқашан ақиқат фактілерден өткенге өкінішке дейін. Формуланы, жағдайдың қаншалық шын екенін, аудармасы бар мысалдарды көр - тапсырмада бос орындарды толтыр.'),
    sliders: [{ id: 'k', label: L('type', 'тип', 'түрі'), min: 0, max: 3, value: 1, show: (x) => ['Zero', 'First', 'Second', 'Third'][clamp(x, 0, 3)], hidden: (v, st) => Boolean(st.q) }],
    buttons: [L('Another example', 'Другой пример', 'Басқа мысал'), L('Quiz', 'Задание', 'Тапсырма'), L('New task', 'Новое задание', 'Жаңа тапсырма'), L('Hint', 'Подсказка', 'Кеңес')],
    state: () => ({ ex: 0, q: null, score: [0, 0] }),
    pressed: (i, v, st) => i === 1 && Boolean(st.q),
    btnHidden: (i, v, st) => (st.q ? i === 0 : i > 1),
    onButton(i, st) {
      if (i === 0) st.ex = (st.ex + 1) % 3;
      else if (i === 1) st.q = st.q ? null : condQuiz(st);
      else if (i === 2) st.q = condQuiz(st);
      else if (st.q) st.q.hint = true;
    },
    onDrag(key, p, v, st) {
      if (!tapOnce(st, key)) return;
      if (key[0] === 'k') v.k = Number(key.slice(1));
      else if (key[0] === 'o' && st.q && !st.q.done) {
        const q = st.q;
        q.pick = Number(key.slice(1));
        q.done = true;
        q.ok = q.opts[q.pick] === q.a;
        st.score[1] += 1;
        if (q.ok) st.score[0] += 1;
      }
    },
    draw(v, step, st) {
      if (st.q) return condQuizDraw(st);
      const k = clamp(Math.round(v.k), 0, 3);
      const T = COND[k];
      let s = '';
      ['Zero', 'First', 'Second', 'Third'].forEach((x, i) => (s += chip(5 + i * 78.5, 2, 75, 19, x, `k${i}`, i === k ? 'on' : '', 11)));
      s += `<text class="exh-f16 ex-start" x="8" y="42">${['Zero', 'First', 'Second', 'Third'][k]} Conditional</text><text class="exh-f10 ex-start tc exc-m" x="8" y="57">${esc(tx(T.use))}</text>`;
      s += `<text class="exh-f12 exh-mono ex-start tc exc-o" x="8" y="76">If + ${T.ifF},</text><text class="exh-f12 exh-mono ex-end tc exc-p" x="312" y="76">${T.mainF}</text>`;
      // Когда: прошлое / сейчас / будущее / всегда.
      const when = [u('past', 'прошлое', 'өткен'), u('now', 'сейчас', 'қазір'), u('future', 'будущее', 'келер')];
      when.forEach((w, i) => {
        const on = T.when.includes(i);
        s += `<rect class="ex-fill ${on ? (T.real ? 'exc-g' : 'exc-k') : 'exc-m'}" x="${8 + i * 102}" y="88" width="98" height="18" rx="9" style="opacity:${on ? 0.35 : 0.12}"/><text class="exh-f10${on ? '' : ' tc exc-m'}" x="${57 + i * 102}" y="101">${esc(w)}</text>`;
      });
      // Насколько ситуация реальна.
      s += `<text class="exh-f10 ex-start tc exc-m" x="8" y="124">${esc(u('how real', 'реальность', 'шындық'))}</text><rect class="exh-box" x="80" y="115" width="232" height="12" rx="6"/><rect class="ex-fill ${T.real ? 'exc-g' : 'exc-k'}" x="80" y="115" width="${n1(2.32 * T.pct)}" height="12" rx="6" style="opacity:.75"/><text class="exh-f10 ex-end" x="312" y="141">${esc(tx(T.realTxt))}</text>`;
      // Пример: условие оранжевым, следствие - основным цветом.
      const [en, ru, kk] = T.ex[st.ex];
      const [ifPart, mainPart] = en.split(', ');
      const rows = wrapTokens([...ifPart.split(' ').map((w) => ({ w, v: 1 })), ...`, ${mainPart}`.slice(2).split(' ').map((w) => ({ w, v: 2 }))], 44);
      rows.forEach((row, r) => {
        s += `<text class="exh-f13 exh-it ex-start" x="8" y="${165 + r * 17}">${row.map((w, j) => `<tspan class="tc ${w.v === 1 ? 'exc-o' : 'exc-p'}">${esc(w.w + (w.v === 1 && row[j + 1]?.v === 2 ? ',' : ''))}</tspan>`).join(' ')}</text>`;
      });
      const tr = getLang() === 'en' ? '' : tx(L('', ru, kk));
      if (tr) s += lines(wrap(tr, 52, 2), 8, 203, 13, 'exh-f10 ex-start tc exc-m');
      return {
        svg: s,
        caption: L(`${['Zero', 'First', 'Second', 'Third'][k]} conditional: ${T.use.en}. If + ${T.ifF}, ${T.mainF}. Example: «${en}»`, `${['Zero', 'First', 'Second', 'Third'][k]} conditional: ${T.use.ru}. If + ${T.ifF}, ${T.mainF}. Пример: «${en}» - ${ru}`, `${['Zero', 'First', 'Second', 'Third'][k]} conditional: ${T.use.kk}. If + ${T.ifF}, ${T.mainF}. Мысал: «${en}» - ${kk}`),
      };
    },
  },
};

// Данные для сцен.

// ---------- Времена английского: формы, схемы, задания ----------

const TENSE_NAMES = ['Past Simple', 'Past Continuous', 'Past Perfect', 'Past Perfect Continuous', 'Present Simple', 'Present Continuous', 'Present Perfect', 'Present Perfect Continuous', 'Future Simple', 'Future Continuous', 'Future Perfect', 'Future Perfect Continuous'];
const TENSE_USE = [
  L('a finished action at a known time in the past', 'законченное действие в известное время в прошлом', 'өткенде белгілі уақытта аяқталған әрекет'),
  L('a process at a moment in the past, often interrupted', 'процесс в определённый момент прошлого, часто прерванный', 'өткендегі белгілі бір сәттегі процесс, көбіне үзіледі'),
  L('an action finished before another moment in the past', 'действие, закончившееся до другого момента в прошлом', 'өткендегі басқа сәтке дейін аяқталған әрекет'),
  L('a process that lasted up to a moment in the past', 'процесс, который длился до момента в прошлом', 'өткендегі бір сәтке дейін созылған процесс'),
  L('habits, schedules and facts', 'привычки, расписания и факты', 'әдеттер, кестелер және фактілер'),
  L('an action happening now or around now', 'действие идёт сейчас или в этот период', 'әрекет дәл қазір немесе осы кезеңде болып жатыр'),
  L('a past action with a result now, or life experience', 'действие в прошлом с результатом сейчас или жизненный опыт', 'нәтижесі қазір көрінетін өткен әрекет немесе өмірлік тәжірибе'),
  L('a process that started in the past and is still going on', 'процесс начался в прошлом и продолжается до сих пор', 'өткенде басталып, әлі жалғасып жатқан процесс'),
  L('predictions, promises and quick decisions', 'прогнозы, обещания и решения в момент речи', 'болжамдар, уәделер және сол сәттегі шешімдер'),
  L('a process at a moment in the future', 'процесс в определённый момент будущего', 'келешектегі белгілі бір сәттегі процесс'),
  L('an action that will be finished before a moment in the future', 'действие, которое закончится к моменту в будущем', 'келешектегі бір сәтке дейін аяқталатын әрекет'),
  L('how long a process will have lasted by a moment in the future', 'сколько будет длиться процесс к моменту в будущем', 'келешектегі бір сәтке дейін процестің қанша уақыт созылатыны'),
];
const TENSE_SIGNALS = [
  'yesterday, last week, two days ago, in 2010',
  'at 6 pm yesterday, while, when, all day yesterday',
  'before, after, by the time, already, by then',
  'for two hours, since, before, how long',
  'always, usually, often, every day, never, on Mondays',
  'now, right now, at the moment, Look!, Listen!',
  'already, just, yet, ever, never, since, for, so far',
  'for, since, how long, all day, lately',
  'tomorrow, next week, soon, I think, probably',
  'at this time tomorrow, at 6 pm tomorrow',
  'by Friday, by tomorrow, by the time, by 2030',
  'for two hours by ..., by the end of ...',
];
const T_VERBS = [
  { b: 'work', s: 'works', v2: 'worked', v3: 'worked', ing: 'working', o: 'in the garden' },
  { b: 'write', s: 'writes', v2: 'wrote', v3: 'written', ing: 'writing', o: 'a letter' },
  { b: 'read', s: 'reads', v2: 'read', v3: 'read', ing: 'reading', o: 'a book' },
  { b: 'play', s: 'plays', v2: 'played', v3: 'played', ing: 'playing', o: 'chess' },
];
const T_NEG = { am: 'am not', is: "isn't", are: "aren't", was: "wasn't", were: "weren't", have: "haven't", has: "hasn't", had: "hadn't", will: "won't", do: "don't", does: "doesn't", did: "didn't" };
/** Обстоятельство времени для каждого времени: [для +, для − и ?]. */
const T_TAIL = [
  ['yesterday', 'yesterday'],
  ['at 6 pm yesterday', 'at 6 pm yesterday'],
  ['before Mum came home', 'before Mum came home'],
  ['for two hours before Mum came home', 'for two hours before Mum came home'],
  ['every day', 'every day'],
  ['now', 'now'],
  ['', 'yet'],
  ['for two hours', 'for two hours'],
  ['tomorrow', 'tomorrow'],
  ['at 6 pm tomorrow', 'at 6 pm tomorrow'],
  ['by Friday', 'by Friday'],
  ['for two hours by 6 pm', 'for two hours by 6 pm'],
];

/** Предложение: массив слов { w, v } (v - часть сказуемого, её подсвечиваем). */
function tenseSentence(t, a, si, vi, pol) {
  const S = ['I', 'she', 'they'][si];
  const V = T_VERBS[vi];
  const id = t * 4 + a;
  const be = t === 0 ? (si === 2 ? 'were' : 'was') : si === 0 ? 'am' : si === 1 ? 'is' : 'are';
  const have = t === 0 ? 'had' : si === 1 ? 'has' : 'have';
  let op;
  let rest;
  if (a === 0 && t < 2) {
    op = t === 0 ? 'did' : si === 1 ? 'does' : 'do';
    rest = [V.b];
  } else if (t === 2) {
    op = 'will';
    rest = [[V.b], ['be', V.ing], ['have', V.v3], ['have', 'been', V.ing]][a];
  } else if (a === 1) {
    op = be;
    rest = [V.ing];
  } else {
    op = have;
    rest = a === 2 ? [V.v3] : ['been', V.ing];
  }
  const tail = T_TAIL[id][pol ? 1 : 0];
  const end = [...V.o.split(' '), ...(tail ? tail.split(' ') : [])].map((w) => ({ w }));
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  let words;
  if (pol === 0) {
    const verb = a === 0 && t < 2 ? [t === 0 ? V.v2 : si === 1 ? V.s : V.b] : [op, ...rest];
    words = [{ w: cap(S) }, ...verb.map((w) => ({ w, v: true }))];
    if (id === 6) words.splice(2, 0, { w: 'already' });
  } else if (pol === 1) words = [{ w: cap(S) }, ...[T_NEG[op], ...rest].map((w) => ({ w, v: true }))];
  else words = [{ w: cap(op), v: true }, { w: S }, ...rest.map((w) => ({ w, v: true }))];
  words.push(...end);
  const last = words.at(-1);
  last.w += pol === 2 ? '?' : '.';
  return words;
}

/** Формула времени для +, − или ?. */
function tenseFormula(t, a, pol) {
  if (a === 0 && t < 2) {
    if (t === 1) return ['V / V-s (he, she, it)', "don't / doesn't + V", 'Do / Does + S + V?'][pol];
    return ['V2 (worked, wrote)', "didn't + V", 'Did + S + V?'][pol];
  }
  const ops = t === 2 ? ['will', "won't", 'Will'] : a === 1 ? (t === 0 ? ['was / were', "wasn't / weren't", 'Was / Were'] : ['am / is / are', "am not / isn't / aren't", 'Am / Is / Are']) : t === 0 ? ['had', "hadn't", 'Had'] : ['have / has', "haven't / hasn't", 'Have / Has'];
  const rest = t === 2 ? ['V', 'be V-ing', 'have V3', 'have been V-ing'][a] : a === 1 ? 'V-ing' : a === 2 ? 'V3' : 'been V-ing';
  return pol === 2 ? `${ops[2]} + S + ${rest}?` : `${ops[pol]} + ${rest}`;
}

/** Перенос предложения из слов-токенов. */
function wrapTokens(words, max) {
  const rows = [[]];
  let len = 0;
  for (const w of words) {
    if (len && len + 1 + w.w.length > max) {
      rows.push([]);
      len = 0;
    }
    rows.at(-1).push(w);
    len += (len ? 1 : 0) + w.w.length;
  }
  return rows;
}

/** Схема времени на линии: точка, отрезок, стрелка к моменту отсчёта. */
function tenseSchema(t, a) {
  const Y = 118;
  const NOW = 175;
  const ref = [100, NOW, 255][t];
  let s = `<line class="ex-axis" x1="8" y1="${Y}" x2="312" y2="${Y}"/><path class="ex-fill exc-m" d="M314 ${Y} l-8 -4 v8 Z"/>
    <line class="ex-stroke exc-r" style="stroke-width:2" x1="${NOW}" y1="90" x2="${NOW}" y2="${Y + 8}"/><text class="exh-f10 tc exc-r" x="${NOW}" y="${Y + 19}">${esc(u('now', 'сейчас', 'қазір'))}</text>
    <text class="exh-f10 tc exc-m" x="40" y="${Y + 19}">${esc(u('past', 'прошлое', 'өткен'))}</text><text class="exh-f10 tc exc-m" x="290" y="${Y + 19}">${esc(u('future', 'будущее', 'келер'))}</text>`;
  const sixPm = u('6 pm', '18:00', '18:00');
  const refLab = t === 0 ? (a === 1 ? sixPm : u('Mum came', 'мама пришла', 'анам келді')) : a === 2 ? u('Friday', 'пятница', 'жұма') : sixPm;
  if (t !== 1 && a > 0) s += `<line class="ex-stroke exc-o" style="stroke-width:2" x1="${ref}" y1="93" x2="${ref}" y2="${Y + 6}"/><text class="exh-f10 tc exc-o" x="${ref}" y="89">${esc(refLab)}</text>`;
  const dot = (x, r = 6) => `<circle class="ex-fill exc-p" cx="${x}" cy="${Y}" r="${r}"/>`;
  const bar = (x1, x2) => `<rect class="ex-fill exc-p" x="${x1}" y="${Y - 6}" width="${x2 - x1}" height="12" rx="6" style="opacity:.75"/>`;
  if (a === 0) {
    if (t === 1) s += [30, 62, 94, 126, 158, 190, 222, 254, 286].map((x) => dot(x, 4)).join('') + `<text class="exh-f9 tc exc-p" x="110" y="100">${esc(u('again and again', 'снова и снова', 'қайта-қайта'))}</text>`;
    else s += dot(t === 0 ? 95 : 255, 7);
  } else if (a === 1) s += bar(ref - 38, ref + 38) + `<path class="ex-stroke exc-p" style="stroke-width:1.6" d="M${ref - 34} ${Y - 14} q8 -6 16 0 t16 0 t16 0 t16 0"/>`;
  else if (a === 2) {
    const x0 = ref - 55;
    s += dot(x0, 6) + arrow(x0 + 8, Y - 12, ref - 4, Y - 12, 'exc-g', 2) + `<text class="exh-f9 tc exc-g" x="${(x0 + ref) / 2}" y="${Y - 18}">${esc(u('result', 'результат', 'нәтиже'))}</text>`;
  } else {
    const x0 = ref - 70;
    s += bar(x0, ref) + `<path class="ex-stroke exc-g" style="stroke-width:1.5" d="M${x0} ${Y - 12} v-4 H${ref} v4"/><text class="exh-f9 tc exc-g" x="${(x0 + ref) / 2}" y="${Y - 20}">${esc(u('for two hours', 'два часа', 'екі сағат'))}</text>`;
  }
  return s;
}

/** Задания: предложение с пропуском, ответ, три неверных варианта, номер времени, слово-сигнал. */
const TENSE_QUIZ = [
  ['Look! The children ___ (play) in the yard now.', 'are playing', ['play', 'played', 'have played'], 5, 'Look! now'],
  ['Water ___ (boil) at 100 °C.', 'boils', ['boil', 'boiled', 'has boil'], 4, 'a fact'],
  ['I ___ (see) this film yesterday.', 'saw', ['have seen', 'see', 'am seeing'], 0, 'yesterday'],
  ['I ___ (never / be) to London.', 'have never been', ['never was', 'am never', 'never been'], 6, 'never (life experience)'],
  ['While I ___ (cook) dinner, the phone rang.', 'was cooking', ['am cooking', 'have cooked', 'cook'], 1, 'while + rang'],
  ['By the time we arrived, the train ___ (leave).', 'had left', ['has left', 'leaves', 'will leave'], 2, 'by the time we arrived'],
  ['I think it ___ (rain) tomorrow.', 'will rain', ['rains', 'rained', 'has rained'], 8, 'I think, tomorrow'],
  ['This time tomorrow I ___ (fly) to Astana.', 'will be flying', ['fly', 'flew', 'have flown'], 9, 'this time tomorrow'],
  ['By next June she ___ (finish) school.', 'will have finished', ['finishes', 'finished', 'has finished'], 10, 'by next June'],
  ['They ___ (wait) for the bus for 20 minutes, and it is still not here.', 'have been waiting', ['wait', 'waited', 'are wait'], 7, 'for 20 minutes + still'],
  ['He was tired because he ___ (run) for an hour.', 'had been running', ['has been running', 'runs', 'will run'], 3, 'was tired + for an hour'],
  ['By 2030 we ___ (live) here for ten years.', 'will have been living', ['live', 'lived', 'have lived'], 11, 'by 2030 + for ten years'],
  ['She ___ (not / like) coffee.', "doesn't like", ["don't like", "isn't like", 'not likes'], 4, 'a fact about her'],
  ['___ he ___ (work) right now?', 'Is ... working', ['Does ... work', 'Did ... work', 'Has ... worked'], 5, 'right now'],
  ['At 8 pm yesterday I ___ (watch) TV.', 'was watching', ['am watching', 'have watched', 'watch'], 1, 'at 8 pm yesterday'],
  ['My parents ___ (buy) a new car last month.', 'bought', ['have bought', 'buy', 'are buying'], 0, 'last month'],
  ['She ___ (not / see) him since 2020.', "hasn't seen", ["didn't see", "doesn't see", "isn't seeing"], 6, 'since 2020'],
  ['Listen! Someone ___ (knock) at the door.', 'is knocking', ['knocks', 'knocked', 'has knocked'], 5, 'Listen!'],
  ['When I came home, my sister ___ (already / cook) dinner.', 'had already cooked', ['has already cooked', 'already cooks', 'will already cook'], 2, 'already + came'],
  ['Do not call me at 9 tonight: I ___ (study) then.', 'will be studying', ['study', 'studied', 'have studied'], 9, 'at 9 tonight'],
  ['I ___ (learn) English since 2019.', 'have been learning', ['learn', 'learned', 'am learning'], 7, 'since 2019'],
  ['He usually ___ (go) to bed at 10.', 'goes', ['is going', 'go', 'has gone'], 4, 'usually'],
  ['I promise I ___ (help) you with maths tomorrow.', 'will help', ['help', 'helped', 'have helped'], 8, 'I promise, tomorrow'],
  ['___ you ___ (finish) your homework yet?', 'Have ... finished', ['Do ... finish', 'Are ... finishing', 'Will ... finished'], 6, 'yet'],
];

function tenseQuiz(st) {
  const prev = st.q?.n ?? -1;
  let n = rnd(TENSE_QUIZ.length);
  if (n === prev) n = (n + 1) % TENSE_QUIZ.length;
  const [sx, a, wrong, k, sig] = TENSE_QUIZ[n];
  return { n, item: { s: sx, a, k, sig }, opts: shuffle([a, ...wrong]), pick: -1, done: false, ok: false, hint: false };
}

function tenseQuizDraw(st) {
  const q = st.q;
  const it = q.item;
  let s = `<text class="exh-f13 ex-start" x="8" y="15">${esc(u('Choose the right form', 'Выбери правильную форму', 'Дұрыс түрін таңда'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="15">✓ ${st.score[0]} / ${st.score[1]}</text>`;
  // После ответа вставляем правильную форму (у вопросов - две части: «Is ... working»).
  const parts = it.a.split(' ... ');
  const filled = q.done ? parts.reduce((acc, p) => acc.replace('___', p), it.s).replace(/ \([^)]*\)/, '') : it.s;
  const tl = wrap(filled, 40, 3);
  s += `<rect class="exh-card" x="6" y="24" width="308" height="66" rx="10"/>${lines(tl, 160, 58 - (tl.length - 1) * 8, 16, 'exh-f13 exh-it')}`;
  q.opts.forEach((o, i) => {
    const cls = q.done ? (o === it.a ? 'ok' : i === q.pick ? 'bad' : '') : '';
    s += chip(i % 2 ? 164 : 8, i < 2 ? 98 : 134, 148, 30, o, `o${i}`, cls, 12);
  });
  if (q.done || q.hint) s += `<text class="exh-f12 tc exc-p" x="160" y="190">${esc(q.done ? TENSE_NAMES[it.k] : `${u('Signal', 'Сигнал', 'Белгі')}: ${it.sig}`)}</text>`;
  if (q.done) s += `<text class="exh-f10 tc exc-m" x="160" y="207">${esc(`${u('Signal', 'Сигнал', 'Белгі')}: ${it.sig}`)}</text>`;
  const use = TENSE_USE[it.k];
  return {
    svg: s,
    caption: !q.done
      ? L(`Fill the gap: «${it.s}» Tap the right form.${q.hint ? ` Look at the signal: ${it.sig}.` : ''}`, `Заполни пропуск: «${it.s}» Нажми на правильную форму.${q.hint ? ` Смотри на сигнал: ${it.sig}.` : ''}`, `Бос орынды толтыр: «${it.s}» Дұрыс түрін бас.${q.hint ? ` Белгіге қара: ${it.sig}.` : ''}`)
      : L(`${q.ok ? '✓ Right' : `✗ The answer is «${it.a}»`}: ${TENSE_NAMES[it.k]} - ${use.en}. Signal: ${it.sig}.`, `${q.ok ? '✓ Верно' : `✗ Правильно «${it.a}»`}: ${TENSE_NAMES[it.k]} - ${use.ru}. Сигнал: ${it.sig}.`, `${q.ok ? '✓ Дұрыс' : `✗ Дұрысы «${it.a}»`}: ${TENSE_NAMES[it.k]} - ${use.kk}. Белгі: ${it.sig}.`),
  };
}

// ---------- Двоичные числа ----------

/** Деление на 2 с остатком до нуля: [[делимое, частное, остаток], ...]. */
function binDivs(n) {
  const rows = [];
  for (let x = n; x > 0; x = Math.floor(x / 2)) rows.push([x, Math.floor(x / 2), x % 2]);
  return rows;
}
/** «64 + 8 + 2 = 74». */
function binParts(x) {
  const parts = [];
  for (let p = 7; p >= 0; p--) if ((x >> p) & 1) parts.push(2 ** p);
  return `${parts.join(' + ') || 0} = ${x}`;
}
function binQuiz(st) {
  const t = st.qn++ % 3;
  const x = 5 + rnd(250);
  const q = { t, x, val: 0, pick: -1, done: false, ok: false, opts: [] };
  if (t > 0) {
    const opts = new Set([x]);
    // Похожие ошибки: соседний бит, ±1, перестановка цифр.
    for (const d of shuffle([1, -1, 2, -2, 16, -16, 8, -8, 32, -32, 4, -4])) if (opts.size < 4 && x + d > 0 && x + d < 256) opts.add(x + d);
    q.opts = [...opts].sort((a, b) => a - b);
  }
  return q;
}
function binDone(st, ok) {
  st.q.done = true;
  st.q.ok = ok;
  st.score[1] += 1;
  if (ok) st.score[0] += 1;
}

// ---------- Сортировки ----------

const SORT_NAMES = [
  { short: L('Bubble', 'Пузырёк', 'Көпіршік'), name: L('Bubble sort', 'Сортировка пузырьком', 'Көпіршікті сұрыптау'), o: 'O(n²)', idea: L('compare neighbours, swap if the left one is bigger', 'сравниваем соседей, меняем, если левый больше', 'көршілерді салыстырып, сол жағы үлкен болса ауыстырамыз') },
  { short: L('Selection', 'Выбором', 'Таңдау'), name: L('Selection sort', 'Сортировка выбором', 'Таңдау арқылы сұрыптау'), o: 'O(n²)', idea: L('find the minimum of the rest and put it in place', 'находим минимум в остатке и ставим его на место', 'қалғандардың ең кішісін тауып, орнына қоямыз') },
  { short: L('Insertion', 'Вставками', 'Кірістіру'), name: L('Insertion sort', 'Сортировка вставками', 'Кірістіру арқылы сұрыптау'), o: 'O(n²)', idea: L('take the next bar and slide it into the sorted part', 'берём следующий и вставляем в отсортированную часть', 'келесісін алып, сұрыпталған бөлікке кірістіреміз') },
  { short: L('Quick', 'Быстрая', 'Жылдам'), name: L('Quick sort', 'Быстрая сортировка', 'Жылдам сұрыптау'), o: 'O(n log n)', idea: L('smaller than the pivot go left, bigger go right, then repeat', 'меньшие опорного - влево, большие - вправо, и так в каждой части', 'тіректен кішілер солға, үлкендер оңға, әр бөлікте қайталаймыз') },
];

function randomArr(n) {
  return shuffle(Array.from({ length: n }, (_, i) => i + 1));
}
function nearlySorted(n) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  const i = rnd(n - 1);
  [a[i], a[i + 1]] = [a[i + 1], a[i]];
  const j = rnd(n - 1);
  if (Math.abs(j - i) > 1) [a[j], a[j + 1]] = [a[j + 1], a[j]];
  return a;
}
function sortInit(arr, alg) {
  return { start: [...arr], alg, trace: sortTrace(arr, alg), pos: 0 };
}

/** Все шаги алгоритма: { arr, hl, kind, fin, pre, piv, range, cmp, sw, msg }. */
function sortTrace(start, alg) {
  const a = [...start];
  const n = a.length;
  const fin = [];
  let cmp = 0;
  let sw = 0;
  const out = [];
  const push = (o) => out.push({ arr: [...a], hl: [], kind: '', fin: [...fin], pre: 0, piv: -1, range: null, cmp, sw, ...o });
  const swap = (i, j) => {
    [a[i], a[j]] = [a[j], a[i]];
    sw += 1;
  };
  push({ msg: L('Press "Step" or "▶ Auto". Orange - compared, pink - swapped, green - in its final place.', 'Нажимай «Шаг» или «▶ Авто». Оранжевые - сравниваем, розовые - меняем, зелёные - уже на своём месте.', '«Қадам» не «▶ Авто» бас. Қызғылт сары - салыстырамыз, қызғылт - ауыстырамыз, жасыл - өз орнында.') });
  if (alg === 0) {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        cmp += 1;
        const [x, y] = [a[j], a[j + 1]];
        if (x > y) {
          swap(j, j + 1);
          swapped = true;
          push({ hl: [j, j + 1], kind: 'swp', msg: L(`Pass ${i + 1}: ${x} > ${y} → swap them.`, `Проход ${i + 1}: ${x} > ${y} → меняем местами.`, `${i + 1}-өту: ${x} > ${y} → орындарын ауыстырамыз.`) });
        } else push({ hl: [j, j + 1], kind: 'cmp', msg: L(`Pass ${i + 1}: ${x} < ${y} → leave them.`, `Проход ${i + 1}: ${x} < ${y} → оставляем.`, `${i + 1}-өту: ${x} < ${y} → қалдырамыз.`) });
      }
      fin.push(n - 1 - i);
      if (!swapped) {
        for (let k = 0; k < n; k++) if (!fin.includes(k)) fin.push(k);
        push({ msg: L(`Pass ${i + 1} had no swaps - the array is already sorted, we can stop early.`, `В проходе ${i + 1} не было обменов - массив уже отсортирован, можно остановиться раньше.`, `${i + 1}-өтуде алмасу болмады - массив сұрыпталған, ертерек тоқтауға болады.`) });
        break;
      }
      push({ msg: L(`After pass ${i + 1} the biggest of the rest, ${a[n - 1 - i]}, «bubbled up» to the end.`, `После прохода ${i + 1} самое большое из оставшихся, ${a[n - 1 - i]}, «всплыло» в конец.`, `${i + 1}-өтуден кейін қалғандардың ең үлкені, ${a[n - 1 - i]}, соңына «қалқып шықты».`) });
    }
  } else if (alg === 1) {
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) {
        cmp += 1;
        const better = a[j] < a[m];
        push({ hl: [m, j], kind: 'cmp', msg: L(`Looking for the minimum from position ${i}: ${a[j]} ${better ? '<' : '>'} ${a[m]}${better ? ` → new minimum ${a[j]}` : ''}.`, `Ищем минимум с позиции ${i}: ${a[j]} ${better ? '<' : '>'} ${a[m]}${better ? ` → новый минимум ${a[j]}` : ''}.`, `${i}-орыннан бастап ең кішісін іздейміз: ${a[j]} ${better ? '<' : '>'} ${a[m]}${better ? ` → жаңа минимум ${a[j]}` : ''}.`) });
        if (better) m = j;
      }
      if (m !== i) {
        const [x, y] = [a[i], a[m]];
        swap(i, m);
        fin.push(i);
        push({ hl: [i, m], kind: 'swp', msg: L(`The minimum ${y} goes to position ${i} (swap with ${x}).`, `Минимум ${y} ставим на позицию ${i} (меняем с ${x}).`, `Минимум ${y}-ті ${i}-орынға қоямыз (${x}-пен ауыстырамыз).`) });
      } else {
        fin.push(i);
        push({ msg: L(`${a[i]} is already the minimum - it stays at position ${i}.`, `${a[i]} уже минимум - остаётся на позиции ${i}.`, `${a[i]} - ең кішісі, ${i}-орында қалады.`) });
      }
    }
    fin.push(n - 1);
  } else if (alg === 2) {
    for (let i = 1; i < n; i++) {
      let j = i;
      const key = a[i];
      while (j > 0) {
        cmp += 1;
        if (a[j - 1] > a[j]) {
          const x = a[j - 1];
          swap(j - 1, j);
          push({ hl: [j - 1, j], kind: 'swp', pre: i, msg: L(`Insert ${key}: ${x} > ${key} → move ${key} one step left.`, `Вставляем ${key}: ${x} > ${key} → сдвигаем ${key} на шаг влево.`, `${key}-ті кірістіреміз: ${x} > ${key} → ${key}-ті бір қадам солға жылжытамыз.`) });
          j -= 1;
        } else {
          push({ hl: [j - 1, j], kind: 'cmp', pre: i, msg: L(`Insert ${key}: ${a[j - 1]} < ${key} → ${key} is in place among the first ${i + 1}.`, `Вставляем ${key}: ${a[j - 1]} < ${key} → ${key} на месте среди первых ${i + 1}.`, `${key}-ті кірістіреміз: ${a[j - 1]} < ${key} → ${key} алғашқы ${i + 1} ішінде орнында.`) });
          break;
        }
      }
    }
    for (let k = 0; k < n; k++) fin.push(k);
  } else {
    const quick = (lo, hi) => {
      if (lo > hi) return;
      if (lo === hi) {
        fin.push(lo);
        return;
      }
      const pv = a[hi];
      push({ piv: hi, range: [lo, hi], msg: L(`Part [${lo}…${hi}]: pivot = ${pv}. Smaller values go to the left of it.`, `Часть [${lo}…${hi}]: опорный = ${pv}. Меньшие него переносим влево.`, `[${lo}…${hi}] бөлігі: тірек = ${pv}. Одан кішілерді солға жылжытамыз.`) });
      let i = lo;
      for (let j = lo; j < hi; j++) {
        cmp += 1;
        if (a[j] < pv) {
          if (i !== j) {
            const [x, y] = [a[i], a[j]];
            swap(i, j);
            push({ hl: [i, j], kind: 'swp', piv: hi, range: [lo, hi], msg: L(`${y} < ${pv} → move it left (swap with ${x}).`, `${y} < ${pv} → переносим влево (меняем с ${x}).`, `${y} < ${pv} → солға жылжытамыз (${x}-пен ауыстырамыз).`) });
          } else push({ hl: [j], kind: 'cmp', piv: hi, range: [lo, hi], msg: L(`${a[j]} < ${pv} → it is already on the left.`, `${a[j]} < ${pv} → уже слева.`, `${a[j]} < ${pv} → сол жақта тұр.`) });
          i += 1;
        } else push({ hl: [j], kind: 'cmp', piv: hi, range: [lo, hi], msg: L(`${a[j]} > ${pv} → stays on the right.`, `${a[j]} > ${pv} → остаётся справа.`, `${a[j]} > ${pv} → оң жақта қалады.`) });
      }
      if (i !== hi) swap(i, hi);
      fin.push(i);
      push({ hl: [i], kind: 'swp', range: [lo, hi], msg: L(`The pivot ${pv} takes its final place ${i}: all smaller are left, all bigger are right.`, `Опорный ${pv} встаёт на своё место ${i}: все меньшие слева, все большие справа.`, `Тірек ${pv} өз орнына (${i}) тұрады: кішілердің бәрі солда, үлкендер оңда.`) });
      quick(lo, i - 1);
      quick(i + 1, hi);
    };
    quick(0, n - 1);
  }
  for (let k = 0; k < n; k++) if (!fin.includes(k)) fin.push(k);
  push({ msg: L('Sorted!', 'Отсортировано!', 'Сұрыпталды!') });
  return out;
}

// ---------- Код по шагам: общая панель кода ----------

/** Панель кода: строки моноширинным шрифтом, подсвечены строки cur. */
function codePanel(code, cur = [], y = 6) {
  const lh = code.length > 5 ? 13 : 14;
  const h = code.length * lh + 10;
  let s = `<rect class="exh-box" x="6" y="${y}" width="308" height="${h}" rx="8"/>`;
  for (const i of cur) s += `<rect class="exh-hl" x="9" y="${y + 4 + i * lh}" width="302" height="${lh + 1}" rx="4"/><path class="ex-fill exc-p" d="M10 ${y + 6 + i * lh} l5 ${lh / 2 - 2} l-5 ${lh / 2 - 2} Z"/>`;
  code.forEach((ln, i) => (s += `<text class="exh-f11 exh-mono ex-start" x="18" y="${y + 4 + i * lh + lh - 3}">${esc(ln)}</text>`));
  return s;
}

// ---------- Циклы ----------

const LOOP_EX = [
  {
    name: L('Σ 1..n', 'Σ 1..n', 'Σ 1..n'),
    code: [
      (n) => [`n = ${n}`, 'total = 0', 'for i in range(1, n + 1):', '    total += i', 'print(total)'],
      (n) => [`int n = ${n}, total = 0;`, 'for (int i = 1; i <= n; i++)', '    total += i;', 'cout << total;'],
      (n) => [`let n = ${n}, total = 0;`, 'for (let i = 1; i <= n; i++)', '    total += i;', 'console.log(total);'],
      (n) => [`int n = ${n}, total = 0;`, 'for (int i = 1; i <= n; i++)', '    total += i;', 'System.out.println(total);'],
    ],
    map: [{ init: [0, 1], cond: [2], b1: [3], out: [4] }, { init: [0], cond: [1], b1: [2], out: [3] }, { init: [0], cond: [1], b1: [2], out: [3] }, { init: [0], cond: [1], b1: [2], out: [3] }],
    hint: L('A for loop with a counter: i goes from 1 to n and total grows on every pass.', 'Цикл for со счётчиком: i идёт от 1 до n, total растёт на каждом проходе.', 'Санауышы бар for циклі: i 1-ден n-ге дейін жүреді, total әр өтуде өседі.'),
    sum: { en: (t) => `total = 1 + 2 + … + ${t.p} = ${(t.p * (t.p + 1)) / 2} (formula n(n + 1)/2).`, ru: (t) => `total = 1 + 2 + … + ${t.p} = ${(t.p * (t.p + 1)) / 2} (формула n(n + 1)/2).`, kk: (t) => `total = 1 + 2 + … + ${t.p} = ${(t.p * (t.p + 1)) / 2} (n(n + 1)/2 формуласы).` },
  },
  {
    name: L('Evens', 'Чётные', 'Жұп'),
    code: [
      (n) => [`n = ${n}`, 'for i in range(0, n, 2):', '    print(i)'],
      (n) => [`int n = ${n};`, 'for (int i = 0; i < n; i += 2)', '    cout << i << " ";'],
      (n) => [`let n = ${n};`, 'for (let i = 0; i < n; i += 2)', '    console.log(i);'],
      (n) => [`int n = ${n};`, 'for (int i = 0; i < n; i += 2)', '    System.out.println(i);'],
    ],
    map: [{ init: [0], cond: [1], b1: [2] }, { init: [0], cond: [1], b1: [2] }, { init: [0], cond: [1], b1: [2] }, { init: [0], cond: [1], b1: [2] }],
    hint: L('The step is 2, and the end value n is NOT included (i < n, range(0, n, 2)).', 'Шаг 2, а конечное значение n НЕ входит (i < n, range(0, n, 2)).', 'Қадам 2, ал соңғы n мәні КІРМЕЙДІ (i < n, range(0, n, 2)).'),
    sum: { en: (t) => `i took the values ${t.vals.join(', ')}; ${t.p} itself is not included.`, ru: (t) => `i принимало значения ${t.vals.join(', ')}; само ${t.p} не входит.`, kk: (t) => `i ${t.vals.join(', ')} мәндерін қабылдады; ${t.p}-тің өзі кірмейді.` },
  },
  {
    name: L('Digits', 'Цифры', 'Цифрлар'),
    code: [
      (n) => [`num = ${n}`, 'count = 0', 'while num > 0:', '    num //= 10', '    count += 1', 'print(count)'],
      (n) => [`int num = ${n}, count = 0;`, 'while (num > 0) {', '    num /= 10;', '    count++;', '}', 'cout << count;'],
      (n) => [`let num = ${n}, count = 0;`, 'while (num > 0) {', '    num = Math.floor(num / 10);', '    count++;', '}', 'console.log(count);'],
      (n) => [`int num = ${n}, count = 0;`, 'while (num > 0) {', '    num /= 10;', '    count++;', '}', 'System.out.println(count);'],
    ],
    map: [{ init: [0, 1], cond: [2], b1: [3], b2: [4], out: [5] }, { init: [0], cond: [1], b1: [2], b2: [3], out: [5] }, { init: [0], cond: [1], b1: [2], b2: [3], out: [5] }, { init: [0], cond: [1], b1: [2], b2: [3], out: [5] }],
    hint: L('A while loop runs while the condition is true. Integer division by 10 drops the last digit.', 'Цикл while работает, пока условие верно. Целочисленное деление на 10 отбрасывает последнюю цифру.', 'while циклі шарт ақиқат болғанша жұмыс істейді. 10-ға бүтін бөлу соңғы цифрды алып тастайды.'),
    sum: { en: (t) => `${t.p} has ${t.passes} digit${t.passes > 1 ? 's' : ''}: each pass removed one.`, ru: (t) => `В числе ${t.p} цифр: ${t.passes} - каждый проход убирал одну.`, kk: (t) => `${t.p} санында ${t.passes} цифр бар: әр өту біреуін алып тастады.` },
  },
  {
    name: L('Doubling', 'Удвоение', 'Еселеу'),
    code: [
      (n) => [`lim = ${n}`, 'x, steps = 1, 0', 'while x < lim:', '    x *= 2', '    steps += 1', 'print(x, steps)'],
      (n) => [`int lim = ${n}, x = 1, steps = 0;`, 'while (x < lim) {', '    x *= 2;', '    steps++;', '}', 'cout << x << " " << steps;'],
      (n) => [`let lim = ${n}, x = 1, steps = 0;`, 'while (x < lim) {', '    x *= 2;', '    steps++;', '}', 'console.log(x, steps);'],
      (n) => [`int lim = ${n}, x = 1, steps = 0;`, 'while (x < lim) {', '    x *= 2;', '    steps++;', '}', 'System.out.println(x + " " + steps);'],
    ],
    map: [{ init: [0, 1], cond: [2], b1: [3], b2: [4], out: [5] }, { init: [0], cond: [1], b1: [2], b2: [3], out: [5] }, { init: [0], cond: [1], b1: [2], b2: [3], out: [5] }, { init: [0], cond: [1], b1: [2], b2: [3], out: [5] }],
    hint: L('x doubles until it reaches lim. The number of passes is the logarithm of lim to base 2, rounded up.', 'x удваивается, пока не достигнет lim. Число проходов - логарифм lim по основанию 2, округлённый вверх.', 'x lim-ге жеткенше екі еселенеді. Өту саны - lim-нің 2 негізді логарифмі, жоғары дөңгелектенген.'),
    sum: { en: (t) => `2^${t.passes} = ${2 ** t.passes} is the first power of two ≥ ${t.p}.`, ru: (t) => `2^${t.passes} = ${2 ** t.passes} - первая степень двойки ≥ ${t.p}.`, kk: (t) => `2^${t.passes} = ${2 ** t.passes} - ${t.p}-ден кіші емес екінің алғашқы дәрежесі.` },
  },
];

/** Шаги цикла: { line, vars, out, pass, note }. */
function loopTrace(v) {
  const ex = clamp(Math.round(v.ex), 0, 3);
  const p = Math.round([v.n, v.n, v.num, v.lim][ex]);
  const steps = [];
  const out = [];
  let pass = 0;
  const add = (line, vars, note, isPass = false) => steps.push({ line, vars: { ...vars }, out: [...out], pass: isPass ? ++pass : 0, note });
  const vals = [];
  if (ex === 0) {
    let total = 0;
    add('init', { i: '-', total }, L('total = 0.', 'total = 0.', 'total = 0.'));
    for (let i = 1; i <= p; i++) {
      add('cond', { i, total }, L(`i = ${i}: ${i} <= ${p} - true, enter the body.`, `i = ${i}: ${i} <= ${p} - верно, входим в тело.`, `i = ${i}: ${i} <= ${p} - ақиқат, денеге кіреміз.`));
      total += i;
      add('b1', { i, total }, L(`total = ${total - i} + ${i} = ${total}.`, `total = ${total - i} + ${i} = ${total}.`, `total = ${total - i} + ${i} = ${total}.`), true);
    }
    add('cond', { i: p + 1, total }, L(`i = ${p + 1}: ${p + 1} <= ${p} - false, the loop ends.`, `i = ${p + 1}: ${p + 1} <= ${p} - ложно, цикл закончен.`, `i = ${p + 1}: ${p + 1} <= ${p} - жалған, цикл аяқталды.`));
    out.push(total);
    add('out', { i: p + 1, total }, L(`Print total = ${total}.`, `Выводим total = ${total}.`, `total = ${total} шығарамыз.`));
  } else if (ex === 1) {
    add('init', { i: '-' }, L(`n = ${p}.`, `n = ${p}.`, `n = ${p}.`));
    for (let i = 0; i < p; i += 2) {
      vals.push(i);
      add('cond', { i }, L(`i = ${i}: ${i} < ${p} - true.`, `i = ${i}: ${i} < ${p} - верно.`, `i = ${i}: ${i} < ${p} - ақиқат.`));
      out.push(i);
      add('b1', { i }, L(`Print ${i}, then i += 2.`, `Выводим ${i}, затем i += 2.`, `${i} шығарамыз, сосын i += 2.`), true);
    }
    const last = vals.length ? vals.at(-1) + 2 : 0;
    add('cond', { i: last }, L(`i = ${last}: ${last} < ${p} - false, the loop ends.`, `i = ${last}: ${last} < ${p} - ложно, цикл закончен.`, `i = ${last}: ${last} < ${p} - жалған, цикл аяқталды.`));
  } else if (ex === 2) {
    let num = p;
    let count = 0;
    add('init', { num, count }, L(`num = ${p}, count = 0.`, `num = ${p}, count = 0.`, `num = ${p}, count = 0.`));
    while (num > 0) {
      add('cond', { num, count }, L(`${num} > 0 - true.`, `${num} > 0 - верно.`, `${num} > 0 - ақиқат.`));
      const was = num;
      num = Math.floor(num / 10);
      add('b1', { num, count }, L(`${was} // 10 = ${num}: the last digit ${was % 10} is gone.`, `${was} // 10 = ${num}: последняя цифра ${was % 10} отброшена.`, `${was} // 10 = ${num}: соңғы ${was % 10} цифры алынды.`));
      count += 1;
      add('b2', { num, count }, L(`count = ${count}.`, `count = ${count}.`, `count = ${count}.`), true);
    }
    add('cond', { num, count }, L('0 > 0 - false, the loop ends.', '0 > 0 - ложно, цикл закончен.', '0 > 0 - жалған, цикл аяқталды.'));
    out.push(count);
    add('out', { num, count }, L(`Print ${count}.`, `Выводим ${count}.`, `${count} шығарамыз.`));
  } else {
    let x = 1;
    let st = 0;
    add('init', { x, steps: st }, L(`lim = ${p}, x = 1, steps = 0.`, `lim = ${p}, x = 1, steps = 0.`, `lim = ${p}, x = 1, steps = 0.`));
    while (x < p) {
      add('cond', { x, steps: st }, L(`${x} < ${p} - true.`, `${x} < ${p} - верно.`, `${x} < ${p} - ақиқат.`));
      x *= 2;
      add('b1', { x, steps: st }, L(`x = ${x / 2} · 2 = ${x}.`, `x = ${x / 2} · 2 = ${x}.`, `x = ${x / 2} · 2 = ${x}.`));
      st += 1;
      add('b2', { x, steps: st }, L(`steps = ${st}.`, `steps = ${st}.`, `steps = ${st}.`), true);
    }
    add('cond', { x, steps: st }, L(`${x} < ${p} - false, the loop ends.`, `${x} < ${p} - ложно, цикл закончен.`, `${x} < ${p} - жалған, цикл аяқталды.`));
    out.push(`${x} ${st}`);
    add('out', { x, steps: st }, L(`Print ${x} ${st}.`, `Выводим ${x} ${st}.`, `${x} ${st} шығарамыз.`));
  }
  return { ex, p, steps, vals, passes: pass };
}
function loopGuessOpts(p) {
  return [...new Set([p - 1, p, p + 1, p + 2].map((x) => Math.max(0, x)))].sort((a, b) => a - b);
}

// ---------- Рекурсия ----------

/** Четыре примера: f - имя, arg(n) - аргумент, base(x) - значение базы или null, kids(x) - вызовы, comb - результат. */
const REC_EX = [
  {
    f: 'fact',
    arg: (n) => n,
    base: (x) => (x === 1 ? 1 : null),
    kids: (x) => [x - 1],
    comb: (x, r) => x * r[0],
    expr: (x, r) => `${x} · ${r[0] ?? '?'}`,
    hint: L('fact(n) = n · fact(n − 1), and fact(1) = 1 is the base case.', 'fact(n) = n · fact(n − 1), а fact(1) = 1 - базовый случай.', 'fact(n) = n · fact(n − 1), ал fact(1) = 1 - базалық жағдай.'),
    code: [
      (a) => ['def fact(n):', '    if n == 1:', '        return 1', '    return n * fact(n - 1)', `print(fact(${a}))`],
      (a) => ['int fact(int n) {', '    if (n == 1) return 1;', '    return n * fact(n - 1);', '}', `cout << fact(${a});`],
      (a) => ['function fact(n) {', '    if (n === 1) return 1;', '    return n * fact(n - 1);', '}', `console.log(fact(${a}));`],
      (a) => ['static int fact(int n) {', '    if (n == 1) return 1;', '    return n * fact(n - 1);', '}', `System.out.println(fact(${a}));`],
    ],
  },
  {
    f: 'sd',
    arg: (n) => [5, 47, 815, 2024, 39071, 123456, 987654][n - 1],
    base: (x) => (x < 10 ? x : null),
    kids: (x) => [Math.floor(x / 10)],
    comb: (x, r) => (x % 10) + r[0],
    expr: (x, r) => `${x % 10} + ${r[0] ?? '?'}`,
    hint: L('sd(n) is the sum of digits: the last digit n % 10 plus sd of the rest; a one-digit number is the base case.', 'sd(n) - сумма цифр: последняя цифра n % 10 плюс sd от остальных; однозначное число - базовый случай.', 'sd(n) - цифрлар қосындысы: соңғы цифр n % 10 қосу қалғандарының sd-і; бір таңбалы сан - базалық жағдай.'),
    code: [
      (a) => ['def sd(n):', '    if n < 10:', '        return n', '    return n % 10 + sd(n // 10)', `print(sd(${a}))`],
      (a) => ['int sd(int n) {', '    if (n < 10) return n;', '    return n % 10 + sd(n / 10);', '}', `cout << sd(${a});`],
      (a) => ['function sd(n) {', '    if (n < 10) return n;', '    return n % 10 + sd(Math.floor(n / 10));', '}', `console.log(sd(${a}));`],
      (a) => ['static int sd(int n) {', '    if (n < 10) return n;', '    return n % 10 + sd(n / 10);', '}', `System.out.println(sd(${a}));`],
    ],
  },
  {
    f: 'pw',
    arg: (n) => n,
    base: (x) => (x === 0 ? 1 : null),
    kids: (x) => [x - 1],
    comb: (x, r) => 2 * r[0],
    expr: (x, r) => `2 · ${r[0] ?? '?'}`,
    hint: L('pw(n) = 2ⁿ = 2 · pw(n − 1), and pw(0) = 1.', 'pw(n) = 2ⁿ = 2 · pw(n − 1), а pw(0) = 1.', 'pw(n) = 2ⁿ = 2 · pw(n − 1), ал pw(0) = 1.'),
    code: [
      (a) => ['def pw(n):', '    if n == 0:', '        return 1', '    return 2 * pw(n - 1)', `print(pw(${a}))`],
      (a) => ['int pw(int n) {', '    if (n == 0) return 1;', '    return 2 * pw(n - 1);', '}', `cout << pw(${a});`],
      (a) => ['function pw(n) {', '    if (n === 0) return 1;', '    return 2 * pw(n - 1);', '}', `console.log(pw(${a}));`],
      (a) => ['static int pw(int n) {', '    if (n == 0) return 1;', '    return 2 * pw(n - 1);', '}', `System.out.println(pw(${a}));`],
    ],
  },
  {
    f: 'fib',
    arg: (n) => Math.min(n, 6),
    base: (x) => (x <= 1 ? x : null),
    kids: (x) => [x - 1, x - 2],
    comb: (x, r) => r[0] + r[1],
    expr: (x, r) => `${r[0] ?? '?'} + ${r[1] ?? '?'}`,
    hint: L('fib(n) = fib(n − 1) + fib(n − 2): two calls each time, so the number of calls grows very fast (n is at most 6 here).', 'fib(n) = fib(n − 1) + fib(n − 2): каждый раз два вызова, поэтому число вызовов растёт очень быстро (здесь n не больше 6).', 'fib(n) = fib(n − 1) + fib(n − 2): әр жолы екі шақыру, сондықтан шақырулар саны өте тез өседі (мұнда n 6-дан аспайды).'),
    code: [
      (a) => ['def fib(n):', '    if n <= 1:', '        return n', '    return fib(n - 1) + fib(n - 2)', `print(fib(${a}))`],
      (a) => ['int fib(int n) {', '    if (n <= 1) return n;', '    return fib(n - 1) + fib(n - 2);', '}', `cout << fib(${a});`],
      (a) => ['function fib(n) {', '    if (n <= 1) return n;', '    return fib(n - 1) + fib(n - 2);', '}', `console.log(fib(${a}));`],
      (a) => ['static int fib(int n) {', '    if (n <= 1) return n;', '    return fib(n - 1) + fib(n - 2);', '}', `System.out.println(fib(${a}));`],
    ],
  },
];

/** Шаги рекурсии: снимки стека { line, stack, calls, note }. */
function recTrace(v) {
  const E = REC_EX[clamp(Math.round(v.ex), 0, 3)];
  const arg = E.arg(clamp(Math.round(v.n), 1, 7));
  const steps = [];
  const stack = [];
  let calls = 0;
  let depth = 0;
  const snap = (line, note) => steps.push({ line, note, calls, stack: stack.map((f) => ({ ...f, r: [...f.r] })) });
  snap('main', L(`Call ${E.f}(${arg}).`, `Вызываем ${E.f}(${arg}).`, `${E.f}(${arg}) шақырамыз.`));
  const call = (x) => {
    calls += 1;
    stack.push({ x, r: [], ret: null });
    depth = Math.max(depth, stack.length);
    const top = stack.at(-1);
    snap('head', L(`Call ${E.f}(${x}): a new frame on the stack (depth ${stack.length}).`, `Вызов ${E.f}(${x}): новый кадр в стеке (глубина ${stack.length}).`, `${E.f}(${x}) шақыру: стекте жаңа кадр (тереңдік ${stack.length}).`));
    let val = E.base(x);
    if (val !== null) {
      top.ret = val;
      snap('base', L(`Base case: ${E.f}(${x}) = ${val} at once, no more calls. Now the frames return one by one.`, `Базовый случай: ${E.f}(${x}) = ${val} сразу, без новых вызовов. Теперь кадры возвращаются по одному.`, `Базалық жағдай: ${E.f}(${x}) = ${val} бірден, жаңа шақырусыз. Енді кадрлар бір-бірлеп қайтады.`));
    } else {
      for (const kx of E.kids(x)) {
        snap('rec', L(`${E.f}(${x}) = ${E.expr(x, top.r)}: it needs ${E.f}(${kx}) and waits.`, `${E.f}(${x}) = ${E.expr(x, top.r)}: нужен ${E.f}(${kx}), ждём.`, `${E.f}(${x}) = ${E.expr(x, top.r)}: ${E.f}(${kx}) керек, күтеміз.`));
        top.r.push(call(kx));
      }
      val = E.comb(x, top.r);
      top.ret = val;
      snap('rec', L(`${E.f}(${x}) = ${E.expr(x, top.r)} = ${val} - return it to the caller.`, `${E.f}(${x}) = ${E.expr(x, top.r)} = ${val} - возвращаем вызвавшему.`, `${E.f}(${x}) = ${E.expr(x, top.r)} = ${val} - шақырған жерге қайтарамыз.`));
    }
    stack.pop();
    return val;
  };
  const res = call(arg);
  snap('main', L(`Result: ${E.f}(${arg}) = ${res}. Calls: ${calls}, the deepest stack: ${depth}. Without a base case the stack would overflow.`, `Результат: ${E.f}(${arg}) = ${res}. Вызовов: ${calls}, наибольшая глубина стека: ${depth}. Без базового случая стек бы переполнился.`, `Нәтиже: ${E.f}(${arg}) = ${res}. Шақыру: ${calls}, стектің ең үлкен тереңдігі: ${depth}. Базалық жағдайсыз стек толып кетер еді.`));
  const opts = [...new Set([res, res + 1, res - 1, res * 2, res + 2, Math.max(0, res - 2)].filter((x) => x >= 0))].slice(0, 4).sort((a, b) => a - b);
  return { E, arg, steps, res, depth, opts };
}

// ---------- Массивы ----------

const arrStart = () => [7, 3, 9, 4, 6].map((val, id) => ({ id, val }));
const arrNext = (st) => [8, 1, 5, 2, 10, 12, 11][st.id % 7];

function arrCode(op, lang, i, x) {
  const head = [`# a: list`, '// a: vector<int>', '// a: Array', '// a: ArrayList<Integer>'][lang];
  const one = [
    [`v = a[${i}]`, `int v = a[${i}];`, `let v = a[${i}];`, `int v = a.get(${i});`],
    [`a[${i}] = ${x}`, `a[${i}] = ${x};`, `a[${i}] = ${x};`, `a.set(${i}, ${x});`],
    [`a.append(${x})`, `a.push_back(${x});`, `a.push(${x});`, `a.add(${x});`],
    ['a.pop()', 'a.pop_back();', 'a.pop();', 'a.remove(a.size() - 1);'],
    [`a.insert(${i}, ${x})`, `a.insert(a.begin() + ${i}, ${x});`, `a.splice(${i}, 0, ${x});`, `a.add(${i}, ${x});`],
  ];
  if (op < 5) return [head, one[op][lang]];
  return [
    head,
    ...[
      ['m = a[0]', 'for x in a:', '    if x > m:', '        m = x'],
      ['int m = a[0];', 'for (int x : a)', '    if (x > m) m = x;'],
      ['let m = a[0];', 'for (const x of a)', '    if (x > m) m = x;'],
      ['int m = a.get(0);', 'for (int x : a)', '    if (x > m) m = x;'],
    ][lang],
  ];
}

/** Можно ли выполнить операцию: { ok, idx, err }. */
function arrCheck(op, lang, i, n) {
  const ERR = ['IndexError', u('undefined behaviour', 'неопределённое поведение', 'анықталмаған әрекет'), 'undefined', 'IndexOutOfBoundsException'];
  if (op === 0 || op === 1) {
    if (lang === 0 && i < 0 && -i <= n) return { ok: true, idx: n + i };
    if (i >= 0 && i < n) return { ok: true, idx: i };
    return { ok: false, idx: i < 0 ? -1 : i, err: lang === 2 && op === 1 ? u('holes in the array', 'дыры в массиве', 'массивте бос орындар') : ERR[lang] };
  }
  if (op === 3) return n ? { ok: true, idx: n - 1 } : { ok: false, idx: -1, err: ERR[lang] };
  if (op === 4) {
    if (lang === 0 || lang === 2) return { ok: true, idx: i < 0 ? Math.max(0, n + i) : Math.min(i, n) };
    return i >= 0 && i <= n ? { ok: true, idx: i } : { ok: false, idx: i < 0 ? -1 : i, err: ERR[lang] };
  }
  return { ok: n < 9 || op !== 2, idx: n, err: '' };
}

function arrRun(st, op, i) {
  const n = st.arr.length;
  const c = arrCheck(op, st.lang, i, n);
  if (op === 5) {
    if (st.mk < 0 || st.mk >= n) {
      st.mk = 0;
      st.maxv = st.arr[0].val;
    } else {
      st.maxv = Math.max(st.maxv, st.arr[st.mk].val);
      st.mk += 1;
    }
    return;
  }
  if (!c.ok) return;
  const x = arrNext(st);
  if (op === 1) {
    st.arr[c.idx] = { id: st.id++, val: x };
    st.last = st.arr[c.idx];
  } else if (op === 2 && n < 9) {
    st.last = { id: st.id++, val: x };
    st.arr.push(st.last);
  } else if (op === 3 && n > 1) {
    st.arr.pop();
    st.last = null;
  } else if (op === 4 && n < 9) {
    st.last = { id: st.id++, val: x };
    st.arr.splice(c.idx, 0, st.last);
  }
}

function arrCaption(st, op, i, c, x) {
  const n = st.arr.length;
  const lang = st.lang;
  const range = `0…${n - 1}`;
  if (op === 5) {
    if (st.mk < 0) return L('Press "Run" to go through the array step by step and find the maximum.', 'Нажимай «Выполнить», чтобы пройти массив по шагам и найти максимум.', 'Массивті қадаммен өтіп, ең үлкенін табу үшін «Орындау» бас.');
    if (st.mk === 0) return L(`Start: m = a[0] = ${st.maxv}.`, `Начало: m = a[0] = ${st.maxv}.`, `Басы: m = a[0] = ${st.maxv}.`);
    const xv = st.arr[st.mk - 1].val;
    const done = st.mk >= n;
    return L(`x = ${xv}: ${xv === st.maxv ? `${xv} is the biggest so far` : `${xv} ≤ ${st.maxv}`}. m = ${st.maxv}.${done ? ` Done: the maximum is ${st.maxv} after ${n} comparisons.` : ''}`, `x = ${xv}: ${xv === st.maxv ? `${xv} - пока самое большое` : `${xv} ≤ ${st.maxv}`}. m = ${st.maxv}.${done ? ` Готово: максимум ${st.maxv}, просмотрено ${n} элементов.` : ''}`, `x = ${xv}: ${xv === st.maxv ? `${xv} - әзірге ең үлкені` : `${xv} ≤ ${st.maxv}`}. m = ${st.maxv}.${done ? ` Дайын: ең үлкені ${st.maxv}, ${n} элемент қаралды.` : ''}`);
  }
  if (!c.ok) {
    const why = [
      L(`Python raises IndexError: valid indexes are ${range} or −${n}…−1 from the end.`, `Python выдаст IndexError: допустимы индексы ${range} или −${n}…−1 с конца.`, `Python IndexError береді: рұқсат етілген индекстер ${range} немесе соңынан −${n}…−1.`),
      L(`C++ does not check a[i]: reading outside ${range} is undefined behaviour (a.at(i) would throw out_of_range).`, `C++ не проверяет a[i]: выход за ${range} - неопределённое поведение (a.at(i) выбросил бы out_of_range).`, `C++ a[i]-ді тексермейді: ${range} шегінен шығу - анықталмаған әрекет (a.at(i) out_of_range лақтырар еді).`),
      op === 1
        ? L(`JavaScript would silently grow the array and leave empty slots - a hidden bug. Valid indexes: ${range}.`, `JavaScript молча растянет массив и оставит пустые ячейки - скрытая ошибка. Допустимые индексы: ${range}.`, `JavaScript массивті үнсіз ұзартып, бос ұяшықтар қалдырады - жасырын қате. Рұқсат етілген индекстер: ${range}.`)
        : L(`JavaScript quietly returns undefined. Valid indexes: ${range}; a.at(-1) gives the last one.`, `JavaScript молча вернёт undefined. Допустимые индексы: ${range}; a.at(-1) даёт последний.`, `JavaScript үнсіз undefined қайтарады. Рұқсат етілген индекстер: ${range}; a.at(-1) соңғысын береді.`),
      L(`Java throws IndexOutOfBoundsException: valid indexes are ${range}${op === 4 ? ` (for add(i, x) - 0…${n})` : ''}.`, `Java выбросит IndexOutOfBoundsException: допустимые индексы ${range}${op === 4 ? ` (для add(i, x) - 0…${n})` : ''}.`, `Java IndexOutOfBoundsException лақтырады: рұқсат етілген индекстер ${range}${op === 4 ? ` (add(i, x) үшін - 0…${n})` : ''}.`),
    ][lang];
    return why;
  }
  const v = st.arr[c.idx]?.val;
  const neg = lang === 0 && i < 0 ? L(` Negative ${i} counts from the end: ${i} → ${c.idx}.`, ` Отрицательный ${i} считается с конца: ${i} → ${c.idx}.`, ` Теріс ${i} соңынан саналады: ${i} → ${c.idx}.`) : null;
  const base = [
    L(`a[${i}] = ${v}. There are ${n} elements, so the indexes are ${range} - the last index is n − 1.`, `a[${i}] = ${v}. Элементов ${n}, поэтому индексы ${range} - последний индекс n − 1.`, `a[${i}] = ${v}. Элемент ${n}, сондықтан индекстер ${range} - соңғы индекс n − 1.`),
    L(`Press "Run": element ${c.idx} (now ${v}) becomes ${x}. The length does not change.`, `Нажми «Выполнить»: элемент ${c.idx} (сейчас ${v}) станет ${x}. Длина не меняется.`, `«Орындау» бас: ${c.idx}-элемент (қазір ${v}) ${x} болады. Ұзындық өзгермейді.`),
    L(`Adds ${x} to the end: the length becomes ${n + 1}, the new element gets index ${n}.${n >= 9 ? ' (The picture holds 9 elements.)' : ''}`, `Добавляет ${x} в конец: длина станет ${n + 1}, новый элемент получит индекс ${n}.${n >= 9 ? ' (На картинке помещается 9 элементов.)' : ''}`, `${x}-ті соңына қосады: ұзындық ${n + 1} болады, жаңа элемент ${n} индексін алады.${n >= 9 ? ' (Суретке 9 элемент сыяды.)' : ''}`),
    L(`Removes the last element (${v}, index ${n - 1}). Python's pop() also returns it.`, `Удаляет последний элемент (${v}, индекс ${n - 1}). В Python pop() ещё и возвращает его.`, `Соңғы элементті (${v}, индекс ${n - 1}) өшіреді. Python-да pop() оны қайтарады да.`),
    L(`Inserts ${x} at index ${c.idx}: everything from ${c.idx} on moves one step right - that takes time for long arrays.`, `Вставляет ${x} на индекс ${c.idx}: всё начиная с ${c.idx} сдвигается вправо - для длинных массивов это долго.`, `${x}-ті ${c.idx} индексіне кірістіреді: ${c.idx}-ден бастап бәрі оңға жылжиды - ұзын массивте бұл ұзақ.`),
  ][op];
  return neg ? L(base.en + neg.en, base.ru + neg.ru, base.kk + neg.kk) : base;
}

// ---------- Логические элементы ----------

const GATES = [
  { id: 'AND', name: L('AND', 'И', 'ЖӘНЕ'), f: (a, b) => a & b, formula: 'Y = A ∧ B', py: 'a and b', c: 'a && b', rule: L('It gives 1 only when both inputs are 1 (logical multiplication, conjunction).', 'Даёт 1, только если оба входа равны 1 (логическое умножение, конъюнкция).', 'Екі кіріс те 1 болғанда ғана 1 береді (логикалық көбейту, конъюнкция).') },
  { id: 'OR', name: L('OR', 'ИЛИ', 'НЕМЕСЕ'), f: (a, b) => a | b, formula: 'Y = A ∨ B', py: 'a or b', c: 'a || b', rule: L('It gives 1 when at least one input is 1 (logical addition, disjunction).', 'Даёт 1, если хотя бы один вход равен 1 (логическое сложение, дизъюнкция).', 'Кем дегенде бір кіріс 1 болса, 1 береді (логикалық қосу, дизъюнкция).') },
  { id: 'NOT', name: L('NOT', 'НЕ', 'ЕМЕС'), f: (a) => 1 - a, formula: 'Y = ¬A', py: 'not a', c: '!a', rule: L('It turns 1 into 0 and 0 into 1 (inversion, negation).', 'Превращает 1 в 0 и 0 в 1 (инверсия, отрицание).', '1-ді 0-ге, 0-ді 1-ге айналдырады (инверсия, терістеу).') },
  { id: 'XOR', name: L('XOR', 'исключающее ИЛИ', 'XOR'), f: (a, b) => a ^ b, formula: 'Y = A ⊕ B', py: 'a != b   (a ^ b)', c: 'a != b   (a ^ b)', rule: L('It gives 1 when the inputs are different (exclusive OR).', 'Даёт 1, если входы разные (исключающее ИЛИ, строгая дизъюнкция).', 'Кірістер әртүрлі болса, 1 береді (қатаң дизъюнкция).') },
  { id: 'NAND', name: L('NAND', 'И-НЕ', 'ЖӘНЕ-ЕМЕС'), f: (a, b) => 1 - (a & b), formula: 'Y = ¬(A ∧ B)', py: 'not (a and b)', c: '!(a && b)', rule: L('NOT AND: it gives 0 only when both inputs are 1 (Sheffer stroke). Any circuit can be built from NAND alone.', 'И-НЕ: даёт 0, только если оба входа равны 1 (штрих Шеффера). Из одних И-НЕ можно собрать любую схему.', 'ЖӘНЕ-ЕМЕС: екі кіріс те 1 болғанда ғана 0 береді (Шеффер штрихы). Тек ЖӘНЕ-ЕМЕС арқылы кез келген сұлбаны құрастыруға болады.') },
  { id: 'NOR', name: L('NOR', 'ИЛИ-НЕ', 'НЕМЕСЕ-ЕМЕС'), f: (a, b) => 1 - (a | b), formula: 'Y = ¬(A ∨ B)', py: 'not (a or b)', c: '!(a || b)', rule: L('NOT OR: it gives 1 only when both inputs are 0 (Peirce arrow).', 'ИЛИ-НЕ: даёт 1, только если оба входа равны 0 (стрелка Пирса).', 'НЕМЕСЕ-ЕМЕС: екі кіріс те 0 болғанда ғана 1 береді (Пирс стрелкасы).') },
];

/** Значок элемента (как в учебниках): И - «D», ИЛИ - «щит», НЕ - треугольник с кружком. */
function gateShape(id, x, y, w, h) {
  const bub = ['NOT', 'NAND', 'NOR'].includes(id);
  const ww = bub ? w - 8 : w;
  let d;
  if (id === 'AND' || id === 'NAND') d = `M${x} ${y} H${x + ww - h / 2} A${h / 2} ${h / 2} 0 0 1 ${x + ww - h / 2} ${y + h} H${x} Z`;
  else if (id === 'NOT') d = `M${x} ${y} L${x + ww} ${y + h / 2} L${x} ${y + h} Z`;
  else d = `M${x} ${y} Q${x + ww * 0.55} ${y} ${x + ww} ${y + h / 2} Q${x + ww * 0.55} ${y + h} ${x} ${y + h} Q${x + ww * 0.28} ${y + h / 2} ${x} ${y} Z`;
  let s = `<path class="exh-gate" d="${d}"/>`;
  if (id === 'XOR') s += `<path class="exh-gate" style="fill:none" d="M${x - 6} ${y} Q${x + ww * 0.28 - 6} ${y + h / 2} ${x - 6} ${y + h}"/>`;
  if (bub) s += `<circle class="exh-gate" cx="${x + w - 4}" cy="${y + h / 2}" r="4"/>`;
  s += `<text class="exh-f9 tc exc-m" x="${x + (id === 'NOT' ? ww * 0.35 : ww * 0.42)}" y="${y + h / 2 + 3}">${id}</text>`;
  return s;
}

const CIRCUITS = [
  {
    f: '(A ∧ B) ∨ C',
    eval: (a, b, c) => {
      const g = a & b;
      const y = g | c;
      return { y, g: [g], steps: { en: `A AND B = ${g}; ${g} OR C = ${y}`, ru: `A И B = ${g}; ${g} ИЛИ C = ${y}`, kk: `A ЖӘНЕ B = ${g}; ${g} НЕМЕСЕ C = ${y}` } };
    },
  },
  {
    f: '¬A ∧ (B ∨ C)',
    eval: (a, b, c) => {
      const na = 1 - a;
      const o = b | c;
      const y = na & o;
      return { y, g: [na, o], steps: { en: `NOT A = ${na}; B OR C = ${o}; ${na} AND ${o} = ${y}`, ru: `НЕ A = ${na}; B ИЛИ C = ${o}; ${na} И ${o} = ${y}`, kk: `ЕМЕС A = ${na}; B НЕМЕСЕ C = ${o}; ${na} ЖӘНЕ ${o} = ${y}` } };
    },
  },
  {
    f: '(A ⊕ B) ∧ ¬C',
    eval: (a, b, c) => {
      const x = a ^ b;
      const nc = 1 - c;
      const y = x & nc;
      return { y, g: [x, nc], steps: { en: `A XOR B = ${x}; NOT C = ${nc}; ${x} AND ${nc} = ${y}`, ru: `A XOR B = ${x}; НЕ C = ${nc}; ${x} И ${nc} = ${y}`, kk: `A XOR B = ${x}; ЕМЕС C = ${nc}; ${x} ЖӘНЕ ${nc} = ${y}` } };
    },
  },
];

/** Схема из двух-трёх элементов с подсвеченными проводами. */
function circuitSvg(ci, [A, B, C], lamp, wire, hide = false) {
  const r = CIRCUITS[ci].eval(A, B, C);
  // В задании промежуточные значения скрыты - их надо вычислить самому.
  const val = (x, y, b) => (hide ? '' : `<text class="exh-f10 tc ${b ? 'exc-o' : 'exc-m'}" x="${x}" y="${y}">${b}</text>`);
  const w0 = wire;
  wire = (d, b) => w0(d, hide && !/^M40 /.test(d) ? 0 : b);
  const k = (i) => (hide ? '' : `in${i}`);
  let s = lamp(28, 50, A, k(0), 'A') + lamp(28, 100, B, k(1), 'B') + lamp(28, 150, C, k(2), 'C');
  let oy;
  if (ci === 0) {
    s += wire('M40 50 H70 V63 H90', A) + wire('M40 100 H70 V87 H90', B) + wire('M140 75 H165 V100 H190', r.g[0]) + wire('M40 150 H165 V124 H190', C);
    s += gateShape('AND', 90, 51, 50, 48) + gateShape('OR', 190, 88, 50, 48) + val(152, 70, r.g[0]);
    oy = 112;
  } else if (ci === 1) {
    s += wire('M40 50 H70', A) + wire('M110 50 H165 V75 H190', r.g[0]) + wire('M40 100 H70 V113 H90', B) + wire('M40 150 H70 V137 H90', C) + wire('M140 125 H165 V99 H190', r.g[1]);
    s += gateShape('NOT', 70, 36, 40, 28) + gateShape('OR', 90, 101, 50, 48) + gateShape('AND', 190, 63, 50, 48) + val(150, 45, r.g[0]) + val(152, 120, r.g[1]);
    oy = 87;
  } else {
    s += wire('M40 50 H70 V63 H90', A) + wire('M40 100 H70 V87 H90', B) + wire('M140 75 H165 V100 H190', r.g[0]) + wire('M40 150 H90', C) + wire('M130 150 H165 V124 H190', r.g[1]);
    s += gateShape('XOR', 90, 51, 50, 48) + gateShape('NOT', 90, 136, 40, 28) + gateShape('AND', 190, 88, 50, 48) + val(152, 70, r.g[0]) + val(150, 145, r.g[1]);
    oy = 112;
  }
  s += wire(`M240 ${oy} H268`, hide ? 0 : r.y);
  s += hide ? `<circle class="ex-lamp" cx="282" cy="${oy}" r="12"/><text class="exh-f13" x="282" y="${oy + 4.5}">?</text>` : lamp(282, oy, r.y, '', 'Y');
  if (!hide) s += `<text class="exh-f12 exh-mono ex-end tc exc-p" x="314" y="18">${esc(`Y = ${CIRCUITS[ci].f}`)}</text>`;
  return s;
}

function gateQuiz(st) {
  const t = st.qn++ % 2;
  if (t === 0) {
    const g = pick([0, 1, 3, 4, 5]);
    const opts = shuffle([g, ...shuffle([0, 1, 3, 4, 5].filter((x) => x !== g)).slice(0, 3)]);
    return { t, g, ans: g, opts, pick: -1, done: false, ok: false };
  }
  const c = rnd(3);
  const inp = [rnd(2), rnd(2), rnd(2)];
  return { t, c, in: inp, ans: CIRCUITS[c].eval(...inp).y, opts: [0, 1], pick: -1, done: false, ok: false };
}

// ---------- Часовые пояса ----------

/** Города: долгота и стандартный (зимний) пояс UTC. Казахстан с 1 марта 2024 г. - UTC+5. */
const TZ_CITIES = [
  { n: L('Los Angeles', 'Лос-Анджелес', 'Лос-Анджелес'), lon: -118, o: -8 },
  { n: L('New York', 'Нью-Йорк', 'Нью-Йорк'), lon: -74, o: -5 },
  { n: L('Rio de Janeiro', 'Рио-де-Жанейро', 'Рио-де-Жанейро'), lon: -43, o: -3 },
  { n: L('London', 'Лондон', 'Лондон'), lon: 0, o: 0 },
  { n: L('Paris', 'Париж', 'Париж'), lon: 2, o: 1 },
  { n: L('Cairo', 'Каир', 'Каир'), lon: 31, o: 2 },
  { n: L('Moscow', 'Москва', 'Мәскеу'), lon: 38, o: 3 },
  { n: L('Dubai', 'Дубай', 'Дубай'), lon: 55, o: 4 },
  { n: L('Astana', 'Астана', 'Астана'), lon: 71, o: 5 },
  { n: L('Delhi', 'Дели', 'Дели'), lon: 77, o: 5.5 },
  { n: L('Beijing', 'Пекин', 'Бейжің'), lon: 116, o: 8 },
  { n: L('Tokyo', 'Токио', 'Токио'), lon: 140, o: 9 },
  { n: L('Sydney', 'Сидней', 'Сидней'), lon: 151, o: 10 },
  { n: L('Auckland', 'Окленд', 'Окленд'), lon: 175, o: 12 },
];
const TZ_DAYS = [L('Mon', 'пн', 'дс'), L('Tue', 'вт', 'сс'), L('Wed', 'ср', 'ср'), L('Thu', 'чт', 'бс'), L('Fri', 'пт', 'жм'), L('Sat', 'сб', 'сн'), L('Sun', 'вс', 'жс')];
const tzOff = (o) => (o === 0 ? '' : `${o > 0 ? '+' : '−'}${hhmm(Math.abs(o)).replace(/^0/, '').replace(':00', '')}`);
const tzHours = (h) => `${String(h).replace('.', getLang() === 'en' ? '.' : ',')} ${u('h', 'ч', 'сағ')}`;

function tzQuiz() {
  let a = rnd(14);
  let b = rnd(14);
  while (b === a || TZ_CITIES[a].o === TZ_CITIES[b].o) b = rnd(14);
  const A = TZ_CITIES[a];
  const B = TZ_CITIES[b];
  const t = 6 + rnd(17); // местное время в городе A, понедельник
  const right = t + B.o - A.o;
  const cand = [right, t - (B.o - A.o), right + 1, right - 1, right + 24, right - 24];
  const opts = [];
  for (const x of cand) if (opts.length < 4 && !opts.some((y) => y === x)) opts.push(x);
  const sh = shuffle(opts);
  return { a, b, t, opts: sh, ans: sh.indexOf(right), pick: -1, done: false, ok: false };
}
/** «10:00, вт» - время и день недели (t - часы от начала понедельника). */
const tzWhen = (t) => `${hhmm(t)}, ${tx(TZ_DAYS[((Math.floor(t / 24) % 7) + 7) % 7])}`;

function tzQuizDraw(st) {
  const q = st.q;
  const A = TZ_CITIES[q.a];
  const B = TZ_CITIES[q.b];
  const d = B.o - A.o;
  let s = `<text class="exh-f13 ex-start" x="8" y="16">${esc(u('What time is it there?', 'Который там час?', 'Онда сағат неше?'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
  s += `<rect class="exh-card" x="6" y="26" width="308" height="70" rx="10"/><text class="exh-f13" x="160" y="50">${esc(`${tx(A.n)} (UTC${tzOff(A.o)}): ${tzWhen(q.t)}`)}</text><text class="exh-f13" x="160" y="76">${esc(`${tx(B.n)} (UTC${tzOff(B.o)}): ?`)}</text>`;
  q.opts.forEach((o, i) => {
    const cls = q.done ? (i === q.ans ? 'ok' : i === q.pick ? 'bad' : '') : '';
    s += chip(i % 2 ? 164 : 8, i < 2 ? 106 : 144, 148, 30, tzWhen(o), `o${i}`, cls, 14);
  });
  if (q.done) s += `<text class="exh-f12 tc exc-p" x="160" y="200">${esc(`${tzWhen(q.t)} ${d >= 0 ? '+' : '−'} ${tzHours(Math.abs(d))} = ${tzWhen(q.t + d)}`)}</text>`;
  return {
    svg: s,
    caption: !q.done
      ? L(`The difference of the zones is UTC${tzOff(B.o) || '+0'} minus UTC${tzOff(A.o) || '+0'}. Tap the time and day in ${tx(B.n, 'en')}.`, `Разница поясов: UTC${tzOff(B.o) || '+0'} минус UTC${tzOff(A.o) || '+0'}. Нажми время и день в городе ${tx(B.n, 'ru')}.`, `Белдеулер айырмасы: UTC${tzOff(B.o) || '+0'} алу UTC${tzOff(A.o) || '+0'}. ${tx(B.n, 'kk')} қаласындағы уақыт пен күнді бас.`)
      : L(`${q.ok ? '✓ Right' : '✗ No'}: ${tx(B.n, 'en')} is ${d >= 0 ? 'ahead' : 'behind'} by ${Math.abs(d)} h, so ${tzWhen(q.t + d)}.`, `${q.ok ? '✓ Верно' : '✗ Нет'}: ${tx(B.n, 'ru')} ${d >= 0 ? 'впереди' : 'позади'} на ${String(Math.abs(d)).replace('.', ',')} ч, значит ${tzWhen(q.t + d)}.`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: ${tx(B.n, 'kk')} ${String(Math.abs(d)).replace('.', ',')} сағ ${d >= 0 ? 'алда' : 'артта'}, демек ${tzWhen(q.t + d)}.`),
  };
}

// ---------- Времена года ----------

/** Склонение Солнца в день года d (приближённо). */
const sunDec = (d) => 23.44 * Math.sin((2 * Math.PI * (284 + d)) / 365);
/** Длина дня в часах на широте lat при склонении dec. */
function dayLen(lat, dec) {
  const c = -Math.tan((lat * Math.PI) / 180) * Math.tan((dec * Math.PI) / 180);
  return c <= -1 ? 24 : c >= 1 ? 0 : (24 / Math.PI) * Math.acos(c);
}
/** «22 июн» по номеру дня года. */
function seasonDate(d) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let x = clamp(Math.round(d), 1, 365);
  let m = 0;
  while (x > days[m]) x -= days[m++];
  const MON = u('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec', 'янв фев мар апр мая июн июл авг сен окт ноя дек', 'қаң ақп нау сәу мам мау шіл там қыр қаз қар жел').split(' ');
  return `${x} ${MON[m]}`;
}

const SEASON_DAYS = [
  [L('21 March', '21 марта', '21 наурыз'), 0],
  [L('22 June', '22 июня', '22 маусым'), 23.4],
  [L('23 September', '23 сентября', '23 қыркүйек'), 0],
  [L('22 December', '22 декабря', '22 желтоқсан'), -23.4],
];
const SEASON_PLACES = [
  [L('the equator', 'экватор', 'экватор'), 0],
  [L('Almaty', 'Алматы', 'Алматы'), 43],
  [L('Astana', 'Астана', 'Астана'), 51],
  [L('Moscow', 'Москва', 'Мәскеу'), 56],
  [L('Cairo', 'Каир', 'Каир'), 30],
  [L('the Tropic of Cancer', 'северный тропик', 'солтүстік тропик'), 23.4],
  [L('the Arctic Circle', 'полярный круг', 'полярлық шеңбер'), 66.6],
  [L('Petropavl', 'Петропавловск', 'Петропавл'), 55],
];

function seasonQuiz() {
  const [dn, dec] = pick(SEASON_DAYS);
  const [pn, lat] = pick(SEASON_PLACES);
  const right = Math.round((90 - Math.abs(lat - dec)) * 10) / 10;
  const cand = [right, Math.round((90 - lat) * 10) / 10, Math.round((90 - lat - dec) * 10) / 10, Math.round((90 - Math.abs(lat + dec)) * 10) / 10, Math.round((lat + 23.4) * 10) / 10, right + 10];
  const opts = [];
  for (const x of cand) if (opts.length < 4 && x >= 0 && x <= 90 && !opts.includes(x)) opts.push(x);
  while (opts.length < 4) opts.push(Math.round((right + 5 * opts.length) % 90));
  const sh = shuffle(opts);
  return { dn, dec, pn, lat, right, opts: sh, ans: sh.indexOf(right), pick: -1, done: false, ok: false };
}

function seasonQuizDraw(st) {
  const q = st.q;
  let s = `<text class="exh-f13 ex-start" x="8" y="16">${esc(u('Height of the noon Sun', 'Высота Солнца в полдень', 'Түстегі Күн биіктігі'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
  s += `<rect class="exh-card" x="6" y="26" width="308" height="66" rx="10"/><text class="exh-f13" x="160" y="50">${esc(`${tx(q.dn)}, ${tx(q.pn)} (φ = ${fmt(q.lat, 1)}° ${u('N', 'с. ш.', 'с. е.')})`)}</text><text class="exh-f12 tc exc-m" x="160" y="74">${esc(`h = ?   ${u('Sun declination', 'склонение Солнца', 'Күн ауытқуы')} δ = ${fmt(q.dec, 1)}°`)}</text>`;
  q.opts.forEach((o, i) => {
    const cls = q.done ? (i === q.ans ? 'ok' : i === q.pick ? 'bad' : '') : '';
    s += chip(i % 2 ? 164 : 8, i < 2 ? 102 : 140, 148, 30, `${fmt(o, 1)}°`, `o${i}`, cls, 15);
  });
  if (q.done) s += `<text class="exh-f13 tc exc-p" x="160" y="200">${esc(`h = 90° − |${fmt(q.lat, 1)}° − (${fmt(q.dec, 1)}°)| = ${fmt(q.right, 1)}°`)}</text>`;
  return {
    svg: s,
    caption: !q.done
      ? L('Use h = 90° − |φ − δ|: φ is the latitude, δ is the Sun’s declination on that day (+23.4° on 22 June, 0° at the equinoxes, −23.4° on 22 December).', 'Формула h = 90° − |φ − δ|: φ - широта, δ - склонение Солнца в этот день (+23,4° 22 июня, 0° в равноденствия, −23,4° 22 декабря).', 'h = 90° − |φ − δ| формуласы: φ - ендік, δ - сол күнгі Күн ауытқуы (22 маусымда +23,4°, күн теңелулерде 0°, 22 желтоқсанда −23,4°).')
      : L(`${q.ok ? '✓ Right' : '✗ No'}: h = 90° − |${fmt(q.lat, 1)}° − (${fmt(q.dec, 1)}°)| = ${fmt(q.right, 1)}°.`, `${q.ok ? '✓ Верно' : '✗ Нет'}: h = 90° − |${fmt(q.lat, 1)}° − (${fmt(q.dec, 1)}°)| = ${fmt(q.right, 1)}°.`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: h = 90° − |${fmt(q.lat, 1)}° − (${fmt(q.dec, 1)}°)| = ${fmt(q.right, 1)}°.`),
  };
}

// ---------- Масштаб: схематичная карта Казахстана ----------

const MAP_U = 9.6; // 1 см карты в единицах рисунка; масштаб рисунка 1 : 10 000 000
const MAP_KPD = 111.32 / (100 / MAP_U); // единиц на градус широты
const mapXY = (c) => [n1(12 + (c.lon - 46.5) * MAP_KPD * Math.cos((48 * Math.PI) / 180)), n1(40 + (55.5 - c.lat) * MAP_KPD)];
const MAP_CITIES = [
  { n: L('Astana', 'Астана', 'Астана'), lon: 71.45, lat: 51.17, up: true },
  { n: L('Almaty', 'Алматы', 'Алматы'), lon: 76.95, lat: 43.25 },
  { n: L('Shymkent', 'Шымкент', 'Шымкент'), lon: 69.6, lat: 42.32 },
  { n: L('Karaganda', 'Караганда', 'Қарағанды'), lon: 73.1, lat: 49.8 },
  { n: L('Aktobe', 'Актобе', 'Ақтөбе'), lon: 57.2, lat: 50.28 },
  { n: L('Atyrau', 'Атырау', 'Атырау'), lon: 51.9, lat: 47.1 },
  { n: L('Aktau', 'Актау', 'Ақтау'), lon: 51.2, lat: 43.65 },
  { n: L('Oskemen', 'Усть-Каменогорск', 'Өскемен'), lon: 82.6, lat: 49.95, end: true, up: true },
  { n: L('Pavlodar', 'Павлодар', 'Павлодар'), lon: 76.95, lat: 52.3, up: true },
  { n: L('Kostanay', 'Костанай', 'Қостанай'), lon: 63.6, lat: 53.2, up: true },
  { n: L('Oral', 'Уральск', 'Орал'), lon: 51.4, lat: 51.2, up: true },
  { n: L('Kyzylorda', 'Кызылорда', 'Қызылорда'), lon: 65.5, lat: 44.85 },
];
/** Контур Казахстана (упрощённый, долгота/широта). */
const KZ_OUTLINE = [
  [48.9, 46.2], [47.4, 47.6], [46.5, 48.4], [46.7, 49.4], [47.3, 50.4], [48.8, 50.6], [49.8, 51.7], [52, 51.6], [54.5, 51], [55.7, 50.6], [57, 51.1], [58.5, 51], [60, 50.8], [61.4, 50.8], [61, 52.6], [61, 53.9], [62.5, 54], [65, 54.6], [68, 54.9], [69, 55.4], [70.8, 55.2], [71.2, 54.1], [73, 54.1], [73.5, 53.6], [76.2, 54.3], [78, 52.9], [80, 51.3], [83.5, 51], [85, 50], [87.3, 49.2], [85.5, 47.1], [83, 47.2], [82.3, 45.5], [80, 45], [80.4, 44], [80.3, 42.8], [79, 42.8], [77.5, 42.9], [75, 42.9], [73.5, 42.5], [71, 42.8], [70.4, 42.2], [69, 41.4], [68, 40.7], [66.5, 41.8], [66, 42.9], [64.5, 43.6], [62, 43.5], [61, 44.2], [58.5, 45.6], [56, 45], [56, 41.3], [54.5, 42], [52.7, 42.3], [51.3, 43.2], [51.2, 43.6], [50.3, 44.6], [51.5, 45], [53, 45.3], [53.3, 46.5], [52, 46.9], [51, 47], [49.5, 46.5],
];
const mapOutline = () => `M${KZ_OUTLINE.map(([lon, lat]) => mapXY({ lon, lat }).join(' ')).join(' L')} Z`;
function haversine(a, b) {
  const R = 6371;
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const MAP_SCALES = [10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000];
const num = (x) => x.toLocaleString('ru-RU').replace(/ /g, ' ');
/** «250 м» или «50 км» - сколько на местности в 1 см. */
const perCm = (N) => (N >= 100000 ? `${num(N / 100000)} ${u('km', 'км', 'км')}` : `${num(N / 100)} ${u('m', 'м', 'м')}`);
const groundTxt = (N, cm) => {
  const m = (N * cm) / 100;
  return m >= 1000 ? `${fmt(m / 1000, 2)} ${u('km', 'км', 'км')}` : `${fmt(m, 0)} ${u('m', 'м', 'м')}`;
};

function mapCalc(v) {
  const N = MAP_SCALES[clamp(Math.round(v.sc), 0, 9)];
  const cm = v.cm;
  const unit = 14;
  const len = Math.min(cm * unit, 300);
  let s = `<text class="exh-f22" x="160" y="30">1 : ${num(N)}</text><text class="exh-f13 tc exc-m" x="160" y="52">${esc(`${u('named', 'именованный', 'атаулы')}: ${u('1 cm =', 'в 1 см', '1 см-де')} ${perCm(N)}`)}</text>`;
  s += `<text class="exh-f11 tc exc-m" x="160" y="74">${esc(`1 ${u('cm', 'см', 'см')} = ${num(N)} ${u('cm', 'см', 'см')} = ${num(N / 100)} ${u('m', 'м', 'м')}${N >= 100000 ? ` = ${num(N / 100000)} ${u('km', 'км', 'км')}` : ''}`)}</text>`;
  // Отрезок на карте и линейка в сантиметрах.
  s += `<circle class="ex-fill exc-r" cx="10" cy="104" r="5"/><circle class="ex-fill exc-r" cx="${n1(10 + len)}" cy="104" r="5"/><line class="ex-stroke exc-p ex-dash" style="stroke-width:2" x1="10" y1="104" x2="${n1(10 + len)}" y2="104"/>`;
  s += `<line class="ex-axis" x1="10" y1="122" x2="310" y2="122"/>`;
  for (let k = 0; k <= 21 && k * unit <= 300; k++) s += `<line class="ex-axis" x1="${10 + k * unit}" y1="122" x2="${10 + k * unit}" y2="${k % 5 ? 127 : 131}"/>${k % 5 ? '' : `<text class="exh-f9 tc exc-m" x="${10 + k * unit}" y="141">${k}</text>`}`;
  s += `<text class="exh-f9 ex-end tc exc-m" x="312" y="141">${esc(u('cm', 'см', 'см'))}</text>`;
  // Линейный масштаб: 0 - 1 - 2 - 3 см с подписями расстояний.
  // Линейный масштаб: 4 отрезка по 1 см (40 единиц), подписи в одних единицах.
  const inKm = N * 4 >= 100000;
  s += [0, 1, 2, 3].map((k) => `<rect class="ex-fill ${k % 2 ? 'exc-m' : 'exc-p'}" x="${60 + k * 40}" y="160" width="40" height="7" style="opacity:${k % 2 ? 0.35 : 0.7}"/>`).join('') + [0, 1, 2, 3, 4].map((k) => `<text class="exh-f9 tc exc-m" x="${60 + k * 40}" y="181">${esc(fmt(inKm ? (N * k) / 100000 : (N * k) / 100, 2))}</text>`).join('') + `<text class="exh-f9 ex-start tc exc-m" x="226" y="166">${esc(inKm ? u('km', 'км', 'км') : u('m', 'м', 'м'))}</text><text class="exh-f9 ex-end tc exc-m" x="54" y="167">${esc(u('linear', 'линейный', 'сызықтық'))}</text>`;
  s += `<text class="exh-f15 tc exc-p" x="160" y="208">${esc(`${fmt(cm, 1)} ${u('cm', 'см', 'см')} × ${perCm(N)} = ${groundTxt(N, cm)}`)}</text>`;
  return {
    svg: s,
    caption: L(
      `Numeric scale 1 : ${num(N)} → named scale «1 cm = ${perCm(N)}» (drop two zeros to get metres, five zeros to get kilometres). ${fmt(cm, 1)} cm on the map = ${groundTxt(N, cm)} on the ground. The bigger the second number, the smaller the scale.`,
      `Численный масштаб 1 : ${num(N)} → именованный «в 1 см ${perCm(N)}» (зачеркни два нуля - получишь метры, пять нулей - километры). ${fmt(cm, 1)} см на карте = ${groundTxt(N, cm)} на местности. Чем больше второе число, тем мельче масштаб.`,
      `Сандық масштаб 1 : ${num(N)} → атаулы «1 см-де ${perCm(N)}» (екі нөлді өшірсең - метр, бес нөлді - километр). Картадағы ${fmt(cm, 1)} см = жердегі ${groundTxt(N, cm)}. Екінші сан неғұрлым үлкен болса, масштаб соғұрлым ұсақ.`,
    ),
  };
}

function mapQuiz(st) {
  const t = st.qn++ % 3;
  const N = pick([100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]);
  const kmCm = N / 100000;
  let ask;
  let right;
  let wrong;
  let fmtO;
  if (t === 0) {
    const cm = pick([2, 3, 4, 5, 6, 7, 8, 1.5, 2.5]);
    right = cm * kmCm;
    wrong = [cm * kmCm * 10, cm * kmCm / 10, cm + kmCm];
    ask = L(`Scale 1 : ${num(N)}. On the map it is ${String(cm)} cm. How far is it on the ground?`, `Масштаб 1 : ${num(N)}. На карте ${String(cm).replace('.', ',')} см. Сколько это на местности?`, `Масштаб 1 : ${num(N)}. Картада ${String(cm).replace('.', ',')} см. Жерде бұл қанша?`);
    fmtO = (x) => `${fmt(x, 2)} ${u('km', 'км', 'км')}`;
  } else if (t === 1) {
    const cm = pick([2, 3, 4, 5, 6, 8]);
    const km = cm * kmCm;
    right = cm;
    wrong = [km * kmCm, cm * 10, cm / 10];
    ask = L(`Scale: 1 cm = ${fmt(kmCm, 2)} km. The distance is ${fmt(km, 2)} km. How long is it on the map?`, `Масштаб: в 1 см ${fmt(kmCm, 2)} км. Расстояние ${fmt(km, 2)} км. Сколько это на карте?`, `Масштаб: 1 см-де ${fmt(kmCm, 2)} км. Қашықтық ${fmt(km, 2)} км. Картада бұл қанша?`);
    fmtO = (x) => `${fmt(x, 2)} ${u('cm', 'см', 'см')}`;
  } else {
    right = N;
    wrong = [N * 10, N / 10, N * 100];
    ask = L(`Named scale: 1 cm = ${perCm(N)}. Which numeric scale is it?`, `Именованный масштаб: в 1 см ${perCm(N)}. Какой это численный масштаб?`, `Атаулы масштаб: 1 см-де ${perCm(N)}. Бұл қандай сандық масштаб?`);
    fmtO = (x) => `1 : ${num(x)}`;
  }
  const opts = shuffle([right, ...wrong.filter((x) => x !== right)].slice(0, 4));
  return { t, N, ask, opts, ans: opts.indexOf(right), fmtO, pick: -1, done: false, ok: false };
}

function mapQuizDraw(st) {
  const q = st.q;
  let s = `<text class="exh-f13 ex-start" x="8" y="16">${esc(u('Scale problem', 'Задача на масштаб', 'Масштабқа есеп'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
  const tl = wrap(tx(q.ask), 44, 3);
  s += `<rect class="exh-card" x="6" y="26" width="308" height="66" rx="10"/>${lines(tl, 160, 63 - (tl.length - 1) * 8, 16, 'exh-f12')}`;
  q.opts.forEach((o, i) => {
    const cls = q.done ? (i === q.ans ? 'ok' : i === q.pick ? 'bad' : '') : '';
    s += chip(i % 2 ? 164 : 8, i < 2 ? 102 : 140, 148, 30, q.fmtO(o), `o${i}`, cls, 13);
  });
  const how = [
    L(`1 cm = ${perCm(q.N)}, so multiply the centimetres by ${num(q.N / 100000)}.`, `В 1 см ${perCm(q.N)}, значит умножаем сантиметры на ${num(q.N / 100000)}.`, `1 см-де ${perCm(q.N)}, демек сантиметрді ${num(q.N / 100000)}-ге көбейтеміз.`),
    L(`Divide the kilometres by ${num(q.N / 100000)} km per cm.`, `Делим километры на ${num(q.N / 100000)} км в 1 см.`, `Километрді 1 см-дегі ${num(q.N / 100000)} км-ге бөлеміз.`),
    L(`${perCm(q.N)} = ${num(q.N)} cm, so the scale is 1 : ${num(q.N)}.`, `${perCm(q.N)} = ${num(q.N)} см, значит масштаб 1 : ${num(q.N)}.`, `${perCm(q.N)} = ${num(q.N)} см, демек масштаб 1 : ${num(q.N)}.`),
  ][q.t];
  if (q.done) s += lines(wrap(tx(how), 50, 2), 160, 196, 14, 'exh-f11 tc exc-p');
  return {
    svg: s,
    caption: !q.done ? L(`${q.ask.en} Tap the answer.`, `${q.ask.ru} Нажми на ответ.`, `${q.ask.kk} Жауапты бас.`) : L(`${q.ok ? '✓ Right' : '✗ No'}: ${how.en}`, `${q.ok ? '✓ Верно' : '✗ Нет'}: ${how.ru}`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: ${how.kk}`),
  };
}

// ---------- Объём информации ----------

const DL_DEPTH = [1, 2, 4, 8, 16, 24];
const DL_RATE = [8000, 11025, 22050, 44100, 48000];
/** Число для лестницы единиц: целое с пробелами или до 2 знаков. */
const dlNum = (x) => (x >= 1000 ? Math.round(x).toLocaleString('ru-RU').replace(/ /g, ' ') : fmt(x, x >= 10 ? 1 : 2));
/** «6 220 800 байт ≈ 5,93 МБ». */
function dlBits(b) {
  const B = b / 8;
  const units = [[1024 ** 3, u('GB', 'ГБ', 'ГБ')], [1024 ** 2, u('MB', 'МБ', 'МБ')], [1024, u('KB', 'КБ', 'КБ')]];
  const [k, nm] = units.find(([k]) => B >= k) ?? [1, u('bytes', 'байт', 'байт')];
  return `${dlNum(b)} ${u('bits', 'бит', 'бит')} = ${dlNum(B)} ${u('bytes', 'байт', 'байт')}${k > 1 ? ` ≈ ${fmt(B / k, 2)} ${nm}` : ''}`;
}
/** «1 мин 52 с». */
function dlTime(t) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.round(t % 60);
  return [h ? `${h} ${u('h', 'ч', 'сағ')}` : '', m ? `${m} ${u('min', 'мин', 'мин')}` : '', `${s} ${u('s', 'с', 'с')}`].filter(Boolean).join(' ');
}

function dlQuiz(st) {
  const t = st.qn++ % 3;
  let ask;
  let right;
  let wrong;
  let unit;
  let how;
  if (t === 0) {
    const w = pick([32, 64, 128, 256]);
    const h = pick([32, 64, 128]);
    const i = pick([1, 2, 4, 8]);
    right = (w * h * i) / 8 / 1024;
    wrong = [right * 8, right / 2, (w * h * i) / 1024];
    ask = L(`A picture ${w}×${h} pixels with ${2 ** i} colours. How many KB?`, `Картинка ${w}×${h} пикселей, ${2 ** i} цветов. Сколько это КБ?`, `${w}×${h} пиксельді, ${2 ** i} түсті сурет. Бұл қанша КБ?`);
    unit = u('KB', 'КБ', 'КБ');
    how = L(`${2 ** i} colours → i = ${i} bit; ${w}·${h}·${i} = ${w * h * i} bits = ${(w * h * i) / 8} bytes = ${fmt(right, 2)} KB.`, `${2 ** i} цветов → i = ${i} бит; ${w}·${h}·${i} = ${w * h * i} бит = ${(w * h * i) / 8} байт = ${fmt(right, 2)} КБ.`, `${2 ** i} түс → i = ${i} бит; ${w}·${h}·${i} = ${w * h * i} бит = ${(w * h * i) / 8} байт = ${fmt(right, 2)} КБ.`);
  } else if (t === 1) {
    const K = pick([512, 1024, 2048, 4096, 8192]);
    const i = pick([8, 16]);
    right = (K * i) / 8 / 1024;
    wrong = [right * 8, i === 16 ? right / 2 : right * 2, (K * i) / 1024];
    ask = L(`A text of ${K} characters, ${i === 16 ? 'Unicode (16 bits per character)' : '8 bits per character'}. How many KB?`, `Текст из ${K} символов, ${i === 16 ? 'Unicode (16 бит на символ)' : '8 бит на символ'}. Сколько это КБ?`, `${K} таңбалы мәтін, ${i === 16 ? 'Unicode (таңбаға 16 бит)' : 'таңбаға 8 бит'}. Бұл қанша КБ?`);
    unit = u('KB', 'КБ', 'КБ');
    how = L(`${K}·${i} = ${K * i} bits = ${(K * i) / 8} bytes = ${fmt(right, 2)} KB.`, `${K}·${i} = ${K * i} бит = ${(K * i) / 8} байт = ${fmt(right, 2)} КБ.`, `${K}·${i} = ${K * i} бит = ${(K * i) / 8} байт = ${fmt(right, 2)} КБ.`);
  } else {
    const sp = pick([10, 20, 40, 50, 100]);
    const size = pick([5, 10, 25, 50, 100]);
    right = (size * 8) / sp;
    wrong = [size / sp, right * 8, (size * 1024) / sp];
    ask = L(`A file of ${size} MB, speed ${sp} Mbit/s (take 1 MB = 8 Mbit). How many seconds?`, `Файл ${size} МБ, скорость ${sp} Мбит/с (считаем 1 МБ = 8 Мбит). Сколько секунд?`, `Файл ${size} МБ, жылдамдық ${sp} Мбит/с (1 МБ = 8 Мбит деп аламыз). Неше секунд?`);
    unit = u('s', 'с', 'с');
    how = L(`${size}·8 = ${size * 8} Mbit; ${size * 8} / ${sp} = ${fmt(right, 2)} s.`, `${size}·8 = ${size * 8} Мбит; ${size * 8} / ${sp} = ${fmt(right, 2)} с.`, `${size}·8 = ${size * 8} Мбит; ${size * 8} / ${sp} = ${fmt(right, 2)} с.`);
  }
  const opts = [right];
  for (const x of wrong) if (opts.length < 4 && !opts.includes(x)) opts.push(x);
  while (opts.length < 4) opts.push(right * (opts.length + 1));
  const sh = shuffle(opts);
  return { ask, how, unit, opts: sh, ans: sh.indexOf(right), pick: -1, done: false, ok: false };
}

function dlQuizDraw(st) {
  const q = st.q;
  let s = `<text class="exh-f13 ex-start" x="8" y="16">${esc(u('Count the volume', 'Посчитай объём', 'Көлемді есепте'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
  const tl = wrap(tx(q.ask), 42, 3);
  s += `<rect class="exh-card" x="6" y="26" width="308" height="66" rx="10"/>${lines(tl, 160, 63 - (tl.length - 1) * 8, 16, 'exh-f12')}`;
  q.opts.forEach((o, i) => {
    const cls = q.done ? (i === q.ans ? 'ok' : i === q.pick ? 'bad' : '') : '';
    s += chip(i % 2 ? 164 : 8, i < 2 ? 102 : 140, 148, 30, `${fmt(o, 2)} ${q.unit}`, `o${i}`, cls, 14);
  });
  if (q.done) s += lines(wrap(tx(q.how), 50, 2), 160, 194, 14, 'exh-f11 tc exc-p');
  return {
    svg: s,
    caption: !q.done ? L(`${q.ask.en} Tap the answer.`, `${q.ask.ru} Нажми на ответ.`, `${q.ask.kk} Жауапты бас.`) : L(`${q.ok ? '✓ Right' : '✗ No'}: ${q.how.en}`, `${q.ok ? '✓ Верно' : '✗ Нет'}: ${q.how.ru}`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: ${q.how.kk}`),
  };
}

// ---------- Деление с остатком ----------

/** Частное и остаток: Python (lang 0) округляет вниз, C++/JS/Java - к нулю. */
function dmCalc(a, b, lang) {
  const q = lang === 0 ? Math.floor(a / b) : Math.trunc(a / b);
  return [q, a - b * q];
}
function dmCode(lg, a, b) {
  const [q, r] = dmCalc(a, b, lg);
  const neg = a < 0;
  return [
    [`q = ${a} // ${b}    # ${q}`, `r = ${a} % ${b}     # ${r}`],
    [`int q = ${a} / ${b};    // ${q}`, `int r = ${a} % ${b};    // ${r}`],
    [`let q = Math.${neg ? 'trunc' : 'floor'}(${a} / ${b});  // ${q}`, `let r = ${a} % ${b};  // ${r}`],
    [`int q = ${a} / ${b};    // ${q}`, `int r = ${a} % ${b};    // ${r}`],
  ][lg];
}
function dmDigitsCode(lg, n) {
  return [
    [`n = ${n}`, 'units = n % 10', 'tens = n // 10 % 10', 'hundreds = n // 100 % 10', 'thousands = n // 1000'],
    [`int n = ${n};`, 'int units = n % 10;', 'int tens = n / 10 % 10;', 'int hundreds = n / 100 % 10;', 'int thousands = n / 1000;'],
    [`let n = ${n};`, 'let units = n % 10;', 'let tens = Math.floor(n / 10) % 10;', 'let hundreds = Math.floor(n / 100) % 10;', 'let thousands = Math.floor(n / 1000);'],
    [`int n = ${n};`, 'int units = n % 10;', 'int tens = n / 10 % 10;', 'int hundreds = n / 100 % 10;', 'int thousands = n / 1000;'],
  ][lg];
}
function dmTimeCode(lg, m) {
  return [
    [`m = ${m}`, 'h = m // 60', 'mm = m % 60'],
    [`int m = ${m};`, 'int h = m / 60;', 'int mm = m % 60;'],
    [`let m = ${m};`, 'let h = Math.floor(m / 60);', 'let mm = m % 60;'],
    [`int m = ${m};`, 'int h = m / 60;', 'int mm = m % 60;'],
  ][lg];
}

function dmQuiz(st) {
  const lg = st.lang;
  const b = 2 + rnd(8);
  const a = rnd(3) ? 5 + rnd(55) : -(1 + rnd(30));
  const [q, r] = dmCalc(a, b, lg);
  const [q2, r2] = dmCalc(a, b, lg ? 0 : 1);
  const right = `${q} ${r}`;
  const opts = [right];
  for (const o of [`${q2} ${r2}`, `${r} ${q}`, `${q + 1} ${r}`, `${q} ${b - Math.abs(r)}`, `${q - 1} ${r + 1}`]) if (opts.length < 4 && !opts.includes(o)) opts.push(o);
  const sh = shuffle(opts);
  const code = [`print(${a} // ${b}, ${a} % ${b})`, `cout << ${a} / ${b} << " " << ${a} % ${b};`, `console.log(Math.trunc(${a} / ${b}), ${a} % ${b});`, `System.out.println(${a} / ${b} + " " + ${a} % ${b});`][lg];
  return { a, b, q, r, code, opts: sh, ans: sh.indexOf(right), pick: -1, done: false, ok: false };
}
function dmQuizDraw(st) {
  const q = st.q;
  let s = `<text class="exh-f13 ex-start" x="8" y="16">${esc(u('What will it print?', 'Что выведет программа?', 'Бағдарлама не шығарады?'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
  s += codePanel([q.code], [], 26);
  q.opts.forEach((o, i) => {
    const cls = q.done ? (i === q.ans ? 'ok' : i === q.pick ? 'bad' : '') : '';
    s += chip(i % 2 ? 164 : 8, i < 2 ? 66 : 104, 148, 30, o, `o${i}`, cls, 15);
  });
  if (q.done) s += `<text class="exh-f14" x="160" y="170">${q.a} = ${q.b} · (${q.q}) + ${q.r}</text>`;
  const pyNote = st.lang === 0 && q.a < 0;
  return {
    svg: s,
    caption: !q.done
      ? L('Work out the quotient and the remainder in this language, then tap the output.', 'Найди частное и остаток по правилам этого языка и нажми, что будет выведено.', 'Осы тілдің ережесімен бөлінді мен қалдықты тауып, шығатынын бас.')
      : L(`${q.ok ? '✓ Right' : '✗ No'}: ${q.q} and ${q.r}, because ${q.a} = ${q.b} · (${q.q}) + ${q.r}.${q.a < 0 ? (pyNote ? ' Python rounds down, so the remainder is not negative.' : ' C++, Java and JS round toward zero, so the remainder has the sign of a.') : ''}`, `${q.ok ? '✓ Верно' : '✗ Нет'}: ${q.q} и ${q.r}, потому что ${q.a} = ${q.b} · (${q.q}) + ${q.r}.${q.a < 0 ? (pyNote ? ' Python округляет вниз, поэтому остаток не отрицательный.' : ' C++, Java и JS округляют к нулю, поэтому остаток со знаком a.') : ''}`, `${q.ok ? '✓ Дұрыс' : '✗ Жоқ'}: ${q.q} және ${q.r}, себебі ${q.a} = ${q.b} · (${q.q}) + ${q.r}.${q.a < 0 ? (pyNote ? ' Python төмен дөңгелектейді, сондықтан қалдық теріс емес.' : ' C++, Java, JS нөлге қарай дөңгелектейді, сондықтан қалдық a-ның таңбасымен.') : ''}`),
  };
}

// ---------- Условия ----------

const ifPrint = (lg, w) => [`    print('${w}')`, `    cout << "${w}";`, `    console.log("${w}");`, `    System.out.println("${w}");`][lg];
const IF_EX = [
  {
    v: 's',
    code: (lg) => (lg ? ['if (s >= 85)', '    grade = 5;', 'else if (s >= 70)', '    grade = 4;', 'else if (s >= 50)', '    grade = 3;', 'else', '    grade = 2;'] : ['if s >= 85:', '    grade = 5', 'elif s >= 70:', '    grade = 4', 'elif s >= 50:', '    grade = 3', 'else:', '    grade = 2']),
    opts: ['grade = 2', 'grade = 3', 'grade = 4', 'grade = 5'],
    eval(s) {
      const lim = [85, 70, 50];
      const checks = [];
      let branch = 3;
      for (let i = 0; i < 3; i++) {
        checks.push(s >= lim[i]);
        if (s >= lim[i]) {
          branch = i;
          break;
        }
      }
      const out = `grade = ${[5, 4, 3, 2][branch]}`;
      const no = checks.filter((x) => !x).length;
      return {
        branch,
        checks,
        out,
        lines: checks.map((ok, i) => ({ t: `${s} >= ${lim[i]}`, ok })),
        why: L(`s = ${s}: ${no ? `${no} condition${no > 1 ? 's are' : ' is'} false (✗), then ` : ''}${branch < 3 ? `«s >= ${lim[branch]}» is true` : 'nothing is true, so else runs'} → ${out}. Everything below is not even checked. Order matters: put s >= 50 first and 95 points would get a 3!`, `s = ${s}: ${no ? `ложных условий: ${no} (✗), затем ` : ''}${branch < 3 ? `«s >= ${lim[branch]}» верно` : 'ничего не подошло, срабатывает else'} → ${out}. Ниже уже ничего не проверяется. Порядок важен: поставь s >= 50 первым - и 95 баллов получат «3»!`, `s = ${s}: ${no ? `жалған шарттар: ${no} (✗), сосын ` : ''}${branch < 3 ? `«s >= ${lim[branch]}» ақиқат` : 'ештеңе сәйкес келмеді, else орындалады'} → ${out}. Төмендегілер тексерілмейді де. Рет маңызды: s >= 50-ні бірінші қойсаң, 95 балл «3» алады!`),
      };
    },
  },
  {
    v: 'n',
    code: (lg) => (lg ? ['if (n % 2 == 0)', ifPrint(lg, 'even'), 'else', ifPrint(lg, 'odd')] : ['if n % 2 == 0:', ifPrint(0, 'even'), 'else:', ifPrint(0, 'odd')]),
    opts: ['even', 'odd'],
    eval(n) {
      const ok = n % 2 === 0;
      return {
        branch: ok ? 0 : 1,
        checks: [ok],
        out: ok ? 'even' : 'odd',
        lines: [{ t: `${n} % 2 = ${n % 2}; ${n % 2} == 0`, ok }],
        why: L(`${n} % 2 = ${n % 2}, so the number is ${ok ? 'even' : 'odd'}. The remainder of division by 2 is the usual parity test.`, `${n} % 2 = ${n % 2}, значит число ${ok ? 'чётное (even)' : 'нечётное (odd)'}. Остаток от деления на 2 - обычная проверка на чётность.`, `${n} % 2 = ${n % 2}, демек сан ${ok ? 'жұп (even)' : 'тақ (odd)'}. 2-ге бөлгендегі қалдық - жұптықты әдеттегі тексеру.`),
      };
    },
  },
  {
    v: 'y',
    code: (lg) =>
      lg
        ? ['if (y % 400 == 0)', ifPrint(lg, 'leap'), 'else if (y % 100 == 0)', ifPrint(lg, 'not leap'), 'else if (y % 4 == 0)', ifPrint(lg, 'leap'), 'else', ifPrint(lg, 'not leap')]
        : ['if y % 400 == 0:', ifPrint(0, 'leap'), 'elif y % 100 == 0:', ifPrint(0, 'not leap'), 'elif y % 4 == 0:', ifPrint(0, 'leap'), 'else:', ifPrint(0, 'not leap')],
    opts: ['leap', 'not leap'],
    eval(y) {
      const d = [400, 100, 4];
      const checks = [];
      let branch = 3;
      for (let i = 0; i < 3; i++) {
        checks.push(y % d[i] === 0);
        if (y % d[i] === 0) {
          branch = i;
          break;
        }
      }
      const out = branch === 0 || branch === 2 ? 'leap' : 'not leap';
      const leap = out === 'leap';
      return {
        branch,
        checks,
        out,
        lines: checks.map((ok, i) => ({ t: `${y} % ${d[i]} = ${y % d[i]}`, ok })),
        why: L(`${y} is ${leap ? 'a leap year (366 days)' : 'not a leap year (365 days)'}. Rule: divisible by 4, but years divisible by 100 are not leap unless divisible by 400 (2000 is leap, 1900 is not).`, `${y} - ${leap ? 'високосный год (366 дней)' : 'невисокосный год (365 дней)'}. Правило: делится на 4, но годы, кратные 100, не високосные, если не делятся на 400 (2000 - високосный, 1900 - нет).`, `${y} - ${leap ? 'кібісе жыл (366 күн)' : 'кібісе емес жыл (365 күн)'}. Ереже: 4-ке бөлінеді, бірақ 100-ге еселі жылдар 400-ге бөлінбесе кібісе емес (2000 - кібісе, 1900 - жоқ).`),
      };
    },
  },
];

function ifQuiz() {
  const ex = rnd(3);
  const x = ex === 0 ? rnd(101) : ex === 1 ? rnd(100) : pick([1900, 2000, 1996, 2023, 2024, 2100, 1988, 2010, 2016, 1800 + 4 * rnd(75)]);
  const E = IF_EX[ex];
  return { ex, x, out: E.eval(x).out, opts: E.opts, pick: -1, done: false, ok: false };
}

// ---------- Условные предложения ----------

const COND = [
  {
    ifF: 'Present Simple',
    mainF: 'Present Simple',
    use: L('facts and laws that are always true', 'факты и законы, которые верны всегда', 'әрқашан ақиқат фактілер мен заңдар'),
    when: [0, 1, 2],
    real: true,
    pct: 100,
    realTxt: L('always true', 'верно всегда', 'әрқашан ақиқат'),
    ex: [
      ['If you heat ice, it melts.', 'Если нагреть лёд, он тает.', 'Мұзды қыздырсаң, ол ериді.'],
      ['If it rains, the grass gets wet.', 'Если идёт дождь, трава становится мокрой.', 'Жаңбыр жауса, шөп суланады.'],
      ['If you mix red and blue, you get purple.', 'Если смешать красный и синий, получится фиолетовый.', 'Қызыл мен көкті араластырсаң, күлгін шығады.'],
    ],
  },
  {
    ifF: 'Present Simple',
    mainF: 'will + V',
    use: L('a real possible situation in the future', 'реальная возможная ситуация в будущем', 'келешектегі шын мүмкін жағдай'),
    when: [2],
    real: true,
    pct: 70,
    realTxt: L('real, quite possible', 'реально, вполне возможно', 'шын, әбден мүмкін'),
    ex: [
      ['If it rains tomorrow, we will stay at home.', 'Если завтра пойдёт дождь, мы останемся дома.', 'Ертең жаңбыр жауса, біз үйде қаламыз.'],
      ['If you study hard, you will pass the exam.', 'Если будешь усердно учиться, сдашь экзамен.', 'Жақсы оқысаң, емтиханнан өтесің.'],
      ['If she calls, I will tell her the news.', 'Если она позвонит, я расскажу ей новость.', 'Ол қоңырау шалса, мен оған жаңалықты айтамын.'],
    ],
  },
  {
    ifF: 'Past Simple',
    mainF: 'would + V',
    use: L('an imaginary situation now or in the future (were for all persons)', 'воображаемая ситуация сейчас или в будущем (were для всех лиц)', 'қазіргі не келешектегі қиялдағы жағдай (барлық жақта were)'),
    when: [1, 2],
    real: false,
    pct: 25,
    realTxt: L('imagined, unlikely', 'воображаемо, маловероятно', 'қиялдағы, екіталай'),
    ex: [
      ['If I were you, I would study more.', 'На твоём месте я бы занимался больше.', 'Сенің орныңда болсам, көбірек оқыр едім.'],
      ['If I had a million, I would travel the world.', 'Если бы у меня был миллион, я бы путешествовал по миру.', 'Миллионым болса, әлемді аралар едім.'],
      ['If he lived in Astana, he would visit us more often.', 'Если бы он жил в Астане, он бы чаще к нам приезжал.', 'Ол Астанада тұрса, бізге жиірек келер еді.'],
    ],
  },
  {
    ifF: 'Past Perfect',
    mainF: 'would have + V3',
    use: L('the past that cannot be changed: regrets and criticism', 'прошлое, которое уже не изменить: сожаления и упрёки', 'өзгертуге болмайтын өткен: өкініш пен сын'),
    when: [0],
    real: false,
    pct: 3,
    realTxt: L('impossible: it is already past', 'невозможно: это уже в прошлом', 'мүмкін емес: бұл өтіп кетті'),
    ex: [
      ['If I had studied harder, I would have passed the exam.', 'Если бы я учился усерднее, я бы сдал экзамен (но не сдал).', 'Жақсырақ оқығанымда, емтиханнан өтер едім (бірақ өтпедім).'],
      ['If we had left earlier, we would have caught the train.', 'Если бы мы вышли раньше, мы бы успели на поезд.', 'Ертерек шыққанымызда, пойызға үлгерер едік.'],
      ['If she had known, she would have helped us.', 'Если бы она знала, она бы нам помогла.', 'Ол білгенде, бізге көмектесер еді.'],
    ],
  },
];

/** Задания: предложение, ответ, неверные варианты, тип. */
const COND_QUIZ = [
  ['If you heat water to 100 °C, it ___ (boil).', 'boils', ['would boil', 'boiled', 'would have boiled'], 0],
  ['If you ___ (press) this button, the light goes on.', 'press', ['pressed', 'had pressed', 'would press'], 0],
  ['If it ___ (rain) tomorrow, we will stay at home.', 'rains', ['will rain', 'would rain', 'had rained'], 1],
  ['If you study hard, you ___ (pass) the exam.', 'will pass', ['would have passed', 'passed', 'had passed'], 1],
  ['If I ___ (be) you, I would apologise.', 'were', ['am', 'will be', 'had been'], 2],
  ['If I had a car, I ___ (drive) to work.', 'would drive', ['will drive', 'drive', 'would have driven'], 2],
  ['If we ___ (leave) earlier, we would have caught the train.', 'had left', ['left', 'would leave', 'leave'], 3],
  ['If she had known, she ___ (help) us.', 'would have helped', ['will help', 'helps', 'had helped'], 3],
  ['If they ___ (not / be) so busy, they would come to the party.', "weren't", ["aren't", "won't be", "hadn't been"], 2],
  ['If you don’t hurry, you ___ (miss) the bus.', 'will miss', ['would miss', 'missed', 'would have missed'], 1],
];

function condQuiz(st) {
  const prev = st.q?.n ?? -1;
  let n = rnd(COND_QUIZ.length);
  if (n === prev) n = (n + 1) % COND_QUIZ.length;
  const [s, a, wrong, k] = COND_QUIZ[n];
  return { n, s, a, k, opts: shuffle([a, ...wrong]), pick: -1, done: false, ok: false, hint: false };
}

function condQuizDraw(st) {
  const q = st.q;
  const T = COND[q.k];
  const name = `${['Zero', 'First', 'Second', 'Third'][q.k]} Conditional`;
  let s = `<text class="exh-f13 ex-start" x="8" y="16">${esc(u('Fill the gap', 'Заполни пропуск', 'Бос орынды толтыр'))}</text><text class="exh-f12 ex-end tc exc-g" x="312" y="16">✓ ${st.score[0]} / ${st.score[1]}</text>`;
  const filled = q.done ? q.s.replace('___', q.a).replace(/ \([^)]*\)/, '') : q.s;
  const tl = wrap(filled, 40, 3);
  s += `<rect class="exh-card" x="6" y="24" width="308" height="66" rx="10"/>${lines(tl, 160, 58 - (tl.length - 1) * 8, 16, 'exh-f13 exh-it')}`;
  q.opts.forEach((o, i) => {
    const cls = q.done ? (o === q.a ? 'ok' : i === q.pick ? 'bad' : '') : '';
    s += chip(i % 2 ? 164 : 8, i < 2 ? 98 : 134, 148, 30, o, `o${i}`, cls, 12);
  });
  if (q.done || q.hint) s += `<text class="exh-f12 tc exc-p" x="160" y="190">${esc(q.done ? name : u('Look at the other half of the sentence', 'Посмотри на вторую половину предложения', 'Сөйлемнің екінші жартысына қара'))}</text><text class="exh-f11 exh-mono tc exc-m" x="160" y="208">${esc(`If + ${T.ifF}, ${T.mainF}`)}</text>`;
  return {
    svg: s,
    caption: !q.done
      ? L(`Fill the gap: «${q.s}»`, `Заполни пропуск: «${q.s}»`, `Бос орынды толтыр: «${q.s}»`)
      : L(`${q.ok ? '✓ Right' : `✗ The answer is «${q.a}»`}: ${name} - ${T.use.en}. If + ${T.ifF}, ${T.mainF}.`, `${q.ok ? '✓ Верно' : `✗ Правильно «${q.a}»`}: ${name} - ${T.use.ru}. If + ${T.ifF}, ${T.mainF}.`, `${q.ok ? '✓ Дұрыс' : `✗ Дұрысы «${q.a}»`}: ${name} - ${T.use.kk}. If + ${T.ifF}, ${T.mainF}.`),
  };
}
