// ---------- Десятки и единицы ----------

/** Палочки-десятки, единицы и сотня-квадрат для числа n с левого верхнего угла (x, y). */
function blocks(n, x, y, hl = 0) {
  let g = '';
  let cx = x;
  const hund = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  for (let h = 0; h < hund; h++) {
    g += `${box(cx, y, 100, 100, 'exc-g', 3, 0.8)}`;
    for (let i = 1; i < 10; i++) g += ln(cx + i * 10, y, cx + i * 10, y + 100, 'exc-g', 0.5) + ln(cx, y + i * 10, cx + 100, y + i * 10, 'exc-g', 0.5);
    cx += 108;
  }
  for (let t = 0; t < tens; t++) {
    g += box(cx, y, 10, 100, 'exc-b', 2, 0.9);
    for (let i = 1; i < 10; i++) g += `<line class="ex-cut" style="stroke-width:1" x1="${cx}" y1="${y + i * 10}" x2="${cx + 10}" y2="${y + i * 10}"/>`;
    cx += 13;
  }
  cx += 6;
  for (let o = 0; o < ones; o++) g += box(cx + (o % 3) * 13, y + 100 - 10 - Math.floor(o / 3) * 13, 10, 10, o >= ones - hl ? 'exc-g' : 'exc-o', 2, 0.9);
  return g;
}

function tensTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t;
  if (type === 0) {
    const n = rnd(11, 99);
    t = { n, tag: `${Math.floor(n / 10)} ${u('tens', 'дес.', 'онд.')} ${n % 10} ${u('ones', 'ед.', 'бірл.')}` };
  } else if (type === 1) {
    let a;
    let b;
    do {
      a = rnd(12, 89);
      b = rnd(3, 9);
    } while ((a % 10) + b < 10);
    t = { n: a + b, a, b, tag: `${a} + ${b} = ?` };
  } else if (type === 2) {
    const a = rnd(10, 89);
    t = { n: a + 10, a, tag: `${a} + 10 = ?` };
  } else {
    const a = rnd(25, 99);
    const b = rnd(3, 9);
    t = { n: a - b, a, b, tag: `${a} − ${b} = ?` };
  }
  st.task = { type, done: false, ...t };
  return { a: 0 };
}

const tens = modes({
  title: L('Tens and ones', 'Десятки и единицы', 'Ондықтар мен бірліктер'),
  intro: L('A number is made of tens (rods of 10) and ones. When ones reach 10, they make a new ten.', 'Число складывается из десятков (палочек по 10) и единиц. Когда единиц набирается 10, получается новый десяток.', 'Сан ондықтардан (10-дық таяқшалар) және бірліктерден құралады. Бірлік 10-ға жеткенде жаңа ондық шығады.'),
  sliders: [
    { id: 'a', label: L('number', 'число', 'сан'), min: 0, max: 100, value: 47 },
    { id: 'b', label: L('add', 'прибавить', 'қосу'), min: 1, max: 9, value: 8, hidden: only(1) },
  ],
  tabs: [L('Place value', 'Разряды', 'Разрядтар'), L('Through ten', 'Через десяток', 'Ондық арқылы'), TASK],
  acts: [{ label: '+1', only: [0] }, { label: '+10', only: [0] }, { label: MORE, only: [1, 2] }],
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return tensTask(st);
    return null;
  },
  onAct(j, st, v) {
    if (j === 0) return { a: clamp(v.a + 1, 0, 100) };
    if (j === 1) return { a: clamp(v.a + 10, 0, 100) };
    if (st.m === 2) return tensTask(st);
    return { a: rnd(11, 89), b: rnd(3, 9) };
  },
  draw(v, step, st) {
    const a = Math.round(v.a);
    const nl = numLine(0, 100, 20, 300, 200, 10, 10);
    const marker = (n, cls = 'exc-p') => `${dot(nl.sx(n), 200, 5, cls)}`;
    const digits = (n, x, y) => {
      const s = String(n);
      const cls = s.length === 3 ? ['exc-g', 'exc-b', 'exc-o'] : s.length === 2 ? ['exc-b', 'exc-o'] : ['exc-o'];
      return [...s].map((c, i) => T(x - ((s.length - 1) * 13) / 2 + i * 13, y, c, `m18 tc ${cls[i]}`)).join('');
    };
    if (st.m === 1) {
      const b = Math.round(v.b);
      const t = Math.floor(a / 10);
      const o = a % 10;
      const need = (10 - o) % 10;
      const s = a + b;
      const cross = o + b >= 10 && a < 100;
      // десятичная рамка: 2 × 5 клеток
      const frame = (x, y, fill, extra) => {
        let g = '';
        for (let i = 0; i < 10; i++) {
          const cls = i < fill ? 'exc-o' : i < fill + extra ? 'exc-g' : 'exm-off';
          g += box(x + (i % 5) * 15, y + Math.floor(i / 5) * 15, 13, 13, cls, 2);
        }
        return g;
      };
      let g = '';
      for (let i = 0; i < Math.min(t, 9); i++) g += box(14 + i * 12, 40, 9, 75, 'exc-b', 2, 0.9);
      const fx = 14 + Math.min(t, 9) * 12 + 8;
      g += frame(fx, 70, o, cross ? need : b);
      if (cross) g += frame(fx + 84, 70, 0, b - need);
      const expr = cross && need ? `${a} + ${b} = ${a} + ${need} + ${b - need} = ${a + need} + ${b - need} = ${s}` : `${a} + ${b} = ${s}`;
      return {
        svg: `${g}${T(160, 24, expr, 'm12')}${T(fx + 36, 112, `${o} + ${cross ? need : b}`, 'm10 exm-mut')}${cross ? T(fx + 120, 112, `${b - need}`, 'm10 tc exc-g') : ''}${nl.svg}${marker(a, 'exc-o')}${s <= 100 ? `${pth(`M${n1(nl.sx(a))} 192 Q${n1((nl.sx(a) + nl.sx(s)) / 2)} 168 ${n1(nl.sx(s))} 192`, 'exc-g', 2)}${marker(s, 'exc-g')}` : ''}${T(nl.sx(Math.min(s, 100)), 160, s, 'm12 tc exc-g h')}`,
        caption: cross
          ? L(
              `${a} has ${o} ones. To make a full ten we need ${need} more - take them from ${b}: ${a} + ${need} = ${a + need}. ${b - need} are left: ${a + need} + ${b - need} = ${s}.`,
              `В ${a} - ${o} ед. До полного десятка не хватает ${need} - берём их из ${b}: ${a} + ${need} = ${a + need}. Осталось ${b - need}: ${a + need} + ${b - need} = ${s}.`,
              `${a} санында ${o} бірлік. Толық ондыққа ${need} жетпейді - оларды ${b}-ден аламыз: ${a} + ${need} = ${a + need}. ${b - need} қалды: ${a + need} + ${b - need} = ${s}.`,
            )
          : L(`${o} + ${b} = ${o + b} ones - less than 10, no new ten: ${a} + ${b} = ${s}.`, `${o} + ${b} = ${o + b} ед. - меньше 10, нового десятка нет: ${a} + ${b} = ${s}.`, `${o} + ${b} = ${o + b} бірлік - 10-нан аз, жаңа ондық жоқ: ${a} + ${b} = ${s}.`),
      };
    }
    const t = Math.floor((a % 100) / 10);
    const o = a % 10;
    const pic = `${blocks(a, 14, 50)}${digits(a, 262, 76)}${T(262, 100, a === 100 ? `1 ${u('hundred', 'сотня', 'жүздік')}` : `${t} ${u('tens', 'дес.', 'онд.')} ${o} ${u('ones', 'ед.', 'бірл.')}`, 'm11')}${T(262, 120, a === 100 ? '100 = 10 · 10' : `${a} = ${t}·10 + ${o}`, 'm11 exm-mut')}${nl.svg}${marker(a)}`;
    if (st.m === 2) {
      const tk = st.task ?? (tensTask(st), st.task);
      const ok = check(st, a === tk.n);
      const ask = [
        L(`Show the number: ${tk.tag}.`, `Покажи число: ${tk.tag}.`, `Санды көрсет: ${tk.tag}.`),
        L(`How much is ${tk.a} + ${tk.b}? Set the number.`, `Сколько будет ${tk.a} + ${tk.b}? Установи число.`, `${tk.a} + ${tk.b} неше болады? Санды орнат.`),
        L(`Which number is 10 more than ${tk.a}?`, `Какое число на 10 больше, чем ${tk.a}?`, `Қай сан ${tk.a}-ден 10-ға артық?`),
        L(`How much is ${tk.a} − ${tk.b}?`, `Сколько будет ${tk.a} − ${tk.b}?`, `${tk.a} − ${tk.b} неше болады?`),
      ][tk.type];
      const hint = [
        L(`Now ${t} tens and ${o} ones.`, `Сейчас ${t} дес. и ${o} ед.`, `Қазір ${t} ондық және ${o} бірлік.`),
        L(`Hint: first complete the ten: ${tk.a} + ${10 - (tk.a % 10)} = ${tk.a + 10 - (tk.a % 10)}.`, `Подсказка: сначала дополни до десятка: ${tk.a} + ${10 - (tk.a % 10)} = ${tk.a + 10 - (tk.a % 10)}.`, `Кеңес: алдымен ондыққа толықтыр: ${tk.a} + ${10 - (tk.a % 10)} = ${tk.a + 10 - (tk.a % 10)}.`),
        L('Hint: +10 adds one rod, the ones stay the same.', 'Подсказка: +10 - это ещё одна палочка, единицы не меняются.', 'Кеңес: +10 - тағы бір таяқша, бірліктер өзгермейді.'),
        L(`Hint: ${tk.a} − ${tk.a % 10} = ${tk.a - (tk.a % 10)}, then subtract the rest.`, `Подсказка: ${tk.a} − ${tk.a % 10} = ${tk.a - (tk.a % 10)}, потом вычти остальное.`, `Кеңес: ${tk.a} − ${tk.a % 10} = ${tk.a - (tk.a % 10)}, сосын қалғанын азайт.`),
      ][tk.type];
      return { svg: `${pic}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    return {
      svg: pic,
      caption: a === 100
        ? L('100 is ten tens: the rods join into a square - one hundred.', '100 - это десять десятков: палочки сложились в квадрат - сотню.', '100 - он ондық: таяқшалар шаршыға - жүздікке жиналды.')
        : L(`${a} = ${t} tens (blue rods of 10) and ${o} ones (orange cubes): ${t}·10 + ${o}. The left digit counts tens, the right one counts ones.`, `${a} = ${t} дес. (синие палочки по 10) и ${o} ед. (оранжевые кубики): ${t}·10 + ${o}. Левая цифра считает десятки, правая - единицы.`, `${a} = ${t} ондық (10-дық көк таяқшалар) және ${o} бірлік (қызғылт сары текшелер): ${t}·10 + ${o}. Сол цифр ондықтарды, оң цифр бірліктерді санайды.`),
    };
  },
});

// ---------- Столбиком ----------

function colTask(st) {
  const sub2 = Math.random() < 0.5;
  let a;
  let b;
  let r;
  do {
    a = rnd(120, 899);
    b = rnd(15, 99);
    r = sub2 ? a - b : a + b;
  } while (r > 999 || r < 10);
  st.task = { sub: sub2, a, r, b, done: false };
  st.k = 4;
  return { a, b: 10 };
}

/** Столбик: цифры, переносы/займы и результат, видимые до шага k (k разрядов справа). */
function columnSvg(a, b, sub2, k, task) {
  const big = sub2 && a < b;
  const A = big ? b : a;
  const B = big ? a : b;
  const R = sub2 ? A - B : A + B;
  const da = String(A).padStart(4, ' ');
  const db = String(B).padStart(4, ' ');
  const dr = String(R).padStart(4, ' ');
  const X = (i) => 120 + i * 34;
  const marks = [];
  const notes = [];
  let c = 0;
  const top = [...da].map((ch) => Number(ch) || 0);
  for (let i = 3; i >= 0; i--) {
    const x = Number(da[i]) || 0;
    const y = Number(db[i]) || 0;
    if (!sub2) {
      const s = x + y + c;
      notes[i] = [x, y, c, s];
      c = s >= 10 ? 1 : 0;
      if (c && i > 0) marks.push([i - 1, '1', 'exc-r']);
    } else {
      let xx = top[i] - c;
      const borrow = xx < y;
      notes[i] = [top[i], y, c, borrow ? xx + 10 - y : xx - y, borrow];
      if (borrow) xx += 10;
      c = borrow ? 1 : 0;
      if (borrow && i > 0) marks.push([i - 1, String(top[i - 1] - 1), 'exc-r']);
    }
  }
  const shown = (i) => 3 - i < k;
  const col = k < 4 ? 3 - k : -1;
  let g = `${col >= 0 && da[col].trim() + db[col].trim() !== '' ? soft(X(col) - 16, 30, 32, 146, 'exc-y', 8) : ''}`;
  g += ['т', 'с', 'д', 'е'].map((h, i) => (i ? T(X(i), 22, [u('', '', ''), u('h', 'с', 'жүз'), u('t', 'д', 'он'), u('o', 'е', 'бір')][i], 'm9 exm-mut') : '')).join('');
  for (const [i, s, cls] of marks) if (shown(i + 1)) g += T(X(i) + (sub2 ? 10 : 0), 44, s, `m11 tc ${cls}`);
  g += [...da].map((ch, i) => T(X(i), 76, ch.trim(), `m18${sub2 && marks.some((m) => m[0] === i && shown(i + 1)) ? ' exm-mut' : ''}`)).join('');
  if (sub2) for (const [i] of marks) if (shown(i + 1)) g += ln(X(i) - 7, 70, X(i) + 7, 60, 'exc-r', 1.5);
  g += T(84, 110, sub2 ? '−' : '+', 'm18') + [...db].map((ch, i) => T(X(i), 110, ch.trim(), 'm18')).join('');
  g += ln(96, 124, X(3) + 20, 124, 'exc-m', 2);
  g += [...dr].map((ch, i) => (shown(i) && !task ? T(X(i), 158, ch.trim(), 'm18 tc exc-p') : '')).join('');
  if (big) g += T(84, 158, '−', 'm18 tc exc-p');
  return { svg: g, notes, R: big ? -R : R, big };
}

const column = modes({
  title: L('Column addition and subtraction', 'Сложение и вычитание столбиком', 'Бағанмен қосу және азайту'),
  intro: L('Work digit by digit from the ones. 10 or more - carry 1 to the next place; not enough - borrow 1 ten.', 'Считаем по разрядам, начиная с единиц. Получилось 10 и больше - переносим 1 в следующий разряд; не хватает - занимаем 1 десяток.', 'Бірліктерден бастап разряд бойынша есептейміз. 10 не одан көп шықса - келесі разрядқа 1 ауыстырамыз; жетпесе - 1 ондық аламыз.'),
  sliders: [
    { id: 'a', label: 'a', min: 10, max: 999, value: 358, hidden: (v, st) => st.m === 2 },
    { id: 'b', label: 'b', min: 10, max: 999, value: 276 },
  ],
  tabs: ['a + b', 'a − b', TASK],
  acts: [{ label: STEP, only: [0, 1] }, { label: MORE }],
  state: () => ({ k: 0 }),
  onSlide(key, v, st) {
    if (st.m < 2) st.k = 0;
  },
  onTab(m, st, v, again) {
    st.k = 0;
    if (m === 2 && (again || !st.task || st.task.done)) return colTask(st);
    if (m === 2) st.k = 4;
    return null;
  },
  onAct(j, st) {
    if (j === 0) {
      st.k = st.k >= 4 ? 0 : st.k + 1;
      return null;
    }
    if (st.m === 2) return colTask(st);
    st.k = 0;
    return st.m ? { a: rnd(300, 999), b: rnd(100, 299) } : { a: rnd(100, 899), b: rnd(100, 899) };
  },
  draw(v, step, st) {
    const a = Math.round(v.a);
    const b = Math.round(v.b);
    if (st.m === 2) {
      const tk = st.task ?? (colTask(st), st.task);
      const c = columnSvg(tk.a, b, tk.sub, 4, false);
      const ok = check(st, c.R === tk.r);
      return {
        svg: `${c.svg}${T(262, 158, `${tk.r}?`, `m12 tc ${ok ? 'exc-g' : 'exc-o'}`)}${badge(`${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}`, ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Find b: ${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}.`, `Найди b: ${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}.`, `b-ны тап: ${tk.a} ${tk.sub ? '−' : '+'} b = ${tk.r}.`),
          L(`Now ${tk.a} ${tk.sub ? '−' : '+'} ${b} = ${c.R}. Hint: b = ${tk.sub ? `${tk.a} − ${tk.r}` : `${tk.r} − ${tk.a}`}.`, `Сейчас ${tk.a} ${tk.sub ? '−' : '+'} ${b} = ${c.R}. Подсказка: b = ${tk.sub ? `${tk.a} − ${tk.r}` : `${tk.r} − ${tk.a}`}.`, `Қазір ${tk.a} ${tk.sub ? '−' : '+'} ${b} = ${c.R}. Кеңес: b = ${tk.sub ? `${tk.a} − ${tk.r}` : `${tk.r} − ${tk.a}`}.`),
        ),
      };
    }
    const sub2 = st.m === 1;
    const c = columnSvg(a, b, sub2, st.k, false);
    const names = [L('Ones', 'Единицы', 'Бірліктер'), L('Tens', 'Десятки', 'Ондықтар'), L('Hundreds', 'Сотни', 'Жүздіктер'), L('Thousands', 'Тысячи', 'Мыңдықтар')];
    let cap;
    if (st.k === 0) cap = L('Press "Step →": we start with the ones column (highlighted).', 'Нажимай «Шаг →»: начинаем со столбика единиц (подсвечен).', '«Қадам →» бас: бірліктер бағанынан бастаймыз (белгіленген).');
    else if (st.k >= 4 || st.k > String(Math.abs(c.R)).length + 1) cap = L(`Done: ${a} ${sub2 ? '−' : '+'} ${b} = ${c.R}.${c.big ? ' a < b, so we subtracted the smaller from the bigger and put a minus.' : ''}`, `Готово: ${a} ${sub2 ? '−' : '+'} ${b} = ${c.R}.${c.big ? ' a < b, поэтому вычли из большего меньшее и поставили минус.' : ''}`, `Дайын: ${a} ${sub2 ? '−' : '+'} ${b} = ${c.R}.${c.big ? ' a < b, сондықтан үлкеннен кішіні азайтып, минус қойдық.' : ''}`);
    else {
      const i = 4 - st.k;
      const [x, y, cin, s, borrow] = c.notes[i];
      const nm = names[st.k - 1];
      const N = (l) => tx(nm, l);
      cap = sub2
        ? L(`${N('en')}: ${x}${cin ? ' − 1 (borrowed)' : ''} − ${y}${borrow ? `: not enough, borrow a ten: ${x - cin + 10} − ${y} = ${s}` : ` = ${s}`}.`, `${N('ru')}: ${x}${cin ? ' − 1 (заняли)' : ''} − ${y}${borrow ? `: не хватает, занимаем десяток: ${x - cin + 10} − ${y} = ${s}` : ` = ${s}`}.`, `${N('kk')}: ${x}${cin ? ' − 1 (алынды)' : ''} − ${y}${borrow ? `: жетпейді, бір ондық аламыз: ${x - cin + 10} − ${y} = ${s}` : ` = ${s}`}.`)
        : L(`${N('en')}: ${x} + ${y}${cin ? ' + 1' : ''} = ${s}${s >= 10 ? ` - write ${s % 10}, carry 1` : ''}.`, `${N('ru')}: ${x} + ${y}${cin ? ' + 1' : ''} = ${s}${s >= 10 ? ` - пишем ${s % 10}, 1 переносим` : ''}.`, `${N('kk')}: ${x} + ${y}${cin ? ' + 1' : ''} = ${s}${s >= 10 ? ` - ${s % 10} жазамыз, 1 ауыстырамыз` : ''}.`);
    }
    return { svg: c.svg, caption: cap };
  },
});

// ---------- Отрицательные числа ----------

function negTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let a;
  let B;
  do {
    a = rnd(-9, 9);
    B = rnd(-9, 9);
  } while (!a || !B || (type === 2 && Math.abs(a * B) > 60));
  const r = type === 0 ? a + B : type === 1 ? a - B : a * B;
  st.task = { type, a, B, r, done: false };
  return { a, b: 0 };
}

const numline = modes({
  title: L('Negative numbers', 'Отрицательные числа', 'Теріс сандар'),
  intro: L('Adding a positive number moves right, a negative one - left. Subtracting a negative is adding a positive.', 'Прибавить положительное - шаг вправо, отрицательное - влево. Вычесть отрицательное - то же, что прибавить положительное.', 'Оң санды қосу - оңға қадам, терісті - солға. Терісті азайту оңды қосумен бірдей.'),
  sliders: [
    { id: 'a', label: 'a', min: -10, max: 10, value: 3, hidden: (v, st) => st.m === 3 },
    { id: 'b', label: 'b', min: -10, max: 10, value: -5 },
  ],
  tabs: ['a + b', 'a − b', 'a · b', TASK],
  acts: [{ label: MORE }],
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return negTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return negTask(st);
    return { a: rnd(-9, 9), b: rnd(-9, 9) };
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (negTask(st), st.task)) : null;
    const opM = tk ? tk.type : st.m;
    const a = tk ? tk.a : Math.round(v.a);
    const b = Math.round(v.b);
    const fa = (x) => (x < 0 ? `(${fmt(x)})` : fmt(x));
    if (opM === 2) {
      const r = a * b;
      const R = Math.max(10, Math.abs(r), Math.abs(b));
      const lim = R <= 10 ? 10 : R <= 20 ? 20 : R <= 50 ? 50 : 100;
      const nl = numLine(-lim, lim, 16, 304, 150, lim / 10, lim / 5);
      const dir = a >= 0 ? 1 : -1;
      let jumps = '';
      for (let i = 0; i < Math.abs(a); i++) {
        const x0 = dir * b * i;
        const x1 = dir * b * (i + 1);
        jumps += pth(`M${n1(nl.sx(x0))} 142 Q${n1((nl.sx(x0) + nl.sx(x1)) / 2)} ${n1(142 - 18 - Math.abs(nl.sx(x1) - nl.sx(x0)) * 0.25)} ${n1(nl.sx(x1))} 142`, dir * b >= 0 ? 'exc-g' : 'exc-r', 2);
      }
      const svg = `${nl.svg}${jumps}${dot(nl.sx(0), 150, 4, 'exc-m')}${dot(nl.sx(r), 150, 6, 'exc-p')}${T(160, 36, `${fa(a)} · ${fa(b)} = ${tk ? '?' : fmt(r)}`, 'm18')}${T(160, 60, tk ? '' : `${a < 0 && b < 0 ? '− · − = +' : a * b < 0 ? '+ · − = −' : '+ · + = +'}`, 'm12 exm-mut')}`;
      if (tk) return negTaskOut(st, tk, b, svg);
      return {
        svg,
        caption: L(
          `${fa(a)} · ${fa(b)}: ${Math.abs(a)} jumps of ${fa(b)}${a < 0 ? ', but a < 0 turns them the other way' : ''} - we land on ${fmt(r)}. ${a < 0 && b < 0 ? 'Minus times minus is plus.' : r < 0 ? 'Different signs give a minus.' : ''}`,
          `${fa(a)} · ${fa(b)}: ${Math.abs(a)} прыжков по ${fa(b)}${a < 0 ? ', но a < 0 разворачивает их в обратную сторону' : ''} - попадаем в ${fmt(r)}. ${a < 0 && b < 0 ? 'Минус на минус даёт плюс.' : r < 0 ? 'Разные знаки дают минус.' : ''}`,
          `${fa(a)} · ${fa(b)}: ${fa(b)} бойынша ${Math.abs(a)} секіріс${a < 0 ? ', бірақ a < 0 оларды кері бұрады' : ''} - ${fmt(r)}-ге түсеміз. ${a < 0 && b < 0 ? 'Минус пен минус плюс береді.' : r < 0 ? 'Әртүрлі таңбалар минус береді.' : ''}`,
        ),
      };
    }
    const d = opM ? -b : b;
    const r = a + d;
    const nl = numLine(-20, 20, 16, 304, 150, 1, 5);
    const h = Math.min(70, 16 + Math.abs(d) * 4);
    const svg = `${nl.svg}${ln(nl.sx(0), 140, nl.sx(0), 160, 'exc-m', 2)}${dot(nl.sx(a), 150, 6, 'exc-b')}
      ${d ? `${pth(`M${n1(nl.sx(a))} 142 Q${n1((nl.sx(a) + nl.sx(r)) / 2)} ${n1(142 - h)} ${n1(nl.sx(r))} 142`, d > 0 ? 'exc-g' : 'exc-r', 2.5)}${T((nl.sx(a) + nl.sx(r)) / 2, 142 - h / 2 - 6, `${d > 0 ? '+' : '−'}${Math.abs(d)}`, `m12 tc h ${d > 0 ? 'exc-g' : 'exc-r'}`)}` : ''}${dot(nl.sx(r), 150, 6, 'exc-p')}
      ${T(160, 36, `${fmt(a)} ${opM ? '−' : '+'} ${fa(b)} = ${tk ? '?' : fmt(r)}`, 'm18')}${opM && b < 0 && !tk ? T(160, 58, `= ${fmt(a)} + ${fmt(-b)}`, 'm12 tc exc-g') : ''}`;
    if (tk) return negTaskOut(st, tk, b, svg);
    return {
      svg,
      caption: L(
        `Start at ${fmt(a)} (blue), ${d >= 0 ? `move ${d} right` : `move ${-d} left`} - you land on ${fmt(r)}.${opM && b < 0 ? ' Subtracting a negative number turned into a step to the right!' : opM ? ' Subtracting means moving left.' : b < 0 ? ' Adding a negative means moving left.' : ''}`,
        `Начинаем с ${fmt(a)} (синяя точка), ${d >= 0 ? `идём на ${d} вправо` : `идём на ${-d} влево`} - попадаем в ${fmt(r)}.${opM && b < 0 ? ' Вычитание отрицательного числа превратилось в шаг вправо!' : opM ? ' Вычитать - значит идти влево.' : b < 0 ? ' Прибавить отрицательное - значит идти влево.' : ''}`,
        `${fmt(a)}-ден бастаймыз (көк нүкте), ${d >= 0 ? `оңға ${d} жүреміз` : `солға ${-d} жүреміз`} - ${fmt(r)}-ге түсеміз.${opM && b < 0 ? ' Теріс санды азайту оңға қадамға айналды!' : opM ? ' Азайту - солға жүру.' : b < 0 ? ' Терісті қосу - солға жүру.' : ''}`,
      ),
    };
  },
});
function negTaskOut(st, tk, b, svg) {
  const S = ['+', '−', '·'][tk.type];
  const fa = (x) => (x < 0 ? `(${fmt(x)})` : fmt(x));
  const cur = tk.type === 0 ? tk.a + b : tk.type === 1 ? tk.a - b : tk.a * b;
  const ok = check(st, b === tk.B);
  return {
    svg: `${svg}${badge(`${fa(tk.a)} ${S} b = ${fmt(tk.r)}`, ok)}`,
    caption: taskCap(st, ok, L(`Find b: ${fa(tk.a)} ${S} b = ${fmt(tk.r)}.`, `Найди b: ${fa(tk.a)} ${S} b = ${fmt(tk.r)}.`, `b-ны тап: ${fa(tk.a)} ${S} b = ${fmt(tk.r)}.`), L(`Now ${fa(tk.a)} ${S} ${fa(b)} = ${fmt(cur)}.`, `Сейчас ${fa(tk.a)} ${S} ${fa(b)} = ${fmt(cur)}.`, `Қазір ${fa(tk.a)} ${S} ${fa(b)} = ${fmt(cur)}.`)),
  };
}

// ---------- Умножение как площадь ----------

function mulTask(st) {
  const type = rnd(0, 1);
  const a = rnd(3, 12);
  const b = rnd(2, 12);
  st.task = type ? { type, a: a * b + rnd(0, b - 1), b, q: a, done: false } : { type, a, b, done: false };
  if (type) st.task.r = st.task.a - b * a;
  return type ? { a: st.task.a, b: 1 } : { a, b: 1 };
}

const areamul = modes({
  title: L('Multiplication and division', 'Умножение и деление', 'Көбейту және бөлу'),
  intro: L('a × b is the number of cells in an a by b rectangle. Division asks how many full rows of b fit in a.', 'a × b - число клеток в прямоугольнике a на b. Деление спрашивает, сколько полных рядов по b помещается в a.', 'a × b - a-ға b тіктөртбұрыштағы тор саны. Бөлу a-ға b-дан неше толық қатар сыятынын сұрайды.'),
  sliders: [
    { id: 'a', label: 'a', min: 1, max: 30, value: 14, hidden: (v, st) => st.m === 2 },
    { id: 'b', label: 'b', min: 1, max: 12, value: 6 },
  ],
  tabs: [L('Area', 'Площадь', 'Аудан'), L('Division', 'Деление', 'Бөлу'), TASK],
  acts: [{ label: MORE }],
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return mulTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 2) return mulTask(st);
    return st.m ? { a: rnd(10, 30), b: rnd(2, 9) } : { a: rnd(11, 29), b: rnd(3, 12) };
  },
  draw(v, step, st) {
    const tk = st.m === 2 ? (st.task ?? (mulTask(st), st.task)) : null;
    const a = tk ? tk.a : Math.round(v.a);
    const b = Math.round(v.b);
    if (st.m === 1 || tk?.type === 1) {
      const q = Math.floor(a / b);
      const r = a % b;
      const c = Math.min(26, 270 / b, 160 / Math.ceil(a / b));
      let g = '';
      for (let i = 0; i < a; i++) {
        const row = Math.floor(i / b);
        g += box(20 + (i % b) * c, 44 + row * c, c - 2, c - 2, row < q ? (row % 2 ? 'exc-b' : 'exc-p') : 'exc-o', 3, 0.85);
      }
      for (let row = 0; row < q && c >= 10; row++) g += T(20 + b * c + 6, 44 + row * c + c / 2 + 3, row + 1, 'm9 exm-mut ex-start');
      const txt = `${a} : ${b} = ${q}${r ? ` ${u('rem.', 'ост.', 'қалд.')} ${r}` : ''}`;
      if (tk) {
        const ok = check(st, b === tk.b);
        return {
          svg: `${g}${T(160, 28, `${a} : b = ${tk.q} ${u('rem.', 'ост.', 'қалд.')} ${tk.r}`, 'm15')}${badge(`b = ?`, ok)}`,
          caption: taskCap(st, ok, L(`${a} : b = ${tk.q} remainder ${tk.r}. Find b.`, `${a} : b = ${tk.q} (ост. ${tk.r}). Найди b.`, `${a} : b = ${tk.q} (қалдық ${tk.r}). b-ны тап.`), L(`Now ${txt}. Hint: ${a} − ${tk.r} = ${a - tk.r} = b · ${tk.q}.`, `Сейчас ${txt}. Подсказка: ${a} − ${tk.r} = ${a - tk.r} = b · ${tk.q}.`, `Қазір ${txt}. Кеңес: ${a} − ${tk.r} = ${a - tk.r} = b · ${tk.q}.`)),
        };
      }
      return {
        svg: `${g}${T(160, 28, txt, 'm15')}`,
        caption: L(
          `${a} cells in rows of ${b}: ${q} full ${q === 1 ? 'row' : 'rows'}${r ? ` and ${r} left over (orange)` : ''}. ${a} = ${b} · ${q} + ${r}, and the remainder ${r} is always less than ${b}.`,
          `${a} клеток рядами по ${b}: ${q} ${pl(q, 'полный ряд', 'полных ряда', 'полных рядов')}${r ? ` и ${r} в остатке (оранжевые)` : ''}. ${a} = ${b} · ${q} + ${r}, остаток ${r} всегда меньше ${b}.`,
          `${b}-дан қатарға қойылған ${a} тор: ${q} толық қатар${r ? ` және қалдықта ${r} (қызғылт сары)` : ''}. ${a} = ${b} · ${q} + ${r}, қалдық ${r} әрқашан ${b}-дан кіші.`,
        ),
      };
    }
    const c = Math.min(20, 292 / a, 150 / b);
    const ta = a >= 10 ? Math.floor(a / 10) * 10 : 0;
    const tb = b >= 10 ? 10 : 0;
    let g = '';
    for (let y = 0; y < b; y++)
      for (let x = 0; x < a; x++) {
        const cls = x < ta ? (y < tb ? 'exc-b' : 'exc-p') : y < tb ? 'exc-g' : 'exc-o';
        g += box(14 + x * c, 46 + y * c, c - 1.2, c - 1.2, cls, 1.5, 0.75);
      }
    const parts = [];
    if (ta && tb) parts.push([ta, tb]);
    if (ta) parts.push([ta, b - tb]);
    if (tb && a - ta) parts.push([a - ta, tb]);
    if (a - ta && b - tb) parts.push([a - ta, b - tb]);
    const split = parts.filter(([x, y]) => x && y);
    const sum = split.map(([x, y]) => `${x}·${y}`).join(' + ');
    const sumV = split.map(([x, y]) => x * y).join(' + ');
    const svg = `${g}${T(160, 28, `${a} × ${b} = ${tk ? '?' : a * b}`, 'm15')}${split.length > 1 && !tk ? T(160, 210, `${sum} = ${sumV} = ${a * b}`, 'm11') : ''}`;
    if (tk) {
      const ok = check(st, b === tk.b);
      return { svg: `${g}${T(160, 28, `${a} × b = ${a * tk.b}`, 'm15')}${T(160, 210, `${a} × ${b} = ${a * b}`, `m12 tc ${ok ? 'exc-g' : 'exc-o'}`)}${badge('b = ?', ok)}`, caption: taskCap(st, ok, L(`Find the missing factor: ${a} × b = ${a * tk.b}.`, `Найди пропущенный множитель: ${a} × b = ${a * tk.b}.`, `Жетіспейтін көбейткішті тап: ${a} × b = ${a * tk.b}.`), L(`Now ${a} × ${b} = ${a * b}. Hint: b = ${a * tk.b} : ${a}.`, `Сейчас ${a} × ${b} = ${a * b}. Подсказка: b = ${a * tk.b} : ${a}.`, `Қазір ${a} × ${b} = ${a * b}. Кеңес: b = ${a * tk.b} : ${a}.`)) };
    }
    return {
      svg,
      caption: split.length > 1
        ? L(`Split the rectangle into easy parts: ${sum} = ${sumV} = ${a * b}. This is the distributive law: (x + y)·z = x·z + y·z.`, `Разрежем прямоугольник на удобные части: ${sum} = ${sumV} = ${a * b}. Это распределительный закон: (x + y)·z = x·z + y·z.`, `Тіктөртбұрышты ыңғайлы бөліктерге бөлеміз: ${sum} = ${sumV} = ${a * b}. Бұл үлестірімділік заңы: (x + y)·z = x·z + y·z.`)
        : L(`${a} × ${b} = ${a * b} cells. Swap the factors - the rectangle turns, the area stays.`, `${a} × ${b} = ${a * b} клеток. От перестановки множителей прямоугольник поворачивается, а площадь та же.`, `${a} × ${b} = ${a * b} тор. Көбейткіштердің орнын ауыстырсаң, тіктөртбұрыш бұрылады, аудан сол.`),
    };
  },
});