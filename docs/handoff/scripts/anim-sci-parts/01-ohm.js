// Закон Ома: схема с амперметром и вольтметром, график I(U), задания.
const ohmTask = () => {
  const type = ri(0, 2);
  for (let g = 0; g < 200; g++) {
    if (type === 0) {
      const R = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 16, 20]);
      const U = ri(2, 12);
      if ((U * 100) % R === 0 && U / R >= 0.3 && U / R <= 4) return { type, U, R, I: U / R };
    } else if (type === 1) {
      const R = ri(2, 10);
      const I = pick([0.5, 1, 1.5, 2]);
      if (I * R <= 12 && I * R >= 2) return { type, U: I * R, R, I };
    } else {
      const U = pick([6, 9, 12]);
      const R = ri(2, 20);
      if ((U * U) % R === 0) return { type, U, R, I: U / R, P: (U * U) / R };
    }
  }
  return { type: 0, U: 12, R: 4, I: 3 };
};

// Схема: батарейка слева, резистор сверху, вольтметр параллельно резистору, амперметр справа.
function ohmCircuit(v, st, I) {
  const along = (s) => {
    s = ((s % 700) + 700) % 700;
    if (s < 240) return [40 + s, 40];
    if (s < 350) return [280, 40 + (s - 240) * (136 / 110)];
    if (s < 590) return [280 - (s - 350), 176];
    return [40, 176 - (s - 590) * (136 / 110)];
  };
  // Электроны идут от «−» к «+» по внешней цепи: против направления тока.
  const el = Array.from({ length: 22 }, (_, i) => {
    const [x, y] = along(-(i * 32 + st.ph));
    const hideR = y === 40 && x > 112 && x < 208;
    return `<circle class="ex-fill exc-b" cx="${n1(x)}" cy="${n1(y)}" r="${I > 0.005 && !hideR ? 2.4 : 0}"/>`;
  }).join('');
  const P = v.U * I;
  const heat = clamp(P / 40, 0, 1);
  const meter = (x, y, s, val, cls) => `<circle class="exs-panel" cx="${x}" cy="${y}" r="13"/><g class="${cls}"><circle class="ex-stroke" style="stroke-width:2" cx="${x}" cy="${y}" r="13"/></g>${tt(x, y + 4.5, s, 'exs-m')}${val}`;
  return `<path class="ex-wire" d="M40 40 H280 V176 H40 Z"/>
    <path class="ex-wire" style="stroke-width:2" d="M100 40 V78 H147 M173 78 H220 V40"/>
    <circle class="ex-glow" cx="160" cy="40" r="${n1(10 + 22 * heat)}" opacity="${n1(heat * 70) / 100}" style="fill:var(--orange)"/>
    <rect x="118" y="31" width="84" height="18" rx="4" class="ex-res" style="fill:color-mix(in srgb, var(--orange) ${Math.round(20 + heat * 70)}%, var(--card))"/>
    ${tt(160, 26, `R = ${fmt(v.R, 1)} ${UN.Om()}`, 'exs-t')}
    <rect x="30" y="100" width="20" height="18" style="fill:var(--surface)"/><line class="ex-batt" x1="27" y1="103" x2="53" y2="103"/><line class="ex-batt thin" x1="33" y1="114" x2="47" y2="114"/>
    ${tt(22, 99, '+', 'exs-m tc exc-r')}${tt(22, 123, '−', 'exs-m tc exc-b')}
    ${tt(58, 113, `U = ${fmt(v.U, 1)} ${UN.V()}`, 'exs-t ex-start')}
    ${el}
    ${meter(160, 78, 'V', tt(160, 104, `${fmt(v.U, 1)} ${UN.V()}`, 'exs-t tc exc-p'), 'exc-p')}
    ${meter(280, 108, 'A', tt(262, 112, `${fmt(I, 2)} ${UN.A()}`, 'exs-t ex-end tc exc-g'), 'exc-g')}
    ${I > 0.005 ? varrow(232, 52, 262, 52, 'exc-r', '', 2) + tt(247, 66, 'I', 'exs-t tc exc-r') : '<g/>'}
    ${box(66, 124, 188, 44)}
    ${tt(160, 141, `I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} ${UN.A()}`, 'exs-t')}
    ${tt(160, 159, `P = U · I = ${fmt(P, 1)} ${UN.W()}`, 'exs-s')}
    ${tt(160, 200, u('blue dots - electrons (move from − to +), red arrow - current', 'синие точки - электроны (идут от − к +), красная стрелка - ток', 'көк нүктелер - электрондар (− -тен + -ке), қызыл нұсқар - ток'), 'exs-s')}`;
}

function ohmGraph(v, I) {
  const sx = (U) => 42 + U * 22;
  const sy = (i) => 186 - i * 40;
  let g = '';
  for (let U = 0; U <= 12; U += 2) g += `<line class="ex-grid" x1="${sx(U)}" y1="${sy(0)}" x2="${sx(U)}" y2="${sy(4)}"/>${tt(sx(U), 199, fmt(U, 0), 'exs-s')}`;
  for (let i = 0; i <= 4; i++) g += `<line class="ex-grid" x1="${sx(0)}" y1="${sy(i)}" x2="${sx(12)}" y2="${sy(i)}"/>${tt(34, sy(i) + 3, fmt(i, 0), 'exs-s ex-end')}`;
  const line = (R, cls, w) => {
    const Ue = Math.min(12, 4 * R);
    return `${ln(sx(0), sy(0), sx(Ue), sy(Ue / R), cls, w)}`;
  };
  const refs = [2, 4, 8]
    .map((R) => {
      const Ue = Math.min(12, 4 * R);
      return `<g class="ex-faint">${line(R, 'exc-m', 1.3)}</g>${tt(Ue < 12 ? sx(Ue) + 4 : sx(12), sy(Ue / R) - 5, `${R} ${UN.Om()}`, `exs-s ${Ue < 12 ? 'ex-start' : 'ex-end'}`)}`;
    })
    .join('');
  const Ue = Math.min(12, 4 * v.R);
  const shown = I <= 4.05;
  return `${g}<line class="ex-axis" x1="${sx(0)}" y1="${sy(0)}" x2="${sx(12) + 6}" y2="${sy(0)}"/><line class="ex-axis" x1="${sx(0)}" y1="${sy(0)}" x2="${sx(0)}" y2="${sy(4) - 6}"/>
    ${tt(sx(12) + 4, 212, `U, ${UN.V()}`, 'exs-t ex-end')}${tt(sx(0) + 4, 14, `I, ${UN.A()}`, 'exs-t ex-start')}
    ${refs}${line(v.R, 'exc-p', 3)}${tt(sx(Ue) - 4, sy(Ue / v.R) + 14, `R = ${fmt(v.R, 1)} ${UN.Om()}`, 'exs-t ex-end tc exc-p')}
    ${shown ? `${ln(sx(v.U), sy(I), sx(v.U), sy(0), 'exc-o ex-dash', 1.2)}${ln(sx(v.U), sy(I), sx(0), sy(I), 'exc-o ex-dash', 1.2)}<circle class="ex-dot" cx="${n1(sx(v.U))}" cy="${n1(sy(I))}" r="5"/>` : '<g/><g/><g/>'}
    ${box(50, 20, 104, 38)}${tt(102, 35, `I = ${fmt(I, 2)} ${UN.A()}`, 'exs-m')}${tt(102, 50, u('slope = 1 / R', 'наклон = 1 / R', 'көлбеулік = 1 / R'), 'exs-s')}`;
}

//@@SCENE
  ohm: {
    title: L("Ohm's law: I = U / R", 'Закон Ома: I = U / R', 'Ом заңы: I = U / R'),
    intro: L('Voltage pushes the charges, resistance holds them back: the current is I = U / R.', 'Напряжение толкает заряды, сопротивление их тормозит: сила тока I = U / R.', 'Кернеу зарядтарды итереді, кедергі тежейді: ток күші I = U / R.'),
    sliders: [
      { id: 'U', label: L('U, V', 'U, В', 'U, В'), min: 0, max: 12, step: 0.1, value: 6, hidden: (v, st) => st.m === 2 && st.task.type !== 1 },
      { id: 'R', label: L('R, Ω', 'R, Ом', 'R, Ом'), min: 1, max: 20, step: 0.1, value: 4, hidden: (v, st) => st.m === 2 && st.task.type === 1 },
    ],
    buttons: [L('Circuit', 'Схема', 'Схема'), L('Graph I(U)', 'График I(U)', 'I(U) графигі'), TASK],
    state: () => ({ ph: 0, m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      if (i < 2) {
        st.m = i;
        return null;
      }
      st.m = 2;
      st.task = ohmTask();
      return st.task.type === 1 ? { R: st.task.R, U: 1 } : { U: st.task.U, R: 20 };
    },
    live(dt, v, st) {
      st.ph = (st.ph + dt * (v.U / v.R) * 40) % 700;
    },
    draw(v, step, st) {
      const I = v.U / v.R;
      if (st.m === 1)
        return {
          svg: ohmGraph(v, I),
          caption: u(
            `The graph I(U) is a straight line through zero: I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} A. The bigger R, the flatter the line (grey lines: 2, 4 and 8 Ω). Doubling U doubles I.`,
            `График I(U) - прямая через ноль: I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} А. Чем больше R, тем положе прямая (серые - 2, 4 и 8 Ом). Увеличишь U вдвое - вдвое вырастет и I.`,
            `I(U) графигі - нөлден өтетін түзу: I = U / R = ${fmt(v.U, 1)} / ${fmt(v.R, 1)} = ${fmt(I, 2)} А. R неғұрлым үлкен болса, түзу соғұрлым жатық (сұр түзулер - 2, 4 және 8 Ом). U екі есе артса, I да екі есе артады.`,
          ),
        };
      let caption = u(
        `I = U / R = ${fmt(v.U, 1)} V ÷ ${fmt(v.R, 1)} Ω = ${fmt(I, 2)} A. The ammeter (in series) shows the current, the voltmeter (in parallel to R) shows the voltage. Power P = U · I = ${fmt(v.U * I, 1)} W - the resistor heats up.`,
        `I = U / R = ${fmt(v.U, 1)} В ÷ ${fmt(v.R, 1)} Ом = ${fmt(I, 2)} А. Амперметр (последовательно) показывает ток, вольтметр (параллельно R) - напряжение. Мощность P = U · I = ${fmt(v.U * I, 1)} Вт - резистор греется.`,
        `I = U / R = ${fmt(v.U, 1)} В ÷ ${fmt(v.R, 1)} Ом = ${fmt(I, 2)} А. Амперметр (тізбектей) токты, вольтметр (R-ге параллель) кернеуді көрсетеді. Қуат P = U · I = ${fmt(v.U * I, 1)} Вт - резистор қызады.`,
      );
      let extra = '';
      if (st.m === 2) {
        const k = st.task;
        let ok;
        let goal;
        let hint;
        let done;
        if (k.type === 0) {
          ok = near(v.R, k.R, 0.15);
          goal = u(`at U = ${k.U} V, choose R so that the ammeter shows I = ${fmt(k.I, 2)} A.`, `при U = ${k.U} В подбери R, чтобы амперметр показал I = ${fmt(k.I, 2)} А.`, `U = ${k.U} В кезінде амперметр I = ${fmt(k.I, 2)} А көрсететіндей R-ді тап.`);
          hint = I > k.I ? u('The current is too big - increase R.', 'Ток слишком большой - увеличь R.', 'Ток тым үлкен - R-ді арттыр.') : u('The current is too small - decrease R.', 'Ток слишком мал - уменьши R.', 'Ток тым аз - R-ді азайт.');
          done = `R = U / I = ${k.U} / ${fmt(k.I, 2)} = ${k.R} ${UN.Om()}.`;
        } else if (k.type === 1) {
          ok = near(v.U, k.U, 0.15);
          goal = u(`the resistor is R = ${k.R} Ω. What voltage gives I = ${fmt(k.I, 2)} A?`, `резистор R = ${k.R} Ом. Какое напряжение даст ток I = ${fmt(k.I, 2)} А?`, `резистор R = ${k.R} Ом. Қандай кернеу I = ${fmt(k.I, 2)} А ток береді?`);
          hint = I > k.I ? u('Too much current - lower U.', 'Ток больше нужного - уменьши U.', 'Ток артық - U-ды азайт.') : u('Too little current - raise U.', 'Ток меньше нужного - увеличь U.', 'Ток аз - U-ды арттыр.');
          done = `U = I · R = ${fmt(k.I, 2)} · ${k.R} = ${fmt(k.U, 1)} ${UN.V()}.`;
        } else {
          ok = near(v.R, k.R, 0.15);
          goal = u(`at U = ${k.U} V the resistor must give out P = ${fmt(k.P, 1)} W of heat. Choose R.`, `при U = ${k.U} В резистор должен выделять мощность P = ${fmt(k.P, 1)} Вт. Подбери R.`, `U = ${k.U} В кезінде резистор P = ${fmt(k.P, 1)} Вт қуат бөлуі керек. R-ді тап.`);
          hint = v.U * I > k.P ? u(`Now P = ${fmt(v.U * I, 1)} W - too much, increase R (P = U² / R).`, `Сейчас P = ${fmt(v.U * I, 1)} Вт - много, увеличь R (P = U² / R).`, `Қазір P = ${fmt(v.U * I, 1)} Вт - көп, R-ді арттыр (P = U² / R).`) : u(`Now P = ${fmt(v.U * I, 1)} W - too little, decrease R (P = U² / R).`, `Сейчас P = ${fmt(v.U * I, 1)} Вт - мало, уменьши R (P = U² / R).`, `Қазір P = ${fmt(v.U * I, 1)} Вт - аз, R-ді азайт (P = U² / R).`);
          done = `R = U² / P = ${k.U * k.U} / ${fmt(k.P, 1)} = ${k.R} ${UN.Om()}.`;
        }
        caption = taskCap(goal, ok, hint, done);
        extra = taskBadge(ok, 318, 14);
      }
      return { svg: ohmCircuit(v, st, I) + extra, caption };
    },
  },
