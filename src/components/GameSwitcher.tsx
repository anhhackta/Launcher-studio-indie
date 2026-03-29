import React, { useState } from 'react';
import { GameInfo } from '../types';

interface GameSwitcherProps {
  games: GameInfo[];
  selectedGameId: string | undefined;
  onSelectGame: (game: GameInfo) => void;
}

export const GameSwitcher: React.FC<GameSwitcherProps> = ({ games, selectedGameId, onSelectGame }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`game-switcher-drawer ${isOpen ? 'open' : ''}`}>
      <button 
        className="switcher-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="switcher-icon">☰</span>
        {isOpen ? 'ĐÓNG' : 'CHỌN GAME'}
      </button>

      {isOpen && (
        <div className="switcher-list">
          {games.map(game => (
            <div 
              key={game.id} 
              className={`switcher-item ${game.id === selectedGameId ? 'active' : ''}`}
              onClick={() => {
                onSelectGame(game);
                setIsOpen(false);
              }}
            >
              <img src={game.logo_url || game.image_url} alt={game.name} />
              <div className="switcher-item-name">{game.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
