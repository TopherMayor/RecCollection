import { vi } from 'vitest';

// Mock API response
export const mockApiResponse = <T>(data: T, status = 200, error?: string) => {
  return {
    data: error ? undefined : data,
    error,
    status,
  };
};

// Mock user data
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  displayName: 'Test User',
  bio: 'This is a test user',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00.000Z',
};

// Mock recipe data
export const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  description: 'This is a test recipe',
  imageUrl: 'https://example.com/recipe.jpg',
  prepTime: 10,
  cookingTime: 20,
  servingSize: 4,
  difficultyLevel: 'medium',
  isPrivate: false,
  likeCount: 10,
  commentCount: 5,
  isLiked: false,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  user: mockUser,
  ingredients: [
    {
      id: 1,
      name: 'Ingredient 1',
      quantity: 1,
      unit: 'cup',
      orderIndex: 1,
      notes: 'Test notes',
    },
  ],
  instructions: [
    {
      id: 1,
      stepNumber: 1,
      description: 'Test instruction',
      imageUrl: null,
    },
  ],
  categories: [
    {
      id: 1,
      name: 'Category 1',
    },
  ],
  tags: [
    {
      id: 1,
      name: 'tag1',
    },
  ],
};

// Mock category data
export const mockCategory = {
  id: 1,
  name: 'Category 1',
  count: 10,
};

// Mock tag data
export const mockTag = {
  id: 1,
  name: 'tag1',
  count: 10,
};

// Mock stats data
export const mockStats = {
  totalRecipes: 100,
  totalUsers: 50,
  totalLikes: 500,
  totalComments: 200,
  popularCategories: [
    { id: 1, name: 'Category 1', count: 30 },
    { id: 2, name: 'Category 2', count: 20 },
    { id: 3, name: 'Category 3', count: 10 },
  ],
  popularTags: [
    { id: 1, name: 'tag1', count: 40 },
    { id: 2, name: 'tag2', count: 30 },
    { id: 3, name: 'tag3', count: 20 },
  ],
};

// Mock API services
export const mockAuthService = {
  login: vi.fn().mockResolvedValue(mockApiResponse({ user: mockUser, token: 'test-token' })),
  register: vi.fn().mockResolvedValue(mockApiResponse({ user: mockUser, token: 'test-token' })),
  logout: vi.fn().mockResolvedValue(mockApiResponse({ success: true })),
  getCurrentUser: vi.fn().mockResolvedValue(mockApiResponse(mockUser)),
  updateProfile: vi.fn().mockResolvedValue(mockApiResponse(mockUser)),
};

export const mockRecipeService = {
  getRecipes: vi.fn().mockResolvedValue(mockApiResponse({ 
    recipes: [mockRecipe], 
    pagination: { total: 1, page: 1, limit: 10, pages: 1 } 
  })),
  getRecipe: vi.fn().mockResolvedValue(mockApiResponse(mockRecipe)),
  createRecipe: vi.fn().mockResolvedValue(mockApiResponse(mockRecipe)),
  updateRecipe: vi.fn().mockResolvedValue(mockApiResponse(mockRecipe)),
  deleteRecipe: vi.fn().mockResolvedValue(mockApiResponse({ success: true })),
  likeRecipe: vi.fn().mockResolvedValue(mockApiResponse({ success: true })),
  unlikeRecipe: vi.fn().mockResolvedValue(mockApiResponse({ success: true })),
};

export const mockCategoryService = {
  getCategories: vi.fn().mockResolvedValue(mockApiResponse({ 
    categories: [mockCategory], 
    pagination: { total: 1, page: 1, limit: 10, pages: 1 } 
  })),
  getPopularCategories: vi.fn().mockResolvedValue(mockApiResponse({ 
    categories: [mockCategory, { ...mockCategory, id: 2, name: 'Category 2', count: 5 }] 
  })),
  getCategory: vi.fn().mockResolvedValue(mockApiResponse(mockCategory)),
  createCategory: vi.fn().mockResolvedValue(mockApiResponse(mockCategory)),
  updateCategory: vi.fn().mockResolvedValue(mockApiResponse(mockCategory)),
  deleteCategory: vi.fn().mockResolvedValue(mockApiResponse({ success: true })),
};

export const mockTagService = {
  getTags: vi.fn().mockResolvedValue(mockApiResponse({ 
    tags: [mockTag], 
    pagination: { total: 1, page: 1, limit: 10, pages: 1 } 
  })),
  getPopularTags: vi.fn().mockResolvedValue(mockApiResponse({ 
    tags: [mockTag, { ...mockTag, id: 2, name: 'tag2', count: 5 }] 
  })),
  getTag: vi.fn().mockResolvedValue(mockApiResponse(mockTag)),
  createTag: vi.fn().mockResolvedValue(mockApiResponse(mockTag)),
  deleteTag: vi.fn().mockResolvedValue(mockApiResponse({ success: true })),
};

export const mockStatsService = {
  getRecipeStats: vi.fn().mockResolvedValue(mockApiResponse(mockStats)),
  getUserStats: vi.fn().mockResolvedValue(mockApiResponse({
    totalRecipes: 10,
    totalLikes: 50,
    totalSaved: 20,
    totalComments: 30,
    mostLikedRecipe: {
      id: 1,
      title: 'Test Recipe',
      likeCount: 10,
    },
  })),
};

export const mockAiService = {
  generateName: vi.fn().mockResolvedValue(mockApiResponse({ name: 'Generated Recipe Name' })),
  generateDescription: vi.fn().mockResolvedValue(mockApiResponse({ description: 'Generated recipe description' })),
};

export const mockImportService = {
  importFromInstagram: vi.fn().mockResolvedValue(mockApiResponse({ recipe: mockRecipe })),
  importFromTikTok: vi.fn().mockResolvedValue(mockApiResponse({ recipe: mockRecipe })),
};
