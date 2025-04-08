import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui';
import { useRecipes } from '../../context/RecipeContext';
import { useAuth } from '../../context/AuthContext';

interface SavedRecipeListProps {
  limit?: number;
  showViewAll?: boolean;
}

export function SavedRecipeList({ limit = 5, showViewAll = true }: SavedRecipeListProps) {
  const { user } = useAuth();
  const { savedRecipes, loading, fetchSavedRecipes } = useRecipes();
  
  useEffect(() => {
    if (user) {
      fetchSavedRecipes({ limit });
    }
  }, [fetchSavedRecipes, user, limit]);
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Saved Recipes</h2>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">You haven't saved any recipes yet.</p>
            <Link
              to="/recipes"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="h-16 w-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                <div>
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="font-medium hover:text-blue-600 transition-colors"
                  >
                    {recipe.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    by{' '}
                    <Link
                      to={`/recipes/user/${recipe.user.username}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {recipe.user.displayName || recipe.user.username}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {showViewAll && savedRecipes.length >= limit && (
              <div className="text-center pt-4">
                <Link
                  to="/recipes/saved"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Saved Recipes
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
