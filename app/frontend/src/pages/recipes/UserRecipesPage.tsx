import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Card, CardContent } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useRecipes } from '../../context/RecipeContext';
import { useUI } from '../../context/UIContext';
import { authService, User } from '../../api/auth';

export function UserRecipesPage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { recipes, loading, pagination, fetchRecipes } = useRecipes();
  const { showToast } = useUI();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      
      setLoadingUser(true);
      
      try {
        // This would be a real API call in production
        // const response = await authService.getUserByUsername(username);
        
        // Mock implementation for now
        const mockUser: User = {
          id: 123,
          username: username,
          email: `${username}@example.com`,
          displayName: username.charAt(0).toUpperCase() + username.slice(1),
          bio: `This is ${username}'s profile. They love cooking and sharing recipes!`,
          avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
          createdAt: new Date().toISOString(),
        };
        
        setProfileUser(mockUser);
      } catch (error) {
        showToast('Failed to load user profile', 'error');
      } finally {
        setLoadingUser(false);
      }
    };
    
    fetchUserProfile();
  }, [username, showToast]);
  
  // Fetch user's recipes
  useEffect(() => {
    if (profileUser) {
      fetchRecipes({ userId: profileUser.id, page: 1, limit: 12 });
    }
  }, [profileUser, fetchRecipes]);
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (profileUser) {
      fetchRecipes({ userId: profileUser.id, page, limit: pagination.limit });
    }
  };
  
  if (loadingUser) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading user profile...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (!profileUser) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Link to="/recipes">
            <Button>Browse Recipes</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  const isCurrentUser = currentUser && currentUser.username === profileUser.username;
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* User profile header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              {profileUser.avatarUrl ? (
                <img
                  src={profileUser.avatarUrl}
                  alt={profileUser.displayName || profileUser.username}
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl">
                  {profileUser.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {profileUser.displayName || profileUser.username}
              </h1>
              <p className="text-gray-500 mb-4">@{profileUser.username}</p>
              {profileUser.bio && <p className="text-gray-700 mb-4">{profileUser.bio}</p>}
              <p className="text-gray-500 text-sm">
                Member since {new Date(profileUser.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isCurrentUser && (
              <div className="flex-shrink-0">
                <Link to="/profile">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* User's recipes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isCurrentUser ? 'Your Recipes' : `${profileUser.displayName || profileUser.username}'s Recipes`}
            </h2>
            {isCurrentUser && (
              <Link to="/recipes/create">
                <Button>Create Recipe</Button>
              </Link>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-600 mb-4">
                {isCurrentUser
                  ? "You haven't created any recipes yet"
                  : `${profileUser.displayName || profileUser.username} hasn't created any recipes yet`}
              </h3>
              {isCurrentUser && (
                <Link to="/recipes/create">
                  <Button>Create Your First Recipe</Button>
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
                          <div className="flex items-center text-sm text-gray-500">
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {recipe.cookingTime ? `${recipe.cookingTime} min` : 'N/A'}
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
      </div>
    </MainLayout>
  );
}
