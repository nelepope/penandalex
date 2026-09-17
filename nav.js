/* ---------------------------------------------------------------------------
   Mobile navigation.

   On small screens the nav links collapse behind a hamburger button in the
   top left; tapping it opens them as a full-screen menu. Desktop is untouched:
   the wrapper this adds uses display: contents there, so the links lay out
   exactly as before. If this script never runs, the nav stays as plain links.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var root = document.documentElement;
  // set immediately so the CSS can hide the links before first paint
  root.classList.add('nav-js');

  function build() {
    var nav = document.querySelector('nav.site-nav');
    if (!nav) return;

    var links = Array.prototype.filter.call(nav.children, function (el) {
      return el.tagName === 'A' && !el.classList.contains('nav-brand');
    });

    var panel = document.createElement('div');
    panel.className = 'nav-links';
    panel.id = 'nav-links';
    links.forEach(function (a) { panel.appendChild(a); });
    nav.appendChild(panel);

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-toggle';
    button.setAttribute('aria-controls', 'nav-links');
    button.innerHTML = '<span></span><span></span><span></span>';
    nav.insertBefore(button, nav.firstChild);

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      root.classList.toggle('nav-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    setOpen(false);

    button.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      setOpen(open);
      if (open) {
        var first = panel.querySelector('a');
        if (first) first.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        button.focus();
      }
    });

    // leaving the mobile breakpoint, or coming back via the back button,
    // should never leave the menu stuck open
    var wide = window.matchMedia('(min-width: 641px)');
    var onWide = function () { if (wide.matches) setOpen(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
    window.addEventListener('pageshow', function () { setOpen(false); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
