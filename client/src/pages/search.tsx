import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import DataTable from "@/components/DataTable";
import RecordForm from "@/components/RecordForm";
import type { Record } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link } from "wouter";

export default function SearchPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: records = [], isLoading } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = records.filter((record) => {
      const fullName = `${record.firstName} ${record.secondName} ${record.thirdName} ${record.fourthName}`.toLowerCase();
      return (
        String(record.recordNumber).includes(query) ||
        fullName.includes(query) ||
        record.outgoingNumber.toLowerCase().includes(query) ||
        record.militaryNumber.toLowerCase().includes(query)
      );
    });

    setFilteredRecords(filtered);
  }, [records, searchQuery]);

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
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredRecords(records);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = records.filter((record) => {
      const fullName = `${record.firstName} ${record.secondName} ${record.thirdName} ${record.fourthName}`.toLowerCase();
      return (
        String(record.recordNumber).includes(query) ||
        fullName.includes(query) ||
        record.outgoingNumber.toLowerCase().includes(query) ||
        record.militaryNumber.toLowerCase().includes(query)
      );
    });

    setFilteredRecords(filtered);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({ id: editingRecord.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
      } catch (error: any) {
        toast({
          title: "خطأ",
          description: error.message || "حدث خطأ أثناء الحذف",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back Button */}
        <Link href="/">
          <Button variant="outline" className="gap-2" data-testid="button-back-to-dashboard">
            <ArrowRight className="h-4 w-4" />
            العودة للصفحة الرئيسية
          </Button>
        </Link>

        {/* Data Entry Form */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold" data-testid="heading-form-title">
            {editingRecord ? "تعديل السجل" : "إدخال البيانات"}
          </h2>
          <RecordForm
            record={editingRecord || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setEditingRecord(null)}
          />
        </div>

        {/* Quick Search Bar */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="بحث سريع: رقم السجل، الاسم، رقم الصادر، أو الرقم العسكري..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-quick-search"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-search"
            >
              بحث
            </Button>
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-muted-foreground" data-testid="text-search-results-count">
              عدد النتائج: {filteredRecords.length}
            </p>
          )}
        </div>

        {/* Data Table */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold" data-testid="heading-records">السجلات</h3>
          <DataTable
            records={filteredRecords}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl" data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-dialog-title">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-delete-dialog-description">
              هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-dialog">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete-dialog">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
