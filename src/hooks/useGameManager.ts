import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { GameInfo, NetworkStatus } from '../types';

export function useGameManager() {
    const [games, setGames] = useState<GameInfo[]>([]);
    const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    const loadLauncher = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Try to load games first
            const gamesResult = await invoke<GameInfo[]>('get_games');

            // Check network status
            const networkResult = await invoke<NetworkStatus>('check_network_status');
            setIsOfflineMode(!networkResult.is_online);

            // Scan for installed games
            try {
                const scannedGames = await invoke<GameInfo[]>('scan_local_games', { games: gamesResult });
                setGames(scannedGames);
            } catch (scanError) {
                console.error('Local scan failed, using manifest games:', scanError);
                setGames(gamesResult);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Failed to load launcher:', err);
            setIsOfflineMode(true);

            try {
                const offlineGames = await invoke<GameInfo[]>('get_offline_games');
                setGames(offlineGames);
            } catch (offlineErr) {
                console.error('Failed to load offline data:', offlineErr);
                setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng.');
            }

            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLauncher();

        // Check connection periodically
        const checkConnectionInterval = setInterval(async () => {
            try {
                const result = await invoke<NetworkStatus>('check_network_status');

                if (result.is_online && isOfflineMode) {
                    setIsOfflineMode(false);
                    setError(null);
                    loadLauncher();
                } else if (!result.is_online && !isOfflineMode) {
                    setIsOfflineMode(true);
                }
            } catch (err) {
                console.error('Connection check failed:', err);
            }
        }, 30000);

        return () => clearInterval(checkConnectionInterval);
    }, [isOfflineMode, loadLauncher]);

    const refreshGames = useCallback(async () => {
        try {
            const gamesResult = await invoke<GameInfo[]>('get_games');
            const scannedGames = await invoke<GameInfo[]>('scan_local_games', { games: gamesResult });
            setGames(scannedGames);

            // Update selected game if it exists
            if (selectedGame) {
                const updated = scannedGames.find(g => g.id === selectedGame.id);
                if (updated) {
                    setSelectedGame(updated);
                }
            }
        } catch (err) {
            console.error('Failed to refresh games:', err);
        }
    }, [selectedGame]);

    const getInstalledGames = useCallback(() => {
        return games.filter(g => g.executable_path);
    }, [games]);

    const getAvailableGames = useCallback(() => {
        return games.filter(g => !g.is_coming_soon && g.status === 'available');
    }, [games]);

    const getGamesByCategory = useCallback((categoryId: string) => {
        if (categoryId === 'all') return games;
        return games.filter(g => g.category_id === categoryId);
    }, [games]);

    return {
        games,
        selectedGame,
        setSelectedGame,
        isLoading,
        error,
        isOfflineMode,
        loadLauncher,
        refreshGames,
        setGames,
        getInstalledGames,
        getAvailableGames,
        getGamesByCategory
    };
}
