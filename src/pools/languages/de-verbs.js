// Немецкий: спряжение глаголов (правильные, сильные, смешанные, отделяемые, модальные) по временам.
// Формы строятся по правилам, у сильных глаголов основы записаны отдельно.
// Два вида заданий, как у испанского: «какая форма подходит к лицу» и «какое время нужно по смыслу».

import { pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';

/**
 * Глагол: inf, перевод (en, ru, kk), obj - дополнение в предложении, sep - отделяемая приставка,
 * du/er - формы с изменением гласной (fährst, fährt), prat - основа Präteritum (fuhr или dachte),
 * pp - Partizip II, aux - h (haben) или s (sein), kind: w, s, m (смешанный), modal, aux.
 */
const V = (inf, en, ru, kk, obj, o = {}) => ({ inf, en, ru, kk, obj, aux: 'h', kind: 'w', ...o });
const VERBS = [
  V('machen', 'to do', 'делать', 'істеу', 'die Hausaufgaben'),
  V('lernen', 'to learn', 'учить', 'үйрену', 'Deutsch'),
  V('spielen', 'to play', 'играть', 'ойнау', 'Fußball'),
  V('kaufen', 'to buy', 'покупать', 'сатып алу', 'frisches Brot'),
  V('wohnen', 'to live', 'жить', 'тұру', 'in Berlin'),
  V('arbeiten', 'to work', 'работать', 'жұмыс істеу', 'im Büro'),
  V('kochen', 'to cook', 'готовить', 'тамақ пісіру', 'das Abendessen'),
  V('hören', 'to listen', 'слушать', 'тыңдау', 'Musik'),
  V('fragen', 'to ask', 'спрашивать', 'сұрау', 'den Lehrer'),
  V('brauchen', 'to need', 'нуждаться', 'қажет ету', 'Hilfe'),
  V('suchen', 'to look for', 'искать', 'іздеу', 'den Schlüssel'),
  V('warten', 'to wait', 'ждать', 'күту', 'auf den Bus'),
  V('öffnen', 'to open', 'открывать', 'ашу', 'das Fenster'),
  V('reisen', 'to travel', 'путешествовать', 'саяхаттау', 'nach Italien', { aux: 's' }),
  V('tanzen', 'to dance', 'танцевать', 'билеу', 'auf der Party'),
  V('besuchen', 'to visit', 'навещать', 'барып көру', 'die Oma', { pp: 'besucht' }),
  V('studieren', 'to study', 'учиться в вузе', 'университетте оқу', 'Medizin', { pp: 'studiert' }),
  V('bezahlen', 'to pay', 'платить', 'төлеу', 'die Rechnung', { pp: 'bezahlt' }),
  V('erzählen', 'to tell', 'рассказывать', 'әңгімелеу', 'eine Geschichte', { pp: 'erzählt' }),
  V('aufräumen', 'to tidy up', 'убирать', 'жинастыру', 'das Zimmer', { sep: 'auf' }),
  V('einkaufen', 'to go shopping', 'делать покупки', 'сауда жасау', 'im Supermarkt', { sep: 'ein' }),
  V('abholen', 'to pick up', 'забирать', 'алып кету', 'die Kinder', { sep: 'ab' }),
  V('fahren', 'to go (by vehicle)', 'ехать', 'бару (көлікпен)', 'nach Hause', { kind: 's', du: 'fährst', er: 'fährt', prat: 'fuhr', pp: 'gefahren', aux: 's' }),
  V('lesen', 'to read', 'читать', 'оқу', 'ein Buch', { kind: 's', du: 'liest', er: 'liest', prat: 'las', pp: 'gelesen' }),
  V('essen', 'to eat', 'есть', 'жеу', 'eine Pizza', { kind: 's', du: 'isst', er: 'isst', prat: 'aß', pp: 'gegessen' }),
  V('sprechen', 'to speak', 'говорить', 'сөйлеу', 'Englisch', { kind: 's', du: 'sprichst', er: 'spricht', prat: 'sprach', pp: 'gesprochen' }),
  V('sehen', 'to see', 'смотреть', 'көру', 'einen Film', { kind: 's', du: 'siehst', er: 'sieht', prat: 'sah', pp: 'gesehen' }),
  V('nehmen', 'to take', 'брать', 'алу', 'den Bus', { kind: 's', du: 'nimmst', er: 'nimmt', prat: 'nahm', pp: 'genommen' }),
  V('helfen', 'to help', 'помогать', 'көмектесу', 'meiner Mutter', { kind: 's', du: 'hilfst', er: 'hilft', prat: 'half', pp: 'geholfen' }),
  V('schlafen', 'to sleep', 'спать', 'ұйықтау', 'sehr lange', { kind: 's', du: 'schläfst', er: 'schläft', prat: 'schlief', pp: 'geschlafen' }),
  V('laufen', 'to run', 'бегать', 'жүгіру', 'durch den Park', { kind: 's', du: 'läufst', er: 'läuft', prat: 'lief', pp: 'gelaufen', aux: 's' }),
  V('trinken', 'to drink', 'пить', 'ішу', 'grünen Tee', { kind: 's', prat: 'trank', pp: 'getrunken' }),
  V('schreiben', 'to write', 'писать', 'жазу', 'einen Brief', { kind: 's', prat: 'schrieb', pp: 'geschrieben' }),
  V('finden', 'to find', 'находить', 'табу', 'den Weg', { kind: 's', prat: 'fand', pp: 'gefunden' }),
  V('singen', 'to sing', 'петь', 'ән айту', 'ein Lied', { kind: 's', prat: 'sang', pp: 'gesungen' }),
  V('gehen', 'to go', 'идти', 'бару', 'ins Kino', { kind: 's', prat: 'ging', pp: 'gegangen', aux: 's' }),
  V('kommen', 'to come', 'приходить', 'келу', 'spät nach Hause', { kind: 's', prat: 'kam', pp: 'gekommen', aux: 's' }),
  V('fliegen', 'to fly', 'лететь', 'ұшу', 'nach Paris', { kind: 's', prat: 'flog', pp: 'geflogen', aux: 's' }),
  V('bleiben', 'to stay', 'оставаться', 'қалу', 'zu Hause', { kind: 's', prat: 'blieb', pp: 'geblieben', aux: 's' }),
  V('tragen', 'to wear, to carry', 'носить', 'кию, көтеру', 'eine Jacke', { kind: 's', du: 'trägst', er: 'trägt', prat: 'trug', pp: 'getragen' }),
  V('treffen', 'to meet', 'встречать', 'кездесу', 'alte Freunde', { kind: 's', du: 'triffst', er: 'trifft', prat: 'traf', pp: 'getroffen' }),
  V('vergessen', 'to forget', 'забывать', 'ұмыту', 'den Termin', { kind: 's', du: 'vergisst', er: 'vergisst', prat: 'vergaß', pp: 'vergessen' }),
  V('verstehen', 'to understand', 'понимать', 'түсіну', 'die Frage', { kind: 's', prat: 'verstand', pp: 'verstanden' }),
  V('waschen', 'to wash', 'мыть', 'жуу', 'das Auto', { kind: 's', du: 'wäschst', er: 'wäscht', prat: 'wusch', pp: 'gewaschen' }),
  V('anrufen', 'to call', 'звонить', 'қоңырау шалу', 'meine Oma', { kind: 's', sep: 'an', prat: 'rief', pp: 'angerufen' }),
  V('aufstehen', 'to get up', 'вставать', 'тұру (төсектен)', 'sehr früh', { kind: 's', sep: 'auf', prat: 'stand', pp: 'aufgestanden', aux: 's' }),
  V('einladen', 'to invite', 'приглашать', 'шақыру', 'meine Freunde', { kind: 's', sep: 'ein', du: 'lädst', er: 'lädt', prat: 'lud', pp: 'eingeladen' }),
  V('ankommen', 'to arrive', 'прибывать', 'келіп жету', 'pünktlich', { kind: 's', sep: 'an', prat: 'kam', pp: 'angekommen', aux: 's' }),
  V('fernsehen', 'to watch TV', 'смотреть телевизор', 'теледидар көру', 'am Abend', { kind: 's', sep: 'fern', du: 'siehst', er: 'sieht', prat: 'sah', pp: 'ferngesehen' }),
  V('denken', 'to think', 'думать', 'ойлау', 'oft an die Prüfung', { kind: 'm', prat: 'dachte', pp: 'gedacht' }),
  V('bringen', 'to bring', 'приносить', 'әкелу', 'einen Kuchen', { kind: 'm', prat: 'brachte', pp: 'gebracht' }),
  V('kennen', 'to know (a person, a place)', 'знать (кого-то, что-то)', 'білу, таныс болу', 'die Stadt gut', { kind: 'm', prat: 'kannte', pp: 'gekannt' }),
  V('wissen', 'to know (a fact)', 'знать (факт)', 'білу (дерек)', 'die Antwort', { kind: 'm', pres: ['weiß', 'weißt', 'weiß', 'wissen', 'wisst', 'wissen'], prat: 'wusste', pp: 'gewusst', kii: 'wüsste' }),
  V('sein', 'to be', 'быть', 'болу', 'zu Hause', { kind: 'aux', pres: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'], prat: 'war', pp: 'gewesen', aux: 's', kii: 'wäre', ki: ['sei', 'seist', 'sei', 'seien', 'seiet', 'seien'] }),
  V('haben', 'to have', 'иметь', 'ие болу', 'viel Zeit', { kind: 'aux', pres: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'], prat: 'hatte', pp: 'gehabt', kii: 'hätte' }),
  V('werden', 'to become', 'становиться', 'болу (айналу)', 'schnell müde', { kind: 'aux', pres: ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'], prat: 'wurde', pp: 'geworden', aux: 's', kii: 'würde' }),
  V('können', 'can', 'мочь', 'алу (істей алу)', 'gut Deutsch sprechen', { kind: 'modal', pres: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'], prat: 'konnte', kii: 'könnte' }),
  V('müssen', 'must', 'быть должным', 'тиіс болу', 'früh aufstehen', { kind: 'modal', pres: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'], prat: 'musste', kii: 'müsste' }),
  V('wollen', 'to want', 'хотеть', 'қалау', 'ein neues Auto kaufen', { kind: 'modal', pres: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'], prat: 'wollte', kii: 'wollte' }),
  V('dürfen', 'may', 'иметь право', 'рұқсаты болу', 'länger fernsehen', { kind: 'modal', pres: ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'], prat: 'durfte', kii: 'dürfte' }),
  V('sollen', 'should', 'быть должным (по совету)', 'тиіс болу (кеңес бойынша)', 'mehr Wasser trinken', { kind: 'modal', pres: ['soll', 'sollst', 'soll', 'sollen', 'sollt', 'sollen'], prat: 'sollte', kii: 'sollte' }),
];

// ---------- Формы ----------
const SEIN = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
const HABEN = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
const WERDEN = ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'];
const WEAK_END = ['e', 'est', 'e', 'en', 'et', 'en'];

/** Основа без приставки: aufstehen → steh. */
const base = (v) => (v.sep ? v.inf.slice(v.sep.length) : v.inf);
const stemOf = (v) => base(v).replace(/e?n$/, '');
/** Нужна ли -e- перед -st/-t: arbeit-e-st, öffn-e-t. */
const needE = (stem) => /[td]$/.test(stem) || /[^lrhmnaeiouäöü][mn]$/.test(stem);

function presForms(v) {
  if (v.pres) return v.pres;
  const st = stemOf(v);
  const e = needE(st) ? 'e' : '';
  const du = v.du ?? (/[sßzx]$/.test(st) ? `${st}t` : `${st}${e}st`);
  const er = v.er ?? `${st}${e}t`;
  const inf = base(v);
  return [`${st}e`, du, er, inf, `${st}${e}t`, inf];
}
function pratForms(v) {
  if (v.inf === 'sein') return ['war', 'warst', 'war', 'waren', 'wart', 'waren'];
  if (!v.prat || /e$/.test(v.prat)) {
    const st = v.prat ? v.prat.slice(0, -1) : `${stemOf(v)}${needE(stemOf(v)) ? 'e' : ''}t`;
    return WEAK_END.map((x) => st + x);
  }
  const p = v.prat;
  const dt = /[td]$/.test(p);
  const s = /[sßz]$/.test(p);
  return [p, `${p}${dt || s ? 'est' : 'st'}`, p, `${p}en`, `${p}${dt ? 'et' : 't'}`, `${p}en`];
}
const ppOf = (v) => v.pp ?? `${v.sep ?? ''}ge${stemOf(v)}${needE(stemOf(v)) ? 'e' : ''}t`;
const auxPres = (v) => (v.aux === 's' ? SEIN : HABEN);
const auxPrat = (v) => (v.aux === 's' ? ['war', 'warst', 'war', 'waren', 'wart', 'waren'] : ['hatte', 'hattest', 'hatte', 'hatten', 'hattet', 'hatten']);
const auxKii = (v) => (v.aux === 's' ? ['wäre', 'wärst', 'wäre', 'wären', 'wärt', 'wären'] : ['hätte', 'hättest', 'hätte', 'hätten', 'hättet', 'hätten']);
const WUERDE = ['würde', 'würdest', 'würde', 'würden', 'würdet', 'würden'];

function kiiForms(v) {
  if (v.inf === 'sein') return ['wäre', 'wärst', 'wäre', 'wären', 'wärt', 'wären'];
  if (v.kii) return WEAK_END.map((x) => v.kii.slice(0, -1) + x);
  return null;
}
function kiForms(v) {
  if (v.ki) return v.ki;
  const st = base(v).replace(/e?n$/, '');
  return WEAK_END.map((x) => st + x);
}

/**
 * Формы глагола во времени для шести лиц. Простые времена: { fin, tail } - спрягаемая часть и
 * что стоит в конце главного предложения; end - как глагол выглядит в конце придаточного.
 */
function forms(v, t) {
  const pp = ppOf(v);
  const simple = (fins) => fins.map((fin) => ({ fin, tail: v.sep ?? '', end: `${v.sep ?? ''}${fin}` }));
  const compound = (auxes, rest) => auxes.map((a) => ({ fin: a, tail: rest, end: `${rest} ${a}` }));
  switch (t) {
    case 'pres': return simple(presForms(v));
    case 'prat': return simple(pratForms(v));
    case 'perf': return compound(auxPres(v), pp);
    case 'plusq': return compound(auxPrat(v), pp);
    case 'fut': return compound(WERDEN, v.inf);
    case 'kii': {
      const own = kiiForms(v);
      return own ? simple(own) : compound(WUERDE, v.inf);
    }
    case 'kiipast': return compound(auxKii(v), pp);
    case 'ki': return simple(kiForms(v));
    default: throw new Error(t);
  }
}

// ---------- Времена ----------
const TENSES = {
  pres: { level: 1, name: L('Präsens (present tense)', 'Präsens (настоящее время)', 'Präsens (осы шақ)'), rule: L('Present tense: stem + -e, -st, -t, -en, -t, -en.', 'Präsens: основа + -e, -st, -t, -en, -t, -en.', 'Präsens: түбір + -e, -st, -t, -en, -t, -en.') },
  perf: { level: 2, name: L('Perfekt', 'Perfekt (разговорное прошедшее)', 'Perfekt (ауызекі өткен шақ)'), rule: L('Perfekt = haben/sein + Partizip II; verbs of movement and change take sein.', 'Perfekt = haben/sein + Partizip II; глаголы движения и изменения состояния - с sein.', 'Perfekt = haben/sein + Partizip II; қозғалыс пен күй өзгерісі етістіктері - sein-мен.') },
  prat: { level: 3, name: L('Präteritum (simple past)', 'Präteritum (простое прошедшее)', 'Präteritum (жай өткен шақ)'), rule: L('Präteritum: weak verbs add -te, strong verbs change the vowel.', 'Präteritum: слабые глаголы получают -te, сильные меняют гласную.', 'Präteritum: әлсіз етістіктер -te алады, күштілердің дауыстысы өзгереді.') },
  fut: { level: 3, name: L('Futur I (future)', 'Futur I (будущее время)', 'Futur I (келер шақ)'), rule: L('Futur I = werden + infinitive.', 'Futur I = werden + инфинитив.', 'Futur I = werden + тұйық етістік.') },
  plusq: { level: 4, name: L('Plusquamperfekt (past perfect)', 'Plusquamperfekt (предпрошедшее)', 'Plusquamperfekt (бұрынғы өткен шақ)'), rule: L('Plusquamperfekt = hatte/war + Partizip II: an action before another past action.', 'Plusquamperfekt = hatte/war + Partizip II: действие раньше другого прошедшего.', 'Plusquamperfekt = hatte/war + Partizip II: басқа өткен әрекеттен бұрынғы әрекет.') },
  kii: { level: 4, name: L('Konjunktiv II', 'Konjunktiv II (сослагательное наклонение)', 'Konjunktiv II (шартты рай)'), rule: L('Konjunktiv II: wäre, hätte, modal verbs (könnte) and wüsste; other verbs use würde + infinitive.', 'Konjunktiv II: wäre, hätte, модальные (könnte) и wüsste; остальные - würde + инфинитив.', 'Konjunktiv II: wäre, hätte, модаль етістіктер (könnte) және wüsste; қалғандары - würde + тұйық етістік.') },
  kiipast: { level: 5, name: L('past Konjunktiv II', 'Konjunktiv II прошедшего времени', 'өткен шақтағы Konjunktiv II'), rule: L('Past Konjunktiv II = hätte/wäre + Partizip II.', 'Konjunktiv II прошедшего = hätte/wäre + Partizip II.', 'Өткен шақтағы Konjunktiv II = hätte/wäre + Partizip II.') },
  ki: { level: 5, name: L('Konjunktiv I (reported speech)', 'Konjunktiv I (косвенная речь)', 'Konjunktiv I (төлеу сөз)'), rule: L('Konjunktiv I: infinitive stem + -e, -est, -e, -en, -et, -en (sein: sei).', 'Konjunktiv I: основа инфинитива + -e, -est, -e, -en, -et, -en (sein: sei).', 'Konjunktiv I: тұйық етістік түбірі + -e, -est, -e, -en, -et, -en (sein: sei).') },
};
const MODAL_OK = new Set(['pres', 'prat', 'kii', 'ki']);

/** Лица: подлежащее в начале предложения и в середине. sie (она/они) не используем - форма совпала бы у двух лиц. */
const PERSONS = [['ich'], ['du'], ['er', 'mein Bruder', 'Anna', 'unser Lehrer'], ['wir', 'meine Frau und ich'], ['ihr'], ['meine Eltern', 'die Kinder', 'unsere Nachbarn']];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

const verbsFor = (level, t) =>
  VERBS.filter((v) => {
    if (v.kind === 'modal' && !MODAL_OK.has(t)) return false;
    if (level >= 6) return v.kind !== 'w';
    if (level === 2 && t === 'prat') return v.kind === 'aux' || v.kind === 'modal';
    return true;
  });

function tensesFor(level) {
  const all = Object.keys(TENSES);
  if (level >= 6) return all;
  if (level === 2) return ['perf', 'prat'];
  return all.filter((t) => TENSES[t].level === level);
}

function explain(v, t, full) {
  const tn = TENSES[t];
  const shown = full.replace(/[.?!]$/, '');
  return L(
    `${tn.rule.en} ${v.inf} (${v.en}): ${shown}.`,
    `${tn.rule.ru} ${v.inf} (${v.ru}) - ${tn.name.ru}: ${shown}.`,
    `${tn.rule.kk} ${v.inf} (${v.kk}) - ${tn.name.kk}: ${shown}.`,
  );
}

/** Предложение для времени: главное (спрягаемая часть в пропуске) или придаточное (весь глагол в конце). */
function sentence(v, t, subj, mid, blank) {
  const o = v.obj;
  switch (t) {
    case 'pres': return `${cap(subj)} ${blank} ${o}${mid ? ' ' + mid : ''}.`;
    case 'prat': return `Früher ${blank} ${subj} oft ${o}${mid ? ' ' + mid : ''}.`;
    case 'ki': return `Sie sagte, ${subj} ${blank} ${o}${mid ? ' ' + mid : ''}.`;
    case 'perf': return `Ich glaube, dass ${subj} gestern ${o} ${blank}.`;
    case 'plusq': return `Nachdem ${subj} ${o} ${blank}, war es schon spät.`;
    case 'fut': return `Ich bin sicher, dass ${subj} nächste Woche ${o} ${blank}.`;
    case 'kii': return `Es wäre schön, wenn ${subj} öfter ${o} ${blank}.`;
    case 'kiipast': return `Wenn ${subj} damals ${o} ${blank}, wäre alles anders gekommen.`;
    default: throw new Error(t);
  }
}
const MAIN = new Set(['pres', 'prat', 'ki']);

/** «Какая форма подходит к лицу»: время дано, выбрать форму для подлежащего. */
function personTask(ctx, topic, t, v) {
  const list = forms(v, t);
  const p = Math.floor(ctx.rng() * 6);
  const subj = pick(ctx.rng, PERSONS[p]);
  const main = MAIN.has(t);
  const show = (f) => (main ? f.fin : f.end);
  const correct = show(list[p]);
  const wrong = shuffle([...new Set(list.map(show).filter((f) => f !== correct))], ctx.rng).slice(0, 3);
  if (wrong.length < 3) return null;
  const passage = `${sentence(v, t, subj, main ? list[p].tail : '', '______')} (${v.inf})`;
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const all = [correct, ...wrong];
  const full = sentence(v, t, subj, main ? list[p].tail : '', correct);
  const q = poolQ(topic, 1, { kind: 'text', passage, prompt: L('Choose the correct form of the verb.', 'Выбери правильную форму глагола.', 'Етістіктің дұрыс түрін таңда.'), ex: explain(v, t, full), mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.voice = { lang: 'de' };
  q.id = `${topic}:p:${v.inf}:${t}:${p}`;
  return q;
}

/**
 * «Какое время нужно по смыслу»: придаточное с подсказкой, выбрать форму того же лица.
 * Прошедшее для sein, haben и модальных - Präteritum (так говорят), для остальных - Perfekt.
 */
const PAST_PRAT = (v) => v.kind === 'aux' || v.kind === 'modal';
const FRAMES = {
  pres: { tpl: (s, o, b) => `Ich sehe, dass ${s} im Moment ${o} ${b}.`, wrong: ['perf', 'fut', 'plusq', 'kiipast'] },
  past: { tpl: (s, o, b) => `Ich weiß, dass ${s} gestern ${o} ${b}.`, wrong: ['pres', 'fut', 'kii', 'kiipast'] },
  fut: { tpl: (s, o, b) => `Ich bin sicher, dass ${s} nächste Woche ${o} ${b}.`, wrong: ['prat', 'plusq', 'kiipast'] },
  plusq: { tpl: (s, o, b) => `Nachdem ${s} ${o} ${b}, war es schon spät.`, wrong: ['pres', 'fut', 'kii'] },
  kii: { tpl: (s, o, b) => `Es wäre schön, wenn ${s} öfter ${o} ${b}.`, wrong: ['perf', 'plusq', 'fut'] },
  kiipast: { tpl: (s, o, b) => `Wenn ${s} damals ${o} ${b}, wäre alles anders gekommen.`, wrong: ['pres', 'perf', 'fut'] },
};
const frameOf = (t) => (t === 'perf' || t === 'prat' ? 'past' : t);

function tenseTask(ctx, topic, t, v) {
  const fr = frameOf(t);
  if (!FRAMES[fr] || t === 'ki') return null;
  const real = fr === 'past' ? (PAST_PRAT(v) ? 'prat' : 'perf') : t;
  const p = Math.floor(ctx.rng() * 6);
  const subj = pick(ctx.rng, PERSONS[p]);
  const end = (tt) => forms(v, tt)[p].end;
  const correct = end(real);
  const wrong = [];
  for (const tt of shuffle(FRAMES[fr].wrong.filter((x) => v.kind !== 'modal' || MODAL_OK.has(x)), ctx.rng)) {
    const f = end(tt);
    if (f !== correct && !wrong.includes(f)) wrong.push(f);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) return null;
  const passage = `${FRAMES[fr].tpl(subj, v.obj, '______')} (${v.inf})`;
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const all = [correct, ...wrong];
  const prompt = L('Which tense fits the sentence? Choose the form.', 'Какое время нужно по смыслу? Выбери форму.', 'Мағынасы бойынша қай шақ керек? Түрін таңда.');
  const q = poolQ(topic, 2, { kind: 'text', passage, prompt, ex: explain(v, real, cap(FRAMES[fr].tpl(subj, v.obj, correct))), mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.voice = { lang: 'de' };
  q.id = `${topic}:t:${v.inf}:${real}:${p}`;
  return q;
}

export function deVerbsMaker(topic) {
  return (ctx, level) => {
    for (let attempt = 0; attempt < 16; attempt++) {
      const own = tensesFor(level);
      const lower = Object.keys(TENSES).filter((t) => TENSES[t].level < level);
      const t = pick(ctx.rng, lower.length && level < 6 && ctx.rng() < 0.35 ? lower : own);
      const v = pick(ctx.rng, verbsFor(level, t));
      const q = (level === 1 || ctx.rng() < 0.55 ? personTask : tenseTask)(ctx, topic, t, v);
      if (q && (!ctx.used?.has(q.id) || attempt === 15)) {
        q.d = Math.min(3, Math.ceil(level / 2));
        q.level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][level - 1];
        return q;
      }
    }
    // Запасной вариант: настоящее время, оно есть у всех глаголов.
    const q = personTask(ctx, topic, 'pres', pick(ctx.rng, VERBS));
    q.d = Math.min(3, Math.ceil(level / 2));
    return q;
  };
}

/** Для тестов: формы глаголов. */
export const _de = { VERBS, forms, presForms, pratForms, ppOf };
