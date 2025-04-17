# RecCollection

RecCollection is a web application that allows users to create and share recipes. The platform enables users to import recipes from social media platforms like Instagram and TikTok, and utilizes AI to generate recipe names and descriptions.

## Features

- Create, edit, and delete recipes
- Import recipes from Instagram and TikTok
- AI-generated recipe names and descriptions
- Search and filter recipes
- User authentication and profiles
- Social features (likes, comments, sharing)

## Tech Stack

- **Runtime Environment**: Node.js/npm or Bun (both supported)
- **Backend Framework**: Hono
- **Database ORM**: Drizzle
- **Database**: PostgreSQL
- **Frontend Framework**: React
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Project Structure

```
RecCollection/
├── docs/                 # Project documentation
├── app/                  # Application code
│   ├── backend/          # Backend API and server
│   │   ├── src/          # Backend source code
│   │   │   ├── controllers/  # API controllers
│   │   │   ├── db/           # Database configuration and schema
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/     # Business logic
│   │   │   ├── utils/        # Utility functions
│   │   │   └── server.ts     # Server entry point
│   │   ├── tests/        # Backend tests
│   │   └── scripts/      # Backend utility scripts
│   ├── frontend/         # Frontend React application
│   │   ├── src/          # Frontend source code
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── pages/        # Page components
│   │   │   ├── api/          # API client
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── types/        # TypeScript type definitions
│   │   │   ├── utils/        # Utility functions
│   │   │   └── App.tsx       # Main application component
│   │   └── tests/        # Frontend tests
│   └── docs/             # Application-specific documentation
├── scripts/              # Project-wide utility scripts
├── cypress/              # End-to-end tests
├── .github/              # GitHub workflows and configuration
└── .ai_rules             # AI rules for the project
```

Each part of the application (backend and frontend) has its own `package.json` and dependencies, while the root directory contains scripts to manage the entire project.

## Documentation

Detailed documentation is available in the `docs` directory:

- [Project Overview](docs/project_overview.md)
- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [API Documentation](docs/api_documentation.md)
- [Database Schema](docs/database_schema.md)
- [Frontend Components](docs/frontend_components.md)
- [UI Component Library](docs/UI_COMPONENT_LIBRARY.md)
- [Responsive Design](docs/responsive-design.md)
- [AI Integration](docs/ai_integration.md)
- [Social Media Import](docs/social_media_import.md)
- [Image Handling](docs/image_handling.md)
- [Testing Strategy](docs/testing_strategy.md)
- [Deployment Strategy](docs/deployment_strategy.md)
- [Security Considerations](docs/security_considerations.md)
- [Project Setup](docs/project_setup.md)
- [Development Roadmap](docs/roadmap.md)

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later) with npm
- Bun (v1.0.0 or later) - optional, project supports both npm and Bun
- PostgreSQL (v14.0 or later)
- Git

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/RecCollection.git
   cd RecCollection
   ```

2. Install dependencies:

   With npm:

   ```bash
   npm install
   cd app/frontend && npm install
   cd ../backend && npm install
   ```

   With Bun:

   ```bash
   bun install
   cd app/frontend && bun install
   cd ../backend && bun install
   ```

3. Set up environment variables:

   ```bash
   cp app/backend/.env.example app/backend/.env
   cp app/frontend/.env.example app/frontend/.env.development
   ```

   Edit the `.env` files with your database credentials and other settings.

4. Set up the database:

   With npm:

   ```bash
   cd app/backend && npm run db:setup
   ```

   With Bun:

   ```bash
   cd app/backend && bun run db:setup:bun
   ```

5. Start the development servers:

   With npm:

   ```bash
   npm run dev:all
   ```

   With Bun:

   ```bash
   npm run dev:all:bun
   ```

   Or start frontend and backend separately:

   Frontend (npm):

   ```bash
   npm run dev
   ```

   Backend (npm):

   ```bash
   npm run dev:backend
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

## Current State

The project is currently in active development with the following components implemented:

### Backend

- Complete API implementation with Hono.js
- Database schema and migrations with Drizzle ORM
- Authentication system with JWT
- Recipe CRUD operations
- AI integration for recipe name and description generation
- Social media import functionality

### Frontend

- User interface with React and Tailwind CSS
- Comprehensive UI component library for consistent styling
- Authentication pages (login, register, profile)
- Recipe pages (list, detail, create)
- Import functionality for social media recipes
- Responsive design for mobile and desktop
- Notification system with email and SMS integration
- Recipe sharing via email, SMS, and shareable links

## Utility Scripts

The project includes utility scripts in the `scripts/` directory to help with development and maintenance tasks:

```bash
# Check for console.log statements in the codebase
npm run lint:console

# With Bun
bun run lint:console:bun
```

See the [scripts README](scripts/README.md) for more details on available scripts.

## Testing

The project uses a comprehensive testing strategy:

### Unit Testing

Unit tests are written using Vitest and React Testing Library. Run the tests with:

With npm:

```bash
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run test:backend   # Run backend tests
npm run test:all       # Run all tests (frontend and backend)
```

With Bun:

```bash
npm run test:bun           # Run frontend tests with Bun
npm run test:watch:bun     # Run tests in watch mode with Bun
npm run test:coverage:bun  # Run tests with coverage report with Bun
npm run test:backend:bun   # Run backend tests with Bun
npm run test:all:bun       # Run all tests with Bun
```

### End-to-End Testing

End-to-end tests are written using Cypress. Run the tests with:

With npm:

```bash
npm run cypress:open  # Open Cypress Test Runner
npm run cypress:run   # Run Cypress tests headlessly
npm run e2e           # Start dev server and run tests
npm run e2e:open      # Start dev server and open Cypress
```

With Bun:

```bash
npm run cypress:open:bun  # Open Cypress Test Runner with Bun
npm run cypress:run:bun   # Run Cypress tests headlessly with Bun
npm run e2e:bun           # Start dev server and run tests with Bun
npm run e2e:open:bun      # Start dev server and open Cypress with Bun
```

## Development Workflow

1. Create a new branch for your feature or bug fix
2. Make your changes
3. Write tests for your changes (unit and E2E)
4. Run the tests to ensure they pass
5. Submit a pull request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
