# Block System - Administrative Management System

## Overview

Block System is an Arabic-first administrative management application for handling reports and records (البلاغات والقيود). The system is built as a full-stack web application with a React frontend and Express backend, featuring RTL (right-to-left) layout as the primary interface direction. The application provides comprehensive record management capabilities including search, filtering, CRUD operations, and user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- "New York" style variant with neutral base color
- Custom Arabic fonts: Cairo and Tajawal from Google Fonts for optimal Arabic readability
- RTL-first design approach (dir="rtl" as default)

**Design Philosophy**
- Enterprise admin system prioritizing clarity, consistency, and efficiency over visual flair
- Material Design principles adapted for Arabic administrative interfaces
- Data-dense tables and forms optimized for rapid data entry
- Responsive grid layouts (1-3 columns based on viewport)

**State Management Strategy**
- React Query for server state (records, user data)
- Context API for authentication state (AuthContext)
- Local component state with React hooks for UI state
- Form state managed by react-hook-form with Zod validation

**Key Frontend Pages**
- Dashboard: Module navigation grid with cards for Reports, Search, Users, Operations, and Backup
- Search Page: Advanced filtering interface with data table, CRUD operations
- Login Page: Tabbed authentication (login/register) with form validation

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- RESTful API design pattern
- HTTP-only architecture (no WebSocket usage despite ws dependency for database)

**Authentication & Security**
- JWT (JSON Web Tokens) for stateless authentication
- bcrypt for password hashing (10 rounds)
- Token-based authentication with Bearer scheme
- 7-day token expiration
- Middleware-based route protection (authenticateToken)

**API Endpoints Structure**
- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication  
- `/api/auth/me` - Current user verification
- `/api/records` - Record CRUD operations with search/filter support

**Data Access Pattern**
- Repository pattern with IStorage interface
- DatabaseStorage implementation for Postgres operations
- Separation of concerns: routes → storage layer → database

### Data Storage Solutions

**Database**
- PostgreSQL as primary database (via Neon serverless)
- Drizzle ORM for type-safe database operations
- WebSocket-based connection pooling (@neondatabase/serverless)

**Schema Design**

*Users Table*
- id (UUID primary key, auto-generated)
- username (unique, text)
- password (hashed, text)
- displayName (text)

*Records Table*
- id (UUID primary key, auto-generated)
- inventoryNumber (text)
- registrationNumber (text)
- civilRegistrationNumber (text)
- name (text)
- governorate (text)
- region (text)
- reportType (text: "بلاغ عادي", "بلاغ عاجل", "بلاغ سري", "قيد")
- date (timestamp)
- notes (text, nullable)
- additionalNotes (text, nullable)
- createdAt (timestamp, auto-generated)

**Database Migrations**
- Drizzle Kit for schema migrations
- Migration files in `/migrations` directory
- `npm run db:push` for applying schema changes

### External Dependencies

**Database Services**
- Neon Serverless Postgres (primary database)
- Connection via DATABASE_URL environment variable
- WebSocket transport layer for serverless compatibility

**UI Component Libraries**
- Radix UI: Headless UI primitives (dialogs, dropdowns, popovers, etc.)
- Lucide React: Icon library for UI elements
- date-fns: Date formatting and manipulation (with Arabic locale support)

**Development Tools**
- Replit-specific plugins for development environment
  - @replit/vite-plugin-runtime-error-modal
  - @replit/vite-plugin-cartographer
  - @replit/vite-plugin-dev-banner

**Form & Validation**
- react-hook-form: Form state management
- @hookform/resolvers: Zod integration for react-hook-form
- Zod: Runtime type validation and schema definition
- drizzle-zod: Automatic Zod schema generation from Drizzle schemas

**Required Environment Variables**
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: JWT signing secret (required)
- `NODE_ENV`: Environment mode (development/production)

**API Client Pattern**
- Custom ApiClient class for centralized HTTP requests
- Automatic Bearer token injection from localStorage
- Error handling with typed error responses

**Build & Deployment**
- Production build: Vite bundles frontend to `dist/public`
- Backend bundled with esbuild to `dist/index.js`
- ESM module format throughout the application
- Node.js runtime for production server