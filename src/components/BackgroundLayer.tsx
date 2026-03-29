import React from 'react';
import { GameInfo } from '../types';

interface BackgroundLayerProps {
  game: GameInfo | null;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ game }) => {
  // Use banner_url or image_url for the immersive background
  const bgUrl = game ? (game.banner_url || game.image_url) : '/default-bg.jpg';

  return (
    <div className="background-layer">
      <div 
        className="background-image" 
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div className="background-vignette" />
      <div className="background-tech-grid" />
    </div>
  );
};
