import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { Record } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DataTableProps {
  records: Record[];
  onEdit: (record: Record) => void;
  onDelete: (id: string) => void;
  viewOnly?: boolean;
}

type SortField = keyof Record | null;
type SortDirection = "asc" | "desc";

export default function DataTable({ records, onEdit, onDelete, viewOnly = false }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const getFullName = (record: Record) => {
    return `${record.firstName} ${record.secondName} ${record.thirdName} ${record.fourthName}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const dateFields: SortField[] = ["tourDate", "createdAt"];
  const numericFields: SortField[] = ["recordNumber", "outgoingNumber", "militaryNumber"];

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // Handle date fields ONLY if the field is actually a date field
    if (dateFields.includes(sortField)) {
      const aTime = new Date(aValue as any).getTime();
      const bTime = new Date(bValue as any).getTime();
      if (isNaN(aTime)) return 1;
      if (isNaN(bTime)) return -1;
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    }
    
    // Handle numeric fields ONLY if the field is actually a numeric field
    if (numericFields.includes(sortField)) {
      const aNum = parseFloat(String(aValue).replace(/[^\d.-]/g, ""));
      const bNum = parseFloat(String(bValue).replace(/[^\d.-]/g, ""));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
    }
    
    // Default string comparison with Arabic locale for all other fields
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    const comparison = aStr.localeCompare(bStr, "ar");
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="mr-1 inline h-4 w-4" />
    ) : (
      <ChevronDown className="mr-1 inline h-4 w-4" />
    );
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "-";
    try {
      const date = new Date(dateValue);
      return !isNaN(date.getTime()) ? format(date, "dd/MM/yyyy", { locale: ar }) : "-";
    } catch {
      return "-";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("recordNumber")}
              data-testid="header-record-number"
            >
              رقم السجل <SortIcon field="recordNumber" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("outgoingNumber")}
              data-testid="header-outgoing-number"
            >
              رقم الصادر <SortIcon field="outgoingNumber" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("firstName")}
              data-testid="header-name"
            >
              الاسم <SortIcon field="firstName" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("militaryNumber")}
              data-testid="header-military-number"
            >
              الرقم العسكري <SortIcon field="militaryNumber" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("governorate")}
              data-testid="header-governorate"
            >
              المحافظة <SortIcon field="governorate" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("office")}
              data-testid="header-office"
            >
              المكتب <SortIcon field="office" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("policeStation")}
              data-testid="header-police-station"
            >
              المخفر <SortIcon field="policeStation" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("rank")}
              data-testid="header-rank"
            >
              الرتبة <SortIcon field="rank" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer" 
              onClick={() => handleSort("tourDate")}
              data-testid="header-tour-date"
            >
              تاريخ الجولة <SortIcon field="tourDate" />
            </TableHead>
            <TableHead className="text-right" data-testid="header-notes">
              الملاحظات المدونة
            </TableHead>
            {!viewOnly && (
              <TableHead className="text-center" data-testid="header-actions">
                الإجراءات
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={viewOnly ? 10 : 11} className="h-24 text-center" data-testid="text-no-records">
                لا توجد سجلات
              </TableCell>
            </TableRow>
          ) : (
            sortedRecords.map((record, index) => (
              <TableRow key={record.id} data-testid={`row-record-${index}`}>
                <TableCell className="font-bold text-primary" data-testid={`cell-record-number-${index}`}>
                  {record.recordNumber}
                </TableCell>
                <TableCell className="font-medium" data-testid={`cell-outgoing-${index}`}>
                  {record.outgoingNumber}
                </TableCell>
                <TableCell data-testid={`cell-name-${index}`}>
                  {getFullName(record)}
                </TableCell>
                <TableCell data-testid={`cell-military-${index}`}>
                  {record.militaryNumber}
                </TableCell>
                <TableCell data-testid={`cell-governorate-${index}`}>
                  {record.governorate}
                </TableCell>
                <TableCell data-testid={`cell-office-${index}`}>
                  {record.office}
                </TableCell>
                <TableCell data-testid={`cell-police-station-${index}`}>
                  {record.policeStation}
                </TableCell>
                <TableCell data-testid={`cell-rank-${index}`}>
                  {record.rank}
                </TableCell>
                <TableCell data-testid={`cell-tour-date-${index}`}>
                  {formatDate(record.tourDate)}
                </TableCell>
                <TableCell className="max-w-xs truncate" data-testid={`cell-notes-${index}`}>
                  {record.recordedNotes || "-"}
                </TableCell>
                {!viewOnly && (
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(record)}
                        data-testid={`button-edit-${index}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(record.id)}
                        data-testid={`button-delete-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
