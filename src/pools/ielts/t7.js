// IELTS Academic Reading · Test 7: соль в истории, история вакцин, возвращение музейных экспонатов.

import { INTRO, choice, gap, head, tf } from './kit.js';

export const TEST_7 = {
  id: 'academic-7',
  title: 'IELTS Academic Reading · Test 7',
  passages: [
    {
      title: 'The Mineral That Shaped History',
      paras: [
        ['A', 'Salt is so cheap and so common today that it is easy to forget how valuable it once was. Every human being needs a small amount of sodium to survive, and before refrigeration, salt was the most important way of preserving food. Meat and fish packed in salt could be kept for months, making it possible to survive long winters, feed armies and supply ships on long voyages. For thousands of years, therefore, control of salt meant control of something that people simply could not live without.'],
        ['B', 'Salt was obtained in three main ways. Along warm coastlines, seawater was let into shallow ponds and left to evaporate in the sun, leaving crystals behind. In colder or inland regions, water from salty springs was boiled over fires, which required enormous quantities of fuel. In other places, salt was mined from underground deposits left behind by ancient seas. Some of these mines became famous; the salt mine at Wieliczka in Poland, which was worked for about seven hundred years, contains underground chapels carved entirely from rock salt by the miners.'],
        ['C', 'Because salt was essential and could be produced only in certain places, it was an ideal object of taxation. In ancient China, the state took control of salt production and sale, and the income from salt became one of the government’s most important sources of revenue for many centuries. In France, a hated salt tax known as the gabelle required people in some regions to buy a fixed amount of salt each year at a price set by the government. The tax varied greatly between provinces, which encouraged widespread smuggling, and its unpopularity contributed to the anger that led to the French Revolution in 1789.'],
        ['D', 'Salt also shaped the routes along which goods and people moved. Caravans crossed the Sahara carrying blocks of salt from desert mines southwards, where salt was scarce and could be exchanged for gold and other goods. Many towns in Europe grew up near salt sources or along roads used to transport it. It is often said that the English word “salary” comes from a payment Roman soldiers received to buy salt. The connection between the two words is real, but historians point out that there is little direct evidence that soldiers were actually paid in salt.'],
        ['E', 'In the twentieth century, salt became the focus of one of the most famous acts of political protest. In 1930, Mahatma Gandhi led a march of some 385 kilometres to the coastal village of Dandi in India to make salt from seawater, in defiance of a British law that gave the colonial government a monopoly over salt production and taxed it heavily. The march attracted international attention, and thousands of Indians followed his example. Gandhi had chosen salt deliberately: as a necessity used by everyone, rich and poor, it showed clearly how colonial laws affected ordinary lives.'],
        ['F', 'Today, the role of salt has changed almost completely. Refrigeration and other methods of preservation have greatly reduced its importance for storing food, and modern production has made it cheap. Surprisingly, only a small proportion of the salt produced worldwide is eaten. Most is used by the chemical industry, for example to make chlorine and sodium hydroxide, and in cold countries large amounts are spread on roads in winter to melt ice. The mineral that once paid for empires is now, for most people, something they hardly notice.'],
        ['G', 'The salt that people do eat has become a health concern. Diets high in salt are linked to high blood pressure, which increases the risk of heart disease and strokes. The World Health Organization recommends that adults eat less than five grams of salt a day, but in many countries average consumption is much higher. Most of this salt does not come from the salt shaker on the table but is already present in bread, processed meat, sauces and ready meals. As a result, many governments now encourage food manufacturers to reduce gradually the amount of salt in their products.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: INTRO.tfng(1, 6),
          items: [
            tf('Meat and fish preserved with salt could be kept for months.', 0, 'A', 'Meat and fish packed in salt could be kept for months'),
            tf('Boiling water from salty springs required a lot of fuel.', 0, 'B', 'which required enormous quantities of fuel'),
            tf('Salt from evaporation ponds was purer than salt from mines.', 2, 'B', 'The passage describes both methods but does not compare the purity of the salt.'),
            tf('The gabelle was the same in every French province.', 1, 'C', 'The tax varied greatly between provinces'),
            tf('Historians have found strong evidence that Roman soldiers were paid in salt.', 1, 'D', 'there is little direct evidence that soldiers were actually paid in salt'),
            tf('Gandhi’s march ended at a village on the coast.', 0, 'E', 'to the coastal village of Dandi'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSentences(7, 10, 'H'),
          options: ['chapels', 'smuggling', 'gold', 'monopoly', 'chlorine', 'bread', 'fuel', 'caravans'],
          items: [
            gap('Miners at Wieliczka carved underground ______ out of rock salt.', 0, 'B', 'contains underground chapels carved entirely from rock salt by the miners'),
            gap('Differences in the gabelle between provinces encouraged ______.', 1, 'C', 'which encouraged widespread smuggling'),
            gap('South of the Sahara, salt could be exchanged for ______.', 2, 'D', 'could be exchanged for gold and other goods'),
            gap('The chemical industry uses salt to make ______ and sodium hydroxide.', 4, 'F', 'to make chlorine and sodium hydroxide'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(11, 13),
          items: [
            choice('Why was salt an ideal object of taxation?', ['It was easy to measure.', 'It was essential and produced only in certain places.', 'It was mainly bought by the rich.', 'It could not be smuggled.'], 1, 'C', 'Because salt was essential and could be produced only in certain places'),
            choice('Why did Gandhi choose salt for his protest?', ['It was a necessity used by everyone.', 'It was the most expensive product in India.', 'It was produced only by the British.', 'It was easy to carry on a long march.'], 0, 'E', 'as a necessity used by everyone, rich and poor'),
            choice('Where does most of the salt in modern diets come from?', ['The salt shaker on the table', 'Drinking water', 'Foods such as bread, sauces and ready meals', 'Fresh fruit and vegetables'], 2, 'G', 'is already present in bread, processed meat, sauces and ready meals'),
          ],
        },
      ],
    },
    {
      title: 'From Cowpox to Modern Vaccines',
      paras: [
        ['A', 'For most of human history, smallpox was one of the most feared diseases in the world. It killed a large proportion of those it infected and left many survivors scarred or blind. Yet people had long noticed something important: those who survived smallpox did not catch it again. In parts of Asia and Africa, and later in the Ottoman Empire, this observation led to a practice called variolation. Material from the sores of a person with a mild case was deliberately introduced into a scratch on the skin of a healthy person, who usually developed a milder form of the disease and became immune. The method was risky and far from perfect, but in an age without effective treatments, many families considered it a risk worth taking.'],
        ['B', 'Variolation reached Britain in the early eighteenth century, largely thanks to Lady Mary Wortley Montagu, the wife of the British ambassador in Constantinople. Having seen the practice in the Ottoman Empire and having survived smallpox herself, she had her own children treated and promoted the method on her return. Variolation was not without danger, however. A small proportion of those treated developed severe smallpox and died, and they could pass the disease on to others while they were infectious. For this reason, people who had been treated were often kept apart from others for several weeks, and the practice remained controversial among doctors.'],
        ['C', 'A safer method emerged at the end of the century. Country people in England had observed that milkmaids who had caught cowpox, a mild disease of cattle, seemed to be protected from smallpox. In 1796 the doctor Edward Jenner tested this idea. He took material from a cowpox sore on the hand of a milkmaid and introduced it into the arm of a boy named James Phipps. Some weeks later, Jenner exposed the boy to smallpox material, and the boy did not become ill. Jenner called his method vaccination, from the Latin word vacca, meaning cow. Such an experiment on a child would never be permitted today, but it changed the history of medicine.'],
        ['D', 'Vaccination spread remarkably quickly, despite fierce opposition. Some critics objected on religious grounds; others feared, often with the help of popular cartoons, that people who received material from cows would develop cow-like features. Laws making vaccination compulsory in some countries in the nineteenth century provoked organised protests. Debates about safety, personal freedom and the role of the state, which continue today, have accompanied vaccines almost from the beginning. At the same time, the falling number of deaths from smallpox in places where vaccination was widely used gradually persuaded many governments and doctors of its value.'],
        ['E', 'Over the following century, scientists extended the principle to other diseases. In the 1880s the French chemist Louis Pasteur developed vaccines against anthrax and rabies, using weakened forms of the organisms that caused them. The twentieth century brought vaccines against diphtheria, tetanus, polio, measles and many other diseases, and the number of children dying from them fell dramatically. Diseases that had once been common causes of death and disability became rare in many countries, so rare that later generations sometimes forgot how dangerous they had been. The greatest single achievement came in 1980, when the World Health Organization declared that smallpox had been eradicated - the first and, so far, the only human disease to have been completely eliminated worldwide.'],
        ['F', 'Vaccine technology continues to develop. Traditional vaccines contain weakened or inactivated forms of a virus or bacterium, or parts of it. Newer approaches, such as mRNA vaccines, instead give the body instructions to produce a harmless piece of the virus, which the immune system then learns to recognise. These vaccines can be designed and manufactured relatively quickly, and they were used on a massive scale for the first time during the COVID-19 pandemic. Researchers are now investigating whether similar methods could be used against other infections and even some forms of cancer. More than two centuries after Jenner’s experiment, the basic idea remains the same: to show the immune system an enemy safely, so that it is ready when the real one arrives.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: INTRO.heading(14, 19, 'F'),
          options: [
            'An early technique with real risks',
            'Learning from survivors',
            'Opposition and controversy',
            'From cowpox to vaccination',
            'Why vaccines are no longer needed',
            'Extending the principle to other diseases',
            'New ways of teaching the immune system',
            'The economic cost of smallpox',
          ],
          items: [
            head('A', 1, 'those who survived smallpox did not catch it again'),
            head('B', 0, 'Variolation was not without danger, however.'),
            head('C', 3, 'Jenner called his method vaccination'),
            head('D', 2, 'Vaccination spread remarkably quickly, despite fierce opposition.'),
            head('E', 5, 'scientists extended the principle to other diseases'),
            head('F', 6, 'give the body instructions to produce a harmless piece of the virus, which the immune system then learns to recognise'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(20, 23),
          items: [
            choice('What had people long noticed about smallpox survivors?', ['They did not catch the disease again.', 'They usually became blind.', 'They could cure others.', 'They were immune to cowpox.'], 0, 'A', 'those who survived smallpox did not catch it again'),
            choice('What was one danger of variolation?', ['It was too expensive for most people.', 'Some people developed severe smallpox and could infect others.', 'It worked only on children.', 'It caused cowpox.'], 1, 'B', 'A small proportion of those treated developed severe smallpox and died, and they could pass the disease on to others'),
            choice('Where does the word “vaccination” come from?', ['The name of a doctor', 'A Latin word meaning cow', 'A Turkish word for smallpox', 'The name of a village'], 1, 'C', 'from the Latin word vacca, meaning cow'),
            choice('What makes the eradication of smallpox unique?', ['It took only ten years.', 'It is the only human disease completely eliminated worldwide.', 'It was achieved by one country.', 'It was the first disease to have a vaccine.'], 1, 'E', 'the only human disease to have been completely eliminated worldwide'),
          ],
        },
        {
          type: 'tfng',
          intro: INTRO.tfng(24, 26),
          items: [
            tf('Lady Mary Wortley Montagu had survived smallpox herself.', 0, 'B', 'having survived smallpox herself'),
            tf('mRNA vaccines contain weakened forms of a virus.', 1, 'F', 'Newer approaches, such as mRNA vaccines, instead give the body instructions to produce a harmless piece of the virus'),
            tf('James Phipps later became a doctor himself.', 2, 'C', 'The passage describes Jenner’s experiment on Phipps but not the boy’s later life.'),
          ],
        },
      ],
    },
    {
      title: 'Whose Heritage Is It?',
      paras: [
        ['A', 'Walk through the great museums of Europe and North America and you will find objects from every corner of the world: sculptures from ancient Greece, bronzes from West Africa, manuscripts from Asia, ceremonial objects from the Pacific. Many were acquired legally, through purchase, exchange or gifts. Others, however, were taken during wars or under colonial rule, in circumstances that would be regarded today as theft. Many others fall somewhere in between, acquired through agreements made between parties with very unequal power. In recent years, demands for the return of such objects have grown louder, and the question of who should own the world’s cultural heritage has become one of the most contested issues in the museum world.'],
        ['B', 'Two cases illustrate the debate particularly clearly. The Parthenon Sculptures, sometimes called the Elgin Marbles, were removed from the Acropolis in Athens in the early nineteenth century on the orders of the British diplomat Lord Elgin and are now in the British Museum in London. Greece has requested their return for decades. The Benin Bronzes, thousands of plaques and sculptures from the Kingdom of Benin in present-day Nigeria, were taken by British forces during a military expedition in 1897 and later dispersed to museums and private collections around the world.'],
        ['C', 'The arguments against returning such objects are well known. Some museums argue that their collections allow visitors to compare cultures side by side, and that this “universal” approach serves humanity as a whole. Others point to laws that prevent them from removing objects from their collections, or express concern that returned objects might not be adequately preserved. There is also a fear that a single return would open the way to countless other claims, eventually emptying museums of much of what they hold. Some also argue that objects in famous museums are seen by far more people than they would be elsewhere.'],
        ['D', 'I find these arguments less convincing than they once seemed. The idea of a universal museum sounds generous, but it is difficult to accept when the people whose ancestors made the objects have to travel to another continent, often needing a visa, to see them. The concern about preservation is outdated in many cases: countries requesting returns increasingly have modern museums with professional staff. And the fear of a flood of claims is not a moral argument at all; it is simply a description of how many objects may have been acquired in questionable ways.'],
        ['E', 'This does not mean that every object should automatically be returned, or that the process is simple. Establishing how an object was acquired can require years of research in archives, and in some cases the original owners may be difficult to identify. Where an object was bought legally and openly, the case for keeping it is much stronger. Each claim deserves to be examined carefully, on the basis of evidence rather than slogans on either side. Sometimes the best outcome may be shared ownership, long-term loans or joint exhibitions rather than a simple transfer.'],
        ['F', 'Encouragingly, practice is beginning to change. Several museums now publish detailed information about the origins of their collections, a field known as provenance research. In 2022 Germany began transferring ownership of hundreds of Benin Bronzes from its museums to Nigeria, and other institutions have made similar decisions. Some returns have been accompanied by agreements to lend objects back, allowing them to continue to be seen by international visitors.'],
        ['G', 'Museums need not fear this change. Their value lies not in possessing objects but in helping people to understand them. A museum that is open about the history of its collection, cooperates with the communities from which objects came and returns what was taken unjustly is likely to earn greater trust, not less. In the end, the question is not whether museums will survive such returns, but whether they can tell the full story of the objects they hold, including the uncomfortable parts. Visitors, after all, are perfectly capable of understanding that the history of a beautiful object may also be a history of injustice.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: INTRO.mc(27, 31),
          items: [
            choice('According to paragraph A, how were some objects in Western museums obtained?', ['They were all bought at auctions.', 'They were taken during wars or under colonial rule.', 'They were made by European artists.', 'They were found by tourists.'], 1, 'A', 'Others, however, were taken during wars or under colonial rule'),
            choice('How were the Benin Bronzes taken?', ['They were sold by the King of Benin.', 'They were taken during a British military expedition.', 'They were given to Lord Elgin.', 'They were discovered by archaeologists in 2022.'], 1, 'B', 'were taken by British forces during a military expedition in 1897'),
            choice('Which argument does the writer describe as “not a moral argument at all”?', ['The idea of a universal museum', 'The concern about preservation', 'The fear of a flood of claims', 'Laws that prevent removal'], 2, 'D', 'the fear of a flood of claims is not a moral argument at all'),
            choice('What does the writer say about objects that were bought legally and openly?', ['They should be returned first.', 'The case for keeping them is much stronger.', 'Their history is impossible to trace.', 'They are usually less valuable.'], 1, 'E', 'Where an object was bought legally and openly, the case for keeping it is much stronger.'),
            choice('What did Germany begin doing in 2022?', ['Buying Benin Bronzes from private collectors', 'Transferring ownership of Benin Bronzes to Nigeria', 'Building a new museum in Benin', 'Lending the Parthenon Sculptures to Greece'], 1, 'F', 'Germany began transferring ownership of hundreds of Benin Bronzes from its museums to Nigeria'),
          ],
        },
        {
          type: 'ynng',
          intro: INTRO.ynng(32, 36),
          items: [
            tf('All objects in Western museums were acquired illegally.', 1, 'A', 'Many were acquired legally, through purchase, exchange or gifts.'),
            tf('Concerns about the preservation of returned objects are often out of date.', 0, 'D', 'The concern about preservation is outdated in many cases'),
            tf('Every object in question should be returned automatically.', 1, 'E', 'This does not mean that every object should automatically be returned'),
            tf('The British Museum will return the Parthenon Sculptures within ten years.', 2, 'B', 'The writer does not make any prediction about the Parthenon Sculptures.'),
            tf('Museums that are open about the history of their collections are likely to gain trust.', 0, 'G', 'is likely to earn greater trust, not less'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSummary(37, 40, 'H'),
          options: ['visa', 'provenance', 'archives', 'lend', 'slogans', 'universal', 'trust', 'plaques'],
          items: [
            gap('Some museums call their approach of comparing cultures side by side ______.', 5, 'C', 'this “universal” approach serves humanity as a whole'),
            gap('Finding out how an object was acquired may require years of research in ______.', 2, 'E', 'can require years of research in archives'),
            gap('Research into the origins of collections is known as ______ research.', 1, 'F', 'a field known as provenance research'),
            gap('Some returns include agreements to ______ the objects back.', 3, 'F', 'agreements to lend objects back'),
          ],
        },
      ],
    },
  ],
};
