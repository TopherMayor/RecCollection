# RecCollection UI Component Library

This document provides an overview of the UI component library used in the RecCollection application. The library consists of reusable, responsive components designed to ensure consistency across the application.

## Table of Contents

1. [Overview](#overview)
2. [Component Categories](#component-categories)
3. [Usage Guidelines](#usage-guidelines)
4. [Component Reference](#component-reference)
5. [Styling](#styling)
6. [Accessibility](#accessibility)
7. [Testing](#testing)

## Overview

The RecCollection UI component library is built with React and TypeScript, leveraging Tailwind CSS for styling. The library aims to:

- Ensure visual consistency across the application
- Improve development efficiency through reusable components
- Enhance accessibility and user experience
- Support responsive design for all device sizes
- Simplify maintenance and updates

## Component Categories

The component library is organized into the following categories:

### Layout Components

- `Container`: Responsive container with configurable max-width and padding
- `Grid`: Responsive grid layout with configurable columns and gaps
- `Card`: Container with consistent styling for content blocks
- `CardHeader`, `CardBody`, `CardFooter`: Structured card components

### Typography Components

- `Heading`: Configurable heading component (h1-h6) with consistent styling
- `Text`: Text component with configurable size, weight, and color

### Form Components

- `FormField`: Standardized form field with label and error handling
- `Input`: Enhanced input component with consistent styling
- `Textarea`: Enhanced textarea component
- `Select`: Enhanced select component
- `Checkbox`: Enhanced checkbox component
- `RadioGroup`: Radio button group component

### Media Components

- `Image`: Enhanced image component with responsive options
- `Avatar`: User avatar component with fallback

### Interactive Components

- `Button`: Configurable button component with variants
- `IconButton`: Button with icon only
- `Link`: Enhanced link component

## Usage Guidelines

### Import Pattern

Import components from their respective category:

```tsx
import { Card, CardBody, CardHeader } from "../components/ui";
import { Heading, Text } from "../components/ui";
```

### Basic Usage Example

```tsx
<Card shadow="md" padding="lg">
  <CardHeader>
    <Heading level="h2" size="xl" weight="bold">
      Card Title
    </Heading>
  </CardHeader>
  <CardBody>
    <Text>Card content goes here.</Text>
  </CardBody>
</Card>
```

## Component Reference

### Layout Components

#### Container

A responsive container component that centers content and applies consistent padding.

```tsx
<Container maxWidth="lg" padding={true} className="py-4">
  Content goes here
</Container>
```

**Props:**

- `maxWidth`: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none" (default: "lg")
- `padding`: boolean (default: true)
- `className`: Additional CSS classes
- `children`: React nodes

#### Grid

A responsive grid layout component.

```tsx
<Grid cols={{ xs: 1, sm: 2, md: 3 }} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

**Props:**

- `cols`: Object with breakpoint-specific column counts
- `gap`: "none" | "xs" | "sm" | "md" | "lg" | "xl" (default: "md")
- `className`: Additional CSS classes
- `children`: React nodes

#### Card

A container component with consistent styling for content blocks.

```tsx
<Card shadow="md" padding="lg" border={true} hoverEffect={true}>
  Card content
</Card>
```

**Props:**

- `shadow`: "none" | "sm" | "md" | "lg" | "xl" (default: "md")
- `padding`: "none" | "sm" | "md" | "lg" | "xl" (default: "md")
- `border`: boolean (default: true)
- `hoverEffect`: boolean (default: false)
- `className`: Additional CSS classes
- `children`: React nodes
- `onClick`: Click handler function

### Typography Components

#### Heading

A configurable heading component with consistent styling.

```tsx
<Heading level="h1" size="3xl" weight="bold" className="mb-4">
  Page Title
</Heading>
```

**Props:**

- `level`: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" (default: "h2")
- `size`: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" (default: "xl")
- `weight`: "normal" | "medium" | "semibold" | "bold" (default: "bold")
- `className`: Additional CSS classes
- `children`: React nodes

#### Text

A text component with configurable size, weight, and color.

```tsx
<Text size="sm" weight="medium" color="text-gray-600">
  This is a paragraph of text.
</Text>
```

**Props:**

- `size`: "xs" | "sm" | "base" | "lg" | "xl" (default: "base")
- `weight`: "normal" | "medium" | "semibold" | "bold" (default: "normal")
- `color`: CSS color class (default: "")
- `className`: Additional CSS classes
- `children`: React nodes

### Media Components

#### Image

An enhanced image component with responsive options.

```tsx
<Image
  src="/path/to/image.jpg"
  alt="Description"
  objectFit="cover"
  aspectRatio="16:9"
  rounded="md"
/>
```

**Props:**

- `src`: Image source URL
- `alt`: Alternative text
- `objectFit`: "cover" | "contain" | "fill" | "none" (default: "cover")
- `aspectRatio`: "1:1" | "4:3" | "16:9" | "21:9" (default: undefined)
- `rounded`: "none" | "sm" | "md" | "lg" | "full" (default: "md")
- `className`: Additional CSS classes

## Styling

The component library uses Tailwind CSS for styling. Components accept a `className` prop that allows for additional customization while maintaining the base styling.

### Customization

To customize a component:

```tsx
<Card className="bg-blue-50 border-blue-200">Custom styled card</Card>
```

## Accessibility

All components are designed with accessibility in mind:

- Proper semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Sufficient color contrast
- Screen reader compatibility

## Testing

The component library includes automated tests to ensure components render correctly and maintain their functionality. Tests are written using Vitest and React Testing Library.

### Test Files

Test files are located alongside the component files with a `.test.tsx` extension. For example, the test file for `Card.tsx` is `Card.test.tsx`.

### Running Tests

To run all tests:

```bash
bun run test
```

To run tests in watch mode (tests will automatically re-run when files change):

```bash
bun run test:watch
```

To run tests with coverage reporting:

```bash
bun run test:coverage
```

### Writing Tests

When writing tests for components, follow these guidelines:

1. Test that the component renders correctly with default props
2. Test that the component applies custom className correctly
3. Test that the component renders correctly with different prop values
4. Test any interactive behavior (e.g., click handlers)
5. Test accessibility features

### Example Test

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card Component", () => {
  it("renders with default props", () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText("Card Content");
    expect(card).toBeInTheDocument();
    expect(card.parentElement).toHaveClass("bg-white");
  });

  it("applies custom className", () => {
    render(<Card className="custom-class">Card Content</Card>);
    const card = screen.getByText("Card Content");
    expect(card.parentElement).toHaveClass("custom-class");
  });
});
```

### Automated Test Generation

A script is available to generate basic test files for components that don't have tests yet:

```bash
node src/test/generateTests.js
```
