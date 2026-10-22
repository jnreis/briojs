import assert from 'node:assert/strict';
import test from 'node:test';
import { assertStandaloneAssets, deferred, openApp, settle } from '../harness.js';

/** Copies values out of the jsdom realm so deepStrictEqual compares structure, not Array prototypes. */
const plain = value => JSON.parse(JSON.stringify(value));

/** Opens the board with an instant mock server. `gate(method, path)` may return a promise that holds that request. */
function open(t, hash = '', { gate } = {}) {
    const page = openApp(t, 'kanban', {
        hash,
        before(window) {
            // jsdom has no Fetch API; the mock server builds real Response objects.
            window.Headers = Headers;
            window.Response = Response;
            window.kanbanLatency = 0;
            window.confirm = () => true;
        },
    });
    const { window, $, $$, text, user } = page;
    const server = window.kanbanServer;
    if (gate) {
        const original = window.fetch;
        window.fetch = async (input, init = {}) => {
            await gate((init.method ?? 'GET').toUpperCase(), new URL(String(input), window.location.href).pathname);
            return original(input, init);
        };
    }
    const waitFor = async (check, message = 'condition') => {
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline) {
            const value = check();
            if (value) return value;
            await new Promise(resolve => setTimeout(resolve, 2));
        }
        assert.fail(`Timed out waiting for ${message}`);
    };
    const list = title => $$('[data-testid="list"]').find(element => text(element.querySelector('[data-testid="list-title"], input')) === title ||
        element.querySelector('input')?.value === title);
    const titles = name => [...list(name).querySelectorAll('[data-testid="card-title"]')].map(element => element.textContent);
    const card = title => $$('[data-testid="card"]').find(element => text(element.querySelector('[data-testid="card-title"]')) === title);
    const host = title => card(title).closest('kanban-card');
    const listTitles = () => $$('[data-testid="list-title"]').map(element => element.textContent);
    const saved = () => waitFor(() => text('sync-status') === 'All changes saved' && !window.kanbanApp.sync.saving, 'all changes to save');
    const ready = () => waitFor(() => $$('[data-testid="card"]').length && window.kanbanApp.sync.connection === 'live', 'the board');
    const serverCard = id => server.cards.get(id);
    const serverOrder = listId => [...server.cards.values()].filter(entry => entry.listId === listId)
        .sort((a, b) => a.position - b.position).map(entry => entry.title);
    const fire = (target, type, init = {}) => {
        const event = new window.MouseEvent(type, { bubbles: true, cancelable: true, ...init });
        target.dispatchEvent(event);
        window.brio.flush();
        return event;
    };
    /** Drags with native drag events. jsdom has no layout, so clientY -1 means "upper half" and 1 "lower half". */
    const drag = (source, steps) => {
        fire(source, 'dragstart');
        for (const [target, init] of steps) fire(target, 'dragover', init);
        const last = steps.at(-1)?.[0] ?? source;
        fire(last, 'drop');
        fire(source, 'dragend');
    };
    const key = (target, name, init) => {
        const event = user.key(name, { target, ...init });
        window.brio.flush();
        return event;
    };
    return { ...page, server, waitFor, list, titles, card, host, listTitles, saved, ready, serverCard, serverOrder, fire, drag, key };
}

test('the board loads with lists, cards, labels, badges, and the team', async t => {
    const app = open(t);
    assert.ok(app.$('loading'), 'a loading state shows first');
    await app.ready();
    assert.equal(app.text('board-title'), 'Website relaunch');
    assert.equal(app.document.title, 'Website relaunch · Brio Boards');
    assert.deepEqual(app.listTitles(), ['Backlog', 'To do', 'In progress', 'Review', 'Done']);
    assert.deepEqual(app.$$('[data-testid="list-count"]').map(app.text), ['4', '3', '2', '1', '2']);
    assert.deepEqual(app.titles('To do'), ['Design onboarding checklist', 'Fix broken links in footer', 'Write launch blog post']);
    assert.deepEqual(app.$$('.members .avatar').map(app.text), ['YO', 'GH', 'AL']);
    assert.equal(app.text('sync-status'), 'All changes saved');

    const links = app.card('Fix broken links in footer');
    assert.deepEqual([...links.querySelectorAll('.label-bar')].map(bar => bar.title), ['Bug', 'Urgent']);
    assert.ok(links.querySelector('[data-testid="due-badge"]').classList.contains('overdue'));
    assert.ok(app.card('New navigation menu').querySelector('[data-testid="due-badge"]').classList.contains('soon'));
    assert.equal(app.text(app.card('New navigation menu').querySelector('[data-testid="checklist-badge"]')), '☑ 2/4');
    assert.ok(app.card('Accessibility pass on forms').querySelector('[data-testid="checklist-badge"]').classList.contains('complete'));
    assert.equal(app.card('Design onboarding checklist').getAttribute('href'), '#/card/c5');
    assert.equal(app.card('Design onboarding checklist').querySelector('[data-testid="due-badge"]').className, 'badge', 'three days out is not "soon"');
    assert.equal(app.document.querySelector('#app').hasAttribute('b-cloak'), false);
    assert.equal(app.$('outlet').children.length, 0, 'the component-less "/" route leaves the outlet empty');
});

test('cards are added from the composer, which stays open for the next card', async t => {
    const app = open(t);
    await app.ready();
    app.user.click(app.list('Review').querySelector('[data-testid="add-card"]'));
    const composer = app.list('Review').querySelector('[data-testid="card-composer"]');
    assert.equal(app.document.activeElement, composer, 'the composer is focused');
    app.user.type(composer, '   ');
    app.key(composer, 'Enter');
    assert.equal(app.titles('Review').length, 1, 'blank titles are ignored');
    app.user.type(composer, 'Check color contrast');
    app.key(composer, 'Enter');
    assert.deepEqual(app.titles('Review'), ['Accessibility pass on forms', 'Check color contrast'], 'the card appears immediately');
    assert.equal(composer.value, '');
    assert.equal(app.document.activeElement, app.list('Review').querySelector('[data-testid="card-composer"]'));
    await app.saved();
    assert.deepEqual(app.serverOrder('review'), ['Accessibility pass on forms', 'Check color contrast']);
    assert.equal(app.text(app.list('Review').querySelector('[data-testid="list-count"]')), '2');
    app.key(app.list('Review').querySelector('[data-testid="card-composer"]'), 'Escape');
    assert.ok(app.list('Review').querySelector('[data-testid="add-card"]'), 'Escape closes the composer');
    await app.waitFor(() => /You added “Check color contrast” to Review/.test(app.text('activity')), 'the activity entry');
});

test('lists are renamed in place, reordered from their menu, added, and deleted', async t => {
    const app = open(t);
    await app.ready();
    app.user.click(app.list('Review').querySelector('[data-testid="list-title"]'));
    const input = app.list('Review').querySelector('[data-testid="list-title-input"]');
    assert.equal(app.document.activeElement, input);
    app.user.type(input, 'QA');
    app.key(input, 'Enter');
    assert.ok(app.list('QA'), 'the new title shows immediately');
    await app.saved();
    assert.equal(app.server.lists.get('review').title, 'QA');

    app.user.click(app.list('QA').querySelector('[data-testid="list-title"]'));
    const renaming = app.list('QA').querySelector('input');
    app.user.type(renaming, 'Something else');
    app.key(renaming, 'Escape');
    assert.ok(app.list('QA'), 'Escape cancels a rename');

    // The menu opens from a click; the same click must not count as an outside click that closes it again.
    app.user.click(app.list('QA').querySelector('[data-testid="list-menu"]'));
    assert.ok(app.list('QA').querySelector('[role="menu"]'), 'the list menu opens');
    app.user.click(app.$('board-title'));
    assert.equal(app.list('QA').querySelector('[role="menu"]'), null, 'clicking elsewhere closes the menu');
    app.user.click(app.list('Backlog').querySelector('[data-testid="list-menu"]'));
    assert.equal(app.list('Backlog').querySelector('[data-testid="move-list-left"]').disabled, true);
    app.key(app.document.body, 'Escape');
    assert.equal(app.list('Backlog').querySelector('[role="menu"]'), null, 'Escape closes the menu');

    app.user.click(app.list('QA').querySelector('[data-testid="list-menu"]'));
    app.user.click(app.list('QA').querySelector('[data-testid="move-list-left"]'));
    assert.deepEqual(app.listTitles(), ['Backlog', 'To do', 'QA', 'In progress', 'Done']);
    await app.saved();
    const serverLists = () => [...app.server.lists.values()].sort((a, b) => a.position - b.position).map(entry => entry.title);
    assert.deepEqual(serverLists(), ['Backlog', 'To do', 'QA', 'In progress', 'Done']);

    app.user.click(app.$('add-list'));
    assert.equal(app.document.activeElement, app.$('new-list-title'));
    app.user.type(app.$('new-list-title'), 'Ideas');
    app.$('list-composer').requestSubmit();
    await app.saved();
    assert.equal(app.listTitles().at(-1), 'Ideas');
    assert.deepEqual(serverLists().at(-1), 'Ideas');
    assert.equal(app.text(app.list('Ideas')).includes('No cards yet'), true);

    let asked = '';
    app.window.confirm = message => {
        asked = message;
        return true;
    };
    app.user.click(app.list('In progress').querySelector('[data-testid="list-menu"]'));
    app.user.click(app.list('In progress').querySelector('[data-testid="delete-list"]'));
    assert.equal(asked, 'Delete “In progress” and its 2 cards?');
    assert.equal(app.list('In progress'), undefined);
    await app.saved();
    assert.equal(app.server.lists.has('doing'), false);
    assert.equal(app.serverCard('c8'), undefined, 'the server deletes the cards with the list');
});

test('cards drag within a list, across lists, into empty space, and lists drag to reorder', async t => {
    const app = open(t);
    await app.ready();
    const board = app.$('board');

    app.drag(app.card('Localize checkout (DE, FR)'), [[app.host('Dark mode for docs'), { clientY: -1 }]]);
    assert.deepEqual(app.titles('Backlog'), ['Audit pricing page copy', 'Localize checkout (DE, FR)', 'Dark mode for docs', 'Investigate slow search on mobile']);
    await app.saved();
    assert.deepEqual(app.serverOrder('backlog'), app.titles('Backlog'));

    // Hovering shows a drop marker; the lower half of a card targets the slot after it.
    const source = app.card('Audit pricing page copy');
    app.fire(source, 'dragstart');
    assert.ok(source.classList.contains('dragging'));
    app.fire(app.host('Fix broken links in footer'), 'dragover', { clientY: 1 });
    assert.ok(app.host('Write launch blog post').classList.contains('drop-before'), 'the marker sits before the next card');
    app.fire(app.host('Write launch blog post'), 'dragover', { clientY: 1 });
    assert.ok(app.list('To do').querySelector('[data-testid="cards"]').classList.contains('drop-end'), 'after the last card marks the list end');
    app.fire(board, 'drop');
    app.fire(source, 'dragend');
    assert.deepEqual(app.titles('To do'), ['Design onboarding checklist', 'Fix broken links in footer', 'Write launch blog post', 'Audit pricing page copy']);
    assert.equal(app.$$('.drop-before, .drop-end').length, 0, 'markers clear on drop');
    await app.saved();
    assert.equal(app.serverCard('c1').listId, 'todo');
    await app.waitFor(() => /You moved “Audit pricing page copy” from Backlog to To do/.test(app.text('activity')), 'the activity entry');

    // Dropping anywhere over a list puts the card at its end.
    app.drag(app.card('Choose typography'), [[app.list('Review').closest('kanban-list'), {}]]);
    assert.deepEqual(app.titles('Review'), ['Accessibility pass on forms', 'Choose typography']);

    // An aborted drag (dragend without drop) changes nothing.
    const before = app.titles('Done');
    app.fire(app.card('Set up analytics dashboard'), 'dragstart');
    app.fire(app.host('Choose typography'), 'dragover', { clientY: -1 });
    app.fire(app.card('Set up analytics dashboard'), 'dragend');
    assert.deepEqual(app.titles('Done'), before);
    assert.equal(app.$$('.drop-before').length, 0);

    // Lists drag by their header; the left half of a list targets the slot before it.
    const header = app.list('Done').querySelector('.list-header');
    app.fire(header, 'dragstart');
    assert.ok(app.list('Done').closest('kanban-list').classList.contains('is-dragged'));
    app.fire(app.list('To do').closest('kanban-list'), 'dragover', { clientX: -1 });
    assert.ok(app.list('To do').closest('kanban-list').classList.contains('drop-before'));
    app.fire(app.host('Write launch blog post'), 'dragover', { clientX: -1 });
    assert.ok(app.list('To do').closest('kanban-list').classList.contains('drop-before'), 'hovering a card while dragging a list targets its list');
    app.fire(board, 'drop');
    app.fire(header, 'dragend');
    assert.deepEqual(app.listTitles(), ['Backlog', 'Done', 'To do', 'In progress', 'Review']);
    await app.saved();
    assert.equal([...app.server.lists.values()].sort((a, b) => a.position - b.position)[1].id, 'done');
});

test('keyboard users pick up a card with Space, move it with arrows, and hear each position', async t => {
    const app = open(t);
    await app.ready();
    const tile = app.card('Write launch blog post');
    tile.focus();
    const space = app.key(tile, ' ');
    assert.equal(space.defaultPrevented, true, 'Space does not scroll or follow the link');
    assert.ok(tile.classList.contains('grabbed'));
    assert.equal(app.text('announcer'), 'Picked up “Write launch blog post”. To do, position 3 of 3. Use the arrow keys to move, Space to drop, Escape to cancel.');
    app.key(tile, 'ArrowUp');
    assert.equal(app.text('announcer'), 'To do, position 2 of 3');
    assert.ok(app.host('Fix broken links in footer').classList.contains('drop-before'));
    app.key(tile, 'ArrowRight');
    assert.equal(app.text('announcer'), 'In progress, position 2 of 3');
    assert.ok(app.host('Migrate images to CDN').classList.contains('drop-before'));
    app.key(tile, 'ArrowDown');
    app.key(tile, 'ArrowDown');
    assert.equal(app.text('announcer'), 'In progress, position 3 of 3', 'moves stop at the end');
    app.key(tile, ' ');
    assert.deepEqual(app.titles('In progress'), ['New navigation menu', 'Migrate images to CDN', 'Write launch blog post']);
    assert.equal(app.text('announcer'), 'Dropped. In progress, position 3 of 3.');
    assert.equal(app.document.activeElement, app.card('Write launch blog post'), 'focus follows the card to its new list');
    await app.saved();
    assert.deepEqual(app.serverOrder('doing'), app.titles('In progress'));

    const moved = app.card('Write launch blog post');
    app.key(moved, ' ');
    app.key(moved, 'ArrowLeft');
    app.key(moved, 'Escape');
    assert.equal(app.text('announcer'), 'Move cancelled.');
    assert.deepEqual(app.titles('In progress'), ['New navigation menu', 'Migrate images to CDN', 'Write launch blog post']);
    assert.equal(app.$$('.grabbed, .drop-before').length, 0);
    assert.equal(app.key(moved, 'ArrowDown').defaultPrevented, false, 'arrows scroll normally when nothing is grabbed');
});

test('edits show before the server answers, and a failed save rolls back with a Retry', async t => {
    const hold = deferred();
    let holding = true;
    const app = open(t, '', { gate: (method) => (method === 'PATCH' && holding ? hold.promise : null) });
    await app.ready();
    app.drag(app.card('Migrate images to CDN'), [[app.list('Review').closest('kanban-list'), {}]]);
    assert.deepEqual(app.titles('Review'), ['Accessibility pass on forms', 'Migrate images to CDN'], 'the move is visible at once');
    assert.equal(app.text('sync-status'), 'Saving…');
    assert.ok(app.card('Migrate images to CDN').querySelector('[data-testid="saving"]'));
    assert.equal(app.serverCard('c9').listId, 'doing', 'the server has not seen it yet');
    holding = false;
    hold.resolve();
    await app.saved();
    assert.equal(app.serverCard('c9').listId, 'review');
    assert.equal(app.card('Migrate images to CDN').querySelector('[data-testid="saving"]'), null);

    app.server.failNext = { status: 500, method: 'PATCH' };
    app.drag(app.card('Migrate images to CDN'), [[app.host('Fix broken links in footer'), { clientY: -1 }]]);
    assert.deepEqual(app.titles('To do'), ['Design onboarding checklist', 'Migrate images to CDN', 'Fix broken links in footer', 'Write launch blog post']);
    await app.waitFor(() => app.$('toast'), 'the error toast');
    assert.deepEqual(app.titles('Review'), ['Accessibility pass on forms', 'Migrate images to CDN'], 'the card returns to where the server has it');
    assert.equal(app.text(app.$('toast').querySelector('p')), 'Couldn\'t move “Migrate images to CDN” from Review to To do. Server is having a bad day.');
    app.user.click(app.$('toast-retry'));
    assert.equal(app.$('toast'), null);
    assert.deepEqual(app.titles('To do').slice(1, 2), ['Migrate images to CDN'], 'Retry repeats the move');
    await app.saved();
    assert.equal(app.serverCard('c9').listId, 'todo');
    assert.deepEqual(app.serverOrder('todo'), app.titles('To do'));
});

test('teammate changes merge in live without overwriting a field you are still saving', async t => {
    const hold = deferred();
    let holding = false;
    const app = open(t, '', { gate: (method) => (method === 'PATCH' && holding ? hold.promise : null) });
    await app.ready();
    const grace = app.server.as('grace');

    grace.updateCard('c2', { title: 'Dark mode for docs and app', labels: ['feature', 'design', 'urgent'] });
    await app.waitFor(() => app.card('Dark mode for docs and app'), 'the teammate edit');
    const tile = app.card('Dark mode for docs and app');
    assert.ok(tile.classList.contains('touched'), 'cards changed by a teammate are highlighted');
    assert.equal(app.text(tile.querySelector('[data-testid="touched-by"]')), 'GH');
    assert.deepEqual([...tile.querySelectorAll('.label-bar')].map(bar => bar.title), ['Feature', 'Design', 'Urgent']);
    assert.match(app.text(app.$$('[data-testid="activity-entry"]')[0]), /^GH Grace Hopper renamed “Dark mode for docs” to “Dark mode for docs and app”/);

    // Our rename of c3 is in flight while Grace changes its title and labels: we keep our title, take her labels.
    holding = true;
    app.window.kanbanApp.actions.updateCard('c3', { title: 'Speed up mobile search' });
    app.window.brio.flush();
    grace.updateCard('c3', { title: 'Grace’s title', labels: ['bug'] });
    await app.waitFor(() => app.card('Speed up mobile search')?.querySelectorAll('.label-bar').length === 1, 'the teammate labels');
    assert.equal(app.card('Speed up mobile search').querySelector('.label-bar').title, 'Bug');
    assert.equal(app.card('Grace’s title'), undefined, 'the in-flight title is protected');
    holding = false;
    hold.resolve();
    await app.saved();
    assert.equal(app.serverCard('c3').title, 'Speed up mobile search', 'the later write wins on the server');
    assert.deepEqual([...app.serverCard('c3').labels], ['bug']);
    assert.ok(app.card('Speed up mobile search'));

    // Moves, new cards, and deletions by teammates.
    grace.updateCard('c4', { listId: 'done', position: 1 });
    app.server.as('ada').createCard('backlog', { id: 'ada-1', title: 'Pick a launch date', position: 99_999 });
    app.server.as('ada').deleteCard('c12');
    await app.waitFor(() => app.titles('Done')[0] === 'Localize checkout (DE, FR)' && app.card('Pick a launch date') && !app.card('Choose typography'), 'remote changes');
    assert.equal(app.titles('Backlog').at(-1), 'Pick a launch date');
    assert.deepEqual(plain(app.window.kanbanApp.sync.activity.slice(0, 3).map(entry => entry.actor)), ['ada', 'ada', 'grace']);
});

test('a card dialog opens from its link, edits nested state, and keeps the tile in sync', async t => {
    const app = open(t);
    await app.ready();
    app.user.click(app.card('Design onboarding checklist'));
    assert.equal(app.window.location.hash, '#/card/c5');
    const dialog = await app.waitFor(() => app.$('card-dialog'), 'the dialog');
    assert.equal(app.$('dialog-title').value, 'Design onboarding checklist');
    assert.equal(app.$('dialog-list').value, 'todo');
    assert.equal(app.text('progress'), '33%');
    const tileBadge = () => app.text(app.card('Design onboarding checklist').querySelector('[data-testid="checklist-badge"]'));

    const items = app.$$('[data-testid="checklist-item"]');
    assert.deepEqual(items.map(app.text), ['Sketch flows ×', 'Review with support ×', 'Hand off to engineering ×']);
    items[1].querySelector('input').click();
    app.window.brio.flush();
    assert.equal(app.text('progress'), '67%');
    assert.equal(tileBadge(), '☑ 2/3', 'the board tile updates from the same state');
    app.user.type(app.$('new-item'), 'Write help article');
    app.$('new-item').form.requestSubmit();
    app.window.brio.flush();
    assert.equal(tileBadge(), '☑ 2/4');
    await app.saved();
    assert.deepEqual(plain(app.serverCard('c5').checklist.map(item => [item.text, item.done])),
        [['Sketch flows', true], ['Review with support', true], ['Hand off to engineering', false], ['Write help article', false]]);

    const urgent = app.$$('[data-testid="label-toggle"]').find(button => button.textContent === 'Urgent');
    assert.equal(urgent.getAttribute('aria-pressed'), 'false');
    app.user.click(urgent);
    assert.equal(urgent.getAttribute('aria-pressed'), 'true');
    assert.deepEqual([...app.card('Design onboarding checklist').querySelectorAll('.label-bar')].map(bar => bar.title), ['Design', 'Urgent']);

    app.user.click(app.$('description'));
    assert.equal(app.document.activeElement, app.$('description-input'));
    app.user.type(app.$('description-input'), 'Three steps, one screen each.');
    app.key(app.$('description-input'), 'Escape');
    assert.ok(app.$('card-dialog'), 'Escape in the editor cancels the edit, not the dialog');
    assert.equal(app.text('description'), 'Add a more detailed description…');
    app.user.click(app.$('description'));
    app.user.type(app.$('description-input'), 'Three steps, one screen each.');
    app.user.click(app.$('save-description'));
    assert.equal(app.text('description'), 'Three steps, one screen each.');

    app.$('dialog-title').value = 'Design the onboarding checklist';
    app.$('dialog-title').dispatchEvent(new app.window.Event('change', { bubbles: true }));
    app.user.select(app.$('due-input'), '2030-01-15');
    app.user.select(app.$('dialog-list'), 'review');
    assert.equal(app.titles('Review')[0], 'Design the onboarding checklist', 'moving from the dialog puts the card on top');
    assert.equal(app.text(app.card('Design the onboarding checklist').querySelector('[data-testid="due-badge"]')), '🕑 Jan 15');
    await app.saved();
    assert.deepEqual(
        (({ title, listId, due, description, labels }) => ({ title, listId, due, description, labels: [...labels] }))(app.serverCard('c5')),
        { title: 'Design the onboarding checklist', listId: 'review', due: '2030-01-15', description: 'Three steps, one screen each.', labels: ['design', 'urgent'] });

    app.key(app.document.body, 'Escape');
    assert.equal(app.window.location.hash, '#/');
    assert.equal(app.$('card-dialog'), null);
    assert.ok(dialog);

    // Deep links open the dialog over the board; the overlay closes on a click outside the dialog.
    app.window.location.hash = '#/card/c1';
    await app.waitFor(() => app.$('dialog-title')?.value === 'Audit pricing page copy', 'the c1 dialog');
    app.user.click(app.$('card-dialog').parentElement);
    assert.equal(app.$('card-dialog'), null);
    app.window.location.hash = '#/nowhere';
    await app.waitFor(() => app.window.location.hash === '#/', 'the fallback redirect');
});

test('deleting a card from its dialog, and a teammate deleting the card you have open', async t => {
    const app = open(t, '#/card/c7');
    await app.ready();
    await app.waitFor(() => app.$('dialog-title')?.value === 'Write launch blog post', 'the deep-linked dialog');
    app.user.click(app.$('delete-card'));
    assert.equal(app.$('card-dialog'), null);
    assert.equal(app.card('Write launch blog post'), undefined);
    await app.saved();
    assert.equal(app.serverCard('c7'), undefined);

    app.window.location.hash = '#/card/c6';
    await app.waitFor(() => app.$('dialog-title'), 'the c6 dialog');
    app.server.as('ada').deleteCard('c6');
    await app.waitFor(() => app.$('card-missing'), 'the missing-card message');
    assert.equal(app.text(app.$('card-missing').querySelector('h2')), 'This card was deleted by Ada Lovelace');
    assert.equal(app.$('dialog-title'), null);

    app.window.location.hash = '#/card/nope';
    await app.waitFor(() => app.text(app.$('card-missing')?.querySelector('h2') ?? '') === 'Card not found', 'unknown card');
});

test('going offline fails saves with a Retry, and reconnecting catches up on missed changes', async t => {
    const app = open(t);
    await app.ready();
    app.user.click(app.$('toggle-online'));
    assert.equal(app.text('sync-status'), 'Offline');
    app.server.as('grace').updateCard('c10', { title: 'Accessibility pass (forms + nav)' });
    await settle();
    await settle();
    assert.ok(app.card('Accessibility pass on forms'), 'no notifications arrive while offline');

    app.drag(app.card('Migrate images to CDN'), [[app.list('Done').closest('kanban-list'), {}]]);
    await app.waitFor(() => app.$('toast'), 'the offline toast');
    assert.match(app.text(app.$('toast')), /Couldn't move “Migrate images to CDN” from In progress to Done\. You appear to be offline\./);
    assert.deepEqual(app.titles('In progress'), ['New navigation menu', 'Migrate images to CDN']);

    app.user.click(app.$('toggle-online'));
    await app.waitFor(() => app.card('Accessibility pass (forms + nav)'), 'the missed change');
    assert.equal(app.text('sync-status'), 'All changes saved');
    app.user.click(app.$('toast-retry'));
    await app.saved();
    assert.equal(app.serverCard('c9').listId, 'done');
    assert.equal(app.titles('Done').at(-1), 'Migrate images to CDN');
});

test('filtering by text and labels hides cards, shows counts, and pauses card dragging', async t => {
    const app = open(t);
    await app.ready();
    app.user.type(app.$('filter-text'), 'design');
    assert.deepEqual(app.$$('[data-testid="card-title"]').map(app.text), ['Design onboarding checklist']);
    assert.equal(app.text('filter-summary'), 'Showing 1 of 12 cards Clear filter');
    assert.equal(app.text(app.list('To do').querySelector('[data-testid="list-count"]')), '1 of 3');
    assert.match(app.text(app.list('Backlog')), /No matching cards/);

    app.user.type(app.$('filter-text'), '');
    const chip = name => app.$$('[data-testid="filter-label"]').find(button => button.textContent === name);
    app.user.click(chip('Design'));
    app.user.click(chip('Feature'));
    assert.equal(chip('Design').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(app.$$('[data-testid="card-title"]').map(app.text), ['Dark mode for docs', 'New navigation menu']);

    const start = app.fire(app.card('Dark mode for docs'), 'dragstart');
    assert.equal(start.defaultPrevented, true, 'cards cannot be reordered relative to hidden ones');
    assert.equal(app.text(app.$('toast')), 'Clear the filter to rearrange cards. ×');
    app.key(app.card('Dark mode for docs'), ' ');
    assert.equal(app.window.kanbanApp.dnd.kind, null);

    app.server.as('grace').updateCard('c9', { labels: ['feature', 'design'] });
    await app.waitFor(() => app.card('Migrate images to CDN'), 'a teammate change that now matches');
    assert.equal(app.text('filter-summary'), 'Showing 3 of 12 cards Clear filter');
    app.key(app.$('filter-text'), 'Escape');
    assert.equal(app.$('filter-summary'), null);
    assert.equal(app.$$('[data-testid="card"]').length, 12);
});

test('the activity panel toggles and remembers the preference', async t => {
    const app = open(t);
    await app.ready();
    assert.ok(app.$('activity'));
    app.user.click(app.$('toggle-activity'));
    assert.equal(app.$('activity'), null);
    assert.equal(app.$('toggle-activity').getAttribute('aria-pressed'), 'false');
    assert.equal(app.window.localStorage.getItem('kanban.prefs'), JSON.stringify({ activity: false }));
});

test('the kanban app references only shipped assets', () => {
    assertStandaloneAssets('kanban');
});
