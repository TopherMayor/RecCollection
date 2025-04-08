import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, Button } from '../ui';
import { useRecipes } from '../../context/RecipeContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export function RecipeList() {
  const location = useLocation();
  const { recipes, loading, pagination, fetchRecipes, likeRecipe, unlikeRecipe, saveRecipe, unsaveRecipe } = useRecipes();
  const { user } = useAuth();
  const { showToast } = useUI();
  
  // Parse search params from URL
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const tagId = searchParams.get('tagId') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  
  // Fetch recipes when search params change
  useEffect(() => {
    fetchRecipes({
      page,
      limit: 10,
      search: search || undefined,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      tagId: tagId ? parseInt(tagId, 10) : undefined,
      difficulty: difficulty || undefined,
      sortBy: sortBy || undefined,
      sortOrder: (sortOrder as 'asc' | 'desc') || undefined,
    });
  }, [fetchRecipes, page, search, categoryId, tagId, difficulty, sortBy, sortOrder]);
  
  const handleLike = async (id: number, isLiked: boolean) => {
    if (!user) {
      showToast('Please log in to like recipes', 'error');
      return;
    }
    
    if (isLiked) {
      await unlikeRecipe(id);
    } else {
      await likeRecipe(id);
    }
  };
  
  const handleSave = async (id: number, isSaved: boolean) => {
    if (!user) {
      showToast('Please log in to save recipes', 'error');
      return;
    }
    
    if (isSaved) {
      await unsaveRecipe(id);
    } else {
      await saveRecipe(id);
    }
  };
  
  const renderPagination = () => {
    const totalPages = pagination.pages;
    
    if (totalPages <= 1) {
      return null;
    }
    
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    const createPageUrl = (pageNum: number) => {
      const params = new URLSearchParams(location.search);
      params.set('page', pageNum.toString());
      return `${location.pathname}?${params.toString()}`;
    };
    
    return (
      <div className="flex justify-center mt-8">
        <nav className="flex items-center space-x-2">
          {page > 1 && (
            <Link
              to={createPageUrl(page - 1)}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          
          {pageNumbers.map((pageNum) => (
            <Link
              key={pageNum}
              to={createPageUrl(pageNum)}
              className={`px-3 py-1 rounded ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </Link>
          ))}
          
          {page < totalPages && (
            <Link
              to={createPageUrl(page + 1)}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </nav>
      </div>
    );
  };
  
  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-500 mb-6">
                {search || categoryId || tagId || difficulty
                  ? 'Try adjusting your search filters'
                  : 'Be the first to add a recipe!'}
              </p>
              {user && (
                <Link to="/recipes/create">
                  <Button>Create Recipe</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 lg:w-1/4">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16"
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
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/recipes/${recipe.id}`}
                          className="text-xl font-bold hover:text-blue-600 transition-colors"
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
                          {' • '}
                          {new Date(recipe.createdAt).toLocaleDateString()}
                          {recipe.isPrivate && (
                            <>
                              {' • '}
                              <span className="text-orange-500">Private</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLike(recipe.id, recipe.isLiked || false)}
                          className={`p-2 rounded-full ${
                            recipe.isLiked
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          aria-label={recipe.isLiked ? 'Unlike' : 'Like'}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill={recipe.isLiked ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleSave(recipe.id, recipe.isSaved || false)}
                          className={`p-2 rounded-full ${
                            recipe.isSaved
                              ? 'text-blue-600 hover:bg-blue-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          aria-label={recipe.isSaved ? 'Unsave' : 'Save'}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill={recipe.isSaved ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3 line-clamp-2">
                      {recipe.description || 'No description provided.'}
                    </p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {recipe.categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/recipes?categoryId=${category.id}`}
                          className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                      
                      {recipe.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/recipes?tagId=${tag.id}`}
                          className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
                      {recipe.prepTime && (
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Prep: {recipe.prepTime} min</span>
                        </div>
                      )}
                      
                      {recipe.cookingTime && (
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                            />
                          </svg>
                          <span>Cook: {recipe.cookingTime} min</span>
                        </div>
                      )}
                      
                      {recipe.difficultyLevel && (
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span>
                            Difficulty:{' '}
                            <span
                              className={
                                recipe.difficultyLevel === 'easy'
                                  ? 'text-green-600'
                                  : recipe.difficultyLevel === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }
                            >
                              {recipe.difficultyLevel.charAt(0).toUpperCase() +
                                recipe.difficultyLevel.slice(1)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{recipe.likeCount}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <span>{recipe.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {renderPagination()}
        </div>
      )}
    </div>
  );
}
