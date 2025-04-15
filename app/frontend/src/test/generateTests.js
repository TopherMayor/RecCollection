#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_COMPONENTS_DIR = path.join(__dirname, "../components/ui");
const TEST_TEMPLATE_DIR = path.join(__dirname, "templates");

// Create templates directory if it doesn't exist
if (!fs.existsSync(TEST_TEMPLATE_DIR)) {
  fs.mkdirSync(TEST_TEMPLATE_DIR, { recursive: true });
}

// Get all component files
const componentFiles = fs
  .readdirSync(UI_COMPONENTS_DIR)
  .filter(
    (file) =>
      file.endsWith(".tsx") &&
      !file.endsWith(".test.tsx") &&
      file !== "index.tsx"
  );

console.log(
  `Found ${componentFiles.length} component files to generate tests for.`
);

// Generate test files
componentFiles.forEach((componentFile) => {
  const componentName = path.basename(componentFile, ".tsx");
  const testFilePath = path.join(
    UI_COMPONENTS_DIR,
    `${componentName}.test.tsx`
  );

  // Skip if test file already exists
  if (fs.existsSync(testFilePath)) {
    console.log(`Test file already exists for ${componentName}, skipping.`);
    return;
  }

  // Generate test file content
  const testContent = generateTestContent(componentName);

  // Write test file
  fs.writeFileSync(testFilePath, testContent);
  console.log(`Generated test file for ${componentName}`);
});

function generateTestContent(componentName) {
  return `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName} Component', () => {
  it('renders with default props', () => {
    render(<${componentName}>${componentName} Content</${componentName}>);
    const element = screen.getByText('${componentName} Content');
    expect(element).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<${componentName} className="custom-class">${componentName} Content</${componentName}>);
    const element = screen.getByText('${componentName} Content');
    expect(element.parentElement).toHaveClass('custom-class');
  });
});
`;
}

console.log("Test generation complete!");
