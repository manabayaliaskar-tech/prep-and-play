// Ферменты: активность от температуры и pH, модель «ключ - замок», денатурация, задания.
// [название, где работает, оптимум pH, что расщепляет]
const ENZ = [
  [L('amylase', 'амилаза', 'амилаза'), L('saliva', 'слюна', 'сілекей'), 6.8, L('starch → maltose', 'крахмал → мальтоза', 'крахмал → мальтоза')],
  [L('pepsin', 'пепсин', 'пепсин'), L('stomach', 'желудок', 'асқазан'), 2, L('proteins → peptides', 'белки → пептиды', 'ақуыздар → пептидтер')],
  [L('trypsin', 'трипсин', 'трипсин'), L('small intestine', 'тонкий кишечник', 'аш ішек'), 8, L('proteins → peptides', 'белки → пептиды', 'ақуыздар → пептидтер')],
  [L('lipase', 'липаза', 'липаза'), L('small intestine', 'тонкий кишечник', 'аш ішек'), 8, L('fats → glycerol + fatty acids', 'жиры → глицерин + жирные кислоты', 'майлар → глицерин + май қышқылдары')],
];
const enzT = (t) => (t <= 37 ? Math.exp(-(((t - 37) / 17) ** 2)) : t <= 42 ? 1 - (t - 37) * 0.01 : Math.max(0, 0.95 * (1 - (t - 42) / 10)));
const enzP = (ph, opt) => Math.exp(-(((ph - opt) / 1.6) ** 2));

//@@SCENE
  enzyme: {
    title: L('Enzymes: temperature and pH', 'Ферменты: температура и pH', 'Ферменттер: температура және pH'),
    intro: L('An enzyme is a protein catalyst. Its active site fits the substrate like a key fits a lock; heat above ~45 °C or a wrong pH spoils the shape.', 'Фермент - белок-катализатор. Его активный центр подходит к субстрату, как ключ к замку; жара выше ~45 °C или неподходящий pH портят форму.', 'Фермент - ақуыз-катализатор. Оның белсенді орталығы субстратқа кілт құлыпқа сәйкес келгендей келеді; ~45 °C-тан жоғары ыстық не қолайсыз pH пішінді бұзады.'),
    sliders: [
      { id: 't', label: 't, °C', min: 0, max: 80, step: 1, value: 37, hidden: (v, st) => st.m === 2 && st.task.type === 1 },
      { id: 'ph', label: 'pH', min: 1, max: 13, step: 0.1, value: 6.8 },
    ],
    buttons: [L('Graphs', 'Графики', 'Графиктер'), L('Lock and key', 'Ключ и замок', 'Кілт пен құлып'), L('Enzyme ↻', 'Фермент ↻', 'Фермент ↻'), TASK],
    state: () => ({ m: 0, e: 0, ph: 0, task: null }),
    pressed: (i, v, st) => (i < 2 && i === st.m) || (i === 3 && st.m === 2),
    btnHidden: (i, v, st) => i === 2 && st.m === 2,
    onButton(i, st) {
      if (i === 2) {
        st.e = (st.e + 1) % ENZ.length;
        return { ph: ENZ[st.e][2], t: 37 };
      }
      if (i < 2) {
        st.m = i;
        return null;
      }
      st.m = 2;
      st.task = { type: ri(0, 1), e: ri(0, ENZ.length - 1) };
      st.e = st.task.e;
      return st.task.type === 1 ? { t: 37, ph: 7 } : { t: 10, ph: 7 };
    },
    live(dt, v, st) {
      st.ph = (st.ph + dt * (0.15 + 0.6 * enzT(v.t) * enzP(v.ph, ENZ[st.e][2]))) % 1;
    },
    draw(v, step, st) {
      const [nm, where, opt, what] = ENZ[st.e];
      const fT = enzT(v.t);
      const fP = enzP(v.ph, opt);
      const act = fT * fP;
      const den = v.t > 42 && fT < 0.5;
      let svg;
      if (st.m === 1) {
        // Белок-фермент с вырезом (активный центр); при денатурации вырез искажается.
        const warp = den ? clamp((v.t - 45) / 10, 0.4, 1) : clamp(1 - fP, 0, 0.6) * 0.6;
        const k = st.ph;
        const ex = 150;
        const ey = 140;
        const notch = `L${n1(ex - 15)} ${ey - 30} L${n1(ex - 15 + warp * 9)} ${n1(ey - 11 - warp * 10)} L${n1(ex + 15 - warp * 12)} ${n1(ey - 11 - warp * 6)} L${ex + 15} ${ey - 30}`;
        const enzyme = `<path class="ex-fill exc-p" style="opacity:.8" d="M${ex - 70} ${ey + 30} Q${ex - 80} ${ey - 30} ${ex - 40} ${ey - 30} ${notch} L${ex + 40} ${ey - 30} Q${ex + 80} ${ey - 30} ${ex + 70} ${ey + 30} Z"/>${tt(ex, ey + 10, tx(nm), 'exs-m exs-on')}`;
        // Субстрат: подлетает (0-0,4), сидит (0,4-0,6), распадается на два продукта (0,6-1).
        const fits = act > 0.15 && !den;
        let sub2;
        const sx0 = ex;
        if (!fits) {
          const bob = Math.sin(k * Math.PI * 2) * 6;
          sub2 = `<path class="ex-fill exc-o" d="M${sx0 - 14} ${n1(40 + bob)} h28 v18 h-28 Z"/>${tt(sx0 + 22, 54 + bob, '✗', 'exs-m ex-start tc exc-r')}`;
        } else if (k < 0.4) {
          const y = 30 + (k / 0.4) * 80;
          sub2 = `<path class="ex-fill exc-o" d="M${sx0 - 14} ${n1(y)} h28 v18 h-28 Z"/>${tt(sx0 + 20, y + 13, u('substrate', 'субстрат', 'субстрат'), 'exs-s ex-start')}`;
        } else if (k < 0.6) sub2 = `<path class="ex-fill exc-o" d="M${sx0 - 14} 110 h28 v18 h-28 Z"/><circle class="ex-stroke exc-y" style="stroke-width:2" cx="${sx0}" cy="119" r="${n1(18 + ((k - 0.4) / 0.2) * 6)}"/>`;
        else {
          const d = ((k - 0.6) / 0.4) * 60;
          sub2 = `<path class="ex-fill exc-o" d="M${n1(sx0 - 14 - d)} ${n1(110 - d * 1.2)} h13 v18 h-13 Z"/><path class="ex-fill exc-o" d="M${n1(sx0 + 1 + d)} ${n1(110 - d * 1.2)} h13 v18 h-13 Z"/>${tt(sx0, 40, u('products', 'продукты', 'өнімдер'), 'exs-s')}`;
        }
        svg = `${enzyme}${sub2}${tt(ex, 196, `${u('substrate', 'субстрат', 'субстрат')}: ${tx(what)}`, 'exs-s')}${tt(ex, 210, den ? u('denatured: the active site is broken', 'денатурация: активный центр разрушен', 'денатурация: белсенді орталық бұзылған') : fP < 0.4 ? u('wrong pH: the site changes shape', 'не тот pH: центр меняет форму', 'pH сай емес: орталық пішіні өзгереді') : u('the substrate fits the active site', 'субстрат подходит к активному центру', 'субстрат белсенді орталыққа сәйкес'), `exs-s tc ${den || fP < 0.4 ? 'exc-r' : 'exc-g'}`)}
          ${box(240, 20, 76, 54)}${tt(278, 38, `${fmt(act * 100, 0)}%`, 'exs-h')}${tt(278, 52, u('activity', 'активность', 'белсенділік'), 'exs-s')}${tt(278, 66, `${fmt(v.t, 0)} °C · pH ${fmt(v.ph, 1)}`, 'exs-s')}`;
      } else {
        const g1 = (x) => 20 + x * 1.7;
        const g2 = (x) => 182 + (x - 1) * 10.5;
        const gy = (a) => 170 - a * 120;
        svg = `<line class="ex-axis" x1="20" y1="170" x2="160" y2="170"/><line class="ex-axis" x1="20" y1="170" x2="20" y2="40"/><line class="ex-axis" x1="182" y1="170" x2="310" y2="170"/><line class="ex-axis" x1="182" y1="170" x2="182" y2="40"/>
          ${[0, 37, 80].map((x) => tt(g1(x), 184, String(x), 'exs-s')).join('')}${tt(158, 198, 't, °C', 'exs-s ex-end')}${[1, 7, 13].map((x) => tt(g2(x), 184, String(x), 'exs-s')).join('')}${tt(310, 198, 'pH', 'exs-s ex-end')}
          <rect x="${g1(45)}" y="40" width="${n1(g1(80) - g1(45))}" height="130" class="ex-fill exc-r" style="opacity:.08"/>${tt(g1(62), 54, u('denaturation', 'денатурация', 'денатурация'), 'exs-s tc exc-r')}
          <path class="ex-curve" d="${plot((x) => enzT(x) * fP, 0, 80, g1, gy)}"/><path class="ex-curve" d="${plot((x) => fT * enzP(x, opt), 1, 13, g2, gy)}"/>
          <circle class="ex-dot" cx="${n1(g1(v.t))}" cy="${n1(gy(act))}" r="5"/><circle class="ex-dot" cx="${n1(g2(v.ph))}" cy="${n1(gy(act))}" r="5"/>
          ${tt(20, 30, `${u('activity', 'активность', 'белсенділік')}: ${fmt(act * 100, 0)}%`, 'exs-t ex-start')}${tt(310, 30, `${tx(nm)} · ${tx(where)} · ${u('optimum', 'оптимум', 'оңтайлы')} pH ${fmt(opt, 1)}`, 'exs-s ex-end')}`;
      }
      let caption = den
        ? u(`${fmt(v.t, 0)} °C is too hot: the protein ${tx(nm)} denatures - its shape is destroyed and it does not recover on cooling. Activity ${fmt(act * 100, 0)}%.`, `${fmt(v.t, 0)} °C - слишком жарко: белок ${tx(nm)} денатурирует - его форма разрушается и при охлаждении не восстанавливается. Активность ${fmt(act * 100, 0)}%.`, `${fmt(v.t, 0)} °C - тым ыстық: ${tx(nm)} ақуызы денатурацияланады - пішіні бұзылып, суытқанда қалпына келмейді. Белсенділік ${fmt(act * 100, 0)}%.`)
        : u(
            `${tx(nm)} (${tx(where)}): ${tx(what)}. It works best at about 37 °C and pH ${fmt(opt, 1)}. Now activity is ${fmt(act * 100, 0)}%. ${v.t < 20 ? 'In the cold the molecules move slowly, so the reaction is slow - but the enzyme is not destroyed.' : ''}`,
            `${tx(nm)[0].toUpperCase() + tx(nm).slice(1)} (${tx(where)}): ${tx(what)}. Лучше всего работает при 37 °C и pH ${fmt(opt, 1)}. Сейчас активность ${fmt(act * 100, 0)}%. ${v.t < 20 ? 'На холоде молекулы движутся медленно и реакция идёт медленно, но фермент не разрушается.' : ''}`,
            `${tx(nm)[0].toUpperCase() + tx(nm).slice(1)} (${tx(where)}): ${tx(what)}. Ең жақсы 37 °C пен pH ${fmt(opt, 1)} кезінде жұмыс істейді. Қазір белсенділік ${fmt(act * 100, 0)}%. ${v.t < 20 ? 'Суықта молекулалар баяу қозғалады, реакция баяу жүреді, бірақ фермент бұзылмайды.' : ''}`,
          ).trim();
      if (st.m === 2) {
        const q = st.task;
        const ok = q.type === 0 ? act >= 0.95 : near(v.ph, opt, 0.3);
        caption = taskCap(
          q.type === 0 ? u(`find the conditions in which ${tx(nm)} works best (activity at least 95%).`, `подбери условия, при которых ${tx(nm)} работает лучше всего (активность не меньше 95%).`, `${tx(nm)} ең жақсы жұмыс істейтін жағдайды тап (белсенділік кемінде 95%).`) : u(`at 37 °C find the pH at which ${tx(nm)} works best.`, `при 37 °C найди pH, при котором ${tx(nm)} работает лучше всего.`, `37 °C-та ${tx(nm)} ең жақсы жұмыс істейтін pH-ты тап.`),
          ok,
          u(`Now activity ${fmt(act * 100, 0)}%. Hint: where does it work in the body?`, `Сейчас активность ${fmt(act * 100, 0)}%. Подсказка: где он работает в организме?`, `Қазір белсенділік ${fmt(act * 100, 0)}%. Кеңес: ол ағзаның қай жерінде жұмыс істейді?`),
          u(`${tx(where)}: pH ≈ ${fmt(opt, 1)}, body temperature 37 °C.`, `${tx(where)}: pH ≈ ${fmt(opt, 1)}, температура тела 37 °C.`, `${tx(where)}: pH ≈ ${fmt(opt, 1)}, дене температурасы 37 °C.`),
        );
        return { svg: svg + taskBadge(ok, 316, 214), caption };
      }
      return { svg, caption };
    },
  },
