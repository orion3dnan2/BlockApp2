import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Database, FileUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@shared/schema";
import { apiRequest, queryClient as qClient } from "@/lib/queryClient";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "user" as "admin" | "editor" | "user",
  });

  // Check if current user is admin
  if (currentUser?.role !== "admin") {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
        <Card data-testid="card-unauthorized">
          <CardHeader>
            <CardTitle className="text-destructive" data-testid="text-unauthorized-title">
              غير مصرح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p data-testid="text-unauthorized-message">
              عذراً، لا تملك الصلاحيات للوصول إلى هذه الصفحة. يجب أن تكون مديراً للنظام.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      return apiRequest<User>("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم إضافة المستخدم",
        description: "تم إضافة المستخدم الجديد بنجاح",
      });
      setIsAddUserOpen(false);
      setNewUser({ username: "", password: "", displayName: "", role: "user" });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة المستخدم",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/users/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح",
      });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف المستخدم",
        variant: "destructive",
      });
    },
  });

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.displayName) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          الإعدادات
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          إدارة المستخدمين والبيانات والنظام
        </p>
      </div>

      {/* User Management */}
      <Card data-testid="card-user-management">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2" data-testid="title-user-management">
                <Shield className="h-5 w-5" />
                إدارة المستخدمين
              </CardTitle>
              <CardDescription>إضافة وتعديل وحذف مستخدمي النظام</CardDescription>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-user">
                  <UserPlus className="ml-2 h-4 w-4" />
                  إضافة مستخدم
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle data-testid="dialog-title-add-user">إضافة مستخدم جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات المستخدم الجديد والصلاحية المناسبة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="أدخل اسم المستخدم"
                      data-testid="input-new-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="أدخل كلمة المرور"
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">الاسم الكامل</Label>
                    <Input
                      id="displayName"
                      value={newUser.displayName}
                      onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                      placeholder="أدخل الاسم الكامل"
                      data-testid="input-new-displayname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">الصلاحية</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: "admin" | "editor" | "user") =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger data-testid="select-new-role">
                        <SelectValue placeholder="اختر الصلاحية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin" data-testid="role-admin">
                          مدير النظام
                        </SelectItem>
                        <SelectItem value="editor" data-testid="role-editor">
                          محرر
                        </SelectItem>
                        <SelectItem value="user" data-testid="role-user">
                          مستخدم
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddUserOpen(false)}
                    data-testid="button-cancel-add-user"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={createUserMutation.isPending}
                    data-testid="button-confirm-add-user"
                  >
                    {createUserMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="loading-users">
              جاري التحميل...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-users">
              لا يوجد مستخدمين
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right" data-testid="header-username">
                    اسم المستخدم
                  </TableHead>
                  <TableHead className="text-right" data-testid="header-displayname">
                    الاسم الكامل
                  </TableHead>
                  <TableHead className="text-right" data-testid="header-role">
                    الصلاحية
                  </TableHead>
                  <TableHead className="text-right" data-testid="header-actions">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id} data-testid={`row-user-${index}`}>
                    <TableCell data-testid={`cell-username-${index}`}>
                      {user.username}
                    </TableCell>
                    <TableCell data-testid={`cell-displayname-${index}`}>
                      {user.displayName}
                    </TableCell>
                    <TableCell data-testid={`cell-role-${index}`}>
                      {user.role === "admin" && "مدير النظام"}
                      {user.role === "editor" && "محرر"}
                      {user.role === "user" && "مستخدم"}
                    </TableCell>
                    <TableCell>
                      {currentUser?.id !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(user.id)}
                          data-testid={`button-delete-user-${index}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="dialog-title-delete-user">
              حذف المستخدم
            </AlertDialogTitle>
            <AlertDialogDescription data-testid="dialog-description-delete-user">
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-user">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteUserMutation.mutate(deleteId)}
              data-testid="button-confirm-delete-user"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Data Management */}
      <Card data-testid="card-data-management">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="title-data-management">
            <Database className="h-5 w-5" />
            إدارة البيانات
          </CardTitle>
          <CardDescription>نسخ احتياطي واستيراد البيانات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium" data-testid="text-backup-title">
                  نسخة احتياطية للبيانات
                </h3>
                <p className="text-sm text-muted-foreground">
                  تصدير جميع السجلات كملف CSV
                </p>
              </div>
              <Button variant="outline" data-testid="button-export-data">
                <FileUp className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium" data-testid="text-import-title">
                  استيراد البيانات
                </h3>
                <p className="text-sm text-muted-foreground">
                  استيراد السجلات من ملف CSV
                </p>
              </div>
              <Button variant="outline" data-testid="button-import-data">
                <Database className="ml-2 h-4 w-4" />
                استيراد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
