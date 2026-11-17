// Новые питомцы и ауры (рисунки — в src/ui/art/pets.js и src/ui/art/auras.js).
// META — что добавить в каталог вещей (core/wardrobe.js), NAMES — названия для strings (wear.<id>).

export const META = [
  // Питомцы
  { id: 'bunnypet', slot: 'pet', rarity: 'common', icon: '🐰' },
  { id: 'sheep', slot: 'pet', rarity: 'common', icon: '🐑' },
  { id: 'slime', slot: 'pet', rarity: 'common', icon: '🟢' },
  { id: 'capybara', slot: 'pet', rarity: 'rare', icon: '🦫' },
  { id: 'koala', slot: 'pet', rarity: 'rare', icon: '🐨' },
  { id: 'seal', slot: 'pet', rarity: 'rare', icon: '🦭' },
  { id: 'axolotl', slot: 'pet', rarity: 'epic', icon: '🦎' },
  { id: 'jellyfish', slot: 'pet', rarity: 'epic', icon: '🪼' },
  { id: 'sloth', slot: 'pet', rarity: 'epic', icon: '🦥' },
  { id: 'phoenix', slot: 'pet', rarity: 'legendary', icon: '🔥' },
  // Ауры
  { id: 'raindrops', slot: 'aura', rarity: 'common', icon: '💧' },
  { id: 'clovers', slot: 'aura', rarity: 'common', icon: '🍀' },
  { id: 'butterflies', slot: 'aura', rarity: 'rare', icon: '🦋' },
  { id: 'books', slot: 'aura', rarity: 'rare', icon: '📚' },
  { id: 'atoms', slot: 'aura', rarity: 'epic', icon: '⚛️' },
  { id: 'comets', slot: 'aura', rarity: 'legendary', icon: '☄️' },
];

export const NAMES = {
  bunnypet: { ru: 'Зайчонок', en: 'Bunny', kk: 'Көжек' },
  sheep: { ru: 'Барашек', en: 'Lamb', kk: 'Қозы' },
  slime: { ru: 'Слаймик', en: 'Slime', kk: 'Слайм' },
  capybara: { ru: 'Капибара', en: 'Capybara', kk: 'Капибара' },
  koala: { ru: 'Коала', en: 'Koala', kk: 'Коала' },
  seal: { ru: 'Тюлень', en: 'Seal', kk: 'Итбалық' },
  axolotl: { ru: 'Аксолотль', en: 'Axolotl', kk: 'Аксолотль' },
  jellyfish: { ru: 'Медуза', en: 'Jellyfish', kk: 'Медуза' },
  sloth: { ru: 'Ленивец', en: 'Sloth', kk: 'Жалқау' },
  phoenix: { ru: 'Феникс', en: 'Phoenix', kk: 'Феникс' },
  raindrops: { ru: 'Капельки', en: 'Raindrops', kk: 'Тамшылар' },
  clovers: { ru: 'Клеверы', en: 'Clovers', kk: 'Беде жапырақтары' },
  butterflies: { ru: 'Бабочки', en: 'Butterflies', kk: 'Көбелектер' },
  books: { ru: 'Книжки', en: 'Books', kk: 'Кітаптар' },
  atoms: { ru: 'Атомы', en: 'Atoms', kk: 'Атомдар' },
  comets: { ru: 'Кометы', en: 'Comets', kk: 'Кометалар' },
};
