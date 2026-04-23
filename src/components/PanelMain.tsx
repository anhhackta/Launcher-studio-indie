import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import type { GameInfo, NewsItem, DownloadProgress } from '../types';

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
  downloadProgress,
  isDownloading,
  isOfflineMode,
  onLaunch,
  onDownload,
  onSettingsClick,
}) => {
  const bgUrl = game?.banner_url || game?.image_url || '';
  const isInstalled = !!game?.executable_path;
  const isComingSoon = game?.is_coming_soon || game?.status === 'coming_soon';

  const handlePrimary = () => {
    if (isComingSoon || isDownloading) return;
    isInstalled ? onLaunch() : onDownload();
  };

  const getPrimaryLabel = () => {
    if (isComingSoon) return 'Coming Soon';
    if (isDownloading) return 'Downloading...';
    if (isInstalled) return 'Start Adventure';
    return 'Download Now';
  };

  const progress = downloadProgress?.progress ?? 0;

  return (
    <main className="panel-main">
      {/* Drag region */}
      <div className="pm-drag-region" data-tauri-drag-region />

      {/* Window controls */}
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

      {/* ── Hero Card (left) ── */}
      <div className="pm-hero-card">
        <div className="pm-nav-icons">
          <button className="pm-nav-btn pm-nav-active" title="Home">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
          </button>
          <button className="pm-nav-btn" title="Browse">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
          </button>
          <button className="pm-nav-btn" title="Commands">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z" /></svg>
          </button>
          <button className="pm-nav-btn" title="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </button>
        </div>

        <div className="pm-hero-bg" style={{ backgroundImage: `url(${bgUrl})` }} />
        <div className="pm-hero-gradient" />
        <div className="pm-hero-brand">コンパ</div>

        <div className="pm-hero-content">
          <span className="pm-hero-label">Project 01</span>
          <h1 className="pm-hero-title">{game?.name?.toUpperCase() || 'SELECT A GAME'}</h1>
          <button
            className={`pm-hero-btn ${isDownloading ? 'downloading' : ''}`}
            onClick={handlePrimary}
            disabled={isComingSoon || isDownloading || isOfflineMode}
          >
            <span className="pm-hero-btn-text">{getPrimaryLabel()}</span>
            <span className="pm-hero-btn-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </button>
        </div>

        {/* Download progress overlay */}
        {isDownloading && downloadProgress && (
          <div className="pm-hero-progress">
            <div className="pm-hero-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* ── Download Card (bottom-left) ── */}
      <div className="pm-download-card">
        <h3 className="pm-dl-title">Download</h3>
        <div className="pm-dl-stats">
          <div className="pm-dl-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            <span>6,445</span>
          </div>
          <div className="pm-dl-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span>4,892</span>
          </div>
          <div className="pm-dl-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
            <span>9,876</span>
          </div>
        </div>
        <button
          className="pm-dl-btn"
          onClick={isInstalled ? onLaunch : onDownload}
          disabled={isOfflineMode || isComingSoon}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* ── Sidebar (right column) ── */}
      <div className="pm-sidebar">
        {/* User Card */}
        <div className="pm-user-card">
          <span className="pm-user-greeting">Hi,{game?.developer?.split(' ')[0] || 'Player'}</span>
          <div className="pm-user-avatar">
            <img src={game?.image_url || '/logo.png'} alt="avatar" />
          </div>
        </div>

        {/* Info Card — Promo + Upcoming Game */}
        <div className="pm-info-card">
          <div className="pm-promo-row">
            <span className="pm-promo-tag">30% Off</span>
            <div className="pm-promo-coupon">
              <span>Get Coupon</span>
              <span className="pm-promo-icon">🎟️</span>
            </div>
          </div>

          <div className="pm-upcoming-logo">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="40" y1="5" x2="15" y2="75" stroke="#e8c840" strokeWidth="4" strokeLinecap="round" />
              <line x1="40" y1="5" x2="65" y2="75" stroke="#e8c840" strokeWidth="4" strokeLinecap="round" />
              <line x1="5" y1="40" x2="75" y2="15" stroke="#e8c840" strokeWidth="4" strokeLinecap="round" />
              <line x1="5" y1="40" x2="75" y2="65" stroke="#e8c840" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="pm-upcoming-info">
            <span className="pm-upcoming-label">Upcoming Game</span>
            <h3 className="pm-upcoming-title">Shadows Unleashed</h3>
            <span className="pm-upcoming-date">September 10, 2024</span>
          </div>

          <div className="pm-social-links">
            <a className="pm-social-btn" href="#" title="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
            </a>
            <a className="pm-social-btn" href="#" title="Twitch">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" /></svg>
            </a>
          </div>
        </div>

        {/* Trailer Card */}
        <div className="pm-trailer-card">
          <div className="pm-trailer-img">
            <img src={game?.screenshots?.[0] || game?.image_url || ''} alt="Trailer" />
          </div>
          <button className="pm-trailer-btn">
            <span className="pm-trailer-play">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </span>
            <span>Play Trailer</span>
          </button>
        </div>
      </div>
    </main>
  );
};
