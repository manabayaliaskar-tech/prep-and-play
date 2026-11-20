// Дополнительные тексты TOEFL Reading (авторские): вопросы с четырьмя вариантами.
import { mcx } from './reading-kit.js';

export const TOEFL_MORE4A = [
  {
    id: 'tides',
    title: 'The Pull of the Moon',
    text:
      'Twice a day, in most parts of the world, the sea rises and falls. These tides are caused mainly by the gravity of the Moon, which pulls on the oceans. The water facing the Moon is drawn toward it and forms a bulge; a second bulge forms on the opposite side of the Earth, because the planet itself is pulled slightly more strongly than the water far from the Moon. As the Earth rotates, any place on the coast passes through both bulges each day, which explains the two high tides.\n' +
      'The Sun also affects the tides, although its influence is weaker because it is so much farther away. When the Sun, Moon and Earth line up, at new and full moon, their forces combine and produce unusually high and low tides called spring tides. In a few narrow bays, such as the Bay of Fundy in Canada, the shape of the coast amplifies the effect, so that the water level can change by more than fifteen meters. Fishermen and sailors have long relied on tide tables to plan their work.',
    qs: [
      mcx('According to the passage, what mainly causes the tides?', ['The gravity of the Moon', 'The wind on the sea', 'The rotation of the Sun', 'The temperature of the water'], 'caused mainly by the gravity of the Moon'),
      mcx('The word "bulge" in the passage is closest in meaning to', ['a rounded swelling', 'a narrow channel', 'a strong wave', 'a deep hole'], 'forms a bulge; a second bulge forms on the opposite side'),
      mcx('Why is the Sun’s effect on tides weaker than the Moon’s?', ['It is much farther away.', 'It is smaller than the Moon.', 'It does not have gravity.', 'It rotates too slowly.'], 'its influence is weaker because it is so much farther away'),
      mcx('What are spring tides?', ['Unusually high and low tides when the Sun, Moon and Earth line up', 'Tides that occur only in spring', 'Tides caused by melting snow', 'Tides in narrow bays only'], 'at new and full moon, their forces combine and produce unusually high and low tides called spring tides'),
      mcx('What can be inferred about the Bay of Fundy?', ['Its shape makes tides unusually large.', 'It has no tides.', 'It is the widest bay in Canada.', 'Fishing is forbidden there.'], 'the shape of the coast amplifies the effect, so that the water level can change by more than fifteen meters'),
    ],
  },
  {
    id: 'amazon',
    title: 'The Lungs of the Planet?',
    text:
      'The Amazon rainforest, which covers about five and a half million square kilometers, is often called the "lungs of the planet". The description is not entirely accurate, because the forest uses nearly as much oxygen through the respiration of plants, animals and microbes as it produces. Its real importance lies elsewhere. The trees store enormous amounts of carbon, which would warm the atmosphere if it were released, and they release water vapor that forms clouds and brings rain to farmland as far away as southern Brazil.\n' +
      'Deforestation, mainly for cattle ranching and soy farming, has removed a significant part of the forest in recent decades. Scientists warn that if too much is lost, the remaining forest may become drier and begin to turn into savanna, a change that would be difficult to reverse. Programs that pay landowners to protect forest, together with stricter enforcement of laws against illegal logging, have slowed the loss in some years, but the pace depends on political decisions.',
    qs: [
      mcx('Why does the author say the phrase "lungs of the planet" is not entirely accurate?', ['The forest uses almost as much oxygen as it produces.', 'The forest produces no oxygen.', 'The forest is too small.', 'The forest absorbs no carbon.'], 'the forest uses nearly as much oxygen through the respiration'),
      mcx('According to the passage, what do the trees release that brings rain to distant farmland?', ['Water vapor', 'Carbon', 'Oxygen', 'Soil'], 'they release water vapor that forms clouds and brings rain'),
      mcx('The word "enforcement" in the passage is closest in meaning to', ['making sure laws are obeyed', 'writing new laws', 'teaching about laws', 'ignoring laws'], 'stricter enforcement of laws against illegal logging'),
      mcx('What is the main cause of deforestation mentioned?', ['Cattle ranching and soy farming', 'Natural fires', 'Tourism', 'Mining of gold'], 'mainly for cattle ranching and soy farming'),
      mcx('What can be inferred about the future of the forest?', ['It depends on political decisions.', 'It will certainly recover.', 'It will certainly disappear.', 'It is unaffected by humans.'], 'the pace depends on political decisions'),
    ],
  },
  {
    id: 'money-origin',
    title: 'How Money Began',
    text:
      'Before money, people exchanged goods directly, a system known as barter. Barter works poorly in practice, because it requires a "double coincidence of wants": a farmer who wants shoes must find a shoemaker who happens to want grain. To avoid this problem, many societies began to use a commonly accepted item as a medium of exchange. Shells, salt, cattle and metal rings all served this purpose in different places.\n' +
      'The first coins made of metal appeared in the kingdom of Lydia, in present-day Turkey, around 600 BC. They were made of a natural mixture of gold and silver and stamped with a symbol that guaranteed their weight, so that traders did not need to weigh them each time. In China, paper money appeared during the Tang and Song dynasties, because carrying heavy strings of copper coins was inconvenient. Today most money exists only as numbers in bank computers, and its value rests on the confidence of the people who use it.',
    qs: [
      mcx('What problem with barter does the passage describe?', ['Both sides must want what the other offers.', 'Goods spoil too quickly.', 'People cannot count.', 'Coins are heavy.'], 'a farmer who wants shoes must find a shoemaker who happens to want grain'),
      mcx('Where did the first metal coins appear, according to the passage?', ['In Lydia', 'In China', 'In Egypt', 'In Rome'], 'The first coins made of metal appeared in the kingdom of Lydia'),
      mcx('The word "guaranteed" in the passage is closest in meaning to', ['promised with certainty', 'hid', 'increased', 'measured roughly'], 'a symbol that guaranteed their weight'),
      mcx('Why did paper money appear in China?', ['Heavy strings of copper coins were inconvenient.', 'Paper was cheaper than copper.', 'The emperor liked paper.', 'Lydia had invented it.'], 'carrying heavy strings of copper coins was inconvenient'),
      mcx('What gives modern money its value, according to the author?', ['The confidence of the people who use it', 'Gold stored in banks', 'The weight of the notes', 'The decisions of merchants'], 'its value rests on the confidence of the people who use it'),
    ],
  },
  {
    id: 'vents',
    title: 'Life Without Sunlight',
    text:
      'For a long time, scientists believed that all life depended on energy from the Sun. This belief was overturned in 1977, when researchers exploring the deep Pacific Ocean discovered hot springs on the seafloor, called hydrothermal vents, surrounded by crowds of strange animals: giant tube worms, clams and shrimp. At that depth, more than two kilometers below the surface, there is no sunlight at all.\n' +
      'The animals survive thanks to bacteria that make food through chemosynthesis. Instead of using light, as plants do in photosynthesis, the bacteria use chemicals such as hydrogen sulfide that pour out of the vents. Some bacteria live inside the tube worms, which have no mouth and rely entirely on their partners for nutrition. The discovery changed ideas about where life might exist. Scientists now think that similar conditions could occur beneath the icy crusts of some moons in the outer solar system, making these worlds possible places to search for life.',
    qs: [
      mcx('What did the discovery in 1977 overturn?', ['The belief that all life depends on the Sun', 'The belief that the ocean is shallow', 'The belief that vents are cold', 'The belief that bacteria are animals'], 'scientists believed that all life depended on energy from the Sun'),
      mcx('How do tube worms get food?', ['From bacteria living inside them', 'By eating plankton', 'By catching shrimp', 'By absorbing sunlight'], 'Some bacteria live inside the tube worms, which have no mouth'),
      mcx('The word "overturned" in the passage is closest in meaning to', ['shown to be wrong', 'turned upside down physically', 'repeated', 'explained'], 'This belief was overturned in 1977'),
      mcx('What do the bacteria use instead of light?', ['Chemicals such as hydrogen sulfide', 'Heat from the Sun', 'Oxygen from the surface', 'Salt'], 'the bacteria use chemicals such as hydrogen sulfide'),
      mcx('Why does the author mention the moons of the outer solar system?', ['To suggest where life might be found', 'To compare their sizes with Earth', 'To describe their ice', 'To explain tides'], 'making these worlds possible places to search for life'),
    ],
  },
  {
    id: 'industrial-textiles',
    title: 'Cotton and the Factory',
    text:
      'Before the eighteenth century, cloth in Britain was made at home. Families spun thread on a wheel and wove it on a hand loom, and the work was slow. A series of inventions changed this. In 1764, James Hargreaves built the spinning jenny, which allowed one worker to spin several threads at once. Later, Richard Arkwright’s water frame produced stronger thread, and it needed power from a river, so owners built large mills beside streams. The steam engine soon freed factories from the need for running water.\n' +
      'Factories brought workers together under one roof and under strict schedules. Production rose sharply: by the 1830s, British mills produced more cotton cloth than the rest of the world combined. The cost was high, however. Many workers, including children, labored for twelve hours or more in noisy, dusty rooms, and towns grew so fast that housing and sanitation could not keep up. Reformers gradually pushed Parliament to pass laws limiting working hours and protecting children.',
    qs: [
      mcx('What did the spinning jenny allow?', ['One worker to spin several threads at once', 'Cloth to be woven without hands', 'Thread to be made from steam', 'Mills to be built in towns'], 'allowed one worker to spin several threads at once'),
      mcx('Why were the first large mills built beside streams?', ['The water frame needed power from a river.', 'Cotton grew near rivers.', 'Rivers were used for transport only.', 'Workers lived by streams.'], 'it needed power from a river, so owners built large mills beside streams'),
      mcx('The word "sanitation" in the passage most likely refers to', ['systems that keep towns clean and healthy', 'rules about working hours', 'the cost of cloth', 'the number of workers'], 'housing and sanitation could not keep up'),
      mcx('What happened to cotton production by the 1830s?', ['British mills produced more than the rest of the world combined.', 'It fell sharply.', 'It was produced only at home.', 'It stopped using machines.'], 'British mills produced more cotton cloth than the rest of the world combined'),
      mcx('What can be inferred about early factory conditions?', ['They were harsh and led to reform.', 'They were pleasant.', 'They were ignored by Parliament.', 'They had short hours.'], 'Reformers gradually pushed Parliament to pass laws limiting working hours'),
    ],
  },
  {
    id: 'octopus',
    title: 'The Clever Octopus',
    text:
      'Despite having a short life of one to two years and no parents to teach it, the octopus shows remarkable intelligence. In laboratory tests, octopuses have learned to open jars with screw lids to reach food, and they can solve mazes and recognize individual human keepers, squirting water at those they dislike. In the wild, some have been seen carrying coconut shells to use later as shelters, an example of tool use that is rare among invertebrates.\n' +
      'The octopus’s nervous system is very different from ours. About two thirds of its neurons are located not in the brain but in the arms, which can act semi-independently: a severed arm can still react to touch. Scientists believe that intelligence evolved separately in octopuses and in mammals, which makes the octopus a valuable subject for researchers who want to understand how complex thinking arises. Many aquariums now provide puzzles and toys to keep their octopuses mentally active, since a bored octopus will often escape from its tank.',
    qs: [
      mcx('What does the author mean by saying octopuses have "no parents to teach" them?', ['They learn without being taught by adults.', 'They are born as adults.', 'They live in groups.', 'They never learn.'], 'no parents to teach it'),
      mcx('Where are most of an octopus’s neurons located?', ['In its arms', 'In its brain', 'In its eyes', 'In its skin'], 'About two thirds of its neurons are located not in the brain but in the arms'),
      mcx('The word "severed" in the passage is closest in meaning to', ['cut off', 'injured', 'long', 'colorful'], 'a severed arm can still react to touch'),
      mcx('Why are octopuses useful to scientists?', ['Their intelligence evolved separately from that of mammals.', 'They live a long time.', 'They are easy to feed.', 'They are similar to humans.'], 'intelligence evolved separately in octopuses and in mammals'),
      mcx('Why do aquariums give octopuses puzzles?', ['A bored octopus may try to escape.', 'Puzzles make them grow.', 'Visitors enjoy puzzles.', 'Octopuses need exercise.'], 'a bored octopus will often escape from its tank'),
    ],
  },
  {
    id: 'dust-bowl',
    title: 'The Dust Bowl',
    text:
      'In the 1930s, a series of enormous dust storms swept across the Great Plains of the United States. The region, which includes parts of Oklahoma, Kansas and Texas, had been plowed up in the previous decades to grow wheat. When a long drought began in 1931, the dry soil, no longer held in place by the roots of native prairie grass, was lifted by the wind. On some days the "black blizzards" turned day into night and buried farms under drifts of dust.\n' +
      'Thousands of families lost their crops and their savings, and many migrated west, especially to California, in search of work. The government responded with programs that taught farmers to plant trees as windbreaks, to rotate crops and to plow along the contours of hills instead of straight up and down. The soil conservation methods that were introduced then are still used today. Historians describe the Dust Bowl as an environmental disaster that was partly caused by human decisions, not by the weather alone.',
    qs: [
      mcx('What made the soil easy for the wind to lift?', ['The roots of native grass were gone and the drought had dried the soil.', 'The soil was too wet.', 'There were too many trees.', 'Farmers stopped plowing.'], 'the dry soil, no longer held in place by the roots of native prairie grass, was lifted by the wind'),
      mcx('The phrase "black blizzards" refers to', ['dust storms', 'snowstorms', 'forest fires', 'rainstorms'], 'the "black blizzards" turned day into night'),
      mcx('What did many families do after losing their crops?', ['They migrated west to find work.', 'They planted wheat again.', 'They moved north to Canada.', 'They joined the army.'], 'many migrated west, especially to California, in search of work'),
      mcx('Which method was taught to farmers?', ['Plowing along the contours of hills', 'Plowing as deeply as possible', 'Removing all trees', 'Growing only wheat'], 'to plow along the contours of hills instead of straight up and down'),
      mcx('What does the author conclude about the cause of the Dust Bowl?', ['It was partly caused by human decisions.', 'It was caused only by weather.', 'It could not have been prevented.', 'It was caused by the government.'], 'partly caused by human decisions, not by the weather alone'),
    ],
  },
  {
    id: 'arctic-tern',
    title: 'The Longest Journey',
    text:
      'No animal travels farther each year than the Arctic tern, a small seabird that weighs about a hundred grams. It breeds in the Arctic in the northern summer, then flies to Antarctica to enjoy the southern summer, and returns the next spring. Tracking devices attached to the birds have shown that a tern may cover more than seventy thousand kilometers in a year, because it does not fly in a straight line but follows a winding route that takes advantage of favorable winds.\n' +
      'In this way, the bird sees more daylight than any other creature on Earth. The journey is dangerous, and not all terns complete it, but those that do can live for thirty years, which means that over its lifetime a single tern may travel a distance equal to three round trips to the Moon. Scientists are studying the birds’ routes to learn how climate change might affect the ocean food on which they depend, and conservationists protect their breeding colonies from disturbance by people and predators.',
    qs: [
      mcx('Why does the Arctic tern travel so far each year?', ['It follows the summers in both hemispheres.', 'It searches for new nesting places.', 'It avoids predators.', 'It follows ships.'], 'breeds in the Arctic in the northern summer, then flies to Antarctica to enjoy the southern summer'),
      mcx('Why does the tern not fly in a straight line?', ['It uses favorable winds.', 'It is lost.', 'It follows rivers.', 'It avoids mountains.'], 'follows a winding route that takes advantage of favorable winds'),
      mcx('The word "favorable" in the passage is closest in meaning to', ['helpful', 'dangerous', 'strong', 'cold'], 'takes advantage of favorable winds'),
      mcx('What can be inferred about the Arctic tern’s life?', ['It sees more daylight than any other creature.', 'It lives only one year.', 'It never rests.', 'It flies at night only.'], 'the bird sees more daylight than any other creature on Earth'),
      mcx('Why do scientists study the terns’ routes?', ['To learn how climate change may affect their ocean food', 'To count the birds', 'To improve aircraft', 'To find fishing grounds'], 'how climate change might affect the ocean food on which they depend'),
    ],
  },
  {
    id: 'roman-roads',
    title: 'All Roads Lead to Rome',
    text:
      'At its height, the Roman Empire was connected by more than eighty thousand kilometers of paved roads. They were built primarily for the army, which needed to move quickly to any part of the empire, but they also helped merchants, officials and ordinary travelers. A typical road was constructed in layers: a foundation of large stones, then gravel and sand, and finally a surface of tightly fitted flat stones. The road was slightly raised in the middle so that rainwater ran off to ditches at the sides.\n' +
      'Roman engineers preferred straight lines and often built bridges and tunnels rather than curving around obstacles. Milestones along the way showed the distance to the next town. Messages and officials could travel up to about fifty kilometers a day, and relay stations made it possible to move urgent news much faster. Many modern European highways follow the old routes, and some Roman roads are still in use after two thousand years, which shows how carefully they were built.',
    qs: [
      mcx('Why were the Roman roads built primarily?', ['For the army to move quickly', 'For tourists', 'For racing', 'For farmers'], 'built primarily for the army'),
      mcx('Why was the road raised slightly in the middle?', ['So that rainwater ran off to the sides', 'To make it look beautiful', 'To slow carts', 'To save stones'], 'raised in the middle so that rainwater ran off to ditches at the sides'),
      mcx('The word "obstacles" in the passage is closest in meaning to', ['things in the way', 'tools', 'travelers', 'villages'], 'rather than curving around obstacles'),
      mcx('What did milestones show?', ['The distance to the next town', 'The name of the builder', 'The year of construction', 'The weight allowed'], 'Milestones along the way showed the distance to the next town'),
      mcx('What does the author conclude about Roman roads?', ['They were carefully built and some are still used.', 'They were poorly built.', 'They were replaced by railways.', 'They were used only in Italy.'], 'some Roman roads are still in use after two thousand years'),
    ],
  },
  {
    id: 'mangroves',
    title: 'Forests in the Sea',
    text:
      'Mangroves are trees that grow in salty water along tropical coasts. Their tangled roots rise above the mud, and many species have special ways of dealing with salt: some filter it at the roots, while others store it in leaves that eventually fall off. The roots slow the movement of water, trapping sediment and building up land, and they provide a nursery for young fish, crabs and shrimp that later move to the open sea.\n' +
      'Mangroves also protect coasts. When a powerful storm or tsunami strikes, the dense roots absorb much of the wave’s energy, reducing damage to villages behind them. Mangrove soils store large amounts of carbon, in some cases several times more per hectare than inland forests, which makes them an important ally against climate change. Even so, over a third of the world’s mangroves have been cleared in the last fifty years to make room for shrimp farms and tourist resorts. Restoration projects, in which local people plant seedlings, have shown that damaged forests can recover within about a decade.',
    qs: [
      mcx('How do some mangroves deal with salt?', ['They store it in leaves that later fall off.', 'They drink fresh water only.', 'They grow without roots.', 'They release it as gas.'], 'others store it in leaves that eventually fall off'),
      mcx('What do the roots do for young fish?', ['They provide a nursery.', 'They feed them salt.', 'They hide them from the sea forever.', 'They move them inland.'], 'they provide a nursery for young fish, crabs and shrimp'),
      mcx('The word "absorb" in the passage is closest in meaning to', ['take in', 'push away', 'cover', 'create'], 'the dense roots absorb much of the wave’s energy'),
      mcx('Why are mangroves important in fighting climate change?', ['Their soils store a great deal of carbon.', 'They produce clouds.', 'They cool the sea.', 'They block sunlight.'], 'Mangrove soils store large amounts of carbon'),
      mcx('What has caused mangrove loss?', ['Clearing for shrimp farms and tourist resorts', 'Disease', 'Cold weather', 'Lack of sunshine'], 'cleared in the last fifty years to make room for shrimp farms and tourist resorts'),
    ],
  },
];
