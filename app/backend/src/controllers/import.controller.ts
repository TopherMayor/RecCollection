import type { Context } from "hono";
import { ImportService } from "../services/import.service.ts";
import { RecipeService } from "../services/recipe.service.ts";
import { HTTPException } from "hono/http-exception";
import type { JWTPayload } from "../middleware/auth.ts";

// Create instances of the services
const importService = new ImportService();
const recipeService = new RecipeService();

export class ImportController {
  // Import a recipe from Instagram
  async importFromInstagram(c: Context, data: { url: string }) {
    try {
      const user = c.get("user") as JWTPayload;

      // Import the recipe data
      const recipeData = await importService.importFromInstagram(
        Number(user.id),
        data.url
      );

      // Create the recipe
      const recipe = await recipeService.createRecipe(
        Number(user.id),
        recipeData
      );

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
        message: "An error occurred while importing from Instagram",
      });
    }
  }

  // Import a recipe from TikTok
  async importFromTikTok(c: Context, data: { url: string }) {
    try {
      const user = c.get("user") as JWTPayload;

      // Import the recipe data
      const recipeData = await importService.importFromTikTok(
        Number(user.id),
        data.url
      );

      // Create the recipe
      const recipe = await recipeService.createRecipe(
        Number(user.id),
        recipeData
      );

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
        message: "An error occurred while importing from TikTok",
      });
    }
  }
}
