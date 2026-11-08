// Expression of Ideas: Transitions (связующие слова) и Rhetorical Synthesis (работа с заметками).
// Все задания авторские. Первый вариант — правильный.

import { TRANS, synthesis } from './prompts.js';

export const EXPRESSION = [
  {
    id: 't01',
    skill: 'transitions',
    d: 1,
    passage: 'Snow leopards are rarely seen in the wild. ______, scientists use motion-activated cameras to study them.',
    prompt: TRANS,
    choices: ['Therefore', 'However', 'For example', 'Similarly'],
    ex: {
      en: 'The second sentence is a result of the first (they are rarely seen → scientists use cameras). A cause-and-effect transition fits: "Therefore."',
      ru: 'Второе предложение — следствие первого (их редко видят → учёные используют камеры). Нужна связка причины и следствия: «Therefore».',
      kk: 'Екінші сөйлем біріншісінің салдары (оларды сирек көреді → ғалымдар камера қолданады). Себеп-салдар байланысы керек: «Therefore».',
    },
  },
  {
    id: 't02',
    skill: 'transitions',
    d: 1,
    passage:
      'Bamboo is extremely strong for its weight and can bend without breaking. ______, engineers in some earthquake-prone regions use it as a building material.',
    prompt: TRANS,
    choices: ['As a result', 'Nevertheless', 'In contrast', 'Meanwhile'],
    ex: {
      en: 'Bamboo’s strength and flexibility explain why engineers use it, so the relationship is cause and effect: "As a result."',
      ru: 'Прочность и гибкость бамбука объясняют, почему его используют инженеры, — это причина и следствие: «As a result».',
      kk: 'Бамбуктың беріктігі мен иілгіштігі инженерлердің оны неге қолданатынын түсіндіреді — бұл себеп пен салдар: «As a result».',
    },
  },
  {
    id: 't03',
    skill: 'transitions',
    d: 1,
    passage:
      'Most bats rely on echolocation to find food in the dark. Fruit bats, ______, often depend on their excellent sense of smell and vision.',
    prompt: TRANS,
    choices: ['however', 'therefore', 'for instance', 'in addition'],
    ex: {
      en: 'Fruit bats behave differently from most bats, so the sentences contrast: "however."',
      ru: 'Фруктовые летучие мыши ведут себя иначе, чем большинство летучих мышей, — это противопоставление: «however».',
      kk: 'Жеміс жарқанаттары көпшілік жарқанаттардан басқаша әрекет етеді — бұл қарама-қарсылық: «however».',
    },
  },
  {
    id: 't04',
    skill: 'transitions',
    d: 2,
    passage:
      'Some ancient cultures used astronomy to plan their farming year. ______, Egyptian farmers watched for the rising of the star Sirius, which signaled the coming flood of the Nile.',
    prompt: TRANS,
    choices: ['For example', 'However', 'Still', 'Instead'],
    ex: {
      en: 'The Egyptian farmers are a specific case of the general statement in the first sentence: "For example."',
      ru: 'Египетские земледельцы — конкретный пример общего утверждения из первого предложения: «For example».',
      kk: 'Мысырлық егіншілер — бірінші сөйлемдегі жалпы тұжырымның нақты мысалы: «For example».',
    },
  },
  {
    id: 't05',
    skill: 'transitions',
    d: 2,
    passage:
      'The Silk Road allowed merchants to trade goods such as silk, spices, and paper. ______, it helped spread ideas, religions, and technologies between East and West.',
    prompt: TRANS,
    choices: ['Moreover', 'Conversely', 'Thus', 'Nonetheless'],
    ex: {
      en: 'The second sentence adds another benefit of the Silk Road, so an addition transition fits: "Moreover."',
      ru: 'Второе предложение добавляет ещё одну пользу Шёлкового пути — нужна связка добавления: «Moreover».',
      kk: 'Екінші сөйлем Жібек жолының тағы бір пайдасын қосады — қосу мәніндегі байланыс керек: «Moreover».',
    },
  },
  {
    id: 't06',
    skill: 'transitions',
    d: 2,
    passage:
      'When it was first published, many critics dismissed the novel as too long and confusing. ______, it is now considered one of the most important works of the century.',
    prompt: TRANS,
    choices: ['Today, however', 'Similarly', 'In other words', 'For instance'],
    ex: {
      en: 'Past criticism is contrasted with the novel’s present reputation, so we need a contrast that also marks time: "Today, however."',
      ru: 'Прошлая критика противопоставляется нынешней репутации романа — нужна связка противопоставления с указанием времени: «Today, however».',
      kk: 'Бұрынғы сын романның қазіргі беделіне қарама-қарсы қойылады — уақытты көрсететін қарсылық байланысы керек: «Today, however».',
    },
  },
  {
    id: 't07',
    skill: 'transitions',
    d: 2,
    passage:
      'Honeybees share the location of food through a “waggle dance.” The angle of the dance shows the direction of the food source. ______, the length of the dance shows how far away the food is.',
    prompt: TRANS,
    choices: ['In addition', 'Instead', 'In contrast', 'Despite this'],
    ex: {
      en: 'The dance gives a second piece of information (distance) on top of the first (direction): "In addition."',
      ru: 'Танец сообщает второе сведение (расстояние) в дополнение к первому (направлению): «In addition».',
      kk: 'Би біріншісіне (бағытқа) қосымша екінші мәліметті (қашықтықты) береді: «In addition».',
    },
  },
  {
    id: 't08',
    skill: 'transitions',
    d: 3,
    passage:
      'To make a traditional felt carpet called a syrmak, artisans first wash and dye the wool. ______, they arrange the colored pieces into a pattern and press them together using hot water.',
    prompt: TRANS,
    choices: ['Next', 'Previously', 'Similarly', 'In summary'],
    ex: {
      en: 'The text describes steps in order ("first..."), so the next step needs a sequence transition: "Next."',
      ru: 'Текст описывает шаги по порядку («first...»), поэтому для следующего шага нужна связка последовательности: «Next».',
      kk: 'Мәтін қадамдарды ретімен сипаттайды («first...»), сондықтан келесі қадамға реттілік байланысы керек: «Next».',
    },
  },
  {
    id: 't09',
    skill: 'transitions',
    d: 3,
    passage:
      'The researchers expected that the new fertilizer would greatly increase crop yields. ______, yields in the test fields were nearly identical to those in fields that received no fertilizer.',
    prompt: TRANS,
    choices: ['Surprisingly, though', 'Consequently', 'Specifically', 'Likewise'],
    ex: {
      en: 'The result went against the expectation, so we need a contrast that signals surprise: "Surprisingly, though."',
      ru: 'Результат противоречит ожиданию — нужна связка противопоставления с оттенком неожиданности: «Surprisingly, though».',
      kk: 'Нәтиже күтілгенге қайшы — таңданыс реңкі бар қарсылық байланысы керек: «Surprisingly, though».',
    },
  },
  {
    id: 't10',
    skill: 'transitions',
    d: 3,
    passage:
      'The octopus has a highly decentralized nervous system. ______, about two-thirds of its neurons are located in its arms rather than in its brain.',
    prompt: TRANS,
    choices: ['In fact', 'However', 'Even so', 'Instead'],
    ex: {
      en: 'The second sentence gives a striking detail that strengthens the first claim. "In fact" introduces such emphasis; the other options signal contrast.',
      ru: 'Второе предложение приводит яркую деталь, усиливающую первое утверждение. Такое усиление вводит «In fact»; остальные варианты выражают противопоставление.',
      kk: 'Екінші сөйлем бірінші тұжырымды күшейтетін әсерлі деталь келтіреді. Мұндай күшейтуді «In fact» енгізеді; қалғандары қарсылықты білдіреді.',
    },
  },
  {
    id: 't11',
    skill: 'transitions',
    d: 2,
    passage:
      'The experiment was small, involving only twelve participants. ______, its results were striking enough to inspire several much larger studies.',
    prompt: TRANS,
    choices: ['Even so', 'Therefore', 'For example', 'Similarly'],
    ex: {
      en: 'Despite a weakness (a small study), the results were influential. This concession is signaled by "Even so."',
      ru: 'Несмотря на недостаток (маленькое исследование), результаты оказались влиятельными. Такую уступку выражает «Even so».',
      kk: 'Кемшілігіне (зерттеудің шағындығына) қарамастан, нәтижелер ықпалды болды. Мұндай қарсылықты «Even so» білдіреді.',
    },
  },
  {
    id: 't12',
    skill: 'transitions',
    d: 3,
    passage:
      'The city replaced all of its streetlights with energy-efficient LED bulbs. ______, its electricity costs for street lighting fell by nearly half.',
    prompt: TRANS,
    choices: ['As a result', 'In contrast', 'For instance', 'Regardless'],
    ex: {
      en: 'Lower costs are the effect of switching to LED bulbs: "As a result."',
      ru: 'Снижение расходов — следствие перехода на светодиоды: «As a result».',
      kk: 'Шығынның азаюы — LED шамдарға көшудің салдары: «As a result».',
    },
  },
  {
    id: 't13',
    skill: 'transitions',
    d: 3,
    passage:
      'Many students prepare for exams by rereading their notes again and again. Research suggests that this method is not very effective. Students should, ______, test themselves with practice questions, which strengthens memory far more.',
    prompt: TRANS,
    choices: ['instead', 'similarly', 'for example', 'in addition'],
    ex: {
      en: 'Practice questions are offered as a replacement for rereading, so the correct transition is "instead."',
      ru: 'Практические вопросы предлагаются взамен перечитывания, поэтому нужна связка «instead» (вместо этого).',
      kk: 'Жаттығу сұрақтары қайта оқудың орнына ұсынылады, сондықтан «instead» (оның орнына) байланысы керек.',
    },
  },
  {
    id: 's01',
    skill: 'synthesis',
    d: 1,
    notes: [
      'Abai Kunanbayev (1845–1904) was a Kazakh poet and philosopher.',
      'He translated works by Russian poets such as Pushkin and Lermontov into Kazakh.',
      'His collection of prose essays is known as the Book of Words.',
      'He is often called the founder of modern Kazakh written literature.',
    ],
    prompt: synthesis('emphasize Abai’s work as a translator'),
    choices: [
      'Abai Kunanbayev translated works by Russian poets such as Pushkin and Lermontov into Kazakh.',
      'Abai Kunanbayev, who lived from 1845 to 1904, was a poet and philosopher.',
      'Abai’s prose essays are collected in the Book of Words.',
      'Abai is often called the founder of modern Kazakh written literature.',
    ],
    ex: {
      en: 'The goal is about translation. Only the first choice mentions what Abai translated; the others are true but describe different parts of his life.',
      ru: 'Цель — подчеркнуть переводческую работу. Только первый вариант говорит о переводах; остальные верны, но о другом.',
      kk: 'Мақсат — аудармашылық жұмысын көрсету. Тек бірінші нұсқа аудармалар туралы айтады; қалғандары дұрыс, бірақ басқа туралы.',
    },
  },
  {
    id: 's02',
    skill: 'synthesis',
    d: 1,
    notes: [
      'Tardigrades are microscopic animals about 0.5 millimeters long.',
      'They can survive temperatures from about −272°C to 150°C.',
      'In 2007, tardigrades survived ten days in open space.',
      'They are found in moss, ocean sediment, and mountain soils.',
    ],
    prompt: synthesis('emphasize how tough tardigrades are'),
    choices: [
      'Tardigrades can survive extreme conditions, including temperatures from about −272°C to 150°C and even ten days in open space.',
      'Tardigrades, which are about 0.5 millimeters long, are microscopic animals.',
      'Tardigrades can be found in moss, ocean sediment, and mountain soils.',
      'Tardigrades are tiny animals that live in many different places.',
    ],
    ex: {
      en: 'Toughness = surviving extreme conditions. Only the first choice uses the notes about temperature and open space.',
      ru: 'Выносливость — это выживание в экстремальных условиях. Только первый вариант использует заметки о температурах и открытом космосе.',
      kk: 'Төзімділік — қатал жағдайларда тірі қалу. Тек бірінші нұсқа температура мен ашық ғарыш туралы жазбаларды қолданады.',
    },
  },
  {
    id: 's03',
    skill: 'synthesis',
    d: 2,
    notes: [
      'The Hubble Space Telescope was launched in 1990.',
      'Hubble’s main mirror is 2.4 meters wide.',
      'The James Webb Space Telescope was launched in 2021.',
      'Webb’s main mirror is 6.5 meters wide.',
      'Webb observes mainly in infrared light.',
    ],
    prompt: synthesis('compare the sizes of the two telescopes’ main mirrors'),
    choices: [
      'At 6.5 meters wide, Webb’s main mirror is much larger than Hubble’s 2.4-meter mirror.',
      'Hubble was launched in 1990, while Webb was launched in 2021.',
      'Webb observes mainly in infrared light.',
      'Both Hubble and Webb are space telescopes with large main mirrors.',
    ],
    ex: {
      en: 'A comparison of mirror sizes needs both numbers. Choice B compares dates, and choice D mentions mirrors without comparing their sizes.',
      ru: 'Для сравнения размеров зеркал нужны оба числа. Вариант с датами сравнивает годы запуска, а вариант «Both...» не сравнивает размеры.',
      kk: 'Айналардың өлшемін салыстыру үшін екі сан да керек. Даталар бар нұсқа ұшыру жылдарын салыстырады, ал «Both...» нұсқасы өлшемдерді салыстырмайды.',
    },
  },
  {
    id: 's04',
    skill: 'synthesis',
    d: 2,
    notes: [
      'In 2019, researchers studied how city noise affects songbirds.',
      'They recorded great tits singing in quiet forests and in noisy cities.',
      'City birds sang at higher pitches than forest birds.',
      'The researchers concluded that the birds adjust their songs to be heard over low-pitched traffic noise.',
    ],
    prompt: synthesis('present the researchers’ conclusion'),
    choices: [
      'The researchers concluded that great tits adjust their songs to be heard over low-pitched traffic noise.',
      'In 2019, researchers recorded great tits singing in forests and in cities.',
      'Great tits are songbirds that live in both forests and cities.',
      'The study, which took place in 2019, focused on songbirds.',
    ],
    ex: {
      en: 'The goal asks for the conclusion — what the researchers decided the results mean. Only the first choice states it.',
      ru: 'Нужен вывод — то, как исследователи объяснили результаты. Его содержит только первый вариант.',
      kk: 'Қорытынды керек — зерттеушілердің нәтижелерді қалай түсіндіргені. Оны тек бірінші нұсқа айтады.',
    },
  },
  {
    id: 's05',
    skill: 'synthesis',
    d: 2,
    notes: [
      'Kumis is a traditional drink in Central Asia.',
      'It is made from fermented mare’s milk.',
      'It has a slightly sour taste.',
      'Nomadic herders have made it for thousands of years.',
    ],
    prompt: synthesis('introduce kumis to an audience unfamiliar with it'),
    choices: [
      'Kumis, a traditional Central Asian drink, is made from fermented mare’s milk.',
      'Nomadic herders have made it for thousands of years.',
      'Kumis has a slightly sour taste.',
      'For thousands of years, kumis has had a slightly sour taste.',
    ],
    ex: {
      en: 'An unfamiliar audience first needs to know what kumis is. The first choice explains what it is and what it is made from.',
      ru: 'Незнакомой аудитории сначала нужно объяснить, что такое кумыс. Первый вариант говорит, что это и из чего его делают.',
      kk: 'Бейтаныс аудиторияға алдымен қымыздың не екенін түсіндіру керек. Бірінші нұсқа оның не екенін және неден жасалатынын айтады.',
    },
  },
  {
    id: 's06',
    skill: 'synthesis',
    d: 3,
    notes: [
      'Aluminum has a density of 2.7 grams per cubic centimeter.',
      'Steel has a density of about 7.8 grams per cubic centimeter.',
      'Aluminum does not rust.',
      'Steel is generally stronger than aluminum.',
      'Both metals are widely used in car manufacturing.',
    ],
    prompt: synthesis('emphasize a difference in density between the two metals'),
    choices: [
      'Aluminum, with a density of 2.7 grams per cubic centimeter, is far less dense than steel, which has a density of about 7.8.',
      'Both aluminum and steel are widely used in car manufacturing.',
      'Steel is generally stronger than aluminum, but aluminum does not rust.',
      'Aluminum has a density of 2.7 grams per cubic centimeter.',
    ],
    ex: {
      en: 'The goal requires a difference AND density. Choice C shows a difference but not in density; choice D gives only one metal’s density.',
      ru: 'Нужно и различие, и плотность. Вариант про прочность показывает различие, но не в плотности; последний вариант даёт плотность только одного металла.',
      kk: 'Айырмашылық та, тығыздық та керек. Беріктік туралы нұсқа айырмашылықты көрсетеді, бірақ тығыздықты емес; соңғы нұсқа тек бір металдың тығыздығын береді.',
    },
  },
  {
    id: 's07',
    skill: 'synthesis',
    d: 3,
    notes: [
      'Drip irrigation delivers water directly to plant roots through small tubes.',
      'Traditional flood irrigation covers entire fields with water.',
      'Drip irrigation can reduce water use by 30 to 50 percent.',
      'Drip systems are more expensive to install.',
    ],
    prompt: synthesis('emphasize an advantage of drip irrigation over flood irrigation'),
    choices: [
      'Because it delivers water directly to plant roots, drip irrigation can use 30 to 50 percent less water than flood irrigation.',
      'Drip irrigation systems are more expensive to install than flood irrigation.',
      'Flood irrigation covers entire fields with water.',
      'Drip irrigation delivers water through small tubes.',
    ],
    ex: {
      en: 'An advantage over flood irrigation must compare the two methods in drip irrigation’s favor. Only the first choice does this (less water). The second choice is a disadvantage.',
      ru: 'Преимущество над поливом затоплением — это сравнение в пользу капельного полива. Это делает только первый вариант (меньше воды). Второй вариант — недостаток.',
      kk: 'Басымдық — тамшылатып суаруды жайып суарумен оның пайдасына салыстыру. Мұны тек бірінші нұсқа жасайды (су аз). Екінші нұсқа — кемшілік.',
    },
  },
  {
    id: 's08',
    skill: 'synthesis',
    d: 2,
    notes: [
      'The “Golden Man” is a warrior’s burial costume found in Kazakhstan.',
      'It is decorated with about 4,000 gold pieces.',
      'It was discovered in 1969 in the Issyk burial mound near Almaty.',
      'It has become a national symbol of Kazakhstan.',
    ],
    prompt: synthesis('indicate when and where the Golden Man was discovered'),
    choices: [
      'The Golden Man was discovered in 1969 in the Issyk burial mound near Almaty.',
      'The Golden Man is decorated with about 4,000 gold pieces.',
      'The Golden Man has become a national symbol of Kazakhstan.',
      'Found in Kazakhstan, the Golden Man is a warrior’s burial costume.',
    ],
    ex: {
      en: 'The goal needs both WHEN and WHERE. The last choice gives only a place (Kazakhstan) and no date.',
      ru: 'Нужны и КОГДА, и ГДЕ. Последний вариант называет только место (Казахстан), без даты.',
      kk: 'ҚАШАН да, ҚАЙДА да керек. Соңғы нұсқа тек орынды (Қазақстан) атайды, датасы жоқ.',
    },
  },
  {
    id: 's09',
    skill: 'synthesis',
    d: 3,
    notes: [
      'Camels live mainly in Africa and Asia.',
      'Llamas live in South America.',
      'Both camels and llamas belong to the family Camelidae.',
      'Camels can go long periods without drinking water.',
    ],
    prompt: synthesis('emphasize a similarity between camels and llamas'),
    choices: [
      'Although they live on different continents, camels and llamas both belong to the family Camelidae.',
      'Camels live mainly in Africa and Asia, while llamas live in South America.',
      'Llamas live in South America.',
      'Camels can go long periods without drinking water.',
    ],
    ex: {
      en: 'A similarity must apply to BOTH animals. Only the family Camelidae is shared; the second choice shows a difference.',
      ru: 'Сходство должно касаться ОБОИХ животных. Общее у них — семейство Camelidae; второй вариант показывает различие.',
      kk: 'Ұқсастық ЕКІ жануарға да қатысты болуы керек. Ортақ белгі — Camelidae тұқымдасы; екінші нұсқа айырмашылықты көрсетеді.',
    },
  },
  {
    id: 's10',
    skill: 'synthesis',
    d: 1,
    notes: [
      'Wangari Maathai (1940–2011) was a Kenyan environmental activist.',
      'She founded the Green Belt Movement in 1977.',
      'The movement has planted tens of millions of trees.',
      'In 2004, she became the first African woman to win the Nobel Peace Prize.',
    ],
    prompt: synthesis('highlight Maathai’s achievement in 2004'),
    choices: [
      'In 2004, Wangari Maathai became the first African woman to win the Nobel Peace Prize.',
      'Wangari Maathai founded the Green Belt Movement in 1977.',
      'The Green Belt Movement has planted tens of millions of trees.',
      'Wangari Maathai was a Kenyan environmental activist who lived from 1940 to 2011.',
    ],
    ex: {
      en: 'The goal names a specific year (2004). Only the first choice describes what happened in 2004.',
      ru: 'В цели указан конкретный год (2004). Только первый вариант говорит о событии 2004 года.',
      kk: 'Мақсатта нақты жыл (2004) көрсетілген. Тек бірінші нұсқа 2004 жылғы оқиға туралы айтады.',
    },
  },
  {
    id: 's11',
    skill: 'synthesis',
    d: 3,
    notes: [
      'Researchers wanted to know whether dogs recognize their owners’ voices.',
      'They played recordings of owners’ voices and strangers’ voices to 30 dogs.',
      'They measured how quickly each dog turned its head toward the speaker.',
      'Dogs turned faster toward their owners’ voices.',
    ],
    prompt: synthesis('explain how the researchers collected their data'),
    choices: [
      'The researchers played recordings of owners’ and strangers’ voices to 30 dogs and measured how quickly each dog turned toward the speaker.',
      'Dogs turned faster toward their owners’ voices than toward strangers’ voices.',
      'The researchers wanted to know whether dogs recognize their owners’ voices.',
      'The study involved 30 dogs and their owners.',
    ],
    ex: {
      en: '"How they collected data" = the method. The second choice is the result, the third is the research question, and the fourth lacks what was measured.',
      ru: '«Как собирали данные» — это метод. Второй вариант — результат, третий — вопрос исследования, в четвёртом нет того, что измеряли.',
      kk: '«Деректерді қалай жинады» — бұл әдіс. Екінші нұсқа — нәтиже, үшіншісі — зерттеу сұрағы, төртіншісінде не өлшенгені жоқ.',
    },
  },
];
