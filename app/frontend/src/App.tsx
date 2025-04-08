import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import { RecipeProvider } from "./context/RecipeContext";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  RecipeListPage,
  RecipeDetailPage,
  CreateRecipePage,
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
            <Routes>
              {/* Home */}
              <Route path="/" element={<HomePage />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Recipes */}
              <Route path="/recipes" element={<RecipeListPage />} />
              <Route path="/recipes/create" element={<CreateRecipePage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />

              {/* Import */}
              <Route path="/import" element={<ImportPage />} />

              {/* Static Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Not Found */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </RecipeProvider>
        </UIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
