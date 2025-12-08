'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, Plus, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

interface JobDocumentsSectionProps {
  jobId: string
}

const documentTypeLabels: Record<string, string> = {
  job_description: 'Job Description',
  interview_guide: 'Interview Guide',
  requirements: 'Requirements',
  contract: 'Contract Template',
  other: 'Other',
}

export function JobDocumentsSection({ jobId: _jobId }: JobDocumentsSectionProps) {
  const { toast } = useToast()

  // For now, this is a placeholder - job documents would come from a job_documents table
  // or be stored as part of the job record
  const [documents] = useState<Array<{
    id: string
    name: string
    type: string
    url: string
    size: number
    uploadedAt: string
  }>>([])

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  const handleAddDocument = () => {
    toast({ title: 'Coming soon', description: 'Document upload will be available soon' })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? 's' : ''} attached
          </CardDescription>
        </div>
        <Button onClick={handleAddDocument}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No documents attached</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Add job descriptions, interview guides, or other relevant documents
            </p>
            <Button className="mt-4" variant="outline" onClick={handleAddDocument}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:border-hublot-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-charcoal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-900 truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {documentTypeLabels[doc.type] || doc.type}
                    </Badge>
                    <span className="text-xs text-charcoal-500">
                      {formatFileSize(doc.size)}
                    </span>
                    <span className="text-xs text-charcoal-500">
                      {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc.url)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
