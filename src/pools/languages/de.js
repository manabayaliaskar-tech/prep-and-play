// Немецкий: грамматика по уровням A1-C2 (1…6). Запись как в romance.js:
// [уровень, предложение с пропуском, правильный вариант, [три неправильных], разбор на трёх языках].
// Часть заданий написана вручную, остальные строятся по таблицам (артикли, падежи, окончания прилагательных,
// порядок слов, Perfekt, относительные местоимения, n-склонение, Konjunktiv) - так в каждом варианте ровно один верный.

import { T } from '../bank.js';

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const row = (level, q, ok, wrong, ru, kk, en) => [level, q, ok, wrong, T(ru, kk, en)];
/** Три неправильных варианта: первые разные, не совпадающие с ответом. */
function three(ok, list) {
  const out = [];
  for (const x of list) if (x !== ok && !out.includes(x) && out.length < 3) out.push(x);
  if (out.length < 3) throw new Error(`de: мало вариантов для ${ok}`);
  return out;
}

// ---------- Таблицы ----------
const CASES = ['nom', 'akk', 'dat', 'gen'];
const CASE = {
  nom: { ru: 'Nominativ (именительный падеж)', kk: 'Nominativ (атау септік)', en: 'nominative' },
  akk: { ru: 'Akkusativ (винительный падеж)', kk: 'Akkusativ (табыс септік)', en: 'accusative' },
  dat: { ru: 'Dativ (дательный падеж)', kk: 'Dativ (барыс септік)', en: 'dative' },
  gen: { ru: 'Genitiv (родительный падеж)', kk: 'Genitiv (ілік септік)', en: 'genitive' },
};
const GENDER = {
  m: { ru: 'мужского рода', kk: 'еркек тегіндегі сөз', en: 'masculine' },
  f: { ru: 'женского рода', kk: 'әйел тегіндегі сөз', en: 'feminine' },
  n: { ru: 'среднего рода', kk: 'орта тектегі сөз', en: 'neuter' },
  pl: { ru: 'во множественном числе', kk: 'көпше түрде', en: 'plural' },
};
const DEF = { m: ['der', 'den', 'dem', 'des'], f: ['die', 'die', 'der', 'der'], n: ['das', 'das', 'dem', 'des'], pl: ['die', 'die', 'den', 'der'] };
const INDEF = { m: ['ein', 'einen', 'einem', 'eines'], f: ['eine', 'eine', 'einer', 'einer'], n: ['ein', 'ein', 'einem', 'eines'] };

// Существительные: [слово, род, Genitiv ед. ч., множественное, Dativ мн. ч.].
const THINGS = [
  ['Tisch', 'm', 'Tisches', 'Tische', 'Tischen'],
  ['Stuhl', 'm', 'Stuhls', 'Stühle', 'Stühlen'],
  ['Computer', 'm', 'Computers', 'Computer', 'Computern'],
  ['Mantel', 'm', 'Mantels', 'Mäntel', 'Mänteln'],
  ['Koffer', 'm', 'Koffers', 'Koffer', 'Koffern'],
  ['Rucksack', 'm', 'Rucksacks', 'Rucksäcke', 'Rucksäcken'],
  ['Fernseher', 'm', 'Fernsehers', 'Fernseher', 'Fernsehern'],
  ['Schrank', 'm', 'Schranks', 'Schränke', 'Schränken'],
  ['Lampe', 'f', 'Lampe', 'Lampen', 'Lampen'],
  ['Tasche', 'f', 'Tasche', 'Taschen', 'Taschen'],
  ['Jacke', 'f', 'Jacke', 'Jacken', 'Jacken'],
  ['Uhr', 'f', 'Uhr', 'Uhren', 'Uhren'],
  ['Wohnung', 'f', 'Wohnung', 'Wohnungen', 'Wohnungen'],
  ['Kamera', 'f', 'Kamera', 'Kameras', 'Kameras'],
  ['Brille', 'f', 'Brille', 'Brillen', 'Brillen'],
  ['Buch', 'n', 'Buches', 'Bücher', 'Büchern'],
  ['Auto', 'n', 'Autos', 'Autos', 'Autos'],
  ['Fahrrad', 'n', 'Fahrrads', 'Fahrräder', 'Fahrrädern'],
  ['Haus', 'n', 'Hauses', 'Häuser', 'Häusern'],
  ['Bild', 'n', 'Bildes', 'Bilder', 'Bildern'],
  ['Handy', 'n', 'Handys', 'Handys', 'Handys'],
  ['Kleid', 'n', 'Kleides', 'Kleider', 'Kleidern'],
  ['Sofa', 'n', 'Sofas', 'Sofas', 'Sofas'],
];
const PEOPLE = [
  ['Mann', 'm', 'Mannes', 'Männer', 'Männern'],
  ['Lehrer', 'm', 'Lehrers', 'Lehrer', 'Lehrern'],
  ['Freund', 'm', 'Freundes', 'Freunde', 'Freunden'],
  ['Arzt', 'm', 'Arztes', 'Ärzte', 'Ärzten'],
  ['Bruder', 'm', 'Bruders', 'Brüder', 'Brüdern'],
  ['Onkel', 'm', 'Onkels', 'Onkel', 'Onkeln'],
  ['Frau', 'f', 'Frau', 'Frauen', 'Frauen'],
  ['Lehrerin', 'f', 'Lehrerin', 'Lehrerinnen', 'Lehrerinnen'],
  ['Freundin', 'f', 'Freundin', 'Freundinnen', 'Freundinnen'],
  ['Ärztin', 'f', 'Ärztin', 'Ärztinnen', 'Ärztinnen'],
  ['Schwester', 'f', 'Schwester', 'Schwestern', 'Schwestern'],
  ['Tante', 'f', 'Tante', 'Tanten', 'Tanten'],
  ['Kind', 'n', 'Kindes', 'Kinder', 'Kindern'],
  ['Mädchen', 'n', 'Mädchens', 'Mädchen', 'Mädchen'],
  ['Baby', 'n', 'Babys', 'Babys', 'Babys'],
];
const form = (noun, c) => (c === 'gen' && noun[1] !== 'f' ? noun[2] : noun[0]);

// Почему здесь этот падеж: frame - [шаблон, падеж, причина ru, kk, en].
const THING_FRAMES = [
  ['{X} ist sehr teuer.', 'nom', 'Подлежащее стоит в Nominativ', 'Бастауыш Nominativ-те тұрады', 'The subject is in the nominative'],
  ['{X} ist leider kaputt.', 'nom', 'Подлежащее стоит в Nominativ', 'Бастауыш Nominativ-те тұрады', 'The subject is in the nominative'],
  ['Ich kaufe {X}.', 'akk', 'Прямое дополнение глагола kaufen - Akkusativ', 'kaufen етістігінің тура толықтауышы - Akkusativ', 'The direct object of kaufen is in the accusative'],
  ['Wir brauchen {X} nicht mehr.', 'akk', 'Прямое дополнение глагола brauchen - Akkusativ', 'brauchen етістігінің тура толықтауышы - Akkusativ', 'The direct object of brauchen is in the accusative'],
  ['Ich bin mit {X} sehr zufrieden.', 'dat', 'После предлога mit всегда Dativ', 'mit предлогынан кейін әрқашан Dativ', 'The preposition mit is always followed by the dative'],
  ['Was machst du mit {X}?', 'dat', 'После предлога mit всегда Dativ', 'mit предлогынан кейін әрқашан Dativ', 'The preposition mit is always followed by the dative'],
  ['Der Preis {X} ist zu hoch.', 'gen', 'Принадлежность («цена чего?») выражает Genitiv', 'Тиесілікті («ненің бағасы?») Genitiv білдіреді', 'Possession ("the price of what?") is expressed by the genitive'],
  ['Die Farbe {X} gefällt mir.', 'gen', 'Принадлежность («цвет чего?») выражает Genitiv', 'Тиесілікті («ненің түсі?») Genitiv білдіреді', 'Possession ("the colour of what?") is expressed by the genitive'],
];
const PEOPLE_FRAMES = [
  ['{X} ist heute nicht da.', 'nom', 'Подлежащее стоит в Nominativ', 'Бастауыш Nominativ-те тұрады', 'The subject is in the nominative'],
  ['Ich besuche morgen {X}.', 'akk', 'Прямое дополнение глагола besuchen - Akkusativ', 'besuchen етістігінің тура толықтауышы - Akkusativ', 'The direct object of besuchen is in the accusative'],
  ['Kennst du {X}?', 'akk', 'Прямое дополнение глагола kennen - Akkusativ', 'kennen етістігінің тура толықтауышы - Akkusativ', 'The direct object of kennen is in the accusative'],
  ['Ich helfe {X}.', 'dat', 'Глагол helfen требует Dativ', 'helfen етістігі Dativ талап етеді', 'The verb helfen takes the dative'],
  ['Wir danken {X}.', 'dat', 'Глагол danken требует Dativ', 'danken етістігі Dativ талап етеді', 'The verb danken takes the dative'],
  ['Das ist das Auto {X}.', 'gen', 'Принадлежность («чья машина?») выражает Genitiv', 'Тиесілікті («кімнің көлігі?») Genitiv білдіреді', 'Possession ("whose car?") is expressed by the genitive'],
  ['Der Name {X} ist schwer.', 'gen', 'Принадлежность («чьё имя?») выражает Genitiv', 'Тиесілікті («кімнің аты?») Genitiv білдіреді', 'Possession ("whose name?") is expressed by the genitive'],
];

const INDEF_FRAMES = [
  ['Das ist {X}.', 'nom', 'После das ist - Nominativ', 'das ist-тен кейін - Nominativ', 'After das ist comes the nominative'],
  ['Ich kaufe {X}.', 'akk', 'Прямое дополнение глагола kaufen - Akkusativ', 'kaufen етістігінің тура толықтауышы - Akkusativ', 'The direct object of kaufen is in the accusative'],
  ['Ich brauche {X}.', 'akk', 'Прямое дополнение глагола brauchen - Akkusativ', 'brauchen етістігінің тура толықтауышы - Akkusativ', 'The direct object of brauchen is in the accusative'],
];

/** Именная группа в падеже: артикль + существительное, варианты - другие падежи и другие роды. */
function caseRows(level, nouns, frames, art, cases) {
  const out = [];
  nouns.forEach((noun, i) => {
    for (const c of cases) {
      const fs = frames.filter((f) => f[1] === c);
      const [tpl, , ru, kk, en] = fs[i % fs.length];
      const g = noun[1];
      const ci = CASES.indexOf(c);
      const phrase = (gg, cc) => `${art[gg][CASES.indexOf(cc)]} ${form(noun, cc)}`;
      const ok = phrase(g, c);
      const others = Object.keys(art).filter((gg) => gg !== g && gg !== 'pl');
      const pool = [
        ...CASES.filter((cc) => cc !== c && cc !== 'gen').map((cc) => phrase(g, cc)),
        ...others.map((gg) => `${art[gg][ci]} ${form(noun, c)}`),
        phrase(g, 'gen'),
        ...others.flatMap((gg) => CASES.map((cc) => `${art[gg][CASES.indexOf(cc)]} ${form(noun, c)}`)),
      ];
      // Множественное число тоже было бы верным (die Lehrer, der Computer) - такие варианты убираем.
      const plural = art === DEF ? `${DEF.pl[ci]} ${c === 'dat' ? noun[4] : noun[3]}` : null;
      const start = tpl.startsWith('{X}');
      const fix = (s) => (start ? cap(s) : s);
      const sentence = tpl.replace('{X}', '______');
      out.push(row(level, sentence, fix(ok), three(fix(ok), pool.filter((x) => x !== plural).map(fix)),
        `${ru}. ${noun[0]} - ${GENDER[g].ru}, поэтому: ${ok}.`,
        `${kk}. ${noun[0]} - ${GENDER[g].kk}, сондықтан: ${ok}.`,
        `${en}. ${noun[0]} is ${GENDER[g].en}, so: ${ok}.`));
    }
  });
  return out;
}

// ---------- sein и haben (A1) ----------
const SEIN = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
const HABEN = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
const ALT = [2, 2, 0, 4, 3, 4];
const SUBJ = [['Ich'], ['Du'], ['Er', 'Anna', 'Mein Vater', 'Unser Lehrer'], ['Wir'], ['Ihr'], ['Meine Eltern', 'Die Kinder', 'Unsere Nachbarn']];
const PRON_RU = ['ich (я)', 'du (ты)', 'er/sie/es (он, она, оно)', 'wir (мы)', 'ihr (вы, несколько человек)', 'sie (они)'];
const PRON_KK = ['ich (мен)', 'du (сен)', 'er/sie/es (ол)', 'wir (біз)', 'ihr (сендер)', 'sie (олар)'];
const PRON_EN = ['ich (I)', 'du (you)', 'er/sie/es (he/she/it)', 'wir (we)', 'ihr (you, plural)', 'sie (they)'];

function seinHaben() {
  const out = [];
  const seinComp = ['müde', 'aus Kasachstan', 'heute zu Hause', 'sehr glücklich', 'krank', 'in der Schule'];
  const habenComp = ['Hunger', 'heute keine Zeit', 'ein Auto', 'Durst', 'Kopfschmerzen', 'einen Hund'];
  for (let p = 0; p < 6; p++) {
    seinComp.forEach((comp, k) => {
      const S = SUBJ[p][k % SUBJ[p].length];
      const ok = SEIN[p];
      out.push(row(1, `${S} ______ ${comp}.`, ok, [HABEN[p], SEIN[ALT[p]], HABEN[ALT[p]]],
        `Состояние, место или происхождение - глагол sein («быть»). Для ${PRON_RU[p]}: ${S} ${ok} ${comp}.`,
        `Күй, орын немесе шыққан жер - sein («болу») етістігі. ${PRON_KK[p]} үшін: ${S} ${ok} ${comp}.`,
        `A state, place or origin takes sein ("to be"). For ${PRON_EN[p]}: ${S} ${ok} ${comp}.`));
    });
    habenComp.forEach((comp, k) => {
      const S = SUBJ[p][(k + 1) % SUBJ[p].length];
      const ok = HABEN[p];
      out.push(row(1, `${S} ______ ${comp}.`, ok, [SEIN[p], HABEN[ALT[p]], SEIN[ALT[p]]],
        `«Что у кого есть» (вещь, время, голод, жажда) - глагол haben («иметь»): Hunger haben - быть голодным. Для ${PRON_RU[p]}: ${S} ${ok} ${comp}.`,
        `«Кімде не бар» (зат, уақыт, аштық, шөл) - haben («ие болу») етістігі: Hunger haben - қарны ашу. ${PRON_KK[p]} үшін: ${S} ${ok} ${comp}.`,
        `"Having" something (a thing, time, hunger, thirst) takes haben: Hunger haben means "to be hungry". For ${PRON_EN[p]}: ${S} ${ok} ${comp}.`));
    });
  }
  return out;
}

// ---------- Perfekt: haben или sein (A2) ----------
const PERF_VERBS = [
  // [инфинитив, Partizip II, вспомогательный, дополнение, перевод ru, kk, en]
  ['gehen', 'gegangen', 's', 'ins Kino', 'идти', 'бару', 'to go'],
  ['fahren', 'gefahren', 's', 'nach Berlin', 'ехать', 'бару (көлікпен)', 'to go (by vehicle)'],
  ['kommen', 'gekommen', 's', 'spät nach Hause', 'приходить', 'келу', 'to come'],
  ['fliegen', 'geflogen', 's', 'nach Paris', 'лететь', 'ұшу', 'to fly'],
  ['laufen', 'gelaufen', 's', 'durch den Park', 'бегать, идти пешком', 'жүгіру, жаяу жүру', 'to run, to walk'],
  ['aufstehen', 'aufgestanden', 's', 'früh', 'вставать', 'тұру (төсектен)', 'to get up'],
  ['bleiben', 'geblieben', 's', 'zu Hause', 'оставаться', 'қалу', 'to stay'],
  ['reisen', 'gereist', 's', 'nach Italien', 'путешествовать', 'саяхаттау', 'to travel'],
  ['einschlafen', 'eingeschlafen', 's', 'sofort', 'засыпать', 'ұйықтап кету', 'to fall asleep'],
  ['umziehen', 'umgezogen', 's', 'nach München', 'переезжать', 'көшу', 'to move house'],
  ['ankommen', 'angekommen', 's', 'pünktlich', 'прибывать', 'келіп жету', 'to arrive'],
  ['sein', 'gewesen', 's', 'krank', 'быть', 'болу', 'to be'],
  ['machen', 'gemacht', 'h', 'die Hausaufgaben', 'делать', 'істеу', 'to do'],
  ['kaufen', 'gekauft', 'h', 'ein Buch', 'покупать', 'сатып алу', 'to buy'],
  ['lesen', 'gelesen', 'h', 'die Zeitung', 'читать', 'оқу', 'to read'],
  ['essen', 'gegessen', 'h', 'eine Pizza', 'есть', 'жеу', 'to eat'],
  ['trinken', 'getrunken', 'h', 'viel Tee', 'пить', 'ішу', 'to drink'],
  ['schreiben', 'geschrieben', 'h', 'einen Brief', 'писать', 'жазу', 'to write'],
  ['sehen', 'gesehen', 'h', 'einen Film', 'смотреть, видеть', 'көру', 'to see'],
  ['spielen', 'gespielt', 'h', 'Fußball', 'играть', 'ойнау', 'to play'],
  ['lernen', 'gelernt', 'h', 'Deutsch', 'учить', 'үйрену', 'to learn'],
  ['arbeiten', 'gearbeitet', 'h', 'viel', 'работать', 'жұмыс істеу', 'to work'],
  ['schlafen', 'geschlafen', 'h', 'lange', 'спать', 'ұйықтау', 'to sleep'],
  ['anrufen', 'angerufen', 'h', 'meine Oma', 'звонить', 'қоңырау шалу', 'to call'],
  ['besuchen', 'besucht', 'h', 'meine Tante', 'навещать', 'барып көру', 'to visit'],
  ['finden', 'gefunden', 'h', 'den Schlüssel', 'находить', 'табу', 'to find'],
  ['verstehen', 'verstanden', 'h', 'die Frage', 'понимать', 'түсіну', 'to understand'],
  ['kochen', 'gekocht', 'h', 'Suppe', 'варить, готовить', 'тамақ пісіру', 'to cook'],
];

function perfAux() {
  const out = [];
  PERF_VERBS.forEach(([inf, pp, aux, comp, ru, kk, en], i) => {
    for (const p of [i % 6, (i + 3) % 6]) {
      const S = SUBJ[p][i % SUBJ[p].length];
      const own = aux === 's' ? SEIN : HABEN;
      const other = aux === 's' ? HABEN : SEIN;
      const ok = own[p];
      const why = aux === 's'
        ? ['глагол движения или изменения состояния (а также sein и bleiben) образует Perfekt с sein', 'қозғалыс не күй өзгерісі етістігі (сондай-ақ sein мен bleiben) Perfekt-ті sein-мен жасайды', 'verbs of movement or change of state (and sein, bleiben) form the Perfekt with sein']
        : ['большинство глаголов, особенно с дополнением, образуют Perfekt с haben', 'етістіктердің көбі, әсіресе толықтауышы барлары, Perfekt-ті haben-мен жасайды', 'most verbs, especially those with an object, form the Perfekt with haben'];
      out.push(row(2, `${S} ______ gestern ${comp} ${pp}.`, ok, [other[p], own[ALT[p]], other[ALT[p]]],
        `${inf} (${ru}): ${why[0]}. ${S} ${ok} gestern ${comp} ${pp}.`,
        `${inf} (${kk}): ${why[1]}. ${S} ${ok} gestern ${comp} ${pp}.`,
        `${inf} (${en}): ${why[2]}. ${S} ${ok} gestern ${comp} ${pp}.`));
    }
  });
  return out;
}

// ---------- Partizip II (A2) ----------
// [инфинитив, Partizip II, Präteritum (er), вид: w - слабый, s - сильный, sep - отделяемый, ins - неотделяемая приставка, ier - на -ieren, ru, kk, en, дополнение, aux]
const PART = [
  ['machen', 'gemacht', 'machte', 'w', 'делать', 'істеу', 'to do', 'die Hausaufgaben', 'h'],
  ['kaufen', 'gekauft', 'kaufte', 'w', 'покупать', 'сатып алу', 'to buy', 'Brot', 'h'],
  ['spielen', 'gespielt', 'spielte', 'w', 'играть', 'ойнау', 'to play', 'Tennis', 'h'],
  ['fragen', 'gefragt', 'fragte', 'w', 'спрашивать', 'сұрау', 'to ask', 'den Lehrer', 'h'],
  ['kochen', 'gekocht', 'kochte', 'w', 'готовить', 'тамақ пісіру', 'to cook', 'Reis', 'h'],
  ['hören', 'gehört', 'hörte', 'w', 'слушать', 'тыңдау', 'to listen', 'Musik', 'h'],
  ['sehen', 'gesehen', 'sah', 's', 'видеть', 'көру', 'to see', 'einen Film', 'h'],
  ['schreiben', 'geschrieben', 'schrieb', 's', 'писать', 'жазу', 'to write', 'eine E-Mail', 'h'],
  ['trinken', 'getrunken', 'trank', 's', 'пить', 'ішу', 'to drink', 'Kaffee', 'h'],
  ['finden', 'gefunden', 'fand', 's', 'находить', 'табу', 'to find', 'das Handy', 'h'],
  ['nehmen', 'genommen', 'nahm', 's', 'брать', 'алу', 'to take', 'ein Taxi', 'h'],
  ['sprechen', 'gesprochen', 'sprach', 's', 'говорить', 'сөйлеу', 'to speak', 'mit dem Chef', 'h'],
  ['singen', 'gesungen', 'sang', 's', 'петь', 'ән айту', 'to sing', 'ein Lied', 'h'],
  ['anrufen', 'angerufen', 'rief an', 'sep', 'звонить', 'қоңырау шалу', 'to call', 'den Arzt', 'h'],
  ['einkaufen', 'eingekauft', 'kaufte ein', 'sep', 'делать покупки', 'сауда жасау', 'to go shopping', 'im Supermarkt', 'h'],
  ['aufräumen', 'aufgeräumt', 'räumte auf', 'sep', 'убирать', 'жинастыру', 'to tidy up', 'das Zimmer', 'h'],
  ['einladen', 'eingeladen', 'lud ein', 'sep', 'приглашать', 'шақыру', 'to invite', 'alle Freunde', 'h'],
  ['fernsehen', 'ferngesehen', 'sah fern', 'sep', 'смотреть телевизор', 'теледидар көру', 'to watch TV', 'den ganzen Abend', 'h'],
  ['mitbringen', 'mitgebracht', 'brachte mit', 'sep', 'приносить с собой', 'ала келу', 'to bring along', 'einen Kuchen', 'h'],
  ['besuchen', 'besucht', 'besuchte', 'ins', 'навещать', 'барып көру', 'to visit', 'die Großeltern', 'h'],
  ['bezahlen', 'bezahlt', 'bezahlte', 'ins', 'платить', 'төлеу', 'to pay', 'die Rechnung', 'h'],
  ['erzählen', 'erzählt', 'erzählte', 'ins', 'рассказывать', 'әңгімелеу', 'to tell', 'eine Geschichte', 'h'],
  ['verstehen', 'verstanden', 'verstand', 'ins', 'понимать', 'түсіну', 'to understand', 'alles', 'h'],
  ['vergessen', 'vergessen', 'vergaß', 'ins', 'забывать', 'ұмыту', 'to forget', 'den Termin', 'h'],
  ['bekommen', 'bekommen', 'bekam', 'ins', 'получать', 'алу', 'to get', 'ein Geschenk', 'h'],
  ['studieren', 'studiert', 'studierte', 'ier', 'учиться в вузе', 'университетте оқу', 'to study', 'in Berlin', 'h'],
  ['telefonieren', 'telefoniert', 'telefonierte', 'ier', 'говорить по телефону', 'телефонмен сөйлесу', 'to phone', 'mit meiner Mutter', 'h'],
  ['reparieren', 'repariert', 'reparierte', 'ier', 'ремонтировать', 'жөндеу', 'to repair', 'das Fahrrad', 'h'],
  ['fotografieren', 'fotografiert', 'fotografierte', 'ier', 'фотографировать', 'суретке түсіру', 'to photograph', 'den Dom', 'h'],
];
const PART_RULE = {
  w: ['слабый глагол: ge- + основа + -t', 'әлсіз етістік: ge- + түбір + -t', 'a weak verb: ge- + stem + -t'],
  s: ['сильный глагол: ge- + основа (часто с другой гласной) + -en', 'күшті етістік: ge- + түбір (дауыстысы жиі өзгереді) + -en', 'a strong verb: ge- + stem (often with a vowel change) + -en'],
  sep: ['у отделяемой приставки ge- встаёт между приставкой и основой', 'бөлінетін префиксте ge- префикс пен түбірдің арасына тұрады', 'with a separable prefix, ge- goes between the prefix and the stem'],
  ins: ['у неотделяемой приставки (be-, ver-, er-) нет ge-', 'бөлінбейтін префикс (be-, ver-, er-) болса, ge- қосылмайды', 'verbs with an inseparable prefix (be-, ver-, er-) have no ge-'],
  ier: ['у глаголов на -ieren нет ge-', '-ieren-мен аяқталатын етістіктерде ge- болмайды', 'verbs ending in -ieren have no ge-'],
};
function partRows() {
  return PART.map(([inf, pp, prat, kind, ru, kk, en, obj], i) => {
    const stem = inf.replace(/en$/, '');
    const fake = kind === 'w' ? `ge${stem}en` : kind === 's' ? `ge${stem}t` : kind === 'sep' ? `ge${inf}` : `ge${pp}`;
    const S = ['Wir haben', 'Ich habe', 'Er hat', 'Habt ihr', 'Meine Eltern haben'][i % 5];
    const q = S.startsWith('Habt') ? `${S} gestern ${obj} ______? (${inf})` : `${S} gestern ${obj} ______. (${inf})`;
    const r = PART_RULE[kind];
    const pratJoined = prat.includes(' ') ? `${prat.split(' ')[1]}${prat.split(' ')[0]}` : prat;
    return row(2, q, pp, three(pp, [inf, fake, pratJoined, `${stem}t`, `ge${pp}`]),
      `Perfekt = haben/sein + Partizip II. ${inf} (${ru}) - ${r[0]}: ${pp}.`,
      `Perfekt = haben/sein + Partizip II. ${inf} (${kk}) - ${r[1]}: ${pp}.`,
      `Perfekt = haben/sein + Partizip II. ${inf} (${en}) is ${r[2]}: ${pp}.`);
  });
}

// ---------- Порядок слов (A2 - V2 после обстоятельства, B1 - придаточные) ----------
// Предложение: подлежащее, спрягаемый глагол, остальное, хвост (приставка, инфинитив или причастие).
const CLAUSES = [
  ['er', 'kommt', 'morgen zu uns', ''],
  ['sie', 'wohnt', 'seit zwei Jahren in Berlin', ''],
  ['wir', 'haben', 'heute keine Zeit', ''],
  ['der Zug', 'fährt', 'um acht Uhr', 'ab'],
  ['du', 'kannst', 'sehr gut', 'schwimmen'],
  ['ihr', 'habt', 'das Buch schon', 'gelesen'],
  ['Anna', 'lernt', 'jeden Tag Deutsch', ''],
  ['mein Bruder', 'arbeitet', 'in einer Bank', ''],
  ['die Kinder', 'spielen', 'im Garten', ''],
  ['das Museum', 'ist', 'montags geschlossen', ''],
  ['Tom', 'ruft', 'heute Abend', 'an'],
  ['sie', 'will', 'später Ärztin', 'werden'],
  ['wir', 'sind', 'gestern spät', 'angekommen'],
  ['der Film', 'beginnt', 'um 20 Uhr', ''],
  ['meine Eltern', 'kaufen', 'ein neues Auto', ''],
  ['er', 'muss', 'heute länger', 'arbeiten'],
];
const REASONS = [
  ['ich', 'bin', 'krank', ''],
  ['es', 'regnet', 'sehr stark', ''],
  ['ich', 'muss', 'für die Prüfung', 'lernen'],
  ['mein Auto', 'ist', 'kaputt', ''],
  ['ich', 'habe', 'keine Lust', ''],
  ['meine Tante', 'kommt', 'heute zu Besuch', ''],
  ['ich', 'habe', 'mir das Bein', 'gebrochen'],
  ['der Bus', 'fährt', 'heute nicht', ''],
];
const tailKind = (c) => (!c[3] ? 'simple' : /^(ab|an|auf|ein|mit)$/.test(c[3]) ? 'sep' : 'complex');
const verbLast = (c) => `${c[0]} ${c[2]} ${tailKind(c) === 'sep' ? c[3] + c[1] : c[3] ? `${c[3]} ${c[1]}` : c[1]}`;
const mainOrder = (c) => `${c[0]} ${c[1]} ${c[2]}${c[3] ? ' ' + c[3] : ''}`;

function subordinateRows() {
  const out = [];
  const frames = [
    ['Ich glaube, dass ______.', 'dass'],
    ['Weißt du, ob ______?', 'ob'],
    ['Er sagt, dass ______.', 'dass'],
    ['Ich frage mich, ob ______.', 'ob'],
  ];
  const push = (q, conj, c) => {
    const ok = verbLast(c);
    const k = tailKind(c);
    const wrong3 = k === 'sep' ? `${c[0]} ${c[3]}${c[1]} ${c[2]}` : k === 'complex' ? `${c[0]} ${c[2]} ${c[1]} ${c[3]}` : `${c[2]} ${c[0]} ${c[1]}`;
    out.push(row(3, q, ok, three(ok, [mainOrder(c), `${c[1]} ${c[0]} ${c[2]}${c[3] ? ' ' + c[3] : ''}`, wrong3]),
      `После ${conj} - придаточное предложение: спрягаемый глагол (${c[1]}) уходит в самый конец${k === 'sep' ? ', а отделяемая приставка снова пишется слитно' : ''}: ${ok}.`,
      `${conj} - бағыныңқы сөйлем: жіктелетін етістік (${c[1]}) ең соңына шығады${k === 'sep' ? ', ал бөлінетін префикс етістікпен бірге жазылады' : ''}: ${ok}.`,
      `${conj} starts a subordinate clause, so the finite verb (${c[1]}) goes to the very end${k === 'sep' ? ' and the separable prefix joins the verb again' : ''}: ${ok}.`));
  };
  CLAUSES.forEach((c, i) => {
    for (const k of [i % 4, (i + 2) % 4]) push(frames[k][0], frames[k][1], c);
  });
  REASONS.forEach((c) => push('Ich bleibe heute zu Hause, weil ______.', 'weil', c));
  return out;
}

function inversionRows() {
  const out = [];
  const advs = ['Heute', 'Am Wochenende', 'Leider', 'Zum Glück', 'Jetzt'];
  const list = CLAUSES.filter((c) => !/morgen|heute|gestern|montags|jeden Tag|seit/.test(c[2]));
  const extra = [['ich', 'gehe', 'ins Kino', ''], ['wir', 'besuchen', 'unsere Großeltern', ''], ['ich', 'stehe', 'sehr früh', 'auf'], ['Maria', 'kocht', 'für die ganze Familie', ''], ['ich', 'habe', 'keine Zeit', ''], ['wir', 'fahren', 'mit dem Zug nach Hamburg', '']];
  [...list, ...extra].forEach((c, i) => {
    const adv = advs[i % advs.length];
    const tail = c[3] ? ' ' + c[3] : '';
    const ok = `${c[1]} ${c[0]} ${c[2]}${tail}`;
    out.push(row(2, `${adv} ______.`, ok, three(ok, [mainOrder(c), verbLast(c), `${c[1]} ${c[2]} ${c[0]}${tail}`]),
      `В немецком спрягаемый глагол всегда на втором месте. Первое место занято («${adv}»), поэтому подлежащее идёт после глагола: ${adv} ${ok}.`,
      `Неміс тілінде жіктелетін етістік әрқашан екінші орында тұрады. Бірінші орында «${adv}» тұр, сондықтан бастауыш етістіктен кейін келеді: ${adv} ${ok}.`,
      `In German the finite verb is always in second position. "${adv}" takes the first place, so the subject comes after the verb: ${adv} ${ok}.`));
  });
  return out;
}

// ---------- Предлоги с двумя падежами: wo? - Dativ, wohin? - Akkusativ (B1) ----------
function twoWayRows() {
  const out = [];
  const inPlaces = [['Kino', 'n'], ['Museum', 'n'], ['Theater', 'n'], ['Schwimmbad', 'n'], ['Schule', 'f'], ['Stadt', 'f'], ['Bibliothek', 'f'], ['Apotheke', 'f'], ['Park', 'm'], ['Garten', 'm'], ['Supermarkt', 'm'], ['Zoo', 'm']];
  const IN = { akk: { m: 'in den', f: 'in die', n: 'ins' }, dat: { m: 'im', f: 'in der', n: 'im' } };
  const onPlaces = [['Tisch', 'm'], ['Stuhl', 'm'], ['Schrank', 'm'], ['Bett', 'n'], ['Sofa', 'n'], ['Regal', 'n'], ['Bank', 'f']];
  const AUF = { akk: { m: 'auf den', f: 'auf die', n: 'auf das' }, dat: { m: 'auf dem', f: 'auf der', n: 'auf dem' } };
  const add = (tpl, place, g, table, c, all) => {
    const ok = table[c][g];
    const other = c === 'akk' ? 'dat' : 'akk';
    out.push(row(3, tpl.replace('{X}', place), ok, three(ok, [table[other][g], ...all]),
      c === 'akk'
        ? `Вопрос «куда?» (wohin?) - движение, поэтому Akkusativ. ${place} - ${GENDER[g].ru}: ${ok} ${place}.`
        : `Вопрос «где?» (wo?) - место, поэтому Dativ. ${place} - ${GENDER[g].ru}: ${ok} ${place}.`,
      c === 'akk'
        ? `«Қайда?» (wohin?) сұрағы - қозғалыс, сондықтан Akkusativ. ${place} - ${GENDER[g].kk}: ${ok} ${place}.`
        : `«Қай жерде?» (wo?) сұрағы - орын, сондықтан Dativ. ${place} - ${GENDER[g].kk}: ${ok} ${place}.`,
      c === 'akk'
        ? `"Where to?" (wohin?) means movement, so the accusative. ${place} is ${GENDER[g].en}: ${ok} ${place}.`
        : `"Where?" (wo?) means location, so the dative. ${place} is ${GENDER[g].en}: ${ok} ${place}.`));
  };
  const inAll = ['in den', 'in die', 'ins', 'im', 'in der'];
  const aufAll = ['auf den', 'auf die', 'auf das', 'auf dem', 'auf der'];
  for (const [p, g] of inPlaces) {
    add('Wir gehen heute ______ {X}.', p, g, IN, 'akk', inAll);
    add('Wir sind gerade ______ {X}.', p, g, IN, 'dat', inAll);
  }
  for (const [p, g] of onPlaces) {
    add('Ich lege das Buch ______ {X}.', p, g, AUF, 'akk', aufAll);
    add('Das Buch liegt ______ {X}.', p, g, AUF, 'dat', aufAll);
  }
  return out;
}

// ---------- Окончания прилагательных (B1, B2) ----------
const ADJ = [['neu', 'новый', 'жаңа', 'new'], ['alt', 'старый', 'ескі', 'old'], ['klein', 'маленький', 'кішкентай', 'small'], ['groß', 'большой', 'үлкен', 'big'], ['schön', 'красивый', 'әдемі', 'beautiful'], ['rot', 'красный', 'қызыл', 'red'], ['schwarz', 'чёрный', 'қара', 'black'], ['billig', 'дешёвый', 'арзан', 'cheap'], ['modern', 'современный', 'заманауи', 'modern'], ['weiß', 'белый', 'ақ', 'white']];
const ENDS = ['e', 'en', 'er', 'es', 'em'];
const WEAK = { nom: { m: 'e', f: 'e', n: 'e', pl: 'en' }, akk: { m: 'en', f: 'e', n: 'e', pl: 'en' }, dat: { m: 'en', f: 'en', n: 'en', pl: 'en' }, gen: { m: 'en', f: 'en', n: 'en', pl: 'en' } };
const MIXED = { nom: { m: 'er', f: 'e', n: 'es' }, akk: { m: 'en', f: 'e', n: 'es' }, dat: { m: 'en', f: 'en', n: 'en' }, gen: { m: 'en', f: 'en', n: 'en' } };
const STRONG = { nom: { m: 'er', f: 'e', n: 'es', pl: 'e' }, akk: { m: 'en', f: 'e', n: 'es', pl: 'e' }, dat: { m: 'em', f: 'er', n: 'em', pl: 'en' }, gen: { m: 'en', f: 'er', n: 'en', pl: 'er' } };
const DECL = {
  weak: ['после определённого артикля (der, die, das) - слабое склонение', 'анық артикльден (der, die, das) кейін - әлсіз септелу', 'after the definite article (der, die, das) the weak endings are used'],
  mixed: ['после ein, kein, mein - смешанное склонение: где у артикля нет окончания, его показывает прилагательное', 'ein, kein, mein-нен кейін - аралас септелу: артикльде жалғау болмаса, оны сын есім көрсетеді', 'after ein, kein, mein the mixed endings are used: where the article has no ending, the adjective shows it'],
  strong: ['без артикля прилагательное само показывает падеж и род - сильное склонение', 'артикль жоқ кезде септік пен текті сын есімнің өзі көрсетеді - күшті септелу', 'with no article the adjective itself shows case and gender (strong endings)'],
};
const ADJ_FRAMES = [
  // [уровень, шаблон, падеж, тип, род/число; {A} - артикль, {N} - существительное, ___ - прилагательное]
  [3, '{A} ______ {N} ist sehr praktisch.', 'nom', 'weak'],
  [3, 'Das ist {A} ______ {N}.', 'nom', 'mixed'],
  [3, 'Ich nehme {A} ______ {N}.', 'akk', 'weak'],
  [3, 'Ich suche {A} ______ {N}.', 'akk', 'mixed'],
  [4, 'Was machst du mit {A} ______ {N}?', 'dat', 'weak'],
  [4, 'Sie kam mit {A} ______ {N} nach Hause.', 'dat', 'mixed'],
  [4, 'Der Preis {A} ______ {N} ist zu hoch.', 'gen', 'weak'],
];
function adjRows() {
  const out = [];
  const nouns = THINGS.filter((t) => !['Handy', 'Sofa', 'Kamera'].includes(t[0]));
  ADJ_FRAMES.forEach(([level, tpl, c, kind], fi) => {
    nouns.forEach((noun, ni) => {
      if ((ni + fi) % 2) return;
      const g = noun[1];
      const ci = CASES.indexOf(c);
      const art = (kind === 'weak' ? DEF : INDEF)[g][ci];
      const end = (kind === 'weak' ? WEAK : MIXED)[c][g];
      const [adj, ru, kk, en] = ADJ[(ni + fi * 3) % ADJ.length];
      const start = tpl.startsWith('{A}');
      const q = tpl.replace('{A}', start ? cap(art) : art).replace('{N}', form(noun, c)) + ` (${adj})`;
      const ok = adj + end;
      const phrase = `${art} ${ok} ${form(noun, c)}`;
      out.push(row(level, q, ok, three(ok, ENDS.slice(ni % 5).concat(ENDS).map((e) => adj + e)),
        `${CASE[c].ru}, ${noun[0]} - ${GENDER[g].ru}; ${DECL[kind][0]}: ${phrase} (${ru}).`,
        `${CASE[c].kk}, ${noun[0]} - ${GENDER[g].kk}; ${DECL[kind][1]}: ${phrase} (${kk}).`,
        `${cap(CASE[c].en)}, ${noun[0]} is ${GENDER[g].en}; ${DECL[kind][2]}: ${phrase} (${en}).`));
    });
  });
  // Множественное число и сильное склонение (B2).
  const plural = [
    ['Die ______ {P} sind sehr teuer.', 'nom', 'weak', 'die'],
    ['Wir verkaufen ______ {P}.', 'akk', 'strong', ''],
    ['Was machst du mit den ______ {P}?', 'dat', 'weak', 'den'],
  ];
  plural.forEach(([tpl, c, kind], fi) => {
    THINGS.forEach((noun, ni) => {
      if ((ni + fi) % 3) return;
      const [adj, ru, kk, en] = ADJ[(ni + fi) % ADJ.length];
      const word = c === 'dat' ? noun[4] : noun[3];
      const end = (kind === 'weak' ? WEAK : STRONG)[c].pl;
      const ok = tpl.startsWith('______') ? cap(adj + end) : adj + end;
      const opts = ENDS.map((e) => (tpl.startsWith('______') ? cap(adj + e) : adj + e));
      out.push(row(4, tpl.replace('{P}', word) + ` (${adj})`, ok, three(ok, opts.slice(ni % 5).concat(opts)),
        `Множественное число, ${CASE[c].ru}; ${DECL[kind][0]}: ${tpl.replace('______', adj + end).replace('{P}', word)} (${ru}).`,
        `Көпше түр, ${CASE[c].kk}; ${DECL[kind][1]}: ${tpl.replace('______', adj + end).replace('{P}', word)} (${kk}).`,
        `Plural, ${CASE[c].en}; ${DECL[kind][2]}: ${tpl.replace('______', adj + end).replace('{P}', word)} (${en}).`));
    });
  });
  const strongSg = [
    ['Ich trinke gern ______ Kaffee.', 'schwarz', 'akk', 'm', 'Kaffee'],
    ['______ Milch ist gesund.', 'frisch', 'nom', 'f', 'Milch'],
    ['Mit ______ Wasser wäscht man besser.', 'warm', 'dat', 'n', 'Wasser'],
    ['______ Brot schmeckt am besten.', 'frisch', 'nom', 'n', 'Brot'],
    ['Er trinkt nur ______ Tee.', 'grün', 'akk', 'm', 'Tee'],
    ['Ich trinke Tee mit ______ Milch.', 'warm', 'dat', 'f', 'Milch'],
    ['Wir wünschen euch ______ Wetter.', 'gut', 'akk', 'n', 'Wetter'],
    ['Bei ______ Wetter bleiben wir zu Hause.', 'schlecht', 'dat', 'n', 'Wetter'],
    ['______ Kaffee ist mir zu stark.', 'schwarz', 'nom', 'm', 'Kaffee'],
    ['Ich koche nur mit ______ Butter.', 'frisch', 'dat', 'f', 'Butter'],
    ['Zum Frühstück esse ich ______ Käse.', 'jung', 'akk', 'm', 'Käse'],
    ['Er hat großen Hunger auf ______ Obst.', 'frisch', 'akk', 'n', 'Obst'],
  ];
  strongSg.forEach(([tpl, adj, c, g, noun], i) => {
    const start = tpl.startsWith('______');
    const fix = (s) => (start ? cap(s) : s);
    const ok = fix(adj + STRONG[c][g]);
    const full = tpl.replace('______', ok);
    out.push(row(4, `${tpl} (${adj})`, ok, three(ok, ENDS.slice(i % 5).concat(ENDS).map((e) => fix(adj + e))),
      `${CASE[c].ru}, ${noun} - ${GENDER[g].ru}; ${DECL.strong[0]}: ${full}`,
      `${CASE[c].kk}, ${noun} - ${GENDER[g].kk}; ${DECL.strong[1]}: ${full}`,
      `${cap(CASE[c].en)}, ${noun} is ${GENDER[g].en}; ${DECL.strong[2]}: ${full}`));
  });
  return out;
}

// ---------- Относительные местоимения (B1 - Nominativ и Akkusativ, B2 - Dativ, Genitiv, с предлогом) ----------
const REL = { m: ['der', 'den', 'dem', 'dessen'], f: ['die', 'die', 'der', 'deren'], n: ['das', 'das', 'dem', 'dessen'], pl: ['die', 'die', 'denen', 'deren'] };
const REL_ALL = ['den', 'dem', 'der', 'das', 'die', 'denen', 'dessen', 'deren'];
const REL_ANTE = [
  // [антецедент, род, Nom-хвост, Akk-хвост, Dat-хвост, Gen-хвост]
  ['der Mann', 'm', 'neben uns wohnt', 'ich gestern getroffen habe', 'ich oft helfe', 'Auto vor dem Haus steht'],
  ['die Frau', 'f', 'neben uns wohnt', 'ich gestern getroffen habe', 'ich oft helfe', 'Auto vor dem Haus steht'],
  ['das Kind', 'n', 'dort spielt', 'ich jeden Tag sehe', 'ich ein Buch geschenkt habe', 'Eltern hier arbeiten'],
  ['die Leute', 'pl', 'dort warten', 'wir eingeladen haben', 'wir geholfen haben', 'Haus wir gekauft haben'],
  ['der Film', 'm', 'mir sehr gut gefällt', 'wir gestern gesehen haben', 'alle sprechen', 'Regisseur sehr bekannt ist'],
  ['die Stadt', 'f', 'am Meer liegt', 'ich letztes Jahr besucht habe', 'ich träume', 'Altstadt sehr schön ist'],
  ['das Buch', 'n', 'auf dem Tisch liegt', 'ich gerade lese', 'ich viel gelernt habe', 'Autor aus Wien kommt'],
  ['die Bücher', 'pl', 'im Regal stehen', 'du mir geliehen hast', 'wir sprechen', 'Autoren sehr berühmt sind'],
  ['der Lehrer', 'm', 'Deutsch unterrichtet', 'alle Schüler mögen', 'wir vertrauen', 'Unterricht spannend ist'],
  ['die Freundin', 'f', 'in Hamburg studiert', 'ich seit Jahren kenne', 'ich oft schreibe', 'Bruder Arzt ist'],
];
// Для вещей Dativ - с предлогом: von dem, an dem.
const DAT_PREP = { 'der Film': 'von', 'die Stadt': 'von', 'das Buch': 'aus', 'die Bücher': 'über' };
function relRows() {
  const out = [];
  REL_ANTE.forEach(([ante, g, ...tails]) => {
    tails.forEach((tail, ci) => {
      const level = ci < 2 ? 3 : 4;
      const prep = ci === 2 ? DAT_PREP[ante] : null;
      const c = prep === 'über' ? 1 : ci;
      const ok = REL[g][c];
      const das = g === 'pl' ? 'Das sind' : 'Das ist';
      const q = prep ? `${das} ${ante}, ${prep} ______ ${tail}.` : `${das} ${ante}, ______ ${tail}.`;
      const why = [
        ['в придаточном оно подлежащее - Nominativ', 'бағыныңқы сөйлемде ол бастауыш - Nominativ', 'it is the subject of the clause - nominative'],
        ['в придаточном оно прямое дополнение - Akkusativ', 'бағыныңқы сөйлемде ол тура толықтауыш - Akkusativ', 'it is the direct object of the clause - accusative'],
        [prep ? `предлог ${prep} требует ${prep === 'über' ? 'здесь Akkusativ' : 'Dativ'}` : 'глагол придаточного требует Dativ', prep ? `${prep} предлогы ${prep === 'über' ? 'мұнда Akkusativ' : 'Dativ'} талап етеді` : 'бағыныңқы сөйлемнің етістігі Dativ талап етеді', prep ? `the preposition ${prep} takes ${prep === 'über' ? 'the accusative here' : 'the dative'}` : 'the verb of the clause takes the dative'],
        ['«чей?» - Genitiv: dessen (м. и ср. род), deren (ж. род и мн. число)', '«кімнің?» - Genitiv: dessen (еркек және орта тек), deren (әйел тегі және көпше)', '"whose?" - genitive: dessen (masc./neuter), deren (fem./plural)'],
      ][ci];
      out.push(row(level, q, ok, three(ok, [...REL[g].filter((x) => x !== ok), ...REL_ALL]),
        `Относительное местоимение берёт род и число от «${ante}» (${GENDER[g].ru}), а падеж - из придаточного: ${why[0]}. Ответ: ${ok}.`,
        `Қатыстық есімдік тек пен санды «${ante}» сөзінен (${GENDER[g].kk}), ал септікті бағыныңқы сөйлемнен алады: ${why[1]}. Жауабы: ${ok}.`,
        `The relative pronoun takes gender and number from "${ante}" (${GENDER[g].en}) and its case from the clause: ${why[2]}. Answer: ${ok}.`));
    });
  });
  return out;
}

// ---------- Возвратные местоимения (B1) ----------
const REFL = { akk: ['mich', 'dich', 'sich', 'uns', 'euch', 'sich'], dat: ['mir', 'dir', 'sich', 'uns', 'euch', 'sich'] };
const REFL_VERBS = [
  ['akk', ['freue', 'freust', 'freut', 'freuen', 'freut', 'freuen'], 'auf das Wochenende', 'sich freuen auf', 'радоваться (предстоящему)', 'асыға күту', 'to look forward to'],
  ['akk', ['beeile', 'beeilst', 'beeilt', 'beeilen', 'beeilt', 'beeilen'], 'heute sehr', 'sich beeilen', 'торопиться', 'асығу', 'to hurry'],
  ['akk', ['interessiere', 'interessierst', 'interessiert', 'interessieren', 'interessiert', 'interessieren'], 'für Musik', 'sich interessieren für', 'интересоваться', 'қызығу', 'to be interested in'],
  ['akk', ['setze', 'setzt', 'setzt', 'setzen', 'setzt', 'setzen'], 'auf das Sofa', 'sich setzen', 'садиться', 'отыру', 'to sit down'],
  ['dat', ['wasche', 'wäschst', 'wäscht', 'waschen', 'wascht', 'waschen'], 'die Hände', 'sich die Hände waschen', 'мыть руки', 'қол жуу', 'to wash one\'s hands'],
  ['dat', ['wünsche', 'wünschst', 'wünscht', 'wünschen', 'wünscht', 'wünschen'], 'ein neues Fahrrad', 'sich etwas wünschen', 'желать себе', 'өзіне тілеу', 'to wish for'],
  ['dat', ['putze', 'putzt', 'putzt', 'putzen', 'putzt', 'putzen'], 'die Zähne', 'sich die Zähne putzen', 'чистить зубы', 'тіс тазалау', 'to brush one\'s teeth'],
];
function reflRows() {
  const out = [];
  REFL_VERBS.forEach(([c, forms, rest, inf, ru, kk, en], vi) => {
    for (let p = 0; p < 6; p++) {
      const S = ['Ich', 'Du', SUBJ[2][vi % 4], 'Wir', 'Ihr', SUBJ[5][vi % 3]][p];
      const ok = REFL[c][p];
      const other = c === 'akk' ? 'dat' : 'akk';
      const pool = [REFL[other][p], ...REFL[c].filter((_, k) => k !== p), ...REFL[other]];
      out.push(row(3, `${S} ${forms[p]} ______ ${rest}.`, ok, three(ok, pool),
        c === 'akk'
          ? `${inf} (${ru}): других дополнений нет, поэтому возвратное местоимение в Akkusativ. Для ${PRON_RU[p]}: ${ok}.`
          : `${inf} (${ru}): есть ещё прямое дополнение (${rest}), поэтому возвратное местоимение в Dativ. Для ${PRON_RU[p]}: ${ok}.`,
        c === 'akk'
          ? `${inf} (${kk}): басқа толықтауыш жоқ, сондықтан өздік есімдік Akkusativ-те. ${PRON_KK[p]} үшін: ${ok}.`
          : `${inf} (${kk}): тағы тура толықтауыш бар (${rest}), сондықтан өздік есімдік Dativ-те. ${PRON_KK[p]} үшін: ${ok}.`,
        c === 'akk'
          ? `${inf} (${en}): there is no other object, so the reflexive pronoun is accusative. For ${PRON_EN[p]}: ${ok}.`
          : `${inf} (${en}): there is another direct object (${rest}), so the reflexive pronoun is dative. For ${PRON_EN[p]}: ${ok}.`));
    }
  });
  return out;
}

// ---------- Пассив (B1 - Präsens, B2 - Präteritum, Perfekt, с модальным глаголом) ----------
function passiveRows() {
  const out = [];
  const pres = [
    ['Das Brot', 0, 'gebacken', 'hier jeden Morgen frisch'],
    ['Die Briefe', 1, 'sortiert', 'hier jeden Tag'],
    ['Das Zimmer', 0, 'geputzt', 'jeden Tag'],
    ['Der Müll', 0, 'abgeholt', 'jeden Montag'],
    ['Die Pakete', 1, 'geliefert', 'meistens am Vormittag'],
    ['Das Essen', 0, 'gekocht', 'hier jeden Tag frisch'],
    ['Die Zeitungen', 1, 'verkauft', 'hier jeden Morgen'],
    ['Der Rasen', 0, 'gemäht', 'jede Woche'],
    ['Die Autos', 1, 'gewaschen', 'hier jeden Samstag'],
    ['Die Fenster', 1, 'geöffnet', 'jeden Morgen'],
  ];
  for (const [S, pl, pp, adv] of pres) {
    const ok = pl ? 'werden' : 'wird';
    out.push(row(3, `${S} ______ ${adv} ${pp}.`, ok, [pl ? 'wird' : 'werden', pl ? 'haben' : 'hat', pl ? 'sind' : 'ist'],
      `Пассив Präsens = werden + Partizip II. Подлежащее «${S}» - ${pl ? 'множественное число: werden' : 'единственное число: wird'}.`,
      `Ырықсыз етіс Präsens = werden + Partizip II. «${S}» бастауышы - ${pl ? 'көпше түр: werden' : 'жекеше түр: wird'}.`,
      `The present passive is werden + past participle. "${S}" is ${pl ? 'plural: werden' : 'singular: wird'}.`));
  }
  const past = [
    ['Das Rathaus', 0, 'gebaut', 'im Jahr 1905'],
    ['Die Brücke', 0, 'eröffnet', 'im Jahr 1998'],
    ['Die Bilder', 1, 'gemalt', 'im 19. Jahrhundert'],
    ['Das Telefon', 0, 'erfunden', 'im 19. Jahrhundert'],
    ['Die Briefe', 1, 'geschrieben', 'im Jahr 1945'],
    ['Der Film', 0, 'gedreht', 'im Jahr 2010'],
    ['Die Häuser', 1, 'renoviert', 'im Jahr 2015'],
    ['Das Museum', 0, 'gegründet', 'im Jahr 1960'],
    ['Die Mauer', 0, 'gebaut', 'im Jahr 1961'],
    ['Die Fotos', 1, 'gemacht', 'im Jahr 2005'],
  ];
  past.forEach(([S, pl, pp, adv], i) => {
    if (i % 2 === 0) {
      const ok = pl ? 'wurden' : 'wurde';
      out.push(row(4, `${S} ______ ${adv} ${pp}.`, ok, [pl ? 'wurde' : 'wurden', 'worden', pl ? 'haben' : 'hat'],
        `Пассив Präteritum = wurde(n) + Partizip II; «${S}» - ${pl ? 'множественное число: wurden' : 'единственное число: wurde'}. Форма worden бывает только в Perfekt: ist ... ${pp} worden.`,
        `Ырықсыз етіс Präteritum = wurde(n) + Partizip II; «${S}» - ${pl ? 'көпше түр: wurden' : 'жекеше түр: wurde'}. worden түрі тек Perfekt-те кездеседі: ist ... ${pp} worden.`,
        `The past passive is wurde(n) + past participle; "${S}" is ${pl ? 'plural: wurden' : 'singular: wurde'}. The form worden appears only in the Perfekt: ist ... ${pp} worden.`));
    } else {
      const ok = pl ? 'sind' : 'ist';
      out.push(row(4, `${S} ______ ${adv} ${pp} worden.`, ok, [pl ? 'ist' : 'sind', pl ? 'haben' : 'hat', pl ? 'wurden' : 'wurde'],
        `Пассив Perfekt = sein + Partizip II + worden (не geworden). «${S}» - ${pl ? 'множественное число: sind' : 'единственное число: ist'}.`,
        `Ырықсыз етіс Perfekt = sein + Partizip II + worden (geworden емес). «${S}» - ${pl ? 'көпше түр: sind' : 'жекеше түр: ist'}.`,
        `The Perfekt passive is sein + past participle + worden (not geworden). "${S}" is ${pl ? 'plural: sind' : 'singular: ist'}.`));
    }
  });
  const modal = [['Das Auto muss', 'repariert'], ['Die Hausaufgaben müssen', 'gemacht'], ['Das Formular muss', 'ausgefüllt'], ['Die Rechnung muss', 'bezahlt'], ['Der Brief soll heute', 'abgeschickt'], ['Das Problem kann', 'gelöst'], ['Die Fenster müssen', 'geputzt']];
  for (const [S, pp] of modal) {
    out.push(row(4, `${S} ${pp} ______.`, 'werden', ['wird', 'worden', 'wurde'],
      `Пассив с модальным глаголом: модальный глагол + Partizip II + werden (инфинитив): ${S} ${pp} werden.`,
      `Модаль етістікті ырықсыз етіс: модаль етістік + Partizip II + werden (тұйық етістік): ${S} ${pp} werden.`,
      `Passive with a modal verb: modal + past participle + werden (infinitive): ${S} ${pp} werden.`));
  }
  return out;
}

// ---------- n-склонение (B2) ----------
const NDECL = [
  ['Student', 'Studenten', 'студент', 'студент', 'student'], ['Junge', 'Jungen', 'мальчик', 'ұл бала', 'boy'], ['Kollege', 'Kollegen', 'коллега', 'әріптес', 'colleague'], ['Nachbar', 'Nachbarn', 'сосед', 'көрші', 'neighbour'], ['Kunde', 'Kunden', 'клиент', 'клиент', 'customer'], ['Mensch', 'Menschen', 'человек', 'адам', 'person'], ['Herr', 'Herrn', 'господин', 'мырза', 'gentleman'], ['Präsident', 'Präsidenten', 'президент', 'президент', 'president'], ['Tourist', 'Touristen', 'турист', 'турист', 'tourist'], ['Polizist', 'Polizisten', 'полицейский', 'полиция қызметкері', 'police officer'], ['Patient', 'Patienten', 'пациент', 'науқас', 'patient'], ['Journalist', 'Journalisten', 'журналист', 'журналист', 'journalist'], ['Architekt', 'Architekten', 'архитектор', 'сәулетші', 'architect'], ['Praktikant', 'Praktikanten', 'практикант', 'тәжірибеден өтуші', 'intern'], ['Elefant', 'Elefanten', 'слон', 'піл', 'elephant'], ['Löwe', 'Löwen', 'лев', 'арыстан', 'lion'], ['Affe', 'Affen', 'обезьяна', 'маймыл', 'monkey'], ['Kandidat', 'Kandidaten', 'кандидат', 'үміткер', 'candidate'], ['Experte', 'Experten', 'эксперт', 'сарапшы', 'expert'], ['Zeuge', 'Zeugen', 'свидетель', 'куәгер', 'witness'], ['Fotograf', 'Fotografen', 'фотограф', 'фотограф', 'photographer'], ['Soldat', 'Soldaten', 'солдат', 'сарбаз', 'soldier'],
];
function nDeclRows() {
  const out = [];
  const frames = [
    ['akk', 'Ich kenne den ______ schon lange.'],
    ['dat', 'Wir sprechen gleich mit dem ______.'],
    ['gen', 'Das ist die Tasche des ______.'],
    ['nom', 'Der ______ wartet draußen.'],
    ['akk', 'Hast du den ______ gefragt?'],
    ['dat', 'Ich gebe dem ______ meine Telefonnummer.'],
  ];
  NDECL.forEach(([base, nform, ru, kk, en], i) => {
    for (const k of [i % 6, (i + 2) % 6]) {
      const [c, tpl] = frames[k];
      const ok = c === 'nom' ? base : nform;
      const fake = base.endsWith('e') ? `${base}s` : `${base}es`;
      out.push(row(4, tpl, ok, three(ok, [nform, base, fake, `${nform}s`]),
        c === 'nom'
          ? `${base} (${ru}) - слово n-склонения: окончание -(e)n во всех падежах, кроме Nominativ. Здесь Nominativ (подлежащее): der ${base}.`
          : `${base} (${ru}) - слово n-склонения: в Akkusativ, Dativ и Genitiv оно получает -(e)n: ${frames[k][1].replace('______', nform)}`,
        c === 'nom'
          ? `${base} (${kk}) - n-септелетін сөз: Nominativ-тен басқа барлық септікте -(e)n жалғауын алады. Мұнда Nominativ (бастауыш): der ${base}.`
          : `${base} (${kk}) - n-септелетін сөз: Akkusativ, Dativ және Genitiv-те -(e)n жалғауын алады: ${frames[k][1].replace('______', nform)}`,
        c === 'nom'
          ? `${base} (${en}) is an n-noun: it takes -(e)n in every case except the nominative. Here it is the subject (nominative): der ${base}.`
          : `${base} (${en}) is an n-noun: in the accusative, dative and genitive it takes -(e)n: ${frames[k][1].replace('______', nform)}`));
    }
  });
  return out;
}

// ---------- Konjunktiv II в условных предложениях (B2) ----------
const KII = { haben: ['hätte', 'hättest', 'hätte', 'hätten', 'hättet', 'hätten'], sein: ['wäre', 'wärst', 'wäre', 'wären', 'wärt', 'wären'], können: ['könnte', 'könntest', 'könnte', 'könnten', 'könntet', 'könnten'] };
const IND = { haben: HABEN, sein: SEIN, können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'] };
const PRAT = { haben: ['hatte', 'hattest', 'hatte', 'hatten', 'hattet', 'hatten'], sein: ['war', 'warst', 'war', 'waren', 'wart', 'waren'], können: ['konnte', 'konntest', 'konnte', 'konnten', 'konntet', 'konnten'] };
const WUERDE = ['würde', 'würdest', 'würde', 'würden', 'würdet', 'würden'];
function kiiRows() {
  const out = [];
  const subj = [['ich', 'ich'], ['du', 'du'], ['er', 'er'], ['wir', 'wir'], ['ihr', 'ihr'], ['meine Eltern', 'sie']];
  const frames = [
    ['haben', 'mehr Zeit', 'öfter reisen'],
    ['haben', 'ein Auto', 'mit dem Auto zur Arbeit fahren'],
    ['sein', 'nicht so müde', 'mitkommen'],
    ['sein', 'reich', 'ein Haus am Meer kaufen'],
    ['können', 'besser Deutsch sprechen', 'in Berlin studieren'],
  ];
  frames.forEach(([verb, before, main], fi) => {
    for (let p = 0; p < 6; p++) {
      if ((p + fi) % 2) continue;
      const [s, pron] = subj[p];
      const ok = KII[verb][p];
      const q = `Wenn ${s} ${before} ______, ${WUERDE[p]} ${pron} ${main}.`;
      out.push(row(4, q, ok, three(ok, [IND[verb][p], PRAT[verb][p], KII[verb][ALT[p]], ...KII[verb]]),
        `Нереальное условие (если бы...) - Konjunktiv II: ${verb} → ${KII[verb][2]}. Для ${PRON_RU[p]}: ${ok}. Indikativ (${IND[verb][p]}, ${PRAT[verb][p]}) здесь не подходит.`,
        `Шындыққа жанаспайтын шарт («егер ... болса ғой») - Konjunktiv II: ${verb} → ${KII[verb][2]}. ${PRON_KK[p]} үшін: ${ok}. Indikativ (${IND[verb][p]}, ${PRAT[verb][p]}) бұл жерге сәйкес емес.`,
        `An unreal condition ("if ... were") takes Konjunktiv II: ${verb} → ${KII[verb][2]}. For ${PRON_EN[p]}: ${ok}. The indicative (${IND[verb][p]}, ${PRAT[verb][p]}) does not fit.`));
    }
  });
  return out;
}

// ---------- Konjunktiv I в косвенной речи (C1, C2) ----------
const KI = {
  sein: ['sei', 'seist', 'sei', 'seien', 'seiet', 'seien', 'sein'],
  haben: ['habe', 'habest', 'habe', 'haben', 'habet', 'haben', 'haben'],
  können: ['könne', 'könnest', 'könne', 'können', 'könnet', 'können', 'können'],
  müssen: ['müsse', 'müssest', 'müsse', 'müssen', 'müsset', 'müssen', 'müssen'],
  werden: ['werde', 'werdest', 'werde', 'werden', 'werdet', 'werden', 'werden'],
  wissen: ['wisse', 'wissest', 'wisse', 'wissen', 'wisset', 'wissen', 'wissen'],
  kommen: ['komme', 'kommest', 'komme', 'kommen', 'kommet', 'kommen', 'kommen'],
  wollen: ['wolle', 'wollest', 'wolle', 'wollen', 'wollet', 'wollen', 'wollen'],
  dürfen: ['dürfe', 'dürfest', 'dürfe', 'dürfen', 'dürfet', 'dürfen', 'dürfen'],
  sollen: ['solle', 'sollest', 'solle', 'sollen', 'sollet', 'sollen', 'sollen'],
  geben: ['gebe', 'gebest', 'gebe', 'geben', 'gebet', 'geben', 'geben'],
};
const KI_ITEMS = [
  [5, 'Der Minister sagte, er ______ mit dem Ergebnis zufrieden.', 'sein'],
  [5, 'Die Lehrerin meinte, sie ______ heute keine Zeit.', 'haben'],
  [5, 'Mein Kollege behauptet, er ______ morgen nicht kommen.', 'können'],
  [5, 'Der Arzt sagt, der Patient ______ noch eine Woche im Bett bleiben.', 'müssen'],
  [5, 'Sie erklärte, sie ______ bald zurückkommen.', 'werden'],
  [5, 'Der Zeuge sagte, er ______ nichts davon.', 'wissen'],
  [5, 'Der Chef teilte mit, das Paket ______ erst morgen.', 'kommen'],
  [5, 'Anna erzählt, sie ______ die Stelle wechseln.', 'wollen'],
  [5, 'Die Zeitung schreibt, der Präsident ______ schwer krank.', 'sein'],
  [5, 'Er behauptet, er ______ das Geld schon zurückgegeben.', 'haben'],
  [5, 'Der Sprecher sagte, man ______ noch keine Details nennen.', 'können'],
  [5, 'Die Polizei teilte mit, der Täter ______ gefasst worden.', 'sein'],
  [5, 'Laut Bericht ______ es in der Stadt keine freien Wohnungen.', 'geben'],
  [6, 'Der Professor betonte, die Studie ______ noch nicht abgeschlossen.', 'sein'],
  [6, 'Die Ministerin erklärte, sie ______ von dem Skandal nichts gewusst.', 'haben'],
  [6, 'Der Trainer sagte, die Mannschaft ______ noch viel lernen.', 'müssen'],
  [6, 'Das Gericht stellte fest, der Vertrag ______ ungültig.', 'sein'],
  [6, 'Der Pressesprecher sagte, man ______ darüber nicht sprechen.', 'dürfen'],
  [6, 'Sie ließ ausrichten, er ______ sie sofort zurückrufen.', 'sollen'],
  [6, 'Der Autor meint, es ______ keine einfache Lösung.', 'geben'],
  [6, 'Der Experte warnte, die Preise ______ weiter steigen.', 'werden'],
  [6, 'Die Firma teilte mit, der Fehler ______ bereits behoben worden.', 'sein'],
  [6, 'Er schrieb, er ______ uns bald besuchen.', 'wollen'],
  [6, 'Der Kandidat erklärte, er ______ nichts von dem Plan.', 'wissen'],
];
function kiRows() {
  return KI_ITEMS.map(([level, q, verb]) => {
    const f = KI[verb];
    const ok = f[2];
    return row(level, q, ok, three(ok, [f[3], f[1], f[4], f[6]]),
      `В косвенной речи (официальный стиль, новости) - Konjunktiv I: основа инфинитива + -e. ${verb} → er/sie ${ok}.`,
      `Төлеу сөзде (ресми стиль, жаңалықтар) - Konjunktiv I: тұйық етістік түбірі + -e. ${verb} → er/sie ${ok}.`,
      `Reported speech in formal style (news) uses Konjunktiv I: infinitive stem + -e. ${verb} → er/sie ${ok}.`);
  });
}

// ---------- Двойной инфинитив модальных глаголов (C1 - Perfekt, C2 - Konjunktiv II прошедшего) ----------
const MODALS = [
  ['müssen', 'gemusst', 'musste', 'müsste', 'должен', 'тиіс', 'must'],
  ['können', 'gekonnt', 'konnte', 'könnte', 'мочь', 'алу (істей алу)', 'can'],
  ['sollen', 'gesollt', 'sollte', 'sollst', 'следует', 'керек', 'should'],
  ['wollen', 'gewollt', 'wollte', 'willst', 'хотеть', 'қалау', 'want'],
  ['dürfen', 'gedurft', 'durfte', 'dürfte', 'иметь право', 'рұқсат болу', 'may'],
];
function doubleInfRows() {
  const out = [];
  const perf = [
    ['Ich habe gestern lange arbeiten ______.', 0], ['Wir haben das Problem nicht lösen ______.', 1], ['Er hat schon um sechs Uhr aufstehen ______.', 0], ['Hast du den Film sehen ______?', 1], ['Sie hat den Brief noch heute schicken ______.', 2], ['Die Kinder haben nicht draußen spielen ______.', 4], ['Ich habe ihn nicht stören ______.', 3], ['Wir haben gestern nicht kommen ______.', 1], ['Er hat das Auto unbedingt kaufen ______.', 3], ['Ihr habt so lange warten ______.', 0], ['Sie haben die Wohnung nicht mieten ______.', 4], ['Ich habe die Prüfung wiederholen ______.', 0],
  ];
  const kii = [
    ['Du hättest früher kommen ______.', 2], ['Ich hätte mehr lernen ______.', 0], ['Wir hätten das Problem lösen ______.', 1], ['Er hätte uns anrufen ______.', 2], ['Ihr hättet länger bleiben ______.', 4], ['Sie hätte die Stelle bekommen ______.', 1], ['Das hättest du mir sagen ______.', 0], ['Ich hätte gern mitfahren ______.', 3], ['Wir hätten den Zug nehmen ______.', 0], ['Er hätte das nicht machen ______.', 4], ['Du hättest besser aufpassen ______.', 0], ['Sie hätten uns helfen ______.', 1], ['Ich hätte ihm die Wahrheit sagen ______.', 2], ['Hättest du das wirklich tun ______?', 3], ['Man hätte das Haus nicht verkaufen ______.', 4],
  ];
  const add = (level, [q, m], which) => {
    const [inf, pp, prat, other, ru, kk, en] = MODALS[m];
    out.push(row(level, `${q} (${inf})`, inf, [pp, prat, other],
      `${which.ru}: если при модальном глаголе стоит ещё инфинитив, вместо Partizip II (${pp}) ставится инфинитив модального глагола - «двойной инфинитив»: ${q.replace('______', inf)}`,
      `${which.kk}: модаль етістікпен бірге тағы тұйық етістік тұрса, Partizip II (${pp}) орнына модаль етістіктің тұйық түрі қойылады - «қос инфинитив»: ${q.replace('______', inf)}`,
      `${which.en}: when the modal verb has another infinitive with it, the modal stays in the infinitive instead of the participle (${pp}) - the "double infinitive": ${q.replace('______', inf)}`));
  };
  perf.forEach((x) => add(5, x, { ru: 'Perfekt модального глагола', kk: 'Модаль етістіктің Perfekt түрі', en: 'Perfekt of a modal verb' }));
  kii.forEach((x) => add(6, x, { ru: 'Konjunktiv II прошедшего времени (упущенная возможность)', kk: 'Өткен шақтағы Konjunktiv II (жіберіп алған мүмкіндік)', en: 'Past Konjunktiv II (a missed chance)' }));
  return out;
}

// ---------- Причастия как определения (C1, C2) ----------
const PARTICIPLE = [
  ['Hund', 'm', 'bellen', 'bellend', 'gebellt', 1, 'лающая собака', 'үретін ит', 'the barking dog'],
  ['Kind', 'n', 'weinen', 'weinend', 'geweint', 1, 'плачущий ребёнок', 'жылап жатқан бала', 'the crying child'],
  ['Baby', 'n', 'schlafen', 'schlafend', 'geschlafen', 1, 'спящий малыш', 'ұйықтап жатқан сәби', 'the sleeping baby'],
  ['Frau', 'f', 'lachen', 'lachend', 'gelacht', 1, 'смеющаяся женщина', 'күліп тұрған әйел', 'the laughing woman'],
  ['Mann', 'm', 'rauchen', 'rauchend', 'geraucht', 1, 'курящий мужчина', 'темекі шегіп тұрған ер адам', 'the smoking man'],
  ['Brief', 'm', 'schreiben', 'schreibend', 'geschrieben', 2, 'написанное письмо', 'жазылған хат', 'the written letter'],
  ['Auto', 'n', 'reparieren', 'reparierend', 'repariert', 2, 'отремонтированная машина', 'жөнделген көлік', 'the repaired car'],
  ['Stadt', 'f', 'zerstören', 'zerstörend', 'zerstört', 2, 'разрушенный город', 'қираған қала', 'the destroyed city'],
  ['Tür', 'f', 'öffnen', 'öffnend', 'geöffnet', 2, 'открытая дверь', 'ашылған есік', 'the opened door'],
  ['Buch', 'n', 'verkaufen', 'verkaufend', 'verkauft', 2, 'проданная книга', 'сатылған кітап', 'the sold book'],
  ['Kuchen', 'm', 'backen', 'backend', 'gebacken', 2, 'испечённый пирог', 'пісірілген бәліш', 'the baked cake'],
  ['Brot', 'n', 'schneiden', 'schneidend', 'geschnitten', 2, 'нарезанный хлеб', 'туралған нан', 'the sliced bread'],
  ['Rechnung', 'f', 'bezahlen', 'bezahlend', 'bezahlt', 2, 'оплаченный счёт', 'төленген шот', 'the paid bill'],
  ['Mädchen', 'n', 'singen', 'singend', 'gesungen', 1, 'поющая девочка', 'ән айтып тұрған қыз', 'the singing girl'],
];
function participleRows() {
  const out = [];
  const frames = [['nom', '{A} ______ {N} ist hier.'], ['akk', 'Ich sehe {A} ______ {N}.'], ['dat', 'Was ist mit {A} ______ {N}?']];
  PARTICIPLE.forEach(([noun, g, inf, p1, p2, kind, ru, kk, en], i) => {
    for (const k of [i % 3, (i + 1) % 3]) {
      const [c, tpl] = frames[k];
      const ci = CASES.indexOf(c);
      const art = DEF[g][ci];
      const end = WEAK[c][g];
      const other = end === 'e' ? 'en' : 'e';
      const right = kind === 1 ? p1 : p2;
      const wrongP = kind === 1 ? p2 : p1;
      const ok = right + end;
      const q = tpl.replace('{A}', tpl.startsWith('{A}') ? cap(art) : art).replace('{N}', noun) + ` (${inf})`;
      out.push(row(5, q, ok, [wrongP + end, right + other, wrongP + other],
        kind === 1
          ? `Действие происходит сейчас и его делает сам предмет - Partizip I (инфинитив + -d): ${p1}. Окончание - как у прилагательного после ${art}: ${art} ${ok} ${noun} (${ru}).`
          : `Действие уже совершено над предметом - Partizip II: ${p2}. Окончание - как у прилагательного после ${art}: ${art} ${ok} ${noun} (${ru}).`,
        kind === 1
          ? `Әрекет қазір болып жатыр және оны заттың өзі жасайды - Partizip I (тұйық етістік + -d): ${p1}. Жалғауы ${art}-тен кейінгі сын есімдікі сияқты: ${art} ${ok} ${noun} (${kk}).`
          : `Әрекет затқа қатысты аяқталған - Partizip II: ${p2}. Жалғауы ${art}-тен кейінгі сын есімдікі сияқты: ${art} ${ok} ${noun} (${kk}).`,
        kind === 1
          ? `The action is happening now and the noun does it - Partizip I (infinitive + -d): ${p1}. The ending is an adjective ending after ${art}: ${art} ${ok} ${noun} (${en}).`
          : `The action has been done to the noun - Partizip II: ${p2}. The ending is an adjective ending after ${art}: ${art} ${ok} ${noun} (${en}).`));
    }
  });
  // zu + Partizip I: «который нужно сделать» (C2).
  const zu = [
    ['Das ist eine schwer zu ______ Aufgabe.', 'lösen', 'lösend', 'gelöst', 'e', 'задача, которую трудно решить', 'шешуі қиын есеп', 'a task that is hard to solve'],
    ['Wir haben noch viele zu ______ Briefe.', 'beantworten', 'beantwortend', 'beantwortet', 'e', 'письма, на которые нужно ответить', 'жауап беру керек хаттар', 'letters still to be answered'],
    ['Das ist ein nicht zu ______ Fehler.', 'unterschätzen', 'unterschätzend', 'unterschätzt', 'er', 'ошибка, которую нельзя недооценивать', 'бағаламауға болмайтын қате', 'a mistake not to be underestimated'],
    ['Die noch zu ______ Rechnungen liegen auf dem Tisch.', 'bezahlen', 'bezahlend', 'bezahlt', 'en', 'счета, которые ещё нужно оплатить', 'әлі төлеу керек шоттар', 'the bills still to be paid'],
    ['Es gibt einige zu ______ Punkte.', 'klären', 'klärend', 'geklärt', 'e', 'вопросы, которые нужно прояснить', 'анықтау керек мәселелер', 'some points to be clarified'],
    ['Das ist ein leicht zu ______ Gerät.', 'bedienen', 'bedienend', 'bedient', 'es', 'прибор, которым легко пользоваться', 'пайдалануы оңай құрылғы', 'a device that is easy to use'],
    ['Die zu ______ Texte sind sehr lang.', 'übersetzen', 'übersetzend', 'übersetzt', 'en', 'тексты, которые нужно перевести', 'аудару керек мәтіндер', 'the texts to be translated'],
    ['Er stand vor einer kaum zu ______ Herausforderung.', 'bewältigen', 'bewältigend', 'bewältigt', 'en', 'почти непосильная задача', 'жеңу қиын дерлік міндет', 'an almost insurmountable challenge'],
  ];
  for (const [q, inf, p1, p2, end, ru, kk, en] of zu) {
    const ok = p1 + end;
    const other = end === 'en' ? 'e' : 'en';
    out.push(row(6, `${q} (${inf})`, ok, [p2 + end, p1 + other, p2 + other],
      `zu + Partizip I = «который нужно / можно сделать» (${ru}): zu ${ok}. Окончание - как у прилагательного.`,
      `zu + Partizip I = «істеу керек / істеуге болатын» (${kk}): zu ${ok}. Жалғауы сын есімдікі сияқты.`,
      `zu + Partizip I means "to be done" (${en}): zu ${ok}. It takes adjective endings.`));
  }
  return out;
}

// ---------- Futur II: предположение о прошлом (C2) ----------
const WERDEN = ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'];
function futur2Rows() {
  return PERF_VERBS.filter((_, i) => i % 2 === 0).map(([inf, pp, aux, comp, ru, kk, en], i) => {
    const p = [2, 5, 1, 3, 4, 0][i % 6];
    const S = SUBJ[p][i % SUBJ[p].length];
    const ok = aux === 's' ? 'sein' : 'haben';
    const q = `${S} ${WERDEN[p]} wohl ${comp} ${pp} ______.`;
    return row(6, q, ok, [aux === 's' ? 'haben' : 'sein', aux === 's' ? 'gewesen' : 'gehabt', aux === 's' ? 'ist' : 'hat'],
      `Futur II (werden + Partizip II + haben/sein) выражает предположение о прошлом: «наверное, уже ...». ${inf} (${ru}) образует Perfekt с ${ok}: ${pp} ${ok}.`,
      `Futur II (werden + Partizip II + haben/sein) өткен туралы болжамды білдіреді: «... болса керек». ${inf} (${kk}) Perfekt-ті ${ok}-мен жасайды: ${pp} ${ok}.`,
      `Futur II (werden + participle + haben/sein) expresses a guess about the past: "probably already ...". ${inf} (${en}) forms the Perfekt with ${ok}: ${pp} ${ok}.`);
  });
}

// ---------- Задания, написанные вручную ----------
const HAND = [
  // A1
  [1, 'Wie ______ du? - Ich heiße Anna.', 'heißt', ['heiße', 'heißen', 'heißst'], 'heißen: у основы на -ß для du только -t: du heißt.', 'heißen: түбірі -ß-мен бітсе, du үшін тек -t қосылады: du heißt.', 'heißen: a stem ending in -ß takes only -t for du: du heißt.'],
  [1, '______ kommst du? - Aus Kasachstan.', 'Woher', ['Wo', 'Wohin', 'Wer'], 'Ответ «aus ...» - значит вопрос «откуда?»: woher.', '«aus ...» деген жауап - «қайдан?» сұрағына: woher.', 'The answer "aus ..." answers "where from?": woher.'],
  [1, '______ wohnst du? - In Almaty.', 'Wo', ['Woher', 'Wohin', 'Wann'], 'Место, где ты живёшь, - вопрос «где?»: wo.', 'Тұратын орын - «қайда?» сұрағы: wo.', 'The place where you live answers "where?": wo.'],
  [1, 'Ich habe heute ______ Zeit.', 'keine', ['nicht', 'kein', 'keinen'], 'Существительное отрицают через kein; Zeit - женского рода, Akkusativ: keine Zeit.', 'Зат есім kein арқылы болымсыз болады; Zeit - әйел тегі, Akkusativ: keine Zeit.', 'Nouns are negated with kein; Zeit is feminine, accusative: keine Zeit.'],
  [1, 'Ich trinke ______ Kaffee, ich trinke Tee.', 'keinen', ['nicht', 'kein', 'keine'], 'Kaffee - мужского рода, Akkusativ: keinen Kaffee.', 'Kaffee - еркек тегі, Akkusativ: keinen Kaffee.', 'Kaffee is masculine, accusative: keinen Kaffee.'],
  [1, 'Entschuldigung, ich verstehe das ______.', 'nicht', ['kein', 'keine', 'nein'], 'Глагол отрицают словом nicht: ich verstehe das nicht.', 'Етістік nicht сөзімен болымсыз болады: ich verstehe das nicht.', 'A verb is negated with nicht: ich verstehe das nicht.'],
  [1, 'Das ist nicht mein Buch, das ist ______ Buch.', 'dein', ['deine', 'deinen', 'du'], 'Buch - среднего рода, Nominativ: dein Buch («твоя книга»).', 'Buch - орта тек, Nominativ: dein Buch («сенің кітабың»).', 'Buch is neuter, nominative: dein Buch ("your book").'],
  [1, 'Anna ist meine Schwester. ______ ist 15 Jahre alt.', 'Sie', ['Er', 'Es', 'Ihr'], 'Anna - женщина, поэтому местоимение sie.', 'Anna - әйел адам, сондықтан sie есімдігі.', 'Anna is female, so the pronoun is sie.'],
  [1, 'Der Tisch ist neu. ______ ist sehr schön.', 'Er', ['Sie', 'Es', 'Ihn'], 'der Tisch - мужского рода, поэтому er (в немецком и вещи бывают «он»).', 'der Tisch - еркек тегі, сондықтан er (неміс тілінде заттардың да тегі бар).', 'der Tisch is masculine, so er (German things have gender too).'],
  [1, 'Wie viel ______ das? - Drei Euro.', 'kostet', ['kosten', 'kostest', 'koste'], 'Подлежащее das - 3-е лицо ед. числа; основа на -t: es kostet.', 'Бастауыш das - 3-жақ жекеше; түбір -t-мен бітеді: es kostet.', 'The subject das is third person singular; the stem ends in -t: es kostet.'],
  [1, '______ du Kinder? - Ja, zwei.', 'Hast', ['Bist', 'Hat', 'Habt'], 'Иметь детей - haben; для du: hast.', 'Балалы болу - haben; du үшін: hast.', 'To have children is haben; for du: hast.'],
  [1, 'Wir haben zwei ______. (Kind)', 'Kinder', ['Kinds', 'Kinden', 'Kind'], 'Множественное число от das Kind - die Kinder.', 'das Kind сөзінің көпше түрі - die Kinder.', 'The plural of das Kind is die Kinder.'],
  [1, 'Ich habe drei ______. (Buch)', 'Bücher', ['Buchs', 'Buche', 'Buchen'], 'das Buch - die Bücher: умлаут и окончание -er.', 'das Buch - die Bücher: умлаут және -er жалғауы.', 'das Buch - die Bücher: umlaut plus -er.'],
  [1, 'Das sind meine ______. (Freund)', 'Freunde', ['Freunds', 'Freunden', 'Freunder'], 'der Freund - die Freunde: окончание -e.', 'der Freund - die Freunde: -e жалғауы.', 'der Freund - die Freunde: ending -e.'],
  [1, '______ Uhr ist es? - Es ist drei Uhr.', 'Wie viel', ['Wann', 'Wo', 'Wer'], 'Который час? - Wie viel Uhr ist es?', 'Сағат неше? - Wie viel Uhr ist es?', 'What time is it? - Wie viel Uhr ist es?'],
  [1, 'Ich möchte ______ Kaffee, bitte.', 'einen', ['ein', 'eine', 'einem'], 'der Kaffee - мужского рода, после möchte Akkusativ: einen Kaffee.', 'der Kaffee - еркек тегі, möchte-ден кейін Akkusativ: einen Kaffee.', 'der Kaffee is masculine; after möchte comes the accusative: einen Kaffee.'],
  [1, '______ ist das? - Das ist mein Vater.', 'Wer', ['Was', 'Wo', 'Wie'], 'О человеке спрашивают wer («кто?»).', 'Адам туралы wer («кім?») деп сұрайды.', 'People are asked about with wer ("who?").'],
  [1, 'Der Unterricht beginnt ______ acht Uhr.', 'um', ['am', 'im', 'an'], 'Время на часах - um: um acht Uhr.', 'Сағаттағы уақыт - um: um acht Uhr.', 'Clock time takes um: um acht Uhr.'],
  [1, 'Wir fahren ______ Montag nach Berlin.', 'am', ['um', 'im', 'in'], 'Дни недели - am: am Montag.', 'Апта күндері - am: am Montag.', 'Days of the week take am: am Montag.'],
  [1, 'Mein Geburtstag ist ______ Mai.', 'im', ['am', 'um', 'an'], 'Месяцы и времена года - im: im Mai.', 'Айлар мен жыл мезгілдері - im: im Mai.', 'Months and seasons take im: im Mai.'],
  [1, 'Ich kann sehr gut schwimmen. Ich habe es als Kind ______.', 'gelernt', ['lernen', 'lerne', 'gelernen'], 'Perfekt: haben + Partizip II; lernen - слабый глагол: gelernt.', 'Perfekt: haben + Partizip II; lernen - әлсіз етістік: gelernt.', 'Perfekt: haben + past participle; lernen is weak: gelernt.'],
  [1, 'Das ist ______ Auto. Es ist neu.', 'mein', ['meine', 'meinen', 'meiner'], 'das Auto - среднего рода, Nominativ: mein Auto.', 'das Auto - орта тек, Nominativ: mein Auto.', 'das Auto is neuter, nominative: mein Auto.'],
  // A2
  [2, 'Ich interessiere mich ______ Musik.', 'für', ['an', 'auf', 'über'], 'Устойчивое управление: sich interessieren für + Akkusativ.', 'Тұрақты тіркес: sich interessieren für + Akkusativ.', 'The fixed pattern is sich interessieren für + accusative.'],
  [2, 'Wir warten schon lange ______ den Bus.', 'auf', ['für', 'an', 'nach'], 'warten auf + Akkusativ - ждать кого-то/что-то.', 'warten auf + Akkusativ - біреуді/бірдеңені күту.', 'warten auf + accusative means "to wait for".'],
  [2, 'Ich denke oft ______ meine Familie.', 'an', ['auf', 'über', 'von'], 'denken an + Akkusativ - думать о ком-то.', 'denken an + Akkusativ - біреу туралы ойлау.', 'denken an + accusative means "to think of".'],
  [2, 'Hier ______ man nicht parken. Das ist verboten.', 'darf', ['muss', 'will', 'möchte'], 'Запрет: man darf nicht («нельзя»).', 'Тыйым: man darf nicht («болмайды»).', 'A ban: man darf nicht ("you are not allowed").'],
  [2, 'Du hast Fieber. Du ______ zum Arzt gehen.', 'solltest', ['darfst', 'magst', 'wolltest'], 'Совет - sollte: du solltest («тебе стоит»).', 'Кеңес - sollte: du solltest («саған ... керек»).', 'Advice uses sollte: du solltest ("you should").'],
  [2, 'Mein Bruder ist zwei Jahre ______ als ich.', 'älter', ['alt', 'am ältesten', 'älteste'], 'Сравнение двух людей: сравнительная степень + als; alt - älter.', 'Екі адамды салыстыру: салыстырмалы шырай + als; alt - älter.', 'Comparing two people: comparative + als; alt - älter.'],
  [2, 'Der Mount Everest ist der ______ Berg der Welt.', 'höchste', ['hohe', 'höher', 'hochste'], 'Превосходная степень от hoch - höchst-, с окончанием после der: der höchste Berg.', 'hoch сөзінің күшейтпелі шырайы - höchst-, der-ден кейін жалғаумен: der höchste Berg.', 'The superlative of hoch is höchst-, with an ending after der: der höchste Berg.'],
  [2, 'Ich trinke Tee ______ als Kaffee.', 'lieber', ['gerner', 'mehr gern', 'am liebsten'], 'gern - lieber - am liebsten (неправильное сравнение).', 'gern - lieber - am liebsten (бұрыс салыстыру).', 'gern - lieber - am liebsten (irregular comparison).'],
  [2, 'Ich gebe ______ das Buch.', 'dir', ['dich', 'du', 'dein'], 'Кому? - Dativ: dir. Что? - Akkusativ: das Buch.', 'Кімге? - Dativ: dir. Нені? - Akkusativ: das Buch.', 'To whom? - dative: dir. What? - accusative: das Buch.'],
  [2, 'Ich rufe ______ morgen an.', 'dich', ['dir', 'du', 'dein'], 'anrufen требует Akkusativ: ich rufe dich an.', 'anrufen Akkusativ талап етеді: ich rufe dich an.', 'anrufen takes the accusative: ich rufe dich an.'],
  [2, 'Das Buch gehört ______.', 'mir', ['mich', 'ich', 'mein'], 'gehören требует Dativ: es gehört mir («это моё»).', 'gehören Dativ талап етеді: es gehört mir («бұл менікі»).', 'gehören takes the dative: es gehört mir ("it is mine").'],
  [2, '______ ich ein Kind war, wohnte ich in Almaty.', 'Als', ['Wenn', 'Wann', 'Ob'], 'Одно событие или период в прошлом - als; wenn - для повторяющегося или будущего.', 'Өткендегі бір оқиға не кезең - als; wenn - қайталанатын не болашақ әрекет үшін.', 'A single event or period in the past takes als; wenn is for repeated or future events.'],
  [2, 'Ich weiß nicht, ______ er heute kommt.', 'ob', ['dass', 'als', 'weil'], 'Косвенный вопрос «да или нет» вводится ob («ли»).', 'Иә/жоқ жанама сұрағы ob арқылы беріледі.', 'An indirect yes/no question is introduced by ob ("whether").'],
  [2, 'Es regnet, ______ gehen wir nicht spazieren.', 'deshalb', ['weil', 'denn', 'obwohl'], 'deshalb («поэтому») занимает первое место, за ним сразу глагол: deshalb gehen wir.', 'deshalb («сондықтан») бірінші орынға тұрады, артынан бірден етістік: deshalb gehen wir.', 'deshalb ("so") takes first position and the verb follows at once: deshalb gehen wir.'],
  [2, 'Ich lerne Deutsch, ______ ich in Deutschland studieren möchte.', 'weil', ['deshalb', 'denn', 'trotzdem'], 'Глагол стоит в конце (möchte) - значит нужен подчинительный союз weil.', 'Етістік соңында тұр (möchte) - демек бағыныңқы жалғаулық weil керек.', 'The verb is at the end (möchte), so we need the subordinating conjunction weil.'],
  [2, 'Heute ist es ______ als gestern.', 'wärmer', ['warm', 'wärmste', 'am wärmsten'], 'Сравнение с als: warm - wärmer.', 'als арқылы салыстыру: warm - wärmer.', 'Comparison with als: warm - wärmer.'],
  [2, 'Ich fahre ______ Bus zur Arbeit.', 'mit dem', ['mit den', 'mit der', 'mit das'], 'mit + Dativ; der Bus - мужского рода: mit dem Bus.', 'mit + Dativ; der Bus - еркек тегі: mit dem Bus.', 'mit + dative; der Bus is masculine: mit dem Bus.'],
  [2, 'Das Geschenk ist ______ meine Mutter.', 'für', ['mit', 'bei', 'zu'], 'für + Akkusativ - «для»: für meine Mutter.', 'für + Akkusativ - «үшін»: für meine Mutter.', 'für + accusative means "for": für meine Mutter.'],
  [2, 'Ich gehe heute ______ Arzt.', 'zum', ['zur', 'nach', 'ins'], 'К человеку - zu + Dativ; der Arzt: zu dem = zum.', 'Адамға бару - zu + Dativ; der Arzt: zu dem = zum.', 'Going to a person is zu + dative; der Arzt: zu dem = zum.'],
  [2, 'Wir fahren im Sommer ______ Deutschland.', 'nach', ['zu', 'in', 'bei'], 'В страну без артикля и город - nach: nach Deutschland.', 'Артиклі жоқ елге және қалаға - nach: nach Deutschland.', 'Countries without an article and cities take nach: nach Deutschland.'],
  [2, 'Am Wochenende bin ich ______ meinen Großeltern.', 'bei', ['zu', 'nach', 'an'], 'Быть у кого-то дома - bei + Dativ.', 'Біреудің үйінде болу - bei + Dativ.', 'Being at someone\'s place is bei + dative.'],
  [2, 'Ich wohne ______ zwei Jahren in Berlin.', 'seit', ['vor', 'ab', 'für'], 'Действие началось в прошлом и продолжается - seit + Dativ.', 'Әрекет өткенде басталып, әлі жалғасады - seit + Dativ.', 'An action that started in the past and continues takes seit + dative.'],
  [2, 'Er ______ gestern keine Zeit.', 'hatte', ['hat', 'habe', 'hattet'], 'gestern - прошлое; у haben обычно Präteritum: er hatte.', 'gestern - өткен шақ; haben үшін әдетте Präteritum: er hatte.', 'gestern is the past; haben usually uses the Präteritum: er hatte.'],
  // B1
  [3, 'Ich freue mich schon ______ das Wochenende.', 'auf', ['an', 'für', 'nach'], 'Радоваться предстоящему - sich freuen auf + Akkusativ.', 'Алдағы нәрсеге қуану - sich freuen auf + Akkusativ.', 'Looking forward to something is sich freuen auf + accusative.'],
  [3, 'Er hat sich sehr ______ die Einladung gefreut.', 'über', ['an', 'für', 'mit'], 'Радоваться тому, что уже есть, - sich freuen über + Akkusativ.', 'Бар нәрсеге қуану - sich freuen über + Akkusativ.', 'Being glad about something you already have is sich freuen über + accusative.'],
  [3, 'Je mehr du übst, ______ besser sprichst du.', 'desto', ['als', 'so', 'wie'], 'Парный союз je ... desto («чем ... тем»).', 'Қос жалғаулық je ... desto («неғұрлым ... соғұрлым»).', 'The paired conjunction je ... desto ("the more ... the more").'],
  [3, 'Ich gehe nicht ins Kino, ______ ich habe keine Zeit.', 'denn', ['weil', 'deshalb', 'obwohl'], 'После запятой порядок как в главном (ich habe) - значит denn: он не меняет порядок слов.', 'Үтірден кейін басыңқы сөйлемдегідей тәртіп (ich habe) - демек denn: ол сөз тәртібін өзгертпейді.', 'The order after the comma is main-clause order (ich habe), so denn, which does not change word order.'],
  [3, 'Er ist zur Arbeit gegangen, ______ er krank war.', 'obwohl', ['weil', 'dass', 'ob'], 'Противопоставление «хотя» - obwohl.', 'Қарсы қою «... болса да» - obwohl.', 'A contrast ("although") takes obwohl.'],
  [3, 'Kannst du mir sagen, wo ______?', 'der Bahnhof ist', ['ist der Bahnhof', 'der Bahnhof sein', 'ist Bahnhof der'], 'Косвенный вопрос - придаточное: глагол в конце: wo der Bahnhof ist.', 'Жанама сұрақ - бағыныңқы сөйлем: етістік соңында: wo der Bahnhof ist.', 'An indirect question is a subordinate clause: the verb goes last: wo der Bahnhof ist.'],
  [3, 'Ich habe keine Lust, heute ______.', 'zu arbeiten', ['arbeiten', 'zu arbeite', 'gearbeitet'], 'После Lust haben - инфинитив с zu.', 'Lust haben-нен кейін zu-мен тұйық етістік.', 'After Lust haben comes zu + infinitive.'],
  [3, 'Ich lerne Deutsch, ______ in Deutschland zu studieren.', 'um', ['damit', 'für', 'weil'], 'Цель с инфинитивом (zu studieren) - um ... zu.', 'Тұйық етістікпен мақсат (zu studieren) - um ... zu.', 'A purpose with an infinitive (zu studieren) takes um ... zu.'],
  [3, 'Ich spreche langsam, ______ alle mich verstehen.', 'damit', ['um', 'für', 'zu'], 'У цели другое подлежащее (alle) - damit + придаточное.', 'Мақсаттың бастауышы басқа (alle) - damit + бағыныңқы сөйлем.', 'The purpose has a different subject (alle), so damit + clause.'],
  [3, 'Wenn ich morgen Zeit habe, ______ dich.', 'besuche ich', ['ich besuche', 'besuchen ich', 'ich besuchen'], 'Придаточное с wenn стоит на первом месте, поэтому глагол главного сразу за ним: besuche ich.', 'wenn бағыныңқы сөйлемі бірінші орында, сондықтан басыңқының етістігі бірден келеді: besuche ich.', 'The wenn-clause takes first position, so the main verb comes straight after it: besuche ich.'],
  [3, 'Er fragt, ______ wir morgen Zeit haben.', 'ob', ['dass', 'wenn', 'weil'], 'Косвенный вопрос «да или нет» - ob.', 'Иә/жоқ жанама сұрағы - ob.', 'An indirect yes/no question takes ob.'],
  [3, 'Als ich nach Hause kam, ______ meine Mutter schon gekocht.', 'hatte', ['hat', 'ist', 'war'], 'Действие раньше другого в прошлом - Plusquamperfekt: hatte + Partizip II.', 'Өткендегі басқа әрекеттен бұрынғы әрекет - Plusquamperfekt: hatte + Partizip II.', 'An action before another past action takes the Plusquamperfekt: hatte + participle.'],
  [3, 'Innerhalb ______ hat er Deutsch gelernt.', 'eines Jahres', ['einem Jahr', 'ein Jahr', 'einen Jahr'], 'innerhalb требует Genitiv: innerhalb eines Jahres.', 'innerhalb Genitiv талап етеді: innerhalb eines Jahres.', 'innerhalb takes the genitive: innerhalb eines Jahres.'],
  [3, 'Weißt du, ______ der Film beginnt? - Um acht.', 'wann', ['wenn', 'als', 'ob'], 'Ответ - время, значит вопрос wann («когда?»).', 'Жауабы - уақыт, демек wann («қашан?») сұрағы.', 'The answer is a time, so the question is wann ("when?").'],
  [3, 'Es ist wichtig, jeden Tag Sport ______.', 'zu machen', ['machen', 'zu macht', 'gemacht'], 'После es ist wichtig - инфинитив с zu.', 'es ist wichtig-тен кейін zu-мен тұйық етістік.', 'After es ist wichtig comes zu + infinitive.'],
  [3, 'Ich warte schon seit einer Stunde ______ dich.', 'auf', ['für', 'an', 'nach'], 'warten auf + Akkusativ.', 'warten auf + Akkusativ.', 'warten auf + accusative.'],
  [3, 'Das Konzert wurde wegen des Regens ______.', 'abgesagt', ['absagen', 'abgesagen', 'geabsagt'], 'Пассив: wurde + Partizip II; absagen - отделяемый слабый глагол: abgesagt.', 'Ырықсыз етіс: wurde + Partizip II; absagen - бөлінетін әлсіз етістік: abgesagt.', 'Passive: wurde + participle; absagen is separable and weak: abgesagt.'],
  // B2
  [4, 'Sowohl mein Bruder ______ meine Schwester studieren Medizin.', 'als auch', ['noch', 'oder', 'sondern auch'], 'Парный союз sowohl ... als auch («как ..., так и»).', 'Қос жалғаулық sowohl ... als auch («... та, ... та»).', 'The paired conjunction sowohl ... als auch ("both ... and").'],
  [4, 'Er spricht weder Englisch ______ Französisch.', 'noch', ['oder', 'als auch', 'und'], 'weder ... noch («ни ..., ни»).', 'weder ... noch («... та емес, ... та емес»).', 'weder ... noch ("neither ... nor").'],
  [4, 'Wir fahren entweder mit dem Zug ______ mit dem Auto.', 'oder', ['noch', 'als auch', 'sondern'], 'entweder ... oder («или ..., или»).', 'entweder ... oder («не ..., не»).', 'entweder ... oder ("either ... or").'],
  [4, 'Sie ist nicht nur intelligent, ______ auch sehr fleißig.', 'sondern', ['aber', 'oder', 'sowie'], 'nicht nur ... sondern auch («не только ..., но и»).', 'nicht nur ... sondern auch («тек ... ғана емес, ... та»).', 'nicht nur ... sondern auch ("not only ... but also").'],
  [4, 'Er tut so, als ______ er alles wüsste.', 'ob', ['wenn', 'dass', 'wie'], 'als ob + Konjunktiv II - «как будто».', 'als ob + Konjunktiv II - «... сияқты, ... тәрізді».', 'als ob + Konjunktiv II means "as if".'],
  [4, 'Er sieht aus, als ______ er krank.', 'wäre', ['ist', 'war', 'hat'], 'als без ob: глагол сразу после als, в Konjunktiv II: als wäre er krank.', 'ob-сыз als: етістік бірден als-тан кейін, Konjunktiv II-де: als wäre er krank.', 'als without ob puts the verb straight after it, in Konjunktiv II: als wäre er krank.'],
  [4, 'Hätte ich das gewusst, ______ ich früher gekommen.', 'wäre', ['hätte', 'würde', 'bin'], 'Нереальное прошлое: kommen образует Perfekt с sein, поэтому wäre ... gekommen.', 'Шындыққа жанаспайтын өткен шақ: kommen Perfekt-ті sein-мен жасайды, сондықтан wäre ... gekommen.', 'Unreal past: kommen forms the Perfekt with sein, so wäre ... gekommen.'],
  [4, 'Das Problem lässt sich leicht ______.', 'lösen', ['gelöst', 'zu lösen', 'löst'], 'sich lassen + инфинитив = «можно сделать»: lässt sich lösen.', 'sich lassen + тұйық етістік = «істеуге болады»: lässt sich lösen.', 'sich lassen + infinitive means "can be done": lässt sich lösen.'],
  [4, 'Die Aufgabe ist bis morgen zu ______.', 'erledigen', ['erledigt', 'erledigend', 'erledigte'], 'sein + zu + инфинитив = «нужно сделать».', 'sein + zu + тұйық етістік = «істеу керек».', 'sein + zu + infinitive means "must be done".'],
  [4, 'Er arbeitet viel, ______ seine Familie gut leben kann.', 'damit', ['um', 'zu', 'deshalb'], 'Цель с другим подлежащим (seine Familie) - damit.', 'Басқа бастауышы бар мақсат (seine Familie) - damit.', 'A purpose with another subject (seine Familie) takes damit.'],
  [4, 'Je länger ich in Berlin wohne, ______ gefällt mir die Stadt.', 'desto besser', ['besser', 'so besser', 'als besser'], 'je + сравнительная степень ..., desto + сравнительная степень.', 'je + салыстырмалы шырай ..., desto + салыстырмалы шырай.', 'je + comparative ..., desto + comparative.'],
  [4, 'Ich bin es nicht gewohnt, so früh ______.', 'aufzustehen', ['zu aufstehen', 'aufstehen', 'aufzustehend'], 'У отделяемых глаголов zu встаёт внутрь: aufzustehen.', 'Бөлінетін етістіктерде zu ортасына кіреді: aufzustehen.', 'With separable verbs zu goes inside: aufzustehen.'],
  [4, 'Er hat versprochen, mich heute ______.', 'anzurufen', ['zu anrufen', 'anrufen', 'angerufen zu'], 'anrufen - отделяемый: an + zu + rufen = anzurufen.', 'anrufen - бөлінетін: an + zu + rufen = anzurufen.', 'anrufen is separable: an + zu + rufen = anzurufen.'],
  [4, 'Ich ärgere mich ______ den Lärm.', 'über', ['auf', 'an', 'für'], 'sich ärgern über + Akkusativ - злиться на что-то.', 'sich ärgern über + Akkusativ - бірдеңеге ашулану.', 'sich ärgern über + accusative means "to be annoyed about".'],
  [4, 'Es kommt ______ an, wie viel Zeit wir haben.', 'darauf', ['davon', 'daran', 'dafür'], 'ankommen auf - «зависеть от»: es kommt darauf an.', 'ankommen auf - «... байланысты болу»: es kommt darauf an.', 'ankommen auf means "to depend on": es kommt darauf an.'],
  [4, 'Ich bin fest ______ überzeugt, dass er recht hat.', 'davon', ['darauf', 'daran', 'dafür'], 'überzeugt sein von - быть убеждённым в чём-то: davon.', 'überzeugt sein von - бірдеңеге сенімді болу: davon.', 'überzeugt sein von means "to be convinced of": davon.'],
  [4, 'Ich kann mich nicht mehr ______ erinnern.', 'daran', ['darauf', 'davon', 'dafür'], 'sich erinnern an - помнить что-то: daran.', 'sich erinnern an - бірдеңені есте сақтау: daran.', 'sich erinnern an means "to remember": daran.'],
  [4, 'Ohne ein Wort ______, verließ er den Raum.', 'zu sagen', ['sagen', 'gesagt', 'zu sagt'], 'ohne ... zu + инфинитив - «не сказав ни слова».', 'ohne ... zu + тұйық етістік - «бір сөз айтпастан».', 'ohne ... zu + infinitive means "without saying".'],
  [4, 'Ich wünschte, ich ______ mehr Zeit.', 'hätte', ['habe', 'hatte', 'haben'], 'Нереальное желание (ich wünschte) - Konjunktiv II: hätte.', 'Орындалмайтын тілек (ich wünschte) - Konjunktiv II: hätte.', 'An unreal wish (ich wünschte) takes Konjunktiv II: hätte.'],
  [4, 'Wenn er doch nur hier ______!', 'wäre', ['ist', 'sei', 'war'], 'Нереальное желание «если бы» - Konjunktiv II: wäre.', '«Е, шіркін, ... болса ғой» тілегі - Konjunktiv II: wäre.', 'An unreal wish ("if only") takes Konjunktiv II: wäre.'],
  // C1
  [5, 'Die Firma stellt den Mitarbeitern Laptops zur ______.', 'Verfügung', ['Hilfe', 'Stellung', 'Leistung'], 'Устойчивое выражение: zur Verfügung stellen - предоставлять.', 'Тұрақты тіркес: zur Verfügung stellen - беру, ұсыну.', 'The fixed phrase zur Verfügung stellen means "to provide".'],
  [5, 'Das neue Gesetz tritt im Januar in ______.', 'Kraft', ['Macht', 'Wirkung', 'Geltung'], 'in Kraft treten - вступать в силу.', 'in Kraft treten - күшіне ену.', 'in Kraft treten means "to come into force".'],
  [5, 'Wir müssen auch diese Möglichkeit in ______ ziehen.', 'Betracht', ['Sicht', 'Beachtung', 'Augen'], 'in Betracht ziehen - принимать во внимание.', 'in Betracht ziehen - назарға алу.', 'in Betracht ziehen means "to take into consideration".'],
  [5, 'Er hat großen Einfluss ______ die Entscheidung genommen.', 'auf', ['über', 'an', 'für'], 'Einfluss nehmen auf + Akkusativ - влиять на что-то.', 'Einfluss nehmen auf + Akkusativ - бірдеңеге әсер ету.', 'Einfluss nehmen auf + accusative means "to influence".'],
  [5, 'Ich gehe davon ______, dass alles klappt.', 'aus', ['an', 'auf', 'ein'], 'davon ausgehen - исходить из того, предполагать.', 'davon ausgehen - ... деп болжау, ... деп есептеу.', 'davon ausgehen means "to assume".'],
  [5, 'Wir kommen morgen, ______ es nicht regnet.', 'sofern', ['obwohl', 'damit', 'sodass'], 'sofern - «при условии, что».', 'sofern - «... деген шартпен».', 'sofern means "provided that".'],
  [5, 'Er ist nicht gekommen, ______ er es fest versprochen hatte.', 'obwohl', ['sofern', 'damit', 'zumal'], 'Противопоставление - obwohl.', 'Қарсы қою - obwohl.', 'A contrast takes obwohl.'],
  [5, 'Ich bleibe heute zu Hause, ______ ich ohnehin müde bin.', 'zumal', ['obwohl', 'sofern', 'damit'], 'zumal - «тем более что» (дополнительная причина).', 'zumal - «оның үстіне» (қосымша себеп).', 'zumal means "especially since" (an extra reason).'],
  [5, 'Die Kosten belaufen sich ______ 500 Euro.', 'auf', ['über', 'an', 'zu'], 'sich belaufen auf - составлять (о сумме).', 'sich belaufen auf - (сома туралы) құрау.', 'sich belaufen auf means "to amount to".'],
  [5, 'Das hängt ganz ______ dir ab.', 'von', ['an', 'auf', 'bei'], 'abhängen von + Dativ - зависеть от.', 'abhängen von + Dativ - ... тәуелді болу.', 'abhängen von + dative means "to depend on".'],
  [5, 'Nach der ______ des Vertrags begann die Arbeit.', 'Unterzeichnung', ['unterzeichnen', 'Unterzeichner', 'unterzeichnet'], 'Номинализация: после der нужно существительное процесса на -ung.', 'Номинализация: der-ден кейін -ung жұрнақты іс-әрекет зат есімі керек.', 'Nominalisation: after der we need the process noun in -ung.'],
  [5, 'Er wurde ______ Diebstahls angeklagt.', 'des', ['dem', 'den', 'der'], 'anklagen + Genitiv: jemanden des Diebstahls anklagen.', 'anklagen + Genitiv: jemanden des Diebstahls anklagen.', 'anklagen takes the genitive: jemanden des Diebstahls anklagen.'],
  [5, 'Sie ist sich ______ Gefahr bewusst.', 'der', ['die', 'den', 'dem'], 'sich einer Sache bewusst sein - с Genitiv: der Gefahr.', 'sich einer Sache bewusst sein - Genitiv-пен: der Gefahr.', 'sich einer Sache bewusst sein takes the genitive: der Gefahr.'],
  [5, 'Er gilt ______ einer der besten Ärzte der Stadt.', 'als', ['wie', 'für', 'zu'], 'gelten als - считаться кем-то.', 'gelten als - ... болып саналу.', 'gelten als means "to be considered".'],
  [5, 'Die Ergebnisse lassen darauf ______, dass die Methode funktioniert.', 'schließen', ['schließt', 'geschlossen', 'zu schließen'], 'lassen + инфинитив без zu: darauf schließen lassen - позволять заключить.', 'lassen + zu-сыз тұйық етістік: darauf schließen lassen - қорытынды жасауға мүмкіндік беру.', 'lassen + bare infinitive: darauf schließen lassen means "to suggest".'],
  [5, 'Er soll sehr reich ______.', 'sein', ['ist', 'wäre', 'seien'], 'Субъективное sollen («говорят, что») + инфинитив: er soll reich sein.', 'Субъективті sollen («... дейді») + тұйық етістік: er soll reich sein.', 'Subjective sollen ("he is said to") + infinitive: er soll reich sein.'],
  [5, 'Der Zug dürfte bald ______.', 'ankommen', ['angekommen', 'ankommt', 'anzukommen'], 'dürfte + инфинитив - предположение («вероятно»).', 'dürfte + тұйық етістік - болжам («шамасы»).', 'dürfte + infinitive expresses an assumption ("probably").'],
  [5, 'Es ist kaum zu ______, wie schnell er gelernt hat.', 'glauben', ['geglaubt', 'glaubt', 'glaubend'], 'sein + zu + инфинитив: es ist kaum zu glauben - трудно поверить.', 'sein + zu + тұйық етістік: es ist kaum zu glauben - сену қиын.', 'sein + zu + infinitive: es ist kaum zu glauben ("hard to believe").'],
  [5, 'Ungeachtet ______ Kritik hielt er an seinem Plan fest.', 'der', ['die', 'dem', 'den'], 'ungeachtet требует Genitiv; die Kritik: der Kritik.', 'ungeachtet Genitiv талап етеді; die Kritik: der Kritik.', 'ungeachtet takes the genitive; die Kritik: der Kritik.'],
  [5, 'Angesichts ______ Lage müssen wir schnell handeln.', 'der', ['die', 'dem', 'den'], 'angesichts требует Genitiv: angesichts der Lage.', 'angesichts Genitiv талап етеді: angesichts der Lage.', 'angesichts takes the genitive: angesichts der Lage.'],
  [5, 'Er hat es geschafft, ______ er keine Hilfe hatte.', 'obgleich', ['sofern', 'damit', 'falls'], 'obgleich - книжный синоним obwohl («хотя»).', 'obgleich - obwohl-дің кітаби синонимі («... болса да»).', 'obgleich is a formal synonym of obwohl ("although").'],
  // C2
  [6, 'Er kann kaum Englisch, ______ denn Chinesisch.', 'geschweige', ['geschweigen', 'gesagt', 'sondern'], 'geschweige denn - «не говоря уже о».', 'geschweige denn - «... туралы айтпағанда».', 'geschweige denn means "let alone".'],
  [6, 'Ich komme mit, es ______ denn, es regnet.', 'sei', ['ist', 'wäre', 'war'], 'Устойчивое выражение es sei denn («разве что, если только не») - Konjunktiv I.', 'Тұрақты тіркес es sei denn («... болмаса») - Konjunktiv I.', 'The fixed phrase es sei denn ("unless") uses Konjunktiv I.'],
  [6, 'Man ______ zwei Eier und etwas Mehl.', 'nehme', ['nehmen', 'nähme', 'nimm'], 'Konjunktiv I в рецептах и инструкциях: man nehme.', 'Рецепттер мен нұсқаулықтардағы Konjunktiv I: man nehme.', 'Konjunktiv I in recipes and instructions: man nehme.'],
  [6, 'Wie dem auch ______, wir machen weiter.', 'sei', ['ist', 'wäre', 'sein'], 'Устойчивое wie dem auch sei - «как бы то ни было».', 'Тұрақты тіркес wie dem auch sei - «қалай болғанда да».', 'The fixed phrase wie dem auch sei means "be that as it may".'],
  [6, 'Das kommt mir spanisch ______.', 'vor', ['an', 'auf', 'aus'], 'Идиома: etwas kommt mir spanisch vor - мне это кажется странным.', 'Идиома: etwas kommt mir spanisch vor - бұл маған оғаш көрінеді.', 'Idiom: etwas kommt mir spanisch vor - "it seems strange to me".'],
  [6, 'Mit dieser Bemerkung hat er den Nagel auf den ______ getroffen.', 'Kopf', ['Kern', 'Punkt', 'Hut'], 'Идиома: den Nagel auf den Kopf treffen - попасть в точку.', 'Идиома: den Nagel auf den Kopf treffen - дәл басып айту.', 'Idiom: den Nagel auf den Kopf treffen - "to hit the nail on the head".'],
  [6, 'Da liegt der Hund ______!', 'begraben', ['vergraben', 'gegraben', 'eingegraben'], 'Идиома: da liegt der Hund begraben - вот в чём суть.', 'Идиома: da liegt der Hund begraben - мәселенің түйіні осында.', 'Idiom: da liegt der Hund begraben - "that\'s the crux of the matter".'],
  [6, 'Das ist nicht mein ______.', 'Bier', ['Wein', 'Kaffee', 'Wasser'], 'Идиома: das ist nicht mein Bier - это не моё дело.', 'Идиома: das ist nicht mein Bier - бұл менің шаруам емес.', 'Idiom: das ist nicht mein Bier - "that\'s not my business".'],
  [6, 'Wir müssen jetzt in den sauren ______ beißen.', 'Apfel', ['Zitrone', 'Kirsche', 'Birne'], 'Идиома: in den sauren Apfel beißen - сделать неприятное, но нужное.', 'Идиома: in den sauren Apfel beißen - жағымсыз, бірақ керек істі істеу.', 'Idiom: in den sauren Apfel beißen - "to bite the bullet".'],
  [6, 'Beim Basteln hat er zwei linke ______.', 'Hände', ['Augen', 'Ohren', 'Arme'], 'Идиома: zwei linke Hände haben - быть неумелым в ручной работе.', 'Идиома: zwei linke Hände haben - қол жұмысына епсіз болу.', 'Idiom: zwei linke Hände haben - "to be all thumbs".'],
  [6, 'Viel Glück bei der Prüfung! Ich drücke dir die ______.', 'Daumen', ['Finger', 'Hände', 'Zehen'], 'Идиома: jemandem die Daumen drücken - держать кулачки за кого-то.', 'Идиома: jemandem die Daumen drücken - біреуге сәттілік тілеу.', 'Idiom: jemandem die Daumen drücken - "to keep one\'s fingers crossed".'],
  [6, 'Hast du ______ auf den Augen? Das Schild ist doch riesig!', 'Tomaten', ['Gurken', 'Kartoffeln', 'Äpfel'], 'Идиома: Tomaten auf den Augen haben - не замечать очевидного.', 'Идиома: Tomaten auf den Augen haben - көзге көрініп тұрғанды байқамау.', 'Idiom: Tomaten auf den Augen haben - "to miss the obvious".'],
  [6, 'Kaum ______ er angekommen, als das Telefon klingelte.', 'war', ['ist', 'hatte', 'wurde'], 'kaum ... als с инверсией и Plusquamperfekt; ankommen - с sein: kaum war er angekommen.', 'kaum ... als инверсиямен және Plusquamperfekt-пен; ankommen - sein-мен: kaum war er angekommen.', 'kaum ... als takes inversion and the pluperfect; ankommen uses sein: kaum war er angekommen.'],
  [6, 'Es versteht sich von ______, dass wir pünktlich sind.', 'selbst', ['allein', 'sich', 'selber'], 'Устойчивое es versteht sich von selbst - само собой разумеется.', 'Тұрақты тіркес es versteht sich von selbst - өзінен-өзі түсінікті.', 'The fixed phrase es versteht sich von selbst means "it goes without saying".'],
  [6, 'Er tat, als ______ er nichts gehört.', 'hätte', ['hat', 'hatte', 'wäre'], 'als + Konjunktiv (инверсия); hören образует прошедшее с haben: als hätte er nichts gehört.', 'als + Konjunktiv (инверсия); hören өткен шақты haben-мен жасайды: als hätte er nichts gehört.', 'als + subjunctive with inversion; hören forms the past with haben: als hätte er nichts gehört.'],
  [6, 'Die Prüfung war ______ als leicht.', 'alles andere', ['alles weniger', 'allem anderen', 'aller andere'], 'alles andere als - «совсем не, далеко не».', 'alles andere als - «мүлде ... емес».', 'alles andere als means "anything but".'],
  [6, 'Komm ______ mal her!', 'doch', ['denn', 'etwa', 'wohl'], 'Частица doch в просьбе смягчает и подбадривает: komm doch mal her.', 'doch шылауы өтінішті жұмсартады: komm doch mal her.', 'The particle doch softens a request: komm doch mal her.'],
  [6, 'Bist du ______ krank? Du siehst so blass aus.', 'etwa', ['ja', 'eben', 'halt'], 'Частица etwa в вопросе выражает удивление или опасение: bist du etwa krank?', 'etwa шылауы сұрақта таңғалу не алаңдауды білдіреді: bist du etwa krank?', 'The particle etwa in a question shows surprise or worry: bist du etwa krank?'],
  [6, 'Er sprach so leise, ______ niemand ihn verstand.', 'dass', ['damit', 'ob', 'als'], 'so ..., dass - следствие («так ..., что»).', 'so ..., dass - салдар («соншалық ..., ...»).', 'so ..., dass expresses a result ("so ... that").'],
  [6, 'Es bleibt abzuwarten, ______ die Reform Erfolg hat.', 'ob', ['dass', 'wenn', 'damit'], 'Неизвестно, «да или нет» - ob.', 'Белгісіз, «иә ма, жоқ па» - ob.', 'It is unknown "whether", so ob.'],
  [6, 'Er ist ein Mensch, ______ man sich verlassen kann.', 'auf den', ['auf dem', 'dem', 'den'], 'sich verlassen auf + Akkusativ; der Mensch → auf den.', 'sich verlassen auf + Akkusativ; der Mensch → auf den.', 'sich verlassen auf + accusative; der Mensch → auf den.'],
  [6, 'Er hat das Projekt, ______ aller Schwierigkeiten, erfolgreich beendet.', 'trotz', ['wegen', 'statt', 'mangels'], 'trotz + Genitiv - «несмотря на».', 'trotz + Genitiv - «... қарамастан».', 'trotz + genitive means "despite".'],
  [6, 'Mangels ______ musste die Veranstaltung ausfallen.', 'Interesses', ['Interesse', 'Interessen', 'Interessem'], 'mangels требует Genitiv: das Interesse → des Interesses.', 'mangels Genitiv талап етеді: das Interesse → des Interesses.', 'mangels takes the genitive: das Interesse → des Interesses.'],
  [6, 'Er wird den Zug wohl verpasst ______.', 'haben', ['sein', 'hat', 'gehabt'], 'Futur II (предположение о прошлом): werden + Partizip II + haben/sein; verpassen - с haben.', 'Futur II (өткен туралы болжам): werden + Partizip II + haben/sein; verpassen - haben-мен.', 'Futur II (a guess about the past): werden + participle + haben/sein; verpassen uses haben.'],
  [6, 'Sie wird schon nach Hause gegangen ______.', 'sein', ['haben', 'ist', 'gewesen'], 'Futur II: gehen образует Perfekt с sein: wird ... gegangen sein.', 'Futur II: gehen Perfekt-ті sein-мен жасайды: wird ... gegangen sein.', 'Futur II: gehen forms the Perfekt with sein: wird ... gegangen sein.'],
];

export const GERMAN = [
  ...HAND.map(([level, q, ok, wrong, ru, kk, en]) => row(level, q, ok, wrong, ru, kk, en)),
  ...seinHaben(),
  ...caseRows(1, [...THINGS, ...PEOPLE].filter((_, i) => i % 2 === 0), INDEF_FRAMES, INDEF, ['nom']),
  ...caseRows(1, THINGS, INDEF_FRAMES, INDEF, ['akk']),
  ...caseRows(1, PEOPLE, PEOPLE_FRAMES, DEF, ['akk']),
  ...caseRows(2, THINGS, THING_FRAMES, DEF, ['dat']),
  ...caseRows(2, PEOPLE, PEOPLE_FRAMES, DEF, ['dat']),
  ...caseRows(3, THINGS, THING_FRAMES, DEF, ['gen']),
  ...caseRows(3, PEOPLE, PEOPLE_FRAMES, DEF, ['gen']),
  ...perfAux(),
  ...partRows(),
  ...inversionRows(),
  ...subordinateRows(),
  ...twoWayRows(),
  ...adjRows(),
  ...relRows(),
  ...reflRows(),
  ...passiveRows(),
  ...nDeclRows(),
  ...kiiRows(),
  ...kiRows(),
  ...doubleInfRows(),
  ...participleRows(),
  ...futur2Rows(),
];
