// Content block types for the Implementation Document Builder
// Discriminated union pattern — each block type has its own shape

export type BlockType = 'text' | 'code' | 'image' | 'before-after' | 'callout' | 'file-changes'

export type CalloutVariant = 'tip' | 'warning' | 'important' | 'gotcha'

export type FileChangeStatus = 'added' | 'modified' | 'deleted'

// --- Block Definitions ---

export interface TextBlock {
  id: string
  type: 'text'
  sortOrder: number
  content: string
}

export interface CodeBlock {
  id: string
  type: 'code'
  sortOrder: number
  language: string
  filename: string
  code: string
  explanation: string
}

export interface ImageBlock {
  id: string
  type: 'image'
  sortOrder: number
  dataUrl: string
  caption: string
}

export interface BeforeAfterBlock {
  id: string
  type: 'before-after'
  sortOrder: number
  contentType: 'code' | 'text'
  language: string
  beforeLabel: string
  afterLabel: string
  before: string
  after: string
}

export interface CalloutBlock {
  id: string
  type: 'callout'
  sortOrder: number
  variant: CalloutVariant
  title: string
  content: string
}

export interface FileChange {
  path: string
  status: FileChangeStatus
  description: string
}

export interface FileChangesBlock {
  id: string
  type: 'file-changes'
  sortOrder: number
  files: FileChange[]
}

export type ContentBlock =
  | TextBlock
  | CodeBlock
  | ImageBlock
  | BeforeAfterBlock
  | CalloutBlock
  | FileChangesBlock

// --- Code Language Options ---

export const CODE_LANGUAGES = [
  { value: 'gosu', label: 'Gosu' },
  { value: 'java', label: 'Java' },
  { value: 'xml', label: 'XML' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'groovy', label: 'Groovy' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
] as const

// --- Helpers ---

const genId = () => crypto.randomUUID()

export function createBlock(type: BlockType, afterSortOrder: number): ContentBlock {
  const base = { id: genId(), sortOrder: afterSortOrder + 1 }

  switch (type) {
    case 'text':
      return { ...base, type: 'text', content: '' }
    case 'code':
      return { ...base, type: 'code', language: 'gosu', filename: '', code: '', explanation: '' }
    case 'image':
      return { ...base, type: 'image', dataUrl: '', caption: '' }
    case 'before-after':
      return {
        ...base,
        type: 'before-after',
        contentType: 'code',
        language: 'gosu',
        beforeLabel: 'Before',
        afterLabel: 'After',
        before: '',
        after: '',
      }
    case 'callout':
      return { ...base, type: 'callout', variant: 'tip', title: '', content: '' }
    case 'file-changes':
      return { ...base, type: 'file-changes', files: [] }
    default: {
      const _exhaustive: never = type
      throw new Error(`Unknown block type: ${_exhaustive}`)
    }
  }
}

export function moveBlock(
  blocks: ContentBlock[],
  blockId: string,
  direction: 'up' | 'down'
): ContentBlock[] {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder)
  const idx = sorted.findIndex((b) => b.id === blockId)
  if (idx === -1) return blocks

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= sorted.length) return blocks

  // Swap sort orders
  const currentOrder = sorted[idx].sortOrder
  const targetOrder = sorted[targetIdx].sortOrder

  return blocks.map((b) => {
    if (b.id === sorted[idx].id) return { ...b, sortOrder: targetOrder }
    if (b.id === sorted[targetIdx].id) return { ...b, sortOrder: currentOrder }
    return b
  })
}

export function removeBlock(blocks: ContentBlock[], blockId: string): ContentBlock[] {
  return blocks.filter((b) => b.id !== blockId)
}

export function updateBlock<T extends ContentBlock>(
  blocks: ContentBlock[],
  blockId: string,
  updates: Partial<T>
): ContentBlock[] {
  return blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
}

export function getMaxSortOrder(blocks: ContentBlock[]): number {
  if (blocks.length === 0) return 0
  return Math.max(...blocks.map((b) => b.sortOrder))
}
