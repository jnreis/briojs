# Brio AI developer kit

This kit helps assistants build applications with Brio v4. It is portable
documentation and an optional skill, not model training or a runtime plugin.

- Start with the tool-neutral [application guide](./brio-apps/references/guide.md).
- Compatible assistants can use the [Brio skill](./brio-apps/SKILL.md).
- Read the [recipes](./brio-apps/references/recipes.md) for running its assets.
- Migrating an existing 1.1.5 app? Use the separate
  [1.1.5 migration skill](./brio-migrate-1-1-5/SKILL.md) and its
  [migration guide](./brio-migrate-1-1-5/references/migration.md).

The npm package includes this entire directory. Installing `@jnreis/briojs` alone does
**not** install or activate assistant instructions.

## Install the skill manually

Copy the entire `brio-apps` folder, not just SKILL.md, from either:

- `node_modules/@jnreis/briojs/ai/brio-apps` in an npm-consuming project, or
- `ai/brio-apps` in this repository.

Choose one discovery location supported by your assistant, for example:

| Assistant integration | Example project location |
| --- | --- |
| VS Code Copilot with agent skill support | `.github/skills/brio-apps/` |
| Assistants supporting `.agents/skills` | `.agents/skills/brio-apps/` |
| Claude Code skill support | `.claude/skills/brio-apps/` |

Verify support in your assistant's current documentation/settings. These paths
are conventions, not a promise that every editor or model loads them. Avoid
duplicate copies in multiple discovery directories for the same assistant.
Reload/refresh discovery if required, then invoke the skill or ask the assistant
to use it for a Brio task. Verify it actually loads before relying on it.

The resulting directory must contain SKILL.md, references, and assets. Relative
links resolve inside that folder even outside the framework repository.

## Migrate a 1.1.5 application

Copy the entire `brio-migrate-1-1-5` folder to the corresponding skill discovery
location instead of installing only `brio-apps`. For example:
`.github/skills/brio-migrate-1-1-5/`. It is self-contained; installing both skills
is optional. Assistants without skills can read its migration guide, legacy
inventory, and verification checklist directly.

The legacy inventory was checked against the actual downloaded 1.1.5 bundle's
source map and commit `df5fbdc`, not inferred from today's documentation.
The kit identifies removed APIs and semantic differences, rather than promising
a drop-in upgrade or automatic codemod. It includes a before/after example,
project-instruction snippet, starter request, and rollout checklist.

The historical runtime is not redistributed in the kit. You can run the old
example with your own preserved bundle on a separate page. Never load the old
and new browser globals together or let both runtimes hydrate one subtree.
See the [paired example instructions](./brio-migrate-1-1-5/references/examples.md).

## Assistants without skills

Attach or explicitly point the assistant at
`node_modules/@jnreis/briojs/ai/brio-apps/references/guide.md` and the relevant recipes.
If it cannot access dependencies, copy or attach those documents.
No automatic `llms.txt` discovery, internet access, or MCP service is required.

## Optional consuming-project instruction

Add a short pointer to your project's existing instruction file rather than
duplicating the complete guide or replacing existing rules:

```md
This application uses Brio.js v4. Before changing Brio templates or application
code, check the installed version and read
node_modules/@jnreis/briojs/ai/brio-apps/references/guide.md.
If the brio-apps skill is installed, use it for Brio application tasks.
Use app.insert in JavaScript and contextual $insert in expressions/scripts.
Verify interaction and scoped cleanup with this application's existing tooling.
```

Adapt the path if using a copied skill or a standalone browser integration.
These are app-development instructions, not instructions for working on the
Brio framework internals.

## Updates and confidence

The references target v4.0.0. Check version compatibility after framework
upgrades and recopy the skill from the corresponding package version.
If you customize the copy, merge future updates deliberately.

The repository tests exercise the actual shipped recipe assets and check their
metadata/links and package inclusion. This validates the examples, not the
quality of every LLM's generated output. Review and test generated applications;
assistant skill discovery and instruction adherence are not guaranteed.
