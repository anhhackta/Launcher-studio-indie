import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsPanelProps {
    onClose: () => void;
    currentLanguage: string;
    changeLanguage: (lang: 'en' | 'vi') => void;
    minimizeToTray: boolean;
    setMinimizeToTray: (val: boolean) => void;
    startupWithWindows: boolean;
    setStartupWithWindows: (val: boolean) => void;
    currentTheme: 'light' | 'dark';
    setCurrentTheme: (theme: 'light' | 'dark') => void;
    onReload: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    onClose,
    currentLanguage,
    changeLanguage,
    minimizeToTray,
    setMinimizeToTray,
    startupWithWindows,
    setStartupWithWindows,
    currentTheme,
    setCurrentTheme,
    onReload
}) => {
    const { t } = useLanguage();
    const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'game'>('general');

    const toggleStartupWithWindows = async (enable: boolean) => {
        try {
            await invoke('toggle_startup_with_windows', { enable });
            setStartupWithWindows(enable);
        } catch (err) {
            console.error('Failed to toggle startup:', err);
        }
    };

    const handleOpenGameDirectory = async () => {
        try {
            await invoke('open_directory', { path: 'AntChillGame' });
        } catch (err) {
            console.error('Failed to open game directory:', err);
        }
    };

    return (
        <>
            <div className="settings-overlay" onClick={onClose} />
            <div className="settings-panel">
                <div className="settings-header">
                    <h3>{t('launcher.settings.title')}</h3>
                    <button
                        className="close-settings-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="settings-content">
                    <div className="settings-sidebar">
                        <div
                            className={`settings-tab ${activeSettingsTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('general')}
                        >
                            {t('launcher.settings.general')}
                        </div>
                        <div
                            className={`settings-tab ${activeSettingsTab === 'game' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('game')}
                        >
                            {t('launcher.settings.game')}
                        </div>
                        <div className="settings-version">
                            {t('launcher.settings.version')}
                        </div>
                    </div>

                    <div className="settings-main">
                        {activeSettingsTab === 'general' && (
                            <>
                                <div className="settings-section">
                                    <h4>{t('launcher.settings.language')}</h4>
                                    <div className="radio-group horizontal">
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="language"
                                                value="vi"
                                                checked={currentLanguage === 'vi'}
                                                onChange={(e) => changeLanguage(e.target.value as 'en' | 'vi')}
                                            />
                                            <span className="radio-custom"></span>
                                            <span className="radio-label">Tiếng Việt</span>
                                        </label>
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="language"
                                                value="en"
                                                checked={currentLanguage === 'en'}
                                                onChange={(e) => changeLanguage(e.target.value as 'en' | 'vi')}
                                            />
                                            <span className="radio-custom"></span>
                                            <span className="radio-label">English</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h4>{t('launcher.settings.close_window')}</h4>
                                    <div className="radio-group vertical">
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="closeBehavior"
                                                value="minimize"
                                                checked={minimizeToTray}
                                                onChange={(e) => setMinimizeToTray(e.target.checked)}
                                            />
                                            <span className="radio-custom"></span>
                                            <span className="radio-label">{t('launcher.settings.minimize_to_tray')}</span>
                                        </label>
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="closeBehavior"
                                                value="exit"
                                                checked={!minimizeToTray}
                                                onChange={(e) => setMinimizeToTray(!e.target.checked)}
                                            />
                                            <span className="radio-custom"></span>
                                            <span className="radio-label">{t('launcher.settings.exit_launcher')}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h4>{t('launcher.settings.startup_behavior')}</h4>
                                    <div className="toggle-option">
                                        <span>{t('launcher.settings.run_on_startup')}</span>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={startupWithWindows}
                                                onChange={(e) => toggleStartupWithWindows(e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h4>{t('launcher.settings.theme')}</h4>
                                    <div className="radio-group horizontal">
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="light"
                                                checked={currentTheme === 'light'}
                                                onChange={(e) => setCurrentTheme(e.target.value as 'light' | 'dark')}
                                            />
                                            <span className="radio-custom"></span>
                                            <span className="radio-label">{t('launcher.settings.theme_light')}</span>
                                        </label>
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="dark"
                                                checked={currentTheme === 'dark'}
                                                onChange={(e) => setCurrentTheme(e.target.value as 'light' | 'dark')}
                                            />
                                            <span className="radio-custom"></span>
                                            <span className="radio-label">{t('launcher.settings.theme_dark')}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button
                                        className="reload-launcher-btn"
                                        onClick={onReload}
                                        title="Reload launcher and refresh all data"
                                    >
                                        {t('launcher.settings.reload_launcher')}
                                    </button>
                                </div>
                            </>
                        )}

                        {activeSettingsTab === 'game' && (
                            <>
                                <div className="settings-section">
                                    <h4>{t('launcher.settings.game_installation_directory')}</h4>
                                    <div className="game-directory-info">
                                        <p>{t('launcher.settings.auto_search_info')} <code>AntChillGame/</code></p>
                                        <p>{t('launcher.settings.full_path')} <code>Ổ đĩa/Folder Launcher/AntChillGame/</code></p>
                                        <p>{t('launcher.settings.example')} <code>AntChillGame/Brato.io.v0.01/</code></p>
                                    </div>

                                    <div className="game-directory-action">
                                        <div className="directory-info">
                                            <span className="directory-path">AntChillGame</span>
                                            <button
                                                className="open-directory-btn"
                                                onClick={handleOpenGameDirectory}
                                            >
                                                {t('launcher.settings.open_folder')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <div className="settings-spacer"></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
