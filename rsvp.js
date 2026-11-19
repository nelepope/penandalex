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

  var FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSfVmOj1y4-Jloddtxv3l9ATSraw361KNn6IVj93U1kXJRVFNg/formResponse';
  var ENTRY = {
    name: 'entry.954313533',
    attending: 'entry.1948566302',
    main: 'entry.1256971593',
    pudding: 'entry.722334955',
    dietary: 'entry.1494019693',
    car: 'entry.1300078963',
    camping: 'entry.1302485824',
    notes: 'entry.1206586148',
    menuName: 'entry.2125904040'
  };

  var ATTENDING_YES = 'Yes I will be there';

  function init() {
    var form = document.getElementById('rsvp-form');
    if (!form) return;

    var thanks = document.getElementById('rsvp-thanks');
    var thanksBody = thanks.querySelector('.rsvp-thanks-body');
    // two send buttons: a quick one under the attendance question and one at
    // the bottom; errors show next to whichever was pressed
    var buttons = form.querySelectorAll('.rsvp-submit');
    var errors = form.querySelectorAll('.rsvp-error');
    var error = errors[errors.length - 1];

    function checkedValue(name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : '';
    }

    function showError(message) {
      error.textContent = message;
      error.hidden = false;
    }

    function setSending(sending) {
      Array.prototype.forEach.call(buttons, function (b) {
        if (!b.dataset.label) b.dataset.label = b.textContent;
        b.disabled = sending;
        b.textContent = sending ? 'Sending…' : b.dataset.label;
      });
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
      Array.prototype.forEach.call(errors, function (el) { el.hidden = true; });
      var pressed = e.submitter && e.submitter.parentNode.querySelector('.rsvp-error');
      error = pressed || errors[errors.length - 1];

      var attending = checkedValue('attending');

      // bots fill every field; a person never sees this one
      if (form.elements.website.value) {
        finish(attending);
        return;
      }

      var name = form.elements.name.value.trim();
      if (!name) {
        showError('Please add your name or names.');
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
      ['main', 'pudding', 'car', 'camping'].forEach(function (field) {
        var value = checkedValue(field);
        if (value) data.append(ENTRY[field], value);
      });
      ['dietary', 'notes', 'menuName'].forEach(function (field) {
        var value = form.elements[field].value.trim();
        if (value) data.append(ENTRY[field], value);
      });

      setSending(true);

      fetch(FORM_ACTION, { method: 'POST', mode: 'no-cors', body: data })
        .then(function () { finish(attending); })
        .catch(function () {
          setSending(false);
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
