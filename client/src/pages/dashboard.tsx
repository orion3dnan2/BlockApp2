import { FileText, Search, Users, FileCheck, Database, Plus, TrendingUp, FileInput } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RecordForm from "@/components/RecordForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Record } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [] } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ApiClient.post<Record>("/api/records", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
    },
  });

  const modules = [
    { 
      title: "الاستعلام", 
      icon: Search, 
      path: "/search",
      description: "البحث في السجلات وإدارتها"
    },
    { 
      title: "التقارير", 
      icon: FileText, 
      path: "/reports",
      description: "عرض التقارير والإحصائيات"
    },
    { 
      title: "المستخدمين", 
      icon: Users, 
      path: "/users",
      description: "إدارة المستخدمين والصلاحيات"
    },
    { 
      title: "عمليات البلاغات", 
      icon: FileCheck, 
      path: "/operations",
      description: "متابعة وإدارة البلاغات"
    },
    { 
      title: "النسخة الاحتياطية", 
      icon: Database, 
      path: "/backup",
      description: "النسخ الاحتياطي والاستعادة"
    },
  ];

  const stats = [
    {
      title: "إجمالي السجلات",
      value: records.length,
      icon: FileInput,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "البلاغات العاجلة",
      value: records.filter(r => r.reportType === "بلاغ عاجل").length,
      icon: TrendingUp,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "البلاغات السرية",
      value: records.filter(r => r.reportType === "بلاغ سري").length,
      icon: FileCheck,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة السجل الجديد",
      });
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20" dir="rtl">
      <div className="container mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-wrap">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك في نظام إدارة البلاغات والقيود</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsFormOpen(true)}
            className="gap-2"
            data-testid="button-quick-add"
          >
            <Plus className="h-5 w-5" />
            إضافة سجل جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg overflow-visible">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">الوصول السريع</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Card 
                key={module.title}
                className="cursor-pointer border-0 shadow-lg hover-elevate active-elevate-2 overflow-visible"
                onClick={() => setLocation(module.path)}
                data-testid={`card-module-${module.title}`}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-3 min-w-12 min-h-12 w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <module.icon className="h-6 w-6 flex-shrink-0 text-primary" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="mt-2">{module.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Records */}
        {records.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">آخر السجلات</h2>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/search")}
                data-testid="button-view-all"
              >
                عرض الكل
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {records.slice(0, 3).map((record) => (
                <Card 
                  key={record.id} 
                  className="border-0 shadow-md hover-elevate active-elevate-2 cursor-pointer overflow-visible"
                  onClick={() => setLocation("/search")}
                  data-testid={`card-recent-${record.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">{record.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {record.governorate} - {record.region}
                        </CardDescription>
                      </div>
                      <div className={`rounded-md px-2 py-1 text-xs font-medium ${
                        record.reportType === "بلاغ عاجل" 
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                          : record.reportType === "بلاغ سري"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      }`}>
                        {record.reportType}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {record.notes || "لا توجد ملاحظات"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة سجل جديد</DialogTitle>
          </DialogHeader>
          <RecordForm
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
