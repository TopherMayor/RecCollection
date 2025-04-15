import { db } from "../db";
import { sharedRecipes, recipes, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { EmailService } from "./email.service";
import { SMSService } from "./sms.service";
import { NotificationService } from "./notification.service";
import { nanoid } from "nanoid";

// Share recipe data interface
export interface ShareRecipeData {
  recipeId: number;
  sharedBy: number;
  sharedWith: string; // Email or phone number
  shareType: "email" | "sms" | "link";
  message?: string;
  expiresAt?: Date;
}

// Sharing service
export class SharingService {
  private emailService: EmailService;
  private smsService: SMSService;
  private notificationService: NotificationService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.notificationService = new NotificationService();
  }

  // Share recipe
  async shareRecipe(data: ShareRecipeData): Promise<any> {
    try {
      // Check if recipe exists
      const recipe = await db.query.recipes.findFirst({
        where: eq(recipes.id, data.recipeId),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      if (!recipe) {
        throw new HTTPException(404, { message: "Recipe not found" });
      }

      // Check if user has permission to share the recipe
      if (recipe.userId !== data.sharedBy && recipe.isPrivate) {
        throw new HTTPException(403, { message: "You don't have permission to share this recipe" });
      }

      // Get sharer information
      const sharer = await db.query.users.findFirst({
        where: eq(users.id, data.sharedBy),
        columns: {
          id: true,
          username: true,
          displayName: true,
        },
      });

      if (!sharer) {
        throw new HTTPException(404, { message: "Sharer not found" });
      }

      // Generate share token for link sharing
      const shareToken = data.shareType === "link" ? nanoid(10) : null;

      // Create share record
      const [shareRecord] = await db
        .insert(sharedRecipes)
        .values({
          recipeId: data.recipeId,
          sharedBy: data.sharedBy,
          sharedWith: data.sharedWith,
          shareType: data.shareType,
          shareToken,
          message: data.message,
          createdAt: new Date(),
          expiresAt: data.expiresAt,
        })
        .returning();

      // Generate share URL
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const shareUrl = shareToken
        ? `${baseUrl}/shared/${shareToken}`
        : `${baseUrl}/recipes/${data.recipeId}`;

      // Send notification to recipe owner if it's not their own recipe
      if (recipe.userId !== data.sharedBy) {
        await this.notificationService.createNotification({
          userId: recipe.userId,
          type: "share",
          senderId: data.sharedBy,
          recipeId: data.recipeId,
          message: `${sharer.displayName || sharer.username} shared your recipe "${recipe.title}" with someone.`,
        });
      }

      // Handle different share types
      const sharerName = sharer.displayName || sharer.username;
      
      if (data.shareType === "email") {
        // Send email
        await this.emailService.sendRecipeSharedEmail(
          data.sharedWith,
          sharerName,
          recipe.title,
          shareUrl,
          data.message
        );
      } else if (data.shareType === "sms") {
        // Send SMS
        await this.smsService.sendRecipeSharedSMS(
          data.sharedWith,
          sharerName,
          recipe.title,
          shareUrl
        );
      }

      return {
        ...shareRecord,
        shareUrl,
      };
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
  async getSharedRecipeByToken(token: string): Promise<any> {
    try {
      // Find share record
      const shareRecord = await db.query.sharedRecipes.findFirst({
        where: eq(sharedRecipes.shareToken, token),
        with: {
          recipe: {
            with: {
              user: {
                columns: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
              ingredients: true,
              instructions: true,
              categories: {
                with: {
                  category: true,
                },
              },
              tags: {
                with: {
                  tag: true,
                },
              },
            },
          },
          sharedByUser: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!shareRecord) {
        throw new HTTPException(404, { message: "Shared recipe not found" });
      }

      // Check if share has expired
      if (shareRecord.expiresAt && new Date() > shareRecord.expiresAt) {
        throw new HTTPException(410, { message: "This shared recipe has expired" });
      }

      return {
        recipe: shareRecord.recipe,
        sharedBy: shareRecord.sharedByUser,
        sharedAt: shareRecord.createdAt,
        message: shareRecord.message,
      };
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
  async getUserSharedRecipes(userId: number): Promise<any[]> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Get shared recipes
      const sharedRecipesList = await db.query.sharedRecipes.findMany({
        where: eq(sharedRecipes.sharedBy, userId),
        with: {
          recipe: {
            columns: {
              id: true,
              title: true,
              imageUrl: true,
              thumbnailUrl: true,
              createdAt: true,
            },
          },
        },
        orderBy: [db.desc(sharedRecipes.createdAt)],
      });

      return sharedRecipesList;
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
  async deleteSharedRecipe(userId: number, shareId: number): Promise<boolean> {
    try {
      // Check if share record exists and belongs to the user
      const shareRecord = await db.query.sharedRecipes.findFirst({
        where: and(
          eq(sharedRecipes.id, shareId),
          eq(sharedRecipes.sharedBy, userId)
        ),
      });

      if (!shareRecord) {
        throw new HTTPException(404, { message: "Shared recipe not found" });
      }

      // Delete share record
      await db
        .delete(sharedRecipes)
        .where(
          and(
            eq(sharedRecipes.id, shareId),
            eq(sharedRecipes.sharedBy, userId)
          )
        );

      return true;
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

  // Generate deep link for social media apps
  generateDeepLink(recipeId: number, platform: string): string {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const webUrl = `${baseUrl}/recipes/${recipeId}`;
    
    // Generate app-specific deep links
    switch (platform.toLowerCase()) {
      case "ios":
        return `reccollection://recipes/${recipeId}`;
      case "android":
        return `reccollection://recipes/${recipeId}`;
      case "universal":
        // Universal link format
        return webUrl;
      default:
        return webUrl;
    }
  }
}
