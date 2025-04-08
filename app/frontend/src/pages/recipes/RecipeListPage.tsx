import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useRecipes } from '../../context/RecipeContext';

export function RecipeListPage() {
  const { user } = useAuth();
  const { recipes, loading, pagination, fetchRecipes, setSearchParams } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch recipes on mount
  useEffect(() => {
    fetchRecipes({ page: 1, limit: 12 });
  }, [fetchRecipes]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes({ search: searchQuery, page: 1, limit: 12 });
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchRecipes({ ...pagination, page });
  };
  
  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">All Recipes</h1>
          {user && (
            <Link to="/recipes/create">
              <Button>Create Recipe</Button>
            </Link>
          )}
        </div>
        
        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant={searchQuery ? 'primary' : 'secondary'}>
              Search
            </Button>
          </form>
        </div>
        
        {/* Recipe grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600 mb-4">No recipes found</h3>
            {user ? (
              <Link to="/recipes/create">
                <Button>Create Your First Recipe</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button>Sign In to Create Recipes</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {recipes.map((recipe) => (
                <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                  <Card className="h-full transition-transform hover:scale-105">
                    <div className="h-48 overflow-hidden">
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <CardContent>
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">{recipe.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {recipe.user.avatarUrl ? (
                            <img
                              src={recipe.user.avatarUrl}
                              alt={recipe.user.username}
                              className="h-6 w-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
                              {recipe.user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-600">
                            {recipe.user.displayName || recipe.user.username}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {recipe.likeCount}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
