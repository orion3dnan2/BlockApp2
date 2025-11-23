import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldOff, ArrowRight } from "lucide-react";
import type { Permission } from "@shared/schema";

interface PermissionProtectedRouteProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

export default function PermissionProtectedRoute({
  children,
  permission,
  fallback,
}: PermissionProtectedRouteProps) {
  const { user, hasPermission } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return null;
  }

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]" dir="rtl">
        <Card className="max-w-md w-full" data-testid="card-access-denied">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldOff className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl" data-testid="title-access-denied">
              غير مصرح لك بالدخول
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground" data-testid="text-access-denied-message">
              عذراً، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول لطلب الصلاحيات المطلوبة.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-go-home"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى الصفحة الرئيسية
              </Button>
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="w-full"
                data-testid="button-go-dashboard"
              >
                الذهاب إلى لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
