'use client'

import * as React from 'react'
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    closestCorners,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    MoreHorizontal, Plus, Calendar, UserCircle,
    CheckCircle2, Clock, AlertCircle, Search, Filter
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { TeamEntityActivity } from '@/types/workspace'
import { format } from 'date-fns'

interface TeamBoardSectionProps {
    activities: TeamEntityActivity[]
    onActivityUpdate?: (id: string, updates: Partial<TeamEntityActivity>) => Promise<void>
}

type BoardColumnId = 'todo' | 'in_progress' | 'review' | 'done'

interface BoardColumn {
    id: BoardColumnId
    title: string
    color: string
}

const COLUMNS: BoardColumn[] = [
    { id: 'todo', title: 'To Do', color: 'bg-charcoal-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-amber-100' },
    { id: 'done', title: 'Done', color: 'bg-success-100' },
]

// Map activity status to board columns
const getColumnId = (status: string): BoardColumnId => {
    switch (status.toLowerCase()) {
        case 'completed': return 'done'
        case 'waiting': return 'review'
        case 'in_progress':
        case 'ip': return 'in_progress'
        default: return 'todo'
    }
}

// Map board column back to activity status suffix
const getStatusFromColumn = (colId: BoardColumnId): string => {
    switch (colId) {
        case 'done': return 'completed'
        case 'review': return 'waiting'
        case 'in_progress': return 'in_progress'
        default: return 'open'
    }
}

export function TeamBoardSection({ activities, onActivityUpdate }: TeamBoardSectionProps) {
    // Local state for optimistic updates
    const [items, setItems] = React.useState<TeamEntityActivity[]>(activities)
    const [activeId, setActiveId] = React.useState<string | null>(null)
    const [searchQuery, setSearchQuery] = React.useState('')

    // Update local state when prop changes
    React.useEffect(() => {
        setItems(activities)
    }, [activities])

    // Filter items
    const filteredItems = React.useMemo(() => {
        return items.filter(item =>
            item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.accountName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [items, searchQuery])

    // Group items by column
    const columns = React.useMemo(() => {
        const cols: Record<BoardColumnId, TeamEntityActivity[]> = {
            todo: [],
            in_progress: [],
            review: [],
            done: [],
        }
        filteredItems.forEach(item => {
            const colId = getColumnId(item.status)
            if (cols[colId]) {
                cols[colId].push(item)
            } else {
                cols.todo.push(item) // Fallback
            }
        })
        return cols
    }, [filteredItems])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Check if dropping over a column container directly
        const overContainerId = over.data.current?.sortable?.containerId || overId

        // Find containers (columns)
        const activeItem = items.find(i => i.id === activeId)
        const overItem = items.find(i => i.id === overId)

        if (!activeItem) return

        const activeContainer = getColumnId(activeItem.status)
        const overContainer = (Object.keys(columns).includes(overContainerId)
            ? overContainerId
            : overItem
                ? getColumnId(overItem.status)
                : null) as BoardColumnId | null

        if (!overContainer || activeContainer === overContainer) {
            return
        }

        // Only move visually for now, actual update is on DragEnd
        setItems((prev) => {
            return prev.map(item => {
                if (item.id === activeId) {
                    return { ...item, status: getStatusFromColumn(overContainer) }
                }
                return item
            })
        })
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeItem = items.find(i => i.id === activeId)
        if (!activeItem) return

        // Determine target status
        let newStatus = activeItem.status

        // If dropped on a container (column)
        if (Object.keys(columns).includes(overId)) {
            newStatus = getStatusFromColumn(overId as BoardColumnId)
        } else {
            // Dropped on another item
            const overItem = items.find(i => i.id === overId)
            if (overItem) {
                newStatus = overItem.status // Take status of the item we dropped on
            }
        }

        // Check if status actually changed
        if (activeItem.status !== newStatus) {
            // Optimistic update
            setItems((prev) => prev.map(item =>
                item.id === activeId ? { ...item, status: newStatus } : item
            ))

            // Trigger API update
            if (onActivityUpdate) {
                await onActivityUpdate(activeId, { status: newStatus })
            }
        }
    }

    const activeItem = activeId ? items.find(i => i.id === activeId) : null

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
            {/* Board Controls */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-charcoal-400" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9 w-[280px] bg-white border-charcoal-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-charcoal-100 flex items-center justify-center text-xs font-medium text-charcoal-600">
                                U{i}
                            </div>
                        ))}
                        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full ml-2 border-dashed border-charcoal-300 ml-4">
                            <Plus className="h-4 w-4 text-charcoal-500" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 text-charcoal-600">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Button className="gap-2 bg-charcoal-900 text-white hover:bg-charcoal-800">
                        <Plus className="h-4 w-4" />
                        New Issue
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map((col) => (
                        <BoardColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            items={columns[col.id]}
                            color={col.color}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: { opacity: '0.4' },
                        },
                    }),
                }}>
                    {activeItem ? <TaskCard item={activeItem} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}

interface BoardColumnProps {
    id: BoardColumnId
    title: string
    items: TeamEntityActivity[]
    color: string
}

function BoardColumn({ id, title, items, color }: BoardColumnProps) {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: 'Column',
        }
    })

    return (
        <div ref={setNodeRef} className="flex flex-col w-[350px] min-w-[350px] rounded-xl bg-charcoal-50/50 border border-charcoal-100/50">
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-transparent z-10">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-charcoal-700 uppercase tracking-wide">{title}</h3>
                    <Badge variant="secondary" className="bg-charcoal-200/50 text-charcoal-600 border-0 h-5 px-1.5 min-w-[20px] justify-center">
                        {items.length}
                    </Badge>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-charcoal-400 hover:text-charcoal-600">
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-charcoal-400 hover:text-charcoal-600">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Cards Area */}
            <ScrollArea className="flex-1 px-3 pb-3">
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3 min-h-[100px]">
                        {items.map((item) => (
                            <TaskCard key={item.id} item={item} />
                        ))}
                    </div>
                </SortableContext>
            </ScrollArea>
        </div>
    )
}

interface TaskCardProps {
    item: TeamEntityActivity
    isOverlay?: boolean
}

function TaskCard({ item, isOverlay }: TaskCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: 'Task',
            item,
        },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="opacity-30 h-[140px] rounded-lg bg-charcoal-100 border-2 border-dashed border-charcoal-200" />
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative flex flex-col gap-3 p-4 rounded-lg bg-white border border-charcoal-200/60 shadow-sm transition-all hover:shadow-elevation-sm cursor-grab active:cursor-grabbing",
                isOverlay && "shadow-elevation-md rotate-2 scale-105"
            )}
        >
            {/* Header: Title and Menu */}
            <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-medium text-charcoal-900 leading-snug line-clamp-2">
                    {item.subject}
                </p>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4 text-charcoal-400" />
                </Button>
            </div>

            {/* Status Tags / Metadata */}
            <div className="flex flex-wrap gap-2">
                {item.priority && (
                    <Badge
                        variant="outline"
                        className={cn(
                            "h-5 px-1.5 text-[10px] font-medium border-0",
                            item.priority === 'high' ? "bg-error-50 text-error-700" :
                                item.priority === 'medium' ? "bg-amber-50 text-amber-700" :
                                    "bg-charcoal-100 text-charcoal-600"
                        )}
                    >
                        {item.priority}
                    </Badge>
                )}
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium bg-blue-50 text-blue-700 border-0">
                    {item.type}
                </Badge>
            </div>

            {/* Footer: Due Date and Assignee */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
                    {item.dueDate ? (
                        <>
                            <Calendar className={cn(
                                "h-3.5 w-3.5",
                                new Date(item.dueDate) < new Date() ? "text-error-500" : "text-charcoal-400"
                            )} />
                            <span className={cn(
                                new Date(item.dueDate) < new Date() && "text-error-600 font-medium"
                            )}>
                                {format(new Date(item.dueDate), 'MMM d')}
                            </span>
                        </>
                    ) : (
                        <span className="text-charcoal-400 text-[10px] italic">No due date</span>
                    )}
                </div>

                <div className="flex items-center -space-x-1.5">
                    {item.assignedTo ? (
                        <Avatar className="h-6 w-6 border-2 border-white ring-1 ring-charcoal-100">
                            <AvatarFallback className="text-[9px] bg-charcoal-100 text-charcoal-600">
                                {item.assignedTo.name?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-6 w-6 rounded-full border border-dashed border-charcoal-300 flex items-center justify-center">
                            <UserCircle className="h-4 w-4 text-charcoal-300" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
