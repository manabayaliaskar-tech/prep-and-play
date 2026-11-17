// IELTS Academic Reading · Test 8: эхолокация летучих мышей, Тунгусский феномен, онлайн-обучение.

import { INTRO, choice, gap, head, tf } from './kit.js';

export const TEST_8 = {
  id: 'academic-8',
  title: 'IELTS Academic Reading · Test 8',
  passages: [
    {
      title: 'Seeing with Sound',
      paras: [
        ['A', 'For centuries, people wondered how bats could fly so skilfully in complete darkness. They catch insects in mid-air, avoid branches and wires, and find their way out of caves without apparently being able to see anything. The common expression “blind as a bat” reflects one popular answer: that bats somehow manage without eyes at all. In fact, all bats can see, and some see very well. But many species rely mainly on a different sense, one that humans did not even suspect existed until the twentieth century. Understanding it took nearly a hundred and fifty years of careful experiments, and the answer turned out to be stranger than anyone had imagined.'],
        ['B', 'The first serious investigation was carried out in the 1790s by the Italian scientist Lazzaro Spallanzani. He observed that bats could fly through a room strung with threads without touching them even when their eyes were covered. When he blocked their ears, however, they collided with obstacles and seemed lost. Spallanzani concluded that bats somehow used hearing to navigate, but since no sound could be heard in the room, many of his contemporaries found the idea absurd. The mystery remained unsolved for more than a century. Without instruments capable of detecting sounds beyond the range of human hearing, there was simply no way to test what the bats were doing.'],
        ['C', 'The explanation came in 1938, when the American student Donald Griffin, working with the physicist George Pierce, used a newly developed detector to show that bats produce sounds far too high for human ears to hear. Griffin later coined the term “echolocation” to describe what the bats were doing: emitting calls and listening to the echoes that return from objects around them. By analysing these echoes, a bat can work out the distance, size, shape and even texture of an object, and whether it is moving. In experiments, bats have avoided wires less than a millimetre thick in total darkness, an ability that has impressed engineers designing radar and sonar.'],
        ['D', 'The process is remarkably sophisticated. Many bats change their calls as they hunt. While searching, they produce calls at a slow rate; when they detect an insect, the calls become faster and faster, ending in a rapid sequence known as a “feeding buzz” just before capture. Some bats’ calls are extremely loud — louder than a smoke alarm at close range — and to avoid deafening themselves, they briefly reduce the sensitivity of their own ears each time they call. Different species use different types of calls, suited to hunting in open air, among trees or close to the surface of water. Researchers can often identify a species simply by recording its calls, which makes it possible to survey bats without catching them.'],
        ['E', 'Not all bats echolocate. Many large fruit bats, which feed on fruit and nectar rather than insects, rely mainly on their excellent eyesight and sense of smell. A few fruit bat species do use a simple form of echolocation, produced not with the throat but by clicking their tongues. This variety has made bats an important subject for scientists studying how complex abilities evolve, and whether echolocation appeared once in their history or several times.'],
        ['F', 'Insects, meanwhile, have not been passive victims. Many moths have evolved ears that can detect bat calls; when they hear a bat approaching, they dive, loop or drop towards the ground. Some tiger moths go further and produce their own ultrasonic clicks, which may warn bats that the moths taste unpleasant or may even interfere with the bats’ echolocation. The relationship between bats and moths has become a classic example of an evolutionary “arms race”, in which each side develops new strategies in response to the other.'],
        ['G', 'Echolocation has also inspired human technology and medicine. Sonar systems used by ships and submarines work on a similar principle, although they were developed largely independently. More recently, some blind people have taught themselves to navigate by making clicking sounds with their tongues and listening to the echoes, and researchers have found that this activates parts of the brain normally used for vision. The ability that once seemed impossible has turned out to be one that, with practice, even humans can learn.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: INTRO.tfng(1, 6),
          items: [
            tf('All bats are able to see.', 0, 'A', 'In fact, all bats can see'),
            tf('Spallanzani’s bats flew well when their ears were blocked.', 1, 'B', 'When he blocked their ears, however, they collided with obstacles and seemed lost.'),
            tf('Most scientists of Spallanzani’s time accepted his conclusion at once.', 1, 'B', 'many of his contemporaries found the idea absurd'),
            tf('Griffin worked with a physicist to detect bat calls.', 0, 'C', 'working with the physicist George Pierce'),
            tf('Some bat calls are louder than a smoke alarm at close range.', 0, 'D', 'louder than a smoke alarm at close range'),
            tf('Fruit bats live longer than insect-eating bats.', 2, 'E', 'The passage compares how they find food, not how long they live.'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSentences(7, 10, 'H'),
          options: ['buzz', 'tongues', 'echoes', 'smell', 'moths', 'sonar', 'threads', 'eyes'],
          items: [
            gap('Bats work out the distance and size of objects by analysing ______.', 2, 'C', 'By analysing these echoes, a bat can work out the distance, size, shape'),
            gap('Just before capture, a bat’s calls end in a rapid “feeding ______”.', 0, 'D', 'a rapid sequence known as a “feeding buzz” just before capture'),
            gap('Large fruit bats rely mainly on their eyesight and sense of ______.', 3, 'E', 'rely mainly on their excellent eyesight and sense of smell'),
            gap('Some blind people navigate by making clicking sounds with their ______.', 1, 'G', 'making clicking sounds with their tongues'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(11, 13),
          items: [
            choice('How do bats avoid deafening themselves?', ['They call only at long distances.', 'They briefly reduce the sensitivity of their ears when they call.', 'They close their ears with their wings.', 'They use very quiet calls.'], 1, 'D', 'they briefly reduce the sensitivity of their own ears each time they call'),
            choice('Why are bats important to scientists studying evolution?', ['They are the oldest mammals.', 'Their variety helps show how complex abilities evolve.', 'They can live in any climate.', 'They have the largest brains of all mammals.'], 1, 'E', 'This variety has made bats an important subject for scientists studying how complex abilities evolve'),
            choice('What is meant by the “arms race” between bats and moths?', ['Both compete for the same food.', 'Each side develops new strategies in response to the other.', 'Moths hunt young bats.', 'Bats avoid areas with many moths.'], 1, 'F', 'in which each side develops new strategies in response to the other'),
          ],
        },
      ],
    },
    {
      title: 'The Tunguska Event',
      paras: [
        ['A', 'On the morning of 30 June 1908, people in a remote part of central Siberia saw a ball of fire crossing the sky, followed by a flash and a series of explosions so powerful that they were heard hundreds of kilometres away. Near the trading post of Vanavara, about sixty kilometres from the centre of the event, a man sitting outside his house later described being thrown from his chair by a blast of heat that felt as if his shirt were on fire. Windows were broken over a wide area, and instruments in distant countries recorded unusual disturbances in the atmosphere. For several nights afterwards, the skies over parts of Europe and Asia glowed so brightly that people could read newspapers outdoors at midnight.'],
        ['B', 'Because the region near the Podkamennaya Tunguska River was so remote, and Russia was soon affected by war and revolution, nearly two decades passed before scientists investigated. In 1927 an expedition led by the mineralogist Leonid Kulik finally reached the area. Kulik had expected to find a large crater and fragments of a giant meteorite, which he hoped might contain valuable iron. Instead, he found something stranger: an enormous area of forest in which trees had been knocked flat, all pointing away from a central point, where trees were still standing but had been stripped of their branches.'],
        ['C', 'Later surveys established the scale of the destruction. Around eighty million trees had been flattened over an area of more than two thousand square kilometres — larger than many modern cities. Yet no impact crater was ever found, and searches for large pieces of the object repeatedly failed. Kulik returned several times in the following years, organising the drilling and draining of swampy ground in the hope of finding the meteorite, but without success. The lack of physical evidence encouraged many unusual theories over the years, some of them far from scientific, before the most likely explanation became widely accepted.'],
        ['D', 'The absence of a crater is now explained by the idea of an airburst. Most scientists believe that a stony asteroid, or possibly a fragment of a comet, perhaps several tens of metres across, entered the atmosphere at very high speed. Intense pressure and heat caused it to break apart and explode several kilometres above the ground before it could reach the surface. The resulting shock wave flattened the forest, while the trees directly below the explosion remained standing because the blast struck them from above. Estimates of the energy released vary, but it was hundreds of times greater than that of the atomic bomb dropped on Hiroshima.'],
        ['E', 'Because the explosion happened over an almost uninhabited area, very few people are thought to have died. Scientists have often pointed out how different the consequences would have been had a similar object exploded over a large city. Such events are rare: objects of this size are believed to enter the Earth’s atmosphere perhaps once every few centuries on average, although estimates differ considerably. Smaller events are more common, as was shown in 2013, when an object about twenty metres across exploded over the Russian city of Chelyabinsk, damaging buildings and injuring around fifteen hundred people, mostly with broken glass. Many of the injured had gone to their windows to look at the bright flash, unaware that a shock wave was about to arrive.'],
        ['F', 'Tunguska has therefore become an important case study for efforts to protect the Earth from future impacts. Space agencies now run programmes to find and track asteroids that come close to our planet, and in 2022 a NASA spacecraft deliberately crashed into a small asteroid and succeeded in changing its orbit slightly — the first test of a method that might one day be used to push a dangerous object off course. More than a century after the event, the flattened forest of Siberia remains a powerful reminder that the Earth is not isolated from the rest of the solar system.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: INTRO.heading(14, 19, 'F'),
          options: [
            'Searching for something that was not there',
            'A strange discovery in the forest',
            'Witnesses to a mysterious event',
            'How the Earth formed its craters',
            'Explaining a missing crater',
            'Learning lessons for the future',
            'Valuable metals from space',
            'A lucky location',
          ],
          items: [
            head('A', 2, 'a man sitting outside his house later described being thrown from his chair'),
            head('B', 1, 'Instead, he found something stranger'),
            head('C', 0, 'searches for large pieces of the object repeatedly failed'),
            head('D', 4, 'The absence of a crater is now explained by the idea of an airburst.'),
            head('E', 7, 'Because the explosion happened over an almost uninhabited area, very few people are thought to have died.'),
            head('F', 5, 'an important case study for efforts to protect the Earth from future impacts'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(20, 23),
          items: [
            choice('Why did nearly two decades pass before scientists investigated the event?', ['Nobody had noticed the explosion.', 'The area was remote, and Russia was affected by war and revolution.', 'The government kept the event secret.', 'Scientists thought it was an earthquake.'], 1, 'B', 'Because the region near the Podkamennaya Tunguska River was so remote, and Russia was soon affected by war and revolution'),
            choice('What did Kulik hope to find?', ['Survivors of the explosion', 'Fragments of a meteorite that might contain iron', 'Evidence of a volcano', 'A new species of tree'], 1, 'B', 'fragments of a giant meteorite, which he hoped might contain valuable iron'),
            choice('Why were the trees directly below the explosion left standing?', ['They were younger and more flexible.', 'The blast struck them from above.', 'They were protected by a hill.', 'They grew in swampy ground.'], 1, 'D', 'the trees directly below the explosion remained standing because the blast struck them from above'),
            choice('What happened in 2022?', ['A large asteroid exploded over Siberia.', 'A spacecraft changed the orbit of a small asteroid.', 'Pieces of the Tunguska object were found.', 'A new crater was discovered.'], 1, 'F', 'a NASA spacecraft deliberately crashed into a small asteroid and succeeded in changing its orbit slightly'),
          ],
        },
        {
          type: 'tfng',
          intro: INTRO.tfng(24, 26),
          items: [
            tf('After the event, the night sky glowed over parts of Europe.', 0, 'A', 'the skies over parts of Europe and Asia glowed so brightly'),
            tf('Kulik eventually found large pieces of the object.', 1, 'C', 'Kulik returned several times… in the hope of finding the meteorite, but without success.'),
            tf('Most of the people injured in Chelyabinsk were children.', 2, 'E', 'The passage gives the number of injured people but not their ages.'),
          ],
        },
      ],
    },
    {
      title: 'Learning Online: Revolution or Tool?',
      paras: [
        ['A', 'Few changes in education have happened as quickly as the spread of online learning. Within a couple of decades, it has become possible to follow lectures from famous universities, learn a language from an app or study for an examination without leaving home. During the COVID-19 pandemic, hundreds of millions of students were suddenly taught entirely online, often with little preparation. That experience produced strong opinions on both sides. Some now see online learning as the future of education; others regard it as a poor substitute for the classroom. In my view, both positions miss the most important point. The question is not whether online learning is good or bad in itself, but what it does well, what it does badly and how it should be used.'],
        ['B', 'The advantages of online learning are real. It makes high-quality material available to people who live far from good schools or universities, or who cannot attend fixed classes because of work or family responsibilities. Learners can pause, rewind and review explanations as often as they need, something that is impossible in a live lecture. Well-designed online exercises can also give instant feedback, allowing students to correct mistakes before they become habits. For motivated adults in particular, these features can be extremely valuable.'],
        ['C', 'Yet the evidence also reveals clear weaknesses. Completion rates for many open online courses have been notoriously low, with only a small proportion of those who enrol finishing the course. During the pandemic, many teachers reported that students, especially younger ones and those from poorer homes, fell behind. Some lacked reliable internet access or a quiet place to work; others simply found it hard to stay focused in front of a screen without the structure of a school day. These problems suggest that access to material is not the same as learning. A library card has never been enough to guarantee an education, and an internet connection is no different.'],
        ['D', 'What, then, is missing online? Much of the answer lies in the social side of education. In a classroom, teachers notice when a student looks confused, ask questions, adjust their explanations and encourage those who are struggling. Students learn from one another, too, through discussion, argument and simple example. Perhaps most importantly, the presence of others creates a sense of obligation: it is easier to give up on a video than on a teacher who expects to see you the next morning.'],
        ['E', 'This suggests that the real question is not whether education should take place online or in a classroom, but how the two can be combined. Many educators now favour “blended” approaches, in which students study explanations and practise exercises online at their own pace, and use class time for discussion, problem-solving and individual support. In such models, technology does what it does best — delivering information and practice efficiently — while teachers concentrate on what only people can do. Several studies have found that such combinations can produce better results than either purely online or purely traditional teaching, although much depends on how carefully they are designed.'],
        ['F', 'There are, however, important conditions. Blended learning only reduces inequality if every student has the necessary devices and connection, and if teachers are trained to use the time it frees well. Otherwise, it risks widening the gap between students who can study independently and those who cannot. Online platforms also collect large amounts of data about learners, which raises questions about privacy that schools have not always considered carefully. Who owns this information, and how it may be used, are questions that deserve far more public attention than they usually receive.'],
        ['G', 'Online learning, then, is neither a revolution that will replace schools nor a passing fashion to be abandoned. It is a powerful set of tools whose value depends entirely on how it is used. The lesson of recent years is that technology works best not when it removes teachers and classmates from the process, but when it gives them more time to do the things that matter most.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: INTRO.mc(27, 31),
          items: [
            choice('What does the writer think about the two common views of online learning?', ['The first is correct.', 'The second is correct.', 'Both miss the most important point.', 'Both are equally correct.'], 2, 'A', 'In my view, both positions miss the most important point.'),
            choice('Which advantage of online learning is mentioned in paragraph B?', ['It is always free.', 'Learners can pause and review explanations.', 'It replaces examinations.', 'It requires no motivation.'], 1, 'B', 'Learners can pause, rewind and review explanations as often as they need'),
            choice('What do low completion rates suggest, according to the writer?', ['Online courses are too short.', 'Access to material is not the same as learning.', 'Students prefer printed books.', 'Teachers are not needed.'], 1, 'C', 'access to material is not the same as learning'),
            choice('According to paragraph D, why is it harder to give up in a classroom?', ['Classes are shorter than videos.', 'The presence of others creates a sense of obligation.', 'Teachers give more homework.', 'Classrooms have fewer distractions.'], 1, 'D', 'the presence of others creates a sense of obligation'),
            choice('In blended approaches, how is class time mainly used?', ['For watching recorded lectures', 'For discussion, problem-solving and individual support', 'For tests only', 'For online exercises'], 1, 'E', 'use class time for discussion, problem-solving and individual support'),
          ],
        },
        {
          type: 'ynng',
          intro: INTRO.ynng(32, 36),
          items: [
            tf('Online learning can be especially valuable for motivated adults.', 0, 'B', 'For motivated adults in particular, these features can be extremely valuable.'),
            tf('All students coped well with online learning during the pandemic.', 1, 'C', 'many teachers reported that students, especially younger ones and those from poorer homes, fell behind'),
            tf('Students can learn from one another through discussion.', 0, 'D', 'Students learn from one another, too, through discussion, argument and simple example.'),
            tf('Most universities will close their campuses within twenty years.', 2, 'G', 'The writer makes no prediction about university campuses.'),
            tf('Blended learning automatically reduces inequality between students.', 1, 'F', 'Blended learning only reduces inequality if every student has the necessary devices and connection'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSummary(37, 40, 'H'),
          options: ['feedback', 'obligation', 'blended', 'privacy', 'rewind', 'devices', 'completion', 'fashion'],
          items: [
            gap('Well-designed online exercises can give instant ______.', 0, 'B', 'Well-designed online exercises can also give instant feedback'),
            gap('Many educators now favour ______ approaches.', 2, 'E', 'Many educators now favour “blended” approaches'),
            gap('Blended learning reduces inequality only if every student has the necessary ______ and connection.', 5, 'F', 'every student has the necessary devices and connection'),
            gap('The data collected by online platforms raise questions about ______.', 3, 'F', 'which raises questions about privacy'),
          ],
        },
      ],
    },
  ],
};
