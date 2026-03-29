import { z } from "zod";

// =============================================================================
// Shared validation schemas used across form components
// =============================================================================

const validationCheckSchema = z
  .array(
    z.object({
      type: z.string(),
      message: z.string(),
      args: z.record(z.string(), z.unknown()).optional(),
    }),
  )
  .nullable();

const validateOnSchema = z.enum(["change", "blur", "submit"]).nullable();

// =============================================================================
// USWDS Component Definitions
// =============================================================================

/**
 * U.S. Web Design System (USWDS) component definitions for json-render catalogs.
 *
 * These components follow USWDS design guidelines and use official `usa-*` CSS
 * class names. Users must include the USWDS CSS in their project:
 *
 * ```ts
 * import "@uswds/uswds/css/uswds.css";
 * // or via CDN: https://designsystem.digital.gov/how-to-use-uswds/
 * ```
 *
 * All components are built with accessibility in mind and follow WCAG 2.1 AA.
 */
export const uswdsComponentDefinitions = {
  // ==========================================================================
  // Layout Components
  // ==========================================================================

  Grid: {
    props: z.object({
      columns: z.number().nullable(),
      gap: z.enum(["sm", "md", "lg"]).nullable(),
    }),
    slots: ["default"],
    description:
      "USWDS grid row with equal-width columns. columns: 1-12. gap: spacing between columns.",
    example: { columns: 3, gap: "md" },
  },

  CardGroup: {
    props: z.object({
      cards: z.array(
        z.object({
          title: z.string().nullable(),
          description: z.string().nullable(),
          mediaUrl: z.string().nullable(),
          mediaAlt: z.string().nullable(),
          footer: z.string().nullable(),
        }),
      ),
      flag: z.boolean().nullable(),
    }),
    description:
      "USWDS group of cards in a responsive grid. cards: [{title, description, mediaUrl?, mediaAlt?, footer?}]. flag for horizontal card layout.",
    example: {
      cards: [
        {
          title: "Card One",
          description: "Description one.",
          mediaUrl: null,
          mediaAlt: null,
          footer: null,
        },
        {
          title: "Card Two",
          description: "Description two.",
          mediaUrl: null,
          mediaAlt: null,
          footer: null,
        },
      ],
    },
  },

  Card: {
    props: z.object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      headerFirst: z.boolean().nullable(),
      mediaUrl: z.string().nullable(),
      mediaAlt: z.string().nullable(),
      flag: z.boolean().nullable(),
    }),
    slots: ["default"],
    description:
      "USWDS card container. Use title/description for header, mediaUrl for an image, flag for horizontal layout.",
    example: { title: "Card Title", description: "Supporting text." },
  },

  Divider: {
    props: z.object({}),
    description: "USWDS horizontal rule divider (usa-divider).",
  },

  Footer: {
    props: z.object({
      variant: z.enum(["slim", "medium", "big"]).nullable(),
      agencyName: z.string(),
      agencyUrl: z.string().nullable(),
      logoUrl: z.string().nullable(),
      logoAlt: z.string().nullable(),
      navGroups: z
        .array(
          z.object({
            heading: z.string().nullable(),
            links: z.array(z.object({ label: z.string(), href: z.string() })),
          }),
        )
        .nullable(),
      contactHeading: z.string().nullable(),
      contactInfo: z
        .array(
          z.object({
            type: z.enum(["address", "phone", "email"]),
            value: z.string(),
          }),
        )
        .nullable(),
      socialLinks: z
        .array(
          z.object({
            platform: z.enum([
              "facebook",
              "twitter",
              "youtube",
              "instagram",
              "rss",
              "linkedin",
              "github",
            ]),
            href: z.string(),
            label: z.string(),
          }),
        )
        .nullable(),
      returnToTop: z.boolean().nullable(),
    }),
    description:
      "USWDS site footer. variant: slim (compact), medium (default), big (multi-column nav). navGroups: [{heading?, links: [{label, href}]}]. For big variant, each group becomes a column.",
    example: {
      variant: "medium",
      agencyName: "Agency Name",
      agencyUrl: "/",
      logoUrl: null,
      logoAlt: null,
      navGroups: [
        {
          heading: null,
          links: [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
        },
      ],
      contactHeading: "Contact",
      contactInfo: [
        { type: "address", value: "1800 F Street NW, Washington, DC 20405" },
        { type: "phone", value: "1-800-FED-INFO" },
        { type: "email", value: "info@agency.gov" },
      ],
      socialLinks: null,
      returnToTop: true,
    },
  },

  // ==========================================================================
  // Navigation Components
  // ==========================================================================

  Accordion: {
    props: z.object({
      items: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
          expanded: z.boolean().nullable(),
        }),
      ),
      bordered: z.boolean().nullable(),
      multiselectable: z.boolean().nullable(),
    }),
    description:
      "USWDS accordion. Items as [{title, content, expanded?}]. bordered adds border styling. multiselectable allows multiple open panels.",
    example: {
      items: [
        { title: "First item", content: "Content for first item." },
        { title: "Second item", content: "Content for second item." },
      ],
    },
  },

  Pagination: {
    props: z.object({
      totalPages: z.number(),
      page: z.number().nullable(),
      ariaLabel: z.string().nullable(),
    }),
    events: ["change"],
    description:
      "USWDS pagination navigation. Use { $bindState } on page for current page number.",
    example: { totalPages: 10, page: 1 },
  },

  StepIndicator: {
    props: z.object({
      steps: z.array(z.string()),
      currentStep: z.number(),
      counters: z.enum(["default", "small"]).nullable(),
      centered: z.boolean().nullable(),
      noLabels: z.boolean().nullable(),
    }),
    description:
      "USWDS step indicator for multi-step forms. steps: array of step labels. currentStep: 1-based index of active step.",
    example: {
      steps: ["Personal info", "Household", "Review"],
      currentStep: 1,
    },
  },

  Header: {
    props: z.object({
      variant: z.enum(["basic", "extended"]).nullable(),
      siteName: z.string(),
      siteUrl: z.string().nullable(),
      logoUrl: z.string().nullable(),
      logoAlt: z.string().nullable(),
      navItems: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
            current: z.boolean().nullable(),
            items: z
              .array(
                z.object({
                  label: z.string(),
                  href: z.string(),
                }),
              )
              .nullable(),
          }),
        )
        .nullable(),
      showSearch: z.boolean().nullable(),
    }),
    description:
      "USWDS site header with primary navigation. variant: basic (default) or extended (taller with logo). navItems: [{label, href, current?, items?}] — items creates a dropdown. showSearch adds a search bar.",
    example: {
      variant: "basic",
      siteName: "Agency Name",
      siteUrl: "/",
      logoUrl: null,
      logoAlt: null,
      navItems: [
        { label: "Home", href: "/", current: true, items: null },
        { label: "About", href: "/about", current: false, items: null },
        {
          label: "Topics",
          href: "/topics",
          current: false,
          items: [
            { label: "Topic One", href: "/topics/one" },
            { label: "Topic Two", href: "/topics/two" },
          ],
        },
      ],
      showSearch: false,
    },
  },

  SkipNav: {
    props: z.object({
      href: z.string().nullable(),
      label: z.string().nullable(),
    }),
    description:
      "USWDS skip navigation link. Renders an off-screen anchor that appears on focus, letting keyboard users jump past repeated navigation. href defaults to '#main-content'.",
    example: { href: "#main-content", label: "Skip to main content" },
  },

  SideNav: {
    props: z.object({
      items: z.array(
        z.object({
          label: z.string(),
          href: z.string(),
          current: z.boolean().nullable(),
          children: z
            .array(
              z.object({
                label: z.string(),
                href: z.string(),
                current: z.boolean().nullable(),
              }),
            )
            .nullable(),
        }),
      ),
      ariaLabel: z.string().nullable(),
    }),
    description:
      "USWDS side navigation. items: [{label, href, current?, children?}]. Mark the active page with current: true.",
    example: {
      ariaLabel: "Side navigation",
      items: [
        {
          label: "Overview",
          href: "/overview",
          current: false,
          children: null,
        },
        {
          label: "Getting started",
          href: "/getting-started",
          current: true,
          children: [
            {
              label: "Installation",
              href: "/getting-started/install",
              current: false,
            },
            {
              label: "Configuration",
              href: "/getting-started/config",
              current: false,
            },
          ],
        },
      ],
    },
  },

  LanguageSelector: {
    props: z.object({
      languages: z.array(
        z.object({
          label: z.string(),
          href: z.string(),
          lang: z.string(),
          localLabel: z.string().nullable(),
        }),
      ),
      currentLang: z.string().nullable(),
    }),
    description:
      "USWDS language selector. languages: [{label, href, lang, localLabel?}]. currentLang: BCP-47 code of the active language (e.g. 'en').",
    example: {
      currentLang: "en",
      languages: [
        { label: "English", href: "/en", lang: "en", localLabel: null },
        { label: "Spanish", href: "/es", lang: "es", localLabel: "Español" },
        { label: "French", href: "/fr", lang: "fr", localLabel: "Français" },
      ],
    },
  },

  Link: {
    props: z.object({
      label: z.string(),
      href: z.string(),
      external: z.boolean().nullable(),
      variant: z.enum(["default", "nav"]).nullable(),
    }),
    events: ["press"],
    description:
      "USWDS anchor link. external adds an external-link indicator. variant: default or nav (for navigation contexts).",
    example: { label: "Learn more", href: "/about" },
  },

  InPageNavigation: {
    props: z.object({
      items: z.array(
        z.object({
          label: z.string(),
          href: z.string(),
        }),
      ),
      heading: z.string().nullable(),
    }),
    description:
      "USWDS in-page navigation with jump links to sections. items: [{label, href}] where href is an anchor like '#section-1'.",
    example: {
      heading: "On this page",
      items: [
        { label: "Introduction", href: "#introduction" },
        { label: "Requirements", href: "#requirements" },
        { label: "How to apply", href: "#how-to-apply" },
      ],
    },
  },

  Breadcrumb: {
    props: z.object({
      items: z.array(
        z.object({
          label: z.string(),
          href: z.string().nullable(),
        }),
      ),
    }),
    description:
      "USWDS breadcrumb navigation. items: array of {label, href?}. Last item is current page (no link).",
    example: {
      items: [
        { label: "Home", href: "/" },
        { label: "Components", href: "/components" },
        { label: "Breadcrumb", href: null },
      ],
    },
  },

  // ==========================================================================
  // Data Display Components
  // ==========================================================================

  Identifier: {
    props: z.object({
      domain: z.string(),
      agencyName: z.string(),
      agencyUrl: z.string().nullable(),
      logoUrl: z.string().nullable(),
      logoAlt: z.string().nullable(),
      disclaimer: z.string().nullable(),
      links: z
        .array(z.object({ label: z.string(), href: z.string() }))
        .nullable(),
      showUsagov: z.boolean().nullable(),
    }),
    description:
      "USWDS agency identifier section. Shows domain, agency name, logo, required links, and USA.gov footer. Place at the bottom of .gov pages.",
    example: {
      domain: "agency.gov",
      agencyName: "U.S. Department of Example",
      agencyUrl: "/",
      logoUrl: null,
      logoAlt: null,
      disclaimer: null,
      links: [
        { label: "About agency.gov", href: "/about" },
        { label: "Accessibility statement", href: "/accessibility" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "No FEAR Act data", href: "/no-fear" },
        { label: "Office of the Inspector General", href: "/oig" },
        { label: "Performance reports", href: "/performance" },
        { label: "FOIA requests", href: "/foia" },
      ],
      showUsagov: true,
    },
  },

  GovBanner: {
    props: z.object({
      tld: z.enum([".gov", ".mil"]).nullable(),
      expanded: z.boolean().nullable(),
    }),
    description:
      "USWDS government site banner ('An official website of the United States government'). tld: '.gov' (default) or '.mil'. expanded: show expanded explanation by default.",
    example: { tld: ".gov" },
  },

  Collection: {
    props: z.object({
      items: z.array(
        z.object({
          heading: z.string(),
          href: z.string().nullable(),
          description: z.string().nullable(),
          date: z.string().nullable(),
          dateLabel: z.string().nullable(),
          tags: z.array(z.string()).nullable(),
          thumbnailUrl: z.string().nullable(),
          thumbnailAlt: z.string().nullable(),
        }),
      ),
    }),
    description:
      "USWDS collection list of content items. items: [{heading, href?, description?, date?, dateLabel?, tags?, thumbnailUrl?, thumbnailAlt?}].",
    example: {
      items: [
        {
          heading: "Article Title",
          href: "/articles/1",
          description: "A short description of the article.",
          date: "2024-01-15",
          dateLabel: "January 15, 2024",
          tags: ["Policy", "Health"],
          thumbnailUrl: null,
          thumbnailAlt: null,
        },
      ],
    },
  },

  IconList: {
    props: z.object({
      items: z.array(
        z.object({
          icon: z.string(),
          content: z.string(),
          color: z
            .enum(["default", "success", "warning", "error", "info"])
            .nullable(),
        }),
      ),
      title: z.string().nullable(),
      size: z.enum(["sm", "lg", "xl", "2xl", "3xl"]).nullable(),
    }),
    description:
      "USWDS icon list. items: [{icon, content, color?}]. icon is a USWDS icon name (e.g. 'check_circle', 'cancel', 'info'). size controls icon size.",
    example: {
      title: "Requirements",
      items: [
        {
          icon: "check_circle",
          content: "Requirement one is met.",
          color: "success",
        },
        {
          icon: "check_circle",
          content: "Requirement two is met.",
          color: "success",
        },
        {
          icon: "cancel",
          content: "Requirement three is not met.",
          color: "error",
        },
      ],
    },
  },

  Tooltip: {
    props: z.object({
      label: z.string(),
      content: z.string(),
      position: z.enum(["top", "bottom", "left", "right"]).nullable(),
    }),
    description:
      "USWDS tooltip shown on hover. label: the visible trigger text. content: tooltip text. position: top (default), bottom, left, right.",
    example: {
      label: "Hover me",
      content: "This is a tooltip",
      position: "top",
    },
  },

  Table: {
    props: z.object({
      columns: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      caption: z.string().nullable(),
      borderless: z.boolean().nullable(),
      striped: z.boolean().nullable(),
      compact: z.boolean().nullable(),
      scrollable: z.boolean().nullable(),
    }),
    description:
      "USWDS data table. columns: header labels. rows: 2D array of cell strings. borderless/striped/compact for styling variants.",
    example: {
      columns: ["Name", "Role", "Status"],
      rows: [
        ["Alice", "Admin", "Active"],
        ["Bob", "User", "Inactive"],
      ],
    },
  },

  Heading: {
    props: z.object({
      text: z.string(),
      level: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]).nullable(),
    }),
    description: "USWDS heading text (h1–h6) with usa-prose styling.",
    example: { text: "Page Title", level: "h1" },
  },

  Text: {
    props: z.object({
      text: z.string(),
      variant: z.enum(["body", "lead", "small", "code"]).nullable(),
    }),
    description:
      "USWDS paragraph text. variant: body (default), lead, small, code.",
    example: { text: "Supporting paragraph text." },
  },

  Alert: {
    props: z.object({
      heading: z.string().nullable(),
      message: z.string(),
      type: z
        .enum(["info", "success", "warning", "error", "emergency"])
        .nullable(),
      slim: z.boolean().nullable(),
      noIcon: z.boolean().nullable(),
    }),
    description:
      "USWDS alert banner. type: info (default), success, warning, error, emergency. slim for compact variant.",
    example: {
      heading: "Success",
      message: "Your form has been submitted.",
      type: "success",
    },
  },

  SiteAlert: {
    props: z.object({
      heading: z.string().nullable(),
      message: z.string(),
      type: z.enum(["info", "emergency"]).nullable(),
      slim: z.boolean().nullable(),
    }),
    description:
      "USWDS site-wide alert banner for important announcements. type: info (default) or emergency.",
    example: {
      heading: "Official website of the United States government",
      message: "Here's how you know this is a government site.",
      type: "info",
    },
  },

  Tag: {
    props: z.object({
      text: z.string(),
      big: z.boolean().nullable(),
    }),
    description: "USWDS tag/label badge. big for larger variant.",
    example: { text: "New" },
  },

  SummaryBox: {
    props: z.object({
      heading: z.string(),
      items: z.array(z.string()),
    }),
    description:
      "USWDS summary box with a heading and bullet list of key information.",
    example: {
      heading: "Key information",
      items: ["Item one", "Item two", "Item three"],
    },
  },

  ProcessList: {
    props: z.object({
      items: z.array(
        z.object({
          heading: z.string(),
          content: z.string(),
        }),
      ),
    }),
    description:
      "USWDS numbered process list for step-by-step instructions. items: [{heading, content}].",
    example: {
      items: [
        { heading: "Apply", content: "Submit your application online." },
        { heading: "Review", content: "We review your application." },
        { heading: "Approval", content: "Receive your decision letter." },
      ],
    },
  },

  // ==========================================================================
  // Form Input Components
  // ==========================================================================

  Button: {
    props: z.object({
      label: z.string(),
      variant: z
        .enum([
          "default",
          "secondary",
          "accent-cool",
          "accent-warm",
          "base",
          "outline",
          "outline-inverse",
          "big",
          "unstyled",
        ])
        .nullable(),
      disabled: z.boolean().nullable(),
      type: z.enum(["button", "submit", "reset"]).nullable(),
    }),
    events: ["press"],
    description:
      "USWDS button. variant: default (primary), secondary, accent-cool, accent-warm, base, outline, outline-inverse, big, unstyled.",
    example: { label: "Submit", variant: "default" },
  },

  ButtonGroup: {
    props: z.object({
      buttons: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          variant: z.enum(["default", "secondary", "outline"]).nullable(),
        }),
      ),
      segmented: z.boolean().nullable(),
    }),
    events: ["press"],
    description:
      "USWDS button group. buttons: [{label, value, variant?}]. segmented renders as a connected group.",
    example: {
      buttons: [
        { label: "Back", value: "back", variant: "outline" },
        { label: "Continue", value: "continue", variant: "default" },
      ],
    },
  },

  Input: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      type: z
        .enum(["text", "email", "password", "number", "search", "tel", "url"])
        .nullable(),
      placeholder: z.string().nullable(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      required: z.boolean().nullable(),
      disabled: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["submit", "focus", "blur"],
    description:
      "USWDS text input. Use { $bindState } on value for two-way binding. hint adds helper text below label. Use checks for validation.",
    example: {
      label: "Email address",
      name: "email",
      type: "email",
      hint: "e.g. name@example.gov",
    },
  },

  Textarea: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      placeholder: z.string().nullable(),
      hint: z.string().nullable(),
      rows: z.number().nullable(),
      value: z.string().nullable(),
      required: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    description:
      "USWDS multi-line textarea. Use { $bindState } on value for binding. hint adds helper text below label.",
    example: { label: "Message", name: "message", rows: 4 },
  },

  Select: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(
        z.union([
          z.string(),
          z.object({ label: z.string(), value: z.string() }),
        ]),
      ),
      placeholder: z.string().nullable(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      required: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "USWDS select dropdown. options: array of strings or {label, value} objects. Use { $bindState } on value for binding.",
    example: {
      label: "State",
      name: "state",
      options: ["Alabama", "Alaska", "Arizona"],
    },
  },

  Checkbox: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      hint: z.string().nullable(),
      checked: z.boolean().nullable(),
      tile: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "USWDS checkbox. Use { $bindState } on checked for binding. tile renders as a large tile variant.",
    example: { label: "I agree to the terms", name: "terms" },
  },

  CheckboxGroup: {
    props: z.object({
      legend: z.string(),
      name: z.string(),
      options: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          hint: z.string().nullable(),
        }),
      ),
      tile: z.boolean().nullable(),
      values: z.array(z.string()).nullable(),
    }),
    events: ["change"],
    description:
      "USWDS group of checkboxes in a fieldset. Use { $bindState } on values for selected values array.",
    example: {
      legend: "Select all that apply",
      name: "interests",
      options: [
        { label: "Technology", value: "tech", hint: null },
        { label: "Science", value: "science", hint: null },
      ],
    },
  },

  Radio: {
    props: z.object({
      legend: z.string(),
      name: z.string(),
      options: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          hint: z.string().nullable(),
        }),
      ),
      tile: z.boolean().nullable(),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "USWDS radio button group. Use { $bindState } on value for binding. tile renders as tile variant.",
    example: {
      legend: "Select an option",
      name: "option",
      options: [
        { label: "Yes", value: "yes", hint: null },
        { label: "No", value: "no", hint: null },
      ],
    },
  },

  FileInput: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      hint: z.string().nullable(),
      accept: z.string().nullable(),
      multiple: z.boolean().nullable(),
      required: z.boolean().nullable(),
    }),
    events: ["change"],
    description:
      "USWDS file input. accept: MIME types (e.g. '.pdf,.doc'). multiple allows selecting multiple files.",
    example: {
      label: "Upload document",
      name: "document",
      hint: "Accepted formats: PDF, DOC",
      accept: ".pdf,.doc,.docx",
    },
  },

  Search: {
    props: z.object({
      label: z.string().nullable(),
      placeholder: z.string().nullable(),
      value: z.string().nullable(),
      size: z.enum(["small", "medium", "big"]).nullable(),
    }),
    events: ["submit", "change"],
    description:
      "USWDS search bar. Use { $bindState } on value for the input value. size: small, medium (default), big.",
    example: { placeholder: "Search...", size: "medium" },
  },

  RangeInput: {
    props: z.object({
      label: z.string().nullable(),
      name: z.string(),
      min: z.number().nullable(),
      max: z.number().nullable(),
      step: z.number().nullable(),
      value: z.number().nullable(),
    }),
    events: ["change"],
    description:
      "USWDS range slider input. Use { $bindState } on value for binding.",
    example: { label: "Select a value", name: "range", min: 0, max: 100 },
  },

  DateInputGroup: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      hint: z.string().nullable(),
      required: z.boolean().nullable(),
      monthValue: z.string().nullable(),
      dayValue: z.string().nullable(),
      yearValue: z.string().nullable(),
    }),
    events: ["change"],
    description:
      "USWDS three-field date input (separate month, day, year inputs). Use { $bindState } on monthValue/dayValue/yearValue for individual field bindings.",
    example: {
      label: "Date of birth",
      name: "dob",
      hint: "For example: January 19 2000",
    },
  },

  DateRangePicker: {
    props: z.object({
      startLabel: z.string(),
      endLabel: z.string(),
      startName: z.string(),
      endName: z.string(),
      hint: z.string().nullable(),
      startValue: z.string().nullable(),
      endValue: z.string().nullable(),
      minDate: z.string().nullable(),
      maxDate: z.string().nullable(),
      required: z.boolean().nullable(),
    }),
    events: ["change"],
    description:
      "USWDS date range picker with start and end date inputs. Values are ISO date strings (YYYY-MM-DD). Use { $bindState } on startValue/endValue.",
    example: {
      startLabel: "Start date",
      endLabel: "End date",
      startName: "start_date",
      endName: "end_date",
      hint: "mm/dd/yyyy",
    },
  },

  InputMask: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      preset: z.enum(["phone", "zip", "zip+4", "ssn", "custom"]).nullable(),
      pattern: z.string().nullable(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      required: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change", "blur"],
    description:
      "USWDS input with automatic formatting mask. preset: phone '(___) ___-____', zip '_____', zip+4 '_____-____', ssn '___-__-____'. Or supply a custom pattern where '_' = digit.",
    example: {
      label: "Phone number",
      name: "phone",
      preset: "phone",
      hint: "(___) ___-____",
    },
  },

  Password: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      required: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change", "blur"],
    description:
      "USWDS password input with show/hide toggle button. Use { $bindState } on value for binding. Supports validation checks.",
    example: {
      label: "Password",
      name: "password",
      hint: "Must be at least 12 characters",
    },
  },

  ComboBox: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(
        z.union([
          z.string(),
          z.object({ label: z.string(), value: z.string() }),
        ]),
      ),
      placeholder: z.string().nullable(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      required: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "USWDS combo box — a searchable/filterable select dropdown. options: strings or {label, value}. Use { $bindState } on value for binding.",
    example: {
      label: "Select a fruit",
      name: "fruit",
      options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
      placeholder: "- Select -",
    },
  },

  DatePicker: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      minDate: z.string().nullable(),
      maxDate: z.string().nullable(),
      required: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "USWDS date picker. value/minDate/maxDate are ISO date strings (YYYY-MM-DD). Use { $bindState } on value for binding.",
    example: {
      label: "Date of birth",
      name: "dob",
      hint: "mm/dd/yyyy",
    },
  },

  TimePicker: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      minTime: z.string().nullable(),
      maxTime: z.string().nullable(),
      step: z.number().nullable(),
      required: z.boolean().nullable(),
    }),
    events: ["change"],
    description:
      "USWDS time picker. value/minTime/maxTime use 'HH:MM' 24-hour format. step is in minutes (default 30). Use { $bindState } on value.",
    example: {
      label: "Appointment time",
      name: "appt_time",
      hint: "Select a time",
      step: 30,
    },
  },

  CharacterCount: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      maxLength: z.number(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      multiline: z.boolean().nullable(),
      rows: z.number().nullable(),
      required: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "USWDS input or textarea with a live character count indicator. maxLength: character limit. multiline: renders as textarea. Use { $bindState } on value.",
    example: {
      label: "Brief description",
      name: "description",
      maxLength: 150,
      hint: "Enter a short summary",
      multiline: true,
    },
  },

  // ==========================================================================
  // Overlay / Modal Components
  // ==========================================================================

  Modal: {
    props: z.object({
      heading: z.string(),
      description: z.string().nullable(),
      openPath: z.string(),
      large: z.boolean().nullable(),
    }),
    slots: ["default"],
    description:
      "USWDS modal dialog. Set openPath to a boolean state path. Use setState to toggle open/close.",
    example: {
      heading: "Are you sure?",
      description: "This action cannot be undone.",
      openPath: "/modal/open",
    },
  },

  // ==========================================================================
  // Additional Display Components
  // ==========================================================================

  Icon: {
    props: z.object({
      name: z.string(),
      size: z.enum(["sm", "md", "lg", "xl", "2xl", "3xl"]).nullable(),
      color: z.string().nullable(),
      ariaLabel: z.string().nullable(),
    }),
    description:
      "USWDS standalone SVG icon from the USWDS icon set. name: USWDS icon name (e.g. 'check', 'close', 'search', 'arrow_forward'). size: sm–3xl. color: a USWDS text-color utility class (e.g. 'text-primary').",
    example: { name: "check_circle", size: "lg", color: "text-green" },
  },

  InputGroup: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      type: z
        .enum(["text", "email", "password", "number", "search", "tel", "url"])
        .nullable(),
      prefix: z.string().nullable(),
      suffix: z.string().nullable(),
      placeholder: z.string().nullable(),
      hint: z.string().nullable(),
      value: z.string().nullable(),
      required: z.boolean().nullable(),
      disabled: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change", "blur"],
    description:
      "USWDS input group — a text input with an optional prefix and/or suffix add-on (e.g. currency symbol, unit label). Use { $bindState } on value for two-way binding.",
    example: {
      label: "Amount",
      name: "amount",
      prefix: "$",
      suffix: ".00",
      type: "number",
      placeholder: "0",
    },
  },

  List: {
    props: z.object({
      items: z.array(z.string()),
      variant: z.enum(["unordered", "ordered", "unstyled"]).nullable(),
    }),
    description:
      "USWDS list. variant: unordered (default, bullet list), ordered (numbered list), unstyled (no bullets/numbers).",
    example: {
      variant: "unordered",
      items: ["First item", "Second item", "Third item"],
    },
  },

  ValidationChecklist: {
    props: z.object({
      items: z.array(
        z.object({
          label: z.string(),
          checked: z.boolean().nullable(),
        }),
      ),
      heading: z.string().nullable(),
    }),
    description:
      "USWDS validation checklist (usa-checklist). Displays a list of password/input requirements with checked/unchecked states.",
    example: {
      heading: "Password must contain:",
      items: [
        { label: "At least 12 characters", checked: true },
        { label: "At least one uppercase letter", checked: false },
        { label: "At least one number", checked: false },
      ],
    },
  },
};

// =============================================================================
// Types
// =============================================================================

/**
 * Type for a USWDS component definition
 */
export type UswdsComponentDefinition = {
  props: z.ZodType;
  slots?: string[];
  events?: string[];
  description: string;
  example?: Record<string, unknown>;
};

/**
 * Infer the props type for a USWDS component by name.
 *
 * @example
 * ```ts
 * type ButtonProps = UswdsProps<"Button">;
 * // { label: string; variant: string | null; disabled: boolean | null; ... }
 * ```
 */
export type UswdsProps<K extends keyof typeof uswdsComponentDefinitions> =
  z.output<(typeof uswdsComponentDefinitions)[K]["props"]>;
