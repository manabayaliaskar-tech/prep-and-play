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
import { hubScreen } from './screens/hub.js';
import { toast } from './ui/overlay.js';
import { startMotion } from './ui/motion.js';
import { bindThemePicker } from './ui/theme-picker.js';
import { bindPins } from './core/pins.js';
import { takeNewItems } from './core/wardrobe.js';
import { initPwa, isStandalone } from './core/pwa.js';
import { bindSayButtons, stopSpeech } from './core/voice.js';
import { startCoinify } from './ui/coin.js';
import { startEmojify } from './ui/emoji.js';
import { goodName, goodThumb } from './ui/goods-ui.js';
import { installFxDefs } from './ui/fx-defs.js';
import { seasonName, seasonRoute } from './screens/season.js';
import { seasonId, themeOf } from './core/season.js';
import { bindLangSwitches, renderTopbar } from './ui/topbar.js';
import { firstSync, isSignedIn, onCloud, startCloud, takeSessionFromUrl } from './core/cloud.js';
import { onStorageSet, storage } from './core/storage.js';
import { askConflict } from './ui/account.js';

// Экраны грузятся по требованию: главная открывается сразу, а код заданий, магазина и т. д. приходит,
// только когда человек туда идёт.
const lazy = (load, name) => (...args) => load().then((m) => m[name](...args));
const load_detective = () => import('./screens/detective.js');
const detectiveRoute = lazy(load_detective, 'detectiveRoute');
const load_exam = () => import('./screens/exam.js');
const examRoute = lazy(load_exam, 'examRoute');
const load_catalog = () => import('./screens/catalog.js');
const courseScreen = lazy(load_catalog, 'courseScreen');
const examsScreen = lazy(load_catalog, 'examsScreen');
const practiceHubScreen = lazy(load_catalog, 'practiceHubScreen');
const load_map = () => import('./screens/map.js');
const bossRoute = lazy(load_map, 'bossRoute');
const levelRoute = lazy(load_map, 'levelRoute');
const mapScreen = lazy(load_map, 'mapScreen');
const load_modes = () => import('./screens/modes.js');
const blitzRoute = lazy(load_modes, 'blitzRoute');
const dailyRoute = lazy(load_modes, 'dailyRoute');
const duelAcceptRoute = lazy(load_modes, 'duelAcceptRoute');
const duelRoute = lazy(load_modes, 'duelRoute');
const survivalRoute = lazy(load_modes, 'survivalRoute');
const weakRoute = lazy(load_modes, 'weakRoute');
const load_practice = () => import('./screens/practice.js');
const trackRoute = lazy(load_practice, 'trackRoute');
const load_quiz = () => import('./screens/quiz.js');
const quizRoute = lazy(load_quiz, 'quizRoute');
const load_profile = () => import('./screens/profile.js');
const profileScreen = lazy(load_profile, 'profileScreen');
const load_premium = () => import('./screens/premium.js');
const premiumScreen = lazy(load_premium, 'premiumScreen');
const load_satHome = () => import('./screens/sat-home.js');
const satHomeScreen = lazy(load_satHome, 'satHomeScreen');
const load_review = () => import('./screens/review.js');
const mistakesRoute = lazy(load_review, 'mistakesRoute');
const weakCourseRoute = lazy(load_review, 'weakCourseRoute');
const load_plan = () => import('./screens/plan.js');
const planRoute = lazy(load_plan, 'planRoute');
const load_report = () => import('./screens/report.js');
const reportRoute = lazy(load_report, 'reportRoute');
const load_cards = () => import('./screens/cards.js');
const cardsRoute = lazy(load_cards, 'cardsRoute');
const load_achievements = () => import('./screens/achievements.js');
const achievementsRoute = lazy(load_achievements, 'achievementsRoute');
const load_shop = () => import('./screens/shop.js');
const shopRoute = lazy(load_shop, 'shopRoute');
const load_mock = () => import('./screens/mock.js');
const mockRoute = lazy(load_mock, 'mockRoute');
const load_today = () => import('./screens/today.js');
const todayRoute = lazy(load_today, 'todayRoute');
const load_learn = () => import('./screens/learn.js');
const adaptRoute = lazy(load_learn, 'adaptRoute');
const diagRoute = lazy(load_learn, 'diagRoute');
const knowRoute = lazy(load_learn, 'knowRoute');
const load_saved = () => import('./screens/saved.js');
const savedRoute = lazy(load_saved, 'savedRoute');
const load_fullread = () => import('./screens/fullread.js');
const fullReadRoute = lazy(load_fullread, 'fullReadRoute');
const load_explain = () => import('./screens/explain.js');
const explainIndexRoute = lazy(load_explain, 'explainIndexRoute');
const explainRoute = lazy(load_explain, 'explainRoute');
const load_examHome = () => import('./screens/exam-home.js');
const examBlitzRoute = lazy(load_examHome, 'examBlitzRoute');
const examDailyRoute = lazy(load_examHome, 'examDailyRoute');
const examDuelRoute = lazy(load_examHome, 'examDuelRoute');
const examLevelRoute = lazy(load_examHome, 'examLevelRoute');
const examPathRoute = lazy(load_examHome, 'examPathRoute');
const examSurvivalRoute = lazy(load_examHome, 'examSurvivalRoute');
const examTheoryRoute = lazy(load_examHome, 'examTheoryRoute');

const load_rules = () => import('./screens/rules.js');
const rulesRoute = lazy(load_rules, 'rulesRoute');
const load_privacy = () => import('./screens/privacy.js');
const privacyRoute = lazy(load_privacy, 'privacyRoute');
const load_friends = () => import('./screens/friends.js');
const friendsRoute = lazy(load_friends, 'friendsRoute');
const load_sheets = () => import('./screens/sheets.js');
const sheetsRoute = lazy(load_sheets, 'sheetsRoute');
const sheetRoute = lazy(load_sheets, 'sheetRoute');

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
route('/rules', () => rulesRoute(app));
route('/plan', () => planRoute(app));
route('/report', () => reportRoute(app));
route('/cards/:lang', (params) => cardsRoute(app, params));
route('/weak/:course', (params) => weakCourseRoute(app, params));
route('/c/:course', (params) => courseScreen(app, params));
route('/c/:course/:track', (params) => trackRoute(app, params));
// SAT
route('/sat', () => satHomeScreen(app));
route('/x/:exam/path', (params) => examPathRoute(app, params));
route('/x/:exam/lv/:track/:n', (params) => examLevelRoute(app, params));
route('/x/:exam/survival', (params) => examSurvivalRoute(app, params));
route('/x/:exam/blitz', (params) => examBlitzRoute(app, params));
route('/x/:exam/duel', (params) => examDuelRoute(app, params));
route('/x/:exam/daily', (params) => examDailyRoute(app, params));
route('/x/:exam/theory', (params) => examTheoryRoute(app, params));
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
route('/sheets', () => sheetsRoute(app));
route('/privacy', () => privacyRoute(app));
route('/sheet/:course', (params) => sheetRoute(app, params));
route('/sheet/:course/:track', (params) => sheetRoute(app, params));
route('/explain/:id', (params) => explainRoute(app, params));
route('/premium', () => premiumScreen(app));
route('/friends', () => friendsRoute(app));
route('/friends/:code', (params) => friendsRoute(app, params));

on('profile', () => {
  // Ежедневные задания: за каждое выполненное - опыт и уведомление (один раз).
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

// Достижения, полученные одновременно, показываем вместе: до двух - по отдельности, больше - одним уведомлением.
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

// Новая ступень сезона - короткое ненавязчивое уведомление.
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
installFxDefs();
document.addEventListener('routechange', () => stopSpeech());
// Открыли как приложение с экрана «Домой» - для достижения «Всегда под рукой».
if (isStandalone() && !getProfile().counters.app) getProfile().counters.app = 1;
syncAchievements();
startMotion(app);
// Вход по ссылке из письма: сохраняем вход и делаем первую синхронизацию (как при входе по коду).
const linkedIn = takeSessionFromUrl();
startCloud({ skipStartSync: linkedIn });
// Рейтинг друзей: свою строку обновляем после входа и когда меняется опыт или имя.
// Модуль грузится, только если человек вошёл и уже получил код друга.
const syncFriends = () => {
  if (isSignedIn() && storage.get('friendCode', null)) import('./core/friends.js').then((m) => m.schedulePublish()).catch(() => {});
};
onStorageSet((key) => (key === 'profile' || key === 'outfit') && syncFriends());
onCloud(syncFriends);
syncFriends();
startRouter();
if (linkedIn)
  firstSync()
    .then((res) => {
      if (res?.reloaded) return;
      toast(`🌐 ${t('acc.welcome')}`, { kind: 'good' });
      if (res?.conflict) askConflict(res.conflict, refreshRoute);
      else refreshRoute();
    })
    .catch(() => refreshRoute());
renderTopbar();
