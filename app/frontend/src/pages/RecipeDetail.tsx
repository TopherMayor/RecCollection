import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import ShareRecipeModal from "../components/ShareRecipeModal";

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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeLoaded, setRecipeLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "ingredients" | "instructions" | "notes"
  >("ingredients");

  // Fetch recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.recipes.getById(parseInt(id));

        if (response && response.success) {
          setRecipe(response.recipe);
          setRecipeLoaded(true);

          // Check if the current user is the owner
          if (isAuthenticated && user && response.recipe.userId === user.id) {
            setIsOwner(true);
          }
        } else {
          setError(
            response?.message || "Failed to load recipe. Please try again."
          );
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("An error occurred while loading the recipe.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, isAuthenticated, user]);

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Format time (minutes to hours and minutes)
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
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

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
    <>
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
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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

        {recipe && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                {recipe.title}
              </h1>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
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
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 p-4">
                  {recipe.imageUrl || recipe.thumbnailUrl ? (
                    <img
                      src={recipe.imageUrl || recipe.thumbnailUrl}
                      alt={recipe.title}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
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
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recipe Info
                    </h3>
                    <dl className="mt-2 text-sm text-gray-600">
                      <div className="mt-1 flex justify-between">
                        <dt className="font-medium">Prep Time:</dt>
                        <dd>{formatTime(recipe.prepTime)}</dd>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <dt className="font-medium">Cooking Time:</dt>
                        <dd>{formatTime(recipe.cookingTime)}</dd>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <dt className="font-medium">Servings:</dt>
                        <dd>
                          {recipe.servingSize
                            ? `${recipe.servingSize} ${
                                recipe.servingSize > 1 ? "servings" : "serving"
                              }`
                            : "N/A"}
                        </dd>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <dt className="font-medium">Difficulty:</dt>
                        <dd>{renderDifficultyBadge(recipe.difficultyLevel)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Created By
                    </h3>
                    <div className="mt-2 flex items-center">
                      {recipe.user.avatarUrl ? (
                        <img
                          src={recipe.user.avatarUrl}
                          alt={recipe.user.displayName || recipe.user.username}
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <span className="text-indigo-800 font-medium">
                            {(recipe.user.displayName || recipe.user.username)
                              ?.charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <Link
                        to={`/app/profile/${recipe.user.username}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {recipe.user.displayName || recipe.user.username}
                      </Link>
                    </div>
                  </div>

                  {recipe.categories && recipe.categories.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Categories
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recipe.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Tags
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.sourceUrl && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Source
                      </h3>
                      <div className="mt-2">
                        {recipe.sourceType && (
                          <div className="text-sm text-gray-600 mb-1">
                            {recipe.sourceType}
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
                  )}
                </div>

                <div className="md:col-span-2 p-4">
                  <div className="mb-4">
                    <p className="text-gray-700">{recipe.description}</p>
                  </div>

                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        className={`${
                          activeTab === "ingredients"
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab("ingredients")}
                      >
                        Ingredients
                      </button>
                      <button
                        className={`${
                          activeTab === "instructions"
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab("instructions")}
                      >
                        Instructions
                      </button>
                      <button
                        className={`${
                          activeTab === "notes"
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        onClick={() => setActiveTab("notes")}
                      >
                        Notes
                      </button>
                    </nav>
                  </div>

                  <div className="py-4">
                    {activeTab === "ingredients" && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Ingredients
                        </h3>
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {recipe.ingredients
                              .sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((ingredient) => (
                                <li key={ingredient.id} className="text-gray-700">
                                  <span className="font-medium">
                                    {ingredient.quantity}{" "}
                                    {ingredient.unit && ingredient.unit}{" "}
                                  </span>
                                  {ingredient.name}
                                  {ingredient.notes && (
                                    <span className="text-gray-500 italic ml-2">
                                      ({ingredient.notes})
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">
                            No ingredients listed
                          </p>
                        )}
                      </div>
                    )}

                    {activeTab === "instructions" && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Instructions
                        </h3>
                        {recipe.instructions && recipe.instructions.length > 0 ? (
                          <ol className="list-decimal pl-5 space-y-4">
                            {recipe.instructions
                              .sort((a, b) => a.stepNumber - b.stepNumber)
                              .map((instruction) => (
                                <li
                                  key={instruction.id}
                                  className="text-gray-700"
                                >
                                  <div className="mb-2">
                                    {instruction.description}
                                  </div>
                                  {instruction.imageUrl && (
                                    <img
                                      src={instruction.imageUrl}
                                      alt={`Step ${instruction.stepNumber}`}
                                      className="mt-2 rounded-md max-w-full h-auto"
                                    />
                                  )}
                                </li>
                              ))}
                          </ol>
                        ) : (
                          <p className="text-gray-500 italic">
                            No instructions listed
                          </p>
                        )}
                      </div>
                    )}

                    {activeTab === "notes" && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Notes
                        </h3>
                        <p className="text-gray-700">
                          {recipe.description || (
                            <span className="text-gray-500 italic">
                              No additional notes
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Recipe Modal */}
      {recipe && (
        <ShareRecipeModal
          recipeId={recipe.id}
          recipeName={recipe.title}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
