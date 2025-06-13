import { useAuth0, withAuthenticationRequired, WithAuthenticationRequiredOptions, User } from '@auth0/auth0-react';
import React, { ComponentType } from 'react';
import { PageLoader } from './page-loader';
import { AUTH0_NAMESPACE } from '../auth0-namespace';
import { PageLayout } from './page-layout';

interface RoleProtectedRouteProps {
  component: ComponentType;
  requiredRoles?: string[];
  [key: string]: unknown;
}

// Helper function to check for roles
const userHasRequiredRole = (user: User | undefined, requiredRoles?: string[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  if (!user) {
    return false;
  }
  const userRoles = user[`${AUTH0_NAMESPACE}roles`] as string[];
  if (!userRoles || !Array.isArray(userRoles)) {
    return false;
  }
  return requiredRoles.some(role => userRoles.includes(role));
};

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ component, requiredRoles, ...args }) => {
  const { user, isLoading, isAuthenticated } = useAuth0();

  const withAuthOptions: WithAuthenticationRequiredOptions = {
    onRedirecting: () => (
      <div className="page-layout">
        <PageLoader />
      </div>
    ),
    ...args
  };

  const AuthenticatedComponent = withAuthenticationRequired(component, withAuthOptions);

  if (isLoading) {
    return (
      <div className="page-layout">
        <PageLoader />
      </div>
    );
  }

  if (isAuthenticated && requiredRoles && requiredRoles.length > 0 && !userHasRequiredRole(user, requiredRoles)) {
    return (
      <div className="page-layout">
        <div className="content-layout">
          <h1 id="page-title" className="content__title">
            Access Denied
          </h1>
          <p>You do not have the required roles for this page.</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <AuthenticatedComponent />
    </PageLayout>
  );
};
