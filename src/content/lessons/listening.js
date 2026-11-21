// Короткие диалоги к урокам английского: кнопка «Послушать» в уроке темы.
// Диалог построен на грамматике темы; после него 2 вопроса на понимание.
// Озвучка - голосом браузера (src/ui/listen.js), A и B - разные голоса.

import { L, same } from '../../pools/gen.js';

const line = (s, t) => ({ s, t });

export const LESSON_LISTENING = {
  'e.basics': {
    title: 'Meeting a new classmate',
    lines: [
      line('A', "Hi! I'm Dana. I'm new here."),
      line('B', "Hello, Dana. I'm Tom. Are you from Astana?"),
      line('A', "No, I'm not. I'm from Almaty. My parents are doctors."),
      line('B', 'Cool! My sister is a doctor too. She is twenty-five.'),
      line('A', 'Is this your bag?'),
      line('B', "No, it isn't. My bag is blue. Those books are mine."),
    ],
    questions: [
      { q: same('Where is Dana from?'), options: [same('Astana'), same('Almaty'), same('London')], answer: 1, why: L('"I\'m from Almaty."', '«I\'m from Almaty» - она из Алматы.', '«I\'m from Almaty» - ол Алматыдан.') },
      { q: same("What colour is Tom's bag?"), options: [same('Red'), same('Black'), same('Blue')], answer: 2, why: L('"My bag is blue."', '«My bag is blue» - его сумка синяя.', '«My bag is blue» - оның сөмкесі көк.') },
    ],
  },
  'e.tenses': {
    title: 'What did you do at the weekend?',
    lines: [
      line('A', 'What did you do at the weekend?'),
      line('B', 'I visited my grandma. We baked a cake together.'),
      line('A', 'Nice! I usually play football on Saturdays, but it was raining.'),
      line('B', 'So what are you doing now?'),
      line('A', "I'm studying for the maths test. I have already finished two topics."),
      line('B', 'Good luck! I will help you tomorrow if you want.'),
    ],
    questions: [
      { q: same('Why did A not play football?'), options: [same('He was ill'), same('It was raining'), same('He was at his grandma\'s')], answer: 1, why: L('"...but it was raining."', '«...but it was raining» - шёл дождь.', '«...but it was raining» - жаңбыр жауды.') },
      { q: same('How many topics has A finished?'), options: [same('One'), same('Two'), same('Three')], answer: 1, why: L('"I have already finished two topics." - Present Perfect.', '«I have already finished two topics» - Present Perfect: результат к настоящему.', '«I have already finished two topics» - Present Perfect: қазіргі нәтиже.') },
    ],
  },
  'e.det': {
    title: 'In the kitchen',
    lines: [
      line('A', "Is there any milk in the fridge?"),
      line('B', "There's a little milk, but there aren't any eggs."),
      line('A', 'We need some eggs for the pancakes. How many do we need?'),
      line('B', 'Three. And a lot of flour - the flour in the cupboard is old.'),
      line('A', "OK, I'll go to the shop. It's the nearest one, on the corner."),
    ],
    questions: [
      { q: same('What do they need to buy?'), options: [same('Milk and sugar'), same('Eggs and flour'), same('Only milk')], answer: 1, why: L('There are no eggs and the flour is old.', 'Яиц нет, а мука старая - нужны яйца и мука.', 'Жұмыртқа жоқ, ал ұн ескі - жұмыртқа мен ұн керек.') },
      { q: same('How many eggs do they need?'), options: [same('Two'), same('Three'), same('Four')], answer: 1, why: L('"Three."', '«Three» - три.', '«Three» - үшеу.') },
    ],
  },
  'e.prep': {
    title: 'Where are my keys?',
    lines: [
      line('A', "I can't find my keys. Are they on the table?"),
      line('B', 'No, they are not on the table. Look under your jacket.'),
      line('A', 'Not there. My bus leaves at eight, in ten minutes!'),
      line('B', 'Wait - they are in the door. You left them there on Monday.'),
      line('A', "Thanks! See you at six, after school."),
    ],
    questions: [
      { q: same('Where were the keys?'), options: [same('On the table'), same('Under the jacket'), same('In the door')], answer: 2, why: L('"They are in the door."', '«They are in the door» - в замке двери.', '«They are in the door» - есіктің құлпында.') },
      { q: same('What time does the bus leave?'), options: [same('At six'), same('At eight'), same('At ten')], answer: 1, why: L('"My bus leaves at eight."', '«My bus leaves at eight» - в восемь.', '«My bus leaves at eight» - сағат сегізде.') },
    ],
  },
  'e.modal': {
    title: 'Before the exam',
    lines: [
      line('A', 'Can I use a calculator in the exam?'),
      line('B', "No, you can't. But you must bring two pens."),
      line('A', 'Should I come early?'),
      line('B', "Yes, you should be there at half past eight. You don't have to bring a dictionary."),
      line('A', "Great. I might be a bit late - my bus is often slow."),
      line('B', "Then you'd better take an earlier bus!"),
    ],
    questions: [
      { q: same('What must students bring?'), options: [same('A calculator'), same('Two pens'), same('A dictionary')], answer: 1, why: L('"You must bring two pens." Must = an obligation.', '«You must bring two pens» - must: обязанность.', '«You must bring two pens» - must: міндет.') },
      { q: same('Do they need a dictionary?'), options: [same('Yes, they must bring one'), same("No, they don't have to"), same('Only for English')], answer: 1, why: L("Don't have to = it is not necessary.", 'don\'t have to - «не обязательно», это не запрет.', 'don\'t have to - «міндетті емес», тыйым емес.') },
    ],
  },
  'e.struct': {
    title: 'Plans for the summer',
    lines: [
      line('A', 'If I pass all my exams, my parents will buy me a bike.'),
      line('B', 'Lucky you! If I had more money, I would travel to Japan.'),
      line('A', 'Our house is being painted this summer, so we are staying with my aunt.'),
      line('B', 'I enjoy staying at my aunt\'s too. She lets me cook.'),
      line('A', "I'd like to learn to cook. Maybe she can teach me!"),
    ],
    questions: [
      { q: same('What will A get if he passes the exams?'), options: [same('A trip to Japan'), same('A bike'), same('A new phone')], answer: 1, why: L('First conditional: "If I pass..., they will buy me a bike."', 'Первое условное: «If I pass..., they will buy me a bike» - велосипед.', 'Бірінші шартты: «If I pass..., they will buy me a bike» - велосипед.') },
      { q: same('Why is A staying with his aunt?'), options: [same('His house is being painted'), same('His parents are travelling'), same('He wants to cook')], answer: 0, why: L('Passive: "Our house is being painted."', 'Пассив: «Our house is being painted» - дом красят.', 'Ырықсыз етіс: «Our house is being painted» - үйді бояп жатыр.') },
    ],
  },
  'e.adv': {
    title: 'A job interview',
    lines: [
      line('A', 'Never have I seen such a strong application. Tell me about your last project.'),
      line('B', 'What I enjoyed most was leading a team of five people.'),
      line('A', 'Had you known about the deadline earlier, would you have planned differently?'),
      line('B', 'Not only would I have planned better, but I would also have asked for more help.'),
      line('A', 'It is honesty that we value most here.'),
    ],
    questions: [
      { q: same('What did B enjoy most?'), options: [same('Writing reports'), same('Leading a team'), same('Working alone')], answer: 1, why: L('Cleft sentence: "What I enjoyed most was leading a team."', 'Расщеплённое предложение: «What I enjoyed most was leading a team» - руководить командой.', 'Бөлінген сөйлем: «What I enjoyed most was leading a team» - команданы басқару.') },
      { q: same('What does the company value most?'), options: [same('Speed'), same('Honesty'), same('Experience')], answer: 1, why: L('"It is honesty that we value most."', '«It is honesty that we value most» - честность.', '«It is honesty that we value most» - адалдық.') },
    ],
  },
  'e.vocab': {
    title: 'At the doctor\'s',
    lines: [
      line('A', 'Good morning. What seems to be the problem?'),
      line('B', "I've had a sore throat and a high temperature since Tuesday."),
      line('A', 'Let me have a look. It looks like a throat infection.'),
      line('B', 'Do I need any medicine?'),
      line('A', 'Take these tablets twice a day and drink plenty of warm water. Stay at home for three days.'),
    ],
    questions: [
      { q: same('What is the problem?'), options: [same('A broken arm'), same('A sore throat and a temperature'), same('A headache')], answer: 1, why: L('"a sore throat and a high temperature"', '«a sore throat and a high temperature» - больное горло и температура.', '«a sore throat and a high temperature» - тамақ ауруы және қызу.') },
      { q: same('How often should B take the tablets?'), options: [same('Once a day'), same('Twice a day'), same('Three times a day')], answer: 1, why: L('"Take these tablets twice a day."', '«twice a day» - два раза в день.', '«twice a day» - күніне екі рет.') },
    ],
  },
  'e.phrasal': {
    title: 'A busy morning',
    lines: [
      line('A', 'Did you wake up on time today?'),
      line('B', 'No! I turned off my alarm and fell asleep again.'),
      line('A', 'Oh no. Did you get to school late?'),
      line('B', 'Yes. And I ran out of time, so I gave up on breakfast.'),
      line('A', "Next time, set two alarms. I'll look out for you at the gate tomorrow!"),
    ],
    questions: [
      { q: same('Why was B late?'), options: [same('The bus broke down'), same('B turned off the alarm and fell asleep'), same('B was ill')], answer: 1, why: L('"I turned off my alarm and fell asleep again."', 'turn off - выключить: он выключил будильник и уснул.', 'turn off - өшіру: ол оятқышты өшіріп, қайта ұйықтап қалды.') },
      { q: same('What does "ran out of time" mean?'), options: [same('Had a lot of time'), same('Had no time left'), same('Ran very fast')], answer: 1, why: L('run out of = have no more left.', 'run out of - закончиться, не осталось.', 'run out of - таусылу, қалмау.') },
    ],
  },
  'e.wordform': {
    title: 'A science fair',
    lines: [
      line('A', 'Your project was really impressive. The judges loved it.'),
      line('B', 'Thanks! The preparation took weeks. It was a real achievement for our team.'),
      line('A', 'Was it difficult to explain the results?'),
      line('B', 'A little. Some things were unexpected, but the discussion was very useful.'),
      line('A', "Your explanation was clear. That's the most important thing."),
    ],
    questions: [
      { q: same('How long did the preparation take?'), options: [same('Days'), same('Weeks'), same('Months')], answer: 1, why: L('"The preparation took weeks."', '«The preparation took weeks» - недели. prepare → preparation.', '«The preparation took weeks» - апталар. prepare → preparation.') },
      { q: same('Which word is a noun made from "achieve"?'), options: [same('achievable'), same('achievement'), same('achieving')], answer: 1, why: L('-ment makes nouns: achieve → achievement.', 'Суффикс -ment образует существительные: achieve → achievement.', '-ment жұрнағы зат есім жасайды: achieve → achievement.') },
    ],
  },
  'e.words': {
    title: 'Shopping for a present',
    lines: [
      line('A', "It's Mum's birthday on Friday. What should we buy?"),
      line('B', 'She likes flowers and books. How about a cookbook?'),
      line('A', 'Good idea. How much is that one?'),
      line('B', 'Fifteen pounds. And these roses are seven.'),
      line('A', "Let's get both. That's twenty-two pounds."),
    ],
    questions: [
      { q: same('When is Mum\'s birthday?'), options: [same('On Monday'), same('On Friday'), same('On Sunday')], answer: 1, why: L('"It\'s Mum\'s birthday on Friday."', '«on Friday» - в пятницу.', '«on Friday» - жұмада.') },
      { q: same('How much do they spend?'), options: [same('Fifteen pounds'), same('Seven pounds'), same('Twenty-two pounds')], answer: 2, why: L('15 + 7 = 22.', '15 + 7 = 22 фунта.', '15 + 7 = 22 фунт.') },
    ],
  },
  'e.gram': {
    title: 'A lost phone',
    lines: [
      line('A', 'I was walking home when I realised my phone was missing.'),
      line('B', 'Where had you been before that?'),
      line('A', 'I had been at the library for two hours.'),
      line('B', 'Did you call them?'),
      line('A', "Yes - someone had already handed it in. I'm going to pick it up tomorrow."),
    ],
    questions: [
      { q: same('Where was A before?'), options: [same('At the café'), same('At the library'), same('At school')], answer: 1, why: L('Past Perfect: "I had been at the library."', 'Past Perfect: «I had been at the library» - в библиотеке, раньше другого события.', 'Past Perfect: «I had been at the library» - кітапханада, басқа оқиғадан бұрын.') },
      { q: same('When will A get the phone?'), options: [same('Today'), same('Tomorrow'), same('Next week')], answer: 1, why: L('"I\'m going to pick it up tomorrow."', '«I\'m going to pick it up tomorrow» - завтра.', '«I\'m going to pick it up tomorrow» - ертең.') },
    ],
  },
  'e.irreg': {
    title: 'A school trip',
    lines: [
      line('A', 'How was the school trip?'),
      line('B', 'Great! We went to the mountains and saw a waterfall.'),
      line('A', 'Did you take any photos?'),
      line('B', 'I took fifty! Then I fell asleep on the bus back.'),
      line('A', 'What did you eat?'),
      line('B', 'We ate sandwiches and drank hot tea. I bought a small souvenir too.'),
    ],
    questions: [
      { q: same('Where did they go?'), options: [same('To the sea'), same('To the mountains'), same('To a museum')], answer: 1, why: L('go → went: "We went to the mountains."', 'go → went: «We went to the mountains» - в горы.', 'go → went: «We went to the mountains» - тауға.') },
      { q: same('How many photos did B take?'), options: [same('Fifteen'), same('Fifty'), same('Five')], answer: 1, why: L('take → took: "I took fifty!"', 'take → took: «I took fifty» - пятьдесят.', 'take → took: «I took fifty» - елу.') },
    ],
  },
  'e.comp': {
    title: 'Choosing a phone',
    lines: [
      line('A', 'Which phone is better, the red one or the black one?'),
      line('B', 'The black one is more expensive, but its camera is the best in the shop.'),
      line('A', 'The red one is lighter and smaller.'),
      line('B', "True, and it's cheaper. But the battery is worse."),
      line('A', "Then I'll take the black one. A good camera is more important to me."),
    ],
    questions: [
      { q: same('Which phone is cheaper?'), options: [same('The black one'), same('The red one'), same('They cost the same')], answer: 1, why: L('"...it\'s cheaper" - about the red one.', '«it\'s cheaper» сказано про красный.', '«it\'s cheaper» қызыл туралы айтылды.') },
      { q: same('Which phone does A choose?'), options: [same('The red one'), same('The black one'), same('Neither')], answer: 1, why: L('"I\'ll take the black one" - the camera matters more.', '«I\'ll take the black one» - камера важнее.', '«I\'ll take the black one» - камера маңыздырақ.') },
    ],
  },
  'e.ukus': {
    title: 'London meets New York',
    lines: [
      line('A', "Hi! I'm from London. I live in a flat on the ground floor."),
      line('B', "I'm from New York. I live in an apartment on the first floor - that's the same thing!"),
      line('A', 'Ha! And in autumn I go on holiday to Spain.'),
      line('B', 'In the fall I usually take a vacation too. Do you want some cookies?'),
      line('A', 'We call them biscuits! Thanks, they look lovely.'),
    ],
    questions: [
      { q: same('What does the American call a "flat"?'), options: [same('A house'), same('An apartment'), same('A room')], answer: 1, why: L('British flat = American apartment.', 'Британское flat = американское apartment.', 'Британдық flat = американдық apartment.') },
      { q: same('What do the British call "cookies"?'), options: [same('Sweets'), same('Biscuits'), same('Crisps')], answer: 1, why: L('American cookies = British biscuits.', 'Американское cookies = британское biscuits.', 'Американдық cookies = британдық biscuits.') },
    ],
  },
};
