# @cdt5058/json-render-uswds

## 1.0.0

### Major Changes

- 94a218e: # v1.0.0 - Stable Release with Composition Architecture & Declarative Actions

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
      "buttons": [{ "label": "Cancel", "outline": true }, { "label": "Submit" }]
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
        "actions": {
          "press": { "type": "increment", "path": "/currentStep", "by": 1 }
        }
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

  ## Migration Guide

  See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions for each affected component.

- b9013e0: # v1.0.0 - Stable Release with Composition Architecture & Declarative Actions

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
      "buttons": [{ "label": "Cancel", "outline": true }, { "label": "Submit" }]
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
        "actions": {
          "press": { "type": "increment", "path": "/currentStep", "by": 1 }
        }
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

## 1.0.0

### Major Changes

- # v1.0.0 - Stable Release with Composition Architecture & Declarative Actions

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
      "buttons": [{ "label": "Cancel", "outline": true }, { "label": "Submit" }]
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
        "actions": {
          "press": { "type": "increment", "path": "/currentStep", "by": 1 }
        }
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

## 0.2.0

### Minor Changes

- 27984f6: ### Minor Changes

  - **Composition-aware refactoring** of 6 collection-based components to properly respect @json-render's declarative children model
  - **ButtonGroup**: Now accepts Button children instead of prop-driven `buttons` array. Fixed "sinkhole bug" where child AST nodes were silently discarded
  - **CardGroup**: Now accepts Card children instead of `cards` prop, enabling complex card internals
  - **Breadcrumb**: Now accepts Link children; last child automatically marked as current page
  - **InPageNavigation**: Now accepts Link children for anchor-based jump navigation
  - **SideNav**: Now accepts Link children with support for nested navigation structures
  - **Accordion**: Now accepts AccordionSection children (new component); each section manages its own open/close state
  - **AccordionSection** (new): Child wrapper for Accordion with title prop and content children
  - **Architectural fix**: All refactored components now follow the composition-first pattern, enabling LLM-generated specs to use natural JSON composition instead of flat prop arrays

  ### Breaking Changes

  - Components previously using `items`, `buttons`, `cards` props should migrate to children-based composition
  - Old prop-based specs will still parse but may not render correctly - use composition model for all new specs

  ### Migration Guide

  **Before:**

  ```json
  {
    "type": "ButtonGroup",
    "props": { "buttons": [{ "label": "Next", "value": "next" }] }
  }
  ```

  **After:**

  ```json
  {
    "type": "ButtonGroup",
    "props": {},
    "children": [{ "type": "Button", "props": { "label": "Next" } }]
  }
  ```

  This enables the framework's recursive rendering engine to properly handle nested UI trees without blackholing AST nodes.

## 0.1.1

### Patch Changes

- 8aee03d: Fix install documentation and peer dependency declarations.

  - Declare `@uswds/uswds` as an optional `peerDependency` so the existing `peerDependenciesMeta.optional` flag is no longer inert.
  - Rewrite the README `Install` section to match reality: list the actual peers users must provide (`react`, `react-dom`, `@uswds/uswds`, `zod`), note the `Node.js >=22.14.0` and React 19 requirements, and clarify that `@json-render/core` / `@json-render/react` are pulled in as transitive runtime dependencies.

## 0.1.0

### Minor Changes

- 7bccec6: ### Minor Changes

  - **Initial public release** of @cdt5058/json-render-uswds - a U.S. Web Design System component library for @json-render/core
  - **Component library** providing accessible, government-compliant React components that render from JSON specifications
  - **Full USWDS integration** with support for common form elements, layouts, and UI patterns
  - **Accessibility first** - all components follow WCAG 2.1 AA standards and USWDS accessibility guidelines
  - **Type-safe** - full TypeScript support with comprehensive prop types
  - **Dual exports** - ESM and CommonJS builds for maximum compatibility
  - **Public readiness** - issue templates, contributing guidelines, and comprehensive documentation

  ### What's Included

  - Complete set of USWDS components (buttons, forms, navigation, step indicators, pagination, and more)
  - Component catalog with schema definitions
  - React integration with state binding and event handling
  - Support for AI/LLM-generated UI specifications

  This is the first stable release ready for production use.

## 0.1.0

### Initial Release

First release of `@cdt5058/json-render-uswds` — a standalone U.S. Web Design System (USWDS) component library for `@json-render/core`.

#### 58 USWDS Components

**Layout (6):** Grid, CardGroup, Card, Divider, Footer, Section

**Navigation (9):** Header, SkipNav, SideNav, LanguageSelector, Link, InPageNavigation, Breadcrumb, Identifier, GovBanner

**Data Display (9):** Collection, IconList, Tooltip, Table, Heading, Text, Prose, Hero, GraphicList

**Feedback (5):** Alert, SiteAlert, Tag, SummaryBox, ProcessList

**Forms (20):** Button, ButtonGroup, Input, Textarea, Select, Checkbox, CheckboxGroup, Radio, FileInput, Search, RangeInput, DateInputGroup, DateRangePicker, InputMask, Password, ComboBox, DatePicker, TimePicker, CharacterCount, Form

**Utilities (9):** Accordion, Pagination, StepIndicator, Icon, InputGroup, List, ValidationChecklist, EmbedContainer, Modal

All components are WCAG 2.1 AA compliant with semantic HTML, ARIA attributes, and full keyboard navigation support.
