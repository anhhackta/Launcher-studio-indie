import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useLanguage } from '../hooks/useLanguage';

interface HeaderProps {
    minimizeToTray: boolean;
    setShowSettings: (show: boolean) => void;
    showSettings: boolean;
    onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    minimizeToTray,
    setShowSettings,
    showSettings,
    onLogoClick
}) => {
    const { t } = useLanguage();

    const handleMinimize = async () => {
        try {
            if (minimizeToTray) {
                await invoke('hide_window');
            } else {
                await invoke('minimize_window');
            }
        } catch (err) {
            console.error('Minimize failed:', err);
            await invoke('minimize_window').catch(console.error);
        }
    };

    const handleClose = async () => {
        try {
            if (minimizeToTray) {
                await invoke('hide_window');
            } else {
                await invoke('close_window');
            }
        } catch (err) {
            console.error('Close failed:', err);
            await invoke('close_window').catch(console.error);
        }
    };

    const handleStartDragging = async () => {
        try {
            await invoke('start_dragging');
        } catch (err) {
            console.error('Start dragging failed:', err);
        }
    };

    return (
        <header
            className="header"
            onMouseDown={(e) => {
                if (!(e.target as HTMLElement).closest('button') &&
                    !(e.target as HTMLElement).closest('.logo')) {
                    handleStartDragging();
                }
            }}
        >
            <div
                className="logo"
                onClick={onLogoClick}
            >
                <img
                    src="/logo.png"
                    alt="AntChill Logo"
                    className="logo-img"
                />
                <span>AntChill Launcher</span>
            </div>

            <div className="header-controls">
                <button
                    className="header-btn settings-btn"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Cài đặt"
                >
                    <img src="/social/settings.png" alt="Settings" />
                </button>
                <button
                    className={`header-btn minimize-btn ${minimizeToTray ? 'active' : ''}`}
                    onClick={handleMinimize}
                    title={minimizeToTray ? "Thu nhỏ xuống khay" : "Thu nhỏ"}
                >
                    <img src="/social/minimize.png" alt="Minimize" />
                </button>
                <button
                    className="header-btn close-btn"
                    onClick={handleClose}
                    title={minimizeToTray ? "Ẩn xuống khay" : "Đóng"}
                >
                    <img src="/social/close.png" alt="Close" />
                </button>
            </div>
        </header>
    );
};
