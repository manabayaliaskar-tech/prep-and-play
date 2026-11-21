// Британский и американский английский. Пользователь выбирает вариант (по умолчанию британский):
// в заданиях английского написание слов приводится к выбранному варианту (colour ↔ color),
// а тема «British и American» учит различиям в словах, написании и грамматике.

import { pick, shuffle } from '../../core/random.js';
import { L, mcText, poolQ } from '../gen.js';

const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Пары написания: британское → американское. Только слова без второго значения. */
const SPELL = [
  ['colour', 'color'], ['favourite', 'favorite'], ['honour', 'honor'], ['labour', 'labor'], ['neighbour', 'neighbor'],
  ['flavour', 'flavor'], ['humour', 'humor'], ['behaviour', 'behavior'], ['harbour', 'harbor'], ['rumour', 'rumor'],
  ['centre', 'center'], ['theatre', 'theater'], ['metre', 'meter'], ['litre', 'liter'], ['fibre', 'fiber'],
  ['organise', 'organize'], ['realise', 'realize'], ['recognise', 'recognize'], ['apologise', 'apologize'], ['criticise', 'criticize'],
  ['analyse', 'analyze'], ['paralyse', 'paralyze'], ['memorise', 'memorize'], ['emphasise', 'emphasize'], ['summarise', 'summarize'],
  ['organisation', 'organization'], ['realisation', 'realization'], ['travelled', 'traveled'], ['travelling', 'traveling'], ['traveller', 'traveler'],
  ['cancelled', 'canceled'], ['cancelling', 'canceling'], ['jewellery', 'jewelry'], ['defence', 'defense'], ['offence', 'offense'],
  ['catalogue', 'catalog'], ['dialogue', 'dialog'], ['grey', 'gray'], ['pyjamas', 'pajamas'], ['aeroplane', 'airplane'],
  ['mum', 'mom'], ['cheque', 'check'], ['enrol', 'enroll'], ['fulfil', 'fulfill'], ['skilful', 'skillful'],
];

const byWord = (pairs, from, to) => {
  const map = new Map();
  for (const p of pairs) map.set(p[from], p[to]);
  return map;
};
const TO_US = byWord(SPELL, 0, 1);
const TO_UK = byWord(SPELL, 1, 0);
// «check» в американском - ещё и «проверять», поэтому обратно в «cheque» не превращаем.
TO_UK.delete('check');
const WORD = /[A-Za-z]+(?:'[a-z]+)?/g;

const keepCase = (src, word) => (src === src.toUpperCase() && src.length > 1 ? word.toUpperCase() : src[0] === src[0].toUpperCase() ? word[0].toUpperCase() + word.slice(1) : word);

/** Привести написание слов в тексте к варианту 'uk' или 'us'. Слова с похожим началом не трогаем. */
export function spellAs(text, variant) {
  if (typeof text !== 'string' || !text) return text;
  const map = variant === 'us' ? TO_US : TO_UK;
  // Множественное число и -s у глаголов: colours → colors, realises → realizes.
  return text.replace(WORD, (w) => {
    const low = w.toLowerCase();
    if (map.has(low)) return keepCase(w, map.get(low));
    if (low.endsWith('s') && map.has(low.slice(0, -1))) return keepCase(w, `${map.get(low.slice(0, -1))}s`);
    if (low.endsWith('d') && map.has(low.slice(0, -1))) return keepCase(w, `${map.get(low.slice(0, -1))}d`);
    return w;
  });
}

/** Все строки задания (текст, варианты, разбор) - в выбранном варианте. */
export function variantize(q, variant) {
  const walk = (x) => (typeof x === 'string' ? spellAs(x, variant) : Array.isArray(x) ? x.map(walk) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === 'id' ? v : walk(v)])) : x);
  return walk(q);
}

// ---------- Тема «British и American» ----------

/** Слова: британское, американское, перевод на русский и казахский, уровень (1-6). */
const WORDS = [
  ['flat', 'apartment', 'квартира', 'пәтер', 2], ['lift', 'elevator', 'лифт', 'лифт', 2], ['lorry', 'truck', 'грузовик', 'жүк көлігі', 2],
  ['holiday', 'vacation', 'отпуск, каникулы', 'демалыс', 2], ['autumn', 'fall', 'осень', 'күз', 2], ['biscuit', 'cookie', 'печенье', 'печенье', 2],
  ['rubbish', 'garbage', 'мусор', 'қоқыс', 2], ['mobile phone', 'cell phone', 'мобильный телефон', 'ұялы телефон', 2], ['petrol', 'gas', 'бензин', 'бензин', 3],
  ['chips', 'fries', 'картофель фри', 'фри картобы', 2], ['crisps', 'chips', 'чипсы', 'чипсы', 2], ['sweets', 'candy', 'конфеты', 'кәмпит', 2],
  ['trousers', 'pants', 'брюки', 'шалбар', 2], ['jumper', 'sweater', 'свитер', 'свитер', 3], ['trainers', 'sneakers', 'кроссовки', 'кроссовка', 2],
  ['underground', 'subway', 'метро', 'метро', 3], ['pavement', 'sidewalk', 'тротуар', 'жаяу жүргінші жолы', 3], ['car park', 'parking lot', 'парковка', 'көлік тұрағы', 3],
  ['motorway', 'highway', 'шоссе', 'тас жол', 3], ['queue', 'line', 'очередь', 'кезек', 3], ['shop', 'store', 'магазин', 'дүкен', 2],
  ['post', 'mail', 'почта', 'пошта', 2], ['postcode', 'zip code', 'почтовый индекс', 'пошта индексі', 3], ['film', 'movie', 'фильм', 'фильм', 1],
  ['cinema', 'movie theater', 'кинотеатр', 'кинотеатр', 2], ['football', 'soccer', 'футбол', 'футбол', 2], ['timetable', 'schedule', 'расписание', 'кесте', 3],
  ['term', 'semester', 'семестр, четверть', 'тоқсан, семестр', 4], ['rubber', 'eraser', 'ластик', 'өшіргіш', 2], ['torch', 'flashlight', 'фонарик', 'қалта шамы', 3],
  ['tap', 'faucet', 'кран', 'шүмек', 4], ['nappy', 'diaper', 'подгузник', 'жаялық', 4], ['dustbin', 'trash can', 'мусорное ведро', 'қоқыс жәшігі', 3],
  ['wardrobe', 'closet', 'шкаф для одежды', 'киім шкафы', 3], ['ground floor', 'first floor', 'первый этаж', 'бірінші қабат', 4], ['return ticket', 'round-trip ticket', 'билет туда и обратно', 'бару-қайту билеті', 4],
  ['bill', 'check', 'счёт в ресторане', 'мейрамханадағы есеп', 3], ['chemist', 'drugstore', 'аптека', 'дәріхана', 3], ['maths', 'math', 'математика', 'математика', 1],
  ['taxi', 'cab', 'такси', 'такси', 2], ['curriculum vitae (CV)', 'résumé', 'резюме', 'түйіндеме', 5], ['fortnight', 'two weeks', 'две недели', 'екі апта', 4],
];

/** Грамматика и выражения: британский вариант, американский, пояснение. */
const GRAMMAR = [
  ['Have you got a pen?', 'Do you have a pen?', L('have got is more common in British English, do you have - in American', 'have got чаще в британском, do you have - в американском', 'have got британ тілінде жиі, do you have - американ тілінде')],
  ['I have just eaten.', 'I just ate.', L('Americans often use Past Simple with just, already, yet', 'В американском с just, already, yet часто ставят Past Simple', 'Американ тілінде just, already, yet сөздерімен Past Simple жиі қолданылады')],
  ['at the weekend', 'on the weekend', L('British say at the weekend, Americans - on the weekend', 'Британцы говорят at the weekend, американцы - on the weekend', 'Британдықтар at the weekend, американдықтар on the weekend дейді')],
  ['in hospital', 'in the hospital', L('Americans use the before hospital', 'В американском перед hospital ставят the', 'Американ тілінде hospital алдында the қойылады')],
  ['different from / to', 'different from / than', L('different to is British, different than is American', 'different to - британское, different than - американское', 'different to - британдық, different than - американдық')],
  ['The team are winning.', 'The team is winning.', L('British English can use plural verbs with group nouns', 'В британском с собирательными существительными бывает глагол во множественном числе', 'Британ тілінде жинақтау зат есімдерімен етістік көпше түрде болуы мүмкін')],
  ['learnt, dreamt, burnt', 'learned, dreamed, burned', L('British English often uses -t forms', 'В британском часто формы на -t', 'Британ тілінде көбіне -t тұлғасы')],
  ['got', 'gotten', L('Americans say have gotten, British - have got', 'Американцы говорят have gotten, британцы - have got', 'Американдықтар have gotten, британдықтар have got дейді')],
  ['Shall we go?', "Should we go? / Let's go?", L('shall for offers is mostly British', 'shall в предложениях - в основном британское', 'Ұсыныстағы shall көбіне британдық')],
  ['write to me', 'write me', L('Americans can drop to after write', 'В американском после write можно без to', 'Американ тілінде write сөзінен кейін to түсіп қалуы мүмкін')],
];

/** Сколько всего заданий в теме: слова в обе стороны, написание в обе стороны, грамматика в обе стороны. */
export const UKUS_COUNT = WORDS.length * 2 + SPELL.length * 2 + GRAMMAR.length * 2;

/** Генератор темы «British и American»: что как называется, как пишется и говорится в другом варианте. */
export function ukusMaker(topic) {
  return (ctx, level) => {
    const kinds = ['word', 'word', 'spell', 'gram'];
    for (let attempt = 0; attempt < 30; attempt++) {
      const kind = pick(ctx.rng, kinds);
      const toUs = ctx.rng() < 0.5;
      if (kind === 'word') {
        const pool = WORDS.filter((w) => w[4] <= Math.max(2, level + 1));
        const i = WORDS.indexOf(pick(ctx.rng, pool));
        const id = `${topic}:w${i}${toUs ? 'u' : 'b'}`;
        if (attempt < 20 && ctx.used?.has(id)) continue;
        const [uk, us, ru, kk] = WORDS[i];
        const right = toUs ? us : uk;
        const others = [...new Set(shuffle(WORDS.filter((w, j) => j !== i).map((w) => (toUs ? w[1] : w[0])), ctx.rng))].filter((x) => x !== right && x !== uk && x !== us).slice(0, 3);
        const mc = mcText(ctx.rng, right, others);
        const q = poolQ(topic, 1, {
          kind: 'text',
          prompt: toUs
            ? L(`In British English it is "${uk}" (${'«'}${ru}${'»'}). What do Americans say?`, `По-британски это «${uk}» (${ru}). Как скажут американцы?`, `Британша бұл «${uk}» (${kk}). Американдықтар қалай айтады?`)
            : L(`In American English it is "${us}". What do the British say?`, `По-американски это «${us}» (${ru}). Как скажут британцы?`, `Американша бұл «${us}» (${kk}). Британдықтар қалай айтады?`),
          ex: L(`British "${uk}" = American "${us}".`, `Британское «${uk}» = американское «${us}» - ${ru}.`, `Британдық «${uk}» = американдық «${us}» - ${kk}.`),
          mc,
        });
        q.id = id;
        q.level = CEFR[level - 1];
        return q;
      }
      if (kind === 'spell') {
        const i = Math.floor(ctx.rng() * SPELL.length);
        const id = `${topic}:s${i}${toUs ? 'u' : 'b'}`;
        if (attempt < 20 && ctx.used?.has(id)) continue;
        const [uk, us] = SPELL[i];
        const right = toUs ? us : uk;
        const wrong = toUs ? uk : us;
        const extra = shuffle(SPELL.filter((_, j) => j !== i), ctx.rng).slice(0, 2).map((p) => (toUs ? p[0] : p[1]));
        const mc = mcText(ctx.rng, right, [wrong, ...extra]);
        const q = poolQ(topic, 1, {
          kind: 'text',
          prompt: toUs
            ? L('Which word is spelled the American way?', 'Какое слово написано по-американски?', 'Қай сөз американша жазылған?')
            : L('Which word is spelled the British way?', 'Какое слово написано по-британски?', 'Қай сөз британша жазылған?'),
          ex: L(`British: ${uk}, American: ${us}.`, `Британское написание: ${uk}, американское: ${us}.`, `Британша: ${uk}, американша: ${us}.`),
          mc,
        });
        q.id = id;
        q.level = CEFR[level - 1];
        return q;
      }
      const i = Math.floor(ctx.rng() * GRAMMAR.length);
      const id = `${topic}:g${i}${toUs ? 'u' : 'b'}`;
      if (attempt < 20 && ctx.used?.has(id)) continue;
      const [uk, us, why] = GRAMMAR[i];
      const right = toUs ? us : uk;
      const others = shuffle(GRAMMAR.filter((_, j) => j !== i), ctx.rng).slice(0, 3).map((g) => (toUs ? g[0] : g[1]));
      const mc = mcText(ctx.rng, right, others);
      const q = poolQ(topic, 2, {
        kind: 'text',
        passage: toUs ? uk : us,
        prompt: toUs
          ? L('This is British English. How would an American usually say it?', 'Это британский вариант. Как обычно скажет американец?', 'Бұл британдық нұсқа. Американдық әдетте қалай айтады?')
          : L('This is American English. How would a British speaker usually say it?', 'Это американский вариант. Как обычно скажет британец?', 'Бұл американдық нұсқа. Британдық әдетте қалай айтады?'),
        ex: why,
        mc,
      });
      q.id = id;
        q.level = CEFR[level - 1];
      return q;
    }
    throw new Error('ukus: нет свободных заданий');
  };
}
