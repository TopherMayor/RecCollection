import { Hono } from "hono";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

// Create a new router
const router = new Hono();

// Create an instance of the notification controller
const notificationController = new NotificationController();

// All routes require authentication
router.use("*", authenticate);

// Get user's notifications
router.get("/", (c) => notificationController.getUserNotifications(c));

// Get unread notification count
router.get("/unread-count", (c) => notificationController.getUnreadNotificationCount(c));

// Mark notification as read
router.patch("/:id/read", (c) => notificationController.markNotificationAsRead(c));

// Mark all notifications as read
router.patch("/read-all", (c) => notificationController.markAllNotificationsAsRead(c));

// Delete notification
router.delete("/:id", (c) => notificationController.deleteNotification(c));

// Get notification preferences
router.get("/preferences", (c) => notificationController.getNotificationPreferences(c));

// Update notification preferences
router.patch("/preferences", (c) => notificationController.updateNotificationPreferences(c));

export { router as notificationRoutes };
