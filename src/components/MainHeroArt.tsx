import React from 'react';
import { GameInfo } from '../types';

interface MainHeroArtProps {
  game: GameInfo | null;
  onLaunch: (game: GameInfo) => void;
  isDownloading: boolean;
}

export const MainHeroArt: React.FC<MainHeroArtProps> = ({ game, onLaunch, isDownloading }) => {
  if (!game) return <div className="hero-wrapper"><div className="hero-image-card"></div></div>;

  const bgUrl = game.banner_url || game.image_url;
  const isInstalled = !!game.executable_path;

  // Emulate split title rendering for effect if desired, else just use the name
  return (
    <div className="hero-wrapper">
      <div 
        className="hero-image-card" 
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className="hero-overlay-card">
          <div className="hero-project-id">Project {game.id.substring(0,2).toUpperCase()}</div>
          <h1 className="hero-game-title">
            {game.name} <span>X</span>
          </h1>
          
          <button 
            className="btn-adventure" 
            onClick={() => onLaunch(game)}
            disabled={!isInstalled || isDownloading}
          >
            <span>{isInstalled ? 'Start Adventure' : 'Not Installed'}</span>
            <div className="btn-cyan-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
