// Раствор соли: массовая доля, разбавление и упаривание, насыщенный раствор (NaCl: 35,9 г на 100 г воды при 20 °C), задания.
const SOLUB = 0.359;
const solTask = () => {
  const type = ri(0, 2);
  if (type === 0) {
    const [M, w] = pick([[200, 10], [150, 20], [300, 5], [250, 12], [100, 25], [400, 15]]);
    return { type, M, w, s: (M * w) / 100, wat: M - (M * w) / 100 };
  }
  if (type === 1) {
    const [s, w0, w] = pick([[20, 20, 10], [30, 15, 10], [40, 20, 10], [15, 15, 5], [25, 25, 10]]);
    return { type, s, wat0: (s * 100) / w0 - s, w, wat: (s * 100) / w - s };
  }
  const [wat, w] = pick([[150, 25], [180, 10], [240, 20], [90, 10], [160, 20]]);
  return { type, wat, w, s: (wat * w) / (100 - w) };
};

//@@SCENE
  solution: {
    title: L('Solutions: mass fraction', 'Растворы: массовая доля', 'Ерітінділер: массалық үлес'),
    intro: L('w = m(substance) / m(solution), and m(solution) = m(substance) + m(water). Water dilutes, evaporation concentrates.', 'w = m(вещества) / m(раствора), где m(раствора) = m(вещества) + m(воды). Вода разбавляет, упаривание делает крепче.', 'w = m(зат) / m(ерітінді), мұнда m(ерітінді) = m(зат) + m(су). Су сұйылтады, буландыру күшейтеді.'),
    sliders: [
      { id: 's', label: L('salt, g', 'соль, г', 'тұз, г'), min: 0, max: 100, step: 1, value: 20, hidden: (v, st) => st.m === 1 && st.task.type === 1 },
      { id: 'w', label: L('water, g', 'вода, г', 'су, г'), min: 0, max: 400, step: 5, value: 180, hidden: (v, st) => st.m === 1 && st.task.type === 2 },
    ],
    buttons: [L('+ 50 g water', '+ 50 г воды', '+ 50 г су'), L('Evaporate 50 g', 'Выпарить 50 г', '50 г буландыру'), L('+ 10 g salt', '+ 10 г соли', '+ 10 г тұз'), TASK, FREE],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i === 3 && st.m === 1,
    btnHidden: (i, v, st) => (i === 4 ? st.m !== 1 : st.m === 1 && i < 3),
    onButton(i, st, v) {
      if (i === 0) return { w: clamp(v.w + 50, 0, 400) };
      if (i === 1) return { w: clamp(v.w - 50, 0, 400) };
      if (i === 2) return { s: clamp(v.s + 10, 0, 100) };
      if (i === 4) {
        st.m = 0;
        return null;
      }
      st.m = 1;
      st.task = solTask();
      const q = st.task;
      return q.type === 0 ? { s: 0, w: 0 } : q.type === 1 ? { s: q.s, w: q.wat0 } : { w: q.wat, s: 0 };
    },
    draw(v, step, st) {
      const dis = Math.min(v.s, SOLUB * v.w);
      const extra = v.s - dis;
      const tot = dis + v.w;
      const wf = tot > 0 ? dis / tot : 0;
      const sat = extra > 0.01;
      const lvl = clamp(tot / 3.2, 0, 130);
      const top = 190 - lvl;
      // Крупинки соли: растворённые - мелкие точки, лишние - кучка на дне.
      const nd = Math.round(dis / 2);
      const dots = Array.from({ length: Math.min(nd, 60) }, (_, i) => `<circle class="ex-fill exc-m" cx="${n1(36 + ((i * 37) % 108))}" cy="${n1(188 - ((i * 53) % Math.max(4, lvl - 4)))}" r="1.6"/>`).join('');
      const pile = sat ? `<path class="exs-panel" style="stroke:var(--muted)" d="M${n1(90 - 6 - extra * 0.5)} 190 Q90 ${n1(190 - 4 - extra * 0.35)} ${n1(90 + 6 + extra * 0.5)} 190 Z"/>` : '';
      // Круговая диаграмма состава.
      const pa = wf * Math.PI * 2;
      const pie = wf >= 0.999 ? '<circle cx="262" cy="70" r="34" class="ex-fill exc-o"/>' : wf > 0.001 ? `<circle cx="262" cy="70" r="34" class="ex-fill exc-b" style="opacity:.35"/><path class="ex-fill exc-o" d="M262 70 L262 36 A34 34 0 ${pa > Math.PI ? 1 : 0} 1 ${n1(262 + 34 * Math.sin(pa))} ${n1(70 - 34 * Math.cos(pa))} Z"/>` : '<circle cx="262" cy="70" r="34" class="ex-fill exc-b" style="opacity:.35"/>';
      const svg = `<path class="ex-beaker" d="M30 40 V192 H150 V40"/>${tot > 0 ? `<rect class="exs-water" x="32" y="${n1(top)}" width="116" height="${n1(lvl)}" style="opacity:${n1(0.55 + wf * 1.2)}"/>` : ''}${dots}${pile}
        ${[100, 200, 300, 400].map((m2) => `${ln(150, 190 - m2 / 3.2, 156, 190 - m2 / 3.2, 'exc-m', 1)}${tt(160, 190 - m2 / 3.2 + 3, String(m2), 'exs-s ex-start')}`).join('')}${tt(160, 202, `m, ${UN.g()}`, 'exs-s ex-start')}
        ${pie}${tt(262, 74, `${fmt(wf * 100, 1)}%`, 'exs-m')}${tt(214, 120, `■ ${u('salt', 'соль', 'тұз')} ${fmt(dis, 1)} ${UN.g()}`, 'exs-s ex-start tc exc-o')}${tt(214, 134, `■ ${u('water', 'вода', 'су')} ${fmt(v.w, 0)} ${UN.g()}`, 'exs-s ex-start tc exc-b')}
        ${box(196, 144, 120, 58)}${tt(256, 160, `m(${u('sol', 'р-ра', 'ерт')}) = ${fmt(tot, 1)} ${UN.g()}`, 'exs-t')}${tt(256, 176, `w = ${fmt(dis, 1)} / ${fmt(tot, 1)}`, 'exs-t')}${tt(256, 194, sat ? u(`saturated, ${fmt(extra, 1)} g left`, `насыщенный, осадок ${fmt(extra, 1)} г`, `қаныққан, ${fmt(extra, 1)} г тұнба`) : u('not saturated', 'ненасыщенный', 'қанықпаған'), `exs-s tc ${sat ? 'exc-r' : 'exc-g'}`)}`;
      let caption = tot < 0.5
        ? u('The beaker is empty - add water and salt.', 'Стакан пуст - добавь воды и соли.', 'Стақан бос - су мен тұз қос.')
        : u(
            `w = m(salt) / m(solution) = ${fmt(dis, 1)} / (${fmt(dis, 1)} + ${fmt(v.w, 0)}) = ${fmt(wf * 100, 1)}%. ${sat ? `At 20 °C only 35.9 g of NaCl dissolve in 100 g of water, so ${fmt(extra, 1)} g stay on the bottom - the solution is saturated.` : 'Adding water keeps the salt mass but lowers w; evaporating water raises it.'}`,
            `w = m(соли) / m(раствора) = ${fmt(dis, 1)} / (${fmt(dis, 1)} + ${fmt(v.w, 0)}) = ${fmt(wf * 100, 1)}%. ${sat ? `При 20 °C в 100 г воды растворяется только 35,9 г NaCl, поэтому ${fmt(extra, 1)} г лежат на дне - раствор насыщенный.` : 'Если долить воды, соли столько же, а w меньше; если выпарить воду - w больше.'}`,
            `w = m(тұз) / m(ерітінді) = ${fmt(dis, 1)} / (${fmt(dis, 1)} + ${fmt(v.w, 0)}) = ${fmt(wf * 100, 1)}%. ${sat ? `20 °C-та 100 г суда тек 35,9 г NaCl ериді, сондықтан ${fmt(extra, 1)} г түбінде қалады - ерітінді қаныққан.` : 'Су қоссаң, тұз сол күйі, ал w азаяды; суды буландырсаң - w артады.'}`,
          );
      if (st.m === 1) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        if (q.type === 0) {
          ok = near(v.s, q.s, 0.6) && near(v.w, q.wat, 2.6);
          goal = u(`prepare ${q.M} g of a ${q.w}% salt solution.`, `приготовь ${q.M} г раствора соли с w = ${q.w}%.`, `w = ${q.w}% тұз ерітіндісінің ${q.M} г-ын дайында.`);
          done = u(`salt = ${q.M} · ${fmt(q.w / 100, 2)} = ${fmt(q.s, 0)} g, water = ${q.M} − ${fmt(q.s, 0)} = ${fmt(q.wat, 0)} g.`, `соль = ${q.M} · ${fmt(q.w / 100, 2)} = ${fmt(q.s, 0)} г, вода = ${q.M} − ${fmt(q.s, 0)} = ${fmt(q.wat, 0)} г.`, `тұз = ${q.M} · ${fmt(q.w / 100, 2)} = ${fmt(q.s, 0)} г, су = ${q.M} − ${fmt(q.s, 0)} = ${fmt(q.wat, 0)} г.`);
        } else if (q.type === 1) {
          ok = near(v.w, q.wat, 2.6);
          goal = u(`there are ${q.s} g of salt. Add water to get a ${q.w}% solution.`, `в растворе ${q.s} г соли. Долей воды, чтобы получился ${q.w}% раствор.`, `ерітіндіде ${q.s} г тұз бар. ${q.w}% ерітінді болатындай су қос.`);
          done = u(`m(solution) = ${q.s} / ${fmt(q.w / 100, 2)} = ${fmt(q.s + q.wat, 0)} g, water ${fmt(q.wat, 0)} g.`, `m(р-ра) = ${q.s} / ${fmt(q.w / 100, 2)} = ${fmt(q.s + q.wat, 0)} г, воды ${fmt(q.wat, 0)} г.`, `m(ерт) = ${q.s} / ${fmt(q.w / 100, 2)} = ${fmt(q.s + q.wat, 0)} г, су ${fmt(q.wat, 0)} г.`);
        } else {
          ok = near(v.s, q.s, 0.6);
          goal = u(`how much salt must be dissolved in ${q.wat} g of water to get ${q.w}%?`, `сколько соли растворить в ${q.wat} г воды, чтобы получить ${q.w}%?`, `${q.w}% алу үшін ${q.wat} г суда қанша тұз еріту керек?`);
          done = `m = w·m(${u('water', 'воды', 'су')}) / (1 − w) = ${fmt(q.w / 100, 2)} · ${q.wat} / ${fmt(1 - q.w / 100, 2)} = ${fmt(q.s, 0)} ${UN.g()}.`;
        }
        caption = taskCap(goal, ok, u(`Now: ${fmt(dis, 1)} g of salt, ${fmt(v.w, 0)} g of water, w = ${fmt(wf * 100, 1)}%.`, `Сейчас: соли ${fmt(dis, 1)} г, воды ${fmt(v.w, 0)} г, w = ${fmt(wf * 100, 1)}%.`, `Қазір: тұз ${fmt(dis, 1)} г, су ${fmt(v.w, 0)} г, w = ${fmt(wf * 100, 1)}%.`), done);
        return { svg: svg + taskBadge(ok, 316, 14), caption };
      }
      return { svg, caption };
    },
  },
