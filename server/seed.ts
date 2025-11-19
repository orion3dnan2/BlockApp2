import { db } from "./db";
import { users, records } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create test users
    const hashedPassword = await hashPassword("123456");
    
    const testUsers = [
      {
        username: "admin",
        password: hashedPassword,
        displayName: "المدير العام",
      },
      {
        username: "user1",
        password: hashedPassword,
        displayName: "مستخدم تجريبي 1",
      },
      {
        username: "user2",
        password: hashedPassword,
        displayName: "مستخدم تجريبي 2",
      },
    ];

    console.log("Creating test users...");
    const createdUsers = await db.insert(users).values(testUsers).returning();
    console.log(`✓ Created ${createdUsers.length} test users`);

    // Create sample records
    const sampleRecords = [
      {
        inventoryNumber: "2024-001",
        registrationNumber: "REG-2024-001",
        civilRegistrationNumber: "CIV-20240001",
        name: "أحمد محمد علي",
        governorate: "القاهرة",
        region: "المعادي",
        reportType: "بلاغ عادي",
        date: new Date("2024-01-15"),
        notes: "بلاغ عن مخالفة بناء",
        additionalNotes: "تم إرسال تنبيه للجهات المختصة",
      },
      {
        inventoryNumber: "2024-002",
        registrationNumber: "REG-2024-002",
        civilRegistrationNumber: "CIV-20240002",
        name: "فاطمة حسن محمود",
        governorate: "الجيزة",
        region: "الدقي",
        reportType: "بلاغ عاجل",
        date: new Date("2024-02-20"),
        notes: "بلاغ عن حريق",
        additionalNotes: "تم التعامل مع البلاغ فوراً",
      },
      {
        inventoryNumber: "2024-003",
        registrationNumber: "REG-2024-003",
        civilRegistrationNumber: "CIV-20240003",
        name: "محمود عبد الله حسين",
        governorate: "الإسكندرية",
        region: "المنتزة",
        reportType: "قيد",
        date: new Date("2024-03-10"),
        notes: "قيد جديد للمتابعة",
        additionalNotes: null,
      },
      {
        inventoryNumber: "2024-004",
        registrationNumber: "REG-2024-004",
        civilRegistrationNumber: "CIV-20240004",
        name: "سارة أحمد سالم",
        governorate: "الشرقية",
        region: "الزقازيق",
        reportType: "بلاغ عادي",
        date: new Date("2024-03-25"),
        notes: "بلاغ عن تعدي على أرض زراعية",
        additionalNotes: "في انتظار المعاينة",
      },
      {
        inventoryNumber: "2024-005",
        registrationNumber: "REG-2024-005",
        civilRegistrationNumber: "CIV-20240005",
        name: "خالد محمد إبراهيم",
        governorate: "الدقهلية",
        region: "المنصورة",
        reportType: "بلاغ سري",
        date: new Date("2024-04-05"),
        notes: "بلاغ سري - معلومات حساسة",
        additionalNotes: "تحت التحقيق",
      },
    ];

    console.log("Creating sample records...");
    const createdRecords = await db.insert(records).values(sampleRecords).returning();
    console.log(`✓ Created ${createdRecords.length} sample records`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📝 Test Accounts:");
    console.log("══════════════════════════════════════");
    console.log("Username: admin");
    console.log("Password: 123456");
    console.log("Display Name: المدير العام");
    console.log("──────────────────────────────────────");
    console.log("Username: user1");
    console.log("Password: 123456");
    console.log("Display Name: مستخدم تجريبي 1");
    console.log("──────────────────────────────────────");
    console.log("Username: user2");
    console.log("Password: 123456");
    console.log("Display Name: مستخدم تجريبي 2");
    console.log("══════════════════════════════════════\n");

  } catch (error: any) {
    console.error("❌ Error seeding database:", error.message);
    throw error;
  }

  process.exit(0);
}

seed();
