import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserStats } from './UserStats';
import { BrowserRouter } from 'react-router-dom';

// Mock the useStats hook
vi.mock('../../context/StatsContext', () => ({
  useStats: () => ({
    userStats: {
      totalRecipes: 42,
      totalLikes: 123,
      totalSaved: 15,
      totalComments: 67,
      mostLikedRecipe: {
        id: 1,
        title: 'Popular Recipe',
        likeCount: 50
      }
    },
    loading: false,
    error: null,
    fetchUserStats: vi.fn()
  })
}));

describe('UserStats', () => {
  it('renders user statistics correctly', () => {
    render(
      <BrowserRouter>
        <UserStats />
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Your Stats')).toBeInTheDocument();
    
    // Check if stats are displayed
    expect(screen.getByText('42')).toBeInTheDocument(); // totalRecipes
    expect(screen.getByText('123')).toBeInTheDocument(); // totalLikes
    expect(screen.getByText('15')).toBeInTheDocument(); // totalSaved
    expect(screen.getByText('67')).toBeInTheDocument(); // totalComments
    
    // Check if labels are displayed
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Likes Received')).toBeInTheDocument();
    expect(screen.getByText('Saved Recipes')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    
    // Check if most popular recipe is displayed
    expect(screen.getByText('Most Popular Recipe')).toBeInTheDocument();
    expect(screen.getByText('Popular Recipe')).toBeInTheDocument();
    expect(screen.getByText('50 likes')).toBeInTheDocument();
  });
  
  it('calls fetchUserStats with userId when provided', () => {
    const fetchUserStats = vi.fn();
    
    vi.mocked(useStats).mockReturnValue({
      userStats: {
        totalRecipes: 42,
        totalLikes: 123,
        totalSaved: 15,
        totalComments: 67,
        mostLikedRecipe: {
          id: 1,
          title: 'Popular Recipe',
          likeCount: 50
        }
      },
      loading: false,
      error: null,
      fetchUserStats
    });
    
    render(
      <BrowserRouter>
        <UserStats userId={123} />
      </BrowserRouter>
    );
    
    // Check if fetchUserStats was called with the userId
    expect(fetchUserStats).toHaveBeenCalledWith(123);
  });
  
  it('shows loading state when loading', () => {
    vi.mocked(useStats).mockReturnValue({
      userStats: null,
      loading: true,
      error: null,
      fetchUserStats: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <UserStats />
      </BrowserRouter>
    );
    
    // Check if loading spinner is displayed
    expect(screen.getByText('Your Stats')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('shows empty state when no stats are available', () => {
    vi.mocked(useStats).mockReturnValue({
      userStats: null,
      loading: false,
      error: null,
      fetchUserStats: vi.fn()
    });
    
    render(
      <BrowserRouter>
        <UserStats />
      </BrowserRouter>
    );
    
    // Check if empty state message is displayed
    expect(screen.getByText('Your Stats')).toBeInTheDocument();
    expect(screen.getByText('No stats available')).toBeInTheDocument();
  });
});
