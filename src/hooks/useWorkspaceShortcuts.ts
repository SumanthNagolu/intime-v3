import { useEffect } from 'react'
import { toast } from 'sonner'

interface ShortcutConfig {
  key: string
  action: () => void
  description: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
}

export function useWorkspaceShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrlKey === e.ctrlKey
        const metaMatch = !!shortcut.metaKey === e.metaKey
        const shiftMatch = !!shortcut.shiftKey === e.shiftKey

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
