// Биология: генераторы по таблицам — классы животных, органы и системы органов,
// органоиды клетки, витамины, учёные. Ключ сложности — 1…3.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';

const rows = (text) => text.trim().split('\n').map((line) => line.split('|'));

function mcOf(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
}

// ---------- Классы животных ----------

const CLASSES = {
  mam: L('mammals', 'млекопитающие', 'сүтқоректілер'),
  bird: L('birds', 'птицы', 'құстар'),
  rep: L('reptiles', 'пресмыкающиеся', 'бауырымен жорғалаушылар'),
  amph: L('amphibians', 'земноводные', 'қосмекенділер'),
  fish: L('fish', 'рыбы', 'балықтар'),
  ins: L('insects', 'насекомые', 'жәндіктер'),
  arach: L('arachnids', 'паукообразные', 'өрмекшітәрізділер'),
  crust: L('crustaceans', 'ракообразные', 'шаянтәрізділер'),
  moll: L('molluscs', 'моллюски', 'ұлулар (моллюскалар)'),
};

// класс|сложность|en|ru|kk|пояснение-ловушка (необязательно)
const ANIMALS = rows(`
mam|1|wolf|волк|қасқыр
mam|1|cow|корова|сиыр
mam|1|tiger|тигр|жолбарыс
mam|1|giraffe|жираф|керік
mam|1|hedgehog|ёж|кірпі
mam|2|whale|кит|кит|lives in water but breathes air and feeds its young with milk
mam|2|dolphin|дельфин|дельфин|lives in water but breathes air and feeds its young with milk
mam|2|bat|летучая мышь|жарқанат|flies but feeds its young with milk
mam|3|platypus|утконос|үйректұмсық|lays eggs but feeds its young with milk
mam|2|seal|тюлень|итбалық
mam|2|kangaroo|кенгуру|кенгуру
bird|1|sparrow|воробей|торғай
bird|1|eagle|орёл|бүркіт
bird|1|owl|сова|үкі
bird|1|swan|лебедь|аққу
bird|1|parrot|попугай|тотықұс
bird|2|penguin|пингвин|пингвин|cannot fly but has feathers and lays eggs
bird|2|ostrich|страус|түйеқұс|cannot fly but has feathers and lays eggs
reptile|1|crocodile|крокодил|қолтырауын
reptile|1|turtle|черепаха|тасбақа
reptile|1|snake|змея|жылан
reptile|1|lizard|ящерица|кесіртке
reptile|2|chameleon|хамелеон|хамелеон
amph|1|frog|лягушка|бақа
amph|2|toad|жаба|құрбақа
amph|2|newt|тритон|тритон
amph|3|salamander|саламандра|саламандра
amph|3|axolotl|аксолотль|аксолотль
fish|1|shark|акула|акула
fish|1|pike|щука|шортан
fish|1|carp|карп|тұқы
fish|2|salmon|лосось|албырт
fish|2|tuna|тунец|тунец
fish|3|seahorse|морской конёк|теңіз пырағы|looks unusual but breathes with gills and has fins
ins|1|bee|пчела|ара
ins|1|butterfly|бабочка|көбелек
ins|1|ant|муравей|құмырсқа
ins|1|mosquito|комар|маса
ins|1|beetle|жук|қоңыз
ins|2|grasshopper|кузнечик|шегіртке
ins|2|dragonfly|стрекоза|инелік
arach|1|spider|паук|өрмекші|has eight legs, insects have six
arach|2|scorpion|скорпион|бүйі|has eight legs, insects have six
arach|2|tick|клещ|кене|has eight legs, insects have six
crust|2|crab|краб|теңіз шаяны
crust|2|shrimp|креветка|асшаян
crust|2|crayfish|речной рак|өзен шаяны
crust|3|lobster|омар|омар
moll|2|snail|улитка|ұлу
moll|2|octopus|осьминог|сегізаяқ
moll|2|squid|кальмар|кальмар
moll|3|mussel|мидия|мидия
`).map(([cls, d, en, ru, kk, note]) => ({ cls: cls === 'reptile' ? 'rep' : cls, d: Number(d), name: L(en, ru, kk), note }));

const NOTE = {
  'lives in water but breathes air and feeds its young with milk': L('it lives in water but breathes air and feeds its young with milk', 'живёт в воде, но дышит воздухом и выкармливает детёнышей молоком', 'суда тіршілік етеді, бірақ ауамен тыныс алады және төлін сүтпен асырайды'),
  'flies but feeds its young with milk': L('it flies but feeds its young with milk', 'летает, но выкармливает детёнышей молоком', 'ұшады, бірақ төлін сүтпен асырайды'),
  'lays eggs but feeds its young with milk': L('it lays eggs but feeds its young with milk', 'откладывает яйца, но выкармливает детёнышей молоком', 'жұмыртқа салады, бірақ төлін сүтпен асырайды'),
  'cannot fly but has feathers and lays eggs': L('it cannot fly but has feathers and lays eggs', 'не летает, но покрыт перьями и откладывает яйца', 'ұшпайды, бірақ қауырсынмен жабылған және жұмыртқа салады'),
  'looks unusual but breathes with gills and has fins': L('it looks unusual but breathes with gills and has fins', 'выглядит необычно, но дышит жабрами и имеет плавники', 'түрі ерекше, бірақ желбезекпен тыныс алады, жүзбеқанаты бар'),
  'has eight legs, insects have six': L('it has eight legs, while insects have six', 'у него восемь ног, а у насекомых — шесть', 'оның сегіз аяғы бар, ал жәндіктерде — алты'),
};

function animalTask(ctx, topic, d) {
  const { rng } = ctx;
  const pool = ANIMALS.filter((a) => a.d <= d);
  const mode = pick(rng, ['class', 'class', 'which', 'odd']);
  if (mode === 'class') {
    const a = pick(rng, d === 1 ? pool : pool.filter((x) => x.d >= d - 1));
    const wrong = shuffle(Object.keys(CLASSES).filter((k) => k !== a.cls), rng).slice(0, 3);
    const why = a.note ? NOTE[a.note] : null;
    const q = poolQ(topic, d, {
      kind: 'text',
      prompt: L(`Which class does the ${a.name.en} belong to?`, `К какому классу относится ${a.name.ru}?`, `${a.name.kk} қай класқа жатады?`),
      ex: L(`The ${a.name.en} belongs to ${CLASSES[a.cls].en}${why ? `: ${why.en}` : ''}.`, `${a.name.ru} — ${CLASSES[a.cls].ru}${why ? `: ${why.ru}` : ''}.`, `${a.name.kk} — ${CLASSES[a.cls].kk}${why ? `: ${why.kk}` : ''}.`),
      mc: mcOf(rng, CLASSES[a.cls], wrong.map((k) => CLASSES[k])),
    });
    q.id = `${topic}:class:${a.name.en}`;
    return q;
  }
  const cls = pick(rng, [...new Set(pool.map((a) => a.cls))].filter((c) => pool.filter((a) => a.cls === c).length >= (mode === 'odd' ? 3 : 1)));
  const inClass = shuffle(pool.filter((a) => a.cls === cls), rng);
  const outClass = shuffle(pool.filter((a) => a.cls !== cls), rng);
  const [right, ...wrong] = mode === 'which' ? [inClass[0], ...outClass.slice(0, 3)] : [outClass[0], ...inClass.slice(0, 3)];
  const list = (l) => wrong.map((a) => a.name[l]).join(', ');
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt:
      mode === 'which'
        ? L(`Which of these animals belongs to ${CLASSES[cls].en}?`, `Какое из этих животных относится к классу «${CLASSES[cls].ru}»?`, `Бұл жануарлардың қайсысы «${CLASSES[cls].kk}» класына жатады?`)
        : L('Which animal is the odd one out?', 'Какое животное лишнее?', 'Қай жануар артық?'),
    ex:
      mode === 'which'
        ? L(`${right.name.en} — ${CLASSES[cls].en}.`, `${right.name.ru} — ${CLASSES[cls].ru}.`, `${right.name.kk} — ${CLASSES[cls].kk}.`)
        : L(`${right.name.en} belongs to ${CLASSES[right.cls].en}; ${list('en')} — ${CLASSES[cls].en}.`, `${right.name.ru} — ${CLASSES[right.cls].ru}, а ${list('ru')} — ${CLASSES[cls].ru}.`, `${right.name.kk} — ${CLASSES[right.cls].kk}, ал ${list('kk')} — ${CLASSES[cls].kk}.`),
    mc: mcOf(rng, right.name, wrong.map((a) => a.name)),
  });
  q.id = `${topic}:${mode}:${hashString([right, ...wrong].map((a) => a.name.en).sort().join())}`;
  return q;
}

// ---------- Таблицы «понятие → ответ» ----------

/** Таблица пар: ключ, вопрос в обе стороны. */
function pairTable(text) {
  return rows(text).map(([d, aen, aru, akk, ben, bru, bkk]) => ({ d: Number(d), a: L(aen, aru, akk), b: L(ben, bru, bkk) }));
}

const SYSTEMS = {
  circ: L('the circulatory system', 'кровеносная система', 'қанайналым жүйесі'),
  resp: L('the respiratory system', 'дыхательная система', 'тыныс алу жүйесі'),
  dig: L('the digestive system', 'пищеварительная система', 'ас қорыту жүйесі'),
  excr: L('the excretory system', 'выделительная система', 'зәр шығару жүйесі'),
  nerv: L('the nervous system', 'нервная система', 'жүйке жүйесі'),
  musc: L('the musculoskeletal system', 'опорно-двигательная система', 'тірек-қимыл жүйесі'),
  endo: L('the endocrine system', 'эндокринная система', 'эндокриндік жүйе'),
};

// система|сложность|орган en|ru|kk
const ORGANS = rows(`
circ|1|heart|сердце|жүрек
circ|2|arteries|артерии|артериялар
circ|2|veins|вены|веналар
circ|3|capillaries|капилляры|капиллярлар
resp|1|lungs|лёгкие|өкпе
resp|2|trachea|трахея|кеңірдек
resp|2|bronchi|бронхи|бронхтар
resp|3|alveoli|альвеолы|альвеолалар
dig|1|stomach|желудок|асқазан
dig|1|intestines|кишечник|ішек
dig|2|liver|печень|бауыр
dig|2|oesophagus|пищевод|өңеш
excr|1|kidneys|почки|бүйрек
excr|2|bladder|мочевой пузырь|қуық
excr|3|ureters|мочеточники|несепағар
nerv|1|brain|головной мозг|ми
nerv|2|spinal cord|спинной мозг|жұлын
nerv|2|nerves|нервы|жүйкелер
musc|1|skeleton|скелет|қаңқа
musc|1|muscles|мышцы|бұлшықеттер
musc|2|skull|череп|бас сүйек
musc|3|tendons|сухожилия|сіңірлер
endo|2|thyroid gland|щитовидная железа|қалқанша без
endo|3|pituitary gland|гипофиз|гипофиз
endo|3|adrenal glands|надпочечники|бүйрек үсті бездері
`).map(([sys, d, en, ru, kk]) => ({ sys, d: Number(d), name: L(en, ru, kk) }));

function organTask(ctx, topic, d) {
  const { rng } = ctx;
  const pool = ORGANS.filter((o) => o.d <= d);
  const o = pick(rng, d === 1 ? pool : pool.filter((x) => x.d >= d - 1));
  if (rng() < 0.6) {
    const wrong = shuffle(Object.keys(SYSTEMS).filter((k) => k !== o.sys), rng).slice(0, 3);
    const q = poolQ(topic, d, {
      kind: 'text',
      prompt: L(`Which organ system do the ${o.name.en} belong to?`, `К какой системе органов относится: ${o.name.ru}?`, `${o.name.kk} қай мүшелер жүйесіне жатады?`),
      ex: L(`${o.name.en} — ${SYSTEMS[o.sys].en}.`, `${o.name.ru} — ${SYSTEMS[o.sys].ru}.`, `${o.name.kk} — ${SYSTEMS[o.sys].kk}.`),
      mc: mcOf(rng, SYSTEMS[o.sys], wrong.map((k) => SYSTEMS[k])),
    });
    q.id = `${topic}:organ:${o.name.en}`;
    return q;
  }
  const others = shuffle(pool.filter((x) => x.sys !== o.sys), rng);
  const wrong = [];
  for (const x of others) if (wrong.length < 3 && !wrong.some((w) => w.sys === x.sys)) wrong.push(x);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: L(`Which organ is part of ${SYSTEMS[o.sys].en}?`, `Какой орган входит в систему: ${SYSTEMS[o.sys].ru}?`, `Қай мүше «${SYSTEMS[o.sys].kk}» құрамына кіреді?`),
    ex: L(`${o.name.en} — ${SYSTEMS[o.sys].en}.`, `${o.name.ru} — ${SYSTEMS[o.sys].ru}.`, `${o.name.kk} — ${SYSTEMS[o.sys].kk}.`),
    mc: mcOf(rng, o.name, wrong.map((x) => x.name)),
  });
  q.id = `${topic}:sys:${hashString([o, ...wrong].map((x) => x.name.en).sort().join())}`;
  return q;
}

// сложность|понятие en|ru|kk|ответ en|ru|kk
const TABLES = [
  {
    id: 'cell',
    pairs: pairTable(`
1|nucleus|ядро|ядро|stores the hereditary information (DNA)|хранит наследственную информацию (ДНК)|тұқым қуалаушылық ақпаратты (ДНҚ) сақтайды
1|chloroplast|хлоропласт|хлоропласт|carries out photosynthesis|осуществляет фотосинтез|фотосинтез жүргізеді
2|mitochondrion|митохондрия|митохондрия|produces energy (ATP)|вырабатывает энергию (АТФ)|энергия (АТФ) түзеді
2|ribosome|рибосома|рибосома|makes proteins|синтезирует белки|ақуыз синтездейді
2|cell membrane|клеточная мембрана|жасуша мембранасы|controls what enters and leaves the cell|регулирует, что входит в клетку и выходит из неё|жасушаға не кіріп, не шығатынын реттейді
2|vacuole|вакуоль|вакуоль|stores cell sap and water|запасает клеточный сок и воду|жасуша шырыны мен суды қорға жинайды
3|Golgi apparatus|аппарат Гольджи|Гольджи аппараты|packs and sorts substances|упаковывает и сортирует вещества|заттарды буып, сұрыптайды
3|lysosome|лизосома|лизосома|digests substances inside the cell|переваривает вещества внутри клетки|жасуша ішіндегі заттарды қорытады
3|cell wall|клеточная стенка|жасуша қабырғасы|gives a plant cell its firm shape|придаёт растительной клетке прочную форму|өсімдік жасушасына берік пішін береді
`),
    ask: (p) => L(`What does the ${p.a.en} do?`, `Какую функцию выполняет ${p.a.ru}?`, `${p.a.kk} қандай қызмет атқарады?`),
    back: (p) => L(`Which part of the cell ${p.b.en}?`, `Какая часть клетки ${p.b.ru}?`, `Жасушаның қай бөлігі ${p.b.kk}?`),
  },
  {
    id: 'vit',
    pairs: pairTable(`
1|vitamin C|витамин C|C дәрумені|scurvy|цинга|құрқұлақ
1|vitamin D|витамин D|D дәрумені|rickets|рахит|мешел (рахит)
2|vitamin A|витамин A|A дәрумені|night blindness|куриная слепота|тауық соқырлық
2|iodine|йод|йод|goitre (thyroid disease)|зоб (болезнь щитовидной железы)|жемсау (қалқанша без ауруы)
3|vitamin B1|витамин B1|B1 дәрумені|beriberi|бери-бери|бери-бери
3|vitamin K|витамин K|K дәрумені|poor blood clotting|плохая свёртываемость крови|қанның нашар ұюы
3|iron|железо|темір|anaemia|анемия (малокровие)|анемия (қаназдық)
`),
    ask: null,
    back: (p) => L(`A lack of which substance causes ${p.b.en}?`, `Недостаток какого вещества вызывает болезнь «${p.b.ru}»?`, `Қай заттың жетіспеушілігі «${p.b.kk}» ауруын тудырады?`),
  },
  {
    id: 'sci',
    pairs: pairTable(`
1|Charles Darwin|Чарльз Дарвин|Чарльз Дарвин|the theory of evolution by natural selection|теория эволюции путём естественного отбора|табиғи сұрыпталу арқылы эволюция теориясы
1|Gregor Mendel|Грегор Мендель|Грегор Мендель|the laws of heredity|законы наследственности|тұқым қуалаушылық заңдары
2|Louis Pasteur|Луи Пастер|Луи Пастер|vaccines and pasteurisation|вакцины и пастеризация|вакциналар мен пастерлеу
2|Alexander Fleming|Александр Флеминг|Александр Флеминг|penicillin, the first antibiotic|пенициллин — первый антибиотик|пенициллин — алғашқы антибиотик
2|Robert Hooke|Роберт Гук|Роберт Гук|the cell (he was first to describe it)|клетка (первым описал её)|жасуша (оны алғаш сипаттаған)
2|Antonie van Leeuwenhoek|Антони ван Левенгук|Антони ван Левенгук|microorganisms seen through a microscope|микроорганизмы, увиденные в микроскоп|микроскоппен көрінген микроағзалар
3|Watson and Crick|Уотсон и Крик|Уотсон мен Крик|the double helix structure of DNA|двойная спираль ДНК|ДНҚ-ның қос спиралі
3|William Harvey|Уильям Гарвей|Уильям Гарвей|the circulation of blood|кровообращение|қан айналымы
3|Carl Linnaeus|Карл Линней|Карл Линней|the system of naming species with two words|система двойных названий видов|түрлерді екі сөзбен атау жүйесі
3|Ivan Pavlov|Иван Павлов|Иван Павлов|conditioned reflexes|условные рефлексы|шартты рефлекстер
3|Ilya Mechnikov|Илья Мечников|Илья Мечников|phagocytosis (cells that swallow microbes)|фагоцитоз (клетки, поглощающие микробов)|фагоцитоз (микробтарды жұтатын жасушалар)
`),
    ask: (p) => L(`What is ${p.a.en} famous for?`, `Чем знаменит ${p.a.ru}?`, `${p.a.kk} немен әйгілі?`),
    back: (p) => L(`Who is known for ${p.b.en}?`, `Кто известен открытием: ${p.b.ru}?`, `Кім «${p.b.kk}» ашуымен белгілі?`),
  },
];

function tableTask(ctx, topic, d, id) {
  const { rng } = ctx;
  const t = TABLES.find((x) => x.id === id);
  const pool = t.pairs.filter((p) => p.d <= d);
  const p = pick(rng, pool);
  const wrong = shuffle(t.pairs.filter((x) => x !== p), rng).slice(0, 3);
  // Для витаминов вопрос всегда «чего не хватает» — ответ слева.
  const forward = t.ask ? !t.back || rng() < 0.5 : false;
  const ex = L(`${p.a.en} — ${p.b.en}.`, `${p.a.ru} — ${p.b.ru}.`, `${p.a.kk} — ${p.b.kk}.`);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: forward ? t.ask(p) : t.back(p),
    ex,
    mc: forward ? mcOf(rng, p.b, wrong.map((x) => x.b)) : mcOf(rng, p.a, wrong.map((x) => x.a)),
  });
  q.id = `${topic}:${t.id}:${forward ? 'f' : 'b'}:${p.a.en}`;
  return q;
}

/**
 * Генератор биологии. part: animals — классы животных; body — органы, системы и витамины;
 * cell — органоиды клетки и учёные.
 */
export function biologyMaker(topic, part) {
  return (ctx, d) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const q =
        part === 'animals'
          ? animalTask(ctx, topic, d)
          : part === 'body'
            ? ctx.rng() < 0.7 ? organTask(ctx, topic, d) : tableTask(ctx, topic, d, 'vit')
            : tableTask(ctx, topic, d, pick(ctx.rng, ['cell', 'cell', 'sci']));
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}

// ---------- Генетика: задачи с расчётом ----------

/** Признаки: доминантный и рецессивный вариант. */
const TRAITS = rows(`
yellow seeds|green seeds|жёлтые семена|зелёные семена|сары тұқым|жасыл тұқым
smooth seeds|wrinkled seeds|гладкие семена|морщинистые семена|тегіс тұқым|бұдыр тұқым
brown eyes|blue eyes|карие глаза|голубые глаза|қоңыр көз|көк көз
dark hair|fair hair|тёмные волосы|светлые волосы|қара шаш|ақшыл шаш
purple flowers|white flowers|пурпурные цветки|белые цветки|күлгін гүлдер|ақ гүлдер
`).map(([den, ren, dru, rru, dkk, rkk]) => ({ dom: L(den, dru, dkk), rec: L(ren, rru, rkk) }));

const FRACTIONS = ['0', '1/4', '1/2', '3/4', '1'];
const frac = (k) => FRACTIONS[k];

function crossTask(ctx, topic, d) {
  const { rng } = ctx;
  const parents = d === 1 ? [['AA', 'aa'], ['Aa', 'aa'], ['Aa', 'Aa']] : [['AA', 'aa'], ['Aa', 'aa'], ['Aa', 'Aa'], ['AA', 'Aa'], ['aa', 'aa'], ['AA', 'AA']];
  const [p1, p2] = pick(rng, parents);
  const kids = [];
  for (const a of p1) for (const b of p2) kids.push([a, b].sort().join(''));
  const trait = pick(rng, TRAITS);
  const ask = pick(rng, d === 1 ? ['rec', 'dom'] : ['rec', 'dom', 'het']);
  const count = kids.filter((g) => (ask === 'rec' ? g === 'aa' : ask === 'dom' ? g !== 'aa' : g === 'Aa')).length;
  const wrong = shuffle(FRACTIONS.filter((_, i) => i !== count), rng).slice(0, 3);
  const what = {
    rec: L(`with ${trait.rec.en}`, `с признаком «${trait.rec.ru}»`, `«${trait.rec.kk}» белгісімен`),
    dom: L(`with ${trait.dom.en}`, `с признаком «${trait.dom.ru}»`, `«${trait.dom.kk}» белгісімен`),
    het: L('that are heterozygous (Aa)', 'гетерозиготных (Aa)', 'гетерозиготалы (Aa)'),
  }[ask];
  const square = kids.join(', ');
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: L(
      `A is ${trait.dom.en} (dominant), a is ${trait.rec.en}. Parents ${p1} × ${p2}. What fraction of the offspring will be ${what.en.replace(/^with /, 'with ')}?`,
      `A — ${trait.dom.ru} (доминантный признак), a — ${trait.rec.ru}. Родители ${p1} × ${p2}. Какая доля потомков будет ${what.ru}?`,
      `A — ${trait.dom.kk} (доминантты белгі), a — ${trait.rec.kk}. Ата-аналар ${p1} × ${p2}. Ұрпақтың қандай үлесі ${what.kk} болады?`,
    ),
    ex: L(
      `Punnett square: ${square}. ${count} out of 4 → ${frac(count)}.`,
      `Решётка Пеннета: ${square}. Подходят ${count} из 4 → ${frac(count)}.`,
      `Пеннет торы: ${square}. 4-тің ${count}-і сәйкес келеді → ${frac(count)}.`,
    ),
    mc: mcOf(rng, frac(count), wrong),
  });
  q.id = `${topic}:cross:${p1}${p2}:${ask}:${trait.dom.en}`;
  return q;
}

const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
const RNA = { A: 'U', T: 'A', G: 'C', C: 'G' };

function dnaTask(ctx, topic, d) {
  const { rng } = ctx;
  const len = d === 1 ? 4 : d === 2 ? 6 : 8;
  const strand = Array.from({ length: len }, () => pick(rng, ['A', 'T', 'G', 'C']));
  const toRna = d >= 2 && rng() < 0.5;
  const map = toRna ? RNA : PAIR;
  const correct = strand.map((b) => map[b]).join('-');
  const wrongs = new Set([
    strand.join('-'),
    strand.map((b) => (toRna ? PAIR : RNA)[b]).join('-'),
    strand.map((b) => ({ A: 'G', G: 'A', T: 'C', C: 'T' })[b]).join('-'),
    [...strand].reverse().map((b) => map[b]).join('-'),
    strand.map((b, i) => (i === 0 ? b : map[b])).join('-'),
  ]);
  wrongs.delete(correct);
  const wrong = shuffle([...wrongs], rng).slice(0, 3);
  if (wrong.length < 3) return null;
  const s = strand.join('-');
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: toRna
      ? L(`A DNA strand reads ${s}. Which mRNA is copied from it?`, `Участок цепи ДНК: ${s}. Какая и-РНК синтезируется на нём?`, `ДНҚ тізбегінің бөлігі: ${s}. Онда қандай и-РНҚ синтезделеді?`)
      : L(`A DNA strand reads ${s}. What is the complementary strand?`, `Участок цепи ДНК: ${s}. Какой будет комплементарная цепь?`, `ДНҚ тізбегінің бөлігі: ${s}. Комплементар тізбек қандай болады?`),
    ex: toRna
      ? L('In RNA, A pairs with U (there is no T), T with A, G with C.', 'В РНК против A ставится U (тимина в РНК нет), против T — A, против G — C.', 'РНҚ-да A-ға қарсы U (РНҚ-да тимин жоқ), T-ға қарсы A, G-ге қарсы C тұрады.')
      : L('Complementarity: A pairs with T, G pairs with C.', 'Комплементарность: A соединяется с T, G — с C.', 'Комплементарлық: A мен T, G мен C жұптасады.'),
    mc: mcOf(rng, correct, wrong),
  });
  q.id = `${topic}:dna:${toRna ? 'r' : 'd'}:${s}`;
  return q;
}

function chargaffTask(ctx, topic, d) {
  const { rng } = ctx;
  const a = pick(rng, [10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 26, 28, 30, 32, 34, 35, 36, 38, 40]);
  const g = 50 - a;
  const askG = rng() < 0.5;
  const correct = askG ? g : a;
  const wrong = [...new Set([askG ? a : g, 100 - a, 100 - 2 * a, correct + 10, correct - 5].filter((x) => x > 0 && x < 100 && x !== correct))].slice(0, 3);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: askG
      ? L(`In a DNA molecule adenine (A) makes up ${a}% of all nucleotides. What percentage is guanine (G)?`, `В молекуле ДНК на долю аденина (A) приходится ${a}% нуклеотидов. Сколько процентов составляет гуанин (G)?`, `ДНҚ молекуласында аденин (A) нуклеотидтердің ${a}%-ын құрайды. Гуанин (G) неше пайыз?`)
      : L(`In a DNA molecule thymine (T) makes up ${a}% of all nucleotides. What percentage is adenine (A)?`, `В молекуле ДНК на долю тимина (T) приходится ${a}% нуклеотидов. Сколько процентов составляет аденин (A)?`, `ДНҚ молекуласында тимин (T) нуклеотидтердің ${a}%-ын құрайды. Аденин (A) неше пайыз?`),
    ex: askG
      ? L(`A = T = ${a}%, so G + C = 100 − 2 × ${a} = ${2 * g}%, and G = ${g}%.`, `A = T = ${a}%, значит G + C = 100 − 2 · ${a} = ${2 * g}%, а G = ${g}%.`, `A = T = ${a}%, демек G + C = 100 − 2 · ${a} = ${2 * g}%, ал G = ${g}%.`)
      : L(`By Chargaff’s rule A = T, so A = ${a}%.`, `По правилу Чаргаффа A = T, значит A = ${a}%.`, `Чаргафф ережесі бойынша A = T, демек A = ${a}%.`),
    mc: mcOf(rng, `${correct}%`, wrong.map((x) => `${x}%`)),
  });
  q.id = `${topic}:chargaff:${askG ? 'g' : 'a'}:${a}`;
  return q;
}

/** Генетика: скрещивания, комплементарность ДНК и РНК, правило Чаргаффа. */
export function geneticsMaker(topic) {
  return (ctx, d) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const kind = pick(ctx.rng, d === 1 ? ['cross', 'dna'] : ['cross', 'dna', 'chargaff']);
      const q = kind === 'cross' ? crossTask(ctx, topic, d) : kind === 'dna' ? dnaTask(ctx, topic, d) : chargaffTask(ctx, topic, d);
      if (q && (!ctx.used?.has(q.id) || attempt === 9)) return q;
    }
    return crossTask(ctx, topic, d);
  };
}
