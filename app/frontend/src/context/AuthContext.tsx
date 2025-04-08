import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginData, RegisterData, UpdateProfileData } from '../api/auth';

// Context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      // Check if token exists
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Get current user
        const response = await authService.getCurrentUser();
        
        if (response.data) {
          setUser(response.data);
        } else {
          // Clear token if invalid
          localStorage.removeItem('token');
          setError(response.error || 'Failed to load user');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (data: LoginData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      
      if (response.data) {
        // Save token and user
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(data);
      
      if (response.data) {
        // Save token and user
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.error || 'Registration failed');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile function
  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.updateProfile(data);
      
      if (response.data) {
        setUser(response.data);
        return true;
      } else {
        setError(response.error || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
