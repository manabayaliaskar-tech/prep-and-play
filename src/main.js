// Точка входа: маршруты, верхняя панель, уведомления о достижениях и новых уровнях.

import { confetti } from './core/confetti.js';
import { on } from './core/events.js';
import { dayKey } from './core/dates.js';
import { getLang, onLangChange, t, tx } from './core/i18n.js';
import { addXp, getProfile, saveProfile, syncAchievements } from './core/profile.js';
import { claimQuests } from './core/quests.js';
import { applyTheme } from './core/theme.js';
import { refreshRoute, route, startRouter } from './core/router.js';
import { sfx } from './core/sound.js';
import { ACHIEVEMENTS } from './content/achievements.js';
import { detectiveRoute } from './screens/detective.js';
import { examRoute } from './screens/exam.js';
import { courseScreen, examsScreen, practiceHubScreen } from './screens/catalog.js';
import { hubScreen } from './screens/hub.js';
import { bossRoute, levelRoute, mapScreen } from './screens/map.js';
import { blitzRoute, dailyRoute, duelAcceptRoute, duelRoute, survivalRoute, weakRoute } from './screens/modes.js';
import { trackRoute } from './screens/practice.js';
import { quizRoute } from './screens/quiz.js';
import { profileScreen } from './screens/profile.js';
import { premiumScreen } from './screens/premium.js';
import { satHomeScreen } from './screens/sat-home.js';
import { toast } from './ui/overlay.js';
import { startMotion } from './ui/motion.js';
import { bindThemePicker } from './ui/theme-picker.js';
import { bindPins } from './core/pins.js';
import { takeNewItems } from './core/wardrobe.js';
import { initPwa, isStandalone } from './core/pwa.js';
import { bindSayButtons, stopSpeech } from './core/voice.js';
import { startCoinify } from './ui/coin.js';
import { startEmojify } from './ui/emoji.js';
import { mistakesRoute, weakCourseRoute } from './screens/review.js';
import { planRoute } from './screens/plan.js';
import { reportRoute } from './screens/report.js';
import { cardsRoute } from './screens/cards.js';
import { achievementsRoute } from './screens/achievements.js';
import { shopRoute } from './screens/shop.js';
import { goodName, goodThumb } from './ui/goods-ui.js';
import { mockRoute } from './screens/mock.js';
import { todayRoute } from './screens/today.js';
import { adaptRoute, diagRoute, knowRoute } from './screens/learn.js';
import { savedRoute } from './screens/saved.js';
import { fullReadRoute } from './screens/fullread.js';
import { explainIndexRoute, explainRoute } from './screens/explain.js';
import { seasonName, seasonRoute } from './screens/season.js';
import { seasonId, themeOf } from './core/season.js';
import { bindLangSwitches, renderTopbar } from './ui/topbar.js';

const app = document.getElementById('app');

// Общие разделы
route('/', () => hubScreen(app));
route('/exams', () => examsScreen(app));
route('/practice', () => practiceHubScreen(app));
route('/code', () => practiceHubScreen(app, 'code'));
route('/quiz', () => quizRoute(app));
route('/quiz/:mode', (params) => quizRoute(app, params));
route('/quiz/subject/:pool', (params) => quizRoute(app, { subject: params.pool }));
route('/mistakes', () => mistakesRoute(app));
route('/plan', () => planRoute(app));
route('/report', () => reportRoute(app));
route('/cards/:lang', (params) => cardsRoute(app, params));
route('/weak/:course', (params) => weakCourseRoute(app, params));
route('/c/:course', (params) => courseScreen(app, params));
route('/c/:course/:track', (params) => trackRoute(app, params));
// SAT
route('/sat', () => satHomeScreen(app));
route('/map', () => mapScreen(app));
route('/level/:zone/:n', (params) => levelRoute(app, params));
route('/boss/:zone', (params) => bossRoute(app, params));
route('/exam', () => examRoute(app));
route('/survival', () => survivalRoute(app));
route('/blitz', () => blitzRoute(app));
route('/weak', () => weakRoute(app));
route('/daily', () => dailyRoute(app));
route('/duel', () => duelRoute(app));
route('/duel/:code', (params) => duelAcceptRoute(app, params));
route('/detective', () => detectiveRoute(app));
route('/profile', () => profileScreen(app));
route('/achievements', () => achievementsRoute(app));
route('/shop', () => shopRoute(app));
route('/shop/:tab', (params) => shopRoute(app, params));
route('/mock/:exam', (params) => mockRoute(app, params));
route('/season', () => seasonRoute(app));
route('/today', () => todayRoute(app));
route('/diag/:course', (params) => diagRoute(app, params));
route('/know/:course', (params) => knowRoute(app, params));
route('/adapt/:course', (params) => adaptRoute(app, params));
route('/saved', () => savedRoute(app));
route('/ielts-full', () => fullReadRoute(app));
route('/explain', () => explainIndexRoute(app));
route('/explain/:id', (params) => explainRoute(app, params));
route('/premium', () => premiumScreen(app));

on('profile', () => {
  // Ежедневные задания: за каждое выполненное — опыт и уведомление (один раз).
  const fresh = claimQuests(getProfile(), dayKey());
  for (const quest of fresh) {
    const gained = addXp(quest.reward);
    toast(`<span class="toast-icon">${quest.icon}</span><span><small>${t('toast.quest')}</small><b>+${gained} XP</b></span>`, {
      kind: 'achievement',
      duration: 4200,
    });
  }
  if (fresh.length) saveProfile();
  else renderTopbar();
  // Достижения за сундуки, карточки, гардероб и т. п. проверяем при любом сохранении профиля.
  syncAchievements();
  // Новые вещи для Препи: за достижения, уровни и сундуки.
  for (const it of takeNewItems()) {
    toast(`<span class="toast-thumb">${goodThumb(it)}</span><span><small>${t('wear.new')}</small><b>${goodName(it)}</b></span>`, { kind: 'achievement', duration: 5000 });
  }
});
document.addEventListener('routechange', renderTopbar);

// Достижения, полученные одновременно, показываем вместе: до двух — по отдельности, больше — одним уведомлением.
let freshAch = [];
on('achievement', (id) => {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return;
  freshAch.push(a);
  if (freshAch.length > 1) return;
  queueMicrotask(() => {
    const list = freshAch;
    freshAch = [];
    if (list.length <= 2) {
      for (const it of list) {
        toast(`<span class="toast-icon">${it.icon}</span><span><small>${t('toast.achievement')}</small><b>${tx(it.name)}</b></span>`, { kind: 'achievement', duration: 4200 });
      }
      return;
    }
    toast(`<span class="toast-icon">🏆</span><span><small>${t('toast.achievementsMany', { n: list.length })}</small><b>${list.map((it) => it.icon).join(' ')}</b></span>`, {
      kind: 'achievement',
      duration: 5200,
    });
  });
});

on('streakRescued', (count) => {
  sfx.win();
  confetti({ y: 0.3, count: 180 });
  toast(`<span class="toast-icon">🔥</span><span><small>${t('rescue.done')}</small><b>${t('home.streak', { n: count })}</b></span>`, { kind: 'level', duration: 5200 });
});

// Новая ступень сезона — короткое ненавязчивое уведомление.
on('seasonTier', (tier) => {
  const id = seasonId();
  toast(`<span class="toast-icon">${themeOf(id).icon}</span><span><small>${t('season.title', { name: seasonName(id) })}</small><b>${t('season.tierUp', { n: tier })}</b></span>`, { kind: 'achievement', duration: 3200 });
});

on('seasonEnd', ({ coins, items }) => {
  if (!coins && !items.length) return;
  toast(`<span class="toast-icon">🎁</span><span><small>${t('season.endTitle')}</small><b>${coins ? `+${coins} 🪙` : ''}${items.length ? ` +${items.length} 🎁` : ''}</b></span>`, { kind: 'achievement', duration: 6000 });
});

on('levelup', (level) => {
  sfx.levelUp();
  confetti({ y: 0.2, count: 140 });
  toast(`<span class="toast-icon">⭐</span><span><small>${t('toast.levelUp')}</small><b>${t('home.level', { n: level })}</b></span>`, {
    kind: 'level',
    duration: 4200,
  });
});

onLangChange(() => {
  renderTopbar();
  refreshRoute();
});

applyTheme();
document.documentElement.lang = getLang();
bindLangSwitches();
bindThemePicker();
bindPins(refreshRoute);
initPwa();
bindSayButtons();
startCoinify(document.body);
startEmojify(document.body);
document.addEventListener('routechange', () => stopSpeech());
// Открыли как приложение с экрана «Домой» — для достижения «Всегда под рукой».
if (isStandalone() && !getProfile().counters.app) getProfile().counters.app = 1;
syncAchievements();
startMotion(app);
startRouter();
renderTopbar();
