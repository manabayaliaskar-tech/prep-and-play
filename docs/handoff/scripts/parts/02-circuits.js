// Соединения проводников: последовательно, параллельно, смешанно (U = 12 В), задание на амперметр.
const CIR_U = 12;
const cirTotal = (m, a, b, c) => (m === 0 ? a + b + c : m === 1 ? 1 / (1 / a + 1 / b + 1 / c) : a + (b * c) / (b + c));
const cirTask = () => {
  for (let g = 0; g < 500; g++) {
    const m = ri(0, 2);
    const r1 = ri(1, 12);
    const r2 = ri(2, 20);
    const r3 = ri(1, 20);
    const R = cirTotal(m, r1, r2, r3);
    const I = CIR_U / R;
    if (Math.abs(I * 100 - Math.round(I * 100)) < 1e-6 && I >= 0.5 && I <= 12) return { m, r1, r2, r3, I };
  }
  return { m: 0, r1: 2, r2: 4, r3: 6, I: 1 };
};
// Резистор с подписью: R над ним, U и I под ним.
const cirRes = (cx, y, i, R, U, I, side = false) =>
  `<rect x="${cx - 22}" y="${y - 8}" width="44" height="16" rx="4" class="ex-res"/>${tt(cx, y - 13, `R${sub(i)} = ${fmt(R, 0)} ${UN.Om()}`, 'exs-t')}${side ? tt(cx + 28, y + 16, `${fmt(U, 1)} ${UN.V()} · ${fmt(I, 2)} ${UN.A()}`, 'exs-s ex-start tc exc-p') : tt(cx, y + 20, `${fmt(U, 1)} ${UN.V()} · ${fmt(I, 2)} ${UN.A()}`, 'exs-s tc exc-p')}`;
const cirBatt = (x, y, below = false) =>
  `<rect x="${x - 8}" y="${y - 14}" width="16" height="28" style="fill:var(--surface)"/><line class="ex-batt" x1="${x - 5}" y1="${y - 13}" x2="${x - 5}" y2="${y + 13}"/><line class="ex-batt thin" x1="${x + 5}" y1="${y - 7}" x2="${x + 5}" y2="${y + 7}"/>${tt(x, below ? y + 26 : y - 18, `${CIR_U} ${UN.V()}`, 'exs-t')}`;
const cirAmm = (x, y, I) =>
  `<circle class="exs-panel" cx="${x}" cy="${y}" r="11"/><g class="exc-g"><circle class="ex-stroke" style="stroke-width:2" cx="${x}" cy="${y}" r="11"/></g>${tt(x, y + 4, 'A', 'exs-m')}${tt(x, y - 16, `${fmt(I, 2)} ${UN.A()}`, 'exs-t tc exc-g')}`;

function cirDraw(m, v) {
  const [a, b, c] = [v.r1, v.r2, v.r3];
  const R = cirTotal(m, a, b, c);
  const I = CIR_U / R;
  let svg;
  if (m === 0) {
    svg = `<path class="ex-wire" d="M30 50 H290 V170 H30 Z"/>${cirBatt(110, 170)}${cirAmm(210, 170, I)}
      ${cirRes(80, 50, 1, a, I * a, I)}${cirRes(160, 50, 2, b, I * b, I)}${cirRes(240, 50, 3, c, I * c, I)}
      ${box(46, 92, 228, 52)}${tt(160, 110, `R = ${fmt(a, 0)} + ${fmt(b, 0)} + ${fmt(c, 0)} = ${fmt(R, 2)} ${UN.Om()}`, 'exs-t')}
      ${tt(160, 126, `I = U / R = ${CIR_U} / ${fmt(R, 2)} = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}
      ${tt(160, 139, u('the same current everywhere, U adds up', 'ток везде одинаковый, U складываются', 'ток бәрінде бірдей, U қосылады'), 'exs-s')}`;
  } else if (m === 1) {
    const ys = [34, 72, 110];
    const rs = [a, b, c];
    svg = `<path class="ex-wire" d="M70 34 V186 H250 V34 M70 34 H250 M70 72 H250 M70 110 H250"/>
      ${ys.map((y) => `<circle class="ex-fill" style="color:var(--ink)" cx="70" cy="${y}" r="3"/><circle class="ex-fill" style="color:var(--ink)" cx="250" cy="${y}" r="3"/>`).join('')}
      ${ys.map((y, i) => cirRes(140, y, i + 1, rs[i], CIR_U, CIR_U / rs[i], true)).join('')}
      ${cirBatt(110, 186, true)}${cirAmm(196, 186, I)}
      ${box(76, 128, 168, 32)}${tt(160, 141, `1/R = 1/${fmt(a, 0)} + 1/${fmt(b, 0)} + 1/${fmt(c, 0)}`, 'exs-t')}${tt(160, 155, `R = ${fmt(R, 2)} ${UN.Om()}, I = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}`;
  } else {
    const p = (b * c) / (b + c);
    const I1 = I;
    const Up = I * p;
    svg = `<path class="ex-wire" d="M30 70 H140 M140 40 V100 M140 40 H260 M140 100 H260 M260 40 V100 M260 70 H290 V184 H30 V70"/>
      <circle class="ex-fill" style="color:var(--ink)" cx="140" cy="70" r="3"/><circle class="ex-fill" style="color:var(--ink)" cx="260" cy="70" r="3"/>
      ${cirRes(80, 70, 1, a, I * a, I1)}${cirRes(200, 40, 2, b, Up, Up / b)}${cirRes(200, 100, 3, c, Up, Up / c)}
      ${cirBatt(110, 184, true)}${cirAmm(210, 184, I)}
      ${box(40, 122, 240, 30)}${tt(160, 134, `R = ${fmt(a, 0)} + ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(R, 2)} ${UN.Om()}`, 'exs-t')}${tt(160, 147, `I = ${CIR_U} / ${fmt(R, 2)} = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}`;
  }
  return { svg, R, I };
}

//@@SCENE
  circuits: {
    title: L('Series, parallel and mixed circuits', 'Последовательное, параллельное и смешанное соединение', 'Тізбектей, параллель және аралас жалғау'),
    intro: L('In series resistances add up, in parallel the reciprocals add up. The battery gives U = 12 V.', 'При последовательном соединении складываются сопротивления, при параллельном - обратные величины. Батарея даёт U = 12 В.', 'Тізбектей жалғағанда кедергілер, параллель жалғағанда кері шамалар қосылады. Батарея U = 12 В береді.'),
    sliders: [
      { id: 'r1', label: L('R₁, Ω', 'R₁, Ом', 'R₁, Ом'), min: 1, max: 20, step: 1, value: 6, hidden: (v, st) => st.m === 3 },
      { id: 'r2', label: L('R₂, Ω', 'R₂, Ом', 'R₂, Ом'), min: 1, max: 20, step: 1, value: 3, hidden: (v, st) => st.m === 3 },
      { id: 'r3', label: L('R₃, Ω', 'R₃, Ом', 'R₃, Ом'), min: 1, max: 20, step: 1, value: 2 },
    ],
    buttons: [L('Series', 'Последовательно', 'Тізбектей'), L('Parallel', 'Параллельно', 'Параллель'), L('Mixed', 'Смешанно', 'Аралас'), TASK],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      if (i < 3) return null;
      st.task = cirTask();
      return { r1: st.task.r1, r2: st.task.r2, r3: 1 };
    },
    draw(v, step, st) {
      const task = st.m === 3 ? st.task : null;
      const m = task ? task.m : st.m;
      const { svg, R, I } = cirDraw(m, v);
      const [a, b, c] = [v.r1, v.r2, v.r3];
      let caption;
      if (task) {
        const ok = near(I, task.I, 0.004);
        const need = CIR_U / task.I;
        const kind = [u('series', 'последовательно', 'тізбектей'), u('parallel', 'параллельно', 'параллель'), u('R₁ in series with R₂ ∥ R₃', 'R₁ последовательно с R₂ ∥ R₃', 'R₁ мен R₂ ∥ R₃ тізбектей')][m];
        caption = taskCap(
          u(`(${kind}) choose R₃ so that the ammeter shows ${fmt(task.I, 2)} A.`, `(${kind}) подбери R₃, чтобы амперметр показал ${fmt(task.I, 2)} А.`, `(${kind}) амперметр ${fmt(task.I, 2)} А көрсететіндей R₃-ті тап.`),
          ok,
          u(`You need R = U / I = 12 / ${fmt(task.I, 2)} = ${fmt(need, 2)} Ω in total; now R = ${fmt(R, 2)} Ω.`, `Нужно общее R = U / I = 12 / ${fmt(task.I, 2)} = ${fmt(need, 2)} Ом, сейчас R = ${fmt(R, 2)} Ом.`, `Жалпы R = U / I = 12 / ${fmt(task.I, 2)} = ${fmt(need, 2)} Ом керек, қазір R = ${fmt(R, 2)} Ом.`),
          u(`R₃ = ${task.r3} Ω gives R = ${fmt(R, 2)} Ω and I = ${fmt(I, 2)} A.`, `R₃ = ${task.r3} Ом даёт R = ${fmt(R, 2)} Ом и I = ${fmt(I, 2)} А.`, `R₃ = ${task.r3} Ом R = ${fmt(R, 2)} Ом және I = ${fmt(I, 2)} А береді.`),
        );
        return { svg: svg + taskBadge(ok, 318, 12), caption };
      }
      if (m === 0)
        caption = u(
          `Series: R = R₁ + R₂ + R₃ = ${fmt(R, 0)} Ω. The same current I = ${fmt(I, 2)} A flows through all; the voltage splits in proportion to R: ${fmt(I * a, 1)} + ${fmt(I * b, 1)} + ${fmt(I * c, 1)} = 12 V.`,
          `Последовательно: R = R₁ + R₂ + R₃ = ${fmt(R, 0)} Ом. Через все течёт один ток I = ${fmt(I, 2)} А, а напряжение делится пропорционально R: ${fmt(I * a, 1)} + ${fmt(I * b, 1)} + ${fmt(I * c, 1)} = 12 В.`,
          `Тізбектей: R = R₁ + R₂ + R₃ = ${fmt(R, 0)} Ом. Барлығынан бір ток I = ${fmt(I, 2)} А өтеді, ал кернеу R-ге пропорционал бөлінеді: ${fmt(I * a, 1)} + ${fmt(I * b, 1)} + ${fmt(I * c, 1)} = 12 В.`,
        );
      else if (m === 1)
        caption = u(
          `Parallel: every resistor gets the full 12 V, the currents add up: ${fmt(12 / a, 2)} + ${fmt(12 / b, 2)} + ${fmt(12 / c, 2)} = ${fmt(I, 2)} A. The total R = ${fmt(R, 2)} Ω is smaller than the smallest resistor.`,
          `Параллельно: на каждом резисторе все 12 В, а токи складываются: ${fmt(12 / a, 2)} + ${fmt(12 / b, 2)} + ${fmt(12 / c, 2)} = ${fmt(I, 2)} А. Общее R = ${fmt(R, 2)} Ом меньше самого маленького.`,
          `Параллель: әр резисторда толық 12 В, ал токтар қосылады: ${fmt(12 / a, 2)} + ${fmt(12 / b, 2)} + ${fmt(12 / c, 2)} = ${fmt(I, 2)} А. Жалпы R = ${fmt(R, 2)} Ом ең кішісінен де аз.`,
        );
      else {
        const p = (b * c) / (b + c);
        caption = u(
          `First the parallel part: R₂₃ = ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(p, 2)} Ω, then add R₁: R = ${fmt(R, 2)} Ω, I = ${fmt(I, 2)} A. R₁ takes ${fmt(I * a, 1)} V, the pair ${fmt(I * p, 1)} V.`,
          `Сначала параллельный участок: R₂₃ = ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(p, 2)} Ом, потом прибавляем R₁: R = ${fmt(R, 2)} Ом, I = ${fmt(I, 2)} А. На R₁ ${fmt(I * a, 1)} В, на паре ${fmt(I * p, 1)} В.`,
          `Алдымен параллель бөлік: R₂₃ = ${fmt(b, 0)}·${fmt(c, 0)}/(${fmt(b, 0)} + ${fmt(c, 0)}) = ${fmt(p, 2)} Ом, сосын R₁ қосамыз: R = ${fmt(R, 2)} Ом, I = ${fmt(I, 2)} А. R₁-де ${fmt(I * a, 1)} В, жұпта ${fmt(I * p, 1)} В.`,
        );
      }
      return { svg, caption };
    },
  },
