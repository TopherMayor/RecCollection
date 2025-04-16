import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import ShareRecipeModal from "../components/ShareRecipeModal";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import { Heading, Text } from "../components/ui/Typography";
import {
  ResponsiveButton,
  ResponsiveLinkButton,
} from "../components/ui/ResponsiveButton";

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
  const [, setRecipeLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "ingredients" | "instructions" | "notes"
  >("ingredients");
  const [collections, setCollections] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [showCollectionsDropdown, setShowCollectionsDropdown] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [collectionSuccess, setCollectionSuccess] = useState<string | null>(
    null
  );
  const collectionsDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close collections dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        collectionsDropdownRef.current &&
        !collectionsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCollectionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user's collections
  useEffect(() => {
    const fetchCollections = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await api.collections.getAll();

        if (response.success && response.collections) {
          setCollections(response.collections);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    fetchCollections();
  }, [isAuthenticated]);

  // Handle adding recipe to collection
  const handleAddToCollection = async () => {
    if (!selectedCollectionId || !id) return;

    try {
      setAddingToCollection(true);
      setCollectionError(null);
      setCollectionSuccess(null);

      const response = await api.collections.addRecipe(
        selectedCollectionId,
        parseInt(id)
      );

      if (response.success) {
        setCollectionSuccess(`Added to collection successfully`);
        setShowCollectionsDropdown(false);

        // Reset after a few seconds
        setTimeout(() => {
          setCollectionSuccess(null);
        }, 3000);
      } else {
        setCollectionError(response.message || "Failed to add to collection");
      }
    } catch (err) {
      console.error("Error adding to collection:", err);
      setCollectionError("An error occurred while adding to collection");
    } finally {
      setAddingToCollection(false);
    }
  };

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
      <ResponsiveContainer width="xl" padding="md" className="py-4 sm:py-8">
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (!recipe) {
    return (
      <ResponsiveContainer width="xl" padding="md" className="py-4 sm:py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4">
          <Heading level="h3" size="lg" weight="bold" className="mb-2">
            Recipe not found
          </Heading>
          <Text size="base" className="mb-3">
            The recipe you're looking for doesn't exist or has been removed.
          </Text>
          <Link
            to="/app/recipes"
            className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base font-medium inline-flex items-center"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to recipes
          </Link>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <>
      <ResponsiveContainer width="xl" padding="md" className="py-4 sm:py-8">
        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Recipe
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this recipe? This action cannot
                be undone.
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

        <div className="mb-4 sm:mb-6">
          <Link
            to="/app/recipes"
            className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
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
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-3 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <Heading
                level="h1"
                size="2xl"
                weight="bold"
                className="mb-3 sm:mb-0 text-gray-900"
              >
                {recipe.title}
              </Heading>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="relative" ref={collectionsDropdownRef}>
                  {isAuthenticated && (
                    <div className="mr-2">
                      <ResponsiveButton
                        onClick={() =>
                          setShowCollectionsDropdown(!showCollectionsDropdown)
                        }
                        variant="outline"
                        size="sm"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        }
                        iconPosition="left"
                      >
                        Add to Collection
                      </ResponsiveButton>

                      {/* Collections dropdown */}
                      {showCollectionsDropdown && (
                        <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                          >
                            {collections.length === 0 ? (
                              <div className="px-4 py-2 text-sm text-gray-500">
                                You don't have any collections yet.
                                <Link
                                  to="/app/collections"
                                  className="text-indigo-600 hover:text-indigo-800 block mt-1"
                                >
                                  Create a collection
                                </Link>
                              </div>
                            ) : (
                              <>
                                <div className="px-4 py-2 text-xs font-medium text-gray-700 border-b">
                                  Select a collection:
                                </div>
                                {collections.map((collection) => (
                                  <button
                                    key={collection.id}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                      selectedCollectionId === collection.id
                                        ? "bg-indigo-100 text-indigo-900"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    onClick={() =>
                                      setSelectedCollectionId(collection.id)
                                    }
                                    role="menuitem"
                                  >
                                    {collection.name}
                                  </button>
                                ))}
                                <div className="border-t border-gray-100 px-4 py-2">
                                  <button
                                    className="w-full text-sm bg-indigo-600 text-white py-1 px-2 rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                                    onClick={handleAddToCollection}
                                    disabled={
                                      !selectedCollectionId ||
                                      addingToCollection
                                    }
                                  >
                                    {addingToCollection ? (
                                      <>
                                        <svg
                                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                        Adding...
                                      </>
                                    ) : (
                                      "Add to Collection"
                                    )}
                                  </button>
                                  {collectionError && (
                                    <p className="text-xs text-red-600 mt-1">
                                      {collectionError}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Success message */}
                      {collectionSuccess && (
                        <div className="absolute top-0 right-0 mt-10 mr-2 bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded text-xs">
                          {collectionSuccess}
                        </div>
                      )}
                    </div>
                  )}

                  <ResponsiveButton
                    onClick={() => setShowShareModal(true)}
                    variant="success"
                    size="sm"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
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
                    }
                    iconPosition="left"
                  >
                    Share
                  </ResponsiveButton>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <ResponsiveLinkButton
                      to={`/app/edit/${recipe.id}`}
                      variant="primary"
                      size="sm"
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
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
                      }
                      iconPosition="left"
                    >
                      Edit
                    </ResponsiveLinkButton>

                    <ResponsiveButton
                      onClick={handleDeleteClick}
                      variant="danger"
                      size="sm"
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
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
                      }
                      iconPosition="left"
                    >
                      Delete
                    </ResponsiveButton>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="md:col-span-1 p-3 sm:p-4">
                  {recipe.imageUrl || recipe.thumbnailUrl ? (
                    <img
                      src={recipe.imageUrl || recipe.thumbnailUrl}
                      alt={recipe.title}
                      className="w-full h-auto rounded-lg shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
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

                  <div className="mt-3 sm:mt-4">
                    <Heading
                      level="h3"
                      size="lg"
                      weight="medium"
                      className="text-gray-900"
                    >
                      Recipe Info
                    </Heading>
                    <dl className="mt-2 text-xs sm:text-sm text-gray-600">
                      <div className="mt-1 flex justify-between items-center">
                        <dt className="font-medium">Prep Time:</dt>
                        <dd>{formatTime(recipe.prepTime)}</dd>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <dt className="font-medium">Cooking Time:</dt>
                        <dd>{formatTime(recipe.cookingTime)}</dd>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <dt className="font-medium">Servings:</dt>
                        <dd>
                          {recipe.servingSize
                            ? `${recipe.servingSize} ${
                                recipe.servingSize > 1 ? "servings" : "serving"
                              }`
                            : "N/A"}
                        </dd>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <dt className="font-medium">Difficulty:</dt>
                        <dd>{renderDifficultyBadge(recipe.difficultyLevel)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <Heading
                      level="h3"
                      size="lg"
                      weight="medium"
                      className="text-gray-900"
                    >
                      Created By
                    </Heading>
                    <div className="mt-2 flex items-center">
                      {recipe.user.avatarUrl ? (
                        <img
                          src={recipe.user.avatarUrl}
                          alt={recipe.user.displayName || recipe.user.username}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full mr-2"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <span className="text-indigo-800 font-medium text-xs sm:text-sm">
                            {(recipe.user.displayName || recipe.user.username)
                              ?.charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <Link
                        to={`/app/profile/${recipe.user.username}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base"
                      >
                        {recipe.user.displayName || recipe.user.username}
                      </Link>
                    </div>
                  </div>

                  {recipe.categories && recipe.categories.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <Heading
                        level="h3"
                        size="lg"
                        weight="medium"
                        className="text-gray-900"
                      >
                        Categories
                      </Heading>
                      <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                        {recipe.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <Heading
                        level="h3"
                        size="lg"
                        weight="medium"
                        className="text-gray-900"
                      >
                        Tags
                      </Heading>
                      <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.sourceUrl && (
                    <div className="mt-3 sm:mt-4">
                      <Heading
                        level="h3"
                        size="lg"
                        weight="medium"
                        className="text-gray-900"
                      >
                        Source
                      </Heading>
                      <div className="mt-2">
                        {recipe.sourceType && (
                          <Text size="sm" className="text-gray-600 mb-1">
                            {recipe.sourceType}
                          </Text>
                        )}
                        <a
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm sm:text-base"
                        >
                          View original recipe
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 ml-1"
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

                <div className="md:col-span-2 p-3 sm:p-4">
                  <div className="mb-3 sm:mb-4">
                    <Text size="base" className="text-gray-700">
                      {recipe.description}
                    </Text>
                  </div>

                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                      <button
                        className={`${
                          activeTab === "ingredients"
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
                        onClick={() => setActiveTab("ingredients")}
                        aria-selected={activeTab === "ingredients"}
                        role="tab"
                      >
                        Ingredients
                      </button>
                      <button
                        className={`${
                          activeTab === "instructions"
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
                        onClick={() => setActiveTab("instructions")}
                        aria-selected={activeTab === "instructions"}
                        role="tab"
                      >
                        Instructions
                      </button>
                      <button
                        className={`${
                          activeTab === "notes"
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0`}
                        onClick={() => setActiveTab("notes")}
                        aria-selected={activeTab === "notes"}
                        role="tab"
                      >
                        Notes
                      </button>
                    </nav>
                  </div>

                  <div className="py-3 sm:py-4">
                    {activeTab === "ingredients" && (
                      <div>
                        <Heading
                          level="h3"
                          size="lg"
                          weight="medium"
                          className="text-gray-900 mb-3 sm:mb-4"
                        >
                          Ingredients
                        </Heading>
                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                          <ul className="list-disc pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                            {recipe.ingredients
                              .sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((ingredient) => (
                                <li
                                  key={ingredient.id}
                                  className="text-gray-700"
                                >
                                  <span className="font-medium">
                                    {ingredient.quantity}{" "}
                                    {ingredient.unit && ingredient.unit}{" "}
                                  </span>
                                  {ingredient.name}
                                  {ingredient.notes && (
                                    <span className="text-gray-500 italic ml-1 sm:ml-2 text-xs sm:text-sm">
                                      ({ingredient.notes})
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <Text size="base" className="text-gray-500 italic">
                            No ingredients listed
                          </Text>
                        )}
                      </div>
                    )}

                    {activeTab === "instructions" && (
                      <div>
                        <Heading
                          level="h3"
                          size="lg"
                          weight="medium"
                          className="text-gray-900 mb-3 sm:mb-4"
                        >
                          Instructions
                        </Heading>
                        {recipe.instructions &&
                        recipe.instructions.length > 0 ? (
                          <ol className="list-decimal pl-4 sm:pl-5 space-y-3 sm:space-y-4 text-sm sm:text-base">
                            {recipe.instructions
                              .sort((a, b) => a.stepNumber - b.stepNumber)
                              .map((instruction) => (
                                <li
                                  key={instruction.id}
                                  className="text-gray-700 pb-2"
                                >
                                  <div className="mb-2">
                                    {instruction.description}
                                  </div>
                                  {instruction.imageUrl && (
                                    <img
                                      src={instruction.imageUrl}
                                      alt={`Step ${instruction.stepNumber}`}
                                      className="mt-2 rounded-md max-w-full h-auto"
                                      loading="lazy"
                                    />
                                  )}
                                </li>
                              ))}
                          </ol>
                        ) : (
                          <Text size="base" className="text-gray-500 italic">
                            No instructions listed
                          </Text>
                        )}
                      </div>
                    )}

                    {activeTab === "notes" && (
                      <div>
                        <Heading
                          level="h3"
                          size="lg"
                          weight="medium"
                          className="text-gray-900 mb-3 sm:mb-4"
                        >
                          Notes
                        </Heading>
                        <Text size="base" className="text-gray-700">
                          {recipe.description || (
                            <span className="text-gray-500 italic text-sm sm:text-base">
                              No additional notes
                            </span>
                          )}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ResponsiveContainer>

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
