/**
 * Desktop Module
 * Phase 3: Desktop & Phone
 *
 * Exports all desktop/Tauri-related functionality.
 */

export {
  isTauri,
  isMacOS,
  isWindows,
  showNotification,
  openExternal,
  makePhoneCall,
  copyToClipboard,
  readFromClipboard,
  getSystemInfo,
  setAlwaysOnTop,
  minimizeToTray,
  requestAttention,
  closeWindow,
  minimizeWindow,
  toggleMaximize,
  setWindowTitle,
  listen,
  emit,
  registerShortcut,
  unregisterAllShortcuts,
  openFileDialog,
  saveFileDialog,
  type TauriWindow,
  type SystemInfo,
  type OpenDialogOptions,
} from './tauri-bridge'
