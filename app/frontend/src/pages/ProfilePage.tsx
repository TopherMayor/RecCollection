import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FollowButton from "../components/FollowButton";

interface UserProfile {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  stats: {
    recipeCount: number;
    likeCount: number;
    followerCount: number;
    followingCount: number;
  };
}

interface Recipe {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  user?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const response = await fetch(`/api/auth/profile/${username}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await response.json();
        setProfile(profileData);

        // Check if this is the current user's profile
        if (currentUser && currentUser.username === username) {
          setIsCurrentUser(true);
        }

        // Fetch user's recipes
        const recipesResponse = await fetch(
          `/api/recipes?userId=${profileData.id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!recipesResponse.ok) {
          throw new Error("Failed to fetch user recipes");
        }

        const recipesData = await recipesResponse.json();
        setRecipes(recipesData.recipes || []);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading profile</p>
          <p>{error || "User not found"}</p>
        </div>
        <Link to="/app/recipes" className="text-blue-600 hover:underline">
          &larr; Back to recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>
        <div className="px-6 py-4 relative">
          <div className="absolute -top-16 left-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || profile.username}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-500">
                  {(profile.displayName || profile.username)
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-16 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {profile.displayName || profile.username}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
            </div>

            {isCurrentUser ? (
              <Link
                to="/app/profile/edit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
            ) : (
              <FollowButton username={profile.username} size="md" />
            )}
          </div>

          {profile.bio && (
            <div className="mt-4">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}

          <div className="mt-6 flex space-x-8">
            <div>
              <span className="text-2xl font-bold">
                {profile.stats.recipeCount}
              </span>
              <p className="text-gray-600">Recipes</p>
            </div>
            <div>
              <span className="text-2xl font-bold">
                {profile.stats.likeCount}
              </span>
              <p className="text-gray-600">Likes</p>
            </div>
            <div>
              <span className="text-2xl font-bold">
                {profile.stats.followerCount}
              </span>
              <p className="text-gray-600">Followers</p>
            </div>
            <div>
              <span className="text-2xl font-bold">
                {profile.stats.followingCount}
              </span>
              <p className="text-gray-600">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes section */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          {isCurrentUser
            ? "Your Recipes"
            : `${profile.displayName || profile.username}'s Recipes`}
        </h2>

        {recipes.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-600">
              {isCurrentUser
                ? "You haven't created any recipes yet."
                : `${
                    profile.displayName || profile.username
                  } hasn't created any recipes yet.`}
            </p>
            {isCurrentUser && (
              <Link
                to="/app/create"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Your First Recipe
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/app/recipe/${recipe.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with fallback
                          e.currentTarget.onerror = null; // Prevent infinite loop
                          e.currentTarget.src = `https://picsum.photos/seed/${recipe.id}/400/300`;
                        }}
                      />
                    ) : (
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
