import React, { useState, useMemo } from 'react';
import { GameInfo, Category, FilterState, ViewMode } from '../types';

interface GameLibraryProps {
    games: GameInfo[];
    categories: Category[];
    selectedGame: GameInfo | null;
    onSelectGame: (game: GameInfo) => void;
}

export const GameLibrary: React.FC<GameLibraryProps> = ({
    games,
    categories,
    selectedGame,
    onSelectGame
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filter, setFilter] = useState<FilterState>({
        category: 'all',
        search: '',
        installed_only: false,
        sort: { by: 'name', direction: 'asc' }
    });

    const filteredGames = useMemo(() => {
        let result = [...games];

        // Category filter
        if (filter.category !== 'all') {
            result = result.filter(g => g.category_id === filter.category);
        }

        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            result = result.filter(g =>
                g.name.toLowerCase().includes(searchLower) ||
                g.description.toLowerCase().includes(searchLower) ||
                g.tags?.some(t => t.toLowerCase().includes(searchLower))
            );
        }

        // Installed only filter
        if (filter.installed_only) {
            result = result.filter(g => g.executable_path);
        }

        // Sorting
        result.sort((a, b) => {
            let comparison = 0;
            switch (filter.sort.by) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = (a.release_date || '').localeCompare(b.release_date || '');
                    break;
                case 'size':
                    comparison = (a.file_size_bytes || 0) - (b.file_size_bytes || 0);
                    break;
            }
            return filter.sort.direction === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [games, filter]);

    const getStatusBadge = (game: GameInfo) => {
        if (game.is_coming_soon) return { text: 'Sắp ra mắt', class: 'coming-soon' };
        if (game.status === 'update_available') return { text: 'Có cập nhật', class: 'update' };
        if (game.executable_path) return { text: 'Đã cài đặt', class: 'installed' };
        return { text: 'Chưa cài đặt', class: 'not-installed' };
    };

    return (
        <div className="game-library">
            {/* Toolbar */}
            <div className="library-toolbar">
                <div className="library-search">
                    <input
                        type="text"
                        placeholder="🔍 Tìm kiếm game..."
                        value={filter.search}
                        onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                    />
                </div>

                <div className="library-filters">
                    <select
                        value={filter.category}
                        onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>

                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={filter.installed_only}
                            onChange={(e) => setFilter(f => ({ ...f, installed_only: e.target.checked }))}
                        />
                        <span>Đã cài đặt</span>
                    </label>
                </div>

                <div className="library-view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        ⊞
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Game Grid/List */}
            <div className={`library-games ${viewMode}`}>
                {filteredGames.map(game => {
                    const status = getStatusBadge(game);

                    return (
                        <div
                            key={game.id}
                            className={`library-game-card glass-card ${selectedGame?.id === game.id ? 'selected' : ''}`}
                            onClick={() => onSelectGame(game)}
                        >
                            <div className="game-card-image">
                                <img src={game.banner_url || game.image_url} alt={game.name} />
                                <div className="game-card-overlay">
                                    <span className={`status-badge ${status.class}`}>
                                        {status.text}
                                    </span>
                                </div>
                            </div>

                            <div className="game-card-info">
                                {game.logo_url && (
                                    <img
                                        src={game.logo_url}
                                        alt={`${game.name} logo`}
                                        className="game-card-logo"
                                    />
                                )}
                                <h4>{game.name}</h4>
                                <div className="game-card-meta">
                                    <span className="game-version">v{game.version}</span>
                                    {game.file_size && (
                                        <span className="game-size">{game.file_size}</span>
                                    )}
                                </div>
                                {game.tags && game.tags.length > 0 && (
                                    <div className="game-card-tags">
                                        {game.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredGames.length === 0 && (
                <div className="library-empty">
                    <span>🎮</span>
                    <p>Không tìm thấy game nào</p>
                </div>
            )}
        </div>
    );
};
