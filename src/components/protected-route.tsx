import { withAuthenticationRequired } from '@auth0/auth0-react';
import React, { ComponentType } from 'react';
import { PageLoader } from './page-loader';
import { PageLayout } from './page-layout';

interface ProtectedRouteProps {
  component: ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="page-layout">
        <PageLoader />
      </div>
    ),
  });

  return (
    <PageLayout>
      <Component />
    </PageLayout>
  );
};
