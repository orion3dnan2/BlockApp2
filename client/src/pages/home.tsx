import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ShieldCheck, ClipboardList, Search, PieChart, Users, Database } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("blocks");

  const blockSystemCards = [
    { 
      title: "لوحة التحكم", 
      icon: ShieldCheck, 
      path: "/blocks/dashboard",
      description: "الصفحة الرئيسية للنظام",
    },
    { 
      title: "البحث", 
      icon: Search, 
      path: "/blocks/search",
      description: "البحث في السجلات",
    },
    { 
      title: "إدخال البيانات", 
      icon: ClipboardList, 
      path: "/blocks/data-entry",
      description: "إضافة وتعديل السجلات",
    },
    { 
      title: "التقارير", 
      icon: PieChart, 
      path: "/blocks/reports",
      description: "عرض الإحصائيات والتقارير",
    },
    { 
      title: "المستخدمين", 
      icon: Users, 
      path: "/blocks/users",
      description: "إدارة المستخدمين",
    },
    { 
      title: "استيراد", 
      icon: Database, 
      path: "/blocks/import",
      description: "استيراد البيانات من Excel",
    },
  ];

  const adminSystemCards = [
    { 
      title: "قريباً", 
      icon: FileText, 
      path: "#",
      description: "النظام الإداري قيد التطوير",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <ShieldCheck className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              نظام إدارة الرقابة والتفتيش
            </h1>
          </div>
          {user && (
            <p className="text-lg text-gray-600">
              مرحباً، <span className="font-semibold text-blue-700">{user.displayName}</span>
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="mb-8 grid w-full grid-cols-2 gap-4" data-testid="tabs-list">
            <TabsTrigger 
              value="admin" 
              className="text-lg"
              data-testid="tab-admin"
            >
              نظام إداري
            </TabsTrigger>
            <TabsTrigger 
              value="blocks" 
              className="text-lg"
              data-testid="tab-blocks"
            >
              نظام البلوكات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {adminSystemCards.map((card) => (
                <Card
                  key={card.title}
                  className="group cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => card.path !== "#" && setLocation(card.path)}
                  data-testid={`card-${card.title}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-blue-100 p-6 transition-colors group-hover:bg-blue-200">
                      <card.icon className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blockSystemCards.map((card) => (
                <Card
                  key={card.title}
                  className="group cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => setLocation(card.path)}
                  data-testid={`card-${card.title}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-blue-100 p-6 transition-colors group-hover:bg-blue-200">
                      <card.icon className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
