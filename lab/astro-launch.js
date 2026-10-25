const astro = new URL(location.href);
astro.port = '4321';
astro.pathname = '/';
astro.search = '';
astro.searchParams.set('lab', location.origin);
astro.hash = '';
document.querySelector('#astro-launch-link').href = astro.href;
