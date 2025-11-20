import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertRecordSchema } from "@shared/schema";
import type { Record } from "@shared/schema";

// Use shared insertRecordSchema and extend for UI-specific validation
const formSchema = insertRecordSchema.omit({ office: true });

type FormValues = z.infer<typeof formSchema>;

interface RecordFormProps {
  record?: Record;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const governorates = ["الجهراء", "الأحمدي", "الفروانية", "حولي", "مبارك الكبير", "الكويت"];
const ranks = [
  "جندي",
  "جندي أول",
  "عريف",
  "رقيب",
  "رقيب أول",
  "وكيل ضابط",
  "ملازم",
  "ملازم أول",
  "نقيب",
  "رائد",
  "مقدم",
  "عقيد",
  "عميد",
  "لواء",
  "فريق",
  "فريق أول"
];

export default function RecordForm({ record, onSubmit, onCancel }: RecordFormProps) {
  const getTourDateDefault = (tourDate: any): Date | undefined => {
    if (!tourDate) return undefined;
    const date = new Date(tourDate);
    return !isNaN(date.getTime()) ? date : undefined;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: record
      ? {
          outgoingNumber: record.outgoingNumber || "",
          militaryNumber: record.militaryNumber || "",
          actionType: (record as any).actionType || "",
          ports: (record as any).ports || "",
          recordedNotes: record.recordedNotes || "",
          firstName: record.firstName || "",
          secondName: record.secondName || "",
          thirdName: record.thirdName || "",
          fourthName: record.fourthName || "",
          tourDate: getTourDateDefault(record.tourDate),
          rank: record.rank || "",
          governorate: record.governorate || "",
          policeStation: record.policeStation || "",
        }
      : {
          outgoingNumber: "",
          militaryNumber: "",
          actionType: "",
          ports: "",
          recordedNotes: "",
          firstName: "",
          secondName: "",
          thirdName: "",
          fourthName: "",
          tourDate: undefined,
          rank: "",
          governorate: "",
          policeStation: "",
        },
  });

  const handleSubmit = async (data: FormValues) => {
    // Ensure tourDate is a valid Date before converting to ISO string
    const tourDateISO = data.tourDate instanceof Date && !isNaN(data.tourDate.getTime())
      ? data.tourDate.toISOString()
      : new Date(data.tourDate).toISOString();
    
    await onSubmit({
      ...data,
      tourDate: tourDateISO,
      office: null, // office field is now nullable and not in the form
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" dir="rtl">
        {/* Row 1: رقم الصادر، الرقم العسكري */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="outgoingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">رقم الصادر *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-outgoing-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="militaryNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">الرقم العسكري</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} data-testid="input-military-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 1.5: نوع الاجراء في حقه، الرتبة */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="actionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">نوع الاجراء في حقه</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} data-testid="input-action-type" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">الرتبة *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-rank">
                      <SelectValue placeholder="اختر الرتبة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank} value={rank} data-testid={`select-item-rank-${rank}`}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: الاسم - 4 Parts */}
        <div>
          <FormLabel className="mb-2 block font-semibold">الاسم *</FormLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="الاسم الأول" data-testid="input-first-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="الاسم الثاني" data-testid="input-second-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thirdName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="الاسم الثالث" data-testid="input-third-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fourthName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="الاسم الرابع" data-testid="input-fourth-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Row 3: المحافظة، المخفر، المنافذ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="governorate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">المحافظة *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-governorate">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov} value={gov} data-testid={`select-item-governorate-${gov}`}>
                        {gov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="policeStation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">المخفر *</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-police-station" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ports"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">المنافذ</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} data-testid="input-ports" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: تاريخ الجولة */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="tourDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">تاريخ الجولة *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        const newDate = new Date(dateValue);
                        if (!isNaN(newDate.getTime())) {
                          field.onChange(newDate);
                        }
                      } else {
                        field.onChange(undefined as any);
                      }
                    }}
                    data-testid="input-tour-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: الملاحظات المدونة */}
        <FormField
          control={form.control}
          name="recordedNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">الملاحظات المدونة</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  className="resize-none"
                  rows={3}
                  data-testid="input-recorded-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {record && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              إلغاء
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              form.reset();
              form.clearErrors();
            }}
            data-testid="button-reset"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
          >
            مسح
          </Button>
          <Button type="submit" data-testid="button-submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
            حفظ
          </Button>
        </div>
      </form>
    </Form>
  );
}
