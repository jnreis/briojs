(() => {
    const api = window.analyticsApi ?? window.createAnalyticsApi();
    const RANGES = [7, 30, 90];
    const CHANNEL_COLORS = { web: '#4f46e5', mobile: '#0ea5e9', partner: '#f59e0b' };
    const FEED_LIMIT = 6;

    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
    const number = new Intl.NumberFormat('en-US');
    const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
    const shortDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    const longDay = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
    const format = {
        currency: value => currency.format(value),
        compactCurrency: value => compact.format(value),
        number: value => number.format(value),
        percent: value => percent.format(value),
        day: iso => longDay.format(new Date(`${iso}T00:00:00Z`)),
        shortDay: iso => shortDay.format(new Date(`${iso}T00:00:00Z`)),
    };

    const addDays = (day, offset) => {
        const date = new Date(`${day}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + offset);
        return date.toISOString().slice(0, 10);
    };
    const change = (current, previous) => previous ? (current - previous) / previous : null;
    const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

    // Filters are shareable through the query string.
    const query = new URLSearchParams(location.search);
    const queryDays = Number(query.get('days'));
    const queryChannels = query.get('channels');

    const dashboard = brio.state({
        ranges: RANGES,
        filters: {
            days: RANGES.includes(queryDays) ? queryDays : 30,
            region: query.get('region') ?? '',
            category: query.get('category') ?? '',
            channels: queryChannels === null ? ['web', 'mobile', 'partner'] : queryChannels.split(',').filter(Boolean),
            compare: query.get('compare') !== 'off',
            search: '',
            sort: { key: 'revenue', direction: 'desc' },
        },
        catalog: { products: [], regions: [], channels: [], error: '' },
        request: { status: 'loading', error: '', updatedAt: 0 },
        live: { on: false, received: 0, feed: [] },
        network: api.network ?? null,

        get ready() { return dataset.value.orders.length > 0 || this.request.status === 'ready'; },
        get busy() { return this.request.status === 'refreshing'; },
        get periodLabel() {
            const { today, days } = dataset.value;
            return today ? `${format.shortDay(addDays(today, 1 - days))} – ${format.shortDay(today)}` : '';
        },
        get kpis() { return kpis.value; },
        get daily() { return daily.value; },
        get regions() { return regions.value; },
        get channels() { return channels.value; },
        get products() { return visibleProducts.value; },
        get productTotal() { return products.value.length; },
        get insights() { return insights.value; },
        get activeFilters() {
            const { region, category, channels: selected } = this.filters;
            const chips = [];
            if (region) chips.push({ key: 'region', label: this.catalog.regions.find(entry => entry.id === region)?.label ?? region });
            if (category) chips.push({ key: 'category', label: category });
            if (selected.length < 3) chips.push({ key: 'channels', label: `${selected.length} of 3 channels` });
            return chips;
        },

        setRange(days) {
            this.filters.days = days;
        },
        drill(region) {
            this.filters.region = this.filters.region === region ? '' : region;
        },
        toggleChannel(channel) {
            const selected = this.filters.channels;
            const index = selected.indexOf(channel);
            if (index === -1) selected.push(channel);
            else if (selected.length > 1) selected.splice(index, 1);
        },
        clearFilter(key) {
            if (key === 'channels') this.filters.channels = ['web', 'mobile', 'partner'];
            else this.filters[key] = '';
        },
        sortBy(key) {
            const sort = this.filters.sort;
            if (sort.key === key) sort.direction = sort.direction === 'asc' ? 'desc' : 'asc';
            else Object.assign(sort, { key, direction: key === 'name' ? 'asc' : 'desc' });
        },
        ariaSort(key) {
            const sort = this.filters.sort;
            return sort.key === key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
        },
        refresh() {
            load(dataset.value.days || this.filters.days);
        },
        setLive(on) {
            this.live.on = on;
        },
    });

    if (api.network) api.network = dashboard.network;

    // Orders are replaced wholesale and never mutated, so they are frozen to skip deep observation.
    const dataset = brio.signal(Object.freeze({ today: '', days: 0, orders: Object.freeze([]) }));

    const productIndex = brio.computed(() => new Map(dashboard.catalog.products.map(product => [product.id, product])));

    // Splits the loaded range into the current period and the one before it (same length) for comparisons.
    const periods = brio.computed(() => {
        const { today, days, orders } = dataset.value;
        const start = addDays(today || '1970-01-01', 1 - days);
        const current = [];
        const previous = [];
        for (const order of orders) (order.day >= start ? current : previous).push(order);
        return { today, days, start, current, previous };
    });

    /** Orders matching every active filter except `ignore`, so a chart can still show the options it filters by. */
    const matching = (orders, ignore) => {
        const { region, category, channels: selected } = dashboard.filters;
        const index = productIndex.value;
        return orders.filter(order =>
            (ignore === 'region' || !region || order.region === region)
            && (ignore === 'channels' || selected.includes(order.channel))
            && (!category || index.get(order.product)?.category === category));
    };

    const filtered = brio.computed(() => ({
        current: matching(periods.value.current),
        previous: matching(periods.value.previous),
    }));

    const daily = brio.computed(() => {
        const { today, days } = periods.value;
        if (!today) return [];
        const byDay = new Map();
        const previousByDay = new Map();
        for (const order of filtered.value.current) byDay.set(order.day, (byDay.get(order.day) ?? 0) + order.revenue);
        for (const order of filtered.value.previous) previousByDay.set(order.day, (previousByDay.get(order.day) ?? 0) + order.revenue);
        return Array.from({ length: days }, (_, index) => {
            const day = addDays(today, index + 1 - days);
            return {
                day,
                label: format.shortDay(day),
                value: byDay.get(day) ?? 0,
                previous: previousByDay.get(addDays(day, -days)) ?? 0,
            };
        });
    });

    /** Splits a period into at most 10 equal buckets for sparklines. */
    const buckets = (orders, pick) => {
        const { start, days } = periods.value;
        const count = Math.min(days, 10);
        const values = new Array(count).fill(0);
        const startTime = Date.parse(`${start}T00:00:00Z`);
        for (const order of orders) {
            const offset = (Date.parse(`${order.day}T00:00:00Z`) - startTime) / 86400000;
            values[Math.min(count - 1, Math.floor(offset / days * count))] += pick(order);
        }
        return values;
    };

    const kpis = brio.computed(() => {
        const { current, previous } = filtered.value;
        const revenue = sum(current, order => order.revenue);
        const previousRevenue = sum(previous, order => order.revenue);
        const units = sum(current, order => order.units);
        const previousUnits = sum(previous, order => order.units);
        const average = current.length ? revenue / current.length : 0;
        const previousAverage = previous.length ? previousRevenue / previous.length : 0;
        return [
            { key: 'revenue', label: 'Revenue', value: format.currency(revenue), raw: revenue,
                delta: change(revenue, previousRevenue), hint: `${format.currency(previousRevenue)} previous period`,
                trend: buckets(current, order => order.revenue) },
            { key: 'orders', label: 'Orders', value: format.number(current.length), raw: current.length,
                delta: change(current.length, previous.length), hint: `${format.number(previous.length)} previous period`,
                trend: buckets(current, () => 1) },
            { key: 'average', label: 'Average order', value: format.currency(average), raw: average,
                delta: change(average, previousAverage), hint: `${format.currency(previousAverage)} previous period`,
                trend: buckets(current, order => order.revenue / Math.max(1, current.length)) },
            { key: 'units', label: 'Units sold', value: format.number(units), raw: units,
                delta: change(units, previousUnits), hint: `${format.number(previousUnits)} previous period`,
                trend: buckets(current, order => order.units) },
        ];
    });

    const regions = brio.computed(() => {
        const totals = new Map();
        for (const order of matching(periods.value.current, 'region')) totals.set(order.region, (totals.get(order.region) ?? 0) + order.revenue);
        return dashboard.catalog.regions
            .map(region => ({ key: region.id, label: region.label, value: totals.get(region.id) ?? 0 }))
            .sort((a, b) => b.value - a.value);
    });

    const channels = brio.computed(() => {
        const totals = new Map();
        for (const order of matching(periods.value.current, 'channels')) totals.set(order.channel, (totals.get(order.channel) ?? 0) + order.revenue);
        return dashboard.catalog.channels.map(channel => ({
            key: channel.id,
            label: channel.label,
            color: CHANNEL_COLORS[channel.id] ?? '#9ca3af',
            value: totals.get(channel.id) ?? 0,
            active: dashboard.filters.channels.includes(channel.id),
        }));
    });

    const products = brio.computed(() => {
        const { current, previous } = filtered.value;
        const revenue = sum(current, order => order.revenue);
        const rows = new Map();
        const row = id => {
            let entry = rows.get(id);
            if (!entry) {
                const product = productIndex.value.get(id);
                if (!product) return null;
                entry = { id, name: product.name, category: product.category, units: 0, revenue: 0, previous: 0, orders: [] };
                rows.set(id, entry);
            }
            return entry;
        };
        for (const order of current) {
            const entry = row(order.product);
            if (!entry) continue;
            entry.units += order.units;
            entry.revenue += order.revenue;
            entry.orders.push(order);
        }
        for (const order of previous) {
            const entry = row(order.product);
            if (entry) entry.previous += order.revenue;
        }
        return [...rows.values()].map(({ orders, ...entry }) => ({
            ...entry,
            share: revenue ? entry.revenue / revenue : 0,
            delta: change(entry.revenue, entry.previous),
            trend: buckets(orders, order => order.revenue),
        }));
    });

    const visibleProducts = brio.computed(() => {
        const search = dashboard.filters.search.trim().toLowerCase();
        const { key, direction } = dashboard.filters.sort;
        const factor = direction === 'asc' ? 1 : -1;
        return products.value
            .filter(entry => !search || entry.name.toLowerCase().includes(search) || entry.category.toLowerCase().includes(search))
            .sort((a, b) => {
                const left = a[key] ?? -Infinity;
                const right = b[key] ?? -Infinity;
                return (typeof left === 'string' ? left.localeCompare(right) : left - right) * factor || a.name.localeCompare(b.name);
            });
    });

    const insights = brio.computed(() => {
        const rows = products.value;
        if (!rows.length) return [];
        const notes = [];
        const best = rows.reduce((top, entry) => entry.revenue > top.revenue ? entry : top);
        notes.push({ key: 'best', tone: 'info', text: `${best.name} leads with ${format.currency(best.revenue)} (${format.percent(best.share)} of revenue).` });
        const movers = rows.filter(entry => entry.delta !== null && entry.previous >= 500);
        if (movers.length) {
            const rising = movers.reduce((top, entry) => entry.delta > top.delta ? entry : top);
            const falling = movers.reduce((low, entry) => entry.delta < low.delta ? entry : low);
            if (rising.delta > 0) notes.push({ key: 'rising', tone: 'up', text: `${rising.name} is up ${format.percent(rising.delta)} on the previous period.` });
            if (falling.delta < 0) notes.push({ key: 'falling', tone: 'down', text: `${falling.name} dropped ${format.percent(-falling.delta)}; check stock and campaigns.` });
        }
        const top = regions.value[0];
        if (top?.value && !dashboard.filters.region) notes.push({ key: 'region', tone: 'info', text: `${top.label} is the strongest region at ${format.currency(top.value)}.` });
        return notes;
    });

    // Async loading: every range change starts a new request and aborts the one in flight.
    let controller = null;
    let loads = 0;
    async function load(days) {
        controller?.abort();
        const mine = controller = new AbortController();
        dashboard.request.status = loads++ ? 'refreshing' : 'loading';
        dashboard.request.error = '';
        try {
            const result = await api.fetchOrders({ days, signal: mine.signal });
            if (mine !== controller) return;
            dataset.value = Object.freeze({ today: result.today, days, orders: Object.freeze(result.orders.map(Object.freeze)) });
            brio.batch(() => {
                dashboard.request.status = 'ready';
                dashboard.request.updatedAt = Date.now();
            });
        } catch (error) {
            if (mine !== controller || error?.name === 'AbortError') return;
            brio.batch(() => {
                dashboard.request.status = 'error';
                dashboard.request.error = error?.message || 'Something went wrong while loading orders.';
            });
        } finally {
            if (mine === controller) controller = null;
        }
    }

    api.fetchCatalog().then(
        catalog => Object.assign(dashboard.catalog, catalog, { error: '' }),
        error => { dashboard.catalog.error = error?.message || 'The product catalog failed to load.'; },
    );

    // Live orders are appended to today's data; a feed shows the most recent ones.
    function receive(order) {
        const current = dataset.value;
        if (!current.today) return;
        dataset.value = Object.freeze({ ...current, orders: Object.freeze([...current.orders, Object.freeze(order)]) });
        const product = productIndex.value.get(order.product);
        dashboard.live.received++;
        dashboard.live.feed.unshift({
            ...order,
            at: order.at ?? Date.now(),
            name: product?.name ?? order.product,
            region: dashboard.catalog.regions.find(region => region.id === order.region)?.label ?? order.region,
        });
        if (dashboard.live.feed.length > FEED_LIMIT) dashboard.live.feed.length = FEED_LIMIT;
    }

    const app = brio.createApp({ stores: { format }, state: () => dashboard });
    for (const [name, definition] of Object.entries(window.dashboardComponents)) app.component(name, definition);

    // Only the range triggers a reload; whatever load() reads stays untracked.
    brio.effect(() => {
        const days = dashboard.filters.days;
        brio.untrack(() => load(days));
    });

    // The subscription lives exactly as long as live mode is on: cleanup runs before the next run.
    brio.effect(() => {
        if (dashboard.live.on) brio.onCleanup(api.subscribe(receive));
    });

    brio.effect(() => {
        const { days, region, category, channels: selected, compare } = dashboard.filters;
        const params = new URLSearchParams();
        if (days !== 30) params.set('days', days);
        if (region) params.set('region', region);
        if (category) params.set('category', category);
        if (selected.length < 3) params.set('channels', selected.join(','));
        if (!compare) params.set('compare', 'off');
        const search = params.size ? `?${params}` : '';
        if (search !== location.search) history.replaceState(history.state, '', `${location.pathname}${search}${location.hash}`);
    });

    const root = app.mount('#dashboard');
    window.dashboardApp = { app, root, dashboard, dataset };
})();
