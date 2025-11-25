import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Shield } from "lucide-react";
import GovLogo from "@/components/GovLogo";

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b bg-card shadow-sm" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GovLogo className="h-10 w-10" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight text-primary">
                نظام إدارة الرقابة والتفتيش
              </h1>
              <p className="text-xs text-muted-foreground">
                النظام الإلكتروني الموحد
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5">
              <User className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium">{user.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {user.role === "admin" ? "مدير النظام" : user.role === "supervisor" ? "مشرف" : "مستخدم"}
                </span>
              </div>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                console.log("تم الضغط على زر الخروج");
                logout();
              }}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              <span>خروج</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-card" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" strokeWidth={2} />
            <span>جميع الحقوق محفوظة © 2025</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            الإصدار 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}
