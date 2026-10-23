import { createApp } from '@jnreis/briojs';

const names = ['Blip', 'Mochi', 'Pip', 'Noodle', 'Ziggy', 'Bean', 'Gizmo', 'Waffles'];
const moods = ['happy', 'sleepy', 'mischievous'];
const colors = ['#5b8cff', '#ff7aa8', '#ffb347', '#4fd1a5', '#a78bfa', '#ffd84d'];
const pick = list => list[Math.floor(Math.random() * list.length)];

export function createCreature() {
    return createApp({
        state: () => ({
            name: 'Blip',
            mood: 'happy',
            color: colors[0],
            size: 100,
            colors,
            wiggles: 0,
            get greeting() {
                const name = this.name.trim() || 'This creature';
                if (this.mood === 'sleepy') return `${name} needs a nap.`;
                if (this.mood === 'mischievous') return `${name} is up to something.`;
                return `${name} is having a great day.`;
            },
            surprise() {
                this.name = pick(names.filter(name => name !== this.name));
                this.mood = pick(moods.filter(mood => mood !== this.mood));
                this.color = pick(colors.filter(color => color !== this.color));
                this.size = 70 + Math.round(Math.random() * 60);
                this.wiggles++;
            },
        }),
    });
}
