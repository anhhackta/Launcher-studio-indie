import React, { useState, useEffect, useCallback } from 'react';
import { GameInfo } from '../types';

interface FeaturedCarouselProps {
    games: GameInfo[];
    onSelectGame: (game: GameInfo) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ games, onSelectGame }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Filter featured games (first 5 available games)
    const featuredGames = games.filter(g => !g.is_coming_soon).slice(0, 5);

    const nextSlide = useCallback(() => {
        if (featuredGames.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
        }
    }, [featuredGames.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    useEffect(() => {
        if (!isAutoPlaying || featuredGames.length <= 1) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, featuredGames.length, nextSlide]);

    if (featuredGames.length === 0) {
        return null;
    }

    const currentGame = featuredGames[currentIndex];

    return (
        <div className="featured-carousel">
            <div
                className="carousel-slide"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(${currentGame.banner_url || currentGame.image_url})`
                }}
            >
                <div className="carousel-content">
                    <div className="carousel-info">
                        {currentGame.logo_url && (
                            <img
                                src={currentGame.logo_url}
                                alt={currentGame.name}
                                className="carousel-logo"
                            />
                        )}
                        <h2 className="carousel-title">{currentGame.name}</h2>
                        <p className="carousel-description">
                            {currentGame.description_long || currentGame.description}
                        </p>

                        <div className="carousel-meta">
                            {currentGame.developer && (
                                <span className="meta-item">
                                    <span className="meta-icon">👨‍💻</span>
                                    {currentGame.developer}
                                </span>
                            )}
                            {currentGame.file_size && (
                                <span className="meta-item">
                                    <span className="meta-icon">💾</span>
                                    {currentGame.file_size}
                                </span>
                            )}
                            {currentGame.tags && currentGame.tags.length > 0 && (
                                <span className="meta-item">
                                    <span className="meta-icon">🏷️</span>
                                    {currentGame.tags.slice(0, 2).join(', ')}
                                </span>
                            )}
                        </div>

                        <div className="carousel-actions">
                            <button
                                className="btn-accent btn-play-featured"
                                onClick={() => onSelectGame(currentGame)}
                            >
                                {currentGame.executable_path ? '▶ CHƠI NGAY' : '⬇ CÀI ĐẶT'}
                            </button>
                            <button
                                className="btn-secondary btn-details"
                                onClick={() => onSelectGame(currentGame)}
                            >
                                Chi tiết
                            </button>
                        </div>
                    </div>

                    {currentGame.screenshots && currentGame.screenshots.length > 0 && (
                        <div className="carousel-screenshots">
                            {currentGame.screenshots.slice(0, 3).map((ss, idx) => (
                                <img
                                    key={idx}
                                    src={ss}
                                    alt={`Screenshot ${idx + 1}`}
                                    className="carousel-screenshot"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Arrows */}
            {featuredGames.length > 1 && (
                <>
                    <button className="carousel-nav carousel-prev" onClick={prevSlide}>
                        ‹
                    </button>
                    <button className="carousel-nav carousel-next" onClick={nextSlide}>
                        ›
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {featuredGames.length > 1 && (
                <div className="carousel-dots">
                    {featuredGames.map((_, idx) => (
                        <button
                            key={idx}
                            className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
