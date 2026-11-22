// Японская азбука: хирагана и катакана с латиницей (система Хэпбёрна).
// ぢ и づ не берём: они читаются так же, как じ и ず, и вопрос «какой знак - ji» имел бы два ответа.

const BASE = 'あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso たta ちchi つtsu てte とto なna にni ぬnu ねne のno はha ひhi ふfu へhe ほho まma みmi むmu めme もmo やya ゆyu よyo らra りri るru れre ろro わwa をwo んn';
const VOICED = 'がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo だda でde どdo ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu ぺpe ぽpo';
const COMBO = 'きゃkya きゅkyu きょkyo しゃsha しゅshu しょsho ちゃcha ちゅchu ちょcho にゃnya にゅnyu にょnyo ひゃhya ひゅhyu ひょhyo みゃmya みゅmyu みょmyo りゃrya りゅryu りょryo ぎゃgya ぎゅgyu ぎょgyo じゃja じゅju じょjo びゃbya びゅbyu びょbyo ぴゃpya ぴゅpyu ぴょpyo';

const parse = (s, kind) => s.split(' ').map((x) => {
  const m = x.match(/^([^a-z]+)([a-z]+)$/);
  return { h: m[1], r: m[2], kind };
});

/** Хирагана → катакана (сдвиг по таблице Юникода). */
export const toKata = (s) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
/** Катакана → хирагана. */
export const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/** Все знаки: { h - хирагана, k - катакана, r - латиница, kind - основной / со звонкостью / слог с ゃゅょ }. */
export const KANA = [...parse(BASE, 'base'), ...parse(VOICED, 'voiced'), ...parse(COMBO, 'combo')].map((x, i) => ({ ...x, k: toKata(x.h), i }));

const ROMAJI = new Map([...KANA.map((x) => [x.h, x.r]), ['ぢ', 'ji'], ['づ', 'zu'], ['ぁ', 'a'], ['ぃ', 'i'], ['ぅ', 'u'], ['ぇ', 'e'], ['ぉ', 'o']]);

/**
 * Слово каной → латиница: っ удваивает согласный (がっこう → gakkou), ー повторяет гласный
 * (コーヒー → koohii), ん перед гласным пишется n' (きんえん → kin'en).
 */
export function romaji(word) {
  const s = toHira(word);
  let out = '';
  let tie = false;
  let afterN = false;
  for (let i = 0; i < s.length; i++) {
    let r;
    if (/[ゃゅょ]/.test(s[i + 1] ?? '') && ROMAJI.has(s.slice(i, i + 2))) {
      r = ROMAJI.get(s.slice(i, i + 2));
      i++;
    } else if (s[i] === 'っ') {
      tie = true;
      continue;
    } else if (s[i] === 'ー') r = out.slice(-1);
    else r = ROMAJI.get(s[i]);
    if (r === undefined) throw new Error(`Нет латиницы для ${s[i]} в ${word}`);
    if (afterN && /^[aiueoy]/.test(r)) out += "'";
    if (tie) out += r.startsWith('ch') ? 't' : r[0];
    tie = false;
    afterN = s[i] === 'ん';
    out += r;
  }
  return out;
}

// Слова, которые пишутся катаканой (заимствования): катакана|английский|русский|казахский.
export const LOANWORDS = `
コーヒー|coffee|кофе|кофе
テレビ|TV|телевизор|теледидар
カメラ|camera|фотоаппарат|фотоаппарат
ホテル|hotel|гостиница|қонақ үй
レストラン|restaurant|ресторан|мейрамхана
タクシー|taxi|такси|такси
バス|bus|автобус|автобус
トイレ|toilet|туалет|дәретхана
シャツ|shirt|рубашка|жейде
ズボン|trousers|брюки|шалбар
スカート|skirt|юбка|юбка
ノート|notebook|тетрадь|дәптер
ペン|pen|ручка|қалам
ナイフ|knife|нож|пышақ
フォーク|fork|вилка|шанышқы
スプーン|spoon|ложка|қасық
コップ|glass (cup)|стакан|стақан
ジュース|juice|сок|шырын
ケーキ|cake|торт|торт
チーズ|cheese|сыр|ірімшік
バナナ|banana|банан|банан
トマト|tomato|помидор|қызанақ
サッカー|football|футбол|футбол
テニス|tennis|теннис|теннис
ピアノ|piano|пианино|фортепиано
ギター|guitar|гитара|гитара
ニュース|news|новости|жаңалықтар
メール|e-mail|электронное письмо|электрондық хат
インターネット|internet|интернет|интернет
エレベーター|lift|лифт|лифт
アパート|flat|квартира|пәтер
デパート|department store|универмаг|әмбебап дүкен
スーパー|supermarket|супермаркет|супермаркет
プール|swimming pool|бассейн|бассейн
パーティー|party|вечеринка|кеш
プレゼント|present|подарок|сыйлық
アイスクリーム|ice cream|мороженое|балмұздақ
チョコレート|chocolate|шоколад|шоколад
ラジオ|radio|радио|радио
ゲーム|game|игра|ойын
テスト|test|тест|тест
ドイツ|Germany|Германия|Германия
フランス|France|Франция|Франция
アメリカ|America|Америка|Америка
ロシア|Russia|Россия|Ресей
カザフスタン|Kazakhstan|Казахстан|Қазақстан
`.trim().split('\n').map((line, i) => {
  const [kana, en, ru, kk] = line.split('|');
  return { i, kana, en, ru, kk, level: 1, pos: 'n' };
});
