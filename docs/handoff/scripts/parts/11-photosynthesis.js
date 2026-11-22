// Фотосинтез: свет, CO₂, температура, дыхание, точка компенсации, график, задания.
const psT = (t) => (t <= 27 ? Math.exp(-(((t - 27) / 12) ** 2)) : t <= 40 ? Math.exp(-(((t - 27) / 16) ** 2)) : Math.exp(-((13 / 16) ** 2)) * Math.max(0, (48 - t) / 8));
const psC = (c) => c / (c + 0.04) / (0.15 / 0.19);
/** Валовая скорость (0..1), дыхание и чистая скорость. */
const psRate = (light, c, t) => {
  const P = psC(c) * psT(t) * (1 - Math.exp(-light / 28));
  const R = 0.05 + 0.0015 * t;
  return { P, R, net: P - R };
};
const psComp = (c, t) => {
  let a = 0;
  let b = 100;
  if (psRate(100, c, t).net < 0) return null;
  for (let i = 0; i < 40; i++) {
    const m = (a + b) / 2;
    if (psRate(m, c, t).net < 0) a = m;
    else b = m;
  }
  return b;
};
const psLimit = (v) => {
  const p0 = psRate(v.light, v.co2, v.t).P;
  const d = [psRate(Math.min(100, v.light + 15), v.co2, v.t).P - p0, psRate(v.light, Math.min(0.15, v.co2 + 0.03), v.t).P - p0, Math.max(psRate(v.light, v.co2, Math.min(50, v.t + 4)).P, psRate(v.light, v.co2, Math.max(0, v.t - 4)).P) - p0];
  const k = d.indexOf(Math.max(...d));
  return Math.max(...d) < 0.01 ? -1 : k;
};
const psTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const co2 = pick([0.04, 0.1]);
    const t = pick([20, 25, 30]);
    return { type, co2, t, light: 0, Lc: psComp(co2, t) };
  }
  if (type === 1) return { type, light: 80, co2: 0.02, t: 8 };
  return { type, light: 80, co2: 0.1, t: 5 };
};

//@@SCENE
  photosynthesis: {
    title: L('Photosynthesis and its limiting factors', 'Фотосинтез и что его ограничивает', 'Фотосинтез және оны не шектейді'),
    intro: L('6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ in the light, in chloroplasts. The rate is set by the factor in shortest supply: light, CO₂ or temperature.', '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ на свету, в хлоропластах. Скорость задаёт фактор, которого меньше всего: свет, CO₂ или температура.', '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ жарықта, хлоропластарда. Жылдамдықты ең аз фактор анықтайды: жарық, CO₂ немесе температура.'),
    sliders: [
      { id: 'light', label: L('light, %', 'свет, %', 'жарық, %'), min: 0, max: 100, step: 1, value: 60, hidden: (v, st) => st.m === 2 && st.task.type !== 0 },
      { id: 'co2', label: 'CO₂, %', min: 0.01, max: 0.15, step: 0.005, value: 0.04, hidden: (v, st) => st.m === 2 && st.task.type !== 1 },
      { id: 't', label: 't, °C', min: 0, max: 50, step: 1, value: 25, hidden: (v, st) => st.m === 2 && st.task.type === 0 },
    ],
    buttons: [L('Leaf', 'Лист', 'Жапырақ'), L('Rate graph', 'График скорости', 'Жылдамдық графигі'), L('Night', 'Ночь', 'Түн'), TASK],
    state: () => ({ m: 0, ph: 0, task: null }),
    pressed: (i, v, st) => i === st.m || (i === 3 && st.m === 2),
    btnHidden: (i, v, st) => i === 2 && st.m === 2,
    onButton(i, st, v) {
      if (i === 2) return { light: v.light > 0 ? 0 : 70 };
      if (i < 2) {
        st.m = i;
        return null;
      }
      st.m = 2;
      st.task = psTask();
      const q = st.task;
      return { light: q.light, co2: q.co2, t: q.t };
    },
    live(dt, v, st) {
      st.ph += dt;
    },
    draw(v, step, st) {
      const { P, R } = psRate(v.light, v.co2, v.t);
      // Чистая скорость из округлённых процентов, чтобы в подписи сходилась арифметика.
      const net = (Math.round(P * 100) - Math.round(R * 100)) / 100;
      const bubbles = Math.round(Math.max(0, net) * 60);
      const lim = psLimit(v);
      const limName = [u('light', 'свет', 'жарық'), 'CO₂', u('temperature', 'температура', 'температура')];
      const L1 = v.light / 100;
      let svg;
      if (st.m === 1 || (st.m === 2 && st.task.type === 2)) {
        // График: по оси X - свет (или температура в задании про оптимум).
        const byT = st.m === 2;
        const sx = (x) => 40 + x * (byT ? 5.4 : 2.7);
        const sy = (y) => 186 - y * 160;
        const f = (x, c) => (byT ? psRate(v.light, c, x).net : psRate(x, c, v.t).net);
        const X1 = byT ? 50 : 100;
        let g = '';
        for (let x = 0; x <= X1; x += byT ? 10 : 20) g += `<line class="ex-grid" x1="${sx(x)}" y1="${sy(-0.1)}" x2="${sx(x)}" y2="${sy(1)}"/>${tt(sx(x), 200, String(x), 'exs-s')}`;
        const cur = byT ? v.t : v.light;
        const comp = byT ? null : psComp(v.co2, v.t);
        svg = `${g}<line class="ex-axis" x1="${sx(0)}" y1="${sy(0)}" x2="${sx(X1) + 4}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="${sy(-0.1)}" x2="${sx(0)}" y2="${sy(1)}"/>
          ${tt(sx(X1), 213, byT ? 't, °C' : u('light, %', 'свет, %', 'жарық, %'), 'exs-s ex-end')}${tt(sx(0) - 4, sy(0) + 4, '0', 'exs-s ex-end')}${tt(sx(0) + 4, 14, u('O₂ output (net)', 'выделение O₂ (чистое)', 'O₂ бөлінуі (таза)'), 'exs-s ex-start')}
          ${byT ? '<g/>' : `<g class="ex-faint"><path class="ex-stroke exc-g ex-dash" style="stroke-width:1.5" d="${plot((x) => f(x, 0.15), 0, X1, sx, sy)}"/></g>${tt(sx(100) - 2, sy(f(100, 0.15)) - 5, 'CO₂ 0,15%', 'exs-s ex-end tc exc-g')}`}
          <path class="ex-curve" d="${plot((x) => f(x, v.co2), 0, X1, sx, sy)}"/>${byT ? '' : tt(sx(100) - 2, sy(f(100, v.co2)) - 6, `CO₂ ${fmt(v.co2, 3)}%`, 'exs-s ex-end tc exc-p')}
          ${comp !== null && !byT ? `<circle class="ex-fill exc-r" cx="${n1(sx(comp))}" cy="${n1(sy(0))}" r="3.5"/>${tt(sx(comp) + 5, sy(0) - 7, u('compensation point', 'точка компенсации', 'компенсация нүктесі'), 'exs-s ex-start tc exc-r')}` : '<g/><g/>'}
          ${ln(sx(cur), sy(f(cur, v.co2)), sx(cur), sy(0), 'exc-o ex-dash', 1.2)}<circle class="ex-dot" cx="${n1(sx(cur))}" cy="${n1(sy(f(cur, v.co2)))}" r="5"/>
          ${box(byT ? 44 : 196, byT ? 22 : 124, 120, 48)}${tt(byT ? 104 : 256, byT ? 38 : 140, `${u('net', 'чистая', 'таза')}: ${fmt(net * 100, 0)}%`, 'exs-t')}${tt(byT ? 104 : 256, byT ? 53 : 155, `${u('gross', 'общая', 'жалпы')} ${fmt(P * 100, 0)}% − ${u('resp.', 'дыхание', 'тыныс')} ${fmt(R * 100, 0)}%`, 'exs-s')}${tt(byT ? 104 : 256, byT ? 65 : 167, lim >= 0 ? `${u('limited by', 'ограничивает', 'шектейді')}: ${limName[lim]}` : u('no limit', 'всё в норме', 'шектеу жоқ'), 'exs-s tc exc-o')}`;
      } else {
        const rays = Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return `<line x1="${n1(34 + 17 * Math.cos(a))}" y1="${n1(34 + 17 * Math.sin(a))}" x2="${n1(34 + 25 * Math.cos(a))}" y2="${n1(34 + 25 * Math.sin(a))}"/>`;
        }).join('');
        const nb = Math.round(clamp(net, 0, 1) * 9);
        const bub = Array.from({ length: nb }, (_, i) => {
          const k = (st.ph * (0.3 + net) + i / Math.max(nb, 1)) % 1;
          return `<circle class="ex-bubble" cx="${n1(258 + 7 * Math.sin(k * 9 + i))}" cy="${n1(96 - k * 70)}" r="${n1(2.5 + 2.5 * k)}" opacity="${n1((1 - k) * 100) / 100}"/>`;
        }).join('');
        const th = clamp(v.t / 50, 0, 1);
        svg = `<g class="ex-sun" opacity="${n1((0.15 + 0.85 * L1) * 100) / 100}"><circle cx="34" cy="34" r="13"/><g class="ex-rays">${rays}</g></g>
          ${L1 > 0 ? `<g class="exc-y" opacity="${n1((0.3 + 0.7 * L1) * 100) / 100}">${arrow(56, 50, 104, 84, '', 1 + 3 * L1)}</g>` : '<g/>'}${tt(60, 76, `${u('light', 'свет', 'жарық')} ${fmt(v.light, 0)}%`, 'exs-s ex-end')}
          <path class="ex-leaf" style="opacity:${n1((0.4 + 0.6 * clamp(P, 0, 1)) * 100) / 100}" d="M92 150 Q150 58 246 92 Q196 182 92 150 Z"/><path class="ex-vein" d="M92 150 Q170 120 246 92"/>
          <ellipse cx="170" cy="122" rx="20" ry="10" class="ex-fill exc-g" style="opacity:.9;stroke:var(--card);stroke-width:1"/>${[0, 1, 2].map((k) => `<rect x="${159 + k * 8}" y="117" width="5" height="10" rx="1" class="ex-fill" style="color:color-mix(in srgb, var(--green) 50%, #000)"/>`).join('')}${tt(170, 145, u('chloroplast', 'хлоропласт', 'хлоропласт'), 'exs-s exs-on')}
          ${arrow(8, 186, 98, 150, 'exc-m', 1 + 4 * (v.co2 / 0.15))}${tt(8, 204, `CO₂ ${fmt(v.co2, 3)}%`, 'exs-t ex-start')}
          ${arrow(150, 214, 150, 160, 'exc-b', 2.5)}${tt(156, 206, `H₂O ${u('from roots', 'из корней', 'тамырдан')}`, 'exs-s ex-start tc exc-b')}
          ${net > 0 ? arrow(236, 96, 262, 70, 'exc-g', 1 + 4 * clamp(net, 0, 1)) : arrow(268, 70, 240, 96, 'exc-r', 2)}${bub}${tt(316, 20, net > 0 ? `O₂ ↑ ${bubbles} ${u('bubbles/min', 'пуз./мин', 'көпіршік/мин')}` : u('O₂ is taken in', 'O₂ поглощается', 'O₂ сіңіріледі'), `exs-t ex-end tc ${net > 0 ? 'exc-g' : 'exc-r'}`)}
          ${arrow(210, 140, 236, 176, 'exc-o', 1 + 3 * clamp(P, 0, 1))}${tt(250, 192, `C₆H₁₂O₆ ${fmt(P * 100, 0)}%`, 'exs-t tc exc-o')}
          <rect class="ex-thermo" x="296" y="110" width="10" height="70" rx="5"/><rect x="298" y="${n1(178 - 66 * th)}" width="6" height="${n1(66 * th)}" rx="3" class="ex-fill exc-r"/>${tt(301, 196, `${fmt(v.t, 0)} °C`, 'exs-s')}`;
      }
      let caption;
      if (v.light < 0.5) caption = u('No light - no photosynthesis. The plant only breathes: it takes in O₂ and gives out CO₂, day and night.', 'Нет света - нет фотосинтеза. Растение только дышит: поглощает O₂ и выделяет CO₂ (дышит оно и днём, и ночью).', 'Жарық жоқ - фотосинтез жоқ. Өсімдік тек тыныс алады: O₂ сіңіріп, CO₂ бөледі (күндіз де, түнде де тыныс алады).');
      else
        caption = u(
          `Photosynthesis ${fmt(P * 100, 0)}%, respiration ${fmt(R * 100, 0)}%: net ${net > 0 ? `+${fmt(net * 100, 0)}% - the leaf gives out O₂` : `${fmt(net * 100, 0)}% - less than breathing, O₂ is taken in`}. ${lim >= 0 ? `Now the limiting factor is ${limName[lim]}: adding it speeds things up most.` : 'All factors are near their best.'}${v.t > 40 ? ' Above 40 °C the enzymes are damaged.' : ''}`,
          `Фотосинтез ${fmt(P * 100, 0)}%, дыхание ${fmt(R * 100, 0)}%: итого ${net > 0 ? `+${fmt(net * 100, 0)}% - лист выделяет O₂` : `${fmt(net * 100, 0)}% - меньше дыхания, O₂ поглощается`}. ${lim >= 0 ? `Сейчас ограничивает ${limName[lim]}: если добавить его, скорость вырастет сильнее всего.` : 'Все факторы близки к лучшим.'}${v.t > 40 ? ' Выше 40 °C разрушаются ферменты.' : ''}`,
          `Фотосинтез ${fmt(P * 100, 0)}%, тыныс алу ${fmt(R * 100, 0)}%: барлығы ${net > 0 ? `+${fmt(net * 100, 0)}% - жапырақ O₂ бөледі` : `${fmt(net * 100, 0)}% - тыныс алудан аз, O₂ сіңіріледі`}. ${lim >= 0 ? `Қазір шектейтін фактор - ${limName[lim]}: оны қоссаң, жылдамдық ең көп өседі.` : 'Барлық фактор ең жақсысына жақын.'}${v.t > 40 ? ' 40 °C-тан жоғары ферменттер бұзылады.' : ''}`,
        );
      if (st.m === 2) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        if (q.type === 0) {
          ok = v.light >= q.Lc - 0.01 && v.light <= q.Lc + 2.5;
          goal = u(`CO₂ ${fmt(q.co2, 2)}%, ${q.t} °C. Find the least light at which the leaf starts to give out O₂ (compensation point).`, `CO₂ ${fmt(q.co2, 2)}%, ${q.t} °C. Найди наименьший свет, при котором лист начинает выделять O₂ (точка компенсации).`, `CO₂ ${fmt(q.co2, 2)}%, ${q.t} °C. Жапырақ O₂ бөле бастайтын ең аз жарықты тап (компенсация нүктесі).`);
          done = u(`At ≈ ${fmt(q.Lc, 0)}% light photosynthesis equals respiration.`, `При ≈ ${fmt(q.Lc, 0)}% света фотосинтез равен дыханию.`, `≈ ${fmt(q.Lc, 0)}% жарықта фотосинтез тыныс алуға тең.`);
        } else if (q.type === 1) {
          ok = P >= 0.9 * psRate(80, 0.15, 27).P;
          goal = u('the light is fixed at 80%. Make photosynthesis at least 90% of the best possible.', 'свет 80% менять нельзя. Подними фотосинтез хотя бы до 90% от наилучшего.', 'жарық 80%, оны өзгертуге болмайды. Фотосинтезді ең жақсысының кемінде 90%-ына жеткіз.');
          done = u('More CO₂ (as in greenhouses) and a warm 25-30 °C.', 'Больше CO₂ (как в теплицах) и тепло 25-30 °C.', 'CO₂ көбірек (жылыжайлардағыдай) және 25-30 °C жылу.');
        } else {
          ok = near(v.t, 27, 2);
          goal = u('find the optimal temperature for photosynthesis (the top of the curve).', 'найди оптимальную температуру фотосинтеза (вершину кривой).', 'фотосинтездің оңтайлы температурасын тап (қисықтың шыңы).');
          done = u('About 25-30 °C. Colder - enzymes are slow, hotter than 40 °C - they are destroyed.', 'Около 25-30 °C. Холоднее - ферменты медленные, выше 40 °C - разрушаются.', 'Шамамен 25-30 °C. Суықта ферменттер баяу, 40 °C-тан жоғары - бұзылады.');
        }
        caption = taskCap(goal, ok, u(`Now net ${fmt(net * 100, 0)}%.`, `Сейчас итог ${fmt(net * 100, 0)}%.`, `Қазір барлығы ${fmt(net * 100, 0)}%.`), done);
        return { svg: svg + taskBadge(ok, q.type === 2 ? 318 : 160, 14), caption };
      }
      return { svg, caption };
    },
  },
