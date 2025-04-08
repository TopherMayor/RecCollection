import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../test/test-utils";
import { TagCloud } from "./TagCloud";
import { mockTagService } from "../../test/mocks/api";

// Mock the tag context
vi.mock("../../context/TagContext", async () => {
  const actual = await vi.importActual("../../context/TagContext");
  return {
    ...actual,
    useTags: () => ({
      popularTags: [
        { id: 1, name: "tag1", count: 40 },
        { id: 2, name: "tag2", count: 30 },
        { id: 3, name: "tag3", count: 20 },
      ],
      loading: false,
      error: null,
      fetchPopularTags: vi.fn(),
    }),
  };
});

describe("TagCloud", () => {
  beforeEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });

  it("should render the component with default title", () => {
    render(<TagCloud />);

    // Check if the title is displayed
    expect(screen.getByText("Popular Tags")).toBeInTheDocument();
  });

  it("should render the component with custom title", () => {
    render(<TagCloud title="Custom Title" />);

    // Check if the custom title is displayed
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should render tags with correct styling", () => {
    render(<TagCloud />);

    // Check if tags are displayed
    expect(screen.getByText("#tag1")).toBeInTheDocument();
    expect(screen.getByText("#tag2")).toBeInTheDocument();
    expect(screen.getByText("#tag3")).toBeInTheDocument();

    // Check if tags have correct links
    expect(screen.getByText("#tag1").closest("a")).toHaveAttribute(
      "href",
      "/recipes?tag=tag1"
    );
    expect(screen.getByText("#tag2").closest("a")).toHaveAttribute(
      "href",
      "/recipes?tag=tag2"
    );
    expect(screen.getByText("#tag3").closest("a")).toHaveAttribute(
      "href",
      "/recipes?tag=tag3"
    );
  });

  it("should limit the number of tags displayed", () => {
    render(<TagCloud limit={2} />);

    // Check if only the first 2 tags are displayed
    expect(screen.getByText("#tag1")).toBeInTheDocument();
    expect(screen.getByText("#tag2")).toBeInTheDocument();
    expect(screen.queryByText("#tag3")).not.toBeInTheDocument();

    // Check if "View all tags" link is displayed
    expect(screen.getByText("View all tags")).toBeInTheDocument();
    expect(screen.getByText("View all tags").closest("a")).toHaveAttribute(
      "href",
      "/tags"
    );
  });

  it('should not show "View all tags" link if all tags are displayed', () => {
    render(<TagCloud limit={3} />);

    // Check if all tags are displayed
    expect(screen.getByText("#tag1")).toBeInTheDocument();
    expect(screen.getByText("#tag2")).toBeInTheDocument();
    expect(screen.getByText("#tag3")).toBeInTheDocument();

    // Check if "View all tags" link is not displayed
    expect(screen.queryByText("View all tags")).not.toBeInTheDocument();
  });
});
