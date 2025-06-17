import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { NavBarBrand } from './nav-bar-brand';
import { NavBarButtons } from './nav-bar-buttons';
import { NavBarTabs } from './nav-bar-tabs';
import { LogoutButton } from '../../buttons/logout-button';
import { LoginButton } from '../../buttons/login-button';

export const NavBar: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="nav-bar__container" data-testid="nav-bar-container">
      <nav className="nav-bar" data-testid="nav-bar">
        <div className="flex items-center">
          <NavBarBrand />
          <NavBarTabs />
        </div>
        <div className="flex items-center gap-4">
          <NavBarButtons />
          {!isAuthenticated && <LoginButton />}
          {isAuthenticated && (
            <>
              <button
                onClick={handleSettingsClick}
                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white transition-colors"
                title="Settings"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <LogoutButton />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};
