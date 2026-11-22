// ---------- Уравнение - весы ----------

/** Раскладка коробок на чаши для шага s. Возвращает Map id → [x, y]. */
function balStage(L1, R1) {
  const pos = new Map();
  const put = (ids, cx) => {
    const per = 7;
    const cnt = Math.min(per, Math.max(1, ids.length));
    ids.forEach((id, i) => pos.set(id, [cx - (cnt * 16) / 2 + (i % per) * 16, 150 - 17 - Math.floor(i / per) * 16]));
  };
  put(L1, 85);
  put(R1, 235);
  return pos;
}
const seq = (p, n, from = 0) => Array.from({ length: Math.max(0, n) }, (_, i) => `${p}${i + from}`);

function balTask(st) {
  const two = Math.random() < 0.4;
  const a = rnd(2, 5);
  const X = rnd(1, 6);
  const b = rnd(0, 8);
  const r = two ? (a - 1) * X + b : a * X + b;
  st.task = { two, a, X, b, r, done: false };
  return { x: 1, $dur: 300 };
}

const balance = modes({
  title: L('Equations as a balance', 'Уравнение - это весы', 'Теңдеу - таразы'),
  intro: L('An equation is a balance: do the same to both pans and it stays level.', 'Уравнение - это весы в равновесии: делай одно и то же с обеими чашами, и равновесие сохранится.', 'Теңдеу - тепе-теңдіктегі таразы: екі табаққа да бірдей әрекет жасасаң, тепе-теңдік сақталады.'),
  sliders: [
    { id: 'a', label: L('a - boxes x', 'a - коробок x', 'a - x қорапшасы'), min: 1, max: 5, value: 3, hidden: only(0, 1) },
    { id: 'x', label: L('x - weight of a box', 'x - вес коробки', 'x - қорапша салмағы'), min: 1, max: 6, value: 2 },
    { id: 'b', label: L('b - weights', 'b - гирь', 'b - гір'), min: 0, max: 8, value: 4, hidden: only(0, 1) },
  ],
  values: { ph: 0 },
  tabs: ['ax + b = c', 'ax + b = x + d', TASK],
  acts: [{ label: STEP, only: [0, 1] }, { label: MORE }],
  state: () => ({ pre: 0 }),
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return balTask(st);
    return { ph: 0, $dur: 1 };
  },
  onSlide(k, v) {
    v.ph = 0;
  },
  onAct(j, st, v) {
    if (j === 0) {
      const last = st.m === 1 ? 3 : 2;
      const nx = Math.round(v.ph) + 1;
      return nx > last ? { ph: 0, $dur: 1 } : { ph: nx, $dur: 900 };
    }
    if (st.m === 2) return balTask(st);
    st.pre = (st.pre + 1) % 4;
    return { ...[{ a: 2, x: 5, b: 3 }, { a: 4, x: 1, b: 6 }, { a: 5, x: 3, b: 0 }, { a: 3, x: 2, b: 4 }][st.pre], ph: 0, $dur: 1 };
  },
  draw(v, step, st) {
    const m = st.m;
    const tk = m === 2 ? (st.task ?? (balTask(st), st.task)) : null;
    const two = m === 1 || tk?.two;
    const a = tk ? tk.a : two ? Math.max(2, v.a) : v.a;
    const x = tk ? v.x : v.x;
    const b = tk ? tk.b : v.b;
    // правая часть: c = ax + b или x + d
    const d = two ? (tk ? tk.r : (a - 1) * x + b) : 0;
    const c = tk && !two ? tk.r : a * x + b;
    const stages = two
      ? [
          [[...seq('x', a), ...seq('w', b)], ['y0', ...seq('r', d)]],
          [[...seq('x', a - 1), ...seq('w', b)], seq('r', d)],
          [seq('x', a - 1), seq('r', d - b)],
          [['x0'], seq('r', (d - b) / Math.max(1, a - 1))],
        ]
      : [
          [[...seq('x', a), ...seq('w', b)], seq('r', c)],
          [seq('x', a), seq('r', c - b)],
          [['x0'], seq('r', (c - b) / a)],
        ];
    const ph = tk ? 0 : clamp(v.ph, 0, stages.length - 1);
    const s0 = Math.floor(ph);
    const s1 = Math.min(stages.length - 1, s0 + 1);
    const k = ph - s0;
    const A = balStage(...stages[s0]);
    const B = balStage(...stages[s1]);
    const ids = new Set([...A.keys(), ...B.keys()]);
    const lab = (id) => (id[0] === 'x' || id[0] === 'y' ? (tk ? String(x) : 'x') : '1');
    let boxes = '';
    let i = 0;
    for (const id of ids) {
      const p = A.get(id);
      const q = B.get(id);
      let xy;
      let o = 1;
      if (p && q) xy = [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
      else if (p) {
        xy = [p[0], p[1] - 24 * k];
        o = 1 - k;
      } else {
        xy = [q[0], q[1] - 24 * (1 - k)];
        o = k;
      }
      if (o > 0.02) boxes += `<g transform="translate(${n1(xy[0])} ${n1(xy[1])})" opacity="${op(o)}" data-key="${id}"><g class="${id[0] === 'x' || id[0] === 'y' ? 'ex-x' : 'ex-w'}" style="--i:${i++ % 12}"><rect width="15" height="15" rx="4"/><text x="7.5" y="11.5">${lab(id)}</text></g></g>`;
    }
    const left = a * x + b;
    const right = two ? x + d : c;
    const tilt = tk ? clamp((right - left) * 2.5, -11, 11) : 0;
    const scale = `<line class="ex-axis" x1="160" y1="154" x2="160" y2="196"/><path class="ex-base" d="M130 200 L190 200 L160 180 Z"/>
      <g transform="rotate(${n1(tilt)} 160 150)"><g class="ex-beam"><line x1="30" y1="150" x2="290" y2="150"/><path class="ex-pan" d="M25 150 Q85 176 145 150"/><path class="ex-pan" d="M175 150 Q235 176 295 150"/></g>${boxes}</g>`;
    const sN = Math.round(ph);
    const A1 = a === 1 ? '' : a;
    const eqs = two
      ? [`${A1}x + ${b} = x + ${d}`, `${a - 1 === 1 ? '' : a - 1}x + ${b} = ${d}`, `${a - 1 === 1 ? '' : a - 1}x = ${d - b}`, `x = ${x}`]
      : [`${A1}x + ${b} = ${c}`, `${A1}x = ${c - b}`, `x = ${x}`];

    if (tk) {
      const ok = check(st, x === tk.X);
      const eq = tk.two ? `${a}x + ${b} = x + ${tk.r}` : `${a}x + ${b} = ${tk.r}`;
      const side = left > right ? L('the left pan is heavier - try a smaller x', 'перевешивает левая чаша - попробуй x меньше', 'сол табақ ауыр - кішірек x байқап көр') : L('the right pan is heavier - try a bigger x', 'перевешивает правая чаша - попробуй x больше', 'оң табақ ауыр - үлкенірек x байқап көр');
      return {
        svg: `${scale}${T(160, 30, eq, 'm18')}${T(160, 52, `x = ${x}: ${left} ${left === right ? '=' : left > right ? '>' : '<'} ${right}`, `m12 tc ${ok ? 'exc-g' : 'exc-o'}`)}${badge('x = ?', ok)}`,
        caption: taskCap(
          st,
          ok,
          L(`Solve ${eq}: find the weight of a box x so that the scale is level.`, `Реши ${eq}: подбери вес коробки x, чтобы весы уравновесились.`, `${eq} теңдеуін шеш: таразы теңесетіндей x қорапшасының салмағын тап.`),
          J(L(`At x = ${x}: left ${a}·${x} + ${b} = ${left}, right ${right};`, `При x = ${x}: слева ${a}·${x} + ${b} = ${left}, справа ${right};`, `x = ${x} болғанда: солда ${a}·${x} + ${b} = ${left}, оңда ${right};`), side),
        ),
      };
    }

    const capsOne = [
      L(`Left: ${a} boxes x and ${b} weights; right: ${c} weights. Level: ${eqs[0]}.`, `Слева: ${a} ${pl(a, 'коробка', 'коробки', 'коробок')} x и ${b} ${pl(b, 'гиря', 'гири', 'гирь')}; справа: ${c} ${pl(c, 'гиря', 'гири', 'гирь')}. Равновесие: ${eqs[0]}.`, `Солда: ${a} x қорапшасы және ${b} гір; оңда: ${c} гір. Тепе-теңдік: ${eqs[0]}.`),
      L(`Take ${b} weights off both pans - still level: ${eqs[1]}.`, `Убираем по ${b} с обеих чаш - равновесие осталось: ${eqs[1]}.`, `Екі табақтан ${b} гірден аламыз - тепе-теңдік сақталды: ${eqs[1]}.`),
      L(`Divide both pans by ${a}: one box weighs ${x}. Check: ${a}·${x} + ${b} = ${c} ✓`, `Делим обе чаши на ${a}: одна коробка весит ${x}. Проверка: ${a}·${x} + ${b} = ${c} ✓`, `Екі табақты ${a}-ге бөлеміз: бір қорапша ${x} тартады. Тексеру: ${a}·${x} + ${b} = ${c} ✓`),
    ];
    const capsTwo = [
      L(`x is on both pans: ${eqs[0]}. First get rid of x on the right.`, `x есть на обеих чашах: ${eqs[0]}. Сначала уберём x справа.`, `x екі табақта да бар: ${eqs[0]}. Алдымен оң жақтағы x-ті алып тастаймыз.`),
      L(`Remove one box x from both pans: ${eqs[1]}. (This is moving x to the left side with the opposite sign.)`, `Убираем по одной коробке x с обеих чаш: ${eqs[1]}. (Это и есть перенос x влево с противоположным знаком.)`, `Екі табақтан бір x қорапшасын аламыз: ${eqs[1]}. (Бұл x-ті қарама-қарсы таңбамен солға шығару.)`),
      L(`Remove ${b} weights from both pans: ${eqs[2]}.`, `Убираем по ${b} гирь: ${eqs[2]}.`, `${b} гірден аламыз: ${eqs[2]}.`),
      L(`Divide by ${a - 1}: x = ${x}. Check: ${a}·${x} + ${b} = ${x} + ${d} = ${a * x + b} ✓`, `Делим на ${a - 1}: x = ${x}. Проверка: ${a}·${x} + ${b} = ${x} + ${d} = ${a * x + b} ✓`, `${a - 1}-ге бөлеміз: x = ${x}. Тексеру: ${a}·${x} + ${b} = ${x} + ${d} = ${a * x + b} ✓`),
    ];
    return {
      svg: `${scale}${T(160, 30, eqs[sN], 'm18')}${T(160, 50, `${u('step', 'шаг', 'қадам')} ${sN + 1} / ${eqs.length}`, 'm10 exm-mut')}`,
      caption: (two ? capsTwo : capsOne)[sN],
    };
  },
});

// ---------- Задачи на движение ----------

/** Машинка: корпус и колёса, cls - цвет; dir = 1 вправо, −1 влево. */
const car = (x, y, cls, dir = 1) =>
  `<g class="${cls}" transform="translate(${n1(x)} ${n1(y)}) scale(${dir} 1)"><path class="ex-fill" d="M-13 -4 h26 v-6 h-6 l-5 -6 h-9 l-5 6 h-1 Z"/><rect class="ex-fill" x="-14" y="-6" width="28" height="7" rx="2"/></g><circle class="ex-wheel" cx="${n1(x - 7)}" cy="${n1(y + 2)}" r="3"/><circle class="ex-wheel" cx="${n1(x + 7)}" cy="${n1(y + 2)}" r="3"/>`;

function motTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let S;
  let v1;
  let v2;
  let T0;
  do {
    v1 = rnd(4, 20) * 5;
    v2 = rnd(4, 20) * 5;
    T0 = pick([1, 1.5, 2, 2.5, 3, 4, 5]);
    S = type === 1 ? (v1 - v2) * T0 : (v1 + v2) * T0;
  } while (S < 10 || S > 400 || S % 10 || (type === 1 && v1 <= v2));
  st.task = { type, S, v1, v2, T0, done: false };
  st.dir = type === 1 ? 1 : 0;
  return type === 2 ? { S, v1, v2: 60, t: T0 } : { S, v1, v2, t: 0 };
}

const motion = modes({
  title: L('Motion problems', 'Задачи на движение', 'Қозғалыс есептері'),
  intro: L('Towards each other the distance shrinks by v₁ + v₂ every hour; when one catches up - by v₁ − v₂.', 'Навстречу друг другу расстояние каждый час уменьшается на v₁ + v₂, вдогонку - на v₁ − v₂.', 'Қарсы қозғалғанда арақашықтық әр сағат сайын v₁ + v₂-ге, қуып жеткенде v₁ − v₂-ге кемиді.'),
  sliders: [
    { id: 'S', label: L('S, km', 'S, км', 'S, км'), min: 10, max: 400, step: 10, value: 240, hidden: (v, st) => st.m === 2 },
    { id: 'v1', label: L('v₁, km/h', 'v₁, км/ч', 'v₁, км/сағ'), min: 5, max: 120, step: 5, value: 60, hidden: (v, st) => st.m === 2 },
    { id: 'v2', label: L('v₂, km/h', 'v₂, км/ч', 'v₂, км/сағ'), min: 5, max: 120, step: 5, value: 40, hidden: (v, st) => st.m === 2 && st.task?.type !== 2 },
    { id: 't', label: L('time t, h', 'время t, ч', 'уақыт t, сағ'), min: 0, max: 10, step: 0.1, value: 0, hidden: (v, st) => st.m === 2 && st.task?.type === 2 },
  ],
  tabs: [L('Towards', 'Навстречу', 'Қарсы'), L('Catching up', 'Вдогонку', 'Қуып жету'), TASK],
  acts: [{ label: PLAY, only: [0, 1] }, { label: MORE }],
  state: () => ({ pre: 0, dir: 0 }),
  onTab(m, st, v, again) {
    if (m < 2) st.dir = m;
    if (m === 2 && (again || !st.task || st.task.done)) return motTask(st);
    if (m === 2) st.dir = st.task.type === 1 ? 1 : 0;
    return { t: 0, $dur: 1 };
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      api.play('t', { dur: 5000, linear: true });
      return null;
    }
    if (st.m === 2) return motTask(st);
    st.pre = (st.pre + 1) % 4;
    return [{ S: 300, v1: 70, v2: 80, t: 0 }, { S: 120, v1: 90, v2: 60, t: 0 }, { S: 60, v1: 15, v2: 5, t: 0 }, { S: 240, v1: 60, v2: 40, t: 0 }][st.pre];
  },
  draw(v, step, st) {
    const { S, v1, v2, t } = v;
    const catchUp = st.dir === 1;
    const closing = catchUp ? v1 - v2 : v1 + v2;
    const tm = closing > 0 ? S / closing : Infinity;
    const Tv = Math.max(1, Math.ceil(Math.max(t, Number.isFinite(tm) ? tm * 1.4 : 6)));
    // позиции (км от точки старта первой машины)
    const p1 = (tt) => v1 * tt;
    const p2 = (tt) => (catchUp ? S + v2 * tt : S - v2 * tt);
    const Xm = catchUp ? Math.max(S + v2 * Tv, v1 * Tv) : S;
    const rx = (km) => 24 + (clamp(km, 0, Xm) / Xm) * 272;
    const gap = Math.max(0, catchUp ? p2(t) - p1(t) : p2(t) - p1(t));
    const met = t >= tm - 1e-9;
    const km = u('km', 'км', 'км');
    const hU = ui.h();
    // дорога
    let g = `<line class="ex-road" x1="18" y1="52" x2="302" y2="52"/>${ln(24, 40, 24, 64, 'exc-m', 1.5)}${T(24, 76, 'A', 'm10 exm-mut')}`;
    if (!catchUp) g += ln(296, 40, 296, 64, 'exc-m', 1.5) + T(296, 76, 'B', 'm10 exm-mut');
    else g += ln(rx(S), 40, rx(S), 64, 'exc-m ex-dash', 1) + T(rx(S), 76, `S = ${fmt(S)}`, 'm9 exm-mut');
    if (!met && gap > 0) g += `${ln(rx(p1(t)) + 16, 30, rx(p2(t)) - 16 * (catchUp ? 1 : 1), 30, 'exc-o', 1.2)}${T((rx(p1(t)) + rx(p2(t))) / 2, 26, `${ui.gap()}: ${fmt(gap, 1)} ${km}`, 'm10 tc exc-o h')}`;
    g += car(rx(p1(t)), 50, 'exc-p', 1) + car(rx(p2(t)), 50, 'exc-b', catchUp ? 1 : -1);
    // график s(t)
    const gx = (tt) => 40 + (tt / Tv) * 268;
    const gy = (km2) => 205 - (km2 / Xm) * 105;
    let gr = `${ln(40, 205, 312, 205, 'exc-m', 1.2)}${ln(40, 96, 40, 205, 'exc-m', 1.2)}${T(36, 100, `${fmt(Xm, 0)}`, 'm9 exm-mut ex-end')}${T(36, 208, '0', 'm9 exm-mut ex-end')}${T(312, 198, `t, ${hU}`, 'm9 exm-mut ex-end')}`;
    for (let i = 1; i <= Tv; i++) if (Tv <= 12 || i % 2 === 0) gr += ln(gx(i), 203, gx(i), 207, 'exc-m', 1) + T(gx(i), 216, i, 'm9 exm-mut');
    const lineT = (fn, cls) => pth(`M${n1(gx(0))} ${n1(gy(clamp(fn(0), 0, Xm)))} L${n1(gx(Tv))} ${n1(gy(clamp(fn(Tv), 0, Xm)))}`, cls, 2.2);
    gr += lineT(p1, 'exc-p') + lineT(p2, 'exc-b') + ln(gx(t), 96, gx(t), 205, 'exc-o', 1.2) + dot(gx(t), gy(clamp(p1(t), 0, Xm)), 3.5, 'exc-p') + dot(gx(t), gy(clamp(p2(t), 0, Xm)), 3.5, 'exc-b');
    if (Number.isFinite(tm) && tm <= Tv) gr += dot(gx(tm), gy(p1(tm)), 5, 'exc-g') + T(gx(tm) + 6, gy(p1(tm)) - 6, `t = ${fmt(tm)}`, 'm10 tc exc-g ex-start h');
    const head = T(8, 14, `t = ${fmt(t, 1)} ${hU}`, 'm10 ex-start');
    const sv = `${g}${gr}${head}${T(80, 14, `v = ${catchUp ? `${fmt(v1)} − ${fmt(v2)}` : `${fmt(v1)} + ${fmt(v2)}`} = ${fmt(closing)} ${km}/${hU}`, 'm10 ex-start')}`;

    if (st.m === 2) {
      const tk = st.task ?? (motTask(st), st.task);
      const ok = check(st, tk.type === 2 ? v2 === tk.v2 : near(t, tk.T0, 0.051) && S === tk.S && v1 === tk.v1 && v2 === tk.v2);
      const ask = [
        L(`Two cars ${tk.S} km apart drive towards each other at ${tk.v1} and ${tk.v2} km/h. When do they meet? Set t.`, `Две машины на расстоянии ${tk.S} км едут навстречу со скоростями ${tk.v1} и ${tk.v2} км/ч. Через сколько часов встретятся? Установи t.`, `Арақашықтығы ${tk.S} км екі көлік ${tk.v1} және ${tk.v2} км/сағ жылдамдықпен қарсы жүреді. Неше сағаттан кейін кездеседі? t-ны орнат.`),
        L(`A car at ${tk.v1} km/h chases a truck ${tk.S} km ahead going ${tk.v2} km/h. When will it catch up? Set t.`, `Машина ${tk.v1} км/ч догоняет грузовик, который на ${tk.S} км впереди и едет ${tk.v2} км/ч. Через сколько часов догонит? Установи t.`, `${tk.v1} км/сағ көлік ${tk.S} км алда ${tk.v2} км/сағ жылдамдықпен келе жатқан жүк көлігін қуады. Неше сағаттан кейін қуып жетеді? t-ны орнат.`),
        L(`${tk.S} km, v₁ = ${tk.v1} km/h, they met after ${fmt(tk.T0)} h. Find v₂.`, `${tk.S} км, v₁ = ${tk.v1} км/ч, встретились через ${fmt(tk.T0)} ч. Найди v₂.`, `${tk.S} км, v₁ = ${tk.v1} км/сағ, ${fmt(tk.T0)} сағаттан кейін кездесті. v₂-ні тап.`),
      ][tk.type];
      const hint = [
        L(`Hint: t = S : (v₁ + v₂) = ${tk.S} : ${tk.v1 + tk.v2}.`, `Подсказка: t = S : (v₁ + v₂) = ${tk.S} : ${tk.v1 + tk.v2}.`, `Кеңес: t = S : (v₁ + v₂) = ${tk.S} : ${tk.v1 + tk.v2}.`),
        L(`Hint: t = S : (v₁ − v₂) = ${tk.S} : ${tk.v1 - tk.v2}.`, `Подсказка: t = S : (v₁ − v₂) = ${tk.S} : ${tk.v1 - tk.v2}.`, `Кеңес: t = S : (v₁ − v₂) = ${tk.S} : ${tk.v1 - tk.v2}.`),
        L(`Hint: v₁ + v₂ = S : t = ${fmt(tk.S / tk.T0)} km/h.`, `Подсказка: v₁ + v₂ = S : t = ${fmt(tk.S / tk.T0)} км/ч.`, `Кеңес: v₁ + v₂ = S : t = ${fmt(tk.S / tk.T0)} км/сағ.`),
      ][tk.type];
      return { svg: `${sv}${badge(tk.type === 2 ? 'v₂ = ?' : 't = ?', ok)}`, caption: taskCap(st, ok, ask, J(L(`Now: t = ${fmt(t, 1)} h, gap ${fmt(gap, 1)} km.`, `Сейчас: t = ${fmt(t, 1)} ч, между машинами ${fmt(gap, 1)} км.`, `Қазір: t = ${fmt(t, 1)} сағ, арақашықтық ${fmt(gap, 1)} км.`), hint)) };
    }

    if (catchUp && closing <= 0)
      return {
        svg: sv,
        caption: L(`v₁ = ${fmt(v1)} is not faster than v₂ = ${fmt(v2)}: the gap never shrinks, the first car will not catch up.`, `v₁ = ${fmt(v1)} не больше v₂ = ${fmt(v2)}: расстояние не уменьшается, первая машина не догонит.`, `v₁ = ${fmt(v1)} v₂ = ${fmt(v2)}-ден артық емес: арақашықтық кемімейді, бірінші көлік қуып жетпейді.`),
      };
    const now = L(` Now t = ${fmt(t, 1)} h: the gap is ${fmt(S)} − ${fmt(closing)}·${fmt(t, 1)} = ${fmt(gap, 1)} km.`, ` Сейчас t = ${fmt(t, 1)} ч: между ними ${fmt(S)} − ${fmt(closing)}·${fmt(t, 1)} = ${fmt(gap, 1)} км.`, ` Қазір t = ${fmt(t, 1)} сағ: арасы ${fmt(S)} − ${fmt(closing)}·${fmt(t, 1)} = ${fmt(gap, 1)} км.`);
    return {
      svg: sv,
      caption: J(
        catchUp
          ? L(`Catching up speed v₁ − v₂ = ${fmt(v1)} − ${fmt(v2)} = ${fmt(closing)} km/h. Meeting after t = S : (v₁ − v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} h - where the lines cross on the graph.`, `Скорость сближения вдогонку v₁ − v₂ = ${fmt(v1)} − ${fmt(v2)} = ${fmt(closing)} км/ч. Догонит через t = S : (v₁ − v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} ч - там, где пересекаются линии графика.`, `Қуып жету жылдамдығы v₁ − v₂ = ${fmt(v1)} − ${fmt(v2)} = ${fmt(closing)} км/сағ. t = S : (v₁ − v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} сағаттан кейін қуып жетеді - графиктегі сызықтар қиылысатын жерде.`)
          : L(`Closing speed v₁ + v₂ = ${fmt(v1)} + ${fmt(v2)} = ${fmt(closing)} km/h. They meet after t = S : (v₁ + v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} h - where the lines cross on the graph.`, `Скорость сближения v₁ + v₂ = ${fmt(v1)} + ${fmt(v2)} = ${fmt(closing)} км/ч. Встретятся через t = S : (v₁ + v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} ч - там, где пересекаются линии графика.`, `Жақындасу жылдамдығы v₁ + v₂ = ${fmt(v1)} + ${fmt(v2)} = ${fmt(closing)} км/сағ. t = S : (v₁ + v₂) = ${fmt(S)} : ${fmt(closing)} = ${fmt(tm)} сағаттан кейін кездеседі - графиктегі сызықтар қиылысатын жерде.`),
        met ? L(' They have met.', ' Они уже встретились.', ' Олар кездесті.') : now,
      ),
    };
  },
});

// ---------- Неравенства ----------

const SIGNS = ['>', '≥', '<', '≤'];
const FLIP = { '>': '<', '≥': '≤', '<': '>', '≤': '≥' };
const SYS = [['>', '<'], ['≥', '≤'], ['>', '>'], ['≤', '<'], ['<', '>']];
const isx = (x) => (x === -Infinity ? '−∞' : x === Infinity ? '+∞' : fmt(x));
/** Множество как строка: [{lo, hi, lc, rc}] → «(−∞; 2] ∪ (3; +∞)». */
const setStr = (iv) => (iv.length ? iv.map((s) => (s.lo === s.hi ? `{${fmt(s.lo)}}` : `${s.lc ? '[' : '('}${isx(s.lo)}; ${isx(s.hi)}${s.rc ? ']' : ')'}`)).join(' ∪ ') : '∅');
/** Рисует множество на прямой (sx) на высоте y. */
function drawSet(iv, sx, y, cls = 'exc-p', w = 5) {
  let g = '';
  for (const s of iv) {
    const x1 = s.lo === -Infinity ? 8 : sx(s.lo);
    const x2 = s.hi === Infinity ? 312 : sx(s.hi);
    if (s.lo !== s.hi) g += ln(x1, y, x2, y, cls, w);
    if (s.lo !== -Infinity) g += s.lc ? dot(sx(s.lo), y, 5.5, cls) : ring(sx(s.lo), y, 5, cls, 2.5);
    if (s.hi !== Infinity && s.hi !== s.lo) g += s.rc ? dot(sx(s.hi), y, 5.5, cls) : ring(sx(s.hi), y, 5, cls, 2.5);
  }
  return g;
}
/** Решение x S c. */
const ray = (S, c) => (S === '>' || S === '≥' ? [{ lo: c, hi: Infinity, lc: S === '≥', rc: false }] : [{ lo: -Infinity, hi: c, lc: false, rc: S === '≤' }]);
/** Пересечение двух множеств из одного промежутка. */
function cut(A, B) {
  const a = A[0];
  const b = B[0];
  const lo = Math.max(a.lo, b.lo);
  const hi = Math.min(a.hi, b.hi);
  const lc = lo === a.lo && lo === b.lo ? a.lc && b.lc : lo === a.lo ? a.lc : b.lc;
  const rc = hi === a.hi && hi === b.hi ? a.rc && b.rc : hi === a.hi ? a.rc : b.rc;
  if (lo > hi || (lo === hi && !(lc && rc))) return [];
  return [{ lo, hi, lc, rc }];
}
/** Решение (x − p)(x − q) S 0. */
function quadSet(p, q, S) {
  const [r1, r2] = [Math.min(p, q), Math.max(p, q)];
  const cl = S === '≥' || S === '≤';
  const pos = S === '>' || S === '≥';
  if (r1 === r2) {
    if (pos) return cl ? [{ lo: -Infinity, hi: Infinity }] : [{ lo: -Infinity, hi: r1, lc: false, rc: false }, { lo: r1, hi: Infinity, lc: false, rc: false }];
    return cl ? [{ lo: r1, hi: r1, lc: true, rc: true }] : [];
  }
  return pos
    ? [{ lo: -Infinity, hi: r1, lc: false, rc: cl }, { lo: r2, hi: Infinity, lc: cl, rc: false }]
    : [{ lo: r1, hi: r2, lc: cl, rc: cl }];
}
const sameSet = (A, B) => setStr(A) === setStr(B);

function ineqTask(st) {
  const last = st.task?.type;
  let type;
  do type = rnd(0, 2);
  while (type === last);
  let t;
  if (type === 0) {
    const a = pick([-4, -3, -2, -1, 2, 3, 4]);
    const r = rnd(-4, 4);
    const s = rnd(0, 3);
    t = { a, r, s, want: ray(a < 0 ? FLIP[SIGNS[s]] : SIGNS[s], r), p: { a, b: 0 } };
  } else if (type === 1) {
    const p = rnd(-6, 2);
    const q = rnd(p + 1, 7);
    const s = rnd(0, 3);
    t = { s, want: quadSet(p, q, SIGNS[s]), p: { a: 0, b: 0 } };
  } else t = { sys: rnd(0, 1), p: { a: -2, b: 3 } };
  st.task = { type, done: false, ...t };
  st.s = t.s ?? 0;
  return t.p;
}

const inequality = modes({
  title: L('Inequalities', 'Неравенства', 'Теңсіздіктер'),
  intro: L('Solve like an equation, but dividing by a negative number flips the sign. The answer is a set on the number line.', 'Решаем как уравнение, но при делении на отрицательное число знак переворачивается. Ответ - множество на числовой прямой.', 'Теңдеу сияқты шешеміз, бірақ теріс санға бөлгенде таңба аударылады. Жауап - сан түзуіндегі жиын.'),
  sliders: [
    { id: 'a', label: 'a', min: -6, max: 6, step: 0.5, value: -2, hidden: (v, st) => st.m === 3 && st.task?.type === 0 },
    { id: 'b', label: 'b', min: -8, max: 8, step: 0.5, value: 4 },
  ],
  tabs: ['ax ? b', L('System', 'Система', 'Жүйе'), L('Intervals', 'Интервалы', 'Аралықтар'), TASK],
  acts: [{ label: L('Sign ↻', 'Знак ↻', 'Таңба ↻'), only: [0, 1, 2] }, { label: MORE, only: [3] }],
  state: () => ({ s: 0, sy: 0 }),
  onTab(m, st, v, again) {
    if (m === 3 && (again || !st.task || st.task.done)) return ineqTask(st);
    return null;
  },
  onAct(j, st) {
    if (j === 1) return ineqTask(st);
    if (st.m === 1) st.sy = (st.sy + 1) % SYS.length;
    else st.s = (st.s + 1) % 4;
    return null;
  },
  draw(v, step, st) {
    const { a, b } = v;
    const nl = numLine(-8, 8, 20, 300, 150, 1, 2);
    const sx = nl.sx;
    const tk = st.m === 3 ? (st.task ?? (ineqTask(st), st.task)) : null;
    const mode = tk ? [0, 2, 1][tk.type] : st.m;
    const S = SIGNS[st.s];

    if (mode === 0) {
      const A = tk ? tk.a : a;
      if (A === 0) {
        const ok0 = { '>': 0 > b, '≥': 0 >= b, '<': 0 < b, '≤': 0 <= b }[S];
        return {
          svg: `${nl.svg}${ok0 ? ln(8, 150, 312, 150, 'exc-p', 5) : ''}${T(160, 40, `0 · x ${S} ${fmt(b)}`, 'm18')}${T(160, 66, ok0 ? 'x ∈ (−∞; +∞)' : 'x ∈ ∅', 'm15 tc exc-p')}`,
          caption: ok0 ? L(`a = 0: 0 ${S} ${fmt(b)} is true for every x.`, `a = 0: 0 ${S} ${fmt(b)} верно при любом x.`, `a = 0: 0 ${S} ${fmt(b)} кез келген x үшін дұрыс.`) : L(`a = 0: 0 ${S} ${fmt(b)} is false - no solutions.`, `a = 0: 0 ${S} ${fmt(b)} неверно - решений нет.`, `a = 0: 0 ${S} ${fmt(b)} дұрыс емес - шешім жоқ.`),
        };
      }
      const r = b / A;
      const S2 = A < 0 ? FLIP[S] : S;
      const set = ray(S2, r);
      const svg = `${nl.svg}${drawSet(set, sx, 150)}${T(160, 34, `${fmt(A)}x ${S} ${fmt(b)}`, 'm18')}${T(160, 58, `x ${S2} ${fmt(b)} : ${pn(A)} = ${nice(r)}`, `m12 tc ${A < 0 ? 'exc-r' : 'exc-p'}`)}${T(160, 82, `x ∈ ${setStr(set)}`, 'm15 tc exc-p')}${Math.abs(r) <= 8 ? T(sx(r), 132, nice(r), 'm11 tc exc-p h') : ''}`;
      if (tk) {
        const ok = check(st, sameSet(set, tk.want));
        return {
          svg: `${svg}${badge(`x ∈ ${setStr(tk.want)}`, ok)}`,
          caption: taskCap(st, ok, L(`${fmt(tk.a)}x ${S} b. Choose b so that the answer is x ∈ ${setStr(tk.want)}.`, `${fmt(tk.a)}x ${S} b. Подбери b, чтобы ответ был x ∈ ${setStr(tk.want)}.`, `${fmt(tk.a)}x ${S} b. Жауап x ∈ ${setStr(tk.want)} болатындай b-ны таңда.`), L(`Now x ∈ ${setStr(set)}. Hint: the boundary is b : a, so b = a·${fmt(tk.r)}.`, `Сейчас x ∈ ${setStr(set)}. Подсказка: граница - это b : a, значит b = a·${pn(tk.r)}.`, `Қазір x ∈ ${setStr(set)}. Кеңес: шекара - b : a, демек b = a·${pn(tk.r)}.`)),
        };
      }
      return {
        svg,
        caption: L(
          `Divide both sides by a = ${fmt(A)}: x ${S2} ${nice(r)}.${A < 0 ? ' a < 0, so the sign flipped!' : ''} ${S === '≥' || S === '≤' ? 'A filled dot: the boundary belongs to the answer.' : 'An empty dot: the boundary is not included.'} Answer: x ∈ ${setStr(set)}.`,
          `Делим обе части на a = ${fmt(A)}: x ${S2} ${nice(r)}.${A < 0 ? ' a < 0, поэтому знак перевернулся!' : ''} ${S === '≥' || S === '≤' ? 'Точка закрашена: граница входит в ответ.' : 'Точка пустая: граница не входит.'} Ответ: x ∈ ${setStr(set)}.`,
          `Екі жағын a = ${fmt(A)}-ге бөлеміз: x ${S2} ${nice(r)}.${A < 0 ? ' a < 0, сондықтан таңба аударылды!' : ''} ${S === '≥' || S === '≤' ? 'Нүкте боялған: шекара жауапқа кіреді.' : 'Нүкте бос: шекара кірмейді.'} Жауап: x ∈ ${setStr(set)}.`,
        ),
      };
    }

    if (mode === 1) {
      const [S1, S2] = tk ? SYS[tk.sys] : SYS[st.sy];
      const A1 = ray(S1, a);
      const B1 = ray(S2, b);
      const res = cut(A1, B1);
      const svg = `${nl.svg}${drawSet(A1, sx, 96, 'exc-o', 3)}${drawSet(B1, sx, 116, 'exc-b', 3)}${drawSet(res, sx, 150, 'exc-p', 6)}
        ${T(8, 24, `{ x ${S1} ${fmt(a)}`, 'm15 tc exc-o ex-start')}${T(8, 48, `{ x ${S2} ${fmt(b)}`, 'm15 tc exc-b ex-start')}${T(312, 36, `x ∈ ${setStr(res)}`, 'm15 tc exc-p ex-end')}`;
      if (tk) {
        const ok = check(st, res.length === 0);
        return { svg: `${svg}${badge('∅', ok)}`, caption: taskCap(st, ok, L('Move a and b so that the system has no solutions.', 'Подвинь a и b так, чтобы у системы не было решений.', 'Жүйенің шешімі болмайтындай a мен b-ны жылжыт.'), L(`Now x ∈ ${setStr(res)}. The orange and blue rays must not overlap.`, `Сейчас x ∈ ${setStr(res)}. Оранжевый и синий лучи не должны перекрываться.`, `Қазір x ∈ ${setStr(res)}. Қызғылт сары мен көк сәулелер қабаттаспауы керек.`)) };
      }
      return {
        svg,
        caption: res.length
          ? L(`A system needs both conditions at once: take the overlap of the orange and blue rays: x ∈ ${setStr(res)}.`, `Система - это оба условия сразу: берём общую часть оранжевого и синего лучей: x ∈ ${setStr(res)}.`, `Жүйе - екі шарт бірге: қызғылт сары мен көк сәулелердің ортақ бөлігін аламыз: x ∈ ${setStr(res)}.`)
          : L('The rays do not overlap: the system has no solutions, x ∈ ∅.', 'Лучи не пересекаются: у системы нет решений, x ∈ ∅.', 'Сәулелер қиылыспайды: жүйенің шешімі жоқ, x ∈ ∅.'),
      };
    }

    // метод интервалов
    const p = a;
    const q = b;
    const set = quadSet(p, q, S);
    const [r1, r2] = [Math.min(p, q), Math.max(p, q)];
    let arcs = '';
    const parts = r1 === r2 ? [[-8, r1], [r1, 8]] : [[-8, r1], [r1, r2], [r2, 8]];
    parts.forEach(([lo, hi], i) => {
      const plus = r1 === r2 ? true : i !== 1;
      if (hi - lo < 0.01) return;
      const xa = sx(lo);
      const xb = sx(hi);
      arcs += pth(`M${n1(xa)} 150 Q${n1((xa + xb) / 2)} ${plus ? 112 : 126} ${n1(xb)} 150`, plus ? 'exc-g' : 'exc-r', 1.5) + T((xa + xb) / 2, plus ? 118 : 128, plus ? '+' : '−', `m15 tc ${plus ? 'exc-g' : 'exc-r'}`);
    });
    const svg = `${nl.svg}${arcs}${drawSet(set, sx, 184, 'exc-p', 5)}${[...new Set([r1, r2])].map((r) => (Math.abs(r) <= 8 ? T(sx(r), 204, fmt(r), 'm11 tc exc-p h') : '')).join('')}${T(160, 30, `(x${term(-p)})(x${term(-q)}) ${S} 0`, 'm18')}${T(160, 58, `x ∈ ${setStr(set)}`, 'm15 tc exc-p')}`;
    if (tk) {
      const ok = check(st, sameSet(set, tk.want));
      return {
        svg: `${svg}${badge(`x ∈ ${setStr(tk.want)}`, ok)}`,
        caption: taskCap(st, ok, L(`Choose the roots a and b so that (x − a)(x − b) ${S} 0 has the answer x ∈ ${setStr(tk.want)}.`, `Подбери корни a и b, чтобы у (x − a)(x − b) ${S} 0 ответ был x ∈ ${setStr(tk.want)}.`, `(x − a)(x − b) ${S} 0 жауабы x ∈ ${setStr(tk.want)} болатындай a мен b түбірлерін таңда.`), L(`Now x ∈ ${setStr(set)}. The roots are the ends of the intervals.`, `Сейчас x ∈ ${setStr(set)}. Корни - это концы промежутков.`, `Қазір x ∈ ${setStr(set)}. Түбірлер - аралықтардың шеттері.`)),
      };
    }
    return {
      svg,
      caption: L(
        `Interval method: the roots ${fmt(r1)}${r1 !== r2 ? ` and ${fmt(r2)}` : ''} cut the line. On the right the product is "+", and the sign changes at each simple root. We need "${S} 0": x ∈ ${setStr(set)}.`,
        `Метод интервалов: корни ${fmt(r1)}${r1 !== r2 ? ` и ${fmt(r2)}` : ''} делят прямую на промежутки. Справа произведение «+», при переходе через простой корень знак меняется. Нужно «${S} 0»: x ∈ ${setStr(set)}.`,
        `Аралықтар әдісі: ${fmt(r1)}${r1 !== r2 ? ` және ${fmt(r2)}` : ''} түбірлері түзуді аралықтарға бөледі. Оң жақта көбейтінді «+», жай түбір арқылы өткенде таңба өзгереді. «${S} 0» керек: x ∈ ${setStr(set)}.`,
      ),
    };
  },
});