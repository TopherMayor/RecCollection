# RecCollection Database Schema

## Overview
This document outlines the database schema for the RecCollection application. The schema is designed to support all the core functionality of the application, including user management, recipe storage, and social features.

## Tables

### users
Stores user account information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### recipes
Stores recipe information.

```sql
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  cooking_time INTEGER, -- in minutes
  prep_time INTEGER, -- in minutes
  serving_size INTEGER,
  difficulty_level VARCHAR(20), -- easy, medium, hard
  image_url VARCHAR(255),
  source_url VARCHAR(255), -- for imported recipes
  source_type VARCHAR(50), -- instagram, tiktok, manual
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### ingredients
Stores ingredients for recipes.

```sql
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  quantity DECIMAL,
  unit VARCHAR(30),
  order_index INTEGER NOT NULL,
  notes TEXT
);
```

### instructions
Stores step-by-step instructions for recipes.

```sql
CREATE TABLE instructions (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(255)
);
```

### categories
Stores recipe categories.

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);
```

### recipe_categories
Junction table for recipes and categories (many-to-many).

```sql
CREATE TABLE recipe_categories (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);
```

### tags
Stores recipe tags.

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);
```

### recipe_tags
Junction table for recipes and tags (many-to-many).

```sql
CREATE TABLE recipe_tags (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);
```

### comments
Stores user comments on recipes.

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### likes
Stores user likes on recipes.

```sql
CREATE TABLE likes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id)
);
```

### saved_recipes
Stores recipes saved by users.

```sql
CREATE TABLE saved_recipes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id)
);
```

### follows
Stores user follow relationships.

```sql
CREATE TABLE follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id)
);
```

### ai_generations
Stores history of AI-generated content.

```sql
CREATE TABLE ai_generations (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generation_type VARCHAR(50) NOT NULL, -- name, description, etc.
  input_data JSONB,
  output_content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Recipes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_title ON recipes(title);

-- Ingredients
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);

-- Instructions
CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);

-- Comments
CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Likes
CREATE INDEX idx_likes_recipe_id ON likes(recipe_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Saved Recipes
CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);

-- Follows
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
```

## Relationships

- A user can create many recipes (one-to-many)
- A recipe belongs to one user (many-to-one)
- A recipe has many ingredients (one-to-many)
- A recipe has many instructions (one-to-many)
- A recipe can have many categories (many-to-many)
- A recipe can have many tags (many-to-many)
- A user can like many recipes (many-to-many)
- A user can save many recipes (many-to-many)
- A user can follow many users (many-to-many)
- A user can be followed by many users (many-to-many)
- A user can comment on many recipes (one-to-many)
- A recipe can have many comments (one-to-many)
