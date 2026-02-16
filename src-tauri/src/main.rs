// InTime Desktop Application
// Phase 3: Desktop & Phone Integration

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    WindowEvent,
};

// Commands that can be called from the frontend

/// Show a native notification
#[tauri::command]
fn show_notification(title: String, body: String) -> Result<(), String> {
    tauri::api::notification::Notification::new("com.intime.app")
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())
}

/// Open a URL in the default browser
#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    tauri::api::shell::open(&tauri::api::shell::Scope::default(), &url, None)
        .map_err(|e| e.to_string())
}

/// Initiate a phone call via system handler (tel: protocol)
#[tauri::command]
fn make_phone_call(phone_number: String) -> Result<(), String> {
    let tel_url = format!("tel:{}", phone_number.replace(" ", ""));
    tauri::api::shell::open(&tauri::api::shell::Scope::default(), &tel_url, None)
        .map_err(|e| e.to_string())
}

/// Copy text to clipboard
#[tauri::command]
fn copy_to_clipboard(text: String) -> Result<(), String> {
    // This is handled via the clipboard allowlist
    Ok(())
}

/// Get system information
#[tauri::command]
fn get_system_info() -> Result<serde_json::Value, String> {
    let info = serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "family": std::env::consts::FAMILY,
    });
    Ok(info)
}

/// Set window always on top
#[tauri::command]
fn set_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())
}

/// Minimize to system tray
#[tauri::command]
fn minimize_to_tray(window: tauri::Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

/// Flash the window (for notifications)
#[tauri::command]
fn request_attention(window: tauri::Window) -> Result<(), String> {
    window
        .request_user_attention(Some(tauri::UserAttentionType::Informational))
        .map_err(|e| e.to_string())
}

fn create_system_tray() -> SystemTray {
    let open = CustomMenuItem::new("open".to_string(), "Open InTime");
    let inbox = CustomMenuItem::new("inbox".to_string(), "Go to Inbox");
    let quick_add = CustomMenuItem::new("quick_add".to_string(), "Quick Add...");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(open)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(inbox)
        .add_item(quick_add)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            if let Some(window) = app.get_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "open" => {
                if let Some(window) = app.get_window("main") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            "inbox" => {
                if let Some(window) = app.get_window("main") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                    // Emit event to navigate to inbox
                    window.emit("navigate", "/employee/inbox").unwrap();
                }
            }
            "quick_add" => {
                if let Some(window) = app.get_window("main") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                    // Emit event to open command palette
                    window.emit("open-command-palette", ()).unwrap();
                }
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

fn main() {
    tauri::Builder::default()
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .invoke_handler(tauri::generate_handler![
            show_notification,
            open_external,
            make_phone_call,
            copy_to_clipboard,
            get_system_info,
            set_always_on_top,
            minimize_to_tray,
            request_attention,
        ])
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                // Hide instead of close when clicking X
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            // Register global shortcuts
            let handle = app.handle();

            // Cmd/Ctrl + Shift + I: Show/focus window
            tauri::api::global_shortcut::GlobalShortcutManager::register(
                &handle.global_shortcut_manager(),
                "CmdOrCtrl+Shift+I",
                move || {
                    if let Some(window) = handle.get_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                },
            )
            .ok();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
