// Раздел «Квиз»: 10 случайных вопросов по алгоритмам с разбором каждого ответа.

import { QUIZ_LENGTH, QUIZ_QUESTIONS } from '../data/quiz-questions.js';
import { createRng, shuffle } from '../core/random.js';
import { storage } from '../core/storage.js';
import { escapeHtml } from './common.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function verdict(score, total) {
  const ratio = score / total;
  if (ratio === 1) return 'Идеально! Ты знаешь алгоритмы как свои пять пальцев. 🏆';
  if (ratio >= 0.8) return 'Отличный результат! Ещё чуть-чуть до идеала.';
  if (ratio >= 0.5) return 'Неплохо! Посмотри анимации в разделах «Сортировки» и «Поиск пути» и попробуй ещё раз.';
  return 'Есть куда расти — запусти пошаговые анимации, они помогут разобраться.';
}

export function mountQuizView(root) {
  const rng = createRng();
  const state = { questions: [], current: 0, score: 0, answered: false };

  function startScreen() {
    const best = storage.get('quizBest', null);
    root.innerHTML = `
      <div class="panel quiz quiz-intro">
        <div class="quiz-emoji" aria-hidden="true">🧠</div>
        <h2>Проверь себя</h2>
        <p class="muted">${QUIZ_LENGTH} случайных вопросов о сортировках, поиске пути и сложности алгоритмов. После каждого ответа — короткий разбор.</p>
        ${best !== null ? `<p class="best">Твой рекорд: <b>${best} из ${QUIZ_LENGTH}</b></p>` : ''}
        <button class="play-btn" type="button" data-action="start"><span>▶</span><span>Начать квиз</span></button>
      </div>`;
    root.querySelector('[data-action="start"]').addEventListener('click', start);
  }

  function start() {
    state.questions = shuffle(QUIZ_QUESTIONS, rng)
      .slice(0, QUIZ_LENGTH)
      .map((q) => {
        // Перемешиваем варианты, запоминая, где теперь правильный.
        const order = shuffle(
          q.options.map((_, i) => i),
          rng,
        );
        return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
      });
    state.current = 0;
    state.score = 0;
    showQuestion();
  }

  function showQuestion() {
    const q = state.questions[state.current];
    state.answered = false;
    const progress = (state.current / state.questions.length) * 100;
    root.innerHTML = `
      <div class="panel quiz">
        <div class="quiz-top">
          <span class="muted">Вопрос ${state.current + 1} из ${state.questions.length}</span>
          <span class="muted">Счёт: <b>${state.score}</b></span>
        </div>
        <div class="quiz-progress"><i style="width:${progress}%"></i></div>
        <h2 class="quiz-question">${escapeHtml(q.question)}</h2>
        <div class="quiz-options">
          ${q.options
            .map(
              (option, i) => `
              <button type="button" class="quiz-option" data-option="${i}">
                <span class="quiz-letter">${LETTERS[i]}</span><span>${escapeHtml(option)}</span>
              </button>`,
            )
            .join('')}
        </div>
        <div class="quiz-explain" data-role="explain" hidden></div>
        <div class="quiz-next" data-role="next" hidden>
          <button class="play-btn" type="button">${state.current + 1 < state.questions.length ? 'Дальше →' : 'Результат →'}</button>
        </div>
      </div>`;
    root.querySelector('.quiz-options').addEventListener('click', (event) => {
      const button = event.target.closest('[data-option]');
      if (button) choose(Number(button.dataset.option));
    });
    root.querySelector('[data-role="next"] button').addEventListener('click', next);
  }

  function choose(index) {
    if (state.answered) return;
    state.answered = true;
    const q = state.questions[state.current];
    const correct = index === q.answer;
    if (correct) state.score += 1;
    root.querySelectorAll('[data-option]').forEach((button) => {
      const i = Number(button.dataset.option);
      button.disabled = true;
      if (i === q.answer) button.classList.add('is-correct');
      else if (i === index) button.classList.add('is-wrong');
    });
    const explain = root.querySelector('[data-role="explain"]');
    explain.hidden = false;
    explain.className = `quiz-explain ${correct ? 'is-correct' : 'is-wrong'}`;
    explain.innerHTML = `<b>${correct ? '✓ Верно!' : '✗ Неверно.'}</b> ${escapeHtml(q.explanation)}`;
    const nextBlock = root.querySelector('[data-role="next"]');
    nextBlock.hidden = false;
    nextBlock.querySelector('button').focus({ preventScroll: true });
  }

  function next() {
    state.current += 1;
    if (state.current < state.questions.length) showQuestion();
    else results();
  }

  function results() {
    const total = state.questions.length;
    const best = storage.get('quizBest', 0);
    const isRecord = state.score > best;
    if (isRecord) storage.set('quizBest', state.score);
    root.innerHTML = `
      <div class="panel quiz quiz-intro">
        <div class="quiz-emoji" aria-hidden="true">${state.score === total ? '🏆' : state.score >= total * 0.5 ? '🎉' : '📚'}</div>
        <h2>${state.score} из ${total}</h2>
        <p>${verdict(state.score, total)}</p>
        ${isRecord ? '<p class="best">Новый рекорд!</p>' : `<p class="muted">Рекорд: ${Math.max(best, state.score)} из ${total}</p>`}
        <button class="play-btn" type="button" data-action="start"><span>↻</span><span>Пройти ещё раз</span></button>
      </div>`;
    root.querySelector('[data-action="start"]').addEventListener('click', start);
  }

  startScreen();

  return {
    onKey: (event) => {
      if (state.answered && event.key === 'Enter') return;
      const n = Number(event.key);
      if (n >= 1 && n <= 4 && root.querySelector(`[data-option="${n - 1}"]`)) choose(n - 1);
    },
  };
}
