import { db } from "./db";
import { users, policeStations, ports } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log("⚠️  Users already exist. Skipping seed.");
      console.log(`Found ${existingUsers.length} existing users.`);
      return;
    }

    console.log("👤 Creating test users...");

    // Create Admin user
    const adminPassword = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      displayName: "مدير النظام",
      role: "admin",
      permissions: [
        "dashboard",
        "search",
        "data_entry",
        "reports",
        "import",
        "settings_users",
        "settings_stations",
        "settings_ports",
      ],
    });
    console.log("✅ Admin user created (username: admin, password: admin123)");

    // Create Supervisor user
    const supervisorPassword = await hashPassword("super123");
    await db.insert(users).values({
      username: "supervisor",
      password: supervisorPassword,
      displayName: "المشرف الأول",
      role: "supervisor",
      permissions: [
        "dashboard",
        "search",
        "data_entry",
        "reports",
        "import",
      ],
    });
    console.log("✅ Supervisor user created (username: supervisor, password: super123)");

    // Create Regular user
    const userPassword = await hashPassword("user123");
    await db.insert(users).values({
      username: "user",
      password: userPassword,
      displayName: "موظف النظام",
      role: "user",
      permissions: ["dashboard", "search"],
    });
    console.log("✅ Regular user created (username: user, password: user123)");

    console.log("\n🏢 Creating sample police stations...");

    const stations = [
      { name: "مركز الشرطة الأول", governorate: "بغداد" },
      { name: "مركز الشرطة الثاني", governorate: "البصرة" },
      { name: "مركز الشرطة الثالث", governorate: "الموصل" },
      { name: "مركز النجدة المركزي", governorate: "بغداد" },
      { name: "مركز المرور", governorate: "بغداد" },
    ];

    for (const station of stations) {
      await db.insert(policeStations).values(station);
    }
    console.log(`✅ Created ${stations.length} police stations`);

    console.log("\n🚢 Creating sample ports...");

    const portsData = [
      { name: "ميناء أم قصر" },
      { name: "ميناء أبو فلوس" },
      { name: "ميناء الفاو الكبير" },
      { name: "مطار بغداد الدولي" },
      { name: "منفذ طريبيل الحدودي" },
      { name: "منفذ إبراهيم الخليل" },
    ];

    for (const port of portsData) {
      await db.insert(ports).values(port);
    }
    console.log(`✅ Created ${portsData.length} ports`);

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📝 Test Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👨‍💼 Admin Account:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Role: Administrator (Full Access)");
    console.log("");
    console.log("👨‍💼 Supervisor Account:");
    console.log("   Username: supervisor");
    console.log("   Password: super123");
    console.log("   Role: Supervisor (Data Entry + Reports)");
    console.log("");
    console.log("👨‍💼 User Account:");
    console.log("   Username: user");
    console.log("   Password: user123");
    console.log("   Role: User (View Only)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("🎉 Seed completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seed failed:", error);
      process.exit(1);
    });
}

export { seed };
