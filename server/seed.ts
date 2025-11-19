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

    try {
      console.log("Creating test users...");
      const createdUsers = await db.insert(users).values(testUsers).returning();
      console.log(`✓ Created ${createdUsers.length} test users`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log("✓ Test users already exist, skipping...");
      } else {
        throw error;
      }
    }

    // Create sample records
    const sampleRecords = [
      {
        outgoingNumber: "2024-001",
        militaryNumber: "MIL-20240001",
        recordedNotes: "زيارة تفتيشية للمنطقة",
        firstName: "أحمد",
        secondName: "محمد",
        thirdName: "علي",
        fourthName: "السالم",
        tourDate: new Date("2024-01-15"),
        rank: "نقيب",
        governorate: "الجهراء",
        office: "الإدارة العامة",
        policeStation: "مخفر الجهراء",
      },
      {
        outgoingNumber: "2024-002",
        militaryNumber: "MIL-20240002",
        recordedNotes: "متابعة تقرير سابق",
        firstName: "فاطمة",
        secondName: "حسن",
        thirdName: "محمود",
        fourthName: "الخالد",
        tourDate: new Date("2024-02-20"),
        rank: "ملازم",
        governorate: "الأحمدي",
        office: "إدارة المباحث",
        policeStation: "مخفر الأحمدي",
      },
      {
        outgoingNumber: "2024-003",
        militaryNumber: "MIL-20240003",
        recordedNotes: null,
        firstName: "محمود",
        secondName: "عبد الله",
        thirdName: "حسين",
        fourthName: "المطيري",
        tourDate: new Date("2024-03-10"),
        rank: "رقيب",
        governorate: "الفروانية",
        office: "الإدارة العامة",
        policeStation: "مخفر الفروانية",
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
    console.log("══════════════════════════════════════\n");

  } catch (error: any) {
    console.error("❌ Error seeding database:", error.message);
    throw error;
  }

  process.exit(0);
}

seed();
