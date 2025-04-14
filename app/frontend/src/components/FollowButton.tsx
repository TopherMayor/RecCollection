import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface FollowButtonProps {
  username: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FollowButton({
  username,
  initialIsFollowing = false,
  onFollowChange,
  className = '',
  size = 'md',
}: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the current user is following the target user
  useEffect(() => {
    if (!isAuthenticated || !user || user.username === username) return;

    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follow/${username}/is-following`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
          if (onFollowChange) onFollowChange(data.isFollowing);
        }
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    };

    checkFollowStatus();
  }, [username, user, isAuthenticated, onFollowChange]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/follow/${username}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsFollowing(!isFollowing);
        if (onFollowChange) onFollowChange(!isFollowing);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      setError('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the button if the user is not authenticated or is viewing their own profile
  if (!isAuthenticated || (user && user.username === username)) {
    return null;
  }

  // Button size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div>
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`${
          isFollowing
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          sizeClasses[size]
        } ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </span>
        ) : isFollowing ? (
          'Unfollow'
        ) : (
          'Follow'
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
