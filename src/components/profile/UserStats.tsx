import { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui';
import { useStats } from '../../context/StatsContext';

interface UserStatsProps {
  userId?: number;
}

export function UserStats({ userId }: UserStatsProps) {
  const { userStats, loading, fetchUserStats } = useStats();
  
  useEffect(() => {
    fetchUserStats(userId);
  }, [fetchUserStats, userId]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Your Stats</h2>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!userStats) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Your Stats</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No stats available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Your Stats</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{userStats.totalRecipes}</div>
            <div className="text-sm text-gray-600">Recipes</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{userStats.totalLikes}</div>
            <div className="text-sm text-gray-600">Likes Received</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{userStats.totalSaved}</div>
            <div className="text-sm text-gray-600">Saved Recipes</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{userStats.totalComments}</div>
            <div className="text-sm text-gray-600">Comments</div>
          </div>
        </div>
        
        {userStats.mostLikedRecipe && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Most Popular Recipe</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium">{userStats.mostLikedRecipe.title}</div>
              <div className="text-sm text-gray-500 mt-1">
                {userStats.mostLikedRecipe.likeCount} likes
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
