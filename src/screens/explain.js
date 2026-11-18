// Анимированные объяснения тем: интерактивные картинки, которые можно крутить ползунками и запускать.
// Каждая анимация - сцена (SVG) + ползунки/кнопки + подпись, которая объясняет, что происходит.
//
// Сцена: { title, intro, sliders, buttons, draw(v, step, st, f) → { svg, caption } } и по желанию:
//   values - значения без ползунков; state() - своё состояние; clamp(v) - ограничения;
//   play / playDur / playLinear / playReverse - кнопка «▶» прогоняет ползунок play;
//   onButton(i, st, v, api) - своя логика кнопок; вернуть объект { key: цель, $dur } → плавный переход;
//   pressed(i, v, st) - кнопка-переключатель; onSlide(key, v, st); onDrag(key, point, v, st) - перетаскивание
//   элементов с data-drag; live(dt, v, st) - постоянное движение (маятник, молекулы).
// f - «дробный шаг»: при смене шага кнопкой он плавно идёт от старого шага к новому (для анимации переходов).
// SVG не пересоздаётся целиком, а обновляется по месту (morph), поэтому работают CSS-переходы.

import { getLang, t, tx } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { navigate } from '../core/router.js';
import { EXPLAINERS, explainerById } from '../content/explainers.js';
import { skillName } from '../content/labels.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { runAdaptive } from './learn.js';

const W = 320;
const H = 220;
const C = 0.01; // шаг непрерывных ползунков
const SVGNS = 'http://www.w3.org/2000/svg';
const reduced = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const n1 = (x) => Math.round(x * 10) / 10;
/** Число для показа: до d знаков, минус «−», в русском и казахском - десятичная запятая. */
const fmt = (x, d = 2) => {
  if (!Number.isFinite(x)) return '∞';
  const r = Math.round(x * 10 ** d) / 10 ** d;
  return String(r === 0 ? 0 : r)
    .replace('-', '−')
    .replace('.', getLang() === 'en' ? '.' : ',');
};
/** « + 3» / « − 3» для записи формул. */
const term = (x, d = 2) => (fmt(x, d).startsWith('−') ? ` − ${fmt(-x, d)}` : ` + ${fmt(x, d)}`);
/** Коэффициент перед x: 1 → «», −1 → «−». */
const coef = (k) => {
  const s = fmt(k);
  return s === '1' ? '' : s === '−1' ? '−' : s;
};
/** y = kx + b как текст. */
const lineEq = (k, b) => (fmt(k) === '0' ? `y = ${fmt(b)}` : `y = ${coef(k)}x${fmt(b) === '0' ? '' : term(b)}`);
const u = (en, ru, kk) => tx(L(en, ru, kk));
const hhmm = (h) => {
  const m = Math.round((((h % 24) + 24) % 24) * 60) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Стрелка-вектор цвета cls (класс exc-*). */
function arrow(x1, y1, x2, y2, cls, w = 2.5, extra = '') {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hs = Math.min(9, len * 0.45);
  const bx = x2 - ux * hs;
  const by = y2 - uy * hs;
  const s = hs * 0.55;
  return `<g class="${cls}"${extra}><line class="ex-stroke" style="stroke-width:${w}" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(bx)}" y2="${n1(by)}"/><path class="ex-fill" d="M${n1(x2)} ${n1(y2)} L${n1(bx - uy * s)} ${n1(by + ux * s)} L${n1(bx + uy * s)} ${n1(by - ux * s)} Z"/></g>`;
}

/** Путь графика y = fn(x) на отрезке [a, b]. */
function plot(fn, a, b, sx, sy, n = 140) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = fn(x);
    if (!Number.isFinite(y)) continue;
    d += `${d ? 'L' : 'M'}${n1(sx(x))} ${n1(clamp(sy(y), -80, H + 80))} `;
  }
  return d;
}

/** Сетка и оси координат. */
function axes(sx, sy, [x0, x1], [y0, y1]) {
  let g = '';
  for (let x = Math.ceil(x0); x <= x1; x++) g += `<line class="ex-grid" x1="${sx(x)}" y1="0" x2="${sx(x)}" y2="${H}"/>`;
  for (let y = Math.ceil(y0); y <= y1; y++) g += `<line class="ex-grid" x1="0" y1="${sy(y)}" x2="${W}" y2="${sy(y)}"/>`;
  return `${g}<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/>`;
}

/** Ползунок: { id, label, min, max, step, value, show }. */
function slider(s, shown) {
  return `<label class="ex-slider"><span>${s.label}</span><input type="range" data-k="${s.id}" min="${s.min}" max="${s.max}" step="${s.step ?? 1}" value="${s.value}" aria-valuetext="${esc(shown)}"><b data-v="${s.id}">${esc(shown)}</b></label>`;
}

/** Обновить детей узла from так, чтобы они совпали с детьми to (без пересоздания одинаковых элементов). */
function morph(from, to) {
  const a = from.childNodes;
  const b = to.childNodes;
  for (let i = 0; i < b.length; i++) {
    const n = b[i];
    const o = a[i];
    if (!o) {
      from.appendChild(n.cloneNode(true));
      continue;
    }
    if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || (n.nodeType === 1 && n.getAttribute('data-key') !== o.getAttribute('data-key'))) {
      from.replaceChild(n.cloneNode(true), o);
      continue;
    }
    if (n.nodeType !== 1) {
      if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
      continue;
    }
    for (const at of n.attributes) if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value);
    for (const at of [...o.attributes]) if (!n.hasAttribute(at.name)) o.removeAttribute(at.name);
    morph(o, n);
  }
  while (a.length > b.length) from.removeChild(from.lastChild);
}

const AGAIN = L('Start again', 'Сначала', 'Басынан');
const RESET = L('Reset', 'Сбросить', 'Тазалау');
const PROGRESS = L('progress, %', 'прошло, %', 'өтті, %');

// ---------- Сцены ----------

const SCENES = {
  balance: {
    title: L('Equations as a balance', 'Уравнение - это весы', 'Теңдеу - таразы'),
    intro: L(
      'An equation is a balance: whatever you do to one pan, do to the other, and it stays level.',
      'Уравнение - это весы в равновесии. Что делаешь с одной чашей, то же делай с другой - и весы не перекосятся.',
      'Теңдеу - тепе-теңдіктегі таразы. Бір табақпен не істесең, екіншісімен де соны істе - таразы қисаймайды.',
    ),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 4, value: 3 },
      { id: 'x', label: 'x', min: 1, max: 5, value: 2 },
      { id: 'b', label: 'b', min: 0, max: 6, value: 4 },
    ],
    buttons: [L('Remove b from both pans', 'Убрать b с обеих чаш', 'Екі табақтан b-ны алу'), L('Divide both pans by a', 'Разделить обе чаши на a', 'Екі табақты a-ға бөлу'), AGAIN],
    draw(v, step, st, f) {
      const { a, x, b } = v;
      const c = a * x + b;
      // Какие коробки на каких чашах на каждом шаге; между шагами - плавный переход.
      const stage = (s) => {
        const left = s >= 2 ? ['x0'] : [...Array.from({ length: a }, (_, i) => `x${i}`), ...(s >= 1 ? [] : Array.from({ length: b }, (_, i) => `w${i}`))];
        const rightN = s >= 2 ? x : s >= 1 ? c - b : c;
        const pos = new Map();
        const put = (ids, cx) => {
          const per = ids.length > 15 ? 7 : Math.min(5, Math.max(1, ids.length));
          ids.forEach((id, i) => pos.set(id, [cx - per * 9.5 + (i % per) * 19, 120 - 19 - Math.floor(i / per) * 19]));
        };
        put(left, 85);
        put(Array.from({ length: rightN }, (_, i) => `r${i}`), 235);
        return pos;
      };
      const s0 = clamp(Math.floor(f), 0, 2);
      const s1 = Math.min(2, s0 + 1);
      const k = clamp(f - s0, 0, 1);
      const A = stage(s0);
      const B = stage(s1);
      const ids = [...Array.from({ length: a }, (_, i) => `x${i}`), ...Array.from({ length: b }, (_, i) => `w${i}`), ...Array.from({ length: c }, (_, i) => `r${i}`)];
      const boxes = ids
        .map((id, i) => {
          const p = A.get(id);
          const q = B.get(id);
          if (!p && !q) return '';
          let xy;
          let op = 1;
          if (p && q) xy = [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
          else if (p) {
            xy = [p[0], p[1] - 18 * k];
            op = 1 - k;
          } else {
            xy = [q[0], q[1] - 18 * (1 - k)];
            op = k;
          }
          if (op < 0.02) return '';
          const isX = id[0] === 'x';
          return `<g transform="translate(${n1(xy[0])} ${n1(xy[1])})" opacity="${n1(op * 100) / 100}" data-key="${id}"><g class="${isX ? 'ex-x' : 'ex-w'}" style="--i:${i % 12}"><rect width="17" height="17" rx="4"/><text x="8.5" y="12.5">${isX ? 'x' : '1'}</text></g></g>`;
        })
        .join('');
      const se = clamp(Math.round(f), 0, 2);
      const eq = [`${a === 1 ? '' : a}x + ${b} = ${c}`, `${a === 1 ? '' : a}x = ${c - b}`, `x = ${x}`][se];
      return {
        svg: `<line class="ex-axis" x1="160" y1="128" x2="160" y2="196"/><path class="ex-base" d="M130 200 L190 200 L160 180 Z"/>
          <g class="ex-beam"><line x1="40" y1="124" x2="280" y2="124"/><path class="ex-pan" d="M35 124 Q85 150 135 124"/><path class="ex-pan" d="M185 124 Q235 150 285 124"/></g>${boxes}
          <text class="ex-big" x="160" y="30">${eq}</text>`,
        caption: [
          L(`On the left: ${a} boxes x and ${b} weights. On the right: ${c} weights. The scale is level.`, `Слева: ${a} коробки x и ${b} гирь. Справа: ${c} гирь. Весы в равновесии.`, `Сол жақта: ${a} x қорапшасы және ${b} гір. Оң жақта: ${c} гір. Таразы тең.`),
          L(`We removed ${b} weights from both pans - still level: ${a}x = ${c - b}.`, `Убрали по ${b} гирь с обеих чаш - равновесие осталось: ${a}x = ${c - b}.`, `Екі табақтан ${b} гірден алдық - тепе-теңдік сақталды: ${a}x = ${c - b}.`),
          L(`Split each pan into ${a} equal parts: one box x weighs ${x}.`, `Делим каждую чашу на ${a} равные части: одна коробка x весит ${x}.`, `Әр табақты ${a} тең бөлікке бөлеміз: бір x қорапшасы ${x} тартады.`),
        ][step],
      };
    },
  },

  fractions: {
    title: L('What a fraction is', 'Что такое дробь', 'Бөлшек дегеніміз не'),
    intro: L('The denominator says into how many equal parts the whole is cut; the numerator says how many parts we take.', 'Знаменатель показывает, на сколько равных частей разрезали целое, числитель - сколько частей взяли.', 'Бөлім бүтінді неше тең бөлікке бөлгенін, алым - неше бөлік алғанын көрсетеді.'),
    sliders: [
      { id: 'n', label: L('numerator', 'числитель', 'алым'), min: 0, max: 12, value: 3 },
      { id: 'd', label: L('denominator', 'знаменатель', 'бөлім'), min: 2, max: 12, value: 4 },
    ],
    clamp(v) {
      v.n = Math.min(v.n, v.d);
    },
    buttons: [L('Multiply top and bottom by 2', 'Умножить числитель и знаменатель на 2', 'Алым мен бөлімді 2-ге көбейту'), AGAIN],
    draw(v, step, st, f) {
      const d0 = v.d;
      const n0 = Math.min(v.n, d0);
      const k = clamp(f, 0, 1);
      const split = k > 0.999;
      const m = split ? 2 : 1;
      const d = d0 * m;
      const n = n0 * m;
      const cx = 95;
      const cy = 112;
      const r = 78;
      const slices = Array.from({ length: d }, (_, i) => {
        const a0 = (i / d) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const p = `M${cx} ${cy} L${n1(cx + r * Math.cos(a0))} ${n1(cy + r * Math.sin(a0))} A${r} ${r} 0 ${large} 1 ${n1(cx + r * Math.cos(a1))} ${n1(cy + r * Math.sin(a1))} Z`;
        return `<path class="ex-slice ${i < n ? 'on' : ''}" style="--i:${i}" d="${p}"/>`;
      }).join('');
      const bar = Array.from({ length: d }, (_, i) => `<rect class="ex-slice ${i < n ? 'on' : ''}" style="--i:${i}" x="${n1(195 + (i * 110) / d)}" y="150" width="${n1(110 / d - 1)}" height="26" rx="3"/>`).join('');
      // Пока идёт переход - «нож» разрезает каждую часть пополам.
      const cuts =
        !split && k > 0
          ? Array.from({ length: d0 }, (_, i) => {
              const am = ((i + 0.5) / d0) * Math.PI * 2 - Math.PI / 2;
              const bx = 195 + ((i + 0.5) * 110) / d0 - 0.5;
              return `<line class="ex-cut" x1="${cx}" y1="${cy}" x2="${n1(cx + r * k * Math.cos(am))}" y2="${n1(cy + r * k * Math.sin(am))}"/><line class="ex-cut" x1="${n1(bx)}" y1="150" x2="${n1(bx)}" y2="${n1(150 + 26 * k)}"/>`;
            }).join('')
          : '';
      const shown = k >= 0.5 ? 2 : 1;
      const nn = n0 * shown;
      const dd = d0 * shown;
      return {
        svg: `${slices}${bar}<g>${cuts}</g>
          <text class="ex-big" x="250" y="70">${nn}/${dd}</text>
          <text class="ex-small" x="250" y="100">= ${fmt(nn / dd, 3)}</text>
          <text class="ex-small" x="250" y="126">= ${fmt((nn / dd) * 100, 1)}%</text>`,
        caption:
          step === 0
            ? L(`The whole is cut into ${d0} equal parts and ${n0} are shaded: ${n0}/${d0}.`, `Целое разрезали на ${d0} равных частей и закрасили ${n0}: это ${n0}/${d0}.`, `Бүтінді ${d0} тең бөлікке бөліп, ${n0}-ін бояды: бұл ${n0}/${d0}.`)
            : L(`Each part was cut in two: ${n0 * 2}/${d0 * 2} is the same amount as ${n0}/${d0}. That is why fractions can be simplified.`, `Каждую часть разрезали пополам: ${n0 * 2}/${d0 * 2} - то же количество, что ${n0}/${d0}. Поэтому дроби можно сокращать.`, `Әр бөлікті екіге бөлдік: ${n0 * 2}/${d0 * 2} - ${n0}/${d0}-пен бірдей мөлшер. Сондықтан бөлшекті қысқартуға болады.`),
      };
    },
  },

  percent: {
    title: L('Percent: one hundredth', 'Процент - это сотая часть', 'Пайыз - жүзден бір бөлік'),
    intro: L('Imagine the number cut into 100 equal cells. p% is p of those cells.', 'Представь, что число разрезали на 100 равных клеточек. p% - это p таких клеточек.', 'Санды 100 тең торкөзге бөлді деп елестет. p% - осындай p торкөз.'),
    sliders: [
      { id: 'p', label: 'p, %', min: 0, max: 100, step: C, value: 25 },
      { id: 'N', label: 'N', min: 10, max: 2000, value: 400 },
    ],
    buttons: [L('p = 50%: a half', 'p = 50% - половина', 'p = 50% - жартысы'), L('p = 12.5%: an eighth', 'p = 12,5% - восьмая', 'p = 12,5% - сегізден бір')],
    onButton: (i) => [{ p: 50 }, { p: 12.5 }][i],
    draw(v) {
      const full = Math.floor(v.p + 1e-9);
      const part = v.p - full;
      const cells = Array.from({ length: 100 }, (_, i) => `<rect class="ex-cell ${i < full ? 'on' : ''}" style="--i:${i}" x="${12 + (i % 10) * 18}" y="${18 + Math.floor(i / 10) * 18}" width="16" height="16" rx="3"/>`).join('');
      const pi = Math.min(full, 99);
      const partial = `<rect class="ex-part" x="${12 + (pi % 10) * 18}" y="${18 + Math.floor(pi / 10) * 18}" width="${full < 100 ? n1(16 * part) : 0}" height="16" rx="2"/>`;
      const one = v.N / 100;
      const val = (v.N * v.p) / 100;
      return {
        svg: `${cells}${partial}<text class="ex-small" x="262" y="60">1% = ${fmt(one)}</text><text class="ex-big" x="262" y="100">${fmt(v.p)}%</text><text class="ex-small" x="262" y="130">= ${fmt(val)}</text>`,
        caption: L(`One cell is 1% of ${v.N}, that is ${v.N} ÷ 100 = ${fmt(one)}. ${fmt(v.p)} cells: ${fmt(one)} × ${fmt(v.p)} = ${fmt(val)}.`, `Одна клетка - 1% от ${v.N}, то есть ${v.N} ÷ 100 = ${fmt(one)}. ${fmt(v.p)} клеток: ${fmt(one)} × ${fmt(v.p)} = ${fmt(val)}.`, `Бір торкөз - ${v.N}-нің 1%-ы, яғни ${v.N} ÷ 100 = ${fmt(one)}. ${fmt(v.p)} торкөз: ${fmt(one)} × ${fmt(v.p)} = ${fmt(val)}.`),
      };
    },
  },

  pythagoras: {
    title: L('The Pythagorean theorem', 'Теорема Пифагора', 'Пифагор теоремасы'),
    intro: L('Build a square on each side of a right triangle: the two small squares together have exactly the area of the big one.', 'Построим квадрат на каждой стороне прямоугольного треугольника: два маленьких квадрата вместе равны по площади большому.', 'Тікбұрышты үшбұрыштың әр қабырғасына шаршы саламыз: екі кіші шаршының ауданы бірге үлкенінікіне тең.'),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 6, step: C, value: 3 },
      { id: 'b', label: 'b', min: 1, max: 6, step: C, value: 4 },
    ],
    buttons: [L('3, 4, 5', '3, 4, 5', '3, 4, 5'), L('Isosceles: a = b', 'Равнобедренный: a = b', 'Теңбүйірлі: a = b')],
    onButton: (i, st, v) => [{ a: 3, b: 4 }, { b: v.a }][i],
    draw(v) {
      const s = 16;
      const A = [120, 150];
      const B = [120 + v.b * s, 150];
      const Cp = [120, 150 - v.a * s];
      const a2 = v.a * v.a;
      const b2 = v.b * v.b;
      const c2 = a2 + b2;
      const c = Math.sqrt(c2);
      const sq = (p, q, cls, i) => {
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        return `<path class="ex-sq ${cls}" style="--i:${i}" d="M${n1(p[0])} ${n1(p[1])} L${n1(q[0])} ${n1(q[1])} L${n1(q[0] + dy)} ${n1(q[1] - dx)} L${n1(p[0] + dy)} ${n1(p[1] - dx)} Z"/>`;
      };
      const exact = Math.abs(c - Math.round(c)) < 0.005;
      return {
        svg: `<g transform="translate(-10 22) scale(0.82)">${sq(A, Cp, 'sq-a', 0)}${sq(B, A, 'sq-b', 1)}${sq(Cp, B, 'sq-c', 2)}<path class="ex-tri" d="M${A} L${n1(B[0])} ${B[1]} L${Cp[0]} ${n1(Cp[1])} Z"/></g>
          <text class="ex-small" x="250" y="60">a² = ${fmt(a2)}</text><text class="ex-small" x="250" y="86">b² = ${fmt(b2)}</text><text class="ex-big" x="250" y="122">c² = ${fmt(c2)}</text><text class="ex-small" x="250" y="150">c ${exact ? '=' : '≈'} ${fmt(c)}</text>`,
        caption: L(`${fmt(v.a)}² + ${fmt(v.b)}² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(c2)}, so the hypotenuse is √${fmt(c2)} ${exact ? '=' : '≈'} ${fmt(c)}. Try a = 3, b = 4 for a whole number.`, `${fmt(v.a)}² + ${fmt(v.b)}² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(c2)}, значит гипотенуза √${fmt(c2)} ${exact ? '=' : '≈'} ${fmt(c)}. Попробуй a = 3, b = 4 - получится целое число.`, `${fmt(v.a)}² + ${fmt(v.b)}² = ${fmt(a2)} + ${fmt(b2)} = ${fmt(c2)}, демек гипотенуза √${fmt(c2)} ${exact ? '=' : '≈'} ${fmt(c)}. a = 3, b = 4 етіп көр - бүтін сан шығады.`),
      };
    },
  },

  angles: {
    title: L('Angles of a triangle add up to 180°', 'Сумма углов треугольника - 180°', 'Үшбұрыш бұрыштарының қосындысы - 180°'),
    intro: L('Tear off the three corners of any triangle and put them together: they always form a straight line.', 'Оторви три угла любого треугольника и сложи их вместе - всегда получится развёрнутый угол.', 'Кез келген үшбұрыштың үш бұрышын жыртып, бірге қос - әрқашан жазыңқы бұрыш шығады.'),
    sliders: [
      { id: 'A', label: 'A°', min: 20, max: 120, step: C, value: 60 },
      { id: 'B', label: 'B°', min: 20, max: 120, step: C, value: 50 },
    ],
    clamp(v) {
      if (v.A + v.B > 160) v.B = 160 - v.A;
    },
    buttons: [L('Put the corners together', 'Сложить углы вместе', 'Бұрыштарды бірге қосу'), AGAIN],
    draw(v, step, st, f) {
      const { A, B } = v;
      const Cc = 180 - A - B;
      const rad = (d) => (d * Math.PI) / 180;
      const P = [40, 150];
      const Q = [200, 150];
      const ta = Math.tan(rad(A));
      const tb = Math.tan(rad(B));
      const x = (160 * tb) / (ta + tb);
      const R = [40 + x, 150 - x * ta];
      const k = clamp(f, 0, 1);
      const wedge = (from, to, cls) => {
        const r = 26;
        const cx = lerp(from[0], 260, k);
        const cy = lerp(from[1], 190, k);
        const st0 = lerp(from[2], to, k);
        const a0 = rad(st0);
        const a1 = rad(st0 + from[3]);
        return `<path class="ex-wedge ${cls}" d="M${n1(cx)} ${n1(cy)} L${n1(cx + r * Math.cos(a0))} ${n1(cy - r * Math.sin(a0))} A${r} ${r} 0 0 0 ${n1(cx + r * Math.cos(a1))} ${n1(cy - r * Math.sin(a1))} Z"/>`;
      };
      return {
        svg: `<path class="ex-tri" d="M${P} L${Q} L${n1(R[0])} ${n1(R[1])} Z"/><line class="ex-axis" x1="210" y1="190" x2="310" y2="190" opacity="${n1(k * 10) / 10}"/>
          <g>${wedge([P[0], P[1], 0, A], 0, 'w-a')}${wedge([R[0], R[1], 180 + A, Cc], A, 'w-c')}${wedge([Q[0], Q[1], 180 - B, B], A + Cc, 'w-b')}</g>
          <text class="ex-small" x="${P[0] - 8}" y="${P[1] + 18}">A = ${fmt(A)}°</text><text class="ex-small" x="${Q[0] + 4}" y="${Q[1] + 18}">B = ${fmt(B)}°</text><text class="ex-small" x="${n1(R[0])}" y="${n1(R[1] - 10)}">C = ${fmt(Cc)}°</text>`,
        caption:
          step >= 1
            ? L(`${fmt(A)}° + ${fmt(Cc)}° + ${fmt(B)}° = 180°: together the three angles make a straight line.`, `${fmt(A)}° + ${fmt(Cc)}° + ${fmt(B)}° = 180°: три угла вместе образуют развёрнутый угол - прямую линию.`, `${fmt(A)}° + ${fmt(Cc)}° + ${fmt(B)}° = 180°: үш бұрыш бірге жазыңқы бұрыш - түзу сызық құрайды.`)
            : L(`Change A and B: C always equals 180° − A − B = ${fmt(Cc)}°.`, `Меняй A и B: угол C всегда равен 180° − A − B = ${fmt(Cc)}°.`, `A мен B-ны өзгерт: C бұрышы әрқашан 180° − A − B = ${fmt(Cc)}°.`),
      };
    },
  },

  parabola: {
    title: L('The parabola y = ax² + bx + c', 'Парабола y = ax² + bx + c', 'Парабола y = ax² + bx + c'),
    intro: L('a sets the direction and width, c moves the graph up and down, b shifts the vertex sideways. The discriminant tells how many times the graph crosses the x-axis.', 'a задаёт направление ветвей и ширину, c поднимает и опускает график, b сдвигает вершину вбок. Дискриминант показывает, сколько раз график пересекает ось x.', 'a тармақтардың бағыты мен енін, c графикті жоғары-төмен жылжытады, b төбені бүйірге ығыстырады. Дискриминант график x осін неше рет қиятынын көрсетеді.'),
    sliders: [
      { id: 'a', label: 'a', min: -3, max: 3, step: C, value: 1 },
      { id: 'b', label: 'b', min: -6, max: 6, step: C, value: -2 },
      { id: 'c', label: 'c', min: -6, max: 6, step: C, value: -3 },
    ],
    buttons: [L('a → −a: flip', 'a → −a: перевернуть', 'a → −a: аудару'), L('D = 0: touch the axis', 'D = 0: касание оси', 'D = 0: оске жанасу')],
    onButton(i, st, v) {
      if (i === 0) return { a: -v.a };
      const a = Math.abs(v.a) < 0.05 ? 1 : v.a;
      return { a, c: clamp((v.b * v.b) / (4 * a), -6, 6) };
    },
    draw(v) {
      const { a, b, c } = v;
      const sx = (x) => 160 + x * 22;
      const sy = (y) => 110 - y * 11;
      const path = plot((x) => a * x * x + b * x + c, -7.3, 7.3, sx, sy, 150);
      const grid = Array.from({ length: 15 }, (_, i) => `<line class="ex-grid" x1="${sx(i - 7)}" y1="0" x2="${sx(i - 7)}" y2="${H}"/>`).join('');
      const base = `${grid}<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/><path class="ex-curve" d="${path}"/>`;
      if (Math.abs(a) < 0.005) {
        const root = Math.abs(b) > 0.005 ? -c / b : null;
        return {
          svg: `${base}${root !== null ? `<circle class="ex-dot dot-root" cx="${n1(sx(root))}" cy="${sy(0)}" r="5"/>` : ''}<text class="ex-tag" x="8" y="18">a = 0</text>`,
          caption: L(`a = 0: no x² term, so this is a straight line ${lineEq(b, c)}, not a parabola.${root !== null ? ` It crosses the axis at x = ${fmt(root)}.` : ''}`, `a = 0: нет слагаемого x², это уже не парабола, а прямая ${lineEq(b, c)}.${root !== null ? ` Она пересекает ось в x = ${fmt(root)}.` : ''}`, `a = 0: x² қосылғышы жоқ, бұл парабола емес, ${lineEq(b, c)} түзуі.${root !== null ? ` Ол осьті x = ${fmt(root)} нүктесінде қияды.` : ''}`),
        };
      }
      const D = b * b - 4 * a * c;
      const one = Math.abs(D) < 0.005;
      const xv = -b / (2 * a);
      const yv = a * xv * xv + b * xv + c;
      const roots = one ? [xv] : D < 0 ? [] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q);
      const kind = (two, single, none) => (one ? single : D > 0 ? two : none);
      return {
        svg: `${base}${roots.map((r) => `<circle class="ex-dot dot-root" cx="${n1(sx(r))}" cy="${sy(0)}" r="5"/>`).join('')}<circle class="ex-dot" cx="${n1(sx(xv))}" cy="${n1(clamp(sy(yv), -20, 240))}" r="5"/>
          <text class="ex-tag" x="8" y="18">D = ${fmt(one ? 0 : D)}</text>`,
        caption: L(
          `D = b² − 4ac = ${fmt(one ? 0 : D)}: ${kind('two roots', 'one root', 'no real roots')}. Vertex at x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Roots: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
          `D = b² − 4ac = ${fmt(one ? 0 : D)}: ${kind('два корня', 'один корень', 'корней нет')}. Вершина в x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Корни: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
          `D = b² − 4ac = ${fmt(one ? 0 : D)}: ${kind('екі түбір', 'бір түбір', 'түбір жоқ')}. Төбесі x = −b/(2a) = ${fmt(xv)}.${roots.length ? ` Түбірлер: ${roots.map((r) => fmt(r)).join('; ')}.` : ''}`,
        ),
      };
    },
  },

  'unit-circle': {
    title: L('Sine and cosine on the unit circle', 'Синус и косинус на единичной окружности', 'Бірлік шеңбердегі синус пен косинус'),
    intro: L('A point moves around a circle of radius 1. Its x-coordinate is the cosine of the angle, its y-coordinate is the sine.', 'Точка движется по окружности радиуса 1. Её координата x - косинус угла, координата y - синус.', 'Нүкте радиусы 1 шеңбер бойымен қозғалады. Оның x координатасы - бұрыштың косинусы, y координатасы - синусы.'),
    sliders: [{ id: 'deg', label: L('angle, °', 'угол, °', 'бұрыш, °'), min: 0, max: 360, step: C, value: 30 }],
    buttons: [L('▶ Rotate', '▶ Крутить', '▶ Айналдыру')],
    play: 'deg',
    playDur: 4000,
    draw(v) {
      const r = 70;
      const cx = 90;
      const cy = 110;
      const a = (v.deg * Math.PI) / 180;
      const px = cx + r * Math.cos(a);
      const py = cy - r * Math.sin(a);
      const wave = plot((d) => cy - r * Math.sin((d * Math.PI) / 180), 0, v.deg, (d) => 180 + (d / 360) * 130, (y) => y, Math.max(2, Math.ceil(v.deg / 3)));
      return {
        svg: `<circle class="ex-ring" cx="${cx}" cy="${cy}" r="${r}"/><line class="ex-axis" x1="10" y1="${cy}" x2="315" y2="${cy}"/><line class="ex-axis" x1="${cx}" y1="25" x2="${cx}" y2="195"/>
          <line class="ex-cos" x1="${cx}" y1="${cy}" x2="${n1(px)}" y2="${cy}"/><line class="ex-sin" x1="${n1(px)}" y1="${cy}" x2="${n1(px)}" y2="${n1(py)}"/><line class="ex-rad" x1="${cx}" y1="${cy}" x2="${n1(px)}" y2="${n1(py)}"/>
          <circle class="ex-dot" cx="${n1(px)}" cy="${n1(py)}" r="6"/><path class="ex-curve thin" d="${wave}"/><line class="ex-axis" x1="180" y1="25" x2="180" y2="195"/>
          <text class="ex-tag t-cos" x="12" y="20">cos = ${fmt(Math.cos(a))}</text><text class="ex-tag t-sin" x="12" y="210">sin = ${fmt(Math.sin(a))}</text>`,
        caption: L(`Angle ${fmt(v.deg)}°: cos = ${fmt(Math.cos(a))} (green, along x), sin = ${fmt(Math.sin(a))} (pink, along y). On the right, the sine traced as a wave.`, `Угол ${fmt(v.deg)}°: cos = ${fmt(Math.cos(a))} (зелёный отрезок по x), sin = ${fmt(Math.sin(a))} (розовый по y). Справа - синус, нарисованный как волна.`, `Бұрыш ${fmt(v.deg)}°: cos = ${fmt(Math.cos(a))} (x бойынша жасыл кесінді), sin = ${fmt(Math.sin(a))} (y бойынша қызғылт). Оң жақта - толқын түріндегі синус.`),
      };
    },
  },

  derivative: {
    title: L('The derivative is the slope of the tangent', 'Производная - наклон касательной', 'Туынды - жанаманың көлбеулігі'),
    intro: L('Take a secant through two close points of the graph and bring them together: the secant turns into the tangent, and its slope is the derivative.', 'Проведём секущую через две близкие точки графика и будем сближать их: секущая превратится в касательную, а её наклон - это производная.', 'График екі жақын нүктесі арқылы қиюшы жүргізіп, оларды жақындатайық: қиюшы жанамаға айналады, ал оның көлбеулігі - туынды.'),
    sliders: [
      { id: 'x0', label: 'x₀', min: -2, max: 2, step: C, value: 0.5 },
      { id: 'h', label: 'h', min: 0, max: 2, step: C, value: 1.5 },
    ],
    buttons: [L('▶ h → 0', '▶ h → 0', '▶ h → 0')],
    play: 'h',
    playReverse: true,
    draw(v) {
      const fn = (x) => (x * x * x) / 3 - x;
      const df = (x) => x * x - 1;
      const sx = (x) => 160 + x * 55;
      const sy = (y) => 110 - y * 55;
      const path = plot(fn, -2.6, 2.6, sx, sy, 110);
      const x0 = v.x0;
      const x1 = x0 + v.h;
      const k = v.h > 0.001 ? (fn(x1) - fn(x0)) / v.h : df(x0);
      const line = (m) => `M${sx(-3)} ${n1(sy(fn(x0) + m * (-3 - x0)))} L${sx(3)} ${n1(sy(fn(x0) + m * (3 - x0)))}`;
      return {
        svg: `<line class="ex-axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/>
          <path class="ex-curve" d="${path}"/><path class="ex-tan" d="${line(df(x0))}"/><path class="ex-sec" d="${line(k)}" opacity="${v.h > 0.001 ? 1 : 0}"/><circle class="ex-dot dot-root" cx="${n1(sx(x1))}" cy="${n1(sy(fn(x1)))}" r="${v.h > 0.001 ? 5 : 0}"/><circle class="ex-dot" cx="${n1(sx(x0))}" cy="${n1(sy(fn(x0)))}" r="6"/>
          <text class="ex-tag" x="8" y="18">f(x) = x³/3 − x</text><text class="ex-tag t-sin" x="8" y="210">${t('explain.slope')}: ${fmt(k)}</text>`,
        caption: L(`Secant slope (f(x₀+h) − f(x₀)) / h = ${fmt(k)}. As h → 0 it approaches f′(x₀) = x₀² − 1 = ${fmt(df(x0))}.`, `Наклон секущей (f(x₀+h) − f(x₀)) / h = ${fmt(k)}. При h → 0 он стремится к f′(x₀) = x₀² − 1 = ${fmt(df(x0))}.`, `Қиюшының көлбеулігі (f(x₀+h) − f(x₀)) / h = ${fmt(k)}. h → 0 болғанда ол f′(x₀) = x₀² − 1 = ${fmt(df(x0))} мәніне ұмтылады.`),
      };
    },
  },

  probability: {
    title: L('Probability and the law of large numbers', 'Вероятность и закон больших чисел', 'Ықтималдық және үлкен сандар заңы'),
    intro: L('Roll a die many times. Each face has probability 1/6 ≈ 16.7%, and the more rolls, the closer the frequencies get to it.', 'Бросай кубик много раз. У каждой грани вероятность 1/6 ≈ 16,7%, и чем больше бросков, тем ближе к ней частоты.', 'Ойын сүйегін көп рет лақтыр. Әр жақтың ықтималдығы 1/6 ≈ 16,7%, лақтыру көбейген сайын жиіліктер соған жақындайды.'),
    sliders: [],
    buttons: [L('Roll 1', 'Бросить 1', '1 лақтыру'), L('Roll 10', 'Бросить 10', '10 лақтыру'), L('Roll 100', 'Бросить 100', '100 лақтыру'), L('Reset', 'Сбросить', 'Тазалау')],
    state: () => ({ counts: [0, 0, 0, 0, 0, 0], last: null }),
    onButton(i, st) {
      if (i === 3) {
        st.counts = [0, 0, 0, 0, 0, 0];
        st.last = null;
        return;
      }
      const n = [1, 10, 100][i];
      for (let k = 0; k < n; k++) {
        const f = Math.floor(Math.random() * 6);
        st.counts[f] += 1;
        st.last = f + 1;
      }
    },
    draw(v, step, st) {
      const total = st.counts.reduce((s, x) => s + x, 0);
      const bars = st.counts
        .map((cnt, i) => {
          const share = total ? cnt / total : 0;
          const h = share * 300;
          return `<rect class="ex-bar" x="${30 + i * 46}" y="${n1(180 - h)}" width="34" height="${n1(h)}" rx="4"/><text class="ex-small" x="${47 + i * 46}" y="198">${i + 1}</text><text class="ex-tiny" x="${47 + i * 46}" y="${n1(174 - h)}">${total ? Math.round(share * 100) : 0}%</text>`;
        })
        .join('');
      const ideal = 180 - 300 / 6;
      return {
        svg: `<line class="ex-axis" x1="20" y1="180" x2="310" y2="180"/>${bars}<line class="ex-ideal" x1="20" y1="${ideal}" x2="310" y2="${ideal}"/><text class="ex-tag" x="210" y="${ideal - 6}">1/6 ≈ ${fmt(100 / 6, 1)}%</text>
          ${st.last ? `<text class="ex-die" x="285" y="40" data-key="${total}">${'⚀⚁⚂⚃⚄⚅'[st.last - 1]}</text>` : '<g/>'}<text class="ex-tag" x="8" y="18">N = ${total}</text>`,
        caption: total
          ? L(`After ${total} rolls the bars are ${total < 60 ? 'still uneven - chance plays a big role' : 'getting close to the dashed line at 1/6'}.`, `После ${total} бросков столбики ${total < 60 ? 'ещё неровные - случай играет большую роль' : 'приближаются к пунктиру на уровне 1/6'}.`, `${total} лақтырудан кейін бағаналар ${total < 60 ? 'әлі тегіс емес - кездейсоқтықтың рөлі үлкен' : '1/6 деңгейіндегі пунктирге жақындап келеді'}.`)
          : L('Press a button to roll.', 'Нажми кнопку, чтобы бросить кубик.', 'Ойын сүйегін лақтыру үшін батырманы бас.'),
      };
    },
  },

  motion: {
    title: L('Moving towards each other', 'Движение навстречу', 'Қарсы қозғалыс'),
    intro: L('When two objects move towards each other, the distance between them shrinks by v₁ + v₂ every hour (the closing speed).', 'Когда два объекта движутся навстречу, расстояние между ними каждый час уменьшается на v₁ + v₂ - это скорость сближения.', 'Екі нысан қарама-қарсы қозғалғанда, олардың арасындағы қашықтық әр сағат сайын v₁ + v₂-ге азаяды - бұл жақындасу жылдамдығы.'),
    sliders: [
      { id: 'S', label: L('S, km', 'S, км', 'S, км'), min: 60, max: 300, step: C, value: 240 },
      { id: 'v1', label: L('v₁, km/h', 'v₁, км/ч', 'v₁, км/сағ'), min: 20, max: 100, step: C, value: 60 },
      { id: 'v2', label: L('v₂, km/h', 'v₂, км/ч', 'v₂, км/сағ'), min: 20, max: 100, step: C, value: 80 },
      { id: 'tt', label: PROGRESS, min: 0, max: 100, step: C, value: 0 },
    ],
    buttons: [L('▶ Go', '▶ Поехали', '▶ Жүрдік')],
    play: 'tt',
    playLinear: true,
    playDur: 3000,
    draw(v) {
      const vs = v.v1 + v.v2;
      const tMeet = v.S / vs;
      const time = (v.tt / 100) * tMeet;
      const x1 = 30 + ((v.v1 * time) / v.S) * 260;
      const x2 = 290 - ((v.v2 * time) / v.S) * 260;
      const gap = Math.max(0, v.S - vs * time);
      const km = u('km', 'км', 'км');
      return {
        svg: `<line class="ex-road" x1="20" y1="120" x2="300" y2="120"/><text class="ex-small" x="30" y="150">A</text><text class="ex-small" x="290" y="150">B</text>
          <text class="ex-car" x="${n1(x1)}" y="114">🚗</text><text class="ex-car flip" x="${n1(x2)}" y="114">🚙</text>
          <text class="ex-tag" x="8" y="20">t = ${fmt(time)} ${t('explain.h')}</text><text class="ex-tag" x="8" y="42">${t('explain.gap')}: ${fmt(gap, 1)} ${km}</text>
          <text class="ex-small" x="160" y="190">t = S / (v₁ + v₂) = ${fmt(v.S)} / ${fmt(vs)} = ${fmt(tMeet)} ${t('explain.h')}</text>`,
        caption: L(`Closing speed ${fmt(v.v1)} + ${fmt(v.v2)} = ${fmt(vs)} km/h. ${fmt(v.S)} km ÷ ${fmt(vs)} km/h = ${fmt(tMeet)} h until they meet.`, `Скорость сближения ${fmt(v.v1)} + ${fmt(v.v2)} = ${fmt(vs)} км/ч. ${fmt(v.S)} км ÷ ${fmt(vs)} км/ч = ${fmt(tMeet)} ч до встречи.`, `Жақындасу жылдамдығы ${fmt(v.v1)} + ${fmt(v.v2)} = ${fmt(vs)} км/сағ. Кездескенге дейін ${fmt(v.S)} км ÷ ${fmt(vs)} км/сағ = ${fmt(tMeet)} сағ.`),
      };
    },
  },

  // ---------- Новые анимации ----------

  linear: {
    title: L('Linear function y = kx + b', 'Линейная функция y = kx + b', 'Сызықтық функция y = kx + b'),
    intro: L('k is the slope: how much y changes when x grows by 1. b is the point where the line crosses the y-axis.', 'k - угловой коэффициент: на сколько меняется y, когда x увеличивается на 1. b - точка, где прямая пересекает ось y.', 'k - бұрыштық коэффициент: x бірге артқанда y қаншаға өзгереді. b - түзудің y осін қиятын нүктесі.'),
    sliders: [
      { id: 'k', label: 'k', min: -3, max: 3, step: C, value: 0.5 },
      { id: 'b', label: 'b', min: -4, max: 4, step: C, value: 1 },
    ],
    buttons: [L('k × 2', 'k × 2', 'k × 2'), L('k → −k', 'k → −k', 'k → −k'), RESET],
    onButton: (i, st, v) => [{ k: clamp(v.k * 2, -3, 3) }, { k: -v.k }, { k: 0.5, b: 1 }][i],
    draw(v) {
      const { k, b } = v;
      const sx = (x) => 160 + x * 20;
      const sy = (y) => 110 - y * 20;
      const y1 = k + b;
      const flat = fmt(k) === '0';
      const root = flat ? null : -b / k;
      return {
        svg: `${axes(sx, sy, [-8, 8], [-5, 5])}<path class="ex-curve" d="M${sx(-9)} ${n1(sy(-9 * k + b))} L${sx(9)} ${n1(sy(9 * k + b))}"/>
          <g class="exc-o"><path class="ex-stroke ex-dash" d="M${sx(0)} ${n1(sy(b))} H${sx(1)} V${n1(sy(b + k))}"/></g>
          <text class="ex-tag tc exc-o" x="${sx(1) + 6}" y="${n1((sy(b) + sy(b + k)) / 2 + 4)}">${fmt(k)}</text>
          <circle class="ex-dot" cx="${sx(0)}" cy="${n1(sy(b))}" r="6"/><circle class="ex-dot dot-root" cx="${sx(1)}" cy="${n1(sy(y1))}" r="4"/>
          ${root !== null && Math.abs(root) < 8 ? `<circle class="ex-dot dot-root" cx="${n1(sx(root))}" cy="${sy(0)}" r="5"/>` : '<g/>'}
          <text class="ex-tag" x="8" y="18">${lineEq(k, b)}</text>`,
        caption: flat
          ? L(`k = 0: the line is horizontal, y is always ${fmt(b)}. b = ${fmt(b)} is where it crosses the y-axis.`, `k = 0: прямая горизонтальна, y всегда равен ${fmt(b)}. b = ${fmt(b)} - точка пересечения с осью y.`, `k = 0: түзу көлденең, y әрқашан ${fmt(b)}. b = ${fmt(b)} - y осімен қиылысу нүктесі.`)
          : L(`k = ${fmt(k)}: when x grows by 1, y ${k > 0 ? 'grows' : 'falls'} by ${fmt(Math.abs(k))} (orange step). b = ${fmt(b)}: the line crosses the y-axis at (0; ${fmt(b)}). It crosses the x-axis at x = −b/k = ${fmt(root)}.`, `k = ${fmt(k)}: когда x растёт на 1, y ${k > 0 ? 'растёт' : 'уменьшается'} на ${fmt(Math.abs(k))} (оранжевая ступенька). b = ${fmt(b)}: прямая пересекает ось y в точке (0; ${fmt(b)}). Ось x - в точке x = −b/k = ${fmt(root)}.`, `k = ${fmt(k)}: x бірге артқанда y ${fmt(Math.abs(k))}-ге ${k > 0 ? 'артады' : 'кемиді'} (қызғылт сары баспалдақ). b = ${fmt(b)}: түзу y осін (0; ${fmt(b)}) нүктесінде қияды. x осін - x = −b/k = ${fmt(root)} нүктесінде.`),
      };
    },
  },

  exponential: {
    title: L('Exponential vs linear growth', 'Показательный рост против линейного', 'Көрсеткіштік өсу мен сызықтық өсу'),
    intro: L('Linear growth adds the same amount every step; exponential growth multiplies by the same number. Sooner or later the exponent always wins.', 'Линейный рост каждый шаг прибавляет одно и то же, показательный - умножает на одно и то же число. Рано или поздно показательный рост всегда обгоняет.', 'Сызықтық өсу әр қадамда бірдей шама қосады, көрсеткіштік өсу бірдей санға көбейтеді. Ерте ме, кеш пе көрсеткіштік өсу әрқашан озады.'),
    sliders: [
      { id: 'a', label: L('multiply by a', 'умножать на a', 'a-ға көбейту'), min: 1.1, max: 3, step: C, value: 1.5 },
      { id: 'd', label: L('add d', 'прибавлять d', 'd қосу'), min: 0.5, max: 5, step: C, value: 3 },
      { id: 'n', label: L('steps n', 'шагов n', 'қадам n'), min: 0, max: 10, step: C, value: 4 },
    ],
    buttons: [L('▶ Grow', '▶ Расти', '▶ Өсу')],
    play: 'n',
    playDur: 4000,
    playLinear: true,
    draw(v) {
      const lin = (n) => 1 + v.d * n;
      const ex = (n) => v.a ** n;
      const ymax = Math.max(lin(v.n), ex(v.n), 5) * 1.15;
      const sx = (n) => 30 + n * 27;
      const sy = (y) => 196 - (y / ymax) * 170;
      const g = (n) => ex(n) - lin(n);
      let cross = 0;
      if (Math.log(v.a) < v.d) {
        let lo = 1e-6;
        let hi = 1;
        while (g(hi) < 0 && hi < 1e4) hi *= 2;
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2;
          if (g(mid) < 0) lo = mid;
          else hi = mid;
        }
        cross = hi;
      }
      const ahead = ex(v.n) > lin(v.n);
      return {
        svg: `<line class="ex-axis" x1="30" y1="196" x2="310" y2="196"/><line class="ex-axis" x1="30" y1="14" x2="30" y2="196"/>
          ${Array.from({ length: 11 }, (_, i) => `<text class="ex-tiny" x="${sx(i)}" y="210">${i}</text>`).join('')}<text class="ex-tiny" x="16" y="${n1(sy(ymax / 1.15))}">${fmt(ymax / 1.15, 0)}</text>
          ${cross > 0 && cross <= v.n ? `<line class="ex-grid" x1="${n1(sx(cross))}" y1="14" x2="${n1(sx(cross))}" y2="196" style="stroke-dasharray:4 4"/>` : '<g/>'}
          <g class="exc-o"><path class="ex-stroke" d="${plot(lin, 0, v.n, sx, sy, 60)}"/><circle class="ex-fill" cx="${n1(sx(v.n))}" cy="${n1(sy(lin(v.n)))}" r="5"/></g>
          <g class="exc-p"><path class="ex-stroke" d="${plot(ex, 0, v.n, sx, sy, 80)}"/><circle class="ex-fill" cx="${n1(sx(v.n))}" cy="${n1(sy(ex(v.n)))}" r="5"/></g>
          <text class="ex-tag tc exc-o" x="40" y="22">1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}</text><text class="ex-tag tc exc-p" x="40" y="40">${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}</text>`,
        caption: L(
          `After ${fmt(v.n)} steps: linear 1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}, exponential ${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}. ${cross > 0 ? `The exponential overtakes at n ≈ ${fmt(cross)}${ahead ? ' - and then runs away.' : '.'}` : 'Here the exponential is ahead from the very start.'}`,
          `Через ${fmt(v.n)} шагов: линейный рост 1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}, показательный ${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}. ${cross > 0 ? `Показательный обгоняет при n ≈ ${fmt(cross)}${ahead ? ' - и дальше улетает вверх.' : '.'}` : 'Здесь показательный рост впереди с самого начала.'}`,
          `${fmt(v.n)} қадамнан кейін: сызықтық өсу 1 + ${fmt(v.d)}·n = ${fmt(lin(v.n))}, көрсеткіштік ${fmt(v.a)}ⁿ = ${fmt(ex(v.n))}. ${cross > 0 ? `Көрсеткіштік өсу n ≈ ${fmt(cross)} кезінде озады${ahead ? ' - содан кейін жоғары ұшып кетеді.' : '.'}` : 'Мұнда көрсеткіштік өсу басынан алда.'}`,
        ),
      };
    },
  },

  logarithm: {
    title: L('The logarithm undoes a power', 'Логарифм - обратный к степени', 'Логарифм - дәрежеге кері амал'),
    intro: L('log_b(x) answers the question: to what power must b be raised to get x? Its graph is the mirror image of y = bˣ in the line y = x.', 'log_b(x) отвечает на вопрос: в какую степень нужно возвести b, чтобы получить x? Его график - зеркальное отражение y = bˣ относительно прямой y = x.', 'log_b(x) сұраққа жауап береді: x шығу үшін b-ны қандай дәрежеге шығару керек? Оның графигі y = bˣ графигінің y = x түзуіне қатысты айнадағы бейнесі.'),
    sliders: [
      { id: 'b', label: L('base b', 'основание b', 'негіз b'), min: 1.2, max: 4, step: C, value: 2 },
      { id: 'x', label: 'x', min: 0.1, max: 16, step: C, value: 8 },
    ],
    buttons: [L('x = 1', 'x = 1', 'x = 1'), L('x = b', 'x = b', 'x = b'), L('x = b²', 'x = b²', 'x = b²')],
    onButton: (i, st, v) => ({ x: clamp([1, v.b, v.b * v.b][i], 0.1, 16) }),
    draw(v) {
      const { b, x } = v;
      const y = Math.log(x) / Math.log(b);
      const sx = (X) => 30 + X * 10;
      const sy = (Y) => 170 - Y * 10;
      const lg = plot((X) => Math.log(X) / Math.log(b), 0.02, 29, sx, sy, 160);
      const pw = plot((X) => b ** X, -3, Math.log(22) / Math.log(b), sx, sy, 100);
      const P = [sx(x), sy(y)];
      const Q = [sx(y), sy(x)];
      return {
        svg: `${axes(sx, sy, [-3, 29], [-5, 17])}<line class="ex-ideal" x1="${sx(-3)}" y1="${sy(-3)}" x2="${sx(20)}" y2="${sy(20)}" style="opacity:.5"/>
          <path class="ex-curve thin" d="${pw}"/><path class="ex-curve" d="${lg}"/>
          <g class="exc-m"><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(P[0])}" y1="${n1(P[1])}" x2="${n1(Q[0])}" y2="${n1(Q[1])}"/><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(P[0])}" y1="${n1(P[1])}" x2="${n1(P[0])}" y2="${sy(0)}"/><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(P[0])}" y1="${n1(P[1])}" x2="${sx(0)}" y2="${n1(P[1])}"/></g>
          <circle class="ex-dot" cx="${n1(P[0])}" cy="${n1(clamp(P[1], -10, 230))}" r="6"/><circle class="ex-dot dot-root" cx="${n1(clamp(Q[0], -10, 330))}" cy="${n1(Q[1])}" r="5"/>
          <text class="ex-tag tc exc-p" x="200" y="150">y = log_${fmt(b)}(x)</text><text class="ex-tag t-sin" x="60" y="20">y = ${fmt(b)}ˣ</text>
          <text class="ex-tag" x="200" y="20">log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}</text>`,
        caption: L(
          `log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}, because ${fmt(b)}^${fmt(y)} ≈ ${fmt(x)}. ${x < 1 ? 'For x < 1 the logarithm is negative.' : Math.abs(x - 1) < 0.005 ? 'log of 1 is always 0: b⁰ = 1.' : 'The orange dot on y = bˣ is the same pair of numbers swapped.'}`,
          `log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}, потому что ${fmt(b)}^${fmt(y)} ≈ ${fmt(x)}. ${x < 1 ? 'При x < 1 логарифм отрицательный.' : Math.abs(x - 1) < 0.005 ? 'Логарифм единицы всегда 0: b⁰ = 1.' : 'Оранжевая точка на y = bˣ - та же пара чисел, только переставленная.'}`,
          `log_${fmt(b)}(${fmt(x)}) = ${fmt(y)}, себебі ${fmt(b)}^${fmt(y)} ≈ ${fmt(x)}. ${x < 1 ? 'x < 1 болғанда логарифм теріс.' : Math.abs(x - 1) < 0.005 ? 'Бірдің логарифмі әрқашан 0: b⁰ = 1.' : 'y = bˣ бойындағы қызғылт сары нүкте - орындары ауысқан сол сандар жұбы.'}`,
        ),
      };
    },
  },

  'sine-wave': {
    title: L('Waves: amplitude, frequency, phase', 'Волна: амплитуда, частота, фаза', 'Толқын: амплитуда, жиілік, фаза'),
    intro: L('y = A·sin(2π·f·t + φ). A is the height of the crest, f is how many waves fit in one second, φ shifts the wave sideways.', 'y = A·sin(2π·f·t + φ). A - высота гребня, f - сколько волн умещается за секунду, φ сдвигает волну вбок.', 'y = A·sin(2π·f·t + φ). A - толқын жотасының биіктігі, f - бір секундта неше толқын сыяды, φ толқынды бүйірге ығыстырады.'),
    sliders: [
      { id: 'A', label: 'A', min: 0.2, max: 2, step: C, value: 1 },
      { id: 'f', label: L('f, Hz', 'f, Гц', 'f, Гц'), min: 0.25, max: 3, step: C, value: 1 },
      { id: 'ph', label: 'φ, °', min: 0, max: 360, step: C, value: 0 },
    ],
    buttons: [L('▶ Shift the phase', '▶ Сдвигать фазу', '▶ Фазаны ығыстыру')],
    play: 'ph',
    playDur: 3000,
    playLinear: true,
    draw(v) {
      const sx = (tt) => 20 + tt * 145;
      const sy = (y) => 110 - y * 40;
      const w = (tt) => v.A * Math.sin(2 * Math.PI * v.f * tt + (v.ph * Math.PI) / 180);
      const T = 1 / v.f;
      const tc = ((((0.25 - v.ph / 360) % 1) + 1) % 1) * T;
      const top = sy(v.A);
      const t2 = tc + T <= 2 ? tc + T : tc - T;
      const [ta, tb] = [Math.min(tc, t2), Math.max(tc, t2)];
      return {
        svg: `<line class="ex-axis" x1="20" y1="110" x2="312" y2="110"/><line class="ex-axis" x1="20" y1="20" x2="20" y2="200"/>
          ${[0, 0.5, 1, 1.5, 2].map((s) => `<text class="ex-tiny" x="${sx(s)}" y="212">${fmt(s, 1)}</text>`).join('')}
          <path class="ex-stroke exc-m" style="opacity:.35;stroke-width:1.5" d="${plot((tt) => Math.sin(2 * Math.PI * tt), 0, 2, sx, sy, 160)}"/>
          <path class="ex-curve" d="${plot(w, 0, 2, sx, sy, 240)}"/>
          ${arrow(sx(tc), 110, sx(tc), top, 'exc-k', 2)}<text class="ex-tag tc exc-k" x="${n1(sx(tc) + 5)}" y="${n1((110 + top) / 2 + 4)}">A</text>
          ${ta >= 0 && tb <= 2.001 ? `<g class="exc-o"><line class="ex-stroke" style="stroke-width:1.5" x1="${n1(sx(ta))}" y1="${n1(top - 8)}" x2="${n1(sx(tb))}" y2="${n1(top - 8)}"/></g><text class="ex-tag tc exc-o" x="${n1(sx(ta) + 4)}" y="${n1(top - 13)}">T = ${fmt(T)} ${u('s', 'с', 'с')}</text>` : '<g/><g/>'}`,
        caption: L(
          `A = ${fmt(v.A)}: the crest rises ${fmt(v.A)} above the middle line. f = ${fmt(v.f)} Hz: ${fmt(v.f)} waves per second, so one wave lasts T = 1/f = ${fmt(T)} s. φ = ${fmt(v.ph)}° shifts the wave by ${fmt(v.ph / 360)} of a period. The grey wave is A = 1, f = 1, φ = 0.`,
          `A = ${fmt(v.A)}: гребень поднимается на ${fmt(v.A)} над средней линией. f = ${fmt(v.f)} Гц: ${fmt(v.f)} волны в секунду, значит одна волна длится T = 1/f = ${fmt(T)} с. φ = ${fmt(v.ph)}° сдвигает волну на ${fmt(v.ph / 360)} периода. Серая волна - A = 1, f = 1, φ = 0.`,
          `A = ${fmt(v.A)}: жота орта сызықтан ${fmt(v.A)}-ге көтеріледі. f = ${fmt(v.f)} Гц: секундына ${fmt(v.f)} толқын, демек бір толқын T = 1/f = ${fmt(T)} с созылады. φ = ${fmt(v.ph)}° толқынды периодтың ${fmt(v.ph / 360)} бөлігіне ығыстырады. Сұр толқын - A = 1, f = 1, φ = 0.`,
        ),
      };
    },
  },

  'circle-area': {
    title: L('Why the area of a circle is πr²', 'Почему площадь круга - πr²', 'Неліктен дөңгелектің ауданы πr²'),
    intro: L('Cut the circle into thin rings and straighten each one. The rings line up into a triangle with base 2πr (the circumference) and height r.', 'Разрежем круг на тонкие кольца и распрямим каждое. Кольца сложатся в треугольник с основанием 2πr (длина окружности) и высотой r.', 'Дөңгелекті жұқа сақиналарға бөліп, әрқайсысын түзейік. Сақиналар табаны 2πr (шеңбер ұзындығы), биіктігі r үшбұрыш құрайды.'),
    sliders: [
      { id: 'r', label: 'r', min: 1, max: 5, step: C, value: 3 },
      { id: 'k', label: L('unroll', 'развернуть', 'жазу'), min: 0, max: 1, step: C, value: 0 },
    ],
    buttons: [L('Unroll into a triangle', 'Развернуть в треугольник', 'Үшбұрышқа жазу'), L('Roll back', 'Свернуть обратно', 'Қайта орау')],
    onButton: (i) => ({ k: i === 0 ? 1 : 0, $dur: 1400 }),
    draw(v) {
      const { r, k } = v;
      const s = 9;
      const cx = 160;
      const cy = 95;
      const base = 200;
      const N = 10;
      const M = 36;
      const rings = Array.from({ length: N }, (_, j) => {
        const rho = (r * (j + 0.5)) / N;
        let d = '';
        for (let i = 0; i <= M; i++) {
          const q = i / M - 0.5;
          const th = 2 * Math.PI * q;
          const X = lerp(cx + rho * s * Math.sin(th), cx + 2 * Math.PI * rho * s * q, k);
          const Y = lerp(cy + rho * s * Math.cos(th), base - (r - rho) * s - (r * s) / N / 2, k);
          d += `${i ? 'L' : 'M'}${n1(X)} ${n1(Y)} `;
        }
        return `<path class="ex-ring2${j % 2 ? ' alt' : ''}" style="stroke-width:${n1((r * s) / N + 0.4)}" d="${d}"/>`;
      }).join('');
      const S = Math.PI * r * r;
      const lab = clamp(k * 2 - 1, 0, 1);
      return {
        svg: `${rings}<line class="ex-rad" x1="${cx}" y1="${cy}" x2="${n1(cx + r * s)}" y2="${cy}" opacity="${n1((1 - k) * 10) / 10}"/>
          <g opacity="${n1(lab * 10) / 10}"><text class="ex-small" x="${cx}" y="${base + 15}">2πr = ${fmt(2 * Math.PI * r)}</text><g class="exc-o"><line class="ex-stroke ex-dash" style="stroke-width:1.5" x1="${n1(cx + Math.PI * r * s + 8)}" y1="${base}" x2="${n1(cx + Math.PI * r * s + 8)}" y2="${n1(base - r * s)}"/></g><text class="ex-tag tc exc-o" x="${n1(cx + Math.PI * r * s + 12)}" y="${n1(base - (r * s) / 2 + 4)}">r</text></g>
          <text class="ex-tag" x="8" y="18">S = πr² = ${fmt(S)}</text>`,
        caption:
          k < 0.5
            ? L(`A circle of radius ${fmt(r)} is made of thin rings. Unroll them: the longest ring is the circumference 2πr = ${fmt(2 * Math.PI * r)}.`, `Круг радиуса ${fmt(r)} состоит из тонких колец. Развернём их: самое длинное кольцо - это длина окружности 2πr = ${fmt(2 * Math.PI * r)}.`, `Радиусы ${fmt(r)} дөңгелек жұқа сақиналардан тұрады. Оларды жазайық: ең ұзын сақина - шеңбер ұзындығы 2πr = ${fmt(2 * Math.PI * r)}.`)
            : L(`The rings became a triangle: base 2πr = ${fmt(2 * Math.PI * r)}, height r = ${fmt(r)}. Its area is ½ · 2πr · r = πr² = ${fmt(S)}.`, `Кольца превратились в треугольник: основание 2πr = ${fmt(2 * Math.PI * r)}, высота r = ${fmt(r)}. Его площадь ½ · 2πr · r = πr² = ${fmt(S)}.`, `Сақиналар үшбұрышқа айналды: табаны 2πr = ${fmt(2 * Math.PI * r)}, биіктігі r = ${fmt(r)}. Ауданы ½ · 2πr · r = πr² = ${fmt(S)}.`),
      };
    },
  },

  vectors: {
    title: L('Adding vectors', 'Сложение векторов', 'Векторларды қосу'),
    intro: L('To add two vectors, put the start of the second at the end of the first. The sum goes from the start of the first to the end of the second; coordinates simply add up.', 'Чтобы сложить векторы, приставим начало второго к концу первого. Сумма идёт из начала первого в конец второго, а координаты просто складываются.', 'Векторларды қосу үшін екіншісінің басын біріншісінің соңына қоямыз. Қосынды біріншісінің басынан екіншісінің соңына барады, ал координаталар жай ғана қосылады.'),
    sliders: [
      { id: 'bx', label: 'b: x', min: -4, max: 4, step: C, value: 1 },
      { id: 'by', label: 'b: y', min: -4, max: 4, step: C, value: 2.5 },
    ],
    buttons: [L('Move b to the end of a', 'Перенести b в конец a', 'b-ны a-ның соңына көшіру'), L('Parallelogram: b + a', 'Параллелограмм: b + a', 'Параллелограмм: b + a'), AGAIN],
    draw(v, step, st, f) {
      const ax = 3;
      const ay = 1;
      const { bx, by } = v;
      const P = (x, y) => [120 + x * 20, 130 - y * 20];
      const k1 = clamp(f, 0, 1);
      const k2 = clamp(f - 1, 0, 1);
      const O = P(0, 0);
      const A = P(ax, ay);
      const Bs = P(ax * k1, ay * k1);
      const Be = P(ax * k1 + bx, ay * k1 + by);
      const S = P(ax + bx, ay + by);
      const Bo = P(bx, by);
      const sx = Math.hypot(ax + bx, ay + by);
      return {
        svg: `${axes((x) => 120 + x * 20, (y) => 130 - y * 20, [-6, 10], [-5, 7])}
          <g opacity="${n1(k2 * 10) / 10}">${arrow(O[0], O[1], Bo[0], Bo[1], 'exc-b ex-faint', 2)}${arrow(Bo[0], Bo[1], S[0], S[1], 'exc-p ex-faint', 2)}</g>
          ${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(Bs[0], Bs[1], Be[0], Be[1], 'exc-b')}
          <g opacity="${n1(k1 * 10) / 10}">${arrow(O[0], O[1], S[0], S[1], 'exc-o', 3)}</g>
          <text class="ex-tag tc exc-p" x="${n1((O[0] + A[0]) / 2)}" y="${n1((O[1] + A[1]) / 2 + 16)}">a</text><text class="ex-tag tc exc-b" x="${n1((Bs[0] + Be[0]) / 2 + 6)}" y="${n1((Bs[1] + Be[1]) / 2)}">b</text>
          <text class="ex-tag tc exc-p" x="8" y="18">a = (3; 1)</text><text class="ex-tag tc exc-b" x="8" y="36">b = (${fmt(bx)}; ${fmt(by)})</text><text class="ex-tag tc exc-o" x="8" y="54" opacity="${n1(k1 * 10) / 10}">a + b = (${fmt(ax + bx)}; ${fmt(ay + by)})</text>`,
        caption: [
          L(`a = (3; 1), b = (${fmt(bx)}; ${fmt(by)}). To add them, move b so that it starts where a ends.`, `a = (3; 1), b = (${fmt(bx)}; ${fmt(by)}). Чтобы сложить, перенесём b так, чтобы он начинался в конце a.`, `a = (3; 1), b = (${fmt(bx)}; ${fmt(by)}). Қосу үшін b-ны a-ның соңынан басталатындай көшіреміз.`),
          L(`a + b goes from the start of a to the end of b: (3 + ${fmt(bx)}; 1 + ${fmt(by)}) = (${fmt(ax + bx)}; ${fmt(ay + by)}), length ${fmt(sx)}.`, `a + b идёт из начала a в конец b: (3 + ${fmt(bx)}; 1 + ${fmt(by)}) = (${fmt(ax + bx)}; ${fmt(ay + by)}), длина ${fmt(sx)}.`, `a + b a-ның басынан b-ның соңына барады: (3 + ${fmt(bx)}; 1 + ${fmt(by)}) = (${fmt(ax + bx)}; ${fmt(ay + by)}), ұзындығы ${fmt(sx)}.`),
          L(`Going along b first and then a ends in the same point: a + b = b + a. The sum is the diagonal of the parallelogram.`, `Если идти сначала по b, потом по a, придём в ту же точку: a + b = b + a. Сумма - диагональ параллелограмма.`, `Алдымен b, содан кейін a бойымен жүрсек, сол нүктеге келеміз: a + b = b + a. Қосынды - параллелограмның диагоналы.`),
        ][step],
      };
    },
  },

  systems: {
    title: L('A system of equations is two lines', 'Система уравнений - это две прямые', 'Теңдеулер жүйесі - екі түзу'),
    intro: L('Each linear equation is a line. The solution of the system is the point that lies on both lines - where they cross.', 'Каждое линейное уравнение - прямая. Решение системы - точка, которая лежит на обеих прямых, то есть их пересечение.', 'Әр сызықтық теңдеу - түзу. Жүйенің шешімі - екі түзуде де жатқан нүкте, яғни олардың қиылысуы.'),
    sliders: [
      { id: 'k1', label: 'k₁', min: -3, max: 3, step: C, value: 1 },
      { id: 'b1', label: 'b₁', min: -4, max: 4, step: C, value: -1 },
      { id: 'k2', label: 'k₂', min: -3, max: 3, step: C, value: -0.5 },
    ],
    buttons: [L('Make them parallel', 'Сделать параллельными', 'Параллель ету'), L('Make them the same line', 'Совместить прямые', 'Түзулерді беттестіру'), RESET],
    onButton: (i, st, v) => [{ k2: v.k1 }, { k2: v.k1, b1: 2 }, { k1: 1, b1: -1, k2: -0.5 }][i],
    draw(v) {
      const { k1, b1, k2 } = v;
      const b2 = 2;
      const sx = (x) => 160 + x * 20;
      const sy = (y) => 110 - y * 20;
      const par = Math.abs(k1 - k2) < 0.005;
      const same = par && Math.abs(b1 - b2) < 0.005;
      const X = par ? 0 : (b2 - b1) / (k1 - k2);
      const Y = k1 * X + b1;
      const line = (k, b, cls) => `<g class="${cls}"><path class="ex-stroke" d="M${sx(-9)} ${n1(sy(-9 * k + b))} L${sx(9)} ${n1(sy(9 * k + b))}"/></g>`;
      const vis = !par && Math.abs(X) < 8 && Math.abs(Y) < 6;
      return {
        svg: `${axes(sx, sy, [-8, 8], [-5, 5])}${line(k2, b2, 'exc-b')}${line(k1, b1, 'exc-p')}
          ${vis ? `<g class="exc-m"><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${n1(sx(X))}" y1="${n1(sy(Y))}" x2="${n1(sx(X))}" y2="${sy(0)}"/><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${n1(sx(X))}" y1="${n1(sy(Y))}" x2="${sx(0)}" y2="${n1(sy(Y))}"/></g><circle class="ex-dot dot-root" cx="${n1(sx(X))}" cy="${n1(sy(Y))}" r="6"/>` : '<g/><g/>'}
          <text class="ex-tag tc exc-p" x="8" y="18">${lineEq(k1, b1)}</text><text class="ex-tag tc exc-b" x="8" y="36">${lineEq(k2, b2)}</text>`,
        caption: same
          ? L('The lines coincide: every point of the line is a solution - infinitely many solutions.', 'Прямые совпали: каждая точка прямой - решение. Решений бесконечно много.', 'Түзулер беттесті: түзудің әр нүктесі - шешім. Шешімдер шексіз көп.')
          : par
            ? L(`k₁ = k₂ = ${fmt(k1)}: the lines are parallel and never meet - the system has no solutions.`, `k₁ = k₂ = ${fmt(k1)}: прямые параллельны и не пересекаются - у системы нет решений.`, `k₁ = k₂ = ${fmt(k1)}: түзулер параллель, қиылыспайды - жүйенің шешімі жоқ.`)
            : L(`Equate the right sides: ${fmt(k1)}x${term(b1)} = ${fmt(k2)}x + 2 → x = (2 − b₁)/(k₁ − k₂) = ${fmt(X)}, y = ${fmt(Y)}. Solution: (${fmt(X)}; ${fmt(Y)}).`, `Приравняем правые части: ${fmt(k1)}x${term(b1)} = ${fmt(k2)}x + 2 → x = (2 − b₁)/(k₁ − k₂) = ${fmt(X)}, y = ${fmt(Y)}. Решение: (${fmt(X)}; ${fmt(Y)}).`, `Оң жақтарын теңестіреміз: ${fmt(k1)}x${term(b1)} = ${fmt(k2)}x + 2 → x = (2 − b₁)/(k₁ − k₂) = ${fmt(X)}, y = ${fmt(Y)}. Шешімі: (${fmt(X)}; ${fmt(Y)}).`),
      };
    },
  },

  progression: {
    title: L('Arithmetic and geometric progressions', 'Арифметическая и геометрическая прогрессии', 'Арифметикалық және геометриялық прогрессиялар'),
    intro: L('An arithmetic progression adds the same number d each time; a geometric one multiplies by the same number q.', 'Арифметическая прогрессия каждый раз прибавляет одно и то же число d, геометрическая - умножает на одно и то же число q.', 'Арифметикалық прогрессия әр жолы бірдей d санын қосады, геометриялық - бірдей q санына көбейтеді.'),
    sliders: [
      { id: 'a1', label: 'a₁ = b₁', min: 0.5, max: 5, step: C, value: 1 },
      { id: 'd', label: 'd', min: 0, max: 3, step: C, value: 1 },
      { id: 'q', label: 'q', min: 0.5, max: 2, step: C, value: 1.5 },
    ],
    buttons: [L('q = 2: doubling', 'q = 2: удвоение', 'q = 2: екі еселену'), L('d = 0 and q = 1', 'd = 0 и q = 1', 'd = 0 және q = 1')],
    onButton: (i) => [{ q: 2 }, { d: 0, q: 1 }][i],
    draw(v) {
      const { a1, d, q } = v;
      const ar = Array.from({ length: 8 }, (_, i) => a1 + i * d);
      const ge = Array.from({ length: 8 }, (_, i) => a1 * q ** i);
      const top = Math.max(...ar, ...ge);
      const h = (x) => (x / top) * 140;
      const bars = ar
        .map((x, i) => `<rect class="ex-pbar exc-o" x="${22 + i * 37}" y="${n1(186 - h(x))}" width="15" height="${n1(h(x))}" rx="3"/><rect class="ex-pbar exc-p" x="${38 + i * 37}" y="${n1(186 - h(ge[i]))}" width="15" height="${n1(h(ge[i]))}" rx="3"/><text class="ex-tiny" x="${37 + i * 37}" y="200">${i + 1}</text>`)
        .join('');
      const S8 = ((ar[0] + ar[7]) * 8) / 2;
      return {
        svg: `<line class="ex-axis" x1="16" y1="186" x2="314" y2="186"/>${bars}
          <text class="ex-tag tc exc-o" x="8" y="18">aₙ = a₁ + (n − 1)d: a₈ = ${fmt(ar[7])}</text><text class="ex-tag tc exc-p" x="8" y="36">bₙ = b₁·qⁿ⁻¹: b₈ = ${fmt(ge[7])}</text>`,
        caption: L(
          `Arithmetic (orange): +${fmt(d)} each time, a₈ = ${fmt(a1)} + 7·${fmt(d)} = ${fmt(ar[7])}, sum S₈ = (a₁ + a₈)·8/2 = ${fmt(S8)}. Geometric (purple): ×${fmt(q)} each time, b₈ = ${fmt(a1)}·${fmt(q)}⁷ = ${fmt(ge[7])}.${q < 1 ? ' With q < 1 the terms shrink.' : ''}`,
          `Арифметическая (оранжевая): каждый раз +${fmt(d)}, a₈ = ${fmt(a1)} + 7·${fmt(d)} = ${fmt(ar[7])}, сумма S₈ = (a₁ + a₈)·8/2 = ${fmt(S8)}. Геометрическая (фиолетовая): каждый раз ×${fmt(q)}, b₈ = ${fmt(a1)}·${fmt(q)}⁷ = ${fmt(ge[7])}.${q < 1 ? ' При q < 1 члены уменьшаются.' : ''}`,
          `Арифметикалық (қызғылт сары): әр жолы +${fmt(d)}, a₈ = ${fmt(a1)} + 7·${fmt(d)} = ${fmt(ar[7])}, қосынды S₈ = (a₁ + a₈)·8/2 = ${fmt(S8)}. Геометриялық (күлгін): әр жолы ×${fmt(q)}, b₈ = ${fmt(a1)}·${fmt(q)}⁷ = ${fmt(ge[7])}.${q < 1 ? ' q < 1 болғанда мүшелер кемиді.' : ''}`,
        ),
      };
    },
  },

  'mean-median': {
    title: L('Mean and median', 'Среднее и медиана', 'Орта мән және медиана'),
    intro: L('Drag the dots. The mean is the balance point of all values; the median is the middle value after sorting. One outlier pulls the mean, but hardly moves the median.', 'Перетаскивай точки. Среднее - точка равновесия всех значений, медиана - значение посередине после сортировки. Один выброс тянет среднее, а медиана почти не двигается.', 'Нүктелерді сүйре. Орта мән - барлық мәндердің тепе-теңдік нүктесі, медиана - сұрыптаудан кейінгі ортадағы мән. Бір шығыңқы мән орта мәнді тартады, ал медиана әрең қозғалады.'),
    values: { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7 },
    sliders: [{ id: 'p6', label: L('last value', 'последнее значение', 'соңғы мән'), min: 0, max: 20, step: C, value: 8.5 }],
    buttons: [L('Add an outlier', 'Добавить выброс', 'Шығыңқы мән қосу'), RESET],
    onButton: (i) => [{ p6: 19.5 }, { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7, p6: 8.5 }][i],
    onDrag(key, p, v) {
      v[key] = Math.round(clamp((p.x - 20) / 14, 0, 20) * 100) / 100;
    },
    draw(v) {
      const ks = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
      const xs = ks.map((k) => v[k]);
      const sorted = [...xs].sort((a, b) => a - b);
      const sum = xs.reduce((s, x) => s + x, 0);
      const mean = sum / 7;
      const med = sorted[3];
      const sx = (x) => 20 + x * 14;
      const dots = ks
        .map((k, i) => {
          const y = 66 + i * 12;
          return `<line class="ex-grid" x1="${n1(sx(v[k]))}" y1="${y}" x2="${n1(sx(v[k]))}" y2="160"/><circle class="ex-dot" cx="${n1(sx(v[k]))}" cy="${y}" r="6"/><circle class="ex-hit" data-drag="${k}" cx="${n1(sx(v[k]))}" cy="${y}" r="12"/>`;
        })
        .join('');
      const chips = sorted.map((x, i) => `<rect class="ex-chip${i === 3 ? ' mid' : ''}" x="${16 + i * 42}" y="10" width="38" height="22" rx="7"/><text class="ex-tiny ex-chipt" x="${35 + i * 42}" y="25">${fmt(x, 1)}</text>`).join('');
      return {
        svg: `${chips}<line class="ex-axis" x1="20" y1="160" x2="300" y2="160"/>${[0, 5, 10, 15, 20].map((x) => `<text class="ex-tiny" x="${sx(x)}" y="174">${x}</text>`).join('')}${dots}
          <path class="ex-fill exc-o" d="M${n1(sx(mean))} 162 l-9 16 h18 Z"/><text class="ex-tag tc exc-o" x="${n1(clamp(sx(mean) + 12, 0, 250))}" y="194">x̄ = ${fmt(mean)}</text>
          <g class="exc-g"><line class="ex-stroke" style="stroke-width:3" x1="${n1(sx(med))}" y1="44" x2="${n1(sx(med))}" y2="160"/></g><text class="ex-tag tc exc-g" x="${n1(clamp(sx(med) + 6, 0, 250))}" y="52">Me = ${fmt(med)}</text>`,
        caption: L(
          `Mean = sum ÷ 7 = ${fmt(sum)} ÷ 7 = ${fmt(mean)} (the balance point, orange). Median = the 4th of 7 sorted values = ${fmt(med)} (green).${Math.abs(mean - med) > 1.5 ? ' They differ a lot - a far-away value drags the mean, not the median.' : ''}`,
          `Среднее = сумма ÷ 7 = ${fmt(sum)} ÷ 7 = ${fmt(mean)} (точка равновесия, оранжевая). Медиана = 4-е из 7 упорядоченных значений = ${fmt(med)} (зелёная).${Math.abs(mean - med) > 1.5 ? ' Они сильно разошлись: далёкое значение тянет среднее, но не медиану.' : ''}`,
          `Орта мән = қосынды ÷ 7 = ${fmt(sum)} ÷ 7 = ${fmt(mean)} (тепе-теңдік нүктесі, қызғылт сары). Медиана = реттелген 7 мәннің 4-сі = ${fmt(med)} (жасыл).${Math.abs(mean - med) > 1.5 ? ' Олар қатты алшақтады: алыс мән орта мәнді тартады, медиананы емес.' : ''}`,
        ),
      };
    },
  },

  ohm: {
    title: L("Ohm's law: I = U / R", 'Закон Ома: I = U / R', 'Ом заңы: I = U / R'),
    intro: L('Voltage pushes the charges, resistance holds them back. The current is voltage divided by resistance - and the bulb shines brighter when more current flows.', 'Напряжение толкает заряды, сопротивление их тормозит. Сила тока - это напряжение, делённое на сопротивление; чем больше ток, тем ярче лампа.', 'Кернеу зарядтарды итереді, кедергі оларды тежейді. Ток күші - кернеуді кедергіге бөлгенге тең; ток неғұрлым көп болса, шам соғұрлым жарқын.'),
    sliders: [
      { id: 'U', label: L('U, V', 'U, В', 'U, В'), min: 0, max: 12, step: C, value: 6 },
      { id: 'R', label: L('R, Ω', 'R, Ом', 'R, Ом'), min: 1, max: 20, step: C, value: 4 },
    ],
    buttons: [L('U × 2', 'U × 2', 'U × 2'), L('R × 2', 'R × 2', 'R × 2'), RESET],
    onButton: (i, st, v) => [{ U: clamp(v.U * 2, 0, 12) }, { R: clamp(v.R * 2, 1, 20) }, { U: 6, R: 4 }][i],
    state: () => ({ ph: 0 }),
    live(dt, v, st) {
      st.ph = (st.ph + dt * (v.U / v.R) * 45) % 740;
    },
    draw(v, step, st) {
      const I = v.U / v.R;
      const b = clamp(I / 3, 0, 1);
      const P = v.U * I;
      // Электроны бегут по прямоугольному контуру.
      const along = (s) => {
        s = ((s % 740) + 740) % 740;
        if (s < 240) return [40 + s, 50];
        if (s < 370) return [280, 50 + (s - 240)];
        if (s < 610) return [280 - (s - 370), 180];
        return [40, 180 - (s - 610)];
      };
      const el = Array.from({ length: 20 }, (_, i) => {
        const [x, y] = along(i * 37 + st.ph);
        return `<circle class="ex-fill exc-b" cx="${n1(x)}" cy="${n1(y)}" r="${I > 0.005 ? 2.6 : 0}"/>`;
      }).join('');
      const V = u('V', 'В', 'В');
      const A = u('A', 'А', 'А');
      const Om = u('Ω', 'Ом', 'Ом');
      return {
        svg: `<path class="ex-wire" d="M40 50 H280 V180 H40 Z"/>
          <rect class="ex-res" x="125" y="40" width="70" height="20" rx="5"/><text class="ex-small" x="160" y="32">R = ${fmt(v.R)} ${Om}</text>
          <rect x="30" y="98" width="20" height="34" style="fill:var(--surface)"/><line class="ex-batt" x1="26" y1="104" x2="54" y2="104"/><line class="ex-batt thin" x1="32" y1="126" x2="48" y2="126"/><text class="ex-tag" x="58" y="120">U = ${fmt(v.U)} ${V}</text>
          ${el}
          <circle class="ex-glow" cx="280" cy="115" r="${n1(16 + 26 * b)}" opacity="${n1(b * 80) / 100}"/><circle class="ex-bulb" cx="280" cy="115" r="16" style="fill:color-mix(in srgb, var(--yellow) ${Math.round(b * 100)}%, var(--surface))"/><path class="ex-fil" d="M272 118 l4 -8 l4 8 l4 -8 l4 8"/>
          <text class="ex-big" x="160" y="125">I = ${fmt(I)} ${A}</text><text class="ex-small" x="160" y="150">${fmt(v.U)} ${V} ÷ ${fmt(v.R)} ${Om}</text><text class="ex-tag" x="8" y="210">P = U·I = ${fmt(P)} ${u('W', 'Вт', 'Вт')}</text>`,
        caption: L(
          `I = U / R = ${fmt(v.U)} V ÷ ${fmt(v.R)} Ω = ${fmt(I)} A. Double the voltage - the current doubles and the bulb gets brighter; double the resistance - the current halves. Power P = U·I = ${fmt(P)} W.`,
          `I = U / R = ${fmt(v.U)} В ÷ ${fmt(v.R)} Ом = ${fmt(I)} А. Увеличь напряжение вдвое - ток вырастет вдвое и лампа станет ярче; увеличь вдвое сопротивление - ток уменьшится вдвое. Мощность P = U·I = ${fmt(P)} Вт.`,
          `I = U / R = ${fmt(v.U)} В ÷ ${fmt(v.R)} Ом = ${fmt(I)} А. Кернеуді екі есе арттыр - ток екі есе өседі, шам жарқырайды; кедергіні екі есе арттыр - ток екі есе азаяды. Қуат P = U·I = ${fmt(P)} Вт.`,
        ),
      };
    },
  },

  lens: {
    title: L('How a lens makes an image', 'Как линза строит изображение', 'Линза кескінді қалай құрады'),
    intro: L('A ray parallel to the axis passes through the focus after the lens; a ray through the centre goes straight. Where they meet, the image appears.', 'Луч, параллельный оси, после линзы проходит через фокус; луч через центр линзы идёт не преломляясь. Где они встретятся - там изображение.', 'Оске параллель сәуле линзадан кейін фокус арқылы өтеді; линза ортасы арқылы өтетін сәуле сынбайды. Олар қай жерде кездессе - кескін сонда.'),
    sliders: [
      { id: 'd', label: L('object distance d', 'до предмета d', 'нәрсеге дейін d'), min: 0.5, max: 8, step: C, value: 5 },
      { id: 'F', label: L('focal length F', 'фокус F', 'фокус F'), min: 1, max: 4, step: C, value: 2 },
    ],
    buttons: [L('d = 2F', 'd = 2F', 'd = 2F'), L('d < F: magnifier', 'd < F: лупа', 'd < F: лупа')],
    onButton: (i, st, v) => [{ d: clamp(2 * v.F, 0.5, 8) }, { d: v.F * 0.6 }][i],
    draw(v) {
      const { d, F } = v;
      const s = 18;
      const L0 = 170;
      const ax = 120;
      const h = 2;
      const Xo = L0 - d * s;
      const Yt = ax - h * s;
      const none = Math.abs(d - F) < 0.01;
      const di = none ? Infinity : (d * F) / (d - F);
      const real = di > 0;
      const hi = -h * (di / d);
      const Xi = L0 + di * s;
      const Yi = ax - hi * s;
      const far = (x1, y1, x2, y2) => {
        const k = 600 / (Math.hypot(x2 - x1, y2 - y1) || 1);
        return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
      };
      const r1 = far(L0, Yt, L0 + F * s, ax);
      const r2 = far(Xo, Yt, L0, ax);
      const back = !none && !real ? `<g class="exc-m"><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${L0}" y1="${n1(Yt)}" x2="${n1(Xi)}" y2="${n1(Yi)}"/><line class="ex-stroke ex-dash" style="stroke-width:1.2" x1="${L0}" y1="${ax}" x2="${n1(Xi)}" y2="${n1(Yi)}"/></g>` : '<g/>';
      const img = none || Math.abs(Xi) > 2000 ? '<g/>' : arrow(Xi, ax, Xi, Yi, `exc-k${real ? '' : ' ex-faint'}`, 3);
      const marks = [-2, -1, 1, 2].map((m) => `<circle class="ex-fill exc-m" cx="${L0 + m * F * s}" cy="${ax}" r="2.5"/><text class="ex-tiny" x="${L0 + m * F * s}" y="${ax + 14}">${Math.abs(m) === 2 ? '2F' : 'F'}</text>`).join('');
      const G = Math.abs(di / d);
      return {
        svg: `<line class="ex-axis" x1="0" y1="${ax}" x2="${W}" y2="${ax}"/><path class="ex-lens" d="M${L0} 40 Q${L0 + 12} ${ax} ${L0} 200 Q${L0 - 12} ${ax} ${L0} 40 Z"/>${marks}
          <g class="exc-o"><path class="ex-stroke" style="stroke-width:1.6" d="M${n1(Xo)} ${n1(Yt)} L${L0} ${n1(Yt)} L${n1(r1[0])} ${n1(r1[1])}"/><path class="ex-stroke" style="stroke-width:1.6" d="M${n1(Xo)} ${n1(Yt)} L${n1(r2[0])} ${n1(r2[1])}"/></g>${back}
          ${arrow(Xo, ax, Xo, Yt, 'exc-p', 3)}${img}
          <text class="ex-tag" x="8" y="18">1/d + 1/f = 1/F</text><text class="ex-tag" x="8" y="36">f = ${none ? '∞' : fmt(di)}</text>`,
        caption: none
          ? L('d = F: after the lens the rays go parallel and never meet - there is no image.', 'd = F: после линзы лучи идут параллельно и не встречаются - изображения нет.', 'd = F: линзадан кейін сәулелер параллель жүреді, кездеспейді - кескін жоқ.')
          : real
            ? L(`d = ${fmt(d)} > F: the image is real and upside down at f = dF/(d − F) = ${fmt(di)}, magnified ${fmt(G)}×${d > 2 * F ? ' (smaller than the object, like in a camera)' : d < 2 * F ? ' (bigger than the object, like in a projector)' : ' (same size at d = 2F)'}.`, `d = ${fmt(d)} > F: изображение действительное и перевёрнутое, на расстоянии f = dF/(d − F) = ${fmt(di)}, увеличение ${fmt(G)}×${d > 2 * F ? ' (меньше предмета, как в фотоаппарате)' : d < 2 * F ? ' (больше предмета, как в проекторе)' : ' (того же размера при d = 2F)'}.`, `d = ${fmt(d)} > F: кескін нақты және төңкерілген, f = dF/(d − F) = ${fmt(di)} қашықтықта, үлкейту ${fmt(G)}×${d > 2 * F ? ' (нәрседен кіші, фотоаппараттағыдай)' : d < 2 * F ? ' (нәрседен үлкен, проектордағыдай)' : ' (d = 2F кезінде өлшемі бірдей)'}.`)
            : L(`d = ${fmt(d)} < F: the rays spread out after the lens; their dashed extensions meet in front of it. The image is virtual, upright and ${fmt(G)}× bigger - that is a magnifying glass.`, `d = ${fmt(d)} < F: после линзы лучи расходятся, а их пунктирные продолжения встречаются перед линзой. Изображение мнимое, прямое и увеличенное в ${fmt(G)} раза - так работает лупа.`, `d = ${fmt(d)} < F: линзадан кейін сәулелер тарайды, ал олардың пунктир жалғасы линзаның алдында кездеседі. Кескін жалған, тура және ${fmt(G)} есе үлкен - лупа осылай жұмыс істейді.`),
      };
    },
  },

  projectile: {
    title: L('A ball thrown at an angle', 'Бросок под углом к горизонту', 'Көкжиекке бұрыш жасай лақтыру'),
    intro: L('Horizontally the ball flies at a constant speed, vertically gravity slows it down and then speeds it up. Kinetic and potential energy trade places, but their sum stays the same.', 'По горизонтали мяч летит с постоянной скоростью, а по вертикали сила тяжести сначала тормозит его, потом разгоняет. Кинетическая и потенциальная энергия переходят друг в друга, а их сумма не меняется.', 'Көлденеңінен доп тұрақты жылдамдықпен ұшады, ал тігінен ауырлық күші алдымен тежейді, содан кейін үдетеді. Кинетикалық және потенциалдық энергия бір-біріне ауысады, бірақ қосындысы өзгермейді.'),
    sliders: [
      { id: 'v0', label: L('v₀, m/s', 'v₀, м/с', 'v₀, м/с'), min: 5, max: 30, step: C, value: 20 },
      { id: 'al', label: 'α, °', min: 5, max: 85, step: C, value: 60 },
      { id: 'tt', label: PROGRESS, min: 0, max: 100, step: C, value: 40 },
    ],
    buttons: [L('▶ Throw', '▶ Бросить', '▶ Лақтыру'), L('α = 45°: farthest', 'α = 45°: дальше всего', 'α = 45°: ең алыс')],
    onButton(i, st, v, api) {
      if (i === 1) return { al: 45 };
      api.play('tt', { linear: true, dur: 2600 });
      return null;
    },
    draw(v) {
      const g = 9.8;
      const a = (v.al * Math.PI) / 180;
      const vx = v.v0 * Math.cos(a);
      const vy0 = v.v0 * Math.sin(a);
      const T = (2 * vy0) / g;
      const R = vx * T;
      const Hm = (vy0 * vy0) / (2 * g);
      const tm = (v.tt / 100) * T;
      const s = 290 / 92;
      const X = (t2) => 15 + vx * t2 * s;
      const Y = (t2) => 200 - (vy0 * t2 - (g * t2 * t2) / 2) * s;
      const full = plot((t2) => Y(t2), 0, T, X, (y) => y, 80);
      const done = plot((t2) => Y(t2), 0, tm, X, (y) => y, 80);
      const bx = X(tm);
      const by = Y(tm);
      const vy = vy0 - g * tm;
      const E = (v.v0 * v.v0) / 2;
      const Ep = g * Math.max(0, vy0 * tm - (g * tm * tm) / 2);
      const kk = clamp((E - Ep) / E, 0, 1);
      const KE = u('KE', 'Eк', 'Eк');
      const PE = u('PE', 'Eп', 'Eп');
      return {
        svg: `<line class="ex-axis" x1="10" y1="200" x2="312" y2="200"/><path class="ex-stroke exc-m ex-dash" style="stroke-width:1.5" d="${full}"/><path class="ex-curve" d="${done || 'M0 0'}"/>
          ${arrow(bx, by, bx + vx * 2, by, 'exc-g', 2)}${arrow(bx, by, bx, by - vy * 2, 'exc-k', 2)}
          <circle class="ex-ball" cx="${n1(bx)}" cy="${n1(by)}" r="7"/>
          <rect class="ex-fill exc-o" x="200" y="12" width="${n1(110 * kk)}" height="12" rx="3"/><rect class="ex-fill exc-b" x="${n1(200 + 110 * kk)}" y="12" width="${n1(110 * (1 - kk))}" height="12" rx="3"/>
          <text class="ex-tag tc exc-o" x="200" y="38">${KE}</text><text class="ex-tag tc exc-b" x="282" y="38">${PE}</text>
          <text class="ex-tag" x="8" y="18">L = ${fmt(R, 1)} ${u('m', 'м', 'м')}</text><text class="ex-tag" x="8" y="36">H = ${fmt(Hm, 1)} ${u('m', 'м', 'м')}</text><text class="ex-tag" x="8" y="54">T = ${fmt(T)} ${u('s', 'с', 'с')}</text>`,
        caption: L(
          `Flight time T = 2v₀·sin α / g = ${fmt(T)} s, range L = v₀²·sin 2α / g = ${fmt(R, 1)} m, height H = ${fmt(Hm, 1)} m. The horizontal speed (green) stays ${fmt(vx)} m/s; the vertical one (pink) is now ${fmt(vy)} m/s. At the top KE is smallest, PE largest.`,
          `Время полёта T = 2v₀·sin α / g = ${fmt(T)} с, дальность L = v₀²·sin 2α / g = ${fmt(R, 1)} м, высота H = ${fmt(Hm, 1)} м. Горизонтальная скорость (зелёная) всё время ${fmt(vx)} м/с, вертикальная (розовая) сейчас ${fmt(vy)} м/с. В верхней точке Eк меньше всего, Eп больше всего.`,
          `Ұшу уақыты T = 2v₀·sin α / g = ${fmt(T)} с, қашықтық L = v₀²·sin 2α / g = ${fmt(R, 1)} м, биіктік H = ${fmt(Hm, 1)} м. Көлденең жылдамдық (жасыл) үнемі ${fmt(vx)} м/с, тік жылдамдық (қызғылт) қазір ${fmt(vy)} м/с. Ең жоғарғы нүктеде Eк ең аз, Eп ең көп.`,
        ),
      };
    },
  },

  pendulum: {
    title: L('The period of a pendulum', 'Период маятника', 'Маятниктің периоды'),
    intro: L('A pendulum swings with period T = 2π√(l/g). It depends only on the string length and gravity - not on the mass of the bob.', 'Маятник качается с периодом T = 2π√(l/g). Он зависит только от длины нити и силы тяжести - масса груза не важна.', 'Маятник T = 2π√(l/g) периодымен тербеледі. Ол тек жіптің ұзындығы мен ауырлық күшіне тәуелді - жүктің массасы маңызды емес.'),
    sliders: [
      { id: 'l', label: L('l, m', 'l, м', 'l, м'), min: 0.2, max: 2.5, step: C, value: 1 },
      { id: 'g', label: L('g, m/s²', 'g, м/с²', 'g, м/с²'), min: 1.6, max: 25, step: C, value: 9.81 },
    ],
    buttons: [L('Moon', 'Луна', 'Ай'), L('Earth', 'Земля', 'Жер'), L('Jupiter', 'Юпитер', 'Юпитер')],
    onButton: (i) => ({ g: [1.62, 9.81, 24.79][i] }),
    pressed: (i, v) => Math.abs(v.g - [1.62, 9.81, 24.79][i]) < 0.02,
    state: () => ({ ph: 0 }),
    live(dt, v, st) {
      st.ph = (st.ph + dt * Math.sqrt(v.g / v.l)) % (Math.PI * 2);
    },
    draw(v, step, st) {
      const T = 2 * Math.PI * Math.sqrt(v.l / v.g);
      const th0 = (20 * Math.PI) / 180;
      const th = th0 * Math.cos(st.ph);
      const Lp = v.l * 72;
      const px = 160;
      const py = 18;
      const bx = px + Lp * Math.sin(th);
      const by = py + Lp * Math.cos(th);
      const arc = `M${n1(px + Lp * Math.sin(-th0))} ${n1(py + Lp * Math.cos(th0))} A${n1(Lp)} ${n1(Lp)} 0 0 0 ${n1(px + Lp * Math.sin(th0))} ${n1(py + Lp * Math.cos(th0))}`;
      return {
        svg: `<line class="ex-axis" x1="110" y1="${py}" x2="210" y2="${py}" style="stroke-width:3"/><path class="ex-stroke exc-m ex-dash" style="stroke-width:1.2" d="${arc}"/><line class="ex-grid" x1="${px}" y1="${py}" x2="${px}" y2="${n1(py + Lp + 12)}"/>
          <line class="ex-rad" x1="${px}" y1="${py}" x2="${n1(bx)}" y2="${n1(by)}"/><circle class="ex-ball" cx="${n1(bx)}" cy="${n1(by)}" r="10"/>
          <text class="ex-tag" x="8" y="40">T = ${fmt(T)} ${u('s', 'с', 'с')}</text><text class="ex-tag" x="8" y="58">${fmt(60 / T, 1)} ${u('swings/min', 'кол./мин', 'тербеліс/мин')}</text>`,
        caption: L(
          `T = 2π·√(${fmt(v.l)} / ${fmt(v.g)}) = ${fmt(T)} s. A 4 times longer string gives a 2 times longer period. On the Moon gravity is weak, so the pendulum swings slowly; on Jupiter - fast.`,
          `T = 2π·√(${fmt(v.l)} / ${fmt(v.g)}) = ${fmt(T)} с. Нить в 4 раза длиннее - период в 2 раза больше. На Луне тяготение слабое, и маятник качается медленно, на Юпитере - быстро.`,
          `T = 2π·√(${fmt(v.l)} / ${fmt(v.g)}) = ${fmt(T)} с. Жіп 4 есе ұзын болса - период 2 есе артады. Айда тартылыс әлсіз, маятник баяу тербеледі, Юпитерде - жылдам.`,
        ),
      };
    },
  },

  newton: {
    title: L("Newton's second law: a = F / m", 'Второй закон Ньютона: a = F / m', 'Ньютонның екінші заңы: a = F / m'),
    intro: L('The same force speeds up a light cart faster than a heavy one. Acceleration is force divided by mass.', 'Одна и та же сила разгоняет лёгкую тележку быстрее, чем тяжёлую. Ускорение - это сила, делённая на массу.', 'Бірдей күш жеңіл арбаны ауырға қарағанда тезірек үдетеді. Үдеу - күшті массаға бөлгенге тең.'),
    sliders: [
      { id: 'F', label: L('F, N', 'F, Н', 'F, Н'), min: 0, max: 20, step: C, value: 8 },
      { id: 'm', label: L('m, kg', 'm, кг', 'm, кг'), min: 0.5, max: 10, step: C, value: 2 },
      { id: 'tt', label: L('t, s', 't, с', 't, с'), min: 0, max: 3, step: C, value: 1.5 },
    ],
    buttons: [L('▶ Push', '▶ Толкнуть', '▶ Итеру'), L('F × 2', 'F × 2', 'F × 2'), L('m × 2', 'm × 2', 'm × 2')],
    onButton(i, st, v, api) {
      if (i === 0) {
        api.play('tt', { linear: true, dur: 3000 });
        return null;
      }
      return i === 1 ? { F: clamp(v.F * 2, 0, 20) } : { m: clamp(v.m * 2, 0.5, 10) };
    },
    draw(v) {
      const a = v.F / v.m;
      const t2 = v.tt;
      const s = (a * t2 * t2) / 2;
      const vel = a * t2;
      const cw = 26 + v.m * 4;
      const ch = 18 + v.m * 2;
      const x = 40 + Math.min(s, 40) * 6.2;
      const ms = u('m/s', 'м/с', 'м/с');
      const vt = (tt) => 90 - (Math.min(a * tt, 60) / 60) * 66;
      return {
        svg: `<line class="ex-road" x1="10" y1="180" x2="312" y2="180"/><line class="ex-axis" x1="${40 + 40 * 6.2 + 26}" y1="140" x2="${40 + 40 * 6.2 + 26}" y2="180" style="stroke-width:3"/>
          <g transform="translate(${n1(x)} 0)"><rect class="ex-cart" x="0" y="${n1(172 - ch)}" width="${n1(cw)}" height="${n1(ch)}" rx="4"/><circle class="ex-wheel" cx="${n1(cw * 0.25)}" cy="174" r="5"/><circle class="ex-wheel" cx="${n1(cw * 0.75)}" cy="174" r="5"/><text class="ex-tiny ex-cartt" x="${n1(cw / 2)}" y="${n1(172 - ch / 2 + 4)}">${fmt(v.m, 1)}</text></g>
          ${v.F > 0.05 ? arrow(x - 6 - v.F * 3.2, 172 - ch / 2, x - 3, 172 - ch / 2, 'exc-o', 3) : '<g/>'}
          <line class="ex-axis" x1="210" y1="90" x2="312" y2="90"/><line class="ex-axis" x1="210" y1="20" x2="210" y2="90"/><g class="exc-p"><path class="ex-stroke" d="M210 90 L${n1(210 + t2 * 33)} ${n1(vt(t2))}"/><path class="ex-stroke ex-dash ex-faint" style="stroke-width:1.5" d="M210 90 L309 ${n1(vt(3))}"/></g><text class="ex-tiny" x="300" y="102">t</text><text class="ex-tiny" x="202" y="26">v</text>
          <text class="ex-tag" x="8" y="18">a = F / m = ${fmt(a)} ${u('m/s²', 'м/с²', 'м/с²')}</text><text class="ex-tag" x="8" y="36">v = a·t = ${fmt(vel)} ${ms}</text><text class="ex-tag" x="8" y="54">s = a·t²/2 = ${fmt(s)} ${u('m', 'м', 'м')}</text>`,
        caption: L(
          `a = F / m = ${fmt(v.F)} N ÷ ${fmt(v.m)} kg = ${fmt(a)} m/s². Twice the force → twice the acceleration; twice the mass → half of it. After ${fmt(t2)} s the cart moves at ${fmt(vel)} m/s.`,
          `a = F / m = ${fmt(v.F)} Н ÷ ${fmt(v.m)} кг = ${fmt(a)} м/с². Сила вдвое больше → ускорение вдвое больше; масса вдвое больше → ускорение вдвое меньше. Через ${fmt(t2)} с скорость тележки ${fmt(vel)} м/с.`,
          `a = F / m = ${fmt(v.F)} Н ÷ ${fmt(v.m)} кг = ${fmt(a)} м/с². Күш екі есе көп → үдеу екі есе көп; масса екі есе көп → үдеу екі есе аз. ${fmt(t2)} с кейін арбаның жылдамдығы ${fmt(vel)} м/с.`,
        ),
      };
    },
  },

  gas: {
    title: L('Gas in a cylinder: pressure, volume, temperature', 'Газ под поршнем: давление, объём, температура', 'Поршень астындағы газ: қысым, көлем, температура'),
    intro: L('Pressure is the molecules hitting the walls. Squeeze the gas - they hit more often; heat it - they move faster. For a fixed amount of gas pV/T stays constant.', 'Давление - это удары молекул о стенки. Сожмёшь газ - удары чаще, нагреешь - молекулы быстрее. Для данной массы газа pV/T не меняется.', 'Қысым - молекулалардың қабырғаға соқтығысуы. Газды сықсаң - соққылар жиілейді, қыздырсаң - молекулалар жылдамдайды. Газдың берілген массасы үшін pV/T өзгермейді.'),
    sliders: [
      { id: 'V', label: L('V, L', 'V, л', 'V, л'), min: 1, max: 4, step: C, value: 2 },
      { id: 'T', label: L('T, K', 'T, К', 'T, К'), min: 150, max: 600, step: C, value: 300 },
    ],
    buttons: [L('Compress ×2', 'Сжать в 2 раза', '2 есе сығу'), L('Heat ×2', 'Нагреть в 2 раза', '2 есе қыздыру'), RESET],
    onButton: (i, st, v) => [{ V: clamp(v.V / 2, 1, 4) }, { T: clamp(v.T * 2, 150, 600) }, { V: 2, T: 300 }][i],
    state: () => {
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      return { m: Array.from({ length: 28 }, () => ({ x: rnd() * 180, y: rnd() * 80, a: rnd() * Math.PI * 2 })) };
    },
    live(dt, v, st) {
      const h = v.V * 42;
      const sp = 90 * Math.sqrt(v.T / 300);
      for (const p of st.m) {
        p.x += Math.cos(p.a) * sp * dt;
        p.y += Math.sin(p.a) * sp * dt;
        if (p.x < 0 || p.x > 180) {
          p.x = clamp(p.x, 0, 180);
          p.a = Math.PI - p.a;
        }
        if (p.y < 0 || p.y > h) {
          p.y = clamp(p.y, 0, h);
          p.a = -p.a;
        }
      }
    },
    draw(v, step, st) {
      const p = 100 * (v.T / 300) * (2 / v.V);
      const h = v.V * 42;
      const top = 196 - h;
      const hue = Math.round(220 - ((v.T - 150) / 450) * 220);
      const mol = st.m.map((m) => `<circle cx="${n1(70 + m.x)}" cy="${n1(196 - Math.min(m.y, h))}" r="4" style="fill:hsl(${hue} 80% 55%)"/>`).join('');
      const ang = -135 + 270 * clamp(p / 400, 0, 1);
      const ra = (ang * Math.PI) / 180;
      const th = clamp((v.T - 150) / 450, 0, 1);
      return {
        svg: `<path class="ex-cyl" d="M64 20 V200 H256 V20"/><rect class="ex-piston" x="66" y="${n1(top - 12)}" width="188" height="12" rx="3"/><line class="ex-rod" x1="160" y1="${n1(top - 12)}" x2="160" y2="4"/>${mol}
          <circle class="ex-ring" cx="290" cy="70" r="22"/><line class="ex-rad" x1="290" y1="70" x2="${n1(290 + 18 * Math.sin(ra))}" y2="${n1(70 - 18 * Math.cos(ra))}"/><text class="ex-tiny" x="290" y="108">p</text>
          <rect class="ex-thermo" x="24" y="40" width="12" height="150" rx="6"/><rect x="26" y="${n1(188 - 146 * th)}" width="8" height="${n1(146 * th)}" rx="4" style="fill:hsl(${hue} 80% 55%)"/><text class="ex-tiny" x="30" y="206">T</text>
          <text class="ex-small" x="290" y="140">${fmt(p, 1)}</text><text class="ex-tiny" x="290" y="154">${u('kPa', 'кПа', 'кПа')}</text>`,
        caption: L(
          `p = ${fmt(p, 1)} kPa. pV/T = ${fmt(p, 1)}·${fmt(v.V)}/${fmt(v.T)} = ${fmt((p * v.V) / v.T, 3)} - always the same. Halve the volume → the pressure doubles; double the temperature (in kelvins) → the pressure doubles too.`,
          `p = ${fmt(p, 1)} кПа. pV/T = ${fmt(p, 1)}·${fmt(v.V)}/${fmt(v.T)} = ${fmt((p * v.V) / v.T, 3)} - всегда одно и то же. Объём меньше вдвое → давление вдвое больше; температура (в кельвинах) вдвое выше → давление тоже вдвое больше.`,
          `p = ${fmt(p, 1)} кПа. pV/T = ${fmt(p, 1)}·${fmt(v.V)}/${fmt(v.T)} = ${fmt((p * v.V) / v.T, 3)} - әрқашан бірдей. Көлем екі есе азайса → қысым екі есе артады; температура (кельвинмен) екі есе артса → қысым да екі есе артады.`,
        ),
      };
    },
  },

  ph: {
    title: L('The pH scale', 'Шкала pH', 'pH шкаласы'),
    intro: L('pH shows how acidic or alkaline a solution is: below 7 - acid, 7 - neutral, above 7 - alkali. One step on the scale means 10 times more or fewer H⁺ ions.', 'pH показывает, насколько раствор кислый или щелочной: меньше 7 - кислота, 7 - нейтральный, больше 7 - щёлочь. Шаг шкалы на 1 - это в 10 раз больше или меньше ионов H⁺.', 'pH ерітіндінің қаншалықты қышқыл не сілтілі екенін көрсетеді: 7-ден аз - қышқыл, 7 - бейтарап, 7-ден көп - сілті. Шкаладағы 1 қадам - H⁺ иондары 10 есе көп не аз деген сөз.'),
    sliders: [{ id: 'pH', label: 'pH', min: 0, max: 14, step: C, value: 7 }],
    buttons: [L('Lemon juice', 'Лимонный сок', 'Лимон шырыны'), L('Pure water', 'Чистая вода', 'Таза су'), L('Soap', 'Мыло', 'Сабын')],
    onButton: (i) => ({ pH: [2.4, 7, 10][i] }),
    draw(v) {
      const hue = (x) => (x <= 7 ? (x / 7) * 120 : 120 + ((x - 7) / 7) * 160);
      const col = (x) => `hsl(${Math.round(hue(x))} 75% 52%)`;
      const scale = Array.from({ length: 15 }, (_, i) => `<rect x="${20 + i * 18.67}" y="176" width="19" height="16" style="fill:${col(i)}"/>`).join('');
      const nH = Math.round(12 * clamp(0.5 + (7 - v.pH) / 12, 0, 1));
      const ions = Array.from({ length: 12 }, (_, i) => {
        const x = 124 + (i % 4) * 24 + (Math.floor(i / 4) % 2) * 10;
        const y = 98 + Math.floor(i / 4) * 22;
        const hp = i < nH;
        return `<text class="ex-tiny ex-ion${hp ? '' : ' oh'}" x="${x}" y="${y}">${hp ? 'H⁺' : 'OH⁻'}</text>`;
      }).join('');
      const px = 20 + (v.pH / 14) * 280;
      const neutral = Math.abs(v.pH - 7) < 0.005;
      const ratio = 10 ** Math.abs(7 - v.pH);
      const kind = (acid, neu, base) => (neutral ? neu : v.pH < 7 ? acid : base);
      const exp = fmt(-v.pH);
      return {
        svg: `<path class="ex-beaker" d="M110 40 V160 Q110 168 118 168 H202 Q210 168 210 160 V40"/><path d="M112 72 H208 V160 Q208 166 202 166 H118 Q112 166 112 160 Z" style="fill:${col(v.pH)};opacity:.55"/>${ions}
          ${scale}<path class="ex-fill" style="color:var(--ink)" d="M${n1(px)} 174 l-7 -12 h14 Z"/>${[0, 7, 14].map((x) => `<text class="ex-tiny" x="${20 + x * 20}" y="206">${x}</text>`).join('')}
          <text class="ex-big" x="270" y="70">${fmt(v.pH)}</text><text class="ex-small" x="270" y="94" style="fill:${col(v.pH)}">${u(...kind(['acid', 'кислота', 'қышқыл'], ['neutral', 'нейтр.', 'бейтарап'], ['alkali', 'щёлочь', 'сілті']))}</text>
          <text class="ex-tag" x="8" y="40">[H⁺] = 10<tspan dy="-6" font-size="9">${exp}</tspan></text>`,
        caption: neutral
          ? L('pH = 7: neutral, like pure water - H⁺ and OH⁻ ions are equal (10⁻⁷ mol/L each).', 'pH = 7: нейтральная среда, как чистая вода, - ионов H⁺ и OH⁻ поровну (по 10⁻⁷ моль/л).', 'pH = 7: бейтарап орта, таза судағыдай - H⁺ және OH⁻ иондары тең (әрқайсысы 10⁻⁷ моль/л).')
          : L(
              `pH = ${fmt(v.pH)}: ${kind(['acidic'], [''], ['alkaline'])[0]}. [H⁺] = 10^(${exp}) mol/L - ${fmt(ratio, ratio < 10 ? 2 : 0)} times ${v.pH < 7 ? 'more' : 'fewer'} H⁺ ions than in pure water.`,
              `pH = ${fmt(v.pH)}: ${kind(['кислая среда'], [''], ['щелочная среда'])[0]}. [H⁺] = 10^(${exp}) моль/л - ионов H⁺ в ${fmt(ratio, ratio < 10 ? 2 : 0)} раз ${v.pH < 7 ? 'больше' : 'меньше'}, чем в чистой воде.`,
              `pH = ${fmt(v.pH)}: ${kind(['қышқыл орта'], [''], ['сілтілі орта'])[0]}. [H⁺] = 10^(${exp}) моль/л - H⁺ иондары таза судағыдан ${fmt(ratio, ratio < 10 ? 2 : 0)} есе ${v.pH < 7 ? 'көп' : 'аз'}.`,
            ),
      };
    },
  },

  balancing: {
    title: L('Balancing a chemical equation', 'Уравниваем химическую реакцию', 'Химиялық реакцияны теңестіру'),
    intro: L('Atoms are not created or destroyed in a reaction, only regrouped. Pick the numbers of molecules so that every kind of atom is the same on both sides.', 'В реакции атомы не появляются и не исчезают - они только перегруппировываются. Подбери число молекул так, чтобы атомов каждого вида слева и справа было поровну.', 'Реакцияда атомдар пайда болмайды да, жоғалмайды да - тек қайта топтасады. Әр түрлі атомдар сол және оң жақта тең болатындай молекулалар санын тап.'),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 4, value: 1 },
      { id: 'b', label: 'b', min: 1, max: 4, value: 1 },
      { id: 'c', label: 'c', min: 1, max: 4, value: 1 },
    ],
    buttons: [L('Water', 'Вода', 'Су'), L('Ammonia', 'Аммиак', 'Аммиак'), L('Magnesium oxide', 'Оксид магния', 'Магний оксиді'), L('Show the answer', 'Показать ответ', 'Жауапты көрсету')],
    state: () => ({ r: 0 }),
    pressed: (i, v, st) => i === st.r,
    onButton(i, st) {
      if (i < 3) {
        st.r = i;
        return { a: 1, b: 1, c: 1 };
      }
      const [a, b, c] = REACTIONS[st.r].ans;
      return { a, b, c };
    },
    draw(v, step, st) {
      const R = REACTIONS[st.r];
      const ks = [v.a, v.b, v.c];
      const cols = [55, 135, 250];
      const mols = R.mol
        .map((m, j) =>
          Array.from({ length: ks[j] }, (_, i) => {
            const atoms = m.atoms.map((el, q) => `<circle class="ex-atom at-${el}" cx="${n1(q * 11 - (m.atoms.length - 1) * 5.5)}" cy="0" r="${ATOM_R[el]}"/>`).join('');
            return `<g transform="translate(${cols[j]} ${62 + i * 26})" data-key="${st.r}-${j}">${atoms}</g>`;
          }).join(''),
        )
        .join('');
      const count = (side) => {
        const cnt = {};
        R.mol.forEach((m, j) => {
          if ((j < 2) !== (side === 0)) return;
          for (const el of m.atoms) cnt[el] = (cnt[el] ?? 0) + ks[j];
        });
        return cnt;
      };
      const left = count(0);
      const right = count(1);
      const els = Object.keys(left);
      const ok = els.every((el) => left[el] === right[el]);
      const rows = els.map((el, i) => `<text class="ex-small tc ${left[el] === right[el] ? 'exc-g' : 'exc-r'}" x="${160 + (i - (els.length - 1) / 2) * 110}" y="206">${el}: ${left[el]} → ${right[el]} ${left[el] === right[el] ? '✓' : '✗'}</text>`).join('');
      const lab = (k, f) => `${k === 1 ? '' : k}${f}`;
      const eq = `${lab(v.a, R.f[0])} + ${lab(v.b, R.f[1])} → ${lab(v.c, R.f[2])}`;
      const list = els.map((el) => `${el} ${left[el]}`).join(', ');
      return {
        svg: `<text class="ex-big" x="160" y="28">${eq}</text>${mols}<text class="ex-big" x="95" y="100">+</text><text class="ex-big" x="192" y="100">→</text>
          <text class="ex-small" x="55" y="172">${lab(v.a, R.f[0])}</text><text class="ex-small" x="135" y="172">${lab(v.b, R.f[1])}</text><text class="ex-small" x="250" y="172">${lab(v.c, R.f[2])}</text>${rows}`,
        caption: ok
          ? L(`Balanced: ${list} on each side. The coefficients ${v.a} : ${v.b} : ${v.c} are also the ratio of moles in the reaction.`, `Уравнено: ${list} с каждой стороны. Коэффициенты ${v.a} : ${v.b} : ${v.c} - это и соотношение молей в реакции.`, `Теңестірілді: әр жақта ${list}. ${v.a} : ${v.b} : ${v.c} коэффициенттері - реакциядағы моль қатынасы да.`)
          : L('Not balanced yet: some atoms (red) differ on the left and on the right. Change the number of molecules - never the small indices inside a formula.', 'Пока не уравнено: каких-то атомов (красные) слева и справа разное число. Меняй число молекул (коэффициенты), а не маленькие индексы в формуле.', 'Әлі теңестірілмеген: кейбір атомдар (қызыл) сол және оң жақта әртүрлі. Формуладағы кіші индекстерді емес, молекулалар санын (коэффициенттерді) өзгерт.'),
      };
    },
  },

  photosynthesis: {
    title: L('Photosynthesis: what goes in and out', 'Фотосинтез: что входит и что выходит', 'Фотосинтез: не кіреді, не шығады'),
    intro: L('A leaf takes carbon dioxide from the air and water from the roots and, using light energy, makes glucose and oxygen: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.', 'Лист берёт углекислый газ из воздуха и воду из корней и с помощью энергии света делает глюкозу и кислород: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.', 'Жапырақ ауадан көмірқышқыл газын, тамырдан су алады да, жарық энергиясымен глюкоза мен оттек жасайды: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.'),
    sliders: [
      { id: 'light', label: L('light, %', 'свет, %', 'жарық, %'), min: 0, max: 100, step: C, value: 70 },
      { id: 'co2', label: 'CO₂, %', min: 0, max: 100, step: C, value: 40 },
    ],
    buttons: [L('Night', 'Ночь', 'Түн'), L('Sunny day', 'Солнечный день', 'Шуақты күн')],
    onButton: (i) => [{ light: 0 }, { light: 100 }][i],
    state: () => ({ t: 0 }),
    live(dt, v, st) {
      st.t += dt * (0.25 + 0.75 * (Math.min(v.light, v.co2) / 100));
    },
    draw(v, step, st) {
      const rate = Math.min(v.light, v.co2) / 100;
      const L1 = v.light / 100;
      const rays = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return `<line x1="${n1(40 + 20 * Math.cos(a))}" y1="${n1(40 + 20 * Math.sin(a))}" x2="${n1(40 + 28 * Math.cos(a))}" y2="${n1(40 + 28 * Math.sin(a))}"/>`;
      }).join('');
      const bubbles = Array.from({ length: 6 }, (_, i) => {
        const k = (st.t * 0.6 + i / 6) % 1;
        return `<circle class="ex-bubble" cx="${n1(262 + 8 * Math.sin(k * 9 + i))}" cy="${n1(120 - k * 100)}" r="${n1(3 + 3 * k)}" opacity="${n1(rate * (1 - k) * 100) / 100}"/>`;
      }).join('');
      const lim = Math.abs(v.light - v.co2) < 0.5 ? 'both' : v.light < v.co2 ? 'light' : 'co2';
      return {
        svg: `<g class="ex-sun" opacity="${n1((0.2 + 0.8 * L1) * 100) / 100}"><circle cx="40" cy="40" r="15"/><g class="ex-rays">${rays}</g></g>
          <g class="exc-y" opacity="${n1(L1 * 100) / 100}">${arrow(62, 54, 120, 92, '', 1 + 3 * L1)}</g>
          <path class="ex-leaf" style="opacity:${n1((0.45 + 0.55 * rate) * 100) / 100}" d="M95 140 Q150 50 245 85 Q195 175 95 140 Z"/><path class="ex-vein" d="M95 140 Q170 110 245 85"/>
          ${arrow(14, 168, 100, 138, 'exc-m', 1 + 4 * (v.co2 / 100))}<text class="ex-tag" x="10" y="190">CO₂</text>
          ${arrow(165, 214, 165, 152, 'exc-b', 3)}<text class="ex-tag tc exc-b" x="172" y="206">H₂O</text>
          ${arrow(236, 92, 280, 52, 'exc-g', 1 + 4 * rate)}${bubbles}<text class="ex-tag tc exc-g" x="284" y="40">O₂</text>
          <rect class="ex-fill exc-o" x="220" y="${n1(196 - 40 * rate)}" width="22" height="${n1(40 * rate)}" rx="4"/><text class="ex-tiny" x="231" y="210">C₆H₁₂O₆</text>
          <text class="ex-tag" x="120" y="18">${u('rate', 'скорость', 'жылдамдық')}: ${fmt(rate * 100, 0)}%</text>`,
        caption:
          rate < 0.005
            ? L(`No ${v.light < 0.005 ? 'light' : 'CO₂'} - no photosynthesis: no glucose and no oxygen are made.`, `Нет ${v.light < 0.005 ? 'света' : 'CO₂'} - нет фотосинтеза: глюкоза и кислород не образуются.`, `${v.light < 0.005 ? 'Жарық' : 'CO₂'} жоқ - фотосинтез жоқ: глюкоза мен оттек түзілмейді.`)
            : L(
                `Rate ${fmt(rate * 100, 0)}%. It is limited by the factor in shortest supply - ${lim === 'both' ? 'light and CO₂ are equal now' : lim === 'light' ? 'now it is light' : 'now it is CO₂'}. Adding more of the other factor does not help.`,
                `Скорость ${fmt(rate * 100, 0)}%. Её ограничивает то, чего меньше всего, - ${lim === 'both' ? 'сейчас свет и CO₂ поровну' : lim === 'light' ? 'сейчас это свет' : 'сейчас это CO₂'}. Добавлять другой фактор бесполезно.`,
                `Жылдамдық ${fmt(rate * 100, 0)}%. Оны ең аз фактор шектейді - ${lim === 'both' ? 'қазір жарық пен CO₂ тең' : lim === 'light' ? 'қазір бұл жарық' : 'қазір бұл CO₂'}. Басқа факторды қосу пайдасыз.`,
              ),
      };
    },
  },

  punnett: {
    title: L('Punnett square', 'Решётка Пеннета', 'Пеннет торы'),
    intro: L('Each parent passes one of its two alleles to a child. A (yellow peas) is dominant, a (green) is recessive: a pea is green only as aa.', 'Каждый родитель передаёт ребёнку один из двух своих аллелей. A (жёлтый горох) - доминантный, a (зелёный) - рецессивный: зелёный горох только у aa.', 'Әр ата-ана балаға өзінің екі аллелінің бірін береді. A (сары бұршақ) - доминантты, a (жасыл) - рецессивті: жасыл бұршақ тек aa-да болады.'),
    sliders: [
      { id: 'p1', label: L('parent 1', 'родитель 1', '1-ата-ана'), min: 0, max: 2, value: 1, show: (g) => ['aa', 'Aa', 'AA'][g] },
      { id: 'p2', label: L('parent 2', 'родитель 2', '2-ата-ана'), min: 0, max: 2, value: 1, show: (g) => ['aa', 'Aa', 'AA'][g] },
    ],
    buttons: [L('Aa × Aa', 'Aa × Aa', 'Aa × Aa'), L('Test cross Aa × aa', 'Анализирующее Aa × aa', 'Талдаушы Aa × aa'), L('AA × aa', 'AA × aa', 'AA × aa')],
    onButton: (i) => [{ p1: 1, p2: 1 }, { p1: 1, p2: 0 }, { p1: 2, p2: 0 }][i],
    draw(v) {
      const gam = (g) => (g === 2 ? ['A', 'A'] : g === 1 ? ['A', 'a'] : ['a', 'a']);
      const g1 = gam(v.p1);
      const g2 = gam(v.p2);
      const cnt = [0, 0, 0];
      let cells = '';
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) {
          const gt = [g1[j], g2[i]].sort().join('');
          const n = (gt.match(/A/g) ?? []).length;
          cnt[n] += 1;
          const x = 90 + j * 56;
          const y = 52 + i * 56;
          cells += `<rect class="ex-pcell ${n ? 'dom' : 'rec'}" x="${x}" y="${y}" width="52" height="52" rx="8"/><text class="ex-small" x="${x + 26}" y="${y + 31}">${gt}</text>`;
        }
      const dom = ((cnt[1] + cnt[2]) / 4) * 100;
      const G = ['aa', 'Aa', 'AA'];
      return {
        svg: `${g1.map((a, j) => `<text class="ex-big" x="${116 + j * 56}" y="42">${a}</text>`).join('')}${g2.map((a, i) => `<text class="ex-big" x="72" y="${86 + i * 56}">${a}</text>`).join('')}
          <text class="ex-tag" x="8" y="30">${G[v.p1]} × ${G[v.p2]}</text>${cells}
          <text class="ex-small" x="270" y="60">AA : Aa : aa</text><text class="ex-big" x="270" y="88">${cnt[2]} : ${cnt[1]} : ${cnt[0]}</text>
          <circle class="ex-pea dom" cx="248" cy="130" r="10"/><text class="ex-small" x="286" y="135">${fmt(dom, 0)}%</text><circle class="ex-pea rec" cx="248" cy="166" r="10"/><text class="ex-small" x="286" y="171">${fmt(100 - dom, 0)}%</text>`,
        caption: L(
          `${G[v.p1]} × ${G[v.p2]}: 4 equally likely combinations. Genotypes AA : Aa : aa = ${cnt[2]} : ${cnt[1]} : ${cnt[0]}. Yellow peas (at least one A) ${fmt(dom, 0)}%, green (aa) ${fmt(100 - dom, 0)}%.`,
          `${G[v.p1]} × ${G[v.p2]}: 4 равновероятные комбинации. Генотипы AA : Aa : aa = ${cnt[2]} : ${cnt[1]} : ${cnt[0]}. Жёлтый горох (есть хотя бы одна A) - ${fmt(dom, 0)}%, зелёный (aa) - ${fmt(100 - dom, 0)}%.`,
          `${G[v.p1]} × ${G[v.p2]}: 4 тең ықтимал комбинация. Генотиптер AA : Aa : aa = ${cnt[2]} : ${cnt[1]} : ${cnt[0]}. Сары бұршақ (кем дегенде бір A бар) - ${fmt(dom, 0)}%, жасыл (aa) - ${fmt(100 - dom, 0)}%.`,
        ),
      };
    },
  },

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
    title: L('Binary numbers: bits and bytes', 'Двоичные числа: биты и байты', 'Екілік сандар: биттер мен байттар'),
    intro: L('A computer stores numbers as bits - lamps that are on (1) or off (0). Each bit is worth a power of two: 1, 2, 4, 8, … Eight bits make a byte.', 'Компьютер хранит числа в битах - лампочках, которые горят (1) или нет (0). Каждый бит стоит степень двойки: 1, 2, 4, 8, … Восемь битов - один байт.', 'Компьютер сандарды биттерде сақтайды - жанып (1) не сөніп (0) тұрған шамдар. Әр бит екінің дәрежесіне тең: 1, 2, 4, 8, … Сегіз бит - бір байт.'),
    sliders: [{ id: 'n', label: 'n', min: 0, max: 255, value: 74 }],
    buttons: ['128', '64', '32', '16', '8', '4', '2', '1'],
    pressed: (i, v) => ((v.n >> (7 - i)) & 1) === 1,
    onButton(i, st, v) {
      v.n ^= 1 << (7 - i);
    },
    draw(v) {
      const n = Math.round(v.n);
      const bits = Array.from({ length: 8 }, (_, i) => (n >> (7 - i)) & 1);
      const lamps = bits.map((b, i) => `<circle class="ex-lamp${b ? ' on' : ''}" cx="${30 + i * 37}" cy="96" r="15"/><text class="ex-small" x="${30 + i * 37}" y="101">${b}</text><text class="ex-tiny" x="${30 + i * 37}" y="130">2${'⁷⁶⁵⁴³²¹⁰'[i]}</text><text class="ex-tiny" x="${30 + i * 37}" y="144">${2 ** (7 - i)}</text>`).join('');
      const parts = bits.map((b, i) => (b ? 2 ** (7 - i) : 0)).filter(Boolean);
      const sum = parts.length ? `${parts.join(' + ')} = ${n}` : '0';
      const bin = bits.join('');
      const hex = n.toString(16).toUpperCase().padStart(2, '0');
      return {
        svg: `<text class="ex-big" x="160" y="40">${n} = ${bin}₂ = ${hex}₁₆</text>${lamps}<text class="ex-small" x="160" y="180">${sum}</text>`,
        caption: L(
          `${n} in binary is ${bin}: ${sum}. Tap a bit to switch it. 8 bits = 1 byte, so a byte has 2⁸ = 256 values (0-255); one hex digit is exactly 4 bits.`,
          `${n} в двоичной системе - ${bin}: ${sum}. Нажми на бит, чтобы переключить его. 8 битов = 1 байт, значит в байте 2⁸ = 256 значений (0-255); одна шестнадцатеричная цифра - ровно 4 бита.`,
          `${n} екілік жүйеде - ${bin}: ${sum}. Битті ауыстыру үшін оны бас. 8 бит = 1 байт, демек байтта 2⁸ = 256 мән бар (0-255); бір он алтылық цифр - дәл 4 бит.`,
        ),
      };
    },
  },

  sorting: {
    title: L('Bubble sort step by step', 'Сортировка пузырьком по шагам', 'Көпіршікті сұрыптау қадаммен'),
    intro: L('Walk along the row and compare neighbours; if the left one is bigger, swap them. After each pass the biggest remaining value "bubbles up" to the end.', 'Идём по ряду и сравниваем соседей; если левый больше - меняем их местами. После каждого прохода самое большое из оставшихся значений «всплывает» в конец.', 'Қатар бойымен жүріп, көршілерді салыстырамыз; сол жақтағысы үлкен болса - орындарын ауыстырамыз. Әр өтуден кейін қалғандардың ең үлкені соңына «қалқып шығады».'),
    sliders: [{ id: 'n', label: L('bars', 'столбиков', 'бағаналар'), min: 4, max: 12, value: 8 }],
    buttons: [L('Next step', 'Следующий шаг', 'Келесі қадам'), L('▶ Sort automatically', '▶ Сортировать автоматически', '▶ Автоматты сұрыптау'), L('Shuffle', 'Перемешать', 'Араластыру')],
    state: () => sortState(8),
    onSlide(key, v, st) {
      Object.assign(st, sortState(v.n));
    },
    onButton(i, st, v, api) {
      if (i === 0) {
        api.stop();
        sortStep(st);
      } else if (i === 1) api.run(() => sortStep(st), 420);
      else {
        api.stop();
        Object.assign(st, sortState(v.n));
      }
    },
    draw(v, step, st) {
      const n = st.arr.length;
      const slot = 290 / n;
      const bw = Math.min(26, slot - 4);
      const bars = Array.from({ length: n }, (_, k) => {
        const val = k + 1;
        const p = st.arr.indexOf(val);
        const h = 18 + val * (130 / n);
        const cls = st.done || p >= n - st.i ? 'ok' : st.last && (p === st.last.j || p === st.last.j + 1) ? (st.last.swapped ? 'swp' : 'cmp') : '';
        return `<g class="ex-sortbar" style="transform:translate(${n1(15 + p * slot + (slot - bw) / 2)}px,0)"><rect class="${cls}" x="0" y="${n1(186 - h)}" width="${n1(bw)}" height="${n1(h)}" rx="4"/><text class="ex-tiny" x="${n1(bw / 2)}" y="200">${val}</text></g>`;
      }).join('');
      const L2 = st.last;
      return {
        svg: `<line class="ex-axis" x1="10" y1="186" x2="310" y2="186"/>${bars}<text class="ex-tag" x="8" y="18">${u('comparisons', 'сравнений', 'салыстыру')}: ${st.cmp} · ${u('swaps', 'обменов', 'алмасу')}: ${st.sw}</text>`,
        caption: st.done
          ? L(`Sorted! ${st.cmp} comparisons and ${st.sw} swaps. For ${n} values bubble sort needs at most n(n − 1)/2 = ${(n * (n - 1)) / 2} comparisons.`, `Отсортировано! ${st.cmp} сравнений и ${st.sw} обменов. Для ${n} значений пузырьку нужно не больше n(n − 1)/2 = ${(n * (n - 1)) / 2} сравнений.`, `Сұрыпталды! ${st.cmp} салыстыру және ${st.sw} алмасу. ${n} мән үшін көпіршікті сұрыптауға ең көбі n(n − 1)/2 = ${(n * (n - 1)) / 2} салыстыру керек.`)
          : L2
            ? L(`Pass ${L2.pass}: ${L2.a} ${L2.swapped ? '>' : '<'} ${L2.b} → ${L2.swapped ? 'swap them' : 'leave them'}. Green bars are already in place.`, `Проход ${L2.pass}: ${L2.a} ${L2.swapped ? '>' : '<'} ${L2.b} → ${L2.swapped ? 'меняем местами' : 'оставляем'}. Зелёные столбики уже на своих местах.`, `${L2.pass}-өту: ${L2.a} ${L2.swapped ? '>' : '<'} ${L2.b} → ${L2.swapped ? 'орындарын ауыстырамыз' : 'қалдырамыз'}. Жасыл бағаналар өз орнында.`)
            : L('Press "Next step": we will compare the first two bars.', 'Нажми «Следующий шаг» - сравним первые два столбика.', '«Келесі қадам» бас - алғашқы екі бағананы салыстырамыз.'),
      };
    },
  },

  integral: {
    title: L('The integral as a sum of rectangles', 'Интеграл - сумма прямоугольников', 'Интеграл - тіктөртбұрыштар қосындысы'),
    intro: L('Cover the area under the graph with thin rectangles and add up their areas. The more rectangles, the closer the sum is to the exact area - the integral.', 'Закроем площадь под графиком тонкими прямоугольниками и сложим их площади. Чем больше прямоугольников, тем ближе сумма к точной площади - интегралу.', 'График астындағы ауданды жұқа тіктөртбұрыштармен жауып, аудандарын қосайық. Тіктөртбұрыштар неғұрлым көп болса, қосынды нақты ауданға - интегралға соғұрлым жақын.'),
    sliders: [
      { id: 'b', label: 'b', min: 0.5, max: 3, step: C, value: 2 },
      { id: 'n', label: 'n', min: 1, max: 40, value: 4 },
    ],
    buttons: [L('▶ n → 40', '▶ n → 40', '▶ n → 40')],
    play: 'n',
    playDur: 3000,
    draw(v) {
      const n = Math.round(v.n);
      const { b } = v;
      const sx = (x) => 30 + x * 90;
      const sy = (y) => 196 - y * 19;
      const dx = b / n;
      let sum = 0;
      const rects = Array.from({ length: n }, (_, i) => {
        const x = i * dx;
        const h = x * x;
        sum += h * dx;
        return `<rect class="ex-rect" x="${n1(sx(x))}" y="${n1(sy(h))}" width="${n1(dx * 90)}" height="${n1(h * 19)}"/>`;
      }).join('');
      const exact = (b * b * b) / 3;
      const area = `M${sx(0)} ${sy(0)} ${plot((x) => x * x, 0, b, sx, sy, 60).replace(/^M/, 'L')} L${n1(sx(b))} ${sy(0)} Z`;
      return {
        svg: `<path class="ex-area" d="${area}"/>${rects}<line class="ex-axis" x1="20" y1="196" x2="312" y2="196"/><line class="ex-axis" x1="30" y1="10" x2="30" y2="206"/>
          <path class="ex-curve" d="${plot((x) => x * x, 0, 3.1, sx, sy, 80)}"/><line class="ex-ideal" x1="${n1(sx(b))}" y1="${n1(sy(b * b))}" x2="${n1(sx(b))}" y2="196"/><text class="ex-tiny" x="${n1(sx(b))}" y="210">b</text>
          <text class="ex-tag" x="40" y="22">Σ = ${fmt(sum, 3)}</text><text class="ex-tag tc exc-p" x="40" y="40">∫₀ᵇ x² dx = b³/3 = ${fmt(exact, 3)}</text>`,
        caption: L(
          `${n} rectangles of width Δx = b/n = ${fmt(dx, 3)}: their total area is ${fmt(sum, 3)}. The exact area under y = x² from 0 to ${fmt(b)} is b³/3 = ${fmt(exact, 3)}, the error is ${fmt(exact - sum, 3)}. More rectangles - smaller error: the integral is the limit of these sums.`,
          `${n} прямоугольников шириной Δx = b/n = ${fmt(dx, 3)}: их общая площадь ${fmt(sum, 3)}. Точная площадь под y = x² от 0 до ${fmt(b)} - b³/3 = ${fmt(exact, 3)}, ошибка ${fmt(exact - sum, 3)}. Больше прямоугольников - меньше ошибка: интеграл - это предел таких сумм.`,
          `Ені Δx = b/n = ${fmt(dx, 3)} болатын ${n} тіктөртбұрыш: жалпы ауданы ${fmt(sum, 3)}. y = x² астындағы 0-ден ${fmt(b)}-ге дейінгі нақты аудан b³/3 = ${fmt(exact, 3)}, қателік ${fmt(exact - sum, 3)}. Тіктөртбұрыш көп болса - қателік аз: интеграл - осындай қосындылардың шегі.`,
        ),
      };
    },
  },
};

// Данные для сцен.

const ATOM_R = { H: 5.5, O: 8, N: 8, Mg: 9 };
const REACTIONS = [
  { f: ['H₂', 'O₂', 'H₂O'], mol: [{ atoms: ['H', 'H'] }, { atoms: ['O', 'O'] }, { atoms: ['H', 'O', 'H'] }], ans: [2, 1, 2] },
  { f: ['N₂', 'H₂', 'NH₃'], mol: [{ atoms: ['N', 'N'] }, { atoms: ['H', 'H'] }, { atoms: ['H', 'N', 'H', 'H'] }], ans: [1, 3, 2] },
  { f: ['Mg', 'O₂', 'MgO'], mol: [{ atoms: ['Mg'] }, { atoms: ['O', 'O'] }, { atoms: ['Mg', 'O'] }], ans: [2, 1, 2] },
];

const CITIES = [
  { n: L('New York', 'Нью-Йорк', 'Нью-Йорк'), o: -5 },
  { n: L('London', 'Лондон', 'Лондон'), o: 0 },
  { n: L('Moscow', 'Москва', 'Мәскеу'), o: 3 },
  { n: L('Astana', 'Астана', 'Астана'), o: 5 },
  { n: L('Beijing', 'Пекин', 'Бейжің'), o: 8 },
  { n: L('Tokyo', 'Токио', 'Токио'), o: 9 },
];

function sortState(n) {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { arr, i: 0, j: 0, cmp: 0, sw: 0, last: null, done: n < 2 };
}

/** Один шаг пузырька. Возвращает true, пока сортировка не закончена. */
function sortStep(st) {
  const n = st.arr.length;
  if (st.done) return false;
  const j = st.j;
  const a = st.arr[j];
  const b = st.arr[j + 1];
  const swapped = a > b;
  st.cmp += 1;
  if (swapped) {
    st.arr[j] = b;
    st.arr[j + 1] = a;
    st.sw += 1;
  }
  st.last = { j, a, b, swapped, pass: st.i + 1 };
  st.j += 1;
  if (st.j >= n - 1 - st.i) {
    st.i += 1;
    st.j = 0;
    if (st.i >= n - 1) st.done = true;
  }
  return !st.done;
}

// ---------- Страницы ----------

export function explainIndexRoute(app) {
  const render = () => {
    app.innerHTML = `
      <section class="page explain-index">
        <div class="page-head">
          <h1>🎬 ${t('explain.title')}</h1>
          <p class="muted">${t('explain.desc')}</p>
        </div>
        <div class="explain-grid">${EXPLAINERS.map(
          (e, i) => `<a class="explain-card" href="#/explain/${e.id}" style="--i:${Math.min(i, 16)}">
            <span class="explain-icon" aria-hidden="true">${e.icon}</span>
            <b>${esc(tx(SCENES[e.id].title))}</b>
            <small>${e.topics.map((id) => esc(tx(skillName(id)))).join(' · ')}</small>
          </a>`,
        ).join('')}</div>
      </section>`;
  };
  render();
  return { relabel: render };
}

export function explainRoute(app, { id }) {
  const meta = explainerById(id);
  const scene = SCENES[id];
  if (!meta || !scene) {
    navigate('/explain');
    return null;
  }
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
  let session = null;
  const tmp = typeof document !== 'undefined' ? document.createElementNS(SVGNS, 'svg') : null;
  const p = getProfile();
  p.counters.explained = (p.counters.explained ?? 0) + 1;
  saveProfile();

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
    const topic = meta.topics[0];
    app.innerHTML = `
      <section class="page explain-page">
        <a class="crumb" href="#/explain">← ${t('explain.title')}</a>
        <div class="explain-head"><span class="explain-icon big" aria-hidden="true">${meta.icon}</span><div><h1>${esc(tx(scene.title))}</h1><p class="muted">${esc(tx(scene.intro))}</p></div></div>
        <div class="ex-card">
          <div class="ex-stage${scene.onDrag ? ' has-drag' : ''}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tx(scene.title))}"></svg></div>
          <p class="ex-caption" aria-live="polite"></p>
          ${scene.sliders.length ? `<div class="ex-controls">${scene.sliders.map((s) => slider({ ...s, label: tx(s.label), value: values[s.id] }, shown(s, values[s.id]))).join('')}</div>` : ''}
          ${scene.buttons.length ? `<div class="ex-buttons${scene.pressed ? ' ex-toggles' : ''}">${scene.buttons.map((b, i) => `<button type="button" class="btn ${i === 0 && !scene.pressed ? 'btn-primary' : 'btn-soft'} btn-sm" data-b="${i}">${esc(tx(b))}</button>`).join('')}</div>` : ''}
        </div>
        <div class="explain-next">
          <button type="button" class="btn btn-primary ex-train">▶ ${t('explain.train', { name: tx(skillName(topic)) })}</button>
          ${EXPLAINERS.length > 1 ? `<a class="btn btn-soft" href="#/explain/${EXPLAINERS[(EXPLAINERS.indexOf(meta) + 1) % EXPLAINERS.length].id}">${t('explain.next')} →</a>` : ''}
        </div>
      </section>`;
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
    app.querySelector('.ex-train').addEventListener('click', () => {
      stopMotion();
      cancelAnimationFrame(liveId);
      liveId = 0;
      els = null;
      session = runAdaptive(app, {
        title: () => `🎬 ${tx(skillName(topic))}`,
        spec: [[topic, [1, 2, 3]]],
        tier: 1,
        count: 8,
        exitTo: `/explain/${id}`,
        back: { label: `🎬 ${t('explain.back')}`, href: `/explain/${id}` },
      });
    });
    draw();
    startLive();
  };
  render();
  return {
    cleanup: () => {
      stopMotion();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(liveId);
      clearTimeout(liveT);
      els = null;
      session?.cleanup?.();
    },
    relabel: () => (session ? session.relabel() : render()),
  };
}
