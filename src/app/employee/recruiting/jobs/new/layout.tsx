import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create New Job | InTime',
  description: 'Create a new job requisition',
}

export default function CreateJobLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Simple header for wizard flow */}
      <div className="border-b border-charcoal-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-heading font-semibold text-charcoal-900">
            Create New Job
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Fill out the details to create a new job requisition
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
