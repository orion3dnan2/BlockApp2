import { FileText, Search, Users, Database, FileInput } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const modules = [
    { 
      title: "تقارير", 
      icon: FileText, 
      path: "/blocks/reports",
    },
    { 
      title: "استعلام", 
      icon: Search, 
      path: "/blocks/search",
    },
    { 
      title: "إدخال البيانات", 
      icon: FileInput, 
      path: "/blocks/data-entry",
    },
    { 
      title: "المستخدمين", 
      icon: Users, 
      path: "/blocks/users",
    },
    { 
      title: "استيراد", 
      icon: Database, 
      path: "/blocks/import",
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-blue-100 via-gray-100 to-blue-50" dir="rtl">
      <div className="container mx-auto px-6">
        {/* Logo Section */}
        <div className="mb-16 flex flex-col items-center justify-center">
          <div className="mb-6 flex h-48 w-48 items-center justify-center rounded-full bg-white/80 shadow-lg border-4 border-blue-300">
            <div className="text-center">
              <div className="mb-2 flex h-16 w-16 mx-auto items-center justify-center rounded-full border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-800">
                <div className="h-12 w-12 rounded-full border-2 border-white bg-white flex items-center justify-center">
                  <div className="text-xs font-bold text-blue-800">وزارة</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-gray-700">دولة الكويت</div>
              <div className="text-sm font-bold text-blue-900">وزارة الداخلية</div>
              <div className="mt-1 text-[10px] text-gray-600">STATE OF KUWAIT</div>
              <div className="text-[10px] font-semibold text-gray-700">MINISTRY OF INTERIOR</div>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="flex items-center justify-center gap-6 overflow-x-auto pb-4">
          {modules.map((module) => (
            <Card
              key={module.title}
              className="flex h-32 w-32 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-3 border border-blue-200/50 bg-white/40 backdrop-blur-sm transition-all hover:bg-white/60 hover:shadow-xl active:scale-95"
              onClick={() => setLocation(module.path)}
              data-testid={`card-module-${module.title}`}
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100/50 transition-colors hover:bg-blue-200/70">
                <module.icon className="h-7 w-7 text-blue-700" />
              </div>
              <div className="text-center text-sm font-semibold text-gray-800">
                {module.title}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
