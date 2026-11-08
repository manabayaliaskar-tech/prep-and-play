// Карточка задания: текст, таблица/чертёж, варианты ответа или поле ввода.

import { t, tx } from '../core/i18n.js';
import { NOTES_INTRO } from '../content/rw/prompts.js';
import { SKILLS } from '../content/skills.js';
import { esc, isFinePointer } from './dom.js';

export const LETTERS = ['A', 'B', 'C', 'D'];

function passageText(text) {
  return esc(text).replace(/_{3,}/g, '<span class="blank" aria-label="blank"></span>');
}

function tableHtml(table) {
  const head = table.headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('');
  const rows = table.rows
    .map((row) => `<tr>${row.map((cell, i) => (i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`)).join('')}</tr>`)
    .join('');
  return `<div class="table-wrap"><table class="data-table">${table.caption ? `<caption>${esc(table.caption)}</caption>` : ''}<thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function difficultyDots(d) {
  return `<span class="diff diff-${d}" title="${t('q.difficulty')}: ${d}/3">${[1, 2, 3].map((i) => `<i class="${i <= d ? 'on' : ''}"></i>`).join('')}</span>`;
}

export function questionHtml(q) {
  const parts = [
    `<div class="q-meta"><span class="q-tag q-tag-${q.section}">${q.section === 'rw' ? '📖' : '📐'} ${esc(tx(SKILLS[q.skill].name))}</span>${difficultyDots(q.d)}</div>`,
  ];
  if (q.section === 'rw') {
    if (q.passages) {
      parts.push(
        `<div class="passages">${q.passages.map((p) => `<div class="passage"><div class="passage-label">${esc(p.label)}</div><p>${passageText(p.text)}</p></div>`).join('')}</div>`,
      );
    }
    if (q.notes) {
      parts.push(`<div class="passage notes"><p>${esc(NOTES_INTRO)}</p><ul>${q.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`);
    }
    if (q.passage) parts.push(`<div class="passage"><p>${passageText(q.passage)}</p></div>`);
    if (q.table) parts.push(tableHtml(q.table));
    parts.push(`<p class="q-prompt">${esc(q.prompt)}</p>`);
  } else {
    if (q.figure) parts.push(`<div class="figure">${q.figure}</div>`);
    if (q.table) parts.push(tableHtml(q.table));
    parts.push(`<p class="q-prompt q-math">${q.prompt}</p>`);
  }
  if (q.type === 'spr') {
    parts.push(`
      <div class="spr">
        <label class="spr-label" for="spr-input">${t('q.sprLabel')}</label>
        <input id="spr-input" class="spr-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="8" placeholder="${t('q.sprPlaceholder')}"/>
        <p class="spr-hint">${t('q.sprHint')}</p>
        <p class="spr-correct" hidden></p>
      </div>`);
  } else {
    const isMath = q.section === 'math';
    parts.push(
      `<div class="choices" role="radiogroup">${q.choices
        .map(
          (c, i) =>
            `<button type="button" class="choice" role="radio" aria-checked="false" data-choice="${i}"><span class="choice-letter">${LETTERS[i]}</span><span class="choice-text">${isMath ? c : esc(c)}</span></button>`,
        )
        .join('')}</div>`,
    );
  }
  return `<article class="q-card q-${q.section}">${parts.join('')}</article>`;
}

/** Подключает выбор ответа. Возвращает объект для чтения ответа и блокировки после проверки. */
export function bindQuestion(root, q, { onChange = () => {}, onSubmit = () => {}, autofocus = true } = {}) {
  let response = null;
  let locked = false;
  const input = root.querySelector('.spr-input');
  const buttons = [...root.querySelectorAll('[data-choice]')];

  function select(i) {
    response = i;
    buttons.forEach((b) => {
      const on = Number(b.dataset.choice) === i;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-checked', String(on));
    });
    onChange(i);
  }

  if (input) {
    input.addEventListener('input', () => {
      response = input.value.trim() || null;
      onChange(response);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    });
    if (autofocus && isFinePointer()) setTimeout(() => input.focus({ preventScroll: true }), 60);
  }
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      if (!locked) select(Number(b.dataset.choice));
    }),
  );

  return {
    get response() {
      return response;
    },
    select(i) {
      if (!locked && q.type === 'mc' && i >= 0 && i < q.choices.length) select(i);
    },
    setResponse(value) {
      if (value === null || value === undefined) return;
      if (q.type === 'mc') select(value);
      else if (input) {
        input.value = value;
        response = value;
      }
    },
    lock(correct, { showAnswer = true } = {}) {
      locked = true;
      if (input) {
        input.disabled = true;
        input.classList.add(correct ? 'is-correct' : 'is-wrong');
        if (!correct && showAnswer) {
          const el = root.querySelector('.spr-correct');
          el.hidden = false;
          el.innerHTML = `${t('fb.correctAnswer')}: <b>${esc(q.display)}</b>`;
        }
        return;
      }
      buttons.forEach((b) => {
        const i = Number(b.dataset.choice);
        b.disabled = true;
        if (showAnswer && i === q.answer) b.classList.add('is-correct');
        if (i === response && i !== q.answer) b.classList.add('is-wrong');
      });
    },
  };
}

export function correctAnswerHtml(q) {
  if (q.type === 'spr') return `<b>${esc(q.display)}</b>`;
  const text = q.section === 'math' ? q.choices[q.answer] : esc(q.choices[q.answer]);
  return `<b>${LETTERS[q.answer]}</b> — ${text}`;
}
