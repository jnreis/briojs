# Repository presentation and history

The current API reference is [DOCUMENTATION.md](../DOCUMENTATION.md).
The documents in [history/](./history/) preserve earlier implementation notes,
brainstorming, and the private v3 API. They are not current usage guidance.

## Presentation assets

- [Light logo](./assets/logo-light.svg) and [dark logo](./assets/logo-dark.svg):
  the README header and the website header, footer, and docs, using the favicon
  mark. GitHub picks one through `prefers-color-scheme`; the website follows its
  `data-theme` toggle. Edit them here, since the site imports these files.
- Creature builder, [light](./assets/creature-builder-light.webp) and
  [dark](./assets/creature-builder-dark.webp): looping animated WebPs of the real
  homepage demo, linked from the README. Regenerate both after the demo or its
  styles change: run `npm run site:build`, start
  `npm run site:preview -- --port 4392`, then run
  `node scripts/readme-demo.mjs http://127.0.0.1:4392`. The script needs
  `img2webp` from libwebp (`brew install webp`).
- [Social preview source](./assets/social-preview.svg): editable, original SVG
  using the website's logo and palette.
- [Social preview PNG](./assets/social-preview.png): a 1280 by 640 export for
  GitHub's repository social-preview setting. Upload it under repository
  **Settings > General > Social preview**. GitHub does not take this image from
  the README automatically.

Keep these images small and check the README in both GitHub themes. If the live
demo or branding changes, refresh the screenshots and image descriptions too.
The images are repository assets, not runtime files or part of the npm package.
