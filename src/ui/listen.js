// Плеер аудирования: читает запись по репликам голосом браузера. У разных говорящих — разные голоса.
// Если голоса на устройстве нет — показываем стенограмму, чтобы задание всё равно можно было решить.

import { t } from '../core/i18n.js';
import { canSpeak, speakable, stopSpeech, voicesFor } from '../core/voice.js';
import { esc } from './dom.js';

const RATES = [0.85, 1];

/** Разметка плеера для задания с q.listen. */
export function listenHtml(q) {
  const L = q.listen;
  const speakers = Object.keys(L.speakers ?? { A: 'f' });
  if (!canSpeak(L.lang)) {
    return `<div class="listen listen-novoice"><div class="listen-head"><span class="listen-icon">🎧</span><b>${esc(L.title)}</b></div>
      <p class="muted small">${t('listen.noVoice')}</p>${transcriptHtml(q, true)}</div>`;
  }
  return `<div class="listen" data-listen="${esc(L.id)}">
    <div class="listen-head"><span class="listen-icon">🎧</span><b>${esc(L.title)}</b><span class="listen-who">${speakers.map((s) => `<i class="who-${s}">${s}</i>`).join('')}</span></div>
    <div class="listen-body">
      <button type="button" class="listen-play" aria-label="${t('listen.play')}"><span class="lp-icon">▶</span></button>
      <div class="listen-wave" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--i:${i};height:${22 + ((i * 37) % 61)}%"></i>`).join('')}</div>
      <button type="button" class="listen-rate" title="${t('listen.rate')}">1×</button>
    </div>
    <div class="listen-progress"><i></i></div>
    <p class="listen-status muted small">${t('listen.hint', { n: L.lines.length })}</p>
  </div>`;
}

export function transcriptHtml(q, open = false) {
  const L = q.listen;
  return `<details class="transcript" ${open ? 'open' : ''}><summary>📜 ${t('listen.transcript')}</summary>
    <div class="transcript-lines">${L.lines.map((l) => `<p class="tl who-${l.s}"><b>${l.s}</b><span>${esc(l.t)}</span></p>`).join('')}</div></details>`;
}

/** Подключает плеер в root. Возвращает функцию остановки. */
export function bindListen(root, q) {
  const box = root.querySelector('[data-listen]');
  if (!box) return () => {};
  const L = q.listen;
  const play = box.querySelector('.listen-play');
  const bar = box.querySelector('.listen-progress i');
  const status = box.querySelector('.listen-status');
  const rateBtn = box.querySelector('.listen-rate');
  let rate = 1;
  let playing = false;
  let index = 0;
  let plays = 0;
  let token = 0;

  const voices = voicesFor(L.lang, L.speakers ?? { A: 'f' });

  const setState = (on) => {
    playing = on;
    box.classList.toggle('is-playing', on);
    play.querySelector('.lp-icon').textContent = on ? '❚❚' : '▶';
    play.setAttribute('aria-label', on ? t('listen.pause') : t('listen.play'));
  };

  function speakLine(my) {
    if (my !== token) return;
    if (index >= L.lines.length) {
      setState(false);
      index = 0;
      plays += 1;
      bar.style.width = '100%';
      status.textContent = t('listen.ended', { n: plays });
      return;
    }
    const line = L.lines[index];
    const u = new SpeechSynthesisUtterance(speakable(line.t));
    u.lang = voices[line.s]?.lang ?? 'en-GB';
    if (voices[line.s]) u.voice = voices[line.s];
    u.rate = RATES[rate] * 0.95;
    u.pitch = (L.speakers?.[line.s] === 'm' && !voices[line.s]) ? 0.85 : 1;
    u.onend = () => {
      if (my !== token) return;
      index += 1;
      bar.style.width = `${Math.round((index / L.lines.length) * 100)}%`;
      setTimeout(() => speakLine(my), 260);
    };
    u.onerror = u.onend;
    status.textContent = t('listen.line', { i: index + 1, n: L.lines.length });
    speechSynthesis.speak(u);
  }

  play.addEventListener('click', () => {
    if (playing) {
      token += 1;
      stopSpeech();
      setState(false);
      status.textContent = t('listen.paused');
      return;
    }
    stopSpeech();
    token += 1;
    setState(true);
    speakLine(token);
  });
  rateBtn.addEventListener('click', () => {
    rate = (rate + 1) % RATES.length;
    rateBtn.textContent = `${RATES[rate]}×`;
  });
  return () => {
    token += 1;
    stopSpeech();
  };
}
