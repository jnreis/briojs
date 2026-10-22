/**
 * Operational transformation for block documents, shared by the client and the (mock) server.
 *
 * A document is a list of blocks `{ id, type, text, checked, pos, deleted }` ordered by `pos` (then id).
 * Operations:
 *   { t: 'ins', b, p, s }             insert text `s` at offset `p` of block `b`
 *   { t: 'del', b, p, n }             delete `n` characters at offset `p`
 *   { t: 'add', b, type, text, pos }  create a block (clients generate ids, so they never collide)
 *   { t: 'set', b, ...attrs }         set `type`, `checked`, `pos`, or `deleted`; concurrent sets are last-writer-wins
 *
 * Text is transformed character by character. Blocks are never removed, only tombstoned with `deleted`,
 * so text typed into a block that someone else deleted survives a later restore.
 */
window.DocsOT = (() => {
    const ATTRS = ['type', 'checked', 'pos', 'deleted'];
    const order = (left, right) => left.pos - right.pos || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0);

    /** Moves a block to its sorted place in `blocks` (an array, possibly reactive). */
    function place(blocks, block) {
        const current = blocks.indexOf(block);
        if (current >= 0) blocks.splice(current, 1);
        let index = blocks.findIndex(other => order(block, other) < 0);
        if (index < 0) index = blocks.length;
        blocks.splice(index, 0, block);
    }

    /** Applies one operation to `blocks` in place. Operations on unknown blocks are ignored. */
    function apply(blocks, op) {
        const block = blocks.find(entry => entry.id === op.b);
        if (op.t === 'add') {
            if (!block) place(blocks, { id: op.b, type: op.type ?? 'p', text: op.text ?? '', checked: false, pos: op.pos, deleted: false });
            return;
        }
        if (!block) return;
        if (op.t === 'ins') {
            const at = Math.min(op.p, block.text.length);
            block.text = block.text.slice(0, at) + op.s + block.text.slice(at);
        } else if (op.t === 'del') {
            block.text = block.text.slice(0, op.p) + block.text.slice(op.p + op.n);
        } else if (op.t === 'set') {
            for (const key of ATTRS) if (key in op) block[key] = op[key];
            if ('pos' in op) place(blocks, blocks.find(entry => entry.id === op.b));
        }
    }

    /**
     * Rewrites `op` so it applies after `against` (both made on the same document version).
     * The server applies concurrent operations in arrival order; `againstFirst` says `against` arrived first,
     * so it keeps its insertion point on ties, and its attribute values lose to `op`'s.
     */
    function transform(op, against, againstFirst) {
        if (op.b !== against.b) return [op];
        if (op.t === 'ins' && against.t === 'ins') {
            const shift = against.p < op.p || (against.p === op.p && againstFirst);
            return [shift ? { ...op, p: op.p + against.s.length } : op];
        }
        if (op.t === 'ins' && against.t === 'del') {
            if (op.p <= against.p) return [op];
            if (op.p >= against.p + against.n) return [{ ...op, p: op.p - against.n }];
            return [{ ...op, p: against.p }];
        }
        if (op.t === 'del' && against.t === 'ins') {
            if (against.p <= op.p) return [{ ...op, p: op.p + against.s.length }];
            if (against.p >= op.p + op.n) return [op];
            // Text typed inside a range someone else deleted is kept: delete around it.
            const before = against.p - op.p;
            return [{ ...op, n: before }, { ...op, p: op.p + against.s.length, n: op.n - before }];
        }
        if (op.t === 'del' && against.t === 'del') {
            const end = op.p + op.n;
            const againstEnd = against.p + against.n;
            if (end <= against.p) return [op];
            if (op.p >= againstEnd) return [{ ...op, p: op.p - against.n }];
            const n = op.n - (Math.min(end, againstEnd) - Math.max(op.p, against.p));
            return n ? [{ ...op, p: Math.min(op.p, against.p), n }] : [];
        }
        if (op.t === 'set' && against.t === 'set' && !againstFirst) {
            const kept = { ...op };
            for (const key of ATTRS) if (key in against) delete kept[key];
            return ATTRS.some(key => key in kept) ? [kept] : [];
        }
        return [op];
    }

    /**
     * Transforms two concurrent operation lists against each other. Returns `[left', right']`, where
     * `left'` applies after `right` and `right'` after `left`. `right` is the one the server committed first.
     */
    function transformLists(left, right) {
        if (!left.length || !right.length) return [left, right];
        if (left.length > 1) {
            const [head, rightAfterHead] = transformLists([left[0]], right);
            const [tail, rightAfterAll] = transformLists(left.slice(1), rightAfterHead);
            return [[...head, ...tail], rightAfterAll];
        }
        if (right.length > 1) {
            const [leftAfterHead, head] = transformLists(left, [right[0]]);
            const [leftAfterAll, tail] = transformLists(leftAfterHead, right.slice(1));
            return [leftAfterAll, [...head, ...tail]];
        }
        return [transform(left[0], right[0], true), transform(right[0], left[0], false)];
    }

    /** Where a caret at `offset` in block `id` ends up after `op`. `own` carets move past their own insertions. */
    function mapOffset(id, offset, op, own = false) {
        if (op.b !== id) return offset;
        if (op.t === 'ins') return op.p < offset || (op.p === offset && own) ? offset + op.s.length : offset;
        if (op.t === 'del') return offset <= op.p ? offset : offset >= op.p + op.n ? offset - op.n : op.p;
        return offset;
    }

    /**
     * The operations that turn `before` into `after` for one block: at most one delete and one insert.
     * `caret` (the selection end after the edit) settles repeats, e.g. typing "a" at the start of "aa".
     */
    function diff(id, before, after, caret) {
        const max = Math.min(before.length, after.length);
        let prefix = 0;
        while (prefix < max && before[prefix] === after[prefix]) prefix++;
        let suffix = 0;
        while (suffix < max - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
        const removed = before.length - prefix - suffix;
        const inserted = after.length - prefix - suffix;
        if (caret != null && (!removed || !inserted)) {
            // Any start within a run of repeated characters describes the same change; prefer the caret's.
            const size = removed || inserted;
            const start = removed ? caret : caret - inserted;
            const text = removed ? before : after;
            if (start >= 0 && start < prefix && text.slice(start, prefix) === text.slice(start + size, prefix + size)) prefix = start;
        }
        const ops = [];
        if (removed) ops.push({ t: 'del', b: id, p: prefix, n: removed });
        if (inserted) ops.push({ t: 'ins', b: id, p: prefix, s: after.slice(prefix, prefix + inserted) });
        return ops;
    }

    /** A position between two neighbours, for inserting or moving a block. */
    const between = (before, after) =>
        before == null ? (after == null ? 1024 : after - 1024) : after == null ? before + 1024 : (before + after) / 2;

    return { apply, transform, transformLists, mapOffset, diff, between, order };
})();
