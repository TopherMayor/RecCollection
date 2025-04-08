import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui';
import { useUI } from '../../context/UIContext';

// Mock categories for now
const MOCK_CATEGORIES = [
  { id: 1, name: 'Breakfast', count: 42 },
  { id: 2, name: 'Lunch', count: 37 },
  { id: 3, name: 'Dinner', count: 56 },
  { id: 4, name: 'Dessert', count: 28 },
  { id: 5, name: 'Appetizer', count: 19 },
  { id: 6, name: 'Snack', count: 23 },
  { id: 7, name: 'Vegetarian', count: 31 },
  { id: 8, name: 'Vegan', count: 17 },
  { id: 9, name: 'Gluten-Free', count: 14 },
  { id: 10, name: 'Keto', count: 11 },
];

interface Category {
  id: number;
  name: string;
  count: number;
}

interface CategoryListProps {
  title?: string;
  limit?: number;
}

export function CategoryList({ title = 'Categories', limit }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useUI();
  
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      
      try {
        // In a real app, we would fetch categories from the API
        // const response = await categoryService.getCategories();
        // setCategories(response.data);
        
        // Mock implementation
        setTimeout(() => {
          setCategories(MOCK_CATEGORIES);
          setLoading(false);
        }, 500);
      } catch (error) {
        showToast('Failed to load categories', 'error');
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [showToast]);
  
  const displayCategories = limit ? categories.slice(0, limit) : categories;
  
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
            
            {limit && categories.length > limit && (
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
