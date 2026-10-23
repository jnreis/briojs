import { createApp } from '@jnreis/briojs';
import { batch } from '@jnreis/briojs/reactivity';

export function createSpecimen() {
    let nextId = 0;
    const task = label => ({ id: ++nextId, label, done: false });

    return createApp({
        state: () => ({
            draft: '',
            tasks: [
                task('Keep the DOM real'),
                task('Give effects a lifetime'),
                task('Build something small'),
            ],
            add() {
                const label = this.draft.trim();
                if (!label) return;
                batch(() => {
                    this.tasks.push(task(label));
                    this.draft = '';
                });
            },
            rotate() {
                if (this.tasks.length > 1) {
                    batch(() => this.tasks.push(this.tasks.shift()));
                }
            },
            complete() {
                batch(() => this.tasks.forEach(task => { task.done = true; }));
            },
            remove(id) {
                this.tasks = this.tasks.filter(task => task.id !== id);
            },
            reset() {
                batch(() => {
                    this.draft = '';
                    this.tasks = [
                        task('Keep the DOM real'),
                        task('Give effects a lifetime'),
                        task('Build something small'),
                    ];
                });
            },
        }),
    });
}
