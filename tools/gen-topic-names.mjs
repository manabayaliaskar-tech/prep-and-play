// Названия тем отдельно от генераторов: node tools/gen-topic-names.mjs → src/pools/topic-names.js.
// Нужны там, где показывают название темы (главная, отчёты, профиль), чтобы не грузить все банки заданий.
// Тест следит, чтобы файл совпадал с pools/topics.js.
import { writeFileSync } from 'node:fs';
import { TOPICS } from '../src/pools/topics.js';

const rows = Object.entries(TOPICS).map(([id, tp]) => `  ${JSON.stringify(id)}: [${JSON.stringify(tp.pool)}, ${JSON.stringify(tp.name)}],`);
writeFileSync(
  new URL('../src/pools/topic-names.js', import.meta.url),
  `// Создано tools/gen-topic-names.mjs - не редактировать вручную. Тема: [банк, название на трёх языках].\n\nexport const TOPIC_NAMES = {\n${rows.join('\n')}\n};\n`,
);
console.log('topic names:', rows.length);
