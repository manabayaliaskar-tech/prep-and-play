// Турецкий: спряжение глаголов по временам и наклонениям с гармонией гласных.
// Формы строятся в tr-morph.js. Два вида заданий: «форма для лица» и «какое время нужно по смыслу».

import { pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { verb } from './tr-morph.js';

/** Глагол: s - основа, inf - инфинитив, aor - широкое время (3 л.), soft - основа перед гласной, obj - дополнение. */
const V = (s, inf, aor, en, ru, kk, obj, o = {}) => ({ s, inf, aor, en, ru, kk, obj, ...o });
export const TR_VERBS = [
  V('gel', 'gelmek', 'gelir', 'to come', 'приходить', 'келу', 'eve'),
  V('git', 'gitmek', 'gider', 'to go', 'идти, ехать', 'бару', 'okula', { soft: 'gid' }),
  V('yap', 'yapmak', 'yapar', 'to do', 'делать', 'істеу', 'ödev'),
  V('oku', 'okumak', 'okur', 'to read', 'читать', 'оқу', 'kitap'),
  V('yaz', 'yazmak', 'yazar', 'to write', 'писать', 'жазу', 'mektup'),
  V('iç', 'içmek', 'içer', 'to drink', 'пить', 'ішу', 'çay'),
  V('ye', 'yemek', 'yer', 'to eat', 'есть', 'жеу', 'elma', { yi: true }),
  V('konuş', 'konuşmak', 'konuşur', 'to speak', 'говорить', 'сөйлеу', 'Türkçe'),
  V('çalış', 'çalışmak', 'çalışır', 'to work, to study', 'работать, заниматься', 'жұмыс істеу, оқу', 'çok'),
  V('öğren', 'öğrenmek', 'öğrenir', 'to learn', 'учить', 'үйрену', 'Türkçe'),
  V('izle', 'izlemek', 'izler', 'to watch', 'смотреть', 'көру (фильм)', 'film'),
  V('dinle', 'dinlemek', 'dinler', 'to listen', 'слушать', 'тыңдау', 'müzik'),
  V('bekle', 'beklemek', 'bekler', 'to wait', 'ждать', 'күту', 'otobüsü'),
  V('başla', 'başlamak', 'başlar', 'to begin', 'начинать', 'бастау', 'işe'),
  V('oyna', 'oynamak', 'oynar', 'to play', 'играть', 'ойнау', 'futbol'),
  V('al', 'almak', 'alır', 'to buy, to take', 'покупать, брать', 'сатып алу, алу', 'ekmek'),
  V('ver', 'vermek', 'verir', 'to give', 'давать', 'беру', 'hediye'),
  V('gör', 'görmek', 'görür', 'to see', 'видеть', 'көру', 'denizi'),
  V('bil', 'bilmek', 'bilir', 'to know', 'знать', 'білу', 'cevabı'),
  V('sev', 'sevmek', 'sever', 'to love', 'любить', 'жақсы көру', 'müziği'),
  V('uyu', 'uyumak', 'uyur', 'to sleep', 'спать', 'ұйықтау', 'erken'),
  V('koş', 'koşmak', 'koşar', 'to run', 'бегать', 'жүгіру', 'parkta'),
  V('yüz', 'yüzmek', 'yüzer', 'to swim', 'плавать', 'жүзу', 'denizde'),
  V('bul', 'bulmak', 'bulur', 'to find', 'находить', 'табу', 'anahtarı'),
  V('otur', 'oturmak', 'oturur', 'to sit, to live', 'сидеть, жить', 'отыру, тұру', 'bahçede'),
  V('yaşa', 'yaşamak', 'yaşar', 'to live', 'жить', 'өмір сүру', "İstanbul'da"),
  V('yardım et', 'yardım etmek', 'yardım eder', 'to help', 'помогать', 'көмектесу', 'komşulara', { soft: 'yardım ed' }),
  V('ara', 'aramak', 'arar', 'to call, to look for', 'звонить, искать', 'қоңырау шалу, іздеу', 'doktoru'),
  V('bitir', 'bitirmek', 'bitirir', 'to finish', 'заканчивать', 'аяқтау', 'işi'),
  V('aç', 'açmak', 'açar', 'to open', 'открывать', 'ашу', 'pencereyi'),
  V('kapat', 'kapatmak', 'kapatır', 'to close', 'закрывать', 'жабу', 'kapıyı'),
  V('anla', 'anlamak', 'anlar', 'to understand', 'понимать', 'түсіну', 'soruyu'),
  V('düşün', 'düşünmek', 'düşünür', 'to think', 'думать', 'ойлау', 'geleceği'),
  V('gönder', 'göndermek', 'gönderir', 'to send', 'отправлять', 'жіберу', 'mesaj'),
  V('sat', 'satmak', 'satar', 'to sell', 'продавать', 'сату', 'araba'),
  V('öde', 'ödemek', 'öder', 'to pay', 'платить', 'төлеу', 'hesabı'),
  V('unut', 'unutmak', 'unutur', 'to forget', 'забывать', 'ұмыту', 'şifreyi'),
  V('hatırla', 'hatırlamak', 'hatırlar', 'to remember', 'помнить', 'есте сақтау', 'tarihi'),
  V('pişir', 'pişirmek', 'pişirir', 'to cook', 'готовить', 'пісіру', 'yemek'),
  V('temizle', 'temizlemek', 'temizler', 'to clean', 'убирать', 'тазалау', 'odayı'),
  V('kazan', 'kazanmak', 'kazanır', 'to win', 'выигрывать', 'жеңу', 'maçı'),
  V('kaybet', 'kaybetmek', 'kaybeder', 'to lose', 'терять', 'жоғалту', 'anahtarı', { soft: 'kaybed' }),
  V('söyle', 'söylemek', 'söyler', 'to sing, to say', 'петь, говорить', 'ән айту, айту', 'şarkı'),
  V('getir', 'getirmek', 'getirir', 'to bring', 'приносить', 'әкелу', 'su'),
  V('taşı', 'taşımak', 'taşır', 'to carry', 'нести', 'көтеру, тасу', 'çantayı'),
  V('kalk', 'kalkmak', 'kalkar', 'to get up', 'вставать', 'тұру (орнынан)', 'erken'),
  V('yürü', 'yürümek', 'yürür', 'to walk', 'гулять пешком', 'жаяу жүру', 'parkta'),
  V('kal', 'kalmak', 'kalır', 'to stay', 'оставаться', 'қалу', 'evde'),
];

export const PRON = ['Ben', 'Sen', 'O', 'Biz', 'Siz', 'Onlar'];
export const PRON_RU = ['ben (я)', 'sen (ты)', 'o (он, она)', 'biz (мы)', 'siz (вы)', 'onlar (они)'];
export const PRON_KK = ['ben (мен)', 'sen (сен)', 'o (ол)', 'biz (біз)', 'siz (сіз, сендер)', 'onlar (олар)'];
export const PRON_EN = ['ben (I)', 'sen (you)', 'o (he/she)', 'biz (we)', 'siz (you, plural)', 'onlar (they)'];

const TENSES = {
  pres: { level: 1, f: verb.pres, name: L('present continuous (-iyor)', 'настоящее продолженное (-iyor)', 'нақ осы шақ (-iyor)'), rule: L('Present continuous: stem + -iyor (vowel by harmony: ı, i, u, ü) + personal ending.', 'Настоящее продолженное: основа + -iyor (гласная по гармонии: ı, i, u, ü) + личное окончание.', 'Нақ осы шақ: түбір + -iyor (дауысты үндестік бойынша: ı, i, u, ü) + жіктік жалғау.') },
  presNeg: { level: 1, f: verb.presNeg, name: L('negative present (-miyor)', 'отрицание настоящего (-miyor)', 'осы шақтың болымсыз түрі (-miyor)'), rule: L('Negation: stem + -m + harmony vowel + -yor.', 'Отрицание: основа + -m + гласная по гармонии + -yor.', 'Болымсыздық: түбір + -m + үндестік дауыстысы + -yor (қазақшадағы -ма/-ме сияқты).') },
  past: { level: 2, f: verb.past, name: L('past tense (-di)', 'прошедшее время (-di)', 'жедел өткен шақ (-di)'), rule: L('Past: stem + -di/-dı/-du/-dü (-ti after a voiceless consonant) + -m, -n, -, -k, -niz, -ler.', 'Прошедшее: основа + -di/-dı/-du/-dü (-ti после глухой) + -m, -n, -, -k, -niz, -ler.', 'Жедел өткен шақ: түбір + -di/-dı/-du/-dü (қатаңнан кейін -ti) + -m, -n, -, -k, -niz, -ler - қазақшадағы -ды/-ді сияқты.') },
  fut: { level: 2, f: verb.fut, name: L('future (-ecek)', 'будущее время (-ecek)', 'келер шақ (-ecek)'), rule: L('Future: stem + -ecek/-acak; before a vowel k becomes ğ: geleceğim.', 'Будущее: основа + -ecek/-acak; перед гласной k → ğ: geleceğim.', 'Келер шақ: түбір + -ecek/-acak; дауыстының алдында k → ğ: geleceğim.') },
  aor: { level: 3, f: verb.aor, name: L('aorist (-ir/-er)', 'широкое время (-ir/-er)', 'ауыспалы осы шақ (-ir/-er)'), rule: L('Aorist (habits, general truths): -r after a vowel, -er/-ar for most one-syllable verbs, -ir for the rest.', 'Широкое время (привычки, общие истины): -r после гласной, -er/-ar у большинства односложных, -ir у остальных.', 'Ауыспалы осы шақ (әдет, жалпы шындық): дауыстыдан кейін -r, бір буындылардың көбінде -er/-ar, қалғандарында -ir.') },
  evid: { level: 3, f: verb.evid, name: L('reported past (-miş)', 'пересказывательное прошедшее (-miş)', 'естіп-білген өткен шақ (-miş)'), rule: L('-miş: something you did not see yourself or just found out.', '-miş: то, что ты не видел сам или только что узнал.', '-miş: өз көзіңмен көрмеген не жаңа білген нәрсе (қазақшадағы -ыпты сияқты).') },
  abil: { level: 3, f: verb.abil, name: L('ability (-ebil)', 'возможность (-ebil)', 'мүмкіндік (-ebil)'), rule: L('Ability: stem + -ebil/-abil + aorist -ir: gelebilirim "I can come".', 'Возможность: основа + -ebil/-abil + широкое -ir: gelebilirim «я могу прийти».', 'Мүмкіндік: түбір + -ebil/-abil + -ir: gelebilirim «келе аламын» (қазақшадағы -а алу).') },
  nec: { level: 4, f: verb.nec, name: L('necessity (-meli)', 'долженствование (-meli)', 'міндет райы (-meli)'), rule: L('Necessity: stem + -meli/-malı + personal ending: gitmeliyim "I must go".', 'Долженствование: основа + -meli/-malı + личное окончание: gitmeliyim «я должен идти».', 'Міндет: түбір + -meli/-malı + жіктік жалғау: gitmeliyim «баруым керек».') },
  cond: { level: 4, f: verb.cond, name: L('conditional (-se)', 'условное наклонение (-se)', 'шартты рай (-se)'), rule: L('Conditional/wish: stem + -se/-sa + -m, -n, -, -k, -niz, -ler.', 'Условное/желательное: основа + -se/-sa + -m, -n, -, -k, -niz, -ler.', 'Шартты рай: түбір + -se/-sa + -m, -n, -, -k, -niz, -ler - қазақшадағы -са/-се сияқты.') },
  pastCont: { level: 4, f: verb.pastCont, name: L('past continuous (-iyordu)', 'прошедшее продолженное (-iyordu)', 'өткен шақтың созылыңқы түрі (-iyordu)'), rule: L('Past continuous: -iyor + -du + -m, -n, -, -k, -nuz; they: -iyorlardı.', 'Прошедшее продолженное: -iyor + -du + -m, -n, -, -k, -nuz; они: -iyorlardı.', 'Өткен шақтың созылыңқы түрі: -iyor + -du + -m, -n, -, -k, -nuz; олар: -iyorlardı.') },
  plup: { level: 5, f: verb.plup, name: L('past perfect (-mişti)', 'давнопрошедшее (-mişti)', 'бұрынғы өткен шақ (-mişti)'), rule: L('Past perfect: -miş + -ti: an action before another past action.', 'Давнопрошедшее: -miş + -ti - действие раньше другого прошедшего.', 'Бұрынғы өткен шақ: -miş + -ti - басқа өткен әрекеттен бұрынғы әрекет.') },
  futPast: { level: 5, f: verb.futPast, name: L('future in the past (-ecekti)', 'будущее в прошедшем (-ecekti)', 'өткендегі келер шақ (-ecekti)'), rule: L('-ecekti: something that was going to happen (often it did not).', '-ecekti: то, что собиралось произойти (часто не произошло).', '-ecekti: болуға тиіс болған (жиі болмай қалған) нәрсе.') },
  condAor: { level: 5, f: verb.condAor, name: L('real condition (-irse)', 'реальное условие (-irse)', 'шынайы шарт (-irse)'), rule: L('Real condition: aorist + -se: gelirsem "if I come".', 'Реальное условие: широкое время + -se: gelirsem «если я приду».', 'Шынайы шарт: ауыспалы шақ + -se: gelirsem «келсем».') },
};

const verbsFor = (level) => (level >= 6 ? TR_VERBS.filter((v) => ['gel', 'git', 'ye', 'al', 'bil', 'bul', 'gör', 'ver', 'kal', 'otur', 'yardım et', 'kaybet'].includes(v.s)) : TR_VERBS);
function tensesFor(level) {
  const all = Object.keys(TENSES);
  if (level >= 6) return all;
  return all.filter((t) => TENSES[t].level === level);
}
const cap = (s) => s[0].toLocaleUpperCase('tr') + s.slice(1);

function explain(v, t, shown) {
  const tn = TENSES[t];
  return L(
    `${tn.rule.en} ${v.inf} (${v.en}): ${shown}.`,
    `${tn.rule.ru} ${v.inf} (${v.ru}) - ${tn.name.ru}: ${shown}.`,
    `${tn.rule.kk} ${v.inf} (${v.kk}) - ${tn.name.kk}: ${shown}.`,
  );
}

/** Подлежащее «onlar» допускает и форму 3-го лица ед. числа (Onlar geliyor), поэтому её не даём в ловушки. */
const forbidden = (p) => (p === 5 ? [2] : []);

function personTask(ctx, topic, t, v) {
  const f = TENSES[t].f;
  const p = Math.floor(ctx.rng() * 6);
  const correct = f(v, p);
  const pool = [0, 1, 2, 3, 4, 5].filter((k) => k !== p && !forbidden(p).includes(k)).map((k) => f(v, k));
  const wrong = shuffle([...new Set(pool.filter((x) => x !== correct))], ctx.rng).slice(0, 3);
  if (wrong.length < 3) return null;
  const passage = `${PRON[p]} ${v.obj} ______. (${v.inf})`;
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const all = [correct, ...wrong];
  const q = poolQ(topic, 1, { kind: 'text', passage, prompt: L('Choose the correct form of the verb.', 'Выбери правильную форму глагола.', 'Етістіктің дұрыс түрін таңда.'), ex: explain(v, t, `${PRON[p]} ${v.obj} ${correct}`), mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.voice = { lang: 'tr' };
  q.id = `${topic}:p:${v.s}:${t}:${p}`;
  return q;
}

/** Время по слову-маркеру. Ловушки - только времена, которые с этим маркером точно неверны. */
const MARKERS = {
  pres: { words: ['Şu anda', 'Şu an'], wrong: ['fut', 'plup', 'futPast', 'cond'] },
  past: { words: ['Dün', 'Geçen hafta', 'Geçen yıl', 'Dün akşam'], wrong: ['pres', 'fut', 'nec', 'cond'] },
  fut: { words: ['Yarın', 'Gelecek hafta', 'Gelecek yıl', 'Yarın akşam'], wrong: ['past', 'evid', 'plup', 'pastCont'] },
};
function tenseTask(ctx, topic, t, v) {
  if (!MARKERS[t]) return null;
  const p = Math.floor(ctx.rng() * 5);
  const correct = TENSES[t].f(v, p);
  const wrong = [];
  for (const tt of shuffle(MARKERS[t].wrong, ctx.rng)) {
    const f = TENSES[tt].f(v, p);
    if (f !== correct && !wrong.includes(f)) wrong.push(f);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) return null;
  const marker = pick(ctx.rng, MARKERS[t].words);
  const passage = `${marker} ${PRON[p].toLocaleLowerCase('tr')} ${v.obj} ______. (${v.inf})`;
  const order = shuffle([0, 1, 2, 3], ctx.rng);
  const all = [correct, ...wrong];
  const prompt = L('Which tense fits the sentence? Choose the form.', 'Какое время нужно по смыслу? Выбери форму.', 'Мағынасы бойынша қай шақ керек? Түрін таңда.');
  const q = poolQ(topic, 2, { kind: 'text', passage, prompt, ex: explain(v, t, cap(`${marker} ${PRON[p].toLocaleLowerCase('tr')} ${v.obj} ${correct}`)), mc: { choices: order.map((k) => all[k]), answer: order.indexOf(0) } });
  q.voice = { lang: 'tr' };
  q.id = `${topic}:t:${v.s}:${t}:${p}`;
  return q;
}

export function trVerbsMaker(topic) {
  return (ctx, level) => {
    for (let attempt = 0; attempt < 16; attempt++) {
      const own = tensesFor(level);
      const lower = Object.keys(TENSES).filter((t) => TENSES[t].level < level);
      const t = pick(ctx.rng, lower.length && level < 6 && ctx.rng() < 0.35 ? lower : own);
      const v = pick(ctx.rng, verbsFor(level));
      const q = (level === 1 || !MARKERS[t] || ctx.rng() < 0.55 ? personTask : tenseTask)(ctx, topic, t, v);
      if (q && (!ctx.used?.has(q.id) || attempt === 15)) {
        q.d = Math.min(3, Math.ceil(level / 2));
        q.level = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][level - 1];
        return q;
      }
    }
    throw new Error(`tr.verbs ${level}`);
  };
}
