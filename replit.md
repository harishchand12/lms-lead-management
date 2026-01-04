# Lead Management System

## Overview

Lead is a CRM (Customer Relationship Management) platform for managing sales leads and agents. It provides a dashboard for tracking pipeline metrics, a lead management system with Kanban-style pipeline views, and agent administration capabilities. The application follows a full-stack TypeScript architecture with React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme configuration
- **Drag & Drop**: @dnd-kit for pipeline Kanban board functionality
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Session Management**: express-session for authentication state
- **Password Hashing**: bcrypt for secure credential storage
- **API Design**: REST API with typed route contracts defined in `shared/routes.ts`

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: 
  - `agents` - User accounts with role-based access (admin/agent)
  - `leads` - Sales leads with status tracking, temperature indicators, and owner assignment

### Authentication & Authorization
- Session-based authentication using express-session
- Role-based access control with admin and agent roles
- Protected routes on frontend using React Query to check `/api/auth/me`
- Middleware functions `requireAuth` and `requireAdmin` for backend route protection

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components (shadcn/ui)
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle table definitions and Zod schemas
│   └── routes.ts     # API contract definitions
└── migrations/       # Database migrations
```

### Key Design Patterns
- **Shared Types**: TypeScript types and Zod schemas defined once in `shared/` and used by both frontend and backend
- **API Contract**: Route definitions in `shared/routes.ts` define input/output schemas for type-safe API calls
- **Storage Interface**: `IStorage` interface in `server/storage.ts` abstracts database operations

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- Drizzle ORM handles all database interactions
- Run `npm run db:push` to sync schema with database

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Secret for session encryption (defaults to fallback in dev)
- `NODE_ENV` - Development/production mode flag

### Third-Party Libraries
- **UI**: Radix UI primitives, Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation
- **Notifications**: Sonner for toast notifications