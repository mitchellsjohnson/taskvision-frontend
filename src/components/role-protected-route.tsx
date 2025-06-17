import { useAuth0 } from '@auth0/auth0-react';
import React, { ComponentType, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { PageLoader } from './page-loader';
import { AUTH0_NAMESPACE } from '../auth0-namespace';

interface RoleProtectedRouteProps {
  component: ComponentType;
  requiredRoles?: string[];
  [key: string]: unknown;
}

interface DecodedToken {
  [key: string]: any;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ component, requiredRoles, ...args }) => {
  const Component = component;
  const { getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isRolesLoading, setIsRolesLoading] = useState(true);

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
        } finally {
          setIsRolesLoading(false);
        }
      } else {
        setIsRolesLoading(false);
      }
    };

    fetchUserRoles();
  }, [getAccessTokenSilently, isAuthenticated]);

  if (isLoading || isRolesLoading) {
    return (
      <div className="page-layout">
        <PageLoader />
      </div>
    );
  }

  const userHasRequiredRole = () => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    return requiredRoles.some(role => userRoles.includes(role));
  };

  if (isAuthenticated && userHasRequiredRole()) {
    return <Component {...args} />;
  }

  // Option 1: Render an Access Denied message if authenticated but roles don't match
  if (isAuthenticated && !userHasRequiredRole()) {
    return (
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Access Denied
        </h1>
        <p>You do not have the required roles to view this page.</p>
      </div>
    );
  }

  // Option 2: Show a loader and let Auth0 handle the redirect for unauthenticated users
  return (
    <div className="page-layout">
      <PageLoader />
    </div>
  );
};
