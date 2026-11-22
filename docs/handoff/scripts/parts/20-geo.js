// ---------- Углы ----------

/** Вершины треугольника с углами A, B при основании, вписанные в рамку (x0, y0, w, h). */
function triFit(A, B, x0 = 14, y0 = 26, w = 190, h = 160) {
  const C = 180 - A - B;
  const PR = Math.sin(deg(B)) / Math.sin(deg(C));
  const R = [PR * Math.cos(deg(A)), PR * Math.sin(deg(A))];
  const xs = [0, 1, R[0]];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const s = Math.min(w / (maxX - minX), h / Math.max(R[1], 0.01));
  const ox = x0 + (w - (maxX - minX) * s) / 2 - minX * s;
  const oy = y0 + h;
  const P = (p) => [ox + p[0] * s, oy - p[1] * s];
  return { P: P([0, 0]), Q: P([1, 0]), R: P(R), s, C };
}
const wedge = (cx, cy, r, a0, sweep, cls) => `<path class="ex-fill ${cls}" style="opacity:.85" d="${arcD(cx, cy, r, a0, a0 + sweep, true)}"/>`;
const PAIRS = [
  { n: L('vertical', 'вертикальные', 'вертикаль'), a: 1, b: 3, eq: true },
  { n: L('corresponding', 'соответственные', 'сәйкес'), a: 1, b: 5, eq: true },
  { n: L('alternate interior', 'накрест лежащие', 'айқыш'), a: 4, b: 6, eq: true },
  { n: L('co-interior (same side)', 'односторонние', 'тұстас'), a: 4, b: 5, eq: false },
];

function angTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const A = rnd(3, 9) * 5;
    const Cg = pick([90, 60, 100, 45, 120, 75]);
    t = { A, Cg, B: 180 - A - Cg };
    if (t.B < 10) t = { A: 40, Cg: 90, B: 50 };
  } else if (type === 1) {
    const Cg = pick([20, 40, 60, 80, 100, 120, 30, 50]);
    t = { Cg, B: (180 - Cg) / 2 };
  } else {
    const A = rnd(4, 10) * 5;
    const Ext = A + rnd(4, 14) * 5;
    t = { A, Ext, B: 180 - Ext };
  }
  st.task = { type, done: false, ...t };
  return type === 1 ? { A: 50, B: 50 } : { A: t.A, B: 60 };
}

const angles = modes({
  title: L('Angles', 'Углы', 'Бұрыштар'),
  intro: L('The angles of a triangle add up to 180°. An exterior angle equals the sum of the two non-adjacent ones. Parallel lines cut by a transversal give equal angles.', 'Сумма углов треугольника - 180°. Внешний угол равен сумме двух несмежных с ним. Параллельные прямые и секущая дают равные углы.', 'Үшбұрыш бұрыштарының қосындысы - 180°. Сыртқы бұрыш онымен сыбайлас емес екі бұрыштың қосындысына тең. Параллель түзулер мен қиюшы тең бұрыштар береді.'),
  sliders: [
    { id: 'A', label: 'A°', min: 10, max: 150, value: 60, hidden: (v, st) => st.m === 3 && st.task?.type !== 1 },
    { id: 'B', label: 'B°', min: 10, max: 150, value: 50, hidden: only(0, 1, 3) },
  ],
  values: { ph: 0 },
  clamp(v) {
    if (v.A + v.B > 170) v.B = 170 - v.A;
  },
  tabs: [L('Sum 180°', 'Сумма 180°', 'Қосынды 180°'), L('Exterior', 'Внешний угол', 'Сыртқы бұрыш'), L('Parallel lines', 'Параллельные', 'Параллель түзулер'), TASK],
  acts: [{ label: L('▶ Put together', '▶ Сложить углы', '▶ Бұрыштарды қосу'), only: [0] }, { label: L('Pairs ↻', 'Пары ↻', 'Жұптар ↻'), only: [2] }, { label: MORE, only: [3] }],
  state: () => ({ pr: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return angTask(st);
    return { ph: 0, $dur: 1 };
  },
  onAct(j, st, v) {
    if (j === 0) return { ph: v.ph > 0.5 ? 0 : 1, $dur: 1400 };
    if (j === 1) {
      st.pr = (st.pr + 1) % PAIRS.length;
      return null;
    }
    return angTask(st);
  },
  draw(v, step, st) {
    const tk = st.m === 3 ? (st.task ?? (angTask(st), st.task)) : null;
    if (st.m === 2) {
      const A = v.A;
      const y1 = 70;
      const y2 = 152;
      const dx = (y2 - y1) / Math.tan(deg(A));
      const c1 = 160 + dx / 2;
      const c2 = 160 - dx / 2;
      const pr = PAIRS[st.pr];
      const val = (i) => ([1, 3, 5, 7].includes(i) ? A : 180 - A);
      // углы: 1 - вверх-вправо, 2 - вверх-влево, 3 - вниз-влево, 4 - вниз-вправо
      const starts = { 1: 0, 2: A, 3: 180, 4: 180 + A };
      let g = `${ln(10, y1, 310, y1, 'exc-b', 2.5)}${ln(10, y2, 310, y2, 'exc-b', 2.5)}${ln(c1 + 80 * Math.cos(deg(A)), y1 - 80 * Math.sin(deg(A)), c2 - 80 * Math.cos(deg(A)), y2 + 80 * Math.sin(deg(A)), 'exc-m', 2)}`;
      for (let i = 1; i <= 8; i++) {
        const k = ((i - 1) % 4) + 1;
        const [cx, cy] = i <= 4 ? [c1, y1] : [c2, y2];
        const on = i === pr.a || i === pr.b;
        const sw = k % 2 ? A : 180 - A;
        if (on) g += wedge(cx, cy, 24, starts[k], sw, i === pr.a ? 'exc-o' : pr.eq ? 'exc-o' : 'exc-g');
        const [lx, ly] = on ? on2(cx, cy, 34, starts[k] + sw / 2) : on2(cx, cy, 30, starts[k] + sw / 2);
        g += T(lx, ly + 4, on ? `${fmt(val(i), 0)}°` : i, `m10 ${on ? '' : 'exm-mut'}`);
      }
      g += T(312, 18, tx(pr.n), 'm12 ex-end') + T(14, y1 - 6, 'a', 'm11 tc exc-b ex-start') + T(14, y2 - 6, 'b', 'm11 tc exc-b ex-start') + T(160, 206, 'a ∥ b', 'm11 exm-mut');
      return {
        svg: g,
        caption: J(
          L(`${tx(pr.n, 'en')} angles ${pr.a} and ${pr.b}: `, `${tx(pr.n, 'ru')[0].toUpperCase()}${tx(pr.n, 'ru').slice(1)} углы ${pr.a} и ${pr.b}: `, `${tx(pr.n, 'kk')[0].toUpperCase()}${tx(pr.n, 'kk').slice(1)} ${pr.a} және ${pr.b} бұрыштар: `),
          pr.eq
            ? L(`they are equal, ${fmt(val(pr.a), 0)}° = ${fmt(val(pr.b), 0)}°.`, `они равны, ${fmt(val(pr.a), 0)}° = ${fmt(val(pr.b), 0)}°.`, `олар тең, ${fmt(val(pr.a), 0)}° = ${fmt(val(pr.b), 0)}°.`)
            : L(`they add up to 180°: ${fmt(val(pr.a), 0)}° + ${fmt(val(pr.b), 0)}° = 180°.`, `в сумме 180°: ${fmt(val(pr.a), 0)}° + ${fmt(val(pr.b), 0)}° = 180°.`, `қосындысы 180°: ${fmt(val(pr.a), 0)}° + ${fmt(val(pr.b), 0)}° = 180°.`),
          L('Only two different values appear: A and 180° − A. "Pairs ↻" shows other pairs.', 'Всего два разных значения: A и 180° − A. «Пары ↻» - другие пары.', 'Барлығы екі түрлі мән: A және 180° − A. «Жұптар ↻» - басқа жұптар.'),
        ),
      };
    }
    const A = tk && tk.type !== 1 ? tk.A : v.A;
    const B = Math.min(v.B, 170 - A);
    const { P, Q, R, C } = triFit(A, B);
    const k = clamp(v.ph, 0, 1);
    const kind =
      Math.abs(C - 90) < 0.5 || Math.abs(A - 90) < 0.5 || Math.abs(B - 90) < 0.5
        ? L('right', 'прямоугольный', 'тікбұрышты')
        : Math.max(A, B, C) > 90
          ? L('obtuse', 'тупоугольный', 'доғал бұрышты')
          : L('acute', 'остроугольный', 'сүйір бұрышты');
    const iso = Math.abs(A - B) < 0.5 || Math.abs(A - C) < 0.5 || Math.abs(B - C) < 0.5;
    const tri = `<path class="ex-tri" d="M${pts([P, Q, R])} Z"/>`;
    const lab = (p, a0, sw, s, cls) => {
      const [x, y] = on2(p[0], p[1], 34, a0 + sw / 2);
      return T(x, y + 4, s, `m10 tc ${cls} h`);
    };
    if (st.m === 1 || tk?.type === 2) {
      const ext = 180 - B;
      const svg = `${ln(Q[0], Q[1], Math.min(316, Q[0] + 90), Q[1], 'exc-m ex-dash', 2)}${tri}${wedge(P[0], P[1], 22, 0, A, 'exc-p')}${wedge(R[0], R[1], 22, 180 + A, C, 'exc-o')}${wedge(Q[0], Q[1], 18, 180 - B, B, 'exc-m')}${wedge(Q[0], Q[1], 28, 0, ext, 'exc-g')}
        ${lab(P, 0, A, `${fmt(A, 0)}°`, 'exc-p')}${lab(R, 180 + A, C, `${fmt(C, 0)}°`, 'exc-o')}${T(...on2(Q[0], Q[1], 44, ext / 2), `${fmt(ext, 0)}°`, 'm11 tc exc-g h')}
        ${T(240, 30, `${u('ext.', 'внешн.', 'сырт.')} = 180° − B`, 'm11')}${T(240, 50, `= A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}°`, 'm11')}`;
      if (tk) {
        const ok = check(st, near(180 - B, tk.Ext, 0.5));
        return { svg: `${svg}${badge(`A = ${tk.A}°, ${u('ext.', 'внешн.', 'сырт.')} B = ${tk.Ext}°`, ok)}`, caption: taskCap(st, ok, L(`A = ${tk.A}°, the exterior angle at B is ${tk.Ext}°. Build the triangle: set B.`, `A = ${tk.A}°, внешний угол при B равен ${tk.Ext}°. Построй треугольник: установи B.`, `A = ${tk.A}°, B-дағы сыртқы бұрыш ${tk.Ext}°. Үшбұрышты тұрғыз: B-ны орнат.`), L(`Now the exterior angle is ${fmt(180 - B, 0)}°. Hint: interior + exterior = 180°.`, `Сейчас внешний угол ${fmt(180 - B, 0)}°. Подсказка: внутренний + внешний = 180°.`, `Қазір сыртқы бұрыш ${fmt(180 - B, 0)}°. Кеңес: ішкі + сыртқы = 180°.`)) };
      }
      return {
        svg,
        caption: L(
          `The exterior angle at B (green) = 180° − ${fmt(B, 0)}° = ${fmt(ext, 0)}°. It equals the sum of the two angles not next to it: A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}° = ${fmt(A + C, 0)}°.`,
          `Внешний угол при B (зелёный) = 180° − ${fmt(B, 0)}° = ${fmt(ext, 0)}°. Он равен сумме двух углов, не смежных с ним: A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}° = ${fmt(A + C, 0)}°.`,
          `B-дағы сыртқы бұрыш (жасыл) = 180° − ${fmt(B, 0)}° = ${fmt(ext, 0)}°. Ол өзімен сыбайлас емес екі бұрыштың қосындысына тең: A + C = ${fmt(A, 0)}° + ${fmt(C, 0)}° = ${fmt(A + C, 0)}°.`,
        ),
      };
    }
    // сумма углов: клинья переезжают к развёрнутому углу
    const O = [262, 186];
    const mv = (p, a0, to, sw, cls) => {
      const cx = lerp(p[0], O[0], k);
      const cy = lerp(p[1], O[1], k);
      return wedge(cx, cy, 26, lerp(a0, to, k), sw, cls);
    };
    const svg = `${ln(206, O[1], 316, O[1], 'exc-m', 1.5)}${tri}${mv(P, 0, 0, A, 'exc-p')}${mv(R, 180 + A, A, C, 'exc-o')}${mv(Q, 180 - B, A + C, B, 'exc-b')}
      ${k < 0.1 ? `${lab(P, 0, A, `${fmt(A, 0)}°`, 'exc-p')}${lab(Q, 180 - B, B, `${fmt(B, 0)}°`, 'exc-b')}${lab(R, 180 + A, C, `${fmt(C, 0)}°`, 'exc-o')}` : ''}${k > 0.9 ? T(O[0], O[1] - 40, '180°', 'm15') : ''}
      ${T(P[0] - 4, P[1] + 14, 'A', 'm11 exm-mut')}${T(Q[0] + 4, Q[1] + 14, 'B', 'm11 exm-mut')}${T(R[0], R[1] - 8, 'C', 'm11 exm-mut')}${T(312, 212, `${tx(kind)}${iso ? `, ${u('isosceles', 'равнобедренный', 'теңбүйірлі')}` : ''}`, 'm10 ex-end exm-mut')}`;
    if (tk) {
      const ok = check(st, tk.type === 0 ? near(B, tk.B, 0.5) : near(A, tk.B, 0.5) && near(B, tk.B, 0.5));
      const ask = tk.type === 0
        ? L(`A = ${tk.A}°. Make the angle C = ${tk.Cg}°: set B.`, `A = ${tk.A}°. Сделай угол C = ${tk.Cg}°: установи B.`, `A = ${tk.A}°. C = ${tk.Cg}° бұрышын жаса: B-ны орнат.`)
        : L(`Build an isosceles triangle (A = B) with the top angle C = ${tk.Cg}°.`, `Построй равнобедренный треугольник (A = B) с углом при вершине C = ${tk.Cg}°.`, `Төбесіндегі бұрышы C = ${tk.Cg}° теңбүйірлі үшбұрыш (A = B) тұрғыз.`);
      return { svg: `${svg}${badge(`C = ${tk.Cg}°`, ok)}`, caption: taskCap(st, ok, ask, L(`Now C = ${fmt(C, 0)}°. Hint: C = 180° − A − B.`, `Сейчас C = ${fmt(C, 0)}°. Подсказка: C = 180° − A − B.`, `Қазір C = ${fmt(C, 0)}°. Кеңес: C = 180° − A − B.`)) };
    }
    return {
      svg,
      caption:
        k > 0.9
          ? L(`${fmt(A, 0)}° + ${fmt(C, 0)}° + ${fmt(B, 0)}° = 180°: the three angles form a straight angle.`, `${fmt(A, 0)}° + ${fmt(C, 0)}° + ${fmt(B, 0)}° = 180°: три угла вместе образуют развёрнутый угол.`, `${fmt(A, 0)}° + ${fmt(C, 0)}° + ${fmt(B, 0)}° = 180°: үш бұрыш бірге жазыңқы бұрыш құрайды.`)
          : L(`C = 180° − A − B = 180° − ${fmt(A, 0)}° − ${fmt(B, 0)}° = ${fmt(C, 0)}°. The triangle is ${tx(kind, 'en')}. Press "Put together".`, `C = 180° − A − B = 180° − ${fmt(A, 0)}° − ${fmt(B, 0)}° = ${fmt(C, 0)}°. Треугольник ${tx(kind, 'ru')}. Нажми «Сложить углы».`, `C = 180° − A − B = 180° − ${fmt(A, 0)}° − ${fmt(B, 0)}° = ${fmt(C, 0)}°. Үшбұрыш ${tx(kind, 'kk')}. «Бұрыштарды қосу» бас.`),
    };
  },
});
/** Точка на окружности (как on), но возвращает [x, y] для подписи. */
function on2(cx, cy, r, a) {
  return on(cx, cy, r, a);
}

// ---------- Площади фигур ----------

const rot = (p, c, a) => {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * ca - dy * sa, c[1] + dx * sa + dy * ca];
};

const circleArea = modes({
  title: L('Areas of figures', 'Площади фигур', 'Фигуралардың аудандары'),
  intro: L('Cut a figure and rearrange the pieces into a rectangle - the area does not change. That is where every area formula comes from.', 'Разрежь фигуру и переложи куски в прямоугольник - площадь не изменится. Отсюда все формулы площадей.', 'Фигураны кесіп, бөліктерін тіктөртбұрышқа құрастыр - аудан өзгермейді. Аудан формулаларының бәрі осыдан шығады.'),
  sliders: [
    { id: 'a', label: L('base a', 'основание a', 'табан a'), min: 2, max: 12, step: 0.5, value: 8, hidden: only(0, 1, 2) },
    { id: 'b', label: L('top base b', 'верхнее основание b', 'жоғарғы табан b'), min: 1, max: 10, step: 0.5, value: 4, hidden: only(2) },
    { id: 'h', label: L('height h', 'высота h', 'биіктік h'), min: 1, max: 7, step: 0.5, value: 4, hidden: only(0, 1, 2) },
    { id: 'r', label: L('radius r', 'радиус r', 'радиус r'), min: 1, max: 5, step: 0.5, value: 3, hidden: only(3) },
  ],
  values: { ph: 0 },
  clamp(v) {
    if (v.b > v.a) v.b = v.a;
  },
  tabs: [L('Parallelogram', 'Параллелограмм', 'Параллелограмм'), L('Triangle', 'Треугольник', 'Үшбұрыш'), L('Trapezoid', 'Трапеция', 'Трапеция'), L('Circle', 'Круг', 'Дөңгелек')],
  acts: [{ label: L('▶ Cut and move', '▶ Разрезать', '▶ Кесу') }],
  onTab() {
    return { ph: 0, $dur: 1 };
  },
  onAct(j, st, v) {
    return { ph: v.ph > 0.5 ? 0 : 1, $dur: 1600 };
  },
  draw(v, step, st) {
    const k = ease(clamp(v.ph, 0, 1));
    const done = v.ph > 0.95;
    if (st.m === 3) {
      const r = v.r;
      const R = r * 20;
      const N = 16;
      const al = Math.PI / N;
      const cx = 160;
      const cy = 100;
      const w = (Math.PI * R) / N;
      const x0 = 160 - (Math.PI * R) / 2 - w / 2;
      const yB = 100 + R / 2;
      const sec = `M0 0 L${n1(-R * Math.sin(al))} ${n1(-R * Math.cos(al))} A${n1(R)} ${n1(R)} 0 0 1 ${n1(R * Math.sin(al))} ${n1(-R * Math.cos(al))} Z`;
      let g = '';
      for (let i = 0; i < N; i++) {
        const th = ((i + 0.5) * 360) / N;
        const up = i % 2 === 0;
        const tx0 = x0 + (i + 0.5) * w + (up ? 0 : 0);
        const tgt = up ? [tx0, yB] : [tx0, yB - R * Math.cos(al)];
        const rotA = up ? 0 : 180;
        let from = th;
        if (Math.abs(from - rotA) > 180) from -= 360 * Math.sign(from - rotA);
        const X = lerp(cx, tgt[0], k);
        const Y = lerp(cy, tgt[1], k);
        const A = lerp(from, rotA, k);
        g += `<path class="ex-fill ${i % 2 ? 'exc-b' : 'exc-p'}" style="opacity:.75" transform="translate(${n1(X)} ${n1(Y)}) rotate(${n1(A)})" d="${sec}"/>`;
      }
      const S = Math.PI * r * r;
      return {
        svg: `${g}${done ? `${T(160, yB + 18, `≈ πr = ${fmt(Math.PI * r)}`, 'm11 tc exc-o')}${T(x0 - 4, yB - R / 2 + 4, 'r', 'm12 tc exc-o ex-end')}` : ln(cx, cy, cx + R, cy, 'exc-o', 2) + T(cx + R / 2, cy - 5, 'r', 'm12 tc exc-o h')}
          ${T(8, 18, `S = πr² = ${fmt(S)}`, 'm12 ex-start')}${T(8, 214, `C = 2πr = ${fmt(2 * Math.PI * r)}`, 'm11 ex-start exm-mut')}`,
        caption: done
          ? L(`16 sectors make almost a rectangle: the top and bottom are half the circumference πr each, the height is r. S = πr · r = πr² = ${fmt(S)}. More sectors - closer to a true rectangle.`, `16 секторов сложились почти в прямоугольник: сверху и снизу по половине окружности πr, высота r. S = πr · r = πr² = ${fmt(S)}. Чем больше секторов, тем точнее прямоугольник.`, `16 сектор тіктөртбұрышқа жуық құрады: үсті мен асты шеңбердің жартысы πr, биіктігі r. S = πr · r = πr² = ${fmt(S)}. Сектор көп болса, тіктөртбұрыш дәлірек.`)
          : L(`A circle of radius ${fmt(r)}: circumference 2πr = ${fmt(2 * Math.PI * r)}. Cut it into 16 sectors and lay them head to tail.`, `Круг радиуса ${fmt(r)}: длина окружности 2πr = ${fmt(2 * Math.PI * r)}. Разрежем его на 16 секторов и уложим «валетом».`, `Радиусы ${fmt(r)} дөңгелек: шеңбер ұзындығы 2πr = ${fmt(2 * Math.PI * r)}. Оны 16 секторға бөліп, кезектестіріп қоямыз.`),
      };
    }
    const a = v.a;
    const h = v.h;
    const b = Math.min(v.b, a);
    const s = Math.min(24, 290 / (a + (st.m === 1 ? a : st.m === 2 ? b : a * 0.4) + 1), 120 / h);
    const X0 = 20;
    const Y0 = 196;
    const P = (x, y) => [X0 + x * s, Y0 - y * s];
    const hLine = (x) => `${ln(...P(x, 0), ...P(x, h), 'exc-o ex-dash', 1.5)}${T(P(x, h / 2)[0] + 4, P(x, h / 2)[1] + 4, `h = ${fmt(h)}`, 'm10 tc exc-o ex-start h')}`;
    const baseL = (x1, x2, txt) => T((P(x1, 0)[0] + P(x2, 0)[0]) / 2, Y0 + 15, txt, 'm10 tc exc-b');
    if (st.m === 0) {
      const sh = Math.min(h * 0.7, a * 0.45);
      const body = [P(sh, 0), P(a, 0), P(a + sh, h), P(sh, h)];
      const cut = [P(0, 0), P(sh, 0), P(sh, h)].map((p) => [p[0] + a * s * k, p[1]]);
      const S = a * h;
      return {
        svg: `${poly(body, 'exc-p', 0.35)}${poly(cut, 'exc-o', 0.6)}${pth(`M${pts([P(0, 0), P(a, 0), P(a + sh, h), P(sh, h)])} Z`, 'exc-p ex-dash', 1)}${hLine(sh)}${baseL(0, a, `a = ${fmt(a)}`)}${T(236, 30, done ? 'S = a · h' : 'S = ?', 'm15')}${T(236, 54, `= ${fmt(a)} · ${fmt(h)} = ${fmt(S)}`, 'm12')}`,
        caption: done
          ? L(`The cut-off triangle moved to the right: now it is a rectangle ${fmt(a)} by ${fmt(h)}. S = a·h = ${fmt(S)}. The slanted side does not matter - only the base and the height.`, `Отрезанный треугольник переехал вправо: получился прямоугольник ${fmt(a)} на ${fmt(h)}. S = a·h = ${fmt(S)}. Боковая сторона не важна - только основание и высота.`, `Кесілген үшбұрыш оңға көшті: ${fmt(a)}-ға ${fmt(h)} тіктөртбұрыш шықты. S = a·h = ${fmt(S)}. Бүйір қабырға маңызды емес - тек табан мен биіктік.`)
          : L(`Cut a triangle off along the height h (orange) and move it to the other side. Press ▶.`, `Отрежем треугольник по высоте h (оранжевый) и перенесём на другую сторону. Нажми ▶.`, `h биіктігі бойымен үшбұрышты кесіп (қызғылт сары), екінші жаққа көшірейік. ▶ бас.`),
      };
    }
    if (st.m === 1) {
      const c = a * 0.35;
      const A = P(0, 0);
      const B = P(a, 0);
      const Cc = P(c, h);
      const M = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
      const ang = Math.PI * k;
      const copy = [A, B, Cc].map((p) => rot(p, M, ang));
      const S = (a * h) / 2;
      return {
        svg: `${poly(copy, 'exc-o', 0.45)}${poly([A, B, Cc], 'exc-p', 0.45)}${pth(`M${pts([A, B, Cc])} Z`, 'exc-p', 2)}${hLine(c)}${baseL(0, a, `a = ${fmt(a)}`)}${T(236, 30, done ? 'S = ½ a · h' : 'S = ?', 'm15')}${T(236, 54, `= ½ · ${fmt(a)} · ${fmt(h)} = ${fmt(S)}`, 'm12')}`,
        caption: done
          ? L(`Two equal triangles make a parallelogram with area a·h = ${fmt(a * h)}. One triangle is half: S = ½·a·h = ${fmt(S)}.`, `Два одинаковых треугольника образуют параллелограмм площадью a·h = ${fmt(a * h)}. Один треугольник - половина: S = ½·a·h = ${fmt(S)}.`, `Екі бірдей үшбұрыш ауданы a·h = ${fmt(a * h)} параллелограмм құрайды. Бір үшбұрыш - жартысы: S = ½·a·h = ${fmt(S)}.`)
          : L('Take a copy of the triangle and turn it by 180°. Press ▶.', 'Возьмём копию треугольника и повернём на 180°. Нажми ▶.', 'Үшбұрыштың көшірмесін алып, 180°-қа бұрайық. ▶ бас.'),
      };
    }
    const d = (a - b) / 2;
    const A = P(0, 0);
    const B = P(a, 0);
    const Cc = P(d + b, h);
    const D = P(d, h);
    const M = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
    const copy = [A, B, Cc, D].map((p) => rot(p, M, Math.PI * k));
    const S = ((a + b) / 2) * h;
    return {
      svg: `${poly(copy, 'exc-o', 0.45)}${poly([A, B, Cc, D], 'exc-p', 0.45)}${pth(`M${pts([A, B, Cc, D])} Z`, 'exc-p', 2)}${hLine(d)}${baseL(0, a, `a = ${fmt(a)}`)}${T((D[0] + Cc[0]) / 2, D[1] - 6, `b = ${fmt(b)}`, 'm10 tc exc-b h')}${T(250, 30, done ? 'S = (a + b)/2 · h' : 'S = ?', 'm12')}${T(250, 54, `= (${fmt(a)} + ${fmt(b)})/2 · ${fmt(h)}`, 'm11')}${T(250, 74, `= ${fmt(S)}`, 'm15')}`,
      caption: done
        ? L(`Two trapezoids make a parallelogram with base a + b = ${fmt(a + b)} and height ${fmt(h)}. One trapezoid is half of it: S = (a + b)/2 · h = ${fmt(S)}.`, `Две трапеции дают параллелограмм с основанием a + b = ${fmt(a + b)} и высотой ${fmt(h)}. Одна трапеция - половина: S = (a + b)/2 · h = ${fmt(S)}.`, `Екі трапеция табаны a + b = ${fmt(a + b)}, биіктігі ${fmt(h)} параллелограмм береді. Бір трапеция - жартысы: S = (a + b)/2 · h = ${fmt(S)}.`)
        : L('Take a copy of the trapezoid and turn it by 180° around the middle of the side. Press ▶.', 'Возьмём копию трапеции и повернём на 180° вокруг середины боковой стороны. Нажми ▶.', 'Трапецияның көшірмесін бүйір қабырғасының ортасынан 180°-қа бұрайық. ▶ бас.'),
    };
  },
});