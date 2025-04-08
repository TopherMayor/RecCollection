import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, Button } from '../ui';
import { useRecipes } from '../../context/RecipeContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

interface UserRecipeListProps {
  userId?: number;
  limit?: number;
  showViewAll?: boolean;
}

export function UserRecipeList({ userId, limit = 5, showViewAll = true }: UserRecipeListProps) {
  const { user } = useAuth();
  const { recipes, loading, fetchRecipes, deleteRecipe } = useRecipes();
  const { showToast, showConfirm } = useUI();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isCurrentUser = !userId || (user && user.id === userId);
  
  useEffect(() => {
    fetchRecipes({
      userId: userId || (user ? user.id : undefined),
      limit,
    });
  }, [fetchRecipes, userId, user, limit]);
  
  const handleDelete = async (recipeId: number) => {
    showConfirm({
      title: 'Delete Recipe',
      message: 'Are you sure you want to delete this recipe? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const success = await deleteRecipe(recipeId);
          if (success) {
            showToast('Recipe deleted successfully', 'success');
            fetchRecipes({
              userId: userId || (user ? user.id : undefined),
              limit,
            });
          }
        } catch (error) {
          showToast('Failed to delete recipe', 'error');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isCurrentUser ? 'Your Recipes' : 'User Recipes'}
          </h2>
          {isCurrentUser && (
            <Link to="/recipes/create">
              <Button size="sm">Create Recipe</Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">
              {isCurrentUser
                ? "You haven't created any recipes yet."
                : "This user hasn't created any recipes yet."}
            </p>
            {isCurrentUser && (
              <Link to="/recipes/create">
                <Button>Create Your First Recipe</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center space-x-4">
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
                    <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                      <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{recipe.likeCount} likes</span>
                      {recipe.isPrivate && (
                        <>
                          <span>•</span>
                          <span className="text-orange-500">Private</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {isCurrentUser && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/recipes/${recipe.id}/edit`}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                    </Link>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      disabled={isDeleting}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {showViewAll && recipes.length >= limit && (
              <div className="text-center pt-4">
                <Link
                  to={isCurrentUser ? '/recipes/user' : `/recipes/user/${userId}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Recipes
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
