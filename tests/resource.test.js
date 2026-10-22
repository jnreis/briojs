import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as main from '@jnreis/briojs';
import * as standalone from '@jnreis/briojs/reactivity';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

for (const [name, api] of [['main', main], ['reactivity', standalone]]) {
    test(`${name}: resources publish only the latest success or failure and retain data during refresh`, async t => {
        const requests = [];
        const resource = api.resource(signal => {
            const request = { ...deferred(), signal };
            requests.push(request);
            return request.promise;
        });
        t.after(() => resource.dispose());
        assert.equal(resource.loading.value, true);
        requests[0].resolve('initial');
        await settle();
        assert.equal(resource.data.value, 'initial');
        assert.equal(resource.loading.value, false);
        const first = resource.refetch();
        const second = resource.refetch();
        assert.equal(requests[1].signal.aborted, true);
        assert.equal(requests[2].signal.aborted, false);
        assert.equal(resource.data.value, 'initial');
        requests[1].reject(new Error('obsolete failure'));
        await first;
        assert.equal(resource.error.value, undefined);
        assert.equal(resource.loading.value, true);
        requests[2].resolve('newest');
        await second;
        assert.equal(resource.data.value, 'newest');
        assert.equal(resource.loading.value, false);
        const third = resource.refetch();
        const fourth = resource.refetch();
        const failure = new Error('latest failure');
        requests[4].reject(failure);
        await fourth;
        assert.equal(resource.error.value, failure);
        assert.equal(resource.data.value, 'newest');
        requests[3].resolve('obsolete success');
        await third;
        assert.equal(resource.error.value, failure);
        assert.equal(resource.data.value, 'newest');
        assert.equal(resource.loading.value, false);
        const retry = resource.refetch();
        assert.equal(resource.error.value, undefined);
        requests[5].resolve(undefined);
        await retry;
        assert.equal(resource.data.value, undefined);
        assert.equal(resource.error.value, undefined);
    });

    test(`${name}: resource auto-runs on synchronous dependencies and batches status publication`, async t => {
        const source = api.signal('a');
        const requests = [];
        const owner = api.createScope();
        t.after(() => owner.dispose());
        const resource = owner.run(() => api.resource(signal => {
            const request = { ...deferred(), key: source.value, signal };
            requests.push(request);
            return request.promise;
        }));
        const snapshots = [];
        owner.run(() => api.effect(() => snapshots.push([
            resource.data.value, resource.loading.value, resource.error.value,
        ])));
        source.value = 'b';
        assert.equal(requests.length, 2);
        assert.equal(requests[0].signal.aborted, true);
        assert.equal(requests[1].key, 'b');
        requests[1].resolve('b-result');
        await settle();
        assert.deepEqual(snapshots, [[undefined, true, undefined], ['b-result', false, undefined]]);
        requests[0].resolve('a-result');
        await settle();
        assert.equal(snapshots.length, 2);
        const next = resource.refetch();
        requests[2].reject('failure');
        await next;
        assert.deepEqual(snapshots.at(-1), ['b-result', false, 'failure']);
        const retry = resource.refetch();
        assert.deepEqual(snapshots.at(-1), ['b-result', true, undefined]);
        requests[3].resolve('retry');
        await retry;
        assert.deepEqual(snapshots.at(-1), ['retry', false, undefined]);
    });

    test(`${name}: resource disposal aborts, stops dependencies and blocks late publication/refetch`, async t => {
        for (const disposal of ['resource', 'owner']) {
            const owner = api.createScope();
            t.after(() => owner.dispose());
            const source = api.signal(0);
            const request = deferred();
            let signal;
            let calls = 0;
            const resource = owner.run(() => api.resource(abortSignal => {
                source.value;
                calls++;
                signal = abortSignal;
                return request.promise;
            }));
            if (disposal === 'resource') resource.dispose();
            else owner.dispose();
            assert.equal(signal.aborted, true);
            assert.equal(resource.loading.value, false);
            source.value++;
            assert.equal(calls, 1);
            request.resolve('too late');
            await settle();
            assert.equal(resource.data.value, undefined);
            assert.equal(resource.error.value, undefined);
            resource.dispose();
            await assert.rejects(resource.refetch(), /disposed Brio resource/);
        }
    });

    test(`${name}: abort-aware and zero-argument fetchers; sync failures remain resource errors`, async t => {
        const signals = [];
        const resource = api.resource(signal => new Promise((_resolve, reject) => {
            signals.push(signal);
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        }));
        t.after(() => resource.dispose());
        const pending = resource.refetch();
        assert.equal(signals[0].aborted, true);
        resource.dispose();
        await pending;
        await settle();
        assert.equal(resource.error.value, undefined);
        assert.equal(resource.loading.value, false);
        const compatible = api.resource(async () => 42);
        t.after(() => compatible.dispose());
        await settle();
        assert.equal(compatible.data.value, 42);
        const failure = new Error('synchronous fetcher error');
        const broken = api.resource(() => { throw failure; });
        t.after(() => broken.dispose());
        assert.equal(broken.error.value, failure);
        assert.equal(broken.loading.value, false);
        await broken.refetch();
        assert.equal(broken.error.value, failure);
    });

    test(`${name}: abort callbacks cannot revive disposed work or supersede a reentrant newer run`, async t => {
        const requests = [];
        let reenter = false;
        let nested;
        const resource = api.resource(signal => {
            const request = { ...deferred(), signal };
            requests.push(request);
            signal.addEventListener('abort', () => {
                if (reenter) {
                    reenter = false;
                    nested = resource.refetch();
                }
            }, { once: true });
            return request.promise;
        });
        t.after(() => resource.dispose());
        reenter = true;
        const obsolete = resource.refetch();
        assert.equal(requests.length, 2);
        requests[1].resolve('nested latest');
        await nested;
        await obsolete;
        requests[0].resolve('obsolete');
        await settle();
        assert.equal(resource.data.value, 'nested latest');
        assert.equal(resource.loading.value, false);
    });

    test(`${name}: disposal during status notification prevents starting a fetcher`, async t => {
        let calls = 0;
        const resource = api.resource(async () => ++calls);
        t.after(() => resource.dispose());
        await settle();
        const stop = api.effect(() => {
            if (resource.loading.value) resource.dispose();
        });
        t.after(stop);
        await resource.refetch();
        assert.equal(calls, 1);
        assert.equal(resource.data.value, 1);
        assert.equal(resource.loading.value, false);
        await assert.rejects(resource.refetch(), /disposed/);
    });

    test(`${name}: disposed fetchers that ignore abort cannot publish a late rejection`, async () => {
        const request = deferred();
        const resource = api.resource(() => request.promise);
        resource.dispose();
        request.reject(new Error('late failure'));
        await settle();
        assert.equal(resource.error.value, undefined);
        assert.equal(resource.loading.value, false);
    });
}

test('public resource declarations include signal inference, disposal and legacy fetchers', () => {
    execFileSync(fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url)), [
        '--noEmit', '--strict', '--target', 'ES2022', '--module', 'ESNext',
        '--moduleResolution', 'bundler', 'tests/types/resource.ts',
    ], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: 'pipe' });
});
