"use client";

import { useState, useId } from "react";
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

/**
 * Block javascript:, vbscript:, and data: URIs to prevent XSS via href/src.
 * Returns "#" for any dangerous URL; otherwise returns the original value.
 */
function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^\s*(javascript|vbscript|data):/i.test(url)) return "#";
  return url;
}

/**
 * Sanitize a user-supplied URL for use inside a CSS url() value.
 * Strips characters that could break the url() context or trigger
 * CSS injection (quotes, parens, backslashes, newlines).
 */
function safeCssUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/['"()\\\n\r]/g, "");
}

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

  Footer: ({ props }: BaseComponentProps<UswdsProps<"Footer">>) => {
    const variant = props.variant ?? "medium";
    const groups = props.navGroups ?? [];
    const contact = props.contactInfo ?? [];

    const socialIcons: Record<string, string> = {
      facebook:
        "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
      twitter:
        "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
      youtube:
        "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
      instagram:
        "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z",
      linkedin:
        "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
      github:
        "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
      rss: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16 M5 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    };

    const returnToTopEl = props.returnToTop ? (
      <div className="grid-container usa-footer__return-to-top">
        <a href="#top">Return to top</a>
      </div>
    ) : null;

    const logoEl = (
      <div className="usa-footer__logo grid-row grid-gap-2">
        {props.logoUrl && (
          <div className="grid-col-auto">
            <img
              className="usa-footer__logo-img"
              src={props.logoUrl}
              alt={props.logoAlt ?? ""}
            />
          </div>
        )}
        <div className="grid-col-auto">
          <p className="usa-footer__logo-heading">
            <a
              className="usa-footer__logo-anchor"
              href={safeHref(props.agencyUrl) ?? "/"}
            >
              {props.agencyName}
            </a>
          </p>
        </div>
      </div>
    );

    const contactEl =
      contact.length > 0 ? (
        <address className="usa-footer__address">
          {props.contactHeading && (
            <p className="usa-footer__contact-heading">
              {props.contactHeading}
            </p>
          )}
          <div className="usa-footer__contact-info grid-row grid-gap">
            {contact.map((item, i) => (
              <div key={i} className="grid-col-auto">
                {item.type === "email" ? (
                  <a href={`mailto:${item.value}`}>{item.value}</a>
                ) : item.type === "phone" ? (
                  <a href={`tel:${item.value.replace(/\D/g, "")}`}>
                    {item.value}
                  </a>
                ) : (
                  <p>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </address>
      ) : null;

    const socialEl =
      (props.socialLinks ?? []).length > 0 ? (
        <div className="usa-footer__social-links grid-row grid-gap-1">
          {(props.socialLinks ?? []).map((s) => (
            <div key={s.platform} className="grid-col-auto">
              <a
                className="usa-social-link"
                href={safeHref(s.href)}
                aria-label={s.label}
                rel="noreferrer"
                target="_blank"
              >
                <svg
                  className="usa-icon"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path d={socialIcons[s.platform] ?? ""} />
                </svg>
              </a>
            </div>
          ))}
        </div>
      ) : null;

    if (variant === "slim") {
      const links = groups[0]?.links ?? [];
      return (
        <footer className="usa-footer usa-footer--slim">
          {returnToTopEl}
          <div className="usa-footer__primary-section">
            <div className="grid-container">
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col-fill usa-footer__primary-content">
                  {logoEl}
                </div>
                {links.length > 0 && (
                  <div className="tablet:grid-col-auto usa-footer__primary-content usa-footer__primary-content--collapsible">
                    <nav aria-label="Footer navigation">
                      <ul className="grid-row grid-gap">
                        {links.map((link, i) => (
                          <li
                            key={i}
                            className="mobile-lg:grid-col-auto usa-footer__primary-content"
                          >
                            <a
                              href={safeHref(link.href)}
                              className="usa-footer__primary-link"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
          {(contact.length > 0 || socialEl) && (
            <div className="usa-footer__secondary-section">
              <div className="grid-container">
                <div className="grid-row grid-gap">
                  <div className="usa-footer__contact-links mobile-lg:grid-col-12">
                    {socialEl}
                    {contactEl}
                  </div>
                </div>
              </div>
            </div>
          )}
        </footer>
      );
    }

    if (variant === "big") {
      return (
        <footer className="usa-footer usa-footer--big">
          {returnToTopEl}
          <div className="usa-footer__primary-section">
            <div className="grid-container">
              <div className="grid-row grid-gap-4">
                {groups.map((group, i) => (
                  <div key={i} className="tablet:grid-col-4">
                    {group.heading && (
                      <p className="usa-footer__primary-link">
                        {group.heading}
                      </p>
                    )}
                    <ul className="usa-list usa-list--unstyled">
                      {group.links.map((link, j) => (
                        <li key={j} className="usa-footer__secondary-link">
                          <a href={safeHref(link.href)}>{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="usa-footer__secondary-section">
            <div className="grid-container">
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col-4">{logoEl}</div>
                {(contact.length > 0 || socialEl) && (
                  <div className="tablet:grid-col-8 usa-footer__contact-links">
                    {socialEl}
                    {contactEl}
                  </div>
                )}
              </div>
            </div>
          </div>
        </footer>
      );
    }

    // medium (default)
    const links = groups[0]?.links ?? [];
    return (
      <footer className="usa-footer">
        {returnToTopEl}
        <div className="usa-footer__primary-section">
          <nav className="usa-footer__nav" aria-label="Footer navigation">
            <ul className="grid-row grid-gap">
              {links.map((link, i) => (
                <li
                  key={i}
                  className="mobile-lg:grid-col-4 desktop:grid-col-auto usa-footer__primary-content"
                >
                  <a href={safeHref(link.href)} className="usa-footer__primary-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="usa-footer__secondary-section">
          <div className="grid-container">
            <div className="grid-row grid-gap">
              <div className="tablet:grid-col-4">{logoEl}</div>
              {(contact.length > 0 || socialEl) && (
                <div className="tablet:grid-col-8 usa-footer__contact-links">
                  {socialEl}
                  {contactEl}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
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
                  <a href={safeHref(item.href)} className="usa-breadcrumb__link">
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

  Header: ({ props }: BaseComponentProps<UswdsProps<"Header">>) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const uid = useId();
    const isExtended = props.variant === "extended";
    const navItems = props.navItems ?? [];

    // Overlay is a sibling to the header, not a wrapper
    return (
      <>
        <div className={`usa-overlay${mobileOpen ? " is-visible" : ""}`} />
        <header
          className={`usa-header${isExtended ? " usa-header--extended" : " usa-header--basic"}`}
        >
          <div className="usa-nav-container">
            <div className="usa-navbar">
              <div className="usa-logo">
                <em className="usa-logo__text">
                  <a href={safeHref(props.siteUrl) ?? "/"} title="Home">
                    {props.logoUrl && (
                      <img
                        className="usa-header__logo"
                        src={props.logoUrl}
                        alt={props.logoAlt ?? ""}
                        style={{
                          maxHeight: "2.5rem",
                          marginRight: "0.5rem",
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                    {props.siteName}
                  </a>
                </em>
              </div>
              <button
                type="button"
                className="usa-menu-btn"
                onClick={() => setMobileOpen(true)}
              >
                Menu
              </button>
            </div>

            <nav
              aria-label="Primary navigation"
              className={`usa-nav${mobileOpen ? " is-visible" : ""}`}
            >
              <button
                type="button"
                className="usa-nav__close"
                onClick={() => {
                  setMobileOpen(false);
                  setOpenDropdown(null);
                }}
              >
                <svg
                  className="usa-icon"
                  aria-hidden="true"
                  focusable={false}
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
                Close
              </button>

              {props.showSearch && (
                <div role="search" className="usa-search usa-search--small">
                  <label
                    className="usa-sr-only"
                    htmlFor={`${uid}-header-search`}
                  >
                    Search
                  </label>
                  <input
                    className="usa-input"
                    id={`${uid}-header-search`}
                    type="search"
                    name="search"
                  />
                  <button className="usa-button" type="submit">
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
                    <span className="usa-sr-only">Search</span>
                  </button>
                </div>
              )}

              <ul className="usa-nav__primary usa-accordion">
                {navItems.map((item, i) => {
                  const hasDropdown = item.items && item.items.length > 0;
                  const isOpen = openDropdown === i;
                  const dropdownId = `${uid}-nav-dropdown-${i}`;
                  return (
                    <li
                      key={i}
                      className={`usa-nav__primary-item${item.current ? " usa-current" : ""}`}
                    >
                      {hasDropdown ? (
                        <>
                          <button
                            type="button"
                            className={`usa-accordion__button usa-nav__link${item.current ? " usa-current" : ""}`}
                            aria-expanded={isOpen}
                            aria-controls={dropdownId}
                            onClick={() => setOpenDropdown(isOpen ? null : i)}
                          >
                            <span>{item.label}</span>
                          </button>
                          <ul
                            id={dropdownId}
                            className="usa-nav__submenu"
                            hidden={!isOpen}
                          >
                            {(item.items ?? []).map((sub, j) => (
                              <li key={j} className="usa-nav__submenu-item">
                                <a href={safeHref(sub.href)}>{sub.label}</a>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <a
                          href={safeHref(item.href)}
                          className={`usa-nav__link${item.current ? " usa-current" : ""}`}
                          aria-current={item.current ? "page" : undefined}
                        >
                          <span>{item.label}</span>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </header>
      </>
    );
  },

  SkipNav: ({ props }: BaseComponentProps<UswdsProps<"SkipNav">>) => {
    return (
      <a className="usa-skipnav" href={safeHref(props.href) ?? "#main-content"}>
        {props.label ?? "Skip to main content"}
      </a>
    );
  },

  SideNav: ({ props }: BaseComponentProps<UswdsProps<"SideNav">>) => {
    const items = props.items ?? [];
    return (
      <nav aria-label={props.ariaLabel ?? "Side navigation"}>
        <ul className="usa-sidenav">
          {items.map((item, i) => (
            <li key={i} className="usa-sidenav__item">
              <a
                href={safeHref(item.href)}
                className={item.current ? "usa-current" : undefined}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </a>
              {item.children && item.children.length > 0 && (
                <ul className="usa-sidenav__sublist">
                  {item.children.map((child, j) => (
                    <li key={j} className="usa-sidenav__item">
                      <a
                        href={safeHref(child.href)}
                        className={child.current ? "usa-current" : undefined}
                        aria-current={child.current ? "page" : undefined}
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    );
  },

  LanguageSelector: ({
    props,
  }: BaseComponentProps<UswdsProps<"LanguageSelector">>) => {
    const [open, setOpen] = useState(false);
    const uid = useId();
    const submenuId = `${uid}-language-submenu`;
    const languages = props.languages ?? [];
    const current = props.currentLang ?? "";

    return (
      <nav aria-label="Language selector" className="usa-language-container">
        <ul className="usa-language__primary">
          <li className="usa-language__primary-item">
            <button
              type="button"
              className="usa-accordion__button usa-language__link"
              aria-expanded={open}
              aria-controls={submenuId}
              onClick={() => setOpen((v) => !v)}
            >
              {languages.find((l) => l.lang === current)?.label ?? "Language"}
            </button>
            <ul id={submenuId} className="usa-language__submenu" hidden={!open}>
              {languages
                .filter((l) => l.lang !== current)
                .map((lang) => (
                  <li key={lang.lang} className="usa-language__submenu-item">
                    <a
                      href={safeHref(lang.href)}
                      lang={lang.lang}
                      hrefLang={lang.lang}
                      className="usa-language__submenu-link"
                    >
                      {lang.localLabel ?? lang.label}
                    </a>
                  </li>
                ))}
            </ul>
          </li>
        </ul>
      </nav>
    );
  },

  Link: ({ props, emit }: BaseComponentProps<UswdsProps<"Link">>) => {
    return (
      <a
        href={safeHref(props.href)}
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
              <a href={safeHref(item.href)} className="usa-in-page-nav__link">
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
    const uid = useId();
    const headingId = `${uid}-summary-heading`;
    const items = props.items ?? [];
    return (
      <div
        className="usa-summary-box"
        role="region"
        aria-labelledby={headingId}
      >
        <div className="usa-summary-box__body">
          <h3 className="usa-summary-box__heading" id={headingId}>
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
                {/* US flag — inline SVG, no external dependency */}
                <svg
                  aria-hidden="true"
                  className="usa-banner__header-flag"
                  width="16"
                  height="11"
                  viewBox="0 0 16 11"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="16" height="11" fill="#B22234" />
                  <rect y="0.846" width="16" height="0.846" fill="white" />
                  <rect y="2.539" width="16" height="0.846" fill="white" />
                  <rect y="4.231" width="16" height="0.846" fill="white" />
                  <rect y="5.923" width="16" height="0.846" fill="white" />
                  <rect y="7.615" width="16" height="0.846" fill="white" />
                  <rect y="9.307" width="16" height="0.846" fill="white" />
                  <rect width="6.4" height="5.923" fill="#3C3B6E" />
                </svg>
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
                {/* .gov domain icon — inline SVG */}
                <svg
                  className="usa-banner__icon usa-media-block__img"
                  aria-hidden="true"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="20" fill="#005ea2" />
                  <path
                    fill="white"
                    d="M20 9l11 6.5V17H9v-1.5L20 9zM11 19h3v11h-3V19zm7.5 0h3v11h-3V19zm7 0h3v11h-3V19zM9 31h22v2H9V31z"
                  />
                </svg>
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
                {/* HTTPS lock icon — inline SVG */}
                <svg
                  className="usa-banner__icon usa-media-block__img"
                  aria-hidden="true"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="20" fill="#005ea2" />
                  <path
                    fill="white"
                    d="M20 10c-3.9 0-7 3.1-7 7v2h-2v13h18V19h-2v-2c0-3.9-3.1-7-7-7zm0 3c2.2 0 4 1.8 4 4v2h-8v-2c0-2.2 1.8-4 4-4zm0 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
                  />
                </svg>
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

  Identifier: ({ props }: BaseComponentProps<UswdsProps<"Identifier">>) => {
    const links = props.links ?? [];
    return (
      <section className="usa-identifier">
        <section
          className="usa-identifier__section usa-identifier__section--masthead"
          aria-label="Agency identifier"
        >
          <div className="usa-identifier__container">
            {props.logoUrl && (
              <div className="usa-identifier__logos">
                <a
                  href={safeHref(props.agencyUrl) ?? "/"}
                  className="usa-identifier__logo"
                >
                  <img
                    className="usa-identifier__logo-img"
                    src={props.logoUrl}
                    alt={props.logoAlt ?? `${props.agencyName} logo`}
                    role="img"
                  />
                </a>
              </div>
            )}
            <section
              className="usa-identifier__identity"
              aria-label="Agency description"
            >
              <p className="usa-identifier__identity-domain">{props.domain}</p>
              <p className="usa-identifier__identity-disclaimer">
                {props.disclaimer ?? (
                  <>
                    An official website of the{" "}
                    <a className="usa-link" href={safeHref(props.agencyUrl) ?? "/"}>
                      {props.agencyName}
                    </a>
                  </>
                )}
              </p>
            </section>
          </div>
        </section>
        {links.length > 0 && (
          <nav
            className="usa-identifier__section usa-identifier__section--required-links"
            aria-label="Important links"
          >
            <div className="usa-identifier__container">
              <ul className="usa-identifier__required-links-list">
                {links.map((link, i) => (
                  <li key={i} className="usa-identifier__required-links-item">
                    <a
                      href={safeHref(link.href)}
                      className="usa-identifier__required-link usa-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
        {(props.showUsagov ?? true) && (
          <section
            className="usa-identifier__section usa-identifier__section--usagov"
            aria-label="U.S. government information and services"
          >
            <div className="usa-identifier__container">
              <div className="usa-identifier__usagov-description">
                Looking for U.S. government information and services?{" "}
                <a className="usa-link" href="https://www.usa.gov/">
                  Visit USA.gov
                </a>
              </div>
            </div>
          </section>
        )}
      </section>
    );
  },

  IconList: ({ props }: BaseComponentProps<UswdsProps<"IconList">>) => {
    const items = props.items ?? [];
    const sizeClass = props.size ? ` usa-icon-list--size-${props.size}` : "";

    const colorMap: Record<string, string> = {
      success: "text-green",
      error: "text-red",
      warning: "text-gold",
      info: "text-blue",
      default: "",
    };

    // Inline SVG icons for common USWDS icon names
    const iconPaths: Record<string, string> = {
      check_circle:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z",
      cancel:
        "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z",
      info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
      warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
      error:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
      star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
      arrow_forward:
        "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
    };

    return (
      <ul className={`usa-icon-list${sizeClass}`}>
        {props.title && (
          <li className="usa-icon-list__item">
            <p className="usa-icon-list__title">{props.title}</p>
          </li>
        )}
        {items.map((item, i) => {
          const color = colorMap[item.color ?? "default"] ?? "";
          const path = iconPaths[item.icon] ?? iconPaths["info"];
          return (
            <li key={i} className="usa-icon-list__item">
              <div className={`usa-icon-list__icon${color ? ` ${color}` : ""}`}>
                <svg
                  className="usa-icon"
                  aria-hidden="true"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path d={path} />
                </svg>
              </div>
              <div className="usa-icon-list__content">{item.content}</div>
            </li>
          );
        })}
      </ul>
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
                  <a className="usa-link" href={safeHref(item.href)}>
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
    const uid = useId();
    const tooltipId = `${uid}-tooltip`;
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
          aria-describedby={tooltipId}
        >
          {props.label}
        </span>
        <span
          id={tooltipId}
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
    const uid = useId();
    const fieldId = `${uid}-search-field`;
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const sizeClass =
      props.size === "small"
        ? " usa-search--small"
        : props.size === "big"
          ? " usa-search--big"
          : "";

    return (
      <div role="search" className={`usa-search${sizeClass}`}>
        {props.label && (
          <label className="usa-sr-only" htmlFor={fieldId}>
            {props.label}
          </label>
        )}
        <input
          className="usa-input"
          id={fieldId}
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

  DateInputGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"DateInputGroup">>) => {
    const [boundMonth, setBoundMonth] = useBoundProp<string>(
      props.monthValue as string | undefined,
      bindings?.monthValue,
    );
    const [boundDay, setBoundDay] = useBoundProp<string>(
      props.dayValue as string | undefined,
      bindings?.dayValue,
    );
    const [boundYear, setBoundYear] = useBoundProp<string>(
      props.yearValue as string | undefined,
      bindings?.yearValue,
    );
    const [localMonth, setLocalMonth] = useState(props.monthValue ?? "");
    const [localDay, setLocalDay] = useState(props.dayValue ?? "");
    const [localYear, setLocalYear] = useState(props.yearValue ?? "");

    const monthVal = bindings?.monthValue ? (boundMonth ?? "") : localMonth;
    const dayVal = bindings?.dayValue ? (boundDay ?? "") : localDay;
    const yearVal = bindings?.yearValue ? (boundYear ?? "") : localYear;

    const hintId = props.hint ? `${props.name}-hint` : undefined;

    return (
      <fieldset className="usa-fieldset">
        <legend className="usa-legend">{props.label}</legend>
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        <div className="usa-memorable-date">
          <div className="usa-form-group usa-form-group--month">
            <label className="usa-label" htmlFor={`${props.name}-month`}>
              Month
            </label>
            <input
              className="usa-input usa-input--inline"
              id={`${props.name}-month`}
              name={`${props.name}_month`}
              type="text"
              inputMode="numeric"
              minLength={1}
              maxLength={2}
              pattern="[0-9]*"
              placeholder="MM"
              required={props.required ?? undefined}
              value={monthVal}
              aria-describedby={hintId}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                if (bindings?.monthValue) setBoundMonth(v);
                else setLocalMonth(v);
                emit("change");
              }}
            />
          </div>
          <div className="usa-form-group usa-form-group--day">
            <label className="usa-label" htmlFor={`${props.name}-day`}>
              Day
            </label>
            <input
              className="usa-input usa-input--inline"
              id={`${props.name}-day`}
              name={`${props.name}_day`}
              type="text"
              inputMode="numeric"
              minLength={1}
              maxLength={2}
              pattern="[0-9]*"
              placeholder="DD"
              required={props.required ?? undefined}
              value={dayVal}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                if (bindings?.dayValue) setBoundDay(v);
                else setLocalDay(v);
                emit("change");
              }}
            />
          </div>
          <div className="usa-form-group usa-form-group--year">
            <label className="usa-label" htmlFor={`${props.name}-year`}>
              Year
            </label>
            <input
              className="usa-input usa-input--inline"
              id={`${props.name}-year`}
              name={`${props.name}_year`}
              type="text"
              inputMode="numeric"
              minLength={4}
              maxLength={4}
              pattern="[0-9]*"
              placeholder="YYYY"
              required={props.required ?? undefined}
              value={yearVal}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (bindings?.yearValue) setBoundYear(v);
                else setLocalYear(v);
                emit("change");
              }}
            />
          </div>
        </div>
      </fieldset>
    );
  },

  DateRangePicker: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"DateRangePicker">>) => {
    const [boundStart, setBoundStart] = useBoundProp<string>(
      props.startValue as string | undefined,
      bindings?.startValue,
    );
    const [boundEnd, setBoundEnd] = useBoundProp<string>(
      props.endValue as string | undefined,
      bindings?.endValue,
    );
    const [localStart, setLocalStart] = useState(props.startValue ?? "");
    const [localEnd, setLocalEnd] = useState(props.endValue ?? "");

    const startVal = bindings?.startValue ? (boundStart ?? "") : localStart;
    const endVal = bindings?.endValue ? (boundEnd ?? "") : localEnd;

    const hintId = props.hint ? `${props.startName}-hint` : undefined;

    return (
      <div className="usa-date-range-picker">
        {props.hint && (
          <span className="usa-hint" id={hintId}>
            {props.hint}
          </span>
        )}
        <div className="usa-date-range-picker__range-start">
          <div className="usa-form-group">
            <label className="usa-label" htmlFor={props.startName}>
              {props.startLabel}
              {props.required && (
                <span className="usa-sr-only"> (required)</span>
              )}
            </label>
            <div className="usa-date-picker">
              <input
                className="usa-input"
                id={props.startName}
                name={props.startName}
                type="date"
                required={props.required ?? undefined}
                min={props.minDate ?? undefined}
                max={endVal || props.maxDate || undefined}
                value={startVal}
                aria-describedby={hintId}
                onChange={(e) => {
                  const v = e.target.value;
                  if (bindings?.startValue) setBoundStart(v);
                  else setLocalStart(v);
                  emit("change");
                }}
              />
            </div>
          </div>
        </div>
        <div className="usa-date-range-picker__range-end">
          <div className="usa-form-group">
            <label className="usa-label" htmlFor={props.endName}>
              {props.endLabel}
              {props.required && (
                <span className="usa-sr-only"> (required)</span>
              )}
            </label>
            <div className="usa-date-picker">
              <input
                className="usa-input"
                id={props.endName}
                name={props.endName}
                type="date"
                required={props.required ?? undefined}
                min={startVal || props.minDate || undefined}
                max={props.maxDate ?? undefined}
                value={endVal}
                onChange={(e) => {
                  const v = e.target.value;
                  if (bindings?.endValue) setBoundEnd(v);
                  else setLocalEnd(v);
                  emit("change");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },

  InputMask: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"InputMask">>) => {
    const PRESETS: Record<string, string> = {
      phone: "(___) ___-____",
      zip: "_____",
      "zip+4": "_____-____",
      ssn: "___-__-____",
    };

    const pattern =
      props.preset && props.preset !== "custom"
        ? (PRESETS[props.preset] ?? "")
        : (props.pattern ?? "");

    function applyMask(raw: string): string {
      const digits = raw.replace(/\D/g, "");
      let result = "";
      let di = 0;
      for (const ch of pattern) {
        if (di >= digits.length) break;
        if (ch === "_") {
          result += digits[di++];
        } else {
          result += ch;
        }
      }
      return result;
    }

    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(
      props.value ? applyMask(props.value) : "",
    );
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
    const placeholder = pattern.length > 0 ? pattern : undefined;

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
        <div className="usa-input-mask" data-mask={pattern}>
          <input
            className={`usa-masked usa-input${hasError ? " usa-input--error" : ""}`}
            id={inputId}
            name={props.name}
            type="text"
            inputMode="numeric"
            placeholder={placeholder}
            required={props.required ?? undefined}
            value={value}
            aria-describedby={
              [hintId, errorId].filter(Boolean).join(" ") || undefined
            }
            onChange={(e) => {
              const masked = applyMask(e.target.value);
              setValue(masked);
              if (hasValidation && validateOn === "change") validate();
              emit("change");
            }}
            onBlur={() => {
              if (hasValidation && validateOn === "blur") validate();
              emit("blur");
            }}
          />
        </div>
      </div>
    );
  },

  Password: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"Password">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const [visible, setVisible] = useState(false);
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
        <div className="usa-input-group">
          <input
            className={`usa-input${hasError ? " usa-input--error" : ""}`}
            id={inputId}
            name={props.name}
            type={visible ? "text" : "password"}
            autoComplete="current-password"
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
            onBlur={() => {
              if (hasValidation && validateOn === "blur") validate();
              emit("blur");
            }}
          />
          <div className="usa-input-group__append">
            <button
              type="button"
              className="usa-show-password usa-button usa-button--unstyled"
              aria-controls={inputId}
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? "Hide password" : "Show password"}
            </button>
          </div>
        </div>
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

  // ── Additional Display ────────────────────────────────────────────────

  Icon: ({ props }: BaseComponentProps<UswdsProps<"Icon">>) => {
    const sizeClass = props.size ? ` usa-icon--size-${props.size}` : "";
    const colorClass = props.color ? ` ${props.color}` : "";

    // Built-in paths for common USWDS icons
    const iconPaths: Record<string, string> = {
      check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
      check_circle:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z",
      close:
        "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
      cancel:
        "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z",
      search:
        "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14",
      arrow_forward:
        "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
      arrow_back:
        "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
      info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
      warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
      error:
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
      star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
      menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
      expand_more: "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z",
      expand_less: "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z",
      lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
      mail: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
      phone:
        "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
      home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
      person:
        "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
      settings:
        "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    };

    const path = iconPaths[props.name] ?? iconPaths["info"];
    const isAriaHidden = !props.ariaLabel;

    return (
      <svg
        className={`usa-icon${sizeClass}${colorClass}`}
        aria-hidden={isAriaHidden ? true : undefined}
        aria-label={props.ariaLabel ?? undefined}
        role={props.ariaLabel ? "img" : undefined}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={path} />
      </svg>
    );
  },

  InputGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<UswdsProps<"InputGroup">>) => {
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
        <div
          className={`usa-input-group${hasError ? " usa-input-group--error" : ""}`}
        >
          {props.prefix && (
            <div className="usa-input-prefix" aria-hidden="true">
              {props.prefix}
            </div>
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
              emit("change");
            }}
            onBlur={() => {
              if (hasValidation && validateOn === "blur") validate();
              emit("blur");
            }}
          />
          {props.suffix && (
            <div className="usa-input-suffix" aria-hidden="true">
              {props.suffix}
            </div>
          )}
        </div>
      </div>
    );
  },

  List: ({ props }: BaseComponentProps<UswdsProps<"List">>) => {
    const items = props.items ?? [];
    const variant = props.variant ?? "unordered";

    const className =
      variant === "unstyled" ? "usa-list usa-list--unstyled" : "usa-list";

    if (variant === "ordered") {
      return (
        <ol className={className}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    }
    return (
      <ul className={className}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  },

  ValidationChecklist: ({
    props,
  }: BaseComponentProps<UswdsProps<"ValidationChecklist">>) => {
    const items = props.items ?? [];
    return (
      <div>
        {props.heading && (
          <p className="usa-prose">
            <strong>{props.heading}</strong>
          </p>
        )}
        <ul className="usa-checklist">
          {items.map((item, i) => (
            <li
              key={i}
              className={`usa-checklist__item${item.checked ? " usa-checklist__item--checked" : ""}`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    );
  },

  // ── Page-level / Layout Components ───────────────────────────────────

  Form: ({ props, children, emit }: BaseComponentProps<UswdsProps<"Form">>) => {
    return (
      <form
        className={`usa-form${props.large ? " usa-form--large" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          emit("submit");
        }}
      >
        {children}
      </form>
    );
  },

  Section: ({ props, children }: BaseComponentProps<UswdsProps<"Section">>) => {
    const variantClass =
      props.variant === "light"
        ? " usa-section--light"
        : props.variant === "dark"
          ? " usa-section--dark"
          : "";

    return (
      <section className={`usa-section${variantClass}`}>
        <div className="grid-container">
          {props.title && <h2 className="usa-prose">{props.title}</h2>}
          {props.text && <p className="usa-prose">{props.text}</p>}
          {children}
        </div>
      </section>
    );
  },

  Prose: ({ props, children }: BaseComponentProps<UswdsProps<"Prose">>) => {
    const element = props.element ?? "div";
    if (element === "article")
      return <article className="usa-prose">{children}</article>;
    if (element === "section")
      return <section>{children}</section>;
    if (element === "main")
      return <main>{children}</main>;
    return <div>{children}</div>;
  },

  Hero: ({ props }: BaseComponentProps<UswdsProps<"Hero">>) => {
    return (
      <section
        className="usa-hero"
        aria-label={props.ariaLabel ?? "Introduction"}
        style={
          props.backgroundUrl
            ? { backgroundImage: `url(${safeCssUrl(props.backgroundUrl)})` }
            : undefined
        }
      >
        <div className="grid-container">
          <div className="usa-hero__callout">
            <h1 className="usa-hero__heading">
              {props.eyebrow && (
                <span className="usa-hero__heading--alt">{props.eyebrow}</span>
              )}
              {props.heading}
            </h1>
            {props.body && <p>{props.body}</p>}
          </div>
        </div>
      </section>
    );
  },

  GraphicList: ({ props }: BaseComponentProps<UswdsProps<"GraphicList">>) => {
    const items = props.items ?? [];
    return (
      <section className="usa-graphic-list usa-section">
        <div className="grid-container">
          {props.heading && (
            <h2 className="usa-graphic-list__heading">{props.heading}</h2>
          )}
          <div className="usa-graphic-list__row grid-row grid-gap">
            {items.map((item, i) => (
              <div key={i} className="usa-media-block tablet:grid-col">
                {item.imageUrl && (
                  <img
                    className="usa-media-block__img"
                    src={item.imageUrl}
                    alt={item.imageAlt ?? ""}
                  />
                )}
                <div className="usa-media-block__body">
                  <h3 className="usa-graphic-list__heading">{item.heading}</h3>
                  <p>{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },

  EmbedContainer: ({
    props,
  }: BaseComponentProps<UswdsProps<"EmbedContainer">>) => {
    return (
      <div className="usa-embed-container">
        <iframe
          src={safeHref(props.src)}
          title={props.title}
          sandbox="allow-scripts allow-same-origin allow-fullscreen allow-forms allow-popups"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  },

  // ── Overlay / Modal ───────────────────────────────────────────────────

  Modal: ({ props, children }: BaseComponentProps<UswdsProps<"Modal">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    const isOpen = open ?? false;
    const uid = useId();
    const modalId = `${uid}-modal`;

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
