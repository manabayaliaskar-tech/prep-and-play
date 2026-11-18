// Общие SVG-фильтры страницы. pp-3d придаёт любой нарисованной вещи объём: мягкий блик сверху-слева
// (свет медленно «бежит» по вещам), лёгкое тиснение по краям и тень снизу. Подключается один раз в main.js.

export function installFxDefs(doc = document) {
  if (doc.getElementById('pp-fx-defs')) return;
  const still = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const shimmer = still ? '' : '<animate attributeName="azimuth" values="200;250;200" dur="5s" repeatCount="indefinite"/>';
  const filter = (fid, light) => `<filter id="${fid}" x="-15%" y="-15%" width="130%" height="135%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="blur"/>
        <feSpecularLighting in="blur" surfaceScale="2.4" specularConstant=".75" specularExponent="16" lighting-color="#ffffff" result="spec">
          <feDistantLight azimuth="225" elevation="50">${light}</feDistantLight>
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>
        <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".5" k4="0" result="lit"/>
        <feOffset in="blur" dy="1.3" result="off"/>
        <feFlood flood-color="#1e1b4b" flood-opacity=".26"/>
        <feComposite in2="off" operator="in" result="shadow"/>
        <feMerge><feMergeNode in="shadow"/><feMergeNode in="lit"/></feMerge>
      </filter>`;
  // pp-3d — неподвижный (миниатюры в витрине, их много), pp-3d-live — с бегущим бликом (вещи на самом Препи).
  doc.body.insertAdjacentHTML(
    'afterbegin',
    `<svg id="pp-fx-defs" aria-hidden="true" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">${filter('pp-3d', '')}${filter('pp-3d-live', shimmer)}</svg>`,
  );
}
