# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.1.x | Yes |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a vulnerability, open a [GitHub Security Advisory](https://github.com/ctrimm/json-render-uswds/security/advisories/new) in this repository. This keeps the details private until a fix is available.

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a minimal proof-of-concept
- Any suggested fixes, if you have them

You can expect an acknowledgement within **3 business days** and a status update within **7 business days**.

## Security Design Notes

This library takes several measures to prevent common web vulnerabilities:

- **XSS prevention** — `href` and CSS `url()` props are sanitized via `safeHref()` and `safeCssUrl()`, which block `javascript:` and `data:` URIs
- **No `dangerouslySetInnerHTML`** — all user-controlled content is rendered as React children, never raw HTML
- **No `eval` or dynamic code execution** — component rendering is purely declarative
- **Schema validation** — all component props are validated with [Zod](https://zod.dev) schemas before rendering

If you believe any of these controls are insufficient or bypassable, please report it.
