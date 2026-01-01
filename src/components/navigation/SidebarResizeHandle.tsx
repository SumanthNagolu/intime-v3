'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSidebarUI, MIN_WIDTH, MAX_WIDTH } from '@/stores/sidebar-ui-store'

export function SidebarResizeHandle() {
  const setWidth = useSidebarUI((store) => store.setWidth)
  const [isDragging, setIsDragging] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    let animationFrameId: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      // Schedule width update on next frame (60fps throttle)
      animationFrameId = requestAnimationFrame(() => {
        // Calculate new width based on mouse X position
        const newWidth = e.clientX
        
        // Clamp between MIN and MAX
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
          setWidth(newWidth)
        } else if (newWidth < MIN_WIDTH) {
          setWidth(MIN_WIDTH)
        } else if (newWidth > MAX_WIDTH) {
          setWidth(MAX_WIDTH)
        }
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }

    // Add global listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isDragging, setWidth])

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize group',
        'hover:bg-gold-200 transition-colors duration-150',
        isDragging && 'bg-gold-400'
      )}
      role="separator"
      aria-label="Resize sidebar"
      aria-orientation="vertical"
    >
      {/* Wider invisible hit area for easier grabbing */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
      
      {/* Visual indicator on hover */}
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-1 h-12 rounded-full',
          'bg-gold-500 opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          isDragging && 'opacity-100'
        )}
      />
    </div>
  )
}

