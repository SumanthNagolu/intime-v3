import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function ExpenseReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
