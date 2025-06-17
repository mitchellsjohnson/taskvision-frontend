import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavBarBrand: React.FC = () => {
  return (
    <div className="nav-bar__brand">
      <NavLink to="/" className="flex items-center">
        <img
          className="nav-bar__logo"
          src="/eagle-mitty.svg"
          alt="Taskvision logo"
          width="36"
          height="36"
        />
        <span className="ml-4 text-xl font-bold">Taskvision</span>
      </NavLink>
    </div>
  );
};
