import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeList } from './RecipeList';
import { BrowserRouter, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock the useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/recipes', search: mockSearch })
  };
});

// Mock the useRecipes hook
vi.mock('../../context/RecipeContext', () => ({
  useRecipes: () => ({
    recipes: mockRecipes,
    loading: mockLoading,
    pagination: mockPagination,
    fetchRecipes: mockFetchRecipes,
    likeRecipe: mockLikeRecipe,
    unlikeRecipe: mockUnlikeRecipe,
    saveRecipe: mockSaveRecipe,
    unsaveRecipe: mockUnsaveRecipe
  })
}));

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

// Mock the useUI hook
vi.mock('../../context/UIContext', () => ({
  useUI: () => ({
    showToast: mockShowToast
  })
}));

// Mock variables
let mockSearch = '';
let mockRecipes = [];
let mockLoading = false;
let mockPagination = { total: 0, page: 1, limit: 10, pages: 0 };
const mockFetchRecipes = vi.fn();
const mockLikeRecipe = vi.fn();
const mockUnlikeRecipe = vi.fn();
const mockSaveRecipe = vi.fn();
const mockUnsaveRecipe = vi.fn();
let mockUser = null;
const mockShowToast = vi.fn();

describe('RecipeList', () => {
  beforeEach(() => {
    mockSearch = '';
    mockRecipes = [];
    mockLoading = false;
    mockPagination = { total: 0, page: 1, limit: 10, pages: 0 };
    mockFetchRecipes.mockReset();
    mockLikeRecipe.mockReset();
    mockUnlikeRecipe.mockReset();
    mockSaveRecipe.mockReset();
    mockUnsaveRecipe.mockReset();
    mockUser = null;
    mockShowToast.mockReset();
  });
  
  it('shows loading state when loading', () => {
    mockLoading = true;
    
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    // Check if loading spinner is displayed
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('shows empty state when no recipes are available', () => {
    mockRecipes = [];
    mockLoading = false;
    
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    // Check if empty state message is displayed
    expect(screen.getByText('No recipes found')).toBeInTheDocument();
  });
  
  it('renders recipes correctly', () => {
    mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe 1',
        description: 'Test description 1',
        imageUrl: 'https://example.com/image1.jpg',
        createdAt: '2023-01-01T00:00:00.000Z',
        likeCount: 10,
        commentCount: 5,
        isPrivate: false,
        isLiked: true,
        isSaved: false,
        prepTime: 15,
        cookingTime: 30,
        difficultyLevel: 'medium',
        user: {
          id: 2,
          username: 'otheruser',
          displayName: 'Other User'
        },
        categories: [
          { id: 1, name: 'Dinner' }
        ],
        tags: [
          { id: 1, name: 'easy' }
        ]
      },
      {
        id: 2,
        title: 'Test Recipe 2',
        description: 'Test description 2',
        imageUrl: null,
        createdAt: '2023-01-02T00:00:00.000Z',
        likeCount: 5,
        commentCount: 2,
        isPrivate: true,
        isLiked: false,
        isSaved: true,
        prepTime: null,
        cookingTime: null,
        difficultyLevel: 'easy',
        user: {
          id: 3,
          username: 'anotheruser',
          displayName: null
        },
        categories: [],
        tags: []
      }
    ];
    
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    // Check if recipes are displayed
    expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
    
    // Check if descriptions are displayed
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 2')).toBeInTheDocument();
    
    // Check if author names are displayed
    expect(screen.getByText('Other User')).toBeInTheDocument();
    expect(screen.getByText('anotheruser')).toBeInTheDocument();
    
    // Check if dates are displayed
    expect(screen.getAllByText('1/1/2023')).toHaveLength(1);
    expect(screen.getAllByText('1/2/2023')).toHaveLength(1);
    
    // Check if private label is displayed
    expect(screen.getByText('Private')).toBeInTheDocument();
    
    // Check if categories and tags are displayed
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('#easy')).toBeInTheDocument();
    
    // Check if prep and cooking times are displayed
    expect(screen.getByText('Prep: 15 min')).toBeInTheDocument();
    expect(screen.getByText('Cook: 30 min')).toBeInTheDocument();
    
    // Check if difficulty is displayed
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    
    // Check if like and comment counts are displayed
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
  
  it('calls fetchRecipes with correct params on mount', () => {
    mockSearch = '?page=2&search=pasta&categoryId=3&tagId=2&difficulty=medium&sortBy=likeCount&sortOrder=asc';
    
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    // Check if fetchRecipes was called with the correct params
    expect(mockFetchRecipes).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      search: 'pasta',
      categoryId: 3,
      tagId: 2,
      difficulty: 'medium',
      sortBy: 'likeCount',
      sortOrder: 'asc'
    });
  });
  
  it('shows pagination when there are multiple pages', () => {
    mockRecipes = [{ id: 1, title: 'Test Recipe', user: { username: 'user' }, createdAt: '2023-01-01', categories: [], tags: [] }];
    mockPagination = { total: 25, page: 2, limit: 10, pages: 3 };
    
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    // Check if pagination is displayed
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
  
  it('requires login for like and save actions', async () => {
    mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        user: { username: 'user' },
        createdAt: '2023-01-01',
        categories: [],
        tags: [],
        isLiked: false,
        isSaved: false,
        likeCount: 0,
        commentCount: 0
      }
    ];
    mockUser = null;
    
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Find and click the like button
    const likeButton = screen.getAllByRole('button')[0];
    await user.click(likeButton);
    
    // Check if showToast was called with login message
    expect(mockShowToast).toHaveBeenCalledWith('Please log in to like recipes', 'error');
    
    // Find and click the save button
    const saveButton = screen.getAllByRole('button')[1];
    await user.click(saveButton);
    
    // Check if showToast was called with login message
    expect(mockShowToast).toHaveBeenCalledWith('Please log in to save recipes', 'error');
  });
  
  it('calls likeRecipe and unlikeRecipe when like button is clicked', async () => {
    mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        user: { username: 'user' },
        createdAt: '2023-01-01',
        categories: [],
        tags: [],
        isLiked: false,
        isSaved: false,
        likeCount: 0,
        commentCount: 0
      }
    ];
    mockUser = { id: 1, username: 'testuser' };
    
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Find and click the like button
    const likeButton = screen.getAllByRole('button')[0];
    await user.click(likeButton);
    
    // Check if likeRecipe was called with the correct ID
    expect(mockLikeRecipe).toHaveBeenCalledWith(1);
    
    // Update mock to simulate liked state
    mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        user: { username: 'user' },
        createdAt: '2023-01-01',
        categories: [],
        tags: [],
        isLiked: true,
        isSaved: false,
        likeCount: 1,
        commentCount: 0
      }
    ];
    
    // Re-render with updated state
    render(
      <BrowserRouter>
        <RecipeList />
      </BrowserRouter>
    );
    
    // Find and click the like button again
    const unlikeButton = screen.getAllByRole('button')[0];
    await user.click(unlikeButton);
    
    // Check if unlikeRecipe was called with the correct ID
    expect(mockUnlikeRecipe).toHaveBeenCalledWith(1);
  });
});
