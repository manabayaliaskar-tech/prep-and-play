// Проверка ответов. Для заданий с вводом (student-produced response) — правила как на SAT:
// принимаются дроби (3/4) и десятичные (0.75); для бесконечных дробей — минимум 3 знака после точки.

export function parseSpr(input) {
  const s = String(input ?? '')
    .trim()
    .replace(/−/g, '-')
    .replace(/\s+/g, '')
    .replace(',', '.');
  if (!s) return NaN;
  const fraction = s.match(/^(-?)(\d+)\/(\d+)$/);
  if (fraction) {
    const den = Number(fraction[3]);
    if (den === 0) return NaN;
    return (fraction[1] ? -1 : 1) * (Number(fraction[2]) / den);
  }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);
  return NaN;
}

export function isSprCorrect(value, input) {
  const parsed = parseSpr(input);
  if (Number.isNaN(parsed)) return false;
  if (Math.abs(parsed - value) < 1e-9) return true;
  const s = String(input).trim();
  if (s.includes('/')) return false;
  const decimals = s.split(/[.,]/)[1];
  if (decimals && decimals.length >= 3) {
    return Math.abs(parsed - value) < Math.pow(10, -decimals.length) + 1e-12;
  }
  return false;
}

export function checkAnswer(question, response) {
  if (response === null || response === undefined || response === '') return false;
  if (question.type === 'spr') return isSprCorrect(question.value, response);
  return response === question.answer;
}
