"use client";

import * as React from "react";
import {
  Loader2,
  X,
  Paperclip,
  Send,
  Clock,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Image,
  Sparkles,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface Recipient {
  id: string;
  name: string;
  email: string;
  type?: "to" | "cc" | "bcc";
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailComposeFormData {
  to: Recipient[];
  cc: Recipient[];
  bcc: Recipient[];
  subject: string;
  body: string;
  attachments: Attachment[];
  scheduledAt?: string;
  templateId?: string;
}

export interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTo?: Recipient[];
  defaultSubject?: string;
  defaultBody?: string;
  replyTo?: {
    id: string;
    subject: string;
    from: Recipient;
    body: string;
  };
  templates?: EmailTemplate[];
  suggestedRecipients?: Recipient[];
  onSend: (data: EmailComposeFormData) => Promise<void>;
  onSaveDraft?: (data: EmailComposeFormData) => Promise<void>;
  onSchedule?: (data: EmailComposeFormData) => Promise<void>;
  onAiAssist?: (prompt: string, currentBody: string) => Promise<string>;
  maxAttachmentSize?: number; // in bytes
}

export function EmailComposeModal({
  isOpen,
  onClose,
  defaultTo = [],
  defaultSubject = "",
  defaultBody = "",
  replyTo,
  templates = [],
  suggestedRecipients = [],
  onSend,
  onSaveDraft,
  onSchedule,
  onAiAssist,
  maxAttachmentSize = 10 * 1024 * 1024, // 10MB default
}: EmailComposeModalProps) {
  const [formData, setFormData] = React.useState<EmailComposeFormData>({
    to: defaultTo,
    cc: [],
    bcc: [],
    subject: defaultSubject,
    body: defaultBody,
    attachments: [],
  });
  const [showCc, setShowCc] = React.useState(false);
  const [showBcc, setShowBcc] = React.useState(false);
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [recipientInput, setRecipientInput] = React.useState("");
  const [recipientType, setRecipientType] = React.useState<"to" | "cc" | "bcc">("to");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [showAiPrompt, setShowAiPrompt] = React.useState(false);
  const [aiPrompt, setAiPrompt] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  // Initialize form on open
  React.useEffect(() => {
    if (isOpen) {
      if (replyTo) {
        setFormData({
          to: [replyTo.from],
          cc: [],
          bcc: [],
          subject: replyTo.subject.startsWith("Re:") ? replyTo.subject : `Re: ${replyTo.subject}`,
          body: `\n\n---\nOn ${new Date().toLocaleDateString()}, ${replyTo.from.name} wrote:\n${replyTo.body}`,
          attachments: [],
        });
      } else {
        setFormData({
          to: defaultTo,
          cc: [],
          bcc: [],
          subject: defaultSubject,
          body: defaultBody,
          attachments: [],
        });
      }
      setShowCc(false);
      setShowBcc(false);
      setShowSchedule(false);
    }
  }, [isOpen, defaultTo, defaultSubject, defaultBody, replyTo]);

  const addRecipient = (recipient: Recipient, type: "to" | "cc" | "bcc") => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], recipient],
    }));
  };

  const removeRecipient = (recipientId: string, type: "to" | "cc" | "bcc") => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((r) => r.id !== recipientId),
    }));
  };

  const handleRecipientInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && recipientInput.trim()) {
      e.preventDefault();
      // Check if it's an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(recipientInput.trim())) {
        addRecipient(
          {
            id: `manual-${Date.now()}`,
            name: recipientInput.trim(),
            email: recipientInput.trim(),
          },
          recipientType
        );
        setRecipientInput("");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > maxAttachmentSize) {
        alert(`File "${file.name}" exceeds maximum size of ${(maxAttachmentSize / 1024 / 1024).toFixed(0)}MB`);
        return;
      }

      newAttachments.push({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attachmentId),
    }));
  };

  const applyTemplate = (template: EmailTemplate) => {
    setFormData((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body,
      templateId: template.id,
    }));
  };

  const handleAiAssist = async () => {
    if (!onAiAssist || !aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const result = await onAiAssist(aiPrompt, formData.body);
      setFormData((prev) => ({ ...prev, body: result }));
      setShowAiPrompt(false);
      setAiPrompt("");
    } catch (error) {
      console.error("AI assist failed:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft(formData);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (formData.to.length === 0) {
      alert("Please add at least one recipient");
      return;
    }

    setIsSubmitting(true);
    try {
      if (showSchedule && formData.scheduledAt && onSchedule) {
        await onSchedule(formData);
      } else {
        await onSend(formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const RecipientInput = ({ type, recipients }: { type: "to" | "cc" | "bcc"; recipients: Recipient[] }) => (
    <div className="flex flex-wrap items-center gap-1 min-h-[38px] rounded-md border border-input bg-background px-3 py-1">
      <span className="text-sm text-muted-foreground min-w-[30px]">
        {type.charAt(0).toUpperCase() + type.slice(1)}:
      </span>
      {recipients.map((recipient) => (
        <span
          key={recipient.id}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm"
        >
          {recipient.name || recipient.email}
          <button
            type="button"
            onClick={() => removeRecipient(recipient.id, type)}
            className="rounded-full hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={recipientType === type ? recipientInput : ""}
        onChange={(e) => {
          setRecipientType(type);
          setRecipientInput(e.target.value);
        }}
        onFocus={() => setRecipientType(type)}
        onKeyDown={handleRecipientInputKeyDown}
        placeholder={recipients.length === 0 ? "Add recipients..." : ""}
        className="flex-1 min-w-[100px] bg-transparent text-sm outline-none"
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={replyTo ? "Reply" : "New Email"}
      size={isExpanded ? "full" : "xl"}
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md p-2 hover:bg-muted"
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            {templates.length > 0 && (
              <select
                onChange={(e) => {
                  const template = templates.find((t) => t.id === e.target.value);
                  if (template) applyTemplate(template);
                }}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Templates
                </option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
            {onAiAssist && (
              <button
                type="button"
                onClick={() => setShowAiPrompt(!showAiPrompt)}
                className={cn("rounded-md p-2 hover:bg-muted", showAiPrompt && "bg-muted")}
                title="AI Assist"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-md p-2 hover:bg-muted"
              title={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSaving}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input",
                  "bg-background px-4 py-2 text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Draft
              </button>
            )}
            {onSchedule && (
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input",
                  "bg-background px-4 py-2 text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  showSchedule && "bg-muted"
                )}
              >
                <Clock className="h-4 w-4" />
                Schedule
              </button>
            )}
            <button
              type="button"
              onClick={handleSend}
              disabled={isSubmitting || formData.to.length === 0}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" />
              {showSchedule && formData.scheduledAt ? "Schedule" : "Send"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Recipients */}
        <div className="space-y-2">
          <RecipientInput type="to" recipients={formData.to} />
          {!showCc && !showBcc && (
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="text-primary hover:underline"
              >
                Cc
              </button>
              <button
                type="button"
                onClick={() => setShowBcc(true)}
                className="text-primary hover:underline"
              >
                Bcc
              </button>
            </div>
          )}
          {showCc && <RecipientInput type="cc" recipients={formData.cc} />}
          {showBcc && <RecipientInput type="bcc" recipients={formData.bcc} />}
        </div>

        {/* Suggested Recipients */}
        {recipientInput && suggestedRecipients.length > 0 && (
          <div className="rounded-md border bg-popover p-2 shadow-md">
            {suggestedRecipients
              .filter(
                (r) =>
                  r.name.toLowerCase().includes(recipientInput.toLowerCase()) ||
                  r.email.toLowerCase().includes(recipientInput.toLowerCase())
              )
              .slice(0, 5)
              .map((recipient) => (
                <button
                  key={recipient.id}
                  type="button"
                  onClick={() => {
                    addRecipient(recipient, recipientType);
                    setRecipientInput("");
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted"
                >
                  <span className="font-medium">{recipient.name}</span>
                  <span className="text-muted-foreground">&lt;{recipient.email}&gt;</span>
                </button>
              ))}
          </div>
        )}

        {/* Subject */}
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
          placeholder="Subject"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />

        {/* Schedule */}
        {showSchedule && (
          <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">Schedule for:</span>
            <input
              type="datetime-local"
              value={formData.scheduledAt || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setShowSchedule(false);
                setFormData((prev) => ({ ...prev, scheduledAt: undefined }));
              }}
              className="ml-auto text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}

        {/* AI Prompt */}
        {showAiPrompt && (
          <div className="rounded-md border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                AI Assistant
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Make it more professional, Add a call to action..."
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAiAssist()}
              />
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={isAiLoading || !aiPrompt.trim()}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-md",
                  "bg-purple-600 px-3 text-sm font-medium text-white",
                  "hover:bg-purple-700",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="space-y-2">
          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 rounded-md border border-input p-1">
            <button type="button" className="rounded p-1 hover:bg-muted" title="Bold">
              <Bold className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-1 hover:bg-muted" title="Italic">
              <Italic className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-1 hover:bg-muted" title="Underline">
              <Underline className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button type="button" className="rounded p-1 hover:bg-muted" title="Link">
              <Link className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-1 hover:bg-muted" title="Bullet list">
              <List className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-1 hover:bg-muted" title="Numbered list">
              <ListOrdered className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-1 hover:bg-muted" title="Insert image">
              <Image className="h-4 w-4" />
            </button>
          </div>
          <textarea
            ref={bodyRef}
            value={formData.body}
            onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
            placeholder="Compose your email..."
            className={cn(
              "w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm",
              isExpanded ? "min-h-[400px]" : "min-h-[200px]"
            )}
          />
        </div>

        {/* Attachments */}
        {formData.attachments.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Attachments</div>
            <div className="flex flex-wrap gap-2">
              {formData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{attachment.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(attachment.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default EmailComposeModal;
