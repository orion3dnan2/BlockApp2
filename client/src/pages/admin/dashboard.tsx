import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Calendar, FileText, CheckCircle, Clock, AlertCircle, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const stats = [
    {
      title: "إجمالي الموظفين",
      value: "--",
      icon: Users,
      description: "موظف نشط",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "الحضور اليوم",
      value: "--",
      icon: CheckCircle,
      description: "من إجمالي الموظفين",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "طلبات الإجازات",
      value: "--",
      icon: Calendar,
      description: "قيد الانتظار",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "المعاملات النشطة",
      value: "--",
      icon: FileText,
      description: "معاملة قيد المراجعة",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "النظام الإداري جاهز للاستخدام",
      description: "تم إنشاء قاعدة البيانات وجميع الجداول المطلوبة",
      icon: Activity,
      time: "الآن",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">لوحة تحكم النظام الإداري</h1>
        <p className="text-sm text-muted-foreground">
          مرحباً {user?.displayName}، إليك ملخص عن حالة النظام
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} strokeWidth={2} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" strokeWidth={2} />
              النشاطات الأخيرة
            </CardTitle>
            <CardDescription>آخر التحديثات في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <activity.icon className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" strokeWidth={2} />
              الإجراءات السريعة
            </CardTitle>
            <CardDescription>الوظائف الأكثر استخداماً</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => setLocation("/admin/hr/employees")}
              data-testid="button-quick-employees"
            >
              <Users className="h-4 w-4" strokeWidth={2} />
              <span>إدارة الموظفين</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => setLocation("/admin/hr/leaves")}
              data-testid="button-quick-leaves"
            >
              <Calendar className="h-4 w-4" strokeWidth={2} />
              <span>طلبات الإجازات</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => setLocation("/admin/workflow/create")}
              data-testid="button-quick-workflow"
            >
              <FileText className="h-4 w-4" strokeWidth={2} />
              <span>إنشاء معاملة جديدة</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => setLocation("/admin/audit-logs")}
              data-testid="button-quick-audit"
            >
              <Activity className="h-4 w-4" strokeWidth={2} />
              <span>سجل النشاطات</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" strokeWidth={2} />
            ملاحظة مهمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm">
              تم إنشاء البنية التحتية الكاملة للنظام الإداري الحكومي بنجاح. يشمل النظام:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>نظام إدارة الموارد البشرية (الموظفين، الحضور، الإجازات، التقييم)</li>
              <li>نظام سير المعاملات الحكومية مع التوقيع الإلكتروني</li>
              <li>نظام التدقيق والمراجعة الكامل</li>
              <li>نظام الأمان المتقدم مع إدارة الصلاحيات</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              الخطوة التالية: تطوير واجهات المستخدم لكل وحدة وربطها بـ APIs الخاصة بها.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
