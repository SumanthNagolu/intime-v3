'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Network, Users, Building2, ChevronRight, ChevronDown, Plus, Loader2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

interface DepartmentNodeFromApi {
  id: string
  name: string
  code?: string | null
  parent_id?: string | null
  hierarchy_level?: number | null
  status: string
  head?: Array<{
    id: string
    full_name: string
    avatar_url?: string | null
  }> | null
  employees?: Array<{ count: number }> | null
  headcount?: number
  children: DepartmentNodeFromApi[]
}

interface DepartmentNode {
  id: string
  name: string
  code?: string | null
  parent_id?: string | null
  hierarchy_level?: number | null
  status: string
  head?: {
    id: string
    full_name: string
    avatar_url?: string | null
  } | null
  headcount: number
  children: DepartmentNode[]
}

// Transform API response to DepartmentNode
function transformNode(node: DepartmentNodeFromApi): DepartmentNode {
  return {
    ...node,
    head: Array.isArray(node.head) && node.head.length > 0 ? node.head[0] : null,
    headcount: node.headcount ?? (Array.isArray(node.employees) && node.employees[0] ? node.employees[0].count : 0),
    children: (node.children || []).map(transformNode),
  }
}

// Tree Node Component
function DepartmentTreeNode({
  node,
  level = 0,
  expanded,
  onToggle
}: {
  node: DepartmentNode
  level?: number
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  const isExpanded = expanded.has(node.id)
  const hasChildren = node.children && node.children.length > 0

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn('relative', level > 0 && 'ml-8')}>
      {/* Connection Line */}
      {level > 0 && (
        <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-charcoal-200" />
      )}
      {level > 0 && (
        <div className="absolute left-[-20px] top-8 h-px w-5 bg-charcoal-200" />
      )}

      {/* Node Card */}
      <div className="mb-3">
        <div className={cn(
          'flex items-center gap-3 p-4 rounded-lg border bg-white transition-all hover:shadow-md',
          node.status === 'active' ? 'border-charcoal-200' : 'border-amber-200 bg-amber-50/30'
        )}>
          {/* Expand/Collapse Button */}
          <button
            onClick={() => onToggle(node.id)}
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center transition-colors',
              hasChildren ? 'hover:bg-charcoal-100 cursor-pointer' : 'cursor-default'
            )}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-charcoal-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-charcoal-500" />
              )
            ) : (
              <div className="w-2 h-2 rounded-full bg-charcoal-300" />
            )}
          </button>

          {/* Department Icon */}
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-charcoal-600" />
          </div>

          {/* Department Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/employee/operations/departments/${node.id}`}
                className="font-medium text-charcoal-900 hover:text-blue-600 transition-colors truncate"
              >
                {node.name}
              </Link>
              {node.code && (
                <span className="text-xs text-charcoal-400 font-mono">{node.code}</span>
              )}
              {node.status !== 'active' && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">{node.status}</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {node.head && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={node.head.avatar_url || undefined} />
                    <AvatarFallback className="bg-charcoal-100 text-[10px]">
                      {getInitials(node.head.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-charcoal-500">{node.head.full_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-charcoal-400">
                <Users className="w-3.5 h-3.5" />
                <span>{node.headcount}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Link href={`/employee/operations/departments/${node.id}`}>
            <Button variant="ghost" size="sm" className="text-charcoal-400 hover:text-charcoal-600">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-3">
            {node.children.map((child) => (
              <DepartmentTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                expanded={expanded}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrgChartPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')

  const { data: treeData, isLoading: treeLoading } = trpc.departments.getTree.useQuery({
    includeEmployees: false,
  })

  const { data: stats, isLoading: statsLoading } = trpc.departments.stats.useQuery()

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Transform tree data for rendering
  const transformedTree = treeData?.tree
    ? (treeData.tree as DepartmentNodeFromApi[]).map(transformNode)
    : []

  const expandAll = () => {
    if (!transformedTree.length) return
    const allIds = new Set<string>()
    const collectIds = (nodes: DepartmentNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id)
        if (node.children) collectIds(node.children)
      })
    }
    collectIds(transformedTree)
    setExpanded(allIds)
  }

  const collapseAll = () => {
    setExpanded(new Set())
  }

  const isLoading = treeLoading || statsLoading

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Organization Chart
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Visualize your company&apos;s organizational structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={expandAll} disabled={isLoading}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Link href="/employee/operations/departments">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Department
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Departments</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.total ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Active</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.active ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Network className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Employees</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.totalEmployees ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Avg. Size</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.avgSize ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Org Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Organization Structure</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                Tree View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
              {viewMode === 'tree' && (
                <>
                  <div className="w-px h-6 bg-charcoal-200 mx-1" />
                  <Button variant="ghost" size="sm" onClick={collapseAll}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={expandAll}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
            </div>
          ) : transformedTree.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-20 h-20 rounded-full bg-charcoal-100 flex items-center justify-center mb-8">
                <Network className="h-10 w-10 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                No Departments Yet
              </h3>
              <p className="text-body text-charcoal-500 text-center max-w-md mb-6">
                Create your first department to start building your organization chart.
              </p>
              <Link href="/employee/operations/departments">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Department
                </Button>
              </Link>
            </div>
          ) : viewMode === 'tree' ? (
            <div className="py-4">
              {transformedTree.map((node) => (
                <DepartmentTreeNode
                  key={node.id}
                  node={node}
                  expanded={expanded}
                  onToggle={toggleExpanded}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(treeData?.flat ?? []).map((dept) => (
                <Link
                  key={dept.id}
                  href={`/employee/operations/departments/${dept.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-charcoal-100 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-charcoal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">{dept.name}</p>
                      <p className="text-xs text-charcoal-500">
                        {dept.code && `${dept.code} • `}
                        Level {(dept.hierarchy_level ?? 0) + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={dept.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                      {dept.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-charcoal-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
