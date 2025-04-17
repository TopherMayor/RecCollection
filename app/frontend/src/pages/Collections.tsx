import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/buttons/Button";
import { Plus, Folder, X } from "lucide-react";

interface Collection {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export default function Collections() {
  const { isAuthenticated } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch user's collections
  useEffect(() => {
    const fetchCollections = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.collections.getAll();

        if (response.success && response.collections) {
          setCollections(response.collections);
        } else {
          setError("Failed to fetch collections");
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError("An error occurred while fetching collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [isAuthenticated]);

  // Handle creating a new collection
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCollectionName.trim()) {
      setCreateError("Collection name is required");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      const response = await api.collections.create({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined,
      });

      if (response.success && response.collection) {
        // Add the new collection to the list
        setCollections([...collections, response.collection]);

        // Reset form
        setNewCollectionName("");
        setNewCollectionDescription("");
        setShowCreateForm(false);
      } else {
        setCreateError("Failed to create collection");
      }
    } catch (err) {
      console.error("Error creating collection:", err);
      setCreateError("An error occurred while creating the collection");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle deleting a collection
  const handleDeleteCollection = async (collectionId: number) => {
    if (!confirm("Are you sure you want to delete this collection?")) {
      return;
    }

    try {
      const response = await api.collections.delete(collectionId);

      if (response.success) {
        // Remove the deleted collection from the list
        setCollections(collections.filter((c) => c.id !== collectionId));
      } else {
        setError("Failed to delete collection");
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
      setError("An error occurred while deleting the collection");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Please log in to view your collections
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            leftIcon={
              showCreateForm ? (
                <X className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )
            }
          >
            {showCreateForm ? "Cancel" : "Create Collection"}
          </Button>
        </div>

        {/* Create Collection Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Collection
            </h2>
            <form onSubmit={handleCreateCollection}>
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
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Collection name"
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
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe your collection"
                />
              </div>
              {createError && (
                <div className="mb-4 text-sm text-red-600">{createError}</div>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createLoading}
                  isLoading={createLoading}
                >
                  Create Collection
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Collections Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <Folder className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No collections yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first collection to organize your recipes.
            </p>
            {!showCreateForm && (
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Collection
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Delete collection"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/app/collections/${collection.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Collection
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
