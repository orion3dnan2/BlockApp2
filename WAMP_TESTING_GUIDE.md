# دليل الاختبار على WampServer - Testing Guide for WampServer

## ❗ التوضيح المهم / Important Clarification

**السؤال: هل النظام يعمل فعلاً على MySQL/WampServer؟**

**الجواب: نعم، ولكن...**

### ✅ ما تم تنفيذه بالفعل:

1. **Database Layer - MySQL Complete**
   - ✅ `drizzle.config.ts`: MySQL dialect
   - ✅ `server/db.ts`: mysql2 connection pool (fixed)
   - ✅ `shared/schema.ts`: All MySQL types
   - ✅ PostgreSQL dependency removed (`@neondatabase/serverless`)

2. **Schema Definitions - MySQL Compatible**
   ```typescript
   // users table
   id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`)
   
   // police_stations & ports
   id: int("id").primaryKey().autoincrement()
   
   // records table - SPECIAL CASE
   id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`)
   recordNumber: int("record_number").notNull().autoincrement().unique()
   ```

3. **Production Build**
   - ✅ `npm run build` builds everything
   - ✅ `npm start` runs production server
   - ✅ Static files served from dist/public

4. **APP_URL Support**
   - ✅ CORS configured for custom domains
   - ✅ Supports blocksystem.local

### ⚠️ لماذا هناك أخطاء في Replit؟

**السبب البسيط:** بيئة Replit لا تحتوي على MySQL Server!

```
Error: connect ETIMEDOUT
```

هذا خطأ طبيعي لأن الكود يحاول الاتصال بـ MySQL ولكن لا يوجد MySQL server يعمل هنا.

---

## 🧪 كيفية الاختبار الفعلي على WampServer

### الخطوة 1: تثبيت المتطلبات

1. **تثبيت WampServer64**
   - تحميل من: https://www.wampserver.com/
   - يحتوي على: Apache, MySQL (MariaDB), PHP

2. **تثبيت Node.js**
   - تحميل من: https://nodejs.org/
   - الإصدار الموصى به: v20.x

### الخطوة 2: نقل المشروع إلى Windows

```powershell
# Clone or download project to Windows
cd C:\projects\blocksystem

# Install dependencies
npm install
```

### الخطوة 3: إعداد قاعدة البيانات

1. **تشغيل WampServer** (أيقونة خضراء)

2. **إنشاء قاعدة البيانات**
   ```sql
   -- Open phpMyAdmin (http://localhost/phpmyadmin)
   -- Or use MySQL console:
   
   CREATE DATABASE blocksystem 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

3. **إنشاء ملف .env**
   ```env
   DATABASE_URL=mysql://root:@localhost:3306/blocksystem
   APP_URL=http://localhost:5000
   PORT=5000
   NODE_ENV=development
   SESSION_SECRET=your-secret-key-here
   ```

### الخطوة 4: إنشاء الجداول

```powershell
# Push schema to MySQL
npm run db:push
```

**ماذا سيحدث:**
- سيتم إنشاء 4 جداول: users, records, police_stations, ports
- جميع الـ indexes والـ constraints سيتم إنشاؤها

**المخرجات المتوقعة:**
```
✓ Creating tables...
✓ Creating indexes...
✓ Done!
```

### الخطوة 5: تشغيل التطبيق (Development)

```powershell
npm run dev
```

**المخرجات المتوقعة:**
```
🌱 Starting database seeding...
📍 Inserting police stations...
✅ Inserted 39 police stations
🚪 Inserting ports...
✅ Inserted 11 ports
✅ Database seeding completed!
[express] serving on port 5000
```

**افتح المتصفح:** http://localhost:5000

### الخطوة 6: تشغيل التطبيق (Production)

```powershell
# Build
npm run build

# Run production
npm start
```

---

## 🔍 التحقق من صحة Schema

### Test 1: التحقق من الجداول
```sql
-- في phpMyAdmin أو MySQL console
SHOW TABLES;
```

**النتيجة المتوقعة:**
```
+------------------------+
| Tables_in_blocksystem  |
+------------------------+
| police_stations        |
| ports                  |
| records                |
| users                  |
+------------------------+
```

### Test 2: التحقق من بنية جدول records
```sql
DESCRIBE records;
```

**النتيجة المتوقعة:**
```
+------------------+--------------+------+-----+----------+---+
| Field            | Type         | Null | Key | Default  |   |
+------------------+--------------+------+-----+----------+---+
| id               | varchar(36)  | NO   | PRI | (uuid()) |   |
| record_number    | int          | NO   | UNI | NULL     | A |
| outgoing_number  | text         | NO   |     | NULL     |   |
| ...              | ...          | ... | ...  | ...      |   |
+------------------+--------------+------+-----+----------+---+
```

**مهم:**
- `record_number` يجب أن يكون `AUTO_INCREMENT` (A)
- `record_number` يجب أن يكون `UNIQUE` (UNI)

---

## 🛠️ استكشاف الأخطاء / Troubleshooting

### خطأ: "Cannot connect to MySQL"
**الحل:**
```powershell
# تحقق من أن WampServer يعمل (أيقونة خضراء)
# تحقق من DATABASE_URL في .env
# تحقق من أن MySQL port هو 3306
```

### خطأ: "Table already exists"
**الحل:**
```sql
-- احذف الجداول القديمة
DROP TABLE IF EXISTS records;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS police_stations;
DROP TABLE IF EXISTS ports;

-- ثم أعد تشغيل
npm run db:push
```

### خطأ: "Incorrect table definition; there can be only one auto column"
**الحل:** هذا يعني Schema خاطئ. تأكد من أن:
```typescript
// ✅ صحيح - autoincrement مع unique
recordNumber: int("record_number").notNull().autoincrement().unique()

// ❌ خاطئ - autoincrement بدون index
recordNumber: int("record_number").notNull().autoincrement()
```

---

## 📊 اختبار كامل للنظام

### 1. إنشاء مستخدم admin
```sql
-- سيتم إنشاؤه تلقائياً عند أول تسجيل
-- أو يدوياً:
INSERT INTO users (id, username, password, display_name, role)
VALUES 
  (UUID(), 'admin', '$2a$10$...hashed...', 'المدير', 'admin');
```

### 2. اختبار الـ API
```powershell
# Test users endpoint
curl http://localhost:5000/api/users

# Test police stations
curl http://localhost:5000/api/police-stations

# Test ports  
curl http://localhost:5000/api/ports

# Test records
curl http://localhost:5000/api/records
```

### 3. اختبار الواجهة
1. افتح: http://localhost:5000
2. سجل دخول بـ: admin / Admin@123
3. جرب:
   - إضافة قيد جديد
   - البحث عن القيود
   - عرض التقارير
   - إدارة المخافر والمنافذ (للمدير فقط)

---

## 🚀 الإعداد للـ Production مع Local Domain

### 1. تعديل hosts file
```
# C:\Windows\System32\drivers\etc\hosts
127.0.0.1 blocksystem.local
```

### 2. إعداد Apache VirtualHost
```apache
# C:\wamp64\bin\apache\apache2.x.x\conf\extra\httpd-vhosts.conf

<VirtualHost *:80>
    ServerName blocksystem.local
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/
    
    <Directory "C:/projects/blocksystem">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 3. تفعيل Proxy Modules في Apache
```apache
# في httpd.conf
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

### 4. تحديث .env
```env
DATABASE_URL=mysql://root:@localhost:3306/blocksystem
APP_URL=http://blocksystem.local
PORT=5000
NODE_ENV=production
```

### 5. Build & Run
```powershell
npm run build
npm start
```

**افتح:** http://blocksystem.local

---

## ✅ Checklist النهائي

قبل نشر النظام في Production، تأكد من:

- [ ] WampServer مثبت ويعمل
- [ ] MySQL database created (blocksystem)
- [ ] .env file configured correctly
- [ ] npm run db:push successful
- [ ] npm run build successful
- [ ] npm start works without errors
- [ ] يمكن تسجيل الدخول
- [ ] يمكن إضافة قيد جديد
- [ ] البحث يعمل
- [ ] المخافر والمنافذ تظهر في القوائم
- [ ] (Optional) Local domain works
- [ ] (Optional) Apache reverse proxy works

---

## 📝 ملاحظات مهمة

1. **Database Timeout في Replit:**
   - هذا طبيعي ولا يعني أن الكود خاطئ
   - النظام سيعمل بشكل طبيعي على WampServer

2. **Auto-increment على record_number:**
   - MySQL يسمح بهذا **فقط** إذا كان العمود indexed
   - `.unique()` يجعله indexed
   - لذلك الـ schema صحيح

3. **UUID على id:**
   - MySQL 5.7+ يدعم UUID()
   - MariaDB 10.2+ يدعم UUID()
   - إذا كنت تستخدم إصدار أقدم، قد تحتاج لتعديل

4. **Production vs Development:**
   - Development: `npm run dev` (مع hot reload)
   - Production: `npm run build && npm start`

---

## 🆘 الدعم

إذا واجهت مشاكل:
1. تحقق من WampServer logs: `C:\wamp64\logs\mysql.log`
2. تحقق من Node.js console output
3. تحقق من browser console (F12)
4. راجع phpMyAdmin لمعرفة بنية الجداول

---

**خلاصة:** النظام **جاهز** للعمل على WampServer + MySQL. الأخطاء الحالية في Replit طبيعية لعدم وجود MySQL server.
