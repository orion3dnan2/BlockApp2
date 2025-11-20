import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import RecordForm from "@/components/RecordForm";
import DataTable from "@/components/DataTable";
import type { Record } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DataEntryPage() {
  const { toast } = useToast();
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: records = [], isLoading } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ApiClient.post<Record>("/api/records", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة السجل بنجاح",
      });
      setEditingRecord(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ApiClient.put<Record>(`/api/records/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث السجل بنجاح",
      });
      setEditingRecord(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiClient.delete(`/api/records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف السجل بنجاح",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: any) => {
    if (editingRecord) {
      await updateMutation.mutateAsync({ id: editingRecord.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
    }
  };

  const clearFilters = () => {
    setEditingRecord(null);
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2" data-testid="button-back-home">
            <ArrowRight className="h-4 w-4" />
            العودة للصفحة الرئيسية
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إدخال البيانات</h1>
        <p className="mt-2 text-gray-600">إضافة وتعديل البلاغات والقيود</p>
      </div>

      {/* Add/Edit Form */}
      <Card className="mb-8" data-testid="card-data-entry-form">
        <CardHeader>
          <CardTitle className="text-xl">
            {editingRecord ? "تعديل السجل" : "إضافة سجل جديد"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecordForm
            onSubmit={handleSubmit}
            record={editingRecord || undefined}
            onCancel={() => setEditingRecord(null)}
          />
        </CardContent>
      </Card>

      {/* Recent Records Table */}
      <Card data-testid="card-recent-records">
        <CardHeader>
          <CardTitle className="text-xl">السجلات الأخيرة</CardTitle>
          <p className="text-sm text-muted-foreground">
            عدد السجلات: {records.length}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold">جاري التحميل...</div>
                <div className="text-sm text-muted-foreground">يرجى الانتظار</div>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="flex items-center justify-center py-12" data-testid="empty-state">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold">لا توجد سجلات</div>
                <div className="text-sm text-muted-foreground">
                  قم بإضافة سجل جديد من النموذج أعلاه
                </div>
              </div>
            </div>
          ) : (
            <DataTable
              records={records.slice(0, 10)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
