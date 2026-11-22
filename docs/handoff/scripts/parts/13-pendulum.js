// Математический маятник: период, планеты, сравнение l и l/4, энергия, секундомер, задание.
const pendTask = (g) => {
  for (let k = 0; k < 100; k++) {
    const l = ri(2, 24) / 10;
    const T = Math.round(2 * Math.PI * Math.sqrt(l / g) * 10) / 10;
    const lt = (g * T * T) / (4 * Math.PI * Math.PI);
    if (lt >= 0.12 && lt <= 2.45) return { T, l: lt };
  }
  return { T: 2, l: (g * 4) / (4 * Math.PI * Math.PI) };
};

//@@SCENE
  pendulum: {
    title: L('Pendulum period', 'Период маятника', 'Маятник периоды'),
    intro: L('T = 2π√(l/g): the period depends on the length and gravity only - not on the mass and (for small swings) not on the amplitude.', 'T = 2π√(l/g): период зависит только от длины и g - не от массы и (при малых размахах) не от амплитуды.', 'T = 2π√(l/g): период тек ұзындық пен g-ге тәуелді - массаға және (кіші тербелісте) амплитудаға тәуелді емес.'),
    sliders: [
      { id: 'l', label: L('length l, m', 'длина l, м', 'ұзындық l, м'), min: 0.1, max: 2.5, step: 0.01, value: 1.5 },
      { id: 'm', label: L('mass m, kg', 'масса m, кг', 'масса m, кг'), min: 0.1, max: 2, step: 0.1, value: 0.5, hidden: (v, st) => st.m === 1 },
      { id: 'th', label: L('amplitude, °', 'амплитуда, °', 'амплитуда, °'), min: 3, max: 30, step: 1, value: 15, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('Planet ↻', 'Планета ↻', 'Ғаламшар ↻'), L('Compare with l/4', 'Сравнить с l/4', 'l/4-пен салыстыру'), TASK, FREE],
    state: () => ({ p: 0, cmp: false, m: 0, time: 0, task: null }),
    pressed: (i, v, st) => (i === 1 && st.cmp) || (i === 2 && st.m === 1),
    btnHidden: (i, v, st) => (i === 3 ? st.m !== 1 : st.m === 1 && i < 2),
    onButton(i, st) {
      st.time = 0;
      if (i === 0) st.p = (st.p + 1) % 3;
      else if (i === 1) st.cmp = !st.cmp;
      else if (i === 3) st.m = 0;
      else {
        st.m = 1;
        st.cmp = false;
        st.task = pendTask(PLANETS[st.p].g);
        return { l: 0.3 };
      }
      return null;
    },
    live(dt, v, st) {
      st.time += dt;
    },
    draw(v, step, st) {
      const P = PLANETS[st.p];
      const g = P.g;
      const T = 2 * Math.PI * Math.sqrt(v.l / g);
      const w = (2 * Math.PI) / T;
      const th0 = rad(v.th);
      const sc = 72;
      const px = st.cmp ? 110 : 128;
      const py = 14;
      const bob = (l, ph, cls, r) => {
        const th = th0 * Math.cos(ph);
        const L1 = l * sc;
        const bx = px + L1 * Math.sin(th);
        const by = py + L1 * Math.cos(th);
        const arc = `M${n1(px - L1 * Math.sin(th0))} ${n1(py + L1 * Math.cos(th0))} A${n1(L1)} ${n1(L1)} 0 0 0 ${n1(px + L1 * Math.sin(th0))} ${n1(py + L1 * Math.cos(th0))}`;
        return `<path class="ex-stroke exc-m ex-dash" style="stroke-width:1" d="${arc}"/><line class="ex-rad" x1="${px}" y1="${py}" x2="${n1(bx)}" y2="${n1(by)}"/><circle class="ex-fill ${cls}" cx="${n1(bx)}" cy="${n1(by)}" r="${r}" style="stroke:var(--card);stroke-width:2"/>`;
      };
      const ph = w * st.time;
      const r = 6 + v.m * 3;
      let pend = `${ln(px - 40, py, px + 40, py, 'exc-m', 3)}${ln(px, py, px, py + v.l * sc + 10, 'exc-m ex-faint', 1)}${bob(v.l, ph, 'exc-o', r)}`;
      const T4 = T / 2;
      if (st.cmp) pend += bob(v.l / 4, (2 * Math.PI * st.time) / T4, 'exc-b', r);
      // Энергия: доля Eк и Eп в данный момент.
      const ep = Math.cos(ph) ** 2;
      const vmax = Math.sqrt(2 * g * v.l * (1 - Math.cos(th0)));
      const n = Math.floor(st.time / T);
      const info = `${box(206, 4, 110, 132)}${tt(212, 18, `${tx(P.name)}: g = ${fmt(g, 2)}`, 'exs-t ex-start')}${tt(212, 36, `T = ${fmt(T, 2)} ${UN.s()}`, 'exs-h ex-start tc exc-o')}${tt(212, 52, `ν = 1/T = ${fmt(1 / T, 2)} ${UN.Hz()}`, 'exs-t ex-start')}
        ${st.cmp ? tt(212, 68, `l/4: T = ${fmt(T4, 2)} ${UN.s()}`, 'exs-t ex-start tc exc-b') : tt(212, 68, `${u('v at bottom', 'v внизу', 'v төменде')} = ${fmt(vmax, 2)} ${UN.ms()}`, 'exs-t ex-start')}
        ${tt(212, 86, `t = ${fmt(st.time, 1)} ${UN.s()} · ${n} ${u('osc.', 'кол.', 'терб.')}`, 'exs-s ex-start')}
        <rect x="212" y="96" width="${n1(98 * (1 - ep))}" height="9" rx="3" class="ex-fill exc-o"/><rect x="${n1(212 + 98 * (1 - ep))}" y="96" width="${n1(98 * ep)}" height="9" rx="3" class="ex-fill exc-b"/>${tt(212, 118, u('KE', 'Eк', 'Eк'), 'exs-s ex-start tc exc-o')}${tt(310, 118, u('PE', 'Eп', 'Eп'), 'exs-s ex-end tc exc-b')}${tt(261, 130, `E = ${fmt(v.m * g * v.l * (1 - Math.cos(th0)), 3)} ${UN.J()}`, 'exs-s')}`;
      const svg = `${pend}${info}${tt(px, 214, `l = ${fmt(v.l, 2)} ${UN.m()}, m = ${fmt(v.m, 1)} ${UN.kg()}`, 'exs-t')}`;
      let caption = u(
        `T = 2π√(l/g) = 2π√(${fmt(v.l, 2)} / ${fmt(g, 2)}) = ${fmt(T, 2)} s. ${st.cmp ? `A pendulum 4 times shorter swings 2 times faster: T = ${fmt(T4, 2)} s.` : `The mass ${fmt(v.m, 1)} kg does not matter: change it - T stays the same. At the bottom all energy is kinetic, at the ends - potential.`}`,
        `T = 2π√(l/g) = 2π√(${fmt(v.l, 2)} / ${fmt(g, 2)}) = ${fmt(T, 2)} с. ${st.cmp ? `Маятник в 4 раза короче качается в 2 раза чаще: T = ${fmt(T4, 2)} с.` : `Масса ${fmt(v.m, 1)} кг не важна: измени её - T не изменится. Внизу вся энергия кинетическая, в крайних точках - потенциальная.`}`,
        `T = 2π√(l/g) = 2π√(${fmt(v.l, 2)} / ${fmt(g, 2)}) = ${fmt(T, 2)} с. ${st.cmp ? `4 есе қысқа маятник 2 есе жиі тербеледі: T = ${fmt(T4, 2)} с.` : `${fmt(v.m, 1)} кг масса маңызды емес: өзгертсең де T өзгермейді. Төменде энергия толық кинетикалық, шеткі нүктелерде - потенциалдық.`}`,
      );
      if (st.m === 1) {
        const q = st.task;
        const ok = near(T, q.T, 0.02);
        caption = taskCap(
          u(`on ${tx(P.name)} (g = ${fmt(g, 2)} m/s²) make a pendulum with period T = ${fmt(q.T, 1)} s.`, `на планете ${tx(P.name)} (g = ${fmt(g, 2)} м/с²) сделай маятник с периодом T = ${fmt(q.T, 1)} с.`, `${tx(P.name)} ғаламшарында (g = ${fmt(g, 2)} м/с²) периоды T = ${fmt(q.T, 1)} с маятник жаса.`),
          ok,
          u(`Now T = ${fmt(T, 2)} s. Longer string - longer period.`, `Сейчас T = ${fmt(T, 2)} с. Длиннее нить - больше период.`, `Қазір T = ${fmt(T, 2)} с. Жіп ұзын болса - период үлкен.`),
          `l = gT² / 4π² = ${fmt(g, 2)} · ${fmt(q.T, 1)}² / 39,48 ≈ ${fmt(q.l, 2)} ${UN.m()}.`,
        );
        return { svg: svg + taskBadge(ok, 316, 154), caption };
      }
      return { svg, caption };
    },
  },
