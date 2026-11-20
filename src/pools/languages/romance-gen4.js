// Испанский и французский: задания из таблиц спряжения (запись как в romance.js).
// Правильная форма строится по таблице, неверные - те же времена для других лиц, поэтому вариант ровно один.
import { T } from '../bank.js';

const PERS_RU = ['я', 'ты', 'он / она', 'мы', 'они'];
const PERS_KK = ['мен', 'сен', 'ол', 'біз', 'олар'];
const PERS_EN = ['I', 'you', 'he / she', 'we', 'they'];

/** Строка задания: [уровень, предложение, ответ, [неверные], разбор]. */
function row(level, sentence, forms, p, verb, tense) {
  const ok = forms[p];
  const wrong = [];
  for (let k = 1; k <= 4 && wrong.length < 3; k++) {
    const f = forms[(p + k) % 5];
    if (f !== ok && !wrong.includes(f)) wrong.push(f);
  }
  if (wrong.length < 3) return null;
  const ex = T(
    `${verb} - ${tense.ru}: для лица «${PERS_RU[p]}» форма ${ok}.`,
    `${verb} - ${tense.kk}: «${PERS_KK[p]}» жағына арналған түрі - ${ok}.`,
    `${verb} in the ${tense.en}: the form for "${PERS_EN[p]}" is ${ok}.`,
  );
  return [level, sentence, ok, wrong, ex];
}

/** Подбор комбинаций (глагол, лицо), без повторов предложений. */
function make(level, count, verbs, tpl, step) {
  const out = [];
  const seen = new Set();
  for (let i = 0; out.length < count && i < count * 6; i++) {
    const v = verbs[(i * (step || 1)) % verbs.length];
    const p = (i + Math.floor(i / verbs.length)) % 5;
    const r = tpl(v, p, i);
    if (r && !seen.has(r[1])) {
      seen.add(r[1]);
      out.push(r);
    }
  }
  return out;
}

// =========================== ИСПАНСКИЙ ===========================
const ES_SUBJ = [
  ['Yo', 'yo'],
  ['Tú', 'tú'],
  ['Mi hermano', 'mi hermano', 'Ana', 'Ella', 'Pedro', 'Mi madre', 'El profesor'],
  ['Nosotros', 'nosotros', 'Mi familia y yo', 'Mis amigos y yo'],
  ['Mis padres', 'mis padres', 'Ellos', 'Los niños', 'Ustedes', 'Las chicas'],
];
const esSubj = (p, i) => {
  if (p < 2) return ES_SUBJ[p][0];
  const list = p === 2 ? ['Mi hermano', 'Ana', 'Ella', 'Pedro', 'Mi madre', 'El profesor'] : p === 3 ? ['Nosotros', 'Mi familia y yo', 'Mis amigos y yo'] : ['Mis padres', 'Ellos', 'Los niños', 'Ustedes', 'Las chicas'];
  return list[i % list.length];
};
const lower = (s) => (s === 'Tú' ? 'tú' : /^(Mi|Mis|El|Los|Las|Ella|Ellos|Nosotros|Ustedes|Yo)\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

const ES_IRR = {
  ser: { pres: ['soy', 'eres', 'es', 'somos', 'son'], pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], imp: ['era', 'eras', 'era', 'éramos', 'eran'], subj: ['sea', 'seas', 'sea', 'seamos', 'sean'], pp: 'sido' },
  estar: { pres: ['estoy', 'estás', 'está', 'estamos', 'están'], pret: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvieron'], subj: ['esté', 'estés', 'esté', 'estemos', 'estén'] },
  tener: { pres: ['tengo', 'tienes', 'tiene', 'tenemos', 'tienen'], pret: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'], fut: 'tendr' },
  ir: { pres: ['voy', 'vas', 'va', 'vamos', 'van'], pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], imp: ['iba', 'ibas', 'iba', 'íbamos', 'iban'], subj: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayan'] },
  hacer: { pres: ['hago', 'haces', 'hace', 'hacemos', 'hacen'], pret: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'], fut: 'har', pp: 'hecho' },
  poder: { pres: ['puedo', 'puedes', 'puede', 'podemos', 'pueden'], pret: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudieron'], fut: 'podr', subj: ['pueda', 'puedas', 'pueda', 'podamos', 'puedan'] },
  querer: { pres: ['quiero', 'quieres', 'quiere', 'queremos', 'quieren'], pret: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisieron'], fut: 'querr', subj: ['quiera', 'quieras', 'quiera', 'queramos', 'quieran'] },
  decir: { pres: ['digo', 'dices', 'dice', 'decimos', 'dicen'], pret: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron'], fut: 'dir', pp: 'dicho' },
  venir: { pres: ['vengo', 'vienes', 'viene', 'venimos', 'vienen'], pret: ['vine', 'viniste', 'vino', 'vinimos', 'vinieron'], fut: 'vendr' },
  saber: { pres: ['sé', 'sabes', 'sabe', 'sabemos', 'saben'], pret: ['supe', 'supiste', 'supo', 'supimos', 'supieron'], fut: 'sabr', subj: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepan'] },
  ver: { pres: ['veo', 'ves', 've', 'vemos', 'ven'], pret: ['vi', 'viste', 'vio', 'vimos', 'vieron'], imp: ['veía', 'veías', 'veía', 'veíamos', 'veían'], pp: 'visto' },
  dar: { pres: ['doy', 'das', 'da', 'damos', 'dan'], pret: ['di', 'diste', 'dio', 'dimos', 'dieron'], subj: ['dé', 'des', 'dé', 'demos', 'den'] },
  poner: { pres: ['pongo', 'pones', 'pone', 'ponemos', 'ponen'], pret: ['puse', 'pusiste', 'puso', 'pusimos', 'pusieron'], fut: 'pondr', pp: 'puesto' },
  salir: { pres: ['salgo', 'sales', 'sale', 'salimos', 'salen'], fut: 'saldr' },
  dormir: { pres: ['duermo', 'duermes', 'duerme', 'dormimos', 'duermen'], pret: ['dormí', 'dormiste', 'durmió', 'dormimos', 'durmieron'], subj: ['duerma', 'duermas', 'duerma', 'durmamos', 'duerman'] },
  pedir: { pres: ['pido', 'pides', 'pide', 'pedimos', 'piden'], pret: ['pedí', 'pediste', 'pidió', 'pedimos', 'pidieron'], subj: ['pida', 'pidas', 'pida', 'pidamos', 'pidan'] },
  volver: { pres: ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'vuelven'], subj: ['vuelva', 'vuelvas', 'vuelva', 'volvamos', 'vuelvan'], pp: 'vuelto' },
  leer: { pret: ['leí', 'leíste', 'leyó', 'leímos', 'leyeron'], pp: 'leído' },
  escribir: { pp: 'escrito' },
  abrir: { pp: 'abierto' },
};
// инфинитив + дополнение
const ES_VERBS = [
  ['hablar', 'español con mis amigos'], ['comprar', 'pan en la tienda'], ['trabajar', 'en una oficina'], ['estudiar', 'inglés por las tardes'],
  ['cantar', 'una canción bonita'], ['bailar', 'en la fiesta'], ['caminar', 'por el parque'], ['cocinar', 'la cena'], ['escuchar', 'música'],
  ['viajar', 'a Madrid'], ['comer', 'en el comedor'], ['beber', 'agua fría'], ['aprender', 'español'], ['correr', 'por el parque'],
  ['vender', 'frutas en el mercado'], ['escribir', 'una carta'], ['leer', 'un libro interesante'], ['vivir', 'en una ciudad grande'], ['abrir', 'la ventana'],
  ['ser', 'muy amable'], ['estar', 'en casa'], ['tener', 'mucho trabajo'], ['ir', 'al colegio'], ['hacer', 'la tarea'], ['poder', 'venir a la fiesta'],
  ['querer', 'un café'], ['decir', 'la verdad'], ['venir', 'temprano'], ['saber', 'la respuesta'], ['ver', 'una película'], ['dar', 'un regalo'],
  ['poner', 'la mesa'], ['salir', 'de casa'], ['dormir', 'ocho horas'], ['pedir', 'ayuda'], ['volver', 'a casa'],
];
const ES_STEM = (inf) => inf.slice(0, -2);
const ES_KIND = (inf) => inf.slice(-2);

const ES_END = {
  pres: { ar: ['o', 'as', 'a', 'amos', 'an'], er: ['o', 'es', 'e', 'emos', 'en'], ir: ['o', 'es', 'e', 'imos', 'en'] },
  pret: { ar: ['é', 'aste', 'ó', 'amos', 'aron'], er: ['í', 'iste', 'ió', 'imos', 'ieron'], ir: ['í', 'iste', 'ió', 'imos', 'ieron'] },
  imp: { ar: ['aba', 'abas', 'aba', 'ábamos', 'aban'], er: ['ía', 'ías', 'ía', 'íamos', 'ían'], ir: ['ía', 'ías', 'ía', 'íamos', 'ían'] },
  subj: { ar: ['e', 'es', 'e', 'emos', 'en'], er: ['a', 'as', 'a', 'amos', 'an'], ir: ['a', 'as', 'a', 'amos', 'an'] },
};
const HABER = {
  pres: ['he', 'has', 'ha', 'hemos', 'han'],
  imp: ['había', 'habías', 'había', 'habíamos', 'habían'],
  fut: ['habré', 'habrás', 'habrá', 'habremos', 'habrán'],
  cond: ['habría', 'habrías', 'habría', 'habríamos', 'habrían'],
  subj: ['haya', 'hayas', 'haya', 'hayamos', 'hayan'],
  impsubj: ['hubiera', 'hubieras', 'hubiera', 'hubiéramos', 'hubieran'],
};

function esForms(inf, tense) {
  const irr = ES_IRR[inf] || {};
  const kind = ES_KIND(inf);
  const stem = ES_STEM(inf);
  const reg = (t) => ES_END[t][kind].map((e) => stem + e);
  const pres = () => irr.pres || reg('pres');
  const pp = () => irr.pp || stem + (kind === 'ar' ? 'ado' : 'ido');
  switch (tense) {
    case 'pres': return pres();
    case 'pret': return irr.pret || reg('pret');
    case 'imp': return irr.imp || reg('imp');
    case 'fut': return ['é', 'ás', 'á', 'emos', 'án'].map((e) => (irr.fut || inf) + e);
    case 'cond': return ['ía', 'ías', 'ía', 'íamos', 'ían'].map((e) => (irr.fut || inf) + e);
    case 'subj': {
      if (irr.subj) return irr.subj;
      const yo = pres()[0];
      const s = yo.slice(0, -1);
      return ES_END.subj[kind].map((e) => s + e);
    }
    case 'impsubj': {
      const p3 = (irr.pret || reg('pret'))[4];
      const base = p3.slice(0, -3);
      const acc = base.slice(0, -1) + { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' }[base.slice(-1)];
      return ['ra', 'ras', 'ra', 'ramos', 'ran'].map((e, i) => (i === 3 ? acc + e : base + e));
    }
    default: {
      const aux = HABER[tense.replace(/^h-/, '')];
      return aux.map((h) => `${h} ${pp()}`);
    }
  }
}

const ES_T = {
  pres: { ru: 'настоящее время (presente)', kk: 'осы шақ (presente)', en: 'present tense' },
  pret: { ru: 'простое прошедшее (pretérito indefinido)', kk: 'жай өткен шақ (pretérito indefinido)', en: 'preterite' },
  imp: { ru: 'прошедшее длительное (imperfecto)', kk: 'өткен созылыңқы шақ (imperfecto)', en: 'imperfect' },
  fut: { ru: 'будущее время (futuro simple)', kk: 'келер шақ (futuro simple)', en: 'simple future' },
  cond: { ru: 'условное наклонение (condicional)', kk: 'шартты рай (condicional)', en: 'conditional' },
  subj: { ru: 'сослагательное наклонение (presente de subjuntivo)', kk: 'тұйық рай (presente de subjuntivo)', en: 'present subjunctive' },
  impsubj: { ru: 'сослагательное прошедшее (imperfecto de subjuntivo)', kk: 'өткен шақтағы subjuntivo (imperfecto de subjuntivo)', en: 'imperfect subjunctive' },
  'h-pres': { ru: 'перфект (pretérito perfecto: haber + причастие)', kk: 'перфект (pretérito perfecto: haber + есімше)', en: 'present perfect (haber + participle)' },
  'h-imp': { ru: 'предпрошедшее (pluscuamperfecto: había + причастие)', kk: 'алдыңғы өткен шақ (pluscuamperfecto: había + есімше)', en: 'past perfect (había + participle)' },
  'h-fut': { ru: 'будущее совершённое (futuro perfecto: habré + причастие)', kk: 'аяқталған келер шақ (futuro perfecto: habré + есімше)', en: 'future perfect (habré + participle)' },
  'h-cond': { ru: 'условное совершённое (condicional perfecto: habría + причастие)', kk: 'аяқталған шартты рай (condicional perfecto: habría + есімше)', en: 'conditional perfect (habría + participle)' },
  'h-subj': { ru: 'перфект сослагательного (pretérito perfecto de subjuntivo: haya + причастие)', kk: 'subjuntivo перфектісі (haya + есімше)', en: 'present perfect subjunctive (haya + participle)' },
  'h-impsubj': { ru: 'предпрошедшее сослагательного (pluscuamperfecto de subjuntivo: hubiera + причастие)', kk: 'subjuntivo-ның алдыңғы өткен шағы (hubiera + есімше)', en: 'past perfect subjunctive (hubiera + participle)' },
};

const esRow = (level, tense, frame) => (v, p, i) => {
  const [inf, comp] = v;
  const forms = esForms(inf, tense);
  const subj = esSubj(p, i);
  return row(level, frame(subj, lower(subj), comp, i, inf), forms, p, inf, ES_T[tense]);
};
const FREQ_ES = ['todos los días', 'los fines de semana', 'cada mañana', 'a menudo', 'por las tardes'];
const PAST_ES = ['Ayer', 'Anoche', 'El año pasado', 'La semana pasada', 'Hace dos días'];
const FUT_ES = ['Mañana', 'La próxima semana', 'El año que viene', 'Pronto'];
const NOIRREG_FREQ = ['ser', 'estar'];

export const SPANISH_GEN = [];
// A1: настоящее время
SPANISH_GEN.push(...make(1, 60, ES_VERBS, esRow(1, 'pres', (S, s, c, i, inf) => (NOIRREG_FREQ.includes(inf) ? `${S} ______ ${c}.` : `${S} ______ ${c} ${FREQ_ES[i % 5]}.`)), 1));
SPANISH_GEN.push(...make(1, 45, ES_VERBS, esRow(1, 'pres', (S, s, c, i) => `Mis amigos dicen que ${s} ______ ${c}.`), 3));
// A2: претерит, перфект, ближайшее будущее
SPANISH_GEN.push(...make(2, 60, ES_VERBS, esRow(2, 'pret', (S, s, c, i) => `${PAST_ES[i % 5]} ${s} ______ ${c}.`), 1));
SPANISH_GEN.push(...make(2, 40, ES_VERBS, esRow(2, 'h-pres', (S, s, c, i) => `${['Hoy', 'Esta semana', 'Este año', 'Esta mañana'][i % 4]} ${s} ______ ${c}.`), 2));
SPANISH_GEN.push(...make(2, 30, ES_VERBS, (v, p, i) => {
  const [inf, comp] = v;
  const forms = ES_IRR.ir.pres;
  const s = lower(esSubj(p, i));
  return row(2, `${FUT_ES[i % 4]} ${s} ______ a ${inf} ${comp}.`, forms, p, 'ir a + infinitivo', { ru: 'ближайшее будущее (ir + a + инфинитив)', kk: 'жақын болашақ (ir + a + инфинитив)', en: 'near future (ir + a + infinitive)' });
}, 3));
// B1: имперфект, будущее
SPANISH_GEN.push(...make(3, 55, ES_VERBS, esRow(3, 'imp', (S, s, c, i) => `${['Antes', 'De niños', 'Cada verano', 'Hace diez años'][i % 4]} ${s} ______ ${c}.`), 1));
SPANISH_GEN.push(...make(3, 50, ES_VERBS, esRow(3, 'fut', (S, s, c, i) => `${FUT_ES[i % 4]} ${s} ______ ${c}.`), 2));
// B2: условное, сослагательное
SPANISH_GEN.push(...make(4, 50, ES_VERBS, esRow(4, 'cond', (S, s, c, i) => `Con más tiempo libre, ${s} ______ ${c}.`), 1));
SPANISH_GEN.push(...make(4, 55, ES_VERBS, esRow(4, 'subj', (S, s, c, i) => `${['Es importante que', 'Quiero que', 'Ojalá que', 'Es necesario que'][i % 4]} ${s} ______ ${c}.`), 2));
// C1: имперфект сослагательного, предпрошедшее, будущее совершённое
SPANISH_GEN.push(...make(5, 45, ES_VERBS, esRow(5, 'impsubj', (S, s, c, i) => `Si ${s} ______ ${c}, estaría más contento.`.replace('Si ' + s, 'Si ' + s)), 1));
SPANISH_GEN.push(...make(5, 40, ES_VERBS, esRow(5, 'h-imp', (S, s, c, i) => `Cuando llegué, ya ${s} ______ ${c}.`), 2));
SPANISH_GEN.push(...make(5, 30, ES_VERBS, esRow(5, 'h-fut', (S, s, c, i) => `Para el viernes ${s} ______ ${c}.`), 3));
// C2: условное совершённое, pluscuamperfecto de subjuntivo, perfecto de subjuntivo
SPANISH_GEN.push(...make(6, 40, ES_VERBS, esRow(6, 'h-cond', (S, s, c, i) => `Sin ese error, ${s} ______ ${c}.`), 1));
SPANISH_GEN.push(...make(6, 40, ES_VERBS, esRow(6, 'h-impsubj', (S, s, c, i) => `Si ${s} ______ ${c}, todo habría sido distinto.`), 2));
SPANISH_GEN.push(...make(6, 30, ES_VERBS, esRow(6, 'h-subj', (S, s, c, i) => `Es posible que ${s} ya ______ ${c}.`), 3));

// =========================== ФРАНЦУЗСКИЙ ===========================
const FR_VERBS = [
  ['parler', 'français avec mes amis'], ['danser', 'à la fête'], ['travailler', 'dans un bureau'], ['chanter', 'une chanson'], ['marcher', 'dans le parc'],
  ['cuisiner', 'le dîner'], ['écouter', 'de la musique'], ['regarder', 'un film'], ['donner', 'un cadeau'], ['chercher', 'un livre'],
  ['finir', 'le travail'], ['choisir', 'un cadeau'], ['réussir', "l'examen"], ['vendre', 'des fruits'], ['attendre', 'le bus'], ['répondre', 'à la question'], ['entendre', 'un bruit'],
  ['être', 'à la maison'], ['avoir', 'beaucoup de travail'], ['aller', "à l'école"], ['faire', 'les devoirs'], ['pouvoir', 'venir à la fête'], ['vouloir', 'un café'],
  ['venir', 'de Paris'], ['dire', 'la vérité'], ['prendre', 'le bus'], ['savoir', 'la réponse'], ['voir', 'un film'], ['devoir', 'partir tôt'], ['lire', 'un livre'],
  ['écrire', 'une lettre'], ['partir', 'tôt'], ['sortir', 'avec des amis'], ['rester', 'à la maison'], ['tomber', 'dans la rue'], ['entrer', 'dans la salle'],
];
const FR_ETRE = new Set(['aller', 'venir', 'partir', 'sortir', 'rester', 'tomber', 'entrer']);
const FR_IRR = {
  être: { pres: ['suis', 'es', 'est', 'sommes', 'sont'], imp: 'ét', fut: 'ser', subj: ['sois', 'sois', 'soit', 'soyons', 'soient'], pp: 'été' },
  avoir: { pres: ['ai', 'as', 'a', 'avons', 'ont'], imp: 'av', fut: 'aur', subj: ['aie', 'aies', 'ait', 'ayons', 'aient'], pp: 'eu' },
  aller: { pres: ['vais', 'vas', 'va', 'allons', 'vont'], imp: 'all', fut: 'ir', subj: ['aille', 'ailles', 'aille', 'allions', 'aillent'], pp: 'allé' },
  faire: { pres: ['fais', 'fais', 'fait', 'faisons', 'font'], imp: 'fais', fut: 'fer', subj: ['fasse', 'fasses', 'fasse', 'fassions', 'fassent'], pp: 'fait' },
  pouvoir: { pres: ['peux', 'peux', 'peut', 'pouvons', 'peuvent'], imp: 'pouv', fut: 'pourr', subj: ['puisse', 'puisses', 'puisse', 'puissions', 'puissent'], pp: 'pu' },
  vouloir: { pres: ['veux', 'veux', 'veut', 'voulons', 'veulent'], imp: 'voul', fut: 'voudr', subj: ['veuille', 'veuilles', 'veuille', 'voulions', 'veuillent'], pp: 'voulu' },
  venir: { pres: ['viens', 'viens', 'vient', 'venons', 'viennent'], imp: 'ven', fut: 'viendr', subj: ['vienne', 'viennes', 'vienne', 'venions', 'viennent'], pp: 'venu' },
  dire: { pres: ['dis', 'dis', 'dit', 'disons', 'disent'], imp: 'dis', fut: 'dir', subj: ['dise', 'dises', 'dise', 'disions', 'disent'], pp: 'dit' },
  prendre: { pres: ['prends', 'prends', 'prend', 'prenons', 'prennent'], imp: 'pren', fut: 'prendr', subj: ['prenne', 'prennes', 'prenne', 'prenions', 'prennent'], pp: 'pris' },
  savoir: { pres: ['sais', 'sais', 'sait', 'savons', 'savent'], imp: 'sav', fut: 'saur', subj: ['sache', 'saches', 'sache', 'sachions', 'sachent'], pp: 'su' },
  voir: { pres: ['vois', 'vois', 'voit', 'voyons', 'voient'], imp: 'voy', fut: 'verr', subj: ['voie', 'voies', 'voie', 'voyions', 'voient'], pp: 'vu' },
  devoir: { pres: ['dois', 'dois', 'doit', 'devons', 'doivent'], imp: 'dev', fut: 'devr', subj: ['doive', 'doives', 'doive', 'devions', 'doivent'], pp: 'dû' },
  lire: { pres: ['lis', 'lis', 'lit', 'lisons', 'lisent'], imp: 'lis', fut: 'lir', subj: ['lise', 'lises', 'lise', 'lisions', 'lisent'], pp: 'lu' },
  écrire: { pres: ['écris', 'écris', 'écrit', 'écrivons', 'écrivent'], imp: 'écriv', fut: 'écrir', subj: ['écrive', 'écrives', 'écrive', 'écrivions', 'écrivent'], pp: 'écrit' },
  partir: { pres: ['pars', 'pars', 'part', 'partons', 'partent'], imp: 'part', fut: 'partir', subj: ['parte', 'partes', 'parte', 'partions', 'partent'], pp: 'parti' },
  sortir: { pres: ['sors', 'sors', 'sort', 'sortons', 'sortent'], imp: 'sort', fut: 'sortir', subj: ['sorte', 'sortes', 'sorte', 'sortions', 'sortent'], pp: 'sorti' },
};
const FR_AVOIR = {
  pres: ['ai', 'as', 'a', 'avons', 'ont'],
  imp: ['avais', 'avais', 'avait', 'avions', 'avaient'],
  fut: ['aurai', 'auras', 'aura', 'aurons', 'auront'],
  cond: ['aurais', 'aurais', 'aurait', 'aurions', 'auraient'],
  subj: ['aie', 'aies', 'ait', 'ayons', 'aient'],
};
const FR_ETRE_AUX = {
  pres: ['suis', 'es', 'est', 'sommes', 'sont'],
  imp: ['étais', 'étais', 'était', 'étions', 'étaient'],
  fut: ['serai', 'seras', 'sera', 'serons', 'seront'],
  cond: ['serais', 'serais', 'serait', 'serions', 'seraient'],
  subj: ['sois', 'sois', 'soit', 'soyons', 'soient'],
};
const frKind = (inf) => (inf.endsWith('er') ? 'er' : inf.endsWith('ir') ? 'ir' : 're');
function frPres(inf) {
  if (FR_IRR[inf]) return FR_IRR[inf].pres;
  const s = inf.slice(0, -2);
  if (frKind(inf) === 'er') return [s + 'e', s + 'es', s + 'e', s + 'ons', s + 'ent'];
  if (frKind(inf) === 'ir') return [s + 'is', s + 'is', s + 'it', s + 'issons', s + 'issent'];
  return [s + 's', s + 's', s, s + 'ons', s + 'ent'];
}
function frPP(inf) {
  if (FR_IRR[inf]) return FR_IRR[inf].pp;
  const s = inf.slice(0, -2);
  return frKind(inf) === 'er' ? s + 'é' : frKind(inf) === 'ir' ? s + 'i' : s + 'u';
}
// род и число лица для согласования причастия: [м/ж, мн.]
function frForms(inf, tense, p, fem) {
  const irr = FR_IRR[inf];
  const kind = frKind(inf);
  const s = inf.slice(0, -2);
  switch (tense) {
    case 'pres': return frPres(inf);
    case 'imp': {
      const st = irr ? irr.imp : kind === 'er' ? s : kind === 'ir' ? s + 'iss' : s;
      return ['ais', 'ais', 'ait', 'ions', 'aient'].map((e) => st + e);
    }
    case 'fut': {
      const st = irr ? irr.fut : kind === 're' ? s + 'r' : inf;
      return ['ai', 'as', 'a', 'ons', 'ont'].map((e) => st + e);
    }
    case 'cond': {
      const st = irr ? irr.fut : kind === 're' ? s + 'r' : inf;
      return ['ais', 'ais', 'ait', 'ions', 'aient'].map((e) => st + e);
    }
    case 'subj': {
      if (irr) return irr.subj;
      if (kind === 'er') return [s + 'e', s + 'es', s + 'e', s + 'ions', s + 'ent'];
      if (kind === 'ir') return ['e', 'es', 'e', 'ions', 'ent'].map((e) => s + 'iss' + e);
      return [s + 'e', s + 'es', s + 'e', s + 'ions', s + 'ent'];
    }
    default: {
      const t = tense.replace(/^c-/, '');
      const aux = FR_ETRE.has(inf) ? FR_ETRE_AUX : FR_AVOIR;
      const pp = frPP(inf);
      return aux[t].map((a, k) => {
        if (!FR_ETRE.has(inf)) return `${a} ${pp}`;
        const plural = k === 3 || k === 4;
        return `${a} ${pp}${fem ? 'e' : ''}${plural ? 's' : ''}`;
      });
    }
  }
}
const FR_T = {
  pres: { ru: 'настоящее время (présent)', kk: 'осы шақ (présent)', en: 'present tense' },
  'c-pres': { ru: 'сложное прошедшее (passé composé)', kk: 'құрмалас өткен шақ (passé composé)', en: 'passé composé' },
  imp: { ru: 'прошедшее длительное (imparfait)', kk: 'өткен созылыңқы шақ (imparfait)', en: 'imperfect (imparfait)' },
  fut: { ru: 'простое будущее (futur simple)', kk: 'жай келер шақ (futur simple)', en: 'simple future' },
  cond: { ru: 'условное наклонение (conditionnel présent)', kk: 'шартты рай (conditionnel présent)', en: 'present conditional' },
  subj: { ru: 'сослагательное наклонение (subjonctif présent)', kk: 'тұйық рай (subjonctif présent)', en: 'present subjunctive' },
  'c-imp': { ru: 'предпрошедшее (plus-que-parfait)', kk: 'алдыңғы өткен шақ (plus-que-parfait)', en: 'pluperfect (plus-que-parfait)' },
  'c-fut': { ru: 'будущее совершённое (futur antérieur)', kk: 'аяқталған келер шақ (futur antérieur)', en: 'future perfect (futur antérieur)' },
  'c-cond': { ru: 'условное прошедшее (conditionnel passé)', kk: 'өткен шақтағы шартты рай (conditionnel passé)', en: 'past conditional (conditionnel passé)' },
  'c-subj': { ru: 'прошедшее сослагательного (subjonctif passé)', kk: 'subjonctif passé', en: 'past subjunctive (subjonctif passé)' },
};
// лица: 0 je, 1 tu, 2 il/elle, 3 nous, 4 ils/elles; у третьих лиц есть род
const FR_SUBJ = [
  [['Je', false]],
  [['Tu', false]],
  [['Paul', false], ['Marie', true], ['Mon frère', false], ['Ma sœur', true], ['Le professeur', false]],
  [['Nous', false], ['Mon ami et moi', false], ['Ma sœur et moi', true]],
  [['Mes parents', false], ['Les enfants', false], ['Mes amies', true], ['Les filles', true], ['Ils', false]],
];
const VOWEL = /^[aeiouyéèêàâîôûh]/i;
const frRow = (level, tense, frame) => (v, p, i) => {
  const [inf, comp] = v;
  const subs = FR_SUBJ[p];
  const [S, fem] = subs[i % subs.length];
  const forms = frForms(inf, tense, p, fem);
  if (p === 0 && VOWEL.test(forms[0])) return null;
  const s = /^(Je|Tu|Nous|Ils|Mon|Ma|Mes|Les|Le)\b/.test(S) ? S[0].toLowerCase() + S.slice(1) : S;
  const sub = p === 0 ? 'je' : s;
  return row(level, frame(S, sub, comp, i, inf), forms, p, inf, FR_T[tense]);
};
const FREQ_FR = ['tous les jours', 'le week-end', 'chaque matin', 'souvent', 'le soir'];
const PAST_FR = ['Hier', 'Hier soir', 'La semaine dernière', 'Il y a deux jours', "L'année dernière"];
const FUT_FR = ['Demain', 'La semaine prochaine', "L'année prochaine", 'Bientôt'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export const FRENCH_GEN = [];
FRENCH_GEN.push(...make(1, 60, FR_VERBS, frRow(1, 'pres', (S, s, c, i) => `${cap(s)} ______ ${c} ${FREQ_FR[i % 5]}.`), 1));
FRENCH_GEN.push(...make(1, 50, FR_VERBS, frRow(1, 'pres', (S, s, c) => `Mes amis disent que ${s} ______ ${c}.`), 3));
FRENCH_GEN.push(...make(2, 65, FR_VERBS, frRow(2, 'c-pres', (S, s, c, i) => `${PAST_FR[i % 5]}, ${s} ______ ${c}.`), 1));
FRENCH_GEN.push(...make(2, 35, FR_VERBS, (v, p, i) => {
  const [inf, comp] = v;
  const subs = FR_SUBJ[p];
  const [S] = subs[i % subs.length];
  const forms = FR_IRR.aller.pres;
  if (p === 0) return null;
  const s = /^(Tu|Nous|Ils|Mon|Ma|Mes|Les|Le)\b/.test(S) ? S[0].toLowerCase() + S.slice(1) : S;
  return row(2, `${FUT_FR[i % 4]}, ${s} ______ ${inf} ${comp}.`, forms, p, 'aller + infinitif', { ru: 'ближайшее будущее (aller + инфинитив)', kk: 'жақын болашақ (aller + инфинитив)', en: 'near future (aller + infinitive)' });
}, 3));
FRENCH_GEN.push(...make(3, 55, FR_VERBS, frRow(3, 'imp', (S, s, c, i) => `${['Autrefois', 'Chaque été', 'À cette époque', 'Dans mon enfance'][i % 4]}, ${s} ______ ${c}.`), 1));
FRENCH_GEN.push(...make(3, 50, FR_VERBS, frRow(3, 'fut', (S, s, c, i) => `${FUT_FR[i % 4]}, ${s} ______ ${c}.`), 2));
FRENCH_GEN.push(...make(4, 50, FR_VERBS, frRow(4, 'cond', (S, s, c) => `Avec plus de temps libre, ${s} ______ ${c}.`), 1));
FRENCH_GEN.push(...make(4, 55, FR_VERBS, frRow(4, 'subj', (S, s, c, i) => `${['Il faut que', 'Je veux que', 'Il est important que', 'Il vaut mieux que'][i % 4]} ${s} ______ ${c}.`), 2));
FRENCH_GEN.push(...make(5, 50, FR_VERBS, frRow(5, 'c-imp', (S, s, c) => `Quand je suis arrivé, ${s} ______ déjà ${c}.`.replace('déjà ', '')), 1));
FRENCH_GEN.push(...make(5, 45, FR_VERBS, frRow(5, 'c-fut', (S, s, c) => `D'ici vendredi, ${s} ______ ${c}.`), 2));
FRENCH_GEN.push(...make(6, 45, FR_VERBS, frRow(6, 'c-cond', (S, s, c) => `Sans cette erreur, ${s} ______ ${c}.`), 1));
FRENCH_GEN.push(...make(6, 45, FR_VERBS, frRow(6, 'c-subj', (S, s, c, i) => `Je suis content que ${s} ______ ${c}.`), 2));
