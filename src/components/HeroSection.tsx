import React from 'react';
import type { GameInfo } from '../types';
import type { DownloadProgress } from '../types';

interface HeroSectionProps {
  game: GameInfo | null;
  onLaunch: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  isOfflineMode: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  game,
  onLaunch,
  onDownload,
  isDownloading,
  isOfflineMode,
}) => {
  if (!game) {
    return (
      <div className="hero-section hero-empty">
        <div className="hero-empty-text">Select a game</div>
      </div>
    );
  }

  const bgUrl = game.banner_url || game.image_url;
  const isInstalled = !!game.executable_path;
  const isComingSoon = game.is_coming_soon || game.status === 'coming_soon';
  const hasUpdate = game.status === 'update_available';

  const handlePrimaryAction = () => {
    if (isComingSoon || isDownloading) return;
    if (isInstalled) {
      onLaunch();
    } else {
      onDownload();
    }
  };

  const getPrimaryLabel = () => {
    if (isComingSoon) return 'Coming Soon';
    if (isDownloading) return 'Downloading...';
    if (hasUpdate) return 'Update';
    if (isInstalled) return 'Play Now';
    return 'Download';
  };

  return (
    <div className="hero-section">
      {/* Background artwork */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      {/* Gradient overlays */}
      <div className="hero-grad-bottom" />
      <div className="hero-grad-left" />

      {/* Top bar: breadcrumb + user */}
      <div className="hero-topbar">
        <div className="hero-breadcrumb">
          <span className="breadcrumb-brand">ANTCHILL</span>
          <span className="breadcrumb-sep">//</span>
          <span className="breadcrumb-game">{game.name.toUpperCase()}</span>
          {game.version && (
            <span className="breadcrumb-version">v{game.version}</span>
          )}
        </div>
        <div className="hero-topbar-right">
          {game.tags && game.tags.length > 0 && (
            <div className="hero-tags">
              {game.tags.slice(0, 2).map(tag => (
                <span key={tag} className="hero-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom info overlay */}
      <div className="hero-content">
        {/* Developer badge */}
        {game.developer && (
          <div className="hero-dev-badge">
            <span className="hero-dev-icon">◆</span>
            <span>{game.developer.toUpperCase()}</span>
          </div>
        )}

        {/* Game title */}
        {game.logo_url ? (
          <img
            src={game.logo_url}
            alt={game.name}
            className="hero-logo-img"
          />
        ) : (
          <h1 className="hero-title">{game.name.toUpperCase()}</h1>
        )}

        {/* Description */}
        {game.description && (
          <p className="hero-description">{game.description}</p>
        )}

        {/* Action button */}
        <button
          className={`hero-play-btn ${isComingSoon ? 'disabled' : ''} ${isDownloading ? 'downloading' : ''}`}
          onClick={handlePrimaryAction}
          disabled={isComingSoon || isDownloading || isOfflineMode}
        >
          <span className="hero-play-icon">
            {isInstalled && !hasUpdate ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
          </span>
          <span className="hero-play-text">{getPrimaryLabel()}</span>
          <span className="hero-play-arrow">→</span>
        </button>
      </div>
    </div>
  );
};
