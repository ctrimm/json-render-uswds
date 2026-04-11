# @cdt5058/json-render-uswds

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
