// Архимедова сила: плавание тел, динамометр в жидкости, разные тела и жидкости, задания.
const BODIES = [
  [240, L('cork', 'пробка', 'тоз')],
  [500, L('pine', 'сосна', 'қарағай')],
  [900, L('ice', 'лёд', 'мұз')],
  [1800, L('brick', 'кирпич', 'кірпіш')],
  [2700, L('aluminium', 'алюминий', 'алюминий')],
  [7800, L('iron', 'железо', 'темір')],
];
const LIQUIDS = [
  [710, L('petrol', 'бензин', 'бензин')],
  [800, L('kerosene', 'керосин', 'керосин')],
  [1000, L('water', 'вода', 'су')],
  [1030, L('sea water', 'морская вода', 'теңіз суы')],
  [13600, L('mercury', 'ртуть', 'сынап')],
];
const named = (list, r) => {
  const it = list.find(([k]) => Math.abs(k - r) < 6);
  return it ? tx(it[1]) : '';
};
const buoyTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const [rb, frac] = pick([[600, 0.75], [400, 0.5], [500, 0.5], [900, 0.9], [720, 0.9]]);
    return { type, rb, frac, rl: rb / frac, V: 500 };
  }
  if (type === 1) return { type, rl: 1000, frac: pick([0.25, 0.4, 0.6, 0.8]), V: 500 };
  return { type, rb: 7800, rl: 1000, F: pick([1.96, 2.94, 4.9, 7.84]) };
};

//@@SCENE
  buoyancy: {
    title: L("Archimedes' force: float or sink", 'Сила Архимеда: утонет или всплывёт', 'Архимед күші: батады ма, қалқиды ма'),
    intro: L('A liquid pushes a body up with Fₐ = ρ(liquid)·g·V(submerged). It floats if it is less dense than the liquid.', 'Жидкость выталкивает тело силой Fₐ = ρж·g·Vпогр. Тело плавает, если его плотность меньше плотности жидкости.', 'Сұйық денені Fₐ = ρс·g·Vбат күшімен ығыстырады. Дененің тығыздығы сұйықтан аз болса, ол қалқиды.'),
    sliders: [
      { id: 'rb', label: L('body density, kg/m³', 'плотность тела, кг/м³', 'дене тығыздығы, кг/м³'), min: 100, max: 8000, step: 10, value: 500, hidden: (v, st) => st.m === 1 && st.task.type !== 1 },
      { id: 'rl', label: L('liquid density, kg/m³', 'плотность жидкости, кг/м³', 'сұйық тығыздығы, кг/м³'), min: 700, max: 13600, step: 10, value: 1000, hidden: (v, st) => st.m === 1 && st.task.type !== 0 },
      { id: 'V', label: L('volume V, cm³', 'объём V, см³', 'көлем V, см³'), min: 100, max: 1000, step: 10, value: 500, hidden: (v, st) => st.m === 1 && st.task.type !== 2 },
    ],
    buttons: [L('Body ↻', 'Тело ↻', 'Дене ↻'), L('Liquid ↻', 'Жидкость ↻', 'Сұйық ↻'), L('Spring scale', 'Динамометр', 'Динамометр'), TASK, FREE],
    state: () => ({ b: 1, l: 2, dyn: false, m: 0, task: null }),
    pressed: (i, v, st) => (i === 2 && st.dyn) || (i === 3 && st.m === 1),
    btnHidden: (i, v, st) => (i === 4 ? st.m !== 1 : st.m === 1 && i < 3),
    onButton(i, st) {
      if (i === 0) {
        st.b = (st.b + 1) % BODIES.length;
        return { rb: BODIES[st.b][0] };
      }
      if (i === 1) {
        st.l = (st.l + 1) % LIQUIDS.length;
        return { rl: LIQUIDS[st.l][0] };
      }
      if (i === 2) st.dyn = !st.dyn;
      else if (i === 4) st.m = 0;
      else {
        st.m = 1;
        st.task = buoyTask();
        const q = st.task;
        st.dyn = q.type === 2;
        return q.type === 0 ? { rb: q.rb, rl: 1300, V: q.V } : q.type === 1 ? { rl: 1000, rb: 100, V: q.V } : { rb: 7800, rl: 1000, V: 100 };
      }
      return null;
    },
    draw(v, step, st) {
      const Vm = v.V / 1e6;
      const mg = v.rb * Vm * G;
      const floats = v.rb < v.rl;
      const frac = floats ? v.rb / v.rl : 1;
      const FA = v.rl * G * Vm * frac;
      const FAfull = v.rl * G * Vm;
      const side = 30 + Math.cbrt(v.V) * 3;
      const surf = 92;
      const tank = [14, 176];
      // Уровень жидкости поднимается на объём погружённой части.
      const rise = (Vm * frac * 1e6) / 1000 * 3;
      const lvl = surf - rise;
            let top;
      if (st.dyn) top = Math.max(lvl + 6, 120 - side / 2);
      else top = floats ? lvl - side * (1 - frac) : 196 - side;
      const cx = 102;
      const bodyR = `<rect class="ex-fill exc-o" style="opacity:.9" x="${n1(cx - side / 2)}" y="${n1(top)}" width="${n1(side)}" height="${n1(side)}" rx="4"/>`;
      const k = 40 / Math.max(mg, FAfull, 0.5);
      const forces = `<circle class="ex-fill" style="color:var(--ink)" cx="${cx}" cy="${n1(top + side / 2)}" r="2.5"/>${varrow(cx - 5, top + side / 2, cx - 5, top + side / 2 + mg * k + 2, 'exc-r', 'mg', 2.5, -14, 0)}${varrow(cx + 5, top + side / 2, cx + 5, top + side / 2 - FA * k - 2, 'exc-g', 'Fₐ', 2.5, 13, 8)}`;
      let dyn = '<g/>';
      let reading = 0;
      if (st.dyn) {
        reading = Math.max(0, mg - FAfull);
        dyn = `${ln(cx, 6, cx, 18, 'exc-m', 2)}<rect class="exs-panel" x="${cx - 12}" y="18" width="24" height="44" rx="5"/>${ln(cx, 62, cx, top, 'exc-m', 1.5)}${tt(cx - 18, 34, `${fmt(reading, 2)} ${UN.N()}`, 'exs-t ex-end tc exc-p')}${tt(cx - 18, 48, `${u('air', 'возд.', 'ауа')}: ${fmt(mg, 2)}`, 'exs-s ex-end')}<rect class="ex-fill exc-p" x="${cx - 4}" y="22" width="8" height="${n1(4 + 34 * clamp(reading / Math.max(mg, 0.01), 0, 1))}" rx="2"/>`;
      }
      const bn = named(BODIES, v.rb);
      const lnm = named(LIQUIDS, v.rl);
      const info = `${box(196, 4, 120, 120)}${tt(204, 18, `${u('ρb', 'ρт', 'ρд')} = ${fmt(v.rb, 0)}`, 'exs-t ex-start tc exc-o')}${tt(204, 30, bn || u('body', 'тело', 'дене'), 'exs-s ex-start')}${tt(204, 46, `${u('ρl', 'ρж', 'ρс')} = ${fmt(v.rl, 0)}`, 'exs-t ex-start tc exc-b')}${tt(204, 58, lnm || u('liquid', 'жидкость', 'сұйық'), 'exs-s ex-start')}
        ${tt(204, 76, `mg = ${fmt(mg, 2)} ${UN.N()}`, 'exs-t ex-start tc exc-r')}${tt(204, 92, `Fₐ = ${fmt(FA, 2)} ${UN.N()}`, 'exs-t ex-start tc exc-g')}${tt(204, 110, st.dyn ? `P = ${fmt(reading, 2)} ${UN.N()}` : floats ? `${u('under', 'под', 'астында')}: ${fmt(frac * 100, 0)}%` : u('sinks', 'тонет', 'батады'), `exs-t ex-start tc ${floats ? 'exc-g' : 'exc-r'}`)}`;
      const svg = `<rect class="exs-water" x="${tank[0]}" y="${n1(lvl)}" width="${tank[1]}" height="${n1(200 - lvl)}" style="opacity:${n1(0.6 + Math.min(0.4, v.rl / 20000))}"/>${ln(tank[0], lvl, tank[0] + tank[1], lvl, 'exc-b', 1.5)}${ln(tank[0], surf, tank[0] + 12, surf, 'exc-m ex-dash', 1)}<path class="ex-beaker" d="M${tank[0]} 40 V200 H${tank[0] + tank[1]} V40"/>
        ${dyn}${bodyR}${forces}${info}${tt(tank[0] + 4, 214, `V = ${fmt(v.V, 0)} ${u('cm³', 'см³', 'см³')}`, 'exs-s ex-start')}`;
      let caption = st.dyn && floats
        ? u(`In air the scale shows mg = ${fmt(mg, 2)} N. In the liquid Fₐ could reach ${fmt(FAfull, 2)} N - more than the weight, so the body floats up and the scale shows 0.`, `В воздухе динамометр показывает mg = ${fmt(mg, 2)} Н. В жидкости Fₐ могла бы достичь ${fmt(FAfull, 2)} Н - больше веса, поэтому тело всплывает и динамометр показывает 0.`, `Ауада динамометр mg = ${fmt(mg, 2)} Н көрсетеді. Сұйықта Fₐ ${fmt(FAfull, 2)} Н-ға жетер еді - салмақтан көп, сондықтан дене қалқып шығады, динамометр 0 көрсетеді.`)
        : st.dyn
        ? u(
            `In air the scale shows mg = ${fmt(mg, 2)} N. Fully in the liquid Fₐ = ρgV = ${fmt(v.rl, 0)} · 9.8 · ${fmt(Vm, 6)} = ${fmt(FAfull, 2)} N, so it shows ${fmt(mg, 2)} − ${fmt(FAfull, 2)} = ${fmt(reading, 2)} N.`,
            `В воздухе динамометр показывает mg = ${fmt(mg, 2)} Н. Целиком в жидкости Fₐ = ρgV = ${fmt(v.rl, 0)} · 9,8 · ${fmt(Vm, 6)} = ${fmt(FAfull, 2)} Н, поэтому он показывает ${fmt(mg, 2)} − ${fmt(FAfull, 2)} = ${fmt(reading, 2)} Н.`,
            `Ауада динамометр mg = ${fmt(mg, 2)} Н көрсетеді. Толық сұйықта Fₐ = ρgV = ${fmt(v.rl, 0)} · 9,8 · ${fmt(Vm, 6)} = ${fmt(FAfull, 2)} Н, сондықтан ${fmt(mg, 2)} − ${fmt(FAfull, 2)} = ${fmt(reading, 2)} Н көрсетеді.`,
          )
        : floats
          ? u(`ρ(body) < ρ(liquid): the body floats. It sinks until Fₐ = mg = ${fmt(mg, 2)} N; then the part under the surface is ρт/ρж = ${fmt(v.rb, 0)}/${fmt(v.rl, 0)} = ${fmt(frac * 100, 0)}% of its volume.`, `ρт < ρж: тело плавает. Оно погружается, пока Fₐ не станет равна mg = ${fmt(mg, 2)} Н; под водой тогда ρт/ρж = ${fmt(v.rb, 0)}/${fmt(v.rl, 0)} = ${fmt(frac * 100, 0)}% объёма.`, `ρд < ρс: дене қалқиды. Ол Fₐ = mg = ${fmt(mg, 2)} Н болғанша батады; сонда су астында көлемнің ρд/ρс = ${fmt(v.rb, 0)}/${fmt(v.rl, 0)} = ${fmt(frac * 100, 0)}%-ы болады.`)
          : u(`ρ(body) > ρ(liquid): even fully under the surface Fₐ = ${fmt(FA, 2)} N < mg = ${fmt(mg, 2)} N - the body sinks. In mercury (13600) even iron floats!`, `ρт > ρж: даже целиком в жидкости Fₐ = ${fmt(FA, 2)} Н < mg = ${fmt(mg, 2)} Н - тело тонет. В ртути (13600) плавает даже железо!`, `ρд > ρс: толық батса да Fₐ = ${fmt(FA, 2)} Н < mg = ${fmt(mg, 2)} Н - дене батады. Сынапта (13600) тіпті темір қалқиды!`);
      if (st.m === 1) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        if (q.type === 0) {
          ok = floats && near(frac, q.frac, 0.006);
          goal = u(`a body of ${q.rb} kg/m³ must float with ${fmt(q.frac * 100, 0)}% of its volume under the surface. Choose the liquid density.`, `тело ${q.rb} кг/м³ должно плавать, погрузившись на ${fmt(q.frac * 100, 0)}% объёма. Подбери плотность жидкости.`, `${q.rb} кг/м³ дене көлемінің ${fmt(q.frac * 100, 0)}%-ына батып қалқуы керек. Сұйық тығыздығын тап.`);
          done = `ρж = ρт / ${fmt(q.frac, 2)} = ${fmt(q.rl, 0)} ${u('kg/m³', 'кг/м³', 'кг/м³')}${named(LIQUIDS, q.rl) ? ` (${named(LIQUIDS, q.rl)})` : ''}.`;
        } else if (q.type === 1) {
          ok = floats && near(frac, q.frac, 0.006);
          goal = u(`in water, make the body float with ${fmt(q.frac * 100, 0)}% of its volume under water. Choose its density.`, `в воде тело должно плавать, погрузившись на ${fmt(q.frac * 100, 0)}%. Подбери его плотность.`, `суда дене ${fmt(q.frac * 100, 0)}%-ына батып қалқуы керек. Оның тығыздығын тап.`);
          done = `ρт = ${fmt(q.frac, 2)} · 1000 = ${fmt(q.frac * 1000, 0)} ${u('kg/m³', 'кг/м³', 'кг/м³')}.`;
        } else {
          ok = near(FAfull, q.F, 0.03);
          goal = u(`an iron body hangs in water. Choose its volume so that the water pushes it up with ${fmt(q.F, 2)} N.`, `железное тело висит в воде. Подбери объём, чтобы вода выталкивала его с силой ${fmt(q.F, 2)} Н.`, `темір дене суда ілулі тұр. Су оны ${fmt(q.F, 2)} Н күшпен ығыстыратындай көлемін тап.`);
          done = `V = Fₐ / (ρg) = ${fmt(q.F, 2)} / 9800 = ${fmt((q.F / 9800) * 1e6, 0)} ${u('cm³', 'см³', 'см³')}.`;
        }
        caption = taskCap(goal, ok, u(`Now: Fₐ = ${fmt(FA, 2)} N, under: ${fmt(frac * 100, 0)}%.`, `Сейчас: Fₐ = ${fmt(FA, 2)} Н, под водой ${fmt(frac * 100, 0)}%.`, `Қазір: Fₐ = ${fmt(FA, 2)} Н, су астында ${fmt(frac * 100, 0)}%.`), done);
        return { svg: svg + taskBadge(ok, 316, 140), caption };
      }
      return { svg, caption };
    },
  },
