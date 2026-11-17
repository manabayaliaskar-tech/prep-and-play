// IELTS Academic Reading · Test 6: снежный барс, карта Меркатора, четырёхдневная рабочая неделя.

import { INTRO, choice, gap, head, tf } from './kit.js';

export const TEST_6 = {
  id: 'academic-6',
  title: 'IELTS Academic Reading · Test 6',
  passages: [
    {
      title: 'The Ghost of the Mountains',
      paras: [
        ['A', 'Few large animals are as rarely seen as the snow leopard. It lives in the high mountains of Central and South Asia, across twelve countries including Kazakhstan, Kyrgyzstan, Mongolia, China, India and Nepal, usually at altitudes between three and five thousand metres. Its grey, spotted coat blends almost perfectly with rocks and snow, and it is most active at dawn and dusk. Even experienced researchers may spend years in the mountains without seeing one. Local herders have many names for it, and in several cultures it is regarded as a symbol of strength and of the mountains themselves.'],
        ['B', 'The snow leopard is superbly adapted to its harsh environment. Its large paws act like snowshoes, spreading its weight on soft snow, and its thick fur, including fur on the soles of its feet, protects it from temperatures far below freezing. Its tail is remarkably long — almost as long as its body — and helps it to keep its balance on steep slopes; when the animal rests, it wraps its tail around its face for warmth. Unlike lions and tigers, however, the snow leopard cannot roar. It communicates instead with softer sounds, including a kind of puffing noise, and with scent marks left on rocks.'],
        ['C', 'Counting such a secretive animal is extremely difficult. For a long time, population estimates were little more than educated guesses based on reports of tracks and droppings. Today researchers use camera traps — cameras fixed to rocks that take a picture whenever an animal passes — and identify individuals by the unique pattern of spots on their fur. They also analyse DNA from droppings collected along mountain paths. Current estimates suggest that there are perhaps four to seven thousand snow leopards in the wild, but the uncertainty remains large, because only a small part of their range has been carefully surveyed.'],
        ['D', 'In 2017 the International Union for Conservation of Nature changed the snow leopard’s status from “Endangered” to “Vulnerable”. The decision was controversial. Supporters pointed out that the new figures no longer met the criteria for the endangered category; critics argued that the data were too limited to justify any change and feared that the decision would reduce the urgency of conservation efforts. Both sides agreed that the species still faces serious threats, and that the new status did not mean the snow leopard was safe.'],
        ['E', 'The most immediate of these threats is conflict with people. Snow leopards normally hunt wild mountain sheep and goats such as ibex and blue sheep, but where these have declined because of hunting or competition with livestock, the cats sometimes kill domestic animals. A single attack on a corral at night can kill many sheep, and herders may respond by killing the predator. Poaching for fur and for bones used in traditional medicine is a further danger, along with the effects of mining and road building on remote mountain habitats.'],
        ['F', 'Some of the most successful conservation projects have focused on reducing these conflicts. In several countries, organisations have helped herders to build predator-proof corrals with strong walls and roofs of wire mesh, which prevent snow leopards from entering at night. Community insurance schemes compensate families when livestock is lost, provided that no snow leopards are killed in revenge. In some areas, local people have also been trained to work as rangers or to set up camera traps, giving them a direct role in protecting the animal and, in some cases, a new source of income from wildlife tourism.'],
        ['G', 'Climate change adds a new element of uncertainty. As temperatures rise, the tree line in many mountain ranges is moving upwards, which could reduce the open, rocky habitat that snow leopards prefer. Scientists fear that populations may become more isolated from one another as a result. Protecting the corridors that connect different mountain ranges — some of which cross national borders — is therefore likely to become increasingly important for the survival of this elusive cat.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: INTRO.tfng(1, 6),
          items: [
            tf('Snow leopards are most active in the middle of the day.', 1, 'A', 'it is most active at dawn and dusk'),
            tf('The snow leopard uses its tail to keep warm.', 0, 'B', 'it wraps its tail around its face for warmth'),
            tf('Snow leopards can roar like lions.', 1, 'B', 'Unlike lions and tigers, however, the snow leopard cannot roar.'),
            tf('Individual snow leopards can be identified by their spots.', 0, 'C', 'identify individuals by the unique pattern of spots on their fur'),
            tf('Most of the snow leopard’s range has been carefully surveyed.', 1, 'C', 'only a small part of their range has been carefully surveyed'),
            tf('Kyrgyzstan has more snow leopards than any other country.', 2, 'A', 'The passage lists the countries but does not compare their populations.'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSentences(7, 10, 'H'),
          options: ['snowshoes', 'droppings', 'corrals', 'insurance', 'ibex', 'tracks', 'rangers', 'borders'],
          items: [
            gap('The snow leopard’s large paws act like ______.', 0, 'B', 'Its large paws act like snowshoes'),
            gap('Researchers analyse DNA from ______ collected along mountain paths.', 1, 'C', 'They also analyse DNA from droppings collected along mountain paths.'),
            gap('Community ______ schemes compensate families when livestock is lost.', 3, 'F', 'Community insurance schemes compensate families when livestock is lost'),
            gap('Some of the corridors between mountain ranges cross national ______.', 7, 'G', 'some of which cross national borders'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(11, 13),
          items: [
            choice('Why was the change of status in 2017 controversial?', ['Critics believed the data were too limited.', 'The number of snow leopards had fallen sharply.', 'The decision was made by one country.', 'Herders opposed the decision.'], 0, 'D', 'critics argued that the data were too limited to justify any change'),
            choice('Why do snow leopards sometimes kill domestic animals?', ['Domestic animals are easier to find in winter.', 'Their wild prey has declined in some areas.', 'Herders leave food near the corrals.', 'Young snow leopards are taught to do so.'], 1, 'E', 'where these have declined because of hunting or competition with livestock, the cats sometimes kill domestic animals'),
            choice('What condition is attached to the community insurance schemes?', ['Herders must keep fewer sheep.', 'No snow leopards may be killed in revenge.', 'Families must work as rangers.', 'Corrals must be built every year.'], 1, 'F', 'provided that no snow leopards are killed in revenge'),
          ],
        },
      ],
    },
    {
      title: 'The Map That Shaped the World',
      paras: [
        ['A', 'Every map of the world is, in a sense, a compromise. The Earth is roughly a sphere, and it is mathematically impossible to show its curved surface on a flat sheet of paper without distorting something: areas, shapes, distances or directions. Mapmakers therefore choose a projection — a method of transferring the globe onto a flat surface — according to what the map is for. Some projections preserve the correct relative sizes of countries; others keep their shapes accurate over small areas; none can do everything at once. Which compromise is chosen can shape the way millions of people picture the world. Most people never think about projections at all, yet the map on a classroom wall can quietly influence their sense of which countries are large, central or important.'],
        ['B', 'The most famous projection of all was published in 1569 by the Flemish mapmaker Gerardus Mercator. Mercator designed his map for navigation at sea. Its great advantage is that a line of constant compass direction, which sailors followed when crossing the ocean, appears on the map as a straight line. A navigator could draw a line between two ports, measure its angle and set the ship’s course accordingly. For sailors in an age long before satellites, this was an enormous practical benefit, and the projection became the standard for nautical charts. It remained so for centuries, and versions of it are still used in navigation today.'],
        ['C', 'The price of this convenience is a dramatic distortion of size. To keep directions correct, Mercator’s projection stretches the map more and more towards the poles. Countries far from the equator therefore appear much larger than they really are. Greenland, for example, looks roughly as large as Africa, although Africa is in fact about fourteen times bigger. Europe and North America appear larger relative to South America and Africa than they actually are, and Antarctica becomes an enormous strip along the bottom of the map. The poles themselves cannot be shown at all, because the stretching becomes infinite there, so most Mercator maps simply cut off the far north and south.'],
        ['D', 'These distortions were of little concern to sailors, but they became controversial once the Mercator map began to be used for other purposes, such as wall maps in schools. In the 1970s the German historian Arno Peters promoted an alternative projection that showed all areas in their correct proportions. He argued that the Mercator map exaggerated the importance of wealthy northern countries. His campaign attracted wide attention, and some organisations adopted his map. Many cartographers, however, criticised it, pointing out that a similar projection had been described more than a century earlier and that it badly distorted the shapes of countries, which appear strangely stretched.'],
        ['E', 'In fact, most professional mapmakers had long avoided both extremes for world maps. They preferred compromise projections, which distort size and shape a little but avoid the worst errors of either. Such projections are widely used in atlases and by organisations that publish world maps. Yet the debate showed how strongly people can feel about maps, which many treat not simply as tools but as statements about the world and about which places matter. In 2017, for example, schools in Boston in the United States made headlines when they decided to replace Mercator maps in classrooms with equal-area maps.'],
        ['F', 'The Mercator projection has nevertheless enjoyed an unexpected revival in the digital age. Online map services adopted a version of it, because it keeps shapes and angles correct at a local level: a street corner that is a right angle in reality also looks like a right angle on the screen, whatever the zoom level. For finding your way around a city, this matters far more than the relative size of continents. At the scale of the whole planet, however, the same distortions remain, which is why some services now switch to a globe view when users zoom out. More than four centuries after it was published, Mercator’s solution is still shaping how people see the world — now on the screens in their pockets.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: INTRO.heading(14, 19, 'F'),
          options: [
            'Why every flat map must distort something',
            'A map designed for sailors',
            'A digital comeback',
            'How satellites replaced maps',
            'A challenge and its critics',
            'The cost of straight lines',
            'The middle way preferred by experts',
            'The life of Gerardus Mercator',
          ],
          items: [
            head('A', 0, 'it is mathematically impossible to show its curved surface on a flat sheet of paper without distorting something'),
            head('B', 1, 'Mercator designed his map for navigation at sea.'),
            head('C', 5, 'The price of this convenience is a dramatic distortion of size.'),
            head('D', 4, 'Many cartographers, however, criticised it'),
            head('E', 6, 'They preferred compromise projections'),
            head('F', 2, 'The Mercator projection has nevertheless enjoyed an unexpected revival in the digital age.'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(20, 23),
          items: [
            choice('Why was Mercator’s projection useful to sailors?', ['It showed the true size of the oceans.', 'A line of constant compass direction appears straight.', 'It included the positions of ports.', 'It showed the depth of the water.'], 1, 'B', 'a line of constant compass direction… appears on the map as a straight line'),
            choice('How large is Africa compared with Greenland?', ['About the same size', 'About four times bigger', 'About fourteen times bigger', 'About forty times bigger'], 2, 'C', 'Africa is in fact about fourteen times bigger'),
            choice('What was one criticism of the projection promoted by Peters?', ['It was too expensive to print.', 'It badly distorted the shapes of countries.', 'It made Europe look too large.', 'It could not be used in schools.'], 1, 'D', 'it badly distorted the shapes of countries'),
            choice('Why do online map services use a version of Mercator’s projection?', ['It keeps shapes and angles correct at a local level.', 'It shows the true size of continents.', 'It was the cheapest option.', 'Users asked for it.'], 0, 'F', 'it keeps shapes and angles correct at a local level'),
          ],
        },
        {
          type: 'tfng',
          intro: INTRO.tfng(24, 26),
          items: [
            tf('Mercator published his map in the sixteenth century.', 0, 'B', 'published in 1569'),
            tf('Peters was the first person to describe a projection of this kind.', 1, 'D', 'a similar projection had been described more than a century earlier'),
            tf('Most schools today use the map promoted by Peters.', 2, 'D', 'The passage says some organisations adopted it but not how many schools use it today.'),
          ],
        },
      ],
    },
    {
      title: 'Four Days a Week?',
      paras: [
        ['A', 'For most of the twentieth century, the five-day working week seemed as natural as the seasons. It was not always so: the two-day weekend became common in many industrial countries only in the early and middle decades of that century, after long campaigns by workers and some forward-looking employers. Now a new question is being asked. If productivity has risen so much since then, could people work four days instead of five, without losing pay and without employers losing output? In my view, the evidence so far is encouraging, but it is too early to treat the four-day week as a universal solution. The idea raises questions not only about productivity but also about health, family life and what kind of work people value.'],
        ['B', 'The most widely reported evidence comes from trials in which companies agreed to reduce working time for a fixed period while keeping pay the same. In a large trial in the United Kingdom in 2022, around sixty organisations took part for six months, and the great majority chose to continue with a shorter week afterwards. Employees reported less stress and better sleep, and many companies said that their performance had been maintained. Earlier trials in Iceland’s public sector, in which working hours were reduced rather than whole days removed, produced similar reports of improved well-being without a fall in the quality of services.'],
        ['C', 'These results deserve to be taken seriously, but they also need careful interpretation. The organisations that volunteered for such trials were probably those most likely to benefit, and their managers were often enthusiastic supporters of the idea. Employees who know they are part of an experiment may also work especially hard to make it succeed. Furthermore, much of the evidence on performance came from the companies themselves rather than from independent measurement. None of this means the results are wrong; it means that we cannot simply assume they would be repeated across the whole economy.'],
        ['D', 'Why might a shorter week not reduce output? One reason is that a considerable part of the ordinary working day is not very productive. Long meetings, unnecessary emails and constant interruptions take up a surprising amount of time. When the week becomes shorter, organisations are forced to identify and remove such waste. Tired employees also make more mistakes, so a better-rested workforce may achieve more in less time. These mechanisms are real, but they have limits: at some point, there is no more waste to remove. Beyond that point, fewer hours are likely to mean less work done, however well organised a company may be.'],
        ['E', 'Those limits are most obvious in jobs where output is directly linked to time. A bus driver cannot transport passengers on a day when they are not working, and a hospital needs nurses every day of the week. In such sectors, a four-day week would require hiring more staff, which raises costs, or would reduce the service available to the public. A policy that works well for an office of software designers may therefore be impractical, or at least much more expensive, for a care home or a factory.'],
        ['F', 'There is also a risk that a compressed week simply moves the pressure around. If the same amount of work must be completed in four days, those days may become longer and more intense, cancelling out some of the benefits. The more successful trials avoided this by redesigning work rather than squeezing it. This suggests that the number of days matters less than how work is organised — a point that applies equally to companies that keep a five-day week.'],
        ['G', 'The four-day week, then, should be seen as a promising experiment rather than a proven answer. Governments and employers would do well to support more trials, including in sectors where the idea is more difficult to apply, and to measure their effects independently. Above all, the debate has already done something useful: it has encouraged organisations to ask whether the way they use people’s time actually makes sense.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: INTRO.mc(27, 31),
          items: [
            choice('What is the writer’s overall view of the four-day week?', ['It has been proved to work everywhere.', 'It is encouraging but not yet a universal solution.', 'It is likely to harm the economy.', 'It is only suitable for factories.'], 1, 'A', 'the evidence so far is encouraging, but it is too early to treat the four-day week as a universal solution'),
            choice('What happened after the trial in the United Kingdom?', ['Most organisations returned to a five-day week.', 'Most organisations continued with a shorter week.', 'Employees asked for higher pay.', 'The government banned the scheme.'], 1, 'B', 'the great majority chose to continue with a shorter week afterwards'),
            choice('Why does the writer say the trial results need careful interpretation?', ['The trials were too long.', 'The organisations that volunteered were likely to benefit most.', 'Employees did not want to take part.', 'The results were never published.'], 1, 'C', 'The organisations that volunteered for such trials were probably those most likely to benefit'),
            choice('According to paragraph D, why might output not fall with a shorter week?', ['Employees are paid more.', 'Organisations remove unproductive activities.', 'Customers ask for less.', 'Machines replace workers.'], 1, 'D', 'organisations are forced to identify and remove such waste'),
            choice('Why might a four-day week be difficult for hospitals?', ['Nurses prefer longer weeks.', 'They need staff every day, so more people would have to be hired.', 'Patients would not accept it.', 'Hospitals have no meetings to remove.'], 1, 'E', 'a hospital needs nurses every day of the week. In such sectors, a four-day week would require hiring more staff'),
          ],
        },
        {
          type: 'ynng',
          intro: INTRO.ynng(32, 36),
          items: [
            tf('The two-day weekend has existed for many centuries.', 1, 'A', 'the two-day weekend became common in many industrial countries only in the early and middle decades of that century'),
            tf('Much of the evidence on performance in the trials came from the companies themselves.', 0, 'C', 'much of the evidence on performance came from the companies themselves'),
            tf('Employees in the Icelandic trials received higher wages.', 2, 'B', 'The writer describes the Icelandic trials but says nothing about wages.'),
            tf('Tired employees are more likely to make mistakes.', 0, 'D', 'Tired employees also make more mistakes'),
            tf('A compressed working week always reduces pressure on workers.', 1, 'F', 'There is also a risk that a compressed week simply moves the pressure around.'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSummary(37, 40, 'H'),
          options: ['meetings', 'volunteered', 'waste', 'intense', 'nurses', 'sleep', 'redesigning', 'salaries'],
          items: [
            gap('Employees in the British trial reported less stress and better ______.', 5, 'B', 'Employees reported less stress and better sleep'),
            gap('A shorter week forces organisations to identify and remove ______.', 2, 'D', 'organisations are forced to identify and remove such waste'),
            gap('If work is squeezed into four days, those days may become longer and more ______.', 3, 'F', 'those days may become longer and more intense'),
            gap('The more successful trials avoided this problem by ______ work.', 6, 'F', 'by redesigning work rather than squeezing it'),
          ],
        },
      ],
    },
  ],
};
