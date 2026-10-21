import assert from 'node:assert/strict';
import test from 'node:test';
import { assertStandaloneAssets, openApp } from '../harness.js';

/** Records which table rows were moved (not freshly inserted) and which cells changed. */
function instrument(window, tbody) {
    const insertBefore = window.Node.prototype.insertBefore;
    const moved = new Set();
    window.Node.prototype.insertBefore = function (node, reference) {
        if (node.nodeType === 1 && node.parentNode === this && this === tbody) moved.add(node);
        return insertBefore.call(this, node, reference);
    };
    const changed = new Set();
    const observer = new window.MutationObserver(records => {
        for (const record of records) {
            const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;
            if (element !== tbody) changed.add(element.closest('tr'));
        }
    });
    observer.observe(tbody, { subtree: true, characterData: true, attributes: true, childList: true });
    return {
        moved,
        async changes() {
            await Promise.resolve();
            const result = new Set(changed);
            changed.clear();
            return result;
        },
        reset() {
            moved.clear();
            observer.takeRecords();
            changed.clear();
        },
    };
}

test('large table works as a standalone page', () => {
    assertStandaloneAssets('large-table');
});

test('creates, replaces, appends, and clears keyed rows', t => {
    const { $, $$, text, user } = openApp(t, 'large-table');
    const rows = () => $$('[data-testid="rows"] tr');

    assert.equal(rows().length, 0);
    assert.ok($('table').parentElement.querySelector('.empty-table'));
    assert.equal($('update').disabled, true);
    assert.equal($('swap').disabled, true);

    user.click($('run'));
    assert.equal(rows().length, 1000);
    assert.equal(text('row-count'), '1,000');
    assert.equal($('table').parentElement.querySelector('.empty-table'), null);
    assert.equal(text(rows()[0].cells[0]), '1');
    assert.equal(text(rows()[999].cells[0]), '1000');
    assert.ok(rows().every(row => /^\w+ \w+ \w+$/.test(text(row.cells[1]))), 'labels are adjective colour noun');
    assert.equal(rows()[0].querySelector('button').getAttribute('aria-label'), 'Remove row 1');

    const first = rows()[0];
    user.click($('run'));
    assert.equal(rows().length, 1000);
    assert.equal(text(rows()[0].cells[0]), '1001', 'replacing creates new ids');
    assert.notEqual(rows()[0], first, 'and new row elements');
    assert.equal(first.isConnected, false);

    const kept = rows();
    user.click($('add'));
    assert.equal(rows().length, 2000);
    assert.equal(text('row-count'), '2,000');
    assert.ok(kept.every((row, index) => rows()[index] === row), 'appending keeps existing rows');
    assert.equal(text(rows()[1999].cells[0]), '3000');

    user.click($('clear'));
    assert.equal(rows().length, 0);
    assert.ok(kept.every(row => !row.isConnected));
    assert.equal($('clear').disabled, true);
});

test('partial updates and selection touch only the affected rows', async t => {
    const { window, $, $$, text, user } = openApp(t, 'large-table');
    user.click($('run'));
    const rows = $$('[data-testid="rows"] tr');
    const probe = instrument(window, $('rows'));
    probe.reset();

    const before = rows.map(row => text(row.cells[1]));
    user.click($('update'));
    const updated = await probe.changes();
    assert.equal(updated.size, 100, 'exactly every 10th row changes');
    assert.ok(rows.every((row, index) => updated.has(row) === (index % 10 === 0)));
    assert.equal(text(rows[10].cells[1]), `${before[10]} !!!`);
    assert.equal(text(rows[11].cells[1]), before[11]);
    user.click($('update'));
    assert.equal(text(rows[0].cells[1]), `${before[0]} !!! !!!`);
    await probe.changes();

    user.click(rows[4].querySelector('a'));
    assert.deepEqual([...await probe.changes()], [rows[4]], 'selecting changes one row');
    assert.ok(rows[4].classList.contains('danger'));
    assert.equal(rows[4].getAttribute('aria-selected'), 'true');
    assert.equal(text('selected-id'), '#5');

    user.click(rows[700].querySelector('a'));
    assert.deepEqual(new Set(await probe.changes()), new Set([rows[4], rows[700]]), 'reselecting changes two rows');
    assert.equal(rows[4].classList.contains('danger'), false);
    assert.equal($$('tr.danger').length, 1);
    assert.equal(probe.moved.size, 0, 'no rows moved');
});

test('swapping moves only the two swapped rows and keeps their elements', t => {
    const { window, $, $$, text, user } = openApp(t, 'large-table');
    user.click($('run'));
    const rows = $$('[data-testid="rows"] tr');
    const probe = instrument(window, $('rows'));
    user.click(rows[1].querySelector('a'));
    probe.reset();

    user.click($('swap'));
    const after = $$('[data-testid="rows"] tr');
    assert.equal(after[1], rows[998]);
    assert.equal(after[998], rows[1]);
    assert.equal(text(after[1].cells[0]), '999');
    assert.equal(text(after[998].cells[0]), '2');
    assert.deepEqual(new Set(probe.moved), new Set([rows[1], rows[998]]), 'a swap is two moves, not a cascade');
    assert.ok(after[998].classList.contains('danger'), 'selection travels with the row');

    user.click($('swap'));
    assert.deepEqual($$('[data-testid="rows"] tr'), rows, 'swapping back restores the original order');
});

test('removing a row disposes it without touching its neighbours', async t => {
    const { window, $, $$, text, user } = openApp(t, 'large-table');
    user.click($('run'));
    const rows = $$('[data-testid="rows"] tr');
    user.click(rows[3].querySelector('a'));
    const probe = instrument(window, $('rows'));
    probe.reset();

    user.click(rows[3].querySelector('button'));
    const after = $$('[data-testid="rows"] tr');
    assert.equal(after.length, 999);
    assert.equal(rows[3].isConnected, false);
    assert.deepEqual(after, rows.filter((_, index) => index !== 3), 'all other row elements are reused in order');
    assert.equal(probe.moved.size, 0);
    assert.deepEqual([...await probe.changes()].filter(Boolean), [], 'no surviving row re-renders');
    assert.equal($('selected-id'), null, 'removing the selected row clears the selection');
    assert.equal(text('row-count'), '999');

    // Handlers on removed rows are gone, and those on survivors still work.
    rows[3].querySelector('a').click();
    assert.equal($$('tr.danger').length, 0);
    after[3].querySelector('a').click();
    assert.equal(text('selected-id'), '#5');
});

test('each operation reports its timing, newest first, keeping the last five', t => {
    const { $, $$, user } = openApp(t, 'large-table');
    const timings = () => $$('[data-testid="timings"] li').map(item => item.textContent);

    user.click($('run'));
    assert.match(timings()[0], /^Create 1,000 rows: \d+\.\d ms$/);
    for (const id of ['update', 'swap', 'update', 'add', 'clear']) user.click($(id));
    assert.equal(timings().length, 5);
    assert.deepEqual(timings().map(entry => entry.split(':')[0]),
        ['Clear', 'Append 1,000 rows', 'Update every 10th row', 'Swap rows', 'Update every 10th row']);
});
