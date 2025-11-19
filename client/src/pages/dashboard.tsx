import { FileText, Search, Users, FileCheck, Database, LogOut } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const modules = [
    { title: "التقارير", icon: FileText, path: "/reports" },
    { title: "الاستعلام", icon: Search, path: "/search" },
    { title: "المستخدمين", icon: Users, path: "/users" },
    { title: "عمليات البلاغات", icon: FileCheck, path: "/operations" },
    { title: "النسخة الاحتياطية", icon: Database, path: "/backup" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.title}
            title={module.title}
            icon={module.icon}
            onClick={() => setLocation(module.path)}
          />
        ))}
        <ModuleCard
          title="خروج"
          icon={LogOut}
          variant="danger"
          onClick={() => console.log("Logout clicked")}
        />
      </div>
    </div>
  );
}
