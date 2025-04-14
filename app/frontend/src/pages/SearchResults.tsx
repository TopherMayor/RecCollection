import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import FollowButton from "../components/FollowButton";

interface User {
  id: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  user: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

interface SearchResults {
  users?: {
    items: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  recipes?: {
    items: Recipe[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "users" | "recipes">(
    "all"
  );

  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // Determine which type to search based on active tab
        const type = activeTab === "all" ? undefined : activeTab;

        // Build the search URL
        let searchUrl = `/api/search?q=${encodeURIComponent(
          query
        )}&page=${page}`;
        if (type) {
          searchUrl += `&type=${type}`;
        }

        const response = await fetch(searchUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setResults(data);
        } else {
          setError(data.error || "Failed to fetch search results");
        }
      } catch (err) {
        console.error("Error searching:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while searching"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page, activeTab]);

  // Handle tab change
  const handleTabChange = (tab: "all" | "users" | "recipes") => {
    setActiveTab(tab);
    // Reset to page 1 when changing tabs
    if (page !== 1) {
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

  // Render user card
  const renderUserCard = (user: User) => (
    <div
      key={user.id}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-4 flex items-center">
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.username}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-800 font-medium">
                {(user.displayName || user.username)?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">
            {user.displayName || user.username}
          </h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {user.bio && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
        <div className="ml-auto flex flex-col space-y-2">
          <Link
            to={`/app/profile/${user.username}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Profile
          </Link>
          <FollowButton username={user.username} size="sm" />
        </div>
      </div>
    </div>
  );

  // Render recipe card
  const renderRecipeCard = (recipe: Recipe) => (
    <div
      key={recipe.id}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="h-48 bg-gray-200 relative">
        {recipe.imageUrl || recipe.thumbnailUrl || recipe.thumbnailPath ? (
          <img
            src={
              recipe.imageUrl ||
              recipe.thumbnailUrl ||
              (recipe.thumbnailPath ? `/api${recipe.thumbnailPath}` : undefined)
            }
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://picsum.photos/seed/${recipe.id}/800/600`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex-shrink-0">
            {recipe.user?.avatarUrl ? (
              <img
                src={recipe.user.avatarUrl}
                alt={recipe.user.displayName || recipe.user.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium">
                  {(recipe.user?.displayName || recipe.user?.username)
                    ?.charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-2">
            <Link
              to={`/app/profile/${recipe.user?.username}`}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600"
            >
              {recipe.user?.displayName || recipe.user?.username}
            </Link>
          </div>
        </div>
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
        <Link
          to={`/app/recipe/${recipe.id}`}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Recipe →
        </Link>
      </div>
    </div>
  );

  // Render pagination
  const renderPagination = (pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }) => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
              pagination.page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } text-sm font-medium`}
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first page, last page, current page, and pages around current page
              return (
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - pagination.page) <= 1
              );
            })
            .map((p, i, arr) => {
              // Add ellipsis where needed
              const showEllipsisBefore = i > 0 && arr[i - 1] !== p - 1;
              const showEllipsisAfter =
                i < arr.length - 1 && arr[i + 1] !== p + 1;

              return (
                <div key={p}>
                  {showEllipsisBefore && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => handlePageChange(p)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      pagination.page === p
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } text-sm font-medium`}
                  >
                    {p}
                  </button>
                  {showEllipsisAfter && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium">
                      ...
                    </span>
                  )}
                </div>
              );
            })}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
              pagination.page === pagination.totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } text-sm font-medium`}
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Please log in</p>
          <p>You need to be logged in to search for recipes and users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      {query ? (
        <p className="text-gray-600 mb-6">Showing results for "{query}"</p>
      ) : (
        <p className="text-gray-600 mb-6">
          Enter a search term to find recipes and users
        </p>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("all")}
            className={`${
              activeTab === "all"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All
          </button>
          <button
            onClick={() => handleTabChange("recipes")}
            className={`${
              activeTab === "recipes"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Recipes{" "}
            {results?.recipes?.pagination.total
              ? `(${results.recipes.pagination.total})`
              : ""}
          </button>
          <button
            onClick={() => handleTabChange("users")}
            className={`${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users{" "}
            {results?.users?.pagination.total
              ? `(${results.users.pagination.total})`
              : ""}
          </button>
        </nav>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* No results */}
      {!loading &&
        !error &&
        query &&
        results &&
        ((activeTab === "all" &&
          !results.users?.items.length &&
          !results.recipes?.items.length) ||
          (activeTab === "users" && !results.users?.items.length) ||
          (activeTab === "recipes" && !results.recipes?.items.length)) && (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-600">No results found for "{query}"</p>
          </div>
        )}

      {/* Results */}
      {!loading && !error && results && (
        <div className="space-y-8">
          {/* Users section */}
          {(activeTab === "all" || activeTab === "users") &&
            results.users?.items.length > 0 && (
              <div>
                {activeTab === "all" && (
                  <h2 className="text-2xl font-bold mb-4">Users</h2>
                )}
                <div className="space-y-4">
                  {results.users.items.map(renderUserCard)}
                </div>
                {activeTab !== "all" &&
                  renderPagination(results.users.pagination)}
              </div>
            )}

          {/* Recipes section */}
          {(activeTab === "all" || activeTab === "recipes") &&
            results.recipes?.items.length > 0 && (
              <div>
                {activeTab === "all" && (
                  <h2 className="text-2xl font-bold mb-4">Recipes</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.recipes.items.map(renderRecipeCard)}
                </div>
                {activeTab !== "all" &&
                  renderPagination(results.recipes.pagination)}
              </div>
            )}

          {/* Pagination for 'all' tab */}
          {activeTab === "all" &&
            (results.users?.pagination.totalPages > 1 ||
              results.recipes?.pagination.totalPages > 1) && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 mx-1 rounded ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={
                    (results.users?.pagination.totalPages || 0) <= page &&
                    (results.recipes?.pagination.totalPages || 0) <= page
                  }
                  className={`px-4 py-2 mx-1 rounded ${
                    (results.users?.pagination.totalPages || 0) <= page &&
                    (results.recipes?.pagination.totalPages || 0) <= page
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
