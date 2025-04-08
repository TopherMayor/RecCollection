import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, Button, Input } from '../ui';
import { importService } from '../../api/import';
import { useUI } from '../../context/UIContext';

export function RecipeImport() {
  const navigate = useNavigate();
  const { showToast } = useUI();
  
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'instagram' | 'tiktok'>('instagram');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (source === 'instagram') {
        response = await importService.importFromInstagram(url);
      } else {
        response = await importService.importFromTikTok(url);
      }
      
      if (response.data?.recipe) {
        showToast('Recipe imported successfully!', 'success');
        navigate(`/recipes/${response.data.recipe.id}`);
      } else {
        setError(response.error || 'Failed to import recipe');
        showToast(response.error || 'Failed to import recipe', 'error');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Import Recipe</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="source"
                  value="instagram"
                  checked={source === 'instagram'}
                  onChange={() => setSource('instagram')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2">Instagram</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="source"
                  value="tiktok"
                  checked={source === 'tiktok'}
                  onChange={() => setSource('tiktok')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2">TikTok</span>
              </label>
            </div>
          </div>
          
          <Input
            id="url"
            name="url"
            type="text"
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={error}
            placeholder={`Enter ${source === 'instagram' ? 'Instagram' : 'TikTok'} URL`}
          />
          
          <div>
            <Button type="submit" isLoading={loading}>
              Import Recipe
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>
              <strong>Note:</strong> This will attempt to extract recipe information from the provided URL.
              The extraction may not be perfect and you may need to edit the recipe after import.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
