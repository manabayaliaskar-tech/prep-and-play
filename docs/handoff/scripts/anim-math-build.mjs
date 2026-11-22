// Собирает src/explain/scenes-math.js из частей parts/*.js (по алфавиту).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'parts');
const skip = new Set(process.argv.slice(2));
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.js') && !skip.has(f))
  .sort();
const out = files.map((f) => readFileSync(join(dir, f), 'utf8').replace(/\s+$/, '')).join('\n\n') + '\n';
writeFileSync('/home/user/School/src/explain/scenes-math.js', out);
console.log('built from', files.join(', '), out.split('\n').length, 'lines');
