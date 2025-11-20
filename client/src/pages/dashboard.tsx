import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 p-6" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white/90 shadow-2xl border-4 border-blue-300">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-800">
              <div className="h-16 w-16 rounded-full border-2 border-white bg-white flex items-center justify-center">
                <div className="text-[10px] font-bold text-blue-800">وزارة</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="text-welcome-title">
              مرحباً بك في نظام البلوكات
            </h1>
            <p className="text-lg text-gray-600" data-testid="text-user-greeting">
              {user?.displayName}
            </p>
            <p className="text-sm text-muted-foreground">
              وزارة الداخلية - دولة الكويت
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6 shadow-sm" data-testid="card-quick-access">
            <h2 className="mb-4 text-xl font-semibold">الوصول السريع</h2>
            <p className="text-sm text-muted-foreground">
              استخدم الشريط الجانبي للانتقال بين أقسام النظام:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• البحث والإدخال: إضافة وتعديل السجلات</li>
              <li>• التقارير: عرض الإحصائيات والتحليلات</li>
              {user?.role === "admin" && (
                <li>• الإعدادات: إدارة المستخدمين والنظام</li>
              )}
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm" data-testid="card-user-info">
            <h2 className="mb-4 text-xl font-semibold">معلومات المستخدم</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">الاسم: </span>
                <span className="text-muted-foreground" data-testid="text-user-name">
                  {user?.displayName}
                </span>
              </div>
              <div>
                <span className="font-medium">اسم المستخدم: </span>
                <span className="text-muted-foreground" data-testid="text-user-username">
                  {user?.username}
                </span>
              </div>
              <div>
                <span className="font-medium">الصلاحية: </span>
                <span className="text-muted-foreground" data-testid="text-user-role">
                  {user?.role === "admin" && "مدير النظام"}
                  {user?.role === "editor" && "محرر"}
                  {user?.role === "user" && "مستخدم"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
