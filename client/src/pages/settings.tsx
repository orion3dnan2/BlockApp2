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
  const { user, hasPermission } = useAuth();
  const [, setLocation] = useLocation();
  
  const canManageUsers = hasPermission("settings_users");
  const canManageStations = hasPermission("settings_stations");
  const canManagePorts = hasPermission("settings_ports");
  
  // Determine allowed default tab based on permissions
  const allowedDefaultTab = canManageUsers ? "users" : canManageStations ? "police-stations" : "ports";
  const [activeTab, setActiveTab] = useState(allowedDefaultTab);
  
  // Guard against trying to access tabs without permission
  useEffect(() => {
    if (activeTab === "users" && !canManageUsers) {
      setActiveTab(canManageStations ? "police-stations" : "ports");
    } else if (activeTab === "police-stations" && !canManageStations) {
      setActiveTab(canManagePorts ? "ports" : canManageUsers ? "users" : "ports");
    } else if (activeTab === "ports" && !canManagePorts) {
      setActiveTab(canManageUsers ? "users" : "police-stations");
    }
  }, [activeTab, canManageUsers, canManageStations, canManagePorts]);
  
  const handleTabChange = (value: string) => {
    // Prevent accessing tabs without permission
    if (value === "users" && !canManageUsers) return;
    if (value === "police-stations" && !canManageStations) return;
    if (value === "ports" && !canManagePorts) return;
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
        <TabsList className="grid w-full mb-8" style={{ gridTemplateColumns: `repeat(${[canManageUsers, canManageStations, canManagePorts].filter(Boolean).length}, minmax(0, 1fr))` }}>
          {canManageUsers && (
            <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
          )}
          {canManageStations && (
            <TabsTrigger value="police-stations" className="gap-2" data-testid="tab-police-stations">
              <Building2 className="h-4 w-4" />
              المخافر
            </TabsTrigger>
          )}
          {canManagePorts && (
            <TabsTrigger value="ports" className="gap-2" data-testid="tab-ports">
              <Ship className="h-4 w-4" />
              المنافذ
            </TabsTrigger>
          )}
        </TabsList>

        {canManageUsers && (
          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>
        )}

        {canManageStations && (
          <TabsContent value="police-stations">
            <PoliceStationsManagement />
          </TabsContent>
        )}

        {canManagePorts && (
          <TabsContent value="ports">
            <PortsManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
