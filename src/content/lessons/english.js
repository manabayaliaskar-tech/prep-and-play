// Мини-уроки по английскому (темы e.*). Формат - в index.js.

import { L, same } from '../../pools/gen.js';

export default {
  'e.basics': {
    rule: L(
      "The verb to be changes with the subject: I am, he/she/it is, you/we/they are. Nouns usually add -s for the plural.",
      "Глагол to be меняется вместе с подлежащим: I am, he/she/it is, you/we/they are. Существительные обычно получают -s во множественном числе.",
      "To be етістігі бастауышқа қарай өзгереді: I am, he/she/it is, you/we/they are. Зат есімдер көпше түрде әдетте -s жалғауын алады.",
    ),
    points: [
      L("Pronouns: I, you, he, she, it, we, they. Possessive: my, your, his, her, its, our, their.", "Местоимения: I, you, he, she, it, we, they. Притяжательные: my, your, his, her, its, our, their.", "Есімдіктер: I, you, he, she, it, we, they. Тәуелдік: my, your, his, her, its, our, their."),
      L("Irregular plurals: child - children, man - men, foot - feet.", "Особые множественные: child - children, man - men, foot - feet.", "Ерекше көпше: child - children, man - men, foot - feet."),
      L("Add -es after s, x, ch, sh: box - boxes.", "После s, x, ch, sh добавляем -es: box - boxes.", "s, x, ch, sh-тан кейін -es қосылады: box - boxes."),
    ],
    example: {
      q: same("She ___ a student. (be)"),
      steps: [
        L("The subject is she, so we need the form for he/she/it.", "Подлежащее she, значит нужна форма для he/she/it.", "Бастауыш she, демек he/she/it формасы керек."),
        L("That form is is: She is a student.", "Эта форма is: She is a student.", "Бұл форма is: She is a student."),
      ],
    },
    check: {
      q: L("Choose the correct form: They ___ at home.", "Выбери верную форму: They ___ at home.", "Дұрыс форманы таңда: They ___ at home."),
      options: [same("is"), same("are"), same("am")],
      answer: 1,
      why: L("They goes with are.", "С they используется are.", "They-мен are қолданылады."),
    },
  },
  'e.tenses': {
    rule: L(
      "The tense shows when the action happens and how. Present Simple is for habits and facts, Past Simple for finished actions, Present Perfect links the past with now.",
      "Время показывает, когда и как происходит действие. Present Simple - привычки и факты, Past Simple - завершённые действия, Present Perfect связывает прошлое с настоящим.",
      "Шақ әрекеттің қашан және қалай болатынын көрсетеді. Present Simple - әдеттер мен фактілер, Past Simple - аяқталған әрекет, Present Perfect өткенді қазіргімен байланыстырады.",
    ),
    points: [
      L("Present Simple: he works (add -s). Past Simple: worked / went.", "Present Simple: he works (добавляем -s). Past Simple: worked / went.", "Present Simple: he works (-s қосамыз). Past Simple: worked / went."),
      L("Present Continuous: am/is/are + -ing (now). Present Perfect: have/has + V3.", "Present Continuous: am/is/are + -ing (сейчас). Present Perfect: have/has + V3.", "Present Continuous: am/is/are + -ing (қазір). Present Perfect: have/has + V3."),
      L("Signal words: yesterday - Past Simple; just, already, ever - Present Perfect.", "Слова-подсказки: yesterday - Past Simple; just, already, ever - Present Perfect.", "Белгі сөздер: yesterday - Past Simple; just, already, ever - Present Perfect."),
    ],
    example: {
      q: same("I ___ (see) this film yesterday."),
      steps: [
        L("Yesterday points to a finished moment in the past.", "Yesterday указывает на завершённый момент в прошлом.", "Yesterday өткендегі аяқталған сәтті көрсетеді."),
        L("Use Past Simple: I saw this film yesterday.", "Используем Past Simple: I saw this film yesterday.", "Past Simple қолданамыз: I saw this film yesterday."),
      ],
    },
    check: {
      q: L("Which sentence is correct?", "Какое предложение верно?", "Қай сөйлем дұрыс?"),
      options: [same("She go to school every day."), same("She goes to school every day."), same("She is go to school every day.")],
      answer: 1,
      why: L("Present Simple with she needs -s: goes.", "В Present Simple с she нужен -s: goes.", "Present Simple-де she-мен -s керек: goes."),
    },
  },
  'e.det': {
    rule: L(
      "Use a/an with a singular countable noun mentioned for the first time, the for something specific. Comparing: short adjectives take -er/-est, long ones take more/most.",
      "A/an ставим перед исчисляемым существительным в единственном числе при первом упоминании, the - для конкретного предмета. Сравнение: короткие прилагательные получают -er/-est, длинные - more/most.",
      "A/an алғаш рет аталған жекеше саналатын зат есімнің алдында, the - нақты зат үшін қойылады. Салыстыру: қысқа сын есімдерге -er/-est, ұзындарына more/most қосылады.",
    ),
    points: [
      L("An before a vowel sound: an apple, an hour.", "An перед гласным звуком: an apple, an hour.", "Дауысты дыбыстың алдында an: an apple, an hour."),
      L("Countable: many, few. Uncountable: much, little. Both: a lot of.", "Исчисляемые: many, few. Неисчисляемые: much, little. Оба: a lot of.", "Саналатын: many, few. Саналмайтын: much, little. Екеуіне де: a lot of."),
      L("Superlative needs the: the tallest.", "Превосходная степень требует the: the tallest.", "Күрделі шырай the-мен: the tallest."),
    ],
    example: {
      q: same("There isn't ___ milk in the fridge."),
      steps: [
        L("Milk is uncountable, so many is wrong.", "Milk неисчисляемое, поэтому many не подходит.", "Milk саналмайды, сондықтан many болмайды."),
        L("In negatives we use much: There isn't much milk.", "В отрицании используем much: There isn't much milk.", "Болымсыз сөйлемде much қолданамыз: There isn't much milk."),
      ],
    },
    check: {
      q: L("Choose: He is ___ boy in the class.", "Выбери: He is ___ boy in the class.", "Таңда: He is ___ boy in the class."),
      options: [same("tall"), same("taller"), same("the tallest")],
      answer: 2,
      why: L("In the class means the highest degree: the tallest.", "In the class - высшая степень: the tallest.", "In the class - күрделі шырай: the tallest."),
    },
  },
  'e.prep': {
    rule: L(
      "Prepositions show time, place and direction. Learn them in common pairs, not word by word.",
      "Предлоги показывают время, место и направление. Учи их в устойчивых парах, а не слово в слово.",
      "Предлогтар уақытты, орынды және бағытты көрсетеді. Оларды сөзбе-сөз емес, тұрақты тіркестермен үйрен.",
    ),
    points: [
      L("Time: at 5 o'clock, on Monday, in May / in 2020.", "Время: at 5 o'clock, on Monday, in May / in 2020.", "Уақыт: at 5 o'clock, on Monday, in May / in 2020."),
      L("Place: at the door, on the table, in the room.", "Место: at the door, on the table, in the room.", "Орын: at the door, on the table, in the room."),
      L("Fixed: interested in, good at, afraid of, depend on.", "Устойчивые: interested in, good at, afraid of, depend on.", "Тұрақты: interested in, good at, afraid of, depend on."),
    ],
    example: {
      q: same("My birthday is ___ June."),
      steps: [
        L("June is a month. Months take in.", "June - месяц. С месяцами используем in.", "June - ай. Айлармен in қолданылады."),
        L("My birthday is in June.", "My birthday is in June.", "My birthday is in June."),
      ],
    },
    check: {
      q: L("Choose: The meeting is ___ Friday.", "Выбери: The meeting is ___ Friday.", "Таңда: The meeting is ___ Friday."),
      options: [same("in"), same("at"), same("on")],
      answer: 2,
      why: L("Days of the week take on.", "С днями недели используется on.", "Апта күндерімен on қолданылады."),
    },
  },
  'e.modal': {
    rule: L(
      "Modal verbs (can, must, should, may) are followed by the base verb without to. They show ability, obligation, advice or permission.",
      "После модальных глаголов (can, must, should, may) идёт инфинитив без to. Они выражают возможность, долженствование, совет или разрешение.",
      "Модал етістіктерден (can, must, should, may) кейін to-сыз етістік тұрады. Олар мүмкіндікті, міндетті, кеңесті немесе рұқсатты білдіреді.",
    ),
    points: [
      L("Can - ability; may - permission; must - strong obligation; should - advice.", "Can - умение; may - разрешение; must - строгий долг; should - совет.", "Can - қабілет; may - рұқсат; must - қатаң міндет; should - кеңес."),
      L("No -s after he/she: He can swim.", "Нет -s после he/she: He can swim.", "He/she-ден кейін -s жоқ: He can swim."),
      L("Mustn't = forbidden; don't have to = not necessary.", "Mustn't = запрещено; don't have to = не обязательно.", "Mustn't = тыйым; don't have to = міндетті емес."),
    ],
    example: {
      q: same("You ___ smoke here. It's forbidden."),
      steps: [
        L("Forbidden means a prohibition.", "Forbidden - это запрет.", "Forbidden - тыйым."),
        L("Prohibition is mustn't: You mustn't smoke here.", "Запрет - mustn't: You mustn't smoke here.", "Тыйым - mustn't: You mustn't smoke here."),
      ],
    },
    check: {
      q: L("Which is correct?", "Что верно?", "Қайсысы дұрыс?"),
      options: [same("He can to swim."), same("He cans swim."), same("He can swim.")],
      answer: 2,
      why: L("After can we use the base verb, no to and no -s.", "После can идёт глагол без to и без -s.", "Can-нан кейін to мен -s жоқ етістік келеді."),
    },
  },
  'e.struct': {
    rule: L(
      "Conditionals link a condition and a result: if + Present Simple, will + verb (real); if + Past Simple, would + verb (unreal). Passive is be + V3.",
      "Условные предложения связывают условие и результат: if + Present Simple, will + глагол (реальное); if + Past Simple, would + глагол (нереальное). Пассив - be + V3.",
      "Шартты сөйлем шарт пен нәтижені байланыстырады: if + Present Simple, will + етістік (нақты); if + Past Simple, would + етістік (нақты емес). Passive - be + V3.",
    ),
    points: [
      L("First: If it rains, we will stay home.", "Первый тип: If it rains, we will stay home.", "Бірінші түрі: If it rains, we will stay home."),
      L("Second: If I had time, I would help.", "Второй тип: If I had time, I would help.", "Екінші түрі: If I had time, I would help."),
      L("Passive: The book was written in 1990.", "Пассив: The book was written in 1990.", "Passive: The book was written in 1990."),
      L("Some verbs take -ing (enjoy), others to (want).", "Одни глаголы требуют -ing (enjoy), другие - to (want).", "Кейбір етістіктер -ing (enjoy), басқалары to (want) талап етеді."),
    ],
    example: {
      q: same("If I ___ (be) you, I would study more."),
      steps: [
        L("The result is would, so this is the second conditional.", "В результате would - это второй тип.", "Нәтижесінде would бар - бұл екінші түрі."),
        L("After if we use Past Simple; with I we say were: If I were you.", "После if нужен Past Simple; с I говорят were: If I were you.", "If-тен кейін Past Simple; I-мен were айтылады: If I were you."),
      ],
    },
    check: {
      q: L("Choose: The window ___ by Tom yesterday.", "Выбери: The window ___ by Tom yesterday.", "Таңда: The window ___ by Tom yesterday."),
      options: [same("broke"), same("was broken"), same("is breaking")],
      answer: 1,
      why: L("The window did not act; passive past is was + V3.", "Окно не действует; пассив в прошлом - was + V3.", "Терезе әрекет жасамайды; өткен шақтағы passive - was + V3."),
    },
  },
  'e.adv': {
    rule: L(
      "Advanced structures give style and precision: reported speech, relative clauses, inversion, wish and mixed conditionals. Watch how the tense shifts.",
      "Продвинутые конструкции дают точность и стиль: косвенная речь, определительные придаточные, инверсия, wish и смешанные условные. Следи за сдвигом времён.",
      "Күрделі құрылымдар дәлдік пен стиль береді: төл сөз бен төлеу сөз, анықтауыш сөйлем, инверсия, wish және аралас шартты сөйлем. Шақтың ығысуын бақыла.",
    ),
    points: [
      L("Reported speech: tenses go back - \"I am tired\" → He said he was tired.", "Косвенная речь: время сдвигается назад - \"I am tired\" → He said he was tired.", "Төлеу сөзде шақ артқа ығысады - \"I am tired\" → He said he was tired."),
      L("Wish about the present: I wish I had more time.", "Wish о настоящем: I wish I had more time.", "Қазіргі туралы wish: I wish I had more time."),
      L("Inversion: Never have I seen it.", "Инверсия: Never have I seen it.", "Инверсия: Never have I seen it."),
      L("Who/that for people, which/that for things.", "Who/that - о людях, which/that - о предметах.", "Who/that - адамдарға, which/that - заттарға."),
    ],
    example: {
      q: same("She said: \"I live in Rome.\" → She said she ___ in Rome."),
      steps: [
        L("In reported speech the present moves to the past.", "В косвенной речи настоящее переходит в прошедшее.", "Төлеу сөзде осы шақ өткен шаққа ауысады."),
        L("live becomes lived: She said she lived in Rome.", "live превращается в lived: She said she lived in Rome.", "live - lived болады: She said she lived in Rome."),
      ],
    },
    check: {
      q: L("Choose: I wish I ___ taller.", "Выбери: I wish I ___ taller.", "Таңда: I wish I ___ taller."),
      options: [same("am"), same("will be"), same("were")],
      answer: 2,
      why: L("Wish about the present takes the past form: were.", "Wish о настоящем требует прошедшую форму: were.", "Қазіргі туралы wish өткен форманы талап етеді: were."),
    },
  },
  'e.vocab': {
    rule: L(
      "Vocabulary is learned best in context. Think about the topic, then pick the word that fits the meaning and the other words around it.",
      "Лексику лучше учить в контексте. Определи тему, затем выбери слово, подходящее по смыслу и по соседним словам.",
      "Лексиканы контексте үйрену тиімді. Тақырыпты анықта, сосын мағынасы мен көрші сөздерге сай келетін сөзді таңда.",
    ),
    points: [
      L("Learn collocations: make a decision, do homework.", "Учи сочетания слов: make a decision, do homework.", "Сөз тіркестерін үйрен: make a decision, do homework."),
      L("Watch false friends: actual means real, not current.", "Остерегайся ложных друзей: actual значит «настоящий», а не «текущий».", "Жалған достардан сақ бол: actual - «шын», «ағымдағы» емес."),
      L("Use the sentence: a word after the article is usually a noun.", "Смотри на предложение: слово после артикля - обычно существительное.", "Сөйлемге қара: артикльден кейінгі сөз - әдетте зат есім."),
    ],
    example: {
      q: same("I need to ___ a decision soon."),
      steps: [
        L("Decision goes with the verb make, not do.", "Со словом decision используется make, а не do.", "Decision сөзімен make қолданылады, do емес."),
        L("Answer: make.", "Ответ: make.", "Жауабы: make."),
      ],
    },
    check: {
      q: L("Which word means «big»?", "Какое слово значит «большой»?", "Қай сөз «үлкен» дегенді білдіреді?"),
      options: [same("tiny"), same("huge"), same("narrow")],
      answer: 1,
      why: L("Huge means very big; tiny means very small.", "Huge - очень большой; tiny - очень маленький.", "Huge - өте үлкен; tiny - өте кішкентай."),
    },
  },
  'e.phrasal': {
    rule: L(
      "A phrasal verb is a verb plus a small word, and the meaning often changes: give up means stop. Idioms mean something different from their separate words.",
      "Фразовый глагол - это глагол плюс короткое слово, и значение часто меняется: give up значит «бросить». Идиомы значат не то, что их слова по отдельности.",
      "Фразалды етістік - етістік пен қысқа сөз, мағынасы жиі өзгереді: give up - «тастау». Идиомалар жеке сөздерінің мағынасынан бөлек мағына береді.",
    ),
    points: [
      L("look after = take care of; look for = search; look up = find in a book.", "look after = заботиться; look for = искать; look up = найти в справочнике.", "look after = күту; look for = іздеу; look up = анықтамадан табу."),
      L("Idiom: it's raining cats and dogs = it rains very hard.", "Идиома: it's raining cats and dogs = льёт как из ведра.", "Идиома: it's raining cats and dogs = нөсер жауып тұр."),
      L("Learn the whole phrase, not the parts.", "Учи фразу целиком, а не по частям.", "Тіркесті бөлшектеп емес, тұтас үйрен."),
    ],
    example: {
      q: same("Please turn ___ the light. It's dark."),
      steps: [
        L("We need to start the light.", "Нужно включить свет.", "Жарықты қосу керек."),
        L("Turn on = switch on: Please turn on the light.", "Turn on = включить: Please turn on the light.", "Turn on = қосу: Please turn on the light."),
      ],
    },
    check: {
      q: L("What does «give up» mean?", "Что значит «give up»?", "«Give up» нені білдіреді?"),
      options: [same("to stop trying"), same("to give a present"), same("to stand up")],
      answer: 0,
      why: L("Give up means to stop trying or quit.", "Give up - перестать пытаться, бросить.", "Give up - әрекетті тоқтату, тастау."),
    },
  },
  'e.wordform': {
    rule: L(
      "Many words are made from a root with a prefix or suffix. The suffix often shows the part of speech: -tion makes a noun, -ful an adjective, -ly an adverb.",
      "Многие слова образуются от корня с приставкой или суффиксом. Суффикс часто показывает часть речи: -tion - существительное, -ful - прилагательное, -ly - наречие.",
      "Көп сөздер түбірге жұрнақ немесе префикс қосып жасалады. Жұрнақ сөз табын көрсетеді: -tion - зат есім, -ful - сын есім, -ly - үстеу.",
    ),
    points: [
      L("Prefixes: un-, dis-, re- (unhappy, disagree, rewrite).", "Приставки: un-, dis-, re- (unhappy, disagree, rewrite).", "Префикстер: un-, dis-, re- (unhappy, disagree, rewrite)."),
      L("Noun suffixes: -ment, -ness, -er (agreement, kindness, teacher).", "Суффиксы существительных: -ment, -ness, -er (agreement, kindness, teacher).", "Зат есім жұрнақтары: -ment, -ness, -er (agreement, kindness, teacher)."),
      L("First decide which part of speech the gap needs.", "Сначала определи, какая часть речи нужна на месте пропуска.", "Алдымен бос орынға қандай сөз табы керек екенін анықта."),
    ],
    example: {
      q: same("He speaks very ___ (quiet)."),
      steps: [
        L("The gap needs an adverb that describes the verb speaks.", "На месте пропуска нужно наречие к глаголу speaks.", "Бос орынға speaks етістігін сипаттайтын үстеу керек."),
        L("Add -ly: He speaks very quietly.", "Добавим -ly: He speaks very quietly.", "-ly қосамыз: He speaks very quietly."),
      ],
    },
    check: {
      q: L("Make a noun from «happy».", "Образуй существительное от «happy».", "«Happy» сөзінен зат есім жаса."),
      options: [same("happily"), same("happiness"), same("unhappy")],
      answer: 1,
      why: L("Happy + -ness = happiness (y turns into i).", "Happy + -ness = happiness (y меняется на i).", "Happy + -ness = happiness (y - i болады)."),
    },
  },
  'e.words': {
    rule: L(
      "Learn a new word with its meaning, part of speech and a short example. Say it aloud and use it in your own sentence.",
      "Новое слово учи со значением, частью речи и коротким примером. Произнеси его вслух и составь своё предложение.",
      "Жаңа сөзді мағынасымен, сөз табымен және қысқа мысалмен үйрен. Дауыстап айт және өз сөйлемінді құра.",
    ),
    points: [
      L("Group words by topic: food, travel, school.", "Группируй слова по темам: food, travel, school.", "Сөздерді тақырып бойынша топтастыр: food, travel, school."),
      L("Note the pair: word + translation both ways.", "Запоминай пару в обе стороны: слово - перевод и обратно.", "Екі бағытта есте сақта: сөз - аударма және керісінше."),
      L("Repeat after a day, then after a week.", "Повтори через день, потом через неделю.", "Бір күннен, сосын бір аптадан кейін қайтала."),
    ],
    example: {
      q: same("apple - ?"),
      steps: [
        L("Recall the picture of the fruit.", "Представь картинку этого фрукта.", "Осы жемістің суретін көз алдыңа келтір."),
        L("Apple means яблоко (alma).", "Apple - яблоко.", "Apple - алма."),
      ],
    },
    check: {
      q: L("What does «window» mean?", "Что значит «window»?", "«Window» нені білдіреді?"),
      options: [L("door", "дверь", "есік"), L("window", "окно", "терезе"), L("wall", "стена", "қабырға")],
      answer: 1,
      why: L("Window is the opening in a wall for light.", "Window - окно.", "Window - терезе."),
    },
  },
  'e.gram': {
    rule: L(
      "Read the whole sentence and find the time clue: every day, now, yesterday, since, tomorrow. The clue tells you the tense.",
      "Прочитай предложение целиком и найди подсказку времени: every day, now, yesterday, since, tomorrow. Она подскажет время.",
      "Сөйлемді түгел оқы да уақыт белгісін тап: every day, now, yesterday, since, tomorrow. Ол шақты көрсетеді.",
    ),
    points: [
      L("every day, usually - Present Simple; now, at the moment - Present Continuous.", "every day, usually - Present Simple; now, at the moment - Present Continuous.", "every day, usually - Present Simple; now, at the moment - Present Continuous."),
      L("yesterday, ago, in 2010 - Past Simple; since, for, already - Present Perfect.", "yesterday, ago, in 2010 - Past Simple; since, for, already - Present Perfect.", "yesterday, ago, in 2010 - Past Simple; since, for, already - Present Perfect."),
      L("tomorrow, next week - will + verb.", "tomorrow, next week - will + глагол.", "tomorrow, next week - will + етістік."),
    ],
    example: {
      q: same("Look! It ___ (rain)."),
      steps: [
        L("Look! shows something happening right now.", "Look! показывает действие прямо сейчас.", "Look! дәл қазір болып жатқан әрекетті көрсетеді."),
        L("Present Continuous: It is raining.", "Present Continuous: It is raining.", "Present Continuous: It is raining."),
      ],
    },
    check: {
      q: L("Choose: I ___ here since 2020.", "Выбери: I ___ here since 2020.", "Таңда: I ___ here since 2020."),
      options: [same("live"), same("lived"), same("have lived")],
      answer: 2,
      why: L("Since with a starting point needs Present Perfect.", "Since с точкой отсчёта требует Present Perfect.", "Since бастау нүктесімен Present Perfect талап етеді."),
    },
  },
  'e.irreg': {
    rule: L(
      "Irregular verbs do not add -ed. They have three forms: V1 (go), V2 past (went), V3 participle (gone). Just learn them.",
      "Неправильные глаголы не получают -ed. У них три формы: V1 (go), V2 прошедшее (went), V3 причастие (gone). Их нужно выучить.",
      "Тұрақсыз етістіктер -ed алмайды. Олардың үш формасы бар: V1 (go), V2 өткен шақ (went), V3 есімше (gone). Оларды жаттау керек.",
    ),
    points: [
      L("go - went - gone; see - saw - seen; take - took - taken.", "go - went - gone; see - saw - seen; take - took - taken.", "go - went - gone; see - saw - seen; take - took - taken."),
      L("Some do not change: cut - cut - cut; put - put - put.", "Некоторые не меняются: cut - cut - cut; put - put - put.", "Кейбіреуі өзгермейді: cut - cut - cut; put - put - put."),
      L("Past Simple uses V2; have/has uses V3.", "Past Simple берёт V2; have/has берёт V3.", "Past Simple V2 алады; have/has V3 алады."),
    ],
    example: {
      q: same("I have ___ (write) a letter."),
      steps: [
        L("Have needs the third form V3.", "После have нужна третья форма V3.", "Have-тен кейін үшінші форма V3 керек."),
        L("write - wrote - written: I have written a letter.", "write - wrote - written: I have written a letter.", "write - wrote - written: I have written a letter."),
      ],
    },
    check: {
      q: L("What is the past simple of «buy»?", "Какое прошедшее время глагола «buy»?", "«Buy» етістігінің өткен шағы қандай?"),
      options: [same("buyed"), same("bought"), same("boughten")],
      answer: 1,
      why: L("Buy - bought - bought.", "Buy - bought - bought.", "Buy - bought - bought."),
    },
  },
  'e.comp': {
    rule: L(
      "Short adjectives add -er and -est (fast - faster - the fastest). Long ones use more and most (more interesting). Use than after the comparative.",
      "Короткие прилагательные получают -er и -est (fast - faster - the fastest). Длинные - more и most (more interesting). После сравнительной степени ставим than.",
      "Қысқа сын есімдер -er және -est алады (fast - faster - the fastest). Ұзындары more және most алады (more interesting). Салыстырмалы шырайдан кейін than қойылады.",
    ),
    points: [
      L("Spelling: big - bigger, happy - happier.", "Правописание: big - bigger, happy - happier.", "Емлесі: big - bigger, happy - happier."),
      L("Irregular: good - better - the best; bad - worse - the worst.", "Исключения: good - better - the best; bad - worse - the worst.", "Ерекшеліктер: good - better - the best; bad - worse - the worst."),
      L("Never mix: not more bigger.", "Не смешивай: нельзя more bigger.", "Араластырма: more bigger деуге болмайды."),
    ],
    example: {
      q: same("This book is ___ than that one. (interesting)"),
      steps: [
        L("Interesting is long (4 syllables), so use more.", "Interesting длинное, поэтому используем more.", "Interesting ұзын сөз, сондықтан more қолданамыз."),
        L("Answer: more interesting.", "Ответ: more interesting.", "Жауабы: more interesting."),
      ],
    },
    check: {
      q: L("Choose: Today is ___ than yesterday.", "Выбери: Today is ___ than yesterday.", "Таңда: Today is ___ than yesterday."),
      options: [same("more hot"), same("hotter"), same("hottest")],
      answer: 1,
      why: L("Hot is short, so hotter (double t).", "Hot короткое слово: hotter (двойная t).", "Hot қысқа сөз: hotter (қос t)."),
    },
  },
  'e.ukus': {
    rule: L(
      "British and American English are one language with small differences: some words (flat - apartment), spelling (colour - color) and a few grammar habits (have got - have). Both are correct; just don't mix them in one text.",
      "Британский и американский английский - один язык с небольшими различиями: некоторые слова (flat - apartment), написание (colour - color) и немного грамматики (have got - have). Оба варианта правильные, просто не смешивай их в одном тексте.",
      "Британ және американ ағылшыны - кішкене айырмашылықтары бар бір тіл: кейбір сөздер (flat - apartment), жазылуы (colour - color) және аздаған грамматика (have got - have). Екеуі де дұрыс, тек бір мәтінде араластырма.",
    ),
    points: [
      L("Spelling: -our / -or, -re / -er, -ise / -ize, travelled / traveled.", "Написание: -our / -or, -re / -er, -ise / -ize, travelled / traveled.", "Жазылуы: -our / -or, -re / -er, -ise / -ize, travelled / traveled."),
      L("Words: lift - elevator, holiday - vacation, autumn - fall, rubbish - garbage.", "Слова: lift - elevator, holiday - vacation, autumn - fall, rubbish - garbage.", "Сөздер: lift - elevator, holiday - vacation, autumn - fall, rubbish - garbage."),
      L("Exams: IELTS and Cambridge are usually British, TOEFL and SAT - American; both spellings are accepted if you are consistent.", "Экзамены: IELTS и Cambridge обычно британские, TOEFL и SAT - американские; любое написание засчитают, если оно одинаковое во всём тексте.", "Емтихандар: IELTS пен Cambridge көбіне британдық, TOEFL мен SAT - американдық; бүкіл мәтінде бірдей болса, кез келген жазылу есептеледі."),
    ],
    example: {
      q: same("I live on the 5th floor, so I take the ___ (UK) / ___ (US)."),
      steps: [
        L("The machine that carries people between floors.", "Кабина, которая возит людей между этажами.", "Адамдарды қабаттар арасында тасымалдайтын кабина."),
        L("British: lift. American: elevator.", "Британское: lift. Американское: elevator.", "Британша: lift. Американша: elevator."),
      ],
    },
    check: {
      q: L("Which spelling is American?", "Какое написание американское?", "Қай жазылу американдық?"),
      options: [same("centre"), same("center"), same("centere")],
      answer: 1,
      why: L("-re in British English becomes -er in American: centre - center.", "Британское -re в американском становится -er: centre - center.", "Британдық -re американ тілінде -er болады: centre - center."),
    },
  },
};
