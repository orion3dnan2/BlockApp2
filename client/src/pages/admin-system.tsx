import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  Users, 
  ClipboardList, 
  GitBranch, 
  FileSignature, 
  BarChart3,
  Shield,
  Bell,
  Settings,
  Calendar,
  Award,
  AlertTriangle
} from "lucide-react";

interface ModuleCard {
  title: string;
  icon: any;
  path: string;
  description: string;
  permission?: string;
}

export default function AdminSystemPage() {
  const { user, hasPermission } = useAuth();
  const [, setLocation] = useLocation();

  const hrModules: ModuleCard[] = [
    {
      title: "إدارة الموظفين",
      icon: Users,
      path: "/admin/hr/employees",
      description: "عرض وإدارة بيانات الموظفين",
      permission: "hr_employees"
    },
    {
      title: "الحضور والانصراف",
      icon: Calendar,
      path: "/admin/hr/attendance",
      description: "تسجيل ومتابعة الحضور اليومي",
      permission: "hr_attendance"
    },
    {
      title: "الإجازات",
      icon: ClipboardList,
      path: "/admin/hr/leaves",
      description: "إدارة طلبات الإجازات",
      permission: "hr_leaves"
    },
    {
      title: "التقييم والجزاءات",
      icon: Award,
      path: "/admin/hr/performance",
      description: "التقييم السنوي والجزاءات",
      permission: "hr_performance"
    }
  ];

  const workflowModules: ModuleCard[] = [
    {
      title: "إنشاء معاملة",
      icon: FileSignature,
      path: "/admin/workflow/create",
      description: "إنشاء معاملة أو كتاب جديد",
      permission: "workflow_create"
    },
    {
      title: "المعاملات الواردة",
      icon: GitBranch,
      path: "/admin/workflow/inbox",
      description: "المعاملات التي تحتاج مراجعة",
      permission: "workflow_review"
    },
    {
      title: "التتبع والأرشفة",
      icon: ClipboardList,
      path: "/admin/workflow/tracking",
      description: "تتبع سير المعاملات",
    }
  ];

  const systemModules: ModuleCard[] = [
    {
      title: "لوحة الإحصائيات",
      icon: BarChart3,
      path: "/admin/dashboard",
      description: "إحصائيات ومؤشرات النظام",
      permission: "admin_system"
    },
    {
      title: "سجل النشاطات",
      icon: Shield,
      path: "/admin/audit-logs",
      description: "سجل كامل لجميع العمليات",
      permission: "admin_system"
    },
    {
      title: "التنبيهات",
      icon: Bell,
      path: "/admin/notifications",
      description: "مركز التنبيهات والإشعارات",
    },
    {
      title: "إعدادات النظام",
      icon: Settings,
      path: "/admin/settings",
      description: "الإعدادات المتقدمة",
      permission: "admin_system"
    }
  ];

  const filterByPermission = (modules: ModuleCard[]) => {
    if (!user) return [];
    if (user.role === "admin") return modules;
    return modules.filter(m => !m.permission || hasPermission(m.permission as any));
  };

  const filteredHR = filterByPermission(hrModules);
  const filteredWorkflow = filterByPermission(workflowModules);
  const filteredSystem = filterByPermission(systemModules);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-background via-muted/30 to-background" dir="rtl">
      <div className="container relative mx-auto px-4 pt-6 pb-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              النظام الإداري الحكومي
            </h1>
            <p className="text-sm text-muted-foreground">
              نظام متكامل لإدارة الموارد البشرية وسير المعاملات الحكومية
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 px-4 py-2">
            <p className="text-xs text-muted-foreground">الدور الحالي</p>
            <p className="text-sm font-bold text-primary">
              {user?.role === "admin" ? "مدير النظام" :
               user?.role === "hr" ? "موارد بشرية" :
               user?.role === "manager" ? "مدير" :
               user?.role === "director" ? "مدير عام" :
               user?.role === "reviewer" ? "مدقق" :
               "موظف"}
            </p>
          </div>
        </div>

        {filteredHR.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" strokeWidth={2} />
              <h2 className="text-xl font-bold">نظام الموارد البشرية</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredHR.map((module) => (
                <Card
                  key={module.title}
                  className="group cursor-pointer border-border/50 transition-all hover-elevate"
                  onClick={() => setLocation(module.path)}
                  data-testid={`card-${module.title}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-5 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <module.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-foreground">{module.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredWorkflow.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" strokeWidth={2} />
              <h2 className="text-xl font-bold">نظام سير المعاملات</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkflow.map((module) => (
                <Card
                  key={module.title}
                  className="group cursor-pointer border-border/50 transition-all hover-elevate"
                  onClick={() => setLocation(module.path)}
                  data-testid={`card-${module.title}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-5 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <module.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-foreground">{module.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredSystem.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" strokeWidth={2} />
              <h2 className="text-xl font-bold">إدارة النظام</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredSystem.map((module) => (
                <Card
                  key={module.title}
                  className="group cursor-pointer border-border/50 transition-all hover-elevate"
                  onClick={() => setLocation(module.path)}
                  data-testid={`card-${module.title}`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-5 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <module.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-foreground">{module.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredHR.length === 0 && filteredWorkflow.length === 0 && filteredSystem.length === 0 && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="mb-2 text-lg font-bold">لا توجد صلاحيات</h3>
              <p className="text-sm text-muted-foreground">
                ليس لديك صلاحيات للوصول إلى أي من وحدات النظام الإداري
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
