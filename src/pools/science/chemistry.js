// Химия: расчёты (молярная масса, количество вещества, массовая доля) и вопросы на знание.

import { pick, randomInt } from '../../core/random.js';
import { T } from '../bank.js';
import { CHEMISTRY_MORE } from './science-more.js';
import { L, ask, dec, n, poolQ, same, steps } from '../gen.js';
import { CHEMISTRY_MORE2 } from './science-more2.js';

const TIMES = '×';
const DIV = '÷';

/** Округлённые атомные массы, как в школьной таблице. */
export const ATOM = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 64 };

/** Вещества: формула по атомам. Сложность - по числу разных элементов и атомов. */
const SUBSTANCES = [
  [1, [['H', 2], ['O', 1]]],
  [1, [['C', 1], ['O', 2]]],
  [1, [['C', 1], ['H', 4]]],
  [1, [['N', 1], ['H', 3]]],
  [1, [['Mg', 1], ['O', 1]]],
  [1, [['Ca', 1], ['O', 1]]],
  [1, [['S', 1], ['O', 2]]],
  [1, [['Cu', 1], ['O', 1]]],
  [2, [['Na', 1], ['O', 1], ['H', 1]]],
  [2, [['H', 2], ['S', 1], ['O', 4]]],
  [2, [['Ca', 1], ['C', 1], ['O', 3]]],
  [2, [['H', 1], ['N', 1], ['O', 3]]],
  [2, [['Fe', 2], ['O', 3]]],
  [2, [['Al', 2], ['O', 3]]],
  [2, [['K', 1], ['O', 1], ['H', 1]]],
  [2, [['Cu', 1], ['S', 1], ['O', 4]]],
  [2, [['S', 1], ['O', 3]]],
];

const formula = (atoms) => atoms.map(([el, k]) => `${el}${k > 1 ? `<sub>${k}</sub>` : ''}`).join('');
const molar = (atoms) => atoms.reduce((sum, [el, k]) => sum + ATOM[el] * k, 0);
const massLine = (atoms) => atoms.map(([el, k]) => (k > 1 ? `${k} ${TIMES} ${n(ATOM[el])}` : n(ATOM[el]))).join(' + ');
const given = (atoms) => atoms.map(([el]) => `${el} = ${ATOM[el]}`).join(', ');

export function molarMass(ctx, d) {
  const { rng } = ctx;
  const level = d === 1 ? 1 : 2;
  const [, atoms] = pick(rng, SUBSTANCES.filter(([lvl]) => lvl === level));
  const M = molar(atoms);
  if (d < 3) {
    return poolQ('c.molar', d, {
      prompt: L(
        `Find the molar mass of ${formula(atoms)} in g/mol. Atomic masses: ${given(atoms)}.`,
        `Найди молярную массу ${formula(atoms)} в г/моль. Атомные массы: ${given(atoms)}.`,
        `${formula(atoms)} затының молярлық массасын г/моль-мен тап. Атомдық массалар: ${given(atoms)}.`,
      ),
      ex: steps(
        L('Add up the atomic masses of all the atoms in the formula.', 'Складываем атомные массы всех атомов в формуле.', 'Формуладағы барлық атомдардың атомдық массаларын қосамыз.'),
        same(`<i>M</i> = ${massLine(atoms)} = ${n(M)}`),
      ),
      ...ask(ctx, M, [atoms.reduce((s, [el]) => s + ATOM[el], 0), M + 16, M - 1, M + 2].filter((x) => x !== M)),
    });
  }
  // Сложность 3: массовая доля элемента. Берём вещества, где доля получается целым числом процентов.
  const [atomsW, el, percent] = pick(rng, [
    [[['Ca', 1], ['C', 1], ['O', 3]], 'Ca', 40],
    [[['Ca', 1], ['C', 1], ['O', 3]], 'O', 48],
    [[['S', 1], ['O', 3]], 'S', 40],
    [[['Mg', 1], ['O', 1]], 'Mg', 60],
    [[['Cu', 1], ['O', 1]], 'Cu', 80],
    [[['C', 1], ['H', 4]], 'C', 75],
    [[['S', 1], ['O', 2]], 'S', 50],
    [[['Fe', 2], ['O', 3]], 'Fe', 70],
    [[['Cu', 1], ['S', 1], ['O', 4]], 'Cu', 40],
    [[['Cu', 1], ['S', 1], ['O', 4]], 'S', 20],
  ]);
  const Mw = molar(atomsW);
  const part = atomsW.find(([e]) => e === el);
  const partMass = ATOM[el] * part[1];
  return poolQ('c.molar', d, {
    prompt: L(
      `Find the mass fraction (in percent) of ${el} in ${formula(atomsW)}. Atomic masses: ${given(atomsW)}.`,
      `Найди массовую долю (в процентах) элемента ${el} в ${formula(atomsW)}. Атомные массы: ${given(atomsW)}.`,
      `${formula(atomsW)} затындағы ${el} элементінің массалық үлесін (пайызбен) тап. Атомдық массалар: ${given(atomsW)}.`,
    ),
    ex: steps(
      same(`<i>M</i> = ${massLine(atomsW)} = ${n(Mw)}`),
      L(
        `The atoms of ${el} weigh ${partMass}: ${partMass} ${DIV} ${Mw} ${TIMES} 100 = ${percent}%.`,
        `На атомы ${el} приходится ${partMass}: ${partMass} ${DIV} ${Mw} ${TIMES} 100 = ${percent}%.`,
        `${el} атомдарының үлесіне ${partMass} келеді: ${partMass} ${DIV} ${Mw} ${TIMES} 100 = ${percent}%.`,
      ),
    ),
    ...ask(ctx, percent, [100 - percent, percent + 10, percent / 2, percent - 10].filter((x) => x !== percent && x > 0 && Number.isInteger(x))),
  });
}

export function moles(ctx, d) {
  const { rng } = ctx;
  const [, atoms] = pick(rng, SUBSTANCES.filter(([, list]) => Number.isInteger(molar(list))));
  const M = molar(atoms);
  if (d === 1) {
    const k = randomInt(rng, 2, 6);
    if (rng() < 0.5) {
      return poolQ('c.mole', d, {
        prompt: L(
          `What is the mass (in grams) of ${k} mol of ${formula(atoms)}? Its molar mass is ${M} g/mol.`,
          `Какова масса (в граммах) ${k} моль ${formula(atoms)}? Молярная масса вещества - ${M} г/моль.`,
          `${k} моль ${formula(atoms)} затының массасы (граммен) қандай? Заттың молярлық массасы - ${M} г/моль.`,
        ),
        ex: steps(same('<i>m</i> = <i>n</i> · <i>M</i>'), same(`<i>m</i> = ${k} ${TIMES} ${M} = ${n(k * M)}`)),
        ...ask(ctx, k * M, [M, k + M, k * M + M, M / k].filter((x) => x !== k * M && Number.isInteger(x))),
      });
    }
    return poolQ('c.mole', d, {
      prompt: L(
        `How many moles are there in ${n(k * M)} g of ${formula(atoms)}? Its molar mass is ${M} g/mol.`,
        `Сколько моль содержится в ${n(k * M)} г ${formula(atoms)}? Молярная масса вещества - ${M} г/моль.`,
        `${n(k * M)} г ${formula(atoms)} затында неше моль бар? Заттың молярлық массасы - ${M} г/моль.`,
      ),
      ex: steps(same('<i>n</i> = <i>m</i> / <i>M</i>'), same(`<i>n</i> = ${n(k * M)} ${DIV} ${M} = ${k}`)),
      ...ask(ctx, k, [k + 1, k - 1, k * 2, k + 2].filter((x) => x !== k && x > 0)),
    });
  }
  if (d === 2) {
    const k = pick(rng, [0.5, 2, 3, 4, 5, 10]);
    const V = Math.round(k * 224) / 10;
    return poolQ('c.mole', d, {
      prompt: L(
        `What volume (in litres) do ${dec(k).en} mol of a gas occupy at standard conditions? The molar volume is 22.4 L/mol.`,
        `Какой объём (в литрах) занимают ${dec(k).ru} моль газа при нормальных условиях? Молярный объём - 22,4 л/моль.`,
        `Қалыпты жағдайда ${dec(k).kk} моль газ қандай көлем (литрмен) алады? Молярлық көлем - 22,4 л/моль.`,
      ),
      ex: steps(
        same('<i>V</i> = <i>n</i> · <i>V</i><sub>m</sub>'),
        L(`V = ${dec(k).en} ${TIMES} 22.4 = ${dec(V).en}`, `V = ${dec(k).ru} ${TIMES} 22,4 = ${dec(V).ru}`, `V = ${dec(k).kk} ${TIMES} 22,4 = ${dec(V).kk}`),
      ),
      ...ask(ctx, V, [22.4, Math.round((22.4 / k) * 10) / 10, V + 22.4, V * 2].filter((x) => x !== V), { fmt: dec }),
    });
  }
  // Сложность 3: расчёт по уравнению реакции.
  const [eqn, fromName, toName, fromM, toM, ratio] = pick(rng, [
    ['2H<sub>2</sub> + O<sub>2</sub> = 2H<sub>2</sub>O', 'H<sub>2</sub>', 'H<sub>2</sub>O', 2, 18, 1],
    ['C + O<sub>2</sub> = CO<sub>2</sub>', 'C', 'CO<sub>2</sub>', 12, 44, 1],
    ['2Mg + O<sub>2</sub> = 2MgO', 'Mg', 'MgO', 24, 40, 1],
    ['S + O<sub>2</sub> = SO<sub>2</sub>', 'S', 'SO<sub>2</sub>', 32, 64, 1],
    ['CaCO<sub>3</sub> = CaO + CO<sub>2</sub>', 'CaCO<sub>3</sub>', 'CaO', 100, 56, 1],
    ['2Cu + O<sub>2</sub> = 2CuO', 'Cu', 'CuO', 64, 80, 1],
  ]);
  const k = randomInt(rng, 2, 5);
  const mass = k * fromM;
  const ans = k * ratio * toM;
  return poolQ('c.mole', d, {
    prompt: L(
      `By the equation ${eqn}, what mass (in grams) of ${toName} is formed from ${mass} g of ${fromName}? Molar masses: ${fromName} - ${fromM} g/mol, ${toName} - ${toM} g/mol.`,
      `По уравнению ${eqn} найди массу (в граммах) ${toName}, которая образуется из ${mass} г ${fromName}. Молярные массы: ${fromName} - ${fromM} г/моль, ${toName} - ${toM} г/моль.`,
      `${eqn} теңдеуі бойынша ${mass} г ${fromName} затынан түзілетін ${toName} массасын (граммен) тап. Молярлық массалар: ${fromName} - ${fromM} г/моль, ${toName} - ${toM} г/моль.`,
    ),
    ex: steps(
      L(`Amount of ${fromName}: ${mass} ${DIV} ${fromM} = ${k} mol.`, `Количество ${fromName}: ${mass} ${DIV} ${fromM} = ${k} моль.`, `${fromName} мөлшері: ${mass} ${DIV} ${fromM} = ${k} моль.`),
      L(
        `By the equation, the same amount of ${toName} is formed: ${k} mol.`,
        `По уравнению образуется столько же моль ${toName}: ${k} моль.`,
        `Теңдеу бойынша ${toName} да сонша моль түзіледі: ${k} моль.`,
      ),
      same(`<i>m</i> = ${k} ${TIMES} ${toM} = ${ans}`),
    ),
    ...ask(ctx, ans, [mass, mass + toM, k * fromM * 2, ans + toM, toM].filter((x) => x !== ans)),
  });
}

export const CHEMISTRY_THEORY = [
  [1, T('Какой химический символ у железа?', 'Темірдің химиялық таңбасы қандай?', 'What is the chemical symbol of iron?'),
    'Fe', ['F', 'Fr', 'I'],
    T('Железо - Fe (от латинского Ferrum). F - фтор, Fr - франций, I - иод.', 'Темір - Fe (латынша Ferrum). F - фтор, Fr - франций, I - иод.', 'Iron is Fe (from the Latin Ferrum). F is fluorine, Fr is francium, I is iodine.')],
  [1, T('Какая формула у поваренной соли?', 'Ас тұзының формуласы қандай?', 'What is the formula of table salt?'),
    'NaCl', ['KCl', 'NaOH', 'CaCl₂'],
    T('Поваренная соль - хлорид натрия NaCl.', 'Ас тұзы - натрий хлориді NaCl.', 'Table salt is sodium chloride, NaCl.')],
  [1, T('Какой газ поддерживает горение и необходим для дыхания?', 'Қай газ жануды қолдайды және тыныс алуға қажет?', 'Which gas supports burning and is needed for breathing?'),
    T('кислород', 'оттегі', 'oxygen'), [T('азот', 'азот', 'nitrogen'), T('углекислый газ', 'көмірқышқыл газы', 'carbon dioxide'), T('водород', 'сутегі', 'hydrogen')],
    T('Кислород O₂ поддерживает горение и участвует в дыхании. В воздухе его около 21%.', 'Оттегі O₂ жануды қолдайды және тыныс алуға қатысады. Ауада ол шамамен 21%.', 'Oxygen O₂ supports burning and takes part in breathing. It makes up about 21% of the air.')],
  [1, T('Какого газа больше всего в воздухе?', 'Ауада қай газ ең көп?', 'Which gas is the most abundant in the air?'),
    T('азота', 'азот', 'nitrogen'), [T('кислорода', 'оттегі', 'oxygen'), T('углекислого газа', 'көмірқышқыл газы', 'carbon dioxide'), T('аргона', 'аргон', 'argon')],
    T('В воздухе около 78% азота, 21% кислорода и около 1% остальных газов.', 'Ауада шамамен 78% азот, 21% оттегі және 1%-дай басқа газдар бар.', 'Air is about 78% nitrogen, 21% oxygen and about 1% other gases.')],
  [1, T('К какому классу веществ относится H₂SO₄?', 'H₂SO₄ қай заттар класына жатады?', 'To which class of compounds does H₂SO₄ belong?'),
    T('кислоты', 'қышқылдар', 'acids'), [T('основания', 'негіздер', 'bases'), T('соли', 'тұздар', 'salts'), T('оксиды', 'оксидтер', 'oxides')],
    T('H₂SO₄ - серная кислота: в её составе атомы водорода и кислотный остаток SO₄.', 'H₂SO₄ - күкірт қышқылы: құрамында сутегі атомдары мен SO₄ қышқыл қалдығы бар.', 'H₂SO₄ is sulfuric acid: it consists of hydrogen atoms and the acid residue SO₄.')],
  [1, T('К какому классу веществ относится NaOH?', 'NaOH қай заттар класына жатады?', 'To which class of compounds does NaOH belong?'),
    T('основания', 'негіздер', 'bases'), [T('кислоты', 'қышқылдар', 'acids'), T('соли', 'тұздар', 'salts'), T('оксиды', 'оксидтер', 'oxides')],
    T('NaOH - гидроксид натрия, растворимое основание (щёлочь): металл и группа OH.', 'NaOH - натрий гидроксиді, еритін негіз (сілті): металл және OH тобы.', 'NaOH is sodium hydroxide, a soluble base (alkali): a metal and the OH group.')],
  [2, T('Какую окраску приобретает лакмус в кислой среде?', 'Қышқыл ортада лакмус қандай түске боялады?', 'What colour does litmus turn in an acidic solution?'),
    T('красную', 'қызыл', 'red'), [T('синюю', 'көк', 'blue'), T('фиолетовую', 'күлгін', 'purple'), T('жёлтую', 'сары', 'yellow')],
    T('Лакмус в кислой среде красный, в щелочной - синий, в нейтральной - фиолетовый.', 'Лакмус қышқыл ортада қызыл, сілтілік ортада көк, бейтарап ортада күлгін.', 'Litmus is red in acid, blue in alkali and purple in a neutral solution.')],
  [2, T('Сколько электронов на внешнем уровне у атома натрия (порядковый номер 11)?', 'Натрий атомының (реттік нөмірі 11) сыртқы деңгейінде неше электрон бар?', 'How many electrons are in the outer shell of a sodium atom (atomic number 11)?'),
    '1', ['2', '3', '11'],
    T('Электроны натрия распределены по уровням 2, 8, 1. На внешнем уровне один электрон - это номер группы.', 'Натрий электрондары деңгейлерге 2, 8, 1 болып бөлінген. Сыртқы деңгейде бір электрон - бұл топ нөмірі.', 'The electrons of sodium are arranged 2, 8, 1. There is one electron in the outer shell - the same as the group number.')],
  [2, T('Как называется реакция, в которой из одного сложного вещества образуется несколько более простых?', 'Бір күрделі заттан бірнеше қарапайым зат түзілетін реакция қалай аталады?', 'What is the name of a reaction in which one compound breaks into several simpler substances?'),
    T('разложения', 'айырылу', 'decomposition'), [T('соединения', 'қосылу', 'combination'), T('замещения', 'орынбасу', 'substitution'), T('обмена', 'алмасу', 'exchange')],
    T('Реакция разложения: AB → A + B. Пример: CaCO₃ = CaO + CO₂.', 'Айырылу реакциясы: AB → A + B. Мысалы: CaCO₃ = CaO + CO₂.', 'Decomposition: AB → A + B. Example: CaCO₃ = CaO + CO₂.')],
  [2, T('Что образуется при взаимодействии кислоты с основанием?', 'Қышқыл негізбен әрекеттескенде не түзіледі?', 'What is formed when an acid reacts with a base?'),
    T('соль и вода', 'тұз және су', 'a salt and water'), [T('оксид и водород', 'оксид және сутегі', 'an oxide and hydrogen'), T('кислота и металл', 'қышқыл және металл', 'an acid and a metal'), T('только вода', 'тек су', 'only water')],
    T('Реакция нейтрализации: кислота + основание = соль + вода. Пример: HCl + NaOH = NaCl + H₂O.', 'Бейтараптану реакциясы: қышқыл + негіз = тұз + су. Мысалы: HCl + NaOH = NaCl + H₂O.', 'Neutralisation: acid + base = salt + water. Example: HCl + NaOH = NaCl + H₂O.')],
  [2, T('Чему равна валентность кислорода в большинстве соединений?', 'Көптеген қосылыстарда оттегінің валенттілігі нешеге тең?', 'What is the valency of oxygen in most compounds?'),
    'II', ['I', 'III', 'IV'],
    T('Кислород в соединениях обычно двухвалентен: H₂O, CO₂, CaO.', 'Оттегі қосылыстарда әдетте екі валентті: H₂O, CO₂, CaO.', 'Oxygen is usually divalent in compounds: H₂O, CO₂, CaO.')],
  [2, T('Какое из веществ - простое?', 'Қай зат жай зат болып табылады?', 'Which of these is an element (a simple substance)?'),
    'O₂', ['H₂O', 'CO₂', 'NaCl'],
    T('Простое вещество состоит из атомов одного элемента. O₂ - только кислород, остальные - соединения.', 'Жай зат бір элементтің атомдарынан тұрады. O₂ - тек оттегі, қалғандары - қосылыстар.', 'A simple substance consists of atoms of one element. O₂ is only oxygen; the others are compounds.')],
  [3, T('Какой тип химической связи в молекуле воды?', 'Су молекуласындағы химиялық байланыстың типі қандай?', 'What type of chemical bond is in a water molecule?'),
    T('ковалентная полярная', 'ковалентті полюсті', 'polar covalent'), [T('ионная', 'иондық', 'ionic'), T('ковалентная неполярная', 'ковалентті полюссіз', 'non-polar covalent'), T('металлическая', 'металдық', 'metallic')],
    T('Связь между разными неметаллами (H и O) - ковалентная полярная: электроны смещены к кислороду.', 'Әртүрлі бейметалдар (H және O) арасындағы байланыс - ковалентті полюсті: электрондар оттегіге ығысқан.', 'A bond between different non-metals (H and O) is polar covalent: the electrons are shifted towards oxygen.')],
  [3, T('Как меняются металлические свойства элементов в периоде слева направо?', 'Периодта солдан оңға қарай элементтердің металдық қасиеттері қалай өзгереді?', 'How do the metallic properties of elements change from left to right across a period?'),
    T('ослабевают', 'әлсірейді', 'they weaken'), [T('усиливаются', 'күшейеді', 'they strengthen'), T('не меняются', 'өзгермейді', 'they do not change'), T('сначала усиливаются, затем ослабевают', 'алдымен күшейіп, сосын әлсірейді', 'they first strengthen, then weaken')],
    T('В периоде заряд ядра растёт, электроны удерживаются сильнее, поэтому металлические свойства ослабевают.', 'Периодта ядро заряды артады, электрондар күштірек ұсталады, сондықтан металдық қасиеттер әлсірейді.', 'Across a period the nuclear charge grows and electrons are held more tightly, so metallic properties weaken.')],
  [3, T('Какое вещество является окислителем в реакции 2Mg + O₂ = 2MgO?', '2Mg + O₂ = 2MgO реакциясында қай зат тотықтырғыш болып табылады?', 'Which substance is the oxidising agent in the reaction 2Mg + O₂ = 2MgO?'),
    'O₂', ['Mg', 'MgO', T('окислителя нет', 'тотықтырғыш жоқ', 'there is none')],
    T('Кислород принимает электроны (его степень окисления меняется от 0 до −2), значит он окислитель. Магний отдаёт электроны - он восстановитель.', 'Оттегі электрондарды қабылдайды (тотығу дәрежесі 0-ден −2-ге өзгереді), демек ол - тотықтырғыш. Магний электрон береді - ол тотықсыздандырғыш.', 'Oxygen gains electrons (its oxidation state changes from 0 to −2), so it is the oxidising agent. Magnesium loses electrons - it is the reducing agent.')],
  [3, T('Какая среда у раствора с pH = 3?', 'pH = 3 болатын ерітіндінің ортасы қандай?', 'What kind of solution has pH = 3?'),
    T('кислая', 'қышқыл', 'acidic'), [T('щелочная', 'сілтілік', 'alkaline'), T('нейтральная', 'бейтарап', 'neutral'), T('слабощелочная', 'әлсіз сілтілік', 'slightly alkaline')],
    T('pH меньше 7 - кислая среда, pH = 7 - нейтральная, pH больше 7 - щелочная.', 'pH 7-ден кіші - қышқыл орта, pH = 7 - бейтарап, pH 7-ден үлкен - сілтілік.', 'pH below 7 is acidic, pH = 7 is neutral, pH above 7 is alkaline.')],
];

// Дополнительные вопросы - в science-more.js.
CHEMISTRY_THEORY.push(...CHEMISTRY_MORE);
CHEMISTRY_THEORY.push(...CHEMISTRY_MORE2);
