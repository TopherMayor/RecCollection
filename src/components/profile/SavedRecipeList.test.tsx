import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SavedRecipeList } from './SavedRecipeList';
import { BrowserRouter } from 'react-router-dom';

// Mock the useRecipes hook
vi.mock('../../context/RecipeContext', () => ({
  useRecipes: () => ({
    savedRecipes: [
      {
        id: 1,
        title: 'Saved Recipe 1',
        imageUrl: 'https://example.com/image1.jpg',
        user: {
          id: 2,
          username: 'otheruser',
          displayName: 'Other User'
        }
      },
      {
        id: 2,
        title: 'Saved Recipe 2',
        imageUrl: null,
        user: {
          id: 3,
          username: 'anotheruser',
          displayName: null
        }
      }
    ],
    loading: false,
    fetchSavedRecipes: vi.fn()
  })
}));

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'testuser',
      displayName: 'Test User'
    }
  })
}));

describe('SavedRecipeList', () => {
  it('renders saved recipes correctly', () => {
    render(
      <BrowserRouter>
        <SavedRecipeList />
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Saved Recipes')).toBeInTheDocument();
    
    // Check if recipes are displayed
    expect(screen.getByText('Saved Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Saved Recipe 2')).toBeInTheDocument();
    
    // Check if author names are displayed
    expect(screen.getByText('Other User')).toBeInTheDocument();
    expect(screen.getByText('anotheruser')).toBeInTheDocument();
  });
  
  it('shows loading state when loading', () => {
    vi.mocked(useRecipes).mockReturnValue({
      savedRecipes: [],
      loading: true,
      fetchSavedRecipes: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <SavedRecipeList />
      </BrowserRouter>
    );
    
    // Check if loading spinner is displayed
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('shows empty state when no saved recipes are available', () => {
    vi.mocked(useRecipes).mockReturnValue({
      savedRecipes: [],
      loading: false,
      fetchSavedRecipes: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <SavedRecipeList />
      </BrowserRouter>
    );
    
    // Check if empty state message is displayed
    expect(screen.getByText("You haven't saved any recipes yet.")).toBeInTheDocument();
    expect(screen.getByText('Browse Recipes')).toBeInTheDocument();
  });
  
  it('limits the number of recipes displayed when limit is provided', () => {
    const manySavedRecipes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Saved Recipe ${i + 1}`,
      imageUrl: null,
      user: {
        id: 2,
        username: 'otheruser',
        displayName: 'Other User'
      }
    }));
    
    vi.mocked(useRecipes).mockReturnValue({
      savedRecipes: manySavedRecipes,
      loading: false,
      fetchSavedRecipes: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <SavedRecipeList limit={3} />
      </BrowserRouter>
    );
    
    // Check if only the first 3 recipes are displayed
    expect(screen.getByText('Saved Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Saved Recipe 2')).toBeInTheDocument();
    expect(screen.getByText('Saved Recipe 3')).toBeInTheDocument();
    expect(screen.queryByText('Saved Recipe 4')).not.toBeInTheDocument();
    
    // Check if "View All Saved Recipes" link is displayed
    expect(screen.getByText('View All Saved Recipes')).toBeInTheDocument();
  });
  
  it('calls fetchSavedRecipes on mount', () => {
    const fetchSavedRecipes = vi.fn();
    
    vi.mocked(useRecipes).mockReturnValue({
      savedRecipes: [],
      loading: false,
      fetchSavedRecipes
    });
    
    render(
      <BrowserRouter>
        <SavedRecipeList limit={5} />
      </BrowserRouter>
    );
    
    // Check if fetchSavedRecipes was called with the correct limit
    expect(fetchSavedRecipes).toHaveBeenCalledWith({ limit: 5 });
  });
});
