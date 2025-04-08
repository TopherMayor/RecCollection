import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserRecipeList } from './UserRecipeList';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock the useRecipes hook
vi.mock('../../context/RecipeContext', () => ({
  useRecipes: () => ({
    recipes: [
      {
        id: 1,
        title: 'Test Recipe 1',
        description: 'Test description 1',
        imageUrl: 'https://example.com/image1.jpg',
        createdAt: '2023-01-01T00:00:00.000Z',
        likeCount: 10,
        isPrivate: false,
        user: {
          id: 1,
          username: 'testuser',
          displayName: 'Test User'
        }
      },
      {
        id: 2,
        title: 'Test Recipe 2',
        description: 'Test description 2',
        imageUrl: null,
        createdAt: '2023-01-02T00:00:00.000Z',
        likeCount: 5,
        isPrivate: true,
        user: {
          id: 1,
          username: 'testuser',
          displayName: 'Test User'
        }
      }
    ],
    loading: false,
    fetchRecipes: vi.fn(),
    deleteRecipe: vi.fn().mockResolvedValue(true)
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

// Mock the useUI hook
vi.mock('../../context/UIContext', () => ({
  useUI: () => ({
    showToast: vi.fn(),
    showConfirm: vi.fn((options) => {
      // Simulate clicking confirm
      if (options.onConfirm) {
        options.onConfirm();
      }
    })
  })
}));

describe('UserRecipeList', () => {
  it('renders user recipes correctly', () => {
    render(
      <BrowserRouter>
        <UserRecipeList />
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Your Recipes')).toBeInTheDocument();
    
    // Check if recipes are displayed
    expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
    
    // Check if private label is displayed
    expect(screen.getByText('Private')).toBeInTheDocument();
    
    // Check if dates are displayed
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
    expect(screen.getByText('1/2/2023')).toBeInTheDocument();
    
    // Check if like counts are displayed
    expect(screen.getByText('10 likes')).toBeInTheDocument();
    expect(screen.getByText('5 likes')).toBeInTheDocument();
    
    // Check if create recipe button is displayed
    expect(screen.getByText('Create Recipe')).toBeInTheDocument();
  });
  
  it('shows loading state when loading', () => {
    vi.mocked(useRecipes).mockReturnValue({
      recipes: [],
      loading: true,
      fetchRecipes: vi.fn(),
      deleteRecipe: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <UserRecipeList />
      </BrowserRouter>
    );
    
    // Check if loading spinner is displayed
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('shows empty state when no recipes are available', () => {
    vi.mocked(useRecipes).mockReturnValue({
      recipes: [],
      loading: false,
      fetchRecipes: vi.fn(),
      deleteRecipe: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <UserRecipeList />
      </BrowserRouter>
    );
    
    // Check if empty state message is displayed
    expect(screen.getByText("You haven't created any recipes yet.")).toBeInTheDocument();
    expect(screen.getByText('Create Your First Recipe')).toBeInTheDocument();
  });
  
  it('limits the number of recipes displayed when limit is provided', () => {
    const manyRecipes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Test Recipe ${i + 1}`,
      description: `Test description ${i + 1}`,
      imageUrl: null,
      createdAt: '2023-01-01T00:00:00.000Z',
      likeCount: i + 1,
      isPrivate: false,
      user: {
        id: 1,
        username: 'testuser',
        displayName: 'Test User'
      }
    }));
    
    vi.mocked(useRecipes).mockReturnValue({
      recipes: manyRecipes,
      loading: false,
      fetchRecipes: vi.fn(),
      deleteRecipe: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <UserRecipeList limit={3} />
      </BrowserRouter>
    );
    
    // Check if only the first 3 recipes are displayed
    expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 3')).toBeInTheDocument();
    expect(screen.queryByText('Test Recipe 4')).not.toBeInTheDocument();
    
    // Check if "View All Recipes" link is displayed
    expect(screen.getByText('View All Recipes')).toBeInTheDocument();
  });
  
  it('calls deleteRecipe when delete button is clicked', async () => {
    const deleteRecipe = vi.fn().mockResolvedValue(true);
    
    vi.mocked(useRecipes).mockReturnValue({
      recipes: [
        {
          id: 1,
          title: 'Test Recipe 1',
          description: 'Test description 1',
          imageUrl: 'https://example.com/image1.jpg',
          createdAt: '2023-01-01T00:00:00.000Z',
          likeCount: 10,
          isPrivate: false,
          user: {
            id: 1,
            username: 'testuser',
            displayName: 'Test User'
          }
        }
      ],
      loading: false,
      fetchRecipes: vi.fn(),
      deleteRecipe
    });
    
    render(
      <BrowserRouter>
        <UserRecipeList />
      </BrowserRouter>
    );
    
    // Find and click the delete button
    const deleteButton = screen.getAllByRole('button')[1]; // Second button is delete
    await userEvent.click(deleteButton);
    
    // Check if deleteRecipe was called with the correct ID
    expect(deleteRecipe).toHaveBeenCalledWith(1);
  });
});
