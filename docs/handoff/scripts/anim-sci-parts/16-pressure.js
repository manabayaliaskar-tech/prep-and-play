// Давление жидкости p = ρgh: глубина, сосуды разной формы, разные жидкости, задания.
const presTask = () => {
  if (Math.random() < 0.6) {
    const [r] = pick([LIQUIDS[1], LIQUIDS[2], LIQUIDS[3]]);
    const h = pick([5, 10, 15, 20, 30, 40, 50]);
    return { type: 0, r, h, p: r * G * h };
  }
  const [r] = pick([LIQUIDS[0], LIQUIDS[1], LIQUIDS[3]]);
  return { type: 1, r, h: 10, p: r * G * 10 };
};

//@@SCENE
  pressure: {
    title: L('Pressure in a liquid: p = ρgh', 'Давление в жидкости: p = ρgh', 'Сұйықтағы қысым: p = ρgh'),
    intro: L('The deeper, the bigger the pressure. It acts equally in all directions and does not depend on the shape of the vessel.', 'Чем глубже, тем больше давление. Оно действует во все стороны одинаково и не зависит от формы сосуда.', 'Неғұрлым терең болса, қысым соғұрлым көп. Ол барлық бағытта бірдей әсер етеді және ыдыстың пішініне тәуелді емес.'),
    sliders: [
      { id: 'h', label: L('depth h, m', 'глубина h, м', 'тереңдік h, м'), min: 0, max: 100, step: 0.5, value: 10, hidden: (v, st) => st.m === 2 && st.task.type === 1 },
      { id: 'r', label: L('density ρ, kg/m³', 'плотность ρ, кг/м³', 'тығыздық ρ, кг/м³'), min: 700, max: 13600, step: 10, value: 1000, hidden: (v, st) => st.m === 2 && st.task.type === 0 },
    ],
    buttons: [L('Depth', 'Глубина', 'Тереңдік'), L('Vessel shapes', 'Форма сосуда', 'Ыдыс пішіні'), L('Liquid ↻', 'Жидкость ↻', 'Сұйық ↻'), TASK],
    state: () => ({ m: 0, l: 2, task: null }),
    pressed: (i, v, st) => i === st.m || (i === 3 && st.m === 2),
    btnHidden: (i, v, st) => i === 2 && st.m === 2,
    onButton(i, st) {
      if (i === 2) {
        st.l = (st.l + 1) % LIQUIDS.length;
        return { r: LIQUIDS[st.l][0] };
      }
      if (i < 2) {
        st.m = i;
        return null;
      }
      st.m = 2;
      st.task = presTask();
      return st.task.type === 0 ? { r: st.task.r, h: 0 } : { h: 10, r: 13600 };
    },
    draw(v, step, st) {
      const p = v.r * G * v.h;
      const pa = 101.3;
      const tot = pa + p / 1000;
      const lname = named(LIQUIDS, v.r) || `ρ = ${fmt(v.r, 0)}`;
      const alpha = n1(0.18 + Math.min(0.5, v.r / 25000));
      let svg;
      if (st.m === 1) {
        const lv = 60;
        const bottom = 188;
        const shapes = [
          'M20 50 V188 H84 V50',
          'M110 50 L130 188 H170 L190 50',
          'M214 50 L234 120 V188 H282 V120 L302 50',
        ];
        const fill = [
          `M21 ${lv} V187 H83 V${lv} Z`,
          `M${n1(110 + (20 * (lv - 50)) / 138)} ${lv} L131 187 H169 L${n1(190 - (20 * (lv - 50)) / 138)} ${lv} Z`,
          `M${n1(214 + (20 * (lv - 50)) / 70)} ${lv} L235 120 V187 H281 V120 L${n1(302 - (20 * (lv - 50)) / 70)} ${lv} Z`,
        ];
        svg = `${fill.map((d) => `<path class="ex-fill exc-b" style="opacity:${alpha}" d="${d}"/>`).join('')}${shapes.map((d) => `<path class="ex-beaker" d="${d}"/>`).join('')}
          ${ln(6, lv, 316, lv, 'exc-b ex-dash', 1)}${[52, 150, 258].map((x) => `${arrow(x, 170, x, 186, 'exc-r', 2.5)}${tt(x, 204, `${fmt(p / 1000, 1)} ${UN.kPa()}`, 'exs-t tc exc-r')}`).join('')}
          ${ln(310, lv, 310, bottom, 'exc-p', 1.2)}${tt(306, 130, `h = ${fmt(v.h, 1)} ${UN.m()}`, 'exs-s ex-end tc exc-p')}${tt(160, 30, `${lname}: p = ρgh = ${fmt(p / 1000, 1)} ${UN.kPa()} ${u('everywhere', 'везде', 'барлығында')}`, 'exs-t')}`;
      } else {
        // Глубина в масштабе до 100 м.
        const y0 = 34;
        const sy = (h) => y0 + h * 1.7;
        const y = sy(v.h);
        let marks = '';
        for (let h = 10; h <= 100; h += 10) marks += `${ln(36, sy(h), 200, sy(h), 'exc-b ex-faint', 0.6)}${h % 20 ? '' : tt(14, sy(h) + 3, `${h}`, 'exs-s ex-start')}`;
        const aw = Math.min(26, 10 + p / 40000);
        const arrows4 = [0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2;
          return arrow(150 + (12 + aw) * Math.cos(a), y + (12 + aw) * Math.sin(a), 150 + 11 * Math.cos(a), y + 11 * Math.sin(a), 'exc-r', 2);
        }).join('');
        svg = `<rect x="10" y="${y0}" width="${190}" height="${H - y0}" class="ex-fill exc-b" style="opacity:${alpha}"/>${ln(10, y0, 200, y0, 'exc-b', 2)}${tt(40, y0 - 6, u('surface, p₀ = 101.3 kPa', 'поверхность, p₀ = 101,3 кПа', 'бет, p₀ = 101,3 кПа'), 'exs-s ex-start')}
          ${marks}${tt(12, 216, UN.m(), 'exs-s ex-start')}${ln(150, y0, 150, y, 'exc-p ex-dash', 1)}${tt(144, (y0 + y) / 2 + 4, v.h > 4 ? `h = ${fmt(v.h, 1)} ${UN.m()}` : '', 'exs-s ex-end tc exc-p')}
          <circle class="ex-fill exc-o" cx="150" cy="${n1(y)}" r="9"/>${arrows4}
          ${box(206, 34, 110, 110)}${tt(261, 52, `${lname}`, 'exs-t')}${tt(212, 72, `ρgh = ${fmt(p / 1000, 1)} ${UN.kPa()}`, 'exs-t ex-start tc exc-r')}${tt(212, 90, `+ p₀ = ${fmt(pa, 1)} ${UN.kPa()}`, 'exs-s ex-start')}${tt(212, 110, `p = ${fmt(tot, 1)} ${UN.kPa()}`, 'exs-t ex-start')}${tt(212, 128, `≈ ${fmt(tot / pa, 2)} ${u('atm', 'атм', 'атм')}`, 'exs-s ex-start')}`;
      }
      let caption =
        st.m === 1
          ? u(`The vessels have different shapes and hold different amounts of ${lname}, but the level h is the same - so the pressure on the bottom is the same: p = ρgh = ${fmt(p / 1000, 1)} kPa (the hydrostatic paradox).`, `В сосудах разной формы налито разное количество жидкости (${lname}), но уровень h одинаковый - значит и давление на дно одинаковое: p = ρgh = ${fmt(p / 1000, 1)} кПа (гидростатический парадокс).`, `Әр пішінді ыдыстарға әртүрлі мөлшерде сұйық (${lname}) құйылған, бірақ деңгейі h бірдей - демек түбіне қысым да бірдей: p = ρgh = ${fmt(p / 1000, 1)} кПа (гидростатикалық парадокс).`)
          : u(`p = ρgh = ${fmt(v.r, 0)} · 9.8 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} kPa, plus the atmosphere on top: ${fmt(tot, 1)} kPa in total. In water every 10 m add about 1 atmosphere; the pressure pushes equally in all directions.`, `p = ρgh = ${fmt(v.r, 0)} · 9,8 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} кПа, и сверху давит атмосфера: всего ${fmt(tot, 1)} кПа. В воде каждые 10 м добавляют примерно 1 атмосферу; давление действует во все стороны одинаково.`, `p = ρgh = ${fmt(v.r, 0)} · 9,8 · ${fmt(v.h, 1)} = ${fmt(p / 1000, 1)} кПа, үстінен атмосфера басады: барлығы ${fmt(tot, 1)} кПа. Суда әр 10 м шамамен 1 атмосфера қосады; қысым барлық бағытта бірдей әсер етеді.`);
      if (st.m === 2) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        const qn = named(LIQUIDS, q.r);
        if (q.type === 0) {
          ok = near(v.h, q.h, 0.3);
          goal = u(`at what depth in ${qn} is the liquid pressure (without the atmosphere) ${fmt(q.p / 1000, 1)} kPa?`, `на какой глубине (${qn}) давление жидкости (без атмосферы) равно ${fmt(q.p / 1000, 1)} кПа?`, `қандай тереңдікте (${qn}) сұйық қысымы (атмосферасыз) ${fmt(q.p / 1000, 1)} кПа болады?`);
          done = `h = p / (ρg) = ${fmt(q.p, 0)} / (${q.r} · 9,8) = ${q.h} ${UN.m()}.`;
        } else {
          ok = near(v.r, q.r, 10);
          goal = u(`at a depth of 10 m the pressure is ${fmt(q.p / 1000, 1)} kPa. Which liquid is it? Choose ρ.`, `на глубине 10 м давление ${fmt(q.p / 1000, 1)} кПа. Что это за жидкость? Подбери ρ.`, `10 м тереңдікте қысым ${fmt(q.p / 1000, 1)} кПа. Бұл қандай сұйық? ρ-ны тап.`);
          done = `ρ = p / (gh) = ${fmt(q.p, 0)} / 98 = ${q.r} ${u('kg/m³', 'кг/м³', 'кг/м³')} - ${qn}.`;
        }
        caption = taskCap(goal, ok, u(`Now ρgh = ${fmt(p / 1000, 1)} kPa.`, `Сейчас ρgh = ${fmt(p / 1000, 1)} кПа.`, `Қазір ρgh = ${fmt(p / 1000, 1)} кПа.`), done);
        return { svg: svg + taskBadge(ok, 316, 162), caption };
      }
      return { svg, caption };
    },
  },
