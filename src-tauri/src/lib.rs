/// ダブルクリック起動時に OS から渡された .mandalaya ファイルパスを返す。
/// exists() チェックは行わない（フロントエンド側でエラーハンドリングする）。
#[tauri::command]
fn get_startup_file() -> Option<String> {
    std::env::args()
        .skip(1)
        .find_map(|arg| {
            let lower = arg.to_lowercase();
            // 通常のファイルパス: C:\path\to\file.mandalaya
            if lower.ends_with(".mandalaya") {
                return Some(arg);
            }
            // file:// URL: file:///C:/path/to/file.mandalaya
            if lower.starts_with("file://") && lower.ends_with(".mandalaya") {
                let path = arg
                    .trim_start_matches("file:///")
                    .trim_start_matches("file://")
                    .replace('/', "\\");
                return Some(path);
            }
            None
        })
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![get_startup_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
