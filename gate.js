/* ---------------------------------------------------------------------------
   Soft password gate.

   IMPORTANT: this is deterrence, not security. GitHub Pages serves static
   files with no server to check anything, so a determined visitor can bypass
   this in seconds, and the repository is public either way. It exists to stop
   casual visitors and search engines, nothing more.

   To change the password, run this in Terminal and paste the result into
   PASSWORD_HASH below:

     printf '%s' 'your-new-password' | shasum -a 256

   Current password: witherenden
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var PASSWORD_HASH = '88e5550f7060715af07a1bfce10ef0237d80d23a0c341ed1d16f0af5d6b455ae';
  var STORAGE_KEY = 'alexandpen-unlocked';

  // localStorage throws in some privacy modes — never let that break the page
  function remembered() {
    try { return localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH; }
    catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(STORAGE_KEY, PASSWORD_HASH); } catch (e) {}
  }

  if (remembered()) return;

  // hide the page immediately, before anything paints
  document.documentElement.classList.add('gate-locked');

  function sha256(text) {
    var bytes = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  function unlock() {
    remember();
    document.documentElement.classList.remove('gate-locked');
    var gate = document.getElementById('gate');
    if (gate) gate.remove();
  }

  function build() {
    var gate = document.createElement('div');
    gate.id = 'gate';
    gate.innerHTML =
      '<form class="gate-inner" autocomplete="off">' +
        '<img class="gate-mark" src="images/monogram.png" alt="Alex &amp; Pen" />' +
        '<label class="gate-label" for="gate-input">Please enter the password</label>' +
        '<input class="gate-input" id="gate-input" type="password" autocomplete="off" spellcheck="false" />' +
        '<button class="gate-button" type="submit">Enter</button>' +
        '<p class="gate-error" hidden>That\'s not it &mdash; try again.</p>' +
      '</form>';
    document.body.appendChild(gate);

    var form = gate.querySelector('form');
    var input = gate.querySelector('.gate-input');
    var error = gate.querySelector('.gate-error');
    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var attempt = input.value.trim().toLowerCase();
      if (!attempt) return;
      sha256(attempt).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          unlock();
        } else {
          error.hidden = false;
          input.value = '';
          input.focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
