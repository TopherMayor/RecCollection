import { useState, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  recipeId?: number;
}

interface NotificationListProps {
  onNotificationRead?: () => void;
}

function NotificationList({ onNotificationRead }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch notifications - memoized to prevent unnecessary re-renders
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.notifications.getAll(pageNum, 10);

      if (response.success) {
        if (pageNum === 1) {
          setNotifications(response.notifications || []);
        } else {
          setNotifications((prev) => [
            ...prev,
            ...(response.notifications || []),
          ]);
        }

        setHasMore(
          response.pagination &&
            response.pagination.page < response.pagination.totalPages
        );
      } else {
        // Handle case where success is false but no error was thrown
        throw new Error(response.message || "Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read - memoized to prevent unnecessary re-renders
  const markAsRead = useCallback(
    async (id: number) => {
      try {
        const response = await api.notifications.markAsRead(id);

        if (response.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === id
                ? { ...notification, read: true }
                : notification
            )
          );

          // Notify parent component
          if (onNotificationRead) {
            onNotificationRead();
          }
        } else {
          throw new Error(
            response.message || "Failed to mark notification as read"
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        // Show error in UI
        setError(
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read"
        );
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    },
    [onNotificationRead]
  );

  // Delete notification - memoized to prevent unnecessary re-renders
  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        const response = await api.notifications.delete(id);

        if (response.success) {
          // Update local state
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
          );

          // Notify parent component
          if (onNotificationRead) {
            onNotificationRead();
          }
        } else {
          throw new Error(response.message || "Failed to delete notification");
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        // Show error in UI
        setError(
          error instanceof Error
            ? error.message
            : "Failed to delete notification"
        );
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    },
    [onNotificationRead]
  );

  // Load more notifications - memoized to prevent unnecessary re-renders
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  // Get notification link based on type
  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "follow":
        return notification.sender
          ? `/app/profile/${notification.sender.username}`
          : "#";
      case "like":
      case "comment":
      case "share":
        return notification.recipeId
          ? `/app/recipes/${notification.recipeId}`
          : "#";
      case "mention":
        return notification.recipeId
          ? `/app/recipes/${notification.recipeId}`
          : "#";
      case "recipe_import":
        return notification.recipeId
          ? `/app/recipes/${notification.recipeId}`
          : "#";
      default:
        return "#";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        );
      case "like":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "comment":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "share":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-indigo-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        );
      case "mention":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "recipe_import":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-h-96 overflow-y-auto">
      {loading && page === 1 ? (
        <div className="py-4 text-center text-gray-500">
          Loading notifications...
        </div>
      ) : error ? (
        <div className="py-4 text-center text-red-500">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="py-4 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <Link
                  to={getNotificationLink(notification)}
                  className="flex items-start space-x-3"
                  onClick={() =>
                    !notification.read && markAsRead(notification.id)
                  }
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Delete notification"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="py-2 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-900"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(NotificationList);
