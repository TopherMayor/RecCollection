import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, CategoryWithCount, categoryService } from '../api/categories';
import { useUI } from './UIContext';

// Context type
interface CategoryContextType {
  categories: Category[];
  popularCategories: CategoryWithCount[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchPopularCategories: (limit?: number) => Promise<void>;
}

// Create context
const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Provider props
interface CategoryProviderProps {
  children: ReactNode;
}

// Category provider component
export function CategoryProvider({ children }: CategoryProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularCategories, setPopularCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useUI();
  
  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoryService.getCategories();
      
      if (response.data) {
        setCategories(response.data.categories);
      } else {
        setError(response.error || 'Failed to fetch categories');
        showToast(response.error || 'Failed to fetch categories', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch popular categories
  const fetchPopularCategories = async (limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoryService.getPopularCategories(limit);
      
      if (response.data) {
        setPopularCategories(response.data.categories);
      } else {
        setError(response.error || 'Failed to fetch popular categories');
        showToast(response.error || 'Failed to fetch popular categories', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load categories on mount
  useEffect(() => {
    fetchCategories();
    fetchPopularCategories();
  }, []);
  
  // Context value
  const value = {
    categories,
    popularCategories,
    loading,
    error,
    fetchCategories,
    fetchPopularCategories,
  };
  
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

// Custom hook to use category context
export function useCategories() {
  const context = useContext(CategoryContext);
  
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  
  return context;
}
