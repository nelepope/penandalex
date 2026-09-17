/* ---------------------------------------------------------------------------
   RSVP form.

   Replies are sent to a Google Form, which records each one as a row in a
   Google Sheet owned by Pen. The form on this page is our own markup so it
   matches the site; it submits the same fields the Google Form expects.

   Google doesn't let a page read the outcome of that submission (it has to be
   sent "no-cors"), so success is assumed once the request completes without a
   network error. After any change to the Google Form, send a test reply and
   check it reaches the Sheet.

   To connect: set FORM_ACTION to the form's .../formResponse URL and fill in
   each entry id. Option wording below must match the Google Form exactly.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var FORM_ACTION = '';
  var ENTRY = {
    name: '',
    attending: '',
    dietary: '',
    camping: ''
  };

  var ATTENDING_YES = "Yes, I'll be there";

  function init() {
    var form = document.getElementById('rsvp-form');
    if (!form) return;

    var thanks = document.getElementById('rsvp-thanks');
    var thanksBody = thanks.querySelector('.rsvp-thanks-body');
    var error = form.querySelector('.rsvp-error');
    var button = form.querySelector('.rsvp-submit');
    var extras = form.querySelector('.rsvp-if-attending');

    function checkedValue(name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : '';
    }

    // dietary and camping only matter for people who are coming
    function syncExtras() {
      extras.hidden = checkedValue('attending') !== ATTENDING_YES;
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'attending') syncExtras();
    });
    syncExtras();

    function showError(message) {
      error.textContent = message;
      error.hidden = false;
    }

    function finish(attending) {
      thanksBody.textContent = attending === ATTENDING_YES
        ? 'We can’t wait to see you on the 3rd of July.'
        : 'Thank you for letting us know — you’ll be missed.';
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      error.hidden = true;

      var attending = checkedValue('attending');

      // bots fill every field; a person never sees this one
      if (form.elements.website.value) {
        finish(attending);
        return;
      }

      var name = form.elements.name.value.trim();
      if (!name) {
        showError('Please add your name.');
        form.elements.name.focus();
        return;
      }
      if (!attending) {
        showError('Please let us know whether you can come.');
        return;
      }
      if (!FORM_ACTION) {
        showError('RSVPs aren’t open just yet.');
        return;
      }

      var data = new URLSearchParams();
      data.append(ENTRY.name, name);
      data.append(ENTRY.attending, attending);
      if (attending === ATTENDING_YES) {
        var dietary = form.elements.dietary.value.trim();
        var camping = checkedValue('camping');
        if (dietary) data.append(ENTRY.dietary, dietary);
        if (camping) data.append(ENTRY.camping, camping);
      }

      button.disabled = true;
      button.textContent = 'Sending…';

      fetch(FORM_ACTION, { method: 'POST', mode: 'no-cors', body: data })
        .then(function () { finish(attending); })
        .catch(function () {
          button.disabled = false;
          button.textContent = 'Send RSVP';
          showError('That didn’t send — please check your connection and try again.');
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
