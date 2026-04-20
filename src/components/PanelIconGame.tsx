import React, { useState } from 'react';
import type { GameInfo } from '../types';

interface PanelIconGameProps {
  games: GameInfo[];
  selectedGameId: string | undefined;
  onSelectGame: (game: GameInfo) => void;
  isOfflineMode: boolean;
}

export const PanelIconGame: React.FC<PanelIconGameProps> = ({
  games,
  selectedGameId,
  onSelectGame,
  isOfflineMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`panel-icon-game ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="pig-logo">
        <img src="/logo.png" alt="AntChill" className="pig-logo-img" />
        <span className="pig-logo-text">ANTCHILL</span>
      </div>

      {/* Game icons — items laid out as [text | icon] so icons stay on right edge */}
      <nav className="pig-game-list">
        {games.map((game) => {
          const isSelected = game.id === selectedGameId;
          const isInstalled = !!game.executable_path;
          return (
            <button
              key={game.id}
              className={`pig-game-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectGame(game)}
              title={game.name}
            >
              {/* Game info text — appears on LEFT when expanded */}
              <div className="pig-game-info">
                <span className="pig-game-name">{game.name}</span>
                <span className="pig-game-status">
                  {game.is_coming_soon ? 'Coming Soon' : isInstalled ? 'Installed' : 'Available'}
                </span>
              </div>

              {/* Game thumbnail — stays on RIGHT */}
              <div className="pig-game-thumb">
                {isSelected && <div className="pig-active-bar" />}
                <img
                  src={game.image_url}
                  alt={game.name}
                  className="pig-game-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className={`pig-status-dot ${isInstalled ? 'installed' : ''}`} />
              </div>
            </button>
          );
        })}
      </nav>

      <div className="pig-spacer" />

      {/* Offline badge */}
      {isOfflineMode && (
        <div className="pig-offline-badge" title="Offline Mode">
          <span>Offline</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
        </div>
      )}
    </aside>
  );
};
