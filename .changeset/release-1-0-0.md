---
"@cdt5058/json-render-uswds": major
---

# v1.0.0 - Stable Release with Composition Architecture & Declarative Actions

## Breaking Changes

### Component Refactoring: Props-Based → Composition-Based Rendering

The following components have been refactored to follow the composition architecture pattern, accepting rendered child elements instead of prop-based arrays. This enables proper recursive rendering and better composition patterns with the @json-render framework.

**Affected Components:**
- **ButtonGroup**: Changed from `buttons` prop to `children` (renders Button components)
- **CardGroup**: Changed from `cards` prop to `children` (renders Card components)  
- **Breadcrumb**: Changed from `items` prop to `children` (renders Link components)
- **InPageNavigation**: Changed from `items` prop to `children` (renders Link components)
- **SideNav**: Changed from `items` prop to `children` (renders Link components)

**Migration Example:**

Before (v0.2.0):
```json
{
  "type": "ButtonGroup",
  "props": {
    "buttons": [
      { "label": "Cancel", "outline": true },
      { "label": "Submit" }
    ]
  }
}
```

After (v1.0.0):
```json
{
  "type": "ButtonGroup",
  "props": {},
  "children": [
    { "type": "Button", "props": { "label": "Cancel", "outline": true } },
    { "type": "Button", "props": { "label": "Submit" } }
  ]
}
```

### Accordion Component Refactoring

- **AccordionSection** (NEW): New child component for Accordion. Each section manages its own open/close state independently via `useState`.
- **Accordion**: Updated to render AccordionSection children instead of using the old `sections` prop.

**Migration Example:**

Before (v0.2.0):
```json
{
  "type": "Accordion",
  "props": {
    "sections": [
      { "title": "Section 1", "content": "Content 1" },
      { "title": "Section 2", "content": "Content 2" }
    ]
  }
}
```

After (v1.0.0):
```json
{
  "type": "Accordion",
  "props": { "bordered": false },
  "children": [
    {
      "type": "AccordionSection",
      "props": { "title": "Section 1" },
      "children": [{ "type": "Text", "props": { "text": "Content 1" } }]
    },
    {
      "type": "AccordionSection",
      "props": { "title": "Section 2" },
      "children": [{ "type": "Text", "props": { "text": "Content 2" } }]
    }
  ]
}
```

### Footer Component Refactoring

- **Footer** now accepts composition-based child elements (FooterNav, FooterContact, FooterSocial)
- Three new child components added for composition-aware footer layouts:
  - **FooterNav**: Renders Link children in navigation
  - **FooterContact**: Renders contact info children with optional heading
  - **FooterSocial**: Renders social link children in grid layout
- Legacy prop-based rendering (navGroups, contactInfo, socialLinks) still supported for backward compatibility but marked for deprecation in v2.0.0

## New Features

### Declarative Action Bindings

JSON specs can now declare event handlers as declarative actions. The spec schema has been extended to support an `actions` object on elements, enabling:

- **setState**: Update application state at a specified path
- **navigate**: Navigate to a URL
- **increment/decrement**: Update numeric state values

**Example:**

```json
{
  "root": "form-container",
  "elements": {
    "form-container": {
      "type": "Section",
      "children": ["step-1"],
      "actions": { "submit": { "type": "navigate", "href": "/success" } }
    },
    "step-1": {
      "type": "Button",
      "props": { "label": "Next" },
      "actions": { "press": { "type": "increment", "path": "/currentStep", "by": 1 } }
    }
  }
}
```

Supporting utilities:
- `executeAction()`: Processes action definitions
- `useActionHandler()`: React hook for action handling
- `createEmitWithActions()`: Wraps component emit to trigger actions

## Dependency Updates

- Upgraded `@json-render/core` to `^0.17.0`
- Upgraded `@json-render/react` to `^0.17.0`

## Why This Release

The composition-based architecture provides:
- ✅ **Proper recursive rendering**: Components can properly render other components
- ✅ **Framework alignment**: Follows @json-render v0.17.0 composition model
- ✅ **Better type safety**: Explicit child component structure
- ✅ **Declarative interactions**: Actions enable form navigation and state management without imperative callbacks
- ✅ **Future-proof API**: Foundation for v2.0.0 features
