// Банк заданий по английскому языку, уровни A1-C2 (1…6).
// Запись: [уровень, предложение с пропуском, правильный вариант, [три неправильных], разбор].
// Разбор - ключ правила из rules.js либо перевод слова [по-русски, по-казахски].
// Все предложения авторские.

import { MORE_A } from './bank-more3-a.js';
import { MORE_B } from './bank-more3-b.js';
import { MORE_C } from './bank-more3-c.js';
import { MORE_D } from './bank-more3-d.js';
import { MORE_E } from './bank-more3-e.js';
import { MORE_F } from './bank-more3-f.js';
import { MORE_G } from './bank-more3-g.js';
import { MORE4_A } from './bank-more4-a.js';
import { MORE4_B } from './bank-more4-b.js';
import { MORE4_C } from './bank-more4-c.js';
import { MORE4_D } from './bank-more4-d.js';
import { MORE4_E } from './bank-more4-e.js';
import { MORE4_F } from './bank-more4-f.js';
import { MORE4_G } from './bank-more4-g.js';
import { MORE4_H } from './bank-more4-h.js';
import { MORE4_I } from './bank-more4-i.js';
import { MORE4_J } from './bank-more4-j.js';
import { MORE4_GEN } from './gen-more4.js';
import { MORE4_GEN2 } from './gen-more4b.js';
import { MORE4_GEN3 } from './gen-more4c.js';

const A1 = 1;
const A2 = 2;
const B1 = 3;
const B2 = 4;
const C1 = 5;
const C2 = 6;

export const BANK = {
  // ---------- Основы: to be, местоимения, существительные, вопросы ----------
  'e.basics': [
    [A1, 'She ______ a doctor.', 'is', ['are', 'am', 'be'], 'be'],
    [A1, 'We ______ from Kazakhstan.', 'are', ['is', 'am', 'be'], 'be'],
    [A1, 'I ______ twelve years old.', 'am', ['is', 'are', 'have'], 'be'],
    [A1, '______ they your friends?', 'Are', ['Is', 'Am', 'Do'], 'be'],
    [A1, 'It ______ cold today.', 'is', ['are', 'am', 'have'], 'be'],
    [A1, 'My parents ______ at home now.', 'are', ['is', 'am', 'be'], 'be'],
    [A1, 'This is my friend. ______ name is Aidar.', 'His', ['He', 'Him', "He's"], 'poss'],
    [A1, 'Those are my cats. ______ are very funny.', 'They', ['Their', 'Them', 'It'], 'subjpron'],
    [A1, 'There ______ two windows in my room.', 'are', ['is', 'be', 'have'], 'thereis'],
    [A1, 'There are three ______ in the room.', 'children', ['childs', 'child', 'childrens'], 'pluralirr'],
    [A1, 'I brush my ______ twice a day.', 'teeth', ['tooths', 'tooth', 'teeths'], 'pluralirr'],
    [A1, 'Two ______ are standing near the shop.', 'women', ['womans', 'woman', 'womens'], 'pluralirr'],
    [A1, 'How ______ is this T-shirt?', 'much', ['many', 'long', 'old'], 'muchmany'],
    [A1, 'How ______ sisters do you have?', 'many', ['much', 'old', 'long'], 'muchmany'],
    [A1, '______ is your name?', 'What', ['Who', 'Where', 'How'], 'wh'],
    [A1, '______ do you live?', 'Where', ['What', 'Who', 'Whose'], 'wh'],
    [A2, 'Whose bag is this? - It is ______.', 'mine', ['my', 'me', 'I'], 'poss'],
    [A2, 'I am not hungry, and my sister is not hungry ______.', 'either', ['too', 'also', 'neither'], ['тоже (в отрицании)', 'да (болымсыз сөйлемде)']],
    [A2, 'There ______ any milk in the fridge.', "isn't", ["aren't", "don't", 'not'], 'thereis'],
    [A2, '______ book is this? - It is Dana\'s.', 'Whose', ['Who', 'Which one', 'Whom'], 'wh'],
  ],

  // ---------- Времена ----------
  'e.tenses': [
    [A1, 'My brother ______ football every Sunday.', 'plays', ['play', 'playing', 'is play'], 'ps3'],
    [A1, 'She ______ like coffee.', "doesn't", ["don't", "isn't", 'not'], 'psdo'],
    [A1, '______ you speak English?', 'Do', ['Does', 'Are', 'Is'], 'psdo'],
    [A1, 'He ______ to school by bus.', 'goes', ['go', 'going', 'gos'], 'ps3'],
    [A1, 'They ______ TV in the evening.', 'watch', ['watches', 'watching', 'is watch'], 'psbase'],
    [A1, 'What time ______ the lesson start?', 'does', ['do', 'is', 'are'], 'psdo'],
    [A1, 'Look! The baby ______.', 'is sleeping', ['sleeps', 'sleep', 'sleeping'], 'prescont'],
    [A2, 'We ______ to the cinema yesterday.', 'went', ['go', 'gone', 'goed'], 'pastirr'],
    [A2, 'She ______ her homework last night.', 'did', ['does', 'done', 'do'], 'pastirr'],
    [A2, 'I ______ him two days ago.', 'saw', ['see', 'seen', 'have seen'], 'pastirr'],
    [A2, '______ you watch the match last night?', 'Did', ['Do', 'Were', 'Have'], 'did'],
    [A2, "I didn't ______ the film.", 'like', ['liked', 'likes', 'liking'], 'did'],
    [A2, 'He ______ breakfast when I called.', 'was having', ['has', 'is having', 'have'], 'pastcont'],
    [A2, 'Listen! Someone ______ the piano.', 'is playing', ['plays', 'played', 'play'], 'prescont'],
    [A2, 'I think it ______ tomorrow.', 'will rain', ['rains', 'rained', 'is rain'], 'will'],
    [A2, 'We ______ visit our grandparents next weekend. We have already bought the tickets.', 'are going to', ['will to', 'go to', 'going'], 'goingto'],
    [A2, 'She ______ never been to London.', 'has', ['have', 'is', 'did'], 'ppexp'],
    [B1, 'I ______ here since 2020.', 'have lived', ['live', 'lived', 'am living'], 'ppsince'],
    [B1, 'She ______ her keys yesterday.', 'lost', ['has lost', 'loses', 'had lose'], 'pastirr'],
    [B1, "I haven't finished my project ______.", 'yet', ['already', 'still', 'ever'], 'yet'],
    [B1, 'We ______ each other for ten years, and we are still friends.', 'have known', ['know', 'are knowing', 'knew'], 'ppsince'],
    [B1, 'When I arrived at the station, the train ______.', 'had already left', ['has already left', 'already leaves', 'is leaving'], 'pastperf'],
    [B1, "I ______ play the violin when I was a child, but I don't any more.", 'used to', ['use to', 'was used to', 'would to'], 'usedto'],
    [B1, 'While I ______ dinner, the phone rang.', 'was cooking', ['cooked', 'am cooking', 'have cooked'], 'pastcont'],
    [B1, 'This time tomorrow we ______ on the beach.', 'will be lying', ['lie', 'lay', 'have lain'], 'futcont'],
    [B1, 'How long ______ you been waiting?', 'have', ['are', 'did', 'do'], 'ppcont'],
    [B1, "It's the first time I ______ sushi.", 'have eaten', ['eat', 'am eating', 'ate'], 'firsttime'],
    [B2, 'By the time we arrive, the film ______.', 'will have started', ['will start', 'starts', 'has started'], 'futperf'],
    [B2, 'I ______ for three hours when she finally called.', 'had been waiting', ['have been waiting', 'was waited', 'am waiting'], 'pastperfcont'],
    [B2, 'By next June, she ______ here for ten years.', 'will have been working', ['works', 'is working', 'has worked'], 'futperf'],
    [B2, "It's high time we ______ home.", 'went', ['go', 'will go', 'have gone'], 'hightime'],
    [B2, 'She said she ______ call me the next day.', 'would', ['will', 'shall', 'can'], 'reported'],
    [C1, 'This time next year I ______ my degree.', 'will have completed', ['complete', 'am completing', 'would complete'], 'futperf'],
    [C1, 'He is said ______ a fortune in the 1990s.', 'to have made', ['to make', 'having made', 'that he made'], 'passinf'],
    [C1, 'The report is due ______ next week.', 'to be published', ['publishing', 'to publish', 'be published'], 'nopoint'],
  ],

  // ---------- Артикли, количество, сравнение ----------
  'e.det': [
    [A1, 'I have ______ apple.', 'an', ['a', 'any', 'much'], 'aan'],
    [A1, 'She is ______ teacher.', 'a', ['an', 'any', 'some'], 'aan'],
    [A1, 'There are ______ books on the table.', 'some', ['a', 'an', 'much'], 'someany'],
    [A1, "I don't have ______ brothers.", 'any', ['some', 'a', 'an'], 'someany'],
    [A2, 'My bag is ______ than yours.', 'heavier', ['heavy', 'more heavy', 'heaviest'], 'comp'],
    [A2, 'This is the ______ book I have ever read.', 'best', ['better', 'good', 'most good'], 'superl'],
    [A2, 'Maths is ______ than history for me.', 'more difficult', ['difficulter', 'most difficult', 'difficult'], 'comp'],
    [A2, 'He runs ______ than his brother.', 'faster', ['fast', 'more fast', 'fastest'], 'comp'],
    [A2, "It's the ______ building in the city.", 'tallest', ['taller', 'most tall', 'tall'], 'superl'],
    [A2, "There isn't ______ milk in the fridge.", 'much', ['many', 'a few', 'few'], 'quant'],
    [A2, 'We have ______ friends in this town, so we are never bored.', 'a lot of', ['much', 'a little', 'any'], 'quant'],
    [A2, 'Only ______ students passed the test: three out of thirty.', 'a few', ['a little', 'much', 'any'], 'quant'],
    [A2, 'Would you like ______ tea?', 'some', ['any', 'a', 'many'], 'someany'],
    [B1, 'The more you practise, ______ you become.', 'the better', ['better', 'the best', 'more better'], 'comp'],
    [B1, 'She speaks English ______ fluently than her brother.', 'more', ['most', 'much', 'very'], 'comp'],
    [B1, 'There is ______ time left, so we have to hurry.', 'little', ['few', 'a few', 'many'], 'quant'],
    [B2, 'She plays ______ violin beautifully.', 'the', ['a', 'an', 'one'], 'theinstr'],
    [B2, 'Each of the students ______ a laptop.', 'has', ['have', 'are having', 'having'], ['each of + множественное число требует глагола в единственном числе', 'each of + көпше түрден кейін етістік жекеше түрде тұрады']],
    [B2, 'This is by ______ the best restaurant in town.', 'far', ['much', 'very', 'more'], ['by far - «безусловно, намного» перед превосходной степенью', 'by far - күшейтпелі шырайдың алдында «әлдеқайда, сөзсіз»']],
  ],

  // ---------- Предлоги ----------
  'e.prep': [
    [A1, "The lesson starts ______ nine o'clock.", 'at', ['in', 'on', 'to'], 'timeprep'],
    [A1, 'My birthday is ______ May.', 'in', ['at', 'on', 'to'], 'timeprep'],
    [A1, "We don't go to school ______ Sunday.", 'on', ['in', 'at', 'by'], 'timeprep'],
    [A1, 'I live ______ Almaty.', 'in', ['at', 'on', 'to'], 'placeprep'],
    [A1, 'She goes to work ______ bus.', 'by', ['on', 'with', 'in'], 'bytransport'],
    [A2, "I'm interested ______ music.", 'in', ['on', 'at', 'about'], 'fixedprep'],
    [A2, 'She is good ______ drawing.', 'at', ['in', 'on', 'with'], 'fixedprep'],
    [A2, 'We arrived ______ the airport at six.', 'at', ['to', 'into', 'on'], 'placeprep'],
    [A2, 'He was born ______ 2010.', 'in', ['at', 'on', 'by'], 'timeprep'],
    [A2, 'The picture is ______ the wall.', 'on', ['in', 'at', 'to'], 'placeprep'],
    [B1, 'It depends ______ the weather.', 'on', ['of', 'from', 'at'], 'fixedprep'],
    [B1, 'She is afraid ______ spiders.', 'of', ['from', 'at', 'with'], 'fixedprep'],
    [B1, 'I have been waiting ______ two hours.', 'for', ['since', 'during', 'from'], 'ppsince'],
    [B1, 'He is married ______ a doctor.', 'to', ['with', 'on', 'at'], 'fixedprep'],
    [B2, 'He was accused ______ stealing the money.', 'of', ['for', 'in', 'with'], 'fixedprep'],
    [B2, "The success of the project depends ______ everyone's effort.", 'on', ['of', 'from', 'at'], 'fixedprep'],
    [B2, "I'm not used ______ getting up so early.", 'to', ['at', 'for', 'with'], 'toing'],
    [B2, 'He apologised ______ being late.', 'for', ['about', 'of', 'to'], 'fixedprep'],
    [B2, 'Despite ______ tired, he finished the race.', 'being', ['he was', 'of being', 'to be'], 'despite'],
  ],

  // ---------- Модальные глаголы ----------
  'e.modal': [
    [A1, 'I ______ swim very well.', 'can', ['am', 'do', 'cans'], 'can'],
    [A1, 'She can ______ three languages.', 'speak', ['speaks', 'to speak', 'speaking'], 'can'],
    [A2, 'You ______ wear a helmet when you ride a motorbike. It is the law.', 'must', ['can', 'may', 'would'], 'must'],
    [A2, "______ I open the window? It's hot in here.", 'Can', ['Must', 'Am', 'Do'], 'canperm'],
    [A2, "You ______ eat so much sugar. It's bad for you.", "shouldn't", ["mustn't to", "don't", "aren't"], 'should'],
    [A2, 'She ______ read when she was four.', 'could', ['can', 'must', 'should'], 'couldpast'],
    [B1, "You ______ to pay. It's free.", "don't have", ["mustn't", "shouldn't", "can't"], 'donthave'],
    [B1, 'It ______ be Timur at the door. He is in Astana today.', "can't", ["mustn't", "shouldn't", "needn't"], 'deduction'],
    [B1, "She isn't answering the phone. She ______ be asleep.", 'might', ['can', 'should to', 'has'], 'deduction'],
    [B1, 'You ______ smoke here. It is strictly forbidden.', "mustn't", ["don't have to", "needn't", "couldn't"], 'donthave'],
    [B2, "You ______ have told me earlier! Now it's too late.", 'should', ['must', 'can', 'would to'], 'modalperf'],
    [B2, 'She ______ have forgotten about the meeting; she never forgets anything.', "can't", ["mustn't", "shouldn't", "needn't"], 'modalperf'],
    [B2, "They ______ have left already; their car isn't here.", 'must', ['should', 'can', 'would'], 'modalperf'],
    [B2, 'You ______ have brought flowers, but thank you - it is very kind.', "needn't", ["mustn't", "couldn't", "can't"], 'modalperf'],
  ],

  // ---------- Конструкции: условные, пассив, формы глагола, косвенная речь ----------
  'e.struct': [
    [A2, 'I enjoy ______ books.', 'reading', ['read', 'to read', 'reads'], 'gerund'],
    [A2, 'She wants ______ a doctor.', 'to be', ['be', 'being', 'is'], 'infin'],
    [B1, 'If it rains tomorrow, we ______ at home.', 'will stay', ['would stay', 'stayed', 'staying'], 'cond1'],
    [B1, 'If I ______ you, I would apologise.', 'were', ['am', 'will be', 'would be'], 'cond2'],
    [B1, 'If she had more time, she ______ a new language.', 'would learn', ['will learn', 'learns', 'learned'], 'cond2'],
    [B1, "We'll miss the bus unless we ______.", 'hurry', ['will hurry', "don't hurry", 'hurried'], 'cond1'],
    [B1, 'I wish I ______ speak French.', 'could', ['can', 'will', 'would to'], 'wish'],
    [B1, 'This bridge ______ in 1890.', 'was built', ['built', 'is built', 'was building'], 'passive'],
    [B1, 'English ______ all over the world.', 'is spoken', ['speaks', 'is speaking', 'spoke'], 'passive'],
    [B1, 'The letters ______ tomorrow morning.', 'will be sent', ['will send', 'are sending', 'sent'], 'passive'],
    [B1, 'My bike ______ last week.', 'was stolen', ['stole', 'has stolen', 'is stealing'], 'passive'],
    [B1, 'He promised ______ me.', 'to help', ['helping', 'help', 'helped'], 'infin'],
    [B1, "I'm looking forward to ______ you.", 'seeing', ['see', 'saw', 'be seeing'], 'toing'],
    [B1, 'She asked me where ______.', 'I lived', ['did I live', 'do I live', 'lived I'], 'indirectq'],
    [B1, "My parents don't let me ______ out late.", 'stay', ['to stay', 'staying', 'stayed'], 'letmake'],
    [B1, 'He told me that he ______ the film the week before.', 'had seen', ['has seen', 'sees', 'will see'], 'reported'],
    [B2, 'If I had studied harder, I ______ the exam.', 'would have passed', ['would pass', 'will pass', 'had passed'], 'cond3'],
    [B2, 'If only I ______ him the truth yesterday!', 'had told', ['told', 'would tell', 'have told'], 'wish'],
    [B2, 'Had I known about the meeting, I ______.', 'would have come', ['will come', 'came', 'would come'], 'condinv'],
    [B2, "I wouldn't be so tired now if I ______ to bed earlier last night.", 'had gone', ['went', 'would go', 'have gone'], 'condmixed'],
    [B2, '______ you need any help, just call me.', 'Should', ['Would', 'Could', 'Will'], 'condinv'],
    [B2, 'The suspect is believed ______ the country last night.', 'to have left', ['to leaving', 'leaving', 'that left'], 'passinf'],
    [B2, "I'm having my car ______ tomorrow.", 'repaired', ['repair', 'repairing', 'to repair'], 'causative'],
    [B2, 'The new stadium ______ at the moment.', 'is being built', ['is building', 'builds', 'has built'], 'passcont'],
    [B2, 'She hates ______ what to do.', 'being told', ['telling', 'to tell', 'been told'], 'passgerund'],
    [B2, 'He denied ______ the window.', 'breaking', ['to break', 'break', 'broke'], 'gerund'],
    [B2, 'Remember ______ the door when you leave.', 'to lock', ['locking', 'lock', 'locked'], 'remember'],
    [B2, 'She suggested ______ a taxi.', 'taking', ['to take', 'take us', 'took'], 'gerund'],
    [B2, 'The teacher made us ______ the essay again.', 'write', ['to write', 'writing', 'wrote'], 'letmake'],
    [B2, 'He asked me ______ I had ever been abroad.', 'whether', ['that', 'what', 'did'], 'whether'],
    [C1, "I'd sooner ______ at home than go to that party.", 'stay', ['to stay', 'staying', 'stayed'], 'rather'],
    [C1, "There's no point ______ about it now.", 'in worrying', ['to worry', 'of worrying', 'worry'], 'nopoint'],
    [C1, 'She is bound ______ the competition; nobody trains harder.', 'to win', ['winning', 'win', 'of winning'], 'nopoint'],
    [C1, "She'd rather you ______ anyone about it.", "didn't tell", ["don't tell", 'not tell', "won't tell"], 'rather'],
  ],

  // ---------- Продвинутые конструкции: инверсия, сослагательное наклонение ----------
  'e.adv': [
    [B2, 'Hardly had he sat down ______ the phone rang.', 'when', ['than', 'that', 'then'], 'hardly'],
    [B2, 'Not only ______ the exam, but she also got the highest mark.', 'did she pass', ['she passed', 'she did pass', 'passed she'], 'inversion'],
    [C1, 'Not only ______ late, but he also forgot the documents.', 'did he arrive', ['he arrived', 'he did arrive', 'arrived he'], 'inversion'],
    [C1, 'Never ______ such a beautiful sunset.', 'have I seen', ['I have seen', 'I saw', 'did I saw'], 'inversion'],
    [C1, 'Little ______ that the decision would change her life.', 'did she know', ['she knew', 'she did know', 'knew she'], 'inversion'],
    [C1, 'It was not until midnight ______ the rescue team arrived.', 'that', ['then', 'than', 'so'], 'cleft'],
    [C1, 'The committee recommended that the proposal ______ rejected.', 'be', ['is being', 'was', 'will be'], 'subjunctive'],
    [C1, '______ as it may seem, the experiment was a success.', 'Strange', ['Strangely', 'As strangely', 'Despite strange'], 'concession'],
    [C1, 'No sooner had we left ______ it started to rain.', 'than', ['when', 'that', 'then'], 'hardly'],
    [C1, 'Were the government ______ taxes, there would be protests.', 'to raise', ['raise', 'raising', 'raised'], 'condinv'],
    [C1, '______ the weather been better, we would have gone hiking.', 'Had', ['Would', 'If', 'Should'], 'condinv'],
    [C1, "What I need ______ a good night's sleep.", 'is', ['are', 'it is', 'that is'], 'cleft'],
    [C1, 'So ______ was the storm that all flights were cancelled.', 'severe', ['severely', 'severity', 'much severe'], 'sosuch'],
    [C2, 'Scarcely ______ the stage when the lights went out.', 'had she left', ['she had left', 'did she leave', 'she left'], 'hardly'],
    [C2, '______ what may, we will stand by our decision.', 'Come', ['Came', 'Coming', 'Comes'], 'fixedform'],
    [C2, 'Far ______ it from me to criticise, but the plan seems risky.', 'be', ['is', 'was', 'being'], 'fixedform'],
    [C2, 'Try ______ he might, he could not open the door.', 'as', ['however', 'although', 'despite'], 'concession'],
    [C2, 'Such ______ the force of the explosion that windows shattered miles away.', 'was', ['did', 'had', 'were'], 'sosuch'],
    [C2, "I'd just as soon you ______ mention this to anyone.", "didn't", ["don't", "won't", 'not to'], 'rather'],
    [C2, 'But for his timely intervention, the deal ______ through.', 'would have fallen', ['would fall', 'had fallen', 'fell'], 'butfor'],
    [C2, 'Suffice it ______ that the meeting did not go well.', 'to say', ['say', 'saying', 'said'], 'fixedform'],
    [C2, 'The clerk is alleged ______ documents over several years.', 'to have been forging', ['to forging', 'forging', 'been forging'], 'passinf'],
    [C2, 'Not for a moment ______ his honesty.', 'did I doubt', ['I doubted', 'I did doubt', 'doubted I'], 'inversion'],
    [C2, 'Be that ______ it may, we still have to finish on time.', 'as', ['so', 'what', 'how'], 'fixedform'],
    [C2, 'He talks as though he ______ everything, which is far from true.', 'knew', ['will know', 'has known', 'would know'], 'asthough'],
  ],

  // ---------- Лексика ----------
  'e.vocab': [
    [A1, 'A person who teaches at school is a ______.', 'teacher', ['doctor', 'driver', 'farmer'], ['учитель', 'мұғалім']],
    [A1, 'The opposite of "big" is ______.', 'small', ['tall', 'long', 'old'], ['маленький', 'кішкентай']],
    [A1, 'We eat breakfast in the ______.', 'morning', ['evening', 'night', 'afternoon'], ['утро', 'таң']],
    [A1, 'Seven days make one ______.', 'week', ['month', 'year', 'hour'], ['неделя', 'апта']],
    [A1, "My mother's sister is my ______.", 'aunt', ['uncle', 'cousin', 'grandmother'], ['тётя', 'тәте (анамның әпкесі немесе сіңлісі)']],
    [A1, "I'm thirsty. Can I have some ______?", 'water', ['bread', 'rice', 'cheese'], ['вода', 'су']],
    [A1, 'We use our ______ to see.', 'eyes', ['ears', 'hands', 'legs'], ['глаза', 'көз']],
    [A1, 'In winter it is ______, so I wear a warm coat.', 'cold', ['hot', 'sunny', 'short'], ['холодно', 'суық']],
    [A2, "I need to buy some bread. Let's go to the ______.", 'bakery', ['library', 'pharmacy', 'station'], ['пекарня, булочная', 'наубайхана']],
    [A2, "It's raining. Take an ______.", 'umbrella', ['envelope', 'apron', 'engine'], ['зонт', 'қолшатыр']],
    [A2, 'My room is very ______. I clean it every day.', 'tidy', ['messy', 'dirty', 'noisy'], ['опрятный, прибранный', 'жинақы, таза']],
    [A2, 'He was ______ because he lost his phone.', 'upset', ['glad', 'proud', 'calm'], ['расстроенный', 'ренжулі, көңілсіз']],
    [A2, 'Can you ______ me your pen for a minute?', 'lend', ['borrow', 'take', 'keep'], ['одолжить (дать на время)', 'уақытша беру']],
    [A2, 'The film was so ______ that I fell asleep.', 'boring', ['bored', 'exciting', 'interested'], 'eding'],
    [A2, "I'm really ______ in space and planets.", 'interested', ['interesting', 'boring', 'excited'], 'eding'],
    [A2, 'We had to ______ for the bus for twenty minutes.', 'wait', ['hope', 'expect', 'stay'], ['ждать (wait for)', 'күту (wait for)']],
    [B1, 'The match was ______ because of the storm.', 'cancelled', ['invited', 'defeated', 'repaired'], ['отменён', 'тоқтатылды, болмай қалды']],
    [B1, 'She has a lot of ______ in teaching: she has worked at school for twenty years.', 'experience', ['experiment', 'expression', 'excitement'], ['опыт', 'тәжірибе']],
    [B1, 'Could you give me some ______ about which laptop to buy?', 'advice', ['advise', 'advices', 'advertisement'], ['совет (неисчисляемое существительное)', 'кеңес (саналмайтын зат есім)']],
    [B1, 'The company wants to ______ twenty new workers.', 'hire', ['fire', 'retire', 'resign'], ['нанять', 'жұмысқа алу']],
    [B1, "I can't ______ to buy a new phone; it's too expensive.", 'afford', ['allow', 'avoid', 'admit'], ['позволить себе', 'қалтасы көтеру, мүмкіндігі болу']],
    [B1, "He ______ the exam although he hadn't studied much.", 'passed', ['missed', 'lost', 'spent'], ['сдал (успешно)', 'сәтті тапсырды']],
    [B1, 'Smoking can seriously ______ your health.', 'damage', ['injure', 'wound', 'spoil'], ['наносить вред', 'зиян келтіру']],
    [B1, 'The government plans to ______ taxes next year.', 'raise', ['rise', 'grow', 'lift up'], ['повышать (raise - переходный глагол, rise - непереходный)', 'көтеру (raise - сабақты, rise - салт етістік)']],
    [B2, 'The new law had a ______ effect on sales: they doubled in a month.', 'dramatic', ['slight', 'vague', 'mild'], ['резкий, значительный', 'күрт, айтарлықтай']],
    [B2, 'Scientists have made a major ______ in cancer research.', 'breakthrough', ['breakdown', 'outbreak', 'breakup'], ['прорыв', 'серпіліс, үлкен жетістік']],
    [B2, 'The evidence was not ______ enough to convict him.', 'convincing', ['convinced', 'convenient', 'conventional'], ['убедительный', 'нанымды']],
    [B2, 'She has a ______ for languages; she picks them up very quickly.', 'gift', ['present', 'donation', 'prize'], ['дар, способность', 'дарын, қабілет']],
    [B2, 'The city council decided to ______ the old factory into a museum.', 'convert', ['invert', 'divert', 'revert'], ['превратить, переоборудовать', 'айналдыру, қайта жабдықтау']],
    [B2, 'Prices have risen ______ over the past year - by almost 40%.', 'sharply', ['slightly', 'hardly', 'barely'], ['резко', 'күрт']],
    [B2, 'The lecture was so ______ that half the audience left early.', 'tedious', ['thrilling', 'tense', 'tender'], ['утомительный, скучный', 'жалықтыратын, іш пыстыратын']],
    [B2, 'We need to ______ the problem before it gets worse.', 'tackle', ['tickle', 'tumble', 'tremble'], ['взяться за решение', 'шешуге кірісу']],
    [C1, 'The minister\'s speech was deliberately ______, so nobody understood his real position.', 'ambiguous', ['ambitious', 'anonymous', 'unanimous'], ['двусмысленный', 'екіұшты']],
    [C1, 'The new findings ______ earlier research rather than contradict it.', 'corroborate', ['collaborate', 'elaborate', 'deteriorate'], ['подтверждать', 'растау, қуаттау']],
    [C1, "After the scandal, the company's reputation was ______ damaged.", 'irreparably', ['irrespectively', 'irregularly', 'irrelevantly'], ['непоправимо', 'орны толмастай']],
    [C1, 'He gave a ______ account of the events, leaving out no detail.', 'meticulous', ['meagre', 'negligent', 'superficial'], ['тщательный, скрупулёзный', 'мұқият, тиянақты']],
    [C1, 'Critics warn that the new policy will ______ existing inequalities, making the gap even wider.', 'exacerbate', ['alleviate', 'eradicate', 'mitigate'], ['усугублять', 'ушықтыру, асқындыру']],
    [C1, 'Her argument was so ______ that even her opponents agreed.', 'compelling', ['compulsive', 'compulsory', 'complacent'], ['убедительный, неотразимый', 'бұлтартпас, нанымды']],
    [C1, 'The two theories are not mutually ______; both can be true.', 'exclusive', ['inclusive', 'excessive', 'extensive'], ['взаимоисключающие (mutually exclusive)', 'бірін-бірі жоққа шығаратын (mutually exclusive)']],
    [C1, 'The village is so remote that it is virtually ______ in winter.', 'inaccessible', ['inevitable', 'incapable', 'incompatible'], ['недоступный, недосягаемый', 'жетуге болмайтын, қолжетімсіз']],
    [C2, "The critic's ______ review left the young director in tears.", 'scathing', ['soothing', 'seething', 'sprawling'], ['разгромный, уничтожающий', 'өткір сынға толы, аяусыз']],
    [C2, 'His explanation was so ______ that we were none the wiser.', 'convoluted', ['conducive', 'congenial', 'concise'], ['запутанный', 'шым-шытырық, түсініксіз']],
    [C2, 'She has an ______ knowledge of medieval history.', 'encyclopaedic', ['ephemeral', 'erratic', 'elusive'], ['энциклопедический', 'энциклопедиялық, жан-жақты']],
    [C2, 'The treaty was meant to ______ tensions between the two states.', 'defuse', ['diffuse', 'infuse', 'refuse'], ['разрядить (обстановку); не путать с diffuse - «рассеивать»', 'шиеленісті бәсеңдету; diffuse («тарату») сөзімен шатастырма']],
    [C2, 'The politician tried to ______ the issue rather than answer directly.', 'sidestep', ['overstep', 'undercut', 'outweigh'], ['уклониться, обойти', 'жалтару, айналып өту']],
    [C2, 'The practice, once rare, has become ______.', 'ubiquitous', ['iniquitous', 'ambiguous', 'fortuitous'], ['повсеместный', 'барлық жерде кездесетін']],
    [C2, 'A ______ of evidence suggests that sleep affects memory.', 'wealth', ['fortune', 'treasure', 'richness'], ['a wealth of - «множество, обилие»', 'a wealth of - «мол, көп»']],
    [C2, 'He was ______ by the sheer scale of the task.', 'daunted', ['vaunted', 'flaunted', 'taunted'], ['обескуражен, напуган', 'жасқанды, қаймықты']],
    [C2, 'The report was a ______ indictment of the prison system.', 'damning', ['dooming', 'cursing', 'blaming'], ['изобличающий, убийственный', 'әшкерелейтін, айыптайтын']],
    [C2, 'Her memoir is refreshingly ______ about her failures.', 'candid', ['candied', 'cunning', 'cordial'], ['откровенный', 'ашық, шынайы']],
    [C2, "The company's profits have ______ since the crisis.", 'plummeted', ['plundered', 'plodded', 'pledged'], ['резко упали', 'күрт құлдырады']],
  ],

  // ---------- Фразовые глаголы, сочетания слов, идиомы ----------
  'e.phrasal': [
    [A2, 'The plane ______ at 7 p.m., so we must be at the airport by five.', 'takes off', ['gets up', 'puts on', 'turns off'], ['take off - взлетать', 'take off - ұшып көтерілу']],
    [A2, 'I usually ______ at seven o\'clock on school days.', 'get up', ['get on', 'get in', 'get out'], ['get up - вставать с постели', 'get up - төсектен тұру']],
    [B1, 'Please ______ your shoes before you come in.', 'take off', ['turn off', 'give up', 'look up'], ['take off - снимать (одежду, обувь)', 'take off - шешу (киімді, аяқ киімді)']],
    [B1, 'The doctor told him to ______ smoking because of his cough.', 'give up', ['give in', 'put on', 'take up'], ['give up - бросить (привычку)', 'give up - тастау (әдетті)']],
    [B1, "Can you ______ the music? It's too loud.", 'turn down', ['turn up', 'turn on', 'turn into'], ['turn down - убавить звук', 'turn down - дыбысын бәсеңдету']],
    [B1, 'We ______ of petrol in the middle of the road.', 'ran out', ['ran away', 'ran into', 'ran over'], ['run out of - закончиться (о запасе)', 'run out of - таусылу (қор туралы)']],
    [B1, 'Could you ______ my cat while I am on holiday?', 'look after', ['look for', 'look up', 'look into'], ['look after - присматривать', 'look after - қарау, бағу']],
    [B2, 'The meeting has been ______ until next Friday.', 'put off', ['put out', 'put up', 'put away'], ['put off - отложить', 'put off - кейінге қалдыру']],
    [B2, "I can't ______ his rude behaviour any longer.", 'put up with', ['put down to', 'get on with', 'come up with'], ['put up with - мириться, терпеть', 'put up with - төзу, шыдау']],
    [B2, 'She ______ a brilliant idea for the project.', 'came up with', ['came down with', 'kept up with', 'got away with'], ['come up with - придумать', 'come up with - ойлап табу']],
    [B2, 'He ______ his father: both are tall and stubborn.', 'takes after', ['looks after', 'takes over', 'looks up'], ['take after - быть похожим (на родственника)', 'take after - тартып туу, ұқсау']],
    [B2, 'The negotiations ______ after only two days.', 'broke down', ['broke out', 'broke in', 'broke up with'], ['break down - провалиться, потерпеть неудачу', 'break down - сәтсіз аяқталу']],
    [C1, 'The news came as a ______ from the blue.', 'bolt', ['flash', 'bang', 'shot'], ['a bolt from the blue - «как гром среди ясного неба»', 'a bolt from the blue - «ашық күнгі найзағайдай»']],
    [C1, 'We need to ______ the pros and cons before deciding.', 'weigh up', ['wear out', 'wind up', 'work off'], ['weigh up - взвесить, оценить', 'weigh up - таразылау, бағалау']],
    [C1, 'She ______ a strong resemblance to her grandmother.', 'bears', ['holds', 'carries', 'keeps'], ['bear a resemblance - иметь сходство', 'bear a resemblance - ұқсастығы болу']],
    [C1, 'The project is still in its ______.', 'infancy', ['childhood', 'youth', 'cradle'], ['in its infancy - в зачаточном состоянии', 'in its infancy - бастапқы кезеңде']],
    [C1, 'He ______ to the occasion and delivered a brilliant speech.', 'rose', ['raised', 'lifted', 'climbed'], ['rise to the occasion - оказаться на высоте', 'rise to the occasion - сын сағатта мүдірмеу']],
    [C1, 'The decision ______ a heated debate.', 'sparked', ['lit', 'burned', 'flamed'], ['spark a debate - вызвать спор', 'spark a debate - пікірталас тудыру']],
    [C1, 'They finally ______ a compromise after hours of talks.', 'reached', ['caught', 'did', 'took'], ['reach a compromise - прийти к компромиссу', 'reach a compromise - мәмілеге келу']],
    [C2, 'The new evidence threw a ______ in the works.', 'spanner', ['hammer', 'screw', 'nail'], ['throw a spanner in the works - «вставить палки в колёса»', 'throw a spanner in the works - «істі бүлдіру, кедергі келтіру»']],
    [C2, "He has a ______ to pick with you about yesterday's meeting.", 'bone', ['fish', 'stone', 'stick'], ['have a bone to pick - иметь претензию, неприятный разговор', 'have a bone to pick - реніші, айтар сөзі болу']],
    [C2, 'After months of talks, they are back to ______ one.', 'square', ['circle', 'point', 'stage'], ['back to square one - снова в исходной точке', 'back to square one - қайтадан бастапқы нүктеде']],
    [C2, 'She passed the exam with flying ______.', 'colours', ['flags', 'wings', 'stars'], ['with flying colours - блестяще, с отличием', 'with flying colours - өте жақсы, үздік']],
    [C2, 'I took his promise with a ______ of salt.', 'pinch', ['piece', 'spoon', 'drop'], ['take with a pinch of salt - относиться с недоверием', 'take with a pinch of salt - сенімсіздікпен қарау']],
    [C2, 'The scandal was only the tip of the ______.', 'iceberg', ['mountain', 'needle', 'tongue'], ['the tip of the iceberg - верхушка айсберга', 'the tip of the iceberg - айсбергтің ұшы ғана']],
    [C2, "Don't beat about the ______ - tell me what happened.", 'bush', ['tree', 'garden', 'hedge'], ['beat about the bush - ходить вокруг да около', 'beat about the bush - айналсоқтап, тура айтпау']],
  ],

  // ---------- Словообразование ----------
  'e.wordform': [
    [B1, 'She is a very ______ person and helps everyone. (HELP)', 'helpful', ['helpless', 'helping', 'helper'], 'wordform'],
    [B1, 'Thank you for your ______. (KIND)', 'kindness', ['kindly', 'kind', 'unkind'], 'wordform'],
    [B1, 'He is very ______; he always loses his keys. (FORGET)', 'forgetful', ['forgotten', 'forgetting', 'unforgettable'], 'wordform'],
    [B1, 'The weather was ______, so we stayed at home. (TERROR)', 'terrible', ['terribly', 'terrified', 'terrorist'], 'wordform'],
    [B1, 'What is the ______ of this river? (LONG)', 'length', ['longer', 'longly', 'lengthen'], 'wordform'],
    [B2, 'The film was a complete ______. (DISAPPOINT)', 'disappointment', ['disappointed', 'disappointing', 'disappoint'], 'wordform'],
    [B2, 'There is no ______ explanation for this phenomenon. (SCIENCE)', 'scientific', ['scientist', 'scientifically', 'science'], 'wordform'],
    [B2, 'His ______ to help surprised everyone. (WILLING)', 'willingness', ['willing', 'willingly', 'unwilling'], 'wordform'],
    [B2, 'The instructions were ______, so nobody knew what to do. (CLEAR)', 'unclear', ['clearly', 'clarity', 'clearing'], 'wordform'],
    [B2, 'Regular exercise is ______ for your health. (BENEFIT)', 'beneficial', ['beneficiary', 'benefited', 'benefiting'], 'wordform'],
    [C1, 'The ______ of the evidence is in doubt. (RELY)', 'reliability', ['reliable', 'reliably', 'relying'], 'wordform'],
    [C1, 'His behaviour was completely ______. (ACCEPT)', 'unacceptable', ['unaccepted', 'acceptance', 'acceptably'], 'wordform'],
    [C1, 'The government faces growing public ______. (SATISFY)', 'dissatisfaction', ['unsatisfied', 'dissatisfied', 'satisfactory'], 'wordform'],
    [C1, 'She spoke with great ______ about her work. (ENTHUSIASTIC)', 'enthusiasm', ['enthusiastic', 'enthusiast', 'enthusiastically'], 'wordform'],
    [C1, 'The results were statistically ______. (SIGNIFY)', 'significant', ['significance', 'signified', 'signifying'], 'wordform'],
    [C2, 'The ______ of the two companies took months to negotiate. (MERGE)', 'merger', ['mergence', 'merged', 'emerge'], 'wordform'],
    [C2, 'His ______ remarks offended half the audience. (TACT)', 'tactless', ['tactful', 'tactical', 'tactfully'], 'wordform'],
    [C2, 'The findings are ______ and need further verification. (CONCLUDE)', 'inconclusive', ['unconcluded', 'conclusive', 'concluding'], 'wordform'],
    [C2, 'The witness gave a deliberately ______ statement. (LEAD)', 'misleading', ['misled', 'leading', 'leaderless'], 'wordform'],
    [C2, 'The damage to the ecosystem may prove ______. (REVERSE)', 'irreversible', ['unreversed', 'reversal', 'reversibly'], 'wordform'],
  ],
};

// Дополнительные задания - в bank-more3-*.js.
for (const more of [MORE_A, MORE_B, MORE_C, MORE_D, MORE_E, MORE_F, MORE_G, MORE4_A, MORE4_B, MORE4_C, MORE4_D, MORE4_E, MORE4_F, MORE4_G, MORE4_H, MORE4_I, MORE4_J, MORE4_GEN, MORE4_GEN2, MORE4_GEN3]) {
  for (const [topic, rows] of Object.entries(more)) {
    const have = new Set(BANK[topic].map((row) => row[1]));
    for (const row of rows) if (!have.has(row[1])) {
        have.add(row[1]);
        BANK[topic].push(row);
      }
  }
}
