import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Printer, Calendar, Users, Building, Shield, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { Record as RecordType } from "@shared/schema";
import { format, subDays, subMonths, isAfter, isSameDay, startOfDay } from "date-fns";
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

type DateFilter = "all" | "today" | "week" | "month";

export default function ReportsPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const { data: records = [], isLoading, isError, error, refetch } = useQuery<RecordType[]>({
    queryKey: ["/api/records"],
  });

  // Filter records by date (using tourDate or createdAt as fallback)
  const filteredRecords = useMemo(() => {
    if (dateFilter === "all") return records;

    const now = new Date();
    const today = startOfDay(now);

    return records.filter((record) => {
      // Use tourDate if available, fallback to createdAt
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
        default:
          return true;
      }
    });
  }, [records, dateFilter]);

  // Calculate statistics (using tourDate or createdAt as fallback)
  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    
    return {
      total: records.length,
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
    };
  }, [records]);

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

  // Group records by office
  const byOffice = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    filteredRecords.forEach((record) => {
      const office = record.office || "غير محدد";
      grouped[office] = (grouped[office] || 0) + 1;
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
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
          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
            <SelectTrigger className="w-40" data-testid="select-date-filter">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-all">جميع السجلات</SelectItem>
              <SelectItem value="today" data-testid="filter-today">اليوم</SelectItem>
              <SelectItem value="week" data-testid="filter-week">آخر أسبوع</SelectItem>
              <SelectItem value="month" data-testid="filter-month">آخر شهر</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handlePrint} variant="default" data-testid="button-print">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
        </div>
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
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">{stats.total}</div>
            <p className="text-xs text-muted-foreground">جميع السجلات المسجلة</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سجلات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-count">{stats.today}</div>
            <p className="text-xs text-muted-foreground">مسجلة اليوم</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-week">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر أسبوع</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-week-count">{stats.week}</div>
            <p className="text-xs text-muted-foreground">آخر 7 أيام</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-month">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر شهر</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-month-count">{stats.month}</div>
            <p className="text-xs text-muted-foreground">آخر 30 يوم</p>
          </CardContent>
        </Card>
      </div>

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byGovernorate.map((item, index) => (
                    <TableRow key={index} data-testid={`row-governorate-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-governorate-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-governorate-count-${index}`}>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-governorate-data">لا توجد بيانات</p>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byRank.map((item, index) => (
                    <TableRow key={index} data-testid={`row-rank-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-rank-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-rank-count-${index}`}>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-rank-data">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>

        {/* By Office */}
        <Card data-testid="card-report-office">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="title-office-report">
              <Building className="h-5 w-5" />
              التوزيع حسب المكتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byOffice.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right" data-testid="header-office-name">المكتب</TableHead>
                    <TableHead className="text-right" data-testid="header-office-count">العدد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byOffice.map((item, index) => (
                    <TableRow key={index} data-testid={`row-office-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-office-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-office-count-${index}`}>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-office-data">لا توجد بيانات</p>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byPoliceStation.map((item, index) => (
                    <TableRow key={index} data-testid={`row-station-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-station-name-${index}`}>{item.name}</TableCell>
                      <TableCell data-testid={`cell-station-count-${index}`}>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-station-data">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="mt-6" data-testid="card-summary">
        <CardHeader>
          <CardTitle data-testid="title-summary">ملخص التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p data-testid="text-summary-filter">
              <span className="font-semibold" data-testid="label-summary-filter">الفترة المختارة:</span>{" "}
              <span data-testid="value-summary-filter">
                {dateFilter === "all" && "جميع السجلات"}
                {dateFilter === "today" && "اليوم"}
                {dateFilter === "week" && "آخر أسبوع"}
                {dateFilter === "month" && "آخر شهر"}
              </span>
            </p>
            <p data-testid="text-summary-count">
              <span className="font-semibold" data-testid="label-summary-count">عدد السجلات:</span>{" "}
              <span data-testid="value-summary-count">{filteredRecords.length}</span>
            </p>
            <p data-testid="text-summary-governorates">
              <span className="font-semibold" data-testid="label-summary-governorates">عدد المحافظات:</span>{" "}
              <span data-testid="value-summary-governorates">{byGovernorate.length}</span>
            </p>
            <p data-testid="text-summary-ranks">
              <span className="font-semibold" data-testid="label-summary-ranks">عدد الرتب:</span>{" "}
              <span data-testid="value-summary-ranks">{byRank.length}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
