'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  Upload,
  Grid3X3,
  List,
  Mail,
  Linkedin,
  Presentation,
  FileSpreadsheet,
  X,
} from 'lucide-react'
import { InlinePanel, InlinePanelHeader, InlinePanelContent, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface CampaignDocumentsSectionProps {
  campaignId: string
}

interface Document {
  id: string
  name: string
  description?: string
  documentType: string
  category?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  usageCount: number
  lastUsedAt?: string
  uploadedBy?: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

const documentTypeIcons: Record<string, React.ReactNode> = {
  template: <FileText className="w-5 h-5" />,
  collateral: <Presentation className="w-5 h-5" />,
  report: <FileSpreadsheet className="w-5 h-5" />,
  attachment: <File className="w-5 h-5" />,
}

const categoryIcons: Record<string, React.ReactNode> = {
  email_template: <Mail className="w-4 h-4" />,
  linkedin_template: <Linkedin className="w-4 h-4" />,
  presentation: <Presentation className="w-4 h-4" />,
  case_study: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
}

export function CampaignDocumentsSection({ campaignId }: CampaignDocumentsSectionProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Mock data - in production this would come from tRPC
  const documents: Document[] = [
    // This will be populated from database once table is created
  ]

  const filteredDocuments =
    categoryFilter === 'all'
      ? documents
      : documents.filter((doc) => doc.category === categoryFilter)

  const selectedDoc = selectedDocId
    ? documents.find((doc) => doc.id === selectedDocId)
    : null

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold text-charcoal-900">
            Campaign Documents
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Templates, collateral, and supporting materials for this campaign
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="email_template">Email Templates</SelectItem>
            <SelectItem value="linkedin_template">LinkedIn Templates</SelectItem>
            <SelectItem value="presentation">Presentations</SelectItem>
            <SelectItem value="case_study">Case Studies</SelectItem>
            <SelectItem value="image">Images</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Documents View */}
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            selectedDocId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
          )}
        >
          {documents.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                  No documents yet
                </h3>
                <p className="text-sm text-charcoal-500 mb-6 max-w-sm mx-auto">
                  Upload templates, presentations, case studies, and other materials to support your campaign
                </p>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload First Document
                </Button>
              </div>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    'p-4 cursor-pointer hover:shadow-md transition-all',
                    selectedDocId === doc.id && 'ring-2 ring-hublot-500'
                  )}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-charcoal-100 rounded-lg">
                      {documentTypeIcons[doc.documentType] || <File className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-charcoal-900 truncate">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-0.5">
                        {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {doc.category?.replace('_', ' ')}
                    </Badge>
                    {doc.usageCount > 0 && (
                      <span className="text-xs text-charcoal-500">
                        Used {doc.usageCount}x
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="divide-y divide-charcoal-100">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      'p-4 cursor-pointer hover:bg-charcoal-50 transition-colors',
                      selectedDocId === doc.id && 'bg-hublot-50'
                    )}
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-charcoal-100 rounded-lg">
                        {documentTypeIcons[doc.documentType] || <File className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-charcoal-900">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {doc.category?.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-charcoal-500">
                            {formatFileSize(doc.fileSize)}
                          </span>
                          {doc.usageCount > 0 && (
                            <span className="text-xs text-charcoal-500">
                              Used {doc.usageCount}x
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Inline Panel */}
        {selectedDoc && (
          <InlinePanel width="lg" onClose={() => setSelectedDocId(null)}>
            <InlinePanelHeader
              title={selectedDoc.name}
              description={selectedDoc.description || 'Document details'}
              onClose={() => setSelectedDocId(null)}
            />

            <InlinePanelContent>
              {/* Document Info */}
              <InlinePanelSection title="Document Information">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {selectedDoc.documentType}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Category:</span>
                    <span className="font-medium capitalize">
                      {selectedDoc.category?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">File Size:</span>
                    <span className="font-medium tabular-nums">
                      {formatFileSize(selectedDoc.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Format:</span>
                    <span className="font-medium uppercase">
                      {selectedDoc.mimeType?.split('/')[1] || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Uploaded:</span>
                    <span className="font-medium">
                      {format(new Date(selectedDoc.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </InlinePanelSection>

              {/* Usage Stats */}
              <InlinePanelSection title="Usage Statistics">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Times Used:</span>
                    <span className="font-semibold tabular-nums">
                      {selectedDoc.usageCount}
                    </span>
                  </div>
                  {selectedDoc.lastUsedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">Last Used:</span>
                      <span className="font-medium">
                        {format(new Date(selectedDoc.lastUsedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </InlinePanelSection>

              {/* Preview (if applicable) */}
              {selectedDoc.mimeType?.startsWith('image/') && selectedDoc.fileUrl && (
                <InlinePanelSection title="Preview">
                  <div className="rounded-lg overflow-hidden border border-charcoal-200">
                    <img
                      src={selectedDoc.fileUrl}
                      alt={selectedDoc.name}
                      className="w-full h-auto"
                    />
                  </div>
                </InlinePanelSection>
              )}
            </InlinePanelContent>

            {/* Footer Actions */}
            <div className="p-4 border-t border-charcoal-100 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </InlinePanel>
        )}
      </div>
    </div>
  )
}

