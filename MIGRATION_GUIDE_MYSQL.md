# PostgreSQL to MySQL/MariaDB Migration Guide

## Overview
This project has been migrated from PostgreSQL (Neon) to MySQL/MariaDB for use with WampServer64.

## Changes Made

### 1. Dependencies Updated
**Removed:**
- `pg` - PostgreSQL driver
- `connect-pg-simple` - PostgreSQL session store

**Added:**
- `mysql2` - MySQL/MariaDB driver

### 2. Database Configuration
- **Old:** `server/db.ts` used Neon serverless with WebSocket
- **New:** `server/db.ts` uses `mysql2/promise` with connection pooling
- **Schema:** Updated from PostgreSQL types (`pgTable`) to MySQL types (`mysqlTable`)

### 3. Schema Changes
All data types converted for MySQL compatibility:

| PostgreSQL | MySQL |
|------------|-------|
| `serial` | `int(...).autoincrement()` |
| `varchar` with uuid default | `varchar(36)` with `UUID()` function |
| `timestamp` with time zone | `datetime` |
| `text` | `text` |

### 4. Migration Strategy
SQL functions converted:
- `gen_random_uuid()` → `UUID()` (MySQL function)
- `timestamp` defaults → `datetime default CURRENT_TIMESTAMP`
- `onConflictDoNothing()` → `onDuplicateKeyUpdate()` (MySQL equivalent)

---

## Setup Instructions for Windows + WampServer64

### Step 1: Install/Verify WampServer64
1. Download WampServer64 from https://www.wampserver.com/
2. Install it (typically in `C:\wamp64`)
3. Start WampServer and ensure MySQL/MariaDB is running (green icons in system tray)

### Step 2: Create MySQL Database

**Option A: Using phpMyAdmin (Easy)**
1. Open http://localhost/phpmyadmin in browser
2. Click on "Databases" tab
3. Create new database: `blocksystem`
4. Click "Create"

**Option B: Using MySQL Command Line**
1. Open Command Prompt
2. Navigate to MySQL bin directory:
   ```
   cd C:\wamp64\bin\mysql\mysql8.0.36\bin
   ```
   (Version number may differ)
3. Connect to MySQL:
   ```
   mysql -u root -p
   ```
   Press Enter (default password is empty)
4. Create database:
   ```sql
   CREATE DATABASE blocksystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

### Step 3: Configure Environment

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```

2. Update `.env` with your MySQL connection:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/blocksystem"
   ```
   
   If you set a MySQL password:
   ```
   DATABASE_URL="mysql://root:yourpassword@localhost:3306/blocksystem"
   ```

### Step 4: Create Database Tables

Since the project cannot auto-migrate to MySQL due to Drizzle Kit configuration constraints, create the tables manually:

**Using phpMyAdmin:**
1. Go to http://localhost/phpmyadmin
2. Select `blocksystem` database
3. Click "SQL" tab
4. Copy and paste the SQL schema below, then execute

**Using MySQL Command Line:**
1. Save the SQL schema (below) as `schema.sql`
2. Run:
   ```
   mysql -u root -p blocksystem < schema.sql
   ```

### Step 5: Database Schema SQL

Create all tables with this SQL:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  INDEX idx_username (username(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Police Stations table
CREATE TABLE police_stations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL UNIQUE,
  governorate TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ports table
CREATE TABLE ports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Records table
CREATE TABLE records (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  record_number INT NOT NULL UNIQUE AUTO_INCREMENT,
  outgoing_number TEXT NOT NULL,
  military_number TEXT,
  action_type TEXT,
  ports TEXT,
  recorded_notes TEXT,
  first_name TEXT NOT NULL,
  second_name TEXT NOT NULL,
  third_name TEXT NOT NULL,
  fourth_name TEXT NOT NULL,
  tour_date DATETIME NOT NULL,
  rank TEXT NOT NULL,
  governorate TEXT NOT NULL,
  office TEXT,
  police_station TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_record_number (record_number),
  INDEX idx_outgoing (outgoing_number(100)),
  INDEX idx_military (military_number(100)),
  INDEX idx_first_name (first_name(100)),
  INDEX idx_governorate (governorate),
  INDEX idx_rank (rank),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 6: Install Node Dependencies

```bash
npm install
```

### Step 7: Run the Application

```bash
npm run dev
```

You should see:
```
🌱 Starting database seeding...
📍 Inserting police stations...
✅ Inserted 34 police stations
🚪 Inserting ports...
✅ Inserted 11 ports
✅ Database seeding completed!
6:52:13 AM [express] serving on port 5000
```

### Step 8: Test the Application

1. Open http://localhost:5000 in browser
2. Login with:
   - **Admin:** username: `admin` password: `Admin@123`
   - **Supervisor:** username: `supervisor1` password: `Admin@123`

---

## Troubleshooting

### Issue: "Can't connect to MySQL server"
**Solution:**
- Ensure WampServer is running (green icons in system tray)
- Check `DATABASE_URL` format is correct
- Verify database `blocksystem` exists

### Issue: "Table doesn't exist"
**Solution:**
- Run the SQL schema creation script (Step 5)
- Verify all tables exist in phpMyAdmin

### Issue: "Access denied for user 'root'@'localhost'"
**Solution:**
- Check if MySQL password is set
- Update `DATABASE_URL` with correct password
- Default WampServer has no password (empty string)

### Issue: "Duplicate entry" errors
**Solution:**
- This is expected on first run when seeding data
- The seeding logic checks if data exists before inserting
- Restart the app if you see these errors

---

## Files Modified

### Code Changes:
- `server/db.ts` - MySQL connection setup
- `shared/schema.ts` - PostgreSQL → MySQL type conversions
- `server/seeds.ts` - Conflict handling for MySQL
- `server/storage.ts` - Removed `.returning()` for MySQL compatibility

### Dependencies:
- Removed: `pg`, `@neondatabase/serverless`, `connect-pg-simple`
- Added: `mysql2`

### Configuration:
- `.env.example` - Updated with MySQL connection string format

---

## Database Schema Overview

### Tables:
1. **users** - User accounts with roles (admin, supervisor, user)
2. **police_stations** - 34 pre-loaded police stations by governorate
3. **ports** - 11 pre-loaded ports
4. **records** - Administrative records with full audit trail

### Key Features:
- UTF-8 MB4 encoding for Arabic text support
- Indexes on commonly searched fields
- Auto-increment for IDs
- UUID for distributed data safety
- Timestamps for audit tracking

---

## Commands for WampServer Users

### Start WampServer:
1. Click WampServer icon in system tray
2. Ensure all services are green
3. Keep running while developing

### View Database in phpMyAdmin:
- URL: http://localhost/phpmyadmin
- Username: root
- Password: (empty by default)

### Reset Database:
```bash
# Stop the app
# Drop database in phpMyAdmin or MySQL CLI:
DROP DATABASE blocksystem;

# Recreate database and tables (follow Step 2 and Step 5)
# Restart the app
npm run dev
```

---

## Performance Notes

- MySQL performance is comparable to PostgreSQL for this dataset
- Indexes are created on commonly filtered fields
- Connection pooling is handled automatically by mysql2
- Max connections can be configured in `server/db.ts` if needed

---

## Support

If you encounter issues:
1. Check WampServer is running
2. Verify database exists and tables are created
3. Check `.env` DATABASE_URL is correct
4. Look at console output for error messages
5. Ensure all dependencies installed: `npm install`
