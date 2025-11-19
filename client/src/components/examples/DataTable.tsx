import DataTable from '../DataTable'
import type { Record } from '@shared/schema'

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
    notes: 'ملاحظات تجريبية',
    additionalNotes: null,
    createdAt: new Date(),
  },
  {
    id: '2',
    inventoryNumber: '2024-002',
    registrationNumber: 'REG-002',
    civilRegistrationNumber: 'CIV-002',
    name: 'فاطمة حسن',
    governorate: 'الجيزة',
    region: 'الدقي',
    reportType: 'بلاغ عاجل',
    date: new Date('2024-02-20'),
    notes: 'ملاحظات إضافية',
    additionalNotes: null,
    createdAt: new Date(),
  },
]

export default function DataTableExample() {
  return (
    <div className="p-6" dir="rtl">
      <DataTable 
        records={mockRecords}
        onEdit={(record) => console.log('Edit:', record)}
        onDelete={(id) => console.log('Delete:', id)}
      />
    </div>
  )
}
