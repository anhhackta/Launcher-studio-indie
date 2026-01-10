import React from 'react';
import { GameInfo } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface SidebarProps {
    games: GameInfo[];
    selectedGame: GameInfo | null;
    onSelectGame: (game: GameInfo) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ games, selectedGame, onSelectGame }) => {
    const { t } = useLanguage();

    return (
        <div className="game-sidebar">
            <h3>{t('launcher.games.title')}</h3>
            {games.map((game) => (
                <div
                    key={game.id}
                    className={`game-item ${selectedGame?.id === game.id ? 'selected' : ''}`}
                    onClick={() => onSelectGame(game)}
                >
                    <div className="game-logo-container">
                        {game.logo_url ? (
                            <img
                                src={game.logo_url}
                                alt={`${game.name} Logo`}
                                className="game-logo"
                            />
                        ) : (
                            <img
                                src={game.image_url}
                                alt={game.name}
                                className="game-icon"
                            />
                        )}
                    </div>
                    <div className="game-info">
                        <h4>{game.name}</h4>
                        <p>v{game.version}</p>
                        <span className={`status ${game.status}`}>
                            {game.status === 'available' ? t('launcher.games.available') : t('launcher.games.coming_soon')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
