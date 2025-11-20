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
- Reports Page: Comprehensive statistics and analytics dashboard with date filtering and print support
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
- recordNumber (serial, unique) - رقم السجل التلقائي
- outgoingNumber (text) - رقم الصادر
- militaryNumber (text) - الرقم العسكري
- recordedNotes (text, nullable) - القيد المسجل
- firstName (text) - الاسم الأول
- secondName (text) - الاسم الثاني
- thirdName (text) - الاسم الثالث
- fourthName (text) - الاسم الرابع
- tourDate (timestamp) - تاريخ الجولة
- rank (text) - الرتبة
- governorate (text) - المحافظة
- office (text) - المكتب
- policeStation (text) - المخفر
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

## Recent Changes

### Reports Page Implementation (November 20, 2025)
**New Feature: Comprehensive Reports & Analytics Dashboard**

Developed a complete reporting system with the following features:

1. **Statistics Dashboard**
   - Total records count
   - Today's records count
   - Last week records count (7 days)
   - Last month records count (30 days)
   - All calculations use tourDate with fallback to createdAt for robustness

2. **Date Filtering System**
   - Filter options: All records, Today, Last Week, Last Month
   - Dynamically updates all statistics and reports based on selected period
   - Uses memoized calculations for optimal performance

3. **Detailed Distribution Reports**
   - By Governorate (المحافظة): Shows record count per governorate, sorted by count
   - By Rank (الرتبة): Shows record count per rank, sorted by count
   - By Office (المكتب): Shows record count per office, sorted by count
   - By Police Station (المخفر): Shows record count per station, sorted by count
   - All reports display in sortable tables

4. **Print Functionality**
   - Dedicated print button triggers window.print()
   - Print-only header with ministry emblem and official title
   - Print date automatically included
   - All reports formatted for professional printing

5. **Error Handling**
   - Comprehensive error state with user-friendly messages
   - Retry button for failed queries
   - Back to home navigation option

6. **User Experience**
   - RTL-first Arabic interface
   - Responsive grid layout (1-4 columns based on viewport)
   - Loading skeleton states
   - Back button to return to dashboard
   - Complete data-testid coverage for QA automation

7. **Summary Section**
   - Shows selected filter period
   - Displays filtered record count
   - Shows unique governorate and rank counts

**Technical Implementation:**
- React Query for data fetching with error handling
- useMemo hooks for efficient aggregation calculations
- date-fns library for Arabic date formatting
- shadcn/ui components (Card, Table, Select, Button)
- Full TypeScript type safety
- Comprehensive test coverage with Playwright

### Auto-Incrementing Record Number & Navigation Enhancement (November 19, 2025)
**New Features Added:**

1. **Auto-Incrementing Record Number**
   - Added `recordNumber` field to database schema (serial type, unique, not null)
   - Automatically generated for each new record without user input
   - Displayed as first column in data table with bold styling
   - Included in search functionality for quick lookups
   - Sortable column with numeric comparison

2. **Back Button Navigation**
   - Added back button to search page
   - Uses wouter Link component for client-side routing
   - Returns user to dashboard (home page)
   - Clear Arabic label: "العودة للصفحة الرئيسية"
   - Includes right arrow icon for RTL layout

3. **Enhanced Search**
   - Updated search filters to include recordNumber
   - Search placeholder updated to reflect new capability
   - Users can now search by: record number, name, outgoing number, or military number

### Final Implementation Review (November 19, 2025)
**Critical Fixes Implemented:**

1. **Field-Specific Sorting Logic**
   - Created field type buckets: dateFields, numericFields
   - Date fields (tourDate, createdAt) use chronological comparison via getTime()
   - Numeric fields (outgoingNumber, militaryNumber) use numeric extraction and comparison
   - Text fields use Arabic locale-aware string comparison
   - Eliminates "Invalid Date" fallback on non-date columns

2. **Safe Date Handling & Validation**
   - Removed automatic `new Date()` defaults that fabricate dates
   - tourDate defaults to `undefined` for new records
   - Preserves `undefined` state when editing records without dates
   - Clearing date input triggers validation ("تاريخ الجولة مطلوب")
   - Added instanceof Date check before calling toISOString()
   - Created getTourDateDefault() helper for safe date parsing

3. **Complete Test ID Coverage**
   - All table headers, cells, and sort buttons
   - All form inputs with descriptive data-testid attributes
   - Dialog containers and action buttons
   - Select dropdown items (rank, governorate)
   - Search bar and reset buttons
   - Empty state and result count displays

4. **UI/UX Improvements**
   - All 10 columns displayed with proper Arabic labels
   - Sortable columns with directional icons (ArrowUp/ArrowDown)
   - Cancel button only shows when editing existing records
   - Reset button clears both values and errors
   - Proper RTL layout throughout application

### Database Migration (November 19, 2025)
- Dropped and recreated database with Kuwait Ministry of Interior schema
- Replaced old fields (inventoryNumber, registrationNumber, etc.) with government-specific fields
- Split name into 4 separate fields as per requirements
- Added all required fields: outgoingNumber, militaryNumber, recordedNotes, rank, office, policeStation
- Populated with 10 sample records matching new schema