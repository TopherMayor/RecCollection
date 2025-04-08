// We're using dynamic imports in App.tsx for code splitting
// This file is kept for backward compatibility

export { default as HomePage } from "./HomePage";
export { default as NotFoundPage } from "./NotFoundPage";

// Static pages
export { default as AboutPage } from "./static/AboutPage";
export { default as PrivacyPage } from "./static/PrivacyPage";
export { default as TermsPage } from "./static/TermsPage";

// Auth pages
export { LoginPage, RegisterPage, ProfilePage } from "./auth";

// Recipe pages
export {
  RecipeListPage,
  RecipeDetailPage,
  CreateRecipePage,
  UserRecipesPage,
  SavedRecipesPage,
} from "./recipes";

// Import pages
export { ImportPage } from "./import";
