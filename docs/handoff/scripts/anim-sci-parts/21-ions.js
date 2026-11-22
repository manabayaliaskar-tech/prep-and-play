// Формулы по зарядам ионов: метод «крест-накрест», названия на трёх языках, растворимость, задания.
// Катион: [формула, заряд, многоатомный, en, ru (род. падеж), kk]
const CATS = [
  ['Na', 1, 0, 'sodium', 'натрия', 'натрий'],
  ['K', 1, 0, 'potassium', 'калия', 'калий'],
  ['NH4', 1, 1, 'ammonium', 'аммония', 'аммоний'],
  ['Ag', 1, 0, 'silver', 'серебра', 'күміс'],
  ['Ca', 2, 0, 'calcium', 'кальция', 'кальций'],
  ['Mg', 2, 0, 'magnesium', 'магния', 'магний'],
  ['Ba', 2, 0, 'barium', 'бария', 'барий'],
  ['Zn', 2, 0, 'zinc', 'цинка', 'мырыш'],
  ['Cu', 2, 0, 'copper(II)', 'меди(II)', 'мыс(II)'],
  ['Fe', 2, 0, 'iron(II)', 'железа(II)', 'темір(II)'],
  ['Fe', 3, 0, 'iron(III)', 'железа(III)', 'темір(III)'],
  ['Al', 3, 0, 'aluminium', 'алюминия', 'алюминий'],
];
// Анион: [формула, заряд, многоатомный, en, ru, kk]
const ANS = [
  ['Cl', 1, 0, 'chloride', 'хлорид', 'хлориді'],
  ['Br', 1, 0, 'bromide', 'бромид', 'бромиді'],
  ['I', 1, 0, 'iodide', 'иодид', 'иодиді'],
  ['OH', 1, 1, 'hydroxide', 'гидроксид', 'гидроксиді'],
  ['NO3', 1, 1, 'nitrate', 'нитрат', 'нитраты'],
  ['SO4', 2, 1, 'sulfate', 'сульфат', 'сульфаты'],
  ['CO3', 2, 1, 'carbonate', 'карбонат', 'карбонаты'],
  ['PO4', 3, 1, 'phosphate', 'фосфат', 'фосфаты'],
  ['O', 2, 0, 'oxide', 'оксид', 'оксиді'],
];
// Растворимость в воде (строки - анионы, столбцы - катионы как в CATS): Р, М, Н, «-» - не существует или разлагается водой, «о» - оксид (в таблице нет).
const SOLT = [
  'РРРНРРРРРРРР', // Cl⁻
  'РРРНРРРРРРРР', // Br⁻
  'РРРНРРРР-Р-Р', // I⁻
  'РРР-МНРНННН'.padEnd(12, 'Н'), // OH⁻
  'РРРРРРРРРРРР', // NO₃⁻
  'РРРММРНРРРРР', // SO₄²⁻
  'РРРННМНН-Н--', // CO₃²⁻
  'РРРННННННННН', // PO₄³⁻
  'оо-ооооооооо', // O²⁻
];
const ionSym = (f, q, s) => `${subF(f)}${q > 1 ? sup(q) : ''}${s}`;
const ionShow = (list, s) => (i) => {
  const it = list[clamp(i, 0, list.length - 1)];
  return ionSym(it[0], it[1], s);
};
const ionFormula = (c, a) => {
  const g = gcd(c[1], a[1]);
  const nc = a[1] / g;
  const na = c[1] / g;
  const part = (f, n, poly) => (n === 1 ? subF(f) : poly ? `(${subF(f)})${sub(n)}` : `${subF(f)}${sub(n)}`);
  return { nc, na, f: part(c[0], nc, c[2]) + part(a[0], na, a[2]) };
};
const ionName = (c, a) => u(`${c[3]} ${a[3]}`, `${a[4]} ${c[4]}`, `${c[5]} ${a[5]}`);
const SOL_NAME = { Р: L('soluble', 'растворимо', 'ериді'), М: L('slightly soluble', 'малорастворимо', 'аз ериді'), Н: L('insoluble (precipitate)', 'нерастворимо (осадок)', 'ерімейді (тұнба)'), '-': L('does not exist in water', 'в воде не существует', 'суда болмайды'), о: L('an oxide: not in the table', 'оксид: в таблице растворимости нет', 'оксид: ерігіштік кестесінде жоқ') };
const ionTask = () => {
  if (Math.random() < 0.6) {
    let c;
    let a;
    do {
      c = ri(0, CATS.length - 1);
      a = ri(0, ANS.length - 1);
    } while (SOLT[a][c] === '-' || (CATS[c][0] === 'NH4' && ANS[a][0] === 'O'));
    return { type: 0, c, a };
  }
  return { type: 1, c: pick([3, 4, 6, 9, 10, 11]) };
};

//@@SCENE
  ions: {
    title: L('Formulas from ion charges', 'Формулы по зарядам ионов', 'Иондар зарядтары бойынша формула'),
    intro: L('A compound is neutral: the plus charges equal the minus charges. Cross the charges over to get the indices.', 'Вещество электронейтрально: сумма плюсов равна сумме минусов. Заряды «крест-накрест» становятся индексами.', 'Зат электрбейтарап: оң зарядтар теріс зарядтарға тең. Зарядтар «айқастыра» индекстерге айналады.'),
    sliders: [
      { id: 'c', label: L('cation', 'катион', 'катион'), min: 0, max: CATS.length - 1, step: 1, value: 4, show: ionShow(CATS, '⁺'), hidden: (v, st) => st.m === 2 && st.task.type === 1 },
      { id: 'a', label: L('anion', 'анион', 'анион'), min: 0, max: ANS.length - 1, step: 1, value: 7, show: ionShow(ANS, '⁻') },
    ],
    buttons: [L('Formula', 'Формула', 'Формула'), L('Solubility', 'Растворимость', 'Ерігіштік'), TASK],
    state: () => ({ m: 0, task: null }),
    pressed: (i, v, st) => i === st.m,
    onButton(i, st) {
      st.m = i;
      if (i < 2) return null;
      st.task = ionTask();
      return st.task.type === 1 ? { c: st.task.c, a: 0 } : { c: 0, a: 0 };
    },
    draw(v, step, st) {
      const ci = clamp(Math.round(v.c), 0, CATS.length - 1);
      const ai = clamp(Math.round(v.a), 0, ANS.length - 1);
      const c = CATS[ci];
      const a = ANS[ai];
      const sol = SOLT[ai][ci];
      const exists = !(c[0] === 'NH4' && a[0] === 'O');
      const { nc, na, f } = ionFormula(c, a);
      const cs = ionSym(c[0], c[1], '⁺');
      const as = ionSym(a[0], a[1], '⁻');
      let svg;
      if (st.m === 1) {
        // Строка таблицы растворимости для выбранного катиона и столбец для аниона.
        const cell = (x, y, s, on) => `<rect x="${x}" y="${y}" width="30" height="16" rx="3" class="ex-fill ${s === 'Р' ? 'exc-g' : s === 'М' ? 'exc-y' : s === 'Н' ? 'exc-r' : 'exc-m'}" style="opacity:${on ? 0.9 : 0.3}"/>${tt(x + 15, y + 12, s === 'о' ? '' : tx(L(s === 'Р' ? 'S' : s === 'М' ? 'Sl' : s === 'Н' ? 'I' : '-', s, s === 'Р' ? 'Е' : s === 'М' ? 'А' : s === 'Н' ? 'Ж' : '-')), 'exs-s tc')}`;
        let rows = '';
        ANS.forEach((an, j) => {
          const y = 22 + j * 19;
          rows += `${tt(52, y + 12, ionSym(an[0], an[1], '⁻'), `exs-t ex-end${j === ai ? ' tc exc-b' : ''}`)}${cell(58, y, SOLT[j][ci], j === ai)}`;
        });
        svg = `${tt(73, 14, cs, 'exs-t tc exc-o')}${rows}
          ${box(104, 22, 212, 94)}${tt(210, 48, exists ? f : '-', 'ex-big')}${tt(210, 68, exists ? ionName(c, a) : u('no such compound', 'такого вещества нет', 'мұндай зат жоқ'), 'exs-t')}${tt(210, 90, tx(SOL_NAME[exists ? sol : '-']), `exs-t tc ${sol === 'Р' ? 'exc-g' : sol === 'М' ? 'exc-o' : sol === 'Н' ? 'exc-r' : 'exc-m'}`)}
          ${tt(210, 106, u('S - soluble, Sl - slightly, I - insoluble', 'Р - растворимо, М - мало, Н - нерастворимо', 'Е - ериді, А - аз ериді, Ж - ерімейді'), 'exs-s')}
          ${sol === 'Н' ? `${box(104, 126, 212, 40)}${tt(210, 142, u('Precipitate! Mix two soluble salts', 'Осадок! Сливая растворы двух солей,', 'Тұнба! Екі тұз ерітіндісін араластырып,'), 'exs-s')}${tt(210, 156, u('and it falls out - an exchange reaction.', 'его можно получить - реакция обмена.', 'оны алуға болады - алмасу реакциясы.'), 'exs-s')}` : ''}`;
      } else {
        const tile = (x, y, txt, cls) => `<rect x="${x}" y="${y}" width="40" height="30" rx="8" class="ex-fill ${cls}"/>${tt(x + 20, y + 20, txt, 'exs-t exs-on')}`;
        const cat = Array.from({ length: nc }, (_, i) => tile(18 + i * 46, 122, cs, 'exc-o')).join('');
        const an = Array.from({ length: na }, (_, i) => tile(18 + i * 46, 160, as, 'exc-b')).join('');
        const part = (ff, n, poly) => (n === 1 ? subF(ff) : poly ? `(${subF(ff)})${sub(n)}` : `${subF(ff)}${sub(n)}`);
        const g2 = gcd(c[1], a[1]);
        svg = `${tt(80, 34, subF(c[0]), 'ex-big ex-end')}${tt(83, 20, `${sup(c[1])}⁺`, 'exs-m ex-start tc exc-o')}${tt(178, 34, subF(a[0]), 'ex-big ex-end')}${tt(181, 20, `${sup(a[1])}⁻`, 'exs-m ex-start tc exc-b')}
          <path class="ex-stroke exc-o" style="stroke-width:1.5" d="M90 26 C120 40 160 60 182 80"/><path class="ex-stroke exc-b" style="stroke-width:1.5" d="M188 26 C150 40 110 60 84 80"/>
          ${tt(80, 98, part(c[0], c[1] === a[1] ? 1 : a[1], c[2]), 'exs-h ex-end')}${tt(178, 98, part(a[0], c[1] === a[1] ? 1 : c[1], a[2]), 'exs-h ex-end')}${tt(130, 114, g2 > 1 ? u(`equal charges: ÷ ${g2} → index 1`, `заряды равны: сокращаем на ${g2}`, `зарядтар тең: ${g2}-ге қысқартамыз`) : u(`LCM = ${c[1] * a[1]}`, `НОК = ${c[1] * a[1]}`, `ЕКОЕ = ${c[1] * a[1]}`), 'exs-s')}
          ${cat}${an}${tt(18, 208, `(+${c[1]})·${nc} + (−${a[1]})·${na} = 0`, 'exs-t ex-start')}
          ${box(204, 40, 112, 96)}${tt(260, 76, exists ? f : '-', 'ex-big')}${tt(260, 96, exists ? ionName(c, a) : u('does not exist', 'не существует', 'жоқ'), 'exs-s')}${tt(260, 124, tx(SOL_NAME[exists ? sol : '-']), 'exs-s')}`;
      }
      let caption = exists
        ? u(
            `${cs} and ${as}: charges ${c[1]} and ${a[1]}, their least common multiple is ${(c[1] * a[1]) / gcd(c[1], a[1])}, so ${nc} × (+${c[1]}) and ${na} × (−${a[1]}) cancel out. ${f} - ${ionName(c, a)}; ${tx(SOL_NAME[sol])}.${a[2] && na > 1 ? ' A complex ion goes in brackets.' : ''}`,
            `${cs} и ${as}: заряды ${c[1]} и ${a[1]}, их наименьшее общее кратное ${(c[1] * a[1]) / gcd(c[1], a[1])}, поэтому ${nc} × (+${c[1]}) и ${na} × (−${a[1]}) уравновешиваются. ${f} - ${ionName(c, a)}; ${tx(SOL_NAME[sol])}.${(a[2] && na > 1) || (c[2] && nc > 1) ? ' Сложный ион берём в скобки.' : ''}`,
            `${cs} және ${as}: зарядтары ${c[1]} мен ${a[1]}, ең кіші ортақ еселігі ${(c[1] * a[1]) / gcd(c[1], a[1])}, сондықтан ${nc} × (+${c[1]}) пен ${na} × (−${a[1]}) теңеседі. ${f} - ${ionName(c, a)}; ${tx(SOL_NAME[sol])}.${(a[2] && na > 1) || (c[2] && nc > 1) ? ' Күрделі ионды жақшаға аламыз.' : ''}`,
          )
        : u('NH₄⁺ does not form an oxide: ammonium only exists in salts and in ammonia water.', 'NH₄⁺ не образует оксида: аммоний бывает только в солях и в растворе аммиака.', 'NH₄⁺ оксид түзбейді: аммоний тек тұздарда және аммиак ерітіндісінде болады.');
      if (st.m === 2) {
        const q = st.task;
        let ok;
        let goal;
        let done;
        if (q.type === 0) {
          const tc = CATS[q.c];
          const ta = ANS[q.a];
          ok = ci === q.c && ai === q.a;
          goal = u(`build the formula of ${ionName(tc, ta)}: choose the ions.`, `составь формулу: ${ionName(tc, ta)}. Выбери ионы.`, `формуласын құр: ${ionName(tc, ta)}. Иондарды таңда.`);
          done = `${ionFormula(tc, ta).f}: ${ionSym(tc[0], tc[1], '⁺')} + ${ionSym(ta[0], ta[1], '⁻')}.`;
        } else {
          const tc = CATS[q.c];
          ok = sol === 'Н';
          goal = u(`find an anion that gives an insoluble compound (a precipitate) with ${ionSym(tc[0], tc[1], '⁺')}.`, `найди анион, который даёт с ${ionSym(tc[0], tc[1], '⁺')} нерастворимое вещество (осадок).`, `${ionSym(tc[0], tc[1], '⁺')}-мен ерімейтін зат (тұнба) беретін анионды тап.`);
          done = u(`${f} is insoluble.`, `${f} не растворяется.`, `${f} ерімейді.`);
        }
        caption = taskCap(goal, ok, u(`Now: ${exists ? f : '-'}, ${tx(SOL_NAME[exists ? sol : '-'])}.`, `Сейчас: ${exists ? f : '-'}, ${tx(SOL_NAME[exists ? sol : '-'])}.`, `Қазір: ${exists ? f : '-'}, ${tx(SOL_NAME[exists ? sol : '-'])}.`), done);
        return { svg: svg + taskBadge(ok, 316, 14), caption };
      }
      return { svg, caption };
    },
  },
