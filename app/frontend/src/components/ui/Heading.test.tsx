import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "./Typography";

describe("Heading Component", () => {
  it("renders with default props", () => {
    render(<Heading level="h2">Heading Content</Heading>);
    const heading = screen.getByText("Heading Content");
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveClass("text-xl");
    expect(heading).toHaveClass("font-bold");
  });

  it("applies custom className", () => {
    render(
      <Heading level="h2" className="custom-class">
        Heading Content
      </Heading>
    );
    const heading = screen.getByText("Heading Content");
    expect(heading).toHaveClass("custom-class");
  });

  it("renders different heading levels", () => {
    const { rerender } = render(<Heading level="h1">Heading Content</Heading>);
    expect(screen.getByText("Heading Content").tagName).toBe("H1");

    rerender(<Heading level="h3">Heading Content</Heading>);
    expect(screen.getByText("Heading Content").tagName).toBe("H3");

    rerender(<Heading level="h6">Heading Content</Heading>);
    expect(screen.getByText("Heading Content").tagName).toBe("H6");
  });

  it("applies different sizes", () => {
    const { rerender } = render(
      <Heading level="h2" size="sm">
        Heading Content
      </Heading>
    );
    expect(screen.getByText("Heading Content")).toHaveClass("text-sm");

    rerender(
      <Heading level="h2" size="2xl">
        Heading Content
      </Heading>
    );
    expect(screen.getByText("Heading Content")).toHaveClass("text-2xl");

    rerender(
      <Heading level="h2" size="4xl">
        Heading Content
      </Heading>
    );
    expect(screen.getByText("Heading Content")).toHaveClass("text-4xl");
  });

  it("applies different weights", () => {
    const { rerender } = render(
      <Heading level="h2" weight="normal">
        Heading Content
      </Heading>
    );
    expect(screen.getByText("Heading Content")).toHaveClass("font-normal");

    rerender(
      <Heading level="h2" weight="medium">
        Heading Content
      </Heading>
    );
    expect(screen.getByText("Heading Content")).toHaveClass("font-medium");

    rerender(
      <Heading level="h2" weight="semibold">
        Heading Content
      </Heading>
    );
    expect(screen.getByText("Heading Content")).toHaveClass("font-semibold");
  });
});
