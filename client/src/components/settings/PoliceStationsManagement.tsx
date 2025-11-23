import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Pencil, Trash2, Search } from "lucide-react";
import type { PoliceStation } from "@shared/schema";

const policeStationSchema = z.object({
  name: z.string().min(2, "اسم المخفر يجب أن يكون حرفين على الأقل"),
  governorate: z.string().min(2, "المحافظة يجب أن تكون حرفين على الأقل"),
});

type PoliceStationFormData = z.infer<typeof policeStationSchema>;

export default function PoliceStationsManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<PoliceStation | null>(null);
  const [deleteStationId, setDeleteStationId] = useState<number | null>(null);

  const { data: stations = [], isLoading } = useQuery<PoliceStation[]>({
    queryKey: ["/api/police-stations"],
  });

  const form = useForm<PoliceStationFormData>({
    resolver: zodResolver(policeStationSchema),
    defaultValues: {
      name: "",
      governorate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PoliceStationFormData) => {
      const res = await apiRequest("POST", "/api/police-stations", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة المخفر بنجاح",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحفظ",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PoliceStationFormData }) => {
      const res = await apiRequest("PUT", `/api/police-stations/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث المخفر بنجاح",
      });
      setIsDialogOpen(false);
      setEditingStation(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/police-stations/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المخفر بنجاح",
      });
      setDeleteStationId(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء الحذف",
        variant: "destructive",
      });
    },
  });

  const filteredStations = stations.filter((station) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      station.name.toLowerCase().includes(query) ||
      station.governorate.toLowerCase().includes(query)
    );
  });

  const handleAdd = () => {
    setEditingStation(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEdit = (station: PoliceStation) => {
    setEditingStation(station);
    form.reset({
      name: station.name,
      governorate: station.governorate,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: PoliceStationFormData) => {
    if (editingStation) {
      updateMutation.mutate({ id: editingStation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              إدارة المخافر
            </CardTitle>
            <CardDescription>إضافة وتعديل المخافر في النظام</CardDescription>
          </div>
          <Button onClick={handleAdd} data-testid="button-add-station">
            <Plus className="ml-2 h-4 w-4" />
            إضافة مخفر
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث عن مخفر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              data-testid="input-search-station"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المخفر</TableHead>
                  <TableHead className="text-right">المحافظة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      لا توجد مخافر
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStations.map((station) => (
                    <TableRow key={station.id} data-testid={`row-station-${station.id}`}>
                      <TableCell className="font-medium">{station.name}</TableCell>
                      <TableCell>{station.governorate}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(station)}
                            data-testid={`button-edit-station-${station.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteStationId(station.id)}
                            data-testid={`button-delete-station-${station.id}`}
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
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingStation ? "تعديل مخفر" : "إضافة مخفر جديد"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المخفر</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-station-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="governorate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المحافظة</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-station-governorate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" data-testid="button-submit-station">
                    {editingStation ? "تحديث" : "حفظ"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteStationId !== null} onOpenChange={() => setDeleteStationId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا المخفر؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteStationId && deleteMutation.mutate(deleteStationId)}
                data-testid="button-confirm-delete"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
