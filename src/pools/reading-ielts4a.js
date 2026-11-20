// Дополнительные тексты IELTS Reading (авторские): True / False / Not Given и вопросы с выбором ответа.
import { mcx, tfx } from './reading-kit.js';

export const IELTS_MORE4A = [
  {
    id: 'tulip',
    title: 'The Journey of the Tulip',
    text:
      'Many people associate tulips with the Netherlands, but the flower began its journey in the mountains of Central Asia. Wild tulips still grow on the slopes of the Tian Shan, and several species are native to the steppes of Kazakhstan. Over centuries, travelers carried the bulbs westward along trade routes. By the sixteenth century, tulips were treasured in the gardens of the Ottoman court, where gardeners developed elegant varieties with long, narrow petals.\n' +
      'In the 1590s, tulip bulbs reached the Dutch city of Leiden, and their popularity grew quickly. In the 1630s, prices for rare bulbs rose to extraordinary levels, and a single bulb could be worth more than a house. This episode, known as "tulip mania", ended suddenly in 1637 when buyers stopped paying the high prices. Today the Netherlands remains the world’s largest exporter of tulips, but botanists still travel to Central Asia to study the wild species.',
    qs: [
      tfx('Tulips originally come from the Netherlands.', 'F', 'the flower began its journey in the mountains of Central Asia'),
      tfx('Wild tulips can still be found in the Tian Shan.', 'T', 'Wild tulips still grow on the slopes of the Tian Shan'),
      tfx('Ottoman gardeners were the first people to grow tulips in pots.', 'N'),
      mcx('What happened to tulip prices in the 1630s?', ['They rose so high that one bulb could cost more than a house.', 'They fell to almost nothing.', 'They stayed the same.', 'They were fixed by the government.'], 'a single bulb could be worth more than a house'),
      mcx('What does the writer say botanists still do?', ['Travel to Central Asia to study wild species', 'Export tulips from Leiden', 'Buy rare bulbs in Istanbul', 'Teach Dutch gardeners'], 'botanists still travel to Central Asia to study the wild species'),
    ],
  },
  {
    id: 'paper',
    title: 'How Paper Conquered the World',
    text:
      'Before paper, people wrote on clay, bamboo, silk and animal skin. According to Chinese records, an official named Cai Lun presented an improved form of paper to the emperor around the year 105. It was made from tree bark, old rags and fishing nets, which were soaked, pounded and spread out to dry. The process was cheap, and paper soon replaced silk and bamboo in China.\n' +
      'For centuries the method was kept within China. It reached Central Asia in the eighth century, and Samarkand became one of the most famous paper-making centers in the Islamic world. From there, knowledge of paper-making spread to the Middle East and North Africa, and paper mills appeared in Spain in the twelfth century. Printing later increased demand, and by the fifteenth century Europe was producing paper on a large scale. Today, wood pulp has replaced rags as the main raw material.',
    qs: [
      tfx('Paper was made from only one kind of material in ancient China.', 'F', 'It was made from tree bark, old rags and fishing nets'),
      tfx('Samarkand was a major center of paper-making.', 'T', 'Samarkand became one of the most famous paper-making centers in the Islamic world'),
      tfx('Cai Lun was rewarded with land by the emperor.', 'N'),
      mcx('When did paper-making reach Central Asia?', ['In the eighth century', 'Around the year 105', 'In the twelfth century', 'In the fifteenth century'], 'It reached Central Asia in the eighth century'),
      mcx('What is the main raw material of paper today?', ['Wood pulp', 'Old rags', 'Silk', 'Bamboo'], 'wood pulp has replaced rags as the main raw material'),
    ],
  },
  {
    id: 'marathon',
    title: 'The Marathon: Legend and Distance',
    text:
      'The marathon takes its name from a Greek legend. According to the story, a messenger ran from the battlefield of Marathon to Athens in 490 BC to announce a victory over the Persians. Historians doubt that the run happened exactly in this way, but the tale inspired the organizers of the first modern Olympic Games, held in Athens in 1896, to include a long-distance race.\n' +
      'The distance of that first race was about 40 kilometers. The familiar length of 42.195 kilometers came from the 1908 Olympic Games in London, where the course was arranged so that it began near a royal castle and ended in front of the royal box in the stadium. The distance was officially adopted as the standard in 1921. Today, hundreds of thousands of people run marathons every year, and many cities organize races that attract amateurs as well as professional athletes.',
    qs: [
      tfx('The first modern Olympic marathon was held in 1896.', 'T', 'the first modern Olympic Games, held in Athens in 1896'),
      tfx('All historians agree that the legendary run happened exactly as the story says.', 'F', 'Historians doubt that the run happened exactly in this way'),
      tfx('The 1908 course was designed by a famous architect.', 'N'),
      mcx('Why is the marathon 42.195 kilometers long?', ['It came from the arrangement of the 1908 London course.', 'It was the distance from Marathon to Athens.', 'It was chosen by the Persians.', 'It was set in 1896.'], 'The familiar length of 42.195 kilometers came from the 1908 Olympic Games in London'),
      mcx('When was the distance officially adopted as the standard?', ['In 1921', 'In 1896', 'In 1908', 'In 490 BC'], 'The distance was officially adopted as the standard in 1921'),
    ],
  },
  {
    id: 'reef',
    title: 'The Great Barrier Reef',
    text:
      'The Great Barrier Reef, off the coast of Queensland in Australia, is the largest coral reef system on Earth. It stretches for more than 2,300 kilometers and is made up of thousands of individual reefs and hundreds of islands. The reef is visible from space and is home to a huge variety of life, including more than 1,500 species of fish and several kinds of sea turtle.\n' +
      'Corals are small animals that live in partnership with tiny algae. The algae give the coral its color and provide food, and the coral gives the algae a safe home. When the water becomes too warm, the algae leave and the coral turns white, a process called bleaching. Severe bleaching events hit the reef in 2016 and 2017. Scientists say that bleached coral can recover if the water cools quickly, but repeated events make recovery harder. Tourism is also an important part of the local economy, and visitors are asked to follow strict rules to protect the reef.',
    qs: [
      tfx('The Great Barrier Reef is made up of a single large reef.', 'F', 'made up of thousands of individual reefs and hundreds of islands'),
      tfx('Corals live in partnership with algae.', 'T', 'Corals are small animals that live in partnership with tiny algae'),
      tfx('Visitors are no longer allowed to swim on the reef.', 'N'),
      mcx('What causes coral bleaching?', ['Water that becomes too warm', 'Too many fish', 'Strong winds', 'Heavy rainfall'], 'When the water becomes too warm, the algae leave'),
      mcx('What do scientists say about bleached coral?', ['It can recover if the water cools quickly.', 'It can never recover.', 'It turns green after a year.', 'It grows faster than normal coral.'], 'bleached coral can recover if the water cools quickly'),
    ],
  },
  {
    id: 'yawn',
    title: 'Why Do We Yawn?',
    text:
      'Yawning is one of the most common human behaviors, yet scientists still do not fully understand it. For a long time, people believed that yawning brought extra oxygen to the body. Experiments, however, have shown that breathing air rich in oxygen does not reduce yawning, so this explanation is now considered unlikely.\n' +
      'A more recent idea is that yawning helps to cool the brain. A deep breath of air and the stretching of the jaw increase blood flow around the head, and the cooler air may lower the temperature of the brain. Supporting this theory, one study found that people yawned less often when they held a cold pack against their foreheads. Yawning is also contagious: seeing or hearing someone yawn often makes others do the same. Contagious yawning appears in children from around the age of four and may be linked to empathy, although research on this question continues.',
    qs: [
      tfx('Scientists fully understand why people yawn.', 'F', 'scientists still do not fully understand it'),
      tfx('Breathing air rich in oxygen does not reduce yawning.', 'T', 'breathing air rich in oxygen does not reduce yawning'),
      tfx('Animals yawn more often than humans.', 'N'),
      mcx('What did one study find about cold packs?', ['People yawned less often when they held one on the forehead.', 'People yawned more often.', 'People stopped breathing deeply.', 'People felt less empathy.'], 'people yawned less often when they held a cold pack against their foreheads'),
      mcx('When does contagious yawning start to appear?', ['From around the age of four', 'At birth', 'In old age', 'Only among adults'], 'Contagious yawning appears in children from around the age of four'),
    ],
  },
  {
    id: 'microplastics',
    title: 'Tiny Plastic, Big Problem',
    text:
      'Microplastics are pieces of plastic smaller than five millimeters. Some are made on purpose, for example the tiny beads once added to certain cosmetics. Most, however, come from larger items that break down: plastic bags, bottles and fishing nets slowly fragment under sunlight and waves. Washing synthetic clothes also releases tiny fibers into wastewater.\n' +
      'Because they are so small, microplastics are eaten by plankton, shellfish and fish, and they have been found in remote places, from deep ocean trenches to mountain snow. Scientists are still studying how they affect living things. Some laboratory experiments show that animals eating large amounts of plastic grow more slowly, but it is not yet clear how much harm the particles cause in nature. Researchers recommend reducing single-use plastics, installing filters in washing machines and improving waste collection, since cleaning microplastics from the sea is almost impossible once they have spread.',
    qs: [
      tfx('Microplastics are pieces of plastic smaller than five millimeters.', 'T', 'pieces of plastic smaller than five millimeters'),
      tfx('Most microplastics are made deliberately by manufacturers.', 'F', 'Most, however, come from larger items that break down'),
      tfx('Microplastics have been found in the blood of all humans.', 'N'),
      mcx('Why is it hard to clean microplastics from the sea?', ['They are very small and widely spread.', 'They are very heavy.', 'They dissolve in water.', 'They are protected by law.'], 'cleaning microplastics from the sea is almost impossible once they have spread'),
      mcx('What do some laboratory experiments show?', ['Animals eating much plastic grow more slowly.', 'Plastic helps plankton grow.', 'Fish prefer plastic to food.', 'Plastic improves water quality.'], 'animals eating large amounts of plastic grow more slowly'),
    ],
  },
  {
    id: 'rivers-silt',
    title: 'The Gift of the River',
    text:
      'For thousands of years, the Nile flooded each summer, covering the land on its banks with a layer of dark, fertile silt. Farmers in ancient Egypt planned their year around the flood, sowing seeds as the water retreated and harvesting before the next rise. The reliable cycle allowed them to grow more food than they needed, and the surplus supported priests, builders and scribes.\n' +
      'In 1970, the completion of the Aswan High Dam changed this pattern. The dam stores water in a large lake and releases it steadily, which protects towns from floods and provides electricity. However, the silt now settles behind the dam instead of reaching the fields, so farmers use artificial fertilizers. The river’s delta, no longer replenished with new silt, is slowly shrinking and being eroded by the sea. Engineers and environmentalists continue to debate whether the benefits of the dam outweigh these costs.',
    qs: [
      tfx('Ancient Egyptian farmers harvested their crops before the next flood.', 'T', 'harvesting before the next rise'),
      tfx('The Aswan High Dam was completed in 1950.', 'F', 'In 1970, the completion of the Aswan High Dam'),
      tfx('The dam was built with foreign money.', 'N'),
      mcx('Why do farmers now use artificial fertilizers?', ['The silt settles behind the dam.', 'The river no longer exists.', 'Floods are too frequent.', 'The soil is too salty.'], 'the silt now settles behind the dam instead of reaching the fields'),
      mcx('What is happening to the Nile delta?', ['It is slowly shrinking.', 'It is growing quickly.', 'It is being covered by silt.', 'It has dried up completely.'], 'is slowly shrinking and being eroded by the sea'),
    ],
  },
  {
    id: 'silk-worm',
    title: 'The Secret of Silk',
    text:
      'Silk is made by the caterpillar of the silk moth, which spins a cocoon from a single thread that can be almost a kilometer long. According to a Chinese legend, an empress discovered silk when a cocoon fell into her tea and began to unwind. Whatever the truth, Chinese farmers learned to raise silkworms on mulberry leaves and to unwind the cocoons carefully, and for thousands of years they kept the method secret.\n' +
      'Silk became one of the most valuable goods on the trade routes that later came to be called the Silk Road. Rulers in Rome and the Middle East paid high prices for it. The secret escaped around the sixth century, when, according to the historian Procopius, monks brought silkworm eggs to the Byzantine Empire hidden inside hollow canes. Silk production then spread to other regions. Today China remains the largest producer, followed by India, and modern fabrics made from synthetic fibers imitate silk at a lower cost.',
    qs: [
      tfx('A silk cocoon is made from a single thread.', 'T', 'spins a cocoon from a single thread'),
      tfx('The method of making silk was shared openly from the beginning.', 'F', 'for thousands of years they kept the method secret'),
      tfx('The Byzantine rulers paid the monks a large sum of gold.', 'N'),
      mcx('What do silkworms feed on?', ['Mulberry leaves', 'Rice', 'Bamboo', 'Cotton'], 'raise silkworms on mulberry leaves'),
      mcx('How did silkworm eggs reach the Byzantine Empire, according to Procopius?', ['Monks hid them inside hollow canes.', 'Merchants traded them openly.', 'An empress sent them as a gift.', 'Soldiers captured them in battle.'], 'monks brought silkworm eggs to the Byzantine Empire hidden inside hollow canes'),
    ],
  },
];
