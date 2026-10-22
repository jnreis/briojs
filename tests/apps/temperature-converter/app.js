(() => {
    const STORAGE_KEY = 'brio-apps:temperature-converter';
    const ABSOLUTE_ZERO = -273.15;
    const DEFAULTS = { celsius: 20, precision: 1 };

    const SCALES = {
        celsius: { symbol: '°C', toCelsius: value => value, fromCelsius: value => value },
        fahrenheit: { symbol: '°F', toCelsius: value => (value - 32) * 5 / 9, fromCelsius: value => value * 9 / 5 + 32 },
        kelvin: { symbol: 'K', toCelsius: value => value + ABSOLUTE_ZERO, fromCelsius: value => value - ABSOLUTE_ZERO },
    };

    const FORMULAS = {
        celsius: (input, c) => `${input} °C = ${c} °C`,
        fahrenheit: (input, c) => `(${input} °F − 32) × 5/9 = ${c} °C`,
        kelvin: (input, c) => `${input} K − 273.15 = ${c} °C`,
    };

    function parseTemperature(text) {
        const normalized = String(text).trim().replace(/\s+/g, '').replace(',', '.').replace('−', '-');
        if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(normalized)) return null;
        const value = Number(normalized);
        return Number.isFinite(value) ? value : null;
    }

    function roundTo(value, places) {
        const factor = 10 ** places;
        const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
        return Object.is(rounded, -0) ? 0 : rounded;
    }

    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Number.isFinite(saved?.celsius) && saved.celsius >= ABSOLUTE_ZERO && [0, 1, 2].includes(saved.precision)) {
                return { celsius: saved.celsius, precision: saved.precision };
            }
        } catch {
            // Storage may be unavailable (private mode) or hold malformed data.
        }
        return { ...DEFAULTS };
    }

    const app = brio.createApp({
        state: () => ({
            ...loadSettings(),
            editing: null,
            draft: '',
            presets: [
                { label: 'Absolute zero', celsius: ABSOLUTE_ZERO },
                { label: 'Water freezes', celsius: 0 },
                { label: 'Room', celsius: 21 },
                { label: 'Body', celsius: 37 },
                { label: 'Water boils', celsius: 100 },
            ],

            get celsiusInput() { return this.display('celsius'); },
            set celsiusInput(text) { this.edit('celsius', text); },
            get fahrenheitInput() { return this.display('fahrenheit'); },
            set fahrenheitInput(text) { this.edit('fahrenheit', text); },
            get kelvinInput() { return this.display('kelvin'); },
            set kelvinInput(text) { this.edit('kelvin', text); },

            get error() {
                if (!this.editing) return '';
                if (!this.draft.trim()) return 'Enter a temperature.';
                const value = parseTemperature(this.draft);
                if (value === null) return 'Enter a number, like 21.5 or -4.';
                if (value < this.minimum(this.editing) - 1e-9) {
                    return `That is below absolute zero (${this.format(this.editing, ABSOLUTE_ZERO)} ${SCALES[this.editing].symbol}).`;
                }
                return '';
            },
            // The rounded display of absolute zero can fall just below the exact limit
            // (-459.67 °F shows as -459.7), so accept what the converter itself displays.
            minimum(scale) {
                const exact = SCALES[scale].fromCelsius(ABSOLUTE_ZERO);
                return Math.min(exact, roundTo(exact, this.precision));
            },
            get reading() {
                return `${roundTo(this.celsius, this.precision)} °C`;
            },
            get condition() {
                const c = this.celsius;
                if (c <= ABSOLUTE_ZERO) return 'Absolute zero — molecular motion stops';
                if (c < 0) return 'Freezing';
                if (c < 10) return 'Cold';
                if (c < 18) return 'Cool';
                if (c < 25) return 'Comfortable';
                if (c < 32) return 'Warm';
                if (c < 100) return 'Hot';
                return 'Boiling';
            },
            get level() {
                const min = -30;
                const max = 50;
                return Math.round(Math.min(Math.max((this.celsius - min) / (max - min), 0), 1) * 100);
            },
            get formula() {
                const fromDraft = Boolean(this.editing) && !this.error;
                const scale = fromDraft ? this.editing : 'fahrenheit';
                const input = fromDraft ? this.draft.trim() : this.format(scale);
                const celsius = roundTo(this.celsius, this.precision);
                return scale === 'celsius'
                    ? `${input} °C = ${this.format('fahrenheit')} °F = ${this.format('kelvin')} K`
                    : FORMULAS[scale](input, celsius);
            },
            get isDefault() {
                return !this.editing && this.celsius === DEFAULTS.celsius && this.precision === DEFAULTS.precision;
            },

            format(scale, celsius = this.celsius) {
                return String(roundTo(SCALES[scale].fromCelsius(celsius), this.precision));
            },
            display(scale) {
                return this.editing === scale ? this.draft : this.format(scale);
            },
            edit(scale, text) {
                brio.batch(() => {
                    this.editing = scale;
                    this.draft = text;
                    if (this.error) return;
                    const celsius = SCALES[scale].toCelsius(parseTemperature(text));
                    this.celsius = Math.max(celsius, ABSOLUTE_ZERO);
                });
            },
            commit() {
                if (!this.error) this.editing = null;
            },
            hasError(scale) {
                return this.editing === scale && Boolean(this.error);
            },
            fieldClass(scale) {
                return {
                    'is-source': this.editing === scale,
                    'is-invalid': this.hasError(scale),
                    'is-stale': Boolean(this.error) && this.editing !== scale,
                };
            },
            usePreset(preset) {
                this.editing = null;
                this.celsius = preset.celsius;
            },
            reset() {
                this.editing = null;
                this.celsius = DEFAULTS.celsius;
                this.precision = DEFAULTS.precision;
            },
            persist(settings) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
                } catch {
                    // Persistence is a convenience; conversion keeps working without it.
                }
            },
        }),
    });

    app.mount('#temperature-app');
    window.temperatureApp = app;
})();
