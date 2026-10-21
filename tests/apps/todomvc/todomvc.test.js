import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openApp, assertStandaloneAssets } from '../harness.js';

const NAME = 'todomvc';
const KEY = 'brio-apps:todos';

function todos(t, { saved, hash } = {}) {
    const app = openApp(t, NAME, {
        hash,
        before: saved === undefined ? undefined : window => window.localStorage.setItem(KEY, JSON.stringify(Array.isArray(saved) ? { todos: saved } : saved)),
    });
    const { $, $$, user, window } = app;
    const rows = () => $$('.todo');
    const titles = () => rows().map(row => row.querySelector('label').textContent);
    const row = title => rows().find(item => item.querySelector('label').textContent === title);
    const stored = () => JSON.parse(window.localStorage.getItem(KEY)).todos;
    const add = (...items) => {
        for (const title of items) {
            user.type($('new-todo'), title);
            user.key('Enter', { target: $('new-todo') });
        }
    };
    const navigate = hash => {
        window.location.hash = hash;
        window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    };
    const editor = () => window.document.querySelector('.todo .edit');
    return { ...app, rows, titles, row, stored, add, navigate, editor };
}

const seed = [
    { id: 'a', title: 'Buy oat milk', completed: false },
    { id: 'b', title: 'Book dentist', completed: true },
    { id: 'c', title: 'Water the plants', completed: false },
];

test('TodoMVC: page assets resolve when opened directly', () => {
    assertStandaloneAssets(NAME);
});

test('TodoMVC: an empty list hides the main section and footer', t => {
    const { $, rows } = todos(t);
    assert.equal(rows().length, 0);
    assert.equal($('main'), null, 'main and footer are not rendered without todos');
    assert.equal($('toggle-all').disabled, true);
    assert.equal($('new-todo').hasAttribute('autofocus'), true);
});

test('TodoMVC: adds trimmed todos, ignores blanks, and pluralizes the counter', t => {
    const { $, text, titles, add, stored } = todos(t);

    add('  Buy oat milk  ');
    assert.deepEqual(titles(), ['Buy oat milk']);
    assert.equal($('new-todo').value, '', 'input clears after adding');
    assert.equal(text('count'), '1 item left');

    add('', '    ', 'Book dentist');
    assert.deepEqual(titles(), ['Buy oat milk', 'Book dentist'], 'blank titles are ignored; new todos append');
    assert.equal(text('count'), '2 items left');
    assert.deepEqual(stored().map(todo => [todo.title, todo.completed]), [['Buy oat milk', false], ['Book dentist', false]]);
    assert.equal(new Set(stored().map(todo => todo.id)).size, 2, 'ids are unique');
});

test('TodoMVC: toggling one todo and toggling all stay in sync', t => {
    const { $, rows, row, text, stored } = todos(t, { saved: seed });
    const toggle = title => row(title).querySelector('.toggle');

    assert.deepEqual(rows().map(item => item.classList.contains('completed')), [false, true, false]);
    assert.equal(toggle('Book dentist').checked, true, 'checkbox reflects saved state');
    assert.equal(text('count'), '2 items left');
    assert.equal($('toggle-all').checked, false);

    toggle('Buy oat milk').click();
    toggle('Water the plants').click();
    assert.equal(text('count'), '0 items left');
    assert.equal($('toggle-all').checked, true, 'toggle-all is checked once every todo is complete');

    $('toggle-all').click();
    assert.deepEqual(rows().map(item => item.classList.contains('completed')), [false, false, false]);
    assert.deepEqual(rows().map(item => item.querySelector('.toggle').checked), [false, false, false]);
    assert.equal(text('count'), '3 items left');

    $('toggle-all').click();
    assert.deepEqual(stored().map(todo => todo.completed), [true, true, true]);
    assert.equal($('clear-completed').hidden, false);
});

test('TodoMVC: double-click edits in place; Enter saves, Escape cancels, blur saves, blank deletes', t => {
    const { user, row, titles, editor, document, rows, stored } = todos(t, { saved: seed });
    const original = row('Buy oat milk');

    user.dblclick(original.querySelector('label'));
    assert.ok(editor(), 'editor appears');
    assert.equal(document.activeElement, editor(), 'editor receives focus within the same handler');
    assert.equal(editor().value, 'Buy oat milk');
    assert.equal(original.classList.contains('editing'), true);
    assert.equal(rows().filter(item => item.classList.contains('editing')).length, 1);

    user.type(editor(), '  Buy oat milk and bread  ');
    user.key('Enter', { target: editor() });
    assert.equal(editor(), null);
    assert.deepEqual(titles(), ['Buy oat milk and bread', 'Book dentist', 'Water the plants']);
    assert.equal(row('Buy oat milk and bread'), original, 'the edited row keeps its DOM identity');

    user.dblclick(row('Book dentist').querySelector('label'));
    user.type(editor(), 'Something else');
    user.key('Escape', { target: editor() });
    user.leave(document.body);
    assert.equal(editor(), null);
    assert.equal(titles()[1], 'Book dentist', 'Escape discards the draft');

    user.dblclick(row('Water the plants').querySelector('label'));
    user.type(editor(), 'Water the ferns');
    editor().dispatchEvent(new document.defaultView.FocusEvent('blur'));
    assert.equal(editor(), null);
    assert.equal(titles()[2], 'Water the ferns', 'blur saves');

    user.dblclick(row('Book dentist').querySelector('label'));
    user.type(editor(), '   ');
    user.key('Enter', { target: editor() });
    assert.deepEqual(titles(), ['Buy oat milk and bread', 'Water the ferns'], 'saving a blank title deletes the todo');
    assert.deepEqual(stored().map(todo => todo.title), ['Buy oat milk and bread', 'Water the ferns']);
});

test('TodoMVC: hash routes filter keyed rows without recreating them', t => {
    const { $, $$, rows, row, titles, navigate, text } = todos(t, { saved: seed, hash: '#/active' });
    const selected = () => $$('.filters a.selected').map(link => link.textContent);

    assert.deepEqual(titles(), ['Buy oat milk', 'Water the plants'], 'initial hash selects the filter');
    assert.deepEqual(selected(), ['Active']);
    assert.equal($('filter-active').getAttribute('aria-current'), 'page');
    assert.equal($('filter-all').hasAttribute('aria-current'), false);
    assert.equal($('filter-all').getAttribute('href'), '#/');
    const milk = row('Buy oat milk');
    const plants = row('Water the plants');

    navigate('#/');
    assert.deepEqual(titles(), ['Buy oat milk', 'Book dentist', 'Water the plants']);
    assert.equal(row('Buy oat milk'), milk, 'rows that stay visible are reused');
    assert.equal(row('Water the plants'), plants);

    navigate('#/active');
    milk.querySelector('.toggle').click();
    assert.deepEqual(titles(), ['Water the plants'], 'completing a todo removes it from the Active view');
    assert.equal(rows()[0], plants);
    assert.equal(text('count'), '1 item left');

    plants.querySelector('.toggle').click();
    assert.equal($('todo-list'), null);
    assert.equal(text('empty-filter'), 'Nothing left to do. 🎉');

    navigate('#/completed');
    assert.deepEqual(titles(), ['Buy oat milk', 'Book dentist', 'Water the plants']);
    navigate('#/nonsense');
    assert.deepEqual(selected(), ['All'], 'unknown routes fall back to All');
});

test('TodoMVC: deleting and clearing completed keeps the remaining rows', t => {
    const { $, user, row, titles, text, stored, rows } = todos(t, { saved: seed });
    const plants = row('Water the plants');

    assert.equal(text('clear-completed'), 'Clear completed (1)');
    user.click($('clear-completed'));
    assert.deepEqual(titles(), ['Buy oat milk', 'Water the plants']);
    assert.equal(row('Water the plants'), plants);
    assert.equal($('clear-completed').hidden, true, 'hidden when nothing is completed');

    user.click(row('Buy oat milk').querySelector('.destroy'));
    assert.deepEqual(rows(), [plants]);
    user.click(plants.querySelector('.destroy'));
    assert.equal($('main'), null);
    assert.deepEqual(stored(), []);
});

test('TodoMVC: restores saved todos and drops corrupted entries', t => {
    const { titles, stored } = todos(t, { saved: { todos: [...seed, { title: 42 }, null] } });
    assert.deepEqual(titles(), ['Buy oat milk', 'Book dentist', 'Water the plants']);
    assert.equal(stored().length, 3, 'the cleaned list is written back');
});

test('TodoMVC: changes from another tab apply live and local edits keep saving', t => {
    const { window, titles, add, stored, row, text } = todos(t, { saved: seed });
    const plants = row('Water the plants');
    const fromOtherTab = list => window.dispatchEvent(new window.StorageEvent('storage', {
        key: KEY, newValue: JSON.stringify({ todos: list }), storageArea: window.localStorage,
    }));

    fromOtherTab([seed[2], { ...seed[0], completed: true }]);
    assert.deepEqual(titles(), ['Water the plants', 'Buy oat milk'], 'a shorter list from another tab replaces this one');
    assert.equal(row('Water the plants'), plants, 'keyed rows survive the remote update');
    assert.equal(text('count'), '1 item left');

    add('Call mom');
    assert.deepEqual(stored().map(todo => todo.title), ['Water the plants', 'Buy oat milk', 'Call mom'],
        'this tab keeps persisting after a remote update');
});
