// «Друзья»: свой код, добавление друзей по коду и рейтинг недели (опыт с понедельника, серия, вид Препи).
// Без аккаунта - объяснение и ссылка на вход в профиле. Если в базе ещё нет таблиц - «скоро заработает».

import { isSignedIn } from '../core/cloud.js';
import { flameSvg } from '../core/economy.js';
import {
  CODE_RE,
  MAX_FRIENDS,
  NAME_MAX,
  addFriend,
  ensureCode,
  errorKind,
  fetchFriends,
  getFriends,
  isoWeek,
  leaveBoard,
  myCode,
  myRow,
  normalizeCode,
  readLook,
  removeFriend,
  sortBoard,
} from '../core/friends.js';
import { t } from '../core/i18n.js';
import { getProfile, saveProfile } from '../core/profile.js';
import { navigate } from '../core/router.js';
import { esc } from '../ui/dom.js';
import { mascot } from '../ui/mascot.js';
import { openModal, toast } from '../ui/overlay.js';

const SITE = 'https://prepplay.app/';
/** Код из ссылки «#/friends/PREP-XXXXX» - подставляем в поле, пока человек не добавит. */
let pendingCode = '';

const shareLink = (code) => `${SITE}#/friends/${code}`;

function howHtml() {
  return `<ol class="fr-how">
    <li><span>📋</span>${t('fr.how1')}</li>
    <li><span>👋</span>${t('fr.how2')}</li>
    <li><span>📅</span>${t('fr.how3')}</li>
  </ol>`;
}

function heroHtml() {
  return `<div class="fr-hero">
    ${mascot('happy', 'mascot-md float')}
    <div><h1>👋 ${t('fr.title')}</h1><p class="muted">${t('fr.sub')}</p></div>
  </div>`;
}

function signedOutHtml() {
  return `${heroHtml()}
    <div class="panel fr-panel">
      ${howHtml()}
      <p class="fr-note">🔒 ${t('fr.signedOut')}</p>
      <a class="btn btn-primary" href="#/profile">🌐 ${t('fr.signIn')}</a>
    </div>`;
}

function codeHtml(code) {
  const p = getProfile();
  return `<div class="panel fr-panel fr-me">
    <div class="fr-code-box">
      <span class="muted small">${t('fr.myCode')}</span>
      <b class="fr-code">${esc(code)}</b>
      <div class="fr-code-actions">
        <button type="button" class="btn btn-soft btn-sm fr-copy">📋 ${t('fr.copy')}</button>
        <button type="button" class="btn btn-primary btn-sm fr-share">📤 ${t('fr.share')}</button>
      </div>
    </div>
    <label class="fr-field"><span class="muted small">${t('fr.nameLabel')}</span>
      <input class="acc-input fr-name-input" type="text" maxlength="${NAME_MAX}" value="${esc(p.name ?? '')}" placeholder="${t('duel.namePlaceholder')}"/></label>
    <p class="muted tiny fr-privacy">${t('fr.nameHint')}</p>
  </div>`;
}

function addHtml() {
  return `<form class="panel fr-panel fr-add">
    <label class="muted small" for="fr-add-input">${t('fr.addLabel')}</label>
    <div class="acc-form">
      <input id="fr-add-input" class="acc-input fr-add-input" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" placeholder="PREP-7K2QX" value="${esc(pendingCode)}"/>
      <button class="btn btn-primary">${t('fr.add')}</button>
    </div>
    <p class="acc-error fr-add-error" hidden></p>
  </form>`;
}

function rowHtml(r, i, mine) {
  const me = r.code === mine;
  const name = me ? getProfile().name?.trim() || t('fr.noName') : r.missing ? r.code : r.name || t('fr.noName');
  const sub = me ? t('fr.you') : r.missing ? t('fr.notYet') : r.code;
  return `<li class="fr-row ${me ? 'is-me' : ''} ${r.missing ? 'is-missing' : ''}">
    <span class="fr-rank ${i < 3 && r.xp > 0 ? `top${i + 1}` : ''}">${i + 1}</span>
    <span class="fr-ava">${mascot('happy', 'mascot-xs', readLook(r.look), { fx: false })}<span class="lvl-badge" title="${t('home.level', { n: r.level ?? 1 })}">${Number(r.level) || 1}</span></span>
    <span class="fr-who"><b>${esc(name)}</b><small>${esc(sub)}</small></span>
    <span class="fr-xp"><b>${r.xp}</b><small>XP</small></span>
    <span class="fr-streak" title="${t('fr.streak', { n: r.streak })}">${flameSvg(r.streak)}<b>${r.streak}</b></span>
    ${me ? '<span class="fr-del-gap"></span>' : `<button type="button" class="icon-btn fr-del" data-code="${esc(r.code)}" data-name="${esc(name)}" aria-label="${t('fr.remove')}" title="${t('fr.remove')}">✕</button>`}
  </li>`;
}

function boardHtml(rows, mine) {
  const friends = getFriends();
  return `<div class="panel fr-panel fr-board">
    <div class="fr-board-head"><h2>🏆 ${t('fr.week')}</h2><span class="muted small">${t('fr.count', { n: friends.length, m: MAX_FRIENDS })}</span></div>
    <p class="muted small">${t('fr.weekHint')}</p>
    <ol class="fr-table">${rows.map((r, i) => rowHtml(r, i, mine)).join('')}</ol>
    ${friends.length ? '' : `<div class="empty-note fr-empty">${mascot('wow', 'mascot-sm')}<div><p>${t('fr.empty')}</p>${howHtml()}</div></div>`}
  </div>`;
}

function errorHtml(kind) {
  if (kind === 'soon') {
    return `<div class="panel fr-panel fr-state"><span class="fr-state-icon">⏳</span><h2>${t('fr.soonTitle')}</h2><p class="muted">${t('fr.soonText')}</p></div>`;
  }
  return `<div class="panel fr-panel fr-state"><span class="fr-state-icon">⚠</span><p>${kind === 'offline' ? t('fr.offline') : t('fr.error')}</p><button type="button" class="btn btn-soft fr-retry">🔄 ${t('fr.retry')}</button></div>`;
}

export function friendsRoute(app, params = {}) {
  if (params.code) pendingCode = normalizeCode(params.code) ?? '';
  let state = { phase: 'loading', rows: [], kind: null };
  let alive = true;

  const load = async () => {
    if (!isSignedIn()) return render();
    try {
      if (!myCode() || state.phase !== 'ready') await ensureCode();
      const remote = await fetchFriends();
      const mine = myCode();
      const byCode = new Map(remote.map((r) => [r.code, r]));
      const rows = [myRow(mine), ...getFriends().map((c) => byCode.get(c) ?? { code: c, name: null, look: null, week: null, week_xp: 0, streak: 0, level: 1, missing: true })];
      state = { phase: 'ready', rows: sortBoard(rows, isoWeek()), kind: null };
    } catch (err) {
      state = { phase: 'error', rows: [], kind: errorKind(err) };
    }
    if (alive && app.querySelector('.fr-page')) render();
  };

  const render = () => {
    const mine = myCode();
    let body;
    if (!isSignedIn()) body = signedOutHtml();
    else if (state.phase === 'loading') body = `${heroHtml()}<div class="panel fr-panel fr-state"><span class="fr-state-icon">⏳</span><p class="muted">${t('fr.loading')}</p></div>`;
    else if (state.phase === 'error') body = `${heroHtml()}${state.kind !== 'soon' && mine ? codeHtml(mine) : ''}${errorHtml(state.kind)}`;
    else
      body = `${heroHtml()}
        <div class="fr-grid">
          <div class="fr-side">${codeHtml(mine)}${addHtml()}</div>
          ${boardHtml(state.rows, mine)}
        </div>
        <p class="fr-leave muted tiny"><a href="#/privacy">${t('privacy.title')}</a> · <button type="button" class="link-btn fr-leave-btn">${t('fr.leave')}</button></p>`;
    app.innerHTML = `<section class="page fr-page"><a class="crumb" href="#/profile">← ${t('nav.profile')}</a>${body}</section>`;
    bind();
  };

  const copyCode = async () => {
    const code = myCode();
    try {
      await navigator.clipboard.writeText(code);
      toast(`✅ ${t('fr.copied')}`, { kind: 'good' });
    } catch {
      toast(`📋 ${esc(code)}`);
    }
  };

  const bind = () => {
    app.querySelector('.fr-retry')?.addEventListener('click', () => {
      state = { phase: 'loading', rows: [], kind: null };
      render();
      load();
    });
    app.querySelector('.fr-copy')?.addEventListener('click', copyCode);
    app.querySelector('.fr-share')?.addEventListener('click', async () => {
      const code = myCode();
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Prep&Play', text: t('fr.shareText', { code }), url: shareLink(code) });
          return;
        } catch (e) {
          if (e?.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(`${t('fr.shareText', { code })} ${shareLink(code)}`);
        toast(`✅ ${t('fr.copied')}`, { kind: 'good' });
      } catch {
        copyCode();
      }
    });
    app.querySelector('.fr-name-input')?.addEventListener('change', (e) => {
      const p = getProfile();
      p.name = e.target.value.trim().slice(0, NAME_MAX);
      saveProfile();
      toast(`✅ ${t('profile.saved')}`, { kind: 'good' });
      const mine = myCode();
      state.rows = sortBoard(state.rows.map((r) => (r.code === mine ? myRow(mine) : r)), isoWeek());
      render();
    });
    app.querySelector('.fr-add-input')?.addEventListener('input', (e) => (pendingCode = e.target.value));
    app.querySelector('.fr-add')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = app.querySelector('.fr-add-input');
      const res = addFriend(input.value);
      if (res.error) {
        const box = app.querySelector('.fr-add-error');
        box.textContent = { format: t('fr.errFormat'), self: t('fr.errSelf'), dup: t('fr.errDup'), max: t('fr.errMax', { n: MAX_FRIENDS }) }[res.error];
        box.hidden = false;
        input.focus();
        return;
      }
      pendingCode = '';
      toast(`👋 ${t('fr.added')}`, { kind: 'good' });
      load();
    });
    app.querySelectorAll('.fr-del').forEach((b) =>
      b.addEventListener('click', () => {
        const code = b.dataset.code;
        if (!CODE_RE.test(code)) return;
        openModal({
          title: t('fr.remove'),
          body: `<p>${t('fr.removeText', { name: `<b>${esc(b.dataset.name)}</b>` })}</p>`,
          actions: [
            { label: t('acc.stay') },
            {
              label: t('fr.removeYes'),
              danger: true,
              onClick: () => {
                removeFriend(code);
                state.rows = state.rows.filter((r) => r.code !== code);
                render();
              },
            },
          ],
        });
      }),
    );
    app.querySelector('.fr-leave-btn')?.addEventListener('click', () =>
      openModal({
        title: t('fr.leave'),
        body: `<p>${t('fr.leaveText')}</p>`,
        actions: [
          { label: t('acc.stay'), primary: true },
          {
            label: t('fr.leaveYes'),
            danger: true,
            onClick: () =>
              leaveBoard()
                .then(() => {
                  toast(`✅ ${t('fr.left')}`, { kind: 'good' });
                  navigate('/profile');
                })
                .catch((err) => toast(`⚠ ${errorKind(err) === 'offline' ? t('fr.offline') : t('fr.error')}`)),
          },
        ],
      }),
    );
  };

  render();
  load();
  return {
    relabel: render,
    cleanup: () => {
      alive = false;
    },
  };
}
