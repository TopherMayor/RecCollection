import { mockDb, recipes } from '../db/mock';

// Simple mock recipe service
export class MockRecipeService {
  // Get all recipes
  async getAllRecipes() {
    return {
      recipes: mockDb.getRecipes(),
      pagination: {
        total: mockDb.getRecipes().length,
        page: 1,
        limit: 10,
        pages: 1,
      },
    };
  }

  // Get recipe by ID
  async getRecipeById(id: number) {
    const recipe = mockDb.getRecipeById(id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    return recipe;
  }

  // Search recipes
  async searchRecipes(params: any = {}) {
    let filteredRecipes = mockDb.getRecipes();
    
    // Filter by search term
    if (params.search) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(params.search.toLowerCase()) || 
        (recipe.description && recipe.description.toLowerCase().includes(params.search.toLowerCase()))
      );
    }
    
    // Filter by category
    if (params.categoryId) {
      const categoryId = Number(params.categoryId);
      filteredRecipes = filteredRecipes.filter(recipe => 
        mockDb.getRecipeCategories(recipe.id)?.some(category => category?.id === categoryId)
      );
    }
    
    // Filter by difficulty
    if (params.difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.difficulty_level === params.difficulty
      );
    }
    
    return {
      recipes: filteredRecipes,
      pagination: {
        total: filteredRecipes.length,
        page: params.page || 1,
        limit: params.limit || 10,
        pages: Math.ceil(filteredRecipes.length / (params.limit || 10)),
      },
    };
  }
}

export default MockRecipeService;
