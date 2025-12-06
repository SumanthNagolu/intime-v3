'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Highlighter,
  Minus,
  Unlink,
} from 'lucide-react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Input } from './input'
import { useState, useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  variables?: string[]
  onInsertVariable?: (variable: string) => void
}

// Loading skeleton component
function EditorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border border-charcoal-200 rounded-lg overflow-hidden bg-white', className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-charcoal-200 bg-charcoal-50 h-12">
        <div className="animate-pulse bg-charcoal-200 rounded h-8 w-32" />
      </div>
      <div className="min-h-[300px] p-4 animate-pulse">
        <div className="bg-charcoal-100 rounded h-4 w-3/4 mb-2" />
        <div className="bg-charcoal-100 rounded h-4 w-1/2" />
      </div>
    </div>
  )
}

// Main export - wrapper that ensures client-only rendering
export function RichTextEditor(props: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR or before mount, show skeleton
  if (!isMounted) {
    return <EditorSkeleton className={props.className} />
  }

  // After mount, render the actual editor
  return <RichTextEditorClient {...props} />
}

// Client-only editor component - hooks are only called after mount
function RichTextEditorClient({
  value,
  onChange,
  placeholder = 'Write your email content...',
  className,
  variables = [],
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        HTMLAttributes: { class: 'bg-yellow-200' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  const insertVariable = useCallback((variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`{{${variable}}}`).run()
    }
  }, [editor])

  if (!editor) {
    return <EditorSkeleton className={className} />
  }

  return (
    <div className={cn('border border-charcoal-200 rounded-lg overflow-hidden bg-white', className)}>
      <Toolbar editor={editor} variables={variables} onInsertVariable={insertVariable} />
      <EditorContent editor={editor} />
    </div>
  )
}

interface ToolbarProps {
  editor: Editor
  variables: string[]
  onInsertVariable: (variable: string) => void
}

function Toolbar({ editor, variables, onInsertVariable }: ToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [variablesOpen, setVariablesOpen] = useState(false)

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setLinkOpen(false)
    }
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setLinkOpen(false)
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setImageOpen(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-charcoal-200 bg-charcoal-50">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-charcoal-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold className="w-4 h-4" />}
          title="Bold (Cmd+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic className="w-4 h-4" />}
          title="Italic (Cmd+I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={<UnderlineIcon className="w-4 h-4" />}
          title="Underline (Cmd+U)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={<Strikethrough className="w-4 h-4" />}
          title="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={<Highlighter className="w-4 h-4" />}
          title="Highlight"
        />
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-charcoal-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 className="w-4 h-4" />}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="w-4 h-4" />}
          title="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={<Heading3 className="w-4 h-4" />}
          title="Heading 3"
        />
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-charcoal-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={<AlignLeft className="w-4 h-4" />}
          title="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={<AlignCenter className="w-4 h-4" />}
          title="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={<AlignRight className="w-4 h-4" />}
          title="Align Right"
        />
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-charcoal-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List className="w-4 h-4" />}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered className="w-4 h-4" />}
          title="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<Quote className="w-4 h-4" />}
          title="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={<Code className="w-4 h-4" />}
          title="Code Block"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus className="w-4 h-4" />}
          title="Horizontal Rule"
        />
      </div>

      {/* Link */}
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-charcoal-200')}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <Input
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={setLink}>Insert Link</Button>
              <Button
                size="sm"
                variant="outline"
                onClick={removeLink}
              >
                <Unlink className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Image */}
      <Popover open={imageOpen} onOpenChange={setImageOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Image">
            <ImageIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <Input
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addImage()}
            />
            <Button size="sm" onClick={addImage}>Insert Image</Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Variables */}
      {variables.length > 0 && (
        <Popover open={variablesOpen} onOpenChange={setVariablesOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 ml-2">
              Insert Variable
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 max-h-80 overflow-auto">
            <div className="space-y-1">
              {variables.map((variable) => (
                <button
                  key={variable}
                  onClick={() => {
                    onInsertVariable(variable)
                    setVariablesOpen(false)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-charcoal-100 rounded font-mono"
                >
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 ml-auto">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo className="w-4 h-4" />}
          title="Undo (Cmd+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo className="w-4 h-4" />}
          title="Redo (Cmd+Shift+Z)"
        />
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  icon: React.ReactNode
  title: string
}

function ToolbarButton({ onClick, isActive, disabled, icon, title }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn('h-8 w-8 p-0', isActive && 'bg-charcoal-200')}
      title={title}
    >
      {icon}
    </Button>
  )
}

export default RichTextEditor
