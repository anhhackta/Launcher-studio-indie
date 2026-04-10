import { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { NewsItem } from '../types';

export function useNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Track whether read status has been applied to avoid infinite loops
    const readStatusApplied = useRef(false);

    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            readStatusApplied.current = false;
            const result = await invoke<NewsItem[]>('get_news');
            setNews(result);
        } catch (err) {
            console.error('Failed to fetch news:', err);
            setError(err as string);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Apply read status from localStorage ONCE after news are fetched
    useEffect(() => {
        if (readStatusApplied.current || news.length === 0) return;

        const readNewsIds: string[] = JSON.parse(localStorage.getItem('read-news') || '[]');
        if (readNewsIds.length > 0) {
            setNews(prev => prev.map(n => ({
                ...n,
                read: readNewsIds.includes(n.id)
            })));
        }
        readStatusApplied.current = true;
    }, [news.length]);

    const getGameNews = useCallback((gameId: string) => {
        return news.filter(n => n.game_id === gameId || !n.game_id);
    }, [news]);

    const getPinnedNews = useCallback(() => {
        return news.filter(n => n.pinned);
    }, [news]);

    const getRecentNews = useCallback((count: number = 5) => {
        return [...news]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, count);
    }, [news]);

    const markAsRead = useCallback((newsId: string) => {
        setNews(prev => prev.map(n =>
            n.id === newsId ? { ...n, read: true } : n
        ));
        const readNews: string[] = JSON.parse(localStorage.getItem('read-news') || '[]');
        if (!readNews.includes(newsId)) {
            readNews.push(newsId);
            localStorage.setItem('read-news', JSON.stringify(readNews));
        }
    }, []);

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
