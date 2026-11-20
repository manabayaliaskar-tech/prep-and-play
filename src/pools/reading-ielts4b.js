// Дополнительные тексты IELTS Reading (авторские), часть 2.
import { mcx, tfx } from './reading-kit.js';

export const IELTS_MORE4B = [
  {
    id: 'chess-history',
    title: 'The Long History of Chess',
    text:
      'Chess is among the oldest strategy games still played today. Its ancestor, a game called chaturanga, appeared in India around the sixth century. The game represented the four divisions of an ancient army: infantry, cavalry, elephants and chariots. It spread to Persia, where players began to announce "shah" when attacking the king, and then to the Arab world, where the word became "check".\n' +
      'Chess reached Europe by the tenth century. At that time the queen was a weak piece, able to move only one square diagonally. In the fifteenth century the rules changed, and the queen became the most powerful piece on the board, which made games faster and more exciting. In 1997, a computer called Deep Blue defeated the world champion Garry Kasparov in a match, a result that surprised many people. Today, millions of people play online, and programs are far stronger than any human player.',
    qs: [
      tfx('Chess began in India.', 'T', 'a game called chaturanga, appeared in India around the sixth century'),
      tfx('The queen has always been the strongest piece.', 'F', 'At that time the queen was a weak piece'),
      tfx('Deep Blue was built by a team of Russian engineers.', 'N'),
      mcx('What did the pieces of chaturanga represent?', ['The divisions of an army', 'The seasons of the year', 'The ranks of a royal court', 'The rivers of India'], 'the four divisions of an ancient army'),
      mcx('What changed in the fifteenth century?', ['The queen became the most powerful piece.', 'The game moved to Persia.', 'The king stopped being important.', 'Computers started to play.'], 'the queen became the most powerful piece on the board'),
    ],
  },
  {
    id: 'volcano',
    title: 'Living Next to a Volcano',
    text:
      'Around the world, roughly 800 million people live within one hundred kilometers of an active volcano. They are drawn by fertile soil: volcanic ash is rich in minerals, and crops grow well in it. Tourism is another benefit, since visitors come to see lava flows and hot springs. In some countries, geothermal power stations use underground heat to produce electricity.\n' +
      'The risks, however, are real. In 79 AD, the eruption of Mount Vesuvius buried the Roman towns of Pompeii and Herculaneum under ash within hours. Modern scientists monitor volcanoes with instruments that detect small earthquakes, changes in gas emissions and swelling of the ground. These signals often appear days or weeks before an eruption, allowing authorities to organize evacuations. Even so, predicting the exact time of an eruption remains difficult, and some volcanoes have remained quiet for centuries before erupting without warning.',
    qs: [
      tfx('Volcanic ash is poor in minerals.', 'F', 'volcanic ash is rich in minerals'),
      tfx('The eruption of Vesuvius happened in 79 AD.', 'T', 'In 79 AD, the eruption of Mount Vesuvius'),
      tfx('Most volcanoes erupt once every hundred years.', 'N'),
      mcx('What do scientists use to monitor volcanoes?', ['Instruments that detect earthquakes, gas and ground swelling', 'Reports from tourists', 'Satellite images of rainfall', 'Records of animal behavior'], 'detect small earthquakes, changes in gas emissions and swelling of the ground'),
      mcx('What is still difficult?', ['Predicting the exact time of an eruption', 'Finding fertile soil', 'Building power stations', 'Counting people near volcanoes'], 'predicting the exact time of an eruption remains difficult'),
    ],
  },
  {
    id: 'coffee',
    title: 'From Ethiopian Hills to Every Café',
    text:
      'Coffee is one of the most widely traded products in the world, but its history began with a plant growing wild in the highlands of Ethiopia. A popular story tells of a goat herder who noticed that his goats became energetic after eating the red berries of a certain bush. Whether or not the story is true, people in the region learned to prepare drinks from the berries.\n' +
      'By the fifteenth century, coffee was being grown in Yemen and drunk in religious gatherings in the Arabian Peninsula. Coffee houses opened in cities such as Istanbul and Cairo, where people met to talk, play games and listen to music. The drink arrived in Europe in the seventeenth century, and coffee houses in London and Vienna became centers of conversation and trade. Today, Brazil produces about a third of the world’s coffee, and more than two billion cups are drunk every day.',
    qs: [
      tfx('Coffee first grew wild in Ethiopia.', 'T', 'a plant growing wild in the highlands of Ethiopia'),
      tfx('The goat herder story is proven to be true.', 'F', 'Whether or not the story is true'),
      tfx('Coffee houses in Cairo served food as well as drinks.', 'N'),
      mcx('When did coffee arrive in Europe?', ['In the seventeenth century', 'In the fifteenth century', 'In the twentieth century', 'In the ninth century'], 'The drink arrived in Europe in the seventeenth century'),
      mcx('Which country produces about a third of the world’s coffee?', ['Brazil', 'Yemen', 'Ethiopia', 'Turkey'], 'Brazil produces about a third of the world’s coffee'),
    ],
  },
  {
    id: 'ancient-olympics',
    title: 'The Ancient Olympic Games',
    text:
      'The first recorded Olympic Games took place in 776 BC at Olympia, a sanctuary in southern Greece dedicated to Zeus. At first there was only one event, a short foot race, but over the centuries wrestling, boxing, chariot racing and the pentathlon were added. The Games were held every four years and were so important that city-states would declare a truce, allowing athletes and spectators to travel safely.\n' +
      'Only free Greek men were allowed to compete, and the athletes trained for months beforehand. The winners received a wreath made from olive leaves, but they were honored at home with money, free meals and statues. Women were not permitted to watch the main events, although they held their own festival in honor of the goddess Hera. The Games continued for more than a thousand years until they were banned in the late fourth century AD by a Roman emperor who considered them a pagan custom.',
    qs: [
      tfx('The earliest Olympic Games had many different sports.', 'F', 'At first there was only one event, a short foot race'),
      tfx('City-states declared a truce so that people could travel to Olympia.', 'T', 'city-states would declare a truce'),
      tfx('The athletes were required to train at Olympia for a year.', 'N'),
      mcx('What did winners receive at the Games?', ['A wreath of olive leaves', 'A gold medal', 'A house', 'A horse'], 'a wreath made from olive leaves'),
      mcx('Why were the Games eventually banned?', ['A Roman emperor considered them a pagan custom.', 'There was a lack of athletes.', 'Women protested.', 'Olympia was destroyed by war.'], 'a Roman emperor who considered them a pagan custom'),
    ],
  },
  {
    id: 'telescope',
    title: 'Galileo and the Telescope',
    text:
      'The telescope was probably invented in the Netherlands in 1608, when a spectacle maker applied for a patent for a device that made distant objects look closer. The following year, the Italian scientist Galileo Galilei heard about it, built his own version and improved its power to about twenty times magnification. In 1610, he pointed it at the sky and made discoveries that changed astronomy.\n' +
      'Galileo saw that the Moon had mountains and craters, that the Milky Way consisted of countless stars, and that four moons circled the planet Jupiter. The last observation was especially important: it proved that not everything in the sky revolved around the Earth. Galileo’s support for the idea that the Earth moves around the Sun brought him into conflict with the Church, and in 1633 he was forced to publicly withdraw his claims and spent the rest of his life under house arrest. His books, however, were read across Europe, and later scientists confirmed his ideas.',
    qs: [
      tfx('Galileo invented the telescope.', 'F', 'probably invented in the Netherlands in 1608'),
      tfx('Galileo discovered four moons of Jupiter.', 'T', 'four moons circled the planet Jupiter'),
      tfx('Galileo’s telescope was sold to several European kings.', 'N'),
      mcx('Why was the observation of Jupiter’s moons important?', ['It proved that not everything revolved around the Earth.', 'It showed that Jupiter was the largest planet.', 'It explained why the Moon has craters.', 'It was the first use of a telescope.'], 'it proved that not everything in the sky revolved around the Earth'),
      mcx('What happened to Galileo in 1633?', ['He was forced to withdraw his claims and lived under house arrest.', 'He received a prize.', 'He moved to the Netherlands.', 'He stopped writing books.'], 'forced to publicly withdraw his claims and spent the rest of his life under house arrest'),
    ],
  },
  {
    id: 'vaccination',
    title: 'The First Vaccine',
    text:
      'Smallpox was one of the deadliest diseases in history, killing roughly three in every ten people who caught it and leaving survivors with deep scars. In the late eighteenth century, an English country doctor named Edward Jenner noticed that milkmaids who had caught a mild disease called cowpox seemed protected from smallpox. In 1796, he tested his idea by placing material from a cowpox sore into a cut on the arm of a young boy. When the boy was later exposed to smallpox, he did not become ill.\n' +
      'Jenner called the method "vaccination", from the Latin word for cow. Although some critics opposed it, the practice spread quickly across Europe and beyond. Over the following two centuries, vaccination programs reduced smallpox cases dramatically, and in 1980 the World Health Organization declared the disease eradicated. It remains the only human infectious disease to have been completely wiped out, a success that inspired the development of vaccines against many other illnesses.',
    qs: [
      tfx('Jenner noticed that milkmaids who had cowpox seemed protected from smallpox.', 'T', 'milkmaids who had caught a mild disease called cowpox seemed protected from smallpox'),
      tfx('Smallpox was declared eradicated in 1950.', 'F', 'in 1980 the World Health Organization declared the disease eradicated'),
      tfx('The boy in Jenner’s experiment was Jenner’s own son.', 'N'),
      mcx('Where does the word "vaccination" come from?', ['The Latin word for cow', 'The Greek word for health', 'The name of a doctor', 'The Arabic word for medicine'], 'from the Latin word for cow'),
      mcx('What is special about smallpox?', ['It is the only human infectious disease completely wiped out.', 'It was the first disease to be cured by medicine.', 'It only affected animals.', 'It disappeared without vaccination.'], 'the only human infectious disease to have been completely wiped out'),
    ],
  },
  {
    id: 'urban-gardens',
    title: 'Gardens in the City',
    text:
      'Across the world, residents of large cities are turning empty lots, rooftops and balconies into vegetable gardens. Supporters say that urban gardens bring several benefits. Fresh food grown close to home reduces the distance it must be transported, which cuts pollution. Gardens also provide a place for neighbors to meet, and studies suggest that people who garden regularly report lower levels of stress.\n' +
      'Urban gardening has challenges, too. City soil may contain traces of lead or other pollutants, so gardeners are advised to test it, or to grow plants in raised beds filled with clean soil. Water is expensive in some cities, and gardens on rooftops need strong structures to hold the weight. Some cities have introduced programs that lend vacant land to community groups for a small fee. In one large European city, such gardens now supply about a tenth of the fresh vegetables eaten by their members, according to local surveys.',
    qs: [
      tfx('Growing food close to home can reduce pollution from transport.', 'T', 'reduces the distance it must be transported, which cuts pollution'),
      tfx('City soil is always clean enough for vegetables.', 'F', 'City soil may contain traces of lead or other pollutants'),
      tfx('Most urban gardeners are retired people.', 'N'),
      mcx('What are gardeners advised to do about city soil?', ['Test it or use raised beds with clean soil', 'Replace it every year', 'Cover it with plastic', 'Avoid planting vegetables'], 'gardeners are advised to test it, or to grow plants in raised beds filled with clean soil'),
      mcx('What do some cities do to support community gardens?', ['Lend vacant land for a small fee', 'Pay gardeners a salary', 'Provide free water', 'Ban rooftop gardens'], 'lend vacant land to community groups for a small fee'),
    ],
  },
  {
    id: 'whale-songs',
    title: 'Songs of the Humpback Whale',
    text:
      'Humpback whales are famous for their songs, which can last up to twenty minutes and be heard many kilometers away. Only males sing, and scientists believe the songs are used to attract mates. All the males in one population sing the same song at a given time, and the song gradually changes over the months: new phrases appear and old ones disappear.\n' +
      'In some cases, a new song spreads across the ocean. In the 1990s, researchers recorded a song from the west coast of Australia that, within two years, was being sung by whales on the east coast, thousands of kilometers away. Scientists compare this to the way a catchy pop song can spread from city to city. They do not yet know how whales learn the songs or why the changes occur. Because ships and industry have made the oceans noisier, researchers also worry that human noise may interfere with whales’ communication.',
    qs: [
      tfx('Both male and female humpback whales sing.', 'F', 'Only males sing'),
      tfx('A humpback song can last up to twenty minutes.', 'T', 'can last up to twenty minutes'),
      tfx('Whales sing mainly at night.', 'N'),
      mcx('What happened to a song recorded off western Australia?', ['It spread to whales on the east coast within two years.', 'It disappeared after a month.', 'It was sung only by females.', 'It was copied by dolphins.'], 'within two years, was being sung by whales on the east coast'),
      mcx('Why are researchers worried?', ['Human noise may interfere with communication.', 'Whales have stopped singing.', 'Songs are becoming too long.', 'Males sing too loudly.'], 'human noise may interfere with whales’ communication'),
    ],
  },
  {
    id: 'remote-work',
    title: 'Working from Anywhere',
    text:
      'In the past decade, the number of people who work from home at least part of the week has grown rapidly. Employers have found that remote work can reduce the cost of office space, and many employees say that they save time and money by not commuting. Surveys show that workers value the flexibility to arrange their day around family and personal needs.\n' +
      'Remote work also has drawbacks. Some employees report feeling isolated, and it can be difficult to separate work from home life when the kitchen table is also the office. Managers sometimes worry that ideas develop less easily when colleagues do not meet in person. As a result, many companies are adopting a hybrid model, in which employees come to the office two or three days a week and work remotely for the remainder. Researchers who have followed hybrid workers say that productivity generally remains stable, but they note that the results depend on the type of job.',
    qs: [
      tfx('Remote work can reduce the cost of office space for employers.', 'T', 'remote work can reduce the cost of office space'),
      tfx('All managers believe that ideas develop better at home.', 'F', 'Managers sometimes worry that ideas develop less easily'),
      tfx('Hybrid workers earn higher salaries than office workers.', 'N'),
      mcx('What is a hybrid model?', ['Working in the office part of the week and remotely the rest', 'Working only at night', 'Working in two different companies', 'Working only from home'], 'employees come to the office two or three days a week and work remotely for the remainder'),
      mcx('What do researchers say about productivity in hybrid work?', ['It generally remains stable but depends on the job.', 'It always falls.', 'It doubles.', 'It cannot be measured.'], 'productivity generally remains stable, but they note that the results depend on the type of job'),
    ],
  },
];
