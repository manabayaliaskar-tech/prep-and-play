// Биология: генераторы по таблицам - классы животных, органы и системы органов,
// органоиды клетки, витамины, учёные. Ключ сложности - 1…3.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { pairPrompt, tfQ } from '../tf.js';

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
  'has eight legs, insects have six': L('it has eight legs, while insects have six', 'у него восемь ног, а у насекомых - шесть', 'оның сегіз аяғы бар, ал жәндіктерде - алты'),
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
      ex: L(`The ${a.name.en} belongs to ${CLASSES[a.cls].en}${why ? `: ${why.en}` : ''}.`, `${a.name.ru} - ${CLASSES[a.cls].ru}${why ? `: ${why.ru}` : ''}.`, `${a.name.kk} - ${CLASSES[a.cls].kk}${why ? `: ${why.kk}` : ''}.`),
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
        ? L(`${right.name.en} - ${CLASSES[cls].en}.`, `${right.name.ru} - ${CLASSES[cls].ru}.`, `${right.name.kk} - ${CLASSES[cls].kk}.`)
        : L(`${right.name.en} belongs to ${CLASSES[right.cls].en}; ${list('en')} - ${CLASSES[cls].en}.`, `${right.name.ru} - ${CLASSES[right.cls].ru}, а ${list('ru')} - ${CLASSES[cls].ru}.`, `${right.name.kk} - ${CLASSES[right.cls].kk}, ал ${list('kk')} - ${CLASSES[cls].kk}.`),
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
circ|3|aorta|аорта|қолқа
resp|3|larynx|гортань|көмей
dig|2|teeth|зубы|тістер
dig|3|gallbladder|желчный пузырь|өт қабы
nerv|3|cerebellum|мозжечок|мишық
musc|2|spine|позвоночник|омыртқа жотасы
musc|3|joints|суставы|буындар
endo|3|pituitary gland|гипофиз|гипофиз
endo|3|adrenal glands|надпочечники|бүйрек үсті бездері
circ|1|blood vessels|кровеносные сосуды|қан тамырлары
resp|1|nasal cavity|носовая полость|мұрын қуысы
dig|1|mouth|ротовая полость|ауыз қуысы
musc|1|bones|кости|сүйектер
musc|1|ribs|рёбра|қабырғалар
nerv|1|nerves of the body|нервы тела|дене жүйкелері
excr|1|urine-forming organs|почки и мочевыводящие пути|бүйрек және несеп жолдары
`).map(([sys, d, en, ru, kk]) => ({ sys, d: Number(d), name: L(en, ru, kk) }));

function organTask(ctx, topic, d) {
  const { rng } = ctx;
  const pool = ORGANS.filter((o) => o.d <= d);
  const o = pick(rng, d === 1 ? pool : pool.filter((x) => x.d >= d - 1));
  if (rng() < 0.3) {
    const ok = rng() < 0.5;
    const sys = ok ? o.sys : pick(rng, Object.keys(SYSTEMS).filter((k) => k !== o.sys));
    return tfQ(ctx, topic, d, {
      prompt: pairPrompt(o.name, SYSTEMS[sys]),
      ok,
      ex: L(`Correct: ${o.name.en} - ${SYSTEMS[o.sys].en}.`, `Верно так: ${o.name.ru} - ${SYSTEMS[o.sys].ru}.`, `Дұрысы: ${o.name.kk} - ${SYSTEMS[o.sys].kk}.`),
      id: `${topic}:organtf${ok ? 't' : 'f'}:${o.name.en}`,
    });
  }
  if (rng() < 0.6) {
    const wrong = shuffle(Object.keys(SYSTEMS).filter((k) => k !== o.sys), rng).slice(0, 3);
    const q = poolQ(topic, d, {
      kind: 'text',
      prompt: L(`Which organ system do the ${o.name.en} belong to?`, `К какой системе органов относится: ${o.name.ru}?`, `${o.name.kk} қай мүшелер жүйесіне жатады?`),
      ex: L(`${o.name.en} - ${SYSTEMS[o.sys].en}.`, `${o.name.ru} - ${SYSTEMS[o.sys].ru}.`, `${o.name.kk} - ${SYSTEMS[o.sys].kk}.`),
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
    ex: L(`${o.name.en} - ${SYSTEMS[o.sys].en}.`, `${o.name.ru} - ${SYSTEMS[o.sys].ru}.`, `${o.name.kk} - ${SYSTEMS[o.sys].kk}.`),
    mc: mcOf(rng, o.name, wrong.map((x) => x.name)),
  });
  q.id = `${topic}:sys:${hashString([o, ...wrong].map((x) => x.name.en).sort().join())}`;
  return q;
}

// сложность|понятие en|ru|kk|ответ en|ru|kk
const TABLES = [
  {
    id: 'plants',
    pairs: pairTable(`
1|root|корень|тамыр|absorbs water and minerals from the soil|всасывает воду и минеральные соли из почвы|топырақтан су мен минералды тұздарды сорады
1|leaf|лист|жапырақ|makes food from light by photosynthesis|создаёт питательные вещества на свету (фотосинтез)|жарықта қоректік заттар түзеді (фотосинтез)
1|stem|стебель|сабақ|carries water and food between the root and the leaves|проводит воду и вещества между корнем и листьями|тамыр мен жапырақтар арасында су мен заттарды өткізеді
1|flower|цветок|гүл|is the organ of seed reproduction|орган семенного размножения|тұқыммен көбею мүшесі
1|fruit|плод|жеміс|protects the seeds and helps spread them|защищает семена и помогает их распространению|тұқымды қорғайды және таралуына көмектеседі
1|seed|семя|тұқым|contains the embryo of a new plant|содержит зародыш нового растения|жаңа өсімдіктің ұрығы бар
2|stomata|устьица|лептесіктер|let gases in and out of the leaf|пропускают газы в лист и из него|жапыраққа газдарды кіргізіп-шығарады
2|pollen|пыльца|тозаң|carries the male sex cells of a plant|переносит мужские половые клетки растения|өсімдіктің аталық жыныс жасушаларын тасымалдайды
2|root hairs|корневые волоски|тамыр түктері|greatly increase the area that absorbs water|многократно увеличивают всасывающую поверхность корня|су сіңіретін бетті бірнеше есе арттырады
2|chlorophyll|хлорофилл|хлорофилл|the green pigment that captures sunlight|зелёный пигмент, улавливающий солнечный свет|күн сәулесін сіңіретін жасыл пигмент
3|xylem|ксилема (древесина)|ксилема (сүрек)|carries water up from the roots|проводит воду вверх от корней|суды тамырдан жоғары өткізеді
3|phloem|флоэма (луб)|флоэма (тін)|carries sugars from the leaves to other parts|проводит сахара от листьев к другим частям|қантты жапырақтан басқа мүшелерге өткізеді
3|spore|спора|спора|reproduces ferns and mosses without seeds|служит для размножения папоротников и мхов без семян|қырықжапырақ пен мүктерді тұқымсыз көбейтеді
1|bud|почка|бүршік|grows into a new shoot, leaves or a flower|даёт начало новому побегу, листьям или цветку|жаңа өркенге, жапырақтарға немесе гүлге бастама береді
1|petal|лепесток|күлте|attracts insects with its colour and scent|привлекает насекомых окраской и запахом|түсімен және иісімен жәндіктерді тартады
1|stamen|тычинка|аталық|makes the pollen|образует пыльцу|тозаң түзеді
1|pistil|пестик|аналық|forms a fruit from its ovary|образует плод из своей завязи|түйнегінен жеміс түзеді
1|bark|кора|қабық|protects the trunk of a tree|защищает ствол дерева|ағаш діңін қорғайды
1|tuber|клубень|түйнек|stores starch (as in a potato)|запасает крахмал (как у картофеля)|крахмал жинайды (картоптағы сияқты)
1|thorn|колючка|тікен|protects the plant from animals|защищает растение от животных|өсімдікті жануарлардан қорғайды
1|annual ring|годичное кольцо|жылдық сақина|shows the age of a tree|показывает возраст дерева|ағаштың жасын көрсетеді
1|rhizome|корневище|тамырсабақ|stores nutrients underground|запасает питательные вещества под землёй|қоректік заттарды жер астында жинайды
1|trunk|ствол|діңгек|holds up the crown of a tree and carries water|держит крону дерева и проводит воду|ағаштың басын ұстап тұрады және су өткізеді
1|crown|крона|ағаш басы|is formed by the branches and leaves of a tree|состоит из ветвей и листьев дерева|ағаштың бұтақтары мен жапырақтарынан тұрады
1|branch|ветка|бұтақ|grows from the trunk and carries leaves|отходит от ствола и несёт листья|діңнен өсіп, жапырақтарды көтеріп тұрады
1|nectar|нектар|нектар (гүл шырыны)|attracts insects with its sweet taste|привлекает насекомых сладким вкусом|тәтті дәмімен жәндіктерді тартады
1|needle|хвоинка|қылқан жапырақ|is the narrow leaf of a pine or spruce|служит узким листом сосны или ели|қарағай не шыршаның жіңішке жапырағы болады
1|leaf blade|листовая пластинка|жапырақ тақтасы|is the wide flat part of a leaf that catches light|широкая плоская часть листа, улавливающая свет|жарықты қабылдайтын жапырақтың жалпақ бөлігі болады
1|leaf vein|жилка листа|жапырақ жүйкесі|carries water and food through the leaf|проводит воду и вещества по листу|жапырақ ішімен су мен заттарды өткізеді
1|petiole|черешок|сағақ|joins the leaf blade to the stem|соединяет листовую пластинку со стеблем|жапырақ тақтасын сабақпен жалғайды
1|root cap|корневой чехлик|тамыр қалпақшасы|protects the growing tip of the root|защищает растущий кончик корня|тамырдың өсіп жатқан ұшын қорғайды
1|seed coat|семенная кожура|тұқым қабығы|protects the embryo inside the seed|защищает зародыш внутри семени|тұқым ішіндегі ұрықты қорғайды
1|embryo|зародыш семени|тұқым ұрығы|is the young plant inside a seed|представляет собой молодое растение внутри семени|тұқым ішіндегі жас өсімдік болады
1|stigma|рыльце пестика|аналық аузы|receives the pollen|принимает пыльцу|тозаңды қабылдайды
1|tendril|усик|мұртша|helps a climbing plant hold on to a support|помогает вьющемуся растению держаться за опору|өрмелеуші өсімдікке тіректі ұстануға көмектеседі
1|sepal|чашелистик|тостағанша жапырақшасы|protects the flower bud|защищает цветочный бутон|гүл бүршігін қорғайды
1|stem node|узел стебля|сабақ буыны|is the place where leaves grow from the stem|является местом, где от стебля отходят листья|жапырақтар сабақтан өсетін орын болады
`),
    ask: (p) => L(`What does the ${p.a.en} of a plant do?`, `Какую функцию выполняет ${p.a.ru} у растения?`, `Өсімдіктің ${p.a.kk} қандай қызмет атқарады?`),
    back: (p) => L(`Which part of a plant ${p.b.en}?`, `Какая часть растения ${p.b.ru}?`, `Өсімдіктің қай бөлігі ${p.b.kk}?`),
  },
  {
    id: 'eco',
    pairs: pairTable(`
1|producers|продуценты|продуценттер|make organic matter from inorganic (green plants)|создают органические вещества из неорганических (зелёные растения)|бейорганикалық заттан органикалық зат түзеді (жасыл өсімдіктер)
1|consumers|консументы|консументтер|eat ready-made organic matter (animals)|питаются готовыми органическими веществами (животные)|дайын органикалық затпен қоректенеді (жануарлар)
1|decomposers|редуценты|редуценттер|break down dead remains (fungi, bacteria)|разлагают мёртвые остатки (грибы, бактерии)|өлі қалдықтарды ыдыратады (саңырауқұлақтар, бактериялар)
1|food chain|пищевая цепь|қоректік тізбек|the order in which organisms eat one another|последовательность, в которой организмы поедают друг друга|ағзалардың бірін-бірі жеу реті
2|ecosystem|экосистема|экожүйе|living organisms together with their environment|живые организмы вместе со средой обитания|тірі ағзалар мен олардың тіршілік ортасы бірге
2|population|популяция|популяция|a group of one species living in one area|группа особей одного вида на одной территории|бір аумақта тіршілік ететін бір түрдің дарақтар тобы
2|habitat|среда обитания|тіршілік ортасы|the place where an organism naturally lives|место, где организм живёт в природе|ағза табиғатта тіршілік ететін орын
2|predator|хищник|жыртқыш|an animal that hunts and eats other animals|животное, которое охотится на других животных и поедает их|басқа жануарларды аулап жейтін жануар
2|parasite|паразит|паразит|lives on or in another organism and harms it|живёт на другом организме или внутри него и вредит ему|басқа ағзаның үстінде не ішінде тіршілік етіп, оған зиян келтіреді
3|symbiosis|симбиоз|симбиоз|a close relationship that benefits both partners|тесное сожительство, выгодное обоим партнёрам|екі серікке де пайдалы тығыз қарым-қатынас
3|biosphere|биосфера|биосфера|the layer of the Earth where life exists|оболочка Земли, населённая живыми организмами|тірі ағзалар мекендейтін Жер қабығы
3|Red Book|Красная книга|Қызыл кітап|a list of rare and endangered species|список редких и исчезающих видов|сирек және жойылып бара жатқан түрлердің тізімі
3|biodiversity|биоразнообразие|биоәртүрлілік|the variety of living things in an area|разнообразие живых организмов на территории|аумақтағы тірі ағзалардың алуан түрлілігі
1|pollution|загрязнение|ластану|harmful substances getting into air, water or soil|попадание вредных веществ в воздух, воду или почву|зиянды заттардың ауаға, суға немесе топыраққа түсуі
1|recycling|переработка отходов|қалдықты қайта өңдеу|using waste again to make new things|повторное использование отходов для новых вещей|қалдықты қайта пайдаланып жаңа заттар жасау
1|nature reserve|заповедник|қорық|a protected area where nature is left untouched|охраняемая территория с нетронутой природой|табиғаты қорғалатын, қол тигізілмейтін аумақ
1|deforestation|вырубка лесов|орман кесу|the mass cutting down of forests|массовая рубка лесов|ормандарды жаппай кесу
1|food web|пищевая сеть|қоректік желі|many food chains linked together|множество пищевых цепей, связанных между собой|бір-бірімен байланысқан көптеген қоректік тізбек
1|prey|жертва|олжа|an animal that a predator hunts|животное, на которое охотится хищник|жыртқыш аулайтын жануар
1|ozone layer|озоновый слой|озон қабаты|shields living things from harmful ultraviolet rays|защищает живое от вредного ультрафиолета|тіршілікті зиянды ультракүлгін сәулелерден қорғайды
1|natural resources|природные ресурсы|табиғи ресурстар|materials from nature that people use, such as water, coal and wood|природные богатства, которыми пользуется человек: вода, уголь, древесина|адам пайдаланатын табиғи байлықтар: су, көмір, ағаш
1|hibernation|спячка|қысқы ұйқы|a deep winter sleep of some animals|глубокий зимний сон некоторых животных|кейбір жануарлардың терең қысқы ұйқысы
1|migration|миграция (перелёт)|көші-қон|the seasonal movement of animals to other regions|сезонное перемещение животных в другие края|жануарлардың басқа өңірге маусымдық көшуі
1|soil|почва|топырақ|the fertile upper layer of land|плодородный верхний слой суши|құрлықтың құнарлы жоғарғы қабаты
1|greenhouse effect|парниковый эффект|жылыжай эффектісі|warming caused by gases that hold heat in the atmosphere|потепление из-за газов, удерживающих тепло в атмосфере|атмосферада жылуды ұстайтын газдардан болатын жылыну
1|acid rain|кислотный дождь|қышқылды жаңбыр|rain polluted by sulfur and nitrogen oxides|дождь, загрязнённый оксидами серы и азота|күкірт және азот оксидтерімен ластанған жаңбыр
1|endangered species|исчезающий вид|жойылу қаупіндегі түр|a species that is at risk of dying out|вид, которому грозит вымирание|жойылу қаупі төнген түр
1|renewable energy|возобновляемая энергия|жаңартылатын энергия|energy from sources that do not run out, such as sun and wind|энергия неисчерпаемых источников, например солнца и ветра|күн мен жел сияқты таусылмайтын көздердің энергиясы
1|waste|отходы|қалдықтар|materials that are thrown away after use|материалы, которые выбрасывают после использования|пайдаланғаннан кейін тасталатын материалдар
1|compost|компост|компост|rotten plant remains used to fertilise soil|перегнившие остатки растений для удобрения почвы|топырақты тыңайтуға арналған шіріген өсімдік қалдықтары
1|extinction|вымирание|жойылу|the complete disappearance of a species|полное исчезновение вида|түрдің толық жоғалуы
1|adaptation|приспособленность|бейімделу|a feature that helps an organism survive in its environment|особенность, помогающая организму выживать в среде обитания|ағзаға тіршілік ортасында аман қалуға көмектесетін ерекшелік
1|competition between species|конкуренция между организмами|ағзалар арасындағы бәсеке|rivalry of organisms for food, light and space|борьба организмов за пищу, свет и место|ағзалардың азық, жарық және орын үшін күресі
1|water cycle|круговорот воды|судың айналымы|the movement of water between the sea, the air and the land|движение воды между морем, воздухом и сушей|судың теңіз, ауа және құрлық арасындағы қозғалысы
1|ecology|экология|экология|the science of how living things relate to their environment|наука о связях живых организмов со средой|тірі ағзалардың қоршаған ортамен байланысын зерттейтін ғылым
1|overfishing|перелов|шамадан тыс балық аулау|catching fish faster than they can reproduce|вылов рыбы быстрее, чем она успевает размножаться|балықты өсіп-өнуінен жылдам ауландыру
1|poaching|браконьерство|браконьерлік|illegal hunting or fishing|незаконная охота или рыбная ловля|заңсыз аң аулау немесе балық аулау
1|afforestation|лесовосстановление|орман отырғызу|planting new forests where trees were cut down|посадка новых лесов на месте вырубленных|кесілген орнына жаңа орман отырғызу
1|waste sorting|раздельный сбор мусора|қоқысты бөлек жинау|collecting different kinds of rubbish separately|раздельный сбор разных видов мусора|қоқыстың әртүрлі түрін бөлек жинау
`),
    ask: (p) => L(`What are «${p.a.en}» in ecology?`, `Что такое «${p.a.ru}» в экологии?`, `Экологияда «${p.a.kk}» дегеніміз не?`),
    back: (p) => L(`Which term means: ${p.b.en}?`, `Какой термин означает: ${p.b.ru}?`, `Қай термин мынаны білдіреді: ${p.b.kk}?`),
  },
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
1|cytoplasm|цитоплазма|цитоплазма|is the jelly-like substance in which organelles float|желеобразная среда, в которой расположены органоиды|органоидтар орналасқан желе тәрізді орта болады
1|organelle|органоид|органоид|is a permanent part of a cell with its own job|постоянная часть клетки со своей работой|өз қызметі бар жасушаның тұрақты бөлігі болады
1|tissue|ткань|ұлпа|is a group of similar cells that do one job|группа сходных клеток, выполняющих одну работу|бір жұмыс атқаратын ұқсас жасушалар тобы болады
1|chromosome|хромосома|хромосома|is a thread-like structure in the nucleus that carries genes|нитевидная структура в ядре, несущая гены|құрамында гендері бар ядродағы жіп тәрізді құрылым болады
1|gene|ген|ген|is a unit of heredity that controls one feature|единица наследственности, определяющая один признак|бір белгіні анықтайтын тұқым қуалаушылық бірлігі болады
1|microscope|микроскоп|микроскоп|is the instrument used to look at cells|прибор для рассматривания клеток|жасушаларды қарауға арналған құрал болады
1|bacterium|бактерия|бактерия|is a single-celled organism without a nucleus|одноклеточный организм без ядра|ядросы жоқ бір жасушалы ағза болады
1|amoeba|амёба|амеба|is a single-celled animal that keeps changing its shape|одноклеточное животное, которое постоянно меняет форму|пішінін үнемі өзгертетін бір жасушалы жануар болады
1|virus|вирус|вирус|is a non-cellular particle that multiplies only inside living cells|неклеточная частица, размножающаяся только в живых клетках|тек тірі жасушаның ішінде көбейетін жасушасыз бөлшек болады
`),
    ask: (p) => L(`What does the ${p.a.en} do?`, `Какую функцию выполняет ${p.a.ru}?`, `${p.a.kk} қандай қызмет атқарады?`),
    back: (p) => L(`Which part of the cell ${p.b.en}?`, `Какая часть клетки ${p.b.ru}?`, `Жасушаның қай бөлігі ${p.b.kk}?`),
  },
  {
    id: 'proc',
    pairs: pairTable(`
1|photosynthesis|фотосинтез|фотосинтез|plants make sugar and oxygen from carbon dioxide and water in light|растения на свету образуют сахар и кислород из углекислого газа и воды|өсімдіктер жарықта көмірқышқыл газы мен судан қант пен оттегі түзеді
1|respiration|дыхание (клеточное)|тыныс алу (жасушалық)|cells break down sugar with oxygen to release energy|клетки расщепляют сахар с помощью кислорода и получают энергию|жасушалар оттегі арқылы қантты ыдыратып, энергия алады
2|mitosis|митоз|митоз|division that gives two identical body cells|деление, дающее две одинаковые клетки тела|екі бірдей дене жасушасын беретін бөліну
2|meiosis|мейоз|мейоз|division that halves the chromosomes and gives sex cells|деление, которое уменьшает число хромосом вдвое и даёт половые клетки|хромосома санын екі есе азайтып, жыныс жасушаларын беретін бөліну
2|diffusion|диффузия|диффузия|particles move from where there are more of them to where there are fewer|частицы переходят оттуда, где их больше, туда, где их меньше|бөлшектер көп жерден аз жерге қарай өтеді
2|osmosis|осмос|осмос|water passes through a membrane towards the more concentrated solution|вода проходит через мембрану в сторону более концентрированного раствора|су мембрана арқылы концентрациясы жоғары ерітіндіге қарай өтеді
3|transcription|транскрипция|транскрипция|an RNA copy is made from DNA|синтез РНК на матрице ДНК|ДНҚ үлгісі бойынша РНҚ синтезі
3|translation|трансляция|трансляция|a protein is assembled on a ribosome from an RNA message|сборка белка на рибосоме по информации РНК|РНҚ ақпараты бойынша рибосомада ақуыз құрастыру
3|mutation|мутация|мутация|a sudden inherited change in the DNA|внезапное наследуемое изменение ДНК|ДНҚ-ның кенеттен болатын тұқым қуалайтын өзгерісі
3|fermentation|брожение|ашу|breaking down sugar without oxygen|расщепление сахара без кислорода|қантты оттегісіз ыдырату
1|growth|рост|өсу|an increase in the size of an organism and the number of its cells|увеличение размеров организма и числа его клеток|ағза мөлшерінің және жасушалар санының артуы
1|metabolism|обмен веществ|зат алмасу|all the chemical reactions that keep an organism alive|все химические реакции, поддерживающие жизнь организма|ағза тіршілігін қамтамасыз ететін барлық химиялық реакциялар
1|reproduction|размножение|көбею|the production of new organisms of the same kind|появление новых организмов того же вида|сол түрдің жаңа ағзаларының пайда болуы
1|nutrition|питание|қоректену|taking in substances that give energy and building material|поступление веществ, дающих энергию и строительный материал|энергия мен құрылыс материалын беретін заттардың түсуі
1|excretion|выделение|бөліп шығару|removing waste products from the body|удаление из организма ненужных продуктов обмена|ағзадан қажетсіз алмасу өнімдерін шығару
1|irritability|раздражимость|тітіркенгіштік|the ability to react to changes in the environment|способность реагировать на изменения среды|ортадағы өзгерістерге жауап беру қабілеті
1|germination|прорастание|өну|the beginning of a seed's growth into a new plant|начало роста семени в новое растение|тұқымның жаңа өсімдікке айналып өсе бастауы
1|heredity|наследственность|тұқым қуалаушылық|the passing of features from parents to offspring|передача признаков от родителей потомкам|белгілердің ата-анадан ұрпаққа берілуі
`),
    ask: (p) => L(`What is ${p.a.en}?`, `Что такое ${p.a.ru}?`, `${p.a.kk} дегеніміз не?`),
    back: (p) => L(`Which process is this: ${p.b.en}?`, `Какой это процесс: ${p.b.ru}?`, `Бұл қандай үдеріс: ${p.b.kk}?`),
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
1|Louis Pasteur|Луи Пастер|Луи Пастер|pasteurisation and the rabies vaccine|пастеризация и вакцина против бешенства|пастерлеу және құтыруға қарсы вакцина
1|Alexander Fleming|Александр Флеминг|Александр Флеминг|penicillin, the first antibiotic|пенициллин - первый антибиотик|пенициллин - алғашқы антибиотик
1|Robert Hooke|Роберт Гук|Роберт Гук|the cell (he was first to describe it)|клетка (первым описал её)|жасуша (оны алғаш сипаттаған)
1|Antonie van Leeuwenhoek|Антони ван Левенгук|Антони ван Левенгук|microorganisms seen through a microscope|микроорганизмы, увиденные в микроскоп|микроскоппен көрінген микроағзалар
3|Watson and Crick|Уотсон и Крик|Уотсон мен Крик|the double helix structure of DNA|двойная спираль ДНК|ДНҚ-ның қос спиралі
1|William Harvey|Уильям Гарвей|Уильям Гарвей|the circulation of blood|кровообращение|қан айналымы
1|Carl Linnaeus|Карл Линней|Карл Линней|the system of naming species with two words|система двойных названий видов|түрлерді екі сөзбен атау жүйесі
1|Ivan Pavlov|Иван Павлов|Иван Павлов|conditioned reflexes|условные рефлексы|шартты рефлекстер
3|Ilya Mechnikov|Илья Мечников|Илья Мечников|phagocytosis (cells that swallow microbes)|фагоцитоз (клетки, поглощающие микробов)|фагоцитоз (микробтарды жұтатын жасушалар)
1|Edward Jenner|Эдвард Дженнер|Эдвард Дженнер|the first vaccine, against smallpox|первая вакцина - против оспы|алғашқы вакцина - шешекке қарсы
1|Robert Koch|Роберт Кох|Роберт Кох|the bacterium that causes tuberculosis|возбудитель туберкулёза|туберкулездің қоздырғышы
3|Jean-Baptiste Lamarck|Жан-Батист Ламарк|Жан-Батист Ламарк|the first complete theory of evolution|первая целостная теория эволюции|алғашқы тұтас эволюция теориясы
3|Nikolai Vavilov|Николай Вавилов|Николай Вавилов|the centres of origin of cultivated plants|центры происхождения культурных растений|мәдени өсімдіктердің шығу орталықтары
3|Vladimir Vernadsky|Владимир Вернадский|Владимир Вернадский|the doctrine of the biosphere|учение о биосфере|биосфера туралы ілім
3|Ivan Sechenov|Иван Сеченов|Иван Сеченов|the reflexes of the brain|рефлексы головного мозга|ми рефлекстері
1|Aristotle|Аристотель|Аристотель|the first classification of animals|первая классификация животных|жануарлардың алғашқы жіктелуі
1|Jane Goodall|Джейн Гудолл|Джейн Гудолл|decades of study of wild chimpanzees|многолетнее изучение диких шимпанзе|жабайы шимпанзелерді көп жылдар зерттеу
1|Ivan Michurin|Иван Мичурин|Иван Мичурин|breeding new fruit varieties by hybridisation|выведение новых сортов плодовых растений путём гибридизации|будандастыру арқылы жеміс өсімдіктерінің жаңа сорттарын шығару
1|Frederick Banting|Фредерик Бантинг|Фредерик Бантинг|the discovery of insulin|открытие инсулина|инсулинді ашу
2|Theodor Schwann|Теодор Шванн|Теодор Шванн|the cell theory, with Schleiden|клеточная теория (вместе со Шлейденом)|жасуша теориясы (Шлейденмен бірге)
2|Rudolf Virchow|Рудольф Вирхов|Рудольф Вирхов|the principle that every cell comes from another cell|принцип «каждая клетка из клетки»|«әрбір жасуша жасушадан» қағидасы
2|Robert Brown|Роберт Броун|Роберт Броун|the cell nucleus|клеточное ядро|жасуша ядросы
2|Thomas Hunt Morgan|Томас Морган|Томас Морган|the chromosome theory of heredity, based on fruit flies|хромосомная теория наследственности на опытах с дрозофилой|дрозофила тәжірибелеріне негізделген тұқым қуалаудың хромосомалық теориясы
2|Kliment Timiryazev|Климент Тимирязев|Климент Тимирязев|studies of photosynthesis in green plants|исследования фотосинтеза у зелёных растений|жасыл өсімдіктердегі фотосинтезді зерттеу
2|Ernst Haeckel|Эрнст Геккель|Эрнст Геккель|the term "ecology"|термин «экология»|«экология» терминін енгізу
3|Camillo Golgi|Камилло Гольджи|Камилло Гольджи|the organelle later named after him|органоид клетки, названный его именем|өз атымен аталған жасуша органоиды
3|Hugo de Vries|Хуго де Фриз|Гуго де Фриз|the mutation theory|мутационная теория|мутация теориясы
3|Andreas Vesalius|Андреас Везалий|Андреас Везалий|the first accurate book on human anatomy|первый точный труд по анатомии человека|адам анатомиясы жайлы алғашқы нақты еңбек
1|Hippocrates|Гиппократ|Гиппократ|the oath of doctors and the idea of medicine as a science|клятва врачей и взгляд на медицину как на науку|дәрігерлер антты және медицинаны ғылым деп қарау
1|Florence Nightingale|Флоренс Найтингейл|Флоренс Найтингейл|the foundations of modern nursing|основы современного ухода за больными|заманауи мейірбикелік күтімнің негізі
1|Nikolai Pirogov|Николай Пирогов|Николай Пирогов|field surgery and the use of anaesthesia in war|военно-полевая хирургия и применение наркоза на войне|далалық хирургия және соғыста наркозды қолдану
1|Joseph Lister|Джозеф Листер|Джозеф Листер|antiseptics in surgery|антисептика в хирургии|хирургиядағы антисептика
1|Christiaan Barnard|Кристиан Барнард|Кристиан Барнард|the first human heart transplant|первая пересадка сердца человеку|адам жүрегін алғаш рет ауыстырып салу
1|Jonas Salk|Джонас Солк|Джонас Солк|the first polio vaccine|первая вакцина против полиомиелита|полиомиелитке қарсы алғашқы вакцина
1|Rachel Carson|Рэйчел Карсон|Рэйчел Карсон|a book on the harm of pesticides that started the environmental movement|книга о вреде пестицидов, давшая начало движению в защиту природы|табиғатты қорғау қозғалысына бастау болған пестицид зияны туралы кітап
1|Alexander von Humboldt|Александр фон Гумбольдт|Александр фон Гумбольдт|the study of how plants are spread across the world|изучение того, как растения распределены по миру|өсімдіктердің әлемде таралуын зерттеу
1|Jacques Cousteau|Жак Кусто|Жак Кусто|the exploration of the underwater world|исследование подводного мира|су асты әлемін зерттеу
1|Dian Fossey|Дайан Фосси|Дайан Фосси|the study and protection of mountain gorillas|изучение и защита горных горилл|тау гориллаларын зерттеу және қорғау
1|Avicenna (Ibn Sina)|Авиценна (Ибн Сина)|Авиценна (Ибн Сина)|The Canon of Medicine|«Канон врачебной науки»|«Медицина каноны»
1|Gerald Durrell|Джеральд Даррелл|Джеральд Даррелл|saving rare animals and books about them|спасение редких животных и книги о них|сирек жануарларды сақтау және олар туралы кітаптар
1|Nikolai Przhevalsky|Николай Пржевальский|Николай Пржевальский|the description of the wild horse of Central Asia|описание дикой лошади Центральной Азии|Орталық Азияның жабайы жылқысын сипаттау
1|Jean-Henri Fabre|Жан-Анри Фабр|Жан-Анри Фабр|studies of the behaviour of insects|исследования поведения насекомых|жәндіктердің мінез-құлқын зерттеу
1|Alfred Brehm|Альфред Брем|Альфред Брем|the multi-volume book "Life of Animals"|многотомная книга «Жизнь животных»|көп томдық «Жануарлар тіршілігі» кітабы
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
  if (rng() < 0.45) {
    const ok = rng() < 0.5;
    const other = wrong[0];
    return tfQ(ctx, topic, d, {
      prompt: ok ? pairPrompt(p.a, p.b) : pairPrompt(p.a, other.b),
      ok,
      ex: L(`Correct: ${p.a.en} - ${p.b.en}.`, `Верно так: ${p.a.ru} - ${p.b.ru}.`, `Дұрысы: ${p.a.kk} - ${p.b.kk}.`),
      id: `${topic}:${t.id}:tf${ok ? 't' : 'f'}:${p.a.en}`,
    });
  }
  // Для витаминов вопрос всегда «чего не хватает» - ответ слева.
  const forward = t.ask ? !t.back || rng() < 0.5 : false;
  const ex = L(`${p.a.en} - ${p.b.en}.`, `${p.a.ru} - ${p.b.ru}.`, `${p.a.kk} - ${p.b.kk}.`);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: forward ? t.ask(p) : t.back(p),
    ex,
    mc: forward ? mcOf(rng, p.b, wrong.map((x) => x.b)) : mcOf(rng, p.a, wrong.map((x) => x.a)),
  });
  q.id = `${topic}:${t.id}:${forward ? 'f' : 'b'}:${p.a.en}`;
  return q;
}

/** Из каких видов заданий состоит каждая тема биологии. */
const PARTS = {
  animals: ['animal'],
  body: ['organ', 'organ', 'organ', 'vit'],
  cell: ['cell', 'cell', 'proc', 'sci'],
  plants: ['plants'],
  eco: ['eco'],
  sci: ['sci'],
  nature: ['plants', 'eco', 'animal'],
};

/**
 * Генератор биологии. part: animals - классы животных; body - органы, системы и витамины;
 * cell - органоиды клетки и учёные.
 */
export function biologyMaker(topic, part) {
  return (ctx, d) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const kind = pick(ctx.rng, PARTS[part]);
      const q = kind === 'animal' ? animalTask(ctx, topic, d) : kind === 'organ' ? organTask(ctx, topic, d) : tableTask(ctx, topic, d, kind);
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
      `A - ${trait.dom.ru} (доминантный признак), a - ${trait.rec.ru}. Родители ${p1} × ${p2}. Какая доля потомков будет ${what.ru}?`,
      `A - ${trait.dom.kk} (доминантты белгі), a - ${trait.rec.kk}. Ата-аналар ${p1} × ${p2}. Ұрпақтың қандай үлесі ${what.kk} болады?`,
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
      ? L('In RNA, A pairs with U (there is no T), T with A, G with C.', 'В РНК против A ставится U (тимина в РНК нет), против T - A, против G - C.', 'РНҚ-да A-ға қарсы U (РНҚ-да тимин жоқ), T-ға қарсы A, G-ге қарсы C тұрады.')
      : L('Complementarity: A pairs with T, G pairs with C.', 'Комплементарность: A соединяется с T, G - с C.', 'Комплементарлық: A мен T, G мен C жұптасады.'),
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
