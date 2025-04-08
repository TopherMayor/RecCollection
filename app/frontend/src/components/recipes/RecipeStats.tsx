import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui';
import { useUI } from '../../context/UIContext';

// Mock stats for now
const MOCK_STATS = {
  totalRecipes: 248,
  totalUsers: 87,
  totalLikes: 1243,
  totalComments: 562,
  popularCategories: [
    { name: 'Dinner', count: 56 },
    { name: 'Breakfast', count: 42 },
    { name: 'Lunch', count: 37 },
  ],
  popularTags: [
    { name: 'easy', count: 67 },
    { name: 'quick', count: 42 },
    { name: 'healthy', count: 38 },
  ],
};

interface RecipeStatsProps {
  title?: string;
}

export function RecipeStats({ title = 'Recipe Stats' }: RecipeStatsProps) {
  const [stats, setStats] = useState<typeof MOCK_STATS | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useUI();
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // In a real app, we would fetch stats from the API
        // const response = await statsService.getStats();
        // setStats(response.data);
        
        // Mock implementation
        setTimeout(() => {
          setStats(MOCK_STATS);
          setLoading(false);
        }, 500);
      } catch (error) {
        showToast('Failed to load stats', 'error');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [showToast]);
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">{title}</h2>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : !stats ? (
          <p className="text-gray-500 text-center py-4">No stats available</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalRecipes}</div>
                <div className="text-sm text-gray-600">Recipes</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Popular Categories</h3>
              <div className="space-y-2">
                {stats.popularCategories.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">{category.count} recipes</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stats.popularTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
