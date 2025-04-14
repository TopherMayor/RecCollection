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

- **Runtime Environment**: Bun
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
├── docs/                 # Documentation
├── app/                  # Application code
│   ├── backend/          # Backend API and server
│   └── frontend/         # Frontend React application
├── scripts/              # Utility scripts
└── .ai_rules             # AI rules for the project
```

## Documentation

Detailed documentation is available in the `docs` directory:

- [Project Overview](docs/project_overview.md)
- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [API Documentation](docs/api_documentation.md)
- [Database Schema](docs/database_schema.md)
- [Frontend Components](docs/frontend_components.md)
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

- Bun (v1.0.0 or later)
- Node.js (v18.0.0 or later)
- PostgreSQL (v14.0 or later)
- Git

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/RecCollection.git
   cd RecCollection
   ```

2. Follow the setup instructions in [Project Setup](docs/project_setup.md).

3. Start the development servers:

   ```bash
   bun run dev
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

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
- Authentication pages (login, register, profile)
- Recipe pages (list, detail, create)
- Import functionality for social media recipes
- Responsive design for mobile and desktop

## Testing

The project uses a comprehensive testing strategy:

### Unit Testing

Unit tests are written using Vitest and React Testing Library. Run the tests with:

```bash
bun run test        # Run all tests
bun run test:watch  # Run tests in watch mode
bun run test:coverage # Run tests with coverage report
```

### End-to-End Testing

End-to-end tests are written using Cypress. Run the tests with:

```bash
bun run cypress:open  # Open Cypress Test Runner
bun run cypress:run   # Run Cypress tests headlessly
bun run e2e           # Start dev server and run tests
bun run e2e:open      # Start dev server and open Cypress
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
