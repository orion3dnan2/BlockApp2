import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Record } from "@shared/schema";

interface DataTableProps {
  records: Record[];
  onEdit?: (record: Record) => void;
  onDelete?: (id: string) => void;
}

type SortField = keyof Record | null;
type SortDirection = "asc" | "desc";

export default function DataTable({ records, onEdit, onDelete }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="mr-1 inline h-4 w-4" />
    ) : (
      <ChevronDown className="mr-1 inline h-4 w-4" />
    );
  };

  return (
    <div className="rounded-md border" dir="rtl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("inventoryNumber")}>
                رقم الحصر <SortIcon field="inventoryNumber" />
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("name")}>
                الاسم <SortIcon field="name" />
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("region")}>
                المنطقة <SortIcon field="region" />
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("governorate")}>
                المحافظة <SortIcon field="governorate" />
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("date")}>
                التاريخ <SortIcon field="date" />
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("registrationNumber")}>
                رقم السجل <SortIcon field="registrationNumber" />
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("reportType")}>
                نوع البلاغ <SortIcon field="reportType" />
              </TableHead>
              <TableHead className="text-right">ملاحظات</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            ) : (
              sortedRecords.map((record) => (
                <TableRow key={record.id} data-testid={`row-record-${record.id}`}>
                  <TableCell className="text-right">{record.inventoryNumber}</TableCell>
                  <TableCell className="text-right">{record.name}</TableCell>
                  <TableCell className="text-right">{record.region}</TableCell>
                  <TableCell className="text-right">{record.governorate}</TableCell>
                  <TableCell className="text-right">
                    {format(new Date(record.date), "dd/MM/yyyy", { locale: ar })}
                  </TableCell>
                  <TableCell className="text-right">{record.registrationNumber}</TableCell>
                  <TableCell className="text-right">{record.reportType}</TableCell>
                  <TableCell className="text-right">
                    <span className="line-clamp-1" title={record.notes || ""}>
                      {record.notes}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(record)}
                        data-testid={`button-edit-${record.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(record.id)}
                        data-testid={`button-delete-${record.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
