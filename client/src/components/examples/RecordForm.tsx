import RecordForm from '../RecordForm'

export default function RecordFormExample() {
  return (
    <div className="p-6" dir="rtl">
      <RecordForm 
        onSubmit={(data) => console.log('Form submitted:', data)}
        onCancel={() => console.log('Form cancelled')}
      />
    </div>
  )
}
