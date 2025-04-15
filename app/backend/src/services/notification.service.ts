import { db } from "../db";
import { notifications, notificationPreferences, userContacts, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { EmailService } from "./email.service";
import { SMSService } from "./sms.service";

// Define notification types
export type NotificationType = 
  | "follow" 
  | "like" 
  | "comment" 
  | "share" 
  | "mention" 
  | "recipe_import";

// Define notification data structure
export interface NotificationData {
  userId: number;
  type: NotificationType;
  senderId?: number;
  recipeId?: number;
  message: string;
  data?: Record<string, any>;
}

// Define notification preference structure
export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  shareNotifications: boolean;
}

// Define pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
}

// Notification service
export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
  }

  // Create a notification
  async createNotification(data: NotificationData): Promise<any> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, data.userId),
      });

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Check user's notification preferences
      const preferences = await this.getUserNotificationPreferences(data.userId);
      
      // Check if this type of notification is enabled
      const notificationTypeEnabled = this.isNotificationTypeEnabled(preferences, data.type);
      
      if (!notificationTypeEnabled) {
        console.log(`Notification type ${data.type} is disabled for user ${data.userId}`);
        return null;
      }

      // Create the notification in the database
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: data.userId,
          type: data.type,
          senderId: data.senderId,
          recipeId: data.recipeId,
          message: data.message,
          data: data.data ? data.data : null,
          createdAt: new Date(),
        })
        .returning();

      // Send email notification if enabled
      if (preferences.emailNotifications) {
        await this.sendEmailNotification(data.userId, data);
      }

      // Send SMS notification if enabled
      if (preferences.smsNotifications) {
        await this.sendSMSNotification(data.userId, data);
      }

      // Send push notification if enabled (to be implemented)
      if (preferences.pushNotifications) {
        // await this.sendPushNotification(data.userId, data);
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "An error occurred while creating the notification",
      });
    }
  }

  // Get user's notification preferences
  async getUserNotificationPreferences(userId: number): Promise<NotificationPreferences> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Get user's notification preferences
      let preferences = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, userId),
      });

      // If preferences don't exist, create default preferences
      if (!preferences) {
        const [newPreferences] = await db
          .insert(notificationPreferences)
          .values({
            userId,
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            followNotifications: true,
            likeNotifications: true,
            commentNotifications: true,
            shareNotifications: true,
            updatedAt: new Date(),
          })
          .returning();

        preferences = newPreferences;
      }

      return {
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        smsNotifications: preferences.smsNotifications,
        followNotifications: preferences.followNotifications,
        likeNotifications: preferences.likeNotifications,
        commentNotifications: preferences.commentNotifications,
        shareNotifications: preferences.shareNotifications,
      };
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

  // Update user's notification preferences
  async updateNotificationPreferences(
    userId: number,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Check if preferences exist
      const existingPreferences = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, userId),
      });

      if (!existingPreferences) {
        // Create new preferences
        const [newPreferences] = await db
          .insert(notificationPreferences)
          .values({
            userId,
            ...preferences,
            updatedAt: new Date(),
          })
          .returning();

        return {
          emailNotifications: newPreferences.emailNotifications,
          pushNotifications: newPreferences.pushNotifications,
          smsNotifications: newPreferences.smsNotifications,
          followNotifications: newPreferences.followNotifications,
          likeNotifications: newPreferences.likeNotifications,
          commentNotifications: newPreferences.commentNotifications,
          shareNotifications: newPreferences.shareNotifications,
        };
      }

      // Update existing preferences
      const [updatedPreferences] = await db
        .update(notificationPreferences)
        .set({
          ...preferences,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, userId))
        .returning();

      return {
        emailNotifications: updatedPreferences.emailNotifications,
        pushNotifications: updatedPreferences.pushNotifications,
        smsNotifications: updatedPreferences.smsNotifications,
        followNotifications: updatedPreferences.followNotifications,
        likeNotifications: updatedPreferences.likeNotifications,
        commentNotifications: updatedPreferences.commentNotifications,
        shareNotifications: updatedPreferences.shareNotifications,
      };
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

  // Get user's notifications
  async getUserNotifications(
    userId: number,
    { page = 1, limit = 10 }: PaginationParams
  ): Promise<{
    notifications: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const totalCount = await db
        .select({ count: db.fn.count() })
        .from(notifications)
        .where(eq(notifications.userId, userId));

      const total = Number(totalCount[0].count);
      const totalPages = Math.ceil(total / limit);

      // Get notifications
      const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.createdAt)],
        limit,
        offset,
        with: {
          sender: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return {
        notifications: userNotifications,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };
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

  // Mark notification as read
  async markNotificationAsRead(userId: number, notificationId: number): Promise<any> {
    try {
      // Check if notification exists and belongs to the user
      const notification = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ),
      });

      if (!notification) {
        throw new HTTPException(404, { message: "Notification not found" });
      }

      // Mark as read
      const [updatedNotification] = await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        )
        .returning();

      return updatedNotification;
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
  async markAllNotificationsAsRead(userId: number): Promise<number> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Mark all as read
      const result = await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        );

      return result.rowCount || 0;
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
  async deleteNotification(userId: number, notificationId: number): Promise<any> {
    try {
      // Check if notification exists and belongs to the user
      const notification = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ),
      });

      if (!notification) {
        throw new HTTPException(404, { message: "Notification not found" });
      }

      // Delete notification
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );

      return { success: true };
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

  // Get unread notification count
  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new HTTPException(404, { message: "User not found" });
      }

      // Get count
      const result = await db
        .select({ count: db.fn.count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        );

      return Number(result[0].count);
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

  // Private method to check if notification type is enabled
  private isNotificationTypeEnabled(
    preferences: NotificationPreferences,
    type: NotificationType
  ): boolean {
    switch (type) {
      case "follow":
        return preferences.followNotifications;
      case "like":
        return preferences.likeNotifications;
      case "comment":
        return preferences.commentNotifications;
      case "share":
        return preferences.shareNotifications;
      case "mention":
        return preferences.commentNotifications; // Use comment preferences for mentions
      case "recipe_import":
        return true; // Always notify for recipe imports
      default:
        return true;
    }
  }

  // Private method to send email notification
  private async sendEmailNotification(
    userId: number,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Get user's email
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          email: true,
          displayName: true,
          username: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get sender info if available
      let senderName = "Someone";
      if (notification.senderId) {
        const sender = await db.query.users.findFirst({
          where: eq(users.id, notification.senderId),
          columns: {
            displayName: true,
            username: true,
          },
        });

        if (sender) {
          senderName = sender.displayName || sender.username;
        }
      }

      // Prepare email content based on notification type
      let subject = "RecCollection Notification";
      let content = notification.message;

      switch (notification.type) {
        case "follow":
          subject = `${senderName} started following you on RecCollection`;
          break;
        case "like":
          subject = `${senderName} liked your recipe on RecCollection`;
          break;
        case "comment":
          subject = `${senderName} commented on your recipe on RecCollection`;
          break;
        case "share":
          subject = `${senderName} shared your recipe from RecCollection`;
          break;
        case "mention":
          subject = `${senderName} mentioned you on RecCollection`;
          break;
        case "recipe_import":
          subject = "Your recipe was successfully imported to RecCollection";
          break;
      }

      // Send the email
      await this.emailService.sendEmail({
        to: user.email,
        subject,
        text: content,
        html: `<p>${content}</p>`,
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
      // Don't throw, just log the error
    }
  }

  // Private method to send SMS notification
  private async sendSMSNotification(
    userId: number,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Get user's phone number
      const userContact = await db.query.userContacts.findFirst({
        where: eq(userContacts.userId, userId),
      });

      if (!userContact || !userContact.phoneNumber || !userContact.phoneVerified) {
        // Skip if no verified phone number
        return;
      }

      // Get sender info if available
      let senderName = "Someone";
      if (notification.senderId) {
        const sender = await db.query.users.findFirst({
          where: eq(users.id, notification.senderId),
          columns: {
            displayName: true,
            username: true,
          },
        });

        if (sender) {
          senderName = sender.displayName || sender.username;
        }
      }

      // Prepare SMS content (keep it short)
      let content = notification.message;
      if (content.length > 100) {
        content = content.substring(0, 97) + "...";
      }

      // Add prefix based on notification type
      switch (notification.type) {
        case "follow":
          content = `RecCollection: ${senderName} started following you. ${content}`;
          break;
        case "like":
          content = `RecCollection: ${senderName} liked your recipe. ${content}`;
          break;
        case "comment":
          content = `RecCollection: ${senderName} commented on your recipe. ${content}`;
          break;
        case "share":
          content = `RecCollection: ${senderName} shared your recipe. ${content}`;
          break;
        case "mention":
          content = `RecCollection: ${senderName} mentioned you. ${content}`;
          break;
        case "recipe_import":
          content = `RecCollection: Recipe import complete. ${content}`;
          break;
      }

      // Send the SMS
      await this.smsService.sendSMS({
        to: userContact.phoneNumber,
        message: content,
      });
    } catch (error) {
      console.error("Error sending SMS notification:", error);
      // Don't throw, just log the error
    }
  }
}
