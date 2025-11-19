import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DataTable from "@/components/DataTable";
import RecordForm from "@/components/RecordForm";
import { Plus, Download, X } from "lucide-react";
import type { Record } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const governorates = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية", "المنوفية"];

export default function SearchPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    inventoryNumber: "",
    registrationNumber: "",
    name: "",
    governorate: "",
    region: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const { data: records = [], isLoading } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  useEffect(() => {
    setFilteredRecords(records);
  }, [records]);

  const createMutation = useMutation({
    mutationFn: (data: any) => ApiClient.post<Record>("/api/records", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ApiClient.put<Record>(`/api/records/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiClient.delete(`/api/records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
    },
  });

  const handleSearch = () => {
    let filtered = records;

    if (filters.inventoryNumber) {
      filtered = filtered.filter((r) =>
        r.inventoryNumber.toLowerCase().includes(filters.inventoryNumber.toLowerCase())
      );
    }
    if (filters.registrationNumber) {
      filtered = filtered.filter((r) =>
        r.registrationNumber.toLowerCase().includes(filters.registrationNumber.toLowerCase())
      );
    }
    if (filters.name) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.governorate) {
      filtered = filtered.filter((r) => r.governorate === filters.governorate);
    }
    if (filters.region) {
      filtered = filtered.filter((r) =>
        r.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
    toast({
      title: "تم البحث",
      description: `تم العثور على ${filtered.length} سجل`,
    });
  };

  const handleNew = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        toast({
          title: "تم الحذف",
          description: "تم حذف السجل بنجاح",
        });
      } catch (error: any) {
        toast({
          title: "خطأ",
          description: error.message || "حدث خطأ أثناء حذف السجل",
          variant: "destructive",
        });
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({ id: editingRecord.id, data });
        toast({
          title: "تم التعديل",
          description: "تم تعديل السجل بنجاح",
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: "تم الحفظ",
          description: "تم إضافة السجل بنجاح",
        });
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "تصدير البيانات",
      description: "سيتم تصدير البيانات قريباً",
    });
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">الاستعلام</h2>
        <div className="flex gap-3">
          <Button onClick={handleExport} variant="outline" data-testid="button-export">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
          <Button onClick={handleNew} data-testid="button-new-record">
            <Plus className="ml-2 h-4 w-4" />
            جديد
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>رقم الحصر</Label>
            <div className="flex gap-2">
              <Input
                value={filters.inventoryNumber}
                onChange={(e) => setFilters({ ...filters, inventoryNumber: e.target.value })}
                data-testid="input-filter-inventory"
              />
              <Button size="sm" onClick={handleSearch} data-testid="button-search-inventory">
                بحث
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>رقم السجل</Label>
            <div className="flex gap-2">
              <Input
                value={filters.registrationNumber}
                onChange={(e) => setFilters({ ...filters, registrationNumber: e.target.value })}
                data-testid="input-filter-registration"
              />
              <Button size="sm" onClick={handleSearch} data-testid="button-search-registration">
                بحث
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>الاسم</Label>
            <div className="flex gap-2">
              <Input
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                data-testid="input-filter-name"
              />
              <Button size="sm" onClick={handleSearch} data-testid="button-search-name">
                بحث
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>المحافظة</Label>
            <Select
              value={filters.governorate}
              onValueChange={(value) => setFilters({ ...filters, governorate: value })}
            >
              <SelectTrigger data-testid="select-filter-governorate">
                <SelectValue placeholder="اختر المحافظة" />
              </SelectTrigger>
              <SelectContent>
                {governorates.map((gov) => (
                  <SelectItem key={gov} value={gov}>
                    {gov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>المنطقة</Label>
            <Input
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              data-testid="input-filter-region"
            />
          </div>

          <div className="space-y-2">
            <Label>تاريخ البداية</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              data-testid="input-filter-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label>تاريخ النهاية</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              data-testid="input-filter-end-date"
            />
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Input
              value={filters.notes}
              onChange={(e) => setFilters({ ...filters, notes: e.target.value })}
              data-testid="input-filter-notes"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={handleSearch} data-testid="button-search-all">
            بحث شامل
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({
                inventoryNumber: "",
                registrationNumber: "",
                name: "",
                governorate: "",
                region: "",
                startDate: "",
                endDate: "",
                notes: "",
              });
              setFilteredRecords(records);
            }}
            data-testid="button-clear-filters"
          >
            <X className="ml-2 h-4 w-4" />
            مسح الفلاتر
          </Button>
        </div>
      </div>

      <DataTable records={filteredRecords} onEdit={handleEdit} onDelete={handleDelete} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "تعديل السجل" : "سجل جديد"}</DialogTitle>
          </DialogHeader>
          <RecordForm
            defaultValues={editingRecord || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا السجل نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
