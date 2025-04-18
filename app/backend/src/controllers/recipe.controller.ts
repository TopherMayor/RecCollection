import type { Context } from "hono";
import { RecipeService } from "../services/recipe.service.ts";
import { HTTPException } from "hono/http-exception";
import type { JWTPayload } from "../middleware/auth.ts";
import type {
  RecipeInput,
  RecipeSearchParams,
} from "../services/recipe.service.ts";

// Create an instance of the recipe service
const recipeService = new RecipeService();

export class RecipeController {
  // Create a new recipe
  async createRecipe(c: Context, data: RecipeInput) {
    try {
      const user = c.get("user") as JWTPayload;

      // Create the recipe
      const recipe = await recipeService.createRecipe(Number(user.id), data);

      return c.json(
        {
          success: true,
          recipe,
        },
        201
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while creating the recipe",
      });
    }
  }

  // Get a recipe by ID
  async getRecipe(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      console.log(`Fetching recipe with ID: ${id}`);

      if (isNaN(id)) {
        console.log(`Invalid recipe ID: ${c.req.param("id")}`);
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Get user ID if authenticated
      let userId: number | undefined;
      try {
        const user = c.get("user") as JWTPayload | undefined;
        if (user) {
          userId = Number(user.id);
          console.log(`User authenticated, ID: ${userId}`);
        } else {
          console.log(`User not authenticated (user object is undefined)`);
        }
      } catch (error) {
        console.log(`Error getting user from context:`, error);
        // User is not authenticated, continue without user ID
      }

      try {
        // Get the recipe
        console.log(`Calling recipeService.getRecipeById(${id}, ${userId})`);
        const recipe = await recipeService.getRecipeById(id, userId);
        console.log(`Recipe fetched successfully:`, recipe);

        if (!recipe) {
          console.log(`Recipe with ID ${id} not found`);
          return c.json(
            {
              success: false,
              error: "Recipe not found",
            },
            404
          );
        }

        return c.json({
          success: true,
          recipe,
        });
      } catch (serviceError) {
        console.error(`Error in recipeService.getRecipeById:`, serviceError);
        throw serviceError;
      }
    } catch (error) {
      console.error(`Error in getRecipe controller:`, error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while fetching the recipe",
      });
    }
  }

  // Update a recipe
  async updateRecipe(c: Context, data: Partial<RecipeInput>) {
    try {
      const id = parseInt(c.req.param("id"));
      const user = c.get("user") as JWTPayload;

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Update the recipe
      const recipe = await recipeService.updateRecipe(
        id,
        Number(user.id),
        data
      );

      return c.json({
        success: true,
        recipe,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while updating the recipe",
      });
    }
  }

  // Delete a recipe
  async deleteRecipe(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      const user = c.get("user") as JWTPayload;

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Delete the recipe
      const result = await recipeService.deleteRecipe(id, Number(user.id));

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while deleting the recipe",
      });
    }
  }

  // Search recipes
  async searchRecipes(c: Context, params: RecipeSearchParams) {
    try {
      // Search recipes
      const result = await recipeService.searchRecipes(params);

      return c.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error searching recipes:", error);
      return c.json(
        {
          success: false,
          error: "An error occurred while searching recipes",
        },
        500
      );
    }
  }

  // Like a recipe
  async likeRecipe(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      const user = c.get("user") as JWTPayload;

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Like the recipe
      const result = await recipeService.likeRecipe(id, Number(user.id));

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while liking the recipe",
      });
    }
  }

  // Unlike a recipe
  async unlikeRecipe(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      const user = c.get("user") as JWTPayload;

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Unlike the recipe
      const result = await recipeService.unlikeRecipe(id, Number(user.id));

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while unliking the recipe",
      });
    }
  }

  // Add a comment to a recipe
  async addComment(c: Context, data: { content: string }) {
    try {
      const id = parseInt(c.req.param("id"));
      const user = c.get("user") as JWTPayload;

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Add the comment
      const comment = await recipeService.addComment(
        id,
        Number(user.id),
        data.content
      );

      return c.json(comment, 201);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while adding the comment",
      });
    }
  }

  // Get comments for a recipe
  async getComments(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      const { page, limit } = c.req.query();

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Parse query parameters
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      // Get the comments
      const result = await recipeService.getComments(id, pageNum, limitNum);

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while fetching comments",
      });
    }
  }

  // Get recipes from followed users
  async getFollowingRecipes(c: Context, params: RecipeSearchParams) {
    try {
      const user = c.get("user") as JWTPayload;

      // Get recipes from followed users
      const result = await recipeService.getFollowingRecipes(
        Number(user.id),
        params
      );

      return c.json({
        success: true,
        recipes: result.recipes,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while fetching recipes from followed users",
      });
    }
  }

  // Delete multiple recipes
  async deleteMultipleRecipes(c: Context, data: { ids: number[] }) {
    try {
      const user = c.get("user") as JWTPayload;
      const { ids } = data;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new HTTPException(400, { message: "Invalid recipe IDs" });
      }

      // Delete each recipe and collect results
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            await recipeService.deleteRecipe(id, Number(user.id));
            return { id, success: true };
          } catch (error) {
            return {
              id,
              success: false,
              error:
                error instanceof HTTPException
                  ? error.message
                  : "Unknown error",
            };
          }
        })
      );

      // Count successful deletions
      const successCount = results.filter((r) => r.success).length;

      return c.json({
        success: true,
        message: `${successCount} recipe(s) deleted successfully`,
        results,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while deleting recipes",
      });
    }
  }
}
