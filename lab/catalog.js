import directory from '../tests/index.html?raw';

const directoryDocument = new DOMParser().parseFromString(directory, 'text/html');
export const experiments = [...directoryDocument.querySelectorAll('a.test-link')].map(link => {
    const path = link.getAttribute('href');
    const category = path.split('/')[2];
    const name = link.firstChild.textContent.trim().replace(/\.html$/, '');
    return {
        path,
        category,
        name,
        description: link.querySelector('.desc').textContent.trim(),
    };
});

export function installCatalog() {
    const search = document.querySelector('#experiment-search');
    const grid = document.querySelector('#experiment-grid');
    const filters = [...document.querySelectorAll('[data-category]')];
    let category = 'all';
    const render = () => {
        const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const matches = experiments.filter(item =>
            (category === 'all' || item.category === category) &&
            terms.every(term => `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(term)));
        const cards = matches.map(item => {
            const link = document.createElement('a');
            link.className = 'experiment-card';
            link.href = item.path;
            const tag = document.createElement('span');
            tag.className = 'experiment-kind';
            tag.textContent = item.category === 'methods' ? 'utilities' : item.category;
            const title = document.createElement('h3');
            title.textContent = item.name;
            const description = document.createElement('p');
            description.textContent = item.description;
            const path = document.createElement('code');
            path.textContent = item.path;
            link.append(tag, title, description, path);
            return link;
        });
        grid.replaceChildren(...cards);
        document.querySelector('#catalog-count').textContent = `${matches.length} of ${experiments.length} experiments`;
        document.querySelector('#catalog-empty').hidden = matches.length > 0;
        filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    };
    const filter = event => {
        category = event.currentTarget.dataset.category;
        render();
    };
    const shortcut = event => {
        if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey ||
            event.target.closest('input, textarea, select, [contenteditable]')) return;
        event.preventDefault();
        search.focus();
    };
    search.addEventListener('input', render);
    filters.forEach(button => button.addEventListener('click', filter));
    document.addEventListener('keydown', shortcut);
    render();
    return () => {
        search.removeEventListener('input', render);
        filters.forEach(button => button.removeEventListener('click', filter));
        document.removeEventListener('keydown', shortcut);
    };
}
