# نظام إدارة الرقابة والتفتيش
## Oversight and Inspection Management System

## متطلبات التشغيل / Requirements

### Windows + WampServer Setup
1. Install WampServer64 (includes Apache, MySQL, PHP)
2. Configure MySQL database
3. Setup local domain (optional)

## الإعداد السريع / Quick Setup

### 1. Database Setup (MySQL)
```sql
CREATE DATABASE blocksystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Environment Variables
Create `.env` file:
```env
DATABASE_URL=mysql://root:@localhost:3306/blocksystem
APP_URL=http://blocksystem.local
PORT=5000
NODE_ENV=production
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migration
```bash
npm run db:push
```

### 5. Build for Production
```bash
npm run build
```

### 6. Run Production Server
```bash
npm start
```

## التطوير / Development

```bash
npm run dev
```

## Apache Reverse Proxy (Optional)

Create VirtualHost for `blocksystem.local`:

```apache
<VirtualHost *:80>
    ServerName blocksystem.local
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/
</VirtualHost>
```

Add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 blocksystem.local
```

## بيانات الدخول الافتراضية / Default Credentials

- Username: `admin`
- Password: `Admin@123`

## الميزات / Features

- ✅ Full Arabic RTL support
- ✅ Role-based access control (Admin, Supervisor, User)
- ✅ Records management with search and filtering
- ✅ Excel import/export
- ✅ Database-driven dropdowns (Police Stations, Ports)
- ✅ Production-ready build
- ✅ MySQL/MariaDB support
- ✅ Local domain support
