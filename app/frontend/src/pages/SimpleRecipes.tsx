import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";
import { RecipeCard } from "../components/recipe";
import { ResponsiveGrid, ResponsiveContainer } from "../components/layout";
import { Card, CardBody, Heading, Text } from "../components/ui";

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
    <ResponsiveContainer width="xl" padding={true} className="py-4 sm:py-8">
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xs sm:max-w-md mx-auto">
            <CardBody>
              <Heading
                level="h3"
                size="lg"
                weight="medium"
                className="text-gray-900 mb-2 sm:mb-4"
              >
                Delete Recipes
              </Heading>
              <Text className="text-gray-500 mb-4 sm:mb-6">
                Are you sure you want to delete {selectedRecipes.length} recipe
                {selectedRecipes.length !== 1 ? "s" : ""}? This action cannot be
                undone.
              </Text>

              <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white inline"
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
                      <span className="text-xs sm:text-sm">Deleting...</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm">Delete Recipes</span>
                  )}
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <Heading level="h1" size="3xl" weight="bold">
          My Recipes
        </Heading>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {isSelectionMode ? (
            <>
              <button
                onClick={toggleSelectionMode}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedRecipes.length === 0}
              >
                Delete ({selectedRecipes.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectionMode}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
              >
                Select
              </button>
              <Link
                to="/app/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
              >
                Create Recipe
              </Link>
            </>
          )}
        </div>
      </div>

      {user && (
        <Card className="bg-green-100 border-green-400 text-green-700 mb-4 sm:mb-6">
          <CardBody>
            <Heading level="h4" size="lg" weight="bold" className="mb-1">
              Logged in as: {user.displayName || user.email}
            </Heading>
            <Text size="xs">User ID: {user.id}</Text>
          </CardBody>
        </Card>
      )}

      {error && (
        <Card className="bg-red-100 border-red-400 text-red-700 mb-4 sm:mb-6">
          <CardBody>
            <Heading level="h4" size="lg" weight="bold" className="mb-1">
              Error
            </Heading>
            <Text>{error}</Text>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : recipes.length > 0 ? (
        <ResponsiveGrid columns={{ default: 1, sm: 2, lg: 3, xl: 4 }} gap="md">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              imageUrl={recipe.imageUrl}
              username={recipe.user?.username}
              userId={recipe.user?.id}
              currentUserId={user?.id}
              isSelectionMode={isSelectionMode}
              isSelected={selectedRecipes.includes(recipe.id)}
              onSelect={toggleRecipeSelection}
              onDelete={(id: number) => {
                setSelectedRecipes([id]);
                setShowDeleteConfirm(true);
              }}
            />
          ))}
        </ResponsiveGrid>
      ) : (
        <Card className="bg-gray-100 text-center">
          <CardBody>
            <Text className="text-gray-600 mb-3 sm:mb-4">
              No recipes found.
            </Text>
            <Link
              to="/app/create"
              className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base font-medium"
            >
              Create your first recipe →
            </Link>
          </CardBody>
        </Card>
      )}
    </ResponsiveContainer>
  );
}
