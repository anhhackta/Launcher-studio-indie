import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';

import { useLanguage } from './hooks/useLanguage';
import { useGameManager } from './hooks/useGameManager';
import { useDownloadQueue } from './hooks/useDownloadQueue';
import { useNews } from './hooks/useNews';

import { PanelIconGame } from './components/PanelIconGame';
import { PanelMain } from './components/PanelMain';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const {
    games, selectedGame, setSelectedGame,
    isLoading, error, isOfflineMode, loadLauncher,
  } = useGameManager();
  const { startDownload, getDownloadProgress, isDownloading, addToQueue } = useDownloadQueue();
  const { news } = useNews();

  const [showSettings, setShowSettings] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(
    () => localStorage.getItem('launcher-minimize-to-tray') === 'true'
  );
  const [startupWithWindows, setStartupWithWindows] = useState(
    () => localStorage.getItem('launcher-startup-with-windows') === 'true'
  );

  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key))) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', block);
    return () => document.removeEventListener('keydown', block);
  }, []);

  useEffect(() => {
    localStorage.setItem('launcher-minimize-to-tray', minimizeToTray.toString());
    localStorage.setItem('launcher-startup-with-windows', startupWithWindows.toString());
  }, [minimizeToTray, startupWithWindows]);

  useEffect(() => {
    if (!selectedGame && games.length > 0) setSelectedGame(games[0]);
  }, [games, selectedGame, setSelectedGame]);

  const handleLaunch = async () => {
    if (!selectedGame?.executable_path) return;
    try {
      await invoke('launch_game', { executablePath: selectedGame.executable_path });
    } catch (err) {
      console.error('Launch error:', err);
    }
  };

  const handleDownload = async () => {
    if (!selectedGame || !selectedGame.download_url) return;
    addToQueue(selectedGame);
    await startDownload(selectedGame);
    loadLauncher();
  };

  const currentDownloadProgress = selectedGame ? getDownloadProgress(selectedGame.id) : undefined;
  const isSelectedGameDownloading = selectedGame ? isDownloading(selectedGame.id) : false;
  const bgUrl = selectedGame?.banner_url || selectedGame?.image_url || '';

  // ── LOADING ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <img src="/logo.png" alt="AntChill" className="loading-logo" />
          <div className="loading-spinner" />
          <p className="loading-text">ANTCHILL LAUNCHER</p>
        </div>
      </div>
    );
  }

  if (error && !isOfflineMode) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <img src="/logo.png" alt="AntChill" className="loading-logo" />
          <p className="error-title">CONNECTION ERROR</p>
          <p className="error-detail">{error}</p>
          <button className="error-retry-btn" onClick={loadLauncher}>RETRY</button>
        </div>
      </div>
    );
  }

  // ── MAIN ────────────────────────────────────────
  return (
    <div className="app-root">
      {/* Background blur */}
      <div className="splash-vfx" style={{ backgroundImage: `url(${bgUrl})` }} />

      {/* PanelIconGame — directly in app-root, no wrapper */}
      <PanelIconGame
        games={games}
        selectedGameId={selectedGame?.id}
        onSelectGame={setSelectedGame}
        isOfflineMode={isOfflineMode}
      />

      {/* PanelMain — directly in app-root, no wrapper */}
      <PanelMain
        game={selectedGame}
        news={news}
        downloadProgress={currentDownloadProgress}
        isDownloading={isSelectedGameDownloading}
        isOfflineMode={isOfflineMode}
        onLaunch={handleLaunch}
        onDownload={handleDownload}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Settings */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <SettingsPanel
              onClose={() => setShowSettings(false)}
              currentLanguage={currentLanguage}
              changeLanguage={changeLanguage}
              minimizeToTray={minimizeToTray}
              setMinimizeToTray={setMinimizeToTray}
              startupWithWindows={startupWithWindows}
              setStartupWithWindows={setStartupWithWindows}
              currentTheme="dark"
              setCurrentTheme={() => {}}
              onReload={loadLauncher}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;