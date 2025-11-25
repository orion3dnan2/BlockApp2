import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ShieldCheck, ClipboardList, Search, PieChart, Settings, Database, LayoutGrid } from "lucide-react";
import GovLogo from "@/components/GovLogo";

interface ModuleCard {
  title: string;
  icon: any;
  path: string;
  description: string;
  allowedRoles?: UserRole[];
}

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("blocks");

  const allBlockSystemCards: ModuleCard[] = [
    { 
      title: "لوحة التحكم", 
      icon: ShieldCheck, 
      path: "/blocks/dashboard",
      description: "الصفحة الرئيسية للنظام",
      allowedRoles: ["admin", "supervisor", "user"],
    },
    { 
      title: "البحث", 
      icon: Search, 
      path: "/blocks/search",
      description: "البحث في السجلات",
      allowedRoles: ["admin", "supervisor", "user"],
    },
    { 
      title: "إدخال البيانات", 
      icon: ClipboardList, 
      path: "/blocks/data-entry",
      description: "إضافة وتعديل السجلات",
      allowedRoles: ["admin", "supervisor"],
    },
    { 
      title: "التقارير", 
      icon: PieChart, 
      path: "/blocks/reports",
      description: "عرض الإحصائيات والتقارير",
      allowedRoles: ["admin", "supervisor", "user"],
    },
    { 
      title: "الإعدادات", 
      icon: Settings, 
      path: "/blocks/settings",
      description: "إدارة الإعدادات والبيانات الأساسية",
      allowedRoles: ["admin", "supervisor"],
    },
    { 
      title: "استيراد", 
      icon: Database, 
      path: "/blocks/import",
      description: "استيراد البيانات من Excel",
      allowedRoles: ["admin", "supervisor"],
    },
  ];

  const blockSystemCards = user 
    ? allBlockSystemCards.filter(card => 
        !card.allowedRoles || card.allowedRoles.includes(user.role)
      )
    : allBlockSystemCards;

  const adminSystemCards = [
    { 
      title: "النظام الإداري", 
      icon: FileText, 
      path: "/admin",
      description: "نظام متكامل لإدارة الموارد البشرية وسير المعاملات",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-background via-muted/30 to-background" dir="rtl">
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.05),transparent_70%)]"
        style={{ top: '-5%' }}
      />
      
      <div className="container relative mx-auto px-4 pt-6 pb-12">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <GovLogo className="h-14 w-14" />
          </div>
          <h1 className="mb-1 text-3xl font-bold text-foreground">
            منصة إدارة الرقابة والتفتيش
          </h1>
          <p className="text-sm text-muted-foreground">
            النظام الإلكتروني الموحد للرقابة الحكومية
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="mb-6 grid w-full max-w-md mx-auto grid-cols-2 gap-2 h-auto p-1 bg-muted/50" data-testid="tabs-list">
            <TabsTrigger 
              value="blocks" 
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
              data-testid="tab-blocks"
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={2} />
              <span>نظام البلوكات</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm"
              data-testid="tab-admin"
            >
              <FileText className="h-4 w-4" strokeWidth={2} />
              <span>نظام إداري</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blockSystemCards.map((card) => (
                <Card
                  key={card.title}
                  className="group cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md"
                  onClick={() => setLocation(card.path)}
                  data-testid={`card-${card.title}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-5 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <card.icon className="h-7 w-7 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-foreground">{card.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {adminSystemCards.map((card) => (
                <Card
                  key={card.title}
                  className="group cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md"
                  onClick={() => setLocation(card.path)}
                  data-testid={`card-${card.title}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-5 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <card.icon className="h-7 w-7 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-foreground">{card.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{card.description}</p>
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
