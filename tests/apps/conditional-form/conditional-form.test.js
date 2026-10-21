import test from 'node:test';
import assert from 'node:assert/strict';
import { assertStandaloneAssets, deferred, openApp, settle } from '../harness.js';

const NAME = 'conditional-form';

/** Opens the registration form with a scripted registration API. */
function registration(t, respond = () => Promise.resolve({ id: 'BC26-TEST01' })) {
    const calls = [];
    const app = openApp(t, NAME, {
        before: window => {
            window.registrationApi = {
                register(payload) {
                    calls.push(JSON.parse(JSON.stringify(payload)));
                    return respond(payload, calls.length);
                },
            };
        },
    });
    const { $, $$, document, user } = app;
    const errors = () => $$('.error').map(element => element.textContent);
    const summary = () => $$('[data-testid="error-summary"] a').map(link => [link.getAttribute('href'), link.textContent]);
    const describedError = id => document.getElementById($(id).getAttribute('aria-describedby') ?? '')?.textContent;
    const fillValidInPerson = () => {
        user.type($('name'), '  Ada Lovelace ');
        user.type($('email'), 'Ada@Example.com');
        user.select($('size'), 'M');
        user.click($('conduct'));
    };
    return { ...app, calls, errors, summary, describedError, fillValidInPerson };
}

test('Conditional form: page assets resolve when opened directly', () => {
    assertStandaloneAssets(NAME);
});

test('Conditional form: starts with in-person options and no premature errors', t => {
    const { $, errors, text, document } = registration(t);

    assert.ok($('in-person-options'));
    assert.equal($('virtual-options'), null);
    assert.equal($('workshops'), null);
    assert.equal($('diet-other-field'), null);
    assert.equal($('company-fields').style.display, 'none', 'b-if.hide keeps billing fields in the DOM');
    assert.equal($('company').required, false);
    assert.deepEqual(errors(), []);
    assert.equal($('error-summary'), null);
    assert.equal(text('total'), '€449.00');
    assert.equal(text('submit'), 'Register · €449.00');
    assert.equal($('form').getAttribute('aria-busy'), 'false');
    assert.equal($('ticket-in-person').checked, true);
    assert.match($('ticket-in-person').closest('label').className, /\bselected\b/);
    assert.equal(document.querySelector('label[for]').htmlFor, $('name').id, 'generated ids connect labels');
});

test('Conditional form: validates fields once the user leaves them', t => {
    const { $, user, errors, describedError } = registration(t);

    user.leave($('name'));
    assert.deepEqual(errors(), ['Enter your full name.']);
    assert.equal($('name').getAttribute('aria-invalid'), 'true');
    assert.equal(describedError('name'), 'Enter your full name.');
    assert.match($('name').closest('.field').className, /\bis-invalid\b/);

    user.type($('email'), 'ada@');
    assert.deepEqual(errors(), ['Enter your full name.'], 'untouched fields stay quiet while typing');
    user.leave($('email'));
    assert.deepEqual(errors(), ['Enter your full name.', 'Enter an email like ada@company.com.']);

    user.type($('name'), 'A');
    assert.equal(describedError('name'), 'Name must be at least 2 characters.');
    user.type($('name'), 'Ada');
    user.type($('email'), 'ada@example.com');
    assert.deepEqual(errors(), []);
    assert.equal($('name').getAttribute('aria-invalid'), 'false');
    assert.equal($('name').hasAttribute('aria-describedby'), false);
});

test('Conditional form: a failed submit shows a focused summary linked to each field', t => {
    const { $, user, summary, document, calls } = registration(t);

    user.click($('submit'));
    assert.equal(calls.length, 0);
    assert.equal(document.activeElement, $('error-summary'), 'summary rendered and focused in the same handler');
    assert.equal($('error-summary').querySelector('h2').textContent, 'Please fix 4 problems');
    assert.deepEqual(summary().map(([, message]) => message), [
        'Enter your full name.',
        'Enter your email address.',
        'Choose a T-shirt size.',
        'You must agree to the code of conduct.',
    ]);
    for (const [href] of summary()) assert.ok(document.querySelector(href), `${href} points at a rendered field`);
    for (const id of ['name', 'email', 'size', 'conduct']) assert.equal($(id).getAttribute('aria-invalid'), 'true', id);

    user.type($('name'), 'Ada Lovelace');
    assert.equal($('error-summary').querySelector('h2').textContent, 'Please fix 3 problems', 'summary is live');
});

test('Conditional form: ticket type swaps conditional sections and their rules', t => {
    const { $, user, errors, text, summary, document } = registration(t);
    user.select($('size'), 'L');
    user.click($('submit'));

    user.click($('ticket-virtual'));
    assert.equal($('in-person-options'), null);
    assert.ok($('virtual-options'));
    assert.equal(text('total'), '€99.00');
    assert.ok(errors().includes('Choose your time zone.'));
    assert.equal(errors().includes('Choose a T-shirt size.'), false);
    assert.deepEqual($('timezone').querySelectorAll('option').length, 6);

    user.click($('ticket-workshop'));
    assert.equal($('virtual-options'), null);
    assert.equal($('size').value, 'L', 'restored branch reads the preserved state');
    assert.ok($('workshops'));
    assert.equal($('session-islands').disabled, true, 'sold-out workshop is disabled');
    assert.match($('session-islands').closest('label').className, /\bsold-out\b/);
    assert.ok(errors().includes('Pick a workshop.'));
    assert.ok(document.querySelector(summary().find(([, message]) => message === 'Pick a workshop.')[0]));

    user.click($('session-a11y'));
    assert.equal(errors().includes('Pick a workshop.'), false);
    assert.equal(text('total'), '€649.00');
    assert.equal(text('submit'), 'Register · €649.00');

    user.select($('diet'), 'other');
    assert.ok($('diet-other-field'));
    assert.ok(errors().includes('Describe your dietary needs.'));
    user.type($('diet-other'), 'No tree nuts');
    assert.equal(errors().includes('Describe your dietary needs.'), false);
    user.select($('diet'), 'vegan');
    assert.equal($('diet-other-field'), null);
});

test('Conditional form: hidden billing fields keep drafts but stop validating', t => {
    const { $, user, errors } = registration(t);

    user.click($('invoice'));
    assert.equal($('company-fields').style.display, '');
    assert.equal($('company').required, true);
    user.type($('company'), 'Analytical Engines Ltd');
    user.type($('vat'), 'PT12');
    user.leave($('vat'));
    assert.deepEqual(errors(), ['Use a country prefix and number, like PT123456789.']);

    user.click($('invoice'));
    assert.equal($('company-fields').style.display, 'none');
    assert.equal($('company').required, false);
    assert.deepEqual(errors(), [], 'hidden fields are not validated');

    user.click($('invoice'));
    assert.equal($('company').value, 'Analytical Engines Ltd', 'draft survives hiding');
    user.type($('vat'), 'pt123456789');
    assert.deepEqual(errors(), []);
});

test('Conditional form: promo codes and notes counter update derived output', t => {
    const { $, user, errors, text } = registration(t);

    user.type($('promo'), 'brio2');
    user.leave($('promo'));
    assert.deepEqual(errors(), ['That promo code is not valid.']);
    assert.equal($('discount'), null);

    user.type($('promo'), 'brio20');
    assert.deepEqual(errors(), []);
    assert.deepEqual([...$('discount').children].map(span => span.textContent), ['Promo BRIO20', '−€90.00']);
    assert.equal(text('total'), '€359.00');

    user.type($('promo'), 'speaker');
    assert.equal(text('total'), '€0.00');
    assert.equal(text('submit'), 'Register · €0.00');

    assert.equal($('notes').maxLength, 280);
    user.type($('notes'), 'x'.repeat(250));
    assert.equal(text('notes-counter'), '30 characters left');
    assert.equal($('notes-counter').className, 'counter near-limit');
    user.type($('notes'), 'x'.repeat(280));
    assert.equal($('notes-counter').className, 'counter at-limit');
    user.type($('notes'), 'Step-free access');
    assert.equal($('notes-counter').className, 'counter');
});

test('Conditional form: submits only relevant data and shows a confirmation', async t => {
    const pending = deferred();
    const { $, user, calls, text, document, errors, fillValidInPerson } = registration(t, () => pending.promise);

    user.click($('invoice'));
    user.type($('company'), 'Typed then abandoned');
    user.click($('invoice'));
    user.click($('ticket-workshop'));
    user.click($('session-signals'));
    user.type($('promo'), 'brio20');
    fillValidInPerson();

    user.click($('submit'));
    assert.equal($('submit').disabled, true);
    assert.equal(text('submit'), 'Registering…');
    assert.equal($('form').getAttribute('aria-busy'), 'true');
    $('form').requestSubmit();
    assert.equal(calls.length, 1, 'double submission is ignored');
    assert.deepEqual(calls[0], {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        ticket: 'workshop',
        size: 'M',
        diet: 'none',
        session: 'signals',
        promo: 'BRIO20',
        notes: '',
        total: 519,
    }, 'hidden billing and virtual-only fields are excluded');

    pending.resolve({ id: 'BC26-TEST01' });
    await settle();
    assert.equal($('form'), null);
    assert.equal(document.querySelector('h2').textContent, "You're registered, Ada!");
    assert.equal(text('confirmation-id'), 'BC26-TEST01');
    assert.equal(text('confirmation-ticket'), 'In person + workshop');
    assert.equal(text('confirmation-total'), '€519.00');
    assert.match(text('confirmation'), /Workshop Signals from scratch/);

    user.click($('register-another'));
    assert.ok($('form'));
    assert.equal($('name').value, '');
    assert.equal($('ticket-in-person').checked, true);
    assert.equal($('company-fields').style.display, 'none');
    assert.deepEqual(errors(), []);
    assert.equal($('error-summary'), null);
});

test('Conditional form: server field errors are shown until the value changes', async t => {
    const { $, user, calls, describedError, document, fillValidInPerson } = registration(t, (payload, attempt) => attempt === 1
        ? Promise.reject(Object.assign(new Error('Validation failed'), { fields: { email: 'This email is already registered.' } }))
        : Promise.resolve({ id: 'BC26-TEST02' }));

    fillValidInPerson();
    user.click($('submit'));
    await settle();
    assert.equal(describedError('email'), 'This email is already registered.');
    assert.equal(document.activeElement, $('error-summary'));
    assert.equal($('submit').disabled, false);

    user.type($('email'), 'ada@example.org');
    assert.equal($('error-summary'), null, 'changing the rejected value clears the server error');
    user.type($('email'), 'Ada@Example.com');
    assert.equal(describedError('email'), 'This email is already registered.', 'the rejected value is still rejected');

    user.type($('email'), 'ada@example.org');
    user.click($('submit'));
    await settle();
    assert.equal(calls.length, 2);
    assert.ok($('confirmation'));
});

test('Conditional form: unexpected failures keep the form recoverable', async t => {
    const { $, user, text, calls, fillValidInPerson } = registration(t, (payload, attempt) => attempt === 1
        ? Promise.reject(new Error('Network down'))
        : Promise.resolve({ id: 'BC26-TEST03' }));

    fillValidInPerson();
    user.click($('submit'));
    await settle();
    assert.equal(text('server-error'), 'We could not complete your registration. Please try again.');
    assert.equal($('submit').disabled, false);
    assert.equal($('name').value, 'Ada Lovelace');

    user.click($('submit'));
    assert.equal($('server-error'), null, 'retrying clears the alert');
    await settle();
    assert.equal(calls.length, 2);
    assert.equal(text('confirmation-id'), 'BC26-TEST03');
});
