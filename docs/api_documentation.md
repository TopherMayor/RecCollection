# RecCollection API Documentation

## Base URL
```
/api
```

## Authentication
Most endpoints require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register a new user
```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2023-06-01T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get current user
```
GET /auth/me
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "bio": "I love cooking!",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2023-06-01T12:00:00Z"
}
```

### Recipes

#### Get all recipes
```
GET /recipes
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `category`: Filter by category
- `user_id`: Filter by user

**Response:**
```json
{
  "recipes": [
    {
      "id": 1,
      "title": "Chocolate Chip Cookies",
      "description": "Classic homemade chocolate chip cookies",
      "user": {
        "id": 1,
        "username": "johndoe"
      },
      "cooking_time": 15,
      "difficulty_level": "easy",
      "image_url": "https://example.com/cookies.jpg",
      "created_at": "2023-06-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Get recipe by ID
```
GET /recipes/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "user": {
    "id": 1,
    "username": "johndoe"
  },
  "cooking_time": 15,
  "prep_time": 10,
  "serving_size": 12,
  "difficulty_level": "easy",
  "image_url": "https://example.com/cookies.jpg",
  "ingredients": [
    {
      "id": 1,
      "name": "All-purpose flour",
      "quantity": 2.25,
      "unit": "cups",
      "order_index": 1
    },
    {
      "id": 2,
      "name": "Chocolate chips",
      "quantity": 2,
      "unit": "cups",
      "order_index": 2
    }
  ],
  "instructions": [
    {
      "id": 1,
      "step_number": 1,
      "description": "Preheat oven to 375°F"
    },
    {
      "id": 2,
      "step_number": 2,
      "description": "Mix dry ingredients in a bowl"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Dessert"
    },
    {
      "id": 2,
      "name": "Baking"
    }
  ],
  "tags": [
    {
      "id": 1,
      "name": "cookies"
    },
    {
      "id": 2,
      "name": "chocolate"
    }
  ],
  "created_at": "2023-06-01T12:00:00Z",
  "updated_at": "2023-06-01T12:00:00Z"
}
```

#### Create a recipe
```
POST /recipes
```

**Request Body:**
```json
{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "cooking_time": 15,
  "prep_time": 10,
  "serving_size": 12,
  "difficulty_level": "easy",
  "image_url": "https://example.com/cookies.jpg",
  "ingredients": [
    {
      "name": "All-purpose flour",
      "quantity": 2.25,
      "unit": "cups",
      "order_index": 1
    },
    {
      "name": "Chocolate chips",
      "quantity": 2,
      "unit": "cups",
      "order_index": 2
    }
  ],
  "instructions": [
    {
      "step_number": 1,
      "description": "Preheat oven to 375°F"
    },
    {
      "step_number": 2,
      "description": "Mix dry ingredients in a bowl"
    }
  ],
  "categories": [1, 2],
  "tags": ["cookies", "chocolate"]
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade chocolate chip cookies",
  "user_id": 1,
  "created_at": "2023-06-01T12:00:00Z"
}
```

#### Update a recipe
```
PUT /recipes/:id
```

**Request Body:**
Same as create recipe

**Response:**
```json
{
  "id": 1,
  "title": "Updated Chocolate Chip Cookies",
  "description": "Updated description",
  "updated_at": "2023-06-02T12:00:00Z"
}
```

#### Delete a recipe
```
DELETE /recipes/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe deleted successfully"
}
```

### Social Features

#### Like a recipe
```
POST /recipes/:id/like
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe liked successfully"
}
```

#### Unlike a recipe
```
DELETE /recipes/:id/like
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe unliked successfully"
}
```

#### Save a recipe
```
POST /recipes/:id/save
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe saved successfully"
}
```

#### Unsave a recipe
```
DELETE /recipes/:id/save
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe unsaved successfully"
}
```

#### Add a comment
```
POST /recipes/:id/comments
```

**Request Body:**
```json
{
  "content": "This recipe is amazing!"
}
```

**Response:**
```json
{
  "id": 1,
  "content": "This recipe is amazing!",
  "user": {
    "id": 1,
    "username": "johndoe"
  },
  "created_at": "2023-06-01T12:00:00Z"
}
```

#### Get recipe comments
```
GET /recipes/:id/comments
```

**Response:**
```json
{
  "comments": [
    {
      "id": 1,
      "content": "This recipe is amazing!",
      "user": {
        "id": 1,
        "username": "johndoe"
      },
      "created_at": "2023-06-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Recipe Import

#### Import from Instagram
```
POST /import/instagram
```

**Request Body:**
```json
{
  "url": "https://www.instagram.com/p/ABC123/"
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "id": 2,
    "title": "Imported Recipe",
    "description": "Imported from Instagram",
    "source_url": "https://www.instagram.com/p/ABC123/",
    "source_type": "instagram"
  }
}
```

#### Import from TikTok
```
POST /import/tiktok
```

**Request Body:**
```json
{
  "url": "https://www.tiktok.com/@user/video/123456"
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "id": 3,
    "title": "Imported Recipe",
    "description": "Imported from TikTok",
    "source_url": "https://www.tiktok.com/@user/video/123456",
    "source_type": "tiktok"
  }
}
```

### AI Features

#### Generate recipe name
```
POST /ai/generate-name
```

**Request Body:**
```json
{
  "ingredients": ["flour", "sugar", "eggs", "chocolate"],
  "instructions": ["Mix dry ingredients", "Add wet ingredients", "Bake at 350°F"]
}
```

**Response:**
```json
{
  "success": true,
  "name": "Classic Chocolate Cake"
}
```

#### Generate recipe description
```
POST /ai/generate-description
```

**Request Body:**
```json
{
  "name": "Classic Chocolate Cake",
  "ingredients": ["flour", "sugar", "eggs", "chocolate"],
  "instructions": ["Mix dry ingredients", "Add wet ingredients", "Bake at 350°F"]
}
```

**Response:**
```json
{
  "success": true,
  "description": "A rich and moist chocolate cake made with simple ingredients. Perfect for any occasion!"
}
```

## Error Responses

### Authentication Error
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": {
    "title": "Title is required"
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Recipe not found"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Server Error",
  "message": "An unexpected error occurred"
}
```
