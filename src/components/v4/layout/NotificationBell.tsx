'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4Inbox } from '@/lib/v4/hooks/useV4Data'
import { useV4ActivityMutations } from '@/lib/v4/hooks/useV4Mutations'

export function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { items, isLoading, refetch } = useV4Inbox()
  const { completeActivity } = useV4ActivityMutations()

  // Filter for pending items
  const pendingItems = items.filter(item => !item.isCompleted)
  const unreadCount = pendingItems.length

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item: any) => {
    setIsOpen(false)
    // Navigate based on entity type
    if (item.entityType === 'job') router.push(`/jobs?id=${item.entityId}`)
    else if (item.entityType === 'candidate') router.push(`/candidates?id=${item.entityId}`)
    else if (item.entityType === 'account') router.push(`/accounts?id=${item.entityId}`)
    else if (item.entityType === 'submission') router.push(`/jobs?submissionId=${item.entityId}`)
  }

  const handleMarkDone = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await completeActivity({ id })
    refetch()
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-md text-[var(--linear-text-muted)] hover:text-[var(--linear-text-primary)] hover:bg-[var(--linear-surface-hover)] transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--linear-bg)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-full top-0 ml-2 w-80 max-h-[400px] overflow-hidden rounded-lg border border-[var(--linear-border)] bg-[var(--linear-surface)] shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--linear-border-subtle)]">
            <h3 className="text-sm font-medium text-[var(--linear-text-primary)]">Notifications</h3>
            <span className="text-xs text-[var(--linear-text-muted)]">{unreadCount} pending</span>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[100px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-20 text-[var(--linear-text-muted)] text-sm">
                Loading...
              </div>
            ) : pendingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-[var(--linear-text-muted)]">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm">All caught up!</span>
              </div>
            ) : (
              <div className="divide-y divide-[var(--linear-border-subtle)]">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="flex items-start gap-3 p-3 hover:bg-[var(--linear-surface-hover)] cursor-pointer transition-colors group"
                  >
                    <div className={cn(
                      "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                      item.priority === 'urgent' ? "bg-red-500" :
                      item.priority === 'high' ? "bg-orange-500" :
                      "bg-blue-500"
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--linear-text-primary)] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--linear-text-muted)] line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[var(--linear-text-muted)]">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{item.entityType}</span>
                      </div>
                    </div>

                    {item.type === 'activity' && (
                      <button
                        onClick={(e) => handleMarkDone(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--linear-bg)] rounded text-[var(--linear-text-muted)] hover:text-green-500 transition-all"
                        title="Mark as done"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-[var(--linear-border-subtle)] bg-[var(--linear-bg)]">
            <button
              onClick={() => {
                router.push('/inbox')
                setIsOpen(false)
              }}
              className="w-full py-1.5 text-xs text-center text-[var(--linear-text-muted)] hover:text-[var(--linear-text-primary)] hover:bg-[var(--linear-surface-hover)] rounded transition-colors"
            >
              View all in Inbox
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
