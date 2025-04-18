import type { Context } from "hono";
import { NotificationService } from "../services/notification.service.ts";
import { HTTPException } from "hono/http-exception";
import { JWTPayload } from "../middleware/auth.ts";

// Create an instance of the notification service
const notificationService = new NotificationService();

// Simple in-memory cache for unread notification counts
// Key: userId, Value: { count: number, timestamp: number }
const unreadCountCache = new Map<
  number,
  { count: number; timestamp: number }
>();

// Cache expiration time in milliseconds (30 seconds)
const CACHE_EXPIRATION = 30000;

export class NotificationController {
  // Get user's notifications
  async getUserNotifications(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const { page, limit } = c.req.query();

      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      const result = await notificationService.getUserNotifications(
        Number(user.id),
        {
          page: pageNum,
          limit: limitNum,
        }
      );

      return c.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error getting user notifications:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting user notifications",
      });
    }
  }

  // Get unread notification count with caching
  async getUnreadNotificationCount(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const userId = Number(user.id);
      const now = Date.now();

      // Check if we have a valid cached count
      const cachedData = unreadCountCache.get(userId);
      if (cachedData && now - cachedData.timestamp < CACHE_EXPIRATION) {
        console.log(
          `Using cached unread count for user ${userId}: ${cachedData.count}`
        );
        return c.json({
          success: true,
          count: cachedData.count,
          cached: true,
        });
      }

      // If no valid cache, fetch from database
      console.log(`Fetching fresh unread count for user ${userId}`);
      const count = await notificationService.getUnreadNotificationCount(
        userId
      );

      // Update cache
      unreadCountCache.set(userId, { count, timestamp: now });

      return c.json({
        success: true,
        count,
        cached: false,
      });
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting unread notification count",
      });
    }
  }

  // Mark notification as read
  async markNotificationAsRead(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const userId = Number(user.id);
      const { id } = c.req.param();

      const notificationId = parseInt(id);
      if (isNaN(notificationId)) {
        throw new HTTPException(400, { message: "Invalid notification ID" });
      }

      const notification = await notificationService.markNotificationAsRead(
        userId,
        notificationId
      );

      // Invalidate cache for this user
      this.invalidateUnreadCountCache(userId);

      return c.json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while marking notification as read",
      });
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const userId = Number(user.id);

      const count = await notificationService.markAllNotificationsAsRead(
        userId
      );

      // Update cache to show 0 unread notifications
      unreadCountCache.set(userId, { count: 0, timestamp: Date.now() });

      return c.json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while marking all notifications as read",
      });
    }
  }

  // Delete notification
  async deleteNotification(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const userId = Number(user.id);
      const { id } = c.req.param();

      const notificationId = parseInt(id);
      if (isNaN(notificationId)) {
        throw new HTTPException(400, { message: "Invalid notification ID" });
      }

      await notificationService.deleteNotification(userId, notificationId);

      // Invalidate cache for this user
      this.invalidateUnreadCountCache(userId);

      return c.json({
        success: true,
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while deleting the notification",
      });
    }
  }

  // Get notification preferences
  async getNotificationPreferences(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const userId = Number(user.id);

      const preferences =
        await notificationService.getUserNotificationPreferences(userId);

      return c.json({
        success: true,
        preferences,
      });
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while getting notification preferences",
      });
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const preferences = await c.req.json();

      const updatedPreferences =
        await notificationService.updateNotificationPreferences(
          Number(user.id),
          preferences
        );

      return c.json({
        success: true,
        preferences: updatedPreferences,
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while updating notification preferences",
      });
    }
  }

  // Helper method to invalidate the unread count cache for a user
  private invalidateUnreadCountCache(userId: number): void {
    unreadCountCache.delete(userId);
    console.log(`Invalidated unread count cache for user ${userId}`);
  }
}
