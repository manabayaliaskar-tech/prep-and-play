// ---------- Теорема Пифагора ----------

const PY_TRIPLES = [[3, 4], [6, 8], [5, 12], [9, 12], [1, 1], [1, 2], [2.5, 6], [4, 7.5]];

function pyTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [a, b] = pick([[3, 4], [5, 12], [6, 8], [9, 12], [8, 6], [12, 5], [4, 3], [12, 9], [1.5, 2], [4.5, 6]]);
    t = { a, b, c: Math.hypot(a, b), p: { a, b: 1 } };
  } else if (type === 1) {
    const [a, b] = pick([[3, 4], [5, 12], [6, 8], [9, 12], [8, 6], [12, 5]]);
    t = { a, b, c: Math.hypot(a, b), p: { a, b: 1 } };
  } else {
    const k = pick([2, 3, 4, 5, 6, 7, 8]);
    t = { k, c2: 2 * k * k, p: { a: 1, b: 1 } };
  }
  st.task = { type, done: false, ...t };
  return t.p;
}

/** Корень красиво: √50 = 5√2, √25 = 5. */
const sqrtStr = (n) => {
  if (Math.abs(n - Math.round(n)) > 1e-9) return `√${fmt(n)}`;
  let out = 1;
  let rest = Math.round(n);
  for (let k = 2; k * k <= rest; k++)
    while (rest % (k * k) === 0) {
      out *= k;
      rest /= k * k;
    }
  return rest === 1 ? String(out) : `${out === 1 ? '' : out}√${rest}`;
};

const pythagoras = modes({
  title: L('The Pythagorean theorem', 'Теорема Пифагора', 'Пифагор теоремасы'),
  intro: L('In a right triangle a² + b² = c²: the squares on the legs together equal the square on the hypotenuse.', 'В прямоугольном треугольнике a² + b² = c²: квадраты на катетах вместе равны квадрату на гипотенузе.', 'Тікбұрышты үшбұрышта a² + b² = c²: катеттердегі шаршылар бірге гипотенузадағы шаршыға тең.'),
  sliders: [
    { id: 'a', label: L('leg a', 'катет a', 'a катеті'), min: 1, max: 12, step: 0.5, value: 3 },
    { id: 'b', label: L('leg b', 'катет b', 'b катеті'), min: 1, max: 12, step: 0.5, value: 4 },
  ],
  values: { ph: 0 },
  tabs: [L('Squares', 'Квадраты', 'Шаршылар'), L('Proof', 'Доказательство', 'Дәлелдеу'), TASK],
  acts: [{ label: L('▶ Rearrange', '▶ Переложить', '▶ Орнын ауыстыру'), only: [1] }, { label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return pyTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { ph: v.ph > 0.5 ? 0 : 1, $dur: 1600 };
    if (st.m === 2) return pyTask(st);
    st.pre = (st.pre + 1) % PY_TRIPLES.length;
    const [a, b] = PY_TRIPLES[st.pre];
    return { a, b };
  },
  draw(v, step, st) {
    const { a, b } = v;
    const c2 = a * a + b * b;
    const c = Math.sqrt(c2);
    const cs = sqrtStr(c2);
    const exact = Math.abs(c - Math.round(c)) < 1e-9;

    if (st.m === 1) {
      const S = a + b;
      const s = 186 / S;
      const X0 = 10;
      const Y0 = 8;
      const P = (x, y) => [X0 + x * s, Y0 + (S - y) * s];
      const k = clamp(v.ph, 0, 1);
      const kk = (i) => ease(clamp(k * 1.6 - i * 0.3, 0, 1));
      const tri = (pts, dx, dy, i) => {
        const e = kk(i);
        return `<path class="ex-tri" style="stroke-width:1.5" d="M${pts.map(([x, y]) => P(x + dx * e, y + dy * e)).map((q) => `${n1(q[0])} ${n1(q[1])}`).join(' L')} Z"/>`;
      };
      const T1 = [[0, 0], [a, 0], [0, b]];
      const T2 = [[S, 0], [S, a], [a, 0]];
      const T3 = [[S, S], [b, S], [S, a]];
      const T4 = [[0, S], [0, b], [b, S]];
      const inner = [[a, 0], [S, a], [b, S], [0, b]].map(([x, y]) => P(x, y));
      const sqA = [[0, 0], [a, 0], [a, a], [0, a]].map(([x, y]) => P(x, y));
      const sqB = [[a, a], [S, a], [S, S], [a, S]].map(([x, y]) => P(x, y));
      const done = k > 0.99;
      return {
        svg: `${poly(inner, 'exc-p', 0.55 * (1 - k))}${poly(sqA, 'exc-a', 0.6 * k)}${poly(sqB, 'exc-b', 0.6 * k)}
          ${tri(T1, 0, a, 0)}${tri(T2, 0, 0, 1)}${tri(T3, -b, 0, 1)}${tri(T4, a, -b, 2)}
          <rect class="ex-stroke exc-m" style="fill:none;stroke-width:2" x="${X0}" y="${Y0}" width="${n1(S * s)}" height="${n1(S * s)}"/>
          ${k < 0.5 ? T(X0 + (S * s) / 2, Y0 + (S * s) / 2 + 6, 'c²', 'm18 tc exc-p h') : `${T(P(a / 2, 0)[0], P(0, a / 2)[1] + 6, 'a²', 'm15 h')}${T(P(a + b / 2, 0)[0], P(0, a + b / 2)[1] + 6, 'b²', 'm15 h')}`}
          ${T(X0 + (a * s) / 2, Y0 + S * s + 13, 'a', 'm10 exm-mut')}${T(X0 + a * s + (b * s) / 2, Y0 + S * s + 13, 'b', 'm10 exm-mut')}
          ${T(262, 40, `${u('side', 'сторона', 'қабырға')} a + b = ${fmt(S)}`, 'm11')}${T(262, 64, u('4 triangles', '4 треугольника', '4 үшбұрыш'), 'm10 exm-mut')}${T(262, 77, u('do not change', 'не меняются', 'өзгермейді'), 'm10 exm-mut')}
          ${T(262, 104, done ? 'a² + b²' : 'c²', `m15 tc ${done ? 'exc-a' : 'exc-p'}`)}${T(262, 124, done ? `= ${fmt(a * a)} + ${fmt(b * b)}` : `= ${fmt(c2)}`, 'm12')}
          ${T(262, 162, 'c² = a² + b²', `m12 tc ${done ? 'exc-g' : 'exc-m'}`)}`,
        caption: done
          ? L(
              `The same 4 triangles, moved: now the free space is two squares a² + b² = ${fmt(a * a)} + ${fmt(b * b)}. The big square and the triangles did not change, so the free area is the same: c² = a² + b².`,
              `Те же 4 треугольника переложили: теперь свободное место - два квадрата a² + b² = ${fmt(a * a)} + ${fmt(b * b)}. Большой квадрат и треугольники не изменились, значит и свободная площадь та же: c² = a² + b².`,
              `Сол 4 үшбұрыштың орнын ауыстырдық: енді бос орын - екі шаршы a² + b² = ${fmt(a * a)} + ${fmt(b * b)}. Үлкен шаршы мен үшбұрыштар өзгерген жоқ, демек бос аудан да сол: c² = a² + b².`,
            )
          : L(
              `A square with side a + b = ${fmt(S)} holds 4 equal right triangles; the free space in the middle is a square on the hypotenuse, c² = ${fmt(c2)}. Press "Rearrange".`,
              `В квадрат со стороной a + b = ${fmt(S)} положили 4 одинаковых прямоугольных треугольника; свободное место в центре - квадрат на гипотенузе, c² = ${fmt(c2)}. Нажми «Переложить».`,
              `Қабырғасы a + b = ${fmt(S)} шаршыға 4 бірдей тікбұрышты үшбұрыш салдық; ортадағы бос орын - гипотенузадағы шаршы, c² = ${fmt(c2)}. «Орнын ауыстыру» бас.`,
            ),
      };
    }

    // Квадраты на сторонах.
    const s = Math.min(196 / (2 * a + b), 204 / (a + 2 * b));
    const X0 = 6 + (200 - (2 * a + b) * s) / 2;
    const Y0 = 8 + (204 - (a + 2 * b) * s) / 2;
    const P = (x, y) => [X0 + (x + a) * s, Y0 + (a + b - y) * s];
    const C0 = P(0, 0);
    const A = P(0, a);
    const B = P(b, 0);
    const sqA = [[0, 0], [0, a], [-a, a], [-a, 0]].map(([x, y]) => P(x, y));
    const sqB = [[0, 0], [b, 0], [b, -b], [0, -b]].map(([x, y]) => P(x, y));
    const sqC = [[0, a], [b, 0], [b + a, b], [a, a + b]].map(([x, y]) => P(x, y));
    // клетки 1×1 в квадратах катетов, если стороны целые
    let cells = '';
    const unit = (n) => Number.isInteger(n) && n * s >= 0 && n <= 12 && s >= 5;
    if (unit(a)) for (let i = 1; i < a; i++) cells += ln(P(-i, 0)[0], P(0, 0)[1], P(-i, a)[0], P(0, a)[1], 'exc-a', 0.6) + ln(P(-a, i)[0], P(0, i)[1], P(0, i)[0], P(0, i)[1], 'exc-a', 0.6);
    if (unit(b)) for (let i = 1; i < b; i++) cells += ln(P(i, 0)[0], P(0, 0)[1], P(i, -b)[0], P(0, -b)[1], 'exc-b', 0.6) + ln(P(0, -i)[0], P(0, -i)[1], P(b, -i)[0], P(0, -i)[1], 'exc-b', 0.6);
    if (exact && c <= 15 && s >= 5)
      for (let i = 1; i < c; i++) {
        const t = i / c;
        // линии, параллельные сторонам квадрата гипотенузы
        const p1 = [0 + b * t, a - a * t];
        const p2 = [p1[0] + a, p1[1] + b];
        const q1 = [0 + a * t, a + b * t];
        const q2 = [q1[0] + b, q1[1] - a];
        cells += ln(...P(...p1), ...P(...p2), 'exc-p', 0.6) + ln(...P(...q1), ...P(...q2), 'exc-p', 0.6);
      }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const cA = mid(sqA[0], sqA[2]);
    const cB = mid(sqB[0], sqB[2]);
    const cC = mid(sqC[0], sqC[2]);
    const big = (n) => n * s > 26;
    const hide = st.m === 2 && !(st.task?.done);
    const pic = `${poly(sqA, 'exc-a', 0.45)}${poly(sqB, 'exc-b', 0.45)}${poly(sqC, 'exc-p', 0.4)}${cells}
      <path class="ex-tri" d="M${pts([C0, A, B])} Z"/>${pth(`M${n1(C0[0] + 8)} ${n1(C0[1])} V${n1(C0[1] - 8)} H${n1(C0[0])}`, 'exc-m', 1.2)}
      ${big(a) ? T(cA[0], cA[1] + 4, `${fmt(a * a)}`, 'm11') : ''}${big(b) ? T(cB[0], cB[1] + 4, `${fmt(b * b)}`, 'm11') : ''}${big(c) ? T(cC[0], cC[1] + 4, hide ? '?' : fmt(c2), 'm12') : ''}
      ${T((C0[0] + A[0]) / 2 + 6, (C0[1] + A[1]) / 2 + 4, 'a', 'm11 tc exc-a ex-start h')}${T((C0[0] + B[0]) / 2, C0[1] - 5, 'b', 'm11 tc exc-b h')}${T((A[0] + B[0]) / 2 - 5, (A[1] + B[1]) / 2 - 3, 'c', 'm12 tc exc-p ex-end h')}`;
    const panel = (cTxt) => `${T(262, 30, 'a² + b² = c²', 'm12')}${T(262, 58, `a² = ${fmt(a * a)}`, 'm12 tc exc-a')}${T(262, 80, `b² = ${fmt(b * b)}`, 'm12 tc exc-b')}${T(262, 108, `c² = ${cTxt ?? fmt(c2)}`, 'm15 tc exc-p')}${T(262, 134, cTxt ? 'c = ?' : `c = ${cs}`, 'm15')}${!cTxt && !exact ? T(262, 154, `≈ ${fmt(c)}`, 'm12 exm-mut') : ''}`;

    if (st.m === 2) {
      const tk = st.task ?? (pyTask(st), st.task);
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type <= 1) {
        ok = near(a, tk.a, 0.01) && near(b, tk.b, 0.01);
        tag = `a = ${fmt(tk.a)}, c = ${fmt(tk.c)}`;
        ask = L(`Leg a = ${fmt(tk.a)}, hypotenuse c = ${fmt(tk.c)}. Find leg b with the slider.`, `Катет a = ${fmt(tk.a)}, гипотенуза c = ${fmt(tk.c)}. Найди катет b ползунком.`, `a катеті = ${fmt(tk.a)}, гипотенуза c = ${fmt(tk.c)}. b катетін жүгірткімен тап.`);
        hint = L(`Now c² = ${fmt(c2)}, we need ${fmt(tk.c * tk.c)}. Hint: b = √(c² − a²) = √(${fmt(tk.c * tk.c)} − ${fmt(tk.a * tk.a)}).`, `Сейчас c² = ${fmt(c2)}, а нужно ${fmt(tk.c * tk.c)}. Подсказка: b = √(c² − a²) = √(${fmt(tk.c * tk.c)} − ${fmt(tk.a * tk.a)}).`, `Қазір c² = ${fmt(c2)}, ал ${fmt(tk.c * tk.c)} керек. Кеңес: b = √(c² − a²) = √(${fmt(tk.c * tk.c)} − ${fmt(tk.a * tk.a)}).`);
      } else {
        ok = near(a, tk.k, 0.01) && near(b, tk.k, 0.01);
        tag = `a = b, c = ${sqrtStr(tk.c2)}`;
        ask = L(`Build an isosceles right triangle with hypotenuse c = ${sqrtStr(tk.c2)}.`, `Построй равнобедренный прямоугольный треугольник с гипотенузой c = ${sqrtStr(tk.c2)}.`, `Гипотенузасы c = ${sqrtStr(tk.c2)} болатын теңбүйірлі тікбұрышты үшбұрыш тұрғыз.`);
        hint = L(`Now c² = ${fmt(c2)}, we need ${tk.c2}. Hint: a = b, so 2a² = ${tk.c2}.`, `Сейчас c² = ${fmt(c2)}, а нужно ${tk.c2}. Подсказка: a = b, значит 2a² = ${tk.c2}.`, `Қазір c² = ${fmt(c2)}, ал ${tk.c2} керек. Кеңес: a = b, демек 2a² = ${tk.c2}.`);
      }
      ok = check(st, ok);
      return { svg: `${pic}${panel(ok ? null : '?')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: `${pic}${panel()}`,
      caption: L(
        `${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}, so the hypotenuse c = √${fmt(c2)} ${exact ? '=' : '≈'} ${exact ? cs : fmt(c)}.${exact && Number.isInteger(a) && Number.isInteger(b) ? ' Integer sides: count the cells - they match!' : ''} The hypotenuse is always the longest side.`,
        `${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}, значит гипотенуза c = √${fmt(c2)} ${exact ? '=' : '≈'} ${exact ? cs : fmt(c)}.${exact && Number.isInteger(a) && Number.isInteger(b) ? ' Стороны целые: посчитай клетки - сходится!' : ''} Гипотенуза всегда длиннее катетов.`,
        `${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}, демек гипотенуза c = √${fmt(c2)} ${exact ? '=' : '≈'} ${exact ? cs : fmt(c)}.${exact && Number.isInteger(a) && Number.isInteger(b) ? ' Қабырғалар бүтін: торларды сана - сәйкес келеді!' : ''} Гипотенуза әрқашан катеттерден ұзын.`,
      ),
    };
  },
});

// ---------- Единичная окружность ----------

const SIN_EX = { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1', 120: '√3/2', 135: '√2/2', 150: '1/2', 180: '0', 210: '−1/2', 225: '−√2/2', 240: '−√3/2', 270: '−1', 300: '−√3/2', 315: '−√2/2', 330: '−1/2' };
const TAN_EX = { 0: '0', 30: '√3/3', 45: '1', 60: '√3', 120: '−√3', 135: '−1', 150: '−√3/3', 180: '0', 210: '√3/3', 225: '1', 240: '√3', 300: '−√3', 315: '−1', 330: '−√3/3' };
const STD = Object.keys(SIN_EX).map(Number);
const norm360 = (d) => ((Math.round(d * 1000) / 1000) % 360 + 360) % 360;
const sinEx = (d) => SIN_EX[norm360(d)];
const cosEx = (d) => SIN_EX[norm360(d + 90)];
const tanEx = (d) => {
  const r = norm360(d);
  if (r === 90 || r === 270) return '∄';
  return TAN_EX[r];
};
const cotEx = (d) => {
  const r = norm360(d);
  if (r === 0 || r === 180) return '∄';
  return TAN_EX[norm360(90 - r)];
};
/** Угол в радианах: 150° → 5π/6. */
const radStr = (d) => {
  const f = nice(d / 180, 12, 3);
  if (f === '0') return '0';
  if (!/^[−\d/]+$/.test(f)) return `${fmt((d * Math.PI) / 180, 2)}`;
  const [n, m] = f.split('/');
  const num = n === '1' ? 'π' : n === '−1' ? '−π' : `${n}π`;
  return m ? `${num}/${m}` : num;
};
const quarter = (d) => {
  const r = norm360(d);
  if (r % 90 === 0) return 0;
  return Math.floor(r / 90) + 1;
};

function trigTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let A;
  do A = pick(STD.filter((x) => x % 90 !== 0));
  while (st.task && A === st.task.A);
  st.task = { type, A, done: false };
  return { deg: 0 };
}

const unitCircle = modes({
  title: L('Unit circle: sin, cos, tg', 'Единичная окружность: sin, cos, tg', 'Бірлік шеңбер: sin, cos, tg'),
  intro: L('A point moves around a circle of radius 1: its x is the cosine of the angle, its y is the sine, and tg = sin/cos.', 'Точка движется по окружности радиуса 1: её x - косинус угла, y - синус, а tg = sin/cos.', 'Нүкте радиусы 1 шеңбер бойымен қозғалады: оның x-і - бұрыштың косинусы, y-і - синусы, ал tg = sin/cos.'),
  sliders: [{ id: 'deg', label: L('angle α, °', 'угол α, °', 'α бұрышы, °'), min: -360, max: 360, step: 1, value: 30 }],
  tabs: [L('sin and cos', 'sin и cos', 'sin және cos'), L('tg and ctg', 'tg и ctg', 'tg және ctg'), L('Graphs', 'Графики', 'Графиктер'), TASK],
  acts: [{ label: PLAY, only: [0, 1, 2] }, { label: L('Next angle ↻', 'Следующий угол ↻', 'Келесі бұрыш ↻'), only: [0, 1, 2] }, { label: MORE, only: [3] }],
  playDur: 9000,
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return trigTask(st);
    return null;
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      api.play('deg', { dur: 9000, linear: true });
      return null;
    }
    if (j === 2) return trigTask(st);
    const nxt = STD.find((x) => x > norm360(v.deg) + 0.5) ?? 360;
    const base = v.deg - norm360(v.deg);
    return { deg: clamp(base + nxt > 360 ? nxt - 360 : base + nxt, -360, 360), $dur: 500 };
  },
  draw(v, step, st) {
    const d = v.deg;
    const a = deg(d);
    const sn = Math.sin(a);
    const cs = Math.cos(a);
    const S = sinEx(d);
    const Cc = cosEx(d);
    const q = quarter(d);
    const roman = ['', 'I', 'II', 'III', 'IV'];
    const r2 = (x) => (Math.abs(x) < 5e-4 ? 0 : x);

    const circle = (cx, cy, r, small = false) => {
      const [px, py] = on(cx, cy, r, d);
      let g = `${ln(cx - r - 14, cy, cx + r + 14, cy, 'exc-m', 1.2)}${ln(cx, cy - r - 12, cx, cy + r + 12, 'exc-m', 1.2)}<circle class="ex-ring" cx="${cx}" cy="${cy}" r="${r}"/>`;
      if (q) g += area(arcD(cx, cy, r, (q - 1) * 90, q * 90, true), 'exc-y', 0.18);
      if (!small)
        for (const t of STD) {
          const [x1, y1] = on(cx, cy, r - 4, t);
          const [x2, y2] = on(cx, cy, r + 4, t);
          g += ln(x1, y1, x2, y2, 'exc-m', 1);
        }
      if (!small) g += `${T(cx + r + 7, cy - 4, '1', 'm9 exm-mut ex-start')}${T(cx - r - 7, cy - 4, '−1', 'm9 exm-mut ex-end')}${T(cx + 5, cy - r - 4, '1', 'm9 exm-mut ex-start')}${T(cx + 5, cy + r + 11, '−1', 'm9 exm-mut ex-start')}`;
      if (!small) for (let k = 1; k <= 4; k++) g += T(...on(cx, cy, r * 0.62, k * 90 - 45), roman[k], `m10 ${k === q ? '' : 'exm-mut'}`);
      g += pth(arcD(cx, cy, small ? 12 : 18, 0, d), 'exc-o', 2);
      g += ln(cx, cy, px, py, 'exc-m', 2);
      return { g, px, py };
    };

    if (st.m === 2) {
      const cx = 52;
      const cy = 110;
      const r = 42;
      const c0 = circle(cx, cy, r, true);
      const gx = (t) => 108 + ((t + 360) / 720) * 206;
      const gy = (y) => cy - y * r;
      let g = '';
      for (let t = -360; t <= 360; t += 90) g += ln(gx(t), cy - r - 6, gx(t), cy + r + 6, 'exc-m', t === 0 ? 1.2 : 0.4) + (t % 180 === 0 ? T(gx(t), cy + r + 18, `${fmt(t)}°`, 'm9 exm-mut') : '');
      g += ln(gx(-360), cy, gx(360), cy, 'exc-m', 1.2) + ln(gx(-360), gy(1), gx(360), gy(1), 'exc-m ex-dash', 0.6) + ln(gx(-360), gy(-1), gx(360), gy(-1), 'exc-m ex-dash', 0.6);
      g += pth(plot((t) => gy(Math.sin(deg(t))), -360, 360, gx, (y) => y, 200), 'exc-k', 2.2) + pth(plot((t) => gy(Math.cos(deg(t))), -360, 360, gx, (y) => y, 200), 'exc-g', 2.2);
      g += ln(c0.px, c0.py, gx(d), gy(sn), 'exc-k ex-dash', 1) + dot(gx(d), gy(sn), 4.5, 'exc-k') + dot(gx(d), gy(cs), 4.5, 'exc-g') + ln(gx(d), 18, gx(d), 202, 'exc-o', 1);
      return {
        svg: `${c0.g}${ln(cx, cy, c0.px, cy, 'exc-g', 3)}${ln(c0.px, cy, c0.px, c0.py, 'exc-k', 3)}${dot(c0.px, c0.py, 4.5, 'exc-p')}${g}
          ${T(8, 18, `α = ${fmt(d, 0)}° = ${radStr(d)}`, 'm12 ex-start h')}${T(312, 18, `sin α = ${S ?? fmt(r2(sn))}`, 'm11 tc exc-k ex-end h')}${T(312, 34, `cos α = ${Cc ?? fmt(r2(cs))}`, 'm11 tc exc-g ex-end h')}`,
        caption: L(
          `The height of the point is the sine (pink wave), its x is the cosine (green wave). Both repeat every 360° (period 2π), values stay between −1 and 1, and cosine is the sine shifted by 90°: cos α = sin(α + 90°).`,
          `Высота точки - синус (розовая волна), её x - косинус (зелёная). Обе повторяются через 360° (период 2π), значения от −1 до 1, а косинус - это синус, сдвинутый на 90°: cos α = sin(α + 90°).`,
          `Нүктенің биіктігі - синус (қызғылт толқын), x-і - косинус (жасыл). Екеуі де 360° сайын қайталанады (период 2π), мәндері −1-ден 1-ге дейін, ал косинус - 90°-қа жылжыған синус: cos α = sin(α + 90°).`,
        ),
      };
    }

    const cx = 96;
    const cy = 110;
    const r = 78;
    const c0 = circle(cx, cy, r);
    const { px, py } = c0;
    const signs = L(
      `Quarter ${roman[q]}: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}.`,
      `${roman[q]} четверть: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}.`,
      `${roman[q]} ширек: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}.`,
    );
    const val = (ex, x) => ex ?? fmt(r2(x));
    const head = `${T(258, 24, `α = ${fmt(d, 0)}°`, 'm15')}${T(258, 42, `= ${radStr(d)} ${u('rad', 'рад', 'рад')}`, 'm11 exm-mut')}`;

    if (st.m === 1) {
      const tx = cx + r;
      const ty = cy - r;
      const okT = Math.abs(cs) > 1e-6;
      const okC = Math.abs(sn) > 1e-6;
      const tg = okT ? sn / cs : 0;
      const ct = okC ? cs / sn : 0;
      const tY = cy - clamp(tg, -1.35, 1.35) * r;
      const cX = cx + clamp(ct, -1.15, 1.45) * r;
      let g = `${ln(tx, 4, tx, 216, 'exc-o', 1.2)}${ln(4, ty, 216, ty, 'exc-b', 1.2)}${T(tx + 3, 214, 'tg', 'm10 tc exc-o ex-start')}${T(4, ty - 4, 'ctg', 'm10 tc exc-b ex-start')}`;
      if (okT) g += ln(cx, cy, tx, tY, 'exc-o ex-dash', 1) + ln(tx, cy, tx, tY, 'exc-o', 4) + dot(tx, tY, 4.5, 'exc-o');
      if (okC) g += ln(cx, cy, cX, ty, 'exc-b ex-dash', 1) + ln(cx, ty, cX, ty, 'exc-b', 4) + dot(cX, ty, 4.5, 'exc-b');
      const T1 = tanEx(d);
      const C1 = cotEx(d);
      return {
        svg: `${c0.g}${g}${dot(px, py, 5, 'exc-p')}${head}${T(258, 80, `tg α = ${okT ? val(T1, tg) : u('none', 'нет', 'жоқ')}`, 'm12 tc exc-o')}${T(258, 102, `ctg α = ${okC ? val(C1, ct) : u('none', 'нет', 'жоқ')}`, 'm12 tc exc-b')}${T(258, 132, 'tg = sin / cos', 'm10 exm-mut')}${T(258, 148, 'ctg = cos / sin', 'm10 exm-mut')}`,
        caption: !okT
          ? L(`cos ${fmt(d, 0)}° = 0, so tg = sin/cos does not exist: the ray is parallel to the tangent line x = 1 and never meets it.`, `cos ${fmt(d, 0)}° = 0, поэтому tg = sin/cos не существует: луч параллелен линии тангенсов x = 1 и не пересекает её.`, `cos ${fmt(d, 0)}° = 0, сондықтан tg = sin/cos жоқ: сәуле x = 1 тангенстер сызығына параллель, оны қимайды.`)
          : L(
              `tg α = sin/cos = ${fmt(r2(sn))} / ${fmt(r2(cs))} = ${fmt(tg)}: continue the radius to the orange line x = 1, the height of the meeting point is tg. ${okC ? `ctg α = 1/tg = ${fmt(ct)} - on the blue line y = 1.` : 'ctg does not exist here (sin = 0).'} tg repeats every 180°.`,
              `tg α = sin/cos = ${fmt(r2(sn))} / ${fmt(r2(cs))} = ${fmt(tg)}: продолжим радиус до оранжевой прямой x = 1, высота точки встречи - это tg. ${okC ? `ctg α = 1/tg = ${fmt(ct)} - на синей прямой y = 1.` : 'ctg здесь не существует (sin = 0).'} tg повторяется через 180°.`,
              `tg α = sin/cos = ${fmt(r2(sn))} / ${fmt(r2(cs))} = ${fmt(tg)}: радиусты x = 1 қызғылт сары түзуіне дейін созамыз, кездесу нүктесінің биіктігі - tg. ${okC ? `ctg α = 1/tg = ${fmt(ct)} - y = 1 көк түзуінде.` : 'Мұнда ctg жоқ (sin = 0).'} tg 180° сайын қайталанады.`,
            ),
      };
    }

    const pic = `${c0.g}${ln(cx, cy, px, cy, 'exc-g', 4)}${ln(px, cy, px, py, 'exc-k', 4)}${dot(px, py, 6, 'exc-p')}
      ${Math.abs(cs) > 0.15 ? T((cx + px) / 2, cy + (sn > 0 ? 14 : -6), 'cos', 'm10 tc exc-g h') : ''}${Math.abs(sn) > 0.15 ? T(px + (cs >= 0 ? 5 : -5), (cy + py) / 2 + 4, 'sin', `m10 tc exc-k h ${cs >= 0 ? 'ex-start' : 'ex-end'}`) : ''}`;

    if (st.m === 3) {
      const tk = st.task ?? (trigTask(st), st.task);
      const ok = check(st, Math.abs(norm360(d) - tk.A) < 0.5 || Math.abs(norm360(d) - tk.A) > 359.5);
      const A = tk.A;
      const sc = (x) => (Math.sin(deg(x)) > 0 ? '> 0' : '< 0');
      const cc = (x) => (Math.cos(deg(x)) > 0 ? '> 0' : '< 0');
      const ask = [
        L(`Set the angle α = ${radStr(A)}.`, `Поставь угол α = ${radStr(A)}.`, `α = ${radStr(A)} бұрышын қой.`),
        L(`Find α in [0°; 360°): sin α = ${sinEx(A)} and cos α ${cc(A)}.`, `Найди α из [0°; 360°): sin α = ${sinEx(A)} и cos α ${cc(A)}.`, `[0°; 360°) аралығынан α тап: sin α = ${sinEx(A)} және cos α ${cc(A)}.`),
        L(`Find α in [0°; 360°): cos α = ${cosEx(A)} and sin α ${sc(A)}.`, `Найди α из [0°; 360°): cos α = ${cosEx(A)} и sin α ${sc(A)}.`, `[0°; 360°) аралығынан α тап: cos α = ${cosEx(A)} және sin α ${sc(A)}.`),
      ][tk.type];
      const tag = [`α = ${radStr(A)}`, `sin = ${sinEx(A)}, cos ${cc(A)}`, `cos = ${cosEx(A)}, sin ${sc(A)}`][tk.type];
      const hint = [
        L(`Now α = ${fmt(d, 0)}°. Hint: π = 180°, so π/6 = 30°, π/4 = 45°.`, `Сейчас α = ${fmt(d, 0)}°. Подсказка: π = 180°, значит π/6 = 30°, π/4 = 45°.`, `Қазір α = ${fmt(d, 0)}°. Кеңес: π = 180°, демек π/6 = 30°, π/4 = 45°.`),
        J(L(`Now sin α = ${fmt(r2(sn))}.`, `Сейчас sin α = ${fmt(r2(sn))}.`, `Қазір sin α = ${fmt(r2(sn))}.`), L('Hint: look at the signs in the quarters.', 'Подсказка: смотри знаки по четвертям.', 'Кеңес: ширектердегі таңбаларды қара.')),
        J(L(`Now cos α = ${fmt(r2(cs))}.`, `Сейчас cos α = ${fmt(r2(cs))}.`, `Қазір cos α = ${fmt(r2(cs))}.`), L('Hint: cos is the x of the point, sin is the y.', 'Подсказка: cos - это x точки, sin - её y.', 'Кеңес: cos - нүктенің x-і, sin - y-і.')),
      ][tk.type];
      return {
        svg: `${pic}${T(250, 70, `α = ${fmt(d, 0)}°`, 'm15')}${T(250, 96, `sin α = ${fmt(r2(sn))}`, 'm12 tc exc-k')}${T(250, 118, `cos α = ${fmt(r2(cs))}`, 'm12 tc exc-g')}${badge(tag, ok)}`,
        caption: taskCap(st, ok, ask, hint),
      };
    }

    return {
      svg: `${pic}${head}${T(258, 78, `sin α = ${val(S, sn)}`, 'm12 tc exc-k')}${S?.includes('√') ? T(258, 91, `≈ ${fmt(r2(sn))}`, 'm9 exm-mut') : ''}${T(258, 110, `cos α = ${val(Cc, cs)}`, 'm12 tc exc-g')}${Cc?.includes('√') ? T(258, 123, `≈ ${fmt(r2(cs))}`, 'm9 exm-mut') : ''}${T(258, 146, 'sin² α + cos² α = 1', 'm10 exm-mut')}${q ? T(258, 166, `${roman[q]}: sin ${sn > 0 ? '+' : '−'}, cos ${cs > 0 ? '+' : '−'}`, 'm11') : ''}`,
      caption: J(
        L(
          `Angle ${fmt(d, 0)}° = ${radStr(d)}: cos α = ${val(Cc, cs)}${Cc?.includes('√') ? ` ≈ ${fmt(r2(cs))}` : ''} (green, along x), sin α = ${val(S, sn)} (pink, along y).`,
          `Угол ${fmt(d, 0)}° = ${radStr(d)}: cos α = ${val(Cc, cs)}${Cc?.includes('√') ? ` ≈ ${fmt(r2(cs))}` : ''} (зелёный, по x), sin α = ${val(S, sn)} (розовый, по y).`,
          `Бұрыш ${fmt(d, 0)}° = ${radStr(d)}: cos α = ${val(Cc, cs)}${Cc?.includes('√') ? ` ≈ ${fmt(r2(cs))}` : ''} (жасыл, x бойынша), sin α = ${val(S, sn)} (қызғылт, y бойынша).`,
        ),
        q ? signs : null,
        d < 0 ? L('A negative angle goes clockwise.', 'Отрицательный угол отсчитывают по часовой стрелке.', 'Теріс бұрыш сағат тілімен өлшенеді.') : null,
      ),
    };
  },
});