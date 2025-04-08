import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Card, CardContent } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useRecipes } from '../../context/RecipeContext';
import { useUI } from '../../context/UIContext';

export function SavedRecipesPage() {
  const { user } = useAuth();
  const { recipes, loading, pagination, fetchRecipes } = useRecipes();
  const { showToast } = useUI();
  const navigate = useNavigate();
  
  // Fetch saved recipes on mount
  useEffect(() => {
    if (user) {
      // In a real app, we would have a specific endpoint for saved recipes
      // For now, we'll just fetch recipes with a mock parameter
      fetchRecipes({ saved: true, page: 1, limit: 12 });
    }
  }, [user, fetchRecipes]);
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (user) {
      fetchRecipes({ saved: true, page, limit: pagination.limit });
    }
  };
  
  // Redirect if not logged in
  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your saved recipes</h2>
          <Button onClick={() => navigate('/login')}>Log In</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Your Saved Recipes</h1>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading saved recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-4">You haven't saved any recipes yet</h3>
              <p className="text-gray-500 mb-6">
                Browse recipes and click the heart icon to save them to your collection.
              </p>
              <Link to="/recipes">
                <Button>Browse Recipes</Button>
              </Link>
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
                          <div className="flex items-center text-sm text-red-500">
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
                            Saved
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
      </div>
    </MainLayout>
  );
}
