/*
 * Stand-in for an analytics backend. Pages (and tests) can provide their own
 * `window.analyticsApi` with the same shape:
 *
 *   fetchCatalog()                  -> Promise<{ products, regions, channels }>
 *   fetchOrders({ days, signal })   -> Promise<{ today, orders }> covering 2 × days (current + previous period)
 *   subscribe(onOrder)              -> unsubscribe()
 */
(() => {
    const REGIONS = [
        { id: 'na', label: 'North America' },
        { id: 'eu', label: 'Europe' },
        { id: 'apac', label: 'Asia Pacific' },
        { id: 'latam', label: 'Latin America' },
    ];
    const CHANNELS = [
        { id: 'web', label: 'Web store' },
        { id: 'mobile', label: 'Mobile app' },
        { id: 'partner', label: 'Partners' },
    ];
    const CATALOG = {
        Audio: ['Aria Earbuds', 'Aria Pro Earbuds', 'Pulse Headphones', 'Pulse Studio', 'Echo Mini Speaker', 'Echo Max Speaker',
            'Halo Soundbar', 'Drift Turntable', 'Wave Microphone', 'Wave Lite Microphone', 'Bass Cube', 'Nomad Radio'],
        Wearables: ['Orbit Watch', 'Orbit Watch Sport', 'Stride Band', 'Stride Band Kids', 'Lumen Ring', 'Vista Glasses',
            'Tempo Clip', 'Pulse Strap', 'Glide Tracker', 'Halo Pendant', 'Orbit Charger', 'Stride Straps'],
        Home: ['Nest Hub Lamp', 'Glow Strip', 'Glow Bulb 4-pack', 'Breeze Purifier', 'Frost Fan', 'Ember Heater',
            'Sentinel Cam', 'Sentinel Doorbell', 'Hearth Thermostat', 'Drop Leak Sensor', 'Mesh Router', 'Mesh Extender'],
        Accessories: ['Volt Power Bank', 'Volt Mini', 'Snap Case', 'Snap Wallet', 'Dock Stand', 'Dock Trio Charger',
            'Loop Cable 2m', 'Loop Cable 1m', 'Carry Sleeve 13"', 'Carry Sleeve 15"', 'Pixel Stylus', 'Grip Mount'],
    };

    const products = [];
    let price = 0;
    for (const [category, names] of Object.entries(CATALOG)) {
        for (const name of names) {
            const id = `p${String(products.length + 1).padStart(2, '0')}`;
            price = (price * 7 + 23) % 31;
            products.push({ id, name, category, price: 19 + price * 9 });
        }
    }

    const hash = text => {
        let value = 2166136261;
        for (let index = 0; index < text.length; index++) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
        return value >>> 0;
    };
    const seeded = seed => () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const isoDay = date => date.toISOString().slice(0, 10);
    const addDays = (day, offset) => {
        const date = new Date(`${day}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + offset);
        return isoDay(date);
    };

    // Each day's orders are derived from the date alone, so overlapping ranges agree.
    const ordersFor = day => {
        const random = seeded(hash(day));
        const age = (Date.parse(`${day}T00:00:00Z`) / 86400000) % 365;
        const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
        const count = Math.round(34 + age / 20 + (weekday === 0 || weekday === 6 ? 14 : 0) + random() * 16);
        return Array.from({ length: count }, (_, index) => {
            const product = products[Math.floor(random() ** 1.6 * products.length)];
            const region = REGIONS[Math.floor(random() ** 1.3 * REGIONS.length)].id;
            const roll = random();
            const channel = roll < 0.5 ? 'web' : roll < 0.85 ? 'mobile' : 'partner';
            const units = 1 + Math.floor(random() ** 3 * 4);
            return { id: `${day}-${index}`, day, region, channel, product: product.id, units, revenue: units * product.price };
        });
    };

    const respond = (network, signal, produce) => new Promise((resolve, reject) => {
        const abort = () => {
            clearTimeout(timer);
            reject(new DOMException('The request was aborted.', 'AbortError'));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', abort);
            if (network.failNext) {
                network.failNext = false;
                reject(new Error('The analytics service is unavailable (503).'));
            } else {
                resolve(produce());
            }
        }, network.latency);
        signal?.addEventListener('abort', abort, { once: true });
    });

    let liveSequence = 0;

    window.createAnalyticsApi = () => ({
        // Simulation knobs; the dashboard swaps in a reactive copy so its controls stay in sync.
        network: { latency: 650, failNext: false },
        fetchCatalog() {
            return respond(this.network, undefined, () => ({ products, regions: REGIONS, channels: CHANNELS }));
        },
        fetchOrders({ days, signal }) {
            return respond(this.network, signal, () => {
                const today = isoDay(new Date());
                const orders = [];
                for (let offset = 2 * days - 1; offset >= 0; offset--) orders.push(...ordersFor(addDays(today, -offset)));
                return { today, orders };
            });
        },
        subscribe(onOrder) {
            const random = seeded(Date.now());
            const timer = setInterval(() => {
                const product = products[Math.floor(random() * products.length)];
                const units = 1 + Math.floor(random() * 3);
                onOrder({
                    id: `live-${++liveSequence}`,
                    day: isoDay(new Date()),
                    region: REGIONS[Math.floor(random() * REGIONS.length)].id,
                    channel: CHANNELS[Math.floor(random() * CHANNELS.length)].id,
                    product: product.id,
                    units,
                    revenue: units * product.price,
                    at: Date.now(),
                });
            }, 2500);
            return () => clearInterval(timer);
        },
    });
})();
