"use client";

import { useState } from "react";
import {
  useBoundProp,
  useStateBinding,
  useFieldValidation,
  type BaseComponentProps,
} from "@json-render/react";

import { type UswdsProps } from "./catalog";

// =============================================================================
// Helpers
// =============================================================================

function getPaginationRange(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | "ellipsis"> = [];
  pages.push(1);
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

function getButtonClass(variant: string | null | undefined): string {
  const base = "usa-button";
  switch (variant) {
    case "secondary":
      return `${base} usa-button--secondary`;
    case "accent-cool":
      return `${base} usa-button--accent-cool`;
    case "accent-warm":
      return `${base} usa-button--accent-warm`;
    case "base":
      return `${base} usa-button--base`;
    case "outline":
      return `${base} usa-button--outline`;
    case "outline-inverse":
      return `${base} usa-button--outline usa-button--inverse`;
    case "big":
      return `${base} usa-button--big`;
    case "unstyled":
      return `${base} usa-button--unstyled`;
    default:
      return base;
  }
}

// =============================================================================
// USWDS Component Implementations
// =============================================================================

/**
 * USWDS component implementations for json-render.
 *
 * Requires USWDS CSS to be loaded in your application:
 * ```ts
 * import "@uswds/uswds/css/uswds.css";
 * // or via CDN: https://designsystem.digital.gov/how-to-use-uswds/
 * ```
 *
 * @example
 * ```ts
 * import { defineRegistry } from "@json-render/react";
 * import { uswdsComponents } from "@json-render/uswds";
 *
 * const { registry } = defineRegistry(catalog, {
 *   components: {
 *     Button: uswdsComponents.Button,
 *     Alert: uswdsComponents.Alert,
 *   },
 * });
 * ```
 */
export const uswdsComponents = {
  // ── Layout ────────────────────────────────────────────────────────────

  Grid: ({ props, children }: BaseComponentProps<UswdsProps<"Grid">>) => {
    const cols = Math.max(1, Math.min(12, props.columns ?? 1));
    const gapMap: Record<string, string> = {
      sm: "grid-gap-sm",
      md: "grid-gap",
      lg: "grid-gap-lg",
    };
    const gapClass = gapMap[props.gap ?? "md"] ?? "grid-gap";

    return (
      <div className="grid-container">
        <div className={`grid-row ${gapClass}`}>
          {/* Wrap each child in an equal-width column */}
          {Array.isArray(children) ? (
            children.map((child, i) => (
              <div
                key={i}
                className={`tablet:grid-col-${Math.floor(12 / cols)}`}
              >
                {child}
              </div>
            ))
          ) : (
            <div className={`tablet:grid-col-${Math.floor(12 / cols)}`}>
              {children}
            </div>
          )}
        </div>
      </div>
    );
  },

  Card: ({ props, children }: BaseComponentProps<UswdsProps<"Card">>) => {
    return (
      <div className={`usa-card${props.flag ? " usa-card--flag" : ""}`}>
        <div className="usa-card__container">
          {props.mediaUrl && (
            <div className="usa-card__media">
              <div className="usa-card__img">
                <img src={props.mediaUrl} alt={props.mediaAlt ?? ""} />
              </div>
            </div>
          )}
          {(props.title || props.description) && (
            <div className="usa-card__header">
              {props.title && (
                <h2 className="usa-card__heading">{props.title}</h2>
              )}
            </div>
          )}
          <div className="usa-card__body">
            {props.description && <p>{props.description}</p>}
            {children}
          </div>
        </div>
      </div>
    );
  },

  Divider: (_: BaseComponentProps<UswdsProps<"Divider">>) => {
    return <hr className="usa-divider" />;
  },

  CardGroup: ({ props }: BaseComponentProps<UswdsProps<"CardGroup">>) => {
    const cards = props.cards ?? [];
    return (
      <ul className="usa-card-group">
        {cards.map((card, i) => (
          <li
            key={i}
            className={`usa-card tablet:grid-col-4${props.flag ? " usa-card--flag" : ""}`}
          >
            <div className="usa-card__container">
              {card.mediaUrl && (
                <div className="usa-card__media">
                  <div className="usa-card__img">
                    <img src={card.mediaUrl} alt={card.mediaAlt ?? ""} />
                  </div>
                </div>
              )}
              {card.title && (
                <div className="usa-card__header">
                  <h2 className="usa-card__heading">{card.title}</h2>
                </div>
              )}
              {card.description && (
                <div className="usa-card__body">
                  <p>{card.description}</p>
                </div>
              )}
              {card.footer && (
                <div className="usa-card__footer">
                  <p>{card.footer}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  },

  // ── Navigation ────────────────────────────────────────────────────────

  Accordion: ({ props }: BaseComponentProps<UswdsProps<"Accordion">>) => {
    const items = props.items ?? [];
    const [openItems, setOpenItems] = useState<Set<number>>(() => {
      const initial = new Set<number>();
      items.forEach((item, i) => {
        if (item.expanded) initial.add(i);
      });
      return initial;
    });

    const toggle = (index: number) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (props.multiselectable) {
          if (next.has(index)) {
            next.delete(index);
          } else {
            next.add(index);
          }
        } else {
          if (next.has(index)) {
            next.clear();
          } else {
            next.clear();
            next.add(index);
          }
        }
        return next;
      });
    };

    return (
      <div
        className={`usa-accordion${props.bordered ? " usa-accordion--bordered" : ""}`}
      >
        {items.map((item, i) => {
          const isOpen = openItems.has(i);
          const headingId = `accordion-heading-${i}`;
          const contentId = `accordion-content-${i}`;
          return (
            <div key={i}>
              <h4 className="usa-accordion__heading">
                <button
                  type="button"
                  className="usa-accordion__button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  id={headingId}
                  onClick={() => toggle(i)}
                >
                  {item.title}
                </button>
              </h4>
              <div
                id={contentId}
                className="usa-accordion__content usa-prose"
                hidden={!isOpen}
                role="region"
                aria-labelledby={headingId}
              >
                <p>{item.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  },

  Pagination: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"Pagination">>) => {
    const [boundPage, setBoundPage] = useBoundProp<number>(
      props.page as number | undefined,
      bindings?.page,
    );
    const [localPage, setLocalPage] = useState(props.page ?? 1);
    const isBound = !!bindings?.page;
    const page = isBound ? (boundPage ?? 1) : localPage;
    const setPage = isBound ? setBoundPage : setLocalPage;

    const total = props.totalPages;
    const range = getPaginationRange(page, total);

    const navigate = (p: number) => {
      if (p < 1 || p > total) return;
      setPage(p);
      emit("change");
    };

    return (
      <nav
        aria-label={props.ariaLabel ?? "Pagination"}
        className="usa-pagination"
      >
        <ul className="usa-pagination__list">
          {/* Previous */}
          <li className="usa-pagination__item usa-pagination__arrow">
            <a
              href="#"
              className="usa-pagination__link usa-pagination__previous-page"
              aria-label="Previous page"
              aria-disabled={page <= 1}
              onClick={(e) => {
                e.preventDefault();
                navigate(page - 1);
              }}
            >
              <svg
                className="usa-icon"
                aria-hidden="true"
                role="img"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
              </svg>
              <span className="usa-pagination__link-text">Previous</span>
            </a>
          </li>

          {range.map((item, i) =>
            item === "ellipsis" ? (
              <li
                key={`ellipsis-${i}`}
                className="usa-pagination__item usa-pagination__overflow"
                role="presentation"
              >
                <span>…</span>
              </li>
            ) : (
              <li
                key={item}
                className="usa-pagination__item usa-pagination__page-no"
              >
                <a
                  href="#"
                  className={`usa-pagination__button${page === item ? " usa-current" : ""}`}
                  aria-label={`Page ${item}`}
                  aria-current={page === item ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item);
                  }}
                >
                  {item}
                </a>
              </li>
            ),
          )}

          {/* Next */}
          <li className="usa-pagination__item usa-pagination__arrow">
            <a
              href="#"
              className="usa-pagination__link usa-pagination__next-page"
              aria-label="Next page"
              aria-disabled={page >= total}
              onClick={(e) => {
                e.preventDefault();
                navigate(page + 1);
              }}
            >
              <span className="usa-pagination__link-text">Next</span>
              <svg
                className="usa-icon"
                aria-hidden="true"
                role="img"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    );
  },

  StepIndicator: ({
    props,
  }: BaseComponentProps<UswdsProps<"StepIndicator">>) => {
    const steps = props.steps ?? [];
    const current = Math.max(1, Math.min(steps.length, props.currentStep));

    const countersClass =
      props.counters === "small"
        ? " usa-step-indicator--counters-sm"
        : props.counters === "default"
          ? " usa-step-indicator--counters"
          : "";
    const centeredClass = props.centered ? " usa-step-indicator--center" : "";
    const noLabelsClass = props.noLabels
      ? " usa-step-indicator--no-labels"
      : "";

    return (
      <div
        className={`usa-step-indicator${countersClass}${centeredClass}${noLabelsClass}`}
        aria-label="Progress"
      >
        <ol className="usa-step-indicator__segments">
          {steps.map((label, i) => {
            const stepNum = i + 1;
            const isComplete = stepNum < current;
            const isCurrent = stepNum === current;
            const segClass = isComplete
              ? "usa-step-indicator__segment usa-step-indicator__segment--complete"
              : isCurrent
                ? "usa-step-indicator__segment usa-step-indicator__segment--current"
                : "usa-step-indicator__segment";

            return (
              <li
                key={i}
                className={segClass}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="usa-step-indicator__segment-label">
                  {label}
                  {isComplete && <span className="usa-sr-only">completed</span>}
                  {isCurrent && (
                    <span className="usa-sr-only">in progress</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="usa-step-indicator__header">
          <h4 className="usa-step-indicator__heading">
            <span className="usa-step-indicator__heading-counter">
              <span className="usa-sr-only">Step </span>
              <span className="usa-step-indicator__current-step">
                {current}
              </span>
              <span className="usa-step-indicator__total-steps">
                {" "}
                of {steps.length}
              </span>
            </span>
            {steps[current - 1] && (
              <span className="usa-step-indicator__heading-text">
                {steps[current - 1]}
              </span>
            )}
          </h4>
        </div>
      </div>
    );
  },

  Breadcrumb: ({ props }: BaseComponentProps<UswdsProps<"Breadcrumb">>) => {
    const items = props.items ?? [];
    return (
      <nav className="usa-breadcrumb" aria-label="Breadcrumbs">
        <ol className="usa-breadcrumb__list">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li
                key={i}
                className={`usa-breadcrumb__list-item${isLast ? " usa-current" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.href && !isLast ? (
                  <a href={item.href} className="usa-breadcrumb__link">
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },

  Link: ({ props, emit }: BaseComponentProps<UswdsProps<"Link">>) => {
    return (
      <a
        href={props.href}
        className={props.variant === "nav" ? "usa-nav__link" : "usa-link"}
        target={props.external ? "_blank" : undefined}
        rel={props.external ? "noreferrer" : undefined}
        onClick={() => emit("press")}
      >
        {props.label}
        {props.external && (
          <svg
            className="usa-icon"
            aria-label="(external link)"
            role="img"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            style={{ marginLeft: "0.25em", verticalAlign: "middle" }}
          >
            <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z" />
          </svg>
        )}
      </a>
    );
  },

  InPageNavigation: ({
    props,
  }: BaseComponentProps<UswdsProps<"InPageNavigation">>) => {
    const items = props.items ?? [];
    return (
      <nav
        aria-label={props.heading ?? "On this page"}
        className="usa-in-page-nav"
      >
        <div className="usa-in-page-nav__header">
          <p className="usa-in-page-nav__title">
            {props.heading ?? "On this page"}
          </p>
        </div>
        <ul className="usa-in-page-nav__list">
          {items.map((item, i) => (
            <li key={i} className="usa-in-page-nav__item">
              <a href={item.href} className="usa-in-page-nav__link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  },

  // ── Data Display ──────────────────────────────────────────────────────

  Table: ({ props }: BaseComponentProps<UswdsProps<"Table">>) => {
    const columns = props.columns ?? [];
    const rows = (props.rows ?? []).map((row) => row.map(String));

    const tableClass = [
      "usa-table",
      props.borderless ? "usa-table--borderless" : "",
      props.striped ? "usa-table--striped" : "",
      props.compact ? "usa-table--compact" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const table = (
      <table className={tableClass}>
        {props.caption && <caption>{props.caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );

    if (props.scrollable) {
      return (
        <div className="usa-table-container--scrollable" tabIndex={0}>
          {table}
        </div>
      );
    }
    return table;
  },

  Heading: ({ props }: BaseComponentProps<UswdsProps<"Heading">>) => {
    const level = props.level ?? "h2";
    if (level === "h1") return <h1 className="usa-prose">{props.text}</h1>;
    if (level === "h3") return <h3 className="usa-prose">{props.text}</h3>;
    if (level === "h4") return <h4 className="usa-prose">{props.text}</h4>;
    if (level === "h5") return <h5 className="usa-prose">{props.text}</h5>;
    if (level === "h6") return <h6 className="usa-prose">{props.text}</h6>;
    return <h2 className="usa-prose">{props.text}</h2>;
  },

  Text: ({ props }: BaseComponentProps<UswdsProps<"Text">>) => {
    if (props.variant === "lead") {
      return <p className="usa-intro">{props.text}</p>;
    }
    if (props.variant === "small") {
      return <small className="usa-prose">{props.text}</small>;
    }
    if (props.variant === "code") {
      return <code className="usa-prose">{props.text}</code>;
    }
    return <p className="usa-prose">{props.text}</p>;
  },

  Alert: ({ props }: BaseComponentProps<UswdsProps<"Alert">>) => {
    const typeClass =
      props.type === "success"
        ? "usa-alert--success"
        : props.type === "warning"
          ? "usa-alert--warning"
          : props.type === "error"
            ? "usa-alert--error"
            : props.type === "emergency"
              ? "usa-alert--emergency"
              : "usa-alert--info";

    const slimClass = props.slim ? " usa-alert--slim" : "";
    const noIconClass = props.noIcon ? " usa-alert--no-icon" : "";

    return (
      <div
        className={`usa-alert ${typeClass}${slimClass}${noIconClass}`}
        role="alert"
      >
        <div className="usa-alert__body">
          {props.heading && (
            <h4 className="usa-alert__heading">{props.heading}</h4>
          )}
          <p className="usa-alert__text">{props.message}</p>
        </div>
      </div>
    );
  },

  SiteAlert: ({ props }: BaseComponentProps<UswdsProps<"SiteAlert">>) => {
    const typeClass =
      props.type === "emergency"
        ? "usa-site-alert--emergency"
        : "usa-site-alert--info";
    const slimClass = props.slim ? " usa-site-alert--slim" : "";

    return (
      <section
        className={`usa-site-alert ${typeClass}${slimClass}`}
        aria-label="Site alert"
      >
        <div className="usa-alert">
          <div className="usa-alert__body">
            {props.heading && (
              <h3 className="usa-alert__heading">{props.heading}</h3>
            )}
            <p className="usa-alert__text">{props.message}</p>
          </div>
        </div>
      </section>
    );
  },

  Tag: ({ props }: BaseComponentProps<UswdsProps<"Tag">>) => {
    return (
      <span className={`usa-tag${props.big ? " usa-tag--big" : ""}`}>
        {props.text}
      </span>
    );
  },

  SummaryBox: ({ props }: BaseComponentProps<UswdsProps<"SummaryBox">>) => {
    const items = props.items ?? [];
    return (
      <div
        className="usa-summary-box"
        role="region"
        aria-labelledby="summary-box-key-information"
      >
        <div className="usa-summary-box__body">
          <h3
            className="usa-summary-box__heading"
            id="summary-box-key-information"
          >
            {props.heading}
          </h3>
          <div className="usa-summary-box__text">
            <ul className="usa-list">
              {items.map((item, i) => (
                <li key={i} className="usa-summary-box__list-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  },

  ProcessList: ({ props }: BaseComponentProps<UswdsProps<"ProcessList">>) => {
    const items = props.items ?? [];
    return (
      <ol className="usa-process-list">
        {items.map((item, i) => (
          <li key={i} className="usa-process-list__item">
            <h4 className="usa-process-list__heading">{item.heading}</h4>
            <p className="margin-top-05">{item.content}</p>
          </li>
        ))}
      </ol>
    );
  },

  GovBanner: ({ props }: BaseComponentProps<UswdsProps<"GovBanner">>) => {
    const [expanded, setExpanded] = useState(props.expanded ?? false);
    const tld = props.tld ?? ".gov";
    const isMil = tld === ".mil";

    return (
      <section
        className={`usa-banner${expanded ? " usa-banner--expanded" : ""}`}
        aria-label="Official website of the United States government"
      >
        <div className="usa-accordion">
          <header className="usa-banner__header">
            <div className="usa-banner__inner">
              <div className="grid-col-auto">
                <img
                  aria-hidden="true"
                  className="usa-banner__header-flag"
                  src="https://designsystem.digital.gov/assets/img/us_flag_small.png"
                  alt=""
                  width="16"
                  height="11"
                />
              </div>
              <div
                className="grid-col-fill tablet:grid-col-auto"
                aria-hidden="true"
              >
                <p className="usa-banner__header-text">
                  An official website of the United States government
                </p>
                <p className="usa-banner__header-action">
                  Here&#39;s how you know
                </p>
              </div>
              <button
                type="button"
                className="usa-accordion__button usa-banner__button"
                aria-expanded={expanded}
                aria-controls="gov-banner-content"
                onClick={() => setExpanded((v) => !v)}
              >
                <span className="usa-banner__button-text">
                  Here&#39;s how you know
                </span>
              </button>
            </div>
          </header>
          <div
            className="usa-banner__content usa-accordion__content"
            id="gov-banner-content"
            hidden={!expanded}
          >
            <div className="grid-row grid-gap-lg">
              <div className="usa-banner__guidance tablet:grid-col-6">
                <img
                  className="usa-banner__icon usa-media-block__img"
                  src="https://designsystem.digital.gov/assets/img/icon-dot-gov.svg"
                  role="img"
                  alt=""
                  aria-hidden="true"
                  width="40"
                  height="40"
                />
                <div className="usa-media-block__body">
                  <p>
                    <strong>
                      Official {isMil ? ".mil" : ".gov"} websites use HTTPS
                    </strong>
                    <br />A <strong>lock</strong> or <strong>https://</strong>{" "}
                    means you&#39;ve safely connected to the{" "}
                    {isMil ? ".mil" : ".gov"} website.
                  </p>
                </div>
              </div>
              <div className="usa-banner__guidance tablet:grid-col-6">
                <img
                  className="usa-banner__icon usa-media-block__img"
                  src="https://designsystem.digital.gov/assets/img/icon-https.svg"
                  role="img"
                  alt=""
                  aria-hidden="true"
                  width="40"
                  height="40"
                />
                <div className="usa-media-block__body">
                  <p>
                    <strong>
                      Secure {isMil ? ".mil" : ".gov"} websites use HTTPS
                    </strong>
                    <br />
                    Share sensitive information only on official, secure
                    websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },

  Collection: ({ props }: BaseComponentProps<UswdsProps<"Collection">>) => {
    const items = props.items ?? [];
    return (
      <ul className="usa-collection">
        {items.map((item, i) => (
          <li key={i} className="usa-collection__item">
            {item.thumbnailUrl && (
              <img
                className="usa-collection__thumbnail"
                src={item.thumbnailUrl}
                alt={item.thumbnailAlt ?? ""}
              />
            )}
            <div className="usa-collection__body">
              <h3 className="usa-collection__heading">
                {item.href ? (
                  <a className="usa-link" href={item.href}>
                    {item.heading}
                  </a>
                ) : (
                  item.heading
                )}
              </h3>
              {item.description && (
                <p className="usa-collection__description">
                  {item.description}
                </p>
              )}
              {(item.date || (item.tags && item.tags.length > 0)) && (
                <ul className="usa-collection__meta" aria-label="Topics">
                  {item.date && (
                    <li className="usa-collection__meta-item usa-collection__calendar-date">
                      <time dateTime={item.date}>
                        {item.dateLabel ?? item.date}
                      </time>
                    </li>
                  )}
                  {(item.tags ?? []).map((tag) => (
                    <li key={tag} className="usa-collection__meta-item usa-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  },

  Tooltip: ({ props }: BaseComponentProps<UswdsProps<"Tooltip">>) => {
    const [visible, setVisible] = useState(false);
    const position = props.position ?? "top";

    const positionClass = `usa-tooltip__body--${position}`;

    return (
      <span
        className="usa-tooltip"
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        <span
          tabIndex={0}
          className="usa-tooltip__trigger"
          aria-describedby="tooltip-description"
        >
          {props.label}
        </span>
        <span
          id="tooltip-description"
          className={`usa-tooltip__body ${positionClass}${visible ? " is-set is-visible" : ""}`}
          role="tooltip"
          aria-hidden={!visible}
        >
          {props.content}
        </span>
      </span>
    );
  },

  // ── Form Inputs ───────────────────────────────────────────────────────

  Button: ({ props, emit }: BaseComponentProps<UswdsProps<"Button">>) => {
    return (
      <button
        type={props.type ?? "button"}
        className={getButtonClass(props.variant)}
        disabled={props.disabled ?? false}
        onClick={() => emit("press")}
      >
        {props.label}
      </button>
    );
  },

  ButtonGroup: ({
    props,
    emit,
  }: BaseComponentProps<UswdsProps<"ButtonGroup">>) => {
    const buttons = props.buttons ?? [];
    return (
      <ul
        className={`usa-button-group${props.segmented ? " usa-button-group--segmented" : ""}`}
      >
        {buttons.map((btn) => (
          <li key={btn.value} className="usa-button-group__item">
            <button
              type="button"
              className={getButtonClass(btn.variant ?? "default")}
              onClick={() => emit("press")}
              data-value={btn.value}
            >
              {btn.label}
            </button>
          </li>
        ))}
      </ul>
    );
  },

  Input: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"Input">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "blur";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const hasError = errors.length > 0;
    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;
    const errorId = hasError ? `${inputId}-error` : undefined;

    return (
      <div
        className={`usa-form-group${hasError ? " usa-form-group--error" : ""}`}
      >
        <label className="usa-label" htmlFor={inputId}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        {hasError && (
          <span className="usa-error-message" id={errorId} role="alert">
            {errors[0]}
          </span>
        )}
        <input
          className={`usa-input${hasError ? " usa-input--error" : ""}`}
          id={inputId}
          name={props.name}
          type={props.type ?? "text"}
          placeholder={props.placeholder ?? undefined}
          required={props.required ?? undefined}
          disabled={props.disabled ?? undefined}
          value={value}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") emit("submit");
          }}
          onFocus={() => emit("focus")}
          onBlur={() => {
            if (hasValidation && validateOn === "blur") validate();
            emit("blur");
          }}
        />
      </div>
    );
  },

  Textarea: ({
    props,
    bindings,
  }: BaseComponentProps<UswdsProps<"Textarea">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "blur";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const hasError = errors.length > 0;
    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;
    const errorId = hasError ? `${inputId}-error` : undefined;

    return (
      <div
        className={`usa-form-group${hasError ? " usa-form-group--error" : ""}`}
      >
        <label className="usa-label" htmlFor={inputId}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        {hasError && (
          <span className="usa-error-message" id={errorId} role="alert">
            {errors[0]}
          </span>
        )}
        <textarea
          className={`usa-textarea${hasError ? " usa-input--error" : ""}`}
          id={inputId}
          name={props.name}
          placeholder={props.placeholder ?? undefined}
          required={props.required ?? undefined}
          rows={props.rows ?? 4}
          value={value}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
          }}
          onBlur={() => {
            if (hasValidation && validateOn === "blur") validate();
          }}
        />
      </div>
    );
  },

  Select: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"Select">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const hasError = errors.length > 0;
    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;
    const errorId = hasError ? `${inputId}-error` : undefined;

    const options = (props.options ?? []).map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt,
    );

    return (
      <div
        className={`usa-form-group${hasError ? " usa-form-group--error" : ""}`}
      >
        <label className="usa-label" htmlFor={inputId}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        {hasError && (
          <span className="usa-error-message" id={errorId} role="alert">
            {errors[0]}
          </span>
        )}
        <select
          className={`usa-select${hasError ? " usa-input--error" : ""}`}
          id={inputId}
          name={props.name}
          required={props.required ?? undefined}
          value={value}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          {props.placeholder && (
            <option value="" disabled>
              {props.placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },

  Checkbox: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"Checkbox">>) => {
    const [boundChecked, setBoundChecked] = useBoundProp<boolean>(
      props.checked as boolean | undefined,
      bindings?.checked,
    );
    const [localChecked, setLocalChecked] = useState(false);
    const isBound = !!bindings?.checked;
    const checked = isBound ? (boundChecked ?? false) : localChecked;
    const setChecked = isBound ? setBoundChecked : setLocalChecked;
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.checked && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.checked ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;

    return (
      <div
        className={`usa-form-group${errors.length > 0 ? " usa-form-group--error" : ""}`}
      >
        <div
          className={`usa-checkbox${props.tile ? " usa-checkbox--tile" : ""}`}
        >
          <input
            className="usa-checkbox__input"
            id={inputId}
            type="checkbox"
            name={props.name}
            checked={checked}
            aria-describedby={hintId}
            onChange={(e) => {
              setChecked(e.target.checked);
              if (hasValidation && validateOn === "change") validate();
              emit("change");
            }}
          />
          <label className="usa-checkbox__label" htmlFor={inputId}>
            {props.label}
            {props.hint && (
              <span className="usa-checkbox__label-description" id={hintId}>
                {props.hint}
              </span>
            )}
          </label>
        </div>
        {errors.length > 0 && (
          <span className="usa-error-message" role="alert">
            {errors[0]}
          </span>
        )}
      </div>
    );
  },

  CheckboxGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"CheckboxGroup">>) => {
    const [boundValues, setBoundValues] = useBoundProp<string[]>(
      props.values as string[] | undefined,
      bindings?.values,
    );
    const [localValues, setLocalValues] = useState<string[]>([]);
    const isBound = !!bindings?.values;
    const values = isBound ? (boundValues ?? []) : localValues;
    const setValues = isBound ? setBoundValues : setLocalValues;

    const options = props.options ?? [];

    const toggle = (val: string) => {
      const next = values.includes(val)
        ? values.filter((v) => v !== val)
        : [...values, val];
      setValues(next);
      emit("change");
    };

    return (
      <fieldset className="usa-fieldset">
        <legend className="usa-legend">{props.legend}</legend>
        {options.map((opt) => {
          const optId = `${props.name}-${opt.value}`;
          return (
            <div
              key={opt.value}
              className={`usa-checkbox${props.tile ? " usa-checkbox--tile" : ""}`}
            >
              <input
                className="usa-checkbox__input"
                id={optId}
                type="checkbox"
                name={props.name}
                value={opt.value}
                checked={values.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              <label className="usa-checkbox__label" htmlFor={optId}>
                {opt.label}
                {opt.hint && (
                  <span className="usa-checkbox__label-description">
                    {opt.hint}
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </fieldset>
    );
  },

  Radio: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"Radio">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const options = props.options ?? [];

    return (
      <fieldset
        className={`usa-fieldset${errors.length > 0 ? " usa-form-group--error" : ""}`}
      >
        <legend className="usa-legend">{props.legend}</legend>
        {errors.length > 0 && (
          <span className="usa-error-message" role="alert">
            {errors[0]}
          </span>
        )}
        {options.map((opt) => {
          const optId = `${props.name}-${opt.value}`;
          return (
            <div
              key={opt.value}
              className={`usa-radio${props.tile ? " usa-radio--tile" : ""}`}
            >
              <input
                className="usa-radio__input usa-radio__input--tile"
                id={optId}
                type="radio"
                name={props.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => {
                  setValue(opt.value);
                  if (hasValidation && validateOn === "change") validate();
                  emit("change");
                }}
              />
              <label className="usa-radio__label" htmlFor={optId}>
                {opt.label}
                {opt.hint && (
                  <span className="usa-radio__label-description">
                    {opt.hint}
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </fieldset>
    );
  },

  FileInput: ({ props, emit }: BaseComponentProps<UswdsProps<"FileInput">>) => {
    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;

    return (
      <div className="usa-form-group">
        <label className="usa-label" htmlFor={inputId}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        <input
          id={inputId}
          className="usa-file-input"
          type="file"
          name={props.name}
          accept={props.accept ?? undefined}
          multiple={props.multiple ?? undefined}
          required={props.required ?? undefined}
          aria-describedby={hintId}
          onChange={() => emit("change")}
        />
      </div>
    );
  },

  Search: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"Search">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const sizeClass =
      props.size === "small"
        ? " usa-search--small"
        : props.size === "big"
          ? " usa-search--big"
          : "";

    const roleAttr = props.label ? undefined : "search";

    return (
      <search className={`usa-search${sizeClass}`} role={roleAttr}>
        <div role="search">
          {props.label && (
            <label className="usa-sr-only" htmlFor="search-field">
              {props.label}
            </label>
          )}
          <input
            className="usa-input"
            id="search-field"
            type="search"
            name="search"
            placeholder={props.placeholder ?? undefined}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              emit("change");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") emit("submit");
            }}
          />
          <button
            className="usa-button"
            type="submit"
            onClick={() => emit("submit")}
          >
            <svg
              className="usa-icon"
              aria-hidden="true"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" />
            </svg>
            <span className="usa-search__submit-text">Search</span>
          </button>
        </div>
      </search>
    );
  },

  RangeInput: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"RangeInput">>) => {
    const [boundValue, setBoundValue] = useBoundProp<number>(
      props.value as number | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(props.value ?? props.min ?? 0);
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? 0) : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const inputId = props.name;

    return (
      <div className="usa-form-group">
        {props.label && (
          <label className="usa-label" htmlFor={inputId}>
            {props.label}
          </label>
        )}
        <input
          className="usa-range"
          id={inputId}
          name={props.name}
          type="range"
          min={props.min ?? 0}
          max={props.max ?? 100}
          step={props.step ?? 1}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
            emit("change");
          }}
        />
      </div>
    );
  },

  ComboBox: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"ComboBox">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const allOptions = (props.options ?? []).map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt,
    );
    const filtered = query
      ? allOptions.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase()),
        )
      : allOptions;

    const selectedLabel =
      allOptions.find((o) => o.value === value)?.label ?? value;
    const hasError = errors.length > 0;
    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;
    const errorId = hasError ? `${inputId}-error` : undefined;

    return (
      <div
        className={`usa-form-group${hasError ? " usa-form-group--error" : ""}`}
      >
        <label className="usa-label" htmlFor={`${inputId}-combo`}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        {hasError && (
          <span className="usa-error-message" id={errorId} role="alert">
            {errors[0]}
          </span>
        )}
        <div
          className={`usa-combo-box${value ? " usa-combo-box--pristine" : ""}`}
          style={{ position: "relative" }}
        >
          <select
            className="usa-select usa-sr-only"
            name={props.name}
            id={inputId}
            aria-hidden="true"
            tabIndex={-1}
            value={value}
            onChange={() => {}}
            required={props.required ?? undefined}
          >
            {props.placeholder && <option value="">{props.placeholder}</option>}
            {allOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            id={`${inputId}-combo`}
            className={`usa-combo-box__input${hasError ? " usa-input--error" : ""}`}
            type="text"
            autoComplete="off"
            role="combobox"
            aria-owns={`${inputId}-list`}
            aria-expanded={open}
            aria-autocomplete="list"
            aria-describedby={
              [hintId, errorId].filter(Boolean).join(" ") || undefined
            }
            placeholder={props.placeholder ?? undefined}
            value={open ? query : selectedLabel}
            onFocus={() => {
              setOpen(true);
              setQuery("");
            }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="usa-combo-box__toggle-list__wrapper">
            <button
              type="button"
              className="usa-combo-box__toggle-list"
              aria-label="Toggle the dropdown list"
              tabIndex={-1}
              onClick={() => setOpen((v) => !v)}
            >
              &nbsp;
            </button>
          </span>
          {open && filtered.length > 0 && (
            <ul
              id={`${inputId}-list`}
              className="usa-combo-box__list"
              role="listbox"
              aria-label={props.label}
              style={{
                position: "absolute",
                zIndex: 100,
                width: "100%",
                background: "#fff",
                border: "1px solid #565c65",
                maxHeight: 220,
                overflowY: "auto",
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {filtered.map((opt) => (
                <li
                  key={opt.value}
                  className={`usa-combo-box__list-option${value === opt.value ? " usa-combo-box__list-option--selected" : ""}`}
                  role="option"
                  aria-selected={value === opt.value}
                  aria-setsize={filtered.length}
                  style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                  onMouseDown={() => {
                    setValue(opt.value);
                    setQuery("");
                    setOpen(false);
                    if (hasValidation && validateOn === "change") validate();
                    emit("change");
                  }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },

  DatePicker: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"DatePicker">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(props.value ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const hasError = errors.length > 0;
    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;
    const errorId = hasError ? `${inputId}-error` : undefined;

    return (
      <div
        className={`usa-form-group${hasError ? " usa-form-group--error" : ""}`}
      >
        <label className="usa-label" htmlFor={inputId}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint ?? "mm/dd/yyyy"}
          </span>
        )}
        {hasError && (
          <span className="usa-error-message" id={errorId} role="alert">
            {errors[0]}
          </span>
        )}
        <div className="usa-date-picker">
          <input
            className={`usa-input${hasError ? " usa-input--error" : ""}`}
            id={inputId}
            name={props.name}
            type="date"
            required={props.required ?? undefined}
            min={props.minDate ?? undefined}
            max={props.maxDate ?? undefined}
            value={value}
            aria-describedby={
              [hintId, errorId].filter(Boolean).join(" ") || undefined
            }
            onChange={(e) => {
              setValue(e.target.value);
              if (hasValidation && validateOn === "change") validate();
              emit("change");
            }}
            onBlur={() => {
              if (hasValidation && validateOn === "blur") validate();
            }}
          />
        </div>
      </div>
    );
  },

  TimePicker: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"TimePicker">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(props.value ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const step = props.step ?? 30;
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };
    const toTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };
    const minMins = props.minTime ? toMinutes(props.minTime) : 0;
    const maxMins = props.maxTime ? toMinutes(props.maxTime) : 23 * 60 + 59;

    const options: string[] = [];
    for (let m = minMins; m <= maxMins; m += step) {
      options.push(toTime(m));
    }

    const formatDisplay = (t: string) => {
      if (!t) return "";
      const [h, m] = t.split(":").map(Number);
      const hour = h ?? 0;
      const suffix = hour >= 12 ? "p.m." : "a.m.";
      const displayH = hour % 12 || 12;
      return `${displayH}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
    };

    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;

    return (
      <div className="usa-form-group">
        <label className="usa-label" htmlFor={inputId}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        <div className="usa-time-picker">
          <select
            className="usa-select"
            id={inputId}
            name={props.name}
            required={props.required ?? undefined}
            value={value}
            aria-describedby={hintId}
            onChange={(e) => {
              setValue(e.target.value);
              emit("change");
            }}
          >
            <option value="">- Select -</option>
            {options.map((t) => (
              <option key={t} value={t}>
                {formatDisplay(t)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  },

  CharacterCount: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"CharacterCount">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(props.value ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined,
    );

    const remaining = props.maxLength - value.length;
    const isOver = remaining < 0;
    const hasError = errors.length > 0 || isOver;
    const inputId = props.name;
    const hintId = props.hint ? `${inputId}-hint` : undefined;
    const statusId = `${inputId}-status`;
    const errorId = hasError ? `${inputId}-error` : undefined;

    const sharedProps = {
      id: inputId,
      name: props.name,
      className: `usa-${props.multiline ? "textarea" : "input"}${hasError ? " usa-input--error" : ""}`,
      maxLength: props.maxLength,
      required: props.required ?? undefined,
      value,
      "aria-describedby": [hintId, statusId, errorId].filter(Boolean).join(" "),
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        setValue(e.target.value);
        if (hasValidation && validateOn === "change") validate();
        emit("change");
      },
      onBlur: () => {
        if (hasValidation && validateOn === "blur") validate();
      },
    };

    return (
      <div
        className={`usa-form-group usa-character-count${hasError ? " usa-form-group--error" : ""}`}
      >
        <label className="usa-label" htmlFor={inputId}>
          {props.label}
          {props.required && <span className="usa-sr-only"> (required)</span>}
        </label>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        {isOver && (
          <span className="usa-error-message" id={errorId} role="alert">
            {`${Math.abs(remaining)} characters over limit`}
          </span>
        )}
        {!isOver && errors.length > 0 && (
          <span className="usa-error-message" id={errorId} role="alert">
            {errors[0]}
          </span>
        )}
        {props.multiline ? (
          <textarea {...sharedProps} rows={props.rows ?? 4} />
        ) : (
          <input {...sharedProps} type="text" />
        )}
        <span
          id={statusId}
          className={`usa-character-count__status${isOver ? " usa-character-count__status--invalid" : ""}`}
          aria-live="polite"
        >
          {isOver
            ? `${Math.abs(remaining)} characters over limit`
            : `${remaining} characters allowed`}
        </span>
      </div>
    );
  },

  // ── Overlay / Modal ───────────────────────────────────────────────────

  Modal: ({ props, children }: BaseComponentProps<UswdsProps<"Modal">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    const isOpen = open ?? false;

    const modalId = "modal-" + props.heading.toLowerCase().replace(/\s+/g, "-");

    return (
      <>
        {isOpen && (
          <div
            className="usa-modal-overlay"
            aria-controls={modalId}
            data-open-modal
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              className={`usa-modal${props.large ? " usa-modal--lg" : ""}`}
              id={modalId}
              aria-labelledby={`${modalId}-heading`}
              aria-describedby={`${modalId}-description`}
              role="dialog"
            >
              <div className="usa-modal__content">
                <div className="usa-modal__main">
                  <h2 className="usa-modal__heading" id={`${modalId}-heading`}>
                    {props.heading}
                  </h2>
                  <div className="usa-prose" id={`${modalId}-description`}>
                    {props.description && <p>{props.description}</p>}
                    {children}
                  </div>
                </div>
                <button
                  type="button"
                  className="usa-button usa-modal__close"
                  aria-label="Close this window"
                  onClick={() => setOpen(false)}
                >
                  <svg
                    className="usa-icon"
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
};
