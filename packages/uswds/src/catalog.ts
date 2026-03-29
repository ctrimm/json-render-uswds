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
