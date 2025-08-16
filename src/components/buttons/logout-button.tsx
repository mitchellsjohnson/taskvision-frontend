import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../icon';

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
    >
      <Icon name="LogOut" className="mr-2 h-4 w-4" />
      <span>Log Out</span>
    </Button>
  );
};
