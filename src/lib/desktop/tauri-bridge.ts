/**
 * Tauri Bridge
 * Phase 3: Desktop & Phone
 *
 * TypeScript bindings for Tauri commands and events.
 * Falls back gracefully when running in browser mode.
 *
 * NOTE: All Tauri APIs are accessed via window.__TAURI__ at runtime
 * to avoid bundler issues (no @tauri-apps/api import needed for web builds).
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

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toLowerCase().includes('mac')
}

export function isWindows(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toLowerCase().includes('win')
}

// Runtime access to Tauri globals (avoids bundler resolution)
function getTauri(): any {
  if (!isTauri()) return null
  return (window as any).__TAURI__
}

// ============================================
// Tauri Command Wrappers
// ============================================

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const tauri = getTauri()
  if (!tauri?.invoke) throw new Error('Not running in Tauri environment')
  return tauri.invoke(cmd, args)
}

export async function showNotification(title: string, body: string): Promise<void> {
  if (!isTauri()) {
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

export async function openExternal(url: string): Promise<void> {
  if (!isTauri()) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  await invoke('open_external', { url })
}

export async function makePhoneCall(phoneNumber: string): Promise<void> {
  if (!isTauri()) {
    window.location.href = `tel:${phoneNumber.replace(/\s/g, '')}`
    return
  }
  await invoke('make_phone_call', { phoneNumber })
}

export async function copyToClipboard(text: string): Promise<void> {
  if (!isTauri()) {
    await navigator.clipboard.writeText(text)
    return
  }
  const tauri = getTauri()
  await tauri.clipboard.writeText(text)
}

export async function readFromClipboard(): Promise<string | null> {
  if (!isTauri()) {
    return navigator.clipboard.readText()
  }
  const tauri = getTauri()
  return tauri.clipboard.readText()
}

export async function getSystemInfo(): Promise<SystemInfo> {
  if (!isTauri()) {
    return { os: navigator.platform, arch: 'unknown', family: 'web' }
  }
  return invoke<SystemInfo>('get_system_info')
}

export async function setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  if (!isTauri()) return
  await invoke('set_always_on_top', { alwaysOnTop })
}

export async function minimizeToTray(): Promise<void> {
  if (!isTauri()) return
  await invoke('minimize_to_tray')
}

export async function requestAttention(): Promise<void> {
  if (!isTauri()) return
  await invoke('request_attention')
}

// ============================================
// Window Management
// ============================================

export async function closeWindow(): Promise<void> {
  if (!isTauri()) return
  const tauri = getTauri()
  await tauri.window.appWindow.close()
}

export async function minimizeWindow(): Promise<void> {
  if (!isTauri()) return
  const tauri = getTauri()
  await tauri.window.appWindow.minimize()
}

export async function toggleMaximize(): Promise<void> {
  if (!isTauri()) return
  const tauri = getTauri()
  await tauri.window.appWindow.toggleMaximize()
}

export async function setWindowTitle(title: string): Promise<void> {
  if (!isTauri()) {
    document.title = title
    return
  }
  const tauri = getTauri()
  await tauri.window.appWindow.setTitle(title)
}

// ============================================
// Event System
// ============================================

type UnlistenFn = () => void

export async function listen<T>(
  event: string,
  handler: (payload: T) => void
): Promise<UnlistenFn> {
  if (!isTauri()) {
    const wrappedHandler = (e: CustomEvent<T>) => handler(e.detail)
    window.addEventListener(event as string, wrappedHandler as EventListener)
    return () => window.removeEventListener(event as string, wrappedHandler as EventListener)
  }
  const tauri = getTauri()
  return tauri.event.listen(event, (e: any) => handler(e.payload))
}

export async function emit<T>(event: string, payload?: T): Promise<void> {
  if (!isTauri()) {
    window.dispatchEvent(new CustomEvent(event, { detail: payload }))
    return
  }
  const tauri = getTauri()
  await tauri.event.emit(event, payload)
}

// ============================================
// Global Shortcuts
// ============================================

export async function registerShortcut(
  shortcut: string,
  handler: () => void
): Promise<UnlistenFn> {
  if (!isTauri()) {
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
  const tauri = getTauri()
  await tauri.globalShortcut.register(shortcut, handler)
  return () => tauri.globalShortcut.unregister(shortcut)
}

export async function unregisterAllShortcuts(): Promise<void> {
  if (!isTauri()) return
  const tauri = getTauri()
  await tauri.globalShortcut.unregisterAll()
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

export async function openFileDialog(
  options?: OpenDialogOptions
): Promise<string | string[] | null> {
  if (!isTauri()) {
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
  const tauri = getTauri()
  return tauri.dialog.open({
    multiple: options?.multiple,
    directory: options?.directory,
    filters: options?.filters,
    defaultPath: options?.defaultPath,
    title: options?.title,
  })
}

export async function saveFileDialog(options?: {
  filters?: Array<{ name: string; extensions: string[] }>
  defaultPath?: string
  title?: string
}): Promise<string | null> {
  if (!isTauri()) return null
  const tauri = getTauri()
  return tauri.dialog.save({
    filters: options?.filters,
    defaultPath: options?.defaultPath,
    title: options?.title,
  })
}
