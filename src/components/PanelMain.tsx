import React, { useState, useEffect, useCallback } from 'react';
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
  news,
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


  const progress = downloadProgress?.progress ?? 0;
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // News auto-rotate
  const [activeNewsIdx, setActiveNewsIdx] = useState(0);
  const newsItems = news?.slice(0, 5) ?? [];

  useEffect(() => {
    if (newsItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveNewsIdx(prev => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsItems.length]);

  // YouTube helpers
  const getYouTubeId = useCallback((url?: string) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/);
    return m ? m[1] : null;
  }, []);

  const trailerUrl = game?.trailer_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const youtubeId = getYouTubeId(trailerUrl);
  const brandName = game?.developer || 'AntChill';

  /* ── Clip-path SVG (converted from a.svg to objectBoundingBox 0-1) ── */
  const clipPath = `M 0.97253 0 C 0.9877 0 1 0.01679 1 0.0375 L 1 0.7125 C 1 0.73321 0.9877 0.75 0.97253 0.75 L 0.63187 0.75 C 0.61669 0.75 0.6044 0.76679 0.6044 0.7875 L 0.6044 0.9625 C 0.6044 0.98321 0.5921 1 0.57692 1 L 0.02747 1 C 0.0123 1 0 0.98321 0 0.9625 L 0 0.2125 C 0 0.19179 0.0123 0.175 0.02747 0.175 L 0.37088 0.175 C 0.38605 0.175 0.39835 0.15821 0.39835 0.1375 L 0.39835 0.0375 C 0.39835 0.01679 0.41065 0 0.42582 0 Z`;

  return (
    <>
    <main className="panel-main">
      {/* Hidden SVG defs for clip-path */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="game-clip" clipPathUnits="objectBoundingBox">
            <path d={clipPath} />
          </clipPath>
        </defs>
      </svg>

      {/* Drag region */}
      <div className="pm-drag-region" data-tauri-drag-region />

      {/* Window controls */}
      <div className="pm-window-controls">
        <button className="pm-wc-btn" onClick={onSettingsClick} title="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
        <button className="pm-wc-btn pm-wc-minimize" onClick={() => appWindow.minimize()} title="Minimize">
          <svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="11" width="16" height="2" rx="1" /></svg>
        </button>
        <button className="pm-wc-btn pm-wc-close" onClick={() => appWindow.close()} title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="17" y1="7" x2="7" y2="17" /><line x1="7" y1="7" x2="17" y2="17" /></svg>
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          PANELMAINGAME — clip-path shaped game card
          ══════════════════════════════════════════════ */}
      <div className="panelmaingame">

        {/* Clipped image layer */}
        <div className="panelmaingame-clipped">
          <div className="panelmaingame-bg" style={{ backgroundImage: `url(${bgUrl})` }} />
          <div className="panelmaingame-gradient" />

          {/* Nav icons (inside clipped area, top-left) */}
          <div className="panelmaingame-icons">
            <button className="pmg-nav-btn" title="Website">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
            </button>
            <button className="pmg-nav-btn" title="Fanpage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
            </button>
            <button className="pmg-nav-btn" title="Configuration">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09c.26.62.78 1.05 1.51 1.05H21a2 2 0 010 4h-.09c-.73 0-1.25.43-1.51 1.05z" /></svg>
            </button>
            <button className="pmg-nav-btn" title="Contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </button>
          </div>

          {/* Panelversion — frosted glass (bottom-left of clipped area) */}
          <div className="panelversion">
            <span className="panelversion-label">Version {game?.version || '1.0.0'}</span>
            <h1 className="panelversion-title">{game?.name?.toUpperCase() || 'SELECT A GAME'}</h1>
          </div>
        </div>

        {/* Brand text — sits in top-left notch gap */}
        <div className="panelmaingame-brand">{brandName}</div>

        {/* Panelplay — sits in bottom-right notch gap */}
        <div className="panelplay">
          <div className="panelplay-header">
            <h3 className="panelplay-title">{isInstalled ? 'Play' : 'Download'}</h3>
            <div className="panelplay-stats">
              <div className="panelplay-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                <span>6,445</span>
              </div>
              <div className="panelplay-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                <span>4,892</span>
              </div>
              <div className="panelplay-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                <span>9,876</span>
              </div>
            </div>
          </div>
          <button
            className="panelplay-btn"
            onClick={handlePrimary}
            disabled={isOfflineMode || isComingSoon}
          >
            <div className="panelplay-btn-inner">
              {isInstalled ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              )}
            </div>
          </button>
          {/* Progress bar */}
          {isDownloading && downloadProgress && (
            <div className="panelplay-progress">
              <div className="panelplay-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SIDEBAR — right column
          ══════════════════════════════════════════════ */}
      <div className="pm-sidebar">
        {/* User Card */}
        <div className="pm-user-card">
          <span className="pm-user-greeting">Hi, {game?.developer?.split(' ')[0] || 'Player'}</span>
          <div className="pm-user-avatar">
            <img src={game?.image_url || '/logo.png'} alt="avatar" />
          </div>
        </div>

        {/* ── PANELNEWSGAME ── */}
        <div className="panelnewsgame">
          <div className="pm-news-header">
            <h3>Game Updates</h3>
            <span className="pm-news-badge">Latest</span>
          </div>

          <div className="pm-news-carousel">
            <div className="pm-news-track" style={{ transform: `translateX(-${activeNewsIdx * 100}%)` }}>
              {newsItems.length > 0 ? (
                newsItems.map((n) => (
                  <div key={n.id} className="pm-news-slide">
                    <h4>{n.title}</h4>
                    <p>{n.content?.slice(0, 80)}...</p>
                    <span className="pm-news-date">{new Date(n.date).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="pm-news-slide">
                  <div className="pm-news-empty">No updates available.</div>
                </div>
              )}
            </div>

            {/* Prev / Next arrows */}
            {newsItems.length > 1 && (
              <>
                <button className="pm-news-arrow pm-news-prev" onClick={() => setActiveNewsIdx(prev => (prev - 1 + newsItems.length) % newsItems.length)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="pm-news-arrow pm-news-next" onClick={() => setActiveNewsIdx(prev => (prev + 1) % newsItems.length)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </>
            )}
          </div>

          {newsItems.length > 1 && (
            <div className="pm-news-dots">
              {newsItems.map((_, i) => (
                <button key={i} className={`pm-news-dot-btn ${i === activeNewsIdx ? 'active' : ''}`} onClick={() => setActiveNewsIdx(i)} />
              ))}
            </div>
          )}

          <div className="pm-social-links">
            <a className="pm-social-btn" href="#" title="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a className="pm-social-btn" href="#" title="X (Twitter)">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        {/* ── PANELTRAILERGAME ── */}
        <div className="paneltrailergame" onClick={() => setIsTrailerOpen(true)}>
          <div className="paneltrailergame-img">
            <img src={game?.screenshots?.[0] || game?.image_url || ''} alt="Trailer" />
          </div>
          <button className="paneltrailergame-btn" onClick={(e) => { e.stopPropagation(); setIsTrailerOpen(true); }}>
            <span className="paneltrailergame-play">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </span>
            <span>Play Trailer</span>
          </button>
        </div>
      </div>
    </main>

    {/* ── Trailer Modal ── */}
    {isTrailerOpen && (
      <div className="pm-trailer-modal" onClick={() => setIsTrailerOpen(false)}>
        <div className="pm-trailer-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="pm-trailer-modal-close" onClick={() => setIsTrailerOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          {youtubeId ? (
            <iframe
              width="100%" height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title="Game Trailer" frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="pm-trailer-no-video">Video not available</div>
          )}
        </div>
      </div>
    )}
    </>
  );
};
