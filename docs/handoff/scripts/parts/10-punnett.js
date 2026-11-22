// Генетика: моно- и дигибридное скрещивание, неполное доминирование, сцепленное с полом, задания на расщепление.
let PUN_MODE = 0; // для подписей ползунков: текущий режим сцены punnett
const punA = (i) => Math.floor(i / 3);
const punB = (i) => i % 3;
const allele = (n, big, small) => (n === 2 ? [big, big] : n === 1 ? [big, small] : [small, small]);
const geno = (i, mode, female) => {
  const a = punA(i);
  if (mode === 3) return female ? ['XᴴXᴴ', 'XᴴXʰ', 'XʰXʰ'][2 - a] : a ? 'XᴴY' : 'XʰY';
  const A = allele(a, 'A', 'a').join('');
  return mode === 1 ? A + allele(punB(i), 'B', 'b').join('') : A;
};
const PUN_TASKS = [
  { mode: 0, ph: [3, 1], text: L('get the phenotype ratio 3 : 1', 'получи расщепление по фенотипу 3 : 1', 'фенотип бойынша 3 : 1 ажырауын ал') },
  { mode: 0, ph: [1, 1], text: L('get the phenotype ratio 1 : 1 (a test cross)', 'получи расщепление 1 : 1 (анализирующее скрещивание)', '1 : 1 ажырауын ал (талдаушы будандастыру)') },
  { mode: 0, gt: 'Aa', text: L('make all offspring Aa (uniform F₁)', 'сделай так, чтобы всё потомство было Aa (единообразие F₁)', 'барлық ұрпақ Aa болсын (F₁ біркелкілігі)') },
  { mode: 1, ph: [9, 3, 3, 1], text: L('get the ratio 9 : 3 : 3 : 1', 'получи расщепление 9 : 3 : 3 : 1', '9 : 3 : 3 : 1 ажырауын ал') },
  { mode: 1, ph: [1, 1, 1, 1], text: L('get the ratio 1 : 1 : 1 : 1', 'получи расщепление 1 : 1 : 1 : 1', '1 : 1 : 1 : 1 ажырауын ал') },
  { mode: 1, ph: [3, 3, 1, 1], text: L('get the ratio 3 : 3 : 1 : 1', 'получи расщепление 3 : 3 : 1 : 1', '3 : 3 : 1 : 1 ажырауын ал') },
  { mode: 2, ph: [2, 1, 1], text: L('get red, pink and white flowers 1 : 2 : 1', 'получи красные, розовые и белые цветки 1 : 2 : 1', 'қызыл, қызғылт және ақ гүлдерді 1 : 2 : 1 ал') },
  { mode: 2, gt: 'Aa', text: L('make all flowers pink', 'сделай все цветки розовыми', 'барлық гүл қызғылт болсын') },
  { mode: 3, sex: true, text: L('all daughters healthy, half of the sons with haemophilia', 'все дочери здоровы, половина сыновей с гемофилией', 'барлық қыздары сау, ұлдарының жартысы гемофилиямен') },
];
/** Потомство: список { g: генотип, p: номер фенотипа } по клеткам решётки. */
function punCross(i1, i2, mode) {
  const gam = (i) => {
    if (mode === 3) return null;
    const A = allele(punA(i), 'A', 'a');
    if (mode !== 1) return A;
    const B = allele(punB(i), 'B', 'b');
    return [A[0] + B[0], A[0] + B[1], A[1] + B[0], A[1] + B[1]];
  };
  let g1;
  let g2;
  if (mode === 3) {
    g1 = allele(punA(i1), 'Xᴴ', 'Xʰ');
    g2 = [punA(i2) ? 'Xᴴ' : 'Xʰ', 'Y'];
  } else {
    g1 = gam(i1);
    g2 = gam(i2);
  }
  const cells = [];
  for (const r of g2)
    for (const c of g1) {
      let g;
      let p;
      if (mode === 3) {
        // 0 - здоровая дочь, 1 - дочь-носитель, 2 - здоровый сын, 3 - больная дочь, 4 - больной сын
        if (r === 'Y') {
          g = `${c}Y`;
          p = c === 'Xʰ' ? 4 : 2;
        } else {
          g = c === r ? c + r : 'XᴴXʰ';
          const hs = (g.match(/ʰ/g) ?? []).length;
          p = hs === 2 ? 3 : hs;
        }
      } else if (mode === 1) {
        const a = [c[0], r[0]].sort().join('');
        const b = [c[1], r[1]].sort().join('');
        g = a + b;
        p = (a.includes('A') ? 0 : 2) + (b.includes('B') ? 0 : 1);
      } else {
        g = [c, r].sort().join('');
        const n = (g.match(/A/g) ?? []).length;
        p = mode === 2 ? 2 - n : n ? 0 : 1;
      }
      cells.push({ g, p });
    }
  return { g1, g2, cells };
}
const PH_NAMES = [
  [L('yellow', 'жёлтые', 'сары'), L('green', 'зелёные', 'жасыл')],
  [L('yellow smooth', 'жёлтые гладкие', 'сары тегіс'), L('yellow wrinkled', 'жёлтые морщинистые', 'сары бүріскен'), L('green smooth', 'зелёные гладкие', 'жасыл тегіс'), L('green wrinkled', 'зелёные морщинистые', 'жасыл бүріскен')],
  [L('red', 'красные', 'қызыл'), L('pink', 'розовые', 'қызғылт'), L('white', 'белые', 'ақ')],
  [L('healthy daughter', 'здоровая дочь', 'сау қыз'), L('carrier daughter', 'дочь-носитель', 'тасымалдаушы қыз'), L('healthy son', 'здоровый сын', 'сау ұл'), L('sick daughter', 'больная дочь', 'науқас қыз'), L('haemophilia son', 'сын с гемофилией', 'гемофилиямен ұл')],
];
/** Значок фенотипа: горошина (цвет, форма), цветок или человек. */
function phIcon(mode, p, x, y, r = 6) {
  if (mode === 0 || mode === 1) {
    const green = mode === 0 ? p === 1 : p >= 2;
    const wr = mode === 1 && p % 2 === 1;
    const cls = green ? 'ex-pea rec' : 'ex-pea dom';
    if (!wr) return `<circle class="${cls}" cx="${n1(x)}" cy="${n1(y)}" r="${r}"/>`;
    let d = '';
    for (let k = 0; k < 16; k++) {
      const rr = k % 2 ? r * 0.72 : r;
      d += `${k ? 'L' : 'M'}${n1(x + rr * Math.cos((k * Math.PI) / 8))} ${n1(y + rr * Math.sin((k * Math.PI) / 8))} `;
    }
    return `<path class="${cls}" d="${d}Z"/>`;
  }
  if (mode === 2) {
    const fill = ['var(--red)', 'color-mix(in srgb, var(--pink) 55%, var(--card))', 'var(--card)'][p];
    let petals = '';
    for (let k = 0; k < 5; k++) petals += `<circle cx="${n1(x + r * 0.62 * Math.cos((k * 2 * Math.PI) / 5))}" cy="${n1(y + r * 0.62 * Math.sin((k * 2 * Math.PI) / 5))}" r="${n1(r * 0.48)}" style="fill:${fill};stroke:var(--ink);stroke-width:.6"/>`;
    return `${petals}<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r * 0.28)}" class="ex-fill exc-y"/>`;
  }
  const cls = ['exc-g', 'exc-y', 'exc-g', 'exc-r', 'exc-r'][p];
  // Знаки пола рисуем линиями (не символами-эмодзи).
  const male = p === 2 || p === 4;
  const rr = r * 0.6;
  const cy2 = male ? y + 1.5 : y - 1.5;
  const mark = male
    ? `M${n1(x + rr * 0.7)} ${n1(cy2 - rr * 0.7)} L${n1(x + rr * 1.7)} ${n1(cy2 - rr * 1.7)} M${n1(x + rr * 0.9)} ${n1(cy2 - rr * 1.7)} H${n1(x + rr * 1.7)} V${n1(cy2 - rr * 0.9)}`
    : `M${n1(x)} ${n1(cy2 + rr)} V${n1(cy2 + rr * 2.2)} M${n1(x - rr * 0.6)} ${n1(cy2 + rr * 1.6)} H${n1(x + rr * 0.6)}`;
  return `<g class="${cls}"><circle class="ex-stroke" style="stroke-width:1.6" cx="${n1(x)}" cy="${n1(cy2)}" r="${n1(rr)}"/><path class="ex-stroke" style="stroke-width:1.6" d="${mark}"/></g>`;
}

//@@SCENE
  punnett: {
    title: L('Genetics: Punnett square', 'Генетика: решётка Пеннета', 'Генетика: Пеннет торы'),
    intro: L('Each parent passes one allele of each gene. A capital letter is dominant: it shows even with one copy.', 'Каждый родитель передаёт по одному аллелю каждого гена. Большая буква - доминантный аллель: он проявляется даже в одной копии.', 'Әр ата-ана әр геннің бір аллелін береді. Бас әріп - доминантты аллель: бір көшірмеде де көрінеді.'),
    sliders: [
      { id: 'p1', label: L('mother ♀', 'мать ♀', 'аналық ♀'), min: 0, max: 8, step: 1, value: 4, show: (i) => geno(i, PUN_MODE, true) },
      { id: 'p2', label: L('father ♂', 'отец ♂', 'аталық ♂'), min: 0, max: 8, step: 1, value: 4, show: (i) => geno(i, PUN_MODE, false) },
    ],
    buttons: [L('Monohybrid', 'Моногибридное', 'Моногибридті'), L('Dihybrid', 'Дигибридное', 'Дигибридті'), L('Incomplete dominance', 'Неполное доминирование', 'Толымсыз доминанттылық'), L('Sex-linked', 'Сцепленное с полом', 'Жынысқа тіркескен'), TASK],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      if (i < 4) return { p1: 4, p2: 4 };
      st.task = { ...pick(PUN_TASKS) };
      return { p1: 0, p2: 0 };
    },
    draw(v, step, st) {
      const task = st.m === 4 ? st.task : null;
      const mode = task ? task.mode : st.m;
      PUN_MODE = mode;
      const i1 = Math.round(v.p1);
      const i2 = Math.round(v.p2);
      const { g1, g2, cells } = punCross(i1, i2, mode);
      const nc = g1.length;
      const cs = nc === 4 ? 31 : 50;
      const x0 = nc === 4 ? 36 : 54;
      const y0 = nc === 4 ? 40 : 58;
      let grid = '';
      g1.forEach((g, j) => (grid += tt(x0 + j * cs + cs / 2, y0 - 7, g, nc === 4 ? 'exs-t tc exc-k' : 'exs-m tc exc-k')));
      g2.forEach((g, r) => (grid += tt(x0 - 6, y0 + r * cs + cs / 2 + 4, g, `${nc === 4 ? 'exs-t' : 'exs-m'} ex-end tc exc-b`)));
      cells.forEach((c, k) => {
        const x = x0 + (k % nc) * cs;
        const y = y0 + Math.floor(k / nc) * cs;
        const bg = mode === 3 ? ['exc-g', 'exc-y', 'exc-g', 'exc-r', 'exc-r'][c.p] : mode === 2 ? ['exc-r', 'exc-k', 'exc-m'][c.p] : mode === 0 ? ['exc-y', 'exc-g'][c.p] : ['exc-y', 'exc-y', 'exc-g', 'exc-g'][c.p];
        grid += `<rect class="ex-fill ${bg}" style="opacity:.22" x="${x + 1}" y="${y + 1}" width="${cs - 2}" height="${cs - 2}" rx="5"/>${tt(x + cs / 2, y + (nc === 4 ? cs / 2 - 1 : cs / 2 - 4), c.g, nc === 4 ? 'exs-s tc' : 'exs-t')}${phIcon(mode, c.p, x + cs / 2, y + (nc === 4 ? cs - 8 : cs - 13), nc === 4 ? 4.5 : 7)}`;
      });
      // Расщепление по фенотипу.
      const nPh = PH_NAMES[mode].length;
      const cnt = Array(nPh).fill(0);
      for (const c of cells) cnt[c.p] += 1;
      const total = cells.length;
      const used = cnt.map((n, p) => [n, p]).filter(([n]) => n > 0);
      const gg = used.map(([n]) => n).reduce(gcd);
      const ratio = used.map(([n]) => n / gg).join(' : ');
      const gtCnt = {};
      for (const c of cells) gtCnt[c.g] = (gtCnt[c.g] ?? 0) + 1;
      const gts = Object.entries(gtCnt);
      const gg2 = gts.map(([, n]) => n).reduce(gcd);
      const lx = 196;
      let legend = `${box(lx - 10, 4, 130, 212)}${tt(lx + 55, 20, `${geno(i1, mode, true)} × ${geno(i2, mode, false)}`, 'exs-m')}${tt(lx + 55, 36, u('phenotypes', 'фенотипы', 'фенотиптер'), 'exs-s')}`;
      used.forEach(([n, p], k) => {
        const y = 52 + k * 27;
        legend += `${phIcon(mode, p, lx + 3, y + 1, 6.5)}${tt(lx + 14, y, tx(PH_NAMES[mode][p]), 'exs-s ex-start tc')}${tt(lx + 14, y + 12, `${n}/${total} = ${fmt((n / total) * 100, 1)}%`, 'exs-t ex-start')}`;
      });
      const ly = 52 + used.length * 27 + 4;
      legend += `${tt(lx + 55, ly + 4, ratio, 'exs-h')}`;
      if (mode !== 3) legend += `${tt(lx + 55, ly + 22, u('genotypes', 'генотипы', 'генотиптер'), 'exs-s')}${tt(lx + 55, ly + 36, gts.length <= 4 ? gts.map(([g]) => g).join(' : ') : `${gts.length} ${u('kinds', 'видов', 'түрі')}`, 'exs-s')}${tt(lx + 55, ly + 50, gts.length <= 4 ? gts.map(([, n]) => n / gg2).join(' : ') : '', 'exs-t')}`;
      const head = `${tt(x0 + (nc * cs) / 2, nc === 4 ? 18 : 26, u("mother's gametes", 'гаметы матери', 'аналық гаметалары'), 'exs-s')}${tt(2, y0 - 7, u('father', 'отец', 'аталық'), 'exs-s ex-start')}`;
      const svg = `${head}${grid}${legend}`;
      const P1 = geno(i1, mode, true);
      const P2 = geno(i2, mode, false);
      let caption;
      if (mode === 0) {
        const law = P1 === 'Aa' && P2 === 'Aa' ? u("Mendel's 2nd law (segregation): 3 : 1 by phenotype, 1 : 2 : 1 by genotype.", 'второй закон Менделя (расщепление): 3 : 1 по фенотипу, 1 : 2 : 1 по генотипу.', 'Мендельдің 2-заңы (ажырау): фенотип бойынша 3 : 1, генотип бойынша 1 : 2 : 1.') : (P1 === 'AA' && P2 === 'aa') || (P1 === 'aa' && P2 === 'AA') ? u("Mendel's 1st law: all F₁ hybrids are the same (Aa, yellow).", 'первый закон Менделя: все гибриды F₁ одинаковы (Aa, жёлтые).', 'Мендельдің 1-заңы: барлық F₁ будандары бірдей (Aa, сары).') : (P1 === 'aa') !== (P2 === 'aa') && (P1 === 'Aa' || P2 === 'Aa') ? u('A test cross with aa shows the hidden a: 1 : 1.', 'анализирующее скрещивание с aa выявляет скрытый a: 1 : 1.', 'aa-мен талдаушы будандастыру жасырын a-ны көрсетеді: 1 : 1.') : '';
        caption = u(`${P1} × ${P2}: yellow (A_) ${cnt[0]}/4, green (aa) ${cnt[1]}/4. ${law}`, `${P1} × ${P2}: жёлтые (A_) ${cnt[0]}/4, зелёные (aa) ${cnt[1]}/4. ${law ? law[0].toUpperCase() + law.slice(1) : ''}`, `${P1} × ${P2}: сары (A_) ${cnt[0]}/4, жасыл (aa) ${cnt[1]}/4. ${law}`);
      } else if (mode === 1)
        caption = u(
          `${P1} × ${P2}: each parent gives 4 kinds of gametes, 16 combinations. A - yellow, a - green; B - smooth, b - wrinkled. Ratio ${ratio}.${P1 === 'AaBb' && P2 === 'AaBb' ? " Mendel's 3rd law: the genes are inherited independently, 9 : 3 : 3 : 1." : ''}`,
          `${P1} × ${P2}: каждый родитель даёт 4 вида гамет, всего 16 сочетаний. A - жёлтый, a - зелёный; B - гладкий, b - морщинистый. Расщепление ${ratio}.${P1 === 'AaBb' && P2 === 'AaBb' ? ' Третий закон Менделя: гены наследуются независимо, 9 : 3 : 3 : 1.' : ''}`,
          `${P1} × ${P2}: әр ата-ана 4 түрлі гамета береді, барлығы 16 үйлесім. A - сары, a - жасыл; B - тегіс, b - бүріскен. Ажырау ${ratio}.${P1 === 'AaBb' && P2 === 'AaBb' ? ' Мендельдің 3-заңы: гендер тәуелсіз тұқым қуалайды, 9 : 3 : 3 : 1.' : ''}`,
        );
      else if (mode === 2)
        caption = u(
          `Incomplete dominance (night beauty): AA - red, Aa - pink, aa - white. The heterozygote is in between, so the phenotype ratio equals the genotype ratio: ${ratio}.`,
          `Неполное доминирование (ночная красавица): AA - красные, Aa - розовые, aa - белые. Гетерозигота промежуточная, поэтому расщепление по фенотипу совпадает с генотипом: ${ratio}.`,
          `Толымсыз доминанттылық (түнгі сұлу): AA - қызыл, Aa - қызғылт, aa - ақ. Гетерозигота аралық, сондықтан фенотип бойынша ажырау генотиппен бірдей: ${ratio}.`,
        );
      else
        caption = u(
          `Haemophilia is recessive and on the X chromosome: Xᴴ - normal, Xʰ - haemophilia. A son gets X only from his mother, so one Xʰ makes him ill; a daughter with XᴴXʰ is a healthy carrier.`,
          `Гемофилия рецессивна и сцеплена с X-хромосомой: Xᴴ - норма, Xʰ - гемофилия. Сын получает X только от матери, и одной Xʰ хватает, чтобы он болел; дочь XᴴXʰ - здоровая носительница.`,
          `Гемофилия рецессивті және X-хромосомаға тіркескен: Xᴴ - қалыпты, Xʰ - гемофилия. Ұл X-ті тек анасынан алады, бір Xʰ оның ауыруына жетеді; XᴴXʰ қызы - сау тасымалдаушы.`,
        );
      if (task) {
        let ok;
        if (task.ph) ok = used.map(([n]) => n / gg).sort((a, b) => b - a).join(':') === task.ph.join(':');
        else if (task.gt) ok = gts.length === 1 && gts[0][0] === task.gt;
        else ok = cnt[3] === 0 && cnt[4] === 1 && cnt[2] === 1;
        const modeName = tx([L('monohybrid', 'моногибридное', 'моногибридті'), L('dihybrid', 'дигибридное', 'дигибридті'), L('incomplete dominance', 'неполное доминирование', 'толымсыз доминанттылық'), L('sex-linked', 'сцепленное с полом', 'жынысқа тіркескен')][mode]);
        caption = taskCap(
          `(${modeName}) ${tx(task.text)}.`,
          ok,
          u(`Now ${P1} × ${P2} gives ${ratio}. Change the parents.`, `Сейчас ${P1} × ${P2} даёт ${ratio}. Меняй родителей.`, `Қазір ${P1} × ${P2} ${ratio} береді. Ата-аналарды өзгерт.`),
          u(`${P1} × ${P2} gives ${ratio}.`, `${P1} × ${P2} даёт ${ratio}.`, `${P1} × ${P2} ${ratio} береді.`),
        );
        return { svg: svg + taskBadge(ok, 180, 214), caption };
      }
      return { svg, caption };
    },
  },
