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
    intro: L('Seen from above the North Pole, Earth turns 360° in 24 hours - 15° per hour. That is why clocks in places 15° apart differ by about one hour.', 'Если смотреть с Северного полюса, Земля поворачивается на 360° за 24 часа - на 15° в час. Поэтому в местах, отстоящих на 15° по долготе, часы различаются примерно на час.', 'Солтүстік полюстен қарасақ, Жер 24 сағатта 360°-қа - сағатына 15°-қа бұрылады. Сондықтан бойлығы 15°-қа алшақ жерлерде сағаттар шамамен бір сағатқа өзгешеленеді.'),
    sliders: [{ id: 'tt', label: L('time UTC', 'время UTC', 'UTC уақыты'), min: 0, max: 24, step: C, value: 9, show: hhmm }],
    buttons: [L('▶ One day', '▶ Одни сутки', '▶ Бір тәулік')],
    play: 'tt',
    playDur: 8000,
    playLinear: true,
    draw(v) {
      const cx = 85;
      const cy = 110;
      const r = 66;
      const rot = (v.tt - 12) * 15;
      const merid = Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 15 + rot) * Math.PI) / 180;
        return `<line class="ex-grid" x1="${n1(cx - r * Math.cos(a))}" y1="${n1(cy + r * Math.sin(a))}" x2="${n1(cx + r * Math.cos(a))}" y2="${n1(cy - r * Math.sin(a))}"/>`;
      }).join('');
      const pins = CITIES.map((c, i) => {
        const a = ((v.tt + c.o - 12) * 15 * Math.PI) / 180;
        return `<circle class="ex-city c${i}" cx="${n1(cx + (r - 8) * Math.cos(a))}" cy="${n1(cy - (r - 8) * Math.sin(a))}" r="5"/>`;
      }).join('');
      const list = CITIES.map((c, i) => {
        const lt = (((v.tt + c.o) % 24) + 24) % 24;
        const day = lt >= 6 && lt < 18;
        return `<circle class="ex-city c${i}" cx="176" cy="${36 + i * 30}" r="5"/><text class="ex-tag" x="186" y="${40 + i * 30}">${tx(c.n)}</text><text class="ex-small ex-end" x="314" y="${40 + i * 30}">${hhmm(lt)}</text><text class="ex-tiny ex-start" x="186" y="${53 + i * 30}">UTC${c.o >= 0 ? '+' : '−'}${Math.abs(c.o)} · ${day ? u('day', 'день', 'күндіз') : u('night', 'ночь', 'түн')}</text>`;
      }).join('');
      return {
        svg: `<circle class="ex-earth" cx="${cx}" cy="${cy}" r="${r}"/>${merid}<path class="ex-night" d="M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z"/>
          <circle class="ex-fill exc-m" cx="${cx}" cy="${cy}" r="3"/>${pins}<g class="exc-y">${arrow(cx + r + 20, cy, cx + r + 5, cy, '', 3)}</g>${list}`,
        caption: L(
          `Now ${hhmm(v.tt)} UTC: London ${hhmm(v.tt)}, Astana ${hhmm(v.tt + 5)}, Tokyo ${hhmm(v.tt + 9)}. Each hour Earth turns 15°, so the line of sunrise moves 15° west - and the local time shifts by one hour per 15° of longitude.`,
          `Сейчас ${hhmm(v.tt)} UTC: в Лондоне ${hhmm(v.tt)}, в Астане ${hhmm(v.tt + 5)}, в Токио ${hhmm(v.tt + 9)}. За час Земля поворачивается на 15°, граница рассвета сдвигается на 15° к западу - и местное время меняется на час на каждые 15° долготы.`,
          `Қазір UTC бойынша ${hhmm(v.tt)}: Лондонда ${hhmm(v.tt)}, Астанада ${hhmm(v.tt + 5)}, Токиода ${hhmm(v.tt + 9)}. Бір сағатта Жер 15°-қа бұрылады, таң шекарасы батысқа 15°-қа жылжиды - жергілікті уақыт бойлықтың әр 15°-ына бір сағатқа өзгереді.`,
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
    title: L('Seasons and day length', 'Времена года и длина дня', 'Жыл мезгілдері және күн ұзақтығы'),
    intro: L('Earth’s axis is tilted by 23.4°. During the year first one hemisphere, then the other leans toward the Sun: the Sun rises higher, days get longer - summer comes.', 'Ось Земли наклонена на 23,4°. За год к Солнцу наклоняется то одно полушарие, то другое: Солнце поднимается выше, дни длиннее - наступает лето.', 'Жер осі 23,4°-қа көлбеген. Жыл бойы Күнге бірде бір жарты шар, бірде екіншісі еңкейеді: Күн биік көтеріліп, күн ұзарады - жаз келеді.'),
    sliders: [
      { id: 'd', label: L('day of year', 'день года', 'жыл күні'), min: 1, max: 365, step: C, value: 172 },
      { id: 'lat', label: L('latitude, °N', 'широта, ° с. ш.', 'ендік, ° с. е.'), min: 0, max: 70, step: C, value: 43 },
    ],
    buttons: [L('▶ One year', '▶ Один год', '▶ Бір жыл'), L('Almaty 43°', 'Алматы 43°', 'Алматы 43°'), L('Astana 51°', 'Астана 51°', 'Астана 51°')],
    play: 'd',
    playDur: 9000,
    playLinear: true,
    onButton: (i) => (i === 1 ? { lat: 43.2 } : i === 2 ? { lat: 51.2 } : undefined),
    draw(v) {
      const dec = 23.44 * Math.sin((2 * Math.PI * (284 + v.d)) / 365);
      const phi = (v.lat * Math.PI) / 180;
      const del = (dec * Math.PI) / 180;
      const c = -Math.tan(phi) * Math.tan(del);
      const day = c <= -1 ? 24 : c >= 1 ? 0 : (24 / Math.PI) * Math.acos(c);
      const noon = 90 - Math.abs(v.lat - dec);
      const MONTHS = u('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec', 'янв фев мар апр май июн июл авг сен окт ноя дек', 'қаң ақп нау сәу мам мау шіл там қыр қаз қар жел').split(' ');
      const mon = MONTHS[Math.min(11, Math.floor(((v.d - 1) / 365) * 12))];
      const cx = 85;
      const cy = 112;
      const r = 58;
      // Солнце справа: летом (склонение > 0) северный полюс наклонён к нему.
      const tilt = (dec * Math.PI) / 180;
      const axis = [Math.sin(tilt), -Math.cos(tilt)];
      const perp = [Math.cos(tilt), Math.sin(tilt)];
      const lc = [cx + axis[0] * r * Math.sin(phi), cy + axis[1] * r * Math.sin(phi)];
      const half = r * Math.cos(phi);
      const sunH = clamp(noon, 0, 90);
      return {
        svg: `<circle class="ex-fill exc-y" cx="300" cy="112" r="14"/><path class="ex-fill exc-b" style="opacity:.25" d="M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z"/>
          <circle class="ex-stroke exc-b" style="fill:none;stroke-width:2" cx="${cx}" cy="${cy}" r="${r}"/>
          <line class="ex-stroke exc-m ex-dash" x1="${n1(cx - axis[0] * 75)}" y1="${n1(cy - axis[1] * 75)}" x2="${n1(cx + axis[0] * 75)}" y2="${n1(cy + axis[1] * 75)}"/>
          <line class="ex-stroke exc-o" style="stroke-width:2.5" x1="${n1(lc[0] - perp[0] * half)}" y1="${n1(lc[1] - perp[1] * half)}" x2="${n1(lc[0] + perp[0] * half)}" y2="${n1(lc[1] + perp[1] * half)}"/><circle class="ex-fill exc-o" cx="${n1(lc[0] + perp[0] * half)}" cy="${n1(lc[1] + perp[1] * half)}" r="4"/>
          <text class="ex-tag" x="8" y="18">${mon} · ${u('Sun declination', 'склонение Солнца', 'Күн ауытқуы')} ${fmt(dec, 1)}°</text>
          <text class="ex-big" x="240" y="80">${hhmm(day)}</text><text class="ex-small" x="240" y="100">${u('day length', 'длина дня', 'күн ұзақтығы')}</text>
          <text class="ex-tag" x="160" y="150">${u('noon Sun height', 'Солнце в полдень', 'түстегі Күн биіктігі')}: ${fmt(sunH, 1)}°</text>
          <rect x="160" y="165" width="150" height="14" rx="7" class="ex-fill exc-m" style="opacity:.2"/><rect x="160" y="165" width="${n1((day / 24) * 150)}" height="14" rx="7" class="ex-fill exc-y"/>`,
        caption: L(
          `At ${fmt(v.lat, 1)}° N in ${mon} the day lasts ${hhmm(day)} and the noon Sun rises ${fmt(sunH, 1)}° above the horizon. ${day >= 24 ? 'Polar day - the Sun does not set.' : day <= 0 ? 'Polar night - the Sun does not rise.' : 'Around 21 March and 23 September day equals night everywhere (equinoxes).'}`,
          `На ${fmt(v.lat, 1)}° с. ш. в месяце «${mon}» день длится ${hhmm(day)}, а Солнце в полдень поднимается на ${fmt(sunH, 1)}° над горизонтом. ${day >= 24 ? 'Полярный день - Солнце не заходит.' : day <= 0 ? 'Полярная ночь - Солнце не восходит.' : 'Около 21 марта и 23 сентября день равен ночи везде (равноденствия).'}`,
          `${fmt(v.lat, 1)}° с. е. «${mon}» айында күн ${hhmm(day)} созылады, ал түсте Күн көкжиектен ${fmt(sunH, 1)}°-қа көтеріледі. ${day >= 24 ? 'Полярлық күн - Күн батпайды.' : day <= 0 ? 'Полярлық түн - Күн шықпайды.' : 'Шамамен 21 наурыз бен 23 қыркүйекте күн мен түн барлық жерде тең (күн мен түннің теңелуі).'}`,
        ),
      };
    },
  },

  mapscale: {
    title: L('Map scale', 'Масштаб карты', 'Карта масштабы'),
    intro: L('A scale 1 : 1 000 000 means 1 cm on the map is 1 000 000 cm = 10 km on the ground. Measure on the map, then multiply.', 'Масштаб 1 : 1 000 000 значит: 1 см на карте - это 1 000 000 см = 10 км на местности. Измерь на карте и умножь.', '1 : 1 000 000 масштабы: картадағы 1 см - жердегі 1 000 000 см = 10 км. Картадан өлше де, көбейт.'),
    sliders: [
      { id: 'k', label: L('1 cm = ... km', '1 см = ... км', '1 см = ... км'), min: 1, max: 100, step: C, value: 50 },
      { id: 'cm', label: L('on the map, cm', 'на карте, см', 'картада, см'), min: 0.5, max: 25, step: C, value: 19.4 },
    ],
    buttons: [L('Almaty - Astana', 'Алматы - Астана', 'Алматы - Астана'), L('Astana - Karaganda', 'Астана - Караганда', 'Астана - Қарағанды')],
    onButton: (i, st, v) => [{ cm: clamp(970 / v.k, 0.5, 25) }, { cm: clamp(190 / v.k, 0.5, 25) }][i],
    draw(v) {
      const km = v.k * v.cm;
      const scale = Math.round(v.k * 100000);
      const unit = 12;
      const len = clamp(v.cm * unit, 4, 300);
      const ticks = Array.from({ length: Math.floor(v.cm) + 1 }, (_, i) => `<line class="ex-stroke exc-m" x1="${10 + i * unit}" y1="150" x2="${10 + i * unit}" y2="${i % 5 ? 156 : 162}"/>`).join('');
      return {
        svg: `<text class="ex-big" x="160" y="45">1 : ${scale.toLocaleString('ru-RU')}</text>
          <circle class="ex-fill exc-r" cx="10" cy="110" r="6"/><circle class="ex-fill exc-r" cx="${n1(10 + len)}" cy="110" r="6"/>
          <line class="ex-stroke exc-p ex-dash" style="stroke-width:2" x1="10" y1="110" x2="${n1(10 + len)}" y2="110"/>
          <line class="ex-axis" x1="10" y1="150" x2="310" y2="150"/>${ticks}
          <text class="ex-tag" x="8" y="90">${fmt(v.cm, 1)} ${u('cm', 'см', 'см')} × ${fmt(v.k, 1)} = ${fmt(km, 0)} ${u('km', 'км', 'км')}</text>`,
        caption: L(
          `Scale 1 : ${scale.toLocaleString('en-US')} - 1 cm on the map is ${fmt(v.k, 1)} km. ${fmt(v.cm, 1)} cm on the map are ${fmt(km, 0)} km on the ground. A bigger second number means a smaller-scale map: more area, fewer details.`,
          `Масштаб 1 : ${scale.toLocaleString('ru-RU')} - в 1 см на карте ${fmt(v.k, 1)} км. ${fmt(v.cm, 1)} см на карте - это ${fmt(km, 0)} км на местности. Чем больше второе число, тем мельче масштаб: территории больше, деталей меньше.`,
          `Масштаб 1 : ${scale.toLocaleString('ru-RU')} - картадағы 1 см-де ${fmt(v.k, 1)} км. Картадағы ${fmt(v.cm, 1)} см - жердегі ${fmt(km, 0)} км. Екінші сан неғұрлым үлкен болса, масштаб соғұрлым ұсақ: аумақ көп, бөлшек аз.`,
        ),
      };
    },
  },

  gates: {
    title: L('Logic gates: AND, OR, NOT, XOR', 'Логические элементы: И, ИЛИ, НЕ, исключающее ИЛИ', 'Логикалық элементтер: ЖӘНЕ, НЕМЕСЕ, ЕМЕС, XOR'),
    intro: L('A gate takes inputs 0 or 1 and gives an output. AND gives 1 only if both inputs are 1; OR - if at least one; XOR - if they differ; NOT turns 1 into 0.', 'Логический элемент получает входы 0 или 1 и выдаёт выход. И даёт 1, только если оба входа 1; ИЛИ - если хотя бы один; исключающее ИЛИ - если они разные; НЕ превращает 1 в 0.', 'Логикалық элемент 0 не 1 кірістерін алып, шығыс береді. ЖӘНЕ екі кіріс те 1 болса ғана 1 береді; НЕМЕСЕ - ең болмаса біреуі; XOR - олар әртүрлі болса; ЕМЕС 1-ді 0-ге айналдырады.'),
    sliders: [],
    buttons: ['A', 'B', 'AND', 'OR', 'XOR', 'NOT A', 'NAND'],
    state: () => ({ a: 1, b: 0, g: 0 }),
    pressed: (i, v, st) => (i === 0 ? st.a === 1 : i === 1 ? st.b === 1 : i - 2 === st.g),
    onButton(i, st) {
      if (i === 0) st.a ^= 1;
      else if (i === 1) st.b ^= 1;
      else st.g = i - 2;
    },
    draw(v, step, st) {
      const F = [(a, b) => a & b, (a, b) => a | b, (a, b) => a ^ b, (a) => 1 - a, (a, b) => 1 - (a & b)];
      const NAMES = ['AND', 'OR', 'XOR', 'NOT', 'NAND'];
      const out = F[st.g](st.a, st.b);
      const rows = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ];
      const table = rows
        .map(([a, b], i) => {
          const hit = a === st.a && (st.g === 3 || b === st.b);
          return `<text class="ex-small${hit ? ' exc-p' : ''}" x="230" y="${70 + i * 24}">${a}</text><text class="ex-small${hit ? ' exc-p' : ''}" x="260" y="${70 + i * 24}">${st.g === 3 ? '-' : b}</text><text class="ex-small${hit ? ' exc-p' : ''}" x="295" y="${70 + i * 24}">${F[st.g](a, b)}</text>`;
        })
        .join('');
      return {
        svg: `<circle class="ex-lamp${st.a ? ' on' : ''}" cx="30" cy="80" r="12"/><text class="ex-small" x="30" y="85">${st.a}</text>
          ${st.g === 3 ? '' : `<circle class="ex-lamp${st.b ? ' on' : ''}" cx="30" cy="140" r="12"/><text class="ex-small" x="30" y="145">${st.b}</text>`}
          <path class="ex-wire" d="M42 80 H90 M42 140 H90"/><rect x="90" y="70" width="60" height="80" rx="14" class="ex-fill exc-p" style="opacity:.85"/><text class="ex-small" x="120" y="115" style="fill:#fff">${NAMES[st.g]}</text>
          <path class="ex-wire" d="M150 110 H175"/><circle class="ex-lamp${out ? ' on' : ''}" cx="190" cy="110" r="14"/><text class="ex-small" x="190" y="115">${out}</text>
          <text class="ex-tiny" x="230" y="45">A</text><text class="ex-tiny" x="260" y="45">B</text><text class="ex-tiny" x="295" y="45">${u('out', 'выход', 'шығыс')}</text>${table}`,
        caption: L(
          `${NAMES[st.g]}: A = ${st.a}${st.g === 3 ? '' : `, B = ${st.b}`} → ${out}. Tap A and B to switch inputs; the highlighted row of the truth table is the current case.`,
          `${NAMES[st.g]}: A = ${st.a}${st.g === 3 ? '' : `, B = ${st.b}`} → ${out}. Нажимай A и B, чтобы менять входы; подсвеченная строка таблицы истинности - текущий случай.`,
          `${NAMES[st.g]}: A = ${st.a}${st.g === 3 ? '' : `, B = ${st.b}`} → ${out}. Кірістерді ауыстыру үшін A мен B-ны бас; ақиқат кестесіндегі белгіленген жол - қазіргі жағдай.`,
        ),
      };
    },
  },

  download: {
    title: L('Data size and transfer speed', 'Объём данных и скорость передачи', 'Деректер көлемі және беру жылдамдығы'),
    intro: L('Speed is usually in megaBITS per second, files in megaBYTES. 1 byte = 8 bits, so a 100 Mbit/s line moves 12.5 MB each second.', 'Скорость обычно в мегаБИТАХ в секунду, а файлы - в мегаБАЙТАХ. 1 байт = 8 бит, поэтому линия 100 Мбит/с передаёт 12,5 МБ в секунду.', 'Жылдамдық әдетте секундына мегаБИТпен, ал файлдар мегаБАЙТпен. 1 байт = 8 бит, сондықтан 100 Мбит/с желі секундына 12,5 МБ береді.'),
    sliders: [
      { id: 'size', label: L('file, MB', 'файл, МБ', 'файл, МБ'), min: 1, max: 4000, step: 1, value: 700 },
      { id: 'sp', label: L('speed, Mbit/s', 'скорость, Мбит/с', 'жылдамдық, Мбит/с'), min: 1, max: 500, step: 1, value: 50 },
    ],
    buttons: [L('▶ Download', '▶ Скачать', '▶ Жүктеу')],
    state: () => ({ p: 0, run: false }),
    onButton(i, st) {
      st.p = 0;
      st.run = true;
    },
    onSlide(key, v, st) {
      st.p = 0;
      st.run = false;
    },
    live(dt, v, st) {
      if (!st.run) return;
      st.p = Math.min(1, st.p + dt / 3);
      if (st.p >= 1) st.run = false;
    },
    draw(v, step, st) {
      const t = (v.size * 8) / v.sp;
      const mm = Math.floor(t / 60);
      const ss = Math.round(t % 60);
      return {
        svg: `<text class="ex-big" x="160" y="55">t = ${fmt(v.size, 0)} · 8 / ${fmt(v.sp, 0)} ≈ ${mm ? `${mm} ${u('min', 'мин', 'мин')} ` : ''}${ss} ${u('s', 'с', 'с')}</text>
          <rect x="20" y="100" width="280" height="22" rx="11" class="ex-fill exc-m" style="opacity:.2"/><rect x="20" y="100" width="${n1(280 * st.p)}" height="22" rx="11" class="ex-fill exc-g"/>
          <text class="ex-tag" x="20" y="150">${fmt(v.size * st.p, 0)} / ${fmt(v.size, 0)} ${u('MB', 'МБ', 'МБ')}</text><text class="ex-tag" x="20" y="175">${fmt(v.sp / 8, 2)} ${u('MB per second', 'МБ в секунду', 'секундына МБ')}</text>`,
        caption: L(
          `${fmt(v.size, 0)} MB = ${fmt(v.size * 8, 0)} Mbit. At ${fmt(v.sp, 0)} Mbit/s that takes ${fmt(t, 1)} s. The usual trap: forgetting to multiply by 8.`,
          `${fmt(v.size, 0)} МБ = ${fmt(v.size * 8, 0)} Мбит. При ${fmt(v.sp, 0)} Мбит/с это ${fmt(t, 1)} с. Частая ловушка - забыть умножить на 8.`,
          `${fmt(v.size, 0)} МБ = ${fmt(v.size * 8, 0)} Мбит. ${fmt(v.sp, 0)} Мбит/с жылдамдықта бұл ${fmt(t, 1)} с. Жиі тұзақ - 8-ге көбейтуді ұмыту.`,
        ),
      };
    },
  },

  // ===== Программирование: код по шагам на Python, C++, JavaScript и Java =====

  divmod: {
    title: L('Integer division and remainder', 'Целочисленное деление и остаток', 'Бүтін бөлу және қалдық'),
    intro: L('a // b (Python) or a / b with integers (C++, Java) gives how many whole groups of b fit into a; a % b is what is left over. In JavaScript a / b gives a fraction - use Math.floor.', 'a // b (Python) или a / b для целых (C++, Java) - сколько целых групп по b помещается в a; a % b - что осталось. В JavaScript a / b даёт дробь - нужен Math.floor.', 'a // b (Python) немесе бүтін сандар үшін a / b (C++, Java) - a-ға b-дан неше бүтін топ сыяды; a % b - қалғаны. JavaScript-те a / b бөлшек береді - Math.floor керек.'),
    sliders: [
      { id: 'a', label: 'a', min: 0, max: 40, value: 17 },
      { id: 'b', label: 'b', min: 1, max: 9, value: 5 },
    ],
    buttons: ['Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ lang: 0 }),
    pressed: (i, v, st) => i === st.lang,
    onButton(i, st) {
      st.lang = i;
    },
    draw(v, step, st) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const q = Math.floor(a / b);
      const r = a % b;
      const code = [
        [`q = ${a} // ${b}`, `r = ${a} % ${b}`],
        [`int q = ${a} / ${b};`, `int r = ${a} % ${b};`],
        [`let q = Math.floor(${a} / ${b});`, `let r = ${a} % ${b};`],
        [`int q = ${a} / ${b};`, `int r = ${a} % ${b};`],
      ][st.lang];
      const dots = Array.from({ length: a }, (_, i) => {
        const g = Math.floor(i / b);
        const inGroup = g < q;
        const x = 16 + (inGroup ? g * (b * 9 + 8) + (i % b) * 9 : q * (b * 9 + 8) + (i - q * b) * 9);
        return `<circle cx="${n1(Math.min(x, 312))}" cy="${inGroup ? 120 : 150}" r="3.6" class="ex-fill ${inGroup ? 'exc-b' : 'exc-o'}"/>`;
      }).join('');
      return {
        svg: `<rect x="8" y="12" width="304" height="52" rx="10" class="ex-fill exc-m" style="opacity:.12"/>${code.map((c, i) => `<text class="ex-tag" x="18" y="${34 + i * 20}" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre">${c}</text>`).join('')}
          ${dots}<text class="ex-big" x="160" y="200">q = ${q}, r = ${r}</text>`,
        caption: L(
          `${a} = ${b} · ${q} + ${r}: ${q} full groups of ${b} (blue) and ${r} left over (orange). Check: ${b} · ${q} + ${r} = ${a}. The remainder is always smaller than b.`,
          `${a} = ${b} · ${q} + ${r}: ${q} полных групп по ${b} (синие) и ${r} в остатке (оранжевые). Проверка: ${b} · ${q} + ${r} = ${a}. Остаток всегда меньше b.`,
          `${a} = ${b} · ${q} + ${r}: ${b}-тен ${q} толық топ (көк) және қалдықта ${r} (қызғылт сары). Тексеру: ${b} · ${q} + ${r} = ${a}. Қалдық әрқашан b-дан кіші.`,
        ),
      };
    },
  },

  ifelse: {
    title: L('Conditions: if, else if, else', 'Условия: if, else if, else', 'Шарттар: if, else if, else'),
    intro: L('Conditions are checked top to bottom. The first true one runs, the rest are skipped. else runs only if nothing above was true.', 'Условия проверяются сверху вниз. Выполняется первое верное, остальные пропускаются. else срабатывает, только если ничего выше не подошло.', 'Шарттар жоғарыдан төмен тексеріледі. Бірінші дұрысы орындалады, қалғандары өткізіледі. else жоғарыда ештеңе сәйкес келмесе ғана орындалады.'),
    sliders: [{ id: 's', label: L('score', 'баллы', 'балл'), min: 0, max: 100, value: 72 }],
    buttons: ['Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ lang: 0 }),
    pressed: (i, v, st) => i === st.lang,
    onButton(i, st) {
      st.lang = i;
    },
    draw(v, step, st) {
      const s = Math.round(v.s);
      const branch = s >= 85 ? 0 : s >= 70 ? 1 : s >= 50 ? 2 : 3;
      const py = [`if s >= 85:`, `    grade = 5`, `elif s >= 70:`, `    grade = 4`, `elif s >= 50:`, `    grade = 3`, `else:`, `    grade = 2`];
      const cl = [`if (s >= 85) {`, `  grade = 5;`, `} else if (s >= 70) {`, `  grade = 4;`, `} else if (s >= 50) {`, `  grade = 3;`, `} else {`, `  grade = 2; }`];
      const lines = st.lang ? cl : py;
      const checked = (i) => Math.floor(i / 2) <= branch;
      const rows = lines
        .map((ln, i) => {
          const hit = Math.floor(i / 2) === branch;
          const cond = i % 2 === 0;
          const mark = cond && checked(i) && i < 6 ? (hit ? '✓' : '✗') : '';
          return `${hit ? `<rect x="8" y="${16 + i * 22}" width="250" height="20" rx="5" class="ex-fill exc-g" style="opacity:.2"/>` : ''}<text class="ex-tag" x="16" y="${31 + i * 22}" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre;${checked(i) || hit ? '' : 'opacity:.45'}">${esc(ln)}</text><text class="ex-small" x="280" y="${31 + i * 22}" style="fill:var(--${mark === '✓' ? 'green' : 'red'})">${mark}</text>`;
        })
        .join('');
      return {
        svg: `${rows}<text class="ex-tag" x="16" y="210">s = ${s} → grade = ${[5, 4, 3, 2][branch]}</text>`,
        caption: L(
          `s = ${s}: ${branch ? `${branch} condition${branch > 1 ? 's were' : ' was'} false (✗), then ` : ''}${branch < 3 ? `"s >= ${[85, 70, 50][branch]}" is true` : 'nothing matched, so else runs'} → grade ${[5, 4, 3, 2][branch]}. Everything below is not even checked. Order matters: put s >= 50 first and a 95 would get a 3!`,
          `s = ${s}: ${branch ? `${branch} ${branch > 1 ? 'условия оказались ложными' : 'условие оказалось ложным'} (✗), затем ` : ''}${branch < 3 ? `«s >= ${[85, 70, 50][branch]}» верно` : 'ничего не подошло, срабатывает else'} → оценка ${[5, 4, 3, 2][branch]}. Всё, что ниже, даже не проверяется. Порядок важен: поставь s >= 50 первым - и 95 баллов получат «3»!`,
          `s = ${s}: ${branch ? `${branch} шарт жалған болды (✗), кейін ` : ''}${branch < 3 ? `«s >= ${[85, 70, 50][branch]}» дұрыс` : 'ештеңе сәйкес келмеді, else орындалады'} → баға ${[5, 4, 3, 2][branch]}. Төмендегілер тексерілмейді де. Рет маңызды: s >= 50-ні бірінші қойсаң, 95 балл «3» алады!`,
        ),
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
    title: L('Arrays: indexes start at 0', 'Массивы: индексы с нуля', 'Массивтер: индекстер нөлден'),
    intro: L('The first element has index 0, the last one index length − 1. Asking for index = length is an error. In Python a[-1] is the last element.', 'У первого элемента индекс 0, у последнего - длина − 1. Обращение к индексу, равному длине, - ошибка. В Python a[-1] - последний элемент.', 'Бірінші элементтің индексі 0, соңғысының - ұзындық − 1. Ұзындыққа тең индекске жүгіну - қате. Python-да a[-1] - соңғы элемент.'),
    sliders: [{ id: 'i', label: 'i', min: -3, max: 7, value: 2 }],
    buttons: [L('append', 'добавить', 'қосу'), L('remove last', 'удалить последний', 'соңғысын жою'), 'Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ arr: [7, 3, 9, 4, 6], lang: 0 }),
    pressed: (i, v, st) => i >= 2 && i - 2 === st.lang,
    onButton(i, st) {
      if (i === 0 && st.arr.length < 8) st.arr.push([5, 8, 2, 1, 0][st.arr.length % 5]);
      else if (i === 1 && st.arr.length > 1) st.arr.pop();
      else if (i >= 2) st.lang = i - 2;
    },
    draw(v, step, st) {
      const i = Math.round(v.i);
      const n = st.arr.length;
      const neg = st.lang === 0 && i < 0 && -i <= n;
      const idx = neg ? n + i : i;
      const ok = idx >= 0 && idx < n && (i >= 0 || st.lang === 0);
      const access = [`a[${i}]`, `a[${i}]`, `a[${i}]`, `a[${i}]`][st.lang];
      const len = ['len(a)', 'a.size()', 'a.length', 'a.length'][st.lang];
      const err = ['IndexError', st.lang === 1 ? 'undefined behaviour' : '', 'undefined', 'ArrayIndexOutOfBoundsException'][st.lang];
      const boxes = st.arr.map((x, k) => `<rect x="${20 + k * 36}" y="80" width="32" height="40" rx="6" class="ex-fill ${ok && k === idx ? 'exc-p' : 'exc-b'}" style="opacity:${ok && k === idx ? 0.9 : 0.35}"/><text class="ex-small" x="${36 + k * 36}" y="106">${x}</text><text class="ex-tiny" x="${36 + k * 36}" y="140">${k}</text>${st.lang === 0 ? `<text class="ex-tiny exc-m" x="${36 + k * 36}" y="156">${k - n}</text>` : ''}`).join('');
      return {
        svg: `${boxes}<text class="ex-tag" x="12" y="30" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre">${len} = ${n} · ${access} → ${ok ? st.arr[idx] : err || 'error'}</text>
          ${ok ? `<path class="ex-fill exc-p" d="M${36 + idx * 36} 72 l-7 -12 h14 Z"/>` : `<text class="ex-small exc-r" x="160" y="190">${u('out of range', 'выход за границы', 'шекарадан шығу')}</text>`}`,
        caption: ok
          ? L(`${access} = ${st.arr[idx]}. Indexes go from 0 to ${n - 1} - there are ${n} elements, but the last index is ${n - 1}.${neg ? ` Python counts negative indexes from the end: ${i} means ${idx}.` : ''}`, `${access} = ${st.arr[idx]}. Индексы от 0 до ${n - 1}: элементов ${n}, а последний индекс ${n - 1}.${neg ? ` Python считает отрицательные индексы с конца: ${i} - это ${idx}.` : ''}`, `${access} = ${st.arr[idx]}. Индекстер 0-ден ${n - 1}-ге дейін: элемент ${n}, ал соңғы индекс ${n - 1}.${neg ? ` Python теріс индекстерді соңынан санайды: ${i} - бұл ${idx}.` : ''}`)
          : L(`${access} does not exist: valid indexes are 0…${n - 1}. ${st.lang === 0 ? 'Python raises IndexError.' : st.lang === 2 ? 'JavaScript quietly returns undefined.' : st.lang === 3 ? 'Java throws an exception.' : 'C++ reads foreign memory - a dangerous bug.'}`, `${access} не существует: допустимые индексы 0…${n - 1}. ${st.lang === 0 ? 'Python выдаст IndexError.' : st.lang === 2 ? 'JavaScript молча вернёт undefined.' : st.lang === 3 ? 'Java выбросит исключение.' : 'C++ прочитает чужую память - опасная ошибка.'}`, `${access} жоқ: рұқсат етілген индекстер 0…${n - 1}. ${st.lang === 0 ? 'Python IndexError береді.' : st.lang === 2 ? 'JavaScript үнсіз undefined қайтарады.' : st.lang === 3 ? 'Java ерекше жағдай лақтырады.' : 'C++ бөтен жадты оқиды - қауіпті қате.'}`),
      };
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
};

// Данные для сцен.

const CITIES = [
  { n: L('New York', 'Нью-Йорк', 'Нью-Йорк'), o: -5 },
  { n: L('London', 'Лондон', 'Лондон'), o: 0 },
  { n: L('Moscow', 'Москва', 'Мәскеу'), o: 3 },
  { n: L('Astana', 'Астана', 'Астана'), o: 5 },
  { n: L('Beijing', 'Пекин', 'Бейжің'), o: 8 },
  { n: L('Tokyo', 'Токио', 'Токио'), o: 9 },
];

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
