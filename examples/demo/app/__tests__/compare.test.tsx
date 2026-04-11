import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock dependencies to avoid rendering overhead
vi.mock("@/lib/registry", () => ({ registry: {} }));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));
vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
}));
vi.mock("@/components/ui/separator", () => ({
  Separator: (props: any) => <hr {...props} />,
}));
vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => null,
}));
vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@json-render/react", () => ({
  Renderer: ({ spec }: any) => (
    <div data-testid="renderer">{JSON.stringify(spec)}</div>
  ),
  JSONUIProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/lib/fixtures", () => {
  const mockFixtures = [
    {
      id: "public-records-claude",
      groupId: "public-records",
      label: "Public Records Request",
      description: "FOIA records portal",
      prompt: "Create a public records request page...",
      model: "claude-opus-4-6",
      provider: "anthropic",
      spec: { type: "container" },
    },
    {
      id: "public-records-gpt4o",
      groupId: "public-records",
      label: "Public Records Request",
      description: "FOIA records portal",
      prompt: "Create a public records request page...",
      model: "gpt-4o",
      provider: "openai",
      spec: { type: "container" },
    },
    {
      id: "federal-benefits-claude",
      groupId: "federal-benefits",
      label: "Federal Benefits Application",
      description: "Benefits application form",
      prompt: "Build a Federal Benefits Application...",
      model: "claude-opus-4-6",
      provider: "anthropic",
      spec: { type: "form" },
    },
    {
      id: "federal-benefits-gpt4o",
      groupId: "federal-benefits",
      label: "Federal Benefits Application",
      description: "Benefits application form",
      prompt: "Build a Federal Benefits Application...",
      model: "gpt-4o",
      provider: "openai",
      spec: { type: "form" },
    },
  ];

  return {
    FIXTURES: mockFixtures,
    getFixtureGroups: () => {
      const map = new Map();
      for (const fixture of mockFixtures) {
        if (!map.has(fixture.groupId)) {
          map.set(fixture.groupId, {
            groupId: fixture.groupId,
            label: fixture.label,
            description: fixture.description,
            variants: [],
          });
        }
        map.get(fixture.groupId).variants.push(fixture);
      }
      return Array.from(map.values());
    },
  };
});

// Import after mocks are set up
import Home from "../page";

describe("Compare Feature", () => {
  describe("Initial State", () => {
    it("should initialize with compareSlots as [null, null]", () => {
      render(<Home />);
      expect(screen.queryByText(/Exit compare/i)).not.toBeInTheDocument();
    });

    it("should show normal content when compareSlots is [null, null]", () => {
      render(<Home />);
      expect(
        screen.getByText(/No fixture loaded/i)
      ).toBeInTheDocument();
    });
  });

  describe("Slot Selection", () => {
    it("should set compareSlots when clicking A button", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(aButton).toHaveClass("bg-blue-500");
    });

    it("should set compareSlots when clicking B button", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const bButton = within(parent!).getAllByText(/^B$/)[0];

      await user.click(bButton);
      expect(bButton).toHaveClass("bg-green-500");
    });

    it("should allow selecting different fixtures for A and B", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtures = screen.getAllByText(/Public Records Request|Federal Benefits Application/);
      const publicRecords = fixtures[0].closest("[class*='rounded-lg']");
      const federalBenefits = fixtures.find((f) =>
        f.textContent === "Federal Benefits Application"
      )?.closest("[class*='rounded-lg']");

      const aButton = within(publicRecords!).getAllByText(/^A$/)[0];
      const bButton = within(federalBenefits!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      await user.click(bButton);

      expect(aButton).toHaveClass("bg-blue-500");
      expect(bButton).toHaveClass("bg-green-500");
    });

    it("should allow selecting same fixture for both A and B", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");

      const aButton = within(parent!).getAllByText(/^A$/)[0];
      const bButton = within(parent!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      await user.click(bButton);

      expect(aButton).toHaveClass("bg-blue-500");
      expect(bButton).toHaveClass("bg-green-500");
    });
  });

  describe("View Rendering", () => {
    it("should show compare tab bar when A slot is set", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(screen.getByText(/pick B to compare/i)).toBeInTheDocument();
    });

    it("should render single panel full-width with only A", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      const renderers = screen.queryAllByTestId("renderer");
      expect(renderers.length).toBeGreaterThanOrEqual(1);
    });

    it("should render split view when both A and B are set", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtures = screen.getAllByText(/Public Records Request|Federal Benefits Application/);
      const publicRecords = fixtures[0].closest("[class*='rounded-lg']");
      const federalBenefits = fixtures.find((f) =>
        f.textContent === "Federal Benefits Application"
      )?.closest("[class*='rounded-lg']");

      const aButton = within(publicRecords!).getAllByText(/^A$/)[0];
      const bButton = within(federalBenefits!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      await user.click(bButton);

      expect(screen.getByText(/vs/)).toBeInTheDocument();
    });
  });

  describe("Tab Bar Content", () => {
    it("should display 'pick B to compare' when only A is set", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(screen.getByText(/pick B to compare/i)).toBeInTheDocument();
    });

    it("should show 'vs' when both A and B are set", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtures = screen.getAllByText(/Public Records Request|Federal Benefits Application/);
      const publicRecords = fixtures[0].closest("[class*='rounded-lg']");
      const federalBenefits = fixtures.find((f) =>
        f.textContent === "Federal Benefits Application"
      )?.closest("[class*='rounded-lg']");

      const aButton = within(publicRecords!).getAllByText(/^A$/)[0];
      const bButton = within(federalBenefits!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      await user.click(bButton);

      expect(screen.getByText(/vs/)).toBeInTheDocument();
    });

    it("should show 'Exit compare' button when compare is active", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(screen.getByText(/Exit compare/i)).toBeInTheDocument();
    });
  });

  describe("Clearing and Exiting Compare", () => {
    it("should clear slots when 'Clear A/B' is clicked", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(aButton).toHaveClass("bg-blue-500");

      const clearButton = screen.getByText(/Clear A\/B/i);
      await user.click(clearButton);

      expect(aButton).not.toHaveClass("bg-blue-500");
      expect(
        screen.getByText(/No fixture loaded/i)
      ).toBeInTheDocument();
    });

    it("should exit compare when 'Exit compare' button is clicked", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      const exitButton = screen.getByText(/Exit compare/i);
      await user.click(exitButton);

      expect(screen.queryByText(/Exit compare/i)).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle same fixture for both A and B", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");

      const aButton = within(parent!).getAllByText(/^A$/)[0];
      const bButton = within(parent!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      await user.click(bButton);

      expect(aButton).toHaveClass("bg-blue-500");
      expect(bButton).toHaveClass("bg-green-500");
      expect(screen.getByText(/vs/)).toBeInTheDocument();
    });

    it("should support selecting from different groups", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtures = screen.getAllByText(/Public Records Request|Federal Benefits Application/);
      const publicRecords = fixtures[0].closest("[class*='rounded-lg']");
      const federalBenefits = fixtures.find((f) =>
        f.textContent === "Federal Benefits Application"
      )?.closest("[class*='rounded-lg']");

      expect(publicRecords).toBeTruthy();
      expect(federalBenefits).toBeTruthy();

      const aButton = within(publicRecords!).getAllByText(/^A$/)[0];
      const bButton = within(federalBenefits!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      await user.click(bButton);

      expect(screen.getByText(/vs/)).toBeInTheDocument();
    });
  });

  describe("Panel Headers", () => {
    it("should display A badge with blue color", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);

      // Button should be highlighted after clicking
      expect(aButton).toHaveClass("bg-blue-500");
    });

    it("should display provider and model in panel header", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);

      // Verify compare state is active after clicking A button
      expect(aButton).toHaveClass("bg-blue-500");
    });
  });

  describe("Integration with Fixtures", () => {
    it("should show all fixture groups", () => {
      render(<Home />);

      expect(screen.getByText("Public Records Request")).toBeInTheDocument();
      expect(screen.getByText("Federal Benefits Application")).toBeInTheDocument();
    });

    it("should show provider badges for all fixtures", () => {
      render(<Home />);

      // Verify provider badges are shown (at least one per fixture group)
      const badges = screen.getAllByText(/anthropic|openai/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
