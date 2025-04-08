import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImportPage } from './ImportPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the MainLayout component
vi.mock('../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>
}));

// Mock the RecipeImport component
vi.mock('../../components/import', () => ({
  RecipeImport: () => <div data-testid="recipe-import">Recipe Import Component</div>
}));

describe('ImportPage', () => {
  it('renders import page with correct content', () => {
    render(
      <BrowserRouter>
        <ImportPage />
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Import Recipe')).toBeInTheDocument();
    
    // Check if description is displayed
    expect(screen.getByText(/Import recipes from your favorite social media platforms/)).toBeInTheDocument();
    
    // Check if RecipeImport component is rendered
    expect(screen.getByTestId('recipe-import')).toBeInTheDocument();
    
    // Check if "How It Works" section is displayed
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    
    // Check if steps are displayed
    expect(screen.getByText('1. Copy the URL')).toBeInTheDocument();
    expect(screen.getByText('2. Paste and Import')).toBeInTheDocument();
    expect(screen.getByText('3. Review and Edit')).toBeInTheDocument();
    
    // Check if step descriptions are displayed
    expect(screen.getByText(/Find a recipe post on Instagram or TikTok/)).toBeInTheDocument();
    expect(screen.getByText(/Paste the URL above/)).toBeInTheDocument();
    expect(screen.getByText(/Review the imported recipe/)).toBeInTheDocument();
  });
});
