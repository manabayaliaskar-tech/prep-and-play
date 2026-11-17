// IELTS Academic Reading · Test 3: Великая зелёная стена, полоски зебры, письмо от руки.

import { INTRO, choice, gap, head, tf } from './kit.js';

export const TEST_3 = {
  id: 'academic-3',
  title: 'IELTS Academic Reading · Test 3',
  passages: [
    {
      title: 'A Wall of Trees Across Africa',
      paras: [
        ['A', 'In 2007 the African Union launched one of the most ambitious environmental projects ever attempted. The plan, known as the Great Green Wall, was to plant a belt of trees roughly fifteen kilometres wide and about eight thousand kilometres long across the Sahel, the semi-arid region on the southern edge of the Sahara that stretches from Senegal in the west to Djibouti in the east. The wall was meant to halt the spread of the desert, protect farmland and give millions of people living on degraded land a more secure future. It quickly became a symbol of hope, attracting attention and promises of money from governments and international organisations. Eleven countries along the route originally signed up, and others later joined.'],
        ['B', 'The problem the project set out to solve is real. Since the droughts of the 1970s and 1980s, large areas of the Sahel have lost vegetation and fertile soil. Population growth, overgrazing and the cutting of trees for firewood have added to the pressure, while rainfall has become less predictable. When land loses its plant cover, wind and heavy rain carry away the topsoil, and harvests decline. For families who depend on farming and herding, the consequences can include hunger, conflict over scarce resources and migration to cities or abroad. Restoring the land is therefore not only an environmental goal but also a question of survival.'],
        ['C', 'Progress, however, has been far slower than planned. The project’s official goal was to restore one hundred million hectares of land by 2030, but an assessment published in 2020 concluded that only a small fraction of that area had been restored. In some countries, millions of seedlings were planted only for most of them to die within a year or two, because they were placed in unsuitable soil, received too little water or were eaten by livestock. Funding, too, has arrived unevenly, and insecurity in parts of the region has made work on the ground difficult or impossible.'],
        ['D', 'These difficulties have led to a significant change of approach. Many experts now argue that the idea of a continuous line of trees was misleading from the start. Deserts do not advance like an army along a front; land degradation happens in patches, wherever soil and vegetation are damaged. Accordingly, the Great Green Wall is increasingly described not as a wall at all, but as a mosaic of different projects, from small community gardens and restored grazing land to rows of trees that shelter fields from the wind.'],
        ['E', 'Some of the most encouraging results have come from methods that cost little and rely on local knowledge. In southern Niger, farmers began in the 1980s to protect and prune the shoots growing from the living roots of trees that had been cut down long before. This technique, known as farmer-managed natural regeneration, has helped to re-green around five million hectares of farmland. Because the trees grow from roots already established in the soil, they survive far better than newly planted seedlings, and farmers have a direct interest in looking after them, since the trees provide shade, fodder and firewood.'],
        ['F', 'Elsewhere, farmers have revived traditional techniques for capturing rainwater. In Burkina Faso, for example, small pits known as zaï are dug in hard, crusted soil and filled with compost before the rainy season. The pits collect water and concentrate nutrients around the roots of crops, allowing harvests on land that had been abandoned. Low stone lines laid along the contours of fields serve a similar purpose, slowing the flow of rainwater so that it soaks into the ground instead of washing the soil away.'],
        ['G', 'Whether the Great Green Wall will meet its targets remains uncertain, but its history offers an important lesson. Large, eye-catching projects can mobilise attention and money, yet lasting change often depends on whether the people who live on the land benefit directly from it. Trees that provide fruit, fodder or firewood, and that farmers themselves have chosen to protect, are far more likely to survive than those planted by outsiders in a straight line on a map.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: INTRO.tfng(1, 6),
          items: [
            tf('The Great Green Wall was planned to cross the Sahel from west to east.', 0, 'A', 'stretches from Senegal in the west to Djibouti in the east'),
            tf('The droughts of the 1970s and 1980s affected only small parts of the Sahel.', 1, 'B', 'large areas of the Sahel have lost vegetation and fertile soil'),
            tf('The 2020 assessment found that most of the target area had been restored.', 1, 'C', 'concluded that only a small fraction of that area had been restored'),
            tf('Some of the planted seedlings died because animals ate them.', 0, 'C', 'or were eaten by livestock'),
            tf('Niger has received more money from the project than any other country.', 2, 'E', 'The passage describes Niger’s results but says nothing about funding for individual countries.'),
            tf('The zaï technique was invented in the twentieth century.', 2, 'F', 'The passage calls the zaï a traditional technique but does not say when it was invented.'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSentences(7, 10, 'H'),
          options: ['topsoil', 'mosaic', 'roots', 'compost', 'fruit', 'wall', 'contours', 'firewood'],
          items: [
            gap('When land loses its plant cover, wind and rain carry away the ______.', 0, 'B', 'wind and heavy rain carry away the topsoil'),
            gap('Experts increasingly describe the project as a ______ of different projects.', 1, 'D', 'but as a mosaic of different projects'),
            gap('In farmer-managed natural regeneration, trees grow from ______ already established in the soil.', 2, 'E', 'Because the trees grow from roots already established in the soil'),
            gap('Before the rainy season, zaï pits are filled with ______.', 3, 'F', 'filled with compost before the rainy season'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(11, 13),
          items: [
            choice('Why do many experts now think that a continuous line of trees was a misleading idea?', ['Trees cannot grow anywhere in the Sahel.', 'Land degradation happens in patches rather than along a front.', 'The line would cross too many national borders.', 'The Sahara is already becoming smaller.'], 1, 'D', 'Deserts do not advance like an army along a front; land degradation happens in patches'),
            choice('Why do trees produced by farmer-managed natural regeneration survive well?', ['They grow from roots that are already established.', 'They are watered every day.', 'They are species brought from other continents.', 'They are protected by metal fences.'], 0, 'E', 'Because the trees grow from roots already established in the soil, they survive far better'),
            choice('What is the main lesson the writer draws in paragraph G?', ['Large projects always fail.', 'Trees should be planted in straight lines.', 'Lasting change depends on local people benefiting directly.', 'The Sahel should be left to recover on its own.'], 2, 'G', 'lasting change often depends on whether the people who live on the land benefit directly from it'),
          ],
        },
      ],
    },
    {
      title: 'Why Do Zebras Have Stripes?',
      paras: [
        ['A', 'Why zebras have stripes is one of the oldest questions in biology, and one of the most surprisingly difficult to answer. Charles Darwin and Alfred Russel Wallace, the two founders of the theory of evolution by natural selection, disagreed about it in the nineteenth century, and the debate continued for more than a hundred years. The difficulty is not a lack of ideas. Over time, researchers have proposed at least half a dozen explanations, from hiding from predators to keeping cool. The challenge has been to find evidence that could separate a convincing explanation from an attractive story. Because zebras cannot easily be studied in controlled conditions, much of that evidence has had to be gathered indirectly, through clever experiments and comparisons between regions.'],
        ['B', 'The oldest and most popular idea is that stripes serve as camouflage. A striped animal standing among tall grass might be harder to see, and when a herd runs, the mass of moving stripes might make it difficult for a lion to pick out a single target. Some researchers have even suggested that stripes confuse a predator’s perception of speed and direction. Yet observations in the wild have provided little support for this theory. Lions and hyenas appear to hunt zebras just as successfully as other prey of similar size, and studies of how these predators see suggest that at the distances where they usually detect prey, stripes would blur into a uniform grey.'],
        ['C', 'A second hypothesis links stripes to temperature. Black surfaces absorb more heat than white ones, so it has been suggested that the difference could create small air currents above the skin, helping the animal to cool down under the African sun. Experiments using barrels covered in striped, black and white hides, however, found no meaningful difference in temperature between striped and plain surfaces. Zebras in hot regions do tend to have bolder stripes, but heat is not the only thing that varies between regions, so this pattern alone proves little. In addition, if stripes were an efficient cooling system, it would be hard to explain why so few other animals living in the same hot climate have developed them.'],
        ['D', 'The explanation that currently has the strongest support involves an unexpected enemy: biting flies. Horseflies and tsetse flies are a serious problem for animals in Africa, because they drink blood and carry diseases. In field experiments, scientists placed coats with black and white stripes on ordinary horses and filmed the flies around them. The insects approached the striped coats as often as the plain ones, but far fewer managed to land. Instead of slowing down for a controlled landing, the flies seemed to fly straight into the coat or past it, as if the stripes interfered with their ability to judge distance at close range. Interestingly, horses wearing coats that were striped on the body but plain on the head were still bitten on the head, which suggests that the effect works only where the stripes actually are.'],
        ['E', 'Further evidence comes from comparing different species and regions. Researchers who mapped the distribution of zebras and their relatives found that striping is strongest in areas where biting flies are most active for much of the year. Zebras also have particularly thin coats, which may make them more vulnerable to bites than other grazing animals of the same size. No other explanation tested so far matches the geographical pattern as closely, which is why many biologists now regard flies as the most likely reason why stripes evolved.'],
        ['F', 'Even so, few researchers would claim that the matter is completely settled. Stripes could serve more than one purpose, and features that evolved for one reason are often later used for another: zebras, for instance, may recognise individual members of their herd by their unique patterns. What the zebra story shows most clearly, perhaps, is the value of testing even the most obvious-sounding explanations. The camouflage theory was repeated in textbooks for generations, yet when it was finally examined carefully, it turned out to be one of the weakest of them all. The history of the debate is a reminder that an idea is not true simply because it has been repeated many times.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: INTRO.heading(14, 19, 'F'),
          options: [
            'Why stripes do not seem to keep zebras cool',
            'A long-running scientific debate',
            'How zebras choose their mates',
            'Experiments with striped coats',
            'A popular theory with little support',
            'Patterns on the map',
            'The dangers of hunting zebras',
            'An open question and a lesson about evidence',
          ],
          items: [
            head('A', 1, 'the debate continued for more than a hundred years'),
            head('B', 4, 'Yet observations in the wild have provided little support for this theory.'),
            head('C', 0, 'found no meaningful difference in temperature between striped and plain surfaces'),
            head('D', 3, 'scientists placed coats with black and white stripes on ordinary horses'),
            head('E', 5, 'Researchers who mapped the distribution of zebras'),
            head('F', 7, 'few researchers would claim that the matter is completely settled'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(20, 23),
          items: [
            choice('According to paragraph A, what has made the question so difficult?', ['There have been very few ideas.', 'Zebras are hard to observe in the wild.', 'It has been hard to find evidence to tell the explanations apart.', 'Darwin refused to study zebras.'], 2, 'A', 'The challenge has been to find evidence that could separate a convincing explanation from an attractive story.'),
            choice('Why does the camouflage theory receive little support?', ['Predators hunt zebras as successfully as other similar prey.', 'Zebras usually live in forests.', 'Lions can see colours very well.', 'Zebras never run in herds.'], 0, 'B', 'Lions and hyenas appear to hunt zebras just as successfully as other prey of similar size'),
            choice('What did the flies do near the striped coats?', ['They avoided coming close to them.', 'They failed to slow down for a controlled landing.', 'They landed more often than on plain coats.', 'They followed the horses for longer.'], 1, 'D', 'Instead of slowing down for a controlled landing, the flies seemed to fly straight into the coat or past it'),
            choice('Why might zebras be especially vulnerable to fly bites?', ['They live near rivers.', 'They sleep standing up.', 'They have particularly thin coats.', 'They are active at night.'], 2, 'E', 'Zebras also have particularly thin coats'),
          ],
        },
        {
          type: 'tfng',
          intro: INTRO.tfng(24, 26),
          items: [
            tf('Darwin and Wallace agreed about the purpose of zebra stripes.', 1, 'A', 'disagreed about it in the nineteenth century'),
            tf('Zebras may be able to recognise members of their herd by their stripes.', 0, 'F', 'zebras, for instance, may recognise individual members of their herd by their unique patterns'),
            tf('Tsetse flies are found only in East Africa.', 2, 'D', 'The passage says these flies are a problem in Africa but does not say exactly where they live.'),
          ],
        },
      ],
    },
    {
      title: 'Is There Still a Place for Handwriting?',
      paras: [
        ['A', 'In many schools, the keyboard has quietly replaced the pen. Pupils type their homework, teachers mark it online, and examinations in some countries are moving to computers. Several education systems have reduced the time spent teaching handwriting, and a few have stopped teaching joined-up writing altogether. To many people this seems a sensible adjustment to modern life. After all, most adults now write far more with their thumbs than with a pen. Some parents even wonder why their children should spend hours practising a skill that seems to belong to the past. I want to argue that abandoning handwriting so quickly would be a mistake, though not for the sentimental reasons that are usually given.'],
        ['B', 'The case for handwriting is often made in terms of tradition: beautiful letters, personal notes, the pleasure of a fountain pen. These things may matter to some people, but they are not good reasons for spending scarce school time. If handwriting deserves a place in the curriculum, it must be because of what it does for learning. And here the evidence, while not conclusive, is more interesting than many people realise. It suggests that the physical act of writing may influence how we learn, and not merely how our work looks on the page.'],
        ['C', 'Consider young children learning to read. Several studies have found that children who practise forming letters by hand recognise them more quickly than children who learn the same letters by typing. One plausible explanation is that writing a letter requires the child to build it from strokes, paying attention to its shape in a way that pressing a key does not. Typing every letter involves the same simple movement, whereas each handwritten letter has its own pattern of motion, which may help to fix it in memory. Children who write by hand also seem to notice the differences between similar letters, such as b and d, more readily.'],
        ['D', 'Older students may benefit too, though for different reasons. In a widely discussed study published in 2014, university students who took lecture notes by hand performed better on conceptual questions than those who used laptops. The researchers suggested that because handwriting is slower, students could not copy the lecture word for word; instead they had to listen, select and summarise, which is exactly the kind of processing that deepens understanding. Later attempts to repeat the study have produced more mixed results, so it would be wrong to treat it as proof. Nevertheless, the idea that slower can sometimes be better deserves attention.'],
        ['E', 'None of this means that schools should resist technology. Typing is an essential skill, and for pupils with certain motor difficulties or disabilities, a keyboard can be liberating. Speech recognition and other tools also make writing accessible to people who would otherwise struggle. The question is not whether to use keyboards, but whether removing handwriting entirely would cost children something they cannot easily regain. A school that teaches both skills is not being old-fashioned; it is simply giving pupils more than one tool and helping them to understand when each is most useful.'],
        ['F', 'Nor should handwriting teaching be judged by neatness. Much time has traditionally been spent on producing perfectly uniform joined-up letters, an aim that has little to do with learning and that discourages many children. What matters is that pupils can write legibly and fluently enough for the act of writing not to absorb all their attention. Once that level is reached, there is little point in insisting on a particular style, and teachers’ time is better spent on what pupils are actually writing.'],
        ['G', 'My conclusion, then, is a modest one. Handwriting should neither be preserved as a museum piece nor thrown away as an outdated technology. It is a tool with particular strengths, especially for young children learning letters and for anyone trying to think through an idea. Schools should keep teaching it, efficiently and without fuss, while also teaching pupils to type well. In a world full of fast tools, it may be valuable to keep one that makes us slow down.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: INTRO.mc(27, 31),
          items: [
            choice('What does the writer say about the usual arguments for handwriting?', ['They are supported by strong evidence.', 'They are sentimental and do not justify spending school time.', 'They are only made by older teachers.', 'They are mainly about examinations.'], 1, 'B', 'These things may matter to some people, but they are not good reasons for spending scarce school time.'),
            choice('According to paragraph C, why might handwriting help children recognise letters?', ['Each handwritten letter has its own pattern of movement.', 'Children enjoy writing more than typing.', 'Keyboards show capital letters only.', 'Handwriting is faster than typing.'], 0, 'C', 'each handwritten letter has its own pattern of motion, which may help to fix it in memory'),
            choice('Why did students who wrote by hand do better in the 2014 study, according to the researchers?', ['They had better lecturers.', 'They copied the lecture word for word.', 'They had to listen, select and summarise.', 'They spent more time revising.'], 2, 'D', 'instead they had to listen, select and summarise'),
            choice('What does the writer say about later attempts to repeat the 2014 study?', ['They confirmed it completely.', 'They produced mixed results.', 'They were never carried out.', 'They showed laptops were better.'], 1, 'D', 'Later attempts to repeat the study have produced more mixed results'),
            choice('What does the writer think matters most in teaching handwriting?', ['Perfectly uniform letters', 'A particular joined-up style', 'Writing legibly and fluently', 'Using a fountain pen'], 2, 'F', 'What matters is that pupils can write legibly and fluently'),
          ],
        },
        {
          type: 'ynng',
          intro: INTRO.ynng(32, 36),
          items: [
            tf('Schools should stop teaching typing.', 1, 'E', 'Typing is an essential skill'),
            tf('A keyboard can be particularly helpful for some pupils with disabilities.', 0, 'E', 'for pupils with certain motor difficulties or disabilities, a keyboard can be liberating'),
            tf('The 2014 study proves that laptops should be banned from lectures.', 1, 'D', 'it would be wrong to treat it as proof'),
            tf('Children who learn to write by hand become better at mathematics.', 2, 'C', 'The writer discusses reading and note-taking, not mathematics.'),
            tf('Pupils should write fluently enough that writing does not take all their attention.', 0, 'F', 'fluently enough for the act of writing not to absorb all their attention'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSummary(37, 40, 'H'),
          options: ['strokes', 'laptops', 'summarise', 'legibly', 'slow', 'museum', 'typing', 'neatly'],
          items: [
            gap('Writing a letter by hand requires a child to build it from ______.', 0, 'C', 'requires the child to build it from strokes'),
            gap('Taking notes by hand made students listen, select and ______.', 2, 'D', 'they had to listen, select and summarise'),
            gap('Pupils need to be able to write ______ and fluently.', 3, 'F', 'pupils can write legibly and fluently'),
            gap('Handwriting may be valuable because it makes us ______ down.', 4, 'G', 'keep one that makes us slow down'),
          ],
        },
      ],
    },
  ],
};
