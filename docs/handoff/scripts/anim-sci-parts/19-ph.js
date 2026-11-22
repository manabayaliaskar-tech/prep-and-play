// Шкала pH: библиотека веществ, [H⁺] и [OH⁻], индикаторы (лакмус, метилоранж, фенолфталеин), задания.
const PH_LIB = [
  [1.8, L('gastric juice', 'желудочный сок', 'асқазан сөлі')],
  [2.4, L('lemon juice', 'лимонный сок', 'лимон шырыны')],
  [2.9, L('vinegar', 'уксус', 'сірке суы')],
  [3.5, L('orange juice', 'апельсиновый сок', 'апельсин шырыны')],
  [4.2, L('tomato juice', 'томатный сок', 'қызанақ шырыны')],
  [5, L('black coffee', 'чёрный кофе', 'қара кофе')],
  [5.6, L('rain water', 'дождевая вода', 'жаңбыр суы')],
  [6.6, L('milk', 'молоко', 'сүт')],
  [7, L('pure water', 'чистая вода', 'таза су')],
  [7.4, L('blood', 'кровь', 'қан')],
  [8.1, L('sea water', 'морская вода', 'теңіз суы')],
  [8.3, L('baking soda', 'раствор соды', 'сода ерітіндісі')],
  [10, L('soap solution', 'мыльный раствор', 'сабын ерітіндісі')],
  [11.6, L('ammonia water', 'нашатырный спирт', 'нашатыр спирті')],
  [12.4, L('lime water', 'известковая вода', 'әк суы')],
  [13, L('NaOH 0.1 M', 'NaOH 0,1 М', 'NaOH 0,1 М')],
];
const phHue = (x) => (x <= 7 ? (x / 7) * 120 : 120 + ((x - 7) / 7) * 160);
const phCol = (x) => `hsl(${Math.round(phHue(x))} 75% 52%)`;
/** Цвета индикаторов: [цвет, название]. */
const indicators = (pH) => [
  [L('litmus', 'лакмус', 'лакмус'), pH < 5 ? ['#e0413a', L('red', 'красный', 'қызыл')] : pH <= 8.3 ? ['#8a4fd6', L('violet', 'фиолетовый', 'күлгін')] : ['#2f6fe0', L('blue', 'синий', 'көк')]],
  [L('methyl orange', 'метилоранж', 'метилоранж'), pH < 3.1 ? ['#e0413a', L('red', 'красный', 'қызыл')] : pH <= 4.4 ? ['#f08a24', L('orange', 'оранжевый', 'қызғылт сары')] : ['#f2c933', L('yellow', 'жёлтый', 'сары')]],
  [L('phenolphthalein', 'фенолфталеин', 'фенолфталеин'), pH < 8.2 ? ['transparent', L('colourless', 'бесцветный', 'түссіз')] : ['#d6338a', L('crimson', 'малиновый', 'таңқурай түсті')]],
];
const phTask = () =>
  pick([
    { pH: 4, text: L('make a solution with 1000 times more H⁺ than pure water', 'сделай раствор, где ионов H⁺ в 1000 раз больше, чем в чистой воде', 'H⁺ иондары таза судағыдан 1000 есе көп ерітінді жаса') },
    { pH: 9, text: L('make a solution with [H⁺] = 10⁻⁹ mol/L', 'сделай раствор с [H⁺] = 10⁻⁹ моль/л', '[H⁺] = 10⁻⁹ моль/л ерітінді жаса') },
    { pH: 11, text: L('make a solution with pOH = 3', 'сделай раствор с pOH = 3', 'pOH = 3 ерітінді жаса') },
    { pH: 3, text: L('make a solution with [OH⁻] = 10⁻¹¹ mol/L', 'сделай раствор с [OH⁻] = 10⁻¹¹ моль/л', '[OH⁻] = 10⁻¹¹ моль/л ерітінді жаса') },
    { pH: 2, text: L('make [H⁺] = 0.01 mol/L (like a strong acid)', 'сделай [H⁺] = 0,01 моль/л (как сильная кислота)', '[H⁺] = 0,01 моль/л жаса (күшті қышқылдағыдай)') },
    { pH: 12, text: L('make [OH⁻] = 0.01 mol/L (an alkali)', 'сделай [OH⁻] = 0,01 моль/л (щёлочь)', '[OH⁻] = 0,01 моль/л жаса (сілті)') },
  ]);

//@@SCENE
  ph: {
    title: L('The pH scale and indicators', 'Шкала pH и индикаторы', 'pH шкаласы және индикаторлар'),
    intro: L('pH = −lg[H⁺]: below 7 - acidic, 7 - neutral, above 7 - alkaline. One step of pH is a 10 times change in H⁺.', 'pH = −lg[H⁺]: меньше 7 - кислая среда, 7 - нейтральная, больше 7 - щелочная. Шаг pH на 1 - это H⁺ в 10 раз больше или меньше.', 'pH = −lg[H⁺]: 7-ден аз - қышқылдық орта, 7 - бейтарап, 7-ден көп - сілтілік. pH 1-ге өзгерсе, H⁺ 10 есе өзгереді.'),
    sliders: [{ id: 'pH', label: 'pH', min: 0, max: 14, step: 0.1, value: 7 }],
    buttons: [L('Ions', 'Ионы', 'Иондар'), L('Indicators', 'Индикаторы', 'Индикаторлар'), L('Substance ↻', 'Вещество ↻', 'Зат ↻'), TASK],
    state: () => ({ m: 0, s: 8, task: null }),
    pressed: (i, v, st) => (i < 2 && i === st.m) || (i === 3 && st.m === 2),
    btnHidden: (i, v, st) => i === 2 && st.m === 2,
    onButton(i, st) {
      if (i === 2) {
        st.s = (st.s + 1) % PH_LIB.length;
        return { pH: PH_LIB[st.s][0] };
      }
      st.m = Math.min(i, 2);
      if (i < 2) return null;
      st.task = phTask();
      return { pH: 7 };
    },
    draw(v, step, st) {
      const pH = Math.round(v.pH * 10) / 10;
      const pOH = 14 - pH;
      const neutral = Math.abs(pH - 7) < 0.05;
      const kind = neutral ? u('neutral', 'нейтральная', 'бейтарап') : pH < 7 ? u('acidic', 'кислая', 'қышқылдық') : u('alkaline', 'щелочная', 'сілтілік');
      // Шкала с отметками веществ.
      const sx = (x) => 14 + x * 20.9;
      const scale = Array.from({ length: 14 }, (_, i) => `<rect x="${n1(sx(i))}" y="150" width="21.4" height="16" style="fill:${phCol(i + 0.5)}"/>`).join('');
      const ticks = Array.from({ length: 15 }, (_, i) => tt(sx(i), 178, String(i), 'exs-s')).join('');
      const near1 = PH_LIB.find(([p]) => Math.abs(p - pH) < 0.05);
      const lib = PH_LIB.map(([p], i) => `<line class="ex-stroke ${i === st.s && near1 ? 'exc-p' : 'exc-m'}" style="stroke-width:1" x1="${n1(sx(p))}" y1="166" x2="${n1(sx(p))}" y2="170"/>`).join('');
      const pointer = `<path class="ex-fill" style="color:var(--ink)" d="M${n1(sx(pH))} 148 l-6 -10 h12 Z"/>`;
      const Hs = Number.isInteger(pH) ? `10${sup(-pH)}` : `10^(−${fmt(pH, 1)})`;
      const OHs = Number.isInteger(pOH) ? `10${sup(-pOH)}` : `10^(−${fmt(pOH, 1)})`;
      let pic;
      if (st.m === 1) {
        pic = indicators(pH)
          .map(([name, [col, cname]], i) => {
            const x = 60 + i * 100;
            return `<path class="ex-beaker" style="stroke-width:2" d="M${x - 14} 42 V112 Q${x - 14} 124 ${x} 124 Q${x + 14} 124 ${x + 14} 112 V42"/><path d="M${x - 12} 66 V112 Q${x - 12} 122 ${x} 122 Q${x + 12} 122 ${x + 12} 112 V66 Z" style="fill:${col === 'transparent' ? 'color-mix(in srgb, var(--blue) 8%, transparent)' : col};opacity:.85"/>${tt(x, 18, tx(name), 'exs-t')}${tt(x, 32, tx(cname), 'exs-s')}`;
          })
          .join('');
      } else {
        const nH = Math.round(14 * clamp(0.5 + (7 - pH) / 10, 0, 1));
        const ions = Array.from({ length: 14 }, (_, i) => {
          const x = 46 + (i % 5) * 24 + (Math.floor(i / 5) % 2) * 10;
          const y = 78 + Math.floor(i / 5) * 18;
          const hp = i < nH;
          return `<text class="ex-ion${hp ? '' : ' oh'}" style="font-size:10px" x="${x}" y="${y}">${hp ? 'H⁺' : 'OH⁻'}</text>`;
        }).join('');
        pic = `<path class="ex-beaker" d="M30 24 V124 Q30 132 38 132 H162 Q170 132 170 124 V24"/><path d="M32 54 H168 V124 Q168 130 162 130 H38 Q32 130 32 124 Z" style="fill:${phCol(pH)};opacity:.4"/>${ions}
          ${box(184, 20, 132, 110)}${tt(250, 44, `pH = ${fmt(pH, 1)}`, 'exs-h')}${tt(250, 60, kind, 'exs-t')}${tt(192, 80, `[H⁺] = ${Hs}`, 'exs-t ex-start tc exc-r')}${tt(192, 96, `[OH⁻] = ${OHs}`, 'exs-t ex-start tc exc-b')}${tt(192, 112, `pOH = 14 − pH = ${fmt(pOH, 1)}`, 'exs-s ex-start')}${tt(192, 124, u('mol/L', 'моль/л', 'моль/л'), 'exs-s ex-start')}`;
      }
      const lab = near1 ? tx(near1[1]) : '';
      const svg = `${pic}${scale}${lib}${pointer}${ticks}${tt(14, 196, u('acid', 'кислота', 'қышқыл'), 'exs-s ex-start tc exc-r')}${tt(160, 196, u('neutral', 'нейтр.', 'бейтарап'), 'exs-s tc exc-g')}${tt(306, 196, u('alkali', 'щёлочь', 'сілті'), 'exs-s ex-end tc exc-b')}${lab ? tt(160, 212, `${lab}: pH ≈ ${fmt(near1[0], 1)}`, 'exs-t') : ''}`;
      const ratio = 10 ** Math.abs(7 - pH);
      let caption;
      if (st.m === 1) {
        const ind = indicators(pH).map(([n, [, c]]) => `${tx(n)} - ${tx(c)}`).join(', ');
        caption = u(`pH ${fmt(pH, 1)} (${kind}): ${ind}. Litmus turns red in acid and blue in alkali, phenolphthalein becomes crimson only in alkali (pH > 8.2), methyl orange is red in acid.`, `pH ${fmt(pH, 1)} (${kind} среда): ${ind}. Лакмус в кислоте красный, в щёлочи синий; фенолфталеин малиновый только в щёлочи (pH > 8,2); метилоранж в кислоте красный.`, `pH ${fmt(pH, 1)} (${kind} орта): ${ind}. Лакмус қышқылда қызыл, сілтіде көк; фенолфталеин тек сілтіде таңқурай түсті (pH > 8,2); метилоранж қышқылда қызыл.`);
      } else if (neutral) caption = u('pH = 7: neutral, like pure water: [H⁺] = [OH⁻] = 10⁻⁷ mol/L.', 'pH = 7: нейтральная среда, как чистая вода: [H⁺] = [OH⁻] = 10⁻⁷ моль/л.', 'pH = 7: бейтарап орта, таза судағыдай: [H⁺] = [OH⁻] = 10⁻⁷ моль/л.');
      else
        caption = u(
          `${lab ? `${lab}: ` : ''}pH = ${fmt(pH, 1)}, ${kind}. [H⁺] = ${Hs} mol/L - ${fmt(ratio, ratio < 10 ? 1 : 0)} times ${pH < 7 ? 'more' : 'less'} than in pure water. Always pH + pOH = 14.`,
          `${lab ? `${lab}: ` : ''}pH = ${fmt(pH, 1)}, среда ${kind}. [H⁺] = ${Hs} моль/л - в ${fmt(ratio, ratio < 10 ? 1 : 0)} раз ${pH < 7 ? 'больше' : 'меньше'}, чем в чистой воде. Всегда pH + pOH = 14.`,
          `${lab ? `${lab}: ` : ''}pH = ${fmt(pH, 1)}, ${kind} орта. [H⁺] = ${Hs} моль/л - таза судағыдан ${fmt(ratio, ratio < 10 ? 1 : 0)} есе ${pH < 7 ? 'көп' : 'аз'}. Әрқашан pH + pOH = 14.`,
        );
      if (st.m === 2) {
        const q = st.task;
        const ok = Math.abs(pH - q.pH) < 0.05;
        caption = taskCap(`${tx(q.text)}.`, ok, u(`Now pH = ${fmt(pH, 1)}, [H⁺] = ${Hs}, pOH = ${fmt(pOH, 1)}.`, `Сейчас pH = ${fmt(pH, 1)}, [H⁺] = ${Hs}, pOH = ${fmt(pOH, 1)}.`, `Қазір pH = ${fmt(pH, 1)}, [H⁺] = ${Hs}, pOH = ${fmt(pOH, 1)}.`), u(`pH = ${q.pH}: [H⁺] = 10${sup(-q.pH)}, [OH⁻] = 10${sup(q.pH - 14)} mol/L.`, `pH = ${q.pH}: [H⁺] = 10${sup(-q.pH)}, [OH⁻] = 10${sup(q.pH - 14)} моль/л.`, `pH = ${q.pH}: [H⁺] = 10${sup(-q.pH)}, [OH⁻] = 10${sup(q.pH - 14)} моль/л.`));
        return { svg: svg + taskBadge(ok, 316, 14), caption };
      }
      return { svg, caption };
    },
  },
