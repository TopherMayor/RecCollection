import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";
import NotificationList from "./NotificationList";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.notifications.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.notifications.markAllAsRead();
      if (response.success) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch unread count on mount and when authenticated status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();

      // Set up polling for new notifications (every 30 seconds)
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleNotifications}
        className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-indigo-600 hover:text-indigo-900"
                >
                  {loading ? "Marking..." : "Mark all as read"}
                </button>
              )}
            </div>
            <NotificationList onNotificationRead={fetchUnreadCount} />
          </div>
        </div>
      )}
    </div>
  );
}
