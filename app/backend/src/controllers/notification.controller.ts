import type { Context } from "hono";
import { NotificationService } from "../services/notification.service";
import { HTTPException } from "hono/http-exception";
import { JWTPayload } from "../types";

// Create an instance of the notification service
const notificationService = new NotificationService();

export class NotificationController {
  // Get user's notifications
  async getUserNotifications(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      const { page, limit } = c.req.query();
      
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      
      const result = await notificationService.getUserNotifications(user.id, {
        page: pageNum,
        limit: limitNum,
      });
      
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
  
  // Get unread notification count
  async getUnreadNotificationCount(c: Context) {
    try {
      const user = c.get("user") as JWTPayload;
      
      const count = await notificationService.getUnreadNotificationCount(user.id);
      
      return c.json({
        success: true,
        count,
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
      const { id } = c.req.param();
      
      const notificationId = parseInt(id);
      if (isNaN(notificationId)) {
        throw new HTTPException(400, { message: "Invalid notification ID" });
      }
      
      const notification = await notificationService.markNotificationAsRead(
        user.id,
        notificationId
      );
      
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
      
      const count = await notificationService.markAllNotificationsAsRead(user.id);
      
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
      const { id } = c.req.param();
      
      const notificationId = parseInt(id);
      if (isNaN(notificationId)) {
        throw new HTTPException(400, { message: "Invalid notification ID" });
      }
      
      await notificationService.deleteNotification(user.id, notificationId);
      
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
      
      const preferences = await notificationService.getUserNotificationPreferences(user.id);
      
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
      
      const updatedPreferences = await notificationService.updateNotificationPreferences(
        user.id,
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
}
