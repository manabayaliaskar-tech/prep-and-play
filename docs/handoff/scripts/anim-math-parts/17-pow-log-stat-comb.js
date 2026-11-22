// ---------- Степени и показательная функция ----------

/** Значение степени красиво: дробь, если знаменатель небольшой. */
const powStr = (x) => (Math.abs(x) > 1e6 ? fmt(x, 0) : nice(x, 100, 3));

function powTask(st) {
  const last = st.task?.type;
  const list = [
    [2, 5],
    [3, 4],
    [2, -3],
    [3, -2],
    [4, 0.5],
    [0.5, -3],
    [10, -2],
    [9, 0.5],
    [5, 0],
    [2, 6],
  ];
  let i;
  do i = rnd(0, list.length - 1);
  while (i === last);
  const [a, n] = list[i];
  st.task = { type: i, a, n, val: a ** n, done: false };
  return { a, n: 1 };
}

const exponential = modes({
  title: L('Powers and the exponential function', 'Степени и показательная функция', 'Дәрежелер және көрсеткіштік функция'),
  intro: L('aⁿ is a multiplied by itself n times. Negative and fractional exponents follow the same pattern: a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/2) = √a.', 'aⁿ - это a, умноженное само на себя n раз. Отрицательные и дробные показатели продолжают ту же закономерность: a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/2) = √a.', 'aⁿ - a-ның өзіне n рет көбейтіндісі. Теріс және бөлшек көрсеткіштер сол заңдылықты жалғастырады: a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/2) = √a.'),
  sliders: [
    { id: 'a', label: L('base a', 'основание a', 'негіз a'), min: 0.1, max: 4, step: 0.1, value: 2, hidden: (v, st) => st.m === 3 },
    { id: 'n', label: L('exponent n', 'показатель n', 'көрсеткіш n'), min: -4, max: 6, step: 0.5, value: 3 },
    { id: 'm', label: L('exponent m', 'показатель m', 'көрсеткіш m'), min: 0, max: 5, value: 2, hidden: only(2) },
  ],
  tabs: [L('Graph aˣ', 'График aˣ', 'aˣ графигі'), L('Ladder', 'Лестница', 'Баспалдақ'), L('Rules', 'Свойства', 'Қасиеттер'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return powTask(st);
    if (m === 1 || m === 2) return { n: clamp(Math.round(v.n), m === 2 ? 0 : -4, 6) };
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return powTask(st);
    st.pre = (st.pre + 1) % 5;
    return [{ a: 3, n: 2 }, { a: 0.5, n: 3 }, { a: 4, n: -1 }, { a: 2, n: 0.5 }, { a: 1, n: 4 }][st.pre];
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (powTask(st), st.task)) : null;
    const a = tk ? tk.a : Math.round(v.a * 10) / 10;
    const n = v.n;
    const val = a ** n;
    const aS = nice(a, 10);

    if (st.m === 1) {
      const N = Math.round(n);
      const ks = [-3, -2, -1, 0, 1, 2, 3, 4];
      const w = 37;
      let g = '';
      ks.forEach((k, i) => {
        const x = 12 + i * w;
        const on = k === N;
        g += `${box(x, 92, w - 6, 40, on ? 'exc-o' : k < 0 ? 'exc-b' : k === 0 ? 'exc-g' : 'exc-p', 6, on ? 0.95 : 0.25)}${T(x + w / 2 - 3, 108, `${aS}${sup(k)}`, `m10 ${on ? 'exm-on' : ''}`)}${T(x + w / 2 - 3, 125, powStr(a ** k), `m10 ${on ? 'exm-on' : ''}`)}`;
        if (i < ks.length - 1) g += pth(`M${n1(x + w / 2)} 88 Q${n1(x + w)} 70 ${n1(x + w * 1.5 - 6)} 88`, 'exc-g', 1.2) + T(x + w - 3, 74, `×${aS}`, 'm9 tc exc-g');
        if (i > 0) g += pth(`M${n1(x + w / 2 - 6)} 136 Q${n1(x)} 152 ${n1(x - w / 2)} 136`, 'exc-r', 1.2);
      });
      g += T(160, 164, `← : ${aS}`, 'm10 tc exc-r');
      const inv = N < 0 ? `${aS}${sup(N)} = 1/${aS}${sup(-N)} = 1/${powStr(a ** -N)}` : N === 0 ? `${aS}⁰ = 1` : `${aS}${sup(N)} = ${Array.from({ length: Math.min(N, 6) }, () => aS).join('·')} = ${powStr(a ** N)}`;
      return {
        svg: `${g}${T(160, 36, inv, 'm15')}${T(160, 200, a === 0 ? '' : u('each step to the left divides by a', 'каждый шаг влево делит на a', 'солға әр қадам a-ға бөледі'), 'm10 exm-mut')}`,
        caption: L(
          `To the right each step multiplies by ${aS}, to the left it divides by ${aS}. So ${aS}¹ : ${aS} = ${aS}⁰ = 1, and one more step gives ${aS}⁻¹ = 1/${aS}. That is why a⁰ = 1 and a⁻ⁿ = 1/aⁿ (a ≠ 0).`,
          `Вправо каждый шаг умножает на ${aS}, влево - делит на ${aS}. Значит ${aS}¹ : ${aS} = ${aS}⁰ = 1, а ещё шаг даёт ${aS}⁻¹ = 1/${aS}. Поэтому a⁰ = 1 и a⁻ⁿ = 1/aⁿ (a ≠ 0).`,
          `Оңға әр қадам ${aS}-ға көбейтеді, солға - ${aS}-ға бөледі. Демек ${aS}¹ : ${aS} = ${aS}⁰ = 1, тағы бір қадам ${aS}⁻¹ = 1/${aS} береді. Сондықтан a⁰ = 1 және a⁻ⁿ = 1/aⁿ (a ≠ 0).`,
        ),
      };
    }

    if (st.m === 2) {
      const N = Math.max(0, Math.round(n));
      const M = Math.round(v.m);
      const chain = (k, y, cls, x0 = 20) => Array.from({ length: k }, (_, i) => `${box(x0 + i * 26, y, 22, 22, cls, 5, 0.85)}${T(x0 + i * 26 + 11, y + 15, aS, 'm10 exm-on')}`).join('');
      const g = `${T(20, 30, `${aS}${sup(M)} · ${aS}${sup(N)}`, 'm12 ex-start')}${chain(M, 38, 'exc-o')}${chain(N, 38, 'exc-b', 20 + M * 26 + 8)}
        ${T(20, 86, `= ${aS}${sup(M + N)} = ${powStr(a ** (M + N))}`, 'm12 ex-start tc exc-p')}
        ${T(20, 120, `${aS}${sup(M)} : ${aS}${sup(N)} = ${aS}${sup(M - N)} = ${powStr(a ** (M - N))}`, 'm12 ex-start')}
        ${T(20, 148, `(${aS}${sup(M)})${sup(N)} = ${aS}${sup(M * N)} = ${powStr(a ** (M * N))}`, 'm12 ex-start')}
        ${T(20, 176, `(${aS}·b)${sup(N)} = ${aS}${sup(N)}·b${sup(N)}`, 'm11 ex-start exm-mut')}${T(20, 200, `${aS}^(1/2) = √${aS} = ${fmt(Math.sqrt(a))}`, 'm11 ex-start exm-mut')}`;
      return {
        svg: g,
        caption: L(
          `When multiplying, the factors just line up: ${M} + ${N} = ${M + N} copies of ${aS}, so exponents add. Dividing cancels ${Math.min(M, N)} pairs - exponents subtract. A power of a power multiplies the exponents: ${M}·${N} = ${M * N}.`,
          `При умножении множители просто встают в ряд: ${M} + ${N} = ${M + N} копий ${aS}, поэтому показатели складываются. При делении сокращаются ${Math.min(M, N)} пар - показатели вычитаются. Степень в степени - показатели перемножаются: ${M}·${N} = ${M * N}.`,
          `Көбейткенде көбейткіштер қатарға тұрады: ${aS}-ның ${M} + ${N} = ${M + N} көшірмесі, сондықтан көрсеткіштер қосылады. Бөлгенде ${Math.min(M, N)} жұп қысқарады - көрсеткіштер азаяды. Дәреженің дәрежесі - көрсеткіштер көбейтіледі: ${M}·${N} = ${M * N}.`,
        ),
      };
    }

    // график
    const G = grid({ x0: -4.5, x1: 6.5, y0: -1, y1: 9, X0: 0, X1: W, Y0: 0, Y1: H, lab: 1, ylab: 2 });
    const { sx, sy } = G;
    const curve = pth(plotClip((x) => a ** x, -4.5, 6.5, sx, sy, -5, H + 5), 'exc-p', 3);
    const ghost = a !== 1 ? pth(plotClip((x) => (1 / a) ** x, -4.5, 6.5, sx, sy, -5, H + 5), 'exc-m ex-dash', 1.5) : '';
    const P = sy(val) >= 0 ? `${ln(sx(n), sy(0), sx(n), sy(val), 'exc-o ex-dash', 1.2)}${dot(sx(n), sy(val), 6, 'exc-o')}${T(sx(n) + 7, sy(val) - 6, `(${fmt(n)}; ${powStr(val)})`, 'm10 tc exc-o ex-start h')}` : '';
    const head = `${T(8, 18, `y = ${aS}ˣ`, 'm15 ex-start h')}${T(312, tk ? 40 : 18, `${aS}${sup(n)} = ${powStr(val)}`, 'm12 ex-end h')}${dot(sx(0), sy(1), 4.5, 'exc-g')}`;
    const half = Math.abs(n - Math.round(n)) > 0.01;
    if (tk) {
      const ok = check(st, near(n, tk.n, 0.01));
      return {
        svg: `${G.svg}${curve}${P}${head}${badge(`${nice(tk.a)}ⁿ = ${powStr(tk.val)}`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Find n: ${nice(tk.a)}ⁿ = ${powStr(tk.val)}.`, `Найди n: ${nice(tk.a)}ⁿ = ${powStr(tk.val)}.`, `n-ді тап: ${nice(tk.a)}ⁿ = ${powStr(tk.val)}.`),
          L(`Now ${aS}${sup(n)} = ${powStr(val)}. ${tk.val < 1 && tk.a > 1 ? 'A result smaller than 1 needs a negative exponent.' : tk.val === 1 ? 'Which power of any number is 1?' : Math.abs(tk.n % 1) > 0 ? 'Think of roots: a^(1/2) = √a.' : 'Count how many times to multiply.'}`, `Сейчас ${aS}${sup(n)} = ${powStr(val)}. ${tk.val < 1 && tk.a > 1 ? 'Чтобы получить меньше 1, нужен отрицательный показатель.' : tk.val === 1 ? 'В какой степени любое число равно 1?' : Math.abs(tk.n % 1) > 0 ? 'Вспомни корни: a^(1/2) = √a.' : 'Посчитай, сколько раз умножать.'}`, `Қазір ${aS}${sup(n)} = ${powStr(val)}. ${tk.val < 1 && tk.a > 1 ? '1-ден кіші шығу үшін теріс көрсеткіш керек.' : tk.val === 1 ? 'Кез келген сан қай дәрежеде 1-ге тең?' : Math.abs(tk.n % 1) > 0 ? 'Түбірлерді еске ал: a^(1/2) = √a.' : 'Неше рет көбейту керегін сана.'}`),
        ),
      };
    }
    return {
      svg: `${G.svg}${ln(0, sy(0), W, sy(0), 'exc-r ex-dash', 1)}${ghost}${curve}${P}${head}`,
      caption: J(
        a === 1
          ? L('a = 1: 1ˣ = 1 for every x - a straight line, so the base must be a ≠ 1.', 'a = 1: 1ˣ = 1 при любом x - прямая, поэтому основание a ≠ 1.', 'a = 1: кез келген x үшін 1ˣ = 1 - түзу, сондықтан негіз a ≠ 1.')
          : a > 1
            ? L(`a = ${aS} > 1: the function increases, every +1 to x multiplies y by ${aS}.`, `a = ${aS} > 1: функция возрастает, каждый +1 к x умножает y на ${aS}.`, `a = ${aS} > 1: функция өседі, x-ке әр +1 y-ті ${aS}-ға көбейтеді.`)
            : L(`0 < a = ${aS} < 1: the function decreases.`, `0 < a = ${aS} < 1: функция убывает.`, `0 < a = ${aS} < 1: функция кемиді.`),
        L(`Always through (0; 1) and above the x-axis (y > 0). ${aS}${sup(n)} = ${powStr(val)}${half ? ` - a half exponent is a root: ${aS}${sup(n)} = √(${aS}${sup(2 * n)})` : ''}. Dashed: y = (1/a)ˣ, the mirror image.`, `Всегда проходит через (0; 1) и лежит выше оси x (y > 0). ${aS}${sup(n)} = ${powStr(val)}${half ? ` - половинный показатель - это корень: ${aS}${sup(n)} = √(${aS}${sup(2 * n)})` : ''}. Пунктир - y = (1/a)ˣ, зеркальное отражение.`, `Әрқашан (0; 1) арқылы өтеді және x осінен жоғары жатады (y > 0). ${aS}${sup(n)} = ${powStr(val)}${half ? ` - жарты көрсеткіш - түбір: ${aS}${sup(n)} = √(${aS}${sup(2 * n)})` : ''}. Пунктир - y = (1/a)ˣ, айнадағы бейнесі.`),
      ),
    };
  },
});

// ---------- Логарифм ----------

const BASES = [2, 3, 10, 0.5];
const bStr = (b) => (b === 0.5 ? '½' : String(b));
const logb = (b, x) => Math.log(x) / Math.log(b);
const LOG_TASKS = [
  [2, 5, 32],
  [2, 3, 8],
  [3, 2, 9],
  [3, 4, 81],
  [10, 2, 100],
  [2, -1, 0.5],
  [2, -2, 0.25],
  [3, -2, 1 / 9],
  [10, -1, 0.1],
  [0.5, -3, 8],
  [2, 0, 1],
  [3, 0.5, Math.sqrt(3)],
];

function logTask(st) {
  const last = st.task?.i;
  let i;
  do i = rnd(0, LOG_TASKS.length - 1);
  while (i === last);
  const [b, k, x] = LOG_TASKS[i];
  st.task = { i, b, k, x, done: false };
  st.bi = BASES.indexOf(b);
  return { x: 1 };
}

const logarithm = modes({
  title: L('Logarithms', 'Логарифмы', 'Логарифмдер'),
  intro: L('log_b(x) is the power you raise b to in order to get x. It turns multiplication into addition.', 'log_b(x) - это показатель, в который надо возвести b, чтобы получить x. Логарифм превращает умножение в сложение.', 'log_b(x) - x шығу үшін b-ны шығаратын дәреже көрсеткіші. Логарифм көбейтуді қосуға айналдырады.'),
  sliders: [
    { id: 'x', label: 'x', min: 0.01, max: 100, step: 0.01, value: 8 },
    { id: 'y', label: 'y', min: 0.01, max: 100, step: 0.01, value: 4, hidden: only(1) },
  ],
  tabs: [L('Definition', 'Определение', 'Анықтама'), L('Product rule', 'Логарифм произведения', 'Көбейтінді логарифмі'), TASK],
  acts: [{ label: L('Base ↻', 'Основание ↻', 'Негіз ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ bi: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return logTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 1) return logTask(st);
    st.bi = (st.bi + 1) % BASES.length;
    return null;
  },
  draw(v, step, st) {
    const b = BASES[st.bi];
    const bs = bStr(b);
    const { x, y } = v;
    const lx = logb(b, x);
    const ly = logb(b, y);
    const L2 = (z) => (Math.abs(z - Math.round(z)) < 0.005 ? fmt(Math.round(z), 0) : fmt(z));

    if (st.m === 1) {
      const lo = Math.min(0, lx, ly, lx + ly) - 0.5;
      const hi = Math.max(1, lx, lx + ly) + 0.5;
      const sx = (t) => 16 + ((t - lo) / (hi - lo)) * 288;
      let g = `${ln(10, 120, 310, 120, 'exc-m', 1.5)}`;
      for (let k = Math.ceil(lo); k <= Math.floor(hi); k++) {
        g += ln(sx(k), 113, sx(k), 127, 'exc-m', 1.2) + T(sx(k), 140, powStr(b ** k), 'm9 exm-mut') + T(sx(k), 108, k, 'm9 tc exc-p');
        if (b > 1 && b <= 3) for (let mlt = 2; mlt < b; mlt++) g += ln(sx(k + logb(b, mlt)), 116, sx(k + logb(b, mlt)), 124, 'exc-m', 0.6);
      }
      g += `${box(sx(Math.min(0, lx)), 70, Math.abs(sx(lx) - sx(0)), 14, 'exc-o', 3, 0.9)}${box(sx(Math.min(lx, lx + ly)), 86, Math.abs(sx(lx + ly) - sx(lx)), 14, 'exc-b', 3, 0.9)}${ln(sx(lx + ly), 66, sx(lx + ly), 130, 'exc-p', 2)}${dot(sx(lx + ly), 120, 5, 'exc-p')}
        ${T(sx(lx / 2), 64, `log x = ${L2(lx)}`, 'm10 tc exc-o h')}${T(sx(lx + ly / 2), 158, `log y = ${L2(ly)}`, 'm10 tc exc-b h')}`;
      return {
        svg: `${g}${T(160, 26, `log${sub(bs)}(${fmt(x)}·${fmt(y)}) = ${L2(lx)} + ${L2(ly)} = ${L2(lx + ly)}`, 'm12')}${T(160, 46, `${fmt(x)}·${fmt(y)} = ${fmt(x * y)} = ${bs}${sup(Math.round((lx + ly) * 100) / 100)}`, 'm11 exm-mut')}
          ${T(160, 170, `log${sub(bs)}(x/y) = ${L2(lx)} − ${L2(ly)} = ${L2(lx - ly)}`, 'm11')}${T(160, 192, `log${sub(bs)}(x${sup(2)}) = 2·log${sub(bs)} x = ${L2(2 * lx)}`, 'm11 exm-mut')}${T(16, 156, u('top: exponent, bottom: number', 'сверху показатель, снизу число', 'үстінде дәреже, астында сан'), 'm9 exm-mut ex-start')}`,
        caption: L(
          `On a logarithmic ruler the distance from 1 is the log. Put log x (orange) and log y (blue) end to end: you land on x·y = ${fmt(x * y)}. So log(xy) = log x + log y - this is how slide rules multiplied.`,
          `На логарифмической линейке расстояние от 1 - это логарифм. Приставим log x (оранжевый) и log y (синий) друг к другу - попадём в x·y = ${fmt(x * y)}. Значит log(xy) = log x + log y - так умножали на логарифмической линейке.`,
          `Логарифмдік сызғышта 1-ден арақашықтық - логарифм. log x (қызғылт сары) пен log y (көк) кесінділерін жалғасақ, x·y = ${fmt(x * y)} нүктесіне түсеміз. Демек log(xy) = log x + log y - логарифмдік сызғыш осылай көбейтетін.`,
        ),
      };
    }

    const G = grid({ x0: -2, x1: 17, y0: -5, y1: 5.5, X0: 0, X1: W, Y0: 0, Y1: H, lab: 2, ylab: 1 });
    const { sx, sy } = G;
    const lg = pth(plotClip((t) => logb(b, t), 0.01, 17, sx, sy, -10, H + 10, 300), 'exc-p', 3);
    const pw = pth(plotClip((t) => b ** t, -2, 17, sx, sy, -10, H + 10, 200), 'exc-k', 1.6);
    const diag = ln(sx(-2), sy(-2), sx(5.5), sy(5.5), 'exc-m ex-dash', 1);
    const vis = x <= 17 && Math.abs(lx) < 5.5;
    const P = vis ? `${ln(sx(x), sy(0), sx(x), sy(lx), 'exc-o ex-dash', 1.2)}${ln(sx(0), sy(lx), sx(x), sy(lx), 'exc-o ex-dash', 1.2)}${dot(sx(x), sy(lx), 6, 'exc-o')}${Math.abs(lx) <= 5.5 && lx <= 17 ? dot(sx(lx), sy(x), 4, 'exc-k') : ''}` : '';
    const tY = st.m === 2 ? 22 : 0;
    const head = `${T(312, 18 + tY, `log${sub(bs)} ${fmt(x)} = ${L2(lx)}`, 'm12 ex-end h')}${T(312, 36 + tY, `${bs}${sup(Math.round(lx * 100) / 100)} = ${fmt(x)}`, 'm10 exm-mut ex-end h')}${T(42, 18, `y = log${sub(bs)} x`, 'm12 tc exc-p ex-start h')}${st.m === 2 ? '' : T(42, 36, `y = ${bs}ˣ`, 'm10 tc exc-k ex-start h')}`;
    if (st.m === 2) {
      const tk = st.task ?? (logTask(st), st.task);
      const ok = check(st, Math.abs(lx - tk.k) < 0.02);
      return {
        svg: `${G.svg}${diag}${lg}${P}${head}${badge(`log${sub(bStr(tk.b))} x = ${fmt(tk.k)}`, ok)}`,
        caption: taskCap(st, ok, L(`Find x: log${sub(bStr(tk.b))} x = ${fmt(tk.k)}.`, `Найди x: log${sub(bStr(tk.b))} x = ${fmt(tk.k)}.`, `x-ті тап: log${sub(bStr(tk.b))} x = ${fmt(tk.k)}.`), L(`Now log = ${fmt(lx)}. Hint: by definition x = ${bStr(tk.b)}^${fmt(tk.k)}.`, `Сейчас log = ${fmt(lx)}. Подсказка: по определению x = ${bStr(tk.b)}^${fmt(tk.k)}.`, `Қазір log = ${fmt(lx)}. Кеңес: анықтама бойынша x = ${bStr(tk.b)}^${fmt(tk.k)}.`)),
      };
    }
    return {
      svg: `${G.svg}${diag}${pw}${lg}${P}${head}`,
      caption: J(
        L(`log${sub(bs)} ${fmt(x)} = ${fmt(lx)}, because ${bs}^${fmt(lx)} ≈ ${fmt(x)}.`, `log${sub(bs)} ${fmt(x)} = ${fmt(lx)}, потому что ${bs}^${fmt(lx)} ≈ ${fmt(x)}.`, `log${sub(bs)} ${fmt(x)} = ${fmt(lx)}, себебі ${bs}^${fmt(lx)} ≈ ${fmt(x)}.`),
        Math.abs(x - 1) < 0.005 ? L('log of 1 is always 0.', 'Логарифм единицы всегда 0.', 'Бірдің логарифмі әрқашан 0.') : x < 1 === b > 1 ? L('Here the log is negative.', 'Здесь логарифм отрицательный.', 'Мұнда логарифм теріс.') : null,
        L('x must be > 0 - the graph never touches the y-axis. The pink y = bˣ is the mirror image in y = x.', 'x должен быть > 0 - график не касается оси y. Розовая y = bˣ - зеркальное отражение относительно y = x.', 'x > 0 болуы керек - график y осіне тимейді. Қызғылт y = bˣ - y = x түзуіне қатысты айнадағы бейнесі.'),
      ),
    };
  },
});
/** Нижний индекс основания: 2 → ₂, 10 → ₁₀, ½ → ½. */
function sub(s) {
  return String(s).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[c]);
}

// ---------- Среднее, медиана, мода ----------

const MM_X = (x) => 20 + x * 14;

function mmTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  const n = type === 1 ? pick([4, 6, 8]) : rnd(5, 8);
  const target = type === 0 ? rnd(4, 14) : type === 1 ? rnd(5, 13) + pick([0, 0.5]) : rnd(6, 16);
  st.task = { type, n, target, done: false };
  return { n };
}

const meanMedian = modes({
  title: L('Mean, median, mode', 'Среднее, медиана, мода', 'Орта мән, медиана, мода'),
  intro: L('Drag the dots. The mean is the balance point, the median is the middle value after sorting, the mode is the most frequent value.', 'Перетаскивай точки. Среднее - точка равновесия, медиана - середина упорядоченного ряда, мода - самое частое значение.', 'Нүктелерді сүйре. Орта мән - тепе-теңдік нүктесі, медиана - реттелген қатардың ортасы, мода - ең жиі мән.'),
  values: { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7, p6: 8.5, p7: 10, p8: 12 },
  sliders: [{ id: 'n', label: L('number of values', 'сколько значений', 'мәндер саны'), min: 3, max: 9, value: 7 }],
  tabs: [L('Mean & median', 'Среднее и медиана', 'Орта мән және медиана'), L('Mode & range', 'Мода и размах', 'Мода және құлаш'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return mmTask(st);
    if (m === 1) {
      const p = {};
      for (let i = 0; i < 9; i++) p[`p${i}`] = Math.round(v[`p${i}`]);
      return p;
    }
    return null;
  },
  onAct(j, st) {
    if (st.m === 2) return mmTask(st);
    st.pre = (st.pre + 1) % 4;
    if (st.pre === 1) return { p0: 3, p1: 4, p2: 4, p3: 5, p4: 5, p5: 5, p6: 19, n: 7 };
    if (st.pre === 2) return { p0: 2, p1: 6, p2: 7, p3: 9, p4: 12, p5: 15, n: 6 };
    if (st.pre === 3) return { p0: 1, p1: 2, p2: 2, p3: 3, p4: 8, p5: 9, p6: 9, p7: 9, p8: 10, n: 9 };
    return { p0: 2, p1: 3, p2: 4, p3: 4.5, p4: 6, p5: 7, p6: 8.5, n: 7 };
  },
  onDrag(key, p, v, st) {
    const raw = clamp((p.x - 20) / 14, 0, 20);
    v[key] = st.m === 1 ? Math.round(raw) : Math.round(raw * 2) / 2;
  },
  draw(v, step, st) {
    const n = Math.round(v.n);
    const ks = Array.from({ length: n }, (_, i) => `p${i}`);
    const xs = ks.map((k) => v[k]);
    const sorted = [...xs].sort((a, b) => a - b);
    const sum = xs.reduce((s, x) => s + x, 0);
    const mean = sum / n;
    const even = n % 2 === 0;
    const med = even ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[(n - 1) / 2];
    const mid = even ? [n / 2 - 1, n / 2] : [(n - 1) / 2];
    const cnt = new Map();
    for (const x of xs) cnt.set(x, (cnt.get(x) ?? 0) + 1);
    const top = Math.max(...cnt.values());
    const modesL = [...cnt.entries()].filter(([, c]) => c === top && top > 1).map(([x]) => x).sort((a, b) => a - b);
    const range = sorted[n - 1] - sorted[0];
    const chips = sorted.map((x, i) => `<rect class="ex-chip${mid.includes(i) ? ' mid' : ''}" x="${n1(160 - (n * 34) / 2 + i * 34)}" y="8" width="31" height="20" rx="6"/>${T(160 - (n * 34) / 2 + i * 34 + 15.5, 22, fmt(x, 1), 'm10')}`).join('');
    const axis = `${ln(14, 170, 306, 170, 'exc-m', 1.5)}${[0, 5, 10, 15, 20].map((x) => `${ln(MM_X(x), 166, MM_X(x), 174, 'exc-m', 1.2)}${T(MM_X(x), 186, x, 'm9 exm-mut')}`).join('')}`;
    const tk = st.m === 2 ? (st.task ?? (mmTask(st), st.task)) : null;

    if (st.m === 1) {
      const stackN = new Map();
      const dots = ks
        .map((k) => {
          const x = v[k];
          const h = stackN.get(x) ?? 0;
          stackN.set(x, h + 1);
          const y = 158 - h * 15;
          const isMode = modesL.includes(x);
          return `${dot(MM_X(x), y, 6.5, isMode ? 'exc-o' : 'exc-p')}${hit(k, MM_X(x), y, 10)}`;
        })
        .join('');
      return {
        svg: `${chips}${axis}${ln(MM_X(sorted[0]), 200, MM_X(sorted[n - 1]), 200, 'exc-b', 2)}${ln(MM_X(sorted[0]), 194, MM_X(sorted[0]), 206, 'exc-b', 2)}${ln(MM_X(sorted[n - 1]), 194, MM_X(sorted[n - 1]), 206, 'exc-b', 2)}${T((MM_X(sorted[0]) + MM_X(sorted[n - 1])) / 2, 214, `R = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)}`, 'm10 tc exc-b h')}${dots}
          ${T(8, 48, modesL.length ? `${u('mode', 'мода', 'мода')} = ${modesL.map((x) => fmt(x)).join('; ')}` : u('no mode', 'моды нет', 'мода жоқ'), 'm12 tc exc-o ex-start')}`,
        caption: J(
          modesL.length
            ? L(`Mode: ${modesL.map((x) => fmt(x)).join(' and ')} - appears ${top} times, more than any other value (orange).`, `Мода: ${modesL.map((x) => fmt(x)).join(' и ')} - встречается ${top} раза, чаще остальных (оранжевые).`, `Мода: ${modesL.map((x) => fmt(x)).join(' және ')} - ${top} рет кездеседі, басқалардан жиі (қызғылт сары).`)
            : L('All values are different, so there is no mode. Drag dots onto one place.', 'Все значения разные - моды нет. Перетащи точки в одно место.', 'Барлық мәндер әртүрлі - мода жоқ. Нүктелерді бір жерге сүйре.'),
          L(`Range: max − min = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)} - how spread out the data are.`, `Размах: max − min = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)} - насколько разбросаны данные.`, `Құлаш: max − min = ${fmt(sorted[n - 1])} − ${fmt(sorted[0])} = ${fmt(range)} - деректердің шашыраңқылығы.`),
        ),
      };
    }

    const dots = ks
      .map((k, i) => {
        const y = 48 + i * 12;
        return `${ln(MM_X(v[k]), y, MM_X(v[k]), 170, 'exc-m', 0.5)}${dot(MM_X(v[k]), y, 6, 'exc-p')}${hit(k, MM_X(v[k]), y, 12)}`;
      })
      .join('');
    const pic = `${chips}${axis}${dots}${area(`M${n1(MM_X(mean))} 172 l-9 15 h18 Z`, 'exc-o', 1)}${T(clamp(MM_X(mean), 30, 290), 206, `x̄ = ${fmt(mean)}`, 'm11 tc exc-o h')}${ln(MM_X(med), 40, MM_X(med), 170, 'exc-g', 2.5)}${T(clamp(MM_X(med) + 5, 0, 260), 40, `Me = ${fmt(med)}`, 'm11 tc exc-g ex-start h')}`;
    if (tk) {
      const ok = check(st, n === tk.n && (tk.type === 0 ? near(mean, tk.target, 0.001) : tk.type === 1 ? near(med, tk.target, 0.001) : near(range, tk.target, 0.001)));
      const what = [L(`the mean = ${fmt(tk.target)}`, `среднее = ${fmt(tk.target)}`, `орта мән = ${fmt(tk.target)}`), L(`the median = ${fmt(tk.target)}`, `медиана = ${fmt(tk.target)}`, `медиана = ${fmt(tk.target)}`), L(`the range = ${fmt(tk.target)}`, `размах = ${fmt(tk.target)}`, `құлаш = ${fmt(tk.target)}`)][tk.type];
      const hint = [
        L(`Now the mean = ${fmt(mean)}. Hint: the sum must be ${fmt(tk.target)}·${n} = ${fmt(tk.target * n)} (now ${fmt(sum)}).`, `Сейчас среднее = ${fmt(mean)}. Подсказка: сумма должна быть ${fmt(tk.target)}·${n} = ${fmt(tk.target * n)} (сейчас ${fmt(sum)}).`, `Қазір орта мән = ${fmt(mean)}. Кеңес: қосынды ${fmt(tk.target)}·${n} = ${fmt(tk.target * n)} болуы керек (қазір ${fmt(sum)}).`),
        L(`Now the median = ${fmt(med)}. ${n} values - even, so the median is the average of the two middle ones.`, `Сейчас медиана = ${fmt(med)}. Значений ${n} - чётное число, поэтому медиана - среднее двух средних.`, `Қазір медиана = ${fmt(med)}. Мәндер саны ${n} - жұп, сондықтан медиана - ортадағы екі мәннің орташасы.`),
        L(`Now the range = ${fmt(range)}: the distance from the smallest to the largest value.`, `Сейчас размах = ${fmt(range)}: расстояние от самого маленького до самого большого.`, `Қазір құлаш = ${fmt(range)}: ең кішіден ең үлкенге дейінгі арақашықтық.`),
      ][tk.type];
      return { svg: `${pic}${badge(tx(what), ok)}`, caption: taskCap(st, ok, J(L(`${tk.n} values. Drag the dots so that`, `${tk.n} значений. Перетащи точки так, чтобы`, `${tk.n} мән. Нүктелерді сүйреп,`), what, L('.', '.', 'болсын.')), hint) };
    }
    return {
      svg: pic,
      caption: J(
        L(`Mean = sum ÷ ${n} = ${fmt(sum)} ÷ ${n} = ${fmt(mean)} (orange balance point).`, `Среднее = сумма ÷ ${n} = ${fmt(sum)} ÷ ${n} = ${fmt(mean)} (оранжевая точка равновесия).`, `Орта мән = қосынды ÷ ${n} = ${fmt(sum)} ÷ ${n} = ${fmt(mean)} (қызғылт сары тепе-теңдік нүктесі).`),
        even
          ? L(`${n} values - even: median = (${fmt(sorted[n / 2 - 1])} + ${fmt(sorted[n / 2])}) / 2 = ${fmt(med)}.`, `${n} значений - чётное число: медиана = (${fmt(sorted[n / 2 - 1])} + ${fmt(sorted[n / 2])}) / 2 = ${fmt(med)}.`, `${n} мән - жұп сан: медиана = (${fmt(sorted[n / 2 - 1])} + ${fmt(sorted[n / 2])}) / 2 = ${fmt(med)}.`)
          : L(`Median = the middle (${(n + 1) / 2}-th) of the sorted values = ${fmt(med)}.`, `Медиана = середина упорядоченного ряда (${(n + 1) / 2}-е значение) = ${fmt(med)}.`, `Медиана = реттелген қатардың ортасы (${(n + 1) / 2}-мән) = ${fmt(med)}.`),
        Math.abs(mean - med) > 1.5 ? L('A far-away value drags the mean but hardly the median.', 'Далёкое значение тянет среднее, а медиану почти нет.', 'Алыс мән орта мәнді тартады, медиананы әрең.') : null,
      ),
    };
  },
});

// ---------- Комбинаторика ----------

const LET = 'ABCDEFGHIJ';
/** Первые lim упорядоченных выборок (order) или сочетаний k из n. */
function listSel(n, k, order, lim = 24) {
  const out = [];
  const rec = (cur, used, start) => {
    if (out.length >= lim) return;
    if (cur.length === k) {
      out.push(cur.join(''));
      return;
    }
    for (let i = order ? 0 : start; i < n; i++) if (!used.has(i)) {
      used.add(i);
      rec([...cur, LET[i]], used, i + 1);
      used.delete(i);
    }
  };
  rec([], new Set(), 0);
  return out;
}
const Acnt = (n, k) => (k > n ? 0 : fact(n) / fact(n - k));
const Ccnt = (n, k) => (k > n ? 0 : Acnt(n, k) / fact(k));

function combTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const n = rnd(4, 9);
    t = { n, k: 2, val: Ccnt(n, 2), need: 'n', p: { n: 3, k: 2 } };
  } else if (type === 1) {
    const n = rnd(5, 8);
    const k = rnd(2, 4);
    t = { n, k, val: Acnt(n, k), need: 'k', p: { n, k: 0 } };
  } else {
    const n = rnd(3, 6);
    t = { n, k: n, val: fact(n), need: 'n', perm: true, p: { n: 1, k: 1 } };
  }
  st.task = { type, done: false, ...t };
  return t.p;
}

const combinatorics = modes({
  title: L('Combinatorics: arrangements and combinations', 'Комбинаторика: размещения и сочетания', 'Комбинаторика: орналастырулар мен терулер'),
  intro: L('Choosing k of n: if order matters - arrangements A = n!/(n−k)!, if not - combinations C = A/k!.', 'Выбираем k из n: если порядок важен - размещения A = n!/(n−k)!, если нет - сочетания C = A/k!.', 'n-нен k таңдаймыз: рет маңызды болса - орналастыру A = n!/(n−k)!, болмаса - теру C = A/k!.'),
  sliders: [
    { id: 'n', label: 'n', min: 1, max: 10, value: 5, hidden: (v, st) => st.m === 3 && st.task?.need !== 'n' },
    { id: 'k', label: 'k', min: 0, max: 10, value: 3, hidden: (v, st) => st.m === 3 && (st.task?.need !== 'k') },
  ],
  tabs: [L('Order matters', 'Порядок важен', 'Рет маңызды'), L('No order', 'Порядок не важен', 'Рет маңызды емес'), L('Pascal', 'Паскаль', 'Паскаль'), TASK],
  acts: [{ label: MORE, only: [3] }],
  clamp(v) {
    v.k = Math.min(v.k, v.n);
  },
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return combTask(st);
    return null;
  },
  onAct(j, st) {
    return combTask(st);
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (combTask(st), st.task)) : null;
    const n = Math.round(v.n);
    const k = tk?.perm ? n : Math.min(Math.round(v.k), n);
    const A = Acnt(n, k);
    const Cn = Ccnt(n, k);
    const people = Array.from({ length: n }, (_, i) => `${dot(18 + i * 22, 22, 9.5, i < k ? 'exc-p' : 'exc-m')}${T(18 + i * 22, 26, LET[i], 'm10 exm-on')}`).join('');

    if (st.m === 2) {
      let g = '';
      for (let r = 0; r <= n; r++)
        for (let c = 0; c <= r; c++) {
          const x = 160 + (c - r / 2) * 28;
          const y = 16 + r * 18.5;
          const on = r === n && c === k;
          g += `${on ? box(x - 13, y - 11, 26, 15, 'exc-o', 5) : ''}${T(x, y, Ccnt(r, c), `${Ccnt(r, c) > 99 ? 'm9' : 'm10'} ${on ? 'exm-on' : r === n ? 'tc exc-p' : 'exm-mut'}`)}`;
        }
      return {
        svg: `${g}${T(8, 214, `C(${n}, ${k}) = ${Cn}`, 'm12 tc exc-o ex-start')}${T(312, 214, `Σ = 2${sup(n)} = ${2 ** n}`, 'm11 ex-end')}`,
        caption: L(
          `Pascal's triangle: every number is the sum of the two above it. Row ${n} lists C(${n}, 0) ... C(${n}, ${n}); the orange one is C(${n}, ${k}) = ${Cn}. The row adds up to 2${sup(n)} = ${2 ** n} - all subsets of ${n} things.`,
          `Треугольник Паскаля: каждое число - сумма двух над ним. В строке ${n} стоят C(${n}, 0) ... C(${n}, ${n}); оранжевое - C(${n}, ${k}) = ${Cn}. Сумма строки 2${sup(n)} = ${2 ** n} - все подмножества из ${n} предметов.`,
          `Паскаль үшбұрышы: әр сан үстіндегі екі санның қосындысы. ${n}-жолда C(${n}, 0) ... C(${n}, ${n}) тұр; қызғылт сары - C(${n}, ${k}) = ${Cn}. Жолдың қосындысы 2${sup(n)} = ${2 ** n} - ${n} заттың барлық ішкі жиындары.`,
        ),
      };
    }

    const order = tk ? tk.type !== 0 : st.m === 0;
    const list = listSel(n, k, order, 30);
    const total = order ? A : Cn;
    const slots = order
      ? Array.from({ length: k }, (_, i) => `${box(18 + i * 30, 44, 26, 24, 'exc-y', 5, 0.5)}${T(31 + i * 30, 61, n - i, 'm11')}${i < k - 1 ? T(46 + i * 30, 61, '·', 'm12') : ''}`).join('')
      : '';
    const cols = 6;
    const lst = list
      .slice(0, 24)
      .map((s, i) => T(30 + (i % cols) * 50, 100 + Math.floor(i / cols) * 17, s || '∅', 'm10 tc exc-p'))
      .join('');
    const formula = order ? `A(${n}, ${k}) = ${n}!/${n - k}! = ${A}` : `C(${n}, ${k}) = ${n}!/(${k}!·${n - k}!) = ${Cn}`;
    const svg = `${people}${slots}${lst}${total > 24 ? T(160, 100 + 4 * 17, `… ${u('total', 'всего', 'барлығы')} ${total}`, 'm10 exm-mut') : ''}${T(160, 192, formula, 'm15')}${T(160, 212, order ? `= ${k ? Array.from({ length: k }, (_, i) => n - i).join('·') : '1'}` : `= A : ${k}! = ${A} : ${fact(k)}`, 'm11 exm-mut')}`;
    if (tk) {
      const ok = check(st, n === tk.n && k === tk.k);
      const ask = [
        L(`A class chooses 2 duty students in C(n, 2) = ${tk.val} ways. How many students are there? Set n.`, `Двух дежурных в классе можно выбрать C(n, 2) = ${tk.val} способами. Сколько учеников? Установи n.`, `Сыныптан екі кезекшіні C(n, 2) = ${tk.val} тәсілмен таңдауға болады. Неше оқушы? n-ді орнат.`),
        L(`A(${tk.n}, k) = ${tk.val}: how many places k are handed out among ${tk.n} people?`, `A(${tk.n}, k) = ${tk.val}: сколько мест k разыгрывают среди ${tk.n} человек?`, `A(${tk.n}, k) = ${tk.val}: ${tk.n} адам арасында неше орын (k) ойнатылады?`),
        L(`n people can stand in a row in ${tk.val} ways. Find n (here k = n).`, `n человек можно поставить в ряд ${tk.val} способами. Найди n (здесь k = n).`, `n адамды қатарға ${tk.val} тәсілмен тұрғызуға болады. n-ді тап (мұнда k = n).`),
      ][tk.type];
      return { svg: `${svg}${badge(`= ${tk.val}`, ok)}`, caption: taskCap(st, ok, ask, L(`Now ${formula}.`, `Сейчас ${formula}.`, `Қазір ${formula}.`)) };
    }
    return {
      svg,
      caption: order
        ? L(
            `Places 1, 2, ... for ${k} of ${n}: the 1st place has ${n} candidates, the next one ${n - 1}, ... Multiply: ${A}. ${k === n ? `k = n: these are permutations, n! = ${A}.` : ''} AB and BA are different here.`,
            `Места 1, 2, ... для ${k} из ${n}: на 1-е место ${n} кандидатов, на следующее ${n - 1}, ... Перемножаем: ${A}. ${k === n ? `k = n: это перестановки, n! = ${A}.` : ''} AB и BA здесь разные.`,
            `${n} адамнан ${k} адамға 1, 2, ... орындар: 1-орынға ${n} үміткер, келесіге ${n - 1}, ... Көбейтеміз: ${A}. ${k === n ? `k = n: бұл алмастырулар, n! = ${A}.` : ''} Мұнда AB мен BA әртүрлі.`,
          )
        : L(
            `A team of ${k} from ${n}: AB and BA are the same team. Every team was counted ${k}! = ${fact(k)} times among the arrangements, so C = ${A} : ${fact(k)} = ${Cn}.`,
            `Команда из ${k} среди ${n}: AB и BA - одна и та же команда. Каждую команду среди размещений посчитали ${k}! = ${fact(k)} раз, поэтому C = ${A} : ${fact(k)} = ${Cn}.`,
            `${n} адамнан ${k} адамдық команда: AB мен BA - бір команда. Әр команда орналастырулар ішінде ${k}! = ${fact(k)} рет саналды, сондықтан C = ${A} : ${fact(k)} = ${Cn}.`,
          ),
    };
  },
});