// Страницы для поисковиков: при сборке создаём обычные HTML-страницы с текстом, которые Google и Яндекс
// читают сразу, без запуска кода сайта. Сам сайт (игра) открывается по кнопке «Начать».
//
// Три языка: русский в корне, английский в /en/, казахский в /kk/. Страницы ссылаются друг на друга
// (hreflang), поэтому запрос на казахском находит казахскую страницу.
//
//   <яз>/exams/<экзамен>/  - экзамен: о формате, предметы, примеры заданий с решением, частые вопросы, уроки
//   <яз>/lessons/<тема>/   - урок: правило, пример, «проверь себя», 6 заданий с решением, похожие темы
//   <яз>/exams/, <яз>/lessons/ - списки
//   sitemap.xml, robots.txt, мета-теги и разметка schema.org на главной
//
// Задания на страницах создаются теми же генераторами, что и в игре, с постоянным зерном:
// при каждой сборке на странице одни и те же задания.
//
// Адрес сайта - в tools/site.json. Сменили домен - поменяли одну строку.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { COURSES } from '../src/catalog/index.js';
import { MOCKS } from '../src/catalog/mocks.js';
import { LESSONS } from '../src/content/lessons/index.js';
import { SKILLS, DOMAINS } from '../src/content/skills.js';
import { TOPIC_NAMES } from '../src/pools/topic-names.js';
import { TOPICS } from '../src/pools/topics.js';
import { buildSet } from '../src/content/bank.js';
import { createRng, hashString, pick } from '../src/core/random.js';

const SITE = JSON.parse(readFileSync(new URL('./site.json', import.meta.url), 'utf8')).url.replace(/\/?$/, '/');
const LANGS = ['ru', 'en', 'kk'];
const PREFIX = { ru: '', en: 'en/', kk: 'kk/' };
const LOCALE = { ru: 'ru_RU', en: 'en_US', kk: 'kk_KZ' };
const SAMPLES = 6;

const tx = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.en ?? v.ru) : (v ?? ''));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Текст задания с простой разметкой (курсив, степени, индексы): остальное экранируем. */
const ALLOWED = /<(\/?)(i|b|em|strong|sup|sub)(?:\s[^>]*)?>|<br\s*\/?>/gi;
function rich(s) {
  const keep = [];
  const marked = String(s).replace(ALLOWED, (m, close, tag) => {
    keep.push(tag ? `<${close}${tag.toLowerCase()}>` : '<br>');
    return `\u0000${keep.length - 1}\u0000`;
  });
  return esc(marked).replace(/\u0000(\d+)\u0000/g, (m, i) => keep[i]);
}

// ---------- Тексты страниц на трёх языках ----------

const UI = {
  ru: {
    start: 'Начать бесплатно',
    exams: 'Экзамены',
    lessons: 'Уроки',
    privacy: 'Конфиденциальность',
    footer: 'Prep&Play - подготовка к экзаменам в виде игры',
    main: 'Главное',
    example: 'Пример',
    check: 'Проверь себя',
    showAnswer: 'Показать ответ',
    correct: 'Правильно',
    practice: 'Решать задания по теме бесплатно →',
    samples: 'Примеры заданий с решением',
    samplesLead: 'Такие задания ждут тебя в игре. В игре они каждый раз новые.',
    task: 'Задание',
    answerSol: 'Ответ и решение',
    answer: 'Ответ',
    related: 'Похожие темы',
    inExams: 'Тема встречается в экзаменах',
    otherExams: 'Другие экзамены',
    subjects: 'Предметы и разделы',
    mockH: 'Пробный экзамен',
    mockText: (n) => `Пробный ${n} целиком: разделы по порядку, таймер на каждый, итог по шкале экзамена. Можно пройти короткую версию.`,
    howH: 'Как устроена подготовка',
    how: [
      'Путь к максимальному баллу: острова-предметы, на каждом уровни от лёгких к сложным и босс.',
      'Мини-урок перед заданиями: правило, пример и вопрос «проверь себя».',
      'Разбор каждой ошибки по шагам и объяснение, почему ответ неверный.',
      'Режимы: дуэль с другом, выживание, блиц, слабые места, задание дня.',
      'Задания не повторяются, пока не пройдена вся тема. Объяснения на русском, казахском и английском.',
    ],
    lessonsRules: 'Уроки и правила',
    official: 'Официальный сайт экзамена',
    original: 'Задания Prep&Play авторские.',
    startPrep: 'Начать подготовку бесплатно →',
    faq: 'Частые вопросы',
    examH1: (n) => `Подготовка к ${n} онлайн`,
    examTitle: (n) => `Подготовка к ${n} онлайн бесплатно - тесты и задания с ответами | Prep&Play`,
    examDesc: (n, s) => `Подготовка к ${n} онлайн бесплатно: ${s}. Задания с разбором, пробный экзамен, уроки и шпаргалки.`,
    lessonTitle: (n) => `${n}: правило, формулы и примеры с решением | Prep&Play`,
    examsTitle: 'Подготовка к экзаменам онлайн: ЕНТ, ЕГЭ, ОГЭ, SAT, IELTS, TOEFL | Prep&Play',
    examsDesc: 'Бесплатная подготовка к ЕНТ, ЕГЭ, ОГЭ, SAT, IELTS, TOEFL, HSK, ЦТ, ДТМ, ОРТ и другим экзаменам в виде игры: задания с разбором, уроки, пробные тесты.',
    examsH1: 'Подготовка к экзаменам',
    examsLead: 'Выбери экзамен - внутри предметы, уроки, пробный тест и игровые режимы.',
    lessonsTitle: 'Уроки и правила по всем предметам - коротко и с примерами | Prep&Play',
    lessonsDesc: (n) => `${n} коротких уроков: математика, физика, химия, биология, английский, история и другие. Правило, формулы, пример и задания с решением.`,
    lessonsH1: 'Уроки и правила',
    lessonsLead: 'Короткие уроки по каждой теме: главное правило, формулы, разобранный пример и задания с решением.',
    faqItems: ({ name, subjects, mock, topics }) => [
      [`Сколько стоит подготовка к ${name}?`, 'Бесплатно. Все задания, уроки, разборы ошибок и пробные тесты доступны без оплаты.'],
      [`Какие предметы есть в подготовке к ${name}?`, `${subjects.join(', ')}.`],
      [
        `Есть ли пробный ${name}?`,
        mock
          ? 'Да. Пробный экзамен проходит целиком: разделы по порядку, таймер и итог по шкале экзамена.'
          : 'Есть тренировочные наборы по каждому разделу и режим «экзамен через N дней» с планом подготовки.',
      ],
      ['На каком языке объяснения?', 'На русском, казахском и английском. Язык переключается в любой момент.'],
      ['Нужна ли регистрация?', 'Нет, можно начать сразу. Аккаунт по почте нужен только чтобы сохранить прогресс в облаке и заниматься с разных устройств.'],
      ['Сколько тем и заданий?', `${topics} тем с короткими уроками. Задания создаются заново и не повторяются, пока не пройдена вся тема.`],
    ],
  },
  en: {
    start: 'Start for free',
    exams: 'Exams',
    lessons: 'Lessons',
    privacy: 'Privacy',
    footer: 'Prep&Play - exam prep as a game',
    main: 'Key points',
    example: 'Example',
    check: 'Check yourself',
    showAnswer: 'Show answer',
    correct: 'Correct',
    practice: 'Practice this topic for free →',
    samples: 'Practice questions with solutions',
    samplesLead: 'Questions like these are waiting in the game. There they are new every time.',
    task: 'Question',
    answerSol: 'Answer and solution',
    answer: 'Answer',
    related: 'Related topics',
    inExams: 'This topic appears in',
    otherExams: 'Other exams',
    subjects: 'Subjects and sections',
    mockH: 'Full mock test',
    mockText: (n) => `A full ${n} mock: sections in order, a timer for each and a final score on the exam's scale. A short version is available too.`,
    howH: 'How it works',
    how: [
      'A path to the top score: subject islands with levels from easy to hard and a boss.',
      'A mini lesson before the questions: the rule, an example and a quick self-check.',
      'Every mistake explained step by step, including why your answer was wrong.',
      'Modes: duel with a friend, survival, blitz, weak spots, daily challenge.',
      'Questions do not repeat until you finish the whole topic. Explanations in English, Russian and Kazakh.',
    ],
    lessonsRules: 'Lessons and rules',
    official: 'Official exam website',
    original: 'Prep&Play questions are original.',
    startPrep: 'Start practicing for free →',
    faq: 'FAQ',
    examH1: (n) => `${n} prep online`,
    examTitle: (n) => `Free ${n} Prep Online - Practice Questions with Answers and Mock Test | Prep&Play`,
    examDesc: (n, s) => `Free ${n} prep online: ${s}. Practice questions with step-by-step solutions, a mock test, lessons and cheat sheets.`,
    lessonTitle: (n) => `${n}: Rules, Formulas and Worked Examples | Prep&Play`,
    examsTitle: 'Free Online Exam Prep: SAT, IELTS, TOEFL, UNT, HSK and more | Prep&Play',
    examsDesc: 'Free prep for SAT, IELTS, TOEFL, HSK, UNT and other exams as a game: practice questions with solutions, lessons and mock tests.',
    examsH1: 'Exam prep',
    examsLead: 'Pick an exam - inside are subjects, lessons, a mock test and game modes.',
    lessonsTitle: 'Lessons and Rules for Every Subject - Short, with Examples | Prep&Play',
    lessonsDesc: (n) => `${n} short lessons: math, physics, chemistry, biology, English, history and more. The rule, formulas, a worked example and practice questions.`,
    lessonsH1: 'Lessons and rules',
    lessonsLead: 'A short lesson for every topic: the key rule, formulas, a worked example and practice questions with solutions.',
    faqItems: ({ name, subjects, mock, topics }) => [
      [`How much does ${name} prep cost?`, 'Nothing. All questions, lessons, mistake reviews and mock tests are free.'],
      [`What subjects does the ${name} prep cover?`, `${subjects.join(', ')}.`],
      [
        `Is there a ${name} mock test?`,
        mock
          ? 'Yes. The mock runs in full: sections in order, a timer and a final score on the exam scale.'
          : 'There are practice sets for every section and an "exam in N days" mode with a study plan.',
      ],
      ['What language are the explanations in?', 'English, Russian and Kazakh. You can switch at any time.'],
      ['Do I need to sign up?', 'No, you can start right away. An email account is only needed to save progress in the cloud and study on several devices.'],
      ['How many topics and questions are there?', `${topics} topics with short lessons. Questions are generated fresh and do not repeat until you finish the whole topic.`],
    ],
  },
  kk: {
    start: 'Тегін бастау',
    exams: 'Емтихандар',
    lessons: 'Сабақтар',
    privacy: 'Құпиялылық',
    footer: 'Prep&Play - ойын түріндегі емтиханға дайындық',
    main: 'Ең бастысы',
    example: 'Мысал',
    check: 'Өзіңді тексер',
    showAnswer: 'Жауабын көрсету',
    correct: 'Дұрысы',
    practice: 'Тақырып бойынша тапсырмаларды тегін шешу →',
    samples: 'Шешімі бар тапсырма мысалдары',
    samplesLead: 'Ойында осындай тапсырмалар күтіп тұр. Онда олар әр жолы жаңа.',
    task: 'Тапсырма',
    answerSol: 'Жауабы мен шешімі',
    answer: 'Жауабы',
    related: 'Ұқсас тақырыптар',
    inExams: 'Бұл тақырып мына емтихандарда кездеседі',
    otherExams: 'Басқа емтихандар',
    subjects: 'Пәндер мен бөлімдер',
    mockH: 'Сынақ емтиханы',
    mockText: (n) => `${n} толық сынағы: бөлімдер ретімен, әрқайсысына таймер және емтихан шкаласы бойынша қорытынды балл. Қысқа нұсқасы да бар.`,
    howH: 'Дайындық қалай құрылған',
    how: [
      'Ең жоғары балға апаратын жол: пән-аралдар, әрқайсысында жеңілден қиынға дейінгі деңгейлер және босс.',
      'Тапсырмалар алдында шағын сабақ: ереже, мысал және «өзіңді тексер» сұрағы.',
      'Әр қатенің қадамдық талдауы және жауаптың неге қате екенін түсіндіру.',
      'Режимдер: доспен дуэль, аман қалу, блиц, әлсіз тұстар, күн тапсырмасы.',
      'Тақырып толық өтілмейінше тапсырмалар қайталанбайды. Түсіндірмелер қазақ, орыс және ағылшын тілдерінде.',
    ],
    lessonsRules: 'Сабақтар мен ережелер',
    official: 'Емтиханның ресми сайты',
    original: 'Prep&Play тапсырмалары авторлық.',
    startPrep: 'Дайындықты тегін бастау →',
    faq: 'Жиі қойылатын сұрақтар',
    examH1: (n) => `${n}: онлайн дайындық`,
    examTitle: (n) => `${n}: онлайн дайындық тегін - жауабы бар тесттер мен тапсырмалар | Prep&Play`,
    examDesc: (n, s) => `${n} емтиханына тегін онлайн дайындық: ${s}. Қадамдық шешімі бар тапсырмалар, сынақ тест, сабақтар мен шпаргалкалар.`,
    lessonTitle: (n) => `${n}: ереже, формулалар және шешілген мысалдар | Prep&Play`,
    examsTitle: 'Емтихандарға онлайн дайындық: ҰБТ, SAT, IELTS, TOEFL, HSK | Prep&Play',
    examsDesc: 'ҰБТ, SAT, IELTS, TOEFL, HSK және басқа емтихандарға ойын түрінде тегін дайындық: шешімі бар тапсырмалар, сабақтар, сынақ тесттер.',
    examsH1: 'Емтихандарға дайындық',
    examsLead: 'Емтиханды таңда - ішінде пәндер, сабақтар, сынақ тест және ойын режимдері бар.',
    lessonsTitle: 'Барлық пәндер бойынша сабақтар мен ережелер - қысқа әрі мысалдармен | Prep&Play',
    lessonsDesc: (n) => `${n} қысқа сабақ: математика, физика, химия, биология, ағылшын тілі, тарих және басқалар. Ереже, формулалар, мысал және шешімі бар тапсырмалар.`,
    lessonsH1: 'Сабақтар мен ережелер',
    lessonsLead: 'Әр тақырып бойынша қысқа сабақ: басты ереже, формулалар, талданған мысал және шешімі бар тапсырмалар.',
    faqItems: ({ name, subjects, mock, topics }) => [
      [`${name} дайындығы қанша тұрады?`, 'Тегін. Барлық тапсырмалар, сабақтар, қателерді талдау және сынақ тесттер ақысыз.'],
      [`${name} дайындығында қандай пәндер бар?`, `${subjects.join(', ')}.`],
      [
        `${name} сынағы бар ма?`,
        mock
          ? 'Иә. Сынақ емтиханы толық өтеді: бөлімдер ретімен, таймер және емтихан шкаласы бойынша қорытынды.'
          : 'Әр бөлім бойынша жаттығу жинақтары және дайындық жоспары бар «N күннен кейін емтихан» режимі бар.',
      ],
      ['Түсіндірмелер қай тілде?', 'Қазақ, орыс және ағылшын тілдерінде. Тілді кез келген уақытта ауыстыруға болады.'],
      ['Тіркелу керек пе?', 'Жоқ, бірден бастауға болады. Пошта арқылы аккаунт тек прогресті бұлтта сақтап, түрлі құрылғыда оқу үшін керек.'],
      ['Қанша тақырып пен тапсырма бар?', `Қысқа сабақтары бар ${topics} тақырып. Тапсырмалар жаңадан жасалады және тақырып толық өтілмейінше қайталанбайды.`],
    ],
  },
};

/** Разделы для списка уроков. */
const AREAS = [
  ['sat', { ru: 'SAT', en: 'SAT', kk: 'SAT' }],
  ['m', { ru: 'Математика', en: 'Mathematics', kk: 'Математика' }],
  ['o', { ru: 'Олимпиадная математика', en: 'Olympiad math', kk: 'Олимпиадалық математика' }],
  ['p', { ru: 'Физика', en: 'Physics', kk: 'Физика' }],
  ['c', { ru: 'Химия', en: 'Chemistry', kk: 'Химия' }],
  ['b', { ru: 'Биология', en: 'Biology', kk: 'Биология' }],
  ['g', { ru: 'География', en: 'Geography', kk: 'География' }],
  ['i', { ru: 'Информатика', en: 'Computer science', kk: 'Информатика' }],
  ['e', { ru: 'Английский язык', en: 'English', kk: 'Ағылшын тілі' }],
  ['es', { ru: 'Испанский язык', en: 'Spanish', kk: 'Испан тілі' }],
  ['fr', { ru: 'Французский язык', en: 'French', kk: 'Француз тілі' }],
  ['zh', { ru: 'Китайский язык', en: 'Chinese', kk: 'Қытай тілі' }],
  ['l', { ru: 'Русский язык и ОРТ', en: 'Russian language and ORT', kk: 'Орыс тілі және ОРТ' }],
  ['r', { ru: 'Чтение', en: 'Reading', kk: 'Оқу' }],
  ['li', { ru: 'Аудирование', en: 'Listening', kk: 'Тыңдалым' }],
  ['h', { ru: 'История', en: 'History', kk: 'Тарих' }],
  ['s', { ru: 'Обществознание', en: 'Social studies', kk: 'Қоғамтану' }],
  ['code', { ru: 'Программирование', en: 'Programming', kk: 'Бағдарламалау' }],
  ['py', { ru: 'Python', en: 'Python', kk: 'Python' }],
  ['js', { ru: 'JavaScript', en: 'JavaScript', kk: 'JavaScript' }],
  ['cpp', { ru: 'C++', en: 'C++', kk: 'C++' }],
  ['java', { ru: 'Java', en: 'Java', kk: 'Java' }],
];
const areaOf = (id) => (SKILLS[id] ? 'sat' : id.split('.')[0]);
const areaName = (id, lang) => tx(AREAS.find(([k]) => k === areaOf(id))?.[1], lang) || UI[lang].lessons;

// ---------- Темы, курсы и адреса ----------

const topicName = (id, lang) => tx(SKILLS[id]?.name ?? TOPIC_NAMES[id]?.[1] ?? id, lang);

const slugs = new Map();
{
  const used = new Set();
  for (const id of Object.keys(LESSONS)) {
    let s = (SKILLS[id] ? 'sat-' : '') + slugify(topicName(id, 'en'));
    if (!s || used.has(s)) s = `${s || 'topic'}-${slugify(id)}`;
    used.add(s);
    slugs.set(id, s);
  }
}
const lessonPath = (id) => `lessons/${slugs.get(id)}/`;
const examPath = (c) => `exams/${c.id}/`;

const EXAMS = COURSES.filter((c) => c.group === 'exams');
const examTopics = (c) => (c.id === 'sat' ? Object.keys(SKILLS) : [...new Set(c.tracks.flatMap((tr) => tr.spec.map(([tp]) => tp)))]);

/** Первый курс с темой: куда ведёт кнопка «Решать задания». */
const coursesOf = new Map();
for (const c of COURSES) for (const tr of c.tracks) for (const [tp] of tr.spec) if (!coursesOf.has(tp)) coursesOf.set(tp, { c, tr });

/** Все экзамены, где встречается тема. */
const examsOf = new Map();
for (const c of EXAMS) for (const tp of examTopics(c)) examsOf.set(tp, [...(examsOf.get(tp) ?? []), c]);

/** Уровни сложности темы из всех курсов. */
const keysOf = new Map();
for (const c of COURSES) for (const tr of c.tracks) for (const [tp, keys] of tr.spec) keysOf.set(tp, [...new Set([...(keysOf.get(tp) ?? []), ...keys])]);

// ---------- Примеры заданий ----------

function usable(q) {
  if (!q || !Array.isArray(q.choices) || q.choices.length < 2) return false;
  if (!Number.isInteger(q.answer) || !q.choices[q.answer]) return false;
  if (q.figure || q.table || q.listen || q.audio || q.media) return false;
  if (strip(tx(q.passage, 'en')).length > 900) return false;
  return Boolean(strip(tx(q.prompt, 'en')).trim() || strip(tx(q.passage, 'en')).trim());
}

/** Задания по списку тем по кругу. Зерно постоянное - на странице всегда одни и те же задания. */
const QUICK_OK = new Set(
  Object.keys(SKILLS).filter((id) => {
    try {
      return Boolean(buildSet({ rng: createRng(1), skills: [id], count: 1, quick: true, memory: false })[0]);
    } catch {
      return false;
    }
  }),
);

function samples(topics, n, seedKey) {
  const rng = createRng(hashString(seedKey));
  const seen = new Set();
  const out = [];
  for (let tries = 0; out.length < n && tries < n * 10; tries++) {
    const id = topics[tries % topics.length];
    let q = null;
    try {
      // Быстрые задания SAT (с вариантами ответа) есть не во всех навыках чтения - тогда берём обычные.
      if (SKILLS[id]) q = (QUICK_OK.has(id) ? buildSet({ rng, skills: [id], count: 1, quick: true, memory: false }) : buildSet({ rng, skills: [id], count: 1, memory: false }))[0];
      else if (TOPICS[id]) q = TOPICS[id].make({ rng, used: new Set(seen), state: {}, mcOnly: true }, pick(rng, keysOf.get(id) ?? [1, 2]));
    } catch {
      q = null;
    }
    if (!usable(q) || seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
  }
  return out;
}

function sampleHtml(qs, lang) {
  if (!qs.length) return '';
  const ui = UI[lang];
  const letter = (i) => 'ABCDEFGH'[i];
  return `<h2>${esc(ui.samples)}</h2><p>${esc(ui.samplesLead)}</p>
${qs
  .map((q, n) => {
    const passage = tx(q.passage, lang);
    const steps = tx(q.ex, lang);
    const list = Array.isArray(steps) ? steps : steps ? [steps] : [];
    const passageHtml = passage ? (/\n/.test(passage) ? `<pre>${esc(passage)}</pre>` : `<p class="passage">${rich(passage)}</p>`) : '';
    return `<div class="card q"><p class="qn">${esc(ui.task)} ${n + 1}</p>${passageHtml}<p><b>${rich(tx(q.prompt, lang))}</b></p>
<ol type="A">${q.choices.map((ch) => `<li>${rich(tx(ch, lang))}</li>`).join('')}</ol>
<details><summary>${esc(ui.answerSol)}</summary><p>${esc(ui.answer)}: <b>${letter(q.answer)}) ${rich(tx(q.choices[q.answer], lang))}</b></p>${
      list.length > 1 ? `<ol>${list.map((s) => `<li>${rich(s)}</li>`).join('')}</ol>` : list.length ? `<p>${rich(list[0])}</p>` : ''
    }</details></div>`;
  })
  .join('\n')}`;
}

// ---------- Разметка schema.org ----------

const ORG_ID = `${SITE}#org`;
const ORG = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Prep&Play',
  alternateName: ['PrepPlay', 'Prep Play', 'Prep and Play'],
  url: SITE,
  logo: `${SITE}icons/icon-512.png`,
  email: 'support@prepplay.app',
};
const ld = (data) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c')}</script>`;
const crumbsLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })),
});
const faqLd = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// ---------- Оформление ----------

const CSS = `
:root{--p:#6c4cf5;--ink:#1e1b3a;--muted:#6b6890;--line:#e7e3f7;--bg:#f5f3ff;--card:#fff}
*{box-sizing:border-box}body{margin:0;font-family:Nunito,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--bg);line-height:1.6}
a{color:var(--p)}header{background:var(--card);border-bottom:1px solid var(--line)}
.wrap{max-width:900px;margin:0 auto;padding:16px}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.logo{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.2rem;color:var(--ink);text-decoration:none}
.logo i{width:32px;height:32px;border-radius:10px;background:var(--p);display:grid;place-items:center;color:#fff;font-style:normal;font-size:14px}
.side{display:flex;align-items:center;gap:10px}
.langs{display:flex;gap:4px;font-weight:800;font-size:14px}.langs a,.langs b{padding:4px 8px;border-radius:8px;text-decoration:none}.langs b{background:var(--bg);color:var(--ink)}
.btn{display:inline-block;background:var(--p);color:#fff;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:14px;box-shadow:0 4px 0 #4f31d6}
.btn.small{padding:8px 14px;font-size:14px}
h1{font-size:clamp(1.6rem,4vw,2.3rem);line-height:1.2;margin:18px 0 8px}
h2{margin:28px 0 10px;font-size:1.3rem}
.lead{font-size:1.1rem;color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin:14px 0}
.qn{margin:0;color:var(--muted);font-weight:800;font-size:14px}.passage{background:var(--bg);border-radius:12px;padding:10px 12px}
pre{background:var(--bg);border-radius:12px;padding:10px 12px;overflow-x:auto;font-size:14px}
.rule{font-size:1.1rem;font-weight:600;border-left:4px solid var(--p);padding-left:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.grid a{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 14px;text-decoration:none;color:var(--ink);font-weight:700}
.grid a small{display:block;color:var(--muted);font-weight:600}
.crumbs{font-size:14px;color:var(--muted);margin-top:12px}
.cta{margin:22px 0}
.faq h3{font-size:1.05rem;margin:16px 0 4px}.faq p{margin:0}
footer{margin:40px 0 20px;color:var(--muted);font-size:14px;text-align:center}
details summary{cursor:pointer;font-weight:700;color:var(--p)}
ul,ol{padding-left:22px}
`;

/** Страница на одном языке. path - адрес без языковой папки: так же он выглядит на других языках. */
function page({ lang, path, title, description, body, crumbs = [], data = [] }) {
  const ui = UI[lang];
  const full = PREFIX[lang] + path;
  const url = SITE + full;
  const root = '../'.repeat(full.split('/').filter(Boolean).length) || './';
  const alt = (l) => SITE + PREFIX[l] + path;
  const app = (hash = '') => `${root}?lang=${lang}${hash ? `#${hash}` : ''}`;
  const crumbItems = [['Prep&Play', SITE], ...crumbs.filter(([href]) => href).map(([href, label]) => [label, SITE + PREFIX[lang] + href])];
  if (crumbs.length) crumbItems.push([title.split(' | ')[0], url]);
  const graph = [ORG, ...(crumbs.length ? [crumbsLd(crumbItems)] : []), ...data];
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${url}"/>
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${alt(l)}"/>`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${alt('en')}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Prep&amp;Play"/>
<meta property="og:locale" content="${LOCALE[lang]}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:image" content="${SITE}icons/og-image.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="theme-color" content="#6c4cf5"/>
<link rel="icon" href="${root}icons/favicon-32.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet"/>
<style>${CSS.replace(/\n/g, '')}</style>
${ld({ '@graph': graph })}
</head>
<body>
<header><div class="wrap top"><a class="logo" href="${app()}"><i>▶</i>Prep&amp;Play</a><div class="side"><nav class="langs" aria-label="Language">${LANGS.map((l) =>
    l === lang ? `<b>${l === 'kk' ? 'KZ' : l.toUpperCase()}</b>` : `<a href="${root}${PREFIX[l]}${path}" hreflang="${l}">${l === 'kk' ? 'KZ' : l.toUpperCase()}</a>`,
  ).join('')}</nav><a class="btn small" href="${app()}">${esc(ui.start)}</a></div></div></header>
<main class="wrap">
${crumbs.length ? `<nav class="crumbs">${crumbs.map(([href, label]) => (href ? `<a href="${root}${PREFIX[lang]}${href}">${esc(label)}</a>` : esc(label))).join(' › ')}</nav>` : ''}
${body({ root, app, lp: (p) => `${root}${PREFIX[lang]}${p}` })}
</main>
<footer class="wrap">${esc(ui.footer)} · <a href="${root}${PREFIX[lang]}exams/">${esc(ui.exams)}</a> · <a href="${root}${PREFIX[lang]}lessons/">${esc(ui.lessons)}</a> · <a href="${app('/privacy')}">${esc(ui.privacy)}</a></footer>
</body>
</html>
`.replace(/[—–]/g, '-');
}

// ---------- Страницы ----------

function lessonPage(id, lang) {
  const ui = UI[lang];
  const les = LESSONS[id];
  const name = topicName(id, lang);
  const where = coursesOf.get(id);
  const practice = SKILLS[id] ? '/map' : where ? `/c/${where.c.id}/${where.tr.id}` : '/practice';
  const rightOpt = tx(les.check.options[les.check.answer], lang);
  const description = `${name}: ${strip(tx(les.rule, lang))}`.slice(0, 158);
  const area = areaName(id, lang);
  const ids = Object.keys(LESSONS).filter((x) => areaOf(x) === areaOf(id));
  const at = ids.indexOf(id);
  const related = [...ids.slice(at + 1), ...ids.slice(0, at)].slice(0, 8);
  const exams = examsOf.get(id) ?? [];
  const qs = samples([id], SAMPLES, `lesson:${id}`);
  return page({
    lang,
    path: lessonPath(id),
    title: ui.lessonTitle(name),
    description,
    crumbs: [['lessons/', ui.lessons], [null, area]],
    data: [
      {
        '@type': 'LearningResource',
        name,
        description,
        learningResourceType: 'Lesson',
        inLanguage: lang,
        isAccessibleForFree: true,
        educationalUse: 'practice',
        about: area,
        publisher: { '@id': ORG_ID },
        url: SITE + PREFIX[lang] + lessonPath(id),
      },
    ],
    body: ({ app, lp }) => `
<h1>${esc(name)}</h1>
<p class="rule">${rich(tx(les.rule, lang))}</p>
${les.points?.length ? `<h2>${esc(ui.main)}</h2><ul>${les.points.map((p) => `<li>${rich(tx(p, lang))}</li>`).join('')}</ul>` : ''}
<div class="card"><h2 style="margin-top:0">${esc(ui.example)}</h2><p><b>${rich(tx(les.example.q, lang))}</b></p><ol>${les.example.steps.map((s) => `<li>${rich(tx(s, lang))}</li>`).join('')}</ol></div>
<div class="card"><h2 style="margin-top:0">${esc(ui.check)}</h2><p><b>${rich(tx(les.check.q, lang))}</b></p><ul>${les.check.options.map((o) => `<li>${rich(tx(o, lang))}</li>`).join('')}</ul>
<details><summary>${esc(ui.showAnswer)}</summary><p>${esc(ui.correct)}: <b>${rich(rightOpt)}</b>. ${rich(tx(les.check.why, lang))}</p></details></div>
<p class="cta"><a class="btn" href="${app(practice)}">${esc(ui.practice)}</a></p>
${sampleHtml(qs, lang)}
${qs.length ? `<p class="cta"><a class="btn" href="${app(practice)}">${esc(ui.practice)}</a></p>` : ''}
${exams.length ? `<h2>${esc(ui.inExams)}</h2><div class="grid">${exams.map((c) => `<a href="${lp(examPath(c))}">${esc(tx(c.name, lang))}<small>${esc(tx(c.full, lang))}</small></a>`).join('')}</div>` : ''}
${related.length ? `<h2>${esc(ui.related)}</h2><div class="grid">${related.map((x) => `<a href="${lp(lessonPath(x))}">${esc(topicName(x, lang))}</a>`).join('')}</div>` : ''}`,
  });
}

/** Темы экзамена по очереди из разных разделов: чтобы в примерах были все предметы. */
function interleave(c) {
  if (c.id === 'sat') return Object.keys(SKILLS);
  const lists = c.tracks.map((tr) => tr.spec.map(([tp]) => tp));
  const out = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length && !out.includes(l[i])) out.push(l[i]);
  return out;
}

function examPage(c, lang) {
  const ui = UI[lang];
  const name = tx(c.name, lang);
  const mock = MOCKS[c.id];
  const topics = examTopics(c);
  const lessonsHere = topics.filter((id) => LESSONS[id]);
  const subjects = c.id === 'sat' ? Object.values(DOMAINS).map((d) => tx(d.name, lang)) : c.tracks.map((tr) => tx(tr.name, lang));
  const appHash = c.id === 'sat' ? '/sat' : `/c/${c.id}`;
  const description = ui.examDesc(name, subjects.slice(0, 5).join(', ')).slice(0, 158);
  const faq = ui.faqItems({ name, subjects, mock: Boolean(mock), topics: topics.length });
  const qs = samples(interleave(c), SAMPLES, `exam:${c.id}`);
  return page({
    lang,
    path: examPath(c),
    title: ui.examTitle(name),
    description,
    crumbs: [['exams/', ui.exams], [null, name]],
    data: [
      {
        '@type': 'Course',
        name: ui.examH1(name),
        description,
        inLanguage: lang,
        isAccessibleForFree: true,
        provider: { '@id': ORG_ID },
        url: SITE + PREFIX[lang] + examPath(c),
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT15M' },
      },
      faqLd(faq),
    ],
    body: ({ app, lp }) => `
<h1>${esc(ui.examH1(name))}</h1>
<p class="lead">${esc(tx(c.full, lang))}. ${esc(tx(c.about, lang))}</p>
<p class="cta"><a class="btn" href="${app(appHash)}">${esc(ui.startPrep)}</a></p>
<h2>${esc(ui.subjects)}</h2>
<ul>${subjects.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
${mock ? `<h2>${esc(ui.mockH)}</h2><p>${esc(ui.mockText(name))}</p>` : ''}
${sampleHtml(qs, lang)}
${qs.length ? `<p class="cta"><a class="btn" href="${app(appHash)}">${esc(ui.startPrep)}</a></p>` : ''}
<h2>${esc(ui.howH)}</h2>
<ul>${ui.how.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
${lessonsHere.length ? `<h2>${esc(ui.lessonsRules)}</h2><div class="grid">${lessonsHere.map((id) => `<a href="${lp(lessonPath(id))}">${esc(topicName(id, lang))}</a>`).join('')}</div>` : ''}
<h2>${esc(ui.faq)}</h2>
<div class="faq">${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}</div>
<h2>${esc(ui.otherExams)}</h2>
<div class="grid">${EXAMS.filter((x) => x !== c)
      .map((x) => `<a href="${lp(examPath(x))}">${esc(tx(x.name, lang))}<small>${esc(tx(x.full, lang))}</small></a>`)
      .join('')}</div>
${c.official ? `<p class="crumbs">${esc(ui.official)}: <a href="${esc(c.official.url)}" rel="noopener">${esc(c.official.label)}</a>. ${esc(ui.original)}</p>` : ''}`,
  });
}

function examsIndex(lang) {
  const ui = UI[lang];
  return page({
    lang,
    path: 'exams/',
    title: ui.examsTitle,
    description: ui.examsDesc,
    body: ({ lp }) => `<h1>${esc(ui.examsH1)}</h1><p class="lead">${esc(ui.examsLead)}</p>
<div class="grid">${EXAMS.map((c) => `<a href="${lp(examPath(c))}">${esc(tx(c.name, lang))}<small>${esc(tx(c.full, lang))}</small></a>`).join('')}</div>`,
  });
}

function lessonsIndex(lang) {
  const ui = UI[lang];
  const groups = AREAS.map(([k, label]) => [tx(label, lang), Object.keys(LESSONS).filter((id) => areaOf(id) === k)]).filter(([, ids]) => ids.length);
  return page({
    lang,
    path: 'lessons/',
    title: ui.lessonsTitle,
    description: ui.lessonsDesc(Object.keys(LESSONS).length),
    body: ({ lp }) => `<h1>${esc(ui.lessonsH1)}</h1><p class="lead">${esc(ui.lessonsLead)}</p>
${groups.map(([label, ids]) => `<h2>${esc(label)}</h2><div class="grid">${ids.map((id) => `<a href="${lp(lessonPath(id))}">${esc(topicName(id, lang))}</a>`).join('')}</div>`).join('')}`,
  });
}

// ---------- Сборка ----------

export function buildSeo(out) {
  const urls = [''];
  const write = (lang, path, html) => {
    const full = PREFIX[lang] + path;
    mkdirSync(`${out}/${full}`, { recursive: true });
    writeFileSync(`${out}/${full}index.html`, html);
    urls.push(full);
  };
  for (const lang of LANGS) {
    for (const id of Object.keys(LESSONS)) write(lang, lessonPath(id), lessonPage(id, lang));
    for (const c of EXAMS) write(lang, examPath(c), examPage(c, lang));
    write(lang, 'exams/', examsIndex(lang));
    write(lang, 'lessons/', lessonsIndex(lang));
  }

  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(
    `${out}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`,
  );
  writeFileSync(`${out}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

  // Главная: адрес, превью для ссылок, разметка «сайт и организация» (название в выдаче),
  // ссылки на страницы для поисковиков.
  const site = {
    '@graph': [
      ORG,
      {
        '@type': 'WebSite',
        '@id': `${SITE}#website`,
        name: 'Prep&Play',
        alternateName: ORG.alternateName,
        url: SITE,
        inLanguage: LANGS,
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'WebApplication',
        name: 'Prep&Play',
        url: SITE,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
        publisher: { '@id': ORG_ID },
      },
    ],
  };
  const html = readFileSync(`${out}/index.html`, 'utf8')
    .replace(
      '<meta name="theme-color" content="#6c4cf5" />',
      `<meta name="theme-color" content="#6c4cf5" />\n    <link rel="canonical" href="${SITE}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="Prep&amp;Play" />\n    <meta property="og:url" content="${SITE}" />\n    <meta property="og:image" content="${SITE}icons/og-image.png" />\n    <meta name="twitter:card" content="summary_large_image" />\n    ${ld(site)}`,
    )
    .replace(
      '</body>',
      `    <noscript><p>${LANGS.map((l) => `<a href="${PREFIX[l]}exams/">${UI[l].exams}</a> · <a href="${PREFIX[l]}lessons/">${UI[l].lessons}</a>`).join(' · ')}</p></noscript>\n  </body>`,
    );
  writeFileSync(`${out}/index.html`, html);
  return urls.length;
}

export { SITE, slugs };
