(() => {
    const preferred = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const restore = () => {
        let saved;
        try { saved = localStorage.getItem('starlight-theme'); }
        catch (error) { console.warn('Unable to read saved color theme.', error); }
        document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : preferred();
    };
    restore();
    addEventListener('pageshow', restore);
    addEventListener('storage', event => {
        if (event.key === 'starlight-theme' || event.key === null) restore();
    });
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelector('#theme-toggle')?.addEventListener('click', () => {
            const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = theme;
            try { localStorage.setItem('starlight-theme', theme); }
            catch (error) { console.warn('Unable to save color theme.', error); }
        });
    });
})();
