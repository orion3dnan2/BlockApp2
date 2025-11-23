import { db } from "./db";
import { policeStations, ports } from "@shared/schema";

const policeStationsData = [
  { name: "مخفر الشرقيه", governorate: "الشرقية" },
  { name: "مخفر حبيب الصعيسي", governorate: "العاصمة" },
  { name: "مخفر سالم المحيربي", governorate: "الشرقية" },
  { name: "مخفر الروي", governorate: "الشرقية" },
  { name: "مخفر عبدالعزيز الفريح", governorate: "الجهراء" },
  { name: "مخفر حبيب الاحمد", governorate: "الاحمدي" },
  { name: "مخفر عز", governorate: "الفروانية" },
  { name: "مخفر الزيتونة", governorate: "مبارك الكبير" },
  { name: "مخفر القشيدية", governorate: "الفروانية" },
  { name: "مخفر الشرقية", governorate: "الشرقية" },
  { name: "مخفر الرويات", governorate: "الشرقية" },
  { name: "مخفر قيمة", governorate: "الاحمدي" },
  { name: "مخفر النوخ", governorate: "الفروانية" },
  { name: "مخفر البطح", governorate: "الجهراء" },
  { name: "مخفر الواقية", governorate: "الفروانية" },
  { name: "مخفر الدشجل", governorate: "الجهراء" },
  { name: "مخفر الدوحة", governorate: "العاصمة" },
  { name: "مخفر الشنتيل", governorate: "الاحمدي" },
  { name: "مخفر الجليب", governorate: "الفروانية" },
  { name: "مخفر الخيران", governorate: "الاحمدي" },
  { name: "مخفر القرية", governorate: "الجهراء" },
  { name: "مخفر الانتصال", governorate: "الفروانية" },
  { name: "مخفر الندى", governorate: "الفروانية" },
  { name: "مخفر البويحة", governorate: "العاصمة" },
  { name: "مخفر الشامية", governorate: "الفروانية" },
  { name: "مخفر الوفرة", governorate: "الاحمدي" },
  { name: "مخفر جوخ سيدة", governorate: "العاصمة" },
  { name: "مخفر العاصمة", governorate: "العاصمة" },
  { name: "مخفر أم الهيمان", governorate: "الجهراء" },
  { name: "مخفر الفروغان", governorate: "الاحمدي" },
  { name: "مخفر الصليبية", governorate: "الاحمدي" },
  { name: "مخفر الرقعي", governorate: "الشرقية" },
  { name: "مخفر الساحل", governorate: "الشرقية" },
  { name: "مخفر الأبدلية", governorate: "الفروانية" },
];

const portsData = [
  { name: "منفذ الداخلية" },
  { name: "منفذ الرويايات" },
  { name: "منفذ البطح" },
  { name: "منفذ الطريق" },
  { name: "منفذ الحمام" },
  { name: "منفذ السالمية" },
  { name: "منفذ الملاح" },
  { name: "منفذ الشرقية" },
  { name: "منفذ مراكز البحث الجنوبي" },
  { name: "منفذ السالمي الدري" },
  { name: "منفذ الكويت" },
];

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if police stations already exist
    const existingStations = await db.select().from(policeStations);
    if (existingStations.length === 0) {
      console.log("📍 Inserting police stations...");
      for (const station of policeStationsData) {
        await db.insert(policeStations).values(station).onConflictDoNothing();
      }
      console.log(`✅ Inserted ${policeStationsData.length} police stations`);
    } else {
      console.log(`⏭️  Police stations already exist (${existingStations.length} found)`);
    }

    // Check if ports already exist
    const existingPorts = await db.select().from(ports);
    if (existingPorts.length === 0) {
      console.log("🚪 Inserting ports...");
      for (const port of portsData) {
        await db.insert(ports).values(port).onConflictDoNothing();
      }
      console.log(`✅ Inserted ${portsData.length} ports`);
    } else {
      console.log(`⏭️  Ports already exist (${existingPorts.length} found)`);
    }

    console.log("✅ Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
