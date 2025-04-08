import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../ui";
import { useCategories } from "../../context/CategoryContext";

interface CategoryListProps {
  title?: string;
  limit?: number;
}

export function CategoryList({
  title = "Categories",
  limit,
}: CategoryListProps) {
  const { popularCategories, loading, fetchPopularCategories } =
    useCategories();

  useEffect(() => {
    // Fetch popular categories when component mounts
    fetchPopularCategories(limit ? limit * 2 : 20); // Fetch more than needed in case we want to show "View all"
  }, [fetchPopularCategories, limit]);

  const displayCategories = limit
    ? popularCategories.slice(0, limit)
    : popularCategories;

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
        ) : displayCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No categories found</p>
        ) : (
          <div className="space-y-2">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`/recipes?categoryId=${category.id}`}
                className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </Link>
            ))}

            {limit && popularCategories.length > limit && (
              <Link
                to="/categories"
                className="block text-center text-blue-600 hover:text-blue-800 font-medium mt-4"
              >
                View all categories
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
