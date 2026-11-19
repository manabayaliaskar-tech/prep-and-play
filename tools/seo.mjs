// Страницы для поисковиков: при сборке создаём обычные HTML-страницы с текстом, которые Google и Яндекс
// читают сразу, без запуска кода сайта. Сам сайт (игра) открывается по кнопке «Начать».
//
//   /exams/<экзамен>/   - страница экзамена: о формате, предметы, режимы, ссылки на уроки
//   /lessons/<тема>/    - урок: правило, формулы, пример, вопрос «проверь себя»
//   /exams/, /lessons/  - списки
//   sitemap.xml, robots.txt, мета-теги главной (адрес, превью для ссылок)
//
// Адрес сайта - в tools/site.json. Сменили домен - поменяли одну строку.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { COURSES } from '../src/catalog/index.js';
import { MOCKS } from '../src/catalog/mocks.js';
import { LESSONS } from '../src/content/lessons/index.js';
import { SKILLS, DOMAINS } from '../src/content/skills.js';
import { TOPIC_NAMES } from '../src/pools/topic-names.js';

const SITE = JSON.parse(readFileSync(new URL('./site.json', import.meta.url), 'utf8')).url.replace(/\/?$/, '/');
const LANG = 'ru';
const tx = (v) => (v && typeof v === 'object' ? (v[LANG] ?? v.en) : (v ?? ''));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

// ---------- Темы и адреса уроков ----------

const topicName = (id) => tx(SKILLS[id]?.name ?? TOPIC_NAMES[id]?.[1] ?? id);
const topicNameEn = (id) => (SKILLS[id]?.name ?? TOPIC_NAMES[id]?.[1])?.en ?? id;

const slugs = new Map();
{
  const used = new Set();
  for (const id of Object.keys(LESSONS)) {
    let s = (SKILLS[id] ? 'sat-' : '') + slugify(topicNameEn(id));
    if (!s || used.has(s)) s = `${s || 'topic'}-${slugify(id)}`;
    used.add(s);
    slugs.set(id, s);
  }
}
const lessonPath = (id) => `lessons/${slugs.get(id)}/`;
const examPath = (c) => `exams/${c.id}/`;

/** Курсы, где встречается тема: для ссылки «Тренироваться». */
const coursesOf = new Map();
for (const c of COURSES) for (const tr of c.tracks) for (const [tp] of tr.spec) if (!coursesOf.has(tp)) coursesOf.set(tp, { c, tr });

/** Раздел для списка уроков. */
const AREAS = [
  ['sat', 'SAT'],
  ['m', 'Математика'],
  ['o', 'Олимпиадная математика'],
  ['p', 'Физика'],
  ['c', 'Химия'],
  ['b', 'Биология'],
  ['g', 'География'],
  ['i', 'Информатика'],
  ['e', 'Английский язык'],
  ['es', 'Испанский язык'],
  ['fr', 'Французский язык'],
  ['zh', 'Китайский язык'],
  ['l', 'Русский язык и ОРТ'],
  ['r', 'Чтение'],
  ['li', 'Аудирование'],
  ['h', 'История'],
  ['s', 'Обществознание'],
  ['code', 'Программирование'],
  ['py', 'Python'],
  ['js', 'JavaScript'],
  ['cpp', 'C++'],
  ['java', 'Java'],
];
const areaOf = (id) => (SKILLS[id] ? 'sat' : id.split('.')[0]);

// ---------- Оформление ----------

const CSS = `
:root{--p:#6c4cf5;--ink:#1e1b3a;--muted:#6b6890;--line:#e7e3f7;--bg:#f5f3ff;--card:#fff}
*{box-sizing:border-box}body{margin:0;font-family:Nunito,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--bg);line-height:1.6}
a{color:var(--p)}header{background:var(--card);border-bottom:1px solid var(--line)}
.wrap{max-width:900px;margin:0 auto;padding:16px}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.logo{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.2rem;color:var(--ink);text-decoration:none}
.logo i{width:32px;height:32px;border-radius:10px;background:var(--p);display:grid;place-items:center;color:#fff;font-style:normal;font-size:14px}
.btn{display:inline-block;background:var(--p);color:#fff;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:14px;box-shadow:0 4px 0 #4f31d6}
.btn.small{padding:8px 14px;font-size:14px}
h1{font-size:clamp(1.6rem,4vw,2.3rem);line-height:1.2;margin:18px 0 8px}
h2{margin:28px 0 10px;font-size:1.3rem}
.lead{font-size:1.1rem;color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin:14px 0}
.rule{font-size:1.1rem;font-weight:600;border-left:4px solid var(--p);padding-left:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.grid a{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 14px;text-decoration:none;color:var(--ink);font-weight:700}
.grid a small{display:block;color:var(--muted);font-weight:600}
.crumbs{font-size:14px;color:var(--muted);margin-top:12px}
.cta{margin:22px 0}
footer{margin:40px 0 20px;color:var(--muted);font-size:14px;text-align:center}
details summary{cursor:pointer;font-weight:700;color:var(--p)}
ul,ol{padding-left:22px}
`;

function page({ path, title, description, body, crumbs = [] }) {
  const url = SITE + path;
  const root = path ? '../'.repeat(path.split('/').filter(Boolean).length) : './';
  return `<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${url}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Prep&amp;Play"/>
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
</head>
<body>
<header><div class="wrap top"><a class="logo" href="${root}"><i>▶</i>Prep&amp;Play</a><a class="btn small" href="${root}">Начать бесплатно</a></div></header>
<main class="wrap">
${crumbs.length ? `<nav class="crumbs">${crumbs.map(([href, label]) => (href ? `<a href="${root}${href}">${esc(label)}</a>` : esc(label))).join(' › ')}</nav>` : ''}
${body}
</main>
<footer class="wrap">Prep&amp;Play - подготовка к экзаменам в виде игры · <a href="${root}exams/">Экзамены</a> · <a href="${root}lessons/">Уроки</a> · <a href="${root}#/privacy">Конфиденциальность</a></footer>
</body>
</html>
`;
}

// ---------- Страницы ----------

function lessonPage(id) {
  const les = LESSONS[id];
  const name = topicName(id);
  const where = coursesOf.get(id);
  const practice = SKILLS[id] ? '#/map' : where ? `#/c/${where.c.id}/${where.tr.id}` : '#/practice';
  const rightOpt = tx(les.check.options[les.check.answer]);
  const desc = `${name}: ${strip(tx(les.rule))}`.slice(0, 158);
  const area = AREAS.find(([k]) => k === areaOf(id))?.[1] ?? 'Уроки';
  return page({
    path: lessonPath(id),
    title: `${name} - правило, формулы и пример | Prep&Play`,
    description: desc,
    crumbs: [['lessons/', 'Уроки'], [null, area]],
    body: `
<h1>${esc(name)}</h1>
<p class="rule">${esc(tx(les.rule))}</p>
${les.points?.length ? `<h2>Главное</h2><ul>${les.points.map((p) => `<li>${esc(tx(p))}</li>`).join('')}</ul>` : ''}
<div class="card"><h2 style="margin-top:0">Пример</h2><p><b>${esc(tx(les.example.q))}</b></p><ol>${les.example.steps.map((s) => `<li>${esc(tx(s))}</li>`).join('')}</ol></div>
<div class="card"><h2 style="margin-top:0">Проверь себя</h2><p><b>${esc(tx(les.check.q))}</b></p><ul>${les.check.options.map((o) => `<li>${esc(tx(o))}</li>`).join('')}</ul>
<details><summary>Показать ответ</summary><p>Правильно: <b>${esc(rightOpt)}</b>. ${esc(tx(les.check.why))}</p></details></div>
<p class="cta"><a class="btn" href="../../${practice}">Решать задания по теме бесплатно →</a></p>
${where && !SKILLS[id] ? `<p>Тема входит в: <a href="../../${examPath(where.c)}">${esc(tx(where.c.name))}</a>${where.c.group === 'exams' ? '' : ''}.</p>` : ''}`,
  });
}

function examPage(c) {
  const name = tx(c.name);
  const mock = MOCKS[c.id];
  const topics = [...new Set(c.tracks.flatMap((tr) => tr.spec.map(([tp]) => tp)))];
  const lessonsHere = (c.id === 'sat' ? Object.keys(SKILLS) : topics).filter((id) => LESSONS[id]);
  const subjects = c.id === 'sat' ? Object.values(DOMAINS).map((d) => tx(d.name)) : c.tracks.map((tr) => tx(tr.name));
  const app = c.id === 'sat' ? '#/sat' : `#/c/${c.id}`;
  const desc = `Подготовка к ${name} онлайн бесплатно: ${subjects.slice(0, 5).join(', ')}. Задания с разбором, пробный экзамен, уроки и шпаргалки.`.slice(0, 158);
  return page({
    path: examPath(c),
    title: `Подготовка к ${name} онлайн бесплатно - задания и пробный тест | Prep&Play`,
    description: desc,
    crumbs: [['exams/', 'Экзамены'], [null, name]],
    body: `
<h1>Подготовка к ${esc(name)} онлайн</h1>
<p class="lead">${esc(tx(c.full))}. ${esc(tx(c.about))}</p>
<p class="cta"><a class="btn" href="../../${app}">Начать подготовку бесплатно →</a></p>
<h2>Предметы и разделы</h2>
<ul>${subjects.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
${mock ? `<h2>Пробный экзамен</h2><p>Пробный ${esc(name)} целиком: разделы по порядку, таймер на каждый, итог по шкале экзамена. Можно пройти короткую версию.</p>` : ''}
<h2>Как устроена подготовка</h2>
<ul>
<li>Путь к максимальному баллу: острова-предметы, на каждом уровни от лёгких к сложным и босс.</li>
<li>Мини-урок перед заданиями: правило, пример и вопрос «проверь себя».</li>
<li>Разбор каждой ошибки по шагам и объяснение, почему ответ неверный.</li>
<li>Режимы: дуэль с другом, выживание, блиц, слабые места, задание дня.</li>
<li>Задания не повторяются, пока не пройдена вся тема. Объяснения на русском, казахском и английском.</li>
</ul>
${lessonsHere.length ? `<h2>Уроки и правила</h2><div class="grid">${lessonsHere.map((id) => `<a href="../../${lessonPath(id)}">${esc(topicName(id))}</a>`).join('')}</div>` : ''}
${c.official ? `<p class="crumbs">Официальный сайт экзамена: <a href="${esc(c.official.url)}" rel="noopener">${esc(c.official.label)}</a>. Задания Prep&amp;Play авторские.</p>` : ''}`,
  });
}

function examsIndex(list) {
  return page({
    path: 'exams/',
    title: 'Подготовка к экзаменам онлайн: ЕНТ, ЕГЭ, ОГЭ, SAT, IELTS, TOEFL | Prep&Play',
    description: 'Бесплатная подготовка к ЕНТ, ЕГЭ, ОГЭ, SAT, IELTS, TOEFL, HSK, ЦТ, ДТМ, ОРТ и другим экзаменам в виде игры: задания с разбором, уроки, пробные тесты.',
    body: `<h1>Подготовка к экзаменам</h1><p class="lead">Выбери экзамен - внутри предметы, уроки, пробный тест и игровые режимы.</p>
<div class="grid">${list.map((c) => `<a href="../${examPath(c)}">${esc(tx(c.name))}<small>${esc(tx(c.full))}</small></a>`).join('')}</div>`,
  });
}

function lessonsIndex() {
  const groups = AREAS.map(([k, label]) => [label, Object.keys(LESSONS).filter((id) => areaOf(id) === k)]).filter(([, ids]) => ids.length);
  return page({
    path: 'lessons/',
    title: 'Уроки и правила по всем предметам - коротко и с примерами | Prep&Play',
    description: `${Object.keys(LESSONS).length} коротких уроков: математика, физика, химия, биология, английский, история и другие. Правило, формулы, пример и вопрос для самопроверки.`,
    body: `<h1>Уроки и правила</h1><p class="lead">Короткие уроки по каждой теме: главное правило, формулы, разобранный пример и вопрос «проверь себя».</p>
${groups.map(([label, ids]) => `<h2>${esc(label)}</h2><div class="grid">${ids.map((id) => `<a href="../${lessonPath(id)}">${esc(topicName(id))}</a>`).join('')}</div>`).join('')}`,
  });
}

// ---------- Сборка ----------

export function buildSeo(out) {
  const write = (path, html) => {
    mkdirSync(`${out}/${path}`, { recursive: true });
    writeFileSync(`${out}/${path}index.html`, html);
  };
  const exams = COURSES.filter((c) => c.group === 'exams');
  const urls = [''];
  for (const id of Object.keys(LESSONS)) {
    write(lessonPath(id), lessonPage(id));
    urls.push(lessonPath(id));
  }
  for (const c of exams) {
    write(examPath(c), examPage(c));
    urls.push(examPath(c));
  }
  write('exams/', examsIndex(exams));
  write('lessons/', lessonsIndex());
  urls.push('exams/', 'lessons/');

  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(
    `${out}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`,
  );
  writeFileSync(`${out}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

  // Главная: адрес, превью для ссылок в мессенджерах, ссылки на страницы для поисковиков.
  const html = readFileSync(`${out}/index.html`, 'utf8')
    .replace(
      '<meta name="theme-color" content="#6c4cf5" />',
      `<meta name="theme-color" content="#6c4cf5" />\n    <link rel="canonical" href="${SITE}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:url" content="${SITE}" />\n    <meta property="og:image" content="${SITE}icons/og-image.png" />\n    <meta name="twitter:card" content="summary_large_image" />`,
    )
    .replace('</body>', `    <noscript><p><a href="exams/">Экзамены</a> · <a href="lessons/">Уроки</a></p></noscript>\n  </body>`);
  writeFileSync(`${out}/index.html`, html);
  return urls.length;
}

export { SITE, slugs };
