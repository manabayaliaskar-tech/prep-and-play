// IELTS Academic Reading · Test 5: мангровые леса, история бумаги, польза скуки.

import { INTRO, choice, gap, head, tf } from './kit.js';

export const TEST_5 = {
  id: 'academic-5',
  title: 'IELTS Academic Reading · Test 5',
  passages: [
    {
      title: 'Forests Between Land and Sea',
      paras: [
        ['A', 'Along many tropical and subtropical coastlines, where rivers meet the sea and the tide rises and falls twice a day, grows one of the world’s most unusual types of forest. Mangroves are trees and shrubs that can live in salty water and in soft, oxygen-poor mud that would kill most other plants. They are found in more than a hundred countries, from the Sundarbans of Bangladesh and India — the largest single mangrove forest on Earth — to the coasts of West Africa, northern Australia and the Caribbean. For a long time they were dismissed as useless swamps. Today they are recognised as some of the most valuable ecosystems on the planet.'],
        ['B', 'Surviving in such conditions requires remarkable adaptations. Some mangrove species filter out most of the salt at their roots; others take it in and then get rid of it through special glands on their leaves, where crystals of salt can sometimes be seen. Because the mud contains so little oxygen, many mangroves have developed roots that grow upwards out of the ground, like pencils pointing at the sky, and allow air to reach the underground roots. Others stand on arching prop roots that hold the tree steady in shifting mud. Even their seeds are unusual: in several species, they begin to grow while still attached to the parent tree, then drop into the water and float until they reach suitable mud.'],
        ['C', 'These forests provide a surprising range of services to people. The tangled roots form sheltered nurseries for young fish, crabs and shrimps, many of which later move out to the open sea, supporting fisheries far beyond the forest itself. Local communities collect wood, honey and other products. Mangroves also trap sediment carried by rivers, which helps to keep coastal water clear and protects nearby coral reefs and seagrass beds. In many poor coastal areas, the forest is effectively a free source of food, fuel and income.'],
        ['D', 'Perhaps their best-known role is as a natural defence against the sea. A belt of mangroves can reduce the height and energy of waves, protecting villages and farmland from storms and erosion. After major cyclones and tsunamis, observers have reported that areas behind healthy mangrove forests often suffered less damage than unprotected coasts nearby, although the degree of protection depends on the width of the forest and the strength of the event. Replacing this protection with concrete sea walls would be extremely expensive, and walls, unlike forests, do not repair themselves.'],
        ['E', 'Mangroves are also of great interest to climate scientists. Because their waterlogged soils contain little oxygen, dead leaves and roots decompose very slowly, and carbon builds up in the mud over centuries. As a result, a hectare of mangrove forest can store several times more carbon than a hectare of many inland forests, most of it below ground. When mangroves are cleared and the soil is exposed, much of this stored carbon can be released into the atmosphere. Carbon stored in coastal ecosystems such as mangroves, salt marshes and seagrasses has become known as “blue carbon”.'],
        ['F', 'Despite their value, mangroves have been lost on a large scale. In recent decades, large areas have been cleared for shrimp farms, rice fields, tourism and coastal development, and in some countries more than half of the original mangrove area has disappeared. Pollution and changes in the flow of rivers have also damaged many forests. The rate of loss has slowed in recent years, partly because governments have become more aware of the benefits that mangroves provide.'],
        ['G', 'Restoration, however, has proved more difficult than simply planting trees. Many early projects planted seedlings on open mudflats or in places where mangroves had never grown, and most of the young trees died. Experts now emphasise that the first step should be to restore the right conditions, especially the natural flow of tidal water, which has often been blocked by embankments and abandoned ponds. Where the conditions are right, mangroves frequently return by themselves, as seeds carried by the tide find suitable places to take root.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: INTRO.tfng(1, 6),
          items: [
            tf('The Sundarbans is the largest single mangrove forest in the world.', 0, 'A', 'the largest single mangrove forest on Earth'),
            tf('All mangrove species remove salt in the same way.', 1, 'B', 'Some mangrove species filter out most of the salt at their roots; others take it in and then get rid of it'),
            tf('Mangrove seeds can start growing before they fall from the tree.', 0, 'B', 'they begin to grow while still attached to the parent tree'),
            tf('Young fish raised among mangrove roots never leave the forest.', 1, 'C', 'many of which later move out to the open sea'),
            tf('Mangrove honey sells for a higher price than other honey.', 2, 'C', 'The passage mentions honey as a product but says nothing about its price.'),
            tf('The rate of mangrove loss has increased in recent years.', 1, 'F', 'The rate of loss has slowed in recent years'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSentences(7, 10, 'H'),
          options: ['sediment', 'oxygen', 'glands', 'carbon', 'shrimp', 'embankments', 'cyclones', 'pencils'],
          items: [
            gap('Mangroves trap ______ carried by rivers, which keeps coastal water clear.', 0, 'C', 'Mangroves also trap sediment carried by rivers'),
            gap('Dead leaves decompose slowly because the soil contains little ______.', 1, 'E', 'Because their waterlogged soils contain little oxygen'),
            gap('Large areas of mangroves have been cleared for ______ farms.', 4, 'F', 'cleared for shrimp farms'),
            gap('The flow of tidal water has often been blocked by ______ and abandoned ponds.', 5, 'G', 'blocked by embankments and abandoned ponds'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(11, 13),
          items: [
            choice('Why do some mangroves have roots that grow upwards out of the ground?', ['To catch falling seeds', 'To let air reach the roots below ground', 'To store salt', 'To attract fish'], 1, 'B', 'allow air to reach the underground roots'),
            choice('What does the writer say about the protection mangroves gave during cyclones and tsunamis?', ['It was the same everywhere.', 'It depended on the width of the forest and the strength of the event.', 'It was greater than that of concrete walls.', 'It has never been observed.'], 1, 'D', 'the degree of protection depends on the width of the forest and the strength of the event'),
            choice('Why did many early restoration projects fail?', ['There were not enough seedlings.', 'The seedlings were planted in unsuitable places.', 'Local people removed the trees.', 'The water was too cold.'], 1, 'G', 'planted seedlings on open mudflats or in places where mangroves had never grown, and most of the young trees died'),
          ],
        },
      ],
    },
    {
      title: 'The Long Road of Paper',
      paras: [
        ['A', 'Few inventions have done as much to spread knowledge as paper, yet its origins are surprisingly modest. According to Chinese historical records, in the year 105 CE a court official named Cai Lun presented the emperor with a new writing material made from tree bark, old rags, hemp and fishing nets. For centuries, Cai Lun was celebrated as the inventor of paper. Archaeological discoveries have since complicated this story: fragments of paper found in north-western China date from as early as the second century BCE, long before Cai Lun’s lifetime. Most historians now believe that he improved and standardised an existing process rather than inventing it from nothing.'],
        ['B', 'Whatever its exact origins, paper had clear advantages over the alternatives. Bamboo and wooden strips, widely used in China, were heavy and bulky; silk was light and smooth but very expensive. Paper combined lightness with low cost, since it could be made from cheap or waste materials. The basic method was simple: plant fibres were soaked and beaten into a pulp, which was mixed with water; a screen was dipped into the mixture and lifted out, leaving a thin layer of fibres that dried into a sheet. With small refinements, this method remained in use for well over a thousand years. Chinese papermakers also experimented with many different plant fibres, producing papers of different colours and textures for writing, painting and even clothing.'],
        ['C', 'Paper reached Korea and Japan by the seventh century, and it was also known in Central Asia at an early date. A famous story connects its spread westwards with the Battle of Talas in 751, when forces of the Abbasid Caliphate defeated a Tang Chinese army near the river Talas, in what is now Kazakhstan and Kyrgyzstan. According to this account, Chinese prisoners taken in the battle taught the art of papermaking in Samarkand, which soon became famous for its paper. Many historians now doubt that the prisoners played such a decisive role, pointing out that paper was probably already being made in the region before 751. The story remains popular, however, because it neatly explains how a Chinese technology arrived in the Islamic world.'],
        ['D', 'What is certain is that papermaking flourished in the Islamic world. By the end of the eighth century there was a paper mill in Baghdad, and paper soon became the standard material for government records, scholarship and literature. Its availability helped to support a remarkable growth in book production and libraries, and ideas from mathematics, medicine and astronomy circulated more widely than ever before. Papermakers in the Middle East also developed new techniques, such as using water power to beat the fibres, which made production faster and more reliable. Arabic manuscripts on paper were produced in such numbers that some libraries of the period are said to have held tens of thousands of volumes.'],
        ['E', 'Europe adopted paper relatively late. The first European paper mills appeared in Islamic Spain in the eleventh and twelfth centuries, and papermaking spread to Italy in the thirteenth century. Italian papermakers introduced important innovations, including watermarks — designs pressed into the paper during manufacture, which identified the mill that had produced it. At first, many Europeans regarded paper as less durable than parchment, which was made from animal skin. Yet its lower cost proved decisive, especially after the invention of the printing press in the fifteenth century created an enormous demand for cheap material.'],
        ['F', 'For most of its history, European paper was made from old linen and cotton rags, and the supply of rags could not keep up with growing demand. In the nineteenth century, inventors developed methods for making paper from wood pulp, which made paper far cheaper and allowed the mass production of newspapers and books. This success came with a hidden problem. Much paper made from wood pulp in the nineteenth and twentieth centuries was acidic, and it gradually turns yellow and brittle. Today, libraries and archives spend large sums trying to preserve such documents, while many older books printed on rag paper remain in remarkably good condition.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: INTRO.heading(14, 19, 'F'),
          options: [
            'A cheaper material with a hidden weakness',
            'A doubtful but popular story',
            'Questioning a famous inventor',
            'The decline of papermaking in China',
            'Advantages over earlier writing materials',
            'A late arrival in Europe',
            'Paper and the growth of learning',
            'Why paper is stronger than parchment',
          ],
          items: [
            head('A', 2, 'For centuries, Cai Lun was celebrated as the inventor of paper. Archaeological discoveries have since complicated this story'),
            head('B', 4, 'paper had clear advantages over the alternatives'),
            head('C', 1, 'Many historians now doubt that the prisoners played such a decisive role'),
            head('D', 6, 'ideas from mathematics, medicine and astronomy circulated more widely than ever before'),
            head('E', 5, 'Europe adopted paper relatively late.'),
            head('F', 0, 'This success came with a hidden problem.'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(20, 23),
          items: [
            choice('What do most historians now believe about Cai Lun?', ['He invented paper from nothing.', 'He never existed.', 'He improved and standardised an existing process.', 'He brought paper from Central Asia.'], 2, 'A', 'he improved and standardised an existing process rather than inventing it from nothing'),
            choice('What was the main advantage of paper over silk?', ['It was much cheaper.', 'It was smoother.', 'It lasted longer.', 'It was easier to colour.'], 0, 'B', 'silk was light and smooth but very expensive. Paper combined lightness with low cost'),
            choice('Why do many historians doubt the story about the Battle of Talas?', ['The battle never took place.', 'Paper was probably already made in the region before 751.', 'The prisoners were not Chinese.', 'Samarkand never produced paper.'], 1, 'C', 'paper was probably already being made in the region before 751'),
            choice('What was the purpose of watermarks?', ['To make paper stronger', 'To decorate books', 'To show which mill had made the paper', 'To protect paper from water'], 2, 'E', 'which identified the mill that had produced it'),
          ],
        },
        {
          type: 'tfng',
          intro: INTRO.tfng(24, 26),
          items: [
            tf('The Battle of Talas took place in what is now Kazakhstan and Kyrgyzstan.', 0, 'C', 'near the river Talas, in what is now Kazakhstan and Kyrgyzstan'),
            tf('Europeans immediately preferred paper to parchment.', 1, 'E', 'At first, many Europeans regarded paper as less durable than parchment'),
            tf('The first paper mill in Baghdad was built by Chinese workers.', 2, 'D', 'The passage says there was a mill in Baghdad but not who built it.'),
          ],
        },
      ],
    },
    {
      title: 'In Defence of Boredom',
      paras: [
        ['A', 'Boredom has a poor reputation. Parents try to prevent it, schools worry about it, and an entire industry of apps and entertainment exists to make sure that we never have to experience it. With a smartphone in every pocket, it has become possible to escape even the shortest moment of empty time, whether in a queue, on a bus or in a waiting room. Yet I would like to suggest that this constant escape may come at a price, and that boredom, uncomfortable as it is, deserves a more balanced judgement. Before we decide that boredom must always be avoided, we should ask what it is, why we feel it and whether it might sometimes be useful.'],
        ['B', 'It is important first to be clear about what boredom is. Psychologists generally describe it as an unpleasant state in which we want to be engaged in something satisfying but cannot find anything to engage with. It is not the same as relaxation, which is pleasant, or as apathy, in which we do not want anything at all. Boredom is restless: it contains a desire for change. Seen in this way, it resembles other unpleasant feelings, such as hunger or pain, which exist precisely because they push us to act.'],
        ['C', 'Chronic boredom is certainly a problem. People who are often bored are more likely to report anxiety and depression, to perform poorly at school or work, and to engage in risky behaviour such as gambling or dangerous driving. Boredom at work has been linked to mistakes and accidents in jobs that require constant monitoring, such as checking security screens. Nobody, therefore, should argue that more boredom is always better. The question is whether occasional, short-lived boredom has any value, or whether it is simply an unpleasant experience to be removed as quickly as possible.'],
        ['D', 'There is some evidence that it does. In one frequently cited experiment published in 2014, participants who first completed a deliberately dull task, such as copying numbers from a telephone directory, later produced more creative ideas when asked to think of unusual uses for everyday objects than participants who had not done the dull task. The researchers suggested that boredom encourages the mind to wander and to seek stimulation in new directions. The effect in such studies is modest, and not every experiment has found it, but it fits with many personal accounts of ideas arriving during idle moments.'],
        ['E', 'Boredom may also play a role in helping us to recognise when something needs to change. A pupil who is bored in class may be telling the teacher that the work is too easy or too disconnected from anything meaningful; an adult who is bored at work may be receiving a signal that their abilities are not being used. If we always silence that signal with entertainment, we may never act on what it is trying to tell us. In this sense, boredom can be the starting point for useful changes, from choosing a new course of study to looking for more meaningful work.'],
        ['F', 'This is where smartphones become relevant. The problem is not that phones are entertaining, but that they make it so easy to escape the first few seconds of discomfort that we never discover what might have followed. A child who is never allowed to be bored may also have fewer opportunities to learn how to occupy themselves, to invent games or simply to think. I am not suggesting that parents should deliberately make their children’s lives dull, but rather that they need not rush to fill every empty moment.'],
        ['G', 'In the end, boredom is best understood as a message rather than an enemy. Like hunger, it can be ignored, satisfied wisely or satisfied badly. Occasionally allowing ourselves to feel it — on a walk without headphones, or a journey without a screen — may give the mind the space it needs to wander, plan and create. The aim is not to seek out boredom, but to stop treating every moment of it as an emergency. A few minutes of doing nothing is not wasted time; it may be one of the few moments in a busy day when our thoughts are truly our own.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: INTRO.mc(27, 31),
          items: [
            choice('How is boredom different from relaxation, according to the writer?', ['Boredom is unpleasant and includes a desire for change.', 'Boredom lasts longer.', 'Relaxation makes us restless.', 'There is no real difference.'], 0, 'B', 'It is not the same as relaxation, which is pleasant… Boredom is restless: it contains a desire for change.'),
            choice('Why does the writer compare boredom with hunger or pain?', ['They are all signs of illness.', 'They all push us to act.', 'They are all easy to ignore.', 'They all disappear with sleep.'], 1, 'B', 'which exist precisely because they push us to act'),
            choice('What did participants in the 2014 experiment do after the dull task?', ['They refused to continue.', 'They produced more creative ideas.', 'They made more mistakes.', 'They became anxious.'], 1, 'D', 'later produced more creative ideas'),
            choice('According to paragraph E, what may boredom at work signal?', ['That a person needs a holiday', 'That a person’s abilities are not being used', 'That the work is too difficult', 'That colleagues are unfriendly'], 1, 'E', 'a signal that their abilities are not being used'),
            choice('What is the writer’s main concern about smartphones?', ['They are too expensive for children.', 'They damage eyesight.', 'They make it too easy to escape the first moments of discomfort.', 'They are used mainly for games.'], 2, 'F', 'they make it so easy to escape the first few seconds of discomfort that we never discover what might have followed'),
          ],
        },
        {
          type: 'ynng',
          intro: INTRO.ynng(32, 36),
          items: [
            tf('People who are often bored are more likely to take risks.', 0, 'C', 'to engage in risky behaviour such as gambling or dangerous driving'),
            tf('More boredom is always better for people.', 1, 'C', 'Nobody, therefore, should argue that more boredom is always better.'),
            tf('Every experiment has shown that boredom increases creativity.', 1, 'D', 'not every experiment has found it'),
            tf('Children today are more bored than children fifty years ago.', 2, 'F', 'The writer does not compare children of different generations.'),
            tf('Parents do not need to fill every empty moment of a child’s day.', 0, 'F', 'they need not rush to fill every empty moment'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSummary(37, 40, 'H'),
          options: ['message', 'change', 'directory', 'signal', 'headphones', 'emergency', 'apathy', 'screens'],
          items: [
            gap('Unlike apathy, boredom contains a desire for ______.', 1, 'B', 'it contains a desire for change'),
            gap('In the experiment, participants copied numbers from a telephone ______.', 2, 'D', 'copying numbers from a telephone directory'),
            gap('The writer sees boredom as a ______ rather than an enemy.', 0, 'G', 'boredom is best understood as a message rather than an enemy'),
            gap('We should stop treating every moment of boredom as an ______.', 5, 'G', 'to stop treating every moment of it as an emergency'),
          ],
        },
      ],
    },
  ],
};
