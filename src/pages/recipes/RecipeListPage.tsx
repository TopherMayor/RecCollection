import { MainLayout } from '../../components/layout/MainLayout';
import { RecipeSearch } from '../../components/recipes/RecipeSearch';
import { RecipeList } from '../../components/recipes/RecipeList';
import { CategoryList } from '../../components/recipes/CategoryList';
import { TagCloud } from '../../components/recipes/TagCloud';

export function RecipeListPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Recipes</h1>
          <p className="text-gray-600">
            Discover delicious recipes shared by our community. Use the filters to find exactly what you're looking for.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <RecipeSearch />
            <CategoryList limit={5} />
            <TagCloud limit={15} />
          </div>
          
          <div className="lg:col-span-3">
            <RecipeList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
