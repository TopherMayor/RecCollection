# RecCollection Project Overview

## Project Description
RecCollection is a web application that allows users to create and share recipes. The platform enables users to:
- Create, edit, and delete recipes
- Import recipes from external sources like Instagram or TikTok videos and posts
- Utilize AI integration to generate recipe names and descriptions based on ingredients and instructions

## Minimum Viable Product (MVP)
The MVP will be a site that allows users to:
- Create and share recipes
- Leverage AI integration to generate recipe names and descriptions based on:
  - User-provided ingredients and instructions
  - Imported content from videos or posts

## Tech Stack
The project will use the following technologies:
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

## Development Workflow
1. Complete documentation and planning
2. Implement backend requirements
3. Develop frontend components
4. Integrate AI functionality
5. Test and refine the application
