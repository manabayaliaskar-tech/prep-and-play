// Колебания и волны: y(t), поперечная и продольная волна, λ = v/f, T = 1/f, задания.
const waveTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const [v, f] = pick([[4, 2], [6, 2], [6, 3], [8, 4], [3, 1.5], [5, 2.5], [8, 2]]);
    return { type, v, f, lam: v / f };
  }
  if (type === 1) {
    const T = pick([0.25, 0.4, 0.5, 1, 2]);
    return { type, T, f: 1 / T };
  }
  const [f, lam] = pick([[2, 3], [2, 2.5], [1, 4], [4, 1.5], [1.5, 4]]);
  return { type, f, lam, v: f * lam };
};

//@@SCENE
  'sine-wave': {
    title: L('Oscillations and waves', 'Колебания и волны', 'Тербелістер мен толқындар'),
    intro: L('An oscillation repeats every T = 1/f seconds. A wave carries it along at speed v: the wavelength is λ = v·T = v/f.', 'Колебание повторяется каждые T = 1/f секунд. Волна переносит его со скоростью v: длина волны λ = v·T = v/f.', 'Тербеліс әр T = 1/f секунд сайын қайталанады. Толқын оны v жылдамдықпен тасымалдайды: толқын ұзындығы λ = v·T = v/f.'),
    sliders: [
      { id: 'A', label: L('amplitude A, cm', 'амплитуда A, см', 'амплитуда A, см'), min: 1, max: 5, step: 0.1, value: 3, hidden: (v, st) => st.m === 3 },
      { id: 'f', label: L('frequency f, Hz', 'частота f, Гц', 'жиілік f, Гц'), min: 0.5, max: 4, step: 0.1, value: 1, hidden: (v, st) => st.m === 3 && st.task.type === 2 },
      { id: 'v', label: L('speed v, m/s', 'скорость v, м/с', 'жылдамдық v, м/с'), min: 1, max: 8, step: 0.5, value: 4, hidden: (v, st) => st.m === 0 || (st.m === 3 && st.task.type !== 2) },
    ],
    buttons: [L('Oscillation y(t)', 'Колебание y(t)', 'Тербеліс y(t)'), L('Transverse wave', 'Поперечная волна', 'Көлденең толқын'), L('Longitudinal wave', 'Продольная волна', 'Бойлық толқын'), TASK],
    state: () => ({ m: 1, t: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      if (i < 3) return null;
      st.task = waveTask();
      const q = st.task;
      return q.type === 2 ? { f: q.f, v: 1 } : q.type === 0 ? { v: q.v, f: 0.5 } : { f: 4 };
    },
    live(dt, v, st) {
      st.t += dt;
    },
    draw(v, step, st) {
      const task = st.m === 3 ? st.task : null;
      const mode = task ? (task.type === 1 ? 0 : 1) : st.m;
      const T = 1 / v.f;
      const lam = v.v / v.f;
      const t = st.t;
      let svg;
      if (mode === 0) {
        const sx = (x) => 70 + x * 120;
        const sy = (y) => 100 - y * 9;
        const y = (tt2) => v.A * Math.sin(2 * Math.PI * v.f * tt2);
        const tm = t % 2;
        const yn = y(tm);
        let g = '';
        for (let k = 0; k <= 2; k += 0.5) g += `${ln(sx(k), sy(-5.5), sx(k), sy(5.5), 'exc-m ex-faint', 0.6)}${tt(sx(k), 160, fmt(k, 1), 'exs-s')}`;
        const tc = (((0.25 / v.f) % T) + T) % T;
        svg = `${g}${ln(sx(0), 100, 314, 100, 'exc-m', 1.2)}${ln(sx(0), sy(5.6), sx(0), sy(-5.6), 'exc-m', 1.2)}${tt(314, 114, `t, ${UN.s()}`, 'exs-s ex-end')}${tt(sx(0) + 4, 16, `y, ${UN.cm()}`, 'exs-s ex-start')}
          <path class="ex-curve" d="${plot(y, 0, 2, sx, sy, 300)}"/>${ln(sx(tm), sy(5.5), sx(tm), sy(-5.5), 'exc-o', 1)}<circle class="ex-dot" cx="${n1(sx(tm))}" cy="${n1(sy(y(tm)))}" r="4"/>
          ${ln(24, 22, 44, 22, 'exc-m', 3)}${coil(34, 22, sy(yn) - 8, 12, 10)}<rect class="ex-fill exc-o" x="24" y="${n1(sy(yn) - 8)}" width="20" height="16" rx="3"/>${ln(18, 100, 50, 100, 'exc-m ex-dash', 1)}
          ${tc + T <= 2 ? `${ln(sx(tc), sy(v.A) - 6, sx(tc + T), sy(v.A) - 6, 'exc-k', 1.5)}${tt(sx(tc + T / 2), sy(v.A) - 10, `T = ${fmt(T, 2)} ${UN.s()}`, 'exs-t tc exc-k')}` : '<g/><g/>'}
          ${varrow(sx(tc), 100, sx(tc), sy(v.A), 'exc-g', '', 1.5)}${tt(sx(tc) - 4, (100 + sy(v.A)) / 2 + 4, 'A', 'exs-t ex-end tc exc-g')}`;
      } else {
        const sx = (x) => 20 + x * 29;
        const k2 = (2 * Math.PI) / lam;
        const w = 2 * Math.PI * v.f;
        if (mode === 1) {
          const y = (x) => v.A * Math.sin(w * t - k2 * x);
          const sy = (yy) => 104 - yy * 9;
          // Положение гребня ближе к началу.
          const ph = ((w * t - Math.PI / 2) / k2) % lam;
          const xc = ((ph % lam) + lam) % lam;
          const dots = Array.from({ length: 21 }, (_, i) => {
            const x = i * 0.5;
            return `<circle class="ex-fill ${i === 4 ? 'exc-r' : 'exc-p'}" cx="${n1(sx(x))}" cy="${n1(sy(y(x)))}" r="${i === 4 ? 5 : 2.6}"/>`;
          }).join('');
          svg = `${ln(sx(0), 104, sx(10), 104, 'exc-m ex-dash', 1)}<path class="ex-stroke exc-p" style="stroke-width:2" d="${plot(y, 0, 10, sx, sy, 400)}"/>${dots}
            ${ln(sx(2), sy(v.A) - 4, sx(2), sy(-v.A) + 4, 'exc-r ex-faint', 1)}
            ${xc + lam <= 10 ? `${ln(sx(xc), sy(v.A) - 10, sx(xc + lam), sy(v.A) - 10, 'exc-k', 1.5)}${ln(sx(xc), sy(v.A) - 14, sx(xc), sy(v.A) - 6, 'exc-k', 1.5)}${ln(sx(xc + lam), sy(v.A) - 14, sx(xc + lam), sy(v.A) - 6, 'exc-k', 1.5)}${tt(sx(xc + lam / 2), sy(v.A) - 15, `λ = ${fmt(lam, 2)} ${UN.m()}`, 'exs-t tc exc-k')}` : tt(160, 40, `λ = ${fmt(lam, 2)} ${UN.m()}`, 'exs-t tc exc-k')}
            ${varrow(232, 176, 300, 176, 'exc-g', '', 2.5)}${tt(266, 170, `v = ${fmt(v.v, 1)} ${UN.ms()}`, 'exs-t tc exc-g')}`;
        } else {
          let dots = '';
          for (let i = 0; i <= 60; i++) {
            const x0 = i / 6;
            const x = x0 + (v.A / 5) * Math.min(0.8, lam / 5) * Math.sin(w * t - k2 * x0);
            for (let r = 0; r < 4; r++) dots += `<circle class="ex-fill ${i === 12 ? 'exc-r' : 'exc-p'}" cx="${n1(sx(x))}" cy="${66 + r * 18}" r="${i === 12 ? 3.4 : 2.4}"/>`;
          }
          // Сгущения: где смещение убывает по x (частицы сближаются).
          const xs = (((w * t) / k2) % lam + lam) % lam;
          let marks = '';
          for (let x = xs; x <= 10; x += lam) marks += tt(sx(x), 150, u('compression', 'сгущение', 'қоюлану'), 'exs-s tc exc-o');
          svg = `${dots}${lam >= 2.2 ? marks : ''}${tt(200, 52, `λ = ${fmt(lam, 2)} ${UN.m()} · ${u('particles move back and forth along the wave', 'частицы колеблются вдоль волны', 'бөлшектер толқын бойымен тербеледі')}`, 'exs-s')}
            ${varrow(232, 176, 300, 176, 'exc-g', '', 2.5)}${tt(266, 170, `v = ${fmt(v.v, 1)} ${UN.ms()}`, 'exs-t tc exc-g')}`;
        }
        let axis = '';
        for (let x = 0; x <= 10; x += 2) axis += `${ln(sx(x), 192, sx(x), 196, 'exc-m', 1)}${tt(sx(x), 208, String(x), 'exs-s')}`;
        svg += `${ln(sx(0), 192, sx(10), 192, 'exc-m', 1)}${axis}${tt(316, 186, `x, ${UN.m()}`, 'exs-s ex-end')}`;
      }
      const bx = mode === 0 ? 204 : 4;
      const by = mode === 0 ? 176 : 4;
      const info = `${box(bx, by, 112, 34)}${tt(bx + 6, by + 13, `T = 1/f = ${fmt(T, 2)} ${UN.s()}`, 'exs-t ex-start')}${tt(bx + 6, by + 28, mode === 0 ? `A = ${fmt(v.A, 1)} ${UN.cm()}` : `λ = v/f = ${fmt(lam, 2)} ${UN.m()}`, 'exs-t ex-start')}`;
      svg += info;
      let caption = [
        u(`The load oscillates with amplitude A = ${fmt(v.A, 1)} cm and frequency f = ${fmt(v.f, 1)} Hz (that many swings per second), period T = 1/f = ${fmt(T, 2)} s. y = A·sin(2πft).`, `Груз колеблется с амплитудой A = ${fmt(v.A, 1)} см и частотой f = ${fmt(v.f, 1)} Гц (столько колебаний за 1 с), период T = 1/f = ${fmt(T, 2)} с. y = A·sin(2πft).`, `Жүк A = ${fmt(v.A, 1)} см амплитудамен және f = ${fmt(v.f, 1)} Гц жиілікпен тербеледі (1 с ішіндегі тербеліс саны), период T = 1/f = ${fmt(T, 2)} с. y = A·sin(2πft).`),
        u(`Transverse wave: each particle (the red one) only moves up and down, while the shape runs right at v = ${fmt(v.v, 1)} m/s. In one period it moves one wavelength: λ = v/f = ${fmt(v.v, 1)} / ${fmt(v.f, 1)} = ${fmt(lam, 2)} m.`, `Поперечная волна: каждая частица (красная) движется только вверх-вниз, а форма бежит вправо со скоростью v = ${fmt(v.v, 1)} м/с. За один период волна проходит длину волны: λ = v/f = ${fmt(v.v, 1)} / ${fmt(v.f, 1)} = ${fmt(lam, 2)} м.`, `Көлденең толқын: әр бөлшек (қызылы) тек жоғары-төмен қозғалады, ал пішін оңға v = ${fmt(v.v, 1)} м/с жылдамдықпен жүгіреді. Бір периодта толқын бір толқын ұзындығына жылжиды: λ = v/f = ${fmt(v.v, 1)} / ${fmt(v.f, 1)} = ${fmt(lam, 2)} м.`),
        u(`Longitudinal wave (like sound): particles move back and forth along the direction of the wave, making compressions and rarefactions. The distance between two compressions is λ = v/f = ${fmt(lam, 2)} m.`, `Продольная волна (как звук): частицы колеблются вдоль направления волны, образуя сгущения и разрежения. Расстояние между соседними сгущениями - λ = v/f = ${fmt(lam, 2)} м.`, `Бойлық толқын (дыбыс сияқты): бөлшектер толқын бағыты бойымен тербеліп, қоюлану мен сирету жасайды. Көрші қоюланулар арасы - λ = v/f = ${fmt(lam, 2)} м.`),
      ][mode];
      if (task) {
        let ok;
        let goal;
        let done;
        if (task.type === 0) {
          ok = near(v.f, task.f, 0.04);
          goal = u(`the wave speed is ${task.v} m/s. Make the wavelength λ = ${fmt(task.lam, 1)} m.`, `скорость волны ${task.v} м/с. Сделай длину волны λ = ${fmt(task.lam, 1)} м.`, `толқын жылдамдығы ${task.v} м/с. Толқын ұзындығын λ = ${fmt(task.lam, 1)} м ет.`);
          done = `f = v/λ = ${task.v} / ${fmt(task.lam, 1)} = ${fmt(task.f, 1)} ${UN.Hz()}.`;
        } else if (task.type === 1) {
          ok = near(v.f, task.f, 0.04);
          goal = u(`make an oscillation with period T = ${fmt(task.T, 2)} s.`, `сделай колебание с периодом T = ${fmt(task.T, 2)} с.`, `периоды T = ${fmt(task.T, 2)} с тербеліс жаса.`);
          done = `f = 1/T = 1 / ${fmt(task.T, 2)} = ${fmt(task.f, 1)} ${UN.Hz()}.`;
        } else {
          ok = near(v.v, task.v, 0.2);
          goal = u(`f = ${fmt(task.f, 1)} Hz. What speed gives λ = ${fmt(task.lam, 1)} m?`, `f = ${fmt(task.f, 1)} Гц. Какая скорость даст λ = ${fmt(task.lam, 1)} м?`, `f = ${fmt(task.f, 1)} Гц. Қандай жылдамдық λ = ${fmt(task.lam, 1)} м береді?`);
          done = `v = λ·f = ${fmt(task.lam, 1)} · ${fmt(task.f, 1)} = ${fmt(task.v, 1)} ${UN.ms()}.`;
        }
        caption = taskCap(goal, ok, u(`Now T = ${fmt(T, 2)} s, λ = ${fmt(lam, 2)} m.`, `Сейчас T = ${fmt(T, 2)} с, λ = ${fmt(lam, 2)} м.`, `Қазір T = ${fmt(T, 2)} с, λ = ${fmt(lam, 2)} м.`), done);
        return { svg: svg + taskBadge(ok, 316, 14), caption };
      }
      return { svg, caption };
    },
  },
