// Физика и информатика: генераторы по таблицам «понятие → ответ».
// Физика — единицы измерения, формулы, учёные. Информатика — устройства, типы файлов, термины.
// Ключ сложности — 1…3: чем выше, тем реже встречающиеся понятия.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';

const rows = (text) => text.trim().split('\n').map((line) => line.split('|'));

function mcOf(rng, correct, wrong) {
  const all = [correct, ...wrong];
  const order = shuffle([0, 1, 2, 3], rng);
  return { choices: order.map((k) => all[k]), answer: order.indexOf(0) };
}

/** Три других, у которых все тексты отличаются от правильного и друг от друга. */
function distinct(rng, pool, correct, key) {
  const out = [];
  for (const x of shuffle(pool, rng)) {
    if (out.length === 3) break;
    if ([correct, ...out].every((y) => ['en', 'ru', 'kk'].every((l) => key(y)[l] !== key(x)[l]))) out.push(x);
  }
  return out;
}

// ---------- Физика ----------

// сложность|величина en|ru|kk|единица en|ru|kk
const UNITS = rows(`
1|force|сила|күш|newton (N)|ньютон (Н)|ньютон (Н)
1|work and energy|работа и энергия|жұмыс пен энергия|joule (J)|джоуль (Дж)|джоуль (Дж)
1|power|мощность|қуат|watt (W)|ватт (Вт)|ватт (Вт)
1|pressure|давление|қысым|pascal (Pa)|паскаль (Па)|паскаль (Па)
1|mass|масса|масса|kilogram (kg)|килограмм (кг)|килограмм (кг)
1|time|время|уақыт|second (s)|секунда (с)|секунд (с)
1|length|длина|ұзындық|metre (m)|метр (м)|метр (м)
1|speed|скорость|жылдамдық|metre per second (m/s)|метр в секунду (м/с)|секундына метр (м/с)
2|electric current|сила тока|ток күші|ampere (A)|ампер (А)|ампер (А)
2|voltage|напряжение|кернеу|volt (V)|вольт (В)|вольт (В)
2|electrical resistance|электрическое сопротивление|электр кедергісі|ohm (Ω)|ом (Ом)|ом (Ом)
2|electric charge|электрический заряд|электр заряды|coulomb (C)|кулон (Кл)|кулон (Кл)
2|frequency|частота|жиілік|hertz (Hz)|герц (Гц)|герц (Гц)
2|density|плотность|тығыздық|kilogram per cubic metre (kg/m³)|килограмм на кубический метр (кг/м³)|текше метрге килограмм (кг/м³)
2|acceleration|ускорение|үдеу|metre per second squared (m/s²)|метр на секунду в квадрате (м/с²)|секунд квадратына метр (м/с²)
2|absolute temperature|абсолютная температура|абсолют температура|kelvin (K)|кельвин (К)|кельвин (К)
3|momentum|импульс|импульс|kilogram metre per second (kg·m/s)|килограмм-метр в секунду (кг·м/с)|килограмм-метр секундына (кг·м/с)
3|electrical capacitance|электроёмкость|электр сыйымдылығы|farad (F)|фарад (Ф)|фарад (Ф)
3|magnetic induction|магнитная индукция|магнит индукциясы|tesla (T)|тесла (Тл)|тесла (Тл)
3|inductance|индуктивность|индуктивтілік|henry (H)|генри (Гн)|генри (Гн)
3|amount of substance|количество вещества|зат мөлшері|mole (mol)|моль (моль)|моль (моль)
3|optical power of a lens|оптическая сила линзы|линзаның оптикалық күші|dioptre (D)|диоптрия (дптр)|диоптрия (дптр)
3|luminous intensity|сила света|жарық күші|candela (cd)|кандела (кд)|кандела (кд)
`).map(([d, qen, qru, qkk, uen, uru, ukk]) => ({ d: Number(d), a: L(qen, qru, qkk), b: L(uen, uru, ukk) }));

// сложность|величина en|ru|kk|формула en|ru(=kk)
const FORMULAS = rows(`
1|speed|скорость|жылдамдық|v = s / t|v = s / t
1|density|плотность|тығыздық|ρ = m / V|ρ = m / V
1|pressure|давление|қысым|p = F / S|p = F / S
1|force of gravity|сила тяжести|ауырлық күші|F = mg|F = mg
1|mechanical work|механическая работа|механикалық жұмыс|W = Fs|A = Fs
2|power|мощность|қуат|P = W / t|N = A / t
2|current (Ohm's law)|сила тока (закон Ома)|ток күші (Ом заңы)|I = V / R|I = U / R
2|kinetic energy|кинетическая энергия|кинетикалық энергия|E = mv² / 2|E = mv² / 2
2|potential energy (height h)|потенциальная энергия (высота h)|потенциалдық энергия (h биіктік)|E = mgh|E = mgh
2|amount of heat|количество теплоты|жылу мөлшері|Q = cmΔt|Q = cmΔt
2|Archimedes' force|сила Архимеда|Архимед күші|F = ρgV|F = ρgV
3|momentum|импульс|импульс|p = mv|p = mv
3|Newton's second law|второй закон Ньютона|Ньютонның екінші заңы|F = ma|F = ma
3|elastic force (Hooke's law)|сила упругости (закон Гука)|серпімділік күші (Гук заңы)|F = kx|F = kx
3|wave speed|скорость волны|толқын жылдамдығы|v = λν|v = λν
3|electric power|мощность тока|ток қуаты|P = VI|P = UI
3|charge passing in time t|заряд, прошедший за время t|t уақытта өткен заряд|q = It|q = It
`).map(([d, en, ru, kk, fen, fru]) => ({ d: Number(d), a: L(en, ru, kk), b: L(fen, fru, fru) }));

// сложность|учёный en|ru|kk|открытие en|ru|kk
const PHYSICISTS = rows(`
1|Isaac Newton|Исаак Ньютон|Исаак Ньютон|the laws of motion and universal gravitation|законы движения и всемирного тяготения|қозғалыс және бүкіләлемдік тартылыс заңдары
1|Archimedes|Архимед|Архимед|the buoyant force on bodies in a liquid|выталкивающая сила, действующая на тело в жидкости|сұйықтағы денеге әсер ететін кері итеруші күш
1|Georg Ohm|Георг Ом|Георг Ом|the law linking current, voltage and resistance|закон, связывающий ток, напряжение и сопротивление|ток, кернеу және кедергіні байланыстыратын заң
2|Blaise Pascal|Блез Паскаль|Блез Паскаль|the law of pressure transmission in fluids|закон передачи давления в жидкостях и газах|сұйықтар мен газдарда қысымның берілу заңы
2|Michael Faraday|Майкл Фарадей|Майкл Фарадей|electromagnetic induction|электромагнитная индукция|электромагниттік индукция
2|Galileo Galilei|Галилео Галилей|Галилео Галилей|the laws of free fall and the principle of inertia|законы свободного падения и принцип инерции|еркін түсу заңдары және инерция қағидасы
2|Robert Hooke|Роберт Гук|Роберт Гук|the law of elastic deformation|закон упругой деформации|серпімді деформация заңы
2|Albert Einstein|Альберт Эйнштейн|Альберт Эйнштейн|the theory of relativity|теория относительности|салыстырмалылық теориясы
3|Ernest Rutherford|Эрнест Резерфорд|Эрнест Резерфорд|the atomic nucleus|атомное ядро|атом ядросы
3|Charles Coulomb|Шарль Кулон|Шарль Кулон|the law of interaction of electric charges|закон взаимодействия электрических зарядов|электр зарядтарының өзара әсерлесу заңы
3|Johannes Kepler|Иоганн Кеплер|Иоганн Кеплер|the laws of planetary motion|законы движения планет|планеталар қозғалысының заңдары
3|Wilhelm Röntgen|Вильгельм Рентген|Вильгельм Рентген|X-rays|рентгеновские лучи|рентген сәулелері
3|James Maxwell|Джеймс Максвелл|Джеймс Максвелл|the theory of the electromagnetic field|теория электромагнитного поля|электромагниттік өріс теориясы
3|Evangelista Torricelli|Эванджелиста Торричелли|Эванджелиста Торричелли|the first measurement of atmospheric pressure|первое измерение атмосферного давления|атмосфералық қысымды алғаш өлшеу
3|Joule and Lenz|Джоуль и Ленц|Джоуль мен Ленц|the heating of a conductor by electric current|нагревание проводника электрическим током|өткізгіштің электр тогымен қызуы
`).map(([d, en, ru, kk, ben, bru, bkk]) => ({ d: Number(d), a: L(en, ru, kk), b: L(ben, bru, bkk) }));

const PHYS = [
  { id: 'unit', items: UNITS,
    fwd: (p) => L(`What is the SI unit of ${p.a.en}?`, `В каких единицах СИ измеряется величина «${p.a.ru}»?`, `«${p.a.kk}» шамасы ХБЖ-да қандай бірлікпен өлшенеді?`),
    back: (p) => L(`Which quantity is measured in ${p.b.en}?`, `Какая величина измеряется в единицах: ${p.b.ru}?`, `Қай шама ${p.b.kk} бірлігімен өлшенеді?`) },
  { id: 'formula', items: FORMULAS,
    fwd: (p) => L(`Which formula expresses ${p.a.en}?`, `По какой формуле находят: ${p.a.ru}?`, `${p.a.kk} қандай формуламен табылады?`),
    back: (p) => L(`What does the formula ${p.b.en} give?`, `Что находят по формуле ${p.b.ru}?`, `${p.b.kk} формуласы бойынша не табылады?`) },
  { id: 'who', items: PHYSICISTS,
    fwd: (p) => L(`What is ${p.a.en} known for?`, `Чем известен в физике ${p.a.ru}?`, `${p.a.kk} физикада немен белгілі?`),
    back: (p) => L(`Who discovered ${p.b.en}?`, `Кто открыл или изучил: ${p.b.ru}?`, `Кім ашты немесе зерттеді: ${p.b.kk}?`) },
];

// ---------- Информатика ----------

const ROLES = {
  in: L('an input device', 'устройство ввода', 'енгізу құрылғысы'),
  out: L('an output device', 'устройство вывода', 'шығару құрылғысы'),
  store: L('a storage device', 'устройство хранения', 'сақтау құрылғысы'),
};
const DEVICES = rows(`
in|1|keyboard|клавиатура|пернетақта
in|1|mouse|мышь|тінтуір
in|1|microphone|микрофон|микрофон
in|2|scanner|сканер|сканер
in|2|webcam|веб-камера|веб-камера
in|3|graphics tablet|графический планшет|графикалық планшет
out|1|monitor|монитор|монитор
out|1|printer|принтер|принтер
out|1|speakers|колонки|динамиктер
out|2|headphones|наушники|құлаққап
out|2|projector|проектор|проектор
store|2|hard disk|жёсткий диск|қатқыл диск
store|2|flash drive|флешка|флешка
store|3|SSD|твердотельный накопитель (SSD)|қатты күйлі жинақтағыш (SSD)
`).map(([role, d, en, ru, kk]) => ({ role, d: Number(d), name: L(en, ru, kk) }));

const FILES = {
  img: L('an image', 'изображение', 'сурет'),
  audio: L('a sound file', 'звук', 'дыбыс'),
  video: L('a video', 'видео', 'бейне'),
  text: L('a text document', 'текстовый документ', 'мәтіндік құжат'),
  table: L('a spreadsheet', 'электронная таблица', 'электрондық кесте'),
  archive: L('an archive', 'архив', 'мұрағат'),
  web: L('a web page', 'веб-страница', 'веб-бет'),
  prog: L('a program or code', 'программа или код', 'бағдарлама немесе код'),
};
const EXTENSIONS = rows(`
img|1|.jpg
img|1|.png
img|2|.gif
img|3|.svg
audio|1|.mp3
audio|2|.wav
audio|3|.flac
video|1|.mp4
video|2|.avi
video|3|.mkv
text|1|.docx
text|1|.txt
text|2|.pdf
table|2|.xlsx
table|3|.csv
archive|2|.zip
archive|3|.rar
web|2|.html
prog|2|.exe
prog|2|.py
prog|3|.js
`).map(([kind, d, ext]) => ({ kind, d: Number(d), ext }));

const TERMS = rows(`
1|CPU|процессор (CPU)|процессор (CPU)|the part that carries out program instructions|выполняет команды программ|бағдарлама командаларын орындайды
1|RAM|оперативная память (RAM)|жедел жад (RAM)|keeps running programs and data while the computer is on|хранит работающие программы и данные, пока компьютер включён|компьютер қосулы тұрғанда жұмыс істеп тұрған бағдарламалар мен деректерді сақтайды
1|operating system|операционная система|операциялық жүйе|manages the computer and runs other programs|управляет компьютером и запускает другие программы|компьютерді басқарады және басқа бағдарламаларды іске қосады
2|browser|браузер|браузер|opens and shows web pages|открывает и показывает веб-страницы|веб-беттерді ашады және көрсетеді
2|URL|URL-адрес|URL-мекенжай|the address of a page on the internet|адрес страницы в интернете|интернеттегі беттің мекенжайы
2|IP address|IP-адрес|IP-мекенжай|the number that identifies a computer in a network|номер, по которому компьютер находят в сети|желіде компьютерді анықтайтын нөмір
2|algorithm|алгоритм|алгоритм|a precise sequence of steps to solve a task|точная последовательность шагов для решения задачи|есепті шешуге арналған қадамдардың нақты тізбегі
2|antivirus|антивирус|антивирус|finds and removes malicious programs|находит и удаляет вредоносные программы|зиянды бағдарламаларды тауып, жояды
3|compiler|компилятор|компилятор|translates a whole program into machine code|переводит всю программу в машинный код|бүкіл бағдарламаны машиналық кодқа аударады
3|database|база данных|деректер қоры|an organised store of related data|упорядоченное хранилище связанных данных|өзара байланысты деректердің реттелген қоймасы
3|router|маршрутизатор|маршрутизатор|passes data between networks|передаёт данные между сетями|деректерді желілер арасында жібереді
3|encryption|шифрование|шифрлау|turns data into a form only the key holder can read|превращает данные в вид, понятный только владельцу ключа|деректерді тек кілт иесі оқи алатын түрге айналдырады
3|firewall|межсетевой экран|желіаралық экран|blocks unwanted network connections|блокирует нежелательные сетевые подключения|қажетсіз желілік қосылыстарды бұғаттайды
`).map(([d, en, ru, kk, ben, bru, bkk]) => ({ d: Number(d), a: L(en, ru, kk), b: L(ben, bru, bkk) }));

const INFO_TERMS = [
  { id: 'term', items: TERMS,
    fwd: (p) => L(`What is "${p.a.en}"?`, `Что делает ${p.a.ru}?`, `${p.a.kk} не істейді?`),
    back: (p) => L(`Which term matches this description: "${p.b.en}"?`, `Какое понятие подходит к описанию: «${p.b.ru}»?`, `Қай ұғым мына сипаттамаға сәйкес: «${p.b.kk}»?`) },
];

function pairTask(ctx, topic, d, table) {
  const { rng } = ctx;
  const pool = table.items.filter((p) => p.d <= d);
  const p = pick(rng, d === 1 ? pool : pool.filter((x) => x.d >= d - 1));
  const fwd = rng() < 0.5;
  const wrong = distinct(rng, table.items.filter((x) => x !== p), p, (x) => (fwd ? x.b : x.a));
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: fwd ? table.fwd(p) : table.back(p),
    ex: L(`${p.a.en} — ${p.b.en}.`, `${p.a.ru} — ${p.b.ru}.`, `${p.a.kk} — ${p.b.kk}.`),
    mc: fwd ? mcOf(rng, p.b, wrong.map((x) => x.b)) : mcOf(rng, p.a, wrong.map((x) => x.a)),
  });
  q.id = `${topic}:${table.id}:${fwd ? 'f' : 'b'}:${p.a.en}`;
  return q;
}

export function physicsFactsMaker(topic) {
  return (ctx, d) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const q = pairTask(ctx, topic, d, pick(ctx.rng, PHYS));
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}

function deviceTask(ctx, topic, d) {
  const { rng } = ctx;
  const pool = DEVICES.filter((x) => x.d <= d);
  const roles = d === 1 ? ['in', 'out'] : ['in', 'out', 'store'];
  const role = pick(rng, roles);
  const right = pick(rng, pool.filter((x) => x.role === role));
  const wrong = shuffle(pool.filter((x) => x.role !== role && roles.includes(x.role)), rng).slice(0, 3);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: L(`Which of these is ${ROLES[role].en}?`, `Что из этого — ${ROLES[role].ru}?`, `Бұлардың қайсысы — ${ROLES[role].kk}?`),
    ex: L(`${right.name.en} — ${ROLES[role].en}.`, `${right.name.ru} — ${ROLES[role].ru}.`, `${right.name.kk} — ${ROLES[role].kk}.`),
    mc: mcOf(rng, right.name, wrong.map((x) => x.name)),
  });
  q.id = `${topic}:dev:${hashString([right, ...wrong].map((x) => x.name.en).sort().join())}`;
  return q;
}

function fileTask(ctx, topic, d) {
  const { rng } = ctx;
  const pool = EXTENSIONS.filter((x) => x.d <= d);
  const f = pick(rng, pool);
  const wrong = shuffle(Object.keys(FILES).filter((k) => k !== f.kind), rng).slice(0, 3);
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: L(`What is usually stored in a file with the extension ${f.ext}?`, `Что обычно хранится в файле с расширением ${f.ext}?`, `${f.ext} кеңейтілімі бар файлда әдетте не сақталады?`),
    ex: L(`${f.ext} — ${FILES[f.kind].en}.`, `${f.ext} — ${FILES[f.kind].ru}.`, `${f.ext} — ${FILES[f.kind].kk}.`),
    mc: mcOf(rng, FILES[f.kind], wrong.map((k) => FILES[k])),
  });
  q.id = `${topic}:ext:${f.ext}`;
  return q;
}

export function informaticsFactsMaker(topic) {
  return (ctx, d) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const kind = pick(ctx.rng, ['dev', 'ext', 'term', 'term']);
      const q = kind === 'dev' ? deviceTask(ctx, topic, d) : kind === 'ext' ? fileTask(ctx, topic, d) : pairTask(ctx, topic, d, INFO_TERMS[0]);
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}

// ---------- Программирование: понятия ----------

const CODE_TERMS = rows(`
1|variable|переменная|айнымалы|a named place that stores a value|именованное место для хранения значения|мәнді сақтайтын аталған орын
1|loop|цикл|цикл|repeats a block of code several times|повторяет блок кода несколько раз|код блогын бірнеше рет қайталайды
1|condition (if)|условие (if)|шарт (if)|runs code only when an expression is true|выполняет код, только если выражение истинно|өрнек ақиқат болғанда ғана кодты орындайды
1|string|строка|жол (string)|a sequence of characters, i.e. text|последовательность символов, то есть текст|таңбалар тізбегі, яғни мәтін
1|integer|целое число (int)|бүтін сан (int)|a whole number without a fractional part|число без дробной части|бөлшек бөлігі жоқ сан
1|boolean|логический тип (bool)|логикалық түр (bool)|a type with only two values: true and false|тип только с двумя значениями: истина и ложь|тек екі мәні бар түр: ақиқат және жалған
1|comment|комментарий|түсініктеме|a note in the code that the computer ignores|пояснение в коде, которое компьютер не выполняет|компьютер орындамайтын кодтағы түсініктеме
2|function|функция|функция|a named block of code that can be called many times|именованный блок кода, который можно вызывать много раз|бірнеше рет шақыруға болатын аталған код блогы
2|array (list)|массив (список)|массив (тізім)|an ordered collection of values accessed by index|упорядоченный набор значений с доступом по индексу|индекс арқылы қол жеткізілетін мәндердің реттелген жиыны
2|syntax error|синтаксическая ошибка|синтаксистік қате|a mistake in how the code is written, so it cannot run|ошибка в записи кода, из-за которой он не запускается|кодтың жазылуындағы қате, сондықтан ол іске қосылмайды
2|bug|баг|баг|a mistake that makes a program work incorrectly|ошибка, из-за которой программа работает неправильно|бағдарламаны дұрыс істемейтін ететін қате
2|debugging|отладка|жөндеу (debugging)|finding and fixing mistakes in a program|поиск и исправление ошибок в программе|бағдарламадағы қателерді тауып, түзету
2|operator|оператор|оператор|a symbol for an action, such as + or ==|знак действия, например + или ==|+ немесе == сияқты әрекет белгісі
2|IDE|среда разработки (IDE)|әзірлеу ортасы (IDE)|a program for writing, running and debugging code|программа для написания, запуска и отладки кода|кодты жазуға, іске қосуға және жөндеуге арналған бағдарлама
3|recursion|рекурсия|рекурсия|when a function calls itself|когда функция вызывает сама себя|функция өзін-өзі шақырғанда
3|compiler|компилятор|компилятор|translates the whole program into machine code before running|переводит всю программу в машинный код до запуска|іске қоспас бұрын бүкіл бағдарламаны машиналық кодқа аударады
3|interpreter|интерпретатор|интерпретатор|runs a program line by line without full translation in advance|выполняет программу построчно без полного перевода заранее|бағдарламаны алдын ала толық аудармай, жол-жолымен орындайды
3|library|библиотека|кітапхана|ready-made code that other programs can use|готовый код, который могут использовать другие программы|басқа бағдарламалар пайдалана алатын дайын код
3|class|класс|класс|a template for creating objects with data and methods|шаблон для создания объектов с данными и методами|деректері мен әдістері бар объектілер жасауға арналған үлгі
3|API|API|API|a set of rules by which programs talk to each other|набор правил, по которым программы общаются друг с другом|бағдарламалардың бір-бірімен байланысу ережелерінің жиыны
3|version control (git)|система контроля версий (git)|нұсқаларды басқару жүйесі (git)|stores the history of changes in code|хранит историю изменений кода|код өзгерістерінің тарихын сақтайды
3|binary search|двоичный поиск|екілік іздеу|finds a value in a sorted list by halving it each step|ищет значение в отсортированном списке, деля его пополам|сұрыпталған тізімде мәнді әр қадамда екіге бөліп іздейді
`).map(([d, en, ru, kk, ben, bru, bkk]) => ({ d: Number(d), a: L(en, ru, kk), b: L(ben, bru, bkk) }));

const CODE_TABLE = {
  id: 'code',
  items: CODE_TERMS,
  fwd: (p) => L(`What is "${p.a.en}" in programming?`, `Что такое «${p.a.ru}» в программировании?`, `Бағдарламалаудағы «${p.a.kk}» дегеніміз не?`),
  back: (p) => L(`Which term matches this description: "${p.b.en}"?`, `Какое понятие подходит к описанию: «${p.b.ru}»?`, `Қай ұғым мына сипаттамаға сәйкес: «${p.b.kk}»?`),
};

export function codeTermsMaker(topic) {
  return (ctx, d) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const q = pairTask(ctx, topic, d, CODE_TABLE);
      if (!ctx.used?.has(q.id) || attempt === 9) return q;
    }
    return null;
  };
}
