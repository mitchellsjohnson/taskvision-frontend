import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { NavBar } from './navigation/desktop/nav-bar';
import { MobileNavBar } from './navigation/mobile/mobile-nav-bar';
import { useResizeObserver } from '../utils/resize-observer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const location = useLocation();
  const contentRef = useRef<HTMLElement>(null);
  const isHomePage = location.pathname === '/';

  useResizeObserver(() => {
    // Handle resize if needed
  }, contentRef.current);

  return (
    <div className="page-layout">
      <NavBar />
      <MobileNavBar />
      {/* {!isHomePage && (
        <div className="page-layout__left-nav">
          <div className="page-layout__left-nav-content">
            <LeftNav />
          </div>
        </div>
      )} */}
      <div className={`page-layout__body ${isHomePage ? 'page-layout__body--home' : ''}`}>
        <main ref={contentRef} className="page-layout__main">
          {children}
        </main>
      </div>
    </div>
  );
};
