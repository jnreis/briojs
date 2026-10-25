import './astro-launch.js';

const search = document.querySelector('#experiment-search');
const filters = [...document.querySelectorAll('[data-category]')];
const sections = [...document.querySelectorAll('.directory .section')];
const experiments = [...document.querySelectorAll('a.test-link')].map(link => ({
    link,
    category: link.getAttribute('href').split('/')[2],
    text: link.textContent.toLowerCase(),
}));
let category = 'all';

const render = () => {
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const item of experiments) {
        const matches = (category === 'all' || item.category === category) &&
            terms.every(term => `${item.text} ${item.category}`.includes(term));
        item.link.hidden = !matches;
        if (matches) count++;
    }
    for (const section of sections) {
        for (const grid of section.querySelectorAll('.grid')) {
            grid.hidden = !grid.querySelector('a:not([hidden])');
            if (grid.previousElementSibling?.matches('.catalog-group'))
                grid.previousElementSibling.hidden = grid.hidden;
        }
        section.hidden = !section.querySelector('a.test-link:not([hidden])');
    }
    document.querySelector('#catalog-count').textContent = `${count} of ${experiments.length} experiments`;
    document.querySelector('#catalog-empty').hidden = count > 0;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
};

search.addEventListener('input', render);
for (const button of filters) button.addEventListener('click', () => {
    category = button.dataset.category;
    render();
});
document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey ||
        event.target.closest('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    search.focus();
});
render();
document.querySelector('.catalog-tools').hidden = false;
document.querySelector('#catalog-count').hidden = false;
