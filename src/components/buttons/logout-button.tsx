import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,
    });
  };

  return (
    <button
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      onClick={handleLogout}
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" />
      <span>Log Out</span>
    </button>
  );
};
