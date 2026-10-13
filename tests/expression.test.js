import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assign, createExpressionScope, evaluate, evaluateFunction, execute, state, effect } from 'briojs';

test('contexts merge named references with nearest precedence without copying reactive state', () => {
    const parentData = state({ count: 1 });
    const parent = createExpressionScope({ $data: parentData });
    const local = state({ count: 2 });
    const scope = createExpressionScope({ $data: local, $parent: parent }, parent);
    assert.equal(Object.getPrototypeOf(scope), null);
    assert.deepEqual(Object.keys(scope).sort(), ['$data', '$parent']);
    assert.equal(scope.$data, local);
    assert.equal(scope.$parent.$data, parentData);
    const values = [];
    const stop = effect(() => values.push(evaluate('$data.count + $parent.$data.count', scope)));
    parentData.count++;
    local.count++;
    stop();
    assert.deepEqual(values, [3, 4, 5]);
});

test('strict expressions use explicit context, normal globals, and meaningful missing-name errors', () => {
    const scope = createExpressionScope({ $data: { count: 3 } });
    assert.equal(evaluate('Math.max($data.count, 5)', scope), 5);
    assert.equal(evaluate('JSON.stringify(ctx.$data)', scope), '{"count":3}');
    assert.equal(evaluate('(() => { const value = $data.count; return value * 2; })()', scope), 6);
    assert.equal(evaluate('(function () { return this; })()', scope), undefined);
    assert.throws(() => evaluate('count', scope), error => error.cause instanceof ReferenceError);
    assert.throws(() => execute('brioUndeclaredVariable = 1', scope), error => error.cause instanceof ReferenceError);
    assert.equal(globalThis.brioUndeclaredVariable, undefined);
    assert.throws(() => evaluate('(function () { with ({}) {} })()', scope), SyntaxError);
    assert.throws(() => execute('$data = {}', scope), error => error.cause instanceof TypeError);
});

test('event statements retain local variables and explicit event references in closures', async () => {
    const data = { count: 1 };
    const original = { type: 'original' };
    const scope = createExpressionScope({ $data: data, $event: original });
    execute('const delta = 2; $data.count += delta; $data.callback = () => delta + $data.count; $data.event = $event;', scope);
    assert.equal(data.count, 3);
    assert.equal(data.callback(), 5);
    assert.equal(data.event, original);
    const replacement = { type: 'replacement' };
    execute('$data.event = $event; $data.type = ctx.$event.type;', scope, replacement);
    assert.equal(data.event, replacement);
    assert.equal(data.type, 'replacement');
    assert.equal(scope.$event, original);
    execute('$data.promise = Promise.resolve().then(() => $data.callback());', scope);
    assert.equal(await data.promise, 5);
});

test('assign uses its value argument without shadowing and supports all explicit data containers', () => {
    const scope = createExpressionScope({
        $data: { value: 1 },
        $parent: { $data: { value: 2 } },
        $for: { item: { value: 3 } },
    });
    const value = { nested: true };
    assign('$data.value', scope, value);
    assign('$parent.$data.value', scope, 4);
    assign('$for.item.value', scope, 5);
    assert.equal(scope.$data.value, value);
    assert.equal(scope.$parent.$data.value, 4);
    assert.equal(scope.$for.item.value, 5);
});

test('observer and directive helpers are explicitly available without global fallback proxies', () => {
    const scope = createExpressionScope({
        $data: {},
        $mutations: [{ type: 'attributes' }],
        $entry: { isIntersecting: true },
        $size: { width: 42 },
        $props: { label: 'Label' },
        $emit: name => name,
        trustedHTML: value => value,
        money: options => options,
    });
    execute('$data.result = [$mutations[0].type, $entry.isIntersecting, $size.width, $props.label, $emit("change"), trustedHTML("ok"), money({ precision: 3 }).precision];', scope);
    assert.deepEqual(scope.$data.result, ['attributes', true, 42, 'Label', 'change', 'ok', 3]);
    assert.equal(evaluate('ctx.$props.label', scope), 'Label');
    assert.throws(() => evaluate('props.label', scope), error => error.cause instanceof ReferenceError);
    assert.throws(() => execute('emit("change")', scope), error => error.cause instanceof ReferenceError);
    evaluateFunction('(ctx) => { $data.label = $props.label; ctx.$data.event = $emit("script"); }', scope)(scope);
    assert.equal(scope.$data.label, 'Label');
    assert.equal(scope.$data.event, 'script');
});

test('script factories use the same strict bindings and preserve ctx in async closures', async () => {
    const scope = createExpressionScope({ $data: { count: 0 }, $parent: { $data: { count: 2 } } });
    const fn = evaluateFunction('async (ctx) => { const delta = $parent.$data.count; await Promise.resolve(); ctx.$data.count += delta; return (function () { return this; })(); }', scope);
    assert.equal(await fn(scope), undefined);
    assert.equal(scope.$data.count, 2);
    assert.throws(() => evaluateFunction('() => { with ({}) {} }', scope), SyntaxError);
});
