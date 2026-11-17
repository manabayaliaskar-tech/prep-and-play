// «Сохранённое»: задания в закладках и заметки к ним. Можно открыть задание, поправить заметку,
// убрать из закладок и потренироваться на всех сохранённых сразу.

import { t, tx } from '../core/i18n.js';
import { getSaved, removeSaved, setNote } from '../core/saved.js';
import { createRng, newSeed, shuffle } from '../core/random.js';
import { skillName } from '../content/labels.js';
import { POOLS, TOPICS } from '../pools/topics.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { correctAnswerHtml, questionHtml } from '../ui/question.js';
import { mountSolution } from '../ui/solution.js';
import { L } from '../pools/gen.js';
import { POOL_NAMES } from './quiz.js';
import { baseStats, celebrate, runSession } from './play.js';

const EXTRA_NAMES = {
  reading: L('Reading', 'Чтение', 'Оқу'),
  russian: L('Russian', 'Русский язык', 'Орыс тілі'),
  spanish: L('Spanish', 'Испанский', 'Испан тілі'),
  french: L('French', 'Французский', 'Француз тілі'),
  chinese: L('Chinese', 'Китайский', 'Қытай тілі'),
};
const poolName = (pid) => tx(POOL_NAMES[pid] ?? EXTRA_NAMES[pid] ?? L(pid, pid, pid));
const poolOf = (q) => TOPICS[q.skill]?.pool ?? (q.section === 'math' ? 'math' : 'english');

/** Короткий текст задания для списка (без HTML). */
function preview(q) {
  const raw = String(tx(q.prompt) ?? '');
  const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

export function savedRoute(app) {
  let session = null;
  let filter = 'all';
  let query = '';
  let open = null;

  function train(list) {
    const questions = shuffle(
      list.map((x) => x.q),
      createRng(newSeed()),
    ).slice(0, 20);
    session = runSession(app, {
      title: () => `🔖 ${t('saved.title')}`,
      questions,
      catalog: true,
      review: true,
      exitTo: '/saved',
      onFinish: (run) => {
        celebrate(run.correct >= Math.ceil(run.answered * 0.7));
        return () => ({
          mood: run.correct >= Math.ceil(run.answered * 0.7) ? 'win' : 'neutral',
          title: t('saved.trainDone'),
          subtitle: t('pr.result', { c: run.correct, n: run.answered }),
          xp: run.xp,
          stats: baseStats(run),
          log: run.log,
          actions: [{ label: `🔖 ${t('saved.back')}`, href: '/saved', primary: true }],
        });
      },
    });
  }

  const render = () => {
    const all = getSaved();
    const pools = [...new Set(all.map((x) => poolOf(x.q)))];
    if (filter !== 'all' && filter !== 'notes' && !pools.includes(filter)) filter = 'all';
    const q = query.toLowerCase();
    const list = all.filter(
      (x) =>
        (filter === 'all' || (filter === 'notes' ? x.note : poolOf(x.q) === filter)) &&
        (!q || preview(x.q).toLowerCase().includes(q) || x.note.toLowerCase().includes(q) || String(tx(skillName(x.q.skill))).toLowerCase().includes(q)),
    );
    const notes = all.filter((x) => x.note).length;
    app.innerHTML = `
      <section class="page saved-page">
        <div class="page-head saved-head">
          ${mascot('happy', 'mascot-md float')}
          <div>
            <h1>🔖 ${t('saved.title')}</h1>
            <p class="muted">${t('saved.desc')}</p>
          </div>
        </div>
        ${
          all.length
            ? `<div class="saved-tools">
                <input class="saved-search" type="search" placeholder="${t('saved.search')}" value="${esc(query)}" aria-label="${t('saved.search')}">
                <button type="button" class="btn btn-primary saved-train">▶ ${t('saved.train', { n: Math.min(20, list.length) })}</button>
              </div>
              <div class="ach-filters saved-filters">
                <button type="button" class="ach-filter ${filter === 'all' ? 'is-active' : ''}" data-filter="all">${t('saved.all')} · ${all.length}</button>
                ${notes ? `<button type="button" class="ach-filter ${filter === 'notes' ? 'is-active' : ''}" data-filter="notes">📝 ${t('saved.withNotes')} · ${notes}</button>` : ''}
                ${pools.map((pid) => `<button type="button" class="ach-filter ${filter === pid ? 'is-active' : ''}" data-filter="${pid}">${POOLS[pid]?.icon ?? ''} ${esc(poolName(pid))}</button>`).join('')}
              </div>
              <div class="saved-list">
                ${
                  list.length
                    ? list
                        .map(
                          (x, i) => `<article class="saved-item ${open === x.id ? 'is-open' : ''}" style="--i:${i}" data-id="${esc(x.id)}">
                            <button type="button" class="saved-row" data-open="${esc(x.id)}" aria-expanded="${open === x.id}">
                              <span class="saved-icon">${POOLS[poolOf(x.q)]?.icon ?? '📌'}</span>
                              <span class="saved-text"><small>${esc(tx(skillName(x.q.skill)))} · ${x.date.split('-').reverse().join('.')}</small><b>${esc(preview(x.q))}</b>${x.note ? `<em>📝 ${esc(x.note)}</em>` : ''}</span>
                              <span class="saved-chev" aria-hidden="true">›</span>
                            </button>
                            ${open === x.id ? openHtml(x) : ''}
                          </article>`,
                        )
                        .join('')
                    : `<p class="empty-note">${t('saved.nothing')}</p>`
                }
              </div>`
            : `<div class="panel saved-empty">${mascot('think', 'mascot-md')}<div><b>${t('saved.emptyTitle')}</b><p class="muted">${t('saved.empty')}</p><a class="btn btn-primary" href="#/today">🧭 ${t('today.title')}</a></div></div>`
        }
      </section>`;
    bind(list);
  };

  function openHtml(x) {
    return `<div class="saved-open">
      <div class="saved-q">${questionHtml(x.q)}</div>
      <p class="saved-answer">${t('fb.correctAnswer')}: ${correctAnswerHtml(x.q)}</p>
      <div class="saved-solution"></div>
      <label class="note-label" for="note-${esc(x.id)}">📝 ${t('note.title')}</label>
      <textarea id="note-${esc(x.id)}" class="note-text" maxlength="1000" rows="3" placeholder="${t('note.placeholder')}">${esc(x.note)}</textarea>
      <div class="note-actions">
        <button type="button" class="btn btn-primary btn-sm note-save">${t('note.save')}</button>
        <button type="button" class="btn btn-soft btn-sm saved-remove">🗑 ${t('saved.remove')}</button>
        <span class="note-status muted small" aria-live="polite"></span>
      </div>
    </div>`;
  }

  function bind(list) {
    const search = app.querySelector('.saved-search');
    search?.addEventListener('input', () => {
      query = search.value;
      const pos = search.selectionStart;
      render();
      const again = app.querySelector('.saved-search');
      again.focus();
      again.setSelectionRange(pos, pos);
    });
    app.querySelector('.saved-train')?.addEventListener('click', () => list.length && train(list));
    app.querySelectorAll('[data-filter]').forEach((b) =>
      b.addEventListener('click', () => {
        filter = b.dataset.filter;
        render();
      }),
    );
    app.querySelectorAll('[data-open]').forEach((b) =>
      b.addEventListener('click', () => {
        open = open === b.dataset.open ? null : b.dataset.open;
        render();
        app.querySelector('.saved-item.is-open')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }),
    );
    const box = app.querySelector('.saved-item.is-open');
    if (box) {
      const item = list.find((x) => x.id === open);
      // Варианты в сохранённом задании только для просмотра.
      box.querySelectorAll('.choice').forEach((c) => {
        c.disabled = true;
        if (Number(c.dataset.choice) === item.q.answer) c.classList.add('is-correct');
      });
      box.querySelector('.spr-input')?.setAttribute('disabled', '');
      if (item.q.ex) mountSolution(box.querySelector('.saved-solution'), item.q);
      box.querySelector('.note-save').addEventListener('click', () => {
        setNote(item.q, box.querySelector('.note-text').value);
        box.querySelector('.note-status').textContent = `✓ ${t('note.saved')}`;
        setTimeout(render, 600);
      });
      box.querySelector('.saved-remove').addEventListener('click', () => {
        removeSaved(item.id);
        open = null;
        render();
      });
    }
  }

  render();
  return {
    cleanup: () => session?.cleanup(),
    relabel: () => (session ? session.relabel() : render()),
  };
}
