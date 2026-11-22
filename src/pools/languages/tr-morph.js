// Турецкая морфология: гармония гласных, оглушение d → t, чередование k/ğ, p/b, ç/c, t/d.
// Все формы строятся по правилам; основы-исключения (git → gid-, et → ed-, ye, de) записаны в данных глаголов.

const VOWELS = 'aeıioöuüâîû';
const BACK = 'aıouâû';
const lower = (w) => w.toLocaleLowerCase('tr');
export const lastVowel = (w) => {
  const s = lower(w);
  for (let i = s.length - 1; i >= 0; i--) if (VOWELS.includes(s[i])) return s[i];
  return 'e';
};
export const endsVowel = (w) => VOWELS.includes(lower(w).at(-1));
/** Двухвариантная гармония: a или e. */
export const h2 = (w) => (BACK.includes(lastVowel(w)) ? 'a' : 'e');
/** Четырёхвариантная гармония: ı, i, u, ü. */
export const h4 = (w) => ({ a: 'ı', ı: 'ı', â: 'ı', o: 'u', u: 'u', û: 'u', e: 'i', i: 'i', î: 'i', ö: 'ü', ü: 'ü' })[lastVowel(w)];
/** Глухой согласный на конце (fıstıkçı şahap): d → t, c → ç. */
export const voiceless = (w) => 'fstkçşhp'.includes(lower(w).at(-1));
const D = (w) => (voiceless(w) ? 't' : 'd');

// ---------- Существительные ----------
// n: { w: 'kitap', v: 'kitab' (основа перед гласной, если меняется), proper: true для имён собственных }
const sep = (n) => (n.proper ? `${n.w}'` : n.w);
const vstem = (n) => (n.proper ? `${n.w}'` : n.v ?? n.w);
export const noun = {
  loc: (n) => `${sep(n)}${D(n.w)}${h2(n.w)}`,
  abl: (n) => `${sep(n)}${D(n.w)}${h2(n.w)}n`,
  dat: (n) => (endsVowel(n.w) ? `${sep(n)}y${h2(n.w)}` : `${vstem(n)}${h2(n.w)}`),
  acc: (n) => (endsVowel(n.w) ? `${sep(n)}y${h4(n.w)}` : `${vstem(n)}${h4(n.w)}`),
  gen: (n) => (endsVowel(n.w) ? `${sep(n)}n${h4(n.w)}n` : `${vstem(n)}${h4(n.w)}n`),
  pl: (n) => `${n.w}l${h2(n.w)}r`,
  /** Притяжательная форма: 0 - мой, 1 - твой, 2 - его, 3 - наш, 4 - ваш. */
  poss: (n, p) => {
    const x = h4(n.w);
    if (endsVowel(n.w)) return n.w + ['m', 'n', `s${x}`, `m${x}z`, `n${x}z`][p];
    return vstem(n) + [`${x}m`, `${x}n`, x, `${x}m${x}z`, `${x}n${x}z`][p];
  },
};

// ---------- Глаголы ----------
// v: { s: 'gel' (основа), soft: 'gid' (основа перед гласной), aor: 'gelir' (широкое время, 3 л.), yi: true для ye/de }
const PERS = 6;
const vowelStem = (v) => v.soft ?? v.s;
/** Основа + соединительная y перед гласной: oku → okuy, gel → gel, git → gid. */
const yStem = (v) => (endsVowel(v.s) ? `${v.s}y` : vowelStem(v));

/** Личные окончания типа «ben -im, sen -sin»: для -iyor, -ecek, -miş, широкого времени. */
function z(stem, p, { k = false, yor = false } = {}) {
  const x = yor ? 'u' : h4(stem);
  const base = k ? stem.slice(0, -1) + 'ğ' : stem;
  return [`${base}${x}m`, `${stem}s${x}n`, stem, `${base}${x}z`, `${stem}s${x}n${x}z`, `${stem}l${h2(stem)}r`][p];
}
/** Окончания прошедшего на -di и условного -se: -m, -n, -, -k, -niz, -ler. */
function k(stem, p) {
  const x = h4(stem);
  return [`${stem}m`, `${stem}n`, stem, `${stem}k`, `${stem}n${x}z`, `${stem}l${h2(stem)}r`][p];
}

export const verb = {
  /** Настоящее продолженное: geliyorum, okuyorum, gidiyorum. */
  pres(v, p) {
    let st;
    if (v.yi) st = `${v.s[0]}iyor`;
    else if (endsVowel(v.s)) {
      const cut = v.s.slice(0, -1);
      st = `${cut}${h4(cut)}yor`;
    } else st = `${vowelStem(v)}${h4(v.s)}yor`;
    return z(st, p, { yor: true });
  },
  /** Отрицание настоящего: gelmiyorum. */
  presNeg(v, p) {
    return z(`${v.s}m${h4(v.s)}yor`, p, { yor: true });
  },
  /** Прошедшее на -di: geldim, yaptım, gittim. */
  past(v, p) {
    return k(`${v.s}${D(v.s)}${h4(v.s)}`, p);
  },
  /** Будущее: geleceğim, okuyacağım, gideceğim, yiyeceğim. */
  fut(v, p) {
    const st = v.yi ? `${v.s[0]}iy` : yStem(v);
    return z(`${st}${h2(v.s)}c${h2(v.s)}k`, p, { k: p === 0 || p === 3 });
  },
  /** Широкое время: gelirim, yaparım, okurum. */
  aor(v, p) {
    return z(v.aor, p);
  },
  /** Прошедшее на -miş (пересказ, неочевидное): gelmişim. */
  evid(v, p) {
    return z(`${v.s}m${h4(v.s)}ş`, p);
  },
  /** Долженствование: gelmeliyim. */
  nec(v, p) {
    const a = h2(v.s);
    const st = `${v.s}m${a}l${a === 'a' ? 'ı' : 'i'}`;
    const x = h4(st);
    return [`${st}y${x}m`, `${st}s${x}n`, st, `${st}y${x}z`, `${st}s${x}n${x}z`, `${st}l${h2(st)}r`][p];
  },
  /** Возможность: gelebilirim, okuyabilirim. */
  abil(v, p) {
    const st = v.yi ? `${v.s[0]}iy` : yStem(v);
    return z(`${st}${h2(v.s)}bilir`, p);
  },
  /** Условное: gelsem, yapsam. */
  cond(v, p) {
    return k(`${v.s}s${h2(v.s)}`, p);
  },
  /** Прошедшее продолженное: geliyordum. */
  pastCont(v, p) {
    const st = verb.pres(v, 2);
    return p === 5 ? `${st}lardı` : k(`${st}du`, p);
  },
  /** Давнопрошедшее: gelmiştim. */
  plup(v, p) {
    const st = verb.evid(v, 2);
    return p === 5 ? `${st}l${h2(st)}rd${h4(st + h2(st))}` : k(`${st}t${h4(st)}`, p);
  },
  /** Будущее в прошедшем: gelecektim. */
  futPast(v, p) {
    const st = verb.fut(v, 2);
    return p === 5 ? `${st}l${h2(st)}rd${h4(h2(st))}` : k(`${st}t${h4(st)}`, p);
  },
  /** Условное с широким временем: gelirsem. */
  condAor(v, p) {
    const st = `${v.aor}s${h2(v.aor)}`;
    return p === 5 ? `${v.aor}l${h2(v.aor)}rs${h2(v.aor)}` : k(st, p);
  },
  /** Нереальное условие в прошлом: gelseydim. */
  condPast(v, p) {
    const st = `${v.s}s${h2(v.s)}yd${h4(v.s + h2(v.s))}`;
    return p === 5 ? `${v.s}s${h2(v.s)}l${h2(v.s)}rd${h4(h2(v.s))}` : k(st, p);
  },
};
verb.PERS = PERS;

// ---------- Причастия и деепричастия ----------
export const part = {
  /** Субъектное причастие: gelen, okuyan, giden. */
  en: (v) => `${v.yi ? `${v.s[0]}iy` : yStem(v)}${h2(v.s)}n`,
  /** Объектное причастие -dik + принадлежность: geldiğim, yaptığın. */
  dik: (v, p) => {
    const st = `${v.s}${D(v.s)}${h4(v.s)}`;
    const x = h4(st);
    return [`${st}ğ${x}m`, `${st}ğ${x}n`, `${st}ğ${x}`, `${st}ğ${x}m${x}z`, `${st}ğ${x}n${x}z`][p];
  },
  /** Будущее причастие + принадлежность: okuyacağım. */
  ecek: (v, p) => {
    const st = `${v.yi ? `${v.s[0]}iy` : yStem(v)}${h2(v.s)}c${h2(v.s)}`;
    const x = h4(st);
    return [`${st}ğ${x}m`, `${st}ğ${x}n`, `${st}ğ${x}`, `${st}ğ${x}m${x}z`, `${st}ğ${x}n${x}z`][p];
  },
  /** -meden: gelmeden. */
  meden: (v) => `${v.s}m${h2(v.s)}d${h2(v.s)}n`,
  /** -dikten: geldikten, yaptıktan. */
  dikten: (v) => {
    const st = `${v.s}${D(v.s)}${h4(v.s)}k`;
    return `${st}t${h2(st)}n`;
  },
  /** -ince: gelince, okuyunca, gidince. */
  ince: (v) => `${v.yi ? `${v.s[0]}iy` : yStem(v)}${h4(v.s)}nc${h2(v.s)}`,
  /** -erken: gelirken. */
  erken: (v) => `${v.aor}ken`,
  /** -erek: gelerek, okuyarak. */
  erek: (v) => `${v.yi ? `${v.s[0]}iy` : yStem(v)}${h2(v.s)}r${h2(v.s)}k`,
  /** -mesine (rağmen) с принадлежностью: çalışmama, çalışmasına. */
  mesine: (v, p) => {
    const st = `${v.s}m${h2(v.s)}`;
    const x = h4(st);
    return [`${st}m${h2(st)}`, `${st}n${h2(st)}`, `${st}s${x}n${h2(st)}`, `${st}m${x}z${h2(st)}`, `${st}n${x}z${h2(st)}`][p];
  },
  /** Пассив: yap → yapıl, oku → okun, bil → bilin. */
  passive: (v) => (v.pass ? v.pass : endsVowel(v.s) ? `${v.s}n` : /l$/.test(v.s) ? `${vowelStem(v)}${h4(v.s)}n` : `${vowelStem(v)}${h4(v.s)}l`),
  /** Понудительный залог: yap → yaptır, temizle → temizlet. */
  caus: (v) => (v.caus ? v.caus : endsVowel(v.s) || (/[rl]$/.test(v.s) && (v.s.match(/[aeıioöuü]/g) ?? []).length > 1) ? `${v.s}t` : `${v.s}${D(v.s)}${h4(v.s)}r`),
};
