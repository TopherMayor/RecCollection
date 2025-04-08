import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../test/test-utils";
import { RecipeStats } from "./RecipeStats";
import { mockStats, mockStatsService } from "../../test/mocks/api";

// Mock the stats context
vi.mock("../../context/StatsContext", async () => {
  const actual = await vi.importActual("../../context/StatsContext");
  return {
    ...actual,
    useStats: () => ({
      recipeStats: mockStats,
      loading: false,
      error: null,
      fetchRecipeStats: vi.fn(),
    }),
  };
});

describe("RecipeStats", () => {
  beforeEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });

  it("should render the component with default title", () => {
    render(<RecipeStats />);

    // Check if the title is displayed
    expect(screen.getByText("Recipe Stats")).toBeInTheDocument();
  });

  it("should render the component with custom title", () => {
    render(<RecipeStats title="Custom Title" />);

    // Check if the custom title is displayed
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should render recipe statistics", () => {
    render(<RecipeStats />);

    // Check if statistics are displayed
    expect(screen.getByText("100")).toBeInTheDocument(); // totalRecipes
    expect(screen.getByText("50")).toBeInTheDocument(); // totalUsers
    expect(screen.getByText("500")).toBeInTheDocument(); // totalLikes
    expect(screen.getByText("200")).toBeInTheDocument(); // totalComments

    // Check if labels are displayed
    expect(screen.getByText("Recipes")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Likes")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
  });

  it("should render popular categories", () => {
    render(<RecipeStats />);

    // Check if popular categories section is displayed
    expect(screen.getByText("Popular Categories")).toBeInTheDocument();

    // Check if categories are displayed
    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 2")).toBeInTheDocument();
    expect(screen.getByText("Category 3")).toBeInTheDocument();

    // Check if counts are displayed
    expect(screen.getByText("30 recipes")).toBeInTheDocument();
    expect(screen.getByText("20 recipes")).toBeInTheDocument();
    expect(screen.getByText("10 recipes")).toBeInTheDocument();
  });

  it("should render popular tags", () => {
    render(<RecipeStats />);

    // Check if popular tags section is displayed
    expect(screen.getByText("Popular Tags")).toBeInTheDocument();

    // Check if tags are displayed
    expect(screen.getByText("#tag1")).toBeInTheDocument();
    expect(screen.getByText("#tag2")).toBeInTheDocument();
    expect(screen.getByText("#tag3")).toBeInTheDocument();
  });

  it("should call fetchRecipeStats on mount", () => {
    const fetchRecipeStats = vi.fn();

    // Update the mock for this test only
    vi.mock(
      "../../context/StatsContext",
      async () => {
        const actual = await vi.importActual("../../context/StatsContext");
        return {
          ...actual,
          useStats: () => ({
            recipeStats: mockStats,
            loading: false,
            error: null,
            fetchRecipeStats,
            userStats: null,
            fetchUserStats: vi.fn(),
          }),
        };
      },
      { virtual: true }
    );

    render(<RecipeStats />);

    // Check if fetchRecipeStats was called
    expect(fetchRecipeStats).toHaveBeenCalled();
  });
});
