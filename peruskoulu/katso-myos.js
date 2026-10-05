/* "Katso myös": vähäeleinen rivi muista näkymistä. Sivu merkitsee paikan
 * elementillä <span data-katso></span> (tai useammalla), ja tämä täyttää sen.
 * Nykyinen näkymä jätetään pois. Linkit ovat suhteellisia peruskoulu/-kansioon.
 */
(function () {
  'use strict';
  const VIEWS = [
    ['', 'Path of Exile'],
    ['esittely/', 'Esittely'],
    ['diablo/', 'Diablo II'],
    ['duolingo/', 'Duolingo'],
    ['minecraft/', 'Minecraft'],
    ['skyrim/', 'Skyrim']
  ];
  const script = document.currentScript;
  const base = script ? script.src.replace(/katso-myos\.js.*$/, '') : '../';
  const here = location.pathname.replace(/\/index\.html$/, '/');
  const css = document.createElement('style');
  css.textContent = '.katso{font-size:.85em;opacity:.75}.katso a{color:inherit;text-decoration:none;border-bottom:1px dotted currentColor}.katso a:hover{opacity:1;border-bottom-style:solid}.katso:hover{opacity:1}';
  document.head.appendChild(css);
  function fill(el) {
    const links = VIEWS
      .filter(([p]) => !here.endsWith('/peruskoulu/' + p))
      .map(([p, n]) => `<a href="${base}${p}">${n}</a>`);
    links.push('<a href="https://github.com/pasiaj/taitopuu" target="_blank" rel="noopener">GitHub</a>');
    el.classList.add('katso');
    el.innerHTML = 'Katso myös: ' + links.join(' · ');
  }
  const run = () => document.querySelectorAll('[data-katso]').forEach(fill);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.katsoMyos = run;
})();
