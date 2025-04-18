import type { Context } from "hono";
import { SharingService } from "../services/sharing.service.ts";
import { DeepLinkService } from "../services/deeplink.service.ts";
import { HTTPException } from "hono/http-exception";
import { JWTPayload } from "../middleware/auth.ts";

// Create instances of the services
const sharingService = new SharingService();
const deepLinkService = new DeepLinkService();

export class SharingController {
  // Share recipe
  async shareRecipe(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const { recipeId } = c.req.param();
      const { sharedWith, shareType, message, expiresInDays } =
        await c.req.json();

      // Validate required fields
      if (!sharedWith || !shareType) {
        throw new HTTPException(400, { message: "Missing required fields" });
      }

      // Validate share type
      if (!["email", "sms", "link"].includes(shareType)) {
        throw new HTTPException(400, { message: "Invalid share type" });
      }

      // Calculate expiration date if provided
      let expiresAt = undefined;
      if (expiresInDays && !isNaN(expiresInDays)) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
      }

      const result = await sharingService.shareRecipe({
        recipeId: parseInt(recipeId),
        sharedBy: Number(user.id),
        sharedWith,
        shareType,
        message,
        expiresAt,
      });

      return c.json({
        success: true,
        share: result,
      });
    } catch (error) {
      console.error("Error sharing recipe:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while sharing the recipe",
      });
    }
  }

  // Get shared recipe by token
  async getSharedRecipeByToken(c: Context) {
    try {
      const { token } = c.req.param();

      const result = await sharingService.getSharedRecipeByToken(token);

      return c.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error getting shared recipe:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting the shared recipe",
      });
    }
  }

  // Get user's shared recipes
  async getUserSharedRecipes(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;

      const sharedRecipes = await sharingService.getUserSharedRecipes(
        Number(user.id)
      );

      return c.json({
        success: true,
        sharedRecipes,
      });
    } catch (error) {
      console.error("Error getting user's shared recipes:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting user's shared recipes",
      });
    }
  }

  // Delete shared recipe
  async deleteSharedRecipe(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const { id } = c.req.param();

      const shareId = parseInt(id);
      if (isNaN(shareId)) {
        throw new HTTPException(400, { message: "Invalid share ID" });
      }

      await sharingService.deleteSharedRecipe(Number(user.id), shareId);

      return c.json({
        success: true,
      });
    } catch (error) {
      console.error("Error deleting shared recipe:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while deleting the shared recipe",
      });
    }
  }

  // Generate deep link for recipe import
  async generateImportDeepLink(c: Context) {
    try {
      const { url, source } = await c.req.json();

      // Validate required fields
      if (!url || !source) {
        throw new HTTPException(400, { message: "Missing required fields" });
      }

      const deepLink = deepLinkService.createImportDeepLink(url, source);

      return c.json({
        success: true,
        deepLink: JSON.parse(deepLink),
      });
    } catch (error) {
      console.error("Error generating import deep link:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while generating import deep link",
      });
    }
  }

  // Get pending import by token
  async getPendingImport(c: Context) {
    try {
      const { token } = c.req.param();

      const importData = deepLinkService.getPendingImport(token);

      if (!importData) {
        throw new HTTPException(404, {
          message: "Import not found or expired",
        });
      }

      return c.json({
        success: true,
        import: importData,
      });
    } catch (error) {
      console.error("Error getting pending import:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting pending import",
      });
    }
  }

  // Delete pending import
  async deletePendingImport(c: Context) {
    try {
      const { token } = c.req.param();

      const result = deepLinkService.deletePendingImport(token);

      return c.json({
        success: true,
        deleted: result,
      });
    } catch (error) {
      console.error("Error deleting pending import:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while deleting pending import",
      });
    }
  }
}
