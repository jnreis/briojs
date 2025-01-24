let a = (e, t, r, p) => {
  p.evalEffect(e, t, r, (c) => ([o]) => {
    c.textContent = o().toUpperCase();
  });
};
try {
  $set.directive("b-uppercase", a);
} catch {
  console.error('Could not set the "b-uppercase" directive.');
}
export {
  a as hydrateUpperCase
};
