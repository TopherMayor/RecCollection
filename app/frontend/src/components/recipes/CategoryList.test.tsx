import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryList } from "./CategoryList";
import { BrowserRouter } from "react-router-dom";

// Mock the useCategories hook
vi.mock("../../context/CategoryContext", () => ({
  useCategories: () => ({
    popularCategories: [
      { id: 1, name: "Category 1", count: 30 },
      { id: 2, name: "Category 2", count: 20 },
      { id: 3, name: "Category 3", count: 10 },
    ],
    loading: false,
    error: null,
    fetchPopularCategories: vi.fn(),
  }),
}));

describe("CategoryList", () => {
  beforeEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });

  it("should render the component with default title", () => {
    render(<CategoryList />);

    // Check if the title is displayed
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("should render the component with custom title", () => {
    render(<CategoryList title="Custom Title" />);

    // Check if the custom title is displayed
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should render categories with counts", () => {
    render(<CategoryList />);

    // Check if categories are displayed
    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 2")).toBeInTheDocument();
    expect(screen.getByText("Category 3")).toBeInTheDocument();

    // Check if counts are displayed
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check if categories have correct links
    expect(screen.getByText("Category 1").closest("a")).toHaveAttribute(
      "href",
      "/recipes?categoryId=1"
    );
    expect(screen.getByText("Category 2").closest("a")).toHaveAttribute(
      "href",
      "/recipes?categoryId=2"
    );
    expect(screen.getByText("Category 3").closest("a")).toHaveAttribute(
      "href",
      "/recipes?categoryId=3"
    );
  });

  it("should limit the number of categories displayed", () => {
    render(<CategoryList limit={2} />);

    // Check if only the first 2 categories are displayed
    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 2")).toBeInTheDocument();
    expect(screen.queryByText("Category 3")).not.toBeInTheDocument();

    // Check if "View all categories" link is displayed
    expect(screen.getByText("View all categories")).toBeInTheDocument();
    expect(
      screen.getByText("View all categories").closest("a")
    ).toHaveAttribute("href", "/categories");
  });

  it('should not show "View all categories" link if all categories are displayed', () => {
    render(<CategoryList limit={3} />);

    // Check if all categories are displayed
    expect(screen.getByText("Category 1")).toBeInTheDocument();
    expect(screen.getByText("Category 2")).toBeInTheDocument();
    expect(screen.getByText("Category 3")).toBeInTheDocument();

    // Check if "View all categories" link is not displayed
    expect(screen.queryByText("View all categories")).not.toBeInTheDocument();
  });
});
