// Пищевые цепи и сеть, пирамида энергии, правило 10%, задания.
const CHAINS = [
  [L('grass', 'трава', 'шөп'), L('hare', 'заяц', 'қоян'), L('fox', 'лиса', 'түлкі'), L('golden eagle', 'беркут', 'бүркіт')],
  [L('grass', 'трава', 'шөп'), L('saiga', 'сайгак', 'киік'), L('wolf', 'волк', 'қасқыр')],
  [L('leaves', 'листья', 'жапырақтар'), L('caterpillar', 'гусеница', 'жұлдызқұрт'), L('tit', 'синица', 'шымшық'), L('hawk', 'ястреб', 'қаршыға')],
  [L('phytoplankton', 'фитопланктон', 'фитопланктон'), L('zooplankton', 'зоопланктон', 'зоопланктон'), L('fish', 'рыба', 'балық'), L('seal', 'тюлень', 'итбалық'), L('polar bear', 'белый медведь', 'ақ аю')],
];
const LEVELS = [L('producer', 'продуцент', 'продуцент'), L('1st consumer', 'консумент I', 'I консумент'), L('2nd consumer', 'консумент II', 'II консумент'), L('3rd consumer', 'консумент III', 'III консумент'), L('4th consumer', 'консумент IV', 'IV консумент')];
// Пищевая сеть луга: узлы [x, y, название, уровень], рёбра «кого → кто ест».
const WEB = [
  [44, 184, L('grass', 'трава', 'шөп'), 0], [176, 184, L('grain', 'зерно', 'дән'), 0],
  [26, 138, L('grasshopper', 'кузнечик', 'шегіртке'), 1], [108, 138, L('hare', 'заяц', 'қоян'), 1], [196, 138, L('mouse', 'мышь', 'тышқан'), 1],
  [40, 84, L('frog', 'лягушка', 'бақа'), 2], [146, 84, L('snake', 'змея', 'жылан'), 2],
  [84, 28, L('fox', 'лиса', 'түлкі'), 3], [200, 28, L('owl', 'сова', 'үкі'), 3],
];
const WEB_E = [[0, 2], [0, 3], [1, 4], [0, 4], [2, 5], [5, 6], [4, 6], [3, 7], [4, 7], [4, 8], [6, 8], [2, 8]];
const fcTask = () => {
  const k = ri(2, 3);
  const top = pick([10, 20, 50, 100]);
  return { k, top, E: top * 10 ** k };
};

//@@SCENE
  foodchain: {
    title: L('Food chains and the 10% rule', 'Пищевые цепи и правило 10%', 'Қоректік тізбектер және 10% ережесі'),
    intro: L('Only about 10% of the energy passes to the next level - the rest goes on life and heat. So chains are short and predators are few.', 'На следующий уровень переходит лишь около 10% энергии - остальное уходит на жизнь и в тепло. Поэтому цепи короткие, а хищников мало.', 'Келесі деңгейге энергияның тек 10%-ы өтеді - қалғаны тіршілікке және жылуға кетеді. Сондықтан тізбектер қысқа, жыртқыштар аз.'),
    sliders: [
      { id: 'E', label: L('producers, kJ', 'продуценты, кДж', 'продуценттер, кДж'), min: 1000, max: 100000, step: 100, value: 50000, hidden: (v, st) => st.m === 2 },
      { id: 'p', label: L('passes on, %', 'переходит, %', 'өтеді, %'), min: 5, max: 20, step: 1, value: 10, hidden: (v, st) => st.m >= 2 },
    ],
    buttons: [L('Chain ↻', 'Цепь ↻', 'Тізбек ↻'), L('Pyramid', 'Пирамида', 'Пирамида'), L('Food web', 'Пищевая сеть', 'Қоректік тор'), TASK],
    state: () => ({ m: 0, c: 0, task: null }),
    pressed: (i, v, st) => (i > 0 && i === st.m) || (i === 0 && st.m === 0),
    onButton(i, st) {
      if (i === 0) {
        if (st.m === 0) st.c = (st.c + 1) % CHAINS.length;
        st.m = 0;
        return null;
      }
      st.m = i;
      if (i < 3) return null;
      st.task = fcTask();
      st.c = st.task.k === 3 ? pick([0, 2, 3]) : st.c;
      return { p: 10, E: 1000 };
    },
    draw(v, step, st) {
      const chain = CHAINS[st.c];
      const vals = chain.map((_, i) => v.E * (v.p / 100) ** i);
      const cols = ['exc-g', 'exc-y', 'exc-o', 'exc-r', 'exc-k'];
      const timesRu = (x) => {
        const r = Math.round(x * 10) / 10;
        return Number.isInteger(r) ? ruN(r, 'раз', 'раза', 'раз') : 'раза';
      };
      let svg;
      if (st.m === 2) {
        const edges = WEB_E.map(([a, b]) => {
          const [x1, y1] = WEB[a];
          const [x2, y2] = WEB[b];
          const d = Math.hypot(x2 - x1, y2 - y1);
          return `<g class="ex-faint">${arrow(x1 + ((x2 - x1) * 14) / d, y1 + ((y2 - y1) * 14) / d, x2 - ((x2 - x1) * 16) / d, y2 - ((y2 - y1) * 16) / d, 'exc-m', 1.5)}</g>`;
        }).join('');
        const nodes = WEB.map(([x, y, nm, lv]) => `<circle class="ex-fill ${cols[lv]}" cx="${x}" cy="${y}" r="12" style="opacity:.85"/>${tt(x, y + 24 > 214 ? y - 16 : y + 24, tx(nm), 'exs-s tc')}`).join('');
        const legend = LEVELS.slice(0, 4).map((l, i) => `<circle class="ex-fill ${cols[i]}" cx="310" cy="${150 - i * 18}" r="5"/>${tt(302, 154 - i * 18, tx(l), 'exs-s ex-end')}`).join('');
        svg = `${edges}${nodes}${legend}${tt(316, 180, u('arrow: who eats whom', 'стрелка: кто кого ест', 'нұсқар: кім кімді жейді'), 'exs-s ex-end')}${tt(316, 194, u('(the energy flow)', '(поток энергии)', '(энергия ағыны)'), 'exs-s ex-end')}`;
      } else if (st.m === 1) {
        const n = chain.length;
        const max = Math.log10(v.E + 1);
        svg = vals
          .map((e, i) => {
            const w = clamp((Math.log10(e + 1) / max) * 280, 26, 280);
            const h = 170 / n;
            const y = 198 - (i + 1) * h;
            return `<rect x="${n1(160 - w / 2)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h - 3)}" rx="4" class="ex-fill ${cols[i]}" style="opacity:.75"/>${tt(160, y + h / 2 + 2, `${tx(chain[i])}: ${fmt(e, e < 10 ? 2 : 0)} ${UN.kJ()}`, 'exs-t')}`;
          })
          .join('') + tt(160, 214, u('energy pyramid (widths on a log scale)', 'пирамида энергии (ширина - в логарифмическом масштабе)', 'энергия пирамидасы (ені логарифмдік масштабта)'), 'exs-s');
      } else {
        // Цепь сверху вниз: кружок, название, уровень, энергия и полоска (логарифм).
        const n = chain.length;
        const rowH = 182 / n;
        const max = Math.log10(v.E + 1);
        svg = chain
          .map((nm, i) => {
            const y = 14 + i * rowH + rowH / 2;
            const w = clamp((Math.log10(vals[i] + 1) / max) * 96, 4, 96);
            const arr = i < n - 1 ? `${arrow(26, y + 11, 26, y + rowH - 11, 'exc-m', 1.8)}${tt(34, y + rowH / 2 + 4, `${fmt(v.p, 0)}%`, 'exs-s ex-start')}` : '';
            return `${arr}<circle class="ex-fill ${cols[i]}" cx="26" cy="${n1(y)}" r="9" style="opacity:.9"/>${tt(48, y - 1, tx(nm), 'exs-t ex-start')}${tt(48, y + 11, tx(LEVELS[i]), 'exs-s ex-start')}${tt(206, y + 4, `${fmt(vals[i], vals[i] < 10 ? 2 : 0)} ${UN.kJ()}`, 'exs-t ex-end tc exc-p')}<rect x="214" y="${n1(y - 6)}" width="${n1(w)}" height="12" rx="4" class="ex-fill ${cols[i]}" style="opacity:.75"/>`;
          })
          .join('') + tt(160, 212, u(`heat and life take ${fmt(100 - v.p, 0)}% at every step`, `на жизнь и тепло уходит ${fmt(100 - v.p, 0)}% на каждом шаге`, `әр қадамда ${fmt(100 - v.p, 0)}% тіршілік пен жылуға кетеді`), 'exs-s tc exc-r');
      }
      const last = vals.at(-1);
      let caption = st.m === 2
        ? u('A food web is many chains tied together: a mouse is eaten by a fox, a snake and an owl. If mice disappear, all three suffer - the web is more stable than a single chain.', 'Пищевая сеть - это много переплетённых цепей: мышь едят лиса, змея и сова. Если мышей станет мало, пострадают все три - сеть устойчивее одной цепи.', 'Қоректік тор - бір-бірімен байланысқан көп тізбек: тышқанды түлкі, жылан және үкі жейді. Тышқан азайса, үшеуі де зардап шегеді - тор бір тізбектен тұрақтырақ.')
        : u(
            `From ${fmt(v.E, 0)} kJ in ${tx(chain[0])} only ${fmt(last, last < 10 ? 2 : 1)} kJ reach the ${tx(chain.at(-1))} (${fmt((last / v.E) * 100, 3)}%). With ${fmt(v.p, 0)}% passing on, every next level has ${fmt(100 / v.p, 1)} times less energy.`,
            `Из ${fmt(v.E, 0)} кДж (${tx(chain[0])}) до последнего звена (${tx(chain.at(-1))}) доходит лишь ${fmt(last, last < 10 ? 2 : 1)} кДж - ${fmt((last / v.E) * 100, 3)}%. Если переходит ${fmt(v.p, 0)}%, на каждом следующем уровне энергии в ${fmt(100 / v.p, 1)} ${timesRu(100 / v.p)} меньше.`,
            `${fmt(v.E, 0)} кДж-дан (${tx(chain[0])}) соңғы буынға (${tx(chain.at(-1))}) тек ${fmt(last, last < 10 ? 2 : 1)} кДж жетеді - ${fmt((last / v.E) * 100, 3)}%. ${fmt(v.p, 0)}% өтсе, әр келесі деңгейде энергия ${fmt(100 / v.p, 1)} есе аз.`,
          );
      if (st.m === 3) {
        const q = st.task;
        const got = v.E * 0.1 ** q.k;
        const ok = near(v.E, q.E, 1);
        caption = taskCap(
          u(`10% rule. How much energy must the producers (${tx(chain[0])}) store so that ${q.top} kJ reach the ${tx(chain[q.k])}?`, `правило 10%. Сколько энергии должны запасти продуценты (${tx(chain[0])}), чтобы до звена «${tx(chain[q.k])}» дошло ${q.top} кДж?`, `10% ережесі. «${tx(chain[q.k])}» буынына ${q.top} кДж жетуі үшін продуценттер (${tx(chain[0])}) қанша энергия жинауы керек?`),
          ok,
          u(`Now ${fmt(got, 1)} kJ reach it.`, `Сейчас доходит ${fmt(got, 1)} кДж.`, `Қазір ${fmt(got, 1)} кДж жетеді.`),
          `${q.top} · ${'10 · '.repeat(q.k).slice(0, -3)} = ${fmt(q.E, 0)} ${UN.kJ()}.`,
        );
        return { svg: svg + taskBadge(ok, 316, 14), caption };
      }
      return { svg, caption };
    },
  },
