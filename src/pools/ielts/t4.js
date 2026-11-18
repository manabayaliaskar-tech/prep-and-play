// IELTS Academic Reading · Test 4: молния, пустынная саранча, многозадачность.

import { INTRO, choice, gap, head, tf } from './kit.js';

export const TEST_4 = {
  id: 'academic-4',
  title: 'IELTS Academic Reading · Test 4',
  passages: [
    {
      title: 'Understanding Lightning',
      paras: [
        ['A', 'At any given moment, around two thousand thunderstorms are active somewhere on Earth, and together they produce something like forty to fifty flashes of lightning every second. Lightning is among the most familiar natural phenomena, yet it is also one of the least understood. Scientists can describe what happens during a strike in considerable detail, but several basic questions - including exactly how a flash begins - are still being investigated. Lightning is also dangerous: it kills people every year, damages buildings and power lines, and starts many wildfires, particularly in remote forests where storms bring little rain.'],
        ['B', 'A lightning flash is a giant electrical spark. Inside a thunderstorm cloud, strong upward currents of air carry water droplets and small ice particles high into the atmosphere, where they collide with falling pellets of soft hail. In these collisions, electric charge is transferred between particles. As a result, the upper part of the cloud usually becomes positively charged and the lower part negatively charged. When the difference in charge becomes large enough to overcome the insulating effect of the air, a discharge occurs, either within the cloud, between clouds or between the cloud and the ground. In fact, most flashes never reach the ground at all.'],
        ['C', 'The heat produced is extraordinary. In a fraction of a second, the air in the lightning channel can reach about thirty thousand degrees Celsius, roughly five times hotter than the surface of the Sun. The air expands so violently that it creates a shock wave, which we hear as thunder. Because light travels almost a million times faster than sound, we see a flash before we hear it. Counting the seconds between the two and dividing by three gives a rough estimate of the distance to the storm in kilometres.'],
        ['D', 'Systematic study of lightning began in the eighteenth century. In 1752 the American writer and scientist Benjamin Franklin is said to have flown a kite during a storm to show that lightning was a form of electricity, although historians are not certain exactly how the experiment was carried out. More importantly, Franklin promoted the lightning rod, a metal pole fixed to the top of a building and connected to the ground, which gives the electric current a safe path to follow. Lightning rods spread quickly, and their basic design has changed little since then.'],
        ['E', 'Today, researchers rely on far more sophisticated tools. Networks of ground-based sensors detect the radio waves that every flash produces, allowing its position to be calculated within seconds. Since the 1990s, instruments carried by satellites have also mapped lightning from space, revealing a pattern that surprised many people: lightning is far more common over land than over the oceans, and some places experience it almost every night. One of the best known is Lake Maracaibo in Venezuela, where warm, moist air and the surrounding mountains produce storms on many nights of the year.'],
        ['F', 'Satellite observations have also confirmed the existence of strange phenomena above thunderstorms. Pilots had occasionally reported brief flashes of red light high above storm clouds, but for many years their accounts were treated with suspicion. In 1989, however, a camera being tested for another purpose recorded one of these flashes by chance. Now known as “sprites”, they occur between about fifty and ninety kilometres above the ground and last only a few thousandths of a second, which is why they are so rarely seen.'],
        ['G', 'Understanding lightning has practical value as well as scientific interest. Better detection systems allow airports, sports organisers and electricity companies to take precautions before a storm arrives. There is also concern that a warmer climate could change the frequency of lightning, with consequences for wildfires in places such as the Arctic, where lightning was once rare. For individuals, though, the most important advice remains simple: if you can hear thunder, you are close enough to be struck, and the safest place is inside a building or a car with a metal roof.'],
      ],
      groups: [
        {
          type: 'tfng',
          intro: INTRO.tfng(1, 6),
          items: [
            tf('Most lightning flashes strike the ground.', 1, 'B', 'In fact, most flashes never reach the ground at all.'),
            tf('Thunder is caused by air expanding very quickly.', 0, 'C', 'The air expands so violently that it creates a shock wave, which we hear as thunder.'),
            tf('Historians know exactly how Franklin carried out his kite experiment.', 1, 'D', 'historians are not certain exactly how the experiment was carried out'),
            tf('Franklin earned a large income from selling lightning rods.', 2, 'D', 'The passage says Franklin promoted the lightning rod but says nothing about money.'),
            tf('Lightning is more common over land than over the oceans.', 0, 'E', 'lightning is far more common over land than over the oceans'),
            tf('The first sprite was recorded by a camera designed to look for sprites.', 1, 'F', 'a camera being tested for another purpose recorded one of these flashes by chance'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSentences(7, 10, 'H'),
          options: ['hail', 'sensors', 'thirty', 'three', 'sprites', 'mountains', 'radio', 'ice'],
          items: [
            gap('Charge is transferred when ice particles collide with pellets of soft ______.', 0, 'B', 'collide with falling pellets of soft hail'),
            gap('To estimate the distance to a storm in kilometres, divide the number of seconds by ______.', 3, 'C', 'Counting the seconds between the two and dividing by three'),
            gap('Ground-based sensors detect the ______ waves that each flash produces.', 6, 'E', 'detect the radio waves that every flash produces'),
            gap('At Lake Maracaibo, warm air and the surrounding ______ produce frequent storms.', 5, 'E', 'warm, moist air and the surrounding mountains produce storms'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(11, 13),
          items: [
            choice('What does the writer say about how a lightning flash begins?', ['It was explained by Franklin.', 'It is still being investigated.', 'It depends only on temperature.', 'It is well understood.'], 1, 'A', 'including exactly how a flash begins - are still being investigated'),
            choice('Why do we see lightning before we hear thunder?', ['Light travels much faster than sound.', 'Thunder is produced later than the flash.', 'Sound is blocked by rain.', 'Our eyes react faster than our ears.'], 0, 'C', 'Because light travels almost a million times faster than sound, we see a flash before we hear it.'),
            choice('Why are sprites so rarely seen?', ['They only happen over the sea.', 'They are too faint for cameras.', 'They last only a few thousandths of a second.', 'They occur only in winter.'], 2, 'F', 'last only a few thousandths of a second, which is why they are so rarely seen'),
          ],
        },
      ],
    },
    {
      title: 'The Two Lives of the Desert Locust',
      paras: [
        ['A', 'For most of its life, the desert locust is a rather unremarkable insect. In its solitary phase it is greenish-brown, avoids other locusts and lives quietly in the dry regions stretching from West Africa to India. Under certain conditions, however, it undergoes a dramatic transformation. Its colour changes to bright yellow and black, its behaviour changes from shy to sociable, and it begins to move in bands and swarms that can cover hundreds of square kilometres. Few changes in the animal kingdom are as striking, and few have such serious consequences for people. In its gregarious form, the desert locust is regarded as the most destructive migratory pest in the world.'],
        ['B', 'The trigger for this change is crowding. After good rains, vegetation grows in the desert and locusts breed rapidly. As the plants dry out again, the insects are forced together in the remaining green patches. Experiments have shown that repeated touching of the hind legs, which happens when locusts are packed closely together, is enough to start the transformation. In 2009 researchers found that this contact causes a sharp rise in serotonin, a chemical messenger in the nervous system, and that blocking serotonin prevented locusts from becoming gregarious. Within a few hours, an insect that once avoided company begins to seek it out. The change in colour and body shape takes longer, developing over several generations if crowding continues, which is why the most dramatic swarms appear only after a series of good breeding seasons.'],
        ['C', 'Once formed, a swarm can be enormous. A single square kilometre of swarm may contain tens of millions of adults, and large swarms can cover many hundreds of square kilometres. Carried by the wind, swarms can travel more than a hundred kilometres in a day. Each locust can eat roughly its own weight in fresh plants daily, so even a small swarm can consume as much food in a day as thousands of people. For farmers in affected regions, the arrival of a swarm can destroy a season’s harvest in a matter of hours. Pasture for livestock is affected just as badly, so herders as well as farmers can lose their livelihoods.'],
        ['D', 'Because swarms cross national borders, controlling them requires international cooperation. The Food and Agriculture Organization of the United Nations runs a desert locust information service that collects reports from affected countries, combines them with satellite data on rainfall and vegetation, and issues forecasts and warnings. The aim is to find and treat breeding areas early, before young locusts form bands and then swarms. Once swarms have formed, control becomes much more difficult and expensive, and much of the damage may already have been done. Monitoring is not easy, however, because breeding often takes place in remote deserts that are difficult and sometimes dangerous to reach, and survey teams may have to search areas the size of whole countries.'],
        ['E', 'The methods used for control have changed over time. For decades, the main weapon was chemical pesticides sprayed from the ground or from aircraft. These are effective but can harm other insects, birds and people, especially when large areas are treated. Increasingly, control teams also use biological products based on a fungus that infects locusts but is harmless to most other animals. The fungus acts more slowly than chemicals, which makes it most useful against young locusts in breeding areas rather than against swarms that are already on the move. Researchers are also testing drones that can spray small, precise amounts of pesticide, reducing the quantity that ends up in the wider environment.'],
        ['F', 'The importance of early action was shown between 2019 and 2021, when an unusually severe upsurge affected East Africa, the Arabian Peninsula and South Asia. Exceptional rainfall, linked to cyclones over the Arabian Sea, created ideal breeding conditions in remote areas where monitoring was difficult. Kenya experienced its worst outbreak for decades. A large international response eventually brought the situation under control, but the episode raised concerns that changing weather patterns could make such upsurges more frequent in the future. For the communities affected, the lesson was clear: money spent on monitoring in quiet years is far cheaper than the cost of fighting swarms once they have formed.'],
      ],
      groups: [
        {
          type: 'heading',
          intro: INTRO.heading(14, 19, 'F'),
          options: [
            'A rapid change caused by contact',
            'The scale and appetite of swarms',
            'Locusts as a source of food for people',
            'An ordinary insect with a hidden second form',
            'A recent crisis and a warning for the future',
            'Sharing information across borders',
            'From chemical sprays to biological control',
            'Why locusts cannot survive in cold climates',
          ],
          items: [
            head('A', 3, 'Under certain conditions, however, it undergoes a dramatic transformation.'),
            head('B', 0, 'repeated touching of the hind legs… is enough to start the transformation'),
            head('C', 1, 'Once formed, a swarm can be enormous.'),
            head('D', 5, 'Because swarms cross national borders, controlling them requires international cooperation.'),
            head('E', 6, 'The methods used for control have changed over time.'),
            head('F', 4, 'the episode raised concerns that changing weather patterns could make such upsurges more frequent'),
          ],
        },
        {
          type: 'mc',
          intro: INTRO.mc(20, 23),
          items: [
            choice('What triggers the change from the solitary to the gregarious phase?', ['Hot weather', 'Crowding', 'A lack of food', 'Strong winds'], 1, 'B', 'The trigger for this change is crowding.'),
            choice('What did researchers discover in 2009?', ['Locusts can change colour at will.', 'Serotonin rises with contact, and blocking it prevents the change.', 'Swarms form only after cyclones.', 'Locusts avoid each other when crowded.'], 1, 'B', 'this contact causes a sharp rise in serotonin… and that blocking serotonin prevented locusts from becoming gregarious'),
            choice('What is the main aim of the desert locust information service?', ['To find and treat breeding areas early', 'To protect locusts from extinction', 'To sell pesticides to farmers', 'To train pilots to spray crops'], 0, 'D', 'The aim is to find and treat breeding areas early'),
            choice('Why is the fungus most useful against young locusts in breeding areas?', ['It is cheaper than chemicals.', 'It acts more slowly than chemicals.', 'It only grows in deserts.', 'It is harmful to birds.'], 1, 'E', 'The fungus acts more slowly than chemicals, which makes it most useful against young locusts in breeding areas'),
          ],
        },
        {
          type: 'tfng',
          intro: INTRO.tfng(24, 26),
          items: [
            tf('Locust swarms can travel more than a hundred kilometres in a day.', 0, 'C', 'swarms can travel more than a hundred kilometres in a day'),
            tf('Chemical pesticides are harmless to birds.', 1, 'E', 'can harm other insects, birds and people'),
            tf('India suffered more damage than Kenya during the 2019-2021 upsurge.', 2, 'F', 'The passage mentions Kenya’s outbreak but does not compare it with India.'),
          ],
        },
      ],
    },
    {
      title: 'The Myth of Multitasking',
      paras: [
        ['A', 'We live in an age that seems to reward multitasking. Office workers answer messages during meetings, students study with music, video and chat windows open at the same time, and job advertisements ask for candidates who can “juggle multiple priorities”. Many people are proud of their ability to do several things at once. In my view, much of this pride is misplaced. The research on attention suggests that what we call multitasking is, in most cases, something rather different, and that it carries costs that are easy to overlook. Before praising the skill, it is worth asking what is actually happening in our heads when we try to do several things at once.'],
        ['B', 'The first point to make is that the human brain is very limited in its ability to perform two demanding tasks at the same time. We can walk and talk, or drive along a familiar road while listening to the radio, because one of the activities has become largely automatic. But when two tasks both require conscious thought - writing an essay and following a conversation, for example - the brain does not process them in parallel. Instead, it switches rapidly between them, often so quickly that we do not notice. The impression of doing two things at once is, in this sense, an illusion created by the speed of the changes.'],
        ['C', 'Each of these switches has a cost. Laboratory experiments in which people alternate between simple tasks, such as classifying numbers and letters, consistently show that responses are slower and less accurate immediately after a switch. The delay for a single switch may be only a fraction of a second, but over a working day filled with interruptions, the losses add up. Some researchers estimate that frequent switching can reduce productivity considerably, although the exact size of the effect depends heavily on the tasks involved. Returning to a complex task after an interruption is particularly costly, because we must first remember where we were and what we were planning to do next.'],
        ['D', 'Perhaps more worrying is the possibility that heavy multitasking affects attention more generally. In a well-known study published in 2009, people who reported frequently using several forms of media at once performed worse on tests that required them to ignore irrelevant information than people who rarely did so. It is not clear whether multitasking caused this weakness or whether people who are easily distracted are simply drawn to multitasking. Either way, the finding challenges the popular belief that practice makes us better at doing several things at once.'],
        ['E', 'There is also an emotional dimension. Constant switching can create a sense of busyness that feels productive even when little is being achieved. Answering a quick message provides a small sense of completion, while a long, demanding task offers no such immediate reward. It is therefore easy to fill a day with small, satisfying activities while the important work remains untouched. Several studies have also linked frequent interruptions at work with higher levels of stress.'],
        ['F', 'I do not want to suggest that all multitasking is harmful. Combining an automatic activity with a demanding one is usually fine, and some people find that background music helps them to concentrate, particularly if it has no lyrics. A small number of people also appear to be genuinely good at handling two demanding tasks, but they are a very small minority, and most of us overestimate our chances of belonging to it. Indeed, studies suggest that those who multitask most are often the ones who are least good at it.'],
        ['G', 'The practical lesson is to protect periods of single-tasking for work that requires real thought. This may mean closing email, silencing notifications or simply deciding in advance to do one thing at a time. Such measures can feel uncomfortable at first, precisely because we have grown used to constant stimulation. But the reward is not only better work; it is also the satisfaction of giving full attention to something, which is one of the more neglected pleasures of modern life.'],
      ],
      groups: [
        {
          type: 'mc',
          intro: INTRO.mc(27, 31),
          items: [
            choice('What does the writer think about people’s pride in multitasking?', ['It is fully justified.', 'Much of it is misplaced.', 'It is a sign of intelligence.', 'It is mostly found among students.'], 1, 'A', 'In my view, much of this pride is misplaced.'),
            choice('According to paragraph B, why can we walk and talk at the same time?', ['Both activities are very easy to learn.', 'One of the activities has become largely automatic.', 'The brain processes both in parallel.', 'Walking improves concentration.'], 1, 'B', 'because one of the activities has become largely automatic'),
            choice('What do laboratory experiments on switching show?', ['People become faster after each switch.', 'Responses are slower and less accurate right after a switch.', 'Switching has no measurable effect.', 'Only older people are affected.'], 1, 'C', 'responses are slower and less accurate immediately after a switch'),
            choice('What is uncertain about the findings of the 2009 study?', ['Whether multitasking causes weaker attention or distractible people multitask more', 'Whether the participants used any media', 'Whether the tests were difficult', 'Whether the study was published'], 0, 'D', 'It is not clear whether multitasking caused this weakness or whether people who are easily distracted are simply drawn to multitasking.'),
            choice('Why, according to paragraph E, do small tasks often push out important work?', ['They are better paid.', 'They give an immediate sense of completion.', 'They require more thought.', 'Managers prefer them.'], 1, 'E', 'Answering a quick message provides a small sense of completion'),
          ],
        },
        {
          type: 'ynng',
          intro: INTRO.ynng(32, 36),
          items: [
            tf('The brain processes two demanding tasks in parallel.', 1, 'B', 'the brain does not process them in parallel'),
            tf('The small losses caused by switching can add up over a day.', 0, 'C', 'over a working day filled with interruptions, the losses add up'),
            tf('Frequent interruptions at work may be linked with higher stress.', 0, 'E', 'Several studies have also linked frequent interruptions at work with higher levels of stress.'),
            tf('Young people multitask more than older people do.', 2, 'A', 'The writer does not compare people of different ages.'),
            tf('People who multitask the most are usually the best at it.', 1, 'F', 'those who multitask most are often the ones who are least good at it'),
          ],
        },
        {
          type: 'bank',
          intro: INTRO.bankSummary(37, 40, 'H'),
          options: ['switches', 'automatic', 'notifications', 'busyness', 'lyrics', 'parallel', 'reward', 'minority'],
          items: [
            gap('Two activities can be combined when one of them has become ______.', 1, 'B', 'because one of the activities has become largely automatic'),
            gap('Constant switching can create a sense of ______ that feels productive.', 3, 'E', 'Constant switching can create a sense of busyness that feels productive'),
            gap('Only a small ______ of people seem genuinely good at two demanding tasks.', 7, 'F', 'they are a very small minority'),
            gap('Periods of real thought can be protected by silencing ______.', 2, 'G', 'silencing notifications'),
          ],
        },
      ],
    },
  ],
};
