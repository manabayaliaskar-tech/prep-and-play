// ---------- Задачи на совместную работу (новая сцена) ----------

const WORK_T = [[6, 3, 0], [4, 12, 0], [10, 15, 0], [6, 12, 0], [2, 6, 0], [3, 12, 0], [6, 6, 0], [5, 20, 0], [3, 6, 1], [4, 12, 1], [2, 3, 1], [6, 12, 1]];

function workTask(st) {
  let i;
  do i = rnd(0, WORK_T.length - 1);
  while (st.task && st.task.i === i);
  const [t1, t2, drain] = WORK_T[i];
  const T0 = drain ? (t1 * t2) / (t2 - t1) : (t1 * t2) / (t1 + t2);
  st.task = { i, t1, t2, drain, T0, done: false };
  return { t1, t2, t: 0 };
}

const work = modes({
  title: L('Work problems: two pipes', 'Задачи на работу: две трубы', 'Жұмысқа берілген есептер: екі құбыр'),
  intro: L('The whole job is 1. If a pipe fills the pool in t hours, it does 1/t of it per hour. Working together, the rates add.', 'Вся работа - это 1. Если труба наполняет бассейн за t часов, за час она делает 1/t. При совместной работе производительности складываются.', 'Барлық жұмыс - 1. Құбыр бассейнді t сағатта толтырса, сағатына 1/t бөлігін орындайды. Бірге жұмыс істегенде өнімділіктер қосылады.'),
  sliders: [
    { id: 't1', label: L('pipe A alone, h', 'труба A одна, ч', 'A құбыры жалғыз, сағ'), min: 1, max: 12, value: 6, hidden: (v, st) => st.m === 2 },
    { id: 't2', label: L('pipe B alone, h', 'труба B одна, ч', 'B құбыры жалғыз, сағ'), min: 1, max: 12, value: 3, hidden: (v, st) => st.m === 2 },
    { id: 't', label: L('time, h', 'время, ч', 'уақыт, сағ'), min: 0, max: 12, step: 0.1, value: 0 },
  ],
  tabs: [L('Together', 'Вместе', 'Бірге'), L('Fill and drain', 'Наполнение и слив', 'Толтыру және ағызу'), TASK],
  acts: [{ label: PLAY, only: [0, 1] }, { label: MORE }],
  onTab(m, st, v, again) {
    if (m === 2 && (again || !st.task || st.task.done)) return workTask(st);
    return m === 1 ? { t: 0, t1: 3, t2: 6, $dur: 1 } : { t: 0, $dur: 1 };
  },
  onAct(j, st, v, api) {
    if (j === 0) {
      api.play('t', { dur: 6000, linear: true });
      return null;
    }
    if (st.m === 2) return workTask(st);
    return st.m === 1 ? pick([{ t1: 3, t2: 6 }, { t1: 4, t2: 12 }, { t1: 2, t2: 3 }, { t1: 6, t2: 12 }]) : pick([{ t1: 6, t2: 3 }, { t1: 4, t2: 4 }, { t1: 10, t2: 15 }, { t1: 2, t2: 6 }, { t1: 3, t2: 12 }]);
  },
  draw(v, step, st) {
    const tk = st.m === 2 ? (st.task ?? (workTask(st), st.task)) : null;
    const t1 = tk ? tk.t1 : Math.round(v.t1);
    const t2 = tk ? tk.t2 : Math.round(v.t2);
    const drain = tk ? tk.drain : st.m === 1;
    const t = v.t;
    const r = 1 / t1 + (drain ? -1 / t2 : 1 / t2);
    const T0 = r > 1e-9 ? 1 / r : Infinity;
    const lvl = clamp(r * t, 0, 1);
    const hU = ui.h();
    // бассейн
    const X0 = 22;
    const Y0 = 78;
    const Wp = 120;
    const Hp = 110;
    const wy = Y0 + Hp * (1 - lvl);
    let g = `${box(X0, wy, Wp, Y0 + Hp - wy, 'exc-b', 2, 0.45)}<path class="ex-stroke exc-m" style="stroke-width:2.5;fill:none" d="M${X0} ${Y0 - 6} V${Y0 + Hp} H${X0 + Wp} V${Y0 - 6}"/>`;
    for (let k = 1; k < 4; k++) g += ln(X0 + Wp, Y0 + (Hp * k) / 4, X0 + Wp + 5, Y0 + (Hp * k) / 4, 'exc-m', 1) + T(X0 + Wp + 7, Y0 + (Hp * k) / 4 + 3, `${4 - k}/4`, 'm9 exm-mut ex-start');
    // трубы
    const flow = t > 0 && lvl < 1;
    g += `${box(X0 + 10, 40, 40, 10, 'exc-o', 3)}${box(X0 + 44, 40, 8, 26, 'exc-o', 2)}${flow ? box(X0 + 45, 66, 6, wy - 66, 'exc-o', 2, 0.5) : ''}${T(X0 + 30, 34, `A: 1/${t1}`, 'm10 tc exc-o')}`;
    if (drain) g += `${box(X0 + Wp - 12, Y0 + Hp - 2, 8, 16, 'exc-r', 2)}${box(X0 + Wp - 12, Y0 + Hp + 10, 36, 8, 'exc-r', 3)}${T(X0 + Wp + 8, Y0 + Hp + 30, `B: −1/${t2}`, 'm10 tc exc-r')}`;
    else g += `${box(X0 + 70, 40, 40, 10, 'exc-g', 3)}${box(X0 + 70, 40, 8, 26, 'exc-g', 2)}${flow ? box(X0 + 71, 66, 6, wy - 66, 'exc-g', 2, 0.5) : ''}${T(X0 + 90, 34, `B: 1/${t2}`, 'm10 tc exc-g')}`;
    g += T(X0 + Wp / 2, Y0 + Hp - 8, `${fmt(lvl * 100, 0)}%`, 'm12 h');
    // график
    const Tm = Number.isFinite(T0) ? Math.max(Math.ceil(T0 * 1.6), Math.ceil(t), 2) : 12;
    const gx = (x) => 178 + (x / Tm) * 132;
    const gy = (y) => 190 - y * 120;
    g += `${ln(178, 190, 312, 190, 'exc-m', 1.2)}${ln(178, 60, 178, 190, 'exc-m', 1.2)}${ln(178, gy(1), 312, gy(1), 'exc-m ex-dash', 1)}${T(174, gy(1) + 3, '1', 'm9 exm-mut ex-end')}${T(312, 204, `t, ${hU}`, 'm9 exm-mut ex-end')}`;
    const stp = Tm > 12 ? 4 : Tm > 6 ? 2 : 1;
    for (let k = stp; k < Tm; k += stp) g += ln(gx(k), 188, gx(k), 192, 'exc-m', 1) + T(gx(k), 202, k, 'm9 exm-mut');
    const lineR = (rate, cls, w) => pth(`M${gx(0)} ${gy(0)} L${n1(gx(Math.min(Tm, rate > 0 ? 1 / rate : Tm)))} ${n1(gy(clamp(rate * Math.min(Tm, rate > 0 ? 1 / rate : Tm), 0, 1)))}`, cls, w);
    g += lineR(1 / t1, 'exc-o ex-dash', 1.5) + (drain ? '' : lineR(1 / t2, 'exc-g ex-dash', 1.5)) + lineR(r, 'exc-b', 3);
    g += ln(gx(Math.min(t, Tm)), 60, gx(Math.min(t, Tm)), 190, 'exc-p', 1.2) + dot(gx(Math.min(t, Tm)), gy(lvl), 4, 'exc-b');
    if (Number.isFinite(T0) && T0 <= Tm) g += dot(gx(T0), gy(1), 5, 'exc-p') + T(gx(T0), gy(1) - 8, `${nice(T0, 12)} ${hU}`, 'm10 tc exc-p h');
    const rateS = drain ? `1/${t1} − 1/${t2} = ${frs(t2 - t1, t1 * t2)}` : `1/${t1} + 1/${t2} = ${frs(t1 + t2, t1 * t2)}`;
    g += T(8, 16, rateS, 'm11 ex-start');
    if (tk) {
      const ok = check(st, near(t, tk.T0, 0.051));
      return {
        svg: `${g}${badge('t = ?', ok)}`,
        caption: taskCap(
          st,
          ok,
          tk.drain
            ? L(`Pipe A fills the pool in ${t1} h, pipe B drains it in ${t2} h. Both are open: when is the pool full? Set the time.`, `Труба A наполняет бассейн за ${t1} ч, труба B сливает его за ${t2} ч. Открыты обе: когда бассейн наполнится? Установи время.`, `A құбыры бассейнді ${t1} сағатта толтырады, B құбыры ${t2} сағатта ағызады. Екеуі де ашық: бассейн қашан толады? Уақытты орнат.`)
            : L(`Pipe A fills the pool in ${t1} h, pipe B in ${t2} h. How long together? Set the time.`, `Труба A наполняет бассейн за ${t1} ч, труба B - за ${t2} ч. За сколько часов вместе? Установи время.`, `A құбыры бассейнді ${t1} сағатта, B - ${t2} сағатта толтырады. Бірге неше сағатта? Уақытты орнат.`),
          L(`Now ${fmt(lvl * 100, 0)}% is filled. Hint: rate together = ${rateS} of the pool per hour; time = 1 : rate.`, `Сейчас заполнено ${fmt(lvl * 100, 0)}%. Подсказка: вместе за час - ${rateS} бассейна; время = 1 : производительность.`, `Қазір ${fmt(lvl * 100, 0)}% толды. Кеңес: бірге сағатына - бассейннің ${rateS} бөлігі; уақыт = 1 : өнімділік.`),
        ),
      };
    }
    if (drain && r <= 1e-9)
      return {
        svg: g,
        caption: L(`The drain is not slower than the filling (1/${t2} ≥ 1/${t1}): the pool will never fill.`, `Слив не медленнее наполнения (1/${t2} ≥ 1/${t1}): бассейн никогда не наполнится.`, `Ағызу толтырудан баяу емес (1/${t2} ≥ 1/${t1}): бассейн ешқашан толмайды.`),
      };
    return {
      svg: g,
      caption: J(
        drain
          ? L(`Per hour A adds 1/${t1}, B takes away 1/${t2}: together ${rateS} of the pool. It fills in 1 : ${frs(t2 - t1, t1 * t2)} = ${nice(T0, 12)} h.`, `За час A наливает 1/${t1}, B сливает 1/${t2}: вместе ${rateS} бассейна. Наполнится за 1 : ${frs(t2 - t1, t1 * t2)} = ${nice(T0, 12)} ч.`, `Сағатына A 1/${t1} құяды, B 1/${t2} ағызады: бірге бассейннің ${rateS} бөлігі. 1 : ${frs(t2 - t1, t1 * t2)} = ${nice(T0, 12)} сағатта толады.`)
          : L(`Per hour A does 1/${t1}, B does 1/${t2}: together ${rateS} of the pool. Time together = 1 : ${frs(t1 + t2, t1 * t2)} = ${nice(T0, 12)} h - less than each pipe alone.`, `За час A делает 1/${t1}, B - 1/${t2}: вместе ${rateS} бассейна. Время вместе = 1 : ${frs(t1 + t2, t1 * t2)} = ${nice(T0, 12)} ч - меньше, чем у каждой трубы отдельно.`, `Сағатына A 1/${t1}, B 1/${t2} орындайды: бірге бассейннің ${rateS} бөлігі. Бірге уақыт = 1 : ${frs(t1 + t2, t1 * t2)} = ${nice(T0, 12)} сағ - әр құбырдың жалғыз уақытынан аз.`),
        L(`After ${fmt(t, 1)} h: ${fmt(lvl * 100, 0)}%.`, `Через ${fmt(t, 1)} ч: ${fmt(lvl * 100, 0)}%.`, `${fmt(t, 1)} сағаттан кейін: ${fmt(lvl * 100, 0)}%.`),
      ),
    };
  },
});