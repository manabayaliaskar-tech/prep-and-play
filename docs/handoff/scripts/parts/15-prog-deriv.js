// ---------- Прогрессии ----------

const progVals = (a1, r, N, geo) => Array.from({ length: N }, (_, i) => (geo ? a1 * r ** i : a1 + i * r));

function progTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t;
  if (type === 0) {
    const a1 = rnd(-5, 6);
    const d = pick([-3, -2, -1.5, -1, 0.5, 1, 1.5, 2, 3]);
    const k = rnd(4, 8);
    t = { a1, d, k, ak: a1 + (k - 1) * d, need: 'd', p: { a1, d: 0, n: k } };
  } else if (type === 1) {
    const [b1, q, k] = pick([[2, 3, 4], [1, 2, 6], [3, 2, 5], [5, -2, 4], [1, -3, 4], [16, 0.5, 5], [2, -2, 5], [4, 1.5, 3]]);
    t = { a1: b1, q, k, bk: b1 * q ** (k - 1), need: 'q', p: { a1: b1, q: 1, n: k } };
  } else if (type === 2) {
    const a1 = rnd(-4, 5);
    const d = pick([2, 3, -2, 1.5, 4]);
    const k = rnd(5, 12);
    t = { a1, d, k, ak: a1 + (k - 1) * d, need: 'n', p: { a1, d, n: 1 } };
  } else {
    const a1 = rnd(1, 4);
    const d = pick([1, 2, 3]);
    const k = rnd(4, 10);
    t = { a1, d, k, S: ((2 * a1 + (k - 1) * d) * k) / 2, need: 'n', sum: true, p: { a1, d, n: 1 } };
  }
  st.task = { type, done: false, ...t };
  return t.p;
}

const progression = modes({
  title: L('Arithmetic and geometric progressions', 'Арифметическая и геометрическая прогрессии', 'Арифметикалық және геометриялық прогрессиялар'),
  intro: L('An arithmetic progression adds the same d each time, a geometric one multiplies by the same q.', 'Арифметическая прогрессия каждый раз прибавляет одно и то же d, геометрическая - умножает на одно и то же q.', 'Арифметикалық прогрессия әр жолы бірдей d қосады, геометриялық - бірдей q-ға көбейтеді.'),
  sliders: [
    { id: 'a1', label: 'a₁', min: -10, max: 10, step: 0.5, value: 2, hidden: (v, st) => st.m === 3 },
    { id: 'd', label: 'd', min: -4, max: 4, step: 0.5, value: 1.5, hidden: (v, st) => (st.m === 3 ? st.task?.need !== 'd' : st.m === 1) },
    { id: 'q', label: 'q', min: -3, max: 3, step: 0.5, value: 1.5, hidden: (v, st) => (st.m === 3 ? st.task?.need !== 'q' : st.m !== 1) },
    { id: 'n', label: 'n', min: 1, max: 12, value: 6, hidden: (v, st) => st.m === 3 && st.task?.need !== 'n' },
  ],
  tabs: [L('Arithmetic', 'Арифметическая', 'Арифметикалық'), L('Geometric', 'Геометрическая', 'Геометриялық'), L('Sum', 'Сумма', 'Қосынды'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return progTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return progTask(st);
    st.pre += 1;
    if (st.m === 1) return [{ a1: 1, q: 2, n: 8 }, { a1: 8, q: 0.5, n: 6 }, { a1: 1, q: -2, n: 7 }, { a1: 3, q: 1, n: 5 }][st.pre % 4];
    return [{ a1: 1, d: 1, n: 10 }, { a1: 10, d: -2, n: 8 }, { a1: -3, d: 1.5, n: 9 }, { a1: 2, d: 3, n: 6 }][st.pre % 4];
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (progTask(st), st.task)) : null;
    const geo = st.m === 1 || tk?.need === 'q';
    const a1 = v.a1;
    const r = geo ? v.q : v.d;
    const n = Math.round(v.n);
    const N = Math.max(8, n);
    const vals = progVals(a1, r, N, geo);
    const an = vals[n - 1];
    const sumN = vals.slice(0, n).reduce((s, x) => s + x, 0);
    const sym = geo ? 'b' : 'a';

    if (st.m === 2) {
      const pos = vals.slice(0, n).every((x) => x >= 0);
      const H0 = 190;
      const tot = a1 + an;
      const k = pos && tot > 0 ? 160 / tot : 0;
      const w = Math.min(24, 250 / n);
      let g = '';
      for (let i = 0; i < n; i++) {
        const x = 30 + i * w;
        const h1 = vals[i] * k;
        const h2 = vals[n - 1 - i] * k;
        g += box(x, H0 - h1, w - 2, h1, 'exc-p', 2, 0.9) + box(x, H0 - h1 - h2, w - 2, h2, 'exc-o', 2, 0.55);
        if (w > 15) g += T(x + w / 2 - 1, H0 + 12, i + 1, 'm9 exm-mut');
      }
      if (pos && tot > 0) g += `<rect class="ex-stroke exc-m ex-dash" style="fill:none;stroke-width:1.5" x="29" y="${n1(H0 - tot * k)}" width="${n1(n * w)}" height="${n1(tot * k)}"/>${T(36 + n * w, H0 - (tot * k) / 2 + 4, `a₁ + aₙ = ${fmt(tot)}`, 'm10 ex-start')}`;
      const S = ((a1 + an) * n) / 2;
      return {
        svg: `${ln(24, H0, 316, H0, 'exc-m', 1.2)}${g}${T(8, 18, `Sₙ = (a₁ + aₙ)·n/2 = (${fmt(a1)} + ${pn(an)})·${n}/2 = ${fmt(S)}`, 'm11 ex-start h')}`,
        caption: pos
          ? L(
              `Gauss's trick: write the sum forwards (purple) and backwards (orange). Every column is a₁ + aₙ = ${fmt(tot)}, there are ${n} columns, so 2S = ${n}·${fmt(tot)} and S${n} = ${fmt(S)}.`,
              `Приём Гаусса: запишем сумму прямо (фиолетовые) и задом наперёд (оранжевые). Каждый столбик = a₁ + aₙ = ${fmt(tot)}, столбиков ${n}, значит 2S = ${n}·${fmt(tot)} и S${n} = ${fmt(S)}.`,
              `Гаусс тәсілі: қосындыны тура (күлгін) және кері (қызғылт сары) жазамыз. Әр баған = a₁ + aₙ = ${fmt(tot)}, баған саны ${n}, демек 2S = ${n}·${fmt(tot)} және S${n} = ${fmt(S)}.`,
            )
          : L(`Some terms are negative, the picture is not drawn, but the formula still works: S${n} = (a₁ + aₙ)·n/2 = ${fmt(S)}.`, `Есть отрицательные члены - картинку не рисуем, но формула работает: S${n} = (a₁ + aₙ)·n/2 = ${fmt(S)}.`, `Теріс мүшелер бар - сурет салмаймыз, бірақ формула орындалады: S${n} = (a₁ + aₙ)·n/2 = ${fmt(S)}.`),
      };
    }

    // столбики членов
    const shown = vals.slice(0, N);
    const mx = Math.max(...shown.map((x) => Math.abs(x)), 1e-9);
    const neg = shown.some((x) => x < 0);
    const zero = neg ? 118 : 190;
    const sc = (neg ? 76 : 150) / mx;
    const w = Math.min(30, 286 / N);
    let g = ln(18, zero, 316, zero, 'exc-m', 1.2);
    shown.forEach((x, i) => {
      const X = 24 + i * w;
      const h = x * sc;
      const on = i === n - 1;
      g += box(X, h >= 0 ? zero - h : zero, w - 4, Math.abs(h), on ? 'exc-o' : 'exc-p', 3, on ? 1 : 0.7);
      g += T(X + w / 2 - 2, zero + (x >= 0 ? 12 : -5), i + 1, 'm9 exm-mut');
      if (w > 21 || on) g += T(X + w / 2 - 2, h >= 0 ? zero - h - 4 : zero - h + 11, Math.abs(x) >= 1000 ? fmt(x, 0) : fmt(x, 1), `m9 ${on ? 'tc exc-o' : ''}`);
      if (i < Math.min(N - 1, 5) && w > 21) g += T(X + w - 2, 44, geo ? `×${fmt(r)}` : `${r >= 0 ? '+' : '−'}${fmt(Math.abs(r))}`, 'm9 tc exc-g');
    });
    const formula = geo ? `bₙ = b₁·qⁿ⁻¹ = ${fmt(a1)}·${pn(r)}${sup(n - 1)} = ${fmt(an)}` : `aₙ = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)}`;
    const head = T(8, 18, formula, 'm11 ex-start h');

    if (tk) {
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = near(v.d, tk.d, 0.01);
        tag = `a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}`;
        ask = L(`a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}. Find the difference d.`, `a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}. Найди разность d.`, `a₁ = ${fmt(tk.a1)}, a${tk.k} = ${fmt(tk.ak)}. d айырмасын тап.`);
        hint = L(`Now a${tk.k} = ${fmt(an)}. Hint: d = (a${tk.k} − a₁)/(${tk.k} − 1).`, `Сейчас a${tk.k} = ${fmt(an)}. Подсказка: d = (a${tk.k} − a₁)/(${tk.k} − 1).`, `Қазір a${tk.k} = ${fmt(an)}. Кеңес: d = (a${tk.k} − a₁)/(${tk.k} − 1).`);
      } else if (tk.type === 1) {
        ok = near(v.q, tk.q, 0.01);
        tag = `b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}`;
        ask = L(`b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}. Find the ratio q.`, `b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}. Найди знаменатель q.`, `b₁ = ${fmt(tk.a1)}, b${tk.k} = ${fmt(tk.bk)}. q еселігін тап.`);
        hint = L(`Now b${tk.k} = ${fmt(an)}. Hint: q${sup(tk.k - 1)} = ${fmt(tk.bk)} : ${fmt(tk.a1)} = ${fmt(tk.bk / tk.a1)}.`, `Сейчас b${tk.k} = ${fmt(an)}. Подсказка: q${sup(tk.k - 1)} = ${fmt(tk.bk)} : ${fmt(tk.a1)} = ${fmt(tk.bk / tk.a1)}.`, `Қазір b${tk.k} = ${fmt(an)}. Кеңес: q${sup(tk.k - 1)} = ${fmt(tk.bk)} : ${fmt(tk.a1)} = ${fmt(tk.bk / tk.a1)}.`);
      } else if (tk.type === 2) {
        ok = n === tk.k;
        tag = `aₙ = ${fmt(tk.ak)}`;
        ask = L(`a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Which term equals ${fmt(tk.ak)}? Set n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Какой по номеру член равен ${fmt(tk.ak)}? Установи n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Нешінші мүше ${fmt(tk.ak)}-ге тең? n-ді орнат.`);
        hint = L(`Now a${n} = ${fmt(an)}. Hint: n = (aₙ − a₁)/d + 1.`, `Сейчас a${n} = ${fmt(an)}. Подсказка: n = (aₙ − a₁)/d + 1.`, `Қазір a${n} = ${fmt(an)}. Кеңес: n = (aₙ − a₁)/d + 1.`);
      } else {
        ok = n === tk.k;
        tag = `Sₙ = ${fmt(tk.S)}`;
        ask = L(`a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. How many first terms add up to ${fmt(tk.S)}? Set n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Сколько первых членов дают в сумме ${fmt(tk.S)}? Установи n.`, `a₁ = ${fmt(tk.a1)}, d = ${fmt(tk.d)}. Алғашқы неше мүшенің қосындысы ${fmt(tk.S)}? n-ді орнат.`);
        hint = L(`Now S${n} = ${fmt(sumN)}.`, `Сейчас S${n} = ${fmt(sumN)}.`, `Қазір S${n} = ${fmt(sumN)}.`);
      }
      ok = check(st, ok);
      return { svg: `${g}${head}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    if (geo) {
      const q = r;
      const Sg = Math.abs(q - 1) < 1e-9 ? a1 * n : (a1 * (q ** n - 1)) / (q - 1);
      return {
        svg: `${g}${head}`,
        caption:
          q === 0
            ? L('q = 0 is not allowed: after the first term everything turns into 0, so a geometric progression needs q ≠ 0.', 'q = 0 нельзя: после первого члена всё превращается в 0, поэтому у геометрической прогрессии q ≠ 0.', 'q = 0 болмайды: бірінші мүшеден кейін бәрі 0-ге айналады, сондықтан геометриялық прогрессияда q ≠ 0.')
            : L(
                `Each term is the previous one ×${fmt(q)}: b${n} = ${fmt(a1)}·${pn(q)}${sup(n - 1)} = ${fmt(an)}. Sum of ${n} terms: S = b₁(qⁿ − 1)/(q − 1) = ${fmt(Sg)}.${q < 0 ? ' q < 0: the signs alternate.' : Math.abs(q) < 1 ? ' |q| < 1: the terms shrink towards 0.' : q === 1 ? ' q = 1: all terms are equal.' : ' q > 1: the terms grow faster and faster.'}`,
                `Каждый член - предыдущий ×${fmt(q)}: b${n} = ${fmt(a1)}·${pn(q)}${sup(n - 1)} = ${fmt(an)}. Сумма ${n} членов: S = b₁(qⁿ − 1)/(q − 1) = ${fmt(Sg)}.${q < 0 ? ' q < 0: знаки чередуются.' : Math.abs(q) < 1 ? ' |q| < 1: члены уменьшаются к 0.' : q === 1 ? ' q = 1: все члены равны.' : ' q > 1: члены растут всё быстрее.'}`,
                `Әр мүше - алдыңғысы ×${fmt(q)}: b${n} = ${fmt(a1)}·${pn(q)}${sup(n - 1)} = ${fmt(an)}. ${n} мүшенің қосындысы: S = b₁(qⁿ − 1)/(q − 1) = ${fmt(Sg)}.${q < 0 ? ' q < 0: таңбалар кезектеседі.' : Math.abs(q) < 1 ? ' |q| < 1: мүшелер 0-ге қарай кемиді.' : q === 1 ? ' q = 1: барлық мүшелер тең.' : ' q > 1: мүшелер барған сайын жылдам өседі.'}`,
              ),
      };
    }
    return {
      svg: `${g}${head}`,
      caption: L(
        `Each term is the previous one ${r >= 0 ? '+' : '−'} ${fmt(Math.abs(r))}: a${n} = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)} (orange). The tops lie on a straight line. Sum of ${n} terms: ${fmt(sumN)}.${r === 0 ? ' d = 0: all terms are equal.' : ''}`,
        `Каждый член - предыдущий ${r >= 0 ? '+' : '−'} ${fmt(Math.abs(r))}: a${n} = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)} (оранжевый). Вершины столбиков лежат на прямой. Сумма ${n} членов: ${fmt(sumN)}.${r === 0 ? ' d = 0: все члены равны.' : ''}`,
        `Әр мүше - алдыңғысы ${r >= 0 ? '+' : '−'} ${fmt(Math.abs(r))}: a${n} = a₁ + (n − 1)d = ${fmt(a1)} + ${n - 1}·${pn(r)} = ${fmt(an)} (қызғылт сары). Бағандардың ұштары түзу бойында жатыр. ${n} мүшенің қосындысы: ${fmt(sumN)}.${r === 0 ? ' d = 0: барлық мүшелер тең.' : ''}`,
      ),
    };
  },
});

// ---------- Производная ----------

const FUNS = [
  { f: (x) => x * x, df: (x) => 2 * x, s: 'x²', ds: '2x', y0: -1.5, y1: 9.5, x0: -3.2, x1: 3.2 },
  { f: (x) => (x * x * x) / 3 - x, df: (x) => x * x - 1, s: 'x³/3 − x', ds: 'x² − 1', y0: -3, y1: 3, x0: -3.2, x1: 3.2 },
  { f: Math.sin, df: Math.cos, s: 'sin x', ds: 'cos x', y0: -1.6, y1: 1.6, x0: -3.3, x1: 3.3 },
  { f: Math.exp, df: Math.exp, s: 'eˣ', ds: 'eˣ', y0: -1, y1: 8, x0: -3.2, x1: 2.2 },
];

function derTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [fi, xs] = pick([[0, [0]], [1, [-1, 1]], [2, [-Math.PI / 2, Math.PI / 2]]]);
    t = { fi, xs };
  } else if (type === 1) {
    const [fi, K, xs] = pick([[0, 3, [1.5]], [0, -2, [-1]], [1, 3, [-2, 2]], [1, 0, [-1, 1]], [3, 1, [0]], [2, 1, [0]], [0, 4, [2]]]);
    t = { fi, K, xs };
  } else t = { fi: pick([1, 2]) };
  st.task = { type, done: false, ...t };
  st.fi = t.fi;
  return { x0: -2.5, h: 0 };
}

const derivative = modes({
  title: L('The derivative is the slope of the tangent', 'Производная - наклон касательной', 'Туынды - жанаманың көлбеулігі'),
  intro: L('Bring two points of the graph together: the secant turns into the tangent, and its slope is the derivative f′(x₀).', 'Сближаем две точки графика: секущая превращается в касательную, а её наклон - это производная f′(x₀).', 'График екі нүктесін жақындатамыз: қиюшы жанамаға айналады, оның көлбеулігі - f′(x₀) туындысы.'),
  sliders: [
    { id: 'x0', label: 'x₀', min: -3, max: 3, step: 0.01, value: 0.5 },
    { id: 'h', label: 'h = Δx', min: 0, max: 2, step: 0.01, value: 1.5, hidden: only(0) },
  ],
  tabs: [L('Secant → tangent', 'Секущая → касательная', 'Қиюшы → жанама'), L('f and f′', 'f и f′', 'f және f′'), TASK],
  acts: [{ label: PLAY, only: [0, 1] }, { label: L('Function ↻', 'Функция ↻', 'Функция ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ fi: 1 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return derTask(st);
    return null;
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      if (st.m === 0) api.play('h', { reverse: true, dur: 2500 });
      else api.play('x0', { dur: 5000, linear: true });
      return null;
    }
    if (j === 1) {
      st.fi = (st.fi + 1) % FUNS.length;
      return null;
    }
    return derTask(st);
  },
  draw(v, step, st) {
    const F = FUNS[st.fi];
    const x0 = clamp(v.x0, F.x0 + 0.1, F.x1 - 0.1);
    const { f, df } = F;
    const y0 = f(x0);
    const k = df(x0);
    const kz = Math.abs(k) < 0.005 ? 0 : k;
    const two = st.m === 1;
    const box2 = two ? { Y0: 4, Y1: 120 } : { Y0: 0, Y1: H };
    const G = grid({ x0: F.x0, x1: F.x1, y0: F.y0, y1: F.y1, ...box2, X0: 0, X1: W, lab: 1, ylab: F.y1 > 5 ? 2 : 1, ystep: F.y1 > 5 ? 1 : 0.5 });
    const { sx, sy } = G;
    const tanL = (m, cls, w = 2.5) => pth(`M${n1(sx(F.x0))} ${n1(clamp(sy(y0 + m * (F.x0 - x0)), -200, 400))} L${n1(sx(F.x1))} ${n1(clamp(sy(y0 + m * (F.x1 - x0)), -200, 400))}`, cls, w);
    const curve = pth(plotClip(f, F.x0, F.x1, sx, sy, box2.Y0, box2.Y1), 'exc-p', 3);
    const head = T(8, two ? 18 : 18, `f(x) = ${F.s}`, 'm12 ex-start h');
    const P = dot(sx(x0), sy(y0), 6, 'exc-p');

    if (st.m === 1) {
      const Gd = grid({ x0: F.x0, x1: F.x1, y0: Math.min(-1.5, ...[F.x0, F.x1, 0].map(df)) - 0.3, y1: Math.max(1.5, ...[F.x0, F.x1, 0].map(df)) + 0.3, X0: 0, X1: W, Y0: 126, Y1: 216, lab: 1, ylab: 2, ystep: 1, labels: false });
      // интервалы монотонности на оси f′
      let bands = '';
      const N = 120;
      for (let i = 0; i < N; i++) {
        const xa = F.x0 + ((F.x1 - F.x0) * i) / N;
        const xb = F.x0 + ((F.x1 - F.x0) * (i + 1)) / N;
        bands += ln(sx(xa), Gd.sy(0), sx(xb), Gd.sy(0), df((xa + xb) / 2) > 0 ? 'exc-g' : 'exc-r', 4);
      }
      // экстремумы
      const ext = [];
      for (let i = 0; i < 400; i++) {
        const xa = F.x0 + ((F.x1 - F.x0) * i) / 400;
        const xb = xa + (F.x1 - F.x0) / 400;
        if (df(xa) * df(xb) < 0 || (Math.abs(df(xa)) < 1e-12 && i)) ext.push((xa + xb) / 2);
      }
      const extDots = ext.map((x) => `${dot(sx(x), sy(f(x)), 5, df(x - 0.01) > 0 ? 'exc-r' : 'exc-g')}${T(sx(x), sy(f(x)) + (df(x - 0.01) > 0 ? -8 : 16), df(x - 0.01) > 0 ? 'max' : 'min', `m9 h tc ${df(x - 0.01) > 0 ? 'exc-r' : 'exc-g'}`)}`).join('');
      return {
        svg: `${G.svg}${curve}${tanL(k, 'exc-g')}${extDots}${P}${Gd.svg}${bands}${pth(plotClip(df, F.x0, F.x1, sx, Gd.sy, 126, 216), 'exc-o', 2.5)}${ln(sx(x0), sy(y0), sx(x0), Gd.sy(k), 'exc-m ex-dash', 1)}${dot(sx(x0), clamp(Gd.sy(k), 126, 216), 5, 'exc-o')}
          ${head}${T(8, 140, `f′(x) = ${F.ds}`, 'm11 tc exc-o ex-start h')}${T(312, 18, `f′(${fmt(x0)}) = ${fmt(kz)}`, 'm11 tc exc-g ex-end h')}`,
        caption: J(
          L(
            `The slope of the tangent at x₀ = ${fmt(x0)} is f′(x₀) = ${fmt(kz)} (orange graph below). ${kz > 0 ? 'f′ > 0 - the function increases here.' : kz < 0 ? 'f′ < 0 - the function decreases here.' : 'f′ = 0 - a horizontal tangent: a possible maximum or minimum.'}`,
            `Наклон касательной в x₀ = ${fmt(x0)} равен f′(x₀) = ${fmt(kz)} (оранжевый график внизу). ${kz > 0 ? 'f′ > 0 - здесь функция возрастает.' : kz < 0 ? 'f′ < 0 - здесь функция убывает.' : 'f′ = 0 - касательная горизонтальна: возможен максимум или минимум.'}`,
            `x₀ = ${fmt(x0)} нүктесіндегі жанаманың көлбеулігі f′(x₀) = ${fmt(kz)} (төмендегі қызғылт сары график). ${kz > 0 ? 'f′ > 0 - мұнда функция өседі.' : kz < 0 ? 'f′ < 0 - мұнда функция кемиді.' : 'f′ = 0 - жанама көлденең: максимум не минимум болуы мүмкін.'}`,
          ),
          L('Green on the axis - f increases, red - it decreases.', 'Зелёное на оси - f возрастает, красное - убывает.', 'Осьтегі жасыл - f өседі, қызыл - кемиді.'),
        ),
      };
    }

    if (st.m === 2) {
      const tk = st.task ?? (derTask(st), st.task);
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = tk.xs.some((x) => Math.abs(x - x0) < 0.03);
        tag = "f′(x₀) = 0";
        ask = L(`f(x) = ${F.s}. Find a point where the tangent is horizontal.`, `f(x) = ${F.s}. Найди точку, где касательная горизонтальна.`, `f(x) = ${F.s}. Жанама көлденең болатын нүктені тап.`);
        hint = L(`Now the slope is ${fmt(kz)}. Hint: solve f′(x) = ${F.ds} = 0.`, `Сейчас наклон ${fmt(kz)}. Подсказка: реши f′(x) = ${F.ds} = 0.`, `Қазір көлбеулік ${fmt(kz)}. Кеңес: f′(x) = ${F.ds} = 0 теңдеуін шеш.`);
      } else if (tk.type === 1) {
        ok = tk.xs.some((x) => Math.abs(x - x0) < 0.03);
        tag = `f′(x₀) = ${fmt(tk.K)}`;
        ask = L(`f(x) = ${F.s}. Find x₀ where the slope of the tangent is ${fmt(tk.K)}.`, `f(x) = ${F.s}. Найди x₀, где наклон касательной равен ${fmt(tk.K)}.`, `f(x) = ${F.s}. Жанаманың көлбеулігі ${fmt(tk.K)} болатын x₀ тап.`);
        hint = L(`Now f′(${fmt(x0)}) = ${fmt(kz)}. Hint: solve ${F.ds} = ${fmt(tk.K)}.`, `Сейчас f′(${fmt(x0)}) = ${fmt(kz)}. Подсказка: реши ${F.ds} = ${fmt(tk.K)}.`, `Қазір f′(${fmt(x0)}) = ${fmt(kz)}. Кеңес: ${F.ds} = ${fmt(tk.K)} теңдеуін шеш.`);
      } else {
        ok = k < -0.02;
        tag = "f′(x₀) < 0";
        ask = L(`f(x) = ${F.s}. Put x₀ where the function decreases.`, `f(x) = ${F.s}. Поставь x₀ туда, где функция убывает.`, `f(x) = ${F.s}. x₀-ді функция кемитін жерге қой.`);
        hint = L(`Now f′(${fmt(x0)}) = ${fmt(kz)}. Decreasing means f′ < 0: the tangent goes down.`, `Сейчас f′(${fmt(x0)}) = ${fmt(kz)}. Убывает - значит f′ < 0: касательная идёт вниз.`, `Қазір f′(${fmt(x0)}) = ${fmt(kz)}. Кемиді - f′ < 0: жанама төмен қарайды.`);
      }
      ok = check(st, ok);
      return { svg: `${G.svg}${curve}${tanL(k, ok ? 'exc-g' : 'exc-o')}${P}${head}${T(8, 36, `f′(${fmt(x0)}) = ${fmt(kz)}`, 'm11 ex-start h')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    const h = v.h;
    const x1 = x0 + h;
    const y1 = f(x1);
    const ks = h > 0.001 ? (y1 - y0) / h : k;
    const tri = h > 0.05 ? `${pth(`M${n1(sx(x0))} ${n1(sy(y0))} H${n1(sx(x1))} V${n1(clamp(sy(y1), -10, 230))}`, 'exc-o ex-dash', 1.5)}${T((sx(x0) + sx(x1)) / 2, sy(y0) + (y1 >= y0 ? 13 : -5), `Δx = ${fmt(h)}`, 'm9 tc exc-o h')}${T(sx(x1) + 4, (sy(y0) + sy(y1)) / 2 + 3, `Δy = ${fmt(y1 - y0)}`, 'm9 tc exc-o ex-start h')}` : '';
    return {
      svg: `${G.svg}${curve}${tanL(k, 'exc-g', 2)}${h > 0.001 ? tanL(ks, 'exc-o ex-dash', 2.2) : ''}${tri}${h > 0.001 ? dot(sx(x1), clamp(sy(y1), -10, 230), 5, 'exc-o') : ''}${P}
        ${head}${T(312, 18, `${ui.slope()} Δy/Δx = ${fmt(ks)}`, 'm11 tc exc-o ex-end h')}${T(312, 34, `f′(${fmt(x0)}) = ${fmt(kz)}`, 'm11 tc exc-g ex-end h')}`,
      caption: h <= 0.001 ? L(`h = 0: the two points merged, the secant became the tangent with slope f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)}.`, `h = 0: точки слились, секущая стала касательной с наклоном f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)}.`, `h = 0: нүктелер қосылды, қиюшы көлбеулігі f′(${fmt(x0)}) = ${F.ds} = ${fmt(kz)} жанамаға айналды.`) : L(
        `Secant slope Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. As h → 0 it tends to f′(x₀) = ${F.ds} = ${fmt(kz)} - the slope of the green tangent. Press ▶.`,
        `Наклон секущей Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. При h → 0 он стремится к f′(x₀) = ${F.ds} = ${fmt(kz)} - наклону зелёной касательной. Нажми ▶.`,
        `Қиюшы көлбеулігі Δy/Δx = (f(x₀ + h) − f(x₀))/h = ${fmt(y1 - y0)}/${fmt(h)} = ${fmt(ks)}. h → 0 болғанда ол f′(x₀) = ${F.ds} = ${fmt(kz)} мәніне - жасыл жанаманың көлбеулігіне ұмтылады. ▶ бас.`,
      ),
    };
  },
});