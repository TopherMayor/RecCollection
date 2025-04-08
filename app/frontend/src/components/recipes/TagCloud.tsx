import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../ui";
import { useTags } from "../../context/TagContext";

interface TagCloudProps {
  title?: string;
  limit?: number;
}

export function TagCloud({ title = "Popular Tags", limit }: TagCloudProps) {
  const { popularTags, loading, fetchPopularTags } = useTags();

  useEffect(() => {
    // Fetch popular tags when component mounts
    fetchPopularTags(limit ? limit * 2 : 30); // Fetch more than needed in case we want to show "View all"
  }, [fetchPopularTags, limit]);

  // Calculate font size based on tag count
  const getTagSize = (count: number) => {
    if (popularTags.length === 0) return 1;

    const max = Math.max(...popularTags.map((tag) => tag.count));
    const min = Math.min(...popularTags.map((tag) => tag.count));
    const range = max - min;
    const normalized = range === 0 ? 1 : (count - min) / range;
    return 0.8 + normalized * 0.7; // Scale between 0.8rem and 1.5rem
  };

  const displayTags = limit ? popularTags.slice(0, limit) : popularTags;

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
        ) : displayTags.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tags found</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag) => (
              <Link
                key={tag.id}
                to={`/recipes?tag=${tag.name}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors"
                style={{ fontSize: `${getTagSize(tag.count)}rem` }}
              >
                #{tag.name}
              </Link>
            ))}

            {limit && popularTags.length > limit && (
              <Link
                to="/tags"
                className="block w-full text-center text-blue-600 hover:text-blue-800 font-medium mt-4"
              >
                View all tags
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
