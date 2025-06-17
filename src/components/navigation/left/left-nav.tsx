import React from 'react';
import { NavLink } from 'react-router-dom';
import "./left-nav.css";

export const LeftNav: React.FC = () => {
  return (
    <div className="left-nav">
      <nav>
        <ul>
          <li>
            <span className="nav-text">Section X (TODO)</span>
          </li>
          <li>
            <span className="nav-text">Section Y (TODO)</span>
          </li>
          <li>
            <span className="nav-text">Section Z (TODO)</span>
          </li>
          <li>
            <NavLink to="/settings/auth0-views" className={({ isActive }) => (isActive ? "active" : "")}>
              Auth0 Views (Legacy)
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};