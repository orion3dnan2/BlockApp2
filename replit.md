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
- **Dashboard:** Navigation to core modules (Reports, Search, Data Entry, Users, Import).
- **Search Page:** Read-only query interface with advanced filters and a data table.
- **Data Entry Page:** Dedicated interface for adding and editing records with CRUD operations.
- **Reports Page:** Enhanced statistics and analytics dashboard with comprehensive filtering (date, governorate, police station, action type, rank, person name), professional print layout, and distribution analysis with percentages.
- **Users Page:** Comprehensive user management (create, update, delete, search) with role-based permissions system (admin, supervisor, user).
- **Import Page:** Excel file import interface for bulk data entry, restricted to admin and supervisor roles, with drag-and-drop upload, client-side parsing, and batch server processing.
- **Login Page:** Tabbed authentication (login/register) with form validation.

### Backend Architecture

**Server Framework:** Express.js with TypeScript, implementing a RESTful API.

**Authentication & Security:** JWT for stateless authentication (7-day expiration) with role-based authorization, `bcrypt` for password hashing (10 rounds), and middleware for route protection (`authenticateToken`, `requireAdmin`, `requireAdminOrSupervisor`).

**API Endpoints Structure:**
- `/api/auth/register`, `/api/auth/login`, `/api/auth/me` for authentication.
- `/api/users` for user management (GET, PUT, DELETE).
- `/api/records` for record CRUD operations with search/filter support.
- `/api/records/search` for advanced record search.
- `/api/records/import` for bulk record import from Excel files (admin/supervisor only).

**Data Access Pattern:** Repository pattern with an `IStorage` interface, implemented by `DatabaseStorage` for PostgreSQL operations.

### Data Storage Solutions

**Database:** PostgreSQL (via Neon serverless) as the primary database, with Drizzle ORM for type-safe operations.

**Schema Design:**
- **Users Table:** `id` (UUID), `username` (unique), `password` (hashed), `displayName`, `role` (admin/supervisor/user, default: user).
- **Records Table:** `id` (UUID), `recordNumber` (serial, unique, auto-generated), `outgoingNumber` (non-unique, allows duplicates), `militaryNumber` (optional), `actionType` (optional, type of procedure), `ports` (optional), `recordedNotes` (optional), `firstName`, `secondName`, `thirdName`, `fourthName`, `tourDate`, `rank` (16 ranks from جندي to فريق أول), `governorate`, `office` (optional, not displayed in form), `policeStation`, `createdAt`.

**Form Field Order (Data Entry Page) - Horizontal Layout:**
- Row 1: رقم الصادر، الرقم العسكري (2 fields)
- Row 2: نوع الاجراء في حقه، الرتبة (2 fields)
- Row 3: الاسم (4 parts)
- Row 4: المحافظة، المخفر، المنافذ (3 fields)
- Row 5: تاريخ الجولة
- Row 6: الملاحظات المدونة
- Form Actions: مسح - Reset, حفظ - Save

**Military Ranks (16 total, ordered from lowest to highest):**
جندي، جندي أول، عريف، رقيب، رقيب أول، وكيل ضابط، ملازم، ملازم أول، نقيب، رائد، مقدم، عقيد، عميد، لواء، فريق، فريق أول

**Database Migrations:** Drizzle Kit for schema migrations, managed in the `/migrations` directory.

## Role-Based Access Control (RBAC)

**System Roles:**
- **admin (مدير)**: Full access - can manage users (create, update, delete) and records (create, update, delete, view)
- **supervisor (مشرف)**: Can manage records (create, update, delete, view) but cannot manage users
- **user (مستخدم عادي)**: Read-only access - can only view records and reports

**Authorization Implementation:**
- JWT tokens include user role for server-side authorization
- Middleware functions enforce permissions:
  - `authenticateToken`: Verifies JWT and extracts user info
  - `requireAdmin`: Allows only admins (user management routes)
  - `requireAdminOrSupervisor`: Allows admins and supervisors (record management routes)

**Protected Routes:**
- `POST/PUT/DELETE /api/users`: Requires admin role
- `POST/PUT/DELETE /api/records`: Requires admin or supervisor role
- `POST /api/records/import`: Requires admin or supervisor role
- `GET /api/users, /api/records`: Requires authentication only

**Creating the First Admin:**
Since the registration endpoint (`/api/auth/register`) creates users with the default "user" role, you need to manually promote a user to admin using SQL:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```
After updating the role, the user must log in again to receive a new JWT token with the admin role.

**Important Notes:**
- Users with old JWT tokens (before role implementation) must re-login to get tokens with role information
- Only admins can create other admins or supervisors through the Users page
- Regular users cannot perform any create/update/delete operations

## Excel Import Feature

**Access:** Admin and Supervisor roles only

**Frontend Implementation:**
- Located at `/import` route
- Role-based guard redirects unauthorized users to dashboard
- Drag-and-drop file upload interface with .xlsx/.xls validation
- Client-side Excel parsing using `xlsx` library
- Processes entire file and sends all records in a single POST request
- Progress indicator shows parsing (30%), sending (50%), and completion (100%)
- Results display with success/failure counts and detailed error messages

**Backend Implementation:**
- Endpoint: `POST /api/records/import`
- Protected with `authenticateToken` and `requireAdminOrSupervisor` middleware
- Accepts JSON body with `records` array
- Validates each record using `insertRecordSchema` from Drizzle-Zod
- Creates valid records, skips invalid ones with error tracking
- Returns: `{ success: number, failed: number, errors: string[] }`
- Error messages limited to 50 for performance

**Excel File Format:**
Required columns (Arabic header names):
- رقم الصادر (outgoing number)
- الرقم العسكري (military number, optional)
- نوع الاجراء (action type, optional)
- المنافذ (ports, optional)
- الملاحظات المدونة (recorded notes, optional)
- الاسم الاول (first name)
- الاسم الثاني (second name)
- الاسم الثالث (third name)
- الاسم الرابع (fourth name)
- تاريخ الجولة (tour date)
- الرتبة (rank)
- المحافظة (governorate)
- المخفر (police station)

**Future Improvements (Recommended by Architect):**
- Add payload-size/row-count limits to prevent memory exhaustion
- Implement batched storage insertions for very large files
- Provide downloadable CSV of failures for easier correction and re-import

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

**Excel Import:**
- **xlsx:** Excel file parsing library for client-side processing and bulk data import.

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string.
- `SESSION_SECRET`: JWT signing secret.
- `NODE_ENV`: Environment mode.