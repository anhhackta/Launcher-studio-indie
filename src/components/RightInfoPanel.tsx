import React from 'react';
import { GameInfo, NewsItem } from '../types';

interface RightInfoPanelProps {
  upcomingGame: NewsItem | undefined;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({ upcomingGame }) => {
  return (
    <div className="right-panel">
      
      {/* Top White Card layout */}
      <div className="info-card">
        
        <div className="profile-row">
          <span>Hi, Gamer</span>
          <img className="profile-avatar" src="https://ui-avatars.com/api/?name=Gamer&background=random" alt="Avatar" />
        </div>

        <div className="coupon-row">
          <div className="coupon-tag">30% Off</div>
          <button className="coupon-btn">
            Get Coupon 
            <div className="coupon-icon">%</div>
          </button>
        </div>

        {/* Instead of generic swords, maybe a game logo or placeholder art */}
        <div className="upcoming-art">
          {/* Default swords icon representation */}
          <svg className="swords-icon" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.5">
            <line x1="8" y1="21" x2="21" y2="8"/><line x1="3" y1="16" x2="8" y2="21"/><line x1="16" y1="3" x2="21" y2="8"/><line x1="3" y1="8" x2="16" y2="21"/><line x1="8" y1="3" x2="16" y2="11"/><line x1="3" y1="3" x2="21" y2="21"/>
          </svg>
        </div>

        <div className="upcoming-info">
          <h4>Upcoming Game</h4>
          <h2>{upcomingGame ? upcomingGame.title : 'Shadows Unleashed'}</h2>
          <p>{upcomingGame ? upcomingGame.date : 'September 10, 2024'}</p>
        </div>

        <div className="social-icons">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.3z" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"/>
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.58 5.75L18.42 21h-3.41l-1.92-5.49v-.01H9.92H9V21H5.5L7.92 5.75H21.58zM14.66 12L16.2 6.57H10.57L9.04 12h5.62z"/>
          </svg>
        </div>
        
      </div>

    </div>
  );
};
