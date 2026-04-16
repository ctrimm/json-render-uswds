---
"@cdt5058/json-render-uswds": minor
---

### Minor Changes

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
{"type": "ButtonGroup", "props": {"buttons": [{"label": "Next", "value": "next"}]}}
```

**After:**
```json
{"type": "ButtonGroup", "props": {}, "children": [{"type": "Button", "props": {"label": "Next"}}]}
```

This enables the framework's recursive rendering engine to properly handle nested UI trees without blackholing AST nodes.
