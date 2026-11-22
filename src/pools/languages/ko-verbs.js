// Спряжение корейских глаголов и прилагательных по правилам (с неправильными типами ㅂ, ㄷ, ㅅ, 르, ㅎ).
// Слоги хангыля собираются из букв арифметикой Юникода: код = 0xAC00 + (начальная × 21 + гласная) × 28 + конечная.

import { L } from '../gen.js';

const dec = (ch) => {
  const c = ch.charCodeAt(0) - 0xac00;
  return { l: Math.floor(c / 588), v: Math.floor((c % 588) / 28), t: c % 28 };
};
const enc = (l, v, t = 0) => String.fromCharCode(0xac00 + l * 588 + v * 28 + t);
const setT = (ch, t) => {
  const { l, v } = dec(ch);
  return enc(l, v, t);
};
/** Светлые гласные ㅏ, ㅑ, ㅗ требуют -아, остальные -어. */
const bright = (v) => v === 0 || v === 2 || v === 8;
const T_L = 8;
const T_SS = 20;

/** Части основы: s - основа, pre - всё до последнего слога, last - последний слог и его буквы. */
function parts(w) {
  const s = w.ko.slice(0, -1);
  const last = s.at(-1);
  return { s, pre: s.slice(0, -1), last, ...dec(last) };
}

/** Вежливая форма -아요/어요. */
export function yo(w) {
  const { s, pre, l, v, t } = parts(w);
  if (s.endsWith('하')) return `${pre}해요`;
  if (w.irr === 'b') return s === '돕' || s === '곱' ? `${pre}${enc(l, v)}와요` : `${pre}${enc(l, v)}워요`;
  if (w.irr === 'd') return `${pre}${enc(l, v, T_L)}${bright(v) ? '아요' : '어요'}`;
  if (w.irr === 's') return `${pre}${enc(l, v)}${bright(v) ? '아요' : '어요'}`;
  if (w.irr === 'r') {
    const p = dec(pre.at(-1));
    return `${pre.slice(0, -1)}${enc(p.l, p.v, T_L)}${bright(p.v) ? '라요' : '러요'}`;
  }
  if (w.irr === 'h') return `${pre}${enc(l, v === 2 || v === 6 ? 3 : 1)}요`;
  if (t) return `${s}${bright(v) ? '아요' : '어요'}`;
  if (v === 18) {
    const nv = pre && bright(dec(pre.at(-1)).v) ? 0 : 4;
    return `${pre}${enc(l, nv)}요`;
  }
  if ([0, 1, 4, 5, 6].includes(v)) return `${s}요`;
  if (v === 8) return `${pre}${enc(l, 9)}요`;
  if (v === 13) return `${pre}${enc(l, 14)}요`;
  if (v === 20) return `${pre}${enc(l, 6)}요`;
  if (v === 11) return `${pre}${enc(l, 10)}요`;
  return `${s}어요`;
}

/** Прошедшее время из формы на -요: 가요 → 갔어요, 먹어요 → 먹었어요, 해요 → 했어요. */
export const pastOf = (y) => {
  const body = y.slice(0, -1);
  return `${body.slice(0, -1)}${setT(body.at(-1), T_SS)}어요`;
};

/** Официально-вежливая форма -(스)ㅂ니다. */
export function formal(w) {
  const { s, pre, last, t } = parts(w);
  if (!t) return `${pre}${setT(last, 17)}니다`;
  if (t === T_L && w.irr !== 'd') return `${pre}${setT(last, 17)}니다`;
  return `${s}습니다`;
}

/** Окончания с «прокладкой» 으: suf - 면, 세요, 니까, 라고, 려고, 려면, 므로 или ㄹ (будущее, «могу»). */
const KEEP_L = new Set(['면', '라고', '려고', '려면', '므로']);
export function eu(w, suf) {
  const { s, pre, l, v, t } = parts(w);
  const vowel = (base) => (suf === 'ㄹ' ? `${base.slice(0, -1)}${setT(base.at(-1), T_L)}` : `${base}${suf}`);
  const cons = (base) => (suf === 'ㄹ' ? `${base}을` : `${base}으${suf}`);
  if (w.irr === 'b') return vowel(`${pre}${enc(l, v)}우`);
  if (w.irr === 'd') return cons(`${pre}${enc(l, v, T_L)}`);
  if (w.irr === 's') return cons(`${pre}${enc(l, v)}`);
  if (w.irr === 'h') return vowel(`${pre}${enc(l, v)}`);
  if (t === T_L) return KEEP_L.has(suf) ? `${s}${suf}` : vowel(`${pre}${enc(l, v)}`);
  if (t) return cons(s);
  return vowel(s);
}

/** Косвенная речь «говорит, что …»: 간다고, 먹는다고, 산다고, 예쁘다고. */
export function dago(w) {
  const { s, pre, last, t } = parts(w);
  if (w.pos !== 'v') return `${s}다고`;
  if (!t) return `${pre}${setT(last, 4)}다고`;
  if (t === T_L && w.irr !== 'd') return `${pre}${setT(last, 4)}다고`;
  return `${s}는다고`;
}

/** Все формы слова (часть - только для глаголов действия). */
export function koForms(w) {
  const { s } = parts(w);
  const y = yo(w);
  const f = {
    yo: y, past: pastOf(y), formal: formal(w), aseo: `${y.slice(0, -1)}서`, jiman: `${s}지만`,
    fut: `${eu(w, 'ㄹ')} 거예요`, myeon: eu(w, '면'), nikka: eu(w, '니까'), dago: dago(w),
    deorado: `${s}더라도`, euro: eu(w, '므로'), surok: `${eu(w, 'ㄹ')}수록`,
  };
  if (w.pos === 'v') {
    Object.assign(f, {
      want: `${s}고 싶어요`, prog: `${s}고 있어요`, hon: eu(w, '세요'), can: `${eu(w, 'ㄹ')} 수 있어요`,
      jago: `${s}자고`, rago: eu(w, '라고'), ryeogo: eu(w, '려고'), jamaja: `${s}자마자`,
    });
  }
  return f;
}

/** Типичные ошибки: правило не того типа, лишний или пропущенный 으, не та гармония гласных. */
export function koWrong(w, key) {
  const { s, pre, last, l, v, t } = parts(w);
  const reg = { ...w, irr: '' };
  const euWrong = (suf) => {
    const out = [];
    const add = (base) => out.push(suf === 'ㄹ' ? `${base}을` : `${base}으${suf}`);
    if (w.irr) out.push(eu(reg, suf));
    if (!t && !w.irr) add(s);
    else if (t === T_L && !w.irr) {
      add(s);
      if (!KEEP_L.has(suf) && suf !== 'ㄹ') out.push(`${s}${suf}`);
    } else if (t && !w.irr) out.push(suf === 'ㄹ' ? `${pre}${setT(last, T_L)}` : `${s}${suf}`);
    if (w.irr === 'd' || w.irr === 's') out.push(suf === 'ㄹ' ? `${pre}${enc(l, v, T_L)}` : `${pre}${enc(l, v, w.irr === 'd' ? T_L : 0)}${suf}`);
    if (w.irr === 'r') out.push(suf === 'ㄹ' ? `${s}을` : `${s}으${suf}`);
    return out;
  };
  const yoWrong = () => {
    const out = [];
    if (s.endsWith('하')) return [`${pre}하아요`, `${pre}하어요`, `${pre}해어요`];
    if (w.irr) out.push(yo(reg), `${s}${bright(v) ? '어요' : '아요'}`);
    if (w.irr === 'r') out.push(`${s}어요`, `${pre}${bright(dec(pre.at(-1)).v) ? '러요' : '라요'}`);
    if (w.irr === 'b') out.push(`${pre}${enc(l, v)}${s === '돕' || s === '곱' ? '워요' : '와요'}`);
    if (t && !w.irr) out.push(`${s}${bright(v) ? '어요' : '아요'}`, `${s}요`);
    if (!t && !w.irr) {
      if (v === 18) out.push(`${s}어요`, `${s}아요`, `${pre}${enc(l, pre && bright(dec(pre.at(-1)).v) ? 4 : 0)}요`);
      else if ([0, 1, 4, 5, 6].includes(v)) out.push(`${s}아요`, `${s}어요`);
      else if (v === 8) out.push(`${s}어요`, `${pre}${enc(l, 14)}요`);
      else if (v === 13) out.push(`${s}아요`, `${pre}${enc(l, 9)}요`);
      else if (v === 20) out.push(`${s}아요`, `${pre}${enc(l, 2)}요`);
      else out.push(`${s}아요`, `${pre}${enc(l, 9)}요`);
    }
    return out;
  };
  switch (key) {
    case 'yo': return yoWrong();
    case 'past': return yoWrong().map(pastOf);
    case 'aseo': return yoWrong().map((y) => `${y.slice(0, -1)}서`);
    case 'formal': return !t ? [`${s}습니다`, `${s}니다`] : t === T_L && w.irr !== 'd' ? [`${s}습니다`, `${pre}${enc(l, v)}습니다`] : [`${s}니다`, `${s}으니다`];
    case 'fut': return euWrong('ㄹ').map((x) => `${x} 거예요`);
    case 'can': return euWrong('ㄹ').map((x) => `${x} 수 있어요`);
    case 'surok': return euWrong('ㄹ').map((x) => `${x}수록`);
    case 'myeon': case 'nikka': case 'hon': case 'rago': case 'ryeogo': case 'euro':
      return euWrong({ myeon: '면', nikka: '니까', hon: '세요', rago: '라고', ryeogo: '려고', euro: '므로' }[key]);
    case 'dago':
      return w.pos === 'v' ? [`${s}다고`, t ? `${s}은다고` : `${s}는다고`] : [`${s}는다고`, `${pre}${setT(last, 4)}다고`];
    case 'jago': return [`${s}으자고`, `${s}자요고`];
    case 'want': return [`${s}고 싶다요`, `${s}기 싶어요`, `${s}고 싶아요`];
    case 'prog': return [`${s}고 있아요`, `${s}기 있어요`, `${s}고 잇어요`];
    case 'jiman': return [`${s}지민`, `${s}자만`];
    case 'deorado': return [`${s}더러도`, `${s}드라도`];
    case 'jamaja': return [`${s}자마저`, `${s}자말자`];
    default: return [];
  }
}

const R = (en, ru, kk) => L(en, ru, kk);
/** Названия форм и правила для условия и разбора. */
export const KO_FORMS = {
  yo: [R('polite present -아요/어요', 'вежливое настоящее -아요/어요', '-아요/어요 сыпайы осы шақ'), R('Stems with ㅏ or ㅗ take -아요, others -어요; 하다 → 해요. Vowels merge: 가 + 아요 = 가요, 오 + 아요 = 와요, 마시 + 어요 = 마셔요.', 'Основы с ㅏ или ㅗ берут -아요, остальные -어요; 하다 → 해요. Гласные сливаются: 가 + 아요 = 가요, 오 + 아요 = 와요, 마시 + 어요 = 마셔요.', 'ㅏ не ㅗ дауыстысы бар түбірлер -아요, қалғандары -어요 алады; 하다 → 해요. Дауыстылар бірігеді: 가 + 아요 = 가요, 오 + 아요 = 와요, 마시 + 어요 = 마셔요.')],
  past: [R('polite past -았어요/었어요', 'вежливое прошедшее -았어요/었어요', '-았어요/었어요 сыпайы өткен шақ'), R('Take the -아요/어요 form and add ㅆ before 어요: 가요 → 갔어요, 먹어요 → 먹었어요, 해요 → 했어요.', 'Берём форму на -아요/어요 и добавляем ㅆ перед 어요: 가요 → 갔어요, 먹어요 → 먹었어요, 해요 → 했어요.', '-아요/어요 формасын алып, 어요 алдына ㅆ қосамыз: 가요 → 갔어요, 먹어요 → 먹었어요, 해요 → 했어요.')],
  formal: [R('formal polite -(스)ㅂ니다', 'официально-вежливую форму -(스)ㅂ니다', '-(스)ㅂ니다 ресми сыпайы формасы'), R('After a vowel - ㅂ니다 (갑니다), after a consonant - 습니다 (먹습니다); ㄹ drops: 살다 → 삽니다.', 'После гласной - ㅂ니다 (갑니다), после согласной - 습니다 (먹습니다); ㄹ выпадает: 살다 → 삽니다.', 'Дауыстыдан кейін - ㅂ니다 (갑니다), дауыссыздан кейін - 습니다 (먹습니다); ㄹ түсіп қалады: 살다 → 삽니다.')],
  want: [R('"want to" form -고 싶어요', 'форму желания -고 싶어요', '-고 싶어요 қалау формасы'), R('Stem + 고 싶어요: 가다 → 가고 싶어요 "I want to go".', 'Основа + 고 싶어요: 가다 → 가고 싶어요 «хочу пойти».', 'Түбір + 고 싶어요: 가다 → 가고 싶어요 «барғым келеді».')],
  fut: [R('future -(으)ㄹ 거예요', 'будущее -(으)ㄹ 거예요', '-(으)ㄹ 거예요 келер шақ'), R('After a vowel ㄹ joins the stem (갈 거예요), after a consonant - 을 (먹을 거예요); ㄹ-stems stay (살 거예요).', 'После гласной ㄹ присоединяется к основе (갈 거예요), после согласной - 을 (먹을 거예요); основы на ㄹ не меняются (살 거예요).', 'Дауыстыдан кейін ㄹ түбірге қосылады (갈 거예요), дауыссыздан кейін - 을 (먹을 거예요); ㄹ-ге біткен түбір өзгермейді (살 거예요).')],
  aseo: [R('"because, and then" form -아서/어서', 'форму «потому что, и затем» -아서/어서', '«себебі, содан соң» -아서/어서 формасы'), R('Built like -아요/어요 with 서 instead of 요: 가요 → 가서, 먹어요 → 먹어서.', 'Строится как -아요/어요, только 서 вместо 요: 가요 → 가서, 먹어요 → 먹어서.', '-아요/어요 сияқты жасалады, тек 요 орнына 서: 가요 → 가서, 먹어요 → 먹어서.')],
  jiman: [R('"but" form -지만', 'форму «но, хотя» -지만', '«бірақ» -지만 формасы'), R('Stem + 지만, with no changes: 비싸다 → 비싸지만.', 'Основа + 지만 без изменений: 비싸다 → 비싸지만.', 'Түбір + 지만, өзгеріссіз: 비싸다 → 비싸지만.')],
  hon: [R('honorific request -(으)세요', 'почтительную форму -(으)세요', '-(으)세요 құрмет формасы'), R('After a vowel - 세요 (가세요), after a consonant - 으세요 (읽으세요); ㄹ drops before ㅅ: 살다 → 사세요.', 'После гласной - 세요 (가세요), после согласной - 으세요 (읽으세요); ㄹ выпадает перед ㅅ: 살다 → 사세요.', 'Дауыстыдан кейін - 세요 (가세요), дауыссыздан кейін - 으세요 (읽으세요); ㅅ алдында ㄹ түседі: 살다 → 사세요.')],
  prog: [R('progressive -고 있어요', 'длительную форму -고 있어요', '-고 있어요 созылыңқы формасы'), R('Stem + 고 있어요 - an action in progress: 먹고 있어요 "I am eating".', 'Основа + 고 있어요 - действие сейчас: 먹고 있어요 «ем (сейчас)».', 'Түбір + 고 있어요 - қазір болып жатқан әрекет: 먹고 있어요 «жеп отырмын».')],
  myeon: [R('"if" form -(으)면', 'условную форму -(으)면', '«егер» -(으)면 формасы'), R('After a vowel or ㄹ - 면 (가면, 살면), after other consonants - 으면 (먹으면).', 'После гласной или ㄹ - 면 (가면, 살면), после других согласных - 으면 (먹으면).', 'Дауыстыдан немесе ㄹ-ден кейін - 면 (가면, 살면), басқа дауыссыздан кейін - 으면 (먹으면).')],
  nikka: [R('"because" form -(으)니까', 'форму «так как» -(으)니까', '«себебі» -(으)니까 формасы'), R('After a vowel - 니까 (가니까), after a consonant - 으니까 (먹으니까); ㄹ drops before ㄴ: 살다 → 사니까.', 'После гласной - 니까 (가니까), после согласной - 으니까 (먹으니까); ㄹ выпадает перед ㄴ: 살다 → 사니까.', 'Дауыстыдан кейін - 니까 (가니까), дауыссыздан кейін - 으니까 (먹으니까); ㄴ алдында ㄹ түседі: 살다 → 사니까.')],
  can: [R('"can" form -(으)ㄹ 수 있어요', 'форму «могу» -(으)ㄹ 수 있어요', '«істей аламын» -(으)ㄹ 수 있어요 формасы'), R('-(으)ㄹ + 수 있어요: 갈 수 있어요, 먹을 수 있어요, 만들 수 있어요.', '-(으)ㄹ + 수 있어요: 갈 수 있어요, 먹을 수 있어요, 만들 수 있어요.', '-(으)ㄹ + 수 있어요: 갈 수 있어요, 먹을 수 있어요, 만들 수 있어요.')],
  dago: [R('reported statement -다고 ("says that")', 'косвенную речь -다고 («говорит, что»)', '-다고 төлеу сөз («… дейді»)'), R('Action verbs: 가다 → 간다고, 먹다 → 먹는다고, 살다 → 산다고; adjectives: 예쁘다 → 예쁘다고.', 'Глаголы действия: 가다 → 간다고, 먹다 → 먹는다고, 살다 → 산다고; прилагательные: 예쁘다 → 예쁘다고.', 'Қимыл етістіктері: 가다 → 간다고, 먹다 → 먹는다고, 살다 → 산다고; сын есімдер: 예쁘다 → 예쁘다고.')],
  jago: [R('reported suggestion -자고 ("let\'s")', 'косвенное предложение -자고 («давай»)', '-자고 төлеу ұсыныс («…йық дейді»)'), R('Stem + 자고 for any verb: 가자고, 먹자고.', 'Основа + 자고 у любого глагола: 가자고, 먹자고.', 'Кез келген етістік: түбір + 자고: 가자고, 먹자고.')],
  rago: [R('reported command -(으)라고', 'косвенный приказ -(으)라고', '-(으)라고 төлеу бұйрық'), R('After a vowel or ㄹ - 라고 (가라고, 살라고), after a consonant - 으라고 (먹으라고).', 'После гласной или ㄹ - 라고 (가라고, 살라고), после согласной - 으라고 (먹으라고).', 'Дауыстыдан немесе ㄹ-ден кейін - 라고 (가라고, 살라고), дауыссыздан кейін - 으라고 (먹으라고).')],
  ryeogo: [R('"in order to" form -(으)려고', 'форму цели -(으)려고', '«… үшін» -(으)려고 формасы'), R('After a vowel or ㄹ - 려고 (가려고, 만들려고), after a consonant - 으려고 (먹으려고).', 'После гласной или ㄹ - 려고 (가려고, 만들려고), после согласной - 으려고 (먹으려고).', 'Дауыстыдан немесе ㄹ-ден кейін - 려고 (가려고, 만들려고), дауыссыздан кейін - 으려고 (먹으려고).')],
  jamaja: [R('"as soon as" form -자마자', 'форму «как только» -자마자', '«… бойда» -자마자 формасы'), R('Stem + 자마자: 도착하자마자 "as soon as I arrived".', 'Основа + 자마자: 도착하자마자 «как только приехал».', 'Түбір + 자마자: 도착하자마자 «келген бойда».')],
  deorado: [R('"even if" form -더라도', 'форму «даже если» -더라도', '«тіпті … болса да» -더라도 формасы'), R('Stem + 더라도 with no changes: 바쁘더라도 "even if busy".', 'Основа + 더라도 без изменений: 바쁘더라도 «даже если занят».', 'Түбір + 더라도, өзгеріссіз: 바쁘더라도 «бос болмаса да».')],
  euro: [R('formal "because" -(으)므로', 'книжную форму «так как» -(으)므로', '«себебі» -(으)므로 кітаби формасы'), R('After a vowel or ㄹ - 므로 (가므로, 살므로), after a consonant - 으므로 (먹으므로).', 'После гласной или ㄹ - 므로 (가므로, 살므로), после согласной - 으므로 (먹으므로).', 'Дауыстыдан немесе ㄹ-ден кейін - 므로 (가므로, 살므로), дауыссыздан кейін - 으므로 (먹으므로).')],
  surok: [R('"the more … the more" form -(으)ㄹ수록', 'форму «чем больше, тем …» -(으)ㄹ수록', '«неғұрлым … соғұрлым» -(으)ㄹ수록 формасы'), R('-(으)ㄹ + 수록: 갈수록, 먹을수록, 만들수록.', '-(으)ㄹ + 수록: 갈수록, 먹을수록, 만들수록.', '-(으)ㄹ + 수록: 갈수록, 먹을수록, 만들수록.')],
};

/** Пояснение к неправильному спряжению. */
export const IRR_NOTE = {
  b: R('ㅂ-irregular: ㅂ turns into 우 before a vowel (춥다 → 추워요, 추울 거예요).', 'Неправильный ㅂ: перед гласной ㅂ превращается в 우 (춥다 → 추워요, 추울 거예요).', 'ㅂ бұрыс етістігі: дауысты алдында ㅂ 우-ға айналады (춥다 → 추워요, 추울 거예요).'),
  d: R('ㄷ-irregular: ㄷ turns into ㄹ before a vowel (듣다 → 들어요, 들을 거예요).', 'Неправильный ㄷ: перед гласной ㄷ превращается в ㄹ (듣다 → 들어요, 들을 거예요).', 'ㄷ бұрыс етістігі: дауысты алдында ㄷ ㄹ-ге айналады (듣다 → 들어요, 들을 거예요).'),
  s: R('ㅅ-irregular: ㅅ drops before a vowel, but the vowels do not merge (낫다 → 나아요).', 'Неправильный ㅅ: перед гласной ㅅ выпадает, но гласные не сливаются (낫다 → 나아요).', 'ㅅ бұрыс етістігі: дауысты алдында ㅅ түседі, бірақ дауыстылар бірікпейді (낫다 → 나아요).'),
  r: R('르-irregular: before -아/어 the 르 becomes ㄹ + 라/러 (모르다 → 몰라요).', 'Неправильный 르: перед -아/어 르 превращается в ㄹ + 라/러 (모르다 → 몰라요).', '르 бұрыс етістігі: -아/어 алдында 르 ㄹ + 라/러 болады (모르다 → 몰라요).'),
  h: R('ㅎ-irregular: ㅎ drops (그렇다 → 그래요).', 'Неправильный ㅎ: ㅎ выпадает (그렇다 → 그래요).', 'ㅎ бұрыс етістігі: ㅎ түседі (그렇다 → 그래요).'),
};

/** Формы по уровням банка TOPIK 1-6 и уровни слов, из которых берутся глаголы. */
export const KO_FORMS_BY_LEVEL = {
  1: { forms: ['yo', 'past', 'formal', 'want'], words: [1] },
  2: { forms: ['fut', 'aseo', 'jiman', 'hon', 'prog', 'past'], words: [1, 2] },
  3: { forms: ['myeon', 'nikka', 'can', 'fut', 'aseo'], words: [2, 3] },
  4: { forms: ['dago', 'jago', 'rago', 'myeon'], words: [3, 4] },
  5: { forms: ['ryeogo', 'jamaja', 'deorado', 'dago'], words: [3, 4, 5] },
  6: { forms: ['euro', 'surok', 'rago', 'dago'], words: [4, 5, 6] },
};
/** Какие формы не спрашиваем: у 먹다, 자다, 있다 почтительная форма особая (드세요, 주무세요, 계세요), у глаголов без воли нет «хочу», «давай» и т. п. */
const NONVOL = ['모르다', '끝나다', '늘다', '줄다', '변하다', '닮다', '낫다', '비롯되다', '잃어버리다', '잃다'];
export const KO_SKIP = {
  hon: new Set(['먹다', '자다', '있다', '맛있다', '재미있다', ...NONVOL]),
  want: new Set(NONVOL), jago: new Set(NONVOL), rago: new Set(NONVOL), ryeogo: new Set(NONVOL), can: new Set(NONVOL), prog: new Set(['모르다', '알다', '닮다']),
};

/** Разбор хангыля для тестов. */
export const _hangul = { dec, enc };
