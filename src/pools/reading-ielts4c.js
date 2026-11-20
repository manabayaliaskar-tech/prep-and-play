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

export const IELTS_MORE4D = [
  {
    id: 'earthquakes',
    title: 'Why the Ground Shakes',
    text:
      'An earthquake is a sudden movement of the Earth’s crust. Most occur along the edges of the huge plates that make up the planet’s surface, where the plates push against or slide past each other. Stress builds up slowly for years, and when the rock finally breaks, energy is released in waves that travel through the ground. The point underground where the break begins is called the focus, and the point on the surface directly above it is the epicenter.\n' +
      'The strength of an earthquake is measured on the Richter scale or, more often today, on the moment magnitude scale. Each step on the scale represents about thirty-two times more energy released, so a magnitude 7 quake is far stronger than a magnitude 6. Scientists cannot yet predict exactly when and where an earthquake will happen. What they can do is map risky regions and help engineers design buildings that bend rather than break. In some countries, schools regularly practice drills so that children know to take cover under desks and away from windows.',
    qs: [
      tfx('Most earthquakes happen along the edges of plates.', 'T', 'Most occur along the edges of the huge plates'),
      tfx('Scientists can now predict exactly when an earthquake will happen.', 'F', 'Scientists cannot yet predict exactly when and where an earthquake will happen'),
      tfx('Earthquakes are more frequent in winter than in summer.', 'N'),
      mcx('What is the epicenter?', ['The point on the surface above the focus', 'The strongest wave', 'The point where the plates meet', 'The deepest part of the crust'], 'the point on the surface directly above it is the epicenter'),
      mcx('What do engineers design to reduce damage?', ['Buildings that bend rather than break', 'Walls of solid stone', 'Underground cities', 'Very tall towers'], 'design buildings that bend rather than break'),
    ],
  },
  {
    id: 'elephants',
    title: 'The Memory of Elephants',
    text:
      'The saying "an elephant never forgets" contains a good deal of truth. African elephants live in family groups led by the oldest female, called the matriarch, who may be sixty years old or more. During droughts, the matriarch leads the group to waterholes she visited decades earlier, and groups led by older matriarchs have been shown to survive droughts better than those led by younger ones.\n' +
      'Elephants also recognize each other. Researchers playing recordings of calls from elephants that had been away for years observed that the relatives responded at once. The animals appear to mourn their dead: they stand beside the body for long periods and sometimes touch the bones of dead relatives with their trunks. Their brains are the largest of any land animal, weighing about five kilograms. Because elephants live long and need to remember routes, social relationships and sources of food, scientists believe that memory plays a large part in their survival.',
    qs: [
      tfx('The oldest female leads an elephant family group.', 'T', 'led by the oldest female, called the matriarch'),
      tfx('Groups led by younger matriarchs survive droughts better.', 'F', 'groups led by older matriarchs have been shown to survive droughts better'),
      tfx('Elephants can recognize their own reflection in a mirror.', 'N'),
      mcx('What do elephants appear to do when a relative dies?', ['They stand beside the body for a long time.', 'They leave immediately.', 'They bury it.', 'They call loudly at night.'], 'they stand beside the body for long periods'),
      mcx('Why does memory matter for elephants?', ['They live long and must remember routes, relationships and food sources.', 'They hunt alone.', 'They sleep for most of the day.', 'They migrate only once.'], 'elephants live long and need to remember routes, social relationships and sources of food'),
    ],
  },
  {
    id: 'football-origins',
    title: 'How Football Began',
    text:
      'Ball games have been played for thousands of years. In ancient China, a game called cuju involved kicking a leather ball through an opening in a net, and soldiers played it as training. In medieval Europe, villages played wild matches between neighboring towns, with hundreds of players and few rules; the games sometimes lasted all day and often caused damage and injuries.\n' +
      'The modern game developed in nineteenth-century English schools, where each school used different rules. In 1863, representatives of several clubs met in London and agreed on a common set of laws, forbidding the carrying of the ball in the hands; this decision created the Football Association and separated football from rugby. The sport spread quickly with sailors, merchants and railway workers. The first World Cup was held in Uruguay in 1930, and today the competition attracts a global audience of billions. Football is now played in almost every country by both women and men.',
    qs: [
      tfx('Cuju was played in ancient China.', 'T', 'In ancient China, a game called cuju'),
      tfx('Medieval village matches had very strict rules.', 'F', 'with hundreds of players and few rules'),
      tfx('The first World Cup was won by the host nation.', 'N'),
      mcx('What happened in London in 1863?', ['Clubs agreed on common laws and the Football Association was created.', 'The first World Cup took place.', 'Rugby was invented.', 'Women began to play.'], 'representatives of several clubs met in London and agreed on a common set of laws'),
      mcx('What separated football from rugby?', ['Forbidding the carrying of the ball in the hands', 'The size of the ball', 'The number of players', 'The color of the uniforms'], 'forbidding the carrying of the ball in the hands'),
    ],
  },
  {
    id: 'honey-making',
    title: 'How Bees Make Honey',
    text:
      'Honey begins as nectar, the sweet liquid found in flowers. A worker bee sucks up the nectar with her long tongue and stores it in a special stomach, where enzymes begin to change its sugars. Back at the hive, she passes the nectar to other workers, which chew it and pass it on again, so that it is gradually transformed.\n' +
      'The bees then spread the thin liquid in the cells of the honeycomb and fan it with their wings so that most of the water evaporates. When the honey is thick enough, they seal the cell with a layer of wax. Honey stored this way hardly spoils, because it contains very little water and is naturally slightly acidic, which prevents bacteria from growing. Jars of honey found in ancient Egyptian tombs were reportedly still edible after thousands of years. To make a single jar of honey, bees in a hive may have to visit millions of flowers, and a worker bee produces only about one twelfth of a teaspoon in her lifetime.',
    qs: [
      tfx('Honey begins as nectar from flowers.', 'T', 'Honey begins as nectar'),
      tfx('Bees make honey without using their wings.', 'F', 'fan it with their wings so that most of the water evaporates'),
      tfx('Honey made in spring tastes sweeter than honey made in autumn.', 'N'),
      mcx('Why does honey hardly spoil?', ['It has little water and is slightly acidic.', 'It is stored in glass.', 'It is very cold.', 'It contains salt.'], 'it contains very little water and is naturally slightly acidic'),
      mcx('How is a finished honeycomb cell closed?', ['With a layer of wax', 'With leaves', 'With mud', 'With a bee’s body'], 'they seal the cell with a layer of wax'),
    ],
  },
];
