// ---------- Десятичные дроби ----------

/** Сетка 10×10 для числа k сотых: столбики-десятые синие, остаток оранжевый. */
function hundredths(k, x, y, c, one = 'exc-b', rest = 'exc-o') {
  let g = '';
  const t = Math.floor(k / 10);
  for (let i = 0; i < 100; i++) {
    const col = Math.floor(i / 10);
    const row = i % 10;
    const on = i < k;
    g += box(x + col * c, y + (9 - row) * c, c - 1.2, c - 1.2, on ? (col < t ? one : rest) : 'exm-off', 1.5, on ? 0.9 : 1);
  }
  return g;
}

function decTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let k;
  let tag;
  if (type === 0) {
    k = rnd(1, 99);
    tag = `${Math.floor(k / 10)}/10 + ${k % 10}/100`;
  } else if (type === 1) {
    const [p, q] = pick([[1, 4], [3, 4], [1, 5], [2, 5], [1, 2], [7, 20], [3, 25], [9, 10]]);
    k = (100 * p) / q;
    tag = `${p}/${q}`;
  } else if (type === 2) {
    k = rnd(1, 99);
    tag = `${k}%`;
  } else {
    const a = rnd(10, 80);
    const d = pick([5, 7, 10, 12, 15]);
    k = a + d;
    tag = `${fmt(a / 100)} + ${fmt(d / 100)}`;
  }
  st.task = { type, k, tag, done: false };
  return { x: 0 };
}

const decimals = modes({
  title: L('Decimals: tenths and hundredths', 'Десятичные дроби: десятые и сотые', 'Ондық бөлшектер: ондықтар мен жүздіктер'),
  intro: L('A square of 100 cells: one cell is 0.01, a column of ten is 0.1. Compare decimals digit by digit from the left.', 'Квадрат из 100 клеток: одна клетка - 0,01, столбик из десяти - 0,1. Десятичные дроби сравнивают по разрядам слева направо.', '100 торлы шаршы: бір тор - 0,01, оннан тұратын баған - 0,1. Ондық бөлшектерді разрядтар бойынша солдан оңға салыстырады.'),
  sliders: [
    { id: 'x', label: 'x', min: 0, max: 1, step: 0.01, value: 0.37 },
    { id: 'y', label: 'y', min: 0, max: 1, step: 0.01, value: 0.5, hidden: only(2) },
  ],
  tabs: [L('Hundredths', 'Сотые', 'Жүздіктер'), L('Zoom', 'Лупа', 'Лупа'), L('Compare', 'Сравнить', 'Салыстыру'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return decTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return decTask(st);
    st.pre = (st.pre + 1) % 4;
    return st.m === 2 ? [{ x: 0.5, y: 0.45 }, { x: 0.3, y: 0.29 }, { x: 0.7, y: 0.7 }, { x: 0.08, y: 0.8 }][st.pre] : { x: [0.05, 0.5, 0.75, 0.37][st.pre] };
  },
  draw(v, step, st) {
    const k = Math.round(v.x * 100);
    const t = Math.floor(k / 10);
    const h = k % 10;
    const X = fmt(k / 100);
    if (st.m === 1) {
      const top = numLine(0, 1, 20, 300, 60, 0.1, 0.1, (q) => fmt(q, 1));
      const lo = Math.min(t, 9) / 10;
      const zx0 = top.sx(lo);
      const zx1 = top.sx(lo + 0.1);
      const bot = numLine(lo, lo + 0.1, 20, 300, 150, 0.01, 0.01, (q) => (Math.abs(q * 100 - Math.round(q * 100)) < 1e-6 ? fmt(q) : ''));
      return {
        svg: `${top.svg}${soft(zx0, 52, zx1 - zx0, 16, 'exc-y', 3)}${pth(`M${n1(zx0)} 68 L20 140 M${n1(zx1)} 68 L300 140`, 'exc-m ex-dash', 1)}${bot.svg}${dot(top.sx(k / 100), 60, 5, 'exc-p')}${k / 100 <= lo + 0.1 + 1e-9 ? dot(bot.sx(k / 100), 150, 6, 'exc-p') : ''}${T(160, 24, `x = ${X}`, 'm18')}${T(160, 196, `${X} = ${fmt(t / 10, 1)} + ${fmt(h / 100)}`, 'm12 tc exc-p')}`,
        caption: L(
          `The top line is cut into tenths. Zoom into the piece from ${fmt(lo, 1)} to ${fmt(lo + 0.1, 1)}: it is cut into 10 hundredths. ${X} is ${t} tenths and ${h} hundredths.`,
          `Верхняя прямая разбита на десятые. Увеличим кусок от ${fmt(lo, 1)} до ${fmt(lo + 0.1, 1)}: он делится на 10 сотых. ${X} - это ${t} десятых и ${h} сотых.`,
          `Жоғарғы түзу ондықтарға бөлінген. ${fmt(lo, 1)}-ден ${fmt(lo + 0.1, 1)}-ге дейінгі бөлікті үлкейтейік: ол 10 жүздікке бөлінеді. ${X} - ${t} ондық және ${h} жүздік.`,
        ),
      };
    }
    if (st.m === 2) {
      const ky = Math.round(v.y * 100);
      const s = k === ky ? '=' : k > ky ? '>' : '<';
      const pad = (q) => fmt(q / 100).padEnd(4, '0');
      const firstDiff = Math.floor(k / 10) !== Math.floor(ky / 10) ? 1 : 2;
      return {
        svg: `${hundredths(k, 16, 40, 12)}${hundredths(ky, 192, 40, 12, 'exc-g', 'exc-k')}${T(76, 30, `x = ${pad(k)}`, 'm12')}${T(252, 30, `y = ${pad(ky)}`, 'm12')}${T(160, 100, s, 'm18')}${T(160, 188, `${pad(k)} ${s} ${pad(ky)}`, 'm18')}${T(160, 208, `${k}/100 ${s} ${ky}/100`, 'm11 exm-mut')}`,
        caption:
          s === '='
            ? L(`${pad(k)} = ${pad(ky)}: the same number of cells.`, `${pad(k)} = ${pad(ky)}: одинаковое число клеток.`, `${pad(k)} = ${pad(ky)}: торлар саны бірдей.`)
            : L(
                `Write both with two digits after the comma: ${pad(k)} and ${pad(ky)}. Compare from the left: the first difference is in the ${firstDiff === 1 ? 'tenths' : 'hundredths'}, so x ${s} y. A longer decimal is not always bigger: 0,5 > 0,45!`,
                `Запишем обе дроби с двумя знаками: ${pad(k)} и ${pad(ky)}. Сравниваем слева направо: первое различие в ${firstDiff === 1 ? 'десятых' : 'сотых'}, значит x ${s} y. Длинная запись не значит больше: 0,5 > 0,45!`,
                `Екеуін үтірден кейін екі цифрмен жазамыз: ${pad(k)} және ${pad(ky)}. Солдан оңға салыстырамыз: алғашқы айырмашылық ${firstDiff === 1 ? 'ондықтарда' : 'жүздіктерде'}, демек x ${s} y. Ұзын жазба үлкен деген сөз емес: 0,5 > 0,45!`,
              ),
      };
    }
    const pic = `${hundredths(k, 16, 22, 17)}${T(254, 60, X, 'm18 tc exc-p')}${T(254, 90, `= ${fmt(t / 10, 1)} + ${fmt(h / 100)}`, 'm12')}${T(254, 114, `= ${k}/100`, 'm12')}${frs(k, 100) !== `${k}/100` && k ? T(254, 138, `= ${frs(k, 100)}`, 'm12') : ''}${T(254, 162, `= ${k}%`, 'm12')}`;
    if (st.m === 3) {
      const tk = st.task ?? (decTask(st), st.task);
      const ok = check(st, k === tk.k);
      const ask = [
        L(`Show the number ${tk.tag} as a decimal.`, `Покажи число ${tk.tag} десятичной дробью.`, `${tk.tag} санын ондық бөлшекпен көрсет.`),
        L(`Write the fraction ${tk.tag} as a decimal.`, `Запиши дробь ${tk.tag} десятичной.`, `${tk.tag} бөлшегін ондық түрде жаз.`),
        L(`Show ${tk.tag} as a decimal.`, `Покажи ${tk.tag} десятичной дробью.`, `${tk.tag}-ды ондық бөлшекпен көрсет.`),
        L(`Find ${tk.tag}.`, `Найди ${tk.tag}.`, `${tk.tag} тап.`),
      ][tk.type];
      const hint = [
        L('Columns are tenths, single cells are hundredths.', 'Столбики - десятые, отдельные клетки - сотые.', 'Бағандар - ондықтар, жеке торлар - жүздіктер.'),
        L('Hint: make the denominator 100.', 'Подсказка: сделай знаменатель 100.', 'Кеңес: бөлімді 100 ет.'),
        L('Hint: p% = p/100.', 'Подсказка: p% = p/100.', 'Кеңес: p% = p/100.'),
        L('Hint: add hundredths to hundredths, carry 10 of them into a tenth.', 'Подсказка: складывай сотые с сотыми, 10 сотых - это одна десятая.', 'Кеңес: жүздікті жүздікке қос, 10 жүздік - бір ондық.'),
      ][tk.type];
      return { svg: `${pic}${badge(tk.tag, ok)}`, caption: taskCap(st, ok, ask, J(L(`Now x = ${X}.`, `Сейчас x = ${X}.`, `Қазір x = ${X}.`), hint)) };
    }
    return {
      svg: pic,
      caption: L(`${X} is ${t} tenths (blue columns) and ${h} hundredths (orange cells): ${k} cells of 100, that is ${k}/100 = ${k}%.`, `${X} - это ${t} десятых (синие столбики) и ${h} сотых (оранжевые клетки): ${k} клеток из 100, то есть ${k}/100 = ${k}%.`, `${X} - ${t} ондық (көк бағандар) және ${h} жүздік (қызғылт сары торлар): 100-ден ${k} тор, яғни ${k}/100 = ${k}%.`),
    };
  },
});

// ---------- Отношения и пропорции ----------

function ratioTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    let p;
    let q;
    let T0;
    do {
      p = rnd(1, 5);
      q = rnd(1, 5);
      T0 = (p + q) * rnd(2, 20) * 10;
    } while (p === q || T0 > 1000);
    t = { p, q, T0, w: (T0 / (p + q)) * q };
  } else if (type === 1) {
    let p;
    let q;
    let k;
    do {
      p = rnd(1, 5);
      q = rnd(1, 7);
      k = rnd(2, 12) * 10;
    } while (p === q || (p + q) * k > 1000);
    t = { p, q, k, T0: (p + q) * k, water: q * k };
  } else {
    const p = rnd(1, 4);
    let q;
    do q = rnd(1, 4);
    while (gcd(p, q) !== 1 || p === q);
    const m = Math.max(p, q) <= 3 ? rnd(2, 3) : 2;
    t = { p, q, P: p * m, Q: q * m };
  }
  st.task = { type, done: false, ...t };
  return type === 2 ? { p: t.P, q: t.Q } : { p: t.p, q: t.q, T: 100 };
}

const ratio = modes({
  title: L('Ratio and proportion', 'Отношения и пропорции', 'Қатынас және пропорция'),
  intro: L('A ratio 2 : 3 means 2 parts of one thing for every 3 parts of another. Multiply both parts by the same number - the ratio stays.', 'Отношение 2 : 3 - на каждые 2 части одного приходится 3 части другого. Умножь обе части на одно число - отношение не изменится.', '2 : 3 қатынасы - біреуінің әр 2 бөлігіне екіншісінің 3 бөлігі келеді. Екеуін бір санға көбейтсең - қатынас өзгермейді.'),
  sliders: [
    { id: 'p', label: L('juice parts', 'частей сока', 'шырын бөлігі'), min: 1, max: 9, value: 2 },
    { id: 'q', label: L('water parts', 'частей воды', 'су бөлігі'), min: 1, max: 9, value: 3 },
    { id: 'T', label: L('total, ml', 'всего, мл', 'барлығы, мл'), min: 10, max: 1000, step: 10, value: 500, hidden: (v, st) => st.m === 3 && st.task?.type === 2 },
  ],
  tabs: [L('Divide', 'Разделить', 'Бөлу'), L('Proportion', 'Пропорция', 'Пропорция'), L('Simplify', 'Сократить', 'Қысқарту'), TASK],
  acts: [{ label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return ratioTask(st);
    return null;
  },
  onAct(j, st) {
    if (st.m === 3) return ratioTask(st);
    st.pre = (st.pre + 1) % 4;
    return [{ p: 1, q: 4, T: 250 }, { p: 3, q: 5, T: 400 }, { p: 6, q: 9, T: 600 }, { p: 2, q: 3, T: 500 }][st.pre];
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (ratioTask(st), st.task)) : null;
    const p = Math.round(v.p);
    const q = Math.round(v.q);
    const T0 = v.T;
    const ml = u('ml', 'мл', 'мл');
    const g = gcd(p, q);
    if (st.m === 1) {
      const juice = T0;
      const k = juice / p;
      const water = k * q;
      const bw = 26;
      const row1 = Array.from({ length: p + q }, (_, i) => box(20 + i * bw, 40, bw - 3, 24, i < p ? 'exc-o' : 'exc-b', 4, 0.85)).join('');
      const sc = 280 / Math.max(juice + water, 1);
      return {
        svg: `${T(20, 32, `${u('recipe', 'рецепт', 'рецепт')} ${p} : ${q}`, 'm11 ex-start')}${row1}${T(20, 104, `${u('we have', 'есть', 'бар')} ${fmt(juice)} ${ml} ${u('of juice', 'сока', 'шырын')}`, 'm11 ex-start')}${box(20, 112, juice * sc, 24, 'exc-o', 4, 0.85)}${box(20 + juice * sc, 112, water * sc, 24, 'exc-b', 4, 0.5)}${T(20 + juice * sc + (water * sc) / 2, 129, `x = ${fmt(water)}`, 'm11 h')}
          ${T(160, 172, `${p} : ${q} = ${fmt(juice)} : x`, 'm15')}${T(160, 198, `x = ${fmt(juice)} · ${q} : ${p} = ${fmt(water)} ${ml}`, 'm12 tc exc-b')}`,
        caption: L(
          `Proportion ${p} : ${q} = ${fmt(juice)} : x. The juice grew ${fmt(k)} times (${fmt(juice)} : ${p}), so the water grows ${fmt(k)} times too: x = ${q} · ${fmt(k)} = ${fmt(water)} ${ml}. Cross rule: ${p}·x = ${q}·${fmt(juice)}.`,
          `Пропорция ${p} : ${q} = ${fmt(juice)} : x. Сока стало в ${fmt(k)} раз больше (${fmt(juice)} : ${p}), значит и воды в ${fmt(k)} раз больше: x = ${q} · ${fmt(k)} = ${fmt(water)} ${ml}. Крест-накрест: ${p}·x = ${q}·${fmt(juice)}.`,
          `Пропорция ${p} : ${q} = ${fmt(juice)} : x. Шырын ${fmt(k)} есе көбейді (${fmt(juice)} : ${p}), демек су да ${fmt(k)} есе көбейеді: x = ${q} · ${fmt(k)} = ${fmt(water)} ${ml}. Айқастыра: ${p}·x = ${q}·${fmt(juice)}.`,
        ),
      };
    }
    if (st.m === 2 || tk?.type === 2) {
      const bw = Math.min(30, 280 / (p + q));
      const row = (P, Q, y) => Array.from({ length: P + Q }, (_, i) => box(20 + i * bw, y, bw - 3, 26, i < P ? 'exc-o' : 'exc-b', 4, 0.85)).join('');
      let groups = '';
      if (g > 1) for (let i = 0; i < g; i++) groups += `<rect class="ex-stroke exc-g ex-dash" style="fill:none;stroke-width:1.5" x="${n1(18 + (i * (p / g)) * bw)}" y="36" width="${n1((p / g) * bw - 1)}" height="30" rx="5"/><rect class="ex-stroke exc-g ex-dash" style="fill:none;stroke-width:1.5" x="${n1(18 + (p + (i * q) / g) * bw)}" y="36" width="${n1((q / g) * bw - 1)}" height="30" rx="5"/>`;
      const svg = `${row(p, q, 38)}${groups}${row(p / g, q / g, 110)}${T(20, 30, `${p} : ${q}`, 'm12 ex-start')}${T(20, 102, `= ${p / g} : ${q / g}`, 'm12 ex-start tc exc-g')}${T(160, 180, `${p} : ${q} = (${p} : ${g}) : (${q} : ${g}) = ${p / g} : ${q / g}`, 'm12')}`;
      if (tk) {
        const ok = check(st, p === tk.p && q === tk.q);
        return { svg: `${svg}${badge(`${tk.P} : ${tk.Q} = ?`, ok)}`, caption: taskCap(st, ok, L(`Simplify the ratio ${tk.P} : ${tk.Q} - set it with the sliders.`, `Сократи отношение ${tk.P} : ${tk.Q} - выставь его ползунками.`, `${tk.P} : ${tk.Q} қатынасын қысқарт - жүгірткілермен қой.`), L(`Now ${p} : ${q}. Hint: divide both by gcd(${tk.P}, ${tk.Q}) = ${gcd(tk.P, tk.Q)}.`, `Сейчас ${p} : ${q}. Подсказка: раздели оба на НОД(${tk.P}, ${tk.Q}) = ${gcd(tk.P, tk.Q)}.`, `Қазір ${p} : ${q}. Кеңес: екеуін ЕҮОБ(${tk.P}, ${tk.Q}) = ${gcd(tk.P, tk.Q)}-ге бөл.`)) };
      }
      return {
        svg,
        caption: g > 1
          ? L(`Both parts divide by gcd(${p}, ${q}) = ${g}: the green groups. ${p} : ${q} = ${p / g} : ${q / g} - the same mix, just fewer, bigger parts.`, `Обе части делятся на НОД(${p}, ${q}) = ${g} - зелёные группы. ${p} : ${q} = ${p / g} : ${q / g} - та же смесь, только частей меньше, и они крупнее.`, `Екі бөлік те ЕҮОБ(${p}, ${q}) = ${g}-ге бөлінеді - жасыл топтар. ${p} : ${q} = ${p / g} : ${q / g} - сол қоспа, тек бөліктері аз әрі ірі.`)
          : L(`gcd(${p}, ${q}) = 1: the ratio ${p} : ${q} cannot be simplified.`, `НОД(${p}, ${q}) = 1: отношение ${p} : ${q} уже несократимо.`, `ЕҮОБ(${p}, ${q}) = 1: ${p} : ${q} қатынасы қысқармайды.`),
      };
    }
    const part = T0 / (p + q);
    const w = 280 / (p + q);
    const blocks2 = Array.from({ length: p + q }, (_, i) => `${box(20 + i * w, 70, w - 3, 46, i < p ? 'exc-o' : 'exc-b', 6, 0.85)}${w > 26 ? T(20 + i * w + w / 2 - 1.5, 98, fmt(part, 1), 'm9 exm-on') : ''}`).join('');
    const svg = `${T(160, 34, `${p} : ${q}`, 'm18')}${T(160, 56, `${fmt(T0)} ${ml}`, 'm11 exm-mut')}${blocks2}${T(20 + (p * w) / 2, 134, `${u('juice', 'сок', 'шырын')} ${fmt(part * p, 1)}`, 'm11 tc exc-o')}${T(20 + p * w + (q * w) / 2, 134, `${u('water', 'вода', 'су')} ${fmt(part * q, 1)}`, 'm11 tc exc-b')}${T(160, 176, `${u('one part', 'одна часть', 'бір бөлік')} = ${fmt(T0)} : ${p + q} = ${fmt(part, 2)}`, 'm12')}`;
    if (tk) {
      const ok = check(st, p === tk.p && q === tk.q && near(T0, tk.T0, 0.01));
      const ask = tk.type === 0
        ? L(`Juice : water = ${tk.p} : ${tk.q}, the water is ${fmt(tk.w)} ml. How much drink in total? Set the total.`, `Сок : вода = ${tk.p} : ${tk.q}, воды ${fmt(tk.w)} мл. Сколько всего напитка? Установи «всего».`, `Шырын : су = ${tk.p} : ${tk.q}, су ${fmt(tk.w)} мл. Барлық сусын қанша? «Барлығы» мәнін орнат.`)
        : L(`Juice : water = ${tk.p} : ${tk.q}. There should be ${fmt(tk.water)} ml of water. Find the total.`, `Сок : вода = ${tk.p} : ${tk.q}. Воды должно быть ${fmt(tk.water)} мл. Найди общий объём.`, `Шырын : су = ${tk.p} : ${tk.q}. Су ${fmt(tk.water)} мл болуы керек. Жалпы көлемді тап.`);
      const wv = tk.type === 0 ? tk.w : tk.water;
      return { svg: `${svg}${badge(`${u('water', 'вода', 'су')} = ${fmt(wv)}`, ok)}`, caption: taskCap(st, ok, ask, L(`Now the water is ${fmt(part * q, 1)} ml. Hint: one part = ${fmt(wv)} : ${tk.q}.`, `Сейчас воды ${fmt(part * q, 1)} мл. Подсказка: одна часть = ${fmt(wv)} : ${tk.q}.`, `Қазір су ${fmt(part * q, 1)} мл. Кеңес: бір бөлік = ${fmt(wv)} : ${tk.q}.`)) };
    }
    return {
      svg,
      caption: L(`${fmt(T0)} ml in the ratio ${p} : ${q}: that is ${p + q} equal parts of ${fmt(part, 2)} ml. Juice ${p} parts = ${fmt(part * p, 1)} ml, water ${q} parts = ${fmt(part * q, 1)} ml.`, `${fmt(T0)} мл в отношении ${p} : ${q}: это ${p + q} равных частей по ${fmt(part, 2)} мл. Сок - ${p} ч. = ${fmt(part * p, 1)} мл, вода - ${q} ч. = ${fmt(part * q, 1)} мл.`, `${fmt(T0)} мл, қатынасы ${p} : ${q}: бұл ${fmt(part, 2)} мл-ден ${p + q} тең бөлік. Шырын ${p} бөлік = ${fmt(part * p, 1)} мл, су ${q} бөлік = ${fmt(part * q, 1)} мл.`),
    };
  },
});

// ---------- Простые числа, НОД и НОК ----------

const factors = (n) => {
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) while (m % p === 0) {
    out.push(p);
    m /= p;
  }
  if (m > 1) out.push(m);
  return out;
};
const isPrime = (n) => n > 1 && factors(n).length === 1;
const powForm = (fs) => {
  const c = new Map();
  for (const p of fs) c.set(p, (c.get(p) ?? 0) + 1);
  return [...c.entries()].map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : p)).join('·');
};

function sieveTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const [lo, hi] = pick([[90, 100], [20, 28], [50, 60], [110, 120], [30, 36], [62, 70]]);
    t = { lo, hi, m: 1 };
  } else if (type === 1) {
    const n = pick([60, 72, 90, 84, 100, 48, 120, 108]);
    t = { n, m: 1 };
  } else {
    const [a, g] = pick([[12, 4], [18, 6], [24, 8], [30, 10], [36, 12], [20, 5]]);
    t = { a, g, m: 2 };
  }
  st.task = { type, done: false, ...t };
  return type === 2 ? { a: t.a, b: 2 } : { a: 2 };
}

const sieve = modes({
  title: L('Primes, GCD and LCM', 'Простые числа, НОД и НОК', 'Жай сандар, ЕҮОБ және ЕКОЕ'),
  intro: L('A prime has exactly two divisors: 1 and itself. Every number splits into primes - that gives GCD and LCM at once.', 'У простого числа ровно два делителя: 1 и оно само. Любое число раскладывается на простые множители - отсюда сразу НОД и НОК.', 'Жай санның дәл екі бөлгіші бар: 1 және өзі. Кез келген сан жай көбейткіштерге жіктеледі - ЕҮОБ пен ЕКОЕ осыдан шығады.'),
  sliders: [
    { id: 'a', label: 'a', min: 2, max: 120, value: 84, hidden: (v, st) => st.m === 0 || (st.m === 3 && st.task?.type === 2) },
    { id: 'b', label: 'b', min: 2, max: 120, value: 90, hidden: (v, st) => !(st.m === 2 || (st.m === 3 && st.task?.type === 2)) },
  ],
  tabs: [L('Sieve', 'Решето', 'Елек'), L('Factors', 'Разложение', 'Жіктеу'), L('GCD and LCM', 'НОД и НОК', 'ЕҮОБ және ЕКОЕ'), TASK],
  acts: [{ label: L('Next prime', 'Следующее простое', 'Келесі жай сан'), only: [0] }, { label: L('▶ All', '▶ Всё', '▶ Барлығы'), only: [0] }, { label: RESET, only: [0] }, { label: MORE, only: [1, 2, 3] }],
  state: () => ({ done: [] }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return sieveTask(st);
    return null;
  },
  onAct(j, st, v, api) {
    const next = () => {
      const p = [2, 3, 5, 7].find((x) => !st.done.includes(x));
      if (p) st.done.push(p);
      return Boolean(p);
    };
    if (j === 0) next();
    else if (j === 1) api.run(() => next(), 700);
    else if (j === 2) {
      api.stop();
      st.done = [];
    } else {
      if (st.m === 3) return sieveTask(st);
      return st.m === 1 ? { a: pick([36, 48, 60, 72, 84, 90, 96, 100, 105, 112, 120]) } : pick([{ a: 12, b: 18 }, { a: 24, b: 36 }, { a: 15, b: 28 }, { a: 42, b: 56 }, { a: 8, b: 12 }]);
    }
    return null;
  },
  draw(v, step, st) {
    if (st.m === 0) {
      const crossedBy = (n) => st.done.find((p) => n !== p && n % p === 0);
      const COL = { 2: 'exc-r', 3: 'exc-o', 5: 'exc-b', 7: 'exc-k' };
      const cells = Array.from({ length: 100 }, (_, i) => {
        const n = i + 1;
        const by = crossedBy(n);
        const prime = n > 1 && !by && (st.done.length === 4 || st.done.includes(n));
        const x = 12 + (i % 10) * 30;
        const y = 8 + Math.floor(i / 10) * 20.5;
        return `${prime ? box(x + 2, y + 1, 26, 17, 'exc-g', 5, 0.3) : ''}${T(x + 15, y + 14, n, `m10 ${n === 1 ? 'exm-mut' : by ? `tc ${COL[by]}` : prime ? 'tc exc-g' : ''}`)}${by ? ln(x + 6, y + 10, x + 24, y + 10, COL[by], 1.3) : ''}`;
      }).join('');
      const left = Array.from({ length: 99 }, (_, i) => i + 2).filter((n) => !crossedBy(n)).length;
      const nx = [2, 3, 5, 7].find((x) => !st.done.includes(x));
      return {
        svg: cells,
        caption: st.done.length
          ? L(`Crossed out the multiples of ${st.done.join(', ')} (each prime has its colour). ${nx ? `${left} numbers are left. Next: ${nx}.` : `The ${left} green numbers are all the primes up to 100. It was enough to sieve by primes up to √100 = 10.`}`, `Вычеркнули кратные ${st.done.join(', ')} (у каждого простого свой цвет). ${nx ? `Осталось ${left} чисел. Дальше: ${nx}.` : `${left} зелёных чисел - все простые числа до 100. Хватило просеять простыми до √100 = 10.`}`, `${st.done.join(', ')}-ге еселілер сызылды (әр жай санның өз түсі). ${nx ? `${left} сан қалды. Келесі: ${nx}.` : `${left} жасыл сан - 100-ге дейінгі барлық жай сандар. √100 = 10-ға дейінгі жай сандармен електен өткізу жеткілікті болды.`}`)
          : L('1 is neither prime nor composite. Press "Next prime": 2 stays, all its multiples are crossed out.', '1 - ни простое, ни составное. Нажми «Следующее простое»: 2 остаётся, все кратные ему вычёркиваем.', '1 - жай да, құрама да емес. «Келесі жай сан» бас: 2 қалады, оған еселілердің бәрін сызамыз.'),
      };
    }
    const tk = st.m === 3 ? (st.task ?? (sieveTask(st), st.task)) : null;
    const a = Math.round(v.a);
    const b = Math.round(v.b);
    if (st.m === 2 || tk?.type === 2) {
      const A = tk ? tk.a : a;
      const fa = factors(A);
      const fb = factors(b);
      const common = [];
      const restB = [...fb];
      const onlyA = [];
      for (const p of fa) {
        const i = restB.indexOf(p);
        if (i >= 0) {
          common.push(p);
          restB.splice(i, 1);
        } else onlyA.push(p);
      }
      const G = common.reduce((s, x) => s * x, 1);
      const Lc = (A * b) / G;
      const place = (arr, cx, cls) => arr.map((p, i) => T(cx + ((i % 2) - 0.5) * 22 * (arr.length > 1 ? 1 : 0), 94 + Math.floor(i / 2) * 20 - (Math.ceil(arr.length / 2) - 1) * 10, p, `m15 tc ${cls}`)).join('');
      const svg = `<circle class="exm-soft exc-o" cx="118" cy="92" r="66"/><circle class="exm-soft exc-b" cx="202" cy="92" r="66"/>${place(onlyA, 90, 'exc-o')}${place(common, 160, 'exc-p')}${place(restB, 230, 'exc-b')}
        ${T(70, 20, `${A} = ${powForm(fa)}`, 'm11 tc exc-o')}${T(250, 20, `${b} = ${powForm(fb)}`, 'm11 tc exc-b')}
        ${T(160, 184, `${u('GCD', 'НОД', 'ЕҮОБ')}(${A}, ${b}) = ${common.length ? common.join('·') : '1'} = ${G}`, 'm12 tc exc-p')}${T(160, 206, `${u('LCM', 'НОК', 'ЕКОЕ')} = ${[...onlyA, ...common, ...restB].sort((x, y) => x - y).join('·')} = ${Lc}`, 'm12')}`;
      if (tk) {
        const ok = check(st, G === tk.g);
        return { svg: `${svg}${badge(`${u('GCD', 'НОД', 'ЕҮОБ')}(${tk.a}, b) = ${tk.g}`, ok)}`, caption: taskCap(st, ok, L(`Find a number b such that gcd(${tk.a}, b) = ${tk.g}.`, `Подбери число b, чтобы НОД(${tk.a}, b) = ${tk.g}.`, `ЕҮОБ(${tk.a}, b) = ${tk.g} болатындай b санын таңда.`), L(`Now gcd = ${G}. The common primes (middle) must multiply to ${tk.g} = ${powForm(factors(tk.g))}.`, `Сейчас НОД = ${G}. Общие простые (в середине) должны дать ${tk.g} = ${powForm(factors(tk.g))}.`, `Қазір ЕҮОБ = ${G}. Ортақ жай сандар (ортада) ${tk.g} = ${powForm(factors(tk.g))} беруі керек.`)) };
      }
      return {
        svg,
        caption: L(
          `Common prime factors are in the middle: their product is GCD = ${G}. LCM takes every factor once from the whole picture: ${Lc}. Check: GCD · LCM = ${G}·${Lc} = ${A * b} = a·b.${G === 1 ? ' GCD = 1: the numbers are coprime.' : ''}`,
          `Общие простые множители - в середине: их произведение - НОД = ${G}. НОК берёт каждый множитель со всей картинки по одному разу: ${Lc}. Проверка: НОД · НОК = ${G}·${Lc} = ${A * b} = a·b.${G === 1 ? ' НОД = 1: числа взаимно простые.' : ''}`,
          `Ортақ жай көбейткіштер ортада: олардың көбейтіндісі - ЕҮОБ = ${G}. ЕКОЕ барлық суреттегі әр көбейткішті бір реттен алады: ${Lc}. Тексеру: ЕҮОБ · ЕКОЕ = ${G}·${Lc} = ${A * b} = a·b.${G === 1 ? ' ЕҮОБ = 1: сандар өзара жай.' : ''}`,
        ),
      };
    }
    // дерево множителей
    const fs = factors(a);
    let g = '';
    let cur = a;
    let x = 150;
    let y = 22;
    const dx = 26;
    const dy = 26;
    g += `${box(x - 18, y - 13, 36, 18, 'exc-p', 6, 0.18)}${T(x, y, a, 'm12')}`;
    fs.forEach((p, i) => {
      if (i === fs.length - 1) return;
      cur /= p;
      const lx = x - dx;
      const rx = x + dx;
      const ny = y + dy;
      g += ln(x - 4, y + 4, lx + 3, ny - 11, 'exc-m', 1.2) + ln(x + 4, y + 4, rx - 3, ny - 11, 'exc-m', 1.2);
      g += `${dot(lx, ny - 4, 11, 'exc-g')}${T(lx, ny, p, 'm11 exm-on')}${T(rx, ny, cur, i === fs.length - 2 ? 'm11' : 'm11')}`;
      if (i === fs.length - 2) g += `${dot(rx, ny - 4, 11, 'exc-g')}${T(rx, ny, cur, 'm11 exm-on')}`;
      x = rx;
      y = ny;
    });
    if (fs.length === 1) g += T(150, 52, u('prime!', 'простое!', 'жай сан!'), 'm12 tc exc-g');
    const formula = `${a} = ${fs.join('·')}${fs.length > 1 && powForm(fs) !== fs.join('·') ? ` = ${powForm(fs)}` : ''}`;
    const divs = Array.from({ length: a }, (_, i) => i + 1).filter((d) => a % d === 0);
    const svg = `${g}${T(160, 192, formula, 'm12 tc exc-p')}${T(160, 212, `${u('divisors', 'делители', 'бөлгіштер')}: ${divs.length > 12 ? `${divs.slice(0, 12).join(', ')}…` : divs.join(', ')} (${divs.length})`, 'm9 exm-mut')}`;
    if (tk) {
      const ok = check(st, tk.type === 0 ? isPrime(a) && a > tk.lo && a < tk.hi : a === tk.n);
      const ask = tk.type === 0 ? L(`Find a prime number between ${tk.lo} and ${tk.hi}.`, `Найди простое число между ${tk.lo} и ${tk.hi}.`, `${tk.lo} мен ${tk.hi} арасындағы жай санды тап.`) : L(`Which number factors as ${powForm(factors(tk.n))}?`, `Какое число раскладывается как ${powForm(factors(tk.n))}?`, `Қай сан ${powForm(factors(tk.n))} болып жіктеледі?`);
      return { svg: `${svg}${badge(tk.type === 0 ? `${tk.lo} < p < ${tk.hi}` : powForm(factors(tk.n)), ok)}`, caption: taskCap(st, ok, ask, L(`Now ${formula}.`, `Сейчас ${formula}.`, `Қазір ${formula}.`)) };
    }
    return {
      svg,
      caption: fs.length === 1
        ? L(`${a} is prime: no divisors except 1 and ${a}.`, `${a} - простое: делителей, кроме 1 и ${a}, нет.`, `${a} - жай сан: 1 мен ${a}-тен басқа бөлгіші жоқ.`)
        : L(`Split off the smallest prime each time: ${formula}. Green circles are primes - they cannot be split. ${a} has ${divs.length} divisors.`, `Каждый раз отделяем наименьший простой множитель: ${formula}. Зелёные кружки - простые, их не разложить. У ${a} ${divs.length} ${pl(divs.length, 'делитель', 'делителя', 'делителей')}.`, `Әр жолы ең кіші жай көбейткішті бөліп аламыз: ${formula}. Жасыл дөңгелектер - жай сандар, оларды жіктеу мүмкін емес. ${a} санының ${divs.length} бөлгіші бар.`),
    };
  },
});