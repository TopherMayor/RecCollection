import { Hono } from "hono";
import { NotificationController } from "../controllers/notification.controller.ts";
import { authenticate } from "../middleware/auth.ts";
import { rateLimit, readRateLimit } from "../middleware/rate-limit.ts";

// Create a new router
const router = new Hono();

// Create an instance of the notification controller
const notificationController = new NotificationController();

// All routes require authentication
router.use("*", authenticate);

// Get user's notifications - apply read rate limit
router.get("/", readRateLimit, (c) =>
  notificationController.getUserNotifications(c)
);

// Get unread notification count - apply read rate limit but with higher limits
// This endpoint is called frequently from the frontend
router.get("/unread-count", readRateLimit, (c) =>
  notificationController.getUnreadNotificationCount(c)
);

// Mark notification as read - apply standard rate limit
router.patch("/:id/read", rateLimit, (c) =>
  notificationController.markNotificationAsRead(c)
);

// Mark all notifications as read - apply standard rate limit
router.patch("/read-all", rateLimit, (c) =>
  notificationController.markAllNotificationsAsRead(c)
);

// Delete notification - apply standard rate limit
router.delete("/:id", rateLimit, (c) =>
  notificationController.deleteNotification(c)
);

// Get notification preferences - apply read rate limit
router.get("/preferences", readRateLimit, (c) =>
  notificationController.getNotificationPreferences(c)
);

// Update notification preferences - apply standard rate limit
router.patch("/preferences", rateLimit, (c) =>
  notificationController.updateNotificationPreferences(c)
);

export { router as notificationRoutes };
