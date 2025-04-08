import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeSearch } from './RecipeSearch';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: mockSearch })
  };
});

// Mock the useCategories hook
vi.mock('../../context/CategoryContext', () => ({
  useCategories: () => ({
    categories: [
      { id: 1, name: 'Breakfast' },
      { id: 2, name: 'Lunch' },
      { id: 3, name: 'Dinner' }
    ],
    fetchCategories: vi.fn()
  })
}));

// Mock the useTags hook
vi.mock('../../context/TagContext', () => ({
  useTags: () => ({
    tags: [
      { id: 1, name: 'quick' },
      { id: 2, name: 'easy' },
      { id: 3, name: 'vegetarian' }
    ],
    fetchTags: vi.fn()
  })
}));

// Mock navigate function
const mockNavigate = vi.fn();
let mockSearch = '';

describe('RecipeSearch', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSearch = '';
  });
  
  it('renders search form correctly', () => {
    render(
      <BrowserRouter>
        <RecipeSearch />
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Search Recipes')).toBeInTheDocument();
    
    // Check if search input is displayed
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    
    // Check if category dropdown is displayed
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    
    // Check if tag dropdown is displayed
    expect(screen.getByLabelText('Tag')).toBeInTheDocument();
    expect(screen.getByText('All Tags')).toBeInTheDocument();
    expect(screen.getByText('quick')).toBeInTheDocument();
    expect(screen.getByText('easy')).toBeInTheDocument();
    expect(screen.getByText('vegetarian')).toBeInTheDocument();
    
    // Check if difficulty dropdown is displayed
    expect(screen.getByLabelText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('All Difficulties')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    
    // Check if sort options are displayed
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Likes')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    
    // Check if buttons are displayed
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
  
  it('navigates to search results when form is submitted', async () => {
    render(
      <BrowserRouter>
        <RecipeSearch />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Fill out the form
    await user.type(screen.getByLabelText('Search'), 'pasta');
    
    // Select category
    const categorySelect = screen.getByLabelText('Category');
    await user.selectOptions(categorySelect, '2');
    
    // Select difficulty
    const difficultySelect = screen.getByLabelText('Difficulty');
    await user.selectOptions(difficultySelect, 'easy');
    
    // Submit the form
    await user.click(screen.getByText('Search'));
    
    // Check if navigate was called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith('/recipes?search=pasta&categoryId=2&difficulty=easy&sortBy=createdAt&sortOrder=desc');
  });
  
  it('resets form and navigates to recipes page when reset button is clicked', async () => {
    render(
      <BrowserRouter>
        <RecipeSearch />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Fill out the form
    await user.type(screen.getByLabelText('Search'), 'pasta');
    
    // Click reset button
    await user.click(screen.getByText('Reset'));
    
    // Check if navigate was called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith('/recipes');
  });
  
  it('initializes form with URL search params', () => {
    mockSearch = '?search=pizza&categoryId=3&tagId=2&difficulty=medium&sortBy=likeCount&sortOrder=asc';
    
    render(
      <BrowserRouter>
        <RecipeSearch />
      </BrowserRouter>
    );
    
    // Check if form fields are initialized with URL params
    expect(screen.getByLabelText('Search')).toHaveValue('pizza');
    expect(screen.getByLabelText('Category')).toHaveValue('3');
    expect(screen.getByLabelText('Tag')).toHaveValue('2');
    expect(screen.getByLabelText('Difficulty')).toHaveValue('medium');
    
    // Check sort options
    const sortBySelect = screen.getByLabelText('Sort By');
    expect(sortBySelect).toHaveValue('likeCount');
    
    const sortOrderSelect = screen.getAllByRole('combobox')[4]; // Fifth select is sort order
    expect(sortOrderSelect).toHaveValue('asc');
  });
});
