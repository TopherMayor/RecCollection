# RecCollection Backend

This is the backend API for the RecCollection application, built with Hono, Drizzle ORM, and PostgreSQL.

## Features

- User authentication with JWT
- Recipe management (create, read, update, delete)
- Social features (likes, comments)
- AI-assisted recipe generation
- Social media recipe import

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: JWT
- **Validation**: Zod

## Getting Started

### Prerequisites

- Bun (v1.0.0 or later)
- PostgreSQL (v14.0 or later)

### Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file with your database credentials and JWT secret.

3. Set up the database:
   ```bash
   ./setup-db.sh
   ```
   This will create the database, run migrations, and seed initial data.

### Development

Start the development server:

```bash
bun run dev
```

The server will be available at http://localhost:3000.

### Database Management

- Generate migrations:

  ```bash
  bun run db:generate
  ```

- Run migrations:

  ```bash
  bun run db:migrate
  ```

- Seed the database:

  ```bash
  bun run db:seed
  ```

- Open Drizzle Studio:
  ```bash
  bun run db:studio
  ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Recipes

- `GET /api/recipes` - List recipes
- `POST /api/recipes` - Create a recipe
- `GET /api/recipes/:id` - Get recipe details
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe
- `POST /api/recipes/:id/like` - Like a recipe
- `DELETE /api/recipes/:id/like` - Unlike a recipe
- `POST /api/recipes/:id/comments` - Comment on a recipe
- `GET /api/recipes/:id/comments` - Get recipe comments

### AI Features

- `POST /api/ai/generate-name` - Generate recipe name
- `POST /api/ai/generate-description` - Generate recipe description

### Import

- `POST /api/import/instagram` - Import from Instagram
- `POST /api/import/tiktok` - Import from TikTok

## Project Structure

```
src/
├── controllers/     # Request handlers
├── db/              # Database configuration and migrations
├── middleware/      # Middleware functions
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── index.ts         # Main application
└── server.ts        # Server entry point
```
