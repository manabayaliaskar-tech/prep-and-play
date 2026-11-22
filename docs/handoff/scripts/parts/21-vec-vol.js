// ---------- Векторы ----------

const VX = (x) => 120 + x * 20;
const VY = (y) => 130 - y * 20;
const vs = (x, y) => `(${fmt(x)}; ${fmt(y)})`;

function vecTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) t = { a: pick([[3, 1], [2, 2], [1, 3], [4, -2], [3, 2]]) };
  else if (type === 1) t = { a: [2, 1], S: [rnd(-3, 6), rnd(-2, 5)] };
  else t = { a: [3, 1], len: 5 };
  st.task = { type, done: false, ...t };
  const [ax, ay] = t.a;
  return { ax, ay, bx: 1, by: 1 };
}

const vectors = modes({
  title: L('Vectors', 'Векторы', 'Векторлар'),
  intro: L('A vector is an arrow (x; y). Drag the ends of a and b: coordinates add, subtract and multiply by a number.', 'Вектор - это стрелка (x; y). Перетаскивай концы a и b: координаты складываются, вычитаются и умножаются на число.', 'Вектор - (x; y) нұсқары. a мен b ұштарын сүйре: координаталар қосылады, азаяды және санға көбейтіледі.'),
  sliders: [{ id: 'k', label: 'k', min: -3, max: 3, step: 0.5, value: 2, hidden: only(1) }],
  values: { ax: 3, ay: 1, bx: 1, by: 2.5 },
  tabs: ['a + b', 'a − b, k·a', 'a · b', TASK],
  acts: [{ label: L('Rule ↻', 'Правило ↻', 'Ереже ↻'), only: [0] }, { label: MORE }],
  state: () => ({ par: false }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return vecTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 0) {
      st.par = !st.par;
      return null;
    }
    if (st.m === 3) return vecTask(st);
    return pick([{ ax: 3, ay: 1, bx: 1, by: 2.5 }, { ax: 2, ay: 2, bx: 2, by: -2 }, { ax: 4, ay: 0, bx: 2, by: 3 }, { ax: -2, ay: 3, bx: 4, by: 1 }]);
  },
  onDrag(key, p, v, st) {
    const x = clamp(Math.round(((p.x - 120) / 20) * 2) / 2, -5.5, 9.5);
    const y = clamp(Math.round(((130 - p.y) / 20) * 2) / 2, -4, 6);
    if (key === 'a' && !(st.m === 3)) [v.ax, v.ay] = [x, y];
    if (key === 'b') [v.bx, v.by] = [x, y];
  },
  draw(v, step, st) {
    const { ax, ay, bx, by } = v;
    const G = grid({ x0: -6, x1: 10, y0: -4.5, y1: 6.5, lab: 2, ylab: 2 }).svg;
    const O = [VX(0), VY(0)];
    const A = [VX(ax), VY(ay)];
    const B = [VX(bx), VY(by)];
    const la = Math.hypot(ax, ay);
    const lb = Math.hypot(bx, by);
    const handles = `${st.m === 3 ? '' : hit('a', A[0], A[1], 14)}${hit('b', B[0], B[1], 14)}${st.m === 3 ? '' : dot(A[0], A[1], 4, 'exc-p')}${dot(B[0], B[1], 4, 'exc-b')}`;
    const labA = T(A[0] + 6, A[1] - 6, 'a', 'm12 tc exc-p ex-start h');
    const labB = T(B[0] + 6, B[1] - 6, 'b', 'm12 tc exc-b ex-start h');
    const tk = st.m === 3 ? (st.task ?? (vecTask(st), st.task)) : null;

    if (st.m === 1) {
      const k = v.k;
      const D = [VX(ax - bx), VY(ay - by)];
      const K = [VX(k * ax), VY(k * ay)];
      return {
        svg: `${G}${arrow(A[0], A[1], VX(ax - bx), VY(ay - by), 'exc-b ex-faint', 2)}${arrow(O[0], O[1], K[0], K[1], 'exc-g', 4)}${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(O[0], O[1], B[0], B[1], 'exc-b')}${arrow(O[0], O[1], D[0], D[1], 'exc-o', 3)}${handles}${labA}${labB}
          ${T(8, 18, `a − b = ${vs(ax - bx, ay - by)}`, 'm11 tc exc-o ex-start h')}${T(8, 36, `${fmt(k)}·a = ${vs(k * ax, k * ay)}`, 'm11 tc exc-g ex-start h')}${T(D[0] + 6, D[1] + 12, 'a − b', 'm10 tc exc-o ex-start h')}`,
        caption: L(
          `a − b = a + (−b): from the end of a go along −b (faint blue). Coordinates: ${vs(ax, ay)} − ${vs(bx, by)} = ${vs(ax - bx, ay - by)}. k·a (green) stretches a ${fmt(Math.abs(k))} times${k < 0 ? ' and turns it around' : ''}: |k·a| = ${fmt(Math.abs(k) * la)}.`,
          `a − b = a + (−b): из конца a идём по −b (бледная синяя). Координаты: ${vs(ax, ay)} − ${vs(bx, by)} = ${vs(ax - bx, ay - by)}. k·a (зелёный) растягивает a в ${fmt(Math.abs(k))} раза${k < 0 ? ' и разворачивает' : ''}: |k·a| = ${fmt(Math.abs(k) * la)}.`,
          `a − b = a + (−b): a-ның соңынан −b бойымен жүреміз (бозғылт көк). Координаталар: ${vs(ax, ay)} − ${vs(bx, by)} = ${vs(ax - bx, ay - by)}. k·a (жасыл) a-ны ${fmt(Math.abs(k))} есе созады${k < 0 ? ' және кері бұрады' : ''}: |k·a| = ${fmt(Math.abs(k) * la)}.`,
        ),
      };
    }

    if (st.m === 2) {
      const dotp = ax * bx + ay * by;
      const cos = la && lb ? dotp / (la * lb) : 0;
      const phi = (Math.acos(clamp(cos, -1, 1)) * 180) / Math.PI;
      const a0 = (Math.atan2(ay, ax) * 180) / Math.PI;
      const b0 = (Math.atan2(by, bx) * 180) / Math.PI;
      let d0 = b0 - a0;
      if (d0 > 180) d0 -= 360;
      if (d0 < -180) d0 += 360;
      const pr = la ? dotp / (la * la) : 0;
      const F = [VX(pr * ax), VY(pr * ay)];
      const perp = Math.abs(dotp) < 1e-9 && la && lb;
      return {
        svg: `${G}${ln(B[0], B[1], F[0], F[1], 'exc-m ex-dash', 1.2)}${ln(O[0], O[1], F[0], F[1], 'exc-o', 5)}${la && lb ? pth(arcD(O[0], O[1], 22, a0, a0 + d0), 'exc-g', 2) : ''}${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(O[0], O[1], B[0], B[1], 'exc-b')}${handles}${labA}${labB}
          ${T(8, 18, `a · b = ${fmt(ax)}·${pn(bx)} + ${fmt(ay)}·${pn(by)} = ${fmt(dotp)}`, 'm11 ex-start h')}${T(8, 36, `φ = ${fmt(phi, 1)}°, cos φ = ${fmt(cos, 3)}`, 'm11 tc exc-g ex-start h')}${perp ? T(8, 54, 'a ⊥ b', 'm12 tc exc-g ex-start h') : ''}`,
        caption: J(
          L(`a · b = x₁x₂ + y₁y₂ = ${fmt(dotp)} = |a|·|b|·cos φ = ${fmt(la)}·${fmt(lb)}·${fmt(cos, 3)}.`, `a · b = x₁x₂ + y₁y₂ = ${fmt(dotp)} = |a|·|b|·cos φ = ${fmt(la)}·${fmt(lb)}·${fmt(cos, 3)}.`, `a · b = x₁x₂ + y₁y₂ = ${fmt(dotp)} = |a|·|b|·cos φ = ${fmt(la)}·${fmt(lb)}·${fmt(cos, 3)}.`),
          perp
            ? L('The product is 0 - the vectors are perpendicular!', 'Произведение равно 0 - векторы перпендикулярны!', 'Көбейтінді 0 - векторлар перпендикуляр!')
            : dotp > 0
              ? L('Positive: the angle is acute. The orange part is the shadow (projection) of b on a.', 'Положительное: угол острый. Оранжевый отрезок - «тень» (проекция) b на a.', 'Оң: бұрыш сүйір. Қызғылт сары кесінді - b-ның a-ға «көлеңкесі» (проекциясы).')
              : L('Negative: the angle is obtuse, b points "backwards" relative to a.', 'Отрицательное: угол тупой, b смотрит «назад» относительно a.', 'Теріс: бұрыш доғал, b a-ға қарағанда «артқа» қарайды.'),
        ),
      };
    }

    const S = [VX(ax + bx), VY(ay + by)];
    const sum = `${arrow(O[0], O[1], S[0], S[1], 'exc-o', 3.2)}${T(S[0] + 6, S[1] + 4, 'a + b', 'm11 tc exc-o ex-start h')}`;
    const rule = st.par
      ? `${arrow(B[0], B[1], S[0], S[1], 'exc-p ex-faint', 2)}${arrow(A[0], A[1], S[0], S[1], 'exc-b ex-faint', 2)}`
      : `${arrow(A[0], A[1], S[0], S[1], 'exc-b ex-faint', 2.2)}`;
    const base = `${G}${rule}${arrow(O[0], O[1], A[0], A[1], 'exc-p')}${arrow(O[0], O[1], B[0], B[1], 'exc-b')}${sum}${handles}${labA}${labB}`;
    if (tk) {
      let ok;
      let ask;
      let hint;
      let tag;
      if (tk.type === 0) {
        ok = Math.abs(ax * bx + ay * by) < 1e-9 && lb > 0;
        tag = 'a ⊥ b';
        ask = L(`a = ${vs(ax, ay)}. Drag b so that b ⊥ a.`, `a = ${vs(ax, ay)}. Перетащи b так, чтобы b ⊥ a.`, `a = ${vs(ax, ay)}. b ⊥ a болатындай b-ны сүйре.`);
        hint = L(`Now a·b = ${fmt(ax * bx + ay * by)}. Perpendicular means a·b = 0. Try (${fmt(-ay)}; ${fmt(ax)}).`, `Сейчас a·b = ${fmt(ax * bx + ay * by)}. Перпендикулярны - значит a·b = 0. Попробуй (${fmt(-ay)}; ${fmt(ax)}).`, `Қазір a·b = ${fmt(ax * bx + ay * by)}. Перпендикуляр - a·b = 0. (${fmt(-ay)}; ${fmt(ax)}) байқап көр.`);
      } else if (tk.type === 1) {
        ok = near(ax + bx, tk.S[0], 0.01) && near(ay + by, tk.S[1], 0.01);
        tag = `a + b = ${vs(...tk.S)}`;
        ask = L(`a = ${vs(ax, ay)}. Find b so that a + b = ${vs(...tk.S)}.`, `a = ${vs(ax, ay)}. Найди b, чтобы a + b = ${vs(...tk.S)}.`, `a = ${vs(ax, ay)}. a + b = ${vs(...tk.S)} болатындай b тап.`);
        hint = L(`Now a + b = ${vs(ax + bx, ay + by)}. Hint: b = (a + b) − a.`, `Сейчас a + b = ${vs(ax + bx, ay + by)}. Подсказка: b = (a + b) − a.`, `Қазір a + b = ${vs(ax + bx, ay + by)}. Кеңес: b = (a + b) − a.`);
      } else {
        ok = near(lb, 5, 1e-6);
        tag = '|b| = 5';
        ask = L('Make the length of b equal to 5.', 'Сделай длину вектора b равной 5.', 'b векторының ұзындығын 5-ке теңе.');
        hint = L(`Now |b| = √(${fmt(bx)}² + ${fmt(by)}²) = ${fmt(lb)}. Think of the triangle 3-4-5.`, `Сейчас |b| = √(${fmt(bx)}² + ${fmt(by)}²) = ${fmt(lb)}. Вспомни треугольник 3-4-5.`, `Қазір |b| = √(${fmt(bx)}² + ${fmt(by)}²) = ${fmt(lb)}. 3-4-5 үшбұрышын еске ал.`);
      }
      ok = check(st, ok);
      return { svg: `${base}${T(8, 18, `b = ${vs(bx, by)}`, 'm11 tc exc-b ex-start h')}${badge(tag, ok)}`, caption: taskCap(st, ok, ask, hint) };
    }
    return {
      svg: `${base}${T(8, 18, `a = ${vs(ax, ay)}, |a| = ${fmt(la)}`, 'm11 tc exc-p ex-start h')}${T(8, 36, `b = ${vs(bx, by)}, |b| = ${fmt(lb)}`, 'm11 tc exc-b ex-start h')}${T(8, 54, `a + b = ${vs(ax + bx, ay + by)}`, 'm11 tc exc-o ex-start h')}`,
      caption: st.par
        ? L(`Parallelogram rule: put a and b at one point - the sum is the diagonal. a + b = b + a = ${vs(ax + bx, ay + by)}, length ${fmt(Math.hypot(ax + bx, ay + by))}. Drag the arrow ends.`, `Правило параллелограмма: векторы из одной точки - сумма это диагональ. a + b = b + a = ${vs(ax + bx, ay + by)}, длина ${fmt(Math.hypot(ax + bx, ay + by))}. Перетаскивай концы стрелок.`, `Параллелограмм ережесі: векторлар бір нүктеден - қосынды диагональ. a + b = b + a = ${vs(ax + bx, ay + by)}, ұзындығы ${fmt(Math.hypot(ax + bx, ay + by))}. Нұсқар ұштарын сүйре.`)
        : L(`Triangle rule: put the start of b at the end of a (faint). The sum goes from the start of a to the end of b: ${vs(ax, ay)} + ${vs(bx, by)} = ${vs(ax + bx, ay + by)}. Drag the arrow ends.`, `Правило треугольника: начало b - в конец a (бледная стрелка). Сумма - из начала a в конец b: ${vs(ax, ay)} + ${vs(bx, by)} = ${vs(ax + bx, ay + by)}. Перетаскивай концы стрелок.`, `Үшбұрыш ережесі: b-ның басы - a-ның соңында (бозғылт нұсқар). Қосынды a-ның басынан b-ның соңына: ${vs(ax, ay)} + ${vs(bx, by)} = ${vs(ax + bx, ay + by)}. Нұсқар ұштарын сүйре.`),
    };
  },
});

// ---------- Объём и площадь поверхности ----------

const volume = modes({
  title: L('Volume and surface area', 'Объём и площадь поверхности', 'Көлем және бет ауданы'),
  intro: L('Volume of a prism or cylinder = base area × height; a cone or pyramid holds one third of that. Unfold a solid to see its surface area.', 'Объём призмы или цилиндра = площадь основания × высота; конус или пирамида - треть от этого. Разверни тело - увидишь площадь поверхности.', 'Призма не цилиндр көлемі = табан ауданы × биіктік; конус не пирамида - оның үштен бірі. Денені жазсаң - бет ауданын көресің.'),
  sliders: [
    { id: 'a', label: L('a (radius r)', 'a (радиус r)', 'a (радиус r)'), min: 1, max: 6, step: 0.5, value: 3 },
    { id: 'b', label: 'b', min: 1, max: 6, step: 0.5, value: 2, hidden: only(0) },
    { id: 'h', label: 'h', min: 1, max: 8, step: 0.5, value: 4, hidden: (v, st) => st.m === 3 },
  ],
  values: { ph: 0 },
  tabs: [L('Box', 'Параллелепипед', 'Параллелепипед'), L('Cylinder', 'Цилиндр', 'Цилиндр'), L('Cone', 'Конус', 'Конус'), L('Sphere', 'Шар', 'Шар')],
  acts: [{ label: L('Unfold ↔', 'Развёртка ↔', 'Жазба ↔'), only: [0, 1, 2] }],
  onTab() {
    return { ph: 0, $dur: 1 };
  },
  onAct(j, st, v) {
    return { ph: v.ph > 0.5 ? 0 : 1, $dur: 700 };
  },
  draw(v, step, st) {
    const { a, b, h } = v;
    const k = clamp(v.ph, 0, 1);
    const net = k > 0.5;
    const o1 = op(1 - k * 2);
    const o2 = op(k * 2 - 1);
    const P = Math.PI;
    const R = (x, y, w, hh, cls, o = 0.3) => box(x, y, w, hh, cls, 1, o) + `<rect class="ex-stroke exc-m" style="fill:none;stroke-width:1" x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(hh)}"/>`;
    if (st.m === 0) {
      const V = a * b * h;
      const S = 2 * (a * b + b * h + a * h);
      const s = Math.min(22, 150 / (h + b * 0.5), 150 / (a + b * 0.6));
      const dx = b * s * 0.6;
      const dy = b * s * 0.45;
      const x0 = 48;
      const y0 = 196;
      const W1 = a * s;
      const H1 = h * s;
      let grid3 = '';
      if (Number.isInteger(a) && Number.isInteger(h)) {
        for (let i = 1; i < a; i++) grid3 += ln(x0 + i * s, y0, x0 + i * s, y0 - H1, 'exc-b', 0.6);
        for (let j = 1; j < h; j++) grid3 += ln(x0, y0 - j * s, x0 + W1, y0 - j * s, 'exc-b', 0.6);
      }
      const solid = `<g opacity="${o1}">${poly([[x0, y0 - H1], [x0 + dx, y0 - H1 - dy], [x0 + W1 + dx, y0 - H1 - dy], [x0 + W1, y0 - H1]], 'exc-b', 0.55)}${poly([[x0 + W1, y0], [x0 + W1 + dx, y0 - dy], [x0 + W1 + dx, y0 - H1 - dy], [x0 + W1, y0 - H1]], 'exc-b', 0.4)}${box(x0, y0 - H1, W1, H1, 'exc-b', 0, 0.3)}${grid3}
        <path class="ex-stroke exc-m" style="stroke-width:1.5;fill:none" d="M${x0} ${y0} H${n1(x0 + W1)} V${n1(y0 - H1)} H${x0} Z M${x0} ${n1(y0 - H1)} l${n1(dx)} ${n1(-dy)} h${n1(W1)} l${n1(-dx)} ${n1(dy)} M${n1(x0 + W1 + dx)} ${n1(y0 - H1 - dy)} v${n1(H1)} l${n1(-dx)} ${n1(dy)}"/>
        ${T(x0 + W1 / 2, y0 + 13, `a = ${fmt(a)}`, 'm10')}${T(x0 + W1 + dx / 2 + 6, y0 - dy / 2 + 8, `b = ${fmt(b)}`, 'm10 ex-start')}${T(x0 - 4, y0 - H1 / 2, `h = ${fmt(h)}`, 'm10 ex-end')}</g>`;
      // развёртка: крест
      const t = Math.min(12, 200 / (2 * h + 2 * b), 190 / (2 * a + 2 * b));
      const nx = 20;
      const ny = 16;
      const A1 = a * t;
      const B1 = b * t;
      const H2 = h * t;
      const netS = `<g opacity="${o2}">${R(nx + B1, ny, A1, B1, 'exc-o')}${R(nx, ny + B1, B1, H2, 'exc-g')}${R(nx + B1, ny + B1, A1, H2, 'exc-b')}${R(nx + B1 + A1, ny + B1, B1, H2, 'exc-g')}${R(nx + 2 * B1 + A1, ny + B1, A1, H2, 'exc-b')}${R(nx + B1, ny + B1 + H2, A1, B1, 'exc-o')}</g>`;
      return {
        svg: `${solid}${netS}${T(250, 40, `V = a·b·h`, 'm12')}${T(250, 60, `= ${fmt(V)}`, 'm15 tc exc-p')}${T(250, 100, 'S = 2(ab + bh + ah)', 'm10')}${T(250, 120, `= ${fmt(S)}`, 'm12 tc exc-o')}`,
        caption: net
          ? L(`The surface unfolds into 6 rectangles: two a×b (orange), two a×h (blue), two b×h (green). S = 2(${fmt(a * b)} + ${fmt(b * h)} + ${fmt(a * h)}) = ${fmt(S)}.`, `Поверхность разворачивается в 6 прямоугольников: два a×b (оранжевые), два a×h (синие), два b×h (зелёные). S = 2(${fmt(a * b)} + ${fmt(b * h)} + ${fmt(a * h)}) = ${fmt(S)}.`, `Бет 6 тіктөртбұрышқа жазылады: екі a×b (қызғылт сары), екі a×h (көк), екі b×h (жасыл). S = 2(${fmt(a * b)} + ${fmt(b * h)} + ${fmt(a * h)}) = ${fmt(S)}.`)
          : L(`V = a·b·h = ${fmt(a)}·${fmt(b)}·${fmt(h)} = ${fmt(V)}: the base a×b = ${fmt(a * b)} is stacked ${fmt(h)} times. Double one edge - the volume doubles.`, `V = a·b·h = ${fmt(a)}·${fmt(b)}·${fmt(h)} = ${fmt(V)}: основание a×b = ${fmt(a * b)} уложено в ${fmt(h)} слоёв. Удвой одно ребро - объём удвоится.`, `V = a·b·h = ${fmt(a)}·${fmt(b)}·${fmt(h)} = ${fmt(V)}: a×b = ${fmt(a * b)} табаны ${fmt(h)} қабат болып жатыр. Бір қырын екі есе арттырсаң - көлем екі есе артады.`),
      };
    }
    const r = a;
    if (st.m === 3) {
      const s = Math.min(26, 90 / r);
      const cx = 100;
      const cy = 112;
      const Rr = r * s;
      const V = (4 / 3) * P * r ** 3;
      const S = 4 * P * r * r;
      return {
        svg: `<rect class="ex-stroke exc-m ex-dash" style="fill:none;stroke-width:1.2" x="${n1(cx - Rr)}" y="${n1(cy - Rr)}" width="${n1(2 * Rr)}" height="${n1(2 * Rr)}"/><circle class="ex-fill exc-b" style="opacity:.3" cx="${cx}" cy="${cy}" r="${n1(Rr)}"/><circle class="ex-stroke exc-b" style="fill:none;stroke-width:2" cx="${cx}" cy="${cy}" r="${n1(Rr)}"/><ellipse class="ex-stroke exc-b ex-dash" style="fill:none;stroke-width:1.2" cx="${cx}" cy="${cy}" rx="${n1(Rr)}" ry="${n1(Rr * 0.3)}"/>${ln(cx, cy, cx + Rr, cy, 'exc-o', 2)}${T(cx + Rr / 2, cy - 5, `r = ${fmt(r)}`, 'm10 tc exc-o h')}
          ${T(250, 40, 'V = 4/3 πr³', 'm12')}${T(250, 60, `= ${fmt(V)}`, 'm15 tc exc-p')}${T(250, 100, 'S = 4πr²', 'm12')}${T(250, 120, `= ${fmt(S)}`, 'm12 tc exc-o')}${T(250, 160, `${u('cylinder', 'цилиндр', 'цилиндр')}: ${fmt(2 * P * r ** 3)}`, 'm10 exm-mut')}`,
        caption: L(`A ball of radius ${fmt(r)}: V = 4/3·π·r³ = ${fmt(V)}, S = 4πr² = ${fmt(S)}. Archimedes: the ball takes exactly 2/3 of the cylinder around it (dashed), V = 2/3 · 2πr³.`, `Шар радиуса ${fmt(r)}: V = 4/3·π·r³ = ${fmt(V)}, S = 4πr² = ${fmt(S)}. Архимед: шар занимает ровно 2/3 описанного цилиндра (пунктир), V = 2/3 · 2πr³.`, `Радиусы ${fmt(r)} шар: V = 4/3·π·r³ = ${fmt(V)}, S = 4πr² = ${fmt(S)}. Архимед: шар сырттай сызылған цилиндрдің дәл 2/3 бөлігін алады (пунктир), V = 2/3 · 2πr³.`),
      };
    }
    const cone = st.m === 2;
    const Sb = P * r * r;
    const Vv = cone ? (Sb * h) / 3 : Sb * h;
    const l = Math.hypot(r, h);
    const Sside = cone ? P * r * l : 2 * P * r * h;
    const Stot = Sside + (cone ? Sb : 2 * Sb);
    const s = Math.min(18, 160 / h, 85 / r);
    const cx = 100;
    const base = 196;
    const Rr = r * s;
    const Hh = h * s;
    const ry = Rr * 0.3;
    const top = base - Hh;
    const solid = `<g opacity="${o1}">${cone ? `<path class="ex-fill exc-o" style="opacity:.45" d="M${n1(cx - Rr)} ${base} L${cx} ${n1(top)} L${n1(cx + Rr)} ${base} A${n1(Rr)} ${n1(ry)} 0 0 1 ${n1(cx - Rr)} ${base} Z"/>` : `<path class="ex-fill exc-b" style="opacity:.4" d="M${n1(cx - Rr)} ${n1(top)} V${base} A${n1(Rr)} ${n1(ry)} 0 0 0 ${n1(cx + Rr)} ${base} V${n1(top)} Z"/><ellipse class="ex-fill exc-b" style="opacity:.6" cx="${cx}" cy="${n1(top)}" rx="${n1(Rr)}" ry="${n1(ry)}"/>`}
      <ellipse class="ex-stroke exc-m" style="fill:none;stroke-width:1.2" cx="${cx}" cy="${base}" rx="${n1(Rr)}" ry="${n1(ry)}"/>${ln(cx, base, cx, top, 'exc-k ex-dash', 1.5)}${ln(cx, base, cx + Rr, base, 'exc-p', 2)}
      ${T(cx + Rr / 2, base - 4, 'r', 'm11 tc exc-p h')}${T(cx - 5, (base + top) / 2, 'h', 'm11 tc exc-k ex-end h')}${cone ? T((cx + Rr + cx) / 2 + 10, (base + top) / 2, `l = ${fmt(l)}`, 'm10 ex-start h') : ''}</g>`;
    // развёртка
    let netS;
    const t = cone ? Math.min(60 / l, 14) : Math.min(180 / (2 * P * r), 120 / (h + 4 * r), 14);
    if (cone) {
      const ang = (360 * r) / l;
      const L1 = l * t;
      netS = `<g opacity="${o2}"><path class="ex-fill exc-o" style="opacity:.45" d="${arcD(100, 30, L1, -90 - ang / 2, -90 + ang / 2, true)}"/><circle class="ex-fill exc-b" style="opacity:.4" cx="100" cy="${n1(30 + L1 + r * t + 4)}" r="${n1(r * t)}"/>${T(100, 24, `${fmt(ang, 0)}°`, 'm10 exm-mut')}</g>`;
    } else {
      const Wd = 2 * P * r * t;
      const Hn = h * t;
      const y1 = 110 - Hn / 2;
      netS = `<g opacity="${o2}">${R(100 - Wd / 2, y1, Wd, Hn, 'exc-b', 0.35)}<circle class="ex-fill exc-b" style="opacity:.5" cx="100" cy="${n1(y1 - r * t)}" r="${n1(r * t)}"/><circle class="ex-fill exc-b" style="opacity:.5" cx="100" cy="${n1(y1 + Hn + r * t)}" r="${n1(r * t)}"/>${T(100, y1 + Hn / 2 + 4, `2πr = ${fmt(2 * P * r)}`, 'm10 h')}</g>`;
    }
    return {
      svg: `${solid}${netS}${T(250, 30, cone ? 'V = ⅓ πr²h' : 'V = πr²h', 'm12')}${T(250, 52, `= ${fmt(Vv)}`, 'm15 tc exc-p')}${T(250, 90, cone ? 'S = πr² + πrl' : 'S = 2πr² + 2πrh', 'm10')}${T(250, 110, `= ${fmt(Stot)}`, 'm12 tc exc-o')}${cone ? T(250, 150, `${u('3 cones = 1 cylinder', '3 конуса = 1 цилиндр', '3 конус = 1 цилиндр')}`, 'm10 exm-mut') : ''}`,
      caption: net
        ? cone
          ? L(`The side of a cone unrolls into a sector of radius l = √(r² + h²) = ${fmt(l)}: its area is πrl = ${fmt(Sside)}. Plus the base πr² = ${fmt(Sb)}: S = ${fmt(Stot)}.`, `Боковая поверхность конуса разворачивается в сектор радиуса l = √(r² + h²) = ${fmt(l)}: его площадь πrl = ${fmt(Sside)}. Плюс основание πr² = ${fmt(Sb)}: S = ${fmt(Stot)}.`, `Конустың бүйір беті радиусы l = √(r² + h²) = ${fmt(l)} секторға жазылады: ауданы πrl = ${fmt(Sside)}. Қосу табан πr² = ${fmt(Sb)}: S = ${fmt(Stot)}.`)
          : L(`The side of a cylinder unrolls into a rectangle 2πr × h = ${fmt(2 * P * r)} × ${fmt(h)} = ${fmt(Sside)}. Plus two circles 2πr² = ${fmt(2 * Sb)}: S = ${fmt(Stot)}.`, `Боковая поверхность цилиндра - прямоугольник 2πr × h = ${fmt(2 * P * r)} × ${fmt(h)} = ${fmt(Sside)}. Плюс два круга 2πr² = ${fmt(2 * Sb)}: S = ${fmt(Stot)}.`, `Цилиндрдің бүйір беті - 2πr × h = ${fmt(2 * P * r)} × ${fmt(h)} = ${fmt(Sside)} тіктөртбұрыш. Қосу екі дөңгелек 2πr² = ${fmt(2 * Sb)}: S = ${fmt(Stot)}.`)
        : cone
          ? L(`Cone: V = ⅓·πr²·h = ⅓·${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Three such cones fill a cylinder of the same size.`, `Конус: V = ⅓·πr²·h = ⅓·${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Три таких конуса заполняют цилиндр того же размера.`, `Конус: V = ⅓·πr²·h = ⅓·${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Осындай үш конус сол өлшемдегі цилиндрді толтырады.`)
          : L(`Cylinder: V = πr²·h = ${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Double r - the volume grows 4 times; double h - only 2 times.`, `Цилиндр: V = πr²·h = ${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. Удвой r - объём вырастет в 4 раза; h - только в 2 раза.`, `Цилиндр: V = πr²·h = ${fmt(Sb)}·${fmt(h)} = ${fmt(Vv)}. r-ді екі есе арттырсаң - көлем 4 есе өседі; h-ты - тек 2 есе.`),
    };
  },
});