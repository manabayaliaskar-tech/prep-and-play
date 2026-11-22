// Преломление и полное внутреннее отражение: пары сред, углы, скорость света в среде, задания.
const MEDIA = [
  [1, L('air', 'воздух', 'ауа')],
  [1.33, L('water', 'вода', 'су')],
  [1.5, L('glass', 'стекло', 'шыны')],
  [2.42, L('diamond', 'алмаз', 'алмас')],
];
const MEDIA_PAIRS = [[1, 1.33], [1, 1.5], [1, 2.42], [1.33, 1], [1.5, 1], [1.5, 1.33], [2.42, 1]];
const medName = (n) => {
  const m = MEDIA.find(([k]) => Math.abs(k - n) < 0.006);
  return m ? tx(m[1]) : `n = ${fmt(n, 2)}`;
};
const refrTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const [n1, n2] = pick([[1, 1.33], [1, 1.5], [1.5, 1], [1.33, 1]]);
    const b = n1 < n2 ? pick([20, 25, 30, 35]) : pick([30, 35, 40, 50, 60]);
    return { type, n1, n2, b, a: 10 };
  }
  if (type === 1) {
    const [n1, n2] = pick([[1.5, 1], [1.33, 1], [2.42, 1], [1.5, 1.33]]);
    return { type, n1, n2, crit: deg(Math.asin(n2 / n1)), a: 10 };
  }
  const [n2, b] = pick([[1.33, 40.6], [1.5, 35.3], [2.42, 21]]);
  return { type, n1: 1, n2: 1.7, a: 60, b, ans: n2 };
};

//@@SCENE
  refraction: {
    title: L('Refraction of light', 'Преломление света', 'Жарықтың сынуы'),
    intro: L('On a boundary light bends: n₁·sin α = n₂·sin β. In a medium it is n times slower: v = c / n.', 'На границе сред свет преломляется: n₁·sin α = n₂·sin β. В среде он в n раз медленнее: v = c / n.', 'Орталар шекарасында жарық сынады: n₁·sin α = n₂·sin β. Ортада ол n есе баяу: v = c / n.'),
    sliders: [
      { id: 'a', label: L('angle of incidence α, °', 'угол падения α, °', 'түсу бұрышы α, °'), min: 0, max: 89, step: 0.5, value: 40, hidden: (v, st) => st.m === 1 && st.task.type === 2 },
      { id: 'n1', label: 'n₁', min: 1, max: 2.42, step: 0.01, value: 1, hidden: (v, st) => st.m === 1 },
      { id: 'n2', label: 'n₂', min: 1, max: 2.42, step: 0.01, value: 1.5, hidden: (v, st) => st.m === 1 && st.task.type !== 2 },
    ],
    buttons: [L('Media ↻', 'Среды ↻', 'Орталар ↻'), L('Total reflection', 'Полное отражение', 'Толық шағылу'), TASK, FREE],
    state: () => ({ pair: 1, m: 0, task: null }),
    pressed: (i, v, st) => i === 2 && st.m === 1,
    btnHidden: (i, v, st) => (st.m === 1 ? i < 2 : i === 3),
    onButton(i, st) {
      if (i === 0) {
        st.pair = (st.pair + 1) % MEDIA_PAIRS.length;
        const [n1, n2] = MEDIA_PAIRS[st.pair];
        return { n1, n2 };
      }
      if (i === 1) return { n1: 1.5, n2: 1, a: 45 };
      if (i === 3) {
        st.m = 0;
        return null;
      }
      st.m = 1;
      st.task = refrTask();
      const q = st.task;
      return { n1: q.n1, n2: q.n2, a: q.a };
    },
    draw(v, step, st) {
      const a = rad(v.a);
      const s = (v.n1 / v.n2) * Math.sin(a);
      const tir = s > 1;
      const b = tir ? null : Math.asin(s);
      const cx = 150;
      const cy = 112;
      const R = 92;
      const crit = v.n1 > v.n2 ? deg(Math.asin(v.n2 / v.n1)) : null;
      // Доля отражённого света (формулы Френеля, среднее для двух поляризаций) - для яркости луча.
      let refl = 1;
      if (!tir) {
        const ci = Math.cos(a);
        const ct = Math.cos(b);
        const rs = ((v.n1 * ci - v.n2 * ct) / (v.n1 * ci + v.n2 * ct)) ** 2;
        const rp = ((v.n1 * ct - v.n2 * ci) / (v.n1 * ct + v.n2 * ci)) ** 2;
        refl = (rs + rp) / 2;
      }
      const op = (x) => n1(clamp(x, 0.15, 1));
      const tint = (n) => n1(0.06 + ((n - 1) / 1.42) * 0.42);
      const arc = (r, a0, a1, up, cls) => {
        // Дуга угла от нормали: up - над границей.
        const sgn = up ? -1 : 1;
        const p0 = [cx + r * Math.sin(a0), cy + sgn * r * Math.cos(a0)];
        const p1 = [cx + r * Math.sin(a1), cy + sgn * r * Math.cos(a1)];
        return `<path class="ex-stroke ${cls}" style="stroke-width:1.3" d="M${n1(p0[0])} ${n1(p0[1])} A${r} ${r} 0 0 ${(a1 > a0) === up ? 1 : 0} ${n1(p1[0])} ${n1(p1[1])}"/>`;
      };
      const inc = arrow(cx - R * Math.sin(a), cy - R * Math.cos(a), cx, cy, 'exc-y', 3);
      const reflRay = `<g style="opacity:${op(refl * 1.2 + (tir ? 1 : 0.1))}">${arrow(cx, cy, cx + R * Math.sin(a), cy - R * Math.cos(a), 'exc-y', tir ? 3 : 1.8)}</g>`;
      const refr = tir ? '<g/>' : `<g style="opacity:${op(1 - refl)}">${arrow(cx, cy, cx + R * Math.sin(b), cy + R * Math.cos(b), 'exc-o', 3)}</g>`;
      const c8 = (n) => fmt(3 / n, 2);
      const critLine = crit !== null ? `<g class="ex-faint">${ln(cx, cy, cx - 80 * Math.sin(rad(crit)), cy - 80 * Math.cos(rad(crit)), 'exc-r ex-dash', 1.2)}</g>` : '<g/>';
      const critTxt = crit !== null ? tt(10, 45, `${u('critical', 'предельный', 'шекті')} α₀ = ${fmt(crit, 1)}°`, 'exs-s ex-start tc exc-r') : '<g/>';
      const svg = `<rect x="0" y="0" width="${W}" height="${cy}" class="ex-fill exc-b" style="opacity:${tint(v.n1)}"/><rect x="0" y="${cy}" width="${W}" height="${H - cy}" class="ex-fill exc-b" style="opacity:${tint(v.n2)}"/>
        <line class="ex-axis" x1="0" y1="${cy}" x2="${W}" y2="${cy}" style="stroke-width:2"/>${ln(cx, 8, cx, 214, 'exc-m ex-dash', 1.2)}${tt(cx + 4, 16, u('normal', 'нормаль', 'нормаль'), 'exs-s ex-start')}
        ${critLine}${v.a > 0.4 ? arc(28, -a, 0, true, 'exc-y') + tt(cx - 40 * Math.sin(a + 0.3) - 2, cy - 40 * Math.cos(a + 0.3) + 4, `α = ${fmt(v.a, 1)}°`, 'exs-t ex-end tc exc-o') : '<g/><g/>'}
        ${!tir && b > 0.01 ? arc(30, 0, b, false, 'exc-o') + tt(cx + 42 * Math.sin(b + 0.3) + 2, cy + 42 * Math.cos(b + 0.3) + 4, `β = ${fmt(deg(b), 1)}°`, 'exs-t ex-start tc exc-o') : '<g/><g/>'}
        ${inc}${reflRay}${refr}
        ${box(4, 4, 104, crit !== null ? 48 : 34)}${tt(10, 17, `${medName(v.n1)}, n₁ = ${fmt(v.n1, 2)}`, 'exs-t ex-start')}${tt(10, 31, `v = ${c8(v.n1)}·10⁸ ${UN.ms()}`, 'exs-s ex-start')}${critTxt}
        ${box(4, 180, 104, 34)}${tt(10, 193, `${medName(v.n2)}, n₂ = ${fmt(v.n2, 2)}`, 'exs-t ex-start')}${tt(10, 207, `v = ${c8(v.n2)}·10⁸ ${UN.ms()}`, 'exs-s ex-start')}
        ${tir ? `${box(200, 130, 116, 22)}${tt(258, 145, u('total reflection', 'полное отражение', 'толық шағылу'), 'exs-t tc exc-r')}` : `${box(196, 180, 120, 34)}${tt(256, 194, u('reflected', 'отражается', 'шағылады') + ` ${fmt(refl * 100, 0)}%`, 'exs-s')}${tt(256, 207, u('passes', 'проходит', 'өтеді') + ` ${fmt((1 - refl) * 100, 0)}%`, 'exs-s')}`}`;
      let caption = tir
        ? u(
            `sin β would be ${fmt(v.n1, 2)}·sin ${fmt(v.a, 1)}° / ${fmt(v.n2, 2)} = ${fmt(s, 2)} > 1 - impossible. The light does not get out: total internal reflection (α > α₀ = ${fmt(crit, 1)}°, sin α₀ = n₂/n₁). Optical fibres work this way.`,
            `sin β получился бы ${fmt(v.n1, 2)}·sin ${fmt(v.a, 1)}° / ${fmt(v.n2, 2)} = ${fmt(s, 2)} > 1 - так не бывает. Свет не выходит: полное внутреннее отражение (α > α₀ = ${fmt(crit, 1)}°, sin α₀ = n₂/n₁). Так работает оптоволокно.`,
            `sin β = ${fmt(v.n1, 2)}·sin ${fmt(v.a, 1)}° / ${fmt(v.n2, 2)} = ${fmt(s, 2)} > 1 болар еді - бұлай болмайды. Жарық шықпайды: толық ішкі шағылу (α > α₀ = ${fmt(crit, 1)}°, sin α₀ = n₂/n₁). Оптоталшық осылай жұмыс істейді.`,
          )
        : u(
            `${fmt(v.n1, 2)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2, 2)} · sin β → sin β = ${fmt(s, 3)}, β = ${fmt(deg(b), 1)}°. ${v.n2 > v.n1 ? 'Into an optically denser medium the ray bends toward the normal.' : v.n2 < v.n1 ? `Into a less dense medium it bends away from the normal; beyond α₀ = ${fmt(crit, 1)}° it will not get out.` : 'Same n - no bending.'}`,
            `${fmt(v.n1, 2)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2, 2)} · sin β → sin β = ${fmt(s, 3)}, β = ${fmt(deg(b), 1)}°. ${v.n2 > v.n1 ? 'В оптически более плотную среду луч отклоняется к нормали.' : v.n2 < v.n1 ? `В менее плотную - от нормали; при α > α₀ = ${fmt(crit, 1)}° он не выйдет совсем.` : 'n одинаковые - преломления нет.'}`,
            `${fmt(v.n1, 2)} · sin ${fmt(v.a, 1)}° = ${fmt(v.n2, 2)} · sin β → sin β = ${fmt(s, 3)}, β = ${fmt(deg(b), 1)}°. ${v.n2 > v.n1 ? 'Оптикалық тығызырақ ортаға сәуле нормальға қарай ауытқиды.' : v.n2 < v.n1 ? `Тығыздығы аз ортаға - нормальдан алыс; α > α₀ = ${fmt(crit, 1)}° болса, мүлде шықпайды.` : 'n бірдей - сыну жоқ.'}`,
          );
      if (st.m === 1) {
        const q = st.task;
        const bd = tir ? null : deg(b);
        let ok;
        let goal;
        let hint;
        let done;
        if (q.type === 0) {
          ok = !tir && near(bd, q.b, 0.5);
          goal = u(`${medName(q.n1)} → ${medName(q.n2)}. Choose α so that the angle of refraction is β = ${q.b}°.`, `${medName(q.n1)} → ${medName(q.n2)}. Подбери α, чтобы угол преломления был β = ${q.b}°.`, `${medName(q.n1)} → ${medName(q.n2)}. Сыну бұрышы β = ${q.b}° болатындай α-ны тап.`);
          hint = u(`Now β = ${tir ? '-' : fmt(bd, 1) + '°'}.`, `Сейчас β = ${tir ? '-' : fmt(bd, 1) + '°'}.`, `Қазір β = ${tir ? '-' : fmt(bd, 1) + '°'}.`);
          done = `sin α = ${fmt(q.n2, 2)}·sin ${q.b}° / ${fmt(q.n1, 2)} → α ≈ ${fmt(deg(Math.asin((q.n2 * Math.sin(rad(q.b))) / q.n1)), 1)}°.`;
        } else if (q.type === 1) {
          ok = v.a >= q.crit - 0.01 && v.a <= q.crit + 0.6;
          goal = u(`${medName(q.n1)} → ${medName(q.n2)}. Find the critical angle: the smallest α at which the light no longer gets out.`, `${medName(q.n1)} → ${medName(q.n2)}. Найди предельный угол: наименьший α, при котором свет уже не выходит.`, `${medName(q.n1)} → ${medName(q.n2)}. Шекті бұрышты тап: жарық енді шықпайтын ең кіші α.`);
          hint = tir ? u('Total reflection - but maybe α can be smaller.', 'Полное отражение - но, может быть, α можно взять меньше.', 'Толық шағылу - бірақ α-ны кішірек алуға болатын шығар.') : u(`The ray still gets out (β = ${fmt(bd, 1)}°) - increase α.`, `Луч ещё выходит (β = ${fmt(bd, 1)}°) - увеличь α.`, `Сәуле әлі шығады (β = ${fmt(bd, 1)}°) - α-ны арттыр.`);
          done = `sin α₀ = n₂/n₁ = ${fmt(q.n2, 2)}/${fmt(q.n1, 2)} → α₀ = ${fmt(q.crit, 1)}°.`;
        } else {
          ok = !tir && near(v.n2, q.ans, 0.015);
          goal = u(`light goes from air at α = 60° and refracts at β = ${fmt(q.b, 1)}°. Find n₂ of the second medium.`, `свет идёт из воздуха под α = 60° и преломляется под β = ${fmt(q.b, 1)}°. Подбери n₂ второй среды.`, `жарық ауадан α = 60° бұрышпен келіп, β = ${fmt(q.b, 1)}° бұрышпен сынады. Екінші ортаның n₂-сін тап.`);
          hint = u(`Now β = ${tir ? '-' : fmt(bd, 1) + '°'}. n₂ = sin α / sin β.`, `Сейчас β = ${tir ? '-' : fmt(bd, 1) + '°'}. n₂ = sin α / sin β.`, `Қазір β = ${tir ? '-' : fmt(bd, 1) + '°'}. n₂ = sin α / sin β.`);
          done = u(`n₂ = sin 60° / sin ${fmt(q.b, 1)}° ≈ ${fmt(q.ans, 2)} - it is ${medName(q.ans)}.`, `n₂ = sin 60° / sin ${fmt(q.b, 1)}° ≈ ${fmt(q.ans, 2)} - это ${medName(q.ans)}.`, `n₂ = sin 60° / sin ${fmt(q.b, 1)}° ≈ ${fmt(q.ans, 2)} - бұл ${medName(q.ans)}.`);
        }
        caption = taskCap(goal, ok, hint, done);
        return { svg: svg + taskBadge(ok, 316, 14), caption };
      }
      return { svg, caption };
    },
  },
