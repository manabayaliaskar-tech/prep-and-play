// Уровни, на которых в банке английского есть задания: node tools/gen-english-levels.mjs → src/pools/english/levels.js.
// Каталогу курсов при старте нужен только этот список, а не весь банк. Тест следит, чтобы файл совпадал с банком.
import { writeFileSync } from 'node:fs';
import { BANK } from '../src/pools/english/bank.js';

const levels = {};
for (const [topic, rows] of Object.entries(BANK)) {
  const counts = {};
  for (const row of rows) counts[row[0]] = (counts[row[0]] ?? 0) + 1;
  levels[topic] = Object.keys(counts)
    .map(Number)
    .filter((l) => counts[l] >= 2)
    .sort((a, b) => a - b);
}
writeFileSync(
  new URL('../src/pools/english/levels.js', import.meta.url),
  `// Создано tools/gen-english-levels.mjs - не редактировать вручную. Тема банка → уровни (1 = A1 … 6 = C2), где есть хотя бы 2 задания.\n\nexport const ENGLISH_LEVELS = ${JSON.stringify(levels)};\n`,
);
console.log('english topics:', Object.keys(levels).length);
