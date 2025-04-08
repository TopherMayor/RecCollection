import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RecipeStats, UserStats, statsService } from '../api/stats';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';

// Context type
interface StatsContextType {
  recipeStats: RecipeStats | null;
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
  fetchRecipeStats: () => Promise<void>;
  fetchUserStats: (userId?: number) => Promise<void>;
}

// Create context
const StatsContext = createContext<StatsContextType | undefined>(undefined);

// Provider props
interface StatsProviderProps {
  children: ReactNode;
}

// Stats provider component
export function StatsProvider({ children }: StatsProviderProps) {
  const [recipeStats, setRecipeStats] = useState<RecipeStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useUI();
  const { user } = useAuth();
  
  // Fetch recipe stats
  const fetchRecipeStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await statsService.getRecipeStats();
      
      if (response.data) {
        setRecipeStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch recipe stats');
        showToast(response.error || 'Failed to fetch recipe stats', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user stats
  const fetchUserStats = async (userId?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await statsService.getUserStats(userId);
      
      if (response.data) {
        setUserStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch user stats');
        showToast(response.error || 'Failed to fetch user stats', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load recipe stats on mount
  useEffect(() => {
    fetchRecipeStats();
  }, []);
  
  // Load user stats when user is available
  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);
  
  // Context value
  const value = {
    recipeStats,
    userStats,
    loading,
    error,
    fetchRecipeStats,
    fetchUserStats,
  };
  
  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

// Custom hook to use stats context
export function useStats() {
  const context = useContext(StatsContext);
  
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  
  return context;
}
