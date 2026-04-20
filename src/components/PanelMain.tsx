import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import type { GameInfo, NewsItem, DownloadProgress } from '../types';
import { HeroSection } from './HeroSection';
import { NewsSection } from './NewsSection';
import { DownloadBar } from './DownloadBar';

interface PanelMainProps {
  game: GameInfo | null;
  news: NewsItem[];
  downloadProgress: DownloadProgress | undefined;
  isDownloading: boolean;
  isOfflineMode: boolean;
  onLaunch: () => void;
  onDownload: () => void;
  onSettingsClick: () => void;
}

export const PanelMain: React.FC<PanelMainProps> = ({
  game,
  news,
  downloadProgress,
  isDownloading,
  isOfflineMode,
  onLaunch,
  onDownload,
  onSettingsClick,
}) => {
  return (
    <main className="panel-main">
      {/* Drag region */}
      <div className="pm-drag-region" data-tauri-drag-region />

      {/* Window controls — Endfield style: top right */}
      <div className="pm-window-controls">
        <button className="pm-wc-btn" onClick={onSettingsClick} title="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button className="pm-wc-btn pm-wc-minimize" onClick={() => appWindow.minimize()} title="Minimize">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="11" width="16" height="2" rx="1" />
          </svg>
        </button>
        <button className="pm-wc-btn pm-wc-close" onClick={() => appWindow.close()} title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="17" y1="7" x2="7" y2="17" />
            <line x1="7" y1="7" x2="17" y2="17" />
          </svg>
        </button>
      </div>

      {/* Hero artwork — fills main area */}
      <HeroSection
        game={game}
        onLaunch={onLaunch}
        onDownload={onDownload}
        isDownloading={isDownloading}
        isOfflineMode={isOfflineMode}
      />

      {/* News strip — Endfield style */}
      <div className="pm-news-wrapper">
        <NewsSection news={news} gameId={game?.id} />
      </div>

      {/* Download bar — Endfield yellow bottom bar */}
      <DownloadBar
        game={game}
        downloadProgress={downloadProgress}
        isDownloading={isDownloading}
        isOfflineMode={isOfflineMode}
        onDownload={onDownload}
        onLaunch={onLaunch}
      />
    </main>
  );
};
