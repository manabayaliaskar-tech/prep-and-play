// Итальянский: спряжение глаголов по временам (уровни A1-C2).
// Правильные глаголы спрягаются по правилам (с учётом -care/-gare, -ciare/-giare, -iare и глаголов на -isc-),
// у неправильных формы записаны полностью. Запись задания как в romance.js:
// [уровень, предложение, ответ, [неверные - формы того же времени для других лиц], разбор].

import { L } from '../gen.js';

// Лица: io, tu, lui/lei, noi, voi, loro.
const END = {
  pres: { are: ['o', 'i', 'a', 'iamo', 'ate', 'ano'], ere: ['o', 'i', 'e', 'iamo', 'ete', 'ono'], ire: ['o', 'i', 'e', 'iamo', 'ite', 'ono'], isc: ['isco', 'isci', 'isce', 'iamo', 'ite', 'iscono'] },
  imp: { are: ['avo', 'avi', 'ava', 'avamo', 'avate', 'avano'], ere: ['evo', 'evi', 'eva', 'evamo', 'evate', 'evano'], ire: ['ivo', 'ivi', 'iva', 'ivamo', 'ivate', 'ivano'] },
  cong: { are: ['i', 'i', 'i', 'iamo', 'iate', 'ino'], ere: ['a', 'a', 'a', 'iamo', 'iate', 'ano'], ire: ['a', 'a', 'a', 'iamo', 'iate', 'ano'], isc: ['isca', 'isca', 'isca', 'iamo', 'iate', 'iscano'] },
  congimp: { are: ['assi', 'assi', 'asse', 'assimo', 'aste', 'assero'], ere: ['essi', 'essi', 'esse', 'essimo', 'este', 'essero'], ire: ['issi', 'issi', 'isse', 'issimo', 'iste', 'issero'] },
  rem: { are: ['ai', 'asti', 'ò', 'ammo', 'aste', 'arono'], ere: ['ei', 'esti', 'é', 'emmo', 'este', 'erono'], ire: ['ii', 'isti', 'ì', 'immo', 'iste', 'irono'] },
};
const FUT = ['ò', 'ai', 'à', 'emo', 'ete', 'anno'];
const COND = ['ei', 'esti', 'ebbe', 'emmo', 'este', 'ebbero'];

/**
 * Глаголы: инфинитив, тип (are/ere/ire/isc), вспомогательный глагол, причастие, переводы, дополнение,
 * неправильные формы (pres, imp - основа, fut - основа, cong, congimp - основа, rem).
 */
export const IT_VERBS = [
  ['parlare', 'are', 'avere', null, 'to speak', 'говорить', 'сөйлеу', 'con gli amici'],
  ['abitare', 'are', 'avere', null, 'to live (reside)', 'жить', 'тұру', 'a Roma'],
  ['lavorare', 'are', 'avere', null, 'to work', 'работать', 'жұмыс істеу', 'in banca'],
  ['studiare', 'are', 'avere', null, 'to study', 'изучать', 'оқу', "l'italiano"],
  ['mangiare', 'are', 'avere', null, 'to eat', 'есть', 'жеу', 'la pizza'],
  ['cercare', 'are', 'avere', null, 'to look for', 'искать', 'іздеу', 'un lavoro'],
  ['pagare', 'are', 'avere', null, 'to pay', 'платить', 'төлеу', 'il conto'],
  ['comprare', 'are', 'avere', null, 'to buy', 'покупать', 'сатып алу', 'il pane'],
  ['guardare', 'are', 'avere', null, 'to watch', 'смотреть', 'көру', 'la televisione'],
  ['ascoltare', 'are', 'avere', null, 'to listen', 'слушать', 'тыңдау', 'la musica'],
  ['aspettare', 'are', 'avere', null, 'to wait for', 'ждать', 'күту', "l'autobus"],
  ['cucinare', 'are', 'avere', null, 'to cook', 'готовить', 'тамақ пісіру', 'la cena'],
  ['giocare', 'are', 'avere', null, 'to play', 'играть', 'ойнау', 'a calcio'],
  ['cominciare', 'are', 'avere', null, 'to begin', 'начинать', 'бастау', 'il lavoro'],
  ['chiamare', 'are', 'avere', null, 'to call', 'звонить, звать', 'қоңырау шалу', 'la nonna'],
  ['arrivare', 'are', 'essere', null, 'to arrive', 'приезжать', 'келу', 'in ritardo'],
  ['tornare', 'are', 'essere', null, 'to come back', 'возвращаться', 'қайту', 'a casa'],
  ['leggere', 'ere', 'avere', 'letto', 'to read', 'читать', 'оқу', 'il giornale', { rem: ['lessi', 'leggesti', 'lesse', 'leggemmo', 'leggeste', 'lessero'] }],
  ['scrivere', 'ere', 'avere', 'scritto', 'to write', 'писать', 'жазу', 'una lettera', { rem: ['scrissi', 'scrivesti', 'scrisse', 'scrivemmo', 'scriveste', 'scrissero'] }],
  ['vedere', 'ere', 'avere', 'visto', 'to see', 'видеть', 'көру', 'un film', { fut: 'vedr', rem: ['vidi', 'vedesti', 'vide', 'vedemmo', 'vedeste', 'videro'] }],
  ['prendere', 'ere', 'avere', 'preso', 'to take', 'брать', 'алу', 'il treno', { rem: ['presi', 'prendesti', 'prese', 'prendemmo', 'prendeste', 'presero'] }],
  ['mettere', 'ere', 'avere', 'messo', 'to put', 'класть', 'қою', 'il libro sul tavolo', { rem: ['misi', 'mettesti', 'mise', 'mettemmo', 'metteste', 'misero'] }],
  ['chiudere', 'ere', 'avere', 'chiuso', 'to close', 'закрывать', 'жабу', 'la finestra', { rem: ['chiusi', 'chiudesti', 'chiuse', 'chiudemmo', 'chiudeste', 'chiusero'] }],
  ['vivere', 'ere', 'avere', 'vissuto', 'to live', 'жить', 'өмір сүру', 'in Italia', { fut: 'vivr', rem: ['vissi', 'vivesti', 'visse', 'vivemmo', 'viveste', 'vissero'] }],
  ['credere', 'ere', 'avere', null, 'to believe', 'верить', 'сену', 'alla storia'],
  ['ricevere', 'ere', 'avere', null, 'to receive', 'получать', 'алу', 'un messaggio'],
  ['vendere', 'ere', 'avere', null, 'to sell', 'продавать', 'сату', 'la macchina'],
  ['perdere', 'ere', 'avere', 'perso', 'to lose', 'терять', 'жоғалту', 'le chiavi', { rem: ['persi', 'perdesti', 'perse', 'perdemmo', 'perdeste', 'persero'] }],
  ['dormire', 'ire', 'avere', null, 'to sleep', 'спать', 'ұйықтау', 'otto ore'],
  ['partire', 'ire', 'essere', null, 'to leave', 'уезжать', 'кету', 'per Milano'],
  ['sentire', 'ire', 'avere', null, 'to hear', 'слышать', 'есту', 'un rumore'],
  ['aprire', 'ire', 'avere', 'aperto', 'to open', 'открывать', 'ашу', 'la porta'],
  ['capire', 'isc', 'avere', null, 'to understand', 'понимать', 'түсіну', 'la lezione'],
  ['finire', 'isc', 'avere', null, 'to finish', 'заканчивать', 'аяқтау', 'i compiti'],
  ['preferire', 'isc', 'avere', null, 'to prefer', 'предпочитать', 'артық көру', 'il tè'],
  ['pulire', 'isc', 'avere', null, 'to clean', 'убирать', 'тазалау', 'la cucina'],
  ['essere', 'ere', 'essere', 'stato', 'to be', 'быть', 'болу', 'in orario', { pres: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'], imp: ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'], fut: 'sar', cong: ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'], congimp: ['fossi', 'fossi', 'fosse', 'fossimo', 'foste', 'fossero'], rem: ['fui', 'fosti', 'fu', 'fummo', 'foste', 'furono'] }],
  ['avere', 'ere', 'avere', 'avuto', 'to have', 'иметь', 'ие болу', 'pazienza', { pres: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'], fut: 'avr', cong: ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'], rem: ['ebbi', 'avesti', 'ebbe', 'avemmo', 'aveste', 'ebbero'] }],
  ['andare', 'are', 'essere', null, 'to go', 'идти, ехать', 'бару', 'al mare', { pres: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'], fut: 'andr', cong: ['vada', 'vada', 'vada', 'andiamo', 'andiate', 'vadano'] }],
  ['fare', 'are', 'avere', 'fatto', 'to do, to make', 'делать', 'істеу', 'una passeggiata', { pres: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'], imp: 'fac:ere', fut: 'far', cong: ['faccia', 'faccia', 'faccia', 'facciamo', 'facciate', 'facciano'], congimp: 'fac:ere', rem: ['feci', 'facesti', 'fece', 'facemmo', 'faceste', 'fecero'] }],
  ['dire', 'ire', 'avere', 'detto', 'to say', 'говорить, сказать', 'айту', 'la verità', { pres: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'], imp: 'dic:ere', fut: 'dir', cong: ['dica', 'dica', 'dica', 'diciamo', 'diciate', 'dicano'], congimp: 'dic:ere', rem: ['dissi', 'dicesti', 'disse', 'dicemmo', 'diceste', 'dissero'] }],
  ['venire', 'ire', 'essere', 'venuto', 'to come', 'приходить', 'келу', 'alla festa', { pres: ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono'], fut: 'verr', cong: ['venga', 'venga', 'venga', 'veniamo', 'veniate', 'vengano'], rem: ['venni', 'venisti', 'venne', 'venimmo', 'veniste', 'vennero'] }],
  ['volere', 'ere', 'avere', null, 'to want', 'хотеть', 'қалау', 'un gelato', { pres: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'], fut: 'vorr', cong: ['voglia', 'voglia', 'voglia', 'vogliamo', 'vogliate', 'vogliano'], rem: ['volli', 'volesti', 'volle', 'volemmo', 'voleste', 'vollero'] }],
  ['potere', 'ere', 'avere', null, 'can, to be able', 'мочь', 'алу (қолынан келу)', 'uscire', { pres: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'], fut: 'potr', cong: ['possa', 'possa', 'possa', 'possiamo', 'possiate', 'possano'] }],
  ['dovere', 'ere', 'avere', null, 'must, to have to', 'быть должным', 'тиіс болу', 'studiare', { pres: ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono'], fut: 'dovr', cong: ['debba', 'debba', 'debba', 'dobbiamo', 'dobbiate', 'debbano'], rem: ['dovetti', 'dovesti', 'dovette', 'dovemmo', 'doveste', 'dovettero'] }],
  ['sapere', 'ere', 'avere', null, 'to know', 'знать', 'білу', 'la risposta', { pres: ['so', 'sai', 'sa', 'sappiamo', 'sapete', 'sanno'], fut: 'sapr', cong: ['sappia', 'sappia', 'sappia', 'sappiamo', 'sappiate', 'sappiano'], rem: ['seppi', 'sapesti', 'seppe', 'sapemmo', 'sapeste', 'seppero'] }],
  ['stare', 'are', 'essere', 'stato', 'to stay, to be', 'находиться, чувствовать себя', 'болу, тұру', 'bene', { pres: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'], fut: 'star', cong: ['stia', 'stia', 'stia', 'stiamo', 'stiate', 'stiano'], congimp: ['stessi', 'stessi', 'stesse', 'stessimo', 'steste', 'stessero'], rem: ['stetti', 'stesti', 'stette', 'stemmo', 'steste', 'stettero'] }],
  ['dare', 'are', 'avere', null, 'to give', 'давать', 'беру', 'una mano', { pres: ['do', 'dai', 'dà', 'diamo', 'date', 'danno'], fut: 'dar', cong: ['dia', 'dia', 'dia', 'diamo', 'diate', 'diano'], congimp: ['dessi', 'dessi', 'desse', 'dessimo', 'deste', 'dessero'], rem: ['diedi', 'desti', 'diede', 'demmo', 'deste', 'diedero'] }],
  ['uscire', 'ire', 'essere', null, 'to go out', 'выходить', 'шығу', 'con gli amici', { pres: ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono'], cong: ['esca', 'esca', 'esca', 'usciamo', 'usciate', 'escano'] }],
  ['bere', 'ere', 'avere', 'bevuto', 'to drink', 'пить', 'ішу', 'un caffè', { pres: ['bevo', 'bevi', 'beve', 'beviamo', 'bevete', 'bevono'], imp: 'bev:ere', fut: 'berr', cong: ['beva', 'beva', 'beva', 'beviamo', 'beviate', 'bevano'], congimp: 'bev:ere', rem: ['bevvi', 'bevesti', 'bevve', 'bevemmo', 'beveste', 'bevvero'] }],
].map(([inf, type, aux, pp, en, ru, kk, comp, irr = {}]) => ({ inf, type, aux, pp, en, ru, kk, comp, irr }));
const VERB = Object.fromEntries(IT_VERBS.map((v) => [v.inf, v]));

/** Основа + окончание с орфографией: cerc + i → cerchi, mangi + i → mangi, studi + iamo → studiamo. */
function join(stem, end, are = true) {
  if (are && /[cg]$/.test(stem) && /^[ie]/.test(end)) return `${stem}h${end}`;
  if (/[cg]i$/.test(stem) && /^[ie]/.test(end)) return stem.slice(0, -1) + end;
  if (/i$/.test(stem) && /^i/.test(end)) return stem.slice(0, -1) + end;
  return stem + end;
}
const stemOf = (v) => v.inf.slice(0, -3);
const cls = (v) => (v.type === 'isc' ? 'ire' : v.type);

/** Формы глагола во времени: pres, imp, fut, cond, cong, congimp, rem, pp (passato prossimo), congtrap, condpass, futant. */
export function itForms(inf, tense) {
  const v = VERB[inf];
  const irr = v.irr[tense];
  if (Array.isArray(irr)) return irr;
  const stem = stemOf(v);
  if (typeof irr === 'string' && irr.includes(':')) {
    const [s, c] = irr.split(':');
    return END[tense][c].map((e) => s + e);
  }
  switch (tense) {
    case 'pres':
    case 'cong':
      return END[tense][v.type === 'isc' ? 'isc' : v.type].map((e) => join(stem, e, v.type === 'are'));
    case 'imp':
    case 'congimp':
    case 'rem':
      return END[tense][cls(v)].map((e) => stem + e);
    case 'fut':
    case 'cond': {
      const ends = tense === 'fut' ? FUT : COND;
      let base = v.irr.fut;
      if (!base) {
        if (v.type === 'are') base = /[cg]i$/.test(stem) ? `${stem.slice(0, -1)}er` : /[cg]$/.test(stem) ? `${stem}her` : `${stem}er`;
        else base = `${stem}${cls(v) === 'ire' ? 'ir' : 'er'}`;
      }
      return ends.map((e) => base + e);
    }
    default: {
      const pp = participle(v);
      const aux = { pp: 'pres', congtrap: 'congimp', condpass: 'cond', futant: 'fut' }[tense];
      if (!aux) throw new Error(`itForms: ${tense}`);
      return itForms(v.aux, aux).map((a, p) => `${a} ${v.aux === 'essere' ? agree(pp, p) : pp}`);
    }
  }
}
export const participle = (v) => v.pp ?? stemOf(v) + { are: 'ato', ere: 'uto', ire: 'ito', isc: 'ito' }[v.type];
/** Причастие с essere для лица p (мужской род): andato, andati. */
const agree = (pp, p) => (p >= 3 ? `${pp.slice(0, -1)}i` : pp);

const PERS = [L('io', 'io (я)', 'io (мен)'), L('tu', 'tu (ты)', 'tu (сен)'), L('lui / lei', 'lui / lei (он / она)', 'lui / lei (ол)'), L('noi', 'noi (мы)', 'noi (біз)'), L('voi', 'voi (вы)', 'voi (сендер)'), L('loro', 'loro (они)', 'loro (олар)')];
const TENSE = {
  pres: L('presente (present)', 'presente (настоящее время)', 'presente (осы шақ)'),
  pp: L('passato prossimo (with avere)', 'passato prossimo (прошедшее с avere)', 'passato prossimo (avere арқылы өткен шақ)'),
  imp: L('imperfetto', 'imperfetto (прошедшее длительное)', 'imperfetto (созылыңқы өткен шақ)'),
  fut: L('futuro semplice', 'futuro semplice (будущее время)', 'futuro semplice (келер шақ)'),
  cond: L('condizionale presente', 'condizionale presente (условное наклонение)', 'condizionale presente (шартты рай)'),
  cong: L('congiuntivo presente', 'congiuntivo presente (сослагательное наклонение)', 'congiuntivo presente (қалау рай)'),
  condpass: L('condizionale passato', 'condizionale passato (прошедшее условное)', 'condizionale passato (өткен шақтағы шартты рай)'),
  congimp: L('congiuntivo imperfetto', 'congiuntivo imperfetto', 'congiuntivo imperfetto'),
  rem: L('passato remoto', 'passato remoto (книжное прошедшее)', 'passato remoto (кітаби өткен шақ)'),
  congtrap: L('congiuntivo trapassato', 'congiuntivo trapassato', 'congiuntivo trapassato'),
  futant: L('futuro anteriore', 'futuro anteriore (предбудущее)', 'futuro anteriore (алдыңғы келер шақ)'),
};
const SUBJ = [['Io'], ['Tu'], ['Marco', 'Anna', 'Mia sorella', 'Il professore', 'Lei'], ['Noi', 'Io e Luca'], ['Voi'], ['I miei amici', 'Loro', 'I ragazzi']];
const subj = (p, i) => SUBJ[p][i % SUBJ[p].length];
const low = (s) => (/^(Io|Tu|Noi|Voi|Loro|Lei|Mia|I|Il)\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const rot = (arr, k) => arr.map((_, i) => arr[(i + k) % arr.length]);
const full = (s, ok) => s.replace(/______( \([^)]*\))?/, ok);

function row(level, sentence, forms, p, v, tense) {
  const ok = forms[p];
  const wrong = [];
  for (const f of rot(forms, p + 1)) if (f !== ok && !wrong.includes(f) && wrong.length < 3) wrong.push(f);
  if (wrong.length < 3) return null;
  const t = TENSE[tense];
  return [level, sentence, ok, wrong, L(
    `${v.inf} (${v.en}), ${t.en}: the form for ${PERS[p].en} is ${ok}. «${full(sentence, ok)}»`,
    `${v.inf} (${v.ru}), ${t.ru}: для лица ${PERS[p].ru} - ${ok}. «${full(sentence, ok)}»`,
    `${v.inf} (${v.kk}), ${t.kk}: ${PERS[p].kk} үшін - ${ok}. «${full(sentence, ok)}»`,
  )];
}
/** Набор заданий одного времени: каждый глагол с несколькими лицами, предложение по шаблону. */
function make(level, tense, verbs, persons, frame) {
  const out = [];
  verbs.forEach((v, i) => {
    const forms = itForms(v.inf, tense);
    persons(i).forEach((p, k) => out.push(row(level, frame(subj(p, i + k), v, i + k, p), forms, p, v, tense)));
  });
  return out.filter(Boolean);
}
const every = (n) => (i) => Array.from({ length: n }, (_, k) => (i + k * Math.ceil(6 / n)) % 6);
const withAvere = IT_VERBS.filter((v) => v.aux === 'avere' && !['avere', 'potere', 'dovere', 'volere', 'sapere'].includes(v.inf));
const regular = IT_VERBS.filter((v) => !Object.keys(v.irr).length);
const irregular = IT_VERBS.filter((v) => v.irr.rem);
// «Voglio che io...» невозможно: при одном подлежащем нужен инфинитив, поэтому в «che + congiuntivo» нет лица io.
const notIo = (i) => [(i % 5) + 1];
const NOT_MODAL = IT_VERBS.filter((v) => !['volere', 'potere', 'dovere'].includes(v.inf));
const PAST = ['Ieri', 'Ieri sera', 'La settimana scorsa', "L'anno scorso", 'Stamattina'];
const FUTW = ['Domani', "L'anno prossimo", 'Fra una settimana', 'Stasera'];

export const IT_VERB_ROWS = [
  // A1: presente
  ...make(1, 'pres', IT_VERBS, every(2), (S, v, i) => `${S} ______ (${v.inf}) ${v.comp}${['', ' ogni giorno', ' spesso'][i % 3]}.`),
  // A2: passato prossimo (avere), imperfetto
  ...make(2, 'pp', withAvere, every(2), (S, v, i) => `${PAST[i % 5]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  ...make(2, 'imp', IT_VERBS.filter((v) => !['dovere', 'potere'].includes(v.inf)), every(1), (S, v, i) => `${['A quei tempi', 'Ogni estate', 'Una volta', 'Di solito'][i % 4]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  // B1: futuro, condizionale
  ...make(3, 'fut', IT_VERBS, every(1), (S, v, i) => `${FUTW[i % 4]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  ...make(3, 'cond', IT_VERBS.filter((v) => v.inf !== 'essere'), every(1), (S, v) => `Con più tempo ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  // B2: congiuntivo presente, condizionale passato
  ...make(4, 'cong', NOT_MODAL, notIo, (S, v, i) => `${['Voglio che', 'È importante che', 'Bisogna che', 'Preferisco che'][i % 4]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  ...make(4, 'condpass', withAvere, every(1), (S, v) => `Senza quel problema ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  // C1: congiuntivo imperfetto, passato remoto dei verbi regolari
  ...make(5, 'congimp', NOT_MODAL, notIo, (S, v, i) => `${['Volevo che', 'Era necessario che', 'Speravo che', 'Pensavo che'][i % 4]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  ...make(5, 'rem', regular, every(2), (S, v, i) => `${['Nel 1950', 'Molti anni fa', 'Quella mattina', 'Nel secolo scorso'][i % 4]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  // C2: passato remoto irregolare, congiuntivo trapassato, futuro anteriore
  ...make(6, 'rem', irregular, every(3), (S, v, i) => `${['Nel 1950', 'Molti anni fa', 'Quella sera', 'Nel secolo scorso'][i % 4]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
  ...make(6, 'congtrap', withAvere, notIo, (S, v, i) => `${['Credevo che', 'Non sapevo che', 'Era strano che'][i % 3]} ${low(S)} ______ (${v.inf}) già ${v.comp}.`),
  ...make(6, 'futant', withAvere, every(1), (S, v, i) => `${['Entro domani', 'Per le otto', 'Prima di sera'][i % 3]} ${low(S)} ______ (${v.inf}) ${v.comp}.`),
];
