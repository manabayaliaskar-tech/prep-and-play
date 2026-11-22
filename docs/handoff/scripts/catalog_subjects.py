# Подключает новые предметы к экзаменам СНГ в src/catalog/courses.js.
PATH = '/home/user/School/src/catalog/courses.js'
s = open(PATH, encoding='utf8').read()

def rep(old, new, count=1):
    global s
    if s.count(old) < count:
        raise SystemExit(f'not found ({s.count(old)}/{count}): {old[:90]}')
    s = s.replace(old, new)

HELPERS = '''/** Английский язык как предмет экзамена: грамматика и лексика выбранных уровней. */
const englishTrack = (levels, test) =>
  track('english', 'EN', N.english, L('Grammar and vocabulary', 'Грамматика и лексика', 'Грамматика және лексика'), englishSpec(levels), test);

// ---------- Предметы экзаменов: одни и те же наборы тем для разных стран ----------
// Ключ 0 у банков знаний — задания любой сложности.

const ALL = [1, 2, 3];
const SUBJECT = {
  physics: () =>
    track('physics', '⚛️', N.physics, L('Mechanics, electricity, heat, optics', 'Механика, электричество, тепло, оптика', 'Механика, электр, жылу, оптика'),
      [['p.kin', ALL], ['p.dyn', ALL], ['p.energy', ALL], ['p.elec', ALL], ['p.heat', ALL], ['p.wave', ALL], ['p.theory', [0]]], { count: 15, minutes: 30 }),
  chemistry: () =>
    track('chemistry', '⚗️', N.chemistry, L('Calculations, substances and reactions', 'Расчёты, вещества и реакции', 'Есептеулер, заттар мен реакциялар'),
      [['c.molar', ALL], ['c.mole', ALL], ['c.theory', [0]]], { count: 15, minutes: 30 }),
  biology: () =>
    track('biology', '🧬', N.biology, L('Cell, human body, genetics, ecology', 'Клетка, человек, генетика, экология', 'Жасуша, адам, генетика, экология'),
      [['b.bank', ALL]], { count: 12, minutes: 15 }),
  geography: () =>
    track('geography', '🌍', N.geography, L('Maps, climate, nature, population', 'Карты, климат, природа, население', 'Карталар, климат, табиғат, халық'),
      [['g.bank', ALL]], { count: 12, minutes: 15 }),
  informatics: () =>
    track('informatics', '💻', N.informatics, L('Number systems, logic, algorithms', 'Системы счисления, логика, алгоритмы', 'Санау жүйелері, логика, алгоритмдер'),
      [['i.num', ALL], ['i.units', ALL], ['i.logic', ALL], ['i.algo', ALL], ['i.theory', [0]]], { count: 15, minutes: 30 }),
  russian: () =>
    track('russian', 'Аа', N.russian, L('Spelling, punctuation, language norms', 'Орфография, пунктуация, нормы языка', 'Орфография, пунктуация, тіл нормалары'),
      [['l.ru', ALL]], { count: 15, minutes: 20 }),
  social: () =>
    track('social', '⚖️', N.social, L('State, law, economics, society', 'Государство, право, экономика, общество', 'Мемлекет, құқық, экономика, қоғам'),
      [['s.bank', ALL]], { count: 10, minutes: 12 }),
  /** История страны: свой банк вместе со всемирной историей. */
  history: (topic, name) =>
    track('history', '📜', name, L('Key events and people', 'Главные события и личности', 'Басты оқиғалар мен тұлғалар'),
      [[topic, [0]], ['h.world', [0]]], { count: 12, minutes: 15 }),
};'''

rep('''/** Английский язык как предмет экзамена: грамматика и лексика выбранных уровней. */
const englishTrack = (levels, test) =>
  track('english', 'EN', N.english, L('Grammar and vocabulary', 'Грамматика и лексика', 'Грамматика және лексика'), englishSpec(levels), test);''', HELPERS)

# ----- ЕНТ: все предметы, кроме оставшихся на потом, готовы -----
rep('''      englishTrack([3, 4], { count: 20, minutes: 20 }),
    ],
    soon: [
      L('History of Kazakhstan', 'История Казахстана', 'Қазақстан тарихы'),
      L('Reading literacy', 'Грамотность чтения', 'Оқу сауаттылығы'),
      N.physics, N.chemistry, N.biology, N.geography, N.informatics,
    ],''', '''      track('history', '📜', L('History of Kazakhstan', 'История Казахстана', 'Қазақстан тарихы'), L('From the Saka to independence', 'От саков до независимости', 'Сақтардан тәуелсіздікке дейін'), [['h.kz', ALL]], { count: 15, minutes: 20 }),
      track('reading', '📖', L('Reading literacy', 'Грамотность чтения', 'Оқу сауаттылығы'), L('Texts and questions about them', 'Тексты и вопросы к ним', 'Мәтіндер және оларға сұрақтар'), [['r.literacy', [1]]], { count: 12, minutes: 20 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
      SUBJECT.geography(),
      SUBJECT.informatics(),
      SUBJECT.history('h.world', L('World history', 'Всемирная история', 'Дүниежүзі тарихы')),
    ],''')

# ----- ЕГЭ -----
rep('''    soon: [N.russian, N.social, N.physics, N.informatics, N.history, N.biology, N.chemistry],''', '')
rep('''      track('profile', '📐', L('Mathematics (profile level, part 1)', 'Математика (профильный уровень, часть 1)', 'Математика (бейіндік деңгей, 1-бөлім)'), D.mathSenior, MATH_SENIOR, { count: 12, minutes: 45 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),''', '''      track('profile', '📐', L('Mathematics (profile level, part 1)', 'Математика (профильный уровень, часть 1)', 'Математика (бейіндік деңгей, 1-бөлім)'), D.mathSenior, MATH_SENIOR, { count: 12, minutes: 45 }),
      SUBJECT.russian(),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.social(),
      SUBJECT.history('h.ru', L('History of Russia', 'История России', 'Ресей тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
      SUBJECT.geography(),
      SUBJECT.informatics(),''')

# ----- ОГЭ -----
rep('''    tracks: [track('math', '📐', N.math, D.mathAll, MATH_BASIC, { count: 12, minutes: 30 }), englishTrack([2, 3], { count: 15, minutes: 15 })],
    soon: [N.russian, N.social, N.informatics, N.geography, N.physics],''', '''    tracks: [
      track('math', '📐', N.math, D.mathAll, MATH_BASIC, { count: 12, minutes: 30 }),
      SUBJECT.russian(),
      englishTrack([2, 3], { count: 15, minutes: 15 }),
      SUBJECT.social(),
      SUBJECT.informatics(),
      SUBJECT.geography(),
      SUBJECT.physics(),
      SUBJECT.biology(),
      SUBJECT.chemistry(),
    ],''')

# ----- Экзамены, где остаётся только родной язык -----
SENIOR = "track('math', '📐', N.math, D.mathSenior, MATH_SENIOR, { count: 12, minutes: 35 }), englishTrack([3, 4], { count: 20, minutes: 20 })"
def standard(history_topic, history_name, extra=''):
    return f'''    tracks: [
      {SENIOR.replace('), englishTrack', '),\n      englishTrack')},{extra}
      SUBJECT.history('{history_topic}', {history_name}),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],'''

rep(f'''    tracks: [{SENIOR}],
    soon: [N.russian, L('Belarusian language', 'Белорусский язык', 'Беларусь тілі'), N.physics, N.chemistry, N.biology, N.history],''',
    standard('h.by', "L('History of Belarus', 'История Беларуси', 'Беларусь тарихы')", '\n      SUBJECT.russian(),') + '''
    soon: [L('Belarusian language', 'Белорусский язык', 'Беларусь тілі')],''')

rep('''    soon: [N.native, L('History of Uzbekistan', 'История Узбекистана', 'Өзбекстан тарихы'), N.physics, N.chemistry, N.biology],''',
    '''    soon: [L('Uzbek language and literature', 'Узбекский язык и литература', 'Өзбек тілі мен әдебиеті')],''')
rep('''      track('math', '📐', N.mathProfile, D.mathSenior, MATH_SENIOR, { count: 15, minutes: 35 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
    ],''', '''      track('math', '📐', N.mathProfile, D.mathSenior, MATH_SENIOR, { count: 15, minutes: 35 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.uz', L('History of Uzbekistan', 'История Узбекистана', 'Өзбекстан тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],''')

# ОРТ: основной тест полностью, предметные тесты
rep('''['m.pow', [1, 2]]], { count: 15, minutes: 30 }), englishTrack([3, 4], { count: 20, minutes: 20 })],
    soon: [
      L('Analogies and sentence completion', 'Аналогии и дополнение предложений', 'Аналогиялар мен сөйлемдерді толықтыру'),
      L('Reading comprehension', 'Чтение и понимание', 'Оқу және түсіну'),
      L('Practical grammar', 'Практическая грамматика', 'Практикалық грамматика'),
    ],''', '''['m.pow', [1, 2]]], { count: 15, minutes: 30 }),
      track('analogies', '🔗', L('Analogies and sentence completion', 'Аналогии и дополнение предложений', 'Аналогиялар мен сөйлемдерді толықтыру'), L('Relations between words, meaning in context', 'Связи между словами, смысл в контексте', 'Сөздер арасындағы байланыс, контекстегі мағына'), [['l.analogy', [0]], ['l.complete', [0]]], { count: 15, minutes: 15 }),
      track('reading', '📖', L('Reading comprehension', 'Чтение и понимание', 'Оқу және түсіну'), L('Texts and questions about them', 'Тексты и вопросы к ним', 'Мәтіндер және оларға сұрақтар'), [['r.literacy', [1]]], { count: 12, minutes: 20 }),
      track('grammar', 'Аа', L('Practical grammar (Russian)', 'Практическая грамматика (русский язык)', 'Практикалық грамматика (орыс тілі)'), L('Spelling, punctuation, language norms', 'Орфография, пунктуация, нормы языка', 'Орфография, пунктуация, тіл нормалары'), [['l.ru', ALL]], { count: 15, minutes: 20 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.kg', L('History of Kyrgyzstan', 'История Кыргызстана', 'Қырғызстан тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],''')
rep('''    tracks: [track('math', '📐', L('Mathematics (main test)',''', '''    tracks: [
      track('math', '📐', L('Mathematics (main test)',''')

# Таджикистан
rep('''[...MATH_BASIC, ['m.log', [1, 2]], ['m.trig', [1, 2]]], { count: 12, minutes: 30 }), englishTrack([3, 4], { count: 20, minutes: 20 })],
    soon: [L('Tajik language', 'Таджикский язык', 'Тәжік тілі'), N.history, N.physics, N.chemistry, N.biology],''', '''[...MATH_BASIC, ['m.log', [1, 2]], ['m.trig', [1, 2]]], { count: 12, minutes: 30 }),
      englishTrack([3, 4], { count: 20, minutes: 20 }),
      SUBJECT.history('h.tj', L('History of Tajikistan', 'История Таджикистана', 'Тәжікстан тарихы')),
      SUBJECT.physics(),
      SUBJECT.chemistry(),
      SUBJECT.biology(),
    ],
    soon: [L('Tajik language', 'Таджикский язык', 'Тәжік тілі')],''')
rep('''    tracks: [track('math', '📐', N.math, D.mathAll, [...MATH_BASIC, ['m.log''', '''    tracks: [
      track('math', '📐', N.math, D.mathAll, [...MATH_BASIC, ['m.log''')

for code, topic, name, lang_name in [
    ('az', 'h.az', "L('History of Azerbaijan', 'История Азербайджана', 'Әзербайжан тарихы')", "L('Azerbaijani language', 'Азербайджанский язык', 'Әзербайжан тілі')"),
    ('am', 'h.am', "L('History of Armenia', 'История Армении', 'Армения тарихы')", "L('Armenian language', 'Армянский язык', 'Армян тілі')"),
    ('md', 'h.md', "L('History of Moldova', 'История Молдовы', 'Молдова тарихы')", "L('Romanian language', 'Румынский язык', 'Румын тілі')"),
]:
    rep(f'''    tracks: [{SENIOR}],
    soon: [{lang_name}, N.history, N.physics, N.chemistry, N.biology],''', standard(topic, name) + f'''
    soon: [{lang_name}],''')

open(PATH, 'w', encoding='utf8').write(s)
print('catalog updated')
