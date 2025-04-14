import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  orderIndex: number;
  notes?: string;
}

interface Instruction {
  id: number;
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  cookingTime?: number;
  prepTime?: number;
  servingSize?: number;
  difficultyLevel?: string;
  imageUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourceType?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userId?: number; // Added for permission checks
  user: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  categories?: { id: number; name: string }[];
  tags?: { id: number; name: string }[];
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeLoaded, setRecipeLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "ingredients" | "instructions" | "notes"
  >("ingredients");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    // Only fetch if authenticated and we have an ID
    if (!id || authLoading || !isAuthenticated) return;

    const fetchRecipe = async () => {
      try {
        console.log("Fetching recipe with ID:", id);
        setLoading(true);

        // Try direct fetch first to see the exact error
        try {
          console.log("Trying direct fetch for recipe...");
          const response = await fetch(`/api/recipes/${id}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          console.log("Direct fetch response status:", response.status);

          if (response.status === 404) {
            console.error("Recipe not found");
            setError(
              "Recipe not found. It may have been deleted or never existed."
            );
            setLoading(false);
            return;
          } else if (response.status === 500) {
            console.error("Server error when fetching recipe");
            setError("Error loading recipe. Please try again later.");
            setLoading(false);
            return;
          }

          const data = await response.json();
          console.log("Recipe data from direct fetch:", data);

          // Check if the response indicates an error
          if (data.success === false) {
            console.error("API returned error:", data.error);
            setError(data.error || "Failed to load recipe");
            setLoading(false);
            return;
          }

          // Handle both response formats (direct recipe object or {success, recipe} format)
          const recipeData = data.recipe || data;

          if (recipeData) {
            console.log("Setting recipe data:", recipeData);
            setRecipe(recipeData);
            setRecipeLoaded(true);
            // Check if current user is the recipe owner
            if (user && recipeData.user && user.id === recipeData.user.id) {
              setIsOwner(true);
            }
            setError(null);
            setLoading(false);
          } else {
            throw new Error("Invalid recipe data format");
          }
        } catch (directErr) {
          console.error("Direct fetch error:", directErr);
          // Fall back to API client
          try {
            const data = await api.recipes.getById(parseInt(id));
            console.log("Recipe data from API client:", data);

            if (data && data.recipe) {
              setRecipe(data.recipe);
              setRecipeLoaded(true);
              // Check if current user is the recipe owner
              if (user && data.recipe.user && user.id === data.recipe.user.id) {
                setIsOwner(true);
              }
              setError(null);
              setLoading(false);
            } else if (data) {
              setRecipe(data);
              setRecipeLoaded(true);
              // Check if current user is the recipe owner
              if (user && data.user && user.id === data.user.id) {
                setIsOwner(true);
              }
              setError(null);
              setLoading(false);
            } else {
              console.error("Invalid recipe data format:", data);
              setError("Recipe not found or invalid data format");
              setLoading(false);
            }
          } catch (apiErr: any) {
            console.error("API client error:", apiErr);

            // Check if this is an authentication error
            if (
              apiErr.message?.includes("unauthorized") ||
              apiErr.message?.includes("Unauthorized")
            ) {
              console.log("Authentication error, redirecting to login");
              navigate("/login");
            } else {
              setError(apiErr.message || "Failed to fetch recipe details");
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, authLoading, isAuthenticated, navigate]);

  // Function to format time (minutes to hours and minutes)
  const formatTime = (minutes?: number) => {
    if (!minutes) return "N/A";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours} hr${hours > 1 ? "s" : ""} ${
        mins > 0 ? `${mins} min${mins > 1 ? "s" : ""}` : ""
      }`;
    }

    return `${mins} min${mins > 1 ? "s" : ""}`;
  };

  // Function to render difficulty badge
  const renderDifficultyBadge = (level?: string) => {
    if (!level) return null;

    const colorMap: Record<string, string> = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800",
    };

    const color = colorMap[level.toLowerCase()] || "bg-gray-100 text-gray-800";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  // Function to handle recipe deletion
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      const response = await api.recipes.deleteById(parseInt(id));

      if (response && response.success) {
        // Show success message and redirect
        alert("Recipe deleted successfully");
        navigate("/app/recipes");
      } else {
        // Show error message
        setError(
          response?.message || "Failed to delete recipe. Please try again."
        );
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setError("An error occurred while deleting the recipe.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading recipe</p>
          <p>{error}</p>
          <p className="mt-2">
            <Link
              to="/app/recipes"
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to recipes
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Recipe not found</p>
          <p>
            The recipe you're looking for doesn't exist or has been removed.
          </p>
          <p className="mt-2">
            <Link
              to="/app/recipes"
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to recipes
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Recipe
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this recipe? This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                    Deleting...
                  </>
                ) : (
                  "Delete Recipe"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/app/recipes"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to recipes
        </Link>
      </div>

      {/* Recipe header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative">
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  // If image fails to load, replace with fallback
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = `https://picsum.photos/seed/${recipe.id}/800/600`;
                }}
              />
            ) : recipe.thumbnailUrl ? (
              <img
                src={recipe.thumbnailUrl}
                alt={recipe.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  // If thumbnail URL fails to load, replace with fallback
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = `https://picsum.photos/seed/${recipe.id}/800/600`;
                }}
              />
            ) : recipe.thumbnailPath ? (
              <img
                src={`${import.meta.env.VITE_API_URL || ""}${
                  recipe.thumbnailPath
                }`}
                alt={recipe.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  // If thumbnail fails to load, replace with fallback
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = `https://picsum.photos/seed/${recipe.id}/800/600`;
                }}
              />
            ) : (
              <svg
                className="w-16 h-16 text-gray-400"
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

          {/* Source badge */}
          {recipe.sourceType && (
            <div className="absolute top-4 right-4">
              <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                {recipe.sourceType === "instagram"
                  ? "Instagram"
                  : recipe.sourceType === "tiktok"
                  ? "TikTok"
                  : recipe.sourceType === "manual"
                  ? "Manual"
                  : recipe.sourceType}
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
              {recipe.title}
            </h1>

            <div className="flex items-center space-x-2">
              {isOwner && (
                <div className="flex space-x-2">
                  <Link
                    to={`/app/edit/${recipe.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Recipe
                  </Link>

                  <button
                    onClick={handleDeleteClick}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
              {renderDifficultyBadge(recipe.difficultyLevel)}

              {recipe.isPrivate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Private
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-6">{recipe.description}</p>

          <div className="flex flex-wrap -mx-2 mb-6">
            <div className="w-full sm:w-1/3 px-2 mb-4 sm:mb-0">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Prep Time</div>
                <div className="font-medium">{formatTime(recipe.prepTime)}</div>
              </div>
            </div>
            <div className="w-full sm:w-1/3 px-2 mb-4 sm:mb-0">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Cooking Time</div>
                <div className="font-medium">
                  {formatTime(recipe.cookingTime)}
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/3 px-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Servings</div>
                <div className="font-medium">{recipe.servingSize || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center mr-6">
              <img
                src={
                  recipe.user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${
                    recipe.user.displayName || recipe.user.username
                  }&background=random`
                }
                alt={recipe.user.displayName || recipe.user.username}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>By {recipe.user.displayName || recipe.user.username}</span>
            </div>
            <div>
              {new Date(recipe.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe content tabs */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "ingredients"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab("instructions")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "instructions"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Instructions
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "notes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Notes & Substitutions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "ingredients" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ingredients
              </h2>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="space-y-3">
                  {recipe.ingredients
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((ingredient) => (
                      <li key={ingredient.id} className="flex items-start">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 mr-3 mt-0.5">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <div>
                          <span className="font-medium">
                            {ingredient.quantity && ingredient.unit
                              ? `${ingredient.quantity} ${ingredient.unit} `
                              : ingredient.quantity
                              ? `${ingredient.quantity} `
                              : ""}
                            {ingredient.name}
                          </span>
                          {ingredient.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {ingredient.notes}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  No ingredients listed for this recipe.
                </p>
              )}
            </div>
          )}

          {activeTab === "instructions" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Instructions
              </h2>
              {recipe.instructions && recipe.instructions.length > 0 ? (
                <ol className="space-y-6">
                  {recipe.instructions
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((instruction) => (
                      <li key={instruction.id} className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500 text-white font-bold">
                            {instruction.stepNumber}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800">
                            {instruction.description}
                          </p>
                          {instruction.imageUrl && (
                            <img
                              src={instruction.imageUrl}
                              alt={`Step ${instruction.stepNumber}`}
                              className="mt-3 rounded-lg max-h-64 object-cover"
                            />
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              ) : (
                <p className="text-gray-500 italic">
                  No instructions provided for this recipe.
                </p>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Notes & Substitutions
              </h2>

              {/* This is a placeholder since we don't have notes in the schema yet */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Notes and substitutions will be available in a future
                      update. Stay tuned!
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Common Substitutions
              </h3>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>
                  If you don't have fresh herbs, use 1/3 the amount of dried
                  herbs.
                </li>
                <li>
                  Buttermilk can be substituted with 1 cup milk + 1 tablespoon
                  lemon juice or vinegar.
                </li>
                <li>
                  For each cup of all-purpose flour, you can use 1 cup + 2 tbsp
                  cake flour.
                </li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Dietary Modifications
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium">Gluten-Free:</span> Substitute
                  regular flour with a 1:1 gluten-free flour blend.
                </li>
                <li>
                  <span className="font-medium">Vegan:</span> Replace eggs with
                  flax eggs (1 tbsp ground flaxseed + 3 tbsp water per egg).
                </li>
                <li>
                  <span className="font-medium">Dairy-Free:</span> Use
                  plant-based milk and butter alternatives.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tags and categories */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Categories & Tags
          </h2>

          {recipe.categories && recipe.categories.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(!recipe.categories || recipe.categories.length === 0) &&
            (!recipe.tags || recipe.tags.length === 0) && (
              <p className="text-gray-500 italic">
                No categories or tags for this recipe.
              </p>
            )}
        </div>
      </div>

      {/* Source link */}
      {recipe.sourceUrl && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Original Source
            </h2>
            <div className="mb-4">
              {recipe.sourceType && (
                <div className="mb-2">
                  <span className="font-medium">Source Type:</span>{" "}
                  <span className="capitalize">{recipe.sourceType}</span>
                </div>
              )}
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                View original recipe
                <svg
                  className="w-5 h-5 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
