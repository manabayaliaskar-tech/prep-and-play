// Физика и информатика: генераторы по таблицам «понятие → ответ».
// Физика - единицы измерения, формулы, учёные. Информатика - устройства, типы файлов, термины.
// Ключ сложности - 1…3: чем выше, тем реже встречающиеся понятия.

import { hashString, pick, shuffle } from '../../core/random.js';
import { L, poolQ } from '../gen.js';
import { pairPrompt, tfQ } from '../tf.js';

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
1|area|площадь|аудан|square metre (m²)|квадратный метр (м²)|шаршы метр (м²)
1|volume|объём|көлем|cubic metre (m³)|кубический метр (м³)|текше метр (м³)
1|air temperature in daily life|температура воздуха (в быту)|ауа температурасы (тұрмыста)|degree Celsius (°C)|градус Цельсия (°C)|Цельсий градусы (°C)
1|electricity consumed at home|электроэнергия по счётчику|есептегіш бойынша электр энергиясы|kilowatt-hour (kWh)|киловатт-час (кВт·ч)|киловатт-сағат (кВт·сағ)
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
1|area of a rectangle|площадь прямоугольника|тіктөртбұрыш ауданы|S = ab|S = ab
1|volume of a cuboid|объём прямоугольного параллелепипеда|тіктөртбұрышты параллелепипед көлемі|V = abc|V = abc
1|mass from density and volume|масса через плотность и объём|тығыздық пен көлем арқылы масса|m = ρV|m = ρV
1|distance in uniform motion|путь при равномерном движении|бірқалыпты қозғалыстағы жол|s = vt|s = vt
1|time of uniform motion|время равномерного движения|бірқалыпты қозғалыс уақыты|t = s / v|t = s / v
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
1|Yuri Gagarin|Юрий Гагарин|Юрий Гагарин|the first human flight into space|первый полёт человека в космос|адамның ғарышқа алғашқы ұшуы
1|Konstantin Tsiolkovsky|Константин Циолковский|Константин Циолковский|the foundations of theoretical astronautics|основы теоретической космонавтики|теориялық ғарыш зерттеудің негіздері
1|Thomas Edison|Томас Эдисон|Томас Эдисон|a practical electric light bulb and the phonograph|практичная лампа накаливания и фонограф|тәжірибеде қолданылатын қыздыру шамы мен фонограф
1|Alexander Graham Bell|Александр Белл|Александр Белл|the telephone|телефон|телефон
1|Marie Curie|Мария Кюри|Мария Кюри|the study of radioactivity|исследование радиоактивности|радиоактивтілікті зерттеу
1|Nicolaus Copernicus|Николай Коперник|Николай Коперник|the heliocentric system of the world|гелиоцентрическая система мира|әлемнің гелиоцентрлік жүйесі
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
1|file|файл|файл|a named piece of data stored on a disk|именованный набор данных на диске|дискіде сақталатын аталған деректер жиыны
1|folder|папка|қапшық|a container for organising files|контейнер для упорядочивания файлов|файлдарды ретке келтіруге арналған контейнер
1|icon|значок|белгіше|a small picture that stands for a program or file|маленькая картинка, обозначающая программу или файл|бағдарламаны немесе файлды білдіретін кішкентай сурет
1|desktop|рабочий стол|жұмыс үстелі|the main screen where icons are placed|главный экран, на котором расположены значки|белгішелер орналасатын басты экран
1|cursor|курсор|меңзер|a mark on the screen that shows where you type or click|метка на экране, показывающая, где вы печатаете или щёлкаете|экранда теру немесе басу орнын көрсететін белгі
1|password|пароль|құпиясөз|a secret word that protects an account|секретное слово, защищающее учётную запись|тіркелгіні қорғайтын құпия сөз
1|byte|байт|байт|a unit of information equal to eight bits|единица информации, равная восьми битам|сегіз битке тең ақпарат бірлігі
1|bit|бит|бит|the smallest unit of information: 0 or 1|наименьшая единица информации: 0 или 1|ақпараттың ең кіші бірлігі: 0 немесе 1
1|internet|интернет|интернет|a global network that connects computers|всемирная сеть, соединяющая компьютеры|компьютерлерді байланыстыратын жаһандық желі
1|website|сайт|сайт|a set of linked web pages under one address|набор связанных веб-страниц под одним адресом|бір мекенжайдағы өзара байланысқан веб-беттер жиыны
1|e-mail|электронная почта|электрондық пошта|messages sent through the internet|сообщения, пересылаемые через интернет|интернет арқылы жіберілетін хабарламалар
1|search engine|поисковая система|іздеу жүйесі|a service that finds web pages by a query|сервис, который находит веб-страницы по запросу|сұраныс бойынша веб-беттерді табатын қызмет
1|computer virus|компьютерный вирус|компьютерлік вирус|a harmful program that spreads and damages data|вредоносная программа, которая распространяется и портит данные|таралып, деректерді бүлдіретін зиянды бағдарлама
1|software|программное обеспечение|бағдарламалық қамтама|the programs that run on a computer|программы, которые работают на компьютере|компьютерде жұмыс істейтін бағдарламалар
1|hardware|аппаратное обеспечение|аппараттық қамтама|the physical parts of a computer|физические части компьютера|компьютердің физикалық бөліктері
1|menu|меню|мәзір|a list of commands to choose from|список команд, из которых можно выбрать|таңдауға болатын командалар тізімі
1|window|окно|терезе|a framed area of the screen for one program|рамка на экране для одной программы|бір бағдарламаға арналған экрандағы жақтау
1|pixel|пиксель|пиксель|the smallest dot of a digital image|наименьшая точка цифрового изображения|сандық кескіннің ең кіші нүктесі
1|keyboard shortcut|горячие клавиши|жылдам пернелер|a key combination that runs a command quickly|сочетание клавиш для быстрого выполнения команды|команданы тез орындайтын пернелер тіркесі
1|download|скачивание|жүктеп алу|copying a file from the internet to your device|копирование файла из интернета на своё устройство|файлды интернеттен өз құрылғыңа көшіру
1|upload|загрузка на сервер|серверге жүктеу|sending a file from your device to the internet|отправка файла со своего устройства в интернет|файлды өз құрылғыңнан интернетке жіберу
1|Wi-Fi|Wi-Fi|Wi-Fi|a wireless connection to a network|беспроводное подключение к сети|желіге сымсыз қосылу
1|motherboard|материнская плата|аналық плата|the main board that connects all parts of a computer|главная плата, соединяющая все части компьютера|компьютердің барлық бөліктерін қосатын басты плата
1|cloud storage|облачное хранилище|бұлтты қойма|storing files on remote servers on the internet|хранение файлов на удалённых серверах в интернете|файлдарды интернеттегі қашықтағы серверлерде сақтау
1|spreadsheet|электронная таблица|электрондық кесте|a program for calculations in rows and columns|программа для вычислений в строках и столбцах|жолдар мен бағандардағы есептеулерге арналған бағдарлама
1|hyperlink|гиперссылка|гиперсілтеме|a clickable link to another page or file|ссылка, по которой можно перейти на другую страницу или файл|басқа бетке немесе файлға өтуге болатын сілтеме
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
  if (rng() < 0.45) {
    const ok = rng() < 0.5;
    const other = pick(rng, distinct(rng, table.items.filter((x) => x !== p), p, (x) => x.b));
    return tfQ(ctx, topic, d, {
      prompt: pairPrompt(p.a, ok ? p.b : other.b),
      ok,
      ex: L(`Correct: ${p.a.en} - ${p.b.en}.`, `Верно так: ${p.a.ru} - ${p.b.ru}.`, `Дұрысы: ${p.a.kk} - ${p.b.kk}.`),
      id: `${topic}:${table.id}:tf${ok ? 't' : 'f'}:${p.a.en}`,
    });
  }
  const fwd = rng() < 0.5;
  const wrong = distinct(rng, table.items.filter((x) => x !== p), p, (x) => (fwd ? x.b : x.a));
  const q = poolQ(topic, d, {
    kind: 'text',
    prompt: fwd ? table.fwd(p) : table.back(p),
    ex: L(`${p.a.en} - ${p.b.en}.`, `${p.a.ru} - ${p.b.ru}.`, `${p.a.kk} - ${p.b.kk}.`),
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
    prompt: L(`Which of these is ${ROLES[role].en}?`, `Что из этого - ${ROLES[role].ru}?`, `Бұлардың қайсысы - ${ROLES[role].kk}?`),
    ex: L(`${right.name.en} - ${ROLES[role].en}.`, `${right.name.ru} - ${ROLES[role].ru}.`, `${right.name.kk} - ${ROLES[role].kk}.`),
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
    ex: L(`${f.ext} - ${FILES[f.kind].en}.`, `${f.ext} - ${FILES[f.kind].ru}.`, `${f.ext} - ${FILES[f.kind].kk}.`),
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
1|constant|константа|тұрақты шама|a value that does not change while the program runs|значение, которое не меняется во время работы программы|бағдарлама жұмысы кезінде өзгермейтін мән
1|keyword|ключевое слово|кілт сөз|a reserved word of the language, such as if or while|зарезервированное слово языка, например if или while|тілдің сақталған сөзі, мысалы if немесе while
1|statement|инструкция|нұсқау (инструкция)|one command of a program|одна команда программы|бағдарламаның бір командасы
1|expression|выражение|өрнек|a combination of values and operators that gives a result|сочетание значений и операторов, дающее результат|нәтиже беретін мәндер мен операторлар тіркесі
1|input|ввод данных|деректерді енгізу|data that the user gives to a program|данные, которые пользователь передаёт программе|пайдаланушы бағдарламаға беретін деректер
1|output|вывод данных|деректерді шығару|data that a program shows to the user|данные, которые программа показывает пользователю|бағдарлама пайдаланушыға көрсететін деректер
1|float (real number)|вещественное число (float)|нақты сан (float)|a number with a fractional part|число с дробной частью|бөлшек бөлігі бар сан
1|data type|тип данных|деректер түрі|the kind of value, which defines what can be done with it|вид значения, определяющий, что с ним можно делать|мәнмен не істеуге болатынын анықтайтын мән түрі
1|assignment|присваивание|меншіктеу|putting a value into a variable|запись значения в переменную|айнымалыға мән жазу
1|source code|исходный код|бастапқы код|the text of a program written by a programmer|текст программы, написанный программистом|бағдарламашы жазған бағдарлама мәтіні
1|program|программа|бағдарлама|a sequence of instructions for a computer|последовательность команд для компьютера|компьютерге арналған командалар тізбегі
1|flowchart|блок-схема|блок-схема|a diagram that shows the steps of an algorithm|схема, показывающая шаги алгоритма|алгоритм қадамдарын көрсететін сызба
1|indentation|отступ|шегініс|spaces at the start of a line that show the structure of code|пробелы в начале строки, показывающие структуру кода|код құрылымын көрсететін жол басындағы бос орындар
1|counter|счётчик|санауыш|a variable that counts repetitions or events|переменная, которая считает повторения или события|қайталауларды немесе оқиғаларды санайтын айнымалы
1|index|индекс|индекс|the position number of an element in a list|номер позиции элемента в списке|тізімдегі элементтің орын нөмірі
1|character|символ|таңба (символ)|a single letter, digit or sign|одна буква, цифра или знак|бір әріп, сан немесе белгі
1|print|вывод на экран (print)|экранға шығару (print)|a command that shows text on the screen|команда, которая показывает текст на экране|мәтінді экранға шығаратын команда
1|programming language|язык программирования|бағдарламалау тілі|a formal language for writing instructions for a computer|формальный язык для записи команд компьютеру|компьютерге командалар жазуға арналған формальды тіл
1|text editor|текстовый редактор|мәтін редакторы|a program for typing and editing code or text|программа для набора и правки кода или текста|код немесе мәтінді теруге және түзетуге арналған бағдарлама
1|running a program|запуск программы|бағдарламаны іске қосу|starting a program so that the computer executes it|начало работы программы, чтобы компьютер её выполнил|компьютер орындауы үшін бағдарламаны бастау
1|error message|сообщение об ошибке|қате туралы хабарлама|text that tells what went wrong|текст, сообщающий, что пошло не так|не дұрыс болғанын хабарлайтын мәтін
1|loop body|тело цикла|цикл денесі|the block of code that the loop repeats|блок кода, который повторяет цикл|цикл қайталайтын код блогы
1|else branch|ветка else|else тармағы|code that runs when the if condition is false|код, который выполняется, когда условие if ложно|if шарты жалған болғанда орындалатын код
2|parameter|параметр функции|функция параметрі|a variable in a function definition that receives a value|переменная в описании функции, получающая значение|мән қабылдайтын функция сипаттамасындағы айнымалы
2|return value|возвращаемое значение|қайтарылатын мән|the result that a function gives back|результат, который возвращает функция|функция қайтаратын нәтиже
2|scope|область видимости|көріну аймағы|the part of a program where a variable can be used|часть программы, где можно использовать переменную|айнымалыны қолдануға болатын бағдарлама бөлігі
2|nested loop|вложенный цикл|ішкі цикл|a loop placed inside another loop|цикл, расположенный внутри другого цикла|басқа цикл ішіндегі цикл
2|dictionary|словарь|сөздік|a collection of key and value pairs|набор пар «ключ - значение»|«кілт - мән» жұптарының жиыны
2|exception|исключение|ерекше жағдай (exception)|an error during execution that the program can handle|ошибка при выполнении, которую программа может обработать|орындау кезіндегі бағдарлама өңдей алатын қате
2|module|модуль|модуль|a file with code that can be imported into a program|файл с кодом, который можно подключить к программе|бағдарламаға қосуға болатын кодты файл
2|method|метод|әдіс (метод)|a function that belongs to an object or class|функция, принадлежащая объекту или классу|объектіге немесе класқа тиесілі функция
3|inheritance|наследование|мұрагерлік|a way for a class to take the features of another class|способ, которым класс получает свойства другого класса|класс басқа таптың қасиеттерін алу тәсілі
3|object|объект|нысан (объект)|a specific instance of a class|конкретный экземпляр класса|таптың нақты данасы
3|stack|стек|стек|a structure where the last added item is taken first|структура, в которой первым извлекается последний добавленный элемент|соңғы қосылған элемент бірінші алынатын құрылым
3|queue|очередь|кезек|a structure where the first added item is taken first|структура, в которой первым извлекается первый добавленный элемент|бірінші қосылған элемент бірінші алынатын құрылым
3|hash table|хеш-таблица|хеш-кесте|a structure that finds values quickly by a key|структура, быстро находящая значения по ключу|мәндерді кілт бойынша тез табатын құрылым
3|time complexity|временная сложность|уақыттық күрделілік|how the running time grows as the input gets bigger|как растёт время работы при увеличении входных данных|кіріс деректер өскенде жұмыс уақыты қалай артатыны
3|unit test|модульный тест|модульдік тест|a small automatic check of one piece of code|небольшая автоматическая проверка одной части кода|кодтың бір бөлігін шағын автоматты тексеру
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
