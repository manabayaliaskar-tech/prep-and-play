// Чтение для IELTS и TOEFL: авторские тексты и вопросы к ним.
// IELTS: утверждения True / False / Not Given и вопросы с выбором ответа.
// TOEFL: вопросы с четырьмя вариантами (факты, слово в контексте, вывод).
// Вопросы к одному тексту идут подряд.

import { pick, shuffle } from '../core/random.js';
import { L, poolQ } from './gen.js';

const TFNG = ['True', 'False', 'Not Given'];
const tf = (statement, answer, ex) => ({ type: 'tfng', statement, answer, ex });
/** Первый вариант — правильный, при показе варианты перемешиваются. */
const mc = (question, choices, ex) => ({ type: 'mc', question, choices, ex });

export const READING = {
  ielts: [
    {
      id: 'aral',
      title: 'The Sea That Shrank',
      text:
        'The Aral Sea, on the border of Kazakhstan and Uzbekistan, was once the fourth-largest lake in the world. It was fed by two rivers, the Amu Darya and the Syr Darya. From the 1960s, however, most of their water was redirected to irrigate cotton fields, and the lake began to shrink. Within a few decades it had lost most of its volume and split into separate parts. Fishing towns were left many kilometres from the shore, and the exposed seabed became a source of salty dust that damaged crops and human health. In 2005 Kazakhstan completed the Kokaral Dam, which keeps water from the Syr Darya in the smaller northern part of the lake. The water level there rose, the water became less salty, and commercial fishing returned. The larger southern part, however, has continued to dry up.',
      qs: [
        tf('The Aral Sea used to be one of the largest lakes in the world.', 0, L(
          'True: the text says it "was once the fourth-largest lake in the world".',
          'True: в тексте сказано, что это было «четвёртое по величине озеро в мире».',
          'True: мәтінде ол «әлемдегі төртінші үлкен көл болған» делінген.',
        )),
        tf('The water of the two rivers was mainly used to grow rice.', 1, L(
          'False: the water was redirected "to irrigate cotton fields", not rice.',
          'False: воду отвели «для орошения хлопковых полей», а не риса.',
          'False: су күрішке емес, «мақта алқаптарын суаруға» бұрылған.',
        )),
        tf('The Kokaral Dam was paid for by an international bank.', 2, L(
          'Not Given: the text says when the dam was completed and what it does, but not who paid for it.',
          'Not Given: в тексте сказано, когда достроили плотину и что она делает, но не сказано, кто её оплатил.',
          'Not Given: мәтінде бөгеттің қашан салынғаны мен не істейтіні айтылған, бірақ оны кім қаржыландырғаны айтылмаған.',
        )),
        mc('What happened to the exposed seabed?', [
          'It produced salty dust that harmed crops and people.',
          'It was turned into cotton fields.',
          'It was covered with new fishing towns.',
          'It was flooded again by the Amu Darya.',
        ], L(
          'The text says the exposed seabed "became a source of salty dust that damaged crops and human health".',
          'В тексте сказано, что обнажившееся дно «стало источником солёной пыли, которая вредила посевам и здоровью людей».',
          'Мәтінде ашылған теңіз түбі «егін мен адам денсаулығына зиян келтірген тұзды шаңның көзіне айналды» делінген.',
        )),
        mc('What is the main idea of the last three sentences?', [
          'One part of the lake has partly recovered, while the other has not.',
          'The whole Aral Sea has returned to its original size.',
          'Fishing is now banned in the northern part of the lake.',
          'The dam made the water in the north saltier.',
        ], L(
          'The northern part recovered after the dam (level rose, fishing returned), but the southern part "has continued to dry up".',
          'Северная часть после постройки плотины восстановилась (уровень вырос, рыболовство вернулось), а южная «продолжает высыхать».',
          'Солтүстік бөлігі бөгеттен кейін қалпына келді (деңгей көтерілді, балық аулау қайта басталды), ал оңтүстік бөлігі «әлі де кеуіп барады».',
        )),
      ],
    },
    {
      id: 'bicycle',
      title: 'A Short History of the Bicycle',
      text:
        'The first ancestor of the bicycle appeared in 1817, when the German inventor Karl Drais built a wooden machine with two wheels and no pedals. The rider sat on it and pushed against the ground with his feet. Pedals attached to the front wheel were added in the 1860s; these heavy machines shook so badly on stone roads that people called them "boneshakers". In the 1870s came the high-wheeler, with an enormous front wheel that made it fast but dangerous: a fall from that height could cause serious injury. The breakthrough was the "safety bicycle" of 1885, designed by John Kemp Starley. It had two wheels of equal size and a chain that drove the rear wheel. Three years later John Dunlop introduced the air-filled tyre, which made riding far more comfortable. Since then the basic shape of the bicycle has hardly changed.',
      qs: [
        tf('The machine built by Karl Drais had no pedals.', 0, L(
          'True: the text describes "a wooden machine with two wheels and no pedals".',
          'True: в тексте описана «деревянная машина с двумя колёсами и без педалей».',
          'True: мәтінде «екі дөңгелекті, педальсыз ағаш машина» сипатталған.',
        )),
        tf('The high-wheeler was slower than earlier machines.', 1, L(
          'False: the enormous front wheel "made it fast but dangerous".',
          'False: огромное переднее колесо делало его «быстрым, но опасным».',
          'False: алдыңғы үлкен дөңгелек оны «жылдам, бірақ қауіпті» еткен.',
        )),
        tf('Starley\'s safety bicycle was cheaper than the high-wheeler.', 2, L(
          'Not Given: the text describes the design of the safety bicycle but says nothing about its price.',
          'Not Given: в тексте описана конструкция «безопасного велосипеда», но о его цене ничего не сказано.',
          'Not Given: мәтінде «қауіпсіз велосипедтің» құрылымы сипатталған, бірақ бағасы туралы ештеңе айтылмаған.',
        )),
        mc('In which year was the air-filled tyre introduced?', ['1888', '1885', '1870', '1817'], L(
          'The safety bicycle appeared in 1885, and the tyre came "three years later": 1885 + 3 = 1888.',
          '«Безопасный велосипед» появился в 1885 году, а шина — «три года спустя»: 1885 + 3 = 1888.',
          '«Қауіпсіз велосипед» 1885 жылы пайда болды, ал шина «үш жылдан кейін» шықты: 1885 + 3 = 1888.',
        )),
        mc('Why were early pedal machines called "boneshakers"?', [
          'They vibrated strongly on rough roads.',
          'They were made of animal bones.',
          'Riders often broke bones falling from them.',
          'They were used to carry heavy loads.',
        ], L(
          'The text says they "shook so badly on stone roads" that people gave them this name.',
          'В тексте сказано, что они «так сильно тряслись на каменных дорогах», что получили это прозвище.',
          'Мәтінде олар «тас жолдарда қатты шайқалғандықтан» осылай аталғаны айтылған.',
        )),
      ],
    },
    {
      id: 'sleep',
      title: 'Why Students Need Sleep',
      text:
        'Many students believe that the best way to prepare for an exam is to study late into the night. Research on memory suggests the opposite. While we sleep, the brain does not simply rest: it replays what was learned during the day and moves it into long-term storage. In several experiments, people who slept after learning a list of words remembered more of them than people who stayed awake for the same number of hours. Sleep also seems to help with understanding, not just with remembering. Volunteers who were taught a mathematical task were more likely to discover a hidden shortcut after a night of sleep. Short daytime naps can bring some of the same benefits, although they do not replace a full night. For these reasons, researchers advise students to spread their revision over several days and to protect their sleep before an exam.',
      qs: [
        tf('According to the text, the brain is inactive during sleep.', 1, L(
          'False: the text says the brain "does not simply rest" — it replays what was learned.',
          'False: в тексте сказано, что мозг «не просто отдыхает», а заново проигрывает выученное.',
          'False: мәтінде ми «жай ғана демалмайды», үйренгенін қайталайды делінген.',
        )),
        tf('People who slept after learning words remembered more than those who stayed awake.', 0, L(
          'True: this is exactly the result of the experiments described in the text.',
          'True: именно такой результат экспериментов описан в тексте.',
          'True: мәтінде тәжірибелердің дәл осындай нәтижесі сипатталған.',
        )),
        tf('The experiments were carried out only with university students.', 2, L(
          'Not Given: the text speaks of "people" and "volunteers" and does not say who they were.',
          'Not Given: в тексте говорится о «людях» и «добровольцах», но не уточняется, кто они.',
          'Not Given: мәтінде «адамдар» мен «еріктілер» туралы айтылады, бірақ олардың кім екені нақтыланбаған.',
        )),
        mc('What does the text say about daytime naps?', [
          'They are useful but cannot replace a full night of sleep.',
          'They are more effective than sleeping at night.',
          'They make it harder to fall asleep in the evening.',
          'They help only with mathematical tasks.',
        ], L(
          'Naps "can bring some of the same benefits, although they do not replace a full night".',
          'Дневной сон «может дать часть тех же преимуществ, хотя и не заменяет полноценную ночь».',
          'Күндізгі ұйқы «сол пайданың бір бөлігін бере алады, бірақ толық түнгі ұйқыны алмастырмайды».',
        )),
        mc('What advice do researchers give to students?', [
          'To revise over several days and sleep well before the exam.',
          'To study through the night before the exam.',
          'To learn lists of words instead of solving tasks.',
          'To take a nap during the exam break.',
        ], L(
          'The last sentence: "spread their revision over several days and … protect their sleep before an exam".',
          'Последнее предложение: «распределять повторение на несколько дней и беречь сон перед экзаменом».',
          'Соңғы сөйлем: «қайталауды бірнеше күнге бөліп, емтихан алдында ұйқыны сақтау».',
        )),
      ],
    },
    {
      id: 'trees',
      title: 'Cooling the City',
      text:
        'Cities are usually warmer than the countryside around them. Dark surfaces such as asphalt and roofs absorb sunlight during the day and release the heat slowly at night, while cars, factories and air conditioners add heat of their own. This effect is known as the urban heat island. One of the simplest ways to reduce it is to plant trees. A tree cools its surroundings in two ways: its leaves give shade, and they also release water vapour, which takes heat out of the air. Streets lined with trees can be several degrees cooler than streets without them. Trees bring other benefits too: they filter dust, reduce noise and make streets more pleasant to walk in. However, they need space, water and care, and a young tree may take many years to give useful shade. For this reason, city planners often combine tree planting with light-coloured roofs and green roofs.',
      qs: [
        tf('Asphalt releases the heat it has absorbed quickly, as soon as the sun sets.', 1, L(
          'False: dark surfaces "release the heat slowly at night".',
          'False: тёмные поверхности «медленно отдают тепло ночью».',
          'False: қара беттер жылуды «түнде баяу шығарады».',
        )),
        tf('Trees cool the air both by shading and by releasing water vapour.', 0, L(
          'True: the text names exactly these two ways.',
          'True: в тексте названы именно эти два способа.',
          'True: мәтінде дәл осы екі тәсіл аталған.',
        )),
        tf('Planting trees is the cheapest way of cooling a city.', 2, L(
          'Not Given: tree planting is called "one of the simplest ways", but costs are not compared.',
          'Not Given: посадка деревьев названа «одним из самых простых способов», но стоимость не сравнивается.',
          'Not Given: ағаш отырғызу «ең қарапайым тәсілдердің бірі» делінген, бірақ құны салыстырылмаған.',
        )),
        mc('Which problem with trees does the text mention?', [
          'A young tree needs many years before it gives useful shade.',
          'Trees increase the amount of dust in the air.',
          'Trees make streets noisier.',
          'Trees damage light-coloured roofs.',
        ], L(
          'The text says "a young tree may take many years to give useful shade".',
          'В тексте сказано: «молодому дереву может понадобиться много лет, чтобы дать полезную тень».',
          'Мәтінде «жас ағаш пайдалы көлеңке бергенше көп жыл өтуі мүмкін» делінген.',
        )),
        mc('What is the "urban heat island"?', [
          'The effect of a city being warmer than the area around it.',
          'A park in the centre of a hot city.',
          'A roof covered with plants.',
          'A district with many factories.',
        ], L(
          'The term is introduced right after the explanation of why cities are warmer than the countryside.',
          'Термин вводится сразу после объяснения, почему в городах теплее, чем за городом.',
          'Бұл термин қалалардың ауылдық жерден неге жылы болатыны түсіндірілгеннен кейін бірден енгізіледі.',
        )),
      ],
    },
  ],
  toefl: [
    {
      id: 'bees',
      title: 'The Language of Bees',
      text:
        'When a honeybee finds a rich source of nectar, it returns to the hive and performs a curious movement that scientists call the waggle dance. The bee runs in a straight line while shaking its body, then circles back and repeats the run. For a long time nobody knew what this behaviour meant. In the middle of the twentieth century the Austrian scientist Karl von Frisch showed that the dance is a message. The angle of the straight run in relation to the vertical tells the other bees the direction of the food in relation to the sun. The length of the run indicates the distance: the longer the bee waggles, the farther away the flowers are. Other bees follow the dancer closely and then fly out to the right place. Von Frisch\'s discovery, for which he shared a Nobel Prize in 1973, proved that insects can communicate surprisingly precise information.',
      qs: [
        mc('According to the passage, what does the length of the straight run show?', [
          'How far away the food is',
          'How much nectar the flowers contain',
          'How many bees should fly out',
          'What kind of flowers were found',
        ], L(
          '"The length of the run indicates the distance: the longer the bee waggles, the farther away the flowers are."',
          '«Длина пробежки указывает на расстояние: чем дольше пчела виляет, тем дальше цветы».',
          '«Жүгіру ұзақтығы қашықтықты көрсетеді: ара неғұрлым ұзақ билесе, гүлдер соғұрлым алыс».',
        )),
        mc('The word "curious" in the first sentence is closest in meaning to', ['strange', 'dangerous', 'quick', 'silent'], L(
          'Here "curious" means unusual, strange — the movement puzzled scientists for a long time.',
          'Здесь curious означает «необычный, странный»: это движение долго оставалось загадкой для учёных.',
          'Мұнда curious «ерекше, оғаш» дегенді білдіреді: бұл қимыл ғалымдар үшін ұзақ уақыт жұмбақ болды.',
        )),
        mc('What did Karl von Frisch demonstrate?', [
          'That the dance carries information about where food is',
          'That bees can recognise human faces',
          'That bees dance only when the hive is in danger',
          'That the dance is a way of cooling the hive',
        ], L(
          'He "showed that the dance is a message" about the direction and distance of food.',
          'Он «показал, что танец — это сообщение» о направлении и расстоянии до пищи.',
          'Ол «бидің хабар екенін» — қорек бағыты мен қашықтығы туралы хабар екенін көрсетті.',
        )),
        mc('According to the passage, the direction of the food is given in relation to', ['the sun', 'the hive entrance', 'the wind', 'the nearest tree'], L(
          'The angle of the run "tells the other bees the direction of the food in relation to the sun".',
          'Угол пробежки «сообщает другим пчёлам направление на пищу относительно солнца».',
          'Жүгіру бұрышы «басқа араларға қоректің күнге қатысты бағытын хабарлайды».',
        )),
        mc('What can be inferred about scientists before von Frisch?', [
          'They had noticed the dance but did not understand it.',
          'They had never seen bees dancing.',
          'They believed bees communicated by sound.',
          'They thought the dance was a sign of illness.',
        ], L(
          '"For a long time nobody knew what this behaviour meant" — so the behaviour was known, but not its meaning.',
          '«Долгое время никто не знал, что означает это поведение» — значит, само поведение было известно, а его смысл нет.',
          '«Ұзақ уақыт бойы бұл мінез-құлықтың мәнін ешкім білмеді» — демек, қимылдың өзі белгілі болған, ал мағынасы белгісіз еді.',
        )),
      ],
    },
    {
      id: 'press',
      title: 'The Printing Revolution',
      text:
        'Before the fifteenth century, every book in Europe was copied by hand. A scribe could spend months on a single volume, so books were rare and expensive, and most people never owned one. Around 1450 the German craftsman Johannes Gutenberg developed a printing press that used movable metal type: small reusable letters that could be arranged to form a page, inked, and pressed onto paper again and again. A printer could now produce in a few weeks what a scribe produced in years. The consequences went far beyond the price of books. Ideas travelled faster, because the same text could reach readers in many cities at once. Scholars could compare identical copies and correct mistakes. As books became affordable, more people had a reason to learn to read. Historians often describe the printing press as one of the inventions that shaped the modern world.',
      qs: [
        mc('Why were books rare before the fifteenth century?', [
          'Each one had to be copied by hand.',
          'Paper had not been invented yet.',
          'Reading was forbidden for most people.',
          'Scribes refused to copy long texts.',
        ], L(
          '"Every book in Europe was copied by hand", and one volume could take months.',
          '«Каждую книгу в Европе переписывали от руки», и на один том могли уйти месяцы.',
          '«Еуропадағы әр кітап қолмен көшірілген», бір томға айлар кетуі мүмкін еді.',
        )),
        mc('The word "reusable" in the passage means that the letters', [
          'could be used many times',
          'were very small',
          'were made of wood',
          'had to be thrown away after printing',
        ], L(
          '"Reusable" = able to be used again: the same metal letters were rearranged for each new page.',
          'Reusable — «многоразовый»: одни и те же металлические буквы переставляли для каждой новой страницы.',
          'Reusable — «қайта қолдануға болатын»: бір металл әріптерді әр жаңа бетке қайта теретін.',
        )),
        mc('According to the passage, how did printing help scholars?', [
          'They could work with identical copies of a text.',
          'They no longer needed to learn Latin.',
          'They were paid more for their books.',
          'They could print books without paper.',
        ], L(
          '"Scholars could compare identical copies and correct mistakes."',
          '«Учёные могли сравнивать одинаковые экземпляры и исправлять ошибки».',
          '«Ғалымдар бірдей даналарды салыстырып, қателерді түзете алды».',
        )),
        mc('Which of the following is NOT mentioned as a result of the printing press?', [
          'The appearance of the first newspapers',
          'The faster spread of ideas',
          'Cheaper books',
          'A growing interest in learning to read',
        ], L(
          'The passage mentions faster ideas, affordable books and more readers, but says nothing about newspapers.',
          'В тексте упомянуты быстрое распространение идей, доступные книги и рост числа читателей, а о газетах ничего не сказано.',
          'Мәтінде идеялардың тез таралуы, қолжетімді кітаптар және оқырмандардың көбеюі айтылған, ал газеттер туралы ештеңе жоқ.',
        )),
        mc('What is the main purpose of the passage?', [
          'To explain how one invention changed the spread of knowledge',
          'To describe the life of Johannes Gutenberg',
          'To compare European and Asian printing methods',
          'To argue that handwritten books were more beautiful',
        ], L(
          'The passage moves from the invention to its consequences for ideas, scholarship and literacy.',
          'Текст переходит от самого изобретения к его последствиям для идей, науки и грамотности.',
          'Мәтін өнертабыстың өзінен оның идеяларға, ғылымға және сауаттылыққа тигізген әсеріне көшеді.',
        )),
      ],
    },
    {
      id: 'plates',
      title: 'Moving Continents',
      text:
        'In 1912 the German scientist Alfred Wegener proposed a bold idea: the continents were once joined in a single landmass and have slowly drifted apart. He pointed out that the coastlines of South America and Africa fit together like pieces of a puzzle, and that similar fossils and rock formations are found on both sides of the Atlantic Ocean. Most geologists of his time rejected the theory. Their main objection was that Wegener could not explain what force was strong enough to move continents. The situation changed in the 1960s, when studies of the ocean floor revealed long underwater mountain chains where new rock is constantly formed and pushes the older sea floor aside. This discovery supplied the missing mechanism. Today the theory of plate tectonics, which grew out of Wegener\'s idea, explains earthquakes, volcanoes and the formation of mountain ranges.',
      qs: [
        mc('What evidence did Wegener use to support his idea?', [
          'Matching coastlines and similar fossils on different continents',
          'Measurements of the ocean floor',
          'Photographs taken from space',
          'Records of ancient earthquakes',
        ], L(
          'He pointed to the fit of South America and Africa and to "similar fossils and rock formations" on both sides of the Atlantic.',
          'Он указывал на совпадение берегов Южной Америки и Африки и на «похожие окаменелости и горные породы» по обе стороны Атлантики.',
          'Ол Оңтүстік Америка мен Африка жағалауларының сәйкестігін және Атлант мұхитының екі жағындағы «ұқсас қазбалар мен тау жыныстарын» дәлел етті.',
        )),
        mc('Why did most geologists reject the theory at first?', [
          'Wegener could not say what moved the continents.',
          'The coastlines did not actually match.',
          'Wegener was not a trained scientist.',
          'No fossils had been found in Africa.',
        ], L(
          '"Their main objection was that Wegener could not explain what force was strong enough to move continents."',
          '«Главное возражение: Вегенер не мог объяснить, какая сила способна двигать континенты».',
          '«Басты қарсылық: Вегенер континенттерді қандай күш қозғай алатынын түсіндіре алмады».',
        )),
        mc('The word "bold" in the first sentence is closest in meaning to', ['daring', 'simple', 'mistaken', 'popular'], L(
          '"Bold" here means daring, going against accepted views.',
          'Bold здесь означает «смелый», идущий против общепринятых взглядов.',
          'Bold мұнда «батыл», жалпы қабылданған көзқарасқа қарсы шығатын дегенді білдіреді.',
        )),
        mc('What did studies of the ocean floor in the 1960s show?', [
          'New rock forms along underwater mountain chains and pushes older sea floor aside.',
          'The ocean floor is completely flat.',
          'The Atlantic Ocean is becoming narrower.',
          'Continents float freely on water.',
        ], L(
          'The studies "revealed long underwater mountain chains where new rock is constantly formed and pushes the older sea floor aside".',
          'Исследования «обнаружили длинные подводные горные цепи, где постоянно образуется новая порода и раздвигает старое дно».',
          'Зерттеулер «жаңа жыныс үздіксіз түзіліп, ескі мұхит түбін ығыстыратын ұзын су асты тау тізбектерін» анықтады.',
        )),
        mc('What can be inferred from the passage about scientific theories?', [
          'A correct idea may be rejected until its mechanism is found.',
          'Theories proposed by one person are usually wrong.',
          'Geologists never change their opinions.',
          'Evidence from fossils is more reliable than any other.',
        ], L(
          'Wegener\'s idea was rejected for lack of a mechanism and accepted decades later when the mechanism was found.',
          'Идею Вегенера отвергли из-за отсутствия механизма и приняли спустя десятилетия, когда механизм нашли.',
          'Вегенердің идеясы механизмі болмағандықтан қабылданбай, ондаған жылдан кейін механизм табылғанда мойындалды.',
        )),
      ],
    },
    {
      id: 'silk',
      title: 'The Silk Road',
      text:
        'The Silk Road was not a single road but a network of trade routes that connected China with Central Asia, the Middle East and the Mediterranean for more than a thousand years. Its name, invented by a German geographer in the nineteenth century, comes from Chinese silk, which was highly valued in the West. Yet silk was only one of many goods carried by the caravans: spices, glass, precious stones, paper and horses also changed hands along the way. Few merchants travelled the whole distance. Goods usually passed from one trader to another in cities such as Samarkand, where markets, workshops and inns grew rich on the trade. Even more important than the goods were the things that travelled with them: religions, languages, technologies and scientific knowledge. When safer and cheaper sea routes developed, the overland trade slowly declined, but the cities it created remain.',
      qs: [
        mc('According to the passage, the Silk Road was', [
          'a system of many connected routes',
          'one long paved road',
          'a sea route between China and Europe',
          'a wall built to protect merchants',
        ], L(
          'The first sentence: "not a single road but a network of trade routes".',
          'Первое предложение: «не одна дорога, а сеть торговых путей».',
          'Бірінші сөйлем: «бір жол емес, сауда жолдарының желісі».',
        )),
        mc('What does the passage say about the name "Silk Road"?', [
          'It was created in the nineteenth century.',
          'It was used by ancient Chinese merchants.',
          'It refers to the colour of the desert sand.',
          'It was chosen by the rulers of Samarkand.',
        ], L(
          'The name was "invented by a German geographer in the nineteenth century".',
          'Название «придумал немецкий географ в девятнадцатом веке».',
          'Бұл атауды «он тоғызыншы ғасырда неміс географы ойлап тапқан».',
        )),
        mc('The phrase "changed hands" in the passage means that the goods', [
          'were sold or exchanged',
          'were damaged on the way',
          'were carried by hand',
          'were hidden from robbers',
        ], L(
          '"To change hands" means to pass from one owner to another, that is, to be sold or exchanged.',
          'To change hands — «переходить из рук в руки», то есть продаваться или обмениваться.',
          'To change hands — «қолдан қолға өту», яғни сатылу немесе айырбасталу.',
        )),
        mc('Why did cities such as Samarkand become rich?', [
          'Traders exchanged goods there.',
          'Silk was produced there.',
          'They were located on the sea coast.',
          'Merchants were not allowed to leave them.',
        ], L(
          'Goods "passed from one trader to another" in these cities, and their markets, workshops and inns "grew rich on the trade".',
          'В этих городах товары «переходили от одного торговца к другому», а рынки, мастерские и постоялые дворы «богатели на торговле».',
          'Бұл қалаларда тауарлар «бір саудагерден екіншісіне өткен», ал базарлар, шеберханалар мен керуен сарайлар «саудадан байыған».',
        )),
        mc('What does the author consider the most important result of the Silk Road?', [
          'The exchange of ideas and knowledge',
          'The high price of silk in the West',
          'The development of sea routes',
          'The breeding of horses',
        ], L(
          '"Even more important than the goods were the things that travelled with them: religions, languages, technologies and scientific knowledge."',
          '«Ещё важнее товаров было то, что путешествовало вместе с ними: религии, языки, технологии и научные знания».',
          '«Тауарлардан да маңыздысы — олармен бірге тараған нәрселер: діндер, тілдер, технологиялар және ғылыми білім».',
        )),
      ],
    },
  ],
};

const TFNG_PROMPT = (statement) =>
  L(
    `True, False or Not Given? — ${statement}`,
    `Верно (True), неверно (False) или в тексте об этом не сказано (Not Given)? — ${statement}`,
    `Дұрыс (True), бұрыс (False) немесе мәтінде айтылмаған (Not Given)? — ${statement}`,
  );

function build(topic, prefix, passage, index, round, rng) {
  const item = passage.qs[index];
  let choices;
  if (item.type === 'tfng') {
    choices = { choices: [...TFNG], answer: item.answer };
  } else {
    const order = shuffle([0, 1, 2, 3], rng);
    choices = { choices: order.map((i) => item.choices[i]), answer: order.indexOf(0) };
  }
  const q = poolQ(topic, 2, {
    kind: 'text',
    passage: passage.text,
    prompt: item.type === 'tfng' ? TFNG_PROMPT(item.statement) : typeof item.question === 'string' ? L(item.question, item.question, item.question) : item.question,
    ex: item.ex,
    mc: choices,
  });
  q.passageLabel = passage.title;
  q.id = `${prefix}:${passage.id}:${index}${round ? `#${round}` : ''}`;
  return q;
}

/**
 * Генератор чтения: выдаёт вопросы одного текста подряд, затем берёт следующий текст.
 * source — ключ экзамена из READING ('ielts', 'toefl') или свой список текстов на трёх языках.
 */
export function readingMaker(topic, source) {
  const passages = typeof source === 'string' ? READING[source] : source;
  const prefix = typeof source === 'string' ? source : topic;
  return (ctx) => {
    const store = (ctx.state ??= {});
    const state = (store[topic] ??= { queue: [], done: [], round: 0 });
    if (!state.queue.length) {
      let fresh = passages.filter((p) => !state.done.includes(p.id));
      if (!fresh.length) {
        state.done = [];
        state.round += 1;
        fresh = passages;
      }
      const passage = pick(ctx.rng, fresh);
      state.done.push(passage.id);
      state.queue = passage.qs.map((_, i) => ({ passage, index: i }));
    }
    const { passage, index } = state.queue.shift();
    return build(topic, prefix, passage, index, state.round, ctx.rng);
  };
}

export const READING_COUNT = Object.values(READING).reduce((sum, list) => sum + list.reduce((s, p) => s + p.qs.length, 0), 0);
