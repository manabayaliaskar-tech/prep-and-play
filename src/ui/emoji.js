// Эмодзи - картинками (Fluent Emoji 3D): на любом устройстве одинаково и без «квадратиков»,
// даже там, где системный шрифт не знает новых эмодзи (старые Windows, Android, macOS).
// emojify следит за страницей и заменяет эмодзи в тексте на <img>, а внутри SVG - <text> на <image>.
// Эмодзи без картинки остаются текстом. Монета 🪙 - своя (ui/coin.js).

import { EMOJI_CODES } from './emoji-list.js';

/** Эмодзи-последовательность: флаги, клавиши, символы с эмодзи-видом, модификаторы кожи и склейки ZWJ. */
export const EMOJI_RE =
  /(?:\p{RI}\p{RI}|[#*0-9]️⃣|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)(?:[\u{1F3FB}-\u{1F3FF}])?(?:‍\p{Extended_Pictographic}️?(?:[\u{1F3FB}-\u{1F3FF}])?)*)/gu;

const COIN = '🪙';
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'TITLE', 'INPUT', 'SELECT', 'CODE', 'PRE']);
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Код картинки: шестнадцатеричные коды символов через «-», без FE0F. */
export const emojiCode = (e) => [...e].filter((c) => c !== '️').map((c) => c.codePointAt(0).toString(16)).join('-');

/** Путь к картинке эмодзи или null, если картинки нет. */
export function emojiSrc(e) {
  if (e === COIN) return null;
  const code = emojiCode(e);
  return EMOJI_CODES.has(code) ? `icons/emoji/${code}.webp` : null;
}

/** Есть ли в тексте эмодзи, для которого есть картинка. */
function hasEmoji(text) {
  EMOJI_RE.lastIndex = 0;
  for (const m of text.matchAll(EMOJI_RE)) if (emojiSrc(m[0])) return true;
  return false;
}

function imgFor(doc, e, src) {
  const img = doc.createElement('img');
  img.className = 'emo';
  img.src = src;
  img.alt = e;
  img.draggable = false;
  img.decoding = 'async';
  return img;
}

/** SVG: <text> с одним эмодзи превращается в <image> того же размера и места. */
function swapSvgText(textEl) {
  const e = textEl.textContent.trim();
  const src = emojiSrc(e);
  if (!src) return;
  EMOJI_RE.lastIndex = 0;
  const m = EMOJI_RE.exec(e);
  if (!m || m[0] !== e) return;
  const cs = globalThis.getComputedStyle?.(textEl);
  const size = parseFloat(textEl.getAttribute('font-size') ?? cs?.fontSize ?? '16') || 16;
  const x = parseFloat(textEl.getAttribute('x') ?? '0') || 0;
  const y = parseFloat(textEl.getAttribute('y') ?? '0') || 0;
  const anchor = textEl.getAttribute('text-anchor') ?? cs?.textAnchor ?? 'start';
  const baseline = textEl.getAttribute('dominant-baseline') ?? '';
  const s = size * 1.1;
  const ix = anchor === 'middle' ? x - s / 2 : anchor === 'end' ? x - s : x;
  const iy = baseline === 'central' || baseline === 'middle' ? y - s / 2 : y - s * 0.86;
  const image = textEl.ownerDocument.createElementNS(SVG_NS, 'image');
  image.setAttribute('href', src);
  image.setAttribute('x', ix.toFixed(2));
  image.setAttribute('y', iy.toFixed(2));
  image.setAttribute('width', s.toFixed(2));
  image.setAttribute('height', s.toFixed(2));
  for (const attr of ['transform', 'class', 'style']) if (textEl.hasAttribute(attr)) image.setAttribute(attr, textEl.getAttribute(attr));
  image.classList.add('emo-svg');
  textEl.replaceWith(image);
}

/** Заменяет эмодзи в одном текстовом узле. */
function swapText(text) {
  const parent = text.parentNode;
  if (!parent || SKIP.has(parent.nodeName)) return;
  if (parent.namespaceURI === SVG_NS) {
    if (parent.nodeName === 'text') swapSvgText(parent);
    return;
  }
  if (parent.closest?.('svg, [contenteditable], .no-emo')) return;
  const doc = text.ownerDocument;
  const data = text.data;
  const frag = doc.createDocumentFragment();
  let last = 0;
  let changed = false;
  EMOJI_RE.lastIndex = 0;
  for (const m of data.matchAll(EMOJI_RE)) {
    const src = emojiSrc(m[0]);
    if (!src) continue;
    if (m.index > last) frag.append(data.slice(last, m.index));
    frag.append(imgFor(doc, m[0], src));
    last = m.index + m[0].length;
    changed = true;
  }
  if (!changed) return;
  if (last < data.length) frag.append(data.slice(last));
  parent.replaceChild(frag, text);
}

/** Находит эмодзи внутри узла и заменяет их картинками. */
export function emojifyNode(node) {
  if (!node) return;
  if (node.nodeType === 3) {
    if (hasEmoji(node.data)) swapText(node);
    return;
  }
  if (node.nodeType !== 1 || SKIP.has(node.nodeName)) return;
  const all = node.textContent;
  if (!all || !hasEmoji(all)) return;
  const walker = node.ownerDocument.createTreeWalker(node, 4 /* NodeFilter.SHOW_TEXT */);
  const found = [];
  while (walker.nextNode()) if (hasEmoji(walker.currentNode.data)) found.push(walker.currentNode);
  found.forEach(swapText);
}

/** Следит за страницей: новые эмодзи сразу становятся картинками. */
export function startEmojify(root = globalThis.document?.body) {
  if (!root || !globalThis.MutationObserver) return;
  emojifyNode(root);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') emojifyNode(m.target);
      else m.addedNodes.forEach(emojifyNode);
    }
  }).observe(root, { childList: true, subtree: true, characterData: true });
}
