// Монета Prep&Play: золотая, с лавровой ветвью и P&P в центре (картинки - icons/coin.svg и icons/coin-sm.svg,
// их рисует tools/coin-svg.mjs). Везде, где в тексте встречается 🪙, сам собой появляется значок монеты:
// за этим следит coinify, поэтому эмодзи можно оставлять и в переводах, и в уведомлениях.

export const COIN = '🪙';

/** Значок монеты. cls: 'coin-lg' - подробная монета с бликом (для крупных мест). */
export const coinHtml = (cls = '') => `<i class="coin ${cls}" role="img" aria-label="${COIN}"></i>`;

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'TITLE', 'INPUT', 'SELECT']);

function coinEl(doc) {
  const el = doc.createElement('i');
  el.className = 'coin';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', COIN);
  return el;
}

/** Заменяет 🪙 в одном текстовом узле на значки монет. */
function swapText(text) {
  const parent = text.parentNode;
  if (!parent || SKIP.has(parent.nodeName) || parent.closest?.('svg')) return;
  const doc = text.ownerDocument;
  const frag = doc.createDocumentFragment();
  // Пробел сразу после монеты убираем: отступ даёт сам значок.
  text.data.split(COIN).forEach((part, i) => {
    if (i) frag.append(coinEl(doc));
    const rest = i ? part.replace(/^ /, ' ') : part;
    if (rest) frag.append(rest);
  });
  parent.replaceChild(frag, text);
}

/** Находит все 🪙 внутри узла и заменяет их. */
export function coinifyNode(node) {
  if (!node) return;
  if (node.nodeType === 3) {
    if (node.data.includes(COIN)) swapText(node);
    return;
  }
  if (node.nodeType !== 1 || SKIP.has(node.nodeName) || !node.textContent.includes(COIN)) return;
  const doc = node.ownerDocument;
  const walker = doc.createTreeWalker(node, 4 /* NodeFilter.SHOW_TEXT */);
  const found = [];
  while (walker.nextNode()) if (walker.currentNode.data.includes(COIN)) found.push(walker.currentNode);
  found.forEach(swapText);
}

/** Следит за страницей и заменяет новые 🪙 на значки (экраны, уведомления, окна). */
export function startCoinify(root = globalThis.document?.body) {
  if (!root || !globalThis.MutationObserver) return;
  coinifyNode(root);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') coinifyNode(m.target);
      else m.addedNodes.forEach(coinifyNode);
    }
  }).observe(root, { childList: true, subtree: true, characterData: true });
}

/** Монета подпрыгивает и поворачивается (получили монеты) или переворачивается (потратили). */
export function animateCoin(el, kind = 'gain') {
  if (!el || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  el.classList.remove('coin-gain', 'coin-spend');
  void el.offsetWidth;
  el.classList.add(kind === 'spend' ? 'coin-spend' : 'coin-gain');
}
