# Brio starter templates

Runnable starting points for [Brio.js](https://briojs.com). Each folder is a
complete project: open it in StackBlitz, or copy it and run `npm install` and
`npm run dev`.

| Template | What you get | Try it |
| --- | --- | --- |
| [widget](./widget/) | A Brio widget inside a page you already have. | [Open in StackBlitz](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/widget?file=index.html) |
| [multi-page](./multi-page/) | Real pages and links, with Brio enhancing only the interactive parts. | [Open in StackBlitz](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/multi-page?file=index.html) |
| [spa](./spa/) | Components, the router, route parameters, and shared state. | [Open in StackBlitz](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/spa?file=src%2Fmain.js) |
| [astro](./astro/) | Astro renders the pages; Brio brings the islands to life. | [Open in StackBlitz](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/astro?file=src%2Fpages%2Findex.astro) |
| [plugin](./plugin/) | A publishable plugin with a directive, a helper, tests, and editor autocomplete. | [Open in StackBlitz](https://stackblitz.com/github/jnreis/briojs/tree/main/templates/plugin?file=src%2Findex.js) |

Copy one locally without cloning the repository:

```sh
npx degit jnreis/briojs/templates/widget my-brio-app
cd my-brio-app
npm install
npm run dev
```

Every template includes `.vscode/settings.json` for Brio directive
autocomplete. Templates install the published `@jnreis/briojs` package, not
this repository's source.

## Project scaffolder (prepared, not yet published)

The [create-brio package](../packages/create-brio/) generates any of these five
templates in JavaScript or TypeScript, including editor settings. It prompts
for a project directory and package manager, never overwrites an existing
project, and leaves installation and git initialization to you.

After `create-brio` and Brio 5 are published:

```sh
npm create brio@latest
# Or supply all choices:
npm create brio@latest my-app -- --template spa --language ts --package-manager npm
```

Until then, use the local packing and validation commands in the package README.
