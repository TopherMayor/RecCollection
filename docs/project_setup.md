# RecCollection Project Setup

## Prerequisites

Before setting up the RecCollection project, ensure you have the following installed:

- **Bun**: JavaScript runtime and package manager (v1.0.0 or later)
- **Node.js**: JavaScript runtime (v18.0.0 or later)
- **PostgreSQL**: Database (v14.0 or later)
- **Git**: Version control system

## Repository Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/RecCollection.git
   cd RecCollection
   ```

2. Create the necessary directories:
   ```bash
   mkdir -p app/backend app/frontend
   ```

## Backend Setup

### Initialize Backend Project

1. Navigate to the backend directory:
   ```bash
   cd app/backend
   ```

2. Initialize a new Bun project:
   ```bash
   bun init
   ```
   - Answer the prompts to set up the project
   - Set the package name to `reccollection-backend`
   - Choose TypeScript as the language

3. Install dependencies:
   ```bash
   bun add hono @hono/zod-validator
   bun add drizzle-orm postgres
   bun add jsonwebtoken bcrypt
   bun add @types/jsonwebtoken @types/bcrypt -d
   bun add drizzle-kit -d
   ```

### Configure Database

1. Create a PostgreSQL database:
   ```bash
   createdb reccollection
   ```

2. Create a `.env` file in the backend directory:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/reccollection
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

3. Set up Drizzle ORM:
   ```bash
   mkdir -p src/db
   ```

4. Create a database schema file at `src/db/schema.ts` based on the schema defined in the database documentation.

5. Create a Drizzle configuration file:
   ```bash
   # drizzle.config.ts
   import type { Config } from 'drizzle-kit';
   
   export default {
     schema: './src/db/schema.ts',
     out: './src/db/migrations',
     driver: 'pg',
     dbCredentials: {
       connectionString: process.env.DATABASE_URL || '',
     },
   } satisfies Config;
   ```

6. Generate migrations:
   ```bash
   bun drizzle-kit generate:pg
   ```

7. Create a database client file at `src/db/index.ts`:
   ```typescript
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';
   import * as schema from './schema';
   
   const connectionString = process.env.DATABASE_URL || '';
   const client = postgres(connectionString);
   export const db = drizzle(client, { schema });
   ```

### Set Up API Structure

1. Create the basic directory structure:
   ```bash
   mkdir -p src/routes src/controllers src/services src/middleware src/utils
   ```

2. Create a main application file at `src/index.ts`:
   ```typescript
   import { Hono } from 'hono';
   import { logger } from 'hono/logger';
   import { cors } from 'hono/cors';
   import { secureHeaders } from 'hono/secure-headers';
   import { authRoutes } from './routes/auth';
   import { recipeRoutes } from './routes/recipes';
   
   const app = new Hono();
   
   // Middleware
   app.use('*', logger());
   app.use('*', cors({
     origin: ['http://localhost:5173'],
     credentials: true,
   }));
   app.use('*', secureHeaders());
   
   // Routes
   app.route('/api/auth', authRoutes);
   app.route('/api/recipes', recipeRoutes);
   
   // Health check
   app.get('/', (c) => c.json({ status: 'ok' }));
   
   export default app;
   ```

3. Create a server file at `src/server.ts`:
   ```typescript
   import { serve } from '@hono/node-server';
   import app from './index';
   
   const port = parseInt(process.env.PORT || '3000', 10);
   
   console.log(`Server is running on port ${port}`);
   
   serve({
     fetch: app.fetch,
     port,
   });
   ```

### Configure Scripts

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "bun run --watch src/server.ts",
    "build": "bun build src/server.ts --outdir dist",
    "start": "bun run dist/server.js",
    "db:migrate": "bun drizzle-kit migrate:pg",
    "db:studio": "bun drizzle-kit studio",
    "test": "bun test"
  }
}
```

## Frontend Setup

### Initialize Frontend Project

1. Navigate to the frontend directory:
   ```bash
   cd ../../app/frontend
   ```

2. Create a new React project with Vite:
   ```bash
   bun create vite . --template react-ts
   ```

3. Install dependencies:
   ```bash
   bun install
   bun add react-router-dom@7
   bun add tailwindcss postcss autoprefixer -d
   bun add @tailwindcss/forms @tailwindcss/typography
   ```

4. Set up Tailwind CSS:
   ```bash
   bunx tailwindcss init -p
   ```

5. Configure Tailwind CSS in `tailwind.config.js`:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [
       require('@tailwindcss/forms'),
       require('@tailwindcss/typography'),
     ],
   }
   ```

6. Update `src/index.css` with Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Set Up shadcn/ui

1. Initialize shadcn/ui:
   ```bash
   bunx shadcn-ui@latest init
   ```
   - Follow the prompts to configure shadcn/ui
   - Choose Tailwind CSS as the styling solution
   - Set the component directory to `src/components/ui`

2. Install some basic components:
   ```bash
   bunx shadcn-ui@latest add button card input form
   ```

### Configure API Client

1. Create an API client directory:
   ```bash
   mkdir -p src/api
   ```

2. Create a base API client at `src/api/client.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

   export interface ApiResponse<T> {
     data?: T;
     error?: string;
     message?: string;
   }

   export async function apiClient<T>(
     endpoint: string,
     options: RequestInit = {}
   ): Promise<ApiResponse<T>> {
     const token = localStorage.getItem('token');
     
     const headers = {
       'Content-Type': 'application/json',
       ...(token ? { Authorization: `Bearer ${token}` } : {}),
       ...options.headers,
     };
     
     const config = {
       ...options,
       headers,
     };
     
     try {
       const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
       const data = await response.json();
       
       if (!response.ok) {
         return {
           error: data.error || 'An unexpected error occurred',
           message: data.message,
         };
       }
       
       return { data };
     } catch (error) {
       return {
         error: 'Network error',
         message: error instanceof Error ? error.message : 'Unknown error',
       };
     }
   }
   ```

### Set Up Application Structure

1. Create the basic directory structure:
   ```bash
   mkdir -p src/components/layout src/components/recipes src/pages src/hooks src/context src/utils
   ```

2. Create a router file at `src/router.tsx`:
   ```tsx
   import { createBrowserRouter, RouterProvider } from 'react-router-dom';
   import App from './App';
   import HomePage from './pages/HomePage';
   import NotFoundPage from './pages/NotFoundPage';
   
   const router = createBrowserRouter([
     {
       path: '/',
       element: <App />,
       errorElement: <NotFoundPage />,
       children: [
         {
           index: true,
           element: <HomePage />,
         },
         // Add more routes here
       ],
     },
   ]);
   
   export function Router() {
     return <RouterProvider router={router} />;
   }
   ```

3. Update `src/main.tsx`:
   ```tsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { Router } from './router';
   import './index.css';
   
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <Router />
     </React.StrictMode>,
   );
   ```

4. Update `src/App.tsx`:
   ```tsx
   import { Outlet } from 'react-router-dom';
   import { MainLayout } from './components/layout/MainLayout';
   
   function App() {
     return (
       <MainLayout>
         <Outlet />
       </MainLayout>
     );
   }
   
   export default App;
   ```

### Configure Environment Variables

Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:3000/api
```

### Configure Scripts

Ensure your `package.json` has the following scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

## Root Project Setup

1. Navigate back to the project root:
   ```bash
   cd ../..
   ```

2. Create a root `package.json` for managing both projects:
   ```json
   {
     "name": "reccollection",
     "version": "1.0.0",
     "private": true,
     "workspaces": [
       "app/backend",
       "app/frontend"
     ],
     "scripts": {
       "dev:backend": "cd app/backend && bun run dev",
       "dev:frontend": "cd app/frontend && bun run dev",
       "dev": "concurrently \"bun run dev:backend\" \"bun run dev:frontend\"",
       "build:backend": "cd app/backend && bun run build",
       "build:frontend": "cd app/frontend && bun run build",
       "build": "bun run build:backend && bun run build:frontend",
       "start": "cd app/backend && bun run start"
     },
     "devDependencies": {
       "concurrently": "^8.2.0"
     }
   }
   ```

3. Install the root dependencies:
   ```bash
   bun install
   ```

## Database Setup

1. Start PostgreSQL if it's not already running:
   ```bash
   # On macOS
   brew services start postgresql
   
   # On Ubuntu
   sudo service postgresql start
   ```

2. Run the database migrations:
   ```bash
   cd app/backend
   bun run db:migrate
   ```

## Running the Application

1. From the project root, start both the backend and frontend:
   ```bash
   bun run dev
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## Next Steps

After setting up the project, you can:

1. Implement the authentication system
2. Create the recipe CRUD operations
3. Develop the frontend components
4. Integrate with AI services
5. Implement social media import functionality

Refer to the project documentation for detailed information on each component and feature.

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure the database exists

2. **Port Conflicts**:
   - If ports 3000 or 5173 are in use, modify the port in the respective configuration

3. **Dependency Issues**:
   - Run `bun install` in the specific project directory
   - Check for compatibility issues in the console

### Getting Help

If you encounter issues not covered here, please:
1. Check the error logs
2. Consult the project documentation
3. Reach out to the development team
