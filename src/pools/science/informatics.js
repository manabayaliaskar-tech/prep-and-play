// Информатика: системы счисления, измерение информации, логика, разбор алгоритмов.

import { pick, randomInt } from '../../core/random.js';
import { T } from '../bank.js';
import { L, ask, mcText, n, plural, poolQ, same, steps } from '../gen.js';

const TIMES = '×';
const DIV = '÷';
const sub = (value, base) => `${value}<sub>${base}</sub>`;
/** Программа на школьном алгоритмическом языке: строки с отступами. */
const code = (...lines) =>
  `<span class="code-block">${lines
    .map((line) => `<span>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/^ +/, (m) => '&nbsp;'.repeat(m.length))}</span>`)
    .join('')}</span>`;

export function numberSystems(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const value = randomInt(rng, 5, 31);
    const bin = value.toString(2);
    const parts = bin.split('').map((bit, i) => (bit === '1' ? 2 ** (bin.length - 1 - i) : 0)).filter(Boolean);
    return poolQ('i.num', d, {
      prompt: L(
        `Convert the binary number ${sub(bin, 2)} to decimal.`,
        `Переведи двоичное число ${sub(bin, 2)} в десятичную систему счисления.`,
        `${sub(bin, 2)} екілік санын ондық санау жүйесіне аудар.`,
      ),
      ex: steps(
        L('Each digit 1 gives a power of two according to its position.', 'Каждая единица даёт степень двойки по своему разряду.', 'Әр бір цифры өз разрядына сәйкес екінің дәрежесін береді.'),
        same(`${parts.join(' + ')} = ${value}`),
      ),
      ...ask(ctx, value, [value + 1, value - 1, value + 2, value * 2]),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const value = randomInt(rng, 17, 100);
      const bin = value.toString(2);
      const flip = (i) => bin.split('').map((bit, k) => (k === i ? (bit === '1' ? '0' : '1') : bit)).join('');
      return poolQ('i.num', d, {
        prompt: L(
          `Convert the decimal number ${value} to binary.`,
          `Переведи десятичное число ${value} в двоичную систему счисления.`,
          `${value} ондық санын екілік санау жүйесіне аудар.`,
        ),
        ex: steps(
          L('Divide by 2 and write down the remainders, then read them from the last to the first.', 'Делим на 2 и записываем остатки, затем читаем их от последнего к первому.', '2-ге бөліп, қалдықтарды жазамыз, сосын оларды соңғысынан біріншісіне қарай оқимыз.'),
          same(`${value} = ${sub(bin, 2)}`),
        ),
        mc: mcText(rng, bin, [flip(bin.length - 1), flip(bin.length - 2), flip(1)]),
      });
    }
    const value = randomInt(rng, 26, 255);
    const hex = value.toString(16).toUpperCase();
    const hi = Math.floor(value / 16);
    const lo = value % 16;
    return poolQ('i.num', d, {
      prompt: L(
        `Convert the hexadecimal number ${sub(hex, 16)} to decimal.`,
        `Переведи шестнадцатеричное число ${sub(hex, 16)} в десятичную систему счисления.`,
        `${sub(hex, 16)} он алтылық санын ондық санау жүйесіне аудар.`,
      ),
      ex: steps(
        L('In hexadecimal A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.', 'В шестнадцатеричной системе A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.', 'Он алтылық жүйеде A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.'),
        same(`${hi} ${TIMES} 16 + ${lo} = ${value}`),
      ),
      ...ask(ctx, value, [hi * 10 + lo, hi + lo, value + 16, value - 6].filter((x) => x !== value && x > 0)),
    });
  }
  const value = randomInt(rng, 64, 1023);
  const bin = value.toString(2);
  const ones = bin.split('').filter((bit) => bit === '1').length;
  return poolQ('i.num', d, {
    prompt: L(
      `How many ones are there in the binary form of the decimal number ${value}?`,
      `Сколько единиц в двоичной записи десятичного числа ${value}?`,
      `${value} ондық санының екілік жазылуында неше бір цифры бар?`,
    ),
    ex: steps(same(`${value} = ${sub(bin, 2)}`), L(`There are ${ones} ones.`, `Единиц в записи: ${ones}.`, `Жазылуда бір цифры: ${ones}.`)),
    ...ask(ctx, ones, [bin.length - ones, bin.length, ones + 1, ones - 1].filter((x) => x !== ones && x > 0)),
  });
}

export function infoUnits(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    if (rng() < 0.5) {
      const bytes = randomInt(rng, 2, 64);
      return poolQ('i.units', d, {
        prompt: L(`How many bits are there in ${bytes} bytes?`, `Сколько бит в ${bytes} байтах?`, `${bytes} байтта неше бит бар?`),
        ex: steps(L('1 byte = 8 bits.', '1 байт = 8 бит.', '1 байт = 8 бит.'), same(`${bytes} ${TIMES} 8 = ${bytes * 8}`)),
        ...ask(ctx, bytes * 8, [bytes * 10, bytes + 8, bytes * 4, bytes * 16]),
      });
    }
    const kb = pick(rng, [2, 3, 4, 5, 8]);
    return poolQ('i.units', d, {
      prompt: L(`How many bytes are there in ${kb} kilobytes (1 KB = 1024 bytes)?`, `Сколько байт в ${kb} килобайтах (1 Кбайт = 1024 байта)?`, `${kb} килобайтта неше байт бар (1 Кбайт = 1024 байт)?`),
      ex: steps(same(`${kb} ${TIMES} 1024 = ${n(kb * 1024)}`)),
      ...ask(ctx, kb * 1024, [kb * 1000, kb * 8, kb * 512, kb * 2048]),
    });
  }
  if (d === 2) {
    if (rng() < 0.5) {
      const chars = 8 * randomInt(rng, 20, 200);
      const bits = pick(rng, [8, 16]);
      const bytes = (chars * bits) / 8;
      return poolQ('i.units', d, {
        prompt: L(
          `A text contains ${n(chars)} characters, each encoded with ${bits} bits. Find the size of the text in bytes.`,
          `Текст содержит ${n(chars)} символов, каждый символ кодируется ${bits} битами. Найди объём текста в байтах.`,
          `Мәтінде ${n(chars)} таңба бар, әр таңба ${bits} битпен кодталады. Мәтіннің көлемін байтпен тап.`,
        ),
        ex: steps(
          L(`Size in bits: ${n(chars)} ${TIMES} ${bits} = ${n(chars * bits)}.`, `Объём в битах: ${n(chars)} ${TIMES} ${bits} = ${n(chars * bits)}.`, `Битпен көлемі: ${n(chars)} ${TIMES} ${bits} = ${n(chars * bits)}.`),
          same(`${n(chars * bits)} ${DIV} 8 = ${n(bytes)}`),
        ),
        ...ask(ctx, bytes, [chars * bits, chars, bytes * 2, bytes / 2].filter((x) => x !== bytes && Number.isInteger(x))),
      });
    }
    const colours = pick(rng, [4, 16, 256]);
    const depth = Math.log2(colours);
    const w = pick(rng, [32, 64, 128]);
    const h = pick(rng, [32, 64, 128]);
    const bytes = (w * h * depth) / 8;
    return poolQ('i.units', d, {
      prompt: L(
        `An image of ${w} ${TIMES} ${h} pixels uses a palette of ${colours} colours. Find its size in bytes (without compression).`,
        `Рисунок размером ${w} ${TIMES} ${h} пикселей использует палитру из ${colours} цветов. Найди его объём в байтах (без сжатия).`,
        `Өлшемі ${w} ${TIMES} ${h} пиксель сурет ${colours} түсті палитраны қолданады. Оның көлемін байтпен тап (сығусыз).`,
      ),
      ex: steps(
        L(
          `${colours} colours need ${depth} bits per pixel, because 2<sup>${depth}</sup> = ${colours}.`,
          `Для ${colours} цветов нужно ${depth} бит на пиксель, так как 2<sup>${depth}</sup> = ${colours}.`,
          `${colours} түс үшін әр пиксельге ${depth} бит керек, өйткені 2<sup>${depth}</sup> = ${colours}.`,
        ),
        same(`${w} ${TIMES} ${h} ${TIMES} ${depth} ${DIV} 8 = ${n(bytes)}`),
      ),
      ...ask(ctx, bytes, [w * h, w * h * depth, (w * h * colours) / 8, bytes * 2].filter((x) => x !== bytes && Number.isInteger(x))),
    });
  }
  const speed = pick(rng, [64, 128, 256, 512]);
  const seconds = randomInt(rng, 2, 30);
  const kb = (speed * seconds) / 8;
  return poolQ('i.units', d, {
    prompt: L(
      `A file was sent in ${seconds} s over a channel with a speed of ${speed} kilobits per second. Find the size of the file in kilobytes.`,
      `Файл передали за ${seconds} с по каналу связи со скоростью ${speed} Кбит/с. Найди размер файла в килобайтах.`,
      `Файл жылдамдығы ${speed} Кбит/с байланыс арнасымен ${seconds} с ішінде жіберілді. Файлдың өлшемін килобайтпен тап.`,
    ),
    ex: steps(
      L(`Size in kilobits: ${speed} ${TIMES} ${seconds} = ${n(speed * seconds)}.`, `Объём в килобитах: ${speed} ${TIMES} ${seconds} = ${n(speed * seconds)}.`, `Килобитпен көлемі: ${speed} ${TIMES} ${seconds} = ${n(speed * seconds)}.`),
      same(`${n(speed * seconds)} ${DIV} 8 = ${n(kb)}`),
    ),
    ...ask(ctx, kb, [speed * seconds, speed / 8, kb * 2, (speed * seconds) / 1024].filter((x) => x !== kb && Number.isInteger(x))),
  });
}

const TRUTH = L('true', 'истина', 'ақиқат');
const FALSE = L('false', 'ложь', 'жалған');
const bool = (value) => (value ? '1' : '0');

export function logic(ctx, d) {
  const { rng } = ctx;
  const A = rng() < 0.5;
  const B = rng() < 0.5;
  const C = rng() < 0.5;
  if (d < 3) {
    const forms = d === 1
      ? [
          ['A ∧ B', A && B],
          ['A ∨ B', A || B],
          ['¬A ∧ B', !A && B],
          ['A ∨ ¬B', A || !B],
          ['¬(A ∧ B)', !(A && B)],
        ]
      : [
          ['(A ∨ B) ∧ ¬C', (A || B) && !C],
          ['A ∧ (B ∨ C)', A && (B || C)],
          ['¬A ∨ (B ∧ C)', !A || (B && C)],
          ['(A → B) ∧ C', (!A || B) && C],
          ['A → (B ∨ C)', !A || B || C],
        ];
    const [expr, value] = pick(rng, forms);
    const values = d === 1 ? `A = ${bool(A)}, B = ${bool(B)}` : `A = ${bool(A)}, B = ${bool(B)}, C = ${bool(C)}`;
    return poolQ('i.logic', d, {
      prompt: L(
        `Find the value of the logical expression ${expr} when ${values} (1 is true, 0 is false).`,
        `Найди значение логического выражения ${expr} при ${values} (1 — истина, 0 — ложь).`,
        `${values} болғанда ${expr} логикалық өрнегінің мәнін тап (1 — ақиқат, 0 — жалған).`,
      ),
      ex: steps(
        L(
          '∧ (AND) is true only if both parts are true; ∨ (OR) is true if at least one part is true; ¬ (NOT) reverses the value; A → B is false only when A is true and B is false.',
          '∧ (И) истинно, только если истинны обе части; ∨ (ИЛИ) истинно, если истинна хотя бы одна часть; ¬ (НЕ) меняет значение на противоположное; A → B ложно только при истинном A и ложном B.',
          '∧ (ЖӘНЕ) екі бөлігі де ақиқат болса ғана ақиқат; ∨ (НЕМЕСЕ) кемінде бір бөлігі ақиқат болса ақиқат; ¬ (ЕМЕС) мәнді керісіне өзгертеді; A → B тек A ақиқат, B жалған болғанда жалған.',
        ),
        L(`The result is ${bool(value)} (${value ? TRUTH.en : FALSE.en}).`, `Результат: ${bool(value)} (${value ? TRUTH.ru : FALSE.ru}).`, `Нәтиже: ${bool(value)} (${value ? TRUTH.kk : FALSE.kk}).`),
      ),
      mc: mcText(rng, value ? L('1 (true)', '1 (истина)', '1 (ақиқат)') : L('0 (false)', '0 (ложь)', '0 (жалған)'), [
        value ? L('0 (false)', '0 (ложь)', '0 (жалған)') : L('1 (true)', '1 (истина)', '1 (ақиқат)'),
        L('depends on A only', 'зависит только от A', 'тек A-ға тәуелді'),
        L('cannot be determined', 'определить нельзя', 'анықтау мүмкін емес'),
      ]),
    });
  }
  const [expr, fn] = pick(rng, [
    ['(A ∨ B) ∧ C', (a, b, c) => (a || b) && c],
    ['A ∧ (B ∨ ¬C)', (a, b, c) => a && (b || !c)],
    ['(A → B) ∨ C', (a, b, c) => !a || b || c],
    ['¬A ∧ (B ∨ C)', (a, b, c) => !a && (b || c)],
    ['(A ∧ B) ∨ (¬A ∧ C)', (a, b, c) => (a && b) || (!a && c)],
  ]);
  let count = 0;
  for (let mask = 0; mask < 8; mask++) if (fn(Boolean(mask & 4), Boolean(mask & 2), Boolean(mask & 1))) count += 1;
  return poolQ('i.logic', d, {
    prompt: L(
      `For how many of the 8 sets of values of A, B and C is the expression ${expr} true?`,
      `При скольких из 8 наборов значений A, B и C выражение ${expr} истинно?`,
      `A, B және C мәндерінің 8 жиынтығының нешеуінде ${expr} өрнегі ақиқат болады?`,
    ),
    ex: steps(
      L('Build the truth table: three variables give 2³ = 8 rows.', 'Строим таблицу истинности: три переменные дают 2³ = 8 строк.', 'Ақиқат кестесін құрамыз: үш айнымалы 2³ = 8 жол береді.'),
      L(`The expression is true in ${count} rows.`, `Выражение истинно в ${count} строках.`, `Өрнек ${count} жолда ақиқат.`),
    ),
    ...ask(ctx, count, [8 - count, count + 1, count - 1, count + 2].filter((x) => x !== count && x >= 0 && x <= 8)),
  });
}

export function algorithms(ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const count = randomInt(rng, 3, 8);
    const step = randomInt(rng, 2, 6);
    const start = randomInt(rng, 0, 10);
    const result = start + count * step;
    return poolQ('i.algo', d, {
      prompt: L(
        `What is the value of s after the program runs? ${code(`s := ${start}`, `repeat ${count} times`, `  s := s + ${step}`)}`,
        `Чему равно значение s после выполнения программы? ${code(`s := ${start}`, `повторить ${count} ${plural(count, 'раз', 'раза', 'раз')}`, `  s := s + ${step}`)}`,
        `Бағдарлама орындалғаннан кейін s мәні нешеге тең? ${code(`s := ${start}`, `${count} рет қайталау`, `  s := s + ${step}`)}`,
      ),
      ex: steps(
        L(`Each pass adds ${step}, and there are ${count} passes.`, `Каждое повторение прибавляет ${step}, повторений ${count}.`, `Әр қайталау ${step} қосады, қайталау саны ${count}.`),
        same(`${start} + ${count} ${TIMES} ${step} = ${result}`),
      ),
      ...ask(ctx, result, [count * step, result + step, result - step, start + step]),
    });
  }
  if (d === 2) {
    const limit = randomInt(rng, 20, 60);
    const mult = pick(rng, [2, 3]);
    let x = 1;
    let passes = 0;
    while (x < limit) {
      x *= mult;
      passes += 1;
    }
    const askCount = rng() < 0.5;
    return poolQ('i.algo', d, {
      prompt: askCount
        ? L(
            `How many times will the body of the loop run? ${code('x := 1', `while x < ${limit}`, `  x := x * ${mult}`)}`,
            `Сколько раз выполнится тело цикла? ${code('x := 1', `пока x < ${limit}`, `  x := x * ${mult}`)}`,
            `Цикл денесі неше рет орындалады? ${code('x := 1', `әзірге x < ${limit}`, `  x := x * ${mult}`)}`,
          )
        : L(
            `What is the value of x after the program runs? ${code('x := 1', `while x < ${limit}`, `  x := x * ${mult}`)}`,
            `Чему равно значение x после выполнения программы? ${code('x := 1', `пока x < ${limit}`, `  x := x * ${mult}`)}`,
            `Бағдарлама орындалғаннан кейін x мәні нешеге тең? ${code('x := 1', `әзірге x < ${limit}`, `  x := x * ${mult}`)}`,
          ),
      ex: steps(
        L(
          `x takes the values ${Array.from({ length: passes + 1 }, (_, i) => mult ** i).join(', ')}. The loop stops when x is no longer less than ${limit}.`,
          `x принимает значения ${Array.from({ length: passes + 1 }, (_, i) => mult ** i).join(', ')}. Цикл останавливается, когда x перестаёт быть меньше ${limit}.`,
          `x мына мәндерді қабылдайды: ${Array.from({ length: passes + 1 }, (_, i) => mult ** i).join(', ')}. x ${limit}-ден кіші болмай қалғанда цикл тоқтайды.`,
        ),
        askCount
          ? L(`The body ran ${passes} times.`, `Тело цикла выполнилось ${passes} ${plural(passes, 'раз', 'раза', 'раз')}.`, `Цикл денесі ${passes} рет орындалды.`)
          : same(`x = ${x}`),
      ),
      ...ask(ctx, askCount ? passes : x, askCount ? [passes + 1, passes - 1, passes + 2, limit] : [x / mult, x * mult, limit, x + mult]),
    });
  }
  const last = randomInt(rng, 6, 14);
  const k = pick(rng, [2, 3]);
  let total = 0;
  const picked = [];
  for (let i = 1; i <= last; i++) {
    if (i % k === 0) {
      total += i;
      picked.push(i);
    }
  }
  return poolQ('i.algo', d, {
    prompt: L(
      `What is the value of s after the program runs? ${code('s := 0', `for i from 1 to ${last}`, `  if i is divisible by ${k} then`, '    s := s + i')}`,
      `Чему равно значение s после выполнения программы? ${code('s := 0', `для i от 1 до ${last}`, `  если i делится на ${k} то`, '    s := s + i')}`,
      `Бағдарлама орындалғаннан кейін s мәні нешеге тең? ${code('s := 0', `i үшін 1-ден ${last}-ге дейін`, `  егер i ${k}-ге бөлінсе онда`, '    s := s + i')}`,
    ),
    ex: steps(
      L(`Only the numbers divisible by ${k} are added: ${picked.join(', ')}.`, `Складываются только числа, которые делятся на ${k}: ${picked.join(', ')}.`, `Тек ${k}-ге бөлінетін сандар қосылады: ${picked.join(', ')}.`),
      same(`${picked.join(' + ')} = ${total}`),
    ),
    ...ask(ctx, total, [(last * (last + 1)) / 2, picked.length, total + k, total - k].filter((x) => x !== total && x > 0)),
  });
}

export const INFORMATICS_THEORY = [
  [1, T('Какое устройство компьютера выполняет вычисления и управляет работой остальных устройств?', 'Компьютердің қай құрылғысы есептеулерді орындап, басқа құрылғылардың жұмысын басқарады?', 'Which part of a computer performs calculations and controls the other devices?'),
    T('процессор', 'процессор', 'the processor'), [T('жёсткий диск', 'қатқыл диск', 'the hard disk'), T('монитор', 'монитор', 'the monitor'), T('оперативная память', 'жедел жады', 'the RAM')],
    T('Процессор выполняет команды программ и управляет остальными устройствами.', 'Процессор бағдарлама командаларын орындайды және басқа құрылғыларды басқарады.', 'The processor executes program instructions and controls the other devices.')],
  [1, T('Какая память компьютера очищается при выключении питания?', 'Компьютердің қай жадысы қорек өшірілгенде тазарады?', 'Which computer memory is cleared when the power is switched off?'),
    T('оперативная память', 'жедел жады', 'RAM'), [T('жёсткий диск', 'қатқыл диск', 'the hard disk'), T('флеш-накопитель', 'флеш-жинақтауыш', 'a flash drive'), T('постоянная память', 'тұрақты жады', 'ROM')],
    T('Оперативная память хранит данные только пока компьютер включён.', 'Жедел жады деректерді тек компьютер қосулы кезде ғана сақтайды.', 'RAM keeps data only while the computer is switched on.')],
  [1, T('Какое расширение обычно имеет текстовый файл без оформления?', 'Безендірусіз мәтіндік файлдың кеңейтілуі әдетте қандай?', 'Which extension does a plain text file usually have?'),
    '.txt', ['.jpg', '.mp3', '.exe'],
    T('.txt — простой текст, .jpg — изображение, .mp3 — звук, .exe — программа.', '.txt — қарапайым мәтін, .jpg — сурет, .mp3 — дыбыс, .exe — бағдарлама.', '.txt is plain text, .jpg is an image, .mp3 is sound, .exe is a program.')],
  [2, T('Сколько разных значений можно закодировать с помощью 5 бит?', '5 биттің көмегімен неше түрлі мәнді кодтауға болады?', 'How many different values can be encoded with 5 bits?'),
    '32', ['10', '25', '64'],
    T('N бит дают 2ᴺ разных кодов: 2⁵ = 32.', 'N бит 2ᴺ түрлі код береді: 2⁵ = 32.', 'N bits give 2ᴺ different codes: 2⁵ = 32.')],
  [2, T('Какой протокол используется для передачи веб-страниц?', 'Веб-беттерді жіберу үшін қай хаттама қолданылады?', 'Which protocol is used to transfer web pages?'),
    'HTTP', ['FTP', 'SMTP', 'POP3'],
    T('HTTP (и его защищённая версия HTTPS) передаёт веб-страницы. FTP — файлы, SMTP и POP3 — электронную почту.', 'HTTP (және оның қорғалған нұсқасы HTTPS) веб-беттерді жібереді. FTP — файлдарды, SMTP мен POP3 — электрондық поштаны.', 'HTTP (and its secure version HTTPS) transfers web pages. FTP transfers files, SMTP and POP3 handle e-mail.')],
  [2, T('Как называется алгоритм, в котором действия повторяются, пока выполняется условие?', 'Шарт орындалып тұрғанда әрекеттер қайталанатын алгоритм қалай аталады?', 'What is an algorithm called in which actions repeat while a condition holds?'),
    T('циклический', 'циклдік', 'a loop'), [T('линейный', 'сызықтық', 'linear'), T('разветвляющийся', 'тармақталған', 'branching'), T('вспомогательный', 'көмекші', 'auxiliary')],
    T('Повторение действий — это цикл. В линейном алгоритме действия идут подряд, в разветвляющемся выбирается одна из ветвей.', 'Әрекеттердің қайталануы — цикл. Сызықтық алгоритмде әрекеттер бірінен соң бірі орындалады, тармақталғанда бір тармақ таңдалады.', 'Repeating actions is a loop. In a linear algorithm the steps follow one another; in a branching one a single branch is chosen.')],
  [3, T('В электронной таблице в ячейке C1 записана формула =A1+$B$1. Какой она станет, если скопировать её в ячейку C2?', 'Электрондық кестеде C1 ұяшығына =A1+$B$1 формуласы жазылған. Оны C2 ұяшығына көшірсе, ол қандай болады?', 'In a spreadsheet, cell C1 contains the formula =A1+$B$1. What will it become when copied to cell C2?'),
    '=A2+$B$1', ['=A1+$B$1', '=A2+$B$2', '=B1+$B$1'],
    T('Относительная ссылка A1 сдвигается вместе с формулой и становится A2. Абсолютная ссылка $B$1 не меняется.', 'Салыстырмалы сілтеме A1 формуламен бірге жылжып, A2 болады. Абсолютті сілтеме $B$1 өзгермейді.', 'The relative reference A1 shifts with the formula and becomes A2. The absolute reference $B$1 does not change.')],
  [3, T('Сколько единиц в маске подсети 255.255.255.0, записанной в двоичном виде?', '255.255.255.0 ішкі желі маскасының екілік жазылуында неше бір цифры бар?', 'How many ones are there in the subnet mask 255.255.255.0 written in binary?'),
    '24', ['8', '16', '32'],
    T('255 — это восемь единиц (11111111). Три таких числа дают 3 × 8 = 24 единицы.', '255 — сегіз бір цифры (11111111). Осындай үш сан 3 × 8 = 24 бірлік береді.', '255 is eight ones (11111111). Three such numbers give 3 × 8 = 24 ones.')],
];
