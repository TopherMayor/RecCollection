# RecCollection Frontend

This is the frontend for the RecCollection application, a recipe collection and management system.

## UI Component Library

The application uses a custom UI component library for consistent styling and improved maintainability. The library includes components for layout, typography, forms, and media.

For detailed documentation, see [UI Component Library Documentation](/docs/UI_COMPONENT_LIBRARY.md).

### Basic Usage

```tsx
import { Card, CardBody, Heading, Text } from "../components/ui";

function MyComponent() {
  return (
    <Card shadow="md" padding="lg">
      <CardBody>
        <Heading level="h2" size="xl" weight="bold">
          Card Title
        </Heading>
        <Text className="text-gray-600">Card content goes here.</Text>
      </CardBody>
    </Card>
  );
}
```

## Development

### Setup

1. Install dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun run dev
```

### Environment Variables

For development, you can set up auto-login to avoid having to manually log in each time you restart the application:

1. Copy `.env.example` to `.env.development`:

```bash
cp .env.example .env.development
```

2. Edit `.env.development` and set your development credentials:

```
VITE_DEV_AUTO_LOGIN=true
VITE_DEV_LOGIN_EMAIL=your-email@example.com
VITE_DEV_LOGIN_PASSWORD=your-password
```

With these settings, the application will automatically log in using the provided credentials when running in development mode.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
