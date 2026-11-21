// Анимации тем: Алгебра, геометрия и высшая математика. Формат сцены описан в src/screens/explain.js.

import { getLang, t, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { W, H, C, SVGNS, reduced, clamp, lerp, ease, n1, fmt, term, coef, lineEq, u, hhmm, arrow, plot, axes, slider, morph, AGAIN, RESET, PROGRESS } from './kit.js';

export const SCENES_MATH = {
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

  inequality: {
    title: L('Inequalities on the number line', 'Неравенства на числовой прямой', 'Сан түзуіндегі теңсіздіктер'),
    intro: L('Solve ax > b like an equation, but when you divide by a negative number the sign flips. The answer is a ray on the number line.', 'Неравенство ax > b решаем как уравнение, но при делении на отрицательное число знак меняется. Ответ - луч на числовой прямой.', 'ax > b теңсіздігін теңдеу сияқты шешеміз, бірақ теріс санға бөлгенде таңба өзгереді. Жауап - сан түзуіндегі сәуле.'),
    sliders: [
      { id: 'a', label: 'a', min: -5, max: 5, step: C, value: -2 },
      { id: 'b', label: 'b', min: -10, max: 10, step: C, value: 4 },
    ],
    buttons: ['>', '≥', '<', '≤'],
    state: () => ({ s: 0 }),
    pressed: (i, v, st) => i === st.s,
    onButton(i, st) {
      st.s = i;
    },
    draw(v, step, st) {
      const S = ['>', '≥', '<', '≤'];
      const flip = { '>': '<', '≥': '≤', '<': '>', '≤': '≥' };
      const a = Math.abs(v.a) < 0.05 ? 0 : v.a;
      const sign = S[st.s];
      const sx = (x) => 160 + x * 13;
      if (a === 0) {
        const ok = { '>': 0 > v.b, '≥': 0 >= v.b, '<': 0 < v.b, '≤': 0 <= v.b }[sign];
        return {
          svg: `<line class="ex-axis" x1="10" y1="120" x2="310" y2="120"/>${ok ? `<line class="ex-stroke exc-p" style="stroke-width:5" x1="10" y1="120" x2="310" y2="120"/>` : ''}<text class="ex-big" x="160" y="60">0 · x ${sign} ${fmt(v.b)}</text>`,
          caption: L(ok ? 'With a = 0 the inequality is true for every x.' : 'With a = 0 the inequality is never true - no solutions.', ok ? 'При a = 0 неравенство верно при любом x.' : 'При a = 0 неравенство неверно ни при каком x - решений нет.', ok ? 'a = 0 болғанда теңсіздік кез келген x үшін дұрыс.' : 'a = 0 болғанда теңсіздік ешбір x үшін дұрыс емес - шешім жоқ.'),
        };
      }
      const r = v.b / a;
      const s2 = a < 0 ? flip[sign] : sign;
      const right = s2 === '>' || s2 === '≥';
      const closed = s2 === '≥' || s2 === '≤';
      const X = clamp(sx(r), 10, 310);
      return {
        svg: `<text class="ex-big" x="160" y="45">${fmt(a)}x ${sign} ${fmt(v.b)}</text><text class="ex-tag" x="160" y="72" style="text-anchor:middle">x ${s2} ${fmt(r)}</text>
          <line class="ex-axis" x1="10" y1="130" x2="310" y2="130"/>${[-10, -5, 0, 5, 10].map((t) => `<line class="ex-stroke exc-m" x1="${sx(t)}" y1="125" x2="${sx(t)}" y2="135"/><text class="ex-tiny" x="${sx(t)}" y="150">${t}</text>`).join('')}
          <line class="ex-stroke exc-p" style="stroke-width:5" x1="${n1(X)}" y1="130" x2="${right ? 310 : 10}" y2="130"/>
          <circle cx="${n1(X)}" cy="130" r="6" class="${closed ? 'ex-fill exc-p' : 'ex-stroke exc-p'}" style="${closed ? '' : 'fill:var(--surface);stroke-width:2.5'}"/>`,
        caption: L(
          `Divide both sides by ${fmt(a)}: x ${s2} ${fmt(r)}.${a < 0 ? ' a is negative, so the sign flipped!' : ''} ${closed ? 'The point is filled - it belongs to the answer.' : 'The point is empty - it is not included.'}`,
          `Делим обе части на ${fmt(a)}: x ${s2} ${fmt(r)}.${a < 0 ? ' a отрицательное, поэтому знак перевернулся!' : ''} ${closed ? 'Точка закрашена - она входит в ответ.' : 'Точка пустая - она не входит в ответ.'}`,
          `Екі жағын ${fmt(a)}-ге бөлеміз: x ${s2} ${fmt(r)}.${a < 0 ? ' a теріс, сондықтан таңба аударылды!' : ''} ${closed ? 'Нүкте боялған - ол жауапқа кіреді.' : 'Нүкте бос - ол жауапқа кірмейді.'}`,
        ),
      };
    },
  },

  combinatorics: {
    title: L('Arrangements and combinations', 'Размещения и сочетания', 'Орналастырулар мен терулер'),
    intro: L('How many ways to pick k of n? If order matters (podium places) - arrangements n!/(n−k)!. If not (a team) - combinations: divide by k! more.', 'Сколькими способами выбрать k из n? Если порядок важен (места на пьедестале) - размещения n!/(n−k)!. Если нет (команда) - сочетания: делим ещё на k!.', 'n-нен k-ны неше тәсілмен таңдауға болады? Рет маңызды болса (тұғырдағы орындар) - орналастыру n!/(n−k)!. Маңызды болмаса (команда) - теру: тағы k!-ға бөлеміз.'),
    sliders: [
      { id: 'n', label: 'n', min: 1, max: 10, value: 5 },
      { id: 'k', label: 'k', min: 0, max: 10, value: 3 },
    ],
    buttons: [L('Order matters', 'Порядок важен', 'Рет маңызды'), L('Order does not matter', 'Порядок не важен', 'Рет маңызды емес')],
    state: () => ({ ord: 0 }),
    pressed: (i, v, st) => i === st.ord,
    onButton(i, st) {
      st.ord = i;
    },
    draw(v, step, st) {
      const n = Math.round(v.n);
      const k = Math.min(Math.round(v.k), n);
      const f = (x) => (x <= 1 ? 1 : x * f(x - 1));
      const A = f(n) / f(n - k);
      const Cn = A / f(k);
      const res = st.ord ? Cn : A;
      const people = Array.from({ length: n }, (_, i) => `<circle class="ex-fill ${i < k ? 'exc-p' : 'exc-m'}" style="opacity:${i < k ? 1 : 0.35}" cx="${30 + i * 29}" cy="80" r="11"/><text class="ex-tiny" x="${30 + i * 29}" y="84" style="fill:#fff">${i + 1}</text>`).join('');
      const slots = st.ord ? '' : '';
      return {
        svg: `${people}${slots}<text class="ex-big" x="160" y="150">${st.ord ? `C(${n}, ${k})` : `A(${n}, ${k})`} = ${res}</text>
          <text class="ex-tag" x="160" y="180" style="text-anchor:middle">${st.ord ? `${n}! / (${k}! · ${n - k}!)` : `${n}! / ${n - k}!${k ? ` = ${Array.from({ length: k }, (_, i) => n - i).join(' · ')}` : ''}`}</text>`,
        caption: st.ord
          ? L(`Choosing a team of ${k} from ${n}: ${Cn} ways. Each team can be ordered in ${k}! = ${f(k)} ways, so C = A / k! = ${A} / ${f(k)} = ${Cn}.`, `Выбрать команду из ${k} человек среди ${n}: ${Cn} способов. Каждую команду можно упорядочить ${k}! = ${f(k)} способами, поэтому C = A / k! = ${A} / ${f(k)} = ${Cn}.`, `${n} адамнан ${k} адамдық команда таңдау: ${Cn} тәсіл. Әр команданы ${k}! = ${f(k)} тәсілмен реттеуге болады, сондықтан C = A / k! = ${A} / ${f(k)} = ${Cn}.`)
          : L(`Places 1st, 2nd, … for ${k} of ${n}: the first place has ${n} options, the next ${n - 1}, … - in total ${A}.`, `Места 1-е, 2-е, … для ${k} из ${n}: на первое место ${n} вариантов, на следующее ${n - 1}, … - всего ${A}.`, `${n} адамнан ${k} адамға 1-, 2-, … орындар: бірінші орынға ${n} нұсқа, келесіге ${n - 1}, … - барлығы ${A}.`),
      };
    },
  },

  volume: {
    title: L('Volume of prisms, cylinders and cones', 'Объём призмы, цилиндра и конуса', 'Призма, цилиндр және конус көлемі'),
    intro: L('Volume of a prism or cylinder = base area × height. A cone or pyramid with the same base and height holds exactly one third of that.', 'Объём призмы или цилиндра = площадь основания × высота. Конус или пирамида с тем же основанием и высотой вмещают ровно треть этого.', 'Призма немесе цилиндр көлемі = табан ауданы × биіктік. Табаны мен биіктігі бірдей конус не пирамида оның дәл үштен бірін сыйғызады.'),
    sliders: [
      { id: 'r', label: 'r', min: 1, max: 5, step: C, value: 3 },
      { id: 'h', label: 'h', min: 1, max: 8, step: C, value: 5 },
    ],
    buttons: [L('Cylinder', 'Цилиндр', 'Цилиндр'), L('Cone', 'Конус', 'Конус')],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
    },
    draw(v, step, st) {
      const s = 14;
      const R = v.r * s;
      const Hh = v.h * s * 0.9;
      const cx = 95;
      const base = 195;
      const top = base - Hh;
      const ry = R * 0.3;
      const Sb = Math.PI * v.r * v.r;
      const Vc = Sb * v.h;
      const Vv = st.k ? Vc / 3 : Vc;
      const shape = st.k
        ? `<path class="ex-fill exc-o" style="opacity:.55" d="M${n1(cx - R)} ${base} L${cx} ${n1(top)} L${n1(cx + R)} ${base} Z"/>`
        : `<path class="ex-fill exc-b" style="opacity:.45" d="M${n1(cx - R)} ${n1(top)} V${base} A${n1(R)} ${n1(ry)} 0 0 0 ${n1(cx + R)} ${base} V${n1(top)} Z"/><ellipse class="ex-fill exc-b" style="opacity:.7" cx="${cx}" cy="${n1(top)}" rx="${n1(R)}" ry="${n1(ry)}"/>`;
      return {
        svg: `${shape}<ellipse class="ex-stroke exc-m" style="fill:none" cx="${cx}" cy="${base}" rx="${n1(R)}" ry="${n1(ry)}"/>
          <line class="ex-stroke exc-k ex-dash" x1="${cx}" y1="${base}" x2="${cx}" y2="${n1(top)}"/><line class="ex-stroke exc-p" x1="${cx}" y1="${base}" x2="${n1(cx + R)}" y2="${base}"/>
          <text class="ex-tag" x="200" y="60">S = πr² = ${fmt(Sb, 1)}</text>
          <text class="ex-tag" x="200" y="84">V = ${st.k ? '⅓ · ' : ''}S · h</text>
          <text class="ex-big" x="250" y="125">V = ${fmt(Vv, 1)}</text>`,
        caption: st.k
          ? L(`Cone: V = ⅓ πr²h = ⅓ · ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Three such cones fill a cylinder of the same size.`, `Конус: V = ⅓ πr²h = ⅓ · ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Три таких конуса заполняют цилиндр того же размера.`, `Конус: V = ⅓ πr²h = ⅓ · ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Осындай үш конус сол өлшемдегі цилиндрді толтырады.`)
          : L(`Cylinder: V = πr²h = ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Double r and the volume grows 4 times; double h - only 2 times.`, `Цилиндр: V = πr²h = ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. Увеличь r вдвое - объём вырастет в 4 раза; h вдвое - только в 2 раза.`, `Цилиндр: V = πr²h = ${fmt(Sb, 1)} · ${fmt(v.h)} = ${fmt(Vv, 1)}. r-ді екі есе арттырсаң - көлем 4 есе өседі; h-ты екі есе - тек 2 есе.`),
      };
    },
  },

  complex: {
    title: L('Complex numbers on the plane', 'Комплексные числа на плоскости', 'Жазықтықтағы комплекс сандар'),
    intro: L('z = a + bi is a point (a; b). Its length is |z| = √(a² + b²). Multiplying by i turns the point 90° counterclockwise.', 'z = a + bi - это точка (a; b). Её длина |z| = √(a² + b²). Умножение на i поворачивает точку на 90° против часовой стрелки.', 'z = a + bi - (a; b) нүктесі. Оның ұзындығы |z| = √(a² + b²). i-ге көбейту нүктені сағат тіліне қарсы 90°-қа бұрады.'),
    sliders: [
      { id: 'a', label: 'a', min: -4, max: 4, step: C, value: 3 },
      { id: 'b', label: 'b', min: -4, max: 4, step: C, value: 2 },
    ],
    buttons: [L('× i', '× i', '× i'), L('conjugate', 'сопряжённое', 'түйіндес'), L('z²', 'z²', 'z²')],
    onButton: (i, st, v) => [{ a: -v.b, b: v.a }, { b: -v.b }, { a: clamp(v.a * v.a - v.b * v.b, -4, 4), b: clamp(2 * v.a * v.b, -4, 4) }][i],
    draw(v) {
      const sx = (x) => 160 + x * 24;
      const sy = (y) => 110 - y * 24;
      const mod = Math.hypot(v.a, v.b);
      const arg = (Math.atan2(v.b, v.a) * 180) / Math.PI;
      return {
        svg: `${axes(sx, sy, [-6, 6], [-4, 4])}<text class="ex-tiny" x="305" y="${sy(0) - 6}">Re</text><text class="ex-tiny" x="${sx(0) + 12}" y="12">Im</text>
          ${arrow(sx(0), sy(0), sx(v.a), sy(v.b), 'exc-p', 2.5)}<circle class="ex-fill exc-p" cx="${n1(sx(v.a))}" cy="${n1(sy(v.b))}" r="4"/>
          <line class="ex-stroke exc-m ex-dash" x1="${n1(sx(v.a))}" y1="${n1(sy(v.b))}" x2="${n1(sx(v.a))}" y2="${sy(0)}"/>
          <text class="ex-tag" x="8" y="18">z = ${fmt(v.a)}${term(v.b)}i</text><text class="ex-tag" x="8" y="38">|z| = ${fmt(mod)} · arg ≈ ${fmt(arg, 0)}°</text>`,
        caption: L(
          `z = ${fmt(v.a)}${term(v.b)}i lies at (${fmt(v.a)}; ${fmt(v.b)}), its length |z| = √(${fmt(v.a)}² + ${fmt(v.b)}²) = ${fmt(mod)}. Press × i: the arrow turns 90°, the length stays. i² = −1 - two turns of 90° point the other way.`,
          `z = ${fmt(v.a)}${term(v.b)}i - точка (${fmt(v.a)}; ${fmt(v.b)}), длина |z| = √(${fmt(v.a)}² + ${fmt(v.b)}²) = ${fmt(mod)}. Нажми × i: стрелка повернётся на 90°, длина не изменится. i² = −1 - два поворота на 90° смотрят в обратную сторону.`,
          `z = ${fmt(v.a)}${term(v.b)}i - (${fmt(v.a)}; ${fmt(v.b)}) нүктесі, ұзындығы |z| = √(${fmt(v.a)}² + ${fmt(v.b)}²) = ${fmt(mod)}. × i бас: нұсқар 90°-қа бұрылады, ұзындық өзгермейді. i² = −1 - 90°-тық екі бұрылыс кері жаққа қарайды.`,
        ),
      };
    },
  },

  limit: {
    title: L('Limit of a sequence', 'Предел последовательности', 'Тізбектің шегі'),
    intro: L('A sequence has a limit L if its terms get as close to L as you like when n grows. (1 + 1/n)ⁿ slowly approaches the number e ≈ 2.718.', 'Последовательность имеет предел L, если её члены становятся сколь угодно близки к L при росте n. (1 + 1/n)ⁿ медленно приближается к числу e ≈ 2,718.', 'n өскенде мүшелері L-ге қалағанша жақындаса, тізбектің шегі L болады. (1 + 1/n)ⁿ e ≈ 2,718 санына баяу жақындайды.'),
    sliders: [{ id: 'n', label: 'n', min: 1, max: 60, value: 10 }],
    buttons: ['(1 + 1/n)ⁿ → e', '1/n → 0', '(n + 1)/n → 1'],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
    },
    draw(v, step, st) {
      const F = [(n) => (1 + 1 / n) ** n, (n) => 1 / n, (n) => (n + 1) / n];
      const LIM = [Math.E, 0, 1];
      const top = [3, 1.1, 2.1][st.k];
      const bot = [1.8, 0, 0.9][st.k];
      const N = Math.round(v.n);
      const sx = (n) => 20 + (n / 60) * 290;
      const sy = (y) => 190 - ((y - bot) / (top - bot)) * 170;
      const dots = Array.from({ length: N }, (_, i) => `<circle class="ex-fill exc-p" cx="${n1(sx(i + 1))}" cy="${n1(sy(F[st.k](i + 1)))}" r="${i === N - 1 ? 5 : 2.6}"/>`).join('');
      const val = F[st.k](N);
      return {
        svg: `<line class="ex-axis" x1="20" y1="190" x2="310" y2="190"/><line class="ex-stroke exc-o ex-dash" x1="20" y1="${n1(sy(LIM[st.k]))}" x2="310" y2="${n1(sy(LIM[st.k]))}"/>${dots}
          <text class="ex-tag" x="200" y="${n1(sy(LIM[st.k]) - 8)}">L = ${fmt(LIM[st.k], 3)}</text>
          <text class="ex-tag" x="24" y="20">a(${N}) = ${fmt(val, 4)} · |a − L| = ${fmt(Math.abs(val - LIM[st.k]), 4)}</text>`,
        caption: L(
          `At n = ${N} the term is ${fmt(val, 4)}, only ${fmt(Math.abs(val - LIM[st.k]), 4)} from the limit ${fmt(LIM[st.k], 3)}. Increase n - the gap keeps shrinking but the terms never have to reach the limit exactly.`,
          `При n = ${N} член равен ${fmt(val, 4)}, до предела ${fmt(LIM[st.k], 3)} осталось лишь ${fmt(Math.abs(val - LIM[st.k]), 4)}. Увеличивай n - разница продолжает уменьшаться, хотя члены могут так и не стать равны пределу.`,
          `n = ${N} болғанда мүше ${fmt(val, 4)}, ${fmt(LIM[st.k], 3)} шегіне дейін тек ${fmt(Math.abs(val - LIM[st.k]), 4)} қалды. n-ді арттыр - айырма кішірейе береді, бірақ мүшелер шекке тең болмауы да мүмкін.`,
        ),
      };
    },
  },

  // ===== Вторая пачка: начальная математика, арифметика, матрицы, соли, передача данных =====

  tens: {
    title: L('Tens and ones', 'Десятки и единицы', 'Ондықтар мен бірліктер'),
    intro: L('Any number up to 100 is made of tens (bundles of 10) and ones. 47 = 4 tens and 7 ones.', 'Любое число до 100 складывается из десятков (пачек по 10) и единиц. 47 = 4 десятка и 7 единиц.', '100-ге дейінгі кез келген сан ондықтардан (10-нан бума) және бірліктерден тұрады. 47 = 4 ондық және 7 бірлік.'),
    sliders: [{ id: 'n', label: L('number', 'число', 'сан'), min: 0, max: 99, value: 47 }],
    buttons: ['+1', '+10', '−1', '−10'],
    onButton: (i, st, v) => ({ n: clamp(v.n + [1, 10, -1, -10][i], 0, 99) }),
    draw(v) {
      const n = Math.round(v.n);
      const t = Math.floor(n / 10);
      const o = n % 10;
      const rods = Array.from({ length: t }, (_, i) => `<rect x="${14 + i * 20}" y="60" width="14" height="120" rx="3" class="ex-fill exc-b" style="opacity:.85"/>${Array.from({ length: 9 }, (_, k) => `<line class="ex-stroke" style="stroke:var(--surface);stroke-width:1" x1="${14 + i * 20}" y1="${72 + k * 12}" x2="${28 + i * 20}" y2="${72 + k * 12}"/>`).join('')}`).join('');
      const ones = Array.from({ length: o }, (_, i) => `<rect x="${214 + (i % 3) * 18}" y="${130 - Math.floor(i / 3) * 18}" width="14" height="14" rx="3" class="ex-fill exc-o"/>`).join('');
      return {
        svg: `${rods}${ones}<text class="ex-big" x="160" y="36">${n} = ${t} · 10 + ${o}</text><text class="ex-tiny" x="100" y="200">${u('tens', 'десятки', 'ондықтар')}: ${t}</text><text class="ex-tiny" x="245" y="200">${u('ones', 'единицы', 'бірліктер')}: ${o}</text>`,
        caption: L(`${n} has ${t} ten${t === 1 ? '' : 's'} (blue rods) and ${o} one${o === 1 ? '' : 's'} (orange cubes). When there are 10 ones, they join into a new ten.`, `В числе ${n} - ${t} дес. (синие палочки) и ${o} ед. (оранжевые кубики). Когда единиц набирается 10, они собираются в новый десяток.`, `${n} санында ${t} ондық (көк таяқшалар) және ${o} бірлік (қызғылт сары текшелер). Бірлік 10-ға жеткенде, олар жаңа ондыққа жиналады.`),
      };
    },
  },

  column: {
    title: L('Column addition with carrying', 'Сложение столбиком с переходом', 'Бағанмен қосу (ауыстырумен)'),
    intro: L('Add ones with ones, tens with tens. If the ones make 10 or more, write the ones digit and carry 1 to the tens.', 'Складываем единицы с единицами, десятки с десятками. Если единиц получилось 10 или больше, пишем цифру единиц, а 1 переносим в десятки.', 'Бірліктерді бірліктермен, ондықтарды ондықтармен қосамыз. Бірліктер 10 не одан көп болса, бірліктер цифрын жазып, 1-ді ондықтарға ауыстырамыз.'),
    sliders: [
      { id: 'a', label: 'a', min: 10, max: 999, value: 358 },
      { id: 'b', label: 'b', min: 10, max: 999, value: 276 },
    ],
    buttons: [L('Next digit', 'Следующий разряд', 'Келесі разряд'), RESET],
    state: () => ({ k: 0 }),
    onSlide(key, v, st) {
      st.k = 0;
    },
    onButton(i, st) {
      st.k = i ? 0 : Math.min(st.k + 1, 4);
    },
    draw(v, step, st) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const s = a + b;
      const da = String(a).padStart(4, ' ');
      const db = String(b).padStart(4, ' ');
      const ds = String(s).padStart(4, ' ');
      const carry = [0, 0, 0, 0];
      for (let i = 3, c = 0; i >= 0; i--) {
        const x = (Number(da[i]) || 0) + (Number(db[i]) || 0) + c;
        c = x >= 10 ? 1 : 0;
        if (i > 0) carry[i - 1] = c;
      }
      const X = (i) => 140 + i * 34;
      const shown = (i) => 3 - i < st.k;
      const row = (str, y, cls = '') => [...str].map((ch, i) => `<text class="ex-big${cls}" x="${X(i)}" y="${y}">${ch.trim()}</text>`).join('');
      const carries = carry.map((c, i) => (c && shown(i + 1) ? `<text class="ex-small exc-r" x="${X(i)}" y="44">1</text>` : '')).join('');
      const res = [...ds].map((ch, i) => (shown(i) ? `<text class="ex-big exc-p" x="${X(i)}" y="170">${ch.trim()}</text>` : '')).join('');
      const col = st.k < 4 ? 3 - st.k : -1;
      return {
        svg: `${col >= 0 ? `<rect x="${X(col) - 16}" y="52" width="32" height="128" rx="8" class="ex-fill exc-y" style="opacity:.25"/>` : ''}${carries}${row(da, 82)}<text class="ex-big" x="100" y="118">+</text>${row(db, 118)}<line class="ex-axis" x1="110" y1="134" x2="${X(3) + 20}" y2="134"/>${res}`,
        caption:
          st.k >= 4 || st.k > String(s).length - 1
            ? L(`${a} + ${b} = ${s}. The red 1s are carries.`, `${a} + ${b} = ${s}. Красные единички - это переносы в следующий разряд.`, `${a} + ${b} = ${s}. Қызыл бірліктер - келесі разрядқа ауыстыру.`)
            : L('Press "Next digit": we add the highlighted column, starting from the ones.', 'Нажимай «Следующий разряд»: складываем подсвеченный столбик, начиная с единиц.', '«Келесі разряд» бас: бірліктерден бастап белгіленген бағанды қосамыз.'),
      };
    },
  },

  numline: {
    title: L('Negative numbers on the number line', 'Отрицательные числа на прямой', 'Сан түзуіндегі теріс сандар'),
    intro: L('Adding a positive number moves right, adding a negative moves left. Subtracting a negative is the same as adding a positive: 3 − (−2) = 5.', 'Прибавить положительное - шаг вправо, отрицательное - шаг влево. Вычесть отрицательное - то же, что прибавить положительное: 3 − (−2) = 5.', 'Оң санды қосу - оңға қадам, терісті қосу - солға қадам. Терісті азайту оңды қосумен бірдей: 3 − (−2) = 5.'),
    sliders: [
      { id: 'a', label: 'a', min: -10, max: 10, value: 3 },
      { id: 'b', label: 'b', min: -10, max: 10, value: -5 },
    ],
    buttons: ['a + b', 'a − b'],
    state: () => ({ op: 0 }),
    pressed: (i, v, st) => i === st.op,
    onButton(i, st) {
      st.op = i;
    },
    draw(v, step, st) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const d = st.op ? -b : b;
      const r = a + d;
      const sx = (x) => 160 + x * 7.5;
      const ticks = Array.from({ length: 41 }, (_, i) => i - 20).map((x) => `<line class="ex-stroke exc-m" x1="${sx(x)}" y1="${x % 5 ? 136 : 130}" x2="${sx(x)}" y2="${x % 5 ? 144 : 150}"/>${x % 5 ? '' : `<text class="ex-tiny" x="${sx(x)}" y="166">${x}</text>`}`).join('');
      return {
        svg: `<line class="ex-axis" x1="5" y1="140" x2="315" y2="140"/>${ticks}
          <circle class="ex-fill exc-b" cx="${sx(a)}" cy="140" r="6"/>
          <path class="ex-stroke exc-${d >= 0 ? 'g' : 'r'}" style="fill:none;stroke-width:2.5" d="M${sx(a)} 132 Q${n1((sx(a) + sx(r)) / 2)} ${n1(132 - Math.min(70, Math.abs(d) * 6))} ${sx(r)} 132"/>
          <circle class="ex-fill exc-p" cx="${sx(r)}" cy="140" r="7"/>
          <text class="ex-big" x="160" y="45">${a} ${st.op ? '−' : '+'} ${b < 0 ? `(${fmt(b)})` : b} = ${fmt(r)}</text>`,
        caption: L(
          `Start at ${a}, ${d >= 0 ? `move ${d} to the right` : `move ${-d} to the left`} - you land on ${r}.${st.op && b < 0 ? ' Subtracting a negative number turned into moving right!' : ''}`,
          `Начинаем с ${a}, ${d >= 0 ? `идём на ${d} вправо` : `идём на ${-d} влево`} - попадаем в ${fmt(r)}.${st.op && b < 0 ? ' Вычитание отрицательного числа превратилось в шаг вправо!' : ''}`,
          `${a}-тен бастап, ${d >= 0 ? `оңға ${d} қадам` : `солға ${-d} қадам`} жүреміз - ${fmt(r)}-ге түсеміз.${st.op && b < 0 ? ' Теріс санды азайту оңға қадамға айналды!' : ''}`,
        ),
      };
    },
  },

  areamul: {
    title: L('Multiplication as area', 'Умножение как площадь', 'Көбейту - аудан ретінде'),
    intro: L('a × b is the number of squares in a rectangle a by b. Split a two-digit number into tens and ones - the rectangle splits into easy parts.', 'a × b - это число клеток в прямоугольнике a на b. Разбей двузначное число на десятки и единицы - прямоугольник разделится на простые части.', 'a × b - a-ға b тіктөртбұрыштағы шаршылар саны. Екі таңбалы санды ондықтар мен бірліктерге бөлсең, тіктөртбұрыш оңай бөліктерге бөлінеді.'),
    sliders: [
      { id: 'a', label: 'a', min: 1, max: 19, value: 14 },
      { id: 'b', label: 'b', min: 1, max: 12, value: 6 },
    ],
    buttons: [L('Swap a and b', 'Поменять a и b', 'a мен b-ны ауыстыру')],
    onButton: (i, st, v) => ({ a: clamp(v.b, 1, 19), b: clamp(v.a, 1, 12) }),
    draw(v) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const c = Math.min(14, 280 / Math.max(a, 1), 150 / Math.max(b, 1));
      const t = Math.floor(a / 10) * 10;
      const o = a - t;
      const cells = [];
      for (let y = 0; y < b; y++) for (let x = 0; x < a; x++) cells.push(`<rect x="${n1(20 + x * c)}" y="${n1(50 + y * c)}" width="${n1(c - 1.5)}" height="${n1(c - 1.5)}" rx="2" class="ex-fill ${x < t ? 'exc-b' : 'exc-o'}" style="opacity:.75"/>`);
      return {
        svg: `${cells.join('')}<text class="ex-big" x="160" y="32">${a} × ${b} = ${a * b}</text>${t && o ? `<text class="ex-tag" x="20" y="${n1(70 + b * c)}">${t} × ${b} + ${o} × ${b} = ${t * b} + ${o * b}</text>` : ''}`,
        caption: L(
          `${a} rows of ${b}... or ${b} rows of ${a} - the same ${a * b} squares.${t && o ? ` Split ${a} = ${t} + ${o}: ${t * b} (blue) + ${o * b} (orange) = ${a * b}.` : ''}`,
          `${a} × ${b} = ${a * b} клеток, и от перестановки множителей площадь не меняется.${t && o ? ` Разбей ${a} = ${t} + ${o}: ${t * b} (синие) + ${o * b} (оранжевые) = ${a * b}.` : ''}`,
          `${a} × ${b} = ${a * b} шаршы, көбейткіштердің орнын ауыстырғаннан аудан өзгермейді.${t && o ? ` ${a} = ${t} + ${o} деп бөл: ${t * b} (көк) + ${o * b} (қызғылт сары) = ${a * b}.` : ''}`,
        ),
      };
    },
  },

  decimals: {
    title: L('Decimals: tenths and hundredths', 'Десятичные дроби: десятые и сотые', 'Ондық бөлшектер: ондықтар мен жүздіктер'),
    intro: L('Split a square into 100 small cells. One cell is 0.01, a column of ten is 0.1. So 0.37 = 3 columns and 7 cells.', 'Раздели квадрат на 100 клеток. Одна клетка - 0,01, столбик из десяти - 0,1. Значит, 0,37 = 3 столбика и 7 клеток.', 'Шаршыны 100 торға бөл. Бір тор - 0,01, оннан тұратын баған - 0,1. Демек, 0,37 = 3 баған және 7 тор.'),
    sliders: [{ id: 'x', label: 'x', min: 0, max: 1, step: 0.01, value: 0.37 }],
    buttons: ['+0,1', '+0,01', '−0,01'],
    onButton: (i, st, v) => ({ x: clamp(Math.round((v.x + [0.1, 0.01, -0.01][i]) * 100) / 100, 0, 1) }),
    draw(v) {
      const k = Math.round(v.x * 100);
      const cells = Array.from({ length: 100 }, (_, i) => {
        const col = Math.floor(i / 10);
        const row = i % 10;
        return `<rect x="${20 + col * 17}" y="${30 + (9 - row) * 17}" width="15" height="15" rx="2" class="ex-fill ${i < k ? (col < Math.floor(k / 10) ? 'exc-b' : 'exc-o') : 'exc-m'}" style="opacity:${i < k ? 0.85 : 0.15}"/>`;
      }).join('');
      const t = Math.floor(k / 10);
      const h = k % 10;
      return {
        svg: `${cells}<text class="ex-big" x="260" y="80">${fmt(k / 100)}</text><text class="ex-tag" x="200" y="115">= ${fmt(t / 10, 1)} + ${fmt(h / 100)}</text><text class="ex-tag" x="200" y="140">= ${k}%</text><text class="ex-tag" x="200" y="165">= ${k}/100</text>`,
        caption: L(`${fmt(k / 100)} is ${t} tenths (blue columns) and ${h} hundredths (orange cells) - ${k} cells out of 100, that is ${k}%.`, `${fmt(k / 100)} - это ${t} десятых (синие столбики) и ${h} сотых (оранжевые клетки) - ${k} клеток из 100, то есть ${k}%.`, `${fmt(k / 100)} - бұл ${t} ондық (көк бағандар) және ${h} жүздік (қызғылт сары торлар) - 100-ден ${k} тор, яғни ${k}%.`),
      };
    },
  },

  ratio: {
    title: L('Ratio and proportion', 'Отношения и пропорции', 'Қатынас және пропорция'),
    intro: L('A ratio 2 : 3 means for every 2 parts of one thing there are 3 parts of another. Scale both parts by the same number - the ratio stays the same.', 'Отношение 2 : 3 значит: на каждые 2 части одного приходится 3 части другого. Умножь обе части на одно число - отношение не изменится.', '2 : 3 қатынасы: біреуінің әр 2 бөлігіне екіншісінің 3 бөлігі келеді. Екі бөлікті бір санға көбейтсең - қатынас өзгермейді.'),
    sliders: [
      { id: 'p', label: L('juice parts', 'частей сока', 'шырын бөлігі'), min: 1, max: 6, value: 2 },
      { id: 'q', label: L('water parts', 'частей воды', 'су бөлігі'), min: 1, max: 6, value: 3 },
      { id: 'T', label: L('total, ml', 'всего, мл', 'барлығы, мл'), min: 100, max: 1000, step: 50, value: 500 },
    ],
    buttons: [L('Double the recipe', 'Удвоить рецепт', 'Рецептті екі есе'), RESET],
    onButton: (i, st, v) => [{ T: clamp(v.T * 2, 100, 1000) }, { p: 2, q: 3, T: 500 }][i],
    draw(v) {
      const p = Math.round(v.p);
      const q = Math.round(v.q);
      const part = v.T / (p + q);
      const w = 280 / (p + q);
      const blocks = Array.from({ length: p + q }, (_, i) => `<rect x="${n1(20 + i * w)}" y="80" width="${n1(w - 3)}" height="50" rx="6" class="ex-fill ${i < p ? 'exc-o' : 'exc-b'}" style="opacity:.8"/>`).join('');
      return {
        svg: `<text class="ex-big" x="160" y="45">${p} : ${q}</text>${blocks}<text class="ex-tag" x="20" y="160">${u('one part', 'одна часть', 'бір бөлік')} = ${fmt(v.T, 0)} : ${p + q} = ${fmt(part, 1)}</text><text class="ex-tag" x="20" y="185">${u('juice', 'сок', 'шырын')} ${fmt(part * p, 1)} · ${u('water', 'вода', 'су')} ${fmt(part * q, 1)}</text>`,
        caption: L(`Total ${fmt(v.T, 0)} ml in the ratio ${p} : ${q}: there are ${p + q} equal parts of ${fmt(part, 1)} ml, so juice ${fmt(part * p, 1)} ml and water ${fmt(part * q, 1)} ml.`, `Всего ${fmt(v.T, 0)} мл в отношении ${p} : ${q}: это ${p + q} равных частей по ${fmt(part, 1)} мл, значит сока ${fmt(part * p, 1)} мл, воды ${fmt(part * q, 1)} мл.`, `Барлығы ${fmt(v.T, 0)} мл, қатынасы ${p} : ${q}: бұл ${fmt(part, 1)} мл-ден ${p + q} тең бөлік, демек шырын ${fmt(part * p, 1)} мл, су ${fmt(part * q, 1)} мл.`),
      };
    },
  },

  sieve: {
    title: L('Prime numbers: the sieve of Eratosthenes', 'Простые числа: решето Эратосфена', 'Жай сандар: Эратосфен елегі'),
    intro: L('Cross out all multiples of 2, then of 3, 5, 7… What is left are primes - numbers divisible only by 1 and themselves.', 'Вычеркни все числа, кратные 2, потом 3, 5, 7… Останутся простые - числа, которые делятся только на 1 и на себя.', '2-ге еселі барлық сандарды сыз, кейін 3, 5, 7-ге… Жай сандар қалады - тек 1-ге және өзіне бөлінетін сандар.'),
    sliders: [],
    buttons: [L('Next prime', 'Следующее простое', 'Келесі жай сан'), L('▶ All', '▶ Всё', '▶ Барлығы'), RESET],
    state: () => ({ done: [] }),
    onButton(i, st, v, api) {
      const next = () => {
        const p = [2, 3, 5, 7].find((x) => !st.done.includes(x));
        if (p) st.done.push(p);
        return Boolean(p);
      };
      if (i === 0) next();
      else if (i === 1) api.run(() => next(), 700);
      else {
        api.stop();
        st.done = [];
      }
    },
    draw(v, step, st) {
      const crossedBy = (n) => st.done.find((p) => n !== p && n % p === 0);
      const cells = Array.from({ length: 100 }, (_, i) => {
        const n = i + 1;
        const by = crossedBy(n);
        const prime = n > 1 && !by && st.done.length === 4;
        const x = 12 + (i % 10) * 30;
        const y = 12 + Math.floor(i / 10) * 20;
        const color = n === 1 ? 'exc-m' : by ? ['exc-r', 'exc-o', 'exc-b', 'exc-k'][[2, 3, 5, 7].indexOf(by)] : prime || st.done.includes(n) ? 'exc-g' : '';
        return `<text class="ex-tiny ${color}" x="${x + 13}" y="${y + 13}" style="${by || n === 1 ? 'opacity:.35;text-decoration:line-through' : prime || st.done.includes(n) ? 'font-weight:900' : ''}">${n}</text>`;
      }).join('');
      const left = Array.from({ length: 99 }, (_, i) => i + 2).filter((n) => !crossedBy(n)).length;
      return {
        svg: cells,
        caption: st.done.length
          ? L(`Crossed out multiples of ${st.done.join(', ')}. ${st.done.length === 4 ? `The ${left} numbers left are all the primes up to 100.` : `${left} numbers are still left.`}`, `Вычеркнуты кратные ${st.done.join(', ')}. ${st.done.length === 4 ? `Оставшиеся ${left} чисел - все простые числа до 100.` : `Осталось ещё ${left} чисел.`}`, `${st.done.join(', ')}-ге еселілер сызылды. ${st.done.length === 4 ? `Қалған ${left} сан - 100-ге дейінгі барлық жай сандар.` : `Әлі ${left} сан қалды.`}`)
          : L('Press "Next prime": we start with 2.', 'Нажми «Следующее простое» - начнём с 2.', '«Келесі жай сан» бас - 2-ден бастаймыз.'),
      };
    },
  },

  matrix: {
    title: L('A matrix transforms the plane', 'Матрица преобразует плоскость', 'Матрица жазықтықты түрлендіреді'),
    intro: L('A 2×2 matrix sends the vector (1; 0) to its first column and (0; 1) to its second. The unit square becomes a parallelogram whose area is the determinant.', 'Матрица 2×2 переводит вектор (1; 0) в свой первый столбец, а (0; 1) - во второй. Единичный квадрат становится параллелограммом, его площадь - определитель.', '2×2 матрица (1; 0) векторын бірінші бағанына, (0; 1)-ді екіншісіне апарады. Бірлік шаршы параллелограмға айналады, оның ауданы - анықтауыш.'),
    sliders: [
      { id: 'a', label: 'a', min: -2, max: 2, step: C, value: 1.5 },
      { id: 'b', label: 'b', min: -2, max: 2, step: C, value: 0.5 },
      { id: 'c', label: 'c', min: -2, max: 2, step: C, value: 0 },
      { id: 'd', label: 'd', min: -2, max: 2, step: C, value: 1 },
    ],
    buttons: [L('Identity', 'Единичная', 'Бірлік'), L('Rotate 90°', 'Поворот 90°', '90° бұру'), L('det = 0', 'det = 0', 'det = 0')],
    onButton: (i) => [{ a: 1, b: 0, c: 0, d: 1 }, { a: 0, b: -1, c: 1, d: 0 }, { a: 1, b: 2, c: 0.5, d: 1 }][i],
    draw(v) {
      const sx = (x) => 160 + x * 32;
      const sy = (y) => 110 - y * 32;
      const P = (x, y) => [v.a * x + v.b * y, v.c * x + v.d * y];
      const pts = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)].map(([x, y]) => `${n1(sx(x))},${n1(sy(y))}`).join(' ');
      const det = v.a * v.d - v.b * v.c;
      return {
        svg: `${axes(sx, sy, [-5, 5], [-3, 3])}<polygon points="${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)} ${sx(0)},${sy(1)}" class="ex-fill exc-m" style="opacity:.2"/>
          <polygon points="${pts}" class="ex-fill exc-p" style="opacity:.35"/>${arrow(sx(0), sy(0), sx(v.a), sy(v.c), 'exc-o', 2.5)}${arrow(sx(0), sy(0), sx(v.b), sy(v.d), 'exc-b', 2.5)}
          <text class="ex-tag" x="8" y="18">(${fmt(v.a)} ${fmt(v.b)} / ${fmt(v.c)} ${fmt(v.d)})</text><text class="ex-tag" x="8" y="38">det = ad − bc = ${fmt(det)}</text>`,
        caption: L(
          `The orange arrow is the first column (${fmt(v.a)}; ${fmt(v.c)}), the blue one the second (${fmt(v.b)}; ${fmt(v.d)}). det = ${fmt(det)}: the area changed ${fmt(Math.abs(det))} times${det < 0 ? ', and the picture is flipped' : ''}${Math.abs(det) < 0.01 ? ' - everything is squashed onto a line, there is no inverse matrix' : ''}.`,
          `Оранжевая стрелка - первый столбец (${fmt(v.a)}; ${fmt(v.c)}), синяя - второй (${fmt(v.b)}; ${fmt(v.d)}). det = ${fmt(det)}: площадь изменилась в ${fmt(Math.abs(det))} раза${det < 0 ? ', а фигура перевернулась' : ''}${Math.abs(det) < 0.01 ? ' - всё сплющилось в прямую, обратной матрицы нет' : ''}.`,
          `Қызғылт сары нұсқар - бірінші баған (${fmt(v.a)}; ${fmt(v.c)}), көгі - екінші (${fmt(v.b)}; ${fmt(v.d)}). det = ${fmt(det)}: аудан ${fmt(Math.abs(det))} есе өзгерді${det < 0 ? ', ал фигура аударылды' : ''}${Math.abs(det) < 0.01 ? ' - бәрі түзуге жаншылды, кері матрица жоқ' : ''}.`,
        ),
      };
    },
  },
};
