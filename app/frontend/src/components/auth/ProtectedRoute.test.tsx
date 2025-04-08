import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { ProtectedRoute } from './ProtectedRoute';
import { mockUser } from '../../test/mocks/api';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the auth context
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Import useAuth after mocking
import { useAuth } from '../../context/AuthContext';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });
  
  it('should render children when user is authenticated', () => {
    // Mock authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if protected content is rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Check if login page is not rendered
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
  
  it('should redirect to login when user is not authenticated', () => {
    // Mock unauthenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if protected content is not rendered
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Check if login page is rendered
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
  
  it('should redirect to custom path when user is not authenticated', () => {
    // Mock unauthenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute redirectTo="/custom-login">
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/custom-login" element={<div>Custom Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if protected content is not rendered
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Check if custom login page is rendered
    expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
    
    // Check if default login page is not rendered
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
  
  it('should show loading state when authentication is being checked', () => {
    // Mock loading state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if loading state is rendered
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Check if protected content is not rendered
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Check if login page is not rendered
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
