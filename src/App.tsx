import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useLanguage } from './hooks/useLanguage';
import './App.css';

// Hooks
import { useGameManager } from './hooks/useGameManager';
import { useDownloadQueue } from './hooks/useDownloadQueue';
import { useNews } from './hooks/useNews';

// Components
import { BackgroundLayer } from './components/BackgroundLayer';
import { TopBar } from './components/TopBar';
import { LauncherActionArea } from './components/LauncherActionArea';
import { LauncherNewsPanel } from './components/LauncherNewsPanel';
import { GameSwitcher } from './components/GameSwitcher';
import { SettingsPanel } from './components/SettingsPanel'; // We will reuse existing settings panel for now

function App() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const {
    games,
    selectedGame,
    setSelectedGame,
    isLoading,
    error,
    isOfflineMode,
    loadLauncher
  } = useGameManager();

  const { startDownload, getDownloadProgress, isDownloading } = useDownloadQueue();
  const { news } = useNews();

  const [showSettings, setShowSettings] = useState(false);

  // Read settings
  const [minimizeToTray, setMinimizeToTray] = useState(() => localStorage.getItem('launcher-minimize-to-tray') === 'true');
  const [startupWithWindows, setStartupWithWindows] = useState(() => localStorage.getItem('launcher-startup-with-windows') === 'true');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => 'dark'); // Force dark for immersive

  // Disable DevTools in Production
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Settings persist
  useEffect(() => {
    localStorage.setItem('launcher-theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('launcher-minimize-to-tray', minimizeToTray.toString());
    localStorage.setItem('launcher-startup-with-windows', startupWithWindows.toString());
  }, [currentTheme, minimizeToTray, startupWithWindows]);

  // Initial Game Select logic (auto-select first game if none selected)
  useEffect(() => {
    if (!selectedGame && games.length > 0) {
      setSelectedGame(games[0]);
    }
  }, [games, selectedGame, setSelectedGame]);


  if (isLoading) {
    return (
      <div className="app-immersive">
        <div className="loading-screen">
          <h2 style={{ color: 'var(--primary)' }}>LOADING SECURE CONNECTION...</h2>
        </div>
      </div>
    );
  }

  if (error && !isOfflineMode) {
    return (
      <div className="app-immersive">
        <div className="error-screen" style={{ flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ color: '#ef4444' }}>CONNECTION FAILED</h2>
          <p>{error}</p>
          <button onClick={loadLauncher} className="primary-action-btn" style={{ width: '200px', height: '50px', fontSize: '16px' }}>
            RETRY
          </button>
        </div>
      </div>
    );
  }

  const currentDownloadProgress = selectedGame ? getDownloadProgress(selectedGame.id) : null;
  const isSelectedGameDownloading = selectedGame ? isDownloading(selectedGame.id) : false;

  const handleDownload = async () => {
    if (selectedGame) {
      await startDownload(selectedGame);
    }
  };

  const handleLaunch = async () => {
    if (selectedGame?.executable_path) {
      try {
        await invoke('launch_game', { executablePath: selectedGame.executable_path });
      } catch (err) {
        console.error('Failed to launch:', err);
      }
    }
  };

  return (
    <div className="app-immersive">
      {/* 1. Underlying Dynamic Background */}
      <BackgroundLayer game={selectedGame} />

      {/* 2. Top Window Controls */}
      <TopBar onSettingsClick={() => setShowSettings(true)} />

      {/* 3. Floating Content Layers (News & Actions) */}
      <div className="content-layer">
        
        {/* Left Side: News & Notices */}
        <LauncherNewsPanel news={news} selectedGameId={selectedGame?.id} />

        {/* Right Side: Action Area (Launch/Update/Download) */}
        <LauncherActionArea 
          game={selectedGame}
          downloadProgress={currentDownloadProgress || null}
          isDownloading={isSelectedGameDownloading}
          onDownload={handleDownload}
          onLaunch={handleLaunch}
          isOfflineMode={isOfflineMode}
        />
      </div>

      {/* 4. Drawer/Flyout for Game Selection */}
      <GameSwitcher 
        games={games} 
        selectedGameId={selectedGame?.id} 
        onSelectGame={setSelectedGame} 
      />

      {/* 5. Modals - Settings */}
      {showSettings && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)' }}>
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
            minimizeToTray={minimizeToTray}
            setMinimizeToTray={setMinimizeToTray}
            startupWithWindows={startupWithWindows}
            setStartupWithWindows={setStartupWithWindows}
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            onReload={loadLauncher}
          />
        </div>
      )}
    </div>
  );
}

export default App;