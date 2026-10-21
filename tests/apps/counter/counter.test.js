import test from 'node:test';
import assert from 'node:assert/strict';
import { assertStandaloneAssets, openApp } from '../harness.js';

const NAME = 'counter';

function counter(t) {
    const app = openApp(t, NAME);
    const { $, $$, text } = app;
    const stepRadio = value => app.document.querySelector(`input[name="step"][value="${value}"]`);
    const snapshot = () => ({
        count: text('count'),
        status: text('status'),
        remaining: text('remaining'),
        canAdd: !$('increment').disabled,
        canRemove: !$('decrement').disabled,
    });
    return { ...app, stepRadio, snapshot, activity: () => $$('[data-testid="activity"] li').map(text) };
}

test('Counter: page assets resolve when opened directly', () => {
    assertStandaloneAssets(NAME);
});

test('Counter: renders the initial occupancy and accessible meter', t => {
    const { $, document, snapshot } = counter(t);

    assert.deepEqual(snapshot(), {
        count: '0', status: 'Open', remaining: '120 of 120 spots left', canAdd: true, canRemove: false,
    });
    assert.equal($('status').className, 'badge status open', 'bound status class merges with static classes');
    const meter = document.querySelector('[role="meter"]');
    assert.equal(meter.getAttribute('aria-valuenow'), '0');
    assert.equal(meter.getAttribute('aria-valuemax'), '120');
    assert.equal(meter.getAttribute('aria-valuetext'), '0% full');
    assert.equal($('meter-fill').style.width, '0%');
    assert.equal($('increment').getAttribute('aria-label'), 'Add 1 person');
    assert.ok($('empty-activity'), 'empty state is shown');
    assert.equal($('activity'), null);
    assert.equal(document.title, '0/120 · Door Count');
    assert.equal(document.querySelector('[b-on-click], [b-text], [b-model]'), null, 'directives are consumed');
});

test('Counter: increments, decrements, and switches step size', t => {
    const { $, user, snapshot, stepRadio, activity, text, window, document } = counter(t);

    user.click($('increment'));
    user.click($('increment'));
    assert.equal(text('count'), '2');
    assert.equal(document.title, '2/120 · Door Count');

    assert.equal(stepRadio(1).checked, true, 'numeric state checks the matching radio');
    user.click(stepRadio(5));
    assert.equal(window.occupancyApp.state.step, 5, 'radio b-model.number stores a number');
    assert.deepEqual([1, 5, 10].map(value => stepRadio(value).checked), [false, true, false], 'the clicked radio stays checked');
    assert.equal(text('increment'), '+5');
    assert.equal($('decrement').getAttribute('aria-label'), 'Remove 5 people');

    user.click($('increment'));
    user.click($('decrement'));
    assert.deepEqual(snapshot(), {
        count: '2', status: 'Open', remaining: '118 of 120 spots left', canAdd: true, canRemove: true,
    });
    assert.deepEqual(activity().map(entry => entry.split(' ').slice(0, 3).join(' ')), [
        '−5 2 inside', '+5 7 inside', '+1 2 inside', '+1 1 inside',
    ], 'newest activity first');
    assert.equal(text('totals'), '7 in · 5 out');
});

test('Counter: respects capacity, clamps steps, and reflects status changes', t => {
    const { $, user, snapshot, stepRadio, document } = counter(t);

    user.type($('capacity'), '8');
    user.click(stepRadio(5));
    user.click($('increment'));
    assert.equal(snapshot().status, 'Open');
    user.click($('increment'));
    assert.deepEqual(snapshot(), {
        count: '8', status: 'At capacity', remaining: 'No spots left', canAdd: false, canRemove: true,
    }, 'the second +5 is clamped to the 3 remaining spots');
    assert.equal($('status').className, 'badge status full', 'previous dynamic class is replaced');
    assert.equal(document.querySelector('[role="meter"]').className, 'meter full');

    user.type($('capacity'), '6');
    assert.equal(snapshot().status, 'Over capacity');
    assert.equal(snapshot().remaining, '2 over the limit of 6');
    assert.equal($('meter-fill').style.width, '100%', 'meter is capped visually');

    user.type($('capacity'), '10');
    user.click(stepRadio(1));
    user.click($('increment'));
    assert.equal(snapshot().status, 'Filling up', '90% is busy');

    user.type($('capacity'), '');
    assert.deepEqual(snapshot(), {
        count: '9', status: 'Set a capacity', remaining: 'Capacity must be a whole number above zero', canAdd: false, canRemove: true,
    });
    assert.equal(document.title, '9/– · Door Count');
});

test('Counter: undo, reset, and keyboard shortcuts', t => {
    const { $, user, text, snapshot, activity } = counter(t);

    assert.equal(user.key('+').defaultPrevented, true);
    user.key('ArrowUp');
    user.key('=');
    assert.equal(text('count'), '3');
    user.key('-');
    assert.equal(text('count'), '2');
    user.key('z');
    assert.equal(text('count'), '3', 'z undoes the last change');

    assert.equal(user.key('+', { target: $('capacity') }).defaultPrevented, false, 'typing in inputs is not hijacked');
    assert.equal(user.key('+', { metaKey: true }).defaultPrevented, false, 'browser shortcuts are not hijacked');
    assert.equal(text('count'), '3');

    user.click($('undo'));
    user.click($('undo'));
    user.click($('undo'));
    assert.equal(text('count'), '0');
    assert.equal($('undo').disabled, true);
    assert.ok($('empty-activity'));

    user.click($('increment'));
    user.click($('reset'));
    assert.deepEqual(snapshot(), {
        count: '0', status: 'Open', remaining: '120 of 120 spots left', canAdd: true, canRemove: false,
    });
    assert.deepEqual(activity(), []);
    assert.equal($('reset').disabled, true);
    assert.equal(text('totals'), '0 in · 0 out');

    const radio = $('capacity').ownerDocument.querySelector('input[type="radio"][name="step"]:checked');
    assert.equal(user.key('+', { target: radio }).defaultPrevented, true, 'a focused step radio still allows shortcuts');
    assert.equal(text('count'), '1');
    user.key('-', { target: radio });
    assert.equal(text('count'), '0');
    assert.equal(user.key('ArrowUp', { target: radio }).defaultPrevented, false, 'arrows keep moving the radio selection');
    assert.equal(text('count'), '0');
});

test('Counter: keeps a bounded activity log while totals stay exact', t => {
    const { $, user, text, activity, window } = counter(t);

    for (let index = 0; index < 60; index++) user.click($('increment'));
    assert.equal(text('count'), '60');
    assert.equal(window.occupancyApp.state.history.length, 50);
    assert.equal(activity().length, 6, 'only recent entries render');
    assert.match(activity()[0], /^\+1 60 inside/);
    assert.equal(text('totals'), '60 in · 0 out');
});

test('Counter: disposing the app removes window keyboard listeners', t => {
    const { user, window } = counter(t);

    user.key('+');
    window.occupancyApp.dispose();
    user.key('+');
    assert.equal(window.occupancyApp.state.count, 1);
});
