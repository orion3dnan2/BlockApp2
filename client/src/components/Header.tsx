import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-blue-700 text-white shadow-md" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3">
        <h1 className="text-2xl font-bold text-yellow-400">نظام إدارة الرقابة والتفتيش</h1>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">المستخدم :</span>
          <span>{user.displayName}</span>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { logout } = useAuth();

  return (
    <footer className="bg-blue-700 text-white" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3">
        <div className="text-sm font-semibold">
          مدير النظام
        </div>
        
        <Button
          variant="ghost"
          onClick={logout}
          className="gap-2 text-white hover:bg-blue-600 hover:text-white"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج</span>
        </Button>
      </div>
    </footer>
  );
}
