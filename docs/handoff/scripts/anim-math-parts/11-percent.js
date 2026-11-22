// ---------- Проценты ----------

/** Сетка 10×10: закрашено p клеток (дробная часть - частично), cls - цвет. */
function grid100(p, x, y, c, cls = 'exc-p') {
  let g = '';
  const full = Math.floor(p + 1e-9);
  for (let i = 0; i < 100; i++) {
    const cx = x + (i % 10) * c;
    const cy = y + Math.floor(i / 10) * c;
    g += `<rect class="ex-fill ${i < full ? cls : 'exm-off'}" x="${n1(cx)}" y="${n1(cy)}" width="${n1(c - 1.2)}" height="${n1(c - 1.2)}" rx="${c > 10 ? 2 : 1}"/>`;
  }
  const part = p - full;
  if (part > 1e-6 && full < 100) g += box(x + (full % 10) * c, y + Math.floor(full / 10) * c, (c - 1.2) * part, c - 1.2, cls, 1);
  return g;
}
/** Две сетки (до 200%) в рамке шириной wd. */
function grids(p, x, y, wd, cls) {
  if (p <= 100) return grid100(p, x, y, wd / 10, cls);
  const c = (wd - 6) / 20;
  return grid100(100, x, y + 40, c, cls) + grid100(p - 100, x + wd / 2 + 3, y + 40, c, 'exc-o') + T(x + wd / 4, y + 34, '100%', 'm10 exm-mut') + T(x + (3 * wd) / 4, y + 34, `+${fmt(p - 100)}%`, 'm10 tc exc-o');
}
/** p% как дробь, если красиво: 25% = 1/4. */
const pctFrac = (p) => {
  const n = Math.round(p * 2);
  if (Math.abs(n - p * 2) > 1e-9) return '';
  const f = frs(n, 200);
  return f.includes('/') && Number(f.split('/')[1]) <= 20 ? f : '';
};

const PCT_PRE = [{ p: 50, N: 300 }, { p: 25, N: 480 }, { p: 10, N: 750 }, { p: 12.5, N: 800 }, { p: 150, N: 200 }, { p: 1, N: 1200 }];

function pctTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  if (type === 0) {
    let N;
    let P;
    do {
      N = pick([200, 400, 500, 800, 50, 120, 250, 600, 1000]);
      P = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 120, 150]);
    } while (((N * P) / 100) % 1);
    st.task = { type, N, P, A: (N * P) / 100, done: false };
    return { N, p: 0 };
  }
  if (type === 1) {
    let X;
    let P;
    do {
      X = rnd(5, 100) * 10;
      P = pick([10, 20, 25, 30, 40, 50, 60, 75, 80]);
    } while (((X * P) / 100) % 1);
    st.task = { type, X, P, A: (X * P) / 100, done: false };
    return { p: P, N: 10 };
  }
  let N;
  let P;
  const up = Math.random() < 0.5;
  do {
    N = pick([200, 400, 500, 800, 1200, 1500, 250, 600]);
    P = pick([5, 10, 15, 20, 25, 30, 40, 50]);
  } while (((N * P) / 100) % 1);
  const M = (N * (100 + (up ? P : -P))) / 100;
  st.task = { type, N, P, M, up, done: false };
  st.sg = up ? 1 : -1;
  return { N, p: 0 };
}

const percent = modes({
  title: L('Percentages', 'Проценты', 'Пайыздар'),
  intro: L('1% is one hundredth of a number. Find a part, a whole, or a change in percent.', '1% - это сотая часть числа. Находим часть, целое и изменение в процентах.', '1% - санның жүзден бір бөлігі. Бөлікті, бүтінді және пайыздық өзгерісті табамыз.'),
  sliders: [
    { id: 'p', label: 'p, %', min: 0, max: 200, step: 0.5, value: 25 },
    { id: 'N', label: L('number N', 'число N', 'N саны'), min: 10, max: 2000, step: 10, value: 400 },
  ],
  tabs: [L('Part', 'Часть', 'Бөлік'), L('Change', 'Изменение', 'Өзгеріс'), L('Whole', 'Целое', 'Бүтін'), TASK],
  acts: [{ label: '+ / −', only: [1] }, { label: MORE }],
  state: () => ({ sg: 1, pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return pctTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 0) {
      st.sg = -st.sg;
      return null;
    }
    if (st.m === 3) return pctTask(st);
    st.pre = (st.pre + 1) % PCT_PRE.length;
    return { ...PCT_PRE[st.pre] };
  },
  draw(v, step, st) {
    const { p, N } = v;
    const one = N / 100;
    const val = (N * p) / 100;
    const fr = pctFrac(p);

    const partView = (pp, NN, cls = 'exc-p', hide = false) => {
      const vv = (NN * pp) / 100;
      const sx = (x) => 12 + (x / Math.max(NN, vv)) * 296;
      return `${grids(pp, 12, 12, 160, cls)}
        ${T(244, 34, `N = ${fmt(NN)}`, 'm12')}${T(244, 56, `1% = ${fmt(NN)} : 100 = ${fmt(NN / 100)}`, 'm10 exm-mut')}
        ${T(244, 92, hide ? '?%' : `${fmt(pp)}%`, 'm18 tc exc-p')}${T(244, 118, `= ${fmt(NN / 100)} · ${hide ? '?' : fmt(pp)} = ${fmt(vv)}`, 'm12')}
        ${!hide && pctFrac(pp) ? T(244, 140, `${fmt(pp)}% = ${pctFrac(pp)} · N`, 'm11 exm-mut') : ''}${!hide ? T(244, 158, `${fmt(pp)}% = ${fmt(pp / 100, 3)} · N`, 'm11 exm-mut') : ''}
        ${box(12, 186, sx(NN) - 12, 14, 'exm-off', 4)}${box(12, 186, sx(vv) - 12, 14, cls, 4, 0.9)}${T(12, 214, '0', 'm9 exm-mut ex-start')}${T(sx(NN), 182, `N = ${fmt(NN)}`, 'm9 exm-mut ex-end')}${T(clamp(sx(vv), 30, 300), 214, fmt(vv), 'm10 tc exc-p')}`;
    };

    const changeView = (pp, NN, sg) => {
      const nw = Math.max(0, NN * (1 + (sg * pp) / 100));
      const top = Math.max(NN, nw);
      const sx = (x) => 14 + (x / top) * 280;
      const diff = nw - NN;
      const k = 1 + (sg * pp) / 100;
      return `${T(14, 26, u('was: 100%', 'было: 100%', 'бұрын: 100%'), 'm11 ex-start exm-mut')}${box(14, 32, sx(NN) - 14, 26, 'exc-b', 5, 0.85)}${T(sx(NN) - 6, 50, fmt(NN), 'm12 ex-end exm-on')}
        ${T(14, 84, `${u('now', 'стало', 'қазір')}: ${fmt(100 + sg * pp)}%`, 'm11 ex-start exm-mut')}${box(14, 90, sx(nw) - 14, 26, 'exc-p', 5, 0.85)}${nw > top * 0.15 ? T(sx(nw) - 6, 108, fmt(nw), 'm12 ex-end exm-on') : T(sx(nw) + 4, 108, fmt(nw), 'm12 ex-start')}
        ${diff ? `${box(sx(Math.min(NN, nw)), 124, Math.abs(sx(nw) - sx(NN)), 8, sg > 0 ? 'exc-g' : 'exc-r', 3)}${ln(sx(NN), 32, sx(NN), 134, 'exc-m ex-dash', 1)}${T((sx(NN) + sx(nw)) / 2, 148, `${sg > 0 ? '+' : '−'}${fmt(pp)}% = ${sg > 0 ? '+' : '−'}${fmt(Math.abs(diff))}`, `m11 tc ${sg > 0 ? 'exc-g' : 'exc-r'}`)}` : ''}
        ${T(160, 180, `${fmt(NN)} · (1 ${sg > 0 ? '+' : '−'} ${fmt(pp / 100, 3)}) = ${fmt(NN)} · ${fmt(k, 3)} = ${fmt(nw)}`, 'm12')}
        ${sg > 0 && pp > 0 ? T(160, 204, `${u('then', 'а потом', 'кейін')} −${fmt(pp)}%: ${fmt(nw)} · ${fmt(1 - pp / 100, 3)} = ${fmt(Math.max(0, nw * (1 - pp / 100)))} ≠ ${fmt(NN)}`, 'm10 exm-mut') : ''}`;
    };

    if (st.m === 0)
      return {
        svg: partView(p, N),
        caption: L(
          `1% of ${fmt(N)} is ${fmt(N)} ÷ 100 = ${fmt(one)} (one cell). ${fmt(p)}% is ${fmt(p)} cells: ${fmt(one)} · ${fmt(p)} = ${fmt(val)}.${fr ? ` Shortcut: ${fmt(p)}% = ${fr}, so take ${fr} of ${fmt(N)}.` : ''}${p > 100 ? ' More than 100% - more than the whole number.' : ''}`,
          `1% от ${fmt(N)} = ${fmt(N)} ÷ 100 = ${fmt(one)} (одна клетка). ${fmt(p)}% - это ${fmt(p)} клеток: ${fmt(one)} · ${fmt(p)} = ${fmt(val)}.${fr ? ` Быстрее: ${fmt(p)}% = ${fr}, то есть ${fr} от ${fmt(N)}.` : ''}${p > 100 ? ' Больше 100% - больше всего числа.' : ''}`,
          `${fmt(N)}-нің 1%-ы = ${fmt(N)} ÷ 100 = ${fmt(one)} (бір торкөз). ${fmt(p)}% - ${fmt(p)} торкөз: ${fmt(one)} · ${fmt(p)} = ${fmt(val)}.${fr ? ` Тезірек: ${fmt(p)}% = ${fr}, яғни ${fmt(N)}-нің ${fr} бөлігі.` : ''}${p > 100 ? ' 100%-дан көп - бүкіл саннан көп.' : ''}`,
        ),
      };

    if (st.m === 1) {
      const sg = st.sg;
      const k = 1 + (sg * p) / 100;
      const nw = N * k;
      if (sg < 0 && p > 100)
        return {
          svg: changeView(100, N, -1),
          caption: L('A price cannot fall by more than 100%: at −100% it is already 0.', 'Цена не может упасть больше чем на 100%: при −100% она уже равна 0.', 'Баға 100%-дан артық төмендей алмайды: −100% болғанда ол 0-ге тең.'),
        };
      return {
        svg: changeView(p, N, sg),
        caption:
          sg > 0
            ? L(
                `+${fmt(p)}%: the new value is ${fmt(100 + p)}% of the old one: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Trap: −${fmt(p)}% after that gives ${fmt(nw * (1 - p / 100))}, not ${fmt(N)} - the second percent is taken from a bigger number.`,
                `+${fmt(p)}%: новое значение - ${fmt(100 + p)}% от старого: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Ловушка: если потом снизить на ${fmt(p)}%, будет ${fmt(nw * (1 - p / 100))}, а не ${fmt(N)} - второй процент берётся от большего числа.`,
                `+${fmt(p)}%: жаңа мән ескінің ${fmt(100 + p)}%-ы: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Тұзақ: кейін ${fmt(p)}%-ға төмендетсең, ${fmt(N)} емес, ${fmt(nw * (1 - p / 100))} шығады - екінші пайыз үлкен саннан алынады.`,
              )
            : L(
                `−${fmt(p)}% (a discount): what is left is ${fmt(100 - p)}% of the old value: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. The discount itself is ${fmt(N - nw)}.`,
                `−${fmt(p)}% (скидка): остаётся ${fmt(100 - p)}% от старого: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Сама скидка - ${fmt(N - nw)}.`,
                `−${fmt(p)}% (жеңілдік): ескінің ${fmt(100 - p)}%-ы қалады: ${fmt(N)} · ${fmt(k, 3)} = ${fmt(nw)}. Жеңілдіктің өзі - ${fmt(N - nw)}.`,
              ),
      };
    }

    if (st.m === 2) {
      if (p === 0)
        return {
          svg: `${grid100(0, 12, 12, 16)}${T(244, 100, '0% = ?', 'm18')}`,
          caption: L('0% of any number is 0, so the whole cannot be found. Make p bigger than 0.', '0% от любого числа - это 0, поэтому целое найти нельзя. Сделай p больше нуля.', 'Кез келген санның 0%-ы - 0, сондықтан бүтінді табу мүмкін емес. p-ны 0-ден үлкен ет.'),
        };
      const X = (N * 100) / p;
      return {
        svg: `${grids(p, 12, 12, 160, 'exc-o')}${p <= 100 ? `<rect class="ex-stroke exc-p" style="fill:none;stroke-width:2.5" x="10" y="10" width="162" height="162" rx="4"/>` : ''}
          ${T(244, 34, `${fmt(p)}% = ${fmt(N)}`, 'm15 tc exc-o')}${T(244, 66, `1% = ${fmt(N)} : ${fmt(p)}`, 'm12')}${T(244, 86, `= ${fmt(N / p, 3)}`, 'm12')}
          ${T(244, 120, `100% = ${fmt(N / p, 3)} · 100`, 'm12')}${T(244, 148, `X = ${fmt(X)}`, 'm18 tc exc-p')}${T(244, 172, `X = N · 100 : p`, 'm10 exm-mut')}`,
        caption: L(
          `${fmt(p)}% of an unknown number X is ${fmt(N)}. One percent is ${fmt(N)} ÷ ${fmt(p)} = ${fmt(N / p, 3)}, all 100% are ${fmt(N / p, 3)} · 100 = ${fmt(X)}. Check: ${fmt(p)}% of ${fmt(X)} = ${fmt((X * p) / 100)}.`,
          `${fmt(p)}% неизвестного числа X равны ${fmt(N)}. Один процент - ${fmt(N)} ÷ ${fmt(p)} = ${fmt(N / p, 3)}, все 100% - ${fmt(N / p, 3)} · 100 = ${fmt(X)}. Проверка: ${fmt(p)}% от ${fmt(X)} = ${fmt((X * p) / 100)}.`,
          `Белгісіз X санының ${fmt(p)}%-ы ${fmt(N)}-ге тең. Бір пайыз - ${fmt(N)} ÷ ${fmt(p)} = ${fmt(N / p, 3)}, барлық 100% - ${fmt(N / p, 3)} · 100 = ${fmt(X)}. Тексеру: ${fmt(X)}-тің ${fmt(p)}%-ы = ${fmt((X * p) / 100)}.`,
        ),
      };
    }

    // ----- Задание -----
    const tk = st.task ?? (pctTask(st), st.task);
    let ok;
    let svg;
    let ask;
    let hint;
    if (tk.type === 0) {
      ok = near(p, tk.P, 0.01);
      svg = partView(p, N) + badge(`${fmt(tk.A)} = ?% · ${fmt(tk.N)}`, ok);
      ask = L(`What percent of ${fmt(tk.N)} is ${fmt(tk.A)}? Set p.`, `Сколько процентов от ${fmt(tk.N)} составляет ${fmt(tk.A)}? Установи p.`, `${fmt(tk.A)} саны ${fmt(tk.N)}-нің неше пайызы? p-ны орнат.`);
      hint = L(`Now ${fmt(p)}% of ${fmt(N)} = ${fmt(val)}. Hint: p = part ÷ whole · 100.`, `Сейчас ${fmt(p)}% от ${fmt(N)} = ${fmt(val)}. Подсказка: p = часть ÷ целое · 100.`, `Қазір ${fmt(N)}-нің ${fmt(p)}%-ы = ${fmt(val)}. Кеңес: p = бөлік ÷ бүтін · 100.`);
    } else if (tk.type === 1) {
      ok = near(N, tk.X, 0.01) && near(p, tk.P, 0.01);
      svg = partView(p, N, 'exc-o') + badge(`${fmt(tk.P)}% · N = ${fmt(tk.A)}`, ok);
      ask = L(`${fmt(tk.P)}% of a number is ${fmt(tk.A)}. Find the number: set N (p = ${fmt(tk.P)}%).`, `${fmt(tk.P)}% числа равны ${fmt(tk.A)}. Найди число: установи N (p = ${fmt(tk.P)}%).`, `Санның ${fmt(tk.P)}%-ы ${fmt(tk.A)}-ге тең. Санды тап: N-ді орнат (p = ${fmt(tk.P)}%).`);
      hint = L(`Now ${fmt(p)}% of ${fmt(N)} = ${fmt(val)}. Hint: N = ${fmt(tk.A)} · 100 : ${fmt(tk.P)}.`, `Сейчас ${fmt(p)}% от ${fmt(N)} = ${fmt(val)}. Подсказка: N = ${fmt(tk.A)} · 100 : ${fmt(tk.P)}.`, `Қазір ${fmt(N)}-нің ${fmt(p)}%-ы = ${fmt(val)}. Кеңес: N = ${fmt(tk.A)} · 100 : ${fmt(tk.P)}.`);
    } else {
      ok = near(p, tk.P, 0.01) && near(N, tk.N, 0.01);
      svg = changeView(Math.min(p, tk.up ? 200 : 100), N, tk.up ? 1 : -1) + badge(`${fmt(tk.N)} → ${fmt(tk.M)}`, ok);
      ask = tk.up
        ? L(`The price rose from ${fmt(tk.N)} to ${fmt(tk.M)}. By how many percent? Set p.`, `Цена выросла с ${fmt(tk.N)} до ${fmt(tk.M)}. На сколько процентов? Установи p.`, `Баға ${fmt(tk.N)}-ден ${fmt(tk.M)}-ге өсті. Неше пайызға? p-ны орнат.`)
        : L(`The price fell from ${fmt(tk.N)} to ${fmt(tk.M)}. What is the discount in percent? Set p.`, `Цена снизилась с ${fmt(tk.N)} до ${fmt(tk.M)}. Какая скидка в процентах? Установи p.`, `Баға ${fmt(tk.N)}-ден ${fmt(tk.M)}-ге түсті. Жеңілдік неше пайыз? p-ны орнат.`);
      hint = L(`Hint: the change is ${fmt(Math.abs(tk.M - tk.N))}; divide it by the OLD price ${fmt(tk.N)} and multiply by 100.`, `Подсказка: изменение ${fmt(Math.abs(tk.M - tk.N))}; раздели его на СТАРУЮ цену ${fmt(tk.N)} и умножь на 100.`, `Кеңес: өзгеріс ${fmt(Math.abs(tk.M - tk.N))}; оны ЕСКІ баға ${fmt(tk.N)}-ге бөліп, 100-ге көбейт.`);
    }
    ok = check(st, ok);
    return { svg, caption: taskCap(st, ok, ask, hint) };
  },
});