// Дополнительные тексты TOEFL Reading (авторские), часть 2.
import { mcx } from './reading-kit.js';

export const TOEFL_MORE4B = [
  {
    id: 'ice-cores',
    title: 'Reading the Ice',
    text:
      'Deep in the ice sheets of Antarctica and Greenland lies a record of Earth’s climate stretching back hundreds of thousands of years. Each year, new snow falls on top of the old snow and gradually compresses into ice, trapping tiny bubbles of the atmosphere. By drilling long cylinders of ice, called ice cores, scientists can analyze the air that was sealed in thousands of years ago.\n' +
      'The bubbles show that the amount of carbon dioxide in the air has varied naturally with the ice ages, but today’s level is higher than at any time in the past 800,000 years. Chemical changes in the ice also reveal temperatures: the ratio of different forms of oxygen in the ice depends on how cold it was when the snow fell. The work is difficult, since drilling takes place in extreme cold, and the cores must be kept frozen during transport. Nevertheless, ice cores have become one of the most important sources of evidence about climate change.',
    qs: [
      mcx('How does the ice trap information about the atmosphere?', ['Snow compresses into ice and traps bubbles of air.', 'Wind records its direction in the ice.', 'Animals leave tracks in the ice.', 'Sunlight changes the color of the ice.'], 'gradually compresses into ice, trapping tiny bubbles of the atmosphere'),
      mcx('What do the bubbles show about carbon dioxide today?', ['The level is higher than in the past 800,000 years.', 'The level is the lowest in history.', 'The level has not changed.', 'The level varies with the seasons.'], 'today’s level is higher than at any time in the past 800,000 years'),
      mcx('The word "extreme" in the passage is closest in meaning to', ['very severe', 'unusual in color', 'pleasant', 'short'], 'drilling takes place in extreme cold'),
      mcx('How can scientists learn temperatures from the ice?', ['By the ratio of forms of oxygen in the ice', 'By measuring the thickness of each layer', 'By counting the bubbles', 'By the color of the ice'], 'the ratio of different forms of oxygen in the ice depends on how cold it was'),
      mcx('What can be inferred about ice core research?', ['It is difficult but very valuable.', 'It is easy and cheap.', 'It is only done in warm places.', 'It is no longer used.'], 'Nevertheless, ice cores have become one of the most important sources of evidence'),
    ],
  },
  {
    id: 'black-death',
    title: 'The Black Death',
    text:
      'In 1347, ships from the Black Sea brought a deadly disease to ports in Italy. Within four years, the plague, which came to be called the Black Death, had spread across Europe and killed perhaps a third of the population. Fleas living on rats carried the bacteria, and ships and trade routes carried the rats. Doctors of the time did not know the cause; some blamed bad air, others blamed the position of the stars.\n' +
      'The shortage of people had lasting effects. Because there were fewer workers, those who survived could demand higher wages, and many peasants left the estates of landowners to seek better terms. Some historians argue that these changes weakened the old feudal system. Cities began to introduce quarantine, keeping ships offshore for forty days before they could unload, and the word "quarantine" itself comes from the Italian for "forty days". Although the epidemic was terrible, it left Europe with new ideas about public health and about the value of labor.',
    qs: [
      mcx('How did the Black Death spread, according to the passage?', ['Fleas on rats carried it along ships and trade routes.', 'Soldiers carried it in wars.', 'It traveled with birds.', 'It spread through polluted rivers.'], 'Fleas living on rats carried the bacteria, and ships and trade routes carried the rats'),
      mcx('What was one effect of the shortage of workers?', ['Survivors could demand higher wages.', 'Wages fell sharply.', 'Landowners grew richer.', 'Cities stopped growing.'], 'those who survived could demand higher wages'),
      mcx('The word "quarantine" comes from', ['the Italian for "forty days"', 'the name of a doctor', 'a Greek word for plague', 'a Latin word for ship'], 'the word "quarantine" itself comes from the Italian for "forty days"'),
      mcx('What did doctors of the time believe?', ['Some blamed bad air and others the stars.', 'They knew bacteria caused it.', 'They blamed rats only.', 'They blamed ships only.'], 'some blamed bad air, others blamed the position of the stars'),
      mcx('What can be inferred from the final sentence?', ['The epidemic led to new ideas despite its horror.', 'The epidemic had no lasting effects.', 'Europe forgot the disaster quickly.', 'Public health was already well developed.'], 'it left Europe with new ideas about public health and about the value of labor'),
    ],
  },
  {
    id: 'gothic',
    title: 'Cathedrals of Stone and Light',
    text:
      'In the twelfth century, builders in France began to construct churches that were taller and brighter than anything seen before. The new style, later called Gothic, used pointed arches that carried weight more efficiently than the rounded arches of earlier buildings. A second invention, the flying buttress, was an arch outside the wall that transferred the weight of the roof to heavy piers on the ground. Because the walls no longer had to support the roof, builders could fill them with large windows of colored glass.\n' +
      'The result was an interior flooded with light in many colors. For people who could not read, the windows, which depicted scenes from the Bible and from the lives of saints, served as pictures that told stories. Building a cathedral took decades or even centuries, and it required the work of stonemasons, carpenters, glassmakers and many laborers. Notre-Dame in Paris, begun in 1163, took nearly two hundred years to complete. Today, Gothic cathedrals remain among the most admired achievements of medieval Europe.',
    qs: [
      mcx('What was the purpose of the flying buttress?', ['To carry the weight of the roof to piers on the ground', 'To decorate the entrance', 'To hold the bells', 'To provide a shelter for pilgrims'], 'transferred the weight of the roof to heavy piers on the ground'),
      mcx('Why could Gothic builders include large windows?', ['The walls no longer had to support the roof.', 'Glass became cheaper.', 'Fewer workers were needed.', 'Churches became smaller.'], 'the walls no longer had to support the roof'),
      mcx('The word "depicted" in the passage is closest in meaning to', ['showed in a picture', 'hid', 'wrote about', 'measured'], 'windows, which depicted scenes from the Bible'),
      mcx('How were the windows useful to people who could not read?', ['They told stories in pictures.', 'They taught them to write.', 'They measured time.', 'They kept the church warm.'], 'served as pictures that told stories'),
      mcx('What does the passage say about building cathedrals?', ['It often took decades or even centuries.', 'It took one year.', 'It needed only stonemasons.', 'It required no planning.'], 'took decades or even centuries'),
    ],
  },
  {
    id: 'echolocation',
    title: 'Seeing with Sound',
    text:
      'Bats are active at night, when little light is available, and most species find their way and their food by echolocation. A bat produces high-pitched calls, often too high for humans to hear, and listens to the echoes that bounce back from objects. By measuring how long an echo takes to return, the bat judges the distance of an object; the change in the pitch of the echo shows whether an insect is moving toward or away from it.\n' +
      'When a bat approaches its target, it increases the number of calls to as many as two hundred per second, giving a more detailed picture just before it catches the prey. Some moths have evolved defenses: certain species can hear the bat’s calls and dive toward the ground, while others produce clicks that confuse the bat’s sonar. Engineers have studied echolocation in order to design devices for the blind and sonar for submarines. A single bat can eat thousands of insects in a night, which makes bats valuable allies for farmers.',
    qs: [
      mcx('How does a bat judge the distance to an object?', ['By measuring how long an echo takes to return', 'By seeing the object in the dark', 'By smelling it', 'By feeling vibrations in the ground'], 'By measuring how long an echo takes to return'),
      mcx('What does a bat do as it approaches its target?', ['It increases the number of calls.', 'It becomes silent.', 'It flies higher.', 'It lowers the pitch of its calls.'], 'it increases the number of calls to as many as two hundred per second'),
      mcx('The word "defenses" in the passage is closest in meaning to', ['ways of protecting themselves', 'ways of hunting', 'sounds of danger', 'colors'], 'Some moths have evolved defenses'),
      mcx('How do some moths confuse bats?', ['They produce clicks that confuse the bat’s sonar.', 'They fly in large groups.', 'They stay still.', 'They hide in caves.'], 'others produce clicks that confuse the bat’s sonar'),
      mcx('Why are bats valuable to farmers?', ['They eat large numbers of insects.', 'They carry pollen.', 'They produce fertilizer only.', 'They scare birds.'], 'A single bat can eat thousands of insects in a night'),
    ],
  },
  {
    id: 'mongol-post',
    title: 'The Mongol Messenger System',
    text:
      'In the thirteenth century, the Mongol Empire stretched from the Pacific coast of Asia to Eastern Europe, the largest land empire in history. To govern such a vast area, the rulers organized a relay messenger system known as the yam. Stations were built every thirty to fifty kilometers along main routes, and each held fresh horses, food and lodging. A rider carrying an important message would gallop to the next station, hand the message to a rested rider, and the message would continue without stopping.\n' +
      'Using this system, riders could cover more than two hundred kilometers in a day, far faster than ordinary travelers. Officials carried a metal tablet, called a paiza, which gave them the right to use the stations and demand horses. The yam also helped merchants and travelers, such as the Venetian Marco Polo, who described it with admiration. Maintaining the stations was a heavy burden for local people, who had to supply animals and food, and some complained about the abuse of the paiza by officials. Nevertheless, the system remained in operation for generations and helped to keep trade routes safe.',
    qs: [
      mcx('What was the yam?', ['A relay messenger system', 'A type of horse', 'A Mongol army unit', 'A trade tax'], 'a relay messenger system known as the yam'),
      mcx('What did a paiza allow officials to do?', ['Use the stations and demand horses', 'Collect taxes', 'Command the army', 'Cross borders without papers'], 'gave them the right to use the stations and demand horses'),
      mcx('The word "burden" in the passage is closest in meaning to', ['heavy responsibility', 'reward', 'story', 'discovery'], 'Maintaining the stations was a heavy burden for local people'),
      mcx('How far could riders go in a day?', ['More than two hundred kilometers', 'About fifty kilometers', 'About ten kilometers', 'About one thousand kilometers'], 'riders could cover more than two hundred kilometers in a day'),
      mcx('What can be inferred about the system’s effect on trade?', ['It helped keep trade routes safe.', 'It stopped trade.', 'It ended in a few years.', 'It served only the army.'], 'helped to keep trade routes safe'),
    ],
  },
  {
    id: 'panama-canal',
    title: 'Cutting Through a Continent',
    text:
      'Before the Panama Canal opened in 1914, a ship traveling from New York to San Francisco had to sail around the southern tip of South America, a journey of about 22,000 kilometers. The canal shortened the trip by nearly half. A French company had begun the project in the 1880s but failed, partly because of engineering problems and partly because thousands of workers died of diseases such as malaria and yellow fever.\n' +
      'When the United States took over the work in 1904, doctors first launched a campaign to control mosquitoes by draining standing water and spraying breeding places, which sharply reduced the sickness. Engineers then built a system of locks, which lift ships up to a lake in the middle of the canal and lower them again at the other end. The construction required moving more earth than any previous project. Today, about five percent of the world’s sea trade passes through the canal, and a larger set of locks, opened in 2016, allows bigger ships to use it.',
    qs: [
      mcx('How did the canal change the trip from New York to San Francisco?', ['It shortened the journey by nearly half.', 'It doubled the distance.', 'It made no difference.', 'It was possible only in summer.'], 'The canal shortened the trip by nearly half'),
      mcx('Why did the French project fail?', ['Because of engineering problems and disease', 'Because of a war', 'Because the company ran out of land', 'Because of an earthquake'], 'partly because of engineering problems and partly because thousands of workers died of diseases'),
      mcx('The word "launched" in the passage is closest in meaning to', ['started', 'delayed', 'cancelled', 'finished'], 'doctors first launched a campaign to control mosquitoes'),
      mcx('What is the function of the locks?', ['They lift and lower ships between water levels.', 'They protect against storms.', 'They collect tolls.', 'They produce electricity only.'], 'lift ships up to a lake in the middle of the canal and lower them again'),
      mcx('What does the passage say about the canal today?', ['About five percent of world sea trade passes through it.', 'It is no longer used.', 'It carries all of the world’s trade.', 'Only small ships can use it.'], 'about five percent of the world’s sea trade passes through the canal'),
    ],
  },
  {
    id: 'lighthouse',
    title: 'Guardians of the Coast',
    text:
      'For centuries, lighthouses have warned sailors of dangerous rocks and guided ships into harbor. The most famous of the ancient ones, the Pharos of Alexandria, was built around 280 BC and stood well over a hundred meters tall; it was counted among the Seven Wonders of the Ancient World. Early lighthouses burned wood or oil, and the light was visible for only a few kilometers.\n' +
      'A great advance came in 1822, when the French physicist Augustin Fresnel invented a lens made of rings of glass that gathered the light and focused it into a strong beam. A Fresnel lens could be seen from forty kilometers away, using far less fuel than before. Lighthouse keepers lived in the towers, polishing the lenses and refilling the lamps, and in storms their work could save hundreds of lives. In the twentieth century, automatic lights and satellite navigation made most keepers unnecessary. Many lighthouses are now museums, and some are protected as historical monuments.',
    qs: [
      mcx('What was the Pharos of Alexandria?', ['An ancient lighthouse counted among the Seven Wonders', 'A harbor wall', 'A royal palace', 'A library'], 'it was counted among the Seven Wonders of the Ancient World'),
      mcx('What did Fresnel’s lens do?', ['It focused the light into a strong beam.', 'It made the light colorful.', 'It rotated by itself.', 'It reduced the height of towers.'], 'gathered the light and focused it into a strong beam'),
      mcx('The word "advance" in the passage is closest in meaning to', ['improvement', 'war', 'delay', 'warning'], 'A great advance came in 1822'),
      mcx('Why are keepers no longer needed in most lighthouses?', ['Automatic lights and satellite navigation replaced them.', 'Ships stopped sailing.', 'Lighthouses were destroyed.', 'Keepers refused to work.'], 'automatic lights and satellite navigation made most keepers unnecessary'),
      mcx('What can be inferred about early lighthouses?', ['Their light was visible only over short distances.', 'They used electricity.', 'They were very small.', 'They were not important.'], 'the light was visible for only a few kilometers'),
    ],
  },
  {
    id: 'maya-calendar',
    title: 'The Maya and Time',
    text:
      'The Maya civilization of Central America, which flourished between about 250 and 900 AD, developed one of the most sophisticated systems for measuring time in the ancient world. They kept two main calendars at once. The first, of 365 days, followed the solar year and guided agriculture. The second had 260 days and was used for religious ceremonies. Every 52 years, the two cycles began on the same day, an event that was celebrated with festivals.\n' +
      'Maya priests observed the sky with remarkable care, without telescopes, and recorded the movements of the Sun, Moon and Venus. They could predict eclipses, and their calculations of the Venus cycle were accurate to within a few hours over centuries. They also used a number system that included a symbol for zero, a concept that many other civilizations of the time lacked. Although many Maya books were destroyed after the Spanish conquest, calendars carved in stone have survived and still allow scholars to study the Maya view of time.',
    qs: [
      mcx('What was the purpose of the 365-day calendar?', ['It followed the solar year and guided agriculture.', 'It was used for religious ceremonies.', 'It marked royal birthdays.', 'It counted the days of war.'], 'followed the solar year and guided agriculture'),
      mcx('What happened every 52 years?', ['The two cycles began on the same day.', 'A new king took power.', 'The calendar was destroyed.', 'A comet appeared.'], 'Every 52 years, the two cycles began on the same day'),
      mcx('The word "sophisticated" in the passage is closest in meaning to', ['highly developed', 'simple', 'unknown', 'expensive'], 'one of the most sophisticated systems for measuring time'),
      mcx('What did the Maya number system have that many other systems lacked?', ['A symbol for zero', 'A decimal point', 'Letters for numbers', 'A symbol for infinity'], 'a number system that included a symbol for zero'),
      mcx('Why can scholars still study the Maya view of time?', ['Calendars carved in stone have survived.', 'Spanish books describe it exactly.', 'Maya descendants wrote it down recently.', 'All Maya books survived.'], 'calendars carved in stone have survived'),
    ],
  },
  {
    id: 'continental-drift',
    title: 'The Moving Continents',
    text:
      'If one looks at a world map, the east coast of South America seems to fit against the west coast of Africa like pieces of a puzzle. In 1912, the German scientist Alfred Wegener proposed that the continents had once been joined in a single landmass and had slowly drifted apart. He supported this idea with evidence: similar fossils of land animals and plants had been found on continents now separated by oceans, and rock formations on both sides matched.\n' +
      'Most geologists rejected the theory at first, because Wegener could not explain what force could move such enormous masses. The answer came in the 1950s and 1960s, when studies of the ocean floor revealed long mountain ranges where new crust is formed and spreads outward. This led to the theory of plate tectonics, according to which the Earth’s outer shell is divided into large plates that move a few centimeters a year, about as fast as a fingernail grows. The movement of the plates explains earthquakes, volcanoes and the formation of mountains.',
    qs: [
      mcx('What did Wegener propose in 1912?', ['The continents had once been joined and drifted apart.', 'The oceans were growing deeper.', 'Mountains were sinking.', 'Earth was expanding.'], 'the continents had once been joined in a single landmass and had slowly drifted apart'),
      mcx('Why did most geologists reject the theory at first?', ['Wegener could not explain what force moved the continents.', 'There were no fossils.', 'It was too old.', 'It contradicted the Bible.'], 'Wegener could not explain what force could move such enormous masses'),
      mcx('The word "rejected" in the passage is closest in meaning to', ['did not accept', 'tested', 'praised', 'remembered'], 'Most geologists rejected the theory at first'),
      mcx('How fast do plates move?', ['A few centimeters a year', 'A few meters a day', 'Many kilometers a year', 'They do not move'], 'move a few centimeters a year, about as fast as a fingernail grows'),
      mcx('What does plate tectonics explain?', ['Earthquakes, volcanoes and mountain formation', 'Ocean tides', 'Weather patterns', 'The age of the Sun'], 'explains earthquakes, volcanoes and the formation of mountains'),
    ],
  },
  {
    id: 'potato-europe',
    title: 'The Potato Arrives in Europe',
    text:
      'The potato was first domesticated thousands of years ago in the Andes of South America, where farmers grew hundreds of varieties suited to different altitudes. Spanish explorers brought it to Europe in the sixteenth century, but at first people were suspicious. The plant belongs to the same family as poisonous nightshade, and Europeans, who did not know that only the tubers are edible, sometimes became ill after eating the leaves and fruits.\n' +
      'Acceptance came slowly. In the eighteenth century, rulers such as Frederick the Great of Prussia ordered farmers to plant potatoes to protect them from famine, because the crop produced more calories per hectare than grain and grew in poor soil. By the nineteenth century, the potato had become the main food of the poor in Ireland. When a disease destroyed the crop in the 1840s, about a million people died and a million more emigrated. The disaster shows the danger of depending on a single crop, especially one grown from just a few varieties.',
    qs: [
      mcx('Why were Europeans suspicious of the potato at first?', ['It belongs to the same family as a poisonous plant.', 'It was too expensive.', 'It tasted bitter.', 'It was brought by enemies.'], 'belongs to the same family as poisonous nightshade'),
      mcx('Why did rulers encourage farmers to plant potatoes?', ['It protected people from famine.', 'It was easy to sell.', 'It improved the soil.', 'It could be turned into medicine.'], 'to protect them from famine'),
      mcx('The word "suspicious" in the passage is closest in meaning to', ['doubtful', 'curious', 'angry', 'happy'], 'at first people were suspicious'),
      mcx('What happened in Ireland in the 1840s?', ['A disease destroyed the potato crop.', 'Farmers stopped planting potatoes.', 'The crop grew very large.', 'The government banned potatoes.'], 'a disease destroyed the crop in the 1840s'),
      mcx('What lesson does the author draw?', ['Depending on a single crop is dangerous.', 'Potatoes are unhealthy.', 'Grain is better than potatoes.', 'Farmers should avoid new crops.'], 'the danger of depending on a single crop'),
    ],
  },
];
