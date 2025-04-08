import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeListPage } from './RecipeListPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the MainLayout component
vi.mock('../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>
}));

// Mock the recipe components
vi.mock('../../components/recipes', () => ({
  RecipeSearch: () => <div data-testid="recipe-search">Recipe Search Component</div>,
  RecipeList: () => <div data-testid="recipe-list">Recipe List Component</div>,
  CategoryList: () => <div data-testid="category-list">Category List Component</div>,
  TagCloud: () => <div data-testid="tag-cloud">Tag Cloud Component</div>
}));

describe('RecipeListPage', () => {
  it('renders recipe list page with correct layout', () => {
    render(
      <BrowserRouter>
        <RecipeListPage />
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    
    // Check if description is displayed
    expect(screen.getByText(/Discover delicious recipes shared by our community/)).toBeInTheDocument();
    
    // Check if components are rendered
    expect(screen.getByTestId('recipe-search')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
    expect(screen.getByTestId('category-list')).toBeInTheDocument();
    expect(screen.getByTestId('tag-cloud')).toBeInTheDocument();
  });
});
