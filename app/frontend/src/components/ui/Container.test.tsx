import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "./layout/Container";

describe("Container Component", () => {
  it("renders with default props", () => {
    render(<Container>Container Content</Container>);
    const container = screen.getByText("Container Content");
    expect(container).toBeInTheDocument();
    expect(container.parentElement).toHaveClass("mx-auto");
    expect(container.parentElement).toHaveClass("max-w-screen-lg");
    expect(container.parentElement).toHaveClass("px-4");
  });

  it("applies custom className", () => {
    render(<Container className="custom-class">Container Content</Container>);
    const container = screen.getByText("Container Content");
    expect(container.parentElement).toHaveClass("custom-class");
  });

  it("applies different max widths", () => {
    const { rerender } = render(
      <Container maxWidth="sm">Container Content</Container>
    );
    expect(screen.getByText("Container Content").parentElement).toHaveClass(
      "max-w-screen-sm"
    );

    rerender(<Container maxWidth="xl">Container Content</Container>);
    expect(screen.getByText("Container Content").parentElement).toHaveClass(
      "max-w-screen-xl"
    );

    rerender(<Container maxWidth="full">Container Content</Container>);
    expect(screen.getByText("Container Content").parentElement).toHaveClass(
      "max-w-full"
    );

    rerender(<Container maxWidth="none">Container Content</Container>);
    expect(screen.getByText("Container Content").parentElement).not.toHaveClass(
      "max-w-screen-sm"
    );
    expect(screen.getByText("Container Content").parentElement).not.toHaveClass(
      "max-w-screen-lg"
    );
    expect(screen.getByText("Container Content").parentElement).not.toHaveClass(
      "max-w-full"
    );
  });

  it("applies padding when padding prop is true", () => {
    const { rerender } = render(
      <Container padding={true}>Container Content</Container>
    );
    expect(screen.getByText("Container Content").parentElement).toHaveClass(
      "px-4"
    );

    rerender(<Container padding={false}>Container Content</Container>);
    expect(screen.getByText("Container Content").parentElement).not.toHaveClass(
      "px-4"
    );
  });
});
