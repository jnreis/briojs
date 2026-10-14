# Paired migration example

- [before.html](./../assets/before.html) uses the actual 1.1.5 contracts.
- [after.html](./../assets/after.html) uses v4.0.0.

Copy the HTML files into a static server's document root. Provide your preserved
1.1.5 bundle at `/briojs.1.1.5.min.js` for the old page, and the v4 production
bundle at `/brio.min.js` for the new page. Paths are deployment paths, not
automatically exposed npm files. Open the pages separately, never combine their
Serve `brio.forms.min.js` beside the v4 bundle as referenced by the after page. Open the pages separately, never combine their
runtime scripts. The portable kit does not redistribute the old bundle.

The two pages cover app bootstrap, factory state, explicit method calls,
interpolation, numeric input, display preservation, conditional state reset,
loops, money formatting, contextual scripts, dynamic insertion, and cleanup.
They intentionally do not pretend to demonstrate every production integration.

| Conversion | Verified expectation |
| --- | --- |
| `newApp` / `$set.data` / async hydrate | `createApp({ state })` / explicit mount |
| `count` / mustache | `$data.count` / `${...}` |
| Numeric legacy model | Explicit `.number` in v4 preserves ordinary integer input; not all legacy JSON types |
| `b-each` / `$each` | `b-for` / `$for`, stable key added intentionally |
| Legacy display `b-show` | `.display` retains hidden element in the DOM |
| Local conditional state | Removing/recreating branch resets the local count |
| `$cleanup` | `ctx.onCleanup` in a scoped script |
| Content-first `$dom.insert` | Destination-first `$insert`, with an owned removal handle |

The old example gives its insertion destination a harmless title binding so it
retains a registered legacy BNode and therefore its inherited context. V4
tracks ordinary destination nodes without that workaround. Legacy rendered
updates are awaited in the tests; v4 bindings update synchronously.

Expected interactions: increment updates the shared count; entering `7` produces
a number; toggling resets the branch's local counter but leaves the display-
hidden section connected; inserted buttons update shared state and stop after
removal; pagehide tears down the external pulse listener. The host paragraph is
never owned by Brio.

**Intentional difference:** typing `123456` into the money input produces
`123,456` in 1.1.5 (integer/major-unit input), versus `1,234.56` in v4 (fixed-
precision/minor-unit input). This is a migration decision, not a compatible
formatter rename. Both render the initial `1234.56` as `1,234.56`. Preserve the
production app's amount semantics with an explicitly tested formatter/input
adapter or an approved UX change.

The framework's Node/jsdom tests also check the changed HTTP body encoding,
response parser/error-body behavior, and validation object/required semantics.
They execute the shipped v4 HTML. When the preserved
legacy bundle is present in the framework checkout, additional tests execute
the old HTML and verify the artifact's source baseline. Without that optional
bundle those legacy checks are explicitly skipped, not reported as passing.
The old bundle is not required by an installed skill.

These tests establish the small fixture's contracts, not a production migration.
Use the [verification checklist](./verification.md), including real-browser
transitions, focus, observers, and input-composition checks.
