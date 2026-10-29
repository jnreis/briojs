const labels = { log: 'Log', info: 'Info', warn: 'Warning', error: 'Error', debug: 'Debug' };
const limit = 500;

const clean = message => message.replace(/data:text\/javascript;base64,[A-Za-z0-9+/=]+/g, 'inline-script.js');

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

export function createConsole() {
    const panel = document.querySelector('#play-console');
    const toggle = document.querySelector('#play-console-toggle');
    const list = document.querySelector('#play-console-list');
    const badges = { error: document.querySelector('#play-console-errors'), warn: document.querySelector('#play-console-warnings') };
    const totals = { error: 0, warn: 0 };
    let last;
    let dropped = 0;
    let closedByUser = false;

    function setOpen(open) {
        toggle.setAttribute('aria-expanded', String(open));
        list.hidden = !open;
        panel.classList.toggle('open', open);
    }

    function updateBadges() {
        for (const [level, badge] of Object.entries(badges)) {
            const count = totals[level];
            const noun = level === 'error' ? 'error' : 'warning';
            badge.hidden = count === 0;
            badge.textContent = count ? String(count) : '';
            badge.title = `${count} ${noun}${count === 1 ? '' : 's'}`;
            badge.setAttribute('aria-label', badge.title);
        }
    }

    function entry(level, message) {
        const item = element('li', 'play-console-entry');
        item.dataset.level = level;
        const repeat = element('span', 'play-console-repeat');
        repeat.hidden = true;
        const label = element('span', 'sr-only', `${labels[level]}: `);
        const newline = message.indexOf('\n');
        let body;
        if (newline < 0) body = element('span', 'play-console-text', message);
        else {
            body = element('details', 'play-console-text');
            body.append(element('summary', '', message.slice(0, newline)), element('pre', '', message.slice(newline + 1)));
        }
        item.append(repeat, label, body);
        return item;
    }

    function trim() {
        while (list.querySelectorAll('.play-console-entry').length > limit) {
            list.querySelector('.play-console-entry').remove();
            dropped++;
        }
        if (!dropped) return;
        let note = list.querySelector('.play-console-note');
        if (!note) list.prepend(note = element('li', 'play-console-note'));
        note.textContent = `${dropped} earlier ${dropped === 1 ? 'message' : 'messages'} removed`;
    }

    function add(level, message) {
        if (!Object.hasOwn(labels, level) || typeof message !== 'string') return;
        message = clean(message);
        const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
        if (level in totals) totals[level]++;
        if (last?.level === level && last.message === message && last.item.isConnected) {
            const repeat = last.item.querySelector('.play-console-repeat');
            repeat.textContent = String(++last.count);
            repeat.title = `Repeated ${last.count} times`;
            repeat.hidden = false;
        } else {
            last = { level, message, count: 1, item: entry(level, message) };
            list.append(last.item);
            trim();
        }
        updateBadges();
        if (level === 'error' && !closedByUser) setOpen(true);
        if (atBottom) list.scrollTop = list.scrollHeight;
    }

    function clear() {
        list.replaceChildren();
        totals.error = totals.warn = 0;
        last = undefined;
        dropped = 0;
        updateBadges();
    }

    toggle.addEventListener('click', () => {
        const open = list.hidden;
        setOpen(open);
        closedByUser = !open;
    });
    document.querySelector('#play-console-clear').addEventListener('click', clear);

    return {
        add,
        clear,
        reset() {
            clear();
            closedByUser = false;
        },
    };
}
