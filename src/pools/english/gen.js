// Генераторы английского: неправильные глаголы, времена по словам-маркерам, степени сравнения.
// Варианты-ловушки подобраны так, чтобы они были неверны в данном предложении:
// например, рядом с «yesterday» не предлагается Past Continuous, который тоже мог бы подойти.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { ALL_VERBS, IRREGULAR_VERBS } from './verbs.js';

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function finish(q, id, level) {
  q.id = id;
  q.level = CEFR[level - 1];
  q.d = Math.min(3, Math.ceil(level / 2));
  return q;
}

function choicesOf(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
}

/** Подлежащие: p - лицо (1 - I, 2 - you, 3 - он/она, pl - мы/они). */
const SUBJECTS = [
  { s: 'I', p: 1 },
  { s: 'You', p: 2 },
  { s: 'He', p: 3 },
  { s: 'She', p: 3 },
  { s: 'My brother', p: 3 },
  { s: 'Aigerim', p: 3 },
  { s: 'We', p: 'pl' },
  { s: 'They', p: 'pl' },
  { s: 'My parents', p: 'pl' },
];

const be = (p) => (p === 1 ? 'am' : p === 3 ? 'is' : 'are');
const was = (p) => (p === 1 || p === 3 ? 'was' : 'were');
const has = (p) => (p === 3 ? 'has' : 'have');

/** Формы времени для подлежащего; wrong - та же форма с ошибкой в согласовании. */
const TENSES = {
  ps: { level: 1, form: (v, p) => (p === 3 ? v.s : v.base), wrong: (v, p) => (p === 3 ? v.base : v.s), cont: false,
    markers: ['every day', 'on Sundays', 'every morning', 'twice a week'],
    rule: L('Present Simple - habits and regular actions; he, she, it + -s.', 'Present Simple - привычки и регулярные действия; после he, she, it глагол с -s.', 'Present Simple - әдеттер мен тұрақты әрекеттер; he, she, it-тен кейін етістікке -s жалғанады.') },
  pc: { level: 1, form: (v, p) => `${be(p)} ${v.ing}`, wrong: (v, p) => `${p === 3 ? 'are' : 'is'} ${v.ing}`, cont: true,
    markers: ['right now', 'at the moment', 'now'],
    rule: L('Present Continuous - an action happening now: am / is / are + -ing.', 'Present Continuous - действие происходит сейчас: am / is / are + -ing.', 'Present Continuous - әрекет дәл қазір болып жатыр: am / is / are + -ing.') },
  past: { level: 2, form: (v) => v.past, wrong: (v) => (v.irregular ? `${v.base.replace(/e$/, '')}ed` : `did ${v.past}`), cont: false,
    markers: ['yesterday', 'last week', 'two days ago', 'last summer'],
    rule: L('Past Simple - a finished action at a past time (yesterday, ago, last…).', 'Past Simple - законченное действие в прошлом: yesterday, ago, last…', 'Past Simple - өткен шақта аяқталған әрекет: yesterday, ago, last…') },
  fut: { level: 2, form: (v) => `will ${v.base}`, wrong: (v) => `will ${v.s}`, cont: false,
    markers: ['tomorrow', 'next year', 'one day'], lead: 'I think',
    rule: L('Future Simple - a prediction or decision about the future: will + verb.', 'Future Simple - предположение о будущем: will + глагол.', 'Future Simple - болашақ туралы болжам: will + етістік.') },
  pastc: { level: 3, form: (v, p) => `${was(p)} ${v.ing}`, wrong: (v, p) => `${p === 1 || p === 3 ? 'were' : 'was'} ${v.ing}`, cont: true,
    markers: ['at eight o’clock last night', 'when the phone rang', 'all evening yesterday'],
    rule: L('Past Continuous - an action in progress at a past moment: was / were + -ing.', 'Past Continuous - действие в процессе в момент прошлого: was / were + -ing.', 'Past Continuous - өткендегі белгілі сәтте болып жатқан әрекет: was / were + -ing.') },
  pp: { level: 3, form: (v, p) => `${has(p)} ${v.pp}`, wrong: (v, p) => `${p === 3 ? 'have' : 'has'} ${v.pp}`, cont: false,
    markers: ['already', 'three times since Monday', 'many times before'],
    rule: L('Present Perfect - a result now or experience up to now: have / has + past participle.', 'Present Perfect - результат к настоящему моменту: have / has + третья форма.', 'Present Perfect - қазіргі сәттегі нәтиже: have / has + үшінші түр.') },
  ppc: { level: 4, form: (v, p) => `${has(p)} been ${v.ing}`, wrong: (v, p) => `${p === 3 ? 'have' : 'has'} been ${v.ing}`, cont: true,
    markers: ['for two hours', 'since nine o’clock', 'since breakfast'],
    rule: L('Present Perfect Continuous - an action that started in the past and is still going on: have / has been + -ing.', 'Present Perfect Continuous - действие началось в прошлом и всё ещё длится: have / has been + -ing.', 'Present Perfect Continuous - өткенде басталып, әлі жалғасып жатқан әрекет: have / has been + -ing.') },
  pastp: { level: 4, form: (v) => `had ${v.pp}`, wrong: (v) => `had ${v.past === v.pp ? v.base : v.past}`, cont: false,
    markers: ['By the time we arrived,', 'Before the guests came,', 'By noon,'], front: true,
    rule: L('Past Perfect - an action before another past moment: had + past participle.', 'Past Perfect - действие раньше другого момента в прошлом: had + третья форма.', 'Past Perfect - өткендегі басқа сәттен бұрын болған әрекет: had + үшінші түр.') },
  futc: { level: 5, form: (v) => `will be ${v.ing}`, wrong: (v) => `will ${v.ing}`, cont: true,
    markers: ['At this time tomorrow,', 'At eight o’clock tonight,'], front: true,
    rule: L('Future Continuous - an action in progress at a future moment: will be + -ing.', 'Future Continuous - действие будет в процессе в момент будущего: will be + -ing.', 'Future Continuous - болашақтағы белгілі сәтте болып жатқан әрекет: will be + -ing.') },
  futp: { level: 5, form: (v) => `will have ${v.pp}`, wrong: (v) => `will had ${v.pp}`, cont: false,
    markers: ['By next Monday,', 'By the end of the year,', 'By the time you come back,'], front: true,
    rule: L('Future Perfect - an action finished before a future moment: will have + past participle.', 'Future Perfect - действие завершится к моменту в будущем: will have + третья форма.', 'Future Perfect - болашақтағы сәтке дейін аяқталатын әрекет: will have + үшінші түр.') },
};

/** Времена-ловушки, которые точно не подходят к маркерам времени. */
const SAFE = {
  ps: ['pc', 'pp', 'pastp'],
  pc: ['ps', 'past', 'pp'],
  past: ['ps', 'pp', 'fut', 'pc'],
  fut: ['past', 'pp', 'pastc', 'pastp'],
  pastc: ['ps', 'pp', 'fut', 'pc'],
  pp: ['ps', 'fut', 'pastc'],
  ppc: ['ps', 'pc', 'fut'],
  pastp: ['pp', 'pc', 'fut', 'ps'],
  futc: ['pastc', 'pp', 'ps', 'past'],
  futp: ['pastp', 'pp', 'ps', 'past'],
};

function tenseTask(ctx, topic, level, tense) {
  const t = TENSES[tense];
  const verbs = ALL_VERBS.filter((v) => v.level <= Math.max(2, level) && !(t.cont && v.stative));
  const v = pick(ctx.rng, verbs);
  const subj = pick(ctx.rng, SUBJECTS);
  const marker = pick(ctx.rng, t.markers);
  const correct = t.form(v, subj.p);
  const wrong = [];
  // Одна ловушка - ошибка согласования того же времени, остальные - другие времена.
  const agreement = t.wrong(v, subj.p);
  if (agreement !== correct) wrong.push(agreement);
  for (const other of shuffle(SAFE[tense], ctx.rng)) {
    if (wrong.length === 3) break;
    const f = TENSES[other].form(v, subj.p);
    if (f !== correct && !wrong.includes(f)) wrong.push(f);
  }
  if (wrong.length < 3) return null;
  const s = t.front || t.lead ? subj.s.replace(/^(He|She|We|They|You|My)\b/, (m) => m.toLowerCase()) : subj.s;
  const sentence = t.front
    ? `${marker} ${s} ______ (${v.base}) ${v.obj}.`
    : `${t.lead ? `${t.lead} ${s}` : s} ______ (${v.base}) ${v.obj} ${marker}.`;
  const ex = L(`${t.rule.en} Answer: ${correct}.`, `${t.rule.ru} Ответ: ${correct}.`, `${t.rule.kk} Жауабы: ${correct}.`);
  const prompt = L('Choose the correct form of the verb.', 'Выбери правильную форму глагола.', 'Етістіктің дұрыс түрін таңда.');
  const q = poolQ(topic, 1, { kind: 'text', passage: sentence, prompt, ex, mc: choicesOf(ctx.rng, correct, wrong.slice(0, 3)) });
  q.voice = { lang: 'en' };
  return finish(q, `${topic}:t:${hashString(sentence)}`, level);
}

/** Времена, которые даются на уровне: на C2 - все. */
function tensesFor(level) {
  const own = Object.keys(TENSES).filter((k) => TENSES[k].level === level);
  const lower = Object.keys(TENSES).filter((k) => TENSES[k].level < level);
  return { own: own.length ? own : Object.keys(TENSES), lower };
}

export function grammarMaker(topic) {
  return (ctx, level) => {
    const { own, lower } = tensesFor(level);
    for (let attempt = 0; attempt < 10; attempt++) {
      const tense = pick(ctx.rng, lower.length && ctx.rng() < 0.35 ? lower : own);
      const q = tenseTask(ctx, topic, level, tense);
      if (q && (!ctx.used?.has(q.id) || attempt === 9)) return q;
    }
    throw new Error(`grammar ${level}`);
  };
}

// ---------- Неправильные глаголы ----------

const PAST_FRAMES = ['yesterday', 'last week', 'two days ago', 'last summer'];
const PP_FRAMES = [['already'], ['just'], ['never']];

/** Неправильная «правильная» форма: goed, writed, buyed. */
const regularized = (v) => (v.base.endsWith('e') ? `${v.base}d` : `${v.base}ed`);

function irregTask(ctx, topic, level, v) {
  const mode = pick(ctx.rng, ['past', 'pp', 'three']);
  const subj = pick(ctx.rng, SUBJECTS);
  const tr = L(`${v.base} - ${v.past} - ${v.pp}`, `${v.base} (${v.ru}) - ${v.past} - ${v.pp}`, `${v.base} (${v.kk}) - ${v.past} - ${v.pp}`);
  const prompt = L('Choose the correct form of the verb.', 'Выбери правильную форму глагола.', 'Етістіктің дұрыс түрін таңда.');
  let q;
  if (mode === 'past') {
    const pool = [v.pp, regularized(v), v.ing, v.s, v.base].filter((f) => f !== v.past);
    const wrong = [...new Set(pool)].slice(0, 3);
    const sentence = `${subj.s} ______ (${v.base}) ${v.obj} ${pick(ctx.rng, PAST_FRAMES)}.`;
    const ex = L(`Past Simple of an irregular verb is the second form: ${tr.en}.`, `В Past Simple у неправильного глагола вторая форма: ${tr.ru}.`, `Past Simple-де бұрыс етістіктің екінші түрі қолданылады: ${tr.kk}.`);
    q = poolQ(topic, 1, { kind: 'text', passage: sentence, prompt, ex, mc: choicesOf(ctx.rng, v.past, wrong) });
    q.voice = { lang: 'en' };
  } else if (mode === 'pp') {
    const [adv] = pick(ctx.rng, PP_FRAMES);
    const aux = has(subj.p);
    const pool = [v.past, regularized(v), v.base, v.ing, v.s].filter((f) => f !== v.pp);
    const wrong = [...new Set(pool)].slice(0, 3);
    const sentence = `${subj.s} ${aux} ${adv} ______ (${v.base}) ${v.obj}.`;
    const ex = L(`After have / has we use the third form (past participle): ${tr.en}.`, `После have / has нужна третья форма глагола: ${tr.ru}.`, `Have / has-тан кейін етістіктің үшінші түрі керек: ${tr.kk}.`);
    q = poolQ(topic, 1, { kind: 'text', passage: sentence, prompt, ex, mc: choicesOf(ctx.rng, v.pp, wrong) });
    q.voice = { lang: 'en' };
  } else {
    const correct = `${v.base} - ${v.past} - ${v.pp}`;
    const variants = [
      `${v.base} - ${regularized(v)} - ${regularized(v)}`,
      `${v.base} - ${v.pp} - ${v.past}`,
      `${v.base} - ${v.past} - ${regularized(v)}`,
      `${v.base} - ${v.past} - ${v.past}`,
      `${v.base} - ${v.pp} - ${v.pp}`,
      `${v.base} - ${v.base} - ${v.pp}`,
      `${v.base} - ${v.past} - ${v.base}`,
      `${v.base} - ${regularized(v)} - ${v.pp}`,
      `${v.base} - ${v.ing} - ${v.pp}`,
    ].filter((x) => x !== correct);
    const wrong = shuffle([...new Set(variants)], ctx.rng).slice(0, 3);
    const p3 = L(`Choose the three forms of the verb "${v.base}".`, `Выбери три формы глагола «${v.base}» (${v.ru}).`, `«${v.base}» (${v.kk}) етістігінің үш түрін таңда.`);
    const ex = L(`The three forms: ${tr.en}.`, `Три формы: ${tr.ru}.`, `Үш түрі: ${tr.kk}.`);
    q = poolQ(topic, 1, { kind: 'text', prompt: p3, ex, mc: choicesOf(ctx.rng, correct, wrong) });
    q.voice = { lang: 'en' };
    return finish(q, `${topic}:3:${v.base}`, level);
  }
  return finish(q, `${topic}:${mode}:${hashString(q.passage)}`, level);
}

export function irregularMaker(topic) {
  return (ctx, level) => {
    const own = IRREGULAR_VERBS.filter((v) => v.level === level);
    const pool = own.length ? own : IRREGULAR_VERBS;
    for (let attempt = 0; attempt < 8; attempt++) {
      const q = irregTask(ctx, topic, level, pick(ctx.rng, attempt < 4 ? pool : IRREGULAR_VERBS.filter((v) => v.level <= level)));
      if (!ctx.used?.has(q.id) || attempt === 7) return q;
    }
    return null;
  };
}

// ---------- Степени сравнения ----------
// Строка: прилагательное|сравнительная|превосходная|ru|kk|уровень|предложение для сравнительной|для превосходной.

const ADJ = `
tall|taller|tallest|высокий|биік|1|My brother is ______ (tall) than me.|It is the ______ (tall) building in the city.
cheap|cheaper|cheapest|дешёвый|арзан|1|This phone is ______ (cheap) than that one.|This is the ______ (cheap) café in town.
old|older|oldest|старый|кәрі, ескі|1|My grandfather is ______ (old) than my grandmother.|This is the ______ (old) tree in the park.
fast|faster|fastest|быстрый|жылдам|1|A plane is ______ (fast) than a train.|The cheetah is the ______ (fast) animal on land.
long|longer|longest|длинный|ұзын|1|This road is ______ (long) than the old one.|The Nile is one of the ______ (long) rivers in the world.
cold|colder|coldest|холодный|суық|1|January is ______ (cold) than March.|It was the ______ (cold) day of the year.
big|bigger|biggest|большой|үлкен|1|An elephant is ______ (big) than a horse.|Russia is the ______ (big) country in the world.
hot|hotter|hottest|жаркий|ыстық|1|Today is ______ (hot) than yesterday.|July is usually the ______ (hot) month.
thin|thinner|thinnest|тонкий|жұқа|2|This book is ______ (thin) than that dictionary.|This is the ______ (thin) phone in the shop.
easy|easier|easiest|лёгкий|оңай|1|The second test was ______ (easy) than the first.|This is the ______ (easy) exercise in the book.
happy|happier|happiest|счастливый|бақытты|1|She looks ______ (happy) than yesterday.|It was the ______ (happy) day of my life.
busy|busier|busiest|занятой|бос емес|2|This street is ______ (busy) than ours.|Friday is the ______ (busy) day of the week.
heavy|heavier|heaviest|тяжёлый|ауыр|2|My bag is ______ (heavy) than yours.|This is the ______ (heavy) box of all.
early|earlier|earliest|ранний|ерте|2|Let’s take an ______ (early) train.|Kamila was the ______ (early) to arrive.
good|better|best|хороший|жақсы|1|Your idea is ______ (good) than mine.|This is the ______ (good) pizza in town.
bad|worse|worst|плохой|жаман|1|The weather today is ______ (bad) than yesterday.|That was the ______ (bad) film I have ever seen.
far|farther|farthest|далёкий|алыс|2|My school is ______ (far) from home than yours.|Pluto was the ______ (far) planet we studied.
beautiful|more beautiful|most beautiful|красивый|әдемі|1|This park is ______ (beautiful) than the old one.|It is the ______ (beautiful) city I know.
expensive|more expensive|most expensive|дорогой|қымбат|1|A car is ______ (expensive) than a bike.|This is the ______ (expensive) hotel in Almaty.
interesting|more interesting|most interesting|интересный|қызықты|1|This book is ______ (interesting) than the film.|It was the ______ (interesting) lesson this week.
dangerous|more dangerous|most dangerous|опасный|қауіпті|2|A shark is ______ (dangerous) than a dolphin.|This is the ______ (dangerous) road in the region.
comfortable|more comfortable|most comfortable|удобный|ыңғайлы|2|This chair is ______ (comfortable) than the sofa.|It is the ______ (comfortable) bed in the house.
popular|more popular|most popular|популярный|танымал|2|Football is ______ (popular) than golf here.|It is the ______ (popular) song this month.
important|more important|most important|важный|маңызды|2|Health is ______ (important) than money.|This is the ______ (important) rule.
difficult|more difficult|most difficult|трудный|қиын|1|Chemistry is ______ (difficult) than biology for me.|This is the ______ (difficult) question in the test.
famous|more famous|most famous|знаменитый|әйгілі|2|This singer is ______ (famous) than her sister.|He is the ______ (famous) writer in the country.
young|younger|youngest|молодой|жас|1|My sister is ______ (young) than me.|Dana is the ______ (young) student in our class.
strong|stronger|strongest|сильный|күшті|1|A horse is ______ (strong) than a dog.|He is the ______ (strong) boy in the team.
wide|wider|widest|широкий|кең|2|This river is ______ (wide) than that one.|It is the ______ (wide) street in the city.
small|smaller|smallest|маленький|кішкентай|1|My room is ______ (small) than yours.|This is the ______ (small) dog I have ever seen.
short|shorter|shortest|короткий|қысқа|1|This pencil is ______ (short) than that one.|February is the ______ (short) month of the year.
new|newer|newest|новый|жаңа|1|My phone is ______ (new) than hers.|This is the ______ (new) shop in our street.
slow|slower|slowest|медленный|баяу|1|A bus is ______ (slow) than a taxi.|The turtle is the ______ (slow) animal in the zoo.
clean|cleaner|cleanest|чистый|таза|1|Our classroom is ______ (clean) than theirs.|This is the ______ (clean) beach in the country.
rich|richer|richest|богатый|бай|1|He is ______ (rich) than his brother.|She is the ______ (rich) woman in the town.
dark|darker|darkest|тёмный|қараңғы|1|The sky is ______ (dark) than an hour ago.|This is the ______ (dark) room in the house.
loud|louder|loudest|громкий|қатты|1|The music is ______ (loud) than before.|The drums are the ______ (loud) instruments in the band.
nice|nicer|nicest|приятный|жағымды|1|The weather is ______ (nice) than last week.|It was the ______ (nice) present I got.
funny|funnier|funniest|смешной|күлкілі|1|This story is ______ (funny) than that one.|He is the ______ (funny) boy in our class.
delicious|more delicious|most delicious|вкусный|дәмді|1|This soup is ______ (delicious) than the salad.|It is the ______ (delicious) cake I have ever eaten.
useful|more useful|most useful|полезный|пайдалы|1|A dictionary is ______ (useful) than a novel for study.|This is the ______ (useful) app on my phone.
sweet|sweeter|sweetest|сладкий|тәтті|1|This tea is ______ (sweet) than that one.|This is the ______ (sweet) cake in the shop.
hard|harder|hardest|твёрдый, трудный|қатты, қиын|1|This bed is ______ (hard) than my old one.|It was the ______ (hard) test of the year.
deep|deeper|deepest|глубокий|терең|1|The lake is ______ (deep) than the river.|This is the ______ (deep) part of the sea.
high|higher|highest|высокий|биік|1|This wall is ______ (high) than that fence.|Everest is the ______ (high) mountain on Earth.
low|lower|lowest|низкий|төмен|1|The table is ______ (low) than the chair.|This is the ______ (low) price in town.
wet|wetter|wettest|мокрый|дымқыл|1|My coat is ______ (wet) than yours.|It was the ______ (wet) day of the autumn.
dry|drier|driest|сухой|құрғақ|1|The desert is ______ (dry) than the forest.|This is the ______ (dry) summer in years.
near|nearer|nearest|близкий|жақын|1|The shop is ______ (near) than the bank.|Where is the ______ (near) bus stop?
late|later|latest|поздний|кеш|1|Today I came ______ (late) than usual.|This is the ______ (late) bus of the night.
kind|kinder|kindest|добрый|мейірімді|1|My aunt is ______ (kind) than my uncle.|She is the ______ (kind) person I know.
brave|braver|bravest|храбрый|батыл|1|The girl was ______ (brave) than the boy.|He is the ______ (brave) fireman in the city.
smart|smarter|smartest|умный|ақылды|1|My sister is ______ (smart) than me.|He is the ______ (smart) student in our class.
quick|quicker|quickest|быстрый|тез|1|This road is ______ (quick) than the old one.|It is the ______ (quick) way to the station.
lucky|luckier|luckiest|удачливый|бақытты|1|Aigerim is ______ (lucky) than her friend.|It was the ______ (lucky) day of my life.
tasty|tastier|tastiest|вкусный|дәмді|1|This soup is ______ (tasty) than that one.|This is the ______ (tasty) pie I have eaten.
messy|messier|messiest|неопрятный|ретсіз|1|My room is ______ (messy) than my brother's.|This is the ______ (messy) desk in the office.
healthy|healthier|healthiest|здоровый|сау|1|Fruit is ______ (healthy) than sweets.|This is the ______ (healthy) food on the menu.
modern|more modern|most modern|современный|заманауи|1|This school is ______ (modern) than the old one.|It is the ______ (modern) building in the city.
careful|more careful|most careful|осторожный|абай|1|My brother is ______ (careful) than me.|She is the ______ (careful) driver in our family.
exciting|more exciting|most exciting|захватывающий|қызықты|1|This game is ______ (exciting) than the last one.|It was the ______ (exciting) match of the season.
little|less|least|маленький (о количестве)|аз|3|I have ______ (little) free time than last year.|This option costs the ______ (little) money.
`;

const ADJECTIVES = ADJ.trim()
  .split('\n')
  .map((line) => {
    const [adj, comp, sup, ru, kk, level, s1, s2] = line.split('|');
    return { adj, comp, sup, ru, kk, level: Number(level), s1, s2 };
  });

function compTask(ctx, topic, level, a) {
  const sup = ctx.rng() < 0.5;
  const correct = sup ? a.sup : a.comp;
  const isMore = a.comp.startsWith('more');
  const stem = a.adj.replace(/e$/, '');
  const pool = isMore
    ? sup
      ? [a.comp, `${stem}est`, a.adj, `most ${stem}er`]
      : [a.sup, `${stem}er`, a.adj, `more ${stem}er`]
    : sup
      ? [a.comp, `most ${a.adj}`, `more ${a.sup}`, a.adj]
      : [a.sup, `more ${a.adj}`, `more ${a.comp}`, a.adj];
  const wrong = [...new Set(pool.filter((x) => x !== correct))].slice(0, 3);
  const sentence = sup ? a.s2 : a.s1;
  const ex = sup
    ? L(`Superlative: the + ${a.sup}. ${a.adj} - ${a.comp} - ${a.sup}.`, `Превосходная степень: the + ${a.sup}. ${a.adj} (${a.ru}) - ${a.comp} - ${a.sup}.`, `Күшейтпелі шырай: the + ${a.sup}. ${a.adj} (${a.kk}) - ${a.comp} - ${a.sup}.`)
    : L(`Comparative + than: ${a.comp} than. ${a.adj} - ${a.comp} - ${a.sup}.`, `Сравнительная степень + than: ${a.comp} than. ${a.adj} (${a.ru}) - ${a.comp} - ${a.sup}.`, `Салыстырмалы шырай + than: ${a.comp} than. ${a.adj} (${a.kk}) - ${a.comp} - ${a.sup}.`);
  const prompt = L('Choose the correct form of the adjective.', 'Выбери правильную форму прилагательного.', 'Сын есімнің дұрыс түрін таңда.');
  const q = poolQ(topic, 1, { kind: 'text', passage: sentence, prompt, ex, mc: choicesOf(ctx.rng, correct, wrong) });
  q.voice = { lang: 'en' };
  return finish(q, `${topic}:${sup ? 's' : 'c'}:${a.adj}`, level);
}

export function comparisonMaker(topic) {
  return (ctx, level) => {
    const pool = ADJECTIVES.filter((a) => a.level <= level);
    for (let attempt = 0; attempt < 8; attempt++) {
      const q = compTask(ctx, topic, level, pick(ctx.rng, pool));
      if (!ctx.used?.has(q.id) || attempt === 7) return q;
    }
    return null;
  };
}

export const COMPARISON_COUNT = ADJECTIVES.length * 2;
