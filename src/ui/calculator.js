// Встроенный научный калькулятор: выражение целиком, живой предпросмотр, история, градусы/радианы,
// вставка результата в поле ответа. Считает свой разборщик выражений - без eval.

import { t } from '../core/i18n.js';
import { storage } from '../core/storage.js';
import { esc } from './dom.js';
import { openModal } from './overlay.js';

// ---------- Разбор и вычисление ----------

const FUNCS = {
  sin: (x, deg) => Math.sin(deg ? (x * Math.PI) / 180 : x),
  cos: (x, deg) => Math.cos(deg ? (x * Math.PI) / 180 : x),
  tan: (x, deg) => Math.tan(deg ? (x * Math.PI) / 180 : x),
  asin: (x, deg) => (deg ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
  acos: (x, deg) => (deg ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
  atan: (x, deg) => (deg ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
  ln: (x) => Math.log(x),
  log: (x) => Math.log10(x),
  '√': (x) => Math.sqrt(x),
  '∛': (x) => Math.cbrt(x),
  abs: (x) => Math.abs(x),
};

function tokenize(src) {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') {
      i++;
      continue;
    }
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
    if (num && !(c === 'e' || c === 'E')) {
      out.push({ k: 'n', v: parseFloat(num[0]) });
      i += num[0].length;
      continue;
    }
    const word = /^(asin|acos|atan|sin|cos|tan|ln|log|abs|Ans|π|e|√|∛)/.exec(s.slice(i));
    if (word) {
      const w = word[0];
      if (w === 'π') out.push({ k: 'n', v: Math.PI });
      else if (w === 'e') out.push({ k: 'n', v: Math.E });
      else if (w === 'Ans') out.push({ k: 'ans' });
      else out.push({ k: 'f', v: w });
      i += w.length;
      continue;
    }
    if ('+-*/^()!%²³'.includes(c)) {
      out.push({ k: 'o', v: c });
      i++;
      continue;
    }
    if (s.startsWith('⁻¹', i)) {
      out.push({ k: 'o', v: 'inv' });
      i += 2;
      continue;
    }
    throw new Error('bad');
  }
  return out;
}

function fact(n) {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

/** Вычисляет выражение. deg - углы в градусах, ans - прошлый ответ. Бросает ошибку на неверной записи. */
export function evaluate(src, { deg = true, ans = 0 } = {}) {
  const tokens = tokenize(src);
  let p = 0;
  const peek = () => tokens[p];
  const isOp = (v) => peek()?.k === 'o' && peek().v === v;
  const startsPrimary = () => {
    const tk = peek();
    return tk && (tk.k === 'n' || tk.k === 'ans' || tk.k === 'f' || (tk.k === 'o' && tk.v === '('));
  };

  function primary() {
    const tk = tokens[p++];
    if (!tk) throw new Error('end');
    if (tk.k === 'n') return tk.v;
    if (tk.k === 'ans') return ans;
    if (tk.k === 'f') {
      const arg = isOp('(') ? primary() : unary();
      return FUNCS[tk.v](arg, deg);
    }
    if (tk.k === 'o' && tk.v === '(') {
      const v = expr();
      if (isOp(')')) p++;
      return v; // незакрытая скобка в конце - не ошибка
    }
    throw new Error('tok');
  }
  function postfix() {
    let v = primary();
    for (;;) {
      if (isOp('!')) (p++, (v = fact(v)));
      else if (isOp('%')) (p++, (v /= 100));
      else if (isOp('²')) (p++, (v **= 2));
      else if (isOp('³')) (p++, (v **= 3));
      else if (isOp('inv')) (p++, (v = 1 / v));
      else return v;
    }
  }
  function power() {
    const base = postfix();
    if (isOp('^')) {
      p++;
      return base ** unary();
    }
    return base;
  }
  function unary() {
    if (isOp('-')) return p++, -unary();
    if (isOp('+')) return p++, unary();
    return power();
  }
  function term() {
    let v = unary();
    for (;;) {
      if (isOp('*')) (p++, (v *= unary()));
      else if (isOp('/')) (p++, (v /= unary()));
      else if (startsPrimary()) v *= unary(); // 2π, 3(4+1), (1+2)(3+4)
      else return v;
    }
  }
  function expr() {
    let v = term();
    for (;;) {
      if (isOp('+')) (p++, (v += term()));
      else if (isOp('-')) (p++, (v -= term()));
      else return v;
    }
  }
  const v = expr();
  if (p < tokens.length) throw new Error('rest');
  return v;
}

/** Красивый вывод: до 10 значащих цифр, без хвоста нулей, -0 → 0. */
export function formatNumber(v) {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? t('calc.error') : v > 0 ? '∞' : '-∞';
  if (Math.abs(v) < 1e-12) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e12 || abs < 1e-6) return v.toExponential(6).replace(/\.?0+e/, 'e');
  return String(Number.parseFloat(v.toPrecision(10)));
}

// ---------- Вид ----------

const KEYS = [
  ['2nd', 'sin', 'cos', 'tan', 'AC'],
  ['x²', 'xʸ', '√', 'ln', '⌫'],
  ['(', ')', 'π', 'log', '÷'],
  ['7', '8', '9', 'n!', '×'],
  ['4', '5', '6', '%', '−'],
  ['1', '2', '3', 'e', '+'],
  ['0', '.', 'Ans', '1/x', '='],
];
const SECOND = { sin: 'sin⁻¹', cos: 'cos⁻¹', tan: 'tan⁻¹', 'x²': 'x³', '√': '∛', ln: 'eˣ', log: '10ˣ', 'n!': '|x|' };
/** Что вставляет кнопка в выражение. */
const INSERT = {
  sin: 'sin(', cos: 'cos(', tan: 'tan(', 'sin⁻¹': 'asin(', 'cos⁻¹': 'acos(', 'tan⁻¹': 'atan(',
  'x²': '²', 'x³': '³', 'xʸ': '^', '√': '√(', '∛': '∛(', ln: 'ln(', log: 'log(', 'eˣ': 'e^(', '10ˣ': '10^(',
  'n!': '!', '|x|': 'abs(', '1/x': '⁻¹', '%': '%', π: 'π', e: 'e', Ans: 'Ans',
  '÷': '÷', '×': '×', '−': '−', '+': '+', '(': '(', ')': ')', '.': '.',
};

export function calculatorHtml() {
  return `<div class="calc" tabindex="0" aria-label="${t('calc.title')}">
    <div class="calc-screen">
      <div class="calc-top"><button type="button" class="calc-mode" data-k="mode"></button><span class="calc-hist-label">${t('calc.history')}</span></div>
      <div class="calc-history"></div>
      <input class="calc-expr" type="text" inputmode="none" autocomplete="off" spellcheck="false" aria-label="${t('calc.expr')}"/>
      <div class="calc-preview" aria-live="polite"></div>
    </div>
    <div class="calc-keys">${KEYS.flat()
      .map((k) => `<button type="button" class="calc-key ${/^\d$|^\.$/.test(k) ? 'is-num' : k === '=' ? 'is-eq' : k === 'AC' || k === '⌫' ? 'is-clear' : '÷×−+'.includes(k) && k.length === 1 ? 'is-op' : 'is-fn'}" data-k="${esc(k)}">${esc(k)}</button>`)
      .join('')}</div>
    <button type="button" class="btn btn-soft btn-sm calc-to-answer" hidden>↪ ${t('calc.toAnswer')}</button>
  </div>`;
}

/** Оживляет калькулятор внутри root. answerInput - поле ответа задания (если есть). */
export function bindCalculator(root, { answerInput = null } = {}) {
  const box = root.querySelector('.calc');
  if (!box) return;
  const input = box.querySelector('.calc-expr');
  const preview = box.querySelector('.calc-preview');
  const histBox = box.querySelector('.calc-history');
  const modeBtn = box.querySelector('.calc-mode');
  const toAnswer = box.querySelector('.calc-to-answer');
  let deg = storage.get('calcDeg', true) !== false;
  let second = false;
  let ans = storage.get('calcAns', 0) ?? 0;
  let history = storage.get('calcHistory', []) ?? [];
  let justEvaluated = false;

  const renderHistory = () => {
    histBox.innerHTML = history
      .slice(-4)
      .map((h) => `<button type="button" class="calc-h" data-v="${esc(h.r)}"><span>${esc(h.e)} =</span><b>${esc(h.r)}</b></button>`)
      .join('');
    histBox.scrollTop = histBox.scrollHeight;
  };
  const renderMode = () => {
    modeBtn.textContent = deg ? 'DEG' : 'RAD';
    box.querySelectorAll('.calc-key').forEach((b) => {
      const base = b.dataset.base ?? b.dataset.k;
      b.dataset.base = base;
      const label = second && SECOND[base] ? SECOND[base] : base;
      b.textContent = label;
      b.dataset.k = label;
      b.classList.toggle('is-on', base === '2nd' && second);
    });
  };
  const live = () => {
    const src = input.value.trim();
    if (!src) return (preview.textContent = '', preview.classList.remove('bad'));
    try {
      preview.textContent = `= ${formatNumber(evaluate(src, { deg, ans }))}`;
      preview.classList.remove('bad');
    } catch {
      preview.textContent = '';
    }
  };
  const insert = (text) => {
    if (justEvaluated && /^[\d.(πe√∛]|^Ans|^[a-z]/.test(text)) input.value = '';
    justEvaluated = false;
    const s = input.selectionStart ?? input.value.length;
    const e = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0, s) + text + input.value.slice(e);
    const pos = s + text.length;
    input.setSelectionRange?.(pos, pos);
    live();
  };
  const run = () => {
    const src = input.value.trim();
    if (!src) return;
    try {
      const v = evaluate(src, { deg, ans });
      const r = formatNumber(v);
      if (Number.isFinite(v)) {
        ans = v;
        storage.set('calcAns', v);
      }
      history = [...history, { e: src, r }].slice(-20);
      storage.set('calcHistory', history);
      renderHistory();
      input.value = r;
      preview.textContent = '';
      justEvaluated = true;
      box.classList.remove('shake');
      if (answerInput) toAnswer.hidden = !Number.isFinite(v);
    } catch {
      preview.textContent = t('calc.error');
      preview.classList.add('bad');
      box.classList.remove('shake');
      void box.offsetWidth;
      box.classList.add('shake');
    }
  };
  const press = (k) => {
    if (k === 'mode') {
      deg = !deg;
      storage.set('calcDeg', deg);
      renderMode();
      return live();
    }
    if (k === '2nd') {
      second = !second;
      return renderMode();
    }
    if (k === 'AC') {
      input.value = '';
      justEvaluated = false;
      return live();
    }
    if (k === '⌫') {
      input.value = input.value.slice(0, -1);
      justEvaluated = false;
      return live();
    }
    if (k === '=') return run();
    if (/^\d$/.test(k)) insert(k);
    else if (INSERT[k] !== undefined) {
      // После «=» оператор продолжает от результата, а не стирает его.
      if (justEvaluated && /^[÷×−+^²³!%⁻]/.test(INSERT[k])) justEvaluated = false;
      insert(INSERT[k]);
    }
    if (second) {
      second = false;
      renderMode();
    }
  };

  box.querySelectorAll('.calc-key').forEach((b) => b.addEventListener('click', () => press(b.dataset.k)));
  modeBtn.addEventListener('click', () => press('mode'));
  histBox.addEventListener('click', (e) => {
    const h = e.target.closest('.calc-h');
    if (h) insert(h.dataset.v);
  });
  input.addEventListener('input', () => {
    justEvaluated = false;
    live();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      run();
    } else if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      e.stopPropagation();
      input.value = '';
      live();
    }
  });
  toAnswer.addEventListener('click', () => {
    if (!answerInput) return;
    answerInput.value = formatNumber(ans);
    answerInput.dispatchEvent(new Event('input', { bubbles: true }));
    toAnswer.textContent = `✓ ${t('calc.inserted')}`;
  });
  renderMode();
  renderHistory();
  input.focus({ preventScroll: true });
}

/** Калькулятор в отдельном окне. */
export function openCalculator({ answerInput = null } = {}) {
  openModal({ title: `🧮 ${t('calc.title')}`, body: calculatorHtml() });
  bindCalculator(document.getElementById('modal-root'), { answerInput });
}
