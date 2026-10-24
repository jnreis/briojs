export const aboutPage = {
  template: `
    <h1>About</h1>
    <p>A single-page app built with Brio components and the optional router.
      Links are ordinary <code>&lt;a href&gt;</code> elements; the router
      intercepts the ones that match a route.</p>
  `,
};

export const notFoundPage = {
  template: `
    <h1>Page not found</h1>
    <p>Nothing lives at <code b-text="$route.path"></code>. <a href="/">Go home</a>.</p>
  `,
};
