import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import {
    Activity, ArrowRight, UserCircle, Calendar,
    Mail, Phone, FileText, CheckCircle2, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface KanbanCardProps {
    id: string
    title: string
    type: string
    priority: string
    status: string
    dueDate?: string | null
    assignee?: {
        name: string
        avatarUrl?: string | null
    }
}

export function KanbanCard({
    id,
    title,
    type,
    priority,
    status,
    dueDate,
    assignee,
}: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'email': return <Mail className="h-3.5 w-3.5" />
            case 'call': return <Phone className="h-3.5 w-3.5" />
            case 'meeting': return <Calendar className="h-3.5 w-3.5" />
            case 'task': return <CheckCircle2 className="h-3.5 w-3.5" />
            default: return <Activity className="h-3.5 w-3.5" />
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative p-4 mb-3 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing",
                // Cinematic Glass Effect
                "bg-white/60 backdrop-blur-md shadow-sm border-white/50",
                "hover:bg-white/80 hover:shadow-lg hover:border-white/80 hover:-translate-y-1",
                isDragging && "opacity-50 scale-105 shadow-2xl rotate-2 z-50 ring-2 ring-forest-500/50"
            )}
        >
            {/* Priority Indicator Line */}
            <div className={cn(
                "absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
                priority === 'urgent' ? "bg-red-500" :
                    priority === 'high' ? "bg-amber-500" :
                        priority === 'normal' ? "bg-sky-500" : "bg-slate-300"
            )} />

            <div className="pl-3">
                {/* Header: Type & Action */}
                <div className="flex items-center justify-between mb-2">
                    <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold tracking-wider border-0 bg-forest-50 text-forest-700 px-2 py-0.5"
                    >
                        {getTypeIcon(type)}
                        <span className="ml-1.5">{type}</span>
                    </Badge>

                    {dueDate && (
                        <span className={cn(
                            "text-[10px] font-medium flex items-center gap-1",
                            new Date(dueDate) < new Date() ? "text-red-600" : "text-slate-500"
                        )}>
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(dueDate), { addSuffix: true })}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-charcoal-900 mb-3 leading-snug line-clamp-2 group-hover:text-forest-700 transition-colors">
                    {title}
                </h4>

                {/* Footer: Assignee & Priority */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center overflow-hidden">
                            {assignee?.avatarUrl ? (
                                <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[9px] font-bold text-slate-600">
                                    {assignee?.name?.substring(0, 2).toUpperCase() || 'UN'}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-slate-500 truncate max-w-[80px]">
                            {assignee?.name || 'Unassigned'}
                        </span>
                    </div>

                    {/* Hover Action */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-forest-50 text-forest-600 flex items-center justify-center">
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
