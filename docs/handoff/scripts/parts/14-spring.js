// Пружина: закон Гука и график F(x), колебания T = 2π√(m/k), соединение пружин, задания.
const springTask = () => {
  if (Math.random() < 0.5) {
    const k = pick([98, 196, 245, 490]);
    const m = pick([0.5, 1, 1.5, 2, 2.5, 3]);
    return { type: 0, k, m, x: ((m * G) / k) * 100 };
  }
  const [m, T] = pick([[1, 0.5], [2, 1], [0.5, 0.5], [2, 0.5], [1, 1]]);
  return { type: 1, m, T, k: (4 * Math.PI * Math.PI * m) / (T * T) };
};
/** Пружина-зигзаг от (x, y1) до (x, y2). */
const coil = (x, y1, y2, w = 16, n = 12, cls = 'exc-m') => {
  let d = `M${x} ${n1(y1)} L${x} ${n1(y1 + 6)}`;
  const len = y2 - y1 - 12;
  for (let i = 0; i < n; i++) d += ` L${n1(x + (i % 2 ? -w / 2 : w / 2))} ${n1(y1 + 6 + (len * (i + 0.5)) / n)}`;
  d += ` L${x} ${n1(y2 - 6)} L${x} ${n1(y2)}`;
  return `<path class="ex-stroke ${cls}" style="stroke-width:1.8" d="${d}"/>`;
};

//@@SCENE
  spring: {
    title: L("Hooke's law and a spring pendulum", 'Закон Гука и пружинный маятник', 'Гук заңы және серіппелі маятник'),
    intro: L('The elastic force is F = k·x. A load on a spring oscillates with period T = 2π√(m/k).', 'Сила упругости F = k·x. Груз на пружине колеблется с периодом T = 2π√(m/k).', 'Серпімділік күші F = k·x. Серіппедегі жүк T = 2π√(m/k) периодымен тербеледі.'),
    sliders: [
      { id: 'm', label: L('mass m, kg', 'масса m, кг', 'масса m, кг'), min: 0.1, max: 5, step: 0.05, value: 2, hidden: (v, st) => st.m === 3 && st.task.type === 1 },
      { id: 'k', label: L('stiffness k, N/m', 'жёсткость k, Н/м', 'қатаңдық k, Н/м'), min: 50, max: 500, step: 1, value: 200, hidden: (v, st) => st.m === 3 && st.task.type === 0 },
    ],
    buttons: [L("Hooke's law", 'Закон Гука', 'Гук заңы'), L('Oscillations', 'Колебания', 'Тербелістер'), L('Two springs', 'Две пружины', 'Екі серіппе'), TASK],
    state: () => ({ m: 0, time: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      st.time = 0;
      if (i < 3) return null;
      st.task = springTask();
      return st.task.type === 0 ? { k: st.task.k, m: 0.1 } : { m: st.task.m, k: 50 };
    },
    live(dt, v, st) {
      st.time += dt;
    },
    draw(v, step, st) {
      const task = st.m === 3 ? st.task : null;
      const mode = task ? task.type : st.m;
      const F = v.m * G;
      const x = F / v.k;
      const T = 2 * Math.PI * Math.sqrt(v.m / v.k);
      const sc = 1.2; // px на см
      const top = 14;
      const rest = 46;
      const bw = 26 + v.m * 4;
      const bh = 14 + v.m * 2.4;
      const load = (cx, y, cls = 'exc-o') => `<rect class="ex-fill ${cls}" x="${n1(cx - bw / 2)}" y="${n1(y)}" width="${n1(bw)}" height="${n1(bh)}" rx="4"/>${tt(cx, y + bh / 2 + 4, `${fmt(v.m, 2)} ${UN.kg()}`, 'exs-s exs-on')}`;
      let svg;
      if (mode === 0) {
        const y2 = top + rest + x * 100 * sc;
        const fl = Math.min(44, F * 1.2, 206 - (y2 + bh / 2));
        let ruler = '';
        for (let c = 0; c <= 100; c += 10) ruler += `${ln(124, top + rest + c * sc, c % 20 ? 129 : 132, top + rest + c * sc, 'exc-m', 1)}${c % 20 ? '' : tt(120, top + rest + c * sc + 3, String(c), 'exs-s ex-end')}`;
        const gx = (xc) => 168 + xc * 1.3;
        const gy = (f) => 186 - f * 3.1;
        const xe = Math.min(100, (50 / v.k) * 100);
        svg = `${ln(20, top, 100, top, 'exc-m', 3)}${coil(60, top, y2)}${load(60, y2)}${ln(124, top + rest, 124, top + rest + 100 * sc, 'exc-m', 1)}${ruler}${tt(128, top + rest - 6, `x, ${UN.cm()}`, 'exs-s')}
          ${x > 0.002 ? varrow(66 + bw / 2, y2 + bh / 2, 66 + bw / 2, y2 + bh / 2 - fl, 'exc-g', `F${u('el', 'упр', 'серп')}`, 2, 12, 0) + varrow(54 - bw / 2, y2 + bh / 2, 54 - bw / 2, y2 + bh / 2 + fl, 'exc-b', 'mg', 2, -10, 4) : '<g/>'}
          ${ln(gx(0), gy(0), 314, gy(0), 'exc-m', 1.2)}${ln(gx(0), gy(0), gx(0), 20, 'exc-m', 1.2)}${tt(316, 212, `x, ${UN.cm()}`, 'exs-s ex-end')}${tt(gx(0) + 4, 20, `F, ${UN.N()}`, 'exs-s ex-start')}
          ${[0, 50, 100].map((c) => tt(gx(c), 198, String(c), 'exs-s')).join('')}${[0, 25, 50].map((f) => tt(gx(0) - 4, gy(f) + 3, String(f), 'exs-s ex-end')).join('')}
          <path class="ex-fill exc-p" style="opacity:.18" d="M${gx(0)} ${gy(0)} L${n1(gx(Math.min(x * 100, 100)))} ${gy(0)} L${n1(gx(Math.min(x * 100, 100)))} ${n1(gy(v.k * Math.min(x, 1)))} Z"/>
          ${ln(gx(0), gy(0), gx(xe), gy((v.k * xe) / 100), 'exc-p', 2.5)}${x <= 1 ? `<circle class="ex-dot" cx="${n1(gx(x * 100))}" cy="${n1(gy(F))}" r="5"/>` : '<g/>'}
          ${box(180, 128, 132, 46)}${tt(246, 143, `x = F/k = ${fmt(x * 100, 1)} ${UN.cm()}`, 'exs-t')}${tt(246, 157, `F = mg = ${fmt(F, 1)} ${UN.N()}`, 'exs-s')}${tt(246, 169, `E = kx²/2 = ${fmt((v.k * x * x) / 2, 2)} ${UN.J()}`, 'exs-s')}`;
      } else if (mode === 1) {
        const A = 22;
        const w = (2 * Math.PI) / T;
        const off = A * Math.cos(w * st.time);
        const y2 = top + 70 + off;
        let trace = '';
        for (let i = 0; i <= 80; i++) {
          const tt2 = st.time - i * 0.03;
          trace += `${i ? 'L' : 'M'}${n1(120 + i * 2.4)} ${n1(top + 70 + bh / 2 + A * Math.cos(w * tt2))} `;
        }
        svg = `${ln(20, top, 100, top, 'exc-m', 3)}${coil(60, top, y2)}${load(60, y2)}${ln(40, top + 70 + bh / 2, 316, top + 70 + bh / 2, 'exc-m ex-dash', 1)}
          <path class="ex-stroke exc-p" style="stroke-width:2" d="${trace}"/>${ln(72, top + 70 + bh / 2 + off, 120, top + 70 + bh / 2 + off, 'exc-o', 1)}<circle class="ex-dot" cx="120" cy="${n1(top + 70 + bh / 2 + off)}" r="4"/>
          ${tt(312, 142, `← t, ${UN.s()}`, 'exs-s ex-end')}
          ${box(120, 150, 192, 48)}${tt(216, 167, `T = 2π√(m/k) = ${fmt(T, 2)} ${UN.s()}`, 'exs-t')}${tt(216, 183, `ν = 1/T = ${fmt(1 / T, 2)} ${UN.Hz()} · ${u('t', 't', 't')} = ${fmt(st.time, 1)} ${UN.s()}`, 'exs-s')}`;
      } else {
        const col = (cx, kk, lab, two) => {
          const xx = F / kk;
          const y2 = top + rest + Math.min(xx * 100 * sc, 130);
          const springs = two === 'ser' ? `${coil(cx, top, (top + y2) / 2, 14, 8)}${coil(cx, (top + y2) / 2, y2, 14, 8)}` : two === 'par' ? `${coil(cx - 10, top, y2, 12)}${coil(cx + 10, top, y2, 12)}${ln(cx - 14, y2, cx + 14, y2, 'exc-m', 2)}` : coil(cx, top, y2);
          return `${ln(cx - 36, top, cx + 36, top, 'exc-m', 3)}${springs}${load(cx, y2)}${tt(cx, 192, lab, 'exs-t')}${tt(cx, 206, `x = ${fmt(xx * 100, 1)} ${UN.cm()}`, 'exs-s tc exc-p')}`;
        };
        svg = `${col(55, v.k, `k = ${fmt(v.k, 0)}`, '')}${col(160, v.k / 2, `${u('series', 'посл.', 'тізб.')}: k/2`, 'ser')}${col(265, v.k * 2, `${u('parallel', 'парал.', 'парал.')}: 2k`, 'par')}`;
      }
      let caption = [
        u(`F = mg = ${fmt(v.m, 2)} · 9.8 = ${fmt(F, 1)} N, x = F / k = ${fmt(F, 1)} / ${fmt(v.k, 0)} = ${fmt(x, 3)} m = ${fmt(x * 100, 1)} cm. The graph F(x) is a straight line with slope k; the shaded area is the elastic energy kx²/2.`, `F = mg = ${fmt(v.m, 2)} · 9,8 = ${fmt(F, 1)} Н, x = F / k = ${fmt(F, 1)} / ${fmt(v.k, 0)} = ${fmt(x, 3)} м = ${fmt(x * 100, 1)} см. График F(x) - прямая с наклоном k, площадь под ней - энергия пружины kx²/2.`, `F = mg = ${fmt(v.m, 2)} · 9,8 = ${fmt(F, 1)} Н, x = F / k = ${fmt(F, 1)} / ${fmt(v.k, 0)} = ${fmt(x, 3)} м = ${fmt(x * 100, 1)} см. F(x) графигі - көлбеулігі k түзу, астындағы аудан - серіппе энергиясы kx²/2.`),
        u(`T = 2π√(m/k) = 2π√(${fmt(v.m, 2)} / ${fmt(v.k, 0)}) = ${fmt(T, 2)} s. A heavier load swings slower, a stiffer spring - faster. Gravity does not change T: on the Moon it would be the same.`, `T = 2π√(m/k) = 2π√(${fmt(v.m, 2)} / ${fmt(v.k, 0)}) = ${fmt(T, 2)} с. Тяжелее груз - колебания медленнее, жёстче пружина - быстрее. От g период не зависит: на Луне он был бы тем же.`, `T = 2π√(m/k) = 2π√(${fmt(v.m, 2)} / ${fmt(v.k, 0)}) = ${fmt(T, 2)} с. Жүк ауыр болса - тербеліс баяу, серіппе қатаң болса - жылдам. Период g-ге тәуелді емес: Айда да сондай болар еді.`),
        u(`Two equal springs in series stretch twice as much (k = k/2), in parallel - half as much (k = 2k). Load ${fmt(F, 1)} N.`, `Две одинаковые пружины последовательно растягиваются вдвое сильнее (k общ = k/2), параллельно - вдвое слабее (k общ = 2k). Нагрузка ${fmt(F, 1)} Н.`, `Екі бірдей серіппе тізбектей екі есе көп созылады (k жалпы = k/2), параллель - екі есе аз (k жалпы = 2k). Жүктеме ${fmt(F, 1)} Н.`),
      ][mode];
      if (task) {
        let ok;
        let goal;
        let done;
        if (task.type === 0) {
          ok = near(v.m, task.m, 0.03);
          goal = u(`k = ${task.k} N/m. Hang a load that stretches the spring by ${fmt(task.x, 1)} cm.`, `k = ${task.k} Н/м. Подвесь груз, который растянет пружину на ${fmt(task.x, 1)} см.`, `k = ${task.k} Н/м. Серіппені ${fmt(task.x, 1)} см-ге созатын жүк ілу керек.`);
          done = `m = kx / g = ${task.k} · ${fmt(task.x / 100, 3)} / 9,8 = ${fmt(task.m, 2)} ${UN.kg()}.`;
        } else {
          ok = near(T, task.T, 0.01);
          goal = u(`the load is ${task.m} kg. Choose k so that the period is ${fmt(task.T, 1)} s.`, `груз ${task.m} кг. Подбери k, чтобы период был ${fmt(task.T, 1)} с.`, `жүк ${task.m} кг. Период ${fmt(task.T, 1)} с болатындай k-ны тап.`);
          done = `k = 4π²m / T² = 39,48 · ${task.m} / ${fmt(task.T * task.T, 2)} ≈ ${fmt(task.k, 0)} ${u('N/m', 'Н/м', 'Н/м')}.`;
        }
        caption = taskCap(goal, ok, u(`Now x = ${fmt(x * 100, 1)} cm, T = ${fmt(T, 2)} s.`, `Сейчас x = ${fmt(x * 100, 1)} см, T = ${fmt(T, 2)} с.`, `Қазір x = ${fmt(x * 100, 1)} см, T = ${fmt(T, 2)} с.`), done);
        return { svg: svg + taskBadge(ok, 316, 214), caption };
      }
      return { svg, caption };
    },
  },
