# Production Deployment Checklist

## Pre-Deployment Verification ✅

### Code Changes Made

- [x] CORS configured in server/index.ts
- [x] APP_URL environment variable support added
- [x] Frontend API client updated to use window.location.origin
- [x] .env.example updated with new environment variables
- [x] Apache VirtualHost configuration provided
- [x] MySQL migration completed

### Files Modified

| File | Changes | Status |
|------|---------|--------|
| `.env.example` | Added APP_URL, PORT, SESSION_SECRET | ✅ |
| `server/index.ts` | Added CORS & trust proxy middleware | ✅ |
| `client/src/lib/queryClient.ts` | Updated to use origin-relative URLs | ✅ |
| `apache-virtualhost.conf` | New - reverse proxy config | ✅ |
| `package.json` | Already correct (no changes needed) | ✅ |

### What Was NOT Changed

- ✅ Database layer (MySQL migration already done)
- ✅ Application logic
- ✅ System features
- ✅ User roles and permissions
- ✅ Frontend components
- ✅ Backend routes

---

## Deployment Steps (In Order)

### Step 1: Prepare System
```powershell
# Windows Command Prompt or PowerShell

# 1. Navigate to project
cd C:\Users\YourName\Projects\blocksystem

# 2. Copy environment file
copy .env.example .env

# 3. Edit .env with your settings
notepad .env

# 4. Verify MySQL is running
# Check WampServer - MySQL should be green
```

### Step 2: Configure Windows Hosts
```
File: C:\Windows\System32\drivers\etc\hosts
Add line: 127.0.0.1 blocksystem.local
Save and close
```

### Step 3: Configure Apache
```
1. Edit: C:\wamp64\bin\apache\apache2.4.x\conf\httpd.conf
   Uncomment: LoadModule proxy_module modules/mod_proxy.so
   Uncomment: LoadModule proxy_http_module modules/mod_proxy_http.so
   Uncomment: LoadModule headers_module modules/mod_headers.so

2. Edit: C:\wamp64\bin\apache\apache2.4.x\conf\extra\httpd-vhosts.conf
   Append content from: apache-virtualhost.conf file

3. Verify: httpd -t (should output: Syntax OK)

4. Restart Apache in WampServer
```

### Step 4: Build Application
```powershell
# Install dependencies
npm install

# Compile TypeScript and build Vite client
npm run build

# Verify output
if (Test-Path dist/public/index.html -and Test-Path dist/index.js) {
  Write-Host "Build successful!"
}
```

### Step 5: Start Production Server
```powershell
# Start the application
npm start

# Expected output:
# 🌱 Starting database seeding...
# ✅ Database seeding completed!
# 12:30:45 PM [express] serving on port 5000
```

### Step 6: Verify Deployment
```
Browser: http://blocksystem.local
Login: admin / Admin@123
Check:
  - Page loads without errors
  - Login works
  - Dashboard displays data
  - All features functional
```

---

## Post-Deployment Verification

### Functionality Checks

- [ ] Login page loads
- [ ] Login with credentials works
- [ ] Dashboard displays data
- [ ] Create new record works
- [ ] Search functionality works
- [ ] Settings page accessible
- [ ] User management works (admin only)
- [ ] Police stations management works
- [ ] Ports management works
- [ ] Import Excel works
- [ ] Reports page works
- [ ] Logout works

### Technical Checks

- [ ] F12 Console: No errors
- [ ] F12 Network: All requests returning 200
- [ ] API base URL: http://blocksystem.local (not localhost)
- [ ] Database: Can see actual data
- [ ] Session: Persists after page refresh
- [ ] CORS: No CORS errors in console
- [ ] Apache: Proxy working (check access log)
- [ ] MySQL: Connected and seeding completed

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] Login response < 1 second
- [ ] Search results < 2 seconds
- [ ] No memory leaks (DevTools)
- [ ] No CPU spikes

---

## Rollback Plan

If deployment fails:

```powershell
# Stop the application
# Ctrl+C in the console running npm start

# Revert to localhost
# Edit .env: APP_URL="http://localhost:5000"

# Run development version
npm run dev

# Diagnose the issue
# Check error logs in console
# Check Apache error log if VirtualHost issue
# Check MySQL connection if database issue
```

---

## Monitoring After Deployment

### Daily Monitoring

```powershell
# Check WampServer status
# - Apache should be green
# - MySQL should be green

# Monitor application logs
# Watch for errors in console output

# Quick health check
curl http://blocksystem.local
# Should return HTML (login page)
```

### Weekly Maintenance

```powershell
# Backup database
$date = Get-Date -Format yyyyMMdd
mysqldump -u root blocksystem > "backup_$date.sql"

# Review logs
# Check: C:\wamp64\bin\apache\apache2.4.x\logs\error.log
```

### Issues to Monitor

- Slow page loads → check MySQL performance
- Memory leaks → restart Node.js
- 502 Bad Gateway → check if Node.js running
- CORS errors → check APP_URL in .env
- Database errors → check MySQL connection

---

## Security Checklist

- [ ] SESSION_SECRET changed to strong value
- [ ] Database password secured (not empty in production)
- [ ] .env file protected (not in git)
- [ ] Only admins can access settings
- [ ] Database backups scheduled
- [ ] Error logs monitored
- [ ] No sensitive data in console logs
- [ ] CORS headers properly configured

---

## Documentation for Team

When handing over to team, provide:

1. **PRODUCTION_SETUP_WINDOWS_WAMP.md** - Setup procedures
2. **Apache VirtualHost config** - apache-virtualhost.conf
3. **Environment template** - .env.example
4. **.env file** - (securely, not in repo)
5. **Database backup** - Latest backup file
6. **Emergency contacts** - WampServer/Apache support links

---

## Environment Template (.env)

```
# Application Configuration
APP_URL="http://blocksystem.local"
PORT=5000
NODE_ENV=production

# Database Configuration
DATABASE_URL="mysql://root:@localhost:3306/blocksystem"

# Session Configuration
SESSION_SECRET="GenerateStrongSecretHere!@#$%^&*()"
```

---

## Apache VirtualHost Verification

```powershell
# Test VirtualHost config
cd C:\wamp64\bin\apache\apache2.4.x\bin
.\httpd -S

# Should show:
# VirtualHost configuration:
# blocksystem.local (:80)
```

---

## Package.json Scripts

All scripts are production-ready:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc"
  }
}
```

---

## Final Deployment Steps

1. **Pre-Deployment** (this checklist)
2. **Prepare System** (hosts file, Apache config)
3. **Build** (npm run build)
4. **Deploy** (npm start)
5. **Verify** (test all features)
6. **Monitor** (watch for errors)
7. **Document** (record any custom configs)
8. **Backup** (database backup schedule)

---

## Support Resources

| Issue | Reference |
|-------|-----------|
| WampServer setup | WAMPSERVER_SETUP_CHECKLIST.md |
| MySQL migration | MIGRATION_GUIDE_MYSQL.md |
| Build errors | npm output + TypeScript errors |
| Apache issues | C:\wamp64\bin\apache\...\logs\error.log |
| Application errors | Browser F12 console |
| API issues | Network tab in F12 DevTools |

---

## Sign-Off

- [ ] All steps completed
- [ ] All verifications passed
- [ ] Team trained
- [ ] Documentation provided
- [ ] Backups scheduled
- [ ] Monitoring enabled

**Deployment completed successfully! 🎉**

---

Generated: 2025-01-23
System: Windows 10/11 + WampServer64 + MySQL
Application: نظام إدارة الرقابة والتفتيش (Administrative Management System)
