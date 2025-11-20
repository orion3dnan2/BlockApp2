import {
  FileText,
  Search,
  Settings,
  Home,
  LogOut,
  User,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const mainMenuItems = [
    {
      title: "الصفحة الرئيسية",
      icon: Home,
      path: "/",
    },
    {
      title: "البحث والإدخال",
      icon: Search,
      path: "/search",
    },
    {
      title: "التقارير",
      icon: FileText,
      path: "/reports",
    },
  ];

  const settingsMenuItems = [
    {
      title: "الإعدادات",
      icon: Settings,
      path: "/settings",
      requiresAdmin: true,
    },
  ];

  const filteredSettingsItems = settingsMenuItems.filter(
    (item) => !item.requiresAdmin || user?.role === "admin"
  );

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="border-b p-4" data-testid="sidebar-header">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="h-8 w-8 rounded-full border-2 border-white bg-white flex items-center justify-center">
              <div className="text-[8px] font-bold text-blue-800">وزارة</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-foreground">نظام البلوكات</div>
            <div className="text-[10px] text-muted-foreground">وزارة الداخلية</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel data-testid="label-main-menu">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.path}
                    data-testid={`sidebar-item-${item.path.replace(/\//g, '-') || 'home'}`}
                  >
                    <Link href={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredSettingsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel data-testid="label-settings-menu">الإدارة</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSettingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.path}
                      data-testid={`sidebar-item-settings`}
                    >
                      <Link href={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4" data-testid="sidebar-footer">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-2" data-testid="user-info">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-medium" data-testid="text-username">
                {user?.displayName}
              </div>
              <div className="truncate text-xs text-muted-foreground" data-testid="text-userrole">
                {user?.role === "admin" && "مدير النظام"}
                {user?.role === "editor" && "محرر"}
                {user?.role === "user" && "مستخدم"}
              </div>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full"
            data-testid="button-logout"
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
