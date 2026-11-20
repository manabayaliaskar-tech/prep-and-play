// Дополнительные тексты IELTS Reading (авторские), часть 3.
import { mcx, tfx } from './reading-kit.js';

export const IELTS_MORE4C = [
  {
    id: 'baikal',
    title: 'Lake Baikal',
    text:
      'Lake Baikal in Siberia is the deepest lake on Earth, reaching a depth of 1,642 meters. It is also one of the oldest, with an age of roughly twenty-five million years. The lake holds about one fifth of the world’s unfrozen fresh water, more than all the North American Great Lakes combined. Its water is so clear that in spring, when the ice melts, objects can be seen at a depth of forty meters.\n' +
      'Baikal is home to more than 2,500 species of animals and plants, and about two thirds of them live nowhere else. The best known is the Baikal seal, the only seal in the world that lives entirely in fresh water. In winter, the lake freezes to a thickness of up to two meters, and people drive trucks across the ice. Environmental groups warn that pollution from factories and tourism threatens the lake, and the area was named a UNESCO World Heritage Site in 1996.',
    qs: [
      tfx('Lake Baikal is the deepest lake in the world.', 'T', 'the deepest lake on Earth'),
      tfx('The lake is only a few thousand years old.', 'F', 'with an age of roughly twenty-five million years'),
      tfx('Baikal is the largest lake in Asia by surface area.', 'N'),
      mcx('What is special about the Baikal seal?', ['It is the only seal that lives entirely in fresh water.', 'It lives only in winter.', 'It is the largest seal.', 'It eats only plants.'], 'the only seal in the world that lives entirely in fresh water'),
      mcx('What do environmental groups warn about?', ['Pollution from factories and tourism', 'A lack of fish', 'The lake drying up', 'Too many seals'], 'pollution from factories and tourism threatens the lake'),
    ],
  },
  {
    id: 'internet-origins',
    title: 'The Origins of the Internet',
    text:
      'The internet began as a research project. In 1969, the American agency ARPA connected computers at four universities in a network called ARPANET. The aim was to allow researchers in different places to share expensive computing power. The first message sent over the network was meant to be the word "login", but the system crashed after the first two letters.\n' +
      'During the 1970s, engineers developed common rules, known as protocols, that allowed different networks to exchange data, and the word "internet" came into use for this "network of networks". The system remained mostly the tool of academics until 1989, when Tim Berners-Lee, working at a physics laboratory in Switzerland, proposed the World Wide Web, a system of linked pages that anyone could read with a browser. Within a few years, the web brought millions of ordinary people online, and today more than half of the world’s population uses the internet.',
    qs: [
      tfx('ARPANET connected computers at four universities in 1969.', 'T', 'connected computers at four universities in a network called ARPANET'),
      tfx('The first message was sent successfully in full.', 'F', 'the system crashed after the first two letters'),
      tfx('Tim Berners-Lee was awarded a prize for the World Wide Web.', 'N'),
      mcx('What was the original aim of ARPANET?', ['To let researchers share expensive computing power', 'To sell products online', 'To send emails to families', 'To broadcast television'], 'to share expensive computing power'),
      mcx('What are protocols?', ['Common rules that let networks exchange data', 'Types of web browsers', 'Names of universities', 'Kinds of cables'], 'common rules, known as protocols, that allowed different networks to exchange data'),
    ],
  },
  {
    id: 'penguins',
    title: 'How Penguins Survive the Cold',
    text:
      'Emperor penguins breed during the Antarctic winter, when temperatures can fall below minus forty degrees Celsius and winds reach more than a hundred kilometers an hour. After the female lays a single egg, she returns to the sea to feed, and the male balances the egg on his feet, covered by a warm fold of skin, for about two months. During this time he does not eat.\n' +
      'To survive, the males huddle together in tight groups of thousands. Birds on the edge of the group, which are most exposed to the wind, slowly move toward the center, while others take their place at the edge. In this way every penguin takes turns in the warmest and coldest places. Researchers using thermal cameras found that the temperature inside a huddle can reach 37 degrees Celsius, almost as warm as a human body, even when the air outside is extremely cold.',
    qs: [
      tfx('Female emperor penguins lay several eggs in each season.', 'F', 'lays a single egg'),
      tfx('Male penguins keep the egg on their feet.', 'T', 'the male balances the egg on his feet'),
      tfx('Emperor penguins can live for more than forty years.', 'N'),
      mcx('How do the penguins share the cold?', ['They take turns at the edge and in the center of the huddle.', 'They sleep in caves.', 'They fly to warmer places.', 'They dig tunnels in ice.'], 'every penguin takes turns in the warmest and coldest places'),
      mcx('How warm can it be inside a huddle?', ['Up to 37 degrees Celsius', 'Below zero', 'About 10 degrees Celsius', 'Exactly 20 degrees Celsius'], 'can reach 37 degrees Celsius'),
    ],
  },
  {
    id: 'metric',
    title: 'The Story of the Metric System',
    text:
      'Before the French Revolution, measurements in France varied from town to town, and traders were often confused or cheated. In 1791, French scientists proposed a new system based on nature and on the number ten. The meter was defined as one ten-millionth of the distance from the North Pole to the equator, and other units were linked to it: a liter was a cube ten centimeters on each side, and a kilogram was the mass of a liter of water.\n' +
      'The system was introduced gradually, and many people resisted it. Over the nineteenth century, however, more countries adopted it because it was easy to use, with calculations based on tens. In 1875, seventeen countries signed an agreement to keep common standards. Today almost every country uses the metric system officially. The best-known exceptions are the United States, which continues to use pounds and miles in everyday life, although its science and industry rely largely on metric units.',
    qs: [
      tfx('Measurements in pre-revolutionary France were uniform.', 'F', 'measurements in France varied from town to town'),
      tfx('A kilogram was linked to the mass of a liter of water.', 'T', 'a kilogram was the mass of a liter of water'),
      tfx('The metric system was invented by a single mathematician.', 'N'),
      mcx('Why did more countries adopt the metric system?', ['It was easy to use because it was based on tens.', 'It was cheaper than other systems.', 'It was required by France.', 'It was invented in the United States.'], 'it was easy to use, with calculations based on tens'),
      mcx('What does the text say about the United States?', ['It still uses pounds and miles in everyday life.', 'It invented the meter.', 'It signed no agreements.', 'It uses no metric units.'], 'continues to use pounds and miles in everyday life'),
    ],
  },
  {
    id: 'yurt-design',
    title: 'The Design of the Yurt',
    text:
      'The yurt is the traditional home of nomadic peoples of the Central Asian steppe. It consists of a circular wooden frame covered with felt, and it can be taken down and loaded onto a camel or a cart in an hour or two. The felt is made from sheep’s wool, which keeps the interior warm in winter and cool in summer, and a layer of felt can be added or removed depending on the weather.\n' +
      'The structure is both light and strong. The walls are made of folding lattice sections, the roof poles are joined at a wooden ring at the top, and the ring lets smoke escape and light enter. Because the shape is rounded, it resists strong steppe winds better than a house with flat walls. Today, many people use yurts as guesthouses for tourists, and architects in several countries have been inspired by the design to create tents and shelters for cold regions.',
    qs: [
      tfx('A yurt can be taken down in an hour or two.', 'T', 'can be taken down and loaded onto a camel or a cart in an hour or two'),
      tfx('The felt covering is made from cotton.', 'F', 'The felt is made from sheep’s wool'),
      tfx('Yurts were first used in Mongolia.', 'N'),
      mcx('What is the purpose of the ring at the top?', ['It lets smoke escape and light enter.', 'It holds the felt in place.', 'It carries the water.', 'It decorates the roof.'], 'the ring lets smoke escape and light enter'),
      mcx('Why does a yurt resist strong winds well?', ['Its shape is rounded.', 'It is made of stone.', 'It is built on the ground.', 'It has no door.'], 'Because the shape is rounded, it resists strong steppe winds'),
    ],
  },
  {
    id: 'solar-energy',
    title: 'Power from the Sun',
    text:
      'Solar panels turn sunlight into electricity using a material called silicon. When light strikes the silicon, it frees tiny particles called electrons, which are collected as an electric current. A single panel produces little power, but hundreds of them together can supply a town. In the last fifteen years, the price of solar panels has fallen sharply, and in many sunny regions solar electricity is now as cheap as that produced by burning coal.\n' +
      'Solar power does have limits. Panels produce no electricity at night and less on cloudy days, so they must be combined with batteries or other sources. Large solar farms also need a lot of land, though many are built on deserts or on the roofs of existing buildings. Engineers are developing new materials that capture more of the light that reaches the panel. Experts expect that, within a few decades, the sun could provide a large share of the world’s electricity.',
    qs: [
      tfx('Solar panels use silicon to produce electricity.', 'T', 'using a material called silicon'),
      tfx('Solar panels work better at night.', 'F', 'Panels produce no electricity at night'),
      tfx('Kazakhstan has the largest solar farm in Asia.', 'N'),
      mcx('What has happened to the price of panels?', ['It has fallen sharply.', 'It has doubled.', 'It stayed the same.', 'It depends on the weather.'], 'the price of solar panels has fallen sharply'),
      mcx('What are engineers developing?', ['Materials that capture more light', 'Panels that work only at night', 'Machines that burn coal', 'Cheaper batteries for cars'], 'new materials that capture more of the light that reaches the panel'),
    ],
  },
  {
    id: 'tea-history',
    title: 'A Cup of Tea',
    text:
      'Tea is the most widely consumed drink in the world after water. According to Chinese tradition, it was discovered in 2737 BC when leaves from a wild tree blew into the boiling water of Emperor Shennong. Historians believe tea drinking became common in China during the Tang dynasty, and Buddhist monks carried the habit to Japan, where a ceremony with special rules developed.\n' +
      'Tea reached Europe in the sixteenth century through Portuguese and Dutch traders. In Britain it became fashionable in the seventeenth century after the king married a Portuguese princess who loved the drink. By the nineteenth century, tea was so popular that Britain grew it in India, in order to avoid buying all of it from China. In Kazakhstan and many neighboring countries, tea is served to guests as a sign of respect, and people usually drink it from small bowls called "piala".',
    qs: [
      tfx('Tea is the most widely consumed drink in the world after water.', 'T', 'the most widely consumed drink in the world after water'),
      tfx('Tea first arrived in Europe through Chinese merchants.', 'F', 'through Portuguese and Dutch traders'),
      tfx('The Japanese tea ceremony takes about four hours.', 'N'),
      mcx('Why did Britain begin growing tea in India?', ['To avoid buying all of it from China', 'Because Indian tea tasted better', 'Because the king ordered it', 'Because China stopped exporting'], 'in order to avoid buying all of it from China'),
      mcx('How is tea served to guests in Kazakhstan?', ['As a sign of respect', 'Only at breakfast', 'Only in winter', 'Only to elders'], 'tea is served to guests as a sign of respect'),
    ],
  },
  {
    id: 'languages-lost',
    title: 'Vanishing Languages',
    text:
      'Of the roughly 7,000 languages spoken in the world, about 40 percent are endangered, which means that they are used by only a small number of speakers, often elderly. Linguists say that a language dies, on average, about every two weeks. The main cause is not force but choice: parents decide that their children will have better chances at school and work if they speak a more widely used language, so the home language is not passed on.\n' +
      'Each language carries a unique body of knowledge, for example names of local plants and medicines, stories and ways of counting. Several projects aim to slow the loss. Communities set up "language nests", in which grandparents speak the heritage language with preschool children. Other projects use smartphone apps and recorded dictionaries. Success stories exist: Welsh, once in decline, has gained speakers because of schools and television. Linguists stress that revival works best when the language is used in daily life, not only in the classroom.',
    qs: [
      tfx('About 40 percent of the world’s languages are endangered.', 'T', 'about 40 percent are endangered'),
      tfx('Languages usually die because governments forbid them.', 'F', 'The main cause is not force but choice'),
      tfx('Welsh is now spoken by more people than English in Wales.', 'N'),
      mcx('What is a "language nest"?', ['A program where grandparents speak the heritage language with young children', 'A kind of dictionary', 'A school for adults', 'A television channel'], 'grandparents speak the heritage language with preschool children'),
      mcx('When does revival work best?', ['When the language is used in daily life', 'When it is taught only at school', 'When it is written down', 'When it is banned elsewhere'], 'revival works best when the language is used in daily life'),
    ],
  },
  {
    id: 'cheetah-speed',
    title: 'The Fastest Runner',
    text:
      'The cheetah can accelerate from standing to eighty kilometers an hour in about three seconds, faster than most sports cars. Its body is built for speed: a flexible spine that acts like a spring, long legs, a small head and large nostrils that help it breathe quickly. Its claws are only partly retractable and work like the spikes on a running shoe.\n' +
      'This speed comes at a cost. A cheetah can sprint for only about thirty seconds before it overheats, and after a chase it needs to rest for about half an hour. During this time other predators, such as lions and hyenas, may steal its kill. Because it relies on speed, the cheetah is less powerful than other big cats and tends to avoid fights. The species is now vulnerable, mainly because its habitat has shrunk and farmers sometimes shoot cheetahs to protect livestock. Conservationists are working with farmers to find solutions.',
    qs: [
      tfx('A cheetah can sprint for several minutes without stopping.', 'F', 'only about thirty seconds before it overheats'),
      tfx('A cheetah’s claws work like the spikes on a running shoe.', 'T', 'work like the spikes on a running shoe'),
      tfx('Cheetahs live in groups of up to twenty animals.', 'N'),
      mcx('Why might a cheetah lose its kill?', ['It rests after the chase and other predators may steal it.', 'It is too slow to carry it.', 'It leaves it in the sun.', 'It does not like meat.'], 'other predators, such as lions and hyenas, may steal its kill'),
      mcx('Why is the species vulnerable?', ['Its habitat has shrunk and some are shot by farmers.', 'It cannot find food.', 'It is too slow.', 'It has too many cubs.'], 'its habitat has shrunk and farmers sometimes shoot cheetahs'),
    ],
  },
  {
    id: 'glass-making',
    title: 'The Secret of Glass',
    text:
      'Glass is made mostly from sand, which is melted at about 1,700 degrees Celsius and then cooled quickly so that it does not form crystals. Natural glass has existed for millions of years: when lightning strikes sand or when volcanoes erupt, the heat can melt rock into glassy material. Ancient peoples used volcanic glass for knives and arrowheads.\n' +
      'Making glass deliberately began in Mesopotamia and Egypt more than 3,500 years ago, where it was used for beads and small vessels. The invention of glassblowing in the first century BC, probably in the Roman Empire, made it possible to produce containers quickly and cheaply. In the Middle Ages, craftsmen in Venice guarded the secrets of their art so carefully that glassmakers were forbidden to leave the city. Modern glass is used in everything from windows and bottles to the fiber-optic cables that carry the internet, and recycling glass saves energy because used glass melts at a lower temperature than raw sand.',
    qs: [
      tfx('Glass is made mostly from sand.', 'T', 'Glass is made mostly from sand'),
      tfx('Natural glass has never been found.', 'F', 'Natural glass has existed for millions of years'),
      tfx('Venetian glass was exported to every country in Europe.', 'N'),
      mcx('What did the invention of glassblowing allow?', ['Quick and cheap production of containers', 'The first beads', 'The use of volcanic glass', 'The making of windows only'], 'made it possible to produce containers quickly and cheaply'),
      mcx('Why does recycling glass save energy?', ['Used glass melts at a lower temperature than raw sand.', 'It needs no heating.', 'It is lighter.', 'It is cheaper to transport.'], 'used glass melts at a lower temperature than raw sand'),
    ],
  },
];
