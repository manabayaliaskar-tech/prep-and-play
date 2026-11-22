// Нагревание льда: график t(Q), теплота по участкам, состояние вещества, задания (m - масса льда).
// Лёд от −20 °C: c(лёд) = 2100, λ = 334 кДж/кг, c(вода) = 4200, L = 2260 кДж/кг, c(пар) = 2000 Дж/(кг·°C), до 120 °C.
const meltSegs = (m) => [
  { q: m * 2.1 * 20, t0: -20, t1: 0 },
  { q: m * 334, t0: 0, t1: 0 },
  { q: m * 4.2 * 100, t0: 0, t1: 100 },
  { q: m * 2260, t0: 100, t1: 100 },
  { q: m * 2.0 * 20, t0: 100, t1: 120 },
];
const meltState = (m, Q) => {
  const segs = meltSegs(m);
  let left = Q;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (left <= s.q) return { i, t: s.t0 + ((s.t1 - s.t0) * left) / s.q, k: left / s.q };
    left -= s.q;
  }
  return { i: 5, t: 120, k: 1 };
};
const MELT_NAMES = [L('ice warms up', 'лёд нагревается', 'мұз жылиды'), L('ice melts at 0 °C', 'лёд плавится при 0 °C', 'мұз 0 °C-та балқиды'), L('water warms up', 'вода нагревается', 'су жылиды'), L('water boils at 100 °C', 'вода кипит при 100 °C', 'су 100 °C-та қайнайды'), L('steam warms up', 'пар нагревается', 'бу жылиды'), L('all is steam at 120 °C', 'всё - пар при 120 °C', 'бәрі - 120 °C-тағы бу')];
const meltTask = () => {
  const m = pick([0.5, 1, 1.5, 2]);
  const type = ri(0, 2);
  const segs = meltSegs(m);
  const Q = [segs[0].q + segs[1].q, segs[0].q + segs[1].q + segs[2].q, segs.slice(0, 4).reduce((a, s) => a + s.q, 0)][type];
  return { type, m, Q };
};

//@@SCENE
  melting: {
    title: L('Heating ice: melting and boiling', 'Нагревание льда: плавление и кипение', 'Мұзды қыздыру: балқу және қайнау'),
    intro: L('Q = cmΔt warms a substance, Q = λm melts it, Q = Lm boils it away. During melting and boiling the temperature does not change.', 'Q = cmΔt нагревает вещество, Q = λm плавит, Q = Lm превращает в пар. Пока идёт плавление или кипение, температура не меняется.', 'Q = cmΔt затты жылытады, Q = λm балқытады, Q = Lm буға айналдырады. Балқу не қайнау кезінде температура өзгермейді.'),
    sliders: [
      { id: 'Q', label: L('heat Q, kJ', 'теплота Q, кДж', 'жылу Q, кДж'), min: 0, max: 6200, step: 5, value: 300 },
      { id: 'm', label: L('mass of ice m, kg', 'масса льда m, кг', 'мұз массасы m, кг'), min: 0.2, max: 2, step: 0.1, value: 1, hidden: (v, st) => st.m === 2 },
    ],
    buttons: [L('▶ Heat', '▶ Нагреть', '▶ Қыздыру'), L('Graph', 'График', 'График'), L('Heat by stages', 'Теплота по участкам', 'Бөліктер бойынша жылу'), TASK],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i > 0 && (i === st.m + 1 || (i === 3 && st.m === 2)),
    onButton(i, st, v, api) {
      if (i === 0) {
        api.play('Q', { linear: true, dur: 9000 });
        return null;
      }
      if (i < 3) {
        st.m = i - 1;
        return null;
      }
      st.m = 2;
      st.task = meltTask();
      return { m: st.task.m, Q: 0 };
    },
    draw(v, step, st) {
      const segs = meltSegs(v.m);
      const tot = segs.reduce((a, s) => a + s.q, 0);
      const S = meltState(v.m, v.Q);
      const ph = S.i;
      // Картинка состояния: стакан со льдом / водой / паром и расположение частиц.
      const iceLeft = ph === 0 ? 1 : ph === 1 ? 1 - S.k : 0;
      const waterLeft = ph >= 4 ? 0 : ph === 3 ? 1 - S.k : 1 - iceLeft;
      const cubes = Array.from({ length: Math.round(iceLeft * 6) }, (_, i) => `<rect class="exs-panel" x="${248 + (i % 3) * 18}" y="${176 - Math.floor(i / 3) * 16}" width="15" height="13" rx="3" style="stroke:var(--blue)"/>`).join('');
      const wh = waterLeft * 44;
      const steam = ph >= 3 ? Array.from({ length: 5 }, (_, i) => `<path class="ex-stroke exc-m" style="stroke-width:1.5;opacity:.6" d="M${250 + i * 10} 136 q4 -6 0 -12 q-4 -6 0 -12"/>`).join('') : '';
      const bubbles = ph === 3 ? Array.from({ length: 6 }, (_, i) => `<circle class="ex-bubble" style="stroke:var(--blue)" cx="${252 + i * 8}" cy="${186 - ((i * 7) % 20)}" r="2"/>`).join('') : '';
      const beaker = `<path class="ex-beaker" d="M244 140 V192 H302 V140"/><rect class="exs-water" x="246" y="${n1(190 - wh)}" width="54" height="${n1(wh)}"/>${cubes}${bubbles}${steam}<rect x="240" y="194" width="66" height="6" rx="3" class="ex-fill exc-r" style="opacity:${n1(0.3 + Math.min(0.7, v.Q / 3000))}"/>`;
      let svg;
      if (st.m === 1) {
        const names = [`Q₁ = c${u('ice', 'л', 'м')}·m·Δt`, 'Q₂ = λm', `Q₃ = c${u('w', 'в', 'с')}·m·Δt`, 'Q₄ = Lm', `Q₅ = c${u('st', 'п', 'б')}·m·Δt`];
        const done = segs.map((s, i) => (i < ph ? 1 : i === ph ? S.k : 0));
        const mx = Math.max(...segs.map((s) => s.q));
        svg = segs
          .map((s, i) => {
            const y = 22 + i * 38;
            const w = Math.max(3, (s.q / mx) * 200);
            const cls = ['exc-b', 'exc-k', 'exc-o', 'exc-r', 'exc-m'][i];
            return `${tt(8, y, names[i], 'exs-t ex-start')}${tt(226, y, `${fmt(s.q, 0)} ${UN.kJ()}`, 'exs-t ex-end')}<rect class="ex-fill ${cls}" style="opacity:.2" x="8" y="${y + 5}" width="${n1(w)}" height="12" rx="4"/><rect class="ex-fill ${cls}" x="8" y="${y + 5}" width="${n1(w * done[i])}" height="12" rx="4"/>`;
          })
          .join('') + beaker + `${tt(273, 100, `${fmt(S.t, 1)} °C`, 'exs-h')}`;
      } else {
        const sx = (q) => 34 + (q / tot) * 196;
        const sy = (t) => 186 - ((t + 20) / 140) * 160;
        let d = `M${sx(0)} ${sy(-20)}`;
        const cols = ['exc-b', 'exc-k', 'exc-o', 'exc-r', 'exc-m'];
        let acc = 0;
        let parts = '';
        segs.forEach((s, i) => {
          const x0 = sx(acc);
          acc += s.q;
          parts += `<line class="ex-stroke ${cols[i]}" style="stroke-width:${i === ph ? 3.5 : 2}" x1="${n1(x0)}" y1="${n1(sy(s.t0))}" x2="${n1(sx(acc))}" y2="${n1(sy(s.t1))}"/>`;
          d += ` L${n1(sx(acc))} ${n1(sy(s.t1))}`;
        });
        const qs = Math.min(v.Q, tot);
        svg = `<line class="ex-axis" x1="34" y1="${sy(-20)}" x2="234" y2="${sy(-20)}"/><line class="ex-axis" x1="34" y1="${sy(-20)}" x2="34" y2="16"/>
          ${[-20, 0, 100, 120].map((t) => `${ln(34, sy(t), 230, sy(t), 'exc-m ex-faint', 0.6)}${tt(30, sy(t) + 3, fmt(t, 0), 'exs-s ex-end')}`).join('')}${tt(36, 12, 't, °C', 'exs-s ex-start')}${tt(234, 214, `Q, ${UN.kJ()}`, 'exs-s ex-end')}${tt(34, 200, '0', 'exs-s')}${tt(sx(tot), 200, fmt(tot, 0), 'exs-s')}
          ${parts}<circle class="ex-dot" cx="${n1(sx(qs))}" cy="${n1(sy(S.t))}" r="5"/>
          ${tt(sx(segs[0].q) + 2, sy(0) - 6, u('melting', 'плавление', 'балқу'), 'exs-s ex-start tc exc-k')}${tt((sx(tot - segs[4].q - segs[3].q) + sx(tot - segs[4].q)) / 2, sy(100) - 6, u('boiling', 'кипение', 'қайнау'), 'exs-s tc exc-r')}
          ${beaker}${box(240, 6, 76, 100)}${tt(278, 26, `${fmt(S.t, 1)} °C`, 'exs-h')}${tt(278, 44, `${fmt(Math.min(v.Q, tot), 0)} ${UN.kJ()}`, 'exs-t')}${tt(278, 62, `m = ${fmt(v.m, 1)} ${UN.kg()}`, 'exs-s')}${tt(278, 80, `${u('ice', 'лёд', 'мұз')} ${fmt(iceLeft * 100, 0)}%`, 'exs-s tc exc-b')}${tt(278, 96, `${u('steam', 'пар', 'бу')} ${fmt((ph >= 4 ? 1 : ph === 3 ? S.k : 0) * 100, 0)}%`, 'exs-s tc exc-m')}`;
      }
      const nm0 = tx(MELT_NAMES[ph]);
      const nm = nm0[0].toUpperCase() + nm0.slice(1);
      let caption = [
        u(`${nm}: Q₁ = c·m·Δt = 2100 · ${fmt(v.m, 1)} · 20 = ${fmt(segs[0].q * 1000, 0)} J = ${fmt(segs[0].q, 1)} kJ for the whole stage. Ice warms twice as easily as water (c is 2100 vs 4200 J/(kg·°C)).`, `${nm}: Q₁ = c·m·Δt = 2100 · ${fmt(v.m, 1)} · 20 = ${fmt(segs[0].q * 1000, 0)} Дж = ${fmt(segs[0].q, 1)} кДж на весь участок. Лёд нагревается вдвое легче воды (c = 2100 против 4200 Дж/(кг·°C)).`, `${nm}: Q₁ = c·m·Δt = 2100 · ${fmt(v.m, 1)} · 20 = ${fmt(segs[0].q * 1000, 0)} Дж = ${fmt(segs[0].q, 1)} кДж бүкіл бөлікке. Мұз судан екі есе оңай жылиды (c = 2100, ал су 4200 Дж/(кг·°C)).`),
        u(`${nm}: the temperature stays 0 °C, the heat breaks the crystal. Q₂ = λm = 334 kJ/kg · ${fmt(v.m, 1)} = ${fmt(segs[1].q, 0)} kJ; melted ${fmt(S.k * 100, 0)}%.`, `${nm}: температура стоит на 0 °C, тепло разрушает кристалл. Q₂ = λm = 334 кДж/кг · ${fmt(v.m, 1)} = ${fmt(segs[1].q, 0)} кДж; растаяло ${fmt(S.k * 100, 0)}%.`, `${nm}: температура 0 °C-та тұрады, жылу кристалды бұзады. Q₂ = λm = 334 кДж/кг · ${fmt(v.m, 1)} = ${fmt(segs[1].q, 0)} кДж; ${fmt(S.k * 100, 0)}% еріді.`),
        u(`${nm}: Q₃ = c·m·Δt = 4200 · ${fmt(v.m, 1)} · 100 = ${fmt(segs[2].q * 1000, 0)} J = ${fmt(segs[2].q, 0)} kJ from 0 to 100 °C. Now ${fmt(S.t, 1)} °C.`, `${nm}: Q₃ = c·m·Δt = 4200 · ${fmt(v.m, 1)} · 100 = ${fmt(segs[2].q * 1000, 0)} Дж = ${fmt(segs[2].q, 0)} кДж от 0 до 100 °C. Сейчас ${fmt(S.t, 1)} °C.`, `${nm}: Q₃ = c·m·Δt = 4200 · ${fmt(v.m, 1)} · 100 = ${fmt(segs[2].q * 1000, 0)} Дж = ${fmt(segs[2].q, 0)} кДж 0-ден 100 °C-қа дейін. Қазір ${fmt(S.t, 1)} °C.`),
        u(`${nm}: Q₄ = Lm = 2260 kJ/kg · ${fmt(v.m, 1)} = ${fmt(segs[3].q, 0)} kJ - the biggest stage, more than 5 times the heat needed to warm water from 0 to 100 °C. Boiled away ${fmt(S.k * 100, 0)}%.`, `${nm}: Q₄ = Lm = 2260 кДж/кг · ${fmt(v.m, 1)} = ${fmt(segs[3].q, 0)} кДж - самый большой участок, в 5 с лишним раз больше, чем нагрев воды от 0 до 100 °C. Выкипело ${fmt(S.k * 100, 0)}%.`, `${nm}: Q₄ = Lm = 2260 кДж/кг · ${fmt(v.m, 1)} = ${fmt(segs[3].q, 0)} кДж - ең үлкен бөлік, суды 0-ден 100 °C-қа қыздырудан 5 еседен көп. ${fmt(S.k * 100, 0)}% буланды.`),
        u(`${nm}: Q₅ = 2000 · ${fmt(v.m, 1)} · 20 = ${fmt(segs[4].q * 1000, 0)} J = ${fmt(segs[4].q, 0)} kJ. Total from −20 °C ice to 120 °C steam: ${fmt(tot, 0)} kJ.`, `${nm}: Q₅ = 2000 · ${fmt(v.m, 1)} · 20 = ${fmt(segs[4].q * 1000, 0)} Дж = ${fmt(segs[4].q, 0)} кДж. Всего от льда −20 °C до пара 120 °C: ${fmt(tot, 0)} кДж.`, `${nm}: Q₅ = 2000 · ${fmt(v.m, 1)} · 20 = ${fmt(segs[4].q * 1000, 0)} Дж = ${fmt(segs[4].q, 0)} кДж. −20 °C мұздан 120 °C буға дейін барлығы: ${fmt(tot, 0)} кДж.`),
        u(`${nm}: the whole way took ${fmt(tot, 0)} kJ; more heat would warm the steam further.`, `${nm}: на весь путь ушло ${fmt(tot, 0)} кДж; дальше тепло только греет пар.`, `${nm}: бүкіл жолға ${fmt(tot, 0)} кДж кетті; әрі қарай жылу тек буды қыздырады.`),
      ][ph];
      if (st.m === 2) {
        const q = st.task;
        const ok = v.Q >= q.Q - 2 && v.Q <= q.Q + 12;
        const goal = [
          u(`${fmt(q.m, 1)} kg of ice at −20 °C. Give exactly enough heat to melt all of it (water at 0 °C).`, `${fmt(q.m, 1)} кг льда при −20 °C. Дай ровно столько тепла, чтобы весь лёд растаял (вода при 0 °C).`, `−20 °C-тағы ${fmt(q.m, 1)} кг мұз. Барлық мұз еритіндей дәл жылу бер (0 °C-тағы су).`),
          u(`${fmt(q.m, 1)} kg of ice at −20 °C. Bring it exactly to the start of boiling (water at 100 °C).`, `${fmt(q.m, 1)} кг льда при −20 °C. Доведи ровно до начала кипения (вода при 100 °C).`, `−20 °C-тағы ${fmt(q.m, 1)} кг мұз. Дәл қайнаудың басына дейін жеткіз (100 °C-тағы су).`),
          u(`${fmt(q.m, 1)} kg of ice at −20 °C. Turn all of it into steam at 100 °C.`, `${fmt(q.m, 1)} кг льда при −20 °C. Преврати весь лёд в пар при 100 °C.`, `−20 °C-тағы ${fmt(q.m, 1)} кг мұзды толық 100 °C-тағы буға айналдыр.`),
        ][q.type];
        const parts = ['Q₁ + Q₂', 'Q₁ + Q₂ + Q₃', 'Q₁ + Q₂ + Q₃ + Q₄'][q.type];
        caption = taskCap(goal, ok, u(`Now Q = ${fmt(v.Q, 0)} kJ: ${nm0}, ${fmt(S.t, 1)} °C.`, `Сейчас Q = ${fmt(v.Q, 0)} кДж: ${nm0}, ${fmt(S.t, 1)} °C.`, `Қазір Q = ${fmt(v.Q, 0)} кДж: ${nm0}, ${fmt(S.t, 1)} °C.`), `Q = ${parts} = ${fmt(q.Q, 0)} ${UN.kJ()}.`);
        return { svg: svg + taskBadge(ok, 316, 128), caption };
      }
      return { svg, caption };
    },
  },
