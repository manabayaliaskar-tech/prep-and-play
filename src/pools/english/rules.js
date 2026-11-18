// Правила английской грамматики для разборов: коротко, на трёх языках.

import { L } from '../gen.js';

export const RULES = {
  // ----- A1 -----
  be: L(
    'The verb "to be" in the present: I am, he/she/it is, we/you/they are.',
    'Глагол to be в настоящем времени: I am, he/she/it is, we/you/they are.',
    'To be етістігі осы шақта: I am, he/she/it is, we/you/they are.',
  ),
  ps3: L(
    'Present Simple: after he, she, it the verb takes -s or -es (plays, goes, watches).',
    'Present Simple: после he, she, it к глаголу добавляется -s или -es (plays, goes, watches).',
    'Present Simple: he, she, it есімдіктерінен кейін етістікке -s немесе -es жалғанады (plays, goes, watches).',
  ),
  psbase: L(
    'Present Simple: after I, you, we, they the verb has no ending.',
    'Present Simple: после I, you, we, they глагол стоит без окончания.',
    'Present Simple: I, you, we, they есімдіктерінен кейін етістікке жалғау қосылмайды.',
  ),
  psdo: L(
    'Questions and negatives in the Present Simple use do (I, you, we, they) or does (he, she, it) + the base form of the verb.',
    'Вопросы и отрицания в Present Simple строятся с do (I, you, we, they) или does (he, she, it) + глагол без окончания.',
    'Present Simple-дағы сұрақ пен болымсыз сөйлем do (I, you, we, they) немесе does (he, she, it) + етістіктің негізгі түрі арқылы жасалады.',
  ),
  prescont: L(
    'An action happening right now: am / is / are + verb-ing (Present Continuous).',
    'Действие, которое происходит прямо сейчас: am / is / are + глагол с -ing (Present Continuous).',
    'Дәл қазір болып жатқан іс-әрекет: am / is / are + -ing жалғаулы етістік (Present Continuous).',
  ),
  aan: L(
    'Use "a" before a consonant sound and "an" before a vowel sound, with singular countable nouns.',
    'Перед согласным звуком ставится a, перед гласным - an. Оба артикля - только с исчисляемыми существительными в единственном числе.',
    'Дауыссыз дыбыстың алдында a, дауысты дыбыстың алдында an қойылады. Екеуі де тек жекеше түрдегі саналатын зат есімдермен қолданылады.',
  ),
  someany: L(
    'Use "some" in positive sentences and offers, "any" in negatives and most questions.',
    'Some употребляется в утверждениях и предложениях что-то взять, any - в отрицаниях и большинстве вопросов.',
    'Some болымды сөйлемдер мен ұсыныстарда, any болымсыз сөйлемдер мен сұрақтардың көбінде қолданылады.',
  ),
  poss: L(
    'Before a noun use my, your, his, her, its, our, their. Without a noun use mine, yours, his, hers, ours, theirs.',
    'Перед существительным ставятся my, your, his, her, its, our, their. Без существительного - mine, yours, his, hers, ours, theirs.',
    'Зат есімнің алдында my, your, his, her, its, our, their қойылады. Зат есімсіз - mine, yours, his, hers, ours, theirs.',
  ),
  subjpron: L(
    'The subject of a sentence is I, you, he, she, it, we, they.',
    'Подлежащее в предложении - это I, you, he, she, it, we, they.',
    'Сөйлемнің бастауышы - I, you, he, she, it, we, they.',
  ),
  thereis: L(
    'There is + singular noun, there are + plural noun.',
    'There is - с единственным числом, there are - с множественным.',
    'There is - жекеше түрмен, there are - көпше түрмен қолданылады.',
  ),
  timeprep: L(
    'Time: at + clock time (at nine), on + day or date (on Sunday), in + month, year, part of the day (in May, in 2010).',
    'Время: at - с часами (at nine), on - с днями и датами (on Sunday), in - с месяцами, годами, частями дня (in May, in 2010).',
    'Уақыт: at - сағатпен (at nine), on - күн мен датамен (on Sunday), in - ай, жыл, тәулік бөлігімен (in May, in 2010).',
  ),
  placeprep: L(
    'Place: in + city, country or closed space; on + surface; at + point (at the airport, at school).',
    'Место: in - город, страна, замкнутое пространство; on - поверхность; at - точка (at the airport, at school).',
    'Орын: in - қала, ел, жабық кеңістік; on - бет; at - нүкте (at the airport, at school).',
  ),
  bytransport: L(
    'Means of transport: by bus, by car, by train (but: on foot).',
    'Способ передвижения: by bus, by car, by train (но: on foot).',
    'Көлік түрі: by bus, by car, by train (бірақ: on foot).',
  ),
  pluralirr: L(
    'Irregular plurals: child - children, tooth - teeth, woman - women, man - men, foot - feet.',
    'Неправильное множественное число: child - children, tooth - teeth, woman - women, man - men, foot - feet.',
    'Бұрыс көпше түр: child - children, tooth - teeth, woman - women, man - men, foot - feet.',
  ),
  muchmany: L(
    'How much - with uncountable nouns and prices, how many - with countable nouns.',
    'How much - с неисчисляемыми существительными и ценой, how many - с исчисляемыми.',
    'How much - саналмайтын зат есімдермен және бағамен, how many - саналатын зат есімдермен қолданылады.',
  ),
  can: L(
    'After can, could, must, should the verb has no "to" and no ending; these verbs do not take -s.',
    'После can, could, must, should глагол стоит без to и без окончаний; сами эти глаголы не принимают -s.',
    'Can, could, must, should етістіктерінен кейін етістік to-сыз және жалғаусыз тұрады; бұл етістіктерге -s жалғанбайды.',
  ),
  wh: L(
    'What asks about a thing, who about a person, where about a place, when about time, how about manner.',
    'What спрашивает о предмете, who - о человеке, where - о месте, when - о времени, how - о способе.',
    'What - зат туралы, who - адам туралы, where - орын туралы, when - уақыт туралы, how - тәсіл туралы сұрайды.',
  ),
  // ----- A2 -----
  pastirr: L(
    'Past Simple for a finished action at a known time (yesterday, last night, ago). Irregular verbs have a special second form: go - went, see - saw, do - did.',
    'Past Simple - для законченного действия в известный момент (yesterday, last night, ago). У неправильных глаголов особая вторая форма: go - went, see - saw, do - did.',
    'Past Simple - белгілі бір уақытта (yesterday, last night, ago) аяқталған іс-әрекет үшін. Бұрыс етістіктердің екінші түрі ерекше: go - went, see - saw, do - did.',
  ),
  did: L(
    'Past Simple questions and negatives use did / didn\'t + the base form of the verb.',
    'Вопросы и отрицания в Past Simple строятся с did / didn\'t + глагол в начальной форме.',
    'Past Simple-дағы сұрақ пен болымсыз сөйлем did / didn\'t + етістіктің негізгі түрі арқылы жасалады.',
  ),
  pastcont: L(
    'Past Continuous (was / were + verb-ing) describes an action in progress when another action happened.',
    'Past Continuous (was / were + глагол с -ing) описывает действие, которое длилось, когда произошло другое.',
    'Past Continuous (was / were + -ing жалғаулы етістік) басқа іс-әрекет болған кезде жалғасып жатқан іс-әрекетті сипаттайды.',
  ),
  will: L(
    'Use will + base form for predictions and opinions about the future (I think, probably).',
    'Will + глагол используется для предсказаний и мнений о будущем (I think, probably).',
    'Will + етістік болашақ туралы болжам мен пікір айтқанда қолданылады (I think, probably).',
  ),
  goingto: L(
    'Use be going to + base form for plans that are already decided.',
    'Be going to + глагол - для планов, которые уже решены.',
    'Be going to + етістік - алдын ала шешілген жоспарлар үшін.',
  ),
  ppexp: L(
    'Present Perfect (have / has + past participle) is used for life experience with ever and never.',
    'Present Perfect (have / has + третья форма глагола) используется для жизненного опыта с ever и never.',
    'Present Perfect (have / has + етістіктің үшінші түрі) ever және never сөздерімен өмірлік тәжірибе туралы айтқанда қолданылады.',
  ),
  comp: L(
    'Comparatives: short adjectives take -er (faster, heavier), long ones take more (more difficult). Good - better, bad - worse.',
    'Сравнительная степень: короткие прилагательные получают -er (faster, heavier), длинные - more (more difficult). Good - better, bad - worse.',
    'Салыстырмалы шырай: қысқа сын есімдерге -er жалғанады (faster, heavier), ұзындарына more қосылады (more difficult). Good - better, bad - worse.',
  ),
  superl: L(
    'Superlatives: the + -est for short adjectives (the tallest), the most for long ones. Good - the best.',
    'Превосходная степень: the + -est у коротких прилагательных (the tallest), the most - у длинных. Good - the best.',
    'Күшейтпелі шырай: қысқа сын есімдерде the + -est (the tallest), ұзындарында the most. Good - the best.',
  ),
  quant: L(
    'Much and a little go with uncountable nouns, many and a few with countable nouns. A lot of works with both.',
    'Much и a little - с неисчисляемыми существительными, many и a few - с исчисляемыми. A lot of подходит к обоим.',
    'Much пен a little - саналмайтын, many мен a few - саналатын зат есімдермен қолданылады. A lot of екеуіне де сәйкес келеді.',
  ),
  fixedprep: L(
    'Many adjectives and verbs take a fixed preposition that must be learned: interested in, good at, depend on, accused of, apologise for.',
    'У многих прилагательных и глаголов свой предлог, который нужно запомнить: interested in, good at, depend on, accused of, apologise for.',
    'Көптеген сын есімдер мен етістіктердің өз предлогы бар, оны жаттап алу керек: interested in, good at, depend on, accused of, apologise for.',
  ),
  must: L(
    'Must expresses a rule or strong obligation.',
    'Must выражает правило или строгую обязанность.',
    'Must ережені немесе қатаң міндетті білдіреді.',
  ),
  canperm: L(
    'Can I…? is used to ask for permission.',
    'Can I…? используется, чтобы попросить разрешения.',
    'Can I…? рұқсат сұрау үшін қолданылады.',
  ),
  should: L(
    'Should / shouldn\'t gives advice.',
    'Should / shouldn\'t используется для совета.',
    'Should / shouldn\'t кеңес беру үшін қолданылады.',
  ),
  couldpast: L(
    'Could is the past form of can and describes ability in the past.',
    'Could - прошедшая форма can, она описывает умение в прошлом.',
    'Could - can етістігінің өткен шақ түрі, өткендегі қабілетті сипаттайды.',
  ),
  eding: L(
    'Adjectives in -ed describe how a person feels (bored, interested); adjectives in -ing describe what causes the feeling (boring, interesting).',
    'Прилагательные на -ed описывают чувства человека (bored, interested), на -ing - то, что вызывает эти чувства (boring, interesting).',
    '-ed жалғаулы сын есімдер адамның сезімін (bored, interested), -ing жалғаулылары сол сезімді тудыратын нәрсені (boring, interesting) сипаттайды.',
  ),
  gerund: L(
    'After enjoy, suggest, deny, avoid, finish and after prepositions the verb takes -ing.',
    'После enjoy, suggest, deny, avoid, finish и после предлогов глагол стоит в форме с -ing.',
    'Enjoy, suggest, deny, avoid, finish етістіктерінен және предлогтардан кейін етістік -ing түрінде тұрады.',
  ),
  infin: L(
    'After want, promise, decide, hope, would like the verb takes to + base form.',
    'После want, promise, decide, hope, would like глагол стоит в форме to + инфинитив.',
    'Want, promise, decide, hope, would like етістіктерінен кейін to + инфинитив қолданылады.',
  ),
  // ----- B1 -----
  ppsince: L(
    'Present Perfect is used for a situation that started in the past and continues now, with for and since.',
    'Present Perfect используется для ситуации, которая началась в прошлом и продолжается сейчас, с for и since.',
    'Present Perfect өткенде басталып, қазір де жалғасып жатқан жағдай үшін for және since сөздерімен қолданылады.',
  ),
  yet: L(
    'Yet is used at the end of negatives and questions in the Present Perfect; already is used in positive sentences.',
    'Yet ставится в конце отрицаний и вопросов в Present Perfect, already - в утверждениях.',
    'Yet Present Perfect-тегі болымсыз сөйлем мен сұрақтың соңында, already болымды сөйлемде қолданылады.',
  ),
  pastperf: L(
    'Past Perfect (had + past participle) shows that one past action happened before another.',
    'Past Perfect (had + третья форма глагола) показывает, что одно действие в прошлом произошло раньше другого.',
    'Past Perfect (had + етістіктің үшінші түрі) өткендегі бір іс-әрекеттің екіншісінен бұрын болғанын көрсетеді.',
  ),
  usedto: L(
    'Used to + base form describes a past habit or state that is no longer true.',
    'Used to + глагол описывает привычку или состояние в прошлом, которых уже нет.',
    'Used to + етістік өткендегі, қазір жоқ әдетті немесе күйді сипаттайды.',
  ),
  futcont: L(
    'Future Continuous (will be + verb-ing) describes an action in progress at a certain moment in the future.',
    'Future Continuous (will be + глагол с -ing) описывает действие, которое будет длиться в определённый момент в будущем.',
    'Future Continuous (will be + -ing жалғаулы етістік) болашақтағы белгілі бір сәтте жалғасып жататын іс-әрекетті сипаттайды.',
  ),
  ppcont: L(
    'Present Perfect Continuous (have / has been + verb-ing) stresses how long an action has been going on.',
    'Present Perfect Continuous (have / has been + глагол с -ing) подчёркивает, как долго длится действие.',
    'Present Perfect Continuous (have / has been + -ing жалғаулы етістік) іс-әрекеттің қаншалықты ұзақ жалғасып жатқанын көрсетеді.',
  ),
  firsttime: L(
    'After "It\'s the first time…" use the Present Perfect.',
    'После It\'s the first time… используется Present Perfect.',
    'It\'s the first time… құрылымынан кейін Present Perfect қолданылады.',
  ),
  cond1: L(
    'First conditional (a real future situation): if + Present Simple, will + base form. After if and unless we do not use will.',
    'Условное первого типа (реальная ситуация в будущем): if + Present Simple, will + глагол. После if и unless will не ставится.',
    'Бірінші типті шартты сөйлем (болашақтағы нақты жағдай): if + Present Simple, will + етістік. If және unless сөздерінен кейін will қойылмайды.',
  ),
  cond2: L(
    'Second conditional (an unreal present situation): if + Past Simple, would + base form. With "to be" we say "If I were…".',
    'Условное второго типа (нереальная ситуация в настоящем): if + Past Simple, would + глагол. С глаголом to be говорят If I were…',
    'Екінші типті шартты сөйлем (осы шақтағы жалған жағдай): if + Past Simple, would + етістік. To be етістігімен If I were… делінеді.',
  ),
  wish: L(
    'I wish / If only + Past Simple (or could) for a present wish; + Past Perfect for a regret about the past.',
    'I wish / If only + Past Simple (или could) - желание о настоящем; + Past Perfect - сожаление о прошлом.',
    'I wish / If only + Past Simple (немесе could) - осы шақ туралы тілек; + Past Perfect - өткенге өкініш.',
  ),
  passive: L(
    'Passive voice: be in the right tense + past participle. It is used when the action matters more than who does it.',
    'Страдательный залог: be в нужном времени + третья форма глагола. Он нужен, когда важно действие, а не тот, кто его совершает.',
    'Ырықсыз етіс: тиісті шақтағы be + етістіктің үшінші түрі. Ол іс-әрекетті кім істегені емес, іс-әрекеттің өзі маңызды болғанда қолданылады.',
  ),
  donthave: L(
    'Don\'t have to = it is not necessary. Mustn\'t = it is forbidden.',
    'Don\'t have to = нет необходимости. Mustn\'t = запрещено.',
    'Don\'t have to = қажеті жоқ. Mustn\'t = тыйым салынған.',
  ),
  deduction: L(
    'Deductions about the present: must be (I am sure it is true), can\'t be (I am sure it is not true), might be (it is possible).',
    'Предположения о настоящем: must be (уверен, что это так), can\'t be (уверен, что это не так), might be (возможно).',
    'Осы шақ туралы болжам: must be (солай екеніне сенімдімін), can\'t be (олай емес екеніне сенімдімін), might be (мүмкін).',
  ),
  toing: L(
    'In "look forward to", "be used to", "object to" the word "to" is a preposition, so the verb takes -ing.',
    'В выражениях look forward to, be used to, object to слово to - предлог, поэтому после него глагол с -ing.',
    'Look forward to, be used to, object to тіркестерінде to - предлог, сондықтан одан кейін етістік -ing түрінде тұрады.',
  ),
  indirectq: L(
    'In indirect questions the word order is the same as in a statement: subject + verb, without do / did.',
    'В косвенных вопросах порядок слов как в утверждении: подлежащее + сказуемое, без do / did.',
    'Жанама сұрақтарда сөз тәртібі хабарлы сөйлемдегідей: бастауыш + баяндауыш, do / did қолданылмайды.',
  ),
  letmake: L(
    'After let and make (active) the verb has no "to": let me stay, make us write.',
    'После let и make (в активном залоге) глагол стоит без to: let me stay, make us write.',
    'Let және make етістіктерінен кейін (негізгі етісте) етістік to-сыз тұрады: let me stay, make us write.',
  ),
  reported: L(
    'In reported speech the tense moves one step back: Present → Past, Past → Past Perfect, will → would.',
    'В косвенной речи время сдвигается на шаг назад: Present → Past, Past → Past Perfect, will → would.',
    'Төлеу сөзде шақ бір саты артқа жылжиды: Present → Past, Past → Past Perfect, will → would.',
  ),
  // ----- B2 -----
  futperf: L(
    'Future Perfect (will have + past participle) describes an action that will be finished before a moment in the future.',
    'Future Perfect (will have + третья форма глагола) описывает действие, которое завершится к определённому моменту в будущем.',
    'Future Perfect (will have + етістіктің үшінші түрі) болашақтағы белгілі бір сәтке дейін аяқталатын іс-әрекетті сипаттайды.',
  ),
  pastperfcont: L(
    'Past Perfect Continuous (had been + verb-ing) describes an action that lasted up to a moment in the past.',
    'Past Perfect Continuous (had been + глагол с -ing) описывает действие, которое длилось до определённого момента в прошлом.',
    'Past Perfect Continuous (had been + -ing жалғаулы етістік) өткендегі белгілі бір сәтке дейін жалғасқан іс-әрекетті сипаттайды.',
  ),
  hightime: L(
    'After "It\'s (high) time" and "would rather + person" use the Past Simple, although the meaning is present.',
    'После It\'s (high) time и would rather + человек используется Past Simple, хотя речь о настоящем.',
    'It\'s (high) time және would rather + адам құрылымдарынан кейін мағынасы осы шақ болса да Past Simple қолданылады.',
  ),
  cond3: L(
    'Third conditional (an unreal past situation): if + Past Perfect, would have + past participle.',
    'Условное третьего типа (нереальная ситуация в прошлом): if + Past Perfect, would have + третья форма глагола.',
    'Үшінші типті шартты сөйлем (өткендегі жалған жағдай): if + Past Perfect, would have + етістіктің үшінші түрі.',
  ),
  condmixed: L(
    'Mixed conditional: a past condition with a present result - if + Past Perfect, would + base form.',
    'Смешанное условное: условие в прошлом, результат в настоящем - if + Past Perfect, would + глагол.',
    'Аралас шартты сөйлем: шарт өткенде, нәтиже осы шақта - if + Past Perfect, would + етістік.',
  ),
  condinv: L(
    'In formal conditionals "if" can be dropped and the auxiliary moves to the front: Had I known…, Should you need…, Were he to ask…',
    'В формальных условных предложениях if можно опустить, а вспомогательный глагол вынести вперёд: Had I known…, Should you need…, Were he to ask…',
    'Ресми шартты сөйлемдерде if түсіріліп, көмекші етістік алға шығады: Had I known…, Should you need…, Were he to ask…',
  ),
  passinf: L(
    'After "is said / believed / thought" use to + base form for the present and to have + past participle for an earlier action.',
    'После is said / believed / thought используется to + глагол для настоящего и to have + третья форма для более раннего действия.',
    'Is said / believed / thought құрылымынан кейін осы шақ үшін to + етістік, ертерек болған іс-әрекет үшін to have + үшінші түр қолданылады.',
  ),
  causative: L(
    'Have / get something done: someone else does the job for us (have my car repaired).',
    'Have / get something done: действие для нас выполняет кто-то другой (have my car repaired).',
    'Have / get something done: іс-әрекетті біз үшін басқа біреу орындайды (have my car repaired).',
  ),
  passcont: L(
    'Passive in the continuous tenses: am / is / are being + past participle.',
    'Страдательный залог в длительном времени: am / is / are being + третья форма глагола.',
    'Созылыңқы шақтағы ырықсыз етіс: am / is / are being + етістіктің үшінші түрі.',
  ),
  passgerund: L(
    'Passive -ing form: being + past participle (She hates being told what to do).',
    'Страдательная форма с -ing: being + третья форма глагола (She hates being told what to do).',
    'Ырықсыз -ing түрі: being + етістіктің үшінші түрі (She hates being told what to do).',
  ),
  remember: L(
    'Remember / forget + to do = about a future duty. Remember / forget + doing = about a memory of the past.',
    'Remember / forget + to do - о том, что нужно сделать. Remember / forget + doing - о воспоминании.',
    'Remember / forget + to do - істелуге тиіс іс туралы. Remember / forget + doing - естелік туралы.',
  ),
  whether: L(
    'Reported yes / no questions are introduced by if or whether, with statement word order.',
    'Косвенные общие вопросы вводятся словами if или whether, порядок слов - как в утверждении.',
    'Жанама жалпы сұрақтар if немесе whether сөздерімен басталады, сөз тәртібі хабарлы сөйлемдегідей.',
  ),
  modalperf: L(
    'Modal + have + past participle talks about the past: should have (it was a mistake not to), must have (I am sure it happened), can\'t have (I am sure it did not), needn\'t have (it was done but was unnecessary).',
    'Модальный глагол + have + третья форма говорит о прошлом: should have (зря не сделал), must have (уверен, что было), can\'t have (уверен, что не было), needn\'t have (сделал, но было не нужно).',
    'Модаль етістік + have + үшінші түр өткен шақ туралы айтады: should have (істемегені қате), must have (болғанына сенімдімін), can\'t have (болмағанына сенімдімін), needn\'t have (істелді, бірақ қажет емес еді).',
  ),
  theinstr: L(
    'Use "the" with musical instruments: play the violin, play the piano.',
    'С музыкальными инструментами употребляется the: play the violin, play the piano.',
    'Музыкалық аспаптармен the қолданылады: play the violin, play the piano.',
  ),
  despite: L(
    'Despite and in spite of are followed by a noun or an -ing form, not by a clause.',
    'После despite и in spite of стоит существительное или форма с -ing, а не придаточное предложение.',
    'Despite пен in spite of сөздерінен кейін бағыныңқы сөйлем емес, зат есім немесе -ing түрі тұрады.',
  ),
  // ----- C1-C2 -----
  inversion: L(
    'After negative or limiting adverbials at the start of a sentence (never, not only, little, hardly, no sooner, not until) the auxiliary comes before the subject.',
    'После отрицательных и ограничительных оборотов в начале предложения (never, not only, little, hardly, no sooner, not until) вспомогательный глагол ставится перед подлежащим.',
    'Сөйлем басындағы болымсыз немесе шектеуші оралымдардан кейін (never, not only, little, hardly, no sooner, not until) көмекші етістік бастауыштың алдына қойылады.',
  ),
  hardly: L(
    'Hardly / scarcely … when, no sooner … than: fixed pairs, with Past Perfect and inversion.',
    'Hardly / scarcely … when, no sooner … than - устойчивые пары, с Past Perfect и инверсией.',
    'Hardly / scarcely … when, no sooner … than - тұрақты жұптар, Past Perfect және инверсиямен қолданылады.',
  ),
  subjunctive: L(
    'After recommend, suggest, insist, demand + that the verb is in the base form for every person (that he be, that she go).',
    'После recommend, suggest, insist, demand + that глагол стоит в начальной форме для любого лица (that he be, that she go).',
    'Recommend, suggest, insist, demand + that құрылымынан кейін етістік барлық жақта негізгі түрде тұрады (that he be, that she go).',
  ),
  concession: L(
    'Concession with fronting: adjective / verb + as / though + subject + verb (Strange as it may seem; Try as he might).',
    'Уступительный оборот с выносом вперёд: прилагательное / глагол + as / though + подлежащее + сказуемое (Strange as it may seem; Try as he might).',
    'Алға шығарылған қарсылықты оралым: сын есім / етістік + as / though + бастауыш + баяндауыш (Strange as it may seem; Try as he might).',
  ),
  cleft: L(
    'Cleft sentences give emphasis: It was … that …; What I need is …',
    'Расщеплённые предложения выделяют главное: It was … that …; What I need is …',
    'Жіктелген сөйлемдер ең маңыздыны ерекшелейді: It was … that …; What I need is …',
  ),
  sosuch: L(
    'So + adjective + be + subject … that; Such + be + noun phrase … that - emphatic inversion.',
    'So + прилагательное + be + подлежащее … that; Such + be + существительное … that - эмфатическая инверсия.',
    'So + сын есім + be + бастауыш … that; Such + be + зат есім … that - эмфатикалық инверсия.',
  ),
  rather: L(
    'Would rather / would sooner + base form (same subject); would rather + person + Past Simple (different subject).',
    'Would rather / would sooner + глагол без to (тот же субъект); would rather + человек + Past Simple (другой субъект).',
    'Would rather / would sooner + to-сыз етістік (сол субъект); would rather + адам + Past Simple (басқа субъект).',
  ),
  nopoint: L(
    'Fixed patterns: there is no point in doing, be bound to do, be due to do.',
    'Устойчивые конструкции: there is no point in doing, be bound to do, be due to do.',
    'Тұрақты құрылымдар: there is no point in doing, be bound to do, be due to do.',
  ),
  fixedform: L(
    'A fixed formal expression: come what may, be that as it may, far be it from me, suffice it to say.',
    'Устойчивое книжное выражение: come what may, be that as it may, far be it from me, suffice it to say.',
    'Тұрақты кітаби тіркес: come what may, be that as it may, far be it from me, suffice it to say.',
  ),
  butfor: L(
    'But for + noun = if it had not been for; the main clause takes would have + past participle.',
    'But for + существительное = если бы не; в главной части - would have + третья форма глагола.',
    'But for + зат есім = егер … болмағанда; басыңқы бөлікте would have + етістіктің үшінші түрі қолданылады.',
  ),
  asthough: L(
    'As if / as though + Past Simple describes something unreal in the present.',
    'As if / as though + Past Simple описывает нечто нереальное в настоящем.',
    'As if / as though + Past Simple осы шақтағы шындыққа жанаспайтын нәрсені сипаттайды.',
  ),
  wordform: L(
    'Look at the gap: decide which part of speech is needed and whether the meaning is positive or negative, then choose the right suffix or prefix.',
    'Посмотри на пропуск: определи, какая часть речи нужна и положительное или отрицательное значение, затем выбери суффикс или приставку.',
    'Бос орынға қара: қай сөз табы керек екенін және мағынасы болымды ма, болымсыз ба - соны анықтап, жұрнақ немесе қосымшаны таңда.',
  ),
};
