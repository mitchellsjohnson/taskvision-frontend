import React from 'react';
import { MobileMenuToggleButton } from './mobile-menu-toggle-button';
import { MobileNavBarBrand } from './mobile-nav-bar-brand';
import { MobileNavBarButtons } from './mobile-nav-bar-buttons';
import { MobileNavBarTabs } from './mobile-nav-bar-tabs';

enum MobileMenuState {
  CLOSED = 'closed',
  OPEN = 'open'
}

enum MobileMenuIcon {
  CLOSE = 'close',
  MENU = 'menu'
}

export const MobileNavBar: React.FC = () => {
  const [mobileMenuState, setMobileMenuState] = React.useState<MobileMenuState>(MobileMenuState.CLOSED);
  const [mobileMenuIcon, setMobileMenuIcon] = React.useState<MobileMenuIcon>(MobileMenuIcon.MENU);

  const isMobileMenuOpen = () => {
    return mobileMenuState === MobileMenuState.OPEN;
  };

  const closeMobileMenu = () => {
    document.body.classList.remove('mobile-scroll-lock');
    setMobileMenuState(MobileMenuState.CLOSED);
    setMobileMenuIcon(MobileMenuIcon.MENU);
  };

  const openMobileMenu = () => {
    document.body.classList.add('mobile-scroll-lock');
    setMobileMenuState(MobileMenuState.OPEN);
    setMobileMenuIcon(MobileMenuIcon.CLOSE);
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen()) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  return (
    <div className="mobile-nav-bar__container" data-testid="mobile-nav-bar-container">
      <nav className="mobile-nav-bar" data-testid="mobile-nav-bar">
        <MobileNavBarBrand handleClick={closeMobileMenu} />
        <MobileMenuToggleButton icon={mobileMenuIcon} handleClick={toggleMobileMenu} />

        {isMobileMenuOpen() && (
          <div className="mobile-nav-bar__menu" data-testid="mobile-nav-bar-menu">
            <MobileNavBarTabs handleClick={closeMobileMenu} />
            <MobileNavBarButtons />
          </div>
        )}
      </nav>
    </div>
  );
};
