import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { NavBarTab } from './nav-bar-tab';

export const NavBarTabs: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="nav-bar__tabs">
      {isAuthenticated && (
        <>
          <NavBarTab path="/dashboard" label="Dashboard" />
          <NavBarTab path="/tvagent" label="TVAgent" />
          <NavBarTab path="/tasks" label="Tasks" />
          <NavBarTab path="/wellness" label="Wellness" />
        </>
      )}
    </div>
  );
};
