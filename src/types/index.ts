// ============================================
// Game Launcher Types - Commercial Grade v2.0
// ============================================

// News & Announcements
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  date: string;
  type: 'announcement' | 'update' | 'event' | 'maintenance';
  game_id?: string;
  pinned: boolean;
  read?: boolean;
}

// Categories
export interface Category {
  id: string;
  name: string;
  icon: string;
}

// Game File with Checksum
export interface GameFile {
  path: string;
  checksum: string;
  size: number;
}

// System Requirements
export interface SystemRequirements {
  os: string;
  ram: string;
  storage: string;
  gpu?: string;
  cpu?: string;
}

// Enhanced Game Info
export interface GameInfo {
  id: string;
  name: string;
  version: string;
  category_id?: string;
  status: 'available' | 'coming_soon' | 'maintenance' | 'update_available';
  download_url?: string;
  download_checksum?: string;
  executable_path?: string;
  image_url: string;
  logo_url?: string;
  banner_url?: string;
  background_id: string;
  description: string;
  description_long?: string;
  file_size?: string;
  file_size_bytes?: number;
  release_date?: string;
  last_updated?: string;
  changelog?: string;
  developer?: string;
  publisher?: string;
  tags?: string[];
  screenshots?: string[];
  trailer_url?: string;
  system_requirements?: SystemRequirements;
  files?: GameFile[];
  is_coming_soon: boolean;
  repair_enabled: boolean;
  installed_version?: string;
}

// Update Info
export interface UpdateInfo {
  current_version: string;
  latest_version: string;
  needs_update: boolean;
  update_url?: string;
  update_checksum?: string;
  changelog?: string;
  update_size?: string;
}

// Repair Result
export interface RepairResult {
  success: boolean;
  repaired_files: string[];
  errors: string[];
  message: string;
}

// Integrity Verification
export interface IntegrityResult {
  valid: boolean;
  checked_files: number;
  corrupted_files: string[];
  missing_files: string[];
  message: string;
}

// Network Status
export interface NetworkStatus {
  is_online: boolean;
  message: string;
  latency_ms?: number;
}

// Download Progress
export interface DownloadProgress {
  game_id: string;
  progress: number;
  speed: string;
  downloaded: string;
  total: string;
  eta?: string;
  status: 'queued' | 'downloading' | 'paused' | 'extracting' | 'verifying' | 'completed' | 'error';
  error_message?: string;
}

// Download Queue Item
export interface DownloadQueueItem extends DownloadProgress {
  game_name: string;
  added_at: number;
  priority: number;
}

// Launcher Config
export interface LauncherConfig {
  current_version: string;
  update_url: string;
  update_checksum?: string;
  changelog: string;
  auto_check_updates: boolean;
  check_interval_hours: number;
  min_supported_version?: string;
}

// Social Link
export interface SocialLink {
  id: string;
  icon: string;
  url: string;
  tooltip: string;
  active: boolean;
  action?: string;
}

// Background
export interface Background {
  id: string;
  name: string;
  image_url: string;
  active: boolean;
}

// Settings
export interface LauncherSettings {
  startup_with_windows: boolean;
  minimize_to_tray: boolean;
  auto_check_updates: boolean;
  download_path: string;
  max_backups: number;
  max_concurrent_downloads?: number;
  download_speed_limit?: number;
  verify_after_download: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'vi';
}

// Full Manifest
export interface GameManifest {
  manifest_version: string;
  last_updated: string;
  manifest_signature?: string;
  launcher_config: LauncherConfig;
  news: NewsItem[];
  categories: Category[];
  backgrounds: Record<string, Background>;
  games: GameInfo[];
  social_links: SocialLink[];
  settings: LauncherSettings;
}

// Theme Type
export type Theme = 'light' | 'dark';

// View Mode for Library
export type ViewMode = 'grid' | 'list';

// Sort Options
export type SortOption = 'name' | 'date' | 'size' | 'last_played';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  by: SortOption;
  direction: SortDirection;
}

// Filter State
export interface FilterState {
  category: string;
  search: string;
  installed_only: boolean;
  sort: SortConfig;
}
