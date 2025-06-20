import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { LoginButton } from '../../buttons/login-button';


export const NavBarButtons: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="nav-bar__buttons">
      {!isAuthenticated && (
        <LoginButton />
      )}
    </div>
  );
};
