import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";

interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  user?: {
    id: number;
    username: string;
  };
}

interface BatchDeleteResult {
  id: number;
  success: boolean;
  error?: string;
}

export default function SimpleRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    // Clear selections when exiting selection mode
    if (isSelectionMode) {
      setSelectedRecipes([]);
    }
  };

  // Toggle recipe selection
  const toggleRecipeSelection = (recipeId: number) => {
    if (selectedRecipes.includes(recipeId)) {
      setSelectedRecipes(selectedRecipes.filter((id) => id !== recipeId));
    } else {
      setSelectedRecipes([...selectedRecipes, recipeId]);
    }
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    if (selectedRecipes.length > 0) {
      setShowDeleteConfirm(true);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedRecipes.length === 0) return;

    try {
      setIsDeleting(true);
      const response = await api.recipes.batchDelete(selectedRecipes);

      if (response && response.success) {
        // Remove deleted recipes from the list
        setRecipes(
          recipes.filter((recipe) => !selectedRecipes.includes(recipe.id))
        );
        setSelectedRecipes([]);
        setIsSelectionMode(false);
        alert(
          `Successfully deleted ${
            response.results?.filter((r: BatchDeleteResult) => r.success)
              .length || 0
          } recipes`
        );
      } else {
        setError(response?.message || "Failed to delete recipes");
      }
    } catch (err) {
      console.error("Error deleting recipes:", err);
      setError("An error occurred while deleting recipes");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the API client instead of direct fetch
        const data = await api.recipes.getAll();
        console.log("Recipes data:", data);

        if (data && Array.isArray(data.recipes)) {
          setRecipes(data.recipes);
        } else {
          setRecipes([]);
        }
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch recipes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Recipes
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete {selectedRecipes.length} recipe
              {selectedRecipes.length !== 1 ? "s" : ""}? This action cannot be
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
                  "Delete Recipes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <div className="flex space-x-2">
          {isSelectionMode ? (
            <>
              <button
                onClick={toggleSelectionMode}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedRecipes.length === 0}
              >
                Delete ({selectedRecipes.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectionMode}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Select
              </button>
              <Link
                to="/app/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Create Recipe
              </Link>
            </>
          )}
        </div>
      </div>

      {user && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">
            Logged in as: {user.displayName || user.email}
          </p>
          <p>User ID: {user.id}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                isSelectionMode && selectedRecipes.includes(recipe.id)
                  ? "ring-2 ring-indigo-500"
                  : ""
              }`}
            >
              {isSelectionMode && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedRecipes.includes(recipe.id)}
                    onChange={() => toggleRecipeSelection(recipe.id)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
              )}
              <div
                className="relative"
                onClick={
                  isSelectionMode
                    ? () => toggleRecipeSelection(recipe.id)
                    : undefined
                }
              >
                {recipe.imageUrl && (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                  {!isSelectionMode && (
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/app/recipe/${recipe.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Recipe →
                      </Link>
                      {recipe.user && user && recipe.user.id === user.id && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedRecipes([recipe.id]);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">No recipes found.</p>
          <Link
            to="/app/create"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Create your first recipe →
          </Link>
        </div>
      )}
    </div>
  );
}
