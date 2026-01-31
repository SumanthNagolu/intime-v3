'use client'

import * as React from 'react'
import { GenericKanban, type KanbanColumnDef } from '@/components/ui/kanban/GenericKanban'
import { KanbanCard } from './KanbanCard'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import type { TeamEntityActivity } from '@/types/workspace'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
    activities: TeamEntityActivity[]
}

export function KanbanBoard({ activities: initialActivities }: KanbanBoardProps) {
    const [items, setItems] = React.useState<TeamEntityActivity[]>(initialActivities)

    // Sync with props
    React.useEffect(() => {
        setItems(initialActivities)
    }, [initialActivities])

    const utils = trpc.useUtils()
    const updateStatus = trpc.activities.updateStatus.useMutation({
        onSuccess: () => {
            toast.success('Status updated')
        },
        onError: (err) => {
            toast.error('Failed to update status')
            console.error(err)
            // Revert logic could be added here
        }
    })

    const columns: KanbanColumnDef[] = [
        { id: 'todo', title: 'To Do', className: 'bg-white/40 border border-white/60' },
        { id: 'in_progress', title: 'In Progress', className: 'bg-white/40 border border-white/60' },
        { id: 'review', title: 'Review', className: 'bg-white/40 border border-white/60' },
        { id: 'done', title: 'Done', className: 'bg-white/40 border border-white/60' },
    ]

    const handleDragEnd = (itemId: string, newColumnId: string) => {
        // Map column ID back to status
        let newStatus = 'open'
        if (newColumnId === 'todo') newStatus = 'open'
        else if (newColumnId === 'in_progress') newStatus = 'in_progress'
        else if (newColumnId === 'review') newStatus = 'review'
        else if (newColumnId === 'done') newStatus = 'completed'

        // Optimistic Update
        setItems(items => items.map(i =>
            i.id === itemId ? { ...i, status: newStatus as any } : i
        ))

        // API Call
        updateStatus.mutate({
            id: itemId,
            status: newStatus
        })
    }

    const renderCard = (card: TeamEntityActivity, isOverlay?: boolean) => (
        <KanbanCard
            id={card.id}
            title={card.subject}
            type={card.activityType}
            priority={card.priority}
            status={card.status}
            dueDate={card.dueDate}
            assignee={card.performedBy ? {
                name: card.performedBy.full_name,
                avatarUrl: card.performedBy.avatar_url
            } : undefined}
        />
    )

    const renderColumnHeader = (col: KanbanColumnDef, count: number) => {
        let color = 'bg-slate-500'
        if (col.id === 'in_progress') color = 'bg-blue-500'
        if (col.id === 'review') color = 'bg-purple-500'
        if (col.id === 'done') color = 'bg-emerald-500'

        return (
            <div className="p-4 flex items-center justify-between border-b border-white/50">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", color)} />
                    <h3 className="font-semibold text-sm text-charcoal-900">{col.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/60 text-xs font-medium text-slate-500 shadow-sm">
                        {count}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    const renderColumnFooter = (col: KanbanColumnDef) => (
        <div className="p-3 border-t border-white/50">
            <Button
                variant="ghost"
                className="w-full justify-start text-xs text-slate-500 hover:text-forest-600 hover:bg-forest-50/50"
            >
                <Plus className="w-3 h-3 mr-2" />
                Add Task
            </Button>
        </div>
    )

    const groupBy = (item: TeamEntityActivity) => {
        if (['scheduled', 'open'].includes(item.status)) return 'todo'
        if (item.status === 'in_progress') return 'in_progress'
        if (['review', 'pending_review'].includes(item.status)) return 'review'
        if (item.status === 'completed') return 'done'
        return 'todo'
    }

    return (
        <GenericKanban
            items={items}
            columns={columns}
            groupBy={groupBy}
            onDragEnd={handleDragEnd}
            renderCard={renderCard}
            renderColumnHeader={renderColumnHeader}
            renderColumnFooter={renderColumnFooter}
            columnClassName="rounded-2xl shadow-sm backdrop-blur-sm"
        />
    )
}
