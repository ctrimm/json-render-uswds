---
name: uswds
description: USWDS component library for json-render. Use when building government-compliant, accessible UIs with @json-render/uswds, working with USWDS components, or rendering specs with federal accessibility standards.
---

# @json-render/uswds

U.S. Web Design System (USWDS) component library that generates accessible, government-compliant React components from JSON specs using `@json-render/core`.

## Installation

```bash
npm install @json-render/core @json-render/react @json-render/uswds @uswds/uswds
```

## Quick Start

```tsx
import "@uswds/uswds/css/uswds.css";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { uswdsComponentDefinitions } from "@json-render/uswds/catalog";
import { defineRegistry, Renderer } from "@json-render/react";
import { uswdsComponents } from "@json-render/uswds";
import type { Spec } from "@json-render/core";

const catalog = defineCatalog(schema, {
  components: uswdsComponentDefinitions,
});

const { registry } = defineRegistry(catalog, {
  components: uswdsComponents,
});

export function App({ spec }: { spec: Spec }) {
  return <Renderer spec={spec} registry={registry} />;
}
```

## Component Categories

**Layout Components (6)**
- Grid, CardGroup, Card, Divider, Footer, Section

**Navigation Components (9)**
- Header, SkipNav, SideNav, LanguageSelector, Link, InPageNavigation, Breadcrumb, Identifier, GovBanner

**Data Display (9)**
- Collection, IconList, Tooltip, Table, Heading, Text, Prose, Hero, GraphicList

**Feedback (5)**
- Alert, SiteAlert, Tag, SummaryBox, ProcessList

**Form Components (20)**
- Button, ButtonGroup, Input, Textarea, Select, Checkbox, CheckboxGroup, Radio, FileInput, Search, RangeInput, DateInputGroup, DateRangePicker, InputMask, Password, ComboBox, DatePicker, TimePicker, CharacterCount, Form

**Utility Components (7)**
- Accordion, Pagination, StepIndicator, Icon, InputGroup, List, ValidationChecklist, EmbedContainer, Modal

**Total: 58 USWDS Components**

## Component Definitions

Import the catalog definitions to extend with custom components:

```typescript
import { uswdsComponentDefinitions } from "@json-render/uswds/catalog";
import { z } from "zod";

const catalog = defineCatalog(schema, {
  components: {
    ...uswdsComponentDefinitions,
    CustomComponent: {
      props: z.object({ label: z.string() }),
      slots: ["default"],
      description: "Custom USWDS-styled component",
    },
  },
});
```

## Component Implementations

Use the pre-built component implementations:

```typescript
import { uswdsComponents } from "@json-render/uswds";

const { registry } = defineRegistry(catalog, {
  components: uswdsComponents,
});
```

Or override individual components:

```typescript
const { registry } = defineRegistry(catalog, {
  components: {
    ...uswdsComponents,
    CustomComponent: ({ props, children }) => (
      <div className="custom-wrapper">{props.label}</div>
    ),
  },
});
```

## Accessibility

All USWDS components comply with WCAG 2.1 AA standards:
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast compliance
- Form validation messages

## CSS Import

Required in your application:

```tsx
import "@uswds/uswds/css/uswds.css";
```

Or via CDN:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uswds/3.8.2/css/uswds.min.css">
```

## State Management

Enable data binding with `StateProvider`:

```tsx
import { StateProvider, createStateStore } from "@json-render/react";

const store = createStateStore({ formData: {} });

<StateProvider store={store}>
  <Renderer spec={spec} registry={registry} />
</StateProvider>
```

## Dynamic Props

Reference state in your specs:

```typescript
{
  type: "Button",
  props: {
    label: "$state.buttonText",
  },
}
```

## Catalog

The catalog export for AI generation:

```typescript
import { uswdsComponentDefinitions } from "@json-render/uswds/catalog";

const systemPrompt = catalog.prompt();
// Pass to your AI model to generate constrained specs
```

## Learn More

- [USWDS Documentation](https://designsystem.digital.gov/)
- [json-render Docs](https://json-render.dev)
- [Accessibility Guidelines](https://designsystem.digital.gov/how-to-use-uswds/accessibility/)
