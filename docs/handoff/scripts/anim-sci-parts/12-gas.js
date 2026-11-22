// Газ под поршнем: изотерма, изобара, изохора (pV = νRT), молекулы, графики, задания.
const GAS_NU = 0.0802; // моль: при 2 л и 300 К давление ≈ 100 кПа
const gasP = (V, T) => (GAS_NU * 8.31 * T) / (V / 1000) / 1000; // кПа, V в литрах
const gasTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const [V0, V1] = pick([[2, 1], [3, 1.5], [2, 4], [4, 2], [3, 1]]);
    return { type, V0, T0: 300, p: gasP(V1, 300), ans: V1 };
  }
  if (type === 1) {
    const [T0, T1] = pick([[300, 450], [300, 600], [400, 200], [300, 150], [200, 500]]);
    return { type, V0: (GAS_NU * 8.31 * T0) / 100, T0, p0: 100, ans: T1, V1: (GAS_NU * 8.31 * T1) / 100 };
  }
  const [T0, T1] = pick([[300, 450], [300, 600], [400, 200], [300, 150]]);
  return { type, V0: 2, T0, ans: T1, p: gasP(2, T1) };
};

//@@SCENE
  gas: {
    title: L('Gas laws: isotherm, isobar, isochore', 'Газовые законы: изотерма, изобара, изохора', 'Газ заңдары: изотерма, изобара, изохора'),
    intro: L('For a fixed amount of gas pV = νRT. Keep one of p, V, T constant and see how the other two change.', 'Для данного количества газа pV = νRT. Оставь одну из величин p, V, T постоянной и смотри, как меняются две другие.', 'Газдың берілген мөлшері үшін pV = νRT. p, V, T шамаларының бірін тұрақты қалдырып, қалған екеуінің өзгерісін бақыла.'),
    sliders: [
      { id: 'V', label: L('V, L', 'V, л', 'V, л'), min: 1, max: 4, step: 0.05, value: 2, hidden: (v, st) => st.mode === 1 || st.mode === 2 },
      { id: 'T', label: L('T, K', 'T, К', 'T, К'), min: 150, max: 600, step: 1, value: 300, hidden: (v, st) => st.mode === 0 },
    ],
    buttons: [L('T = const', 'T = const', 'T = const'), L('p = const', 'p = const', 'p = const'), L('V = const', 'V = const', 'V = const'), TASK],
    state: () => {
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      return { m: 0, mode: 0, p0: 100, task: null, mol: Array.from({ length: 26 }, () => ({ x: rnd(), y: rnd(), a: rnd() * Math.PI * 2 })) };
    },
    pressed: (i, v, st) => (st.m === 3 ? i === 3 : i === st.mode),
    onButton(i, st, v) {
      if (i < 3) {
        st.m = i;
        st.mode = i;
        st.p0 = gasP(v.V, v.T);
        return null;
      }
      st.m = 3;
      st.task = gasTask();
      st.mode = st.task.type;
      st.p0 = st.task.p0 ?? 100;
      return { V: st.task.V0, T: st.task.T0 };
    },
    live(dt, v, st) {
      const sp = 0.9 * Math.sqrt(v.T / 300);
      for (const p of st.mol) {
        p.x += Math.cos(p.a) * sp * dt;
        p.y += Math.sin(p.a) * sp * dt * 1.6;
        if (p.x < 0 || p.x > 1) (p.x = clamp(p.x, 0, 1)), (p.a = Math.PI - p.a);
        if (p.y < 0 || p.y > 1) (p.y = clamp(p.y, 0, 1)), (p.a = -p.a);
      }
    },
    draw(v, step, st) {
      // Изобара: объём следует за температурой.
      if (st.mode === 1) v.V = clamp((GAS_NU * 8.31 * v.T) / st.p0, 1, 4);
      const p = gasP(v.V, v.T);
      const h = v.V * 40;
      const top = 200 - h;
      const hue = Math.round(220 - ((v.T - 150) / 450) * 220);
      const mol = st.mol.map((m) => `<circle cx="${n1(22 + m.x * 96)}" cy="${n1(198 - m.y * (h - 6))}" r="3.3" style="fill:hsl(${hue} 80% 55%)"/>`).join('');
      // График процесса.
      const gx0 = 168;
      const gy0 = 186;
      let graph;
      let xl;
      let yl;
      if (st.mode === 0) {
        const sx = (V) => gx0 + (V - 0.5) * 38;
        const sy = (pp) => gy0 - pp * 0.36;
        graph = `${[200, 300, 450].map((T) => `<path class="ex-stroke exc-m ex-faint" style="stroke-width:1" d="${plot((V) => sy(gasP(V, T)), 0.9, 4, sx, (y) => y)}"/>`).join('')}<path class="ex-curve" d="${plot((V) => sy(gasP(V, v.T)), 0.9, 4, sx, (y) => y)}"/><circle class="ex-dot" cx="${n1(sx(v.V))}" cy="${n1(clamp(sy(p), 10, 190))}" r="5"/>${tt(312, sy(gasP(4, v.T)) - 8, `T = ${fmt(v.T, 0)} ${u('K', 'К', 'К')}`, 'exs-s ex-end tc exc-p')}${[1, 2, 3, 4].map((V) => tt(sx(V), gy0 + 12, String(V), 'exs-s')).join('')}`;
        xl = `V, ${UN.L()}`;
        yl = `p, ${UN.kPa()}`;
      } else {
        const sx = (T) => gx0 + T * 0.24;
        const isoP = st.mode === 2;
        const y = isoP ? p : v.V;
        const sy = isoP ? (pp) => gy0 - pp * 0.36 : (V) => gy0 - V * 40;
        const k = isoP ? p / v.T : v.V / v.T;
        graph = `${ln(sx(0), sy(0), sx(150), sy(k * 150), 'exc-m ex-dash', 1.2)}${ln(sx(150), sy(k * 150), sx(600), sy(k * 600), 'exc-p', 3)}<circle class="ex-dot" cx="${n1(sx(v.T))}" cy="${n1(clamp(sy(y), 10, 190))}" r="5"/>${[0, 300, 600].map((T) => tt(sx(T), gy0 + 12, String(T), 'exs-s')).join('')}`;
        xl = `T, ${u('K', 'К', 'К')}`;
        yl = isoP ? `p, ${UN.kPa()}` : `V, ${UN.L()}`;
      }
      const law = [u('Boyle-Mariotte: pV = const', 'Бойль-Мариотт: pV = const', 'Бойль-Мариотт: pV = const'), u('Gay-Lussac: V/T = const', 'Гей-Люссак: V/T = const', 'Гей-Люссак: V/T = const'), u('Charles: p/T = const', 'Шарль: p/T = const', 'Шарль: p/T = const')][st.mode];
      const svg = `<path class="ex-cyl" d="M18 26 V202 H122 V26"/><rect class="ex-piston" x="20" y="${n1(top - 10)}" width="100" height="10" rx="3"/><line class="ex-rod" x1="70" y1="${n1(top - 10)}" x2="70" y2="4"/>${mol}
        ${tt(98, top - 16, `V = ${fmt(v.V, 2)} ${UN.L()}`, 'exs-t')}
        ${box(126, 4, 40, 60)}${tt(146, 18, 'p', 'exs-s')}${tt(146, 33, fmt(p, 0), 'exs-t tc exc-r')}${tt(146, 46, UN.kPa(), 'exs-s')}${tt(146, 59, `${fmt(p / 101.3, 2)} ${u('atm', 'атм', 'атм')}`, 'exs-s')}
        ${box(126, 150, 40, 52)}${tt(146, 165, 'T', 'exs-s')}${tt(146, 180, fmt(v.T, 0), 'exs-t tc exc-o')}${tt(146, 195, `${fmt(v.T - 273, 0)} °C`, 'exs-s')}
        <line class="ex-axis" x1="${gx0}" y1="${gy0}" x2="316" y2="${gy0}"/><line class="ex-axis" x1="${gx0}" y1="${gy0}" x2="${gx0}" y2="14"/>${tt(316, 212, xl, 'exs-s ex-end')}${tt(gx0 + 4, 14, yl, 'exs-s ex-start')}
        ${graph}${tt(242, 30, law, 'exs-s tc exc-p')}`;
      const nm = [u('isothermal', 'изотермический', 'изотермиялық'), u('isobaric', 'изобарный', 'изобаралық'), u('isochoric', 'изохорный', 'изохоралық')][st.mode];
      let caption = [
        u(`Isothermal process (T = ${fmt(v.T, 0)} K): pV = ${fmt(p, 1)} · ${fmt(v.V, 2)} = ${fmt(p * v.V, 0)} kPa·L stays constant. Squeeze the gas 2 times - the molecules hit the walls 2 times more often, p doubles.`, `Изотермический процесс (T = ${fmt(v.T, 0)} К): pV = ${fmt(p, 1)} · ${fmt(v.V, 2)} = ${fmt(p * v.V, 0)} кПа·л не меняется. Сожми газ в 2 раза - молекулы бьют о стенки в 2 раза чаще, p вдвое больше.`, `Изотермиялық процесс (T = ${fmt(v.T, 0)} К): pV = ${fmt(p, 1)} · ${fmt(v.V, 2)} = ${fmt(p * v.V, 0)} кПа·л өзгермейді. Газды 2 есе сықсаң - молекулалар қабырғаға 2 есе жиі соғылады, p екі есе артады.`),
        u(`Isobaric process (p = ${fmt(p, 0)} kPa): V/T = ${fmt(v.V, 2)} / ${fmt(v.T, 0)} = ${fmt((v.V / v.T) * 1000, 2)}·10⁻³ L/K. Heat the gas - it expands and pushes the piston up.`, `Изобарный процесс (p = ${fmt(p, 0)} кПа): V/T = ${fmt(v.V, 2)} / ${fmt(v.T, 0)} = ${fmt((v.V / v.T) * 1000, 2)}·10⁻³ л/К. Нагреваешь газ - он расширяется и поднимает поршень.`, `Изобаралық процесс (p = ${fmt(p, 0)} кПа): V/T = ${fmt(v.V, 2)} / ${fmt(v.T, 0)} = ${fmt((v.V / v.T) * 1000, 2)}·10⁻³ л/К. Газды қыздырсаң - ол ұлғайып, поршеньді көтереді.`),
        u(`Isochoric process (V = ${fmt(v.V, 2)} L): p/T = ${fmt(p, 0)} / ${fmt(v.T, 0)} = ${fmt(p / v.T, 3)} kPa/K. The piston is fixed: faster molecules hit harder, so p grows with T.`, `Изохорный процесс (V = ${fmt(v.V, 2)} л): p/T = ${fmt(p, 0)} / ${fmt(v.T, 0)} = ${fmt(p / v.T, 3)} кПа/К. Поршень закреплён: быстрые молекулы бьют сильнее, и p растёт вместе с T.`, `Изохоралық процесс (V = ${fmt(v.V, 2)} л): p/T = ${fmt(p, 0)} / ${fmt(v.T, 0)} = ${fmt(p / v.T, 3)} кПа/К. Поршень бекітілген: жылдам молекулалар қатты соғады, p T-мен бірге өседі.`),
      ][st.mode];
      if (st.m === 3) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        if (q.type === 0) {
          ok = near(v.V, q.ans, 0.03);
          goal = u(`${nm} process at 300 K. Change the volume so that the pressure becomes ${fmt(q.p, 0)} kPa.`, `${nm} процесс при 300 К. Измени объём так, чтобы давление стало ${fmt(q.p, 0)} кПа.`, `300 К-дегі ${nm} процесс. Қысым ${fmt(q.p, 0)} кПа болатындай көлемді өзгерт.`);
          done = `p₁V₁ = p₂V₂: V₂ = ${fmt(gasP(q.V0, 300), 0)} · ${q.V0} / ${fmt(q.p, 0)} = ${fmt(q.ans, 2)} ${UN.L()}.`;
        } else if (q.type === 1) {
          ok = near(v.T, q.ans, 3);
          goal = u(`${nm} process at 100 kPa. Bring the volume to ${fmt(q.V1, 2)} L.`, `${nm} процесс при 100 кПа. Доведи объём до ${fmt(q.V1, 2)} л.`, `100 кПа-дағы ${nm} процесс. Көлемді ${fmt(q.V1, 2)} л-ге жеткіз.`);
          done = `V₁/T₁ = V₂/T₂: T₂ = ${q.T0} · ${fmt(q.V1, 2)} / ${fmt(q.V0, 2)} = ${q.ans} ${u('K', 'К', 'К')}.`;
        } else {
          ok = near(v.T, q.ans, 3);
          goal = u(`${nm} process, V = 2 L. At what temperature is the pressure ${fmt(q.p, 0)} kPa?`, `${nm} процесс, V = 2 л. При какой температуре давление станет ${fmt(q.p, 0)} кПа?`, `${nm} процесс, V = 2 л. Қандай температурада қысым ${fmt(q.p, 0)} кПа болады?`);
          done = `p₁/T₁ = p₂/T₂: T₂ = ${q.T0} · ${fmt(q.p, 0)} / ${fmt(gasP(2, q.T0), 0)} = ${q.ans} ${u('K', 'К', 'К')}.`;
        }
        caption = taskCap(goal, ok, u(`Now p = ${fmt(p, 0)} kPa, V = ${fmt(v.V, 2)} L, T = ${fmt(v.T, 0)} K.`, `Сейчас p = ${fmt(p, 0)} кПа, V = ${fmt(v.V, 2)} л, T = ${fmt(v.T, 0)} К.`, `Қазір p = ${fmt(p, 0)} кПа, V = ${fmt(v.V, 2)} л, T = ${fmt(v.T, 0)} К.`), done);
        return { svg: svg + taskBadge(ok, 316, 46), caption };
      }
      return { svg, caption };
    },
  },
