import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui';
import { useUI } from '../../context/UIContext';

// Mock tags for now
const MOCK_TAGS = [
  { id: 1, name: 'quick', count: 42 },
  { id: 2, name: 'easy', count: 67 },
  { id: 3, name: 'healthy', count: 38 },
  { id: 4, name: 'italian', count: 29 },
  { id: 5, name: 'mexican', count: 24 },
  { id: 6, name: 'asian', count: 31 },
  { id: 7, name: 'dessert', count: 35 },
  { id: 8, name: 'baking', count: 22 },
  { id: 9, name: 'grilling', count: 18 },
  { id: 10, name: 'soup', count: 15 },
  { id: 11, name: 'salad', count: 27 },
  { id: 12, name: 'breakfast', count: 33 },
  { id: 13, name: 'dinner', count: 41 },
  { id: 14, name: 'lunch', count: 29 },
  { id: 15, name: 'snack', count: 19 },
];

interface Tag {
  id: number;
  name: string;
  count: number;
}

interface TagCloudProps {
  title?: string;
  limit?: number;
}

export function TagCloud({ title = 'Popular Tags', limit }: TagCloudProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useUI();
  
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      
      try {
        // In a real app, we would fetch tags from the API
        // const response = await tagService.getTags();
        // setTags(response.data);
        
        // Mock implementation
        setTimeout(() => {
          setTags(MOCK_TAGS);
          setLoading(false);
        }, 500);
      } catch (error) {
        showToast('Failed to load tags', 'error');
        setLoading(false);
      }
    };
    
    fetchTags();
  }, [showToast]);
  
  // Calculate font size based on tag count
  const getTagSize = (count: number) => {
    const max = Math.max(...tags.map((tag) => tag.count));
    const min = Math.min(...tags.map((tag) => tag.count));
    const range = max - min;
    const normalized = range === 0 ? 1 : (count - min) / range;
    return 0.8 + normalized * 0.7; // Scale between 0.8rem and 1.5rem
  };
  
  const displayTags = limit ? tags.slice(0, limit) : tags;
  
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
            
            {limit && tags.length > limit && (
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
