// Полные тесты IELTS Academic Reading: в каждом три длинных текста (≈650-700 слов), 40 вопросов, 60 минут.
// Тест 1 - в этом файле, тесты 2-8 - в папке ielts/ (по файлу на тест).
// Типы вопросов как на экзамене: True / False / Not Given, Yes / No / Not Given, выбор ответа,
// подбор заголовков к абзацам и заполнение пропусков словами из списка.
// Объяснение к каждому ответу - абзац и цитата из текста.

import { createRng, hashString, shuffle } from '../core/random.js';
import { TEST_2 } from './ielts/t2.js';
import { TEST_3 } from './ielts/t3.js';
import { TEST_4 } from './ielts/t4.js';
import { TEST_5 } from './ielts/t5.js';
import { TEST_6 } from './ielts/t6.js';
import { TEST_7 } from './ielts/t7.js';
import { TEST_8 } from './ielts/t8.js';

const tf = (statement, answer, para, quote) => ({ statement, answer, para, quote });
const choice = (question, choices, answer, para, quote) => ({ question, choices, answer, para, quote });
const gap = (text, answer, para, quote) => ({ text, answer, para, quote });
const head = (para, answer, quote) => ({ para, answer, quote });

export const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN'];
export const YNNG = ['YES', 'NO', 'NOT GIVEN'];
export const FULL_MINUTES = 60;

export const IELTS_FULL = {
  id: 'academic-1',
  title: 'IELTS Academic Reading · Test 1',
  passages: [
    {
      title: 'The Return of the Saiga',
      paras: [
        ['A', 'Few animals look as strange as the saiga antelope. Its large, flexible nose hangs over its mouth like a short trunk, and in winter its sandy summer coat turns thick and pale. The nose is not merely decorative: it filters the dust kicked up by the herd during dry summer migrations and warms the freezing air the animal breathes in winter. For thousands of years, huge herds of saiga moved across the grasslands of Central Asia, from the edge of the Caspian Sea to the foothills of the Altai mountains.'],
        ['B', 'In the twentieth century, the saiga’s fortunes changed dramatically, and more than once. Hunting in the early 1900s reduced the population to a few hundred animals in some areas, but strict protection introduced in the Soviet period allowed numbers to recover, and by the 1970s there were well over a million saiga in Kazakhstan alone. The collapse that followed in the 1990s was among the fastest ever recorded for a large mammal. During the economic crisis that came with the break-up of the Soviet Union, rangers lost their funding, and poaching rose sharply. Much of the hunting was driven by demand for the horns of male saiga, which were sold for use in traditional medicine abroad. Because only males carry horns, poachers removed adult males from the herds so efficiently that in some herds there was only one male for every hundred females, and far fewer calves were born. By 2003, the total population had fallen by more than 95 percent.'],
        ['C', 'The response was a combination of law enforcement, research and public engagement. Kazakhstan increased the number of rangers and gave them vehicles and better equipment. Several large protected areas were created, among them Altyn Dala, which links breeding grounds with wintering areas. At the same time, scientists began to fit some animals with satellite collars, which revealed for the first time the exact routes the herds followed and showed that the animals could travel more than a hundred kilometres in a single day.'],
        ['D', 'A further blow came in May 2015, when about 200,000 saiga died within a few weeks in central Kazakhstan, most of them females that had just given birth. At first, poisoning or a disease spread by livestock was suspected. Investigations later concluded that a bacterium normally carried harmlessly by the animals had suddenly entered their bloodstream. Scientists were able to study the event closely because a team happened to be monitoring one of the affected herds when the first animals fell ill. The trigger appears to have been unusually high temperature and humidity in the days before the deaths. The finding was worrying, because it suggested that similar events could become more frequent as the climate changes.'],
        ['E', 'Remarkably, the population recovered from this disaster faster than almost anyone had expected. Saiga reproduce unusually quickly for an antelope of their size: females can breed in their first year, and twins are common. Unlike many large mammals, which produce one young every two or three years, a female saiga may produce two calves every year. Combined with effective protection against poaching, this allowed numbers to multiply. By 2022, aerial surveys estimated more than one million animals in Kazakhstan, and in 2023 the International Union for Conservation of Nature moved the species from “Critically Endangered” to “Near Threatened”.'],
        ['F', 'Success, however, has created new problems. In the west of the country, farmers complain that large herds now graze on their fields and compete with livestock for grass and water. In 2023 the government allowed a limited reduction of the population in that region, a decision that divided conservationists. Some argued that numbers had become too high for the available land; others warned that the species had collapsed twice within living memory and that its future still depended on just a few populations.'],
        ['G', 'What is clear is that the saiga’s story is not over. Researchers now emphasise the need to keep migration routes free of fences and new roads, since herds that cannot move freely are more exposed to droughts and harsh winters. As one ecologist put it, protecting the saiga means protecting the steppe itself: the animals help to spread seeds and keep the grasses healthy, and the open landscape they need is also home to many other species.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: 'Questions 1-6. Do the following statements agree with the information given in the passage? Choose TRUE, FALSE or NOT GIVEN.',
          items: [
            tf('The saiga’s nose helps the animal to cope with both dust and cold air.', 0, 'A', 'it filters the dust kicked up by the herd during dry summer migrations and warms the freezing air the animal breathes in winter'),
            tf('Protection in the Soviet period failed to increase saiga numbers.', 1, 'B', 'strict protection introduced in the Soviet period allowed numbers to recover'),
            tf('Altyn Dala is the largest protected area in Kazakhstan.', 2, 'C', 'The passage names Altyn Dala as one of several large protected areas but does not compare their sizes.'),
            tf('Satellite collars showed that saiga can cover over 100 kilometres in a day.', 0, 'C', 'the animals could travel more than a hundred kilometres in a single day'),
            tf('The deaths in 2015 were caused by a disease spread by livestock.', 1, 'D', 'At first, poisoning or a disease spread by livestock was suspected. Investigations later concluded that a bacterium normally carried harmlessly by the animals…'),
            tf('Saiga in Mongolia were also affected by the events of 2015.', 2, 'D', 'The passage mentions only central Kazakhstan.'),
          ],
        },
        {
          type: 'bank',
          intro: 'Questions 7-10. Complete the sentences. Choose the correct word, A-H, from the list.',
          options: ['males', 'females', 'twins', 'horns', 'bacterium', 'humidity', 'fences', 'calves'],
          items: [
            gap('Poachers targeted adult ______ because only they have horns.', 0, 'B', 'Because only males carry horns, poachers removed adult males from the herds'),
            gap('The deaths of 2015 seem to have been triggered by high temperature and ______.', 5, 'D', 'The trigger appears to have been unusually high temperature and humidity'),
            gap('The population grew quickly partly because ______ are common.', 2, 'E', 'females can breed in their first year, and twins are common'),
            gap('Researchers want migration routes to stay free of ______ and new roads.', 6, 'G', 'keep migration routes free of fences and new roads'),
          ],
        },
        {
          type: 'mc',
          intro: 'Questions 11-13. Choose the correct letter, A, B, C or D.',
          items: [
            choice('Why were far fewer calves born in the 1990s?', ['Many females died in harsh winters.', 'Poachers removed most of the adult males.', 'Rangers moved the herds to new areas.', 'A disease reduced the number of births.'], 1, 'B', 'poachers removed adult males from the herds so efficiently that in some herds there was only one male for every hundred females, and far fewer calves were born'),
            choice('What happened in 2023?', ['The saiga was listed as Critically Endangered.', 'Hunting of saiga was completely banned.', 'The IUCN improved the saiga’s conservation status.', 'The population fell below one million.'], 2, 'E', 'in 2023 the International Union for Conservation of Nature moved the species from “Critically Endangered” to “Near Threatened”'),
            choice('What is the main purpose of paragraph F?', ['To show that the recovery has led to a new conflict', 'To criticise farmers in western Kazakhstan', 'To argue that the population should be reduced', 'To explain how saiga compete with livestock'], 0, 'F', 'Success, however, has created new problems… a decision that divided conservationists'),
          ],
        },
      ],
    },
    {
      title: 'Finding the Way Without Instruments',
      paras: [
        ['A', 'Long before compasses or satellite navigation, Pacific islanders crossed thousands of kilometres of open ocean in double-hulled canoes, settling islands scattered across an area larger than Asia. For a long time, many Western scholars refused to believe that these voyages had been deliberate. They argued that the islands must have been reached by accident, by canoes blown off course by storms. In the 1960s, a computer simulation of drifting canoes appeared to support this sceptical view, but it also showed something unexpected: drifting alone could not explain how people had reached several of the most remote islands, including Hawaii and New Zealand.'],
        ['B', 'The debate was settled less by argument than by experiment. In 1976 a replica voyaging canoe called Hōkūleʻa sailed from Hawaii to Tahiti, a distance of about 4,000 kilometres, without any modern instruments. Its navigator, Mau Piailug, came from a small island in Micronesia where traditional navigation had never completely died out. The voyage took 33 days, and the canoe arrived exactly where it had intended to arrive.'],
        ['C', 'How was it done? The navigator’s most important tool was a mental model sometimes called a star compass. Stars rise in the east and set in the west at fixed points on the horizon, which change little over a human lifetime. By memorising where dozens of stars rise and set, a navigator could hold a steady course at night, switching to a new star as each one climbed too high in the sky to be useful. During the day, the sun played a similar role, especially near sunrise and sunset.'],
        ['D', 'But the sky is not always clear, and much of the skill lay in reading the sea itself. Ocean swells - long, regular waves generated by distant weather systems - can keep the same direction for days. Experienced navigators could reportedly feel the pattern of several swells crossing each other through the movement of the canoe, sometimes lying down in the hull to sense it better. When an island lies in the path of a swell, it bends and reflects the waves, creating patterns that an expert could interpret long before land was visible.'],
        ['E', 'Knowing the direction is only half of navigation; a navigator must also know how far the canoe has travelled. Micronesian navigators used a remarkable mental technique known as etak. Rather than imagining the canoe moving across a fixed sea, the navigator imagined the canoe as stationary while a reference island, out of sight to one side, moved slowly backwards along the horizon beneath a series of stars. Each time the hidden island “passed” under a new star, a stage of the journey was complete. The method sounds strange to people raised on maps, but it allowed navigators to keep a continuous estimate of their position, even after days at sea and without writing anything down. Some researchers have compared it to the way a modern navigation system updates a moving dot on a screen, except that the entire calculation took place in one person’s memory.'],
        ['F', 'Living things offered further clues. Certain seabirds, such as terns and noddies, sleep on land but fly out to sea to fish during the day. Seeing them heading in a particular direction at dawn or dusk could tell a navigator that an island lay that way, usually within a few dozen kilometres. Clouds also tend to gather over islands, and a greenish tint on the underside of a cloud could signal a shallow lagoon below.'],
        ['G', 'Since the voyage of Hōkūleʻa, a revival of traditional voyaging has spread across the Pacific. New canoes have been built, and young navigators are trained using a combination of the old methods and modern teaching. Training is demanding: apprentices may spend years learning star paths and swell patterns on land before they are allowed to guide a voyage. Between 2014 and 2017, Hōkūleʻa itself sailed around the world. Supporters say the revival is not about rejecting modern technology; rather, it is about recovering knowledge that shows how closely earlier generations observed the natural world - and about restoring pride in a heritage that outsiders once dismissed.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: 'Questions 14-20. Choose the correct heading for each paragraph, A-G, from the list of headings below.',
          options: [
            'A practical test ends a long argument',
            'Using the stars to hold a course',
            'Reading patterns in the water',
            'Doubts about whether the voyages were planned',
            'Clues from birds and clouds',
            'The dangers of sailing in storms',
            'Old knowledge finds a new generation',
            'How the canoes were built',
            'Estimating position without a map',
          ],
          items: [
            head('A', 3, 'many Western scholars refused to believe that these voyages had been deliberate'),
            head('B', 0, 'The debate was settled less by argument than by experiment.'),
            head('C', 1, 'By memorising where dozens of stars rise and set, a navigator could hold a steady course at night'),
            head('D', 2, 'much of the skill lay in reading the sea itself'),
            head('E', 8, 'a navigator must also know how far the canoe has travelled… keep a continuous estimate of their position'),
            head('F', 4, 'Certain seabirds… Clouds also tend to gather over islands'),
            head('G', 6, 'a revival of traditional voyaging… young navigators are trained'),
          ],
        },
        {
          type: 'mc',
          intro: 'Questions 21-23. Choose the correct letter, A, B, C or D.',
          items: [
            choice('What did the computer simulation of the 1960s show?', ['That all Pacific islands were found by accident', 'That drifting could not explain how some remote islands were reached', 'That canoes could not survive storms', 'That the islands were settled from Asia'], 1, 'A', 'drifting alone could not explain how people had reached several of the most remote islands'),
            choice('Why was Mau Piailug able to guide the canoe?', ['He had studied modern navigation.', 'He had sailed to Tahiti before.', 'He came from a place where traditional navigation had survived.', 'He used a secret instrument.'], 2, 'B', 'came from a small island in Micronesia where traditional navigation had never completely died out'),
            choice('In the etak technique, what did the navigator imagine?', ['That the canoe was still and a hidden island moved', 'That the stars moved faster than the canoe', 'A map drawn on the bottom of the canoe', 'That the sea was flowing towards the island'], 0, 'E', 'the navigator imagined the canoe as stationary while a reference island, out of sight to one side, moved slowly backwards'),
          ],
        },
        {
          type: 'tfng',
          intro: 'Questions 24-26. Do the following statements agree with the information given in the passage? Choose TRUE, FALSE or NOT GIVEN.',
          items: [
            tf('The voyage from Hawaii to Tahiti took more than a month.', 0, 'B', 'The voyage took 33 days'),
            tf('Navigators could feel ocean swells only while standing up.', 1, 'D', 'sometimes lying down in the hull to sense it better'),
            tf('The round-the-world voyage of 2014-2017 was paid for by the government of Hawaii.', 2, 'G', 'The passage says when Hōkūleʻa sailed around the world, but not who paid for it.'),
          ],
        },
      ],
    },
    {
      title: 'Should Schools Teach With Games?',
      paras: [
        ['A', 'Few ideas in education have been promoted as enthusiastically as the use of games in the classroom. Supporters claim that games can turn reluctant students into eager learners, provide instant feedback and allow each pupil to progress at his or her own pace. Critics reply that games are expensive, distracting and, at worst, a way of making learning feel like entertainment rather than effort. Both sides, in my view, tend to overstate their case, and the evidence is more interesting than either of them suggests.'],
        ['B', 'It is worth separating two quite different things that are often discussed under the same name. The first is “gamification”: adding points, badges, levels and leaderboards to ordinary tasks. The second is the use of genuine games, in which the learning is built into the rules themselves - for example, a simulation in which students manage a city’s water supply and must understand the science in order to succeed. Confusing the two makes it hard to say whether “games work”, because the answer depends on which of them is meant. The research on these two approaches does not point in the same direction.'],
        ['C', 'Studies of gamification generally find modest benefits, mostly in the short term. Points and badges can encourage students to complete more exercises, especially routine practice that they might otherwise avoid. However, several studies have found that the effect fades once the novelty wears off, and some suggest that rewards can even reduce interest in activities that students already enjoyed. Psychologists have long known that people who are rewarded for doing something they find interesting sometimes lose their enthusiasm for it once the reward stops. This does not mean that points are useless - they are cheap and easy to introduce - but it does mean they should not be treated as a substitute for good teaching.'],
        ['D', 'Well-designed learning games have produced more impressive results in some areas, particularly in mathematics and science, where abstract ideas can be turned into something students can manipulate and test. A student who adjusts the angle of a virtual cannon until the ball lands on target is, in effect, carrying out a series of small experiments. The key word, however, is “well-designed”. A game in which the learning is merely decoration - answer a question, then enjoy thirty seconds of shooting aliens - teaches little beyond the question itself, and the exciting part may actually distract from it.'],
        ['E', 'One frequently overlooked factor is the role of the teacher. In studies where games were most effective, teachers did not simply hand them out and step back. They introduced the game, interrupted it to discuss what students were noticing, and afterwards helped them connect what had happened in the game to the concepts in the curriculum. Without this discussion, students may become skilful at the game without understanding why their strategies work, which limits how far they can apply what they have learned. Short discussions of just five or ten minutes appear to be enough to make a noticeable difference.'],
        ['F', 'Cost is a genuine concern, but it is often misunderstood. The most expensive part of using games is rarely the software itself; it is the teacher time needed to learn the game, plan around it and lead the discussion. Schools that buy games without allowing for this time are, I believe, likely to be disappointed. Several schools in one study reported that games bought with enthusiasm were abandoned within a year, not because students disliked them but because teachers had never been given time to learn them properly. On the other hand, some of the most successful classroom games require no technology at all: card games and board games designed around a single concept can be produced for almost nothing.'],
        ['G', 'So should schools teach with games? The honest answer is: sometimes, and carefully. Games are tools, not methods, and their value depends on what they are asked to do. The question a teacher should ask is not “Is this fun?” but “What will students have to think about in order to win?” If the answer is the subject itself, the game deserves a place in the classroom. If it is something else, students may enjoy themselves, but they will not learn much.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: 'Questions 27-31. Choose the correct letter, A, B, C or D.',
          items: [
            choice('In paragraph A, what does the writer say about supporters and critics of games?', ['Supporters have better evidence.', 'Both groups exaggerate their arguments.', 'Critics are mainly worried about cost.', 'Both groups agree on the main facts.'], 1, 'A', 'Both sides, in my view, tend to overstate their case'),
            choice('What is the main difference between gamification and genuine games?', ['Genuine games are always digital.', 'Gamification is more expensive.', 'In genuine games, the learning is part of the rules.', 'Gamification is used only in science.'], 2, 'B', 'genuine games, in which the learning is built into the rules themselves'),
            choice('According to paragraph C, what can happen when students are rewarded for an activity they already enjoy?', ['They may become less interested in it.', 'They always work harder.', 'They stop doing routine practice.', 'They compete less with each other.'], 0, 'C', 'rewards can even reduce interest in activities that students already enjoyed'),
            choice('The example of the virtual cannon is used to show', ['why students enjoy violent games.', 'how a game can involve real experimenting.', 'that physics is difficult to teach.', 'how expensive simulations are.'], 1, 'D', 'is, in effect, carrying out a series of small experiments'),
            choice('According to the writer, what is usually the most expensive part of using games?', ['Buying the software', 'Buying computers', 'The time teachers need', 'Training students'], 2, 'F', 'it is the teacher time needed to learn the game, plan around it and lead the discussion'),
          ],
        },
        {
          type: 'ynng',
          intro: 'Questions 32-36. Do the following statements agree with the claims of the writer? Choose YES, NO or NOT GIVEN.',
          items: [
            tf('Points and badges should not replace good teaching.', 0, 'C', 'they should not be treated as a substitute for good teaching'),
            tf('The positive effect of points and badges often becomes weaker over time.', 0, 'C', 'the effect fades once the novelty wears off'),
            tf('The exciting parts of a learning game always help students learn.', 1, 'D', 'the exciting part may actually distract from it'),
            tf('Teachers should leave students alone while they play a learning game.', 1, 'E', 'In studies where games were most effective, teachers did not simply hand them out and step back.'),
            tf('Most schools cannot afford learning software.', 2, 'F', 'The writer discusses costs but does not say whether most schools can afford software.'),
          ],
        },
        {
          type: 'bank',
          intro: 'Questions 37-40. Complete the summary. Choose the correct word, A-H, from the list.',
          options: ['introduces', 'curriculum', 'strategies', 'tools', 'rewards', 'software', 'ignores', 'scores'],
          items: [
            gap('Games work best when the teacher ______ them and leads a discussion.', 0, 'E', 'They introduced the game, interrupted it to discuss what students were noticing'),
            gap('The teacher helps students connect the game to concepts in the ______.', 1, 'E', 'helped them connect what had happened in the game to the concepts in the curriculum'),
            gap('Otherwise, students may not understand why their ______ work.', 2, 'E', 'without understanding why their strategies work'),
            gap('The writer concludes that games are ______, not methods.', 3, 'G', 'Games are tools, not methods'),
          ],
        },
      ],
    },
  ],
};

/**
 * Равномерно раскладывает правильные ответы по буквам A-D: варианты переставляются один раз при загрузке,
 * одинаково при каждом открытии (зерно - номер теста). Иначе верный ответ слишком часто оказывался бы под одной буквой.
 */
function balanceLetters(test) {
  const rng = createRng(hashString(test.id));
  const items = test.passages.flatMap((p) => p.groups.filter((g) => g.type === 'mc').flatMap((g) => g.items));
  let targets = [];
  for (const item of items) {
    if (!targets.length) targets = shuffle([0, 1, 2, 3], rng);
    const target = targets.pop();
    const right = item.choices[item.answer];
    const others = item.choices.filter((_, i) => i !== item.answer);
    others.splice(target, 0, right);
    item.choices = others;
    item.answer = target;
  }
  return test;
}

/** Все полные тесты по порядку. */
export const IELTS_TESTS = [IELTS_FULL, TEST_2, TEST_3, TEST_4, TEST_5, TEST_6, TEST_7, TEST_8].map(balanceLetters);
export const testById = (id) => IELTS_TESTS.find((t) => t.id === id) ?? IELTS_TESTS[0];

/** Все вопросы теста по порядку с номерами 1-40: { n, passage, group, item }. */
export function fullQuestions(test = IELTS_FULL) {
  const out = [];
  test.passages.forEach((passage, pi) =>
    passage.groups.forEach((group, gi) =>
      group.items.forEach((item) => out.push({ n: out.length + 1, passage: pi, group: gi, type: group.type, item, options: group.options })),
    ),
  );
  return out;
}

/** Число слов в тексте (для проверки, что тексты длинные, как на экзамене). */
export const passageWords = (passage) => passage.paras.reduce((s, [, text]) => s + text.split(/\s+/).filter(Boolean).length, 0);
