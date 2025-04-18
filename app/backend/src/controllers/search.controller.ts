import type { Context } from "hono";
import { UserService, UserSearchParams } from "../services/user.service.ts";
import {
  RecipeService,
  RecipeSearchParams,
} from "../services/recipe.service.ts";
import { HTTPException } from "hono/http-exception";

// Create instances of the services
const userService = new UserService();
const recipeService = new RecipeService();

export class SearchController {
  // Search users
  async searchUsers(c: Context, params: UserSearchParams) {
    try {
      // Search users
      const result = await userService.searchUsers(params);

      return c.json({
        success: true,
        users: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while searching users",
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
        recipes: result.recipes,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error searching recipes:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while searching recipes",
      });
    }
  }

  // Combined search (users and recipes)
  async search(c: Context) {
    try {
      const { q, type, page, limit } = c.req.query();

      // Validate query parameter
      if (!q) {
        return c.json(
          {
            success: false,
            error: "Search query is required",
          },
          400
        );
      }

      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      // If type is specified, search only that type
      if (type === "users") {
        const result = await userService.searchUsers({
          search: q,
          page: pageNum,
          limit: limitNum,
        });

        return c.json({
          success: true,
          type: "users",
          users: result.users,
          pagination: result.pagination,
        });
      } else if (type === "recipes") {
        const result = await recipeService.searchRecipes({
          search: q,
          page: pageNum,
          limit: limitNum,
        });

        return c.json({
          success: true,
          type: "recipes",
          recipes: result.recipes,
          pagination: result.pagination,
        });
      }

      // Otherwise, search both users and recipes
      const [usersResult, recipesResult] = await Promise.all([
        userService.searchUsers({
          search: q,
          page: pageNum,
          limit: limitNum,
        }),
        recipeService.searchRecipes({
          search: q,
          page: pageNum,
          limit: limitNum,
        }),
      ]);

      return c.json({
        success: true,
        users: {
          items: usersResult.users,
          pagination: usersResult.pagination,
        },
        recipes: {
          items: recipesResult.recipes,
          pagination: recipesResult.pagination,
        },
      });
    } catch (error) {
      console.error("Error searching:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while searching",
      });
    }
  }
}
