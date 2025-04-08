import { apiClient } from './client';
import { User } from './auth';

// Types
export interface Recipe {
  id: number;
  title: string;
  description?: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  ingredients: Ingredient[];
  instructions: Instruction[];
  categories: Category[];
  tags: Tag[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
}

export interface Ingredient {
  id: number;
  name: string;
  quantity?: number;
  unit?: string;
  orderIndex: number;
  notes?: string;
}

export interface Instruction {
  id: number;
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CommentListResponse {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface RecipeInput {
  title: string;
  description?: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  isPrivate?: boolean;
  ingredients: {
    name: string;
    quantity?: number;
    unit?: string;
    orderIndex: number;
    notes?: string;
  }[];
  instructions: {
    stepNumber: number;
    description: string;
    imageUrl?: string;
  }[];
  categories?: number[];
  tags?: string[];
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  categoryId?: number;
  difficulty?: string;
}

// Recipe service
export const recipeService = {
  // Get all recipes
  async getRecipes(params: SearchParams = {}) {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    
    const queryString = queryParams.toString();
    
    return apiClient<RecipeListResponse>(`/recipes${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get a recipe by ID
  async getRecipe(id: number) {
    return apiClient<Recipe>(`/recipes/${id}`);
  },
  
  // Create a new recipe
  async createRecipe(data: RecipeInput) {
    return apiClient<{ success: boolean; recipe: Recipe }>('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update a recipe
  async updateRecipe(id: number, data: Partial<RecipeInput>) {
    return apiClient<{ success: boolean; recipe: Recipe }>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete a recipe
  async deleteRecipe(id: number) {
    return apiClient<{ success: boolean }>(`/recipes/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Like a recipe
  async likeRecipe(id: number) {
    return apiClient<{ success: boolean }>(`/recipes/${id}/like`, {
      method: 'POST',
    });
  },
  
  // Unlike a recipe
  async unlikeRecipe(id: number) {
    return apiClient<{ success: boolean }>(`/recipes/${id}/like`, {
      method: 'DELETE',
    });
  },
  
  // Add a comment to a recipe
  async addComment(id: number, content: string) {
    return apiClient<Comment>(`/recipes/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  
  // Get comments for a recipe
  async getComments(id: number, page = 1, limit = 10) {
    return apiClient<CommentListResponse>(`/recipes/${id}/comments?page=${page}&limit=${limit}`);
  },
};
