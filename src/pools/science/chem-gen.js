// Химия: генераторы по таблице Менделеева и по составлению формул солей, оксидов и оснований.
// Ключ сложности - 1…3.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, ask, n, plural, poolQ, same, steps } from '../gen.js';
import { pairPrompt, tfQ } from '../tf.js';

// Z|символ|en|ru|kk|масса|группа главной подгруппы (0 - побочная)|период|тип (m - металл, n - неметалл, g - благородный газ)
const ELEMENTS_TEXT = `
1|H|hydrogen|водород|сутегі|1|1|1|n
2|He|helium|гелий|гелий|4|8|1|g
3|Li|lithium|литий|литий|7|1|2|m
4|Be|beryllium|бериллий|бериллий|9|2|2|m
5|B|boron|бор|бор|11|3|2|n
6|C|carbon|углерод|көміртек|12|4|2|n
7|N|nitrogen|азот|азот|14|5|2|n
8|O|oxygen|кислород|оттегі|16|6|2|n
9|F|fluorine|фтор|фтор|19|7|2|n
10|Ne|neon|неон|неон|20|8|2|g
11|Na|sodium|натрий|натрий|23|1|3|m
12|Mg|magnesium|магний|магний|24|2|3|m
13|Al|aluminium|алюминий|алюминий|27|3|3|m
14|Si|silicon|кремний|кремний|28|4|3|n
15|P|phosphorus|фосфор|фосфор|31|5|3|n
16|S|sulfur|сера|күкірт|32|6|3|n
17|Cl|chlorine|хлор|хлор|35.5|7|3|n
18|Ar|argon|аргон|аргон|40|8|3|g
19|K|potassium|калий|калий|39|1|4|m
20|Ca|calcium|кальций|кальций|40|2|4|m
22|Ti|titanium|титан|титан|48|0|4|m
24|Cr|chromium|хром|хром|52|0|4|m
25|Mn|manganese|марганец|марганец|55|0|4|m
26|Fe|iron|железо|темір|56|0|4|m
28|Ni|nickel|никель|никель|59|0|4|m
29|Cu|copper|медь|мыс|64|0|4|m
30|Zn|zinc|цинк|мырыш|65|0|4|m
35|Br|bromine|бром|бром|80|7|4|n
36|Kr|krypton|криптон|криптон|84|8|4|g
47|Ag|silver|серебро|күміс|108|0|5|m
50|Sn|tin|олово|қалайы|119|4|5|m
53|I|iodine|иод|йод|127|7|5|n
56|Ba|barium|барий|барий|137|2|6|m
78|Pt|platinum|платина|платина|195|0|6|m
79|Au|gold|золото|алтын|197|0|6|m
80|Hg|mercury|ртуть|сынап|201|0|6|m
82|Pb|lead|свинец|қорғасын|207|4|6|m
`;

export const ELEMENTS = ELEMENTS_TEXT.trim()
  .split('\n')
  .map((line) => {
    const [z, sym, en, ru, kk, mass, group, period, type] = line.split('|');
    return { z: Number(z), sym, name: L(en, ru, kk), mass: Number(mass), group: Number(group), period: Number(period), type };
  });
const BY_SYM = new Map(ELEMENTS.map((e) => [e.sym, e]));
const cap = (s) => s[0].toUpperCase() + s.slice(1);

function mcOf(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
}

/** Элементы, доступные на сложности: 1 - первые 20, 2 - плюс известные металлы, 3 - все. */
const elementsFor = (d) => ELEMENTS.filter((e) => (d === 1 ? e.z <= 20 : d === 2 ? e.z <= 30 || ['Ag', 'Au', 'Hg', 'Pb', 'Sn', 'I'].includes(e.sym) : true));

export function elementsMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    const pool = elementsFor(d);
    const modes = d === 1 ? ['sym', 'name', 'z', 'metal'] : d === 2 ? ['sym', 'name', 'z', 'period', 'outer', 'metal'] : ['sym', 'z', 'period', 'outer', 'neutrons', 'protons'];
    for (let attempt = 0; attempt < 12; attempt++) {
      const mode = pick(rng, modes);
      const e = pick(rng, pool);
      const others = shuffle(pool.filter((x) => x !== e), rng);
      let q;
      if (mode === 'sym' || mode === 'name') {
        // Ловушки для символа - элементы на ту же букву, их легко спутать.
        const similar = [...others.filter((x) => x.sym[0] === e.sym[0]), ...others.filter((x) => x.sym[0] !== e.sym[0])].slice(0, 3);
        const ex = L(`${cap(e.name.en)} - ${e.sym}, atomic number ${e.z}.`, `${cap(e.name.ru)} - ${e.sym}, порядковый номер ${e.z}.`, `${cap(e.name.kk)} - ${e.sym}, реттік нөмірі ${e.z}.`);
        q =
          mode === 'sym'
            ? poolQ(topic, d, { kind: 'text', prompt: L(`What is the chemical symbol of ${e.name.en}?`, `Какой химический символ у элемента «${e.name.ru}»?`, `«${e.name.kk}» элементінің химиялық таңбасы қандай?`), ex, mc: mcOf(rng, e.sym, similar.map((x) => x.sym)) })
            : poolQ(topic, d, { kind: 'text', prompt: L(`Which element has the symbol ${e.sym}?`, `Какой элемент обозначается символом ${e.sym}?`, `${e.sym} таңбасы қай элементті білдіреді?`), ex, mc: mcOf(rng, cap(e.name.en) === e.name.en ? e.name : L(cap(e.name.en), cap(e.name.ru), cap(e.name.kk)), similar.map((x) => L(cap(x.name.en), cap(x.name.ru), cap(x.name.kk)))) });
      } else if (mode === 'z' || mode === 'protons') {
        const wrong = [e.z + 1, e.z - 1, e.z + 2, Math.round(e.mass)].filter((x) => x > 0 && x !== e.z);
        const prompt =
          mode === 'z'
            ? L(`What is the atomic number of ${e.name.en} (${e.sym})?`, `Какой порядковый номер у элемента ${e.sym} (${e.name.ru})?`, `${e.sym} (${e.name.kk}) элементінің реттік нөмірі қандай?`)
            : L(`How many protons are there in an atom of ${e.sym}?`, `Сколько протонов в атоме ${e.sym} (${e.name.ru})?`, `${e.sym} (${e.name.kk}) атомында неше протон бар?`);
        q = poolQ(topic, d, {
          prompt,
          ex: steps(L(`The number of protons equals the atomic number: ${e.sym} has Z = ${e.z}.`, `Число протонов равно порядковому номеру: у ${e.sym} Z = ${e.z}.`, `Протон саны реттік нөмірге тең: ${e.sym} үшін Z = ${e.z}.`)),
          ...ask(ctx, e.z, [...new Set(wrong)].slice(0, 3), { spr: 0.25 }),
        });
      } else if (mode === 'neutrons') {
        if (!Number.isInteger(e.mass)) continue;
        const N = e.mass - e.z;
        q = poolQ(topic, d, {
          prompt: L(`How many neutrons are there in the nucleus of ${e.sym}-${e.mass} (Z = ${e.z})?`, `Сколько нейтронов в ядре атома ${e.sym}-${e.mass} (Z = ${e.z})?`, `${e.sym}-${e.mass} атомының ядросында неше нейтрон бар (Z = ${e.z})?`),
          ex: steps(L('Neutrons = mass number − atomic number.', 'Число нейтронов = массовое число − порядковый номер.', 'Нейтрон саны = массалық сан − реттік нөмір.'), same(`N = ${e.mass} − ${e.z} = ${N}`)),
          ...ask(ctx, N, [e.z, e.mass, N + 1, N - 1].filter((x) => x !== N && x > 0), { spr: 0.3 }),
        });
      } else if (mode === 'period') {
        const wrong = shuffle([1, 2, 3, 4, 5, 6, 7].filter((p) => p !== e.period), rng).slice(0, 3);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`In which period of the periodic table is ${e.sym} (${e.name.en})?`, `В каком периоде таблицы Менделеева находится ${e.sym} (${e.name.ru})?`, `${e.sym} (${e.name.kk}) Менделеев кестесінің қай периодында орналасқан?`),
          ex: L(`${e.sym} is in period ${e.period}: its atom has ${e.period} electron shells.`, `${e.sym} - в ${e.period}-м периоде: у атома ${e.period} ${plural(e.period, 'электронный слой', 'электронных слоя', 'электронных слоёв')}.`, `${e.sym} - ${e.period}-периодта: атомында ${e.period} электрон қабаты бар.`),
          mc: mcOf(rng, String(e.period), wrong.map(String)),
        });
      } else if (mode === 'outer') {
        if (!e.group || e.sym === 'He') continue;
        const wrong = shuffle([1, 2, 3, 4, 5, 6, 7, 8].filter((g) => g !== e.group), rng).slice(0, 3);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`How many electrons are in the outer shell of ${e.sym} (${e.name.en})?`, `Сколько электронов на внешнем слое атома ${e.sym} (${e.name.ru})?`, `${e.sym} (${e.name.kk}) атомының сыртқы қабатында неше электрон бар?`),
          ex: L(`For main-group elements the number of outer electrons equals the group number: ${e.sym} is in group ${e.group}.`, `У элементов главных подгрупп число внешних электронов равно номеру группы: ${e.sym} - в ${e.group}-й группе.`, `Негізгі топша элементтерінде сыртқы электрон саны топ нөміріне тең: ${e.sym} - ${e.group}-топта.`),
          mc: mcOf(rng, String(e.group), wrong.map(String)),
        });
      } else {
        // Металл среди неметаллов или неметалл среди металлов.
        const wantMetal = rng() < 0.5;
        const right = pick(rng, pool.filter((x) => (wantMetal ? x.type === 'm' : x.type === 'n')));
        const wrong = shuffle(pool.filter((x) => (wantMetal ? x.type !== 'm' : x.type === 'm')), rng).slice(0, 3);
        const label = (x) => L(`${x.sym} (${x.name.en})`, `${x.sym} (${x.name.ru})`, `${x.sym} (${x.name.kk})`);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: wantMetal ? L('Which of these elements is a metal?', 'Какой из этих элементов - металл?', 'Бұл элементтердің қайсысы металл?') : L('Which of these elements is a non-metal?', 'Какой из этих элементов - неметалл?', 'Бұл элементтердің қайсысы бейметалл?'),
          ex: wantMetal
            ? L(`${right.sym} (${right.name.en}) is a metal; the others are non-metals or noble gases.`, `${right.sym} (${right.name.ru}) - металл, остальные - неметаллы или благородные газы.`, `${right.sym} (${right.name.kk}) - металл, қалғандары - бейметалдар немесе инертті газдар.`)
            : L(`${right.sym} (${right.name.en}) is a non-metal; the others are metals.`, `${right.sym} (${right.name.ru}) - неметалл, остальные - металлы.`, `${right.sym} (${right.name.kk}) - бейметалл, қалғандары - металдар.`),
          mc: mcOf(rng, label(right), wrong.map(label)),
        });
        q.id = `${topic}:metal:${hashString([right, ...wrong].map((x) => x.sym).sort().join())}`;
        if (!ctx.used?.has(q.id) || attempt > 9) return q;
        continue;
      }
      q.id = `${topic}:${mode}:${e.sym}:${q.type}`;
      if (!ctx.used?.has(q.id) || attempt > 9) return q;
    }
    return null;
  };
}

// ---------- Формулы и названия соединений ----------

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (k) => (k > 1 ? String(k).replace(/\d/g, (c) => SUB[c]) : '');

/** Катионы: символ|заряд|en|ru (род. падеж)|kk. */
const CATIONS = [
  ['Na', 1, 'sodium', 'натрия', 'натрий'],
  ['K', 1, 'potassium', 'калия', 'калий'],
  ['Ag', 1, 'silver', 'серебра', 'күміс'],
  ['Li', 1, 'lithium', 'лития', 'литий'],
  ['Ca', 2, 'calcium', 'кальция', 'кальций'],
  ['Mg', 2, 'magnesium', 'магния', 'магний'],
  ['Ba', 2, 'barium', 'бария', 'барий'],
  ['Zn', 2, 'zinc', 'цинка', 'мырыш'],
  ['Cu', 2, 'copper(II)', 'меди(II)', 'мыс(II)'],
  ['Fe', 2, 'iron(II)', 'железа(II)', 'темір(II)'],
  ['Fe', 3, 'iron(III)', 'железа(III)', 'темір(III)'],
  ['Al', 3, 'aluminium', 'алюминия', 'алюминий'],
];

/** Анионы: формула|атомы|заряд|en|ru|kk (с притяжательным окончанием). */
const ANIONS = [
  ['Cl', [['Cl', 1]], 1, 'chloride', 'хлорид', 'хлориді'],
  ['O', [['O', 1]], 2, 'oxide', 'оксид', 'оксиді'],
  ['S', [['S', 1]], 2, 'sulfide', 'сульфид', 'сульфиді'],
  ['OH', [['O', 1], ['H', 1]], 1, 'hydroxide', 'гидроксид', 'гидроксиді'],
  ['NO₃', [['N', 1], ['O', 3]], 1, 'nitrate', 'нитрат', 'нитраты'],
  ['SO₄', [['S', 1], ['O', 4]], 2, 'sulfate', 'сульфат', 'сульфаты'],
  ['CO₃', [['C', 1], ['O', 3]], 2, 'carbonate', 'карбонат', 'карбонаты'],
  ['PO₄', [['P', 1], ['O', 4]], 3, 'phosphate', 'фосфат', 'фосфаты'],
  ['F', [['F', 1]], 1, 'fluoride', 'фторид', 'фториді'],
  ['Br', [['Br', 1]], 1, 'bromide', 'бромид', 'бромиді'],
  ['I', [['I', 1]], 1, 'iodide', 'иодид', 'иодиді'],
  ['NO₂', [['N', 1], ['O', 2]], 1, 'nitrite', 'нитрит', 'нитриті'],
  ['MnO₄', [['Mn', 1], ['O', 4]], 1, 'permanganate', 'перманганат', 'перманганаты'],
];

/** Соединения, которых нет или которые сразу разлагаются водой, - не используем. */
const SKIP = new Set(['Al:CO₃', 'Fe3:CO₃', 'Cu:CO₃', 'Al:S', 'Fe3:S', 'Ag:OH', 'Ag:CO₃', 'Cu:I', 'Fe3:I', 'Cu:NO₂', 'Fe2:NO₂', 'Fe3:NO₂', 'Al:NO₂', 'Zn:NO₂', 'Cu:MnO₄', 'Fe2:MnO₄', 'Fe3:MnO₄', 'Al:MnO₄']);

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const poly = (an) => an[1].length > 1;
function formulaOf(cat, an, x, y) {
  const a = poly(an) && y > 1 ? `(${an[0]})${sub(y)}` : `${an[0]}${sub(y)}`;
  return `${cat[0]}${sub(x)}${a}`;
}

export const COMPOUNDS = CATIONS.flatMap((cat) =>
  ANIONS.filter((an) => !SKIP.has(`${cat[0]}${cat[0] === 'Fe' ? cat[1] : ''}:${an[0]}`)).map((an) => {
      const l = (cat[1] * an[2]) / gcd(cat[1], an[2]);
      const x = l / cat[1];
      const y = l / an[2];
      const atoms = [[cat[0], x], ...an[1].map(([el, k]) => [el, k * y])];
      const mass = atoms.reduce((s, [el, k]) => s + BY_SYM.get(el).mass * k, 0);
      return {
        cat,
        an,
        x,
        y,
        formula: formulaOf(cat, an, x, y),
        wrongs: [[1, 1], [y, x], [x, y + 1], [x + 1, y], [x, 1], [1, y], [x + 1, y + 1], [x, y + 2]].filter(([a, b]) => a !== x || b !== y).map(([a, b]) => formulaOf(cat, an, a, b)),
        name: L(`${cat[2]} ${an[3]}`, `${an[4]} ${cat[3]}`, `${cat[4]} ${an[5]}`),
        mass,
        atoms,
        level: cat[1] === 1 && an[2] === 1 ? 1 : cat[1] === an[2] || !poly(an) ? 2 : 3,
      };
    }),
);

export function compoundsMaker(topic) {
  return (ctx, d) => {
    const { rng } = ctx;
    const pool = COMPOUNDS.filter((c) => c.level <= d);
    for (let attempt = 0; attempt < 10; attempt++) {
      const c = pick(rng, d === 1 ? pool : pool.filter((x) => x.level >= d - 1));
      const mode = pick(rng, d === 1 ? ['formula', 'name', 'tf'] : ['formula', 'name', 'mass', 'tf']);
      const valence = L(
        `${c.cat[0]} has charge ${c.cat[1]}+, ${c.an[0]} has charge ${c.an[2]}−; the totals must cancel out: ${c.formula}.`,
        `Заряд ${c.cat[0]}: ${c.cat[1]}+, заряд ${c.an[0]}: ${c.an[2]}−; суммарные заряды должны уравняться: ${c.formula}.`,
        `${c.cat[0]} заряды: ${c.cat[1]}+, ${c.an[0]} заряды: ${c.an[2]}−; жалпы зарядтар теңесуі керек: ${c.formula}.`,
      );
      let q;
      if (mode === 'tf') {
        const ok = rng() < 0.5;
        const other = pick(rng, COMPOUNDS.filter((x) => x !== c && (x.cat === c.cat || x.an === c.an)));
        const form = { en: c.formula, ru: c.formula, kk: c.formula };
        return tfQ(ctx, topic, d, {
          prompt: pairPrompt(form, ok ? c.name : other.name),
          ok,
          ex: L(`Correct: ${c.formula} - ${c.name.en}.`, `Верно так: ${c.formula} - ${c.name.ru}.`, `Дұрысы: ${c.formula} - ${c.name.kk}.`),
          id: `${topic}:tf${ok ? 't' : 'f'}:${c.formula}`,
        });
      }
      if (mode === 'formula') {
        const wrong = [...new Set(c.wrongs)].filter((f) => f !== c.formula);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`What is the formula of ${c.name.en}?`, `Какая формула у вещества «${c.name.ru}»?`, `«${c.name.kk}» затының формуласы қандай?`),
          ex: valence,
          mc: mcOf(rng, c.formula, shuffle(wrong, rng).slice(0, 3)),
        });
      } else if (mode === 'name') {
        const near = shuffle(COMPOUNDS.filter((x) => x !== c && (x.cat === c.cat || x.an === c.an)), rng).slice(0, 3);
        q = poolQ(topic, d, {
          kind: 'text',
          prompt: L(`What is the name of ${c.formula}?`, `Как называется вещество ${c.formula}?`, `${c.formula} заты қалай аталады?`),
          ex: L(`${c.formula} - ${c.name.en}.`, `${c.formula} - ${c.name.ru}.`, `${c.formula} - ${c.name.kk}.`),
          mc: mcOf(rng, c.name, near.map((x) => x.name)),
        });
      } else {
        const given = c.atoms.map(([el]) => `${el} = ${n(BY_SYM.get(el).mass)}`).join(', ');
        const line = c.atoms.map(([el, k]) => (k > 1 ? `${k} × ${n(BY_SYM.get(el).mass)}` : n(BY_SYM.get(el).mass))).join(' + ');
        const oneEach = c.atoms.reduce((s, [el]) => s + BY_SYM.get(el).mass, 0);
        q = poolQ(topic, d, {
          prompt: L(`Find the molar mass of ${c.formula} in g/mol. Atomic masses: ${given}.`, `Найди молярную массу ${c.formula} в г/моль. Атомные массы: ${given}.`, `${c.formula} затының молярлық массасын г/моль-мен тап. Атомдық массалар: ${given}.`),
          ex: steps(L('Add up the masses of all atoms, taking the indices into account.', 'Складываем массы всех атомов с учётом индексов.', 'Индекстерді ескеріп, барлық атомдардың массаларын қосамыз.'), same(`M = ${line} = ${n(c.mass)}`)),
          ...ask(ctx, c.mass, [oneEach, c.mass + 16, c.mass - 16, c.mass + 1].filter((v) => v !== c.mass && v > 0)),
        });
      }
      q.id = `${topic}:${mode}:${c.formula}:${q.type}`;
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}
