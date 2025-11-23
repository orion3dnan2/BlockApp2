import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Users, Building2, Ship, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import UsersManagement from "@/components/settings/UsersManagement";
import PoliceStationsManagement from "@/components/settings/PoliceStationsManagement";
import PortsManagement from "@/components/settings/PortsManagement";

export default function SettingsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isAdmin = user?.role === "admin";
  
  // Determine allowed default tab based on role
  const allowedDefaultTab = isAdmin ? "users" : "police-stations";
  const [activeTab, setActiveTab] = useState(allowedDefaultTab);
  
  // Guard against non-admin trying to access users tab
  useEffect(() => {
    if (!isAdmin && activeTab === "users") {
      setActiveTab("police-stations");
    }
  }, [isAdmin, activeTab]);
  
  const handleTabChange = (value: string) => {
    // Prevent non-admins from accessing users tab
    if (!isAdmin && value === "users") {
      return;
    }
    setActiveTab(value);
  };
  
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">الإعدادات</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>
        <p className="text-muted-foreground text-lg">
          إدارة إعدادات النظام والبيانات الأساسية
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} mb-8`}>
          {isAdmin && (
            <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
          )}
          <TabsTrigger value="police-stations" className="gap-2" data-testid="tab-police-stations">
            <Building2 className="h-4 w-4" />
            المخافر
          </TabsTrigger>
          <TabsTrigger value="ports" className="gap-2" data-testid="tab-ports">
            <Ship className="h-4 w-4" />
            المنافذ
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>
        )}

        <TabsContent value="police-stations">
          <PoliceStationsManagement />
        </TabsContent>

        <TabsContent value="ports">
          <PortsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
