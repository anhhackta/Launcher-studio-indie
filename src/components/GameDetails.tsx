import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { GameInfo, DownloadProgress, IntegrityResult } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface GameDetailsProps {
    game: GameInfo;
    downloadingGameId: string | null;
    downloadProgress: DownloadProgress | null;
    onDownload: (game: GameInfo) => void;
    onLaunch: (game: GameInfo) => void;
}

export const GameDetails: React.FC<GameDetailsProps> = ({
    game,
    downloadingGameId,
    downloadProgress,
    onDownload,
    onLaunch
}) => {
    const { t } = useLanguage();
    const [showScreenshots, setShowScreenshots] = useState(false);
    const [selectedScreenshot, setSelectedScreenshot] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<IntegrityResult | null>(null);

    const isDownloading = downloadingGameId === game.id;

    const progressText = isDownloading
        ? (downloadProgress?.status === 'extracting' ? 'Giải nén...' :
            downloadProgress?.status === 'verifying' ? 'Xác minh...' :
                `${Math.floor(downloadProgress?.progress || 0)}%`)
        : '';

    const handleVerifyIntegrity = async () => {
        setIsVerifying(true);
        setVerifyResult(null);
        try {
            const result = await invoke<IntegrityResult>('verify_game_integrity', { gameId: game.id });
            setVerifyResult(result);
        } catch (err) {
            console.error('Verification failed:', err);
            setVerifyResult({
                valid: false,
                checked_files: 0,
                corrupted_files: [],
                missing_files: [],
                message: `Lỗi: ${err}`
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCheckUpdate = async () => {
        try {
            const result = await invoke('check_game_updates', {
                gameId: game.id,
                currentVersion: game.version
            });
            console.log('Update check result:', result);
        } catch (err) {
            console.error('Update check failed:', err);
        }
    };

    return (
        <div className="game-panel glass-panel">
            {/* Hero Section */}
            <div
                className="game-hero"
                style={{
                    backgroundImage: `linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%), url(${game.banner_url || game.image_url})`
                }}
            >
                <div className="game-hero-content">
                    {game.logo_url && (
                        <img src={game.logo_url} alt={game.name} className="game-hero-logo" />
                    )}
                    <h1 className="game-hero-title">{game.name}</h1>
                    <div className="game-hero-meta">
                        <span className="meta-badge">v{game.version}</span>
                        {game.developer && <span className="meta-text">by {game.developer}</span>}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="game-action-bar">
                <div className="action-main">
                    {game.status === 'coming_soon' || game.is_coming_soon ? (
                        <button className="btn-coming-soon" disabled>
                            🚀 Sắp ra mắt
                        </button>
                    ) : game.executable_path ? (
                        <button
                            className="btn-accent btn-play"
                            onClick={() => onLaunch(game)}
                        >
                            ▶ CHƠI
                        </button>
                    ) : (
                        <button
                            className="btn-accent btn-install"
                            onClick={() => onDownload(game)}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <div className="btn-progress">
                                    <span>{progressText}</span>
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${downloadProgress?.progress || 0}%` }}
                                    />
                                </div>
                            ) : (
                                <>⬇ CÀI ĐẶT {game.file_size && `(${game.file_size})`}</>
                            )}
                        </button>
                    )}
                </div>

                <div className="action-secondary">
                    {isDownloading && downloadProgress && (
                        <div className="download-info">
                            <span className="download-speed">{downloadProgress.speed}</span>
                            {downloadProgress.eta && (
                                <span className="download-eta">ETA: {downloadProgress.eta}</span>
                            )}
                        </div>
                    )}

                    {game.executable_path && (
                        <>
                            <button
                                className="btn-icon"
                                onClick={handleVerifyIntegrity}
                                disabled={isVerifying}
                                title="Kiểm tra tính toàn vẹn"
                            >
                                {isVerifying ? '⏳' : '🔍'}
                            </button>
                            <button
                                className="btn-icon"
                                onClick={handleCheckUpdate}
                                title="Kiểm tra cập nhật"
                            >
                                🔄
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Verification Result */}
            {verifyResult && (
                <div className={`verify-result ${verifyResult.valid ? 'valid' : 'invalid'}`}>
                    <span className="verify-icon">{verifyResult.valid ? '✅' : '❌'}</span>
                    <span className="verify-message">{verifyResult.message}</span>
                    <button
                        className="verify-close"
                        onClick={() => setVerifyResult(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Game Info Grid */}
            <div className="game-info-grid">
                {/* Description */}
                <div className="info-section description-section">
                    <h3>📖 Giới thiệu</h3>
                    <p>{game.description_long || game.description}</p>
                </div>

                {/* Screenshots */}
                {game.screenshots && game.screenshots.length > 0 && (
                    <div className="info-section screenshots-section">
                        <h3>🖼️ Hình ảnh</h3>
                        <div className="screenshots-grid">
                            {game.screenshots.map((ss, idx) => (
                                <img
                                    key={idx}
                                    src={ss}
                                    alt={`Screenshot ${idx + 1}`}
                                    className="screenshot-thumb"
                                    onClick={() => {
                                        setSelectedScreenshot(idx);
                                        setShowScreenshots(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Details */}
                <div className="info-section details-section">
                    <h3>ℹ️ Thông tin</h3>
                    <div className="details-grid">
                        {game.developer && (
                            <div className="detail-item">
                                <span className="detail-label">Nhà phát triển</span>
                                <span className="detail-value">{game.developer}</span>
                            </div>
                        )}
                        {game.publisher && (
                            <div className="detail-item">
                                <span className="detail-label">Nhà phát hành</span>
                                <span className="detail-value">{game.publisher}</span>
                            </div>
                        )}
                        {game.release_date && (
                            <div className="detail-item">
                                <span className="detail-label">Ngày phát hành</span>
                                <span className="detail-value">{game.release_date}</span>
                            </div>
                        )}
                        {game.file_size && (
                            <div className="detail-item">
                                <span className="detail-label">Dung lượng</span>
                                <span className="detail-value">{game.file_size}</span>
                            </div>
                        )}
                        {game.last_updated && (
                            <div className="detail-item">
                                <span className="detail-label">Cập nhật</span>
                                <span className="detail-value">{game.last_updated}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Requirements */}
                {game.system_requirements && (
                    <div className="info-section requirements-section">
                        <h3>💻 Yêu cầu hệ thống</h3>
                        <div className="requirements-grid">
                            {game.system_requirements.os && (
                                <div className="req-item">
                                    <span className="req-label">Hệ điều hành</span>
                                    <span className="req-value">{game.system_requirements.os}</span>
                                </div>
                            )}
                            {game.system_requirements.ram && (
                                <div className="req-item">
                                    <span className="req-label">RAM</span>
                                    <span className="req-value">{game.system_requirements.ram}</span>
                                </div>
                            )}
                            {game.system_requirements.storage && (
                                <div className="req-item">
                                    <span className="req-label">Bộ nhớ</span>
                                    <span className="req-value">{game.system_requirements.storage}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {game.tags && game.tags.length > 0 && (
                    <div className="info-section tags-section">
                        <h3>🏷️ Tags</h3>
                        <div className="tags-list">
                            {game.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Changelog */}
                {game.changelog && (
                    <div className="info-section changelog-section">
                        <h3>📝 Lịch sử cập nhật</h3>
                        <div className="changelog-content">
                            <div className="changelog-version">v{game.version}</div>
                            <p>{game.changelog}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Screenshot Modal */}
            {showScreenshots && game.screenshots && (
                <div className="screenshot-modal" onClick={() => setShowScreenshots(false)}>
                    <div className="screenshot-modal-content" onClick={e => e.stopPropagation()}>
                        <img
                            src={game.screenshots[selectedScreenshot]}
                            alt={`Screenshot ${selectedScreenshot + 1}`}
                        />
                        <div className="screenshot-nav">
                            <button
                                onClick={() => setSelectedScreenshot(
                                    (selectedScreenshot - 1 + game.screenshots!.length) % game.screenshots!.length
                                )}
                            >
                                ‹
                            </button>
                            <span>{selectedScreenshot + 1} / {game.screenshots.length}</span>
                            <button
                                onClick={() => setSelectedScreenshot(
                                    (selectedScreenshot + 1) % game.screenshots!.length
                                )}
                            >
                                ›
                            </button>
                        </div>
                        <button className="screenshot-close" onClick={() => setShowScreenshots(false)}>
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
