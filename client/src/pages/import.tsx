import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import * as XLSX from "xlsx";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertRecord } from "@shared/schema";

interface ExcelRow {
  "رقم الصادر"?: string | number;
  "الرقم العسكري"?: string | number;
  "نوع الاجراء"?: string;
  "المنافذ"?: string;
  "الملاحظات المدونة"?: string;
  "الاسم الاول"?: string;
  "الاسم الثاني"?: string;
  "الاسم الثالث"?: string;
  "الاسم الرابع"?: string;
  "تاريخ الجولة"?: string | number;
  "الرتبة"?: string;
  "المحافظة"?: string;
  "المخفر"?: string;
}

export default function ImportPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "supervisor") {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية للوصول إلى هذه الصفحة",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile);
        setResults(null);
      } else {
        toast({
          title: "خطأ",
          description: "يرجى اختيار ملف Excel فقط (.xlsx أو .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const parseExcelDate = (value: string | number): Date => {
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      return new Date(date.y, date.m - 1, date.d);
    }
    return new Date(value);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);
    setResults(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);

      if (rows.length === 0) {
        toast({
          title: "تحذير",
          description: "الملف فارغ أو لا يحتوي على بيانات",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      setProgress(30);

      const recordsToImport: Partial<InsertRecord>[] = rows.map((row) => ({
        outgoingNumber: row["رقم الصادر"]?.toString() || "",
        militaryNumber: row["الرقم العسكري"]?.toString(),
        actionType: row["نوع الاجراء"],
        ports: row["المنافذ"],
        recordedNotes: row["الملاحظات المدونة"],
        firstName: row["الاسم الاول"] || "",
        secondName: row["الاسم الثاني"] || "",
        thirdName: row["الاسم الثالث"] || "",
        fourthName: row["الاسم الرابع"] || "",
        tourDate: row["تاريخ الجولة"] ? parseExcelDate(row["تاريخ الجولة"]) : new Date(),
        rank: row["الرتبة"] || "",
        governorate: row["المحافظة"] || "",
        policeStation: row["المخفر"] || "",
      }));

      setProgress(50);

      const res = await apiRequest("POST", "/api/records/import", { records: recordsToImport });

      setProgress(90);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "خطأ في الاستيراد");
      }

      const result = await res.json();
      setResults({
        success: result.success || 0,
        failed: result.failed || 0,
        errors: result.errors || [],
      });

      setProgress(100);
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });

      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${result.success} سجل بنجاح${result.failed > 0 ? ` وفشل ${result.failed} سجل` : ""}`,
        variant: result.failed === 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء قراءة الملف",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">استيراد البيانات</h1>
        <p className="mt-2 text-gray-600">استيراد السجلات من ملفات Excel</p>
      </div>

      <div className="grid gap-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>تنسيق الملف المطلوب:</strong> ملف Excel (.xlsx أو .xls) يحتوي على الأعمدة التالية:
            <br />
            رقم الصادر، الرقم العسكري، نوع الاجراء، المنافذ، الملاحظات المدونة، الاسم الاول، الاسم الثاني، الاسم الثالث، الاسم الرابع، تاريخ الجولة، الرتبة، المحافظة، المخفر
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>رفع الملف</CardTitle>
            <CardDescription>اختر ملف Excel لاستيراد البيانات منه</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:border-blue-400 hover:bg-blue-50"
                data-testid="label-file-upload"
              >
                <Upload className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {file ? file.name : "اختر ملف Excel"}
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-file"
              />
              {file && (
                <FileSpreadsheet className="h-6 w-6 text-green-600" data-testid="icon-file-selected" />
              )}
            </div>

            {file && (
              <Button
                onClick={processFile}
                disabled={isProcessing}
                className="w-full"
                data-testid="button-process"
              >
                {isProcessing ? "جاري المعالجة..." : "بدء الاستيراد"}
              </Button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-gray-600">{progress}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>نتائج الاستيراد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">نجح</p>
                    <p className="text-2xl font-bold text-green-700">{results.success}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">فشل</p>
                    <p className="text-2xl font-bold text-red-700">{results.failed}</p>
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">الأخطاء:</h4>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-4">
                    {results.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
