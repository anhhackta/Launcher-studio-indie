#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::{Path, PathBuf};
use std::process::Command;
use std::fs::{self, File};
use std::io::{Write, Read};
use std::time::{SystemTime, UNIX_EPOCH, Instant};
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, Manager, AppHandle};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use winreg::enums::*;
use winreg::RegKey;
use sha2::{Sha256, Digest};

// ============================================
// Data Structures - Commercial Grade v2.0
// ============================================

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SystemRequirements {
    os: Option<String>,
    ram: Option<String>,
    storage: Option<String>,
    gpu: Option<String>,
    cpu: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GameInfo {
    id: String,
    name: String,
    version: String,
    #[serde(default)]
    category_id: Option<String>,
    status: String,
    download_url: Option<String>,
    #[serde(default)]
    download_checksum: Option<String>,
    executable_path: Option<String>,
    image_url: String,
    logo_url: Option<String>,
    #[serde(default)]
    banner_url: Option<String>,
    background_id: String,
    description: String,
    #[serde(default)]
    description_long: Option<String>,
    file_size: Option<String>,
    #[serde(default)]
    file_size_bytes: Option<u64>,
    release_date: Option<String>,
    #[serde(default)]
    last_updated: Option<String>,
    changelog: Option<String>,
    #[serde(default)]
    developer: Option<String>,
    #[serde(default)]
    publisher: Option<String>,
    #[serde(default)]
    tags: Option<Vec<String>>,
    #[serde(default)]
    screenshots: Option<Vec<String>>,
    #[serde(default)]
    trailer_url: Option<String>,
    #[serde(default)]
    system_requirements: Option<SystemRequirements>,
    is_coming_soon: bool,
    repair_enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct NewsItem {
    id: String,
    title: String,
    content: String,
    image_url: Option<String>,
    date: String,
    #[serde(rename = "type")]
    news_type: String,
    game_id: Option<String>,
    pinned: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Category {
    id: String,
    name: String,
    icon: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GameManifest {
    manifest_version: String,
    last_updated: String,
    #[serde(default)]
    manifest_signature: Option<String>,
    launcher_config: LauncherConfig,
    #[serde(default)]
    news: Vec<NewsItem>,
    #[serde(default)]
    categories: Vec<Category>,
    backgrounds: HashMap<String, Background>,
    games: Vec<GameInfo>,
    social_links: Vec<SocialLink>,
    settings: ManifestSettings,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LauncherConfig {
    current_version: String,
    update_url: String,
    #[serde(default)]
    update_checksum: Option<String>,
    changelog: String,
    auto_check_updates: bool,
    check_interval_hours: i32,
    #[serde(default)]
    min_supported_version: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Background {
    id: String,
    name: String,
    image_url: String,
    active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SocialLink {
    id: String,
    icon: String,
    url: String,
    tooltip: String,
    active: bool,
    action: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ManifestSettings {
    startup_with_windows: bool,
    minimize_to_tray: bool,
    auto_check_updates: bool,
    download_path: String,
    max_backups: i32,
    #[serde(default)]
    max_concurrent_downloads: Option<i32>,
    #[serde(default)]
    download_speed_limit: Option<i32>,
    #[serde(default)]
    verify_after_download: Option<bool>,
    #[serde(default)]
    theme: Option<String>,
    #[serde(default)]
    language: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateInfo {
    current_version: String,
    latest_version: String,
    needs_update: bool,
    update_url: Option<String>,
    update_checksum: Option<String>,
    changelog: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct RepairResult {
    success: bool,
    repaired_files: Vec<String>,
    errors: Vec<String>,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct IntegrityResult {
    valid: bool,
    checked_files: i32,
    corrupted_files: Vec<String>,
    missing_files: Vec<String>,
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct NetworkStatus {
    is_online: bool,
    message: String,
    latency_ms: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LocalManifest {
    manifest: GameManifest,
    last_updated: u64,
    is_offline: bool,
}

#[derive(Clone, Serialize)]
struct DownloadProgress {
    game_id: String,
    progress: f64,
    speed: String,
    downloaded: String,
    total: String,
    eta: Option<String>,
    status: String,
    error_message: Option<String>,
}

// ============================================
// Global State
// ============================================

static mut LOCAL_MANIFEST: Option<LocalManifest> = None;

// ============================================
// Utility Functions
// ============================================

async fn check_network() -> bool {
    let manifest_url = "https://pub-72a5a57231ae489cb74409bdc120cb93.r2.dev/manifest.json";
    match reqwest::get(manifest_url).await {
        Ok(response) => response.status().is_success(),
        Err(_) => {
            match reqwest::get("https://8.8.8.8").await {
                Ok(_) => true,
                Err(_) => false,
            }
        }
    }
}

fn calculate_file_checksum(file_path: &Path) -> Result<String, String> {
    let mut file = File::open(file_path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];
    
    loop {
        let bytes_read = file.read(&mut buffer).map_err(|e| format!("Failed to read file: {}", e))?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }
    
    let hash = hasher.finalize();
    Ok(format!("sha256:{:x}", hash))
}

fn verify_checksum(file_path: &Path, expected_checksum: &str) -> Result<bool, String> {
    let calculated = calculate_file_checksum(file_path)?;
    Ok(calculated == expected_checksum)
}

fn save_local_manifest(manifest: &GameManifest) -> Result<(), String> {
    let current_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    
    let local_manifest = LocalManifest {
        manifest: manifest.clone(),
        last_updated: current_time,
        is_offline: false,
    };
    
    let app_dir = tauri::api::path::app_dir(&tauri::Config::default())
        .ok_or("Failed to get app directory")?;
    
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let manifest_path = app_dir.join("local_manifest.json");
    let manifest_json = serde_json::to_string_pretty(&local_manifest)
        .map_err(|e| e.to_string())?;
    
    fs::write(manifest_path, manifest_json).map_err(|e| e.to_string())?;
    
    unsafe {
        LOCAL_MANIFEST = Some(local_manifest);
    }
    
    Ok(())
}

fn load_local_manifest() -> Option<GameManifest> {
    unsafe {
        if let Some(ref lm) = LOCAL_MANIFEST {
            return Some(lm.manifest.clone());
        }
    }
    
    let app_dir = tauri::api::path::app_dir(&tauri::Config::default())?;
    let manifest_path = app_dir.join("local_manifest.json");
    
    if manifest_path.exists() {
        let content = fs::read_to_string(&manifest_path).ok()?;
        let local_manifest: LocalManifest = serde_json::from_str(&content).ok()?;
        
        unsafe {
            LOCAL_MANIFEST = Some(local_manifest.clone());
        }
        
        return Some(local_manifest.manifest);
    }
    
    None
}

fn set_startup_with_windows(enable: bool) -> Result<(), String> {
    let run_key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(
            "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            KEY_READ | KEY_WRITE,
        )
        .map_err(|e| e.to_string())?;

    let app_path = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string();

    if enable {
        run_key
            .set_value("AntChillLauncher", &app_path)
            .map_err(|e| e.to_string())?;
    } else {
        let _ = run_key.delete_value("AntChillLauncher");
    }

    Ok(())
}

fn is_startup_with_windows() -> Result<bool, String> {
    let run_key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags(
            "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            KEY_READ,
        )
        .map_err(|e| e.to_string())?;

    match run_key.get_value::<String, _>("AntChillLauncher") {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

fn copy_dir_recursive(src: &Path, dest: &Path) -> std::io::Result<()> {
    if !dest.exists() {
        fs::create_dir_all(dest)?;
    }
    
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let dest_path = dest.join(entry.file_name());
        
        if path.is_dir() {
            copy_dir_recursive(&path, &dest_path)?;
        } else {
            fs::copy(&path, &dest_path)?;
        }
    }
    
    Ok(())
}

fn cleanup_old_backups(backup_dir: &Path) -> std::io::Result<()> {
    if !backup_dir.exists() {
        return Ok(());
    }
    
    let mut backups: Vec<_> = fs::read_dir(backup_dir)?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .collect();
    
    backups.sort_by_key(|e| e.metadata().and_then(|m| m.modified()).ok());
    
    while backups.len() > 3 {
        if let Some(oldest) = backups.first() {
            let _ = fs::remove_dir_all(oldest.path());
        }
        backups.remove(0);
    }
    
    Ok(())
}

fn find_executable_in_directory(dir: &Path) -> Result<Option<String>, String> {
    let dir_name = dir.file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("");
    
    let game_name = if let Some(dot_pos) = dir_name.find('.') {
        &dir_name[..dot_pos]
    } else {
        dir_name
    };
    
    let game_name_exe = format!("{}.exe", game_name);
    let game_name_upper_exe = format!("{}.exe", game_name.to_uppercase());
    let game_name_lower_exe = format!("{}.exe", game_name.to_lowercase());
    
    let common_names = vec![
        game_name_exe.as_str(),
        game_name_upper_exe.as_str(),
        game_name_lower_exe.as_str(),
        "game.exe",
        "Game.exe",
        "GAME.exe",
        "launcher.exe",
        "Launcher.exe",
        "play.exe",
        "Play.exe",
        "start.exe",
        "Start.exe",
    ];
    
    for name in &common_names {
        let exe_path = dir.join(name);
        if exe_path.exists() {
            return Ok(Some(exe_path.to_string_lossy().to_string()));
        }
    }
    
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "exe" {
                    return Ok(Some(path.to_string_lossy().to_string()));
                }
            }
        }
    }
    
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.is_dir() {
            if let Ok(Some(exe)) = find_executable_in_directory(&path) {
                return Ok(Some(exe));
            }
        }
    }
    
    Ok(None)
}

fn find_older_version(base_dir: &Path, game_name: &str) -> Result<Option<String>, String> {
    let game_name_lower = game_name.to_lowercase();
    
    for entry in fs::read_dir(base_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.is_dir() {
            let folder_name = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_lowercase();
            
            if folder_name.starts_with(&game_name_lower) || folder_name.contains(&game_name_lower) {
                if let Ok(Some(exe)) = find_executable_in_directory(&path) {
                    return Ok(Some(exe));
                }
            }
        }
    }
    
    Ok(None)
}

// ============================================
// Tauri Commands
// ============================================

#[tauri::command]
async fn get_games() -> Result<Vec<GameInfo>, String> {
    if !check_network().await {
        if let Some(local_manifest) = load_local_manifest() {
            println!("Using local manifest (offline mode)");
            return Ok(local_manifest.games);
        }
        return Err("No internet connection and no local manifest available.".to_string());
    }

    let manifest_url = "https://pub-72a5a57231ae489cb74409bdc120cb93.r2.dev/manifest.json";
    
    match tokio::time::timeout(
        std::time::Duration::from_secs(60),
        reqwest::get(manifest_url)
    ).await {
        Ok(Ok(response)) => {
            if response.status().is_success() {
                match response.json::<GameManifest>().await {
                    Ok(manifest) => {
                        println!("Successfully loaded online manifest with {} games", manifest.games.len());
                        
                        if let Err(e) = save_local_manifest(&manifest) {
                            eprintln!("Failed to save local manifest: {}", e);
                        }
                        
                        return Ok(manifest.games);
                    }
                    Err(e) => eprintln!("Failed to parse online manifest: {}", e),
                }
            }
        }
        Ok(Err(e)) => eprintln!("Failed to fetch online manifest: {}", e),
        Err(_) => eprintln!("Online manifest timeout"),
    }
    
    if let Some(local_manifest) = load_local_manifest() {
        println!("Using local manifest as fallback");
        return Ok(local_manifest.games);
    }
    
    get_offline_games().await
}

#[tauri::command]
async fn get_offline_games() -> Result<Vec<GameInfo>, String> {
    let games = vec![
        GameInfo {
            id: "brato_io".to_string(),
            name: "Broto".to_string(),
            version: "0.02".to_string(),
            category_id: Some("multiplayer".to_string()),
            status: "available".to_string(),
            download_url: Some("https://pub-72a5a57231ae489cb74409bdc120cb93.r2.dev/broto.zip".to_string()),
            download_checksum: None,
            executable_path: None,
            image_url: "https://files.catbox.moe/2d8fvz.png".to_string(),
            logo_url: Some("https://lh3.googleusercontent.com/pw/AP1GczMLJwyjMDaF7xJ3VS2zGuKTDnzoEBZ57qgNT39c9_kthr_5POsfSnR0Wpacn9tz4CeYjciAuAIZPDO7N67wUswUC7cDpJTymmKlxH2ehuTHvwoUcyM=w2400".to_string()),
            banner_url: None,
            background_id: "brato_io_bg".to_string(),
            description: "A space exploration game with stunning visuals.".to_string(),
            description_long: None,
            file_size: Some("37.54 MB".to_string()),
            file_size_bytes: Some(39370137),
            release_date: Some("2025-09-05".to_string()),
            last_updated: None,
            changelog: Some("Initial release".to_string()),
            developer: Some("AntChill Studio".to_string()),
            publisher: Some("AntChill".to_string()),
            tags: Some(vec!["multiplayer".to_string(), "io-game".to_string()]),
            screenshots: None,
            trailer_url: None,
            system_requirements: None,
            is_coming_soon: false,
            repair_enabled: true,
        },
    ];
    
    Ok(games)
}

#[tauri::command]
async fn get_news() -> Result<Vec<NewsItem>, String> {
    if let Some(local_manifest) = load_local_manifest() {
        return Ok(local_manifest.news);
    }
    
    let manifest_url = "https://pub-72a5a57231ae489cb74409bdc120cb93.r2.dev/manifest.json";
    
    match reqwest::get(manifest_url).await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<GameManifest>().await {
                    Ok(manifest) => {
                        let _ = save_local_manifest(&manifest);
                        return Ok(manifest.news);
                    }
                    Err(e) => return Err(format!("Failed to parse manifest: {}", e)),
                }
            }
        }
        Err(e) => return Err(format!("Failed to fetch news: {}", e)),
    }
    
    Ok(vec![])
}

#[tauri::command]
async fn get_categories() -> Result<Vec<Category>, String> {
    if let Some(local_manifest) = load_local_manifest() {
        return Ok(local_manifest.categories);
    }
    
    Ok(vec![
        Category { id: "all".to_string(), name: "All Games".to_string(), icon: "🎮".to_string() },
    ])
}

#[tauri::command]
async fn verify_game_integrity(game_id: String) -> Result<IntegrityResult, String> {
    let launcher_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Could not get launcher directory")?
        .to_path_buf();
    
    let game_base_dir = launcher_dir.join("AntChillGame");
    
    if !game_base_dir.exists() {
        return Ok(IntegrityResult {
            valid: false,
            checked_files: 0,
            corrupted_files: vec![],
            missing_files: vec!["Game directory not found".to_string()],
            message: "Game not installed".to_string(),
        });
    }
    
    let mut game_folder: Option<PathBuf> = None;
    for entry in fs::read_dir(&game_base_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.is_dir() {
            let folder_name = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_lowercase();
            
            if folder_name.contains(&game_id) || folder_name.contains(&game_id.replace("_", "")) {
                game_folder = Some(path);
                break;
            }
        }
    }
    
    let game_folder = match game_folder {
        Some(f) => f,
        None => {
            return Ok(IntegrityResult {
                valid: false,
                checked_files: 0,
                corrupted_files: vec![],
                missing_files: vec!["Game folder not found".to_string()],
                message: "Game not installed".to_string(),
            });
        }
    };
    
    let exe_path = find_executable_in_directory(&game_folder)?;
    
    if exe_path.is_none() {
        return Ok(IntegrityResult {
            valid: false,
            checked_files: 0,
            corrupted_files: vec![],
            missing_files: vec!["Game executable not found".to_string()],
            message: "Game files corrupted or incomplete".to_string(),
        });
    }
    
    Ok(IntegrityResult {
        valid: true,
        checked_files: 1,
        corrupted_files: vec![],
        missing_files: vec![],
        message: "Game files verified successfully".to_string(),
    })
}

#[tauri::command]
async fn download_game(window: tauri::Window, game_id: String, download_url: String, expected_checksum: Option<String>) -> Result<String, String> {
    let launcher_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Could not get launcher directory")?
        .to_path_buf();
    let game_base_dir = launcher_dir.join("AntChillGame");
    fs::create_dir_all(&game_base_dir).map_err(|e| e.to_string())?;
    
    let manifest_url = "https://pub-72a5a57231ae489cb74409bdc120cb93.r2.dev/manifest.json";
    let manifest_response = reqwest::get(manifest_url).await.map_err(|e| e.to_string())?;
    let manifest: GameManifest = manifest_response.json().await.map_err(|e| e.to_string())?;
    
    let game_info = manifest.games.iter()
        .find(|g| g.id == game_id)
        .ok_or("Game not found in manifest")?;
    
    let game_name_lower = game_info.name.to_lowercase();
    let game_folder_name = format!("{}.v{}", game_name_lower, game_info.version);
    let games_dir = game_base_dir.join(&game_folder_name);
    fs::create_dir_all(&games_dir).map_err(|e| e.to_string())?;
    
    let zip_path = games_dir.join("game.zip");
    
    let client = reqwest::Client::new();
    let response = client.get(&download_url).send().await.map_err(|e| e.to_string())?;
    let total_size = response.content_length().unwrap_or(0);
    
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    let mut file = File::create(&zip_path).map_err(|e| e.to_string())?;
    
    let start_time = Instant::now();
    let mut last_emit = Instant::now();

    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        
        if last_emit.elapsed().as_millis() > 100 {
            let elapsed = start_time.elapsed().as_secs_f64();
            let speed_bytes = if elapsed > 0.0 { downloaded as f64 / elapsed } else { 0.0 };
            let speed_mb = speed_bytes / 1024.0 / 1024.0;
            
            let total_mb = total_size as f64 / 1024.0 / 1024.0;
            let downloaded_mb = downloaded as f64 / 1024.0 / 1024.0;
            let progress = if total_size > 0 { (downloaded as f64 / total_size as f64) * 100.0 } else { 0.0 };
            
            let eta = if speed_bytes > 0.0 && total_size > 0 {
                let remaining_bytes = total_size - downloaded;
                let seconds_remaining = remaining_bytes as f64 / speed_bytes;
                Some(format!("{:.0}s", seconds_remaining))
            } else {
                None
            };

            let payload = DownloadProgress {
                game_id: game_id.clone(),
                progress,
                speed: format!("{:.1} MB/s", speed_mb),
                downloaded: format!("{:.1} MB", downloaded_mb),
                total: format!("{:.1} MB", total_mb),
                eta,
                status: "downloading".to_string(),
                error_message: None,
            };
            
            let _ = window.emit("download_progress", payload);
            last_emit = Instant::now();
        }
    }

    // Verify checksum before extraction
    if let Some(ref checksum) = expected_checksum {
        let _ = window.emit("download_progress", DownloadProgress {
            game_id: game_id.clone(),
            progress: 100.0,
            speed: "0 MB/s".to_string(),
            downloaded: "Completed".to_string(),
            total: "Completed".to_string(),
            eta: None,
            status: "verifying".to_string(),
            error_message: None,
        });
        
        match verify_checksum(&zip_path, checksum) {
            Ok(true) => println!("Checksum verified successfully"),
            Ok(false) => {
                let _ = fs::remove_file(&zip_path);
                return Err("Checksum verification failed - file may be corrupted".to_string());
            }
            Err(e) => {
                eprintln!("Checksum verification error: {}", e);
            }
        }
    }

    // Extracting phase
    let _ = window.emit("download_progress", DownloadProgress {
        game_id: game_id.clone(),
        progress: 100.0,
        speed: "0 MB/s".to_string(),
        downloaded: "Completed".to_string(),
        total: "Completed".to_string(),
        eta: None,
        status: "extracting".to_string(),
        error_message: None,
    });
    
    let file = File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
    
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = games_dir.join(file.name());
        
        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(&p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }
    
    fs::remove_file(&zip_path).map_err(|e| e.to_string())?;
    
    let _ = window.emit("download_progress", DownloadProgress {
        game_id: game_id.clone(),
        progress: 100.0,
        speed: "0 MB/s".to_string(),
        downloaded: "Completed".to_string(),
        total: "Completed".to_string(),
        eta: None,
        status: "completed".to_string(),
        error_message: None,
    });
    
    Ok(games_dir.to_string_lossy().to_string())
}

#[tauri::command]
async fn launch_game(executable_path: String) -> Result<(), String> {
    let path = PathBuf::from(&executable_path);
    
    Command::new(&path)
        .spawn()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn scan_local_games(games: Vec<GameInfo>) -> Result<Vec<GameInfo>, String> {
    let mut scanned_games = games;
    
    let launcher_exe_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Could not get launcher directory")?
        .to_path_buf();
    let game_base_dir = launcher_exe_dir.join("AntChillGame");
    
    if !game_base_dir.exists() {
        return Ok(scanned_games);
    }
    
    for game in &mut scanned_games {
        if game.status == "coming_soon" {
            continue;
        }
        
        let game_name_lower = game.name.to_lowercase();
        let possible_patterns = vec![
            format!("{}.v{}", game_name_lower, game.version),
            format!("{}.{}", game_name_lower, game.version),
            format!("{}.v{}", game.name, game.version),
            format!("{}.{}", game.name, game.version),
            game_name_lower.clone(),
            game.name.clone(),
        ];
        
        let mut game_dir = None;
        for pattern in &possible_patterns {
            let test_dir = game_base_dir.join(pattern);
            if test_dir.exists() {
                game_dir = Some(test_dir);
                break;
            }
        }
        
        if let Some(found_dir) = game_dir {
            let executable_path = find_executable_in_directory(&found_dir)?;
            if let Some(exec_path) = executable_path {
                game.executable_path = Some(exec_path);
                game.status = "available".to_string();
            }
        } else {
            if let Some(older_version) = find_older_version(&game_base_dir, &game.name)? {
                game.executable_path = Some(older_version);
                game.status = "update_available".to_string();
            } else {
                game.executable_path = None;
                game.status = "available".to_string();
            }
        }
    }
    
    Ok(scanned_games)
}

#[tauri::command]
async fn check_game_updates(game_id: String, current_version: String) -> Result<UpdateInfo, String> {
    if !check_network().await {
        return Err("No internet connection".to_string());
    }

    let manifest_url = "https://pub-72a5a57231ae489cb74409bdc120cb93.r2.dev/manifest.json";
    
    match reqwest::get(manifest_url).await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<GameManifest>().await {
                    Ok(manifest) => {
                        if let Some(game) = manifest.games.iter().find(|g| g.id == game_id) {
                            let needs_update = game.version != current_version;
                            return Ok(UpdateInfo {
                                current_version: current_version.clone(),
                                latest_version: game.version.clone(),
                                needs_update,
                                update_url: game.download_url.clone(),
                                update_checksum: game.download_checksum.clone(),
                                changelog: game.changelog.clone(),
                            });
                        }
                    }
                    Err(e) => eprintln!("Failed to parse manifest: {}", e),
                }
            }
        }
        Err(e) => eprintln!("Failed to fetch manifest: {}", e),
    }
    
    Ok(UpdateInfo {
        current_version: current_version.clone(),
        latest_version: current_version,
        needs_update: false,
        update_url: None,
        update_checksum: None,
        changelog: None,
    })
}

#[tauri::command]
async fn repair_game(game_id: String) -> Result<RepairResult, String> {
    let launcher_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Could not get launcher directory")?
        .to_path_buf();
    
    let game_base_dir = launcher_dir.join("AntChillGame");
    
    if !game_base_dir.exists() {
        return Ok(RepairResult {
            success: false,
            repaired_files: vec![],
            errors: vec!["Game directory not found".to_string()],
            message: "Game directory not found".to_string(),
        });
    }
    
    let mut game_folder_to_delete = None;
    
    for entry in fs::read_dir(&game_base_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.is_dir() {
            let folder_name = path.file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("");
            
            if folder_name.contains(&game_id) || folder_name.starts_with(&game_id.replace("_", "")) {
                game_folder_to_delete = Some(path);
                break;
            }
        }
    }
    
    let game_folder = match game_folder_to_delete {
        Some(folder) => folder,
        None => {
            return Ok(RepairResult {
                success: false,
                repaired_files: vec![],
                errors: vec!["Game folder not found".to_string()],
                message: "Game folder not found".to_string(),
            });
        }
    };
    
    match fs::remove_dir_all(&game_folder) {
        Ok(_) => {
            Ok(RepairResult {
                success: true,
                repaired_files: vec![game_folder.file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("unknown")
                    .to_string()],
                errors: vec![],
                message: "Game folder deleted successfully. Please reinstall.".to_string(),
            })
        }
        Err(e) => {
            Ok(RepairResult {
                success: false,
                repaired_files: vec![],
                errors: vec![format!("Failed to delete game folder: {}", e)],
                message: "Failed to delete game folder".to_string(),
            })
        }
    }
}

#[tauri::command]
async fn check_network_status() -> Result<NetworkStatus, String> {
    let start = Instant::now();
    let is_online = check_network().await;
    let latency = start.elapsed().as_millis() as u64;
    
    let message = if is_online {
        "Connected to internet".to_string()
    } else {
        "No internet connection".to_string()
    };
    
    Ok(NetworkStatus { 
        is_online, 
        message,
        latency_ms: Some(latency),
    })
}

#[tauri::command]
fn toggle_startup_with_windows(enable: bool) -> Result<(), String> {
    set_startup_with_windows(enable)
}

#[tauri::command]
fn get_startup_status() -> Result<bool, String> {
    is_startup_with_windows()
}

#[tauri::command]
async fn minimize_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app.get_window("main").ok_or("Window not found")?;
    window.minimize().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn hide_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app.get_window("main").ok_or("Window not found")?;
    window.hide().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn close_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app.get_window("main").ok_or("Window not found")?;
    window.close().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn start_dragging(app: tauri::AppHandle) -> Result<(), String> {
    let window = app.get_window("main").ok_or("Window not found")?;
    window.start_dragging().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn open_directory(path: String) -> Result<(), String> {
    let launcher_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Could not get launcher directory")?
        .to_path_buf();
    
    let full_path = launcher_dir.join(&path);
    
    if !full_path.exists() {
        fs::create_dir_all(&full_path).map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(full_path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
async fn get_social_links() -> Result<Vec<SocialLink>, String> {
    if let Some(local_manifest) = load_local_manifest() {
        return Ok(local_manifest.social_links);
    }
    
    Ok(vec![
        SocialLink {
            id: "home".to_string(),
            icon: "/social/home.png".to_string(),
            url: "https://anhhackta.github.io".to_string(),
            tooltip: "Website".to_string(),
            active: true,
            action: None,
        },
        SocialLink {
            id: "discord".to_string(),
            icon: "/social/discord.png".to_string(),
            url: "https://discord.gg/3J2nemTtDq".to_string(),
            tooltip: "Discord".to_string(),
            active: true,
            action: None,
        },
    ])
}

#[tauri::command]
async fn get_backgrounds() -> Result<Vec<Background>, String> {
    if let Some(local_manifest) = load_local_manifest() {
        let backgrounds: Vec<Background> = local_manifest.backgrounds.values().cloned().collect();
        return Ok(backgrounds);
    }
    
    Ok(vec![])
}

// ============================================
// Main Entry Point
// ============================================

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_games,
            get_offline_games,
            get_news,
            get_categories,
            download_game,
            launch_game,
            scan_local_games,
            check_game_updates,
            repair_game,
            verify_game_integrity,
            check_network_status,
            toggle_startup_with_windows,
            get_startup_status,
            minimize_window,
            hide_window,
            close_window,
            start_dragging,
            open_directory,
            get_social_links,
            get_backgrounds,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}