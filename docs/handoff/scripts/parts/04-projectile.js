// Бросок под углом (и горизонтальный с высоты): Земля, Луна, Марс, векторы скорости, энергия, задания.
const PLANETS = [
  { g: 9.8, name: L('Earth', 'Земля', 'Жер') },
  { g: 1.62, name: L('Moon', 'Луна', 'Ай') },
  { g: 3.7, name: L('Mars', 'Марс', 'Марс') },
];
/** Полёт: время, дальность, наибольшая высота. */
const flight = (v0, al, h0, g) => {
  const vx = v0 * Math.cos(rad(al));
  const vy = v0 * Math.sin(rad(al));
  const T = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
  return { vx, vy, T, L: vx * T, Hm: h0 + (vy > 0 ? (vy * vy) / (2 * g) : 0), tTop: vy > 0 ? vy / g : 0 };
};
const prjTask = (g) => {
  const type = ri(0, 3);
  if (type === 0) {
    const v0 = pick([15, 18, 20]);
    const h0 = pick([0, 0, 10]);
    const a = ri(15, 70);
    return { type, v0, h0, D: Math.round(flight(v0, a, h0, g).L), al: 80 };
  }
  if (type === 1) return { type, v0: pick([12, 16, 20, 24]), h0: 0, al: 20 };
  if (type === 2) {
    const a0 = pick([15, 20, 25, 30, 35, 40]);
    return { type, v0: pick([16, 20]), h0: 0, a0, al: 45 };
  }
  const h0 = pick([5, 20, 30]);
  const v = pick([8, 10, 12, 15]);
  return { type, v0: 5, h0, al: 0, D: Math.round(v * Math.sqrt((2 * h0) / g)) };
};

//@@SCENE
  projectile: {
    title: L('Throwing at an angle', 'Бросок под углом к горизонту', 'Көкжиекке бұрыш жасай лақтыру'),
    intro: L('Horizontally the ball keeps its speed, vertically gravity changes it. The path is a parabola; on the Moon it is much longer.', 'По горизонтали мяч сохраняет скорость, по вертикали её меняет сила тяжести. Траектория - парабола, на Луне она намного длиннее.', 'Көлденеңінен доп жылдамдығын сақтайды, тігінен оны ауырлық күші өзгертеді. Траектория - парабола, Айда әлдеқайда ұзын.'),
    sliders: [
      { id: 'v0', label: L('v₀, m/s', 'v₀, м/с', 'v₀, м/с'), min: 5, max: 30, step: 0.5, value: 20, hidden: (v, st) => st.m === 1 && st.task.type !== 3 },
      { id: 'al', label: 'α, °', min: 0, max: 90, step: 1, value: 50, hidden: (v, st) => st.m === 1 && st.task.type === 3 },
      { id: 'h0', label: L('height h₀, m', 'высота h₀, м', 'биіктік h₀, м'), min: 0, max: 40, step: 1, value: 0, hidden: (v, st) => st.m === 1 },
    ],
    buttons: [L('▶ Throw', '▶ Бросить', '▶ Лақтыру'), L('Planet ↻', 'Планета ↻', 'Ғаламшар ↻'), L('Velocity vectors', 'Векторы скорости', 'Жылдамдық векторлары'), TASK, FREE],
    state: () => ({ k: 0.3, run: false, p: 0, vec: true, m: 0, task: null, prev: null }),
    pressed: (i, v, st) => (i === 2 && st.vec) || (i === 3 && st.m === 1),
    btnHidden: (i, v, st) => (i === 4 ? st.m !== 1 : i === 1 && st.m === 1),
    onButton(i, st, v) {
      if (i === 0) {
        st.prev = { v0: v.v0, al: v.al, h0: v.h0, p: st.p };
        st.k = reduced() ? 1 : 0;
        st.run = !reduced();
      } else if (i === 1) {
        st.p = (st.p + 1) % 3;
        st.prev = null;
      } else if (i === 2) st.vec = !st.vec;
      else if (i === 4) st.m = 0;
      else {
        st.m = 1;
        st.prev = null;
        st.task = prjTask(PLANETS[st.p].g);
        st.k = 1;
        return { v0: st.task.v0, h0: st.task.h0, al: st.task.al };
      }
      return null;
    },
    live(dt, v, st) {
      if (!st.run) return;
      st.k = Math.min(1, st.k + dt / 2.6);
      if (st.k >= 1) st.run = false;
    },
    draw(v, step, st) {
      const P = PLANETS[st.p];
      const g = P.g;
      const f = flight(v.v0, v.al, v.h0, g);
      const task0 = st.m === 1 ? st.task : null;
      // Масштаб под текущий полёт (и флажок), из «круглого» ряда, чтобы картинка не дёргалась.
      const fit = Math.min(270 / Math.max(f.L, task0?.D ?? 0, 8), 170 / Math.max(f.Hm, 4));
      const sc = [6, 5, 4, 3, 2.5, 2, 1.6, 1.25, 1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.16, 0.12, 0.1, 0.08].find((x) => x <= fit) ?? 0.06;
      const X0 = 26;
      const GY = 200;
      const X = (x) => X0 + x * sc;
      const Y = (y) => GY - y * sc;
      const path = (q, upto = 1) => {
        const ff = flight(q.v0, q.al, q.h0, g);
        let d = '';
        for (let i = 0; i <= 60; i++) {
          const t = (ff.T * upto * i) / 60;
          d += `${i ? 'L' : 'M'}${n1(X(ff.vx * t))} ${n1(Y(q.h0 + ff.vy * t - (g * t * t) / 2))} `;
        }
        return d;
      };
      const t = f.T * st.k;
      const bx = f.vx * t;
      const by = v.h0 + f.vy * t - (g * t * t) / 2;
      const vy = f.vy - g * t;
      const stepM = [5, 10, 20, 50, 100, 200, 500, 1000].find((s2) => s2 * sc >= 38);
      let ticks = '';
      for (let x = 0; X(x) <= 296; x += stepM) ticks += `${ln(X(x), GY, X(x), GY + 4, 'exc-m', 1)}${tt(X(x), GY + 14, fmt(x, 0), 'exs-s')}`;
      const task = st.m === 1 ? st.task : null;
      let target = '<g/>';
      if (task && (task.type === 0 || task.type === 3)) {
        const tx2 = X(task.D);
        target = `<g class="exc-r">${ln(tx2, GY, tx2, GY - 26, 'exc-r', 2)}<path class="ex-fill" d="M${n1(tx2)} ${GY - 26} l14 5 l-14 5 Z"/></g>${tt(tx2, GY - 30, `${task.D} ${UN.m()}`, 'exs-t tc exc-r')}`;
      }
      if (task && task.type === 2) target = `<path class="ex-stroke exc-r ex-dash" style="stroke-width:1.5" d="${path({ v0: v.v0, al: task.a0, h0: 0 })}"/>`;
      const prev = st.prev && st.prev.p === st.p ? `<path class="ex-stroke exc-m ex-faint" style="stroke-width:1.5" d="${path(st.prev)}"/>` : '<g/>';
      const tower = v.h0 > 0 ? `<rect x="${X0 - 14}" y="${n1(Y(v.h0))}" width="14" height="${n1(v.h0 * sc)}" class="ex-fill exc-m" style="opacity:.35"/>${tt(X0 - 7, Y(v.h0) - 5, `${fmt(v.h0, 0)} ${UN.m()}`, 'exs-s')}` : '<g/>';
      const bX = X(bx);
      const bY = Y(by);
      // Масштаб векторов: 1,6 px на м/с, но стрелки не выходят за кадр.
      const vs = Math.max(0.7, Math.min(1.6, vy < 0 ? (212 - bY) / -vy : (bY - 10) / Math.max(vy, 0.01), (306 - bX) / Math.max(f.vx, 0.01)));
      // Когда мяч уже упал, векторы не рисуем: у земли они не помещаются.
      const vecs = st.vec && st.k < 0.995
        ? `${varrow(bX, bY, bX + f.vx * vs, bY - vy * vs, 'exc-o', 'v', 2.5, 8, Math.min(0, 214 - (bY - vy * vs)))}${varrow(bX, bY, bX + f.vx * vs, bY, 'exc-g', 'vₓ', 1.8, 9, 4)}${Math.abs(vy) > 0.6 ? varrow(bX, bY, bX, bY - vy * vs, 'exc-k', 'vᵧ', 1.8, -10, vy > 0 ? 4 : Math.min(-2, 214 - (bY - vy * vs))) : '<g/>'}`
        : '<g/><g/><g/>';
      // Энергия: доля Eк и Eп (от земли).
      const E = (v.v0 * v.v0) / 2 + g * v.h0;
      const ep = clamp((g * Math.max(0, by)) / E, 0, 1);
      const KE = u('KE', 'Eк', 'Eк');
      const PE = u('PE', 'Eп', 'Eп');
      const ebar = `<rect x="212" y="62" width="${n1(100 * (1 - ep))}" height="9" rx="3" class="ex-fill exc-o"/><rect x="${n1(212 + 100 * (1 - ep))}" y="62" width="${n1(100 * ep)}" height="9" rx="3" class="ex-fill exc-b"/>${tt(212, 82, KE, 'exs-s ex-start tc exc-o')}${tt(312, 82, PE, 'exs-s ex-end tc exc-b')}`;
      const info = `${box(206, 4, 112, 84)}${tt(212, 17, `${tx(P.name)}: g = ${fmt(g, 2)}`, 'exs-t ex-start')}${tt(212, 31, `T = ${fmt(f.T, 2)} ${UN.s()}`, 'exs-t ex-start')}${tt(212, 44, `L = ${fmt(f.L, 1)} ${UN.m()}`, 'exs-t ex-start')}${tt(212, 57, `H = ${fmt(f.Hm, 1)} ${UN.m()}`, 'exs-t ex-start')}${ebar}`;
      const angle = v.al > 0 && v.al < 90 ? `<path class="ex-stroke exc-p" style="stroke-width:1.2" d="M${X0 + 22} ${n1(Y(v.h0))} A22 22 0 0 0 ${n1(X0 + 22 * Math.cos(rad(v.al)))} ${n1(Y(v.h0) - 22 * Math.sin(rad(v.al)))}"/>${tt(X0 + 30, Y(v.h0) - 6, `${fmt(v.al, 0)}°`, 'exs-s ex-start tc exc-p')}` : '<g/><g/>';
      const svg = `<rect x="0" y="${GY}" width="${W}" height="${H - GY}" class="exs-ground"/><line class="ex-axis" x1="0" y1="${GY}" x2="${W}" y2="${GY}"/>${ticks}${tt(316, GY + 14, UN.m(), 'exs-s ex-end')}
        ${tower}${prev}${target}<path class="ex-stroke exc-m ex-dash" style="stroke-width:1.3" d="${path(v)}"/><path class="ex-curve" d="${path(v, st.k)}"/>${angle}
        ${vecs}<circle class="ex-ball" cx="${n1(bX)}" cy="${n1(bY)}" r="6"/>${info}`;
      let caption = u(
        `${tx(P.name)}, g = ${fmt(g, 2)} m/s². Flight time T = ${fmt(f.T, 2)} s, range L = vₓ·T = ${fmt(f.vx, 2)} · ${fmt(f.T, 2)} = ${fmt(f.L, 1)} m, top height H = ${fmt(f.Hm, 1)} m. At t = ${fmt(t, 2)} s: vₓ = v₀cos α = ${fmt(f.vx, 1)} m/s (constant), vᵧ = v₀sin α − gt = ${fmt(vy, 1)} m/s.`,
        `${tx(P.name)}, g = ${fmt(g, 2)} м/с². Время полёта T = ${fmt(f.T, 2)} с, дальность L = vₓ·T = ${fmt(f.vx, 2)} · ${fmt(f.T, 2)} = ${fmt(f.L, 1)} м, наибольшая высота H = ${fmt(f.Hm, 1)} м. При t = ${fmt(t, 2)} с: vₓ = v₀cos α = ${fmt(f.vx, 1)} м/с (не меняется), vᵧ = v₀sin α − gt = ${fmt(vy, 1)} м/с.`,
        `${tx(P.name)}, g = ${fmt(g, 2)} м/с². Ұшу уақыты T = ${fmt(f.T, 2)} с, қашықтық L = vₓ·T = ${fmt(f.vx, 2)} · ${fmt(f.T, 2)} = ${fmt(f.L, 1)} м, ең үлкен биіктік H = ${fmt(f.Hm, 1)} м. t = ${fmt(t, 2)} с кезде: vₓ = v₀cos α = ${fmt(f.vx, 1)} м/с (өзгермейді), vᵧ = v₀sin α − gt = ${fmt(vy, 1)} м/с.`,
      );
      if (task) {
        let ok;
        let goal;
        let hint;
        let done;
        if (task.type === 0) {
          ok = near(f.L, task.D, 1.5);
          goal = u(`v₀ = ${task.v0} m/s${task.h0 ? `, from ${task.h0} m` : ''}. Choose the angle so that the ball lands at the flag (${task.D} m).`, `v₀ = ${task.v0} м/с${task.h0 ? `, с высоты ${task.h0} м` : ''}. Подбери угол, чтобы мяч упал у флажка (${task.D} м).`, `v₀ = ${task.v0} м/с${task.h0 ? `, ${task.h0} м биіктіктен` : ''}. Доп жалаушаға (${task.D} м) түсетіндей бұрышты тап.`);
          hint = u(`Now L = ${fmt(f.L, 1)} m - ${f.L < task.D ? 'short' : 'too far'}. Often there are two good angles.`, `Сейчас L = ${fmt(f.L, 1)} м - ${f.L < task.D ? 'недолёт' : 'перелёт'}. Часто подходят два угла.`, `Қазір L = ${fmt(f.L, 1)} м - ${f.L < task.D ? 'жетпей қалды' : 'асып кетті'}. Көбіне екі бұрыш сәйкес келеді.`);
          done = u(`α = ${fmt(v.al, 0)}° gives L = ${fmt(f.L, 1)} m.`, `α = ${fmt(v.al, 0)}° даёт L = ${fmt(f.L, 1)} м.`, `α = ${fmt(v.al, 0)}° L = ${fmt(f.L, 1)} м береді.`);
        } else if (task.type === 1) {
          ok = v.al === 45;
          goal = u(`at what angle does the ball fly farthest (v₀ = ${task.v0} m/s, from the ground)?`, `под каким углом мяч улетит дальше всего (v₀ = ${task.v0} м/с, с земли)?`, `доп қандай бұрышпен ең алысқа ұшады (v₀ = ${task.v0} м/с, жерден)?`);
          hint = u(`Now L = ${fmt(f.L, 1)} m. Watch L in the corner and look for its maximum.`, `Сейчас L = ${fmt(f.L, 1)} м. Следи за L в углу и найди максимум.`, `Қазір L = ${fmt(f.L, 1)} м. Бұрыштағы L-ді бақылап, максимумын тап.`);
          done = u(`L = v₀²·sin 2α / g is largest when sin 2α = 1, that is α = 45°: L = ${fmt(f.L, 1)} m.`, `L = v₀²·sin 2α / g больше всего при sin 2α = 1, то есть α = 45°: L = ${fmt(f.L, 1)} м.`, `L = v₀²·sin 2α / g ең үлкені sin 2α = 1 кезде, яғни α = 45°: L = ${fmt(f.L, 1)} м.`);
        } else if (task.type === 2) {
          ok = v.al === 90 - task.a0;
          goal = u(`the red dashed path is a throw at ${task.a0}°. Find another angle with the same range.`, `красный пунктир - бросок под ${task.a0}°. Найди другой угол с той же дальностью.`, `қызыл пунктир - ${task.a0}° лақтыру. Дәл сондай қашықтық беретін басқа бұрышты тап.`);
          hint = u(`Now L = ${fmt(f.L, 1)} m, needed ${fmt(flight(v.v0, task.a0, 0, g).L, 1)} m.`, `Сейчас L = ${fmt(f.L, 1)} м, нужно ${fmt(flight(v.v0, task.a0, 0, g).L, 1)} м.`, `Қазір L = ${fmt(f.L, 1)} м, керегі ${fmt(flight(v.v0, task.a0, 0, g).L, 1)} м.`);
          done = u(`${task.a0}° and ${90 - task.a0}° add up to 90°, and sin 2α is the same for them.`, `${task.a0}° и ${90 - task.a0}° в сумме дают 90°, а sin 2α у них одинаковый.`, `${task.a0}° пен ${90 - task.a0}° қосындысы 90°, ал sin 2α бірдей.`);
        } else {
          ok = near(f.L, task.D, 1);
          const T = Math.sqrt((2 * task.h0) / g);
          goal = u(`throw horizontally from ${task.h0} m so that the ball lands at ${task.D} m. Choose v₀.`, `брось горизонтально с высоты ${task.h0} м так, чтобы мяч упал в ${task.D} м. Подбери v₀.`, `${task.h0} м биіктіктен көлденең лақтырып, доп ${task.D} м жерге түсетіндей v₀-ді тап.`);
          hint = u(`The fall lasts t = √(2h/g) = ${fmt(T, 2)} s whatever v₀ is; L = v₀·t = ${fmt(f.L, 1)} m now.`, `Падение длится t = √(2h/g) = ${fmt(T, 2)} с при любой v₀; сейчас L = v₀·t = ${fmt(f.L, 1)} м.`, `Құлау кез келген v₀ үшін t = √(2h/g) = ${fmt(T, 2)} с созылады; қазір L = v₀·t = ${fmt(f.L, 1)} м.`);
          done = `v₀ = L / t = ${task.D} / ${fmt(T, 2)} ≈ ${fmt(task.D / T, 1)} ${UN.ms()}.`;
        }
        caption = taskCap(goal, ok, hint, done);
        return { svg: svg + taskBadge(ok, 200, 14), caption };
      }
      return { svg, caption };
    },
  },
