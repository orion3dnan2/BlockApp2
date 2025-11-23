# نظام إدارة الرقابة والتفتيش - Oversight and Inspection Management System

## Overview

نظام إدارة الرقابة والتفتيش (Oversight and Inspection Management System) is an Arabic-first, full-stack web application for managing reports and records (البلاغات والقيود). It features a React frontend and Express backend with an RTL layout. The system provides comprehensive record management including search, filtering, CRUD operations, user authentication, and role-based access control, designed to streamline administrative oversight. The system's ambition is to offer a robust, intuitive platform for efficient data handling and improved administrative workflows in an Arabic-centric environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18, TypeScript, Vite, and Wouter for routing. UI components use `shadcn/ui` on Radix UI, styled with Tailwind CSS, featuring a "New York" style, custom Arabic fonts (Cairo, Tajawal), and a default RTL layout. State management combines React Query for server state, Context API for authentication, and React hooks for local UI state. Form handling and validation are managed by `react-hook-form` with Zod.

**Key Frontend Pages:**
- **Home Page:** Two-tab interface separating administrative systems (placeholder) and the main blocks system.
- **Dashboard:** Navigation to core modules, dynamically filtered by user role.
- **Search Page:** Read-only interface with advanced filters and a data table.
- **Data Entry Page:** Dedicated interface for adding and editing records with CRUD operations.
- **Reports Page:** Enhanced statistics and analytics dashboard.
- **Settings Page:** Comprehensive management with tabs for Users, Police Stations, and Ports, with role-based access.
- **Import Page:** Excel file import for bulk data entry.
- **Login Page:** Tabbed authentication (login/register).
- **Access Denied Page:** Informs unauthorized users and offers navigation.

### Backend Architecture

The backend uses Express.js with TypeScript, implementing a RESTful API. Authentication is handled via JWT (7-day expiration) with `bcrypt` for password hashing and role-based authorization enforced by middleware (`authenticateToken`, `requireAdmin`, `requireAdminOrSupervisor`). A repository pattern with an `IStorage` interface, implemented by `DatabaseStorage`, handles PostgreSQL operations.

**Key API Endpoints:**
- `/api/auth/*`: User authentication.
- `/api/users`: User management (admin only).
- `/api/records`: Record CRUD operations, search, filter, and import.
- `/api/police-stations`: Police station CRUD (admin/supervisor only).
- `/api/ports`: Port CRUD (admin/supervisor only).

### Data Storage Solutions

**Database:** PostgreSQL (Neon serverless) with Drizzle ORM for type-safe operations. Drizzle Kit manages schema migrations.

**Schema Design:**
- **Users:** `id`, `username`, `password` (hashed), `displayName`, `role` (admin, supervisor, user).
- **Records:** `id`, `recordNumber` (auto-generated), `outgoingNumber`, `militaryNumber`, `actionType`, `ports`, `recordedNotes`, `firstName`, `secondName`, `thirdName`, `fourthName`, `tourDate`, `rank`, `governorate`, `office`, `policeStation`, `createdAt`.
- **Police Stations:** `id`, `name`, `governorate`, `createdAt`.
- **Ports:** `id`, `name`, `createdAt`.

### Role-Based Access Control (RBAC)

The system defines three roles:
- **admin (مدير)**: Full access, including user management.
- **supervisor (مشرف)**: Can manage records, police stations, and ports, but not users.
- **user (مستخدم عادي)**: Read-only access to records and reports.

RBAC is enforced both on the backend (JWT and middleware) and frontend (RoleProtectedRoute component, dynamic UI filtering, access denied page).

### Excel Import Feature

Accessible to Admin and Supervisor roles, this feature allows bulk data entry via Excel files (`.xlsx/.xls`). The frontend provides a drag-and-drop interface, client-side parsing using `xlsx`, and sends records in a single POST request to `/api/records/import`. The backend validates each record against a Drizzle-Zod schema, creates valid entries, and reports success/failure counts with error details.

## External Dependencies

**Database Services:**
- **Neon Serverless Postgres:** Primary database.

**UI Component Libraries:**
- **Radix UI:** Headless UI primitives.
- **Lucide React:** Icon library.

**Date & Time Utilities:**
- **date-fns:** Date formatting and manipulation with Arabic locale support.

**Form & Validation:**
- **react-hook-form:** Form state management.
- **@hookform/resolvers:** Zod integration.
- **Zod:** Runtime type validation and schema definition.
- **drizzle-zod:** Automatic Zod schema generation from Drizzle schemas.

**Excel Processing:**
- **xlsx:** Client-side Excel file parsing.