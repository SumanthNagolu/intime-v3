/**
 * Tauri Bridge
 * Phase 3: Desktop & Phone
 *
 * TypeScript bindings for Tauri commands and events.
 * Falls back gracefully when running in browser mode.
 */

// ============================================
// Types
// ============================================

export interface TauriWindow {
  label: string
  title?: string
}

export interface SystemInfo {
  os: string
  arch: string
  family: string
}

// ============================================
// Environment Detection
// ============================================

/**
 * Check if running in Tauri desktop environment
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

/**
 * Check if running on macOS
 */
export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toLowerCase().includes('mac')
}

/**
 * Check if running on Windows
 */
export function isWindows(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toLowerCase().includes('win')
}

// ============================================
// Tauri Command Wrappers
// ============================================

/**
 * Invoke a Tauri command
 */
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    throw new Error('Not running in Tauri environment')
  }

  const { invoke: tauriInvoke } = await import('@tauri-apps/api/tauri')
  return tauriInvoke<T>(cmd, args)
}

/**
 * Show a native notification
 */
export async function showNotification(title: string, body: string): Promise<void> {
  if (!isTauri()) {
    // Fall back to web notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification(title, { body })
      }
    }
    return
  }

  await invoke('show_notification', { title, body })
}

/**
 * Open URL in default browser
 */
export async function openExternal(url: string): Promise<void> {
  if (!isTauri()) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  await invoke('open_external', { url })
}

/**
 * Make a phone call via system handler
 */
export async function makePhoneCall(phoneNumber: string): Promise<void> {
  if (!isTauri()) {
    // On web, use tel: protocol
    window.location.href = `tel:${phoneNumber.replace(/\s/g, '')}`
    return
  }

  await invoke('make_phone_call', { phoneNumber })
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!isTauri()) {
    await navigator.clipboard.writeText(text)
    return
  }

  const { writeText } = await import('@tauri-apps/api/clipboard')
  await writeText(text)
}

/**
 * Read text from clipboard
 */
export async function readFromClipboard(): Promise<string | null> {
  if (!isTauri()) {
    return navigator.clipboard.readText()
  }

  const { readText } = await import('@tauri-apps/api/clipboard')
  return readText()
}

/**
 * Get system information
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  if (!isTauri()) {
    return {
      os: navigator.platform,
      arch: 'unknown',
      family: 'web',
    }
  }

  return invoke<SystemInfo>('get_system_info')
}

/**
 * Set window always on top
 */
export async function setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  if (!isTauri()) return

  await invoke('set_always_on_top', { alwaysOnTop })
}

/**
 * Minimize window to system tray
 */
export async function minimizeToTray(): Promise<void> {
  if (!isTauri()) return

  await invoke('minimize_to_tray')
}

/**
 * Request user attention (flash window)
 */
export async function requestAttention(): Promise<void> {
  if (!isTauri()) return

  await invoke('request_attention')
}

// ============================================
// Window Management
// ============================================

/**
 * Close the current window
 */
export async function closeWindow(): Promise<void> {
  if (!isTauri()) return

  const { appWindow } = await import('@tauri-apps/api/window')
  await appWindow.close()
}

/**
 * Minimize the current window
 */
export async function minimizeWindow(): Promise<void> {
  if (!isTauri()) return

  const { appWindow } = await import('@tauri-apps/api/window')
  await appWindow.minimize()
}

/**
 * Maximize/restore the current window
 */
export async function toggleMaximize(): Promise<void> {
  if (!isTauri()) return

  const { appWindow } = await import('@tauri-apps/api/window')
  await appWindow.toggleMaximize()
}

/**
 * Set window title
 */
export async function setWindowTitle(title: string): Promise<void> {
  if (!isTauri()) {
    document.title = title
    return
  }

  const { appWindow } = await import('@tauri-apps/api/window')
  await appWindow.setTitle(title)
}

// ============================================
// Event System
// ============================================

type UnlistenFn = () => void

/**
 * Listen for Tauri events
 */
export async function listen<T>(
  event: string,
  handler: (payload: T) => void
): Promise<UnlistenFn> {
  if (!isTauri()) {
    // Create a custom event listener for web fallback
    const wrappedHandler = (e: CustomEvent<T>) => handler(e.detail)
    window.addEventListener(event as string, wrappedHandler as EventListener)
    return () => window.removeEventListener(event as string, wrappedHandler as EventListener)
  }

  const { listen: tauriListen } = await import('@tauri-apps/api/event')
  return tauriListen<T>(event, (e) => handler(e.payload))
}

/**
 * Emit a Tauri event
 */
export async function emit<T>(event: string, payload?: T): Promise<void> {
  if (!isTauri()) {
    window.dispatchEvent(new CustomEvent(event, { detail: payload }))
    return
  }

  const { emit: tauriEmit } = await import('@tauri-apps/api/event')
  await tauriEmit(event, payload)
}

// ============================================
// Global Shortcuts
// ============================================

/**
 * Register a global shortcut
 */
export async function registerShortcut(
  shortcut: string,
  handler: () => void
): Promise<UnlistenFn> {
  if (!isTauri()) {
    // Web fallback: use keyboard event listener
    const keydownHandler = (e: KeyboardEvent) => {
      const keys = shortcut.toLowerCase().split('+')
      const ctrl = keys.includes('cmdorctrl') || keys.includes('ctrl')
      const shift = keys.includes('shift')
      const alt = keys.includes('alt')
      const key = keys[keys.length - 1]

      if (
        (ctrl ? e.ctrlKey || e.metaKey : true) &&
        (shift ? e.shiftKey : true) &&
        (alt ? e.altKey : true) &&
        e.key.toLowerCase() === key
      ) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', keydownHandler)
    return () => window.removeEventListener('keydown', keydownHandler)
  }

  const { register, unregister } = await import('@tauri-apps/api/globalShortcut')
  await register(shortcut, handler)
  return () => unregister(shortcut)
}

/**
 * Unregister all global shortcuts
 */
export async function unregisterAllShortcuts(): Promise<void> {
  if (!isTauri()) return

  const { unregisterAll } = await import('@tauri-apps/api/globalShortcut')
  await unregisterAll()
}

// ============================================
// File Dialog
// ============================================

export interface OpenDialogOptions {
  multiple?: boolean
  directory?: boolean
  filters?: Array<{ name: string; extensions: string[] }>
  defaultPath?: string
  title?: string
}

/**
 * Open file dialog
 */
export async function openFileDialog(
  options?: OpenDialogOptions
): Promise<string | string[] | null> {
  if (!isTauri()) {
    // Web fallback using file input
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = options?.multiple ?? false

      if (options?.filters) {
        input.accept = options.filters
          .flatMap((f) => f.extensions.map((ext) => `.${ext}`))
          .join(',')
      }

      input.onchange = () => {
        if (!input.files || input.files.length === 0) {
          resolve(null)
          return
        }

        const files = Array.from(input.files).map((f) => f.name)
        resolve(options?.multiple ? files : files[0])
      }

      input.click()
    })
  }

  const { open } = await import('@tauri-apps/api/dialog')
  return open({
    multiple: options?.multiple,
    directory: options?.directory,
    filters: options?.filters,
    defaultPath: options?.defaultPath,
    title: options?.title,
  })
}

/**
 * Save file dialog
 */
export async function saveFileDialog(options?: {
  filters?: Array<{ name: string; extensions: string[] }>
  defaultPath?: string
  title?: string
}): Promise<string | null> {
  if (!isTauri()) {
    // Web doesn't have a save dialog equivalent
    return null
  }

  const { save } = await import('@tauri-apps/api/dialog')
  return save({
    filters: options?.filters,
    defaultPath: options?.defaultPath,
    title: options?.title,
  })
}
