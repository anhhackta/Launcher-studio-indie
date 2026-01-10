import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { DownloadProgress, DownloadQueueItem, GameInfo } from '../types';

export function useDownloadQueue() {
    const [queue, setQueue] = useState<DownloadQueueItem[]>([]);
    const [activeDownloads, setActiveDownloads] = useState<Map<string, DownloadProgress>>(new Map());

    // Listen for download progress events
    useEffect(() => {
        const unlisten = listen<DownloadProgress>('download_progress', (event) => {
            const progress = event.payload;

            setActiveDownloads(prev => {
                const newMap = new Map(prev);

                if (progress.status === 'completed' || progress.status === 'error') {
                    newMap.delete(progress.game_id);

                    // Update queue item status
                    setQueue(q => q.map(item =>
                        item.game_id === progress.game_id
                            ? { ...item, status: progress.status, progress: progress.progress }
                            : item
                    ));
                } else {
                    newMap.set(progress.game_id, progress);

                    // Update queue item
                    setQueue(q => q.map(item =>
                        item.game_id === progress.game_id
                            ? {
                                ...item,
                                status: progress.status,
                                progress: progress.progress,
                                speed: progress.speed,
                                eta: progress.eta || ''
                            }
                            : item
                    ));
                }

                return newMap;
            });
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const addToQueue = useCallback((game: GameInfo, priority: number = 0) => {
        const queueItem: DownloadQueueItem = {
            game_id: game.id,
            game_name: game.name,
            status: 'queued',
            progress: 0,
            speed: '0 MB/s',
            downloaded: '0 MB',
            total: game.file_size || 'Unknown',
            eta: '',
            added_at: Date.now(),
            priority
        };

        setQueue(prev => {
            // Don't add if already in queue
            if (prev.some(item => item.game_id === game.id)) {
                return prev;
            }
            return [...prev, queueItem].sort((a, b) => b.priority - a.priority);
        });

        return queueItem;
    }, []);

    const startDownload = useCallback(async (game: GameInfo) => {
        if (!game.download_url) {
            console.error('No download URL for game:', game.id);
            return false;
        }

        try {
            // Update status to downloading
            setQueue(q => q.map(item =>
                item.game_id === game.id
                    ? { ...item, status: 'downloading' as const }
                    : item
            ));

            await invoke('download_game', {
                gameId: game.id,
                downloadUrl: game.download_url,
                expectedChecksum: game.download_checksum || null
            });

            // Remove from queue on success
            setQueue(q => q.filter(item => item.game_id !== game.id));

            return true;
        } catch (err) {
            console.error('Download failed:', err);

            // Update status to error
            setQueue(q => q.map(item =>
                item.game_id === game.id
                    ? { ...item, status: 'error' as const, error_message: err as string }
                    : item
            ));

            return false;
        }
    }, []);

    const pauseDownload = useCallback((gameId: string) => {
        setQueue(q => q.map(item =>
            item.game_id === gameId && item.status === 'downloading'
                ? { ...item, status: 'paused' as const }
                : item
        ));
        // Note: Actual pause functionality would require backend support
    }, []);

    const resumeDownload = useCallback((gameId: string) => {
        setQueue(q => q.map(item =>
            item.game_id === gameId && item.status === 'paused'
                ? { ...item, status: 'queued' as const }
                : item
        ));
        // Note: Resume would re-trigger download
    }, []);

    const cancelDownload = useCallback((gameId: string) => {
        setQueue(q => q.filter(item => item.game_id !== gameId));
        setActiveDownloads(prev => {
            const newMap = new Map(prev);
            newMap.delete(gameId);
            return newMap;
        });
    }, []);

    const getDownloadProgress = useCallback((gameId: string): DownloadProgress | undefined => {
        return activeDownloads.get(gameId);
    }, [activeDownloads]);

    const isDownloading = useCallback((gameId: string): boolean => {
        return activeDownloads.has(gameId) || queue.some(
            item => item.game_id === gameId && item.status === 'downloading'
        );
    }, [activeDownloads, queue]);

    const getQueuePosition = useCallback((gameId: string): number => {
        const index = queue.findIndex(item => item.game_id === gameId);
        return index >= 0 ? index + 1 : -1;
    }, [queue]);

    return {
        queue,
        activeDownloads: Array.from(activeDownloads.values()),
        addToQueue,
        startDownload,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        getDownloadProgress,
        isDownloading,
        getQueuePosition
    };
}
