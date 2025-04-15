import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-40"
            src="https://images.unsplash.com/photo-1555243896-c709bfa0b564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
            alt="Cooking background"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">RecCollection</h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Your personal recipe collection. Save, organize, and share your favorite recipes from across the web.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link
              to="/recipes"
              className="inline-block bg-indigo-600 py-3 px-6 border border-transparent rounded-md text-base font-medium text-white hover:bg-indigo-700"
            >
              Browse Recipes
            </Link>
            <Link
              to="/register"
              className="inline-block bg-white py-3 px-6 border border-transparent rounded-md text-base font-medium text-indigo-600 hover:bg-gray-50"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Everything you need for your recipes
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              RecCollection makes it easy to save, organize, and share your favorite recipes.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
              <div className="relative">
                <div className="relative h-80 bg-white rounded-lg shadow-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 lg:aspect-w-1 lg:aspect-h-1">
                  <img
                    src="https://images.unsplash.com/photo-1607877361964-d8a3f7101aca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                    alt="Save recipes from anywhere"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  <span className="absolute inset-0"></span>
                  Save recipes from anywhere
                </h3>
                <p className="text-base text-gray-500">
                  Import recipes from your favorite websites, social media, or create your own from scratch.
                </p>
              </div>

              <div className="relative">
                <div className="relative h-80 bg-white rounded-lg shadow-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 lg:aspect-w-1 lg:aspect-h-1">
                  <img
                    src="https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1784&q=80"
                    alt="Organize your collection"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  <span className="absolute inset-0"></span>
                  Organize your collection
                </h3>
                <p className="text-base text-gray-500">
                  Categorize recipes, add tags, and create custom collections to keep everything organized.
                </p>
              </div>

              <div className="relative">
                <div className="relative h-80 bg-white rounded-lg shadow-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 lg:aspect-w-1 lg:aspect-h-1">
                  <img
                    src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
                    alt="Share with friends"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  <span className="absolute inset-0"></span>
                  Share with friends
                </h3>
                <p className="text-base text-gray-500">
                  Share your favorite recipes with friends and family, or keep them private - it's up to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start your collection?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of food enthusiasts who are already using RecCollection to organize their favorite recipes.
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>

      {/* Testimonial section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Loved by home cooks everywhere
            </p>
          </div>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white font-medium">JD</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">John Doe</h3>
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <svg
                            key={rating}
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-base text-gray-500">
                    "RecCollection has completely changed how I organize my recipes. No more scattered bookmarks or screenshots!"
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white font-medium">AS</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Alice Smith</h3>
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <svg
                            key={rating}
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-base text-gray-500">
                    "I love being able to import recipes from Instagram and TikTok with just a click. So convenient!"
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                      <span className="text-white font-medium">RJ</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Robert Johnson</h3>
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <svg
                            key={rating}
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-base text-gray-500">
                    "As someone who loves to cook, having all my recipes in one place with proper categorization has been a game-changer."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
