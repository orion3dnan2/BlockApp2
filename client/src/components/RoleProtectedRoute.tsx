import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = "/"
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">ممنوع الدخول</CardTitle>
            <CardDescription>
              عذراً، ليس لديك الصلاحية للوصول إلى هذه الصفحة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground text-center">
                صلاحيتك الحالية: <span className="font-semibold text-foreground">{getRoleLabel(user.role)}</span>
              </p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                هذه الصفحة متاحة فقط لـ: <span className="font-semibold text-foreground">
                  {allowedRoles.map(getRoleLabel).join(" أو ")}
                </span>
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = redirectTo}
              data-testid="button-go-back"
            >
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "مدير",
    supervisor: "مشرف",
    user: "مستخدم عادي"
  };
  return labels[role];
}
