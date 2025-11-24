# Windows Setup Guide - XAMPP MySQL

This guide provides step-by-step instructions for running this application on Windows with XAMPP MySQL.

## Prerequisites

1. **Node.js** (version 20 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **XAMPP** (with MySQL/MariaDB)
   - Download from: https://www.apachefriends.org/
   - Install and start the MySQL service

## Step 1: XAMPP MySQL Setup

1. **Start XAMPP Control Panel**
   - Launch XAMPP Control Panel
   - Click "Start" for the MySQL module
   - Wait for the status to show "Running" (green highlight)

2. **Create Database**
   - Click "Admin" button next to MySQL (opens phpMyAdmin)
   - Click "New" in the left sidebar
   - Create a new database named: `blocksystem`
   - Collation: `utf8mb4_general_ci` (recommended)
   - Click "Create"

## Step 2: Configure Environment Variables

1. **Create `.env` file** in the project root (copy from `.env.example`):
   ```
   DATABASE_URL=mysql://root:@localhost:3306/blocksystem
   PORT=5000
   SESSION_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

2. **Modify if needed**:
   - If you set a MySQL root password: `mysql://root:YOUR_PASSWORD@localhost:3306/blocksystem`
   - If using a different database name: change `blocksystem` to your database name
   - Change `SESSION_SECRET` to a random string for production
   - **Important:** Remove any PostgreSQL query parameters (e.g., `?sslmode=require`) from DATABASE_URL - MySQL does not support them

## Step 3: Install Dependencies

Open Command Prompt or PowerShell in the project directory:

```bash
npm install
```

This will install all required packages including:
- `mysql2` - MySQL driver
- `drizzle-orm` - Database ORM
- `cross-env` - Cross-platform environment variables
- All other dependencies

## Step 4: Initialize Database Schema

Run the database migration to create all tables:

```bash
npm run db:push
```

This command will:
- Connect to your MySQL database
- Create all necessary tables (users, police_stations, ports, records)
- Set up the schema according to `shared/schema.ts`

**Expected Output:**
```
✓ Done!
```

## Step 5: Start the Application

### Development Mode

```bash
npm run dev
```

This will:
- Start the Express backend server on port 5000
- Start the Vite development server
- Enable hot module replacement (HMR)

**Expected Output:**
```
> rest-express@1.0.0 dev
> cross-env NODE_ENV=development tsx server/index.ts

[express] serving on port 5000
```

### Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:5000/api

## Step 6: Create Initial Admin User (Optional)

If the application requires an admin user, you can create one using phpMyAdmin:

1. Open phpMyAdmin
2. Select the `blocksystem` database
3. Click on the `users` table
4. Click "Insert" tab
5. Fill in the fields (password should be hashed with bcrypt)

Alternatively, if the application has a registration feature, use that to create your first user.

## Troubleshooting

### MySQL Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solutions:**
1. Verify MySQL is running in XAMPP Control Panel
2. Check that the port is 3306 (default) or update DATABASE_URL
3. Verify no other service is using port 3306
4. Try restarting MySQL in XAMPP

### Database Not Found Error

**Error:** `ER_BAD_DB_ERROR: Unknown database 'blocksystem'`

**Solution:**
1. Open phpMyAdmin
2. Create the database named `blocksystem`
3. Run `npm run db:push` again

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change PORT in `.env` to a different number (e.g., 3000, 8080)
2. Or stop the process using port 5000:
   ```bash
   # Find the process
   netstat -ano | findstr :5000
   # Kill the process (replace PID with the actual process ID)
   taskkill /PID <PID> /F
   ```

### Module Not Found Errors

**Error:** `Cannot find module 'cross-env'` or similar

**Solution:**
```bash
# Delete node_modules and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

### TypeScript Errors

**Solution:**
```bash
# Run type checking
npm run check
```

## Production Build

To build for production:

```bash
# Build the application
npm run build

# Start production server
npm start
```

**Note:** Make sure to:
1. Set `NODE_ENV=production` in `.env`
2. Change `SESSION_SECRET` to a strong random string
3. Consider using a proper MySQL password
4. Set up proper error logging

## Database Management

### View Data
- Use phpMyAdmin to browse tables and data
- Access at: http://localhost/phpmyadmin

### Backup Database
1. Open phpMyAdmin
2. Select `blocksystem` database
3. Click "Export" tab
4. Choose "Quick" export method
5. Click "Go"
6. Save the SQL file

### Restore Database
1. Open phpMyAdmin
2. Select `blocksystem` database
3. Click "Import" tab
4. Choose your SQL backup file
5. Click "Go"

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Push database schema changes
npm run db:push

# Generate database migration
npm run db:generate
```

## Additional Notes

- The application uses `cross-env` for cross-platform compatibility
- Database schema is defined in `shared/schema.ts`
- Backend code is in `server/` directory
- Frontend code is in `client/` directory
- All API routes are in `server/routes.ts`

## Support

If you encounter issues not covered in this guide:
1. Check the XAMPP error logs (in XAMPP installation directory)
2. Check the application console output for errors
3. Verify all prerequisites are installed correctly
4. Ensure XAMPP MySQL service is running
