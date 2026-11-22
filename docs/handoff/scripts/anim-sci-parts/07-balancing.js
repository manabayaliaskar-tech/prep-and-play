// Уравнивание реакций: три уровня, подсчёт атомов каждого элемента, подсказка, ответ.
/** 'Al2(SO4)3' → { Al: 2, S: 3, O: 12 }. */
const parseF = (f) => {
  const stack = [{}];
  const re = /([A-Z][a-z]?|\(|\))(\d*)/g;
  let m;
  while ((m = re.exec(f))) {
    const k = Number(m[2] || 1);
    if (m[1] === '(') stack.push({});
    else if (m[1] === ')') {
      const g = stack.pop();
      for (const [e, c] of Object.entries(g)) stack.at(-1)[e] = (stack.at(-1)[e] ?? 0) + c * k;
    } else stack.at(-1)[m[1]] = (stack.at(-1)[m[1]] ?? 0) + k;
  }
  return stack[0];
};
const subF = (f) => f.replace(/\d+/g, (d) => sub(d));
const RX_TYPES = [L('synthesis', 'соединение', 'қосылу'), L('decomposition', 'разложение', 'айырылу'), L('single replacement', 'замещение', 'орын басу'), L('exchange', 'обмен', 'алмасу'), L('combustion', 'горение', 'жану')];
// [реагенты, продукты, ответ, тип]
const RX = [
  [
    [['H2', 'O2'], ['H2O'], [2, 1, 2], 0],
    [['N2', 'H2'], ['NH3'], [1, 3, 2], 0],
    [['Mg', 'O2'], ['MgO'], [2, 1, 2], 0],
    [['Na', 'Cl2'], ['NaCl'], [2, 1, 2], 0],
    [['H2', 'Cl2'], ['HCl'], [1, 1, 2], 0],
    [['H2O'], ['H2', 'O2'], [2, 2, 1], 1],
    [['HgO'], ['Hg', 'O2'], [2, 2, 1], 1],
    [['CaCO3'], ['CaO', 'CO2'], [1, 1, 1], 1],
    [['Ca', 'O2'], ['CaO'], [2, 1, 2], 0],
  ],
  [
    [['Al', 'O2'], ['Al2O3'], [4, 3, 2], 0],
    [['P', 'O2'], ['P2O5'], [4, 5, 2], 0],
    [['Fe', 'O2'], ['Fe3O4'], [3, 2, 1], 0],
    [['Zn', 'HCl'], ['ZnCl2', 'H2'], [1, 2, 1, 1], 2],
    [['Al', 'HCl'], ['AlCl3', 'H2'], [2, 6, 2, 3], 2],
    [['Na', 'H2O'], ['NaOH', 'H2'], [2, 2, 2, 1], 2],
    [['Fe2O3', 'H2'], ['Fe', 'H2O'], [1, 3, 2, 3], 2],
    [['KClO3'], ['KCl', 'O2'], [2, 2, 3], 1],
    [['H2O2'], ['H2O', 'O2'], [2, 2, 1], 1],
    [['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2], 4],
  ],
  [
    [['C3H8', 'O2'], ['CO2', 'H2O'], [1, 5, 3, 4], 4],
    [['C2H6', 'O2'], ['CO2', 'H2O'], [2, 7, 4, 6], 4],
    [['C6H12O6', 'O2'], ['CO2', 'H2O'], [1, 6, 6, 6], 4],
    [['NH3', 'O2'], ['NO', 'H2O'], [4, 5, 4, 6], 4],
    [['FeS2', 'O2'], ['Fe2O3', 'SO2'], [4, 11, 2, 8], 4],
    [['KMnO4'], ['K2MnO4', 'MnO2', 'O2'], [2, 1, 1, 1], 1],
    [['Ca(OH)2', 'HCl'], ['CaCl2', 'H2O'], [1, 2, 1, 2], 3],
    [['Ca(OH)2', 'H3PO4'], ['Ca3(PO4)2', 'H2O'], [3, 2, 1, 6], 3],
    [['Al2(SO4)3', 'NaOH'], ['Al(OH)3', 'Na2SO4'], [1, 6, 2, 3], 3],
    [['Fe2O3', 'CO'], ['Fe', 'CO2'], [1, 3, 2, 3], 2],
  ],
];
const EL_CLS = { H: 'exc-p', O: 'exc-r', N: 'exc-b', C: 'exc-m', Cl: 'exc-g', Na: 'exc-o', K: 'exc-o', Fe: 'exc-o', Al: 'exc-k', S: 'exc-y', Ca: 'exc-a', Mg: 'exc-k', Zn: 'exc-b', P: 'exc-o', Hg: 'exc-m', Mn: 'exc-k' };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

//@@SCENE
  balancing: {
    title: L('Balancing chemical equations', 'Уравниваем химические реакции', 'Химиялық реакцияларды теңестіру'),
    intro: L('Atoms are not created or lost, only regrouped. Change the coefficients (not the small indices) until every element is equal on both sides.', 'Атомы не появляются и не исчезают, а только перегруппировываются. Меняй коэффициенты (не индексы), пока атомов каждого элемента не станет поровну.', 'Атомдар пайда болмайды да, жоғалмайды да, тек қайта топтасады. Әр элемент атомдары теңелгенше коэффициенттерді (индекстерді емес) өзгерт.'),
    sliders: [1, 2, 3, 4].map((i) => ({ id: `k${i}`, label: `k${sub(i)}`, min: 1, max: 12, step: 1, value: 1, hidden: (v, st) => i > RX[st.lv][st.r][0].length + RX[st.lv][st.r][1].length })),
    buttons: [L('Level 1', 'Уровень 1', '1-деңгей'), L('Level 2', 'Уровень 2', '2-деңгей'), L('Level 3', 'Уровень 3', '3-деңгей'), L('Next ↻', 'Следующая ↻', 'Келесі ↻'), L('Answer', 'Ответ', 'Жауап')],
    state: () => ({ lv: 0, r: 0 }),
    pressed: (i, v, st) => i === st.lv,
    onButton(i, st) {
      if (i < 3) {
        st.lv = i;
        st.r = ri(0, RX[i].length - 1);
      } else if (i === 3) st.r = (st.r + 1) % RX[st.lv].length;
      else {
        const ans = RX[st.lv][st.r][2];
        return { k1: ans[0], k2: ans[1], k3: ans[2], k4: ans[3] ?? 1 };
      }
      return { k1: 1, k2: 1, k3: 1, k4: 1 };
    },
    draw(v, step, st) {
      const [re, pr, , type] = RX[st.lv][st.r];
      const all = [...re, ...pr];
      const ks = [v.k1, v.k2, v.k3, v.k4].slice(0, all.length);
      const comp = all.map(parseF);
      const els = [];
      for (const c of comp) for (const e of Object.keys(c)) if (!els.includes(e)) els.push(e);
      const side = (from, to) => {
        const cnt = {};
        for (let j = from; j < to; j++) for (const [e, c] of Object.entries(comp[j])) cnt[e] = (cnt[e] ?? 0) + c * ks[j];
        return cnt;
      };
      const left = side(0, re.length);
      const right = side(re.length, all.length);
      const okEl = (e) => left[e] === right[e];
      const ok = els.every(okEl);
      const g = ks.reduce(gcd);
      // Уравнение: коэффициенты и формулы по центру.
      const parts = all.map((f, j) => ({ k: ks[j], f: subF(f), j }));
      const term2 = (p) => `${p.k > 1 ? p.k : ''}${p.f}`;
      const eqTxt = `${parts.slice(0, re.length).map(term2).join(' + ')} → ${parts.slice(re.length).map(term2).join(' + ')}`;
      const n = all.length;
      const colX = (j) => 160 + (j - (n - 1) / 2) * (n === 4 ? 74 : n === 3 ? 92 : 120);
      const cols = all
        .map((f, j) => {
          const x = colX(j);
          const mid = j === re.length - 1 ? '→' : j < n - 1 ? '+' : '';
          return `${box(x - 34, 36, 68, 36)}${tt(x, 51, `${ks[j] > 1 ? ks[j] : ''}${subF(f)}`, 'exs-m')}${tt(x, 66, `k${sub(j + 1)} = ${ks[j]}`, 'exs-s tc exc-p')}${mid ? tt((x + colX(j + 1)) / 2, 58, mid, 'exs-h') : ''}`;
        })
        .join('');
      const rowH = Math.min(24, 120 / els.length);
      const dots = (cnt, x0, dir, cls) => {
        const shown = Math.min(cnt, 12);
        let out = '';
        for (let q = 0; q < shown; q++) out += `<circle class="ex-fill ${cls}" cx="${n1(x0 + dir * (q * 7.5))}" cy="0" r="3"/>`;
        return out + (cnt > 12 ? tt(x0 + dir * 90, 4, `+${cnt - 12}`, `exs-s ${dir > 0 ? 'ex-start' : 'ex-end'}`) : '');
      };
      const rows = els
        .map((e, q) => {
          const y = 96 + q * rowH;
          const good = okEl(e);
          const cls = EL_CLS[e] ?? 'exc-p';
          return `<g transform="translate(0 ${n1(y)})" class="${cls}">${dots(left[e], 132, -1, cls)}${dots(right[e], 188, 1, cls)}</g>${tt(160, y + 4, e, 'exs-t')}${tt(8, y + 4, String(left[e]), `exs-t ex-start tc ${good ? 'exc-g' : 'exc-r'}`)}${tt(314, y + 4, `${right[e]} ${good ? '✓' : '✗'}`, `exs-t ex-end tc ${good ? 'exc-g' : 'exc-r'}`)}`;
        })
        .join('');
      const lv = `${tt(8, 16, `${u('Level', 'Уровень', 'Деңгей')} ${st.lv + 1} · ${tx(RX_TYPES[type])}`, 'exs-s ex-start')}${tt(312, 16, ok ? `✓ ${u('balanced', 'уравнено', 'теңестірілді')}` : u('not balanced', 'не уравнено', 'теңестірілмеген'), `exs-t ex-end tc ${ok ? 'exc-g' : 'exc-r'}`)}`;
      const head = `${tt(84, 88, u('left', 'слева', 'сол жақ'), 'exs-s')}${tt(236, 88, u('right', 'справа', 'оң жақ'), 'exs-s')}`;
      const svg = `${lv}${cols}${head}${rows}`;
      let caption;
      if (ok && g === 1) {
        const list = els.map((e) => `${e}: ${left[e]}`).join(', ');
        caption = u(`✓ Balanced: ${eqTxt}. Atoms on each side: ${list}. The coefficients ${ks.join(' : ')} are also the mole ratio of the reaction.`, `✓ Уравнено: ${eqTxt}. Атомов с каждой стороны: ${list}. Коэффициенты ${ks.join(' : ')} - это и соотношение молей в реакции.`, `✓ Теңестірілді: ${eqTxt}. Әр жақтағы атомдар: ${list}. ${ks.join(' : ')} коэффициенттері - реакциядағы моль қатынасы да.`);
      } else if (ok) caption = u(`Balanced, but all coefficients can be divided by ${g}. Use the smallest whole numbers: ${ks.map((k) => k / g).join(' : ')}.`, `Уравнено, но все коэффициенты делятся на ${g}. Нужны наименьшие целые: ${ks.map((k) => k / g).join(' : ')}.`, `Теңестірілді, бірақ барлық коэффициенттер ${g}-ге бөлінеді. Ең кіші бүтін сандар керек: ${ks.map((k) => k / g).join(' : ')}.`);
      else {
        const e = els.find((x) => !okEl(x));
        const lessLeft = left[e] < right[e];
        const from = lessLeft ? 0 : re.length;
        const to = lessLeft ? re.length : all.length;
        const cand = all.slice(from, to).find((f) => parseF(f)[e]);
        caption = u(
          `${e}: ${left[e]} on the left, ${right[e]} on the right. Try a bigger coefficient in front of ${subF(cand)}. Tip: balance O and H last, and check every element again after each change.`,
          `${e}: слева ${left[e]}, справа ${right[e]}. Попробуй увеличить коэффициент перед ${subF(cand)}. Совет: O и H уравнивай в конце и после каждого шага пересчитывай все элементы.`,
          `${e}: сол жақта ${left[e]}, оң жақта ${right[e]}. ${subF(cand)} алдындағы коэффициентті арттырып көр. Кеңес: O мен H-ты соңында теңестір, әр қадамнан кейін барлық элементті қайта сана.`,
        );
      }
      return { svg, caption };
    },
  },
