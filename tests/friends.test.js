import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CODE_RE, MAX_FRIENDS, checkAdd, isoWeek, makeCode, myLook, normalizeCode, readLook, sortBoard, weekDays, weekXp } from '../src/core/friends.js';
import { createRng } from '../src/core/random.js';

test('друзья: код PREP-XXXXX без похожих символов, ввод приводится к нужному виду', () => {
  const rng = createRng(7);
  for (let i = 0; i < 200; i++) {
    const code = makeCode(rng);
    assert.match(code, CODE_RE);
    assert.ok(!/[01OI]/.test(code.slice(5)), code);
  }
  assert.equal(normalizeCode('prep-7k2qx'), 'PREP-7K2QX');
  assert.equal(normalizeCode(' PREP 7K2QX '), 'PREP-7K2QX');
  assert.equal(normalizeCode('7k2qx'), 'PREP-7K2QX');
  assert.equal(normalizeCode('PREP7K2QX'), 'PREP-7K2QX');
  assert.equal(normalizeCode('PREP\u20147K2QX'), 'PREP-7K2QX', 'длинное тире из телефона');
  assert.equal(normalizeCode('https://prepplay.app/#/friends/PREP-7K2QX'), 'PREP-7K2QX');
  assert.equal(normalizeCode('PREPX'), 'PREP-PREPX', 'код из 5 знаков без приставки');
  for (const bad of ['', null, 'PREP-7K2Q', 'PREP-7K2QXX', 'PREP-0K2QX', 'PREP-OK2QX', 'PREP-1K2QX', 'PREP-IK2QX', 'HELLO-7K2QX', 'PREP-7K2Q!']) {
    assert.equal(normalizeCode(bad), null, String(bad));
  }
});

test('друзья: добавить можно правильный чужой код, без повторов и не больше 50', () => {
  const mine = 'PREP-AAAAA';
  assert.deepEqual(checkAdd('prep-bbbbb', [], mine), { code: 'PREP-BBBBB' });
  assert.deepEqual(checkAdd('xyz', [], mine), { error: 'format' });
  assert.deepEqual(checkAdd('PREP-AAAAA', [], mine), { error: 'self' });
  assert.deepEqual(checkAdd('aaaaa', [], mine), { error: 'self' });
  assert.deepEqual(checkAdd('PREP-BBBBB', ['PREP-BBBBB'], mine), { error: 'dup' });
  const full = Array.from({ length: MAX_FRIENDS }, (_, i) => makeCode(createRng(i + 1)));
  assert.deepEqual(checkAdd('PREP-CCCCC', full, mine), { error: 'max' });
  // Пока своего кода нет (не получен), добавлять друзей можно.
  assert.deepEqual(checkAdd('PREP-CCCCC', [], null), { code: 'PREP-CCCCC' });
});

test('друзья: неделя по ISO с понедельника, опыт недели - сумма дней до сегодня', () => {
  assert.equal(isoWeek('2026-11-21'), '2026-W47');
  assert.equal(isoWeek('2026-11-16'), '2026-W47');
  assert.equal(isoWeek('2026-11-22'), '2026-W47');
  assert.equal(isoWeek('2026-11-23'), '2026-W48');
  assert.equal(isoWeek('2021-01-03'), '2020-W53', 'начало января - ещё прошлый год');
  assert.equal(isoWeek('2024-12-30'), '2025-W01', 'конец декабря - уже следующий год');
  assert.equal(isoWeek('2026-01-01'), '2026-W01');
  assert.deepEqual(weekDays('2026-11-21'), ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']);
  assert.deepEqual(weekDays('2026-03-01'), ['2026-02-23', '2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28', '2026-03-01']);
  const days = { '2026-11-15': { xp: 500 }, '2026-11-16': { xp: 40 }, '2026-11-18': { xp: 25 }, '2026-11-21': { xp: 10 } };
  const rec = (d) => days[d] ?? null;
  assert.equal(weekXp('2026-11-21', rec), 75, 'воскресенье прошлой недели не считается');
  assert.equal(weekXp('2026-11-17', rec), 40, 'будущие дни не считаются');
  assert.equal(weekXp('2026-11-23', rec), 0, 'в новую неделю - с нуля');
});

test('друзья: рейтинг по опыту недели, при равенстве - по серии; старая неделя - 0', () => {
  const week = '2026-W47';
  const rows = [
    { code: 'PREP-AAAAA', name: 'Аня', week, week_xp: 120, streak: 2 },
    { code: 'PREP-BBBBB', name: 'Бек', week, week_xp: 300, streak: 1 },
    { code: 'PREP-CCCCC', name: 'Вика', week, week_xp: 120, streak: 9 },
    { code: 'PREP-DDDDD', name: 'Гоша', week: '2026-W46', week_xp: 999, streak: 0 },
    { code: 'PREP-EEEEE', name: null, week: null, week_xp: 0, streak: 0, missing: true },
  ];
  const sorted = sortBoard(rows, week);
  assert.deepEqual(sorted.map((r) => r.code), ['PREP-BBBBB', 'PREP-CCCCC', 'PREP-AAAAA', 'PREP-EEEEE', 'PREP-DDDDD']);
  assert.equal(sorted.find((r) => r.code === 'PREP-DDDDD').xp, 0);
  assert.equal(sorted[0].xp, 300);
  // Мусор из базы не ломает сортировку.
  const odd = sortBoard([{ code: 'PREP-AAAAA', week, week_xp: 'x', streak: null }, { code: 'PREP-BBBBB', week, week_xp: -5, streak: 3 }], week);
  assert.deepEqual(odd.map((r) => [r.xp, r.streak]), [[0, 3], [0, 0]]);
});

test('друзья: вид Препи - коротко в строке, чужой вид рисуется только из настоящих вещей', () => {
  const look = myLook({ head: 'crown', face: null, neck: 'scarf', body: null, feet: null, hand: null, back: 'wings', color: 'mint', aura: 'sparkles', pet: 'cat' });
  assert.deepEqual(look, { color: 'mint', head: 'crown', neck: 'scarf', back: 'wings' });
  assert.ok(JSON.stringify(look).length < 400);
  assert.deepEqual(myLook({ head: null, color: 'classic' }), {});
  const out = readLook({ head: 'crown', face: 'scarf', color: 'nope', back: '<script>', aura: 'sparkles' });
  assert.equal(out.head, 'crown');
  assert.equal(out.face, null, 'вещь не из своего слота');
  assert.equal(out.color, 'classic');
  assert.equal(out.back, null);
  assert.equal(out.aura, null, 'аура в таблице не рисуется');
  assert.equal(readLook(null).color, 'classic');
});

test('друзья: SQL для базы - своя строка, без общего чтения, функция только для вошедших', () => {
  const sql = readFileSync('supabase/friends.sql', 'utf8');
  assert.ok(!/[\u2013\u2014]/.test(sql), 'только обычное тире');
  assert.match(sql, /enable row level security/);
  assert.match(sql, /on delete cascade/);
  assert.match(sql, /security definer/);
  assert.match(sql, /revoke all on function public\.board_by_codes\(text\[\]\) from public, anon/);
  assert.match(sql, /grant execute on function public\.board_by_codes\(text\[\]\) to authenticated/);
  // Чтение таблицы - только своей строки.
  for (const m of sql.matchAll(/create policy[^;]*for select[^;]*;/g)) assert.match(m[0], /auth\.uid\(\) = user_id/);
  assert.ok(!/\bemail\b/.test(sql.replace(/--.*$/gm, '')), 'почты в таблице нет');
});
