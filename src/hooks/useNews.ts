import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { NewsItem } from '../types';

export function useNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await invoke<NewsItem[]>('get_news');
            setNews(result);
        } catch (err) {
            console.error('Failed to fetch news:', err);
            setError(err as string);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const getGameNews = (gameId: string) => {
        return news.filter(n => n.game_id === gameId || !n.game_id);
    };

    const getPinnedNews = () => {
        return news.filter(n => n.pinned);
    };

    const getRecentNews = (count: number = 5) => {
        return [...news]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, count);
    };

    const markAsRead = (newsId: string) => {
        setNews(prev => prev.map(n =>
            n.id === newsId ? { ...n, read: true } : n
        ));
        // Persist to localStorage
        const readNews = JSON.parse(localStorage.getItem('read-news') || '[]');
        if (!readNews.includes(newsId)) {
            readNews.push(newsId);
            localStorage.setItem('read-news', JSON.stringify(readNews));
        }
    };

    // Check read status from localStorage on load
    useEffect(() => {
        const readNews = JSON.parse(localStorage.getItem('read-news') || '[]');
        if (readNews.length > 0 && news.length > 0) {
            setNews(prev => prev.map(n => ({
                ...n,
                read: readNews.includes(n.id)
            })));
        }
    }, [news.length]);

    return {
        news,
        loading,
        error,
        fetchNews,
        getGameNews,
        getPinnedNews,
        getRecentNews,
        markAsRead
    };
}
