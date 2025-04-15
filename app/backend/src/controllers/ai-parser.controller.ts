import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { AIParserService } from "../services/ai-parser.service";
import { RecipeService } from "../services/recipe.service";
import { JWTPayload } from "../middleware/auth";
import { createDefaultThumbnail } from "../utils/image";

// Create instances of the services
const aiParserService = new AIParserService();
const recipeService = new RecipeService();

// AI Parser Controller
export class AIParserController {
  // Parse recipe from social media URL
  async parseRecipeFromSocialMedia(c: Context) {
    try {
      // Get user from context
      const user = c.get("user") as JWTPayload;
      if (!user) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      // Get request body
      const body = await c.req.json();
      const { url, platform } = body;

      if (!url) {
        throw new HTTPException(400, { message: "URL is required" });
      }

      console.log(
        `AIParserController: Parsing recipe from social media URL: ${url}`
      );

      // Parse recipe from social media with multiple screenshots
      const { recipe: parsedRecipe, screenshotOptions } =
        await aiParserService.parseRecipeFromSocialMedia({
          url,
          platform,
          userId: user.id,
          captureMultipleScreenshots: true,
        });

      // Log thumbnail status
      if (parsedRecipe.thumbnailPath) {
        console.log(
          `AIParserController: Recipe parsed with thumbnail: ${parsedRecipe.thumbnailPath}`
        );
        // Set the imageUrl to the thumbnailPath if it exists
        if (!parsedRecipe.imageUrl) {
          parsedRecipe.imageUrl = parsedRecipe.thumbnailPath;
        }
      } else if (parsedRecipe.thumbnailUrl) {
        console.log(
          `AIParserController: Recipe parsed with thumbnail URL: ${parsedRecipe.thumbnailUrl}`
        );
        // Set the imageUrl to the thumbnailUrl if it exists
        parsedRecipe.imageUrl = parsedRecipe.thumbnailUrl;
      } else {
        console.log(
          "AIParserController: Recipe parsed without thumbnail, using default"
        );
        parsedRecipe.thumbnailPath = await createDefaultThumbnail();
        parsedRecipe.imageUrl = parsedRecipe.thumbnailPath;
      }

      // Log if this is mock data
      if (parsedRecipe.isMockData) {
        console.log(
          "AIParserController: ⚠️ Returning MOCK recipe data with real thumbnail ⚠️"
        );
      }

      return c.json({
        success: true,
        recipe: parsedRecipe,
        screenshotOptions: screenshotOptions || [],
        isMockData: parsedRecipe.isMockData || false,
      });
    } catch (error) {
      console.error("Error in parseRecipeFromSocialMedia controller:", error);

      // Handle specific error types
      if (error instanceof HTTPException) {
        throw error;
      }

      // Provide more detailed error messages based on the error
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check for specific error patterns
      if (
        errorMessage.includes("transcript") ||
        errorMessage.includes("captions")
      ) {
        throw new HTTPException(422, {
          message:
            "The video doesn't have captions available. The AI will try to generate a recipe based on limited information.",
          details: errorMessage,
        });
      } else if (
        errorMessage.includes("JSON") ||
        errorMessage.includes("parse")
      ) {
        throw new HTTPException(422, {
          message:
            "There was an issue processing the AI response. Please try again.",
          details: errorMessage,
        });
      } else if (
        errorMessage.includes("URL") ||
        errorMessage.includes("video ID")
      ) {
        throw new HTTPException(400, {
          message:
            "Invalid URL format. Please provide a valid YouTube, TikTok, or Instagram URL.",
          details: errorMessage,
        });
      }

      // Generic error
      throw new HTTPException(500, {
        message: "Failed to parse recipe from social media",
        details: errorMessage,
      });
    }
  }

  // Import recipe from social media URL
  async importRecipeFromSocialMedia(c: Context) {
    try {
      // Get user from context
      const user = c.get("user") as JWTPayload;
      if (!user) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      // Get request body
      const body = await c.req.json();
      const { url, platform, recipeData } = body;

      if (!url) {
        throw new HTTPException(400, { message: "URL is required" });
      }

      if (!recipeData) {
        throw new HTTPException(400, { message: "Recipe data is required" });
      }

      console.log(
        "AIParserController: Processing import from social media URL:",
        url
      );

      // If recipeData is provided, use it directly
      // Otherwise, parse the recipe from the social media URL
      let parsedRecipe = recipeData;

      if (!parsedRecipe) {
        parsedRecipe = await aiParserService.parseRecipeFromSocialMedia({
          url,
          platform,
          userId: user.id,
        });
      }

      // Add source information
      parsedRecipe.sourceUrl = url;
      parsedRecipe.sourceType = platform || aiParserService.detectPlatform(url);

      // Ensure thumbnailPath is set
      if (parsedRecipe.thumbnailPath) {
        console.log(
          `AIParserController: Using thumbnail path from recipe data: ${parsedRecipe.thumbnailPath}`
        );
        // Set the imageUrl to the thumbnailPath if it exists
        if (!parsedRecipe.imageUrl) {
          parsedRecipe.imageUrl = parsedRecipe.thumbnailPath;
        }
      } else if (parsedRecipe.thumbnailUrl) {
        console.log(
          `AIParserController: Using thumbnail URL from recipe data: ${parsedRecipe.thumbnailUrl}`
        );
        // Set the imageUrl to the thumbnailUrl if it exists
        parsedRecipe.imageUrl = parsedRecipe.thumbnailUrl;
      } else {
        console.log(
          "AIParserController: No thumbnail path in recipe data, using default"
        );
        parsedRecipe.thumbnailPath = await createDefaultThumbnail();
        parsedRecipe.imageUrl = parsedRecipe.thumbnailPath;
      }

      // Check if this is mock data and log it
      if (parsedRecipe.isMockData) {
        console.log(
          "AIParserController: ⚠️ Importing MOCK recipe data with real thumbnail ⚠️"
        );
        // Add a note to the description to indicate this is mock data
        if (parsedRecipe.description) {
          if (
            !parsedRecipe.description.includes(
              "[NOTE: This is mock recipe data"
            )
          ) {
            parsedRecipe.description = `[NOTE: This is mock recipe data] ${parsedRecipe.description}`;
          }
        } else {
          parsedRecipe.description = "[NOTE: This is mock recipe data]";
        }
      }

      // Get screenshot options from the request body
      const { screenshotOptions } = body;

      // Create the recipe in the database
      const createdRecipe = await recipeService.createRecipe(
        user.id,
        parsedRecipe
      );

      return c.json({
        success: true,
        recipe: createdRecipe,
        isMockData: parsedRecipe.isMockData || false,
      });
    } catch (error) {
      console.error("Error in importRecipeFromSocialMedia controller:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "Failed to import recipe from social media",
      });
    }
  }

  // Cleanup resources when the server shuts down
  async cleanup() {
    try {
      console.log("Cleaning up AI Parser Controller resources...");
      await aiParserService.cleanup();
      console.log("AI Parser Controller cleanup completed");
    } catch (error) {
      console.error("Error during AI Parser Controller cleanup:", error);
    }
  }
}
