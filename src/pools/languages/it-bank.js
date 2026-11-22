// Итальянский: грамматика уровней A1-C2 (1…6). Запись как в romance.js:
// [уровень, предложение с пропуском, ответ, [три неверных], разбор на трёх языках].
// Часть заданий написана вручную, остальные собраны из таблиц (артикли, слитные предлоги, согласование,
// местоимения, времена): верная форма берётся из таблицы, неверные - формы, которые здесь невозможны.

import { L } from '../gen.js';
import { T } from '../bank.js';
import { itForms, IT_VERBS } from './it-verbs.js';

const R = (level, sentence, ok, wrong, ru, kk, en) => [level, sentence, ok, wrong, T(ru, kk, en)];
const rot = (arr, k) => arr.map((_, i) => arr[(i + k) % arr.length]);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
function three(ok, cands) {
  const out = [];
  for (const c of cands) if (c && c !== ok && !out.includes(c) && out.length < 3) out.push(c);
  return out.length === 3 ? out : null;
}
function row(level, sentence, ok, cands, ex) {
  const wrong = three(ok, cands);
  return wrong ? [level, sentence, ok, wrong, ex] : null;
}
/** Предложение с ответом на месте пропуска; после апострофа (sull', un') пробела нет. */
const full = (s, ok) => s.replace(/______( \([^)]*\))?( ?)/, (_, hint, sp) => (ok.endsWith("'") ? ok : ok + (sp ?? '')));
const VERB = Object.fromEntries(IT_VERBS.map((v) => [v.inf, v]));

// ---------- A1: неопределённый артикль, согласование прилагательных, слитные предлоги ----------
const INDEF = [
  ['libro', 'un', 'm'], ['zaino', 'uno', 'z'], ['casa', 'una', 'f'], ['amica', "un'", 'fv'], ['amico', 'un', 'mv'], ['studente', 'uno', 's'],
  ['isola', "un'", 'fv'], ['albero', 'un', 'mv'], ['scuola', 'una', 'f'], ['specchio', 'uno', 's'], ['treno', 'un', 'm'], ['zio', 'uno', 'z'],
  ['zia', 'una', 'f'], ['ospedale', 'un', 'mv'], ['arancia', "un'", 'fv'], ['psicologo', 'uno', 'ps'], ['giorno', 'un', 'm'], ['lezione', 'una', 'f'],
  ['idea', "un'", 'fv'], ['uovo', 'un', 'mv'], ['problema', 'un', 'odd'], ['foto', 'una', 'oddf'], ['stadio', 'uno', 's'], ['insegnante', "un'", 'fv'],
];
const INDEF_RULE = {
  m: L('masculine before a consonant: un', 'мужской род перед согласной: un', 'еркек тек, дауыссыз алдында: un'),
  mv: L('masculine before a vowel: un, without an apostrophe', 'мужской род перед гласной: un, без апострофа', 'еркек тек, дауысты алдында: un, апострофсыз'),
  z: L('masculine before z: uno', 'мужской род перед z: uno', 'еркек тек, z алдында: uno'),
  s: L('masculine before s + consonant: uno', 'мужской род перед s + согласная: uno', 'еркек тек, s + дауыссыз алдында: uno'),
  ps: L('masculine before ps: uno', 'мужской род перед ps: uno', 'еркек тек, ps алдында: uno'),
  f: L('feminine before a consonant: una', 'женский род перед согласной: una', 'әйел тек, дауыссыз алдында: una'),
  fv: L("feminine before a vowel: un'", "женский род перед гласной: un'", "әйел тек, дауысты алдында: un'"),
  odd: L('problema ends in -a but is masculine: un problema', 'problema оканчивается на -a, но мужского рода: un problema', 'problema -a әрпімен аяқталса да, еркек тектес: un problema'),
  oddf: L('foto (fotografia) ends in -o but is feminine: una foto', 'foto (fotografia) оканчивается на -o, но женского рода: una foto', 'foto (fotografia) -o әрпімен аяқталса да, әйел тектес: una foto'),
};
const indefRows = INDEF.map(([noun, art, k], i) => {
  const s = `${['Ho', 'Vedo', 'Cerco', 'Conosco'][i % 4]} ______ ${noun}.`;
  const r = INDEF_RULE[k];
  return row(1, s, art, rot(['un', 'uno', 'una', "un'"], i), L(`${cap(r.en)}: «${full(s, art)}»`, `${cap(r.ru)}: «${full(s, art)}»`, `${cap(r.kk)}: «${full(s, art)}»`));
});

// [существительное с артиклем, род, мн. число, человек]
const AGR_NOUNS = [
  ['Il libro', 'm', 0, 0], ['La casa', 'f', 0, 0], ['I libri', 'm', 1, 0], ['Le case', 'f', 1, 0], ['Il ragazzo', 'm', 0, 1], ['La ragazza', 'f', 0, 1],
  ['I ragazzi', 'm', 1, 1], ['Le ragazze', 'f', 1, 1], ['La macchina', 'f', 0, 0], ['Lo zaino', 'm', 0, 0], ['Gli zaini', 'm', 1, 0], ["L'amica", 'f', 0, 1],
  ['Gli amici', 'm', 1, 1], ['Le amiche', 'f', 1, 1], ['La strada', 'f', 0, 0], ['Le strade', 'f', 1, 0], ['Il professore', 'm', 0, 1], ['La professoressa', 'f', 0, 1],
  ['La mano', 'f', 0, 0], ['Il problema', 'm', 0, 0], ['La foto', 'f', 0, 0], ['Il tema', 'm', 0, 0],
];
// [прилагательное: м. ед., ж. ед., м. мн., ж. мн.; для людей или для вещей]
const AGR_ADJ = [
  [['nuovo', 'nuova', 'nuovi', 'nuove'], 0], [['piccolo', 'piccola', 'piccoli', 'piccole'], 0], [['vecchio', 'vecchia', 'vecchi', 'vecchie'], 0],
  [['bello', 'bella', 'belli', 'belle'], 0],
  [['alto', 'alta', 'alti', 'alte'], 1], [['bravo', 'brava', 'bravi', 'brave'], 1], [['stanco', 'stanca', 'stanchi', 'stanche'], 1],
  [['contento', 'contenta', 'contenti', 'contente'], 1], [['simpatico', 'simpatica', 'simpatici', 'simpatiche'], 1],
];
const AGR_G = [
  L('masculine singular', 'мужской род, единственное число', 'еркек тек, жекеше түр'),
  L('feminine singular', 'женский род, единственное число', 'әйел тек, жекеше түр'),
  L('masculine plural', 'мужской род, множественное число', 'еркек тек, көпше түр'),
  L('feminine plural', 'женский род, множественное число', 'әйел тек, көпше түр'),
];
const ODD_N = { 'La mano': L(' Mano is feminine although it ends in -o.', ' Mano женского рода, хотя оканчивается на -o.', ' Mano -o әрпімен аяқталса да, әйел тектес.'), 'La foto': L(' Foto is feminine (la fotografia).', ' Foto женского рода (la fotografia).', ' Foto - әйел тектес (la fotografia).'), 'Il problema': L(' Problema is masculine although it ends in -a.', ' Problema мужского рода, хотя оканчивается на -a.', ' Problema -a әрпімен аяқталса да, еркек тектес.'), 'Il tema': L(' Tema is masculine although it ends in -a.', ' Tema мужского рода, хотя оканчивается на -a.', ' Tema -a әрпімен аяқталса да, еркек тектес.') };
const agrRows = AGR_NOUNS.flatMap(([noun, g, pl, person], i) => {
  const adjs = AGR_ADJ.filter(([, p]) => p === person);
  return [0, 1].map((k) => {
    const [forms] = adjs[(i + k * 3) % adjs.length];
    const idx = (g === 'f' ? 1 : 0) + (pl ? 2 : 0);
    const s = `${noun} ${pl ? 'sono' : 'è'} ______ (${forms[0]}).`;
    const ok = forms[idx];
    const note = ODD_N[noun] ?? L('', '', '');
    return row(1, s, ok, rot(forms, i + k), L(
      `The adjective agrees with "${noun.toLowerCase()}" (${AGR_G[idx].en}): ${ok}.${note.en}`,
      `Прилагательное согласуется с «${noun.toLowerCase()}» (${AGR_G[idx].ru}): ${ok}.${note.ru}`,
      `Сын есім «${noun.toLowerCase()}» сөзімен қиысады (${AGR_G[idx].kk}): ${ok}.${note.kk}`,
    ));
  });
});

const ART = ['il', 'lo', 'la', "l'", 'i', 'gli', 'le'];
const PREP = {
  su: ['sul', 'sullo', 'sulla', "sull'", 'sui', 'sugli', 'sulle'],
  in: ['nel', 'nello', 'nella', "nell'", 'nei', 'negli', 'nelle'],
  di: ['del', 'dello', 'della', "dell'", 'dei', 'degli', 'delle'],
  a: ['al', 'allo', 'alla', "all'", 'ai', 'agli', 'alle'],
  da: ['dal', 'dallo', 'dalla', "dall'", 'dai', 'dagli', 'dalle'],
};
// [предлог, уровень, начало, слова: [существительное без артикля, артикль]]
const PREP_SETS = [
  ['su', 1, 'Il gatto dorme', [['divano', 'il'], ['letto', 'il'], ['scaffale', 'lo'], ['sedia', 'la'], ['armadio', "l'"], ['tappeto', 'il'], ['poltrona', 'la'], ['sedie', 'le'], ['cuscini', 'i']]],
  ['in', 1, 'Le chiavi sono', [['cassetto', 'il'], ['zaino', 'lo'], ['borsa', 'la'], ['armadio', "l'"], ['tasca', 'la'], ['scatola', 'la'], ['astuccio', "l'"], ['borse', 'le'], ['zaini', 'gli']]],
  ['di', 2, 'Questo è il telefono', [['ragazzo', 'il'], ['studente', 'lo'], ['ragazza', 'la'], ['amico', "l'"], ['amica', "l'"], ['ragazzi', 'i'], ['studenti', 'gli'], ['ragazze', 'le'], ['zio', 'lo'], ['insegnante', "l'"]]],
  ['a', 2, 'Ho dato il regalo', [['ragazzo', 'il'], ['studente', 'lo'], ['nonna', 'la'], ['amico', "l'"], ['bambini', 'i'], ['zii', 'gli'], ['amiche', 'le'], ['professore', 'il'], ['zia', 'la']]],
  ['da', 2, 'Domani vado', [['medico', 'il'], ['dentista', 'il'], ['zio', 'lo'], ['nonna', 'la'], ['avvocato', "l'"], ['nonni', 'i'], ['zii', 'gli'], ['amiche', 'le'], ['parrucchiere', 'il']]],
];
const prepRows = PREP_SETS.flatMap(([p, level, start, nouns]) =>
  nouns.map(([noun, art], i) => {
    const a = ART.indexOf(art);
    const ok = PREP[p][a];
    const s = `${start} ______ (${p}) ${noun}.`;
    return row(level, s, ok, rot(PREP[p], a + 1 + (i % 3)), L(
      `The preposition ${p} merges with the article: ${p} + ${art} = ${ok}. «${full(s, ok)}»`,
      `Предлог ${p} сливается с артиклем: ${p} + ${art} = ${ok}. «${full(s, ok)}»`,
      `${p} предлогы артикльмен бірігеді: ${p} + ${art} = ${ok}. «${full(s, ok)}»`,
    ));
  }),
);

// ---------- A2: passato prossimo - essere или avere, согласование причастия ----------
const PP_SUBJ = [['Marco', 0], ['Maria', 1], ['Marco e Luca', 2], ['Anna e Giulia', 3], ['Mio padre', 0], ['Mia madre', 1], ['I ragazzi', 2], ['Le ragazze', 3]];
const ESS = [['andare', 'andat', 'al mare'], ['venire', 'venut', 'alla festa'], ['partire', 'partit', 'per Milano'], ['arrivare', 'arrivat', 'in ritardo'], ['tornare', 'tornat', 'a casa'], ['uscire', 'uscit', 'con gli amici'], ['rimanere', 'rimast', 'a casa'], ['nascere', 'nat', 'a Roma']];
const AVE = [['mangiare', 'mangiato', 'la pizza'], ['vedere', 'visto', 'un film'], ['comprare', 'comprato', 'il pane'], ['leggere', 'letto', 'il giornale'], ['scrivere', 'scritto', 'una lettera'], ['prendere', 'preso', 'il treno'], ['bere', 'bevuto', 'un caffè'], ['fare', 'fatto', 'i compiti']];
const END4 = ['o', 'a', 'i', 'e'];
const essRows = ESS.flatMap(([inf, stem, comp], i) =>
  [0, 1].map((k) => {
    const [S, g] = PP_SUBJ[(i * 3 + k * 5) % 8];
    const aux = g < 2 ? 'è' : 'sono';
    const s = `${S} ${aux} ______ (${inf}) ${comp}.`;
    const ok = stem + END4[g];
    return row(2, s, ok, rot(END4.map((e) => stem + e), g + 1), L(
      `${inf} forms the passato prossimo with essere, so the participle agrees with the subject (${AGR_G[g].en}): ${ok}.`,
      `${inf} образует passato prossimo с essere, поэтому причастие согласуется с подлежащим (${AGR_G[g].ru}): ${ok}.`,
      `${inf} passato prossimo-ны essere арқылы жасайды, сондықтан есімше бастауышпен қиысады (${AGR_G[g].kk}): ${ok}.`,
    ));
  }),
);
const auxRows = [...ESS.map((v) => [...v, 'essere']), ...AVE.map((v) => [...v, 'avere'])].map(([inf, stem, comp, aux], i) => {
  const [S, g] = PP_SUBJ[(i * 5) % 8];
  const pl = g >= 2;
  const pp = aux === 'essere' ? stem + END4[g] : stem;
  const ok = aux === 'essere' ? (pl ? 'sono' : 'è') : pl ? 'hanno' : 'ha';
  const s = `Ieri ${S === 'Mio padre' || S === 'Mia madre' || S.startsWith('I ') || S.startsWith('Le ') ? S[0].toLowerCase() + S.slice(1) : S} ______ ${pp} ${comp}.`;
  return row(2, s, ok, rot(['è', 'ha', 'sono', 'hanno'], i), aux === 'essere'
    ? L(`${inf} is a verb of motion or change of state: auxiliary essere: ${ok} ${pp}.`, `${inf} - глагол движения или изменения состояния: вспомогательный essere - ${ok} ${pp}.`, `${inf} - қозғалыс не күй өзгерісі етістігі: көмекші етістік essere - ${ok} ${pp}.`)
    : L(`${inf} takes a direct object: auxiliary avere: ${ok} ${pp}.`, `${inf} - переходный глагол (есть прямое дополнение): вспомогательный avere - ${ok} ${pp}.`, `${inf} - сабақты етістік (тура толықтауышы бар): көмекші етістік avere - ${ok} ${pp}.`));
});

// ---------- B1: прямые и косвенные местоимения, притяжательные, согласование с lo/la/li/le ----------
const DIR = [['lo', 'm', 0], ['la', 'f', 0], ['li', 'm', 1], ['le', 'f', 1]];
const DIR_OBJ = [
  ['Marco', 0, 'p'], ['Maria', 1, 'p'], ['i ragazzi', 2, 'p'], ['le ragazze', 3, 'p'], ['il professore', 0, 'p'], ['la nonna', 1, 'p'], ['i nonni', 2, 'p'], ['le amiche', 3, 'p'],
  ['il libro', 0, 'r'], ['la rivista', 1, 'r'], ['i giornali', 2, 'r'], ['le lettere', 3, 'r'], ['il pane', 0, 'e'], ['la pizza', 1, 'e'], ['i biscotti', 2, 'e'], ['le mele', 3, 'e'],
];
const DIR_VERB = { p: [['Vedi', 'vedo'], ['Conosci', 'conosco'], ['Chiami', 'chiamo'], ['Inviti', 'invito'], ['Aspetti', 'aspetto']], r: [['Leggi', 'leggo'], ['Compri', 'compro'], ['Prendi', 'prendo']], e: [['Mangi', 'mangio'], ['Compri', 'compro'], ['Prendi', 'prendo']] };
const dirRows = DIR_OBJ.flatMap(([obj, k, cl], i) =>
  [0, 1].map((j) => {
    const [ask, ans] = DIR_VERB[cl][(i + j) % DIR_VERB[cl].length];
    const s = `${ask} ${obj}? - Sì, ______ ${ans}.`;
    const ok = DIR[k][0];
    return row(3, s, ok, rot(['lo', 'la', 'li', 'le'], k + 1), L(
      `Direct object "${obj}" (${AGR_G[k].en}) → ${ok}. «${full(s, ok)}»`,
      `Прямое дополнение «${obj}» (${AGR_G[k].ru}) → ${ok}. «${full(s, ok)}»`,
      `Тура толықтауыш «${obj}» (${AGR_G[k].kk}) → ${ok}. «${full(s, ok)}»`,
    ));
  }),
);
const IND_TO = [['a Marco', 'gli', 0], ['a Maria', 'le', 1], ['al professore', 'gli', 0], ['alla nonna', 'le', 1], ['ai ragazzi', 'gli', 2], ['a tuo fratello', 'gli', 0], ['a tua sorella', 'le', 1]];
const IND_VERB = [['Telefoni', 'telefono'], ['Scrivi', 'scrivo'], ['Rispondi', 'rispondo'], ['Parli', 'parlo']];
const indRows = IND_TO.flatMap(([to, ok, k], i) =>
  [0, 1].map((j) => {
    const [ask, ans] = IND_VERB[(i + j * 2) % 4];
    const s = `${ask} ${to}? - Sì, ______ ${ans}.`;
    return row(3, s, ok, rot(['gli', 'le', 'lo', 'la'], i + j), L(
      `${ask.toLowerCase()} a qualcuno: indirect object (a + person) → ${ok} (gli - he / they, le - she). «${full(s, ok)}»`,
      `${ask.toLowerCase()} a qualcuno: косвенное дополнение (a + человек) → ${ok} (gli - ему / им, le - ей). «${full(s, ok)}»`,
      `${ask.toLowerCase()} a qualcuno: жанама толықтауыш (a + адам) → ${ok} (gli - оған (ер) / оларға, le - оған (әйел)). «${full(s, ok)}»`,
    ));
  }),
);
const POSS = { mio: ['mio', 'mia', 'miei', 'mie'], tuo: ['tuo', 'tua', 'tuoi', 'tue'], suo: ['suo', 'sua', 'suoi', 'sue'], nostro: ['nostro', 'nostra', 'nostri', 'nostre'] };
const ARTS = ['il', 'la', 'i', 'le'];
// [начало, существительное, индекс формы (м. ед., ж. ед., м. мн., ж. мн.), родственник в ед. числе]
const POSS_SET = [
  ['Ti presento', 'sorella', 1, 1], ['Ti presento', 'fratello', 0, 1], ['Questa è', 'macchina', 1, 0], ['Questo è', 'zaino', 0, 0],
  ['Ti presento', 'fratelli', 2, 0], ['Queste sono', 'chiavi', 3, 0], ['Questi sono', 'libri', 2, 0], ['Ti presento', 'madre', 1, 1],
  ['Questa è', 'casa', 1, 0], ['Ti presento', 'zio', 0, 1], ['Ti presento', 'sorelle', 3, 0], ['Questo è', 'cane', 0, 0],
];
const POSS_RULE = {
  fam: L('Singular family nouns take a possessive without the article', 'С родственниками в единственном числе притяжательное употребляется без артикля', 'Жекеше түрдегі туыстық атаулармен тәуелдеу есімдігі артикльсіз қолданылады'),
  art: L('Otherwise the possessive comes with the article', 'В остальных случаях притяжательное стоит с артиклем', 'Басқа жағдайларда тәуелдеу есімдігі артикльмен келеді'),
};
const possRows = POSS_SET.flatMap(([start, noun, k, fam], i) =>
  Object.keys(POSS).slice(i % 2, (i % 2) + 2).map((who, j) => {
    const forms = POSS[who];
    const bare = forms[k];
    const withArt = `${ARTS[k]} ${bare}`;
    const ok = fam ? bare : withArt;
    const other = (k + 1) % 4;
    // Главная ловушка (с артиклем или без) всегда среди вариантов.
    const cands = [fam ? withArt : bare, ...rot([`${ARTS[other]} ${forms[other]}`, forms[other], forms[(k + 2) % 4]], i + j)];
    const s = `${start} ______ (${who}) ${noun}.`;
    const r = fam ? POSS_RULE.fam : POSS_RULE.art;
    return row(3, s, ok, cands, L(`${r.en}: «${full(s, ok)}»`, `${r.ru}: «${full(s, ok)}»`, `${r.kk}: «${full(s, ok)}»`));
  }),
);
// Согласование причастия с прямым местоимением: Sì, le ho comprate.
const PPA = [
  ['comprato', [['il pane', 0], ['la pizza', 1], ['i biscotti', 2], ['le mele', 3]]],
  ['letto', [['il giornale', 0], ['la rivista', 1], ['i libri', 2], ['le lettere', 3]]],
  ['visto', [['Marco', 0], ['Maria', 1], ['i ragazzi', 2], ['le ragazze', 3]]],
  ['preso', [['il treno', 0], ['la medicina', 1], ['i biglietti', 2], ['le chiavi', 3]]],
  ['aperto', [['il regalo', 0], ['la finestra', 1], ['i regali', 2], ['le finestre', 3]]],
  ['invitato', [['Luca', 0], ['Giulia', 1], ['i vicini', 2], ['le colleghe', 3]]],
];
const PRON = ["l'", "l'", 'li ', 'le '];
const ppaRows = PPA.flatMap(([pp, objs], i) =>
  objs.map(([obj, k], j) => {
    const stem = pp.slice(0, -1);
    const ok = stem + END4[k];
    const s = `Hai ${pp} ${obj}? - Sì, ${PRON[k]}ho ______.`;
    return row(3, s, ok, rot(END4.map((e) => stem + e), i + j + 1), L(
      `With a direct object pronoun before avere (lo, la, li, le) the participle agrees with it: ${PRON[k].trim()} → ${ok}. «${full(s, ok)}»`,
      `Если перед avere стоит прямое местоимение (lo, la, li, le), причастие согласуется с ним: ${PRON[k].trim()} → ${ok}. «${full(s, ok)}»`,
      `Avere алдында тура есімдік (lo, la, li, le) тұрса, есімше онымен қиысады: ${PRON[k].trim()} → ${ok}. «${full(s, ok)}»`,
    ));
  }),
);

// ---------- B2: сочетания местоимений, согласование времён с congiuntivo ----------
const COMBO_OBJ = [['il libro', 0], ['la penna', 1], ['i quaderni', 2], ['le chiavi', 3], ['il dizionario', 0], ['la bici', 1], ['i biglietti', 2], ['le foto', 3]];
const OBJP = ['lo', 'la', 'li', 'le'];
const ASKER = [
  ['Mi presti', '', 'presto', 'te', L('mi → te', 'mi → te (мне → тебе)', 'mi → te (маған → саған)')],
  ['Ci porti', '', 'porto', 've', L('ci → ve', 'ci → ve (нам → вам)', 'ci → ve (бізге → сендерге)')],
  ['Dai', ' a Marco', 'do', 'glie', L('a Marco → gli → glie-', 'a Marco → gli → glie-', 'a Marco → gli → glie-')],
  ['Mandi', ' a Maria', 'mando', 'glie', L('a Maria → le → glie- (also for a woman)', 'a Maria → le → glie- (и для женщины тоже)', 'a Maria → le → glie- (әйел үшін де)')],
];
const combo = (who, k) => (who === 'glie' ? `glie${OBJP[k]}` : `${who} ${OBJP[k]}`);
const comboRows = ASKER.flatMap(([ask, to, ans, who, rule], a) =>
  COMBO_OBJ.map(([obj, k], i) => {
    const ok = combo(who, k);
    const others = ['te', 've', 'glie', 'me'].filter((w) => w !== who);
    const cands = rot([combo(who, (k + 1) % 4), combo(others[0], k), combo(others[1], k), combo(others[2], k), combo(who, (k + 2) % 4)], a + i);
    const s = `${ask} ${obj}${to}? - Sì, ______ ${ans}.`;
    return row(4, s, ok, cands, L(
      `Indirect + direct pronoun: ${rule.en}, ${obj} → ${OBJP[k]}: ${ok}. «${full(s, ok)}»`,
      `Косвенное + прямое местоимение: ${rule.ru}, ${obj} → ${OBJP[k]}: ${ok}. «${full(s, ok)}»`,
      `Жанама + тура есімдік: ${rule.kk}, ${obj} → ${OBJP[k]}: ${ok}. «${full(s, ok)}»`,
    ));
  }),
);
const CONC_VERBS = ['venire', 'partire', 'fare', 'dire', 'studiare', 'capire', 'leggere', 'scrivere', 'tornare', 'essere', 'avere', 'uscire'];
const CONC_MAIN = [['Voglio che', 'Volevo che'], ['È necessario che', 'Era necessario che'], ['Bisogna che', 'Bisognava che']];
const CONC_SUBJ = [['Marco', 2], ['tu', 1], ['voi', 4], ['i ragazzi', 5]];
const concRows = CONC_VERBS.flatMap((inf, i) => [0, 1].flatMap((j) => {
  const v = VERB[inf];
  const [S, p] = CONC_SUBJ[(i + j * 2) % 4];
  const forms = [itForms(inf, 'cong')[p], itForms(inf, 'congimp')[p], itForms(inf, 'pres')[p], itForms(inf, 'fut')[p]];
  const [now, past] = CONC_MAIN[i % 3];
  return [
    row(4, `${now} ${S} ______ (${inf}) ${v.comp}.`, forms[0], rot(forms, i), L(`Main verb in the present + che → congiuntivo presente: ${forms[0]}.`, `Главный глагол в настоящем + che → congiuntivo presente: ${forms[0]}.`, `Басыңқы етістік осы шақта + che → congiuntivo presente: ${forms[0]}.`)),
    row(4, `${past} ${S} ______ (${inf}) ${v.comp}.`, forms[1], rot(forms, i + 1), L(`Main verb in the past + che → congiuntivo imperfetto: ${forms[1]}.`, `Главный глагол в прошедшем + che → congiuntivo imperfetto: ${forms[1]}.`, `Басыңқы етістік өткен шақта + che → congiuntivo imperfetto: ${forms[1]}.`)),
  ];
}));

// ---------- C1: si passivante / impersonale, periodo ipotetico II ----------
// [глагол, начало, ед. ч., мн. ч. (или null - безличное «si» без дополнения)]
const SI = [
  ['vendere', 'In questo negozio si', 'il pane fresco', 'libri usati'],
  ['parlare', 'In Svizzera si', 'anche il romancio', 'quattro lingue'],
  ['mangiare', 'In Italia si', 'molta pasta', 'molti dolci'],
  ['vedere', 'Da qui si', 'il mare', 'le montagne'],
  ['bere', 'In Inghilterra si', 'molto tè', 'molte birre'],
  ['leggere', 'In questa classe si', 'un libro al mese', 'molti romanzi'],
  ['fare', "D'estate si", 'una grande festa', 'molte gite'],
  ['cercare', 'In questa azienda si', 'un programmatore', 'nuovi collaboratori'],
  ['aprire', 'Alle nove si', 'il museo', 'i negozi'],
  ['prendere', 'Qui si', "l'autobus per il centro", 'i treni regionali'],
  ['dormire', "D'estate si", null, null, 'poco'],
  ['lavorare', 'In questo ufficio si', null, null, 'molto'],
  ['vivere', 'In campagna si', null, null, 'bene'],
];
const siRows = SI.flatMap(([inf, start, sg, pl, adv], i) => {
  const f = itForms(inf, 'pres');
  const cands = [f[2], f[5], f[3], f[4]];
  if (!sg) {
    const s = `${start} ______ (${inf}) ${adv}.`;
    return [row(5, s, f[2], rot(cands, i), L(`Impersonal si without an object: the verb is in the 3rd person singular: ${f[2]}.`, `Безличное si без дополнения: глагол в 3-м лице единственного числа - ${f[2]}.`, `Толықтауышсыз жақсыз si: етістік 3-жақ жекеше түрде - ${f[2]}.`))];
  }
  return [[sg, 2], [pl, 5]].map(([obj, p]) => {
    const s = `${start} ______ (${inf}) ${obj}.`;
    const ok = f[p];
    return row(5, s, ok, rot(cands, i + p), L(
      `Passive si: the verb agrees with "${obj}" (${p === 2 ? 'singular' : 'plural'}): ${ok}.`,
      `Si passivante: глагол согласуется с «${obj}» (${p === 2 ? 'единственное число' : 'множественное число'}): ${ok}.`,
      `Si passivante: етістік «${obj}» сөзімен қиысады (${p === 2 ? 'жекеше түр' : 'көпше түр'}): ${ok}.`,
    ));
  });
});
// [условие: глагол, дополнение], [следствие: глагол, дополнение]
const IPO = [
  [['avere', 'più tempo'], ['leggere', 'di più']],
  [['sapere', "l'italiano"], ['vivere', 'a Roma']],
  [['vivere', 'al mare'], ['nuotare', 'ogni giorno']],
  [['abitare', 'in centro'], ['uscire', 'più spesso']],
  [['potere', 'scegliere'], ['studiare', 'medicina']],
  [['essere', 'in vacanza'], ['fare', 'sport']],
  [['vedere', 'Marco'], ['dire', 'la verità']],
  [['finire', 'presto'], ['andare', 'al cinema']],
];
const IPO_SUBJ = [['io', 0], ['tu', 1], ['Marco', 2], ['noi', 3], ['voi', 4], ['i miei amici', 5]];
const condOf = (inf, p) => (inf === 'nuotare' ? ['nuoterei', 'nuoteresti', 'nuoterebbe', 'nuoteremmo', 'nuotereste', 'nuoterebbero'][p] : itForms(inf, 'cond')[p]);
const ipoRows = IPO.flatMap(([[ifv, ifc], [rv, rc]], i) =>
  [0, 1, 2, 3].map((j) => {
    const k = j % 2;
    const [S, p] = IPO_SUBJ[(i + j * 2) % 6];
    const iff = itForms(ifv, 'congimp')[p];
    const res = condOf(rv, p);
    if (k === 0) {
      const s = `Se ${S} ______ (${ifv}) ${ifc}, ${res} ${rc}.`;
      const cands = [itForms(ifv, 'cond')[p], itForms(ifv, 'pres')[p], itForms(ifv, 'cong')[p], itForms(ifv, 'fut')[p]];
      return row(5, s, iff, rot(cands, i), L(`Unreal condition in the present: se + congiuntivo imperfetto (${iff}), then condizionale (${res}).`, `Нереальное условие в настоящем: se + congiuntivo imperfetto (${iff}), в главной части condizionale (${res}).`, `Осы шақтағы шындыққа жанаспайтын шарт: se + congiuntivo imperfetto (${iff}), басыңқыда condizionale (${res}).`));
    }
    const s = `Se ${S} ${iff} ${ifc}, ______ (${rv}) ${rc}.`;
    const cands = [rv === 'nuotare' ? ['nuotassi', 'nuotassi', 'nuotasse', 'nuotassimo', 'nuotaste', 'nuotassero'][p] : itForms(rv, 'congimp')[p], rv === 'nuotare' ? ['nuoterò', 'nuoterai', 'nuoterà', 'nuoteremo', 'nuoterete', 'nuoteranno'][p] : itForms(rv, 'fut')[p], rv === 'nuotare' ? ['nuoto', 'nuoti', 'nuota', 'nuotiamo', 'nuotate', 'nuotano'][p] : itForms(rv, 'pres')[p]];
    return row(5, s, res, rot(cands, i), L(`After se + congiuntivo imperfetto the main clause takes the condizionale: ${res}.`, `После se + congiuntivo imperfetto в главной части - condizionale: ${res}.`, `Se + congiuntivo imperfetto-дан кейін басыңқыда condizionale келеді: ${res}.`));
  }),
);

// Относительное местоимение il quale / la quale / i quali / le quali после предлога.
const QUALE = ['il quale', 'la quale', 'i quali', 'le quali'];
const QUALE_ANTE = [['Il ragazzo', 0], ['La ragazza', 1], ['I colleghi', 2], ['Le amiche', 3], ['Il professore', 0], ['La signora', 1], ['Gli studenti', 2], ['Le colleghe', 3]];
const quaRows = QUALE_ANTE.flatMap(([ante, k], i) =>
  [['con', 'lavoro', 'abita', 'abitano', 'qui vicino'], ['per', 'ho comprato il regalo', 'arriva', 'arrivano', 'domani']].map(([prep, mid, sg, pl, end], j) => {
    const s = `${ante} ${prep} ______ ${mid} ${k >= 2 ? pl : sg} ${end}.`;
    const ok = QUALE[k];
    return row(5, s, ok, rot(QUALE, k + 1 + i + j), L(
      `After a preposition, il quale agrees with "${ante.toLowerCase()}" (${AGR_G[k].en}): ${prep} ${ok}.`,
      `После предлога il quale согласуется с «${ante.toLowerCase()}» (${AGR_G[k].ru}): ${prep} ${ok}.`,
      `Предлогтан кейін il quale «${ante.toLowerCase()}» сөзімен қиысады (${AGR_G[k].kk}): ${prep} ${ok}.`,
    ));
  }),
);

// ---------- C2: periodo ipotetico III, congiuntivo trapassato ----------
const IPO3 = [
  [['studiare', 'di più'], ['superare', "l'esame"]],
  [['sapere', 'la verità'], ['dire', 'qualcosa']],
  [['vedere', 'il messaggio'], ['rispondere', 'subito']],
  [['ascoltare', 'il consiglio'], ['evitare', "l'errore"]],
  [['leggere', 'le istruzioni'], ['capire', 'tutto']],
  [['comprare', 'i biglietti prima'], ['risparmiare', 'molto']],
  [['prendere', 'il treno delle otto'], ['vedere', 'lo spettacolo']],
  [['finire', 'il lavoro'], ['chiamare', 'gli amici']],
];
const AVR = { congimp: ['avessi', 'avessi', 'avesse', 'avessimo', 'aveste', 'avessero'], cond: ['avrei', 'avresti', 'avrebbe', 'avremmo', 'avreste', 'avrebbero'], pres: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'], cong: ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'], fut: ['avrò', 'avrai', 'avrà', 'avremo', 'avrete', 'avranno'] };
const PPX = { superare: 'superato', rispondere: 'risposto', evitare: 'evitato', risparmiare: 'risparmiato', sapere: 'saputo', studiare: 'studiato', dire: 'detto', vedere: 'visto', ascoltare: 'ascoltato', leggere: 'letto', capire: 'capito', comprare: 'comprato', prendere: 'preso', finire: 'finito', chiamare: 'chiamato' };
const ipo3Rows = IPO3.flatMap(([[ifv, ifc], [rv, rc]], i) =>
  [0, 1, 2, 3].map((k) => {
    const [S, p] = IPO_SUBJ[(i * 2 + k) % 6];
    const a = PPX[ifv];
    const b = PPX[rv];
    if (k % 2 === 0) {
      const ok = `${AVR.congimp[p]} ${a}`;
      const s = `Se ${S} ______ (${ifv}) ${ifc}, ${AVR.cond[p]} ${b} ${rc}.`;
      return row(6, s, ok, rot([`${AVR.cond[p]} ${a}`, `${AVR.pres[p]} ${a}`, `${AVR.cong[p]} ${a}`], i), L(`Unreal condition in the past: se + congiuntivo trapassato (${ok}), then condizionale passato.`, `Нереальное условие в прошлом: se + congiuntivo trapassato (${ok}), в главной части condizionale passato.`, `Өткен шақтағы шындыққа жанаспайтын шарт: se + congiuntivo trapassato (${ok}), басыңқыда condizionale passato.`));
    }
    const ok = `${AVR.cond[p]} ${b}`;
    const s = `Se ${S} ${AVR.congimp[p]} ${a} ${ifc}, ______ (${rv}) ${rc}.`;
    return row(6, s, ok, rot([`${AVR.congimp[p]} ${b}`, `${AVR.fut[p]} ${b}`, `${AVR.pres[p]} ${b}`], i), L(`After se + congiuntivo trapassato the main clause takes the condizionale passato: ${ok}.`, `После se + congiuntivo trapassato в главной части - condizionale passato: ${ok}.`, `Se + congiuntivo trapassato-дан кейін басыңқыда condizionale passato келеді: ${ok}.`));
  }),
);
const TRAP = [['finire', 'il lavoro'], ['leggere', 'il libro'], ['capire', 'la lezione'], ['vedere', 'il film'], ['prendere', 'le chiavi'], ['scrivere', 'la lettera'], ['chiamare', 'la nonna'], ['pagare', 'il conto']];
const TRAP_SUBJ = [['tu', 1], ['Marco', 2], ['noi', 3], ['voi', 4], ['loro', 5]];
const PP2 = { ...PPX, pagare: 'pagato', scrivere: 'scritto' };
const trapRows = TRAP.flatMap(([inf, comp], i) =>
  [0, 1, 2, 3, 4].map((k) => {
    const [S, p] = TRAP_SUBJ[(i + k) % 5];
    const pp = PP2[inf];
    const ok = `${AVR.congimp[p]} ${pp}`;
    const s = `${['Credevo che', 'Pensavo che', 'Non sapevo che', 'Era strano che', 'Speravo che'][k]} ${S} ______ (${inf}) già ${comp}.`;
    return row(6, s, ok, rot([`${AVR.cong[p]} ${pp}`, `${AVR.pres[p]} ${pp}`, `${AVR.fut[p]} ${pp}`], i), L(
      `Main verb in the past, the action happened before it: congiuntivo trapassato - ${ok}.`,
      `Главный глагол в прошедшем, действие произошло раньше: congiuntivo trapassato - ${ok}.`,
      `Басыңқы етістік өткен шақта, әрекет одан бұрын болған: congiuntivo trapassato - ${ok}.`,
    ));
  }),
);

// ---------- Задания, написанные вручную ----------
const HAND = [
  // ----- A1 -----
  R(1, '______ studente si chiama Luca.', 'Lo', ['Il', 'La', "L'"], 'Перед s + согласная (studente) мужской артикль - lo.', 's + дауыссыз (studente) алдында еркек тектегі артикль - lo.', 'Before s + consonant (studente) the masculine article is lo.'),
  R(1, '______ amica di Marco è simpatica.', "L'", ['La', 'Lo', 'Il'], "Перед гласной артикль сокращается: l'amica.", "Дауысты алдында артикль қысқарады: l'amica.", "Before a vowel the article is shortened: l'amica."),
  R(1, '______ ragazze sono simpatiche.', 'Le', ['La', 'Gli', 'I'], 'Женский род, множественное число - le.', 'Әйел тек, көпше түр - le.', 'Feminine plural - le.'),
  R(1, '______ zii di Marco abitano a Roma.', 'Gli', ['I', 'Lo', 'Le'], 'Мужской род, множественное число, перед z - gli.', 'Еркек тек, көпше түр, z алдында - gli.', 'Masculine plural before z - gli.'),
  R(1, 'Di dove ______? - Sono di Milano.', 'sei', ['sono', 'è', 'siamo'], 'Ответ «sono» (я), значит вопрос к «tu»: di dove sei?', '«Sono» (мен) жауабы - сұрақ «tu»-ға: di dove sei?', 'The answer "sono" means the question is to tu: di dove sei?'),
  R(1, "Quanti anni ______? - Ho vent'anni.", 'hai', ['sei', 'hanno', 'ho'], 'Возраст в итальянском - с глаголом avere: quanti anni hai?', 'Итальян тілінде жас avere етістігімен айтылады: quanti anni hai?', 'Age is expressed with avere: quanti anni hai?'),
  R(1, 'Abito ______ Roma.', 'a', ['in', 'di', 'da'], 'Перед названием города - a: abito a Roma.', 'Қала атауының алдында - a: abito a Roma.', 'Before a city use a: abito a Roma.'),
  R(1, 'Vivo ______ Italia.', 'in', ['a', 'di', 'su'], 'Перед названием страны - in: vivo in Italia.', 'Ел атауының алдында - in: vivo in Italia.', 'Before a country use in: vivo in Italia.'),
  R(1, "C'è ______ libro sul tavolo.", 'un', ['uno', 'una', 'dei'], 'Libro - мужской род, перед согласной: un libro.', 'Libro - еркек тек, дауыссыз алдында: un libro.', 'Libro is masculine, before a consonant: un libro.'),
  R(1, 'Ci ______ due gatti in giardino.', 'sono', ['è', 'ha', 'hanno'], '«Есть, имеется» во множественном числе - ci sono.', 'Көпше түрде «бар» - ci sono.', '"There are" is ci sono.'),
  R(1, 'Mi ______ la pizza.', 'piace', ['piacciono', 'piaci', 'piaccio'], 'Piacere согласуется с тем, что нравится: la pizza - единственное число, поэтому piace.', 'Piacere ұнайтын нәрсемен қиысады: la pizza - жекеше, сондықтан piace.', 'Piacere agrees with the thing liked: la pizza is singular, so piace.'),
  R(1, 'Mi ______ gli spaghetti.', 'piacciono', ['piace', 'piaci', 'piacciamo'], 'Gli spaghetti - множественное число, поэтому piacciono.', 'Gli spaghetti - көпше түр, сондықтан piacciono.', 'Gli spaghetti is plural, so piacciono.'),
  R(1, 'Come ti ______? - Mi chiamo Anna.', 'chiami', ['chiamo', 'chiama', 'chiamate'], '«Как тебя зовут?» - come ti chiami? (глагол chiamarsi, лицо tu).', '«Атың кім?» - come ti chiami? (chiamarsi етістігі, tu жағы).', '"What is your name?" - come ti chiami? (chiamarsi, tu form).'),
  R(1, 'Oggi ______ caldo.', 'fa', ['è', 'ha', 'sta'], 'О погоде говорят с глаголом fare: fa caldo, fa freddo.', 'Ауа райы туралы fare етістігімен айтады: fa caldo, fa freddo.', 'Weather is described with fare: fa caldo, fa freddo.'),
  R(1, 'Che ore ______? - Sono le tre.', 'sono', ['è', 'ha', 'fa'], 'Время (кроме часа дня) - во множественном числе: che ore sono? sono le tre.', 'Уақыт (сағат бірден басқа) көпше түрде айтылады: che ore sono? sono le tre.', 'Time (except one o\'clock) is plural: che ore sono? sono le tre.'),
  // ----- A2 -----
  R(2, 'Ieri sera noi ______ andati al cinema.', 'siamo', ['abbiamo', 'sono', 'hanno'], 'Andare образует passato prossimo с essere; для noi - siamo andati.', 'Andare passato prossimo-ны essere арқылы жасайды; noi үшін - siamo andati.', 'Andare takes essere; for noi: siamo andati.'),
  R(2, 'Questo è ______ libro.', 'il mio', ['mio', 'la mia', 'i miei'], 'С предметами притяжательное стоит с артиклем: il mio libro.', 'Заттармен тәуелдеу есімдігі артикльмен келеді: il mio libro.', 'With things the possessive takes the article: il mio libro.'),
  R(2, 'Ti presento ______ madre.', 'mia', ['la mia', 'mio', 'le mie'], 'С родственником в единственном числе - без артикля: mia madre.', 'Жекеше түрдегі туыспен - артикльсіз: mia madre.', 'With a singular family member there is no article: mia madre.'),
  R(2, 'Ti presento ______ genitori.', 'i miei', ['miei', 'i mie', 'le mie'], 'Во множественном числе артикль нужен: i miei genitori.', 'Көпше түрде артикль керек: i miei genitori.', 'In the plural the article is needed: i miei genitori.'),
  R(2, "Studio l'italiano ______ due anni e continuo a studiarlo.", 'da', ['fa', 'tra', 'a'], 'Действие началось в прошлом и продолжается - da: da due anni.', 'Әрекет бұрын басталып, әлі жалғасуда - da: da due anni.', 'An action that started in the past and continues - da: da due anni (for two years).'),
  R(2, 'Sono arrivato in Italia tre anni ______.', 'fa', ['da', 'tra', 'per'], '«Тому назад» - fa: tre anni fa.', '«Бұрын» - fa: tre anni fa (үш жыл бұрын).', '"Ago" is fa: tre anni fa.'),
  R(2, 'Partiamo ______ una settimana.', 'tra', ['fa', 'da', 'di'], '«Через (в будущем)» - tra: tra una settimana.', '«Арқылы (келешекте)» - tra: tra una settimana (бір аптадан кейін).', '"In (a week\'s time)" is tra: tra una settimana.'),
  R(2, 'Stasera andiamo ______ cinema.', 'al', ['nel', 'dal', 'sul'], 'Andare a + il cinema = al cinema.', 'Andare a + il cinema = al cinema.', 'Andare a + il cinema = al cinema.'),
  R(2, 'Il treno parte ______ otto.', 'alle', ['a', 'le', 'in'], 'Время: a + le otto = alle otto.', 'Уақыт: a + le otto = alle otto.', 'Time: a + le otto = alle otto.'),
  R(2, 'Questo libro è più interessante ______ quello.', 'di', ['che', 'come', 'da'], 'Сравнение двух предметов: più + прилагательное + di.', 'Екі затты салыстыру: più + сын есім + di.', 'Comparing two things: più + adjective + di.'),
  R(2, 'Mi piace più leggere ______ guardare la TV.', 'che', ['di', 'da', 'come'], 'Сравниваем два действия (инфинитива) - che.', 'Екі әрекетті (тұйық етістікті) салыстырғанда - che.', 'Comparing two actions (infinitives) - che.'),
  R(2, 'Marco sta ______ un libro.', 'leggendo', ['leggere', 'letto', 'legge'], 'Действие в процессе: stare + gerundio - sta leggendo.', 'Болып жатқан әрекет: stare + gerundio - sta leggendo.', 'An action in progress: stare + gerund - sta leggendo.'),
  R(2, 'Mentre ______ la cena, è arrivato Luca.', 'preparavo', ['ho preparato', 'preparo', 'preparerò'], 'Фон в прошлом (что происходило) - imperfetto, событие - passato prossimo.', 'Өткендегі фон (не болып жатты) - imperfetto, оқиға - passato prossimo.', 'Background in the past - imperfetto; the event - passato prossimo.'),
  R(2, 'Quando ero piccolo, ______ sempre al mare.', 'andavo', ['sono andato', 'vado', 'andrò'], 'Привычка в прошлом - imperfetto: andavo.', 'Өткендегі әдет - imperfetto: andavo.', 'A habit in the past - imperfetto: andavo.'),
  R(2, 'Ho ______ fame che mangerei un panino.', 'così', ['molto', 'più', 'troppo'], 'Così / tanta ... che - «так ... что»: ho così fame che...', 'Così ... che - «соншалық ... сондықтан»: ho così fame che...', 'Così ... che - "so ... that".'),
  // ----- B1 -----
  R(3, 'Se avrò tempo, ti ______.', 'chiamerò', ['chiamerei', 'chiamassi', 'chiamavo'], 'Реальное условие в будущем: se + futuro, futuro.', 'Келешектегі нақты шарт: se + futuro, futuro.', 'A real future condition: se + futuro, futuro.'),
  R(3, 'Al tuo posto, io non lo ______.', 'farei', ['farò', 'faccio', 'facessi'], '«На твоём месте» - совет, condizionale: farei.', '«Сенің орныңда» - кеңес, condizionale: farei.', '"In your place" - advice, condizionale: farei.'),
  R(3, '______ un caffè, per favore.', 'Vorrei', ['Vorrò', 'Volessi', 'Vorrai'], 'Вежливая просьба - condizionale: vorrei.', 'Сыпайы өтініш - condizionale: vorrei.', 'A polite request - condizionale: vorrei.'),
  R(3, 'Vuoi delle mele? - Sì, ______ voglio due.', 'ne', ['ci', 'li', 'lo'], 'Ne заменяет часть количества: ne voglio due.', 'Ne мөлшердің бір бөлігін алмастырады: ne voglio due.', 'Ne replaces a quantity: ne voglio due (I want two of them).'),
  R(3, 'Vai spesso a Roma? - Sì, ______ vado ogni mese.', 'ci', ['ne', 'la', 'lo'], 'Ci заменяет место (a Roma): ci vado.', 'Ci орынды (a Roma) алмастырады: ci vado.', 'Ci replaces a place (a Roma): ci vado.'),
  R(3, 'Quanti caffè bevi al giorno? - ______ bevo tre.', 'Ne', ['Li', 'Ci', 'Lo'], 'С числом ne обязательно: ne bevo tre.', 'Санмен ne міндетті: ne bevo tre.', 'With a number ne is required: ne bevo tre.'),
  R(3, 'Questa è la ragazza ______ ti ho parlato.', 'di cui', ['che', 'cui', 'la quale'], 'Parlare di qualcuno → di cui.', 'Parlare di qualcuno (біреу туралы айту) → di cui.', 'Parlare di qualcuno → di cui.'),
  R(3, 'Il libro ______ sto leggendo è molto bello.', 'che', ['cui', 'di cui', 'il quale'], 'Прямое дополнение без предлога - che.', 'Предлогсыз тура толықтауыш - che.', 'A direct object without a preposition - che.'),
  R(3, 'La città in ______ vivo è piccola.', 'cui', ['che', 'quale', 'chi'], 'После предлога - cui: in cui.', 'Предлогтан кейін - cui: in cui.', 'After a preposition use cui: in cui.'),
  R(3, 'Dopo ______ mangiato, siamo usciti.', 'aver', ['essere', 'avendo', 'avuto'], 'Dopo + инфинитив прошедшего времени: dopo aver mangiato.', 'Dopo + өткен шақ тұйық етістігі: dopo aver mangiato.', 'Dopo + past infinitive: dopo aver mangiato.'),
  R(3, 'Penso che Marco ______ ragione.', 'abbia', ['ha', 'aveva', 'avesse'], 'После pensare che - congiuntivo: abbia.', 'Pensare che-ден кейін - congiuntivo: abbia.', 'After pensare che use the congiuntivo: abbia.'),
  R(3, 'Il film era ______ noioso che sono uscito.', 'così', ['molto', 'troppo', 'più'], 'Così + прилагательное + che - «настолько ... что».', 'Così + сын есім + che - «соншалықты ... сондықтан».', 'Così + adjective + che - "so ... that".'),
  R(3, "Non c'è ______ in casa.", 'nessuno', ['qualcuno', 'alcuno', 'ognuno'], 'Отрицание non ... nessuno - «никого».', 'Non ... nessuno болымсыздығы - «ешкім».', 'Non ... nessuno - "nobody".'),
  R(3, 'Luca è il ragazzo più alto ______ classe.', 'della', ['nella', 'che la', 'di'], 'Превосходная степень: il più ... di + артикль: della classe.', 'Күшейтпелі шырай: il più ... di + артикль: della classe.', 'Superlative: il più ... di + article: della classe.'),
  R(3, 'Mentre leggevo, mio fratello ______ la TV.', 'guardava', ['ha guardato', 'guarda', 'guarderà'], 'Два одновременных действия в прошлом - оба в imperfetto.', 'Өткендегі екі қатар әрекет - екеуі де imperfetto-да.', 'Two simultaneous past actions - both in the imperfetto.'),
  // ----- B2 -----
  R(4, 'Benché ______ stanco, è andato a lavorare.', 'fosse', ['era', 'è', 'sarebbe'], 'Benché всегда требует congiuntivo: benché fosse.', 'Benché әрдайым congiuntivo талап етеді: benché fosse.', 'Benché always takes the congiuntivo: benché fosse.'),
  R(4, 'Ti presto il libro purché me lo ______ domani.', 'restituisca', ['restituisci', 'restituirai', 'restituivi'], 'Purché (при условии, что) - congiuntivo: restituisca.', 'Purché (... жағдайында) - congiuntivo: restituisca.', 'Purché (provided that) takes the congiuntivo: restituisca.'),
  R(4, 'Vado a casa prima che ______ a piovere.', 'cominci', ['comincia', 'comincerà', 'cominciava'], 'Prima che - всегда congiuntivo: prima che cominci.', 'Prima che - әрдайым congiuntivo: prima che cominci.', 'Prima che always takes the congiuntivo: prima che cominci.'),
  R(4, 'Me ne ______ andato presto.', 'sono', ['ho', 'è', 'mi'], 'Andarsene спрягается с essere: me ne sono andato.', 'Andarsene essere арқылы жіктеледі: me ne sono andato.', 'Andarsene takes essere: me ne sono andato.'),
  R(4, "Ce l'______ fatta!", 'abbiamo', ['siamo', 'sono', 'è'], 'Farcela («справиться») - с avere: ce l\'abbiamo fatta.', 'Farcela («жеңу, үлгеру») - avere арқылы: ce l\'abbiamo fatta.', "Farcela (to make it) takes avere: ce l'abbiamo fatta."),
  R(4, 'Chiunque ______, digli che non ci sono.', 'sia', ['è', 'sarà', 'fosse'], 'Chiunque (кто бы ни) - congiuntivo: chiunque sia.', 'Chiunque (кім болса да) - congiuntivo: chiunque sia.', 'Chiunque (whoever) takes the congiuntivo: chiunque sia.'),
  R(4, 'È il libro più bello che io ______ mai letto.', 'abbia', ['ho', 'avessi', 'avrei'], 'После превосходной степени - congiuntivo: il più bello che io abbia letto.', 'Күшейтпелі шырайдан кейін - congiuntivo: il più bello che io abbia letto.', 'After a superlative use the congiuntivo: che io abbia letto.'),
  R(4, 'Se ______ più tempo, viaggerei di più.', 'avessi', ['avrei', 'ho', 'abbia'], 'Нереальное условие: se + congiuntivo imperfetto, condizionale.', 'Шындыққа жанаспайтын шарт: se + congiuntivo imperfetto, condizionale.', 'Unreal condition: se + congiuntivo imperfetto, condizionale.'),
  R(4, 'Lo spettacolo ______ dal pubblico con entusiasmo.', 'è stato accolto', ['ha accolto', 'è accolto stato', 'ha stato accolto'], 'Пассив в прошлом: essere stato + причастие.', 'Өткен шақтағы ырықсыз етіс: essere stato + есімше.', 'Past passive: essere stato + participle.'),
  R(4, 'Questa regola va ______ sempre.', 'rispettata', ['rispettato', 'rispettare', 'rispettando'], 'Andare + причастие = «должно быть сделано»; согласуется с regola (ж. р.).', 'Andare + есімше = «істелуі керек»; regola-мен (әйел тек) қиысады.', 'Andare + participle means "must be done"; it agrees with regola (feminine).'),
  R(4, 'Gli ho detto di ______ presto.', 'venire', ['venga', 'viene', 'venisse'], 'Dire di + инфинитив: gli ho detto di venire.', 'Dire di + тұйық етістік: gli ho detto di venire.', 'Dire di + infinitive: gli ho detto di venire.'),
  R(4, 'Spero di ______ presto.', 'rivederti', ['ti rivedere', 'rivederci te', 'rivederlo te'], 'Безударное местоимение присоединяется к инфинитиву: rivederti.', 'Екпінсіз есімдік тұйық етістікке жалғанады: rivederti.', 'Unstressed pronouns attach to the infinitive: rivederti.'),
  R(4, 'Nonostante ______ tardi, siamo rimasti a parlare.', 'fosse', ['era', 'è stato', 'sarebbe'], 'Nonostante (несмотря на то, что) - congiuntivo.', 'Nonostante (... қарамастан) - congiuntivo.', 'Nonostante (although) takes the congiuntivo.'),
  // ----- C1 -----
  R(5, 'Dante ______ nel 1265 a Firenze.', 'nacque', ['nasceva', 'nascerà', 'sia nato'], 'Исторический факт в книжном стиле - passato remoto: nacque.', 'Кітаби стильдегі тарихи факт - passato remoto: nacque.', 'A historical fact in written style - passato remoto: nacque.'),
  R(5, "Se l'avessi saputo, non ______.", 'sarei venuto', ['venga', 'venissi', 'sono venuto'], 'Нереальное условие в прошлом: se + trapassato, condizionale passato.', 'Өткендегі шындыққа жанаспайтын шарт: se + trapassato, condizionale passato.', 'Unreal past condition: se + trapassato, condizionale passato.'),
  R(5, 'Magari ______ ricco!', 'fossi', ['sono', 'sarei', 'sia'], 'Magari + congiuntivo imperfetto - «вот бы»: magari fossi ricco!', 'Magari + congiuntivo imperfetto - «шіркін»: magari fossi ricco!', 'Magari + congiuntivo imperfetto - "if only": magari fossi ricco!'),
  R(5, "Pur ______ molto, non ha superato l'esame.", 'studiando', ['studiato', 'studiare', 'studia'], 'Pur + gerundio - «хотя»: pur studiando molto.', 'Pur + gerundio - «...са да»: pur studiando molto.', 'Pur + gerund - "although": pur studiando molto.'),
  R(5, "______ l'esame, Marco è partito per le vacanze.", 'Superato', ['Superando', 'Superare', 'Supera'], 'Participio assoluto: сначала сдал, потом уехал - superato l\'esame.', 'Participio assoluto: алдымен тапсырды, кейін кетті - superato l\'esame.', "Participio assoluto: first passed, then left - superato l'esame."),
  R(5, 'Qualunque cosa tu ______, ti sosterrò.', 'decida', ['decidi', 'deciderai', 'decideresti'], 'Qualunque cosa (что бы ни) - congiuntivo: decida.', 'Qualunque cosa (не болса да) - congiuntivo: decida.', 'Qualunque cosa (whatever) takes the congiuntivo: decida.'),
  R(5, 'Non è che io non ______, è che non posso.', 'voglia', ['voglio', 'vorrò', 'volevo'], 'Non è che - congiuntivo: non è che io non voglia.', 'Non è che - congiuntivo: non è che io non voglia.', 'Non è che takes the congiuntivo: non è che io non voglia.'),
  R(5, 'Sebbene ______ tardi, decisero di continuare.', 'fosse', ['era', 'è', 'sia'], 'Sebbene + congiuntivo; в прошлом - imperfetto: fosse.', 'Sebbene + congiuntivo; өткенде - imperfetto: fosse.', 'Sebbene + congiuntivo; in the past - imperfetto: fosse.'),
  R(5, 'Faccio ______ la macchina dal meccanico.', 'riparare', ['riparata', 'riparando', 'riparo'], 'Fare + инфинитив - «поручить сделать»: faccio riparare.', 'Fare + тұйық етістік - «істетіп алу»: faccio riparare.', 'Fare + infinitive - "have something done": faccio riparare.'),
  R(5, 'Mi sono fatto ______ i capelli.', 'tagliare', ['tagliato', 'tagliati', 'tagliando'], 'Farsi + инфинитив: mi sono fatto tagliare i capelli.', 'Farsi + тұйық етістік: mi sono fatto tagliare i capelli.', 'Farsi + infinitive: mi sono fatto tagliare i capelli.'),
  R(5, 'Non appena ______ a casa, ti chiamerò.', 'sarò arrivato', ['arriverei', 'arrivassi', 'fossi arrivato'], 'Действие, которое закончится раньше другого в будущем - futuro anteriore.', 'Келешекте басқасынан бұрын аяқталатын әрекет - futuro anteriore.', 'An action finished before another future one - futuro anteriore.'),
  R(5, 'Era convinto che noi ______ già partiti.', 'fossimo', ['siamo', 'siamo stati', 'eravamo'], 'Прошедшее в главном + действие раньше - congiuntivo trapassato: fossimo partiti.', 'Басыңқыда өткен шақ + одан бұрынғы әрекет - congiuntivo trapassato: fossimo partiti.', 'Past main clause + earlier action - congiuntivo trapassato: fossimo partiti.'),
  R(5, 'Ammesso che ______ vero, cosa cambia?', 'sia', ['è', 'sarà', 'sarebbe'], 'Ammesso che (допустим, что) - congiuntivo: sia.', 'Ammesso che (... делік) - congiuntivo: sia.', 'Ammesso che (assuming that) takes the congiuntivo: sia.'),
  R(5, 'A meno che non ______, partiremo domani.', 'piova', ['piove', 'pioverà', 'piovesse'], 'A meno che non (если только не) - congiuntivo: piova.', 'A meno che non (... болмаса) - congiuntivo: piova.', 'A meno che non (unless) takes the congiuntivo: piova.'),
  // ----- C2 -----
  R(6, 'Qualora ______ problemi, contattateci.', 'sorgessero', ['sorgono', 'sorgeranno', 'sorgerebbero'], 'Qualora (в случае если) - congiuntivo: qualora sorgessero.', 'Qualora (егер ... болса) - congiuntivo: qualora sorgessero.', 'Qualora (should, in case) takes the congiuntivo: sorgessero.'),
  R(6, 'Non appena ebbe ______ la lettera, scoppiò a piangere.', 'letto', ['letta', 'leggendo', 'leggere'], 'Trapassato remoto: ebbe + причастие (без местоимения причастие не согласуется).', 'Trapassato remoto: ebbe + есімше (есімдік болмаса, есімше қиыспайды).', 'Trapassato remoto: ebbe + participle (no agreement without a pronoun).'),
  R(6, 'Colombo ______ in America nel 1492.', 'giunse', ['giungeva', 'giungesse', 'giungerà'], 'Исторический факт - passato remoto: giunse.', 'Тарихи факт - passato remoto: giunse.', 'A historical fact - passato remoto: giunse.'),
  R(6, 'Checché ne ______ i critici, il film è un capolavoro.', 'dicano', ['dicono', 'diranno', 'direbbero'], 'Checché (что бы ни) - congiuntivo: dicano.', 'Checché (не десе де) - congiuntivo: dicano.', 'Checché (whatever) takes the congiuntivo: dicano.'),
  R(6, "Avesse studiato di più, ______ l'esame.", 'avrebbe superato', ['ha superato', 'superava', 'avesse superato'], 'Условие без se (avesse studiato) - то же, что se avesse studiato; результат - condizionale passato.', 'Se-сіз шарт (avesse studiato) - se avesse studiato сияқты; нәтиже - condizionale passato.', 'A condition without se (avesse studiato) works like se avesse studiato; the result is condizionale passato.'),
  R(6, 'Quanto più ci penso, ______ mi convinco che hai ragione.', 'tanto più', ['così più', 'molto più', 'più tanto'], 'Quanto più ..., tanto più ... - «чем больше ..., тем больше ...».', 'Quanto più ..., tanto più ... - «неғұрлым ..., соғұрлым ...».', 'Quanto più ..., tanto più ... - "the more ..., the more ...".'),
  R(6, 'Non ______ mai pensato che sarebbe finita così.', 'avrei', ['avrò', 'avessi', 'abbia'], 'Condizionale passato - «никогда бы не подумал»: non avrei mai pensato.', 'Condizionale passato - «ешқашан ойламас едім»: non avrei mai pensato.', 'Condizionale passato - "I would never have thought".'),
  R(6, 'Disse che ______ il giorno dopo.', 'sarebbe partito', ['partirà', 'partirebbe', 'fosse partito'], 'Будущее в прошлом - condizionale passato: disse che sarebbe partito.', 'Өткендегі келешек - condizionale passato: disse che sarebbe partito.', 'Future in the past - condizionale passato: disse che sarebbe partito.'),
  R(6, 'Sono venuto affinché tu ______ la verità.', 'sappia', ['sai', 'saprai', 'sapresti'], 'Affinché (чтобы) - congiuntivo: sappia.', 'Affinché (... үшін) - congiuntivo: sappia.', 'Affinché (so that) takes the congiuntivo: sappia.'),
  R(6, 'Lungi dal ______ convinto, continuava a protestare.', 'essere', ['sia', 'fosse', 'è'], 'Lungi da + инфинитив: lungi dall\'essere convinto.', 'Lungi da + тұйық етістік: lungi dall\'essere convinto.', 'Lungi da + infinitive: far from being convinced.'),
  R(6, 'È stato il primo ______ capire il problema.', 'a', ['di', 'da', 'che'], 'Il primo / l\'ultimo + a + инфинитив: il primo a capire.', 'Il primo / l\'ultimo + a + тұйық етістік: il primo a capire.', 'Il primo / l\'ultimo + a + infinitive: the first to understand.'),
  R(6, 'La mostra, ______ in maggio, ha avuto un grande successo.', 'inaugurata', ['inaugurato', 'inaugurando', 'inaugurare'], 'Причастие согласуется с la mostra (ж. р.): inaugurata.', 'Есімше la mostra-мен (әйел тек) қиысады: inaugurata.', 'The participle agrees with la mostra (feminine): inaugurata.'),
  R(6, 'Non fosse per te, ______ già rinunciato.', 'avrei', ['avessi', 'avrò', 'ho'], 'Non fosse per te = se non fosse per te; результат - condizionale passato.', 'Non fosse per te = se non fosse per te; нәтиже - condizionale passato.', 'Non fosse per te = if it were not for you; the result is condizionale passato.'),
];

export const ITALIAN_BANK = [
  ...HAND,
  ...indefRows, ...agrRows, ...prepRows.filter((r) => r && r[0] === 1),
  ...prepRows.filter((r) => r && r[0] === 2), ...essRows, ...auxRows,
  ...dirRows, ...indRows, ...possRows, ...ppaRows,
  ...comboRows, ...concRows,
  ...siRows, ...ipoRows, ...quaRows,
  ...ipo3Rows, ...trapRows,
].filter(Boolean);
