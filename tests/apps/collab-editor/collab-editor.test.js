import assert from 'node:assert/strict';
import test from 'node:test';
import { assertStandaloneAssets, openApp } from '../harness.js';

const plain = value => JSON.parse(JSON.stringify(value));

/** Opens Brio Docs on an in-memory server. `latency` 0 delivers realtime messages on the next timer tick. */
function open(t, hash = '#/d/launch-plan', { latency = 0 } = {}) {
    const page = openApp(t, 'collab-editor', {
        hash,
        before(window) {
            // jsdom has no Fetch API; the mock server builds real Response objects.
            window.Headers = Headers;
            window.Response = Response;
            window.docsLatency = latency;
            window.confirm = () => true;
        },
    });
    const { window, document, $, $$, text } = page;
    const server = window.docsServer;
    const docs = window.docsApp;
    const waitFor = async (check, message = 'condition') => {
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline) {
            const value = check();
            if (value) return value;
            await new Promise(resolve => setTimeout(resolve, 2));
        }
        assert.fail(`Timed out waiting for ${message}`);
    };
    const session = () => docs.editor.doc;
    const input = id => document.querySelector(`[data-block-id="${id}"] textarea`);
    const serverBlock = (doc, id) => server.docs.get(doc).blocks.find(block => block.id === id);
    const clientBlock = id => session().state.blocks.find(block => block.id === id);
    const ready = () => waitFor(() => session()?.state.status === 'ready' && session().joined && $('editor'), 'the document to open');
    /** Everything typed has reached the server and every server change has reached the editor. */
    const synced = (doc = session().id) => waitFor(() => !docs.sync.total && docs.net.status === 'live' &&
        (!docs.sessions.get(doc) || docs.sessions.get(doc).state.rev === server.docs.get(doc).rev), 'the document to sync');
    const flush = () => window.brio.flush();
    /** Types at the caret like a person: the browser edits the value, then fires input. */
    const type = (element, value) => {
        if (document.activeElement !== element) element.focus();
        const { selectionStart: start, selectionEnd: end } = element;
        element.value = element.value.slice(0, start) + value + element.value.slice(end);
        element.setSelectionRange(start + value.length, start + value.length);
        element.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
        flush();
    };
    const caret = (element, start, end = start) => {
        element.focus();
        element.setSelectionRange(start, end);
        element.dispatchEvent(new window.Event('select', { bubbles: true }));
        flush();
    };
    const key = (element, name, init = {}) => {
        const event = new window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
        element.dispatchEvent(event);
        flush();
        return event;
    };
    const navigate = async path => {
        await docs.router.navigate(path);
        flush();
    };
    const toasts = () => $$('[data-testid="toast"]').map(element => text(element.querySelector('p')));
    return { ...page, server, docs, waitFor, session, input, serverBlock, clientBlock, ready, synced, flush, type, caret, key, navigate, toasts };
}

test('collab editor: standalone assets resolve', () => {
    assertStandaloneAssets('collab-editor');
});

test('collab editor: the document list stays live as teammates work', async t => {
    const { $, $$, text, server, waitFor, docs } = open(t, '#/');
    await waitFor(() => $$('[data-testid="doc-card"]').length === 3, 'the documents');
    const titles = () => $$('[data-testid="doc-link"]').map(link => link.textContent);
    assert.deepEqual(titles(), ['Launch plan', 'Weekly sync — notes', 'Writing style guide']);

    const grace = server.teammate('grace');
    grace.enter('style-guide', 'b16', 0);
    await grace.type('style-guide', 'Tip: ', { delay: 0 });
    await waitFor(() => titles()[0] === 'Writing style guide', 'the edited document to move to the top');
    const card = $$('[data-testid="doc-card"]')[0];
    assert.equal(text(card.querySelector('[data-testid="doc-updated-by"]')), 'Grace Hopper');
    assert.equal(card.querySelector('[data-testid="doc-here"]').title, 'Grace Hopper');

    server.teammate('ada').removeDoc('weekly-sync');
    await waitFor(() => titles().length === 2, 'the deleted document to disappear');
    assert.deepEqual(titles(), ['Writing style guide', 'Launch plan']);
    assert.equal(docs.sessions.size, 0, 'the list opens no document sessions');
    assert.equal(text('sync-status'), 'All changes saved');
});

test('collab editor: creating a document opens it with the cursor in the first block', async t => {
    const { $, document, server, waitFor, ready, synced, type, session, user } = open(t, '#/');
    await waitFor(() => $('new-doc-title'), 'the list');
    user.type($('new-doc-title'), 'Q3 roadmap');
    $('new-doc').click();
    await ready();
    assert.equal(session().id, 'q3-roadmap-1');
    assert.equal(document.title, 'Q3 roadmap · Brio Docs');
    await waitFor(() => document.activeElement?.tagName === 'TEXTAREA', 'focus');
    const first = session().state.visible[0].id;
    assert.equal(document.activeElement.closest('[data-block-id]').dataset.blockId, first);
    type(document.activeElement, 'Ship it.');
    await synced();
    assert.equal(server.docs.get('q3-roadmap-1').blocks.find(block => block.id === first).text, 'Ship it.');
});

test('collab editor: typing is sent in small batches and acknowledged', async t => {
    const { $, text, server, ready, synced, input, type, caret, docs } = open(t, '#/d/launch-plan', { latency: 20 });
    await ready();
    const field = input('b8');
    caret(field, field.value.length);
    for (const character of ' Due Friday.') type(field, character);
    assert.equal(text('sync-status'), 'Saving…');
    await synced();
    assert.equal(server.docs.get('launch-plan').blocks.find(block => block.id === 'b8').text, 'Owner: Grace. Reviewers: Ada and you. Due Friday.');
    // One batch goes out at a time; keystrokes typed meanwhile travel together.
    const submits = server.docs.get('launch-plan').log.filter(entry => entry.client === docs.clientId).length;
    assert.ok(submits >= 1 && submits < 12, `typing 12 characters made ${submits} submissions`);
    assert.equal(text('sync-status'), 'All changes saved');
    assert.equal($('word-count').textContent, '52 words');
});

test('collab editor: a teammate typing before your cursor does not move it', async t => {
    const { document, server, ready, synced, input, type, caret, waitFor } = open(t);
    await ready();
    const field = input('b2');
    caret(field, 4); // "Ship| the new onboarding flow…"
    server.teammate('grace').enter('launch-plan', 'b2', 0);
    await server.teammate('grace').type('launch-plan', 'Please ', { delay: 0 });
    await waitFor(() => field.value.startsWith('Please Ship'), 'the remote edit');
    assert.equal(document.activeElement, field, 'focus stays');
    assert.deepEqual([field.selectionStart, field.selectionEnd], [11, 11], 'the cursor stays between "Ship" and " the"');
    type(field, ' it');
    await synced();
    assert.ok(field.value.startsWith('Please Ship it the new'), field.value);
    assert.equal(server.docs.get('launch-plan').blocks.find(block => block.id === 'b2').text, field.value);
});

test('collab editor: a selection survives a teammate deleting text before it', async t => {
    const { server, ready, input, caret, waitFor } = open(t);
    await ready();
    const field = input('b8'); // "Owner: Grace. Reviewers: Ada and you."
    caret(field, 14, 23); // "Reviewers"
    server.teammate('ada').edit('launch-plan', [{ t: 'del', b: 'b8', p: 0, n: 7 }]);
    await waitFor(() => field.value.startsWith('Grace.'), 'the remote delete');
    assert.equal(field.value.slice(field.selectionStart, field.selectionEnd), 'Reviewers');
});

test('collab editor: concurrent typing in one block converges for everyone', async t => {
    const { server, ready, synced, input, type, caret, clientBlock } = open(t, '#/d/launch-plan', { latency: 16 });
    await ready();
    const field = input('b8');
    caret(field, field.value.length);
    const grace = server.teammate('grace').enter('launch-plan', 'b8', 0);
    const remote = grace.type('launch-plan', 'NOTE: ', { delay: 3 });
    for (const character of ' Thanks!') {
        type(field, character);
        await new Promise(resolve => setTimeout(resolve, 4));
    }
    await remote;
    await synced();
    const expected = 'NOTE: Owner: Grace. Reviewers: Ada and you. Thanks!';
    assert.equal(server.docs.get('launch-plan').blocks.find(block => block.id === 'b8').text, expected);
    assert.equal(clientBlock('b8').text, expected);
    assert.equal(field.value, expected);
    assert.equal(field.selectionStart, expected.length, 'your cursor stays after your own text');
});

test('collab editor: teammates\' cursors are drawn where they are, even past your unsaved typing', async t => {
    const { $, $$, server, ready, synced, input, type, caret, waitFor, text } = open(t);
    await ready();
    server.teammate('grace').enter('launch-plan', 'b2', 4);
    const mark = () => $$('[data-block-id="b2"] .remote-caret')[0];
    await waitFor(mark, 'Grace\'s cursor');
    const before = () => {
        const parts = $$('[data-block-id="b2"] [data-testid="mirror-part"]');
        return parts.slice(0, parts.indexOf(mark())).map(part => part.textContent).join('');
    };
    assert.equal(mark().dataset.name, 'Grace');
    assert.equal(mark().style.getPropertyValue('--who'), '#0f766e');
    assert.equal(before(), 'Ship');
    assert.ok($('editor').querySelector('[data-block-id="b2"]').classList.contains('has-editor'));
    assert.deepEqual($$('[data-testid="person"]').map(person => person.title), ['You', 'Grace Hopper']);

    server.setOnline(false);
    await waitFor(() => text('sync-status') === 'Offline · edits are kept', 'offline');
    const field = input('b2');
    caret(field, 0);
    type(field, '>> ');
    // Offline there is no presence at all; back online, the cursor returns after your text.
    assert.equal(mark(), undefined);
    server.setOnline(true);
    server.teammate('grace').enter('launch-plan', 'b2', 4);
    await synced();
    await waitFor(() => mark() && before() === '>> Ship', 'Grace\'s cursor after your text');
    server.teammate('grace').leave('launch-plan');
    await waitFor(() => !mark(), 'Grace to leave');
    assert.deepEqual($$('[data-testid="person"]').map(person => person.title), ['You']);
});

test('collab editor: offline edits sync on reconnect, merged with teammates\' work', async t => {
    const { server, ready, synced, input, type, caret, waitFor, text, clientBlock, window } = open(t);
    await ready();
    server.setOnline(false);
    await waitFor(() => text('sync-status') === 'Offline · edits are kept', 'offline');
    const field = input('b2');
    caret(field, field.value.length);
    type(field, ' (draft)');
    server.teammate('ada').edit('launch-plan', [{ t: 'ins', b: 'b2', p: 0, s: 'Goal: ' }, { t: 'ins', b: 'b8', p: 0, s: '★ ' }]);
    const leave = new window.Event('beforeunload', { cancelable: true });
    window.dispatchEvent(leave);
    assert.equal(leave.defaultPrevented, true, 'closing the tab warns about unsaved changes');

    server.setOnline(true);
    await synced();
    const expected = 'Goal: Ship the new onboarding flow to every workspace by the end of the quarter. (draft)';
    assert.equal(server.docs.get('launch-plan').blocks.find(block => block.id === 'b2').text, expected);
    assert.equal(field.value, expected);
    assert.equal(clientBlock('b8').text, '★ Owner: Grace. Reviewers: Ada and you.');
    assert.equal(text('sync-status'), 'All changes saved');
    const after = new window.Event('beforeunload', { cancelable: true });
    window.dispatchEvent(after);
    assert.equal(after.defaultPrevented, false);
});

test('collab editor: a change whose acknowledgement was lost is applied exactly once', async t => {
    const { server, ready, synced, input, type, caret, waitFor, session } = open(t, '#/d/launch-plan', { latency: 30 });
    await ready();
    const field = input('b8');
    caret(field, field.value.length);
    const rev = server.docs.get('launch-plan').rev;
    type(field, ' Once.');
    // The server commits the change, then the connection drops before the acknowledgement arrives.
    await waitFor(() => server.docs.get('launch-plan').rev > rev, 'the server to apply the change');
    server.setOnline(false);
    assert.ok(session().inflight, 'the change is still unacknowledged');
    await new Promise(resolve => setTimeout(resolve, 40));
    server.setOnline(true);
    await synced();
    const text = server.docs.get('launch-plan').blocks.find(block => block.id === 'b8').text;
    assert.equal(text, 'Owner: Grace. Reviewers: Ada and you. Once.');
    assert.equal(field.value, text);
});

test('collab editor: when a teammate deletes the block you are typing in, you can restore it', async t => {
    const { $, document, server, ready, synced, input, type, caret, waitFor, toasts } = open(t);
    await ready();
    const field = input('b8');
    caret(field, field.value.length);
    type(field, ' Me too.');
    server.teammate('grace').edit('launch-plan', [{ t: 'set', b: 'b8', deleted: true }]);
    await waitFor(() => !input('b8'), 'the block to disappear');
    assert.deepEqual(toasts(), ['Grace Hopper deleted the paragraph you were editing']);
    await synced();
    // Your typing landed in the deleted block, so restoring brings it back too.
    $('toast-action').click();
    await synced();
    assert.ok(input('b8'));
    assert.equal(input('b8').value, 'Owner: Grace. Reviewers: Ada and you. Me too.');
    assert.equal(document.activeElement, input('b8'));
    assert.equal(server.docs.get('launch-plan').blocks.find(block => block.id === 'b8').deleted, false);
});

test('collab editor: a document deleted while open says who deleted it', async t => {
    const { $, text, server, ready, waitFor, docs } = open(t);
    await ready();
    server.teammate('grace').removeDoc('launch-plan');
    await waitFor(() => $('doc-gone'), 'the deleted state');
    assert.match(text('doc-gone'), /Grace Hopper deleted it while you were here/);
    await docs.router.navigate('/');
    await waitFor(() => $('library') && docs.sessions.size === 0, 'the list');
    assert.equal(server.joined('launch-plan'), 0);
});

test('collab editor: opening a deleted document explains why it is missing', async t => {
    const { $, text, server, waitFor, docs } = open(t, '#/');
    await waitFor(() => $('library'), 'the list');
    server.teammate('ada').removeDoc('style-guide');
    await docs.router.navigate('/d/style-guide');
    await waitFor(() => $('doc-gone'), 'the deleted state');
    assert.match(text('doc-gone'), /This document is gone Document was deleted by Ada Lovelace/);
    assert.equal(docs.sessions.size, 1);
    await docs.router.navigate('/');
    await waitFor(() => !docs.sessions.size, 'the session to close');
});

test('collab editor: leaving a document with unsaved changes finishes saving in the background', async t => {
    const { $, $$, server, ready, synced, input, type, caret, waitFor, navigate, docs, text } = open(t);
    await ready();
    server.setOnline(false);
    await waitFor(() => docs.net.status === 'offline', 'offline');
    const field = input('b8');
    caret(field, field.value.length);
    type(field, ' Saved later.');
    await navigate('/');
    await waitFor(() => $$('[data-testid="doc-card"]').length === 3, 'the list');
    const card = () => $$('[data-testid="doc-card"]').find(element => element.querySelector('a').textContent === 'Launch plan');
    assert.equal(text(card().querySelector('[data-testid="doc-saving"]')), 'Saving…');
    assert.equal(docs.sessions.size, 1, 'the session waits for its changes to save');

    server.setOnline(true);
    await waitFor(() => !docs.sessions.size, 'the background save to finish');
    await synced('launch-plan');
    assert.equal(card().querySelector('[data-testid="doc-saving"]'), null);
    assert.equal(server.docs.get('launch-plan').blocks.find(block => block.id === 'b8').text, 'Owner: Grace. Reviewers: Ada and you. Saved later.');
    await waitFor(() => !server.joined('launch-plan'), 'the document to be left once saved');
    assert.equal(server.docs.get('launch-plan').presence.size, 0);
});

test('collab editor: quick navigation between documents leaves exactly one subscription', async t => {
    const { server, ready, navigate, waitFor, docs, session } = open(t, '#/d/launch-plan', { latency: 10 });
    await ready();
    const first = session();
    await navigate('/d/weekly-sync');
    await navigate('/d/launch-plan');
    await navigate('/d/style-guide');
    await navigate('/d/launch-plan');
    await ready();
    await new Promise(resolve => setTimeout(resolve, 60));
    assert.deepEqual([...docs.sessions.keys()], ['launch-plan']);
    assert.notEqual(session(), first, 'the first session closed when it was left with nothing to save');
    assert.equal(server.joined('launch-plan'), 1);
    assert.equal(server.joined('weekly-sync'), 0);
    assert.equal(server.joined('style-guide'), 0);
    await navigate('/');
    await waitFor(() => !docs.sessions.size && !server.joined('launch-plan'), 'every document to be left');
    assert.equal(server.connections, 1);
});

test('collab editor: Enter splits, Backspace merges, and markdown shortcuts change block types', async t => {
    const { server, ready, synced, input, type, caret, key, document, session, clientBlock } = open(t);
    await ready();
    const field = input('b8'); // "Owner: Grace. Reviewers: Ada and you."
    caret(field, 13);
    key(field, 'Enter');
    const created = document.activeElement.closest('[data-block-id]').dataset.blockId;
    assert.notEqual(created, 'b8');
    assert.equal(field.value, 'Owner: Grace.');
    assert.equal(document.activeElement.value, ' Reviewers: Ada and you.');
    assert.deepEqual([document.activeElement.selectionStart, document.activeElement.selectionEnd], [0, 0]);
    const ids = session().state.visible.map(block => block.id);
    assert.equal(ids.indexOf(created), ids.indexOf('b8') + 1);

    key(document.activeElement, 'Backspace');
    assert.equal(input(created), null);
    assert.equal(document.activeElement, input('b8'));
    assert.equal(input('b8').value, 'Owner: Grace. Reviewers: Ada and you.');
    assert.equal(input('b8').selectionStart, 13);

    // A new paragraph, then "## " turns it into a subheading and the marker disappears.
    caret(input('b8'), input('b8').value.length);
    key(input('b8'), 'Enter');
    const heading = document.activeElement;
    for (const character of '## ') type(heading, character);
    const headingId = heading.closest('[data-block-id]').dataset.blockId;
    assert.equal(clientBlock(headingId).type, 'h2');
    assert.equal(heading.value, '');
    assert.equal(heading.selectionStart, 0);
    type(heading, 'Next steps');
    key(heading, 'Enter');
    for (const character of '[] ') type(document.activeElement, character);
    type(document.activeElement, 'Book the room');
    const todo = document.activeElement.closest('[data-block-id]');
    assert.equal(todo.querySelector('[data-testid="block-check"]').checked, false);
    todo.querySelector('[data-testid="block-check"]').click();
    await synced();
    const saved = server.docs.get('launch-plan').blocks.filter(block => !block.deleted).sort((a, b) => a.pos - b.pos)
        .map(block => [block.type, block.text, block.checked]);
    assert.deepEqual(plain(saved.slice(-3)), [['p', 'Owner: Grace. Reviewers: Ada and you.', false], ['h2', 'Next steps', false], ['todo', 'Book the room', true]]);

    // Backspace at the start of a formatted block makes it plain text first.
    const room = input(todo.dataset.blockId);
    caret(room, 0);
    key(room, 'Backspace');
    assert.equal(clientBlock(todo.dataset.blockId).type, 'p');
});

test('collab editor: the block menu changes the type, moves, and deletes with undo', async t => {
    const { $, $$, server, ready, synced, session, toasts, input, flush } = open(t);
    await ready();
    const block = () => $$('[data-testid="block"]').find(element => element.dataset.blockId === 'b7');
    const order = () => session().state.visible.map(entry => entry.id);
    block().querySelector('[data-testid="block-menu"]').click();
    flush();
    block().querySelector('[data-testid="turn-into-p"]').click();
    flush();
    assert.equal(session().state.blocks.find(entry => entry.id === 'b7').type, 'p');
    assert.equal(block().querySelector('.menu'), null);

    block().querySelector('[data-testid="block-menu"]').click();
    flush();
    block().querySelector('[data-testid="move-up"]').click();
    flush();
    assert.deepEqual(plain(order().slice(-3)), ['b7', 'b6', 'b8']);
    block().querySelector('[data-testid="block-menu"]').click();
    flush();
    block().querySelector('[data-testid="delete-block"]').click();
    flush();
    assert.equal(input('b7'), null);
    assert.match(toasts()[0], /^Deleted “If the billing/);
    await synced();
    assert.equal(server.docs.get('launch-plan').blocks.find(entry => entry.id === 'b7').deleted, true);
    $('toast-action').click();
    await synced();
    assert.deepEqual(plain(order().slice(-3)), ['b7', 'b6', 'b8']);
    assert.equal(server.docs.get('launch-plan').blocks.find(entry => entry.id === 'b7').deleted, false);
});

test('collab editor: history previews earlier versions and restores one', async t => {
    const { $, $$, server, ready, synced, input, type, caret, waitFor, text, navigate, session, toasts } = open(t);
    await ready();
    const field = input('b2');
    caret(field, field.value.length);
    type(field, ' Or sooner.');
    await synced();
    server.teammate('ada').edit('launch-plan', [{ t: 'set', b: 'b3', deleted: true }]);
    await synced();
    const doc = session();
    await navigate('/d/launch-plan?history');
    await waitFor(() => $$('[data-testid="version"]').length === 3, 'the versions');
    assert.equal(session(), doc, 'opening history keeps the editor mounted');
    assert.equal(input('b2'), field, 'and its fields');
    const versions = () => $$('[data-testid="version"]').map(element => text(element));
    assert.match(versions()[0], /^AL Ada Lovelace .* · 1 change · current$/);
    assert.match(versions()[1], /^YO You .* · 1 change$/);
    assert.match(versions()[2], /^✦ Created/);

    $$('[data-testid="version"]')[2].click();
    await waitFor(() => $('preview'), 'the preview');
    const preview = $$('[data-testid="preview-block"]').map(element => element.textContent);
    assert.equal(preview[0], 'Launch plan');
    assert.ok(preview.includes('☑ Finalize pricing copy'));
    assert.ok(preview.includes('Ship the new onboarding flow to every workspace by the end of the quarter.'));

    $('restore-version').click();
    await synced();
    assert.match(toasts()[0], /^Restored the version from /);
    const block = id => server.docs.get('launch-plan').blocks.find(entry => entry.id === id);
    assert.equal(block('b2').text, 'Ship the new onboarding flow to every workspace by the end of the quarter.');
    assert.equal(block('b3').deleted, false);
    assert.equal(field.value, block('b2').text);
    // The restore is itself a new version, so it can be undone the same way.
    await waitFor(() => $$('[data-testid="version"]').length === 4, 'the restore in history');
    assert.match(versions()[0], /^YO You .* · 1 change · current$/);
    assert.match(versions()[1], /^AL Ada Lovelace .* · 1 change$/);

    $('toggle-history').click();
    await waitFor(() => !$('history'), 'history to close');
    assert.equal(input('b2'), field);
});

test('collab editor: a failed load can be retried', async t => {
    const { $, $$, waitFor, ready, server, docs, text } = open(t, '#/');
    await waitFor(() => $$('[data-testid="doc-card"]').length === 3, 'the list');
    server.failNext = 500;
    await docs.router.navigate('/d/launch-plan');
    await waitFor(() => $('doc-error'), 'the error');
    assert.match(text('doc-error'), /Server is having a bad day/);
    $('doc-retry').click();
    await ready();
    assert.deepEqual(plain(docs.editor.doc.state.blocks.map(block => block.id)).slice(0, 2), ['title', 'b1']);
});
