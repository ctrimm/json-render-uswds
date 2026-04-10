import type { Assertion } from "vitest";
import "@testing-library/jest-dom";

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

interface CustomMatchers<R = void> {
  toBeInTheDocument(): R;
  toBeVisible(): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toBeEmpty(): R;
  toBeEmptyDOMElement(): R;
  toBeInvalid(): R;
  toBeRequired(): R;
  toBeValid(): R;
  toContainElement(element: HTMLElement | SVGElement | null): R;
  toContainHTML(html: string): R;
  toHaveAttribute(attr: string, value?: string): R;
  toHaveClass(className: string): R;
  toHaveFormValues(values: Record<string, any>): R;
  toHaveStyle(css: string | Record<string, any>): R;
  toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
  toHaveValue(value?: string | string[] | number): R;
  toHaveDisplayValue(value?: string | string[]): R;
  toBeChecked(): R;
  toHaveFocus(): R;
  toHaveErrorMessage(message: string): R;
  toBePartiallyChecked(): R;
}
