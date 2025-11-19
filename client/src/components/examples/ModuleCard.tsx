import ModuleCard from '../ModuleCard'
import { FileText } from 'lucide-react'

export default function ModuleCardExample() {
  return (
    <div className="p-4">
      <ModuleCard 
        title="التقارير" 
        icon={FileText} 
        onClick={() => console.log('Module clicked')} 
      />
    </div>
  )
}
