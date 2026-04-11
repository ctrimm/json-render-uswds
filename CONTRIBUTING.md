# Contributing to json-render-uswds

Thanks for your interest in contributing! This library implements [U.S. Web Design System](https://designsystem.digital.gov/) components for [`@json-render/core`](https://github.com/vercel-labs/json-render).

## Getting Started

```bash
git clone https://github.com/ctrimm/json-render-uswds.git
cd json-render-uswds
npm install
npm run build
```

Run the tests:

```bash
npm test
```

Run the demo app:

```bash
cd examples/demo
npm install
cp .env.example .env.local   # add your API keys
npm run dev
```

## Ways to Contribute

- **Bug reports** — Open an issue with a minimal reproduction
- **New USWDS components** — See the component guide below
- **Bug fixes** — Fork, fix, test, and open a PR
- **Documentation** — Improvements to the README, examples, or inline comments
- **Tests** — Additional coverage for existing components

## Adding a New Component

Components live in two places:

| File | Purpose |
|---|---|
| `src/components.tsx` | React implementation |
| `src/catalog.ts` | Schema definition (props, description for AI prompts) |

### 1. Add the schema to `src/catalog.ts`

```typescript
MyComponent: {
  props: z.object({
    label: z.string().describe("Button label"),
    variant: z.enum(["default", "outline"]).nullable(),
  }),
  description: "A one-sentence description for the AI system prompt.",
},
```

### 2. Add the React component to `src/components.tsx`

```tsx
MyComponent: ({ props }) => {
  return <div className="usa-my-component">{props.label}</div>;
},
```

### 3. Export it from `src/index.ts` if needed

Components are exported as part of `uswdsComponents`. No change needed unless you add a new named export.

### 4. Add tests

Create a test file at `src/components/__tests__/MyComponent.test.tsx`. See `StepIndicator.test.tsx` for an example pattern.

## Code Style

- TypeScript strict mode — no `any` unless genuinely unavoidable
- No `dangerouslySetInnerHTML` — use the `safeHref()` / `safeCssUrl()` helpers for user-controlled URLs
- Semantic HTML with ARIA attributes — all components must be keyboard-navigable
- Match existing USWDS class names exactly (e.g. `usa-button`, `usa-alert`)

## Pull Request Guidelines

1. Keep PRs focused — one feature or fix per PR
2. Include tests for new components
3. Run `npm run typecheck` and `npm test` before opening a PR
4. Reference the relevant [USWDS component](https://designsystem.digital.gov/components/) in the PR description

## Versioning

This project uses [changesets](https://github.com/changesets/changesets). After your change, run:

```bash
npm run changeset
```

and follow the prompts to document your change.

## License

By contributing, you agree that your contributions will be licensed under the [Apache-2.0 License](LICENSE).
