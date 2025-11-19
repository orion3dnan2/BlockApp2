import Header from '../Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

export default function HeaderExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </QueryClientProvider>
  )
}
