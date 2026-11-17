// Аудирование для IELTS и TOEFL: авторские диалоги, монологи и лекции. Озвучивает голос браузера,
// у разных говорящих — разные голоса (если на устройстве их несколько). Вопросы к одной записи идут подряд.
// Объяснение ответа — цитата из записи (стенограмма открывается после ответа).

import { pick, shuffle } from '../core/random.js';
import { L, poolQ } from './gen.js';

const say = (s, t) => ({ s, t });
/** Первый вариант — правильный, при показе варианты перемешиваются. */
const mc = (question, choices, quote) => ({ type: 'mc', question, choices, quote });
/** Ответ — число (вводится с клавиатуры), как в заданиях IELTS на заполнение формы. */
const num = (question, value, quote) => ({ type: 'num', question, value, quote });

export const LISTENING = {
  ielts: [
    {
      id: 'library',
      title: 'Part 1 · Joining a library',
      speakers: { A: 'f', B: 'm' },
      lines: [
        say('A', 'Good morning, Riverside Library. How can I help you?'),
        say('B', 'Hi. I’ve just moved to the area and I’d like to join the library. What do I need to do?'),
        say('A', 'It’s quite simple. You can register online, but most people come in person, because you need to show proof of your address.'),
        say('B', 'Would a bank statement be OK?'),
        say('A', 'Yes, a bank statement or a utility bill, as long as it’s less than three months old. A phone bill isn’t accepted, I’m afraid.'),
        say('B', 'Right. And is membership free?'),
        say('A', 'For residents it’s free for books. If you want to borrow films or use the music studio, there’s an annual fee of twelve pounds.'),
        say('B', 'That sounds reasonable. How many books can I take out at once?'),
        say('A', 'Adults can borrow up to eight items at a time, and the loan period is three weeks. You can renew them online twice.'),
        say('B', 'Great. What are your opening hours at the weekend?'),
        say('A', 'On Saturdays we open at half past nine and close at five. On Sundays we’re only open in the afternoon, from one until four.'),
        say('B', 'And do you run any events? My daughter is seven.'),
        say('A', 'Yes, there’s a reading club for children every Wednesday after school, at four o’clock. It meets on the second floor, next to the computer area.'),
        say('B', 'Does she need to book?'),
        say('A', 'Only for the first visit, so we know how many chairs to put out. After that she can just turn up.'),
      ],
      qs: [
        mc('What can be used as proof of address?', ['A bank statement less than three months old', 'A phone bill', 'A passport', 'A letter from a school'], 'a bank statement or a utility bill, as long as it’s less than three months old. A phone bill isn’t accepted'),
        num('How much is the annual fee for films and the music studio (in pounds)?', 12, 'there’s an annual fee of twelve pounds'),
        num('How many items can an adult borrow at a time?', 8, 'Adults can borrow up to eight items at a time'),
        mc('How long is the loan period?', ['Three weeks', 'Two weeks', 'Eight days', 'One month'], 'the loan period is three weeks'),
        mc('When is the library open on Sundays?', ['From 1 pm to 4 pm', 'From 9.30 am to 5 pm', 'Only in the morning', 'It is closed on Sundays'], 'On Sundays we’re only open in the afternoon, from one until four.'),
        mc('Where does the children’s reading club meet?', ['On the second floor, next to the computers', 'On the ground floor, by the entrance', 'In the music studio', 'At the local school'], 'It meets on the second floor, next to the computer area.'),
        mc('What does the daughter need to do?', ['Book only for her first visit', 'Book before every meeting', 'Pay a small fee', 'Bring a parent every time'], 'Only for the first visit, so we know how many chairs to put out.'),
      ],
    },
    {
      id: 'bikes',
      title: 'Part 1 · Booking a bike tour',
      speakers: { A: 'm', B: 'f' },
      lines: [
        say('A', 'Hello, City Wheels Bike Tours, Daniel speaking.'),
        say('B', 'Hello. I’d like to book a bike tour for this Saturday, please. There are four of us.'),
        say('A', 'Lovely. We have two tours on Saturdays: the Old Town tour, which takes two hours, and the River tour, which is a bit longer, about three and a half hours.'),
        say('B', 'We’d prefer the longer one. Does it go far?'),
        say('A', 'It’s about twenty-two kilometres, but it’s completely flat, so it isn’t difficult. We stop for lunch at a café by the water.'),
        say('B', 'Is lunch included in the price?'),
        say('A', 'A drink and a sandwich are included. The tour costs thirty-five pounds per person, and children under twelve pay half price.'),
        say('B', 'We’re all adults. What time does it start?'),
        say('A', 'Please arrive at a quarter past eight. We leave at half past eight sharp, because the river path gets busy later in the morning.'),
        say('B', 'Where do we meet?'),
        say('A', 'At our shop on Mill Street, opposite the main entrance of the railway station. You’ll see the green bikes outside.'),
        say('B', 'Do we need to bring anything?'),
        say('A', 'Helmets are provided, but bring a waterproof jacket. The weather by the river can change quickly. And the maximum group size is twelve, so you won’t be in a huge crowd.'),
      ],
      qs: [
        mc('How long is the River tour?', ['About three and a half hours', 'Two hours', 'Twenty-two hours', 'The whole day'], 'the River tour, which is a bit longer, about three and a half hours'),
        num('How long is the River tour route, in kilometres?', 22, 'It’s about twenty-two kilometres, but it’s completely flat'),
        num('How much does the tour cost for one adult (in pounds)?', 35, 'The tour costs thirty-five pounds per person'),
        mc('Why does the tour leave early?', ['The river path gets busy later', 'The café closes at noon', 'It gets too hot later', 'The bikes are needed for another group'], 'We leave at half past eight sharp, because the river path gets busy later in the morning.'),
        mc('Where is the meeting point?', ['Opposite the railway station', 'Next to the river café', 'Behind the town hall', 'At the bus station'], 'At our shop on Mill Street, opposite the main entrance of the railway station.'),
        mc('What should the customers bring?', ['A waterproof jacket', 'Their own helmets', 'A packed lunch', 'Cash for the café'], 'Helmets are provided, but bring a waterproof jacket.'),
        num('What is the maximum group size?', 12, 'the maximum group size is twelve'),
      ],
    },
    {
      id: 'park',
      title: 'Part 2 · A guide to a nature park',
      speakers: { A: 'f' },
      lines: [
        say('A', 'Good morning, everyone, and welcome to Altyn Dala Nature Park. My name is Madina and I’ll be your guide today. Before we set off, let me tell you a little about the park and today’s programme.'),
        say('A', 'The park was created in two thousand and twelve to protect the steppe and the animals that live on it, especially the saiga antelope. It covers an area larger than some European countries, so of course we’ll only see a small part of it.'),
        say('A', 'We’ll start at the visitor centre, where you are standing now. Inside there’s a small exhibition about the history of the steppe. Please have a look at it during the break, rather than now, because we want to reach the lake before the birds fly off for the day.'),
        say('A', 'The lake is about forty minutes away by minibus. In spring, thousands of birds stop there on their way north. Please keep your voices low and don’t leave the wooden path, because many birds nest in the grass right next to it.'),
        say('A', 'After the lake we’ll come back here for lunch. The café serves hot meals, but if you have brought your own food, you are welcome to use the picnic tables behind the building.'),
        say('A', 'In the afternoon there is a choice. You can join the walk to the observation tower, which takes about two hours, or you can watch a short film about saiga conservation in the cinema room. The film is in Kazakh and Russian, with English subtitles.'),
        say('A', 'One last thing: drones are not allowed anywhere in the park, because they frighten the animals. Mobile phones are fine, but please switch off the sound.'),
      ],
      qs: [
        mc('Why was the park created?', ['To protect the steppe and its animals', 'To attract more foreign tourists', 'To build a new research centre', 'To grow crops on the steppe'], 'The park was created in two thousand and twelve to protect the steppe and the animals that live on it'),
        mc('When should visitors look at the exhibition?', ['During the break', 'Right now, before leaving', 'At the end of the day', 'Only if they have tickets'], 'Please have a look at it during the break, rather than now'),
        num('How many minutes does it take to reach the lake by minibus?', 40, 'The lake is about forty minutes away by minibus.'),
        mc('Why must visitors stay on the wooden path?', ['Birds nest in the grass next to it', 'The ground is very wet', 'There are snakes near the lake', 'It is the shortest way'], 'don’t leave the wooden path, because many birds nest in the grass right next to it'),
        mc('Where can visitors eat their own food?', ['At the picnic tables behind the building', 'In the café', 'On the minibus', 'Next to the lake'], 'you are welcome to use the picnic tables behind the building'),
        mc('What is NOT allowed in the park?', ['Drones', 'Mobile phones', 'Cameras', 'Picnics'], 'drones are not allowed anywhere in the park, because they frighten the animals'),
      ],
    },
    {
      id: 'project',
      title: 'Part 3 · Planning a group project',
      speakers: { A: 'f', B: 'm' },
      lines: [
        say('A', 'So, Tom, have you had a chance to think about the topic for our presentation?'),
        say('B', 'I have. I was thinking about rooftop gardens. There’s been a lot in the news about them recently, and our city council has just started a project.'),
        say('A', 'That could work. But I’m worried it’s too broad. Rooftop gardens can be about food, about climate, about community… We only have fifteen minutes.'),
        say('B', 'True. Maybe we could focus on one thing: whether they really cool buildings down in summer.'),
        say('A', 'I like that, because there’s actual data we can use. The council published temperature measurements from the first three buildings.'),
        say('B', 'Exactly. And we could compare them with buildings that have normal roofs.'),
        say('A', 'What about the survey? Our tutor said she wanted us to collect some data ourselves.'),
        say('B', 'We could ask the people who work in those buildings whether they’ve noticed any difference. That wouldn’t take long.'),
        say('A', 'Good idea, but we should keep it short. Five questions at most. Nobody wants to fill in a long form at work.'),
        say('B', 'Agreed. Shall I write the questions, and you contact the council?'),
        say('A', 'Actually, I’d rather do the questions. I did a survey for my sociology course last term, so I know what mistakes to avoid. Could you deal with the council? You know the man who runs the project, don’t you?'),
        say('B', 'Sort of. He gave a talk at our school once. Fine, I’ll email him today.'),
      ],
      qs: [
        mc('What is the woman’s first concern about rooftop gardens as a topic?', ['It is too broad', 'It is too difficult', 'There is no data', 'It is not in the news'], 'I’m worried it’s too broad.'),
        num('How long will the presentation be (in minutes)?', 15, 'We only have fifteen minutes.'),
        mc('What will the students focus on?', ['Whether the gardens cool buildings in summer', 'How much food the gardens produce', 'How the gardens bring people together', 'How much the gardens cost'], 'whether they really cool buildings down in summer'),
        mc('Why does the woman like this focus?', ['There is real data they can use', 'Nobody has studied it before', 'Their tutor suggested it', 'It is the easiest option'], 'I like that, because there’s actual data we can use.'),
        num('What is the maximum number of questions in the survey?', 5, 'Five questions at most.'),
        mc('Why does the woman want to write the survey?', ['She has done a survey before', 'She knows the council worker', 'She has more free time', 'Her tutor asked her to'], 'I did a survey for my sociology course last term, so I know what mistakes to avoid.'),
      ],
    },
    {
      id: 'bees',
      title: 'Part 4 · Lecture: how honeybees share information',
      speakers: { A: 'm' },
      lines: [
        say('A', 'Today I want to look at one of the most remarkable systems of communication in the animal world: the dance of the honeybee.'),
        say('A', 'When a worker bee finds a good source of food, such as a field of flowers, she returns to the hive and performs what we call the waggle dance. She walks in a straight line while shaking her body from side to side, then circles back and repeats the movement many times.'),
        say('A', 'The direction of the straight run tells the other bees where to fly. Inside the dark hive, the bees use gravity as a reference: running straight up the honeycomb means “fly towards the sun”. If the run points, say, forty degrees to the right of vertical, the food is forty degrees to the right of the sun.'),
        say('A', 'The length of the waggle run tells them how far away the food is. A longer run means a longer journey. Interestingly, bees seem to measure distance by how much the landscape moves past their eyes, not by how much energy they use.'),
        say('A', 'This was shown in a clever experiment in which bees flew through a narrow tunnel with patterns on the walls. Although the tunnel was only a few metres long, the bees danced as if they had flown hundreds of metres.'),
        say('A', 'The scientist most associated with this research is Karl von Frisch, who received a Nobel Prize in nineteen seventy-three. His conclusions were doubted at first, but modern studies using small radar devices attached to bees have confirmed that other bees really do use the information in the dance.'),
      ],
      qs: [
        mc('What does the direction of the waggle run show?', ['Where the food is in relation to the sun', 'How much food there is', 'How far away the food is', 'Which bees should go'], 'The direction of the straight run tells the other bees where to fly.'),
        num('In the lecturer’s example, how many degrees to the right of the sun is the food?', 40, 'the food is forty degrees to the right of the sun'),
        mc('What does a longer waggle run mean?', ['The food is further away', 'The food is of better quality', 'The weather is bad', 'More bees are needed'], 'A longer run means a longer journey.'),
        mc('How do bees seem to measure distance?', ['By how much the landscape moves past their eyes', 'By the energy they use', 'By the time of day', 'By the smell of the flowers'], 'bees seem to measure distance by how much the landscape moves past their eyes, not by how much energy they use'),
        mc('What did the tunnel experiment show?', ['Bees overestimated distance in a patterned tunnel', 'Bees cannot fly in tunnels', 'Bees use the sun even indoors', 'Bees dance only in the dark'], 'the bees danced as if they had flown hundreds of metres'),
        num('In what year did Karl von Frisch receive the Nobel Prize?', 1973, 'received a Nobel Prize in nineteen seventy-three'),
      ],
    },
    {
      id: 'glaciers',
      title: 'Part 4 · Lecture: the water towers of Central Asia',
      speakers: { A: 'f' },
      lines: [
        say('A', 'In today’s lecture we turn to the mountains of Central Asia, which scientists sometimes call “water towers”.'),
        say('A', 'The Tian Shan and Pamir ranges hold thousands of glaciers. In winter, snow builds up on them; in summer, part of the ice melts and feeds the rivers below. This is important because summer is exactly the season when farmers on the plains need the most water and when rain is rare.'),
        say('A', 'Measurements over the last fifty years show that most glaciers in the Tian Shan have become smaller. Some studies suggest a loss of around a quarter of their area since the nineteen sixties, although the figures vary from valley to valley.'),
        say('A', 'You might expect shrinking glaciers to mean less water straight away, but in fact the opposite can happen at first. As the ice melts faster, rivers can carry more water than before. Scientists call the moment when this extra flow stops increasing and begins to fall “peak water”.'),
        say('A', 'For some smaller glaciers, peak water may already have passed. For the largest ones it is expected later this century. After that, summer river flow is likely to decline, which is why countries in the region are investing in better irrigation and in reservoirs that can store spring floods.'),
        say('A', 'For your assignment, I’d like you to choose one river basin and find out how its flow has changed. Please use official measurements, not news articles.'),
      ],
      qs: [
        mc('Why are the mountain glaciers so important to farmers?', ['They release water in summer, when rain is rare', 'They protect fields from wind', 'They make the soil richer', 'They stop floods in spring'], 'summer is exactly the season when farmers on the plains need the most water and when rain is rare'),
        num('Over roughly how many years have measurements shown glaciers shrinking?', 50, 'Measurements over the last fifty years show that most glaciers in the Tian Shan have become smaller.'),
        mc('What can happen at first when glaciers melt faster?', ['Rivers carry more water than before', 'Rivers dry up immediately', 'Glaciers grow again', 'Rain increases in summer'], 'As the ice melts faster, rivers can carry more water than before.'),
        mc('What is “peak water”?', ['The moment extra flow stops increasing and starts to fall', 'The highest point of a glacier', 'The wettest month of the year', 'The largest reservoir in a region'], 'the moment when this extra flow stops increasing and begins to fall'),
        mc('What are countries investing in?', ['Irrigation and reservoirs', 'Artificial glaciers', 'New mountain roads', 'Cloud seeding'], 'countries in the region are investing in better irrigation and in reservoirs that can store spring floods'),
        mc('What sources should students use for the assignment?', ['Official measurements', 'News articles', 'Interviews with farmers', 'Their own photos'], 'Please use official measurements, not news articles.'),
      ],
    },
  ],
  toefl: [
    {
      id: 'office',
      title: 'Conversation · Office hours',
      speakers: { A: 'm', B: 'f' },
      lines: [
        say('A', 'Come in. Oh, hi, Sara. What can I do for you?'),
        say('B', 'Hi, Professor Lee. It’s about my research paper. I chose the topic of urban heat islands, but I’m finding it hard to get data for our city.'),
        say('A', 'I see. What have you tried so far?'),
        say('B', 'I looked on the city website, but they only publish the average temperature for the whole city, not for different neighbourhoods.'),
        say('A', 'Right. Have you thought about contacting the university’s geography department? They run a network of small weather stations around town for a long-term project.'),
        say('B', 'I didn’t know that. Would they share the data with a student?'),
        say('A', 'They usually do, if you explain what it’s for. Mention my name if you like. But I should warn you: the data come in a raw format, so you’ll need some time to clean them up.'),
        say('B', 'That’s fine. The paper isn’t due for another five weeks.'),
        say('A', 'Good. Then I’d suggest you narrow the question. Instead of “the heat island effect” in general, compare two neighbourhoods, one with a lot of trees and one without. That will make your argument much clearer.'),
      ],
      qs: [
        mc('Why does the student go to see the professor?', ['She cannot find detailed data for her paper', 'She wants to change her topic', 'She missed a lecture', 'She needs an extension'], 'I’m finding it hard to get data for our city.'),
        mc('What is the problem with the city website?', ['It shows only one average for the whole city', 'It is not updated', 'It is not in English', 'It charges a fee'], 'they only publish the average temperature for the whole city, not for different neighbourhoods'),
        mc('What does the professor suggest first?', ['Contacting the geography department', 'Building her own weather station', 'Using data from another city', 'Writing about a different topic'], 'Have you thought about contacting the university’s geography department?'),
        mc('What does the professor warn her about?', ['The data will need cleaning', 'The data are confidential', 'The department is closed', 'The project has ended'], 'the data come in a raw format, so you’ll need some time to clean them up'),
        num('In how many weeks is the paper due?', 5, 'The paper isn’t due for another five weeks.'),
        mc('How does the professor suggest narrowing the question?', ['Compare a neighbourhood with many trees and one without', 'Study only one street', 'Look only at winter temperatures', 'Focus on other countries'], 'compare two neighbourhoods, one with a lot of trees and one without'),
      ],
    },
    {
      id: 'housing',
      title: 'Conversation · The housing office',
      speakers: { A: 'f', B: 'm' },
      lines: [
        say('A', 'Housing office, how can I help?'),
        say('B', 'Hi. I’m living in North Hall, and I’d like to ask about moving to a different room.'),
        say('A', 'Is there a problem with your current room?'),
        say('B', 'Not with the room itself. It’s just that my lab work often finishes late, and North Hall is on the opposite side of campus from the science buildings. Walking back at midnight takes almost half an hour.'),
        say('A', 'I understand. The closest residence to the science buildings is East Court. Unfortunately, it’s full at the moment, but you can join the waiting list.'),
        say('B', 'How long is the wait usually?'),
        say('A', 'It depends. Rooms often become free at the end of the semester, when some students go on exchange programmes. In the meantime, did you know there’s a free evening shuttle bus? It runs every twenty minutes until one a.m.'),
        say('B', 'Really? I had no idea. Where does it stop?'),
        say('A', 'There’s a stop right in front of the chemistry building, and another one next to North Hall. You just need to show your student card.'),
        say('B', 'That would help a lot. I’ll take the bus for now, but please put me on the list anyway.'),
      ],
      qs: [
        mc('Why does the student want to move?', ['His residence is far from the science buildings', 'His room is too small', 'His roommate is noisy', 'His rent is too high'], 'North Hall is on the opposite side of campus from the science buildings'),
        num('About how many minutes does the walk back take?', 30, 'Walking back at midnight takes almost half an hour.'),
        mc('Why can’t he move to East Court now?', ['It is full', 'It is being repaired', 'It is only for graduate students', 'It is too expensive'], 'Unfortunately, it’s full at the moment, but you can join the waiting list.'),
        mc('When do rooms often become free?', ['At the end of the semester', 'In the first week of term', 'During the summer only', 'Every month'], 'Rooms often become free at the end of the semester'),
        num('How often does the evening shuttle bus run (every … minutes)?', 20, 'It runs every twenty minutes until one a.m.'),
        mc('What will the student do?', ['Use the shuttle bus and stay on the waiting list', 'Move to East Court tomorrow', 'Change his lab schedule', 'Buy a bicycle'], 'I’ll take the bus for now, but please put me on the list anyway.'),
      ],
    },
    {
      id: 'exoplanets',
      title: 'Lecture · Astronomy: finding planets around other stars',
      speakers: { A: 'f' },
      lines: [
        say('A', 'Until the nineteen nineties, astronomers could only guess whether other stars had planets. Today we know of more than five thousand. So how do we find them, when the planets themselves are far too faint to see directly?'),
        say('A', 'The most productive method is called the transit method. If a planet passes in front of its star, as seen from Earth, it blocks a tiny fraction of the star’s light. A planet the size of Jupiter might dim a sun-like star by about one percent; an Earth-sized planet by less than a hundredth of a percent.'),
        say('A', 'By measuring how much the light drops, astronomers can estimate the planet’s size. By measuring how often the dip repeats, they learn how long one orbit takes.'),
        say('A', 'There is an obvious limitation, though. The transit method only works if the planet’s orbit is lined up almost exactly with our line of sight. Most planetary systems are tilted the wrong way, so we never see their planets cross the star.'),
        say('A', 'That’s why astronomers combine it with a second method, which detects the slight wobble of a star as a planet pulls on it. The wobble tells us the planet’s mass. Size plus mass gives density, and density tells us whether a planet is rocky, like Earth, or made mostly of gas.'),
      ],
      qs: [
        mc('What is the lecture mainly about?', ['Methods used to detect planets around other stars', 'The history of the telescope', 'Why Jupiter is so large', 'How stars are born'], 'So how do we find them, when the planets themselves are far too faint to see directly?'),
        mc('What does the transit method measure?', ['A drop in a star’s light when a planet passes in front', 'The colour of a planet', 'The heat from a planet', 'Radio signals from a planet'], 'it blocks a tiny fraction of the star’s light'),
        mc('What can astronomers learn from how often the dip repeats?', ['How long one orbit takes', 'The planet’s mass', 'The planet’s temperature', 'The age of the star'], 'By measuring how often the dip repeats, they learn how long one orbit takes.'),
        mc('What is the main limitation of the transit method?', ['The orbit must be lined up with our line of sight', 'It only works for small planets', 'It needs very cold weather', 'It cannot measure size'], 'The transit method only works if the planet’s orbit is lined up almost exactly with our line of sight.'),
        mc('Why do astronomers combine the two methods?', ['Size and mass together give density', 'One method is cheaper', 'The second method is faster', 'To find more stars'], 'Size plus mass gives density, and density tells us whether a planet is rocky'),
      ],
    },
    {
      id: 'tamgaly',
      title: 'Lecture · Archaeology: the rock art of Tamgaly',
      speakers: { A: 'm' },
      lines: [
        say('A', 'Let’s continue our discussion of rock art with a site in south-eastern Kazakhstan: Tamgaly, about one hundred and seventy kilometres from Almaty. It became a UNESCO World Heritage Site in two thousand and four.'),
        say('A', 'Tamgaly contains around five thousand petroglyphs, that is, images cut or scratched into the surface of the rock. The oldest are thought to date from the Bronze Age, roughly the second half of the second millennium BCE, but people kept adding new images for centuries afterwards.'),
        say('A', 'The most famous figures are the so-called “sun-headed” beings: human figures whose heads are surrounded by rays or circles. Researchers still argue about what they represent. Some see them as gods, others as priests in ritual costumes.'),
        say('A', 'Now, how do we date images that contain no organic material? We can’t use radiocarbon dating directly. Instead, archaeologists compare the style of the images with objects from nearby burials that can be dated, and they study the dark coating, called desert varnish, that slowly forms on the rock after a surface is cut.'),
        say('A', 'Notice that the images are not spread evenly. They are concentrated around a central canyon, which suggests that this place had a special meaning — perhaps it was used for ceremonies, and not just for passing through.'),
      ],
      qs: [
        num('In what year did Tamgaly become a UNESCO World Heritage Site?', 2004, 'It became a UNESCO World Heritage Site in two thousand and four.'),
        mc('What are petroglyphs?', ['Images cut or scratched into rock', 'Paintings on cave walls', 'Small stone statues', 'Patterns on pottery'], 'images cut or scratched into the surface of the rock'),
        mc('What does the lecturer say about the “sun-headed” figures?', ['Their meaning is still debated', 'They were added in the 20th century', 'They show animals', 'They were painted with gold'], 'Researchers still argue about what they represent.'),
        mc('Why can’t radiocarbon dating be used directly?', ['The images contain no organic material', 'The rocks are too young', 'The site is protected', 'It is too expensive'], 'how do we date images that contain no organic material? We can’t use radiocarbon dating directly.'),
        mc('What does the distribution of the images suggest?', ['The place had a special, possibly ceremonial, meaning', 'People lived there all year round', 'The images were made by one artist', 'The canyon was used only as a road'], 'They are concentrated around a central canyon, which suggests that this place had a special meaning'),
      ],
    },
  ],
};

/** Число вопросов аудирования по экзамену. */
export const LISTENING_COUNT = Object.values(LISTENING).reduce((sum, list) => sum + list.reduce((s, p) => s + p.qs.length, 0), 0);

const quoteEx = (quote) => L(`In the recording: “${quote}”`, `В записи: «${quote}»`, `Жазбада: «${quote}»`);
const PROMPT_NUM = L('Type the number you hear.', 'Введи число, которое услышишь.', 'Естіген санды енгіз.');

function build(topic, source, script, index, round, rng) {
  const item = script.qs[index];
  const listen = { id: `${source}:${script.id}`, title: script.title, lines: script.lines, speakers: script.speakers, lang: 'en' };
  let q;
  if (item.type === 'num') {
    q = poolQ(topic, 2, { kind: 'text', prompt: L(item.question, item.question, item.question), ex: quoteEx(item.quote), spr: { value: item.value, display: String(item.value) } });
    q.hint = PROMPT_NUM;
  } else {
    const order = shuffle([0, 1, 2, 3], rng);
    q = poolQ(topic, 2, {
      kind: 'text',
      prompt: L(item.question, item.question, item.question),
      ex: quoteEx(item.quote),
      mc: { choices: order.map((i) => item.choices[i]), answer: order.indexOf(0) },
    });
  }
  q.listen = listen;
  q.id = `${topic}:${script.id}:${index}${round ? `#${round}` : ''}`;
  return q;
}

/** Генератор аудирования: все вопросы одной записи подряд, затем следующая запись. */
export function listeningMaker(topic, source) {
  const scripts = LISTENING[source];
  return (ctx) => {
    const store = (ctx.state ??= {});
    const state = (store[topic] ??= { queue: [], done: [], round: 0 });
    if (!state.queue.length) {
      let fresh = scripts.filter((p) => !state.done.includes(p.id));
      if (!fresh.length) {
        state.done = [];
        state.round += 1;
        fresh = scripts;
      }
      const script = pick(ctx.rng, fresh);
      state.done.push(script.id);
      state.queue = script.qs.map((_, i) => ({ script, index: i }));
    }
    const { script, index } = state.queue.shift();
    return build(topic, source, script, index, state.round, ctx.rng);
  };
}
