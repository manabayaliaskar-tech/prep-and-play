// Дополнительные вопросы по физике и химии (запись как в physics.js и chemistry.js).
import { Q } from '../qkit.js';

export const PHYSICS_THEORY_MORE4 = [
  Q(1, ['Какой прибор измеряет температуру тела?', 'Дене температурасын қандай құрал өлшейді?', 'Which device measures the temperature of a body?'],
    ['термометр', 'термометр', 'a thermometer'], [['барометр', 'барометр', 'a barometer'], ['динамометр', 'динамометр', 'a dynamometer'], ['амперметр', 'амперметр', 'an ammeter']],
    ['Термометр измеряет температуру, барометр - давление воздуха, динамометр - силу, амперметр - силу тока.', 'Термометр температураны, барометр - ауа қысымын, динамометр - күшті, амперметр - ток күшін өлшейді.', 'A thermometer measures temperature, a barometer air pressure, a dynamometer force and an ammeter current.']),
];

export const CHEMISTRY_THEORY_MORE4 = [
  Q(1, ['Каким химическим символом обозначают золото?', 'Алтынды қандай химиялық таңбамен белгілейді?', 'Which chemical symbol stands for gold?'],
    ['Au', 'Au', 'Au'], [['Ag', 'Ag', 'Ag'], ['Fe', 'Fe', 'Fe'], ['Hg', 'Hg', 'Hg']],
    ['Золото - Au (от лат. aurum). Ag - серебро, Fe - железо, Hg - ртуть.', 'Алтын - Au (лат. aurum). Ag - күміс, Fe - темір, Hg - сынап.', 'Gold is Au (from Latin aurum). Ag is silver, Fe iron and Hg mercury.']),
];
