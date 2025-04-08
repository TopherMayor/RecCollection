import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock the MainLayout component
vi.mock('../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout">{children}</div>
}));

// Mock the profile components
vi.mock('../../components/profile', () => ({
  UserStats: () => <div data-testid="user-stats">User Stats Component</div>,
  UserRecipeList: () => <div data-testid="user-recipe-list">User Recipe List Component</div>,
  SavedRecipeList: () => <div data-testid="saved-recipe-list">Saved Recipe List Component</div>
}));

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    updateProfile: mockUpdateProfile,
    loading: mockLoading
  })
}));

// Mock the useUI hook
vi.mock('../../context/UIContext', () => ({
  useUI: () => ({
    showToast: mockShowToast
  })
}));

// Mock variables
let mockUser = null;
const mockUpdateProfile = vi.fn();
let mockLoading = false;
const mockShowToast = vi.fn();

describe('ProfilePage', () => {
  beforeEach(() => {
    mockUser = null;
    mockUpdateProfile.mockReset();
    mockLoading = false;
    mockShowToast.mockReset();
  });
  
  it('shows login message when user is not authenticated', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    // Check if login message is displayed
    expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
  });
  
  it('renders profile page with user information', () => {
    mockUser = {
      id: 1,
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      bio: 'This is my bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    // Check if user information is displayed
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is my bio')).toBeInTheDocument();
    expect(screen.getByText('Member Since')).toBeInTheDocument();
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
    
    // Check if avatar is displayed
    const avatar = screen.getByAltText('Test User');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    
    // Check if edit button is displayed
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    
    // Check if profile components are rendered
    expect(screen.getByTestId('user-stats')).toBeInTheDocument();
    expect(screen.getByTestId('user-recipe-list')).toBeInTheDocument();
    expect(screen.getByTestId('saved-recipe-list')).toBeInTheDocument();
  });
  
  it('shows edit form when edit button is clicked', async () => {
    mockUser = {
      id: 1,
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      bio: 'This is my bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Click edit button
    await user.click(screen.getByText('Edit Profile'));
    
    // Check if edit form is displayed
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Avatar URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    
    // Check if form fields are initialized with user data
    expect(screen.getByLabelText('Display Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Avatar URL')).toHaveValue('https://example.com/avatar.jpg');
    expect(screen.getByLabelText('Bio')).toHaveValue('This is my bio');
    
    // Check if save and cancel buttons are displayed
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  it('updates profile when form is submitted', async () => {
    mockUser = {
      id: 1,
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      bio: 'This is my bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    mockUpdateProfile.mockResolvedValue(true);
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Click edit button
    await user.click(screen.getByText('Edit Profile'));
    
    // Update form fields
    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'Updated Name');
    
    await user.clear(screen.getByLabelText('Bio'));
    await user.type(screen.getByLabelText('Bio'), 'Updated bio');
    
    // Submit the form
    await user.click(screen.getByText('Save Changes'));
    
    // Check if updateProfile was called with the correct data
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      displayName: 'Updated Name',
      bio: 'Updated bio',
      avatarUrl: 'https://example.com/avatar.jpg'
    });
    
    // Check if success toast was shown
    expect(mockShowToast).toHaveBeenCalledWith('Profile updated successfully', 'success');
  });
  
  it('validates avatar URL', async () => {
    mockUser = {
      id: 1,
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      bio: 'This is my bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Click edit button
    await user.click(screen.getByText('Edit Profile'));
    
    // Enter invalid URL
    await user.clear(screen.getByLabelText('Avatar URL'));
    await user.type(screen.getByLabelText('Avatar URL'), 'invalid-url');
    
    // Submit the form
    await user.click(screen.getByText('Save Changes'));
    
    // Check if error message is displayed
    expect(screen.getByText('Avatar URL must be a valid URL')).toBeInTheDocument();
    
    // Check that updateProfile was not called
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
  
  it('cancels editing when cancel button is clicked', async () => {
    mockUser = {
      id: 1,
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      bio: 'This is my bio',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2023-01-01T00:00:00.000Z'
    };
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Click edit button
    await user.click(screen.getByText('Edit Profile'));
    
    // Update form fields
    await user.clear(screen.getByLabelText('Display Name'));
    await user.type(screen.getByLabelText('Display Name'), 'Updated Name');
    
    // Click cancel button
    await user.click(screen.getByText('Cancel'));
    
    // Check that we're back to view mode
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.queryByLabelText('Display Name')).not.toBeInTheDocument();
    
    // Check that updateProfile was not called
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
