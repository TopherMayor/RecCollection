import { apiClient } from './client';
import { Category } from './recipes';

// Types
export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CategoryWithCount extends Category {
  count: number;
}

export interface PopularCategoriesResponse {
  categories: CategoryWithCount[];
}

// Category service
export const categoryService = {
  // Get all categories
  async getCategories(page = 1, limit = 20) {
    return apiClient<CategoryListResponse>(`/categories?page=${page}&limit=${limit}`);
  },
  
  // Get popular categories
  async getPopularCategories(limit = 10) {
    return apiClient<PopularCategoriesResponse>(`/categories/popular?limit=${limit}`);
  },
  
  // Get a category by ID
  async getCategory(id: number) {
    return apiClient<Category>(`/categories/${id}`);
  },
  
  // Create a new category
  async createCategory(name: string, description?: string) {
    return apiClient<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },
  
  // Update a category
  async updateCategory(id: number, name: string, description?: string) {
    return apiClient<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
  },
  
  // Delete a category
  async deleteCategory(id: number) {
    return apiClient<{ success: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};
