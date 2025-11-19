import { useState } from "react";
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

const governorates = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية", "المنوفية"];

//todo: remove mock functionality
const mockRecords: Record[] = [
  {
    id: '1',
    inventoryNumber: '2024-001',
    registrationNumber: 'REG-001',
    civilRegistrationNumber: 'CIV-001',
    name: 'أحمد محمد علي',
    governorate: 'القاهرة',
    region: 'المعادي',
    reportType: 'بلاغ عادي',
    date: new Date('2024-01-15'),
    notes: 'ملاحظات تجريبية للسجل الأول',
    additionalNotes: 'ملاحظات إضافية مهمة',
    createdAt: new Date(),
  },
  {
    id: '2',
    inventoryNumber: '2024-002',
    registrationNumber: 'REG-002',
    civilRegistrationNumber: 'CIV-002',
    name: 'فاطمة حسن محمود',
    governorate: 'الجيزة',
    region: 'الدقي',
    reportType: 'بلاغ عاجل',
    date: new Date('2024-02-20'),
    notes: 'ملاحظات عن البلاغ العاجل',
    additionalNotes: 'يحتاج متابعة فورية',
    createdAt: new Date(),
  },
  {
    id: '3',
    inventoryNumber: '2024-003',
    registrationNumber: 'REG-003',
    civilRegistrationNumber: 'CIV-003',
    name: 'محمود عبد الله',
    governorate: 'الإسكندرية',
    region: 'المنتزة',
    reportType: 'قيد',
    date: new Date('2024-03-10'),
    notes: 'قيد جديد للمتابعة',
    additionalNotes: null,
    createdAt: new Date(),
  },
];

export default function SearchPage() {
  const [records, setRecords] = useState<Record[]>(mockRecords);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>(mockRecords);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const confirmDelete = () => {
    if (deleteId) {
      setRecords(records.filter((r) => r.id !== deleteId));
      setFilteredRecords(filteredRecords.filter((r) => r.id !== deleteId));
      toast({
        title: "تم الحذف",
        description: "تم حذف السجل بنجاح",
      });
      setDeleteId(null);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingRecord) {
      const updated = records.map((r) =>
        r.id === editingRecord.id ? { ...r, ...data } : r
      );
      setRecords(updated);
      setFilteredRecords(updated);
      toast({
        title: "تم التعديل",
        description: "تم تعديل السجل بنجاح",
      });
    } else {
      const newRecord: Record = {
        id: String(Date.now()),
        ...data,
        createdAt: new Date(),
      };
      setRecords([...records, newRecord]);
      setFilteredRecords([...records, newRecord]);
      toast({
        title: "تم الحفظ",
        description: "تم إضافة السجل بنجاح",
      });
    }
    setIsFormOpen(false);
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
