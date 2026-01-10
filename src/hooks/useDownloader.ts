import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { DownloadProgress, GameInfo } from '../types';

export function useDownloader() {
    const [downloading, setDownloading] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

    useEffect(() => {
        const unlisten = listen<DownloadProgress>('download_progress', (event) => {
            const progress = event.payload;
            setDownloadProgress(progress);

            if (progress.status === 'completed') {
                // Clear after a short delay
                setTimeout(() => {
                    setDownloading(null);
                    setDownloadProgress(null);
                }, 1000);
            } else if (progress.status === 'error') {
                setDownloading(null);
                setDownloadProgress(null);
            }
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const downloadGame = async (game: GameInfo): Promise<boolean> => {
        if (!game.download_url) {
            console.error('No download URL for game:', game.id);
            return false;
        }

        setDownloading(game.id);
        setDownloadProgress({
            game_id: game.id,
            progress: 0,
            speed: '0 MB/s',
            downloaded: '0 MB',
            total: game.file_size || 'Unknown',
            status: 'downloading'
        });

        try {
            await invoke('download_game', {
                gameId: game.id,
                downloadUrl: game.download_url,
                expectedChecksum: game.download_checksum || null
            });

            return true;
        } catch (err) {
            console.error('Download failed:', err);
            setDownloading(null);
            setDownloadProgress(null);
            alert(`Tải về thất bại: ${err}`);
            return false;
        }
    };

    return {
        downloading,
        downloadProgress,
        downloadGame
    };
}
