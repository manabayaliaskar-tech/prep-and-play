// Моль: n = m/M, число частиц, объём газа при н. у., массовая доля элемента, задания.
const SUBST = [
  ['H2O', 0], ['CO2', 1], ['O2', 1], ['NaCl', 0], ['H2SO4', 0], ['CaCO3', 0], ['NH3', 1], ['CH4', 1], ['HCl', 1], ['NaOH', 0], ['H2', 1], ['N2', 1], ['C6H12O6', 0],
];
const arOf = (e) => EL_AR[EL.indexOf(e)];
const molarOf = (f) => Object.entries(parseF(f)).reduce((s, [e, k]) => s + k * arOf(e), 0);
const molarSum = (f) => Object.entries(parseF(f)).map(([e, k]) => `${k > 1 ? `${k}·` : ''}${fmt(arOf(e), 1)}`).join(' + ');
const molTask = () => {
  const type = ri(0, 2);
  if (type === 1) {
    const s = pick(SUBST.map((x, i) => [x, i]).filter(([x]) => x[1]));
    const V = pick([5.6, 11.2, 22.4, 33.6, 44.8]);
    const M = molarOf(s[0][0]);
    if ((V / 22.4) * M <= 200) return { type, s: s[1], V, n: V / 22.4, m: (V / 22.4) * M };
  }
  for (let g = 0; g < 100; g++) {
    const s = ri(0, SUBST.length - 1);
    const M = molarOf(SUBST[s][0]);
    const n = pick([0.1, 0.2, 0.25, 0.5, 1, 1.5, 2, 3]);
    if (n * M <= 200 && n * M >= 3) return { type: type === 1 ? 0 : type, s, n, m: n * M };
  }
  return { type: 0, s: 0, n: 2, m: 36 };
};

//@@SCENE
  molar: {
    title: L('Moles: grams, particles, litres', 'Моль: граммы, частицы, литры', 'Моль: грамм, бөлшек, литр'),
    intro: L('1 mol is 6.02·10²³ particles; its mass in grams is M (sum of Ar), a gas takes 22.4 L at STP. n = m / M = N / Nₐ = V / Vm.', '1 моль - это 6,02·10²³ частиц, его масса в граммах равна M (сумма Ar), газ при н. у. занимает 22,4 л. n = m / M = N / Nₐ = V / Vm.', '1 моль - 6,02·10²³ бөлшек, оның граммдағы массасы M-ге (Ar қосындысы) тең, газ қ. ж. 22,4 л алады. n = m / M = N / Nₐ = V / Vm.'),
    sliders: [{ id: 'm', label: L('mass m, g', 'масса m, г', 'масса m, г'), min: 0, max: 200, step: 0.5, value: 36 }],
    buttons: [L('n = m / M', 'n = m / M', 'n = m / M'), L('Gas: V = n·Vm', 'Газ: V = n·Vm', 'Газ: V = n·Vm'), L('Mass fraction', 'Массовая доля', 'Массалық үлес'), L('Substance ↻', 'Вещество ↻', 'Зат ↻'), TASK],
    state: () => ({ m: 0, s: 0, task: null }),
    pressed: (i, v, st) => i === st.m || (i === 4 && st.m === 3),
    btnHidden: (i, v, st) => i === 3 && st.m === 3,
    onButton(i, st) {
      if (i === 3) {
        do st.s = (st.s + 1) % SUBST.length;
        while (st.m === 1 && !SUBST[st.s][1]);
        return null;
      }
      if (i < 3) {
        st.m = i;
        if (i === 1) while (!SUBST[st.s][1]) st.s = (st.s + 1) % SUBST.length;
        return null;
      }
      st.m = 3;
      st.task = molTask();
      st.s = st.task.s;
      return { m: 0 };
    },
    draw(v, step, st) {
      const [f, gas] = SUBST[st.s];
      const F = subF(f);
      const M = molarOf(f);
      const n = v.m / M;
      const N = n * 6.02;
      const head = `${tt(160, 22, `M(${F}) = ${molarSum(f)} = ${fmt(M, 1)} ${u('g/mol', 'г/моль', 'г/моль')}`, 'exs-t')}`;
      const mode = st.m === 3 ? (st.task.type === 1 ? 1 : 0) : st.m;
      let pic = '';
      if (mode === 0) {
        const full = Math.floor(n + 1e-9);
        const part = n - full;
        pic = Array.from({ length: Math.min(10, Math.ceil(n - 1e-9)) }, (_, i) => {
          const fill = i < full ? 1 : part;
          const x = 48 + (i % 5) * 56;
          const y = 92 + Math.floor(i / 5) * 50;
          const end = fill >= 0.999 ? `<circle class="ex-fill exc-p" style="opacity:.75" cx="${x}" cy="${y}" r="20"/>` : `<path class="ex-fill exc-p" style="opacity:.75" d="M${x} ${y} L${x} ${y - 20} A20 20 0 ${fill > 0.5 ? 1 : 0} 1 ${n1(x + 20 * Math.sin(fill * 2 * Math.PI))} ${n1(y - 20 * Math.cos(fill * 2 * Math.PI))} Z"/>`;
          return `<circle class="ex-stroke exc-p" style="stroke-width:1.5" cx="${x}" cy="${y}" r="20"/>${end}${tt(x, y + 4, fill >= 0.999 ? `1 ${UN.mol()}` : fmt(fill, 2), 'exs-s')}`;
        }).join('');
        pic += `${tt(160, 46, `n = m / M = ${fmt(v.m, 1)} / ${fmt(M, 1)} = ${fmt(n, 3)} ${UN.mol()}`, 'exs-h')}${n > 10 ? tt(160, 182, u('(only 10 moles drawn)', '(нарисовано только 10 моль)', '(тек 10 моль салынған)'), 'exs-s') : ''}
          ${box(4, 190, 236, 24)}${tt(122, 206, `N = n·Nₐ = ${fmt(n, 3)} · 6,02·10²³ ≈ ${fmt(N, 2)}·10²³`, 'exs-t')}`;
      } else if (mode === 1) {
        const V = n * 22.4;
        if (!gas) pic = `${box(30, 70, 260, 70)}${tt(160, 98, u(`${F} is not a gas at STP,`, `${F} при н. у. не газ,`, `${F} қ. ж. газ емес,`), 'exs-m')}${tt(160, 118, u('choose another substance ↻', 'выбери другое вещество ↻', 'басқа зат таңда ↻'), 'exs-t')}`;
        else {
          const full = Math.floor(n + 1e-9);
          const part = n - full;
          pic = Array.from({ length: Math.min(8, Math.ceil(n - 1e-9)) }, (_, i) => {
            const fill = i < full ? 1 : part;
            const x = 26 + (i % 4) * 72;
            const y = 62 + Math.floor(i / 4) * 64;
            return `<rect class="ex-stroke exc-b" style="stroke-width:1.5" x="${x}" y="${y}" width="52" height="52" rx="4"/><rect class="ex-fill exc-b" style="opacity:.45" x="${x}" y="${n1(y + 52 * (1 - fill))}" width="52" height="${n1(52 * fill)}" rx="4"/>${tt(x + 26, y + 30, `${fmt(22.4 * fill, 1)} ${UN.L()}`, 'exs-s')}`;
          }).join('');
          pic += `${tt(160, 46, `V = n·Vm = ${fmt(n, 3)} · ${fmt(22.4, 1)} = ${fmt(V, 2)} ${UN.L()}`, 'exs-h')}${box(30, 192, 260, 22)}${tt(160, 207, u('each cube - 1 mol of any gas = 22.4 L (0 °C, 1 atm)', 'каждый куб - 1 моль любого газа = 22,4 л (0 °C, 1 атм)', 'әр куб - кез келген газдың 1 молі = 22,4 л (0 °C, 1 атм)'), 'exs-s')}`;
        }
      } else {
        const comp = Object.entries(parseF(f));
        let x0 = 20;
        const bar = comp
          .map(([e, k]) => {
            const w = (k * arOf(e)) / M;
            const wpx = 280 * w;
            const cls = EL_CLS[e] ?? 'exc-p';
            const seg = `<rect class="ex-fill ${cls}" style="opacity:.8" x="${n1(x0)}" y="52" width="${n1(wpx)}" height="26"/>${wpx > 26 ? tt(x0 + wpx / 2, 69, e, 'exs-t exs-on') : ''}`;
            x0 += wpx;
            return seg;
          })
          .join('');
        const rows = comp
          .map(([e, k], i) => {
            const w = (k * arOf(e)) / M;
            return `${tt(20, 104 + i * 22, `w(${e}) = ${k > 1 ? `${k}·` : ''}${fmt(arOf(e), 1)} / ${fmt(M, 1)} = ${fmt(w * 100, 1)}%`, `exs-t ex-start tc ${EL_CLS[e] ?? 'exc-p'}`)}${tt(300, 104 + i * 22, `${fmt(w * v.m, 1)} ${UN.g()}`, 'exs-t ex-end')}`;
          })
          .join('');
        pic = `${bar}${tt(300, 46, `${u('in', 'в', '')} ${fmt(v.m, 1)} ${UN.g()} ${F}${getLang() === 'kk' ? ' ішінде' : ''}:`, 'exs-s ex-end')}${rows}`;
      }
      const svg = `${head}${pic}`;
      let caption =
        mode === 0
          ? u(`${fmt(v.m, 1)} g of ${F} is n = m / M = ${fmt(n, 3)} mol (a full circle = 1 mol = ${fmt(M, 1)} g). That is N = n·6.02·10²³ ≈ ${fmt(N, 2)}·10²³ molecules. A heavier molecule (bigger M) gives fewer moles for the same mass.`, `${fmt(v.m, 1)} г ${F} - это n = m / M = ${fmt(n, 3)} моль (полный круг = 1 моль = ${fmt(M, 1)} г). Это N = n·6,02·10²³ ≈ ${fmt(N, 2)}·10²³ частиц. Чем тяжелее молекула (больше M), тем меньше молей при той же массе.`, `${fmt(v.m, 1)} г ${F} - бұл n = m / M = ${fmt(n, 3)} моль (толық шеңбер = 1 моль = ${fmt(M, 1)} г). Бұл N = n·6,02·10²³ ≈ ${fmt(N, 2)}·10²³ бөлшек. Молекула ауыр болса (M үлкен), сол массада моль аз болады.`)
          : mode === 1
            ? u(`At STP 1 mol of any gas takes 22.4 L. ${fmt(v.m, 1)} g of ${F}: n = ${fmt(n, 3)} mol, V = n·22.4 = ${fmt(n * 22.4, 2)} L. The same volume of hydrogen would weigh much less - but contain the same number of molecules.`, `При н. у. 1 моль любого газа занимает 22,4 л. ${fmt(v.m, 1)} г ${F}: n = ${fmt(n, 3)} моль, V = n·22,4 = ${fmt(n * 22.4, 2)} л. Такой же объём водорода весил бы намного меньше - но молекул в нём столько же.`, `Қ. ж. кез келген газдың 1 молі 22,4 л алады. ${fmt(v.m, 1)} г ${F}: n = ${fmt(n, 3)} моль, V = n·22,4 = ${fmt(n * 22.4, 2)} л. Сондай көлемдегі сутек әлдеқайда жеңіл - бірақ молекула саны бірдей.`)
            : u(`Mass fraction of an element: w = k·Ar / M. In ${F} the shares add up to 100%, and they do not depend on how many grams you take.`, `Массовая доля элемента: w = k·Ar / M. В ${F} доли в сумме дают 100% и не зависят от того, сколько граммов взять.`, `Элементтің массалық үлесі: w = k·Ar / M. ${F} құрамындағы үлестер қосындысы 100% және неше грамм алғанға тәуелді емес.`);
      if (st.m === 3) {
        const q = st.task;
        const ok = near(v.m, q.m, 0.6);
        let goal;
        let done;
        if (q.type === 0) {
          goal = u(`weigh out ${fmt(q.n, 2)} mol of ${F}.`, `отмерь ${fmt(q.n, 2)} моль ${F}.`, `${fmt(q.n, 2)} моль ${F} өлшеп ал.`);
          done = `m = n·M = ${fmt(q.n, 2)} · ${fmt(M, 1)} = ${fmt(q.m, 2)} ${UN.g()}.`;
        } else if (q.type === 1) {
          goal = u(`what mass of ${F} takes ${fmt(q.V, 1)} L at STP?`, `какая масса ${F} занимает ${fmt(q.V, 1)} л при н. у.?`, `қ. ж. ${fmt(q.V, 1)} л алатын ${F} массасы қанша?`);
          done = `n = ${fmt(q.V, 1)} / 22,4 = ${fmt(q.n, 2)} ${UN.mol()}, m = n·M = ${fmt(q.m, 2)} ${UN.g()}.`;
        } else {
          goal = u(`take as much ${F} as contains ${fmt(q.n * 6.02, 3)}·10²³ molecules.`, `возьми столько ${F}, чтобы в нём было ${fmt(q.n * 6.02, 3)}·10²³ молекул.`, `ішінде ${fmt(q.n * 6.02, 3)}·10²³ молекула болатындай ${F} ал.`);
          done = `n = N / Nₐ = ${fmt(q.n, 2)} ${UN.mol()}, m = n·M = ${fmt(q.m, 2)} ${UN.g()}.`;
        }
        caption = taskCap(goal, ok, u(`Now m = ${fmt(v.m, 1)} g, n = ${fmt(n, 3)} mol.`, `Сейчас m = ${fmt(v.m, 1)} г, n = ${fmt(n, 3)} моль.`, `Қазір m = ${fmt(v.m, 1)} г, n = ${fmt(n, 3)} моль.`), done);
        return { svg: svg + taskBadge(ok, 318, mode === 1 ? 186 : 206), caption };
      }
      return { svg, caption };
    },
  },
