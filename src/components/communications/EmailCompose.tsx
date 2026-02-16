'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Minimize2,
  Maximize2,
  Paperclip,
  Image,
  Link2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Send,
  Trash2,
  ChevronDown,
  Clock,
  FileText,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

// ============================================
// Types
// ============================================

interface EmailRecipient {
  email: string
  name?: string
}

interface EmailComposeProps {
  isOpen: boolean
  onClose: () => void
  // Pre-fill options
  to?: EmailRecipient[]
  cc?: EmailRecipient[]
  subject?: string
  body?: string
  threadId?: string
  inReplyTo?: string
  // Entity linking
  linkedEntity?: {
    type: string
    id: string
    name: string
  }
  // Callbacks
  onSent?: (messageId: string) => void
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body_html: string
  variables: Array<{ name: string; defaultValue?: string }>
}

// ============================================
// Recipient Input Component
// ============================================

function RecipientInput({
  label,
  recipients,
  onChange,
  placeholder,
}: {
  label: string
  recipients: EmailRecipient[]
  onChange: (recipients: EmailRecipient[]) => void
  placeholder?: string
}) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addRecipient = useCallback(() => {
    const email = inputValue.trim()
    if (email && email.includes('@')) {
      onChange([...recipients, { email }])
      setInputValue('')
    }
  }, [inputValue, recipients, onChange])

  const removeRecipient = useCallback(
    (index: number) => {
      onChange(recipients.filter((_, i) => i !== index))
    },
    [recipients, onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      addRecipient()
    } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      removeRecipient(recipients.length - 1)
    }
  }

  return (
    <div className="flex items-start gap-2 py-2 border-b border-charcoal-100">
      <span className="text-sm text-charcoal-500 w-12 pt-1 flex-shrink-0">{label}</span>
      <div className="flex-1 flex flex-wrap items-center gap-1.5">
        {recipients.map((recipient, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-charcoal-100 rounded-full text-sm"
          >
            {recipient.name || recipient.email}
            <button
              onClick={() => removeRecipient(index)}
              className="text-charcoal-400 hover:text-charcoal-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addRecipient}
          placeholder={recipients.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[150px] text-sm bg-transparent outline-none placeholder:text-charcoal-400"
        />
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function EmailCompose({
  isOpen,
  onClose,
  to = [],
  cc = [],
  subject: initialSubject = '',
  body: initialBody = '',
  threadId,
  inReplyTo,
  linkedEntity,
  onSent,
}: EmailComposeProps) {
  // State
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showCc, setShowCc] = useState(cc.length > 0)
  const [showBcc, setShowBcc] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const [recipients, setRecipients] = useState<EmailRecipient[]>(to)
  const [ccRecipients, setCcRecipients] = useState<EmailRecipient[]>(cc)
  const [bccRecipients, setBccRecipients] = useState<EmailRecipient[]>([])
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [isSending, setIsSending] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)

  // Queries
  const { data: accounts } = trpc.email.accounts.list.useQuery()
  const { data: templates } = trpc.email.templates.list.useQuery({})
  const sendMutation = trpc.email.messages.send.useMutation()

  // Default account
  const defaultAccount = accounts?.find((a) => a.is_default) ?? accounts?.[0]

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setRecipients(to)
      setCcRecipients(cc)
      setBccRecipients([])
      setSubject(initialSubject)
      setBody(initialBody)
      setIsMinimized(false)
    }
  }, [isOpen, to, cc, initialSubject, initialBody])

  // Format actions
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }, [])

  // Apply template
  const applyTemplate = useCallback((template: EmailTemplate) => {
    let processedSubject = template.subject
    let processedBody = template.body_html

    // Replace variables with defaults or placeholders
    for (const variable of template.variables) {
      const placeholder = `{{${variable.name}}}`
      const value = variable.defaultValue || `[${variable.name}]`
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value)
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), value)
    }

    setSubject(processedSubject)
    setBody(processedBody)
    if (editorRef.current) {
      editorRef.current.innerHTML = processedBody
    }
    setShowTemplates(false)
  }, [])

  // Send email
  const handleSend = useCallback(async () => {
    if (!defaultAccount || recipients.length === 0) return

    setIsSending(true)
    try {
      const result = await sendMutation.mutateAsync({
        accountId: defaultAccount.id,
        threadId: threadId,
        to: recipients,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        subject,
        bodyHtml: editorRef.current?.innerHTML || body,
        bodyText: editorRef.current?.textContent || undefined,
        inReplyTo,
      })

      onSent?.(result.id)
      onClose()
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setIsSending(false)
    }
  }, [
    defaultAccount,
    recipients,
    ccRecipients,
    bccRecipients,
    subject,
    body,
    threadId,
    inReplyTo,
    sendMutation,
    onSent,
    onClose,
  ])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'fixed bg-white rounded-t-lg shadow-elevation-xl border border-charcoal-200 z-50 flex flex-col',
        isMaximized
          ? 'inset-4 rounded-lg'
          : isMinimized
            ? 'bottom-0 right-4 w-80 h-12'
            : 'bottom-0 right-4 w-[600px] h-[500px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-charcoal-100 bg-charcoal-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-charcoal-900">
            {threadId ? 'Reply' : 'New Message'}
          </span>
          {linkedEntity && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-50 text-gold-700 rounded text-xs">
              <Link2 className="w-3 h-3" />
              {linkedEntity.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-charcoal-400 hover:text-charcoal-600 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 text-charcoal-400 hover:text-charcoal-600 rounded"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-charcoal-400 hover:text-charcoal-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Recipients */}
          <div className="px-4 border-b border-charcoal-100">
            <RecipientInput
              label="To"
              recipients={recipients}
              onChange={setRecipients}
              placeholder="Recipients"
            />

            {showCc && (
              <RecipientInput
                label="Cc"
                recipients={ccRecipients}
                onChange={setCcRecipients}
              />
            )}

            {showBcc && (
              <RecipientInput
                label="Bcc"
                recipients={bccRecipients}
                onChange={setBccRecipients}
              />
            )}

            {(!showCc || !showBcc) && (
              <div className="py-1 flex gap-2">
                {!showCc && (
                  <button
                    onClick={() => setShowCc(true)}
                    className="text-xs text-charcoal-500 hover:text-charcoal-700"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    onClick={() => setShowBcc(true)}
                    className="text-xs text-charcoal-500 hover:text-charcoal-700"
                  >
                    Bcc
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="px-4 py-2 border-b border-charcoal-100">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full text-sm bg-transparent outline-none placeholder:text-charcoal-400"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-2 py-1 border-b border-charcoal-100 bg-charcoal-50/50">
            <button
              onClick={() => execCommand('bold')}
              className="p-1.5 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 rounded"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-1.5 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 rounded"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-charcoal-200 mx-1" />
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-1.5 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 rounded"
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-1.5 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 rounded"
              title="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-charcoal-200 mx-1" />
            <button
              onClick={() => {
                const url = prompt('Enter URL:')
                if (url) execCommand('createLink', url)
              }}
              className="p-1.5 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 rounded"
              title="Insert link"
            >
              <Link2 className="w-4 h-4" />
            </button>

            <div className="flex-1" />

            {/* Templates dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-charcoal-600 hover:text-charcoal-800 hover:bg-charcoal-100 rounded"
              >
                <FileText className="w-3.5 h-3.5" />
                Templates
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTemplates && templates && templates.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-elevation-lg border border-charcoal-200 py-1 z-10">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template as EmailTemplate)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-charcoal-50"
                    >
                      <div className="font-medium text-charcoal-900">{template.name}</div>
                      <div className="text-xs text-charcoal-500 truncate">{template.subject}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Body editor */}
          <div className="flex-1 overflow-auto">
            <div
              ref={editorRef}
              contentEditable
              className="h-full p-4 text-sm outline-none"
              dangerouslySetInnerHTML={{ __html: body }}
              onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-charcoal-100 bg-charcoal-50">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={isSending || recipients.length === 0 || !defaultAccount}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  recipients.length > 0 && defaultAccount
                    ? 'bg-charcoal-900 text-white hover:bg-charcoal-800'
                    : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send'}
              </button>

              <button className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded">
                <Paperclip className="w-4 h-4" />
              </button>

              <button className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded">
                <Image className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {defaultAccount && (
                <span className="text-xs text-charcoal-500">
                  From: {defaultAccount.email_address}
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 text-charcoal-400 hover:text-error-600 hover:bg-error-50 rounded"
                title="Discard"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// Hook for managing compose state
// ============================================

export function useEmailCompose() {
  const [composeState, setComposeState] = useState<{
    isOpen: boolean
    props: Partial<EmailComposeProps>
  }>({
    isOpen: false,
    props: {},
  })

  const openCompose = useCallback((props?: Partial<EmailComposeProps>) => {
    setComposeState({ isOpen: true, props: props ?? {} })
  }, [])

  const closeCompose = useCallback(() => {
    setComposeState({ isOpen: false, props: {} })
  }, [])

  const replyTo = useCallback(
    (options: {
      to: EmailRecipient[]
      subject: string
      threadId: string
      inReplyTo?: string
    }) => {
      openCompose({
        to: options.to,
        subject: options.subject.startsWith('Re:') ? options.subject : `Re: ${options.subject}`,
        threadId: options.threadId,
        inReplyTo: options.inReplyTo,
      })
    },
    [openCompose]
  )

  const forwardEmail = useCallback(
    (options: { subject: string; body: string }) => {
      openCompose({
        subject: options.subject.startsWith('Fwd:') ? options.subject : `Fwd: ${options.subject}`,
        body: `<br/><br/>---------- Forwarded message ---------<br/>${options.body}`,
      })
    },
    [openCompose]
  )

  const composeForEntity = useCallback(
    (entity: { type: string; id: string; name: string; email?: string }) => {
      openCompose({
        to: entity.email ? [{ email: entity.email, name: entity.name }] : [],
        linkedEntity: { type: entity.type, id: entity.id, name: entity.name },
      })
    },
    [openCompose]
  )

  return {
    isOpen: composeState.isOpen,
    composeProps: composeState.props,
    openCompose,
    closeCompose,
    replyTo,
    forwardEmail,
    composeForEntity,
  }
}

export default EmailCompose
