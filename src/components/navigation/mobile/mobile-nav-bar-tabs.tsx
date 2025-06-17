import { useAuth0 } from '@auth0/auth0-react';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { MobileNavBarTab } from './mobile-nav-bar-tab';
import { AUTH0_NAMESPACE } from '../../../auth0-namespace';

interface MobileNavBarTabsProps {
  handleClick: () => void;
}

interface DecodedToken {
  [key: string]: any;
}

export const MobileNavBarTabs: React.FC<MobileNavBarTabsProps> = ({ handleClick }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          const decodedToken = jwtDecode<DecodedToken>(accessToken);
          const roles = decodedToken[`${AUTH0_NAMESPACE}/roles`] as string[] || [];
          setUserRoles(roles);
        } catch (error) {
          console.error("Error fetching or decoding access token:", error);
          setUserRoles([]);
        }
      }
    };

    fetchUserRoles();
  }, [isAuthenticated, getAccessTokenSilently]);

  const hasAdminAccess = userRoles.includes('admin') || userRoles.includes('ecosystem-admin');
  const hasEcosystemAdminRole = userRoles.includes('ecosystem-admin');

  return (
    <div className="mobile-nav-bar__tabs">
      <MobileNavBarTab path="/public" label="Public" handleClick={handleClick} />
      {isAuthenticated && (
        <>
          <MobileNavBarTab path="/tasks" label="Tasks" handleClick={handleClick} />
          <MobileNavBarTab path="/protected" label="Protected" handleClick={handleClick} />
          {hasAdminAccess && <MobileNavBarTab path="/admin" label="Admin" handleClick={handleClick} />}
          {hasEcosystemAdminRole && <MobileNavBarTab path="/ecosystem-admin" label="Ecosystem Admin" handleClick={handleClick} />}
        </>
      )}
    </div>
  );
};
