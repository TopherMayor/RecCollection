# RecCollection

RecCollection is a web application that allows users to create and share recipes. The platform enables users to import recipes from social media platforms like Instagram and TikTok, and utilizes AI to generate recipe names and descriptions.

## Features

- Create, edit, and delete recipes
- Organize recipes into collections
- Import recipes from Instagram and TikTok
- AI-generated recipe names and descriptions
- Advanced search and filtering
- User authentication and profiles
- Social features (likes, comments, sharing)
- Real-time notifications (email, SMS, in-app)
- Recipe sharing via email, SMS, and shareable links

## Tech Stack

- **Runtime Environment**: Bun
- **Backend Framework**: Hono
- **Database ORM**: Drizzle
- **Database**: SQLite (with Drizzle ORM)
- **Frontend Framework**: React
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Project Structure

```
RecCollection/
├── app/                  # Application code
│   ├── backend/          # Backend API and server
│   │   ├── src/          # Source code
│   │   │   ├── controllers/  # API controllers
│   │   │   ├── db/       # Database schema and migrations
│   │   │   ├── middleware/ # Express middleware
│   │   │   ├── routes/   # API routes
│   │   │   ├── services/ # Business logic
│   │   │   └── utils/    # Utility functions
│   │   └── uploads/      # Uploaded images
│   └── frontend/         # Frontend React application
│       ├── src/          # Source code
│       │   ├── api/      # API client
│       │   ├── assets/   # Static assets
│       │   ├── components/ # UI components
│       │   ├── pages/    # Page components
│       │   └── utils/    # Utility functions
├── cypress/              # End-to-end tests
├── docs/                 # Documentation
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

- Bun (v1.0.0 or later)
- Node.js (v18.0.0 or later)
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

- Complete REST API implementation with Hono.js
- Database schema and migrations with Drizzle ORM (SQLite)
- JWT authentication system with refresh tokens
- Recipe CRUD operations with image upload support
- Recipe collections and organization features
- AI integration for recipe parsing and generation
- Social media import from Instagram and TikTok
- Real-time notification system (email, SMS, in-app)
- Recipe sharing via email, SMS, and deeplinks
- Comprehensive test coverage (unit and integration tests)

### Frontend

- Responsive UI built with React and Tailwind CSS
- Component library using shadcn/ui
- Authentication flow (login, register, password reset)
- Recipe management (create, edit, view, delete)
- Collection management and organization
- Advanced search and filtering
- Social features (likes, comments, sharing)
- Notification center
- End-to-end testing with Cypress

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
