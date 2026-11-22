// ---------- Интеграл ----------

const IFUN = [
  { f: (x) => x * x, F: (x) => (x * x * x) / 3, s: 'x²', Fs: 'x³/3', y0: -1.2, y1: 9.5 },
  { f: (x) => 4 - x * x, F: (x) => 4 * x - (x * x * x) / 3, s: '4 − x²', Fs: '4x − x³/3', y0: -5.5, y1: 4.8 },
  { f: Math.sin, F: (x) => -Math.cos(x), s: 'sin x', Fs: '−cos x', y0: -1.5, y1: 1.5 },
  { f: (x) => x + 1, F: (x) => (x * x) / 2 + x, s: 'x + 1', Fs: 'x²/2 + x', y0: -2.5, y1: 4.5 },
];
const METH = [L('left', 'левые', 'сол'), L('middle', 'средние', 'орта'), L('right', 'правые', 'оң'), L('trapezoids', 'трапеции', 'трапециялар')];
const INT_TASKS = [
  { fi: 0, a: 0, v: 9, sol: [3] },
  { fi: 3, a: -1, v: 2, sol: [1] },
  { fi: 2, a: 0, v: 1, sol: [Math.PI / 2] },
  { fi: 1, a: 0, v: 0, sol: [Math.sqrt(12)] },
  { fi: 0, a: 0, v: 1 / 3, sol: [1] },
];

function intTask(st) {
  let i;
  do i = rnd(0, INT_TASKS.length - 1);
  while (st.task && st.task.i === i);
  const t = INT_TASKS[i];
  st.task = { i, ...t, done: false };
  st.fi = t.fi;
  return { a: t.a, b: t.a + 0.5 };
}

const integral = modes({
  title: L('The integral: area under the graph', 'Интеграл - площадь под графиком', 'Интеграл - график астындағы аудан'),
  intro: L('Cover the area with thin rectangles and add them up. The limit of these sums is the integral, and it equals F(b) − F(a).', 'Закроем площадь тонкими прямоугольниками и сложим их. Предел таких сумм - интеграл, и он равен F(b) − F(a).', 'Ауданды жұқа тіктөртбұрыштармен жауып, қосамыз. Осындай қосындылардың шегі - интеграл, ол F(b) − F(a)-ға тең.'),
  sliders: [
    { id: 'a', label: 'a', min: -3, max: 3, step: 0.1, value: 0, hidden: (v, st) => st.m === 2 },
    { id: 'b', label: 'b', min: -3, max: 3, step: 0.01, value: 2 },
    { id: 'n', label: 'n', min: 1, max: 40, value: 6, hidden: only(0) },
  ],
  tabs: [L('Riemann sums', 'Суммы', 'Қосындылар'), L('Antiderivative', 'Первообразная', 'Алғашқы функция'), TASK],
  acts: [{ label: L('Function ↻', 'Функция ↻', 'Функция ↻'), only: [0, 1] }, { label: L('Method ↻', 'Способ ↻', 'Тәсіл ↻'), only: [0] }, { label: MORE, only: [2] }],
  state: () => ({ fi: 0, me: 1 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return intTask(st);
    if (m === 2) st.fi = st.task.fi;
    return null;
  },
  onAct(j, st) {
    if (j === 0) st.fi = (st.fi + 1) % IFUN.length;
    else if (j === 1) st.me = (st.me + 1) % 4;
    else return intTask(st);
    return null;
  },
  draw(v, step, st) {
    const F0 = IFUN[st.fi];
    const { f, F } = F0;
    const tk = st.m === 2 ? (st.task ?? (intTask(st), st.task)) : null;
    const a = tk ? tk.a : v.a;
    const b = v.b;
    const exact = F(b) - F(a);
    const two = st.m === 1;
    const G = grid({ x0: -3.3, x1: 3.3, y0: F0.y0, y1: F0.y1, Y0: 0, Y1: two ? 126 : H, lab: 1, ylab: F0.y1 > 5 ? 2 : 1, ystep: F0.y1 > 5 ? 1 : 0.5 });
    const { sx, sy } = G;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const fill = (fn, x1, x2, cls) => (x2 - x1 > 1e-6 ? area(`M${n1(sx(x1))} ${n1(sy(0))} ${plot((x) => fn(x), x1, x2, sx, sy, 80).replace(/^M/, 'L')} L${n1(sx(x2))} ${n1(sy(0))} Z`, cls, 0.3) : '');
    const shade = fill((x) => Math.max(0, f(x)), lo, hi, 'exc-g') + fill((x) => Math.min(0, f(x)), lo, hi, 'exc-r');
    const curve = pth(plotClip(f, -3.3, 3.3, sx, sy, -5, (two ? 126 : H) + 5), 'exc-p', 3);
    const ab = `${ln(sx(a), sy(0) - 4, sx(a), sy(0) + 4, 'exc-o', 2)}${T(sx(a), sy(0) + 16, 'a', 'm11 tc exc-o h')}${ln(sx(b), sy(0) - 4, sx(b), sy(0) + 4, 'exc-o', 2)}${T(sx(b), sy(0) + 16, 'b', 'm11 tc exc-o h')}`;
    const head = T(8, 16, `f(x) = ${F0.s}`, 'm11 ex-start h');
    const nl = `∫ ${fmt(a)}..${fmt(b)}`;

    if (st.m === 1) {
      const Gb = grid({ x0: -3.3, x1: 3.3, y0: -1, y1: 1, Y0: 134, Y1: 216, labels: false });
      const vals = [];
      for (let i = 0; i <= 60; i++) vals.push(F(-3.3 + (6.6 * i) / 60) - F(a));
      const ymin = Math.min(...vals, -0.5);
      const ymax = Math.max(...vals, 0.5);
      const syb = (y) => 216 - ((y - ymin) / (ymax - ymin)) * 80;
      return {
        svg: `${G.svg}${shade}${curve}${ab}${head}${Gb.svg.replace(/<text[^>]*>[^<]*<\/text>/g, '')}${ln(0, syb(0), W, syb(0), 'exc-m', 1.2)}${pth(plotClip((x) => F(x) - F(a), -3.3, 3.3, sx, syb, 132, 218), 'exc-o', 2.5)}${dot(sx(b), syb(exact), 5, 'exc-o')}${ln(sx(b), sy(f(b)), sx(b), syb(exact), 'exc-m ex-dash', 1)}
          ${T(8, 146, `F(x) − F(a), F = ${F0.Fs}`, 'm10 tc exc-o ex-start h')}${T(312, 16, `${nl} = ${fmt(exact, 3)}`, 'm11 ex-end h')}`,
        caption: L(
          `The orange graph is the accumulated area from a to x. It grows where f > 0 (green area) and falls where f < 0 (red). Its slope is f itself: F′ = f. So ∫ from ${fmt(a)} to ${fmt(b)} of ${F0.s} dx = F(b) − F(a) = ${fmt(F(b), 3)} − ${fmt(F(a), 3)} = ${fmt(exact, 3)} (Newton-Leibniz).`,
          `Оранжевый график - накопленная площадь от a до x. Он растёт там, где f > 0 (зелёная площадь), и падает, где f < 0 (красная). Его наклон - сама f: F′ = f. Поэтому ∫ от ${fmt(a)} до ${fmt(b)} ${F0.s} dx = F(b) − F(a) = ${fmt(F(b), 3)} − ${fmt(F(a), 3)} = ${fmt(exact, 3)} (Ньютон-Лейбниц).`,
          `Қызғылт сары график - a-дан x-ке дейінгі жиналған аудан. Ол f > 0 жерде (жасыл аудан) өседі, f < 0 жерде (қызыл) кемиді. Оның көлбеулігі - f-тің өзі: F′ = f. Сондықтан ${fmt(a)}-дан ${fmt(b)}-ге дейін ∫ ${F0.s} dx = F(b) − F(a) = ${fmt(F(b), 3)} − ${fmt(F(a), 3)} = ${fmt(exact, 3)} (Ньютон-Лейбниц).`,
        ),
      };
    }

    if (tk) {
      const ok = check(st, Math.abs(exact - tk.v) < 0.02 && b > tk.a + 0.05);
      return {
        svg: `${G.svg}${shade}${curve}${ab}${head}${T(312, 40, `= ${fmt(exact, 3)}`, 'm12 ex-end h')}${badge(`∫ ${fmt(tk.a)}..b ${F0.s} dx = ${fmt(tk.v, 3)}`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Find b > ${fmt(tk.a)} such that the integral of ${F0.s} from ${fmt(tk.a)} to b equals ${fmt(tk.v, 3)}.`, `Найди b > ${fmt(tk.a)}, при котором интеграл ${F0.s} от ${fmt(tk.a)} до b равен ${fmt(tk.v, 3)}.`, `${fmt(tk.a)}-дан b-ге дейінгі ${F0.s} интегралы ${fmt(tk.v, 3)}-ге тең болатын b > ${fmt(tk.a)} тап.`),
          L(`Now it is ${fmt(exact, 3)}. Hint: F(x) = ${F0.Fs}, solve F(b) − F(${fmt(tk.a)}) = ${fmt(tk.v, 3)}.${tk.v === 0 ? ' Area above and below the axis must cancel.' : ''}`, `Сейчас ${fmt(exact, 3)}. Подсказка: F(x) = ${F0.Fs}, реши F(b) − F(${fmt(tk.a)}) = ${fmt(tk.v, 3)}.${tk.v === 0 ? ' Площади над осью и под осью должны сократиться.' : ''}`, `Қазір ${fmt(exact, 3)}. Кеңес: F(x) = ${F0.Fs}, F(b) − F(${fmt(tk.a)}) = ${fmt(tk.v, 3)} теңдеуін шеш.${tk.v === 0 ? ' Осьтен жоғары және төмен аудандар қысқаруы керек.' : ''}`),
        ),
      };
    }

    const n = Math.round(v.n);
    const dx = (b - a) / n;
    let sum = 0;
    let rects = '';
    for (let i = 0; i < n; i++) {
      const x1 = a + i * dx;
      const x2 = x1 + dx;
      if (st.me === 3) {
        sum += ((f(x1) + f(x2)) / 2) * dx;
        rects += `<path class="ex-rect" d="M${n1(sx(x1))} ${n1(sy(0))} L${n1(sx(x1))} ${n1(clamp(sy(f(x1)), -10, 230))} L${n1(sx(x2))} ${n1(clamp(sy(f(x2)), -10, 230))} L${n1(sx(x2))} ${n1(sy(0))} Z"/>`;
      } else {
        const xs = st.me === 0 ? x1 : st.me === 1 ? x1 + dx / 2 : x2;
        const y = f(xs);
        sum += y * dx;
        const top = clamp(sy(Math.max(y, 0)), -10, 230);
        const bot = clamp(sy(Math.min(y, 0)), -10, 230);
        rects += `<rect class="ex-rect" x="${n1(Math.min(sx(x1), sx(x2)))}" y="${n1(top)}" width="${n1(Math.abs(sx(x2) - sx(x1)))}" height="${n1(bot - top)}"/>`;
      }
    }
    return {
      svg: `${G.svg}${shade}${rects}${curve}${ab}${head}${T(312, 16, `Σ = ${fmt(sum, 3)}`, 'm11 ex-end h')}${T(312, 32, `${nl} = ${fmt(exact, 3)}`, 'm11 tc exc-p ex-end h')}${T(312, 48, `${u('error', 'ошибка', 'қате')} ${fmt(Math.abs(exact - sum), 3)}`, 'm10 exm-mut ex-end h')}`,
      caption: J(
        L(`${n} ${tx(METH[st.me], 'en')} ${st.me === 3 ? '' : 'rectangles '}of width Δx = (b − a)/n = ${fmt(dx, 3)} give ${fmt(sum, 3)}; the exact integral is F(b) − F(a) = ${fmt(exact, 3)}. More pieces - smaller error.`, `${n} ${tx(METH[st.me], 'ru')}${st.me === 3 ? '' : ' прямоугольники'} шириной Δx = (b − a)/n = ${fmt(dx, 3)} дают ${fmt(sum, 3)}; точный интеграл F(b) − F(a) = ${fmt(exact, 3)}. Больше кусочков - меньше ошибка.`, `Ені Δx = (b − a)/n = ${fmt(dx, 3)} болатын ${n} ${tx(METH[st.me], 'kk')}${st.me === 3 ? '' : ' тіктөртбұрыш'} ${fmt(sum, 3)} береді; нақты интеграл F(b) − F(a) = ${fmt(exact, 3)}. Бөлік көп - қате аз.`),
        lo < hi && (f(lo) < 0 || f(hi) < 0 || f((lo + hi) / 2) < 0) ? L('Area below the axis counts with a minus (red).', 'Площадь под осью идёт со знаком минус (красная).', 'Осьтен төменгі аудан минус таңбамен алынады (қызыл).') : null,
        a > b ? L('a > b: the integral changes sign.', 'a > b: интеграл меняет знак.', 'a > b: интеграл таңбасын өзгертеді.') : null,
      ),
    };
  },
});

// ---------- Комплексные числа ----------

const zStr = (a, b) => {
  if (Math.abs(b) < 1e-9) return fmt(a);
  const bi = Math.abs(Math.abs(b) - 1) < 1e-9 ? 'i' : `${fmt(Math.abs(b))}i`;
  if (Math.abs(a) < 1e-9) return `${b < 0 ? '−' : ''}${bi}`;
  return `${fmt(a)} ${b < 0 ? '−' : '+'} ${bi}`;
};
const argD = (a, b) => (Math.atan2(b, a) * 180) / Math.PI;

function cxTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [re, im] = pick([[3, 4], [-3, 4], [4, -3], [0, 5], [-4, -3]]);
    t = { re, mod: 5, im, tag: `|z| = 5, Re z = ${fmt(re)}` };
  } else if (type === 1) {
    const re = rnd(-3, 3);
    const im = pick([-3, -2, -1, 1, 2, 3]);
    t = { re, im: -im, tag: `z = ${zStr(re, im)} → z̄`, from: [re, im] };
  } else {
    const re = rnd(-3, 3);
    const im = rnd(-3, 3) || 1;
    t = { re, im, tag: `z · i = ${zStr(-im, re)}` };
  }
  st.task = { type, done: false, ...t };
  return { a: 0, b: 0 };
}

const complex = modes({
  title: L('Complex numbers on the plane', 'Комплексные числа на плоскости', 'Жазықтықтағы комплекс сандар'),
  intro: L('z = a + bi is a point (a; b). Adding works like vectors; multiplying multiplies the lengths and adds the angles.', 'z = a + bi - точка (a; b). Сложение - как у векторов; при умножении длины перемножаются, а углы складываются.', 'z = a + bi - (a; b) нүктесі. Қосу векторлардағыдай; көбейткенде ұзындықтар көбейтіледі, бұрыштар қосылады.'),
  sliders: [
    { id: 'a', label: 'Re z = a', min: -4, max: 4, step: 0.5, value: 3 },
    { id: 'b', label: 'Im z = b', min: -4, max: 4, step: 0.5, value: 2 },
  ],
  values: { c: 1, d: 2 },
  tabs: [L('z and |z|', 'z и |z|', 'z және |z|'), 'z + w', 'z · w', TASK],
  acts: [{ label: '× i', only: [0] }, { label: L('conjugate', 'сопряжённое', 'түйіндес'), only: [0] }, { label: MORE, only: [1, 2, 3] }],
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return cxTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { a: clamp(-v.b, -4, 4), b: clamp(v.a, -4, 4) };
    if (j === 1) return { b: -v.b };
    if (st.m === 3) return cxTask(st);
    return { c: pick([1, -1, 2, 0, 1.5]), d: pick([1, 2, -1, 1.5, -2]) };
  },
  onDrag(key, p, v, st) {
    const R = st.m === 2 ? Math.max(5, Math.hypot(v.a, v.b) * Math.hypot(v.c, v.d) * 1.1) : 5;
    const sc = 100 / R;
    v.c = clamp(Math.round(((p.x - 160) / sc) * 2) / 2, -4, 4);
    v.d = clamp(Math.round(((110 - p.y) / sc) * 2) / 2, -4, 4);
  },
  draw(v, step, st) {
    const { a, b, c, d } = v;
    const mod = Math.hypot(a, b);
    const ph = argD(a, b);
    if (st.m === 1 || st.m === 2) {
      const mult = st.m === 2;
      const pa = mult ? a * c - b * d : a + c;
      const pb = mult ? a * d + b * c : b + d;
      const R = Math.max(5, Math.hypot(pa, pb) * 1.1, mod * 1.1);
      const sc = 100 / R;
      const sx = (x) => 160 + x * sc;
      const sy = (y) => 110 - y * sc;
      const step2 = R > 20 ? 5 : R > 10 ? 2 : 1;
      const G = grid({ x0: -1.6 * R, x1: 1.6 * R, y0: -1.1 * R, y1: 1.1 * R, step: step2, lab: step2 * 2 }).svg;
      const O = [sx(0), sy(0)];
      const Z = [sx(a), sy(b)];
      const Wp = [sx(c), sy(d)];
      const P = [sx(pa), sy(pb)];
      const arcs = mult && mod && Math.hypot(c, d) ? `${pth(arcD(O[0], O[1], 16, 0, ph), 'exc-p', 2)}${pth(arcD(O[0], O[1], 24, 0, argD(c, d)), 'exc-b', 2)}${pth(arcD(O[0], O[1], 32, 0, argD(pa, pb)), 'exc-o', 2)}` : '';
      return {
        svg: `${G}${T(312, sy(0) - 5, 'Re', 'm9 exm-mut ex-end')}${T(sx(0) + 5, 12, 'Im', 'm9 exm-mut ex-start')}${arcs}${mult ? '' : `${arrow(Z[0], Z[1], P[0], P[1], 'exc-b ex-faint', 2)}`}${arrow(O[0], O[1], Z[0], Z[1], 'exc-p')}${arrow(O[0], O[1], Wp[0], Wp[1], 'exc-b')}${arrow(O[0], O[1], P[0], P[1], 'exc-o', 3)}${hit('w', Wp[0], Wp[1], 14)}${dot(Wp[0], Wp[1], 4, 'exc-b')}
          ${T(8, 16, `z = ${zStr(a, b)}`, 'm11 tc exc-p ex-start h')}${T(8, 32, `w = ${zStr(c, d)}`, 'm11 tc exc-b ex-start h')}${T(8, 48, `z ${mult ? '·' : '+'} w = ${zStr(pa, pb)}`, 'm11 tc exc-o ex-start h')}${T(Wp[0] + 6, Wp[1] - 6, 'w', 'm11 tc exc-b ex-start h')}`,
        caption: mult
          ? L(
              `(${zStr(a, b)})(${zStr(c, d)}) = ${fmt(a)}·${pn(c)} − ${pn(b)}·${pn(d)} + (${fmt(a)}·${pn(d)} + ${pn(b)}·${pn(c)})i = ${zStr(pa, pb)}. Lengths multiply: ${fmt(mod)}·${fmt(Math.hypot(c, d))} = ${fmt(Math.hypot(pa, pb))}; angles add: ${fmt(ph, 0)}° + ${fmt(argD(c, d), 0)}° = ${fmt(argD(pa, pb), 0)}° (mod 360°). Drag w.`,
              `(${zStr(a, b)})(${zStr(c, d)}) = ${fmt(a)}·${pn(c)} − ${pn(b)}·${pn(d)} + (${fmt(a)}·${pn(d)} + ${pn(b)}·${pn(c)})i = ${zStr(pa, pb)}, ведь i² = −1. Длины перемножаются: ${fmt(mod)}·${fmt(Math.hypot(c, d))} = ${fmt(Math.hypot(pa, pb))}; углы складываются: ${fmt(ph, 0)}° + ${fmt(argD(c, d), 0)}° = ${fmt(argD(pa, pb), 0)}° (с точностью до 360°). Перетаскивай w.`,
              `(${zStr(a, b)})(${zStr(c, d)}) = ${fmt(a)}·${pn(c)} − ${pn(b)}·${pn(d)} + (${fmt(a)}·${pn(d)} + ${pn(b)}·${pn(c)})i = ${zStr(pa, pb)}, өйткені i² = −1. Ұзындықтар көбейеді: ${fmt(mod)}·${fmt(Math.hypot(c, d))} = ${fmt(Math.hypot(pa, pb))}; бұрыштар қосылады: ${fmt(ph, 0)}° + ${fmt(argD(c, d), 0)}° = ${fmt(argD(pa, pb), 0)}° (360°-қа дейінгі дәлдікпен). w-ны сүйре.`,
            )
          : L(`Add real parts and imaginary parts: (${fmt(a)} + ${pn(c)}) + (${fmt(b)} + ${pn(d)})i = ${zStr(pa, pb)} - like adding vectors. Drag w.`, `Складываем отдельно действительные и мнимые части: (${fmt(a)} + ${pn(c)}) + (${fmt(b)} + ${pn(d)})i = ${zStr(pa, pb)} - как сложение векторов. Перетаскивай w.`, `Нақты және жорамал бөліктерді бөлек қосамыз: (${fmt(a)} + ${pn(c)}) + (${fmt(b)} + ${pn(d)})i = ${zStr(pa, pb)} - векторларды қосу сияқты. w-ны сүйре.`),
      };
    }
    const G = grid({ x0: -8, x1: 8, y0: -5.5, y1: 5.5, lab: 2, ylab: 2 }).svg;
    const sx = (x) => 160 + x * 20;
    const sy = (y) => 110 - y * 20;
    const Z = [sx(a), sy(b)];
    const base = `${G}${T(312, sy(0) - 5, 'Re', 'm9 exm-mut ex-end')}${T(sx(0) + 5, 12, 'Im', 'm9 exm-mut ex-start')}${st.m === 3 ? '' : `${dot(sx(a), sy(-b), 3.5, 'exc-m')}${ln(Z[0], Z[1], sx(a), sy(-b), 'exc-m ex-dash', 1)}${T(sx(a) + 6, sy(-b) + 12, 'z̄', 'm10 exm-mut ex-start h')}`}${ln(Z[0], Z[1], Z[0], sy(0), 'exc-k ex-dash', 1.2)}${ln(sx(0), sy(0), Z[0], sy(0), 'exc-g', 3)}${mod ? pth(arcD(sx(0), sy(0), 18, 0, ph), 'exc-o', 2) : ''}${arrow(sx(0), sy(0), Z[0], Z[1], 'exc-p')}${dot(Z[0], Z[1], 4, 'exc-p')}`;
    const tf = `${fmt(mod)}(cos ${fmt(ph, 0)}° + i·sin ${fmt(ph, 0)}°)`;
    if (st.m === 3) {
      const tk = st.task ?? (cxTask(st), st.task);
      const ok = check(st, tk.type === 0 ? near(mod, 5, 1e-6) && near(a, tk.re, 1e-6) : near(a, tk.re, 1e-6) && near(b, tk.im, 1e-6));
      const ask = [
        L(`Find z with |z| = 5 and Re z = ${fmt(tk.re)}.`, `Найди z, у которого |z| = 5 и Re z = ${fmt(tk.re)}.`, `|z| = 5 және Re z = ${fmt(tk.re)} болатын z тап.`),
        L(`Set the conjugate of ${zStr(tk.from?.[0] ?? 0, tk.from?.[1] ?? 0)}.`, `Поставь число, сопряжённое к ${zStr(tk.from?.[0] ?? 0, tk.from?.[1] ?? 0)}.`, `${zStr(tk.from?.[0] ?? 0, tk.from?.[1] ?? 0)} санына түйіндес санды қой.`),
        L(`Find z: z · i = ${zStr(-tk.im, tk.re)}.`, `Найди z: z · i = ${zStr(-tk.im, tk.re)}.`, `z-ті тап: z · i = ${zStr(-tk.im, tk.re)}.`),
      ][tk.type];
      const hint = [
        L(`Now |z| = ${fmt(mod)}. Hint: a² + b² = 25.`, `Сейчас |z| = ${fmt(mod)}. Подсказка: a² + b² = 25.`, `Қазір |z| = ${fmt(mod)}. Кеңес: a² + b² = 25.`),
        L('Hint: the conjugate keeps a and changes the sign of b - a mirror in the Re axis.', 'Подсказка: у сопряжённого то же a, а знак b противоположный - отражение относительно оси Re.', 'Кеңес: түйіндесте a сол, b-ның таңбасы қарама-қарсы - Re осіне қатысты бейне.'),
        L(`Now z · i = ${zStr(-b, a)}. Hint: × i turns by 90°, so turn back by 90°.`, `Сейчас z · i = ${zStr(-b, a)}. Подсказка: × i поворачивает на 90°, значит поверни обратно на 90°.`, `Қазір z · i = ${zStr(-b, a)}. Кеңес: × i 90°-қа бұрады, демек кері 90°-қа бұр.`),
      ][tk.type];
      return { svg: `${base}${T(8, 16, `z = ${zStr(a, b)}`, 'm12 tc exc-p ex-start h')}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    return {
      svg: `${base}${T(8, 16, `z = ${zStr(a, b)}`, 'm12 tc exc-p ex-start h')}${T(8, 34, `|z| = √(${pn(a)}² + ${pn(b)}²) = ${fmt(mod)}`, 'm11 ex-start h')}${T(8, 52, `arg z = ${fmt(ph, 1)}°`, 'm11 tc exc-o ex-start h')}${mod ? T(8, 212, `z = ${tf}`, 'm10 ex-start h') : ''}`,
      caption: J(
        L(`z = ${zStr(a, b)} is the point (${fmt(a)}; ${fmt(b)}): real part on Re (green), imaginary on Im. |z| = ${fmt(mod)}, the angle arg z = ${fmt(ph, 1)}°.`, `z = ${zStr(a, b)} - точка (${fmt(a)}; ${fmt(b)}): действительная часть по оси Re (зелёная), мнимая - по Im. |z| = ${fmt(mod)}, угол arg z = ${fmt(ph, 1)}°.`, `z = ${zStr(a, b)} - (${fmt(a)}; ${fmt(b)}) нүктесі: нақты бөлігі Re осі бойынша (жасыл), жорамал - Im бойынша. |z| = ${fmt(mod)}, arg z = ${fmt(ph, 1)}°.`),
        L('"× i" turns z by 90°; i² = −1 means two turns = 180°. The grey point is the conjugate z̄.', '«× i» поворачивает z на 90°; i² = −1 - два поворота дают 180°. Серая точка - сопряжённое z̄.', '«× i» z-ті 90°-қа бұрады; i² = −1 - екі бұрылыс 180° береді. Сұр нүкте - түйіндес z̄.'),
      ),
    };
  },
});

// ---------- Предел ----------

const SEQS = [
  { a: (n) => 1 / n, L: 0, s: '1/n', y0: -0.2, y1: 1.1 },
  { a: (n) => (n + 1) / n, L: 1, s: '(n + 1)/n', y0: 0.8, y1: 2.1 },
  { a: (n) => (1 + 1 / n) ** n, L: Math.E, s: '(1 + 1/n)ⁿ', y0: 1.9, y1: 2.9 },
  { a: (n) => (-1) ** n / n, L: 0, s: '(−1)ⁿ/n', y0: -1.1, y1: 0.7 },
  { a: (n) => (2 * n + 1) / (n + 3), L: 2, s: '(2n + 1)/(n + 3)', y0: 0.6, y1: 2.2 },
  { a: (n) => (-1) ** n, L: null, s: '(−1)ⁿ', y0: -1.4, y1: 1.4 },
];
const FUNL = [
  { f: (x) => (x * x - 1) / (x - 1), p: 1, L: 2, s: '(x² − 1)/(x − 1)', x0: -1, x1: 3, y0: -0.5, y1: 4.5 },
  { f: (x) => Math.sin(x) / x, p: 0, L: 1, s: 'sin x / x', x0: -6, x1: 6, y0: -0.4, y1: 1.3 },
  { f: (x) => (Math.sqrt(x + 1) - 1) / x, p: 0, L: 0.5, s: '(√(x + 1) − 1)/x', x0: -0.9, x1: 3, y0: 0, y1: 1.2 },
  { f: (x) => Math.abs(x) / x, p: 0, L: null, s: '|x| / x', x0: -2, x1: 2, y0: -1.6, y1: 1.6 },
];
/** Номер, начиная с которого все члены в полосе L ± eps (проверяем до 5000). */
function bandN(S, eps) {
  let last = 0;
  for (let n = 1; n <= 5000; n++) if (Math.abs(S.a(n) - S.L) >= eps) last = n;
  return last + 1;
}

function limTask(st) {
  const opts = [[0, 0.1], [0, 0.05], [1, 0.2], [1, 0.04], [4, 0.5], [4, 0.25], [3, 0.1], [0, 0.2]];
  let i;
  do i = rnd(0, opts.length - 1);
  while (st.task && st.task.i === i);
  const [si, eps] = opts[i];
  st.task = { i, si, eps, N: bandN(SEQS[si], eps), done: false };
  st.si = si;
  return { n: 1, eps };
}

const limit = modes({
  title: L('Limits', 'Пределы', 'Шектер'),
  intro: L('L is the limit if the values get as close to L as you like: for any band L ± ε, from some point on all values stay inside.', 'L - предел, если значения подходят к L сколь угодно близко: для любой полосы L ± ε с какого-то места все значения остаются внутри.', 'Мәндер L-ге қалағанша жақындаса, L - шек: кез келген L ± ε жолағы үшін бір орыннан бастап барлық мәндер ішінде қалады.'),
  sliders: [
    { id: 'n', label: 'n', min: 1, max: 100, value: 20 },
    { id: 'eps', label: 'ε', min: 0.02, max: 0.5, step: 0.01, value: 0.2, hidden: (v, st) => st.m === 1 },
  ],
  tabs: [L('Sequence', 'Последовательность', 'Тізбек'), L('Function', 'Функция', 'Функция'), TASK],
  acts: [{ label: L('Example ↻', 'Пример ↻', 'Мысал ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ si: 0, fi: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return limTask(st);
    if (m === 2) st.si = st.task.si;
    return null;
  },
  onAct(j, st) {
    if (j === 1) return limTask(st);
    if (st.m === 0) st.si = (st.si + 1) % SEQS.length;
    else st.fi = (st.fi + 1) % FUNL.length;
    return null;
  },
  draw(v, step, st) {
    const n = Math.round(v.n);
    if (st.m === 1) {
      const F = FUNL[st.fi];
      const G = grid({ x0: F.x0, x1: F.x1, y0: F.y0, y1: F.y1, lab: F.x1 > 4 ? 2 : 1, ylab: F.y1 > 2 ? 1 : 0.5, step: F.x1 > 4 ? 1 : 0.5, ystep: F.y1 > 2 ? 1 : 0.25 });
      const { sx, sy } = G;
      const h = (F.x1 - F.x0) / 4 / n;
      const xl = F.p - h;
      const xr = F.p + h;
      const yl = F.f(xl);
      const yr = F.f(xr);
      const curveL = pth(plotClip(F.f, F.x0, F.p - 1e-6, sx, sy, -5, H + 5), 'exc-p', 3);
      const curveR = pth(plotClip(F.f, F.p + 1e-6, F.x1, sx, sy, -5, H + 5), 'exc-p', 3);
      const hole = F.L !== null ? ring(sx(F.p), sy(F.L), 5, 'exc-p', 2.5) : `${ring(sx(F.p), sy(F.f(F.p - 1e-6)), 5, 'exc-p', 2.5)}${ring(sx(F.p), sy(F.f(F.p + 1e-6)), 5, 'exc-p', 2.5)}`;
      return {
        svg: `${G.svg}${curveL}${curveR}${hole}${ln(sx(xl), sy(0), sx(xl), sy(yl), 'exc-o ex-dash', 1)}${ln(sx(xr), sy(0), sx(xr), sy(yr), 'exc-b ex-dash', 1)}${dot(sx(xl), sy(yl), 5, 'exc-o')}${dot(sx(xr), sy(yr), 5, 'exc-b')}
          ${T(8, 16, `f(x) = ${F.s}`, 'm11 ex-start h')}${T(312, 16, `f(${fmt(xl, 3)}) = ${fmt(yl, 4)}`, 'm10 tc exc-o ex-end h')}${T(312, 32, `f(${fmt(xr, 3)}) = ${fmt(yr, 4)}`, 'm10 tc exc-b ex-end h')}${F.L !== null ? T(312, 48, `lim = ${fmt(F.L)}`, 'm12 tc exc-p ex-end h') : ''}`,
        caption: F.L !== null
          ? L(`x → ${F.p}: the points x = ${fmt(xl, 3)} and ${fmt(xr, 3)} come from both sides (move n), and f(x) gets close to ${fmt(F.L)}. At x = ${F.p} itself f is not defined (empty circle), but the limit exists: ${fmt(F.L)}.${st.fi === 0 ? ' Indeed (x² − 1)/(x − 1) = x + 1 for x ≠ 1.' : ''}`, `x → ${F.p}: точки x = ${fmt(xl, 3)} и ${fmt(xr, 3)} подходят с обеих сторон (двигай n), а f(x) приближается к ${fmt(F.L)}. В самой точке x = ${F.p} функция не определена (пустой кружок), но предел есть: ${fmt(F.L)}.${st.fi === 0 ? ' Ведь (x² − 1)/(x − 1) = x + 1 при x ≠ 1.' : ''}`, `x → ${F.p}: x = ${fmt(xl, 3)} және ${fmt(xr, 3)} нүктелері екі жақтан жақындайды (n-ді жылжыт), ал f(x) ${fmt(F.L)}-ге жақындайды. x = ${F.p} нүктесінің өзінде функция анықталмаған (бос дөңгелек), бірақ шегі бар: ${fmt(F.L)}.${st.fi === 0 ? ' Себебі x ≠ 1 болғанда (x² − 1)/(x − 1) = x + 1.' : ''}`)
          : L(`From the left f → −1, from the right f → 1. The one-sided limits differ, so there is no limit at 0.`, `Слева f → −1, справа f → 1. Односторонние пределы разные, поэтому предела в точке 0 нет.`, `Сол жақтан f → −1, оң жақтан f → 1. Бір жақты шектер әртүрлі, сондықтан 0 нүктесінде шек жоқ.`),
      };
    }
    const tk = st.m === 2 ? (st.task ?? (limTask(st), st.task)) : null;
    const S = SEQS[tk ? tk.si : st.si];
    const eps = tk ? tk.eps : v.eps;
    const M = Math.max(10, n);
    const G = grid({ x0: 0, x1: M * 1.04, y0: S.y0, y1: S.y1, X0: 22, X1: 314, Y0: 6, Y1: 210, step: M > 50 ? 10 : M > 20 ? 5 : 1, lab: M > 50 ? 20 : M > 20 ? 10 : 2, ystep: 0.1, ylab: S.y1 - S.y0 > 1.5 ? 0.5 : 0.2 });
    const { sx, sy } = G;
    const Nb = S.L !== null ? bandN(S, eps) : Infinity;
    let dots = '';
    for (let i = 1; i <= n; i++) {
      const y = S.a(i);
      const inb = S.L !== null && Math.abs(y - S.L) < eps;
      dots += `<circle class="ex-fill ${inb ? 'exc-g' : 'exc-r'}" cx="${n1(sx(i))}" cy="${n1(clamp(sy(y), 0, H))}" r="${n > 60 ? 1.8 : n > 30 ? 2.4 : 3.2}"/>`;
    }
    const band = S.L !== null ? `${soft(22, sy(S.L + eps), 292, sy(S.L - eps) - sy(S.L + eps), 'exc-g', 0)}${ln(22, sy(S.L), 314, sy(S.L), 'exc-o ex-dash', 1.5)}${T(312, sy(S.L) - 4, `L = ${fmt(S.L, 3)}`, 'm10 tc exc-o ex-end h')}${Nb <= M ? `${ln(sx(Nb), 6, sx(Nb), 210, 'exc-p ex-dash', 1.2)}${T(sx(Nb) + 3, 20, `N = ${Nb}`, 'm10 tc exc-p ex-start h')}` : ''}` : '';
    const val = S.a(n);
    const head = `${T(30, 18, `aₙ = ${S.s}`, 'm11 ex-start h')}${T(30, 34, `a${sub(n)} = ${fmt(val, 4)}`, 'm10 ex-start h')}`;
    if (tk) {
      const ok = check(st, n === tk.N);
      return {
        svg: `${G.svg}${band.replace(/N = \d+/, 'N = ?').replace(/<line[^>]*exc-p ex-dash[^>]*>/, '')}${dots}${head}${badge(`ε = ${fmt(eps)}: N = ?`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`aₙ = ${S.s}, ε = ${fmt(eps)}. Find the smallest N from which all terms are inside the band L ± ε. Set n = N.`, `aₙ = ${S.s}, ε = ${fmt(eps)}. Найди наименьший N, начиная с которого все члены внутри полосы L ± ε. Поставь n = N.`, `aₙ = ${S.s}, ε = ${fmt(eps)}. Барлық мүшелер L ± ε жолағында болатын ең кіші N-ді тап. n = N қой.`),
          L(`Now n = ${n}: |a${sub(n)} − L| = ${fmt(Math.abs(val - S.L), 4)} ${Math.abs(val - S.L) < eps ? '<' : '≥'} ε. Solve |aₙ − L| < ε.`, `Сейчас n = ${n}: |a${sub(n)} − L| = ${fmt(Math.abs(val - S.L), 4)} ${Math.abs(val - S.L) < eps ? '<' : '≥'} ε. Реши |aₙ − L| < ε.`, `Қазір n = ${n}: |a${sub(n)} − L| = ${fmt(Math.abs(val - S.L), 4)} ${Math.abs(val - S.L) < eps ? '<' : '≥'} ε. |aₙ − L| < ε шеш.`),
        ),
      };
    }
    return {
      svg: `${G.svg}${band}${dots}${head}`,
      caption: S.L === null
        ? L('(−1)ⁿ jumps between −1 and 1 forever: no band around a single number catches all terms - there is no limit.', '(−1)ⁿ вечно прыгает между −1 и 1: ни одна узкая полоса вокруг одного числа не поймает все члены - предела нет.', '(−1)ⁿ −1 мен 1 арасында мәңгі секіреді: бір санның айналасындағы ешбір тар жолақ барлық мүшені ұстамайды - шек жоқ.')
        : L(
            `a${sub(n)} = ${fmt(val, 4)}, distance to L = ${fmt(S.L, 3)} is ${fmt(Math.abs(val - S.L), 4)}. For ε = ${fmt(eps)} all terms from N = ${Nb} on are inside the green band. Make ε smaller - N grows, but it always exists: that is the limit.`,
            `a${sub(n)} = ${fmt(val, 4)}, до L = ${fmt(S.L, 3)} осталось ${fmt(Math.abs(val - S.L), 4)}. Для ε = ${fmt(eps)} все члены, начиная с N = ${Nb}, в зелёной полосе. Уменьши ε - N вырастет, но он всегда найдётся: это и есть предел.`,
            `a${sub(n)} = ${fmt(val, 4)}, L = ${fmt(S.L, 3)}-ге дейін ${fmt(Math.abs(val - S.L), 4)} қалды. ε = ${fmt(eps)} үшін N = ${Nb}-ден бастап барлық мүшелер жасыл жолақта. ε-ны кішірейт - N өседі, бірақ ол әрқашан табылады: бұл шек.`,
          ),
    };
  },
});

// ---------- Матрицы ----------

const MX_PRE = [
  { a: 1, b: 0, c: 0, d: 1 },
  { a: 0, b: -1, c: 1, d: 0 },
  { a: -1, b: 0, c: 0, d: 1 },
  { a: 1, b: 1, c: 0, d: 1 },
  { a: 2, b: 0, c: 0, d: 0.5 },
  { a: 1, b: 2, c: 0.5, d: 1 },
];
const MX_TASKS = [
  { M: { a: 0, b: -1, c: 1, d: 0 }, t: L('Rotate the plane by 90° counterclockwise.', 'Поверни плоскость на 90° против часовой стрелки.', 'Жазықтықты сағат тіліне қарсы 90°-қа бұр.') },
  { M: { a: -1, b: 0, c: 0, d: 1 }, t: L('Mirror the plane in the y-axis.', 'Отрази плоскость относительно оси y.', 'Жазықтықты y осіне қатысты шағылыстыр.') },
  { M: { a: 2, b: 0, c: 0, d: 2 }, t: L('Stretch everything 2 times from the origin.', 'Растяни всё в 2 раза от начала координат.', 'Бәрін координаттар басынан 2 есе соз.') },
  { M: { a: 1, b: 0, c: 0, d: -1 }, t: L('Mirror the plane in the x-axis.', 'Отрази плоскость относительно оси x.', 'Жазықтықты x осіне қатысты шағылыстыр.') },
  { det: 0, t: L('Make a matrix with det = 0, but not all zeros.', 'Сделай матрицу с det = 0, но не нулевую.', 'det = 0, бірақ нөлдік емес матрица жаса.') },
  { det: -2, t: L('Make a matrix with det = −2.', 'Сделай матрицу с det = −2.', 'det = −2 болатын матрица жаса.') },
];
function mxTask(st) {
  let i;
  do i = rnd(0, MX_TASKS.length - 1);
  while (st.task && st.task.i === i);
  st.task = { i, ...MX_TASKS[i], done: false };
  return { a: 1, b: 0, c: 0, d: 1 };
}
const mxStr = (v) => `(${fmt(v.a)} ${fmt(v.b)} | ${fmt(v.c)} ${fmt(v.d)})`;

const matrix = modes({
  title: L('A matrix transforms the plane', 'Матрица преобразует плоскость', 'Матрица жазықтықты түрлендіреді'),
  intro: L('A 2×2 matrix sends (1; 0) to its first column and (0; 1) to its second. The whole grid follows; the area changes det times.', 'Матрица 2×2 переводит (1; 0) в свой первый столбец, а (0; 1) - во второй. Вся сетка следует за ними; площадь меняется в det раз.', '2×2 матрица (1; 0)-ді бірінші бағанына, (0; 1)-ді екіншісіне апарады. Бүкіл тор соларға ереді; аудан det есе өзгереді.'),
  sliders: [
    { id: 'a', label: 'a', min: -2, max: 2, step: 0.5, value: 1.5 },
    { id: 'b', label: 'b', min: -2, max: 2, step: 0.5, value: 0.5 },
    { id: 'c', label: 'c', min: -2, max: 2, step: 0.5, value: 0 },
    { id: 'd', label: 'd', min: -2, max: 2, step: 0.5, value: 1 },
  ],
  values: { vx: 1, vy: 1 },
  tabs: [L('Transform', 'Преобразование', 'Түрлендіру'), 'A · v', 'det', TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return mxTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return mxTask(st);
    st.pre = (st.pre + 1) % MX_PRE.length;
    return MX_PRE[st.pre];
  },
  onDrag(key, p, v) {
    v.vx = clamp(Math.round(((p.x - 160) / 30) * 2) / 2, -4, 4);
    v.vy = clamp(Math.round(((110 - p.y) / 30) * 2) / 2, -3, 3);
  },
  draw(v, step, st) {
    const { a, b, c, d } = v;
    const sx = (x) => 160 + x * 30;
    const sy = (y) => 110 - y * 30;
    const M = (x, y) => [a * x + b * y, c * x + d * y];
    const det = a * d - b * c;
    let g = grid({ x0: -5.4, x1: 5.4, y0: -3.7, y1: 3.7, labels: false }).svg;
    // образ сетки
    for (let k = -4; k <= 4; k++) {
      const p1 = M(k, -6);
      const p2 = M(k, 6);
      const q1 = M(-6, k);
      const q2 = M(6, k);
      g += ln(sx(p1[0]), sy(p1[1]), sx(p2[0]), sy(p2[1]), 'exc-p ex-faint', k ? 0.4 : 1) + ln(sx(q1[0]), sy(q1[1]), sx(q2[0]), sy(q2[1]), 'exc-p ex-faint', k ? 0.4 : 1);
    }
    const sq = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const img = sq.map(([x, y]) => M(x, y)).map(([x, y]) => [sx(x), sy(y)]);
    // буква F - видно отражение
    const Fp = [[0, 0], [0, 2], [1.2, 2], [1.2, 1.6], [0.4, 1.6], [0.4, 1.2], [1, 1.2], [1, 0.8], [0.4, 0.8], [0.4, 0]].map(([x, y]) => [x - 3.5, y - 1]);
    const F1 = Fp.map(([x, y]) => [sx(x), sy(y)]);
    const F2 = Fp.map(([x, y]) => M(x, y)).map(([x, y]) => [sx(x), sy(y)]);
    const cols = `${arrow(sx(0), sy(0), sx(a), sy(c), 'exc-o', 2.8)}${arrow(sx(0), sy(0), sx(b), sy(d), 'exc-b', 2.8)}`;
    const head = `${T(8, 18, `A = ${mxStr(v)}`, 'm11 ex-start h')}${T(8, 36, `det = ${fmt(a)}·${pn(d)} − ${pn(b)}·${pn(c)} = ${fmt(det)}`, 'm11 ex-start h')}`;
    if (st.m === 1) {
      const { vx, vy } = v;
      const [wx, wy] = M(vx, vy);
      return {
        svg: `${g}${poly(img, 'exc-p', 0.15)}${arrow(sx(0), sy(0), sx(vx * a), sy(vx * c), 'exc-o ex-faint', 2)}${arrow(sx(vx * a), sy(vx * c), sx(wx), sy(wy), 'exc-b ex-faint', 2)}${arrow(sx(0), sy(0), sx(vx), sy(vy), 'exc-g', 2.8)}${arrow(sx(0), sy(0), sx(wx), sy(wy), 'exc-k', 3)}${hit('v', sx(vx), sy(vy), 14)}${dot(sx(vx), sy(vy), 4, 'exc-g')}
          ${T(8, 18, `(${fmt(a)} ${fmt(b)}) (${fmt(vx)})   (${fmt(a)}·${pn(vx)} + ${fmt(b)}·${pn(vy)})   (${fmt(wx)})`, 'm10 ex-start h')}${T(8, 34, `(${fmt(c)} ${fmt(d)}) (${fmt(vy)}) = (${fmt(c)}·${pn(vx)} + ${fmt(d)}·${pn(vy)}) = (${fmt(wy)})`, 'm10 ex-start h')}${T(sx(vx) + 6, sy(vy) - 6, 'v', 'm11 tc exc-g ex-start h')}${T(sx(wx) + 6, sy(wy) - 6, 'Av', 'm11 tc exc-k ex-start h')}`,
        caption: L(
          `A·v: each row times the column (${fmt(vx)}; ${fmt(vy)}) gives (${fmt(wx)}; ${fmt(wy)}). In the picture: ${fmt(vx)} steps along the first column (orange) and ${fmt(vy)} along the second (blue) - you reach Av. Drag v.`,
          `A·v: каждая строка умножается на столбец (${fmt(vx)}; ${fmt(vy)}) - получаем (${fmt(wx)}; ${fmt(wy)}). На картинке: ${fmt(vx)} шага по первому столбцу (оранжевый) и ${fmt(vy)} по второму (синий) - приходим в Av. Перетаскивай v.`,
          `A·v: әр жол (${fmt(vx)}; ${fmt(vy)}) бағанына көбейтіледі - (${fmt(wx)}; ${fmt(wy)}) шығады. Суретте: бірінші баған бойымен (қызғылт сары) ${fmt(vx)} қадам және екіншісімен (көк) ${fmt(vy)} қадам - Av-ге жетеміз. v-ны сүйре.`,
        ),
      };
    }
    const base = `${g}${poly(F1, 'exc-m', 0.25)}${poly(F2, 'exc-g', 0.55)}${poly(img, det < 0 ? 'exc-r' : 'exc-p', 0.35)}${cols}${head}`;
    if (st.m === 2) {
      return {
        svg: `${base}${T(sx((a + b) / 2), sy((c + d) / 2) + 4, `S = ${fmt(Math.abs(det))}`, 'm11 h')}`,
        caption: Math.abs(det) < 1e-9
          ? L('det = 0: the square is squashed into a segment or a point - the area is 0 and the matrix has no inverse.', 'det = 0: квадрат сплющен в отрезок или точку - площадь 0, обратной матрицы нет.', 'det = 0: шаршы кесіндіге не нүктеге жаншылды - аудан 0, кері матрица жоқ.')
          : L(
              `The unit square (area 1) becomes a parallelogram with area |det| = |ad − bc| = ${fmt(Math.abs(det))}. ${det < 0 ? 'det < 0: the plane is flipped - look at the letter F (red square).' : 'det > 0: the orientation is kept.'}`,
              `Единичный квадрат (площадь 1) стал параллелограммом площадью |det| = |ad − bc| = ${fmt(Math.abs(det))}. ${det < 0 ? 'det < 0: плоскость перевернулась - посмотри на букву F (красный квадрат).' : 'det > 0: ориентация сохранилась.'}`,
              `Бірлік шаршы (ауданы 1) ауданы |det| = |ad − bc| = ${fmt(Math.abs(det))} параллелограмға айналды. ${det < 0 ? 'det < 0: жазықтық аударылды - F әрпіне қара (қызыл шаршы).' : 'det > 0: бағдар сақталды.'}`,
            ),
      };
    }
    if (st.m === 3) {
      const tk = st.task ?? (mxTask(st), st.task);
      const ok = check(st, tk.M ? ['a', 'b', 'c', 'd'].every((k) => near(v[k], tk.M[k], 1e-6)) : near(det, tk.det, 1e-6) && (a || b || c || d));
      return {
        svg: `${base}${badge(tk.M ? u('columns = images', 'столбцы = образы', 'бағандар = бейнелер') : `det = ${fmt(tk.det)}`, ok)}`,
        caption: taskCap(st, ok, tk.t, L('Hint: where must (1; 0) go (first column) and where (0; 1) (second column)?', 'Подсказка: куда должен перейти (1; 0) (первый столбец) и куда (0; 1) (второй столбец)?', 'Кеңес: (1; 0) қайда кетуі керек (бірінші баған) және (0; 1) қайда (екінші баған)?')),
      };
    }
    return {
      svg: base,
      caption: L(
        `Orange arrow = first column (${fmt(a)}; ${fmt(c)}) = image of (1; 0), blue = second column (${fmt(b)}; ${fmt(d)}) = image of (0; 1). The purple grid and the green letter F show where everything goes. Press "Another" for rotation, mirror, shear, stretch.`,
        `Оранжевая стрелка - первый столбец (${fmt(a)}; ${fmt(c)}) = образ (1; 0), синяя - второй (${fmt(b)}; ${fmt(d)}) = образ (0; 1). Фиолетовая сетка и зелёная буква F показывают, куда переходит всё остальное. «Ещё» - поворот, отражение, сдвиг, растяжение.`,
        `Қызғылт сары нұсқар - бірінші баған (${fmt(a)}; ${fmt(c)}) = (1; 0) бейнесі, көгі - екінші баған (${fmt(b)}; ${fmt(d)}) = (0; 1) бейнесі. Күлгін тор мен жасыл F әрпі қалғанының бәрі қайда кететінін көрсетеді. «Тағы» - бұру, шағылыстыру, ығысу, созу.`,
      ),
    };
  },
});