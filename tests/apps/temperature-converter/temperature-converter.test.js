import test from 'node:test';
import assert from 'node:assert/strict';
import { assertStandaloneAssets, openApp } from '../harness.js';

const NAME = 'temperature-converter';
const STORAGE_KEY = 'brio-apps:temperature-converter';

function converter(t, options) {
    const app = openApp(t, NAME, options);
    const { $ } = app;
    const fields = () => ({ c: $('celsius').value, f: $('fahrenheit').value, k: $('kelvin').value });
    const fieldClass = scale => $(scale).closest('.field').className;
    return { ...app, fields, fieldClass };
}

function spyOnStorage(writes) {
    return window => {
        const setItem = window.Storage.prototype.setItem;
        window.Storage.prototype.setItem = function (key, value) {
            writes.push([key, JSON.parse(value)]);
            return setItem.call(this, key, value);
        };
    };
}

test('Temperature converter: page assets resolve when opened directly', () => {
    assertStandaloneAssets(NAME);
});

test('Temperature converter: renders derived values from one canonical temperature', t => {
    const { $, fields, text } = converter(t);

    assert.deepEqual(fields(), { c: '20', f: '68', k: '293.2' });
    assert.equal(text('reading'), '20 °C');
    assert.equal(text('condition'), 'Comfortable');
    assert.equal(text('formula'), '(68 °F − 32) × 5/9 = 20 °C');
    assert.equal($('thermometer').style.getPropertyValue('--level'), '63%', 'CSS custom property binding');
    assert.equal($('reset').disabled, true);
    assert.equal($('celsius').getAttribute('aria-invalid'), 'false');
});

test('Temperature converter: converts in every direction while preserving what the user types', t => {
    const { $, user, fields, fieldClass, text } = converter(t);

    user.type($('fahrenheit'), '98.60');
    assert.deepEqual(fields(), { c: '37', f: '98.60', k: '310.2' }, 'the edited field is never reformatted mid-typing');
    assert.match(fieldClass('fahrenheit'), /\bis-source\b/);
    assert.equal(text('condition'), 'Hot');
    assert.equal(text('formula'), '(98.60 °F − 32) × 5/9 = 37 °C');

    user.type($('kelvin'), '0');
    assert.deepEqual(fields(), { c: '-273.1', f: '-459.7', k: '0' });
    assert.match(fieldClass('kelvin'), /\bis-source\b/);
    assert.doesNotMatch(fieldClass('fahrenheit'), /\bis-source\b/);

    user.type($('celsius'), '36,6');
    assert.deepEqual(fields(), { c: '36,6', f: '97.9', k: '309.8' }, 'comma decimals are accepted');

    user.type($('celsius'), '-0.04');
    assert.equal(text('reading'), '0 °C', 'no negative zero');

    user.type($('celsius'), '37.');
    assert.equal($('celsius').value, '37.', 'a trailing decimal point survives');
    user.leave($('celsius'));
    assert.deepEqual(fields(), { c: '37', f: '98.6', k: '310.2' }, 'leaving the field normalizes it');
    assert.doesNotMatch(fieldClass('celsius'), /\bis-source\b/);
});

test('Temperature converter: first edits and scale switches preserve the caret', t => {
    const { $, window, user } = converter(t);
    for (const scale of ['celsius', 'fahrenheit', 'kelvin', 'celsius']) {
        const field = $(scale);
        field.focus();
        field.setSelectionRange(1, 1);
        field.setRangeText('1', 1, 1, 'end');
        const expected = field.value;
        field.dispatchEvent(new window.Event('input', { bubbles: true }));
        assert.equal(field.value, expected);
        assert.equal(field.selectionStart, 2, `${scale} keeps the insertion position`);
        assert.equal(field.selectionEnd, 2);
        user.leave(field);
    }
});

test('Temperature converter: invalid input is isolated to its field and accessible', t => {
    const { $, user, fields, fieldClass, document, window } = converter(t);

    user.type($('fahrenheit'), 'warm');
    assert.deepEqual(fields(), { c: '20', f: 'warm', k: '293.2' }, 'other fields keep the last valid value');
    assert.equal($('fahrenheit').getAttribute('aria-invalid'), 'true');
    const describedBy = $('fahrenheit').getAttribute('aria-describedby');
    assert.equal(document.getElementById(describedBy)?.textContent, 'Enter a number, like 21.5 or -4.');
    assert.match(fieldClass('fahrenheit'), /\bis-invalid\b/);
    assert.match(fieldClass('celsius'), /\bis-stale\b/);
    assert.match(fieldClass('kelvin'), /\bis-stale\b/);

    user.leave($('fahrenheit'));
    assert.equal($('fahrenheit').value, 'warm', 'invalid text is kept on blur so it can be corrected');
    assert.ok($('fahrenheit-error'));

    user.type($('fahrenheit'), '');
    assert.equal($('fahrenheit-error').textContent, 'Enter a temperature.');

    user.type($('fahrenheit'), '-500');
    assert.equal($('fahrenheit-error').textContent, 'That is below absolute zero (-459.7 °F).');
    user.type($('fahrenheit'), '-459.7');
    assert.equal($('fahrenheit-error'), null, 'the limit shown in the message is itself accepted');
    assert.equal(window.temperatureApp.state.celsius, -273.15, 'the rounded limit clamps to absolute zero');
    user.type($('fahrenheit'), '-459.75');
    assert.equal($('fahrenheit-error').textContent, 'That is below absolute zero (-459.7 °F).');
    user.select($('precision'), '2');
    user.type($('fahrenheit'), '-459.7');
    assert.equal($('fahrenheit-error').textContent, 'That is below absolute zero (-459.67 °F).',
        'the accepted limit follows the selected precision');
    user.type($('fahrenheit'), '-459.67');
    assert.equal($('fahrenheit-error'), null);
    user.select($('precision'), '1');
    user.type($('fahrenheit'), '-500');
    user.type($('kelvin'), '-1');
    assert.equal($('fahrenheit-error'), null, 'the error moves with the edited field');
    assert.equal($('kelvin-error').textContent, 'That is below absolute zero (0 K).');
    assert.equal($('fahrenheit').getAttribute('aria-invalid'), 'false');
    assert.equal($('fahrenheit').hasAttribute('aria-describedby'), false);

    user.type($('kelvin'), '300');
    assert.equal($('kelvin-error'), null);
    assert.deepEqual(fields(), { c: '26.9', f: '80.3', k: '300' });
    assert.doesNotMatch(fieldClass('celsius'), /\bis-stale\b/);
});

test('Temperature converter: precision and presets update dependent fields only', t => {
    const { $, $$, user, fields, text } = converter(t);
    const presets = () => $$('.presets button');

    user.select($('precision'), '2');
    assert.deepEqual(fields(), { c: '20', f: '68', k: '293.15' });

    user.type($('celsius'), '21.555');
    user.select($('precision'), '0');
    assert.deepEqual(fields(), { c: '21.555', f: '71', k: '295' }, 'edited text is not rewritten by a precision change');

    user.click(presets().find(button => button.textContent === 'Water boils'));
    assert.deepEqual(fields(), { c: '100', f: '212', k: '373' });
    assert.equal(text('condition'), 'Boiling');
    assert.deepEqual(presets().map(button => button.getAttribute('aria-pressed')),
        ['false', 'false', 'false', 'false', 'true'], 'toggle state is announced as "true"/"false"');

    user.click(presets()[0]);
    assert.equal(text('reading'), '-273 °C');
    assert.equal(text('condition'), 'Absolute zero — molecular motion stops');
    assert.equal($('thermometer').style.getPropertyValue('--level'), '0%');

    user.click($('reset'));
    assert.deepEqual(fields(), { c: '20', f: '68', k: '293.2' });
    assert.equal($('reset').disabled, true);
});

test('Temperature converter: persistence effect only runs when its dependencies change', t => {
    const writes = [];
    const { $, user } = converter(t, { before: spyOnStorage(writes) });

    assert.deepEqual(writes, [[STORAGE_KEY, { celsius: 20, precision: 1 }]], 'saved once on mount');

    user.type($('celsius'), '20.0');
    user.type($('fahrenheit'), '68');
    user.leave($('fahrenheit'));
    assert.equal(writes.length, 1, 'same temperature and draft-only changes do not persist');

    user.type($('celsius'), 'abc');
    assert.equal(writes.length, 1, 'invalid input does not persist');

    user.type($('celsius'), '25');
    user.select($('precision'), '2');
    assert.deepEqual(writes.slice(1), [
        [STORAGE_KEY, { celsius: 25, precision: 1 }],
        [STORAGE_KEY, { celsius: 25, precision: 2 }],
    ]);
});

test('Temperature converter: restores saved settings and ignores corrupted storage', async t => {
    await t.test('restores', t => {
        const { fields } = converter(t, {
            before: window => window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ celsius: 37, precision: 2 })),
        });
        assert.deepEqual(fields(), { c: '37', f: '98.6', k: '310.15' });
    });
    await t.test('falls back', t => {
        const { fields } = converter(t, {
            before: window => window.localStorage.setItem(STORAGE_KEY, '{not json'),
        });
        assert.deepEqual(fields(), { c: '20', f: '68', k: '293.2' });
    });
    await t.test('rejects impossible values', t => {
        const { fields } = converter(t, {
            before: window => window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ celsius: -9999, precision: 1 })),
        });
        assert.deepEqual(fields(), { c: '20', f: '68', k: '293.2' });
    });
});
