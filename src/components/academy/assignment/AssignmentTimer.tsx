'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'

interface AssignmentTimerProps {
  assignmentId: string
  exerciseId: string | null
  onTick: (assignmentId: string, exerciseId: string, seconds: number) => void
  totalTimeSpent: number
}

export function AssignmentTimer({ assignmentId, exerciseId, onTick, totalTimeSpent }: AssignmentTimerProps) {
  const [elapsed, setElapsed] = useState(totalTimeSpent)
  const lastTickRef = useRef(Date.now())
  const exerciseIdRef = useRef(exerciseId)
  exerciseIdRef.current = exerciseId

  useEffect(() => {
    setElapsed(totalTimeSpent)
  }, [totalTimeSpent])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const delta = Math.round((now - lastTickRef.current) / 1000)
      lastTickRef.current = now

      if (delta > 0 && delta < 60 && exerciseIdRef.current) {
        setElapsed((prev) => prev + delta)
        onTick(assignmentId, exerciseIdRef.current, delta)
      }
    }, 10_000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [assignmentId, onTick])

  const hrs = Math.floor(elapsed / 3600)
  const mins = Math.floor((elapsed % 3600) / 60)
  const secs = elapsed % 60

  const timeStr = hrs > 0
    ? `${hrs}h ${mins}m`
    : `${mins}m ${secs}s`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: 'var(--m-bg-warm)',
        border: '1px solid var(--m-border)',
        borderRadius: 'var(--m-radius-md)',
      }}
    >
      <Clock className="w-4 h-4" style={{ color: 'var(--m-text-muted)' }} />
      <div>
        <div
          className="m-display"
          style={{ fontSize: 18, fontWeight: 600, color: 'var(--m-text-primary)', lineHeight: 1 }}
        >
          {timeStr}
        </div>
        <div style={{ fontSize: 10, color: 'var(--m-text-muted)', marginTop: 2 }}>
          time spent
        </div>
      </div>
    </div>
  )
}
