import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardContent } from '../components/ui';

export function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About RecCollection</h1>
        
        <div className="space-y-8">
          <Card>
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                RecCollection was created with a simple mission: to help home cooks organize, discover, and share their favorite recipes. We believe that cooking is not just about feeding ourselves, but about creativity, connection, and culture.
              </p>
              <p className="text-gray-700">
                Our platform brings together the best of traditional recipe management with modern social media integration, allowing you to save recipes from your favorite content creators and organize them in one place.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Create and organize your own recipe collection</li>
                <li>Import recipes directly from Instagram and TikTok</li>
                <li>AI-powered recipe name and description generation</li>
                <li>Search and filter recipes by ingredients, difficulty, and more</li>
                <li>Share your recipes with friends and family</li>
                <li>Save your favorite recipes from other users</li>
                <li>Mobile-friendly design for cooking on the go</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Our Team</h2>
              <p className="text-gray-700 mb-4">
                RecCollection was developed by a small team of passionate foodies and developers who wanted to create a better way to organize recipes from across the web.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-blue-600 text-2xl font-bold">CJ</span>
                  </div>
                  <h3 className="font-bold">Christopher Mayor</h3>
                  <p className="text-gray-600">Founder & Developer</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-green-600 text-2xl font-bold">AI</span>
                  </div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-gray-600">Recipe Analysis</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-purple-100 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-purple-600 text-2xl font-bold">RC</span>
                  </div>
                  <h3 className="font-bold">Recipe Community</h3>
                  <p className="text-gray-600">Content Contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                We'd love to hear from you! Whether you have feedback, questions, or just want to share your favorite recipe, feel free to reach out.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Email: <a href="mailto:contact@reccollection.com" className="text-blue-600 hover:underline">contact@reccollection.com</a></p>
                <p className="font-medium">Twitter: <a href="https://twitter.com/reccollection" className="text-blue-600 hover:underline">@reccollection</a></p>
                <p className="font-medium">Instagram: <a href="https://instagram.com/reccollection" className="text-blue-600 hover:underline">@reccollection</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
