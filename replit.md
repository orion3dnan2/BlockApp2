# Block System - نظام الإدارة

## Overview

Block System is a comprehensive Arabic-language management system for tracking and managing reports and restrictions (البلاغات والقيود). The application provides a full-featured platform for data entry, search, reporting, and administrative management with role-based access control and granular permissions.

The system is built as a full-stack application with a React frontend and Express backend, using MySQL for data persistence. It supports multiple user roles (admin, supervisor, user) with customizable permissions for different modules and features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- shadcn/ui component library (New York style variant)
- Radix UI primitives for accessible components
- Tailwind CSS for styling with custom CSS variables for theming
- Right-to-left (RTL) layout support for Arabic language
- Custom fonts: Cairo and Tajawal for Arabic typography

**State Management:**
- React Context API for authentication state
- TanStack Query for all server data fetching and caching
- Local component state with React hooks

**Form Handling:**
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for integration between React Hook Form and Zod

**Key Design Decisions:**
- Chose Vite over Create React App for faster development and better production builds
- Selected Wouter over React Router for smaller bundle size and simpler API
- Used TanStack Query to eliminate manual cache management and provide automatic refetching
- Implemented shadcn/ui for consistent, accessible components that can be customized directly

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and routing
- Node.js ESM modules (type: "module")
- TypeScript for type safety across the stack

**Authentication & Authorization:**
- JWT (JSON Web Tokens) for stateless authentication
- bcryptjs for password hashing
- Role-based access control (admin, supervisor, user)
- Permission-based feature access using granular permissions array
- Custom middleware for token verification and route protection

**API Design:**
- RESTful API endpoints
- Shared TypeScript types between client and server (`shared/schema.ts`)
- Request validation using Zod schemas
- Consistent error handling and response formats

**Data Layer:**
- Repository pattern implemented in `server/storage.ts`
- Abstraction layer separating business logic from database operations
- Timeout handling for database queries to prevent hanging requests

**Key Design Decisions:**
- JWT chosen for scalability and stateless authentication (no server-side sessions)
- Shared schema definitions prevent type mismatches between frontend and backend
- Repository pattern allows easier testing and potential database migration
- Permission system provides flexibility beyond simple role-based access

### Data Storage

**Database:**
- MySQL as the primary database
- Drizzle ORM for type-safe database queries and migrations
- Connection pooling via mysql2/promise

**Schema Design:**
- `users` table: Stores user credentials, roles, and permissions (JSON array)
- `records` table: Main data table for tracking records with auto-incrementing record numbers
- `policeStations` table: Reference data for police station locations
- `ports` table: Reference data for port/border crossing locations

**Data Validation:**
- Drizzle-Zod integration for automatic schema validation from database schema
- Client and server both validate using the same Zod schemas
- Type safety enforced throughout the stack via TypeScript

**Key Design Decisions:**
- MySQL chosen for reliability and widespread hosting support
- Drizzle ORM selected for its lightweight nature and excellent TypeScript support
- JSON field used for permissions array to allow flexible permission management without schema changes
- Shared schema in `shared/schema.ts` ensures consistency across client and server

### Authentication & Authorization

**Authentication Flow:**
1. User submits credentials to `/api/auth/login`
2. Server validates credentials and generates JWT token
3. Token stored in localStorage on client
4. Token included in Authorization header for subsequent requests
5. Server middleware verifies token and attaches user data to request

**Authorization Levels:**
- **Admin**: Full system access including user management
- **Supervisor**: Data entry, reports, and limited settings access
- **User**: View-only access to dashboard and search

**Permission System:**
Available permissions: `dashboard`, `search`, `data_entry`, `reports`, `import`, `settings_users`, `settings_stations`, `settings_ports`

Users can have custom permission arrays regardless of role, providing fine-grained access control.

**Key Design Decisions:**
- JWT expiration set to 7 days for user convenience
- SESSION_SECRET environment variable required for token signing security
- Permission-based routes in addition to role-based routes for flexibility
- Client-side route guards prevent unauthorized navigation

### External Dependencies

**Core Framework Dependencies:**
- express: Web server framework
- react & react-dom: UI library
- vite: Build tool and dev server
- drizzle-orm & mysql2: Database ORM and driver

**UI & Styling:**
- @radix-ui/*: Accessible component primitives
- tailwindcss: Utility-first CSS framework
- lucide-react: Icon library
- class-variance-authority: Variant-based styling utility

**Form & Validation:**
- react-hook-form: Form state management
- zod: Schema validation
- @hookform/resolvers: Integration layer

**Data Management:**
- @tanstack/react-query: Server state management
- jsonwebtoken: JWT token generation and verification
- bcryptjs: Password hashing

**Development Tools:**
- typescript: Type safety
- tsx: TypeScript execution for development
- esbuild: Production bundling for server
- drizzle-kit: Database migrations

**Replit-Specific Plugins:**
- @replit/vite-plugin-runtime-error-modal: Error overlay in development
- @replit/vite-plugin-cartographer: Development tooling
- @replit/vite-plugin-dev-banner: Development banner

**Key Integration Points:**
- No external APIs or third-party services currently integrated
- Database connection via DATABASE_URL environment variable (defaults to local MySQL)
- Excel file imports using xlsx library for bulk data entry
- date-fns for date manipulation with Arabic locale support