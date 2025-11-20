import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, FileText, Printer, Calendar, Users, Building, Shield, MapPin, Filter, X } from "lucide-react";
import { Link } from "wouter";
import type { Record as RecordType } from "@shared/schema";
import { format, subDays, subMonths, subYears, isAfter, isSameDay, startOfDay, startOfYear } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type DateFilter = "all" | "today" | "week" | "month" | "year";

export default function ReportsPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [filterGovernorate, setFilterGovernorate] = useState("");
  const [filterPoliceStation, setFilterPoliceStation] = useState("");
  const [filterActionType, setFilterActionType] = useState("");
  const [filterRank, setFilterRank] = useState("");
  const [filterPersonName, setFilterPersonName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: records = [], isLoading, isError, error, refetch } = useQuery<RecordType[]>({
    queryKey: ["/api/records"],
  });

  // Extract unique values for filter dropdowns
  const uniqueGovernorates = useMemo(() => {
    const values = Array.from(new Set(records.map(r => r.governorate))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  const uniquePoliceStations = useMemo(() => {
    const values = Array.from(new Set(records.map(r => r.policeStation))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  const uniqueActionTypes = useMemo(() => {
    const values = Array.from(new Set(records.map(r => (r as any).actionType))).filter(Boolean);
    return values.sort((a, b) => String(a).localeCompare(String(b), "ar"));
  }, [records]);

  const uniqueRanks = useMemo(() => {
    const values = Array.from(new Set(records.map(r => r.rank))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  // Filter records by all criteria
  const filteredRecords = useMemo(() => {
    let result = records;

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = startOfDay(now);

      result = result.filter((record) => {
        const dateToCheck = record.tourDate || record.createdAt;
        if (!dateToCheck) return false;
        
        const recordDate = new Date(dateToCheck);
        
        switch (dateFilter) {
          case "today":
            return isSameDay(recordDate, today);
          case "week":
            return isAfter(recordDate, subDays(now, 7));
          case "month":
            return isAfter(recordDate, subMonths(now, 1));
          case "year":
            return isAfter(recordDate, subYears(now, 1));
          default:
            return true;
        }
      });
    }

    // Governorate filter
    if (filterGovernorate) {
      result = result.filter(r => r.governorate === filterGovernorate);
    }

    // Police station filter
    if (filterPoliceStation) {
      result = result.filter(r => r.policeStation === filterPoliceStation);
    }

    // Action type filter
    if (filterActionType) {
      result = result.filter(r => (r as any).actionType === filterActionType);
    }

    // Rank filter
    if (filterRank) {
      result = result.filter(r => r.rank === filterRank);
    }

    // Person name filter (search in full name)
    if (filterPersonName.trim()) {
      const searchQuery = filterPersonName.toLowerCase().trim();
      result = result.filter((record) => {
        const fullName = `${record.firstName} ${record.secondName} ${record.thirdName} ${record.fourthName}`.toLowerCase();
        return fullName.includes(searchQuery);
      });
    }

    return result;
  }, [records, dateFilter, filterGovernorate, filterPoliceStation, filterActionType, filterRank, filterPersonName]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    return {
      total: records.length,
      filtered: filteredRecords.length,
      today: records.filter((r) => {
        const date = r.tourDate || r.createdAt;
        return date && isSameDay(new Date(date), today);
      }).length,
      week: records.filter((r) => {
        const date = r.tourDate || r.createdAt;
        return date && isAfter(new Date(date), subDays(now, 7));
      }).length,
      month: records.filter((r) => {
        const date = r.tourDate || r.createdAt;
        return date && isAfter(new Date(date), subMonths(now, 1));
      }).length,
      year: records.filter((r) => {
        const date = r.tourDate || r.createdAt;
        return date && isAfter(new Date(date), subYears(now, 1));
      }).length,
    };
  }, [records, filteredRecords]);

  // Group records by governorate
  const byGovernorate = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    filteredRecords.forEach((record) => {
      const gov = record.governorate || "غير محدد";
      grouped[gov] = (grouped[gov] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [filteredRecords]);

  // Group records by rank
  const byRank = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    filteredRecords.forEach((record) => {
      const rank = record.rank || "غير محدد";
      grouped[rank] = (grouped[rank] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [filteredRecords]);

  // Group records by action type
  const byActionType = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    filteredRecords.forEach((record) => {
      const actionType = (record as any).actionType || "غير محدد";
      grouped[actionType] = (grouped[actionType] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [filteredRecords]);

  // Group records by police station
  const byPoliceStation = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    filteredRecords.forEach((record) => {
      const station = record.policeStation || "غير محدد";
      grouped[station] = (grouped[station] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [filteredRecords]);

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setDateFilter("all");
    setFilterGovernorate("");
    setFilterPoliceStation("");
    setFilterActionType("");
    setFilterRank("");
    setFilterPersonName("");
  };

  const hasActiveFilters = dateFilter !== "all" || filterGovernorate || filterPoliceStation || filterActionType || filterRank || filterPersonName;

  // Generate filter description for report summary
  const getFilterDescription = () => {
    const filters: string[] = [];
    
    if (dateFilter !== "all") {
      const dateLabels = {
        today: "اليوم",
        week: "آخر أسبوع",
        month: "آخر شهر",
        year: "آخر سنة"
      };
      filters.push(`الفترة: ${dateLabels[dateFilter]}`);
    }
    
    if (filterGovernorate) filters.push(`المحافظة: ${filterGovernorate}`);
    if (filterPoliceStation) filters.push(`المخفر: ${filterPoliceStation}`);
    if (filterActionType) filters.push(`نوع الإجراء: ${filterActionType}`);
    if (filterRank) filters.push(`الرتبة: ${filterRank}`);
    if (filterPersonName) filters.push(`الاسم: ${filterPersonName}`);
    
    return filters.length > 0 ? filters.join(" | ") : "جميع السجلات";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted"></div>
            ))}
          </div>
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
              {error instanceof Error ? error.message : "تعذر تحميل بيانات التقارير. يرجى المحاولة مرة أخرى."}
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
      <div className="mb-6 print:hidden">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للصفحة الرئيسية
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              التقارير والإحصائيات
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline"
              data-testid="button-toggle-filters"
            >
              <Filter className="ml-2 h-4 w-4" />
              {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
            </Button>
            
            <Button onClick={handlePrint} variant="default" data-testid="button-print">
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  فلاتر التقرير
                </CardTitle>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    data-testid="button-clear-filters"
                  >
                    <X className="ml-2 h-4 w-4" />
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Date Filter */}
                <div className="space-y-2">
                  <Label>الفترة الزمنية</Label>
                  <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                    <SelectTrigger data-testid="select-date-filter">
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" data-testid="filter-all">جميع السجلات</SelectItem>
                      <SelectItem value="today" data-testid="filter-today">اليوم</SelectItem>
                      <SelectItem value="week" data-testid="filter-week">آخر أسبوع</SelectItem>
                      <SelectItem value="month" data-testid="filter-month">آخر شهر</SelectItem>
                      <SelectItem value="year" data-testid="filter-year">آخر سنة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Governorate Filter */}
                <div className="space-y-2">
                  <Label>المحافظة</Label>
                  <Select value={filterGovernorate} onValueChange={setFilterGovernorate}>
                    <SelectTrigger data-testid="select-governorate-filter">
                      <SelectValue placeholder="جميع المحافظات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="filter-all-governorates">جميع المحافظات</SelectItem>
                      {uniqueGovernorates.map((gov) => (
                        <SelectItem key={gov} value={gov} data-testid={`filter-governorate-${gov}`}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Police Station Filter */}
                <div className="space-y-2">
                  <Label>المخفر</Label>
                  <Select value={filterPoliceStation} onValueChange={setFilterPoliceStation}>
                    <SelectTrigger data-testid="select-police-station-filter">
                      <SelectValue placeholder="جميع المخافر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="filter-all-stations">جميع المخافر</SelectItem>
                      {uniquePoliceStations.map((station) => (
                        <SelectItem key={station} value={station} data-testid={`filter-station-${station}`}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Type Filter */}
                <div className="space-y-2">
                  <Label>نوع الإجراء</Label>
                  <Select value={filterActionType} onValueChange={setFilterActionType}>
                    <SelectTrigger data-testid="select-action-type-filter">
                      <SelectValue placeholder="جميع الإجراءات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="filter-all-action-types">جميع الإجراءات</SelectItem>
                      {uniqueActionTypes.map((type) => (
                        <SelectItem key={String(type)} value={String(type)} data-testid={`filter-action-type-${type}`}>
                          {String(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rank Filter */}
                <div className="space-y-2">
                  <Label>الرتبة</Label>
                  <Select value={filterRank} onValueChange={setFilterRank}>
                    <SelectTrigger data-testid="select-rank-filter">
                      <SelectValue placeholder="جميع الرتب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" data-testid="filter-all-ranks">جميع الرتب</SelectItem>
                      {uniqueRanks.map((rank) => (
                        <SelectItem key={rank} value={rank} data-testid={`filter-rank-${rank}`}>
                          {rank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Person Name Filter */}
                <div className="space-y-2">
                  <Label>البحث عن شخص</Label>
                  <Input
                    placeholder="ابحث بالاسم..."
                    value={filterPersonName}
                    onChange={(e) => setFilterPersonName(e.target.value)}
                    data-testid="input-person-name-filter"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="mb-8 hidden text-center print:block" data-testid="section-print-header">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="h-16 w-16 rounded-full border-2 border-white bg-white flex items-center justify-center">
              <div className="text-xs font-bold text-blue-800" data-testid="text-print-ministry">وزارة</div>
            </div>
          </div>
        </div>
        <h2 className="text-xl font-bold" data-testid="text-print-title">دولة الكويت - وزارة الداخلية</h2>
        <h3 className="text-lg font-semibold" data-testid="text-print-subtitle">التقارير والإحصائيات</h3>
        <p className="text-sm text-muted-foreground" data-testid="text-print-date">
          تاريخ الطباعة: {format(new Date(), "PPP", { locale: ar })}
        </p>
        <div className="mt-2 text-sm font-semibold border-t border-b py-2" data-testid="text-print-filter">
          {getFilterDescription()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">{stats.total}</div>
            <p className="text-xs text-muted-foreground">جميع السجلات</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-filtered" className={hasActiveFilters ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">السجلات المفلترة</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-filtered-count">{stats.filtered}</div>
            <p className="text-xs text-muted-foreground">حسب الفلاتر</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-today">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سجلات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-count">{stats.today}</div>
            <p className="text-xs text-muted-foreground">مسجلة اليوم</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-month">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر شهر</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-month-count">{stats.month}</div>
            <p className="text-xs text-muted-foreground">آخر 30 يوم</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-year">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر سنة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-year-count">{stats.year}</div>
            <p className="text-xs text-muted-foreground">آخر 365 يوم</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Summary Card */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background" data-testid="card-report-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="title-report-summary">
            <FileText className="h-5 w-5" />
            ملخص التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-background p-3 border">
              <p className="font-semibold mb-2">الفلاتر المطبقة:</p>
              <p className="text-muted-foreground" data-testid="text-active-filters">
                {getFilterDescription()}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg bg-background p-3 border">
                <p className="text-xs text-muted-foreground">عدد السجلات</p>
                <p className="text-lg font-bold" data-testid="value-summary-count">{filteredRecords.length}</p>
              </div>
              
              <div className="rounded-lg bg-background p-3 border">
                <p className="text-xs text-muted-foreground">عدد المحافظات</p>
                <p className="text-lg font-bold" data-testid="value-summary-governorates">{byGovernorate.length}</p>
              </div>
              
              <div className="rounded-lg bg-background p-3 border">
                <p className="text-xs text-muted-foreground">عدد المخافر</p>
                <p className="text-lg font-bold" data-testid="value-summary-stations">{byPoliceStation.length}</p>
              </div>
              
              <div className="rounded-lg bg-background p-3 border">
                <p className="text-xs text-muted-foreground">عدد الرتب</p>
                <p className="text-lg font-bold" data-testid="value-summary-ranks">{byRank.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* By Governorate */}
        <Card data-testid="card-report-governorate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="title-governorate-report">
              <MapPin className="h-5 w-5" />
              التوزيع حسب المحافظة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byGovernorate.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right" data-testid="header-governorate-name">المحافظة</TableHead>
                    <TableHead className="text-right" data-testid="header-governorate-count">العدد</TableHead>
                    <TableHead className="text-right" data-testid="header-governorate-percentage">النسبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byGovernorate.map((item, index) => (
                    <TableRow key={index} data-testid={`row-governorate-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-governorate-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-governorate-count-${index}`}>{item.count}</TableCell>
                      <TableCell data-testid={`cell-governorate-percentage-${index}`}>
                        {((item.count / filteredRecords.length) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-governorate-data">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>

        {/* By Police Station */}
        <Card data-testid="card-report-station">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="title-station-report">
              <Users className="h-5 w-5" />
              التوزيع حسب المخفر
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byPoliceStation.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right" data-testid="header-station-name">المخفر</TableHead>
                    <TableHead className="text-right" data-testid="header-station-count">العدد</TableHead>
                    <TableHead className="text-right" data-testid="header-station-percentage">النسبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byPoliceStation.map((item, index) => (
                    <TableRow key={index} data-testid={`row-station-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-station-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-station-count-${index}`}>{item.count}</TableCell>
                      <TableCell data-testid={`cell-station-percentage-${index}`}>
                        {((item.count / filteredRecords.length) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-station-data">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>

        {/* By Rank */}
        <Card data-testid="card-report-rank">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="title-rank-report">
              <Shield className="h-5 w-5" />
              التوزيع حسب الرتبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byRank.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right" data-testid="header-rank-name">الرتبة</TableHead>
                    <TableHead className="text-right" data-testid="header-rank-count">العدد</TableHead>
                    <TableHead className="text-right" data-testid="header-rank-percentage">النسبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byRank.map((item, index) => (
                    <TableRow key={index} data-testid={`row-rank-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-rank-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-rank-count-${index}`}>{item.count}</TableCell>
                      <TableCell data-testid={`cell-rank-percentage-${index}`}>
                        {((item.count / filteredRecords.length) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-rank-data">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>

        {/* By Action Type */}
        <Card data-testid="card-report-action-type">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="title-action-type-report">
              <Building className="h-5 w-5" />
              التوزيع حسب نوع الإجراء
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byActionType.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right" data-testid="header-action-type-name">نوع الإجراء</TableHead>
                    <TableHead className="text-right" data-testid="header-action-type-count">العدد</TableHead>
                    <TableHead className="text-right" data-testid="header-action-type-percentage">النسبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byActionType.map((item, index) => (
                    <TableRow key={index} data-testid={`row-action-type-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-action-type-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-action-type-count-${index}`}>{item.count}</TableCell>
                      <TableCell data-testid={`cell-action-type-percentage-${index}`}>
                        {((item.count / filteredRecords.length) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-action-type-data">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          @page {
            margin: 2cm;
            size: A4;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }
          
          .grid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
