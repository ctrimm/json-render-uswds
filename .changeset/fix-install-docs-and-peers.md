---
"@cdt5058/json-render-uswds": patch
---

Fix install documentation and peer dependency declarations.

- Declare `@uswds/uswds` as an optional `peerDependency` so the existing `peerDependenciesMeta.optional` flag is no longer inert.
- Rewrite the README `Install` section to match reality: list the actual peers users must provide (`react`, `react-dom`, `@uswds/uswds`, `zod`), note the `Node.js >=22.14.0` and React 19 requirements, and clarify that `@json-render/core` / `@json-render/react` are pulled in as transitive runtime dependencies.
