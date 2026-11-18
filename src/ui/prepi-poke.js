// Препи отвечает на нажатия: смеётся, удивляется, подмигивает, кружится, танцует купленные эмоции,
// а если тыкать слишком часто — у него кружится голова, а потом он сердится.

import { t } from '../core/i18n.js';
import { sfx } from '../core/sound.js';
import { ownedEmotes } from '../core/shop.js';
import { EMOTES } from './art/emotes.js';
import { mascot } from './mascot.js';

const REACTIONS = ['laugh', 'wow', 'love', 'wink', 'starstruck', 'proud', 'cool', 'shy'];
export const POKE_LINES = 8;

/**
 * Делает Препи в holder «живым». base() возвращает { mood, cls, outfit, form } — каким Препи нарисован обычно.
 * Возвращает функцию для проигрывания эмоции (например, после победы).
 */
export function bindPoke(holder, base) {
  if (!holder) return () => {};
  let streak = 0;
  let lastTap = 0;
  let timer = 0;
  let bubbleTimer = 0;

  const draw = (opts = {}) => {
    const b = base();
    const svg = holder.querySelector('svg.mascot');
    const html = mascot(opts.mood ?? b.mood, `${b.cls} ${opts.cls ?? ''}`, b.outfit, { form: opts.form === undefined ? b.form : opts.form, emote: opts.emote });
    if (svg) svg.outerHTML = html;
    else holder.insertAdjacentHTML('afterbegin', html);
  };

  const say = (text) => {
    let bubble = holder.querySelector('.poke-bubble');
    if (!bubble) {
      bubble = document.createElement('span');
      bubble.className = 'poke-bubble';
      holder.append(bubble);
    }
    bubble.textContent = text;
    bubble.classList.remove('is-in');
    void bubble.offsetWidth;
    bubble.classList.add('is-in');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('is-in'), 2200);
  };

  const play = (opts, ms = 1700) => {
    clearTimeout(timer);
    draw(opts);
    timer = setTimeout(() => draw(), ms);
  };

  holder.addEventListener('click', (e) => {
    if (e.target.closest('a, .prepi-dress-btn')) return;
    const now = Date.now();
    streak = now - lastTap < 900 ? streak + 1 : 0;
    lastTap = now;
    sfx.tap();
    if (streak >= 7) {
      play({ mood: 'angry', form: null, cls: 'poke-shake' }, 2000);
      say(t('poke.angry'));
      return;
    }
    if (streak >= 4) {
      play({ mood: 'dizzy', form: null, cls: 'poke-spin' }, 1900);
      say(t('poke.dizzy'));
      return;
    }
    const emotes = ownedEmotes();
    if (emotes.length && Math.random() < 0.35) {
      const emote = emotes[Math.floor(Math.random() * emotes.length)];
      play({ emote, form: null }, Math.max(2400, EMOTES[emote]?.ms ?? 3200));
      return;
    }
    const line = base().line;
    if (line && !holder.dataset.saidMood) {
      holder.dataset.saidMood = '1';
      play({ mood: 'wink', form: null, cls: 'poke-squish' });
      say(line);
      return;
    }
    const mood = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    play({ mood, form: null, cls: 'poke-squish' });
    if (Math.random() < 0.6) say(t(`poke.${1 + Math.floor(Math.random() * POKE_LINES)}`));
  });

  return (emote, ms = 3200) => play({ emote, form: null }, ms);
}
