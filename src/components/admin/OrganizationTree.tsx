'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Building2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupNode {
  id: string
  name: string
  groupType: string
  children: GroupNode[]
  memberCount?: number
}

interface OrganizationTreeProps {
  organization: {
    id: string
    name: string
  }
  groups: Array<{
    id: string
    name: string
    code: string | null
    groupType: string
    parentGroupId: string | null
    hierarchyLevel: number
    hierarchyPath: string | null
    isActive: boolean
    _count?: { members: number }
  }>
}

const GROUP_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  root: Building2,
  division: Building2,
  branch: Building2,
  team: Users,
  satellite_office: Building2,
  producer: Users,
}

export function OrganizationTree({ organization, groups }: OrganizationTreeProps) {
  const pathname = usePathname()

  // Build tree from flat groups list
  const buildTree = (): GroupNode => {
    const groupMap = new Map<string | null, typeof groups>()

    // Group by parent_id
    groups.forEach(group => {
      const parentId = group.parentGroupId
      if (!groupMap.has(parentId)) {
        groupMap.set(parentId, [])
      }
      groupMap.get(parentId)!.push(group)
    })

    // Find root group
    const rootGroup = groups.find(g => g.groupType === 'root')

    // Recursive build
    const buildNode = (group: typeof groups[0]): GroupNode => ({
      id: group.id,
      name: group.name,
      groupType: group.groupType,
      memberCount: group._count?.members,
      children: (groupMap.get(group.id) || [])
        .sort((a, b) => a.hierarchyLevel - b.hierarchyLevel || a.name.localeCompare(b.name))
        .map(buildNode)
    })

    // If we have a root group, use it
    if (rootGroup) {
      return buildNode(rootGroup)
    }

    // Fallback: use organization as root
    return {
      id: organization.id,
      name: organization.name,
      groupType: 'root',
      children: (groupMap.get(null) || [])
        .sort((a, b) => a.hierarchyLevel - b.hierarchyLevel || a.name.localeCompare(b.name))
        .map(buildNode)
    }
  }

  const tree = buildTree()

  return (
    <div className="py-2">
      <TreeNode
        node={tree}
        pathname={pathname}
        level={0}
      />
    </div>
  )
}

interface TreeNodeProps {
  node: GroupNode
  pathname: string
  level: number
}

function TreeNode({ node, pathname, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node.children.length > 0
  const isSelected = pathname === `/employee/admin/groups/${node.id}`
  const Icon = GROUP_TYPE_ICONS[node.groupType] || Building2

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-sm transition-colors duration-200',
          'hover:bg-charcoal-50',
          isSelected && 'bg-gold-50 text-gold-700 font-medium'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="flex items-center justify-center w-6 h-6 hover:bg-charcoal-100 rounded transition-colors cursor-pointer"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}

        <Link
          href={`/employee/admin/groups/${node.id}`}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <Icon className={cn(
            "h-4 w-4 flex-shrink-0",
            node.groupType === 'root' ? 'text-gold-600' : 'text-charcoal-400'
          )} />

          <span className="text-sm truncate">{node.name}</span>

          {node.memberCount !== undefined && node.memberCount > 0 && (
            <span className="text-xs text-charcoal-400 flex-shrink-0">{node.memberCount}</span>
          )}
        </Link>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
