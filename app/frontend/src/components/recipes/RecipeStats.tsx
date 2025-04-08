import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "../ui";
import { useStats } from "../../context/StatsContext";

interface RecipeStatsProps {
  title?: string;
}

export function RecipeStats({ title = "Recipe Stats" }: RecipeStatsProps) {
  const { recipeStats, loading, fetchRecipeStats } = useStats();

  useEffect(() => {
    // Fetch recipe stats when component mounts
    fetchRecipeStats();
  }, [fetchRecipeStats]);

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
        ) : !recipeStats ? (
          <p className="text-gray-500 text-center py-4">No stats available</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recipeStats.totalRecipes}
                </div>
                <div className="text-sm text-gray-600">Recipes</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recipeStats.totalUsers}
                </div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {recipeStats.totalLikes}
                </div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recipeStats.totalComments}
                </div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Popular Categories
              </h3>
              <div className="space-y-2">
                {recipeStats.popularCategories.map((category, index) => (
                  <div
                    key={category.id || index}
                    className="flex justify-between items-center"
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {category.count} recipes
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipeStats.popularTags.map((tag, index) => (
                  <span
                    key={tag.id || index}
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
