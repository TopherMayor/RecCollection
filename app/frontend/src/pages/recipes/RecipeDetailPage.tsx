import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Card, CardContent } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useRecipes } from '../../context/RecipeContext';
import { useUI } from '../../context/UIContext';

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { currentRecipe, loading, fetchRecipe, likeRecipe, unlikeRecipe, deleteRecipe } = useRecipes();
  const { showToast, showModal } = useUI();
  const navigate = useNavigate();
  
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Fetch recipe on mount
  useEffect(() => {
    if (id) {
      fetchRecipe(parseInt(id));
    }
  }, [id, fetchRecipe]);
  
  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!user) {
      showToast('Please log in to like recipes', 'info');
      navigate('/login');
      return;
    }
    
    if (!currentRecipe) return;
    
    if (currentRecipe.isLiked) {
      await unlikeRecipe(currentRecipe.id);
    } else {
      await likeRecipe(currentRecipe.id);
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!currentRecipe) return;
    
    showModal({
      title: 'Delete Recipe',
      content: (
        <div>
          <p className="mb-4">Are you sure you want to delete "{currentRecipe.title}"?</p>
          <p className="text-red-600">This action cannot be undone.</p>
        </div>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const success = await deleteRecipe(currentRecipe.id);
        if (success) {
          showToast('Recipe deleted successfully', 'success');
          navigate('/recipes');
        }
      },
    });
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast('Please log in to comment', 'info');
      navigate('/login');
      return;
    }
    
    if (!currentRecipe || !commentContent.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      // This would be implemented with a real API call
      // const response = await recipeService.addComment(currentRecipe.id, commentContent);
      // if (response.data) {
      //   setComments([response.data, ...comments]);
      //   setCommentContent('');
      //   showToast('Comment added successfully', 'success');
      // }
      
      // Mock implementation
      const newComment = {
        id: Date.now(),
        content: commentContent,
        createdAt: new Date().toISOString(),
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
      };
      
      setComments([newComment, ...comments]);
      setCommentContent('');
      showToast('Comment added successfully', 'success');
    } catch (error) {
      showToast('Failed to add comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading recipe...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!currentRecipe) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
          <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
          <Link to="/recipes">
            <Button>Browse Recipes</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Recipe header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{currentRecipe.title}</h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleLikeToggle}
                className={currentRecipe.isLiked ? 'text-red-600' : ''}
              >
                <svg
                  className="h-5 w-5 mr-1"
                  fill={currentRecipe.isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {currentRecipe.likeCount}
              </Button>
              
              {user && user.id === currentRecipe.user.id && (
                <>
                  <Link to={`/recipes/${currentRecipe.id}/edit`}>
                    <Button variant="outline">
                      <svg
                        className="h-5 w-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Button>
                  </Link>
                  <Button variant="danger" onClick={handleDelete}>
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-6">
              {currentRecipe.user.avatarUrl ? (
                <img
                  src={currentRecipe.user.avatarUrl}
                  alt={currentRecipe.user.username}
                  className="h-8 w-8 rounded-full mr-2"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mr-2">
                  {currentRecipe.user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-gray-700">
                {currentRecipe.user.displayName || currentRecipe.user.username}
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              {new Date(currentRecipe.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          {currentRecipe.imageUrl && (
            <div className="mb-6">
              <img
                src={currentRecipe.imageUrl}
                alt={currentRecipe.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          {currentRecipe.description && (
            <div className="mb-6">
              <p className="text-gray-700">{currentRecipe.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {currentRecipe.prepTime && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Prep Time</h3>
                <p className="text-lg font-bold">{currentRecipe.prepTime} min</p>
              </div>
            )}
            {currentRecipe.cookingTime && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Cooking Time</h3>
                <p className="text-lg font-bold">{currentRecipe.cookingTime} min</p>
              </div>
            )}
            {currentRecipe.servingSize && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-gray-500 text-sm font-medium mb-1">Servings</h3>
                <p className="text-lg font-bold">{currentRecipe.servingSize}</p>
              </div>
            )}
          </div>
          
          {currentRecipe.categories.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {currentRecipe.categories.map((category) => (
                  <span
                    key={category.id}
                    className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Recipe content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Ingredients */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
            <ul className="space-y-3">
              {currentRecipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-3 flex-shrink-0">
                    •
                  </span>
                  <span>
                    <strong>
                      {ingredient.quantity && `${ingredient.quantity} `}
                      {ingredient.unit && `${ingredient.unit} `}
                    </strong>
                    {ingredient.name}
                    {ingredient.notes && (
                      <span className="block text-sm text-gray-500">{ingredient.notes}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Instructions */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Instructions</h2>
            <ol className="space-y-6">
              {currentRecipe.instructions.map((instruction) => (
                <li key={instruction.id} className="flex">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-lg font-medium mr-4 flex-shrink-0">
                    {instruction.stepNumber}
                  </span>
                  <div>
                    <p>{instruction.description}</p>
                    {instruction.imageUrl && (
                      <img
                        src={instruction.imageUrl}
                        alt={`Step ${instruction.stepNumber}`}
                        className="mt-2 rounded-lg max-h-48 object-cover"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {/* Tags */}
        {currentRecipe.tags.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {currentRecipe.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Comments */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Comments ({currentRecipe.commentCount})</h2>
          
          {/* Comment form */}
          <Card className="mb-6">
            <CardContent>
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Add a comment
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Share your thoughts..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSubmittingComment} disabled={!commentContent.trim()}>
                    Post Comment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Comments list */}
          {comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        {comment.user.avatarUrl ? (
                          <img
                            src={comment.user.avatarUrl}
                            alt={comment.user.username}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            {comment.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold">
                            {comment.user.displayName || comment.user.username}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
