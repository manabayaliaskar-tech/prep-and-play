// Information and Ideas: Central Ideas, Command of Evidence (Textual и Quantitative), Inferences.
// Все тексты авторские; числа в таблицах — учебные. Первый вариант — правильный.

import { INFER, MAIN, QUANT } from './prompts.js';

const SUPPORT = (who) => `Which finding, if true, would most directly support ${who}?`;
const WEAKEN = (who) => `Which finding, if true, would most directly weaken ${who}?`;

export const INFO = [
  {
    id: 'm01',
    skill: 'central',
    d: 1,
    passage:
      'Sea otters often float on their backs and use stones to crack open shellfish. Many otters keep a favorite stone, storing it in a pouch of loose skin under one arm. Researchers have observed some otters carrying the same stone for long periods.',
    prompt: MAIN,
    choices: [
      'Sea otters use stones as tools to open shellfish and often keep a favorite one.',
      'Sea otters spend most of their lives floating on their backs.',
      'Researchers have studied sea otters for many years.',
      'Shellfish are the only food that sea otters eat.',
    ],
    ex: {
      en: 'All three sentences are about otters using and keeping stones. The other choices are either too narrow or not stated.',
      ru: 'Все три предложения — о том, как каланы используют и хранят камни. Остальные варианты слишком узкие или не следуют из текста.',
      kk: 'Үш сөйлем де теңіз құндыздарының тасты қолдануы мен сақтауы туралы. Қалған нұсқалар тым тар не мәтінде айтылмаған.',
    },
  },
  {
    id: 'm02',
    skill: 'central',
    d: 2,
    passage:
      'In 2016, the city of Almaty began building bike lanes and launched a public bike-sharing system. At first, many residents doubted that cycling would catch on in a city with steep hills and cold winters. Within a few years, however, the system was recording more than a million rides a year, and city officials began planning additional lanes.',
    prompt: MAIN,
    choices: [
      'Despite early doubts, Almaty’s bike-sharing system became popular.',
      'Almaty’s steep hills make cycling impossible in winter.',
      'City officials in Almaty oppose building new bike lanes.',
      'Bike-sharing systems are more successful in warm cities.',
    ],
    ex: {
      en: 'The text moves from doubts to success ("however... more than a million rides"). The other choices contradict the text or go beyond it.',
      ru: 'Текст идёт от сомнений к успеху («however... more than a million rides»). Другие варианты противоречат тексту или выходят за его рамки.',
      kk: 'Мәтін күдіктен табысқа ауысады («however... more than a million rides»). Басқа нұсқалар мәтінге қайшы не одан тыс.',
    },
  },
  {
    id: 'm03',
    skill: 'central',
    d: 2,
    passage:
      'Daniyar had always believed that his younger sister was simply lucky: she won drawing prizes without seeming to try, and every teacher remembered her name. But when he found the stack of drawings hidden under her bed—dozens of them, each covered with her careful corrections—he realized that what he had called luck was something else entirely.',
    prompt: MAIN,
    choices: [
      'Daniyar realizes that his sister’s success comes from hard work rather than luck.',
      'Daniyar is jealous of his sister and wants to hide her drawings.',
      'Daniyar’s sister has given up drawing because of her failures.',
      'Teachers prefer Daniyar’s sister because she is younger.',
    ],
    ex: {
      en: 'Dozens of corrected drawings show hidden effort, and Daniyar understands that it was not luck. That change in his understanding is the main idea.',
      ru: 'Десятки исправленных рисунков — это скрытый труд, и Данияр понимает, что дело не в удаче. Главная мысль — эта перемена в его понимании.',
      kk: 'Ондаған түзетілген сурет — жасырын еңбек, және Данияр мұның сәттілік емес екенін түсінеді. Негізгі ой — оның түсінігінің өзгеруі.',
    },
  },
  {
    id: 'm04',
    skill: 'central',
    d: 3,
    passage:
      'The Svalbard Global Seed Vault, built deep inside a mountain in Norway, stores more than a million seed samples from around the world. It is designed as a backup: if a disaster or war destroys a country’s seed collection, that country can retrieve copies. In 2015, researchers from Syria did exactly that, withdrawing seeds to rebuild a collection damaged by conflict.',
    prompt: MAIN,
    choices: [
      'The Svalbard vault safeguards seed samples so that lost collections can be restored, as happened in Syria’s case.',
      'Norway built the vault in order to grow crops in the Arctic.',
      'Syria has the largest seed collection in the world.',
      'Natural disasters are the main threat to the world’s food supply.',
    ],
    ex: {
      en: 'The text explains the vault’s purpose (a backup) and gives Syria as proof that it works. The first choice combines both.',
      ru: 'Текст объясняет назначение хранилища (резервная копия) и приводит пример Сирии. Первый вариант объединяет и то и другое.',
      kk: 'Мәтін қойманың мақсатын (сақтық көшірме) түсіндіріп, Сирия мысалын келтіреді. Бірінші нұсқа екеуін де біріктіреді.',
    },
  },
  {
    id: 'm05',
    skill: 'central',
    d: 3,
    passage:
      'Scientists once thought that the human brain stopped producing new neurons after childhood. Studies in the late 1990s, however, found evidence that the hippocampus, a region important for memory, continues to produce new neurons in adults. Researchers are now investigating whether activities such as exercise can increase this production.',
    prompt: MAIN,
    choices: [
      'Evidence suggests that adults keep producing new neurons in part of the brain, which has prompted further research.',
      'Exercise is the most important factor in brain development.',
      'The hippocampus is the only part of the brain involved in memory.',
      'Children produce more neurons than adults because they exercise more.',
    ],
    ex: {
      en: 'Old belief → new evidence (adult neurons in the hippocampus) → new research. The text never says exercise is "the most important factor."',
      ru: 'Старое мнение → новые данные (новые нейроны у взрослых) → новые исследования. Текст не утверждает, что спорт — «главный фактор».',
      kk: 'Ескі пікір → жаңа дерек (ересектерде жаңа нейрондар) → жаңа зерттеулер. Мәтін спортты «ең маңызды фактор» деп айтпайды.',
    },
  },
  {
    id: 'm06',
    skill: 'central',
    d: 1,
    passage:
      'Kazakhstan is the largest landlocked country in the world. Its territory, which is larger than all of Western Europe, includes deserts, mountains, lakes, and vast grasslands called steppes.',
    prompt: MAIN,
    choices: [
      'Kazakhstan is a very large country with varied landscapes.',
      'Kazakhstan is larger than every country in Europe combined.',
      'Most of Kazakhstan is covered by deserts.',
      'Kazakhstan has more lakes than any other country.',
    ],
    ex: {
      en: 'The text stresses size and variety of landscapes. It compares Kazakhstan with Western Europe, not all of Europe, and never says deserts dominate.',
      ru: 'Текст подчёркивает размер и разнообразие ландшафтов. Сравнение — с Западной Европой, а не со всей Европой, и про преобладание пустынь не сказано.',
      kk: 'Мәтін аумақтың үлкендігі мен ландшафт алуандығын атап өтеді. Салыстыру бүкіл Еуропамен емес, Батыс Еуропамен, шөлдердің басымдығы туралы айтылмаған.',
    },
  },
  {
    id: 'm07',
    skill: 'central',
    d: 2,
    passage:
      'When the Hubble Space Telescope was launched in 1990, its first images were blurry because its main mirror had been ground to slightly the wrong shape. Rather than replace the mirror, engineers designed corrective optics—essentially eyeglasses for the telescope—which astronauts installed in 1993. Hubble went on to produce some of the sharpest images of space ever taken.',
    prompt: MAIN,
    choices: [
      'A flaw in Hubble’s mirror was fixed with added optics, after which the telescope produced excellent images.',
      'Engineers replaced Hubble’s main mirror in 1993.',
      'Hubble took blurry images throughout its entire mission.',
      'Astronauts rarely repair telescopes in space.',
    ],
    ex: {
      en: 'Problem (blurry images) → fix (corrective optics, not a new mirror) → result (sharp images). The second choice contradicts "rather than replace the mirror."',
      ru: 'Проблема (размытые снимки) → решение (корректирующая оптика, а не новое зеркало) → результат (чёткие снимки). Вариант про замену зеркала противоречит тексту.',
      kk: 'Мәселе (бұлыңғыр суреттер) → шешім (айнаны ауыстыру емес, түзеткіш оптика) → нәтиже (анық суреттер). Айнаны ауыстыру туралы нұсқа мәтінге қайшы.',
    },
  },
  {
    id: 'e01',
    skill: 'evidence',
    d: 2,
    passage:
      'Biologist Lena Park hypothesizes that crows can recognize individual human faces and remember people who have threatened them.',
    prompt: SUPPORT('Park’s hypothesis'),
    choices: [
      'Crows scolded people wearing a mask that had earlier been worn by someone who captured crows, but ignored people wearing other masks.',
      'Crows were observed eating a wide variety of foods in city parks.',
      'Crows living in cities had larger populations than those living in forests.',
      'Crows made more noise in the morning than in the evening.',
    ],
    ex: {
      en: 'The hypothesis is about recognizing faces and remembering threats. Only the mask experiment tests exactly that.',
      ru: 'Гипотеза — об узнавании лиц и запоминании угрозы. Это проверяет только эксперимент с масками.',
      kk: 'Гипотеза — бет-әлпетті тану және қауіпті есте сақтау туралы. Мұны тек маскалармен жасалған тәжірибе тексереді.',
    },
  },
  {
    id: 'e02',
    skill: 'evidence',
    d: 2,
    passage:
      'Researchers hypothesize that students remember information better when they explain it aloud to someone else than when they simply reread it.',
    prompt: SUPPORT('the researchers’ hypothesis'),
    choices: [
      'Students who explained a lesson to a partner scored higher on a memory test a week later than students who reread the lesson.',
      'Students preferred rereading to explaining because it took less time.',
      'Students who reread the lesson read it an average of three times.',
      'Some students reported that explaining material aloud made them nervous.',
    ],
    ex: {
      en: 'Support must compare memory for explaining versus rereading. Only the first choice measures memory for both groups.',
      ru: 'Поддержка должна сравнивать запоминание при объяснении и при перечитывании. Только первый вариант измеряет память обеих групп.',
      kk: 'Дәлел түсіндіру мен қайта оқудағы есте сақтауды салыстыруы керек. Тек бірінші нұсқа екі топтың да есте сақтауын өлшейді.',
    },
  },
  {
    id: 'e03',
    skill: 'evidence',
    d: 3,
    passage:
      'Some historians claim that the city of Otrar declined mainly because its irrigation canals were destroyed during the Mongol invasion of 1219.',
    prompt: WEAKEN('the historians’ claim'),
    choices: [
      'Archaeological evidence shows that Otrar’s canals were rebuilt soon after 1219 and that the city prospered for another two centuries.',
      'Otrar was an important stop on the Silk Road before 1219.',
      'The Mongol army that attacked Otrar was very large.',
      'Many cities in Central Asia relied on irrigation canals.',
    ],
    ex: {
      en: 'If the canals were rebuilt and the city kept prospering, the invasion could not be the main cause of decline — this weakens the claim.',
      ru: 'Если каналы восстановили и город ещё долго процветал, то нашествие не могло быть главной причиной упадка — это ослабляет утверждение.',
      kk: 'Егер арналар қалпына келтіріліп, қала ұзақ гүлденсе, шапқыншылық құлдыраудың басты себебі бола алмайды — бұл тұжырымды әлсіретеді.',
    },
  },
  {
    id: 'e04',
    skill: 'evidence',
    d: 2,
    passage:
      'In a short story, the narrator describes her first week in a big city as both thrilling and exhausting.',
    prompt: 'Which quotation from the story most effectively illustrates this claim?',
    choices: [
      '“Every street seemed to promise something new, and by evening I was so tired that even the bright shop windows hurt my eyes.”',
      '“I took the bus from the airport and arrived at my aunt’s apartment just after noon.”',
      '“The city has grown quickly over the past thirty years.”',
      '“My cousin had lived in the city for six years before I arrived.”',
    ],
    ex: {
      en: 'The claim has two parts: thrilling ("promise something new") and exhausting ("so tired"). Only the first quotation shows both.',
      ru: 'В утверждении две части: восторг («promise something new») и усталость («so tired»). Обе есть только в первой цитате.',
      kk: 'Тұжырымның екі бөлігі бар: қуаныш («promise something new») және шаршау («so tired»). Екеуі де тек бірінші дәйексөзде бар.',
    },
  },
  {
    id: 'e05',
    skill: 'evidence',
    d: 3,
    passage:
      'Economist Ruslan Ospanov argues that switching to a four-day workweek can increase how much workers accomplish per hour.',
    prompt: SUPPORT('Ospanov’s argument'),
    choices: [
      'In companies that switched to a four-day week, the amount of work completed per hour rose, while total weekly output stayed about the same.',
      'Most workers said they would prefer a four-day workweek.',
      'Companies that adopted a four-day week reduced their electricity costs.',
      'Some workers used their extra day off to travel.',
    ],
    ex: {
      en: 'The argument is specifically about output PER HOUR. Preferences, electricity costs, and travel don’t measure productivity.',
      ru: 'Аргумент именно о результативности ЗА ЧАС. Предпочтения, расходы на электричество и путешествия её не измеряют.',
      kk: 'Дәйек нақты САҒАТ сайынғы өнімділік туралы. Қалаулар, электр шығыны мен саяхат оны өлшемейді.',
    },
  },
  {
    id: 'e06',
    skill: 'evidence',
    d: 3,
    passage:
      'A team of ecologists claims that wolves reintroduced into a national park indirectly helped riverbank trees recover by changing the behavior of the deer that eat young trees.',
    prompt: SUPPORT('the ecologists’ claim'),
    choices: [
      'After the wolves returned, deer spent less time near rivers, where they were more exposed to predators, and young trees there grew taller.',
      'The number of tourists visiting the park to see wolves increased.',
      'Wolves in the park mostly hunted at night.',
      'Deer populations in parks without wolves stayed about the same.',
    ],
    ex: {
      en: 'The claim links three things: wolves → deer behavior → tree recovery. Only the first choice shows all three links.',
      ru: 'Утверждение связывает три звена: волки → поведение оленей → восстановление деревьев. Все три звена есть только в первом варианте.',
      kk: 'Тұжырым үш буынды байланыстырады: қасқырлар → бұғылардың мінез-құлқы → ағаштардың қалпына келуі. Үшеуі де тек бірінші нұсқада бар.',
    },
  },
  {
    id: 'q01',
    skill: 'quant',
    d: 1,
    passage: 'A student is comparing spring weather in three cities. According to the table, ______',
    table: {
      caption: 'Average April rainfall (illustrative data)',
      headers: ['City', 'Rainfall (millimeters)'],
      rows: [
        ['Almaty', 102],
        ['Astana', 22],
        ['Shymkent', 63],
      ],
    },
    prompt: QUANT,
    choices: [
      'Almaty receives more April rainfall than either Astana or Shymkent.',
      'Astana receives more April rainfall than Almaty.',
      'Shymkent receives the least April rainfall of the three cities.',
      'All three cities receive about the same amount of rainfall in April.',
    ],
    ex: {
      en: 'Almaty has 102 mm, the largest value. Astana (22 mm) has the least, so the other statements are false.',
      ru: 'У Алматы 102 мм — это максимум. Меньше всех у Астаны (22 мм), поэтому остальные утверждения неверны.',
      kk: 'Алматыда 102 мм — ең көп мән. Ең азы Астанада (22 мм), сондықтан қалған тұжырымдар қате.',
    },
  },
  {
    id: 'q02',
    skill: 'quant',
    d: 2,
    passage:
      'Researchers studied whether sleep is related to test performance. They concluded that students who slept more tended to earn higher scores. ______',
    table: {
      caption: 'Average test score by nightly sleep',
      headers: ['Hours of sleep', 'Average score'],
      rows: [
        ['Less than 6', 68],
        ['6 to 8', 76],
        ['More than 8', 83],
      ],
    },
    prompt: 'Which choice most effectively uses data from the table to support the researchers’ conclusion?',
    choices: [
      'Students who slept more than 8 hours had an average score of 83, compared with 68 for students who slept less than 6 hours.',
      'Students who slept 6 to 8 hours had an average score of 76.',
      'Some students slept less than 6 hours a night.',
      'Average scores ranged from 68 to 76.',
    ],
    ex: {
      en: 'Support for "more sleep → higher scores" needs a comparison between groups. The second choice gives one number only, and the last one is false (the top score is 83).',
      ru: 'Чтобы подтвердить «больше сна → выше баллы», нужно сравнить группы. Второй вариант даёт одно число, а последний неверен (максимум — 83).',
      kk: '«Ұйқы көп → балл жоғары» тұжырымын растау үшін топтарды салыстыру керек. Екінші нұсқада бір ғана сан, ал соңғысы қате (ең жоғары — 83).',
    },
  },
  {
    id: 'q03',
    skill: 'quant',
    d: 2,
    passage:
      'Conservation efforts in Kazakhstan have helped the saiga antelope population recover dramatically after a sharp decline. ______',
    table: {
      caption: 'Estimated saiga antelope population (rounded)',
      headers: ['Year', 'Estimated population'],
      rows: [
        ['2015', '110,000'],
        ['2019', '334,000'],
        ['2023', '1,900,000'],
      ],
    },
    prompt: QUANT,
    choices: [
      'The estimated population grew from about 110,000 in 2015 to about 1,900,000 in 2023.',
      'In 2019, the estimated population was about 334,000.',
      'The estimated population was lower in 2023 than in 2015.',
      'The estimated population changed very little between 2015 and 2019.',
    ],
    ex: {
      en: 'A "dramatic recovery" is shown best by the change from the lowest to the highest value. The third and fourth choices are false.',
      ru: '«Резкое восстановление» лучше всего показывает рост от минимального значения к максимальному. Третий и четвёртый варианты неверны.',
      kk: '«Күрт қалпына келуді» ең жақсы көрсететін — ең аз мәннен ең көп мәнге дейінгі өсу. Үшінші және төртінші нұсқалар қате.',
    },
  },
  {
    id: 'q04',
    skill: 'quant',
    d: 3,
    passage:
      'A student hypothesized that plants grow poorly under green light because leaves reflect most green light instead of absorbing it. ______',
    table: {
      caption: 'Average plant height after four weeks',
      headers: ['Light color', 'Average height (cm)'],
      rows: [
        ['Red', 18],
        ['Blue', 14],
        ['Green', 6],
        ['White', 16],
      ],
    },
    prompt: 'Which choice most effectively uses data from the table to support the student’s hypothesis?',
    choices: [
      'Plants grown under green light reached an average height of only 6 cm, the lowest of the four light colors.',
      'Plants grown under red light reached an average height of 18 cm.',
      'Plants grown under white light grew taller than plants grown under blue light.',
      'Plants grown under blue light reached an average height of 14 cm.',
    ],
    ex: {
      en: 'The hypothesis is about green light, so the support must show that green-light plants grew worst. Only the first choice does.',
      ru: 'Гипотеза о зелёном свете, значит, нужно показать, что под ним растения выросли хуже всех. Это делает только первый вариант.',
      kk: 'Гипотеза жасыл жарық туралы, демек оның астындағы өсімдіктердің ең нашар өскенін көрсету керек. Мұны тек бірінші нұсқа жасайды.',
    },
  },
  {
    id: 'q05',
    skill: 'quant',
    d: 3,
    passage:
      'A report claims that the share of electricity from renewable sources in Country X grew faster between 2020 and 2025 than between 2010 and 2015. ______',
    table: {
      caption: 'Share of electricity from renewable sources, Country X (illustrative)',
      headers: ['Year', 'Share (%)'],
      rows: [
        ['2010', 8],
        ['2015', 12],
        ['2020', 21],
        ['2025', 34],
      ],
    },
    prompt: 'Which choice most effectively uses data from the table to support the report’s claim?',
    choices: [
      'The share rose by 4 percentage points from 2010 to 2015 but by 13 percentage points from 2020 to 2025.',
      'The share was 21 percent in 2020.',
      'The share increased in every five-year period shown.',
      'The share reached 34 percent in 2025.',
    ],
    ex: {
      en: 'The claim compares the speed of growth in two periods, so we need both changes: 12 − 8 = 4 and 34 − 21 = 13.',
      ru: 'Утверждение сравнивает скорость роста в двух периодах, поэтому нужны оба изменения: 12 − 8 = 4 и 34 − 21 = 13.',
      kk: 'Тұжырым екі кезеңдегі өсу жылдамдығын салыстырады, сондықтан екі өзгеріс те керек: 12 − 8 = 4 және 34 − 21 = 13.',
    },
  },
  {
    id: 'q06',
    skill: 'quant',
    d: 2,
    passage:
      'In a survey of 200 students, a student claims that practice tests were more popular than rereading notes and flashcards combined. ______',
    table: {
      caption: 'Preferred study method (percent of students)',
      headers: ['Method', 'Percent'],
      rows: [
        ['Practice tests', 48],
        ['Rereading notes', 27],
        ['Flashcards', 17],
        ['Group study', 8],
      ],
    },
    prompt: 'Which choice most effectively uses data from the table to support the student’s claim?',
    choices: [
      '48% of students preferred practice tests, compared with a combined 44% for rereading notes and flashcards.',
      '27% of students preferred rereading notes.',
      'Group study was the least popular method, at 8%.',
      'More students preferred flashcards than group study.',
    ],
    ex: {
      en: 'The claim compares practice tests with two methods COMBINED: 27 + 17 = 44, and 48 > 44.',
      ru: 'Сравнение — с двумя методами ВМЕСТЕ: 27 + 17 = 44, и 48 > 44.',
      kk: 'Салыстыру екі әдістің ЖИЫНТЫҒЫМЕН: 27 + 17 = 44, ал 48 > 44.',
    },
  },
  {
    id: 'i01',
    skill: 'inference',
    d: 1,
    passage:
      'Desert plants called succulents store water in their thick leaves and stems. This allows them to survive long periods without rain. Therefore, succulents are likely to ______',
    prompt: INFER,
    choices: [
      'grow well in regions with long dry seasons.',
      'need to be watered every day.',
      'die quickly when there is no rain.',
      'grow only near rivers and lakes.',
    ],
    ex: {
      en: 'If they survive long periods without rain, they can do well where dry seasons are long. The other choices contradict the text.',
      ru: 'Если они долго обходятся без дождя, то хорошо растут там, где долгая засуха. Остальные варианты противоречат тексту.',
      kk: 'Егер олар жаңбырсыз ұзақ өмір сүре алса, құрғақ маусымы ұзақ жерлерде жақсы өседі. Қалған нұсқалар мәтінге қайшы.',
    },
  },
  {
    id: 'i02',
    skill: 'inference',
    d: 2,
    passage:
      'In a study, two groups of students learned the same vocabulary list. One group studied for an hour in a single session; the other studied in four 15-minute sessions spread over a week. A month later, the second group remembered significantly more words. These results suggest that ______',
    prompt: INFER,
    choices: [
      'spreading study time over several sessions can improve long-term memory.',
      'studying for an hour is never useful.',
      'the first group did not study the vocabulary list.',
      'vocabulary is easier to learn than other subjects.',
    ],
    ex: {
      en: 'Both groups studied 60 minutes total; only the schedule differed. So the spaced schedule likely explains the better memory. "Never useful" is too extreme.',
      ru: 'Обе группы занимались по 60 минут, отличалось только расписание. Значит, лучшую память объясняет распределение занятий. «Never useful» — слишком категорично.',
      kk: 'Екі топ та барлығы 60 минут оқыды, тек кесте өзгеше болды. Демек жақсы есте сақтауды сабақтың бөлінуі түсіндіреді. «Never useful» — тым кесімді.',
    },
  },
  {
    id: 'i03',
    skill: 'inference',
    d: 2,
    passage:
      'Archaeologists found tools made from obsidian, a volcanic glass, at a site hundreds of kilometers from the nearest volcano. Because obsidian does not form naturally in that area, the archaeologists concluded that ______',
    prompt: INFER,
    choices: [
      'the obsidian was likely brought to the site through travel or trade.',
      'a volcano once existed directly beneath the site.',
      'the people at the site did not use any tools.',
      'obsidian is the most common stone in the region.',
    ],
    ex: {
      en: 'If obsidian cannot form there but was found there, people must have carried it in — by travel or trade.',
      ru: 'Если обсидиан там не образуется, но его нашли, значит, его принесли — путешествуя или торгуя.',
      kk: 'Егер обсидиан ол жерде түзілмесе, бірақ табылса, оны адамдар әкелген — саяхат не сауда арқылы.',
    },
  },
  {
    id: 'i04',
    skill: 'inference',
    d: 3,
    passage:
      'Astronomers observed that a distant star dims slightly every 37 days for about 6 hours. The dimming is always the same amount and happens on a perfectly regular schedule. Because such a pattern is typical when a planet passes between a star and Earth, the astronomers concluded that ______',
    prompt: INFER,
    choices: [
      'a planet likely orbits the star once every 37 days.',
      'the star will stop shining within 37 days.',
      'the star is closer to Earth than any other star.',
      'the dimming is caused by clouds in Earth’s atmosphere.',
    ],
    ex: {
      en: 'A regular dip every 37 days, caused by a passing planet, means the planet completes an orbit every 37 days.',
      ru: 'Регулярное затемнение раз в 37 дней из-за проходящей планеты означает, что планета делает оборот за 37 дней.',
      kk: 'Өтіп бара жатқан планета тудыратын 37 күн сайынғы тұрақты күңгірттену планетаның 37 күнде бір айналым жасайтынын білдіреді.',
    },
  },
  {
    id: 'i05',
    skill: 'inference',
    d: 3,
    passage:
      'Bees are attracted to flowers that reflect ultraviolet light, which humans cannot see. In one experiment, researchers covered some sunflowers with a coating that blocked ultraviolet reflection but did not change their visible color. If ultraviolet patterns help guide bees to flowers, the researchers would expect that ______',
    prompt: INFER,
    choices: [
      'bees would visit the coated sunflowers less often than the uncoated ones.',
      'humans would notice that the coated sunflowers looked different.',
      'bees would visit the coated and uncoated sunflowers equally often.',
      'the coating would change the visible color of the sunflowers.',
    ],
    ex: {
      en: 'If UV guides bees and the coating removes UV, bees should visit coated flowers less. The coating does not change visible color, so humans see no difference.',
      ru: 'Если УФ направляет пчёл, а покрытие его убирает, пчёлы должны реже посещать покрытые цветы. Видимый цвет не меняется, поэтому люди разницы не заметят.',
      kk: 'Егер ультракүлгін сәуле араларды бағыттаса, ал жабын оны жойса, аралар жабылған гүлдерге сирек қонуы керек. Көрінетін түс өзгермейді, сондықтан адамдар айырмашылықты көрмейді.',
    },
  },
  {
    id: 'i06',
    skill: 'inference',
    d: 2,
    passage:
      'A town’s records list dozens of glassmakers in 1650 but none in 1700. During the same period, the records show a sharp rise in the price of the wood used to fuel glass furnaces. This suggests that ______',
    prompt: INFER,
    choices: [
      'rising fuel costs may have contributed to the decline of glassmaking in the town.',
      'glassmakers in 1700 used a different fuel than in 1650.',
      'the town stopped keeping records in 1700.',
      'glass became more popular in the town after 1650.',
    ],
    ex: {
      en: 'Fuel became expensive at the same time glassmaking disappeared, so fuel costs may be part of the reason. "May have contributed" is appropriately cautious.',
      ru: 'Топливо подорожало как раз тогда, когда стеклоделие исчезло, — значит, цены на топливо могли быть одной из причин. «May have contributed» — осторожная и уместная формулировка.',
      kk: 'Отын шыны жасау жоғалған кезде қымбаттады — демек отын бағасы себептердің бірі болуы мүмкін. «May have contributed» — сақ әрі орынды тұжырым.',
    },
  },
  {
    id: 'i07',
    skill: 'inference',
    d: 3,
    passage:
      'In many unrelated languages, the word for “mother” begins with an “m” sound, as in mama. Linguists point out that “m” is one of the easiest sounds for babies to make, since it only requires closing the lips. This observation suggests that the similarity among these words ______',
    prompt: INFER,
    choices: [
      'may reflect how babies first produce sounds rather than a shared origin of the languages.',
      'proves that all languages descend from a single ancient language.',
      'shows that babies cannot make any sounds other than “m.”',
      'means that every language borrowed the word from the same neighbor.',
    ],
    ex: {
      en: 'The languages are unrelated, and "m" is easy for babies — so the similarity probably comes from babies’ first sounds, not a common ancestor.',
      ru: 'Языки не родственны, а звук «м» легко даётся младенцам, — значит, сходство, скорее всего, объясняется первыми звуками детей, а не общим предком.',
      kk: 'Тілдер туыс емес, ал «м» дыбысын нәрестелер оңай айтады — демек ұқсастық ортақ тегінен емес, нәрестенің алғашқы дыбыстарынан болуы ықтимал.',
    },
  },
  {
    id: 'i08',
    skill: 'inference',
    d: 1,
    passage:
      'Penguins cannot fly, but their wings work like flippers, allowing them to swim quickly underwater. Penguins hunt fish and squid in the ocean. This suggests that penguins’ wings are mainly useful for ______',
    prompt: INFER,
    choices: ['catching food in the water.', 'flying long distances.', 'keeping warm on land.', 'building nests.'],
    ex: {
      en: 'Wings help them swim fast, and they hunt in the ocean — so the wings mainly help them catch food in water.',
      ru: 'Крылья помогают быстро плавать, а охотятся пингвины в океане, — значит, крылья нужны в основном для ловли добычи в воде.',
      kk: 'Қанаттар жылдам жүзуге көмектеседі, ал пингвиндер мұхитта аң аулайды — демек қанаттар негізінен суда қорек аулауға керек.',
    },
  },
];
