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
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  RecipeListPage,
  RecipeDetailPage,
  CreateRecipePage,
  UserRecipesPage,
  SavedRecipesPage,
  ImportPage,
  NotFoundPage,
  AboutPage,
  PrivacyPage,
  TermsPage,
} from "./pages";

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
                    <Route path="/" element={<HomePage />} />

                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Recipes */}
                    <Route path="/recipes" element={<RecipeListPage />} />
                    <Route
                      path="/recipes/create"
                      element={
                        <ProtectedRoute>
                          <CreateRecipePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recipes/saved"
                      element={
                        <ProtectedRoute>
                          <SavedRecipesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recipes/user/:username"
                      element={<UserRecipesPage />}
                    />
                    <Route path="/recipes/:id" element={<RecipeDetailPage />} />

                    {/* Import */}
                    <Route
                      path="/import"
                      element={
                        <ProtectedRoute>
                          <ImportPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Static Pages */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {/* Not Found */}
                    <Route path="/404" element={<NotFoundPage />} />
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
