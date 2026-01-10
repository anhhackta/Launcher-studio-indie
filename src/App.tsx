import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useLanguage } from './hooks/useLanguage';
import './App.css';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GameDetails } from './components/GameDetails';
import { SettingsPanel } from './components/SettingsPanel';
import { NewsPanel } from './components/NewsPanel';
import { GameLibrary } from './components/GameLibrary';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { useGameManager } from './hooks/useGameManager';
import { useDownloadQueue } from './hooks/useDownloadQueue';
import { useNews } from './hooks/useNews';
import { GameInfo, Category } from './types';

type ViewState = 'home' | 'library' | 'game' | 'news';

function App() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const {
    games,
    selectedGame,
    setSelectedGame,
    isLoading,
    error,
    isOfflineMode,
    loadLauncher,
    setGames
  } = useGameManager();

  const { queue, startDownload, getDownloadProgress, isDownloading } = useDownloadQueue();
  const { news, getGameNews } = useNews();

  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'All Games', icon: '🎮' }
  ]);

  const [minimizeToTray, setMinimizeToTray] = useState(() => {
    const saved = localStorage.getItem('launcher-minimize-to-tray');
    return saved === 'true';
  });
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('launcher-theme');
    return (savedTheme as 'light' | 'dark') || 'dark';
  });
  const [startupWithWindows, setStartupWithWindows] = useState(() => {
    const saved = localStorage.getItem('launcher-startup-with-windows');
    return saved === 'true';
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await invoke<Category[]>('get_categories');
        if (result.length > 0) {
          setCategories(result);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Disable dev tools in production
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('launcher-theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('launcher-minimize-to-tray', minimizeToTray.toString());
  }, [minimizeToTray]);

  useEffect(() => {
    localStorage.setItem('launcher-startup-with-windows', startupWithWindows.toString());
  }, [startupWithWindows]);

  const handleDownloadGame = async (game: GameInfo) => {
    const success = await startDownload(game);
    if (success) {
      loadLauncher();
    }
  };

  const handleLaunchGame = async (game: GameInfo) => {
    if (!game.executable_path) return;
    try {
      await invoke('launch_game', { executablePath: game.executable_path });
    } catch (err) {
      console.error('Launch failed:', err);
    }
  };

  const handleSelectGame = (game: GameInfo) => {
    setSelectedGame(game);
    setCurrentView('game');
  };

  const handleNavigation = (view: ViewState) => {
    if (view !== 'game') {
      setSelectedGame(null);
    }
    setCurrentView(view);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className={`app ${currentTheme}`}>
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-logo">
              <img src="/logo.png" alt="AntChill" />
            </div>
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !isOfflineMode) {
    return (
      <div className={`app ${currentTheme}`}>
        <div className="error-screen">
          <div className="error-content glass-card">
            <span className="error-icon">⚠️</span>
            <h2>Lỗi kết nối</h2>
            <p>{error}</p>
            <button onClick={loadLauncher} className="btn-accent">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get current download progress for selected game
  const currentDownloadProgress = selectedGame ? getDownloadProgress(selectedGame.id) : null;
  const currentDownloadingId = selectedGame && isDownloading(selectedGame.id) ? selectedGame.id : null;

  return (
    <div className={`app ${currentTheme}`}>
      {/* Status Bar */}
      {isOfflineMode && (
        <div className="status-bar status-offline">
          <span>📡 Chế độ Offline</span>
        </div>
      )}

      {queue.length > 0 && (
        <div className="status-bar status-download">
          <span>⬇️ Đang tải: {queue.length} game</span>
        </div>
      )}

      {/* Header */}
      <Header
        minimizeToTray={minimizeToTray}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
        onLogoClick={() => handleNavigation('home')}
      />

      {/* Navigation */}
      <nav className="main-nav">
        <button
          className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigation('home')}
        >
          🏠 Trang chủ
        </button>
        <button
          className={`nav-btn ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => handleNavigation('library')}
        >
          📚 Thư viện
        </button>
        <button
          className={`nav-btn ${currentView === 'news' ? 'active' : ''}`}
          onClick={() => handleNavigation('news')}
        >
          📰 Tin tức
          {news.filter(n => !n.read).length > 0 && (
            <span className="nav-badge">{news.filter(n => !n.read).length}</span>
          )}
        </button>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
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
      )}

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'home' && (
          <div className="home-view">
            {/* Featured Carousel */}
            <FeaturedCarousel
              games={games}
              onSelectGame={handleSelectGame}
            />

            <div className="home-grid">
              {/* Quick Access */}
              <section className="home-section games-section">
                <div className="section-header">
                  <h2>🎮 Game của bạn</h2>
                  <button
                    className="btn-link"
                    onClick={() => handleNavigation('library')}
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="quick-games">
                  {games.slice(0, 4).map(game => (
                    <div
                      key={game.id}
                      className="quick-game-card glass-card"
                      onClick={() => handleSelectGame(game)}
                    >
                      <img src={game.image_url} alt={game.name} />
                      <div className="quick-game-info">
                        <h4>{game.name}</h4>
                        <span className="game-status">
                          {game.executable_path ? '✅ Đã cài' : '⬇️ Chưa cài'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent News */}
              <section className="home-section news-section">
                <div className="section-header">
                  <h2>📰 Tin mới nhất</h2>
                  <button
                    className="btn-link"
                    onClick={() => handleNavigation('news')}
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="recent-news">
                  {news.slice(0, 3).map(item => (
                    <div key={item.id} className="news-preview glass-card">
                      <span className="news-date">{item.date}</span>
                      <h4>{item.title}</h4>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {currentView === 'library' && (
          <GameLibrary
            games={games}
            categories={categories}
            selectedGame={selectedGame}
            onSelectGame={handleSelectGame}
          />
        )}

        {currentView === 'game' && selectedGame && (
          <GameDetails
            game={selectedGame}
            downloadingGameId={currentDownloadingId}
            downloadProgress={currentDownloadProgress || null}
            onDownload={handleDownloadGame}
            onLaunch={handleLaunchGame}
          />
        )}

        {currentView === 'news' && (
          <NewsPanel
            news={news}
            selectedGameId={selectedGame?.id}
          />
        )}
      </main>

      {/* Sidebar for installed games quick access */}
      <aside className="quick-sidebar">
        <div className="sidebar-section">
          <h4>Đã cài đặt</h4>
          {games.filter(g => g.executable_path).map(game => (
            <div
              key={game.id}
              className="sidebar-game"
              onClick={() => handleSelectGame(game)}
            >
              <img src={game.logo_url || game.image_url} alt={game.name} />
              <span>{game.name}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default App;