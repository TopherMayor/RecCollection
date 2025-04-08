import type { Context } from "hono";
import { RecipeService } from "../services/recipe.service";
import { HTTPException } from "hono/http-exception";
import type { JWTPayload } from "../middleware/auth";
import type {
  RecipeInput,
  RecipeSearchParams,
} from "../services/recipe.service";

// Create an instance of the recipe service
const recipeService = new RecipeService();

export class RecipeController {
  // Create a new recipe
  async createRecipe(c: Context, data: RecipeInput) {
    try {
      const user = c.get("user") as JWTPayload;

      // Create the recipe
      const recipe = await recipeService.createRecipe(user.id, data);

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

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid recipe ID" });
      }

      // Get user ID if authenticated
      let userId: number | undefined;
      try {
        const user = c.get("user") as JWTPayload | undefined;
        if (user) {
          userId = user.id;
        }
      } catch (error) {
        // User is not authenticated, continue without user ID
      }

      // Get the recipe
      const recipe = await recipeService.getRecipeById(id, userId);

      return c.json(recipe);
    } catch (error) {
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
      const recipe = await recipeService.updateRecipe(id, user.id, data);

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
      const result = await recipeService.deleteRecipe(id, user.id);

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

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while searching recipes",
      });
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
      const result = await recipeService.likeRecipe(id, user.id);

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
      const result = await recipeService.unlikeRecipe(id, user.id);

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
      const comment = await recipeService.addComment(id, user.id, data.content);

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
}
