import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tag, TagWithCount, tagService } from '../api/tags';
import { useUI } from './UIContext';

// Context type
interface TagContextType {
  tags: Tag[];
  popularTags: TagWithCount[];
  loading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  fetchPopularTags: (limit?: number) => Promise<void>;
}

// Create context
const TagContext = createContext<TagContextType | undefined>(undefined);

// Provider props
interface TagProviderProps {
  children: ReactNode;
}

// Tag provider component
export function TagProvider({ children }: TagProviderProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [popularTags, setPopularTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useUI();
  
  // Fetch all tags
  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tagService.getTags();
      
      if (response.data) {
        setTags(response.data.tags);
      } else {
        setError(response.error || 'Failed to fetch tags');
        showToast(response.error || 'Failed to fetch tags', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch popular tags
  const fetchPopularTags = async (limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tagService.getPopularTags(limit);
      
      if (response.data) {
        setPopularTags(response.data.tags);
      } else {
        setError(response.error || 'Failed to fetch popular tags');
        showToast(response.error || 'Failed to fetch popular tags', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Load tags on mount
  useEffect(() => {
    fetchTags();
    fetchPopularTags();
  }, []);
  
  // Context value
  const value = {
    tags,
    popularTags,
    loading,
    error,
    fetchTags,
    fetchPopularTags,
  };
  
  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
}

// Custom hook to use tag context
export function useTags() {
  const context = useContext(TagContext);
  
  if (context === undefined) {
    throw new Error('useTags must be used within a TagProvider');
  }
  
  return context;
}
