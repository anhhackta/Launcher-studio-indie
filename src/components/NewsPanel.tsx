import React from 'react';
import { NewsItem } from '../types';

interface NewsPanelProps {
    news: NewsItem[];
    selectedGameId?: string;
    onNewsClick?: (news: NewsItem) => void;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ news, selectedGameId, onNewsClick }) => {
    const filteredNews = selectedGameId
        ? news.filter(n => !n.game_id || n.game_id === selectedGameId)
        : news;

    const pinnedNews = filteredNews.filter(n => n.pinned);
    const regularNews = filteredNews.filter(n => !n.pinned);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'announcement': return '📢';
            case 'update': return '🔄';
            case 'event': return '🎉';
            case 'maintenance': return '🔧';
            default: return '📰';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'announcement': return 'var(--accent-primary)';
            case 'update': return '#10b981';
            case 'event': return '#f59e0b';
            case 'maintenance': return '#ef4444';
            default: return 'var(--text-secondary)';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="news-panel">
            <div className="news-header">
                <h3>📰 Tin tức & Cập nhật</h3>
            </div>

            {pinnedNews.length > 0 && (
                <div className="news-pinned">
                    {pinnedNews.map(item => (
                        <div
                            key={item.id}
                            className="news-item news-item-pinned glass-card"
                            onClick={() => onNewsClick?.(item)}
                        >
                            {item.image_url && (
                                <div className="news-image">
                                    <img src={item.image_url} alt={item.title} />
                                    <div className="news-pinned-badge">📌 Ghim</div>
                                </div>
                            )}
                            <div className="news-content">
                                <div className="news-meta">
                                    <span
                                        className="news-type"
                                        style={{ color: getTypeColor(item.type) }}
                                    >
                                        {getTypeIcon(item.type)} {item.type}
                                    </span>
                                    <span className="news-date">{formatDate(item.date)}</span>
                                </div>
                                <h4 className="news-title">{item.title}</h4>
                                <p className="news-excerpt">{item.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="news-list">
                {regularNews.map(item => (
                    <div
                        key={item.id}
                        className="news-item glass-card"
                        onClick={() => onNewsClick?.(item)}
                    >
                        <div className="news-content">
                            <div className="news-meta">
                                <span
                                    className="news-type"
                                    style={{ color: getTypeColor(item.type) }}
                                >
                                    {getTypeIcon(item.type)} {item.type}
                                </span>
                                <span className="news-date">{formatDate(item.date)}</span>
                            </div>
                            <h4 className="news-title">{item.title}</h4>
                            <p className="news-excerpt">{item.content.substring(0, 100)}...</p>
                        </div>
                        {item.image_url && (
                            <div className="news-thumbnail">
                                <img src={item.image_url} alt={item.title} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredNews.length === 0 && (
                <div className="news-empty">
                    <span>📭</span>
                    <p>Chưa có tin tức nào</p>
                </div>
            )}
        </div>
    );
};
