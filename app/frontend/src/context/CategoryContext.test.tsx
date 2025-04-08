import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryProvider, useCategories } from "./CategoryContext";
import { mockCategoryService } from "../test/mocks/api";

// Mock the category service
vi.mock("../api/categories", () => ({
  categoryService: mockCategoryService,
}));

// Test component that uses the category context
const TestComponent = () => {
  const {
    categories,
    popularCategories,
    loading,
    fetchCategories,
    fetchPopularCategories,
  } = useCategories();

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}

      <button data-testid="fetch-categories" onClick={() => fetchCategories()}>
        Fetch Categories
      </button>

      <button
        data-testid="fetch-popular"
        onClick={() => fetchPopularCategories()}
      >
        Fetch Popular Categories
      </button>

      <div data-testid="categories-count">{categories.length}</div>

      <ul data-testid="categories-list">
        {categories.map((category) => (
          <li key={category.id} data-testid={`category-${category.id}`}>
            {category.name}
          </li>
        ))}
      </ul>

      <div data-testid="popular-count">{popularCategories.length}</div>

      <ul data-testid="popular-list">
        {popularCategories.map((category) => (
          <li key={category.id} data-testid={`popular-${category.id}`}>
            {category.name} ({category.count})
          </li>
        ))}
      </ul>
    </div>
  );
};

describe("CategoryContext", () => {
  beforeEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });

  it("should fetch categories on mount", async () => {
    render(
      <CategoryProvider>
        <TestComponent />
      </CategoryProvider>
    );

    // Check if loading state is displayed
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    // Check if getCategories and getPopularCategories were called
    expect(mockCategoryService.getCategories).toHaveBeenCalled();
    expect(mockCategoryService.getPopularCategories).toHaveBeenCalled();

    // Wait for categories to be loaded
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Check if categories are displayed
    expect(screen.getByTestId("categories-count")).toHaveTextContent("1");
    expect(screen.getByTestId("category-1")).toHaveTextContent("Category 1");

    // Check if popular categories are displayed
    expect(screen.getByTestId("popular-count")).toHaveTextContent("2");
    expect(screen.getByTestId("popular-1")).toHaveTextContent(
      "Category 1 (10)"
    );
    expect(screen.getByTestId("popular-2")).toHaveTextContent("Category 2 (5)");
  });

  it("should fetch categories when fetchCategories is called", async () => {
    const user = userEvent.setup();

    render(
      <CategoryProvider>
        <TestComponent />
      </CategoryProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Reset mock function calls
    mockCategoryService.getCategories.mockClear();

    // Click fetch categories button
    await user.click(screen.getByTestId("fetch-categories"));

    // Check if getCategories was called
    expect(mockCategoryService.getCategories).toHaveBeenCalled();
  });

  it("should fetch popular categories when fetchPopularCategories is called", async () => {
    const user = userEvent.setup();

    render(
      <CategoryProvider>
        <TestComponent />
      </CategoryProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Reset mock function calls
    mockCategoryService.getPopularCategories.mockClear();

    // Click fetch popular categories button
    await user.click(screen.getByTestId("fetch-popular"));

    // Check if getPopularCategories was called
    expect(mockCategoryService.getPopularCategories).toHaveBeenCalled();
  });
});
