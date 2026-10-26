import assert from 'node:assert/strict';
import test from 'node:test';
import { assertStandaloneAssets, deferred, openApp, settle } from '../harness.js';

const CATALOG = {
    products: [
        { id: 'p1', name: 'Aria Earbuds', category: 'Audio', price: 100 },
        { id: 'p2', name: 'Orbit Watch', category: 'Wearables', price: 300 },
        { id: 'p3', name: 'Volt Mini', category: 'Accessories', price: 25 },
    ],
    regions: [{ id: 'na', label: 'North America' }, { id: 'eu', label: 'Europe' }],
    channels: [{ id: 'web', label: 'Web store' }, { id: 'mobile', label: 'Mobile app' }, { id: 'partner', label: 'Partners' }],
};

const order = (id, day, region, channel, product, units, revenue) => ({ id, day, region, channel, product, units, revenue });

// 7-day window ending 2026-03-10: current period Mar 4–10, previous period Feb 25–Mar 3.
const WEEK = {
    today: '2026-03-10',
    orders: [
        order('q1', '2026-02-26', 'na', 'web', 'p1', 1, 100),
        order('q2', '2026-03-01', 'eu', 'mobile', 'p2', 2, 400),
        order('c1', '2026-03-04', 'na', 'web', 'p1', 2, 200),
        order('c2', '2026-03-06', 'eu', 'mobile', 'p2', 1, 300),
        order('c3', '2026-03-10', 'na', 'partner', 'p3', 4, 100),
        order('c4', '2026-03-10', 'eu', 'web', 'p1', 1, 100),
    ],
};

/** An analytics API whose requests stay pending until the test settles them. */
function fakeApi() {
    const requests = [];
    const listeners = new Set();
    return {
        requests,
        listeners,
        fetchCatalog: () => Promise.resolve(CATALOG),
        fetchOrders({ days, signal }) {
            const request = { days, signal, ...deferred() };
            requests.push(request);
            return request.promise;
        },
        subscribe(onOrder) {
            listeners.add(onOrder);
            return () => listeners.delete(onOrder);
        },
        push(entry) {
            for (const listener of listeners) listener(entry);
        },
    };
}

/** Tracks live intervals so tests can prove components clear their timers. */
function trackIntervals(window) {
    const active = new Set();
    const setInterval = window.setInterval.bind(window);
    const clearInterval = window.clearInterval.bind(window);
    window.setInterval = (...args) => {
        const id = setInterval(...args);
        active.add(id);
        return id;
    };
    window.clearInterval = id => {
        active.delete(id);
        clearInterval(id);
    };
    return active;
}

async function openDashboard(t, { hash = '?days=7' } = {}) {
    const api = fakeApi();
    let intervals;
    const page = openApp(t, 'dashboard', {
        hash,
        before: window => {
            window.analyticsApi = api;
            intervals = trackIntervals(window);
        },
    });
    await settle();
    return { ...page, api, intervals };
}

async function loaded(t, options) {
    const page = await openDashboard(t, options);
    page.api.requests.at(-1).resolve(WEEK);
    await settle();
    return page;
}

const kpis = $$ => Object.fromEntries($$('kpi-card').map(card => [
    card.querySelector('.kpi-label').textContent,
    {
        value: card.querySelector('[data-part="value"]').textContent,
        hint: card.querySelector('[data-part="hint"]').textContent,
        trend: card.querySelector('.trend').getAttribute('aria-label'),
    },
]));

const productRows = ($$, text) => $$('[data-testid="product-rows"] tr').map(row => [...row.cells].map(cell => text(cell)));

test('dashboard works as a standalone page', () => {
    assertStandaloneAssets('dashboard');
});

test('shows a loading skeleton, then KPIs computed from the loaded orders', async t => {
    const { $, $$, text, api } = await openDashboard(t);

    assert.ok($('skeleton'), 'skeleton while the first request is pending');
    assert.equal($$('kpi-card').length, 0);
    assert.match(text('status'), /Loading orders/);
    assert.equal($('refresh').disabled, true);
    assert.equal(api.requests.length, 1);
    assert.equal(api.requests[0].days, 7, 'range comes from the query string');

    api.requests[0].resolve(WEEK);
    await settle();

    assert.equal($('skeleton'), null);
    assert.match(text('status'), /^Updated just now · Mar 4 – Mar 10$/);
    assert.equal($('refresh').disabled, false);
    assert.equal($('range-7').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(kpis($$), {
        'Revenue': { value: '$700', hint: '$500 previous period', trend: 'Up 40% from the previous period' },
        'Orders': { value: '4', hint: '2 previous period', trend: 'Up 100% from the previous period' },
        'Average order': { value: '$175', hint: '$250 previous period', trend: 'Down 30% from the previous period' },
        'Units sold': { value: '8', hint: '3 previous period', trend: 'Up 166.7% from the previous period' },
    });
    assert.deepEqual($$('[data-testid="insights"] li').map(text), [
        'Aria Earbuds leads with $300 (42.9% of revenue).',
        'Europe is the strongest region at $400.',
    ]);
});

test('renders a large component tree: KPI cards, charts, and per-row sparklines and badges', async t => {
    const { $, $$, text } = await loaded(t);

    assert.equal($$('kpi-card').length, 4);
    assert.equal($$('chart-card').length, 3);
    assert.equal($$('kpi-card spark-line').length, 4, 'components nest inside components');
    assert.deepEqual($$('kpi-card').map(card => [card.dataset.testid, card.className]), [
        ['kpi-revenue', 'rising'], ['kpi-orders', 'rising'], ['kpi-average', 'falling'], ['kpi-units', 'rising'],
    ], 'b-bind-* binds native host attributes and classes');
    assert.deepEqual(productRows($$, text), [
        ['Aria Earbuds Audio', '3', '$300', '42.9%', '', '▲200%'],
        ['Orbit Watch Wearables', '1', '$300', '42.9%', '', '▼25%'],
        ['Volt Mini Accessories', '4', '$100', '14.3%', '', 'New'],
    ]);
    assert.deepEqual($$('[data-testid="product-rows"] .trend').map(badge => badge.className), ['trend up', 'trend down', 'trend new']);
    assert.equal(text('product-count'), '3 of 3');

    // Sparklines draw one point per day of the 7-day period.
    const spark = $$('[data-testid="product-rows"] tr')[0].querySelector('.spark-stroke').getAttribute('d');
    assert.equal(spark.split(/[ML]/).filter(Boolean).length, 7);
    assert.match(spark, /^M0\.0,2\.0 L16\.7,26\.0/, 'Aria Earbuds peaks on the first day');

    const svg = $('revenue-card').querySelector('svg');
    assert.equal(svg.getAttribute('viewBox'), '0 0 960 250', 'SVG attributes keep their case inside component templates');
    assert.ok(svg.querySelector('.series-current').getAttribute('d').startsWith('M56.0,'));
    assert.ok(svg.querySelector('.series-previous'), 'previous period drawn while comparing');
    assert.deepEqual([...svg.querySelectorAll('.axis-y')].map(label => label.textContent), ['$0', '$100', '$200', '$300', '$400']);
});

test('changing the range refetches, marks charts busy, and ignores a stale response', async t => {
    const { window, $, $$, text, user, api } = await loaded(t);

    user.click($('range-30'));
    await settle();
    assert.equal(api.requests.length, 2);
    assert.equal(api.requests[1].days, 30);
    assert.match(text('status'), /Refreshing/);
    assert.ok($$('chart-card section').every(card => card.getAttribute('aria-busy') === 'true'), 'busy is provided to every chart card');
    assert.ok($$('kpi-card').length, 'existing data stays visible while refreshing');

    user.click($('range-90'));
    await settle();
    assert.equal(api.requests[1].signal.aborted, true, 'the superseded request is aborted');
    assert.equal(window.location.search, '?days=90');

    // The aborted request resolves anyway; its data must not win.
    api.requests[1].resolve({ today: '2026-03-10', orders: [order('x', '2026-03-10', 'na', 'web', 'p1', 50, 5000)] });
    await settle();
    assert.match(text('status'), /Refreshing/);
    assert.equal(kpis($$).Revenue.value, '$700');

    api.requests[2].resolve(WEEK);
    await settle();
    assert.match(text('status'), /Updated just now · Dec 11 – Mar 10/);
    assert.equal(kpis($$).Orders.hint, '0 previous period');
    assert.ok($$('chart-card section').every(card => card.getAttribute('aria-busy') === 'false'));
    assert.equal($('revenue-card').querySelector('[data-part="caption"]').textContent, 'Compared with the previous 90 days');
});

test('a failed refresh keeps the last data and can be retried', async t => {
    const { $, $$, text, user, api } = await loaded(t);

    user.click($('refresh'));
    api.requests[1].reject(new Error('The analytics service is unavailable (503).'));
    await settle();

    assert.equal($('error').getAttribute('role'), 'alert');
    assert.equal(text('error'), "Couldn't load orders. The analytics service is unavailable (503). Showing the last data that loaded. Try again");
    assert.match(text('status'), /Last refresh failed/);
    assert.equal(kpis($$).Revenue.value, '$700', 'stale data remains');

    user.click($('retry'));
    await settle();
    assert.equal($('error'), null);
    api.requests[2].resolve({ ...WEEK, orders: [...WEEK.orders, order('c5', '2026-03-09', 'na', 'web', 'p2', 1, 300)] });
    await settle();
    assert.equal(kpis($$).Revenue.value, '$1,000');
});

test('a failed first load shows the error without pretending data exists', async t => {
    const { $, text, user, api } = await openDashboard(t);

    api.requests[0].reject(new Error('Network down'));
    await settle();
    assert.equal(text('error'), "Couldn't load orders. Network down Try again");
    assert.ok($('skeleton'));

    user.click($('retry'));
    api.requests[1].resolve(WEEK);
    await settle();
    assert.equal($('skeleton'), null);
});

test('region bars drill into a region and filter every widget', async t => {
    const { window, $, $$, text, user } = await loaded(t);
    const bars = () => $$('bar-chart button');

    assert.deepEqual(bars().map(text), ['Europe $400', 'North America $300'], 'sorted by revenue');
    user.click(bars()[0]);
    await settle();

    assert.equal($('region').value, 'eu', 'the select reflects the drill-down');
    assert.equal(window.location.search, '?days=7&region=eu');
    assert.deepEqual(bars().map(bar => bar.className), ['bar active', 'bar dimmed']);
    assert.equal(bars()[0].getAttribute('aria-pressed'), 'true');
    assert.equal(bars()[0].querySelector('.bar-fill').style.getPropertyValue('--size'), '100.0%');
    assert.equal(bars()[1].querySelector('.bar-fill').style.getPropertyValue('--size'), '75.0%');
    assert.deepEqual(bars().map(text), ['Europe $400', 'North America $300'], 'the region chart still shows every region');
    assert.equal(kpis($$).Revenue.value, '$400');
    assert.deepEqual(productRows($$, text).map(row => row[0]), ['Orbit Watch Wearables', 'Aria Earbuds Audio']);
    assert.deepEqual($$('[data-testid="chips"] button').map(text), ['Europe ×']);

    user.click($$('[data-testid="chips"] button')[0]);
    await settle();
    assert.equal($('region').value, '');
    assert.equal(kpis($$).Revenue.value, '$700');

    user.select($('region'), 'na');
    user.select($('category'), 'Audio');
    await settle();
    assert.equal(kpis($$).Revenue.value, '$200');
    assert.equal(window.location.search, '?days=7&region=na&category=Audio');
});

test('the donut legend toggles sales channels', async t => {
    const { window, $, $$, text, user } = await loaded(t);
    const legend = () => $$('donut-chart .legend button');

    assert.deepEqual(legend().map(text), ['Web store 42.9%', 'Mobile app 42.9%', 'Partners 14.3%']);
    assert.equal($('channel-card').querySelector('svg').getAttribute('aria-label'), 'Web store 42.9%, Mobile app 42.9%, Partners 14.3%');
    assert.equal($$('donut-chart .donut-arc').length, 3);

    user.click(legend()[2]);
    await settle();
    assert.equal(legend()[2].getAttribute('aria-pressed'), 'false');
    assert.equal(text(legend()[2]), 'Partners Hidden');
    assert.equal($$('donut-chart .donut-arc').length, 2);
    assert.equal(text($('channel-card').querySelector('.donut-total')), '$600');
    assert.equal(kpis($$).Revenue.value, '$600');
    assert.equal(window.location.search, '?days=7&channels=web%2Cmobile');
    assert.deepEqual($$('[data-testid="chips"] button').map(text), ['2 of 3 channels ×']);

    user.click(legend()[0]);
    user.click(legend()[1]);
    await settle();
    assert.equal(legend()[1].getAttribute('aria-pressed'), 'true', 'the last visible channel cannot be hidden');
    assert.equal(kpis($$).Revenue.value, '$300');

    user.click(legend()[0]);
    user.click(legend()[2]);
    await settle();
    assert.equal(kpis($$).Revenue.value, '$700');
    assert.equal(window.location.search, '?days=7');
});

test('filters restore from the query string', async t => {
    const { $, $$, text, api } = await openDashboard(t, { hash: '?days=7&region=eu&channels=mobile&compare=off' });
    api.requests[0].resolve(WEEK);
    await settle();

    assert.equal($('region').value, 'eu');
    assert.equal($('compare').checked, false);
    assert.equal($('revenue-card').querySelector('.series-previous'), null);
    assert.equal(kpis($$).Revenue.value, '$300');
    assert.deepEqual($$('[data-testid="chips"] button').map(text), ['Europe ×', '1 of 3 channels ×']);
});

test('products can be searched and sorted', async t => {
    const { $, $$, text, user } = await loaded(t);
    const header = label => $$('th').find(th => text(th) === label);
    const names = () => productRows($$, text).map(row => row[0].split(' ').slice(0, -1).join(' '));

    assert.equal(header('Revenue').getAttribute('aria-sort'), 'descending');
    user.click(header('Product').querySelector('button'));
    await settle();
    assert.equal(header('Product').getAttribute('aria-sort'), 'ascending');
    assert.equal(header('Revenue').getAttribute('aria-sort'), 'none');
    assert.deepEqual(names(), ['Aria Earbuds', 'Orbit Watch', 'Volt Mini']);

    user.click(header('Units').querySelector('button'));
    await settle();
    assert.deepEqual(names(), ['Volt Mini', 'Aria Earbuds', 'Orbit Watch']);
    user.click(header('Units').querySelector('button'));
    await settle();
    assert.deepEqual(names(), ['Orbit Watch', 'Aria Earbuds', 'Volt Mini']);

    // Products with no previous sales sort below every real change.
    user.click(header('vs previous').querySelector('button'));
    await settle();
    assert.deepEqual(names(), ['Aria Earbuds', 'Orbit Watch', 'Volt Mini']);

    user.type($('search'), 'WEAR');
    await settle();
    assert.deepEqual(names(), ['Orbit Watch'], 'search matches categories case-insensitively');
    assert.equal(text('product-count'), '1 of 3');

    user.type($('search'), 'nothing');
    await settle();
    assert.equal($$('[data-testid="product-rows"] tr').length, 0);
    assert.match(text($('products').parentElement.querySelector('.empty')), /No products match “nothing”/);
});

test('sorted rows are moved, not re-created, so their components survive', async t => {
    const { $$, text, user } = await loaded(t);
    const badges = () => $$('[data-testid="product-rows"] trend-badge');
    const [first] = badges();

    user.click($$('th button').find(button => text(button) === 'Product'));
    user.click($$('th button').find(button => text(button) === 'Product'));
    await settle();
    assert.ok(badges().includes(first), 'the same component instance is reused');
});

test('the revenue chart is keyboard accessible', async t => {
    const { $, text, user } = await loaded(t);
    const plot = $('revenue-card').querySelector('.plot');
    const tip = () => $('revenue-card').querySelector('[data-part="tip"]');

    assert.equal(plot.getAttribute('tabindex'), '0');
    assert.equal(plot.getAttribute('aria-label'), 'Daily revenue chart');
    assert.equal(tip(), null);

    assert.equal(user.key('End', { target: plot }).defaultPrevented, true);
    await settle();
    assert.equal(text(tip()), 'Mar 10 $200 $0 before');
    assert.ok($('revenue-card').querySelector('.cursor circle'));

    user.key('Home', { target: plot });
    user.key('ArrowRight', { target: plot });
    user.key('ArrowRight', { target: plot });
    await settle();
    assert.equal(text(tip()), 'Mar 6 $300 $0 before');
    user.key('ArrowLeft', { target: plot });
    await settle();
    assert.equal(text(tip()), 'Mar 5 $0 $100 before', 'previous period aligned day by day');

    user.click($('compare'));
    await settle();
    assert.equal(text(tip()), 'Mar 5 $0');
    assert.equal($('revenue-card').querySelector('.series-previous'), null);

    user.key('Escape', { target: plot });
    await settle();
    assert.equal(tip(), null);
    assert.equal(user.key('a', { target: plot }).defaultPrevented, false);
});

test('live mode streams orders into the dashboard and unsubscribes when turned off', async t => {
    const { $, $$, text, user, api } = await loaded(t);

    assert.match(text('feed').concat(text($('feed').nextElementSibling)), /Turn on Live/);
    user.click($('live'));
    await settle();
    assert.equal(api.listeners.size, 1);

    api.push({ ...order('l1', '2026-03-10', 'eu', 'partner', 'p3', 2, 50), at: Date.now() });
    await settle();
    assert.deepEqual($$('[data-testid="feed"] li').map(text), ['Volt Mini × 2 · Europe $50 just now']);
    assert.equal(kpis($$).Orders.value, '5');
    assert.equal(kpis($$).Revenue.value, '$750');
    assert.equal(productRows($$, text)[2][2], '$150');

    for (let index = 2; index <= 8; index++) api.push(order(`l${index}`, '2026-03-10', 'na', 'web', 'p1', 1, 100));
    await settle();
    assert.equal($$('[data-testid="feed"] li').length, 6, 'feed keeps the most recent orders');
    assert.equal(kpis($$).Orders.value, '12');

    user.click($('live'));
    await settle();
    assert.equal(api.listeners.size, 0, 'turning live off unsubscribes');
    assert.equal($('live').checked, false);
});

test('component timers stop when their component is removed or the app unmounts', async t => {
    const { window, $, $$, user, api, intervals } = await loaded(t);

    assert.equal(intervals.size, 1, 'the "updated" timestamp ticks');
    user.click($('live'));
    api.push({ ...order('l1', '2026-03-10', 'eu', 'web', 'p1', 1, 100), at: Date.now() });
    api.push({ ...order('l2', '2026-03-10', 'eu', 'web', 'p1', 1, 100), at: Date.now() });
    await settle();
    assert.equal($$('[data-testid="feed"] relative-time').length, 2);
    assert.equal(intervals.size, 3);

    user.click($('refresh'));
    await settle();
    assert.equal(intervals.size, 2, 'the status timestamp is removed while refreshing');

    window.dashboardApp.root.unmount();
    assert.equal(intervals.size, 0);
    assert.equal(api.listeners.size, 1, 'module-level subscriptions are not owned by the app');
    window.dashboardApp.dashboard.setLive(false);
    assert.equal(api.listeners.size, 0, 'the live effect cleanup unsubscribes');
});
