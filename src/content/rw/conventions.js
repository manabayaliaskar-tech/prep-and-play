// Standard English Conventions: Boundaries (пунктуация) и Form, Structure, and Sense (формы слов).
// Все тексты и задания — авторские, в формате цифрового SAT. Первый вариант — правильный.

import { CONV } from './prompts.js';

const SPLICE_EN =
  'Two independent clauses need a period or a semicolon between them (or a comma plus "and," "but," etc.). A comma alone creates a comma splice, and no punctuation creates a run-on sentence.';
const SPLICE_RU =
  'Два самостоятельных предложения разделяют точкой или точкой с запятой (либо запятой + and/but). Одна запятая — ошибка comma splice, отсутствие знака — слитное предложение (run-on).';
const SPLICE_KK =
  'Екі дербес сөйлемді нүктемен немесе нүктелі үтірмен (не үтір + and/but) бөледі. Жалғыз үтір — comma splice қатесі, белгісіз жазу — run-on (біріккен сөйлем) қатесі.';

export const CONVENTIONS = [
  {
    id: 'b01',
    skill: 'boundaries',
    d: 1,
    passage:
      'The Aral Sea was once the fourth-largest lake in the ______ by 2010, it had shrunk to about one tenth of its original size.',
    prompt: CONV,
    choices: ['world; by', 'world, by', 'world by', 'world: and by'],
    ex: { en: SPLICE_EN, ru: SPLICE_RU, kk: SPLICE_KK },
  },
  {
    id: 'b02',
    skill: 'boundaries',
    d: 1,
    passage:
      'Composer Kurmangazy Sagyrbayuly wrote dozens of kuis, short instrumental pieces for the ______ many of them are still performed at concerts today.',
    prompt: CONV,
    choices: ['dombra, and', 'dombra and,', 'dombra', 'dombra,'],
    ex: {
      en: 'Two independent clauses can be joined with a comma followed by a coordinating conjunction ("and"). The comma goes BEFORE "and," not after it.',
      ru: 'Два самостоятельных предложения можно соединить запятой + союз and. Запятая ставится ПЕРЕД and, а не после.',
      kk: 'Екі дербес сөйлемді үтір + and жалғаулығымен байланыстыруға болады. Үтір and сөзінің АЛДЫНА қойылады, кейін емес.',
    },
  },
  {
    id: 'b03',
    skill: 'boundaries',
    d: 2,
    passage:
      'The museum’s new exhibit features three rare traditional ______ a kobyz, a sybyzgy, and a shertpe.',
    prompt: CONV,
    choices: ['instruments:', 'instruments;', 'instruments, such as:', 'instruments. A'],
    ex: {
      en: 'A colon can introduce a list after a complete sentence. A semicolon must join two complete sentences, a colon should not follow "such as," and a period would leave a fragment.',
      ru: 'Двоеточие вводит список после законченного предложения. Точка с запятой соединяет только два полных предложения, после such as двоеточие не ставят, а точка оставит неполное предложение.',
      kk: 'Толық сөйлемнен кейін тізімді қос нүкте енгізеді. Нүктелі үтір тек екі толық сөйлемді байланыстырады, such as-тан кейін қос нүкте қойылмайды, ал нүкте толымсыз сөйлем қалдырады.',
    },
  },
  {
    id: 'b04',
    skill: 'boundaries',
    d: 2,
    passage:
      'Marie Tharp, a geologist and oceanographic ______ created one of the first detailed maps of the Atlantic Ocean floor.',
    prompt: CONV,
    choices: ['cartographer,', 'cartographer;', 'cartographer—', 'cartographer'],
    ex: {
      en: 'The phrase "a geologist and oceanographic cartographer" is extra information that opens with a comma, so it must close with a matching comma.',
      ru: 'Оборот «a geologist and oceanographic cartographer» — дополнительная информация. Он открывается запятой, значит, и закрываться должен запятой.',
      kk: '«a geologist and oceanographic cartographer» тіркесі — қосымша ақпарат. Ол үтірмен ашылған, сондықтан үтірмен жабылуы керек.',
    },
  },
  {
    id: 'b05',
    skill: 'boundaries',
    d: 2,
    passage:
      'The researchers who tracked snow leopards in the Tian Shan ______ that the cats can travel more than 20 kilometers in a single night.',
    prompt: CONV,
    choices: ['mountains found', 'mountains, found', 'mountains; found', 'mountains: found'],
    ex: {
      en: 'The subject ("The researchers who tracked snow leopards in the Tian Shan mountains") should not be separated from its verb ("found") by any punctuation.',
      ru: 'Подлежащее («The researchers who tracked... mountains») нельзя отделять от сказуемого («found») никаким знаком препинания.',
      kk: 'Бастауышты («The researchers who tracked... mountains») баяндауыштан («found») ешқандай тыныс белгісімен бөлуге болмайды.',
    },
  },
  {
    id: 'b06',
    skill: 'boundaries',
    d: 2,
    passage:
      'Many deserts receive less than 250 millimeters of rain per ______ some desert plants survive for decades on even less water.',
    prompt: CONV,
    choices: ['year; however,', 'year, however,', 'year however', 'year, however'],
    ex: {
      en: '"However" here links two independent clauses, so it needs a semicolon (or period) before it and a comma after it. A comma before "however" creates a comma splice.',
      ru: 'However здесь связывает два самостоятельных предложения: перед ним нужна точка с запятой (или точка), после — запятая. Запятая перед however даёт ошибку comma splice.',
      kk: 'Мұнда however екі дербес сөйлемді байланыстырады: алдына нүктелі үтір (не нүкте), соңына үтір қойылады. However алдындағы үтір — comma splice қатесі.',
    },
  },
  {
    id: 'b07',
    skill: 'boundaries',
    d: 3,
    passage:
      'The 1957 launch of Sputnik 1, the first artificial satellite, surprised people around the ______ was visible from Earth with ordinary binoculars.',
    prompt: CONV,
    choices: ['world; it', 'world, it', 'world it', 'world, it,'],
    ex: { en: SPLICE_EN, ru: SPLICE_RU, kk: SPLICE_KK },
  },
  {
    id: 'b08',
    skill: 'boundaries',
    d: 1,
    passage: 'Although the honey badger is ______ is known for fearlessly defending itself against much larger animals.',
    prompt: CONV,
    choices: ['small, it', 'small; it', 'small. It', 'small: it'],
    ex: {
      en: '"Although the honey badger is small" is a dependent clause. It is followed by a comma, not a semicolon, colon, or period, because it cannot stand alone.',
      ru: '«Although the honey badger is small» — придаточное предложение, оно не может стоять отдельно. После него ставится запятая, а не точка с запятой, двоеточие или точка.',
      kk: '«Although the honey badger is small» — бағыныңқы сөйлем, ол жеке тұра алмайды. Одан кейін нүктелі үтір, қос нүкте не нүкте емес, үтір қойылады.',
    },
  },
  {
    id: 'b09',
    skill: 'boundaries',
    d: 3,
    passage:
      'The results surprised even the lead ______ bacteria survived for months without any source of light.',
    prompt: CONV,
    choices: ['scientist: the', 'scientist, the', 'scientist the', 'scientist and, the'],
    ex: {
      en: 'A colon can join two independent clauses when the second explains the first (here: what was surprising). A comma alone would create a comma splice.',
      ru: 'Двоеточие соединяет два самостоятельных предложения, если второе поясняет первое (здесь — что именно удивило). Одна запятая дала бы ошибку comma splice.',
      kk: 'Екінші сөйлем біріншісін түсіндірсе (мұнда — нені таңғалдырғаны), қос нүкте екі дербес сөйлемді байланыстыра алады. Жалғыз үтір comma splice қатесін тудырады.',
    },
  },
  {
    id: 'b10',
    skill: 'boundaries',
    d: 3,
    passage:
      'The Darvaza crater in Turkmenistan—a natural gas field that has been burning since ______ thousands of tourists every year.',
    prompt: CONV,
    choices: ['1971—attracts', '1971, attracts', '1971; attracts', '1971 attracts'],
    ex: {
      en: 'The extra information opens with a dash, so it must close with a dash. Punctuation around an interruption has to match.',
      ru: 'Дополнительная информация открывается тире, значит, и закрыться должна тире. Знаки вокруг вставки должны совпадать.',
      kk: 'Қосымша ақпарат сызықшамен ашылған, сондықтан сызықшамен жабылуы тиіс. Қыстырма сөздің екі жағындағы белгілер бірдей болуы керек.',
    },
  },
  {
    id: 'b11',
    skill: 'boundaries',
    d: 1,
    passage: 'Ice is less dense than liquid ______ is why it floats.',
    prompt: CONV,
    choices: ['water. That', 'water, that', 'water that', 'water, that,'],
    ex: { en: SPLICE_EN, ru: SPLICE_RU, kk: SPLICE_KK },
  },
  {
    id: 'b12',
    skill: 'boundaries',
    d: 2,
    passage: 'Students in the robotics program learn to ______ design circuits, and build small robots.',
    prompt: CONV,
    choices: ['code,', 'code;', 'code:', 'code'],
    ex: {
      en: 'This is a list of three actions (code, design, build). Items in a list are separated by commas.',
      ru: 'Это перечисление трёх действий (code, design, build). Элементы списка разделяются запятыми.',
      kk: 'Бұл үш әрекеттің тізімі (code, design, build). Тізім элементтері үтірмен бөлінеді.',
    },
  },
  {
    id: 'f01',
    skill: 'fss',
    d: 1,
    passage: 'The collection of ancient manuscripts in the National Library ______ more than 2,000 documents.',
    prompt: CONV,
    choices: ['includes', 'include', 'are including', 'have included'],
    ex: {
      en: 'The subject is "collection" (singular), not "manuscripts." A singular subject takes a singular verb: "includes."',
      ru: 'Подлежащее — «collection» (единственное число), а не «manuscripts». Единственному числу нужен глагол «includes».',
      kk: 'Бастауыш — «collection» (жекеше түр), «manuscripts» емес. Жекеше бастауышқа «includes» етістігі керек.',
    },
  },
  {
    id: 'f02',
    skill: 'fss',
    d: 1,
    passage: 'The two scientists published ______ findings in a leading journal in 2019.',
    prompt: CONV,
    choices: ['their', 'they’re', 'its', 'there'],
    ex: {
      en: '"Their" is the plural possessive pronoun (the findings belong to the scientists). "They’re" = "they are," and "there" refers to a place.',
      ru: '«Their» — притяжательное местоимение для множественного числа (находки принадлежат учёным). «They’re» = «they are», «there» — «там».',
      kk: '«Their» — көпше түрдегі тәуелдік есімдік (нәтижелер ғалымдарға тиесілі). «They’re» = «they are», ал «there» — «сол жерде».',
    },
  },
  {
    id: 'f03',
    skill: 'fss',
    d: 1,
    passage: 'In 1991, Kazakhstan ______ its independence.',
    prompt: CONV,
    choices: ['declared', 'declares', 'will declare', 'has declared'],
    ex: {
      en: '"In 1991" points to a finished event in the past, so the simple past tense "declared" is needed.',
      ru: '«In 1991» указывает на завершённое событие в прошлом, поэтому нужно простое прошедшее время «declared».',
      kk: '«In 1991» өткенде аяқталған оқиғаны білдіреді, сондықтан жай өткен шақ «declared» керек.',
    },
  },
  {
    id: 'f04',
    skill: 'fss',
    d: 2,
    passage: 'Each of the paintings in the gallery’s new collection ______ by an artist under the age of twenty.',
    prompt: CONV,
    choices: ['was created', 'were created', 'have been created', 'are created'],
    ex: {
      en: 'The subject is "Each," which is singular. Ignore the phrase "of the paintings": the verb must be singular — "was created."',
      ru: 'Подлежащее — «Each», это единственное число. Оборот «of the paintings» не влияет: нужен глагол в единственном числе — «was created».',
      kk: 'Бастауыш — «Each», ол жекеше. «of the paintings» тіркесі әсер етпейді: етістік жекеше болуы керек — «was created».',
    },
  },
  {
    id: 'f05',
    skill: 'fss',
    d: 2,
    passage:
      'Swiftlets build their nests almost entirely from hardened saliva. Because the ______ nests are so durable, some can last for several breeding seasons.',
    prompt: CONV,
    choices: ['birds’', 'bird’s', 'birds', 'birds’s'],
    ex: {
      en: 'The nests belong to many birds, so we need the plural possessive: "birds’" (apostrophe after the s).',
      ru: 'Гнёзда принадлежат многим птицам, значит, нужна притяжательная форма множественного числа: «birds’» (апостроф после s).',
      kk: 'Ұялар көп құсқа тиесілі, сондықтан көпше түрдің тәуелдік формасы керек: «birds’» (апостроф s-тан кейін).',
    },
  },
  {
    id: 'f06',
    skill: 'fss',
    d: 2,
    passage: 'The Caspian Sea is technically a lake, but because of ______ enormous size and salty water, it is called a sea.',
    prompt: CONV,
    choices: ['its', 'it’s', 'its’', 'their'],
    ex: {
      en: '"Its" (no apostrophe) is the possessive form. "It’s" means "it is." "Their" is plural, but the Caspian Sea is singular.',
      ru: '«Its» (без апострофа) — притяжательная форма. «It’s» = «it is». «Their» — множественное число, а Каспийское море одно.',
      kk: '«Its» (апострофсыз) — тәуелдік форма. «It’s» = «it is». «Their» — көпше түр, ал Каспий теңізі біреу.',
    },
  },
  {
    id: 'f07',
    skill: 'fss',
    d: 2,
    passage: 'Walking through the old city of Turkistan, ______',
    prompt: CONV,
    choices: [
      'visitors can see the Mausoleum of Khoja Ahmed Yasawi from almost every street.',
      'the Mausoleum of Khoja Ahmed Yasawi can be seen from almost every street.',
      'almost every street offers a view of the Mausoleum of Khoja Ahmed Yasawi.',
      'the view of the Mausoleum of Khoja Ahmed Yasawi is visible from almost every street.',
    ],
    ex: {
      en: 'The phrase "Walking through the old city" must describe whoever is walking. Only "visitors" can walk — a mausoleum, a street, or a view cannot.',
      ru: 'Оборот «Walking through the old city» относится к тому, кто идёт. Идти могут только «visitors» — мавзолей, улица или вид идти не могут.',
      kk: '«Walking through the old city» тіркесі жүріп келе жатқан адамға қатысты. Тек «visitors» жүре алады — кесене, көше немесе көрініс жүре алмайды.',
    },
  },
  {
    id: 'f08',
    skill: 'fss',
    d: 3,
    passage: 'The program teaches students how to analyze data, ______ clear reports, and present their findings to an audience.',
    prompt: CONV,
    choices: ['write', 'writing', 'to writing', 'written'],
    ex: {
      en: 'Items in a list must be parallel: "how to analyze..., write..., and present..." All three verbs share the same form.',
      ru: 'Элементы перечисления должны быть однотипными: «how to analyze..., write..., and present...» — все три глагола в одной форме.',
      kk: 'Тізім элементтері бірдей формада болуы керек: «how to analyze..., write..., and present...» — үш етістіктің формасы бірдей.',
    },
  },
  {
    id: 'f09',
    skill: 'fss',
    d: 3,
    passage: 'Neither the coach nor the players ______ expected the storm to delay the final match.',
    prompt: CONV,
    choices: ['had', 'has', 'was', 'is'],
    ex: {
      en: 'With "neither... nor," the verb agrees with the closer subject ("players," plural). "Had" works with a plural subject; "has," "was," and "is" are singular.',
      ru: 'В конструкции «neither... nor» глагол согласуется с ближайшим подлежащим («players» — множественное число). «Had» подходит, а «has», «was», «is» — формы единственного числа.',
      kk: '«neither... nor» құрылымында етістік жақын тұрған бастауышпен («players» — көпше) үйлеседі. «Had» жарайды, ал «has», «was», «is» — жекеше формалар.',
    },
  },
  {
    id: 'f10',
    skill: 'fss',
    d: 2,
    passage: 'Tomyris, the queen ______ led the Massagetae, is remembered for defeating the Persian king Cyrus the Great.',
    prompt: CONV,
    choices: ['who', 'which', 'whom', 'whose'],
    ex: {
      en: 'The pronoun refers to a person (the queen) and acts as the subject of "led," so "who" is correct. "Which" is for things; "whom" is an object form.',
      ru: 'Местоимение относится к человеку (королеве) и является подлежащим для «led», поэтому нужно «who». «Which» — для предметов, «whom» — форма дополнения.',
      kk: 'Есімдік адамға (патшайымға) қатысты және «led» етістігінің бастауышы, сондықтан «who» керек. «Which» — заттар үшін, «whom» — толықтауыш формасы.',
    },
  },
  {
    id: 'f11',
    skill: 'fss',
    d: 3,
    passage:
      'Among the most surprising discoveries in the cave ______ a set of bone flutes more than 35,000 years old.',
    prompt: CONV,
    choices: ['was', 'were', 'have been', 'are'],
    ex: {
      en: 'The sentence is inverted: the real subject comes after the verb — "a set of bone flutes." "A set" is singular, so the verb is "was."',
      ru: 'Здесь обратный порядок слов: настоящее подлежащее стоит после глагола — «a set of bone flutes». «A set» — единственное число, значит, «was».',
      kk: 'Мұнда сөз тәртібі кері: нағыз бастауыш етістіктен кейін тұр — «a set of bone flutes». «A set» жекеше, сондықтан «was».',
    },
  },
  {
    id: 'f12',
    skill: 'fss',
    d: 2,
    passage: 'The ______ of the experiment were published in a peer-reviewed journal last spring.',
    prompt: CONV,
    choices: ['results', 'result’s', 'results’', 'results’s'],
    ex: {
      en: 'Nothing is owned here, so no apostrophe is needed. The plural "results" matches the plural verb "were."',
      ru: 'Здесь нет принадлежности, поэтому апостроф не нужен. Множественное «results» согласуется с глаголом «were».',
      kk: 'Мұнда тәуелдік жоқ, сондықтан апостроф керек емес. Көпше «results» сөзі «were» етістігімен үйлеседі.',
    },
  },
  {
    id: 'f13',
    skill: 'fss',
    d: 3,
    passage: 'By the time the rescue team arrived, the climbers ______ for more than eighteen hours.',
    prompt: CONV,
    choices: ['had been waiting', 'have been waiting', 'are waiting', 'will wait'],
    ex: {
      en: 'The waiting happened before another past event (the team arrived), so we need the past perfect continuous: "had been waiting."',
      ru: 'Ожидание длилось до другого события в прошлом (прибытия спасателей), поэтому нужно Past Perfect Continuous: «had been waiting».',
      kk: 'Күту өткендегі басқа оқиғаға дейін (құтқарушылар келгенге дейін) созылды, сондықтан Past Perfect Continuous керек: «had been waiting».',
    },
  },
  {
    id: 'f14',
    skill: 'fss',
    d: 1,
    passage: 'The new battery charges ______ than the previous model, reaching full power in under an hour.',
    prompt: CONV,
    choices: ['faster', 'more fast', 'fastest', 'more faster'],
    ex: {
      en: 'Comparing two things with "than" requires the comparative form. For short words like "fast," add -er: "faster." Never combine "more" with -er.',
      ru: 'Сравнение двух предметов с «than» требует сравнительной степени. У коротких слов вроде «fast» добавляем -er: «faster». «More» и -er вместе не используют.',
      kk: '«than» арқылы екі нәрсені салыстырғанда салыстырмалы шырай керек. «fast» сияқты қысқа сөздерге -er жалғанады: «faster». «More» мен -er бірге қолданылмайды.',
    },
  },
];
