/*
 * Reusable dashboard components. Registered by app.js on its Brio app:
 *   for (const [name, definition] of Object.entries(dashboardComponents)) app.component(name, definition);
 */
(() => {
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    /** Rounds `max / steps` up to 1, 2, 2.5, or 5 × 10ⁿ so axis ticks land on readable numbers. */
    const niceStep = (max, steps) => {
        const raw = max / steps || 1;
        const magnitude = 10 ** Math.floor(Math.log10(raw));
        const normalized = raw / magnitude;
        const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
        return nice * magnitude;
    };

    const toPath = points => points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

    const sparkGeometry = values => {
        const list = Array.isArray(values) ? values : [];
        if (list.length < 2) return { line: '', area: '' };
        const max = Math.max(...list, 1);
        const points = list.map((value, index) => [index / (list.length - 1) * 100, 26 - value / max * 24]);
        const line = toPath(points);
        return { line, area: `${line} L100,28 L0,28 Z` };
    };

    const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    window.dashboardComponents = {
        'spark-line': {
            template: `
                <svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path class="spark-area" b-bind-d="$data.shape.area"></path>
                    <path class="spark-stroke" b-bind-d="$data.shape.line"></path>
                </svg>`,
            setup({ $props }) {
                const shape = brio.computed(() => sparkGeometry($props.values));
                return { get shape() { return shape.value; } };
            },
        },

        'trend-badge': {
            template: `
                <span class="trend" b-bind-class="$data.tone" b-bind-aria-label="$data.label">
                    <span aria-hidden="true" b-text="$data.arrow"></span><span b-text="$data.text"></span>
                </span>`,
            setup({ $props, $stores }) {
                return {
                    get delta() {
                        const delta = $props.delta;
                        return typeof delta === 'number' && Number.isFinite(delta) ? delta : null;
                    },
                    get tone() {
                        if (this.delta === null) return 'new';
                        if (Math.abs(this.delta) < 0.005) return 'flat';
                        return this.delta > 0 ? 'up' : 'down';
                    },
                    get arrow() {
                        return { up: '▲', down: '▼', flat: '■', new: '' }[this.tone];
                    },
                    get text() {
                        return this.delta === null ? 'New' : $stores.format.percent(Math.abs(this.delta));
                    },
                    get label() {
                        if (this.delta === null) return 'No sales in the previous period';
                        if (this.tone === 'flat') return 'Unchanged from the previous period';
                        return `${this.tone === 'up' ? 'Up' : 'Down'} ${this.text} from the previous period`;
                    },
                };
            },
        },

        'kpi-card': {
            template: `
                <article class="kpi">
                    <header class="kpi-head">
                        <h3 class="kpi-label" b-text="$props.label"></h3>
                        <trend-badge b-bind-delta="$props.delta"></trend-badge>
                    </header>
                    <strong class="kpi-value" data-part="value" b-text="$props.value"></strong>
                    <p class="kpi-hint" data-part="hint" b-text="$props.hint"></p>
                    <spark-line class="kpi-spark" b-bind-values="$props.trend"></spark-line>
                </article>`,
        },

        'chart-card': {
            template: `
                <section class="panel chart-card" b-bind-aria-busy="$provided.busy ? 'true' : 'false'">
                    <header class="chart-head">
                        <div>
                            <h2 b-text="$props.heading"></h2>
                            <p class="chart-caption" data-part="caption" b-text="$props.caption"></p>
                        </div>
                        <div class="chart-actions"><slot name="actions"></slot></div>
                    </header>
                    <div class="chart-body"><slot></slot></div>
                </section>`,
        },

        'line-chart': {
            template: `
                <div class="line-chart">
                    <div class="plot" tabindex="0" role="group" b-bind-aria-label="$props.label"
                         b-on-keydown="$data.key($event)" b-on-mousemove="$data.move($event)"
                         b-on-mouseleave="$data.focus = null" b-on-blur="$data.focus = null">
                        <svg viewBox="0 0 960 250" class="plot-svg" aria-hidden="true" focusable="false">
                            <g class="grid">
                                <g b-for="tick in $data.chart.ticks" b-key="$for.tick.value">
                                    <line x1="56" x2="940" b-bind-y1="$for.tick.y" b-bind-y2="$for.tick.y"></line>
                                    <text x="48" class="axis-y" b-bind-y="$for.tick.y + 4" b-text="$for.tick.label"></text>
                                </g>
                            </g>
                            <text b-for="mark in $data.chart.marks" b-key="$for.mark.index" class="axis-x"
                                  y="242" b-bind-x="$for.mark.x" b-text="$for.mark.label"></text>
                            <path class="series-area" b-bind-d="$data.chart.area"></path>
                            <path class="series-previous" b-if="$props.compare" b-bind-d="$data.chart.previous"></path>
                            <path class="series-current" b-bind-d="$data.chart.current"></path>
                            <g b-if="$data.tip" class="cursor">
                                <line y1="12" y2="218" b-bind-x1="$data.tip.x" b-bind-x2="$data.tip.x"></line>
                                <circle r="4.5" b-bind-cx="$data.tip.x" b-bind-cy="$data.tip.y"></circle>
                            </g>
                        </svg>
                        <div class="chart-tip" data-part="tip" role="status" b-if="$data.tip"
                             b-bind-style="{ left: $data.tip.left + '%' }" b-bind-class="{ flip: $data.tip.left > 70 }">
                            <strong b-text="$data.tip.label"></strong>
                            <span><i class="key current"></i>\${$stores.format.currency($data.tip.value)}</span>
                            <span b-if="$props.compare"><i class="key previous"></i>\${$stores.format.currency($data.tip.previous)} before</span>
                        </div>
                    </div>
                    <p class="hint">Hover the chart, or focus it and use ← → Home End to inspect each day.</p>
                </div>`,
            setup({ $props, $stores }) {
                const WIDTH = 960;
                const LEFT = 56;
                const RIGHT = 940;
                const TOP = 12;
                const BOTTOM = 218;

                const chart = brio.computed(() => {
                    const points = $props.points ?? [];
                    const compare = Boolean($props.compare);
                    const highest = Math.max(1, ...points.map(point => compare ? Math.max(point.value, point.previous) : point.value));
                    const step = niceStep(highest, 4);
                    const max = Math.ceil(highest / step) * step;
                    const x = index => points.length < 2 ? (LEFT + RIGHT) / 2 : LEFT + index / (points.length - 1) * (RIGHT - LEFT);
                    const y = value => BOTTOM - value / max * (BOTTOM - TOP);
                    const current = points.map((point, index) => [x(index), y(point.value)]);
                    const markEvery = Math.max(1, Math.ceil(points.length / 6));
                    return {
                        xs: current.map(([px]) => px),
                        ys: current.map(([, py]) => py),
                        current: toPath(current),
                        area: current.length ? `${toPath(current)} L${x(points.length - 1)},${BOTTOM} L${LEFT},${BOTTOM} Z` : '',
                        previous: toPath(points.map((point, index) => [x(index), y(point.previous)])),
                        ticks: Array.from({ length: Math.round(max / step) + 1 }, (_, index) => ({
                            value: index * step,
                            y: y(index * step),
                            label: $stores.format.compactCurrency(index * step),
                        })),
                        marks: points
                            .map((point, index) => ({ index, x: x(index), label: point.label }))
                            .filter(mark => (points.length - 1 - mark.index) % markEvery === 0),
                    };
                });

                return {
                    focus: null,
                    get chart() { return chart.value; },
                    get tip() {
                        const points = $props.points ?? [];
                        if (this.focus === null || !points.length) return null;
                        const index = clamp(this.focus, 0, points.length - 1);
                        const point = points[index];
                        const x = this.chart.xs[index];
                        return { ...point, x, y: this.chart.ys[index], left: x / WIDTH * 100 };
                    },
                    key(event) {
                        const last = ($props.points ?? []).length - 1;
                        if (last < 0) return;
                        const moves = {
                            ArrowLeft: () => (this.focus ?? last + 1) - 1,
                            ArrowRight: () => (this.focus ?? -1) + 1,
                            Home: () => 0,
                            End: () => last,
                            Escape: () => null,
                        };
                        if (!(event.key in moves)) return;
                        event.preventDefault();
                        const next = moves[event.key]();
                        this.focus = next === null ? null : clamp(next, 0, last);
                    },
                    move(event) {
                        const last = ($props.points ?? []).length - 1;
                        const box = event.currentTarget.getBoundingClientRect();
                        if (last < 0 || !box.width) return;
                        const x = (event.clientX - box.left) / box.width * WIDTH;
                        this.focus = clamp(Math.round((x - LEFT) / (RIGHT - LEFT) * last), 0, last);
                    },
                };
            },
        },

        'bar-chart': {
            template: `
                <ol class="bars">
                    <li b-for="item in $props.items" b-key="$for.item.key">
                        <button type="button" class="bar"
                                b-bind-class="{ active: $props.selected === $for.item.key, dimmed: $props.selected && $props.selected !== $for.item.key }"
                                b-bind-aria-pressed="$props.selected === $for.item.key ? 'true' : 'false'"
                                b-on-click="$emit('drill', $for.item.key)">
                            <span class="bar-label" b-text="$for.item.label"></span>
                            <span class="bar-track"><span class="bar-fill" b-bind-style="{ '--size': $data.size($for.item) }"></span></span>
                            <span class="bar-value" b-text="$stores.format.compactCurrency($for.item.value)"></span>
                        </button>
                    </li>
                </ol>`,
            setup({ $props }) {
                return {
                    size(item) {
                        const max = Math.max(1, ...($props.items ?? []).map(entry => entry.value));
                        return `${(item.value / max * 100).toFixed(1)}%`;
                    },
                };
            },
        },

        'donut-chart': {
            template: `
                <div class="donut">
                    <svg viewBox="0 0 42 42" class="donut-svg" role="img" b-bind-aria-label="$data.summary">
                        <circle class="donut-ring" cx="21" cy="21" r="15.9155"></circle>
                        <circle b-for="arc in $data.arcs" b-key="$for.arc.key" class="donut-arc" cx="21" cy="21" r="15.9155"
                                b-bind-stroke="$for.arc.color" b-bind-stroke-dasharray="$for.arc.dash" b-bind-stroke-dashoffset="$for.arc.offset"></circle>
                        <text x="21" y="20.5" class="donut-total" b-text="$stores.format.compactCurrency($data.total)"></text>
                        <text x="21" y="26" class="donut-caption" b-text="$props.caption"></text>
                    </svg>
                    <ul class="legend">
                        <li b-for="segment in $props.segments" b-key="$for.segment.key">
                            <button type="button" class="legend-item" b-bind-class="{ off: !$for.segment.active }"
                                    b-bind-aria-pressed="$for.segment.active ? 'true' : 'false'"
                                    b-on-click="$emit('toggle', $for.segment.key)">
                                <span class="swatch" b-bind-style="{ background: $for.segment.color }"></span>
                                <span class="legend-label" b-text="$for.segment.label"></span>
                                <span class="legend-value" b-text="$for.segment.active ? $stores.format.percent($data.share($for.segment)) : 'Hidden'"></span>
                            </button>
                        </li>
                    </ul>
                </div>`,
            setup({ $props, $stores }) {
                const active = () => ($props.segments ?? []).filter(segment => segment.active && segment.value > 0);
                return {
                    get total() {
                        return active().reduce((sum, segment) => sum + segment.value, 0);
                    },
                    share(segment) {
                        return this.total ? segment.value / this.total : 0;
                    },
                    get arcs() {
                        const segments = active();
                        const gap = segments.length > 1 ? 0.8 : 0;
                        let start = 0;
                        return segments.map(segment => {
                            const length = this.share(segment) * 100;
                            const arc = {
                                key: segment.key,
                                color: segment.color,
                                dash: `${Math.max(0, length - gap).toFixed(2)} ${(100 - Math.max(0, length - gap)).toFixed(2)}`,
                                offset: (25 - start).toFixed(2),
                            };
                            start += length;
                            return arc;
                        });
                    },
                    get summary() {
                        return active()
                            .map(segment => `${segment.label} ${$stores.format.percent(this.share(segment))}`)
                            .join(', ') || 'No data';
                    },
                };
            },
        },

        'relative-time': {
            template: `<time b-bind-datetime="$data.iso" b-bind-title="$data.iso" b-text="$data.label"></time>`,
            setup({ $props }) {
                const now = brio.signal(Date.now());
                const timer = setInterval(() => { now.value = Date.now(); }, 1000);
                brio.onCleanup(() => clearInterval(timer));
                return {
                    get iso() {
                        return $props.time ? new Date(Number($props.time)).toISOString() : '';
                    },
                    get label() {
                        if (!$props.time) return 'never';
                        const seconds = Math.round((Number($props.time) - now.value) / 1000);
                        if (Math.abs(seconds) < 5) return 'just now';
                        if (Math.abs(seconds) < 60) return RELATIVE.format(seconds, 'second');
                        return RELATIVE.format(Math.round(seconds / 60), 'minute');
                    },
                };
            },
        },
    };
})();
