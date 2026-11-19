// Карточка «Аккаунт» в профиле: вход по коду из письма, состояние синхронизации, выход.
// И окно «Сообщить об ошибке» для задания.

import { cloudEmail, cloudMeta, isSignedIn, pushNow, sendCode, sendReport, signOut, useRemote, verifyCode } from '../core/cloud.js';
import { getLang, t } from '../core/i18n.js';
import { esc } from './dom.js';
import { mascot } from './mascot.js';
import { openModal, toast } from './overlay.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
let pendingEmail = '';

const fmtTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export function accountCardHtml() {
  if (isSignedIn()) {
    const meta = cloudMeta();
    return `<div class="panel account-card is-in">
      <div class="acc-head"><span class="acc-icon">🌐</span><div><h2>${t('acc.title')}</h2><p class="muted small">${t('acc.signedAs')} <b>${esc(cloudEmail())}</b></p></div></div>
      <p class="acc-sync">${meta.dirty ? `⏳ ${t('acc.pending')}` : `✅ ${t('acc.synced')}`} · <span class="muted small">${t('acc.last')}: ${fmtTime(meta.lastSync)}</span></p>
      <div class="acc-actions"><button type="button" class="btn btn-soft btn-sm acc-sync-btn">🔄 ${t('acc.syncNow')}</button><button type="button" class="btn btn-ghost btn-sm acc-out">${t('acc.signOut')}</button></div>
    </div>`;
  }
  const step = pendingEmail ? 'code' : 'email';
  return `<div class="panel account-card">
    <div class="acc-head"><span class="acc-icon">🌐</span><div><h2>${t('acc.title')}</h2><p class="muted small">${t('acc.why')}</p></div></div>
    ${
      step === 'email'
        ? `<form class="acc-form acc-email-form"><input class="acc-input" type="email" inputmode="email" autocomplete="email" required placeholder="${t('acc.emailPh')}" aria-label="${t('acc.emailPh')}"/><button class="btn btn-primary">${t('acc.getCode')}</button></form>`
        : `<p class="small">${t('acc.codeSent', { email: `<b>${esc(pendingEmail)}</b>` })}</p>
           <form class="acc-form acc-code-form"><input class="acc-input acc-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required placeholder="123456" aria-label="${t('acc.codePh')}"/><button class="btn btn-primary">${t('acc.signIn')}</button></form>
           <button type="button" class="link-btn acc-back">← ${t('acc.otherEmail')}</button>`
    }
    <p class="acc-error" hidden></p>
    <p class="muted tiny">${t('acc.optional')}</p>
  </div>`;
}

function showError(root, err) {
  const box = root.querySelector('.acc-error');
  if (!box) return;
  const status = err?.status;
  box.textContent = status === 429 ? t('acc.errTooMany') : status === 403 || status === 401 || err?.code === 'otp_expired' ? t('acc.errCode') : navigator.onLine === false ? t('acc.errOffline') : t('acc.errGeneric');
  box.hidden = false;
}

function busy(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.classList.toggle('is-busy', on);
}

/** Выбор, когда и в аккаунте, и на устройстве есть прогресс. */
function askConflict({ remote, localXp, remoteXp }, rerender) {
  openModal({
    title: `🌐 ${t('acc.conflictTitle')}`,
    body: `<div class="help-confirm">${mascot('think', 'mascot-sm')}<p>${t('acc.conflictText', { a: remoteXp, b: localXp })}</p></div>`,
    actions: [
      { label: `🌐 ${t('acc.useCloud', { n: remoteXp })}`, primary: remoteXp >= localXp, onClick: () => useRemote(remote) },
      {
        label: `📱 ${t('acc.useDevice', { n: localXp })}`,
        primary: localXp > remoteXp,
        onClick: () => pushNow().then(() => (toast(`✅ ${t('acc.synced')}`, { kind: 'good' }), rerender())),
      },
    ],
  });
}

export function bindAccount(root, rerender) {
  root.querySelector('.acc-email-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = root.querySelector('.acc-input').value.trim();
    if (!EMAIL_RE.test(email)) return showError(root, {});
    const btn = e.currentTarget.querySelector('button');
    busy(btn, true);
    try {
      await sendCode(email);
      pendingEmail = email;
      rerender();
      document.querySelector('.acc-code')?.focus();
    } catch (err) {
      busy(btn, false);
      showError(root, err);
    }
  });
  root.querySelector('.acc-code-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = root.querySelector('.acc-code').value.replace(/\s/g, '');
    const btn = e.currentTarget.querySelector('button');
    busy(btn, true);
    try {
      const res = await verifyCode(pendingEmail, code);
      pendingEmail = '';
      if (res?.reloaded) return;
      toast(`🌐 ${t('acc.welcome')}`, { kind: 'good' });
      rerender();
      if (res?.conflict) askConflict(res.conflict, rerender);
    } catch (err) {
      busy(btn, false);
      showError(root, err);
    }
  });
  root.querySelector('.acc-back')?.addEventListener('click', () => {
    pendingEmail = '';
    rerender();
  });
  root.querySelector('.acc-sync-btn')?.addEventListener('click', async (e) => {
    busy(e.currentTarget, true);
    try {
      await pushNow();
      toast(`✅ ${t('acc.synced')}`, { kind: 'good' });
    } catch (err) {
      toast(`⚠ ${navigator.onLine === false ? t('acc.errOffline') : t('acc.errGeneric')}`);
    }
    rerender();
  });
  root.querySelector('.acc-out')?.addEventListener('click', () =>
    openModal({
      title: t('acc.signOut'),
      body: `<p>${t('acc.signOutText')}</p>`,
      actions: [
        { label: t('acc.stay') },
        { label: t('acc.signOut'), danger: true, onClick: () => signOut().then(rerender) },
      ],
    }),
  );
}

// ---------- Сообщить об ошибке в задании ----------

const REASONS = [
  ['answer', () => t('rep.r.answer')],
  ['text', () => t('rep.r.text')],
  ['unclear', () => t('rep.r.unclear')],
  ['other', () => t('rep.r.other')],
];

export function openReport(q) {
  // Окно закрывается до нажатия обработчика кнопки, поэтому выбор запоминаем сразу.
  let reason = 'answer';
  let text = '';
  openModal({
    title: `⚠ ${t('rep.title')}`,
    body: `<form class="rep-form">
      <div class="rep-reasons">${REASONS.map(([r, label], i) => `<label class="rep-reason"><input type="radio" name="rep" value="${r}" ${i === 0 ? 'checked' : ''}/> ${label()}</label>`).join('')}</div>
      <textarea class="rep-text" maxlength="1500" rows="3" placeholder="${t('rep.placeholder')}"></textarea>
      <p class="muted tiny">${t('rep.note')}</p>
    </form>`,
    actions: [
      { label: t('acc.stay') },
      {
        label: `📝 ${t('rep.send')}`,
        primary: true,
        onClick: () => {
          // Окно уже закрыто - отправляем в фоне и сообщаем результат.
          sendReport({ questionId: q.id, topic: q.skill ?? q.topic, lang: getLang(), message: `[${reason}] ${text.trim()}` })
            .then(() => toast(`📝 ${t('rep.thanks')}`, { kind: 'good' }))
            .catch(() => toast(`⚠ ${navigator.onLine === false ? t('acc.errOffline') : t('rep.fail')}`));
        },
      },
    ],
  });
  const form = document.querySelector('.rep-form');
  form?.addEventListener('change', (e) => {
    if (e.target.name === 'rep') reason = e.target.value;
  });
  const area = document.querySelector('.rep-text');
  area?.addEventListener('input', () => (text = area.value));
  area?.addEventListener('keydown', (e) => e.stopPropagation());
}
