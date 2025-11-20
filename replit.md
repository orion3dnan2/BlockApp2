# Block System - Administrative Management System

## Overview

Block System is an Arabic-first administrative management application for handling reports and records (البلاغات والقيود). It's a full-stack web application with a React frontend and Express backend, designed with an RTL (right-to-left) layout. The system provides comprehensive record management, including search, filtering, CRUD operations, and user authentication, aiming to be an efficient tool for administrative tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:** React 18 with TypeScript, Vite, and Wouter for routing. TanStack Query manages server state and data fetching.

**UI Component System:** `shadcn/ui` on Radix UI, styled with Tailwind CSS. Features a "New York" style variant, custom Arabic fonts (Cairo, Tajawal), and a default RTL layout.

**Design Philosophy:** Focuses on clarity, consistency, and efficiency for enterprise admin use. Incorporates Material Design principles for Arabic interfaces, optimizes data-dense tables for rapid entry, and uses responsive grid layouts.

**State Management Strategy:** React Query for server state, Context API for authentication, and React hooks for local UI state. `react-hook-form` with Zod handles form state and validation.

**Key Frontend Pages:**
- **Dashboard:** Navigation to core modules (Reports, Search, Data Entry, Users, Backup).
- **Search Page:** Read-only query interface with advanced filters and a data table.
- **Data Entry Page:** Dedicated interface for adding and editing records with CRUD operations.
- **Reports Page:** Statistics and analytics dashboard with date filtering and print support.
- **Users Page:** Comprehensive user management (create, update, delete, search).
- **Login Page:** Tabbed authentication (login/register) with form validation.

### Backend Architecture

**Server Framework:** Express.js with TypeScript, implementing a RESTful API.

**Authentication & Security:** JWT for stateless authentication (7-day expiration), `bcrypt` for password hashing (10 rounds), and middleware for route protection.

**API Endpoints Structure:**
- `/api/auth/register`, `/api/auth/login`, `/api/auth/me` for authentication.
- `/api/users` for user management (GET, PUT, DELETE).
- `/api/records` for record CRUD operations with search/filter support.
- `/api/records/search` for advanced record search.

**Data Access Pattern:** Repository pattern with an `IStorage` interface, implemented by `DatabaseStorage` for PostgreSQL operations.

### Data Storage Solutions

**Database:** PostgreSQL (via Neon serverless) as the primary database, with Drizzle ORM for type-safe operations.

**Schema Design:**
- **Users Table:** `id` (UUID), `username` (unique), `password` (hashed), `displayName`.
- **Records Table:** `id` (UUID), `recordNumber` (serial, unique, auto-generated), `outgoingNumber` (non-unique, allows duplicates), `militaryNumber` (optional), `ports` (optional), `recordedNotes` (optional), `firstName`, `secondName`, `thirdName`, `fourthName`, `tourDate`, `rank`, `governorate`, `office` (optional, not displayed in form), `policeStation`, `createdAt`.

**Form Field Order (Data Entry Page):**
1. رقم الصادر (Outgoing Number) - required
2. الرقم العسكري (Military Number) - optional
3. الاسم (Full Name - 4 parts) - required
4. الرتبة (Rank) - required
5. المحافظة (Governorate) - required
6. المخفر (Police Station) - required
7. المنافذ (Ports) - optional
8. تاريخ الجولة (Tour Date) - required
9. الملاحظات المدونة (Recorded Notes) - optional
10. Form Actions (مسح - Reset, حفظ - Save)

**Database Migrations:** Drizzle Kit for schema migrations, managed in the `/migrations` directory.

## External Dependencies

**Database Services:**
- **Neon Serverless Postgres:** Primary database, connected via `DATABASE_URL` and a WebSocket transport layer.

**UI Component Libraries:**
- **Radix UI:** Headless UI primitives.
- **Lucide React:** Icon library.
- **date-fns:** Date formatting and manipulation with Arabic locale support.

**Development Tools:**
- **Replit-specific plugins:** For enhanced development environment (e.g., `@replit/vite-plugin-runtime-error-modal`).

**Form & Validation:**
- **react-hook-form:** Form state management.
- **@hookform/resolvers:** Zod integration for `react-hook-form`.
- **Zod:** Runtime type validation and schema definition.
- **drizzle-zod:** Automatic Zod schema generation from Drizzle schemas.

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_SECRET`: JWT signing secret.
- `NODE_ENV`: Environment mode.