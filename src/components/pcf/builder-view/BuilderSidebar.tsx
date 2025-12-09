'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, GripVertical, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { BuilderToolConfig } from './types'

interface BuilderSidebarProps {
  tools: BuilderToolConfig[]
  categories?: Array<{ id: string; label: string }>
  onDragStart?: (tool: BuilderToolConfig) => void
  onToolClick?: (tool: BuilderToolConfig) => void
  className?: string
}

export function BuilderSidebar({
  tools,
  categories,
  onDragStart,
  onToolClick,
  className,
}: BuilderSidebarProps) {
  const [search, setSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories?.map((c) => c.id) || ['default'])
  )

  // Filter tools by search
  const filteredTools = tools.filter(
    (tool) =>
      tool.label.toLowerCase().includes(search.toLowerCase()) ||
      tool.description?.toLowerCase().includes(search.toLowerCase())
  )

  // Group tools by category
  const toolsByCategory = filteredTools.reduce(
    (acc, tool) => {
      const category = tool.category || 'default'
      if (!acc[category]) acc[category] = []
      acc[category].push(tool)
      return acc
    },
    {} as Record<string, BuilderToolConfig[]>
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-charcoal-200 flex flex-col',
        className
      )}
    >
      {/* Search */}
      <div className="p-3 border-b border-charcoal-100">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Tools List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories ? (
            categories.map((category) => {
              const categoryTools = toolsByCategory[category.id] || []
              if (categoryTools.length === 0) return null

              const isExpanded = expandedCategories.has(category.id)

              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wider hover:text-charcoal-700 transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    {category.label}
                    <span className="ml-auto text-charcoal-400">
                      {categoryTools.length}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 mt-1">
                      {categoryTools.map((tool) => (
                        <ToolItem
                          key={tool.id}
                          tool={tool}
                          onDragStart={onDragStart}
                          onClick={onToolClick}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })
          ) : (
            <div className="space-y-1">
              {filteredTools.map((tool) => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  onDragStart={onDragStart}
                  onClick={onToolClick}
                />
              ))}
            </div>
          )}

          {filteredTools.length === 0 && (
            <div className="text-center py-8 text-sm text-charcoal-500">
              No tools match your search
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}

function ToolItem({
  tool,
  onDragStart,
  onClick,
}: {
  tool: BuilderToolConfig
  onDragStart?: (tool: BuilderToolConfig) => void
  onClick?: (tool: BuilderToolConfig) => void
}) {
  const Icon = tool.icon

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(tool))
        onDragStart?.(tool)
      }}
      onClick={() => onClick?.(tool)}
      className={cn(
        'flex items-center gap-2 px-2 py-2 rounded-lg cursor-grab',
        'hover:bg-charcoal-50 active:cursor-grabbing transition-colors',
        'border border-transparent hover:border-charcoal-200'
      )}
    >
      <GripVertical className="w-3 h-3 text-charcoal-300 flex-shrink-0" />
      {Icon && (
        <div className="p-1.5 rounded bg-charcoal-100 flex-shrink-0">
          <Icon className="w-4 h-4 text-charcoal-600" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-charcoal-700 truncate">
          {tool.label}
        </p>
        {tool.description && (
          <p className="text-xs text-charcoal-500 truncate">{tool.description}</p>
        )}
      </div>
    </div>
  )
}

