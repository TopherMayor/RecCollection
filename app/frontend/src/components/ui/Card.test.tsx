import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardBody, CardFooter } from "./layout/Card";

describe("Card Component", () => {
  it("renders with default props", () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText("Card Content");
    expect(card).toBeInTheDocument();
    expect(card.parentElement).toHaveClass("bg-white");
    expect(card.parentElement).toHaveClass("rounded-lg");
    expect(card.parentElement).toHaveClass("shadow-md");
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Card Content</Card>);
    const card = screen.getByText("Card Content");
    expect(card.parentElement).toHaveClass("custom-class");
  });

  it("applies different shadow levels", () => {
    const { rerender } = render(<Card shadow="sm">Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).toHaveClass(
      "shadow-sm"
    );

    rerender(<Card shadow="lg">Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).toHaveClass(
      "shadow-lg"
    );

    rerender(<Card shadow="none">Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "shadow-sm"
    );
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "shadow-md"
    );
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "shadow-lg"
    );
  });

  it("applies different padding levels", () => {
    const { rerender } = render(<Card padding="sm">Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).toHaveClass("p-2");

    rerender(<Card padding="lg">Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).toHaveClass("p-6");

    rerender(<Card padding="none">Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "p-2"
    );
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "p-4"
    );
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "p-6"
    );
  });

  it("applies border when border prop is true", () => {
    const { rerender } = render(<Card border={true}>Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).toHaveClass(
      "border"
    );

    rerender(<Card border={false}>Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "border"
    );
  });

  it("applies hover effect when hoverEffect prop is true", () => {
    const { rerender } = render(<Card hoverEffect={true}>Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).toHaveClass(
      "hover:shadow-lg"
    );

    rerender(<Card hoverEffect={false}>Card Content</Card>);
    expect(screen.getByText("Card Content").parentElement).not.toHaveClass(
      "hover:shadow-lg"
    );
  });
});

describe("CardHeader Component", () => {
  it("renders with default props", () => {
    render(<CardHeader>Header Content</CardHeader>);
    const header = screen.getByText("Header Content");
    expect(header).toBeInTheDocument();
    expect(header.parentElement).toHaveClass("px-4");
    expect(header.parentElement).toHaveClass("py-3");
    expect(header.parentElement).toHaveClass("border-b");
  });

  it("applies custom className", () => {
    render(<CardHeader className="custom-class">Header Content</CardHeader>);
    const header = screen.getByText("Header Content");
    expect(header.parentElement).toHaveClass("custom-class");
  });
});

describe("CardBody Component", () => {
  it("renders with default props", () => {
    render(<CardBody>Body Content</CardBody>);
    const body = screen.getByText("Body Content");
    expect(body).toBeInTheDocument();
    expect(body.parentElement).toHaveClass("p-4");
  });

  it("applies custom className", () => {
    render(<CardBody className="custom-class">Body Content</CardBody>);
    const body = screen.getByText("Body Content");
    expect(body.parentElement).toHaveClass("custom-class");
  });
});

describe("CardFooter Component", () => {
  it("renders with default props", () => {
    render(<CardFooter>Footer Content</CardFooter>);
    const footer = screen.getByText("Footer Content");
    expect(footer).toBeInTheDocument();
    expect(footer.parentElement).toHaveClass("px-4");
    expect(footer.parentElement).toHaveClass("py-3");
    expect(footer.parentElement).toHaveClass("border-t");
  });

  it("applies custom className", () => {
    render(<CardFooter className="custom-class">Footer Content</CardFooter>);
    const footer = screen.getByText("Footer Content");
    expect(footer.parentElement).toHaveClass("custom-class");
  });
});
