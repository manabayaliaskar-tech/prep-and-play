// Страницы для поисковиков собираются: уроки, экзамены, карта сайта, robots.txt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSeo, SITE } from '../tools/seo.mjs';

test('SEO: страницы уроков и экзаменов, sitemap и robots', () => {
  const out = mkdtempSync(join(tmpdir(), 'seo-'));
  writeFileSync(join(out, 'index.html'), readFileSync('index.html', 'utf8'));
  const n = buildSeo(out);
  assert.ok(n > 150, `страниц ${n}`);
  assert.ok(existsSync(join(out, 'exams/ent/index.html')));
  const sitemap = readFileSync(join(out, 'sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes(`${SITE}exams/ent/`));
  assert.ok(readFileSync(join(out, 'robots.txt'), 'utf8').includes('sitemap.xml'));
  assert.ok(readFileSync(join(out, 'index.html'), 'utf8').includes('rel="canonical"'));
  assert.ok(!/[—–]/.test(readFileSync(join(out, 'exams/ent/index.html'), 'utf8')), 'длинное тире на странице');
});
