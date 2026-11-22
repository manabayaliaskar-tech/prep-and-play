import fs from 'fs';
const f = '/home/user/School/src/pools/science/bio-gen.js';
let s = fs.readFileSync(f, 'utf8');
// promote sci rows
for (const n of ['Louis Pasteur','Alexander Fleming','Robert Hooke','Antonie van Leeuwenhoek','Edward Jenner','Robert Koch','Ivan Pavlov','Carl Linnaeus','William Harvey']) {
  const re = new RegExp(`^[23]\\|${n}\\|`, 'm');
  if (!re.test(s)) throw new Error(n);
  s = s.replace(re, `1|${n}|`);
}
const add = (marker, text) => {
  const i = s.indexOf(marker);
  if (i < 0) throw new Error(marker);
  s = s.slice(0, i) + text + s.slice(i);
};
// find end of each table: the "`),\n    ask:" following the table id
const endOf = (id) => {
  const start = s.indexOf(`id: '${id}'`);
  const e = s.indexOf('`),\n    ask:', start);
  return e;
};
const insertAt = (id, text) => { const e = endOf(id); s = s.slice(0, e) + text + s.slice(e); };
insertAt('plants', `1|bud|почка|бүршік|grows into a new shoot, leaves or a flower|даёт начало новому побегу, листьям или цветку|жаңа өркенге, жапырақтарға немесе гүлге бастама береді
1|petal|лепесток|күлте|attracts insects with its colour and scent|привлекает насекомых окраской и запахом|түсімен және иісімен жәндіктерді тартады
1|stamen|тычинка|аталық|makes the pollen|образует пыльцу|тозаң түзеді
1|pistil|пестик|аналық|forms a fruit from its ovary|образует плод из своей завязи|түйнегінен жеміс түзеді
1|bark|кора|қабық|protects the trunk of a tree|защищает ствол дерева|ағаш діңін қорғайды
1|tuber|клубень|түйнек|stores starch (as in a potato)|запасает крахмал (как у картофеля)|крахмал жинайды (картоптағы сияқты)
1|thorn|колючка|тікен|protects the plant from animals|защищает растение от животных|өсімдікті жануарлардан қорғайды
1|annual ring|годичное кольцо|жылдық сақина|shows the age of a tree|показывает возраст дерева|ағаштың жасын көрсетеді
1|rhizome|корневище|тамырсабақ|stores nutrients underground|запасает питательные вещества под землёй|қоректік заттарды жер астында жинайды
`);
insertAt('eco', `1|pollution|загрязнение|ластану|harmful substances getting into air, water or soil|попадание вредных веществ в воздух, воду или почву|зиянды заттардың ауаға, суға немесе топыраққа түсуі
1|recycling|переработка отходов|қалдықты қайта өңдеу|using waste again to make new things|повторное использование отходов для новых вещей|қалдықты қайта пайдаланып жаңа заттар жасау
1|nature reserve|заповедник|қорық|a protected area where nature is left untouched|охраняемая территория с нетронутой природой|табиғаты қорғалатын, қол тигізілмейтін аумақ
1|deforestation|вырубка лесов|орман кесу|the mass cutting down of forests|массовая рубка лесов|ормандарды жаппай кесу
1|food web|пищевая сеть|қоректік желі|many food chains linked together|множество пищевых цепей, связанных между собой|бір-бірімен байланысқан көптеген қоректік тізбек
1|prey|жертва|олжа|an animal that a predator hunts|животное, на которое охотится хищник|жыртқыш аулайтын жануар
1|ozone layer|озоновый слой|озон қабаты|shields living things from harmful ultraviolet rays|защищает живое от вредного ультрафиолета|тіршілікті зиянды ультракүлгін сәулелерден қорғайды
1|natural resources|природные ресурсы|табиғи ресурстар|materials from nature that people use, such as water, coal and wood|природные богатства, которыми пользуется человек: вода, уголь, древесина|адам пайдаланатын табиғи байлықтар: су, көмір, ағаш
1|hibernation|спячка|қысқы ұйқы|a deep winter sleep of some animals|глубокий зимний сон некоторых животных|кейбір жануарлардың терең қысқы ұйқысы
1|migration|миграция (перелёт)|көші-қон|the seasonal movement of animals to other regions|сезонное перемещение животных в другие края|жануарлардың басқа өңірге маусымдық көшуі
1|soil|почва|топырақ|the fertile upper layer of land|плодородный верхний слой суши|құрлықтың құнарлы жоғарғы қабаты
`);
insertAt('sci', `1|Aristotle|Аристотель|Аристотель|the first classification of animals|первая классификация животных|жануарлардың алғашқы жіктелуі
1|Jane Goodall|Джейн Гудолл|Джейн Гудолл|decades of study of wild chimpanzees|многолетнее изучение диких шимпанзе|жабайы шимпанзелерді көп жылдар зерттеу
1|Ivan Michurin|Иван Мичурин|Иван Мичурин|breeding new fruit varieties by hybridisation|выведение новых сортов плодовых растений путём гибридизации|будандастыру арқылы жеміс өсімдіктерінің жаңа сорттарын шығару
1|Frederick Banting|Фредерик Бантинг|Фредерик Бантинг|the discovery of insulin|открытие инсулина|инсулинді ашу
2|Theodor Schwann|Теодор Шванн|Теодор Шванн|the cell theory, with Schleiden|клеточная теория (вместе со Шлейденом)|жасуша теориясы (Шлейденмен бірге)
2|Rudolf Virchow|Рудольф Вирхов|Рудольф Вирхов|the principle that every cell comes from another cell|принцип «каждая клетка из клетки»|«әрбір жасуша жасушадан» қағидасы
2|Robert Brown|Роберт Броун|Роберт Броун|the cell nucleus|клеточное ядро|жасуша ядросы
2|Thomas Hunt Morgan|Томас Морган|Томас Морган|the chromosome theory of heredity, based on fruit flies|хромосомная теория наследственности на опытах с дрозофилой|дрозофила тәжірибелеріне негізделген тұқым қуалаудың хромосомалық теориясы
2|Kliment Timiryazev|Климент Тимирязев|Климент Тимирязев|studies of photosynthesis in green plants|исследования фотосинтеза у зелёных растений|жасыл өсімдіктердегі фотосинтезді зерттеу
2|Ernst Haeckel|Эрнст Геккель|Эрнст Геккель|the term "ecology"|термин «экология»|«экология» терминін енгізу
3|Camillo Golgi|Камилло Гольджи|Камилло Гольджи|the organelle later named after him|органоид клетки, названный его именем|өз атымен аталған жасуша органоиды
3|Hugo de Vries|Хуго де Фриз|Гуго де Фриз|the mutation theory|мутационная теория|мутация теориясы
3|Andreas Vesalius|Андреас Везалий|Андреас Везалий|the first accurate book on human anatomy|первый точный труд по анатомии человека|адам анатомиясы жайлы алғашқы нақты еңбек
3|Alexander Wallace|Альфред Уоллес|Альфред Уоллес|natural selection, independently of Darwin|естественный отбор (независимо от Дарвина)|табиғи сұрыпталу (Дарвиннен тәуелсіз)
`);
fs.writeFileSync(f, s);
