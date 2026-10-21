import assert from 'node:assert/strict';
import test from 'node:test';
import { assertStandaloneAssets, openApp } from '../harness.js';

const todayText = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
};

/** Replaces the page clock and interval timer so the Timer task can be driven deterministically. */
function fakeClock() {
    const clock = { now: 0, intervals: new Map(), nextId: 1 };
    clock.install = window => {
        Object.defineProperty(window.performance, 'now', { configurable: true, value: () => clock.now });
        window.setInterval = (callback, delay) => {
            const id = clock.nextId++;
            clock.intervals.set(id, { callback, delay });
            return id;
        };
        window.clearInterval = id => clock.intervals.delete(id);
    };
    clock.advance = ms => {
        for (let step = 0; step < ms; step += 100) {
            clock.now += 100;
            for (const { callback } of [...clock.intervals.values()]) callback();
        }
    };
    return clock;
}

test('7GUIs works as a standalone page', () => {
    assertStandaloneAssets('7guis');
});

test('tabs follow the ARIA tab pattern, sync with the hash, and keep each task alive', t => {
    const { window, document, $, $$, text, user } = openApp(t, '7guis', { hash: '#/crud' });
    const tabs = $$('[role="tab"]');
    const panel = id => document.getElementById(`panel-${id}`);

    assert.equal(tabs.length, 7);
    assert.deepEqual(tabs.map(tab => tab.textContent), ['Counter', 'Temperature', 'Flight Booker', 'Timer', 'CRUD', 'Circle Drawer', 'Cells']);
    assert.equal($('tab-crud').getAttribute('aria-selected'), 'true', 'deep link opens the CRUD task');
    assert.equal($('tab-crud').tabIndex, 0);
    assert.equal($('tab-counter').tabIndex, -1, 'roving tabindex');
    assert.equal(panel('crud').style.display, '');
    assert.equal(panel('counter').style.display, 'none');

    user.click($('tab-counter'));
    user.click($('counter-button'));
    user.click($('counter-button'));
    assert.equal(window.location.hash, '#/counter');

    $('tab-counter').focus();
    user.key('ArrowLeft', { target: $('tab-counter') });
    assert.equal($('tab-cells').getAttribute('aria-selected'), 'true', 'ArrowLeft wraps to the last tab');
    assert.equal(document.activeElement, $('tab-cells'));
    user.key('Home', { target: $('tab-cells') });
    assert.equal(document.activeElement, $('tab-counter'));
    user.key('ArrowRight', { target: $('tab-counter') });
    assert.equal(document.activeElement, $('tab-temperature'));

    window.location.hash = '#/counter';
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    assert.equal(text('counter-value'), '2', 'hidden tasks keep their state');
    assert.equal(panel('counter').style.display, '');

    window.location.hash = '#/nope';
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    assert.equal($('tab-counter').getAttribute('aria-selected'), 'true', 'unknown routes fall back to the first task');
});

test('counter increments', t => {
    const { $, text, user } = openApp(t, '7guis');
    assert.equal(text('counter-value'), '0');
    for (let i = 0; i < 3; i++) user.click($('counter-button'));
    assert.equal(text('counter-value'), '3');
});

test('temperature converter converts both ways and ignores invalid input', t => {
    const { $, user } = openApp(t, '7guis', { hash: '#/temperature' });
    const celsius = $('temp-celsius');
    const fahrenheit = $('temp-fahrenheit');

    user.type(celsius, '100');
    assert.equal(fahrenheit.value, '212');
    user.type(fahrenheit, '-40');
    assert.equal(celsius.value, '-40');
    user.type(fahrenheit, '98.6');
    assert.equal(celsius.value, '37');

    user.type(celsius, '3x');
    assert.equal(celsius.getAttribute('aria-invalid'), 'true');
    assert.equal(fahrenheit.value, '98.6', 'invalid input leaves the other field alone');
    assert.equal(fahrenheit.getAttribute('aria-invalid'), 'false');
    user.type(celsius, '');
    assert.equal(celsius.getAttribute('aria-invalid'), 'false', 'an empty field is not an error');
});

test('flight booker enforces the constraints between its widgets', t => {
    const { $, text, user } = openApp(t, '7guis', { hash: '#/flight' });
    const kind = $('flight-kind');
    const departure = $('flight-departure');
    const returning = $('flight-return');
    const book = $('flight-book');

    assert.equal(departure.value, todayText());
    assert.equal(returning.value, todayText());
    assert.equal(returning.disabled, true, 'return date is disabled for one-way flights');
    assert.equal(book.disabled, false);

    user.type(departure, '31.02.2030');
    assert.equal(departure.getAttribute('aria-invalid'), 'true', 'impossible dates are invalid');
    assert.equal(book.disabled, true);
    user.type(departure, '14.03.2030');
    assert.equal(book.disabled, false);

    user.select(kind, 'return');
    assert.equal(returning.disabled, false);
    user.type(returning, '10.03.2030');
    assert.equal(book.disabled, true, 'return cannot be before departure');
    assert.match(text(returning.closest('.field').querySelector('.error')), /cannot be before/);
    assert.ok(returning.getAttribute('aria-describedby'));

    user.type(returning, '21.03.2030');
    assert.equal(book.disabled, false);
    assert.equal(returning.closest('.field').querySelector('.error'), null);
    assert.equal(returning.hasAttribute('aria-describedby'), false);
    user.click(book);
    assert.equal(text('flight-message'), 'You have booked a return flight departing 14.03.2030 and returning 21.03.2030.');

    user.select(kind, 'one-way');
    assert.equal($('flight-message'), null, 'changing the form clears the confirmation');
    user.type(returning, 'garbage');
    assert.equal(returning.getAttribute('aria-invalid'), 'false', 'a disabled return field is never flagged');
    user.click(book);
    assert.equal(text('flight-message'), 'You have booked a one-way flight on 14.03.2030.');
});

test('timer advances with real elapsed time, reacts to the duration, and stops on dispose', t => {
    const clock = fakeClock();
    const { window, $, text, user } = openApp(t, '7guis', { hash: '#/timer', before: clock.install });
    const gauge = $('timer-gauge');
    const bar = gauge.querySelector('span');

    assert.equal(clock.intervals.size, 1);
    assert.equal(text('timer-elapsed'), '0.0s');
    clock.advance(3000);
    assert.equal(text('timer-elapsed'), '3.0s');
    assert.equal(bar.style.width, '20%');
    assert.equal(gauge.getAttribute('aria-valuenow'), '3.0');
    assert.equal(gauge.getAttribute('aria-valuemax'), '15');

    clock.advance(20000);
    assert.equal(text('timer-elapsed'), '15.0s', 'elapsed stops at the duration');
    assert.ok(gauge.classList.contains('done'));

    user.type($('timer-duration'), '20');
    assert.equal(bar.style.width, '75%', 'the gauge reflects the new duration immediately');
    assert.equal(gauge.classList.contains('done'), false);
    clock.advance(2000);
    assert.equal(text('timer-elapsed'), '17.0s', 'raising the duration resumes the timer');

    user.type($('timer-duration'), '10');
    assert.equal(text('timer-elapsed'), '10.0s', 'lowering the duration clamps the display');
    assert.equal(bar.style.width, '100%');

    user.click($('timer-reset'));
    assert.equal(text('timer-elapsed'), '0.0s');
    clock.advance(1500);
    assert.equal(text('timer-elapsed'), '1.5s');

    window.guisApp.app.dispose();
    assert.equal(clock.intervals.size, 0, 'component cleanup clears the interval');
});

test('CRUD filters, selects, creates, updates, and deletes people', t => {
    const { $, $$, user } = openApp(t, '7guis', { hash: '#/crud' });
    const list = $('crud-list');
    const options = () => $$('[data-testid="crud-list"] option').map(option => option.textContent);
    const [create, update, remove] = ['crud-create', 'crud-update', 'crud-delete'].map(id => $(id));

    assert.deepEqual(options(), ['Emil, Hans', 'Mustermann, Max', 'Tisch, Roman']);
    assert.equal(create.disabled, true);
    assert.equal(update.disabled, true);
    assert.equal(remove.disabled, true);

    user.select(list, '2');
    assert.equal($('crud-name').value, 'Max');
    assert.equal($('crud-surname').value, 'Mustermann');
    assert.equal(update.disabled, false);
    assert.equal(remove.disabled, false);

    const tisch = $$('[data-testid="crud-list"] option')[2];
    user.type($('crud-name'), 'Maxine');
    user.click(update);
    assert.deepEqual(options(), ['Emil, Hans', 'Mustermann, Maxine', 'Tisch, Roman']);
    assert.equal($$('[data-testid="crud-list"] option')[2], tisch, 'keyed options are reused');
    assert.equal(list.value, '2', 'selection survives the update');

    user.type($('crud-name'), 'Lara');
    user.type($('crud-surname'), 'Emmerich');
    user.click(create);
    assert.deepEqual(options(), ['Emil, Hans', 'Mustermann, Maxine', 'Tisch, Roman', 'Emmerich, Lara']);
    assert.equal(list.value, '4', 'the new person is selected');

    user.type($('crud-prefix'), 'em');
    assert.deepEqual(options(), ['Emil, Hans', 'Emmerich, Lara'], 'case-insensitive surname prefix filter');
    assert.equal(list.value, '4');

    user.select(list, '1');
    user.type($('crud-prefix'), 'T');
    assert.deepEqual(options(), ['Tisch, Roman']);
    assert.equal(list.selectedIndex, -1, 'a filtered-out selection is cleared');
    assert.equal(update.disabled, true);
    assert.equal(remove.disabled, true);

    user.select(list, '3');
    user.click(remove);
    assert.deepEqual(options(), []);
    assert.equal($('crud-name').value, '');
    user.type($('crud-prefix'), '');
    assert.deepEqual(options(), ['Emil, Hans', 'Mustermann, Maxine', 'Emmerich, Lara']);

    user.type($('crud-name'), '   ');
    user.type($('crud-surname'), 'Blank');
    assert.equal(create.disabled, true, 'whitespace names are incomplete');
});

test('circle drawer draws, resizes through a dialog, and undoes in single steps', t => {
    const { window, document, $, $$, user } = openApp(t, '7guis', { hash: '#/circles' });
    const canvas = $('circles-canvas');
    const pointer = (type, x, y, init = {}) => {
        const event = new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, ...init });
        canvas.dispatchEvent(event);
        return event;
    };
    const circles = () => $$('[data-testid="circles-canvas"] circle')
        .map(circle => ['cx', 'cy', 'r'].map(name => Number(circle.getAttribute(name))));

    assert.equal(circles().length, 0);
    assert.equal($('circles-undo').disabled, true);

    pointer('click', 50, 60);
    pointer('click', 200, 120);
    assert.deepEqual(circles(), [[50, 60, 15], [200, 120, 15]]);
    assert.equal(canvas.querySelector('circle').namespaceURI, 'http://www.w3.org/2000/svg');
    assert.equal(canvas.querySelector('title').textContent, '2 circles');

    pointer('click', 55, 62);
    assert.equal(circles().length, 2, 'clicking inside a circle selects it instead of drawing');
    pointer('pointermove', 52, 58);
    assert.deepEqual($$('circle.selected').map(circle => circle.getAttribute('cx')), ['50']);
    pointer('pointermove', 400, 300);
    assert.equal($$('circle.selected').length, 0);

    const first = canvas.querySelector('circle');
    const menuEvent = pointer('contextmenu', 200, 125);
    assert.equal(menuEvent.defaultPrevented, true);
    assert.ok($('circles-menu'));
    assert.equal(document.activeElement, $('circles-adjust'), 'the menu item receives focus');
    user.key('Escape', { target: $('circles-adjust') });
    assert.equal($('circles-menu'), null);

    pointer('contextmenu', 200, 125);
    user.click($('circles-adjust'));
    assert.equal($('circles-menu'), null);
    assert.ok($('circles-dialog'));
    assert.match($('circles-dialog').textContent, /circle at \(200, 120\)/);
    assert.equal(document.activeElement, $('circles-diameter'));
    assert.equal($('circles-diameter').value, '30');

    for (const value of ['40', '60', '90']) user.type($('circles-diameter'), value);
    assert.deepEqual(circles()[1], [200, 120, 45], 'the radius follows the slider live');
    pointer('click', 300, 300);
    assert.equal(circles().length, 2, 'the canvas ignores clicks while the dialog is open');
    user.click($('circles-done'));
    assert.equal($('circles-dialog'), null);

    user.click($('circles-undo'));
    assert.deepEqual(circles(), [[50, 60, 15], [200, 120, 15]], 'a whole adjustment is one undo step');
    assert.equal(canvas.querySelector('circle'), first, 'keyed circles survive history restores');
    user.click($('circles-undo'));
    assert.deepEqual(circles(), [[50, 60, 15]]);

    const shortcut = (key, init) => user.key(key, { target: canvas, ctrlKey: true, ...init });
    assert.equal(shortcut('z', { shiftKey: true, key: 'Z' }).defaultPrevented, true);
    assert.equal(circles().length, 2);
    shortcut('y');
    assert.deepEqual(circles()[1], [200, 120, 45]);
    assert.equal($('circles-redo').disabled, true);

    shortcut('z');
    pointer('click', 10, 10);
    assert.equal($('circles-redo').disabled, true, 'a new action discards the redo branch');
    assert.deepEqual(circles(), [[50, 60, 15], [200, 120, 15], [10, 10, 15]]);

    pointer('contextmenu', 200, 125);
    user.click($('circles-adjust'));
    user.click($('circles-done'));
    shortcut('z');
    assert.equal(circles().length, 2, 'opening and closing the dialog without changes adds no history');
});

test('cells evaluates formulas with fine-grained propagation, ranges, errors, and cycles', t => {
    const { window, document, $, text, user } = openApp(t, '7guis', { hash: '#/cells' });
    const cell = id => document.querySelector(`[data-cell="${id}"]`);
    const editor = $('cells-editor');
    const enter = (id, source) => {
        user.click(cell(id));
        user.dblclick(cell(id));
        assert.equal(document.activeElement, editor);
        user.type(editor, source);
        user.key('Enter', { target: editor });
    };

    assert.equal(document.querySelectorAll('td[data-cell]').length, 26 * 100);
    assert.equal(text('cells-address'), 'A0');
    assert.equal(cell('A0').tabIndex, 0);
    assert.equal(cell('B0').tabIndex, -1);

    enter('A0', '5');
    assert.equal(text('cells-address'), 'A1', 'Enter commits and moves down');
    assert.equal(document.activeElement, cell('A1'));
    enter('A1', '7');
    enter('A2', '=A0*A1+1');
    enter('B0', '=SUM(A0:A2)');
    enter('B1', '=AVG(A0:A1)');
    enter('B2', 'hello');
    assert.equal(text(cell('A2')), '36');
    assert.equal(text(cell('B0')), '48');
    assert.equal(text(cell('B1')), '6');
    assert.ok(cell('A2').classList.contains('number'));
    assert.equal(text(cell('B2')), 'hello');

    const changed = new Set();
    const observer = new window.MutationObserver(records => {
        for (const record of records) {
            const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
            const owner = target.closest('td');
            if (owner) changed.add(owner.dataset.cell);
        }
    });
    observer.observe($('cells-sheet'), { subtree: true, childList: true, characterData: true, attributes: true });
    enter('A0', '6');
    return Promise.resolve().then(() => {
        observer.disconnect();
        // A0 is edited, B3 loses the active highlight and A1 gains it; everything else must stay untouched.
        for (const id of ['A0', 'A1', 'B3']) changed.delete(id);
        assert.deepEqual([...changed].sort(), ['A2', 'B0', 'B1'], 'only dependent cells update');
        assert.equal(text(cell('B0')), '56');

        enter('C0', '=A0/0');
        enter('C1', '=FOO(A0)');
        enter('C2', '=Z100');
        enter('C3', '=B2+1');
        enter('C4', '=(1+');
        enter('C5', '=C0+1');
        assert.deepEqual(['C0', 'C1', 'C2', 'C3', 'C4', 'C5'].map(id => text(cell(id))),
            ['#DIV/0!', '#NAME?', '#REF!', '#VALUE!', '#ERROR!', '#DIV/0!']);
        assert.ok(cell('C0').classList.contains('error'));

        enter('D0', '=D1+1');
        enter('D1', '=D0+1');
        assert.equal(text(cell('D0')), '#CYCLE!');
        assert.equal(text(cell('D1')), '#CYCLE!');
        enter('D1', '10');
        assert.equal(text(cell('D0')), '11', 'breaking the cycle recovers');

        user.click(cell('D0'));
        assert.equal(editor.value, '=D1+1', 'the formula bar shows the active formula');
        user.key('ArrowRight', { target: cell('D0') });
        assert.equal(text('cells-address'), 'E0');
        assert.equal(document.activeElement, cell('E0'));
        user.key('ArrowLeft', { target: cell('E0') });
        user.key('Delete', { target: cell('D0') });
        assert.equal(text(cell('D0')), '');

        user.key('=', { target: cell('D0') });
        assert.equal(document.activeElement, editor, 'typing on a cell starts editing');
        assert.equal(editor.value, '=');
        user.type(editor, '=D1*3');
        user.key('Escape', { target: editor });
        assert.equal(text(cell('D0')), '', 'Escape cancels the edit');
        assert.equal(document.activeElement, cell('D0'));

        user.click(cell('E5'));
        user.dblclick(cell('E5'));
        user.type(editor, '=MAX(A0:A2)-MIN(A0:A2)+COUNT(A0:B2)+PROD(A0,2)');
        user.click(cell('F5'));
        assert.equal(text(cell('E5')), String(43 - 6 + 5 + 12), 'moving away commits the draft');
    });
});
