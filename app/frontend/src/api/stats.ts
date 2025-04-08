import { apiClient } from './client';
import { CategoryWithCount } from './categories';
import { TagWithCount } from './tags';

// Types
export interface RecipeStats {
  totalRecipes: number;
  totalUsers: number;
  totalLikes: number;
  totalComments: number;
  popularCategories: CategoryWithCount[];
  popularTags: TagWithCount[];
}

export interface UserStats {
  totalRecipes: number;
  totalLikes: number;
  totalSaved: number;
  totalComments: number;
  mostLikedRecipe?: {
    id: number;
    title: string;
    likeCount: number;
  };
}

// Stats service
export const statsService = {
  // Get general recipe statistics
  async getRecipeStats() {
    return apiClient<RecipeStats>('/stats/recipes');
  },
  
  // Get user statistics
  async getUserStats(userId?: number) {
    const url = userId ? `/stats/users/${userId}` : '/stats/users/me';
    return apiClient<UserStats>(url);
  },
};
