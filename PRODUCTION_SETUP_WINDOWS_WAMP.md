# Production Setup - Windows + WampServer64

## Complete Setup Guide for blocksystem.local

---

## Phase 1: Prerequisites & Environment Setup ⏱️ 10 min

### 1.1 Verify WampServer Installation
```
1. Ensure WampServer64 is installed: C:\wamp64\
2. Start WampServer - all icons should be GREEN
3. Keep it running throughout setup
```

### 1.2 Database Already Setup
✅ Assume MySQL database `blocksystem` is created with all tables
✅ See MIGRATION_GUIDE_MYSQL.md if you haven't done this yet

### 1.3 Environment File
```
1. Copy .env.example to .env in project root
2. Update .env with your settings:

DATABASE_URL="mysql://root:@localhost:3306/blocksystem"
APP_URL="http://blocksystem.local"
PORT=5000
NODE_ENV=development
SESSION_SECRET="your-secret-key-change-this"

For production, use a strong SESSION_SECRET:
SESSION_SECRET="$(openssl rand -base64 32)" # or generate in Windows using:
SESSION_SECRET="YourVerySecureRandomString123!@#$%^&*()"
```

---

## Phase 2: Windows Hosts File Configuration ⏱️ 5 min

### 2.1 Edit Windows Hosts File

**On Windows 10/11, open Notepad as Administrator:**
```
1. Right-click Notepad → "Run as Administrator"
2. File → Open → Navigate to:
   C:\Windows\System32\drivers\etc\hosts
3. Add this line at the end:
   127.0.0.1 blocksystem.local
4. Save file (Ctrl+S)
5. Close Notepad
```

**Verify it works:**
```
Open Command Prompt:
ping blocksystem.local

Should see: Reply from 127.0.0.1
```

---

## Phase 3: Apache VirtualHost Configuration ⏱️ 10 min

### 3.1 Enable Required Apache Modules

**Open** `C:\wamp64\bin\apache\apache2.4.x\conf\httpd.conf` (use correct Apache version)

**Find and uncomment these lines** (remove # at start):
```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
```

### 3.2 Add VirtualHost Configuration

**Open** `C:\wamp64\bin\apache\apache2.4.x\conf\extra\httpd-vhosts.conf`

**Add this at the end of the file:**
```apache
<VirtualHost *:80>
    ServerName blocksystem.local
    ServerAlias www.blocksystem.local

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://127.0.0.1:5000/
    ProxyPassReverse / http://127.0.0.1:5000/

    ProxyTimeout 300
    ProxyConnectTimeout 300
    ProxyReceiveBufferSize 4096

    ErrorLog logs/blocksystem-error.log
    CustomLog logs/blocksystem-access.log combined

    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

**Save the file (Ctrl+S)**

### 3.3 Verify Apache Configuration

```
Open Command Prompt:
cd C:\wamp64\bin\apache\apache2.4.x\bin
httpd -t

Should output: Syntax OK
```

### 3.4 Restart Apache

```
In WampServer system tray:
1. Click WampServer icon
2. Hover over Apache
3. Click "Restart Service"
4. Wait for green checkmark
```

✅ If Apache doesn't start, check the error log:
`C:\wamp64\bin\apache\apache2.4.x\logs\error.log`

---

## Phase 4: Build & Deploy Application ⏱️ 5 min

### 4.1 Install Dependencies
```powershell
cd C:\path\to\your\project
npm install
```

### 4.2 Build for Production
```powershell
npm run build
```

This creates:
- `dist/public/` - React client build
- `dist/index.js` - Express server bundle

**If build fails:**
```powershell
npm run check    # Check TypeScript errors
npm install      # Make sure all deps installed
npm run build    # Try again
```

### 4.3 Verify Build Output

```
Check these exist:
dist/
├── public/
│   ├── index.html
│   ├── assets/
│   └── ...
└── index.js
```

---

## Phase 5: Run Production Server ⏱️ 2 min

### 5.1 Start Application

```powershell
npm start
```

**Expected output:**
```
🌱 Starting database seeding...
⏭️  Police stations already exist (34 found)
⏭️  Ports already exist (11 found)
✅ Database seeding completed!
12:30:45 PM [express] serving on port 5000
```

### 5.2 Test Application

**Open browser:**
```
http://blocksystem.local
```

✅ You should see the login page!

**Login with:**
- Username: `admin`
- Password: `Admin@123`

---

## Phase 6: Verify Full Functionality ⏱️ 5 min

### 6.1 Test Key Features

- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create records
- [ ] Can search records
- [ ] Can access settings
- [ ] No console errors (press F12 to check)

### 6.2 Check API Requests

**Open DevTools (F12):**
1. Go to Network tab
2. Perform an action (e.g., login)
3. All requests should go to `http://blocksystem.local/api/...`
4. Status codes should be 200 (OK)

### 6.3 Verify Database Connection

From dashboard, you should see actual data from MySQL database.

---

## Production Configuration Summary

| Setting | Value |
|---------|-------|
| **URL** | http://blocksystem.local |
| **Server** | Express.js on port 5000 |
| **Proxy** | Apache reverse proxy |
| **Database** | MySQL/MariaDB on localhost:3306 |
| **Build** | Vite + esbuild |
| **Node Env** | production |

---

## Troubleshooting

### ❌ "Can't reach blocksystem.local"
```
✅ Solution:
1. Check hosts file: C:\Windows\System32\drivers\etc\hosts
2. Verify: 127.0.0.1 blocksystem.local is there
3. Run: ipconfig /flushdns (in PowerShell as Admin)
4. Try: ping blocksystem.local
```

### ❌ "Connection refused on port 5000"
```
✅ Solution:
1. Ensure npm start is running (check console)
2. Check port 5000 is available:
   netstat -ano | findstr :5000
3. Kill any processes on port 5000
4. Restart npm start
```

### ❌ "Apache won't start after VirtualHost config"
```
✅ Solution:
1. Run: httpd -t (in Apache bin directory)
2. Check for syntax errors in httpd-vhosts.conf
3. Verify proxy modules are enabled in httpd.conf
4. Check error log: C:\wamp64\bin\apache\apache2.4.x\logs\error.log
```

### ❌ "npm run build fails"
```
✅ Solution:
1. Check TypeScript: npm run check
2. Verify dependencies: npm install
3. Check disk space available
4. Clear build cache: delete dist/ folder
5. Try again: npm run build
```

### ❌ "API requests failing (404 or CORS errors)"
```
✅ Solution:
1. Check F12 Network tab - where are requests going?
2. Verify APP_URL in .env is correct
3. Ensure Apache proxy is working:
   - Test directly: http://127.0.0.1:5000
4. Check server CORS configuration in server/index.ts
5. Restart npm start
```

### ❌ "Database queries failing"
```
✅ Solution:
1. Verify MySQL is running (green in WampServer)
2. Check DATABASE_URL in .env
3. Test connection: mysql -u root blocksystem
4. Check database tables exist
5. Review server logs for SQL errors
```

### ❌ "Slow performance"
```
✅ Solutions:
1. Check Task Manager - CPU/Memory usage
2. Ensure MySQL is running efficiently
3. Check network latency: ping blocksystem.local
4. Verify Apache isn't logging too much
5. Consider: Too many requests? Browser cache?
```

---

## Performance Optimization

### For Development:
```
NODE_ENV=development
- Faster rebuilds
- Development logging
- Useful for debugging
```

### For Production:
```
NODE_ENV=production
- Optimized code
- Minified assets
- Better performance
```

### Database Optimization:
```
- Ensure MySQL indexes exist (created by schema)
- Monitor slow queries in MySQL
- Keep database backed up regularly
```

### Apache Optimization:
```
# In httpd.conf, tune for your system:
MaxConnectionsPerChild 500
MaxRequestWorkers 256
ThreadsPerChild 25
```

---

## Monitoring & Maintenance

### Daily:
- Check WampServer is running (green icons)
- Monitor for error logs
- Verify application loads quickly

### Weekly:
- Review Apache error logs
- Check MySQL disk usage
- Backup database

### Monthly:
- Update dependencies: npm outdated
- Review and rotate SESSION_SECRET if needed
- Clear old logs

### Backup Database:
```powershell
$date = Get-Date -Format yyyyMMdd_HHmmss
mysqldump -u root blocksystem > "backup_$date.sql"
```

### Restore Database:
```powershell
mysql -u root blocksystem < backup_20250101_120000.sql
```

---

## Port References

| Service | Port | Protocol |
|---------|------|----------|
| Apache/WampServer | 80 | HTTP |
| MySQL/MariaDB | 3306 | TCP |
| Node.js App | 5000 | HTTP |
| phpMyAdmin | 80 (via Apache) | HTTP |

---

## File Locations Reference

| Item | Location |
|------|----------|
| WampServer | `C:\wamp64\` |
| Apache config | `C:\wamp64\bin\apache\apache2.4.x\conf\` |
| MySQL bin | `C:\wamp64\bin\mysql\mysql8.0.36\bin\` |
| Project | `C:\Users\YourName\Projects\blocksystem\` |
| .env file | `C:\Users\YourName\Projects\blocksystem\.env` |
| Hosts file | `C:\Windows\System32\drivers\etc\hosts` |
| Built app | `C:\Users\YourName\Projects\blocksystem\dist\` |

---

## Next Steps After Setup

1. ✅ Access http://blocksystem.local
2. ✅ Login and verify features work
3. ✅ Create test data
4. ✅ Set up automatic backups
5. ✅ Document your configuration
6. ✅ Consider: SSL/HTTPS setup (optional)

---

## Production Checklist

- [ ] Windows hosts file updated (127.0.0.1 blocksystem.local)
- [ ] Apache VirtualHost configured
- [ ] Apache proxy modules enabled
- [ ] Apache restarted successfully
- [ ] .env file configured
- [ ] APP_URL set correctly
- [ ] npm install completed
- [ ] npm run build successful
- [ ] npm start running without errors
- [ ] Database seeding completed
- [ ] Login works
- [ ] Dashboard displays data
- [ ] No console errors (F12)
- [ ] All API requests working
- [ ] Session persistence works (refresh page maintains login)

---

## Success Indicators

✅ You're successful when:
1. `http://blocksystem.local` loads in browser
2. Login page displays
3. Can login with admin/Admin@123
4. Dashboard shows records from database
5. All navigation works
6. F12 DevTools shows no errors
7. API requests go to blocksystem.local
8. Features work identically to localhost:5000

**Congratulations! Your production system is live! 🎉**

---

## Need Help?

Refer to:
- **WampServer Issues:** WAMPSERVER_SETUP_CHECKLIST.md
- **MySQL Issues:** MIGRATION_GUIDE_MYSQL.md
- **Build Issues:** Check npm output and TypeScript errors
- **Apache Issues:** Check C:\wamp64\bin\apache\apache2.4.x\logs\error.log
- **Application Issues:** Check browser console (F12)

---

## Advanced: HTTPS Setup (Optional)

For HTTPS support (blocksystem.local), see Apache documentation:
https://httpd.apache.org/docs/current/mod/mod_ssl.html

Windows self-signed certificate generation:
https://docs.microsoft.com/en-us/windows/win32/seccrypto/creating-a-self-signed-certificate
