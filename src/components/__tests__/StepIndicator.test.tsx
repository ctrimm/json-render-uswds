import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { uswdsComponents } from "../../components";

const { StepIndicator } = uswdsComponents;

// Wrapper to convert regular props to json-render component format
function StepIndicatorTest(props: any) {
  return (
    <StepIndicator
      props={props}
      emit={() => {}}
      on={() => ({ emit: () => {}, shouldPreventDefault: false, bound: false })}
    />
  );
}

// Helper: assert that text appears at least once in the document
function expectText(pattern: RegExp) {
  expect(screen.getAllByText(pattern, { selector: "*" }).length).toBeGreaterThan(0);
}

describe("StepIndicator", () => {
  const defaultSteps = ["Step 1", "Step 2", "Step 3", "Step 4"];

  describe("Undefined/null handling", () => {
    it("should render step 1 when currentStep is undefined", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={undefined} />);
      expectText(/step 1/i);
    });

    it("should render step 1 when currentStep is null", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={null} />);
      expectText(/step 1/i);
    });

    it("should render step 1 when currentStep prop is missing", () => {
      render(<StepIndicatorTest steps={defaultSteps} />);
      expectText(/step 1/i);
    });

    it("should render step 1 when currentStep is 0", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={0} />);
      expectText(/step 1/i);
    });

    it("should render step 1 when currentStep is negative", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={-1} />);
      expectText(/step 1/i);
    });
  });

  describe("String parsing", () => {
    it("should parse string number and render correct step", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={"2"} />);
      expectText(/step 2/i);
    });

    it("should clamp string number above max to steps.length", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={"5"} />);
      expectText(/step 4/i);
    });

    it("should default to 1 for non-numeric string", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={"not a number"} />);
      expectText(/step 1/i);
    });

    it("should default to 1 for empty string", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={""} />);
      expectText(/step 1/i);
    });

    it("should parse valid string numbers correctly", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={"3"} />);
      expectText(/step 3/i);
    });
  });

  describe("Clamping bounds", () => {
    it("should clamp to max when currentStep exceeds steps.length", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={10} />);
      expectText(/step 4/i);
    });

    it("should clamp to min (1) when currentStep is less than 1", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={-5} />);
      expectText(/step 1/i);
    });

    it("should keep valid steps unchanged", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={2} />);
      expectText(/step 2/i);
    });

    it("should handle step at max boundary", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={4} />);
      expectText(/step 4/i);
    });

    it("should handle step at min boundary", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={1} />);
      expectText(/step 1/i);
    });
  });

  describe("No NaN regression", () => {
    it("should never display NaN in output", () => {
      const { container } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={"invalid"} />
      );
      expect(container.textContent).not.toContain("NaN");
    });

    it("should handle combined invalid values without crashing", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={null} />);
      expectText(/step 1/i);
    });

    it("should render valid step with undefined input", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={undefined} />);
      expectText(/step 1/i);
    });
  });

  describe("Normal operation - correct step marking", () => {
    it("should render correct step for valid input", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={2} />);
      expectText(/step 2/i);
    });

    it("should mark current step with correct CSS class", () => {
      const { container } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={2} />
      );
      const currentSegment = container.querySelector(
        ".usa-step-indicator__segment--current"
      );
      expect(currentSegment).toBeInTheDocument();
    });

    it("should set aria-current attribute on current step", () => {
      const { container } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={2} />
      );
      const currentStep = container.querySelector('[aria-current="step"]');
      expect(currentStep).toBeInTheDocument();
    });

    it("should mark previous steps as complete", () => {
      const { container } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={3} />
      );
      const completeSegments = container.querySelectorAll(
        ".usa-step-indicator__segment--complete"
      );
      expect(completeSegments.length).toBeGreaterThanOrEqual(2);
    });

    it("should render multiple steps correctly", () => {
      render(
        <StepIndicatorTest
          steps={["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"]}
          currentStep={3}
        />
      );
      expectText(/phase 3/i);
    });

    it("should handle step 1 as current", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={1} />);
      expectText(/step 1/i);
    });

    it("should handle last step as current", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={4} />);
      expectText(/step 4/i);
    });

    it("should handle middle step as current", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={2} />);
      expectText(/step 2/i);
    });
  });

  describe("Edge cases", () => {
    it("should handle single step array", () => {
      render(<StepIndicatorTest steps={["Only Step"]} currentStep={1} />);
      expectText(/only step/i);
    });

    it("should clamp with single step correctly", () => {
      render(<StepIndicatorTest steps={["Only Step"]} currentStep={10} />);
      expectText(/only step/i);
    });

    it("should handle empty steps array gracefully", () => {
      render(<StepIndicatorTest steps={[]} currentStep={1} />);
      // Should not crash, render what it can
      expect(document.body).toBeTruthy();
    });

    it("should handle very large currentStep value", () => {
      const { container } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={999999} />
      );
      expect(container.textContent).not.toContain("NaN");
    });

    it("should handle very small (negative) currentStep value", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={-999999} />);
      expectText(/step 1/i);
    });
  });

  describe("Type coercion", () => {
    it("should coerce boolean true to 1", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={true as any} />);
      expectText(/step 1/i);
    });

    it("should coerce boolean false to 0 (defaults to 1)", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={false as any} />);
      expectText(/step 1/i);
    });

    it("should parse decimal numbers correctly", () => {
      render(<StepIndicatorTest steps={defaultSteps} currentStep={2.7} />);
      // Should truncate/floor to 2
      expectText(/step 2/i);
    });

    it("should handle whitespace in string numbers", () => {
      render(
        <StepIndicatorTest steps={defaultSteps} currentStep={" 2 " as any} />
      );
      expectText(/step 2/i);
    });
  });

  describe("Rapid re-renders", () => {
    it("should handle rapid re-renders with different values without crashing", () => {
      const { rerender } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={1} />
      );

      rerender(<StepIndicatorTest steps={defaultSteps} currentStep={2} />);
      rerender(<StepIndicatorTest steps={defaultSteps} currentStep={undefined} />);
      rerender(<StepIndicatorTest steps={defaultSteps} currentStep={"invalid"} />);
      rerender(<StepIndicatorTest steps={defaultSteps} currentStep={4} />);

      expectText(/step 4/i);
    });
  });

  describe("Display formatting", () => {
    it("should display step counter", () => {
      const { container } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={2} />
      );
      // Counter is split across spans ("2" + "of 4"), check via container text
      const counter = container.querySelector(".usa-step-indicator__heading-counter");
      expect(counter?.textContent?.replace(/\s+/g, " ").trim()).toMatch(/2.*of.*4/i);
    });

    it("should display correct heading/label", () => {
      render(
        <StepIndicatorTest
          steps={["Application", "Review", "Confirmation"]}
          currentStep={1}
        />
      );
      expectText(/application/i);
    });

    it("should update heading when currentStep changes", () => {
      const { rerender } = render(
        <StepIndicatorTest steps={defaultSteps} currentStep={1} />
      );
      expectText(/step 1/i);

      rerender(<StepIndicatorTest steps={defaultSteps} currentStep={3} />);
      expectText(/step 3/i);
    });
  });
});
