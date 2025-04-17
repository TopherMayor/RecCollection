import { useState, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

interface Recipe {
  id: number;
  title: string;
  description: string;
  userId: number;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  sourceUrl?: string;
  sourceType?: string;
  isPrivate?: boolean;
  user?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<
    "all" | "mine" | "others" | "following"
  >("all");
  const { user } = useAuth();

  // Memoize the fetch recipes function
  const fetchRecipes = useCallback(async () => {
    try {
      console.log("Fetching recipes...");
      setLoading(true);
      setError(null);

      // First check if the API is accessible
      try {
        console.log("Trying direct fetch...");
        const response = await fetch("/api/recipes", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        });

        console.log("Direct fetch response status:", response.status);
        const data = await response.json();
        console.log("Direct fetch API response:", data);

        if (data && data.success === false) {
          console.error("API returned error:", data.error);
          throw new Error(data.error || "Failed to fetch recipes");
        } else if (data && data.success && Array.isArray(data.recipes)) {
          console.log("Setting recipes from direct fetch");
          if (data.recipes.length === 0) {
            console.log("No recipes found");
            setRecipes([]);
            setFilteredRecipes([]);
          } else {
            // Process recipes to ensure proper image handling
            const recipesWithImages = data.recipes.map((recipe: Recipe) => {
              // Don't modify the image URLs if they exist
              return recipe;
            });
            setRecipes(recipesWithImages);
            setFilteredRecipes(recipesWithImages);
          }
        } else {
          console.error("Invalid response format:", data);
          throw new Error("Invalid response format");
        }
      } catch (directErr) {
        console.error("Direct fetch error:", directErr);
        // Fall back to using the API client
        try {
          console.log("Trying API client...");
          const data = await api.recipes.getAll();
          console.log("API client response:", data);

          if (data && data.recipes) {
            console.log("Setting recipes from API client");
            // Process recipes to ensure proper image handling
            const recipesWithImages = data.recipes.map((recipe: Recipe) => {
              // Don't modify the image URLs if they exist
              return recipe;
            });
            setRecipes(recipesWithImages);
            setFilteredRecipes(recipesWithImages);
          } else {
            console.error("Invalid API response format:", data);
            throw new Error("Invalid API response format");
          }
        } catch (apiErr) {
          console.error("API client error:", apiErr);
          setError("Failed to connect to the server. Please try again later.");
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error fetching recipes:", err);
      setError(error.message || "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the fetch following recipes function
  const fetchFollowingRecipes = useCallback(async () => {
    try {
      console.log("Fetching recipes from followed users...");
      setLoading(true);
      setError(null);

      try {
        const data = await api.recipes.getFollowing();
        console.log("Following recipes API response:", data);

        if (data && data.recipes) {
          console.log("Setting recipes from followed users");
          // Process recipes to ensure proper image handling
          const recipesWithImages = data.recipes.map((recipe: Recipe) => {
            // Don't modify the image URLs if they exist
            return recipe;
          });
          setRecipes(recipesWithImages);
          setFilteredRecipes(recipesWithImages);
        } else {
          console.error("Invalid API response format:", data);
          throw new Error("Invalid API response format");
        }
      } catch (apiErr) {
        console.error("API client error:", apiErr);
        setError(
          "Failed to fetch recipes from users you follow. Please try again later."
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error fetching following recipes:", err);
      setError(
        error.message || "Failed to fetch recipes from users you follow"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recipes when component mounts or filter mode changes
  useEffect(() => {
    // Fetch appropriate recipes based on filter mode
    if (filterMode === "following" && user) {
      fetchFollowingRecipes();
    } else {
      fetchRecipes();
    }
  }, [filterMode, user, fetchRecipes, fetchFollowingRecipes]);

  // Filter recipes when filterMode or recipes change
  useEffect(() => {
    if (!recipes.length) return;

    // If we're already in the "following" mode, don't filter again
    // since the API already returned the filtered recipes
    if (filterMode === "following") {
      setFilteredRecipes(recipes);
      return;
    }

    if (filterMode === "all") {
      setFilteredRecipes(recipes);
    } else if (filterMode === "mine" && user) {
      const myRecipes = recipes.filter(
        (recipe) => recipe.user?.username === user.username
      );
      setFilteredRecipes(myRecipes);
    } else if (filterMode === "others" && user) {
      const othersRecipes = recipes.filter(
        (recipe) => recipe.user?.username !== user.username
      );
      setFilteredRecipes(othersRecipes);
    }
  }, [filterMode, recipes, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Latest Recipes</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          {user && (
            <div className="flex gap-2">
              <Link
                to="/app/create"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Recipe
              </Link>
              <Link
                to="/app/import"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Import Recipe
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg self-end sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => setFilterMode("all")}
              className={`h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                filterMode === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Recipes
            </button>
            <button
              onClick={() => setFilterMode("mine")}
              className={`h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                filterMode === "mine"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              My Recipes
            </button>
            <button
              onClick={() => setFilterMode("following")}
              className={`h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                filterMode === "following"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Following
            </button>
            <button
              onClick={() => setFilterMode("others")}
              className={`h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                filterMode === "others"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Others' Recipes
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading recipes...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading recipes</p>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Please try refreshing the page or check your network connection.
          </p>
        </div>
      )}

      {!loading && recipes.length === 0 && !error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>No recipes found. Be the first to add a recipe!</p>
        </div>
      )}

      {!loading && filteredRecipes.length === 0 && recipes.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>
            {filterMode === "mine"
              ? "You haven't created any recipes yet. Click 'Create Recipe' to get started!"
              : filterMode === "others"
              ? "No recipes from other users found."
              : filterMode === "following"
              ? "No recipes from users you follow. Try following some users to see their recipes!"
              : "No recipes found with the current filter."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            to={`/app/recipe/${recipe.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
          >
            <div className="relative">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                {recipe.imageUrl ||
                recipe.thumbnailUrl ||
                recipe.thumbnailPath ? (
                  <img
                    src={
                      recipe.imageUrl ||
                      recipe.thumbnailUrl ||
                      (recipe.thumbnailPath
                        ? recipe.thumbnailPath.startsWith("http")
                          ? recipe.thumbnailPath
                          : recipe.thumbnailPath
                        : undefined)
                    }
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

              {recipe.difficultyLevel && (
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recipe.difficultyLevel.toLowerCase() === "easy"
                        ? "bg-green-100 text-green-800"
                        : recipe.difficultyLevel.toLowerCase() === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {recipe.difficultyLevel}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {recipe.description}
              </p>

              {(recipe.prepTime || recipe.cookingTime) && (
                <div className="flex space-x-4 mb-4 text-sm text-gray-500">
                  {recipe.prepTime && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Prep: {recipe.prepTime} min</span>
                    </div>
                  )}

                  {recipe.cookingTime && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                        />
                      </svg>
                      <span>Cook: {recipe.cookingTime} min</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <img
                    src={
                      recipe.user?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${
                        recipe.user?.displayName ||
                        recipe.user?.username ||
                        "Unknown"
                      }&background=random`
                    }
                    alt={
                      recipe.user?.displayName ||
                      recipe.user?.username ||
                      "Unknown"
                    }
                    className="w-5 h-5 rounded-full mr-2"
                  />
                  By{" "}
                  {recipe.user?.displayName ||
                    recipe.user?.username ||
                    "Unknown"}
                </span>
                <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Home);
