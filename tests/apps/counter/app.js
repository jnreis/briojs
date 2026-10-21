(() => {
    const MAX_HISTORY = 50;
    const VISIBLE_HISTORY = 6;
    const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const app = brio.createApp({
        state: () => ({
            venue: 'Main Hall · North Entrance',
            capacity: 120,
            count: 0,
            step: 1,
            history: [],
            totalIn: 0,
            totalOut: 0,
            nextEntryId: 1,

            get validCapacity() {
                return Number.isInteger(this.capacity) && this.capacity > 0 ? this.capacity : 0;
            },
            get remaining() {
                return this.validCapacity - this.count;
            },
            get percent() {
                return this.validCapacity ? Math.round((this.count / this.validCapacity) * 100) : 0;
            },
            get status() {
                if (!this.validCapacity) return 'invalid';
                if (this.count > this.validCapacity) return 'over';
                if (this.count === this.validCapacity) return 'full';
                return this.percent >= 80 ? 'busy' : 'open';
            },
            get statusLabel() {
                return {
                    invalid: 'Set a capacity',
                    over: 'Over capacity',
                    full: 'At capacity',
                    busy: 'Filling up',
                    open: 'Open',
                }[this.status];
            },
            get remainingLabel() {
                if (!this.validCapacity) return 'Capacity must be a whole number above zero';
                if (this.remaining < 0) return `${-this.remaining} over the limit of ${this.validCapacity}`;
                if (this.remaining === 0) return 'No spots left';
                return `${this.remaining} of ${this.validCapacity} spots left`;
            },
            get canAdd() {
                return this.validCapacity > 0 && this.count < this.validCapacity;
            },
            get canRemove() {
                return this.count > 0;
            },
            get recent() {
                return this.history.slice(-VISIBLE_HISTORY).reverse();
            },

            record(delta) {
                if (!delta) return;
                this.count += delta;
                this.tally(delta, 1);
                this.history.push({ id: this.nextEntryId++, delta, total: this.count, at: new Date().toISOString() });
                if (this.history.length > MAX_HISTORY) this.history.splice(0, this.history.length - MAX_HISTORY);
            },
            add() {
                if (this.canAdd) this.record(Math.min(this.step, this.remaining));
            },
            remove() {
                if (this.canRemove) this.record(-Math.min(this.step, this.count));
            },
            undo() {
                const last = this.history.pop();
                if (!last) return;
                this.count -= last.delta;
                this.tally(last.delta, -1);
            },
            tally(delta, direction) {
                if (delta > 0) this.totalIn += delta * direction;
                else this.totalOut -= delta * direction;
            },
            reset() {
                this.count = 0;
                this.totalIn = 0;
                this.totalOut = 0;
                this.history.splice(0);
            },
            handleShortcut(event) {
                if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
                const target = event.target;
                if (target.closest?.('select, textarea, [contenteditable]:not([contenteditable="false"])')) return;
                // Radios and checkboxes keep focus after a click but don't consume text keys;
                // arrows still belong to them (they move the radio selection).
                const isToggle = target.matches?.('input[type="radio"], input[type="checkbox"]');
                if (target.matches?.('input') && !isToggle) return;
                const arrows = !isToggle;
                if (event.key === '+' || event.key === '=' || (arrows && event.key === 'ArrowUp')) this.add();
                else if (event.key === '-' || event.key === '−' || (arrows && event.key === 'ArrowDown')) this.remove();
                else if (event.key.toLowerCase() === 'z') this.undo();
                else return;
                event.preventDefault();
            },
            formatTime(iso) {
                return timeFormat.format(new Date(iso));
            },
        }),
    });

    app.mount('#occupancy-app');
    window.occupancyApp = app;
})();
