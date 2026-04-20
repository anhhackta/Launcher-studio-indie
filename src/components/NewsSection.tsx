import React, { useState } from 'react';
import type { NewsItem } from '../types';

interface NewsSectionProps {
  news: NewsItem[];
  gameId: string | undefined;
}

type NewsTab = 'announcement' | 'update' | 'all';

const NEWS_TABS: { id: NewsTab; label: string }[] = [
  { id: 'announcement', label: 'Thông Báo' },
  { id: 'update', label: 'Tin Tức' },
  { id: 'all', label: 'Tất Cả' },
];

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news, gameId }) => {
  const [activeTab, setActiveTab] = useState<NewsTab>('announcement');

  const filtered = news.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'announcement') return n.type === 'announcement' || n.pinned;
    if (activeTab === 'update') return n.type === 'update' || n.type === 'event';
    return true;
  });

  return (
    <div className="news-section">
      {/* Thumbnail preview of the first pinned news */}
      <div className="news-thumb-area">
        {news.filter(n => n.image_url).slice(0, 1).map(n => (
          <div key={n.id} className="news-thumb-card">
            <img src={n.image_url} alt={n.title} className="news-thumb-img" />
            <div className="news-thumb-overlay">
              {n.pinned && <span className="news-pin-badge">PINNED</span>}
              <p className="news-thumb-title">{n.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab header */}
      <div className="news-tabs">
        {NEWS_TABS.map(tab => (
          <button
            key={tab.id}
            className={`news-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News list */}
      <div className="news-list">
        {filtered.length === 0 ? (
          <div className="news-empty">Không có tin tức</div>
        ) : (
          filtered.slice(0, 4).map(item => (
            <div key={item.id} className={`news-item ${item.read ? 'read' : ''}`}>
              {item.pinned && <span className="news-dot pinned" />}
              {!item.pinned && <span className="news-dot" />}
              <span className="news-item-title">{item.title}</span>
              <span className="news-item-date">{formatDate(item.date)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
