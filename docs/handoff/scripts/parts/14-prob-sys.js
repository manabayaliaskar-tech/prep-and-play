// ---------- Вероятность ----------

const DICE_EV = [
  { t: (S) => L(`sum = ${S}`, `сумма = ${S}`, `қосынды = ${S}`), f: (a, b, S) => a + b === S },
  { t: (S) => L(`sum ≥ ${S}`, `сумма ≥ ${S}`, `қосынды ≥ ${S}`), f: (a, b, S) => a + b >= S },
  { t: () => L('a double', 'дубль (одинаковые)', 'дубль (бірдей)'), f: (a, b) => a === b },
  { t: () => L('at least one 6', 'хотя бы одна 6', 'кемінде бір 6'), f: (a, b) => a === 6 || b === 6 },
];
const URN_EV = [
  L('1 ball: red', '1 шар: красный', '1 шар: қызыл'),
  L('2 balls, no return: both red', '2 шара без возврата: оба красные', '2 шар, қайтармай: екеуі де қызыл'),
  L('2 balls, with return: both red', '2 шара с возвратом: оба красные', '2 шар, қайтарып: екеуі де қызыл'),
  L('2 balls, no return: different colours', '2 шара без возврата: разного цвета', '2 шар, қайтармай: түстері әртүрлі'),
];
/** Вероятность события урны и запись произведения. */
function urnP(r, b, ev) {
  const n = r + b;
  if (!n) return null;
  if (ev === 0) return { p: r / n, num: r, den: n, s: `${r}/${n}` };
  if (ev === 2) return { p: (r / n) ** 2, num: r * r, den: n * n, s: `${r}/${n} · ${r}/${n}` };
  if (n < 2) return null;
  if (ev === 1) return { p: (r * (r - 1)) / (n * (n - 1)), num: r * (r - 1), den: n * (n - 1), s: `${r}/${n} · ${Math.max(0, r - 1)}/${n - 1}` };
  return { p: (2 * r * b) / (n * (n - 1)), num: 2 * r * b, den: n * (n - 1), s: `${r}/${n} · ${b}/${n - 1} + ${b}/${n} · ${r}/${n - 1}` };
}

function probTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 3);
  while (type === last);
  let t = {};
  if (type === 0) {
    const m = pick([1, 2, 3, 4, 5]);
    t = { m };
  } else if (type === 2) {
    const [num, den, b] = pick([[1, 3, 6], [2, 5, 6], [1, 2, 5], [1, 4, 6], [3, 5, 4], [2, 3, 4], [1, 5, 8]]);
    t = { num, den, b, r: (num * b) / (den - num) };
  } else if (type === 3) {
    const r = rnd(1, 9);
    t = { r, b: 10 - r };
  }
  st.task = { type, done: false, urn: type >= 2, ...t };
  st.sim = null;
  st.S = 2;
  return type === 2 ? { r: 1, bl: t.b } : type === 3 ? { r: 5, bl: 2 } : null;
}

const probability = modes({
  title: L('Probability', 'Вероятность', 'Ықтималдық'),
  intro: L('P(A) = favourable outcomes ÷ all equally likely outcomes. Check it with an experiment: the frequency gets close to P.', 'P(A) = благоприятные исходы ÷ все равновозможные исходы. Проверь опытом: частота приближается к P.', 'P(A) = қолайлы нәтижелер ÷ барлық тең мүмкін нәтижелер. Тәжірибемен тексер: жиілік P-ға жақындайды.'),
  sliders: [
    { id: 'r', label: L('red balls', 'красных шаров', 'қызыл шар'), min: 0, max: 10, value: 3, hidden: (v, st) => !(st.m === 1 || (st.m === 2 && st.task?.urn)) },
    { id: 'bl', label: L('blue balls', 'синих шаров', 'көк шар'), min: 0, max: 10, value: 5, hidden: (v, st) => !(st.m === 1 || (st.m === 2 && st.task?.urn)) },
  ],
  tabs: [L('Two dice', 'Два кубика', 'Екі сүйек'), L('Balls', 'Шары', 'Шарлар'), TASK],
  acts: [{ label: L('Experiment ×20', 'Опыт ×20', 'Тәжірибе ×20'), only: [0, 1] }, { label: L('Event ↻', 'Событие ↻', 'Оқиға ↻'), only: [0, 1] }, { label: MORE, only: [2] }],
  state: () => ({ S: 7, ev: [0, 0], sim: null }),
  onTab(m, st, v, again) {
    st.sim = null;
    if (m === 2 && (again || !st.task || st.task.done)) return probTask(st);
    return null;
  },
  onSlide(k, v, st) {
    st.sim = null;
  },
  onAct(j, st, v) {
    if (j === 2) return probTask(st);
    if (j === 1) {
      st.ev[st.m] = (st.ev[st.m] + 1) % 4;
      st.sim = null;
      return null;
    }
    const sim = st.sim ?? { n: 0, k: 0, last: null };
    for (let i = 0; i < 20; i++) {
      if (st.m === 0) {
        const a = rnd(1, 6);
        const b = rnd(1, 6);
        sim.last = [a, b];
        sim.n += 1;
        if (DICE_EV[st.ev[0]].f(a, b, st.S)) sim.k += 1;
      } else {
        const r = Math.round(v.r);
        const n = r + Math.round(v.bl);
        const ev = st.ev[1];
        if (!n || (n < 2 && ev !== 0 && ev !== 2)) break;
        const first = Math.random() < r / n;
        let hitE;
        if (ev === 0) hitE = first;
        else {
          const r2 = ev === 2 ? r : r - (first ? 1 : 0);
          const n2 = ev === 2 ? n : n - 1;
          const second = Math.random() < r2 / n2;
          hitE = ev === 3 ? first !== second : first && second;
          sim.last = [first, second];
        }
        if (ev === 0) sim.last = [first];
        sim.n += 1;
        if (hitE) sim.k += 1;
      }
    }
    st.sim = sim;
    return null;
  },
  onDrag(key, p, v, st) {
    if (key.startsWith('s')) {
      st.S = Number(key.slice(1));
      if (st.m === 0) st.sim = null;
    }
  },
  draw(v, step, st) {
    const tk = st.m === 2 ? (st.task ?? (probTask(st), st.task)) : null;
    const dice = st.m === 0 || (tk && !tk.urn);
    if (dice) {
      const ev = tk ? 0 : st.ev[0];
      const E = DICE_EV[ev];
      const S = st.S;
      const c = 24;
      const X0 = 28;
      const Y0 = 34;
      let g = '';
      let m = 0;
      for (let a = 1; a <= 6; a++)
        for (let b = 1; b <= 6; b++) {
          const inE = E.f(a, b, S);
          if (inE) m += 1;
          const x = X0 + (b - 1) * c;
          const y = Y0 + (a - 1) * c;
          const last = st.sim?.last && st.sim.last[0] === a && st.sim.last[1] === b;
          g += `<rect class="ex-fill ${inE ? 'exc-p' : 'exm-off'}" x="${x}" y="${y}" width="${c - 2}" height="${c - 2}" rx="4"/>${T(x + c / 2 - 1, y + c / 2 + 3, a + b, `m10 ${inE ? 'exm-on' : 'exm-mut'}`)}${last ? `<rect class="ex-stroke exc-o" style="fill:none;stroke-width:2.5" x="${x - 1}" y="${y - 1}" width="${c}" height="${c}" rx="5"/>` : ''}<rect class="ex-hit" data-drag="s${a + b}" x="${x}" y="${y}" width="${c - 2}" height="${c - 2}"/>`;
        }
      for (let i = 1; i <= 6; i++) g += T(X0 + (i - 1) * c + c / 2 - 1, Y0 - 6, i, 'm10 tc exc-b') + T(X0 - 9, Y0 + (i - 1) * c + c / 2 + 3, i, 'm10 tc exc-o');
      g += T(X0 + 4 * c, 14, u('die 2 →', 'кубик 2 →', '2-сүйек →'), 'm9 exm-mut') + T(4, 14, u('die 1 ↓', 'кубик 1 ↓', '1-сүйек ↓'), 'm9 exm-mut ex-start');
      const P = frs(m, 36);
      const sim = st.sim;
      const right = `${T(250, 40, `A: ${tx(E.t(S))}`, 'm11')}${T(250, 70, `P(A) = ${m}/36`, 'm15 tc exc-p')}${T(250, 92, `= ${P} ≈ ${fmt(m / 36, 3)}`, 'm12')}
        ${sim ? `${T(250, 130, `${u('rolls', 'бросков', 'лақтыру')}: ${sim.n}`, 'm11')}${T(250, 148, `${u('A happened', 'A было', 'A болды')}: ${sim.k}`, 'm11')}${T(250, 168, `${u('frequency', 'частота', 'жиілік')} ${fmt(sim.k / sim.n, 3)}`, 'm12 tc exc-o')}${box(190, 180, 120, 10, 'exm-off', 5)}${box(190, 180, 120 * (sim.k / sim.n), 10, 'exc-o', 5)}${ln(190 + 120 * (m / 36), 176, 190 + 120 * (m / 36), 194, 'exc-p', 2.5)}` : T(250, 140, u('tap a cell:', 'нажми на клетку:', 'торды бас:'), 'm9 exm-mut') + T(250, 153, u('pick the sum', 'выбери сумму', 'қосындыны таңда'), 'm9 exm-mut')}`;
      if (tk) {
        let ok;
        let ask;
        let hint;
        let tag;
        if (tk.type === 0) {
          ok = m === tk.m;
          tag = `P = ${frs(tk.m, 36)}`;
          ask = L(`Tap a sum whose probability is ${tk.m}/36${frs(tk.m, 36) !== `${tk.m}/36` ? ` = ${frs(tk.m, 36)}` : ''}.`, `Нажми на сумму, вероятность которой ${tk.m}/36${frs(tk.m, 36) !== `${tk.m}/36` ? ` = ${frs(tk.m, 36)}` : ''}.`, `Ықтималдығы ${tk.m}/36${frs(tk.m, 36) !== `${tk.m}/36` ? ` = ${frs(tk.m, 36)}` : ''} болатын қосындыны бас.`);
          hint = L(`Sum ${S} occurs in ${m} cells. We need ${tk.m} cells.`, `Сумма ${S} встречается в ${m} ${pl(m, 'клетке', 'клетках', 'клетках')}. Нужно ${tk.m}.`, `${S} қосындысы ${m} торда кездеседі. ${tk.m} керек.`);
        } else {
          ok = S === 7;
          tag = 'max P';
          ask = L('Which sum of two dice comes up most often? Tap it.', 'Какая сумма двух кубиков выпадает чаще всего? Нажми на неё.', 'Екі сүйектің қай қосындысы жиі түседі? Соны бас.');
          hint = L(`Sum ${S}: ${m} of 36. Look for the longest diagonal.`, `Сумма ${S}: ${m} из 36. Ищи самую длинную диагональ.`, `${S} қосындысы: 36-дан ${m}. Ең ұзын диагональды ізде.`);
        }
        ok = check(st, ok);
        return { svg: `${g}${T(250, 70, `P = ${m}/36`, 'm15 tc exc-p')}${T(250, 92, `= ${P}`, 'm12')}${T(250, 150, u('tap a cell', 'нажми на клетку', 'торды бас'), 'm9 exm-mut')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
      }
      const capE = [
        L(`Two dice give 6 · 6 = 36 equally likely pairs. The sum ${S} appears in ${m} of them: P = ${m}/36${P !== `${m}/36` ? ` = ${P}` : ''}. The middle sums are more likely: 7 has the longest diagonal (6 cells).`, `У двух кубиков 6 · 6 = 36 равновозможных пар. Сумма ${S} встречается в ${m} из них: P = ${m}/36${P !== `${m}/36` ? ` = ${P}` : ''}. Средние суммы вероятнее: у 7 самая длинная диагональ (6 клеток).`, `Екі сүйекте 6 · 6 = 36 тең мүмкін жұп бар. ${S} қосындысы олардың ${m}-інде кездеседі: P = ${m}/36${P !== `${m}/36` ? ` = ${P}` : ''}. Ортаңғы қосындылар ықтималырақ: 7-нің диагоналі ең ұзын (6 тор).`),
        L(`Sum ≥ ${S}: ${m} cells of 36, P = ${P}. Counting the opposite event (sum < ${S}) can be faster: 1 − ${36 - m}/36.`, `Сумма ≥ ${S}: ${m} клеток из 36, P = ${P}. Иногда проще посчитать противоположное событие (сумма < ${S}): 1 − ${36 - m}/36.`, `Қосынды ≥ ${S}: 36-дан ${m} тор, P = ${P}. Кейде қарама-қарсы оқиғаны (қосынды < ${S}) санау оңай: 1 − ${36 - m}/36.`),
        L(`A double is the diagonal: 6 of 36, P = 1/6. The second die just has to repeat the first one.`, `Дубль - это диагональ: 6 из 36, P = 1/6. Второй кубик просто должен повторить первый.`, `Дубль - диагональ: 36-дан 6, P = 1/6. Екінші сүйек біріншісін қайталауы керек.`),
        L(`At least one 6: 11 of 36. Faster through the opposite event "no sixes": 1 − (5/6)·(5/6) = 1 − 25/36 = 11/36.`, `Хотя бы одна 6: 11 из 36. Быстрее через противоположное «ни одной шестёрки»: 1 − (5/6)·(5/6) = 1 − 25/36 = 11/36.`, `Кемінде бір 6: 36-дан 11. Қарама-қарсы «бірде-бір алтылық жоқ» арқылы тезірек: 1 − (5/6)·(5/6) = 1 − 25/36 = 11/36.`),
      ][ev];
      const capS = sim ? L(`After ${sim.n} rolls the frequency is ${sim.k}/${sim.n} ≈ ${fmt(sim.k / sim.n, 2)} (the purple mark is P ≈ ${fmt(m / 36, 2)}).`, `После ${sim.n} бросков частота ${sim.k}/${sim.n} ≈ ${fmt(sim.k / sim.n, 2)} (фиолетовая черта - P ≈ ${fmt(m / 36, 2)}).`, `${sim.n} лақтырудан кейін жиілік ${sim.k}/${sim.n} ≈ ${fmt(sim.k / sim.n, 2)} (күлгін сызық - P ≈ ${fmt(m / 36, 2)}).`) : null;
      return { svg: g + right, caption: J(capE, capS) };
    }

    // ----- Шары -----
    const r = Math.round(v.r);
    const b = Math.round(v.bl);
    const n = r + b;
    const ev = tk ? 0 : st.ev[1];
    let g = `<path class="ex-stroke exc-m" style="stroke-width:2.5" d="M12 50 V196 Q12 206 22 206 H108 Q118 206 118 196 V50"/>`;
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 5);
      g += `<circle class="ex-fill exm-dot ${i < r ? 'exc-r' : 'exc-b'}" cx="${26 + (i % 5) * 20}" cy="${193 - row * 20}" r="8.5"/>`;
    }
    g += T(65, 40, `${r} + ${b} = ${n}`, 'm12');
    const res = urnP(r, b, ev);
    // дерево
    const tree = () => {
      if (!n) return '';
      const X1 = 140;
      const X2 = 205;
      const X3 = 268;
      const R = (x, y, lab, cls) => `${dot(x, y, 7, cls)}${lab ? T(x + 10, y + 4, lab, 'm9 ex-start') : ''}`;
      let s = '';
      const pr = [r / n, b / n];
      const ys = [70, 150];
      if (ev === 0) {
        s += ln(X1, 110, X2, ys[0], 'exc-r', 1.5 + 2.5 * pr[0]) + ln(X1, 110, X2, ys[1], 'exc-b', 1.5 + 2.5 * pr[1]);
        s += T((X1 + X2) / 2 - 4, 86, `${r}/${n}`, 'm10 tc exc-r ex-end h') + T((X1 + X2) / 2 - 4, 142, `${b}/${n}`, 'm10 tc exc-b ex-end h');
        s += R(X2, ys[0], u('red ✓', 'красный ✓', 'қызыл ✓'), 'exc-r') + R(X2, ys[1], '', 'exc-b');
        return `${dot(X1, 110, 4, 'exc-m')}${s}`;
      }
      const back = ev === 2;
      const leaves = [];
      [0, 1].forEach((i) => {
        const y = ys[i];
        const first = i === 0;
        s += ln(X1, 110, X2, y, first ? 'exc-r' : 'exc-b', 2) + T((X1 + X2) / 2 - 4, (110 + y) / 2 + (first ? -2 : 10), first ? `${r}/${n}` : `${b}/${n}`, `m9 tc ${first ? 'exc-r' : 'exc-b'} ex-end h`) + dot(X2, y, 6, first ? 'exc-r' : 'exc-b');
        [0, 1].forEach((j) => {
          const y2 = y - 26 + j * 52;
          const second = j === 0;
          const rr = back ? r : r - (first ? 1 : 0);
          const nn = back ? n : n - 1;
          const num = second ? rr : nn - rr;
          const inE = ev === 3 ? first !== second : first && second;
          leaves.push(inE);
          s += ln(X2, y, X3, y2, second ? 'exc-r' : 'exc-b', inE ? 3 : 1.2) + T((X2 + X3) / 2, (y + y2) / 2 + (j ? 11 : -3), `${Math.max(0, num)}/${nn}`, `m9 tc ${second ? 'exc-r' : 'exc-b'} h`) + dot(X3, y2, 5, second ? 'exc-r' : 'exc-b') + (inE ? T(X3 + 9, y2 + 4, '✓', 'm12 tc exc-g ex-start') : '');
        });
      });
      return `${dot(X1, 110, 4, 'exc-m')}${s}`;
    };
    const sim = st.sim;
    const bottom = res ? `${T(220, 200, `P = ${res.s}`, 'm11')}${T(220, 216, `= ${frs(res.num, res.den)} ≈ ${fmt(res.p, 3)}`, 'm11 tc exc-p')}` : '';
    if (tk) {
      const want = tk.type === 2 ? `${tk.num}/${tk.den}` : `${fmt(tk.r / 10)}`;
      const ok = check(st, tk.type === 2 ? b === tk.b && r * tk.den === tk.num * n && n > 0 : r === tk.r && b === tk.b);
      const ask =
        tk.type === 2
          ? L(`There are ${tk.b} blue balls. How many red ones are needed so that P(red) = ${want}?`, `В урне ${tk.b} синих шаров. Сколько нужно красных, чтобы P(красный) = ${want}?`, `Ыдыста ${tk.b} көк шар бар. P(қызыл) = ${want} болу үшін неше қызыл шар керек?`)
          : L(`Put 10 balls in total so that P(red) = ${want}.`, `Положи всего 10 шаров так, чтобы P(красный) = ${want}.`, `P(қызыл) = ${want} болатындай барлығы 10 шар сал.`);
      const hint = L(`Now P(red) = ${r}/${n || 1} ≈ ${fmt(n ? r / n : 0, 3)}.${tk.type === 2 && b !== tk.b ? ` Keep ${tk.b} blue.` : ''}`, `Сейчас P(красный) = ${r}/${n || 1} ≈ ${fmt(n ? r / n : 0, 3)}.${tk.type === 2 && b !== tk.b ? ` Синих должно быть ${tk.b}.` : ''}`, `Қазір P(қызыл) = ${r}/${n || 1} ≈ ${fmt(n ? r / n : 0, 3)}.${tk.type === 2 && b !== tk.b ? ` Көк шар ${tk.b} болуы керек.` : ''}`);
      return { svg: `${g}${tree()}${T(220, 210, `P(${u('red', 'красный', 'қызыл')}) = ${r}/${n || 0}`, 'm12')}${badge(`P = ${want}`, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    const simTxt = sim ? T(220, 22, `${u('trials', 'опытов', 'тәжірибе')} ${sim.n}: ${u('freq.', 'частота', 'жиілік')} ${fmt(sim.k / Math.max(1, sim.n), 2)}`, 'm10 tc exc-o') : T(220, 22, tx(URN_EV[ev]), 'm10');
    if (!res)
      return {
        svg: `${g}${simTxt}`,
        caption: n ? L('With one ball you cannot draw two without returning it.', 'Из одного шара нельзя вынуть два без возвращения.', 'Бір шардан екі шарды қайтармай алу мүмкін емес.') : L('The urn is empty: add balls.', 'Урна пустая: добавь шаров.', 'Ыдыс бос: шар қос.'),
      };
    const capU = [
      L(`${r} red of ${n}: P = ${r}/${n}${frs(r, n) !== `${r}/${n}` ? ` = ${frs(r, n)}` : ''} ≈ ${fmt(res.p, 3)}.`, `${r} красных из ${n}: P = ${r}/${n}${frs(r, n) !== `${r}/${n}` ? ` = ${frs(r, n)}` : ''} ≈ ${fmt(res.p, 3)}.`, `${n} шардың ${r}-і қызыл: P = ${r}/${n}${frs(r, n) !== `${r}/${n}` ? ` = ${frs(r, n)}` : ''} ≈ ${fmt(res.p, 3)}.`),
      L(`Without return the second draw has one ball fewer: P = ${res.s} = ${frs(res.num, res.den)}. Multiply along the branch of the tree.`, `Без возврата во второй раз шаров на один меньше: P = ${res.s} = ${frs(res.num, res.den)}. Умножаем вероятности вдоль ветки дерева.`, `Қайтармағанда екінші рет шар біреуге аз: P = ${res.s} = ${frs(res.num, res.den)}. Ағаш бұтағы бойымен көбейтеміз.`),
      L(`With return the draws are independent: P = ${res.s} = ${frs(res.num, res.den)}.`, `С возвратом вынимания независимы: P = ${res.s} = ${frs(res.num, res.den)}.`, `Қайтарғанда алулар тәуелсіз: P = ${res.s} = ${frs(res.num, res.den)}.`),
      L(`Different colours: two branches (red-blue and blue-red), add them: P = ${res.s} = ${frs(res.num, res.den)}.`, `Разного цвета: две ветки (красный-синий и синий-красный), их складываем: P = ${res.s} = ${frs(res.num, res.den)}.`, `Түстері әртүрлі: екі бұтақ (қызыл-көк және көк-қызыл), оларды қосамыз: P = ${res.s} = ${frs(res.num, res.den)}.`),
    ][ev];
    return { svg: `${g}${tree()}${simTxt}${bottom}`, caption: J(capU, sim ? L(`Experiment: ${sim.k} of ${sim.n}.`, `Опыт: ${sim.k} из ${sim.n}.`, `Тәжірибе: ${sim.n}-ден ${sim.k}.`) : null) };
  },
});

// ---------- Системы уравнений ----------

const SSX = (x) => 160 + x * 18;
const SSY = (y) => 110 - y * 18;

function sysTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  if (type === 0) {
    let k1;
    let k2;
    let X;
    let Y;
    let b1;
    let b2;
    do {
      k1 = pick([-2, -1, -0.5, 0.5, 1, 2]);
      k2 = pick([-2, -1, -0.5, 0.5, 1, 2, 0]);
      X = rnd(-3, 3);
      Y = rnd(-3, 3);
      b1 = Y - k1 * X;
      b2 = Y - k2 * X;
    } while (k1 === k2 || Math.abs(b1) > 5 || Math.abs(b2) > 5);
    st.task = { type, X, Y, k1, b1, k2, b2, done: false };
    return { k1, b1, k2, b2: clamp(b2 + pick([-3, 3]), -6, 6) };
  }
  st.task = { type, done: false };
  return { k1: 1, b1: -1, k2: -0.5, b2: 2 };
}

const systems = modes({
  title: L('A system of two equations', 'Система двух уравнений', 'Екі теңдеу жүйесі'),
  intro: L('Each linear equation is a line. The solution of the system is the point lying on both lines.', 'Каждое линейное уравнение - прямая. Решение системы - точка, которая лежит на обеих прямых.', 'Әр сызықтық теңдеу - түзу. Жүйенің шешімі - екі түзуде де жатқан нүкте.'),
  sliders: [
    { id: 'k1', label: 'k₁', min: -3, max: 3, step: 0.5, value: 1 },
    { id: 'b1', label: 'b₁', min: -6, max: 6, step: 0.5, value: -1 },
    { id: 'k2', label: 'k₂', min: -3, max: 3, step: 0.5, value: -0.5 },
    { id: 'b2', label: 'b₂', min: -6, max: 6, step: 0.5, value: 2 },
  ],
  tabs: [L('Graph', 'График', 'График'), L('Step by step', 'По шагам', 'Қадаммен'), TASK],
  acts: [{ label: STEP, only: [1] }, { label: MORE }],
  state: () => ({ s: 0, pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return sysTask(st);
    return null;
  },
  onSlide(k, v, st) {
    st.s = Math.min(st.s, 4);
  },
  onAct(j, st) {
    if (j === 0) {
      st.s = (st.s + 1) % 5;
      return null;
    }
    if (st.m === 2) return sysTask(st);
    st.pre = (st.pre + 1) % 5;
    st.s = 0;
    return [{ k1: 2, b1: -3, k2: -1, b2: 3 }, { k1: 1, b1: 1, k2: 1, b2: -2 }, { k1: -0.5, b1: 2, k2: -0.5, b2: 2 }, { k1: 0, b1: 3, k2: 1.5, b2: 0 }, { k1: 1, b1: -1, k2: -0.5, b2: 2 }][st.pre];
  },
  draw(v, step, st) {
    const { k1, b1, k2, b2 } = v;
    const par = Math.abs(k1 - k2) < 1e-9;
    const same = par && Math.abs(b1 - b2) < 1e-9;
    const X = par ? 0 : (b2 - b1) / (k1 - k2);
    const Y = k1 * X + b1;
    const e1 = lineStr(k1, b1);
    const e2 = lineStr(k2, b2);
    const narrow = st.m === 1;
    const sx = narrow ? (x) => 80 + x * 14 : SSX;
    const sy = narrow ? (y) => 110 - y * 14 : SSY;
    const G = narrow ? grid({ x0: -5.5, x1: 5.5, y0: -7.5, y1: 7.5, X0: 3, X1: 157, Y0: 5, Y1: 215, lab: 2, ylab: 2 }).svg : grid({ x0: -8.8, x1: 8.8, y0: -6, y1: 6, lab: 2, ylab: 2 }).svg;
    const xr = narrow ? 5.6 : 9;
    const line = (k, b, cls) => pth(`M${n1(sx(-xr))} ${n1(sy(-xr * k + b))} L${n1(sx(xr))} ${n1(sy(xr * k + b))}`, cls, 3);
    const vis = !par && Math.abs(X) < (narrow ? 5.5 : 8.8) && Math.abs(Y) < (narrow ? 7.5 : 6);
    const pt = vis ? `${ln(sx(X), sy(Y), sx(X), sy(0), 'exc-m ex-dash', 1.2)}${ln(sx(X), sy(Y), sx(0), sy(Y), 'exc-m ex-dash', 1.2)}${dot(sx(X), sy(Y), 6, 'exc-o')}${T(sx(X) + 8, sy(Y) - 8, `(${nice(X)}; ${nice(Y)})`, 'm11 tc exc-o ex-start h')}` : '';
    const lines = `${line(k2, b2, same ? 'exc-b' : 'exc-b')}${line(k1, b1, same ? 'exc-p ex-dash' : 'exc-p')}`;
    const verdict = same
      ? L('The lines coincide: every point is a solution - infinitely many solutions.', 'Прямые совпали: каждая их точка - решение, решений бесконечно много.', 'Түзулер беттесті: әр нүктесі - шешім, шешімдер шексіз көп.')
      : par
        ? L(`k₁ = k₂ = ${fmt(k1)}, b₁ ≠ b₂: the lines are parallel and never meet - no solutions.`, `k₁ = k₂ = ${fmt(k1)}, b₁ ≠ b₂: прямые параллельны и не пересекаются - решений нет.`, `k₁ = k₂ = ${fmt(k1)}, b₁ ≠ b₂: түзулер параллель, қиылыспайды - шешім жоқ.`)
        : null;

    if (st.m === 1) {
      const rows = [
        [`{ ${e1}`, 'exc-p'],
        [`{ ${e2}`, 'exc-b'],
        [`${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])}`, ''],
        [`${polyStr([[k1 - k2, 'x']]) === '0' ? '0·x' : polyStr([[k1 - k2, 'x']])} = ${fmt(b2 - b1)}`, ''],
        [par ? (same ? u('any x', 'x - любое', 'x - кез келген') : u('no x', 'нет x', 'x жоқ')) : `x = ${nice(b2 - b1)} : ${pn(k1 - k2)} = ${nice(X)}`, 'exc-o'],
        [par ? '' : `y = ${fmt(k1)}·${pn(X)}${term(b1)} = ${nice(Y)}`, 'exc-o'],
      ];
      const shown = Math.min(rows.length, st.s + 3);
      const txt = rows
        .slice(0, shown)
        .map(([s, c], i) => T(164, 26 + i * 28, s, `m10 ex-start ${c ? `tc ${c}` : ''}`))
        .join('');
      const caps = [
        L('Both right sides equal y, so we can set them equal (substitution).', 'Обе правые части равны y, значит их можно приравнять (подстановка).', 'Екі оң жақ та y-ке тең, демек оларды теңестіруге болады (ауыстыру).'),
        L('Collect x on the left, numbers on the right.', 'Переносим x влево, числа вправо.', 'x-ті солға, сандарды оңға шығарамыз.'),
        verdict ?? L(`Divide by ${fmt(k1 - k2)}: x = ${nice(X)}.`, `Делим на ${fmt(k1 - k2)}: x = ${nice(X)}.`, `${fmt(k1 - k2)}-ге бөлеміз: x = ${nice(X)}.`),
        verdict ?? L(`Put x into any equation: y = ${nice(Y)}. Answer: (${nice(X)}; ${nice(Y)}) - the orange point.`, `Подставим x в любое уравнение: y = ${nice(Y)}. Ответ: (${nice(X)}; ${nice(Y)}) - оранжевая точка.`, `x-ті кез келген теңдеуге қоямыз: y = ${nice(Y)}. Жауап: (${nice(X)}; ${nice(Y)}) - қызғылт сары нүкте.`),
        verdict ?? L(`Check in the second equation: ${fmt(k2)}·${pn(X)}${term(b2)} = ${nice(k2 * X + b2)} ✓`, `Проверка во втором уравнении: ${fmt(k2)}·${pn(X)}${term(b2)} = ${nice(k2 * X + b2)} ✓`, `Екінші теңдеуде тексеру: ${fmt(k2)}·${pn(X)}${term(b2)} = ${nice(k2 * X + b2)} ✓`),
      ];
      return { svg: `${G}${lines}${st.s >= 3 ? pt : ''}${txt}`, caption: J(L(`Step ${st.s + 1} of 5.`, `Шаг ${st.s + 1} из 5.`, `${st.s + 1}-қадам (5-тен).`), caps[st.s]) };
    }

    const head = `${T(8, 18, e1, 'm12 tc exc-p ex-start h')}${T(8, 36, e2, 'm12 tc exc-b ex-start h')}`;
    if (st.m === 2) {
      const tk = st.task ?? (sysTask(st), st.task);
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = !par && near(X, tk.X, 0.01) && near(Y, tk.Y, 0.01);
        tag = `(${tk.X}; ${tk.Y})`.replace(/-/g, '−');
        ask = L(`Move the lines so that the solution is (${fmt(tk.X)}; ${fmt(tk.Y)}) - the orange ring.`, `Сдвинь прямые так, чтобы решением была точка (${fmt(tk.X)}; ${fmt(tk.Y)}) - оранжевое кольцо.`, `Шешімі (${fmt(tk.X)}; ${fmt(tk.Y)}) нүктесі болатындай түзулерді жылжыт - қызғылт сары сақина.`);
        hint = L(`Now ${par ? 'there is no single point' : `(${nice(X)}; ${nice(Y)})`}. Hint: the point must lie on both lines: b = y − kx.`, `Сейчас ${par ? 'одной точки нет' : `(${nice(X)}; ${nice(Y)})`}. Подсказка: точка должна лежать на обеих прямых: b = y − kx.`, `Қазір ${par ? 'бір нүкте жоқ' : `(${nice(X)}; ${nice(Y)})`}. Кеңес: нүкте екі түзуде де жатуы керек: b = y − kx.`);
      } else if (tk.type === 1) {
        ok = par && !same;
        tag = u('no solutions', 'нет решений', 'шешім жоқ');
        ask = L('Make a system with no solutions.', 'Сделай систему, у которой нет решений.', 'Шешімі жоқ жүйе құрастыр.');
        hint = L('Hint: the lines must never meet. What must be equal: k or b?', 'Подсказка: прямые не должны встречаться. Что должно быть равно: k или b?', 'Кеңес: түзулер кездеспеуі керек. Не тең болуы керек: k ма, b ма?');
      } else {
        ok = same;
        tag = u('infinitely many', 'бесконечно много', 'шексіз көп');
        ask = L('Make a system with infinitely many solutions.', 'Сделай систему с бесконечным числом решений.', 'Шешімдері шексіз көп жүйе құрастыр.');
        hint = L('Hint: every point of one line must lie on the other.', 'Подсказка: каждая точка одной прямой должна лежать на другой.', 'Кеңес: бір түзудің әр нүктесі екіншісінде жатуы керек.');
      }
      ok = check(st, ok);
      const ringT = tk.type === 0 ? ring(SSX(tk.X), SSY(tk.Y), 8, 'exc-o', 2.5) : '';
      return { svg: `${G}${lines}${pt}${ringT}${head}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }

    return {
      svg: `${G}${lines}${pt}${head}`,
      caption:
        verdict ??
        L(
          `Set the right sides equal: ${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])} → x = ${nice(X)}, y = ${nice(Y)}. The lines cross at (${nice(X)}; ${nice(Y)}) - one solution, because k₁ ≠ k₂.`,
          `Приравняем правые части: ${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])} → x = ${nice(X)}, y = ${nice(Y)}. Прямые пересекаются в (${nice(X)}; ${nice(Y)}) - одно решение, потому что k₁ ≠ k₂.`,
          `Оң жақтарын теңестіреміз: ${polyStr([[k1, 'x'], [b1, '']])} = ${polyStr([[k2, 'x'], [b2, '']])} → x = ${nice(X)}, y = ${nice(Y)}. Түзулер (${nice(X)}; ${nice(Y)}) нүктесінде қиылысады - бір шешім, себебі k₁ ≠ k₂.`,
        ),
    };
  },
});