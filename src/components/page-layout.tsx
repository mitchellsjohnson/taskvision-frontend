import React from "react";
import { NavBar } from "./navigation/desktop/nav-bar";
import { MobileNavBar } from "./navigation/mobile/mobile-nav-bar";
import { LeftNav } from "./navigation/left/left-nav";

export const PageLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="page-layout">
      <NavBar />
      <MobileNavBar />
      <div className="page-layout__body">
        <LeftNav />
        <main className="page-layout__content-main">{children}</main>
      </div>
    </div>
  );
};
