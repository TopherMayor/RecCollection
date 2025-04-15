# UI Component Library

This directory contains the UI component library for the RecCollection application. The library provides reusable, responsive components designed to ensure consistency across the application.

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

## Usage

Import components from the UI library:

```tsx
import { Card, CardBody, Heading, Text } from '../ui';

function MyComponent() {
  return (
    <Card shadow="md" padding="lg">
      <CardBody>
        <Heading level="h2" size="xl" weight="bold">
          Card Title
        </Heading>
        <Text className="text-gray-600">
          Card content goes here.
        </Text>
      </CardBody>
    </Card>
  );
}
```

## Documentation

For detailed documentation on each component, including props and examples, see the [UI Component Library Documentation](/docs/UI_COMPONENT_LIBRARY.md).

## Development Guidelines

When adding or modifying components:

1. Follow the established naming conventions and file structure
2. Ensure components are fully typed with TypeScript
3. Make components responsive by default
4. Include appropriate ARIA attributes for accessibility
5. Keep components focused on a single responsibility
6. Use Tailwind CSS for styling
7. Export components through the index.ts file
