// Программа A1: грамматика. Каждая тема - отдельный пункт программы CEFR A1.

import { L } from '../../gen.js';
import { G, SUBJ, SUBJ_SAFE, beOf, cap, cross, doOf, hasOf, low, table, wasOf } from './core.js';
import { ALL_VERBS } from '../verbs.js';

const NOT_BE = { 1: 'am not', 3: "isn't", 2: "aren't", pl: "aren't" };
const wrongBe = (p) => ['am', 'is', 'are'].filter((x) => x !== beOf(p));

// ---------- to be ----------
const BE_C = ['at home', 'hungry', 'from Kazakhstan', 'in the classroom', 'very happy today', 'ready for the lesson', 'late again', 'tired', 'in the park', 'good at maths', 'cold', 'busy today', 'on holiday', 'in the kitchen', 'at school now', 'ten minutes early'];

const tobe = {
  name: L('To be: am, is, are', 'To be: am, is, are', 'To be: am, is, are'),
  rules: {
    main: L('To be in the present: I am, he / she / it is, you / we / they are.', 'Глагол to be в настоящем: I am, he / she / it is, you / we / they are.', 'To be осы шақта: I am, he / she / it is, you / we / they are.'),
    neg: L('Negative: am not, isn\'t (is not), aren\'t (are not). Do / does are not used with to be.', 'Отрицание: am not, isn\'t (is not), aren\'t (are not). Do / does с to be не нужны.', 'Болымсыз түрі: am not, isn\'t (is not), aren\'t (are not). To be-мен do / does қолданылмайды.'),
    q: L('Questions: put am / is / are before the subject: Is she at home? Are you ready?', 'Вопрос: am / is / are ставим перед подлежащим: Is she at home? Are you ready?', 'Сұрақ: am / is / are бастауыштың алдына қойылады: Is she at home? Are you ready?'),
    short: L('Short answers repeat the verb: Yes, I am. / No, he isn\'t. In "yes" answers there is no short form: Yes, they are (not "they\'re").', 'Краткий ответ повторяет глагол: Yes, I am. / No, he isn\'t. В ответе «да» сокращения нет: Yes, they are (не they\'re).', 'Қысқа жауап етістікті қайталайды: Yes, I am. / No, he isn\'t. «Иә» жауабында қысқарту жоқ: Yes, they are (they\'re емес).'),
  },
  levels: {
    1: () => [
      ...cross(SUBJ, BE_C, (x, c) => [`${x.s} ${G} ${c}.`, beOf(x.p), [...wrongBe(x.p), 'be']]),
      ...cross(SUBJ, BE_C.slice(0, 8), (x, c) => [`${x.s} ${G} ${c}. (not)`, NOT_BE[x.p], x.p === 1 ? ["isn't", "don't", 'not am'] : x.p === 3 ? ["aren't", "doesn't", 'not is'] : ["isn't", "don't", 'not are'], 'neg']),
      ...cross(SUBJ.filter((x) => x.s !== 'I'), BE_C.slice(0, 10), (x, c) => [`${G} ${low(x.s)} ${c}?`, cap(beOf(x.p)), [...wrongBe(x.p).map(cap), x.p === 3 ? 'Does' : 'Do'], 'q']),
      ...SUBJ_SAFE.filter((x) => x.s !== 'I').flatMap((x) => {
        const you = x.s === 'You';
        const ans = you ? 'I' : x.pr;
        const v = you ? 'am' : beOf(x.p);
        const neg = you ? 'am not' : NOT_BE[x.p];
        return [
          [`${cap(beOf(x.p))} ${low(x.s)} hungry? - Yes, ${ans} ${G}.`, v, v === 'am' ? ['is', 'are', 'do'] : v === 'is' ? ["he's", 'are', 'does'].map((w) => (w === "he's" ? `${ans}'s` : w)) : [`${ans}'re`, 'is', 'do'], 'short'],
          [`${cap(beOf(x.p))} ${low(x.s)} at home? - No, ${ans} ${G}.`, neg, neg === 'am not' ? ["isn't", "don't", 'not'] : neg === "isn't" ? ["aren't", "doesn't", 'not'] : ["isn't", "don't", 'not'], 'short'],
        ];
      }),
    ],
  },
};

// ---------- Местоимения и притяжательные ----------
const PEOPLE = table(`
my brother|He|His|Arman
my sister|She|Her|Dana
my uncle|He|His|Serik
my aunt|She|Her|Gulnar
my grandfather|He|His|Bolat
my grandmother|She|Her|Saule
my dad|He|His|Nurlan
my mum|She|Her|Aigul
my best friend Tom|He|His|Tom
my friend Aliya|She|Her|Aliya
`);
const POS_WRONG = { His: ['He', 'Him', 'Her'], Her: ['She', 'Hers', 'His'], My: ['Me', 'I', 'Mine'], Our: ['Us', 'We', 'Ours'], Their: ['They', 'Them', 'There'], Its: ["It's", 'It', 'Their'], Your: ['You', 'Yours', "You're"] };
const SUB_WRONG = { He: ['His', 'Him', 'She'], She: ['Her', 'Hers', 'He'], They: ['Them', 'Their', 'It'], It: ['Its', 'They', 'Them'], We: ['Us', 'Our', 'They'], I: ['Me', 'My', 'Mine'] };
const OWNERS = table(`
I have|My
We have|Our
Tom has|His
Aliya has|Her
My cousins have|Their
You have|Your
`);
const THINGS = table(`
a new bike|bike|red
a dog|dog|very friendly
a big garden|garden|beautiful
a new phone|phone|black
a small room|room|clean
a cat|cat|grey
a computer|computer|fast
a car|car|old
`);
const SUBJ_CTX = table(`
My brother is twelve.|He|is good at football
My sister is a student.|She|lives in Astana
My parents are doctors.|They|work in a big hospital
This is our cat.|It|is three years old
Aliya and I are friends.|We|go to the same school
My grandmother is seventy.|She|likes gardening
Tom is my neighbour.|He|has two dogs
My cousins are from Almaty.|They|visit us every summer
Look at that bird!|It|is very small
I am Dana.|I|am ten years old
My dad is a pilot.|He|flies to many countries
Our teachers are very kind.|They|help us a lot
`);

const pronouns = {
  name: L('Personal pronouns and possessive adjectives', 'Личные местоимения и притяжательные', 'Жіктеу және тәуелдік есімдіктер'),
  rules: {
    sub: L('Before a verb we use the subject pronoun: I, you, he, she, it, we, they.', 'Перед глаголом стоит личное местоимение-подлежащее: I, you, he, she, it, we, they.', 'Етістіктің алдында бастауыш болатын жіктеу есімдігі тұрады: I, you, he, she, it, we, they.'),
    pos: L('Before a noun we use a possessive adjective: my, your, his (a man), her (a woman), its (a thing or animal), our, their.', 'Перед существительным - притяжательное: my, your, his (у него), her (у неё), its (у предмета, животного), our, their.', 'Зат есімнің алдында тәуелдік есімдік тұрады: my, your, his (ер адамның), her (әйелдің), its (заттың, жануардың), our, their.'),
  },
  levels: {
    1: () => [
      ...PEOPLE.flatMap(([who, , pos, nm]) => [
        [`This is ${who}. ${G} name is ${nm}.`, pos, POS_WRONG[pos], 'pos'],
        [`I love ${who}. ${G} smile is lovely.`, pos, POS_WRONG[pos], 'pos'],
        [`${cap(who)} is at work. ${G} office is in the city centre.`, pos, POS_WRONG[pos], 'pos'],
      ]),
      ...PEOPLE.map(([who, sub]) => [`${cap(who)} is very kind. ${G} always helps me.`, sub, SUB_WRONG[sub], 'sub']),
      ...cross(OWNERS, THINGS, ([o, pos], [a, n, adj]) => [`${o} ${a}. ${G} ${n} is ${adj}.`, pos, POS_WRONG[pos], 'pos']),
      ...SUBJ_CTX.map(([ctx, sub, rest]) => [`${ctx} ${G} ${rest}.`, sub, SUB_WRONG[sub], 'sub']),
      ...table(`
The dog is hungry. Please give it ${G} food.|its|it's|it|their
My cousins live in Astana. ${G} house is near the park.|Their|There|They're|Them
We love our school. ${G} teachers are great.|Our|Us|We|Ours
Is this ${G} bag, Tom?|your|you|yours|you're
I can't find ${G} keys. Where are they?|my|me|mine|I
`).map(([s, a, ...w]) => [s, a, w, 'pos']),
    ],
  },
};

// ---------- Множественное число ----------
const NOUNS = table(`
book|books|bookes|book|bookies
cat|cats|cates|cat|caties
car|cars|cares|car|caries
girl|girls|girles|girl|giries
apple|apples|applees|apple|appls
boy|boys|boies|boyes|boy
day|days|daies|dayes|day
key|keys|keies|keyes|key
toy|toys|toies|toyes|toy
box|boxes|boxs|boxies|box
bus|buses|buss|busies|bus
glass|glasses|glasss|glassies|glass
dress|dresses|dresss|dressies|dress
watch|watches|watchs|watchies|watch
dish|dishes|dishs|dishies|dish
brush|brushes|brushs|brushies|brush
peach|peaches|peachs|peachies|peach
fox|foxes|foxs|foxies|fox
sandwich|sandwiches|sandwichs|sandwichies|sandwich
potato|potatoes|potatos|potatoies|potato
tomato|tomatoes|tomatos|tomatoies|tomato
baby|babies|babys|babyes|baby
city|cities|citys|cityes|city
family|families|familys|familyes|family
party|parties|partys|partyes|party
country|countries|countrys|countryes|country
story|stories|storys|storyes|story
cherry|cherries|cherrys|cherryes|cherry
strawberry|strawberries|strawberrys|strawberryes|strawberry
dictionary|dictionaries|dictionarys|dictionaryes|dictionary
knife|knives|knifes|knifs|knife
wife|wives|wifes|wifs|wife
leaf|leaves|leafs|leafes|leaf
wolf|wolves|wolfs|wolfes|wolf
shelf|shelves|shelfs|shelfes|shelf
man|men|mans|mens|man
woman|women|womans|womens|woman
child|children|childs|childrens|child
tooth|teeth|tooths|teeths|tooth
foot|feet|foots|feets|foot
mouse|mice|mouses|mices|mouse
sheep|sheep|sheeps|sheepes|sheepies
`);

const plural = {
  name: L('Plural nouns', 'Множественное число существительных', 'Зат есімнің көпше түрі'),
  rules: {
    s: L('Most nouns add -s: book - books. After a vowel + y just add -s: boy - boys.', 'Обычно добавляем -s: book - books. После гласной + y тоже просто -s: boy - boys.', 'Көбіне -s қосылады: book - books. Дауысты + y-тан кейін де жай -s: boy - boys.'),
    es: L('After s, ss, x, ch, sh and often after o we add -es: box - boxes, watch - watches, tomato - tomatoes.', 'После s, ss, x, ch, sh и часто после o добавляем -es: box - boxes, watch - watches, tomato - tomatoes.', 's, ss, x, ch, sh-тан кейін және көбіне o-дан кейін -es қосылады: box - boxes, watch - watches, tomato - tomatoes.'),
    ies: L('Consonant + y changes to -ies: baby - babies, city - cities.', 'Согласная + y меняется на -ies: baby - babies, city - cities.', 'Дауыссыз + y әрпі -ies болып өзгереді: baby - babies, city - cities.'),
    ves: L('Many nouns in -f or -fe change to -ves: knife - knives, leaf - leaves.', 'Многие слова на -f, -fe меняются на -ves: knife - knives, leaf - leaves.', '-f, -fe-ге бітетін көп сөз -ves болып өзгереді: knife - knives, leaf - leaves.'),
    irr: L('Some plurals are irregular: man - men, woman - women, child - children, tooth - teeth, foot - feet, mouse - mice, person - people, sheep - sheep.', 'Особые формы: man - men, woman - women, child - children, tooth - teeth, foot - feet, mouse - mice, person - people, sheep - sheep.', 'Ерекше түрлер: man - men, woman - women, child - children, tooth - teeth, foot - feet, mouse - mice, person - people, sheep - sheep.'),
  },
  levels: {
    1: () =>
      NOUNS.flatMap(([n, pl, ...w], i) => {
        const r = i < 9 ? 's' : i < 21 ? 'es' : i < 30 ? 'ies' : i < 35 ? 'ves' : 'irr';
        const wrong = w.filter((x) => x !== pl).slice(0, 3);
        return [
          [`one ${n} - two ${G}`, pl, wrong, r],
          [`I can see five ${G} in the picture.`, pl, wrong, r],
          [`There are a lot of ${G} here.`, pl, wrong, r],
        ];
      }),
  },
};

// ---------- Артикли ----------
const AN = 'apple|egg|orange|umbrella|elephant|idea|hour|island|onion|ice cream|engineer|artist|actor|old car|interesting book|easy question|English lesson|honest boy|eagle|octopus'.split('|');
const A = 'banana|dog|university|uniform|European city|horse|one-way street|useful book|house|teacher|doctor|pen|big apple|new idea|yellow umbrella|small egg|car|unicorn|letter|window'.split('|');
const NO_ART = table(`
We play ${G} football after school.|football
I usually have ${G} breakfast at seven.|breakfast
She speaks ${G} English very well.|English
They go to school by ${G} bus.|bus
My cousin lives in ${G} London.|London
We have ${G} lunch at one o'clock.|lunch
He likes ${G} music very much.|music
Do you play ${G} tennis?|tennis
I was born in ${G} Kazakhstan.|Kazakhstan
We have ${G} dinner at eight.|dinner
Cats like ${G} milk.|milk
We have ${G} maths on Tuesdays.|maths
`);
const THE = table(`
I have a dog and a cat. ${G} dog is black.|dog
I bought a book and a pen. ${G} book is about animals.|book
${G} sun is very hot today.|sun
Look at ${G} moon! It's so big tonight.|moon
Can you close ${G} door, please? It's cold.|door
${G} capital of Kazakhstan is Astana.|capital
Please pass me ${G} salt.|salt
My dad works in a shop. ${G} shop is near our house.|shop
Who is ${G} girl in this photo?|girl
We live on ${G} third floor.|floor
${G} first lesson today is English.|first
Where are ${G} keys to the car?|keys
`);
const articles = {
  name: L('Articles: a, an, the', 'Артикли a, an, the', 'A, an, the артикльдері'),
  rules: {
    an: L('Use an before a vowel sound: an apple, an hour (h is silent).', 'An - перед гласным звуком: an apple, an hour (h не читается).', 'An - дауысты дыбыстың алдында: an apple, an hour (h оқылмайды).'),
    a: L('Use a before a consonant sound: a dog, a university (it starts with the sound "yu").', 'A - перед согласным звуком: a dog, a university (начинается со звука «ю»).', 'A - дауыссыз дыбыстың алдында: a dog, a university (басында «ю» дыбысы).'),
    the: L('Use the for something already mentioned, the only one of its kind (the sun) or clear from the situation (the door of this room).', 'The - для уже названного, единственного в своём роде (the sun) или понятного из ситуации (дверь этой комнаты).', 'The - бұрын аталған, жалғыз (the sun) немесе жағдайдан түсінікті нәрсе үшін (осы бөлменің есігі).'),
    zero: L('No article before sports, meals, languages, school subjects, most cities and countries, days, by + transport, and uncountable or plural nouns in general.', 'Без артикля: спорт, еда (breakfast), языки, предметы, большинство городов и стран, дни недели, by + транспорт, неисчисляемые и множественные в общем смысле.', 'Артикльсіз: спорт, ас (breakfast), тілдер, пәндер, көп қалалар мен елдер, апта күндері, by + көлік, жалпы мағынадағы саналмайтын және көпше зат есімдер.'),
  },
  levels: {
    1: () => {
      const no = L('no article', 'без артикля', 'артикльсіз');
      return [
        ...AN.flatMap((n) => [
          [`It is ${G} ${n}.`, 'an', ['a', 'some', 'these'], 'an'],
          [`This is ${G} ${n}.`, 'an', ['a', 'many', 'two'], 'an'],
        ]),
        ...A.flatMap((n) => [
          [`It is ${G} ${n}.`, 'a', ['an', 'some', 'these'], 'a'],
          [`This is ${G} ${n}.`, 'a', ['an', 'many', 'two'], 'a'],
        ]),
        ...NO_ART.map(([s]) => [s, no, ['a', 'an', 'the'], 'zero']),
        ...THE.map(([s]) => [s, s.startsWith(G) ? 'The' : 'the', s.startsWith(G) ? ['A', 'An', no] : ['a', 'an', no], 'the']),
      ];
    },
  },
};

// ---------- this, that, these, those ----------
const SG = 'book|bag|car|house|picture|bird|dog|cake|phone|chair|bike|kite'.split('|');
const PL = 'books|bags|cars|houses|pictures|birds|dogs|cakes|shoes|flowers|apples|boys'.split('|');
const NEAR = ['here in my hand', 'right here next to me', 'here on my desk'];
const FAR = ['over there', 'far away on the hill', 'over there across the road'];
const thisThat = {
  name: L('This, that, these, those', 'This, that, these, those', 'This, that, these, those'),
  rules: {
    main: L('Near: this (one thing), these (many). Far: that (one thing), those (many).', 'Рядом: this (один предмет), these (много). Далеко: that (один), those (много).', 'Жақында: this (бір зат), these (көп). Алыста: that (бір зат), those (көп).'),
  },
  levels: {
    1: () => {
      const opts = (a) => ['this', 'that', 'these', 'those'].filter((x) => x !== a);
      const out = [];
      SG.forEach((n, i) => {
        out.push([`Look at ${G} ${n} ${NEAR[i % 3]}.`, 'this', opts('this')]);
        out.push([`Look at ${G} ${n} ${FAR[i % 3]}.`, 'that', opts('that')]);
        out.push([`I really like ${G} ${n} ${FAR[(i + 1) % 3]}.`, 'that', opts('that')]);
        out.push([`I really like ${G} ${n} ${NEAR[(i + 1) % 3]}.`, 'this', opts('this')]);
      });
      PL.forEach((n, i) => {
        out.push([`Look at ${G} ${n} ${NEAR[i % 3]}.`, 'these', opts('these')]);
        out.push([`Look at ${G} ${n} ${FAR[i % 3]}.`, 'those', opts('those')]);
        out.push([`I really like ${G} ${n} ${FAR[(i + 2) % 3]}.`, 'those', opts('those')]);
        out.push([`I really like ${G} ${n} ${NEAR[(i + 2) % 3]}.`, 'these', opts('these')]);
      });
      return out;
    },
  },
};

// ---------- there is / there are ----------
const T_IS = table(`
a cat|in the garden
a big tree|in the garden
a bank|in our street
a new café|in our street
a computer|in the classroom
an old clock|on the wall
a sofa|in the living room
a lamp|on the desk
a bus stop|near the school
a swimming pool|in the town centre
a map|on the wall
a park|near my house
a bottle of water|in my bag
a hospital|in our town
a TV|in the kitchen
some milk|in the fridge
a lot of snow|in the mountains
some water|in the bottle
some cheese|on the plate
a lot of traffic|in the city centre
`);
const T_ARE = table(`
two cats|in the garden
three windows|in my room
twenty students|in our class
five chairs|in the kitchen
a lot of flowers|in the park
two beds|in the bedroom
four pictures|on the wall
many shops|in the town centre
some books|on the shelf
three bridges|in our city
two banks|in our street
some apples|in the fridge
`);
const anyOf = (n) => n.replace(/^(two|three|twenty|five|a lot of|four|many|some|a lot of) /, 'any ');
const thereis = {
  name: L('There is, there are', 'There is, there are', 'There is, there are'),
  rules: {
    main: L('There is + one thing or an uncountable noun (milk, snow). There are + plural nouns.', 'There is - один предмет или неисчисляемое (milk, snow). There are - множественное число.', 'There is - бір зат немесе саналмайтын зат есім (milk, snow). There are - көпше түр.'),
    q: L('Questions: Is there...? Are there any...? Negative: there isn\'t, there aren\'t (any).', 'Вопрос: Is there...? Are there any...? Отрицание: there isn\'t, there aren\'t (any).', 'Сұрақ: Is there...? Are there any...? Болымсыз: there isn\'t, there aren\'t (any).'),
  },
  levels: {
    1: () => [
      ...T_IS.map(([n, pl]) => [`There ${G} ${n} ${pl}.`, 'is', ['are', 'be', 'have']]),
      ...T_ARE.map(([n, pl]) => [`There ${G} ${n} ${pl}.`, 'are', ['is', 'be', 'has']]),
      ...T_IS.map(([n, pl]) => [`There ${G} ${n.startsWith('a') ? n : anyOf(n)} ${pl}. (not)`.replace('any lot of ', 'much '), "isn't", ["aren't", "doesn't", 'not is'], 'q']),
      ...T_ARE.map(([n, pl]) => [`There ${G} ${anyOf(n)} ${pl}. (not)`, "aren't", ["isn't", "don't", 'not are'], 'q']),
      ...T_IS.slice(0, 15).map(([n, pl]) => [`${G} ${n} ${pl}?`, 'Is there', ['Are there', 'There is', 'Has there'], 'q']),
      ...T_ARE.map(([n, pl]) => [`${G} ${anyOf(n)} ${pl}?`, 'Are there', ['Is there', 'There are', 'Have there'], 'q']),
      ...T_ARE.slice(0, 8).map(([n, pl]) => [`How many ${anyOf(n).slice(4)} ${G} ${pl}?`, 'are there', ['is there', 'there are', 'have there'], 'q']),
    ],
  },
};

// ---------- have got ----------
const HG = 'a brother|two sisters|a dog|a new bike|blue eyes|long hair|a big house|a cold|a lot of homework|three cousins|a computer|a guitar'.split('|');
const havegot = {
  name: L('Have got, has got', 'Have got / has got', 'Have got / has got'),
  rules: {
    main: L('Have got shows possession: I / you / we / they have got, he / she / it has got.', 'Have got - «у меня есть»: I / you / we / they have got, he / she / it has got.', 'Have got - «менде бар»: I / you / we / they have got, he / she / it has got.'),
    neg: L('Negative: haven\'t got / hasn\'t got. Questions: Have you got...? Has she got...? Short answers: Yes, I have. / No, she hasn\'t.', 'Отрицание: haven\'t got / hasn\'t got. Вопрос: Have you got...? Has she got...? Краткий ответ: Yes, I have. / No, she hasn\'t.', 'Болымсыз: haven\'t got / hasn\'t got. Сұрақ: Have you got...? Has she got...? Қысқа жауап: Yes, I have. / No, she hasn\'t.'),
  },
  levels: {
    1: () => [
      ...cross(SUBJ, HG, (x, t) => [`${x.s} ${G} ${t}.`, `${hasOf(x.p)} got`, [`${x.p === 3 ? 'have' : 'has'} got`, `${beOf(x.p)} got`, `${hasOf(x.p)} get`]]),
      ...cross(SUBJ, HG.slice(0, 6), (x, t) => [`${x.s} ${G} ${t}. (not)`, x.p === 3 ? "hasn't got" : "haven't got", x.p === 3 ? ["haven't got", "doesn't got", "hasn't get"] : ["hasn't got", "don't got", "haven't get"], 'neg']),
      ...cross(SUBJ.filter((x) => x.s !== 'I'), HG.slice(0, 8), (x, t) => [`${G} ${low(x.s)} got ${t}?`, x.p === 3 ? 'Has' : 'Have', x.p === 3 ? ['Have', 'Does', 'Is'] : ['Has', 'Do', 'Are'], 'neg']),
      ...SUBJ_SAFE.filter((x) => !['I', 'You'].includes(x.s)).flatMap((x) => [
        [`${x.p === 3 ? 'Has' : 'Have'} ${low(x.s)} got a pet? - Yes, ${x.pr} ${G}.`, hasOf(x.p), [x.p === 3 ? 'have' : 'has', `${hasOf(x.p)} got`, x.p === 3 ? 'does' : 'do'], 'neg'],
        [`${x.p === 3 ? 'Has' : 'Have'} ${low(x.s)} got a car? - No, ${x.pr} ${G}.`, x.p === 3 ? "hasn't" : "haven't", x.p === 3 ? ["haven't", "doesn't", "isn't"] : ["hasn't", "don't", "aren't"], 'neg'],
      ]),
    ],
  },
};

// ---------- Present Simple ----------
const HABITS = table(`
get up|gets up|getting up|at seven every day
go|goes|going|to school by bus
watch|watches|watching|TV in the evening
play|plays|playing|football after school
drink|drinks|drinking|tea for breakfast
live|lives|living|in Almaty
study|studies|studying|English on Mondays
read|reads|reading|books before bed
do|does|doing|homework in the evening
have|has|having|lunch at one o'clock
work|works|working|in a hospital
speak|speaks|speaking|three languages
wash|washes|washing|the dishes after dinner
finish|finishes|finishing|school at two o'clock
cook|cooks|cooking|dinner on Sundays
swim|swims|swimming|in the pool on Fridays
teach|teaches|teaching|maths at our school
fly|flies|flying|to Astana every month
walk|walks|walking|to the park every morning
like|likes|liking|ice cream
`);
const S3_BAD = { goes: 'gos', watches: 'watchs', studies: 'studys', does: 'dos', washes: 'washs', finishes: 'finishs', teaches: 'teachs', flies: 'flys', has: 'haves' };
const presimple = {
  name: L('Present Simple', 'Present Simple', 'Present Simple'),
  rules: {
    main: L('Present Simple is for habits and facts. After he / she / it the verb takes -s or -es (plays, goes, watches, studies, has); after I / you / we / they - no ending.', 'Present Simple - привычки и факты. После he / she / it глагол получает -s или -es (plays, goes, watches, studies, has), после I / you / we / they - без окончания.', 'Present Simple - әдеттер мен фактілер. He / she / it-тен кейін етістікке -s не -es жалғанады (plays, goes, watches, studies, has), I / you / we / they-дан кейін жалғау жоқ.'),
    neg: L('Negative: don\'t / doesn\'t + verb without -s: She doesn\'t like milk.', 'Отрицание: don\'t / doesn\'t + глагол без -s: She doesn\'t like milk.', 'Болымсыз: don\'t / doesn\'t + -s-сіз етістік: She doesn\'t like milk.'),
    q: L('Questions: Do / Does + subject + verb without -s: Does he work here? Short answers: Yes, he does. / No, I don\'t.', 'Вопрос: Do / Does + подлежащее + глагол без -s: Does he work here? Краткий ответ: Yes, he does. / No, I don\'t.', 'Сұрақ: Do / Does + бастауыш + -s-сіз етістік: Does he work here? Қысқа жауап: Yes, he does. / No, I don\'t.'),
  },
  levels: {
    1: () => [
      ...cross(SUBJ, HABITS, (x, [b, s, ing, rest]) => {
        const right = x.p === 3 ? s : b;
        const wrong = x.p === 3 ? [b, S3_BAD[s] ?? `is ${b}`, ing] : [s, `${beOf(x.p)} ${b}`, ing];
        return [`${x.s} ${G} ${rest}.`, right, wrong];
      }),
      ...cross(SUBJ, HABITS.slice(0, 10), (x, [b, s, , rest]) => [`${x.s} ${G} ${rest}. (not)`, `${x.p === 3 ? "doesn't" : "don't"} ${b}`, x.p === 3 ? [`doesn't ${s}`, `don't ${b}`, `isn't ${b}`] : [`doesn't ${b}`, `don't ${s}`, `${x.p === 1 ? "am not" : "aren't"} ${b}`], 'neg']),
      ...cross(SUBJ.filter((x) => x.s !== 'I'), HABITS.slice(0, 12), (x, [b, , , rest]) => [`${G} ${low(x.s)} ${b} ${rest}?`, cap(doOf(x.p)), [x.p === 3 ? 'Do' : 'Does', cap(beOf(x.p)), x.p === 3 ? 'Has' : 'Have'], 'q']),
      ...SUBJ_SAFE.filter((x) => !['I', 'You'].includes(x.s)).flatMap((x) => [
        [`${cap(doOf(x.p))} ${low(x.s)} play chess? - Yes, ${x.pr} ${G}.`, doOf(x.p), [x.p === 3 ? 'do' : 'does', beOf(x.p), x.p === 3 ? 'plays' : 'play'], 'q'],
        [`${cap(doOf(x.p))} ${low(x.s)} eat meat? - No, ${x.pr} ${G}.`, x.p === 3 ? "doesn't" : "don't", x.p === 3 ? ["don't", "isn't", "not eats"] : ["doesn't", "aren't", 'not eat'], 'q'],
      ]),
    ],
  },
};

// ---------- Наречия частотности ----------
const FREQ = ['always', 'usually', 'often', 'sometimes', 'never'];
const PCT = { always: '100%', usually: 'about 90%', often: 'about 70%', sometimes: 'about 30%', never: '0%' };
const F_VERBS = table(`
walk|walks|to school
drink|drinks|coffee
eat|eats|fish
read|reads|comics
play|plays|computer games
watch|watches|cartoons
cook|cooks|dinner
`);
const F_ADJ = ['late', 'tired after school', 'hungry in the morning', 'happy on Fridays', 'busy at the weekend'];
const freq = {
  name: L('Adverbs of frequency', 'Наречия частотности', 'Жиілік үстеулері'),
  rules: {
    pos: L('Frequency adverbs (always, usually, often, sometimes, never) go before the main verb but after am / is / are: She often plays chess. He is never late.', 'Наречия частотности (always, usually, often, sometimes, never) стоят перед смысловым глаголом, но после am / is / are: She often plays chess. He is never late.', 'Жиілік үстеулері (always, usually, often, sometimes, never) негізгі етістіктің алдында, бірақ am / is / are-дан кейін тұрады: She often plays chess. He is never late.'),
    mean: L('always 100% - usually about 90% - often about 70% - sometimes about 30% - never 0%.', 'always 100% - usually около 90% - often около 70% - sometimes около 30% - never 0%.', 'always 100% - usually шамамен 90% - often шамамен 70% - sometimes шамамен 30% - never 0%.'),
    how: L('We ask about frequency with How often...? - Twice a week.', 'О частоте спрашивают How often...? - Twice a week.', 'Жиілікті How often...? деп сұрайды - Twice a week.'),
  },
  levels: {
    1: () => {
      const out = [];
      const subs = SUBJ.filter((x) => ['I', 'She', 'We', 'Tom', 'My parents', 'He'].includes(x.s));
      for (const x of subs)
        for (const [i, [b, s, rest]] of F_VERBS.entries()) {
          const adv = FREQ[(i + subs.indexOf(x)) % 5];
          const v = x.p === 3 ? s : b;
          const bad = x.p === 3 ? b : s;
          out.push([null, `${x.s} ${adv} ${v} ${rest}.`, [`${x.s} ${v} ${adv} ${rest}.`, `${x.s} ${adv} ${bad} ${rest}.`, ['always', 'never'].includes(adv) ? `${cap(adv)} ${low(x.s)} ${v} ${rest}.` : `${x.s} ${beOf(x.p)} ${adv} ${b} ${rest}.`], 'pos', 'order']);
          out.push([`${x.s} ${G} ${v} ${rest}. (${PCT[adv]})`, adv, FREQ.filter((f) => f !== adv).slice(0, 3), 'mean']);
        }
      for (const x of subs)
        for (const [i, adj] of F_ADJ.entries()) {
          const adv = FREQ[(i + 2 * subs.indexOf(x)) % 5];
          const be = beOf(x.p);
          out.push([null, `${x.s} ${be} ${adv} ${adj}.`, [`${x.s} ${adv} ${be} ${adj}.`, `${x.s} ${wrongBe(x.p)[0]} ${adv} ${adj}.`, `${x.s} ${doOf(x.p)} ${adv} ${adj}.`], 'pos', 'order']);
        }
      out.push(
        ...table(`
${G} do you go swimming? - Twice a week.|How often|How much|How long|How many
${G} does she visit her grandma? - Every Sunday.|How often|How many|How old|How much
${G} do they play tennis? - Once a month.|How often|How long|How much|Which
${G} does the bus come? - Every ten minutes.|How often|How many|Whose|How old
`).map(([s, a, ...w]) => [s, a, w, 'how']),
      );
      return out;
    },
  },
};

// ---------- Present Continuous ----------
const PC_VERBS = ALL_VERBS.filter((v) => v.level === 1 && !v.stative && !['have', 'do', 'come', 'give', 'make'].includes(v.base)).concat(ALL_VERBS.filter((v) => !v.irregular).slice(0, 12));
const ING_BAD = { swimming: 'swiming', running: 'runing', sitting: 'siting', writing: 'writeing', making: 'makeing', taking: 'takeing', dancing: 'danceing', stopping: 'stoping', planning: 'planing', getting: 'geting', baking: 'bakeing' };
const precont = {
  name: L('Present Continuous', 'Present Continuous', 'Present Continuous'),
  rules: {
    main: L('Present Continuous is for actions happening now: am / is / are + verb-ing. Spelling: swim - swimming, write - writing.', 'Present Continuous - действие происходит сейчас: am / is / are + глагол с -ing. Написание: swim - swimming, write - writing.', 'Present Continuous - қазір болып жатқан әрекет: am / is / are + -ing жалғаулы етістік. Жазылуы: swim - swimming, write - writing.'),
    neg: L('Negative: am not / isn\'t / aren\'t + -ing. Questions: Am / Is / Are + subject + -ing?', 'Отрицание: am not / isn\'t / aren\'t + -ing. Вопрос: Am / Is / Are + подлежащее + -ing?', 'Болымсыз: am not / isn\'t / aren\'t + -ing. Сұрақ: Am / Is / Are + бастауыш + -ing?'),
  },
  levels: {
    1: () => {
      const marks = ['right now', 'at the moment', 'now'];
      return [
        ...cross(SUBJ, PC_VERBS, (x, v, i, j) => {
          const right = `${beOf(x.p)} ${v.ing}`;
          const wrong = [`${x.p === 3 ? 'are' : 'is'} ${v.ing}`, ING_BAD[v.ing] ? `${beOf(x.p)} ${ING_BAD[v.ing]}` : v.ing, `${beOf(x.p)} ${v.base}`];
          return [`${x.s} ${G} (${v.base}) ${v.obj} ${marks[(i + j) % 3]}.`, right, wrong];
        }),
        ...cross(SUBJ.slice(0, 8), PC_VERBS.slice(0, 8), (x, v) => [`${x.s} ${G} (${v.base}) ${v.obj} at the moment. (not)`, `${NOT_BE[x.p]} ${v.ing}`, [`${x.p === 3 ? "doesn't" : "don't"} ${v.base}`, `not ${v.ing}`, `${NOT_BE[x.p]} ${v.base}`], 'neg']),
        ...cross(SUBJ.filter((x) => x.s !== 'I').slice(0, 7), PC_VERBS.slice(0, 8), (x, v) => [`${G} ${low(x.s)} ${v.ing} ${v.obj} now?`, cap(beOf(x.p)), [x.p === 3 ? 'Does' : 'Do', ...wrongBe(x.p).filter((w) => w !== 'am').map(cap), 'Am'].slice(0, 3), 'neg']),
      ];
    },
  },
};

// ---------- Present Simple или Continuous ----------
const SC = table(`
play|plays|playing|tennis
read|reads|reading|a book
cook|cooks|cooking|dinner
watch|watches|watching|TV
swim|swims|swimming|in the river
ride|rides|riding|a bike
study|studies|studying|English
wash|washes|washing|the car
`);
const STATIVE = table(`
want|wants|a new phone
know|knows|the answer
like|likes|this song
need|needs|some help
understand|understands|the question
love|loves|chocolate
`);
const simplecont = {
  name: L('Present Simple or Continuous', 'Present Simple или Present Continuous', 'Present Simple немесе Present Continuous'),
  rules: {
    habit: L('Habits and routines (every day, usually, on Sundays) - Present Simple.', 'Привычки и регулярные действия (every day, usually, on Sundays) - Present Simple.', 'Әдеттер мен тұрақты әрекеттер (every day, usually, on Sundays) - Present Simple.'),
    now: L('Actions happening now (now, at the moment, Look!, Listen!) - Present Continuous.', 'Действие прямо сейчас (now, at the moment, Look!, Listen!) - Present Continuous.', 'Дәл қазір болып жатқан әрекет (now, at the moment, Look!, Listen!) - Present Continuous.'),
    state: L('State verbs (want, know, like, love, need, understand) are not normally used in the Continuous.', 'Глаголы состояния (want, know, like, love, need, understand) обычно не ставят в Continuous.', 'Күй етістіктері (want, know, like, love, need, understand) әдетте Continuous-та қолданылмайды.'),
  },
  levels: {
    1: () => {
      const subs = SUBJ.filter((x) => ['I', 'She', 'We', 'Tom', 'My parents', 'You', 'Aliya'].includes(x.s));
      const habit = ['every Saturday', 'every day', 'on Sundays', 'twice a week'];
      const now = [['Look!', ''], ['', 'right now'], ['Listen!', ''], ['', 'at the moment']];
      const out = [];
      subs.forEach((x, i) =>
        SC.forEach(([b, s, ing, rest], j) => {
          const ps = x.p === 3 ? s : b;
          const pc = `${beOf(x.p)} ${ing}`;
          out.push([`${x.s} ${G} (${b}) ${rest} ${habit[(i + j) % 4]}.`, ps, [pc, x.p === 3 ? b : s, ing], 'habit']);
          const [pre, post] = now[(i + j) % 4];
          out.push([`${pre ? `${pre} ` : ''}${x.s} ${G} (${b}) ${rest}${post ? ` ${post}` : ''}.`, pc, [ps, `${wrongBe(x.p)[0]} ${ing}`, x.p === 3 ? b : s], 'now']);
        }),
      );
      subs.forEach((x) =>
        STATIVE.forEach(([b, s, rest]) => {
          const ps = x.p === 3 ? s : b;
          out.push([`${x.s} ${G} (${b}) ${rest} now.`, ps, [`${beOf(x.p)} ${b}ing`.replace('eing', 'ing'), x.p === 3 ? b : s, `${b}ing`.replace('eing', 'ing')], 'state']);
        }),
      );
      return out;
    },
  },
};

// ---------- can / can't ----------
const SKILLS = 'swim|ride a bike|play chess|speak French|cook pasta|draw horses|play the piano|drive a car|skate|ski|use a computer|read Chinese'.split('|');
const can = {
  name: L('Can and can\'t', 'Can / can\'t', 'Can / can\'t'),
  rules: {
    main: L('Can + verb without to, the same for all persons: She can swim (not "cans", not "can to swim", not "can swims").', 'Can + глагол без to, одинаково для всех лиц: She can swim (не cans, не can to swim, не can swims).', 'Can + to-сыз етістік, барлық жақта бірдей: She can swim (cans емес, can to swim емес, can swims емес).'),
    neg: L('Negative: can\'t (cannot) + verb. Questions: Can you...? Short answers: Yes, I can. / No, he can\'t.', 'Отрицание: can\'t (cannot) + глагол. Вопрос: Can you...? Краткий ответ: Yes, I can. / No, he can\'t.', 'Болымсыз: can\'t (cannot) + етістік. Сұрақ: Can you...? Қысқа жауап: Yes, I can. / No, he can\'t.'),
  },
  levels: {
    1: () => {
      const out = [];
      SUBJ.forEach((x, i) =>
        SKILLS.forEach((sk, j) => {
          const [v, ...rest] = sk.split(' ');
          const r = rest.length ? ` ${rest.join(' ')}` : '';
          const vS = v === 'ride' ? 'rides' : v === 'use' ? 'uses' : v.endsWith('h') ? `${v}es` : `${v}s`;
          out.push([`${x.s} ${G}${r} very well.`, `can ${v}`, [`cans ${v}`, `can ${vS}`, `can to ${v}`]]);
          if ((i + j) % 2 === 0) out.push([`${x.s} ${G}${r}. (not)`, `can't ${v}`, [`don't can ${v}`, `can't ${vS}`, `can't to ${v}`], 'neg']);
        }),
      );
      SKILLS.forEach((sk) => {
        out.push([null, `Can you ${sk}?`, [`Do you can ${sk}?`, `Can you to ${sk}?`, `Can ${sk.split(' ')[0]} you${sk.includes(' ') ? ` ${sk.split(' ').slice(1).join(' ')}` : ''}?`], 'neg', 'sent']);
      });
      SUBJ_SAFE.filter((x) => !['I', 'You'].includes(x.s)).forEach((x, i) => {
        out.push([`Can ${low(x.s)} ${SKILLS[i]}? - No, ${x.pr} ${G}.`, "can't", [x.p === 3 ? "doesn't" : "don't", x.p === 3 ? "isn't" : "aren't", 'not can'], 'neg']);
        out.push([`Can ${low(x.s)} ${SKILLS[i + 2]}? - Yes, ${x.pr} ${G}.`, 'can', [x.p === 3 ? 'does' : 'do', 'cans', `can ${SKILLS[i + 2].split(' ')[0]}s`], 'neg']);
      });
      return out;
    },
  },
};

// ---------- Повелительное наклонение ----------
const IMP_POS = table(`
close|the window, please. It's cold.
open|your books at page ten.
sit|down, please.
listen|to the teacher.
look|at the board.
come|here, please.
wash|your hands before lunch.
turn|off the light, please.
write|your name here.
take|an umbrella. It's raining.
help|me with this bag, please.
put|on your coat. It's windy.
read|the text and answer the questions.
be|quiet, please. The baby is sleeping.
call|me when you get home.
drink|some water. You look tired.
`);
const IMP_NEG = table(`
touch|the oven! It's hot.
run|in the corridor!
be|late for the lesson.
eat|in the library.
talk|during the test.
forget|your homework.
open|the door to strangers.
play|football in the house.
shout|at your little brother.
feed|the animals at the zoo.
swim|here. The water is deep.
use|your phone in class.
`);
const LETS = table(`
go|to the cinema tonight.
play|a game.
have|a picnic on Sunday.
take|a taxi. It's late.
watch|a film together.
make|a cake for Mum.
ask|the teacher.
meet|at six o'clock.
`);
const S_FORM = (v) => (v === 'be' ? 'is' : v === 'touch' || v === 'wash' ? `${v}es` : `${v}s`);
const imper = {
  name: L('The imperative', 'Повелительное наклонение', 'Бұйрық рай'),
  rules: {
    pos: L('To give an instruction, use the verb without to and without a subject: Close the door. Sit down, please.', 'Просьба или приказ - глагол без to и без подлежащего: Close the door. Sit down, please.', 'Нұсқау не өтініш - to-сыз және бастауышсыз етістік: Close the door. Sit down, please.'),
    neg: L('Negative imperative: Don\'t + verb: Don\'t touch it! Don\'t be late.', 'Запрет: Don\'t + глагол: Don\'t touch it! Don\'t be late.', 'Тыйым: Don\'t + етістік: Don\'t touch it! Don\'t be late.'),
    lets: L('Suggestions for us: Let\'s + verb without to: Let\'s go!', 'Предложение «давай(те)»: Let\'s + глагол без to: Let\'s go!', '«Келіңдер / жүр» ұсынысы: Let\'s + to-сыз етістік: Let\'s go!'),
  },
  levels: {
    1: () => [
      ...IMP_POS.flatMap(([v, rest]) => [
        [`${G} ${rest}`, cap(v), [cap(S_FORM(v)), cap(v === 'be' ? 'being' : `${v.replace(/e$/, '')}ing`.replace('siting', 'sitting').replace('puting', 'putting')), `To ${v}`], 'pos'],
        [`Children, ${G} ${rest}`, v, [S_FORM(v), `you ${S_FORM(v)}`, `to ${v}`], 'pos'],
      ]),
      ...IMP_NEG.flatMap(([v, rest]) => [
        [`${G} (${v}) ${rest}`, `Don't ${v}`, [`Not ${v}`, `No ${v}`, `Doesn't ${v}`], 'neg'],
        [`Please ${G} (${v}) ${rest}`, `don't ${v}`, [`not ${v}`, `doesn't ${v}`, `don't to ${v}`], 'neg'],
      ]),
      ...LETS.flatMap(([v, rest]) => [
        [`${G} (${v}) ${rest}`, `Let's ${v}`, [`Let's to ${v}`, `Let's ${v === 'have' ? 'having' : `${v.replace(/e$/, '')}ing`}`, `Let us to ${v}`], 'lets'],
      ]),
    ],
  },
};

export const A1_GRAMMAR_1 = {
  'e.tobe': tobe,
  'e.pronouns': pronouns,
  'e.plural': plural,
  'e.articles': articles,
  'e.this': thisThat,
  'e.thereis': thereis,
  'e.havegot': havegot,
  'e.presimple': presimple,
  'e.freq': freq,
  'e.precont': precont,
  'e.simplecont': simplecont,
  'e.can': can,
  'e.imper': imper,
};
