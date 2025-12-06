'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Loader2,
  Monitor,
  Smartphone,
  Code,
  FileText,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'user', label: 'User Notifications' },
  { value: 'candidate', label: 'Candidate Communications' },
  { value: 'client', label: 'Client Notifications' },
  { value: 'internal', label: 'Internal Alerts' },
  { value: 'system', label: 'System Alerts' },
  { value: 'marketing', label: 'Marketing' },
]

export function EmailTemplateFormPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params?.id as string
  const isEdit = templateId && templateId !== 'new'

  const utils = trpc.useUtils()

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('user')
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [fromName, setFromName] = useState('{{company_name}}')
  const [fromEmail, setFromEmail] = useState('noreply@{{company_domain}}')
  const [replyTo, setReplyTo] = useState('')
  const [bodyHtml, setBodyHtml] = useState('<p>Hello {{first_name}},</p><p>Your email content here...</p>')
  const [bodyText, setBodyText] = useState('')
  const [notes, setNotes] = useState('')

  // UI state
  const [editorTab, setEditorTab] = useState<string>('visual')
  const [showPreview, setShowPreview] = useState(false)
  const [showTestEmail, setShowTestEmail] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [testEmails, setTestEmails] = useState('')

  // Queries
  const templateQuery = trpc.emailTemplates.get.useQuery(
    { id: templateId },
    { enabled: isEdit }
  )
  const variablesQuery = trpc.emailTemplates.getVariables.useQuery()
  const previewQuery = trpc.emailTemplates.preview.useQuery(
    { id: templateId },
    { enabled: isEdit && showPreview }
  )

  // Mutations
  const createMutation = trpc.emailTemplates.create.useMutation({
    onSuccess: (data) => {
      toast.success('Template created')
      router.push(`/employee/admin/email-templates/${data.id}`)
    },
    onError: (err) => toast.error(err.message),
  })

  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      toast.success('Template saved')
      utils.emailTemplates.get.invalidate({ id: templateId })
    },
    onError: (err) => toast.error(err.message),
  })

  const activateMutation = trpc.emailTemplates.activate.useMutation({
    onSuccess: () => {
      toast.success('Template activated')
      utils.emailTemplates.get.invalidate({ id: templateId })
    },
    onError: (err) => toast.error(err.message),
  })

  const sendTestMutation = trpc.emailTemplates.sendTest.useMutation({
    onSuccess: (result) => {
      if (result.successCount > 0) {
        toast.success(`Test email sent to ${result.successCount} recipient(s)`)
      }
      if (result.failureCount > 0) {
        toast.error(`Failed to send to ${result.failureCount} recipient(s)`)
      }
      setShowTestEmail(false)
    },
    onError: (err) => toast.error(err.message),
  })

  // Load template data
  useEffect(() => {
    if (templateQuery.data) {
      const t = templateQuery.data
      setName(t.name)
      setCategory(t.category)
      setSubject(t.subject)
      setPreviewText(t.preview_text || '')
      setFromName(t.from_name)
      setFromEmail(t.from_email)
      setReplyTo(t.reply_to || '')
      setBodyHtml(t.body_html)
      setBodyText(t.body_text || '')
      setNotes(t.notes || '')
    }
  }, [templateQuery.data])

  // Get all available variables
  const allVariables = variablesQuery.data
    ? Object.values(variablesQuery.data).flat()
    : []

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Template name is required')
      return
    }
    if (!subject.trim()) {
      toast.error('Subject line is required')
      return
    }
    if (!bodyHtml.trim()) {
      toast.error('Email body is required')
      return
    }

    const data = {
      name,
      category: category as 'user' | 'candidate' | 'client' | 'internal' | 'system' | 'marketing',
      subject,
      preview_text: previewText || undefined,
      from_name: fromName || undefined,
      from_email: fromEmail || undefined,
      reply_to: replyTo || null,
      body_html: bodyHtml,
      body_text: bodyText || undefined,
      notes: notes || undefined,
    }

    if (isEdit) {
      updateMutation.mutate({ id: templateId, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleSaveAndActivate = async () => {
    if (!name.trim()) {
      toast.error('Template name is required')
      return
    }
    if (!subject.trim()) {
      toast.error('Subject line is required')
      return
    }
    if (!bodyHtml.trim()) {
      toast.error('Email body is required')
      return
    }

    const data = {
      name,
      category: category as 'user' | 'candidate' | 'client' | 'internal' | 'system' | 'marketing',
      subject,
      preview_text: previewText || undefined,
      from_name: fromName || undefined,
      from_email: fromEmail || undefined,
      reply_to: replyTo || null,
      body_html: bodyHtml,
      body_text: bodyText || undefined,
      notes: notes || undefined,
    }

    if (isEdit) {
      await updateMutation.mutateAsync({ id: templateId, ...data })
      activateMutation.mutate({ id: templateId })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleSendTest = () => {
    const emails = testEmails
      .split(',')
      .map(e => e.trim())
      .filter(e => e)

    if (emails.length === 0) {
      toast.error('Enter at least one email address')
      return
    }

    sendTestMutation.mutate({
      id: templateId,
      recipients: emails,
    })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Email Templates', href: '/employee/admin/email-templates' },
    { label: isEdit ? 'Edit' : 'New' },
  ]

  return (
    <DashboardShell
      title={isEdit ? 'Edit Email Template' : 'New Email Template'}
      description={isEdit ? `Editing: ${templateQuery.data?.name || ''}` : 'Create a new email template'}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-8">
        {/* Template Settings */}
        <section className="bg-white rounded-lg border border-charcoal-100 p-6">
          <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Template Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome Email - New User"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes about when/how this template is used"
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* Email Headers */}
        <section className="bg-white rounded-lg border border-charcoal-100 p-6">
          <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Email Headers</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Welcome to {{company_name}}!"
              />
              <p className="text-xs text-charcoal-500">
                {subject.length}/200 characters (keep under 50 for mobile)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="previewText">Preview Text</Label>
              <Input
                id="previewText"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Text shown in inbox preview..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="{{company_name}} Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="noreply@{{company_domain}}"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To</Label>
                <Input
                  id="replyTo"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="hr@{{company_domain}}"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Email Body */}
        <section className="bg-white rounded-lg border border-charcoal-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal-900">Email Body</h2>
            <div className="flex gap-2">
              {isEdit && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowTestEmail(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs value={editorTab} onValueChange={setEditorTab}>
            <TabsList className="bg-charcoal-100 mb-4">
              <TabsTrigger value="visual">
                <FileText className="w-4 h-4 mr-2" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="html">
                <Code className="w-4 h-4 mr-2" />
                HTML Editor
              </TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
            </TabsList>

            <TabsContent value="visual">
              <RichTextEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                variables={allVariables}
                placeholder="Write your email content..."
              />
            </TabsContent>

            <TabsContent value="html">
              <Textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder="<html>...</html>"
              />
            </TabsContent>

            <TabsContent value="text">
              <Textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="min-h-[400px]"
                placeholder="Plain text version of your email..."
              />
              <p className="text-xs text-charcoal-500 mt-2">
                Plain text version is auto-generated from HTML if left empty
              </p>
            </TabsContent>
          </Tabs>

          {/* Variables Panel */}
          {variablesQuery.data && (
            <div className="mt-6 pt-6 border-t border-charcoal-100">
              <h3 className="text-sm font-medium text-charcoal-700 mb-3">Available Variables</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {Object.entries(variablesQuery.data).map(([group, vars]) => (
                  <div key={group}>
                    <p className="font-medium text-charcoal-600 capitalize mb-1">{group}</p>
                    <div className="space-y-0.5">
                      {vars.map((v: string) => (
                        <code key={v} className="block text-xs text-charcoal-500 font-mono">
                          {`{{${v}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
          <Link href="/employee/admin/email-templates">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button
              onClick={handleSaveAndActivate}
              disabled={isSaving}
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Save & Activate
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview: {name}</DialogTitle>
            <DialogDescription>
              Preview how your email will look to recipients
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>

          <div className={`border border-charcoal-200 rounded-lg overflow-hidden ${
            previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''
          }`}>
            <div className="bg-charcoal-50 px-4 py-2 border-b border-charcoal-200 text-sm">
              <p><strong>From:</strong> {previewQuery.data?.from_name} &lt;{previewQuery.data?.from_email}&gt;</p>
              <p><strong>Subject:</strong> {previewQuery.data?.subject}</p>
            </div>
            <div
              className="p-4 bg-white prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewQuery.data?.body_html || '' }}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Modal */}
      <Dialog open={showTestEmail} onOpenChange={setShowTestEmail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test version of this email to verify it renders correctly
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmails">Recipient Email(s) *</Label>
              <Input
                id="testEmails"
                value={testEmails}
                onChange={(e) => setTestEmails(e.target.value)}
                placeholder="email@example.com, another@example.com"
              />
              <p className="text-xs text-charcoal-500">
                Separate multiple emails with commas (max 5)
              </p>
            </div>

            <div className="bg-charcoal-50 rounded-lg p-3 text-sm">
              <p className="text-charcoal-600">
                Test emails will be sent with <code className="bg-charcoal-200 px-1 rounded">[TEST]</code> prefix in the subject line and use sample data for variables.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmail(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={sendTestMutation.isPending}
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              {sendTestMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

export default EmailTemplateFormPage
