import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Filter, X } from "lucide-react";
import DataTable from "@/components/DataTable";
import RecordForm from "@/components/RecordForm";
import type { Record } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function SearchPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filter states
  const [filterGovernorate, setFilterGovernorate] = useState("");
  const [filterRank, setFilterRank] = useState("");
  const [filterOffice, setFilterOffice] = useState("");
  const [filterPoliceStation, setFilterPoliceStation] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const { data: records = [], isLoading } = useQuery<Record[]>({
    queryKey: ["/api/records"],
  });

  // Extract unique values for filter dropdowns
  const uniqueGovernorates = useMemo(() => {
    const values = Array.from(new Set(records.map(r => r.governorate))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  const uniqueRanks = useMemo(() => {
    const values = Array.from(new Set(records.map(r => r.rank))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  const uniqueOffices = useMemo(() => {
    const values = Array.from(new Set(records.map(r => r.office))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  const uniquePoliceStations = useMemo(() => {
    const values = Array.from(new Set(records.map(r => r.policeStation))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  const filteredRecords = useMemo(() => {
    let result = records;

    // Text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((record) => {
        const fullName = `${record.firstName} ${record.secondName} ${record.thirdName} ${record.fourthName}`.toLowerCase();
        return (
          String(record.recordNumber).includes(query) ||
          fullName.includes(query) ||
          record.outgoingNumber.toLowerCase().includes(query) ||
          record.militaryNumber.toLowerCase().includes(query)
        );
      });
    }

    // Advanced filters
    if (filterGovernorate) {
      result = result.filter(r => r.governorate === filterGovernorate);
    }
    if (filterRank) {
      result = result.filter(r => r.rank === filterRank);
    }
    if (filterOffice) {
      result = result.filter(r => r.office === filterOffice);
    }
    if (filterPoliceStation) {
      result = result.filter(r => r.policeStation === filterPoliceStation);
    }
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      result = result.filter(r => {
        const tourDate = r.tourDate ? new Date(r.tourDate) : null;
        return tourDate && tourDate >= startDate;
      });
    }
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      result = result.filter(r => {
        const tourDate = r.tourDate ? new Date(r.tourDate) : null;
        return tourDate && tourDate <= endDate;
      });
    }

    return result;
  }, [records, searchQuery, filterGovernorate, filterRank, filterOffice, filterPoliceStation, filterStartDate, filterEndDate]);

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
    // Search is now handled by useMemo automatically
    // This function is kept for the button but doesn't need to do anything
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterGovernorate("");
    setFilterRank("");
    setFilterOffice("");
    setFilterPoliceStation("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const hasActiveFilters = searchQuery || filterGovernorate || filterRank || filterOffice || filterPoliceStation || filterStartDate || filterEndDate;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
        <div className="h-8 w-48 rounded bg-muted mb-4 animate-pulse"></div>
        <div className="h-64 rounded-lg bg-muted animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="title-page">
          البحث والاستعلام
        </h1>
        <Link href="/">
          <Button variant="outline" data-testid="button-back">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للصفحة الرئيسية
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card className="mb-6" data-testid="card-form">
        <CardHeader>
          <CardTitle data-testid="title-form">
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

      {/* Search and Filters */}
      <Card className="mb-6" data-testid="card-search">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle data-testid="title-search">البحث والتصفية</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                data-testid="button-reset-filters"
              >
                <X className="ml-1 h-4 w-4" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث برقم السجل، الاسم، رقم الصادر، أو الرقم العسكري..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search"
              />
            </div>
            <Button onClick={handleSearch} data-testid="button-search">
              <Search className="ml-2 h-4 w-4" />
              بحث
            </Button>
          </div>

          {/* Advanced Filters Toggle */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-toggle-filters">
                <Filter className="ml-2 h-4 w-4" />
                {showAdvancedFilters ? "إخفاء الفلاتر المتقدمة" : "إظهار الفلاتر المتقدمة"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4" data-testid="section-advanced-filters">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Governorate Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-governorate" data-testid="label-filter-governorate">المحافظة</Label>
                  <Select value={filterGovernorate} onValueChange={setFilterGovernorate}>
                    <SelectTrigger id="filter-governorate" data-testid="select-filter-governorate">
                      <SelectValue placeholder="جميع المحافظات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="option-governorate-all">جميع المحافظات</SelectItem>
                      {uniqueGovernorates.map((gov) => (
                        <SelectItem key={gov} value={gov} data-testid={`option-governorate-${gov}`}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rank Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-rank" data-testid="label-filter-rank">الرتبة</Label>
                  <Select value={filterRank} onValueChange={setFilterRank}>
                    <SelectTrigger id="filter-rank" data-testid="select-filter-rank">
                      <SelectValue placeholder="جميع الرتب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="option-rank-all">جميع الرتب</SelectItem>
                      {uniqueRanks.map((rank) => (
                        <SelectItem key={rank} value={rank} data-testid={`option-rank-${rank}`}>
                          {rank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Office Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-office" data-testid="label-filter-office">المكتب</Label>
                  <Select value={filterOffice} onValueChange={setFilterOffice}>
                    <SelectTrigger id="filter-office" data-testid="select-filter-office">
                      <SelectValue placeholder="جميع المكاتب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="option-office-all">جميع المكاتب</SelectItem>
                      {uniqueOffices.map((office) => (
                        <SelectItem key={office} value={office} data-testid={`option-office-${office}`}>
                          {office}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Police Station Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-station" data-testid="label-filter-station">المخفر</Label>
                  <Select value={filterPoliceStation} onValueChange={setFilterPoliceStation}>
                    <SelectTrigger id="filter-station" data-testid="select-filter-station">
                      <SelectValue placeholder="جميع المخافر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="option-station-all">جميع المخافر</SelectItem>
                      {uniquePoliceStations.map((station) => (
                        <SelectItem key={station} value={station} data-testid={`option-station-${station}`}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-start-date" data-testid="label-filter-start-date">من تاريخ</Label>
                  <Input
                    id="filter-start-date"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    data-testid="input-filter-start-date"
                  />
                </div>

                {/* End Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-end-date" data-testid="label-filter-end-date">إلى تاريخ</Label>
                  <Input
                    id="filter-end-date"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    data-testid="input-filter-end-date"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground" data-testid="text-results-count">
            {hasActiveFilters ? (
              <span>عدد النتائج: <strong>{filteredRecords.length}</strong> من أصل {records.length}</span>
            ) : (
              <span>إجمالي السجلات: <strong>{records.length}</strong></span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card data-testid="card-results">
        <CardHeader>
          <CardTitle data-testid="title-results">النتائج</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground" data-testid="text-no-results">
              {hasActiveFilters ? "لا توجد نتائج تطابق معايير البحث" : "لا توجد سجلات في النظام"}
            </div>
          ) : (
            <DataTable
              records={filteredRecords}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl" data-testid="dialog-delete">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="title-delete">هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-delete">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف السجل نهائياً.
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
