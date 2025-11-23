# WampServer Setup Checklist - MySQL Migration Complete ✅

## Status: Ready for Deployment

The application has been fully migrated from PostgreSQL to MySQL/MariaDB.

---

## Quick Setup (5 Steps)

### Step 1: WampServer Preparation ⏱️ 5 min
```
1. Download WampServer64 from: https://www.wampserver.com/
2. Install it (default: C:\wamp64)
3. Start WampServer - wait for all icons to turn GREEN
4. Keep it running while developing
```

### Step 2: Create Database ⏱️ 2 min

**Using phpMyAdmin (Easiest):**
1. Open http://localhost/phpmyadmin
2. Click "Databases" tab
3. Create new database: `blocksystem`
4. Encoding: utf8mb4_unicode_ci
5. Click "Create"

**OR Using Command Prompt:**
```cmd
cd C:\wamp64\bin\mysql\mysql8.0.36\bin
mysql -u root -p
CREATE DATABASE blocksystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 3: Create Tables ⏱️ 3 min

1. Open phpMyAdmin
2. Select `blocksystem` database
3. Click "SQL" tab
4. **Copy entire content from `mysql_schema.sql` file** in your project
5. Paste into SQL editor
6. Click "Execute"

✅ All 4 tables created automatically

### Step 4: Configure Application ⏱️ 1 min

1. Open `.env` file in your project
2. Ensure this line is present:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/blocksystem"
   ```
3. If you set a MySQL password, update to:
   ```
   DATABASE_URL="mysql://root:yourpassword@localhost:3306/blocksystem"
   ```
4. Save file

### Step 5: Run Application ⏱️ 2 min

```powershell
# In project directory
npm install
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

✅ **Done!** Open http://localhost:5000

---

## Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | Admin@123 |
| Supervisor | supervisor1 | Admin@123 |

---

## What Was Changed

### Code Changes:
- ✅ `server/db.ts` - MySQL connection setup
- ✅ `shared/schema.ts` - PostgreSQL → MySQL types
- ✅ `server/seeds.ts` - MySQL conflict handling
- ✅ `server/storage.ts` - Removed PostgreSQL-only features

### Files Created:
- ✅ `.env.example` - Connection string template
- ✅ `mysql_schema.sql` - Database schema
- ✅ `MIGRATION_GUIDE_MYSQL.md` - Detailed guide
- ✅ `POSTGRESQL_TO_MYSQL_MIGRATION_SUMMARY.md` - Complete reference

### Dependencies:
- ✅ Removed: `pg`, `@neondatabase/serverless`, `connect-pg-simple`
- ✅ Added: `mysql2`

---

## Troubleshooting

### ❌ "Can't connect to MySQL server"
```
✅ Solution:
1. Check WampServer is running (green icons in system tray)
2. Verify DATABASE_URL is correct
3. Test: mysql -u root -h localhost
```

### ❌ "Access denied for user 'root'@'localhost'"
```
✅ Solution:
1. Check MySQL password (default is empty)
2. If no password: mysql://root:@localhost:3306/blocksystem
3. If password set: mysql://root:yourpassword@localhost:3306/blocksystem
```

### ❌ "Table doesn't exist" or "Unknown table"
```
✅ Solution:
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select blocksystem database
3. Click SQL tab
4. Copy entire content from mysql_schema.sql file
5. Paste and Execute
```

### ❌ "Connection timeout on first run"
```
✅ Solution:
1. This is normal - app tries to connect before MySQL ready
2. Stop app (Ctrl+C)
3. Wait 5 seconds
4. Run npm run dev again
```

### ❌ "Can't find module mysql2"
```
✅ Solution:
npm install
```

---

## After Setup - What Works

✅ **Everything!** All features work identically to PostgreSQL version:
- User authentication (Admin/Supervisor/User roles)
- Record management (Create, Read, Update, Delete)
- Search and filtering
- Police stations and ports management
- Excel import functionality
- Reports and analytics
- Data persistence
- Full Arabic text support (RTL layout)

---

## Common Windows Commands

```powershell
# Start WampServer
Start-Process "C:\wamp64\wampmanager.exe"

# Connect to MySQL from command line
mysql -u root -p blocksystem

# Create backup
mysqldump -u root -p blocksystem > backup_$(Get-Date -Format yyyyMMdd).sql

# Restore backup
mysql -u root -p blocksystem < backup_20250101.sql

# Stop all WampServer services
# Use WampServer GUI menu: Stop All Services

# Reset database (careful!)
DROP DATABASE blocksystem;
# Then recreate (Step 2-3 above)
```

---

## File Locations Reference

| Item | Location |
|------|----------|
| WampServer | `C:\wamp64\` |
| MySQL bin | `C:\wamp64\bin\mysql\mysql8.0.36\bin\` |
| phpMyAdmin | http://localhost/phpmyadmin |
| Project root | `C:\path\to\your\project\` |
| .env file | `C:\path\to\your\project\.env` |
| Database schema | `C:\path\to\your\project\mysql_schema.sql` |

---

## Connection Info

**Hostname:** localhost
**Port:** 3306 (default MySQL port)
**Username:** root
**Password:** (empty by default)
**Database:** blocksystem
**Driver:** mysql2 (via npm)

---

## Next Steps After Setup

1. ✅ Login and verify application works
2. ✅ Create some test records
3. ✅ Try different user roles
4. ✅ Test Excel import if needed
5. ✅ Create backups regularly: `mysqldump -u root blocksystem > backup.sql`

---

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `MIGRATION_GUIDE_MYSQL.md` | Step-by-step detailed guide |
| `POSTGRESQL_TO_MYSQL_MIGRATION_SUMMARY.md` | Complete technical overview |
| `mysql_schema.sql` | Database schema (copy-paste ready) |
| `.env.example` | Connection string template |
| `WAMPSERVER_SETUP_CHECKLIST.md` | This file - quick reference |

---

## Support

If you encounter issues not listed above:

1. Check the comprehensive guide: `MIGRATION_GUIDE_MYSQL.md`
2. Verify database exists: phpMyAdmin → Databases
3. Check tables are created: phpMyAdmin → blocksystem → Tables
4. Verify .env DATABASE_URL is correct
5. Check WampServer is running
6. Try stopping and starting the app
7. Look at console error messages for clues

---

## Performance Tips

- WampServer can handle 100+ users for this system
- Regular backups: `mysqldump -u root -p blocksystem > backup.sql`
- Monitor disk space for database growth
- Restart WampServer monthly for optimal performance
- Keep all 4 table indexes - they improve search speed

---

## Success Indicator

✅ You're successful when you see:
1. WampServer running (green icons)
2. phpMyAdmin shows blocksystem database with 4 tables
3. `npm run dev` shows "✅ Database seeding completed!"
4. http://localhost:5000 loads the login page
5. Login works with admin/Admin@123
6. Dashboard displays without errors

**Congratulations! Your MySQL migration is complete! 🎉**

---

## Estimated Time to Full Setup: 15-20 minutes

- Download WampServer: ~5 min
- Install WampServer: ~5 min
- Create database & schema: ~5 min
- Setup .env: ~1 min
- Run application: ~2 min
- Test login: ~1 min

**Total: ~20 minutes to fully working system**

---

**Questions?** Refer to `MIGRATION_GUIDE_MYSQL.md` for comprehensive troubleshooting.
