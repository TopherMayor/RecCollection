import { createContext, useContext, useState, ReactNode } from 'react';
import { Recipe, SearchParams, recipeService } from '../api/recipes';
import { useUI } from './UIContext';

// Context type
interface RecipeContextType {
  recipes: Recipe[];
  savedRecipes: Recipe[];
  currentRecipe: Recipe | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  searchParams: SearchParams;
  fetchRecipes: (params?: SearchParams) => Promise<void>;
  fetchSavedRecipes: (params?: SearchParams) => Promise<void>;
  fetchRecipe: (id: number) => Promise<Recipe | null>;
  createRecipe: (data: any) => Promise<Recipe | null>;
  updateRecipe: (id: number, data: any) => Promise<Recipe | null>;
  deleteRecipe: (id: number) => Promise<boolean>;
  likeRecipe: (id: number) => Promise<boolean>;
  unlikeRecipe: (id: number) => Promise<boolean>;
  saveRecipe: (id: number) => Promise<boolean>;
  unsaveRecipe: (id: number) => Promise<boolean>;
  setSearchParams: (params: SearchParams) => void;
}

// Create context
const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

// Provider props
interface RecipeProviderProps {
  children: ReactNode;
}

// Recipe provider component
export function RecipeProvider({ children }: RecipeProviderProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 10,
  });
  
  const { showToast } = useUI();

  // Fetch recipes
  const fetchRecipes = async (params?: SearchParams) => {
    setLoading(true);
    setError(null);
    
    const queryParams = params || searchParams;
    
    try {
      const response = await recipeService.getRecipes(queryParams);
      
      if (response.data) {
        setRecipes(response.data.recipes);
        setPagination(response.data.pagination);
        
        if (params) {
          setSearchParams(params);
        }
      } else {
        setError(response.error || 'Failed to fetch recipes');
        showToast(response.error || 'Failed to fetch recipes', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved recipes
  const fetchSavedRecipes = async (params?: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recipeService.getSavedRecipes(params);
      
      if (response.data) {
        setSavedRecipes(response.data.recipes);
      } else {
        setError(response.error || 'Failed to fetch saved recipes');
        showToast(response.error || 'Failed to fetch saved recipes', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single recipe
  const fetchRecipe = async (id: number): Promise<Recipe | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recipeService.getRecipe(id);
      
      if (response.data) {
        setCurrentRecipe(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch recipe');
        showToast(response.error || 'Failed to fetch recipe', 'error');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a recipe
  const createRecipe = async (data: any): Promise<Recipe | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recipeService.createRecipe(data);
      
      if (response.data?.recipe) {
        showToast('Recipe created successfully', 'success');
        return response.data.recipe;
      } else {
        setError(response.error || 'Failed to create recipe');
        showToast(response.error || 'Failed to create recipe', 'error');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a recipe
  const updateRecipe = async (id: number, data: any): Promise<Recipe | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recipeService.updateRecipe(id, data);
      
      if (response.data?.recipe) {
        // Update current recipe if it's the one being edited
        if (currentRecipe && currentRecipe.id === id) {
          setCurrentRecipe(response.data.recipe);
        }
        
        // Update recipe in list if it exists
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id ? response.data!.recipe : recipe
          )
        );
        
        // Update saved recipe in list if it exists
        setSavedRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id ? response.data!.recipe : recipe
          )
        );
        
        showToast('Recipe updated successfully', 'success');
        return response.data.recipe;
      } else {
        setError(response.error || 'Failed to update recipe');
        showToast(response.error || 'Failed to update recipe', 'error');
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await recipeService.deleteRecipe(id);
      
      if (response.data?.success) {
        // Remove recipe from list
        setRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe.id !== id)
        );
        
        // Remove recipe from saved list
        setSavedRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe.id !== id)
        );
        
        // Clear current recipe if it's the one being deleted
        if (currentRecipe && currentRecipe.id === id) {
          setCurrentRecipe(null);
        }
        
        showToast('Recipe deleted successfully', 'success');
        return true;
      } else {
        setError(response.error || 'Failed to delete recipe');
        showToast(response.error || 'Failed to delete recipe', 'error');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Like a recipe
  const likeRecipe = async (id: number): Promise<boolean> => {
    try {
      const response = await recipeService.likeRecipe(id);
      
      if (response.data?.success) {
        // Update current recipe if it's the one being liked
        if (currentRecipe && currentRecipe.id === id) {
          setCurrentRecipe({
            ...currentRecipe,
            isLiked: true,
            likeCount: currentRecipe.likeCount + 1,
          });
        }
        
        // Update recipe in list if it exists
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  isLiked: true,
                  likeCount: recipe.likeCount + 1,
                }
              : recipe
          )
        );
        
        // Update saved recipe in list if it exists
        setSavedRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  isLiked: true,
                  likeCount: recipe.likeCount + 1,
                }
              : recipe
          )
        );
        
        return true;
      } else {
        showToast(response.error || 'Failed to like recipe', 'error');
        return false;
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
      return false;
    }
  };

  // Unlike a recipe
  const unlikeRecipe = async (id: number): Promise<boolean> => {
    try {
      const response = await recipeService.unlikeRecipe(id);
      
      if (response.data?.success) {
        // Update current recipe if it's the one being unliked
        if (currentRecipe && currentRecipe.id === id) {
          setCurrentRecipe({
            ...currentRecipe,
            isLiked: false,
            likeCount: Math.max(0, currentRecipe.likeCount - 1),
          });
        }
        
        // Update recipe in list if it exists
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  isLiked: false,
                  likeCount: Math.max(0, recipe.likeCount - 1),
                }
              : recipe
          )
        );
        
        // Update saved recipe in list if it exists
        setSavedRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  isLiked: false,
                  likeCount: Math.max(0, recipe.likeCount - 1),
                }
              : recipe
          )
        );
        
        return true;
      } else {
        showToast(response.error || 'Failed to unlike recipe', 'error');
        return false;
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
      return false;
    }
  };

  // Save a recipe
  const saveRecipe = async (id: number): Promise<boolean> => {
    try {
      const response = await recipeService.saveRecipe(id);
      
      if (response.data?.success) {
        // Update current recipe if it's the one being saved
        if (currentRecipe && currentRecipe.id === id) {
          setCurrentRecipe({
            ...currentRecipe,
            isSaved: true,
          });
        }
        
        // Update recipe in list if it exists
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  isSaved: true,
                }
              : recipe
          )
        );
        
        // Refresh saved recipes
        fetchSavedRecipes();
        
        return true;
      } else {
        showToast(response.error || 'Failed to save recipe', 'error');
        return false;
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
      return false;
    }
  };

  // Unsave a recipe
  const unsaveRecipe = async (id: number): Promise<boolean> => {
    try {
      const response = await recipeService.unsaveRecipe(id);
      
      if (response.data?.success) {
        // Update current recipe if it's the one being unsaved
        if (currentRecipe && currentRecipe.id === id) {
          setCurrentRecipe({
            ...currentRecipe,
            isSaved: false,
          });
        }
        
        // Update recipe in list if it exists
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === id
              ? {
                  ...recipe,
                  isSaved: false,
                }
              : recipe
          )
        );
        
        // Remove recipe from saved list
        setSavedRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe.id !== id)
        );
        
        return true;
      } else {
        showToast(response.error || 'Failed to unsave recipe', 'error');
        return false;
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
      return false;
    }
  };

  // Context value
  const value = {
    recipes,
    savedRecipes,
    currentRecipe,
    loading,
    error,
    pagination,
    searchParams,
    fetchRecipes,
    fetchSavedRecipes,
    fetchRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    likeRecipe,
    unlikeRecipe,
    saveRecipe,
    unsaveRecipe,
    setSearchParams,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}
