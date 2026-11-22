// Программа A1: грамматика (продолжение) - предлоги, вопросы, местоимения, прошедшее время.

import { L } from '../../gen.js';
import { G, SUBJ, SUBJ_SAFE, cap, cross, low, table, wasOf } from './core.js';
import { ALL_VERBS } from '../verbs.js';

// ---------- Предлоги места ----------
const HINT = { in: 'inside it', on: 'on top of it', under: 'below it', 'next to': 'at its side', behind: 'at the back of it', 'in front of': 'at the front of it' };
const PLACE_ALL = ['in', 'on', 'under', 'next to', 'behind', 'in front of', 'between', 'opposite'];
const CONTAINERS = ['box', 'bag', 'cupboard', 'drawer', 'basket', 'car'];
const FURNITURE = ['table', 'bed', 'sofa', 'chair', 'desk', 'box'];
const THINGS_P = table(`
The cat|is
The ball|is
My phone|is
The keys|are
The shoes|are
The book|is
`);
const FIXED_P = table(`
My grandparents live ${G} Shymkent.|in|on|at|under
There is a nice picture ${G} the wall.|on|in|under|between
The milk is ${G} the fridge.|in|on|at|between
Wait for me ${G} the bus stop.|at|in|under|between
The bank is ${G} the café and the cinema.|between|next|opposite to|under
Our school is ${G} the park. You just cross the road.|opposite|between|in|under
The birds are flying high ${G} the sky.|in|on|at|under
I'm ${G} home now. Come and visit me!|at|in|on|under
Write your name ${G} the top of the page.|at|in|under|between
We live ${G} the second floor.|on|in|at|under
My dad is ${G} work until six.|at|in|on|under
The children are playing ${G} the garden.|in|on|at|under
There is a lamp ${G} the ceiling.|on|in|between|at
Astana is ${G} the north of Kazakhstan.|in|on|at|under
She is sitting ${G} the bus, by the window.|on|at|under|between
My friend sits ${G} me in class, on my left.|next to|between|under|opposite to
The cinema is ${G} the left of the bank.|on|in|at|under
The dog is sleeping ${G} its bed in the corner.|in|at|between|opposite
`);
const prepplace = {
  name: L('Prepositions of place', 'Предлоги места', 'Мекен предлогтары'),
  rules: {
    main: L('in - inside, on - on a surface, under - below, next to - at the side, behind - at the back, in front of - at the front, between - in the middle of two things, opposite - across from.', 'in - внутри, on - на поверхности, under - под, next to - рядом, behind - позади, in front of - перед, between - между двумя, opposite - напротив.', 'in - ішінде, on - бетінде, under - астында, next to - қасында, behind - артында, in front of - алдында, between - екі заттың арасында, opposite - қарсы бетте.'),
    fixed: L('Fixed uses: in a city, country or the sky; on a wall, a floor of a building, a bus; at home, at work, at school, at a bus stop, at the top of a page.', 'Устойчивые случаи: in - город, страна, небо; on - стена, этаж, автобус; at - home, work, school, остановка, верх страницы.', 'Тұрақты қолданыс: in - қала, ел, аспан; on - қабырға, қабат, автобус; at - home, work, school, аялдама, беттің жоғарғы жағы.'),
  },
  levels: {
    1: () => {
      const out = [];
      for (const [t, be] of THINGS_P) {
        for (const c of CONTAINERS) out.push([`${t} ${be} ${G} the ${c}. (${HINT.in})`, 'in', ['on', 'under', 'between']]);
        for (const f of FURNITURE)
          for (const p of ['on', 'under', 'next to', 'behind', 'in front of']) {
            if ((FURNITURE.indexOf(f) + PLACE_ALL.indexOf(p)) % 2) continue;
            const wrong = PLACE_ALL.filter((x) => x !== p && x !== 'opposite' && x !== 'between' && x !== 'in').slice(0, 2).concat('between');
            out.push([`${t} ${be} ${G} the ${f}. (${HINT[p]})`, p, wrong]);
          }
        out.push([`${t} ${be} ${G} the sofa and the window.`, 'between', ['under', 'opposite', 'in']]);
      }
      out.push(...FIXED_P.map(([s, a, ...w]) => [s, a, w, 'fixed']));
      return out;
    },
  },
};

// ---------- Предлоги времени ----------
const T_AT = ['seven o\'clock', 'half past three', 'noon', 'midnight', '6:30', 'night', 'lunchtime', 'nine in the morning'];
const T_ON = ['Monday', 'Friday', 'my birthday', '1 May', 'Sunday morning', '25 December', 'New Year\'s Day', 'Tuesday evening'];
const T_IN = ['July', '2020', 'the morning', 'the evening', 'winter', 'summer', 'the afternoon', 'March', 'spring', '1999'];
const T_FRAMES = ['It happened', 'The party was', 'Our test was', 'I saw him'];
const preptime = {
  name: L('Prepositions of time: at, on, in', 'Предлоги времени: at, on, in', 'Уақыт предлогтары: at, on, in'),
  rules: {
    at: L('at + clock times and some fixed times: at seven o\'clock, at noon, at night, at lunchtime.', 'at - время по часам и устойчивые сочетания: at seven o\'clock, at noon, at night, at lunchtime.', 'at - сағат уақыты мен тұрақты тіркестер: at seven o\'clock, at noon, at night, at lunchtime.'),
    on: L('on + days and dates: on Monday, on my birthday, on 1 May, on Sunday morning.', 'on - дни и даты: on Monday, on my birthday, on 1 May, on Sunday morning.', 'on - күндер мен даталар: on Monday, on my birthday, on 1 May, on Sunday morning.'),
    in: L('in + months, years, seasons and parts of the day: in July, in 2020, in winter, in the morning.', 'in - месяцы, годы, времена года, части дня: in July, in 2020, in winter, in the morning.', 'in - айлар, жылдар, жыл мезгілдері, тәулік бөліктері: in July, in 2020, in winter, in the morning.'),
  },
  levels: {
    1: () => [
      ...cross(T_FRAMES, T_AT, (f, t) => [`${f} ${G} ${t}.`, 'at', ['on', 'in', 'of'], 'at']),
      ...cross(T_FRAMES, T_ON, (f, t) => [`${f} ${G} ${t}.`, 'on', ['at', 'in', 'of'], 'on']),
      ...cross(T_FRAMES, T_IN, (f, t) => [`${f} ${G} ${t}.`, 'in', ['at', 'on', 'of'], 'in']),
    ],
  },
};

// ---------- Вопросительные слова ----------
const WH = table(`
${G} is your name? - My name is Dana.|What|Who|Where|How
${G} do you live? - In Almaty.|Where|When|Who|What
${G} is your birthday? - In May.|When|Where|Who|Why
${G} is that man? - He's my uncle.|Who|What|Where|When
${G} are you sad? - Because I lost my keys.|Why|How|When|Where
${G} are you? - I'm fine, thanks.|How|Who|Where|What
${G} old is your brother? - He's ten.|How|What|Who|Which
${G} many sisters have you got? - Two.|How|What|Who|Why
${G} much is this T-shirt? - Ten dollars.|How|What|Who|Where
${G} bag is this? - It's Tom's.|Whose|Who|Where|How
${G} time is it? - It's five o'clock.|What|How|Who|Where
${G} do you go to school? - By bus.|How|What|Who|Whose
${G} does the film start? - At eight.|When|Where|Who|Whose
${G} is the station? - It's next to the bank.|Where|When|Who|Why
${G} is your favourite colour? - Blue.|What|Who|Where|How
${G} do you like football? - Because it's fun.|Why|What|Who|Whose
${G} do you play with after school? - With my cousin.|Who|What|Where|Why
${G} is your teacher? - Mrs Brown.|Who|What|Where|When
${G} colour is your car? - It's red.|What|Who|How|Where
${G} are my glasses? - They're on the table.|Where|What|When|Who
${G} do you get up? - At seven.|When|Where|Who|Whose
${G} is your dog's name? - Rex.|What|Who|Where|Whose
${G} is the weather like today? - It's sunny.|What|How|Who|Where
${G} does your dad work? - In a bank.|Where|Who|What|Whose
${G} is she crying? - She fell off her bike.|Why|Who|What|Whose
${G} are these shoes? - They're mine.|Whose|Who|What|Where
${G} one do you want, the red or the blue? - The blue one.|Which|Who|Where|How
${G} often do you swim? - Twice a week.|How|What|When|Who
${G} long is the lesson? - Forty-five minutes.|How|What|When|Who
${G} is your best friend? - Aliya.|Who|What|Where|How
${G} did you go last summer? - To the sea.|Where|Who|What|Why
${G} do you have for breakfast? - Eggs and tea.|What|Who|Where|How
${G} is the bathroom? - Upstairs, on the left.|Where|Who|When|What
${G} are you late? - The bus didn't come.|Why|Who|Which|Whose
${G} many people are in your family? - Four.|How|What|Who|Which
${G} is your phone number? - It's 8 701 555 12 34.|What|Who|Where|How
${G} do you spell your name? - D-A-N-A.|How|What|Who|Where
${G} is your English lesson? - On Monday.|When|Where|Who|Whose
${G} does this word mean? - It means "happy".|What|Who|How|Where
${G} is calling? - It's your grandma.|Who|What|Where|How
${G} language do you speak at home? - Kazakh.|What|Who|How|Where
${G} is your house? - It's near the river.|Where|Who|When|Whose
${G} car is that? - It's my neighbour's.|Whose|Who|What|Where
${G} do you feel today? - Much better, thanks.|How|What|Who|Where
${G} did you buy? - A new jacket.|What|Who|Where|Why
${G} is your school? - It's in the city centre.|Where|What|Who|When
${G} wants an ice cream? - Me!|Who|What|Where|How
${G} did you call me? - To say happy birthday.|Why|Who|Which|Whose
${G} much milk do we need? - One litre.|How|What|Who|Which
${G} is the party? - On Saturday at six.|When|Who|What|Whose
`);
const WH_EXTRA = table(`
Where|In the park.|Who|When|Why
When|Tomorrow.|Who|Where|Whose
Who|My brother.|When|Where|How
Why|Because it's raining.|Who|Where|Which
How|By train.|Who|Whose|Why
What|A sandwich.|Who|Where|When
`);
const whq = {
  name: L('Question words', 'Вопросительные слова', 'Сұрау сөздері'),
  rules: {
    main: L('who - a person, what - a thing, where - a place, when - a time, why - a reason (answer: because...), how - a way or state, whose - an owner, which - a choice, how old / how many / how much / how often / how long - age, number, amount or price, frequency, length.', 'who - кто, what - что, where - где, when - когда, why - почему (ответ: because...), how - как, whose - чей, which - который (выбор), how old / how many / how much / how often / how long - возраст, количество, цена, частота, длительность.', 'who - кім, what - не, where - қайда, when - қашан, why - неге (жауабы: because...), how - қалай, whose - кімнің, which - қайсы (таңдау), how old / how many / how much / how often / how long - жас, сан, баға, жиілік, ұзақтық.'),
  },
  levels: {
    1: () => [
      ...WH.map(([s, a, ...w]) => [s, a, w]),
      ...cross(WH_EXTRA, ['are you going?', 'did you see?'].slice(0, 1), ([a, ans, ...w]) => [`${G} are you going? - ${ans}`.replace('are you going?', a === 'Who' ? 'is coming with you?' : a === 'What' ? 'are you eating?' : a === 'When' ? 'are you leaving?' : a === 'Why' ? 'are you staying at home?' : a === 'How' ? 'are you travelling to Almaty?' : 'are you going?'), a, w]),
    ],
  },
};

// ---------- Объектные местоимения ----------
const OBJ_HINT = table(`
I|me|my|mine
he|him|his|he's
she|her|she's|hers
we|us|our|ours
they|them|their|theirs
you|you|your|yours
it|it|its|it's
`);
const OBJ_FRAMES = ['Can you help ${G}, please?', 'Please call ${G} tomorrow.', 'Look at ${G}!', 'This present is for ${G}.', 'Do you know ${G}?', 'Our teacher always helps ${G}.', 'Wait for ${G} at the door.', 'I often think about ${G}.', 'Come to the park with ${G}.', 'Grandma sends ${G} a card every year.'];
const OBJ_CTX = table(`
Where is Tom? I can't see ${G}.|him|he|his|them
I love my grandma. I visit ${G} every week.|her|she|hers|him
These cakes are great. Can I have one of ${G}?|them|they|their|it
My sister is ill. Let's call ${G}.|her|she|him|hers
Your bike is cool. Where did you buy ${G}?|it|its|them|him
Ali and I are hungry. Please give ${G} some bread.|us|we|our|them
Do you like these songs? I listen to ${G} every day.|them|they|it|their
My dad works a lot. I don't see ${G} in the mornings.|him|he|his|her
I don't know the answer. Can you tell ${G}?|me|I|my|mine
Our cat is hungry. Please feed ${G}.|it|its|them|him
The new teacher is nice. We like ${G} a lot.|her|she|hers|they
My friends are at the door. Let ${G} in, please.|them|they|their|it
`);
const objpron = {
  name: L('Object pronouns: me, him, them', 'Объектные местоимения: me, him, them', 'Табыс септік есімдіктері: me, him, them'),
  rules: {
    main: L('After a verb or a preposition we use object pronouns: me, you, him, her, it, us, them. (I see him. This is for her.)', 'После глагола или предлога - объектные местоимения: me, you, him, her, it, us, them (I see him. This is for her.).', 'Етістік не предлогтан кейін табыс септік есімдіктері тұрады: me, you, him, her, it, us, them (I see him. This is for her.).'),
  },
  levels: {
    1: () => [
      ...cross(OBJ_FRAMES, OBJ_HINT, (f, [sub, obj, ...w]) => [`${f.replace('${G}', G)} (${sub})`, obj, w.map((x) => (x === obj ? 'hers' : x))]).filter((r) => !(r[1] === 'you' && /Look at/.test(r[0]))),
      ...OBJ_CTX.map(([s, a, ...w]) => [s, a, w]),
    ],
  },
};

// ---------- Притяжательный падеж ----------
const OWN_SG = ['my dad', 'my mum', 'Tom', 'Aliya', 'my sister', 'my teacher', 'our neighbour', 'my grandfather'];
const OWN_PL = ['my parents', 'my friends', 'the students', 'the girls', 'my grandparents', 'the boys'];
const OWN_IRR = table(`
the children|children's|childrens'|childrens|children
the women|women's|womens'|womens|women
the men|men's|mens'|mens|men
people|people's|peoples'|peoples|people
`);
const OWNED = ['car', 'bag', 'house', 'phone', 'room', 'bike'];
const possessive = {
  name: L('Possessive \'s: Tom\'s bag', 'Притяжательный падеж: Tom\'s bag', 'Тәуелдік \'s: Tom\'s bag'),
  rules: {
    sg: L('One owner: add \'s - my dad\'s car, Tom\'s bag.', 'Один владелец: добавляем \'s - my dad\'s car, Tom\'s bag.', 'Бір иесі: \'s қосылады - my dad\'s car, Tom\'s bag.'),
    pl: L('Plural owners ending in -s: add only an apostrophe - my parents\' house.', 'Несколько владельцев, слово на -s: только апостроф - my parents\' house.', 'Бірнеше иесі, сөз -s-ке бітсе: тек апостроф - my parents\' house.'),
    irr: L('Irregular plurals without -s take \'s: the children\'s toys, the women\'s team.', 'Особые множественные без -s получают \'s: the children\'s toys, the women\'s team.', '-s-сіз ерекше көпше түрге \'s қосылады: the children\'s toys, the women\'s team.'),
  },
  levels: {
    1: () => {
      const out = [];
      OWN_SG.forEach((o, i) =>
        OWNED.forEach((t, j) => {
          if ((i + j) % 2) return;
          const right = `${o}'s`;
          out.push([`This is ${G} ${t}. (${o})`, right, [`${o}s`, `${o}s'`, o], 'sg']);
        }),
      );
      OWN_SG.slice(2, 4).forEach((o) => out.push([`Whose bag is this? - It's ${G}.`.replace('bag', 'bag'), `${o}'s`, [`${o}s`, `${o}`, `of ${o}`], 'sg']));
      OWN_PL.forEach((o, i) =>
        OWNED.forEach((t, j) => {
          if ((i + j) % 2 === 0) return;
          out.push([`This is ${G} ${t}. (${o})`, `${o}'`, [`${o.slice(0, -1)}'s`, `${o}'s`, o], 'pl']);
        }),
      );
      for (const [o, right, ...w] of OWN_IRR)
        for (const t of ['toys', 'books', 'room', 'clothes', 'team'])
          out.push([`These are ${G} ${t}. (${o})`.replace('These are', t === 'room' || t === 'team' ? 'This is' : 'These are'), o.startsWith('the') ? `the ${right}` : right, w.map((x) => (o.startsWith('the') ? `the ${x}` : x)), 'irr']);
      return out;
    },
  },
};

// ---------- like / love / hate + -ing ----------
const ACTS = table(`
swim|swimming|swiming|swims
dance|dancing|danceing|dances
read books|reading books|readding books|reads books
cook|cooking|cookking|cooks
play chess|playing chess|plaing chess|plays chess
draw|drawing|drawwing|draws
ride a bike|riding a bike|rideing a bike|rides a bike
watch cartoons|watching cartoons|watchhing cartoons|watches cartoons
run|running|runing|runs
sing|singing|singging|sings
travel|travelling|traveling by|travels
take photos|taking photos|takeing photos|takes photos
write stories|writing stories|writeing stories|writes stories
get up early|getting up early|geting up early|gets up early
do homework|doing homework|doeing homework|does homework
wash the dishes|washing the dishes|washhing the dishes|washes the dishes
go shopping|going shopping|goeing shopping|goes shopping
skate|skating|skateing|skates
`);
const LIKE_SUBJ = SUBJ_SAFE.filter((x) => ['I', 'She', 'We', 'Tom', 'My parents', 'They', 'Aliya'].includes(x.s));
const LIKE_V = table(`
like|likes|liked
love|loves|loved
hate|hates|hated
enjoy|enjoys|enjoyed
`);
const likeing = {
  name: L('Like, love, hate + -ing', 'Like / love / hate + -ing', 'Like / love / hate + -ing'),
  rules: {
    ing: L('After like, love, hate and enjoy we use verb-ing: I love dancing. She hates getting up early. Spelling: swim - swimming, ride - riding, travel - travelling.', 'После like, love, hate, enjoy ставим глагол с -ing: I love dancing. She hates getting up early. Написание: swim - swimming, ride - riding, travel - travelling.', 'Like, love, hate, enjoy-дан кейін -ing жалғаулы етістік тұрады: I love dancing. She hates getting up early. Жазылуы: swim - swimming, ride - riding, travel - travelling.'),
    agree: L('The verb like / love / hate itself follows the Present Simple: he likes, she doesn\'t like.', 'Сам глагол like / love / hate - в Present Simple: he likes, she doesn\'t like.', 'Like / love / hate етістігінің өзі Present Simple-де тұрады: he likes, she doesn\'t like.'),
  },
  levels: {
    1: () => {
      const out = [];
      LIKE_SUBJ.forEach((x, i) =>
        ACTS.forEach(([base, ing, bad, s], j) => {
          const [lv, ls] = LIKE_V[(i + j) % 4];
          const verb = x.p === 3 ? ls : lv;
          out.push([`${x.s} ${verb} ${G}.`, ing, [base, bad, s], 'ing']);
          if ((i + j) % 3 === 0) out.push([`${x.s} ${G} ${ing}.`, verb, [x.p === 3 ? lv : ls, `${x.p === 3 ? 'is' : x.p === 1 ? 'am' : 'are'} ${lv}`, `${lv}ing`.replace('eing', 'ing')], 'agree']);
        }),
      );
      return out;
    },
  },
};

// ---------- Past Simple глагола to be ----------
const PB_C = ['at home yesterday', 'tired last night', 'at the cinema on Friday', 'in Astana last week', 'late this morning', 'ill two days ago', 'happy at the party', 'at school yesterday', 'in the garden an hour ago', 'very hungry after the match'];
const pastbe = {
  name: L('Past Simple of to be: was, were', 'Прошедшее время to be: was, were', 'To be өткен шақта: was, were'),
  rules: {
    main: L('Past of to be: I / he / she / it was, you / we / they were.', 'Прошедшее время to be: I / he / she / it was, you / we / they were.', 'To be өткен шақта: I / he / she / it was, you / we / they were.'),
    neg: L('Negative: wasn\'t, weren\'t. Questions: Was he...? Were you...? Short answers: Yes, I was. / No, they weren\'t.', 'Отрицание: wasn\'t, weren\'t. Вопрос: Was he...? Were you...? Краткий ответ: Yes, I was. / No, they weren\'t.', 'Болымсыз: wasn\'t, weren\'t. Сұрақ: Was he...? Were you...? Қысқа жауап: Yes, I was. / No, they weren\'t.'),
  },
  levels: {
    1: () => [
      ...cross(SUBJ, PB_C, (x, c) => [`${x.s} ${G} ${c}.`, wasOf(x.p), [wasOf(x.p) === 'was' ? 'were' : 'was', x.p === 1 ? 'am' : x.p === 3 ? 'is' : 'are', 'be']]),
      ...cross(SUBJ, PB_C.slice(0, 5), (x, c) => [`${x.s} ${G} ${c}. (not)`, wasOf(x.p) === 'was' ? "wasn't" : "weren't", wasOf(x.p) === 'was' ? ["weren't", "didn't", "isn't"] : ["wasn't", "didn't", "aren't"], 'neg']),
      ...cross(SUBJ.filter((x) => x.s !== 'I'), PB_C.slice(0, 6), (x, c) => [`${G} ${low(x.s)} ${c}?`, cap(wasOf(x.p)), wasOf(x.p) === 'was' ? ['Were', 'Did', 'Is'] : ['Was', 'Did', 'Are'], 'neg']),
      ...SUBJ_SAFE.filter((x) => !['I', 'You'].includes(x.s)).map((x) => [`${cap(wasOf(x.p))} ${low(x.s)} at the party? - Yes, ${x.pr} ${G}.`, wasOf(x.p), [wasOf(x.p) === 'was' ? 'were' : 'was', 'did', x.p === 3 ? 'is' : 'are'], 'neg']),
    ],
  },
};

// ---------- Past Simple ----------
const PS_VERBS = ALL_VERBS.filter((v) => v.level <= 2 && !['read', 'have'].includes(v.base));
const REG_BAD = { stopped: 'stoped', studied: 'studyed', planned: 'planed', carried: 'carryed', travelled: 'traveled', danced: 'danceed', baked: 'bakeed', practised: 'practiseed' };
const MARK = ['yesterday', 'last week', 'two days ago', 'last summer', 'on Saturday'];
const PS_SUBJ = SUBJ.filter((x) => ['I', 'She', 'We', 'Tom', 'My parents', 'They', 'He'].includes(x.s));
const wrongPast = (v) => {
  const w = [v.base, v.s];
  if (v.irregular) w.push(v.pp !== v.past ? v.pp : `${v.base.replace(/e$/, '')}ed`);
  else w.push(REG_BAD[v.past] ?? `${v.base}t`);
  return w;
};
const pastsimple = {
  name: L('Past Simple', 'Past Simple', 'Past Simple'),
  rules: {
    reg: L('Past Simple of regular verbs: verb + -ed (played, watched). Spelling: stop - stopped, study - studied, dance - danced.', 'Past Simple правильных глаголов: глагол + -ed (played, watched). Написание: stop - stopped, study - studied, dance - danced.', 'Дұрыс етістіктердің Past Simple түрі: етістік + -ed (played, watched). Жазылуы: stop - stopped, study - studied, dance - danced.'),
    irr: L('Irregular verbs have their own past form: go - went, see - saw, buy - bought. Learn them by heart.', 'У неправильных глаголов своя форма: go - went, see - saw, buy - bought. Их учат наизусть.', 'Бұрыс етістіктердің өз түрі бар: go - went, see - saw, buy - bought. Оларды жаттап алу керек.'),
    neg: L('Negative: didn\'t + verb without -ed: I didn\'t go (not "didn\'t went").', 'Отрицание: didn\'t + глагол в начальной форме: I didn\'t go (не didn\'t went).', 'Болымсыз: didn\'t + етістіктің бастапқы түрі: I didn\'t go (didn\'t went емес).'),
    q: L('Questions: (Wh-word) + did + subject + verb without -ed: Did you see it? Where did she go?', 'Вопрос: (вопросительное слово) + did + подлежащее + начальная форма: Did you see it? Where did she go?', 'Сұрақ: (сұрау сөзі) + did + бастауыш + бастапқы түр: Did you see it? Where did she go?'),
    short: L('Short answers: Yes, I did. / No, she didn\'t.', 'Краткий ответ: Yes, I did. / No, she didn\'t.', 'Қысқа жауап: Yes, I did. / No, she didn\'t.'),
  },
  levels: {
    1: () => cross(PS_SUBJ, PS_VERBS, (x, v, i, j) => [`${x.s} ${G} (${v.base}) ${v.obj} ${MARK[(i + j) % 5]}.`, v.past, wrongPast(v), v.irregular ? 'irr' : 'reg']),
    2: () => {
      const out = [];
      PS_SUBJ.forEach((x, i) =>
        PS_VERBS.forEach((v, j) => {
          const k = (i + j) % 4;
          if (k === 0) out.push([`${x.s} ${G} (${v.base}) ${v.obj} ${MARK[j % 5]}. (not)`, `didn't ${v.base}`, [`didn't ${v.past}`, `don't ${v.base}`, `not ${v.past}`].filter((w) => w !== `didn't ${v.base}`).concat(v.past === v.base ? [`wasn't ${v.base}`] : []).slice(0, 3), 'neg']);
          if (k === 1) out.push([`${G} ${low(x.s)} ${v.base} ${v.obj} ${MARK[j % 5]}?`, 'Did', [x.p === 3 ? 'Does' : 'Do', x.p === 1 || x.p === 3 ? 'Was' : 'Were', 'Has'], 'q']);
          if (k === 2 && v.past !== v.base) out.push([null, `Did ${low(x.s)} ${v.base} ${v.obj} ${MARK[j % 5]}?`, [`Did ${low(x.s)} ${v.past} ${v.obj} ${MARK[j % 5]}?`, `${cap(x.p === 1 ? 'did I' : low(x.s))} did ${v.base} ${v.obj} ${MARK[j % 5]}?`.replace(/^Did I did/, 'I did'), `${x.p === 1 || x.p === 3 ? 'Was' : 'Were'} ${low(x.s)} ${v.base} ${v.obj} ${MARK[j % 5]}?`], 'q', 'sent']);
          if (k === 3) out.push([`Where ${G} ${low(x.s)} ${v.base} ${v.obj}?`.replace(` ${v.obj}?`, '?'), 'did', [x.p === 3 ? 'does' : 'do', x.p === 1 || x.p === 3 ? 'was' : 'were', 'have'], 'q']);
        }),
      );
      SUBJ_SAFE.filter((x) => !['I', 'You'].includes(x.s)).forEach((x) => {
        out.push([`Did ${low(x.s)} enjoy the film? - Yes, ${x.pr} ${G}.`, 'did', ['do', x.p === 3 ? 'was' : 'were', 'enjoyed'], 'short']);
        out.push([`Did ${low(x.s)} call you? - No, ${x.pr} ${G}.`, "didn't", ["don't", x.p === 3 ? "wasn't" : "weren't", "not called"], 'short']);
      });
      return out;
    },
  },
};

// ---------- Исчисляемые и неисчисляемые, some / any ----------
const C_PL = 'apples|eggs|tomatoes|bananas|biscuits|oranges|sandwiches|carrots'.split('|');
const C_UN = 'milk|cheese|bread|water|rice|juice|sugar|butter'.split('|');
const C_SG = table(`
apple|an
egg|an
orange|an
banana|a
sandwich|a
carrot|a
onion|an
lemon|a
`);
const countable = {
  name: L('Countable and uncountable nouns, some / any', 'Исчисляемые и неисчисляемые, some / any', 'Саналатын және саналмайтын зат есімдер, some / any'),
  rules: {
    some: L('some - in positive sentences with plurals and uncountable nouns: There are some eggs. There is some milk.', 'some - в утверждениях с множественным числом и неисчисляемыми: There are some eggs. There is some milk.', 'some - болымды сөйлемде көпше және саналмайтын зат есіммен: There are some eggs. There is some milk.'),
    any: L('any - in negatives and questions: There isn\'t any milk. Are there any eggs?', 'any - в отрицаниях и вопросах: There isn\'t any milk. Are there any eggs?', 'any - болымсыз сөйлем мен сұрақта: There isn\'t any milk. Are there any eggs?'),
    aan: L('a / an - with one countable thing: an apple, a banana. Uncountable nouns (milk, bread, rice) have no a / an and no plural.', 'a / an - с одним исчисляемым предметом: an apple, a banana. С неисчисляемыми (milk, bread, rice) нет a / an и множественного числа.', 'a / an - бір саналатын затпен: an apple, a banana. Саналмайтын зат есімдерде (milk, bread, rice) a / an да, көпше түр де жоқ.'),
    offer: L('In offers and requests we use some: Would you like some tea? Can I have some water?', 'В предложениях и просьбах - some: Would you like some tea? Can I have some water?', 'Ұсыныс пен өтініште some қолданылады: Would you like some tea? Can I have some water?'),
    unc: L('Uncountable nouns: milk, water, bread, rice, cheese, money, music, homework, information, advice, furniture.', 'Неисчисляемые: milk, water, bread, rice, cheese, money, music, homework, information, advice, furniture.', 'Саналмайтын зат есімдер: milk, water, bread, rice, cheese, money, music, homework, information, advice, furniture.'),
  },
  levels: {
    1: () => {
      const out = [];
      for (const n of C_PL) {
        out.push([`There are ${G} ${n} in the fridge.`, 'some', ['a', 'an', 'any'], 'some']);
        out.push([`There aren't ${G} ${n} in the fridge.`, 'any', ['a', 'an', 'much'], 'any']);
        out.push([`Are there ${G} ${n} in the bag?`, 'any', ['a', 'an', 'much'], 'any']);
        out.push([`Can I have ${G} ${n}, please?`, 'some', ['a', 'an', 'much'], 'offer']);
      }
      for (const n of C_UN) {
        out.push([`There is ${G} ${n} on the table.`, 'some', ['a', 'an', 'any'], 'some']);
        out.push([`There isn't ${G} ${n} at home.`, 'any', ['a', 'an', 'many'], 'any']);
        out.push([`Is there ${G} ${n} in the kitchen?`, 'any', ['a', 'an', 'many'], 'any']);
        out.push([`Would you like ${G} ${n}?`, 'some', ['a', 'an', 'many'], 'offer']);
        out.push([`I need ${G} ${n} for the cake.`, 'some', ['a', 'an', 'many'], 'aan']);
      }
      for (const [n, art] of C_SG) out.push([`I'd like ${G} ${n}, please.`, art, [art === 'a' ? 'an' : 'a', 'any', 'much'], 'aan']);
      C_UN.forEach((u, i) => {
        const c = [C_PL[i], C_PL[(i + 3) % 8], C_PL[(i + 5) % 8]].map((x) => x.replace(/es$/, (m, k, s) => (/(tomatoes|sandwiches|oranges)$/.test(s) ? (s.endsWith('oranges') ? 'e' : '') : 'e')).replace(/s$/, ''));
        out.push([null, u, ['an apple', 'a banana', 'a carrot'].map((x, k) => [x, `${['an egg', 'a biscuit', 'a sandwich'][k]}`][i % 2]), 'unc', L('Which of these is uncountable?', 'Какое из этих существительных неисчисляемое?', 'Бұлардың қайсысы саналмайтын зат есім?')]);
        void c;
      });
      return out;
    },
  },
};

export const A1_GRAMMAR_2 = {
  'e.prepplace': prepplace,
  'e.preptime': preptime,
  'e.whq': whq,
  'e.objpron': objpron,
  'e.possessive': possessive,
  'e.likeing': likeing,
  'e.pastbe': pastbe,
  'e.pastsimple': pastsimple,
  'e.countable': countable,
};
