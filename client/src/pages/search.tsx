import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Filter, X, Eye } from "lucide-react";
import DataTable from "@/components/DataTable";
import type { Record } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function SearchPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRecord, setViewingRecord] = useState<Record | null>(null);
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
    const values = Array.from(new Set(records.map(r => r.office))).filter((v): v is string => Boolean(v));
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
          (record.outgoingNumber?.toLowerCase() || "").includes(query) ||
          (record.militaryNumber?.toLowerCase() || "").includes(query)
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

  const handleView = (record: Record) => {
    setViewingRecord(record);
  };

  const handleEdit = (record: Record) => {
    setLocation(`/data-entry?edit=${record.id}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterGovernorate("");
    setFilterRank("");
    setFilterOffice("");
    setFilterPoliceStation("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const hasActiveFilters = searchQuery || filterGovernorate || filterRank || 
    filterOffice || filterPoliceStation || filterStartDate || filterEndDate;

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
        <h1 className="text-3xl font-bold text-gray-900">الاستعلام والبحث</h1>
        <p className="mt-2 text-gray-600">البحث عن البلاغات والقيود المسجلة</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8" data-testid="card-search-filters">
        <CardHeader>
          <CardTitle className="text-xl">البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-base font-semibold">البحث السريع</Label>
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="ابحث برقم السجل، الاسم، رقم الصادر، أو الرقم العسكري..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search-records"
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                data-testid="button-toggle-filters"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  الفلاتر المتقدمة
                </span>
                {showAdvancedFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-6 space-y-4">
              {/* Filter Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Governorate Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-governorate">المحافظة</Label>
                  <Select value={filterGovernorate} onValueChange={setFilterGovernorate}>
                    <SelectTrigger id="filter-governorate" data-testid="select-filter-governorate">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {uniqueGovernorates.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rank Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-rank">الرتبة</Label>
                  <Select value={filterRank} onValueChange={setFilterRank}>
                    <SelectTrigger id="filter-rank" data-testid="select-filter-rank">
                      <SelectValue placeholder="اختر الرتبة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {uniqueRanks.map((rank) => (
                        <SelectItem key={rank} value={rank}>
                          {rank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Office Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-office">المكتب</Label>
                  <Select value={filterOffice} onValueChange={setFilterOffice}>
                    <SelectTrigger id="filter-office" data-testid="select-filter-office">
                      <SelectValue placeholder="اختر المكتب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {uniqueOffices.map((office) => (
                        <SelectItem key={office} value={office}>
                          {office}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Police Station Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-policestation">المخفر</Label>
                  <Select value={filterPoliceStation} onValueChange={setFilterPoliceStation}>
                    <SelectTrigger id="filter-policestation" data-testid="select-filter-policestation">
                      <SelectValue placeholder="اختر المخفر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {uniquePoliceStations.map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-start-date">من تاريخ</Label>
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
                  <Label htmlFor="filter-end-date">إلى تاريخ</Label>
                  <Input
                    id="filter-end-date"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    data-testid="input-filter-end-date"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="gap-2"
                    data-testid="button-clear-filters"
                  >
                    <X className="h-4 w-4" />
                    مسح جميع الفلاتر
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Results */}
      <Card data-testid="card-search-results">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">نتائج البحث</CardTitle>
            <div className="text-sm text-muted-foreground" data-testid="text-results-count">
              عدد النتائج: {filteredRecords.length} من {records.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold">جاري التحميل...</div>
                <div className="text-sm text-muted-foreground">يرجى الانتظار</div>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex items-center justify-center py-12" data-testid="empty-state">
              <div className="text-center">
                <div className="mb-2 text-lg font-semibold">لا توجد نتائج</div>
                <div className="text-sm text-muted-foreground">
                  {hasActiveFilters 
                    ? "لم يتم العثور على نتائج مطابقة للبحث. جرب تعديل معايير البحث."
                    : "لا توجد سجلات في النظام حالياً."}
                </div>
              </div>
            </div>
          ) : (
            <DataTable
              records={filteredRecords}
              onEdit={handleEdit}
              onDelete={() => {
                toast({
                  title: "تنبيه",
                  description: "الحذف غير متاح في صفحة الاستعلام. يرجى استخدام صفحة إدخال البيانات.",
                  variant: "default",
                });
              }}
              viewOnly={true}
            />
          )}
        </CardContent>
      </Card>

      {/* View Record Dialog */}
      <Dialog open={!!viewingRecord} onOpenChange={(open) => !open && setViewingRecord(null)}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل السجل</DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رقم السجل</Label>
                  <div className="font-semibold">{viewingRecord.recordNumber}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">رقم الصادر</Label>
                  <div className="font-semibold">{viewingRecord.outgoingNumber}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">الرقم العسكري</Label>
                  <div className="font-semibold">{viewingRecord.militaryNumber}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ الجولة</Label>
                  <div className="font-semibold">
                    {viewingRecord.tourDate 
                      ? format(new Date(viewingRecord.tourDate), "dd/MM/yyyy", { locale: ar })
                      : "-"}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">الاسم الكامل</Label>
                <div className="font-semibold">
                  {`${viewingRecord.firstName} ${viewingRecord.secondName} ${viewingRecord.thirdName} ${viewingRecord.fourthName}`}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">الرتبة</Label>
                  <div className="font-semibold">{viewingRecord.rank}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">المحافظة</Label>
                  <div className="font-semibold">{viewingRecord.governorate}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">المكتب</Label>
                  <div className="font-semibold">{viewingRecord.office}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">المخفر</Label>
                  <div className="font-semibold">{viewingRecord.policeStation}</div>
                </div>
              </div>
              
              {viewingRecord.recordedNotes && (
                <div>
                  <Label className="text-muted-foreground">الملاحظات المدونة</Label>
                  <div className="font-semibold">{viewingRecord.recordedNotes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
