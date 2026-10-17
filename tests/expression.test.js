import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assign, createExpressionScope, evaluate, evaluateFunction, execute, state, effect } from 'briojs';

test('contexts merge named references with nearest precedence without copying reactive state', () => {
    const parentData = state({ count: 1 });
    const parent = createExpressionScope({ $data: parentData });
    const local = state({ count: 2, $parent: parentData });
    const scope = createExpressionScope({ $data: local }, parent);
    assert.equal(Object.getPrototypeOf(scope), null);
    assert.deepEqual(Object.keys(scope), ['$data']);
    assert.equal(scope.$data, local);
    assert.equal(scope.$data.$parent, parentData);
    const values = [];
    const stop = effect(() => values.push(evaluate('$data.count + $data.$parent.count', scope)));
    parentData.count++;
    local.count++;
    stop();
    assert.deepEqual(values, [3, 4, 5]);
});

test('strict expressions use explicit context, normal globals, and meaningful missing-name errors', () => {
    const scope = createExpressionScope({ $data: { count: 3 } });
    assert.equal(evaluate('Math.max($data.count, 5)', scope), 5);
    assert.equal(evaluate('JSON.stringify($context.$data)', scope), '{"count":3}');
    assert.equal(evaluate('(() => { const value = $data.count; return value * 2; })()', scope), 6);
    assert.equal(evaluate('(function () { return this; })()', scope), undefined);
    assert.throws(() => evaluate('count', scope), error => error.cause instanceof ReferenceError);
    assert.equal(evaluate('$context.$data.count', scope), 3);
    assert.throws(() => evaluate('ctx', scope), error => error.cause instanceof ReferenceError);
    assert.throws(() => evaluate('$parent', scope), error => error.cause instanceof ReferenceError);
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
    execute('$data.event = $event; $data.type = $context.$event.type;', scope, replacement);
    assert.equal(data.event, replacement);
    assert.equal(data.type, 'replacement');
    assert.equal(scope.$event, original);
    execute('$data.promise = Promise.resolve().then(() => $data.callback());', scope);
    assert.equal(await data.promise, 5);
});

test('assign uses its value argument without shadowing and supports all explicit data containers', () => {
    const scope = createExpressionScope({
        $data: { value: 1, $parent: { value: 2 } },
        $for: { item: { value: 3 } },
    });
    const value = { nested: true };
    assign('$data.value', scope, value);
    assign('$data.$parent.value', scope, 4);
    assign('$for.item.value', scope, 5);
    assign('$context.$data.$parent.value', scope, 6);
    assert.equal(scope.$data.value, value);
    assert.equal(scope.$data.$parent.value, 6);
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
    });
    execute('$data.result = [$mutations[0].type, $entry.isIntersecting, $size.width, $props.label, $emit("change"), trustedHTML("ok")];', scope);
    assert.deepEqual(scope.$data.result, ['attributes', true, 42, 'Label', 'change', 'ok']);
    assert.equal(evaluate('$context.$props.label', scope), 'Label');
    assert.throws(() => evaluate('props.label', scope), error => error.cause instanceof ReferenceError);
    assert.throws(() => execute('emit("change")', scope), error => error.cause instanceof ReferenceError);
    evaluateFunction('($context) => { $data.label = $props.label; $context.$data.event = $emit("script"); }', scope)(scope);
    assert.equal(scope.$data.label, 'Label');
    assert.equal(scope.$data.event, 'script');
});

test('script factories use the same strict bindings and preserve $context in async closures', async () => {
    const scope = createExpressionScope({ $data: { count: 0, $parent: { count: 2 } } });
    const fn = evaluateFunction('async ($context) => { const delta = $data.$parent.count; await Promise.resolve(); $context.$data.count += delta; return (function () { return this; })(); }', scope);
    assert.equal(await fn(scope), undefined);
    assert.equal(scope.$data.count, 2);
    assert.throws(() => evaluateFunction('() => { with ({}) {} }', scope), SyntaxError);
});
