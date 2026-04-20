import React from 'react';
import type { GameInfo, DownloadProgress } from '../types';

interface DownloadBarProps {
  game: GameInfo | null;
  downloadProgress: DownloadProgress | undefined;
  isDownloading: boolean;
  isOfflineMode: boolean;
  onDownload: () => void;
  onLaunch: () => void;
}

export const DownloadBar: React.FC<DownloadBarProps> = ({
  game,
  downloadProgress,
  isDownloading,
  isOfflineMode,
  onDownload,
  onLaunch,
}) => {
  if (!game) return null;

  const isInstalled = !!game.executable_path;
  const isComingSoon = game.is_coming_soon || game.status === 'coming_soon';
  const hasUpdate = game.status === 'update_available';
  const progress = downloadProgress?.progress ?? 0;

  // === Downloading state ===
  if (isDownloading && downloadProgress) {
    return (
      <div className="download-bar downloading">
        {/* Progress visual */}
        <div className="dbar-progress-track">
          <div className="dbar-progress-fill" style={{ width: `${progress}%` }} />
          <div className="dbar-progress-glow" style={{ left: `${progress}%` }} />
        </div>

        {/* Stats row */}
        <div className="dbar-stats">
          <span className="dbar-percent">{Math.floor(progress)}%</span>
          <span className="dbar-file-info">
            {downloadProgress.downloaded} / {downloadProgress.total}
          </span>
          {downloadProgress.speed && (
            <span className="dbar-speed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              {downloadProgress.speed}
            </span>
          )}
          {downloadProgress.eta && (
            <span className="dbar-eta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {downloadProgress.eta}
            </span>
          )}
          {/* Status text */}
          {downloadProgress.status === 'extracting' && (
            <span className="dbar-status-badge">Đang giải nén...</span>
          )}
          {downloadProgress.status === 'verifying' && (
            <span className="dbar-status-badge">Đang xác minh...</span>
          )}
        </div>

        {/* Right: action button */}
        <div className="dbar-action">
          <div className="dbar-download-spinner" />
          <button className="dbar-btn active" disabled>
            <span>Đang tải</span>
            <span className="dbar-btn-icon">≡</span>
          </button>
        </div>
      </div>
    );
  }

  // === Idle state ===
  return (
    <div className="download-bar idle">
      <div className="dbar-progress-track idle-track">
        <div className="dbar-progress-fill idle-fill" style={{ width: '0%' }} />
      </div>

      <div className="dbar-stats">
        {game.file_size && (
          <span className="dbar-file-info">
            {isInstalled ? `v${game.version} • Installed` : `${game.file_size}`}
          </span>
        )}
        {isOfflineMode && <span className="dbar-offline-tag">OFFLINE</span>}
      </div>

      <div className="dbar-action">
        {isComingSoon ? (
          <button className="dbar-btn coming-soon" disabled>
            <span>Sắp ra mắt</span>
          </button>
        ) : isInstalled && !hasUpdate ? (
          <button className="dbar-btn play" onClick={onLaunch}>
            <span className="dbar-play-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </span>
            <span>Chơi Ngay</span>
            <span className="dbar-btn-icon">≡</span>
          </button>
        ) : (
          <button
            className="dbar-btn install"
            onClick={isInstalled ? onLaunch : onDownload}
            disabled={isOfflineMode}
          >
            <span className="dbar-play-icon">
              {hasUpdate ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
            </span>
            <span>{hasUpdate ? 'Cập Nhật' : 'Tải Về'}</span>
            <span className="dbar-btn-icon">≡</span>
          </button>
        )}
      </div>
    </div>
  );
};
