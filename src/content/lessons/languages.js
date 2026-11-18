// Мини-уроки по испанскому, французскому и китайскому (темы es.*, fr.*, zh.*). Формат - в index.js.

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
};
