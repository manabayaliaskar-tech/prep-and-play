// Программирование: задачи «Что выведет программа?» для Python, C++, JavaScript и Java.
// Программа строится как маленькое дерево (AST), потом печатается в синтаксисе выбранного языка,
// а ответ получается настоящим выполнением этого дерева. Так ответ всегда совпадает с кодом.
// Все числа неотрицательные: тогда целочисленное деление и остаток одинаковы во всех языках.

import { pick, randomInt } from '../core/random.js';
import { L, ask, poolQ, steps } from './gen.js';

export const CODE_LANGS = {
  py: { name: 'Python', indent: '    ' },
  cpp: { name: 'C++', indent: '    ' },
  js: { name: 'JavaScript', indent: '  ' },
  java: { name: 'Java', indent: '    ' },
};

// ---------- Выражения ----------

const num = (v) => ({ op: 'num', v });
const ref = (name) => ({ op: 'var', name });
const bin = (o, a, b) => ({ op: 'bin', o, a, b });
const idx = (name, i) => ({ op: 'idx', name, i });
const len = (name) => ({ op: 'len', name });
const call = (name, ...args) => ({ op: 'call', name, args });

const PREC = { or: 1, and: 2, '==': 3, '!=': 3, '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, div: 6, '%': 6 };

function expr(e, lang, parent = 0) {
  switch (e.op) {
    case 'num':
      return String(e.v);
    case 'var':
      return e.name;
    case 'idx':
      return `${e.name}[${expr(e.i, lang)}]`;
    case 'len':
      return lang === 'py' ? `len(${e.name})` : lang === 'cpp' ? `${e.name}.size()` : `${e.name}.length`;
    case 'call':
      return `${e.name}(${e.args.map((a) => expr(a, lang)).join(', ')})`;
    case 'bin': {
      const p = PREC[e.o];
      const a = expr(e.a, lang, p);
      const b = expr(e.b, lang, p + 1);
      let text;
      if (e.o === 'div') text = lang === 'py' ? `${a} // ${b}` : lang === 'js' ? `Math.floor(${expr(e.a, lang)} / ${expr(e.b, lang)})` : `${a} / ${b}`;
      else if (e.o === 'and') text = lang === 'py' ? `${a} and ${b}` : `${a} && ${b}`;
      else if (e.o === 'or') text = lang === 'py' ? `${a} or ${b}` : `${a} || ${b}`;
      else text = `${a} ${e.o} ${b}`;
      if (e.o === 'div' && lang === 'js') return text;
      return p < parent ? `(${text})` : text;
    }
    default:
      throw new Error(`Unknown expression ${e.op}`);
  }
}

function evaluate(e, env) {
  switch (e.op) {
    case 'num':
      return e.v;
    case 'var':
      if (!(e.name in env.vars)) throw new Error(`Undefined ${e.name}`);
      return env.vars[e.name];
    case 'idx':
      return env.vars[e.name][evaluate(e.i, env)];
    case 'len':
      return env.vars[e.name].length;
    case 'call': {
      const fn = env.funcs[e.name];
      const local = { vars: { ...Object.fromEntries(fn.params.map((p, i) => [p, evaluate(e.args[i], env)])) }, funcs: env.funcs, out: env.out, depth: env.depth + 1 };
      if (local.depth > 50) throw new Error('Too deep');
      return run(fn.body, local);
    }
    case 'bin': {
      const a = evaluate(e.a, env);
      const b = evaluate(e.b, env);
      switch (e.o) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case 'div': return Math.floor(a / b);
        case '%': return a % b;
        case '<': return a < b;
        case '>': return a > b;
        case '<=': return a <= b;
        case '>=': return a >= b;
        case '==': return a === b;
        case '!=': return a !== b;
        case 'and': return a && b;
        case 'or': return a || b;
        default: throw new Error(e.o);
      }
    }
    default:
      throw new Error(`Unknown expression ${e.op}`);
  }
}

// ---------- Операторы ----------

const set = (name, e) => ({ t: 'set', name, e });
const aug = (name, o, e) => ({ t: 'aug', name, o, e });
const print = (e) => ({ t: 'print', e });
const forRange = (v, from, to, body) => ({ t: 'for', v, from, to, body });
const whileLoop = (c, body) => ({ t: 'while', c, body });
const ifChain = (branches, otherwise = null) => ({ t: 'if', branches, otherwise });
const array = (name, items) => ({ t: 'arr', name, items });
const func = (name, params, body) => ({ t: 'func', name, params, body });
const ret = (e) => ({ t: 'ret', e });

function run(body, env) {
  for (const s of body) {
    switch (s.t) {
      case 'set':
        env.vars[s.name] = evaluate(s.e, env);
        break;
      case 'aug': {
        const v = evaluate(s.e, env);
        env.vars[s.name] = s.o === '+' ? env.vars[s.name] + v : s.o === '-' ? env.vars[s.name] - v : env.vars[s.name] * v;
        break;
      }
      case 'print':
        env.out.push(evaluate(s.e, env));
        break;
      case 'arr':
        env.vars[s.name] = [...s.items];
        break;
      case 'func':
        env.funcs[s.name] = s;
        break;
      case 'ret':
        return evaluate(s.e, env);
      case 'for': {
        const from = evaluate(s.from, env);
        const to = evaluate(s.to, env);
        for (let i = from; i < to; i++) {
          env.vars[s.v] = i;
          const r = run(s.body, env);
          if (r !== undefined) return r;
        }
        break;
      }
      case 'while': {
        let guard = 0;
        while (evaluate(s.c, env)) {
          if (++guard > 1000) throw new Error('Endless loop');
          const r = run(s.body, env);
          if (r !== undefined) return r;
        }
        break;
      }
      case 'if': {
        const branch = s.branches.find(([c]) => evaluate(c, env));
        const body = branch ? branch[1] : s.otherwise;
        if (body) {
          const r = run(body, env);
          if (r !== undefined) return r;
        }
        break;
      }
      default:
        throw new Error(`Unknown statement ${s.t}`);
    }
  }
  return undefined;
}

/** Выполняет программу и возвращает всё, что она напечатала. */
export function execute(program) {
  const env = { vars: {}, funcs: {}, out: [], depth: 0 };
  run(program, env);
  return env.out;
}

/** Печатает программу в синтаксисе языка. */
export function render(program, lang) {
  const { indent } = CODE_LANGS[lang];
  const lines = [];
  const declared = new Set();
  const braces = lang !== 'py';
  const emit = (depth, text) => lines.push(indent.repeat(depth) + text);
  const end = lang === 'py' ? '' : ';';

  function block(body, depth) {
    for (const s of body) statement(s, depth);
  }

  function statement(s, depth) {
    switch (s.t) {
      case 'set': {
        const first = !declared.has(s.name);
        declared.add(s.name);
        const value = expr(s.e, lang);
        if (lang === 'py') emit(depth, `${s.name} = ${value}`);
        else if (lang === 'js') emit(depth, `${first ? 'let ' : ''}${s.name} = ${value};`);
        else emit(depth, `${first ? 'int ' : ''}${s.name} = ${value};`);
        break;
      }
      case 'aug':
        emit(depth, `${s.name} ${s.o}= ${expr(s.e, lang)}${end}`);
        break;
      case 'print': {
        const value = expr(s.e, lang);
        emit(depth, lang === 'py' ? `print(${value})` : lang === 'cpp' ? `cout << ${value} << endl;` : lang === 'js' ? `console.log(${value});` : `System.out.println(${value});`);
        break;
      }
      case 'arr': {
        declared.add(s.name);
        const items = s.items.join(', ');
        if (lang === 'py') emit(depth, `${s.name} = [${items}]`);
        else if (lang === 'cpp') emit(depth, `vector<int> ${s.name} = {${items}};`);
        else if (lang === 'js') emit(depth, `let ${s.name} = [${items}];`);
        else emit(depth, `int[] ${s.name} = {${items}};`);
        break;
      }
      case 'func': {
        const params = s.params.join(', ');
        const typed = s.params.map((p) => `int ${p}`).join(', ');
        if (lang === 'py') emit(depth, `def ${s.name}(${params}):`);
        else if (lang === 'cpp') emit(depth, `int ${s.name}(${typed}) {`);
        else if (lang === 'js') emit(depth, `function ${s.name}(${params}) {`);
        else emit(depth, `static int ${s.name}(${typed}) {`);
        const saved = new Set(declared);
        s.params.forEach((p) => declared.add(p));
        block(s.body, depth + 1);
        declared.clear();
        saved.forEach((v) => declared.add(v));
        if (braces) emit(depth, '}');
        if (lang === 'py') lines.push('');
        break;
      }
      case 'ret':
        emit(depth, `return ${expr(s.e, lang)}${end}`);
        break;
      case 'for': {
        const from = expr(s.from, lang);
        const to = expr(s.to, lang);
        declared.add(s.v);
        if (lang === 'py') emit(depth, `for ${s.v} in range(${from === '0' ? '' : `${from}, `}${to}):`);
        else emit(depth, `for (${lang === 'js' ? 'let' : 'int'} ${s.v} = ${from}; ${s.v} < ${to}; ${s.v}++) {`);
        block(s.body, depth + 1);
        if (braces) emit(depth, '}');
        break;
      }
      case 'while':
        emit(depth, lang === 'py' ? `while ${expr(s.c, lang)}:` : `while (${expr(s.c, lang)}) {`);
        block(s.body, depth + 1);
        if (braces) emit(depth, '}');
        break;
      case 'if':
        s.branches.forEach(([c, body], i) => {
          const cond = expr(c, lang);
          if (lang === 'py') emit(depth, `${i === 0 ? 'if' : 'elif'} ${cond}:`);
          else emit(depth, `${i === 0 ? '' : '} else '}if (${cond}) {`);
          block(body, depth + 1);
        });
        if (s.otherwise) {
          emit(depth, lang === 'py' ? 'else:' : '} else {');
          block(s.otherwise, depth + 1);
        }
        if (braces) emit(depth, '}');
        break;
      default:
        throw new Error(`Unknown statement ${s.t}`);
    }
  }

  block(program, 0);
  while (lines.at(-1) === '') lines.pop();
  return lines;
}

/** Блок кода для условия задания. */
export function codeHtml(lines) {
  const esc = (line) => line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/^ +/, (m) => '&nbsp;'.repeat(m.length));
  return `<span class="code-block">${lines.map((line) => `<span>${line ? esc(line) : '&nbsp;'}</span>`).join('')}</span>`;
}

const PROMPT = L('What will the program print?', 'Что выведет программа?', 'Бағдарлама не шығарады?');

function codeQ(topic, lang, d, program, why, wrong) {
  const out = execute(program);
  const answer = out.at(-1);
  const prompt = L(`${PROMPT.en} ${codeHtml(render(program, lang))}`, `${PROMPT.ru} ${codeHtml(render(program, lang))}`, `${PROMPT.kk} ${codeHtml(render(program, lang))}`);
  return { ...poolQ(topic, d, { prompt, ex: steps(...why), ...ask(CTX.current, answer, wrong.filter((v) => Number.isInteger(v) && v !== answer && v >= 0)) }), program };
}

/** Контекст текущего вызова генератора (rng, mcOnly) - чтобы не передавать его в каждую функцию. */
const CTX = { current: null };

// ---------- Генераторы по темам ----------

const NOTE_DIV = L(
  'Integer division drops the remainder: in Python it is //, in C++ and Java / between integers, in JavaScript Math.floor(a / b). The remainder is %.',
  'Целочисленное деление отбрасывает остаток: в Python это //, в C++ и Java - / между целыми числами, в JavaScript - Math.floor(a / b). Остаток - %.',
  'Бүтін бөлу қалдықты тастайды: Python-да //, C++ пен Java-да бүтін сандар арасындағы /, JavaScript-те Math.floor(a / b). Қалдық - %.',
);

function vars(lang, ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const a = randomInt(rng, 2, 12);
    const b = randomInt(rng, 2, 9);
    const c = randomInt(rng, 2, 5);
    const program = [set('x', num(a)), set('y', num(b)), print(bin('+', ref('x'), bin('*', ref('y'), num(c))))];
    return codeQ(`${lang}.vars`, lang, d, program, [
      L('Multiplication is done before addition.', 'Умножение выполняется раньше сложения.', 'Көбейту қосудан бұрын орындалады.'),
      L(`x + y * ${c} = ${a} + ${b * c} = ${a + b * c}`, `x + y * ${c} = ${a} + ${b * c} = ${a + b * c}`, `x + y * ${c} = ${a} + ${b * c} = ${a + b * c}`),
    ], [(a + b) * c, a + b + c, a * b * c, a + b * c + 1]);
  }
  if (d === 2) {
    const b = randomInt(rng, 3, 7);
    const a = b * randomInt(rng, 2, 9) + randomInt(rng, 1, b - 1);
    const q = Math.floor(a / b);
    const r = a % b;
    const program = [set('a', num(a)), set('b', num(b)), print(bin('+', bin('div', ref('a'), ref('b')), bin('%', ref('a'), ref('b'))))];
    return codeQ(`${lang}.vars`, lang, d, program, [
      NOTE_DIV,
      L(`${a} divided by ${b}: quotient ${q}, remainder ${r}; ${q} + ${r} = ${q + r}.`, `${a} делим на ${b}: частное ${q}, остаток ${r}; ${q} + ${r} = ${q + r}.`, `${a}-ны ${b}-ге бөлеміз: бөлінді ${q}, қалдық ${r}; ${q} + ${r} = ${q + r}.`),
    ], [q, r, q * r, Math.round(a / b) + r, q + r + 1]);
  }
  const a = randomInt(rng, 2, 9);
  const b = randomInt(rng, 2, 9);
  const program = [set('x', num(a)), set('y', num(b)), set('x', bin('+', ref('x'), ref('y'))), set('y', bin('-', ref('x'), ref('y'))), set('x', bin('-', ref('x'), ref('y'))), print(bin('+', bin('*', ref('x'), num(10)), ref('y')))];
  return codeQ(`${lang}.vars`, lang, d, program, [
    L(
      `Step by step: x = ${a + b}, then y = ${a + b} − ${b} = ${a}, then x = ${a + b} − ${a} = ${b}. The values were swapped.`,
      `По шагам: x = ${a + b}, затем y = ${a + b} − ${b} = ${a}, затем x = ${a + b} − ${a} = ${b}. Значения поменялись местами.`,
      `Қадамдап: x = ${a + b}, сосын y = ${a + b} − ${b} = ${a}, сосын x = ${a + b} − ${a} = ${b}. Мәндер орын ауыстырды.`,
    ),
    L(`x * 10 + y = ${b * 10 + a}`, `x * 10 + y = ${b * 10 + a}`, `x * 10 + y = ${b * 10 + a}`),
  ], [a * 10 + b, (a + b) * 10 + a, b * 10 + b, a * 10 + a]);
}

function cond(lang, ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const x = randomInt(rng, 3, 40);
    const program = [set('x', num(x)), ifChain([[bin('==', bin('%', ref('x'), num(2)), num(0)), [print(bin('div', ref('x'), num(2)))]]], [print(bin('+', bin('*', ref('x'), num(3)), num(1)))])];
    const even = x % 2 === 0;
    return codeQ(`${lang}.cond`, lang, d, program, [
      L(`${x} % 2 = ${x % 2}, so the condition is ${even ? 'true' : 'false'}.`, `${x} % 2 = ${x % 2}, поэтому условие ${even ? 'истинно' : 'ложно'}.`, `${x} % 2 = ${x % 2}, сондықтан шарт ${even ? 'ақиқат' : 'жалған'}.`),
      even ? L(`The first branch runs: ${x} / 2 = ${x / 2}.`, `Выполняется первая ветка: ${x} / 2 = ${x / 2}.`, `Бірінші тармақ орындалады: ${x} / 2 = ${x / 2}.`) : L(`The else branch runs: ${x} * 3 + 1 = ${3 * x + 1}.`, `Выполняется ветка else: ${x} * 3 + 1 = ${3 * x + 1}.`, `else тармағы орындалады: ${x} * 3 + 1 = ${3 * x + 1}.`),
    ], [Math.floor(x / 2), 3 * x + 1, x, x + 1]);
  }
  if (d === 2) {
    const score = randomInt(rng, 40, 100);
    const program = [
      set('score', num(score)),
      ifChain(
        [
          [bin('>=', ref('score'), num(90)), [print(num(5))]],
          [bin('>=', ref('score'), num(75)), [print(num(4))]],
          [bin('>=', ref('score'), num(60)), [print(num(3))]],
        ],
        [print(num(2))],
      ),
    ];
    return codeQ(`${lang}.cond`, lang, d, program, [
      L(
        'The conditions are checked from top to bottom; only the first true branch runs.',
        'Условия проверяются сверху вниз; выполняется только первая истинная ветка.',
        'Шарттар жоғарыдан төмен тексеріледі; тек бірінші ақиқат тармақ орындалады.',
      ),
      L(`score = ${score}.`, `score = ${score}.`, `score = ${score}.`),
    ], [2, 3, 4, 5]);
  }
  const a = randomInt(rng, 2, 4);
  let b = randomInt(rng, 3, 7);
  if (b === a) b += 1;
  const n = randomInt(rng, 12, 30);
  let count = 0;
  for (let i = 1; i <= n; i++) if (i % a === 0 || i % b === 0) count += 1;
  const program = [
    set('count', num(0)),
    forRange('i', num(1), num(n + 1), [ifChain([[bin('or', bin('==', bin('%', ref('i'), num(a)), num(0)), bin('==', bin('%', ref('i'), num(b)), num(0))), [aug('count', '+', num(1))]]])]),
    print(ref('count')),
  ];
  return codeQ(`${lang}.cond`, lang, d, program, [
    L(`The loop goes over i from 1 to ${n} and counts the numbers divisible by ${a} or by ${b}.`, `Цикл перебирает i от 1 до ${n} и считает числа, которые делятся на ${a} или на ${b}.`, `Цикл i-ді 1-ден ${n}-ге дейін қарап, ${a}-ге немесе ${b}-ге бөлінетін сандарды санайды.`),
    L(`There are ${count} such numbers.`, `Таких чисел: ${count}.`, `Мұндай сандар: ${count}.`),
  ], [Math.floor(n / a) + Math.floor(n / b), Math.floor(n / a), count + 1, count - 1]);
}

function loop(lang, ctx, d) {
  const { rng } = ctx;
  if (d === 1) {
    const n = randomInt(rng, 4, 12);
    const sum = (n * (n + 1)) / 2;
    const program = [set('s', num(0)), forRange('i', num(1), num(n + 1), [aug('s', '+', ref('i'))]), print(ref('s'))];
    return codeQ(`${lang}.loop`, lang, d, program, [
      L(`The loop adds i from 1 to ${n} (the upper bound ${n + 1} is not included).`, `Цикл прибавляет i от 1 до ${n} (верхняя граница ${n + 1} не включается).`, `Цикл i-ді 1-ден ${n}-ге дейін қосады (жоғарғы шек ${n + 1} кірмейді).`),
      L(`1 + 2 + … + ${n} = ${sum}`, `1 + 2 + … + ${n} = ${sum}`, `1 + 2 + … + ${n} = ${sum}`),
    ], [sum + n + 1, sum - n, n, sum + 1]);
  }
  if (d === 2) {
    const n = randomInt(rng, 8, 20);
    const k = pick(rng, [2, 3]);
    let total = 0;
    for (let i = 0; i < n; i++) if (i % k === 0) total += i;
    const program = [set('total', num(0)), forRange('i', num(0), num(n), [ifChain([[bin('==', bin('%', ref('i'), num(k)), num(0)), [aug('total', '+', ref('i'))]]])]), print(ref('total'))];
    const picked = [];
    for (let i = 0; i < n; i += k) picked.push(i);
    return codeQ(`${lang}.loop`, lang, d, program, [
      L(`i goes from 0 to ${n - 1}; only multiples of ${k} are added: ${picked.join(', ')}.`, `i идёт от 0 до ${n - 1}; прибавляются только кратные ${k}: ${picked.join(', ')}.`, `i 0-ден ${n - 1}-ге дейін өзгереді; тек ${k}-ге еселілер қосылады: ${picked.join(', ')}.`),
      L(`Sum: ${total}.`, `Сумма: ${total}.`, `Қосынды: ${total}.`),
    ], [total + n, ((n - 1) * n) / 2, picked.length, total - k]);
  }
  const limit = randomInt(rng, 20, 200);
  const program = [set('x', num(1)), set('steps', num(0)), whileLoop(bin('<', ref('x'), num(limit)), [aug('x', '*', num(2)), aug('steps', '+', num(1))]), print(ref('steps'))];
  let x = 1;
  const values = [1];
  while (x < limit) {
    x *= 2;
    values.push(x);
  }
  return codeQ(`${lang}.loop`, lang, d, program, [
    L(`x doubles while it is less than ${limit}: ${values.join(', ')}.`, `x удваивается, пока он меньше ${limit}: ${values.join(', ')}.`, `x ${limit}-ден кіші болғанша екі еселенеді: ${values.join(', ')}.`),
    L(`The loop ran ${values.length - 1} times.`, `Цикл выполнился ${values.length - 1} раз.`, `Цикл ${values.length - 1} рет орындалды.`),
  ], [values.length, values.length - 2, x, Math.floor(limit / 2)]);
}

function arrays(lang, ctx, d) {
  const { rng } = ctx;
  const items = Array.from({ length: randomInt(rng, 4, 6) }, () => randomInt(rng, 1, 20));
  if (d === 1) {
    const i = randomInt(rng, 1, items.length - 1);
    const program = [array('a', items), print(bin('+', idx('a', num(i)), idx('a', num(0))))];
    return codeQ(`${lang}.arr`, lang, d, program, [
      L('Indexes start at 0: a[0] is the first element.', 'Нумерация элементов начинается с 0: a[0] - первый элемент.', 'Элементтердің нөмірленуі 0-ден басталады: a[0] - бірінші элемент.'),
      L(`a[${i}] + a[0] = ${items[i]} + ${items[0]} = ${items[i] + items[0]}`, `a[${i}] + a[0] = ${items[i]} + ${items[0]} = ${items[i] + items[0]}`, `a[${i}] + a[0] = ${items[i]} + ${items[0]} = ${items[i] + items[0]}`),
    ], [items[i - 1] + items[0], (items[i + 1] ?? items[0]) + items[1], items[i] + items[1], items[i] + items[0] + 1]);
  }
  if (d === 2) {
    const sum = items.reduce((s, v) => s + v, 0);
    const program = [array('a', items), set('s', num(0)), forRange('i', num(0), len('a'), [aug('s', '+', idx('a', ref('i')))]), print(ref('s'))];
    return codeQ(`${lang}.arr`, lang, d, program, [
      L('The loop goes over every index and adds the elements.', 'Цикл проходит по всем индексам и складывает элементы.', 'Цикл барлық индекстерді аралап, элементтерді қосады.'),
      L(`${items.join(' + ')} = ${sum}`, `${items.join(' + ')} = ${sum}`, `${items.join(' + ')} = ${sum}`),
    ], [sum - items[0], sum - items.at(-1), items.length, sum + 1]);
  }
  const max = Math.max(...items);
  const program = [
    array('a', items),
    set('m', idx('a', num(0))),
    forRange('i', num(1), len('a'), [ifChain([[bin('>', idx('a', ref('i')), ref('m')), [set('m', idx('a', ref('i')))]]])]),
    print(ref('m')),
  ];
  return codeQ(`${lang}.arr`, lang, d, program, [
    L('m keeps the largest element seen so far.', 'В m хранится наибольший из уже просмотренных элементов.', 'm-де осыған дейін қаралған элементтердің ең үлкені сақталады.'),
    L(`The maximum of ${items.join(', ')} is ${max}.`, `Максимум из ${items.join(', ')} - ${max}.`, `${items.join(', ')} сандарының ең үлкені - ${max}.`),
  ], [Math.min(...items), items[0], items.at(-1), items.reduce((s, v) => s + v, 0)]);
}

function funcs(lang, ctx, d) {
  const { rng } = ctx;
  if (d < 3) {
    const k = randomInt(rng, 1, 9);
    const a = randomInt(rng, 2, 6);
    const b = randomInt(rng, 2, 6);
    const f = (x) => x * x + k;
    const program = [func('f', ['x'], [ret(bin('+', bin('*', ref('x'), ref('x')), num(k)))]), print(bin('+', call('f', num(a)), call('f', num(b))))];
    return codeQ(`${lang}.func`, lang, d, program, [
      L(`f(${a}) = ${a} * ${a} + ${k} = ${f(a)}, f(${b}) = ${f(b)}.`, `f(${a}) = ${a} * ${a} + ${k} = ${f(a)}, f(${b}) = ${f(b)}.`, `f(${a}) = ${a} * ${a} + ${k} = ${f(a)}, f(${b}) = ${f(b)}.`),
      L(`${f(a)} + ${f(b)} = ${f(a) + f(b)}`, `${f(a)} + ${f(b)} = ${f(a) + f(b)}`, `${f(a)} + ${f(b)} = ${f(a) + f(b)}`),
    ], [a * a + b * b + k, f(a + b), 2 * a + 2 * b + 2 * k, f(a) + f(b) + 1]);
  }
  // Сложность 3: рекурсия - факториал, сумма, числа Фибоначчи или степень.
  const kind = pick(rng, ['fact', 'sum', 'fib', 'pow']);
  if (kind === 'sum') {
    const n = randomInt(rng, 4, 12);
    const total = (n * (n + 1)) / 2;
    const program = [
      func('s', ['n'], [ifChain([[bin('<=', ref('n'), num(0)), [ret(num(0))]]]), ret(bin('+', ref('n'), call('s', bin('-', ref('n'), num(1)))))]),
      print(call('s', num(n))),
    ];
    return codeQ(`${lang}.func`, lang, d, program, [
      L('The function adds n to the result for n − 1 until n reaches 0 (recursion).', 'Функция прибавляет n к результату для n − 1, пока n не станет 0 (рекурсия).', 'Функция n 0-ге жеткенше n-ді n − 1 нәтижесіне қосады (рекурсия).'),
      L(`s(${n}) = ${n} + ${n - 1} + … + 1 = ${total}`, `s(${n}) = ${n} + ${n - 1} + … + 1 = ${total}`, `s(${n}) = ${n} + ${n - 1} + … + 1 = ${total}`),
    ], [total - n, total + n + 1, n * n, total - 1]);
  }
  if (kind === 'fib') {
    const n = randomInt(rng, 5, 11);
    const fib = [0, 1];
    for (let i = 2; i <= n + 1; i++) fib.push(fib[i - 1] + fib[i - 2]);
    const program = [
      func('f', ['n'], [ifChain([[bin('<=', ref('n'), num(1)), [ret(ref('n'))]]]), ret(bin('+', call('f', bin('-', ref('n'), num(1))), call('f', bin('-', ref('n'), num(2)))))]),
      print(call('f', num(n))),
    ];
    return codeQ(`${lang}.func`, lang, d, program, [
      L('Each value is the sum of the two previous ones: these are the Fibonacci numbers.', 'Каждое значение - сумма двух предыдущих: это числа Фибоначчи.', 'Әр мән алдыңғы екеуінің қосындысы: бұл Фибоначчи сандары.'),
      L(`f(0..${n}) = ${fib.slice(0, n + 1).join(', ')}`, `f(0..${n}) = ${fib.slice(0, n + 1).join(', ')}`, `f(0..${n}) = ${fib.slice(0, n + 1).join(', ')}`),
    ], [fib[n - 1], fib[n + 1], fib[n] + 1, 2 * fib[n - 1]]);
  }
  if (kind === 'pow') {
    const a = randomInt(rng, 2, 4);
    const b = randomInt(rng, 2, a === 2 ? 7 : 4);
    const program = [
      func('p', ['a', 'b'], [ifChain([[bin('==', ref('b'), num(0)), [ret(num(1))]]]), ret(bin('*', ref('a'), call('p', ref('a'), bin('-', ref('b'), num(1)))))]),
      print(call('p', num(a), num(b))),
    ];
    return codeQ(`${lang}.func`, lang, d, program, [
      L('p(a, b) multiplies a by itself b times: it is a to the power b.', 'p(a, b) умножает a на себя b раз - это a в степени b.', 'p(a, b) a-ны өзіне b рет көбейтеді - бұл a-ның b дәрежесі.'),
      L(`${a}^${b} = ${a ** b}`, `${a}^${b} = ${a ** b}`, `${a}^${b} = ${a ** b}`),
    ], [a * b, a ** (b - 1), b ** a === a ** b ? a ** b + a : b ** a, a ** b + 1]);
  }
  const n = randomInt(rng, 3, 6);
  let fact = 1;
  for (let i = 2; i <= n; i++) fact *= i;
  const program = [
    func('f', ['n'], [ifChain([[bin('<=', ref('n'), num(1)), [ret(num(1))]]]), ret(bin('*', ref('n'), call('f', bin('-', ref('n'), num(1)))))]),
    print(call('f', num(n))),
  ];
  return codeQ(`${lang}.func`, lang, d, program, [
    L('The function calls itself (recursion) until n reaches 1.', 'Функция вызывает сама себя (рекурсия), пока n не дойдёт до 1.', 'Функция n 1-ге жеткенше өзін-өзі шақырады (рекурсия).'),
    L(`f(${n}) = ${Array.from({ length: n }, (_, i) => n - i).join(' * ')} = ${fact}`, `f(${n}) = ${Array.from({ length: n }, (_, i) => n - i).join(' * ')} = ${fact}`, `f(${n}) = ${Array.from({ length: n }, (_, i) => n - i).join(' * ')} = ${fact}`),
  ], [fact / n, fact * (n + 1), n * (n - 1), (n * (n + 1)) / 2]);
}

const GENERATORS = { vars, cond, loop, arr: arrays, func: funcs };

/** Генераторы тем для одного языка: { 'py.vars': (ctx, d) => задание, … }. */
export function codeTopics(lang) {
  return Object.fromEntries(
    Object.entries(GENERATORS).map(([key, gen]) => [
      `${lang}.${key}`,
      (ctx, d) => {
        CTX.current = ctx;
        try {
          return gen(lang, ctx, d);
        } finally {
          CTX.current = null;
        }
      },
    ]),
  );
}

export const CODE_TOPIC_NAMES = {
  vars: L('Variables and arithmetic', 'Переменные и арифметика', 'Айнымалылар мен арифметика'),
  cond: L('Conditions', 'Условия', 'Шарттар'),
  loop: L('Loops', 'Циклы', 'Циклдер'),
  arr: L('Lists and arrays', 'Списки и массивы', 'Тізімдер мен массивтер'),
  func: L('Functions', 'Функции', 'Функциялар'),
};

