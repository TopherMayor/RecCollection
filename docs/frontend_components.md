# RecCollection Frontend Components

## Overview
This document outlines the key components that will be developed for the RecCollection frontend. The application will use React with TypeScript, styled with Tailwind CSS and shadcn/ui components.

## Layout Components

### AppLayout
The main layout wrapper for the application.
- Header with navigation
- Main content area
- Footer
- Responsive sidebar for mobile navigation

### AuthLayout
Layout for authentication pages.
- Centered content
- Logo and branding
- Form container

## Page Components

### HomePage
Landing page for the application.
- Featured recipes
- Categories showcase
- Call-to-action for registration
- Search functionality

### RecipeListPage
Page displaying a list of recipes.
- Filtering options
- Sorting controls
- Recipe cards grid
- Pagination

### RecipeDetailPage
Page displaying detailed information about a recipe.
- Recipe header with image
- Ingredients list
- Instructions steps
- Comments section
- Like and save buttons
- Share functionality

### RecipeCreatePage
Form page for creating a new recipe.
- Multi-step form
- Image upload
- Ingredients management
- Instructions management
- Categories and tags selection
- AI generation options

### RecipeEditPage
Form page for editing an existing recipe.
- Pre-filled multi-step form
- Image management
- Ingredients editing
- Instructions editing
- Categories and tags management

### UserProfilePage
Page displaying user profile information.
- User details
- User's recipes
- Saved recipes
- Following/followers

### SearchResultsPage
Page displaying search results.
- Filter controls
- Search results list
- Related categories

### ImportPage
Page for importing recipes from external sources.
- URL input
- Preview of imported content
- Edit options before saving

## Reusable Components

### RecipeCard
Card component displaying recipe preview.
- Image
- Title
- Brief description
- Author
- Cooking time
- Difficulty level
- Like/save buttons

### RecipeForm
Form component for creating/editing recipes.
- Title and description inputs
- Cooking details inputs
- Image upload
- Dynamic ingredients list
- Dynamic instructions list
- Categories and tags selection

### IngredientsManager
Component for managing recipe ingredients.
- Add/remove ingredients
- Reorder ingredients
- Quantity and unit inputs

### InstructionsManager
Component for managing recipe instructions.
- Add/remove steps
- Reorder steps
- Rich text editor for step descriptions
- Image upload for steps

### CommentSection
Component for displaying and adding comments.
- Comment list
- Comment form
- Reply functionality

### UserAvatar
Component for displaying user avatar with various sizes.
- Image
- Fallback to initials
- Online status indicator (optional)

### CategoryBadge
Badge component for displaying recipe categories.
- Category name
- Color coding
- Click action for filtering

### TagList
Component for displaying and managing tags.
- Horizontal list of tags
- Add/remove functionality for forms

### LikeButton
Button component for liking recipes.
- Icon
- Count
- Toggle functionality

### SaveButton
Button component for saving recipes.
- Icon
- Toggle functionality

### SearchBar
Component for searching recipes.
- Input field
- Search button
- Autocomplete suggestions

### Pagination
Component for paginating through lists.
- Page numbers
- Previous/next buttons
- Items per page selector

### ImageUploader
Component for uploading and managing images.
- Drag and drop area
- Preview
- Crop functionality
- Remove button

### AIGenerationButton
Button component for triggering AI generation.
- Icon
- Loading state
- Result display

## Authentication Components

### LoginForm
Form component for user login.
- Email/username input
- Password input
- Remember me checkbox
- Submit button
- Forgot password link

### RegisterForm
Form component for user registration.
- Username input
- Email input
- Password input
- Confirm password input
- Terms acceptance checkbox
- Submit button

### ForgotPasswordForm
Form component for password recovery.
- Email input
- Submit button

### ResetPasswordForm
Form component for resetting password.
- New password input
- Confirm password input
- Submit button

## Navigation Components

### MainNavigation
Component for main navigation.
- Logo
- Navigation links
- User menu
- Search bar

### UserMenu
Dropdown menu for user-related actions.
- Profile link
- My recipes link
- Saved recipes link
- Settings link
- Logout button

### MobileNavigation
Component for navigation on mobile devices.
- Hamburger menu
- Slide-out sidebar
- Navigation links
- User menu

### Breadcrumbs
Component for showing navigation path.
- Current page
- Parent pages
- Home link

## Utility Components

### LoadingSpinner
Component for indicating loading state.
- Spinner animation
- Optional text

### ErrorMessage
Component for displaying error messages.
- Icon
- Message text
- Optional retry action

### SuccessMessage
Component for displaying success messages.
- Icon
- Message text
- Optional action button

### Modal
Component for displaying modal dialogs.
- Header
- Content area
- Footer with actions
- Close button

### Tooltip
Component for displaying additional information on hover.
- Trigger element
- Tooltip content
- Position options

### ConfirmDialog
Component for confirming user actions.
- Question text
- Confirm button
- Cancel button

## Component Hierarchy

```
AppLayout
├── MainNavigation
│   ├── Logo
│   ├── NavigationLinks
│   ├── SearchBar
│   └── UserMenu
├── Content
│   ├── HomePage
│   │   ├── FeaturedRecipes
│   │   │   └── RecipeCard
│   │   ├── CategoriesShowcase
│   │   │   └── CategoryBadge
│   │   └── CallToAction
│   ├── RecipeListPage
│   │   ├── FilterControls
│   │   ├── RecipeGrid
│   │   │   └── RecipeCard
│   │   └── Pagination
│   ├── RecipeDetailPage
│   │   ├── RecipeHeader
│   │   ├── IngredientsList
│   │   ├── InstructionsList
│   │   ├── ActionButtons
│   │   │   ├── LikeButton
│   │   │   ├── SaveButton
│   │   │   └── ShareButton
│   │   └── CommentSection
│   ├── RecipeCreatePage
│   │   └── RecipeForm
│   │       ├── ImageUploader
│   │       ├── IngredientsManager
│   │       ├── InstructionsManager
│   │       └── AIGenerationButton
│   └── UserProfilePage
│       ├── UserInfo
│       ├── UserRecipes
│       │   └── RecipeCard
│       └── SavedRecipes
│           └── RecipeCard
└── Footer
```

## State Management

The application will use React Context API for global state management:

### AuthContext
Manages user authentication state.
- Current user
- Login/logout functions
- Authentication status

### RecipeContext
Manages recipe-related state.
- Current recipe
- Recipe list
- Filtering options

### UIContext
Manages UI-related state.
- Loading states
- Error messages
- Modal visibility

## Routing

The application will use React Router v7 for routing:

```
/                       - HomePage
/recipes                - RecipeListPage
/recipes/:id            - RecipeDetailPage
/recipes/create         - RecipeCreatePage
/recipes/:id/edit       - RecipeEditPage
/users/:username        - UserProfilePage
/search                 - SearchResultsPage
/import                 - ImportPage
/login                  - LoginPage
/register               - RegisterPage
/forgot-password        - ForgotPasswordPage
/reset-password/:token  - ResetPasswordPage
```
