import React from "react";
import { useLocation } from "react-router-dom";
import { NavBar } from "./navigation/desktop/nav-bar";
import { MobileNavBar } from "./navigation/mobile/mobile-nav-bar";
import { LeftNav } from "./navigation/left/left-nav";

export const PageLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="page-layout">
      <NavBar />
      <MobileNavBar />
      <div
        className={`page-layout__body ${
          isHomePage ? "page-layout__body--homepage" : ""
        }`}
      >
        {!isHomePage && <LeftNav />}
        <main
          className={`page-layout__content-main ${
            isHomePage ? "page-layout__content-main--homepage" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
