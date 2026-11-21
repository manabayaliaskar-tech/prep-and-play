// Страницы для поисковиков собираются: уроки и экзамены на трёх языках, карта сайта, robots.txt, разметка.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSeo, SITE } from '../tools/seo.mjs';

const out = mkdtempSync(join(tmpdir(), 'seo-'));
writeFileSync(join(out, 'index.html'), readFileSync('index.html', 'utf8'));
const n = buildSeo(out);
const read = (p) => readFileSync(join(out, p), 'utf8');
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test('SEO: страницы уроков и экзаменов на трёх языках, sitemap и robots', () => {
  assert.ok(n > 500, `страниц ${n}`);
  for (const p of ['exams/ent/index.html', 'en/exams/ent/index.html', 'kk/exams/ent/index.html', 'kk/lessons/index.html']) assert.ok(existsSync(join(out, p)), p);
  const sitemap = read('sitemap.xml');
  assert.ok(sitemap.includes(`${SITE}exams/ent/`) && sitemap.includes(`${SITE}kk/exams/ent/`));
  assert.ok(read('robots.txt').includes('sitemap.xml'));
  assert.ok(read('index.html').includes('rel="canonical"'));
});

test('SEO: hreflang, язык страницы и ссылка в игру с языком', () => {
  const kk = read('kk/exams/ent/index.html');
  assert.ok(kk.startsWith('<!doctype html>\n<html lang="kk">'));
  for (const href of [`${SITE}exams/ent/`, `${SITE}en/exams/ent/`, `${SITE}kk/exams/ent/`]) assert.ok(kk.includes(`href="${href}"`), href);
  assert.ok(kk.includes('?lang=kk#/c/ent'));
});

test('SEO: примеры заданий с ответом, частые вопросы и разметка schema.org', () => {
  const ent = read('exams/ent/index.html');
  assert.ok((ent.match(/class="card q"/g) ?? []).length >= 4, 'примеры заданий');
  const types = jsonLd(ent).flatMap((d) => d['@graph'].map((x) => x['@type']));
  for (const t of ['Organization', 'BreadcrumbList', 'Course', 'FAQPage']) assert.ok(types.includes(t), t);
  const home = jsonLd(read('index.html')).flatMap((d) => d['@graph'].map((x) => x['@type']));
  assert.ok(home.includes('WebSite') && home.includes('Organization'));
});

test('SEO: нигде нет длинных тире и сломанной разметки', () => {
  const walk = (dir) =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') ? [p] : [];
    });
  for (const file of walk(out)) {
    const html = readFileSync(file, 'utf8');
    assert.ok(!/[—–]/.test(html), `длинное тире: ${file}`);
    jsonLd(html);
  }
});
