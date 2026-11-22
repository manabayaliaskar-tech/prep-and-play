import { kanaMaker, jaWordsMaker, kanjiMaker, jaBankMaker, jaCounts } from '/home/user/School/src/pools/languages/ja.js';
import { JA_WORDS } from '/home/user/School/src/pools/languages/ja-words.js';
import { KANJI } from '/home/user/School/src/pools/languages/ja-kanji.js';
import { romaji } from '/home/user/School/src/pools/languages/ja-kana.js';
import { conjugate } from '/home/user/School/src/pools/languages/ja-verbs.js';
import { createRng } from '/home/user/School/src/core/random.js';

const text = (x, l) => (x && typeof x === 'object' ? x[l] : String(x));
const problems = [];
const makers = { 'ja.kana': [kanaMaker('ja.kana'), [1, 2, 3]], 'ja.words': [jaWordsMaker('ja.words'), [1, 2, 3, 4, 5]], 'ja.kanji': [kanjiMaker('ja.kanji'), [1, 2, 3, 4, 5]], 'ja.bank': [jaBankMaker('ja.bank'), [1, 2, 3, 4, 5]] };
for (const [id, [make, levels]] of Object.entries(makers)) {
  for (const lv of levels) {
    const ids = new Set();
    for (let s = 0; s < 1500; s++) {
      const q = make({ rng: createRng(s * 7 + lv), used: new Set() }, lv);
      ids.add(q.id);
      for (const l of ['en', 'ru', 'kk']) {
        const c = q.choices.map((x) => text(x, l));
        if (new Set(c).size !== 4) problems.push(`${id} ${lv} dup ${l}: ${c.join(' | ')}`);
        if (!text(q.prompt, l) || !text(q.ex, l)) problems.push(`${id} empty ${l}`);
      }
      if (/undefined|NaN/.test(JSON.stringify(q))) problems.push(`${id} undefined ${JSON.stringify(q).slice(0, 200)}`);
    }
    console.log(id, lv, 'distinct', ids.size);
  }
}
for (let lv = 1; lv <= 5; lv++) console.log('level', lv, jaCounts(lv));
console.log([...new Set(problems)].slice(0, 30).join('\n'));
// Уникальность
const seen = new Set();
for (const w of JA_WORDS) { if (seen.has(w.jp)) console.log('dup word', w.jp); seen.add(w.jp); }
const sk = new Set();
for (const k of KANJI) { if (sk.has(k.kj)) console.log('dup kanji', k.kj); sk.add(k.kj); }
console.log(romaji('がっこう'), romaji('コーヒー'), romaji('きんえん'), romaji('きっぷ'), romaji('しゃしん'), romaji('ちょっと'), romaji('まっちゃ'));
for (const [jp, kana] of [['書く', 'かく'], ['行く', 'いく'], ['食べる', 'たべる'], ['帰る', 'かえる'], ['勉強する', 'べんきょうする'], ['来る', 'くる'], ['買う', 'かう'], ['泳ぐ', 'およぐ'], ['話す', 'はなす'], ['待つ', 'まつ'], ['遊ぶ', 'あそぶ'], ['ある', 'ある']]) console.log(jp, JSON.stringify(conjugate(jp, kana)));
