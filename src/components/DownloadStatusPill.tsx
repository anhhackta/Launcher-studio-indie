import React from 'react';
import { GameInfo, DownloadProgress } from '../types';

interface DownloadStatusPillProps {
  game: GameInfo | null;
  downloadProgress: DownloadProgress | null;
  isDownloading: boolean;
  onDownload: (game: GameInfo) => void;
  isOfflineMode: boolean;
}

export const DownloadStatusPill: React.FC<DownloadStatusPillProps> = ({
  game,
  downloadProgress,
  isDownloading,
  onDownload,
  isOfflineMode
}) => {
  if (!game) return null;
  const isInstalled = !!game.executable_path;

  // Let's create dummy numbers for stats since the backend doesn't provide them, 
  // or use file size as one stat.
  const stat1 = game.changelog ? '8k' : '6.4k';
  const stat2 = game.version ? '1.2k' : '4.8k';
  const stat3 = '9.8k';

  const downloadText = isInstalled ? 'Update' : (isDownloading ? 'Downloading' : 'Download');
  const disabled = isOfflineMode || isDownloading || isInstalled;

  return (
    <div className="download-pill-wrapper">
      <div className="download-pill">
        <div className="pill-title">{downloadText}</div>
        
        <div className="pill-stats">
          <div className="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/></svg>
            <span>{stat1}</span>
          </div>
          <div className="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>{stat2}</span>
          </div>
          <div className="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            <span>{stat3}</span>
          </div>
        </div>

        <button 
          className="btn-circle-download"
          onClick={() => onDownload(game)}
          disabled={disabled}
          title={downloadText}
        >
          {isInstalled ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          )}
        </button>

        {isDownloading && downloadProgress && (
          <div className="download-progress-mini">
            <div className="progress-mini-bar">
              <div 
                className="progress-mini-fill" 
                style={{ width: `${downloadProgress.progress}%` }} 
              />
            </div>
            <span>{Math.round(downloadProgress.progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
