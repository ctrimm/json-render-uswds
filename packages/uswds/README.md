# @json-render/uswds

U.S. Web Design System (USWDS) component library for [json-render](https://json-render.dev). JSON becomes accessible, government-compliant React components.

- **58 components** — complete coverage of every standalone USWDS visual component
- **No `@trussworks/react-uswds` dependency** — raw `usa-*` CSS classes, React 19 compatible
- **Accessible** — ARIA roles, `useId()` per instance, semantic HTML throughout
- **Type-safe** — Zod schemas for every component's props
- **Server-safe catalog** — import schemas without React via `/catalog` entry point

## Installation

```bash
npm install @json-render/uswds
# peer deps
npm install react react-dom zod
```

Then load the USWDS stylesheet in your application:

```ts
// via npm
import "@uswds/uswds/css/uswds.css";

// or via CDN (in HTML <head>)
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uswds/uswds@3/dist/css/uswds.min.css">
```

## Quick Start

```tsx
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { defineRegistry, Renderer } from "@json-render/react";
import { uswdsComponentDefinitions } from "@json-render/uswds/catalog";
import { uswdsComponents } from "@json-render/uswds";

// 1. Build a catalog from USWDS definitions (pick the ones you need)
const catalog = defineCatalog(schema, {
  components: {
    Button: uswdsComponentDefinitions.Button,
    Alert: uswdsComponentDefinitions.Alert,
    Input: uswdsComponentDefinitions.Input,
    Table: uswdsComponentDefinitions.Table,
  },
});

// 2. Register the React implementations
const { registry } = defineRegistry(catalog, {
  components: {
    Button: uswdsComponents.Button,
    Alert: uswdsComponents.Alert,
    Input: uswdsComponents.Input,
    Table: uswdsComponents.Table,
  },
});

// 3. Render a spec
const spec = {
  root: "alert-1",
  elements: {
    "alert-1": {
      type: "Alert",
      props: { type: "success", heading: "Form submitted", message: "We received your request." },
    },
  },
};

export default function App() {
  return <Renderer spec={spec} registry={registry} />;
}
```

### Use all 58 components at once

```ts
import { uswdsComponentDefinitions } from "@json-render/uswds/catalog";
import { uswdsComponents } from "@json-render/uswds";

const catalog = defineCatalog(schema, { components: uswdsComponentDefinitions });
const { registry } = defineRegistry(catalog, { components: uswdsComponents });
```

### Server Components (catalog only)

The `/catalog` entry point is free of React imports and safe to use in Server Components or API routes:

```ts
import { uswdsComponentDefinitions } from "@json-render/uswds/catalog";

// Use definitions to build prompts, validate specs, etc.
const componentNames = Object.keys(uswdsComponentDefinitions);
```

## Components

### Layout
| Component | Description |
|---|---|
| `Grid` | Responsive grid row with equal-width columns |
| `Card` | Card container with media, header, and body |
| `CardGroup` | Responsive grid of cards |
| `Divider` | Horizontal rule |
| `Form` | Form container with USWDS width/spacing |
| `Section` | Padded page section with optional light/dark variant |

### Navigation
| Component | Description |
|---|---|
| `Accordion` | Expandable/collapsible content panels |
| `Breadcrumb` | Breadcrumb navigation trail |
| `Header` | Site header with primary navigation and search |
| `InPageNavigation` | Jump-link sidebar for long pages |
| `LanguageSelector` | Language switcher dropdown |
| `Link` | Anchor link with external-link indicator |
| `Pagination` | Page navigation with ellipsis |
| `SideNav` | Vertical sidebar navigation with sub-items |
| `SkipNav` | Accessible skip-to-content link |
| `StepIndicator` | Multi-step form progress indicator |

### Page-level
| Component | Description |
|---|---|
| `Footer` | Site footer — slim, medium, or big variant |
| `GovBanner` | "Official website of the United States government" banner |
| `Hero` | Full-width landing page callout section |
| `Identifier` | Agency identifier with required links and USA.gov |
| `Prose` | Typography wrapper applying USWDS text styles |

### Data Display
| Component | Description |
|---|---|
| `Alert` | Alert banner — info, success, warning, error, emergency |
| `Collection` | List of content items with date, tags, and thumbnail |
| `EmbedContainer` | Responsive aspect-ratio wrapper for iframes |
| `GraphicList` | Grid of image + text media blocks |
| `Heading` | h1–h6 heading with USWDS prose styling |
| `Icon` | Standalone USWDS SVG icon |
| `IconList` | Icon list with colored icons and content |
| `List` | Ordered, unordered, or unstyled list |
| `ProcessList` | Numbered step-by-step process list |
| `SiteAlert` | Site-wide announcement banner |
| `SummaryBox` | Key information summary box |
| `Table` | Data table — borderless, striped, compact, scrollable |
| `Tag` | Label/badge tag |
| `Text` | Paragraph text — body, lead, small, code |
| `Tooltip` | Hover tooltip — top, bottom, left, right |
| `ValidationChecklist` | Checklist for password/input requirements |

### Forms
| Component | Description |
|---|---|
| `Button` | Button — 9 variants including outline and unstyled |
| `ButtonGroup` | Group of buttons, optionally segmented |
| `CharacterCount` | Input or textarea with live character counter |
| `Checkbox` | Single checkbox with tile variant |
| `CheckboxGroup` | Fieldset of checkboxes |
| `ComboBox` | Searchable/filterable select dropdown |
| `DateInputGroup` | Three-field memorable date (month/day/year) |
| `DatePicker` | Native date picker with min/max constraints |
| `DateRangePicker` | Linked start/end date pickers |
| `FileInput` | File upload input |
| `Input` | Text input with label, hint, and validation |
| `InputGroup` | Input with prefix/suffix add-on (e.g. `$`, `.00`) |
| `InputMask` | Auto-formatted input — phone, ZIP, SSN, or custom |
| `Password` | Password input with show/hide toggle |
| `Radio` | Radio button group with tile variant |
| `RangeInput` | Range slider |
| `Search` | Search bar — small, medium, or big |
| `Select` | Select dropdown |
| `Textarea` | Multi-line textarea |
| `TimePicker` | Time selector with configurable step interval |

### Overlay
| Component | Description |
|---|---|
| `Modal` | Modal dialog driven by a boolean state path |

## State Binding

Form inputs support two-way binding via `$bindState`:

```json
{
  "type": "Input",
  "props": {
    "label": "Email",
    "name": "email",
    "type": "email",
    "value": { "$bindState": "/form/email" }
  }
}
```

## Field Validation

Pass `checks` and `validateOn` to any form input:

```json
{
  "type": "Input",
  "props": {
    "label": "Email",
    "name": "email",
    "checks": [
      { "type": "required", "message": "Email is required" },
      { "type": "email", "message": "Enter a valid email address" }
    ],
    "validateOn": "blur"
  }
}
```

## CSS Requirement

This package does **not** bundle USWDS CSS. Load it yourself:

```bash
npm install @uswds/uswds
```

```ts
import "@uswds/uswds/css/uswds.css";
```

Or via CDN — see the [USWDS documentation](https://designsystem.digital.gov/how-to-use-uswds/).

## License

Apache-2.0 — see [LICENSE](../../LICENSE).
