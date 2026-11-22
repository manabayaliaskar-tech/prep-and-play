// Озвучка слов голосом браузера (Web Speech API): работает без интернета и сервера.
// Выбираем самый естественный голос нужного языка из тех, что есть на устройстве
// (Google, Siri, Microsoft Natural и т. п.). Если голоса нет - кнопка не показывается.

import { getEnVariant } from './en-variant.js';

// Английский звучит с британским или американским акцентом - как выбрано в курсе английского.
const LOCALES = { es: 'es-ES', fr: 'fr-FR', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', de: 'de-DE', tr: 'tr-TR' };
const LOCALE = new Proxy(LOCALES, { get: (o, k) => (k === 'en' ? (getEnVariant() === 'us' ? 'en-US' : 'en-GB') : o[k]) });
const synth = () => globalThis.speechSynthesis ?? null;

/** Оценка голоса: чем выше, тем естественнее звучит. */
function score(v, locale) {
  const name = v.name.toLowerCase();
  let s = 0;
  if (v.lang === locale || v.lang.replace('_', '-') === locale) s += 3;
  if (/natural|neural|premium|enhanced|siri/.test(name)) s += 6;
  if (/google/.test(name)) s += 4;
  if (/microsoft|samantha|daniel|monica|amelie|thomas|tingting|ting-ting/.test(name)) s += 2;
  if (/compact|espeak/.test(name)) s -= 5;
  return s;
}

let cache = {};
export function voiceFor(lang) {
  const s = synth();
  const locale = LOCALE[lang];
  if (!s || !locale) return null;
  if (cache[locale] !== undefined) return cache[locale];
  const prefix = locale.slice(0, 2);
  const voices = s.getVoices().filter((v) => v.lang?.replace('_', '-').toLowerCase().startsWith(prefix));
  const best = voices.sort((a, b) => score(b, locale) - score(a, locale))[0] ?? null;
  // Пока браузер не загрузил список голосов, не запоминаем пустой результат.
  if (s.getVoices().length) cache[locale] = best;
  return best;
}

if (synth()) synth().onvoiceschanged = () => (cache = {});

/** Можно ли озвучить этот язык на этом устройстве. */
export function canSpeak(lang) {
  const s = synth();
  if (!s || !LOCALE[lang]) return false;
  // Список голосов ещё не загружен - скорее всего голос есть (так бывает в Chrome при первом открытии).
  return s.getVoices().length === 0 || Boolean(voiceFor(lang));
}

/** Убирает подсказки в скобках, кавычки и пропуски, чтобы голос читал только само слово или фразу. */
export function speakable(text) {
  return String(text ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[«»"“”]/g, '')
    .replace(/_{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speak(text, lang) {
  const s = synth();
  const clean = speakable(text);
  if (!s || !clean || !LOCALE[lang]) return false;
  s.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = LOCALE[lang];
  const v = voiceFor(lang);
  if (v) u.voice = v;
  u.rate = lang === 'zh' ? 0.8 : 0.9;
  s.speak(u);
  return true;
}

/** Текст для озвучки после ответа: предложение с вставленным правильным ответом или сам ответ. */
export function answerSpeech(q) {
  const v = q?.voice;
  if (!v) return null;
  if (v.after) return v.after;
  const right = q.choices?.[q.answer];
  if (right == null) return null;
  const answer = typeof right === 'string' ? right : (right.en ?? '');
  const passage = typeof q.passage === 'string' ? q.passage : null;
  return passage && /_{3,}/.test(passage) ? passage.replace(/_{3,}/, speakable(answer)) : answer;
}

/** Кнопка 🔊. Внутри другой кнопки (карточка слова) нужен span: кнопки нельзя вкладывать друг в друга. */
export function sayButton(text, lang, cls = '', inline = false) {
  if (!canSpeak(lang)) return '';
  const attrs = `class="say-btn ${cls}" data-say="${encodeURIComponent(speakable(text))}" data-say-lang="${lang}" aria-label="🔊"`;
  return inline ? `<span role="button" tabindex="0" ${attrs}>🔊</span>` : `<button type="button" ${attrs}>🔊</button>`;
}

/** Один обработчик нажатий на все кнопки 🔊 сайта. */
export function bindSayButtons(doc = document) {
  doc.addEventListener('click', (e) => {
    const b = e.target.closest?.('[data-say]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    if (speak(decodeURIComponent(b.dataset.say), b.dataset.sayLang)) {
      b.classList.remove('is-speaking');
      void b.offsetWidth;
      b.classList.add('is-speaking');
    }
  }, true);
}

/** Останавливает любую озвучку (при переходе к следующему заданию или уходе со страницы). */
export function stopSpeech() {
  synth()?.cancel();
}

const FEMALE = /female|samantha|victoria|karen|moira|tessa|zira|jenny|aria|libby|sonia|serena|kate|susan|fiona|hazel|emma|olivia|natasha/;
const MALE = /\bmale|daniel|alex\b|fred|david|guy|ryan|george|arthur|oliver|thomas|james|mark|rishi|tom\b/;

/**
 * Голоса для говорящих записи: { A: voice, B: voice }. Стараемся дать разным людям разные голоса
 * и подобрать пол по подсказке ('f' / 'm'). Если голос один - у всех он.
 */
export function voicesFor(lang, speakers) {
  const s = synth();
  const locale = LOCALE[lang];
  if (!s || !locale) return {};
  const prefix = locale.slice(0, 2);
  const all = s.getVoices().filter((v) => v.lang?.replace('_', '-').toLowerCase().startsWith(prefix)).sort((a, b) => score(b, locale) - score(a, locale));
  const out = {};
  const used = new Set();
  for (const [who, sex] of Object.entries(speakers)) {
    const want = sex === 'm' ? MALE : FEMALE;
    const v = all.find((x) => !used.has(x.name) && want.test(x.name.toLowerCase())) ?? all.find((x) => !used.has(x.name)) ?? all[0] ?? null;
    if (v) {
      out[who] = v;
      used.add(v.name);
    }
  }
  return out;
}
