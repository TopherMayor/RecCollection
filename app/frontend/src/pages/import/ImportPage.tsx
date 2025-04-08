import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Card, CardContent, CardHeader, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { importService } from '../../api/import';

export function ImportPage() {
  const { user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isImportingInstagram, setIsImportingInstagram] = useState(false);
  const [isImportingTiktok, setIsImportingTiktok] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validate Instagram URL
  const validateInstagramUrl = () => {
    if (!instagramUrl.trim()) {
      setErrors((prev) => ({ ...prev, instagram: 'URL is required' }));
      return false;
    }
    
    const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|tv|reel)\/([^\/\?]+)/;
    if (!instagramPattern.test(instagramUrl)) {
      setErrors((prev) => ({ ...prev, instagram: 'Invalid Instagram URL' }));
      return false;
    }
    
    setErrors((prev) => ({ ...prev, instagram: '' }));
    return true;
  };
  
  // Validate TikTok URL
  const validateTiktokUrl = () => {
    if (!tiktokUrl.trim()) {
      setErrors((prev) => ({ ...prev, tiktok: 'URL is required' }));
      return false;
    }
    
    const tiktokPattern = /^https?:\/\/(www\.)?(tiktok\.com)\/@([^\/]+)\/video\/(\d+)/;
    if (!tiktokPattern.test(tiktokUrl)) {
      setErrors((prev) => ({ ...prev, tiktok: 'Invalid TikTok URL' }));
      return false;
    }
    
    setErrors((prev) => ({ ...prev, tiktok: '' }));
    return true;
  };
  
  // Import from Instagram
  const handleImportFromInstagram = async () => {
    if (!validateInstagramUrl()) return;
    
    setIsImportingInstagram(true);
    
    try {
      const response = await importService.importFromInstagram(instagramUrl);
      
      if (response.data?.recipe) {
        showToast('Recipe imported successfully from Instagram', 'success');
        navigate(`/recipes/${response.data.recipe.id}`);
      } else {
        showToast(response.error || 'Failed to import recipe from Instagram', 'error');
      }
    } catch (error) {
      showToast('An error occurred while importing from Instagram', 'error');
    } finally {
      setIsImportingInstagram(false);
    }
  };
  
  // Import from TikTok
  const handleImportFromTiktok = async () => {
    if (!validateTiktokUrl()) return;
    
    setIsImportingTiktok(true);
    
    try {
      const response = await importService.importFromTikTok(tiktokUrl);
      
      if (response.data?.recipe) {
        showToast('Recipe imported successfully from TikTok', 'success');
        navigate(`/recipes/${response.data.recipe.id}`);
      } else {
        showToast(response.error || 'Failed to import recipe from TikTok', 'error');
      }
    } catch (error) {
      showToast('An error occurred while importing from TikTok', 'error');
    } finally {
      setIsImportingTiktok(false);
    }
  };
  
  // Redirect if not logged in
  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Please log in to import recipes</h2>
          <Button onClick={() => navigate('/login')}>Log In</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Import Recipes</h1>
        
        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            Import recipes directly from your favorite social media platforms. Just paste the URL of the post containing the recipe, and we'll do the rest.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Import from Instagram */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <svg
                  className="h-8 w-8 text-pink-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <h2 className="text-xl font-bold">Import from Instagram</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Paste the URL of an Instagram post containing a recipe to import it.
                </p>
                <Input
                  id="instagram-url"
                  label="Instagram URL"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  error={errors.instagram}
                  placeholder="https://www.instagram.com/p/example123/"
                  required
                />
                <Button
                  onClick={handleImportFromInstagram}
                  isLoading={isImportingInstagram}
                  disabled={isImportingInstagram || !instagramUrl.trim()}
                  fullWidth
                >
                  Import from Instagram
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Import from TikTok */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <svg
                  className="h-8 w-8 text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
                <h2 className="text-xl font-bold">Import from TikTok</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Paste the URL of a TikTok video containing a recipe to import it.
                </p>
                <Input
                  id="tiktok-url"
                  label="TikTok URL"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  error={errors.tiktok}
                  placeholder="https://www.tiktok.com/@username/video/1234567890"
                  required
                />
                <Button
                  onClick={handleImportFromTiktok}
                  isLoading={isImportingTiktok}
                  disabled={isImportingTiktok || !tiktokUrl.trim()}
                  fullWidth
                >
                  Import from TikTok
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Find a recipe post on Instagram or TikTok that you want to save.</li>
            <li>Copy the URL of the post.</li>
            <li>Paste the URL in the appropriate field above.</li>
            <li>Click the import button.</li>
            <li>Review and edit the imported recipe as needed.</li>
          </ol>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Note: Our AI will do its best to extract the recipe details from the post. You may need to make some adjustments after importing.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
