// ---------- Линейная функция ----------

const LIN = { x0: -8, x1: 8, y0: -5.5, y1: 5.5 };
const lsx = (x) => 160 + x * 20;
const lsy = (y) => 110 - y * 20;
/** Прямая y = kx + b через всю сцену. */
const fullLine = (k, b, cls = 'exc-p', w = 3) => pth(`M${lsx(-9)} ${n1(lsy(-9 * k + b))} L${lsx(9)} ${n1(lsy(9 * k + b))}`, cls, w);
/** k как дробь для подписи. */
const kStr = (k) => nice(k, 10);
/** «y = 2x − 3» с красивыми дробями. */
const lineStr = (k, b) => {
  const K = kStr(k);
  const kx = K === '0' ? '' : K === '1' ? 'x' : K === '−1' ? '−x' : K.includes('/') ? `${K.startsWith('−') ? '−' : ''}(${K.replace('−', '')})x` : `${K}x`;
  const B = nice(b, 10);
  if (!kx) return `y = ${B}`;
  return `y = ${kx}${B === '0' ? '' : B.startsWith('−') ? ` − ${B.slice(1)}` : ` + ${B}`}`;
};

function linTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let K;
  let B;
  if (type === 0) {
    K = pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
    B = rnd(-4, 4);
    st.task = { type, K, B, done: false };
  } else if (type === 1) {
    let x1;
    let x2;
    do {
      K = pick([-2, -1, 1, 2, 0.5, -0.5]);
      B = rnd(-3, 3);
      x1 = rnd(-4, 0);
      x2 = rnd(1, 4);
    } while (!Number.isInteger(K * x1 + B) || !Number.isInteger(K * x2 + B) || Math.abs(K * x1 + B) > 5 || Math.abs(K * x2 + B) > 5);
    st.task = { type, K, B, P: [x1, K * x1 + B], Q: [x2, K * x2 + B], done: false };
  } else {
    K = pick([-2, -1, 1, 2, 0.5]);
    B = rnd(-4, 4);
    let c;
    do c = rnd(-4, 4);
    while (c === B);
    st.task = { type, K, B, c, done: false };
  }
  return { k: 0.5, b: 1 };
}

const linear = modes({
  title: L('Linear function y = kx + b', 'Линейная функция y = kx + b', 'Сызықтық функция y = kx + b'),
  intro: L('k is the slope: how much y changes when x grows by 1. b is where the line crosses the y-axis.', 'k - угловой коэффициент: на сколько меняется y, когда x растёт на 1. b - где прямая пересекает ось y.', 'k - бұрыштық коэффициент: x бірге өскенде y қаншаға өзгереді. b - түзу y осін қиятын нүкте.'),
  sliders: [
    { id: 'k', label: 'k', min: -4, max: 4, step: 0.1, value: 0.5, hidden: only(0, 2, 3) },
    { id: 'b', label: 'b', min: -5, max: 5, step: 0.1, value: 1, hidden: only(0, 2, 3) },
  ],
  values: { xa: -2, ya: -1, xb: 2, yb: 3, px: 2, py: -3 },
  tabs: [L('k and b', 'k и b', 'k және b'), L('Two points', 'По двум точкам', 'Екі нүкте'), L('Two lines', 'Две прямые', 'Екі түзу'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return linTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return linTask(st);
    st.pre += 1;
    if (st.m === 1) return [{ xa: -3, ya: 4, xb: 3, yb: -2 }, { xa: -4, ya: 2, xb: 4, yb: 2 }, { xa: 0, ya: -3, xb: 2, yb: 3 }, { xa: -2, ya: -1, xb: 2, yb: 3 }][st.pre % 4];
    if (st.m === 2) return [{ px: -3, py: 2 }, { px: 1, py: 4 }, { px: 2, py: -3 }][st.pre % 3];
    return [{ k: 2, b: -3 }, { k: -1, b: 4 }, { k: 0, b: 2 }, { k: 1, b: 0 }, { k: -0.5, b: -2 }, { k: 0.5, b: 1 }][st.pre % 6];
  },
  onDrag(key, p, v, st) {
    const x = clamp(Math.round((p.x - 160) / 20), -7, 7);
    const y = clamp(Math.round((110 - p.y) / 20), -5, 5);
    if (key === 'A' && !(x === v.xb && y === v.yb)) [v.xa, v.ya] = [x, y];
    if (key === 'B' && !(x === v.xa && y === v.ya)) [v.xb, v.yb] = [x, y];
    if (key === 'P') [v.px, v.py] = [x, y];
  },
  draw(v, step, st) {
    const G = grid({ ...LIN, lab: 2 }).svg;
    const slope = (k, b, cls = 'exc-o') => {
      // ступенька: на 1 вправо, на k вверх/вниз
      const x0 = [2, 1, 3, -3, 4, -4, -2].find((x) => Math.abs(k * x + b) < 4.6 && Math.abs(k * x + b + k) < 4.6 && Math.abs(x + b / (k || 1e-9)) > 0.8) ?? 1;
      const y0 = k * x0 + b;
      if (Math.abs(y0) > 5 || Math.abs(y0 + k) > 5.4) return '';
      return `${pth(`M${lsx(x0)} ${n1(lsy(y0))} H${lsx(x0 + 1)} V${n1(lsy(y0 + k))}`, `${cls} ex-dash`, 2)}${T(lsx(x0 + 0.5), lsy(y0) + (k > 0 ? 13 : -5), '1', `m10 tc ${cls} h`)}${Math.abs(k) > 0.05 ? T(lsx(x0 + 1) + 4, (lsy(y0) + lsy(y0 + k)) / 2 + 4, kStr(k), `m10 tc ${cls} ex-start h`) : ''}`;
    };

    if (st.m === 1) {
      const { xa, ya, xb, yb } = v;
      const dx = xb - xa;
      const dy = yb - ya;
      const P = [lsx(xa), lsy(ya)];
      const Q = [lsx(xb), lsy(yb)];
      let line;
      let cap;
      if (dx === 0) {
        line = ln(P[0], 0, P[0], H, 'exc-p', 3);
        cap = L(`Both points have x = ${fmt(xa)}: the line is vertical, x = ${fmt(xa)}. It is not a function y(x) - k does not exist (we would divide by Δx = 0).`, `У обеих точек x = ${fmt(xa)}: прямая вертикальная, x = ${fmt(xa)}. Это не функция y(x) - k не существует (пришлось бы делить на Δx = 0).`, `Екі нүктеде де x = ${fmt(xa)}: түзу тік, x = ${fmt(xa)}. Бұл y(x) функциясы емес - k жоқ (Δx = 0-ге бөлуге тура келер еді).`);
      } else {
        const k = dy / dx;
        const b = ya - k * xa;
        line = fullLine(k, b);
        cap = L(
          `k = Δy/Δx = (${fmt(yb)} − ${pn(ya)})/(${fmt(xb)} − ${pn(xa)}) = ${fmt(dy)}/${fmt(dx)} = ${kStr(k)}. Then b = y₁ − k·x₁ = ${fmt(ya)} − ${kStr(k)}·${pn(xa)} = ${nice(b, 10)}. The line: ${lineStr(k, b)}. Drag the points.`,
          `k = Δy/Δx = (${fmt(yb)} − ${pn(ya)})/(${fmt(xb)} − ${pn(xa)}) = ${fmt(dy)}/${fmt(dx)} = ${kStr(k)}. Тогда b = y₁ − k·x₁ = ${fmt(ya)} − ${kStr(k)}·${pn(xa)} = ${nice(b, 10)}. Прямая: ${lineStr(k, b)}. Перетаскивай точки.`,
          `k = Δy/Δx = (${fmt(yb)} − ${pn(ya)})/(${fmt(xb)} − ${pn(xa)}) = ${fmt(dy)}/${fmt(dx)} = ${kStr(k)}. Онда b = y₁ − k·x₁ = ${fmt(ya)} − ${kStr(k)}·${pn(xa)} = ${nice(b, 10)}. Түзу: ${lineStr(k, b)}. Нүктелерді сүйре.`,
        );
      }
      const tri = dx ? `${pth(`M${n1(P[0])} ${n1(P[1])} H${n1(Q[0])} V${n1(Q[1])}`, 'exc-o ex-dash', 2)}${T((P[0] + Q[0]) / 2, P[1] + (dy > 0 ? 13 : -5), `Δx = ${fmt(dx)}`, 'm10 tc exc-o h')}${T(Q[0] + (dx > 0 ? 5 : -5), (P[1] + Q[1]) / 2 + 4, `Δy = ${fmt(dy)}`, `m10 tc exc-o h ${dx > 0 ? 'ex-start' : 'ex-end'}`)}` : '';
      return {
        svg: `${G}${line}${tri}${dot(P[0], P[1], 6, 'exc-b')}${dot(Q[0], Q[1], 6, 'exc-k')}${T(P[0] - 8, P[1] - 8, `A(${fmt(xa)}; ${fmt(ya)})`, 'm10 tc exc-b ex-end h')}${T(Q[0] + 8, Q[1] - 8, `B(${fmt(xb)}; ${fmt(yb)})`, 'm10 tc exc-k ex-start h')}
          ${T(8, 18, dx ? lineStr(dy / dx, ya - (dy / dx) * xa) : `x = ${fmt(xa)}`, 'm15 ex-start h')}${hit('A', P[0], P[1], 16)}${hit('B', Q[0], Q[1], 16)}`,
        caption: cap,
      };
    }

    const { k, b } = v;
    const flat = Math.abs(k) < 0.05;

    if (st.m === 2) {
      const { px, py } = v;
      const P = [lsx(px), lsy(py)];
      const bp = py - k * px;
      const perp = flat ? null : -1 / k;
      const bq = flat ? 0 : py - perp * px;
      const onL = Math.abs(py - (k * px + b)) < 0.05;
      return {
        svg: `${G}${fullLine(k, b)}${fullLine(k, bp, 'exc-b', 2.5)}${flat ? ln(P[0], 0, P[0], H, 'exc-g', 2.5) : fullLine(perp, bq, 'exc-g', 2.5)}${dot(P[0], P[1], 6, 'exc-o')}${hit('P', P[0], P[1], 16)}
          ${T(8, 18, lineStr(k, b), 'm12 tc exc-p ex-start h')}${T(8, 36, `∥ ${lineStr(k, bp)}`, 'm12 tc exc-b ex-start h')}${T(8, 54, `⊥ ${flat ? `x = ${fmt(px)}` : lineStr(perp, bq)}`, 'm12 tc exc-g ex-start h')}${T(P[0] + 8, P[1] + 16, `P(${fmt(px)}; ${fmt(py)})`, 'm10 tc exc-o ex-start h')}`,
        caption: flat
          ? L(`k = 0: the parallel line through P is y = ${fmt(py)}, the perpendicular one is vertical, x = ${fmt(px)}.`, `k = 0: параллельная прямая через P - это y = ${fmt(py)}, перпендикулярная - вертикальная x = ${fmt(px)}.`, `k = 0: P арқылы параллель түзу - y = ${fmt(py)}, перпендикуляр түзу - тік x = ${fmt(px)}.`)
          : L(
              `Parallel lines have equal k: through P(${fmt(px)}; ${fmt(py)}) it is ${lineStr(k, bp)}${onL ? ' (P lies on the line - the lines coincide)' : ''}. Perpendicular: k₁·k₂ = −1, so k₂ = −1/${kStr(k)} = ${kStr(perp)}: ${lineStr(perp, bq)}. Drag P.`,
              `У параллельных прямых равные k: через P(${fmt(px)}; ${fmt(py)}) это ${lineStr(k, bp)}${onL ? ' (P лежит на прямой - прямые совпали)' : ''}. Перпендикулярная: k₁·k₂ = −1, значит k₂ = −1/${kStr(k)} = ${kStr(perp)}: ${lineStr(perp, bq)}. Перетаскивай P.`,
              `Параллель түзулердің k-сы тең: P(${fmt(px)}; ${fmt(py)}) арқылы ${lineStr(k, bp)}${onL ? ' (P түзуде жатыр - түзулер беттесті)' : ''}. Перпендикуляр: k₁·k₂ = −1, демек k₂ = −1/${kStr(k)} = ${kStr(perp)}: ${lineStr(perp, bq)}. P-ны сүйре.`,
            ),
      };
    }

    const root = flat ? null : -b / k;
    const ang = (Math.atan(k) * 180) / Math.PI;
    const base = `${G}${fullLine(k, b)}${slope(k, b)}${dot(lsx(0), lsy(b), 6, 'exc-b')}${T(lsx(0) + (k > 0 ? -7 : 7), lsy(b) - 7, `(0; ${fmt(b)})`, `m10 tc exc-b h ${k > 0 ? 'ex-end' : 'ex-start'}`)}
      ${root !== null && Math.abs(root) < 7.5 ? `${dot(lsx(root), lsy(0), 5, 'exc-g')}${T(lsx(root), lsy(0) + (k > 0 ? 16 : -8), `x = ${fmt(root)}`, 'm10 tc exc-g h')}${Math.abs(k) > 0.05 ? pth(arcD(lsx(root), lsy(0), 16, 0, ang), 'exc-g', 1.5) : ''}` : ''}`;

    if (st.m === 3) {
      const tk = st.task ?? (linTask(st), st.task);
      let ok = near(k, tk.K) && near(b, tk.type === 2 ? tk.B : tk.B);
      let svg = base;
      let ask;
      let tag;
      if (tk.type === 0) {
        tag = lineStr(tk.K, tk.B);
        ask = L(`Build the line ${lineStr(tk.K, tk.B)} with the sliders.`, `Построй прямую ${lineStr(tk.K, tk.B)} ползунками.`, `Жүгірткілермен ${lineStr(tk.K, tk.B)} түзуін тұрғыз.`);
      } else if (tk.type === 1) {
        tag = `(${fmt(tk.P[0])}; ${fmt(tk.P[1])}), (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])})`;
        svg += ring(lsx(tk.P[0]), lsy(tk.P[1]), 7, 'exc-o', 2.5) + ring(lsx(tk.Q[0]), lsy(tk.Q[1]), 7, 'exc-o', 2.5);
        ask = L(`Draw the line through the orange points (${fmt(tk.P[0])}; ${fmt(tk.P[1])}) and (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])}).`, `Проведи прямую через оранжевые точки (${fmt(tk.P[0])}; ${fmt(tk.P[1])}) и (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])}).`, `(${fmt(tk.P[0])}; ${fmt(tk.P[1])}) және (${fmt(tk.Q[0])}; ${fmt(tk.Q[1])}) қызғылт сары нүктелері арқылы түзу жүргіз.`);
      } else {
        tag = `∥ ${lineStr(tk.K, tk.c)}, (0; ${fmt(tk.B)})`;
        svg += fullLine(tk.K, tk.c, 'exc-m ex-dash', 2) + ring(lsx(0), lsy(tk.B), 7, 'exc-o', 2.5);
        ask = L(`Make the line parallel to the dashed ${lineStr(tk.K, tk.c)} and passing through (0; ${fmt(tk.B)}).`, `Сделай прямую параллельной пунктирной ${lineStr(tk.K, tk.c)} и проходящей через (0; ${fmt(tk.B)}).`, `Түзуді пунктир ${lineStr(tk.K, tk.c)} түзуіне параллель және (0; ${fmt(tk.B)}) арқылы өтетін ет.`);
      }
      ok = check(st, ok);
      const hint = L(
        `Now ${lineStr(k, b)}. ${near(k, tk.K) ? 'k is right, now b.' : tk.type === 1 ? 'Hint: k = Δy/Δx.' : `Hint: k = ${kStr(tk.K)}.`}`,
        `Сейчас ${lineStr(k, b)}. ${near(k, tk.K) ? 'k уже верный, осталось b.' : tk.type === 1 ? 'Подсказка: k = Δy/Δx.' : `Подсказка: k = ${kStr(tk.K)}.`}`,
        `Қазір ${lineStr(k, b)}. ${near(k, tk.K) ? 'k дұрыс, енді b.' : tk.type === 1 ? 'Кеңес: k = Δy/Δx.' : `Кеңес: k = ${kStr(tk.K)}.`}`,
      );
      return { svg: `${svg}${T(8, 18, lineStr(k, b), 'm12 ex-start h')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: `${base}${T(8, 18, lineStr(k, b), 'm15 ex-start h')}${T(8, 36, flat ? u('constant', 'постоянная', 'тұрақты') : k > 0 ? u('increasing ↗', 'возрастает ↗', 'өседі ↗') : u('decreasing ↘', 'убывает ↘', 'кемиді ↘'), `m11 ex-start h tc ${flat ? 'exc-m' : k > 0 ? 'exc-g' : 'exc-r'}`)}`,
      caption: flat
        ? L(`k = 0: the line is horizontal, y is always ${fmt(b)}.`, `k = 0: прямая горизонтальна, y всегда равен ${fmt(b)}.`, `k = 0: түзу көлденең, y әрқашан ${fmt(b)}.`)
        : L(
            `k = ${fmt(k)}: when x grows by 1, y ${k > 0 ? 'grows' : 'falls'} by ${fmt(Math.abs(k))} (orange step); the angle with the x-axis is ${fmt(ang, 0)}° (tg α = k). b = ${fmt(b)}: the line crosses the y-axis at (0; ${fmt(b)}), and the x-axis at x = −b/k = ${fmt(root)}.`,
            `k = ${fmt(k)}: когда x растёт на 1, y ${k > 0 ? 'растёт' : 'уменьшается'} на ${fmt(Math.abs(k))} (оранжевая ступенька); угол с осью x - ${fmt(ang, 0)}° (tg α = k). b = ${fmt(b)}: прямая пересекает ось y в (0; ${fmt(b)}), а ось x - в x = −b/k = ${fmt(root)}.`,
            `k = ${fmt(k)}: x бірге өскенде y ${fmt(Math.abs(k))}-ге ${k > 0 ? 'өседі' : 'кемиді'} (қызғылт сары баспалдақ); x осімен бұрышы ${fmt(ang, 0)}° (tg α = k). b = ${fmt(b)}: түзу y осін (0; ${fmt(b)}) нүктесінде, x осін x = −b/k = ${fmt(root)} нүктесінде қияды.`,
          ),
    };
  },
});

// ---------- Парабола ----------

const PSX = (x) => 160 + x * 20;
const PSY = (y) => 120 - y * 10;

function parTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t;
  if (type === 0) {
    let r1;
    let r2;
    do {
      r1 = rnd(-4, 3);
      r2 = rnd(r1 + 1, 4);
    } while (Math.abs(r1 * r2) > 6 || Math.abs(r1 + r2) > 6);
    t = { r1, r2, tag: `x₁ = ${fmt(r1)}, x₂ = ${fmt(r2)}`, p: { a: 1, b: 0, c: 0 } };
  } else if (type === 1) {
    let h;
    let m;
    let a;
    do {
      a = pick([1, -1]);
      h = rnd(-3, 3);
      m = rnd(-4, 4);
    } while (Math.abs(a * h * h + m) > 6 || h === 0);
    t = { a, h, m, tag: `(${h}; ${m})`, p: { a, b: 0, c: 0 } };
  } else if (type === 2) {
    let a;
    let b;
    do {
      a = pick([1, 2, -1, 0.5]);
      b = pick([-4, -2, 2, 4, 3, -3]);
    } while (Math.abs((b * b) / (4 * a)) > 6 || Math.abs(((b * b) / (4 * a)) * 10 - Math.round(((b * b) / (4 * a)) * 10)) > 1e-9);
    t = { a, b, c: (b * b) / (4 * a), tag: 'D = 0', p: { a, b, c: 0 } };
  } else t = { tag: 'a < 0, D < 0', p: { a: 1, b: -2, c: -3 } };
  st.task = { type, done: false, ...t };
  return t.p;
}

const parabola = modes({
  title: L('The parabola y = ax² + bx + c', 'Парабола y = ax² + bx + c', 'Парабола y = ax² + bx + c'),
  intro: L('a sets the direction and width, c lifts the graph, b moves the vertex sideways. The discriminant tells how many roots there are.', 'a задаёт направление ветвей и ширину, c поднимает график, b сдвигает вершину вбок. Дискриминант показывает, сколько корней.', 'a тармақтардың бағыты мен енін, c графикті көтереді, b төбені бүйірге жылжытады. Дискриминант түбір санын көрсетеді.'),
  sliders: [
    { id: 'a', label: 'a', min: -3, max: 3, step: 0.1, value: 1 },
    { id: 'b', label: 'b', min: -6, max: 6, step: 0.1, value: -2 },
    { id: 'c', label: 'c', min: -6, max: 6, step: 0.1, value: -3 },
  ],
  tabs: [L('Roots and D', 'Корни и D', 'Түбірлер және D'), L('Vertex', 'Вершина', 'Төбе'), L('Signs', 'Знаки', 'Таңбалар'), TASK],
  acts: [{ label: 'a → −a', only: [0, 1, 2] }, { label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return parTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { a: -v.a, b: -v.b, c: -v.c };
    if (st.m === 3) return parTask(st);
    st.pre = (st.pre + 1) % 6;
    return [{ a: 1, b: -4, c: 4 }, { a: -1, b: 2, c: 3 }, { a: 0.5, b: 0, c: 2 }, { a: 2, b: 4, c: 0 }, { a: -0.5, b: -1, c: 4 }, { a: 1, b: -2, c: -3 }][st.pre];
  },
  draw(v, step, st) {
    const a = Math.round(v.a * 10) / 10;
    const b = Math.round(v.b * 10) / 10;
    const c = Math.round(v.c * 10) / 10;
    const f = (x) => a * x * x + b * x + c;
    const G = grid({ x0: -8, x1: 8, y0: -10, y1: 12, step: 1, ystep: 2, lab: 2, ylab: 4 }).svg;
    const eq = `y = ${polyStr([[a, 'x²'], [b, 'x'], [c, '']])}`;
    const curve = pth(plot(f, -8.2, 8.2, PSX, PSY, 160), 'exc-p', 3);
    const isLine = a === 0;
    const D = b * b - 4 * a * c;
    const Dz = Math.abs(D) < 1e-9;
    const xv = isLine ? 0 : -b / (2 * a);
    const yv = isLine ? 0 : f(xv);
    const roots = isLine ? (b ? [-c / b] : []) : Dz ? [xv] : D < 0 ? [] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q);
    const rootDots = roots.map((r) => `${dot(PSX(r), PSY(0), 5.5, 'exc-o')}${Math.abs(r) < 7.8 ? T(PSX(r), PSY(0) + 15, fmt(r), 'm10 tc exc-o h') : ''}`).join('');
    const vtx = !isLine && Math.abs(yv) < 12 && Math.abs(xv) < 8 ? dot(PSX(xv), PSY(yv), 5, 'exc-k') : '';
    const head = T(8, 18, eq, 'm12 ex-start h');

    if (isLine)
      return {
        svg: `${G}${curve}${rootDots}${head}`,
        caption: L(`a = 0: no x², so this is the straight line y = ${fmt(b)}x${term(c)}, not a parabola.${roots.length ? ` It crosses the x-axis at x = ${fmt(roots[0])}.` : ''}`, `a = 0: нет x², это уже не парабола, а прямая y = ${fmt(b)}x${term(c)}.${roots.length ? ` Она пересекает ось x в x = ${fmt(roots[0])}.` : ''}`, `a = 0: x² жоқ, бұл парабола емес, y = ${fmt(b)}x${term(c)} түзуі.${roots.length ? ` Ол x осін x = ${fmt(roots[0])} нүктесінде қияды.` : ''}`),
      };

    const howMany = (two, one, none) => (Dz ? one : D > 0 ? two : none);
    const rs = roots.map((r) => fmt(r)).join('; ');

    if (st.m === 1) {
      const ghost = pth(plot((x) => a * x * x, -8.2, 8.2, PSX, PSY, 120), 'exc-m ex-dash', 1.5);
      const vy = clamp(PSY(yv), 2, 218);
      const vform = `y = ${coef(a)}${Math.abs(xv) > 1e-9 ? `(x${term(-xv)})²` : 'x²'}${fmt(yv) === '0' ? '' : term(yv)}`;
      return {
        svg: `${G}${ghost}${ln(PSX(xv), 0, PSX(xv), H, 'exc-k ex-dash', 1.5)}${curve}${arrow(PSX(0), PSY(0), PSX(xv), vy, 'exc-o', 2)}${vtx}${dot(PSX(0), PSY(0), 3.5, 'exc-m')}
          ${head}${T(8, 36, vform, 'm12 tc exc-k ex-start h')}${T(PSX(xv) + 6, clamp(vy + (a > 0 ? 16 : -8), 12, 214), `(${fmt(xv)}; ${fmt(yv)})`, 'm10 tc exc-k ex-start h')}${T(312, 214, `x = ${fmt(xv)}`, 'm10 tc exc-k ex-end h')}`,
        caption: L(
          `Vertex: x₀ = −b/(2a) = ${fmt(-b)}/${fmt(2 * a)} = ${fmt(xv)}, y₀ = y(x₀) = ${fmt(yv)}. So ${vform}: the dashed parabola y = ${coef(a)}x² is moved by ${fmt(xv)} along x and ${fmt(yv)} along y (orange arrow). The line x = ${fmt(xv)} is the axis of symmetry; ${a > 0 ? `the smallest value is ${fmt(yv)}` : `the largest value is ${fmt(yv)}`}.`,
          `Вершина: x₀ = −b/(2a) = ${fmt(-b)}/${fmt(2 * a)} = ${fmt(xv)}, y₀ = y(x₀) = ${fmt(yv)}. Значит ${vform}: пунктирную параболу y = ${coef(a)}x² сдвинули на ${fmt(xv)} по x и на ${fmt(yv)} по y (оранжевая стрелка). Прямая x = ${fmt(xv)} - ось симметрии; ${a > 0 ? `наименьшее значение ${fmt(yv)}` : `наибольшее значение ${fmt(yv)}`}.`,
          `Төбе: x₀ = −b/(2a) = ${fmt(-b)}/${fmt(2 * a)} = ${fmt(xv)}, y₀ = y(x₀) = ${fmt(yv)}. Демек ${vform}: пунктир y = ${coef(a)}x² параболасы x бойынша ${fmt(xv)}-ге, y бойынша ${fmt(yv)}-ге жылжыды (қызғылт сары нұсқар). x = ${fmt(xv)} түзуі - симметрия осі; ${a > 0 ? `ең кіші мәні ${fmt(yv)}` : `ең үлкен мәні ${fmt(yv)}`}.`,
        ),
      };
    }

    if (st.m === 2) {
      const pos = `M${PSX(-8.2)} ${PSY(0)} ${plot((x) => Math.max(0, f(x)), -8.2, 8.2, PSX, PSY, 160).replace(/^M/, 'L')} L${PSX(8.2)} ${PSY(0)} Z`;
      const neg = `M${PSX(-8.2)} ${PSY(0)} ${plot((x) => Math.min(0, f(x)), -8.2, 8.2, PSX, PSY, 160).replace(/^M/, 'L')} L${PSX(8.2)} ${PSY(0)} Z`;
      const cuts = [-9, ...roots, 9];
      let segs = '';
      for (let i = 0; i < cuts.length - 1; i++) {
        const m = (cuts[i] + cuts[i + 1]) / 2;
        const pos2 = f(m) > 0;
        segs += ln(PSX(Math.max(cuts[i], -8.2)), PSY(0), PSX(Math.min(cuts[i + 1], 8.2)), PSY(0), pos2 ? 'exc-g' : 'exc-r', 5);
        const lx = clamp((Math.max(cuts[i], -8) + Math.min(cuts[i + 1], 8)) / 2, -7.5, 7.5);
        if (Math.min(cuts[i + 1], 8) - Math.max(cuts[i], -8) > 0.8) segs += T(PSX(lx), PSY(0) + (pos2 ? -8 : 20), pos2 ? '+' : '−', `m15 tc h ${pos2 ? 'exc-g' : 'exc-r'}`);
      }
      const iv = (lo, hi) => `(${lo === -Infinity ? '−∞' : fmt(lo)}; ${hi === Infinity ? '+∞' : fmt(hi)})`;
      let posS;
      let negS;
      if (roots.length === 2) {
        const out = `${iv(-Infinity, roots[0])} ∪ ${iv(roots[1], Infinity)}`;
        const inn = iv(roots[0], roots[1]);
        posS = a > 0 ? out : inn;
        negS = a > 0 ? inn : out;
      } else if (roots.length === 1) {
        const all = `${iv(-Infinity, roots[0])} ∪ ${iv(roots[0], Infinity)}`;
        posS = a > 0 ? all : '∅';
        negS = a > 0 ? '∅' : all;
      } else {
        posS = a > 0 ? '(−∞; +∞)' : '∅';
        negS = a > 0 ? '∅' : '(−∞; +∞)';
      }
      return {
        svg: `${G}${area(pos, 'exc-g', 0.22)}${area(neg, 'exc-r', 0.22)}${curve}${segs}${rootDots}${head}`,
        caption: L(
          `Signs: y > 0 for x ∈ ${posS}; y < 0 for x ∈ ${negS}.${roots.length ? ` At ${rs} y = 0.` : ''} This is how a quadratic inequality is solved: find the roots, look at where the parabola is above or below the axis.`,
          `Знаки: y > 0 при x ∈ ${posS}; y < 0 при x ∈ ${negS}.${roots.length ? ` В точках ${rs} y = 0.` : ''} Так решают квадратное неравенство: находим корни и смотрим, где парабола выше или ниже оси.`,
          `Таңбалар: y > 0, егер x ∈ ${posS}; y < 0, егер x ∈ ${negS}.${roots.length ? ` ${rs} нүктелерінде y = 0.` : ''} Квадрат теңсіздік осылай шешіледі: түбірлерді тауып, парабола осьтен қай жерде жоғары не төмен екенін қараймыз.`,
        ),
      };
    }

    const base = `${G}${curve}${rootDots}${vtx}${dot(PSX(0), PSY(c), 4, 'exc-b')}${head}${T(8, 36, `D = ${fmt(Dz ? 0 : D)}`, `m12 ex-start h tc ${D > 0 ? 'exc-g' : Dz ? 'exc-o' : 'exc-r'}`)}`;

    if (st.m === 3) {
      const tk = st.task ?? (parTask(st), st.task);
      let ok = false;
      let ask;
      let hint;
      if (tk.type === 0) {
        ok = roots.length === 2 && near(roots[0], tk.r1, 0.06) && near(roots[1], tk.r2, 0.06);
        ask = L(`Make the roots x₁ = ${fmt(tk.r1)} and x₂ = ${fmt(tk.r2)}.`, `Сделай корни x₁ = ${fmt(tk.r1)} и x₂ = ${fmt(tk.r2)}.`, `Түбірлерді x₁ = ${fmt(tk.r1)} және x₂ = ${fmt(tk.r2)} ет.`);
        hint = L(`Hint (Vieta, a = 1): b = −(x₁ + x₂) = ${fmt(-(tk.r1 + tk.r2))}, c = x₁·x₂ = ${fmt(tk.r1 * tk.r2)}.`, `Подсказка (Виет, a = 1): b = −(x₁ + x₂) = ${fmt(-(tk.r1 + tk.r2))}, c = x₁·x₂ = ${fmt(tk.r1 * tk.r2)}.`, `Кеңес (Виет, a = 1): b = −(x₁ + x₂) = ${fmt(-(tk.r1 + tk.r2))}, c = x₁·x₂ = ${fmt(tk.r1 * tk.r2)}.`);
      } else if (tk.type === 1) {
        ok = near(a, tk.a) && near(xv, tk.h, 0.06) && near(yv, tk.m, 0.06);
        ask = L(`With a = ${tk.a}, put the vertex at (${fmt(tk.h)}; ${fmt(tk.m)}).`, `При a = ${tk.a} поставь вершину в точку (${fmt(tk.h)}; ${fmt(tk.m)}).`, `a = ${tk.a} болғанда төбені (${fmt(tk.h)}; ${fmt(tk.m)}) нүктесіне қой.`);
        hint = L(`Now the vertex is (${fmt(xv)}; ${fmt(yv)}). Hint: x₀ = −b/(2a), so b = ${fmt(-2 * tk.a * tk.h)}; then pick c.`, `Сейчас вершина (${fmt(xv)}; ${fmt(yv)}). Подсказка: x₀ = −b/(2a), значит b = ${fmt(-2 * tk.a * tk.h)}; потом подбери c.`, `Қазір төбе (${fmt(xv)}; ${fmt(yv)}). Кеңес: x₀ = −b/(2a), демек b = ${fmt(-2 * tk.a * tk.h)}; сосын c-ны таңда.`);
      } else if (tk.type === 2) {
        ok = near(a, tk.a) && near(b, tk.b) && Dz;
        ask = L(`a = ${fmt(tk.a)}, b = ${fmt(tk.b)}. Pick c so that the parabola only touches the x-axis (D = 0).`, `a = ${fmt(tk.a)}, b = ${fmt(tk.b)}. Подбери c, чтобы парабола только касалась оси x (D = 0).`, `a = ${fmt(tk.a)}, b = ${fmt(tk.b)}. Парабола x осін тек жанап өтетіндей c-ны таңда (D = 0).`);
        hint = L(`Now D = ${fmt(D)}. Hint: b² − 4ac = 0 → c = b²/(4a).`, `Сейчас D = ${fmt(D)}. Подсказка: b² − 4ac = 0 → c = b²/(4a).`, `Қазір D = ${fmt(D)}. Кеңес: b² − 4ac = 0 → c = b²/(4a).`);
      } else {
        ok = a < 0 && D < 0 && !Dz;
        ask = L('Make the branches point down and leave no roots at all.', 'Сделай так, чтобы ветви смотрели вниз и корней не было совсем.', 'Тармақтар төмен қарайтын және түбір мүлде болмайтындай ет.');
        hint = L(`Now a = ${fmt(a)}, D = ${fmt(D)}. Hint: a < 0, and the vertex must be below the x-axis.`, `Сейчас a = ${fmt(a)}, D = ${fmt(D)}. Подсказка: a < 0, а вершина должна быть ниже оси x.`, `Қазір a = ${fmt(a)}, D = ${fmt(D)}. Кеңес: a < 0, ал төбе x осінен төмен болуы керек.`);
      }
      ok = check(st, ok);
      return { svg: `${base}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: base,
      caption: L(
        `${a > 0 ? 'a > 0: branches up' : 'a < 0: branches down'}. D = b² − 4ac = ${pn(b)}² − 4·${pn(a)}·${pn(c)} = ${fmt(Dz ? 0 : D)}: ${howMany('two roots', 'one root', 'no real roots')}.${roots.length ? ` x = (−b ± √D)/(2a): ${rs}.` : ''} The blue dot (0; ${fmt(c)}) is where the graph meets the y-axis.`,
        `${a > 0 ? 'a > 0: ветви вверх' : 'a < 0: ветви вниз'}. D = b² − 4ac = ${pn(b)}² − 4·${pn(a)}·${pn(c)} = ${fmt(Dz ? 0 : D)}: ${howMany('два корня', 'один корень', 'корней нет')}.${roots.length ? ` x = (−b ± √D)/(2a): ${rs}.` : ''} Синяя точка (0; ${fmt(c)}) - пересечение с осью y.`,
        `${a > 0 ? 'a > 0: тармақтар жоғары' : 'a < 0: тармақтар төмен'}. D = b² − 4ac = ${pn(b)}² − 4·${pn(a)}·${pn(c)} = ${fmt(Dz ? 0 : D)}: ${howMany('екі түбір', 'бір түбір', 'түбір жоқ')}.${roots.length ? ` x = (−b ± √D)/(2a): ${rs}.` : ''} Көк нүкте (0; ${fmt(c)}) - y осімен қиылысу.`,
      ),
    };
  },
});