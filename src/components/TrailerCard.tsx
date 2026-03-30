import React from 'react';
import { GameInfo } from '../types';

interface TrailerCardProps {
  game: GameInfo | null;
}

export const TrailerCard: React.FC<TrailerCardProps> = ({ game }) => {
  // Try to use a screenshot or banner, fallback to default
  const trailerBg = game?.screenshots?.[0] || game?.banner_url || game?.image_url;

  return (
    <div className="trailer-card">
      <div 
        className="trailer-image-wrapper" 
        style={{ backgroundImage: `url(${trailerBg})` }}
      >
        <button className="btn-play-trailer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
      </div>
      <div className="trailer-label">Play Trailer</div>
    </div>
  );
};
