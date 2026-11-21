// Анимации тем: Информатика, география, история и английский. Формат сцены описан в src/screens/explain.js.

import { getLang, t, tx } from '../core/i18n.js';
import { L } from '../pools/gen.js';
import { esc } from '../ui/dom.js';
import { W, H, C, SVGNS, reduced, clamp, lerp, ease, n1, fmt, term, coef, lineEq, u, hhmm, arrow, plot, axes, slider, morph, AGAIN, RESET, PROGRESS } from './kit.js';

export const SCENES_HUMAN = {

  timezones: {
    title: L('Earth rotation and time zones', 'Вращение Земли и часовые пояса', 'Жердің айналуы және сағат белдеулері'),
    intro: L('Seen from above the North Pole, Earth turns 360° in 24 hours - 15° per hour. That is why clocks in places 15° apart differ by about one hour.', 'Если смотреть с Северного полюса, Земля поворачивается на 360° за 24 часа - на 15° в час. Поэтому в местах, отстоящих на 15° по долготе, часы различаются примерно на час.', 'Солтүстік полюстен қарасақ, Жер 24 сағатта 360°-қа - сағатына 15°-қа бұрылады. Сондықтан бойлығы 15°-қа алшақ жерлерде сағаттар шамамен бір сағатқа өзгешеленеді.'),
    sliders: [{ id: 'tt', label: L('time UTC', 'время UTC', 'UTC уақыты'), min: 0, max: 24, step: C, value: 9, show: hhmm }],
    buttons: [L('▶ One day', '▶ Одни сутки', '▶ Бір тәулік')],
    play: 'tt',
    playDur: 8000,
    playLinear: true,
    draw(v) {
      const cx = 85;
      const cy = 110;
      const r = 66;
      const rot = (v.tt - 12) * 15;
      const merid = Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 15 + rot) * Math.PI) / 180;
        return `<line class="ex-grid" x1="${n1(cx - r * Math.cos(a))}" y1="${n1(cy + r * Math.sin(a))}" x2="${n1(cx + r * Math.cos(a))}" y2="${n1(cy - r * Math.sin(a))}"/>`;
      }).join('');
      const pins = CITIES.map((c, i) => {
        const a = ((v.tt + c.o - 12) * 15 * Math.PI) / 180;
        return `<circle class="ex-city c${i}" cx="${n1(cx + (r - 8) * Math.cos(a))}" cy="${n1(cy - (r - 8) * Math.sin(a))}" r="5"/>`;
      }).join('');
      const list = CITIES.map((c, i) => {
        const lt = (((v.tt + c.o) % 24) + 24) % 24;
        const day = lt >= 6 && lt < 18;
        return `<circle class="ex-city c${i}" cx="176" cy="${36 + i * 30}" r="5"/><text class="ex-tag" x="186" y="${40 + i * 30}">${tx(c.n)}</text><text class="ex-small ex-end" x="314" y="${40 + i * 30}">${hhmm(lt)}</text><text class="ex-tiny ex-start" x="186" y="${53 + i * 30}">UTC${c.o >= 0 ? '+' : '−'}${Math.abs(c.o)} · ${day ? u('day', 'день', 'күндіз') : u('night', 'ночь', 'түн')}</text>`;
      }).join('');
      return {
        svg: `<circle class="ex-earth" cx="${cx}" cy="${cy}" r="${r}"/>${merid}<path class="ex-night" d="M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z"/>
          <circle class="ex-fill exc-m" cx="${cx}" cy="${cy}" r="3"/>${pins}<g class="exc-y">${arrow(cx + r + 20, cy, cx + r + 5, cy, '', 3)}</g>${list}`,
        caption: L(
          `Now ${hhmm(v.tt)} UTC: London ${hhmm(v.tt)}, Astana ${hhmm(v.tt + 5)}, Tokyo ${hhmm(v.tt + 9)}. Each hour Earth turns 15°, so the line of sunrise moves 15° west - and the local time shifts by one hour per 15° of longitude.`,
          `Сейчас ${hhmm(v.tt)} UTC: в Лондоне ${hhmm(v.tt)}, в Астане ${hhmm(v.tt + 5)}, в Токио ${hhmm(v.tt + 9)}. За час Земля поворачивается на 15°, граница рассвета сдвигается на 15° к западу - и местное время меняется на час на каждые 15° долготы.`,
          `Қазір UTC бойынша ${hhmm(v.tt)}: Лондонда ${hhmm(v.tt)}, Астанада ${hhmm(v.tt + 5)}, Токиода ${hhmm(v.tt + 9)}. Бір сағатта Жер 15°-қа бұрылады, таң шекарасы батысқа 15°-қа жылжиды - жергілікті уақыт бойлықтың әр 15°-ына бір сағатқа өзгереді.`,
        ),
      };
    },
  },

  binary: {
    title: L('Binary numbers: bits and bytes', 'Двоичные числа: биты и байты', 'Екілік сандар: биттер мен байттар'),
    intro: L('A computer stores numbers as bits - lamps that are on (1) or off (0). Each bit is worth a power of two: 1, 2, 4, 8, … Eight bits make a byte.', 'Компьютер хранит числа в битах - лампочках, которые горят (1) или нет (0). Каждый бит стоит степень двойки: 1, 2, 4, 8, … Восемь битов - один байт.', 'Компьютер сандарды биттерде сақтайды - жанып (1) не сөніп (0) тұрған шамдар. Әр бит екінің дәрежесіне тең: 1, 2, 4, 8, … Сегіз бит - бір байт.'),
    sliders: [{ id: 'n', label: 'n', min: 0, max: 255, value: 74 }],
    buttons: ['128', '64', '32', '16', '8', '4', '2', '1'],
    pressed: (i, v) => ((v.n >> (7 - i)) & 1) === 1,
    onButton(i, st, v) {
      v.n ^= 1 << (7 - i);
    },
    draw(v) {
      const n = Math.round(v.n);
      const bits = Array.from({ length: 8 }, (_, i) => (n >> (7 - i)) & 1);
      const lamps = bits.map((b, i) => `<circle class="ex-lamp${b ? ' on' : ''}" cx="${30 + i * 37}" cy="96" r="15"/><text class="ex-small" x="${30 + i * 37}" y="101">${b}</text><text class="ex-tiny" x="${30 + i * 37}" y="130">2${'⁷⁶⁵⁴³²¹⁰'[i]}</text><text class="ex-tiny" x="${30 + i * 37}" y="144">${2 ** (7 - i)}</text>`).join('');
      const parts = bits.map((b, i) => (b ? 2 ** (7 - i) : 0)).filter(Boolean);
      const sum = parts.length ? `${parts.join(' + ')} = ${n}` : '0';
      const bin = bits.join('');
      const hex = n.toString(16).toUpperCase().padStart(2, '0');
      return {
        svg: `<text class="ex-big" x="160" y="40">${n} = ${bin}₂ = ${hex}₁₆</text>${lamps}<text class="ex-small" x="160" y="180">${sum}</text>`,
        caption: L(
          `${n} in binary is ${bin}: ${sum}. Tap a bit to switch it. 8 bits = 1 byte, so a byte has 2⁸ = 256 values (0-255); one hex digit is exactly 4 bits.`,
          `${n} в двоичной системе - ${bin}: ${sum}. Нажми на бит, чтобы переключить его. 8 битов = 1 байт, значит в байте 2⁸ = 256 значений (0-255); одна шестнадцатеричная цифра - ровно 4 бита.`,
          `${n} екілік жүйеде - ${bin}: ${sum}. Битті ауыстыру үшін оны бас. 8 бит = 1 байт, демек байтта 2⁸ = 256 мән бар (0-255); бір он алтылық цифр - дәл 4 бит.`,
        ),
      };
    },
  },

  sorting: {
    title: L('Bubble sort step by step', 'Сортировка пузырьком по шагам', 'Көпіршікті сұрыптау қадаммен'),
    intro: L('Walk along the row and compare neighbours; if the left one is bigger, swap them. After each pass the biggest remaining value "bubbles up" to the end.', 'Идём по ряду и сравниваем соседей; если левый больше - меняем их местами. После каждого прохода самое большое из оставшихся значений «всплывает» в конец.', 'Қатар бойымен жүріп, көршілерді салыстырамыз; сол жақтағысы үлкен болса - орындарын ауыстырамыз. Әр өтуден кейін қалғандардың ең үлкені соңына «қалқып шығады».'),
    sliders: [{ id: 'n', label: L('bars', 'столбиков', 'бағаналар'), min: 4, max: 12, value: 8 }],
    buttons: [L('Next step', 'Следующий шаг', 'Келесі қадам'), L('▶ Sort automatically', '▶ Сортировать автоматически', '▶ Автоматты сұрыптау'), L('Shuffle', 'Перемешать', 'Араластыру')],
    state: () => sortState(8),
    onSlide(key, v, st) {
      Object.assign(st, sortState(v.n));
    },
    onButton(i, st, v, api) {
      if (i === 0) {
        api.stop();
        sortStep(st);
      } else if (i === 1) api.run(() => sortStep(st), 420);
      else {
        api.stop();
        Object.assign(st, sortState(v.n));
      }
    },
    draw(v, step, st) {
      const n = st.arr.length;
      const slot = 290 / n;
      const bw = Math.min(26, slot - 4);
      const bars = Array.from({ length: n }, (_, k) => {
        const val = k + 1;
        const p = st.arr.indexOf(val);
        const h = 18 + val * (130 / n);
        const cls = st.done || p >= n - st.i ? 'ok' : st.last && (p === st.last.j || p === st.last.j + 1) ? (st.last.swapped ? 'swp' : 'cmp') : '';
        return `<g class="ex-sortbar" style="transform:translate(${n1(15 + p * slot + (slot - bw) / 2)}px,0)"><rect class="${cls}" x="0" y="${n1(186 - h)}" width="${n1(bw)}" height="${n1(h)}" rx="4"/><text class="ex-tiny" x="${n1(bw / 2)}" y="200">${val}</text></g>`;
      }).join('');
      const L2 = st.last;
      return {
        svg: `<line class="ex-axis" x1="10" y1="186" x2="310" y2="186"/>${bars}<text class="ex-tag" x="8" y="18">${u('comparisons', 'сравнений', 'салыстыру')}: ${st.cmp} · ${u('swaps', 'обменов', 'алмасу')}: ${st.sw}</text>`,
        caption: st.done
          ? L(`Sorted! ${st.cmp} comparisons and ${st.sw} swaps. For ${n} values bubble sort needs at most n(n − 1)/2 = ${(n * (n - 1)) / 2} comparisons.`, `Отсортировано! ${st.cmp} сравнений и ${st.sw} обменов. Для ${n} значений пузырьку нужно не больше n(n − 1)/2 = ${(n * (n - 1)) / 2} сравнений.`, `Сұрыпталды! ${st.cmp} салыстыру және ${st.sw} алмасу. ${n} мән үшін көпіршікті сұрыптауға ең көбі n(n − 1)/2 = ${(n * (n - 1)) / 2} салыстыру керек.`)
          : L2
            ? L(`Pass ${L2.pass}: ${L2.a} ${L2.swapped ? '>' : '<'} ${L2.b} → ${L2.swapped ? 'swap them' : 'leave them'}. Green bars are already in place.`, `Проход ${L2.pass}: ${L2.a} ${L2.swapped ? '>' : '<'} ${L2.b} → ${L2.swapped ? 'меняем местами' : 'оставляем'}. Зелёные столбики уже на своих местах.`, `${L2.pass}-өту: ${L2.a} ${L2.swapped ? '>' : '<'} ${L2.b} → ${L2.swapped ? 'орындарын ауыстырамыз' : 'қалдырамыз'}. Жасыл бағаналар өз орнында.`)
            : L('Press "Next step": we will compare the first two bars.', 'Нажми «Следующий шаг» - сравним первые два столбика.', '«Келесі қадам» бас - алғашқы екі бағананы салыстырамыз.'),
      };
    },
  },

  seasons: {
    title: L('Seasons and day length', 'Времена года и длина дня', 'Жыл мезгілдері және күн ұзақтығы'),
    intro: L('Earth’s axis is tilted by 23.4°. During the year first one hemisphere, then the other leans toward the Sun: the Sun rises higher, days get longer - summer comes.', 'Ось Земли наклонена на 23,4°. За год к Солнцу наклоняется то одно полушарие, то другое: Солнце поднимается выше, дни длиннее - наступает лето.', 'Жер осі 23,4°-қа көлбеген. Жыл бойы Күнге бірде бір жарты шар, бірде екіншісі еңкейеді: Күн биік көтеріліп, күн ұзарады - жаз келеді.'),
    sliders: [
      { id: 'd', label: L('day of year', 'день года', 'жыл күні'), min: 1, max: 365, step: C, value: 172 },
      { id: 'lat', label: L('latitude, °N', 'широта, ° с. ш.', 'ендік, ° с. е.'), min: 0, max: 70, step: C, value: 43 },
    ],
    buttons: [L('▶ One year', '▶ Один год', '▶ Бір жыл'), L('Almaty 43°', 'Алматы 43°', 'Алматы 43°'), L('Astana 51°', 'Астана 51°', 'Астана 51°')],
    play: 'd',
    playDur: 9000,
    playLinear: true,
    onButton: (i) => (i === 1 ? { lat: 43.2 } : i === 2 ? { lat: 51.2 } : undefined),
    draw(v) {
      const dec = 23.44 * Math.sin((2 * Math.PI * (284 + v.d)) / 365);
      const phi = (v.lat * Math.PI) / 180;
      const del = (dec * Math.PI) / 180;
      const c = -Math.tan(phi) * Math.tan(del);
      const day = c <= -1 ? 24 : c >= 1 ? 0 : (24 / Math.PI) * Math.acos(c);
      const noon = 90 - Math.abs(v.lat - dec);
      const MONTHS = u('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec', 'янв фев мар апр май июн июл авг сен окт ноя дек', 'қаң ақп нау сәу мам мау шіл там қыр қаз қар жел').split(' ');
      const mon = MONTHS[Math.min(11, Math.floor(((v.d - 1) / 365) * 12))];
      const cx = 85;
      const cy = 112;
      const r = 58;
      // Солнце справа: летом (склонение > 0) северный полюс наклонён к нему.
      const tilt = (dec * Math.PI) / 180;
      const axis = [Math.sin(tilt), -Math.cos(tilt)];
      const perp = [Math.cos(tilt), Math.sin(tilt)];
      const lc = [cx + axis[0] * r * Math.sin(phi), cy + axis[1] * r * Math.sin(phi)];
      const half = r * Math.cos(phi);
      const sunH = clamp(noon, 0, 90);
      return {
        svg: `<circle class="ex-fill exc-y" cx="300" cy="112" r="14"/><path class="ex-fill exc-b" style="opacity:.25" d="M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z"/>
          <circle class="ex-stroke exc-b" style="fill:none;stroke-width:2" cx="${cx}" cy="${cy}" r="${r}"/>
          <line class="ex-stroke exc-m ex-dash" x1="${n1(cx - axis[0] * 75)}" y1="${n1(cy - axis[1] * 75)}" x2="${n1(cx + axis[0] * 75)}" y2="${n1(cy + axis[1] * 75)}"/>
          <line class="ex-stroke exc-o" style="stroke-width:2.5" x1="${n1(lc[0] - perp[0] * half)}" y1="${n1(lc[1] - perp[1] * half)}" x2="${n1(lc[0] + perp[0] * half)}" y2="${n1(lc[1] + perp[1] * half)}"/><circle class="ex-fill exc-o" cx="${n1(lc[0] + perp[0] * half)}" cy="${n1(lc[1] + perp[1] * half)}" r="4"/>
          <text class="ex-tag" x="8" y="18">${mon} · ${u('Sun declination', 'склонение Солнца', 'Күн ауытқуы')} ${fmt(dec, 1)}°</text>
          <text class="ex-big" x="240" y="80">${hhmm(day)}</text><text class="ex-small" x="240" y="100">${u('day length', 'длина дня', 'күн ұзақтығы')}</text>
          <text class="ex-tag" x="160" y="150">${u('noon Sun height', 'Солнце в полдень', 'түстегі Күн биіктігі')}: ${fmt(sunH, 1)}°</text>
          <rect x="160" y="165" width="150" height="14" rx="7" class="ex-fill exc-m" style="opacity:.2"/><rect x="160" y="165" width="${n1((day / 24) * 150)}" height="14" rx="7" class="ex-fill exc-y"/>`,
        caption: L(
          `At ${fmt(v.lat, 1)}° N in ${mon} the day lasts ${hhmm(day)} and the noon Sun rises ${fmt(sunH, 1)}° above the horizon. ${day >= 24 ? 'Polar day - the Sun does not set.' : day <= 0 ? 'Polar night - the Sun does not rise.' : 'Around 21 March and 23 September day equals night everywhere (equinoxes).'}`,
          `На ${fmt(v.lat, 1)}° с. ш. в месяце «${mon}» день длится ${hhmm(day)}, а Солнце в полдень поднимается на ${fmt(sunH, 1)}° над горизонтом. ${day >= 24 ? 'Полярный день - Солнце не заходит.' : day <= 0 ? 'Полярная ночь - Солнце не восходит.' : 'Около 21 марта и 23 сентября день равен ночи везде (равноденствия).'}`,
          `${fmt(v.lat, 1)}° с. е. «${mon}» айында күн ${hhmm(day)} созылады, ал түсте Күн көкжиектен ${fmt(sunH, 1)}°-қа көтеріледі. ${day >= 24 ? 'Полярлық күн - Күн батпайды.' : day <= 0 ? 'Полярлық түн - Күн шықпайды.' : 'Шамамен 21 наурыз бен 23 қыркүйекте күн мен түн барлық жерде тең (күн мен түннің теңелуі).'}`,
        ),
      };
    },
  },

  mapscale: {
    title: L('Map scale', 'Масштаб карты', 'Карта масштабы'),
    intro: L('A scale 1 : 1 000 000 means 1 cm on the map is 1 000 000 cm = 10 km on the ground. Measure on the map, then multiply.', 'Масштаб 1 : 1 000 000 значит: 1 см на карте - это 1 000 000 см = 10 км на местности. Измерь на карте и умножь.', '1 : 1 000 000 масштабы: картадағы 1 см - жердегі 1 000 000 см = 10 км. Картадан өлше де, көбейт.'),
    sliders: [
      { id: 'k', label: L('1 cm = ... km', '1 см = ... км', '1 см = ... км'), min: 1, max: 100, step: C, value: 50 },
      { id: 'cm', label: L('on the map, cm', 'на карте, см', 'картада, см'), min: 0.5, max: 25, step: C, value: 19.4 },
    ],
    buttons: [L('Almaty - Astana', 'Алматы - Астана', 'Алматы - Астана'), L('Astana - Karaganda', 'Астана - Караганда', 'Астана - Қарағанды')],
    onButton: (i, st, v) => [{ cm: clamp(970 / v.k, 0.5, 25) }, { cm: clamp(190 / v.k, 0.5, 25) }][i],
    draw(v) {
      const km = v.k * v.cm;
      const scale = Math.round(v.k * 100000);
      const unit = 12;
      const len = clamp(v.cm * unit, 4, 300);
      const ticks = Array.from({ length: Math.floor(v.cm) + 1 }, (_, i) => `<line class="ex-stroke exc-m" x1="${10 + i * unit}" y1="150" x2="${10 + i * unit}" y2="${i % 5 ? 156 : 162}"/>`).join('');
      return {
        svg: `<text class="ex-big" x="160" y="45">1 : ${scale.toLocaleString('ru-RU')}</text>
          <circle class="ex-fill exc-r" cx="10" cy="110" r="6"/><circle class="ex-fill exc-r" cx="${n1(10 + len)}" cy="110" r="6"/>
          <line class="ex-stroke exc-p ex-dash" style="stroke-width:2" x1="10" y1="110" x2="${n1(10 + len)}" y2="110"/>
          <line class="ex-axis" x1="10" y1="150" x2="310" y2="150"/>${ticks}
          <text class="ex-tag" x="8" y="90">${fmt(v.cm, 1)} ${u('cm', 'см', 'см')} × ${fmt(v.k, 1)} = ${fmt(km, 0)} ${u('km', 'км', 'км')}</text>`,
        caption: L(
          `Scale 1 : ${scale.toLocaleString('en-US')} - 1 cm on the map is ${fmt(v.k, 1)} km. ${fmt(v.cm, 1)} cm on the map are ${fmt(km, 0)} km on the ground. A bigger second number means a smaller-scale map: more area, fewer details.`,
          `Масштаб 1 : ${scale.toLocaleString('ru-RU')} - в 1 см на карте ${fmt(v.k, 1)} км. ${fmt(v.cm, 1)} см на карте - это ${fmt(km, 0)} км на местности. Чем больше второе число, тем мельче масштаб: территории больше, деталей меньше.`,
          `Масштаб 1 : ${scale.toLocaleString('ru-RU')} - картадағы 1 см-де ${fmt(v.k, 1)} км. Картадағы ${fmt(v.cm, 1)} см - жердегі ${fmt(km, 0)} км. Екінші сан неғұрлым үлкен болса, масштаб соғұрлым ұсақ: аумақ көп, бөлшек аз.`,
        ),
      };
    },
  },

  gates: {
    title: L('Logic gates: AND, OR, NOT, XOR', 'Логические элементы: И, ИЛИ, НЕ, исключающее ИЛИ', 'Логикалық элементтер: ЖӘНЕ, НЕМЕСЕ, ЕМЕС, XOR'),
    intro: L('A gate takes inputs 0 or 1 and gives an output. AND gives 1 only if both inputs are 1; OR - if at least one; XOR - if they differ; NOT turns 1 into 0.', 'Логический элемент получает входы 0 или 1 и выдаёт выход. И даёт 1, только если оба входа 1; ИЛИ - если хотя бы один; исключающее ИЛИ - если они разные; НЕ превращает 1 в 0.', 'Логикалық элемент 0 не 1 кірістерін алып, шығыс береді. ЖӘНЕ екі кіріс те 1 болса ғана 1 береді; НЕМЕСЕ - ең болмаса біреуі; XOR - олар әртүрлі болса; ЕМЕС 1-ді 0-ге айналдырады.'),
    sliders: [],
    buttons: ['A', 'B', 'AND', 'OR', 'XOR', 'NOT A', 'NAND'],
    state: () => ({ a: 1, b: 0, g: 0 }),
    pressed: (i, v, st) => (i === 0 ? st.a === 1 : i === 1 ? st.b === 1 : i - 2 === st.g),
    onButton(i, st) {
      if (i === 0) st.a ^= 1;
      else if (i === 1) st.b ^= 1;
      else st.g = i - 2;
    },
    draw(v, step, st) {
      const F = [(a, b) => a & b, (a, b) => a | b, (a, b) => a ^ b, (a) => 1 - a, (a, b) => 1 - (a & b)];
      const NAMES = ['AND', 'OR', 'XOR', 'NOT', 'NAND'];
      const out = F[st.g](st.a, st.b);
      const rows = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ];
      const table = rows
        .map(([a, b], i) => {
          const hit = a === st.a && (st.g === 3 || b === st.b);
          return `<text class="ex-small${hit ? ' exc-p' : ''}" x="230" y="${70 + i * 24}">${a}</text><text class="ex-small${hit ? ' exc-p' : ''}" x="260" y="${70 + i * 24}">${st.g === 3 ? '-' : b}</text><text class="ex-small${hit ? ' exc-p' : ''}" x="295" y="${70 + i * 24}">${F[st.g](a, b)}</text>`;
        })
        .join('');
      return {
        svg: `<circle class="ex-lamp${st.a ? ' on' : ''}" cx="30" cy="80" r="12"/><text class="ex-small" x="30" y="85">${st.a}</text>
          ${st.g === 3 ? '' : `<circle class="ex-lamp${st.b ? ' on' : ''}" cx="30" cy="140" r="12"/><text class="ex-small" x="30" y="145">${st.b}</text>`}
          <path class="ex-wire" d="M42 80 H90 M42 140 H90"/><rect x="90" y="70" width="60" height="80" rx="14" class="ex-fill exc-p" style="opacity:.85"/><text class="ex-small" x="120" y="115" style="fill:#fff">${NAMES[st.g]}</text>
          <path class="ex-wire" d="M150 110 H175"/><circle class="ex-lamp${out ? ' on' : ''}" cx="190" cy="110" r="14"/><text class="ex-small" x="190" y="115">${out}</text>
          <text class="ex-tiny" x="230" y="45">A</text><text class="ex-tiny" x="260" y="45">B</text><text class="ex-tiny" x="295" y="45">${u('out', 'выход', 'шығыс')}</text>${table}`,
        caption: L(
          `${NAMES[st.g]}: A = ${st.a}${st.g === 3 ? '' : `, B = ${st.b}`} → ${out}. Tap A and B to switch inputs; the highlighted row of the truth table is the current case.`,
          `${NAMES[st.g]}: A = ${st.a}${st.g === 3 ? '' : `, B = ${st.b}`} → ${out}. Нажимай A и B, чтобы менять входы; подсвеченная строка таблицы истинности - текущий случай.`,
          `${NAMES[st.g]}: A = ${st.a}${st.g === 3 ? '' : `, B = ${st.b}`} → ${out}. Кірістерді ауыстыру үшін A мен B-ны бас; ақиқат кестесіндегі белгіленген жол - қазіргі жағдай.`,
        ),
      };
    },
  },

  download: {
    title: L('Data size and transfer speed', 'Объём данных и скорость передачи', 'Деректер көлемі және беру жылдамдығы'),
    intro: L('Speed is usually in megaBITS per second, files in megaBYTES. 1 byte = 8 bits, so a 100 Mbit/s line moves 12.5 MB each second.', 'Скорость обычно в мегаБИТАХ в секунду, а файлы - в мегаБАЙТАХ. 1 байт = 8 бит, поэтому линия 100 Мбит/с передаёт 12,5 МБ в секунду.', 'Жылдамдық әдетте секундына мегаБИТпен, ал файлдар мегаБАЙТпен. 1 байт = 8 бит, сондықтан 100 Мбит/с желі секундына 12,5 МБ береді.'),
    sliders: [
      { id: 'size', label: L('file, MB', 'файл, МБ', 'файл, МБ'), min: 1, max: 4000, step: 1, value: 700 },
      { id: 'sp', label: L('speed, Mbit/s', 'скорость, Мбит/с', 'жылдамдық, Мбит/с'), min: 1, max: 500, step: 1, value: 50 },
    ],
    buttons: [L('▶ Download', '▶ Скачать', '▶ Жүктеу')],
    state: () => ({ p: 0, run: false }),
    onButton(i, st) {
      st.p = 0;
      st.run = true;
    },
    onSlide(key, v, st) {
      st.p = 0;
      st.run = false;
    },
    live(dt, v, st) {
      if (!st.run) return;
      st.p = Math.min(1, st.p + dt / 3);
      if (st.p >= 1) st.run = false;
    },
    draw(v, step, st) {
      const t = (v.size * 8) / v.sp;
      const mm = Math.floor(t / 60);
      const ss = Math.round(t % 60);
      return {
        svg: `<text class="ex-big" x="160" y="55">t = ${fmt(v.size, 0)} · 8 / ${fmt(v.sp, 0)} ≈ ${mm ? `${mm} ${u('min', 'мин', 'мин')} ` : ''}${ss} ${u('s', 'с', 'с')}</text>
          <rect x="20" y="100" width="280" height="22" rx="11" class="ex-fill exc-m" style="opacity:.2"/><rect x="20" y="100" width="${n1(280 * st.p)}" height="22" rx="11" class="ex-fill exc-g"/>
          <text class="ex-tag" x="20" y="150">${fmt(v.size * st.p, 0)} / ${fmt(v.size, 0)} ${u('MB', 'МБ', 'МБ')}</text><text class="ex-tag" x="20" y="175">${fmt(v.sp / 8, 2)} ${u('MB per second', 'МБ в секунду', 'секундына МБ')}</text>`,
        caption: L(
          `${fmt(v.size, 0)} MB = ${fmt(v.size * 8, 0)} Mbit. At ${fmt(v.sp, 0)} Mbit/s that takes ${fmt(t, 1)} s. The usual trap: forgetting to multiply by 8.`,
          `${fmt(v.size, 0)} МБ = ${fmt(v.size * 8, 0)} Мбит. При ${fmt(v.sp, 0)} Мбит/с это ${fmt(t, 1)} с. Частая ловушка - забыть умножить на 8.`,
          `${fmt(v.size, 0)} МБ = ${fmt(v.size * 8, 0)} Мбит. ${fmt(v.sp, 0)} Мбит/с жылдамдықта бұл ${fmt(t, 1)} с. Жиі тұзақ - 8-ге көбейтуді ұмыту.`,
        ),
      };
    },
  },

  // ===== Программирование: код по шагам на Python, C++, JavaScript и Java =====

  divmod: {
    title: L('Integer division and remainder', 'Целочисленное деление и остаток', 'Бүтін бөлу және қалдық'),
    intro: L('a // b (Python) or a / b with integers (C++, Java) gives how many whole groups of b fit into a; a % b is what is left over. In JavaScript a / b gives a fraction - use Math.floor.', 'a // b (Python) или a / b для целых (C++, Java) - сколько целых групп по b помещается в a; a % b - что осталось. В JavaScript a / b даёт дробь - нужен Math.floor.', 'a // b (Python) немесе бүтін сандар үшін a / b (C++, Java) - a-ға b-дан неше бүтін топ сыяды; a % b - қалғаны. JavaScript-те a / b бөлшек береді - Math.floor керек.'),
    sliders: [
      { id: 'a', label: 'a', min: 0, max: 40, value: 17 },
      { id: 'b', label: 'b', min: 1, max: 9, value: 5 },
    ],
    buttons: ['Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ lang: 0 }),
    pressed: (i, v, st) => i === st.lang,
    onButton(i, st) {
      st.lang = i;
    },
    draw(v, step, st) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const q = Math.floor(a / b);
      const r = a % b;
      const code = [
        [`q = ${a} // ${b}`, `r = ${a} % ${b}`],
        [`int q = ${a} / ${b};`, `int r = ${a} % ${b};`],
        [`let q = Math.floor(${a} / ${b});`, `let r = ${a} % ${b};`],
        [`int q = ${a} / ${b};`, `int r = ${a} % ${b};`],
      ][st.lang];
      const dots = Array.from({ length: a }, (_, i) => {
        const g = Math.floor(i / b);
        const inGroup = g < q;
        const x = 16 + (inGroup ? g * (b * 9 + 8) + (i % b) * 9 : q * (b * 9 + 8) + (i - q * b) * 9);
        return `<circle cx="${n1(Math.min(x, 312))}" cy="${inGroup ? 120 : 150}" r="3.6" class="ex-fill ${inGroup ? 'exc-b' : 'exc-o'}"/>`;
      }).join('');
      return {
        svg: `<rect x="8" y="12" width="304" height="52" rx="10" class="ex-fill exc-m" style="opacity:.12"/>${code.map((c, i) => `<text class="ex-tag" x="18" y="${34 + i * 20}" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre">${c}</text>`).join('')}
          ${dots}<text class="ex-big" x="160" y="200">q = ${q}, r = ${r}</text>`,
        caption: L(
          `${a} = ${b} · ${q} + ${r}: ${q} full groups of ${b} (blue) and ${r} left over (orange). Check: ${b} · ${q} + ${r} = ${a}. The remainder is always smaller than b.`,
          `${a} = ${b} · ${q} + ${r}: ${q} полных групп по ${b} (синие) и ${r} в остатке (оранжевые). Проверка: ${b} · ${q} + ${r} = ${a}. Остаток всегда меньше b.`,
          `${a} = ${b} · ${q} + ${r}: ${b}-тен ${q} толық топ (көк) және қалдықта ${r} (қызғылт сары). Тексеру: ${b} · ${q} + ${r} = ${a}. Қалдық әрқашан b-дан кіші.`,
        ),
      };
    },
  },

  ifelse: {
    title: L('Conditions: if, else if, else', 'Условия: if, else if, else', 'Шарттар: if, else if, else'),
    intro: L('Conditions are checked top to bottom. The first true one runs, the rest are skipped. else runs only if nothing above was true.', 'Условия проверяются сверху вниз. Выполняется первое верное, остальные пропускаются. else срабатывает, только если ничего выше не подошло.', 'Шарттар жоғарыдан төмен тексеріледі. Бірінші дұрысы орындалады, қалғандары өткізіледі. else жоғарыда ештеңе сәйкес келмесе ғана орындалады.'),
    sliders: [{ id: 's', label: L('score', 'баллы', 'балл'), min: 0, max: 100, value: 72 }],
    buttons: ['Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ lang: 0 }),
    pressed: (i, v, st) => i === st.lang,
    onButton(i, st) {
      st.lang = i;
    },
    draw(v, step, st) {
      const s = Math.round(v.s);
      const branch = s >= 85 ? 0 : s >= 70 ? 1 : s >= 50 ? 2 : 3;
      const py = [`if s >= 85:`, `    grade = 5`, `elif s >= 70:`, `    grade = 4`, `elif s >= 50:`, `    grade = 3`, `else:`, `    grade = 2`];
      const cl = [`if (s >= 85) {`, `  grade = 5;`, `} else if (s >= 70) {`, `  grade = 4;`, `} else if (s >= 50) {`, `  grade = 3;`, `} else {`, `  grade = 2; }`];
      const lines = st.lang ? cl : py;
      const checked = (i) => Math.floor(i / 2) <= branch;
      const rows = lines
        .map((ln, i) => {
          const hit = Math.floor(i / 2) === branch;
          const cond = i % 2 === 0;
          const mark = cond && checked(i) && i < 6 ? (hit ? '✓' : '✗') : '';
          return `${hit ? `<rect x="8" y="${16 + i * 22}" width="250" height="20" rx="5" class="ex-fill exc-g" style="opacity:.2"/>` : ''}<text class="ex-tag" x="16" y="${31 + i * 22}" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre;${checked(i) || hit ? '' : 'opacity:.45'}">${esc(ln)}</text><text class="ex-small" x="280" y="${31 + i * 22}" style="fill:var(--${mark === '✓' ? 'green' : 'red'})">${mark}</text>`;
        })
        .join('');
      return {
        svg: `${rows}<text class="ex-tag" x="16" y="210">s = ${s} → grade = ${[5, 4, 3, 2][branch]}</text>`,
        caption: L(
          `s = ${s}: ${branch ? `${branch} condition${branch > 1 ? 's were' : ' was'} false (✗), then ` : ''}${branch < 3 ? `"s >= ${[85, 70, 50][branch]}" is true` : 'nothing matched, so else runs'} → grade ${[5, 4, 3, 2][branch]}. Everything below is not even checked. Order matters: put s >= 50 first and a 95 would get a 3!`,
          `s = ${s}: ${branch ? `${branch} ${branch > 1 ? 'условия оказались ложными' : 'условие оказалось ложным'} (✗), затем ` : ''}${branch < 3 ? `«s >= ${[85, 70, 50][branch]}» верно` : 'ничего не подошло, срабатывает else'} → оценка ${[5, 4, 3, 2][branch]}. Всё, что ниже, даже не проверяется. Порядок важен: поставь s >= 50 первым - и 95 баллов получат «3»!`,
          `s = ${s}: ${branch ? `${branch} шарт жалған болды (✗), кейін ` : ''}${branch < 3 ? `«s >= ${[85, 70, 50][branch]}» дұрыс` : 'ештеңе сәйкес келмеді, else орындалады'} → баға ${[5, 4, 3, 2][branch]}. Төмендегілер тексерілмейді де. Рет маңызды: s >= 50-ні бірінші қойсаң, 95 балл «3» алады!`,
        ),
      };
    },
  },

  loop: {
    title: L('A loop step by step', 'Цикл по шагам', 'Цикл қадаммен'),
    intro: L('A for loop repeats its body for each value of i. Here we add up numbers: total grows on every pass. Note that the end value is NOT included.', 'Цикл for повторяет тело для каждого значения i. Здесь мы складываем числа: total растёт на каждом проходе. Обрати внимание: конечное значение НЕ входит.', 'for циклі денесін i-дің әр мәні үшін қайталайды. Мұнда сандарды қосамыз: total әр өтуде өседі. Назар аудар: соңғы мән КІРМЕЙДІ.'),
    sliders: [
      { id: 'a', label: L('start', 'начало', 'бастау'), min: 0, max: 5, value: 1 },
      { id: 'b', label: L('stop', 'конец', 'соңы'), min: 1, max: 11, value: 6 },
      { id: 'h', label: L('step', 'шаг', 'қадам'), min: 1, max: 3, value: 1 },
    ],
    buttons: [L('Next pass', 'Следующий проход', 'Келесі өту'), L('▶ Run', '▶ Запустить', '▶ Іске қосу'), 'Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ k: 0, lang: 0 }),
    pressed: (i, v, st) => i >= 2 && i - 2 === st.lang,
    onSlide(key, v, st) {
      st.k = 0;
    },
    onButton(i, st, v, api) {
      const vals = [];
      for (let x = Math.round(v.a); x < Math.round(v.b); x += Math.round(v.h)) vals.push(x);
      if (i === 0) st.k = st.k >= vals.length ? 0 : st.k + 1;
      else if (i === 1) {
        st.k = 0;
        api.run(() => (st.k < vals.length ? ++st.k <= vals.length : false), 600);
      } else st.lang = i - 2;
    },
    draw(v, step, st) {
      const a = Math.round(v.a);
      const b = Math.round(v.b);
      const h = Math.round(v.h);
      const vals = [];
      for (let x = a; x < b; x += h) vals.push(x);
      const done = vals.slice(0, st.k);
      const sum = done.reduce((s, x) => s + x, 0);
      const code = [
        [`total = 0`, `for i in range(${a}, ${b}, ${h}):`, `    total += i`],
        [`int total = 0;`, `for (int i = ${a}; i < ${b}; i += ${h})`, `    total += i;`],
        [`let total = 0;`, `for (let i = ${a}; i < ${b}; i += ${h})`, `    total += i;`],
        [`int total = 0;`, `for (int i = ${a}; i < ${b}; i += ${h})`, `    total += i;`],
      ][st.lang];
      const cells = Array.from({ length: 12 }, (_, x) => {
        const inLoop = vals.includes(x);
        const passed = done.includes(x);
        return `<rect x="${12 + x * 25}" y="120" width="22" height="26" rx="5" class="ex-fill ${passed ? 'exc-g' : inLoop ? 'exc-b' : 'exc-m'}" style="opacity:${passed ? 0.9 : inLoop ? 0.45 : 0.12}"/><text class="ex-tiny" x="${23 + x * 25}" y="137">${x}</text>`;
      }).join('');
      return {
        svg: `<rect x="8" y="10" width="304" height="72" rx="10" class="ex-fill exc-m" style="opacity:.12"/>${code.map((c, i) => `<text class="ex-tag" x="16" y="${32 + i * 20}" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre">${esc(c)}</text>`).join('')}
          ${cells}<text class="ex-tag" x="12" y="175">i = ${done.length ? done.at(-1) : '-'} · ${u('passes', 'проходов', 'өту')}: ${done.length}/${vals.length}</text><text class="ex-big" x="250" y="200">total = ${sum}</text>`,
        caption:
          st.k >= vals.length && vals.length
            ? L(`Done: i took the values ${vals.join(', ')} (${vals.length} passes) - ${b} itself is not included. total = ${vals.join(' + ')} = ${sum}.`, `Готово: i принимало значения ${vals.join(', ')} (${vals.length} проходов) - само ${b} не входит. total = ${vals.join(' + ')} = ${sum}.`, `Дайын: i ${vals.join(', ')} мәндерін қабылдады (${vals.length} өту) - ${b}-тің өзі кірмейді. total = ${vals.join(' + ')} = ${sum}.`)
            : L(`Blue cells are the values i will take; green - already done. Press "Next pass" or "Run".`, `Синие клетки - значения, которые примет i; зелёные - уже пройденные. Нажимай «Следующий проход» или «Запустить».`, `Көк торлар - i қабылдайтын мәндер; жасылдар - өтілгендер. «Келесі өту» не «Іске қосу» бас.`),
      };
    },
  },

  array: {
    title: L('Arrays: indexes start at 0', 'Массивы: индексы с нуля', 'Массивтер: индекстер нөлден'),
    intro: L('The first element has index 0, the last one index length − 1. Asking for index = length is an error. In Python a[-1] is the last element.', 'У первого элемента индекс 0, у последнего - длина − 1. Обращение к индексу, равному длине, - ошибка. В Python a[-1] - последний элемент.', 'Бірінші элементтің индексі 0, соңғысының - ұзындық − 1. Ұзындыққа тең индекске жүгіну - қате. Python-да a[-1] - соңғы элемент.'),
    sliders: [{ id: 'i', label: 'i', min: -3, max: 7, value: 2 }],
    buttons: [L('append', 'добавить', 'қосу'), L('remove last', 'удалить последний', 'соңғысын жою'), 'Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ arr: [7, 3, 9, 4, 6], lang: 0 }),
    pressed: (i, v, st) => i >= 2 && i - 2 === st.lang,
    onButton(i, st) {
      if (i === 0 && st.arr.length < 8) st.arr.push([5, 8, 2, 1, 0][st.arr.length % 5]);
      else if (i === 1 && st.arr.length > 1) st.arr.pop();
      else if (i >= 2) st.lang = i - 2;
    },
    draw(v, step, st) {
      const i = Math.round(v.i);
      const n = st.arr.length;
      const neg = st.lang === 0 && i < 0 && -i <= n;
      const idx = neg ? n + i : i;
      const ok = idx >= 0 && idx < n && (i >= 0 || st.lang === 0);
      const access = [`a[${i}]`, `a[${i}]`, `a[${i}]`, `a[${i}]`][st.lang];
      const len = ['len(a)', 'a.size()', 'a.length', 'a.length'][st.lang];
      const err = ['IndexError', st.lang === 1 ? 'undefined behaviour' : '', 'undefined', 'ArrayIndexOutOfBoundsException'][st.lang];
      const boxes = st.arr.map((x, k) => `<rect x="${20 + k * 36}" y="80" width="32" height="40" rx="6" class="ex-fill ${ok && k === idx ? 'exc-p' : 'exc-b'}" style="opacity:${ok && k === idx ? 0.9 : 0.35}"/><text class="ex-small" x="${36 + k * 36}" y="106">${x}</text><text class="ex-tiny" x="${36 + k * 36}" y="140">${k}</text>${st.lang === 0 ? `<text class="ex-tiny exc-m" x="${36 + k * 36}" y="156">${k - n}</text>` : ''}`).join('');
      return {
        svg: `${boxes}<text class="ex-tag" x="12" y="30" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre">${len} = ${n} · ${access} → ${ok ? st.arr[idx] : err || 'error'}</text>
          ${ok ? `<path class="ex-fill exc-p" d="M${36 + idx * 36} 72 l-7 -12 h14 Z"/>` : `<text class="ex-small exc-r" x="160" y="190">${u('out of range', 'выход за границы', 'шекарадан шығу')}</text>`}`,
        caption: ok
          ? L(`${access} = ${st.arr[idx]}. Indexes go from 0 to ${n - 1} - there are ${n} elements, but the last index is ${n - 1}.${neg ? ` Python counts negative indexes from the end: ${i} means ${idx}.` : ''}`, `${access} = ${st.arr[idx]}. Индексы от 0 до ${n - 1}: элементов ${n}, а последний индекс ${n - 1}.${neg ? ` Python считает отрицательные индексы с конца: ${i} - это ${idx}.` : ''}`, `${access} = ${st.arr[idx]}. Индекстер 0-ден ${n - 1}-ге дейін: элемент ${n}, ал соңғы индекс ${n - 1}.${neg ? ` Python теріс индекстерді соңынан санайды: ${i} - бұл ${idx}.` : ''}`)
          : L(`${access} does not exist: valid indexes are 0…${n - 1}. ${st.lang === 0 ? 'Python raises IndexError.' : st.lang === 2 ? 'JavaScript quietly returns undefined.' : st.lang === 3 ? 'Java throws an exception.' : 'C++ reads foreign memory - a dangerous bug.'}`, `${access} не существует: допустимые индексы 0…${n - 1}. ${st.lang === 0 ? 'Python выдаст IndexError.' : st.lang === 2 ? 'JavaScript молча вернёт undefined.' : st.lang === 3 ? 'Java выбросит исключение.' : 'C++ прочитает чужую память - опасная ошибка.'}`, `${access} жоқ: рұқсат етілген индекстер 0…${n - 1}. ${st.lang === 0 ? 'Python IndexError береді.' : st.lang === 2 ? 'JavaScript үнсіз undefined қайтарады.' : st.lang === 3 ? 'Java ерекше жағдай лақтырады.' : 'C++ бөтен жадты оқиды - қауіпті қате.'}`),
      };
    },
  },

  recursion: {
    title: L('Functions and the call stack', 'Функции и стек вызовов', 'Функциялар және шақырулар стегі'),
    intro: L('When a function calls itself, each call waits on a stack until the smaller call returns. fact(n) = n · fact(n − 1), and fact(1) = 1 stops the chain.', 'Когда функция вызывает саму себя, каждый вызов ждёт в стеке, пока вернётся меньший. fact(n) = n · fact(n − 1), а fact(1) = 1 останавливает цепочку.', 'Функция өзін-өзі шақырғанда, әр шақыру кішісі қайтқанша стекте күтеді. fact(n) = n · fact(n − 1), ал fact(1) = 1 тізбекті тоқтатады.'),
    sliders: [{ id: 'n', label: 'n', min: 1, max: 6, value: 4 }],
    buttons: [L('Next step', 'Следующий шаг', 'Келесі қадам'), L('▶ Run', '▶ Запустить', '▶ Іске қосу'), 'Python', 'C++', 'JavaScript', 'Java'],
    state: () => ({ k: 0, lang: 0 }),
    pressed: (i, v, st) => i >= 2 && i - 2 === st.lang,
    onSlide(key, v, st) {
      st.k = 0;
    },
    onButton(i, st, v, api) {
      const total = 2 * Math.round(v.n);
      if (i === 0) st.k = st.k >= total ? 0 : st.k + 1;
      else if (i === 1) {
        st.k = 0;
        api.run(() => ++st.k < total, 650);
      } else st.lang = i - 2;
    },
    draw(v, step, st) {
      const n = Math.round(v.n);
      const k = st.k;
      const f = (x) => (x <= 1 ? 1 : x * f(x - 1));
      const depth = k <= n ? k : 2 * n - k;
      const returning = k > n;
      const code = [
        ['def fact(n):', '    if n == 1: return 1', '    return n * fact(n - 1)'],
        ['int fact(int n) {', '  if (n == 1) return 1;', '  return n * fact(n - 1); }'],
        ['function fact(n) {', '  if (n === 1) return 1;', '  return n * fact(n - 1); }'],
        ['static int fact(int n) {', '  if (n == 1) return 1;', '  return n * fact(n - 1); }'],
      ][st.lang];
      const frames = Array.from({ length: depth }, (_, i) => {
        const arg = n - i;
        const top = i === depth - 1;
        const ret = returning && top ? ` → ${f(arg)}` : '';
        return `<rect x="190" y="${190 - (i + 1) * 26}" width="122" height="22" rx="6" class="ex-fill ${top ? 'exc-p' : 'exc-b'}" style="opacity:${top ? 0.9 : 0.4}"/><text class="ex-tiny" x="251" y="${205 - (i + 1) * 26}" style="${top ? 'fill:#fff' : ''}">fact(${arg})${ret}</text>`;
      }).join('');
      return {
        svg: `<rect x="6" y="10" width="178" height="72" rx="10" class="ex-fill exc-m" style="opacity:.12"/>${code.map((c, i) => `<text class="ex-tiny ex-start" x="12" y="${30 + i * 20}" style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre;text-anchor:start">${esc(c)}</text>`).join('')}
          ${frames}<line class="ex-axis" x1="186" y1="192" x2="316" y2="192"/><text class="ex-tiny" x="251" y="208">${u('stack', 'стек', 'стек')}</text>
          <text class="ex-big" x="90" y="150">${k >= 2 * n ? `${n}! = ${f(n)}` : ''}</text>`,
        caption:
          k === 0
            ? L(`Press "Next step" to call fact(${n}).`, `Нажми «Следующий шаг», чтобы вызвать fact(${n}).`, `fact(${n}) шақыру үшін «Келесі қадам» бас.`)
            : returning
              ? L(`Returning: each call multiplies and gives its result to the one below. ${k >= 2 * n ? `fact(${n}) = ${f(n)}.` : ''}`, `Возврат: каждый вызов умножает и отдаёт результат вызову ниже. ${k >= 2 * n ? `fact(${n}) = ${f(n)}.` : ''}`, `Қайту: әр шақыру көбейтіп, нәтижесін төмендегіге береді. ${k >= 2 * n ? `fact(${n}) = ${f(n)}.` : ''}`)
              : L(`fact(${n - k + 1}) is waiting${n - k + 1 > 1 ? ` for fact(${n - k})` : ' - it is the base case and returns 1'}. ${depth} call${depth > 1 ? 's are' : ' is'} on the stack. Without the base case the stack would overflow.`, `fact(${n - k + 1}) ждёт${n - k + 1 > 1 ? ` fact(${n - k})` : ' - это базовый случай, он возвращает 1'}. В стеке вызовов: ${depth}. Без базового случая стек бы переполнился.`, `fact(${n - k + 1}) күтеді${n - k + 1 > 1 ? ` fact(${n - k})` : ' - бұл базалық жағдай, ол 1 қайтарады'}. Стекте ${depth} шақыру. Базалық жағдайсыз стек толып кетер еді.`),
      };
    },
  },

  // ===== История и английский: ленты времени и времена глаголов =====

  'timeline-kz': {
    title: L('Timeline: history of Kazakhstan', 'Лента времени: история Казахстана', 'Уақыт таспасы: Қазақстан тарихы'),
    intro: L('Move along the centuries and see the key dates of Kazakhstan’s history in order - it is easier to remember them as one story.', 'Двигайся по векам и смотри ключевые даты истории Казахстана по порядку - так их проще запомнить как одну историю.', 'Ғасырлар бойымен жылжып, Қазақстан тарихының негізгі даталарын ретімен көр - оларды бір әңгіме ретінде есте сақтау оңай.'),
    sliders: [{ id: 'k', label: L('event', 'событие', 'оқиға'), min: 0, max: 14, value: 0 }],
    buttons: [L('◀', '◀', '◀'), L('▶', '▶', '▶')],
    onButton: (i, st, v) => ({ k: clamp(v.k + (i ? 1 : -1), 0, 14) }),
    draw(v) {
      const E = [
        [1465, L('The Kazakh Khanate is founded by Kerey and Zhanibek.', 'Керей и Жанибек основывают Казахское ханство.', 'Керей мен Жәнібек Қазақ хандығын құрады.')],
        [1511, L('Kasym Khan (1511-1523): the khanate becomes strong, "Kasym Khan’s bright road" laws.', 'Касым-хан (1511-1523): ханство усиливается, законы «Қасым ханның қасқа жолы».', 'Қасым хан (1511-1523): хандық күшейеді, «Қасым ханның қасқа жолы» заңдары.')],
        [1723, L('Dzungar invasion - "Aktaban Shubyryndy", the Years of Great Disaster.', 'Джунгарское нашествие - «Актабан шубырынды», годы великого бедствия.', 'Жоңғар шапқыншылығы - «Ақтабан шұбырынды», ұлы апат жылдары.')],
        [1731, L('Abulkhair Khan of the Junior zhuz accepts Russian protection.', 'Абулхаир-хан Младшего жуза принимает подданство России.', 'Кіші жүздің ханы Әбілқайыр Ресейдің қамқорлығын қабылдайды.')],
        [1771, L('Ablai becomes khan of all three zhuzes.', 'Абылай становится ханом трёх жузов.', 'Абылай үш жүздің ханы болады.')],
        [1837, L('Kenesary’s uprising (1837-1847) - the last khan fights for independence.', 'Восстание Кенесары (1837-1847) - последний хан борется за независимость.', 'Кенесары көтерілісі (1837-1847) - соңғы хан тәуелсіздік үшін күреседі.')],
        [1916, L('National liberation uprising against mobilisation for rear work.', 'Национально-освободительное восстание против мобилизации на тыловые работы.', 'Тыл жұмыстарына алуға қарсы ұлт-азаттық көтеріліс.')],
        [1917, L('The Alash Orda autonomy is proclaimed (Alikhan Bokeikhanov).', 'Провозглашена автономия Алаш-Орда (Алихан Букейханов).', 'Алаш Орда автономиясы жарияланады (Әлихан Бөкейханов).')],
        [1936, L('The Kazakh SSR becomes a union republic of the USSR.', 'Казахская ССР становится союзной республикой СССР.', 'Қазақ КСР КСРО-ның одақтас республикасы болады.')],
        [1954, L('The Virgin Lands campaign begins in northern Kazakhstan.', 'Начинается освоение целины на севере Казахстана.', 'Солтүстік Қазақстанда тың игеру басталады.')],
        [1986, L('December events (Zheltoksan) - youth protests in Almaty.', 'Декабрьские события (Желтоксан) - выступления молодёжи в Алматы.', 'Желтоқсан оқиғалары - Алматыдағы жастар наразылығы.')],
        [1990, L('25 October: Declaration of State Sovereignty.', '25 октября: Декларация о государственном суверенитете.', '25 қазан: Мемлекеттік егемендік туралы декларация.')],
        [1991, L('16 December: Independence of the Republic of Kazakhstan.', '16 декабря: независимость Республики Казахстан.', '16 желтоқсан: Қазақстан Республикасының тәуелсіздігі.')],
        [1993, L('15 November: the national currency, the tenge, is introduced.', '15 ноября: введена национальная валюта - тенге.', '15 қараша: ұлттық валюта - теңге енгізілді.')],
        [1997, L('The capital moves from Almaty to Akmola (Astana).', 'Столица переносится из Алматы в Акмолу (Астану).', 'Елорда Алматыдан Ақмолаға (Астанаға) көшіріледі.')],
      ];
      const k = Math.round(v.k);
      const sx = (y) => 15 + ((y - 1450) / (2000 - 1450)) * 290;
      const dots = E.map(([y], i) => `<circle class="ex-fill ${i === k ? 'exc-p' : i < k ? 'exc-b' : 'exc-m'}" cx="${n1(sx(y))}" cy="130" r="${i === k ? 7 : 4}" style="opacity:${i <= k ? 1 : 0.35}"/>`).join('');
      const [year, text] = E[k];
      return {
        svg: `<line class="ex-axis" x1="10" y1="130" x2="310" y2="130"/>${[1500, 1600, 1700, 1800, 1900, 2000].map((y) => `<text class="ex-tiny" x="${n1(sx(y))}" y="152">${y}</text>`).join('')}${dots}
          <text class="ex-big" x="160" y="60">${year}</text><line class="ex-stroke exc-p" x1="${n1(sx(year))}" y1="72" x2="${n1(sx(year))}" y2="120"/>`,
        caption: text,
      };
    },
  },

  'timeline-world': {
    title: L('Timeline: world history', 'Лента времени: всемирная история', 'Уақыт таспасы: дүниежүзі тарихы'),
    intro: L('From the fall of Rome to the end of the USSR - the turning points of world history on one line.', 'От падения Рима до распада СССР - поворотные моменты всемирной истории на одной линии.', 'Римнің құлауынан КСРО-ның ыдырауына дейін - дүниежүзі тарихының бетбұрыстары бір сызықта.'),
    sliders: [{ id: 'k', label: L('event', 'событие', 'оқиға'), min: 0, max: 14, value: 0 }],
    buttons: [L('◀', '◀', '◀'), L('▶', '▶', '▶')],
    onButton: (i, st, v) => ({ k: clamp(v.k + (i ? 1 : -1), 0, 14) }),
    draw(v) {
      const E = [
        [476, L('Fall of the Western Roman Empire - the start of the Middle Ages.', 'Падение Западной Римской империи - начало Средних веков.', 'Батыс Рим империясының құлауы - Орта ғасырлардың басы.')],
        [1066, L('Battle of Hastings: the Normans conquer England.', 'Битва при Гастингсе: норманны завоёвывают Англию.', 'Гастингс шайқасы: норманндар Англияны жаулап алады.')],
        [1206, L('Temujin is proclaimed Genghis Khan - the Mongol Empire begins.', 'Темучин провозглашён Чингисханом - начало Монгольской империи.', 'Темучин Шыңғыс хан деп жарияланады - Моңғол империясының басы.')],
        [1453, L('The Ottomans take Constantinople - the end of Byzantium.', 'Османы берут Константинополь - конец Византии.', 'Османдар Константинопольді алады - Византияның соңы.')],
        [1492, L('Columbus reaches America.', 'Колумб достигает Америки.', 'Колумб Америкаға жетеді.')],
        [1517, L('Martin Luther’s theses start the Reformation.', 'Тезисы Мартина Лютера начинают Реформацию.', 'Мартин Лютердің тезистері Реформацияны бастайды.')],
        [1776, L('The United States declares independence.', 'США провозглашают независимость.', 'АҚШ тәуелсіздігін жариялайды.')],
        [1789, L('The French Revolution begins.', 'Начинается Великая французская революция.', 'Ұлы француз революциясы басталады.')],
        [1914, L('World War I begins (1914-1918).', 'Начинается Первая мировая война (1914-1918).', 'Бірінші дүниежүзілік соғыс басталады (1914-1918).')],
        [1917, L('Revolution in Russia.', 'Революция в России.', 'Ресейдегі революция.')],
        [1939, L('World War II begins (1939-1945).', 'Начинается Вторая мировая война (1939-1945).', 'Екінші дүниежүзілік соғыс басталады (1939-1945).')],
        [1945, L('The United Nations is founded.', 'Основана Организация Объединённых Наций.', 'Біріккен Ұлттар Ұйымы құрылады.')],
        [1961, L('Yuri Gagarin is the first person in space - launched from Baikonur.', 'Юрий Гагарин - первый человек в космосе, старт с Байконура.', 'Юрий Гагарин - ғарыштағы алғашқы адам, Байқоңырдан ұшқан.')],
        [1969, L('Apollo 11: people walk on the Moon.', '«Аполлон-11»: люди ступают на Луну.', '«Аполлон-11»: адамдар Айға қадам басады.')],
        [1991, L('The USSR breaks up; new independent states appear.', 'Распад СССР, появляются новые независимые государства.', 'КСРО ыдырайды, жаңа тәуелсіз мемлекеттер пайда болады.')],
      ];
      const k = Math.round(v.k);
      const sx = (y) => 15 + ((y - 400) / (2000 - 400)) * 290;
      const dots = E.map(([y], i) => `<circle class="ex-fill ${i === k ? 'exc-p' : i < k ? 'exc-b' : 'exc-m'}" cx="${n1(sx(y))}" cy="130" r="${i === k ? 7 : 4}" style="opacity:${i <= k ? 1 : 0.35}"/>`).join('');
      const [year, text] = E[k];
      return {
        svg: `<line class="ex-axis" x1="10" y1="130" x2="310" y2="130"/>${[500, 1000, 1500, 2000].map((y) => `<text class="ex-tiny" x="${n1(sx(y))}" y="152">${y}</text>`).join('')}${dots}
          <text class="ex-big" x="160" y="60">${year}</text><line class="ex-stroke exc-p" x1="${n1(sx(year))}" y1="72" x2="${n1(sx(year))}" y2="120"/>`,
        caption: text,
      };
    },
  },

  tenses: {
    title: L('English tenses on a timeline', 'Времена английского на шкале времени', 'Ағылшын шақтары уақыт шкаласында'),
    intro: L('Every tense answers two questions: when (past, now, future) and how (a fact, a process, a result). See where each one sits on the line.', 'Каждое время отвечает на два вопроса: когда (прошлое, сейчас, будущее) и как (факт, процесс, результат). Посмотри, где каждое стоит на линии.', 'Әр шақ екі сұраққа жауап береді: қашан (өткен, қазір, келер) және қалай (факт, процесс, нәтиже). Әрқайсысы сызықтың қай жерінде тұрғанын көр.'),
    sliders: [],
    buttons: ['Present Simple', 'Present Continuous', 'Past Simple', 'Past Continuous', 'Present Perfect', 'Past Perfect', 'Future Simple'],
    state: () => ({ k: 0 }),
    pressed: (i, v, st) => i === st.k,
    onButton(i, st) {
      st.k = i;
    },
    draw(v, step, st) {
      const T = [
        { mark: 'repeat', ex: 'She walks to school every day.', f: 'V / V+s', note: L('habits and facts', 'привычки и факты', 'әдеттер мен фактілер') },
        { mark: 'now', ex: 'She is walking to school now.', f: 'am / is / are + V-ing', note: L('happening right now', 'происходит прямо сейчас', 'дәл қазір болып жатыр') },
        { mark: 'pastpoint', ex: 'She walked to school yesterday.', f: 'V2 (walked, went)', note: L('finished, with a past time', 'закончилось, есть время в прошлом', 'аяқталған, өткен уақыт көрсетілген') },
        { mark: 'pastproc', ex: 'She was walking when it started to rain.', f: 'was / were + V-ing', note: L('a process in the past, often interrupted', 'процесс в прошлом, часто прерванный', 'өткендегі процесс, жиі үзілген') },
        { mark: 'perfect', ex: 'She has already walked 5 km.', f: 'have / has + V3', note: L('past action, result now', 'действие в прошлом, результат сейчас', 'өткендегі әрекет, нәтижесі қазір') },
        { mark: 'pastperf', ex: 'She had left before he arrived.', f: 'had + V3', note: L('earlier than another past moment', 'раньше другого момента в прошлом', 'өткендегі басқа сәттен ертерек') },
        { mark: 'future', ex: 'She will walk to school tomorrow.', f: 'will + V', note: L('future, decisions, predictions', 'будущее, решения, прогнозы', 'келер шақ, шешімдер, болжамдар') },
      ];
      const t = T[st.k];
      const NOW = 200;
      const marks = {
        repeat: [40, 90, 140, 190, 240, 290].map((x) => `<circle class="ex-fill exc-p" cx="${x}" cy="110" r="5"/>`).join(''),
        now: `<rect x="${NOW - 30}" y="104" width="60" height="12" rx="6" class="ex-fill exc-p" style="opacity:.7"/>`,
        pastpoint: `<circle class="ex-fill exc-p" cx="90" cy="110" r="8"/>`,
        pastproc: `<rect x="60" y="104" width="70" height="12" rx="6" class="ex-fill exc-p" style="opacity:.7"/><path class="ex-fill exc-r" d="M110 92 l6 12 l6 -12 Z"/><text class="ex-tiny exc-r" x="116" y="86">rain</text>`,
        perfect: `<circle class="ex-fill exc-p" cx="120" cy="110" r="7"/>${arrow(126, 100, NOW - 6, 100, 'exc-g', 2)}`,
        pastperf: `<circle class="ex-fill exc-p" cx="60" cy="110" r="7"/><circle class="ex-fill exc-o" cx="130" cy="110" r="7"/><text class="ex-tiny" x="60" y="134">1</text><text class="ex-tiny" x="130" y="134">2</text>`,
        future: `<circle class="ex-fill exc-p" cx="270" cy="110" r="8"/>`,
      };
      return {
        svg: `<line class="ex-axis" x1="10" y1="110" x2="310" y2="110"/><path class="ex-fill exc-m" d="M310 110 l-8 -5 v10 Z"/><line class="ex-stroke exc-r" style="stroke-width:2" x1="${NOW}" y1="80" x2="${NOW}" y2="140"/><text class="ex-tiny exc-r" x="${NOW}" y="155">${u('now', 'сейчас', 'қазір')}</text>
          <text class="ex-tiny" x="40" y="155">${u('past', 'прошлое', 'өткен')}</text><text class="ex-tiny" x="280" y="155">${u('future', 'будущее', 'келер')}</text>${marks[t.mark]}
          <text class="ex-tag" x="160" y="40" style="text-anchor:middle">${t.f}</text><text class="ex-small" x="160" y="195" style="font-style:italic">${t.ex}</text>`,
        caption: L(`${['Present Simple', 'Present Continuous', 'Past Simple', 'Past Continuous', 'Present Perfect', 'Past Perfect', 'Future Simple'][st.k]}: ${tx(t.note)}. Form: ${t.f}.`, `${['Present Simple', 'Present Continuous', 'Past Simple', 'Past Continuous', 'Present Perfect', 'Past Perfect', 'Future Simple'][st.k]}: ${tx(t.note)}. Образование: ${t.f}.`, `${['Present Simple', 'Present Continuous', 'Past Simple', 'Past Continuous', 'Present Perfect', 'Past Perfect', 'Future Simple'][st.k]}: ${tx(t.note)}. Жасалуы: ${t.f}.`),
      };
    },
  },
};

// Данные для сцен.

const CITIES = [
  { n: L('New York', 'Нью-Йорк', 'Нью-Йорк'), o: -5 },
  { n: L('London', 'Лондон', 'Лондон'), o: 0 },
  { n: L('Moscow', 'Москва', 'Мәскеу'), o: 3 },
  { n: L('Astana', 'Астана', 'Астана'), o: 5 },
  { n: L('Beijing', 'Пекин', 'Бейжің'), o: 8 },
  { n: L('Tokyo', 'Токио', 'Токио'), o: 9 },
];

function sortState(n) {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { arr, i: 0, j: 0, cmp: 0, sw: 0, last: null, done: n < 2 };
}

/** Один шаг пузырька. Возвращает true, пока сортировка не закончена. */
function sortStep(st) {
  const n = st.arr.length;
  if (st.done) return false;
  const j = st.j;
  const a = st.arr[j];
  const b = st.arr[j + 1];
  const swapped = a > b;
  st.cmp += 1;
  if (swapped) {
    st.arr[j] = b;
    st.arr[j + 1] = a;
    st.sw += 1;
  }
  st.last = { j, a, b, swapped, pass: st.i + 1 };
  st.j += 1;
  if (st.j >= n - 1 - st.i) {
    st.i += 1;
    st.j = 0;
    if (st.i >= n - 1) st.done = true;
  }
  return !st.done;
}
