# RecCollection Frontend API Client

## Overview
This document outlines how to use the frontend API client to interact with the backend API. The API client is structured with namespaces for different resource types, making it easier to organize and maintain API calls.

## API Client Structure

The API client is organized into namespaces for different resource types:

```typescript
export const api = {
  // Auth token management
  setAuthToken,
  
  // Auth endpoints
  auth: {
    login,
    register,
    logout,
    me,
    getUserProfile,
  },
  
  // Recipe endpoints
  recipes: {
    getAll,
    getFollowing,
    getById,
    create,
    update,
    delete,
    batchDelete,
    like,
    unlike,
    save,
    unsave,
    getComments,
    addComment,
  },
  
  // AI endpoints
  ai: {
    generateRecipe,
    enhanceDescription,
  },
  
  // Import endpoints
  import: {
    fromUrl,
  },
  
  // Upload endpoints
  upload: {
    image,
  },
  
  // Notification endpoints
  notifications: {
    getAll,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    delete,
    getPreferences,
    updatePreferences,
  },
  
  // Collections API
  collections: {
    getAll,
    getById,
    create,
    update,
    delete,
    addRecipe,
    removeRecipe,
  },
};
```

## How to Use the API Client

### Authentication

```typescript
// Set the authentication token (usually done in the auth context)
api.setAuthToken(token);

// Login
const loginResponse = await api.auth.login(email, password);

// Register
const registerResponse = await api.auth.register({
  username,
  email,
  password,
  displayName,
});

// Get current user
const userResponse = await api.auth.me();

// Get user profile
const profileResponse = await api.auth.getUserProfile(username);
```

### Recipes

```typescript
// Get all recipes
const recipesResponse = await api.recipes.getAll({
  page: 1,
  limit: 10,
  search: "chocolate",
});

// Get recipe by ID
const recipeResponse = await api.recipes.getById(1);

// Create recipe
const newRecipeResponse = await api.recipes.create({
  title: "Chocolate Cake",
  description: "Delicious chocolate cake",
  // other recipe fields
});

// Update recipe
const updatedRecipeResponse = await api.recipes.update(1, {
  title: "Updated Chocolate Cake",
  // other fields to update
});

// Delete recipe
const deleteResponse = await api.recipes.delete(1);

// Batch delete recipes
const batchDeleteResponse = await api.recipes.batchDelete([1, 2, 3]);

// Like/unlike a recipe
const likeResponse = await api.recipes.like(1);
const unlikeResponse = await api.recipes.unlike(1);

// Save/unsave a recipe
const saveResponse = await api.recipes.save(1);
const unsaveResponse = await api.recipes.unsave(1);

// Get recipe comments
const commentsResponse = await api.recipes.getComments(1);

// Add a comment
const commentResponse = await api.recipes.addComment(1, "Great recipe!");
```

### Collections

```typescript
// Get all collections
const collectionsResponse = await api.collections.getAll();

// Get collection by ID
const collectionResponse = await api.collections.getById(1);

// Create collection
const newCollectionResponse = await api.collections.create({
  name: "Favorite Desserts",
  description: "My favorite dessert recipes",
});

// Update collection
const updatedCollectionResponse = await api.collections.update(1, {
  name: "Updated Collection Name",
  description: "Updated description",
});

// Delete collection
const deleteCollectionResponse = await api.collections.delete(1);

// Add recipe to collection
const addRecipeResponse = await api.collections.addRecipe(1, 2); // Add recipe ID 2 to collection ID 1

// Remove recipe from collection
const removeRecipeResponse = await api.collections.removeRecipe(1, 2); // Remove recipe ID 2 from collection ID 1
```

### Notifications

```typescript
// Get all notifications
const notificationsResponse = await api.notifications.getAll(1, 10); // page 1, limit 10

// Get unread count
const unreadCountResponse = await api.notifications.getUnreadCount();

// Mark notification as read
const markReadResponse = await api.notifications.markAsRead(1);

// Mark all notifications as read
const markAllReadResponse = await api.notifications.markAllAsRead();

// Delete notification
const deleteNotificationResponse = await api.notifications.delete(1);
```

### Uploads

```typescript
// Upload image
const imageResponse = await api.upload.image(fileObject);
```

### AI Features

```typescript
// Generate recipe
const generatedRecipeResponse = await api.ai.generateRecipe("chocolate cake with strawberries");

// Enhance description
const enhancedDescriptionResponse = await api.ai.enhanceDescription("Simple chocolate cake");
```

### Import

```typescript
// Import recipe from URL
const importedRecipeResponse = await api.import.fromUrl("https://example.com/recipe");
```

## Error Handling

The API client includes built-in error handling. Errors are caught and formatted consistently:

```typescript
try {
  const response = await api.recipes.getById(999); // Non-existent recipe
} catch (error) {
  console.error("Error details:", error);
  // error will contain status, message, and other details
}
```

## Important Notes

1. **Always use the namespaced methods** instead of direct HTTP methods like `get`, `post`, etc.
   - ❌ `api.get("/collections")` - This will not work
   - ✅ `api.collections.getAll()` - This is the correct way

2. **Authentication token** is automatically included in all requests after setting it with `api.setAuthToken()`.

3. **Response format** is consistent across all endpoints:
   - Success responses include `success: true` and the requested data
   - Error responses are thrown as exceptions with details about the error

4. **Pagination** is supported for list endpoints with `page` and `limit` parameters.

5. **Search and filtering** is supported for applicable endpoints with appropriate parameters.
