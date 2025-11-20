import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon, Plus, Pencil, Trash2, ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";

// Define user type without password
type UserWithoutPassword = Omit<User, "password">;

// Form validation schemas
const createUserSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  displayName: z.string().min(2, "الاسم الكامل يجب أن يكون حرفين على الأقل"),
});

const updateUserSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل").optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(),
  displayName: z.string().min(2, "الاسم الكامل يجب أن يكون حرفين على الأقل").optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function UsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Fetch users
  const { data: users = [], isLoading, isError, error, refetch } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/users"],
  });

  // Create form
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
    },
  });

  // Update form
  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة المستخدم بنجاح",
      });
      setIsDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserFormData }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث المستخدم بنجاح",
      });
      setIsDialogOpen(false);
      setEditingUser(null);
      updateForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });
      setDeleteUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.displayName.toLowerCase().includes(query)
    );
  });

  const handleAddUser = () => {
    setEditingUser(null);
    createForm.reset();
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserWithoutPassword) => {
    setEditingUser(user);
    updateForm.reset({
      username: user.username,
      displayName: user.displayName,
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    setDeleteUserId(id);
  };

  const handleCreateSubmit = (data: CreateUserFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateUserFormData) => {
    if (!editingUser) return;
    
    // Remove empty fields
    const cleanData: any = {};
    if (data.username && data.username !== editingUser.username) cleanData.username = data.username;
    if (data.displayName && data.displayName !== editingUser.displayName) cleanData.displayName = data.displayName;
    if (data.password) cleanData.password = data.password;

    if (Object.keys(cleanData).length === 0) {
      toast({
        title: "تنبيه",
        description: "لم يتم تغيير أي بيانات",
        variant: "default",
      });
      return;
    }

    updateMutation.mutate({ id: editingUser.id, data: cleanData });
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted"></div>
          <div className="h-64 rounded-lg bg-muted"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
        <Card data-testid="card-error">
          <CardHeader>
            <CardTitle className="text-destructive" data-testid="text-error-title">حدث خطأ في تحميل البيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground" data-testid="text-error-message">
              {error instanceof Error ? error.message : "تعذر تحميل بيانات المستخدمين. يرجى المحاولة مرة أخرى."}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => refetch()} variant="default" data-testid="button-retry">
                إعادة المحاولة
              </Button>
              <Link href="/">
                <Button variant="outline" data-testid="button-back-error">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold" data-testid="title-page">
            <UsersIcon className="h-8 w-8" />
            إدارة المستخدمين
          </h1>
          <p className="text-muted-foreground" data-testid="text-description">
            إدارة حسابات المستخدمين في النظام
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" data-testid="button-back">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للصفحة الرئيسية
          </Button>
        </Link>
      </div>

      {/* Search and Add */}
      <Card className="mb-6" data-testid="card-search">
        <CardHeader>
          <CardTitle data-testid="title-search">البحث والإضافة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search"
              />
            </div>
            <Button onClick={handleAddUser} data-testid="button-add">
              <Plus className="ml-2 h-4 w-4" />
              إضافة مستخدم
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card data-testid="card-users-table">
        <CardHeader>
          <CardTitle data-testid="title-users">المستخدمون</CardTitle>
          <CardDescription data-testid="text-users-count">
            إجمالي المستخدمين: {filteredUsers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground" data-testid="text-empty">
              {searchQuery ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمون في النظام"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right" data-testid="header-username">اسم المستخدم</TableHead>
                    <TableHead className="text-right" data-testid="header-displayname">الاسم الكامل</TableHead>
                    <TableHead className="text-right" data-testid="header-actions">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium" data-testid={`cell-username-${user.id}`}>
                        {user.username}
                      </TableCell>
                      <TableCell data-testid={`cell-displayname-${user.id}`}>
                        {user.displayName}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Pencil className="ml-1 h-3 w-3" />
                            تعديل
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="ml-1 h-3 w-3" />
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl" data-testid="dialog-user-form">
          <DialogHeader>
            <DialogTitle data-testid="title-dialog">
              {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
            </DialogTitle>
            <DialogDescription data-testid="text-dialog-description">
              {editingUser
                ? "قم بتعديل بيانات المستخدم أدناه. اترك كلمة المرور فارغة إذا كنت لا ترغب في تغييرها."
                : "قم بإدخال بيانات المستخدم الجديد"}
            </DialogDescription>
          </DialogHeader>

          {editingUser ? (
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <FormField
                  control={updateForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-username">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-displayname">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-displayname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-password">كلمة المرور الجديدة (اختياري)</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="اتركها فارغة لعدم التغيير" data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit">
                    {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-username">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-displayname">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-displayname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-password">كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                    {createMutation.isPending ? "جاري الحفظ..." : "إضافة المستخدم"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent dir="rtl" data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="title-delete-confirm">هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-delete-confirm">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم نهائياً من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-delete-confirm">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
