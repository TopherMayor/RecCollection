import { MainLayout } from '../../components/layout/MainLayout';
import { RecipeImport } from '../../components/import';

export function ImportPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Recipe</h1>
          <p className="text-gray-600">
            Import recipes from your favorite social media platforms. Simply paste the URL and we'll do the rest.
          </p>
        </div>
        
        <RecipeImport />
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-blue-800 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-blue-700">1. Copy the URL</h3>
              <p>Find a recipe post on Instagram or TikTok and copy the URL.</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-700">2. Paste and Import</h3>
              <p>Paste the URL above, select the source platform, and click Import.</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-700">3. Review and Edit</h3>
              <p>
                Review the imported recipe and make any necessary edits before saving.
                Our AI will try to extract all the details, but it might need some help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
