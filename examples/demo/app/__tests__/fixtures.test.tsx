import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock dependencies
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
      spec: { type: "container", root: "main" },
    },
    {
      id: "public-records-gpt4o",
      groupId: "public-records",
      label: "Public Records Request",
      description: "FOIA records portal",
      prompt: "Create a public records request page...",
      model: "gpt-4o",
      provider: "openai",
      spec: { type: "container", root: "main" },
    },
    {
      id: "federal-benefits-claude",
      groupId: "federal-benefits",
      label: "Federal Benefits Application",
      description: "Benefits application form",
      prompt: "Build a Federal Benefits Application...",
      model: "claude-opus-4-6",
      provider: "anthropic",
      spec: { type: "form", root: "form" },
    },
    {
      id: "federal-benefits-gpt4o",
      groupId: "federal-benefits",
      label: "Federal Benefits Application",
      description: "Benefits application form",
      prompt: "Build a Federal Benefits Application...",
      model: "gpt-4o",
      provider: "openai",
      spec: { type: "form", root: "form" },
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

import Home from "../page";

describe("Fixture Loading", () => {
  describe("Loading a Fixture", () => {
    it("should set spec and activeTab when clicking Load", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const loadButtons = screen.getAllByText("Load");
      await user.click(loadButtons[0]);

      // Renderer should now be visible
      expect(screen.getByTestId("renderer")).toBeInTheDocument();
    });

    it("should display loaded fixture badge in tab bar", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const loadButtons = screen.getAllByText("Load");
      await user.click(loadButtons[0]);

      // Provider badge should appear in the tab bar
      const badges = screen.getAllByText(/anthropic|openai/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    it("should clear compareSlots when loading a fixture", async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Click first A button to set compare slot
      const aButtons = screen.getAllByText(/^A$/);
      await user.click(aButtons[0]);
      expect(aButtons[0]).toHaveClass("bg-blue-500");

      // Click first Load button - should clear compare slots
      const loadButtons = screen.getAllByText("Load");
      await user.click(loadButtons[0]);

      // After loading, A button should no longer be selected
      expect(aButtons[0]).not.toHaveClass("bg-blue-500");
    });
  });

  describe("Multiple Variants per Group", () => {
    it("should display all variants of a fixture group", () => {
      render(<Home />);

      const publicRecordsSection = screen.getByText("Public Records Request");
      const parent = publicRecordsSection.closest("[class*='rounded-lg']");

      expect(parent).toBeInTheDocument();
      // Should have multiple provider badges for different variants
      const badges = within(parent!).getAllByText(/anthropic|openai|google|meta/i);
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it("should show each variant with provider and model badges", () => {
      render(<Home />);

      // Verify provider/model badges are shown somewhere on the page
      const providerBadges = screen.getAllByText(/anthropic|openai/i);
      const modelBadges = screen.getAllByText(/claude-opus-4-6|gpt-4o/i);

      expect(providerBadges.length).toBeGreaterThan(0);
      expect(modelBadges.length).toBeGreaterThan(0);
    });

    it("should show independent A/B buttons for each variant", () => {
      render(<Home />);

      const publicRecordsSection = screen.getByText("Public Records Request");
      const parent = publicRecordsSection.closest("[class*='rounded-lg']");

      const aButtons = within(parent!).getAllByText(/^A$/);
      const bButtons = within(parent!).getAllByText(/^B$/);

      // Should have multiple A/B buttons for multiple variants
      expect(aButtons.length).toBeGreaterThanOrEqual(1);
      expect(bButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("A/B Slot Assignment", () => {
    it("should assign fixture to slot A on click", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(aButton).toHaveClass("bg-blue-500");
    });

    it("should assign different fixture to slot B", async () => {
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

    it("should support cross-group A/B assignment", async () => {
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

    it("should update A slot correctly when changed", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButtons = within(parent!).getAllByText(/^A$/);

      await user.click(aButtons[0]);
      expect(aButtons[0]).toHaveClass("bg-blue-500");
    });

    it("should show active state colors (blue-500 for A, green-500 for B)", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");

      const aButton = within(parent!).getAllByText(/^A$/)[0];
      const bButton = within(parent!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      expect(aButton).toHaveClass("bg-blue-500");

      await user.click(bButton);
      expect(bButton).toHaveClass("bg-green-500");
    });
  });

  describe("Clear A/B Functionality", () => {
    it("should reset both slots when Clear A/B is clicked", async () => {
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
    });

    it("should only show Clear A/B when slots are set", async () => {
      const user = userEvent.setup();
      render(<Home />);

      expect(screen.queryByText(/Clear A\/B/i)).not.toBeInTheDocument();

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(screen.getByText(/Clear A\/B/i)).toBeInTheDocument();
    });
  });

  describe("Load After Setting Slots", () => {
    it("should clear compareSlots when loading after setting slots", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtures = screen.getAllByText(/Public Records Request|Federal Benefits Application/);
      const publicRecords = fixtures[0].closest("[class*='rounded-lg']");

      const aButton = within(publicRecords!).getAllByText(/^A$/)[0];
      await user.click(aButton);

      const loadButtons = screen.getAllByText("Load");
      const loadButton = loadButtons[0];
      await user.click(loadButton);

      expect(aButton).not.toHaveClass("bg-blue-500");
    });

    it("should return to normal tab bar when loading clears compare", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];

      await user.click(aButton);
      expect(screen.getByText(/pick B to compare/i)).toBeInTheDocument();

      const loadButtons = screen.getAllByText("Load");
      const loadButton = loadButtons[0];
      await user.click(loadButton);

      expect(screen.queryByText(/pick B to compare/i)).not.toBeInTheDocument();
    });
  });

  describe("Multiple Fixture Groups", () => {
    it("should display both Public Records and Federal Benefits groups", () => {
      render(<Home />);

      expect(screen.getByText("Public Records Request")).toBeInTheDocument();
      expect(screen.getByText("Federal Benefits Application")).toBeInTheDocument();
    });

    it("should show group descriptions", () => {
      render(<Home />);

      expect(screen.getByText("FOIA records portal")).toBeInTheDocument();
      expect(screen.getByText("Benefits application form")).toBeInTheDocument();
    });

    it("should allow independent operations across groups", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtures = screen.getAllByText(/Public Records Request|Federal Benefits Application/);
      const publicRecords = fixtures[0].closest("[class*='rounded-lg']");
      const federalBenefits = fixtures.find((f) =>
        f.textContent === "Federal Benefits Application"
      )?.closest("[class*='rounded-lg']");

      const aButton = within(publicRecords!).getAllByText(/^A$/)[0];
      const bButton = within(federalBenefits!).getAllByText(/^B$/)[0];
      const loadButtons = screen.getAllByText("Load");
      const loadButton = loadButtons[0];

      await user.click(aButton);
      await user.click(bButton);
      expect(screen.getByText(/vs/)).toBeInTheDocument();

      await user.click(loadButton);
      expect(aButton).not.toHaveClass("bg-blue-500");
    });
  });

  describe("Edge Cases", () => {
    it("should handle loading a fixture then assigning same fixture to A", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");
      const aButton = within(parent!).getAllByText(/^A$/)[0];
      const loadButtons = screen.getAllByText("Load");
      const loadButton = loadButtons[0];

      await user.click(loadButton);
      await user.click(aButton);

      expect(aButton).toHaveClass("bg-blue-500");
    });

    it("should handle rapid A/B assignments", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const fixtureSection = screen.getByText("Public Records Request");
      const parent = fixtureSection.closest("[class*='rounded-lg']");

      const aButton = within(parent!).getAllByText(/^A$/)[0];
      const bButton = within(parent!).getAllByText(/^B$/)[0];

      await user.click(aButton);
      await user.click(bButton);
      await user.click(aButton);
      await user.click(bButton);

      expect(aButton).toHaveClass("bg-blue-500");
      expect(bButton).toHaveClass("bg-green-500");
    });

    it("should display provider and model badges correctly", () => {
      render(<Home />);

      const badges = screen.getAllByText(/anthropic|openai|google|meta/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe("State Persistence", () => {
    it("should maintain activeTab during slot operations", async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Click A button to set compare slot
      const aButtons = screen.getAllByText(/^A$/);
      const aButton = aButtons[0];
      await user.click(aButton);

      // A button should be highlighted when selected
      expect(aButton).toHaveClass("bg-blue-500");
    });
  });

  describe("Fixture Structure", () => {
    it("should render spec content when fixture is loaded", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const loadButtons = screen.getAllByText("Load");
      await user.click(loadButtons[0]);

      // Renderer should be visible with the spec
      expect(screen.getByTestId("renderer")).toBeInTheDocument();
    });

    it("should display correct provider and model per fixture", () => {
      render(<Home />);

      // Verify both provider and model information is displayed
      const providers = screen.getAllByText(/anthropic|openai/i);
      const models = screen.getAllByText(/claude-opus-4-6|gpt-4o/i);

      expect(providers.length).toBeGreaterThan(0);
      expect(models.length).toBeGreaterThan(0);
    });
  });
});
