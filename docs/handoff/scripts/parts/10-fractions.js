// ---------- Дроби ----------

/** Дробь «столбиком»: числитель над чертой, знаменатель под ней; y - высота черты. */
function sfr(x, y, n, d, size = 18, col = '') {
  const w = Math.max(String(n).length, String(d).length) * size * 0.62 + 6;
  const cls = size >= 18 ? 'm18' : size >= 15 ? 'm15' : size >= 12 ? 'm12' : 'm11';
  return `<g class="${col}">${T(x, y - size * 0.3, n, `${cls} tc`)}<line class="ex-stroke" style="stroke-width:${size > 14 ? 2 : 1.4}" x1="${n1(x - w / 2)}" y1="${y}" x2="${n1(x + w / 2)}" y2="${y}"/>${T(x, y + size * 0.98, d, `${cls} tc`)}</g>`;
}

/** Пиццы для дроби a/b в прямоугольнике (x, y, w, h): по одной на каждое целое. */
function pizzas(a, b, x, y, w, h, on = 'on') {
  const k = Math.max(1, Math.ceil(a / b));
  const cols = k <= 2 ? k : k <= 6 ? 3 : 4;
  const rows = Math.ceil(k / cols);
  const cell = Math.min(w / cols, h / rows);
  const r = cell / 2 - 3;
  let g = '';
  for (let j = 0; j < k; j++) {
    const cx = x + (w - cols * cell) / 2 + (j % cols) * cell + cell / 2;
    const cy = y + (h - rows * cell) / 2 + Math.floor(j / cols) * cell + cell / 2;
    const fill = clamp(a - j * b, 0, b);
    if (b === 1) g += `<circle class="ex-slice ${fill ? on : ''}" cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}"/>`;
    else for (let i = 0; i < b; i++) g += `<path class="ex-slice ${i < fill ? on : ''}" style="--i:${i}" d="${arcD(cx, cy, r, 90 - (i / b) * 360, 90 - ((i + 1) / b) * 360, true)}"/>`;
  }
  return g;
}

/** Полоска на отрезке [0, M]: клетки по 1/b, закрашены первые a (цвет cls). */
function fbar(a, b, M, X0, X1, y, h, cls = 'exc-p', from = 0) {
  const n = M * b;
  const cw = (X1 - X0) / n;
  const gap = Math.min(1.2, cw * 0.18);
  let g = '';
  for (let i = 0; i < n; i++) {
    const on = i >= from && i < from + a;
    g += `<rect class="ex-fill ${on ? cls : 'exm-off'}" x="${n1(X0 + i * cw + gap / 2)}" y="${y}" width="${n1(cw - gap)}" height="${h}" rx="${cw > 8 ? 2 : 0}"/>`;
  }
  // границы целых
  for (let j = 1; j < M; j++) g += ln(X0 + j * b * cw, y - 3, X0 + j * b * cw, y + h + 3, 'exc-m', 2);
  return g;
}

/** Конечна ли десятичная запись n/d. */
const finiteDec = (n, d) => {
  let q = d / gcd(n, d);
  while (q % 2 === 0) q /= 2;
  while (q % 5 === 0) q /= 5;
  return q === 1;
};
/** Смешанное число для n/d (n > d > 0): «1 2/3». */
const mixed = (n, d) => {
  const s = n < 0 ? '−' : '';
  const N = Math.abs(n);
  const w = Math.floor(N / d);
  const r = N % d;
  if (!r) return `${s}${w}`;
  return `${s}${w ? `${w} ` : ''}${frs(r, d)}`;
};
/** «= 0,75» или «≈ 0,333». */
const pctEq = (n, d) => `${Math.abs(((1000 * n) / d) - Math.round((1000 * n) / d)) < 1e-9 ? '=' : '≈'} ${fmt((100 * n) / d, 1)}%`;
const decEq = (n, d) => `${finiteDec(n, d) && Math.abs((n / d) * 1000 - Math.round((n / d) * 1000)) < 1e-9 ? '=' : '≈'} ${fmt(n / d, 3)}`;

const FR_PRE = [[3, 4], [6, 8], [2, 3], [5, 3], [7, 4], [4, 4], [0, 5], [12, 4], [1, 12]];
const FR_PAIRS = [[3, 4, 2, 3], [1, 2, 3, 6], [5, 8, 3, 4], [2, 5, 1, 3], [7, 6, 5, 4], [3, 10, 1, 4]];
const FR_OPS = ['+', '−', '×', '÷'];

function frTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 4);
  while (type === last);
  let t;
  if (type === 0) {
    let p;
    const q = rnd(2, 6);
    do p = rnd(1, q - 1);
    while (gcd(p, q) !== 1);
    t = { p, q, tag: `= ${p}/${q}, b ≠ ${q}` };
  } else if (type === 1) {
    let n;
    let r;
    let q;
    do {
      q = rnd(2, 5);
      n = rnd(1, 2);
      r = rnd(1, q - 1);
    } while (gcd(r, q) !== 1 || n * q + r > 12);
    t = { n, r, q, p: n * q + r, tag: `${n} ${r}/${q} = a/b` };
  } else if (type === 2) {
    let c;
    let d;
    let tp;
    let tq;
    do {
      d = pick([2, 3, 4, 6]);
      c = rnd(1, d - 1);
      const b0 = pick([2, 3, 4, 6, 12]);
      const a0 = rnd(1, b0 - 1);
      tp = a0 * d + c * b0;
      tq = b0 * d;
      const g = gcd(tp, tq);
      tp /= g;
      tq /= g;
    } while (tq > 12 || gcd(c, d) !== 1);
    t = { c, d, tp, tq, tag: `a/b + ${c}/${d} = ${frs(tp, tq)}` };
  } else if (type === 3) {
    const [p, q] = pick([[1, 4], [1, 2], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [3, 2], [5, 4], [7, 10]]);
    t = { p, q, tag: `a/b = ${fmt(p / q, 3)}` };
  } else {
    const [l1, l2, h1, h2] = pick([[1, 2, 2, 3], [1, 3, 1, 2], [2, 3, 3, 4], [3, 4, 4, 5], [1, 4, 1, 3], [2, 5, 1, 2], [1, 5, 1, 4]]);
    t = { l1, l2, h1, h2, tag: `${l1}/${l2} < a/b < ${h1}/${h2}` };
  }
  st.task = { type, done: false, ...t };
  return { a: 1, b: 2 };
}

/** Картинка «одна дробь»: пиццы, полоска, числовая прямая, справа записи. extra(sx) - метки задания на прямой. */
function frOne(a, b, extra = () => '', right = true) {
  const M = Math.max(1, Math.ceil(a / b));
  const nl = numLine(0, M, 20, 300, 190, 1 / b, 1);
  const g = gcd(a, b) || 1;
  let rows = [];
  if (right) {
    if (a && g > 1) rows.push(`= ${a / g}/${b / g}`);
    if (a > b && a % b) rows.push(`= ${mixed(a, b)}`);
    if (a % b === 0) rows.push(`= ${a / b}`);
    rows.push(decEq(a, b));
    rows.push(pctEq(a, b));
  }
  rows = [...new Set(rows)].slice(0, 4);
  const px = nl.sx(a / b);
  return `${pizzas(a, b, 6, 4, 170, 142)}${fbar(a, b, M, 20, 300, 152, 16)}${nl.svg}${extra(nl.sx)}
    ${dot(px, 190, 5.5, 'exc-o')}${T(clamp(px, 16, 304), 181, `${a}/${b}`, 'm11 tc exc-o h')}
    ${right ? `${sfr(250, 38, a, b, 20)}${rows.map((s, i) => T(250, 82 + i * 18, s, 'm12')).join('')}` : ''}`;
}

const fractions = modes({
  title: L('Fractions', 'Обыкновенные дроби', 'Жай бөлшектер'),
  intro: L(
    'a/b: the whole is cut into b equal parts and a of them are taken. Compare, add, multiply and divide fractions in pictures.',
    'a/b: целое разрезали на b равных частей и взяли a из них. Сравнивай, складывай, умножай и дели дроби на картинке.',
    'a/b: бүтінді b тең бөлікке бөліп, a бөлігін алдық. Бөлшектерді суретпен салыстыр, қос, көбейт және бөл.',
  ),
  sliders: [
    { id: 'a', label: L('a - numerator', 'a - числитель', 'a - алым'), min: 0, max: 12, value: 3 },
    { id: 'b', label: L('b - denominator', 'b - знаменатель', 'b - бөлім'), min: 1, max: 12, value: 4 },
    { id: 'c', label: L('c - numerator 2', 'c - числитель 2', 'c - 2-алым'), min: 0, max: 12, value: 1, hidden: only(1, 2) },
    { id: 'd', label: L('d - denominator 2', 'd - знаменатель 2', 'd - 2-бөлім'), min: 1, max: 12, value: 6, hidden: only(1, 2) },
  ],
  tabs: [L('Fraction', 'Дробь', 'Бөлшек'), L('Compare', 'Сравнить', 'Салыстыру'), L('Operations', 'Действия', 'Амалдар'), TASK],
  acts: [{ label: '+ − × ÷ ↻', only: [2] }, { label: MORE }],
  state: () => ({ op: 0, pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return frTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) {
      st.op = (st.op + 1) % 4;
      return null;
    }
    if (st.m === 3) return frTask(st);
    if (st.m === 0) {
      st.pre = (st.pre + 1) % FR_PRE.length;
      const [a, b] = FR_PRE[st.pre];
      return { a, b };
    }
    st.pre = (st.pre + 1) % FR_PAIRS.length;
    const [a, b, c, d] = FR_PAIRS[st.pre];
    return { a, b, c, d };
  },
  draw(v, step, st) {
    const a = Math.round(v.a);
    const b = Math.max(1, Math.round(v.b));
    const c = Math.round(v.c);
    const d = Math.max(1, Math.round(v.d));
    const g = gcd(a, b) || 1;

    if (st.m === 0) {
      const sm = a && g > 1 ? ` ${a}/${b} = ${a / g}/${b / g}.` : '';
      const pct = `${a}/${b} ${decEq(a, b)} ${pctEq(a, b)}.`;
      let cap;
      if (a === 0) cap = L(`0/${b} = 0: the whole is cut into ${b} parts, but none is taken.`, `0/${b} = 0: целое разрезали на ${b} ${pl(b, 'часть', 'части', 'частей')}, но не взяли ни одной.`, `0/${b} = 0: бүтін ${b} бөлікке бөлінді, бірақ бірде-біреуі алынбады.`);
      else if (a === b) cap = L(`${a}/${b} = 1: all ${b} parts are taken - a whole.`, `${a}/${b} = 1: взяли все ${b} ${pl(b, 'часть', 'части', 'частей')} - это одно целое.`, `${a}/${b} = 1: барлық ${b} бөлік алынды - бұл бір бүтін.`);
      else if (a < b)
        cap = L(
          `The whole is cut into ${b} equal parts and ${a} are taken: a proper fraction ${a}/${b}.${sm ? ` Top and bottom divide by ${g}:${sm} The same amount, bigger parts.` : ''} ${pct}`,
          `Целое разрезали на ${b} ${pl(b, 'равную часть', 'равные части', 'равных частей')} и взяли ${a}: правильная дробь ${a}/${b}.${sm ? ` Числитель и знаменатель делятся на ${g}:${sm} Та же доля, только части крупнее.` : ''} ${pct}`,
          `Бүтін ${b} тең бөлікке бөлініп, ${a} бөлігі алынды: дұрыс бөлшек ${a}/${b}.${sm ? ` Алым мен бөлім ${g}-ге бөлінеді:${sm} Үлес сол, тек бөліктер ірі.` : ''} ${pct}`,
        );
      else {
        const w = Math.floor(a / b);
        const r = a % b;
        cap = r
          ? L(
              `${a}/${b} > 1 is an improper fraction: ${w} whole (${w * b}/${b}) and ${r}/${b} more, the mixed number ${mixed(a, b)}.${sm} ${pct}`,
              `${a}/${b} > 1 - неправильная дробь: ${w} цел. (${w * b}/${b}) и ещё ${r}/${b}, смешанное число ${mixed(a, b)}.${sm} ${pct}`,
              `${a}/${b} > 1 - бұрыс бөлшек: ${w} бүтін (${w * b}/${b}) және тағы ${r}/${b}, аралас сан ${mixed(a, b)}.${sm} ${pct}`,
            )
          : L(`${a}/${b} = ${a} ÷ ${b} = ${w}: exactly ${w} whole pizzas.`, `${a}/${b} = ${a} ÷ ${b} = ${w}: ровно ${w} ${pl(w, 'целая пицца', 'целых пиццы', 'целых пицц')}.`, `${a}/${b} = ${a} ÷ ${b} = ${w}: дәл ${w} бүтін пицца.`);
      }
      return { svg: frOne(a, b), caption: cap };
    }

    if (st.m === 1) {
      const M = Math.max(1, Math.ceil(Math.max(a / b, c / d)));
      const Lc = lcm(b, d);
      const A = (a * Lc) / b;
      const Cc = (c * Lc) / d;
      const s = a * d === c * b ? '=' : a * d > c * b ? '>' : '<';
      const sx = (x) => 46 + (x / M) * 260;
      let cuts = '';
      if (Lc * M <= 72 && Lc !== b) for (let i = 1; i < Lc * M; i++) if (i % (Lc / b)) cuts += ln(sx(i / Lc), 32, sx(i / Lc), 52, 'exc-m ex-dash', 1);
      if (Lc * M <= 72 && Lc !== d) for (let i = 1; i < Lc * M; i++) if (i % (Lc / d)) cuts += ln(sx(i / Lc), 78, sx(i / Lc), 98, 'exc-m ex-dash', 1);
      const nl = numLine(0, M, 46, 306, 136, Lc * M <= 48 ? 1 / Lc : 1, 1);
      const X = sx(a / b);
      const Y = sx(c / d);
      return {
        svg: `${fbar(a, b, M, 46, 306, 30, 22, 'exc-o')}${fbar(c, d, M, 46, 306, 76, 22, 'exc-b')}${cuts}
          ${sfr(22, 42, a, b, 12, 'exc-o')}${sfr(22, 88, c, d, 12, 'exc-b')}
          ${nl.svg}${ln(X, 104, X, 136, 'exc-o ex-dash', 1.2)}${ln(Y, 100, Y, 136, 'exc-b ex-dash', 1.2)}
          ${dot(X, 136, 5.5, 'exc-o')}${dot(Y, 136, 4, 'exc-b')}
          ${T(160, 184, `${a}/${b} ${s} ${c}/${d}`, 'm18')}${T(160, 206, `${A}/${Lc} ${s} ${Cc}/${Lc}`, 'm12 exm-mut')}`,
        caption:
          s === '='
            ? L(
                `Common denominator lcm(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc} and ${c}/${d} = ${Cc}/${Lc}. The numerators match - the fractions are equal, one and the same point on the line.`,
                `Общий знаменатель НОК(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc} и ${c}/${d} = ${Cc}/${Lc}. Числители равны - дроби равны, это одна и та же точка на прямой.`,
                `Ортақ бөлім ЕКОЕ(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc} және ${c}/${d} = ${Cc}/${Lc}. Алымдар тең - бөлшектер тең, түзудегі бір нүкте.`,
              )
            : L(
                `Bring to the common denominator lcm(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}. ${A} ${s} ${Cc}, so ${a}/${b} ${s} ${c}/${d}. Cross check: ${a}·${d} = ${a * d} ${s} ${c}·${b} = ${c * b}.`,
                `Приводим к общему знаменателю НОК(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}. ${A} ${s} ${Cc}, значит ${a}/${b} ${s} ${c}/${d}. Проверка крест-накрест: ${a}·${d} = ${a * d} ${s} ${c}·${b} = ${c * b}.`,
                `Ортақ бөлімге келтіреміз ЕКОЕ(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}. ${A} ${s} ${Cc}, демек ${a}/${b} ${s} ${c}/${d}. Айқастыра тексеру: ${a}·${d} = ${a * d} ${s} ${c}·${b} = ${c * b}.`,
              ),
      };
    }

    if (st.m === 2) return frOps(a, b, c, d, st.op);

    // ----- Задание -----
    const tk = st.task ?? (frTask(st), st.task);
    let ok = false;
    let ask;
    let hint;
    let svg;
    const cur = `${a}/${b}`;
    if (tk.type === 2) {
      ok = (a * tk.d + tk.c * b) * tk.tq === tk.tp * b * tk.d;
      const op2 = frOps(a, b, tk.c, tk.d, 0, true);
      svg = op2.svg;
      ask = L(`Find a/b: a/b + ${tk.c}/${tk.d} = ${frs(tk.tp, tk.tq)}.`, `Найди a/b: a/b + ${tk.c}/${tk.d} = ${frs(tk.tp, tk.tq)}.`, `a/b табыңыз: a/b + ${tk.c}/${tk.d} = ${frs(tk.tp, tk.tq)}.`);
      const sum = frs(a * tk.d + tk.c * b, b * tk.d);
      hint = L(`Now ${cur} + ${tk.c}/${tk.d} = ${sum}. Hint: a/b = ${frs(tk.tp, tk.tq)} − ${tk.c}/${tk.d}, use a common denominator.`, `Сейчас ${cur} + ${tk.c}/${tk.d} = ${sum}. Подсказка: a/b = ${frs(tk.tp, tk.tq)} − ${tk.c}/${tk.d}, приведи к общему знаменателю.`, `Қазір ${cur} + ${tk.c}/${tk.d} = ${sum}. Кеңес: a/b = ${frs(tk.tp, tk.tq)} − ${tk.c}/${tk.d}, ортақ бөлімге келтір.`);
    } else {
      let mark = () => '';
      if (tk.type === 4) {
        ok = a * tk.l2 > tk.l1 * b && a * tk.h2 < tk.h1 * b;
        mark = (sx) => `${soft(sx(tk.l1 / tk.l2), 184, sx(tk.h1 / tk.h2) - sx(tk.l1 / tk.l2), 12, 'exc-g', 3)}`;
        const Lc = lcm(lcm(tk.l2, tk.h2), 12);
        ask = L(`Find a fraction between ${tk.l1}/${tk.l2} and ${tk.h1}/${tk.h2} (the green strip).`, `Найди дробь между ${tk.l1}/${tk.l2} и ${tk.h1}/${tk.h2} (зелёная полоска).`, `${tk.l1}/${tk.l2} мен ${tk.h1}/${tk.h2} арасындағы бөлшекті тап (жасыл жолақ).`);
        hint = L(`Hint: with denominator ${Lc}: ${(tk.l1 * Lc) / tk.l2}/${Lc} and ${(tk.h1 * Lc) / tk.h2}/${Lc} - take a numerator in between.`, `Подсказка: со знаменателем ${Lc}: ${(tk.l1 * Lc) / tk.l2}/${Lc} и ${(tk.h1 * Lc) / tk.h2}/${Lc} - возьми числитель между ними.`, `Кеңес: бөлімі ${Lc} болса: ${(tk.l1 * Lc) / tk.l2}/${Lc} және ${(tk.h1 * Lc) / tk.h2}/${Lc} - арасындағы алымды ал.`);
      } else {
        const p = tk.p;
        const q = tk.q;
        ok = a > 0 && a * q === p * b && (tk.type !== 0 || b !== q);
        mark = (sx) => (p / q <= Math.max(1, Math.ceil(a / b)) ? ring(sx(p / q), 190, 8, 'exc-g', 2.5) : '');
        if (tk.type === 0) {
          ask = L(`Make a fraction equal to ${p}/${q}, but with another denominator.`, `Получи дробь, равную ${p}/${q}, но с другим знаменателем.`, `${p}/${q}-ге тең, бірақ бөлімі басқа бөлшек құрастыр.`);
          hint =
            a * q === p * b
              ? L(`That is ${p}/${q} itself - take another denominator.`, `Это и есть ${p}/${q} - возьми другой знаменатель.`, `Бұл ${p}/${q}-тің өзі - басқа бөлім ал.`)
              : L(`Hint: multiply top and bottom by the same number, e.g. ${p}/${q} = ${2 * p}/${2 * q}.`, `Подсказка: умножь числитель и знаменатель на одно число, например ${p}/${q} = ${2 * p}/${2 * q}.`, `Кеңес: алым мен бөлімді бір санға көбейт, мысалы ${p}/${q} = ${2 * p}/${2 * q}.`);
        } else if (tk.type === 1) {
          ask = L(`Write the mixed number ${tk.n} ${tk.r}/${q} as a fraction a/b.`, `Запиши смешанное число ${tk.n} ${tk.r}/${q} дробью a/b.`, `${tk.n} ${tk.r}/${q} аралас санын a/b бөлшегімен жаз.`);
          hint = L(`Hint: ${tk.n} whole = ${tk.n * q}/${q}, plus ${tk.r}/${q}. Now ${cur} ${decEq(a, b)}.`, `Подсказка: ${tk.n} цел. = ${tk.n * q}/${q}, плюс ${tk.r}/${q}. Сейчас ${cur} ${decEq(a, b)}.`, `Кеңес: ${tk.n} бүтін = ${tk.n * q}/${q}, қосу ${tk.r}/${q}. Қазір ${cur} ${decEq(a, b)}.`);
        } else {
          ask = L(`Make a/b equal to the decimal ${fmt(p / q, 3)}.`, `Сделай дробь a/b равной ${fmt(p / q, 3)}.`, `a/b бөлшегін ${fmt(p / q, 3)} санына теңе.`);
          hint = L(`Now ${cur} ${decEq(a, b)}. Hint: ${fmt(p / q, 3)} = ${Math.round((p / q) * 1000)}/1000 - simplify it.`, `Сейчас ${cur} ${decEq(a, b)}. Подсказка: ${fmt(p / q, 3)} = ${Math.round((p / q) * 1000)}/1000 - сократи.`, `Қазір ${cur} ${decEq(a, b)}. Кеңес: ${fmt(p / q, 3)} = ${Math.round((p / q) * 1000)}/1000 - қысқарт.`);
        }
      }
      svg = frOne(a, b, mark, false) + sfr(250, 60, a, b, 20);
      svg += T(250, 108, decEq(a, b), 'm12');
    }
    ok = check(st, ok);
    return { svg: `${svg}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
  },
});

/** Действия с дробями: op 0..3 = + − × ÷. task - без подписи формулы результата. */
function frOps(a, b, c, d, op, task = false) {
  const S = FR_OPS[op];
  if (op <= 1) {
    const Lc = lcm(b, d);
    const A = (a * Lc) / b;
    const Cc = (c * Lc) / d;
    const R = op ? A - Cc : A + Cc;
    const M = Math.max(1, Math.ceil(op ? Math.max(a / b, c / d) : a / b + c / d));
    const fine = Lc * M <= 72;
    const X0 = 46;
    const X1 = 306;
    const sx = (x) => X0 + (x / M) * (X1 - X0);
    const strip = (from, n, y, cls) => box(sx(from / Lc), y, sx(n / Lc) - X0, 20, cls, 2, 0.85);
    const ticks = (y) => {
      let s = '';
      if (fine) for (let i = 1; i < Lc * M; i++) s += ln(sx(i / Lc), y, sx(i / Lc), y + 20, 'exc-m', i % Lc ? 0.6 : 2);
      return s;
    };
    const base = (y) => box(X0, y, X1 - X0, 20, 'exm-off', 2);
    let res = base(108);
    if (op === 0) res += strip(0, A, 108, 'exc-o') + strip(A, Cc, 108, 'exc-b');
    else if (R >= 0) res += strip(0, R, 108, 'exc-o') + `<rect class="exm-soft exc-b ex-dash" x="${n1(sx(R / Lc))}" y="108" width="${n1(sx(Cc / Lc) - X0)}" height="20"/>`;
    else res += strip(0, Cc, 108, 'exc-r') + strip(0, A, 108, 'exc-o');
    const nl = numLine(0, M, X0, X1, 152, fine && Lc * M <= 48 ? 1 / Lc : 1, 1);
    const simp = frs(R, Lc);
    const g2 = gcd(R, Lc) || 1;
    const tail = `${simp !== `${R}/${Lc}` ? ` = ${simp}` : ''}${Math.abs(R) > Lc && R % Lc ? ` = ${mixed(R / g2, Lc / g2)}` : ''}`;
    const svg = `${base(26)}${strip(0, A, 26, 'exc-o')}${ticks(26)}${base(66)}${strip(0, Cc, 66, 'exc-b')}${ticks(66)}${res}${ticks(108)}
      ${sfr(22, 37, a, b, 12, 'exc-o')}${sfr(22, 77, c, d, 12, 'exc-b')}${T(22, 123, '=', 'm15')}
      ${nl.svg}${R >= 0 ? dot(sx(R / Lc), 152, 5.5, 'exc-p') : ''}
      ${T(160, 188, `${a}/${b} ${S} ${c}/${d} = ${A}/${Lc} ${S} ${Cc}/${Lc}`, 'm12')}${task ? '' : T(160, 208, `= ${R < 0 ? '−' : ''}${Math.abs(R)}/${Lc}${tail}`, 'm12 tc exc-p')}`;
    if (task) return { svg };
    const same = b === d;
    const pre = same
      ? L(`The denominators are equal (${b}), so we ${op ? 'subtract' : 'add'} only the numerators.`, `Знаменатели одинаковые (${b}) - ${op ? 'вычитаем' : 'складываем'} только числители.`, `Бөлімдер бірдей (${b}) - тек алымдарды ${op ? 'азайтамыз' : 'қосамыз'}.`)
      : L(`Different denominators: bring both to lcm(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}.`, `Знаменатели разные: приводим к НОК(${b}, ${d}) = ${Lc}: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}.`, `Бөлімдер әртүрлі: ЕКОЕ(${b}, ${d}) = ${Lc}-ге келтіреміз: ${a}/${b} = ${A}/${Lc}, ${c}/${d} = ${Cc}/${Lc}.`);
    const post = L(
      `Then ${A} ${S} ${Cc} = ${R}, the denominator stays ${Lc}: ${R}/${Lc}${tail}.${R < 0 ? ' The result is negative: the blue part is longer.' : ''}`,
      `Затем ${A} ${S} ${Cc} = ${R}, знаменатель остаётся ${Lc}: ${R}/${Lc}${tail}.${R < 0 ? ' Ответ отрицательный: синяя часть длиннее.' : ''}`,
      `Сосын ${A} ${S} ${Cc} = ${R}, бөлім ${Lc} болып қалады: ${R}/${Lc}${tail}.${R < 0 ? ' Жауап теріс: көк бөлік ұзынырақ.' : ''}`,
    );
    return { svg, caption: J(pre, post) };
  }
  if (op === 2) {
    // Площадь: прямоугольник a/b на c/d внутри единичных квадратов.
    const U = Math.max(1, Math.ceil(a / b), Math.ceil(c / d));
    const s = 150 / U;
    const X0 = 14;
    const Y0 = 22;
    const w = (a / b) * s;
    const h = (c / d) * s;
    let g = '';
    for (let i = 0; i < U; i++) for (let j = 0; j < U; j++) g += `<rect class="exm-off" x="${n1(X0 + i * s)}" y="${n1(Y0 + j * s)}" width="${n1(s - 1)}" height="${n1(s - 1)}" rx="2"/>`;
    g += box(X0, Y0, w, U * s, 'exc-o', 0, 0.35) + box(X0, Y0, U * s, h, 'exc-b', 0, 0.35) + box(X0, Y0, w, h, 'exc-p', 0, 0.85);
    if (U * b <= 48) for (let i = 1; i < U * b; i++) g += ln(X0 + (i * s) / b, Y0, X0 + (i * s) / b, Y0 + U * s, 'exc-m', i % b ? 0.5 : 1.5);
    if (U * d <= 48) for (let j = 1; j < U * d; j++) g += ln(X0, Y0 + (j * s) / d, X0 + U * s, Y0 + (j * s) / d, 'exc-m', j % d ? 0.5 : 1.5);
    g += T(X0 + w / 2, 15, `${a}/${b}`, 'm11 tc exc-o') + T(X0 + U * s + 4, Y0 + h / 2 + 4, `${c}/${d}`, 'm11 tc exc-b ex-start');
    const P = a * c;
    const Q = b * d;
    const rows = [`${a}/${b} × ${c}/${d}`, `= (${a}·${c})/(${b}·${d})`, `= ${P}/${Q}`];
    if (frs(P, Q) !== `${P}/${Q}`) rows.push(`= ${frs(P, Q)}`);
    return {
      svg: `${g}${rows.map((r, i) => T(248, 56 + i * 24, r, i ? 'm12' : 'm15')).join('')}`,
      caption: L(
        `Multiply top by top and bottom by bottom: (${a}·${c})/(${b}·${d}) = ${P}/${Q}${frs(P, Q) !== `${P}/${Q}` ? ` = ${frs(P, Q)}` : ''}. In the picture the purple rectangle ${a}/${b} by ${c}/${d} has ${P} small cells, and a whole square has ${Q}.`,
        `Числитель умножаем на числитель, знаменатель на знаменатель: (${a}·${c})/(${b}·${d}) = ${P}/${Q}${frs(P, Q) !== `${P}/${Q}` ? ` = ${frs(P, Q)}` : ''}. На картинке: фиолетовый прямоугольник ${a}/${b} на ${c}/${d} - это ${P} маленьких клеток, а целый квадрат - ${Q}.`,
        `Алымды алымға, бөлімді бөлімге көбейтеміз: (${a}·${c})/(${b}·${d}) = ${P}/${Q}${frs(P, Q) !== `${P}/${Q}` ? ` = ${frs(P, Q)}` : ''}. Суретте ${a}/${b}-ге ${c}/${d} күлгін тіктөртбұрышта ${P} кішкене тор бар, ал тұтас шаршыда - ${Q}.`,
      ),
    };
  }
  // Деление: сколько раз c/d помещается в a/b.
  if (c === 0)
    return {
      svg: `${frOne(a, b, () => '', false)}${T(250, 60, `${a}/${b} ÷ 0/${d}`, 'm15')}${T(250, 90, '= ?', 'm18 tc exc-r')}`,
      caption: L(`c/d = 0/${d} = 0, and you cannot divide by zero. Make c bigger than 0.`, `c/d = 0/${d} = 0, а на ноль делить нельзя. Сделай c больше нуля.`, `c/d = 0/${d} = 0, ал нөлге бөлуге болмайды. c-ны нөлден үлкен ет.`),
    };
  const x = a / b;
  const y = c / d;
  const M = Math.max(1, Math.ceil(Math.max(x, y)));
  const sx = (t) => 30 + (t / M) * 270;
  const qn = a * d;
  const qd = b * c;
  const qv = qn / qd;
  let pcs = '';
  const whole = Math.floor(qv + 1e-9);
  if (whole <= 60) {
    for (let i = 0; i < whole; i++) pcs += box(sx(i * y) + 0.6, 80, sx(y) - 30 - 1.2, 22, i % 2 ? 'exc-b' : 'exc-k', 2, 0.85) + (whole <= 12 ? T(sx((i + 0.5) * y), 95, i + 1, 'm10') : '');
    const rest = qv - whole;
    if (rest > 1e-9) pcs += box(sx(whole * y) + 0.6, 80, (sx(y) - 30) * rest - 1.2, 22, 'exc-b', 2, 0.35) + `<rect class="ex-stroke exc-b ex-dash" style="fill:none;stroke-width:1" x="${n1(sx(whole * y))}" y="80" width="${n1(sx(y) - 30)}" height="22"/>`;
  }
  const nl = numLine(0, M, 30, 300, 136, M * b <= 48 ? 1 / b : 1, 1);
  const res = frs(qn, qd);
  const mx = qv > 1 && qn % qd ? ` = ${mixed(qn / gcd(qn, qd), qd / gcd(qn, qd))}` : '';
  return {
    svg: `${box(30, 40, sx(x) - 30, 22, 'exc-o', 2, 0.85)}${T(30, 34, `${a}/${b}`, 'm11 tc exc-o ex-start')}${pcs}${T(30, 116, `${c}/${d}`, 'm11 tc exc-b ex-start')}${nl.svg}${dot(sx(x), 136, 5, 'exc-o')}
      ${T(160, 182, `${a}/${b} ÷ ${c}/${d} = ${a}/${b} × ${d}/${c}`, 'm12')}${T(160, 204, `= ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}`, 'm12 tc exc-p')}`,
    caption: L(
      `How many pieces ${c}/${d} fit into ${a}/${b}? Dividing by a fraction = multiplying by the flipped one: ${a}/${b} × ${d}/${c} = ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}. The answer ${nice(qv, 12)} is how many pieces ${c}/${d} fit in ${a}/${b}.`,
      `Сколько кусков по ${c}/${d} помещается в ${a}/${b}? Делить на дробь = умножать на перевёрнутую: ${a}/${b} × ${d}/${c} = ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}. Ответ ${nice(qv, 12)} - столько кусков по ${c}/${d} в ${a}/${b}.`,
      `${a}/${b} ішіне ${c}/${d} бөлігі неше рет сыяды? Бөлшекке бөлу = аударылған бөлшекке көбейту: ${a}/${b} × ${d}/${c} = ${qn}/${qd}${res !== `${qn}/${qd}` ? ` = ${res}` : ''}${mx}. Жауап ${nice(qv, 12)} - ${a}/${b} ішіндегі ${c}/${d} бөліктерінің саны.`,
    ),
  };
}