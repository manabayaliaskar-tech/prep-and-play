// Craft and Structure: Words in Context, Text Structure and Purpose, Cross-Text Connections.
// Все тексты авторские. Первый вариант — правильный.

import { PURPOSE, STRUCT, WORD, cross } from './prompts.js';

const w = (id, d, passage, choices, ex) => ({ id, skill: 'words', d, passage, prompt: WORD, choices, ex });

export const CRAFT = [
  w(
    'w01',
    1,
    'Despite the heavy rain, the marathon went ahead as planned, and nearly all of the runners managed to ______ the race.',
    ['complete', 'abandon', 'postpone', 'imitate'],
    {
      en: '"Despite the heavy rain... managed to" signals success, so the runners finished: "complete."',
      ru: '«Despite the heavy rain... managed to» говорит об успехе: бегуны смогли закончить — «complete».',
      kk: '«Despite the heavy rain... managed to» сәттілікті білдіреді: жүгірушілер жарысты аяқтады — «complete».',
    },
  ),
  w(
    'w02',
    1,
    'The new library is popular with students because it is so ______: it stays open every day until midnight and is located right next to the bus station.',
    ['accessible', 'ancient', 'expensive', 'silent'],
    {
      en: 'Long hours and a convenient location make the library easy to reach and use: "accessible."',
      ru: 'Долгие часы работы и удобное расположение делают библиотеку доступной: «accessible».',
      kk: 'Ұзақ жұмыс уақыты мен ыңғайлы орналасуы кітапхананы қолжетімді етеді: «accessible».',
    },
  ),
  w(
    'w03',
    2,
    'The scientist’s explanation was so ______ that even students with no background in chemistry could follow it easily.',
    ['lucid', 'obscure', 'lengthy', 'tentative'],
    {
      en: 'If beginners could follow it easily, the explanation was very clear: "lucid." "Obscure" means the opposite.',
      ru: 'Если даже новички легко поняли, объяснение было очень ясным — «lucid». «Obscure» значит противоположное.',
      kk: 'Жаңадан бастағандар да оңай түсінсе, түсіндірме өте анық болған — «lucid». «Obscure» — керісінше мағына.',
    },
  ),
  w(
    'w04',
    2,
    'Although the two beetle species look nearly identical, genetic tests revealed that they are only ______ related, having split from a common ancestor more than five million years ago.',
    ['distantly', 'closely', 'directly', 'recently'],
    {
      en: '"Although they look identical" sets up a contrast, and splitting five million years ago means the relation is weak: "distantly."',
      ru: '«Although they look identical» задаёт контраст, а разделение пять миллионов лет назад означает дальнее родство — «distantly».',
      kk: '«Although they look identical» қарсылықты білдіреді, ал бес миллион жыл бұрын бөлінуі алыс туыстықты көрсетеді — «distantly».',
    },
  ),
  w(
    'w05',
    2,
    'The committee did not reject the proposal outright; instead, it ______ its decision until more data could be collected.',
    ['deferred', 'announced', 'celebrated', 'reversed'],
    {
      en: '"Until more data could be collected" means the decision was put off for later: "deferred."',
      ru: '«Until more data could be collected» — решение отложили на потом: «deferred».',
      kk: '«Until more data could be collected» — шешім кейінге қалдырылды: «deferred».',
    },
  ),
  w(
    'w06',
    3,
    'Critics praised the documentary for its ______ approach: rather than telling viewers what to think, it presented evidence from all sides and let them decide for themselves.',
    ['evenhanded', 'sensational', 'dismissive', 'nostalgic'],
    {
      en: 'Presenting all sides fairly without pushing an opinion is "evenhanded" (balanced, fair).',
      ru: 'Показывать все стороны и не навязывать мнение — значит быть беспристрастным: «evenhanded».',
      kk: 'Барлық тарапты көрсетіп, пікір таңбау — әділ, бейтарап болу: «evenhanded».',
    },
  ),
  w(
    'w07',
    3,
    'Early reports of the discovery were ______; only after independent teams repeated the experiment did scientists accept the results as reliable.',
    ['provisional', 'definitive', 'fraudulent', 'irrelevant'],
    {
      en: 'The results were accepted only later, so the early reports were temporary and not yet confirmed: "provisional." Nothing suggests they were fake ("fraudulent").',
      ru: 'Результаты приняли только позже, значит, ранние сообщения были предварительными: «provisional». Ничто не говорит о подделке («fraudulent»).',
      kk: 'Нәтижелер кейін ғана қабылданды, демек алғашқы хабарлар алдын ала болған: «provisional». Жалғандық («fraudulent») туралы ештеңе айтылмаған.',
    },
  ),
  w(
    'w08',
    1,
    'Camels are well ______ to desert life: they can drink up to 100 liters of water at once and lose a quarter of their body weight without harm.',
    ['adapted', 'opposed', 'confused', 'limited'],
    {
      en: 'The examples show features that help camels survive in the desert: they are "adapted" to it.',
      ru: 'Примеры показывают черты, помогающие верблюдам выживать в пустыне: они «adapted» (приспособлены).',
      kk: 'Мысалдар түйенің шөлде өмір сүруге көмектесетін ерекшеліктерін көрсетеді: олар «adapted» (бейімделген).',
    },
  ),
  w(
    'w09',
    2,
    'The artist’s early paintings were full of bright, bold colors, but her later work became increasingly ______, using only soft shades of gray and brown.',
    ['subdued', 'vivid', 'chaotic', 'popular'],
    {
      en: '"But" contrasts bright colors with soft grays and browns, so the later work was muted: "subdued."',
      ru: '«But» противопоставляет яркие цвета мягким серым и коричневым — поздние работы стали приглушёнными: «subdued».',
      kk: '«But» жарқын түстерді жұмсақ сұр мен қоңырға қарсы қояды — кейінгі жұмыстар күңгірт болды: «subdued».',
    },
  ),
  w(
    'w10',
    3,
    'Historians have long debated the treaty’s significance. While some argue that it transformed regional politics, others contend that its effects were largely ______, changing little in practice.',
    ['nominal', 'profound', 'immediate', 'violent'],
    {
      en: '"Changing little in practice" means the effects existed in name only: "nominal." "Profound" would agree with the first group, not contrast with it.',
      ru: '«Changing little in practice» — влияние было лишь формальным: «nominal». «Profound» совпадало бы с мнением первой группы, а здесь контраст.',
      kk: '«Changing little in practice» — әсері тек атымен ғана болған: «nominal». «Profound» бірінші топтың пікірімен сәйкес келер еді, ал мұнда қарсылық бар.',
    },
  ),
  w(
    'w11',
    2,
    'Mathematician Maryam Mirzakhani was known for her ______: she would spend years on a single problem, refusing to give up even when progress was slow.',
    ['persistence', 'impatience', 'modesty', 'carelessness'],
    {
      en: 'Working for years and refusing to give up describes "persistence."',
      ru: 'Годами работать и не сдаваться — это настойчивость: «persistence».',
      kk: 'Жылдар бойы жұмыс істеп, берілмеу — табандылық: «persistence».',
    },
  ),
  w(
    'w12',
    3,
    'The novel’s narrator is deliberately ______: as the story unfolds, readers gradually realize that his account of events cannot be fully trusted.',
    ['unreliable', 'omniscient', 'sympathetic', 'anonymous'],
    {
      en: 'A narrator whose account "cannot be fully trusted" is "unreliable."',
      ru: 'Рассказчик, которому «нельзя полностью доверять», — ненадёжный: «unreliable».',
      kk: 'Айтқанына «толық сенуге болмайтын» баяндаушы — сенімсіз: «unreliable».',
    },
  ),
  w(
    'w13',
    1,
    'The steppe eagle can spot small animals from great heights thanks to its ______ eyesight.',
    ['keen', 'weak', 'blurry', 'ordinary'],
    {
      en: 'Seeing small animals from great heights requires sharp eyesight: "keen."',
      ru: 'Чтобы видеть мелких зверей с большой высоты, нужно острое зрение: «keen».',
      kk: 'Биіктен ұсақ жануарларды көру үшін өткір көз керек: «keen».',
    },
  ),
  w(
    'w14',
    3,
    'Rather than ______ the earlier theory entirely, the new model refines it, keeping its core assumptions while correcting several of its predictions.',
    ['discarding', 'endorsing', 'restating', 'inventing'],
    {
      en: '"Rather than... entirely" contrasts with keeping and refining the theory, so the missing word means throwing it away: "discarding."',
      ru: '«Rather than... entirely» противопоставлено сохранению и уточнению теории — значит, пропущено «отбросить»: «discarding».',
      kk: '«Rather than... entirely» теорияны сақтап, нақтылауға қарсы қойылған — демек «лақтырып тастау»: «discarding».',
    },
  ),
  {
    id: 'p01',
    skill: 'structure',
    d: 1,
    passage:
      'Every autumn, millions of monarch butterflies travel up to 4,800 kilometers from Canada and the United States to forests in central Mexico. No single butterfly makes the round trip: the journey north in spring takes several generations. Scientists are still investigating how butterflies that have never made the trip find the same forests their great-grandparents left.',
    prompt: PURPOSE,
    choices: [
      'To describe the monarch butterfly migration and note a question scientists are still trying to answer',
      'To argue that monarch butterflies should be protected by international law',
      'To compare monarch butterflies with other migrating insects',
      'To explain why butterflies prefer forests in Mexico to forests in Canada',
    ],
    ex: {
      en: 'The text describes the migration and ends with an open question. It does not argue for laws, compare insects, or explain a preference.',
      ru: 'Текст описывает миграцию и заканчивается нерешённым вопросом. В нём нет призыва к законам, сравнения насекомых или объяснения предпочтений.',
      kk: 'Мәтін қоныс аударуды сипаттап, ашық сұрақпен аяқталады. Онда заң туралы талап, жәндіктерді салыстыру не таңдауды түсіндіру жоқ.',
    },
  },
  {
    id: 'p02',
    skill: 'structure',
    d: 2,
    passage:
      'For decades, scientists assumed that plants cannot respond to sound. However, a 2019 study found that evening primrose flowers produce sweeter nectar within minutes of being exposed to the sound of a flying bee. The researchers suggest that the flowers’ petals may vibrate in response to the sound, acting almost like tiny ears.',
    prompt: STRUCT,
    choices: [
      'It presents a long-held assumption, then describes a finding that challenges it and a possible explanation.',
      'It describes a problem and then proposes several solutions to it.',
      'It compares two competing theories and argues that both are wrong.',
      'It traces the history of a scientific field from its beginning to the present.',
    ],
    ex: {
      en: 'Sentence 1: an old assumption. Sentence 2 ("However"): a finding against it. Sentence 3: a suggested explanation.',
      ru: 'Предложение 1 — старое предположение. Предложение 2 («However») — находка, которая ему противоречит. Предложение 3 — возможное объяснение.',
      kk: '1-сөйлем — бұрынғы болжам. 2-сөйлем («However») — оған қайшы нәтиже. 3-сөйлем — ықтимал түсініктеме.',
    },
  },
  {
    id: 'p03',
    skill: 'structure',
    d: 2,
    passage:
      'Aigerim had practiced the piece a hundred times, but when she sat down at the piano in the silent concert hall, her hands felt like someone else’s. She looked at the keys as if seeing them for the first time. Then, from somewhere in the third row, she heard her grandmother cough softly—the same small cough that had interrupted every practice session at home—and her fingers began to move.',
    prompt: PURPOSE,
    choices: [
      'To show how a familiar sound helps a nervous character begin to perform',
      'To describe the architecture of a concert hall',
      'To explain why the grandmother attends every concert',
      'To argue that practice matters less than natural talent',
    ],
    ex: {
      en: 'Aigerim freezes, then hears the cough she knows from home, and only then starts playing. The text is about that moment of comfort.',
      ru: 'Айгерим теряется, слышит знакомый с детства кашель бабушки — и только тогда начинает играть. Текст об этом моменте поддержки.',
      kk: 'Әйгерім абдырап қалады, үйден таныс әжесінің жөтелін естиді де, сонда ғана ойнай бастайды. Мәтін осы демеу сәті туралы.',
    },
  },
  {
    id: 'p04',
    skill: 'structure',
    d: 3,
    passage:
      'Urban planners once believed that building wider roads would reduce traffic. Yet studies of cities from Los Angeles to Seoul have found the opposite: new lanes quickly fill with drivers who previously avoided the route, a pattern called “induced demand.” Some cities have therefore begun removing highways altogether, and in several cases traffic in the surrounding area has not increased.',
    prompt: STRUCT,
    choices: [
      'It describes a belief, presents evidence against it, and then notes how some cities have responded.',
      'It defines a term, gives its history, and argues that it should no longer be used.',
      'It describes one city, explains its traffic problems, and recommends a single solution.',
      'It presents two studies with conflicting results and explains why one is more reliable.',
    ],
    ex: {
      en: 'Belief (wider roads help) → evidence against it (induced demand) → response (removing highways). The first choice matches all three parts.',
      ru: 'Убеждение (широкие дороги помогают) → доказательства против (induced demand) → реакция городов (снос трасс). Первый вариант описывает все три части.',
      kk: 'Сенім (кең жолдар көмектеседі) → оған қарсы дәлел (induced demand) → қалалардың жауабы (тас жолдарды алып тастау). Бірінші нұсқа үш бөлікті де қамтиды.',
    },
  },
  {
    id: 'p05',
    skill: 'structure',
    d: 3,
    passage:
      'The Kazakh steppe can seem empty to a first-time visitor. In reality, it supports a remarkable variety of life, from saiga antelopes and steppe eagles to hundreds of species of flowering plants. Recognizing this diversity is the first step toward protecting it.',
    prompt: 'Which choice best describes the function of the second sentence in the overall structure of the text?',
    choices: [
      'It corrects the impression described in the first sentence.',
      'It gives an example of the conservation efforts mentioned in the third sentence.',
      'It explains why visitors rarely travel to the steppe.',
      'It introduces a counterargument that the text later rejects.',
    ],
    ex: {
      en: 'Sentence 1: the steppe "can seem empty." Sentence 2 ("In reality") shows it is full of life — it corrects that impression.',
      ru: 'Предложение 1: степь «кажется пустой». Предложение 2 («In reality») показывает, что она полна жизни, — то есть исправляет это впечатление.',
      kk: '1-сөйлем: дала «бос көрінеді». 2-сөйлем («In reality») оның тіршілікке толы екенін көрсетеді — яғни сол әсерді түзетеді.',
    },
  },
  {
    id: 'p06',
    skill: 'structure',
    d: 1,
    passage:
      'Before a rocket launch, engineers run thousands of computer simulations. Each simulation tests how the rocket would respond to different conditions, such as strong winds or a faulty engine. These tests help engineers find and fix problems long before the rocket leaves the ground.',
    prompt: PURPOSE,
    choices: [
      'To explain how computer simulations help engineers prepare for rocket launches',
      'To argue that rocket launches are too dangerous to continue',
      'To describe the history of rocket engineering',
      'To compare different types of rocket engines',
    ],
    ex: {
      en: 'Every sentence is about simulations and how they help before launch. The other choices mention topics the text never discusses.',
      ru: 'Каждое предложение — о симуляциях и их пользе перед запуском. Остальные варианты называют темы, которых в тексте нет.',
      kk: 'Әр сөйлем симуляциялар және олардың ұшыру алдындағы пайдасы туралы. Қалған нұсқалар мәтінде жоқ тақырыптарды атайды.',
    },
  },
  {
    id: 'p07',
    skill: 'structure',
    d: 2,
    passage:
      'Many people think of bread as a product of farming. In fact, archaeologists in Jordan have found charred remains of flatbread baked about 14,400 years ago—thousands of years before humans began growing crops. The discovery suggests that people made bread from wild grains long before agriculture began.',
    prompt: STRUCT,
    choices: [
      'It presents a common belief, offers a discovery that contradicts it, and states what the discovery suggests.',
      'It describes how bread is made today and compares it with ancient methods.',
      'It explains the origins of farming and its effects on modern diets.',
      'It lists several archaeological sites and the foods found at each one.',
    ],
    ex: {
      en: 'Common belief → contradicting discovery ("In fact") → what it suggests. Only the first choice follows this order.',
      ru: 'Распространённое мнение → опровергающая находка («In fact») → что она означает. Этот порядок описывает только первый вариант.',
      kk: 'Кең тараған пікір → оны жоққа шығаратын табыс («In fact») → оның не білдіретіні. Бұл ретті тек бірінші нұсқа сипаттайды.',
    },
  },
  {
    id: 'p08',
    skill: 'structure',
    d: 3,
    passage:
      'The old clock in the hallway had stopped years ago at a quarter past four, and no one in the family had ever tried to fix it. Guests sometimes asked about it. “It keeps the right time twice a day,” Grandfather would say, and then he would change the subject—usually to the weather, which, unlike the clock, could always be relied upon to change.',
    prompt: PURPOSE,
    choices: [
      'To suggest, through Grandfather’s joking reply, that the stopped clock holds a meaning he prefers not to discuss',
      'To explain how mechanical clocks work',
      'To criticize the family for being careless with their possessions',
      'To describe the weather in the region where the family lives',
    ],
    ex: {
      en: 'No one fixes the clock, and Grandfather jokes and quickly changes the subject — hints that the clock matters to him in a way he avoids explaining.',
      ru: 'Часы никто не чинит, а дедушка отшучивается и сразу меняет тему — намёк на то, что часы для него что-то значат, но говорить об этом он не хочет.',
      kk: 'Сағатты ешкім жөндемейді, ал ата әзілдеп, тақырыпты бірден өзгертеді — сағаттың ол үшін маңызды екенін, бірақ ол бұл туралы айтқысы келмейтінін меңзейді.',
    },
  },
  {
    id: 'c01',
    skill: 'cross',
    d: 2,
    passages: [
      {
        label: 'Text 1',
        text: 'Many educators argue that students should be allowed to use calculators on all math tests. Calculators, they say, free students from tedious arithmetic so that they can focus on reasoning and problem solving.',
      },
      {
        label: 'Text 2',
        text: 'Calculators are valuable tools, but a 2020 study found that students who regularly practiced mental arithmetic were better at judging whether an answer was reasonable. Without such practice, students may accept a calculator error without noticing it.',
      },
    ],
    prompt: cross('the educators’ argument in Text 1'),
    choices: [
      'By agreeing that calculators are useful but warning that students still need practice doing arithmetic themselves',
      'By claiming that calculators should be banned from all classrooms',
      'By arguing that reasoning and problem solving are not important in math',
      'By stating that the study proved calculators usually give wrong answers',
    ],
    ex: {
      en: 'Text 2 calls calculators "valuable" (agreement) but says mental arithmetic helps catch errors (warning). It never calls for a ban.',
      ru: 'Текст 2 называет калькуляторы «valuable» (согласие), но говорит, что устный счёт помогает замечать ошибки (предостережение). Запрещать их автор не предлагает.',
      kk: '2-мәтін калькуляторларды «valuable» деп атайды (келісім), бірақ ауызша есеп қателерді байқауға көмектесетінін айтады (ескерту). Тыйым салуды ұсынбайды.',
    },
  },
  {
    id: 'c02',
    skill: 'cross',
    d: 3,
    passages: [
      {
        label: 'Text 1',
        text: 'For years, Tyrannosaurus rex was pictured as a scaly reptile. Discoveries of feathered relatives of T. rex have led some researchers to argue that it, too, was covered in feathers.',
      },
      {
        label: 'Text 2',
        text: 'Fossilized skin impressions from several T. rex specimens show small scales on the neck, hips, and tail. While T. rex may have had some feathers when young or on parts of its back, this evidence suggests that adults were mostly scaly.',
      },
    ],
    prompt: cross('the researchers’ argument in Text 1'),
    choices: [
      'By noting that direct fossil evidence suggests adult T. rex was mostly covered in scales',
      'By agreeing that adult T. rex was completely covered in feathers',
      'By arguing that T. rex was not related to any feathered dinosaurs',
      'By claiming that fossil skin impressions are impossible to interpret',
    ],
    ex: {
      en: 'Text 2 uses skin impressions (direct evidence) to argue that adults were mostly scaly, which challenges the feather argument in Text 1.',
      ru: 'Текст 2 опирается на отпечатки кожи (прямое доказательство) и говорит, что взрослые особи были в основном чешуйчатыми, — это возражение Тексту 1.',
      kk: '2-мәтін тері іздеріне (тікелей дәлелге) сүйеніп, ересектердің негізінен қабыршақты болғанын айтады — бұл 1-мәтінге қарсы дәлел.',
    },
  },
  {
    id: 'c03',
    skill: 'cross',
    d: 2,
    passages: [
      {
        label: 'Text 1',
        text: 'When a large company allowed its employees to work from home, individual productivity rose by 13 percent. Workers reported fewer interruptions and more time for focused tasks.',
      },
      {
        label: 'Text 2',
        text: 'Studies of remote teams show that while focused individual work may improve, employees communicate less often with colleagues outside their own group. Over time, this can make it harder to share new ideas across a company.',
      },
    ],
    prompt: cross('the findings described in Text 1'),
    choices: [
      'By suggesting that the productivity gains in Text 1 may come at a cost to collaboration',
      'By rejecting the claim that working from home reduces interruptions',
      'By arguing that productivity cannot be measured',
      'By agreeing that remote work has no disadvantages',
    ],
    ex: {
      en: 'Text 2 accepts that individual work may improve but adds a downside: less communication across groups.',
      ru: 'Текст 2 признаёт, что индивидуальная работа может улучшиться, но добавляет минус: меньше общения между отделами.',
      kk: '2-мәтін жеке жұмыстың жақсаруы мүмкін екенін мойындайды, бірақ кемшілігін қосады: бөлімдер арасындағы қарым-қатынас азаяды.',
    },
  },
  {
    id: 'c04',
    skill: 'cross',
    d: 3,
    passages: [
      {
        label: 'Text 1',
        text: 'Traditionally, many histories credited a single inventor, Johannes Gutenberg, with creating printing with movable type in Europe around 1440, an innovation that transformed the spread of knowledge.',
      },
      {
        label: 'Text 2',
        text: 'Metal movable type was used in Korea as early as the thirteenth century; the Jikji, a Buddhist text printed in 1377, is the oldest surviving book printed with movable metal type. Gutenberg’s achievement was real, but it was one chapter in a longer, global story.',
      },
    ],
    prompt: cross('the traditional view described in Text 1'),
    choices: [
      'By acknowledging Gutenberg’s achievement while pointing out that movable type has an earlier history',
      'By claiming that Gutenberg copied his invention directly from Korean printers',
      'By arguing that the Jikji was printed after Gutenberg’s work',
      'By agreeing that Gutenberg alone invented movable type',
    ],
    ex: {
      en: 'Text 2 says Gutenberg’s achievement "was real" but places it in a longer history that began earlier in Korea. It never claims he copied anyone.',
      ru: 'Текст 2 признаёт, что достижение Гутенберга «было настоящим», но вписывает его в более долгую историю, начавшуюся раньше в Корее. О копировании речи нет.',
      kk: '2-мәтін Гутенбергтің жетістігі «шынайы болғанын» мойындайды, бірақ оны Кореяда ертерек басталған ұзақ тарихтың бір бөлігі ретінде көрсетеді. Көшірді деп айтпайды.',
    },
  },
  {
    id: 'c05',
    skill: 'cross',
    d: 3,
    passages: [
      {
        label: 'Text 1',
        text: 'Some scientists propose bringing back extinct species, such as the woolly mammoth, through genetic engineering. They argue that herds of mammoth-like animals could help restore Arctic grasslands.',
      },
      {
        label: 'Text 2',
        text: 'Reviving extinct species would cost enormous sums of money. Ecologist Ana Lopez argues that the same funds could protect many endangered species that still exist—a far more certain way to help ecosystems.',
      },
    ],
    prompt: cross('the proposal described in Text 1'),
    choices: [
      'By arguing that the resources would be better spent protecting existing endangered species',
      'By agreeing that mammoths are the best way to restore Arctic grasslands',
      'By claiming that genetic engineering is impossible',
      'By arguing that Arctic grasslands do not need to be restored',
    ],
    ex: {
      en: 'Text 2 focuses on cost and says the money would do more good protecting living species. It doesn’t say the technology is impossible.',
      ru: 'Текст 2 говорит о цене и о том, что эти деньги принесут больше пользы, если защитить ныне живущие виды. О невозможности технологии речи нет.',
      kk: '2-мәтін шығын туралы айтып, бұл ақша қазір бар түрлерді қорғауға жұмсалса, пайдасы көбірек болатынын айтады. Технологияның мүмкін еместігі туралы айтылмайды.',
    },
  },
];
