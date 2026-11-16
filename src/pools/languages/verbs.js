// Спряжение глаголов испанского и французского по временам.
// Правильные глаголы спрягаются по правилам, у неправильных формы записаны полностью.
// Два вида заданий: «какая форма подходит к лицу» и «какое время нужно по смыслу» (подсказка — слово-маркер).

import { pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';

// ---------- Испанский ----------
// Лица: yo, tú, él/ella/usted, nosotros, ellos/ellas/ustedes (vosotros в Латинской Америке не используется).

const ES_END = {
  pres: { ar: ['o', 'as', 'a', 'amos', 'an'], er: ['o', 'es', 'e', 'emos', 'en'], ir: ['o', 'es', 'e', 'imos', 'en'] },
  pret: { ar: ['é', 'aste', 'ó', 'amos', 'aron'], er: ['í', 'iste', 'ió', 'imos', 'ieron'], ir: ['í', 'iste', 'ió', 'imos', 'ieron'] },
  imp: { ar: ['aba', 'abas', 'aba', 'ábamos', 'aban'], er: ['ía', 'ías', 'ía', 'íamos', 'ían'], ir: ['ía', 'ías', 'ía', 'íamos', 'ían'] },
  subj: { ar: ['e', 'es', 'e', 'emos', 'en'], er: ['a', 'as', 'a', 'amos', 'an'], ir: ['a', 'as', 'a', 'amos', 'an'] },
  impsubj: { ar: ['ara', 'aras', 'ara', 'áramos', 'aran'], er: ['iera', 'ieras', 'iera', 'iéramos', 'ieran'], ir: ['iera', 'ieras', 'iera', 'iéramos', 'ieran'] },
};
const FUT = ['é', 'ás', 'á', 'emos', 'án'];
const COND = ['ía', 'ías', 'ía', 'íamos', 'ían'];

/** Правильные испанские глаголы без чередований: [инфинитив, дополнение, en, ru, kk]. */
const ES_REGULAR = [
  ['hablar', 'con mis amigos', 'to speak', 'говорить', 'сөйлеу'],
  ['trabajar', 'en la oficina', 'to work', 'работать', 'жұмыс істеу'],
  ['estudiar', 'matemáticas', 'to study', 'учиться, изучать', 'оқу, зерттеу'],
  ['cantar', 'una canción', 'to sing', 'петь', 'ән айту'],
  ['bailar', 'en la fiesta', 'to dance', 'танцевать', 'билеу'],
  ['caminar', 'por el parque', 'to walk', 'гулять пешком', 'жаяу жүру'],
  ['comprar', 'fruta', 'to buy', 'покупать', 'сатып алу'],
  ['cocinar', 'la cena', 'to cook', 'готовить', 'тамақ пісіру'],
  ['escuchar', 'música', 'to listen', 'слушать', 'тыңдау'],
  ['mirar', 'la televisión', 'to watch', 'смотреть', 'қарау'],
  ['nadar', 'en el lago', 'to swim', 'плавать', 'жүзу'],
  ['viajar', 'a España', 'to travel', 'путешествовать', 'саяхаттау'],
  ['ayudar', 'a mi madre', 'to help', 'помогать', 'көмектесу'],
  ['preparar', 'el desayuno', 'to prepare', 'готовить', 'дайындау'],
  ['limpiar', 'la casa', 'to clean', 'убирать', 'жинау'],
  ['llamar', 'a la abuela', 'to call', 'звонить', 'қоңырау шалу'],
  ['tomar', 'un café', 'to take, to drink', 'брать, пить', 'алу, ішу'],
  ['visitar', 'el museo', 'to visit', 'посещать', 'бару, көру'],
  ['esperar', 'el autobús', 'to wait', 'ждать', 'күту'],
  ['ganar', 'el partido', 'to win', 'выигрывать', 'жеңу'],
  ['terminar', 'el proyecto', 'to finish', 'заканчивать', 'аяқтау'],
  ['lavar', 'los platos', 'to wash', 'мыть', 'жуу'],
  ['necesitar', 'ayuda', 'to need', 'нуждаться', 'қажет ету'],
  ['olvidar', 'las llaves', 'to forget', 'забывать', 'ұмыту'],
  ['descansar', 'en casa', 'to rest', 'отдыхать', 'демалу'],
  ['comer', 'pescado', 'to eat', 'есть', 'жеу'],
  ['beber', 'agua', 'to drink', 'пить', 'ішу'],
  ['aprender', 'inglés', 'to learn', 'учить', 'үйрену'],
  ['comprender', 'la lección', 'to understand', 'понимать', 'түсіну'],
  ['correr', 'en el parque', 'to run', 'бегать', 'жүгіру'],
  ['vender', 'el coche', 'to sell', 'продавать', 'сату'],
  ['responder', 'a la pregunta', 'to answer', 'отвечать', 'жауап беру'],
  ['vivir', 'en Almaty', 'to live', 'жить', 'тұру'],
  ['escribir', 'una carta', 'to write', 'писать', 'жазу'],
  ['abrir', 'la ventana', 'to open', 'открывать', 'ашу'],
  ['recibir', 'un regalo', 'to receive', 'получать', 'алу'],
  ['decidir', 'el plan', 'to decide', 'решать', 'шешу'],
  ['subir', 'la montaña', 'to climb', 'подниматься', 'шығу'],
  ['compartir', 'la comida', 'to share', 'делиться', 'бөлісу'],
  ['asistir', 'a clase', 'to attend', 'посещать', 'қатысу'],
];

/**
 * Неправильные испанские глаголы: только те времена, что отличаются от правил.
 * fut — основа будущего и условного (tendr-), остальные — пять форм.
 */
const ES_IRREGULAR = {
  ser: { obj: 'muy feliz', en: 'to be', ru: 'быть', kk: 'болу', pres: 'soy eres es somos son', pret: 'fui fuiste fue fuimos fueron', imp: 'era eras era éramos eran', subj: 'sea seas sea seamos sean', impsubj: 'fuera fueras fuera fuéramos fueran' },
  estar: { obj: 'en casa', en: 'to be (location, state)', ru: 'находиться, быть', kk: 'болу, орналасу', pres: 'estoy estás está estamos están', pret: 'estuve estuviste estuvo estuvimos estuvieron', subj: 'esté estés esté estemos estén', impsubj: 'estuviera estuvieras estuviera estuviéramos estuvieran' },
  ir: { obj: 'al cine', en: 'to go', ru: 'идти, ехать', kk: 'бару', pres: 'voy vas va vamos van', pret: 'fui fuiste fue fuimos fueron', imp: 'iba ibas iba íbamos iban', subj: 'vaya vayas vaya vayamos vayan', impsubj: 'fuera fueras fuera fuéramos fueran' },
  tener: { obj: 'mucho trabajo', en: 'to have', ru: 'иметь', kk: 'ие болу', pres: 'tengo tienes tiene tenemos tienen', pret: 'tuve tuviste tuvo tuvimos tuvieron', fut: 'tendr', subj: 'tenga tengas tenga tengamos tengan', impsubj: 'tuviera tuvieras tuviera tuviéramos tuvieran' },
  hacer: { obj: 'los deberes', en: 'to do, to make', ru: 'делать', kk: 'істеу', pres: 'hago haces hace hacemos hacen', pret: 'hice hiciste hizo hicimos hicieron', fut: 'har', subj: 'haga hagas haga hagamos hagan', impsubj: 'hiciera hicieras hiciera hiciéramos hicieran' },
  poder: { obj: 'venir', en: 'can, to be able', ru: 'мочь', kk: 'алу (істей алу)', pres: 'puedo puedes puede podemos pueden', pret: 'pude pudiste pudo pudimos pudieron', fut: 'podr', subj: 'pueda puedas pueda podamos puedan', impsubj: 'pudiera pudieras pudiera pudiéramos pudieran' },
  querer: { obj: 'un helado', en: 'to want', ru: 'хотеть', kk: 'қалау', pres: 'quiero quieres quiere queremos quieren', pret: 'quise quisiste quiso quisimos quisieron', fut: 'querr', subj: 'quiera quieras quiera queramos quieran', impsubj: 'quisiera quisieras quisiera quisiéramos quisieran' },
  decir: { obj: 'la verdad', en: 'to say, to tell', ru: 'говорить, сказать', kk: 'айту', pres: 'digo dices dice decimos dicen', pret: 'dije dijiste dijo dijimos dijeron', fut: 'dir', subj: 'diga digas diga digamos digan', impsubj: 'dijera dijeras dijera dijéramos dijeran' },
  venir: { obj: 'a la fiesta', en: 'to come', ru: 'приходить', kk: 'келу', pres: 'vengo vienes viene venimos vienen', pret: 'vine viniste vino vinimos vinieron', fut: 'vendr', subj: 'venga vengas venga vengamos vengan', impsubj: 'viniera vinieras viniera viniéramos vinieran' },
  poner: { obj: 'la mesa', en: 'to put', ru: 'класть, ставить', kk: 'қою', pres: 'pongo pones pone ponemos ponen', pret: 'puse pusiste puso pusimos pusieron', fut: 'pondr', subj: 'ponga pongas ponga pongamos pongan', impsubj: 'pusiera pusieras pusiera pusiéramos pusieran' },
  saber: { obj: 'la respuesta', en: 'to know', ru: 'знать', kk: 'білу', pres: 'sé sabes sabe sabemos saben', pret: 'supe supiste supo supimos supieron', fut: 'sabr', subj: 'sepa sepas sepa sepamos sepan', impsubj: 'supiera supieras supiera supiéramos supieran' },
  dar: { obj: 'un regalo', en: 'to give', ru: 'давать', kk: 'беру', pres: 'doy das da damos dan', pret: 'di diste dio dimos dieron', subj: 'dé des dé demos den', impsubj: 'diera dieras diera diéramos dieran' },
  salir: { obj: 'de casa', en: 'to go out', ru: 'выходить', kk: 'шығу', pres: 'salgo sales sale salimos salen', fut: 'saldr', subj: 'salga salgas salga salgamos salgan' },
};

const ES_TENSES = {
  pres: { level: 1, name: L('present (presente)', 'настоящее время (presente)', 'осы шақ (presente)'), markers: ['Todos los días', 'Normalmente', 'Siempre'],
    rule: L('The present tense describes habits and facts.', 'Настоящее время — привычки и факты: «каждый день», «обычно».', 'Осы шақ — әдеттер мен фактілер: «күн сайын», «әдетте».') },
  pret: { level: 2, name: L('preterite (pretérito indefinido)', 'прошедшее завершённое (pretérito indefinido)', 'аяқталған өткен шақ (pretérito indefinido)'), markers: ['Ayer', 'El año pasado', 'Anoche'],
    rule: L('A finished action at a definite past time: ayer, el año pasado.', 'Законченное действие в определённый момент прошлого: ayer (вчера), el año pasado (в прошлом году).', 'Өткен шақтың белгілі бір сәтінде аяқталған іс-әрекет: ayer (кеше), el año pasado (өткен жылы).') },
  imp: { level: 3, name: L('imperfect (pretérito imperfecto)', 'прошедшее незавершённое (imperfecto)', 'аяқталмаған өткен шақ (imperfecto)'), markers: ['Antes', 'De niño', 'En aquella época'],
    rule: L('Repeated or background actions in the past: antes, de niño.', 'Повторявшееся или длительное действие в прошлом: antes (раньше), de niño (в детстве).', 'Өткенде қайталанған не ұзаққа созылған іс-әрекет: antes (бұрын), de niño (бала кезде).') },
  fut: { level: 3, name: L('future (futuro simple)', 'будущее время (futuro simple)', 'келер шақ (futuro simple)'), markers: ['Mañana', 'El próximo año', 'Dentro de una semana'],
    rule: L('The future: infinitive + é, ás, á, emos, án.', 'Будущее время: инфинитив + é, ás, á, emos, án.', 'Келер шақ: инфинитив + é, ás, á, emos, án.') },
  cond: { level: 4, name: L('conditional (condicional)', 'условное наклонение (condicional)', 'шартты рай (condicional)'), markers: ['Con más tiempo,', 'Con más dinero,', 'En otra situación,'],
    rule: L('What would happen under other conditions: infinitive + ía, ías, ía, íamos, ían.', 'Что было бы при других условиях: инфинитив + ía, ías, ía, íamos, ían.', 'Басқа жағдайда не болар еді: инфинитив + ía, ías, ía, íamos, ían.') },
  subj: { level: 4, name: L('present subjunctive (subjuntivo)', 'сослагательное наклонение (subjuntivo)', 'қалау райы (subjuntivo)'), markers: ['Es importante que', 'Es posible que', 'Ojalá que'],
    rule: L('After "es importante que", "ojalá que" the subjunctive is used.', 'После es importante que (важно, чтобы), ojalá que (хоть бы) нужен subjuntivo.', 'Es importante que (... маңызды), ojalá que (... болса екен) тіркестерінен кейін subjuntivo қолданылады.') },
  impsubj: { level: 5, name: L('imperfect subjunctive', 'сослагательное в прошедшем (imperfecto de subjuntivo)', 'өткен шақтағы қалау райы (imperfecto de subjuntivo)'), markers: ['Era necesario que', 'Mis padres querían que', 'Me sorprendió que'],
    rule: L('After a past main verb (querían que, era necesario que) the imperfect subjunctive is used.', 'Если главный глагол в прошедшем (querían que, era necesario que), нужен imperfecto de subjuntivo.', 'Басыңқы етістік өткен шақта болса (querían que, era necesario que), imperfecto de subjuntivo қажет.') },
};

const ES_PERSONS = [['yo'], ['tú'], ['él', 'ella', 'usted', 'mi hermano', 'Dana'], ['nosotros', 'nosotras'], ['ellos', 'ellas', 'ustedes', 'mis amigos']];

function esForms(inf, tense) {
  const irr = ES_IRREGULAR[inf];
  if (tense === 'fut' || tense === 'cond') return (tense === 'fut' ? FUT : COND).map((e) => (irr?.fut ?? inf) + e);
  if (irr?.[tense]) return irr[tense].split(' ');
  const type = inf.slice(-2);
  const stem = inf.slice(0, -2);
  return ES_END[tense][type].map((e) => stem + e);
}

const ES_VERBS = [
  ...ES_REGULAR.map(([inf, obj, en, ru, kk]) => ({ inf, obj, en, ru, kk, irregular: false })),
  ...Object.entries(ES_IRREGULAR).map(([inf, v]) => ({ inf, obj: v.obj, en: v.en, ru: v.ru, kk: v.kk, irregular: true })),
];

// ---------- Французский ----------
// Лица: je, tu, il/elle/on, nous, vous, ils/elles. Глаголы с être в passé composé не берём, чтобы не было согласования.

const FR_PRONOUNS = [['je'], ['tu'], ['il', 'elle', 'on'], ['nous'], ['vous'], ['ils', 'elles']];
const AVOIR = 'ai as a avons avez ont'.split(' ');
const AVAIS = 'avais avais avait avions aviez avaient'.split(' ');
const IMP_END = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const FUT_FR = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
const SUBJ_END = ['e', 'es', 'e', 'ions', 'iez', 'ent'];

/** Правильные глаголы: [инфинитив, дополнение, en, ru, kk]. Группа -er и группа -ir (finir). */
const FR_REGULAR = [
  ['parler', 'avec Marie', 'to speak', 'говорить', 'сөйлеу'],
  ['aimer', 'la musique', 'to love, to like', 'любить', 'жақсы көру'],
  ['regarder', 'la télé', 'to watch', 'смотреть', 'қарау'],
  ['écouter', 'la radio', 'to listen', 'слушать', 'тыңдау'],
  ['chanter', 'une chanson', 'to sing', 'петь', 'ән айту'],
  ['danser', 'à la fête', 'to dance', 'танцевать', 'билеу'],
  ['travailler', 'au bureau', 'to work', 'работать', 'жұмыс істеу'],
  ['habiter', 'à Paris', 'to live', 'жить', 'тұру'],
  ['jouer', 'au football', 'to play', 'играть', 'ойнау'],
  ['donner', 'un cadeau', 'to give', 'давать', 'беру'],
  ['trouver', 'la clé', 'to find', 'находить', 'табу'],
  ['fermer', 'la porte', 'to close', 'закрывать', 'жабу'],
  ['demander', 'le chemin', 'to ask', 'спрашивать', 'сұрау'],
  ['chercher', 'un livre', 'to look for', 'искать', 'іздеу'],
  ['préparer', 'le dîner', 'to prepare', 'готовить', 'дайындау'],
  ['visiter', 'le musée', 'to visit', 'посещать', 'аралау'],
  ['inviter', 'des amis', 'to invite', 'приглашать', 'шақыру'],
  ['laver', 'la voiture', 'to wash', 'мыть', 'жуу'],
  ['oublier', 'son sac', 'to forget', 'забывать', 'ұмыту'],
  ['gagner', 'le match', 'to win', 'выигрывать', 'жеңу'],
  ['rencontrer', 'un ami', 'to meet', 'встречать', 'кездестіру'],
  ['raconter', 'une histoire', 'to tell', 'рассказывать', 'әңгімелеу'],
  ['expliquer', 'la règle', 'to explain', 'объяснять', 'түсіндіру'],
  ['finir', 'le travail', 'to finish', 'заканчивать', 'аяқтау'],
  ['choisir', 'un cadeau', 'to choose', 'выбирать', 'таңдау'],
  ['réussir', "l'examen", 'to succeed, to pass', 'добиваться успеха, сдать', 'сәтті тапсыру'],
  ['remplir', 'le formulaire', 'to fill in', 'заполнять', 'толтыру'],
];

/** Неправильные: пять времён полностью (по шесть форм), pp — причастие; etre — passé composé с être (не используется). */
const FR_IRREGULAR = {
  être: { obj: 'content', en: 'to be', ru: 'быть', kk: 'болу', pres: 'suis es est sommes êtes sont', imp: 'étais étais était étions étiez étaient', fut: 'ser', subj: 'sois sois soit soyons soyez soient', pp: 'été' },
  avoir: { obj: 'un chien', en: 'to have', ru: 'иметь', kk: 'ие болу', pres: 'ai as a avons avez ont', imp: 'avais avais avait avions aviez avaient', fut: 'aur', subj: 'aie aies ait ayons ayez aient', pp: 'eu' },
  aller: { obj: 'au cinéma', en: 'to go', ru: 'идти, ехать', kk: 'бару', pres: 'vais vas va allons allez vont', imp: 'allais allais allait allions alliez allaient', fut: 'ir', subj: 'aille ailles aille allions alliez aillent', etre: true },
  faire: { obj: 'les devoirs', en: 'to do, to make', ru: 'делать', kk: 'істеу', pres: 'fais fais fait faisons faites font', imp: 'faisais faisais faisait faisions faisiez faisaient', fut: 'fer', subj: 'fasse fasses fasse fassions fassiez fassent', pp: 'fait' },
  pouvoir: { obj: 'venir', en: 'can, to be able', ru: 'мочь', kk: 'алу (істей алу)', pres: 'peux peux peut pouvons pouvez peuvent', imp: 'pouvais pouvais pouvait pouvions pouviez pouvaient', fut: 'pourr', subj: 'puisse puisses puisse puissions puissiez puissent', pp: 'pu' },
  vouloir: { obj: 'un café', en: 'to want', ru: 'хотеть', kk: 'қалау', pres: 'veux veux veut voulons voulez veulent', imp: 'voulais voulais voulait voulions vouliez voulaient', fut: 'voudr', subj: 'veuille veuilles veuille voulions vouliez veuillent', pp: 'voulu' },
  prendre: { obj: 'le bus', en: 'to take', ru: 'брать', kk: 'алу', pres: 'prends prends prend prenons prenez prennent', imp: 'prenais prenais prenait prenions preniez prenaient', fut: 'prendr', subj: 'prenne prennes prenne prenions preniez prennent', pp: 'pris' },
  dire: { obj: 'la vérité', en: 'to say', ru: 'говорить, сказать', kk: 'айту', pres: 'dis dis dit disons dites disent', imp: 'disais disais disait disions disiez disaient', fut: 'dir', subj: 'dise dises dise disions disiez disent', pp: 'dit' },
  voir: { obj: 'le film', en: 'to see', ru: 'видеть', kk: 'көру', pres: 'vois vois voit voyons voyez voient', imp: 'voyais voyais voyait voyions voyiez voyaient', fut: 'verr', subj: 'voie voies voie voyions voyiez voient', pp: 'vu' },
  savoir: { obj: 'la réponse', en: 'to know', ru: 'знать', kk: 'білу', pres: 'sais sais sait savons savez savent', imp: 'savais savais savait savions saviez savaient', fut: 'saur', subj: 'sache saches sache sachions sachiez sachent', pp: 'su' },
  devoir: { obj: 'partir', en: 'must, to have to', ru: 'быть должным', kk: 'тиіс болу', pres: 'dois dois doit devons devez doivent', imp: 'devais devais devait devions deviez devaient', fut: 'devr', subj: 'doive doives doive devions deviez doivent', pp: 'dû' },
  mettre: { obj: 'la table', en: 'to put', ru: 'класть, ставить', kk: 'қою', pres: 'mets mets met mettons mettez mettent', imp: 'mettais mettais mettait mettions mettiez mettaient', fut: 'mettr', subj: 'mette mettes mette mettions mettiez mettent', pp: 'mis' },
  lire: { obj: 'un roman', en: 'to read', ru: 'читать', kk: 'оқу', pres: 'lis lis lit lisons lisez lisent', imp: 'lisais lisais lisait lisions lisiez lisaient', fut: 'lir', subj: 'lise lises lise lisions lisiez lisent', pp: 'lu' },
  écrire: { obj: 'une lettre', en: 'to write', ru: 'писать', kk: 'жазу', pres: 'écris écris écrit écrivons écrivez écrivent', imp: 'écrivais écrivais écrivait écrivions écriviez écrivaient', fut: 'écrir', subj: 'écrive écrives écrive écrivions écriviez écrivent', pp: 'écrit' },
  boire: { obj: "de l'eau", en: 'to drink', ru: 'пить', kk: 'ішу', pres: 'bois bois boit buvons buvez boivent', imp: 'buvais buvais buvait buvions buviez buvaient', fut: 'boir', subj: 'boive boives boive buvions buviez boivent', pp: 'bu' },
};

const FR_TENSES = {
  pres: { level: 1, name: L('present (présent)', 'настоящее время (présent)', 'осы шақ (présent)'), markers: ["Tous les jours,", "D'habitude,", 'Le samedi,'],
    rule: L('The present tense describes habits and facts.', 'Présent — привычки и факты: tous les jours (каждый день), d’habitude (обычно).', 'Présent — әдеттер мен фактілер: tous les jours (күн сайын), d’habitude (әдетте).') },
  pc: { level: 2, name: L('passé composé', 'прошедшее время (passé composé)', 'өткен шақ (passé composé)'), markers: ['Hier,', 'La semaine dernière,', 'Ce matin,'],
    rule: L('A finished past action: avoir + past participle (j’ai parlé).', 'Законченное действие в прошлом: avoir + причастие (j’ai parlé).', 'Өткенде аяқталған іс-әрекет: avoir + есімше (j’ai parlé).') },
  imp: { level: 3, name: L('imperfect (imparfait)', 'прошедшее длительное (imparfait)', 'созылыңқы өткен шақ (imparfait)'), markers: ['Autrefois,', 'Quand nous étions petits,', 'À cette époque,'],
    rule: L('Habits and descriptions in the past: the nous stem + ais, ais, ait, ions, iez, aient.', 'Привычки и описания в прошлом: основа формы nous + ais, ais, ait, ions, iez, aient.', 'Өткендегі әдеттер мен сипаттамалар: nous түрінің негізі + ais, ais, ait, ions, iez, aient.') },
  fut: { level: 3, name: L('future (futur simple)', 'будущее время (futur simple)', 'келер шақ (futur simple)'), markers: ['Demain,', "L'année prochaine,", 'Dans une semaine,'],
    rule: L('The future: infinitive + ai, as, a, ons, ez, ont.', 'Будущее время: инфинитив + ai, as, a, ons, ez, ont.', 'Келер шақ: инфинитив + ai, as, a, ons, ez, ont.') },
  cond: { level: 4, name: L('conditional (conditionnel)', 'условное наклонение (conditionnel)', 'шартты рай (conditionnel)'), markers: ['Avec plus de temps,', "Avec plus d'argent,", 'Dans un monde idéal,'],
    rule: L('What would happen: future stem + ais, ais, ait, ions, iez, aient.', 'Что было бы: основа будущего + ais, ais, ait, ions, iez, aient.', 'Не болар еді: келер шақ негізі + ais, ais, ait, ions, iez, aient.') },
  subj: { level: 4, name: L('subjunctive (subjonctif)', 'сослагательное наклонение (subjonctif)', 'қалау райы (subjonctif)'), markers: ['Il faut', 'Il est important', 'Mes parents veulent'],
    rule: L('After "il faut que", "il est important que" the subjunctive is used.', 'После il faut que (нужно, чтобы), il est important que (важно, чтобы) нужен subjonctif.', 'Il faut que (... керек), il est important que (... маңызды) тіркестерінен кейін subjonctif қолданылады.') },
  pqp: { level: 5, name: L('pluperfect (plus-que-parfait)', 'предпрошедшее (plus-que-parfait)', 'алдыңғы өткен шақ (plus-que-parfait)'), markers: ['Avant ton arrivée,', 'Avant la réunion,', 'Avant midi,'],
    rule: L('An action before another past moment: avais / avait … + past participle.', 'Действие раньше другого момента в прошлом: avais / avait … + причастие.', 'Өткендегі басқа сәттен бұрын болған іс-әрекет: avais / avait … + есімше.') },
};

const vowel = (s) => /^[aeiouyéèêâîôh]/i.test(s);
/** «je» перед гласной превращается в «j'». */
const withPronoun = (pron, form) => (pron === 'je' && vowel(form) ? `j'${form}` : `${pron} ${form}`);
/** «que» перед il, elle, on, ils, elles превращается в «qu'». */
const withQue = (s) => (/^(il|elle|on|ils|elles)\b/.test(s) ? `qu'${s}` : `que ${s}`);

function frStem(inf) {
  if (inf.endsWith('ir')) return { type: 'ir', stem: inf.slice(0, -2) };
  return { type: 'er', stem: inf.slice(0, -2) };
}

function frForms(inf, tense) {
  const irr = FR_IRREGULAR[inf];
  const { type, stem } = frStem(inf);
  const pp = irr ? irr.pp : type === 'ir' ? `${stem}i` : `${stem}é`;
  if (tense === 'pc') return AVOIR.map((a) => `${a} ${pp}`);
  if (tense === 'pqp') return AVAIS.map((a) => `${a} ${pp}`);
  if (tense === 'fut' || tense === 'cond') {
    const base = irr?.fut ?? inf;
    return (tense === 'fut' ? FUT_FR : IMP_END).map((e) => base + e);
  }
  if (irr?.[tense]) return irr[tense].split(' ');
  const long = type === 'ir' ? `${stem}iss` : stem;
  if (tense === 'pres') return type === 'ir' ? ['is', 'is', 'it', 'issons', 'issez', 'issent'].map((e) => stem + e) : ['e', 'es', 'e', 'ons', 'ez', 'ent'].map((e) => stem + e);
  if (tense === 'imp') return IMP_END.map((e) => long + e);
  if (tense === 'subj') return SUBJ_END.map((e) => long + e);
  throw new Error(`${inf} ${tense}`);
}

const FR_VERBS = [
  ...FR_REGULAR.map(([inf, obj, en, ru, kk]) => ({ inf, obj, en, ru, kk, irregular: false })),
  ...Object.entries(FR_IRREGULAR).map(([inf, v]) => ({ inf, obj: v.obj, en: v.en, ru: v.ru, kk: v.kk, irregular: true, etre: v.etre })),
];

// ---------- Общий генератор ----------

const LANGS = {
  es: { verbs: ES_VERBS, tenses: ES_TENSES, persons: ES_PERSONS, forms: esForms },
  fr: { verbs: FR_VERBS, tenses: FR_TENSES, persons: FR_PRONOUNS, forms: frForms },
};

/** Времена, доступные на уровне: на C2 — все, но только неправильные глаголы. */
function tensesFor(lang, level) {
  const all = Object.keys(LANGS[lang].tenses);
  if (level >= 6) return all;
  const own = all.filter((t) => LANGS[lang].tenses[t].level === level);
  return own.length ? own : all.filter((t) => LANGS[lang].tenses[t].level <= level);
}
const verbsFor = (lang, level, tense) =>
  LANGS[lang].verbs.filter((v) => (level >= 6 ? v.irregular : true) && !(v.etre && (tense === 'pc' || tense === 'pqp')));


function explain(lang, verb, tense, answer) {
  const t = LANGS[lang].tenses[tense];
  return L(
    `${t.rule.en} ${verb.inf} (${verb.en}): ${answer}.`,
    `${t.rule.ru} ${verb.inf} (${verb.ru}) — ${t.name.ru}: ${answer}.`,
    `${t.rule.kk} ${verb.inf} (${verb.kk}) — ${t.name.kk}: ${answer}.`,
  );
}

/**
 * Времена, которые можно давать неправильными вариантами: исключены те, что тоже были бы верны по смыслу
 * (например, imperfecto рядом с «ayer» или настоящее время рядом с «mañana»).
 */
const SAFE = {
  es: { pres: ['pret', 'subj', 'impsubj', 'cond'], pret: ['pres', 'fut', 'subj', 'cond', 'impsubj'], imp: ['pres', 'fut', 'subj', 'impsubj'], fut: ['pret', 'imp', 'subj', 'impsubj'], cond: ['pres', 'pret', 'subj'], subj: ['pres', 'fut', 'cond', 'imp'], impsubj: ['pres', 'fut', 'pret', 'imp'] },
  fr: { pres: ['pc', 'pqp', 'cond', 'subj'], pc: ['pres', 'fut', 'cond', 'subj'], imp: ['pres', 'fut', 'subj', 'cond'], fut: ['pc', 'imp', 'pqp', 'subj'], cond: ['pres', 'pc', 'subj', 'pqp'], subj: ['imp', 'fut', 'cond', 'pc'], pqp: ['pres', 'fut', 'cond', 'subj'] },
};

const MODALS = new Set(['poder', 'querer', 'deber', 'pouvoir', 'vouloir', 'devoir']);
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** «Какая форма подходит к лицу»: время известно, выбрать лицо. */
function personTask(ctx, topic, lang, tense, verb) {
  const { forms, persons, tenses } = LANGS[lang];
  const list = forms(verb.inf, tense);
  const candidates = persons.map((_, i) => i).filter((i) => !(lang === 'fr' && i === 0 && vowel(list[0])));
  const p = pick(ctx.rng, candidates);
  const subject = pick(ctx.rng, persons[p]);
  const correct = list[p];
  const wrong = shuffle([...new Set(list.filter((f) => f !== correct))], ctx.rng).slice(0, 3);
  if (wrong.length < 3) return null;
  const marker = pick(ctx.rng, tenses[tense].markers);
  const who = lang === 'fr' && tense === 'subj' ? withQue(`${subject} ______`) : `${subject} ______`;
  const passage = cap(`${marker} ${who} (${verb.inf}) ${verb.obj}.`);
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const all = [correct, ...wrong];
  const prompt = L('Choose the correct form of the verb.', 'Выбери правильную форму глагола.', 'Етістіктің дұрыс түрін таңда.');
  const shown = lang === 'fr' ? withPronoun(subject, correct) : `${subject} ${correct}`;
  const q = poolQ(topic, 1, { kind: 'text', passage, prompt, ex: explain(lang, verb, tense, shown), mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.id = `${topic}:p:${verb.inf}:${tense}:${p}`;
  return q;
}

/** «Какое время нужно по смыслу»: лицо известно, выбрать время по слову-маркеру. */
function tenseTask(ctx, topic, lang, tense, verb) {
  const { forms, persons, tenses } = LANGS[lang];
  const p = Math.floor(ctx.rng() * persons.length);
  const subject = pick(ctx.rng, persons[p]);
  // У модальных глаголов условная форма звучит как вежливое «мог бы», «следовало бы» — её не даём в ловушки.
  const modal = MODALS.has(verb.inf);
  const other = shuffle(SAFE[lang][tense].filter((t) => !(verb.etre && (t === 'pc' || t === 'pqp')) && !(modal && t === 'cond')), ctx.rng);
  const show = (t) => {
    const f = forms(verb.inf, t)[p];
    if (lang === 'es') return f;
    const s = withPronoun(subject, f);
    return tense === 'subj' ? withQue(s) : s;
  };
  const correct = show(tense);
  const wrong = [];
  for (const t of other) {
    const s = show(t);
    if (s !== correct && !wrong.includes(s)) wrong.push(s);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) return null;
  const marker = pick(ctx.rng, tenses[tense].markers);
  const passage = cap(lang === 'es' ? `${marker} ${subject} ______ (${verb.inf}) ${verb.obj}.` : `${marker} ______ (${verb.inf}) ${verb.obj}.`);
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const all = [correct, ...wrong];
  const prompt = L('Which tense fits the sentence? Choose the form.', 'Какое время нужно по смыслу? Выбери форму.', 'Мағынасы бойынша қай шақ керек? Түрін таңда.');
  const q = poolQ(topic, 2, { kind: 'text', passage, prompt, ex: explain(lang, verb, tense, lang === 'es' ? `${subject} ${correct}` : correct), mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.id = `${topic}:t:${verb.inf}:${tense}:${p}`;
  return q;
}

export function verbsMaker(topic, lang) {
  return (ctx, level) => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const own = tensesFor(lang, level);
      const lower = Object.keys(LANGS[lang].tenses).filter((t) => LANGS[lang].tenses[t].level < level);
      // Чаще — времена своего уровня, иногда — повторение пройденных.
      const tense = pick(ctx.rng, lower.length && level < 6 && ctx.rng() < 0.35 ? lower : own);
      const verb = pick(ctx.rng, verbsFor(lang, level, tense));
      const q = (level === 1 || ctx.rng() < 0.5 ? personTask : tenseTask)(ctx, topic, lang, tense, verb);
      if (q && (!ctx.used?.has(q.id) || attempt === 11)) {
        q.d = Math.min(3, Math.ceil(level / 2));
        q.level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][level - 1];
        return q;
      }
    }
    throw new Error(`verbs ${lang} ${level}`);
  };
}

/** Для тестов: таблица форм. */
export const _forms = { es: esForms, fr: frForms, ES_VERBS, FR_VERBS, withPronoun, withQue };
