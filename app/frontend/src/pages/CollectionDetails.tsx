import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";
import { Button } from "../components/ui/buttons/Button";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { RecipeCard } from "../components/recipe";

interface Collection {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Recipe {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  cookingTime: number | null;
  prepTime: number | null;
  userId: number;
  username?: string;
  createdAt: string;
}

export default function CollectionDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch collection details
  useEffect(() => {
    const fetchCollectionDetails = async () => {
      if (!isAuthenticated || !id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/collections/${id}`);

        if (response.success && response.collection) {
          setCollection(response.collection);
          setEditName(response.collection.name);
          setEditDescription(response.collection.description || "");

          if (response.recipes) {
            setRecipes(response.recipes);
          }
        } else {
          setError("Failed to fetch collection details");
        }
      } catch (err) {
        console.error("Error fetching collection details:", err);
        setError("An error occurred while fetching collection details");
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [isAuthenticated, id]);

  // Handle updating collection
  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      setError("Collection name is required");
      return;
    }

    try {
      setUpdateLoading(true);
      setError(null);

      const response = await api.put(`/collections/${id}`, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });

      if (response.success && response.collection) {
        setCollection(response.collection);
        setIsEditing(false);
      } else {
        setError("Failed to update collection");
      }
    } catch (err) {
      console.error("Error updating collection:", err);
      setError("An error occurred while updating the collection");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle deleting collection
  const handleDeleteCollection = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this collection? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.delete(`/collections/${id}`);

      if (response.success) {
        navigate("/app/collections");
      } else {
        setError("Failed to delete collection");
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
      setError("An error occurred while deleting the collection");
    }
  };

  // Handle removing a recipe from collection
  const handleRemoveRecipe = async (recipeId: number) => {
    if (!confirm("Remove this recipe from the collection?")) {
      return;
    }

    try {
      const response = await api.delete(
        `/collections/${id}/recipes/${recipeId}`
      );

      if (response.success) {
        // Remove the recipe from the list
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
      } else {
        setError("Failed to remove recipe from collection");
      }
    } catch (err) {
      console.error("Error removing recipe:", err);
      setError("An error occurred while removing the recipe");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Please log in to view this collection
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            You need to be logged in to access this page.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            to="/app/collections"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back to Collections
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading collection...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : collection ? (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              {isEditing ? (
                <form onSubmit={handleUpdateCollection}>
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={updateLoading}
                      disabled={updateLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {collection.name}
                      </h1>
                      {collection.description && (
                        <p className="mt-2 text-gray-600">
                          {collection.description}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Created on{" "}
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        aria-label="Edit collection"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleDeleteCollection}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-600 bg-white hover:bg-red-50"
                        aria-label="Delete collection"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recipes in this Collection
              </h2>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No recipes in this collection
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add recipes to this collection from the recipe details page.
                </p>
                <div className="mt-6">
                  <Link
                    to="/app/recipes"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Recipes
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="relative">
                    <button
                      onClick={() => handleRemoveRecipe(recipe.id)}
                      className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow hover:bg-red-50"
                      aria-label="Remove from collection"
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">
              Collection not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The collection you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <div className="mt-6">
              <Link
                to="/app/collections"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Collections
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
