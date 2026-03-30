import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { useLanguage } from './hooks/useLanguage';
import './App.css';

// Hooks
import { useGameManager } from './hooks/useGameManager';
import { useDownloadQueue } from './hooks/useDownloadQueue';
import { useNews } from './hooks/useNews';

// Soft Glass Components
import { SidebarNav } from './components/SidebarNav';
import { MainHeroArt } from './components/MainHeroArt';
import { DownloadStatusPill } from './components/DownloadStatusPill';
import { RightInfoPanel } from './components/RightInfoPanel';
import { TrailerCard } from './components/TrailerCard';
import { SettingsPanel } from './components/SettingsPanel'; // Reuse
import { GameSwitcher } from './components/GameSwitcher'; // To handle search/switching

function App() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { games, selectedGame, setSelectedGame, isLoading, error, isOfflineMode, loadLauncher } = useGameManager();
  const { startDownload, getDownloadProgress, isDownloading } = useDownloadQueue();
  const { news } = useNews();

  const [showSettings, setShowSettings] = useState(false);
  const [showGameSwitcher, setShowGameSwitcher] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(() => localStorage.getItem('launcher-minimize-to-tray') === 'true');
  const [startupWithWindows, setStartupWithWindows] = useState(() => localStorage.getItem('launcher-startup-with-windows') === 'true');

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

  useEffect(() => {
    localStorage.setItem('launcher-minimize-to-tray', minimizeToTray.toString());
    localStorage.setItem('launcher-startup-with-windows', startupWithWindows.toString());
  }, [minimizeToTray, startupWithWindows]);

  useEffect(() => {
    if (!selectedGame && games.length > 0) {
      setSelectedGame(games[0]);
    }
  }, [games, selectedGame, setSelectedGame]);

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <h2 className="heading-font" style={{ color: 'var(--text-main)' }}>SYSTEM BOOTING...</h2>
        </div>
      </div>
    );
  }

  if (error && !isOfflineMode) {
    return (
      <div className="app-container">
        <div className="error-screen" style={{ flexDirection: 'column', gap: '20px' }}>
          <h2 className="heading-font" style={{ color: '#ef4444' }}>CONNECT ERROR</h2>
          <p>{error}</p>
          <button onClick={loadLauncher} className="btn-adventure" style={{ width: '200px' }}>
            <span>RETRY</span>
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = async () => { if (selectedGame) await startDownload(selectedGame); };
  const handleLaunch = async () => {
    if (selectedGame?.executable_path) {
      try {
        await invoke('launch_game', { executablePath: selectedGame.executable_path });
      } catch (err) {
        console.error('Launch error:', err);
      }
    }
  };

  const currentDownloadProgress = selectedGame ? getDownloadProgress(selectedGame.id) : null;
  const isSelectedGameDownloading = selectedGame ? isDownloading(selectedGame.id) : false;
  const upcomingGameInfo = news.find(n => n.type === 'event' || n.type === 'update');

  const bgUrl = selectedGame ? (selectedGame.banner_url || selectedGame.image_url) : '';

  return (
    <div className="app-container">
      {/* 1. Underlying Blurred Background */}
      <div className="bg-vfx" style={{ backgroundImage: `url(${bgUrl})` }} />

      {/* 2. Main Glassboard */}
      <div className="main-glass-board">
        
        {/* Window controls */}
        <div className="window-controls-float">
          <button className="window-ctrl-btn window-minimize" onClick={() => appWindow.minimize()} />
          <button className="window-ctrl-btn window-close" onClick={() => appWindow.close()} />
        </div>

        {/* 2.1 Sidebar */}
        <SidebarNav
          onSettingsClick={() => setShowSettings(true)}
          onHomeClick={() => setShowGameSwitcher(!showGameSwitcher)}
          onProfileClick={() => {/* Profile modal logic */}}
        />

        {/* Game Switcher Flyout */}
        {showGameSwitcher && (
           <div style={{ position: 'absolute', top: 50, left: 100, zIndex: 1000 }}>
             <GameSwitcher games={games} selectedGameId={selectedGame?.id} onSelectGame={(g) => { setSelectedGame(g); setShowGameSwitcher(false); }} />
           </div>
        )}

        {/* 2.2 Hero Area */}
        <MainHeroArt 
          game={selectedGame} 
          onLaunch={handleLaunch} 
          isDownloading={isSelectedGameDownloading} 
        />

        {/* 2.3 Download Pill (Floating overlay) */}
        <DownloadStatusPill 
          game={selectedGame}
          downloadProgress={currentDownloadProgress || null}
          isDownloading={isSelectedGameDownloading}
          onDownload={handleDownload}
          isOfflineMode={isOfflineMode}
        />

        {/* 2.4 Right Panels */}
        <div className="right-panel">
          <RightInfoPanel upcomingGame={upcomingGameInfo} />
          <TrailerCard game={selectedGame} />
        </div>

      </div>

      {/* Modals */}
      {showSettings && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
            minimizeToTray={minimizeToTray}
            setMinimizeToTray={setMinimizeToTray}
            startupWithWindows={startupWithWindows}
            setStartupWithWindows={setStartupWithWindows}
            currentTheme="light" // Force light theme constants to match glassmorphism
            setCurrentTheme={() => {}} 
            onReload={loadLauncher}
          />
        </div>
      )}
    </div>
  );
}

export default App;