import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { NavBarTab } from './nav-bar-tab';

export const NavBarTabs: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="nav-bar__tabs">
      <NavBarTab path="/profile" label="Profile" />
      <NavBarTab path="/public" label="Public" />
      {isAuthenticated && (
        <>
          <NavBarTab path="/tasks" label="Tasks" />
          <NavBarTab path="/protected" label="Protected" />
          <NavBarTab path="/admin" label="Admin" />
          <NavBarTab path="/admin-features" label="Admin-features" />
        </>
      )}
    </div>
  );
};
