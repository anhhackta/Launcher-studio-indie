import React, { useMemo } from 'react';
import { GameInfo, DownloadProgress } from '../types';

interface LauncherActionAreaProps {
  game: GameInfo | null;
  downloadProgress: DownloadProgress | null;
  isDownloading: boolean;
  onDownload: (game: GameInfo) => void;
  onLaunch: (game: GameInfo) => void;
  isOfflineMode: boolean;
}

export const LauncherActionArea: React.FC<LauncherActionAreaProps> = ({
  game,
  downloadProgress,
  isDownloading,
  onDownload,
  onLaunch,
  isOfflineMode
}) => {
  if (!game) return null;

  const isInstalled = !!game.executable_path;
  const isAvailable = game.status !== 'coming_soon' && game.status !== 'maintenance';

  const handlePrimaryAction = () => {
    if (!isAvailable) return;
    if (isInstalled) {
      onLaunch(game);
    } else {
      onDownload(game);
    }
  };

  const getButtonState = () => {
    if (!isAvailable) return { text: 'Bảo Trì / Sắp Ra Mắt', disabled: true, class: 'btn-disabled' };
    if (isDownloading && downloadProgress) {
      if (downloadProgress.status === 'paused') return { text: 'Tiếp Tục Tải', disabled: false, class: 'btn-download' };
      if (downloadProgress.status === 'verifying') return { text: 'Đang Xác Minh...', disabled: true, class: 'btn-verifying' };
      if (downloadProgress.status === 'extracting') return { text: 'Đang Giải Nén...', disabled: true, class: 'btn-verifying' };
      return { text: 'Đang Tải...', disabled: true, class: 'btn-downloading' };
    }
    if (isInstalled) {
      return { text: 'Khởi Động', disabled: false, class: 'btn-play' };
    }
    return { text: 'Tải Xuống', disabled: false, class: 'btn-download' };
  };

  const btnState = getButtonState();

  const formattedSize = useMemo(() => {
    if (game.file_size) return game.file_size;
    if (game.file_size_bytes) {
      return (game.file_size_bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    return 'Không rõ dung lượng';
  }, [game]);

  return (
    <div className="action-area">
      {/* Game Title Info aligned left of the action button */}
      <div className="action-game-info">
        <h1 className="game-title-large">{game.name}</h1>
        <div className="game-meta-row">
          {game.version && <span className="game-version">Phiên bản {game.version}</span>}
          <span className="game-size">{formattedSize}</span>
        </div>
      </div>

      <div className="action-controls">
        {isDownloading && downloadProgress ? (
          <div className="download-progress-container">
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${downloadProgress.progress}%` }}
              />
            </div>
            <div className="progress-stats">
              <span className="progress-speed">{downloadProgress.speed || 'Đang kết nối...'}</span>
              <span className="progress-amount">{downloadProgress.downloaded} / {downloadProgress.total}</span>
              <span className="progress-percentage">{Math.round(downloadProgress.progress)}%</span>
            </div>
          </div>
        ) : null}

        <button 
          className={`primary-action-btn ${btnState.class}`}
          onClick={handlePrimaryAction}
          disabled={btnState.disabled || (isOfflineMode && !isInstalled)}
        >
          <span className="btn-glow"></span>
          <span className="btn-text">{btnState.text}</span>
          <span className="btn-particles"></span>
        </button>
      </div>
    </div>
  );
};
