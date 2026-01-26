'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import {
  FileText,
  Download,
  Loader2,
  Eye,
  CheckCircle,
  Copy,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { InTimeResumeTemplate, type InTimeResumeData } from './InTimeResumeTemplate'

// Dynamically import PDF components (client-side only)
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
)

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  { ssr: false }
)

interface GenerateResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateData: InTimeResumeData
  candidateName?: string
}

export function GenerateResumeDialog({
  open,
  onOpenChange,
  candidateData,
  candidateName,
}: GenerateResumeDialogProps) {
  const [activeTab, setActiveTab] = React.useState<'preview' | 'json'>('preview')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isPdfReady, setIsPdfReady] = React.useState(false)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setIsPdfReady(false)
      // Small delay to let PDF render
      const timer = setTimeout(() => setIsPdfReady(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Add metadata to the data
  const enrichedData: InTimeResumeData = {
    ...candidateData,
    generatedAt: new Date().toISOString(),
    version: 'v1',
  }

  // Generate JSON export data
  const jsonExportData = {
    _format: 'intime_resume_v1',
    _exported_at: new Date().toISOString(),
    candidate: {
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      email: candidateData.email,
      phone: candidateData.phone,
      mobile: candidateData.mobile,
      linkedinUrl: candidateData.linkedinUrl,
      city: candidateData.city,
      state: candidateData.state,
      country: candidateData.country,
      headline: candidateData.headline,
      summary: candidateData.summary,
      yearsExperience: candidateData.yearsExperience,
      currentCompany: candidateData.currentCompany,
      visaStatus: candidateData.visaStatus,
      desiredRate: candidateData.desiredRate,
      rateType: candidateData.rateType,
      currency: candidateData.currency,
    },
    skills: (candidateData.skills || []).map(s => ({
      name: s.name,
      isPrimary: s.isPrimary || false,
      proficiency: s.proficiency,
    })),
    workHistory: candidateData.workHistory || [],
    education: candidateData.education || [],
    certifications: candidateData.certifications || [],
  }

  const jsonString = JSON.stringify(jsonExportData, null, 2)

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString)
    toast.success('JSON copied to clipboard')
  }

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${candidateData.firstName}_${candidateData.lastName}_resume.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('JSON file downloaded')
  }

  const fileName = `${candidateData.firstName}_${candidateData.lastName}_Resume.pdf`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold-600" />
            Generate InTime Resume
          </DialogTitle>
          <DialogDescription>
            Create a professionally formatted resume for{' '}
            <span className="font-medium text-charcoal-800">
              {candidateName || `${candidateData.firstName} ${candidateData.lastName}`}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'json')} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b pb-3">
            <TabsList>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                PDF Preview
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <FileText className="h-4 w-4" />
                JSON Export
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gold-50 text-gold-700 border-gold-200">
                InTime Format v1
              </Badge>
            </div>
          </div>

          {/* PDF Preview Tab */}
          <TabsContent value="preview" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 bg-charcoal-100 rounded-lg overflow-hidden relative min-h-[500px]">
              {!isPdfReady ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-gold-600" />
                    <p className="text-sm text-charcoal-500">Generating PDF preview...</p>
                  </div>
                </div>
              ) : (
                <PDFViewer
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  showToolbar={false}
                >
                  <InTimeResumeTemplate data={enrichedData} />
                </PDFViewer>
              )}
            </div>

            {/* Download Actions */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="flex items-center gap-2 text-sm text-charcoal-500">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span>Ready to download or share</span>
              </div>

              <div className="flex items-center gap-3">
                <PDFDownloadLink
                  document={<InTimeResumeTemplate data={enrichedData} />}
                  fileName={fileName}
                >
                  {({ loading }) => (
                    <Button disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </TabsContent>

          {/* JSON Export Tab */}
          <TabsContent value="json" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-charcoal-500">
                  This JSON can be used to bulk import candidates back into InTime
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyJson}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 border rounded-lg bg-charcoal-50 min-h-[400px]">
                <pre className="p-4 text-xs font-mono text-charcoal-700 whitespace-pre-wrap">
                  {jsonString}
                </pre>
              </ScrollArea>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">Re-import this data</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    To import this candidate back into InTime, go to{' '}
                    <span className="font-medium">Candidates → Add New → Import CSV</span>{' '}
                    and upload this JSON file. All fields will be automatically mapped.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
