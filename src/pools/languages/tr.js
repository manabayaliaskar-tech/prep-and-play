// Турецкий: грамматика по уровням A1-C2 (1…6). Запись как в romance.js:
// [уровень, предложение с пропуском, правильный вариант, [три неправильных], разбор на трёх языках].
// Формы строятся по правилам из tr-morph.js (гармония гласных, d/t, k/ğ), поэтому вариант ровно один.
// Турецкий и казахский - родственные тюркские языки: где правило совпадает, разбор говорит об этом.

import { T } from '../bank.js';
import { h2, h4, lastVowel, noun, part, verb } from './tr-morph.js';
import { PRON, PRON_EN, PRON_KK, PRON_RU, TR_VERBS } from './tr-verbs.js';

const row = (level, q, ok, wrong, ru, kk, en) => [level, q, ok, wrong, T(ru, kk, en)];
function three(ok, list) {
  const out = [];
  for (const x of list) if (x !== ok && !out.includes(x) && out.length < 3) out.push(x);
  if (out.length < 3) throw new Error(`tr: мало вариантов для ${ok}`);
  return out;
}
const vb = (s) => TR_VERBS.find((v) => v.s === s) ?? { s, aor: /[aeıioöuü]$/.test(s) ? `${s}r` : `${s}${h4(s)}r` };

// ---------- Вопросительная частица mi / mı / mu / mü (A1) ----------
const Q4 = ['mi', 'mı', 'mu', 'mü'];
const qWord = (w, rest = '') => `m${h4(w)}${rest}`;
function questionRows() {
  const out = [];
  const pairs = [['kitap', 'yeni'], ['kitap', 'ilginç'], ['ev', 'büyük'], ['ev', 'eski'], ['oda', 'küçük'], ['oda', 'temiz'], ['çay', 'sıcak'], ['çay', 'soğuk'], ['araba', 'pahalı'], ['araba', 'yeni'], ['film', 'uzun'], ['film', 'güzel'], ['ders', 'kolay'], ['ders', 'zor'], ['cevap', 'doğru'], ['soru', 'kolay'], ['yol', 'uzun'], ['yol', 'kısa'], ['çanta', 'boş'], ['çanta', 'dolu'], ['şehir', 'güzel'], ['şehir', 'büyük'], ['otel', 'ucuz'], ['otel', 'temiz'], ['sınav', 'zor'], ['kahve', 'sıcak'], ['su', 'soğuk'], ['bilet', 'pahalı']];
  for (const [n, a] of pairs) {
    const ok = qWord(a);
    out.push(row(1, `Bu ${n} ${a} ______?`, ok, Q4.filter((x) => x !== ok),
      `Вопросительная частица пишется отдельно и следует гармонии гласных: последняя гласная слова «${a}» - «${lastVowel(a)}», поэтому ${ok}.`,
      `Сұраулық шылау бөлек жазылып, үндестік заңына бағынады: «${a}» сөзінің соңғы дауыстысы - «${lastVowel(a)}», сондықтан ${ok} (қазақшадағы ма/ме, ба/бе сияқты).`,
      `The question particle is written separately and follows vowel harmony: the last vowel of "${a}" is "${lastVowel(a)}", so ${ok}.`));
  }
  // С личным окончанием: misin, mıyım, musunuz...
  const people = ['yorgun', 'mutlu', 'üzgün', 'hasta', 'iyi', 'evli', 'aç', 'hazır', 'öğrenci', 'doktor', 'Türk', 'kızgın', 'memnun', 'yalnız', 'sakin'];
  const end = [(x) => `y${x}m`, (x) => `s${x}n`, null, (x) => `y${x}z`, (x) => `s${x}n${x}z`];
  people.forEach((a, i) => {
    for (const p of [[0, 1, 3, 4][i % 4], [0, 1, 3, 4][(i + 2) % 4]]) {
      const make = (x) => `m${x}${end[p](x)}`;
      const ok = make(h4(a));
      out.push(row(1, `${PRON[p]} ${a} ______?`, ok, ['i', 'ı', 'u', 'ü'].map(make).filter((x) => x !== ok),
        `Для ${PRON_RU[p]} частица получает личное окончание: m- + гласная по гармонии слова «${a}» + окончание. Ответ: ${PRON[p]} ${a} ${ok}?`,
        `${PRON_KK[p]} үшін шылау жіктік жалғау алады: m- + «${a}» сөзінің үндестігі бойынша дауысты + жалғау. Жауабы: ${PRON[p]} ${a} ${ok}?`,
        `For ${PRON_EN[p]} the particle takes a personal ending: m- + a vowel matching "${a}" + the ending. Answer: ${PRON[p]} ${a} ${ok}?`));
    }
  });
  return out;
}

// ---------- Падежи: -e (куда), -de (где), -den (откуда), -i (кого/что) ----------
const CASE_NAME = {
  dat: ['дательный падеж -e/-a (куда?)', 'барыс септік -e/-a (қайда?) - қазақшадағы -ға/-ге', 'dative -e/-a (where to?)'],
  loc: ['местный падеж -de/-da (где?)', 'жатыс септік -de/-da (қайда?) - қазақшадағы -да/-де', 'locative -de/-da (where?)'],
  abl: ['исходный падеж -den/-dan (откуда? от чего?)', 'шығыс септік -den/-dan (қайдан?) - қазақшадағы -дан/-ден', 'ablative -den/-dan (from where?)'],
  acc: ['винительный падеж -i/-ı/-u/-ü (определённый объект)', 'табыс септік -i/-ı/-u/-ü (белгілі нысан) - қазақшадағы -ны/-ні', 'accusative -i/-ı/-u/-ü (a definite object)'],
};
const NOTE = (n, c) => {
  const notes = [];
  if ((c === 'loc' || c === 'abl') && 'fstkçşhp'.includes(n.w.at(-1))) notes.push(['после глухой согласной d → t', 'қатаң дауыссыздан кейін d → t', 'after a voiceless consonant d becomes t']);
  if ((c === 'dat' || c === 'acc') && n.v && n.v.length < n.w.length) notes.push([`гласная перед последней согласной выпадает: ${n.w} → ${n.v}-`, `соңғы дауыссыздың алдындағы дауысты түсіп қалады: ${n.w} → ${n.v}-`, `the vowel before the last consonant drops: ${n.w} → ${n.v}-`]);
  else if ((c === 'dat' || c === 'acc') && n.v) notes.push([`перед гласной ${n.w.at(-1)} → ${n.v.at(-1)}`, `дауыстының алдында ${n.w.at(-1)} → ${n.v.at(-1)}`, `before a vowel ${n.w.at(-1)} becomes ${n.v.at(-1)}`]);
  if ((c === 'dat' || c === 'acc') && /[aeıioöuü]$/.test(n.w)) notes.push(['после гласной вставляется y', 'дауыстыдан кейін y қосылады', 'after a vowel a buffer y is added']);
  if (n.proper) notes.push(['у имён собственных окончание отделяется апострофом', 'жалқы есімде жалғау апострофпен бөлінеді', 'with proper names the ending is separated by an apostrophe']);
  return [0, 1, 2].map((k) => (notes.length ? ` (${notes.map((x) => x[k]).join('; ')})` : ''));
};
function caseRow(level, q, n, c) {
  const forms = { dat: noun.dat(n), loc: noun.loc(n), abl: noun.abl(n), acc: noun.acc(n) };
  const ok = forms[c];
  const note = NOTE(n, c);
  const name = CASE_NAME[c];
  return row(level, q, ok, three(ok, Object.values(forms)),
    `Здесь нужен ${name[0]}. Последняя гласная «${lastVowel(n.w)}»: ${ok}${note[0]}.`,
    `Мұнда ${name[1]} керек. Соңғы дауысты «${lastVowel(n.w)}»: ${ok}${note[1]}.`,
    `This needs the ${name[2]}. The last vowel is "${lastVowel(n.w)}": ${ok}${note[2]}.`);
}
const CITIES = ['Ankara', 'İstanbul', 'İzmir', 'Antalya', 'Bursa', 'Konya', 'Berlin', 'Paris', 'Londra', 'Roma', 'Almatı', 'Astana', 'Bakü', 'Taşkent', 'Moskova', 'Tokyo'].map((w) => ({ w, proper: true }));
const PLACES = [{ w: 'okul' }, { w: 'ev' }, { w: 'park' }, { w: 'market' }, { w: 'sinema' }, { w: 'hastane' }, { w: 'kütüphane' }, { w: 'müze' }, { w: 'banka' }, { w: 'ofis' }, { w: 'otel' }, { w: 'istasyon' }, { w: 'bahçe' }, { w: 'oda' }, { w: 'mutfak', v: 'mutfağ' }, { w: 'sokak', v: 'sokağ' }, { w: 'köy' }, { w: 'plaj' }];
const THINGS = [{ w: 'kitap', v: 'kitab' }, { w: 'araba' }, { w: 'film' }, { w: 'şarkı' }, { w: 'çanta' }, { w: 'kalem' }, { w: 'ağaç', v: 'ağac' }, { w: 'köpek', v: 'köpeğ' }, { w: 'renk', v: 'reng' }, { w: 'çiçek', v: 'çiçeğ' }, { w: 'elbise' }, { w: 'telefon' }, { w: 'bilgisayar' }, { w: 'şehir', v: 'şehr' }, { w: 'resim', v: 'resm' }, { w: 'oyun' }];
const FEARS = [{ w: 'köpek', v: 'köpeğ' }, { w: 'yılan' }, { w: 'karanlık', v: 'karanlığ' }, { w: 'arı' }, { w: 'fare' }, { w: 'ayı' }, { w: 'deniz' }, { w: 'sınav' }, { w: 'kedi' }, { w: 'örümcek', v: 'örümceğ' }];
const AFTER = [{ w: 'okul' }, { w: 'iş' }, { w: 'ders' }, { w: 'kurs' }, { w: 'sınav' }, { w: 'yemek', v: 'yemeğ' }, { w: 'kahvaltı' }, { w: 'toplantı' }, { w: 'film' }, { w: 'maç' }];

function caseRows() {
  const out = [];
  PLACES.forEach((n, i) => {
    out.push(caseRow(1, `${['Her sabah', 'Yarın', 'Bugün', 'Şimdi'][i % 4]} ______ gidiyorum. (${n.w})`, n, 'dat'));
    out.push(caseRow(1, `Annem şu anda ______. (${n.w})`, n, 'loc'));
  });
  CITIES.forEach((n, i) => {
    out.push(caseRow(1, `Gelecek ay ______ gidiyoruz. (${n.w})`, n, 'dat'));
    out.push(caseRow(1, `Kardeşim ______ yaşıyor. (${n.w})`, n, 'loc'));
    out.push(caseRow(2, `Ali dün ______ ayrıldı. (${n.w})`, n, 'abl'));
    if (i % 2) out.push(caseRow(2, `Ben ______ çok seviyorum. (${n.w})`, n, 'acc'));
  });
  FEARS.forEach((n) => out.push(caseRow(2, `Küçük kardeşim ______ korkuyor. (${n.w})`, n, 'abl')));
  AFTER.forEach((n, i) => out.push(caseRow(2, `${['Her gün', 'Bugün', 'Dün'][i % 3]} ______ sonra eve ${i % 3 === 2 ? 'gittim' : 'gidiyorum'}. (${n.w})`, n, 'abl')));
  THINGS.forEach((n, i) => out.push(caseRow(2, `${['Ben bu', 'Dün o', 'Sen bu'][i % 3]} ______ ${['çok seviyorum', 'gördüm', 'beğendin mi'][i % 3]}${i % 3 === 2 ? '?' : '.'} (${n.w})`, n, 'acc')));
  return out;
}

// ---------- Число после числительных: iki kitap, а не iki kitaplar (A1) ----------
function countRows() {
  const out = [];
  const list = [{ w: 'kitap', v: 'kitab', en: 'book' }, { w: 'elma', en: 'apple' }, { w: 'öğrenci', en: 'pupil' }, { w: 'kedi', en: 'cat' }, { w: 'kalem', en: 'pen' }, { w: 'araba', en: 'car' }, { w: 'çocuk', v: 'çocuğ', en: 'child' }, { w: 'ağaç', v: 'ağac', en: 'tree' }, { w: 'oda', en: 'room' }, { w: 'masa', en: 'table' }, { w: 'sandalye', en: 'chair' }, { w: 'kuş', en: 'bird' }];
  const frames = ['Masada iki ______ var.', 'Bahçede birkaç ______ var.', 'Kaç ______ var?', 'Sınıfta yirmi ______ var.', 'Evde üç ______ var.', 'Burada çok ______ var.'];
  list.forEach((n, i) => {
    for (const f of [frames[i % 6], frames[(i + 3) % 6]]) {
      out.push(row(1, `${f} (${n.w})`, n.w, [noun.pl(n), `${noun.pl(n)}${h4(noun.pl(n))}`, noun.loc(n)],
        `После числительных и слов kaç, birkaç, çok существительное стоит в единственном числе: ${f.replace('______', n.w)}`,
        `Сан есімдерден және kaç, birkaç, çok сөздерінен кейін зат есім жекеше түрде тұрады (қазақшадағы «екі кітап» сияқты): ${f.replace('______', n.w)}`,
        `After numbers and kaç, birkaç, çok the noun stays singular: ${f.replace('______', n.w)}`));
    }
  });
  return out;
}

// ---------- Притяжательные окончания (A2) ----------
const POSS_PRON = ['Benim', 'Senin', 'Onun', 'Bizim', 'Sizin'];
const POSS_RU = ['мой', 'твой', 'его/её', 'наш', 'ваш'];
const POSS_KK = ['менің', 'сенің', 'оның', 'біздің', 'сіздің'];
const POSS_EN = ['my', 'your', 'his/her', 'our', 'your (plural)'];
function possRows() {
  const out = [];
  const list = [{ w: 'ev' }, { w: 'araba' }, { w: 'oda' }, { w: 'kitap', v: 'kitab' }, { w: 'kalem' }, { w: 'çanta' }, { w: 'ödev' }, { w: 'köpek', v: 'köpeğ' }, { w: 'bilgisayar' }, { w: 'okul' }, { w: 'bahçe' }, { w: 'telefon' }, { w: 'arkadaş' }, { w: 'öğretmen' }];
  const preds = ['çok güzel', 'yeni', 'burada', 'çok büyük'];
  list.forEach((n, i) => {
    for (const p of [i % 5, (i + 2) % 5]) {
      const ok = noun.poss(n, p);
      const pred = preds[(i + p) % preds.length];
      out.push(row(2, `${POSS_PRON[p]} ______ ${pred}. (${n.w})`, ok, three(ok, [0, 1, 2, 3, 4].filter((k) => k !== p).map((k) => noun.poss(n, k))),
        `${POSS_PRON[p]} («${POSS_RU[p]}») требует своего притяжательного окончания; гласная - по гармонии слова «${n.w}»${n.v ? `, перед гласной ${n.w.at(-1)} → ${n.v.at(-1)}` : ''}: ${ok}.`,
        `${POSS_PRON[p]} (${POSS_KK[p]}) тәуелдік жалғауды талап етеді; дауысты «${n.w}» сөзінің үндестігі бойынша${n.v ? `, дауыстының алдында ${n.w.at(-1)} → ${n.v.at(-1)}` : ''}: ${ok} (қазақшадағы үйім, үйің, үйі сияқты).`,
        `${POSS_PRON[p]} (${POSS_EN[p]}) needs the possessive ending; the vowel follows the harmony of "${n.w}"${n.v ? `, and before a vowel ${n.w.at(-1)} becomes ${n.v.at(-1)}` : ''}: ${ok}.`));
    }
  });
  // Родительный + притяжательный: Ali'nin arabası.
  const owners = ["Ali'nin", "Ayşe'nin", 'Öğretmenin', 'Annemin', 'Babamın', 'Kardeşimin'];
  list.slice(0, 12).forEach((n, i) => {
    const ok = noun.poss(n, 2);
    out.push(row(2, `${owners[i % owners.length]} ______ çok güzel. (${n.w})`, ok, [n.w, noun.poss(n, 0), noun.poss(n, 1)],
      `Изафет: владелец в родительном падеже (-in/-nın), а то, чем владеют, получает окончание 3-го лица: ${owners[i % owners.length]} ${ok}.`,
      `Изафет: иесі ілік септікте (-in/-nın), ал тиесілі зат 3-жақтың тәуелдік жалғауын алады: ${owners[i % owners.length]} ${ok} (қазақшадағы «Әлидің көлігі» сияқты).`,
      `Possessive construction: the owner is in the genitive (-in/-nın) and the thing owned takes the 3rd-person ending: ${owners[i % owners.length]} ${ok}.`));
  });
  // Множественное + притяжательное: kitaplarım.
  list.slice(0, 10).forEach((n, i) => {
    const pl = noun.pl(n);
    const ok = `${pl}${h4(pl)}m`;
    const wrongHarm = `${n.w}l${h2(n.w) === 'a' ? 'e' : 'a'}r${h2(n.w) === 'a' ? 'i' : 'ı'}m`;
    out.push(row(2, `Bunlar benim ______. (${n.w})`, ok, [wrongHarm, noun.poss(n, 0), pl],
      `Bunlar («это», мн. ч.) + benim → множественное -lar/-ler (по гармонии) + -ım/-im: ${ok}.`,
      `Bunlar («бұлар») + benim → көпше -lar/-ler (үндестік бойынша) + -ım/-im: ${ok} (қазақшадағы кітаптарым сияқты).`,
      `Bunlar ("these") + benim → plural -lar/-ler (by harmony) + -ım/-im: ${ok}.`));
  });
  return out;
}

// ---------- Сравнение: -den daha (A2) ----------
function comparisonRows() {
  const out = [];
  const pairs = [['Ankara', 'İzmir'], ['Bursa', 'Konya'], ['İstanbul', 'Paris'], ['Almatı', 'Astana'], ['Antalya', 'Roma'], ['Bakü', 'Taşkent'], ['Berlin', 'Londra'], ['Moskova', 'Tokyo']];
  const adj = ['güzel', 'ilginç', 'sıcak', 'büyük', 'eski', 'soğuk', 'pahalı', 'kalabalık'];
  pairs.forEach(([a, b], i) => {
    const n = { w: b, proper: true };
    const ok = noun.abl(n);
    out.push(row(2, `Bence ${a} ______ daha ${adj[i]}. (${b})`, ok, [noun.loc(n), noun.dat(n), noun.acc(n)],
      `Сравнение: то, с чем сравнивают, стоит в исходном падеже -den/-dan + daha: ${a} ${ok} daha ${adj[i]}.`,
      `Салыстыру: салыстырылатын сөз шығыс септікте -den/-dan + daha (қазақшадағы «Алматыдан үлкен» сияқты): ${a} ${ok} daha ${adj[i]}.`,
      `Comparison: the thing compared with is in the ablative -den/-dan + daha: ${a} ${ok} daha ${adj[i]}.`));
  });
  return out;
}

// ---------- Деепричастия перед önce / sonra (B1) ----------
const VP = [['Kahvaltı', 'yap'], ['Ödevimi', 'yap'], ['Eve', 'gel'], ['Yemek', 'ye'], ['Filmi', 'izle'], ['Kitabı', 'oku'], ['Dersi', 'bitir'], ['İşe', 'git'], ['Mektubu', 'yaz'], ['Telefonu', 'kapat'], ['Müzik', 'dinle'], ['Duş', 'al'], ['Ellerimi', 'yıka'], ['Kapıyı', 'aç']];
function converbRows() {
  const out = [];
  VP.forEach(([obj, s], i) => {
    const v = vb(s);
    const forms = [part.meden(v), part.dikten(v), part.ince(v), part.erken(v)];
    const main = ['biraz dinlendim', 'arkadaşımı aradım', 'müzik dinledim', 'dışarı çıktım'][i % 4];
    out.push(row(3, `${obj} ______ önce ${main}. (${s}m${h2(s)}k)`, forms[0], three(forms[0], forms),
      `Перед önce («до того как») нужна форма -meden/-madan: ${obj} ${forms[0]} önce ...`,
      `önce («... бұрын») алдында -meden/-madan түрі керек: ${obj} ${forms[0]} önce ...`,
      `Before önce ("before") we need -meden/-madan: ${obj} ${forms[0]} önce ...`));
    out.push(row(3, `${obj} ______ sonra ${main}. (${s}m${h2(s)}k)`, forms[1], three(forms[1], forms),
      `Перед sonra («после того как») нужна форма -dikten/-dıktan (d → t после глухой): ${obj} ${forms[1]} sonra ...`,
      `sonra («... кейін») алдында -dikten/-dıktan түрі керек (қатаңнан кейін d → t): ${obj} ${forms[1]} sonra ...`,
      `Before sonra ("after") we need -dikten/-dıktan (d → t after a voiceless consonant): ${obj} ${forms[1]} sonra ...`));
  });
  return out;
}

// ---------- Условие с широким временем: gelirsen (B1) ----------
function condRows() {
  const out = [];
  const list = ['gel', 'oku', 'yap', 'git', 'çalış', 'yardım et', 'ara', 'bitir', 'öğren', 'bekle', 'öde', 'kalk', 'gönder', 'dinle'];
  list.forEach((s, i) => {
    const v = vb(s);
    for (const p of [i % 5, (i + 2) % 5]) {
      const ok = verb.condAor(v, p);
      out.push(row(3, `${PRON[p]} yarın ${v.obj} ______, çok iyi olur. (${v.inf})`, ok, three(ok, [0, 1, 2, 3, 4].filter((k) => k !== p).map((k) => verb.condAor(v, k))),
        `Реальное условие «если»: широкое время + -se/-sa + лицо. Для ${PRON_RU[p]}: ${ok}.`,
        `Шынайы шарт «егер»: ауыспалы шақ + -se/-sa + жақ. ${PRON_KK[p]} үшін: ${ok} (қазақшадағы келсең, оқысаң сияқты).`,
        `A real condition ("if"): aorist + -se/-sa + person. For ${PRON_EN[p]}: ${ok}.`));
    }
  });
  return out;
}

// ---------- Причастия (B2) ----------
function participleRows() {
  const out = [];
  const subj = [['Bu kitabı', 'yaz', 'yazar'], ['Kapıyı', 'aç', 'çocuk'], ['Türkçe', 'konuş', 'öğrenci'], ['Burada', 'çalış', 'kadın'], ['Bize', 'yardım et', 'adam'], ['Bahçede', 'oyna', 'çocuklar'], ['Şarkı', 'söyle', 'kız'], ['Yarışmayı', 'kazan', 'takım'], ['Bu evde', 'otur', 'aile'], ['Otobüsü', 'bekle', 'insanlar']];
  for (const [obj, s, n] of subj) {
    const v = vb(s);
    const ok = part.en(v);
    out.push(row(4, `${obj} ______ ${n} çok mutlu. (${v.inf})`, ok, [part.dik(v, 2), part.dik(v, 0), `${part.dik(v, 2).slice(0, -2)}k`],
      `Тот, кто сам делает действие, - причастие на -en/-an: ${obj} ${ok} ${n} («${n}, который ...»).`,
      `Әрекетті өзі істейтін - -en/-an есімшесі: ${obj} ${ok} ${n} (қазақшадағы -ған/-атын есімшесі сияқты).`,
      `The one who does the action takes the participle -en/-an: ${obj} ${ok} ${n} ("the ${n} who ...").`));
  }
  const objs = [['Dün', 'izle', 'film çok güzeldi'], ['Geçen yıl', 'oku', 'kitap çok ilginçti'], ['Dün', 'ye', 'yemek çok lezzetliydi'], ['Geçen hafta', 'gör', 'ev çok büyüktü'], ['Dün', 'dinle', 'şarkı çok güzeldi'], ['Geçen ay', 'al', 'araba çok pahalıydı'], ['Dün', 'yaz', 'mektup çok uzundu']];
  objs.forEach(([when, s, rest], i) => {
    const v = vb(s);
    for (const p of [i % 5, (i + 3) % 5]) {
      const ok = part.dik(v, p);
      out.push(row(4, `${when} ______ ${rest}. (${v.inf} - ${PRON[p].toLocaleLowerCase('tr')})`, ok, three(ok, [0, 1, 2, 3, 4].filter((k) => k !== p).map((k) => part.dik(v, k))),
        `Объект действия - причастие -dik + притяжательное окончание того, кто действует (${PRON_RU[p]}): ${ok}.`,
        `Әрекет нысаны - -dik есімшесі + әрекет етушінің тәуелдік жалғауы (${PRON_KK[p]}): ${ok}.`,
        `The object of the action takes -dik + the possessive ending of the doer (${PRON_EN[p]}): ${ok}.`));
    }
  });
  const fut = [['Yarın', 'oku', 'kitap bu'], ['Gelecek hafta', 'git', 'şehir çok güzel'], ['Akşam', 'izle', 'film komedi'], ['Yarın', 'ziyaret et', 'müze çok büyük']];
  fut.forEach(([when, s, rest], i) => {
    const v = s === 'ziyaret et' ? { s, soft: 'ziyaret ed', inf: 'ziyaret etmek' } : vb(s);
    const p = [0, 3, 1, 4][i];
    const ok = part.ecek(v, p);
    out.push(row(4, `${when} ______ ${rest}. (${v.inf} - ${PRON[p].toLocaleLowerCase('tr')})`, ok, three(ok, [0, 1, 2, 3, 4].filter((k) => k !== p).map((k) => part.ecek(v, k))),
      `Будущее действие с объектом - причастие -ecek/-acak + притяжательное окончание (${PRON_RU[p]}); k → ğ перед гласной: ${ok}.`,
      `Болашақ әрекет нысаны - -ecek/-acak есімшесі + тәуелдік жалғау (${PRON_KK[p]}); дауыстының алдында k → ğ: ${ok}.`,
      `A future action with an object takes -ecek/-acak + the possessive ending (${PRON_EN[p]}); k becomes ğ before a vowel: ${ok}.`));
  });
  return out;
}

// ---------- Пассив (B2) и понудительный залог (C1) ----------
function voiceRows() {
  const out = [];
  const pass = [["Bu ev 1990'da", 'yap'], ['Mektup dün', 'gönder'], ["Bu film 2010'da", 'çek'], ["Bu köprü 1970'te", 'yap'], ['Yeni okul geçen yıl', 'aç'], ['Bütün biletler dün', 'sat'], ['Sınav sonuçları dün', 'açıkla'], ['Toplantı dün', 'iptal et', { s: 'iptal et', soft: 'iptal ed' }], ['Ödevler dün', 'kontrol et', { s: 'kontrol et', soft: 'kontrol ed' }], ['Bu kitap geçen yıl', 'yaz']];
  for (const [subj, s, own] of pass) {
    const v = own ?? vb(s);
    const ps = { s: part.passive(v) };
    const cs = { s: part.caus(v) };
    const ok = verb.past(ps, 2);
    out.push(row(4, `${subj} ______. (${s}m${h2(s)}k)`, ok, [verb.past(v, 2), verb.fut(ps, 2), verb.past(cs, 2)],
      `Подлежащее само действие не совершает - нужен пассив: основа + -il/-ıl (после гласной -n, после l -in) + прошедшее: ${ok}.`,
      `Бастауыш әрекетті өзі жасамайды - ырықсыз етіс керек: түбір + -il/-ıl (дауыстыдан кейін -n, l-ден кейін -in) + өткен шақ: ${ok} (қазақшадағы салынды, жіберілді сияқты).`,
      `The subject does not do the action itself, so we need the passive: stem + -il/-ıl (after a vowel -n, after l -in) + past: ${ok}.`));
  }
  const caus = [['Annem bana odamı', 'temizle'], ['Öğretmen bize kompozisyon', 'yaz'], ['Patron çalışanlara raporu', 'oku'], ['Babam bana arabayı', 'yıka'], ['Öğretmen öğrencilere şiiri', 'ezberle'], ['Annem çocuklara odayı', 'topla'], ['Müdür bize mektubu', 'gönder'], ['Öğretmen öğrencilere kitabı', 'oku'], ['Babam bize bahçeyi', 'sula'], ['Antrenör bize her gün', 'koş']];
  caus.forEach(([subj, s]) => {
    const v = { s, ...(TR_VERBS.find((x) => x.s === s) ?? {}) };
    const cs = { s: part.caus(v) };
    const ok = verb.past(cs, 2);
    const ps = { s: part.passive(v) };
    out.push(row(5, `${subj} ______. (${s}m${h2(s)}k)`, ok, [verb.past(cs, 0), verb.past(ps, 2), verb.past(cs, 3)],
      `Подлежащее заставляет другого (кому - в дательном падеже) сделать действие - понудительный залог: -dir/-tir, после гласной и r/l в многосложных -t: ${ok}.`,
      `Бастауыш басқаны (кімге - барыс септікте) әрекет жасатады - өзгелік етіс: -dir/-tir, дауыстыдан және көп буынды r/l-ден кейін -t: ${ok} (қазақшадағы жаздырды, оқытты сияқты).`,
      `The subject makes someone else (in the dative) do the action - the causative: -dir/-tir, and -t after a vowel or r/l in longer stems: ${ok}.`));
  });
  return out;
}

// ---------- için / rağmen / halde (C1, C2) ----------
function causalRows() {
  const out = [];
  const list = [['çok', 'çalış'], ['erken', 'uyu'], ['çok', 'ye'], ['hızlı', 'koş'], ['çok', 'oku'], ['dikkatle', 'dinle'], ['uzun süre', 'bekle'], ['her gün', 'çalış'], ['iyi', 'anla'], ['çok', 'düşün']];
  list.forEach(([adv, s], i) => {
    const v = vb(s);
    const p = i % 5;
    const forms = [part.dik(v, p), part.mesine(v, p), part.ince(v), part.erek(v)];
    out.push(row(5, `${PRON[p]} ${adv} ______ için herkes şaşırdı. (${v.inf})`, forms[0], three(forms[0], forms),
      `Причина «потому что»: -dik + притяжательное окончание (${PRON_RU[p]}) + için: ${forms[0]} için.`,
      `Себеп «... болғандықтан»: -dik + тәуелдік жалғау (${PRON_KK[p]}) + için: ${forms[0]} için.`,
      `Cause ("because"): -dik + possessive ending (${PRON_EN[p]}) + için: ${forms[0]} için.`));
    out.push(row(5, `${PRON[p]} ${adv} ______ rağmen sonuç kötüydü. (${v.inf})`, forms[1], three(forms[1], forms),
      `Уступка «несмотря на то что»: -me/-ma + притяжательное (${PRON_RU[p]}) + дательный -e/-a + rağmen: ${forms[1]} rağmen.`,
      `Қарсылық «... болғанына қарамастан»: -me/-ma + тәуелдік (${PRON_KK[p]}) + барыс -e/-a + rağmen: ${forms[1]} rağmen.`,
      `Concession ("although"): -me/-ma + possessive (${PRON_EN[p]}) + dative -e/-a + rağmen: ${forms[1]} rağmen.`));
    const q = (i + 2) % 5;
    const hal = part.dik(v, q);
    out.push(row(6, `${PRON[q]} ${adv} ______ halde kimse fark etmedi. (${v.inf})`, hal, three(hal, [hal, part.mesine(v, q), part.ince(v), part.erken(v)]),
      `-dik + притяжательное (${PRON_RU[q]}) + halde - «хотя, несмотря на то что» (книжный оборот): ${hal} halde.`,
      `-dik + тәуелдік (${PRON_KK[q]}) + halde - «... болса да» (кітаби тіркес): ${hal} halde.`,
      `-dik + possessive (${PRON_EN[q]}) + halde means "although" (formal): ${hal} halde.`));
  });
  return out;
}

// ---------- Нереальное условие в прошлом: gelseydin (C1) ----------
function unrealRows() {
  const out = [];
  const list = ['gel', 'çalış', 'kalk', 'ara', 'bekle', 'oku', 'dinle', 'git', 'söyle', 'öğren', 'yardım et', 'öde'];
  list.forEach((s, i) => {
    const v = vb(s);
    const p = i % 5;
    const ok = verb.condPast(v, p);
    out.push(row(5, `${PRON[p]} dün ${v.obj} ______, her şey farklı olurdu. (${v.inf})`, ok, [verb.condAor(v, p), verb.past(v, p), verb.fut(v, p)],
      `Нереальное условие в прошлом («если бы тогда»): основа + -se + -ydi + лицо: ${ok}. Главное предложение - широкое время + -di (olurdu).`,
      `Өткендегі шындыққа жанаспайтын шарт («сонда ... болса ғой»): түбір + -se + -ydi + жақ: ${ok}. Басыңқы сөйлем - ауыспалы шақ + -di (olurdu).`,
      `An unreal past condition ("if ... had"): stem + -se + -ydi + person: ${ok}. The main clause uses aorist + -di (olurdu).`));
  });
  return out;
}

// ---------- Ещё формы с лицами (B1-C2) ----------
const MORE = ['gel', 'oku', 'yap', 'git', 'çalış', 'yardım et', 'ara', 'bitir', 'öğren', 'bekle', 'öde', 'yaz', 'izle', 'dinle'];
const GEN = ['Benim', 'Senin', 'Onun', 'Bizim', 'Sizin'];
/** Невозможность: gelemem, yapamazsın. */
function abilNeg(v, p) {
  const b = `${v.yi ? `${v.s[0]}iy` : v.soft ? v.soft : /[aeıioöuü]$/.test(v.s) ? `${v.s}y` : v.s}${h2(v.s)}m${h2(v.s)}`;
  const x = h4(b);
  return [`${b}m`, `${b}zs${x}n`, `${b}z`, `${b}y${x}z`, `${b}zs${x}n${x}z`, `${b}zl${h2(b)}r`][p];
}
/** -dik + принадлежность + винительный: geldiğimi, geldiğini. */
const dikAcc = (v, p) => {
  const d = part.dik(v, p);
  return p === 2 ? `${d}n${h4(d)}` : `${d}${h4(d)}`;
};
/** -me + принадлежность: gelmem, gelmesi. */
const mesi = (v, p) => {
  const st = `${v.s}m${h2(v.s)}`;
  const x = h4(st);
  return [`${st}m`, `${st}n`, `${st}s${x}`, `${st}m${x}z`, `${st}n${x}z`][p];
};
const dikce = (v) => {
  const st = `${verb.past(v, 2)}k`;
  return `${st}ç${h2(st)}`;
};
function moreRows() {
  const out = [];
  MORE.forEach((s, i) => {
    const v = vb(s);
    for (const p of [i % 5, (i + 2) % 5]) {
      const ok = abilNeg(v, p);
      out.push(row(3, `${PRON[p]} bugün ${v.obj} ______, çünkü hiç vakit yok. (${v.inf})`, ok, three(ok, [verb.abil(v, p), verb.aor(v, p), verb.fut(v, p)]),
        `«Не могу» - отрицание возможности: основа + -eme/-ama + -m, -zsin, -z...: ${ok}.`,
        `«... алмаймын» - мүмкіндіктің болымсыз түрі: түбір + -eme/-ama + -m, -zsin, -z...: ${ok} (қазақшадағы келе алмаймын сияқты).`,
        `"Cannot": stem + -eme/-ama + -m, -zsin, -z...: ${ok}.`));
    }
    {
      const p = (i + 1) % 5;
      const ok = dikAcc(v, p);
      out.push(row(4, `${GEN[p]} ${v.obj} ______ herkes biliyor. (${v.inf})`, ok, three(ok, [0, 1, 2, 3, 4].filter((k) => k !== p).map((k) => dikAcc(v, k))),
        `Придаточное «что ...» - причастие -dik + притяжательное (${PRON_RU[p]}) + винительный падеж (знать что?): ${ok}.`,
        `«... екенін» бағыныңқы сөйлемі - -dik есімшесі + тәуелдік (${PRON_KK[p]}) + табыс септік: ${ok} (қазақшадағы келгенін сияқты).`,
        `A "that ..." clause: participle -dik + possessive (${PRON_EN[p]}) + accusative: ${ok}.`));
      const q = (i + 3) % 5;
      const pc = verb.pastCont(v, q);
      out.push(row(4, `${PRON[q]} ${v.obj} ______, birden telefon çaldı. (${v.inf})`, pc, three(pc, [0, 1, 2, 3, 4].filter((k) => k !== q).map((k) => verb.pastCont(v, k))),
        `Длительное действие в прошлом, которое прервали: -iyordu + лицо (${PRON_RU[q]}): ${pc}.`,
        `Өткенде созылып, бөлінген әрекет: -iyordu + жақ (${PRON_KK[q]}): ${pc} (қазақшадағы оқып отыр едім сияқты).`,
        `A longer past action that was interrupted: -iyordu + person (${PRON_EN[q]}): ${pc}.`));
    }
    {
      const p = i % 5;
      const ok = verb.futPast(v, p);
      out.push(row(5, `${PRON[p]} dün ${v.obj} ______, ama plan değişti. (${v.inf})`, ok, three(ok, [verb.past(v, p), verb.plup(v, p), verb.fut(v, p), verb.pres(v, p)]),
        `Собирался, но не сделал - будущее в прошедшем: -ecek + -ti: ${ok}.`,
        `Істемек болып, істемеген - өткендегі келер шақ: -ecek + -ti: ${ok} (қазақшадағы барар едім сияқты).`,
        `Was going to, but did not: future in the past -ecek + -ti: ${ok}.`));
      const q = (i + 4) % 5;
      const m = mesi(v, q);
      out.push(row(5, `${GEN[q]} yarın ${v.obj} ______ gerekiyor. (${v.inf})`, m, three(m, [0, 1, 2, 3, 4].filter((k) => k !== q).map((k) => mesi(v, k))),
        `«Нужно, чтобы ...»: -me/-ma + притяжательное (${PRON_RU[q]}) + gerekiyor: ${m}.`,
        `«... керек»: -me/-ma + тәуелдік (${PRON_KK[q]}) + gerekiyor: ${m} (қазақшадағы баруым керек сияқты).`,
        `"It is necessary that ...": -me/-ma + possessive (${PRON_EN[q]}) + gerekiyor: ${m}.`));
    }
    {
      const neg = `${v.s}m${h2(v.s)}`;
      const ok = `${neg}m${h4(neg)}ş`;
      out.push(row(6, `O, sanki ${v.obj} hiç ______ gibi davranıyor. (${v.inf})`, ok, [`${neg}d${h4(neg)}`, part.meden(v), part.mesine(v, 2)],
        `«Как будто не ...»: отрицательная форма на -miş + gibi: ${ok} gibi.`,
        `«... мағандай»: болымсыз -miş түрі + gibi: ${ok} gibi (қазақшадағы көрмегендей сияқты).`,
        `"As if (he) had not ...": negative -miş + gibi: ${ok} gibi.`));
      const d = dikce(v);
      out.push(row(6, `${v.obj[0].toLocaleUpperCase('tr') + v.obj.slice(1)} ______ daha çok deneyim kazanıyorum. (${v.inf})`, d, [part.dikten(v), part.meden(v), part.mesine(v, 0)],
        `«Чем больше ..., тем ...»: -dikçe/-dıkça: ${d}.`,
        `«... сайын»: -dikçe/-dıkça: ${d} (қазақшадағы оқыған сайын сияқты).`,
        `"The more ..., the more ...": -dikçe/-dıkça: ${d}.`));
      for (const p of [i % 5, (i + 3) % 5]) {
        const c = verb.cond(v, p);
        out.push(row(6, `${PRON[p]} yarın ${v.obj} ______ bile sonuç değişmez. (${v.inf})`, c, three(c, [0, 1, 2, 3, 4].filter((k) => k !== p).map((k) => verb.cond(v, k))),
          `«Даже если»: -se/-sa + лицо (${PRON_RU[p]}) + bile: ${c} bile.`,
          `«... да, ... болса да»: -se/-sa + жақ (${PRON_KK[p]}) + bile: ${c} bile.`,
          `"Even if": -se/-sa + person (${PRON_EN[p]}) + bile: ${c} bile.`));
      }
    }
  });
  return out;
}

// ---------- Задания, написанные вручную ----------
const HAND = [
  // A1
  [1, 'Evde süt ______. Markete gitmeliyiz.', 'yok', ['var', 'değil', 'mi'], 'Чего-то нет - yok («нет, отсутствует»).', 'Бірдеңе жоқ болса - yok (қазақшадағы «жоқ»).', 'Something is missing: yok ("there is no").'],
  [1, 'Bu benim çantam ______. Benim çantam kırmızı.', 'değil', ['yok', 'var', 'mı'], 'Отрицание при существительном - değil («не является»).', 'Зат есімнің болымсыз түрі - değil (қазақшадағы «емес»).', 'A noun is negated with değil ("is not").'],
  [1, 'Merhaba, nasılsın? - İyiyim, ______.', 'teşekkür ederim', ['rica ederim', 'özür dilerim', 'görüşürüz'], 'На вопрос «как дела?» благодарят: teşekkür ederim («спасибо»).', '«Қалайсың?» деген сұраққа алғыс айтады: teşekkür ederim («рахмет»).', 'Answering "how are you?" you say thanks: teşekkür ederim.'],
  [1, 'Adın ______? - Adım Ali.', 'ne', ['kim', 'nerede', 'nasıl'], 'Как тебя зовут? - Adın ne? (букв. «имя твоё что?»).', 'Атың кім? - Adın ne? (сөзбе-сөз «атың не?»).', 'What is your name? - Adın ne? (lit. "your name what?").'],
  [1, 'Sen ______? - Kazakistanlıyım.', 'nerelisin', ['nasılsın', 'kimsin', 'kaç yaşındasın'], 'Ответ «я из Казахстана» - вопрос nerelisin («откуда ты?»).', '«Қазақстанданмын» деген жауап - nerelisin («қай жақтансың?») сұрағына.', 'The answer "I am from Kazakhstan" fits nerelisin ("where are you from?").'],
  [1, 'Ben öğrenci______.', 'yim', ['sin', 'yiz', 'ler'], 'Я - ben: личное окончание -im, после гласной с y: öğrenciyim.', 'Мен - ben: жіктік жалғау -im, дауыстыдан кейін y-мен: öğrenciyim (қазақшадағы оқушымын).', 'I am - ben: ending -im, with y after a vowel: öğrenciyim.'],
  [1, 'Sen doktor______.', 'sun', ['sın', 'sin', 'sün'], 'Ты - sen: -sin по четырёхвариантной гармонии; последняя гласная o → u: doktorsun.', 'Сен - sen: -sin төрт нұсқалы үндестік бойынша; соңғы дауысты o → u: doktorsun.', 'You - sen: -sin by four-way harmony; the last vowel o gives u: doktorsun.'],
  [1, 'Biz Türk______.', 'üz', ['ız', 'iz', 'uz'], 'Мы - biz: -iz по гармонии; последняя гласная ü: Türküz.', 'Біз - biz: -iz үндестік бойынша; соңғы дауысты ü: Türküz.', 'We - biz: -iz by harmony; the last vowel is ü: Türküz.'],
  [1, 'Kitap masanın ______.', 'üstünde', ['üstüne', 'üstünden', 'üstü'], 'Где лежит? - местный падеж: masanın üstünde («на столе»).', 'Қайда жатыр? - жатыс септік: masanın üstünde («үстелдің үстінде»).', 'Where is it? - locative: masanın üstünde ("on the table").'],
  [1, 'Türkçe biliyor ______?', 'musun', ['misin', 'mısın', 'müsün'], 'После -yor частица всегда mu: biliyor musun?', '-yor-дан кейін шылау әрқашан mu: biliyor musun?', 'After -yor the particle is always mu: biliyor musun?'],
  [1, "Ankara Türkiye'nin başkenti______.", 'dir', ['dır', 'dur', 'dür'], 'Связка -dir по гармонии: başkenti (последняя гласная i) → başkentidir.', '-dir жалғауы үндестік бойынша: başkenti (соңғы дауысты i) → başkentidir.', 'The copula -dir follows harmony: başkenti (last vowel i) → başkentidir.'],
  [1, 'Kahve mi içersin, çay ______?', 'mı', ['mi', 'mu', 'mü'], 'Вопрос «или»: частица после каждого варианта; çay → mı.', '«Әлде» сұрағы: шылау әр нұсқадан кейін; çay → mı.', 'An "or" question: the particle follows each option; çay → mı.'],
  [1, 'Bugün hava çok ______. Montunu giy.', 'soğuk', ['sıcak', 'güzel', 'güneşli'], 'Надеть куртку стоит, когда холодно: soğuk.', 'Күрте кию керек болса - ауа райы суық: soğuk.', 'You put on a coat when it is cold: soğuk.'],
  [1, 'Benim adım Ali. ______ adın ne?', 'Senin', ['Sen', 'Seni', 'Sana'], 'Чьё имя? - родительный падеж: senin adın («твоё имя»).', 'Кімнің аты? - ілік септік: senin adın («сенің атың»).', 'Whose name? - genitive: senin adın ("your name").'],
  [1, 'Sınıfta kaç öğrenci ______?', 'var', ['yok', 'değil', 'mi'], 'Сколько есть? - kaç ... var?', 'Қанша бар? - kaç ... var?', 'How many are there? - kaç ... var?'],
  // A2
  [2, 'Okula otobüs______ gidiyorum.', 'le', ['la', 'de', 'den'], 'Средство передвижения - послелог ile, слитно: otobüsle (гармония ü → e).', 'Көлік - ile шылауы, бірге жазылады: otobüsle (ü → e) - қазақшадағы автобуспен сияқты.', 'Means of transport takes ile, attached: otobüsle (ü gives e).'],
  [2, 'Arkadaşım______ sinemaya gittim.', 'la', ['le', 'da', 'dan'], 'С кем? - ile слитно: arkadaşımla (последняя гласная ı → a).', 'Кіммен? - ile бірге жазылады: arkadaşımla (ı → a).', 'With whom? - ile attached: arkadaşımla (ı gives a).'],
  [2, 'Dün hava çok güzel______.', 'di', ['dı', 'du', 'dü'], 'Прошедшее у прилагательного: -di по гармонии; güzel (e) → güzeldi.', 'Сын есімнің өткен шағы: -di үндестік бойынша; güzel (e) → güzeldi.', 'Past of an adjective: -di by harmony; güzel (e) → güzeldi.'],
  [2, 'Benim iki kardeş______ var.', 'im', ['in', 'i', 'ler'], 'После числительного - единственное число + притяжательное: iki kardeşim var.', 'Сан есімнен кейін жекеше түр + тәуелдік: iki kardeşim var (екі бауырым бар).', 'After a number: singular + possessive: iki kardeşim var.'],
  [2, 'Saat yedi______ kalkıyorum.', 'de', ['da', 'te', 'ta'], 'Время «в семь» - местный падеж: yedide (последняя гласная i).', '«Жетіде» - жатыс септік: yedide (соңғы дауысты i).', '"At seven" is the locative: yedide (last vowel i).'],
  [2, 'Saat dört______ buluşalım.', 'te', ['de', 'ta', 'da'], 'dört оканчивается на глухую t, поэтому d → t; гармония ö → e: dörtte.', 'dört қатаң t-мен бітеді, сондықтан d → t; ö → e: dörtte (қазақшадағы төртте сияқты).', 'dört ends in voiceless t, so d becomes t; ö gives e: dörtte.'],
  [2, 'Saat altı______ eve döndüm.', 'da', ['de', 'ta', 'te'], 'altı - последняя гласная ı → da: altıda.', 'altı - соңғы дауысты ı → da: altıda.', 'altı has the last vowel ı, so -da: altıda.'],
  [2, 'Ben ______ sevmem, kahveyi severim.', 'çayı', ['çaya', 'çayda', 'çaydan'], 'Глагол sevmek требует винительного падежа: çayı.', 'sevmek етістігі табыс септігін талап етеді: çayı.', 'sevmek takes the accusative: çayı.'],
  [2, 'Bu elbise o elbise______ daha güzel.', 'den', ['de', 'e', 'i'], 'Сравнение: -den + daha: o elbiseden daha güzel.', 'Салыстыру: -den + daha: o elbiseden daha güzel.', 'Comparison: -den + daha: o elbiseden daha güzel.'],
  [2, 'Yarın sinemaya ______ ister misin?', 'gitmek', ['gitme', 'gider', 'gitti'], 'После istemek - инфинитив на -mek: gitmek ister misin?', 'istemek-тен бұрын -mek тұйық етістігі: gitmek ister misin?', 'istemek is used with the infinitive -mek: gitmek ister misin?'],
  [2, 'Ben yüz______ bilmiyorum.', 'meyi', ['mek', 'meye', 'mekte'], 'Уметь что-то делать: -meyi bilmek (инфинитив в винительном падеже): yüzmeyi bilmiyorum.', 'Бірдеңе істей білу: -meyi bilmek: yüzmeyi bilmiyorum (жүзуді білмеймін).', 'Knowing how to do something: -meyi bilmek: yüzmeyi bilmiyorum.'],
  [2, 'Kardeşim benden üç yaş ______.', 'küçük', ['küçüğü', 'küçükte', 'küçüğe'], 'Сравнение без daha тоже возможно: benden üç yaş küçük («младше меня на три года»).', 'daha-сыз салыстыру да болады: benden üç yaş küçük («менен үш жас кіші»).', 'Comparison without daha: benden üç yaş küçük ("three years younger than me").'],
  // B1
  [3, 'Hasta olduğum ______ okula gitmedim.', 'için', ['rağmen', 'gibi', 'kadar'], 'Причина: -dik + притяжательное + için («потому что»).', 'Себеп: -dik + тәуелдік + için («... болғандықтан»).', 'Cause: -dik + possessive + için ("because").'],
  [3, 'Çok çalışmasına ______ sınavı geçemedi.', 'rağmen', ['için', 'gibi', 'göre'], 'Уступка: -mesine + rağmen («несмотря на»).', 'Қарсылық: -mesine + rağmen («... қарамастан»).', 'Concession: -mesine + rağmen ("despite").'],
  [3, 'Haberlere ______ yarın yağmur yağacak.', 'göre', ['için', 'rağmen', 'kadar'], '«Согласно» - дательный падеж + göre.', '«... бойынша» - барыс септік + göre.', '"According to" - dative + göre.'],
  [3, 'Akşama ______ bu işi bitirmeliyiz.', 'kadar', ['göre', 'için', 'rağmen'], '«До» (по времени) - дательный падеж + kadar: akşama kadar.', '«... дейін» - барыс септік + kadar: akşama kadar (кешке дейін).', '"Until" - dative + kadar: akşama kadar.'],
  [3, 'Sınavı ______ çok mutlu oldum.', 'kazanınca', ['kazanacak', 'kazandı', 'kazanır'], 'Нужна связка «когда»: -ince/-ınca; личные формы здесь невозможны.', '«... кезде» байланысы керек: -ince/-ınca; жіктелген түр мұнда келмейді.', 'We need a "when" form: -ince/-ınca; a finite verb cannot stand here.'],
  [3, 'Eve gelir______ ekmek al.', 'ken', ['ce', 'de', 'di'], '«По пути / пока»: широкое время + -ken: gelirken.', '«Келе жатып»: ауыспалы шақ + -ken: gelirken.', '"While / on the way": aorist + -ken: gelirken.'],
  [3, 'Yağmur yağ______ şemsiyeni al.', 'arsa', ['dı', 'acak', 'mış'], 'Условие: широкое время + -se: yağarsa («если пойдёт дождь»).', 'Шарт: ауыспалы шақ + -se: yağarsa («жаңбыр жауса»).', 'Condition: aorist + -se: yağarsa ("if it rains").'],
  [3, 'Ben senin ______ çok önem veriyorum.', 'fikirlerine', ['fikirlerini', 'fikirlerinde', 'fikirlerinden'], 'önem vermek («придавать значение») требует дательного падежа.', 'önem vermek («мән беру») барыс септігін талап етеді.', 'önem vermek ("to value") takes the dative.'],
  [3, 'Bu konu ______ ne düşünüyorsun?', 'hakkında', ['gibi', 'kadar', 'ile'], '«О чём?» - hakkında («о, насчёт»).', '«Не туралы?» - hakkında («туралы»).', '"About what?" - hakkında ("about").'],
  [3, 'Yarın erken kalkmam ______.', 'lazım', ['lazımda', 'lazımı', 'yok mu'], 'Необходимость: -me + притяжательное + lazım («мне нужно»).', 'Қажеттілік: -me + тәуелдік + lazım («... керек»).', 'Necessity: -me + possessive + lazım ("I need to").'],
  // B2
  [4, 'Ne kadar çok çalışırsan ______ başarılı olursun.', 'o kadar', ['bu kadar', 'şu kadar', 'ne kadar'], 'Парная конструкция ne kadar ... o kadar («чем ..., тем»).', 'Қос құрылым ne kadar ... o kadar («неғұрлым ..., соғұрлым»).', 'The pair ne kadar ... o kadar ("the more ... the more").'],
  [4, 'Hem Türkçe ______ İngilizce biliyor.', 'hem', ['ne', 'ya', 'da'], 'hem ... hem («и ..., и»).', 'hem ... hem («... та, ... та»).', 'hem ... hem ("both ... and").'],
  [4, 'Ne kahve ______ çay içerim.', 'ne', ['hem', 'ya', 'veya'], 'ne ... ne («ни ..., ни») с утвердительным глаголом.', 'ne ... ne («... да емес, ... да емес») болымды етістікпен.', 'ne ... ne ("neither ... nor") with an affirmative verb.'],
  [4, 'Ya bugün ______ da yarın gelecek.', 'ya', ['ne', 'hem', 'ki'], 'ya ... ya da («или ..., или»).', 'ya ... ya da («не ..., не»).', 'ya ... ya da ("either ... or").'],
  [4, 'Sanki her şeyi biliyormuş ______ konuşuyor.', 'gibi', ['kadar', 'için', 'göre'], '-miş gibi - «как будто».', '-miş gibi - «... сияқты, ... тәрізді».', '-miş gibi means "as if".'],
  [4, 'Eve gelir ______ yattı.', 'gelmez', ['gelmeden', 'gelince', 'gelirken'], '-ir -mez - «как только»: gelir gelmez.', '-ir -mez - «... бойда»: gelir gelmez (келген бойда).', '-ir -mez means "as soon as": gelir gelmez.'],
  [4, 'Bu kitap Türkçe______ çevrildi; orijinali Almanca.', 'ye', ['den', 'de', 'yi'], 'На какой язык переведена? - дательный: Türkçeye.', 'Қай тілге аударылды? - барыс септік: Türkçeye.', 'Translated into which language? - dative: Türkçeye.'],
  [4, 'Toplantı yarına ______.', 'ertelendi', ['erteledi', 'ertelendirdi', 'erteletti'], 'Собрание само ничего не переносит - пассив: ertelendi.', 'Жиналыс өзі ештеңені шегермейді - ырықсыз етіс: ertelendi.', 'The meeting does not postpone anything itself - passive: ertelendi.'],
  [4, 'O kadar yorgundum ______ hemen uyudum.', 'ki', ['de', 'ama', 'için'], 'o kadar ... ki - «так ..., что».', 'o kadar ... ki - «соншалық ..., ...».', 'o kadar ... ki means "so ... that".'],
  [4, 'Ben gelmeden ______ gitme.', 'önce', ['sonra', 'kadar', 'beri'], '-meden önce - «до того как».', '-meden önce - «... бұрын».', '-meden önce means "before".'],
  [4, "Türkiye'ye geldi______ beri Türkçe öğreniyor.", 'ğinden', ['ği için', 'ğinde', 'ğine'], '«С тех пор как»: -diğinden beri.', '«... бері»: -diğinden beri (келгеннен бері).', '"Since": -diğinden beri.'],
  [4, 'Bu sorunu nasıl çözeceğimizi ______ lazım.', 'düşünmemiz', ['düşünmeliyiz', 'düşünüyoruz', 'düşündük'], 'lazım требует отглагольного имени с принадлежностью: düşünmemiz lazım.', 'lazım тәуелдік жалғаулы қимыл атауын талап етеді: düşünmemiz lazım.', 'lazım needs a verbal noun with possession: düşünmemiz lazım.'],
  // C1
  [5, 'Bu işi zamanında bitirmek ______ çok çalışmamız gerekiyor.', 'için', ['rağmen', 'kadar', 'göre'], 'Цель: инфинитив + için («чтобы»).', 'Мақсат: тұйық етістік + için («... үшін»).', 'Purpose: infinitive + için ("in order to").'],
  [5, 'Söz verdiği ______ toplantıya gelmedi.', 'halde', ['için', 'gibi', 'kadar'], '-dik + halde - «хотя».', '-dik + halde - «... болса да».', '-dik + halde means "although".'],
  [5, 'Bu karar herkes ______ kabul edildi.', 'tarafından', ['için', 'ile', 'göre'], 'Деятель при пассиве - tarafından («кем-то»).', 'Ырықсыз етістегі әрекет иесі - tarafından («... тарапынан»).', 'The agent of a passive verb takes tarafından ("by").'],
  [5, 'Yağmur yağmasına ______ maç oynandı.', 'rağmen', ['için', 'göre', 'kadar'], '-mesine rağmen - «несмотря на то что».', '-mesine rağmen - «... қарамастан».', '-mesine rağmen means "despite".'],
  [5, 'Konuşmasından onun çok yorgun olduğu ______.', 'anlaşılıyordu', ['anladı', 'anlıyor', 'anlatıyordu'], 'Безличный пассив «было понятно»: anlaşılıyordu.', 'Жақсыз ырықсыз етіс «түсінікті болды»: anlaşılıyordu.', 'An impersonal passive "it was clear": anlaşılıyordu.'],
  [5, 'Bu proje bitmek ______.', 'üzere', ['için', 'gibi', 'kadar'], '-mek üzere - «вот-вот, почти».', '-mek üzere - «... жақын, ... таяу».', '-mek üzere means "about to".'],
  [5, 'Ne olursa ______ pes etmeyeceğim.', 'olsun', ['olur', 'oldu', 'olacak'], 'Устойчивое ne olursa olsun - «что бы ни случилось».', 'Тұрақты тіркес ne olursa olsun - «не болса да».', 'The fixed phrase ne olursa olsun means "whatever happens".'],
  [5, 'Kim ne derse ______, ben kararımı verdim.', 'desin', ['der', 'dedi', 'diyor'], 'Кто бы что ни говорил: -se + повелительное 3-го лица: derse desin.', 'Кім не десе де: -se + 3-жақ бұйрық рай: derse desin.', 'Whatever anyone says: -se + 3rd-person imperative: derse desin.'],
  [5, 'Ödevini bitir______ dışarı çıkamazsın.', 'meden', ['dikten', 'diği', 'ecek'], '«Не закончив» - -meden.', '«Бітірмейінше» - -meden.', '"Without finishing" - -meden.'],
  // C2
  [6, 'Ağaç yaşken ______.', 'eğilir', ['kırılır', 'büyür', 'kurur'], 'Пословица: «Дерево гнут, пока оно молодое» - учить нужно с детства.', 'Мақал: «Ағашты жас кезінде иеді» - қазақшадағы «Ағаш жастан иіледі» мақалындай.', 'Proverb: "A tree is bent while it is young" - teach early.'],
  [6, 'Damlaya damlaya göl ______.', 'olur', ['dolar', 'akar', 'biter'], 'Пословица: «Капля за каплей - и получается озеро».', 'Мақал: «Тамшыдан көл болар» - қазақ мақалымен бірдей.', 'Proverb: "Drop by drop a lake is formed".'],
  [6, 'Sakla samanı, gelir ______.', 'zamanı', ['yılı', 'günü', 'vakti'], 'Пословица: «Храни солому - придёт её время».', 'Мақал: «Сабанды сақта, оның да уақыты келеді».', 'Proverb: "Keep the straw, its time will come".'],
  [6, 'Bir elin nesi var, iki elin ______ var.', 'sesi', ['işi', 'gücü', 'eli'], 'Пословица: «У одной руки ничего нет, у двух рук есть звук» - вместе сильнее.', 'Мақал: «Бір қолдың несі бар, екі қолдың дыбысы бар» - бірлік туралы.', 'Proverb: "One hand has nothing, two hands make a sound" - together is stronger.'],
  [6, 'Gülü seven ______ katlanır.', 'dikenine', ['kokusuna', 'rengine', 'yaprağına'], 'Пословица: «Кто любит розу, терпит её шипы».', 'Мақал: «Раушанды сүйген оның тікенегіне шыдайды».', 'Proverb: "Who loves the rose bears its thorns".'],
  [6, 'Ayağını yorganına göre ______.', 'uzat', ['kısalt', 'çek', 'koy'], 'Пословица: «Протягивай ноги по одеялу» - живи по средствам.', 'Мақал: «Аяғыңды көрпеңе қарай көсіл» - қазақшадағы мақалмен бірдей.', 'Proverb: "Stretch your legs according to your quilt" - live within your means.'],
  [6, 'Sınav yaklaşıyor ama o hâlâ ______ üstüne yatıyor.', 'kulağının', ['gözünün', 'elinin', 'başının'], 'Идиома kulağının üstüne yatmak - «бездельничать, ничего не делать».', 'Идиома kulağının üstüne yatmak - «қам жемеу, ештеңе істемеу».', 'Idiom kulağının üstüne yatmak - "to sit idle".'],
  [6, 'Bu haberi duyunca küplere ______.', 'bindi', ['girdi', 'çıktı', 'düştü'], 'Идиома küplere binmek - «прийти в ярость».', 'Идиома küplere binmek - «қатты ашулану».', 'Idiom küplere binmek - "to fly into a rage".'],
  [6, 'Herkese yardım eder, çok eli ______ bir insandır.', 'açık', ['kapalı', 'sıkı', 'dar'], 'eli açık - «щедрый» (букв. «с открытой рукой»).', 'eli açık - «жомарт» (қазақшадағы «қолы ашық»).', 'eli açık means "generous" (lit. "open-handed").'],
  [6, 'Ne kadar uğraştıysa da bir türlü ______.', 'başaramadı', ['başardı', 'başarır', 'başaracak'], 'bir türlü («никак») требует отрицания: başaramadı.', 'bir türlü («еш») болымсыздықты талап етеді: başaramadı.', 'bir türlü ("no way") requires a negative verb: başaramadı.'],
  [6, 'Haber duyulur ______ herkes meydana koştu.', 'duyulmaz', ['duyulmadan', 'duyulunca', 'duyulurken'], '-ir -mez - «как только»: duyulur duyulmaz.', '-ir -mez - «... бойда»: duyulur duyulmaz.', '-ir -mez means "as soon as": duyulur duyulmaz.'],
  [6, 'Az olsun, ______ olsun.', 'öz', ['çok', 'iyi', 'tam'], 'Поговорка az olsun, öz olsun - «лучше меньше, да лучше».', 'Мәтел az olsun, öz olsun - «аз болсын, саз болсын».', 'Saying az olsun, öz olsun - "less but better".'],
  [6, 'Sabrın sonu ______.', 'selamettir', ['mutluluktur', 'zaferdir', 'başarıdır'], 'Пословица: «Конец терпения - спасение».', 'Мақал: «Сабырдың түбі - сары алтын» мағынасындағы түрік мақалы.', 'Proverb: "The end of patience is salvation".'],
  [6, 'Mum dibine ______ vermez.', 'ışık', ['ateş', 'gölge', 'ses'], 'Пословица: «Свеча не светит под собой» - близким часто не помогают.', 'Мақал: «Шам өз түбін жарықтандырмайды».', 'Proverb: "A candle gives no light at its base".'],
  [6, 'Dost kara günde ______.', 'belli olur', ['kaybolur', 'gelir', 'ağlar'], 'Пословица: «Друг познаётся в беде».', 'Мақал: «Дос басқа іс түскенде танылады».', 'Proverb: "A friend is known in hard times".'],
  [6, 'Görmüş geçirmiş biri olduğu ______ ondan akıl danıştık.', 'için', ['halde', 'rağmen', 'gibi'], 'Причина: -dik + için; görmüş geçirmiş - «бывалый, опытный».', 'Себеп: -dik + için; görmüş geçirmiş - «көпті көрген».', 'Cause: -dik + için; görmüş geçirmiş means "experienced".'],
];

export const TURKISH = [
  ...HAND.map(([level, q, ok, wrong, ru, kk, en]) => row(level, q, ok, wrong, ru, kk, en)),
  ...questionRows(),
  ...caseRows(),
  ...countRows(),
  ...possRows(),
  ...comparisonRows(),
  ...converbRows(),
  ...condRows(),
  ...participleRows(),
  ...voiceRows(),
  ...causalRows(),
  ...unrealRows(),
  ...moreRows(),
];
