// Мини-уроки по испанскому, французскому, китайскому, японскому и корейскому (темы es.*, fr.*, zh.*, ja.*, ko.*). Формат - в index.js.

import { L, same } from '../../pools/gen.js';

export default {
  'es.bank': {
    rule: L(
      "In Spanish every noun is masculine or feminine (el libro, la casa), and adjectives agree with it. The verb ser describes who/what something is, estar says where or how it is now.",
      "В испанском каждое существительное мужского или женского рода (el libro, la casa), и прилагательное с ним согласуется. Глагол ser говорит, кто/что это, estar - где и в каком состоянии сейчас.",
      "Испан тілінде әр зат есім ер немесе әйел тегінде (el libro, la casa), сын есім онымен үйлеседі. Ser етістігі кім/не екенін, estar қайда және қазір қандай күйде екенін білдіреді.",
    ),
    points: [
      L("Plural: add -s (libro - libros) or -es after a consonant (flor - flores).", "Множественное число: -s (libro - libros) или -es после согласной (flor - flores).", "Көпше: -s (libro - libros) немесе тұйық дыбыстан кейін -es (flor - flores)."),
      L("Adjective agrees: casa blanca, libro blanco.", "Прилагательное согласуется: casa blanca, libro blanco.", "Сын есім үйлеседі: casa blanca, libro blanco."),
      L("Questions start with ¿ and end with ?.", "Вопрос начинается с ¿ и заканчивается ?.", "Сұрақ ¿ белгісімен басталып, ? белгісімен аяқталады."),
    ],
    example: {
      q: same("La casa ___ grande. (ser)"),
      steps: [
        L("We describe a quality of the house, so we use ser.", "Описываем свойство дома, значит ser.", "Үйдің қасиетін сипаттап тұрмыз, демек ser."),
        L("La casa es grande.", "La casa es grande.", "La casa es grande."),
      ],
    },
    check: {
      q: L("Choose: Madrid ___ en España.", "Выбери: Madrid ___ en España.", "Таңда: Madrid ___ en España."),
      options: [same("es"), same("está"), same("hay")],
      answer: 1,
      why: L("Location takes estar: Madrid está en España.", "Местонахождение - estar: Madrid está en España.", "Орналасу үшін estar қолданылады: Madrid está en España."),
    },
  },
  'fr.bank': {
    rule: L(
      "French nouns have gender (le livre, la table) and adjectives agree with them. The articles are le/la/l', un/une, les/des.",
      "Во французском у существительных есть род (le livre, la table), и прилагательные согласуются с ними. Артикли: le/la/l', un/une, les/des.",
      "Француз тілінде зат есімнің тегі бар (le livre, la table), сын есім онымен үйлеседі. Артикльдер: le/la/l', un/une, les/des.",
    ),
    points: [
      L("Feminine adjective usually adds -e: petit - petite.", "Женский род прилагательного обычно с -e: petit - petite.", "Әйел тегіндегі сын есім әдетте -e алады: petit - petite."),
      L("Plural adds -s, usually silent: les livres.", "Множественное число - -s, обычно не произносится: les livres.", "Көпше -s алады, әдетте айтылмайды: les livres."),
      L("Negation surrounds the verb: je ne parle pas.", "Отрицание обрамляет глагол: je ne parle pas.", "Болымсыздық етістікті орай тұрады: je ne parle pas."),
    ],
    example: {
      q: same("Elle est ___. (content)"),
      steps: [
        L("Elle is feminine, so the adjective is feminine too.", "Elle - женский род, значит и прилагательное в женском.", "Elle - әйел тегі, сондықтан сын есім де әйел тегінде."),
        L("Elle est contente.", "Elle est contente.", "Elle est contente."),
      ],
    },
    check: {
      q: L("Which is correct?", "Что верно?", "Қайсысы дұрыс?"),
      options: [same("Je ne pas parle."), same("Je ne parle pas."), same("Je parle ne pas.")],
      answer: 1,
      why: L("ne goes before the verb and pas after it.", "ne стоит перед глаголом, pas - после.", "ne етістіктің алдында, pas одан кейін тұрады."),
    },
  },
  'zh.bank': {
    rule: L(
      "Chinese has no conjugation or plural endings: word order does the work (subject - verb - object). Each character has a pinyin reading and a tone.",
      "В китайском нет спряжения и окончаний множественного числа: всё решает порядок слов (подлежащее - сказуемое - дополнение). У каждого иероглифа есть чтение пиньинь и тон.",
      "Қытай тілінде жіктеу мен көпше жалғауы жоқ: сөз тәртібі шешеді (бастауыш - баяндауыш - толықтауыш). Әр иероглифтің пиньинь оқылуы мен тоны бар.",
    ),
    points: [
      L("Four tones: mā (1), má (2), mǎ (3), mà (4).", "Четыре тона: mā (1), má (2), mǎ (3), mà (4).", "Төрт тон: mā (1), má (2), mǎ (3), mà (4)."),
      L("Negation: 不 (bù) before a verb: 我不是学生.", "Отрицание: 不 (bù) перед глаголом: 我不是学生.", "Болымсыздық: 不 (bù) етістік алдында: 我不是学生."),
      L("Question: add 吗 (ma) at the end: 你好吗?", "Вопрос: добавь 吗 (ma) в конце: 你好吗?", "Сұрақ: соңына 吗 (ma) қос: 你好吗?"),
    ],
    example: {
      q: same("我 ___ 学生。 (I am a student)"),
      steps: [
        L("We need the verb «to be» between subject and noun.", "Нужен глагол «быть» между подлежащим и существительным.", "Бастауыш пен зат есімнің арасында «болу» етістігі керек."),
        L("是 (shì): 我是学生。", "是 (shì): 我是学生。", "是 (shì): 我是学生。"),
      ],
    },
    check: {
      q: L("Which particle makes a yes/no question?", "Какая частица делает вопрос «да/нет»?", "Қай шылау «иә/жоқ» сұрағын жасайды?"),
      options: [same("不"), same("吗"), same("的")],
      answer: 1,
      why: L("吗 (ma) at the end of a sentence turns it into a question.", "吗 (ma) в конце предложения превращает его в вопрос.", "Сөйлем соңындағы 吗 (ma) оны сұрақ етеді."),
    },
  },
  'es.words': {
    rule: L(
      "Learn Spanish words with the article: el for masculine, la for feminine. The ending -o is usually masculine, -a feminine.",
      "Учи испанские слова вместе с артиклем: el для мужского, la для женского рода. Окончание -o обычно мужского рода, -a - женского.",
      "Испан сөздерін артикльмен бірге үйрен: el - ер тегі, la - әйел тегі. -o жалғауы әдетте ер тегін, -a әйел тегін көрсетеді.",
    ),
    points: [
      L("casa - house, perro - dog, agua - water, libro - book.", "casa - дом, perro - собака, agua - вода, libro - книга.", "casa - үй, perro - ит, agua - су, libro - кітап."),
      L("Exceptions: el día (day), la mano (hand).", "Исключения: el día (день), la mano (рука).", "Ерекшеліктер: el día (күн), la mano (қол)."),
      L("Say the word aloud: h is silent (hola - «ola»).", "Произноси вслух: h не читается (hola - «ола»).", "Дауыстап айт: h оқылмайды (hola - «ола»)."),
    ],
    example: {
      q: same("el gato = ?"),
      steps: [
        L("gato ends with -o, a masculine noun.", "gato оканчивается на -o, мужской род.", "gato -o-мен аяқталады, ер тегі."),
        L("el gato means cat (кот, мысық).", "el gato - кот.", "el gato - мысық."),
      ],
    },
    check: {
      q: L("What does «agua» mean?", "Что значит «agua»?", "«Agua» нені білдіреді?"),
      options: [L("fire", "огонь", "от"), L("water", "вода", "су"), L("air", "воздух", "ауа")],
      answer: 1,
      why: L("Agua is water.", "Agua - вода.", "Agua - су."),
    },
  },
  'es.verbs': {
    rule: L(
      "Spanish verbs end in -ar, -er or -ir. Remove the ending and add the one for the person: yo, tú, él, nosotros, vosotros, ellos.",
      "Испанские глаголы оканчиваются на -ar, -er или -ir. Убери окончание и добавь то, что нужно для лица: yo, tú, él, nosotros, vosotros, ellos.",
      "Испан етістіктері -ar, -er немесе -ir-мен аяқталады. Жалғауды алып тастап, жаққа сай жалғауды қос: yo, tú, él, nosotros, vosotros, ellos.",
    ),
    points: [
      L("-ar: hablo, hablas, habla, hablamos, habláis, hablan.", "-ar: hablo, hablas, habla, hablamos, habláis, hablan.", "-ar: hablo, hablas, habla, hablamos, habláis, hablan."),
      L("-er: como, comes, come, comemos, coméis, comen.", "-er: como, comes, come, comemos, coméis, comen.", "-er: como, comes, come, comemos, coméis, comen."),
      L("-ir: vivo, vives, vive, vivimos, vivís, viven.", "-ir: vivo, vives, vive, vivimos, vivís, viven.", "-ir: vivo, vives, vive, vivimos, vivís, viven."),
      L("The pronoun is often dropped: hablo español.", "Местоимение часто опускают: hablo español.", "Есімдік жиі түсіріліп қалады: hablo español."),
    ],
    example: {
      q: same("(nosotros) ___ (comer)"),
      steps: [
        L("comer is an -er verb; the stem is com-.", "comer - глагол на -er; основа com-.", "comer - -er етістігі; түбірі com-."),
        L("Nosotros takes -emos: comemos.", "Для nosotros окончание -emos: comemos.", "Nosotros үшін -emos жалғауы: comemos."),
      ],
    },
    check: {
      q: L("Choose: Yo ___ (hablar) español.", "Выбери: Yo ___ (hablar) español.", "Таңда: Yo ___ (hablar) español."),
      options: [same("hablas"), same("hablo"), same("habla")],
      answer: 1,
      why: L("Yo with an -ar verb ends in -o.", "Для yo у глагола на -ar окончание -o.", "Yo үшін -ar етістігі -o-мен аяқталады."),
    },
  },
  'fr.words': {
    rule: L(
      "Learn French words with the article (le or la) because the gender must be remembered. Written French has silent endings: sound and spelling are different.",
      "Учи французские слова вместе с артиклем (le или la), потому что род нужно помнить. Во французском много непроизносимых окончаний: звучание и написание разные.",
      "Француз сөздерін артикльмен (le немесе la) бірге үйрен, себебі тегін есте сақтау керек. Француз тілінде айтылмайтын жалғаулар көп: айтылуы мен жазылуы әртүрлі.",
    ),
    points: [
      L("maison - house, chat - cat, eau - water, livre - book.", "maison - дом, chat - кошка/кот, eau - вода, livre - книга.", "maison - үй, chat - мысық, eau - су, livre - кітап."),
      L("The final consonant is often silent: petit [pəti], vous [vu].", "Конечная согласная часто не читается: petit [пти], vous [ву].", "Соңғы дауыссыз жиі оқылмайды: petit [пти], vous [ву]."),
      L("Before a vowel le/la becomes l': l'école.", "Перед гласной le/la превращается в l': l'école.", "Дауыстыдан бұрын le/la - l' болады: l'école."),
    ],
    example: {
      q: same("la maison = ?"),
      steps: [
        L("la shows a feminine noun.", "la показывает женский род.", "la әйел тегін көрсетеді."),
        L("La maison means the house.", "La maison - дом.", "La maison - үй."),
      ],
    },
    check: {
      q: L("What does «eau» mean?", "Что значит «eau»?", "«Eau» нені білдіреді?"),
      options: [L("egg", "яйцо", "жұмыртқа"), L("water", "вода", "су"), L("apple", "яблоко", "алма")],
      answer: 1,
      why: L("Eau [o] is water.", "Eau [о] - вода.", "Eau [о] - су."),
    },
  },
  'fr.verbs': {
    rule: L(
      "Regular French verbs end in -er, -ir or -re. Drop the ending and add the one for the person: je, tu, il, nous, vous, ils.",
      "Правильные французские глаголы оканчиваются на -er, -ir или -re. Убери окончание и добавь нужное для лица: je, tu, il, nous, vous, ils.",
      "Тұрақты француз етістіктері -er, -ir немесе -re-мен аяқталады. Жалғауды алып тастап, жаққа сай жалғауды қос: je, tu, il, nous, vous, ils.",
    ),
    points: [
      L("-er: parle, parles, parle, parlons, parlez, parlent.", "-er: parle, parles, parle, parlons, parlez, parlent.", "-er: parle, parles, parle, parlons, parlez, parlent."),
      L("-ir: finis, finis, finit, finissons, finissez, finissent.", "-ir: finis, finis, finit, finissons, finissez, finissent.", "-ir: finis, finis, finit, finissons, finissez, finissent."),
      L("Irregular: être - je suis, nous sommes; avoir - j'ai, nous avons.", "Неправильные: être - je suis, nous sommes; avoir - j'ai, nous avons.", "Тұрақсыз: être - je suis, nous sommes; avoir - j'ai, nous avons."),
    ],
    example: {
      q: same("nous ___ (parler)"),
      steps: [
        L("parler is an -er verb; the stem is parl-.", "parler - глагол на -er; основа parl-.", "parler - -er етістігі; түбірі parl-."),
        L("Nous takes -ons: nous parlons.", "Для nous окончание -ons: nous parlons.", "Nous үшін -ons жалғауы: nous parlons."),
      ],
    },
    check: {
      q: L("Choose: Ils ___ (parler) français.", "Выбери: Ils ___ (parler) français.", "Таңда: Ils ___ (parler) français."),
      options: [same("parle"), same("parlez"), same("parlent")],
      answer: 2,
      why: L("Ils takes -ent: ils parlent.", "Для ils окончание -ent: ils parlent.", "Ils үшін -ent жалғауы: ils parlent."),
    },
  },
  'zh.words': {
    rule: L(
      "Each Chinese character has a meaning and a pinyin reading with a tone mark. Learn the three together: character, pinyin, meaning.",
      "У каждого иероглифа есть значение и чтение пиньинь с тоном. Учи три вещи вместе: иероглиф, пиньинь, значение.",
      "Әр иероглифтің мағынасы мен тон белгісі бар пиньинь оқылуы болады. Үшеуін бірге үйрен: иероглиф, пиньинь, мағына.",
    ),
    points: [
      L("你 nǐ - you; 好 hǎo - good; 我 wǒ - I; 谢谢 xièxie - thank you.", "你 nǐ - ты; 好 hǎo - хороший; 我 wǒ - я; 谢谢 xièxie - спасибо.", "你 nǐ - сен; 好 hǎo - жақсы; 我 wǒ - мен; 谢谢 xièxie - рахмет."),
      L("The tone changes the meaning: mā 妈 mother, mǎ 马 horse.", "Тон меняет значение: mā 妈 мама, mǎ 马 лошадь.", "Тон мағынаны өзгертеді: mā 妈 ана, mǎ 马 жылқы."),
      L("Many characters have parts: 好 = 女 woman + 子 child.", "У многих иероглифов есть части: 好 = 女 женщина + 子 ребёнок.", "Көп иероглифтің бөліктері бар: 好 = 女 әйел + 子 бала."),
    ],
    example: {
      q: same("你好 nǐ hǎo = ?"),
      steps: [
        L("你 means «you», 好 means «good».", "你 - «ты», 好 - «хороший».", "你 - «сен», 好 - «жақсы»."),
        L("Together it is the greeting «hello».", "Вместе это приветствие «здравствуй».", "Бірге «сәлем» деген амандасу."),
      ],
    },
    check: {
      q: L("What does 谢谢 (xièxie) mean?", "Что значит 谢谢 (xièxie)?", "谢谢 (xièxie) нені білдіреді?"),
      options: [L("sorry", "извини", "кешір"), L("thank you", "спасибо", "рахмет"), L("goodbye", "до свидания", "сау бол")],
      answer: 1,
      why: L("谢谢 is «thank you».", "谢谢 - «спасибо».", "谢谢 - «рахмет»."),
    },
  },
  'ja.kana': {
    rule: L(
      "Japanese has two syllabic alphabets: hiragana for native words and grammar endings, katakana for loanwords and foreign names. Each sign is one syllable: か ka, き ki, く ku.",
      "В японском две слоговые азбуки: хирагана - для японских слов и окончаний, катакана - для заимствований и иностранных имён. Каждый знак - слог: か ka, き ki, く ku.",
      "Жапон тілінде екі буындық әліпби бар: хирагана - жапон сөздері мен жалғаулар үшін, катакана - кірме сөздер мен шетел есімдері үшін. Әр таңба - бір буын: か ka, き ki, く ku.",
    ),
    points: [
      L("Two dots (゛) make a sound voiced: か ka → が ga; a circle (゜) gives p: は ha → ぱ pa.", "Две чёрточки (゛) делают звук звонким: か ka → が ga; кружок (゜) даёт p: は ha → ぱ pa.", "Екі сызықша (゛) дыбысты ұяң етеді: か ka → が ga; дөңгелек (゜) p береді: は ha → ぱ pa."),
      L("A small ゃ, ゅ, ょ joins the sign before it: き + ゃ = きゃ kya.", "Маленькие ゃ, ゅ, ょ сливаются с предыдущим знаком: き + ゃ = きゃ kya.", "Кішкентай ゃ, ゅ, ょ алдыңғы таңбамен қосылады: き + ゃ = きゃ kya."),
      L("A small っ doubles the next consonant (きって kitte); in katakana ー makes the vowel long (コーヒー koohii).", "Маленькая っ удваивает следующий согласный (きって kitte); в катакане ー удлиняет гласный (コーヒー koohii).", "Кішкентай っ келесі дауыссызды қосарлайды (きって kitte); катаканада ー дауыстыны созады (コーヒー koohii)."),
    ],
    example: {
      q: same("ねこ = ?"),
      steps: [
        L("ね is ne, こ is ko.", "ね - ne, こ - ko.", "ね - ne, こ - ko."),
        L("Together: neko - a cat.", "Вместе: neko - «кошка».", "Бірге: neko - «мысық»."),
      ],
    },
    check: {
      q: L("How is the katakana word テレビ read?", "Как читается слово катаканой テレビ?", "Катаканамен жазылған テレビ сөзі қалай оқылады?"),
      options: [same("terebi"), same("tarebi"), same("tereba")],
      answer: 0,
      why: L("テ te, レ re, ビ bi: terebi - TV.", "テ te, レ re, ビ bi: terebi - «телевизор».", "テ te, レ re, ビ bi: terebi - «теледидар»."),
    },
  },
  'ja.words': {
    rule: L(
      "Japanese words are written with kanji and kana together: the kanji carries the meaning, the kana shows endings. At N5-N4 the reading is shown in brackets: 学校 (がっこう) - school.",
      "Японские слова пишут кандзи вместе с каной: иероглиф несёт смысл, кана показывает окончания. На уровнях N5-N4 чтение дано в скобках: 学校 (がっこう) - школа.",
      "Жапон сөздері кандзи мен канамен бірге жазылады: иероглиф мағына береді, кана жалғауды көрсетеді. N5-N4 деңгейлерінде оқылуы жақшада беріледі: 学校 (がっこう) - мектеп.",
    ),
    points: [
      L("Verbs end in -u in the dictionary: 食べる to eat, 飲む to drink, 行く to go.", "Глаголы в словаре оканчиваются на -u: 食べる есть, 飲む пить, 行く идти.", "Сөздікте етістіктер -u-мен аяқталады: 食べる жеу, 飲む ішу, 行く бару."),
      L("い-adjectives end in い (高い expensive); な-adjectives take な before a noun (静かな部屋 a quiet room).", "い-прилагательные оканчиваются на い (高い дорогой); な-прилагательные берут な перед существительным (静かな部屋 тихая комната).", "い-сын есімдер い-мен аяқталады (高い қымбат); な-сын есімдер зат есім алдында な алады (静かな部屋 тыныш бөлме)."),
    ],
    example: {
      q: same("毎日 (まいにち) = ?"),
      steps: [
        L("毎 means every, 日 means day.", "毎 - «каждый», 日 - «день».", "毎 - «әр», 日 - «күн»."),
        L("毎日 - every day.", "毎日 - «каждый день».", "毎日 - «күн сайын»."),
      ],
    },
    check: {
      q: L("What does 友達 (ともだち) mean?", "Что значит 友達 (ともだち)?", "友達 (ともだち) нені білдіреді?"),
      options: [L("teacher", "учитель", "мұғалім"), L("friend", "друг", "дос"), L("family", "семья", "отбасы")],
      answer: 1,
      why: L("友達 is a friend; a teacher is 先生, a family is 家族.", "友達 - «друг»; учитель - 先生, семья - 家族.", "友達 - «дос»; мұғалім - 先生, отбасы - 家族."),
    },
  },
  'ja.kanji': {
    rule: L(
      "A kanji usually has two kinds of reading: on (from Chinese, written in katakana in dictionaries) and kun (native Japanese, in hiragana). 山: サン in 富士山, やま on its own.",
      "У кандзи обычно два вида чтения: он (китайское, в словарях пишут катаканой) и кун (японское, хираганой). 山: サン в 富士山, やま отдельно.",
      "Кандзидің әдетте екі түрлі оқылуы болады: он (қытайша, сөздікте катаканамен) және кун (жапонша, хираганамен). 山: 富士山 сөзінде サン, жеке тұрса やま.",
    ),
    points: [
      L("In compounds of two kanji the on-reading is typical: 学校 がっこう.", "В словах из двух кандзи обычно онное чтение: 学校 がっこう.", "Екі кандзиден тұратын сөздерде әдетте он оқылуы: 学校 がっこう."),
      L("A kanji with kana after it usually has the kun-reading: 食べる たべる.", "Кандзи с каной после него обычно читается по куну: 食べる たべる.", "Артынан кана келген кандзи әдетте кун бойынша оқылады: 食べる たべる."),
      L("Many kanji are built from parts: 休 (rest) = 亻 person + 木 tree.", "Многие кандзи собраны из частей: 休 (отдыхать) = 亻 человек + 木 дерево.", "Көп кандзи бөліктерден құралған: 休 (демалу) = 亻 адам + 木 ағаш."),
    ],
    example: {
      q: same("日本 = ?"),
      steps: [
        L("日 is sun, 本 is origin.", "日 - «солнце», 本 - «основа, начало».", "日 - «күн», 本 - «түп, бастау»."),
        L("日本 (にほん) - «the origin of the sun», Japan.", "日本 (にほん) - «начало солнца», то есть Япония.", "日本 (にほん) - «күннің бастауы», яғни Жапония."),
      ],
    },
    check: {
      q: L("What does the kanji 水 mean?", "Что значит иероглиф 水?", "水 иероглифі нені білдіреді?"),
      options: [L("fire", "огонь", "от"), L("water", "вода", "су"), L("tree", "дерево", "ағаш")],
      answer: 1,
      why: L("水 (スイ, みず) is water; fire is 火, tree is 木.", "水 (スイ, みず) - «вода»; огонь - 火, дерево - 木.", "水 (スイ, みず) - «су»; от - 火, ағаш - 木."),
    },
  },
  'ja.bank': {
    rule: L(
      "Japanese word order is subject - object - verb, and particles after words show their role: は topic, が subject, を object, に time and destination, で place of action and means.",
      "Порядок слов в японском: подлежащее - дополнение - сказуемое, а частицы после слов показывают их роль: は тема, が подлежащее, を объект, に время и направление, で место действия и средство.",
      "Жапон тілінде сөз тәртібі: бастауыш - толықтауыш - баяндауыш, ал сөзден кейінгі шылаулар оның рөлін көрсетеді: は тақырып, が бастауыш, を тура толықтауыш, に уақыт пен бағыт, で әрекет орны мен құрал.",
    ),
    points: [
      L("Verbs come in groups: godan (書く → 書きます), ichidan (食べる → 食べます) and two irregular ones: する, 来る.", "Глаголы делятся на группы: годан (書く → 書きます), итидан (食べる → 食べます) и два неправильных: する, 来る.", "Етістіктер топтарға бөлінеді: годан (書く → 書きます), итидан (食べる → 食べます) және екі бұрыс етістік: する, 来る."),
      L("The て-form joins actions and makes requests: 待ってください - please wait.", "て-форма связывает действия и выражает просьбу: 待ってください - «подождите».", "て-формасы әрекеттерді байланыстырады және өтінішті білдіреді: 待ってください - «күте тұрыңыз»."),
      L("Keigo: honorific forms raise the listener (いらっしゃる), humble forms lower yourself (参る).", "Кэйго: почтительные формы возвышают собеседника (いらっしゃる), скромные принижают себя (参る).", "Кэйго: құрмет формалары тыңдаушыны көтереді (いらっしゃる), кішірейту формалары өзіңді төмен ұстайды (参る)."),
    ],
    example: {
      q: same("としょかん ___ べんきょうします。"),
      steps: [
        L("べんきょうします - an action (studying).", "べんきょうします - действие (занятия).", "べんきょうします - әрекет (сабақ оқу)."),
        L("The place of an action takes で: としょかんで.", "Место действия - с で: としょかんで.", "Әрекет орны で алады: としょかんで."),
      ],
    },
    check: {
      q: L("Choose: パン ___ たべます。", "Выбери: パン ___ たべます。", "Таңда: パン ___ たべます。"),
      options: [same("を"), same("に"), same("で")],
      answer: 0,
      why: L("The direct object takes を: パンを たべます - I eat bread.", "Прямое дополнение - с を: パンを たべます - «ем хлеб».", "Тура толықтауыш を алады: パンを たべます - «нан жеймін»."),
    },
  },
  'de.bank': {
    rule: L(
      "German nouns have three genders (der, die, das) and four cases. The article changes with the case: der Tisch - den Tisch - dem Tisch - des Tisches. The finite verb is always second in a main clause and last in a subordinate clause.",
      "В немецком три рода (der, die, das) и четыре падежа. Артикль меняется по падежам: der Tisch - den Tisch - dem Tisch - des Tisches. Спрягаемый глагол в главном предложении всегда на втором месте, в придаточном - в конце.",
      "Неміс тілінде үш тек (der, die, das) және төрт септік бар. Артикль септік бойынша өзгереді: der Tisch - den Tisch - dem Tisch - des Tisches. Жіктелетін етістік басыңқы сөйлемде әрқашан екінші орында, бағыныңқыда - соңында тұрады.",
    ),
    points: [
      L("A1-A2: sein and haben, Akkusativ after most verbs (ich sehe den Hund), Dativ after mit, bei, zu, helfen; Perfekt = haben/sein + Partizip II.", "A1-A2: sein и haben, Akkusativ после большинства глаголов (ich sehe den Hund), Dativ после mit, bei, zu, helfen; Perfekt = haben/sein + Partizip II.", "A1-A2: sein мен haben, етістіктердің көбінен кейін Akkusativ (ich sehe den Hund), mit, bei, zu, helfen-нен кейін Dativ; Perfekt = haben/sein + Partizip II."),
      L("B1-B2: weil/dass/ob send the verb to the end; wo? - Dativ, wohin? - Akkusativ; adjective endings; relative pronouns; passive werden + Partizip II; Konjunktiv II (hätte, wäre, würde).", "B1-B2: weil/dass/ob отправляют глагол в конец; wo? - Dativ, wohin? - Akkusativ; окончания прилагательных; относительные местоимения; пассив werden + Partizip II; Konjunktiv II (hätte, wäre, würde).", "B1-B2: weil/dass/ob етістікті соңына жібереді; wo? - Dativ, wohin? - Akkusativ; сын есім жалғаулары; қатыстық есімдіктер; ырықсыз етіс werden + Partizip II; Konjunktiv II (hätte, wäre, würde)."),
      L("C1-C2: Konjunktiv I in reported speech (er sei, er habe), participles as adjectives (das weinende Kind), double infinitive (hätte kommen sollen), fixed phrases and idioms.", "C1-C2: Konjunktiv I в косвенной речи (er sei, er habe), причастия как определения (das weinende Kind), двойной инфинитив (hätte kommen sollen), устойчивые выражения и идиомы.", "C1-C2: төлеу сөздегі Konjunktiv I (er sei, er habe), анықтауыш ретіндегі есімшелер (das weinende Kind), қос инфинитив (hätte kommen sollen), тұрақты тіркестер мен идиомалар."),
    ],
    example: {
      q: same("Ich bleibe zu Hause, weil ich krank ___. (sein)"),
      steps: [
        L("weil starts a subordinate clause, so the finite verb goes to the end.", "weil начинает придаточное, значит спрягаемый глагол уходит в конец.", "weil бағыныңқы сөйлемді бастайды, демек жіктелетін етістік соңына шығады."),
        L("For ich the form of sein is bin: ... weil ich krank bin.", "Для ich форма sein - bin: ... weil ich krank bin.", "ich үшін sein-нің түрі - bin: ... weil ich krank bin."),
      ],
    },
    check: {
      q: L("Choose: Ich fahre mit ___ Bus.", "Выбери: Ich fahre mit ___ Bus.", "Таңда: Ich fahre mit ___ Bus."),
      options: [same("den"), same("dem"), same("der")],
      answer: 1,
      why: L("mit always takes the dative; der Bus is masculine: mit dem Bus.", "После mit всегда Dativ; der Bus - мужского рода: mit dem Bus.", "mit-тен кейін әрқашан Dativ; der Bus - еркек тегі: mit dem Bus."),
    },
  },
  'de.words': {
    rule: L(
      "Learn every German noun together with its article and always write it with a capital letter: der Tisch, die Lampe, das Buch. The gender often does not match Russian or Kazakh logic, so the article is part of the word.",
      "Учи каждое немецкое существительное вместе с артиклем и пиши его с большой буквы: der Tisch, die Lampe, das Buch. Род часто не совпадает с русским, поэтому артикль - часть слова.",
      "Неміс тіліндегі әр зат есімді артиклімен бірге жатта және бас әріппен жаз: der Tisch, die Lampe, das Buch. Тегі орыс тіліндегіге сәйкес келе бермейді, сондықтан артикль - сөздің бөлігі.",
    ),
    points: [
      L("Usually feminine: words in -ung, -heit, -keit, -schaft, -ion and most nouns in -e: die Zeitung, die Freiheit, die Lampe.", "Обычно женского рода: слова на -ung, -heit, -keit, -schaft, -ion и большинство на -e: die Zeitung, die Freiheit, die Lampe.", "Әдетте әйел тегі: -ung, -heit, -keit, -schaft, -ion жұрнақты және -e-мен біткен сөздердің көбі: die Zeitung, die Freiheit, die Lampe."),
      L("Always neuter: diminutives in -chen and -lein (das Mädchen) and infinitives used as nouns (das Essen).", "Всегда среднего рода: уменьшительные на -chen и -lein (das Mädchen) и инфинитивы как существительные (das Essen).", "Әрқашан орта тек: -chen және -lein кішірейткіш сөздер (das Mädchen) және зат есімге айналған тұйық етістіктер (das Essen)."),
      L("Usually masculine: days, months, seasons and words in -er for people: der Montag, der Winter, der Lehrer.", "Обычно мужского рода: дни, месяцы, времена года и слова на -er о людях: der Montag, der Winter, der Lehrer.", "Әдетте еркек тегі: күндер, айлар, жыл мезгілдері және адамды білдіретін -er сөздері: der Montag, der Winter, der Lehrer."),
    ],
    example: {
      q: same("___ Zeitung"),
      steps: [
        L("The ending -ung almost always means a feminine noun.", "Окончание -ung почти всегда означает женский род.", "-ung жұрнағы әрдайым дерлік әйел тегін білдіреді."),
        L("So: die Zeitung (newspaper).", "Значит: die Zeitung (газета).", "Демек: die Zeitung (газет)."),
      ],
    },
    check: {
      q: L("Which article does «Mädchen» take?", "Какой артикль у слова «Mädchen»?", "«Mädchen» сөзінің артиклі қандай?"),
      options: [same("der"), same("die"), same("das")],
      answer: 2,
      why: L("Words in -chen are always neuter: das Mädchen (girl).", "Слова на -chen всегда среднего рода: das Mädchen (девочка).", "-chen-мен біткен сөздер әрқашан орта текте: das Mädchen (қыз бала)."),
    },
  },
  'de.verbs': {
    rule: L(
      "German verbs take the endings -e, -st, -t, -en, -t, -en in the present. Strong verbs change the vowel for du and er (fahren - du fährst), separable verbs send the prefix to the end (ich stehe früh auf).",
      "Немецкие глаголы в настоящем времени получают окончания -e, -st, -t, -en, -t, -en. Сильные глаголы меняют гласную у du и er (fahren - du fährst), отделяемые отправляют приставку в конец (ich stehe früh auf).",
      "Неміс етістіктері осы шақта -e, -st, -t, -en, -t, -en жалғауларын алады. Күшті етістіктер du мен er-де дауыстысын өзгертеді (fahren - du fährst), бөлінетіндер префиксті соңына жібереді (ich stehe früh auf).",
    ),
    points: [
      L("A1-A2: Präsens and modal verbs (ich kann, du musst); Perfekt with haben or sein: ich habe gespielt, ich bin gefahren.", "A1-A2: Präsens и модальные глаголы (ich kann, du musst); Perfekt с haben или sein: ich habe gespielt, ich bin gefahren.", "A1-A2: Präsens және модаль етістіктер (ich kann, du musst); haben не sein-мен Perfekt: ich habe gespielt, ich bin gefahren."),
      L("B1-B2: Präteritum (ich spielte, ich fuhr), Futur I (ich werde fahren), Plusquamperfekt (ich hatte gespielt), Konjunktiv II (ich würde fahren, ich wäre).", "B1-B2: Präteritum (ich spielte, ich fuhr), Futur I (ich werde fahren), Plusquamperfekt (ich hatte gespielt), Konjunktiv II (ich würde fahren, ich wäre).", "B1-B2: Präteritum (ich spielte, ich fuhr), Futur I (ich werde fahren), Plusquamperfekt (ich hatte gespielt), Konjunktiv II (ich würde fahren, ich wäre)."),
      L("C1-C2: past Konjunktiv II (ich hätte gespielt, ich wäre gefahren) and Konjunktiv I for reported speech (er komme, er sei).", "C1-C2: Konjunktiv II прошедшего (ich hätte gespielt, ich wäre gefahren) и Konjunktiv I для косвенной речи (er komme, er sei).", "C1-C2: өткен шақтағы Konjunktiv II (ich hätte gespielt, ich wäre gefahren) және төлеу сөзге арналған Konjunktiv I (er komme, er sei)."),
    ],
    example: {
      q: same("du ___ (fahren)"),
      steps: [
        L("fahren is a strong verb: a becomes ä for du and er.", "fahren - сильный глагол: у du и er a → ä.", "fahren - күшті етістік: du мен er-де a → ä."),
        L("du fährst, er fährt, but wir fahren.", "du fährst, er fährt, но wir fahren.", "du fährst, er fährt, бірақ wir fahren."),
      ],
    },
    check: {
      q: L("Choose: Gestern ___ ich ins Kino gegangen.", "Выбери: Gestern ___ ich ins Kino gegangen.", "Таңда: Gestern ___ ich ins Kino gegangen."),
      options: [same("habe"), same("bin"), same("hat")],
      answer: 1,
      why: L("gehen is a verb of movement, so its Perfekt takes sein: ich bin gegangen.", "gehen - глагол движения, его Perfekt образуется с sein: ich bin gegangen.", "gehen - қозғалыс етістігі, оның Perfekt-і sein-мен жасалады: ich bin gegangen."),
    },
  },
  'tr.bank': {
    rule: L(
      "Turkish, like Kazakh, adds suffixes to the end of a word, and every suffix follows vowel harmony: after a, ı, o, u - a back vowel, after e, i, ö, ü - a front one. ev-de (at home), okul-da (at school), kitap-ta (in the book).",
      "В турецком, как и в казахском, к концу слова добавляются окончания, и каждое подчиняется гармонии гласных: после a, ı, o, u - задний гласный, после e, i, ö, ü - передний. ev-de (дома), okul-da (в школе), kitap-ta (в книге).",
      "Түрік тілінде де, қазақ тіліндегідей, сөздің соңына жалғаулар жалғанады және әрқайсысы үндестік заңына бағынады: a, ı, o, u-дан кейін - жуан дауысты, e, i, ö, ü-ден кейін - жіңішке. ev-de (үйде), okul-da (мектепте), kitap-ta (кітапта).",
    ),
    points: [
      L("A1-A2: cases -e (to), -de (at), -den (from), -i (definite object), question particle mi/mı/mu/mü, possessives evim, evin, evi; after numbers - singular: iki kitap.", "A1-A2: падежи -e (куда), -de (где), -den (откуда), -i (определённый объект), частица mi/mı/mu/mü, притяжательные evim, evin, evi; после числительных - единственное число: iki kitap.", "A1-A2: септіктер -e (қайда), -de (қай жерде), -den (қайдан), -i (белгілі нысан), mi/mı/mu/mü шылауы, тәуелдік evim, evin, evi; сан есімнен кейін - жекеше: iki kitap (екі кітап)."),
      L("B1-B2: -meden önce / -dikten sonra, conditional -se, participles -en, -dik, -ecek (okuduğum kitap), passive -il and phrases like hem ... hem, ne ... ne.", "B1-B2: -meden önce / -dikten sonra, условное -se, причастия -en, -dik, -ecek (okuduğum kitap), пассив -il и пары hem ... hem, ne ... ne.", "B1-B2: -meden önce / -dikten sonra, шартты -se, -en, -dik, -ecek есімшелері (okuduğum kitap - оқыған кітабым), ырықсыз етіс -il және hem ... hem, ne ... ne."),
      L("C1-C2: causative -dir/-t, -dığı için, -masına rağmen, -dığı halde, unreal past -seydi, and proverbs.", "C1-C2: понудительный залог -dir/-t, -dığı için, -masına rağmen, -dığı halde, нереальное прошлое -seydi и пословицы.", "C1-C2: өзгелік етіс -dir/-t, -dığı için, -masına rağmen, -dığı halde, шындыққа жанаспайтын -seydi және мақалдар."),
    ],
    example: {
      q: same("Yarın ___ gidiyorum. (okul)"),
      steps: [
        L("Direction («where to?») takes the dative -e/-a.", "Направление («куда?») - дательный падеж -e/-a.", "Бағыт («қайда?») - барыс септік -e/-a (қазақшадағы -ға/-ге)."),
        L("The last vowel of okul is u, so -a: okula.", "Последняя гласная okul - u, значит -a: okula.", "okul сөзінің соңғы дауыстысы - u, демек -a: okula (мектепке)."),
      ],
    },
    check: {
      q: L("Choose: Bu çay sıcak ___?", "Выбери: Bu çay sıcak ___?", "Таңда: Bu çay sıcak ___?"),
      options: [same("mi"), same("mı"), same("mu")],
      answer: 1,
      why: L("The last vowel of sıcak is a, so the particle is mı.", "Последняя гласная sıcak - a, поэтому частица mı.", "sıcak сөзінің соңғы дауыстысы - a, сондықтан шылау mı."),
    },
  },
  'tr.words': {
    rule: L(
      "Turkish has no articles and no grammatical gender. Many words will look familiar to a Kazakh speaker (göz - көз, kar - қар, taş - тас), but always check the meaning: there are false friends.",
      "В турецком нет артиклей и рода. Многие слова похожи на казахские (göz - көз, kar - қар, taş - тас), но значение стоит проверять: бывают «ложные друзья».",
      "Түрік тілінде артикль де, тек те жоқ. Көп сөз қазақшаға ұқсас (göz - көз, kar - қар, taş - тас), бірақ мағынасын тексер: ұқсас болып көрінгенмен, мағынасы басқа сөздер де бар.",
    ),
    points: [
      L("Locative «in / at»: -da/-de by harmony, -ta/-te after f, s, t, k, ç, ş, h, p: evde, okulda, kitapta, sokakta.", "Местный падеж «в / на»: -da/-de по гармонии, -ta/-te после f, s, t, k, ç, ş, h, p: evde, okulda, kitapta, sokakta.", "Жатыс септік: үндестік бойынша -da/-de, f, s, t, k, ç, ş, h, p-дан кейін -ta/-te: evde, okulda, kitapta, sokakta - қазақшадағы үйде, кітапта сияқты."),
      L("Plural -lar/-ler: kitaplar, evler (like Kazakh -лар/-лер).", "Множественное -lar/-ler: kitaplar, evler (как в казахском -лар/-лер).", "Көпше -lar/-ler: kitaplar, evler (қазақшадағы -лар/-лер сияқты)."),
      L("Verbs are given in the infinitive -mak/-mek: okumak (to read), gelmek (to come).", "Глаголы даются в инфинитиве -mak/-mek: okumak (читать), gelmek (приходить).", "Етістіктер -mak/-mek тұйық түрінде беріледі: okumak (оқу), gelmek (келу)."),
    ],
    example: {
      q: same("sokak + -da/-de/-ta/-te = ?"),
      steps: [
        L("The last vowel is a, so the suffix has a.", "Последняя гласная a, значит в окончании a.", "Соңғы дауысты a, демек жалғауда a."),
        L("sokak ends in voiceless k, so d becomes t: sokakta (in the street).", "sokak оканчивается на глухую k, поэтому d → t: sokakta (на улице).", "sokak қатаң k-мен бітеді, сондықтан d → t: sokakta (көшеде)."),
      ],
    },
    check: {
      q: L("What does «göz» mean?", "Что значит «göz»?", "«göz» нені білдіреді?"),
      options: [L("ear", "ухо", "құлақ"), L("eye", "глаз", "көз"), L("hand", "рука", "қол")],
      answer: 1,
      why: L("göz is «eye» - the same word as Kazakh көз.", "göz - «глаз», то же слово, что казахское көз.", "göz - «көз», қазақ тіліндегі сөзбен бірдей."),
    },
  },
  'tr.verbs': {
    rule: L(
      "A Turkish verb is stem + tense suffix + personal ending, all by vowel harmony: gel-iyor-um (I am coming), gel-di-m (I came), gel-ecek-im → geleceğim (I will come). The pattern is very close to Kazakh: кел-ді-м.",
      "Турецкий глагол = основа + показатель времени + личное окончание, всё по гармонии: gel-iyor-um (я иду), gel-di-m (я пришёл), gel-ecek-im → geleceğim (я приду). Схема очень похожа на казахскую: кел-ді-м.",
      "Түрік етістігі = түбір + шақ жұрнағы + жіктік жалғау, бәрі үндестік бойынша: gel-iyor-um (келе жатырмын), gel-di-m (келдім), gel-ecek-im → geleceğim (келемін). Құрылымы қазақшаға өте жақын: кел-ді-м.",
    ),
    points: [
      L("A1-A2: present -iyor (geliyorum, gelmiyorum), past -di (geldim, yaptım, gittim), future -ecek (geleceğim, yapacağım).", "A1-A2: настоящее -iyor (geliyorum, gelmiyorum), прошедшее -di (geldim, yaptım, gittim), будущее -ecek (geleceğim, yapacağım).", "A1-A2: нақ осы шақ -iyor (geliyorum, gelmiyorum), өткен шақ -di (geldim, yaptım, gittim), келер шақ -ecek (geleceğim, yapacağım)."),
      L("B1-B2: aorist -ir/-er (gelirim), -miş (gelmiş), -ebil (gelebilirim), -meli (gelmeliyim), -se (gelsem), -iyordu (geliyordum).", "B1-B2: широкое -ir/-er (gelirim), -miş (gelmiş), -ebil (gelebilirim), -meli (gelmeliyim), -se (gelsem), -iyordu (geliyordum).", "B1-B2: ауыспалы -ir/-er (gelirim), -miş (gelmiş), -ebil (gelebilirim - келе аламын), -meli (gelmeliyim), -se (gelsem - келсем), -iyordu (geliyordum)."),
      L("C1-C2: -mişti (gelmiştim), -ecekti (gelecektim), -irse (gelirsem); irregular stems: git → gidiyor, et → ediyor, ye → yiyor.", "C1-C2: -mişti (gelmiştim), -ecekti (gelecektim), -irse (gelirsem); особые основы: git → gidiyor, et → ediyor, ye → yiyor.", "C1-C2: -mişti (gelmiştim), -ecekti (gelecektim), -irse (gelirsem); ерекше түбірлер: git → gidiyor, et → ediyor, ye → yiyor."),
    ],
    example: {
      q: same("Dün ben okula ___. (gitmek)"),
      steps: [
        L("Dün (yesterday) needs the past -di; git ends in voiceless t, so -ti.", "Dün (вчера) - прошедшее -di; git оканчивается на глухую t, поэтому -ti.", "Dün (кеше) - өткен шақ -di; git қатаң t-мен бітеді, сондықтан -ti."),
        L("For ben add -m: gittim (I went).", "Для ben добавляем -m: gittim (я пошёл).", "ben үшін -m қосамыз: gittim (бардым)."),
      ],
    },
    check: {
      q: L("Choose: Biz şimdi kitap ___. (okumak)", "Выбери: Biz şimdi kitap ___. (okumak)", "Таңда: Biz şimdi kitap ___. (okumak)"),
      options: [same("okuyorum"), same("okuyoruz"), same("okuyorlar")],
      answer: 1,
      why: L("biz (we) takes -uz after -iyor: okuyoruz.", "Для biz (мы) после -iyor окончание -uz: okuyoruz.", "biz үшін -iyor-дан кейін -uz жалғауы: okuyoruz (оқып жатырмыз)."),
    },
  },
  'ko.hangul': {
    rule: L(
      "Hangul is an alphabet: letters are grouped into syllable blocks. A block has a first consonant, a vowel and sometimes a final consonant (batchim): 한 = ㅎ h + ㅏ a + ㄴ n.",
      "Хангыль - это алфавит: буквы собираются в слоговые блоки. В блоке есть начальная согласная, гласная и иногда конечная согласная (патчхим): 한 = ㅎ h + ㅏ a + ㄴ n.",
      "Хангыль - әліпби: әріптер буын блоктарына жиналады. Блокта бастапқы дауыссыз, дауысты және кейде соңғы дауыссыз (патчхим) болады: 한 = ㅎ h + ㅏ a + ㄴ n.",
    ),
    points: [
      L("ㅇ at the start of a syllable is silent (아 = a), at the end it sounds ng (강 gang).", "ㅇ в начале слога не читается (아 = a), в конце звучит как ng (강 gang).", "Буын басындағы ㅇ оқылмайды (아 = a), соңында ng болып естіледі (강 gang)."),
      L("Vertical vowels (ㅏ ㅓ ㅣ) stand to the right of the consonant, horizontal ones (ㅗ ㅜ ㅡ) below it: 가, 고.", "Вертикальные гласные (ㅏ ㅓ ㅣ) пишутся справа от согласной, горизонтальные (ㅗ ㅜ ㅡ) - под ней: 가, 고.", "Тік дауыстылар (ㅏ ㅓ ㅣ) дауыссыздың оң жағына, көлденеңдері (ㅗ ㅜ ㅡ) астына жазылады: 가, 고."),
      L("Double consonants ㄲ ㄸ ㅃ ㅆ ㅉ are tense: kk, tt, pp, ss, jj.", "Двойные согласные ㄲ ㄸ ㅃ ㅆ ㅉ - напряжённые: kk, tt, pp, ss, jj.", "Қос дауыссыздар ㄲ ㄸ ㅃ ㅆ ㅉ - керілген: kk, tt, pp, ss, jj."),
    ],
    example: {
      q: same("나무 = ?"),
      steps: [
        L("나 = ㄴ n + ㅏ a, 무 = ㅁ m + ㅜ u.", "나 = ㄴ n + ㅏ a, 무 = ㅁ m + ㅜ u.", "나 = ㄴ n + ㅏ a, 무 = ㅁ m + ㅜ u."),
        L("Together: namu - a tree.", "Вместе: namu - «дерево».", "Бірге: namu - «ағаш»."),
      ],
    },
    check: {
      q: L("How is the syllable 서 read?", "Как читается слог 서?", "서 буыны қалай оқылады?"),
      options: [same("seo"), same("so"), same("su")],
      answer: 0,
      why: L("ㅅ is s, ㅓ is eo: 서 = seo.", "ㅅ - s, ㅓ - eo: 서 = seo.", "ㅅ - s, ㅓ - eo: 서 = seo."),
    },
  },
  'ko.words': {
    rule: L(
      "Most Korean words are native or come from Chinese characters. Verbs and adjectives end in 다 in the dictionary: 가다 to go, 크다 big.",
      "Корейские слова бывают исконные и пришедшие из китайских иероглифов. Глаголы и прилагательные в словаре оканчиваются на 다: 가다 идти, 크다 большой.",
      "Корей сөздері төл сөздер және қытай иероглифтерінен келген сөздер болып бөлінеді. Сөздікте етістіктер мен сын есімдер 다-мен аяқталады: 가다 бару, 크다 үлкен.",
    ),
    points: [
      L("Korean adjectives behave like verbs: 비싸요 means 'it is expensive'.", "Корейские прилагательные ведут себя как глаголы: 비싸요 - «дорого (стоит)».", "Корей сын есімдері етістік сияқты жіктеледі: 비싸요 - «қымбат»."),
      L("Many verbs are noun + 하다: 공부 study → 공부하다 to study.", "Много глаголов вида существительное + 하다: 공부 учёба → 공부하다 учиться.", "Көп етістік зат есім + 하다 түрінде: 공부 оқу → 공부하다 сабақ оқу."),
    ],
    example: {
      q: same("학교 = ?"),
      steps: [
        L("학교 (hakgyo) comes from Chinese 學校.", "학교 (hakgyo) - от китайского 學校.", "학교 (hakgyo) қытайдың 學校 сөзінен шыққан."),
        L("It means school.", "Значит «школа».", "Мағынасы - «мектеп»."),
      ],
    },
    check: {
      q: L("What does 친구 mean?", "Что значит 친구?", "친구 нені білдіреді?"),
      options: [L("teacher", "учитель", "мұғалім"), L("friend", "друг", "дос"), L("family", "семья", "отбасы")],
      answer: 1,
      why: L("친구 is a friend; a teacher is 선생님, a family is 가족.", "친구 - «друг»; учитель - 선생님, семья - 가족.", "친구 - «дос»; мұғалім - 선생님, отбасы - 가족."),
    },
  },
  'ko.bank': {
    rule: L(
      "Korean puts the verb at the end, and particles after nouns show their role: 은/는 topic, 이/가 subject, 을/를 object, 에 time and destination, 에서 place of action. The form depends on the last sound: 저는, 책은.",
      "В корейском глагол стоит в конце, а частицы после существительных показывают их роль: 은/는 тема, 이/가 подлежащее, 을/를 объект, 에 время и направление, 에서 место действия. Форма зависит от последнего звука: 저는, 책은.",
      "Корей тілінде етістік соңында тұрады, ал зат есімнен кейінгі шылаулар оның рөлін көрсетеді: 은/는 тақырып, 이/가 бастауыш, 을/를 толықтауыш, 에 уақыт пен бағыт, 에서 әрекет орны. Түрі соңғы дыбысқа байланысты: 저는, 책은.",
    ),
    points: [
      L("Polite present: stems with ㅏ/ㅗ take -아요, others -어요, 하다 → 해요: 가요, 먹어요, 공부해요.", "Вежливое настоящее: основы с ㅏ/ㅗ берут -아요, остальные -어요, 하다 → 해요: 가요, 먹어요, 공부해요.", "Сыпайы осы шақ: ㅏ/ㅗ бар түбір -아요, қалғаны -어요, 하다 → 해요: 가요, 먹어요, 공부해요."),
      L("Endings with (으) add 으 after a consonant: 가면, but 먹으면.", "Окончания с (으) добавляют 으 после согласной: 가면, но 먹으면.", "(으) бар жалғаулар дауыссыздан кейін 으 қосады: 가면, бірақ 먹으면."),
      L("Irregular stems: 듣다 → 들어요 (ㄷ), 춥다 → 추워요 (ㅂ), 모르다 → 몰라요 (르).", "Неправильные основы: 듣다 → 들어요 (ㄷ), 춥다 → 추워요 (ㅂ), 모르다 → 몰라요 (르).", "Бұрыс түбірлер: 듣다 → 들어요 (ㄷ), 춥다 → 추워요 (ㅂ), 모르다 → 몰라요 (르)."),
    ],
    example: {
      q: same("도서관___ 공부해요."),
      steps: [
        L("공부해요 is an action (studying).", "공부해요 - действие (занятия).", "공부해요 - әрекет (сабақ оқу)."),
        L("The place of an action takes 에서: 도서관에서.", "Место действия - с 에서: 도서관에서.", "Әрекет орны 에서 алады: 도서관에서."),
      ],
    },
    check: {
      q: L("Choose: 저는 빵___ 먹어요.", "Выбери: 저는 빵___ 먹어요.", "Таңда: 저는 빵___ 먹어요."),
      options: [same("을"), same("를"), same("에")],
      answer: 0,
      why: L("빵 ends in a consonant, so the object particle is 을.", "빵 оканчивается на согласную, поэтому частица объекта - 을.", "빵 дауыссызға бітеді, сондықтан толықтауыш шылауы - 을."),
    },
  },
};
