import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FollowButton from "../components/FollowButton";
import { RecipeCard } from "../components/recipe";
import { ResponsiveContainer, ResponsiveGrid } from "../components/layout";
import {
  Card,
  CardBody,
  Heading,
  Text,
  Image,
  TabFilter,
} from "../components/ui";

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
    <Card key={user.id} className="overflow-hidden">
      <CardBody className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center">
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName || user.username}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
              objectFit="cover"
              rounded="full"
            />
          ) : (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Text className="text-indigo-800 font-medium">
                {(user.displayName || user.username)?.charAt(0).toUpperCase()}
              </Text>
            </div>
          )}
        </div>
        <div className="ml-0 sm:ml-4 mt-2 sm:mt-0">
          <Heading
            level="h3"
            size="lg"
            weight="medium"
            className="text-gray-900"
          >
            {user.displayName || user.username}
          </Heading>
          <Text size="sm" className="text-gray-500">
            @{user.username}
          </Text>
          {user.bio && (
            <Text size="sm" className="mt-1 text-gray-600 line-clamp-2">
              {user.bio}
            </Text>
          )}
        </div>
        <div className="ml-auto flex flex-col space-y-2 mt-2 sm:mt-0">
          <Link
            to={`/app/profile/${user.username}`}
            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Profile
          </Link>
          <FollowButton username={user.username} size="sm" />
        </div>
      </CardBody>
    </Card>
  );

  // Render recipe card
  const renderRecipeCard = (recipe: Recipe) => (
    <RecipeCard
      key={recipe.id}
      id={recipe.id}
      title={recipe.title}
      description={recipe.description}
      imageUrl={
        recipe.imageUrl ||
        recipe.thumbnailUrl ||
        (recipe.thumbnailPath
          ? recipe.thumbnailPath.startsWith("http")
            ? recipe.thumbnailPath
            : recipe.thumbnailPath
          : undefined)
      }
      username={recipe.user?.displayName || recipe.user?.username}
      userId={recipe.user?.id}
    />
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
      <ResponsiveContainer width="xl" padding={true} className="py-4 sm:py-8">
        <Card className="bg-yellow-100 border-yellow-400 text-yellow-700 mb-4 sm:mb-6">
          <CardBody>
            <Heading level="h4" size="lg" weight="bold" className="mb-1">
              Please log in
            </Heading>
            <Text>
              You need to be logged in to search for recipes and users.
            </Text>
          </CardBody>
        </Card>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="xl" padding={true} className="py-4 sm:py-8">
      <Heading level="h1" size="3xl" weight="bold" className="mb-2">
        Search Results
      </Heading>
      {query ? (
        <Text className="text-gray-600 mb-4 sm:mb-6">
          Showing results for "{query}"
        </Text>
      ) : (
        <Text className="text-gray-600 mb-4 sm:mb-6">
          Enter a search term to find recipes and users
        </Text>
      )}

      {/* Tabs */}
      <TabFilter
        options={[
          { id: "all", label: "All" },
          {
            id: "recipes",
            label: "Recipes",
            count: results?.recipes?.pagination.total,
          },
          {
            id: "users",
            label: "Users",
            count: results?.users?.pagination.total,
          },
        ]}
        activeTab={activeTab}
        onChange={(tabId) =>
          handleTabChange(tabId as "all" | "users" | "recipes")
        }
        className="mb-4 sm:mb-6"
      />

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card className="bg-red-100 border-red-400 text-red-700 mb-4 sm:mb-6">
          <CardBody>
            <Heading level="h4" size="lg" weight="bold" className="mb-1">
              Error
            </Heading>
            <Text>{error}</Text>
          </CardBody>
        </Card>
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
          <Card className="bg-gray-100 text-center">
            <CardBody>
              <Text className="text-gray-600">
                No results found for "{query}"
              </Text>
            </CardBody>
          </Card>
        )}

      {/* Results */}
      {!loading && !error && results && (
        <div className="space-y-8">
          {/* Users section */}
          {(activeTab === "all" || activeTab === "users") &&
            results.users?.items.length > 0 && (
              <div>
                {activeTab === "all" && (
                  <Heading
                    level="h2"
                    size="2xl"
                    weight="bold"
                    className="mb-3 sm:mb-4"
                  >
                    Users
                  </Heading>
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
                  <Heading
                    level="h2"
                    size="2xl"
                    weight="bold"
                    className="mb-3 sm:mb-4"
                  >
                    Recipes
                  </Heading>
                )}
                <ResponsiveGrid columns={{ default: 1, sm: 2, lg: 3 }} gap="md">
                  {results.recipes.items.map(renderRecipeCard)}
                </ResponsiveGrid>
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
    </ResponsiveContainer>
  );
}
