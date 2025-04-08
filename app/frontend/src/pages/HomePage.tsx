import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button, Card, CardContent } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';

export function HomePage() {
  const { user } = useAuth();
  const { recipes, loading, fetchRecipes } = useRecipes();
  
  // Fetch featured recipes on mount
  useEffect(() => {
    fetchRecipes({ limit: 6 });
  }, [fetchRecipes]);
  
  return (
    <MainLayout>
      {/* Hero section */}
      <div className="bg-blue-600 text-white rounded-lg overflow-hidden shadow-xl mb-12">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Your Recipe Collection
              </h1>
              <p className="text-xl max-w-3xl mb-8">
                Discover, create, and share your favorite recipes. Import from social media, organize your collection, and cook with confidence.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/recipes">
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                    Browse Recipes
                  </Button>
                </Link>
                {user ? (
                  <Link to="/recipes/create">
                    <Button size="lg">Create Recipe</Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button size="lg">Sign Up Free</Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-10 lg:mt-0 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Cooking"
                className="rounded-lg shadow-lg object-cover h-96 w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured recipes */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Featured Recipes</h2>
          <Link to="/recipes" className="text-blue-600 hover:text-blue-800 font-medium">
            View all recipes →
          </Link>
        </div>
        
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </div>
      
      {/* Features section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Create Recipes</h3>
            <p className="text-gray-600">
              Create and organize your own recipes with easy-to-use tools.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
              <svg
                className="h-8 w-8"
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
            <h3 className="text-xl font-bold mb-2">Import from Social Media</h3>
            <p className="text-gray-600">
              Import recipes directly from Instagram and TikTok with one click.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">AI-Powered Assistance</h3>
            <p className="text-gray-600">
              Get AI-generated recipe names, descriptions, and cooking tips.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start your recipe collection?</h2>
        <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
          Join thousands of home cooks who use RecCollection to organize, discover, and share their favorite recipes.
        </p>
        {user ? (
          <Link to="/recipes/create">
            <Button size="lg">Create Your First Recipe</Button>
          </Link>
        ) : (
          <Link to="/register">
            <Button size="lg">Sign Up Free</Button>
          </Link>
        )}
      </div>
    </MainLayout>
  );
}
