import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "./components/auth";
import {
  AuthProvider,
  UIProvider,
  RecipeProvider,
  CategoryProvider,
  TagProvider,
  StatsProvider,
} from "./context";

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
  </div>
);

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/auth/ProfilePage"));
const RecipeListPage = lazy(() => import("./pages/recipes/RecipeListPage"));
const RecipeDetailPage = lazy(() => import("./pages/recipes/RecipeDetailPage"));
const CreateRecipePage = lazy(() => import("./pages/recipes/CreateRecipePage"));
const UserRecipesPage = lazy(() => import("./pages/recipes/UserRecipesPage"));
const SavedRecipesPage = lazy(() => import("./pages/recipes/SavedRecipesPage"));
const ImportPage = lazy(() => import("./pages/import/ImportPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AboutPage = lazy(() => import("./pages/static/AboutPage"));
const PrivacyPage = lazy(() => import("./pages/static/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/static/TermsPage"));

function App() {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <RecipeProvider>
            <CategoryProvider>
              <TagProvider>
                <StatsProvider>
                  <Routes>
                    {/* Home */}
                    <Route
                      path="/"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <HomePage />
                        </Suspense>
                      }
                    />

                    {/* Auth */}
                    <Route
                      path="/login"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <LoginPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <RegisterPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <ProfilePage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />

                    {/* Recipes */}
                    <Route
                      path="/recipes"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <RecipeListPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/recipes/create"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <CreateRecipePage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recipes/saved"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <SavedRecipesPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recipes/user/:username"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <UserRecipesPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/recipes/:id"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <RecipeDetailPage />
                        </Suspense>
                      }
                    />

                    {/* Import */}
                    <Route
                      path="/import"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <ImportPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />

                    {/* Static Pages */}
                    <Route
                      path="/about"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <AboutPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/privacy"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <PrivacyPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/terms"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <TermsPage />
                        </Suspense>
                      }
                    />

                    {/* Not Found */}
                    <Route
                      path="/404"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <NotFoundPage />
                        </Suspense>
                      }
                    />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </StatsProvider>
              </TagProvider>
            </CategoryProvider>
          </RecipeProvider>
        </UIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
