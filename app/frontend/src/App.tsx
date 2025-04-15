import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DevAutoLogin from "./components/DevAutoLogin";
import DeepLinkHandler from "./components/DeepLinkHandler";

// Layouts
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout";
import PublicLayout from "./components/layout/PublicLayout";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
// Authenticated pages
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import ImportRecipe from "./pages/ImportRecipe";

import SimpleRecipes from "./pages/SimpleRecipes";
import ProfilePage from "./pages/ProfilePage";
import SearchResults from "./pages/SearchResults";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Auto-login component for development - only active when env var is set */}
        {import.meta.env.DEV && <DevAutoLogin />}
        <DeepLinkHandler />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route
              path="direct-login"
              element={<Navigate to="/login?mode=direct" replace />}
            />
            <Route
              path="emergency-login"
              element={<Navigate to="/login?mode=emergency" replace />}
            />
            <Route path="shared/:token" element={<RecipeDetail />} />
            <Route path="import" element={<ImportRecipe />} />
          </Route>

          {/* Authenticated routes */}
          <Route path="/app" element={<AuthenticatedLayout />}>
            <Route index element={<Navigate to="/app/recipes" replace />} />
            <Route path="recipes" element={<Home />} />
            <Route path="simple-recipes" element={<SimpleRecipes />} />
            <Route path="recipe/:id" element={<RecipeDetail />} />
            <Route path="create" element={<CreateRecipe />} />
            <Route path="import" element={<ImportRecipe />} />
            <Route path="edit/:id" element={<EditRecipe />} />

            <Route path="profile/:username" element={<ProfilePage />} />
            <Route path="search" element={<SearchResults />} />
          </Route>

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-lg text-gray-600 mb-6">Page not found</p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href="/"
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Go Home
                    </a>
                    <a
                      href="/app/recipes"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                      My Recipes
                    </a>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
