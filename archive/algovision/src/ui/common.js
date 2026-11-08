// Общие элементы интерфейса: панель управления воспроизведением и мелкие помощники.

import { SPEED_MAX, SPEED_MIN, StepPlayer } from '../core/player.js';

export function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );
}

export function playbackControlsHtml({ speed = 4 } = {}) {
  return `
    <div class="playback">
      <div class="playback-buttons">
        <button class="icon-btn" type="button" data-pb="reset" title="В начало" aria-label="В начало">⏮</button>
        <button class="icon-btn" type="button" data-pb="prev" title="Шаг назад (←)" aria-label="Шаг назад">◀</button>
        <button class="play-btn" type="button" data-pb="play" title="Старт / пауза (пробел)">
          <span data-pb="play-icon">▶</span><span data-pb="play-label">Старт</span>
        </button>
        <button class="icon-btn" type="button" data-pb="next" title="Шаг вперёд (→)" aria-label="Шаг вперёд">▶</button>
        <button class="icon-btn" type="button" data-pb="end" title="В конец" aria-label="В конец">⏭</button>
      </div>
      <div class="playback-progress">
        <input type="range" min="0" max="0" value="0" data-pb="progress" aria-label="Прогресс" />
        <span class="muted small" data-pb="counter">0 / 0</span>
      </div>
      <label class="speed">
        <span class="muted small">Скорость</span>
        <input type="range" min="${SPEED_MIN}" max="${SPEED_MAX}" value="${speed}" data-pb="speed" aria-label="Скорость" />
      </label>
    </div>`;
}

/**
 * Подключает кнопки воспроизведения к StepPlayer.
 * canMove() — можно ли сейчас двигаться вперёд (например, нельзя, пока не отвечен вопрос).
 */
export function wirePlayback(root, { onRender, delay, batch, canMove = () => true, onState = () => {} }) {
  const q = (name) => root.querySelector(`[data-pb="${name}"]`);
  const el = {
    reset: q('reset'),
    prev: q('prev'),
    play: q('play'),
    playIcon: q('play-icon'),
    playLabel: q('play-label'),
    next: q('next'),
    end: q('end'),
    progress: q('progress'),
    counter: q('counter'),
    speed: q('speed'),
  };

  const player = new StepPlayer({ delay, batch, onRender, onStateChange: refresh });

  function refresh() {
    const { index, total, playing } = player;
    const forward = canMove();
    el.progress.max = Math.max(0, total - 1);
    el.progress.value = index;
    el.counter.textContent = `${total ? index + 1 : 0} / ${total}`;
    el.playIcon.textContent = playing ? '❚❚' : '▶';
    el.playLabel.textContent = playing ? 'Пауза' : player.atEnd && total > 1 ? 'Заново' : 'Старт';
    el.play.disabled = !forward;
    el.next.disabled = !forward || player.atEnd;
    el.end.disabled = !forward || player.atEnd;
    el.prev.disabled = index === 0;
    el.reset.disabled = index === 0;
    onState({ index, total, playing });
  }

  el.play.addEventListener('click', () => canMove() && player.toggle());
  el.next.addEventListener('click', () => {
    player.pause();
    if (canMove()) player.next();
  });
  el.prev.addEventListener('click', () => {
    player.pause();
    player.prev();
  });
  el.reset.addEventListener('click', () => {
    player.pause();
    player.seek(0);
  });
  el.end.addEventListener('click', () => {
    player.pause();
    if (canMove()) player.seek(player.total - 1);
  });
  el.progress.addEventListener('input', () => {
    player.pause();
    player.seek(Number(el.progress.value));
  });

  return {
    player,
    refresh,
    get speed() {
      return Number(el.speed.value);
    },
    handleKey(event) {
      if (event.key === ' ') {
        event.preventDefault();
        if (canMove()) player.toggle();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        player.pause();
        if (canMove()) player.next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        player.pause();
        player.prev();
      }
    },
  };
}
