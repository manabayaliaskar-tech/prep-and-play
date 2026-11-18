// IELTS Academic Reading · Test 2: картофель, осьминог, прокрастинация.

import { INTRO, choice, gap, head, tf } from './kit.js';

export const TEST_2 = {
  id: 'academic-2',
  title: 'IELTS Academic Reading · Test 2',
  passages: [
    {
      title: 'The Potato’s Long Journey',
      paras: [
        ['A', 'Few foods have travelled as far, or changed as many lives, as the potato. Today it is grown in more than a hundred countries, from the highlands of Peru to the plains of Kazakhstan, and it is one of the most important food crops on the planet. Yet for most of human history it was known only to the peoples of a single mountain range. The story of how a modest tuber from the Andes became a global staple says a great deal about the way new foods are adopted - and about the risks of depending too heavily on one of them.'],
        ['B', 'The potato was first domesticated in the Andes of South America, in the region around Lake Titicaca on the border of present-day Peru and Bolivia, at least seven thousand years ago. Andean farmers developed hundreds of varieties suited to different altitudes, soils and climates, many of them small, knobbly and brightly coloured. They also invented a method of preserving potatoes known as chuño: the tubers were left outside to freeze during cold nights, then trampled and dried in the sun. The result was light, kept for years and could feed communities through poor harvests.'],
        ['C', 'Spanish explorers encountered the potato in the sixteenth century, and by the 1570s it had reached Spain. Its reception in Europe was far from enthusiastic. As a member of the nightshade family, it was related to plants known to be poisonous, and its leaves and green parts do contain toxic substances. Some people believed it caused disease; others simply regarded it as food for animals or the very poor. For more than a century, it was grown mainly as a curiosity in botanical gardens or as fodder for livestock.'],
        ['D', 'Attitudes began to change in the eighteenth century, partly because of war and hunger. The potato produced more calories per hectare than grain, grew in poor soil and, being underground, was less likely to be destroyed or stolen by passing armies. In Prussia, King Frederick II encouraged farmers to plant it. In France, the pharmacist Antoine-Augustin Parmentier, who had eaten potatoes as a prisoner of war, campaigned for years to persuade his compatriots that they were safe and nutritious. According to a popular story, he even had a field of potatoes guarded by soldiers during the day, so that local people would assume the crop was valuable and steal it at night.'],
        ['E', 'By the nineteenth century, the potato had become essential to the diet of millions of Europeans, nowhere more so than in Ireland. There, a large part of the rural population depended almost entirely on a single variety, the Lumper, which gave high yields but had little resistance to disease. In 1845 a mould-like organism, later named Phytophthora infestans, arrived from across the Atlantic and caused potato blight, turning the tubers into a black, rotten mass. Harvests failed in several successive years. During the Great Famine that followed, about one million people died and roughly another million emigrated.'],
        ['F', 'Scientists today see the Irish famine as a warning about the dangers of genetic uniformity. When every plant in a field is genetically identical, a disease that can attack one can attack them all. This is one reason why researchers attach so much importance to the diversity that Andean farmers preserved. The International Potato Center in Lima, Peru, keeps thousands of samples of traditional and wild potatoes, which breeders can use to develop new varieties that resist disease, drought or heat.'],
        ['G', 'The potato’s journey is not over. Its production has grown rapidly in Asia and Africa, and China and India are now among the largest producers in the world. In many places it is valued precisely for the qualities that once impressed European rulers: it grows quickly, needs relatively little water compared with some grains, and produces a large amount of food on a small piece of land. With the climate changing, plant breeders are once again looking to the potato’s mountain origins for the genetic resources needed to keep it on the world’s tables.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: INTRO.tfng(1, 6),
          items: [
            tf('The potato is now grown in over a hundred countries.', 0, 'A', 'Today it is grown in more than a hundred countries'),
            tf('Andean farmers grew only a few varieties of potato.', 1, 'B', 'Andean farmers developed hundreds of varieties'),
            tf('Chuño could be stored for a long time.', 0, 'B', 'The result was light, kept for years'),
            tf('The potato became popular in Spain as soon as it arrived.', 1, 'C', 'Its reception in Europe was far from enthusiastic.'),
            tf('Parmentier came from a family of farmers.', 2, 'D', 'The passage describes Parmentier’s campaign but says nothing about his family.'),
            tf('The Lumper variety was brought to Ireland from France.', 2, 'E', 'The passage says that Irish farmers depended on the Lumper, but not where it came from.'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSentences(7, 10, 'H'),
          options: ['calories', 'soldiers', 'poison', 'blight', 'emigration', 'samples', 'water', 'grain'],
          items: [
            gap('In the eighteenth century the potato was valued because it gave more ______ per hectare than grain.', 0, 'D', 'The potato produced more calories per hectare than grain'),
            gap('Parmentier reportedly had a field of potatoes guarded by ______.', 1, 'D', 'he even had a field of potatoes guarded by soldiers during the day'),
            gap('The International Potato Center keeps thousands of ______ of traditional and wild potatoes.', 5, 'F', 'keeps thousands of samples of traditional and wild potatoes'),
            gap('Compared with some grains, the potato needs relatively little ______.', 6, 'G', 'needs relatively little water compared with some grains'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(11, 13),
          items: [
            choice('Why were Europeans suspicious of the potato at first?', ['It was too expensive to grow.', 'It was related to poisonous plants.', 'It grew only in mountain regions.', 'It was forbidden by law.'], 1, 'C', 'it was related to plants known to be poisonous'),
            choice('What made the Irish potato crop especially vulnerable to blight?', ['The weather was unusually dry.', 'Farmers used too little fertiliser.', 'Most farmers grew a single variety.', 'The seed potatoes came from America.'], 2, 'E', 'depended almost entirely on a single variety, the Lumper, which gave high yields but had little resistance to disease'),
            choice('What is the main point of paragraph F?', ['Genetic diversity helps protect crops from disease.', 'Ireland should stop growing potatoes.', 'Peru is the largest producer of potatoes.', 'Wild potatoes are tastier than modern ones.'], 0, 'F', 'When every plant in a field is genetically identical, a disease that can attack one can attack them all.'),
          ],
        },
      ],
    },
    {
      title: 'The Distributed Mind of the Octopus',
      paras: [
        ['A', 'For a long time, intelligence in animals was studied mainly in species that are closely related to us: apes, monkeys, dogs and, later, birds such as crows and parrots. The octopus does not fit this pattern. Its last common ancestor with humans lived more than five hundred million years ago and was probably a simple, worm-like creature. Everything that makes the octopus clever therefore evolved independently, along a completely separate branch of the tree of life. For biologists interested in the nature of the mind, this makes the octopus something close to an alien intelligence on our own planet. Studying it offers a rare chance to ask which features of intelligence are universal and which are simply accidents of our own evolutionary history.'],
        ['B', 'The numbers are striking. A common octopus has around five hundred million neurons, roughly as many as a dog. But only about a third of them are in the brain; the remaining two-thirds are located in the eight arms. Each arm contains clusters of nerve cells that process information from hundreds of suckers, each of which can both touch and “taste” what it holds. An arm that has been separated from the body can still respond to touch and even reach for food. In effect, the octopus seems to delegate many decisions to its limbs, while the central brain sets the general goals. Researchers sometimes compare the arrangement to a manager who tells a team what needs to be achieved but leaves the details of how to do it to the team members themselves.'],
        ['C', 'Laboratory studies and aquarium stories alike suggest that these animals are skilled problem-solvers. Octopuses have learned to unscrew jar lids to reach food, to find their way through simple mazes and to tell individual human keepers apart, sometimes squirting water at people they appear to dislike. There are numerous reports of octopuses escaping from their tanks at night, crossing the floor and slipping into neighbouring tanks or drains. In experiments, some individuals have even learned to open a container more quickly after watching another octopus do it, although this result has proved difficult to repeat. Such behaviour is all the more remarkable because octopuses receive no care from their parents: everything they know, they must learn by themselves.'],
        ['D', 'The octopus is also a master of disguise. Its skin contains thousands of cells called chromatophores, small sacs of pigment that can be expanded or squeezed by muscles in a fraction of a second. Combined with other cells that reflect light and with muscles that change the texture of the skin, they allow an octopus to match the colour, pattern and even the bumpy surface of rocks, sand or coral. Some species go further and imitate other animals: the mimic octopus of South-East Asia can adopt the shapes of venomous sea snakes or flatfish. Remarkably, the whole transformation can take less than a second, which makes it one of the fastest colour changes in the animal kingdom.'],
        ['E', 'Here, however, lies a puzzle. As far as scientists can tell, most octopuses are colour-blind: their eyes contain only one type of light-sensitive cell. How, then, can they match colours so accurately? Several explanations have been proposed. One is that the skin itself may detect light, since light-sensitive proteins similar to those in the eye have been found in it. Another suggests that the unusual shape of the octopus’s pupil could allow it to extract some colour information from the way light of different wavelengths is focused. Neither idea has yet been confirmed.'],
        ['F', 'Perhaps the strangest fact about this intelligent animal is how short its life is. Most octopus species live only one or two years, and many females die soon after their eggs hatch, having stopped eating while guarding them. Why evolution would produce a large, costly nervous system in an animal that lives so briefly remains an open question. One suggestion is that octopuses lost the protective shell of their ancestors, which left them exposed in a world full of predators; quick learning and clever disguise may have been the price of survival without armour. If that is right, the octopus’s intelligence is less a luxury than an emergency solution - one that has worked remarkably well for hundreds of millions of years.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: INTRO.heading(14, 19, 'F'),
          options: [
            'How octopuses hunt in groups',
            'A nervous system spread through the body',
            'An unexplained ability',
            'An evolutionary path separate from our own',
            'The dangers of keeping octopuses in captivity',
            'How the skin creates disguise',
            'A brief life and a possible explanation',
            'Evidence of learning and problem-solving',
          ],
          items: [
            head('A', 3, 'Everything that makes the octopus clever therefore evolved independently'),
            head('B', 1, 'the remaining two-thirds are located in the eight arms'),
            head('C', 7, 'these animals are skilled problem-solvers'),
            head('D', 5, 'The octopus is also a master of disguise.'),
            head('E', 2, 'Here, however, lies a puzzle.'),
            head('F', 6, 'Perhaps the strangest fact about this intelligent animal is how short its life is.'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(20, 23),
          items: [
            choice('Why does the writer call the octopus “something close to an alien intelligence”?', ['It is more intelligent than humans.', 'Its intelligence evolved completely separately from ours.', 'Scientists are unable to study it.', 'It lives only in the deep ocean.'], 1, 'A', 'Everything that makes the octopus clever therefore evolved independently'),
            choice('What proportion of an octopus’s neurons are found in its arms?', ['about one third', 'about half', 'about two-thirds', 'almost all of them'], 2, 'B', 'the remaining two-thirds are located in the eight arms'),
            choice('What makes the octopus’s ability to learn particularly remarkable?', ['It receives no care from its parents.', 'It learns only from humans.', 'It has a very small brain.', 'It lives in complete darkness.'], 0, 'C', 'octopuses receive no care from their parents: everything they know, they must learn by themselves'),
            choice('What is the puzzle described in paragraph E?', ['Octopuses change colour only at night.', 'Chromatophores are found in very few species.', 'Octopuses match colours although they appear to be colour-blind.', 'Octopus eyes are larger than expected.'], 2, 'E', 'most octopuses are colour-blind… How, then, can they match colours so accurately?'),
          ],
        },
        {
          type: 'tfng',
          intro: INTRO.tfng(24, 26),
          items: [
            tf('An octopus arm can still react to touch after being separated from the body.', 0, 'B', 'An arm that has been separated from the body can still respond to touch'),
            tf('The mimic octopus lives mainly in the Mediterranean Sea.', 1, 'D', 'the mimic octopus of South-East Asia'),
            tf('Octopuses kept in aquariums live longer than those in the wild.', 2, 'F', 'The passage gives the usual lifespan but does not compare aquariums with the wild.'),
          ],
        },
      ],
    },
    {
      title: 'Why We Put Things Off',
      paras: [
        ['A', 'Almost everyone procrastinates at some point. We postpone an essay until the night before it is due, leave a difficult email unanswered for days, or tidy the entire kitchen instead of starting a job application. Surveys suggest that around a fifth of adults regard themselves as chronic procrastinators, and among students the proportion appears to be considerably higher. Because the habit is so common, it is tempting to treat it as a harmless joke. I believe that would be a mistake: procrastination can damage health, grades and careers, and understanding it properly is the first step towards dealing with it. Nor is the problem new: writers in ancient Greece and Rome were already complaining about people who wasted their days by putting off what needed to be done.'],
        ['B', 'The traditional explanation is that procrastinators are lazy or badly organised. Yet this view fits the evidence poorly. Many chronic procrastinators work extremely hard on the tasks they are not avoiding, and many own excellent diaries and to-do lists. What distinguishes them is not a lack of effort or planning, but the way they respond to particular tasks - usually those that are boring, difficult, ambiguous or likely to be judged by others.'],
        ['C', 'A more convincing account sees procrastination as a problem of managing emotions rather than time. When a task makes us feel anxious, insecure or bored, putting it off brings immediate relief. That relief is a reward, and like any reward it makes the behaviour more likely to be repeated. The cost, meanwhile, is paid later, by what psychologists sometimes call our “future self”. Unfortunately, the brain seems to treat that future self almost as a stranger, whose problems feel less urgent than our own discomfort in the present moment. Brain-imaging studies have even suggested that when people think about themselves in ten years’ time, the pattern of activity resembles the one produced when they think about someone else.'],
        ['D', 'This helps to explain why some common advice is so ineffective. Telling a procrastinator to “just get on with it” ignores the feelings that caused the delay in the first place. Similarly, harsh self-criticism tends to backfire. Studies of students have found that those who forgave themselves for procrastinating before one exam procrastinated less before the next. Feeling guilty, it seems, simply adds another unpleasant emotion to the task, making it even more tempting to avoid.'],
        ['E', 'What, then, does work? One approach is to make the first step so small that it provokes little resistance: not “write the essay” but “open the document and type a title”. Once started, people often find the task less unpleasant than they expected. Another is to change the environment so that distractions are harder to reach - for example, by leaving a phone in another room. Setting specific intentions, such as deciding exactly when and where a task will be done, has also been shown to help. Some people find it useful to work in short, timed blocks followed by a break, because a fixed end point makes an unpleasant task feel more manageable.'],
        ['F', 'It would be wrong, however, to suggest that all delay is harmful. Some writers deliberately leave a problem for a while, allowing ideas to develop in the background, and there is some evidence that a short period of delay can make people’s ideas more original. The difference lies in intention. Strategic delay is a choice made with a plan to return; procrastination is an avoidance that we often regret. Confusing the two allows chronic procrastinators to tell themselves that they “work better under pressure”, a belief that research rarely supports.'],
        ['G', 'Procrastination, then, is neither a sign of bad character nor something to laugh off. It is a predictable human response to unpleasant feelings, and like other habits it can be changed. The most useful question to ask when we notice ourselves avoiding a task is not “Why am I so lazy?” but “What feeling am I trying to escape?” Answering it honestly is often enough to make the next small step possible. In the end, the aim is not to become a person who never delays anything, but one who delays by choice rather than by habit.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: INTRO.mc(27, 31),
          items: [
            choice('What does the writer think about treating procrastination as a joke?', ['It helps people relax.', 'It is a mistake.', 'It is common among teachers.', 'It reduces stress at work.'], 1, 'A', 'I believe that would be a mistake'),
            choice('According to paragraph B, what distinguishes chronic procrastinators?', ['They make less effort than other people.', 'They do not use diaries or lists.', 'They react in a particular way to certain kinds of tasks.', 'They are less intelligent than others.'], 2, 'B', 'What distinguishes them is not a lack of effort or planning, but the way they respond to particular tasks'),
            choice('Why does procrastination tend to be repeated?', ['Putting a task off brings immediate relief, which acts as a reward.', 'People forget about their deadlines.', 'Tasks become easier over time.', 'Other people encourage it.'], 0, 'C', 'putting it off brings immediate relief. That relief is a reward'),
            choice('What did the studies of students mentioned in paragraph D find?', ['Students who felt guilty worked harder.', 'Students who forgave themselves procrastinated less later.', 'Students procrastinate more before oral exams.', 'Criticism from teachers reduced procrastination.'], 1, 'D', 'those who forgave themselves for procrastinating before one exam procrastinated less before the next'),
            choice('How does strategic delay differ from procrastination?', ['It always lasts longer.', 'It is only used by writers.', 'It is chosen with a plan to return to the task.', 'It causes more regret.'], 2, 'F', 'Strategic delay is a choice made with a plan to return'),
          ],
        },
        {
          type: 'ynng',
          intro: INTRO.ynng(32, 36),
          items: [
            tf('Procrastination can harm a person’s health.', 0, 'A', 'procrastination can damage health, grades and careers'),
            tf('Most chronic procrastinators are simply lazy.', 1, 'B', 'The traditional explanation is that procrastinators are lazy or badly organised. Yet this view fits the evidence poorly.'),
            tf('Making the first step very small can make it easier to start a task.', 0, 'E', 'make the first step so small that it provokes little resistance'),
            tf('Procrastination is more common in some countries than in others.', 2, 'A', 'The writer gives survey figures but does not compare countries.'),
            tf('Research generally supports the idea that people work better under pressure.', 1, 'F', 'a belief that research rarely supports'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSummary(37, 40, 'H'),
          options: ['emotions', 'relief', 'stranger', 'phone', 'guilt', 'title', 'pressure', 'calendar'],
          items: [
            gap('The writer sees procrastination as a problem of managing ______ rather than time.', 0, 'C', 'procrastination as a problem of managing emotions rather than time'),
            gap('The brain seems to treat our future self almost as a ______.', 2, 'C', 'the brain seems to treat that future self almost as a stranger'),
            gap('______ only adds another unpleasant emotion to the task.', 4, 'D', 'Feeling guilty, it seems, simply adds another unpleasant emotion to the task'),
            gap('Distractions can be reduced, for example by leaving your ______ in another room.', 3, 'E', 'by leaving a phone in another room'),
          ],
        },
      ],
    },
  ],
};
