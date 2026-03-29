import React from 'react';
import { NewsItem } from '../types';

interface LauncherNewsPanelProps {
  news: NewsItem[];
  selectedGameId?: string;
}

export const LauncherNewsPanel: React.FC<LauncherNewsPanelProps> = ({ news, selectedGameId }) => {
  // Filter news for current game
  const relevantNews = news.filter(n => !n.game_id || n.game_id === selectedGameId).slice(0, 5);

  if (relevantNews.length === 0) return null;

  return (
    <div className="news-panel">
      <div className="news-header">
        <h3>Tin Tức & Sự Kiện</h3>
      </div>
      <div className="news-list">
        {relevantNews.map(item => (
          <div key={item.id} className="news-item">
            <div className={`news-tag tag-${item.type}`}>{item.type.toUpperCase()}</div>
            <span className="news-date">{item.date}</span>
            <div className="news-title">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
